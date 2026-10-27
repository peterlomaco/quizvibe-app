// Spotify/Name-alternativ (Peter 2026-10-15):
//   1. Prefixet är de N första bokstäverna, även över ordgränser (2026-10-27:
//      "DJ Snake" → "DJ S" på Full=3; kortare bara om namnet har färre).
//   2. Alltid 5 synliga alternativ, rätt svar alltid med.
//   3. Alternativen kommer från artistens paket när det finns ett.
//
// Testar klient-modulerna under src/utils (enda vitest-harnessen i repot).

import { describe, it, expect } from 'vitest';
import {
  SPOTIFY_ARTIST_CANDIDATES,
  getArtistPackages,
  pickSpotifyNamePool,
  type SpotifyNameCandidate,
} from '../../../src/utils/spotifyNameDistractors';
import { buildImageVariant, getPrefixForItem, visibleLetterGrid } from '../../../src/utils/imageQuestionBuilder';
import { getSpotifyArtistMeta } from '../../../src/utils/spotifyArtistMeta';
import { createSeededRng } from '../../../src/utils/seededRandom';
import type { ImageQuizQuestion } from '../../../src/utils/quizImageQuestions';

function toCandidates(): SpotifyNameCandidate[] {
  return SPOTIFY_ARTIST_CANDIDATES.map((c) => ({
    item: {
      id: `cand-${c.name}`,
      displayName: c.name,
      category: 'artists',
      contentSubject: c.meta?.type ?? 'artist',
      audiences: ['all'],
      region: ['global'],
      questionText: '',
      itemHcp: 100,
    } as ImageQuizQuestion,
    type: c.meta?.type ?? null,
    country: c.meta?.country ?? null,
    gender: c.meta?.gender ?? null,
    packages: getArtistPackages(c.name),
  }));
}

function buildOptions(correctName: string, prefixLength: number, seed: string) {
  const candidates = toCandidates().filter(
    (c) => c.item.displayName.toLowerCase() !== correctName.toLowerCase(),
  );
  const pool = pickSpotifyNamePool({
    correctName,
    correctMeta: getSpotifyArtistMeta(correctName),
    candidates,
    prefixLength,
  });
  const correct = {
    id: 'correct',
    displayName: correctName,
    category: 'artists',
    contentSubject: 'artist',
    audiences: ['all'],
    region: ['global'],
    questionText: '',
    itemHcp: 100,
  } as ImageQuizQuestion;
  const variant = buildImageVariant(
    correct,
    'full',
    new Set(['all']) as never,
    pool.map((c) => c.item),
    [],
    5,
    createSeededRng(seed),
    prefixLength,
  );
  if (variant.mode !== 'prefix') throw new Error('expected prefix mode');
  return { pool, variant };
}

describe('prefix — lägen', () => {
  it('per-word (Hints): max två ord, length tecken per ord', () => {
    expect(getPrefixForItem('Swedish House Mafia', 3)).toBe('SWE HOU');
    expect(getPrefixForItem('Lana Del Rey', 3)).toBe('LAN DEL');
  });

  // Spotify/Name (Peter 2026-10-27): de första N bokstäverna över ordgränser.
  it('leading-letters (Spotify/Name): N bokstäver även över ordgränser', () => {
    expect(getPrefixForItem('Maroon 5 feat. Christina Aguilera', 3, 'leading-letters')).toBe('MAR');
    expect(getPrefixForItem('DJ Snake feat. Justin Bieber', 3, 'leading-letters')).toBe('DJ S');
    expect(getPrefixForItem('DJ Snake feat. Justin Bieber', 2, 'leading-letters')).toBe('DJ');
    expect(getPrefixForItem('DJ Snake feat. Justin Bieber', 1, 'leading-letters')).toBe('D');
    expect(getPrefixForItem('Ed Sheeran', 3, 'leading-letters')).toBe('ED S');
    expect(getPrefixForItem('50 Cent', 3, 'leading-letters')).toBe('CEN');
    // Kortare bara när hela namnet har färre bokstäver.
    expect(getPrefixForItem('U2', 3, 'leading-letters')).toBe('U');
  });
});

describe('Spotify/Name-alternativ', () => {
  it('Swedish House Mafia får 4 alternativ från samma paket, alla med 3 bokstäver', () => {
    const tags = getArtistPackages('Swedish House Mafia');
    expect(tags.size).toBeGreaterThan(0);
    const { pool, variant } = buildOptions('Swedish House Mafia', 3, 'shm');
    expect(variant.letterGrid).toHaveLength(5);
    const inPackage = (name: string) =>
      [...getArtistPackages(name)].some((t) => tags.has(t));
    for (const c of pool) expect([...c.packages].some((t) => tags.has(t))).toBe(true);
    const poolByPrefix = new Map(
      pool.map((c) => [getPrefixForItem(c.item.displayName, 3, 'leading-letters'), c]),
    );
    for (const opt of variant.letterGrid) {
      expect(opt.prefix.replace(/ /g, '')).toHaveLength(3);
      if (!opt.isCorrect) {
        const cand = poolByPrefix.get(opt.prefix);
        expect(cand && inPackage(cand.item.displayName)).toBe(true);
      }
    }
  });

  it('alla alternativ har exakt prefixlängden bokstäver', () => {
    const { variant } = buildOptions('Avicii', 3, 'avicii');
    expect(variant.letterGrid).toHaveLength(5);
    for (const opt of variant.letterGrid) expect(opt.prefix.replace(/ /g, '')).toHaveLength(3);
  });

  it('artist utan paket faller tillbaka och ger ändå 5 alternativ', () => {
    const noPkg = SPOTIFY_ARTIST_CANDIDATES.find(
      (c) => getArtistPackages(c.name).size === 0 && c.name.split(/\s+/).length >= 2,
    );
    expect(noPkg).toBeDefined();
    const { variant } = buildOptions(noPkg!.name, 3, 'nopkg');
    expect(variant.letterGrid).toHaveLength(5);
  });
});

// Peter 2026-10-27: "DJ Snake feat. Justin Bieber" gav 4 alternativ utan rätt
// svar på Full assist. Nu: alltid 5 synliga, rätt svar med, och prefixet är
// "DJ S" (3 bokstäver över ordgränsen) i stället för "DJ".
describe('Spotify/Name — alltid 5 alternativ inkl. rätt svar', () => {
  const expected: Record<number, string> = { 3: 'DJ S', 2: 'DJ', 1: 'D' };
  for (const len of [3, 2, 1]) {
    it(`DJ Snake feat. Justin Bieber, prefix ${len}`, () => {
      for (const seed of ['a', 'b', 'c', 'd', 'e']) {
        const { variant } = buildOptions('DJ Snake feat. Justin Bieber', len, `djsnake-${len}-${seed}`);
        const visible = visibleLetterGrid(variant.letterGrid, len);
        expect(visible).toHaveLength(5);
        expect(visible.find((o) => o.isCorrect)?.prefix).toBe(expected[len]);
      }
    });
  }
});

describe('visibleLetterGrid', () => {
  it('behåller rätt svar även när hela namnet har färre bokstäver än prefixet', () => {
    const grid = [
      { prefix: 'U', isCorrect: true },
      { prefix: 'AVI', isCorrect: false },
      { prefix: 'ROB', isCorrect: false },
      { prefix: 'MAR', isCorrect: false },
      { prefix: 'LOR', isCorrect: false },
    ];
    const visible = visibleLetterGrid(grid, 3);
    expect(visible).toHaveLength(5);
    expect(visible.find((o) => o.isCorrect)?.prefix).toBe('U');
  });
});

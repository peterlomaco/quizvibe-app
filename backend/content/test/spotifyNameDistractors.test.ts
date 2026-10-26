// Spotify/Name-alternativ (Peter 2026-10-15):
//   1. Prefixet är max två ord ("Swedish House Mafia" → "SWE HOU").
//   2. 1-ordssvar → 1-ordsalternativ, 2+-ordssvar → 2+-ordsalternativ.
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
import { buildImageVariant, getPrefixForItem } from '../../../src/utils/imageQuestionBuilder';
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

describe('prefix — max två ord', () => {
  it('kapar tre ord till två', () => {
    expect(getPrefixForItem('Swedish House Mafia', 3)).toBe('SWE HOU');
    expect(getPrefixForItem('Lana Del Rey', 3)).toBe('LAN DEL');
  });
});

describe('Spotify/Name-alternativ', () => {
  it('Swedish House Mafia får 4 alternativ från samma paket, alla 2-ords', () => {
    const tags = getArtistPackages('Swedish House Mafia');
    expect(tags.size).toBeGreaterThan(0);
    const { pool, variant } = buildOptions('Swedish House Mafia', 3, 'shm');
    expect(variant.letterGrid).toHaveLength(5);
    const inPackage = (name: string) =>
      [...getArtistPackages(name)].some((t) => tags.has(t));
    for (const c of pool) expect([...c.packages].some((t) => tags.has(t))).toBe(true);
    const poolByPrefix = new Map(pool.map((c) => [getPrefixForItem(c.item.displayName, 3), c]));
    for (const opt of variant.letterGrid) {
      expect(opt.prefix.split(' ')).toHaveLength(2);
      if (!opt.isCorrect) {
        const cand = poolByPrefix.get(opt.prefix);
        expect(cand && inPackage(cand.item.displayName)).toBe(true);
      }
    }
  });

  it('1-ordssvar får bara 1-ordsalternativ', () => {
    const { variant } = buildOptions('Avicii', 3, 'avicii');
    expect(variant.letterGrid).toHaveLength(5);
    for (const opt of variant.letterGrid) expect(opt.prefix.split(' ')).toHaveLength(1);
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

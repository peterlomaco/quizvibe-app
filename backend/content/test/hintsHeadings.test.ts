// Fast rubrikmodell för Artister/Band + Skådespelare (Peter 2026-11-02):
// varje ledtråd hamnar under en rubrik, inget tas bort, resten under "Other".
// Idrottare behåller den äldre grupperingen.

import { describe, it, expect } from 'vitest';
import type { HintItem } from '../../../src/utils/hintsData';
import { buildRenderEntries, headingModelFor, selectHints } from '../../../src/utils/hintsGenerator';
import { HINTS_LIBRARY, type HintCategoryLabel } from '../../../src/utils/hintsData';
import { IMAGE_QUIZ_QUESTIONS } from '../../../src/utils/quizImageQuestions';
import { resolveHints } from '../../../src/utils/hintsText';
import { createSeededRng } from '../../../src/utils/seededRandom';
import type { ResolvedHint } from '../../../src/utils/hintsGenerator';

const h = (id: string, type: HintItem['type'], label: string, value: string, priority: 1 | 2 | 3 | 4 | 5 = 3): ResolvedHint =>
  ({ hint: { id, type, label, value, priority }, text: value });

const labels = (entries: ReturnType<typeof buildRenderEntries>) =>
  entries.map((e) => (e.kind === 'group' ? e.label : `single:${e.hint.hint.id}`));

const itemIds = (entries: ReturnType<typeof buildRenderEntries>, label: string) => {
  const g = entries.find((e) => e.kind === 'group' && e.label === label);
  return g && g.kind === 'group' ? g.items.map((i) => i.hint.hint.id) : [];
};

const revealSequence = (entries: ReturnType<typeof buildRenderEntries>) =>
  entries.flatMap((e) => (e.kind === 'group' ? e.items.map((i) => i.index) : [e.index]));

describe('headingModelFor', () => {
  it('mappar kategorier till modell', () => {
    expect(headingModelFor('Musikartist')).toBe('artist');
    expect(headingModelFor('Band')).toBe('artist');
    expect(headingModelFor('Actor')).toBe('actor');
    expect(headingModelFor('Character')).toBe('actor');
    expect(headingModelFor('Athlete')).toBeNull();
  });
});

describe('artist-modellen', () => {
  const hints = [
    h('prof', 'profession', 'Profession', 'Singer'),
    h('bd', 'birth_date', 'Date of birth', 'May 1, 1980'),
    h('bp', 'birth_place', 'Place of birth', 'Stockholm'),
    h('peak', 'peak_year', 'Career peak', '2000–2010'),
    h('s2', 'song', 'Hit song', '"Later" (2005)'),
    h('s1', 'song', 'Hit song', '"Earlier" (2001)'),
    h('al', 'album', 'Iconic album', '"Record" (2003)'),
    h('deb', 'debut', 'Debut album', '"First" album (1999)'),
    h('aw', 'merit', 'Merit/Award', 'Grammy Award'),
    h('gen', 'characteristic', 'Genre', 'pop'),
    h('fam', 'characteristic', 'Family', 'Daughter of a famous singer'),
    h('mem', 'band_member', 'Members', 'A, B, C'),
    h('h', 'height', 'Height', '180 cm'),
    h('mv', 'movie', 'Film', '"A Film" (2010)'),
  ];
  const entries = buildRenderEntries(hints, 'artist');

  it('bara artist-rubriker, i fast ordning, inga lösa bullets', () => {
    expect(labels(entries)).toEqual(['Birth & Career', 'Song titles', 'Albums', 'Trophies', 'Other']);
  });

  it('ingen ledtråd försvinner', () => {
    const total = entries.reduce((n, e) => n + (e.kind === 'group' ? e.items.length : 1), 0);
    expect(total).toBe(hints.length);
  });

  it('sorterar inom grupperna vid lika prioritet (yrke först i Birth & Career)', () => {
    expect(itemIds(entries, 'Birth & Career')).toEqual(['prof', 'bd', 'bp', 'peak']);
    expect(itemIds(entries, 'Song titles')).toEqual(['s1', 's2']);
    expect(itemIds(entries, 'Albums')).toEqual(['deb', 'al']);
  });

  it('genre, familj och bandmedlemmar först under Other, sedan resten (yrket ligger inte här)', () => {
    expect(itemIds(entries, 'Other')).toEqual(['gen', 'fam', 'mem', 'h', 'mv']);
  });
});

describe('actor-modellen', () => {
  const hints = [
    h('bd', 'birth_date', 'Date of birth', 'May 1, 1980'),
    h('mv', 'movie', 'Film', '"A Film" (2010)'),
    h('tv', 'tv_show', 'TV role', '"A Show" (2005)'),
    h('song', 'song', 'Hit song', '"A Song" (2001)'),
    h('aw', 'merit', 'Merit/Award', 'Academy Award'),
  ];
  const entries = buildRenderEntries(hints, 'actor');

  it('Film History men ingen Song titles; låtar under Other', () => {
    expect(labels(entries)).toEqual(['Birth & Career', 'Film History', 'Trophies', 'Other']);
    expect(itemIds(entries, 'Film History')).toEqual(['tv', 'mv']);
    expect(itemIds(entries, 'Other')).toEqual(['song']);
  });

  it('en ensam ledtråd får ändå sin rubrik', () => {
    expect(itemIds(entries, 'Trophies')).toEqual(['aw']);
  });
});

describe('idrottare oförändrade', () => {
  it('utan modell blir en ensam ledtråd en lös bullet som förut', () => {
    const entries = buildRenderEntries([h('ht', 'height', 'Height', '190 cm')]);
    expect(entries[0].kind).toBe('single');
  });
});

// Build 41-test R10a (Peter 2026-11-27): kategori-komplett reveal.
// Varje rubrik fylls färdigt innan nästa börjar, P1 → P5 inom rubriken,
// rubrikerna lättast först (medelprioritet), "Other" alltid sist, yrket under
// Birth & Career, en ny ledtråd hamnar alltid sist. Idrottare oförändrade.
describe('kategori-komplett reveal-ordning', () => {
  const artist = [
    h('prof', 'profession', 'Profession', 'Singer', 1),
    h('gen', 'characteristic', 'Genre', 'pop', 1),
    h('bd', 'birth_date', 'Date of birth', 'May 1, 1980', 2),
    h('s1', 'song', 'Hit song', '"Earlier" (2001)', 3),
    h('aw', 'merit', 'Merit/Award', 'Grammy Award', 4),
    h('s2', 'song', 'Hit song', '"Later" (2005)', 5),
    h('s3', 'song', 'Hit song', '"Middle" (2003)', 4),
  ];

  it('artist: index 0..n-1 i visningsordning (nytt läggs alltid sist)', () => {
    const seq = revealSequence(buildRenderEntries(artist, 'artist'));
    expect(seq).toEqual(seq.map((_, i) => i));
  });

  it('artist: rubriker lättast först, Other sist, P1 → P5 inom rubrik', () => {
    const entries = buildRenderEntries(artist, 'artist');
    expect(labels(entries)).toEqual(['Birth & Career', 'Song titles', 'Trophies', 'Other']);
    expect(itemIds(entries, 'Birth & Career')).toEqual(['prof', 'bd']);
    expect(itemIds(entries, 'Song titles')).toEqual(['s1', 's3', 's2']);
    expect(itemIds(entries, 'Other')).toEqual(['gen']);
  });

  it('actor: yrket öppnar Birth & Career, filmer P-ordnade', () => {
    const entries = buildRenderEntries([
      h('m2', 'movie', 'Film', '"Two" (1999)', 5),
      h('prof', 'profession', 'Profession', 'Actor', 1),
      h('m1', 'movie', 'Film', '"One" (2001)', 3),
      h('bd', 'birth_date', 'Date of birth', 'May 1, 1980', 2),
    ], 'actor');
    expect(labels(entries)).toEqual(['Birth & Career', 'Film History']);
    expect(itemIds(entries, 'Birth & Career')).toEqual(['prof', 'bd']);
    expect(itemIds(entries, 'Film History')).toEqual(['m1', 'm2']);
    const seq = revealSequence(entries);
    expect(seq).toEqual([0, 1, 2, 3]);
  });

  it('athlete (legacy): oförändrad — index pekar på selektionens position', () => {
    const hints = [
      h('prof', 'profession', 'Profession', 'Footballer', 1),
      h('c1', 'club', 'Club', 'Club A (2001–2005)', 3),
      h('ht', 'height', 'Height', '190 cm', 2),
      h('c2', 'club', 'Club', 'Club B (1998–2001)', 4),
    ];
    const entries = buildRenderEntries(hints);
    for (const e of entries) {
      const items = e.kind === 'group' ? e.items : [{ hint: e.hint, index: e.index }];
      for (const it of items) expect(hints[it.index]).toBe(it.hint);
    }
  });
});

describe('kategori-komplett reveal — hela katalogen (artist/band/actor)', () => {
  const LABEL: Record<string, HintCategoryLabel> = { artist: 'Musikartist', band: 'Band', actor: 'Actor' };
  const items = IMAGE_QUIZ_QUESTIONS.filter((q) => LABEL[q.contentSubject] && HINTS_LIBRARY[q.id]);
  const build = (q: (typeof items)[number], seed: string) => {
    const label = LABEL[q.contentSubject];
    const resolved = resolveHints(selectHints(HINTS_LIBRARY[q.id], 15, createSeededRng(seed)), q.displayName, label);
    return { resolved, entries: buildRenderEntries(resolved, headingModelFor(label)) };
  };

  it('täcker ett realistiskt antal frågor', () => {
    expect(items.length).toBeGreaterThan(100);
  });

  it('rubriker en gång, inga tomma, Other sist, yrket aldrig under Other, P1 → P5 inom rubrik, nytt alltid sist, samma ledtrådar', () => {
    for (const q of items) {
      const { resolved, entries } = build(q, `room:${q.id}`);
      const names = labels(entries);
      expect(new Set(names).size, q.id).toBe(names.length);
      const oi = names.indexOf('Other');
      if (oi >= 0) expect(oi, q.id).toBe(names.length - 1);
      for (const e of entries) {
        expect(e.kind, q.id).toBe('group');
        if (e.kind !== 'group') continue;
        expect(e.items.length, q.id).toBeGreaterThan(0);
        const ps = e.items.map((i) => i.hint.hint.priority);
        expect(ps, `${q.id} ${e.label}`).toEqual([...ps].sort((a, b) => a - b));
        if (e.label === 'Other') expect(e.items.some((i) => i.hint.hint.type === 'profession'), q.id).toBe(false);
      }
      const seq = revealSequence(entries);
      expect(seq, q.id).toEqual(seq.map((_, i) => i));
      const shown = entries.flatMap((e) => (e.kind === 'group' ? e.items.map((i) => i.hint) : [e.hint]));
      expect(new Set(shown), q.id).toEqual(new Set(resolved));
    }
  });

  it('samma fråga + samma seed ger identisk ordning på alla enheter', () => {
    const order = (seed: string, q: (typeof items)[number]) =>
      build(q, seed).entries.map((e) => (e.kind === 'group' ? `${e.label}:${e.items.map((i) => i.hint.hint.id).join(',')}` : e.hint.hint.id)).join('|');
    for (const q of items) {
      expect(order(`ROOM42:${q.id}`, q), q.id).toBe(order(`ROOM42:${q.id}`, q));
    }
  });
});

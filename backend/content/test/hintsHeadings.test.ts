// Fast rubrikmodell för Artister/Band + Skådespelare (Peter 2026-11-02):
// varje ledtråd hamnar under en rubrik, inget tas bort, resten under "Other".
// Idrottare behåller den äldre grupperingen.

import { describe, it, expect } from 'vitest';
import type { HintItem } from '../../../src/utils/hintsData';
import { buildRenderEntries, headingModelFor } from '../../../src/utils/hintsGenerator';
import type { ResolvedHint } from '../../../src/utils/hintsGenerator';

const h = (id: string, type: HintItem['type'], label: string, value: string, priority: 1 | 2 | 3 | 4 | 5 = 3): ResolvedHint =>
  ({ hint: { id, type, label, value, priority }, text: value });

const labels = (entries: ReturnType<typeof buildRenderEntries>) =>
  entries.map((e) => (e.kind === 'group' ? e.label : `single:${e.hint.hint.id}`));

const itemIds = (entries: ReturnType<typeof buildRenderEntries>, label: string) => {
  const g = entries.find((e) => e.kind === 'group' && e.label === label);
  return g && g.kind === 'group' ? g.items.map((i) => i.hint.hint.id) : [];
};

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

  it('sorterar inom grupperna', () => {
    expect(itemIds(entries, 'Birth & Career')).toEqual(['bd', 'bp', 'peak']);
    expect(itemIds(entries, 'Song titles')).toEqual(['s1', 's2']);
    expect(itemIds(entries, 'Albums')).toEqual(['deb', 'al']);
  });

  it('genre, familj och bandmedlemmar först under Other, sedan resten', () => {
    expect(itemIds(entries, 'Other')).toEqual(['gen', 'fam', 'mem', 'prof', 'h', 'mv']);
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

// Tester för Hints-omstruktureringen (Peter 2026-08-27):
//   1. Profession-ledtrådar som bara upprepar rubriken (Genre · Profession)
//      döljs; crossover-delar visas som "Also well-known as X".
//   2. Birth_date + birth_place grupperas under "Birth".
//   3. 'movie'-ledtrådar grupperas under "Film History", kronologiskt.
//   4. 'merit'-ledtrådar delas i "Titles" (tävlings-/lagtitlar) och
//      "Trophies" (personliga utmärkelser).
//   5. Grupper bildas bara vid ≥2 medlemmar.
//
// Ligger i backend-sviten (enda vitest-harnessen i repot) men testar
// klient-modulerna under src/utils.

import { describe, it, expect } from 'vitest';
import type { HintItem } from '../../../src/utils/hintsData';
import { HINTS_LIBRARY } from '../../../src/utils/hintsData';
import { buildRenderEntries, selectHints } from '../../../src/utils/hintsGenerator';
import { resolveHintText, resolveHints } from '../../../src/utils/hintsText';

const h = (id: string, type: HintItem['type'], label: string, value: string, priority: 1 | 2 | 3 | 4 | 5): HintItem =>
  ({ id, type, label, value, priority });

describe('profession-redundans mot rubriken', () => {
  it('döljer en profession-ledtråd som bara upprepar rubriken', () => {
    expect(resolveHintText(h('p', 'profession', 'Profession', 'Actor', 1), 'Some Actor', 'Actor')).toBeNull();
    expect(resolveHintText(h('p', 'profession', 'Profession', 'Music artist', 1), 'Some Singer', 'Musikartist')).toBeNull();
    expect(resolveHintText(h('p', 'profession', 'Profession', 'Film actor', 1), 'Some Actor', 'Actor')).toBeNull();
  });

  it('visar crossover-delen som "Also: X"', () => {
    expect(resolveHintText(h('p', 'profession', 'Profession', 'Drummer & actor', 1), 'Someone', 'Actor'))
      .toBe('Also: Drummer');
    expect(resolveHintText(h('p', 'profession', 'Profession', 'Actor & winegrower', 1), 'Someone', 'Actor'))
      .toBe('Also: winegrower');
    expect(resolveHintText(h('p', 'profession', 'Profession', 'Music artist & actor', 1), 'Someone', 'Musikartist'))
      .toBe('Also: actor');
  });

  it('visar specifik, icke-redundant information oförändrad', () => {
    expect(resolveHintText(h('p', 'profession', 'Profession', 'Professional golfer', 1), 'Someone', 'Athlete'))
      .toBe('Professional golfer');
    expect(resolveHintText(h('p', 'profession', 'Profession', 'Nordic pop group', 1), 'Someone', 'Band'))
      .toBe('Nordic pop group');
  });

  it('utan professionLabel körs ingen strippning (bakåtkompatibelt)', () => {
    expect(resolveHintText(h('p', 'profession', 'Profession', 'Actor', 1), 'Someone')).toBe('Actor');
  });
});

describe('Birth-gruppering', () => {
  it('grupperar birth_date + birth_place under "Birth"', () => {
    const hints: HintItem[] = [
      h('prof', 'profession', 'Profession', 'Actor', 1),
      h('bd', 'birth_date', 'Date of birth', 'May 31, 1930', 2),
      h('bp', 'birth_place', 'Place of birth', 'San Francisco', 2),
      h('mv', 'movie', 'Film', '"A Film" (1990)', 5),
    ];
    const resolved = resolveHints(hints, 'Someone', 'Actor');
    const entries = buildRenderEntries(resolved);
    const birthGroup = entries.find((e) => e.kind === 'group' && e.label === 'Birth');
    expect(birthGroup).toBeDefined();
    if (birthGroup?.kind === 'group') {
      expect(birthGroup.items).toHaveLength(2);
      expect(birthGroup.items[0].hint.hint.type).toBe('birth_date');
      expect(birthGroup.items[1].hint.hint.type).toBe('birth_place');
    }
  });

  it('en ensam birth_date (utan plats) blir en vanlig bullet, ingen rubrik', () => {
    const hints: HintItem[] = [
      h('bd', 'birth_date', 'Date of birth', 'May 31, 1930', 2),
      h('mv', 'movie', 'Film', '"A Film" (1990)', 5),
      h('mv2', 'movie', 'Film', '"B Film" (1995)', 4),
    ];
    const resolved = resolveHints(hints, 'Someone');
    const entries = buildRenderEntries(resolved);
    expect(entries.some((e) => e.kind === 'group' && e.label === 'Birth')).toBe(false);
    expect(entries.some((e) => e.kind === 'single' && e.hint.hint.type === 'birth_date')).toBe(true);
  });
});

describe('Film History-gruppering', () => {
  it('grupperar spridda movie-hints (olika prioritet) kronologiskt under EN rubrik', () => {
    // Iconic-rollen på P5 (visas sist), övriga på P3 — medvetet ISÄR i
    // prioritets-ordningen (samma mönster som riktiga skådespelar-entries).
    const hints: HintItem[] = [
      h('bd', 'birth_date', 'Date of birth', 'May 31, 1930', 1),
      h('mv1', 'movie', 'Film', '"Second Film" (1995)', 3),
      h('mv2', 'movie', 'Film', '"Third Film" (2000)', 3),
      h('merit', 'merit', 'Merit', 'Some award', 4),
      h('mv3', 'movie', 'Film', '"First Film" (1990)', 5),
    ];
    const resolved = resolveHints(hints, 'Someone');
    const entries = buildRenderEntries(resolved);
    const filmGroup = entries.find((e) => e.kind === 'group' && e.label === 'Film History');
    expect(filmGroup).toBeDefined();
    if (filmGroup?.kind === 'group') {
      expect(filmGroup.items.map((i) => i.hint.text)).toEqual([
        '"First Film" (1990)',
        '"Second Film" (1995)',
        '"Third Film" (2000)',
      ]);
      // Gruppen placeras vid den FÖRSTA filmens ORIGINALindex (mv1, näst
      // efter birth_date-bulleten) — inte vid den kronologiskt tidigaste (mv3).
      const groupPosition = entries.indexOf(filmGroup);
      expect(groupPosition).toBe(1);
      expect(entries[0].kind).toBe('single'); // birth_date-bulleten
    }
  });

  it('bevarar hängande citattecken korrekt vid avkortning av en lång filmtitel', () => {
    const longTitle = h('mv', 'movie', 'Film', '"An Extremely Long And Very Descriptive Movie Title Indeed" (1988)', 3);
    const longTitle2 = h('mv2', 'movie', 'Film', '"Another Extremely Long Movie Title Here Too" (1992)', 4);
    const resolved = resolveHints([longTitle, longTitle2], 'Someone');
    for (const r of resolved) {
      const quoteCount = (r.text.match(/"/g) ?? []).length;
      expect(quoteCount % 2).toBe(0);
      expect(r.text.length).toBeLessThanOrEqual(33); // HINT_SUB_MAX_CHARS
    }
  });
});

describe('Titles vs Trophies', () => {
  it('klassar kända tävlings-/lagtitel-etiketter som Titles', () => {
    const hints: HintItem[] = [
      h('c1', 'merit', 'Club Trophy', 'Premier League × 3 (Manchester United)', 3),
      h('c2', 'merit', 'National Trophy', 'FIFA World Cup winner 1986', 4),
    ];
    const resolved = resolveHints(hints, 'Someone');
    const entries = buildRenderEntries(resolved);
    const titles = entries.find((e) => e.kind === 'group' && e.label === 'Titles');
    expect(titles).toBeDefined();
    if (titles?.kind === 'group') expect(titles.items).toHaveLength(2);
  });

  it('klassar personliga utmärkelser (generisk etikett, inget tävlingsnamn) som Trophies', () => {
    const hints: HintItem[] = [
      h('m1', 'merit', 'Merit/Award', 'Commander of the Legion of Honour', 4),
      h('m2', 'merit', 'Merit/Award', 'National Medal of Arts', 5),
    ];
    const resolved = resolveHints(hints, 'Someone');
    const entries = buildRenderEntries(resolved);
    const trophies = entries.find((e) => e.kind === 'group' && e.label === 'Trophies');
    expect(trophies).toBeDefined();
    if (trophies?.kind === 'group') expect(trophies.items).toHaveLength(2);
  });

  it('generisk etikett + tävlings-nyckelord i värdet klassas ändå som Title', () => {
    const hints: HintItem[] = [
      h('m1', 'merit', 'Merit', '5× NBA Champion (2000, 2001, 2002, 2009, 2010)', 4),
      h('m2', 'merit', 'Merit', '2× Wimbledon champion (1988, 1990)', 5),
    ];
    const resolved = resolveHints(hints, 'Someone');
    const entries = buildRenderEntries(resolved);
    expect(entries.find((e) => e.kind === 'group' && e.label === 'Titles')).toBeDefined();
    expect(entries.find((e) => e.kind === 'group' && e.label === 'Trophies')).toBeUndefined();
  });

  it('en ensam merit (oavsett klass) blir en vanlig bullet', () => {
    const hints: HintItem[] = [
      h('prof', 'profession', 'Profession', 'Actor', 1),
      h('m1', 'merit', 'Merit/Award', 'Some Award', 4),
    ];
    const resolved = resolveHints(hints, 'Someone', 'Actor');
    const entries = buildRenderEntries(resolved);
    expect(entries.every((e) => e.kind === 'single')).toBe(true);
  });
});

describe('Verklig katalog — grupperingen körs utan att krascha', () => {
  it('bygger render-entries för alla bibliotek utan fel', () => {
    for (const [id, lib] of Object.entries(HINTS_LIBRARY)) {
      const selected = selectHints(lib, 15);
      const resolved = resolveHints(selected, id, lib.categoryLabel);
      expect(() => buildRenderEntries(resolved)).not.toThrow();
    }
  });

  it('harrison-ford grupperar sin filmografi under "Film History"', () => {
    const lib = HINTS_LIBRARY['harrison-ford'];
    expect(lib).toBeDefined();
    const resolved = resolveHints(selectHints(lib!, 15), 'Harrison Ford', 'Actor');
    const entries = buildRenderEntries(resolved);
    const filmGroup = entries.find((e) => e.kind === 'group' && e.label === 'Film History');
    expect(filmGroup).toBeDefined();
    if (filmGroup?.kind === 'group') expect(filmGroup.items.length).toBeGreaterThanOrEqual(3);
    // Ingen "Actor"-profession-bullet ska synas — helt redundant mot rubriken.
    expect(resolved.some((r) => r.hint.type === 'profession' && r.text.toLowerCase() === 'actor')).toBe(false);
  });
});

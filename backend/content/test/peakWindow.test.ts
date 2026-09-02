// Tester för aktiv-era-fönstret (peakFrom/peakTo) som era-gatar person/Hints-items.
// Ligger i backend-sviten (repots enda vitest-harness) men testar klient-modulen
// src/utils/peakWindow + den genererade src/utils/quizImageQuestions.

import { describe, it, expect } from 'vitest';
import { parsePeakYear, resolvePeakWindow } from '../../../src/utils/peakWindow';
import { IMAGE_QUIZ_QUESTIONS } from '../../../src/utils/quizImageQuestions';

const NOW = 2026;

describe('parsePeakYear', () => {
  it('tolkar YYYY – YYYY', () => {
    expect(parsePeakYear('1979 – 1995', NOW)).toEqual({ peakFrom: 1979, peakTo: 1995 });
  });
  it('tolkar YYYY – present som slutår = currentYear', () => {
    expect(parsePeakYear('2019 – present', NOW)).toEqual({ peakFrom: 2019, peakTo: NOW });
  });
  it('tolkar decennium YYYYs – YYYYs (start = decenniets början, slut = +9)', () => {
    expect(parsePeakYear('1920s – 1950s', NOW)).toEqual({ peakFrom: 1920, peakTo: 1959 });
  });
  it('hanterar vanligt bindestreck också', () => {
    expect(parsePeakYear('1965-1981', NOW)).toEqual({ peakFrom: 1965, peakTo: 1981 });
  });
  it('ett ensamt år ger from = to', () => {
    expect(parsePeakYear('1984', NOW)).toEqual({ peakFrom: 1984, peakTo: 1984 });
  });
  it('returnerar null för otolkbart / bakvänt spann', () => {
    expect(parsePeakYear('', NOW)).toBeNull();
    expect(parsePeakYear('sometime', NOW)).toBeNull();
    expect(parsePeakYear('1995 – 1980', NOW)).toBeNull();
  });
});

describe('resolvePeakWindow — prioritetsordning', () => {
  it('1. katalogens explicita peak vinner över allt', () => {
    expect(
      resolvePeakWindow({
        catalogPeakFrom: 1979,
        catalogPeakTo: 2009,
        peakYearHint: '1979 – 1995',
        correctYear: 1958,
        contentSubject: 'artist',
        currentYear: NOW,
      }),
    ).toEqual({ peakFrom: 1979, peakTo: 2009 });
  });

  it('2. curated peak_year-ledtråd när katalog-peak saknas', () => {
    expect(
      resolvePeakWindow({
        peakYearHint: '1944 – 1955',
        correctYear: 1917,
        contentSubject: 'artist',
        currentYear: NOW,
      }),
    ).toEqual({ peakFrom: 1944, peakTo: 1955 });
  });

  it('3a. fallback för solo-person: födelseår +18..+58', () => {
    expect(
      resolvePeakWindow({ correctYear: 1958, contentSubject: 'artist', currentYear: NOW }),
    ).toEqual({ peakFrom: 1976, peakTo: 2016 });
  });

  it('3b. solo-person fallback klampas mot currentYear', () => {
    expect(
      resolvePeakWindow({ correctYear: 1995, contentSubject: 'actor', currentYear: NOW }),
    ).toEqual({ peakFrom: 2013, peakTo: NOW });
  });

  it('3c. band-fallback: bildningsår..+40', () => {
    expect(
      resolvePeakWindow({ correctYear: 1962, contentSubject: 'band', currentYear: NOW }),
    ).toEqual({ peakFrom: 1962, peakTo: 2002 });
  });

  it('3d. icke-person-subjekt får INGEN fallback', () => {
    expect(
      resolvePeakWindow({ correctYear: 1950, contentSubject: 'city', currentYear: NOW }),
    ).toBeNull();
  });

  it('3e. skippar om from > to (person född för nyligen)', () => {
    expect(
      resolvePeakWindow({ correctYear: NOW - 5, contentSubject: 'artist', currentYear: NOW }),
    ).toBeNull();
  });

  it('4. inget underlag → null', () => {
    expect(resolvePeakWindow({ contentSubject: 'artist', currentYear: NOW })).toBeNull();
  });
});

// ── End-to-end: replikerar quiz.tsx:s era-filter mot den genererade poolen ──
// (samma logik som app/quiz.tsx inEraImages: peak-overlap → person-agnostisk →
//  correctYear → agnostisk.)
const PERSON_SUBJECTS = new Set([
  'artist', 'band', 'actor', 'character', 'athlete', 'celebrity', 'cultural-person',
]);
function inEra(q: any, eraFrom: number, eraTo: number): boolean {
  if (q.peakFrom !== undefined && q.peakTo !== undefined) {
    return eraFrom <= q.peakTo && eraTo >= q.peakFrom;
  }
  if (PERSON_SUBJECTS.has(q.contentSubject)) return true;
  if (q.correctYear !== undefined) return q.correctYear >= eraFrom && q.correctYear <= eraTo;
  return true;
}
const byId = (id: string) => IMAGE_QUIZ_QUESTIONS.find((q) => q.id === id);

describe('era-filter mot genererad pool', () => {
  it('rapporterade buggen: Jo Stafford utesluts ur 1981–2026', () => {
    const jo = byId('jo-stafford');
    expect(jo).toBeDefined();
    expect(jo!.peakFrom).toBeDefined();
    expect(inEra(jo, 1981, 2026)).toBe(false);
    expect(inEra(jo, 1940, 1960)).toBe(true);
  });

  it('Michael Jackson finns kvar i 1981–2026', () => {
    expect(inEra(byId('michael-jackson'), 1981, 2026)).toBe(true);
  });

  it('vice versa: en modern artist utesluts ur 1950–1980', () => {
    const doja = byId('doja-cat');
    expect(doja).toBeDefined();
    expect(inEra(doja, 1950, 1980)).toBe(false);
    expect(inEra(doja, 2010, 2026)).toBe(true);
  });

  it('swing-eran (Glenn Miller) utesluts ur 1981–2026', () => {
    expect(inEra(byId('glenn-miller'), 1981, 2026)).toBe(false);
  });

  it('nästan alla spelbara person-items har nu ett peak-fönster', () => {
    const persons = IMAGE_QUIZ_QUESTIONS.filter((q) => PERSON_SUBJECTS.has(q.contentSubject));
    const withPeak = persons.filter((q) => q.peakFrom !== undefined && q.peakTo !== undefined);
    // Residualen (inget peak-underlag alls) ska vara mycket liten.
    expect(persons.length - withPeak.length).toBeLessThanOrEqual(10);
  });
});

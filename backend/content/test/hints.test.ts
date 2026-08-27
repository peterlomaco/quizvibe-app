// Tester för Hints-reglerna (Peter 2026-08-12):
//   1. Alla svarsalternativ har samma kön som rätt svar.
//   2. Varje bullet är max HINT_MAX_CHARS tecken (= exakt en rad).
//   3. Karriärhistoriken är alltid kronologisk och i ETT block.
//
// Ligger i backend-sviten (enda vitest-harnessen i repot) men testar
// klient-modulerna under src/utils.

import { describe, it, expect } from 'vitest';
import {
  HINT_MAX_CHARS,
  HINT_SUB_MAX_CHARS,
  fitClubText,
  fitHintText,
  formatHintText,
  selectHints,
} from '../../../src/utils/hintsGenerator';
import { HINTS_LIBRARY } from '../../../src/utils/hintsData';
import { censorForAnswer, censorSensitive, meetsHintsThreshold, resolveHints } from '../../../src/utils/hintsText';
import { getPersonGender } from '../../../src/utils/personGender';
import {
  GENDERED_SUBJECTS,
  buildHintsDistractorPool,
  resolveItemGender,
} from '../../../src/utils/hintsDistractorPool';
import { buildImageVariant } from '../../../src/utils/imageQuestionBuilder';
import { IMAGE_QUIZ_QUESTIONS } from '../../../src/utils/quizImageQuestions';
import { isItemInRegionScope, PLAYER_COUNTRY } from '../../../src/utils/regionScope';

const OPTIONS_PER_QUESTION = 5;
const ALL_AUDIENCES = new Set(['elder', 'gen-x', 'millennials', 'gen-z', 'gen-alpha', 'all'] as const);

const resolveGender = (id: string) => resolveItemGender(id, HINTS_LIBRARY[id]);

// Samma två filter som quiz.tsx: bara items som når spelaren räknas.
// (Katalogen innehåller ~470 items utanför region scope som aldrig visas.)
const playable = IMAGE_QUIZ_QUESTIONS.filter(
  (q) =>
    isItemInRegionScope(q.region, PLAYER_COUNTRY) &&
    meetsHintsThreshold(HINTS_LIBRARY[q.id], q.displayName),
);
const playablePersons = playable.filter((q) => GENDERED_SUBJECTS.has(q.contentSubject));

describe('kön på svarsalternativ', () => {
  it('finns testdata att köra mot', () => {
    expect(playablePersons.length).toBeGreaterThan(150);
  });

  it('täcker person-items i den spelbara poolen', () => {
    // Icke-binära P21-värden ska MEDVETET sakna kön (se personGender.ts) —
    // frågan faller då tillbaka på subject-poolen istället för att låsas.
    const KNOWN_NON_BINARY = new Set(['demi-lovato', 'miley-cyrus', 'dana-international']);
    const unknown = playablePersons.filter((q) => resolveGender(q.id) === null && !KNOWN_NON_BINARY.has(q.id));
    // Utan kön faller frågan tillbaka på subject-poolen (blandade alternativ),
    // så täckningen måste vara i stort sett total för att regeln ska bita.
    expect(unknown.map((q) => q.id)).toEqual([]);
  });

  it('ger en köns-homogen pool för varje spelbar person-fråga', () => {
    const leaks: string[] = [];
    for (const q of playablePersons) {
      const gender = resolveGender(q.id);
      if (!gender) continue;
      const { itemPool, genderLocked } = buildHintsDistractorPool(q, IMAGE_QUIZ_QUESTIONS);
      if (!genderLocked) { leaks.push(`${q.id}: låset slog inte till`); continue; }
      const wrong = itemPool.filter((c) => resolveGender(c.id) !== gender);
      if (wrong.length > 0) leaks.push(`${q.id}: ${wrong.map((w) => w.id).join(', ')}`);
    }
    expect(leaks).toEqual([]);
  });

  it('bygger ändå 5 alternativ, alla av rätt kön', () => {
    const problems: string[] = [];
    for (const q of playablePersons) {
      const gender = resolveGender(q.id);
      if (!gender) continue;
      const { itemPool, genderLocked } = buildHintsDistractorPool(q, IMAGE_QUIZ_QUESTIONS);
      // 'full' ger fullnamn-listan — alternativen är då identifierbara items
      // och kan kontrolleras mot kön direkt.
      const variant = buildImageVariant(
        q,
        'full',
        ALL_AUDIENCES as unknown as ReadonlySet<never>,
        itemPool,
        genderLocked ? [] : [],
        OPTIONS_PER_QUESTION,
      );
      if (variant.mode !== 'full-names') continue;
      if (variant.nameList.length !== OPTIONS_PER_QUESTION) {
        problems.push(`${q.id}: ${variant.nameList.length} alternativ`);
        continue;
      }
      const wrong = variant.nameList.filter((o) => !o.isCorrect && resolveGender(o.itemId) !== gender);
      if (wrong.length > 0) problems.push(`${q.id}: fel kön → ${wrong.map((w) => w.itemId).join(', ')}`);
    }
    expect(problems).toEqual([]);
  });

  it('band saknar kön — köns-låsningen gäller aldrig band-frågor', () => {
    const bands = IMAGE_QUIZ_QUESTIONS.filter((q) => q.contentSubject === 'band');
    expect(bands.length).toBeGreaterThan(0);
    expect(bands.filter((b) => getPersonGender(b.id) !== null)).toEqual([]);
    for (const b of bands.slice(0, 20)) {
      expect(buildHintsDistractorPool(b, IMAGE_QUIZ_QUESTIONS).genderLocked).toBe(false);
    }
  });
});

describe('radlängd på ledtrådar', () => {
  it('kortar varje ledtråd i katalogen till en rad', () => {
    const tooLong: string[] = [];
    for (const lib of Object.values(HINTS_LIBRARY)) {
      for (const hint of lib.hints) {
        const fitted = fitHintText(formatHintText(hint));
        if (fitted.length > HINT_MAX_CHARS) tooLong.push(fitted);
      }
    }
    expect(tooLong).toEqual([]);
  });

  it('lämnar korta ledtrådar orörda', () => {
    expect(fitHintText('Born: August 29, 1958')).toBe('Born: August 29, 1958');
    expect(fitHintText('"Vogue" (1990)')).toBe('"Vogue" (1990)');
  });

  it('tar bort standardfraser före den kortar med ellips', () => {
    expect(fitHintText('Academy Award for Best Actress')).toBe('Oscar: Best Actress');
  });

  it('tar förklarande efterled före årtalet', () => {
    expect(fitHintText('"Thriller" (1982) — best-selling album of all time')).toBe('"Thriller" (1982)');
  });

  it('lämnar aldrig ett hängande citattecken', () => {
    expect(fitHintText('"Sällskapsresan 2 – Snowroller"')).toBe('"Sällskapsresan 2"');
    for (const lib of Object.values(HINTS_LIBRARY)) {
      for (const hint of lib.hints) {
        const fitted = fitHintText(formatHintText(hint));
        if (fitted.startsWith('"')) {
          expect((fitted.match(/"/g) ?? []).length % 2).toBe(0);
        }
      }
    }
  });

  it('behåller årtalen på klubb-rader men kortar klubbnamnet', () => {
    const fitted = fitClubText('Germany men\'s national association football team (1965–1977)');
    expect(fitted.length).toBeLessThanOrEqual(HINT_SUB_MAX_CHARS);
    expect(fitted).toContain('(1965–1977)');
  });
});

describe('inga dubblerade bullets', () => {
  it('visar aldrig samma rad två gånger', () => {
    const dupes: string[] = [];
    for (const [id, lib] of Object.entries(HINTS_LIBRARY)) {
      const answer = IMAGE_QUIZ_QUESTIONS.find((q) => q.id === id)?.displayName ?? id;
      for (let run = 0; run < 3; run++) {
        const texts = resolveHints(selectHints(lib, 15), answer).map((r) => r.text.toLowerCase().trim());
        const seen = new Set<string>();
        for (const t of texts) {
          if (seen.has(t)) dupes.push(`${id}: "${t}"`);
          seen.add(t);
        }
      }
    }
    expect([...new Set(dupes)]).toEqual([]);
  });

  it('fångar identiska råvärden (Glenn Hyséns två "Kristallkulan")', () => {
    const lib = HINTS_LIBRARY['glenn-hysen'];
    expect(lib).toBeDefined();
    expect(lib!.hints.filter((h) => h.value === 'Kristallkulan')).toHaveLength(2);
    const texts = resolveHints(selectHints(lib!, 15), 'Glenn Hysén').map((r) => r.text);
    expect(texts.filter((t) => t === 'Kristallkulan')).toHaveLength(1);
  });

  it('fångar olika råvärden som kortas till samma rad', () => {
    const collide = [
      { id: 'a', type: 'merit' as const, label: 'M', value: 'Golden Globe Award for Best Actress – Drama', priority: 3 as const },
      { id: 'b', type: 'merit' as const, label: 'M', value: 'Golden Globe Award for Best Actress – Comedy', priority: 3 as const },
    ];
    const resolved = resolveHints(collide, 'Någon Annan');
    expect(resolved).toHaveLength(1);
  });
});

describe('inga innehållslösa rader', () => {
  it('lämnar aldrig en rad som bara är skiljetecken/citattecken', () => {
    const hollow: string[] = [];
    const hasSubstance = (t: string) => /[A-Za-zÀ-ÖØ-öø-ÿ0-9]/.test(t);
    for (const [id, lib] of Object.entries(HINTS_LIBRARY)) {
      const answer = IMAGE_QUIZ_QUESTIONS.find((q) => q.id === id)?.displayName ?? id;
      for (let run = 0; run < 3; run++) {
        const texts = resolveHints(selectHints(lib, 15), answer).map((r) => r.text);
        for (const t of texts) {
          if (!hasSubstance(t)) hollow.push(`${id}: "${t}"`);
        }
      }
    }
    expect([...new Set(hollow)]).toEqual([]);
  });

  it('censorSensitive/censorForAnswer returnerar null istället för en ensam citat-rest', () => {
    // Svaret/det känsliga ordet börjar precis efter ett inledande citattecken
    // — "before" blir bara `"`, vilket tidigare visades som en tom bullet.
    expect(censorForAnswer('"Waterloo" by ABBA', 'Waterloo')).toBeNull();
    expect(censorSensitive('"died at home in 2019')).toBeNull();
  });
});

describe('karriärhistorik', () => {
  const withClubs = Object.entries(HINTS_LIBRARY).filter(
    ([, lib]) => lib.hints.filter((h) => h.type === 'club').length >= 2,
  );

  it('finns testdata att köra mot', () => {
    expect(withClubs.length).toBeGreaterThan(50);
  });

  it('lägger klubbarna i ETT block, kronologiskt', () => {
    const startYear = (value: string) => {
      const m = value.match(/\((\d{4})/) ?? value.match(/\b(\d{4})\b/);
      return m ? parseInt(m[1], 10) : Number.POSITIVE_INFINITY;
    };

    for (const [id, lib] of withClubs) {
      for (let run = 0; run < 5; run++) {
        const selected = selectHints(lib, 15);
        const clubIdx = selected.flatMap((h, i) => (h.type === 'club' ? [i] : []));
        // Sammanhängande block: index ökar med exakt 1.
        for (let i = 1; i < clubIdx.length; i++) {
          expect(clubIdx[i], `${id}: klubbarna är uppdelade i flera block`).toBe(clubIdx[i - 1] + 1);
        }
        // Kronologiskt: startåret får aldrig gå bakåt.
        const years = clubIdx.map((i) => startYear(selected[i].value));
        for (let i = 1; i < years.length; i++) {
          expect(years[i], `${id}: karriärhistoriken är inte kronologisk`).toBeGreaterThanOrEqual(years[i - 1]);
        }
      }
    }
  });
});

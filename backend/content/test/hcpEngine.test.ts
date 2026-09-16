import { describe, it, expect } from 'vitest';
import {
  applyGameResult,
  applyInactivityDecay,
  ASSIST_DIRECTION_MULT,
  clampHcp,
  displayHcp,
  emptyCategoryProgress,
  emptyHcpProgress,
  eraWidthMultiplier,
  evaluateWindow,
  filterByItemHcp,
  hcpRecognitionLowerBound,
  hcpTier,
  hcpTierFactor,
  HCP_START,
  HCP_WINDOW_SIZE,
  resolveDisplayHcp,
  resolveDisplayTotalHcp,
  totalHcp,
  type CategoryProgress,
  type HcpProgress,
  type HcpWindow,
} from '../../../src/utils/hcpEngine';

// Neutral Game Era-span (15 år → ×1.0) för att isolera övriga faktorer i tester.
const ERA = 15;

// Hjälpare: ett fönster med `nCorrect` rätt av `size` svar (resten fel).
function win(nCorrect: number, size = HCP_WINDOW_SIZE): HcpWindow {
  return Array.from({ length: size }, (_, i) => i < nCorrect);
}

// Kategori-progress med explicit hcp + valfria fönster/klocka.
function cat(hcp: number, windows?: Partial<CategoryProgress['windows']>, lastPlayedISO: string | null = null): CategoryProgress {
  return {
    hcp,
    windows: { minimal: [], standard: [], full: [], ...windows },
    lastPlayedISO,
  };
}

// Full progress: Music styrs, Film default 99 (orörd). (Sport borttaget 2026-09.)
function progress(music: CategoryProgress, film = emptyCategoryProgress()): HcpProgress {
  return { categories: { Music: music, Film: film } };
}

const ISO = '2026-01-01T00:00:00.000Z';

describe('displayHcp / clampHcp (§1.2.3 — avrunda uppåt)', () => {
  it('avrundar ALLTID uppåt', () => {
    expect(displayHcp(40)).toBe(40);
    expect(displayHcp(40.01)).toBe(41);
    expect(displayHcp(40.75)).toBe(41);
  });
  it('klampar till [1, 99]', () => {
    expect(displayHcp(120)).toBe(99);
    expect(displayHcp(0)).toBe(1);
    expect(clampHcp(-5)).toBe(1);
    expect(clampHcp(150)).toBe(99);
  });
});

describe('emptyHcpProgress (§1.1/§1.3 — alla kategorier startar på 99)', () => {
  it('startar varje kategori på HCP_START med tomma fönster', () => {
    const p = emptyHcpProgress();
    expect(HCP_START).toBe(99);
    for (const c of [p.categories.Music, p.categories.Film]) {
      expect(c.hcp).toBe(99);
      expect(c.windows.full).toEqual([]);
      expect(c.windows.standard).toEqual([]);
      expect(c.windows.minimal).toEqual([]);
      expect(c.lastPlayedISO).toBeNull();
    }
  });
});

describe('totalHcp / resolveDisplayTotalHcp (Total = snittet Music + Film)', () => {
  it('total = snittet av Music + Film', () => {
    const p = progress(cat(40), cat(60));
    expect(totalHcp(p)).toBeCloseTo(50, 5);
    expect(resolveDisplayTotalHcp(p)).toBe(50);
  });
  it('avrundar total uppåt', () => {
    const p = progress(cat(40), cat(61)); // snitt 50.5 → ceil 51
    expect(resolveDisplayTotalHcp(p)).toBe(51);
  });
  it('orört Film (99) späder Total mot 99', () => {
    const p = progress(cat(40)); // Music 40, Film 99 → snitt 69.5 → ceil 70
    expect(resolveDisplayTotalHcp(p)).toBe(70);
  });
  it('null progress → 99', () => {
    expect(resolveDisplayTotalHcp(null)).toBe(99);
    expect(resolveDisplayTotalHcp(undefined)).toBe(99);
  });
  it('ny spelare (alla 99) → total 99', () => {
    expect(resolveDisplayTotalHcp(emptyHcpProgress())).toBe(99);
  });
});

describe('evaluateWindow (§2.1 — råa signerade steg, okapat, 10-fönster)', () => {
  it('kräver ett FULLT fönster (10 svar) innan något steg', () => {
    expect(evaluateWindow(win(0, 9), 'full')).toBe(0);
    expect(evaluateWindow(win(9, 9), 'full')).toBe(0);
  });
  it('Full: ett steg per svar förbi tröskeln (3/7)', () => {
    expect(evaluateWindow(win(10), 'full')).toBe(-4);
    expect(evaluateWindow(win(7), 'full')).toBe(-1);
    expect(evaluateWindow(win(8), 'full')).toBe(-2);
    expect(evaluateWindow(win(6), 'full')).toBe(0);
    expect(evaluateWindow(win(4), 'full')).toBe(0);
    expect(evaluateWindow(win(3), 'full')).toBe(1);
    expect(evaluateWindow(win(0), 'full')).toBe(4);
  });
  it('Standard: (3/6)', () => {
    expect(evaluateWindow(win(10), 'standard')).toBe(-5);
    expect(evaluateWindow(win(6), 'standard')).toBe(-1);
    expect(evaluateWindow(win(3), 'standard')).toBe(1);
    expect(evaluateWindow(win(0), 'standard')).toBe(4);
  });
  it('Minimal: (2/5)', () => {
    expect(evaluateWindow(win(10), 'minimal')).toBe(-6);
    expect(evaluateWindow(win(5), 'minimal')).toBe(-1);
    expect(evaluateWindow(win(2), 'minimal')).toBe(1);
    expect(evaluateWindow(win(0), 'minimal')).toBe(3);
  });
});

describe('hcpTier / hcpTierFactor (steg-faktor per HCP-nivå)', () => {
  it('>60 → high/1.0', () => {
    expect(hcpTier(99)).toBe('high');
    expect(hcpTier(61)).toBe('high');
    expect(hcpTierFactor(99)).toBe(1.0);
    expect(hcpTierFactor(61)).toBe(1.0);
  });
  it('30–60 → mid/0.7 (gränserna 60 och 30 inklusive)', () => {
    expect(hcpTier(60)).toBe('mid');
    expect(hcpTier(30)).toBe('mid');
    expect(hcpTierFactor(60)).toBe(0.7);
    expect(hcpTierFactor(30)).toBe(0.7);
  });
  it('1–29 → low/0.4', () => {
    expect(hcpTier(29)).toBe('low');
    expect(hcpTier(1)).toBe('low');
    expect(hcpTierFactor(29)).toBe(0.4);
    expect(hcpTierFactor(1)).toBe(0.4);
  });
});

describe('eraWidthMultiplier (§2.1 — Game Era-bredd, span/15 klampad 0.5–3.0)', () => {
  it('15-årsspann = ×1.0 (baslinje)', () => {
    expect(eraWidthMultiplier(15)).toBe(1.0);
  });
  it('skalar proportionellt', () => {
    expect(eraWidthMultiplier(30)).toBe(2.0);
    expect(eraWidthMultiplier(10)).toBeCloseTo(0.667, 3);
  });
  it('cappar vid 3.0 för breda eror', () => {
    expect(eraWidthMultiplier(45)).toBe(3.0);
    expect(eraWidthMultiplier(96)).toBe(3.0);
  });
  it('golv 0.5 för smala eror', () => {
    expect(eraWidthMultiplier(7.5)).toBe(0.5);
  });
  it('ogiltigt/tomt span → ×1.0 (neutralt)', () => {
    expect(eraWidthMultiplier(0)).toBe(1);
    expect(eraWidthMultiplier(NaN)).toBe(1);
  });
});

describe('ASSIST_DIRECTION_MULT (§2.1 — hårdare assistance belönas)', () => {
  it('Full är neutral (×1.0 båda hållen)', () => {
    expect(ASSIST_DIRECTION_MULT.full).toEqual({ improve: 1.0, worsen: 1.0 });
  });
  it('Standard: improve ×1.2, worsen ×0.8', () => {
    expect(ASSIST_DIRECTION_MULT.standard).toEqual({ improve: 1.2, worsen: 0.8 });
  });
  it('Minimal: improve ×1.3, worsen ×0.6', () => {
    expect(ASSIST_DIRECTION_MULT.minimal).toEqual({ improve: 1.3, worsen: 0.6 });
  });
});

describe('applyGameResult (§2.1 — stackad delta, per kategori)', () => {
  it('trimmar den spelade kategorins fönster till senaste 10 svar', () => {
    let p = emptyHcpProgress();
    p = applyGameResult(p, 'Music', 'full', Array(25).fill(true), ERA, ISO);
    expect(p.categories.Music.windows.full.length).toBe(HCP_WINDOW_SIZE);
    expect(p.categories.Music.lastPlayedISO).toBe(ISO);
  });

  it('rör bara den spelade kategorins (och nivåns) fönster', () => {
    let p = emptyHcpProgress();
    p = applyGameResult(p, 'Music', 'standard', [true, false], ERA, ISO);
    expect(p.categories.Music.windows.standard.length).toBe(2);
    expect(p.categories.Music.windows.full).toEqual([]);
    // Film helt orörd.
    expect(p.categories.Film).toEqual(emptyCategoryProgress());
  });

  it('10/10 FULL vid HCP 99, era 15 → −4 × 1.0 × 1.0 × 1.0 = −4.0', () => {
    const p = progress(cat(99, { full: win(9, 9) }));
    const next = applyGameResult(p, 'Music', 'full', [true], ERA, ISO); // fönster → 10/10
    expect(next.categories.Music.hcp).toBeCloseTo(95.0, 5);
    expect(next.categories.Film.hcp).toBe(99);
  });

  it('assist-improve-mult (high): STANDARD ×1.2, MINIMAL ×1.3', () => {
    const std = progress(cat(99, { standard: win(9, 9) }));
    expect(applyGameResult(std, 'Music', 'standard', [true], ERA, ISO).categories.Music.hcp).toBeCloseTo(93.0, 5); // −5×1.2
    const min = progress(cat(99, { minimal: win(9, 9) }));
    expect(applyGameResult(min, 'Music', 'minimal', [true], ERA, ISO).categories.Music.hcp).toBeCloseTo(91.2, 5); // −6×1.3
  });

  it('kontinuerligt glidande: sänker igen nästa spel (mid-tier ×0.7)', () => {
    let p = progress(cat(50, { full: win(9, 9) }));
    p = applyGameResult(p, 'Music', 'full', [true], ERA, ISO); // −4 × 0.7 = −2.8
    expect(p.categories.Music.hcp).toBeCloseTo(47.2, 5);
    p = applyGameResult(p, 'Music', 'full', [true], ERA, ISO);
    expect(p.categories.Music.hcp).toBeCloseTo(44.4, 5);
  });

  it('worsen-mult (mid): STANDARD +4×0.7×0.8, MINIMAL +3×0.7×0.6', () => {
    const std = progress(cat(50, { standard: win(0, 9) }));
    expect(applyGameResult(std, 'Music', 'standard', [false], ERA, ISO).categories.Music.hcp).toBeCloseTo(52.24, 5);
    const min = progress(cat(50, { minimal: win(0, 9) }));
    expect(applyGameResult(min, 'Music', 'minimal', [false], ERA, ISO).categories.Music.hcp).toBeCloseTo(51.26, 5);
  });

  it('era-bredd skalar deltat: 10/10 FULL @99 era 30 → −4 × 2.0 = −8.0', () => {
    const p = progress(cat(99, { full: win(9, 9) }));
    const next = applyGameResult(p, 'Music', 'full', [true], 30, ISO);
    expect(next.categories.Music.hcp).toBeCloseTo(91.0, 5);
  });

  it('per-game-cap: 10/10 MINIMAL @99 era 45 → −23.4 cappat till −10', () => {
    const p = progress(cat(99, { minimal: win(9, 9) }));
    const next = applyGameResult(p, 'Music', 'minimal', [true], 45, ISO); // −6×1.0×3.0×1.3 = −23.4
    expect(next.categories.Music.hcp).toBeCloseTo(89.0, 5);
  });

  it('klampar HCP till [1, 99]', () => {
    const atFloor = progress(cat(1, { full: win(9, 9) }));
    expect(applyGameResult(atFloor, 'Music', 'full', [true], ERA, ISO).categories.Music.hcp).toBe(1);
    const atCap = progress(cat(99, { full: win(0, 9) }));
    expect(applyGameResult(atCap, 'Music', 'full', [false], ERA, ISO).categories.Music.hcp).toBe(99);
  });
});

describe('applyInactivityDecay (§2.4 — +0.25 per hel vecka, oberoende per kategori)', () => {
  const start = new Date('2026-01-01T00:00:00.000Z');
  const base = () => progress(cat(40, undefined, start.toISOString()));

  it('no-op om ingen kategori spelats', () => {
    const p = emptyHcpProgress();
    expect(applyInactivityDecay(p, new Date('2026-06-01T00:00:00.000Z'))).toEqual(p);
  });

  it('no-op om < 1 vecka passerat', () => {
    const now = new Date('2026-01-06T00:00:00.000Z'); // 5 dygn
    expect(applyInactivityDecay(base(), now).categories.Music.hcp).toBe(40);
  });

  it('+0.25 per hel 7-dagarsperiod på DEN spelade kategorin, inte de andra', () => {
    const now = new Date('2026-01-22T00:00:00.000Z'); // 21 dygn = 3 veckor
    const out = applyInactivityDecay(base(), now);
    expect(out.categories.Music.hcp).toBeCloseTo(40.75, 5);
    // Film har lastPlayedISO=null → orörd.
    expect(out.categories.Film.hcp).toBe(99);
  });

  it('decayar kategorier oberoende mot sina egna klockor', () => {
    const p = progress(
      cat(40, undefined, start.toISOString()),
      cat(50, undefined, new Date('2026-01-15T00:00:00.000Z').toISOString()),
    );
    const now = new Date('2026-01-22T00:00:00.000Z');
    const out = applyInactivityDecay(p, now);
    expect(out.categories.Music.hcp).toBeCloseTo(40.75, 5); // 3 veckor
    expect(out.categories.Film.hcp).toBeCloseTo(50.25, 5); // 1 vecka
  });

  it('flyttar kategorins lastPlayedISO framåt med hela perioder (ej till now)', () => {
    const now = new Date('2026-01-10T00:00:00.000Z'); // 9 dygn = 1 vecka + 2 dygn
    const out = applyInactivityDecay(base(), now);
    expect(out.categories.Music.hcp).toBeCloseTo(40.25, 5);
    expect(out.categories.Music.lastPlayedISO).toBe('2026-01-08T00:00:00.000Z');
    expect(applyInactivityDecay(out, now).categories.Music.hcp).toBeCloseTo(40.25, 5);
  });

  it('klampar vid 99', () => {
    const near = progress(cat(98.5, undefined, start.toISOString()));
    const now = new Date('2026-03-01T00:00:00.000Z');
    expect(applyInactivityDecay(near, now).categories.Music.hcp).toBe(99);
  });
});

describe('resolveDisplayHcp (§1.1 — fallback 99, avrundat uppåt)', () => {
  it('faller tillbaka på 99 när inget sparat värde finns', () => {
    expect(resolveDisplayHcp(undefined)).toBe(99);
    expect(resolveDisplayHcp(null)).toBe(99);
  });
  it('visar det sparade värdet avrundat uppåt', () => {
    expect(resolveDisplayHcp(40)).toBe(40);
    expect(resolveDisplayHcp(40.25)).toBe(41);
  });
});

describe('hcpRecognitionLowerBound (§4.1 — item-golv per spelar-HCP-nivå)', () => {
  it('HCP ≥ 80 → golv 10 (övre gränsen 80 inklusive)', () => {
    expect(hcpRecognitionLowerBound(99)).toBe(10);
    expect(hcpRecognitionLowerBound(80)).toBe(10);
  });
  it('HCP 60–79 → golv 8', () => {
    expect(hcpRecognitionLowerBound(79)).toBe(8);
    expect(hcpRecognitionLowerBound(60)).toBe(8);
  });
  it('HCP 40–59 → golv 6', () => {
    expect(hcpRecognitionLowerBound(59)).toBe(6);
    expect(hcpRecognitionLowerBound(40)).toBe(6);
  });
  it('HCP 20–39 → golv 4', () => {
    expect(hcpRecognitionLowerBound(39)).toBe(4);
    expect(hcpRecognitionLowerBound(20)).toBe(4);
  });
  it('HCP < 20 → golv 0 (alla items)', () => {
    expect(hcpRecognitionLowerBound(19)).toBe(0);
    expect(hcpRecognitionLowerBound(1)).toBe(0);
  });
  it('nivågränserna är >= (80 → 10, 79 → 8)', () => {
    expect(hcpRecognitionLowerBound(80)).toBe(10);
    expect(hcpRecognitionLowerBound(79)).toBe(8);
  });
});

describe('filterByItemHcp (§4.1 — ensidigt golv itemHcp ≥ lowerBound(HCP), övre alltid 100)', () => {
  const mk = (itemHcp: number) => ({ itemHcp });
  const many = (itemHcp: number, n: number) => Array.from({ length: n }, () => mk(itemHcp));
  // En item per Item-HCP 1..100 (100 st) — låter oss läsa golvet exakt.
  const spread = () => Array.from({ length: 100 }, (_, i) => mk(i + 1));
  const bounds = (out: { itemHcp: number }[]) => {
    const vs = out.map((q) => q.itemHcp);
    return [Math.min(...vs), Math.max(...vs)] as const;
  };

  it('returnerar hela poolen orörd om den redan är <= minCount', () => {
    const pool = [mk(50), mk(60)];
    expect(filterByItemHcp(pool, 99, 5)).toBe(pool);
  });

  // Golvmappningen (minCount lågt så liten-katalog-tröskeln inte slår in). spread saknar
  // itemHcp 0, så golv 0 → övre observerade = 100, nedre = 1 (lägsta item i spread).
  it('HCP 99 → itemHcp 10–100', () => {
    expect(bounds(filterByItemHcp(spread(), 99, 1))).toEqual([10, 100]);
  });
  it('HCP 80 → itemHcp 10–100', () => {
    expect(bounds(filterByItemHcp(spread(), 80, 1))).toEqual([10, 100]);
  });
  it('HCP 79 → itemHcp 8–100', () => {
    expect(bounds(filterByItemHcp(spread(), 79, 1))).toEqual([8, 100]);
  });
  it('HCP 60 → itemHcp 8–100', () => {
    expect(bounds(filterByItemHcp(spread(), 60, 1))).toEqual([8, 100]);
  });
  it('HCP 59 → itemHcp 6–100', () => {
    expect(bounds(filterByItemHcp(spread(), 59, 1))).toEqual([6, 100]);
  });
  it('HCP 40 → itemHcp 6–100', () => {
    expect(bounds(filterByItemHcp(spread(), 40, 1))).toEqual([6, 100]);
  });
  it('HCP 39 → itemHcp 4–100', () => {
    expect(bounds(filterByItemHcp(spread(), 39, 1))).toEqual([4, 100]);
  });
  it('HCP 20 → itemHcp 4–100', () => {
    expect(bounds(filterByItemHcp(spread(), 20, 1))).toEqual([4, 100]);
  });
  it('HCP 19 → itemHcp 1–100 (golv 0 släpper in allt i spread)', () => {
    expect(bounds(filterByItemHcp(spread(), 19, 1))).toEqual([1, 100]);
  });
  it('HCP 1 → itemHcp 1–100', () => {
    expect(bounds(filterByItemHcp(spread(), 1, 1))).toEqual([1, 100]);
  });

  it('de mest obskyra items (itemHcp 0) släpps bara in under HCP 20', () => {
    const pool = [mk(0), ...many(50, 20)];
    // HCP 99 (golv 10) → itemHcp-0 exkluderas
    expect(filterByItemHcp(pool, 99, 1).some((q) => q.itemHcp === 0)).toBe(false);
    // HCP 19 (golv 0) → itemHcp-0 ingår
    expect(filterByItemHcp(pool, 19, 1).some((q) => q.itemHcp === 0)).toBe(true);
  });

  it('nybörjare (HCP 99, golv 10) utesluter de svåraste (lägst itemHcp) items', () => {
    const pool = [...many(90, 10), ...many(5, 10)];
    const out = filterByItemHcp(pool, 99, 5);
    expect(out.every((q) => q.itemHcp >= 10)).toBe(true);
    expect(out.length).toBe(10);
  });

  it('saknat itemHcp behandlas som 100 (alltid inom bandet)', () => {
    const pool: { itemHcp?: number }[] = Array.from({ length: 20 }, () => ({}));
    expect(filterByItemHcp(pool, 99, 5).length).toBe(20);
  });

  it('faller tillbaka på hela poolen om golvet ger tomt band', () => {
    // Alla items itemHcp 5, HCP 99 → golv 10 → inget kvalar → hela poolen.
    const pool = many(5, 20);
    const out = filterByItemHcp(pool, 99, 5);
    expect(out).toBe(pool);
  });
});

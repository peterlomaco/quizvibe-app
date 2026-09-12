import { describe, it, expect } from 'vitest';
import {
  applyGameResult,
  applyInactivityDecay,
  clampHcp,
  displayHcp,
  emptyCategoryProgress,
  emptyHcpProgress,
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

describe('evaluateWindow (§2.1 — råa signerade steg, okapat)', () => {
  it('kräver ett FULLT fönster (20 svar) innan något steg', () => {
    expect(evaluateWindow(win(0, 19), 'full')).toBe(0);
    expect(evaluateWindow(win(19, 19), 'full')).toBe(0);
  });
  it('Full: ett steg per svar förbi tröskeln (12/18)', () => {
    expect(evaluateWindow(win(18), 'full')).toBe(-1);
    expect(evaluateWindow(win(19), 'full')).toBe(-2);
    expect(evaluateWindow(win(20), 'full')).toBe(-3);
    expect(evaluateWindow(win(12), 'full')).toBe(1);
    expect(evaluateWindow(win(11), 'full')).toBe(2);
    expect(evaluateWindow(win(0), 'full')).toBe(13);
    expect(evaluateWindow(win(13), 'full')).toBe(0);
    expect(evaluateWindow(win(17), 'full')).toBe(0);
  });
  it('Standard: (10/16)', () => {
    expect(evaluateWindow(win(16), 'standard')).toBe(-1);
    expect(evaluateWindow(win(20), 'standard')).toBe(-5);
    expect(evaluateWindow(win(10), 'standard')).toBe(1);
    expect(evaluateWindow(win(0), 'standard')).toBe(11);
    expect(evaluateWindow(win(11), 'standard')).toBe(0);
    expect(evaluateWindow(win(15), 'standard')).toBe(0);
  });
  it('Minimal: (8/14)', () => {
    expect(evaluateWindow(win(14), 'minimal')).toBe(-1);
    expect(evaluateWindow(win(20), 'minimal')).toBe(-7);
    expect(evaluateWindow(win(8), 'minimal')).toBe(1);
    expect(evaluateWindow(win(0), 'minimal')).toBe(9);
    expect(evaluateWindow(win(9), 'minimal')).toBe(0);
    expect(evaluateWindow(win(13), 'minimal')).toBe(0);
  });
});

describe('hcpTier / hcpTierFactor (steg-faktor per HCP-nivå)', () => {
  it('>60 → high/0.75', () => {
    expect(hcpTier(99)).toBe('high');
    expect(hcpTier(61)).toBe('high');
    expect(hcpTierFactor(99)).toBe(0.75);
    expect(hcpTierFactor(61)).toBe(0.75);
  });
  it('30–60 → mid/0.5 (gränserna 60 och 30 inklusive)', () => {
    expect(hcpTier(60)).toBe('mid');
    expect(hcpTier(30)).toBe('mid');
    expect(hcpTierFactor(60)).toBe(0.5);
    expect(hcpTierFactor(30)).toBe(0.5);
  });
  it('1–29 → low/0.25', () => {
    expect(hcpTier(29)).toBe('low');
    expect(hcpTier(1)).toBe('low');
    expect(hcpTierFactor(29)).toBe(0.25);
    expect(hcpTierFactor(1)).toBe(0.25);
  });
});

describe('applyGameResult (§2.1 — per kategori)', () => {
  it('trimmar den spelade kategorins fönster till senaste 20 svar', () => {
    let p = emptyHcpProgress();
    p = applyGameResult(p, 'Music', 'full', Array(25).fill(true), ISO);
    expect(p.categories.Music.windows.full.length).toBe(HCP_WINDOW_SIZE);
    expect(p.categories.Music.lastPlayedISO).toBe(ISO);
  });

  it('rör bara den spelade kategorins (och nivåns) fönster', () => {
    let p = emptyHcpProgress();
    p = applyGameResult(p, 'Music', 'standard', [true, false], ISO);
    expect(p.categories.Music.windows.standard.length).toBe(2);
    expect(p.categories.Music.windows.full).toEqual([]);
    // Film helt orörd.
    expect(p.categories.Film).toEqual(emptyCategoryProgress());
  });

  it('20/20 FULL vid HCP 99 → −3 × 0.75 = −2.25 (nedåt okapat)', () => {
    const p = progress(cat(99, { full: win(19, 19) }));
    const next = applyGameResult(p, 'Music', 'full', [true], ISO); // fönster → 20/20
    expect(next.categories.Music.hcp).toBeCloseTo(96.75, 5);
    // Övriga kategorier oförändrade.
    expect(next.categories.Film.hcp).toBe(99);
  });

  it('kontinuerligt glidande: sänker igen nästa spel (mid-tier ×0.5)', () => {
    let p = progress(cat(50, { full: win(20) }));
    p = applyGameResult(p, 'Music', 'full', [true], ISO); // −3 × 0.5 = −1.5
    expect(p.categories.Music.hcp).toBeCloseTo(48.5, 5);
    p = applyGameResult(p, 'Music', 'full', [true], ISO);
    expect(p.categories.Music.hcp).toBeCloseTo(47.0, 5);
  });

  it('uppåt-cappen biter: 0/20 MINIMAL vid HCP 40 → +9×0.5=+4.5 cappat till mid +2.0', () => {
    const p = progress(cat(40, { minimal: win(0, 19) }));
    const next = applyGameResult(p, 'Music', 'minimal', [false], ISO);
    expect(next.categories.Music.hcp).toBeCloseTo(42.0, 5);
  });

  it('uppåt-cappen per tier (FULL): high +5, mid +3.5', () => {
    const high = progress(cat(70, { full: win(0, 19) }));
    expect(applyGameResult(high, 'Music', 'full', [false], ISO).categories.Music.hcp).toBeCloseTo(75, 5); // +9.75 → cap +5
    const mid = progress(cat(50, { full: win(0, 19) }));
    expect(applyGameResult(mid, 'Music', 'full', [false], ISO).categories.Music.hcp).toBeCloseTo(53.5, 5); // +6.5 → cap +3.5
  });

  it('uppåt-cappen (STANDARD low): 0/20 vid HCP 20 → +2.75 cappat till +1.25', () => {
    const p = progress(cat(20, { standard: win(0, 19) }));
    const next = applyGameResult(p, 'Music', 'standard', [false], ISO);
    expect(next.categories.Music.hcp).toBeCloseTo(21.25, 5);
  });

  it('positiv delta under cappen är orörd: FULL 11/20 vid HCP 70 → +2×0.75 = +1.5', () => {
    const p = progress(cat(70, { full: win(11, 19) }));
    const next = applyGameResult(p, 'Music', 'full', [false], ISO); // fönster → 11/20
    expect(next.categories.Music.hcp).toBeCloseTo(71.5, 5);
  });

  it('klampar HCP till [1, 99]', () => {
    const atFloor = progress(cat(1, { full: win(20) }));
    expect(applyGameResult(atFloor, 'Music', 'full', [true], ISO).categories.Music.hcp).toBe(1);
    const atCap = progress(cat(99, { full: win(0, 19) }));
    expect(applyGameResult(atCap, 'Music', 'full', [false], ISO).categories.Music.hcp).toBe(99);
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

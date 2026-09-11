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

describe('evaluateWindow (§2.1 — trösklar per nivå)', () => {
  it('kräver ett FULLT fönster (20 svar) innan något steg', () => {
    expect(evaluateWindow(win(0, 19), 'full')).toBe(0);
    expect(evaluateWindow(win(19, 19), 'full')).toBe(0);
  });
  it('Full: >=18 → −1, <=12 → +1, däremellan 0', () => {
    expect(evaluateWindow(win(18), 'full')).toBe(-1);
    expect(evaluateWindow(win(19), 'full')).toBe(-1);
    expect(evaluateWindow(win(12), 'full')).toBe(1);
    expect(evaluateWindow(win(0), 'full')).toBe(1);
    expect(evaluateWindow(win(13), 'full')).toBe(0);
    expect(evaluateWindow(win(17), 'full')).toBe(0);
  });
  it('Standard: >=16 → −1, <=10 → +1', () => {
    expect(evaluateWindow(win(16), 'standard')).toBe(-1);
    expect(evaluateWindow(win(10), 'standard')).toBe(1);
    expect(evaluateWindow(win(11), 'standard')).toBe(0);
    expect(evaluateWindow(win(15), 'standard')).toBe(0);
  });
  it('Minimal: >=14 → −1, <=8 → +1', () => {
    expect(evaluateWindow(win(14), 'minimal')).toBe(-1);
    expect(evaluateWindow(win(8), 'minimal')).toBe(1);
    expect(evaluateWindow(win(9), 'minimal')).toBe(0);
    expect(evaluateWindow(win(13), 'minimal')).toBe(0);
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

  it('sänker kategorins HCP med 1 när ett fullt fönster ligger över tröskeln', () => {
    const p = progress(cat(99, { full: win(19, 19) }));
    const next = applyGameResult(p, 'Music', 'full', [true], ISO); // 20/20 ≥ 18 → −1
    expect(next.categories.Music.hcp).toBe(98);
    // Övriga kategorier oförändrade.
    expect(next.categories.Film.hcp).toBe(99);
  });

  it('kontinuerligt glidande: kan sänka igen nästa spel (ingen reset)', () => {
    let p = progress(cat(50, { full: win(20) }));
    p = applyGameResult(p, 'Music', 'full', [true], ISO);
    expect(p.categories.Music.hcp).toBe(49);
    p = applyGameResult(p, 'Music', 'full', [true], ISO);
    expect(p.categories.Music.hcp).toBe(48);
  });

  it('höjer kategorins HCP med 1 när ett fullt fönster ligger under tröskeln (max +1/spel)', () => {
    const p = progress(cat(40, { minimal: win(0, 19) }));
    const next = applyGameResult(p, 'Music', 'minimal', [false], ISO); // 0/20 ≤ 8 → +1
    expect(next.categories.Music.hcp).toBe(41);
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

describe('filterByItemHcp (§4.1 — tvåsidigt band [max(1,HCP−20), min(100,HCP+80)] + variety-floor)', () => {
  const mk = (itemHcp: number) => ({ itemHcp });
  const many = (itemHcp: number, n: number) => Array.from({ length: n }, () => mk(itemHcp));
  // En item per Item-HCP 1..100 (100 st) — låter oss läsa bandets exakta gränser.
  const spread = () => Array.from({ length: 100 }, (_, i) => mk(i + 1));
  const bounds = (out: { itemHcp: number }[]) => {
    const vs = out.map((q) => q.itemHcp);
    return [Math.min(...vs), Math.max(...vs)] as const;
  };

  it('returnerar hela poolen orörd om den redan är <= minCount', () => {
    const pool = [mk(50), mk(60)];
    expect(filterByItemHcp(pool, 99, 5)).toBe(pool);
  });

  // Bandmappningen (minCount lågt så variety-floor inte vidgar): övre = min(100,HCP+80).
  it('HCP 99 → itemHcp 79–100', () => {
    expect(bounds(filterByItemHcp(spread(), 99, 1))).toEqual([79, 100]);
  });
  it('HCP 98 → itemHcp 78–100', () => {
    expect(bounds(filterByItemHcp(spread(), 98, 1))).toEqual([78, 100]);
  });
  it('HCP 20 → itemHcp 1–100 (nedre bottnar på 1)', () => {
    expect(bounds(filterByItemHcp(spread(), 20, 1))).toEqual([1, 100]);
  });
  it('HCP 19 → itemHcp 1–99 (övre börjar sjunka)', () => {
    expect(bounds(filterByItemHcp(spread(), 19, 1))).toEqual([1, 99]);
  });
  it('HCP 1 → itemHcp 1–81', () => {
    expect(bounds(filterByItemHcp(spread(), 1, 1))).toEqual([1, 81]);
  });

  it('nybörjare (HCP 99) utesluter de svåraste (lägst itemHcp) items', () => {
    const pool = [...many(90, 10), ...many(40, 10)];
    const out = filterByItemHcp(pool, 99, 5);
    expect(out.every((q) => q.itemHcp >= 79)).toBe(true);
    expect(out.length).toBe(10);
  });

  it('variety-floor: vidgar NEDRE kanten nedåt när bandet är för tunt (övre fast)', () => {
    // HCP 99 → band 79–100. Bara 4 items i bandet, resten på 60. minCount 10 →
    // nedre vidgas 79 → 69 → 59 tills ≥10 kvalar; övre står kvar på 100.
    const pool = [...many(90, 4), ...many(60, 20)];
    const out = filterByItemHcp(pool, 99, 10);
    expect(out.length).toBe(24); // 4 (90) + 20 (60), alla ≤ 100
    expect(bounds(out)[1]).toBe(90); // övre kanten (100) aldrig överskriden
  });

  it('saknat itemHcp behandlas som 100 (inom bandet för HCP ≥ 20)', () => {
    const pool: { itemHcp?: number }[] = Array.from({ length: 20 }, () => ({}));
    expect(filterByItemHcp(pool, 99, 5).length).toBe(20);
  });

  it('faller tillbaka på hela poolen om ens ett golv på 1 ger tomt band', () => {
    // Alla items itemHcp 5, HCP 99 → band 79–100 tomt; vidga nedre till 1 → fortf.
    // tomt (5 < 79-övre? nej: 5 <= upper 100 men 5 >= lower? lower bottnar på 1 → 5>=1 OK).
    // Använd items ÖVER övre kanten i stället (HCP 1 → övre 81; items 90 utanför).
    const pool = many(90, 20);
    const out = filterByItemHcp(pool, 1, 15); // band 1–81, inga 90:or → tomt → hela poolen
    expect(out).toBe(pool);
  });
});

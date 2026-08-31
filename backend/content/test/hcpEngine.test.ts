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

// Full progress: Music styrs, Film/Sport default 99 (orörda).
function progress(music: CategoryProgress, film = emptyCategoryProgress(), sport = emptyCategoryProgress()): HcpProgress {
  return { categories: { Music: music, Film: film, Sport: sport } };
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
    for (const c of [p.categories.Music, p.categories.Film, p.categories.Sport]) {
      expect(c.hcp).toBe(99);
      expect(c.windows.full).toEqual([]);
      expect(c.windows.standard).toEqual([]);
      expect(c.windows.minimal).toEqual([]);
      expect(c.lastPlayedISO).toBeNull();
    }
  });
});

describe('totalHcp / resolveDisplayTotalHcp (§1.3 — snitt av 3 kategorier)', () => {
  it('total = snittet av de tre kategoriernas float-HCP', () => {
    const p = progress(cat(40), cat(41), cat(42));
    expect(totalHcp(p)).toBeCloseTo(41, 5);
    expect(resolveDisplayTotalHcp(p)).toBe(41); // 41 ceil = 41
  });
  it('avrundar total uppåt', () => {
    const p = progress(cat(40), cat(41), cat(41)); // snitt 40.6667
    expect(resolveDisplayTotalHcp(p)).toBe(41);
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
    // Film + Sport helt orörda.
    expect(p.categories.Film).toEqual(emptyCategoryProgress());
    expect(p.categories.Sport).toEqual(emptyCategoryProgress());
  });

  it('sänker kategorins HCP med 1 när ett fullt fönster ligger över tröskeln', () => {
    const p = progress(cat(99, { full: win(19, 19) }));
    const next = applyGameResult(p, 'Music', 'full', [true], ISO); // 20/20 ≥ 18 → −1
    expect(next.categories.Music.hcp).toBe(98);
    // Övriga kategorier oförändrade.
    expect(next.categories.Film.hcp).toBe(99);
    expect(next.categories.Sport.hcp).toBe(99);
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
    // Film/Sport har lastPlayedISO=null → orörda.
    expect(out.categories.Film.hcp).toBe(99);
    expect(out.categories.Sport.hcp).toBe(99);
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

describe('filterByItemHcp (§4.1 — progressiv relaxering)', () => {
  const mk = (itemHcp: number) => ({ itemHcp });
  const many = (itemHcp: number, n: number) => Array.from({ length: n }, () => mk(itemHcp));

  it('returnerar hela poolen orörd om den redan är <= minCount', () => {
    const pool = [mk(50), mk(60)];
    expect(filterByItemHcp(pool, 99, 5)).toBe(pool);
  });

  it('behåller items med itemHcp >= playerHcp när det räcker', () => {
    const pool = [...many(96, 10), ...many(60, 10)];
    const out = filterByItemHcp(pool, 95, 5);
    expect(out.every((q) => q.itemHcp >= 95)).toBe(true);
    expect(out.length).toBe(10);
  });

  it('relaxar golvet nedåt när för få items matchar playerHcp (99 → 79)', () => {
    const pool = many(80, 30);
    const out = filterByItemHcp(pool, 99, 10);
    expect(out.length).toBe(30);
  });

  it('expert (lågt HCP) får hela poolen (allt >= lågt golv)', () => {
    const pool = Array.from({ length: 30 }, (_, i) => mk(50 + i)); // 50–79
    expect(filterByItemHcp(pool, 20, 10).length).toBe(30);
  });

  it('saknat itemHcp behandlas som 100 (lättast, alltid med)', () => {
    const pool: { itemHcp?: number }[] = Array.from({ length: 20 }, () => ({}));
    expect(filterByItemHcp(pool, 99, 5).length).toBe(20);
  });

  it('faller tillbaka på hela poolen om ens lågt golv ger för få', () => {
    const pool = many(5, 20);
    const out = filterByItemHcp(pool, 99, 15);
    expect(out).toBe(pool);
  });
});

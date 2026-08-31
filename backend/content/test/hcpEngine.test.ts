import { describe, it, expect } from 'vitest';
import {
  applyGameResult,
  applyInactivityDecay,
  clampHcp,
  displayHcp,
  emptyHcpProgress,
  evaluateWindow,
  filterByItemHcp,
  HCP_START,
  HCP_WINDOW_SIZE,
  resolveDisplayHcp,
  type HcpProgress,
  type HcpWindow,
} from '../../../src/utils/hcpEngine';

// Hjälpare: ett fönster med `nCorrect` rätt av `size` svar (resten fel).
function win(nCorrect: number, size = HCP_WINDOW_SIZE): HcpWindow {
  return Array.from({ length: size }, (_, i) => i < nCorrect);
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

describe('emptyHcpProgress (§1.1 — alla startar på 99)', () => {
  it('startar på HCP_START med tomma fönster', () => {
    const p = emptyHcpProgress();
    expect(HCP_START).toBe(99);
    expect(p.hcp).toBe(99);
    expect(p.windows.full).toEqual([]);
    expect(p.windows.standard).toEqual([]);
    expect(p.windows.minimal).toEqual([]);
    expect(p.lastPlayedISO).toBeNull();
  });
});

describe('evaluateWindow (§2.1 — trösklar per nivå)', () => {
  it('kräver ett FULLT fönster (20 svar) innan något steg', () => {
    // 19 svar, alla fel → skulle annars ge +1, men fönstret är inte fullt.
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

describe('applyGameResult (§2.1)', () => {
  it('trimmar fönstret till senaste 20 svar', () => {
    let p = emptyHcpProgress();
    // 25 svar → bara de sista 20 behålls.
    p = applyGameResult(p, 'full', Array(25).fill(true), ISO);
    expect(p.windows.full.length).toBe(HCP_WINDOW_SIZE);
    expect(p.lastPlayedISO).toBe(ISO);
  });

  it('rör bara den spelade nivåns fönster', () => {
    let p = emptyHcpProgress();
    p = applyGameResult(p, 'standard', [true, false], ISO);
    expect(p.windows.standard.length).toBe(2);
    expect(p.windows.full).toEqual([]);
    expect(p.windows.minimal).toEqual([]);
  });

  it('sänker HCP med 1 när ett fullt fönster ligger över tröskeln', () => {
    // Seed: 19 rätt redan i fönstret, lägg ett rätt till → 20 rätt ≥ 18 → −1.
    const seeded: HcpProgress = {
      hcp: 99,
      windows: { full: win(19, 19), standard: [], minimal: [] },
      lastPlayedISO: null,
    };
    const next = applyGameResult(seeded, 'full', [true], ISO);
    expect(next.hcp).toBe(98);
  });

  it('kontinuerligt glidande: kan sänka igen nästa spel (ingen reset)', () => {
    // Full window av idel rätt → −1 varje gång ett nytt rätt-svar kommer in.
    let p: HcpProgress = {
      hcp: 50,
      windows: { full: win(20), standard: [], minimal: [] },
      lastPlayedISO: null,
    };
    p = applyGameResult(p, 'full', [true], ISO); // fortfarande 20/20
    expect(p.hcp).toBe(49);
    p = applyGameResult(p, 'full', [true], ISO);
    expect(p.hcp).toBe(48);
  });

  it('höjer HCP med 1 när ett fullt fönster ligger under tröskeln (max +1/spel)', () => {
    const seeded: HcpProgress = {
      hcp: 40,
      windows: { minimal: win(0, 19), standard: [], full: [] },
      lastPlayedISO: null,
    };
    const next = applyGameResult(seeded, 'minimal', [false], ISO); // 0/20 ≤ 8 → +1
    expect(next.hcp).toBe(41);
  });

  it('klampar HCP till [1, 99]', () => {
    const atFloor: HcpProgress = {
      hcp: 1,
      windows: { full: win(20), standard: [], minimal: [] },
      lastPlayedISO: null,
    };
    expect(applyGameResult(atFloor, 'full', [true], ISO).hcp).toBe(1);
    const atCap: HcpProgress = {
      hcp: 99,
      windows: { full: win(0, 19), standard: [], minimal: [] },
      lastPlayedISO: null,
    };
    expect(applyGameResult(atCap, 'full', [false], ISO).hcp).toBe(99);
  });
});

describe('applyInactivityDecay (§2.4 — +0.25 per hel vecka)', () => {
  const start = new Date('2026-01-01T00:00:00.000Z');
  const base: HcpProgress = {
    hcp: 40,
    windows: { full: [], standard: [], minimal: [] },
    lastPlayedISO: start.toISOString(),
  };

  it('no-op om aldrig spelat', () => {
    const p = { ...base, lastPlayedISO: null };
    expect(applyInactivityDecay(p, new Date('2026-06-01T00:00:00.000Z'))).toBe(p);
  });

  it('no-op om < 1 vecka passerat', () => {
    const now = new Date('2026-01-06T00:00:00.000Z'); // 5 dygn
    expect(applyInactivityDecay(base, now).hcp).toBe(40);
  });

  it('+0.25 per hel 7-dagarsperiod', () => {
    const now = new Date('2026-01-22T00:00:00.000Z'); // 21 dygn = 3 veckor
    const out = applyInactivityDecay(base, now);
    expect(out.hcp).toBeCloseTo(40.75, 5);
  });

  it('flyttar lastPlayedISO framåt med hela perioder (ej till now) så resten bevaras', () => {
    const now = new Date('2026-01-10T00:00:00.000Z'); // 9 dygn = 1 vecka + 2 dygn
    const out = applyInactivityDecay(base, now);
    expect(out.hcp).toBeCloseTo(40.25, 5);
    // lastPlayed ska ha flyttats exakt 7 dygn framåt, inte 9.
    expect(out.lastPlayedISO).toBe('2026-01-08T00:00:00.000Z');
    // En andra körning direkt efteråt ska inte lägga till mer (resten < 1 vecka).
    expect(applyInactivityDecay(out, now).hcp).toBeCloseTo(40.25, 5);
  });

  it('klampar vid 99', () => {
    const near: HcpProgress = { ...base, hcp: 98.5 };
    const now = new Date('2026-03-01T00:00:00.000Z'); // många veckor
    expect(applyInactivityDecay(near, now).hcp).toBe(99);
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
    // Alla items på 80; spelare 99 → inga >=99/89 → relaxa till 79 → alla med.
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
    // Items på itemHcp 5 (under lägsta testade golvet ~9) → aldrig nog → hela.
    const pool = many(5, 20);
    const out = filterByItemHcp(pool, 99, 15);
    expect(out).toBe(pool);
  });
});

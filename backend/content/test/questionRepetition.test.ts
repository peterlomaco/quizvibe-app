// Tester för "ingen repris inom 20 spel" (Peter 2026-08-16).
//
// Bakgrund: en spelare född 2000 (gen-z) körde två spel i rad med Game Era
// 1950–1980 och fick Elvis Presley båda gångerna. Historiken var INTE trasig —
// audience-filtret kollapsade poolen till EN spelbar Music-fråga innan
// historiken ens konsulterades, och kategori-allokeringen gav Music exakt ett
// block per spel. Testerna nedan låser de fyra mekanismerna som tillsammans
// gör reprisen omöjlig:
//
//   1. pickTiered            — färskhet före slump (guest-hostade spel).
//   2. allocateCategoryBlocks — en 1-frågas-kategori får inte äga sin fulla andel.
//   3. fallbackQuestion       — färska epoker vinner lånet över inaktuella.
//   4. 20-spelssimulering     — hela kedjan, plus era-invarianten.
//
// Ligger i backend-sviten (enda vitest-harnessen i repot) men testar
// klient-modulerna under src/utils.

import { describe, it, expect } from 'vitest';
import {
  allocateCategoryBlocks,
  buildEpochPhase,
  emptyEpochDebt,
  getActiveEpochs,
  pickTiered,
  planEpochSequence,
  sequenceToQuotas,
  type CategoryCapacity,
  type EpochQuestion,
} from '../../../src/utils/epochAllocation';

// ─── Fixtures ──────────────────────────────────────────────────────────────

interface Q extends EpochQuestion {
  id: string;
  correctYear: number;
  mainCategory: string;
}

const ERA_FROM = 1950;
const ERA_TO = 1980;
const ERA = getActiveEpochs(ERA_FROM, ERA_TO);

function makeQuestions(cat: string, count: number, from = ERA_FROM, to = ERA_TO): Q[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${cat}-${i}`,
    // Sprid jämnt över era-fönstret så båda epokerna (E1 ≤1964, E2 1965–80) fylls.
    correctYear: from + (i % (to - from + 1)),
    mainCategory: cat,
  }));
}

const getYear = (q: Q) => q.correctYear;
const ids = (qs: Q[]) => qs.map((q) => q.id);

// Spegel av buildCategoryAlignedPhase i app/quiz.tsx — quiz.tsx är en
// React-skärm som inte går att importera i node. Håll i synk med originalet
// (samma mönster som shuffleBlocks-spegeln i epochAllocation.test.ts).
function categoryAlignedPhase(opts: {
  pool: Q[];
  totalBlocks: number;
  questionsPerBlock: number;
  recentIds: Set<string>;
  lastSessionIds: Set<string>;
  epochSequence?: ReturnType<typeof planEpochSequence>['sequence'];
  capacityCap: boolean; // false = gamla lika-vikt-beteendet (invers-kontrollen)
}): Q[] {
  const { pool, totalBlocks, questionsPerBlock, recentIds, lastSessionIds, epochSequence, capacityCap } = opts;
  const totalQuestions = totalBlocks * questionsPerBlock;
  if (totalQuestions === 0 || pool.length === 0) return [];

  const catMap = new Map<string, Q[]>();
  for (const q of pool) {
    const key = q.mainCategory ?? '_other';
    if (!catMap.has(key)) catMap.set(key, []);
    catMap.get(key)!.push(q);
  }
  const cats = [...catMap.keys()].sort(); // deterministisk ordning i test

  let blocksByCat: Record<string, number>;
  if (capacityCap) {
    const isFresh = (q: Q) => !recentIds.has(q.id) && !lastSessionIds.has(q.id);
    const capacity: Record<string, CategoryCapacity> = {};
    for (const c of cats) {
      const cp = catMap.get(c)!;
      capacity[c] = {
        fresh: Math.floor(cp.filter(isFresh).length / questionsPerBlock),
        total: Math.floor(cp.length / questionsPerBlock),
      };
    }
    blocksByCat = allocateCategoryBlocks(totalBlocks, cats, capacity);
  } else {
    // Gamla beteendet: lika vikt, ingen kapacitetskoll.
    const base = Math.floor(totalBlocks / cats.length);
    let rem = totalBlocks - base * cats.length;
    blocksByCat = {};
    for (const c of cats) {
      blocksByCat[c] = base + (rem > 0 ? 1 : 0);
      if (rem > 0) rem--;
    }
  }

  const result: Q[] = [];
  let seqCursor = 0;
  for (const c of cats) {
    const catBlocks = blocksByCat[c];
    if (catBlocks === 0) continue;
    const catQuestions = catBlocks * questionsPerBlock;
    const catSlice = epochSequence?.slice(seqCursor, seqCursor + catQuestions);
    seqCursor += catQuestions;
    const catSeq = buildEpochPhase<Q>({
      pool: catMap.get(c)!,
      totalQuestions: catQuestions,
      activeEpochs: ERA,
      recentIds,
      lastSessionIds,
      isPtP: false,
      players: [],
      turnOrderIds: [],
      getEpochYear: getYear,
      quotas: catSlice && catSlice.length > 0 ? sequenceToQuotas(catSlice) : undefined,
    });
    result.push(...catSeq.slice(0, Math.floor(catSeq.length / questionsPerBlock) * questionsPerBlock));
  }
  return result;
}

/** Kör `games` spel i rad med en rullande 20-sessions-historik. */
function runSeries(pool: Q[], games: number, roundsPerGame: number, capacityCap: boolean) {
  const sessions: string[][] = [];
  const perGame: Q[][] = [];
  let debt = emptyEpochDebt();

  for (let g = 0; g < games; g++) {
    const recentIds = new Set(sessions.flat());
    const lastSessionIds = new Set(sessions[sessions.length - 1] ?? []);
    const { sequence, nextDebt } = planEpochSequence(roundsPerGame, ERA, debt);
    debt = nextDebt;
    const picked = categoryAlignedPhase({
      pool,
      totalBlocks: roundsPerGame,
      questionsPerBlock: 1,
      recentIds,
      lastSessionIds,
      epochSequence: sequence,
      capacityCap,
    });
    perGame.push(picked);
    sessions.push(ids(picked));
    if (sessions.length > 20) sessions.shift();
  }
  return perGame;
}

// ─── 1. pickTiered ─────────────────────────────────────────────────────────

describe('pickTiered', () => {
  const pool = makeQuestions('Music', 6);
  const getId = (q: Q) => q.id;

  it('returns undefined for an empty pool', () => {
    expect(pickTiered<Q>([], new Set(), new Set(), getId)).toBeUndefined();
  });

  it('always picks a fresh item while any exists', () => {
    // Allt utom Music-5 är sett; Music-5 måste väljas varje gång.
    const recent = new Set(ids(pool.slice(0, 5)));
    for (let i = 0; i < 50; i++) {
      expect(pickTiered(pool, recent, new Set(), getId)!.id).toBe('Music-5');
    }
  });

  it('prefers older-seen over last-session when nothing is fresh', () => {
    const recent = new Set(ids(pool));
    const last = new Set(ids(pool.slice(0, 5))); // Music-5 sedd, men inte senast
    for (let i = 0; i < 50; i++) {
      expect(pickTiered(pool, recent, last, getId)!.id).toBe('Music-5');
    }
  });

  it('falls back to last-session only when that is all there is', () => {
    const all = new Set(ids(pool));
    const got = pickTiered(pool, all, all, getId);
    expect(got).toBeDefined();
    expect(ids(pool)).toContain(got!.id);
  });

  it('spreads across the whole fresh tier (not a fixed index)', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 400; i++) seen.add(pickTiered(pool, new Set(), new Set(), getId)!.id);
    expect(seen.size).toBe(pool.length);
  });
});

// ─── 2. allocateCategoryBlocks ─────────────────────────────────────────────

describe('allocateCategoryBlocks', () => {
  const sum = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0);

  it('distributes evenly when every category has capacity', () => {
    const cap = { Music: { fresh: 9, total: 9 }, Film: { fresh: 9, total: 9 }, Sport: { fresh: 9, total: 9 } };
    const out = allocateCategoryBlocks(3, ['Music', 'Film', 'Sport'], cap);
    expect(out).toEqual({ Music: 1, Film: 1, Sport: 1 });
  });

  it('never gives a degenerate category more blocks than it can fill fresh', () => {
    // Elvis-fallet: Music har EN fråga. Den får inte äga 1/3 av spelet.
    const cap = { Music: { fresh: 1, total: 1 }, Film: { fresh: 10, total: 10 }, Sport: { fresh: 12, total: 12 } };
    const out = allocateCategoryBlocks(6, ['Music', 'Film', 'Sport'], cap);
    expect(out.Music).toBeLessThanOrEqual(1);
    expect(sum(out)).toBe(6);
  });

  it('moves the surplus to categories that still hold fresh content', () => {
    const cap = { Music: { fresh: 0, total: 5 }, Film: { fresh: 10, total: 10 } };
    const out = allocateCategoryBlocks(4, ['Music', 'Film'], cap);
    expect(out.Music).toBe(0);
    expect(out.Film).toBe(4);
  });

  it('allows seen content only after fresh capacity is exhausted', () => {
    const cap = { Music: { fresh: 0, total: 4 }, Film: { fresh: 1, total: 1 } };
    const out = allocateCategoryBlocks(3, ['Music', 'Film'], cap);
    expect(out.Film).toBe(1);   // hela sin färska kapacitet
    expect(out.Music).toBe(2);  // resten, ur sedda
    expect(sum(out)).toBe(3);
  });

  it('always sums to totalBlocks, even when the catalog cannot cover it', () => {
    const cap = { Music: { fresh: 0, total: 0 }, Film: { fresh: 0, total: 1 } };
    const out = allocateCategoryBlocks(5, ['Music', 'Film'], cap);
    expect(sum(out)).toBe(5);
  });

  it('handles the degenerate inputs without throwing', () => {
    expect(sum(allocateCategoryBlocks(0, ['Music'], { Music: { fresh: 3, total: 3 } }))).toBe(0);
    expect(allocateCategoryBlocks(4, [], {})).toEqual({});
  });
});

// ─── 3. buildEpochPhase-lånet föredrar färska epoker ───────────────────────

describe('buildEpochPhase borrow ordering', () => {
  // Bred era så det finns MER ÄN EN epok att låna från — annars körs sorteringen
  // aldrig och testet blir tandlöst.
  const WIDE = getActiveEpochs(1950, 2012); // E1..E4

  it('borrows from an epoch with fresh items over one with only last-session items', () => {
    // E1 (≤1964) är tom → kvoten måste lånas. Två kandidater:
    //   E3 (1981–96): normWeight 0.311 — HÖGST, men bara inaktuella items.
    //   E2 (1965–80): normWeight 0.280 — lägre vikt, men färska items.
    // Den gamla sorteringen (enbart extraDraws/normWeight) valde E3 och
    // serverade alltså en fråga från FÖRRA spelet trots att färska fanns.
    // Färskhets-nivån ska nu dominera och ge E2.
    const e2Fresh = makeQuestions('Music', 8, 1965, 1980).map((q) => ({ ...q, id: `e2-fresh-${q.id}` }));
    const e3Stale = makeQuestions('Music', 8, 1981, 1996).map((q) => ({ ...q, id: `e3-stale-${q.id}` }));
    const staleIds = new Set(ids(e3Stale));

    // Sanity: E3 måste faktiskt väga tyngre än E2, annars testar vi inget.
    const norm = (id: number) => WIDE.find((e) => e.id === id)!.normWeight;
    expect(norm(3)).toBeGreaterThan(norm(2));

    for (let run = 0; run < 25; run++) {
      const out = buildEpochPhase<Q>({
        pool: [...e2Fresh, ...e3Stale],
        totalQuestions: 1,
        activeEpochs: WIDE,
        recentIds: staleIds,
        lastSessionIds: staleIds,
        isPtP: false,
        players: [],
        turnOrderIds: [],
        getEpochYear: getYear,
        quotas: [{ epochId: 1, quota: 1 }],
      });
      expect(out).toHaveLength(1);
      expect(out[0].id).toMatch(/^e2-fresh-/);
    }
  });
});

// ─── 4. 20-spelssimulering — hela kedjan ───────────────────────────────────

describe('no repeats across 20 consecutive games (era 1950-1980, gen-z)', () => {
  // Katalogen EFTER all-generations-retaggningen, i uppmätta proportioner:
  // 96 spelbara Music-låtar, 11 filmer, 12 sportevent.
  const postFix = [...makeQuestions('Music', 96), ...makeQuestions('Film', 11), ...makeQuestions('Sport', 12)];

  it('serves 20 games of 4 rounds with zero duplicates', () => {
    const games = runSeries(postFix, 20, 4, true);
    const all = games.flatMap(ids);
    expect(all.length).toBe(80);
    expect(new Set(all).size).toBe(80);
  });

  it('never leaves the selected game era', () => {
    for (const g of runSeries(postFix, 20, 4, true)) {
      for (const q of g) {
        expect(q.correctYear).toBeGreaterThanOrEqual(ERA_FROM);
        expect(q.correctYear).toBeLessThanOrEqual(ERA_TO);
      }
    }
  });

  it('never repeats within a single game', () => {
    for (const g of runSeries(postFix, 20, 4, true)) {
      expect(new Set(ids(g)).size).toBe(g.length);
    }
  });

  it('INVERSE CONTROL: the pre-fix pool reproduces the Elvis-every-game bug', () => {
    // Poolen som den SÅG UT för en gen-z-spelare före retaggningen: audience
    // hade redan silat bort allt utom EN spelbar Music-fråga.
    const preFix = [
      { id: 'elvis-presley-heartbreak-hotel', correctYear: 1956, mainCategory: 'Music' },
      ...makeQuestions('Film', 10),
      ...makeQuestions('Sport', 12),
    ];
    // Utan kapacitetstaket får Music ett block per spel — och har bara Elvis.
    const games = runSeries(preFix, 5, 3, false);
    const elvisGames = games.filter((g) => ids(g).includes('elvis-presley-heartbreak-hotel')).length;
    expect(elvisGames).toBe(5);

    // Med kapacitetstaket slutar Music äga ett block den inte kan fylla färskt,
    // så Elvis visas EN gång och sedan inte igen.
    const fixed = runSeries(preFix, 5, 3, true);
    const elvisFixed = fixed.filter((g) => ids(g).includes('elvis-presley-heartbreak-hotel')).length;
    expect(elvisFixed).toBe(1);
  });
});

/**
 * Epoch-weighted question selection — pure utility functions.
 * No React, no AsyncStorage. Safe to unit-test independently.
 *
 * Algorithm overview:
 *  1. getActiveEpochs      — filter EPOCHS to those overlapping Game Era + normalise weights
 *  2. allocateByEpoch      — Largest Remainder Method: distribute N across active epochs
 *  3. playerQuotas         — LRM again: even distribution across players
 *  4. assignQuestionsToPlayers — greedy birth-year / generation affinity matching
 *  5. buildPtPSequence     — reorder assignments into Pass-the-Phone turn slots
 *  6. buildEpochPhase      — main entry point combining all steps
 */

export type EpochId = 1 | 2 | 3 | 4 | 5;

export interface EpochDef {
  id: EpochId;
  start: number; // inclusive year
  end: number;   // inclusive year (use 9999 for open-ended)
  weight: number; // per-year weight — epoch's proportional contribution per year within its span
}

export interface ActiveEpoch extends EpochDef {
  normWeight: number; // weight renormalised after excluding out-of-era epochs
}

// Per-year weights (0.115+0.225+0.25+0.22+0.19 × their respective year spans normalise to 1.00
// over the full reachable catalog span). Source: product spreadsheet 2026-06-08.
export const EPOCHS: ReadonlyArray<EpochDef> = [
  { id: 1, start: 0,    end: 1964, weight: 0.115 },
  { id: 2, start: 1965, end: 1980, weight: 0.225 },
  { id: 3, start: 1981, end: 1996, weight: 0.25  },
  { id: 4, start: 1997, end: 2012, weight: 0.22  },
  { id: 5, start: 2013, end: 9999, weight: 0.19  },
] as const;

/**
 * Minimal question interface — QuizQuestion discriminated union satisfies this
 * structurally (all optional fields default to undefined for union members that
 * lack them; TypeScript treats missing optional fields as compatible).
 */
export interface EpochQuestion {
  id: string;
  correctYear?: number;
  peakFrom?: number;
  peakTo?: number;
  audiences?: readonly string[];
}

export interface EpochPlayer {
  id: string;
  birthYear: number;
  generation: string; // GenerationKey value from mockPurchasedPackages
}

export interface BuildEpochPhaseParams<T extends EpochQuestion> {
  pool: T[];
  totalQuestions: number;
  activeEpochs: ActiveEpoch[];
  recentIds: Set<string>;
  /** true = Pass-the-Phone (assigns questions to players, reorders into turn slots).
   *  false = IndDev / Single Player (epoch order, no player assignment). */
  isPtP: boolean;
  players: EpochPlayer[];
  turnOrderIds: string[];
  /** Returns the "epoch year" for a question — used for bucket assignment and affinity.
   *  null = era-agnostic (put in overflow pool). */
  getEpochYear: (q: T) => number | null;
}

// ─── Internal helpers ──────────────────────────────────────────────────────

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Hamilton / Largest Remainder Method.
 * Distributes integer N across weighted items. Guarantees sum === N exactly.
 * Excess seats are given to items with the largest fractional remainder.
 * Ties broken lexicographically by key (deterministic).
 */
function lrmAllocate(
  N: number,
  items: { key: string; weight: number }[],
): Record<string, number> {
  if (N <= 0 || items.length === 0) return {};
  const totalWeight = items.reduce((s, it) => s + it.weight, 0);
  if (totalWeight === 0) {
    // Equal distribution when all weights are 0
    const base = Math.floor(N / items.length);
    const rem = N - base * items.length;
    return Object.fromEntries(items.map((it, i) => [it.key, base + (i < rem ? 1 : 0)]));
  }
  const scaled = items.map((it) => {
    const exact = (it.weight / totalWeight) * N;
    return { key: it.key, floor: Math.floor(exact), rem: exact - Math.floor(exact) };
  });
  const totalFloor = scaled.reduce((s, f) => s + f.floor, 0);
  const seats = N - totalFloor;
  const sorted = [...scaled].sort((a, b) => b.rem - a.rem || a.key.localeCompare(b.key));
  for (let i = 0; i < seats; i++) sorted[i].floor++;
  return Object.fromEntries(scaled.map((f) => [f.key, f.floor]));
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Compute active epochs for [eraFrom, eraTo] using year-proportional weighting.
 *
 * Each epoch contributes:  effectiveWeight = overlappingYears × epoch.weight
 *
 * where overlappingYears = years from the epoch that fall inside [eraFrom, eraTo].
 * Epochs with zero overlap are excluded. The remaining effectiveWeights are
 * normalised to sum to 1 → normWeight.
 *
 * Example: eraFrom=1975, eraTo=2005
 *   E2 (1965-1980): 6 years × 0.225 = 1.35
 *   E3 (1981-1996): 16 years × 0.25  = 4.00
 *   E4 (1997-2012): 9 years × 0.22   = 1.98   total = 7.33
 *   → normWeights 0.184 / 0.546 / 0.270  →  N=10 gives 2 / 5 / 3 questions
 */
export function getActiveEpochs(eraFrom: number, eraTo: number): ActiveEpoch[] {
  const withEffective = EPOCHS.flatMap((e) => {
    const activeYears = Math.max(
      0,
      Math.min(e.end, eraTo) - Math.max(e.start, eraFrom) + 1,
    );
    if (activeYears <= 0) return [];
    return [{ ...e, normWeight: activeYears * e.weight }]; // normWeight holds effectiveWeight temporarily
  });
  const totalWeight = withEffective.reduce((s, e) => s + e.normWeight, 0);
  if (totalWeight === 0) return [];
  return withEffective.map((e) => ({ ...e, normWeight: e.normWeight / totalWeight }));
}

/**
 * Distribute N questions across active epochs using Largest Remainder Method.
 * Returns an array sorted by epoch id (ascending = chronological order 1→5).
 */
export function allocateByEpoch(
  N: number,
  activeEpochs: ActiveEpoch[],
): Array<{ epochId: EpochId; quota: number }> {
  if (N <= 0 || activeEpochs.length === 0) return [];
  const items = activeEpochs.map((e) => ({ key: String(e.id), weight: e.normWeight }));
  const allocated = lrmAllocate(N, items);
  return [...activeEpochs]
    .sort((a, b) => a.id - b.id)
    .map((e) => ({ epochId: e.id, quota: allocated[String(e.id)] ?? 0 }));
}

/**
 * Distribute N questions evenly across players using Largest Remainder Method.
 * Max |quota_i − quota_j| ≤ 1. Input order is preserved.
 */
export function playerQuotas(
  N: number,
  players: EpochPlayer[],
): Array<{ playerId: string; quota: number }> {
  if (N <= 0 || players.length === 0) return [];
  const items = players.map((p) => ({ key: p.id, weight: 1 }));
  const allocated = lrmAllocate(N, items);
  return players.map((p) => ({ playerId: p.id, quota: allocated[p.id] ?? 0 }));
}

/**
 * Greedily assign each question to the player with best affinity.
 * Affinity score (lower = better):  generationMatch × 10000 + yearDist
 * Player quotas are respected; a player whose quota is full is excluded
 * from subsequent assignments.
 */
export function assignQuestionsToPlayers<T extends EpochQuestion>(
  questions: T[],
  players: EpochPlayer[],
  quotas: Array<{ playerId: string; quota: number }>,
  getEpochYear: (q: T) => number | null,
): Array<{ question: T; playerId: string }> {
  if (players.length === 0) {
    return questions.map((q) => ({ question: q, playerId: '' }));
  }

  const remaining = new Map(quotas.map((q) => [q.playerId, q.quota]));

  const affinityScore = (q: T, p: EpochPlayer): number => {
    const year = getEpochYear(q) ?? p.birthYear;
    const yearDist = Math.abs(year - p.birthYear);
    // genMatch: 0 if player's generation matches question's audience tag, 1 otherwise.
    // Falls back gracefully to pure year-distance if audiences is not populated.
    const genMatch = q.audiences?.includes(p.generation) ? 0 : 1;
    return genMatch * 10000 + yearDist;
  };

  const assignments: Array<{ question: T; playerId: string }> = [];
  for (const q of questions) {
    const candidates = players
      .filter((p) => (remaining.get(p.id) ?? 0) > 0)
      .sort((a, b) => affinityScore(q, a) - affinityScore(q, b));

    if (candidates.length === 0) {
      // All quotas exhausted — shouldn't happen if totalQuestions <= sum(quotas)
      const fallback = players[assignments.length % players.length];
      assignments.push({ question: q, playerId: fallback.id });
      continue;
    }

    const chosen = candidates[0];
    remaining.set(chosen.id, (remaining.get(chosen.id) ?? 1) - 1);
    assignments.push({ question: q, playerId: chosen.id });
  }
  return assignments;
}

/**
 * Reorder question assignments into Pass-the-Phone turn slots.
 * Turn rotation: [P1, P2, ..., Pn, P1, P2, ...].
 * Each player's assigned questions are delivered to their turn slots in the
 * order they appear in `assignments` (epoch order within each player's queue).
 */
export function buildPtPSequence<T extends EpochQuestion>(
  assignments: Array<{ question: T; playerId: string }>,
  turnOrderIds: string[],
  totalQuestions: number,
): T[] {
  if (turnOrderIds.length === 0) return assignments.map((a) => a.question);

  // Per-player queues (epoch order is preserved within each queue)
  const queues = new Map<string, T[]>(turnOrderIds.map((id) => [id, []]));
  const overflow: T[] = [];

  for (const { question, playerId } of assignments) {
    const q = queues.get(playerId);
    if (q) q.push(question);
    else overflow.push(question); // playerId not in turnOrder (shouldn't happen)
  }

  const sequence: T[] = [];
  for (let slot = 0; slot < totalQuestions; slot++) {
    const playerId = turnOrderIds[slot % turnOrderIds.length];
    const q = queues.get(playerId)?.shift() ?? overflow.shift();
    if (q) sequence.push(q);
  }
  return sequence;
}

/**
 * Main entry point: build a sequence of totalQuestions items from pool using
 * epoch-weighted distribution + (for PtP) player-affinity assignment.
 *
 * IndDev / Single Player (isPtP=false):
 *   Returns questions in epoch order (E1→E5), unseen-first within each epoch.
 *   No player assignment — all players see the same questions simultaneously.
 *
 * Pass-the-Phone (isPtP=true):
 *   Assigns questions to players by birth-year + generation affinity,
 *   then reorders into the PtP turn-slot sequence.
 *
 * Fallback: epoch-exhausted slots borrow from the epoch with fewest extra-draws
 * (ties broken by highest normWeight). Era-agnostic items (null epoch year)
 * fill remaining slots last.
 */
export function buildEpochPhase<T extends EpochQuestion>(
  params: BuildEpochPhaseParams<T>,
): T[] {
  const { pool, totalQuestions, activeEpochs, recentIds, isPtP, players, turnOrderIds, getEpochYear } = params;

  if (totalQuestions <= 0 || pool.length === 0 || activeEpochs.length === 0) return [];

  // ── Step 1: Bucket questions by active epoch ───────────────────────────
  const epochBuckets = new Map<EpochId, T[]>(activeEpochs.map((e) => [e.id, []]));
  const agnosticPool: T[] = []; // null epoch year → era-agnostic overflow

  for (const q of pool) {
    const year = getEpochYear(q);
    if (year === null) { agnosticPool.push(q); continue; }
    const epoch = activeEpochs.find((e) => e.start <= year && e.end >= year);
    if (!epoch) { agnosticPool.push(q); continue; }
    epochBuckets.get(epoch.id)!.push(q);
  }

  // ── Step 2: Split buckets into unseen/seen, shuffle each independently ─
  const epochPools = new Map<EpochId, { unseen: T[]; seen: T[]; extraDraws: number }>();
  for (const [epochId, bucket] of epochBuckets.entries()) {
    const unseen = shuffleArr(bucket.filter((q) => !recentIds.has(q.id)));
    const seen = shuffleArr(bucket.filter((q) => recentIds.has(q.id)));
    epochPools.set(epochId, { unseen, seen, extraDraws: 0 });
  }

  // ── Step 3: Allocate total questions across epochs (LRM) ───────────────
  const allocation = allocateByEpoch(totalQuestions, activeEpochs);
  const epochNormWeights = new Map(activeEpochs.map((e) => [e.id, e.normWeight]));

  // Pop one question from an epoch pool (unseen before seen)
  const popFromPool = (epochId: EpochId): T | undefined => {
    const ep = epochPools.get(epochId);
    if (!ep) return undefined;
    if (ep.unseen.length > 0) return ep.unseen.shift();
    if (ep.seen.length > 0) return ep.seen.shift();
    return undefined;
  };

  // Fallback: borrow from epoch with fewest extra-draws.
  // Tie-break: highest normWeight (epoch "deserves" more questions).
  const fallbackQuestion = (excludeId: EpochId): T | undefined => {
    const candidates = [...epochPools.entries()]
      .filter(([id, ep]) => id !== excludeId && (ep.unseen.length + ep.seen.length) > 0)
      .sort(([aId, aEp], [bId, bEp]) => {
        const normA = epochNormWeights.get(aId) ?? 0;
        const normB = epochNormWeights.get(bId) ?? 0;
        const scoreA = aEp.extraDraws * 10000 - normA;
        const scoreB = bEp.extraDraws * 10000 - normB;
        return scoreA - scoreB;
      });
    if (candidates.length === 0) {
      return agnosticPool.length > 0 ? agnosticPool.shift() : undefined;
    }
    const [winnerEpochId, winnerEp] = candidates[0];
    winnerEp.extraDraws++;
    return popFromPool(winnerEpochId);
  };

  // ── Step 4: Collect questions in epoch order 1→5 ─────────────────────
  const collected: T[] = [];
  for (const { epochId, quota } of allocation) {
    for (let i = 0; i < quota; i++) {
      const q = popFromPool(epochId) ?? fallbackQuestion(epochId) ?? agnosticPool.shift();
      if (q) collected.push(q);
    }
  }

  // Fill remaining from era-agnostic overflow if collected < totalQuestions
  while (collected.length < totalQuestions && agnosticPool.length > 0) {
    collected.push(agnosticPool.shift()!);
  }

  if (collected.length === 0) return [];

  // ── Step 5: PtP — player-affinity assignment + turn-slot reordering ────
  if (isPtP && players.length > 0) {
    const quotas = playerQuotas(collected.length, players);
    const assignments = assignQuestionsToPlayers(collected, players, quotas, getEpochYear);
    return buildPtPSequence(assignments, turnOrderIds, collected.length);
  }

  // IndDev / Single Player: return in epoch order, no player assignment
  return collected;
}

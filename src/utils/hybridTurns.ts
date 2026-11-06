// Multiplayer v2 Step 4 — hybrid 1 by 1 (pure helpers, no React/RN).
//
// Hybrid 1 by 1 = Pass-the-Phone where some participants play on their own
// phone. Turn ownership is the PtP rotation the engine already uses
// (question N is answered by turnOrder[N % n]), so every device derives it
// locally without new events.
//
// Tests: backend/content/test/hybridTurns.test.ts

export interface TurnPlayer {
  id: string;
}

/** Same rotation rule as PtP's currentPlayerIndex and the spectator heal. */
export function turnOwnerIndex(questionIndex: number, playerCount: number): number {
  if (playerCount <= 0) return 0;
  return ((questionIndex % playerCount) + playerCount) % playerCount;
}

export function turnOwner<T extends TurnPlayer>(turnOrder: readonly T[], questionIndex: number): T | undefined {
  return turnOrder[turnOwnerIndex(questionIndex, turnOrder.length)];
}

export type HybridRole = 'answer' | 'watch';

/**
 * What this device does for the current question.
 *  • Host device: answers turns of the host and of host-device players;
 *    watches when an own-device participant is answering on their phone.
 *  • Own-device participant: answers only its own turns; watches the rest.
 * `ownDeviceIds` = non-host participants playing on their own phone (from
 * the frozen start config — never inferred from the host row).
 */
export function hybridRole(args: {
  isHost: boolean;
  selfPlayerId: string;
  ownerId: string | undefined;
  ownDeviceIds: ReadonlySet<string>;
}): HybridRole {
  const { isHost, selfPlayerId, ownerId, ownDeviceIds } = args;
  if (!ownerId) return isHost ? 'answer' : 'watch';
  if (isHost) return ownDeviceIds.has(ownerId) ? 'watch' : 'answer';
  return ownerId === selfPlayerId ? 'answer' : 'watch';
}

/** A score for question N is only valid from that question's turn owner. */
export function acceptsHybridScore(
  playerId: string,
  questionIndex: number,
  turnOrder: readonly TurnPlayer[],
): boolean {
  return turnOwner(turnOrder, questionIndex)?.id === playerId;
}

/** Grace after the timer ends before the host records "No answer". */
export const HYBRID_MISSING_SCORE_GRACE_MS = 3000;

export function missingScoreDue(timerEndedAtMs: number, nowMs: number): boolean {
  return timerEndedAtMs > 0 && nowMs - timerEndedAtMs >= HYBRID_MISSING_SCORE_GRACE_MS;
}

// ─── Server-confirmed results (migration 0066) ───────────────────────

/**
 * player_id stored for a turn the host DELETED because its owner had left
 * the game (own-device player gone before their turn). The question is
 * resolved for allTurnsResolved, but produces no score for anyone.
 */
export const DELETED_TURN_PLAYER_ID = '__deleted__';

export interface TurnResultRow {
  question_index: number;
  player_id: string;
  points: number;
  correct: boolean;
  time_used: number;
  answer: string | null;
  connection_error: boolean;
}

export interface HybridScore {
  playerId: string;
  points: number;
  correct: boolean;
  timeUsed: number;
  connectionError?: boolean;
  questionIndex?: number;
  answer?: string;
}

export function rowToScore(row: TurnResultRow): HybridScore {
  return {
    playerId: row.player_id,
    points: row.points,
    correct: row.correct,
    timeUsed: row.time_used,
    connectionError: row.connection_error || undefined,
    questionIndex: row.question_index,
    answer: row.answer ?? undefined,
  };
}

/** True when the server holds a result for every question 0..total-1. */
export function allTurnsResolved(rows: readonly TurnResultRow[], totalQuestions: number): boolean {
  if (totalQuestions <= 0) return false;
  const have = new Set(rows.map((r) => r.question_index));
  for (let i = 0; i < totalQuestions; i++) if (!have.has(i)) return false;
  return true;
}

/**
 * Replaces every local entry for a question the server has decided with the
 * server's row (one entry per question). Entries for questions the server
 * hasn't decided yet are kept. Order: kept entries, then server rows by
 * question index.
 */
export function mergeServerResults<S extends HybridScore>(
  history: readonly (readonly S[])[],
  rows: readonly TurnResultRow[],
): HybridScore[][] {
  const decided = new Set(rows.map((r) => r.question_index));
  const kept: HybridScore[][] = [];
  for (const round of history) {
    const remaining = round.filter(
      (s) => s.questionIndex === undefined || !decided.has(s.questionIndex),
    );
    if (remaining.length > 0) kept.push(remaining);
  }
  const fromServer = [...rows]
    .filter((r) => r.player_id !== DELETED_TURN_PLAYER_ID)
    .sort((a, b) => a.question_index - b.question_index)
    .map((r) => [rowToScore(r)]);
  return [...kept, ...fromServer];
}

/** Parses the hybridOwnDeviceIds quiz param (JSON string array). */
export function parseOwnDeviceIds(raw: string | undefined): Set<string> {
  if (!raw) return new Set();
  try {
    const parsed: unknown = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

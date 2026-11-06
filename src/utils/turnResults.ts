// Multiplayer v2 Step 4 — server-confirmed turn results (migration 0066).
//
// The host is the authority for every accepted turn result in a hybrid
// 1 by 1 game. Broadcasts stay the fast path for reveal + live leaderboard;
// these rows are the verified record every device rebuilds from before it
// saves HCP progression or Player history.

import { supabase } from './supabase';
import type { TurnResultRow } from './hybridTurns';

export interface RecordTurnResultArgs {
  questionIndex: number;
  playerId: string;
  points: number;
  correct: boolean;
  timeUsed: number;
  answer?: string;
  connectionError?: boolean;
}

/**
 * Host only. Writes the accepted result for a question. The server keeps the
 * FIRST row per question (on conflict do nothing) and returns the stored
 * row — which may differ from `args` if the question was already decided.
 * Returns null on failure (network, not host, migration missing).
 */
export async function recordTurnResult(
  roomCode: string,
  args: RecordTurnResultArgs,
): Promise<TurnResultRow | null> {
  const { data, error } = await supabase.rpc('record_turn_result', {
    p_room_code: roomCode.toUpperCase(),
    p_question_index: args.questionIndex,
    p_player_id: args.playerId,
    p_points: args.points,
    p_correct: args.correct,
    p_time_used: args.timeUsed,
    p_answer: args.answer ?? null,
    p_connection_error: !!args.connectionError,
  });
  if (error) {
    console.warn('[turnResults] recordTurnResult failed:', error.message);
    return null;
  }
  return isTurnResultRow(data) ? data : null;
}

/**
 * All server-confirmed results for the room, ordered by question.
 * null = could not reach/verify (caller must NOT treat it as "no results").
 */
export async function getTurnResults(roomCode: string): Promise<TurnResultRow[] | null> {
  const { data, error } = await supabase.rpc('get_turn_results', {
    p_room_code: roomCode.toUpperCase(),
  });
  if (error) {
    console.warn('[turnResults] getTurnResults failed:', error.message);
    return null;
  }
  return Array.isArray(data) ? data.filter(isTurnResultRow) : [];
}

function isTurnResultRow(v: unknown): v is TurnResultRow {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.question_index === 'number' &&
    typeof o.player_id === 'string' &&
    typeof o.points === 'number' &&
    typeof o.correct === 'boolean' &&
    typeof o.time_used === 'number'
  );
}

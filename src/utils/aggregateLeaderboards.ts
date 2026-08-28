import type {
  AggregateGamePlayer,
  AggregateSeriesGame,
} from './aggregateLeaderboard';
import { supabase } from './supabase';

/**
 * Sparade Aggregate Leaderboards / Scores (migration 0037).
 *
 * ── Två lager, med flit ─────────────────────────────────────────────────
 * [aggregateLeaderboard.ts](./aggregateLeaderboard.ts) håller den LOKALA,
 * namnlösa serien som kedjas via rumkoden. Den driver flikarna på
 * slutskärmen och fungerar för alla — även gäst-spel — utan nätverk.
 *
 * Den här modulen är lagret ovanpå: när spelet består av 100 % QuizVibe-users
 * sparas serien dessutom NAMNGIVEN på varje deltagares konto, så den
 * överlever telefonbyte, syns under Player history hos alla deltagare, och
 * kan återupptas en annan kväll.
 *
 * ── Konventioner (speglar remoteMatches.ts) ─────────────────────────────
 * Kastar aldrig. Vid fel: console.warn + neutralt returvärde, så en trasig
 * nätverksväg aldrig blockerar slutskärmen.
 *
 * ⚠ Servern avgör själv vem som är registrerad (profiles-rad finns) och
 *   beräknar participants_key. Klienten kan varken spoofa uppsättningen
 *   eller knyta en serie till spelare den inte tillhör.
 */

export interface SavedAggregateSummary {
  id: string;
  name: string;
  gamesCount: number;
  updatedAt: string;
}

export interface SavedAggregate {
  id: string;
  name: string;
  /** Skaparen = competitionens host (0037). Bara created_by kan initiera en
   *  re-match från Home (0041). */
  createdBy: string;
  participants: { userId: string; playerName: string }[];
  games: AggregateSeriesGame[];
}

interface LeaderboardRow {
  id: string;
  name: string;
  created_by: string;
  aggregate_leaderboard_players?: { user_id: string; player_name: string }[];
  aggregate_leaderboard_games?: { room_code: string; stats: AggregateGamePlayer[] }[];
}

const LEADERBOARD_SELECT =
  '*, aggregate_leaderboard_players(*), aggregate_leaderboard_games(*)';

function rowToSaved(row: LeaderboardRow): SavedAggregate {
  return {
    id: row.id,
    name: row.name,
    createdBy: row.created_by,
    participants: (row.aggregate_leaderboard_players ?? []).map((p) => ({
      userId: p.user_id,
      playerName: p.player_name,
    })),
    // Mappas till EXAKT den form buildAggregateStandings redan tar, så lokal
    // och sparad vy räknas av samma funktion och inte kan glida isär.
    games: (row.aggregate_leaderboard_games ?? []).map((g) => ({
      roomCode: g.room_code,
      players: g.stats ?? [],
    })),
  };
}

/**
 * Skapar en ny namngiven serie. Servern kräver att VARJE uid har en
 * profiles-rad — en gäst i uppsättningen ger null, vilket är rätt: då
 * lever serien bara lokalt.
 */
export async function createAggregateLeaderboard(
  name: string,
  userIds: string[],
): Promise<string | null> {
  const { data, error } = await supabase.rpc('create_aggregate_leaderboard', {
    p_name: name,
    p_user_ids: userIds,
  });
  if (error) {
    console.warn('[aggregateLeaderboards] create failed:', error.message);
    return null;
  }
  return (data as string) ?? null;
}

/** Tidigare sparade serier med EXAKT denna spelaruppsättning, nyast först. */
export async function findAggregateLeaderboardsFor(
  userIds: string[],
): Promise<SavedAggregateSummary[]> {
  const { data, error } = await supabase.rpc(
    'list_aggregate_leaderboards_for_participants',
    { p_user_ids: userIds },
  );
  if (error) {
    console.warn('[aggregateLeaderboards] find failed:', error.message);
    return [];
  }
  return ((data as { id: string; name: string; games_count: number; updated_at: string }[]) ?? []).map(
    (r) => ({
      id: r.id,
      name: r.name,
      gamesCount: r.games_count,
      updatedAt: r.updated_at,
    }),
  );
}

/**
 * Bokför ett spel i serien. Idempotent per rumkod — slutskärmen skriver om
 * sig när sena peer-scores droppar in och ska då ERSÄTTA spelets rad.
 *
 * ⚠ Anropas BARA av host. En non-host som lämnat mitt i spelet har en
 *   ofullständig allRoundScoresHistory och skulle skriva trunkerad
 *   statistik. Servern kan inte veta vem som är host, så regeln bor här.
 */
export async function recordAggregateGame(
  leaderboardId: string,
  roomCode: string,
  stats: AggregateGamePlayer[],
): Promise<void> {
  const { error } = await supabase.rpc('record_aggregate_leaderboard_game', {
    p_leaderboard_id: leaderboardId,
    p_room_code: roomCode,
    p_stats: stats,
  });
  if (error) {
    console.warn('[aggregateLeaderboards] recordGame failed:', error.message);
  }
}

export async function renameAggregateLeaderboard(
  leaderboardId: string,
  name: string,
): Promise<boolean> {
  const { error } = await supabase.rpc('rename_aggregate_leaderboard', {
    p_leaderboard_id: leaderboardId,
    p_name: name,
  });
  if (error) {
    console.warn('[aggregateLeaderboards] rename failed:', error.message);
    return false;
  }
  return true;
}

/** En serie med alla spel — används för att seeda den lokala serien vid attach. */
export async function getAggregateLeaderboard(
  leaderboardId: string,
): Promise<SavedAggregate | null> {
  const { data, error } = await supabase
    .from('aggregate_leaderboards')
    .select(LEADERBOARD_SELECT)
    .eq('id', leaderboardId)
    .maybeSingle();
  if (error) {
    console.warn('[aggregateLeaderboards] get failed:', error.message);
    return null;
  }
  return data ? rowToSaved(data as LeaderboardRow) : null;
}

/**
 * Alla serier jag deltar i, nyast först. INGEN `.eq('user_id', …)` — RLS
 * begränsar redan till deltagare (samma doktrin som getMyMatches).
 */
export async function listMyAggregateLeaderboards(
  limit = 30,
): Promise<SavedAggregate[]> {
  const { data, error } = await supabase
    .from('aggregate_leaderboards')
    .select(LEADERBOARD_SELECT)
    .order('updated_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.warn('[aggregateLeaderboards] list failed:', error.message);
    return [];
  }
  return ((data as LeaderboardRow[]) ?? []).map(rowToSaved);
}

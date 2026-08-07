// Remote 1v1-matcher — Supabase API-lager (migration 0027_remote_1v1.sql).
//
// En remote-match är en asynkron duell: exakt 2 spelare svarar på SAMMA
// frågesekvens oberoende av varandra inom 48h från matchstart. Matchen
// lever i `remote_matches` (+ `remote_match_players` / `remote_match_answers`)
// och är FRIKOPPLAD från rooms-livscykeln (room_code är text-snapshot utan
// FK — rummet dör efter 24h, matchen har egen deadline + retention).
//
// Skriv-mönster: klienten kan ALDRIG skriva match-status/vinnare/sekvens
// direkt — allt går via SECURITY DEFINER-RPC:erna (create_remote_match,
// set_remote_match_questions, finalize_remote_match_player) som validerar
// caller = deltagare. Enda direkta skrivningen är upsertAnswer (egen rad,
// RLS user_id = auth.uid(), idempotent via unique-constraint).
//
// Läs-mönster: deltagare läser match + BÅDA spelarraderna (RLS via
// is_remote_match_participant-helpern). Motståndarens per-fråga-svar är
// avsiktligt oläsbara — bara summary-raden exponeras.

import { supabase } from './supabase';

// 'cancelled' = host tryckte Quit Game mitt i matchen (migration 0028) —
// visas för båda spelarna som "Lobby deleted by Host", inget W/L/D.
export type RemoteMatchStatus = 'active' | 'finished' | 'expired_walkover' | 'void' | 'cancelled';
export type RemoteMatchResult = 'decided' | 'draw' | 'walkover' | 'void';

export interface RemoteMatchSettings {
  roundsCount: number;
  answerResponseSeconds: 30 | 45 | 60;
  eraFrom: number;
  eraTo: number;
  youtubeEnabledCategories: string[];
  imagesEnabledCategories: string[];
  selectedExtraPackages: string[];
}

export interface RemoteMatchPlayer {
  userId: string;
  playerName: string;
  isHost: boolean;
  playerType: 'registered' | 'guest';
  assistance: string | null;
  age: number | null;
  /** null = spelaren har inte spelat klart (eller aldrig börjat). */
  finishedAt: string | null;
  totalPoints: number;
  correctAnswers: number;
  avgResponseSeconds: number | null;
}

export interface RemoteMatch {
  id: string;
  roomCode: string;
  status: RemoteMatchStatus;
  /** null tills host:s quiz-mount persisterat sekvensen. */
  questionIds: string[] | null;
  settings: RemoteMatchSettings;
  startedAt: string;
  deadlineAt: string;
  winnerUserId: string | null;
  result: RemoteMatchResult | null;
  finishedAt: string | null;
  /** Spelarrader — båda deltagarna (RLS ger deltagare full läsning). */
  players: RemoteMatchPlayer[];
}

/** Match ur "mitt" perspektiv — deriverad me/opponent-split för UI. */
export interface MyRemoteMatch {
  match: RemoteMatch;
  me: RemoteMatchPlayer;
  opponent: RemoteMatchPlayer | null;
}

/** Input till createRemoteMatch — speglar RPC:ns players-jsonb-shape. */
export interface NewRemoteMatchPlayer {
  userId: string;
  playerName: string;
  isHost: boolean;
  playerType: 'registered' | 'guest';
  assistance?: string | null;
  age?: number | null;
}

export interface RemoteAnswer {
  questionIndex: number;
  questionId: string;
  correct: boolean;
  points: number;
  timeUsedSeconds: number;
}

// ── Row-adapters ──────────────────────────────────────────────────────

interface RemoteMatchPlayerRow {
  match_id: string;
  user_id: string;
  player_name: string;
  is_host: boolean;
  player_type: 'registered' | 'guest';
  assistance: string | null;
  age: number | null;
  finished_at: string | null;
  total_points: number;
  correct_answers: number;
  avg_response_seconds: number | null;
}

interface RemoteMatchRow {
  id: string;
  room_code: string;
  status: RemoteMatchStatus;
  question_ids: string[] | null;
  rounds_count: number;
  answer_response_seconds: number;
  era_from: number;
  era_to: number;
  youtube_enabled_categories: string[];
  images_enabled_categories: string[];
  selected_extra_packages: string[];
  started_at: string;
  deadline_at: string;
  winner_user_id: string | null;
  result: RemoteMatchResult | null;
  finished_at: string | null;
  remote_match_players?: RemoteMatchPlayerRow[];
}

function rowToPlayer(r: RemoteMatchPlayerRow): RemoteMatchPlayer {
  return {
    userId: r.user_id,
    playerName: r.player_name,
    isHost: r.is_host,
    playerType: r.player_type,
    assistance: r.assistance,
    age: r.age,
    finishedAt: r.finished_at,
    totalPoints: r.total_points,
    correctAnswers: r.correct_answers,
    avgResponseSeconds: r.avg_response_seconds == null ? null : Number(r.avg_response_seconds),
  };
}

function rowToMatch(r: RemoteMatchRow): RemoteMatch {
  const resp = r.answer_response_seconds;
  return {
    id: r.id,
    roomCode: r.room_code,
    status: r.status,
    questionIds: r.question_ids,
    settings: {
      roundsCount: r.rounds_count,
      answerResponseSeconds: resp === 45 ? 45 : resp === 60 ? 60 : 30,
      eraFrom: r.era_from,
      eraTo: r.era_to,
      youtubeEnabledCategories: r.youtube_enabled_categories ?? [],
      imagesEnabledCategories: r.images_enabled_categories ?? [],
      selectedExtraPackages: r.selected_extra_packages ?? [],
    },
    startedAt: r.started_at,
    deadlineAt: r.deadline_at,
    winnerUserId: r.winner_user_id,
    result: r.result,
    finishedAt: r.finished_at,
    players: (r.remote_match_players ?? []).map(rowToPlayer),
  };
}

/** Nuvarande auth-user-id (registrerad ELLER anon guest-session). */
export async function getOwnUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

/** me/opponent-split för UI. null om jag inte är deltagare. */
export function splitMatchForUser(match: RemoteMatch, userId: string): MyRemoteMatch | null {
  const me = match.players.find((p) => p.userId === userId);
  if (!me) return null;
  const opponent = match.players.find((p) => p.userId !== userId) ?? null;
  return { match, me, opponent };
}

// ── Skrivningar (RPC) ─────────────────────────────────────────────────

/**
 * Host: skapar matchen + båda spelarraderna atomiskt vid Start Game.
 * Returnerar match-id, eller null vid fel (Alert:as av call-site — utan
 * match-id kan spelet inte startas i remote-läget).
 */
export async function createRemoteMatch(
  roomCode: string,
  settings: RemoteMatchSettings,
  players: NewRemoteMatchPlayer[],
): Promise<string | null> {
  const { data, error } = await supabase.rpc('create_remote_match', {
    p_room_code: roomCode.toUpperCase(),
    p_settings: {
      rounds_count: settings.roundsCount,
      answer_response_seconds: settings.answerResponseSeconds,
      era_from: settings.eraFrom,
      era_to: settings.eraTo,
      youtube_enabled_categories: settings.youtubeEnabledCategories,
      images_enabled_categories: settings.imagesEnabledCategories,
      selected_extra_packages: settings.selectedExtraPackages,
    },
    p_players: players.map((p) => ({
      user_id: p.userId,
      player_name: p.playerName,
      is_host: p.isHost,
      player_type: p.playerType,
      assistance: p.assistance ?? null,
      age: p.age ?? null,
    })),
  });
  if (error) {
    console.warn('[remoteMatches] createRemoteMatch failed:', error.message);
    return null;
  }
  return (data as string) ?? null;
}

/**
 * Persisterar frågesekvensen EN gång (guard i RPC:n: question_ids IS NULL).
 * Returnerar true om skrivningen vann; false = redan satt (t.ex. host-resume
 * eller förlorad race) — call-site ska då läsa om matchen och rendera
 * den auktoritativa sekvensen.
 */
export async function persistQuestionSequence(matchId: string, questionIds: string[]): Promise<boolean> {
  const { data, error } = await supabase.rpc('set_remote_match_questions', {
    p_match_id: matchId,
    p_question_ids: questionIds,
  });
  if (error) {
    console.warn('[remoteMatches] persistQuestionSequence failed:', error.message);
    return false;
  }
  return data === true;
}

/**
 * Skriver ETT svar (fire-and-forget från recordRoundScore). Idempotent via
 * unique (match_id, user_id, question_index) — retry/dubbelanrop skriver
 * över samma rad istället för att dubbelräkna.
 */
export async function upsertAnswer(matchId: string, answer: RemoteAnswer): Promise<void> {
  const userId = await getOwnUserId();
  if (!userId) {
    console.warn('[remoteMatches] upsertAnswer: no auth session');
    return;
  }
  const { error } = await supabase.from('remote_match_answers').upsert(
    {
      match_id: matchId,
      user_id: userId,
      question_index: answer.questionIndex,
      question_id: answer.questionId,
      correct: answer.correct,
      points: answer.points,
      time_used_seconds: answer.timeUsedSeconds,
    },
    { onConflict: 'match_id,user_id,question_index' },
  );
  if (error) {
    console.warn('[remoteMatches] upsertAnswer failed:', error.message);
  }
}

/**
 * HOST avbryter en pågående match (Quit Game i quiz). RPC:n sätter
 * status='cancelled' — matchen BEHÅLLS och visas för båda spelarna som
 * "Lobby deleted by Host" (1vs1 Matches + Player history). Bara när
 * callern är matchens host och matchen fortfarande är 'active' (avgjorda
 * resultat kan inte skrivas över). Idempotent.
 * Kräver migration 0028_remote_match_cancel.sql.
 */
export async function cancelRemoteMatch(matchId: string): Promise<void> {
  const { error } = await supabase.rpc('cancel_remote_match', { p_match_id: matchId });
  if (error) {
    console.warn('[remoteMatches] cancelRemoteMatch failed:', error.message);
  }
}

/**
 * Finaliserar EGEN spelarrad. Sista finishern triggar atomisk vinnar-
 * beräkning server-side (radlås i RPC:n — ingen klient-race).
 */
export async function finalizePlayer(
  matchId: string,
  totals: { totalPoints: number; correctAnswers: number; avgResponseSeconds: number | null },
): Promise<void> {
  const { error } = await supabase.rpc('finalize_remote_match_player', {
    p_match_id: matchId,
    p_total_points: totals.totalPoints,
    p_correct_answers: totals.correctAnswers,
    p_avg_response_seconds: totals.avgResponseSeconds,
  });
  if (error) {
    console.warn('[remoteMatches] finalizePlayer failed:', error.message);
  }
}

// ── Läsningar ─────────────────────────────────────────────────────────

const MATCH_SELECT = '*, remote_match_players(*)';

/** Hämtar en match (inkl. båda spelarraderna). null om ej deltagare/saknas. */
export async function getMatch(matchId: string): Promise<RemoteMatch | null> {
  const { data, error } = await supabase
    .from('remote_matches')
    .select(MATCH_SELECT)
    .eq('id', matchId)
    .maybeSingle();
  if (error) {
    console.warn('[remoteMatches] getMatch failed:', error.message);
    return null;
  }
  return data ? rowToMatch(data as RemoteMatchRow) : null;
}

/**
 * Senaste matchen för en rumkod där JAG är deltagare (RLS filtrerar).
 * Används av kod-återinträde i JoinModal + motståndarens Play now-prompt.
 * activeOnly: true → bara status='active'.
 */
export async function getMatchByRoomCode(code: string, activeOnly = true): Promise<RemoteMatch | null> {
  let query = supabase
    .from('remote_matches')
    .select(MATCH_SELECT)
    .eq('room_code', code.toUpperCase())
    .order('started_at', { ascending: false })
    .limit(1);
  if (activeOnly) query = query.eq('status', 'active');
  const { data, error } = await query;
  if (error) {
    console.warn('[remoteMatches] getMatchByRoomCode failed:', error.message);
    return null;
  }
  const row = (data as RemoteMatchRow[] | null)?.[0];
  return row ? rowToMatch(row) : null;
}

/**
 * Alla matcher jag deltar i, nyaste först (RLS begränsar till deltagare).
 * Driver "1vs1 Matches" på Home + head-to-head i Player History.
 */
export async function getMyMatches(limit = 30): Promise<MyRemoteMatch[]> {
  const userId = await getOwnUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from('remote_matches')
    .select(MATCH_SELECT)
    .order('started_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.warn('[remoteMatches] getMyMatches failed:', error.message);
    return [];
  }
  return ((data as RemoteMatchRow[]) ?? [])
    .map((r) => splitMatchForUser(rowToMatch(r), userId))
    .filter((m): m is MyRemoteMatch => m !== null);
}

/** Egna svar för en match, sorterade på question_index (driver resume). */
export async function getMyAnswers(matchId: string): Promise<RemoteAnswer[]> {
  const userId = await getOwnUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from('remote_match_answers')
    .select('question_index, question_id, correct, points, time_used_seconds')
    .eq('match_id', matchId)
    .eq('user_id', userId)
    .order('question_index', { ascending: true });
  if (error) {
    console.warn('[remoteMatches] getMyAnswers failed:', error.message);
    return [];
  }
  return ((data as {
    question_index: number;
    question_id: string;
    correct: boolean;
    points: number;
    time_used_seconds: number;
  }[]) ?? []).map((r) => ({
    questionIndex: r.question_index,
    questionId: r.question_id,
    correct: r.correct,
    points: r.points,
    timeUsedSeconds: Number(r.time_used_seconds),
  }));
}

/**
 * Bygger /quiz-router-params för att spela/återuppta en remote-match
 * UTAN lobby-kontext (1vs1 Matches-tap eller kod-återinträde efter att
 * rummet dött). Settings rehydreras från match-snapshotten — ALDRIG från
 * lobby_settings (rummet kan vara raderat). selfPlayerId är syntetiskt
 * ('remote-self') men konsekvent inom sessionen — quiz.tsx:s resume-seed
 * och recordRoundScore använder samma värde så attribution håller ihop.
 */
export function buildRemoteQuizParams(my: MyRemoteMatch): Record<string, string> {
  const { match, me } = my;
  return {
    assistance: me.assistance ?? 'standard',
    age: me.age != null ? String(me.age) : '32',
    gameMode: 'remote-1v1',
    remoteMatchId: match.id,
    guestHost: 'false',
    isHost: String(me.isHost),
    selfPlayerId: 'remote-self',
    players: JSON.stringify([
      {
        id: 'remote-self',
        name: me.playerName,
        emoji: '👤',
        assistance: me.assistance ?? 'standard',
        age: me.age ?? undefined,
        spotifyConnected: false,
        type: me.playerType,
      },
    ]),
    roundsCount: String(match.settings.roundsCount),
    answerResponseSeconds: String(match.settings.answerResponseSeconds),
    eraFrom: String(match.settings.eraFrom),
    eraTo: String(match.settings.eraTo),
    youtubeEnabledCategories: JSON.stringify(match.settings.youtubeEnabledCategories),
    imagesEnabledCategories: JSON.stringify(match.settings.imagesEnabledCategories),
    selectedExtraPackages: JSON.stringify(match.settings.selectedExtraPackages),
    spotifyEnabled: 'false',
    roomCode: match.roomCode,
  };
}

// ── Realtime ──────────────────────────────────────────────────────────

// Kanalnamnen MÅSTE vara unika per prenumerations-INSTANS, inte per topic.
// supabase.channel(<samma namn>) returnerar den BEFINTLIGA kanalinstansen,
// och ett andra .subscribe() på en redan prenumererad instans KASTAR
// ("tried to subscribe multiple times"). Vid router.replace mountas nya
// skärmen INNAN den gamla avmonteras → statiskt namn kraschade Home vid
// "Play later"-navigationen (2026-08-07). Räknaren gör varje mount unik;
// unsubscribe via removeChannel städar respektive instans oberoende.
let channelSeq = 0;

/**
 * Prenumererar på UPDATE-events för EN match (t.ex. slutskärmen som väntar
 * på "opponent finished" / question_ids-skrivningen). Returnerar unsubscribe.
 * RLS gäller för postgres_changes — bara deltagare får events.
 */
export function subscribeToMatch(matchId: string, onChange: () => void): () => void {
  const channel = supabase
    .channel(`remote_match:${matchId}:${++channelSeq}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'remote_matches', filter: `id=eq.${matchId}` },
      () => onChange(),
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Prenumererar på ALLA mina matchers förändringar (1vs1 Matches-listan).
 * Inget filter — RLS levererar bara rader jag får SELECT:a. Callbacken bör
 * refetch:a via getMyMatches (payloaden saknar player-embedding).
 */
export function subscribeToMyMatches(onChange: () => void): () => void {
  const channel = supabase
    .channel(`remote_matches:mine:${++channelSeq}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'remote_matches' },
      () => onChange(),
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

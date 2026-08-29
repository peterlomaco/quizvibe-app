// Två-fas re-match för sparade Marathon tables (migration 0041).
//
// Fas 1 (accept): host initierar → createRematchRequest. Övriga deltagare ser
// "Accept re-match" och accepterar → acceptRematchRequest. Host väntar tills
// alla accepterat.
// Fas 2 (start): host trycker "Yes – start re-match" → klienten skapar lobbyn
// (startCompetitionRematch) och markerar request:en startad med rums-koden
// (startRematchRequest) → accepterande deltagare auto-navigeras in via
// Realtime (fallback: en waiting_invite på Home).
//
// Skrivningar går via SECURITY DEFINER-RPC:er (deny-by-default). Läsning via
// RLS (deltagare i competitionen). Realtime på tabellen driver host:ens
// "X of Y"-räknare + deltagarnas auto-nav.

import { supabase } from './supabase';

export type CompetitionRematchStatus =
  | 'active'
  | 'started'
  | 'cancelled'
  | 'expired';

export interface CompetitionRematchRequest {
  id: string;
  leaderboardId: string;
  hostUserId: string;
  status: CompetitionRematchStatus;
  roomCode: string | null;
  acceptedUserIds: string[];
  expiresAt: string;
}

interface RequestRow {
  id: string;
  leaderboard_id: string;
  host_user_id: string;
  status: CompetitionRematchStatus;
  room_code: string | null;
  accepted_user_ids: string[] | null;
  expires_at: string;
}

function rowToRequest(row: RequestRow): CompetitionRematchRequest {
  return {
    id: row.id,
    leaderboardId: row.leaderboard_id,
    hostUserId: row.host_user_id,
    status: row.status,
    roomCode: row.room_code,
    acceptedUserIds: row.accepted_user_ids ?? [],
    expiresAt: row.expires_at,
  };
}

async function ownUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/**
 * Senaste request:en för en competition (active eller started), oavsett
 * expiry — caller avgör själv via status/expiresAt. null om ingen finns.
 * Används när modalen öppnas: en 'active' driver accept/vänta-UI, en 'started'
 * (med room_code) triggar auto-nav för en accepterande deltagare.
 */
export async function getLatestRematchRequest(
  leaderboardId: string,
): Promise<CompetitionRematchRequest | null> {
  const { data, error } = await supabase
    .from('competition_rematch_requests')
    .select('*')
    .eq('leaderboard_id', leaderboardId)
    .in('status', ['active', 'started'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.warn('[rematchRequests] getLatest failed:', error.message);
    return null;
  }
  return data ? rowToRequest(data as RequestRow) : null;
}

/**
 * Antal competitions där en aktiv re-match väntar på MIN accept (host ≠ jag,
 * jag har inte accepterat, inte utgången). Driver Home-knappens signal. RLS
 * scopar redan till mina competitions.
 */
export async function getPendingAcceptRequestCount(): Promise<number> {
  const me = await ownUserId();
  if (!me) return 0;
  const { data, error } = await supabase
    .from('competition_rematch_requests')
    .select('host_user_id, accepted_user_ids, expires_at, status')
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .neq('host_user_id', me);
  if (error) {
    console.warn('[rematchRequests] getPendingAcceptCount failed:', error.message);
    return 0;
  }
  return ((data as { accepted_user_ids: string[] | null }[]) ?? []).filter(
    (r) => !(r.accepted_user_ids ?? []).includes(me),
  ).length;
}

export async function createRematchRequest(
  leaderboardId: string,
): Promise<string | null> {
  const { data, error } = await supabase.rpc('create_competition_rematch_request', {
    p_leaderboard_id: leaderboardId,
  });
  if (error) {
    console.warn('[rematchRequests] create failed:', error.message);
    return null;
  }
  return (data as string) ?? null;
}

export async function acceptRematchRequest(requestId: string): Promise<boolean> {
  const { error } = await supabase.rpc('accept_competition_rematch_request', {
    p_request_id: requestId,
  });
  if (error) {
    console.warn('[rematchRequests] accept failed:', error.message);
    return false;
  }
  return true;
}

export async function startRematchRequest(
  requestId: string,
  roomCode: string,
): Promise<boolean> {
  const { error } = await supabase.rpc('start_competition_rematch_request', {
    p_request_id: requestId,
    p_room_code: roomCode,
  });
  if (error) {
    console.warn('[rematchRequests] start failed:', error.message);
    return false;
  }
  return true;
}

export async function cancelRematchRequest(requestId: string): Promise<void> {
  const { error } = await supabase.rpc('cancel_competition_rematch_request', {
    p_request_id: requestId,
  });
  if (error) {
    console.warn('[rematchRequests] cancel failed:', error.message);
  }
}

// Unikt kanalnamn per prenumeration (samma gotcha som subscribeToMatch):
// supabase.channel(<samma namn>) återanvänder instansen och .on() efter
// subscribe() kastar. Module-räknare garanterar unika namn per mount.
let channelSeq = 0;

/**
 * Prenumererar på ändringar i re-match-requests (INSERT/UPDATE). RLS gör att
 * bara rader för MINA competitions levereras. Callbacken körs vid varje event
 * — caller re-fetchar det den bryr sig om (aktuell request / pending-count).
 */
export function subscribeToRematchRequests(onChange: () => void): () => void {
  channelSeq += 1;
  const channel = supabase
    .channel(`comp_rematch_req:${channelSeq}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'competition_rematch_requests' },
      () => onChange(),
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

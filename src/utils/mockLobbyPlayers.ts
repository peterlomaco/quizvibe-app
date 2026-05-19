// Lobby-players-registry — Fas 3 Slice B.
//
// Tidigare en sessionsbunden Map (mock); från Slice 3B backas detta av
// Supabase `lobby_players`-tabellen så player-listan syncas cross-device
// via Realtime-broadcasts. Filnamnet behålls som `mockLobbyPlayers.ts`
// tills resten av lobby-mock-stores också är portade.
//
// Skriv-mönster:
//   • Host: setLobbyPlayers UPSERT:ar hela lokala players[]-state vid varje
//     ändring. Inga DELETEs i denna funktion — borttagningar (eject) sköts
//     av separat per-row-delete-flöde (Slice 3C). RLS-policy "host manages
//     lobby players" tillåter UPDATE av alla rader i rummet.
//   • Non-host: upsertOwnLobbyPlayer INSERT:ar/UPDATE:ar egen rad vid join
//     (own user_id matchar auth.uid() så RLS "authenticated can join lobby"
//     släpper INSERT, "player can update own row" släpper UPDATE).
//
// Läs-mönster:
//   • Båda sidor läser via getLobbyPlayers (SELECT alla rader, ORDER BY
//     turn_order). I LobbyScreen byts 2s-polling mot Realtime-subscription
//     på lobby_players-tabellen — getLobbyPlayers används initialt och som
//     fallback om Realtime-channel skulle drop:as.

import { ensureAuthSession } from './auth';
import { supabase } from './supabase';
import type { LobbyPlayer } from '../screens/LobbyScreen';

// DB row-shape (snake_case). Mappar till LobbyPlayer via rowToPlayer.
// Type-enum matchar LobbyPlayer:s 'registered' | 'guest' | 'manual'
// ('manual' = host-added via + Add Player, ej en real account).
interface LobbyPlayerRow {
  id: string;
  room_code: string;
  player_id: string;
  user_id: string | null;
  name: string;
  emoji: string;
  avatar_uri: string | null;
  type: 'manual' | 'guest' | 'registered';
  age: number | null;
  assistance: 'minimal' | 'standard' | 'full' | null;
  hcp_override: number | null;
  hcp_complete: boolean;
  is_host: boolean;
  is_ready: boolean;
  approved: boolean;
  turn_order: number;
  lobby_edited: boolean;
  // True när spelaren själv tryckt "Leave Game Lobby" → markOwnPlayerLeft
  // UPDATE:ar denna kolumn så övriga klienter ser kortet med grå "LEFT
  // THIS GAME LOBBY"-styling via Realtime-broadcast (Slice 3C-ii). Raden
  // tas inte bort — vi behåller den så övriga klienter renderar kortet.
  has_left: boolean;
}

function rowToPlayer(row: LobbyPlayerRow): LobbyPlayer {
  return {
    id: row.player_id,
    name: row.name,
    emoji: row.emoji,
    avatarUri: row.avatar_uri ?? undefined,
    type: row.type,
    age: row.age ?? undefined,
    assistance: row.assistance ?? undefined,
    hcpOverride: row.hcp_override ?? undefined,
    hcpComplete: row.hcp_complete,
    isHost: row.is_host,
    isReady: row.is_ready,
    approved: row.approved,
    lobbyEdited: row.lobby_edited,
    hasLeft: row.has_left,
  };
}

// has_left utelämnas medvetet från UPSERT-payload — den kolumnen ägs av
// markOwnPlayerLeft och får inte clobbas av host:s bulk-UPSERT. INSERT:n
// får DB-default (false); UPDATE rör inte oprefererade kolumner.
function playerToRow(
  code: string,
  player: LobbyPlayer,
  index: number,
  userId: string | null,
): Omit<LobbyPlayerRow, 'id' | 'has_left'> {
  return {
    room_code: code,
    player_id: player.id,
    user_id: userId,
    name: player.name,
    // LobbyPlayer.emoji är optional på Player-basen — fallback till
    // generisk avatar-emoji så CHECK NOT NULL inte tripp:as.
    emoji: player.emoji ?? '👤',
    avatar_uri: player.avatarUri ?? null,
    type: player.type ?? 'registered',
    age: player.age ?? null,
    assistance: player.assistance ?? null,
    hcp_override: player.hcpOverride ?? null,
    hcp_complete: player.hcpComplete ?? false,
    is_host: player.isHost ?? false,
    is_ready: player.isReady ?? false,
    approved: player.approved ?? false,
    turn_order: index,
    lobby_edited: player.lobbyEdited ?? false,
  };
}

function normalizeCode(code: string): string {
  return code.toUpperCase();
}

/**
 * Host: skriv hela lokala players[]-state till DB:n (UPSERT på (room_code,
 * player_id)-unique-constraint). turn_order härleds från array-index så
 * läsning kan återställa samma ordning via ORDER BY turn_order.
 *
 * Ingen DELETE här — rader som tagits bort lokalt (host:s eject-flöde)
 * behöver explicit per-row-delete i ejected-flödet (Slice 3C). Detta är
 * medvetet konservativt så host:s state-overwrites inte råkar wipe:a en
 * just-inserterad joiner som ännu inte syncats in i host:s local state.
 *
 * **user_id-bevarande**: host:s UPSERT splittas i två batches — host:s
 * egen rad (med `user_id = hostUserId`) och non-host-rader (UTAN `user_id`-
 * fältet i payload:en). Detta för att non-host:s egen UPSERT av sin rad
 * satte `user_id = auth.uid()` så RLS-policyn "player can update own row"
 * släpper igenom deras egna UPDATE:s (t.ex. markOwnPlayerLeft). Om host:s
 * bulk-UPSERT skulle inkludera `user_id = null` för non-host-raderna
 * skulle Postgres' EXCLUDED.user_id sätta DB:s user_id till null →
 * non-host kan inte längre UPDATE:a sin egen rad → has_left-broadcast:s
 * från Leave Game tappas (UPDATE matchar inga rader). Genom att inte
 * inkludera `user_id` i non-host-payload:en bevaras DB:s befintliga värde.
 *
 * Anropas av useEffect på [players, roomCode] gated på hostMode.
 */
export async function setLobbyPlayers(code: string, players: LobbyPlayer[]): Promise<void> {
  if (!code || players.length === 0) return;
  const normalized = normalizeCode(code);
  const { data: userResp } = await supabase.auth.getUser();
  const hostUserId = userResp.user?.id ?? null;

  // Host:s egen rad — med user_id så host kan UPDATE:a (RLS gates).
  const hostRows = players
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => !!p.isHost)
    .map(({ p, i }) => playerToRow(normalized, p, i, hostUserId));

  // Non-host-rader — strippa user_id ur payload:en så befintligt värde i
  // DB (satt av non-host:ens upsertOwnLobbyPlayer) bevaras. Använder rest-
  // spread istället för att modifiera playerToRow så funktionen kan
  // återanvändas av upsertOwnLobbyPlayer som behöver user_id-fältet.
  const nonHostRows = players
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => !p.isHost)
    .map(({ p, i }) => {
      const { user_id: _omitUserId, ...rest } = playerToRow(normalized, p, i, null);
      return rest;
    });

  if (hostRows.length > 0) {
    const { error } = await supabase
      .from('lobby_players')
      .upsert(hostRows, { onConflict: 'room_code,player_id' });
    if (error) {
      console.warn('[lobbyPlayers] setLobbyPlayers host upsert failed:', error.message);
    }
  }
  if (nonHostRows.length > 0) {
    const { error } = await supabase
      .from('lobby_players')
      .upsert(nonHostRows, { onConflict: 'room_code,player_id' });
    if (error) {
      console.warn('[lobbyPlayers] setLobbyPlayers non-host upsert failed:', error.message);
    }
  }
}

/**
 * Non-host: INSERT (eller UPDATE) egen rad vid join. user_id = auth.uid()
 * så RLS-policy "authenticated can join lobby" + "player can update own row"
 * släpper igenom. Idempotent — re-join (component re-mount) uppdaterar
 * raden istället för att skapa duplikat (UPSERT på unique-constraint).
 *
 * Använder turn_order = 999 som "queued"-placeholder; host:s setLobbyPlayers
 * kommer skriva över till rätt index när joinaren syncas in i host:s state.
 */
export async function upsertOwnLobbyPlayer(code: string, player: LobbyPlayer): Promise<void> {
  if (!code) return;
  const normalized = normalizeCode(code);
  // Guests saknar registrerat konto men RLS kräver authenticated-rollen för
  // INSERT/UPDATE. ensureAuthSession() signar dem in anonymt vid behov så
  // user_id = auth.uid() matchar policies för own-row-write. Registrerade
  // users har redan en session — då är detta en no-op (returnerar befintlig
  // user direkt). Måste köras FÖRE getUser() — annars läser vi null-user
  // direkt efter en helt fresh app-launch.
  await ensureAuthSession();
  const { data: userResp } = await supabase.auth.getUser();
  const userId = userResp.user?.id ?? null;
  // Explicit `has_left: false` i payload:en så re-join efter en tidigare
  // Leave Game alltid resetar flaggan. Två fall den fångar:
  //   (a) Code-only-join där dup-detection ÄRVER det gamla player_id:t —
  //       UPSERT träffar då befintlig rad där has_left=true ligger kvar
  //       sedan tidigare markOwnPlayerLeft. Utan denna reset skulle
  //       LobbyScreen:s render-filter (`!p.hasLeft`) fortsätta exkludera
  //       spelaren och re-join skulle vara osynlig för både self och host.
  //   (b) Guest-join där en NY player_id genereras — INSERT får default
  //       false ändå, men explicit-set:n håller koden symmetrisk med (a).
  // Skiljs medvetet från setLobbyPlayers (host:s bulk-UPSERT) som
  // FORTSATT omittar has_left ur payload:en — host får inte clobba
  // has_left för non-host:s rader vid varje state-sync.
  const row = { ...playerToRow(normalized, player, 999, userId), has_left: false };
  const { error } = await supabase
    .from('lobby_players')
    .upsert(row, { onConflict: 'room_code,player_id' });
  if (error) {
    console.warn('[lobbyPlayers] upsertOwnLobbyPlayer failed:', error.message);
  }
}

/**
 * Markerar att egen spelare lämnat lobbyn (Slice 3C-ii cross-device).
 * UPDATE:ar bara has_left=true på raden där user_id = auth.uid() — RLS
 * "player can update own row" tillåter detta. Realtime-publikationen
 * broadcastar UPDATE-eventet → övriga klienter ser kortet renderat med
 * "LEFT THIS GAME LOBBY"-styling.
 *
 * Anropas av handleGuestLeaveRoom parallellt med AsyncStorage-baserade
 * addLeftPlayer (offline-fallback + test-seed-rum). Idempotent —
 * upprepat anrop är no-op på serverside.
 *
 * Guests utan session faller tillbaka till ensureAuthSession som signar
 * in dem anonymt. Registrerade users har redan en session.
 */
export async function markOwnPlayerLeft(code: string, playerId: string): Promise<void> {
  if (!code || !playerId) return;
  const normalized = normalizeCode(code);
  await ensureAuthSession();
  const { data: userResp } = await supabase.auth.getUser();
  const userId = userResp.user?.id;
  if (!userId) {
    console.warn('[lobbyPlayers] markOwnPlayerLeft: no auth session, skipping');
    return;
  }
  // Eq på både room_code + player_id + user_id ger belt-and-suspenders:
  // även om RLS skulle vara felkonfigurerad träffar UPDATE:n bara raden
  // som verkligen är vår egen. RLS gör samma check men dubbel-säkring
  // kostar inget.
  const { error } = await supabase
    .from('lobby_players')
    .update({ has_left: true })
    .eq('room_code', normalized)
    .eq('player_id', playerId)
    .eq('user_id', userId);
  if (error) {
    console.warn('[lobbyPlayers] markOwnPlayerLeft failed:', error.message);
  }
}

/**
 * Returnerar alla spelare i rummet, ORDER BY turn_order.
 *
 * Tristate return semantics (D-vii bugfix):
 *   • `null`      → Supabase query failed (network/RLS-error).
 *                   Caller bör behålla local state istället för att
 *                   tolka tomheten som "host hasn't written yet".
 *   • `undefined` → Query succeeded men ingen rad finns (matchar tidigare
 *                   mock-semantik så LobbyScreen:s polling tolkar
 *                   "ingen host har skrivit än" som "behåll lokal state").
 *   • `LobbyPlayer[]` → Has rows (kan vara []) — caller använder direkt.
 *
 * Före fix:n returnerade båda fallen `undefined`, vilket gjorde att
 * non-host:s lobby-sync clearade lokala players-listan när non-host:s
 * egen connection blev unstable (Supabase-query failade tyst). Resultat:
 * host försvann från non-host:s view tills connection kom tillbaka.
 */
export async function getLobbyPlayers(code: string): Promise<LobbyPlayer[] | undefined | null> {
  if (!code) return undefined;
  const normalized = normalizeCode(code);
  const { data, error } = await supabase
    .from('lobby_players')
    .select('*')
    .eq('room_code', normalized)
    .order('turn_order', { ascending: true });
  if (error) {
    console.warn('[lobbyPlayers] getLobbyPlayers query failed:', error.message);
    return null;
  }
  return data && data.length > 0 ? (data as LobbyPlayerRow[]).map(rowToPlayer) : undefined;
}

/**
 * Rensar storen för en rumkod. Anropas av host:s "Delete this Game Lobby"-
 * flöde — DELETE CASCADE på rooms tar bort rader också, men explicit
 * DELETE här som belt-and-suspenders om host kallar clearLobbyPlayers
 * utan att också deactivateRoom (t.ex. Quit Game från quiz.tsx).
 *
 * Idempotent — clear på okänd kod är no-op.
 */
export async function clearLobbyPlayers(code: string): Promise<void> {
  if (!code) return;
  const normalized = normalizeCode(code);
  const { error } = await supabase.from('lobby_players').delete().eq('room_code', normalized);
  if (error) {
    console.warn('[lobbyPlayers] clearLobbyPlayers failed:', error.message);
  }
}

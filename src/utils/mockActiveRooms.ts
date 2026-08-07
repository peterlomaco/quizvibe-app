// Aktivt rum-registry — Fas 3 Slice A.
//
// Tidigare en sessionsbunden Map i minnet (mock); från Slice 3A backas detta
// av Supabase `rooms`-tabellen så room codes funkar cross-device. Filnamnet
// behålls som `mockActiveRooms.ts` tills resten av lobby-mock-stores
// (mockLobbyPlayers, mockLobbySettings, mockStartedGames) också är portade
// i Slice 3B/3C — då döper vi om hela bunten i ett svep.
//
// Lifecycle:
//   • Host skapar en Game → registerActiveRoom(code, meta) INSERT:ar i rooms
//   • Auto-expiry: 24h efter creation (expires_at) ELLER när host trycker
//     Start Game (game_started=true). isActiveRoom filtrerar bort båda.
//   • Lobby-state syncar count/maxPlayers tillbaka via setRoomPlayerCount /
//     setRoomMaxPlayers → UPDATE i rooms
//   • Guest/registrerad user joinar → isActiveRoom + isLobbyFull i join-flödet
//
// API:t är nu async (returnerar Promises). Call-sites måste await:a.
//
// Test-seeds finns kvar som in-memory fallback för dev/QA — joinar du med
// dessa funkar det alltid, även utan att skapa rum mot DB:n.

import { supabase } from './supabase';

export interface RoomMeta {
  // Host:s valda max-spelare-cap (4 = Basic/Free, 12 = Premium-tier).
  maxPlayers: 2 | 4 | 12;
  // Avgör popup-meddelandet när lobbyn är full. Free → "or to upgrade"-CTA,
  // Premium → "remove players"-only. Hardcodad till false från Create Game
  // tills riktig subscription-state finns på ProfileData.
  hostIsPremium: boolean;
  // Antal spelare för tillfället i lobbyn (host + approved + waiting; exkl.
  // de som lämnat). Syncas från LobbyScreen via setRoomPlayerCount.
  currentPlayerCount: number;
  // Host:s playerName — används av isOwnLobby för att blockera försök att
  // joina sin egen lobby (t.ex. samma user inloggad på två enheter, försöker
  // använda Join Game från device B med koden från device A). Lowercase-
  // jämförelse i isOwnLobby så case-mismatch inte slipper igenom.
  hostPlayerName: string;
  // True när host tryckt Start Game (markRoomGameStarted satte rooms.game_started=true).
  // Non-host:s Realtime-subscription på rooms-tabellen läser detta för att
  // navigera approved spelare till /quiz när host startar (Slice 3C-i).
  gameStarted: boolean;
}

// Dev/test-seeds som lagras lokalt i minnet (inte i DB) så de alltid är
// joinable för manuell QA. Tar fortsatt syntetiska hostPlayerName-värden
// som inte kolliderar med real-user-namn så isOwnLobby aldrig fyrar.
//
// Lookup-ordning: DB först (riktiga rum), sedan dessa seeds.
const TEST_ROOM_SEEDS = new Map<string, RoomMeta>([
  ['AB23XY', { maxPlayers: 4, hostIsPremium: false, currentPlayerCount: 1, hostPlayerName: 'TestSeedHost1', gameStarted: false }],
  ['QV45LV', { maxPlayers: 12, hostIsPremium: true, currentPlayerCount: 1, hostPlayerName: 'TestSeedHost2', gameStarted: false }],
  ['AB99FF', { maxPlayers: 4, hostIsPremium: false, currentPlayerCount: 4, hostPlayerName: 'TestSeedHost3', gameStarted: false }],
  ['QV99FF', { maxPlayers: 12, hostIsPremium: true, currentPlayerCount: 12, hostPlayerName: 'TestSeedHost4', gameStarted: false }],
]);

// DB row-shape (snake_case). Mappar till RoomMeta via rowToMeta nedan.
interface RoomRow {
  code: string;
  host_user_id: string;
  host_player_name: string;
  max_players: 2 | 4 | 12;
  host_is_premium: boolean;
  current_player_count: number;
  game_started: boolean;
  expires_at: string;
}

function rowToMeta(row: RoomRow): RoomMeta {
  return {
    maxPlayers: row.max_players,
    hostIsPremium: row.host_is_premium,
    currentPlayerCount: row.current_player_count,
    hostPlayerName: row.host_player_name,
    gameStarted: row.game_started,
  };
}

function normalizeCode(code: string): string {
  return code.toUpperCase();
}

/**
 * Registrerar en kod som aktivt rum i Supabase + host-metadata. Anropas
 * av host-flow:n (handleCreateGame, Play Again). Användaren måste vara
 * inloggad — INSERT går mot rooms-tabellen där RLS kräver host_user_id =
 * auth.uid(). Re-registrera samma kod (sällsynt — Play Again ska alltid
 * generera ny kod) skriver över via upsert.
 *
 * Returnerar TRUE när rummet faktiskt skrevs till DB, FALSE vid saknad
 * session eller upsert-fel (loggas som warn). Call-sites SKA kontrollera
 * returvärdet och visa Alert + abort:a navigationen vid false — annars
 * hamnar host i en fantom-lobby som joiners inte hittar ("Room not
 * found"-buggen 2026-08-07: tyst no-op → host såg normal lobby lokalt
 * medan rums-raden aldrig existerade). Idempotent.
 */
export async function registerActiveRoom(code: string, meta: RoomMeta): Promise<boolean> {
  const normalized = normalizeCode(code);
  const { data: userResp } = await supabase.auth.getUser();
  const user = userResp.user;
  if (!user) {
    console.warn('[activeRooms] registerActiveRoom called without session — host must be signed in.');
    return false;
  }
  const { error } = await supabase.from('rooms').upsert({
    code: normalized,
    host_user_id: user.id,
    host_player_name: meta.hostPlayerName,
    max_players: meta.maxPlayers,
    host_is_premium: meta.hostIsPremium,
    current_player_count: meta.currentPlayerCount,
    game_started: false,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
  if (error) {
    console.warn('[activeRooms] registerActiveRoom failed:', error.message);
    return false;
  }
  return true;
}

/**
 * True om koden är registrerad SOM JOINBAR — dvs DB-rad finns OCH inte
 * expired OCH game_started=false. Test-seeds returnerar alltid true.
 *
 * Används av join-flöden (handleJoinWithCode, handleJoinAsGuest,
 * handleAcceptInvite) som vill blockera join på döda/expired rum.
 * För polling-detection ("rummet finns fortfarande?") använd roomExists
 * istället så non-hosts inte felaktigt kickas när host startar spelet.
 */
export async function isActiveRoom(code: string): Promise<boolean> {
  if (!code) return false;
  const normalized = normalizeCode(code);
  if (TEST_ROOM_SEEDS.has(normalized)) return true;
  const { data, error } = await supabase
    .from('rooms')
    .select('code')
    .eq('code', normalized)
    .eq('game_started', false)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  if (error) {
    console.warn('[activeRooms] isActiveRoom query failed:', error.message);
    return false;
  }
  return !!data;
}

/**
 * True om DB-raden FINNS (oavsett game_started). Används av Lobby:s 2s-
 * polling för att detektera host-deletion utan att felaktigt trigga
 * "lobby deleted"-popupen när host startar spelet (då finns raden kvar
 * men game_started=true). 24h-expiry filtreras fortfarande.
 *
 * **Network-error semantics**: returnerar `true` vid Supabase-fel
 * (nätverks-glitch, RLS-denial, etc.) eftersom call-site:n (non-host:s
 * 2s-deletion-polling) triggar "lobby deleted"-Alert vid `false`.
 * Network-error ≠ deletion — nästa poll med uppkoppling tillbaka ger
 * den riktiga statusen. Utan denna fail-open-semantik kickades
 * non-hosts felaktigt när deras egen connection blev unstable.
 */
export async function roomExists(code: string): Promise<boolean> {
  if (!code) return false;
  const normalized = normalizeCode(code);
  if (TEST_ROOM_SEEDS.has(normalized)) return true;
  const { data, error } = await supabase
    .from('rooms')
    .select('code')
    .eq('code', normalized)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  if (error) {
    console.warn('[activeRooms] roomExists query failed:', error.message);
    // Fail-open: behåll antagandet att rummet finns. Polling-loopen
    // försöker igen om 2s — om host faktiskt deletat rummet detekteras
    // det så fort uppkopplingen är tillbaka.
    return true;
  }
  return !!data;
}

/**
 * Tar bort rummet från DB. Anropas av host vid "Delete this Game Lobby"
 * via TopUserBanner. Efter detta returnerar isActiveRoom/roomExists false
 * → join-flöden visar "Room not found", kvarvarande non-hosts i lobby:n
 * får deletion-popup via polling-detection.
 *
 * Idempotent — delete på okänd kod är no-op. Test-seeds påverkas inte
 * (de finns bara i minnet, inte i DB).
 */
export async function deactivateRoom(code: string): Promise<void> {
  if (!code) return;
  const normalized = normalizeCode(code);
  const { error } = await supabase.from('rooms').delete().eq('code', normalized);
  if (error) {
    console.warn('[activeRooms] deactivateRoom failed:', error.message);
  }
}

/**
 * Markerar att host startat spelet. Sätter game_started=true så rummet
 * räknas som "inaktivt" för join-flöden (isActiveRoom). Vi rör INTE
 * expires_at — rummet behöver fortsatt "exist" så non-hosts som ev.
 * inte hunnit navigera till /quiz inte fellaktigt kickas av Lobby:s
 * room-deletion-polling (som använder roomExists, inte isActiveRoom).
 * pg_cron-cleanup tar bort raden efter 24h:s naturliga expiry.
 *
 * Anropas av handleStartGame i LobbyScreen + Play Again-flödet.
 * Test-seeds påverkas inte (in-memory).
 */
export async function markRoomGameStarted(code: string): Promise<void> {
  if (!code) return;
  const normalized = normalizeCode(code);
  if (TEST_ROOM_SEEDS.has(normalized)) return;
  const { error } = await supabase
    .from('rooms')
    .update({ game_started: true })
    .eq('code', normalized);
  if (error) {
    console.warn('[activeRooms] markRoomGameStarted failed:', error.message);
  }
}

/**
 * Returnerar lagrad metadata för rummet (oavsett game_started — så Lobby
 * kan fortsatt visa host-info även efter game start). 24h-expiry filtreras
 * fortfarande bort.
 *
 * Test-seeds returneras från in-memory om koden matchar; annars DB-query.
 * Undefined om inget hittas — caller bör först köra isActiveRoom innan
 * getRoomMeta för tydligare felmeddelanden.
 */
export async function getRoomMeta(code: string): Promise<RoomMeta | undefined> {
  if (!code) return undefined;
  const normalized = normalizeCode(code);
  const seed = TEST_ROOM_SEEDS.get(normalized);
  if (seed) return seed;
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', normalized)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  if (error) {
    console.warn('[activeRooms] getRoomMeta query failed:', error.message);
    return undefined;
  }
  return data ? rowToMeta(data as RoomRow) : undefined;
}

/**
 * True om rummet är registrerat OCH currentPlayerCount >= maxPlayers.
 * Fail-open: returnerar false om rummet saknar meta. Anropas av
 * checkLobbyCapacity i join-handlers.
 */
export async function isLobbyFull(code: string): Promise<boolean> {
  const meta = await getRoomMeta(code);
  if (!meta) return false;
  return meta.currentPlayerCount >= meta.maxPlayers;
}

/**
 * Skriver count till DB. Anropas från LobbyScreen:s useEffect på `players`
 * så DB alltid speglar lobby:s aktuella spelar-antal. No-op på test-seeds
 * (in-memory snapshot förändras inte) och på okända koder.
 */
export async function setRoomPlayerCount(code: string, count: number): Promise<void> {
  if (!code) return;
  const normalized = normalizeCode(code);
  if (TEST_ROOM_SEEDS.has(normalized)) return;
  const { error } = await supabase
    .from('rooms')
    .update({ current_player_count: count })
    .eq('code', normalized);
  if (error) {
    console.warn('[activeRooms] setRoomPlayerCount failed:', error.message);
  }
}

/**
 * Skriver maxPlayers till DB när host byter Game Mode (PtP=4, IndDev=12 —
 * deriverat automatiskt från gameMode sedan 2026-05-25). Speglar host:s
 * aktuella val så join-flödets full-check baseras på samma cap som UI:t
 * visar. No-op på test-seeds och okända koder.
 */
export async function setRoomMaxPlayers(code: string, maxPlayers: 2 | 4 | 12): Promise<void> {
  if (!code) return;
  const normalized = normalizeCode(code);
  if (TEST_ROOM_SEEDS.has(normalized)) return;
  const { error } = await supabase
    .from('rooms')
    .update({ max_players: maxPlayers })
    .eq('code', normalized);
  if (error) {
    console.warn('[activeRooms] setRoomMaxPlayers failed:', error.message);
  }
}

/**
 * True om `playerName` matchar rummets host (case-insensitive trim). Driver
 * "User already exists in the lobby"-popupen i join-handlers när samma user
 * är inloggad på två enheter och försöker joina sin egen lobby från device B.
 * Returnerar false om koden saknar meta eller playerName är tomt — fail-open
 * så join-flödet inte oavsiktligt blockerar nya users.
 */
export async function isOwnLobby(code: string, playerName: string | null | undefined): Promise<boolean> {
  if (!playerName) return false;
  const meta = await getRoomMeta(code);
  if (!meta) return false;
  return meta.hostPlayerName.trim().toLowerCase() === playerName.trim().toLowerCase();
}

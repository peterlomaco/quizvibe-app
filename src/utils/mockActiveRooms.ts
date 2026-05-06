// Mock-store för "aktivt registrerade rum" — sessionsbunden Map i minnet
// (förstörs vid app-reload). Används för att kunna ge realistisk feedback
// i join-flöden ("There is no Room code activated with this combination" +
// "Lobby is full ...") utan backend.
//
// Lifecycle:
//   • Host skapar en Game (Create Game / Play Again) → registerActiveRoom(code, meta)
//   • Lobby-state syncar count/maxPlayers tillbaka via setRoomPlayerCount /
//     setRoomMaxPlayers när players ändras eller host togglar Max 4/12
//   • Guest/registrerad user joinar → isActiveRoom + isLobbyFull i join-flödet
//
// När backend kopplas in ersätts detta med API-calls (`GET /rooms/:code`
// returnerar både existence och meta i samma round-trip). Call-sites
// (handleCreateGame, handleJoinWithCode, handleJoinAsGuest, LobbyScreen
// useEffect:s) byter implementation utan att ändra signatur.
//
// Test-seed-koder finns för manuell QA — joinar du med dessa funkar det
// alltid även utan att ha skapat ett rum först.

export interface RoomMeta {
  // Host:s valda max-spelare-cap (4 = Basic/Free, 12 = Premium-tier).
  // Lobby:n syncar tillbaka när host togglar Max 4/12 i UI:t.
  maxPlayers: 4 | 12;
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
}

const ACTIVE_ROOMS = new Map<string, RoomMeta>([
  // Dev/test-seeds — joinable (gott om kapacitet kvar). hostPlayerName
  // satt till syntetiska värden som inte matchar några real-user-namn så
  // isOwnLobby aldrig fyrar mot seeds.
  ['AB23XY', { maxPlayers: 4, hostIsPremium: false, currentPlayerCount: 1, hostPlayerName: 'TestSeedHost1' }],
  ['QV45LV', { maxPlayers: 12, hostIsPremium: true, currentPlayerCount: 1, hostPlayerName: 'TestSeedHost2' }],
  // Dev/test-seeds — FULLA, för att verifiera lobby-full-popups:
  //   AB99FF → Free host, max 4, count 4 → "or to upgrade"-meddelande
  //   QV99FF → Premium host, max 12, count 12 → "remove players"-meddelande
  ['AB99FF', { maxPlayers: 4, hostIsPremium: false, currentPlayerCount: 4, hostPlayerName: 'TestSeedHost3' }],
  ['QV99FF', { maxPlayers: 12, hostIsPremium: true, currentPlayerCount: 12, hostPlayerName: 'TestSeedHost4' }],
]);

/**
 * Registrerar en kod som aktiv i sessionen + lagrar host:s metadata. Kallas
 * av host-flow:n när ett nytt rum skapas. Re-registrera samma kod skriver
 * över meta:n (defensivt — Play Again borde alltid generera ny kod, men
 * idempotensen skadar inte).
 */
export function registerActiveRoom(code: string, meta: RoomMeta): void {
  ACTIVE_ROOMS.set(code.toUpperCase(), meta);
}

/**
 * True om koden är registrerad som aktivt rum. Case-insensitive.
 * Tomma strängar returnerar false.
 */
export function isActiveRoom(code: string): boolean {
  if (!code) return false;
  return ACTIVE_ROOMS.has(code.toUpperCase());
}

/**
 * Tar bort koden från aktiva rum. Kallas av host-flow:n när host väljer
 * "Delete this Game Lobby" via TopUserBanner. Efter detta returnerar
 * isActiveRoom(code) false → join-flöden visar "Room not found"-Alert
 * och kvarvarande non-hosts i lobby:n får en deletion-popup via
 * polling-detection i LobbyScreen.
 *
 * Idempotent — deactivate på okänd kod är no-op.
 */
export function deactivateRoom(code: string): void {
  if (!code) return;
  ACTIVE_ROOMS.delete(code.toUpperCase());
}

/**
 * Returnerar lagrad metadata för rummet (max-spelare, host-Premium-status,
 * aktuell spelar-count). Undefined om koden inte är registrerad — caller
 * bör först köra isActiveRoom innan getRoomMeta för tydligare felmeddelanden.
 */
export function getRoomMeta(code: string): RoomMeta | undefined {
  if (!code) return undefined;
  return ACTIVE_ROOMS.get(code.toUpperCase());
}

/**
 * True om rummet är registrerat OCH currentPlayerCount >= maxPlayers.
 * Fail-open: returnerar false om rummet saknar meta (vilket inte borde
 * hända i normalfall — registreras alltid via registerActiveRoom).
 */
export function isLobbyFull(code: string): boolean {
  const meta = getRoomMeta(code);
  if (!meta) return false;
  return meta.currentPlayerCount >= meta.maxPlayers;
}

/**
 * Skriver count till registry. Anropas från LobbyScreen:s useEffect på
 * `players` så registry alltid speglar lobby:s aktuella spelar-antal.
 * No-op om koden inte är registrerad (skydd mot stale syncs efter att
 * host har raderat rummet).
 */
export function setRoomPlayerCount(code: string, count: number): void {
  const meta = getRoomMeta(code);
  if (!meta) return;
  ACTIVE_ROOMS.set(code.toUpperCase(), { ...meta, currentPlayerCount: count });
}

/**
 * Skriver maxPlayers till registry när host togglar Max 4/12 i Lobby:s
 * Number of Players-toggle. Speglar host:s aktuella val så join-flödets
 * full-check baseras på samma cap som UI:t visar. No-op vid okänd kod.
 */
export function setRoomMaxPlayers(code: string, maxPlayers: 4 | 12): void {
  const meta = getRoomMeta(code);
  if (!meta) return;
  ACTIVE_ROOMS.set(code.toUpperCase(), { ...meta, maxPlayers });
}

/**
 * True om `playerName` matchar rummets host (case-insensitive trim). Driver
 * "User already exists in the lobby"-popupen i join-handlers när samma user
 * är inloggad på två enheter och försöker joina sin egen lobby från device B.
 * Returnerar false om koden saknar meta eller playerName är tomt — fail-open
 * så join-flödet inte oavsiktligt blockerar nya users.
 */
export function isOwnLobby(code: string, playerName: string | null | undefined): boolean {
  if (!playerName) return false;
  const meta = getRoomMeta(code);
  if (!meta) return false;
  return meta.hostPlayerName.trim().toLowerCase() === playerName.trim().toLowerCase();
}

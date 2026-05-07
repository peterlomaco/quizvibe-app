// In-memory `Set<string>` över rumkoder där host har tryckt "Start Game" och
// gått vidare till quiz-skärmen. Driver non-host:s detection-popup
// "Host started game without this user" — en spelare som fortfarande sitter
// kvar i lobbyn (typ ej approved) blir notifierad och kastas till Home när
// host startar utan dem.
//
// Sessions-bunden mock i avsaknad av backend (förstörs vid app-reload).
// Konventionen följer `mockActiveRooms`/`mockLobbyPlayers`-stores: samma
// signatur som ett framtida API-anrop kommer att ha så call-sites förblir
// oförändrade när impl byts ut.

const STARTED_ROOMS = new Set<string>();

/** Host kallar denna i `handleStartGame` strax innan router.push till /quiz. */
export function markGameStarted(roomCode: string): void {
  STARTED_ROOMS.add(roomCode);
}

/** Non-host:s polling-effekt anropar denna varannan sekund. */
export function isGameStarted(roomCode: string): boolean {
  return STARTED_ROOMS.has(roomCode);
}

/**
 * Kallas från cleanup-bunten på alla lifecycle-sites där rumkod-state ska
 * resetas: Lobby Delete, Quiz Quit (host mid-game), Quiz Play Again (ny kod
 * → rensa även ev. gammal kod), Home Create Game. Idempotent.
 */
export function clearGameStarted(roomCode: string): void {
  STARTED_ROOMS.delete(roomCode);
}

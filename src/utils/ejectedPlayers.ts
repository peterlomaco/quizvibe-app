// Mock-store för spelare som host:en har radarat (trash-action) ur lobbyn.
// Sessionsbunden in-memory Map<rumkod, Set<playerId>>; förstörs vid app-reload.
//
// Lifecycle:
//   • Host trycker papperskorgs-knappen på en spelare → handleDeletePlayer
//     filtrerar spelaren ur lokal players[] OCH anropar markEjected(roomCode,
//     playerId) här.
//   • Non-host:s LobbyScreen poll:ar isEjected(roomCode, ownPlayerIdRef.current)
//     och visar "User have been removed from this lobby"-popup om träff.
//   • host:s "Delete this Game Lobby" + handleQuitGame + handleCreateGame /
//     Play Again rensar storen via clearEjected för fresh slate på återanvänd
//     kod.
//
// När backend kommer in ersätts detta med en server-driven event/notification
// (WS push från host:s mutation) — call-sites byter implementation utan
// signatur-ändringar.

const EJECTED = new Map<string, Set<string>>();

/**
 * Markerar `playerId` som radarad ur `code`:s lobby. Idempotent — flera
 * markeringar av samma id är no-op. No-op vid tomma argument.
 */
export function markEjected(code: string, playerId: string): void {
  if (!code || !playerId) return;
  const upper = code.toUpperCase();
  const set = EJECTED.get(upper) ?? new Set<string>();
  set.add(playerId);
  EJECTED.set(upper, set);
}

/**
 * True om `playerId` finns i `code`:s eject-lista. False vid tomma argument
 * eller okänd kod (fail-open så ingen oavsiktligt visas som "ejected").
 */
export function isEjected(code: string, playerId: string): boolean {
  if (!code || !playerId) return false;
  return EJECTED.get(code.toUpperCase())?.has(playerId) ?? false;
}

/**
 * Rensar hela eject-listan för en rumkod. Anropas vid lobby-radering och
 * vid skapande/återanvändande av kod så stale eject-status från en tidigare
 * session inte ärvs in i den färska lobbyn. Idempotent.
 */
export function clearEjected(code: string): void {
  if (!code) return;
  EJECTED.delete(code.toUpperCase());
}

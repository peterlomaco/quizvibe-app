// Mock-store för "aktivt registrerade rum" — sessionsbunden Set i minnet
// (förstörs vid app-reload). Används för att kunna ge realistiskt feedback
// i join-flöden ("There is no Room code activated with this combination")
// utan backend.
//
// Lifecycle:
//   • Host skapar en Game (Create Game / Play Again) → registerActiveRoom(code)
//   • Guest/registrerad user joinar → isActiveRoom(code) checkas innan navigation
//
// När backend kopplas in ersätts detta med ett API-call (`GET /rooms/:code`
// eller liknande). Call-sites (handleCreateGame, handleJoinWithCode,
// handleJoinAsGuest) byter implementation utan att ändra signatur.
//
// Test-seed-koder finns för manuell QA — joinar du med dessa funkar det
// alltid även utan att ha skapat ett rum först.

const ACTIVE_ROOM_CODES = new Set<string>([
  // Dev/test-seeds — kan tas bort när backend är inkopplad.
  'AB23XY',
  'QV45LV',
]);

/**
 * Registrerar en kod som aktiv i sessionen. Kallas av host-flow:n när ett
 * nytt rum skapas. Idempotent — re-registrera samma kod är no-op.
 */
export function registerActiveRoom(code: string): void {
  ACTIVE_ROOM_CODES.add(code.toUpperCase());
}

/**
 * True om koden är registrerad som aktivt rum. Case-insensitive.
 * Tomma strängar returnerar false.
 */
export function isActiveRoom(code: string): boolean {
  if (!code) return false;
  return ACTIVE_ROOM_CODES.has(code.toUpperCase());
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
  ACTIVE_ROOM_CODES.delete(code.toUpperCase());
}

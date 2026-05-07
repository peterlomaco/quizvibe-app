// Mock-store för host:s authoritative player-lista per rumkod. Sessionsbunden
// in-memory Map (förstörs vid app-reload).
//
// Lifecycle:
//   • Host:s LobbyScreen skriver players[]-state till storen via useEffect på
//     varje ändring (setLobbyPlayers).
//   • Non-host:s LobbyScreen poll:ar storen var 2:a sekund och syncar lokal
//     player-state med host:s lista (filtrerad till approved + self).
//   • host:s "Delete this Game Lobby"-flöde anropar clearLobbyPlayers så
//     storen rensas tillsammans med room-meta:n.
//
// När backend kopplas in ersätts detta med en server-cache (REST/WS) — call-
// sites byter implementation utan signatur-ändringar.
//
// Viktigt: importerar `LobbyPlayer` som type-only för att undvika runtime-
// circulär importrelation (LobbyScreen → utils → LobbyScreen). Endast typen
// används vid kompilering, inte koden.

import type { LobbyPlayer } from '../screens/LobbyScreen';

const LOBBY_PLAYERS = new Map<string, LobbyPlayer[]>();

/**
 * Skriver host:s player-lista till storen. Kallas av host:s LobbyScreen-
 * useEffect på varje ändring av players[]. Shallow-copy:ar varje spelare
 * så efterföljande mutationer i host:s state inte påverkar non-host:s
 * snapshot. No-op vid tom rumkod.
 */
export function setLobbyPlayers(code: string, players: LobbyPlayer[]): void {
  if (!code) return;
  LOBBY_PLAYERS.set(code.toUpperCase(), players.map((p) => ({ ...p })));
}

/**
 * Returnerar host:s aktuella player-lista. undefined om host:en aldrig har
 * skrivit till storen (typiskt: non-host joinade via kod på device där host
 * inte är aktiv — mock-only edge case). Non-host:s LobbyScreen tolkar
 * undefined som "behåll nuvarande lokal state" så användaren inte ser sin
 * egen player-rad försvinna mellan polls.
 */
export function getLobbyPlayers(code: string): LobbyPlayer[] | undefined {
  if (!code) return undefined;
  const stored = LOBBY_PLAYERS.get(code.toUpperCase());
  return stored ? stored.map((p) => ({ ...p })) : undefined;
}

/**
 * Rensar storen för en rumkod. Kallas av host:s "Delete this Game Lobby"-
 * flöde tillsammans med deactivateRoom. Idempotent — clear på okänd kod
 * är no-op.
 */
export function clearLobbyPlayers(code: string): void {
  if (!code) return;
  LOBBY_PLAYERS.delete(code.toUpperCase());
}

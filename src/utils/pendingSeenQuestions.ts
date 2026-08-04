// In-memory hand-off av cross-player seen-historik från LobbyScreen till
// quiz.tsx (samma mock-store-mönster som pendingLobby/mockActiveRooms).
//
// Host:s handleStartGame läser alla deltagares publicerade fråge-historik
// ur lobby_players (getLobbySeenQuestionIds) och stash:ar union:en här,
// keyed på rumkod. quiz.tsx konsumerar vid mount och merge:ar in i
// peerSeenIds/peerLastIds så pool-bygget exkluderar frågor som NÅGON
// deltagare sett i sina senaste 20 spel.
//
// In-memory räcker: host navigerar Lobby → Quiz i samma JS-process, och
// bara host-enheten bygger den auktoritativa fråge-poolen.

export interface PeerSeenSnapshot {
  /** Union av alla deltagares 20-sessions-historik (fråge-IDs). */
  seen: string[];
  /** Union av alla deltagares senaste-session-IDs (hård exkludering). */
  last: string[];
}

const pending = new Map<string, PeerSeenSnapshot>();

export function setPendingPeerSeenIds(code: string, snapshot: PeerSeenSnapshot): void {
  if (!code) return;
  pending.set(code.toUpperCase(), snapshot);
}

/** Hämtar OCH rensar snapshot:en för koden (one-shot-konsumtion). */
export function consumePendingPeerSeenIds(code: string): PeerSeenSnapshot | null {
  if (!code) return null;
  const key = code.toUpperCase();
  const snap = pending.get(key) ?? null;
  pending.delete(key);
  return snap;
}

// Non-host game roster (Build 41, 2026-11-26).
//
// The roster a non-host takes into /quiz (Individual Devices and the
// Pass-the-Phone follower view both go through LobbyScreen's
// goToQuizAsNonHost). getLobbyPlayers → get_lobby_roster returns EVERY
// lobby_players row, including players who left (has_left = true).
//
// - v2 rooms: exactly the frozen participants (start_lobby_game), in the
//   frozen order. Unchanged.
// - legacy rooms: approved players + host, MINUS anyone who left. Leaving
//   keeps approved = true, so without the hasLeft check an approved guest
//   who left before the start showed up as a player on the non-host's Final
//   Leaderboard (two "no answer" rows). Same rule as the host's own roster
//   (approvedPlayers = isPlayerApproved && !hasLeft).

export interface RosterRow {
  id: string;
  approved?: boolean;
  isHost?: boolean;
  hasLeft?: boolean;
}

export function buildNonHostRoster<T extends RosterRow>(
  playersStored: readonly T[] | null | undefined,
  frozenIds: readonly string[] | null | undefined,
): T[] {
  const rows = playersStored ?? [];
  if (frozenIds) {
    return frozenIds
      .map((id) => rows.find((p) => p.id === id))
      .filter((p): p is T => !!p);
  }
  return rows.filter((p) => (!!p.approved || !!p.isHost) && !p.hasLeft);
}

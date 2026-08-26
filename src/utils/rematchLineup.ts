/**
 * Låst spelaruppsättning i re-match-lobbyn (migration 0037).
 *
 * En re-match ska innehålla EXAKT spelarna från föregående spel — annars
 * blir aggregatet inte längre en rättvis serie: en spelare som tillkommer
 * mitt i har inte spelat samma spel som de andra.
 *
 * UI:t förhindrar ändringen (inga tillägg, inga borttag), men en spelare kan
 * ändå ha tryckt Leave eller ännu inte hunnit tillbaka in i lobbyn. Då ska
 * Start Game blockeras tills de är på plats.
 *
 * Ren funktion utan React/Supabase så regeln kan enhetstestas.
 */

export interface RematchLineupPlayer {
  id: string;
  name: string;
  hasLeft?: boolean;
}

/**
 * De förväntade spelare som INTE är på plats just nu, i den ordning de
 * väntades. En spelare räknas som på plats när raden finns och inte är
 * markerad `hasLeft`.
 *
 * Tom `expectedIds` (rums-raden skrevs utan 0037-fälten) → ingen blockering.
 * Det är rätt riktning att fela åt: låsningen i UI:t gäller ändå, och host
 * ska inte kunna fastna i en lobby de inte kan starta.
 */
export function findMissingRematchPlayers(
  expectedIds: readonly string[],
  players: readonly RematchLineupPlayer[],
): { id: string; name: string | null }[] {
  if (expectedIds.length === 0) return [];
  const present = new Set(players.filter((p) => !p.hasLeft).map((p) => p.id));
  return expectedIds
    .filter((id) => !present.has(id))
    .map((id) => ({
      // Namnet ligger kvar på raden även när spelaren markerats hasLeft, så
      // vi kan säga VEM vi väntar på i stället för bara ett antal.
      id,
      name: players.find((p) => p.id === id)?.name ?? null,
    }));
}

/** "Anna, Bo" — eller "2 players" när inga namn finns kvar att visa. */
export function describeMissingPlayers(
  missing: readonly { name: string | null }[],
): string {
  const names = missing.map((m) => m.name).filter((n): n is string => !!n);
  if (names.length > 0) return names.join(', ');
  return `${missing.length} ${missing.length === 1 ? 'player' : 'players'}`;
}

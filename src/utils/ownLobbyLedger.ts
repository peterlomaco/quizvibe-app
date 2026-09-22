import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * "Own lobby ledger" — DENNA ENHETS lokala minne av vilka lobby_players-
 * deltaganden (rumkod + player_id) den SJÄLV skapade. AsyncStorage, device-
 * scoped (en enda nyckel, ingen per-konto-namespacing).
 *
 * Driver two-device-guardens (checkActiveElsewhere / activeLobbyGuard.ts)
 * åtskillnad mellan:
 *   • EGET övergivet deltagande (samma enhet, ligger kvar has_left=false efter
 *     force-quit / stängd quiz-vy / avslutat spel) → finns i ledgern → städas
 *     tyst, INGEN popup.
 *   • FRÄMMANDE aktivt deltagande (skapat av en ANNAN enhet med samma konto)
 *     → saknas i ledgern → popupen fyrar (genuin cross-device-kollision).
 *
 * Varför device-scoped (inte per-konto): guardens DB-uppslag är redan
 * `user_id = auth.uid()`-scopat, så en ledger-nyckel kan bara någonsin leda
 * till en tyst reclaim av en rad som FAKTISKT är det inloggade kontots egen.
 * En stale nyckel från ett annat konto matchar aldrig en rad guarden får
 * tillbaka. clearOwnMemberships() körs ändå vid logout för renlighet.
 *
 * Nyckelformat: `${normalizeCode(roomCode)}:${playerId}` — samma normalisering
 * (toUpperCase) som mockActiveRooms/mockLobbyPlayers använder, så nycklarna
 * matchar exakt de `roomCode` som findOtherActiveMembershipsForUser returnerar.
 *
 * Alla operationer fail-open: läs/skriv-fel loggas och sväljs, aldrig kastas —
 * en trasig ledger ska aldrig blockera eller krascha spelflödet.
 */

const LEDGER_KEY = '@quizvibe/ownLobbyLedger/v1';

// Lokal kopia av mockActiveRooms/mockLobbyPlayers normalizeCode — medvetet
// duplicerad så modulen inte importerar dem (undviker cirkulär dep: bägge
// importerar den här modulen).
function normalizeCode(code: string): string {
  return code.toUpperCase();
}

function membershipKey(roomCode: string, playerId: string): string {
  return `${normalizeCode(roomCode)}:${playerId}`;
}

async function readKeys(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(LEDGER_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch (e) {
    console.warn('[ownLobbyLedger] read failed:', e);
    return [];
  }
}

async function writeKeys(keys: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(LEDGER_KEY, JSON.stringify(keys));
  } catch (e) {
    console.warn('[ownLobbyLedger] write failed:', e);
  }
}

/** Registrera att DENNA enhet skapade deltagandet (roomCode, playerId). Idempotent. */
export async function recordOwnMembership(roomCode: string, playerId: string): Promise<void> {
  if (!roomCode || !playerId) return;
  const key = membershipKey(roomCode, playerId);
  const keys = await readKeys();
  if (keys.includes(key)) return;
  keys.push(key);
  await writeKeys(keys);
}

/** Ta bort ETT deltagande (graceful leave av en non-host-rad). */
export async function forgetOwnMembership(roomCode: string, playerId: string): Promise<void> {
  if (!roomCode || !playerId) return;
  const key = membershipKey(roomCode, playerId);
  const keys = await readKeys();
  const next = keys.filter((k) => k !== key);
  if (next.length !== keys.length) await writeKeys(next);
}

/** Ta bort ALLA deltaganden för en rumkod (host raderade/quittade rummet). */
export async function forgetRoomMemberships(roomCode: string): Promise<void> {
  if (!roomCode) return;
  const prefix = `${normalizeCode(roomCode)}:`;
  const keys = await readKeys();
  const next = keys.filter((k) => !k.startsWith(prefix));
  if (next.length !== keys.length) await writeKeys(next);
}

/** Alla nycklar denna enhet äger — för guardens own/foreign-split. */
export async function getOwnMembershipKeys(): Promise<Set<string>> {
  return new Set(await readKeys());
}

/** Nollställ hela ledgern (logout). */
export async function clearOwnMemberships(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LEDGER_KEY);
  } catch (e) {
    console.warn('[ownLobbyLedger] clear failed:', e);
  }
}

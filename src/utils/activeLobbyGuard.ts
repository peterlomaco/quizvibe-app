import { getRoomMeta } from './mockActiveRooms';
import {
  findOtherActiveMembershipsForUser,
  leaveOtherActiveMemberships,
} from './mockLobbyPlayers';
import { getOwnMembershipKeys } from './ownLobbyLedger';
import { quizVibeAlert } from './quizVibeAlert';

/**
 * Blockerar att samma REGISTRERADE konto är aktiv deltagare i mer än en
 * lobby/spel samtidigt (t.ex. inloggad på två enheter). Delas av join- och
 * host-flödena på Home (app/index.tsx) och Profile (ProfileScreen) så copyn
 * och logiken bara finns på ett ställe.
 *
 * Returnerar `true` när fortsättningen ska ABORTERAS (användaren valde Cancel,
 * eller stängde dialogen), `false` när det är fritt fram att fortsätta (inga
 * andra aktiva deltaganden, ELLER användaren valde "Continue here" och de
 * städades bort). Samma kontrakt som checkLobbyCapacity / checkSinglePlayerLobby
 * i app/index.tsx — callern gör `if (await checkActiveElsewhere(...)) return;`.
 *
 * ⚠ `has_left = false` är en KLIBBIG markör: den nollställs bara vid graceful
 * Leave/logout, aldrig vid force-quit eller när en non-host lämnar quiz-vyn.
 * Utan mer info skulle kontots EGNA övergivna rum (samma enhet, ingen "annan
 * enhet") räknas som "aktiv login" i upp till 24h och felaktigt fyra popupen.
 *
 * Därför delar vi upp de aktiva deltagandena mot ownLobbyLedger (denna enhets
 * lokala minne av vilka rader den SJÄLV skapade):
 *   • EGNA (i ledgern) → tyst reclaim (leaveOtherActiveMemberships), INGEN
 *     popup. Fångar force-quit / stängd quiz-vy / avslutat spel på samma enhet.
 *   • FRÄMMANDE (ej i ledgern → skapade av en ANNAN enhet) → HÅRD SPÄRR
 *     (Peter 2026-11-26): ett konto spelar ett spel åt gången, från att en
 *     lobby skapats till att spelet avslutats. Ingen "Continue here" — den
 *     raderade bara den andra enhetens rum i databasen medan en host-enhet
 *     spelade vidare, så samma konto kunde spela två spel samtidigt.
 *     Utvägen är att lämna/avsluta spelet (eller logga ut) på den andra
 *     enheten. Priset: om den andra enheten stängs utan Leave/Home ligger
 *     raden kvar tills den enheten loggar ut eller rummet går ut (24h).
 *   • Ett STARTAT Remote 1vs1-rum spärrar inte: duellen är asynkron (48h)
 *     och lever i remote_matches, medan rummet medvetet ligger kvar.
 *
 * Fail-open: anonyma/gäst-sessioner och alla DB-fel ger tom lista →
 * inte blockerad, så en misslyckad uppslagning aldrig låser ute en spelare.
 *
 * `excludeCode` = rummet man just nu joinar/är i, så "rejoin samma lobby"
 * alltid är tillåtet.
 */
export async function checkActiveElsewhere(excludeCode?: string): Promise<boolean> {
  const memberships = await findOtherActiveMembershipsForUser(excludeCode);
  if (memberships.length === 0) return false; // fritt fram

  // Dela upp mot ownLobbyLedger: EGNA (skapade av denna enhet) vs FRÄMMANDE
  // (en annan enhet med samma konto). Nyckelformatet matchar ledgern exakt —
  // `m.roomCode` är redan normaliserad (toUpperCase) av finder:n.
  const ledger = await getOwnMembershipKeys();
  const own = memberships.filter((m) => ledger.has(`${m.roomCode}:${m.playerId}`));
  const foreign = memberships.filter((m) => !ledger.has(`${m.roomCode}:${m.playerId}`));

  if (own.length > 0) {
    // Tyst reclaim av egna övergivna deltaganden — river host-rum
    // (deactivateRoom prunar även ledgern) resp. flaggar non-host has_left=true.
    // Best-effort, fail-open: en misslyckad städning ska aldrig låsa ute.
    try {
      await leaveOtherActiveMemberships(own);
    } catch {
      // helpers loggar sina egna fel och kastar aldrig — släpp igenom ändå.
    }
  }

  // Bara egna stale rader (inget FRÄMMANDE deltagande) → fritt fram, ingen popup.
  if (foreign.length === 0) return false;

  // Startade Remote 1vs1-rum räknas inte som pågående spel (se ovan).
  const blocking: typeof foreign = [];
  for (const m of foreign) {
    const meta = await getRoomMeta(m.roomCode).catch(() => undefined);
    if (meta?.isRemote1v1 && meta.gameStarted) continue;
    blocking.push(m);
  }
  if (blocking.length === 0) return false;

  return new Promise<boolean>((resolve) => {
    quizVibeAlert(
      'Already in a game',
      'This account is already in a game or lobby on another device. ' +
        'Finish or leave that game, or log out on the other device, then try again.',
      [{ text: 'OK', onPress: () => resolve(true) }],
      { cancelable: true, onDismiss: () => resolve(true) },
    );
  });
}

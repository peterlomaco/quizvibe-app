import { Alert } from 'react-native';

import {
  findOtherActiveMembershipsForUser,
  leaveOtherActiveMemberships,
} from './mockLobbyPlayers';
import { getOwnMembershipKeys } from './ownLobbyLedger';

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
 *   • FRÄMMANDE (ej i ledgern → skapade av en ANNAN enhet) → popupen fyrar.
 *     "Continue here" river de främmande deltagandena och flyttar sessionen hit
 *     (den andra enheten får "lobby deleted"/ejectas).
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

  return new Promise<boolean>((resolve) => {
    // Resolve-exactly-once: både onPress och onDismiss kan fyra (Android
    // back stänger dialogen OCH triggar onDismiss) — latchen garanterar att
    // promisen bara avgörs en gång.
    let settled = false;
    const done = (value: boolean) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    Alert.alert(
      'Still active in another game',
      "You're still marked as active in another game or lobby. This can happen " +
        "after a force-quit, or if you're signed in on another device. Continue " +
        'here to move your session to this device?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => done(true) },
        {
          text: 'Continue here',
          onPress: async () => {
            try {
              await leaveOtherActiveMemberships(foreign);
            } catch {
              // Best-effort — helpers loggar sina egna fel och kastar aldrig.
              // Släpp ändå igenom: en misslyckad städning ska inte låsa ute
              // användaren (fail-open, samma princip som ovan).
            }
            done(false);
          },
        },
      ],
      { cancelable: true, onDismiss: () => done(true) },
    );
  });
}

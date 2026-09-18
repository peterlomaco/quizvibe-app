import { Alert } from 'react-native';

import {
  findOtherActiveMembershipsForUser,
  leaveOtherActiveMemberships,
} from './mockLobbyPlayers';

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
 * Så det vanligaste utfallet är att kontots EGNA övergivna rum (samma enhet,
 * ingen "annan enhet") räknas som "aktiv login" i upp till 24h. Därför är
 * remedyn inte längre en återvändsgränd ("logga ut på andra enheten") utan en
 * ett-tapps "Continue here" som river ned de andra deltagandena
 * (leaveOtherActiveMemberships) och släpper igenom den här enheten — vilket
 * också är rätt beteende om man FAKTISKT är på en annan enhet (sessionen
 * flyttas hit; den andra enheten får "lobby deleted"/ejectas).
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
              await leaveOtherActiveMemberships(memberships);
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

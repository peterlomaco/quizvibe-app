import { Alert } from 'react-native';

import { findOtherActiveMembershipsForUser } from './mockLobbyPlayers';

/**
 * Blockerar att samma REGISTRERADE konto är aktiv deltagare i mer än en
 * lobby/spel samtidigt (t.ex. inloggad på två enheter). Delas av join- och
 * host-flödena på Home (app/index.tsx) och Profile (ProfileScreen) så copyn
 * och logiken bara finns på ett ställe.
 *
 * Returnerar `true` när kontot redan är aktivt någon annanstans (en
 * informativ popup visades) → caller ska abortera join/host (samma kontrakt
 * som checkLobbyCapacity / checkSinglePlayerLobby i app/index.tsx).
 * Returnerar `false` när det är fritt fram att fortsätta.
 *
 * Remedyn är att logga ut på den andra enheten: leaveAllActiveMembershipsForUser
 * (körs vid logout) river då ned det kontots aktiva deltaganden så den här
 * enheten släpps igenom. Att RADERA lobbyn på den andra enheten fungerar också
 * — rummet försvinner då och findOtherActiveMembershipsForUser räknar inte
 * längre det.
 *
 * Fail-open: anonyma/gäst-sessioner och alla DB-fel ger tom lista →
 * inte blockerad, så en misslyckad uppslagning aldrig låser ute en spelare.
 *
 * `excludeCode` = rummet man just nu joinar/är i, så "rejoin samma lobby"
 * alltid är tillåtet.
 */
export async function checkActiveElsewhere(excludeCode?: string): Promise<boolean> {
  const memberships = await findOtherActiveMembershipsForUser(excludeCode);
  if (memberships.length === 0) return false;
  Alert.alert(
    'Already logged in',
    'User have already an active login. Please log out from other device and then try again.',
  );
  return true;
}

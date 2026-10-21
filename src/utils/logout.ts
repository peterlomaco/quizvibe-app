import { leaveAllActiveMembershipsForUser } from './mockLobbyPlayers';
import { clearProfile } from './profileStorage';
import { supabase } from './supabase';

/**
 * Delad utloggning för Home + Profile (2026-10-21).
 *
 * Ordningen är oförändrad mot tidigare inline-kod: (1) lämna aktiva lobby-
 * deltaganden (kräver levande session), (2) supabase.auth.signOut, (3) rensa
 * lokal profil. Skillnaden är att steg 1 — som är best-effort och gör flera
 * nätverksanrop — nu har ett tidstak, så en seg uppkoppling inte får
 * utloggningen att se ut att hänga. signOut awaitas som förut (den måste
 * vara klar innan clearProfile, se ProfileScreen-kommentaren om stale JWT).
 */
const LEAVE_MEMBERSHIPS_TIMEOUT_MS = 2000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | 'timeout'> {
  return Promise.race([
    p,
    new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), ms)),
  ]);
}

export async function performLogout(): Promise<void> {
  try {
    const r = await withTimeout(leaveAllActiveMembershipsForUser(), LEAVE_MEMBERSHIPS_TIMEOUT_MS);
    if (r === 'timeout') console.warn('[logout] leaving active lobbies timed out — continuing');
  } catch (err) {
    console.warn('[logout] leaving active lobbies failed:', err);
  }
  try {
    const { error } = await supabase.auth.signOut();
    // Fortsätt med lokal cleanup ändå — sessionen kan ha gått ut server-side.
    if (error) console.warn('[logout] supabase signOut error:', error.message);
  } catch (err) {
    console.warn('[logout] supabase signOut failed:', err);
  }
  await clearProfile();
}

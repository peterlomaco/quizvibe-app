import { envKey, scopedStorage } from './storageScope';
import type { LobbyPlayer } from '../screens/LobbyScreen';

/**
 * "Pending lobby players" — spelare som ska importeras in i nästa lobby-rum.
 * Sätts från quiz-skärmen när användaren väljer "re-use players" efter ett
 * avslutat spel. Läses av LobbyScreen vid mount och rensas direkt efter.
 */

const KEY = envKey('pendingLobbyPlayers');

export async function savePendingLobbyPlayers(players: LobbyPlayer[]): Promise<void> {
  try {
    await scopedStorage.setItem(KEY, JSON.stringify(players));
  } catch (err) {
    console.warn('[pendingLobby] Failed to save:', err);
  }
}

/** Läser och RENSAR nyckeln — så den bara används en gång. */
export async function consumePendingLobbyPlayers(): Promise<LobbyPlayer[] | null> {
  try {
    const json = await scopedStorage.getItem(KEY);
    await scopedStorage.removeItem(KEY);
    if (!json) return null;
    return JSON.parse(json) as LobbyPlayer[];
  } catch (err) {
    console.warn('[pendingLobby] Failed to consume:', err);
    return null;
  }
}

export async function clearPendingLobbyPlayers(): Promise<void> {
  try {
    await scopedStorage.removeItem(KEY);
  } catch (err) {
    console.warn('[pendingLobby] Failed to clear:', err);
  }
}

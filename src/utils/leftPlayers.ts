import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * "Left players" — snapshot:s av spelare som lämnat en specifik lobby
 * (via TopUserBanner → Leave Game Lobby-flödet). Persisteras per rumkod
 * så LobbyScreen kan applicera "LEFT THIS GAME LOBBY"-rendering på
 * matchande spelarkort när lobby:n läses in — OCH visa kortet även
 * för nya användare som joinar samma rum efter att personen lämnat.
 *
 * Vi sparar hela snapshot:en (namn, emoji, type, ålder, assistance, m.m.)
 * istället för bara id, så att nya joiners — som inte har den lämnande
 * spelaren i sin lokala SEED_PLAYERS-baseline — kan rendera kortet i
 * grå "left"-styling utifrån storage:n. Tidigare bara-id-impl räckte
 * bara för existing-card-marking.
 *
 * Mock-implementation: utan backend kan vi bara simulera kross-device-
 * synk via lokal AsyncStorage. När backend är inkopplad ersätts detta
 * med en API-event-prenumeration eller polling — call-sites
 * (handleGuestLeaveRoom, useFocusEffect) håller signaturen så impl-byte
 * blir lokalt här.
 */

const KEY = (roomCode: string) => `@quizvibe/leftPlayers/${roomCode.toUpperCase()}/v1`;

export interface LeftPlayerSnapshot {
  id: string;
  name: string;
  emoji?: string;
  avatarUri?: string;
  type?: 'registered' | 'guest' | 'manual';
  age?: number;
  assistance?: 'minimal' | 'standard' | 'full';
  hcpComplete?: boolean;
  // Bevarar approved-state vid lämnings-tid så kortet hamnar i rätt
  // sektion (Approved / To be Approved by Host) när det renderas.
  approved?: boolean;
}

export async function addLeftPlayer(
  roomCode: string,
  snapshot: LeftPlayerSnapshot,
): Promise<void> {
  try {
    const existing = await getLeftPlayers(roomCode);
    if (existing.some((p) => p.id === snapshot.id)) return; // idempotent
    const updated = [...existing, snapshot];
    await AsyncStorage.setItem(KEY(roomCode), JSON.stringify(updated));
  } catch (err) {
    console.warn('[leftPlayers] Failed to add:', err);
  }
}

export async function getLeftPlayers(roomCode: string): Promise<LeftPlayerSnapshot[]> {
  try {
    const json = await AsyncStorage.getItem(KEY(roomCode));
    if (!json) return [];
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as LeftPlayerSnapshot[]) : [];
  } catch (err) {
    console.warn('[leftPlayers] Failed to read:', err);
    return [];
  }
}

export async function clearLeftPlayers(roomCode: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY(roomCode));
  } catch (err) {
    console.warn('[leftPlayers] Failed to clear:', err);
  }
}

/**
 * Tar bort EN specifik spelar-snapshot från leftPlayers-storen. Anropas
 * av non-host:s auto-add useEffect vid re-join — om dup-detection har
 * ärvt det gamla player_id:t (samma playerName i lobby_players) skulle
 * AsyncStorage-snapshot:n från föregående Leave annars få selfRow:s
 * hasLeft-derivering i syncFromStore att felaktigt sätta hasLeft=true
 * (`!!selfRow.hasLeft || leftIds.has(selfRow.id)`) trots att DB:s
 * has_left nu är false. Resultat: spelaren skulle inte rendera trots
 * att re-join lyckats.
 *
 * Idempotent — no-op om ingen snapshot matchar.
 */
export async function removeLeftPlayer(
  roomCode: string,
  playerId: string,
): Promise<void> {
  try {
    const existing = await getLeftPlayers(roomCode);
    const filtered = existing.filter((p) => p.id !== playerId);
    if (filtered.length === existing.length) return;
    if (filtered.length === 0) {
      await AsyncStorage.removeItem(KEY(roomCode));
    } else {
      await AsyncStorage.setItem(KEY(roomCode), JSON.stringify(filtered));
    }
  } catch (err) {
    console.warn('[leftPlayers] Failed to remove:', err);
  }
}

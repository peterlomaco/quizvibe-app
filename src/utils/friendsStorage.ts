import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadProfile } from './profileStorage';

/**
 * Lokal lagring av användarens QuizVibe-vänner.
 *
 * Vänner används för att kunna skicka direktinbjudningar via Share invite
 * i Lobby — vänners profiler får en "Waiting invite" på sin hemskärm utan
 * att det behöver gå via SMS/WhatsApp.
 *
 * Egen AsyncStorage-nyckel (inte i ProfileData) eftersom listan kan växa
 * och kommer ersättas av backend-data i Fas X.
 *
 * **Per-user-namespacing**: nyckeln innehåller inloggade user:s playerName
 * (lowercase) så User A och User B inte delar samma vänner-lista. När backend
 * kommer in byts detta mot user-id från auth-token; tills dess är playerName
 * unique-key per design (validatePlayerName säkrar case-insensitive uniqueness).
 */

const FRIENDS_KEY_PREFIX = '@quizvibe/friends/v1/';
// Flagga för one-shot reset av all v1-friends-data. Sätts efter första load
// efter per-user-namespacing-fixen. Innan flaggan finns nuk:as allt:
//   - legacy-nyckeln @quizvibe/friends/v1 (pre-namespacing global lista)
//   - alla @quizvibe/friends/v1/<playerName>-nycklar (kan innehålla felaktigt
//     migrerad legacy-data från en tidigare migrations-implementering som
//     claim:ade legacy för första-bästa user efter fixen).
// Resultatet: alla startar tomma. Användarna får lägga till friends igen.
const FRIENDS_RESET_FLAG_KEY = '@quizvibe/migration/friendsReset/v1';

export interface Friend {
  id: string;
  playerName: string;
  avatarId?: string;     // matchar AVATARS-listan i src/utils/avatars.ts
  // TODO (backend): online-status, mutual friends, friend-since-datum etc.
}

/**
 * Returnerar AsyncStorage-nyckeln för inloggade user:s vänner-lista.
 * null = ingen profil laddad → caller bör returnera tom lista / no-op:a save.
 */
async function resolveFriendsKey(): Promise<string | null> {
  const profile = await loadProfile();
  if (!profile?.playerName) return null;
  return `${FRIENDS_KEY_PREFIX}${profile.playerName.toLowerCase()}`;
}

function parseFriends(json: string): Friend[] {
  const items = JSON.parse(json) as (Partial<Friend> & { nickname?: string })[];
  // Migrera gamla items (skapade när fältet hette `nickname`) till nya
  // schemat med `playerName`. Nästa saveFriends skriver bara nya fältet.
  return items.map((f) => ({
    id: f.id ?? `f-${Date.now()}`,
    playerName: f.playerName ?? f.nickname ?? '',
    avatarId: f.avatarId,
  }));
}

/**
 * One-shot reset av all v1-friends-data. Tar bort legacy-nyckeln och alla
 * per-user-nycklar så ingen ärver felaktigt migrerad data från tidigare
 * implementeringar. Sätter en flagga så reset:en bara körs en gång.
 * Idempotent — säkert att anropa flera gånger.
 */
async function ensureFriendsReset(): Promise<void> {
  try {
    const flag = await AsyncStorage.getItem(FRIENDS_RESET_FLAG_KEY);
    if (flag) return;
    const allKeys = await AsyncStorage.getAllKeys();
    const friendKeys = allKeys.filter(
      (k) => k === '@quizvibe/friends/v1' || k.startsWith(FRIENDS_KEY_PREFIX),
    );
    if (friendKeys.length > 0) {
      await AsyncStorage.multiRemove(friendKeys);
    }
    await AsyncStorage.setItem(FRIENDS_RESET_FLAG_KEY, '1');
  } catch (err) {
    console.warn('[friendsStorage] Reset failed:', err);
  }
}

export async function loadFriends(): Promise<Friend[]> {
  try {
    await ensureFriendsReset();
    const key = await resolveFriendsKey();
    if (!key) return [];
    const json = await AsyncStorage.getItem(key);
    if (json) return parseFriends(json);
    return [];
  } catch (err) {
    console.warn('[friendsStorage] Failed to load friends:', err);
    return [];
  }
}

export async function saveFriends(friends: Friend[]): Promise<void> {
  try {
    await ensureFriendsReset();
    const key = await resolveFriendsKey();
    if (!key) {
      console.warn('[friendsStorage] saveFriends called without active profile — no-op');
      return;
    }
    await AsyncStorage.setItem(key, JSON.stringify(friends));
  } catch (err) {
    console.warn('[friendsStorage] Failed to save friends:', err);
    throw err;
  }
}

export async function addFriend(playerName: string, avatarId?: string): Promise<Friend[]> {
  const trimmed = playerName.trim();
  if (!trimmed) return loadFriends();
  const current = await loadFriends();
  // Inga duplicates på Player Name (case-insensitive)
  if (current.some((f) => f.playerName.toLowerCase() === trimmed.toLowerCase())) {
    return current;
  }
  const next: Friend = { id: `f-${Date.now()}`, playerName: trimmed, avatarId };
  const updated = [...current, next];
  await saveFriends(updated);
  return updated;
}

export async function removeFriend(id: string): Promise<Friend[]> {
  const current = await loadFriends();
  const updated = current.filter((f) => f.id !== id);
  await saveFriends(updated);
  return updated;
}

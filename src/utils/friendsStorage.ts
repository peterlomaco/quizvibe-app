import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Lokal lagring av användarens QuizVibe-vänner.
 *
 * Vänner används för att kunna skicka direktinbjudningar via Share invite
 * i Lobby — vänners profiler får en "Waiting invite" på sin hemskärm utan
 * att det behöver gå via SMS/WhatsApp.
 *
 * Egen AsyncStorage-nyckel (inte i ProfileData) eftersom listan kan växa
 * och kommer ersättas av backend-data i Fas X.
 */

const FRIENDS_KEY = '@quizvibe/friends/v1';

export interface Friend {
  id: string;
  nickname: string;
  avatarId?: string;     // matchar AVATARS-listan i src/utils/avatars.ts
  // TODO (backend): online-status, mutual friends, friend-since-datum etc.
}

export async function loadFriends(): Promise<Friend[]> {
  try {
    const json = await AsyncStorage.getItem(FRIENDS_KEY);
    if (!json) return [];
    return JSON.parse(json) as Friend[];
  } catch (err) {
    console.warn('[friendsStorage] Failed to load friends:', err);
    return [];
  }
}

export async function saveFriends(friends: Friend[]): Promise<void> {
  try {
    await AsyncStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
  } catch (err) {
    console.warn('[friendsStorage] Failed to save friends:', err);
    throw err;
  }
}

export async function addFriend(nickname: string, avatarId?: string): Promise<Friend[]> {
  const trimmed = nickname.trim();
  if (!trimmed) return loadFriends();
  const current = await loadFriends();
  // Inga duplicates på nickname (case-insensitive)
  if (current.some((f) => f.nickname.toLowerCase() === trimmed.toLowerCase())) {
    return current;
  }
  const next: Friend = { id: `f-${Date.now()}`, nickname: trimmed, avatarId };
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

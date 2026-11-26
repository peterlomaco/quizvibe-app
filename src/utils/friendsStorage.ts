import { loadProfile } from './profileStorage';
import { getUserScope, scopedStorage, userKey } from './storageScope';

/**
 * Lokal lagring av användarens QuizVibe-vänner.
 *
 * Vänner används för att kunna skicka direktinbjudningar via Share invite
 * i Lobby — vänners profiler får en "Waiting invite" på sin hemskärm utan
 * att det behöver gå via SMS/WhatsApp.
 *
 * Lagras per konto och projekt (userKey(uid,'friends'), Build 41) — aldrig
 * per playerName. Utan registrerad session finns ingen lista.
 */

export interface Friend {
  id: string;
  playerName: string;
  avatarId?: string;     // matchar AVATARS-listan i src/utils/avatars.ts
  // TODO (backend): online-status, mutual friends, friend-since-datum etc.
}

/** Kontots nyckel, eller null utan registrerad session. */
async function resolveFriendsKey(): Promise<string | null> {
  const scope = await getUserScope();
  return scope ? userKey(scope.uid, 'friends') : null;
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

// Alfabetisk sortering (Peter 2026-08-27) — case-insensitive + numeric
// (samma localeCompare-konvention som t.ex. Lobby:s purchasedPackageRow-
// sortering). Körs centralt här så ALLA konsumenter (Profile:s inline-lista,
// Profile:s Friends-modal, Lobby:s Share invite) automatiskt får sorterad
// data utan att varje render-site behöver sortera själv.
function sortFriends(list: Friend[]): Friend[] {
  return [...list].sort((a, b) =>
    a.playerName.localeCompare(b.playerName, undefined, { sensitivity: 'base', numeric: true }),
  );
}

export async function loadFriends(): Promise<Friend[]> {
  try {
    const key = await resolveFriendsKey();
    if (!key) return [];
    const json = await scopedStorage.getItem(key);
    if (json) return sortFriends(parseFriends(json));
    return [];
  } catch (err) {
    console.warn('[friendsStorage] Failed to load friends:', err);
    return [];
  }
}

export async function saveFriends(friends: Friend[]): Promise<void> {
  try {
    const key = await resolveFriendsKey();
    if (!key) {
      console.warn('[friendsStorage] saveFriends called without active profile — no-op');
      return;
    }
    await scopedStorage.setItem(key, JSON.stringify(friends));
  } catch (err) {
    console.warn('[friendsStorage] Failed to save friends:', err);
    throw err;
  }
}

export async function addFriend(playerName: string, avatarId?: string): Promise<Friend[]> {
  const trimmed = playerName.trim();
  if (!trimmed) return loadFriends();
  const current = await loadFriends();
  // Defensivt: kan inte lägga till sig själv som vän. UI-lagren (Profile:s
  // handleAddFriend + Lobby:s handleAddFriendFromShare) visar ett eget
  // fel-meddelande; detta är backstoppen så en självreferens aldrig kan
  // hamna i listan → aldrig visas som inbjudningsbar → aldrig bli en
  // själv-inbjudan. loadProfile() är redan varm (loadFriends läste den).
  const ownName = (await loadProfile())?.playerName?.trim().toLowerCase();
  if (ownName && trimmed.toLowerCase() === ownName) {
    return current;
  }
  // Inga duplicates på Player Name (case-insensitive)
  if (current.some((f) => f.playerName.toLowerCase() === trimmed.toLowerCase())) {
    return current;
  }
  const next: Friend = { id: `f-${Date.now()}`, playerName: trimmed, avatarId };
  const updated = [...current, next];
  await saveFriends(updated);
  return sortFriends(updated);
}

export async function removeFriend(id: string): Promise<Friend[]> {
  const current = await loadFriends();
  const updated = current.filter((f) => f.id !== id);
  await saveFriends(updated);
  return sortFriends(updated);
}

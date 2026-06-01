import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadProfile } from './profileStorage';

// Lagrar vilka fråge-IDs en Host har sett i tidigare spelomgångar,
// per spelarkonto (playerName). Används av quiz.tsx för att prioritera
// osedda frågor i varje ny omgång — sedda frågor visas bara när
// de osedda är uttömda inom de aktiva filter-inställningarna.
const SEEN_KEY_PREFIX = '@quizvibe/seenQuestionIds/v1/';

async function resolveKey(): Promise<string | null> {
  try {
    const profile = await loadProfile();
    if (!profile?.playerName) return null;
    return `${SEEN_KEY_PREFIX}${profile.playerName.toLowerCase()}`;
  } catch {
    return null;
  }
}

export async function loadSeenQuestionIds(): Promise<Set<string>> {
  try {
    const key = await resolveKey();
    if (!key) return new Set();
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return new Set();
    return new Set<string>(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

export async function addSeenQuestionIds(ids: string[]): Promise<void> {
  if (!ids.length) return;
  try {
    const key = await resolveKey();
    if (!key) return;
    const raw = await AsyncStorage.getItem(key);
    const existing: Set<string> = new Set(raw ? JSON.parse(raw) : []);
    ids.forEach((id) => existing.add(id));
    await AsyncStorage.setItem(key, JSON.stringify([...existing]));
  } catch {}
}

export async function clearSeenQuestionIds(): Promise<void> {
  try {
    const key = await resolveKey();
    if (!key) return;
    await AsyncStorage.removeItem(key);
  } catch {}
}

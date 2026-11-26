// The ONLY entry point to app data in AsyncStorage (Build 41, 2026-11-26).
//
// Keys:
//   userKey(uid, store) → @quizvibe/u/<projectRef>/<uid>/<store>   account data
//   envKey(store)       → @quizvibe/env/<projectRef>/<store>        project data, no account
//   deviceKey(store)    → @quizvibe/device/<store>                  pure UI state
//
// Every read/write awaits the one-time storage transition (storageTransition.ts).
// If the transition fails the app runs in DEGRADED mode: reads work, writes
// under @quizvibe/u/ are dropped, and the next app start retries.
//
// Account switching: user-scoped data is keyed by uid, so a write that was
// started for account A always lands in A's namespace. In-memory mirrors that
// represent "the current user" (profile, premium) compare `authEpoch` before
// and after their async work and drop results from a previous account.
//
// A test (backend/content/test/storageScope.test.ts) fails if any other
// module imports AsyncStorage or spells out an @quizvibe/ key.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSessionState, registeredUserOf, type SessionState } from './sessionState';
import { SUPABASE_PROJECT_REF, supabase } from './supabase';
import {
  deviceKeyFor,
  envKeyFor,
  runTransition,
  userKeyFor,
  type TransitionOutcome,
} from './storageTransition';

export const PROJECT_REF = SUPABASE_PROJECT_REF;

export const userKey = (uid: string, store: string) => userKeyFor(PROJECT_REF, uid, store);
export const envKey = (store: string) => envKeyFor(PROJECT_REF, store);
export const deviceKey = (store: string) => deviceKeyFor(store);

const USER_PREFIX = `@quizvibe/u/${PROJECT_REF}/`;

// ── Transition gate ─────────────────────────────────────────────────────
let outcome: TransitionOutcome | null = null;
export const storageReady: Promise<TransitionOutcome> = runTransition(
  {
    getItem: (k) => AsyncStorage.getItem(k),
    getAllKeys: () => AsyncStorage.getAllKeys(),
    multiSet: (pairs) => AsyncStorage.multiSet(pairs),
    multiRemove: (keys) => AsyncStorage.multiRemove(keys),
    setItem: (k, v) => AsyncStorage.setItem(k, v),
  },
  PROJECT_REF,
).then((o) => {
  outcome = o;
  return o;
});

/** True when the transition failed this run — user-scoped writes are blocked. */
export function isStorageDegraded(): boolean {
  return outcome === 'failed';
}

function writeAllowed(key: string): boolean {
  if (outcome !== 'failed') return true;
  if (key.startsWith(USER_PREFIX)) {
    console.warn('[storageScope] degraded mode — dropped user write:', key);
    return false;
  }
  return true;
}

export const scopedStorage = {
  async getItem(key: string): Promise<string | null> {
    await storageReady;
    return AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    await storageReady;
    if (!writeAllowed(key)) return;
    await AsyncStorage.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    await storageReady;
    if (!writeAllowed(key)) return;
    await AsyncStorage.removeItem(key);
  },
  async multiRemove(keys: string[]): Promise<void> {
    await storageReady;
    const allowed = keys.filter(writeAllowed);
    if (allowed.length > 0) await AsyncStorage.multiRemove(allowed);
  },
  /** Keys under a scoped prefix (never returns keys outside @quizvibe/u|env|device). */
  async keysWithPrefix(prefix: string): Promise<string[]> {
    await storageReady;
    if (!prefix.startsWith('@quizvibe/u/') && !prefix.startsWith('@quizvibe/env/') && !prefix.startsWith('@quizvibe/device/')) {
      return [];
    }
    const all = await AsyncStorage.getAllKeys();
    return all.filter((k) => k.startsWith(prefix));
  },
};

/** Removes every key of one account in this project (Delete Account). */
export async function clearUserScope(uid: string): Promise<void> {
  const keys = await scopedStorage.keysWithPrefix(`${USER_PREFIX}${uid}/`);
  if (keys.length > 0) await scopedStorage.multiRemove(keys);
}

// ── Current account + epoch ─────────────────────────────────────────────
let authEpoch = 0;
let lastUserId: string | null | undefined = undefined;

/** Increments whenever the signed-in account changes. */
export function currentAuthEpoch(): number {
  return authEpoch;
}

function noteUser(uid: string | null): void {
  if (lastUserId !== undefined && lastUserId !== uid) authEpoch += 1;
  lastUserId = uid;
}

try {
  supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user as { id: string; is_anonymous?: boolean } | undefined;
    noteUser(user && !user.is_anonymous ? user.id : null);
  });
} catch {
  // Test environments without a real client.
}

/** Registered account (online or offline) whose data should be shown, or null. */
export async function getUserScope(): Promise<{ uid: string; state: SessionState } | null> {
  const state = await getSessionState();
  const user = registeredUserOf(state);
  noteUser(user?.id ?? (state.kind === 'unknown' ? lastUserId ?? null : null));
  return user ? { uid: user.id, state } : null;
}

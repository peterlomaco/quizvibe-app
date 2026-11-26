// Session state for the CURRENT Supabase project, read without network.
//
// Build 41 (2026-11-26). Separates five cases that used to blur together:
//
//   online     — supabase-js has a valid, non-anonymous session.
//   offline    — no usable live session (the access token expired and the
//                refresh could not reach the server), but a non-anonymous
//                session is still persisted for THIS project. auth-js only
//                deletes the stored session on non-retryable errors, so a
//                stored session that survives means "temporarily offline".
//                Local data is fine to show; server calls are not.
//   guest      — an anonymous session (guest play).
//   signedOut  — nothing persisted for this project.
//   unknown    — local storage could not be read. Callers must not delete
//                anything on this state.
//
// The stored session lives under `sb-<ref>-auth-token`, so a session from a
// different Supabase project (e.g. a staging TestFlight build) is never seen
// here.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseStoredSessionUser, type StoredSessionUser } from './sessionIdentity';
import { SUPABASE_AUTH_STORAGE_KEY, supabase } from './supabase';

export interface SessionUser {
  id: string;
  email: string | null;
  userMetadata?: Record<string, unknown>;
}

export type SessionState =
  | { kind: 'online'; user: SessionUser }
  | { kind: 'offline'; user: SessionUser }
  | { kind: 'guest' }
  | { kind: 'signedOut' }
  | { kind: 'unknown' };

export type StoredSessionRead =
  | { status: 'present'; user: StoredSessionUser }
  | { status: 'none' }
  | { status: 'error' };

/** Raw read of the persisted session for this project. Never touches the network. */
export async function readStoredSession(): Promise<StoredSessionRead> {
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(SUPABASE_AUTH_STORAGE_KEY);
  } catch {
    return { status: 'error' };
  }
  const user = parseStoredSessionUser(raw);
  return user ? { status: 'present', user } : { status: 'none' };
}

/** True when the persisted session for this project belongs to a registered (non-anonymous) user. */
export function isRegisteredStored(read: StoredSessionRead): read is { status: 'present'; user: StoredSessionUser } {
  return read.status === 'present' && !read.user.isAnonymous;
}

export async function getSessionState(): Promise<SessionState> {
  try {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user as
      | { id: string; email?: string | null; is_anonymous?: boolean; user_metadata?: Record<string, unknown> }
      | undefined;
    if (user) {
      if (user.is_anonymous) return { kind: 'guest' };
      return {
        kind: 'online',
        user: { id: user.id, email: user.email ?? null, userMetadata: user.user_metadata },
      };
    }
  } catch {
    // Fall through to the stored-session read below.
  }
  const stored = await readStoredSession();
  if (stored.status === 'error') return { kind: 'unknown' };
  if (stored.status === 'none') return { kind: 'signedOut' };
  if (stored.user.isAnonymous) return { kind: 'guest' };
  return { kind: 'offline', user: { id: stored.user.id, email: stored.user.email } };
}

/** Registered user (online or offline), or null. */
export function registeredUserOf(state: SessionState): SessionUser | null {
  return state.kind === 'online' || state.kind === 'offline' ? state.user : null;
}

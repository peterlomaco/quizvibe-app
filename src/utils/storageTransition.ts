// One-time transition from the legacy local-storage layout to the
// project + user scoped layout (Build 41, 2026-11-26).
//
// Legacy keys were global or namespaced by playerName and shared between
// Supabase projects (a staging TestFlight build and the App Store build use
// the same app container). They cannot be attributed to an account or a
// project, so they are reset — with ONE exception: a short, explicitly
// approved list of preference fields from the legacy profile cache, migrated
// only when the cache's email matches the registered session of THIS project.
//
// Safety rules (do not loosen without a product decision):
//   • Only keys matching LEGACY_EXACT / LEGACY_PREFIXES are deleted, plus
//     supabase sessions belonging to a DIFFERENT project ref — never the
//     PROD project's session (PROTECTED_SESSION_REFS).
//   • The current project's `sb-<ref>-*` keys, the new `@quizvibe/u|env|device/`
//     namespaces and every unknown key are never touched.
//   • Writes happen before deletes; the marker is written last. A crash at any
//     point is completed on the next start without losing anything new.
//
// `planTransition` is pure (unit-tested); `runTransition` applies it through
// an injected storage interface.

import { parseStoredSessionUser } from './sessionIdentity';

export const TRANSITION_SCHEMA = 1;

/** Legacy keys removed verbatim. */
export const LEGACY_EXACT: readonly string[] = [
  '@quizvibe/profile/v1',
  '@quizvibe/friends/v1',
  '@quizvibe/waitingInvites/v1',
  '@quizvibe/gameHistory/v1',
  '@quizvibe/latestResult/v1',
  '@quizvibe/aggregateSeries/v1',
  '@quizvibe/ownLobbyLedger/v1',
  '@quizvibe/pendingLobbyPlayers/v1',
  '@quizvibe/promo/offerConfig/v1',
  '@quizvibe/promo/paidConfig/v1',
  '@quizvibe/promo/premiumGrant/v3',
  '@quizvibe/subscription/hasPremium/v1',
  '@quizvibe/featureGates/v1',
  '@quizvibe/home/guestStartBtnY/v1',
];

/** Legacy key prefixes (playerName-, room- or flag-namespaced). */
export const LEGACY_PREFIXES: readonly string[] = [
  '@quizvibe/friends/v1/',
  '@quizvibe/waitingInvites/v1/',
  '@quizvibe/waitingInvites/seen/v1/',
  '@quizvibe/gameHistory/v1/',
  '@quizvibe/hcpProgress/v1/',
  '@quizvibe/hcpProgress/v2/',
  '@quizvibe/seenQuestionIds/v1/',
  '@quizvibe/seenQuestionIds/v2/',
  '@quizvibe/epochLedger/v1/',
  '@quizvibe/categoryLedger/v1/',
  '@quizvibe/savedLobbies/v1/',
  '@quizvibe/myMatches/seen/v1/',
  '@quizvibe/leftPlayers/',
  '@quizvibe/migration/',
];

/** The only profile fields carried over from a legacy cache (approved 2026-11-26). */
export const MIGRATED_PREFERENCE_FIELDS = [
  'voice',
  'parentControlEnabled',
  'spotifyAppConfirmed',
  'spotifyDefaultEnabled',
  'spotifyAnswerYear',
  'spotifyAnswerName',
] as const;

const LEGACY_PROFILE_KEY = '@quizvibe/profile/v1';
const LEGACY_GUEST_BTN_KEY = '@quizvibe/home/guestStartBtnY/v1';
const SB_KEY_RE = /^sb-([a-z0-9]+)-auth-token(?:-code-verifier|-user)?$/;

/**
 * Sessions of these projects are never removed, even by a build that talks to
 * another project. A staging TestFlight build shares the app container with
 * the App Store build; without this it would log the PROD account out.
 */
export const PROTECTED_SESSION_REFS: readonly string[] = ['pyndqehlebtxochwpwex'];

export const userKeyFor = (ref: string, uid: string, store: string) => `@quizvibe/u/${ref}/${uid}/${store}`;
export const envKeyFor = (ref: string, store: string) => `@quizvibe/env/${ref}/${store}`;
export const deviceKeyFor = (store: string) => `@quizvibe/device/${store}`;
export const transitionMarkerKey = (ref: string) => envKeyFor(ref, 'transition');

export function isLegacyKey(key: string): boolean {
  if (LEGACY_EXACT.includes(key)) return true;
  return LEGACY_PREFIXES.some((p) => key.startsWith(p));
}

/** A supabase session key that belongs to another project. */
export function isForeignSessionKey(key: string, currentRef: string): boolean {
  const m = SB_KEY_RE.exec(key);
  return !!m && m[1] !== currentRef && !PROTECTED_SESSION_REFS.includes(m[1]);
}

export interface TransitionInput {
  ref: string;
  keys: readonly string[];
  /** Raw values for the keys the plan may copy from. */
  values: Readonly<Record<string, string | null>>;
}

export interface TransitionPlan {
  writes: { key: string; value: string }[];
  deletes: string[];
}

function sameEmail(a: unknown, b: string | null): boolean {
  if (typeof a !== 'string' || !a.trim() || !b) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function planTransition(input: TransitionInput): TransitionPlan {
  const { ref, keys, values } = input;
  const writes: { key: string; value: string }[] = [];

  // UI-only device value (Home layout cache). No identity, no account data.
  const btn = values[LEGACY_GUEST_BTN_KEY];
  if (typeof btn === 'string' && btn) writes.push({ key: deviceKeyFor('home/guestStartBtnY'), value: btn });

  // Approved preference fields — only to the registered user of THIS project,
  // and only when the legacy cache's email matches that user's email.
  const session = parseStoredSessionUser(values[`sb-${ref}-auth-token`] ?? null);
  const legacyRaw = values[LEGACY_PROFILE_KEY];
  if (session && !session.isAnonymous && typeof legacyRaw === 'string') {
    try {
      const legacy = JSON.parse(legacyRaw) as Record<string, unknown>;
      if (legacy && sameEmail(legacy.email, session.email)) {
        const prefs: Record<string, unknown> = {};
        for (const f of MIGRATED_PREFERENCE_FIELDS) {
          if (legacy[f] !== undefined) prefs[f] = legacy[f];
        }
        if (Object.keys(prefs).length > 0) {
          writes.push({ key: userKeyFor(ref, session.id, 'legacyPrefs'), value: JSON.stringify(prefs) });
        }
      }
    } catch {
      // Malformed legacy cache — nothing to migrate; it is deleted below.
    }
  }

  const deletes = keys.filter((k) => isLegacyKey(k) || isForeignSessionKey(k, ref));
  return { writes, deletes };
}

export interface TransitionIO {
  getItem(key: string): Promise<string | null>;
  getAllKeys(): Promise<readonly string[]>;
  multiSet(pairs: [string, string][]): Promise<void>;
  multiRemove(keys: string[]): Promise<void>;
  setItem(key: string, value: string): Promise<void>;
}

export type TransitionOutcome = 'skipped' | 'completed' | 'failed';

/**
 * Applies the transition once per project ref. Any failure leaves the
 * marker unwritten and returns 'failed' (the caller blocks user writes and
 * the next start retries).
 */
export async function runTransition(io: TransitionIO, ref: string): Promise<TransitionOutcome> {
  try {
    const marker = await io.getItem(transitionMarkerKey(ref));
    if (marker) return 'skipped';
    const keys = await io.getAllKeys();
    const sourceKeys = [LEGACY_PROFILE_KEY, LEGACY_GUEST_BTN_KEY, `sb-${ref}-auth-token`];
    const values: Record<string, string | null> = {};
    for (const k of sourceKeys) values[k] = keys.includes(k) ? await io.getItem(k) : null;
    const plan = planTransition({ ref, keys, values });
    if (plan.writes.length > 0) await io.multiSet(plan.writes.map((w) => [w.key, w.value]));
    if (plan.deletes.length > 0) await io.multiRemove(plan.deletes);
    await io.setItem(
      transitionMarkerKey(ref),
      JSON.stringify({ state: 'done', schema: TRANSITION_SCHEMA, at: new Date().toISOString() }),
    );
    return 'completed';
  } catch (err) {
    console.warn('[storageTransition] failed — user-scoped writes stay blocked until next start:', err);
    return 'failed';
  }
}

// Pure helpers for deciding who a session and a cached profile belong to.
// No React Native or Supabase imports, so the rules are unit-testable
// (backend/content/test/sessionIdentity.test.ts).
//
// Background (Build 41, 2026-11-26): the app used to treat a locally cached
// profile as "logged in" even without a real session, and could copy one
// account's cached data into another account. These helpers hold the
// ownership rules in one place.

/** Supabase project ref from its URL — same rule supabase-js uses for `sb-<ref>-auth-token`. */
export function projectRefFromUrl(url: string): string {
  try {
    return new URL(url).hostname.split('.')[0];
  } catch {
    return '';
  }
}

export interface StoredSessionUser {
  id: string;
  email: string | null;
  isAnonymous: boolean;
}

/**
 * Reads the user out of the raw session JSON supabase-js persists under
 * `sb-<ref>-auth-token`. Returns null for anything that is not a usable
 * session (missing, malformed, no user id, no refresh token).
 */
export function parseStoredSessionUser(raw: string | null | undefined): StoredSessionUser | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const session = parsed as { refresh_token?: unknown; user?: unknown };
  if (typeof session.refresh_token !== 'string' || !session.refresh_token) return null;
  const user = session.user as { id?: unknown; email?: unknown; is_anonymous?: unknown } | undefined;
  if (!user || typeof user.id !== 'string' || !user.id) return null;
  return {
    id: user.id,
    email: typeof user.email === 'string' && user.email ? user.email : null,
    isAnonymous: user.is_anonymous === true,
  };
}

/** Minimal shape of a cached profile needed to decide ownership. */
export interface OwnableCache {
  ownerUserId?: string;
  email?: string;
}

/**
 * Does a cached profile belong to this authenticated user?
 *
 * - Primary: the cache carries `ownerUserId` (stamped on every write since
 *   Build 41) and it equals the user id.
 * - Legacy fallback: no `ownerUserId`, but both sides have an email and the
 *   emails match (case-insensitive).
 * - Anything else — including a legacy cache with no email — is NOT owned.
 */
export function cacheBelongsTo(
  cache: OwnableCache | null | undefined,
  user: { id: string; email?: string | null } | null | undefined,
): boolean {
  if (!cache || !user?.id) return false;
  if (cache.ownerUserId) return cache.ownerUserId === user.id;
  const cacheEmail = cache.email?.trim().toLowerCase();
  const userEmail = user.email?.trim().toLowerCase();
  return !!cacheEmail && !!userEmail && cacheEmail === userEmail;
}

export interface BackfillIdentity {
  playerName: string;
  birthYear: number | null;
  assistance: 'minimal' | 'standard' | 'full' | null;
  region: 'sweden' | 'nordics' | 'global' | null;
}

/**
 * Identity fields for a profile that has to be rebuilt from the session.
 * The account's own signup metadata wins; the local cache is only used when
 * it provably belongs to the same account; the email prefix is last.
 */
export function pickBackfillIdentity(
  meta: Record<string, unknown> | null | undefined,
  cache: (OwnableCache & {
    playerName?: string;
    birthYear?: number | null;
    assistance?: 'minimal' | 'standard' | 'full' | null;
    region?: 'sweden' | 'nordics' | 'global' | null;
  }) | null | undefined,
  user: { id: string; email?: string | null },
): BackfillIdentity {
  const m = meta ?? {};
  const owned = cacheBelongsTo(cache, user) ? cache : null;
  const metaName = typeof m.playerName === 'string' && m.playerName.trim() ? m.playerName : null;
  const metaBirth = typeof m.birthYear === 'number' ? m.birthYear : null;
  const metaAssist =
    m.assistance === 'minimal' || m.assistance === 'standard' || m.assistance === 'full'
      ? m.assistance
      : null;
  const metaRegion =
    m.region === 'sweden' || m.region === 'nordics' || m.region === 'global' ? m.region : null;
  return {
    playerName: metaName ?? owned?.playerName ?? (user.email?.split('@')[0] ?? ''),
    birthYear: metaBirth ?? owned?.birthYear ?? null,
    assistance: metaAssist ?? owned?.assistance ?? null,
    region: metaRegion ?? owned?.region ?? null,
  };
}

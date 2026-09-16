// Timeout wrapper for awaited async work in polling loops.
//
// React Native's fetch has no default timeout, so a stalled network request
// hangs an `await` forever. In the non-host lobby sync loops (LobbyScreen.tsx)
// that means a single stuck Supabase call can wedge the whole 2s poll — the
// screen sits frozen on default values and never recovers until the app is
// force-quit. Wrapping each awaited getter guarantees the call settles within
// `ms` to a safe fallback, so the next poll tick always gets a fresh chance.
//
// Design: resolve-to-fallback (NOT reject). Every call site already has
// purpose-built null/undefined guards, and the getters use a deliberate
// tri-state contract (e.g. getLobbyPlayers: null = query failed → keep local
// state, undefined = no rows yet). Mapping a timeout onto those exact sentinels
// keeps the wrap purely additive — no guard logic changes, no new try/catch.
//
// NOTE: racing a promise does not abort the underlying fetch. A truly
// half-open socket is recovered by the NEXT tick's fresh request, not by
// cancelling the stuck one. AbortSignal hardening is a separate follow-up.

/** Default timeout for lobby sync getters. Well above a normal round-trip,
 * well under the point where a user would give up and force-quit. */
export const SYNC_TIMEOUT_MS = 8000;

/**
 * Race `promise` against a timeout. If `promise` settles first, its result is
 * returned; otherwise `fallback` is returned after `ms`. Never rejects due to
 * the timeout (the underlying promise's own rejection still propagates).
 */
export async function withTimeout<T>(
  promise: PromiseLike<T>,
  ms: number,
  fallback: T,
  label?: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      if (label) {
        console.warn(`[withTimeout] ${label} exceeded ${ms}ms — using fallback`);
      }
      resolve(fallback);
    }, ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// Pre-game YouTube clip liveness check.
//
// The client has NO YouTube Data API key, so we probe the PUBLIC oEmbed endpoint
// (https://www.youtube.com/oembed) — the same no-key/no-quota approach the backend
// Spotify validator uses. A deleted/private video returns HTTP 401/404; a live one
// returns 200. oEmbed does NOT detect owner embed-blocking — accepted limitation.
//
// Contract: FAIL-OPEN. Anything that is not a definitive 401/404 (a 200, any other
// status, a thrown error, or a timeout) is treated as ALIVE, so a flaky network can
// never cause us to drop a good clip or block a game start. The reactive
// handleYoutubeError path in quiz.tsx stays as the safety net for anything we miss.
//
// Pure module — no React Native imports — so it is unit-testable under vitest with an
// injected fetch.

export interface CheckYoutubeOptions {
  /** Injectable fetch for tests. Defaults to the global fetch. */
  fetchFn?: typeof fetch;
  /** Max concurrent oEmbed probes. */
  concurrency?: number;
  /** Abort a single probe after this many ms (treated as alive). */
  perRequestTimeoutMs?: number;
  /** Resolve the whole batch after this many ms regardless (partial result is safe). */
  overallTimeoutMs?: number;
  /** Override the session cache (tests). Omit to use the shared module-level cache. */
  cache?: Map<string, boolean>;
}

const DEFAULT_CONCURRENCY = 6;
const DEFAULT_PER_REQUEST_TIMEOUT_MS = 2500;
const DEFAULT_OVERALL_TIMEOUT_MS = 6000;

// Session cache: videoId -> isAlive. Only STABLE outcomes (definitive alive/dead) are
// cached. A transient/timeout outcome is treated alive but NOT cached, so a later game
// gets a fresh chance to detect it. Persists for the app session (module singleton).
const sessionCache = new Map<string, boolean>();

/** Reset the shared session cache. Test-only helper. */
export function _resetYoutubeLivenessCache(): void {
  sessionCache.clear();
}

function oembedUrl(videoId: string): string {
  return `https://www.youtube.com/oembed?url=${encodeURIComponent(
    `https://www.youtube.com/watch?v=${videoId}`,
  )}&format=json`;
}

type Probe = 'alive' | 'dead' | 'unknown';

async function probeOne(
  videoId: string,
  fetchFn: typeof fetch,
  perRequestTimeoutMs: number,
): Promise<Probe> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), perRequestTimeoutMs);
  try {
    const res = await fetchFn(oembedUrl(videoId), { signal: controller.signal });
    if (res.status === 401 || res.status === 404) return 'dead';
    if (res.ok) return 'alive';
    // Any other status (403/429/5xx/redirect loop, …) is not a definitive verdict.
    return 'unknown';
  } catch {
    // Network error or abort — never treat as dead.
    return 'unknown';
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Probe the given videoIds and return the set of DEAD ids (definitive 401/404 only).
 * Never throws. Fail-open: unknown/transient/timed-out ids are omitted from the result.
 */
export async function checkYoutubeClipsAlive(
  videoIds: string[],
  opts: CheckYoutubeOptions = {},
): Promise<Set<string>> {
  const dead = new Set<string>();
  try {
    const fetchFn = opts.fetchFn ?? fetch;
    const cache = opts.cache ?? sessionCache;
    const concurrency = Math.max(1, opts.concurrency ?? DEFAULT_CONCURRENCY);
    const perRequestTimeoutMs = opts.perRequestTimeoutMs ?? DEFAULT_PER_REQUEST_TIMEOUT_MS;
    const overallTimeoutMs = opts.overallTimeoutMs ?? DEFAULT_OVERALL_TIMEOUT_MS;

    // Dedupe, drop cache hits, seed dead from cache.
    const seen = new Set<string>();
    const toCheck: string[] = [];
    for (const raw of videoIds) {
      const id = (raw ?? '').trim();
      if (!id || seen.has(id)) continue;
      seen.add(id);
      const cached = cache.get(id);
      if (cached === false) {
        dead.add(id);
        continue;
      }
      if (cached === true) continue; // known alive
      toCheck.push(id);
    }
    if (toCheck.length === 0) return dead;

    let index = 0;
    const worker = async (): Promise<void> => {
      while (index < toCheck.length) {
        const id = toCheck[index++];
        const verdict = await probeOne(id, fetchFn, perRequestTimeoutMs);
        if (verdict === 'dead') {
          dead.add(id);
          cache.set(id, false);
        } else if (verdict === 'alive') {
          cache.set(id, true);
        }
        // 'unknown' → treated alive, NOT cached.
      }
    };

    const pool = Promise.all(
      Array.from({ length: Math.min(concurrency, toCheck.length) }, () => worker()),
    );
    // Whole-batch escape: whatever resolved into `dead` so far is safe to return.
    await Promise.race([
      pool,
      new Promise<void>((resolve) => setTimeout(resolve, overallTimeoutMs)),
    ]);
    return dead;
  } catch {
    // Absolute belt-and-suspenders — never throw to the caller.
    return dead;
  }
}

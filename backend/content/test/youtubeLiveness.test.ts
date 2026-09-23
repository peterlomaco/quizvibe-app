import { describe, expect, it, vi } from 'vitest';
import {
  checkYoutubeClipsAlive,
  _resetYoutubeLivenessCache,
} from '../../../src/utils/youtubeLiveness';

function res(status: number): Response {
  return { ok: status >= 200 && status < 300, status } as unknown as Response;
}

const freshCache = () => new Map<string, boolean>();

describe('checkYoutubeClipsAlive', () => {
  it('flags 404 and 401 as dead, 200 as alive', async () => {
    const fetchFn = vi.fn<typeof fetch>(async (url) => {
      const u = String(url);
      if (u.includes('dead404')) return res(404);
      if (u.includes('dead401')) return res(401);
      return res(200);
    });
    const dead = await checkYoutubeClipsAlive(['dead404', 'dead401', 'liveA'], {
      fetchFn,
      cache: freshCache(),
    });
    expect(dead).toEqual(new Set(['dead404', 'dead401']));
  });

  it('treats 500/429/throw/abort as alive and does NOT cache them', async () => {
    const cache = freshCache();
    // First pass: transient outcomes → not dead, not cached.
    const flaky = vi.fn<typeof fetch>(async (url) => {
      const u = String(url);
      if (u.includes('boom')) throw new Error('network down');
      if (u.includes('rate')) return res(429);
      return res(500);
    });
    const first = await checkYoutubeClipsAlive(['boom', 'rate', 'srv'], { fetchFn: flaky, cache });
    expect(first.size).toBe(0);
    expect(cache.size).toBe(0); // nothing cached

    // Second pass on the same ids, now definitively 404 → detected (proves no stale cache).
    const dead = await checkYoutubeClipsAlive(['boom', 'rate', 'srv'], {
      fetchFn: async () => res(404),
      cache,
    });
    expect(dead).toEqual(new Set(['boom', 'rate', 'srv']));
  });

  it('caches stable outcomes: a re-check issues no new fetch for a known id', async () => {
    const cache = freshCache();
    const fetchFn = vi.fn<typeof fetch>(async () => res(200));
    await checkYoutubeClipsAlive(['liveA'], { fetchFn, cache });
    expect(fetchFn).toHaveBeenCalledTimes(1);
    await checkYoutubeClipsAlive(['liveA'], { fetchFn, cache });
    expect(fetchFn).toHaveBeenCalledTimes(1); // served from cache
  });

  it('returns dead from cache without re-fetching', async () => {
    const cache = new Map<string, boolean>([['gone', false]]);
    const fetchFn = vi.fn<typeof fetch>(async () => res(200));
    const dead = await checkYoutubeClipsAlive(['gone'], { fetchFn, cache });
    expect(dead).toEqual(new Set(['gone']));
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('dedupes input and skips empty/whitespace ids', async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => res(200));
    await checkYoutubeClipsAlive(['a', 'a', ' ', '', 'a'], { fetchFn, cache: freshCache() });
    expect(fetchFn).toHaveBeenCalledTimes(1); // only 'a'
  });

  it('empty input → empty Set, zero fetches', async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => res(200));
    const dead = await checkYoutubeClipsAlive([], { fetchFn, cache: freshCache() });
    expect(dead.size).toBe(0);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('never exceeds the concurrency cap', async () => {
    let active = 0;
    let maxActive = 0;
    const fetchFn = vi.fn<typeof fetch>(async () => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await new Promise((r) => setTimeout(r, 10));
      active -= 1;
      return res(200);
    });
    const ids = Array.from({ length: 20 }, (_, i) => `id${i}`);
    await checkYoutubeClipsAlive(ids, { fetchFn, concurrency: 6, cache: freshCache() });
    expect(maxActive).toBeLessThanOrEqual(6);
    expect(maxActive).toBe(6);
  });

  it('resolves within budget when fetches never settle (overall timeout)', async () => {
    // Fetch that never resolves and ignores the abort signal.
    const fetchFn = vi.fn<typeof fetch>(() => new Promise<Response>(() => {}));
    const start = Date.now();
    const dead = await checkYoutubeClipsAlive(['stuck'], {
      fetchFn,
      overallTimeoutMs: 40,
      perRequestTimeoutMs: 1000,
      cache: freshCache(),
    });
    expect(Date.now() - start).toBeLessThan(500);
    expect(dead.size).toBe(0); // fail-open
  });
  it('serverCheck: unions server-dead ids even when oEmbed says alive', async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => res(200));
    const serverCheck = vi.fn(async () => ['blocked']);
    const dead = await checkYoutubeClipsAlive(['blocked', 'fine'], {
      fetchFn,
      serverCheck,
      cache: freshCache(),
    });
    expect([...dead]).toEqual(['blocked']);
    expect(serverCheck).toHaveBeenCalledWith(['blocked', 'fine']);
  });

  it('serverCheck: still applied when every id is an oEmbed cache hit', async () => {
    const cache = freshCache();
    cache.set('a', true);
    const fetchFn = vi.fn<typeof fetch>(async () => res(200));
    const dead = await checkYoutubeClipsAlive(['a'], {
      fetchFn,
      cache,
      serverCheck: async () => ['a'],
    });
    expect(dead.has('a')).toBe(true);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('serverCheck: failure / null / ids outside the input are ignored (fail-open)', async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => res(200));
    const d1 = await checkYoutubeClipsAlive(['x'], {
      fetchFn, cache: freshCache(), serverCheck: async () => { throw new Error('boom'); },
    });
    const d2 = await checkYoutubeClipsAlive(['x'], {
      fetchFn, cache: freshCache(), serverCheck: async () => null,
    });
    const d3 = await checkYoutubeClipsAlive(['x'], {
      fetchFn, cache: freshCache(), serverCheck: async () => ['someoneElse'],
    });
    expect(d1.size + d2.size + d3.size).toBe(0);
  });

  it('serverCheck: a hanging server call cannot exceed the overall timeout', async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => res(200));
    const start = Date.now();
    const dead = await checkYoutubeClipsAlive(['x'], {
      fetchFn,
      overallTimeoutMs: 40,
      cache: freshCache(),
      serverCheck: () => new Promise<string[] | null>(() => {}),
    });
    expect(Date.now() - start).toBeLessThan(500);
    expect(dead.size).toBe(0);
  });
});

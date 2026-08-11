import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  searchVideos,
  getVideoDetails,
  parseIsoDuration,
  getClipBlockReasons,
  getClipIssues,
  YoutubeVideoDetails,
} from '../client';

// ─── Mock helpers ────────────────────────────────────────────────────────

function okResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

function errorResponse(status: number, statusText: string, body = ''): Response {
  return {
    ok: false,
    status,
    statusText,
    json: async () => ({}),
    text: async () => body,
  } as unknown as Response;
}

function mockSearchPayload(
  videos: Array<{
    videoId: string;
    title: string;
    channelTitle?: string;
    channelId?: string;
    description?: string;
    publishedAt?: string;
    thumbMedium?: string;
  }>,
) {
  return {
    items: videos.map((v) => ({
      id: { videoId: v.videoId },
      snippet: {
        title: v.title,
        channelTitle: v.channelTitle ?? 'Test Channel',
        channelId: v.channelId ?? 'UC_test',
        description: v.description ?? '',
        publishedAt: v.publishedAt ?? '2023-01-01T00:00:00Z',
        thumbnails: v.thumbMedium
          ? { medium: { url: v.thumbMedium } }
          : undefined,
      },
    })),
  };
}

// ─── parseIsoDuration ────────────────────────────────────────────────────

describe('parseIsoDuration', () => {
  it('parses minutes and seconds', () => {
    expect(parseIsoDuration('PT3M21S')).toBe(201);
  });

  it('parses hours, minutes, seconds', () => {
    expect(parseIsoDuration('PT1H30M5S')).toBe(3600 + 1800 + 5);
  });

  it('parses seconds only', () => {
    expect(parseIsoDuration('PT45S')).toBe(45);
  });

  it('parses hours only', () => {
    expect(parseIsoDuration('PT2H')).toBe(7200);
  });

  it('handles PT0S as zero', () => {
    expect(parseIsoDuration('PT0S')).toBe(0);
  });

  it('returns 0 for empty PT (no parts)', () => {
    expect(parseIsoDuration('PT')).toBe(0);
  });

  it('returns 0 for invalid input', () => {
    expect(parseIsoDuration('')).toBe(0);
    expect(parseIsoDuration('garbage')).toBe(0);
    expect(parseIsoDuration('3M21S')).toBe(0); // saknar PT-prefix
  });
});

// ─── searchVideos ────────────────────────────────────────────────────────

describe('searchVideos', () => {
  beforeEach(() => {
    process.env.YOUTUBE_API_KEY = 'TEST_KEY_searchVideos';
  });
  afterEach(() => {
    delete process.env.YOUTUBE_API_KEY;
  });

  it('returns parsed search results', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        okResponse(
          mockSearchPayload([
            {
              videoId: 'dQw4w9WgXcQ',
              title: 'Rick Astley - Never Gonna Give You Up',
              channelTitle: 'Rick Astley',
              thumbMedium: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
            },
            {
              videoId: 'abc12345_ZZ',
              title: 'Other video',
            },
          ]),
        ),
      );

    const results = await searchVideos({
      query: 'rick astley',
      fetchFn,
    });

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      videoId: 'dQw4w9WgXcQ',
      title: 'Rick Astley - Never Gonna Give You Up',
      channelTitle: 'Rick Astley',
      thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    });
    expect(results[1].videoId).toBe('abc12345_ZZ');
  });

  it('returns empty array when items is undefined', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(okResponse({}));
    const results = await searchVideos({ query: 'no hits', fetchFn });
    expect(results).toEqual([]);
  });

  it('filters out items without videoId or snippet', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValueOnce(
      okResponse({
        items: [
          { id: { videoId: 'goodId12345' }, snippet: { title: 'ok', channelTitle: 'c', channelId: 'cid', description: '', publishedAt: '2024-01-01' } },
          { id: {} }, // no videoId
          { id: { videoId: 'noSnippet11' } }, // no snippet
        ],
      }),
    );
    const results = await searchVideos({ query: 'x', fetchFn });
    expect(results).toHaveLength(1);
    expect(results[0].videoId).toBe('goodId12345');
  });

  it('throws clear error when API key is missing', async () => {
    delete process.env.YOUTUBE_API_KEY;
    const fetchFn = vi.fn<typeof fetch>();
    await expect(
      searchVideos({ query: 'x', fetchFn }),
    ).rejects.toThrow(/YOUTUBE_API_KEY env not set/);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('throws with response body on API error', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        errorResponse(403, 'Forbidden', '{"error":"quotaExceeded"}'),
      );
    await expect(
      searchVideos({ query: 'x', fetchFn }),
    ).rejects.toThrow(/403 Forbidden.*quotaExceeded/);
  });

  it('clamps limit to [1, 50]', async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValue(okResponse(mockSearchPayload([])));

    await searchVideos({ query: 'x', limit: 999, fetchFn });
    await searchVideos({ query: 'x', limit: -5, fetchFn });

    const url1 = fetchFn.mock.calls[0][0] as string;
    const url2 = fetchFn.mock.calls[1][0] as string;
    expect(new URL(url1).searchParams.get('maxResults')).toBe('50');
    expect(new URL(url2).searchParams.get('maxResults')).toBe('1');
  });

  it('uses apiKey override when provided (env not used)', async () => {
    delete process.env.YOUTUBE_API_KEY;
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(okResponse(mockSearchPayload([])));
    await searchVideos({ query: 'x', apiKey: 'OVERRIDE_KEY', fetchFn });
    const url = fetchFn.mock.calls[0][0] as string;
    expect(new URL(url).searchParams.get('key')).toBe('OVERRIDE_KEY');
  });
});

// ─── getVideoDetails ─────────────────────────────────────────────────────

describe('getVideoDetails', () => {
  beforeEach(() => {
    process.env.YOUTUBE_API_KEY = 'TEST_KEY_getVideoDetails';
  });
  afterEach(() => {
    delete process.env.YOUTUBE_API_KEY;
  });

  it('returns empty array on empty input WITHOUT calling fetch', async () => {
    const fetchFn = vi.fn<typeof fetch>();
    const details = await getVideoDetails({ videoIds: [], fetchFn });
    expect(details).toEqual([]);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('throws when more than 50 IDs are requested', async () => {
    const ids = Array.from({ length: 51 }, (_, i) =>
      String(i).padStart(11, 'x'),
    );
    await expect(getVideoDetails({ videoIds: ids })).rejects.toThrow(
      /max 50 videoIds/,
    );
  });

  it('parses snippet, contentDetails, status into rich details', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValueOnce(
      okResponse({
        items: [
          {
            id: 'video111111',
            snippet: {
              title: 'Test Song',
              channelTitle: 'Vevo',
              channelId: 'UCvevo',
              description: 'desc',
              publishedAt: '2023-06-15T12:00:00Z',
            },
            contentDetails: {
              duration: 'PT3M21S',
              definition: 'hd',
              regionRestriction: { blocked: ['DE', 'CN'] },
              contentRating: {},
            },
            status: {
              embeddable: true,
              privacyStatus: 'public',
              license: 'youtube',
              madeForKids: false,
            },
          },
        ],
      }),
    );

    const [d] = await getVideoDetails({
      videoIds: ['video111111'],
      fetchFn,
    });

    expect(d).toMatchObject({
      videoId: 'video111111',
      title: 'Test Song',
      channelTitle: 'Vevo',
      durationSec: 201,
      embeddable: true,
      privacyStatus: 'public',
      ageRestricted: false,
      madeForKids: false,
      blockedRegions: ['DE', 'CN'],
      allowedRegions: null,
      license: 'youtube',
      definition: 'hd',
    });
  });

  it('parses definition=sd correctly', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValueOnce(
      okResponse({
        items: [
          {
            id: 'sdVideo123',
            snippet: { title: 'Old', channelTitle: '', channelId: '', description: '', publishedAt: '2010-01-01' },
            contentDetails: { duration: 'PT2M', definition: 'sd' },
            status: { embeddable: true, privacyStatus: 'public', license: 'youtube', madeForKids: false },
          },
        ],
      }),
    );
    const [d] = await getVideoDetails({ videoIds: ['sdVideo123'], fetchFn });
    expect(d.definition).toBe('sd');
  });

  it('falls back to definition=unknown when API omits the field', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValueOnce(
      okResponse({
        items: [
          {
            id: 'noDefVideo',
            snippet: { title: '', channelTitle: '', channelId: '', description: '', publishedAt: '' },
            contentDetails: { duration: 'PT1M' }, // ingen definition
            status: { embeddable: true, privacyStatus: 'public', license: 'youtube', madeForKids: false },
          },
        ],
      }),
    );
    const [d] = await getVideoDetails({ videoIds: ['noDefVideo'], fetchFn });
    expect(d.definition).toBe('unknown');
  });

  it('flags age-restricted videos', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValueOnce(
      okResponse({
        items: [
          {
            id: 'ageRestrict',
            snippet: { title: '18+', channelTitle: '', channelId: '', description: '', publishedAt: '2024-01-01' },
            contentDetails: {
              duration: 'PT5M',
              contentRating: { ytRating: 'ytAgeRestricted' },
            },
            status: {
              embeddable: true,
              privacyStatus: 'public',
              license: 'youtube',
              madeForKids: false,
            },
          },
        ],
      }),
    );
    const [d] = await getVideoDetails({
      videoIds: ['ageRestrict'],
      fetchFn,
    });
    expect(d.ageRestricted).toBe(true);
  });

  it('falls back to defaults when fields are missing', async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValueOnce(
      okResponse({
        items: [
          {
            id: 'minimal0001',
            // No snippet, no contentDetails, no status
          },
        ],
      }),
    );
    const [d] = await getVideoDetails({
      videoIds: ['minimal0001'],
      fetchFn,
    });
    expect(d).toMatchObject({
      videoId: 'minimal0001',
      title: '',
      durationSec: 0,
      embeddable: false,
      privacyStatus: 'private',
      ageRestricted: false,
      blockedRegions: null,
      allowedRegions: null,
    });
  });
});

// ─── getClipBlockReasons ─────────────────────────────────────────────────

describe('getClipBlockReasons', () => {
  function baseDetails(
    overrides: Partial<YoutubeVideoDetails> = {},
  ): YoutubeVideoDetails {
    return {
      videoId: 'baseVid1234',
      title: '',
      channelTitle: '',
      channelId: '',
      description: '',
      publishedAt: '',
      durationSec: 200,
      embeddable: true,
      privacyStatus: 'public',
      ageRestricted: false,
      blockedRegions: null,
      allowedRegions: null,
      license: 'youtube',
      madeForKids: false,
      definition: 'hd',
      ...overrides,
    };
  }

  it('returns empty for clean public embeddable video', () => {
    expect(getClipBlockReasons(baseDetails())).toEqual([]);
  });

  it('flags non-embeddable', () => {
    expect(getClipBlockReasons(baseDetails({ embeddable: false }))).toContain(
      'not embeddable',
    );
  });

  it('flags non-public privacy', () => {
    const reasons = getClipBlockReasons(
      baseDetails({ privacyStatus: 'unlisted' }),
    );
    expect(reasons.some((r) => r.includes('privacy'))).toBe(true);
  });

  it('flags age-restricted and made-for-kids', () => {
    const reasons = getClipBlockReasons(
      baseDetails({ ageRestricted: true, madeForKids: true }),
    );
    expect(reasons).toContain('age-restricted');
    expect(reasons).toContain('made for kids');
  });

  it('flags blocked-region count', () => {
    const reasons = getClipBlockReasons(
      baseDetails({ blockedRegions: ['DE', 'CN', 'RU'] }),
    );
    expect(reasons.some((r) => r.includes('3 region'))).toBe(true);
  });

  it('flags SD resolution', () => {
    expect(getClipBlockReasons(baseDetails({ definition: 'sd' }))).toContain(
      'SD resolution',
    );
  });

  it('does not flag unknown definition (defensive — no API field)', () => {
    expect(
      getClipBlockReasons(baseDetails({ definition: 'unknown' })),
    ).toEqual([]);
  });

  // ─── severity-uppdelning ───────────────────────────────────────────────
  //
  // Avgör om nightly-cron:en går röd. Hårt = spelaren visar "Video
  // unavailable" för en svensk spelare. Mjukt = spelas fint, bara sämre.
  describe('getClipIssues severity', () => {
    const hardOf = (d: YoutubeVideoDetails) =>
      getClipIssues(d).filter((i) => i.severity === 'hard').map((i) => i.reason);
    const softOf = (d: YoutubeVideoDetails) =>
      getClipIssues(d).filter((i) => i.severity === 'soft').map((i) => i.reason);

    it('treats a clean video as having no issues at all', () => {
      expect(getClipIssues(baseDetails())).toEqual([]);
    });

    it('treats non-embeddable, non-public and age-restricted as hard', () => {
      expect(hardOf(baseDetails({ embeddable: false }))).toContain('not embeddable');
      expect(hardOf(baseDetails({ privacyStatus: 'unlisted' })).length).toBe(1);
      expect(hardOf(baseDetails({ ageRestricted: true }))).toContain('age-restricted');
    });

    it('treats SD and made-for-kids as soft (they still play)', () => {
      const d = baseDetails({ definition: 'sd', madeForKids: true });
      expect(hardOf(d)).toEqual([]);
      expect(softOf(d)).toEqual(
        expect.arrayContaining(['SD resolution', 'made for kids']),
      );
    });

    it('treats a block that misses our served regions as soft', () => {
      // BY/RU-block är label-sanktioner — irrelevanta för svenska spelare.
      const d = baseDetails({ blockedRegions: ['BY', 'RU'] });
      expect(hardOf(d)).toEqual([]);
      expect(softOf(d)[0]).toContain('none served');
    });

    it('treats a block that includes SE as hard', () => {
      const d = baseDetails({ blockedRegions: ['BY', 'RU', 'SE'] });
      expect(hardOf(d)[0]).toContain('SE');
      expect(softOf(d)).toEqual([]);
    });

    it('treats an allow-list without SE as hard', () => {
      // Regressionsskydd: allowedRegions kontrollerades inte alls före
      // 2026-08-10 — en US-only-video passerade tyst och gav
      // "Video unavailable" i appen.
      const d = baseDetails({ allowedRegions: ['US', 'CA'] });
      expect(hardOf(d)[0]).toContain('allow-list excludes SE');
    });

    it('accepts an allow-list that includes SE', () => {
      expect(getClipIssues(baseDetails({ allowedRegions: ['SE', 'NO'] }))).toEqual([]);
    });

    it('keeps getClipBlockReasons reporting both severities', () => {
      // Bakåtkompatibel yta för suggest/batch-pick — curatorn ska se allt.
      const reasons = getClipBlockReasons(
        baseDetails({ definition: 'sd', embeddable: false }),
      );
      expect(reasons).toEqual(
        expect.arrayContaining(['not embeddable', 'SD resolution']),
      );
    });
  });
});

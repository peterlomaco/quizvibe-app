// YouTube Data API v3 — klient för katalog-curering och clip-validering.
//
// Kräver miljövariabel YOUTUBE_API_KEY. I dev läses den typiskt från
// backend/.env.local via `tsx --env-file=.env.local <script>` (Node 20.6+).
//
// API-doc:
//   https://developers.google.com/youtube/v3/docs/search/list
//   https://developers.google.com/youtube/v3/docs/videos/list
//
// Quota-kostnad (gratis-tier = 10 000 enheter/dag):
//   search.list   = 100 enheter / anrop
//   videos.list   = 1 enhet / anrop (oavsett 1–50 IDs)
// → curering av ~71 katalog-items ryms med god marginal.

const API_BASE = 'https://www.googleapis.com/youtube/v3';

export type PrivacyStatus = 'public' | 'unlisted' | 'private';
export type ClipLicense = 'youtube' | 'creativeCommon';
// `contentDetails.definition` returns 'hd' eller 'sd' från Data API.
// 'unknown' representerar att fältet saknades i svaret (= defensive parse).
export type VideoDefinition = 'hd' | 'sd' | 'unknown';

export interface YoutubeSearchResult {
  videoId: string;
  title: string;
  channelTitle: string;
  channelId: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
}

export interface YoutubeVideoDetails {
  videoId: string;
  title: string;
  channelTitle: string;
  channelId: string;
  description: string;
  publishedAt: string;
  durationSec: number;            // parsed från ISO 8601 (PT3M21S → 201)
  embeddable: boolean;
  privacyStatus: PrivacyStatus;
  ageRestricted: boolean;
  blockedRegions: string[] | null;  // null = ingen blocked-restriction
  allowedRegions: string[] | null;  // null = ingen allowed-restriction
  license: ClipLicense;
  madeForKids: boolean;
  // Bild-kvalitet — 'hd' = upplöst i HD (≥720p), 'sd' = standard
  // definition (oftast 360-480p, märks tydligt på 220px-spelaren),
  // 'unknown' = fältet saknades i API-svaret (defensiv). Driver
  // HD-gate i getClipBlockReasons.
  definition: VideoDefinition;
}

export interface SearchOptions {
  query: string;
  /** Max antal resultat (1-50). Default 10. */
  limit?: number;
  /** Override env. Default process.env.YOUTUBE_API_KEY. */
  apiKey?: string;
  /** Inject:erbar fetch för testning. Default global fetch. */
  fetchFn?: typeof fetch;
}

/**
 * Sök efter videos via YouTube Data API. Filtrerar redan på server-sidan
 * till embeddable + syndicated så listan är pre-renad. Returnerar tom
 * array vid 0 träffar.
 *
 * Kostar 100 quota-enheter per anrop.
 */
export async function searchVideos(
  options: SearchOptions,
): Promise<YoutubeSearchResult[]> {
  const apiKey = resolveApiKey(options.apiKey);
  const fetchFn = options.fetchFn ?? fetch;
  const limit = Math.max(1, Math.min(options.limit ?? 10, 50));

  const params = new URLSearchParams({
    part: 'snippet',
    q: options.query,
    type: 'video',
    videoEmbeddable: 'true',
    videoSyndicated: 'true',
    safeSearch: 'moderate',
    maxResults: String(limit),
    key: apiKey,
  });
  const url = `${API_BASE}/search?${params.toString()}`;

  const resp = await fetchFn(url);
  if (!resp.ok) {
    const body = await resp.text().catch(() => '');
    throw new Error(
      `YouTube search failed: ${resp.status} ${resp.statusText} — ${body}`,
    );
  }
  const data = (await resp.json()) as YoutubeSearchResponse;
  if (!data.items) return [];

  const results: YoutubeSearchResult[] = [];
  for (const item of data.items) {
    const videoId = item.id?.videoId;
    const snippet = item.snippet;
    if (!videoId || !snippet) continue;
    results.push({
      videoId,
      title: snippet.title,
      channelTitle: snippet.channelTitle,
      channelId: snippet.channelId,
      description: snippet.description,
      publishedAt: snippet.publishedAt,
      thumbnailUrl:
        snippet.thumbnails?.medium?.url ??
        snippet.thumbnails?.default?.url ??
        '',
    });
  }
  return results;
}

export interface VideoDetailsOptions {
  /** Upp till 50 videoIds per anrop. */
  videoIds: string[];
  apiKey?: string;
  fetchFn?: typeof fetch;
}

/**
 * Hämta rich detaljer för en batch videoIds. Returnerar tom array vid
 * tomt input (sparar quota — inget API-anrop). Kostar 1 quota-enhet
 * oavsett om man frågar 1 eller 50 IDs.
 */
export async function getVideoDetails(
  options: VideoDetailsOptions,
): Promise<YoutubeVideoDetails[]> {
  if (options.videoIds.length === 0) return [];
  if (options.videoIds.length > 50) {
    throw new Error('getVideoDetails accepts max 50 videoIds per call');
  }
  const apiKey = resolveApiKey(options.apiKey);
  const fetchFn = options.fetchFn ?? fetch;

  const params = new URLSearchParams({
    part: 'snippet,contentDetails,status',
    id: options.videoIds.join(','),
    key: apiKey,
  });
  const url = `${API_BASE}/videos?${params.toString()}`;

  const resp = await fetchFn(url);
  if (!resp.ok) {
    const body = await resp.text().catch(() => '');
    throw new Error(
      `YouTube videos.list failed: ${resp.status} ${resp.statusText} — ${body}`,
    );
  }
  const data = (await resp.json()) as YoutubeVideosResponse;
  if (!data.items) return [];

  return data.items.map(parseVideoItem);
}

function parseVideoItem(v: YoutubeVideoItem): YoutubeVideoDetails {
  const reg = v.contentDetails?.regionRestriction;
  const rawDef = v.contentDetails?.definition;
  const definition: VideoDefinition =
    rawDef === 'hd' || rawDef === 'sd' ? rawDef : 'unknown';
  return {
    videoId: v.id,
    title: v.snippet?.title ?? '',
    channelTitle: v.snippet?.channelTitle ?? '',
    channelId: v.snippet?.channelId ?? '',
    description: v.snippet?.description ?? '',
    publishedAt: v.snippet?.publishedAt ?? '',
    durationSec: parseIsoDuration(v.contentDetails?.duration ?? 'PT0S'),
    embeddable: v.status?.embeddable ?? false,
    privacyStatus: (v.status?.privacyStatus as PrivacyStatus) ?? 'private',
    ageRestricted:
      v.contentDetails?.contentRating?.ytRating === 'ytAgeRestricted',
    blockedRegions: reg?.blocked ?? null,
    allowedRegions: reg?.allowed ?? null,
    license: (v.status?.license as ClipLicense) ?? 'youtube',
    madeForKids: v.status?.madeForKids ?? false,
    definition,
  };
}

/**
 * Parse:a ISO 8601 duration ("PT3M21S") till sekunder. Returnerar 0
 * vid ogiltig sträng — anroparen får tolka det som "okänd längd".
 *
 * Stöder format: PT[xH][yM][zS] där alla tre delar är valfria, men
 * minst en måste finnas. "PT0S" → 0 (giltigt), "" → 0 (ogiltigt).
 */
export function parseIsoDuration(iso: string): number {
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return 0;
  const [, h, mi, s] = m;
  if (h === undefined && mi === undefined && s === undefined) return 0;
  return (
    parseInt(h ?? '0', 10) * 3600 +
    parseInt(mi ?? '0', 10) * 60 +
    parseInt(s ?? '0', 10)
  );
}

/**
 * Sammanställ orsaker till att en video är olämplig som clip-källa.
 * Returnerar tom array om videon är OK. Används av validate-CLI och
 * suggest-CLI för enhetlig rapportering.
 */
export function getClipBlockReasons(
  details: YoutubeVideoDetails,
): string[] {
  const reasons: string[] = [];
  if (!details.embeddable) reasons.push('not embeddable');
  if (details.privacyStatus !== 'public') {
    reasons.push(`privacy=${details.privacyStatus}`);
  }
  if (details.ageRestricted) reasons.push('age-restricted');
  if (details.madeForKids) reasons.push('made for kids');
  if (details.blockedRegions && details.blockedRegions.length > 0) {
    reasons.push(`blocked in ${details.blockedRegions.length} region(s)`);
  }
  // HD-gate: SD-källor är 360-480p på YouTube och syns tydligt pixliga
  // i 220px-spelaren. 'unknown' blockas INTE — vi vill inte regressa
  // existerande klipp om API-svaret saknar fältet (defensiv).
  if (details.definition === 'sd') reasons.push('SD resolution');
  return reasons;
}

function resolveApiKey(override?: string): string {
  const key = override ?? process.env.YOUTUBE_API_KEY;
  if (!key) {
    throw new Error(
      'YOUTUBE_API_KEY env not set. Run script with: ' +
        'tsx --env-file=.env.local <script> (Node 20.6+ required)',
    );
  }
  return key;
}

// ─── API response types (smala) ──────────────────────────────────────────

interface YoutubeSearchResponse {
  items?: Array<{
    id?: { videoId?: string };
    snippet?: {
      title: string;
      channelTitle: string;
      channelId: string;
      description: string;
      publishedAt: string;
      thumbnails?: {
        default?: { url: string };
        medium?: { url: string };
        high?: { url: string };
      };
    };
  }>;
}

interface YoutubeVideosResponse {
  items?: YoutubeVideoItem[];
}

interface YoutubeVideoItem {
  id: string;
  snippet?: {
    title: string;
    channelTitle: string;
    channelId: string;
    description: string;
    publishedAt: string;
  };
  contentDetails?: {
    duration?: string;
    definition?: string; // 'hd' | 'sd' (Data API v3 string-enum)
    regionRestriction?: {
      allowed?: string[];
      blocked?: string[];
    };
    contentRating?: {
      ytRating?: string;
    };
  };
  status?: {
    embeddable?: boolean;
    privacyStatus?: string;
    license?: string;
    madeForKids?: boolean;
  };
}

// Wikimedia Commons + Wikipedia API-klient — söker bilder via openAPI:t.
// Ingen API-nyckel krävs. Returnerar URL + license + attribution per träff.
//
// API-doc:
//   https://commons.wikimedia.org/w/api.php
//   https://en.wikipedia.org/w/api.php (samma format för alla språk-wikis)

const API_ENDPOINT = 'https://commons.wikimedia.org/w/api.php';

const WIKIPEDIA_ENDPOINTS: Record<WikipediaLang, string> = {
  en: 'https://en.wikipedia.org/w/api.php',
  sv: 'https://sv.wikipedia.org/w/api.php',
};

export type WikipediaLang = 'en' | 'sv';

const USER_AGENT = 'QuizVibeBackend/0.1 (development; mailto:dev@quizvibe.local)';

export type ResultSource = 'commons-search' | 'wikipedia-en' | 'wikipedia-sv';

export interface WikimediaSearchResult {
  /** Var träffen kommer ifrån */
  source: ResultSource;
  /** Wikimedia-titel, t.ex. "File:Astrid Lindgren 1960.jpg" */
  title: string;
  /** Direkt-URL till full-resolution-bilden */
  url: string;
  /** URL till en thumbnail (max 600px bred) */
  thumbnailUrl: string;
  /** Bildens bredd × höjd i pixlar (0 om okänd från source) */
  width: number;
  height: number;
  /** Lic-kod, t.ex. "CC BY-SA 4.0" eller "Public domain". Kan vara null om ej extraherbar. */
  license: string | null;
  /** Författar-tillskrivning, plain text. Kan vara null. */
  artist: string | null;
  /** Länk tillbaka till Wikimedia-sidan för bilden eller Wikipedia-artikeln */
  descriptionUrl: string;
}

export interface SearchOptions {
  /** Hur många resultat per sökning. Default 6. */
  limit?: number;
  /**
   * Hur stor thumbnail (max bredd i px). Default 400.
   */
  thumbnailWidth?: number;
  /**
   * Inject:erbar fetch för testning. Default global fetch.
   */
  fetchFn?: typeof fetch;
}

/**
 * Sök efter bilder på Commons baserat på en söktermsträng.
 * Returnerar tom array vid 0 träffar.
 */
export async function searchCommons(
  searchTerm: string,
  options: SearchOptions = {},
): Promise<WikimediaSearchResult[]> {
  const { limit = 6, thumbnailWidth = 400, fetchFn = fetch } = options;

  // 1. Sök efter file-titles via list=search i namespace 6 (File:)
  const searchUrl = buildUrl({
    action: 'query',
    list: 'search',
    srnamespace: '6',
    srsearch: searchTerm,
    srlimit: String(Math.min(limit, 50)),
    format: 'json',
    origin: '*',
  });

  const searchResp = await fetchFn(searchUrl, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!searchResp.ok) {
    throw new Error(
      `Wikimedia search failed: ${searchResp.status} ${searchResp.statusText}`,
    );
  }
  const searchData = (await searchResp.json()) as WikimediaSearchResponse;
  const titles = searchData.query?.search?.map((s) => s.title) ?? [];
  if (titles.length === 0) return [];

  // 2. Hämta imageinfo (URL, license, artist) för alla träffar i en batch
  const infoUrl = buildUrl({
    action: 'query',
    titles: titles.join('|'),
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|size',
    iiurlwidth: String(thumbnailWidth),
    format: 'json',
    origin: '*',
  });

  const infoResp = await fetchFn(infoUrl, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!infoResp.ok) {
    throw new Error(
      `Wikimedia imageinfo failed: ${infoResp.status} ${infoResp.statusText}`,
    );
  }
  const infoData = (await infoResp.json()) as WikimediaImageInfoResponse;

  const pages = infoData.query?.pages ?? {};
  const results: WikimediaSearchResult[] = [];
  // Bevara sökorder
  const titleToPage = new Map<string, WikimediaPage>();
  for (const page of Object.values(pages)) {
    titleToPage.set(page.title, page);
  }

  for (const title of titles) {
    const page = titleToPage.get(title);
    const info = page?.imageinfo?.[0];
    if (!info) continue;
    results.push({
      source: 'commons-search',
      title,
      url: info.url,
      thumbnailUrl: info.thumburl ?? info.url,
      width: info.width,
      height: info.height,
      license: extractLicense(info.extmetadata),
      artist: extractArtist(info.extmetadata),
      descriptionUrl: info.descriptionurl,
    });
  }

  return results;
}

export interface WikipediaPageImageOptions {
  lang?: WikipediaLang;
  thumbnailWidth?: number;
  fetchFn?: typeof fetch;
}

/**
 * Sök efter en Wikipedia-artikel som matchar `searchTerm` och returnera dess
 * "page image" (artikelns huvudbild) tillsammans med license-info från Commons.
 *
 * Returnerar null om ingen artikel hittas eller om artikeln saknar pageimage.
 *
 * Detta är typiskt det bästa sättet att hitta ett relevant porträtt av en
 * känd person — Wikipedia-artikelns huvudbild är manuellt kuraterad.
 */
export async function findWikipediaPageImage(
  searchTerm: string,
  options: WikipediaPageImageOptions = {},
): Promise<WikimediaSearchResult | null> {
  const { lang = 'en', thumbnailWidth = 400, fetchFn = fetch } = options;
  const endpoint = WIKIPEDIA_ENDPOINTS[lang];

  const url =
    endpoint +
    '?' +
    new URLSearchParams({
      action: 'query',
      generator: 'search',
      gsrsearch: searchTerm,
      gsrlimit: '1',
      prop: 'pageimages|info',
      piprop: 'original|name|thumbnail',
      pithumbsize: String(thumbnailWidth),
      inprop: 'url',
      format: 'json',
      origin: '*',
    });

  const resp = await fetchFn(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!resp.ok) {
    throw new Error(
      `Wikipedia (${lang}) page lookup failed: ${resp.status} ${resp.statusText}`,
    );
  }
  const data = (await resp.json()) as WikipediaPagesResponse;
  const pages = data.query?.pages;
  if (!pages) return null;

  const page = Object.values(pages)[0];
  if (!page?.original || !page.pageimage) return null;

  // Hämta license + artist via Commons imageinfo för pageimage-filen
  const fileTitle = `File:${page.pageimage.replace(/_/g, ' ')}`;
  const license = await fetchCommonsLicense(fileTitle, fetchFn);

  return {
    source: lang === 'en' ? 'wikipedia-en' : 'wikipedia-sv',
    title: fileTitle,
    url: page.original.source,
    thumbnailUrl: page.thumbnail?.source ?? page.original.source,
    width: page.original.width ?? 0,
    height: page.original.height ?? 0,
    license: license.license,
    artist: license.artist,
    descriptionUrl: page.fullurl,
  };
}

/**
 * Bygg en Wikimedia thumbnail-URL för en given bredd från originalets URL.
 *
 * Wikimedia URL-pattern:
 *   Original:   https://upload.wikimedia.org/wikipedia/commons/<a>/<ab>/<filename>
 *   Thumbnail:  https://upload.wikimedia.org/wikipedia/commons/thumb/<a>/<ab>/<filename>/<width>px-<filename>
 *
 * Använder ren strängmanipulation (inte URL-class) för att undvika att
 * Node re-encodar tecken som `()` i path till `%28%29`. iOS expo-image
 * verkar inte rendera percent-encoded thumbnail-URLer korrekt.
 */
export function buildWikimediaThumbnailUrl(
  originalUrl: string,
  width: number,
): string {
  const marker = '/wikipedia/commons/';
  const idx = originalUrl.indexOf(marker);
  if (
    idx === -1 ||
    originalUrl.includes('/thumb/') ||
    !originalUrl.includes('upload.wikimedia.org')
  ) {
    return originalUrl;
  }
  const prefix = originalUrl.substring(0, idx + marker.length);
  const afterCommons = originalUrl.substring(idx + marker.length);
  const lastSlash = afterCommons.lastIndexOf('/');
  const filename = afterCommons.substring(lastSlash + 1);
  return `${prefix}thumb/${afterCommons}/${width}px-${filename}`;
}

async function fetchCommonsLicense(
  fileTitle: string,
  fetchFn: typeof fetch,
): Promise<{ license: string | null; artist: string | null }> {
  const url = buildUrl({
    action: 'query',
    titles: fileTitle,
    prop: 'imageinfo',
    iiprop: 'extmetadata',
    format: 'json',
    origin: '*',
  });
  try {
    const resp = await fetchFn(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!resp.ok) return { license: null, artist: null };
    const data = (await resp.json()) as WikimediaImageInfoResponse;
    const pages = data.query?.pages ?? {};
    const page = Object.values(pages)[0];
    const info = page?.imageinfo?.[0];
    if (!info) return { license: null, artist: null };
    return {
      license: extractLicense(info.extmetadata),
      artist: extractArtist(info.extmetadata),
    };
  } catch {
    return { license: null, artist: null };
  }
}

function buildUrl(params: Record<string, string>): string {
  const qs = new URLSearchParams(params).toString();
  return `${API_ENDPOINT}?${qs}`;
}

function extractLicense(meta: ExtMetadata | undefined): string | null {
  if (!meta) return null;
  const code = meta.LicenseShortName?.value;
  if (code) return stripHtml(code);
  return null;
}

function extractArtist(meta: ExtMetadata | undefined): string | null {
  if (!meta) return null;
  const value = meta.Artist?.value;
  if (!value) return null;
  return stripHtml(value).trim();
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

// ─── Wikimedia API response types (smala) ────────────────────────────────

interface WikimediaSearchResponse {
  query?: {
    search?: Array<{ title: string }>;
  };
}

interface WikimediaImageInfoResponse {
  query?: {
    pages?: Record<string, WikimediaPage>;
  };
}

interface WikimediaPage {
  title: string;
  imageinfo?: WikimediaImageInfo[];
}

interface WikimediaImageInfo {
  url: string;
  thumburl?: string;
  descriptionurl: string;
  width: number;
  height: number;
  extmetadata?: ExtMetadata;
}

interface ExtMetadata {
  LicenseShortName?: { value: string };
  Artist?: { value: string };
}

interface WikipediaPagesResponse {
  query?: {
    pages?: Record<string, WikipediaPage>;
  };
}

interface WikipediaPage {
  pageid: number;
  title: string;
  fullurl: string;
  pageimage?: string;
  original?: {
    source: string;
    width?: number;
    height?: number;
  };
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
}

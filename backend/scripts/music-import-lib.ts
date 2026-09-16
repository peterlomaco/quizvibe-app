/**
 * Shared helpers for the Content/Music.xlsx import pipeline.
 *
 * Consumed by: classify-music-import.ts, reconcile-music-import.ts,
 * add-new-songs.ts, add-hint-names.ts.
 *
 * The Excel is snapshotted to music-portfolio.json by dump-music-xlsx.py.
 */

export interface Row {
  desc: string | null;
  year: number | null;
  pkgs: string[];
  spotify: string | null;
  yt: string | null; // 'ja' | 'nej' | null
  yt1: string | null;
  yt2: string | null;
  yt3: string | null;
  hints: string | null; // 'ja' | 'nej' | null
  inbase: string | null; // 'true' | 'false' | null
  region: string | null;
  parent: string | null; // 'Yes' | null
}

/** Normalized key for matching Excel desc <-> catalog displayName. */
export function norm(s: string): string {
  return (s || '')
    .replace(/—/g, '-')
    .replace(/–/g, '-')
    .replace(/’/g, "'")
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Excel package label (lowercased+trimmed) -> canonical catalog genrePackages tag. */
export const CANON: Record<string, string> = {
  'soft & love': 'Soft & Love',
  'disco & pop': 'Disco & Pop',
  'dance music': 'Dance Music',
  'pop music': 'Pop music',
  pop: 'Pop',
  rnb: 'RnB',
  '100% swedish': '100% in swedish',
  '100% in swedish': '100% in swedish',
  'film edition': 'Film edition',
  eurovision: 'Eurovision',
  melodifestivalen: 'Melodifestivalen',
  'club & dance': 'Club & Dance',
  eurotechno: 'Club & Dance',
  summer: 'Summer',
  rock: 'Rock',
  'rock & punk': 'Rock',
  'hip hop': 'Hip Hop',
  'sport edition': 'sport',
  'sports edition': 'sport',
  sport: 'sport',
  football: 'football',
  dansband: 'Dansband',
  'christmas edition': 'Christmas edition',
  hits: 'Hits',
  'mega hits': 'Mega Hits',
};

/** True for a package cell value that is actually a stray Spotify URL (data error). */
export function isStrayPackage(p: string): boolean {
  return /open\.spotify\.com|https?:\/\//i.test(p);
}

export function canonPkgs(pkgs: string[]): { tags: string[]; dropped: string[] } {
  const out: string[] = [];
  const dropped: string[] = [];
  for (const p of pkgs) {
    if (isStrayPackage(p)) {
      dropped.push(p);
      continue;
    }
    const key = p.trim().toLowerCase();
    const c = CANON[key] ?? p.trim();
    if (c && !out.includes(c)) out.push(c);
  }
  return { tags: out, dropped };
}

/** All region strings normalized to the schema enum (case + nordics -> nordic). */
export function mapRegion(r: string | null): string | null {
  if (!r) return null;
  const v = r.trim().toLowerCase();
  if (v === 'nordics') return 'nordic';
  return v; // sweden | global | europe | nordic | unknown-region
}

/** Parse "Title — Artist" (em/en-dash preferred, ' - ' hyphen fallback). */
export function parseDesc(
  desc: string,
): { title: string; artist: string; sep: 'dash' | 'hyphen' } | null {
  if (!desc) return null;
  const d = desc.trim();
  for (const sep of ['—', '–']) {
    const i = d.indexOf(sep);
    if (i > 0 && i < d.length - 1) {
      return {
        title: d.slice(0, i).trim(),
        artist: d.slice(i + sep.length).trim(),
        sep: 'dash',
      };
    }
  }
  const h = d.indexOf(' - ');
  if (h > 0 && h < d.length - 3) {
    return { title: d.slice(0, h).trim(), artist: d.slice(h + 3).trim(), sep: 'hyphen' };
  }
  return null;
}

/** Extract 22-char base62 Spotify track id from a share URL. */
export function parseSpotifyId(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(/track\/([A-Za-z0-9]{22})/);
  return m ? m[1] : null;
}

/**
 * The song's Spotify id: the Spotify column, else recovered from a stray Spotify
 * URL that leaked into a package column (2 known rows).
 */
export function songSpotifyId(row: Row): string | null {
  const direct = parseSpotifyId(row.spotify);
  if (direct) return direct;
  for (const p of row.pkgs) {
    const rec = parseSpotifyId(p);
    if (rec) return rec;
  }
  return null;
}

/** Parse an Excel YT cell -> { videoId, startSec }. Handles 'startsec:N <url>' and &t=Ns. */
export function parseYtClip(raw: string | null): { videoId: string; startSec: number } | null {
  if (!raw) return null;
  let s = raw.trim();
  let startSec: number | null = null;
  const pre = s.match(/^startsec:(\d+)\s+(.*)$/i);
  if (pre) {
    startSec = parseInt(pre[1], 10);
    s = pre[2].trim();
  }
  let videoId: string | null = null;
  const v = s.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  const short = s.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  const embed = s.match(/embed\/([A-Za-z0-9_-]{11})/);
  videoId = (v && v[1]) || (short && short[1]) || (embed && embed[1]) || null;
  if (!videoId) return null;
  if (startSec == null) {
    const t = s.match(/[?&](?:t|start)=(\d+)/);
    startSec = t ? parseInt(t[1], 10) : 0;
  }
  return { videoId, startSec: Math.max(0, startSec) };
}

/** Parse all up-to-3 YT cells, de-duping identical videoIds. */
export function parseYtClips(row: Row): { videoId: string; startSec: number }[] {
  const clips: { videoId: string; startSec: number }[] = [];
  for (const raw of [row.yt1, row.yt2, row.yt3]) {
    const c = parseYtClip(raw);
    if (c && !clips.some((x) => x.videoId === c.videoId)) clips.push(c);
  }
  return clips;
}

/** Synthesized clip end (player ignores it at runtime; schema requires endSec > startSec). */
export const CLIP_LEN = 15;

/** kebab-case id from artist + title, matching the loose existing convention. */
export function slugify(...parts: string[]): string {
  return parts
    .join(' ')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export type Era = 'elder' | 'gen-x' | 'millennials' | 'gen-z' | 'gen-alpha';
export function eraFromYear(year: number): Era {
  if (year <= 1964) return 'elder';
  if (year <= 1980) return 'gen-x';
  if (year <= 1996) return 'millennials';
  if (year <= 2012) return 'gen-z';
  return 'gen-alpha';
}

export function isHintRow(r: Row): boolean {
  return (r.hints ?? '').toLowerCase() === 'ja';
}
export function hasSongMedia(r: Row): boolean {
  return (r.yt ?? '').toLowerCase() === 'ja' || !!songSpotifyId(r);
}

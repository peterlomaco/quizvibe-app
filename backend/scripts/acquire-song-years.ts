/**
 * Pass 2 — acquire release years for no-year new songs via MusicBrainz, then add them.
 *
 * Reads output/music-import-classified.json (bucket 'song-new-noyear'). For each song
 * NOT already in the catalog (dup-guard), looks up the earliest release year of THAT
 * ARTIST's recording of the track (album or single, whichever came first — an earlier
 * recording by another artist does not count). Two-step MusicBrainz:
 *   1) recording search -> best studio recording whose artist matches (score-sorted)
 *   2) GET that recording's releases -> min 4-digit year
 *
 * Results cache -> output/song-years-cache.json (re-runs reuse; no re-hitting MB).
 * Report -> output/song-years.md. Songs with a found year are ADDED on --apply
 * (Peter: "add where found, report the rest"). Serial, 1.1s between every MB request.
 *
 * Flags: --apply (write catalog), --limit N (cap lookups this run), --refresh (ignore cache).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import * as path from 'path';
import { norm, slugify, eraFromYear, Era } from './music-import-lib';
import {
  NewSong,
  loadSongCatalogState,
  looksDuplicateSong,
  buildSongItemBlock,
  appendBlocksToEra,
} from './song-insert-lib';

const APPLY = process.argv.includes('--apply');
const REFRESH = process.argv.includes('--refresh');
const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;

const CATALOG_DIR = path.join(__dirname, '..', 'content', 'catalog');
const OUT_DIR = path.join(__dirname, '..', 'output');
mkdirSync(OUT_DIR, { recursive: true });
const CACHE_PATH = path.join(OUT_DIR, 'song-years-cache.json');

const UA = 'QuizVibe-content-import/1.0 ( peter@lomaco.se )';
const MB = 'https://musicbrainz.org/ws/2';
const CURRENT_YEAR = new Date().getFullYear();
const NON_STUDIO = /\b(live|karaoke|instrumental|demo|remix|cover|tribute|rehearsal|acoustic version|re-?recorded|mix|a ?cappella)\b/i;
// Compilation / medley / mega-mix titles that are not a single song recording.
const JUNK_TITLE = /\b(medley|megamix|mega mix|vol\.?\s*\d|top \d{2,3}|mashup|mash-?up|chillzone|non-?stop|greatest hits)\b/i;
// Trailing version/format parentheticals to strip from the canonical displayName.
const VERSION_SUFFIX =
  /\s*[([](?:radio|album|single|lp|7"?|12"?|extended|original|techno|club|vocal|dub|acappella|a cappella|instrumental|clean|explicit|remaster(?:ed)?|edit|version|mix|rmx|remix)[^)\]]*[)\]]\s*$/i;

function cleanTitle(t: string): string {
  let s = t;
  for (let i = 0; i < 3; i++) {
    const next = s.replace(VERSION_SUFFIX, '').trim();
    if (next === s) break;
    s = next;
  }
  return s.replace(/\s{2,}/g, ' ').trim() || t;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
function lucene(s: string): string {
  return s.replace(/["\\]/g, ' ').replace(/\s+/g, ' ').trim();
}
async function mbGet(url: string): Promise<any | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA } });
      if (r.status === 503) {
        await sleep(2000);
        continue;
      }
      if (!r.ok) return null;
      return await r.json();
    } catch {
      await sleep(1500);
    }
  }
  return null;
}

interface CacheEntry {
  year: number | null;
  mbid?: string;
  mbTitle?: string; // MusicBrainz canonical (corrects Excel typos + field order)
  mbArtist?: string;
  note?: string;
}

/** Primary artist for the query: drop featured/secondary credits + junk. */
function primaryArtist(a: string): string {
  return a
    .split(/\s+(?:ft\.?|feat\.?|featuring|&|,|\/|x|vs\.?)\s+/i)[0]
    .trim();
}
function creditPhrase(rec: any): string {
  const ac = rec['artist-credit'] || [];
  return ac.map((a: any) => (a.name || '') + (a.joinphrase || '')).join('').trim() ||
    ac.map((a: any) => a.name).join(', ');
}

function titleClose(queryTitle: string, recTitle: string): boolean {
  const q = new Set(norm(queryTitle).split(' ').filter(Boolean));
  const r = new Set(norm(recTitle).split(' ').filter(Boolean));
  if (!q.size || !r.size) return false;
  const inter = [...q].filter((x) => r.has(x)).length;
  const jac = inter / new Set([...q, ...r]).size;
  return jac >= 0.5 || norm(recTitle).includes(norm(queryTitle)) || norm(queryTitle).includes(norm(recTitle));
}

/**
 * One ordering attempt: query recording=t, artist=primary(a).
 * Primary signal = MIN `first-release-date` across ALL artist-matched, studio,
 * title-close recordings in a wide search — that earliest recording IS the original
 * (a later remaster/comp is a distinct MBID and loses the min). Cheap: one search call.
 * Fallback (no search result carries a date): detail-call min over top candidates.
 */
async function tryOrder(t: string, a: string): Promise<CacheEntry | null> {
  const na = norm(primaryArtist(a));
  if (!na) return null;
  const q = `recording:"${lucene(t)}" AND artist:"${lucene(primaryArtist(a))}"`;
  const search = await mbGet(`${MB}/recording?query=${encodeURIComponent(q)}&fmt=json&limit=100`);
  await sleep(1100);
  if (!search?.recordings?.length) return null;
  const cands = (search.recordings as any[]).filter((rec) => {
    const credit = norm(creditPhrase(rec));
    if (credit !== na && !credit.includes(na)) return false;
    if (NON_STUDIO.test(rec.disambiguation || '')) return false;
    if (NON_STUDIO.test(rec.title || '')) return false;
    if (JUNK_TITLE.test(rec.title || '')) return false;
    if ((rec.title || '').length > 55) return false; // compilation/medley run-on
    return titleClose(t, rec.title || '');
  });
  if (!cands.length) return null;

  let best: CacheEntry | null = null;
  for (const rec of cands) {
    const m = (rec['first-release-date'] || '').match(/^(\d{4})/);
    if (!m) continue;
    const y = parseInt(m[1], 10);
    if (y < 1900 || y > CURRENT_YEAR) continue;
    if (!best || y < best.year!)
      best = { year: y, mbid: rec.id, mbTitle: cleanTitle(rec.title), mbArtist: creditPhrase(rec) };
  }
  if (best) return best;

  // Fallback: no candidate carried a search-level date — probe releases of the top few.
  for (const rec of cands.slice(0, 4)) {
    const detail = await mbGet(`${MB}/recording/${rec.id}?inc=releases&fmt=json`);
    await sleep(1100);
    for (const rel of detail?.releases || []) {
      const mm = (rel.date || '').match(/^(\d{4})/);
      if (!mm) continue;
      const y = parseInt(mm[1], 10);
      if (y < 1900 || y > CURRENT_YEAR) continue;
      if (!best || y < best.year!)
        best = { year: y, mbid: rec.id, mbTitle: cleanTitle(rec.title), mbArtist: creditPhrase(rec) };
    }
  }
  return best;
}

async function lookupYear(title: string, artist: string): Promise<CacheEntry> {
  // Ordering A: desc is "Title - Artist" (the intended format).
  const a = await tryOrder(title, artist);
  if (a) return a;
  // Ordering B: desc is actually "Artist - Title" (some hyphen rows are swapped).
  const b = await tryOrder(artist, title);
  if (b) return b;
  return { year: null, note: 'no dated studio recording for artist' };
}

interface Classified extends NewSong {
  desc: string;
  bucket: string;
}
const all: Classified[] = JSON.parse(readFileSync(path.join(OUT_DIR, 'music-import-classified.json'), 'utf8'));
const noYear = all.filter((c) => c.bucket === 'song-new-noyear' && c.title && c.artist);

const cache: Record<string, CacheEntry> = existsSync(CACHE_PATH) && !REFRESH ? JSON.parse(readFileSync(CACHE_PATH, 'utf8')) : {};
const state = loadSongCatalogState();

const found: { c: Classified; year: number; note: string; mbTitle?: string; mbArtist?: string }[] = [];
const notFound: { c: Classified; note: string }[] = [];
const dupSkipped: Classified[] = [];

let looked = 0;
(async () => {
  for (const c of noYear) {
    if (looksDuplicateSong(state, c.artist, c.title)) {
      dupSkipped.push(c);
      continue;
    }
    const key = `${norm(c.title)}|${norm(c.artist)}`;
    let entry = cache[key];
    if (!entry && looked < LIMIT) {
      entry = await lookupYear(c.title, c.artist);
      cache[key] = entry;
      looked++;
      if (looked % 10 === 0) {
        writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 1), 'utf8');
        console.log(`  …${looked} looked up`);
      }
    }
    if (entry?.year != null) found.push({ c, year: entry.year, note: `${entry.mbArtist} — ${entry.mbTitle}`, mbTitle: entry.mbTitle, mbArtist: entry.mbArtist });
    else if (entry) notFound.push({ c, note: entry.note || 'no year' });
  }
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 1), 'utf8');

  // ---- add found songs ----
  const usedIds = new Set(state.existingIds);
  const additions = new Map<Era, string[]>();
  const added: string[] = [];
  const collided: string[] = [];
  for (const { c, year, mbTitle, mbArtist } of found) {
    // A song needs real playable media (clip or Spotify) or the export skips it.
    if (!c.spotifyTrackId && !(c.ytClips && c.ytClips.length)) {
      collided.push(`${year} ${c.title} — ${c.artist} (no playable media)`);
      continue;
    }
    // Prefer MusicBrainz canonical title/artist (fixes Excel typos + swapped order).
    const title = mbTitle || c.title;
    const artist = mbArtist || c.artist;
    // Re-check dup on the corrected strings before adding.
    if (looksDuplicateSong(state, artist, title)) {
      collided.push(`${year} ${title} — ${artist} (fuzzy-matches existing after MB correction)`);
      continue;
    }
    const era = eraFromYear(year);
    const id = slugify(artist, title);
    if (usedIds.has(id)) {
      collided.push(`${year} ${title} — ${artist} (slug collides)`);
      continue;
    }
    usedIds.add(id);
    const headerRegion = state.eraHeaderRegion.get(era) ?? ['sweden'];
    const song: NewSong = { ...c, title, artist, year, era };
    if (!additions.has(era)) additions.set(era, []);
    additions.get(era)!.push(buildSongItemBlock(song, id, headerRegion));
    added.push(`${era}  ${id}  (${year}) ${title} — ${artist}`);
  }
  const filesChanged = appendBlocksToEra(CATALOG_DIR, additions, APPLY);

  const R: string[] = [];
  R.push('# Pass 2 — MusicBrainz year acquisition', '');
  R.push(`No-year candidates: ${noYear.length}`);
  R.push(`Dup-skipped (already in catalog): ${dupSkipped.length}`);
  R.push(`Year found: ${found.length}  |  Added: ${added.length}  |  Slug-collided: ${collided.length}`);
  R.push(`Year NOT found: ${notFound.length}`);
  R.push('');
  R.push('## Added (year found)', '');
  for (const a of added) R.push(`- ${a}`);
  R.push('', '## Year found but slug collided (likely dup)', '');
  for (const s of collided) R.push(`- ${s}`);
  R.push('', '## Year NOT found — held for manual entry in the Excel', '');
  for (const { c, note } of notFound) R.push(`- \`${c.title} — ${c.artist}\` (${note})`);
  R.push('', '## Dup-skipped (already in catalog under another spelling)', '');
  for (const c of dupSkipped) R.push(`- \`${c.title} — ${c.artist}\``);
  R.push('');
  writeFileSync(path.join(OUT_DIR, 'song-years.md'), R.join('\n'), 'utf8');

  console.log('=== PASS 2 SUMMARY ===');
  console.log(`candidates: ${noYear.length}  dup-skipped: ${dupSkipped.length}  found: ${found.length}  added: ${added.length}  collided: ${collided.length}  not-found: ${notFound.length}`);
  console.log(`files: ${filesChanged} (${APPLY ? 'APPLIED' : 'DRY-RUN'})`);
  console.log('report: output/song-years.md');
  if (!APPLY) console.log('re-run with --apply to write (reuses cache, no network).');
})();

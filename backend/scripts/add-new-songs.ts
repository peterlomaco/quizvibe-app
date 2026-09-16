/**
 * Pass 1 — add genuinely-new songs that already have year + media.
 *
 * Reads output/music-import-classified.json (bucket 'song-new-ready'), routes each
 * to songs-<era>.yaml by correctYear, and appends a clean item block.
 *
 * Duplicate guard (song-insert-lib): skips rows whose slug collides with an existing
 * id, OR that fuzzy-match an existing song (same artist + high title overlap). Skipped
 * rows are reported, never added.
 *
 * displayNames are rebuilt as "Title — Artist" (em-dash) but VERBATIM otherwise —
 * Excel typos remain; fix at source + re-run. Dry-run by default; --apply to write.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import * as path from 'path';
import { slugify, Era } from './music-import-lib';
import {
  NewSong,
  loadSongCatalogState,
  looksDuplicateSong,
  buildSongItemBlock,
  appendBlocksToEra,
} from './song-insert-lib';

const APPLY = process.argv.includes('--apply');
const CATALOG_DIR = path.join(__dirname, '..', 'content', 'catalog');
const OUT_DIR = path.join(__dirname, '..', 'output');
mkdirSync(OUT_DIR, { recursive: true });

interface Classified extends NewSong {
  desc: string;
  bucket: string;
}

const all: Classified[] = JSON.parse(
  readFileSync(path.join(OUT_DIR, 'music-import-classified.json'), 'utf8'),
);
const ready = all.filter((c) => c.bucket === 'song-new-ready');

const state = loadSongCatalogState();
const usedIds = new Set(state.existingIds);
const additions = new Map<Era, string[]>();
const added: string[] = [];
const skipped: string[] = [];

for (const c of ready) {
  if (!c.title || !c.artist || c.year == null || !c.era) continue;
  // Excel may flag yt=ja without a usable clip URL — a song needs real playable media
  // (clip or Spotify) or the export skips it, leaving a dead catalog entry.
  if (!c.spotifyTrackId && !(c.ytClips && c.ytClips.length)) {
    skipped.push(`${c.year} ${c.title} — ${c.artist} (no playable media)`);
    continue;
  }
  if (looksDuplicateSong(state, c.artist, c.title)) {
    skipped.push(`${c.year} ${c.title} — ${c.artist} (fuzzy-matches existing song)`);
    continue;
  }
  const id = slugify(c.artist, c.title);
  if (usedIds.has(id)) {
    skipped.push(`${c.year} ${c.title} — ${c.artist} (slug collides with existing id)`);
    continue;
  }
  usedIds.add(id);
  const headerRegion = state.eraHeaderRegion.get(c.era) ?? ['sweden'];
  const block = buildSongItemBlock(c, id, headerRegion);
  if (!additions.has(c.era)) additions.set(c.era, []);
  additions.get(c.era)!.push(block);
  added.push(`${c.era}  ${id}  (${c.year}) ${c.title} — ${c.artist}`);
}

const filesChanged = appendBlocksToEra(CATALOG_DIR, additions, APPLY);

const report = [
  '# Add new songs — Pass 1',
  '',
  `Ready rows: ${ready.length}`,
  `Added: ${added.length}`,
  `Skipped (duplicate): ${skipped.length}`,
  '',
  '## Added',
  '',
  ...added.map((a) => `- ${a}`),
  '',
  '## Skipped as duplicates',
  '',
  ...skipped.map((s) => `- ${s}`),
  '',
];
writeFileSync(path.join(OUT_DIR, 'music-add-songs.md'), report.join('\n'), 'utf8');

console.log('=== ADD NEW SONGS ===');
console.log(
  `ready: ${ready.length}  added: ${added.length}  skipped-dup: ${skipped.length}  files: ${filesChanged} (${APPLY ? 'APPLIED' : 'DRY-RUN'})`,
);
console.log('report: output/music-add-songs.md');
if (!APPLY) console.log('re-run with --apply to write.');

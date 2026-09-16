/**
 * Classify every Content/Music.xlsx row against the current catalog and emit:
 *   - music-portfolio-idmap.json      (norm(desc) -> matched song id | null; used by reconcile)
 *   - output/music-import-classified.json  (structured buckets for the apply scripts)
 *   - output/music-import-report.md   (human review — read BEFORE any --apply)
 *
 * READ-ONLY: never edits catalog YAML. Run: npx tsx scripts/classify-music-import.ts
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import * as path from 'path';
import { loadCatalog } from '../content/registry';
import {
  Row,
  norm,
  canonPkgs,
  mapRegion,
  parseDesc,
  songSpotifyId,
  parseYtClips,
  eraFromYear,
  isHintRow,
  hasSongMedia,
} from './music-import-lib';

const SCRIPT_DIR = __dirname;
const OUT_DIR = path.join(__dirname, '..', 'output');
mkdirSync(OUT_DIR, { recursive: true });

const rows: Row[] = JSON.parse(
  readFileSync(path.join(SCRIPT_DIR, 'music-portfolio.json'), 'utf8'),
);

// ---- catalog lookup maps ----
const cat = loadCatalog();
const songNormToId = new Map<string, string>();
const artistBandNormToId = new Map<string, { id: string; subject: string }>();
for (const [, file] of cat.files) {
  const subj = (file as any).contentSubject;
  for (const it of file.items) {
    const key = norm(it.displayName);
    if (subj === 'song') {
      if (!songNormToId.has(key)) songNormToId.set(key, it.id);
    } else if (subj === 'artist' || subj === 'band') {
      if (!artistBandNormToId.has(key))
        artistBandNormToId.set(key, { id: it.id, subject: subj });
    }
  }
}

// ---- classify ----
type Bucket =
  | 'song-matched'
  | 'song-new-ready'
  | 'song-new-noyear'
  | 'song-parse-error'
  | 'hint-matched'
  | 'hint-new'
  | 'held-nomedia';

interface Classified {
  desc: string;
  bucket: Bucket;
  matchedId?: string;
  matchedSubject?: string;
  title?: string;
  artist?: string;
  sep?: string;
  year?: number | null;
  spotifyTrackId?: string | null;
  ytClips?: { videoId: string; startSec: number }[];
  genrePackages?: string[];
  region?: string | null;
  inBaseCatalog?: string | null;
  parentControlled?: boolean;
  era?: string;
}

const results: Classified[] = [];
const idmap: Record<string, string | null> = {};
const droppedPkgs: { desc: string; dropped: string[] }[] = [];

for (const r of rows) {
  if (!r.desc) continue;
  const key = norm(r.desc);
  const { tags, dropped } = canonPkgs(r.pkgs);
  if (dropped.length) droppedPkgs.push({ desc: r.desc, dropped });
  const region = mapRegion(r.region);
  const inBaseCatalog = r.inbase;
  const parentControlled = (r.parent ?? '').toLowerCase() === 'yes';

  // A row flagged Hints=ja but carrying song media (the 1 "both" row) is really a
  // song — song media wins, so it falls through to the song branch below.
  if (isHintRow(r) && !hasSongMedia(r)) {
    const m = artistBandNormToId.get(key);
    results.push({
      desc: r.desc,
      bucket: m ? 'hint-matched' : 'hint-new',
      matchedId: m?.id,
      matchedSubject: m?.subject,
      genrePackages: tags,
      region,
      parentControlled,
    });
    continue;
  }

  if (hasSongMedia(r)) {
    const matchedId = songNormToId.get(key);
    if (matchedId) {
      idmap[key] = matchedId;
      results.push({
        desc: r.desc,
        bucket: 'song-matched',
        matchedId,
        spotifyTrackId: songSpotifyId(r),
        ytClips: parseYtClips(r),
        genrePackages: tags,
        region,
        inBaseCatalog,
        parentControlled,
      });
      continue;
    }
    idmap[key] = null;
    const parsed = parseDesc(r.desc);
    if (!parsed) {
      results.push({ desc: r.desc, bucket: 'song-parse-error', year: r.year });
      continue;
    }
    const common = {
      desc: r.desc,
      title: parsed.title,
      artist: parsed.artist,
      sep: parsed.sep,
      spotifyTrackId: songSpotifyId(r),
      ytClips: parseYtClips(r),
      genrePackages: tags,
      region,
      inBaseCatalog,
      parentControlled,
    };
    if (r.year != null) {
      results.push({ ...common, bucket: 'song-new-ready', year: r.year, era: eraFromYear(r.year) });
    } else {
      results.push({ ...common, bucket: 'song-new-noyear', year: null });
    }
    continue;
  }

  // no media, not a hint — but many are bare artist names already in the catalog
  // (just not flagged Hints=ja in the sheet); annotate so they read as "no action".
  const m = artistBandNormToId.get(key);
  results.push({
    desc: r.desc,
    bucket: 'held-nomedia',
    matchedId: m?.id,
    matchedSubject: m?.subject,
    region,
  });
}

// ---- write idmap (song rows only; matched -> id, unmatched-song -> null) ----
writeFileSync(
  path.join(SCRIPT_DIR, 'music-portfolio-idmap.json'),
  JSON.stringify(idmap, null, 1),
  'utf8',
);
writeFileSync(
  path.join(OUT_DIR, 'music-import-classified.json'),
  JSON.stringify(results, null, 1),
  'utf8',
);

// ---- report ----
const byBucket = new Map<Bucket, Classified[]>();
for (const r of results) {
  if (!byBucket.has(r.bucket)) byBucket.set(r.bucket, []);
  byBucket.get(r.bucket)!.push(r);
}
const count = (b: Bucket) => byBucket.get(b)?.length ?? 0;

const L: string[] = [];
L.push('# Music import — Pass 1 classification report');
L.push('');
L.push(`Source: \`Content/Music.xlsx\` → \`music-portfolio.json\` (${rows.length} rows)`);
L.push('');
L.push('## Buckets');
L.push('');
L.push('| Bucket | Count | Meaning |');
L.push('|---|---|---|');
L.push(`| song-matched | ${count('song-matched')} | existing song → reconcile metadata + media |`);
L.push(`| song-new-ready | ${count('song-new-ready')} | new song WITH year+media → add now |`);
L.push(`| song-new-noyear | ${count('song-new-noyear')} | new song, media but NO year → **Pass 2 (MusicBrainz)** |`);
L.push(`| song-parse-error | ${count('song-parse-error')} | media present but Title/Artist unparseable → manual |`);
L.push(`| hint-matched | ${count('hint-matched')} | existing artist/band → reconcile metadata |`);
L.push(`| hint-new | ${count('hint-new')} | new artist/band name → add + Wikidata hints |`);
L.push(`| held-nomedia | ${count('held-nomedia')} | no media, not a hint → held (report only) |`);
L.push('');

const section = (title: string, b: Bucket, fmt: (c: Classified) => string, limit = 0) => {
  const arr = byBucket.get(b) ?? [];
  L.push(`## ${title} (${arr.length})`);
  L.push('');
  const show = limit > 0 ? arr.slice(0, limit) : arr;
  for (const c of show) L.push(`- ${fmt(c)}`);
  if (limit > 0 && arr.length > limit) L.push(`- … and ${arr.length - limit} more (see classified.json)`);
  L.push('');
};

L.push('> ⚠ displayNames below are VERBATIM from the Excel and may contain typos');
L.push('> (e.g. "imply red", "Rchard Marx", "Fleetwod mac"). Fix at the source in');
L.push('> Content/Music.xlsx and re-run the import — the pipeline is idempotent.');
L.push('');
section('Songs — new, ready to add (year + media)', 'song-new-ready', (c) =>
  `**${c.year}** ${c.title} — ${c.artist} · ${c.era} · sep=${c.sep}` +
  `${c.spotifyTrackId ? ' · spotify' : ''}${c.ytClips?.length ? ` · ${c.ytClips.length}yt` : ''}` +
  `${c.genrePackages?.length ? ` · [${c.genrePackages.join(', ')}]` : ''}`,
);
section('Songs — parse errors (media but no clean Title/Artist)', 'song-parse-error', (c) => `\`${c.desc}\``);
section('Hints — new names to add', 'hint-new', (c) =>
  `${c.desc}${c.region ? ` (${c.region})` : ''}${c.genrePackages?.length ? ` · [${c.genrePackages.join(', ')}]` : ''}`,
  60,
);
{
  const held = byBucket.get('held-nomedia') ?? [];
  const known = held.filter((c) => c.matchedId);
  const unknown = held.filter((c) => !c.matchedId);
  L.push(`## Held — no media, not a hint (${held.length})`);
  L.push('');
  L.push(`Already in catalog as artist/band, no action needed: **${known.length}** (bare names not flagged Hints=ja in the sheet).`);
  L.push('');
  L.push(`Not in catalog, no media — genuinely unusable as-is: **${unknown.length}**:`);
  L.push('');
  for (const c of unknown.slice(0, 80)) L.push(`- \`${c.desc}\`${c.region ? ` (${c.region})` : ''}`);
  if (unknown.length > 80) L.push(`- … and ${unknown.length - 80} more`);
  L.push('');
}

L.push('## Songs — new, NO year (Pass 2 MusicBrainz queue)');
L.push('');
L.push(`Count: ${count('song-new-noyear')}. Full list in \`music-import-classified.json\` (bucket \`song-new-noyear\`).`);
L.push('');

if (droppedPkgs.length) {
  L.push('## Data errors — stray values dropped from package columns');
  L.push('');
  for (const d of droppedPkgs) L.push(`- \`${d.desc}\` → dropped: ${d.dropped.join(' | ')}`);
  L.push('');
}

// package canonicalization actually seen
const pkgSeen = new Map<string, number>();
for (const r of results) for (const t of r.genrePackages ?? []) pkgSeen.set(t, (pkgSeen.get(t) ?? 0) + 1);
L.push('## Canonical genrePackages tags seen in import');
L.push('');
for (const [t, n] of [...pkgSeen.entries()].sort((a, b) => b[1] - a[1])) L.push(`- ${t}: ${n}`);
L.push('');

writeFileSync(path.join(OUT_DIR, 'music-import-report.md'), L.join('\n'), 'utf8');

// ---- console summary ----
console.log('Classification complete:');
for (const b of [
  'song-matched',
  'song-new-ready',
  'song-new-noyear',
  'song-parse-error',
  'hint-matched',
  'hint-new',
  'held-nomedia',
] as Bucket[]) {
  console.log(`  ${b.padEnd(18)} ${count(b)}`);
}
console.log(`\nidmap: ${Object.keys(idmap).length} song rows (${Object.values(idmap).filter(Boolean).length} matched)`);
console.log(`Report: output/music-import-report.md`);

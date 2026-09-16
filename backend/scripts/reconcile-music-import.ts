/**
 * Pass 1 — reconcile matched SONG items to Content/Music.xlsx.
 *
 * Reads music-portfolio.json + music-portfolio-idmap.json (regenerate first with
 * classify-music-import.ts). For each matched song id applies:
 *   - genrePackages   AUTHORITATIVE REPLACE (canonicalized union across dup rows)
 *   - inBaseCatalog   from Excel `inbasecatalogue` (PROTECT_INBASE + orphan guard)
 *   - region          item-level override, only when EFFECTIVE region changes
 *   - parentControlled ADDITIVE (never removed)
 *   - spotifyTrackId  ADDITIVE — set only when item has none; DIFFERENCES reported, not overwritten
 *   - youtubeClips    ADDITIVE — set only when item has none; DIFFERENCES reported, not overwritten
 *
 * correctYear is NEVER touched (preserves curated years + documented exceptions).
 * Line-based, CRLF-preserving edit. Dry-run by default; pass --apply to write.
 * Diffs report -> output/music-reconcile-diffs.md.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import * as path from 'path';
import { loadCatalog } from '../content/registry';
import {
  Row,
  norm,
  canonPkgs,
  mapRegion,
  songSpotifyId,
  parseYtClips,
  CLIP_LEN,
} from './music-import-lib';

const APPLY = process.argv.includes('--apply');
const SCRIPT_DIR = __dirname;
const CATALOG_DIR = path.join(__dirname, '..', 'content', 'catalog');
const OUT_DIR = path.join(__dirname, '..', 'output');
mkdirSync(OUT_DIR, { recursive: true });

const rows: Row[] = JSON.parse(readFileSync(path.join(SCRIPT_DIR, 'music-portfolio.json'), 'utf8'));
const idmap: Record<string, string | null> = JSON.parse(
  readFileSync(path.join(SCRIPT_DIR, 'music-portfolio-idmap.json'), 'utf8'),
);

const PROTECT_INBASE = new Set([
  'sugarhill-gang-rappers-delight',
  'nas-if-i-ruled-the-world',
  'dr-dre-the-next-episode',
  '50-cent-in-da-club',
  'eminem-my-name-is',
  'outkast-ms-jackson',
]);

function yamlArray(items: string[]): string {
  return '[' + items.map((s) => JSON.stringify(s)).join(', ') + ']';
}

interface Desired {
  genrePackages: string[];
  inBaseCatalog: boolean | null;
  region: string | null;
  parentControlled: boolean;
  spotifyTrackId: string | null;
  ytClips: { videoId: string; startSec: number }[];
}

// group rows by matched id
const rowsById = new Map<string, Row[]>();
for (const row of rows) {
  if (!row.desc) continue;
  const id = idmap[norm(row.desc)];
  if (id == null) continue; // unmatched / new — handled by add-new-songs
  if (!rowsById.has(id)) rowsById.set(id, []);
  rowsById.get(id)!.push(row);
}

const desiredById = new Map<string, Desired>();
for (const [id, rs] of rowsById) {
  const primary = rs.find((r) => r.desc!.includes('—')) ?? rs[0];
  const { tags } = canonPkgs(rs.flatMap((r) => r.pkgs));
  let inBase: boolean | null =
    primary.inbase == null ? null : primary.inbase.trim().toLowerCase() === 'true';
  if (inBase === false && tags.length === 0) inBase = true; // orphan guard
  const region =
    mapRegion(primary.region) ?? mapRegion(rs.map((r) => r.region).find((r) => r != null) ?? null);
  const parentControlled = rs.some((r) => (r.parent ?? '').trim().toLowerCase() === 'yes');
  const spotifyTrackId =
    songSpotifyId(primary) ?? (rs.map((r) => songSpotifyId(r)).find((x) => x) ?? null);
  const ytClips = parseYtClips(primary).length ? parseYtClips(primary) : rs.flatMap((r) => parseYtClips(r)).slice(0, 3);
  desiredById.set(id, { genrePackages: tags, inBaseCatalog: inBase, region, parentControlled, spotifyTrackId, ytClips });
}

// locate ids
const cat = loadCatalog();
const idToFile = new Map<string, string>();
const idToItem = new Map<string, any>();
const fileHeaderRegion = new Map<string, string[]>();
for (const [fname, file] of cat.files) {
  if ((file as any).contentSubject !== 'song') continue;
  fileHeaderRegion.set(fname, (file as any).region as string[]);
  for (const it of file.items) {
    idToFile.set(it.id, fname);
    idToItem.set(it.id, it);
  }
}

function fieldRe(name: string) {
  return new RegExp('^    ' + name + ':');
}

const diffs: string[] = ['# Music reconcile — Pass 1 diffs', ''];
const summary = {
  items: 0,
  pkgReplaced: 0,
  inBaseChanged: 0,
  regionChanged: 0,
  parentAdded: 0,
  spotifyAdded: 0,
  spotifyDiffSkipped: 0,
  ytAdded: 0,
  ytDiffSkipped: 0,
};

const byFile = new Map<string, string[]>();
for (const id of desiredById.keys()) {
  const f = idToFile.get(id);
  if (!f) {
    console.warn(`  ! id not found in catalog: ${id}`);
    continue;
  }
  if (!byFile.has(f)) byFile.set(f, []);
  byFile.get(f)!.push(id);
}

let filesChanged = 0;
for (const [fname, ids] of byFile) {
  const full = path.join(CATALOG_DIR, fname);
  const text = readFileSync(full, 'utf8');
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  let lines = text.split(/\r?\n/);

  const starts: { id: string; idx: number }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^  - id:\s*(\S+)/);
    if (m) starts.push({ id: m[1], idx: i });
  }
  const idset = new Set(ids);
  const headerRegion = fileHeaderRegion.get(fname) ?? [];

  for (let s = starts.length - 1; s >= 0; s--) {
    const { id, idx } = starts[s];
    if (!idset.has(id)) continue;
    const end = s + 1 < starts.length ? starts[s + 1].idx : lines.length;
    let block = lines.slice(idx, end);
    const d = desiredById.get(id)!;
    const cur = idToItem.get(id);
    summary.items++;

    let anchor = block.findIndex((l) => /^    answerMethods:/.test(l));
    if (anchor === -1) anchor = block.findIndex((l) => /^    displayName:/.test(l));

    const setField = (name: string, newLine: string | null) => {
      const at = block.findIndex((l) => fieldRe(name).test(l));
      if (newLine == null) {
        if (at !== -1) block.splice(at, 1);
        return;
      }
      if (at !== -1) block[at] = newLine;
      else block.splice(anchor + 1, 0, newLine);
    };

    // genrePackages — authoritative replace
    const curGP: string[] = cur.genrePackages ?? [];
    if (JSON.stringify(curGP) !== JSON.stringify(d.genrePackages)) {
      summary.pkgReplaced++;
      diffs.push(`- ${id}: pkg ${JSON.stringify(curGP)} -> ${JSON.stringify(d.genrePackages)}`);
    }
    setField('genrePackages', d.genrePackages.length ? `    genrePackages: ${yamlArray(d.genrePackages)}` : null);

    // inBaseCatalog
    if (d.inBaseCatalog === false && PROTECT_INBASE.has(id)) {
      // protected — skip
    } else if (d.inBaseCatalog != null) {
      const curIB = cur.inBaseCatalog !== false;
      if (curIB !== d.inBaseCatalog) {
        summary.inBaseChanged++;
        diffs.push(`- ${id}: inBaseCatalog ${curIB} -> ${d.inBaseCatalog}`);
      }
      setField('inBaseCatalog', d.inBaseCatalog === false ? '    inBaseCatalog: false' : null);
    }

    // region — only when effective region changes
    if (d.region != null) {
      const curEff: string[] = cur.region ?? headerRegion;
      const wantEff = [d.region];
      if (JSON.stringify(curEff) !== JSON.stringify(wantEff)) {
        summary.regionChanged++;
        diffs.push(`- ${id}: region ${JSON.stringify(curEff)} -> ${JSON.stringify(wantEff)}`);
        const headerIsWant = headerRegion.length === 1 && headerRegion[0] === d.region;
        setField('region', headerIsWant ? null : `    region: ${yamlArray(wantEff)}`);
      }
    }

    // parentControlled — additive
    if (d.parentControlled && !block.some((l) => fieldRe('parentControlled').test(l))) {
      summary.parentAdded++;
      diffs.push(`- ${id}: + parentControlled: true`);
      setField('parentControlled', '    parentControlled: true');
    }

    // spotifyTrackId — additive (fill gap); report differences, never overwrite
    if (d.spotifyTrackId) {
      const curSpot: string | undefined = cur.spotifyTrackId;
      if (!curSpot) {
        summary.spotifyAdded++;
        diffs.push(`- ${id}: + spotifyTrackId ${d.spotifyTrackId}`);
        setField('spotifyTrackId', `    spotifyTrackId: ${JSON.stringify(d.spotifyTrackId)}`);
      } else if (curSpot !== d.spotifyTrackId) {
        summary.spotifyDiffSkipped++;
        diffs.push(`- ${id}: spotify DIFFERS (keep ${curSpot}, excel ${d.spotifyTrackId}) — SKIPPED`);
      }
    }

    // youtubeClips — additive (fill gap); report differences, never overwrite
    if (d.ytClips.length) {
      const curClips: any[] = cur.youtubeClips ?? [];
      if (curClips.length === 0) {
        summary.ytAdded++;
        diffs.push(`- ${id}: + youtubeClips ${d.ytClips.map((c) => c.videoId).join(',')}`);
        const at = block.findIndex((l) => fieldRe('youtubeClips').test(l));
        const clipLines = ['    youtubeClips:'];
        for (const c of d.ytClips) {
          clipLines.push(`      - videoId: ${JSON.stringify(c.videoId)}`);
          clipLines.push(`        startSec: ${c.startSec}`);
          clipLines.push(`        endSec: ${c.startSec + CLIP_LEN}`);
        }
        if (at === -1) block.splice(anchor + 1, 0, ...clipLines);
      } else {
        const curIds = curClips.map((c) => c.videoId);
        const excelIds = d.ytClips.map((c) => c.videoId);
        if (JSON.stringify(curIds) !== JSON.stringify(excelIds)) {
          summary.ytDiffSkipped++;
          diffs.push(`- ${id}: yt DIFFERS (keep ${curIds.join(',')}, excel ${excelIds.join(',')}) — SKIPPED`);
        }
      }
    }

    lines.splice(idx, end - idx, ...block);
  }

  const newText = lines.join(eol);
  if (newText !== text) {
    filesChanged++;
    if (APPLY) writeFileSync(full, newText);
  }
}

writeFileSync(path.join(OUT_DIR, 'music-reconcile-diffs.md'), diffs.join('\n'), 'utf8');
console.log('=== RECONCILE SUMMARY ===');
console.log(summary);
console.log(`files changed: ${filesChanged} (mode: ${APPLY ? 'APPLIED' : 'DRY-RUN'})`);
console.log('diffs: output/music-reconcile-diffs.md');
if (!APPLY) console.log('re-run with --apply to write.');

/**
 * Two targeted catalog edits (Peter 2026-09-16):
 *   1. Rename genrePackages tag "Pop music" -> "Disco & Pop" across all songs-*.yaml
 *      (dedup if an item already carries "Disco & Pop").
 *   2. Apply a hand-provided Spotify list (scripts/spotify-list.txt, "desc | trackId")
 *      to matching catalog songs — AUTHORITATIVE set (Peter curated these), diffs reported.
 *
 * Line-based, CRLF-preserving. Dry-run by default; --apply to write.
 * Report -> output/disco-spotify.md.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import * as path from 'path';
import { loadCatalog } from '../content/registry';
import { norm } from './music-import-lib';

const APPLY = process.argv.includes('--apply');
const CATALOG_DIR = path.join(__dirname, '..', 'content', 'catalog');
const OUT_DIR = path.join(__dirname, '..', 'output');
mkdirSync(OUT_DIR, { recursive: true });

// ---- catalog maps ----
const cat = loadCatalog();
const songNormToId = new Map<string, string>();
const idToItem = new Map<string, any>();
const idToFile = new Map<string, string>();
const songFiles = new Set<string>();
for (const [fname, file] of cat.files) {
  if ((file as any).contentSubject !== 'song') continue;
  songFiles.add(fname);
  for (const it of file.items) {
    const key = norm(it.displayName);
    if (!songNormToId.has(key)) songNormToId.set(key, it.id);
    idToItem.set(it.id, it);
    idToFile.set(it.id, fname);
  }
}

function yamlArray(items: string[]): string {
  return '[' + items.map((s) => JSON.stringify(s)).join(', ') + ']';
}

const report: string[] = ['# Disco & Pop rename + Spotify list', ''];

// ================= PASS 1: rename Pop music -> Disco & Pop =================
let renameCount = 0;
for (const fname of songFiles) {
  const full = path.join(CATALOG_DIR, fname);
  const text = readFileSync(full, 'utf8');
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const lines = text.split(/\r?\n/);
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s*genrePackages:\s*)(\[.*\])\s*$/);
    if (!m) continue;
    let tags: string[];
    try {
      tags = JSON.parse(m[2]);
    } catch {
      continue;
    }
    if (!tags.includes('Pop music')) continue;
    const next: string[] = [];
    for (const t of tags) {
      const mapped = t === 'Pop music' ? 'Disco & Pop' : t;
      if (!next.includes(mapped)) next.push(mapped);
    }
    lines[i] = `${m[1]}${yamlArray(next)}`;
    changed = true;
    renameCount++;
  }
  if (changed && APPLY) writeFileSync(full, lines.join(eol));
}
report.push(`## Pass 1 — "Pop music" → "Disco & Pop"`, '', `Items renamed: ${renameCount}`, '');

// ================= PASS 2: apply Spotify list =================
interface Entry {
  desc: string;
  trackId: string;
}
const raw = readFileSync(path.join(__dirname, 'spotify-list.txt'), 'utf8');
const entries: Entry[] = [];
for (const line of raw.split(/\r?\n/)) {
  const t = line.trim();
  if (!t) continue;
  const idx = t.lastIndexOf('|');
  if (idx === -1) continue;
  const desc = t.slice(0, idx).trim();
  const trackId = t.slice(idx + 1).trim();
  if (/^[A-Za-z0-9]{22}$/.test(trackId)) entries.push({ desc, trackId });
}

// resolve each entry -> song id
const byFile = new Map<string, { id: string; trackId: string }[]>();
const setNew: string[] = [];
const changedDiff: string[] = [];
const unchanged: string[] = [];
const unmatched: string[] = [];
for (const e of entries) {
  const id = songNormToId.get(norm(e.desc));
  if (!id) {
    unmatched.push(e.desc);
    continue;
  }
  const cur: string | undefined = idToItem.get(id)?.spotifyTrackId;
  if (cur === e.trackId) {
    unchanged.push(`${e.desc} (${id})`);
    continue;
  }
  if (cur) changedDiff.push(`${e.desc} (${id}): ${cur} -> ${e.trackId}`);
  else setNew.push(`${e.desc} (${id}): + ${e.trackId}`);
  const f = idToFile.get(id)!;
  if (!byFile.has(f)) byFile.set(f, []);
  byFile.get(f)!.push({ id, trackId: e.trackId });
}

for (const [fname, edits] of byFile) {
  const full = path.join(CATALOG_DIR, fname);
  const text = readFileSync(full, 'utf8');
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  let lines = text.split(/\r?\n/);
  const starts: { id: string; idx: number }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^  - id:\s*(\S+)/);
    if (m) starts.push({ id: m[1], idx: i });
  }
  const editMap = new Map(edits.map((e) => [e.id, e.trackId]));
  for (let s = starts.length - 1; s >= 0; s--) {
    const { id, idx } = starts[s];
    const trackId = editMap.get(id);
    if (!trackId) continue;
    const end = s + 1 < starts.length ? starts[s + 1].idx : lines.length;
    const block = lines.slice(idx, end);
    const at = block.findIndex((l) => /^    spotifyTrackId:/.test(l));
    const newLine = `    spotifyTrackId: ${JSON.stringify(trackId)}`;
    if (at !== -1) {
      block[at] = newLine;
    } else {
      let anchor = block.findIndex((l) => /^    answerMethods:/.test(l));
      if (anchor === -1) anchor = block.findIndex((l) => /^    displayName:/.test(l));
      block.splice(anchor + 1, 0, newLine);
    }
    lines.splice(idx, end - idx, ...block);
  }
  if (APPLY) writeFileSync(full, lines.join(eol));
}

report.push(
  `## Pass 2 — Spotify list (${entries.length} with a track id)`,
  '',
  `Added (was missing): ${setNew.length}`,
  ...setNew.map((s) => `- ${s}`),
  '',
  `Changed (had a different id): ${changedDiff.length}`,
  ...changedDiff.map((s) => `- ${s}`),
  '',
  `Already correct: ${unchanged.length}`,
  '',
  `NOT in catalog (need the song added first): ${unmatched.length}`,
  ...unmatched.map((s) => `- \`${s}\``),
  '',
);
writeFileSync(path.join(OUT_DIR, 'disco-spotify.md'), report.join('\n'), 'utf8');

console.log('=== DISCO RENAME + SPOTIFY LIST ===');
console.log(`rename "Pop music"->"Disco & Pop": ${renameCount} items`);
console.log(`spotify: +${setNew.length} new, ${changedDiff.length} changed, ${unchanged.length} same, ${unmatched.length} unmatched`);
console.log(`mode: ${APPLY ? 'APPLIED' : 'DRY-RUN'} | report: output/disco-spotify.md`);
if (!APPLY) console.log('re-run with --apply to write.');

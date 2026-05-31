// Append nya song-items (från new-songs-2026-05-31.json) till rätt songs-*.yaml.
// items är sista nyckeln i varje fil → säker EOF-append. Dedup mot befintliga id:n.
// Bevarar EOL. Ingen youtubeClips ännu (fylls via topic-pick-clips efteråt).
import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'yaml';

const DRY = process.argv[2] !== '--write';
const items = JSON.parse(readFileSync('scripts/new-songs-2026-05-31.json', 'utf8'));

// Samla alla befintliga id:n över alla song-filer
const SONG_FILES = ['songs-elder', 'songs-gen-x', 'songs-millennials', 'songs-gen-z', 'songs-gen-alpha', 'songs-all'];
const existingIds = new Set();
for (const f of SONG_FILES) {
  const d = parse(readFileSync(`content/catalog/${f}.yaml`, 'utf8'));
  for (const it of d.items) existingIds.add(it.id);
}

function block(it) {
  // 2-space indent för `-`, 4 för props (matchar befintliga items)
  const dn = it.displayName.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const hint = it.hint.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return [
    `  - id: ${it.id}`,
    `    displayName: "${dn}"`,
    `    correctYear: ${it.correctYear}`,
    `    probability: ${it.probability}`,
    `    wikimediaSearchHints: ["${hint}"]`,
    `    answerMethods: ["timeline"]`,
  ].join('\n');
}

const byFile = new Map();
const skipped = [];
for (const it of items) {
  if (existingIds.has(it.id)) { skipped.push(it.id); continue; }
  if (!byFile.has(it.file)) byFile.set(it.file, []);
  byFile.get(it.file).push(it);
}

let total = 0;
for (const [file, list] of byFile) {
  const path = `content/catalog/${file}.yaml`;
  let text = readFileSync(path, 'utf8');
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  if (!text.endsWith('\n') && !text.endsWith('\r\n')) text += eol;
  const addition = list.map(block).join(eol) + eol;
  // normalisera additionens EOL till filens
  const normalized = eol === '\r\n' ? addition.replace(/\n/g, '\r\n') : addition;
  console.log(`${file}: +${list.length} items  [${list.map(i => i.id).join(', ')}]`);
  total += list.length;
  if (!DRY) writeFileSync(path, text + normalized, 'utf8');
}
console.log(`\n${DRY ? 'DRY RUN' : 'WROTE'} — total ${total} nya items över ${byFile.size} filer`);
if (skipped.length) console.log(`Skippade (dubblett-id): ${skipped.join(', ')}`);

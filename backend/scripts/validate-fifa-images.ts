// Re-probe Wikipedia pageimage för varje pkg-fifa-wc-item.
// Jämför nuvarande source-URL (från batch-input) vs current Wikipedia pageimage.
// Flagga discrepancier — sannolika felmatchningar.
//
// Output:
//   - flagged items (skriv på stdout + spara till docs/fifa-wc-flagged.md)

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { loadCatalog } from '../content/registry';
import { findWikipediaPageImage } from '../wikimedia/client';

const SCRIPTS_DIR = __dirname;
const DOCS_DIR = join(__dirname, '..', '..', 'docs');

const urlByItemId = new Map<string, string>();
const batchFiles = readdirSync(SCRIPTS_DIR).filter((f) => f.startsWith('batch-input-') && f.endsWith('.json'));
for (const f of batchFiles) {
  try {
    const content = JSON.parse(readFileSync(join(SCRIPTS_DIR, f), 'utf8'));
    for (const entry of content) if (entry.id && entry.url) urlByItemId.set(entry.id, entry.url);
  } catch {}
}

const { files } = loadCatalog();
const items: Array<{ id: string; displayName: string; sourceUrl: string }> = [];
for (const [, file] of files) {
  for (const item of file.items) {
    if (!item.genrePackages?.includes('pkg-fifa-wc')) continue;
    items.push({
      id: item.id,
      displayName: item.displayName,
      sourceUrl: urlByItemId.get(item.id) ?? '',
    });
  }
}
items.sort((a, b) => a.displayName.localeCompare(b.displayName));

async function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

// Normalize URL to compare filenames (strip thumb/sizes)
function normalizeFilename(url: string): string {
  const m = url.match(/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/]+?)(?:\/\d+px-.*)?$/);
  return m ? decodeURIComponent(m[1]).toLowerCase() : '';
}

interface Flag { id: string; displayName: string; reason: string; sourceUrl: string; probeUrl: string; }
const flags: Flag[] = [];

(async () => {
  let i = 0;
  for (const it of items) {
    i++;
    if (i % 20 === 0) process.stderr.write(`[${i}/${items.length}]\n`);
    let probeUrl = '';
    for (const lang of ['en', 'sv'] as const) {
      try {
        const r = await findWikipediaPageImage(it.displayName, { lang });
        if (r && r.thumbnailUrl) { probeUrl = r.thumbnailUrl; break; }
      } catch {}
      await sleep(80);
    }
    if (!probeUrl) {
      flags.push({ ...it, reason: 'no pageimage for displayName (likely renamed or removed)', probeUrl: '' });
      continue;
    }
    const probeFile = normalizeFilename(probeUrl);
    const sourceFile = normalizeFilename(it.sourceUrl);
    if (it.sourceUrl && sourceFile && probeFile && sourceFile !== probeFile) {
      flags.push({ ...it, reason: `mismatch: source=${sourceFile} vs probe=${probeFile}`, probeUrl });
    }
  }

  console.log(`\nDone. ${flags.length} flagged of ${items.length}`);

  const md: string[] = [];
  md.push(`# FIFA WC — flagged image discrepancies`);
  md.push(``);
  md.push(`Total flagged: ${flags.length} of ${items.length}`);
  md.push(``);
  md.push(`| # | Webp (current) | ID | Display | Current source | Probe says | Reason |`);
  md.push(`|---|----------------|----|---------|----------------|------------|--------|`);
  flags.forEach((f, idx) => {
    const webp = `<img src="../assets/quiz-images/${f.id}.webp" width="120">`;
    const cur = f.sourceUrl ? `[link](${f.sourceUrl})` : '_(no batch-input)_';
    const probe = f.probeUrl ? `[link](${f.probeUrl})` : '_(none)_';
    md.push(`| ${idx + 1} | ${webp} | \`${f.id}\` | ${f.displayName} | ${cur} | ${probe} | ${f.reason} |`);
  });
  writeFileSync(join(DOCS_DIR, 'fifa-wc-flagged.md'), md.join('\n'));
  console.log(`Wrote docs/fifa-wc-flagged.md`);
})();

// Bulk-add items till athletes-yaml-filer baserat på birth-year.
// Input: JSON array av { id, url, year, displayName?, hints? }
// Output: appendar items till rätt yaml-fil + skriver display-names från ID om saknat.
//
// Usage: tsx scripts/bulk-add-items.ts --json <path>

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const CATALOG = join(__dirname, '..', 'content', 'catalog');

interface Item { id: string; url: string; year: number; displayName?: string; hint?: string; }

function idToName(id: string): string {
  return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const jsonArg = process.argv.indexOf('--json');
if (jsonArg === -1) { console.error('Usage: --json <path>'); process.exit(1); }
const items: Item[] = JSON.parse(readFileSync(process.argv[jsonArg + 1], 'utf8'));

const byFile = new Map<string, Item[]>();
for (const it of items) {
  const file = it.year <= 1975 ? 'athletes-elder-gen-x.yaml' : 'athletes-modern.yaml';
  if (!byFile.has(file)) byFile.set(file, []);
  byFile.get(file)!.push(it);
}

for (const [filename, fileItems] of byFile) {
  const path = join(CATALOG, filename);
  let content = readFileSync(path, 'utf8');
  const useCRLF = content.includes('\r\n');
  const EOL = useCRLF ? '\r\n' : '\n';

  const blocks: string[] = [
    `  # === FIFA WC Pass 8 — mass-add (Peter accepterar civilian) 2026-05-27 ===`,
  ];
  for (const it of fileItems) {
    const name = it.displayName ?? idToName(it.id);
    const hint = it.hint ?? `${name} footballer national team`;
    const lines = [
      `  - id: ${it.id}`,
      `    displayName: "${name}"`,
      `    correctYear: ${it.year}`,
      `    probability: 78`,
      `    wikimediaSearchHints: ["${hint}"]`,
      `    answerMethods: ["timeline", "name-letters"]`,
      `    genrePackages: ["pkg-fifa-wc"]`,
    ];
    blocks.push(lines.join(EOL));
  }

  // Ensure file ends with newline before append
  if (!content.endsWith(EOL)) content += EOL;
  content += blocks.join(EOL) + EOL;
  writeFileSync(path, content);
  console.log(`Wrote ${fileItems.length} items to ${filename}`);
}

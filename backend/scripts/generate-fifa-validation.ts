// Genererar validation-fil för alla pkg-fifa-wc-items.
// Output: docs/fifa-wc-validation.md (markdown med thumbnails + source-URLer).
//
// Format:
//   | # | Webp | ID | Display | Wikipedia | Source URL |
//
// För items med batch-input-JSON-entry, hämta source-URL därifrån.
// Annars derive Wikipedia article URL från displayName.

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { loadCatalog } from '../content/registry';

const SCRIPTS_DIR = join(__dirname);
const DOCS_DIR = join(__dirname, '..', '..', 'docs');

// Sammanställ source-URL-mapping från alla batch-input JSON-filer
const urlByItemId = new Map<string, string>();
const batchFiles = readdirSync(SCRIPTS_DIR).filter((f) => f.startsWith('batch-input-') && f.endsWith('.json'));
for (const f of batchFiles) {
  try {
    const content = JSON.parse(readFileSync(join(SCRIPTS_DIR, f), 'utf8'));
    for (const entry of content) {
      if (entry.id && entry.url) urlByItemId.set(entry.id, entry.url);
    }
  } catch {}
}

const { files } = loadCatalog();
interface Row {
  id: string;
  displayName: string;
  file: string;
  sourceUrl: string;
  wikipediaUrl: string;
}
const rows: Row[] = [];
for (const [filename, file] of files) {
  for (const item of file.items) {
    if (!item.genrePackages?.includes('pkg-fifa-wc')) continue;
    const sourceUrl = urlByItemId.get(item.id) ?? '';
    const wpQuery = encodeURIComponent(item.displayName.replace(/\s+/g, '_'));
    const wikipediaUrl = `https://en.wikipedia.org/wiki/${wpQuery}`;
    rows.push({ id: item.id, displayName: item.displayName, file: filename, sourceUrl, wikipediaUrl });
  }
}

rows.sort((a, b) => a.displayName.localeCompare(b.displayName));

const lines: string[] = [];
lines.push(`# FIFA World Cup Image Validation`);
lines.push(``);
lines.push(`**Total items: ${rows.length}**`);
lines.push(``);
lines.push(`Markera felmatch eller dålig kvalitet i kolumnen \"Action\". Webp-thumbnail visar vad spelaren ser i appen.`);
lines.push(``);
lines.push(`| # | Webp | ID | Display | Source | Wikipedia |`);
lines.push(`|---|------|----|---------|--------|-----------|`);

rows.forEach((r, i) => {
  const webp = `![${r.id}](../assets/quiz-images/${r.id}.webp)`;
  const source = r.sourceUrl ? `[link](${r.sourceUrl})` : '_(no batch-input)_';
  const wp = `[wp](${r.wikipediaUrl})`;
  lines.push(`| ${i + 1} | <img src=\"../assets/quiz-images/${r.id}.webp\" width=\"140\"> | \`${r.id}\` | ${r.displayName} | ${source} | ${wp} |`);
});

const outPath = join(DOCS_DIR, 'fifa-wc-validation.md');
writeFileSync(outPath, lines.join('\n'));
console.log(`Wrote ${rows.length} rows to ${outPath}`);

// Also write a CSV companion for Sheets-import
const csvLines: string[] = ['id,displayName,file,webp_path,source_url,wikipedia_url,ok'];
for (const r of rows) {
  csvLines.push(`${r.id},"${r.displayName}",${r.file},assets/quiz-images/${r.id}.webp,${r.sourceUrl},${r.wikipediaUrl},`);
}
const csvPath = join(DOCS_DIR, 'fifa-wc-validation.csv');
writeFileSync(csvPath, csvLines.join('\n'));
console.log(`Wrote CSV to ${csvPath}`);

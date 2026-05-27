// Smartare validation: flagga ENDAST items där source-URL själv är suspekt
// (filename matchar inte item-namn ELLER pekar på disambig/dokument).
//
// Probe-based mismatch (vad förra scriptet flaggade) är ofta false positive
// eftersom alt-source kit-bilder är BÄTTRE än Wikipedia default civilian.

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { loadCatalog } from '../content/registry';

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
interface Item { id: string; displayName: string; sourceUrl: string; }
const items: Item[] = [];
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

// Normalize: lowercase, strip diacritics, replace spaces with underscores
function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

interface Flag { id: string; displayName: string; sourceUrl: string; reason: string; severity: 'high' | 'medium' | 'low'; }
const flags: Flag[] = [];

for (const it of items) {
  if (!it.sourceUrl) {
    flags.push({ ...it, reason: 'no batch-input source — existing item from earlier sessions, verify manually', severity: 'low' });
    continue;
  }

  // Extract filename from URL
  const m = it.sourceUrl.match(/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/]+?)(?:\/\d+px-.*)?$/);
  const filename = m ? decodeURIComponent(m[1]) : '';
  const normFile = normalize(filename);
  const normName = normalize(it.displayName);
  // Split displayName into keywords
  const keywords = normName.split('_').filter(k => k.length >= 3);

  // HIGH severity: source is disambig/svg/pdf/document
  if (/\.(svg|pdf)$/i.test(filename)) {
    flags.push({ ...it, reason: `source is ${filename.match(/\.(svg|pdf)$/i)?.[0]} (non-photo)`, severity: 'high' });
    continue;
  }
  if (/disambig|peace_symbol|sonnenblumen|kirche|stadium_aréna|gyeongsang|three_cushion|emile_zola/i.test(filename)) {
    flags.push({ ...it, reason: `source filename suggests felmatch: ${filename}`, severity: 'high' });
    continue;
  }

  // MEDIUM: source filename doesn't contain ANY item-name keyword
  const matchCount = keywords.filter(k => normFile.includes(k)).length;
  if (matchCount === 0 && keywords.length > 0) {
    flags.push({ ...it, reason: `source filename "${filename}" contains none of: ${keywords.join(', ')}`, severity: 'medium' });
    continue;
  }
}

flags.sort((a, b) => {
  const order = { high: 0, medium: 1, low: 2 };
  return order[a.severity] - order[b.severity];
});

const md: string[] = [];
md.push(`# FIFA WC — smart-flagged image audit`);
md.push(``);
md.push(`Total: ${items.length} items, ${flags.length} flagged`);
md.push(`- HIGH severity: ${flags.filter(f => f.severity === 'high').length} (disambig/svg/pdf = sannolikt felmatch)`);
md.push(`- MEDIUM: ${flags.filter(f => f.severity === 'medium').length} (source filename matchar inte item-namn — kolla manuellt)`);
md.push(`- LOW: ${flags.filter(f => f.severity === 'low').length} (existing items från tidigare sessions utan source-URL — fortsätt att verifiera visuellt om critical)`);
md.push(``);
md.push(`**HIGH och MEDIUM är prioritet 1.** LOW = bara verifiera om de visuellt ser tveksamma ut i validation-filen.`);
md.push(``);
md.push(`| # | Sev | Webp | ID | Display | Current source | Reason |`);
md.push(`|---|-----|------|----|---------|----------------|--------|`);
flags.forEach((f, idx) => {
  const webp = `<img src="../assets/quiz-images/${f.id}.webp" width="120">`;
  const src = f.sourceUrl ? `[link](${f.sourceUrl})` : '_(none)_';
  md.push(`| ${idx + 1} | ${f.severity.toUpperCase()} | ${webp} | \`${f.id}\` | ${f.displayName} | ${src} | ${f.reason} |`);
});

writeFileSync(join(DOCS_DIR, 'fifa-wc-flagged-smart.md'), md.join('\n'));
console.log(`Wrote ${flags.length} flags to docs/fifa-wc-flagged-smart.md`);
console.log(`  HIGH: ${flags.filter(f => f.severity === 'high').length}`);
console.log(`  MEDIUM: ${flags.filter(f => f.severity === 'medium').length}`);
console.log(`  LOW: ${flags.filter(f => f.severity === 'low').length}`);

// Full license-audit för ALLA image-items i pool, inte bara pkg-fifa-wc.
// Output: docs/full-license-audit.md + keep/remove-listor.

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { loadCatalog } from '../content/registry';

const SCRIPTS_DIR = __dirname;
const DOCS_DIR = join(__dirname, '..', '..', 'docs');
const ASSETS = join(__dirname, '..', '..', 'assets', 'quiz-images');

const urlByItemId = new Map<string, string>();
const batchFiles = readdirSync(SCRIPTS_DIR).filter((f) => f.startsWith('batch-input-') && f.endsWith('.json'));
for (const f of batchFiles) {
  try {
    const content = JSON.parse(readFileSync(join(SCRIPTS_DIR, f), 'utf8'));
    for (const entry of content) if (entry.id && entry.url) urlByItemId.set(entry.id, entry.url);
  } catch {}
}

const { files } = loadCatalog();
interface Item { id: string; displayName: string; file: string; sourceUrl: string; }
const items: Item[] = [];
for (const [filename, file] of files) {
  if (file.contentForm !== 'image') continue;
  for (const item of file.items) {
    if (!existsSync(join(ASSETS, `${item.id}.webp`))) continue;
    items.push({
      id: item.id,
      displayName: item.displayName,
      file: filename,
      sourceUrl: urlByItemId.get(item.id) ?? '',
    });
  }
}
console.log(`Total image items with webp: ${items.length}`);
console.log(`  With batch-input URL: ${items.filter(i => i.sourceUrl).length}`);
console.log(`  Without batch-input URL: ${items.filter(i => !i.sourceUrl).length}`);

async function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

function urlToFilename(url: string): string {
  const m = url.match(/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/]+?)(?:\/\d+px-.*)?$/);
  if (!m) return '';
  return decodeURIComponent(m[1]);
}

async function fetchLicense(filename: string, retries = 3): Promise<string> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent('File:' + filename)}&prop=imageinfo&iiprop=extmetadata&format=json&origin=*`;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        await sleep(500 * (attempt + 1));
        continue;
      }
      const data: any = await res.json();
      const pages = data?.query?.pages ?? {};
      for (const k in pages) {
        if (k === '-1') continue; // missing file
        const meta = pages[k]?.imageinfo?.[0]?.extmetadata;
        if (!meta) continue;
        return meta.LicenseShortName?.value ?? '';
      }
      return ''; // page exists but no license
    } catch (e) {
      if (attempt === retries - 1) return '';
      await sleep(500 * (attempt + 1));
    }
  }
  return '';
}

function categorize(license: string): 'pd-safe' | 'attribution-required' | 'non-commercial' | 'unknown' {
  const l = license.toLowerCase();
  if (!l) return 'unknown';
  if (l.includes('public domain') || l.includes('pd-') || l === 'cc0' || l.includes('cc0') || l.includes('cc zero')) return 'pd-safe';
  if (l.includes('-nc') || l.includes('non-commercial') || l.includes('noncommercial')) return 'non-commercial';
  if (l.includes('cc-by') || l.includes('cc by') || l.includes('gfdl') || l.includes('attribution')) return 'attribution-required';
  return 'unknown';
}

(async () => {
  interface Result extends Item { license: string; category: string; }
  const results: Result[] = [];
  let i = 0;
  for (const item of items) {
    i++;
    if (i % 50 === 0) process.stderr.write(`[${i}/${items.length}]\n`);
    if (!item.sourceUrl) {
      results.push({ ...item, license: '(no batch-input source)', category: 'unknown' });
      continue;
    }
    const filename = urlToFilename(item.sourceUrl);
    if (!filename) {
      results.push({ ...item, license: '(bad URL)', category: 'unknown' });
      continue;
    }
    const license = await fetchLicense(filename);
    const category = categorize(license);
    results.push({ ...item, license, category });
    await sleep(200);
  }

  const byCat: Record<string, Result[]> = {
    'pd-safe': results.filter(r => r.category === 'pd-safe'),
    'attribution-required': results.filter(r => r.category === 'attribution-required'),
    'non-commercial': results.filter(r => r.category === 'non-commercial'),
    'unknown': results.filter(r => r.category === 'unknown'),
  };

  console.log(`\n=== Summary (${results.length} items) ===`);
  for (const [cat, list] of Object.entries(byCat)) {
    const pct = ((list.length / results.length) * 100).toFixed(1);
    console.log(`  ${cat.padEnd(22)}: ${list.length} (${pct}%)`);
  }

  const md: string[] = [];
  md.push(`# Full image license audit`);
  md.push(``);
  md.push(`Total: ${results.length} image items with webp`);
  for (const [cat, list] of Object.entries(byCat)) {
    const pct = ((list.length / results.length) * 100).toFixed(1);
    md.push(`- **${cat}**: ${list.length} (${pct}%)`);
  }
  md.push(``);

  for (const [cat, list] of Object.entries(byCat)) {
    md.push(`## ${cat.toUpperCase()} (${list.length})`);
    md.push(``);
    if (list.length === 0) { md.push('_(none)_'); md.push(''); continue; }
    md.push(`| id | display | file | license |`);
    md.push(`| --- | --- | --- | --- |`);
    for (const r of list.sort((a, b) => a.id.localeCompare(b.id))) {
      md.push(`| \`${r.id}\` | ${r.displayName} | ${r.file} | ${r.license || '_(none)_'} |`);
    }
    md.push(``);
  }
  writeFileSync(join(DOCS_DIR, 'full-license-audit.md'), md.join('\n'));
  console.log(`Wrote docs/full-license-audit.md`);

  // Aggregate by file for overview
  const byFileCount = new Map<string, { pd: number; cc: number; nc: number; unk: number }>();
  for (const r of results) {
    if (!byFileCount.has(r.file)) byFileCount.set(r.file, { pd: 0, cc: 0, nc: 0, unk: 0 });
    const b = byFileCount.get(r.file)!;
    if (r.category === 'pd-safe') b.pd++;
    else if (r.category === 'attribution-required') b.cc++;
    else if (r.category === 'non-commercial') b.nc++;
    else b.unk++;
  }
  console.log(`\n=== Per-file breakdown ===`);
  for (const [file, b] of [...byFileCount.entries()].sort()) {
    console.log(`  ${file.padEnd(34)} PD:${String(b.pd).padStart(3)} CC:${String(b.cc).padStart(3)} NC:${String(b.nc).padStart(3)} ?:${String(b.unk).padStart(3)}`);
  }
})();

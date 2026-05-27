// Batch-process items med explicit URL-per-item.
// Input: hardcoded ITEM_URLS-array eller --json <path>
// Output: backend/output/<id>.webp + assets/quiz-images/<id>.webp

import * as path from 'path';
import { promises as fs } from 'fs';
import { fetchImage, processImage, saveProcessedImage } from '../wikimedia/processor';
import { loadCatalog, findItemsById } from '../content/registry';

const OUTPUT_DIR = path.join(__dirname, '..', 'output');
const ASSETS_DIR = path.join(__dirname, '..', '..', 'assets', 'quiz-images');

interface ItemUrl {
  id: string;
  url: string;
}

async function processOne(itemId: string, url: string) {
  const catalog = loadCatalog();
  const matches = findItemsById(catalog, itemId);
  if (matches.length === 0) {
    return { id: itemId, status: 'error' as const, error: 'not in catalog' };
  }
  const item = matches[0].item;
  try {
    const inputBuffer = await fetchImage(url);
    const processed = await processImage(inputBuffer);
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    const outputPath = path.join(OUTPUT_DIR, `${item.id}.webp`);
    await saveProcessedImage(processed.buffer, outputPath);
    await fs.mkdir(ASSETS_DIR, { recursive: true });
    const assetsPath = path.join(ASSETS_DIR, `${item.id}.webp`);
    await fs.copyFile(outputPath, assetsPath);
    return { id: item.id, displayName: item.displayName, status: 'success' as const, assetsPath };
  } catch (e) {
    return { id: itemId, status: 'error' as const, error: (e as Error).message };
  }
}

async function main() {
  const jsonArg = process.argv.indexOf('--json');
  if (jsonArg === -1 || !process.argv[jsonArg + 1]) {
    console.error('Usage: batch-wikimedia-by-url.ts --json <path-to-json>');
    console.error('JSON format: [{"id": "...", "url": "..."}, ...]');
    process.exit(1);
  }
  const jsonPath = process.argv[jsonArg + 1];
  const raw = await fs.readFile(jsonPath, 'utf8');
  const items: ItemUrl[] = JSON.parse(raw);

  const results = [];
  for (const item of items) {
    console.error(`Processing ${item.id}...`);
    const r = await processOne(item.id, item.url);
    if (r.status === 'success') console.error(`  ✓ ${item.id} → ${r.assetsPath}`);
    else console.error(`  ✗ ${item.id}: ${r.error}`);
    results.push(r);
    await new Promise((r) => setTimeout(r, 1200));
  }

  console.log('\n=== Summary ===');
  const ok = results.filter((r) => r.status === 'success');
  const err = results.filter((r) => r.status === 'error');
  console.log(`✓ Success: ${ok.length}`);
  console.log(`✗ Errors: ${err.length}`);
  if (err.length > 0) {
    console.log('\nError items:');
    for (const r of err) console.log(`  - ${r.id}: ${('error' in r ? r.error : '')}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

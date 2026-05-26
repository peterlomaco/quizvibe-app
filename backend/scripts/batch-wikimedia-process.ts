// Batch-process Wikimedia bilder för en lista item-IDs.
// Auto-picks Wikipedia pageimage (engelska först, svenska fallback).
// Output:
//   - backend/output/<id>.webp (default sharp-pipeline)
//   - kopierar till ../assets/quiz-images/<id>.webp
//
// Användning: tsx scripts/batch-wikimedia-process.ts <id1> <id2> ...

import * as path from 'path';
import { promises as fs } from 'fs';
import { loadCatalog, findItemsById } from '../content/registry';
import { findWikipediaPageImage } from '../wikimedia/client';
import { fetchImage, processImage, saveProcessedImage } from '../wikimedia/processor';

const OUTPUT_DIR = path.join(__dirname, '..', 'output');
const ASSETS_DIR = path.join(__dirname, '..', '..', 'assets', 'quiz-images');

interface Result {
  id: string;
  displayName: string;
  status: 'success' | 'no-image' | 'error';
  url?: string;
  outputPath?: string;
  error?: string;
}

async function processOne(itemId: string): Promise<Result> {
  const catalog = loadCatalog();
  const matches = findItemsById(catalog, itemId);
  if (matches.length === 0) return { id: itemId, displayName: itemId, status: 'error', error: 'not in catalog' };
  const item = matches[0].item;

  // Wikipedia pageimage: engelska först, svenska fallback
  const hint = item.wikimediaSearchHints[0];
  let pageImage = await findWikipediaPageImage(hint, { lang: 'en' });
  if (!pageImage) pageImage = await findWikipediaPageImage(hint, { lang: 'sv' });
  if (!pageImage) {
    return {
      id: item.id,
      displayName: item.displayName,
      status: 'no-image',
      error: `No Wikipedia pageimage found (search: "${hint}")`,
    };
  }

  try {
    const inputBuffer = await fetchImage(pageImage.url);
    const processed = await processImage(inputBuffer);
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    const outputPath = path.join(OUTPUT_DIR, `${item.id}.webp`);
    await saveProcessedImage(processed.buffer, outputPath);

    // Kopiera till assets/quiz-images/
    await fs.mkdir(ASSETS_DIR, { recursive: true });
    const assetsPath = path.join(ASSETS_DIR, `${item.id}.webp`);
    await fs.copyFile(outputPath, assetsPath);

    return {
      id: item.id,
      displayName: item.displayName,
      status: 'success',
      url: pageImage.url,
      outputPath: assetsPath,
    };
  } catch (e) {
    return {
      id: item.id,
      displayName: item.displayName,
      status: 'error',
      url: pageImage.url,
      error: (e as Error).message,
    };
  }
}

async function main() {
  const itemIds = process.argv.slice(2);
  if (itemIds.length === 0) {
    console.error('Usage: batch-wikimedia-process.ts <id1> <id2> ...');
    process.exit(1);
  }

  const results: Result[] = [];
  for (const id of itemIds) {
    console.error(`Processing ${id}...`);
    const r = await processOne(id);
    if (r.status === 'success') console.error(`  ✓ ${id} → ${r.outputPath}`);
    else if (r.status === 'no-image') console.error(`  ✗ ${id}: ${r.error}`);
    else console.error(`  ✗ ${id}: ${r.error}`);
    results.push(r);
    // Slight pause för att vara snäll mot Wikipedia (no hard rate limit men trevligt)
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log('\n=== Summary ===');
  const ok = results.filter((r) => r.status === 'success');
  const noImg = results.filter((r) => r.status === 'no-image');
  const err = results.filter((r) => r.status === 'error');
  console.log(`✓ Success: ${ok.length}`);
  console.log(`✗ No-image: ${noImg.length}`);
  console.log(`✗ Errors: ${err.length}`);
  if (noImg.length > 0) {
    console.log('\nNo-image items (need explicit URL):');
    for (const r of noImg) console.log(`  - ${r.id} (${r.displayName})`);
  }
  if (err.length > 0) {
    console.log('\nError items:');
    for (const r of err) console.log(`  - ${r.id}: ${r.error}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

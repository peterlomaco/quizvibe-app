// CLI: ladda ner och processa en bild för ett item.
//
// Användning:
//   npx tsx wikimedia/process.ts <item-id>             # auto-pick: första Wikipedia pageimage
//   npx tsx wikimedia/process.ts <item-id> <url>       # explicit URL
//
// Output sparas till backend/output/<item-id>.webp. Default-tak: 1920×1080.

import * as path from 'path';
import { loadCatalog, findItemsById } from '../content/registry';
import { ContentItem } from '../content/schema';
import { findWikipediaPageImage } from './client';
import { fetchImage, processImage, saveProcessedImage } from './processor';

const OUTPUT_DIR = path.join(__dirname, '..', 'output');

async function autoPickUrl(item: ContentItem): Promise<string> {
  const hint = item.wikimediaSearchHints[0];
  // Prova engelska först, sedan svenska
  const en = await findWikipediaPageImage(hint, { lang: 'en' });
  if (en) return en.url;
  const sv = await findWikipediaPageImage(hint, { lang: 'sv' });
  if (sv) return sv.url;
  throw new Error(
    `No Wikipedia pageimage found for "${item.displayName}" (search: "${hint}"). ` +
      `Try passing an explicit URL: npm run wikimedia-process ${item.id} <url>`,
  );
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.length > 2) {
    console.error(
      'Usage:\n' +
        '  npx tsx wikimedia/process.ts <item-id>          (auto-pick)\n' +
        '  npx tsx wikimedia/process.ts <item-id> <url>    (explicit URL)',
    );
    process.exit(1);
  }

  const [itemId, explicitUrl] = args;

  const catalog = loadCatalog();
  const matches = findItemsById(catalog, itemId);
  if (matches.length === 0) {
    console.error(`Item not found: ${itemId}`);
    process.exit(1);
  }
  const item = matches[0].item;

  console.log(`Item: ${item.displayName}  (id: ${item.id})`);

  let url = explicitUrl;
  if (!url) {
    console.log('Looking up Wikipedia pageimage…');
    url = await autoPickUrl(item);
  }

  console.log(`Downloading: ${url}`);
  const inputBuffer = await fetchImage(url);
  console.log(`Downloaded: ${(inputBuffer.length / 1024).toFixed(1)} KB`);

  console.log('Processing (resize to max 1920×1080, WebP @ q85)…');
  const result = await processImage(inputBuffer);

  console.log(
    `Original:  ${result.original.width}×${result.original.height}  ` +
      `${(result.original.size / 1024).toFixed(1)} KB`,
  );
  console.log(
    `Processed: ${result.width}×${result.height}  ` +
      `${(result.size / 1024).toFixed(1)} KB  (webp q85)`,
  );

  const outputPath = path.join(OUTPUT_DIR, `${item.id}.webp`);
  await saveProcessedImage(result.buffer, outputPath);
  console.log(`Saved to: ${outputPath}`);
}

main().catch((err) => {
  console.error('Fatal:', (err as Error).message);
  process.exit(1);
});

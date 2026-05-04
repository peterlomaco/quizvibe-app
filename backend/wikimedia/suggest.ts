// CLI: föreslå Wikimedia Commons-bilder för items i content-katalogen.
// Kör med: npx tsx wikimedia/suggest.ts <item-id> [<item-id> ...]
//   eller: npx tsx wikimedia/suggest.ts --file persons-millennials.yaml
//   eller: npx tsx wikimedia/suggest.ts --all

import { loadCatalog, findItemsById } from '../content/registry';
import { ContentItem } from '../content/schema';
import {
  searchCommons,
  findWikipediaPageImage,
  WikimediaSearchResult,
} from './client';

interface SuggestionResult {
  itemId: string;
  displayName: string;
  searchTerm: string;
  hits: WikimediaSearchResult[];
  error?: string;
}

async function suggestForItem(
  item: ContentItem,
  limit: number,
): Promise<SuggestionResult[]> {
  const out: SuggestionResult[] = [];
  for (const hint of item.wikimediaSearchHints) {
    const hits: WikimediaSearchResult[] = [];
    let error: string | undefined;

    // Layer 1: Wikipedia pageimage (engelska + svenska — typiskt bästa porträtt)
    for (const lang of ['en', 'sv'] as const) {
      try {
        const pageImage = await findWikipediaPageImage(hint, { lang });
        if (pageImage) hits.push(pageImage);
        await sleep(220);
      } catch (err) {
        // Logga men fortsätt med övriga sources
        console.error(`  [warn] wikipedia-${lang} failed: ${(err as Error).message}`);
      }
    }

    // Layer 2: Commons text-search (fallback för ovanligare motiv)
    try {
      const commonsHits = await searchCommons(hint, { limit });
      hits.push(...commonsHits);
    } catch (err) {
      error = (err as Error).message;
    }

    out.push({
      itemId: item.id,
      displayName: item.displayName,
      searchTerm: hint,
      hits,
      error,
    });
    await sleep(220);
  }
  return out;
}

function printResult(result: SuggestionResult): void {
  console.log(
    `\n──────────────────────────────────────────────────────────────`,
  );
  console.log(`Item:        ${result.displayName}  (id: ${result.itemId})`);
  console.log(`Search term: "${result.searchTerm}"`);
  if (result.error) {
    console.log(`ERROR:       ${result.error}`);
    return;
  }
  if (result.hits.length === 0) {
    console.log('  (no results)');
    return;
  }
  result.hits.forEach((hit, i) => {
    console.log(`  ${i + 1}. [${hit.source}] ${hit.title}`);
    const dims = hit.width && hit.height ? `${hit.width}×${hit.height}` : 'size unknown';
    console.log(`     ${dims}  ${hit.license ?? '(license unknown)'}`);
    if (hit.artist) console.log(`     by ${hit.artist}`);
    console.log(`     thumb: ${hit.thumbnailUrl}`);
    console.log(`     page:  ${hit.descriptionUrl}`);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseArgs(argv: string[]): {
  itemIds: string[];
  filename?: string;
  all: boolean;
  limit: number;
} {
  const args = argv.slice(2);
  let filename: string | undefined;
  let all = false;
  let limit = 6;
  const itemIds: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--file') {
      filename = args[++i];
    } else if (a === '--all') {
      all = true;
    } else if (a === '--limit') {
      limit = parseInt(args[++i], 10);
    } else if (a.startsWith('--')) {
      throw new Error(`Unknown flag: ${a}`);
    } else {
      itemIds.push(a);
    }
  }
  return { itemIds, filename, all, limit };
}

async function main(): Promise<void> {
  const { itemIds, filename, all, limit } = parseArgs(process.argv);

  if (!itemIds.length && !filename && !all) {
    console.error(
      'Usage:\n' +
        '  npx tsx wikimedia/suggest.ts <item-id> [<item-id> ...]\n' +
        '  npx tsx wikimedia/suggest.ts --file <yaml-filename>\n' +
        '  npx tsx wikimedia/suggest.ts --all\n' +
        '  Optional: --limit <N>   (default 6)',
    );
    process.exit(1);
  }

  const catalog = loadCatalog();
  const itemsToProcess: ContentItem[] = [];
  const seenIds = new Set<string>();

  if (all) {
    for (const file of catalog.files.values()) {
      for (const item of file.items) {
        if (seenIds.has(item.id)) continue;
        seenIds.add(item.id);
        itemsToProcess.push(item);
      }
    }
  } else if (filename) {
    const file = catalog.files.get(filename);
    if (!file) {
      console.error(`File not found: ${filename}`);
      console.error(`Available files: ${Array.from(catalog.files.keys()).join(', ')}`);
      process.exit(1);
    }
    for (const item of file.items) {
      if (seenIds.has(item.id)) continue;
      seenIds.add(item.id);
      itemsToProcess.push(item);
    }
  } else {
    for (const id of itemIds) {
      const matches = findItemsById(catalog, id);
      if (matches.length === 0) {
        console.error(`Item not found: ${id}`);
        process.exit(1);
      }
      if (!seenIds.has(id)) {
        seenIds.add(id);
        itemsToProcess.push(matches[0].item);
      }
    }
  }

  console.log(`Searching Wikimedia Commons for ${itemsToProcess.length} item(s)...`);

  for (const item of itemsToProcess) {
    const results = await suggestForItem(item, limit);
    for (const r of results) printResult(r);
  }

  console.log(`\nDone. ${itemsToProcess.length} item(s) processed.`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});

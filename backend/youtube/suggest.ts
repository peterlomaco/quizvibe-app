// CLI: föreslå YouTube-klipp för items i content-katalogen.
// Kör med: npm run youtube-search -- <item-id> [<item-id> ...]
//   eller: npm run youtube-search -- --query "Astrid Lindgren intervju"
//   eller: npm run youtube-search -- --all
//
// Output per item: top-N search-träffar + deras videoDetails (duration,
// embeddable, age-restricted, blocked-regions). Användaren kuraterar
// manuellt och klipper in `youtubeClips`-entries i katalog-YAML:erna.

import { loadCatalog, findItemsById } from '../content/registry';
import { ContentItem } from '../content/schema';
import {
  searchVideos,
  getVideoDetails,
  getClipBlockReasons,
  YoutubeSearchResult,
  YoutubeVideoDetails,
} from './client';
import { scoreSuggestion } from './scoring';

interface SuggestionRow {
  search: YoutubeSearchResult;
  details?: YoutubeVideoDetails;
  blockReasons: string[];
  /** Heuristisk score (högre = bättre kandidat). Driver sortering så de
   *  mest sannolika "official video + HD"-kandidaterna ploppar överst,
   *  och lyric-/audio-only-/topic-kanaler hamnar längst ner. */
  score: number;
  /** Mänskligt-läsbar breakdown av scoren — visas i CLI-output bredvid
   *  score-värdet så curatorn kan kalibrera bedömningen. */
  scoreNotes: string[];
}


async function suggestForQuery(
  query: string,
  limit: number,
): Promise<SuggestionRow[]> {
  const hits = await searchVideos({ query, limit });
  if (hits.length === 0) return [];

  // Batch-anrop videos.list (1 quota-enhet oavsett antal IDs upp till 50)
  const detailsList = await getVideoDetails({
    videoIds: hits.map((h) => h.videoId),
  });
  const detailsByid = new Map(detailsList.map((d) => [d.videoId, d]));

  const rows: SuggestionRow[] = hits.map((search) => {
    const details = detailsByid.get(search.videoId);
    const blockReasons = details ? getClipBlockReasons(details) : ['details missing'];
    const { score, notes } = scoreSuggestion(search, details, blockReasons);
    return { search, details, blockReasons, score, scoreNotes: notes };
  });

  // Sortera så bästa kandidater visas först — curatorn behöver oftast
  // bara titta på top 1-3 istället för att scrolla genom alla 10.
  rows.sort((a, b) => b.score - a.score);
  return rows;
}

function formatDuration(sec: number): string {
  if (sec === 0) return '?:??';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function printSuggestion(label: string, rows: SuggestionRow[]): void {
  console.log(
    '\n──────────────────────────────────────────────────────────────',
  );
  console.log(`Query: ${label}`);
  if (rows.length === 0) {
    console.log('  (no results)');
    return;
  }
  rows.forEach((row, i) => {
    const { search, details, blockReasons, score, scoreNotes } = row;
    const status =
      blockReasons.length === 0
        ? 'OK'
        : `BLOCKED (${blockReasons.join(', ')})`;
    const dur = details ? formatDuration(details.durationSec) : '?:??';
    const channel = details?.channelTitle ?? search.channelTitle;
    const def = details?.definition === 'hd'
      ? 'HD'
      : details?.definition === 'sd'
      ? 'SD'
      : '??';
    // Score-prefix gör att curatorn ser ranking-positionen direkt.
    // "+18" / "-12" är typisk range; tecken alltid synligt.
    const scoreLabel = score >= 0 ? `+${score}` : `${score}`;
    console.log(
      `  ${i + 1}. [${scoreLabel}] ${status}  ${dur} ${def}  ${search.videoId}  "${search.title}"`,
    );
    console.log(`     channel: ${channel}`);
    if (details) {
      const lic = details.license === 'creativeCommon' ? 'CC' : 'standard';
      console.log(
        `     license: ${lic}   published: ${details.publishedAt.slice(0, 10)}`,
      );
    }
    if (scoreNotes.length > 0) {
      console.log(`     score: ${scoreNotes.join('  ')}`);
    }
    console.log(`     https://www.youtube.com/watch?v=${search.videoId}`);
  });
}

interface ParsedArgs {
  itemIds: string[];
  query?: string;
  all: boolean;
  limit: number;
}

function parseArgs(argv: string[]): ParsedArgs {
  const args = argv.slice(2);
  const itemIds: string[] = [];
  let query: string | undefined;
  let all = false;
  let limit = 10;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--query') {
      query = args[++i];
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
  return { itemIds, query, all, limit };
}

async function main(): Promise<void> {
  const { itemIds, query, all, limit } = parseArgs(process.argv);

  if (!itemIds.length && !query && !all) {
    console.error(
      'Usage:\n' +
        '  npm run youtube-search -- <item-id> [<item-id> ...]\n' +
        '  npm run youtube-search -- --query "<custom search>"\n' +
        '  npm run youtube-search -- --all\n' +
        '  Optional: --limit <N>   (default 10, max 50)',
    );
    process.exit(1);
  }

  // --query står ensam, ingen katalog-lookup
  if (query) {
    const rows = await suggestForQuery(query, limit);
    printSuggestion(`"${query}"`, rows);
    return;
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

  console.log(
    `Searching YouTube for ${itemsToProcess.length} item(s)... ` +
      `(limit ${limit} per query, ~${itemsToProcess.length * 101} quota units)`,
  );

  for (const item of itemsToProcess) {
    const q = `${item.displayName}`;
    const rows = await suggestForQuery(q, limit);
    printSuggestion(`${item.id} → "${q}"`, rows);
    // Throttla något så vi inte får rate-limit vid --all
    await sleep(150);
  }

  console.log(`\nDone. ${itemsToProcess.length} item(s) processed.`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});

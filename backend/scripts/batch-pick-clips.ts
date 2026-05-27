// Batch-curering: kör YouTube-search för en lista item-IDs (eller alla items
// som saknar youtubeClips), pickar top-scored non-blocked candidate, och
// skriver ut en markdown-tabell + JSON-summary.
//
// Användning:
//   tsx --env-file=.env.local scripts/batch-pick-clips.ts <itemId1> <itemId2> ...
//   tsx --env-file=.env.local scripts/batch-pick-clips.ts --top 10
//
// Output: markdown-tabell på stdout + JSON-fil till scripts/batch-picks.json.

import { writeFileSync, readFileSync, readdirSync } from 'fs';
import { parse } from 'yaml';
import { searchVideos, getVideoDetails, getClipBlockReasons } from '../youtube/client';
import { scoreSuggestion } from '../youtube/scoring';

interface MissingItem {
  file: string;
  id: string;
  displayName: string;
  year: number;
  prob: number;
}

interface Pick {
  itemId: string;
  displayName: string;
  year: number;
  file: string;
  topVideoId: string;
  topTitle: string;
  channelTitle: string;
  durationSec: number;
  definition: string;
  score: number;
  suggestedStartSec: number;
  suggestedEndSec: number;
  notes: string;
  alternates?: { videoId: string; title: string; score: number }[];
}

function loadAllMissing(): MissingItem[] {
  // Scanna alla *.yaml-filer i content/catalog/ vars file-header har
  // contentForm: youtube (= filerna som faktiskt bär youtubeClips). Image-
  // filer (actors-*, artists-*, athletes-*, bands-*, capitals-*) skippas.
  // distractor-pool.yaml har ingen contentForm och skippas också.
  const catalogDir = 'content/catalog';
  const yamlFiles = readdirSync(catalogDir).filter((f) => f.endsWith('.yaml'));
  const missing: MissingItem[] = [];
  for (const file of yamlFiles) {
    const f = file.replace(/\.yaml$/, '');
    const doc = parse(readFileSync(`${catalogDir}/${file}`, 'utf8')) as {
      contentForm?: string;
      items?: Array<{
        id: string;
        displayName: string;
        correctYear?: number;
        probability: number;
        youtubeClips?: unknown[];
      }>;
    };
    if (doc.contentForm !== 'youtube') continue;
    if (!doc.items) continue;
    for (const item of doc.items) {
      if (item.correctYear === undefined) continue; // safety: timeline-items kräver correctYear
      if (!item.youtubeClips || item.youtubeClips.length === 0) {
        missing.push({
          file: f,
          id: item.id,
          displayName: item.displayName,
          year: item.correctYear,
          prob: item.probability,
        });
      }
    }
  }
  missing.sort((a, b) => b.prob - a.prob);
  return missing;
}

function pickClipTimes(durationSec: number): { startSec: number; endSec: number } {
  // Mönster från befintliga youtubeClips i songs-elder: 15-sekunders-fönster
  // positionerat så det landar runt en recognizable hook. Heuristik:
  //  - Kort intro: skip första 5-10s, ta 15s framåt
  //  - För riktigt korta klipp (<30s): börja på 0
  //  - Långa klipp (>60s): positionera 25-40% in i låten (typisk chorus)
  if (durationSec < 30) return { startSec: 0, endSec: Math.min(durationSec, 15) };
  if (durationSec < 60) return { startSec: 5, endSec: 20 };
  // För typiska 2-4 min låtar: 30s in = ofta första vers eller övergång till chorus
  const startSec = Math.min(30, Math.floor(durationSec * 0.25));
  return { startSec, endSec: startSec + 15 };
}

async function pickForItem(item: MissingItem): Promise<Pick | null> {
  // Bygg query — använd displayName direkt eftersom det redan har formatet
  // "Title — Artist" som matchar YT-titlar väl.
  const query = item.displayName.replace(/—/g, '-');
  const hits = await searchVideos({ query, limit: 10 });
  if (hits.length === 0) return null;

  const detailsList = await getVideoDetails({ videoIds: hits.map((h) => h.videoId) });
  const detailsByid = new Map(detailsList.map((d) => [d.videoId, d]));

  const rows = hits.map((search) => {
    const details = detailsByid.get(search.videoId);
    const blockReasons = details ? getClipBlockReasons(details) : ['details missing'];
    const { score, notes } = scoreSuggestion(search, details, blockReasons);
    return { search, details, blockReasons, score, notes };
  });
  rows.sort((a, b) => b.score - a.score);

  const top = rows.find((r) => r.blockReasons.length === 0 && r.details);
  if (!top || !top.details) return null;

  const { startSec, endSec } = pickClipTimes(top.details.durationSec);
  const notes = `Score ${top.score} (${top.notes.join(', ')})`;
  return {
    itemId: item.id,
    displayName: item.displayName,
    year: item.year,
    file: item.file,
    topVideoId: top.search.videoId,
    topTitle: top.search.title,
    channelTitle: top.details.channelTitle,
    durationSec: top.details.durationSec,
    definition: top.details.definition,
    score: top.score,
    suggestedStartSec: startSec,
    suggestedEndSec: endSec,
    notes,
    alternates: rows
      .filter((r) => r.search.videoId !== top.search.videoId && r.blockReasons.length === 0)
      .slice(0, 2)
      .map((r) => ({ videoId: r.search.videoId, title: r.search.title, score: r.score })),
  };
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

async function main() {
  const args = process.argv.slice(2);
  const topFlag = args.indexOf('--top');
  const excludeFlag = args.indexOf('--exclude');
  const excludeIds = excludeFlag !== -1
    ? (args[excludeFlag + 1] ?? '').split(',').filter(Boolean)
    : [];
  let itemIds: string[];
  if (topFlag !== -1) {
    const n = parseInt(args[topFlag + 1] ?? '10', 10);
    const all = loadAllMissing();
    itemIds = all.filter((m) => !excludeIds.includes(m.id)).slice(0, n).map((m) => m.id);
  } else {
    itemIds = args.filter((a) => !a.startsWith('--') && !excludeIds.includes(a));
  }
  if (itemIds.length === 0) {
    console.error('Usage: batch-pick-clips.ts <id1> <id2> ... | --top N');
    process.exit(1);
  }

  const allMissing = loadAllMissing();
  const idToItem = new Map(allMissing.map((m) => [m.id, m]));
  const picks: Pick[] = [];
  console.error(`Processing ${itemIds.length} items...`);
  // YT Data API:s default-quota = 10 search.list/min. Throttle 7s mellan
  // calls för säker marginal (~8.5 calls/min).
  const THROTTLE_MS = 10000;
  for (let i = 0; i < itemIds.length; i++) {
    const id = itemIds[i];
    const item = idToItem.get(id);
    if (!item) {
      console.error(`  ⚠ ${id}: not found in missing list`);
      continue;
    }
    try {
      const pick = await pickForItem(item);
      if (pick) {
        picks.push(pick);
        console.error(`  ✓ ${id} → ${pick.topVideoId}`);
      } else {
        console.error(`  ✗ ${id}: no valid candidates`);
      }
    } catch (e) {
      console.error(`  ✗ ${id}: ${(e as Error).message}`);
    }
    if (i < itemIds.length - 1) await new Promise((r) => setTimeout(r, THROTTLE_MS));
  }

  // Markdown-tabell på stdout
  console.log('\n| Item | Year | videoId | Channel | Dur | Clip | Score |');
  console.log('|---|---|---|---|---|---|---|');
  for (const p of picks) {
    console.log(
      `| ${p.itemId} | ${p.year} | ${p.topVideoId} | ${p.channelTitle} | ${formatDuration(p.durationSec)} | ${p.suggestedStartSec}-${p.suggestedEndSec}s | ${p.score} |`,
    );
  }

  writeFileSync('scripts/batch-picks.json', JSON.stringify(picks, null, 2));
  console.error(`\nWrote ${picks.length} picks to scripts/batch-picks.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// Topic-channel-prio curering för items där default-search hittar fel innehåll
// (filmtrailers, talkshows, covers). Söker explicit med "topic" i query och
// pickar matches från Topic-kanaler (YT:s auto-uploaded studio-master).
//
// Användning: tsx --env-file=.env.local scripts/topic-pick-clips.ts <id1> <id2> ...

import { writeFileSync, readFileSync } from 'fs';
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
}

function loadAllMissing(): MissingItem[] {
  const files = ['songs-elder', 'songs-gen-x', 'songs-millennials', 'songs-gen-z', 'songs-gen-alpha', 'songs-all'];
  const missing: MissingItem[] = [];
  for (const f of files) {
    const doc = parse(readFileSync(`content/catalog/${f}.yaml`, 'utf8')) as {
      items: Array<{
        id: string;
        displayName: string;
        correctYear: number;
        probability: number;
        youtubeClips?: unknown[];
      }>;
    };
    for (const item of doc.items) {
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
  return missing;
}

function pickClipTimes(durationSec: number): { startSec: number; endSec: number } {
  if (durationSec < 30) return { startSec: 0, endSec: Math.min(durationSec, 15) };
  if (durationSec < 60) return { startSec: 5, endSec: 20 };
  const startSec = Math.min(30, Math.floor(durationSec * 0.25));
  return { startSec, endSec: startSec + 15 };
}

function parseArtistAndTitle(displayName: string): { artist: string; title: string } {
  // displayName format: "Title — Artist" (em-dash). Båda riktningar bör hanteras.
  const m = displayName.match(/^(.+?)\s+[—-]\s+(.+)$/);
  if (m) return { title: m[1].trim(), artist: m[2].trim() };
  return { title: displayName, artist: '' };
}

async function pickTopicForItem(item: MissingItem): Promise<Pick | null> {
  const { artist, title } = parseArtistAndTitle(item.displayName);
  // Query designed to bias toward Topic-channel results: artist + topic + title.
  const query = artist
    ? `${artist} Topic ${title}`
    : `${item.displayName} Topic`;

  const hits = await searchVideos({ query, limit: 10 });
  if (hits.length === 0) return null;

  const detailsList = await getVideoDetails({ videoIds: hits.map((h) => h.videoId) });
  const detailsByid = new Map(detailsList.map((d) => [d.videoId, d]));

  const rows = hits.map((search) => {
    const details = detailsByid.get(search.videoId);
    const blockReasons = details ? getClipBlockReasons(details) : ['details missing'];
    const isTopicChannel =
      (details?.channelTitle ?? search.channelTitle).endsWith('- Topic');
    const { score, notes } = scoreSuggestion(search, details, blockReasons);
    // Override: Topic-kanaler är PREFERERADE för items där default-search failade
    // (gold-standard för studio-audio). Bumpa effektiv score till +100 så de
    // alltid hamnar överst om hittade.
    const effectiveScore = isTopicChannel && blockReasons.length === 0 ? 100 : score;
    return { search, details, blockReasons, score: effectiveScore, notes, isTopicChannel };
  });
  rows.sort((a, b) => b.score - a.score);

  const top = rows.find((r) => r.blockReasons.length === 0 && r.details);
  if (!top || !top.details) return null;

  const { startSec, endSec } = pickClipTimes(top.details.durationSec);
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
    notes: top.isTopicChannel ? 'Topic-channel match' : `Score ${top.score}`,
  };
}

async function main() {
  const itemIds = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (itemIds.length === 0) {
    console.error('Usage: topic-pick-clips.ts <id1> <id2> ...');
    process.exit(1);
  }

  const allMissing = loadAllMissing();
  const idToItem = new Map(allMissing.map((m) => [m.id, m]));
  const picks: Pick[] = [];
  console.error(`Processing ${itemIds.length} items via Topic-channel search...`);
  const THROTTLE_MS = 10000;
  for (let i = 0; i < itemIds.length; i++) {
    const id = itemIds[i];
    const item = idToItem.get(id);
    if (!item) {
      console.error(`  ⚠ ${id}: not found in missing list`);
      continue;
    }
    try {
      const pick = await pickTopicForItem(item);
      if (pick) {
        picks.push(pick);
        const topicLabel = pick.notes === 'Topic-channel match' ? ' [TOPIC ✓]' : '';
        console.error(`  ✓ ${id} → ${pick.topVideoId}${topicLabel}`);
      } else {
        console.error(`  ✗ ${id}: no valid candidates`);
      }
    } catch (e) {
      console.error(`  ✗ ${id}: ${(e as Error).message}`);
    }
    if (i < itemIds.length - 1) await new Promise((r) => setTimeout(r, THROTTLE_MS));
  }

  function formatDuration(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }
  console.log('\n| Item | Year | videoId | Channel | Dur | Clip | Notes |');
  console.log('|---|---|---|---|---|---|---|');
  for (const p of picks) {
    console.log(
      `| ${p.itemId} | ${p.year} | ${p.topVideoId} | ${p.channelTitle} | ${formatDuration(p.durationSec)} | ${p.suggestedStartSec}-${p.suggestedEndSec}s | ${p.notes} |`,
    );
  }

  writeFileSync('scripts/batch-picks.json', JSON.stringify(picks, null, 2));
  console.error(`\nWrote ${picks.length} picks to scripts/batch-picks.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

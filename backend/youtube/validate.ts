// CLI: validera att alla `youtubeClips` i katalogen fortfarande är giltiga
// (embeddable, public, ej age-restricted, ej globalt region-blockerade).
//
// Kör med: npm run youtube-validate
//   eller: npm run youtube-validate -- --file persons-millennials.yaml
//   eller: npm run youtube-validate -- <item-id>
//
// Tänkt CI-användning: kör nightly + flagga clips som börjat fallera så de
// kan kureras om innan användare träffar dem i spelet.

import { loadCatalog, findItemsById } from '../content/registry';
import { ContentItem, YoutubeClip } from '../content/schema';
import {
  getVideoDetails,
  getClipBlockReasons,
  YoutubeVideoDetails,
} from './client';

interface ClipReference {
  filename: string;
  itemId: string;
  displayName: string;
  clip: YoutubeClip;
}

interface ClipReport {
  ref: ClipReference;
  status: 'ok' | 'blocked' | 'missing';
  reasons: string[];
  details?: YoutubeVideoDetails;
}

const VIDEOS_LIST_BATCH_SIZE = 50;

function collectClips(items: Array<{ filename: string; item: ContentItem }>): ClipReference[] {
  const refs: ClipReference[] = [];
  for (const { filename, item } of items) {
    if (!item.youtubeClips) continue;
    for (const clip of item.youtubeClips) {
      refs.push({
        filename,
        itemId: item.id,
        displayName: item.displayName,
        clip,
      });
    }
  }
  return refs;
}

async function validateBatch(refs: ClipReference[]): Promise<ClipReport[]> {
  if (refs.length === 0) return [];

  // Dedup videoIds — samma klipp kan teoretiskt refereras från flera items
  const uniqIds = Array.from(new Set(refs.map((r) => r.clip.videoId)));
  const detailsMap = new Map<string, YoutubeVideoDetails>();

  for (let i = 0; i < uniqIds.length; i += VIDEOS_LIST_BATCH_SIZE) {
    const batch = uniqIds.slice(i, i + VIDEOS_LIST_BATCH_SIZE);
    const list = await getVideoDetails({ videoIds: batch });
    for (const d of list) detailsMap.set(d.videoId, d);
  }

  const reports: ClipReport[] = [];
  for (const ref of refs) {
    const details = detailsMap.get(ref.clip.videoId);
    if (!details) {
      reports.push({
        ref,
        status: 'missing',
        reasons: ['video not found (deleted or private)'],
      });
      continue;
    }
    const reasons = getClipBlockReasons(details);
    // Klipp-specifik validation: startSec/endSec inom video-längd
    if (
      details.durationSec > 0 &&
      ref.clip.endSec > details.durationSec
    ) {
      reasons.push(
        `endSec=${ref.clip.endSec} exceeds video length ${details.durationSec}s`,
      );
    }
    reports.push({
      ref,
      status: reasons.length === 0 ? 'ok' : 'blocked',
      reasons,
      details,
    });
  }
  return reports;
}

function printReport(reports: ClipReport[]): void {
  if (reports.length === 0) {
    console.log('No clips to validate.');
    return;
  }
  const ok = reports.filter((r) => r.status === 'ok');
  const blocked = reports.filter((r) => r.status === 'blocked');
  const missing = reports.filter((r) => r.status === 'missing');

  console.log(
    `\nValidated ${reports.length} clip(s): ` +
      `${ok.length} OK, ${blocked.length} blocked, ${missing.length} missing.`,
  );

  if (blocked.length || missing.length) {
    console.log(
      '\n──────────────────────────── ISSUES ────────────────────────────',
    );
    for (const r of [...missing, ...blocked]) {
      const tag = r.status === 'missing' ? 'MISSING' : 'BLOCKED';
      console.log(
        `  [${tag}] ${r.ref.itemId} (${r.ref.filename}) → ${r.ref.clip.videoId}`,
      );
      console.log(`    reasons: ${r.reasons.join(', ')}`);
    }
  }

  console.log(''); // trailing newline
}

interface ParsedArgs {
  itemIds: string[];
  filename?: string;
  all: boolean;
}

function parseArgs(argv: string[]): ParsedArgs {
  const args = argv.slice(2);
  const itemIds: string[] = [];
  let filename: string | undefined;
  let all = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--file') {
      filename = args[++i];
    } else if (a === '--all' || a === '-a') {
      all = true;
    } else if (a.startsWith('--')) {
      throw new Error(`Unknown flag: ${a}`);
    } else {
      itemIds.push(a);
    }
  }
  // Default = --all om inga args anges (CI-vänligt: bara kör npm run youtube-validate)
  if (!itemIds.length && !filename) all = true;
  return { itemIds, filename, all };
}

async function main(): Promise<void> {
  const { itemIds, filename, all } = parseArgs(process.argv);
  const catalog = loadCatalog();

  const items: Array<{ filename: string; item: ContentItem }> = [];
  if (all) {
    for (const [fn, file] of catalog.files) {
      for (const item of file.items) items.push({ filename: fn, item });
    }
  } else if (filename) {
    const file = catalog.files.get(filename);
    if (!file) {
      console.error(`File not found: ${filename}`);
      console.error(
        `Available: ${Array.from(catalog.files.keys()).join(', ')}`,
      );
      process.exit(1);
    }
    for (const item of file.items) items.push({ filename, item });
  } else {
    for (const id of itemIds) {
      const matches = findItemsById(catalog, id);
      if (matches.length === 0) {
        console.error(`Item not found: ${id}`);
        process.exit(1);
      }
      items.push(...matches);
    }
  }

  const refs = collectClips(items);
  if (refs.length === 0) {
    console.log(
      `Scanned ${items.length} item(s) — none have youtubeClips configured yet.`,
    );
    return;
  }

  console.log(
    `Validating ${refs.length} clip(s) across ${items.length} item(s)...`,
  );
  const reports = await validateBatch(refs);
  printReport(reports);

  const failed = reports.filter((r) => r.status !== 'ok').length;
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});

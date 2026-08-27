// CLI: validera att alla `youtubeClips` i katalogen fortfarande är giltiga
// (embeddable, public, ej age-restricted, spelbara i SERVED_REGIONS).
//
// Kör med: npm run youtube-validate
//   eller: npm run youtube-validate -- --file persons-millennials.yaml
//   eller: npm run youtube-validate -- <item-id>
//
// Klassificeringen sker per ITEM, inte per klipp. Ett item kan bära flera
// klipp (officiell video + lyrics-version) och spelas så länge minst ett
// fungerar — se pickMediaSource i src/utils/mediaSource.ts.
//
//   DEAD     = inget spelbart klipp kvar        -> exit 1, larma
//   DEGRADED = ett klipp borta, minst ett kvar  -> rapporteras, exit 0
//
// Exit 1 BARA på DEAD. Mjuka anmärkningar — SD-upplösning, block i regioner
// vi inte levererar till — rapporteras under NOTES men fäller inte körningen.
// Se getClipIssues i ./client för severity-reglerna.
//
// CI: körs nightly via .github/workflows/youtube-validate-nightly.yml.

import { pathToFileURL } from 'node:url';
import { loadCatalog, findItemsById } from '../content/registry';
import { ContentItem, YoutubeClip } from '../content/schema';
import {
  getVideoDetails,
  getClipIssues,
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
  /**
   * 'missing'/'broken' = hårt fel, klippet spelas inte för våra spelare →
   * exit 1. 'warn' = bara mjuka anmärkningar (SD, block i icke-levererad
   * region) → rapporteras men fäller inte körningen. 'ok' = rent.
   */
  status: 'ok' | 'warn' | 'broken' | 'missing';
  hardReasons: string[];
  softReasons: string[];
  details?: YoutubeVideoDetails;
}

/**
 * Item-nivå-status. Ett item kan bära FLERA klipp (officiell video +
 * lyrics-version) och spelas så länge minst ett fungerar — se
 * `pickMediaSource` i src/utils/mediaSource.ts.
 *
 * Klassificeringen är per ITEM och inte per klipp, för det är itemet som
 * spelaren möter. Med per-klipp-larm hade cronen blivit röd varje natt så
 * fort ett av två klipp föll bort, trots att frågan fortfarande går att
 * spela — och ett larm som alltid är rött slutar man läsa.
 */
export type ItemStatus = 'ok' | 'degraded' | 'dead';

export interface ItemReport {
  filename: string;
  itemId: string;
  displayName: string;
  status: ItemStatus;
  /** Klipp som inte kan spelas för våra spelare. */
  failed: ClipReport[];
  /** Klipp som fortfarande fungerar (inkl. sådana med mjuka anmärkningar). */
  healthy: ClipReport[];
}

/**
 * Gruppera klipp-rapporter per item och sätt item-status.
 *
 * 'dead'     = INGET klipp går att spela → blockerar (exit 1)
 * 'degraded' = minst ett klipp borta, minst ett kvar → rapporteras, exit 0
 * 'ok'       = alla klipp spelbara
 *
 * Nyckeln är filnamn + item-id: registry tolererar samma id i flera filer.
 * Ett item med ETT klipp som gått sönder blir 'dead', alltså samma
 * blockerande beteende som före item-grupperingen.
 */
export function classifyItems(reports: ClipReport[]): ItemReport[] {
  const byItem = new Map<string, ItemReport>();
  for (const r of reports) {
    const key = `${r.ref.filename}::${r.ref.itemId}`;
    let entry = byItem.get(key);
    if (!entry) {
      entry = {
        filename: r.ref.filename,
        itemId: r.ref.itemId,
        displayName: r.ref.displayName,
        status: 'ok',
        failed: [],
        healthy: [],
      };
      byItem.set(key, entry);
    }
    const hardFail = r.status === 'broken' || r.status === 'missing';
    (hardFail ? entry.failed : entry.healthy).push(r);
  }
  for (const entry of byItem.values()) {
    entry.status =
      entry.failed.length === 0 ? 'ok' : entry.healthy.length === 0 ? 'dead' : 'degraded';
  }
  return Array.from(byItem.values());
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
        hardReasons: ['video not found (deleted or private)'],
        softReasons: [],
      });
      continue;
    }
    const issues = getClipIssues(details);
    const hardReasons = issues.filter((i) => i.severity === 'hard').map((i) => i.reason);
    const softReasons = issues.filter((i) => i.severity === 'soft').map((i) => i.reason);
    // Klipp-specifik validation: startSec/endSec inom video-längd. Hårt —
    // spelaren skulle söka förbi videons slut.
    if (
      details.durationSec > 0 &&
      ref.clip.endSec > details.durationSec
    ) {
      hardReasons.push(
        `endSec=${ref.clip.endSec} exceeds video length ${details.durationSec}s`,
      );
    }
    reports.push({
      ref,
      status: hardReasons.length > 0 ? 'broken' : softReasons.length > 0 ? 'warn' : 'ok',
      hardReasons,
      softReasons,
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
  const warn = reports.filter((r) => r.status === 'warn');
  const broken = reports.filter((r) => r.status === 'broken');
  const missing = reports.filter((r) => r.status === 'missing');

  const items = classifyItems(reports);
  const dead = items.filter((i) => i.status === 'dead');
  const degraded = items.filter((i) => i.status === 'degraded');

  console.log(
    `\nValidated ${reports.length} clip(s) across ${items.length} item(s): ` +
      `${ok.length} OK, ${warn.length} notes, ` +
      `${broken.length} broken, ${missing.length} missing.`,
  );
  console.log(
    `Items: ${items.length - dead.length - degraded.length} playable, ` +
      `${degraded.length} degraded, ${dead.length} DEAD.`,
  );

  // DEAD först — inget spelbart klipp kvar. Det är dessa som fäller
  // körningen och kräver åtgärd.
  if (dead.length) {
    console.log(
      '\n──────────────── DEAD ITEMS (blocking) ─────────────────────────',
    );
    for (const i of dead) {
      console.log(`  [DEAD] ${i.itemId} (${i.filename}) — ${i.displayName}`);
      for (const r of i.failed) {
        const tag = r.status === 'missing' ? 'MISSING' : 'BROKEN';
        console.log(`    ${tag} ${r.ref.clip.videoId}: ${r.hardReasons.join(', ')}`);
      }
    }
  }

  // DEGRADED fäller INTE jobbet: itemet har kvar minst ett spelbart klipp,
  // så frågan fungerar. Plocka bort det trasiga klippet ur YAML:en när du
  // hinner — annars kan slumpen i pickMediaSource landa på det.
  if (degraded.length) {
    console.log(
      '\n──────── DEGRADED ITEMS (still playable, non-blocking) ─────────',
    );
    for (const i of degraded) {
      console.log(
        `  [DEGRADED] ${i.itemId} (${i.filename}) — ` +
          `${i.failed.length} av ${i.failed.length + i.healthy.length} klipp borta`,
      );
      for (const r of i.failed) {
        const tag = r.status === 'missing' ? 'MISSING' : 'BROKEN';
        console.log(`    ${tag} ${r.ref.clip.videoId}: ${r.hardReasons.join(', ')}`);
      }
      console.log(`    kvar: ${i.healthy.map((r) => r.ref.clip.videoId).join(', ')}`);
    }
  }

  // Mjuka anmärkningar syns fortfarande, men fäller inte jobbet. Håller
  // nightly-mejlet tyst tills något faktiskt går sönder.
  const withNotes = [...broken, ...warn].filter((r) => r.softReasons.length > 0);
  if (withNotes.length) {
    console.log(
      '\n──────────────────── NOTES (non-blocking) ──────────────────────',
    );
    for (const r of withNotes) {
      console.log(
        `  [NOTE] ${r.ref.itemId} (${r.ref.filename}) → ${r.ref.clip.videoId}`,
      );
      console.log(`    ${r.softReasons.join(', ')}`);
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

  // Exit 1 BARA när ett ITEM är dött, dvs. saknar spelbart klipp helt.
  //
  // Två tidigare varianter av den här raden gjorde nightly-mejlet värdelöst:
  // först fällde mjuka anmärkningar (SD, block i regioner vi inte levererar
  // till) jobbet varje natt, sedan fällde ett brutet klipp på ett item som
  // hade ett fungerande alternativ. Larmet ska gå när en FRÅGA slutar
  // fungera — inte när ett klipp gör det.
  const deadItems = classifyItems(reports).filter((i) => i.status === 'dead');
  if (deadItems.length > 0) process.exit(1);
}

// Kör main() BARA som CLI. Utan guarden startade en `import { classifyItems }`
// från testerna hela valideringen — som anropar YouTube-API:t och sedan
// process.exit(1).
const invokedDirectly =
  !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  main().catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
  });
}

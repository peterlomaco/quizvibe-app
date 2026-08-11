// backend/youtube/autofix.ts
//
// Validerar alla youtubeClips i katalogen och söker automatiskt
// ersättnings-kandidater för brutna / saknade klipp via suggest-motorn.
//
// Användning:
//   npm run youtube-autofix                       # validera + föreslå (ingen YAML-ändring)
//   npm run youtube-autofix -- --apply            # patcha YAML-filer med bästa ersättning
//   npm run youtube-autofix -- --item avicii      # enstaka item
//   npm run youtube-autofix -- --threshold 8      # lägsta poäng för auto-patch (default 5)
//
// Quota: 1 enhet / 50 IDs (validering) + 100 enheter / sökning (ersättning).
// Worst-case 20 brutna klipp: ~9 + 2 000 = ~2 009 enheter (ryms i 10 k/dag).
//
// Output:
//   - konsol-tabell per brutet klipp + föreslagen ersättning
//   - backend/output/youtube-autofix-report.json (CI-artifact)

import * as fs from 'fs';
import * as path from 'path';
import { loadCatalog, findItemsById } from '../content/registry';
import type { ContentItem, YoutubeClip } from '../content/schema';
import {
  searchVideos,
  getVideoDetails,
  getClipBlockReasons,
  getClipIssues,
  type YoutubeVideoDetails,
  type YoutubeSearchResult,
} from './client';
import { scoreSuggestion } from './scoring';

// ─── Typer ───────────────────────────────────────────────────────────────────

interface BrokenClip {
  filename: string;
  itemId: string;
  displayName: string;
  clip: YoutubeClip;
  status: 'broken' | 'missing';
  reasons: string[];
}

interface Replacement {
  videoId: string;
  title: string;
  channelTitle: string;
  score: number;
  scoreNotes: string[];
  blockReasons: string[];
}

interface AutofixEntry {
  filename: string;
  itemId: string;
  displayName: string;
  oldVideoId: string;
  status: 'broken' | 'missing';
  reasons: string[];
  replacement: Replacement | null;
  applied: boolean;
}

// ─── Konstanter ──────────────────────────────────────────────────────────────

// Minsta antal sekunder mellan sök-anrop för att hålla oss under YT:s
// 10 sökningar/min rate-limit (6 s är minimum; 7 s ger lite marginal).
const SEARCH_THROTTLE_MS = 7_000;

// Katalogens rot-katalog (relativ till backend/ working directory).
const CATALOG_DIR = path.join(process.cwd(), 'content', 'catalog');

// Rapport-fil.
const OUTPUT_DIR = path.join(process.cwd(), 'output');
const REPORT_PATH = path.join(OUTPUT_DIR, 'youtube-autofix-report.json');

// ─── Hjälpfunktioner ─────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Bygg en bra sök-fråga baserat på item och fil-kontext.
 * Fil-namnets prefix avgör content-typen (song → music video,
 * movie → trailer, sport-event → highlights).
 */
function buildSearchQuery(displayName: string, filename: string): string {
  const fn = filename.toLowerCase();
  if (fn.includes('song') || fn.includes('artist') || fn.includes('band')) {
    return `"${displayName}" official music video`;
  }
  if (fn.includes('movie')) {
    return `"${displayName}" official trailer`;
  }
  if (fn.includes('sport')) {
    return `"${displayName}" highlights`;
  }
  return `"${displayName}" official`;
}

/**
 * Text-baserad patch av en videoId i en YAML-fil.
 * Bevarar exakt formatering (CRLF/LF, indentation, citattecken).
 * Hittar rätt item via `- id: itemId`, byter sedan första matchande
 * `- videoId: oldVideoId` i det blocket.
 */
function patchYamlVideoId(
  content: string,
  itemId: string,
  oldVideoId: string,
  newVideoId: string,
): { patched: string; changed: boolean } {
  const lineEnding = content.includes('\r\n') ? '\r\n' : '\n';
  const lines = content.split(lineEnding);

  let inTargetItem = false;
  let itemBulletIndent = -1;
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!inTargetItem) {
      // Matchar: `  - id: avicii` / `  - id: "avicii"` / `  - id: 'avicii'`
      const m = line.match(/^(\s*)-\s+id:\s+["']?([^\s"']+)["']?\s*$/);
      if (m && m[2] === itemId) {
        inTargetItem = true;
        itemBulletIndent = m[1].length;
      }
      continue;
    }

    // Nytt syskon-item på samma/lägre nivå → lämnar blocket
    const siblingMatch = line.match(/^(\s*)-\s+id:\s/);
    if (siblingMatch && siblingMatch[1].length <= itemBulletIndent) {
      inTargetItem = false;
      i--; // reprocessa raden
      continue;
    }

    // Matchar: `      - videoId: "OLD"` / `      - videoId: 'OLD'` / `      - videoId: OLD`
    const vidMatch = line.match(/^(\s*-\s+)videoId:\s+["']?([^\s"']+)["']?\s*$/);
    if (vidMatch && vidMatch[2] === oldVideoId) {
      lines[i] = `${vidMatch[1]}videoId: "${newVideoId}"`;
      changed = true;
      inTargetItem = false; // klart med detta item
    }
  }

  return { patched: lines.join(lineEnding), changed };
}

// ─── Validering (återanvänd från validate.ts) ─────────────────────────────────

const VIDEOS_BATCH = 50;

/**
 * Returnerar bara klipp med HÅRDA fel — de som faktiskt inte spelas för
 * våra spelare. Mjuka anmärkningar (SD, block i icke-levererad region)
 * räknas separat och triggar varken ersättningssökning eller exit 1.
 *
 * Före 2026-08-10 räknades varje flagga som "bruten", vilket gjorde att
 * körningen sökte ersättningar för ~20 fullt spelbara klipp varje natt
 * (~2 000 quota-enheter) och alltid exit:ade 1.
 */
async function findBrokenClips(
  items: Array<{ filename: string; item: ContentItem }>,
): Promise<{ broken: BrokenClip[]; softNoted: number }> {
  const refs: BrokenClip[] = [];
  let softNoted = 0;

  // Samla alla clips
  const allRefs: Array<{ filename: string; item: ContentItem; clip: YoutubeClip }> = [];
  for (const { filename, item } of items) {
    if (!item.youtubeClips) continue;
    for (const clip of item.youtubeClips) {
      allRefs.push({ filename, item, clip });
    }
  }
  if (allRefs.length === 0) return { broken: [], softNoted: 0 };

  console.log(`Validerar ${allRefs.length} klipp mot YouTube Data API...`);

  // Dedup videoIds och batch-hämta details
  const uniqIds = Array.from(new Set(allRefs.map((r) => r.clip.videoId)));
  const detailsMap = new Map<string, YoutubeVideoDetails>();

  for (let i = 0; i < uniqIds.length; i += VIDEOS_BATCH) {
    const batch = uniqIds.slice(i, i + VIDEOS_BATCH);
    const list = await getVideoDetails({ videoIds: batch });
    for (const d of list) detailsMap.set(d.videoId, d);
  }

  // Klassificera varje ref
  for (const { filename, item, clip } of allRefs) {
    const details = detailsMap.get(clip.videoId);
    if (!details) {
      refs.push({
        filename,
        itemId: item.id,
        displayName: item.displayName,
        clip,
        status: 'missing',
        reasons: ['video not found (deleted or private)'],
      });
      continue;
    }
    const issues = getClipIssues(details);
    const hard = issues.filter((i) => i.severity === 'hard').map((i) => i.reason);
    const soft = issues.filter((i) => i.severity === 'soft').map((i) => i.reason);
    if (
      details.durationSec > 0 &&
      clip.endSec > details.durationSec
    ) {
      hard.push(`endSec=${clip.endSec} exceeds duration ${details.durationSec}s`);
    }
    if (hard.length > 0) {
      refs.push({ filename, itemId: item.id, displayName: item.displayName, clip, status: 'broken', reasons: hard });
    } else if (soft.length > 0) {
      softNoted++;
    }
  }
  return { broken: refs, softNoted };
}

// ─── Ersättningssökning ──────────────────────────────────────────────────────

async function findReplacement(broken: BrokenClip): Promise<Replacement | null> {
  const query = buildSearchQuery(broken.displayName, broken.filename);
  console.log(`  Söker: ${query}`);

  let candidates: YoutubeSearchResult[];
  try {
    candidates = await searchVideos({ query, limit: 10 });
  } catch (err) {
    console.error(`  Sök-fel för ${broken.itemId}: ${err}`);
    return null;
  }
  if (candidates.length === 0) return null;

  // Hämta details för alla kandidater i ett batch-anrop
  const ids = candidates.map((c) => c.videoId).filter(Boolean);
  let detailsList: YoutubeVideoDetails[] = [];
  try {
    detailsList = await getVideoDetails({ videoIds: ids });
  } catch {
    detailsList = [];
  }
  const detailsMap = new Map(detailsList.map((d) => [d.videoId, d]));

  // Poängsätt och sortera
  const scored = candidates.map((c) => {
    const details = detailsMap.get(c.videoId);
    const blockReasons = details ? getClipBlockReasons(details) : ['details unavailable'];
    const { score, notes } = scoreSuggestion(c, details, blockReasons);
    return { candidate: c, details, blockReasons, score, notes };
  });
  scored.sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best) return null;

  return {
    videoId: best.candidate.videoId,
    title: best.candidate.title,
    channelTitle: best.candidate.channelTitle ?? best.details?.channelTitle ?? '',
    score: best.score,
    scoreNotes: best.notes,
    blockReasons: best.blockReasons,
  };
}

// ─── YAML-patching ────────────────────────────────────────────────────────────

function applyReplacement(
  filename: string,
  itemId: string,
  oldVideoId: string,
  newVideoId: string,
): boolean {
  const filePath = path.join(CATALOG_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.error(`  Filen finns inte: ${filePath}`);
    return false;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const { patched, changed } = patchYamlVideoId(content, itemId, oldVideoId, newVideoId);
  if (!changed) {
    console.error(`  Kunde inte hitta videoId "${oldVideoId}" för item "${itemId}" i ${filename}`);
    return false;
  }
  fs.writeFileSync(filePath, patched, 'utf-8');
  return true;
}

// ─── Rapportering ─────────────────────────────────────────────────────────────

function printSummary(entries: AutofixEntry[]): void {
  const fixed = entries.filter((e) => e.applied);
  const withReplacement = entries.filter((e) => e.replacement && !e.applied);
  const noReplacement = entries.filter((e) => !e.replacement);

  console.log('\n══════════════════════ AUTOFIX RAPPORT ══════════════════════');
  console.log(`  Totalt brutna: ${entries.length}`);
  if (fixed.length)     console.log(`  ✓ Auto-patchade: ${fixed.length}`);
  if (withReplacement.length) console.log(`  ⚠ Ersättning hittad (ej applicerad, kör --apply): ${withReplacement.length}`);
  if (noReplacement.length)   console.log(`  ✗ Ingen ersättning hittad: ${noReplacement.length}`);
  console.log('═════════════════════════════════════════════════════════════\n');

  for (const e of entries) {
    const tag = e.applied ? '✓ PATCHAD' : e.replacement ? '⚠ FÖRESLAGEN' : '✗ SAKNAS';
    console.log(`[${tag}] ${e.itemId} (${e.filename})`);
    console.log(`  Gammalt klipp : ${e.oldVideoId} — ${e.reasons.join(', ')}`);
    if (e.replacement) {
      console.log(`  Ny kandidat  : ${e.replacement.videoId} (score ${e.replacement.score})`);
      console.log(`  Titel        : ${e.replacement.title}`);
      console.log(`  Kanal        : ${e.replacement.channelTitle}`);
      if (e.replacement.blockReasons.length) {
        console.log(`  VARNING      : ${e.replacement.blockReasons.join(', ')}`);
      }
    }
    console.log('');
  }
}

function saveReport(entries: AutofixEntry[]): void {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(entries, null, 2), 'utf-8');
  console.log(`Rapport sparad: ${REPORT_PATH}`);
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

interface ParsedArgs {
  itemIds: string[];
  apply: boolean;
  threshold: number;
  all: boolean;
}

function parseArgs(argv: string[]): ParsedArgs {
  const args = argv.slice(2);
  const itemIds: string[] = [];
  let apply = false;
  let threshold = 5;
  let all = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--apply') {
      apply = true;
    } else if (a === '--all' || a === '-a') {
      all = true;
    } else if (a === '--threshold') {
      threshold = parseInt(args[++i] ?? '5', 10);
    } else if (a === '--item') {
      itemIds.push(args[++i]);
    } else if (!a.startsWith('--')) {
      itemIds.push(a);
    }
  }
  if (!itemIds.length) all = true;
  return { itemIds, apply, threshold, all };
}

async function main(): Promise<void> {
  const { itemIds, apply, threshold, all } = parseArgs(process.argv);
  const catalog = loadCatalog();

  const items: Array<{ filename: string; item: ContentItem }> = [];
  if (all) {
    for (const [fn, file] of catalog.files) {
      for (const item of file.items) items.push({ filename: fn, item });
    }
  } else {
    for (const id of itemIds) {
      const matches = findItemsById(catalog, id);
      if (!matches.length) {
        console.error(`Item hittades inte: ${id}`);
        process.exit(1);
      }
      items.push(...matches);
    }
  }

  // 1. Hitta brutna klipp (bara hårda fel — se findBrokenClips)
  const { broken, softNoted } = await findBrokenClips(items);
  if (softNoted > 0) {
    console.log(
      `  ${softNoted} klipp har mjuka anmärkningar (SD / block i regioner vi ` +
        `inte levererar till) — spelas normalt, ingen åtgärd krävs.`,
    );
  }
  if (!broken.length) {
    console.log(`\n✓ Alla klipp spelbara (${items.length} items, inga brutna hittades)`);
    saveReport([]);
    return;
  }
  console.log(`\n${broken.length} brutna klipp hittade — söker ersättningar...\n`);

  // 2. Sök ersättningar för varje brutet klipp (throttlad för rate-limit)
  const entries: AutofixEntry[] = [];
  for (let i = 0; i < broken.length; i++) {
    const b = broken[i];
    if (i > 0) await sleep(SEARCH_THROTTLE_MS);

    const replacement = await findReplacement(b);

    let applied = false;
    const canAutoApply =
      apply &&
      replacement !== null &&
      replacement.score >= threshold &&
      replacement.blockReasons.length === 0;

    if (canAutoApply && replacement) {
      applied = applyReplacement(b.filename, b.itemId, b.clip.videoId, replacement.videoId);
      if (applied) {
        console.log(`  ✓ Patchade ${b.itemId}: ${b.clip.videoId} → ${replacement.videoId}`);
      }
    }

    entries.push({
      filename: b.filename,
      itemId: b.itemId,
      displayName: b.displayName,
      oldVideoId: b.clip.videoId,
      status: b.status,
      reasons: b.reasons,
      replacement,
      applied,
    });
  }

  // 3. Skriv ut och spara rapport
  printSummary(entries);
  saveReport(entries);

  // Exit 1 om det finns HÅRT brutna klipp som inte auto-patchades. Mjuka
  // anmärkningar når aldrig hit (filtreras i findBrokenClips), så en grön
  // körning betyder numera "inget är trasigt" — inte "inget är flaggat".
  const unfixed = entries.filter((e) => !e.applied);
  if (unfixed.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});

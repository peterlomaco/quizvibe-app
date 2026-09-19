// CLI: audit that every `youtubeClips` entry actually PLAYS in a real embedded
// player on a third-party origin — the one failure mode the Data API and oEmbed
// both miss (owner embed-block) plus the ones they catch (deleted/private).
//
// Run with: npm run youtube-embed-audit
//      or:  npm run youtube-embed-audit -- --file movies-classics.yaml
//      or:  npm run youtube-embed-audit -- <item-id>
//
// WHY a real browser: neither the YouTube Data API (`status.embeddable=true` does
// not reflect content-owner embed-blocks — the documented FIFA gotcha) nor oEmbed
// (returns 200 for embed-blocked videos — see youtubeLiveness.ts) can tell whether
// a clip plays in OUR embed. Only loading it in a real IFrame player on a NON-
// youtube origin reproduces what the app's WebView does. This uses Playwright's
// bundled Chromium; it is a backend curation tool, never shipped in the app.
//
// TWO HARD-WON REQUIREMENTS (see the calibration notes in git history):
//   1. Secure origin. Served over http://, YouTube returns spurious error_150 for
//      most real videos (incl. a known-good control). Over https:// they all play.
//      We fulfil the page from a synthetic https origin via route interception.
//   2. "reached playing" is the ONLY trustworthy signal. Error CODES are not
//      reliable headless (a bogus id returns 150, not 2), so we classify on
//      whether the player reaches buffering/playing, and re-probe every non-ok
//      clip once to filter transients.
//
// SAFETY GUARD: known-good CONTROL clips are probed every run. If a control comes
// back dead, the environment is throttling us → the run is UNRELIABLE, we flag
// nothing and exit 0. This makes a false-positive mass-removal impossible.
//
// Classification is per ITEM (mirrors validate.ts): an item is DEAD only when
// EVERY clip fails to play. DEAD → exit 1 (nightly signal). Never throws a clip's
// probe error up; a probe that can't run counts as alive (fail-open).

import { pathToFileURL } from 'node:url';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { chromium, type Browser, type Page } from 'playwright';
import { loadCatalog, findItemsById } from '../content/registry';
import { ContentItem, YoutubeClip } from '../content/schema';

// Known-embeddable videos used to detect a throttled/unreliable environment.
// dQw4w9WgXcQ = Rick Astley (plays over https); the others are official uploads.
const CONTROL_IDS = ['dQw4w9WgXcQ', 't06RUxPbp_c', 'vKQi3bBA1y8'];

const CONCURRENCY = 6;
const OBSERVE_MS = 8000;
const REPROBE_OBSERVE_MS = 9000;
const API_READY_TIMEOUT_MS = 20000;
const OUTPUT_DIR = path.join(process.cwd(), 'output');
const REPORT_PATH = path.join(OUTPUT_DIR, 'youtube-embed-audit.json');

// Page injected into a synthetic https origin. window.__probe(id, ms) resolves
// 'ok' (reached buffering/playing), 'error_N', 'unknown' (no event) or 'exception'.
const PROBE_PAGE = `<!doctype html><html><head><meta charset=utf-8></head><body>
<script src="https://www.youtube.com/iframe_api"></script>
<script>
window.__apiReady=false;
function onYouTubeIframeAPIReady(){window.__apiReady=true;}
window.__probe=function(id,observeMs){return new Promise(function(resolve){
  var box=document.createElement('div');document.body.appendChild(box);
  var done=false,lastErr=null,reachedPlay=false,p=null;
  function cleanup(){try{if(p&&p.destroy)p.destroy();}catch(e){}try{box.remove();}catch(e){}}
  function fin(v){if(done)return;done=true;cleanup();resolve(v);}
  try{
    p=new YT.Player(box,{height:2,width:2,videoId:id,
      playerVars:{origin:location.origin,playsinline:1,autoplay:0},
      events:{
        onReady:function(){try{p.mute();p.playVideo();}catch(e){}},
        onError:function(e){lastErr=e.data;if(!reachedPlay)setTimeout(function(){fin('error_'+lastErr);},400);},
        onStateChange:function(e){if(e.data===3||e.data===1){reachedPlay=true;fin('ok');}}
      }});
  }catch(e){fin('exception');}
  setTimeout(function(){fin(reachedPlay?'ok':(lastErr?('error_'+lastErr):'unknown'));},observeMs);
});};
</script></body></html>`;

interface ClipRef {
  filename: string;
  itemId: string;
  displayName: string;
  clip: YoutubeClip;
}

type Verdict = 'alive' | 'dead' | 'unknown';

interface ClipResult {
  ref: ClipRef;
  verdict: Verdict;
  detail: string; // raw probe outcome(s), e.g. "error_150 / error_150"
}

export type ItemStatus = 'ok' | 'degraded' | 'dead';

interface ItemReport {
  filename: string;
  itemId: string;
  displayName: string;
  status: ItemStatus;
  dead: ClipResult[];
  alive: ClipResult[];
}

function collectClips(
  items: Array<{ filename: string; item: ContentItem }>,
): ClipRef[] {
  const refs: ClipRef[] = [];
  for (const { filename, item } of items) {
    if (!item.youtubeClips) continue;
    for (const clip of item.youtubeClips) {
      refs.push({ filename, itemId: item.id, displayName: item.displayName, clip });
    }
  }
  return refs;
}

async function makePage(browser: Browser): Promise<Page> {
  const ctx = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  // Skip the EU consent interstitial that would otherwise stop the embed iframe.
  await ctx.addCookies([
    { name: 'SOCS', value: 'CAI', domain: '.youtube.com', path: '/' },
    { name: 'CONSENT', value: 'YES+cb', domain: '.youtube.com', path: '/' },
  ]);
  const page = await ctx.newPage();
  // Synthetic https origin (secure context, no cert) — required, see header.
  await page.route('https://quizvibe.audit/', (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: PROBE_PAGE }),
  );
  await page.goto('https://quizvibe.audit/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction('window.__apiReady===true', { timeout: API_READY_TIMEOUT_MS });
  return page;
}

// Probe a list of ids concurrently on one page. Returns id -> raw outcome.
async function probeBatch(
  page: Page,
  ids: string[],
  observeMs: number,
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  let idx = 0;
  const worker = async (): Promise<void> => {
    while (idx < ids.length) {
      const id = ids[idx++];
      try {
        const v = (await page.evaluate(
          ([i, ms]) => (window as unknown as { __probe: (a: string, b: number) => Promise<string> }).__probe(i as string, ms as number),
          [id, observeMs] as [string, number],
        )) as string;
        out.set(id, v);
      } catch {
        out.set(id, 'unknown'); // page/eval hiccup → fail-open
      }
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, ids.length) }, () => worker()),
  );
  return out;
}

function outcomeToVerdict(o: string | undefined): Verdict {
  if (o === 'ok') return 'alive';
  if (o === undefined || o === 'unknown' || o === 'exception') return 'unknown';
  return 'dead'; // error_*
}

export function classifyItems(results: ClipResult[]): ItemReport[] {
  const byItem = new Map<string, ItemReport>();
  for (const r of results) {
    const key = `${r.ref.filename}::${r.ref.itemId}`;
    let e = byItem.get(key);
    if (!e) {
      e = {
        filename: r.ref.filename,
        itemId: r.ref.itemId,
        displayName: r.ref.displayName,
        status: 'ok',
        dead: [],
        alive: [],
      };
      byItem.set(key, e);
    }
    // 'unknown' counts as alive for item-status (fail-open — never kill an item on a maybe).
    (r.verdict === 'dead' ? e.dead : e.alive).push(r);
  }
  for (const e of byItem.values()) {
    e.status = e.dead.length === 0 ? 'ok' : e.alive.length === 0 ? 'dead' : 'degraded';
  }
  return [...byItem.values()];
}

function printReport(items: ItemReport[], results: ClipResult[]): void {
  const dead = items.filter((i) => i.status === 'dead');
  const degraded = items.filter((i) => i.status === 'degraded');
  const deadClips = results.filter((r) => r.verdict === 'dead');
  const unknown = results.filter((r) => r.verdict === 'unknown');

  console.log(
    `\nProbed ${results.length} clip(s) across ${items.length} item(s): ` +
      `${items.length - dead.length - degraded.length} playable, ` +
      `${degraded.length} degraded, ${dead.length} DEAD ` +
      `(${deadClips.length} dead clip(s), ${unknown.length} unverifiable).`,
  );

  if (dead.length) {
    console.log('\n──────────────── DEAD ITEMS (no clip plays — blocking) ─────────');
    for (const i of dead) {
      console.log(`  [DEAD] ${i.itemId} (${i.filename}) — ${i.displayName}`);
      for (const r of i.dead) {
        console.log(`    ✗ ${r.ref.clip.videoId} (ch: ${r.ref.clip.channelTitle ?? '?'}): ${r.detail}`);
      }
    }
  }
  if (degraded.length) {
    console.log('\n──────── DEGRADED ITEMS (still has a playable clip) ────────────');
    for (const i of degraded) {
      console.log(`  [DEGRADED] ${i.itemId} (${i.filename}) — ${i.dead.length} of ${i.dead.length + i.alive.length} clip(s) dead`);
      for (const r of i.dead) console.log(`    ✗ ${r.ref.clip.videoId}: ${r.detail}`);
    }
  }
  if (unknown.length) {
    console.log('\n──────── UNVERIFIABLE (no play + no error — treated alive) ─────');
    for (const r of unknown) {
      console.log(`  [UNKNOWN] ${r.ref.itemId} → ${r.ref.clip.videoId}: ${r.detail}`);
    }
  }
  console.log('');
}

function saveReport(items: ItemReport[]): void {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const payload = {
    generatedAt: new Date().toISOString(),
    dead: items.filter((i) => i.status === 'dead'),
    degraded: items.filter((i) => i.status === 'degraded'),
  };
  fs.writeFileSync(REPORT_PATH, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`Report saved: ${REPORT_PATH}`);
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
    if (a === '--file') filename = args[++i];
    else if (a === '--all' || a === '-a') all = true;
    else if (a.startsWith('--')) throw new Error(`Unknown flag: ${a}`);
    else itemIds.push(a);
  }
  if (!itemIds.length && !filename) all = true;
  return { itemIds, filename, all };
}

async function main(): Promise<void> {
  const { itemIds, filename, all } = parseArgs(process.argv);
  const catalog = loadCatalog();

  const items: Array<{ filename: string; item: ContentItem }> = [];
  if (all) {
    for (const [fn, file] of catalog.files) for (const item of file.items) items.push({ filename: fn, item });
  } else if (filename) {
    const file = catalog.files.get(filename);
    if (!file) {
      console.error(`File not found: ${filename}`);
      process.exit(1);
    }
    for (const item of file.items) items.push({ filename, item });
  } else {
    for (const id of itemIds) {
      const matches = findItemsById(catalog, id);
      if (!matches.length) {
        console.error(`Item not found: ${id}`);
        process.exit(1);
      }
      items.push(...matches);
    }
  }

  const refs = collectClips(items);
  if (refs.length === 0) {
    console.log(`Scanned ${items.length} item(s) — none have youtubeClips.`);
    return;
  }

  const uniqIds = Array.from(new Set(refs.map((r) => r.clip.videoId)));
  console.log(
    `Embed-auditing ${refs.length} clip(s) (${uniqIds.length} unique) across ` +
      `${items.length} item(s) in a real headless embed…`,
  );

  const browser = await chromium.launch({ headless: true });
  const outcomes = new Map<string, string>();
  try {
    const page = await makePage(browser);

    // Pass 1: probe every unique id + the controls.
    const pass1Ids = Array.from(new Set([...CONTROL_IDS, ...uniqIds]));
    const pass1 = await probeBatch(page, pass1Ids, OBSERVE_MS);

    // Safety guard: if any control is dead, the environment is throttling us.
    const deadControls = CONTROL_IDS.filter((id) => outcomeToVerdict(pass1.get(id)) === 'dead');
    if (deadControls.length > 0) {
      console.error(
        `\n⚠ AUDIT UNRELIABLE: ${deadControls.length}/${CONTROL_IDS.length} known-good ` +
          `control clip(s) failed to play (${deadControls.join(', ')}). The environment ` +
          `is likely throttling embedded playback. Flagging nothing. Re-run later.`,
      );
      await browser.close();
      return; // exit 0 — never act on an untrusted run
    }

    // Pass 2: re-probe only the non-alive clips to filter transients.
    const nonAlive = uniqIds.filter((id) => outcomeToVerdict(pass1.get(id)) !== 'alive');
    const pass2 = nonAlive.length ? await probeBatch(page, nonAlive, REPROBE_OBSERVE_MS) : new Map<string, string>();

    for (const id of uniqIds) {
      const o1 = pass1.get(id);
      if (o1 === 'ok') { outcomes.set(id, 'ok'); continue; }
      const o2 = pass2.get(id);
      // Alive if EITHER pass played. Dead only if BOTH passes errored. Otherwise unknown.
      if (o2 === 'ok') outcomes.set(id, 'ok');
      else if (outcomeToVerdict(o1) === 'dead' && outcomeToVerdict(o2) === 'dead') outcomes.set(id, `${o1} / ${o2}`);
      else outcomes.set(id, o2 ?? o1 ?? 'unknown');
    }
  } finally {
    await browser.close();
  }

  const results: ClipResult[] = refs.map((ref) => {
    const raw = outcomes.get(ref.clip.videoId);
    const verdict = raw === 'ok' ? 'alive' : outcomeToVerdict(raw?.split(' / ')[0]);
    return { ref, verdict, detail: raw ?? 'unknown' };
  });

  const itemReports = classifyItems(results);
  printReport(itemReports, results);
  saveReport(itemReports);

  const deadItems = itemReports.filter((i) => i.status === 'dead');
  if (deadItems.length > 0) process.exit(1);
}

const invokedDirectly =
  !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  main().catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
  });
}

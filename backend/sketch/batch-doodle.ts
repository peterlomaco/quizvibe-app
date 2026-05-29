// Batch best-of-N doodle-pipeline + review/approve-workflow.
//
// Skalnings-fabriken (Peter 2026-05-29): istället för manuell `--suffix nN` ×4 +
// öga, kör detta N parallella Flux-pass per spelare → temp-varianter i en review-
// mapp + en HTML contact-sheet där du snabbt jämför → godkänn vinnaren med ett
// kommando → registreras via sync-quiz-sketches.
//
// Briefs är källan (doodle-briefs.ts). Fact-checking/brief-författande sker i
// fact-checking-motorn (workflow) och appendas till doodle-briefs.ts; detta script
// tar BARA briefs → bilder → review → approve.
//
// CLI:
//   npm run doodle-batch -- --ids carlos-valderrama,zlatan-ibrahimovic   (specifika)
//   npm run doodle-batch -- --all            (alla briefs som saknar kanonisk asset)
//   npm run doodle-batch -- --variants 3     (antal pass per spelare, default 3)
//   → öppna backend/output/doodle/review/index.html, jämför, sedan:
//   npm run doodle-batch -- --approve <id> <v>   (kopierar review/<id>-v<v>.webp → assets/)
//   → kör sist: npm run sync-quiz-sketches

import * as fs from 'fs';
import * as path from 'path';
import { DOODLE_BRIEFS, DoodleBrief, findBrief } from './doodle-briefs';
import { DoodleInput, renderDoodleWebp } from './doodle';

const ASSETS_DIR = path.join(__dirname, '..', '..', 'assets', 'quiz-sketches');
const REVIEW_DIR = path.join(__dirname, '..', 'output', 'doodle', 'review');
const DEFAULT_VARIANTS = 3;

function inputFromBrief(b: DoodleBrief, model = 'flux'): DoodleInput {
  return {
    id: b.id,
    displayName: b.displayName,
    subject: b.subject,
    concept: b.concept,
    spotColor: b.spotColor,
    spotColorSecondary: b.spotColorSecondary,
    jerseyNumber: b.jerseyNumber,
    numberColor: b.numberColor,
    details: b.details,
    backgroundHint: b.backgroundHint,
    spinArrow: b.spinArrow,
    model,
  };
}

function reviewPath(id: string, v: number): string {
  return path.join(REVIEW_DIR, `${id}-v${v}.webp`);
}

function hasCanonical(id: string): boolean {
  return fs.existsSync(path.join(ASSETS_DIR, `${id}.webp`));
}

// Rendera N varianter PARALLELLT (olika seed → variation) → review-mappen.
async function generateVariants(brief: DoodleBrief, variants: number): Promise<number> {
  fs.mkdirSync(REVIEW_DIR, { recursive: true });
  const input = inputFromBrief(brief);
  console.log(`[${brief.id}] renderar ${variants} varianter parallellt...`);
  const results = await Promise.allSettled(
    Array.from({ length: variants }, () => renderDoodleWebp(input)),
  );
  let ok = 0;
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      fs.writeFileSync(reviewPath(brief.id, i + 1), r.value.webp);
      ok++;
      console.log(`  ✓ v${i + 1} → ${reviewPath(brief.id, i + 1)}`);
    } else {
      console.error(`  ✗ v${i + 1}: ${(r.reason as Error).message}`);
    }
  });
  return ok;
}

// HTML contact-sheet: en rad per spelare med alla varianter + ledtrådar + approve-
// kommandot, så granskningen går snabbt i webbläsaren.
function writeReviewHtml(briefs: DoodleBrief[], variants: number): string {
  const rows = briefs
    .map((b) => {
      const imgs = Array.from({ length: variants }, (_, i) => {
        const file = `${b.id}-v${i + 1}.webp`;
        return fs.existsSync(reviewPath(b.id, i + 1))
          ? `<figure><img src="${file}" width="240"/><figcaption>v${i + 1} · <code>--approve ${b.id} ${i + 1}</code></figcaption></figure>`
          : `<figure class="miss">v${i + 1} (saknas)</figure>`;
      }).join('');
      const c = b.clues;
      return `<section>
  <h2>${b.displayName} <small>(${b.id})</small></h2>
  <p class="clues">Ledtrådar: ${c.category} · ${c.era} · ${c.country} · "${c.recognition}"</p>
  <div class="row">${imgs}</div>
</section>`;
    })
    .join('\n');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Doodle review</title>
<style>
  body{font-family:system-ui,sans-serif;background:#0e1726;color:#e6edf5;margin:24px}
  section{border-bottom:1px solid #233;padding:16px 0}
  h2{margin:0 0 4px} small{color:#8aa} .clues{color:#9ab;margin:0 0 10px}
  .row{display:flex;gap:16px;flex-wrap:wrap}
  figure{margin:0;background:#fff;border-radius:8px;padding:6px;text-align:center}
  figcaption{color:#333;font-size:12px;margin-top:4px}
  code{background:#eef;padding:1px 4px;border-radius:3px}
  .miss{color:#a55;align-self:center;padding:40px}
</style></head><body>
<h1>Doodle best-of-N review</h1>
<p>Jämför varianterna. Godkänn vinnaren: <code>npm run doodle-batch -- --approve &lt;id&gt; &lt;v&gt;</code>, kör sedan <code>npm run sync-quiz-sketches</code>.</p>
${rows}
</body></html>`;
  const out = path.join(REVIEW_DIR, 'index.html');
  fs.writeFileSync(out, html);
  return out;
}

function approve(id: string, v: number): void {
  const src = reviewPath(id, v);
  if (!fs.existsSync(src)) {
    console.error(`Hittar inte ${src}. Kör generering först.`);
    process.exit(1);
  }
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
  const dest = path.join(ASSETS_DIR, `${id}.webp`);
  fs.copyFileSync(src, dest);
  console.log(`✓ godkänd: ${id} v${v} → ${dest}`);
  console.log('  Kör nu: npm run sync-quiz-sketches  (registrerar i appen)');
}

// --- CLI ----------------------------------------------------------------------

interface Args {
  ids?: string[];
  all?: boolean;
  variants: number;
  approve?: { id: string; v: number };
}

function parseArgs(argv: string[]): Args {
  const a: Args = { variants: DEFAULT_VARIANTS };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--ids') a.ids = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
    else if (k === '--all') a.all = true;
    else if (k === '--variants') a.variants = parseInt(argv[++i], 10) || DEFAULT_VARIANTS;
    else if (k === '--approve') a.approve = { id: argv[++i], v: parseInt(argv[++i], 10) || 1 };
  }
  return a;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.approve) {
    approve(args.approve.id, args.approve.v);
    return;
  }

  let briefs: DoodleBrief[];
  if (args.ids) {
    briefs = args.ids.map((id) => {
      const b = findBrief(id);
      if (!b) {
        console.error(`Ingen brief för "${id}" i doodle-briefs.ts.`);
        process.exit(1);
      }
      return b;
    });
  } else if (args.all) {
    briefs = DOODLE_BRIEFS.filter((b) => !hasCanonical(b.id));
    console.log(`--all: ${briefs.length} briefs utan kanonisk asset.`);
  } else {
    console.error('Usage:');
    console.error('  --ids a,b,c            generera varianter för specifika briefs');
    console.error('  --all                  alla briefs som saknar kanonisk asset');
    console.error('  --variants N           pass per spelare (default 3)');
    console.error('  --approve <id> <v>     godkänn variant → assets/');
    process.exit(1);
  }

  for (const brief of briefs) {
    try {
      await generateVariants(brief, args.variants);
    } catch (e) {
      console.error(`  ✗ ${brief.id}: ${(e as Error).message}`);
    }
  }
  const html = writeReviewHtml(briefs, args.variants);
  console.log(`\nReview-sheet: ${html}`);
  console.log('Öppna den, jämför, och godkänn: npm run doodle-batch -- --approve <id> <v>');
}

main().catch((e) => {
  console.error(`ERROR: ${(e as Error).message}`);
  process.exit(1);
});

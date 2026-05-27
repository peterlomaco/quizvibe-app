// AI-tecknad porträtt-pipeline för QuizVibe.
//
// Strategi: image-to-image via fal.ai Flux.1 [dev] för 100% porträtt-likhet.
//   - Input: lokal bild ELLER URL (referensfoto på kändisen)
//   - Process: fal.ai applicerar blyertsprompt med strength=0.7 (default)
//     → originalpixlar helt dölj:s under blyertstextur, men ansiktet bevaras
//   - Output: assets/quiz-sketches/<id>.webp (re-encoded via sharp)
//
// Säkerhets-prompt enligt spec: ingen team-/branding-/karaktärs-referenser.
// Default strength=0.7 = bra balans mellan pixel-täckning och porträtt-likhet.
// Justera per item via --strength om resultat behöver mer/mindre artistisk
// frihet (lägre = närmare original, högre = mer abstrakt).
//
// CLI:
//   npm run sketch-generate -- --ref <path-or-url> --id <celebrity-id> --era "<era-text>" --category <athlete|artist|actor|band> [--strength 0.7]
//   npm run sketch-generate -- --batch <path-to-tsv>     (batch-mode)
//
// Batch TSV format (tab-separated, no header):
//   id\tref_path_or_url\tera\tcategory
//
// Env: FAL_KEY (krävs) — sätt i .env.local eller export.

import { fal } from '@fal-ai/client';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const OUTPUT_DIR = path.join(__dirname, '..', 'output', 'sketches');
const ASSETS_DIR = path.join(__dirname, '..', '..', 'assets', 'quiz-sketches');

// Flux Pro text-to-image: bättre kändis-recognition än Flux dev, plus full
// prompt-styrning av stil (utan ControlNet-kollisionen som tvingar foto-look).
// Vi lämnar referensbild-uppladdningen kvar men använder INTE den i prompten —
// istället förlitar vi oss på Flux Pro's egen kunskap om kändisar via deras
// namn. ($0.05 styck istället för $0.025.)
const FAL_ENDPOINT = 'fal-ai/flux-pro/v1.1';
const DEFAULT_STRENGTH = 0.92; // (oused med text-to-image — kvar för bakåt-kompat)

type Category = 'athlete' | 'artist' | 'actor' | 'band';

interface SketchInput {
  id: string;
  era: string;
  category: Category;
  ref: string; // local path or URL
  strength?: number;
  displayName?: string; // optional; om saknas använder vi id
}

function buildPrompt(input: SketchInput): string {
  const subjectGuide: Record<Category, string> = {
    athlete:
      'Wearing a plain blank generic shirt with NO team logos, NO club emblems, NO sponsor patches, NO numbers.',
    artist:
      'Wearing plain era-appropriate clothing with NO brand logos or merch text.',
    actor:
      'Themselves in that era, NOT as any fictional character or copyrighted movie costume.',
    band:
      'Wearing plain era-appropriate clothing with NO commercial branding.',
  };

  const displayName = input.displayName ?? input.id;

  // Stage 1-prompt: ren FOTOREALISTISK porträtt. Vi vill att Flux Pro gör
  // bästa möjliga foto av personen (för likhet). Stage 2 (sharp filter)
  // konverterar sedan till pencil-look deterministisk-matematiskt — så
  // prompt-side behöver INTE ber om pencil-stil alls.
  return [
    `A clean, well-lit photographic portrait of ${displayName} as a young person during ${input.era}.`,
    `Plain white studio background, professional headshot lighting, sharp focus on face.`,
    `Capture exact facial features, expression, and recognizable identity.`,
    subjectGuide[input.category],
    `Absolutely NO sports team logos, NO club emblems, NO commercial branding, NO sponsor patches, NO movie titles, NO character costumes, NO copyrighted symbols, NO text, NO words.`,
  ].join(' ');
}

// Stage 2: klassisk Photoshop "Pencil Sketch"-filter implementerad via sharp.
// Algoritm: greyscale → invertera + gaussian blur → colour-dodge-blend mot
// originalt greyscale. Detta är den standard-formel som alla online pencil-
// sketch-konverter använder (Pillow, OpenCV, Photoshop).
//
// Plus: radial vignette-mask fadar bakgrund/kroppskanter till vitt så fokus
// hamnar på ansiktet + bröstet (per Peter 2026-05-27 — undvik "kopierad
// svart-vit"-känsla från full-frame-detalj).
async function applyPencilFilter(inputBuffer: Buffer): Promise<Buffer> {
  const meta = await sharp(inputBuffer).metadata();
  const width = meta.width ?? 1024;
  const height = meta.height ?? 1024;

  // Steg 1: greyscale-version (basbild)
  const grey = await sharp(inputBuffer)
    .greyscale()
    .normalise()
    .resize(width, height)
    .toFormat('png')
    .toBuffer();

  // Steg 2: invertera greyscale + applicera gaussian blur (sigma 20)
  const blurredInverted = await sharp(grey)
    .negate()
    .blur(20)
    .toFormat('png')
    .toBuffer();

  // Steg 3: colour-dodge-blend grey + blurredInverted
  const sketched = await sharp(grey)
    .composite([{ input: blurredInverted, blend: 'colour-dodge' }])
    .toBuffer();

  // Steg 4: light contrast-boost
  const contrasted = await sharp(sketched)
    .linear(1.15, -10)
    .toBuffer();

  // Steg 5: radial vignette — vit overlay som fadar från transparent center
  // (ansiktet bevaras) till opak vit kanterna (bakgrund + axlar tvättas bort).
  // cx=50%, cy=42% = lite ovanför geometric center (porträtt-ansikten sitter
  // typiskt i övre 60% av frame). r=42% inner / 75% outer = stark vinjett.
  const vignetteSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <radialGradient id="vg" cx="50%" cy="42%" r="62%">
        <stop offset="0%" stop-color="white" stop-opacity="0"/>
        <stop offset="42%" stop-color="white" stop-opacity="0"/>
        <stop offset="75%" stop-color="white" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="white" stop-opacity="1"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#vg)"/>
  </svg>`;
  const vignetteBuffer = await sharp(Buffer.from(vignetteSvg))
    .resize(width, height)
    .png()
    .toBuffer();

  const final = await sharp(contrasted)
    .composite([{ input: vignetteBuffer, blend: 'over' }])
    .toBuffer();

  return final;
}


const NEGATIVE_PROMPT = [
  'color',
  'colors',
  'colorful',
  'team logo',
  'club emblem',
  'sponsor patch',
  'brand logo',
  'commercial branding',
  'movie poster',
  'character costume',
  'fictional uniform',
  'text watermark',
  'photo realistic skin',
].join(', ');

async function refToUrl(ref: string): Promise<string> {
  // Alltid ladda upp till fal.ai storage (Wikimedia, Imgur m.fl. blockar
  // ofta fal.ai:s ner-laddningsbot pga User-Agent / hotlink-skydd, vilket
  // ger 422 file_download_error även om URL:en är publik).
  let buffer: Buffer;
  let filename: string;
  let mimeType: string;

  if (/^https?:\/\//i.test(ref)) {
    // External URL — fetch lokalt med vanlig browser-User-Agent
    const res = await fetch(ref, {
      headers: {
        'User-Agent': 'QuizVibe/1.0 (quizvibe.se; admin@quizvibe.se) ImageFetcher/1.0',
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to download reference image from URL: ${res.status} ${res.statusText}`);
    }
    buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get('content-type') ?? 'image/jpeg';
    mimeType = contentType.split(';')[0].trim();
    // Härled filename från URL eller content-type
    const urlPath = new URL(ref).pathname;
    filename = path.basename(decodeURIComponent(urlPath)) || `ref.${mimeType.split('/')[1] || 'jpg'}`;
  } else {
    // Lokal fil
    if (!fs.existsSync(ref)) {
      throw new Error(`Reference image not found: ${ref}`);
    }
    buffer = fs.readFileSync(ref);
    const ext = path.extname(ref).slice(1).toLowerCase() || 'jpg';
    mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    filename = path.basename(ref);
  }

  const blob = new Blob([buffer], { type: mimeType });
  const file = new File([blob], filename, { type: mimeType });
  const uploadedUrl = await fal.storage.upload(file);
  return uploadedUrl;
}

// Pure image-processing-pipeline (ingen AI). Vi laddar referensfotot, applicerar
// sharp colour-dodge pencil-filter, sparar resultat. Det är ett "rit-verktyg"
// som garanterat bevarar likheten exakt (samma face som input). Inga API-cost.
// Flux/buildPrompt-funktionen är behållen för backup-användning men anropas
// inte i nuvarande generateSketch-flöde.
export async function generateSketch(
  input: SketchInput,
): Promise<{ id: string; outputPath: string; assetsPath: string; falLogs: string[] }> {
  void buildPrompt; // not used in pure-filter pipeline
  const falLogs: string[] = [];

  console.log(`[${input.id}] Loading reference photo...`);

  // Ladda referens-fotot (lokal eller URL)
  let photoBuffer: Buffer;
  if (/^https?:\/\//i.test(input.ref)) {
    const res = await fetch(input.ref, {
      headers: {
        'User-Agent': 'QuizVibe/1.0 (quizvibe.se; admin@quizvibe.se) ImageFetcher/1.0',
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to download reference image: ${res.status} ${res.statusText}`);
    }
    photoBuffer = Buffer.from(await res.arrayBuffer());
  } else {
    if (!fs.existsSync(input.ref)) {
      throw new Error(`Reference image not found: ${input.ref}`);
    }
    photoBuffer = fs.readFileSync(input.ref);
  }
  // Applicera pencil-sketch-filter på referensfotot DIREKT.
  // Detta är rent rit-verktyg (sharp colour-dodge-pipeline) — ingen AI-anrop,
  // ingen fal.ai-kostnad, ingen API-token. 100% bevarad porträtt-likhet
  // eftersom det är samma foto + matematisk filter.
  console.log(`[${input.id}] Applying pencil filter...`);
  const sketchBuffer = await applyPencilFilter(photoBuffer);

  // Re-encode till webp, 800×800 max för bundle-storlek
  const webp = await sharp(sketchBuffer)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 88 })
    .toBuffer();

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
  const outputPath = path.join(OUTPUT_DIR, `${input.id}.webp`);
  const assetsPath = path.join(ASSETS_DIR, `${input.id}.webp`);
  fs.writeFileSync(outputPath, webp);
  fs.writeFileSync(assetsPath, webp);

  return { id: input.id, outputPath, assetsPath, falLogs };
}

function parseArgs(argv: string[]): Partial<SketchInput> & { batch?: string } {
  const args: Partial<SketchInput> & { batch?: string } = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--ref') args.ref = argv[++i];
    else if (a === '--id') args.id = argv[++i];
    else if (a === '--era') args.era = argv[++i];
    else if (a === '--category') args.category = argv[++i] as Category;
    else if (a === '--strength') args.strength = parseFloat(argv[++i]);
    else if (a === '--displayName') args.displayName = argv[++i];
    else if (a === '--batch') args.batch = argv[++i];
  }
  return args;
}

async function runBatch(tsvPath: string): Promise<void> {
  const lines = fs
    .readFileSync(tsvPath, 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.startsWith('#'));
  console.log(`Batch: ${lines.length} items from ${tsvPath}`);

  const results: Array<{ id: string; status: 'ok' | 'err'; msg: string }> = [];
  for (const line of lines) {
    const [id, ref, era, category, strengthStr] = line.split('\t');
    if (!id || !ref || !era || !category) {
      results.push({ id: id ?? '<empty>', status: 'err', msg: 'malformed row' });
      continue;
    }
    try {
      const strength = strengthStr ? parseFloat(strengthStr) : undefined;
      const r = await generateSketch({ id, ref, era, category: category as Category, strength });
      results.push({ id, status: 'ok', msg: r.assetsPath });
      console.log(`  ✓ ${id} → ${r.assetsPath}`);
    } catch (e) {
      results.push({ id, status: 'err', msg: (e as Error).message });
      console.error(`  ✗ ${id}: ${(e as Error).message}`);
    }
    // Liten paus mellan items för att inte tryck mot fal.ai-quota
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\n=== Batch summary ===`);
  console.log(`Success: ${results.filter((r) => r.status === 'ok').length}`);
  console.log(`Errors:  ${results.filter((r) => r.status === 'err').length}`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.batch) {
    await runBatch(args.batch);
    return;
  }

  if (!args.id || !args.ref || !args.era || !args.category) {
    console.error('Usage:');
    console.error('  Single: --ref <path|url> --id <id> --era "<era>" --category <athlete|artist|actor|band> [--strength 0.7] [--displayName "Name"]');
    console.error('  Batch:  --batch <path-to-tsv>');
    console.error('');
    console.error('TSV format (tab-separated):  id  ref  era  category  [strength]');
    process.exit(1);
  }

  const r = await generateSketch(args as SketchInput);
  console.log(`\n✓ Generated ${r.id}`);
  console.log(`  output:  ${r.outputPath}`);
  console.log(`  assets:  ${r.assetsPath}`);
}

main().catch((e) => {
  console.error(`ERROR: ${(e as Error).message}`);
  process.exit(1);
});

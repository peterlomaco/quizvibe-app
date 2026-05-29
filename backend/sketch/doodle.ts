// "Signature Doodle"-fabrik — fal.ai TEXT-till-bild (inget källfoto).
//
// Skiljer sig från generate.ts (som är foto-baserad img2img/canny → äkta likhet):
// HÄR matar vi ALDRIG in ett foto. Vi genererar en ren stiliserad doodle ur en
// text-prompt → 100 % fri från foto-upphovsrätt. Stilen (spec 2026-05-29):
// minimalist, ren svart-vit line-art / vektor-doodle, solida svarta streck på
// HELT VIT botten. Inga färger, gradienter eller skuggor.
//
// "Just mata in ett namn" → motorn slår upp briefen i doodle-briefs.ts (Creative
// Director-författad ikonisk pose + 4 ledtrådar), bygger Flux-prompten, hämtar
// bilden, städar till ren svart-på-vit webp och sparar i assets/quiz-sketches/.
// Ledtrådarna skrivs som sidecar-JSON (backend/output/doodle/<id>.clues.json)
// så frontend/katalogen kan plocka upp dem.
//
// CLI:
//   npm run doodle-generate -- --id carlos-valderrama
//   npm run doodle-generate -- --id <id> --model schnell        (snabbare/billigare)
//   npm run doodle-generate -- --id <id> --model sdxl
//   npm run doodle-generate -- --all                            (hela briefs-listan)
//   ad-hoc (utan brief): --name "X" --concept "..." --subject athlete
//
// Env: FAL_KEY i backend/.env.local (krävs).

import { fal } from '@fal-ai/client';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { DOODLE_BRIEFS, DoodleBrief, DoodleSubject, findBrief } from './doodle-briefs';

const OUTPUT_DIR = path.join(__dirname, '..', 'output', 'doodle');
const ASSETS_DIR = path.join(__dirname, '..', '..', 'assets', 'quiz-sketches');
const OUTPUT_MAX = 800;

// Modell-alias → fal text-to-image-endpoint. Flux dev = bäst rena linjer/
// komposition (default). schnell = snabbare/billigare (färre steg). sdxl =
// alternativ motor. Bytbart via --model.
const MODEL_ENDPOINTS: Record<string, string> = {
  flux: 'fal-ai/flux/dev',
  schnell: 'fal-ai/flux/schnell',
  sdxl: 'fal-ai/fast-sdxl',
};
const DEFAULT_MODEL = 'flux';
// Canny ControlNet (Flux) — för att FÄRGLÄGGA en befintlig line-art: control-
// bilden (t.ex. edges-sketchen) låser linjestrukturen/likheten, prompten lägger
// platt spot-color längs den. Används via `--control <path>`.
const FAL_CANNY_ENDPOINT = 'fal-ai/flux-control-lora-canny';
const DEFAULT_CONTROL_STRENGTH = 0.9; // högt → trogen källans linjer (bevarad likhet)

// SPOT-COLOR-STIL (2026-05-29): strikt svartvitt tappade signaturerna som ÄR
// svaret. Vi tillåter NU selektiv platt FÄRG på namngivna element + tröjnummer/
// utrustning — men allt annat förblir svart line-art.
//
// CREATIVE-DIRECTOR-REGEL — vilken färg prioriteras per profil (max EN dominant):
//   1) PERSONLIG TRADEMARK (hår/plagg unikt för personen) — t.ex. Valderramas
//      gula afro, Freddies gula jacka. Föredras: avslöjar inte "land"-ledtråden.
//   2) IKONISK LAG-/KIT-FÄRG när kit:et ÄR signaturen — Maradonas Argentina-
//      ränder, Brasiliens gult. Accepteras även om det överlappar land-ledtråden.
//   3) SIGNATURACCESSOAR — hatt/glasögon/instrument-färg.
//   Färg-krock-regel: om trademark-färgen krockar med den verkliga kit-färgen
//   (gul afro mot Colombias gula tröja), NEUTRALISERA det sekundära elementet
//   (vit tröja) så det ENA spot-elementet dominerar. Musiker/skådespelare (ingen
//   kit) → signaturplagg/instrument/hår. Aldrig fler än 2 färger (annars blir det
//   en full-färgs-cartoon och tappar den premium minimalist-känslan).
// Premium art-direction-closer (Peters blueprint, 2026-05-29): proffstermer som
// tvingar Flux mot en polerad VEKTOR-ILLUSTRATION istället för barnsligt klotter.
// + compliance (inga loggor/captions/watermark — skyddar mot svar-läckage).
const STYLE_CLOSER =
  'Highly distinct silhouette, action pose with perfect geometric symmetry. 8k resolution. ' +
  'Absolutely no hand-drawn slop, no gradients, no messy pencil textures. ' +
  // Strikt logo-ban (Peter 2026-05-29) — fal smyger annars in swoosh/ränder.
  'STRICTLY NO logos of any kind: no manufacturer logo, no Nike swoosh, no Adidas three stripes, ' +
  'no Puma logo, no sponsor wordmarks or text, no club or national crest or emblem, no captions, no watermark, no signature.';

// Klädsel-/motiv-guide per subject. Strikt logo-fritt (Peter 2026-05-29).
const SUBJECT_GUIDE: Record<DoodleSubject, string> = {
  athlete:
    'wearing a COMPLETELY PLAIN, BLANK athletic kit of solid color — absolutely NO manufacturer logo, NO swoosh, NO stripes, NO sponsor text and NO team crest anywhere (only a plain jersey number is allowed)',
  artist:
    'in plain era-appropriate stage clothing of solid color with NO brand logos, NO wordmarks and NO printed graphics',
  band: 'all in plain era-appropriate clothing of solid colors with NO brand logos or wordmarks',
  actor:
    'depicted as themselves in that era, NOT as any fictional character or copyrighted movie costume; plain clothing with NO brand logos',
};

export interface DoodleInput {
  id: string;
  displayName: string;
  subject: DoodleSubject;
  concept: string;
  spotColor: string;
  spotColorSecondary?: string;
  jerseyNumber?: string;
  numberColor?: string;
  details: string;
  /** Subtila bakgrunds-ledtrådar (t.ex. skådespelare). Tomt → ren vit botten. */
  backgroundHint?: string;
  /** Komponera in en deterministisk horisontell snurr-pil (piruett-indikator). */
  spinArrow?: boolean;
  model: string;
  steps?: number;
  /** Sökväg till en line-art att FÄRGLÄGGA (ControlNet recolor). Sätts → canny-väg. */
  controlImage?: string;
  controlStrength?: number;
}

// Bygger prompten enligt Peters premium-blueprint:
//   "A professional, clean-cut minimalist vector illustration of [DESCRIPTION].
//    High-end graphic design style. The body is formed by crisp, solid black ink
//    lines on a pure white background. Features a strategic 'Spot Color': [...].
//    The jersey features a highly distinct, perfectly centered black number [N].
//    [övriga detaljer]. Crisp lines, clear geometric symmetry, corporate game art
//    asset, 8k resolution. Absolutely no hand-drawn slop, no gradients..."
// Nummer-meningen + detaljer-meningen slottas bara in när de finns.
export function buildDoodlePrompt(input: DoodleInput): string {
  const spot = input.spotColorSecondary
    ? `${input.spotColor}; additionally, ${input.spotColorSecondary}`
    : input.spotColor;
  // Bakgrund: ren vit som default; för skådespelare m.fl. kan subtila bakgrunds-
  // element ge ledtrådar (Peter 2026-05-29) — håll dem SMÅ/sekundära så de inte
  // skräpar ner kompositionen eller avslöjar svaret för lätt.
  const bg =
    input.backgroundHint && input.backgroundHint.trim()
      ? `Mostly clean white background, but subtly include small, faint background elements as secondary hints: ${input.backgroundHint}.`
      : 'Pure flat white background, single subject, no scenery.';
  const parts = [
    `A professional, high-end minimalist vector illustration of ${input.displayName}, ${input.concept}.`,
    'Premium graphic design style, corporate game art asset. Crisp, solid black ink lines on a pure white background.',
    // KÄRN-DIREKTIV (Peter 2026-05-29): VISA ALDRIG ANSIKTET — ett AI-ansikte är
    // inte personen och blir vilseledande. Bakifrån/bortvänt huvud; känneteckna
    // ENBART via siluett/frisyr/attribut.
    'CRITICAL: do NOT show the face at all — the figure is seen from behind or with the head turned fully away so no facial features are visible. The character is recognizable ONLY through silhouette, hairstyle, posture and signature attributes, never through the face.',
    `Spot Color: ${spot}.`,
  ];
  if (input.jerseyNumber && input.jerseyNumber.trim()) {
    const col = input.numberColor ?? 'black';
    parts.push(
      `The jersey features a highly distinct, perfectly centered ${col} number ${input.jerseyNumber}.`,
    );
  }
  if (input.details && input.details.trim()) {
    parts.push(`${input.details}.`);
  }
  parts.push(bg);
  parts.push(SUBJECT_GUIDE[input.subject] + '.');
  parts.push(STYLE_CLOSER);
  return parts.join(' ');
}

function extractFalImageUrl(result: unknown): string {
  const url = (result as { data?: { images?: { url: string }[] } }).data?.images?.[0]?.url;
  if (!url) throw new Error('fal.ai returnerade ingen bild.');
  return url;
}

async function downloadImage(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'QuizVibe/1.0 (quizvibe.se) DoodleFetcher/1.0' },
  });
  if (!res.ok) throw new Error(`Kunde inte hämta bild: ${res.status} ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
}

// --- ControlNet-färgläggning (recolor av befintlig line-art) -------------------

// Ladda upp en buffer till fal-storage (control-bilder kan inte hotlinkas).
async function uploadToFal(buffer: Buffer, filename: string): Promise<string> {
  const blob = new Blob([new Uint8Array(buffer)], { type: 'image/png' });
  const file = new File([blob], filename, { type: 'image/png' });
  return fal.storage.upload(file);
}

// Normalisera control-bilden (Flux-vänliga dims, multiplar av 16) + ladda upp.
async function prepControl(
  controlPath: string,
  id: string,
): Promise<{ url: string; w: number; h: number }> {
  const buf = fs.readFileSync(controlPath);
  const pre = await sharp(buf)
    .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
    .flatten({ background: '#FFFFFF' })
    .toBuffer();
  const m = await sharp(pre).metadata();
  const w = Math.max(256, Math.floor((m.width ?? 768) / 16) * 16);
  const h = Math.max(256, Math.floor((m.height ?? 768) / 16) * 16);
  const normalized = await sharp(pre).resize(w, h, { fit: 'fill' }).png().toBuffer();
  const url = await uploadToFal(normalized, `${id}-ctrl.png`);
  return { url, w, h };
}

// Recolor-prompt: pose-agnostisk (control-bilden ger pose/komposition) — bara
// spot-color + detaljer + premium-stil. "keep the exact same composition".
function buildColorizePrompt(input: DoodleInput): string {
  const bits = [input.spotColor];
  if (input.spotColorSecondary) bits.push(input.spotColorSecondary);
  if (input.jerseyNumber && input.jerseyNumber.trim()) {
    bits.push(`the jersey number ${input.jerseyNumber} is ${input.numberColor ?? 'black'}`);
  }
  if (input.details && input.details.trim()) bits.push(input.details);
  return [
    `A professional, clean-cut minimalist vector illustration of ${input.displayName}, a recolor of this existing black line drawing.`,
    'Keep the EXACT same composition, pose, face and line structure — only add color.',
    `Apply FLAT, solid spot color: ${bits.join('; ')}.`,
    'Everything else stays clean black line-art on a pure white background.',
    STYLE_CLOSER,
  ].join(' ');
}

// Städa fal-output → ren spot-color-doodle på vit botten. BEVARAR FÄRG (ingen
// greyscale — det skulle radera spot-färgen!): platta mot vit bakgrund + lätt
// kontrast (vit botten verkligt vit, svarta linjer solida) + lätt mättnads-bump
// så spot-färgen poppar.
async function toCleanDoodle(drawn: Buffer): Promise<Buffer> {
  return sharp(drawn)
    .flatten({ background: '#FFFFFF' })
    .linear(1.12, -12)
    .modulate({ saturation: 1.15 })
    .toFormat('png')
    .toBuffer();
}

// Deterministisk HORISONTELL snurr-pil (Peter 2026-05-29): en platt ellips i
// perspektiv runt nedre kroppen + pilspets → läses som piruett/snurr (INTE volt).
// Flux klarar inte abstrakta grafiska pilar tillförlitligt → vi ritar den själva.
// Geometrin är empiriskt tunad (andelar av bildens bredd/höjd).
const SPIN_ARROW_COLOR = '#6B7280'; // neutral grå — konkurrerar ej med kit-färgen
function buildSpinArrowSvg(w: number, h: number): Buffer {
  const cx = w * 0.5;
  const cy = h * 0.7; // runt nedre kroppen/benen
  const rx = w * 0.31;
  const ry = h * 0.08; // flat → horisontell ellips i perspektiv
  const sw = Math.max(3, Math.round(w * 0.007));
  const rad = (d: number) => (d * Math.PI) / 180;
  // Pilspets vid ~25° (höger sida), pekande i medurs tangentriktning.
  const aDeg = 25;
  const px = cx + rx * Math.cos(rad(aDeg));
  const py = cy + ry * Math.sin(rad(aDeg));
  let tx = -rx * Math.sin(rad(aDeg));
  let ty = ry * Math.cos(rad(aDeg));
  const tl = Math.hypot(tx, ty) || 1;
  tx /= tl;
  ty /= tl;
  const nx = -ty;
  const ny = tx;
  const ah = w * 0.045; // pilspets-storlek
  const tip = [px + tx * ah * 0.6, py + ty * ah * 0.6];
  const b1 = [px - tx * ah * 0.4 + nx * ah * 0.55, py - ty * ah * 0.4 + ny * ah * 0.55];
  const b2 = [px - tx * ah * 0.4 - nx * ah * 0.55, py - ty * ah * 0.4 - ny * ah * 0.55];
  const f = (n: number) => n.toFixed(1);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="none" stroke="${SPIN_ARROW_COLOR}" stroke-width="${sw}" stroke-opacity="0.9"/>
    <polygon points="${f(tip[0])},${f(tip[1])} ${f(b1[0])},${f(b1[1])} ${f(b2[0])},${f(b2[1])}" fill="${SPIN_ARROW_COLOR}" fill-opacity="0.9"/>
  </svg>`;
  return Buffer.from(svg);
}

// Komponera in snurr-pilen i en (redan ren) doodle-buffer.
async function compositeSpinArrow(buffer: Buffer): Promise<Buffer> {
  const meta = await sharp(buffer).metadata();
  const w = meta.width ?? 1024;
  const h = meta.height ?? 1024;
  const svg = buildSpinArrowSvg(w, h);
  return sharp(buffer)
    .composite([{ input: svg, blend: 'over' }])
    .toFormat('png')
    .toBuffer();
}

// Render-ONLY: kör fal → städa → ev. snurr-pil → webp-buffer. INGA fs-skrivningar.
// Återanvänds av både generateDoodle (skriver assets) och batch-pipelinen (temp).
export async function renderDoodleWebp(
  input: DoodleInput,
): Promise<{ webp: Buffer; prompt: string }> {
  if (!process.env.FAL_KEY) {
    throw new Error('FAL_KEY saknas — sätt i backend/.env.local.');
  }
  // Model-medvetna defaults: Flux dev gillar LÅG guidance (3.5) + fler steps för
  // rena linjer; SDXL behöver HÖGRE guidance (~7.5); schnell är få-stegs by design.
  const isSdxl = input.model === 'sdxl';
  const steps =
    input.steps ?? (input.model === 'schnell' ? 4 : isSdxl ? 35 : 42);
  const guidance = isSdxl ? 7.5 : 3.5;

  let result: unknown;
  let promptUsed = '';
  if (input.controlImage) {
    // FÄRGLÄGGNINGS-VÄG: canny ControlNet recolor av en befintlig line-art.
    const strength = input.controlStrength ?? DEFAULT_CONTROL_STRENGTH;
    const prompt = buildColorizePrompt(input);
    promptUsed = prompt;
    console.log(`[${input.id}] fal.ai canny recolor (${FAL_CANNY_ENDPOINT}, strength=${strength})...`);
    console.log(`  prompt: ${prompt}`);
    const { url, w, h } = await prepControl(input.controlImage, input.id);
    result = await fal.subscribe(FAL_CANNY_ENDPOINT, {
      input: {
        prompt,
        control_lora_image_url: url,
        control_lora_strength: strength,
        num_inference_steps: steps,
        guidance_scale: guidance,
        image_size: { width: w, height: h },
        output_format: 'png',
        enable_safety_checker: false,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          update.logs?.forEach((l) => console.log(`    ${l.message}`));
        }
      },
    });
  } else {
    // TEXT-TILL-BILD-VÄG (default): ren doodle ur prompt.
    const endpoint = MODEL_ENDPOINTS[input.model] ?? MODEL_ENDPOINTS[DEFAULT_MODEL];
    const prompt = buildDoodlePrompt(input);
    promptUsed = prompt;
    console.log(`[${input.id}] fal.ai text-to-image (${endpoint})...`);
    console.log(`  prompt: ${prompt}`);
    console.log(`  (steps=${steps}, guidance=${guidance})`);
    result = await fal.subscribe(endpoint, {
      input: {
        prompt,
        image_size: 'square_hd', // 1024×1024 — gott om yta för rena linjer
        num_inference_steps: steps,
        guidance_scale: guidance,
        num_images: 1,
        enable_safety_checker: false,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          update.logs?.forEach((l) => console.log(`    ${l.message}`));
        }
      },
    });
  }

  const drawn = await downloadImage(extractFalImageUrl(result));
  let cleaned = await toCleanDoodle(drawn);
  if (input.spinArrow) cleaned = await compositeSpinArrow(cleaned);
  const webp = await sharp(cleaned)
    .resize(OUTPUT_MAX, OUTPUT_MAX, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 88 })
    .toBuffer();

  return { webp, prompt: promptUsed };
}

export async function generateDoodle(
  input: DoodleInput,
): Promise<{ id: string; assetsPath: string; outputPath: string; prompt: string }> {
  const { webp, prompt } = await renderDoodleWebp(input);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
  const outputPath = path.join(OUTPUT_DIR, `${input.id}.webp`);
  const assetsPath = path.join(ASSETS_DIR, `${input.id}.webp`);
  fs.writeFileSync(outputPath, webp);
  fs.writeFileSync(assetsPath, webp);
  return { id: input.id, assetsPath, outputPath, prompt };
}

// Skriv ledtrådarna som sidecar-JSON så de kan plockas upp av frontend/katalogen
// (separat från bilden — ledtrådar är spel-metadata, inte en del av motivet).
function writeCluesSidecar(brief: DoodleBrief): string {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const p = path.join(OUTPUT_DIR, `${brief.id}.clues.json`);
  fs.writeFileSync(
    p,
    JSON.stringify(
      { id: brief.id, displayName: brief.displayName, clues: brief.clues },
      null,
      2,
    ),
  );
  return p;
}

// --- CLI ----------------------------------------------------------------------

interface Args {
  id?: string;
  all?: boolean;
  model: string;
  name?: string;
  concept?: string;
  subject?: DoodleSubject;
  spotColor?: string;
  jerseyNumber?: string;
  details?: string;
  steps?: number;
  suffix?: string;
  control?: string;
  controlStrength?: number;
  overlaySpin?: string;
}

function parseArgs(argv: string[]): Args {
  const a: Args = { model: DEFAULT_MODEL };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--id') a.id = argv[++i];
    else if (k === '--all') a.all = true;
    else if (k === '--model') a.model = argv[++i];
    else if (k === '--name') a.name = argv[++i];
    else if (k === '--concept') a.concept = argv[++i];
    else if (k === '--subject') a.subject = argv[++i] as DoodleSubject;
    else if (k === '--spot-color') a.spotColor = argv[++i];
    else if (k === '--number') a.jerseyNumber = argv[++i];
    else if (k === '--details') a.details = argv[++i];
    else if (k === '--steps') a.steps = parseInt(argv[++i], 10) || undefined;
    else if (k === '--suffix') a.suffix = argv[++i];
    else if (k === '--control') a.control = argv[++i];
    else if (k === '--control-strength') a.controlStrength = parseFloat(argv[++i]) || undefined;
    else if (k === '--overlay-spin') a.overlaySpin = argv[++i];
  }
  return a;
}

// suffix → output-filnamn blir `<id>-<suffix>.webp` (för jämförelse-varianter utan
// att skriva över den kanoniska asseten). steps → num_inference_steps-override.
async function runOne(
  brief: DoodleBrief,
  model: string,
  opts: { steps?: number; suffix?: string; control?: string; controlStrength?: number } = {},
): Promise<void> {
  const outId = opts.suffix ? `${brief.id}-${opts.suffix}` : brief.id;
  const r = await generateDoodle({
    id: outId,
    displayName: brief.displayName,
    subject: brief.subject,
    concept: brief.concept,
    spotColor: brief.spotColor,
    spotColorSecondary: brief.spotColorSecondary,
    jerseyNumber: brief.jerseyNumber,
    numberColor: brief.numberColor,
    details: brief.details,
    backgroundHint: brief.backgroundHint,
    spinArrow: brief.spinArrow,
    model,
    steps: opts.steps,
    controlImage: opts.control,
    controlStrength: opts.controlStrength,
  });
  // Sidecar skrivs bara för kanoniska körningar (ingen suffix) → en clues-fil per id.
  if (!opts.suffix) {
    const sidecar = writeCluesSidecar(brief);
    console.log(`    clues  → ${sidecar}`);
  }
  console.log(`  ✓ ${outId} → ${r.assetsPath}`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  // Lägg snurr-pilen på en BEFINTLIG asset (ingen fal-körning) — behåll figuren.
  if (args.overlaySpin) {
    const buf = fs.readFileSync(args.overlaySpin);
    const withArrow = await compositeSpinArrow(buf);
    const out = await sharp(withArrow)
      .resize(OUTPUT_MAX, OUTPUT_MAX, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 88 })
      .toBuffer();
    fs.writeFileSync(args.overlaySpin, out);
    console.log(`✓ snurr-pil pålagd → ${args.overlaySpin}`);
    return;
  }

  if (args.all) {
    console.log(`Genererar ${DOODLE_BRIEFS.length} doodles (model=${args.model})...`);
    for (const brief of DOODLE_BRIEFS) {
      try {
        await runOne(brief, args.model, { steps: args.steps });
      } catch (e) {
        console.error(`  ✗ ${brief.id}: ${(e as Error).message}`);
      }
      await new Promise((r) => setTimeout(r, 1200));
    }
    console.log('\nKör `npm run sync-quiz-sketches` för att registrera nya assets i appen.');
    return;
  }

  // Ad-hoc (utan brief) — kräver --name + --concept + --subject + --spot-color.
  if (args.name && args.concept && args.subject) {
    const id = args.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const r = await generateDoodle({
      id,
      displayName: args.name,
      subject: args.subject,
      concept: args.concept,
      spotColor:
        args.spotColor ??
        'the single most iconic feature is colored in one solid, vibrant color; everything else is black line-art',
      jerseyNumber: args.jerseyNumber,
      details: args.details ?? '',
      model: args.model,
      steps: args.steps,
    });
    console.log(`\n✓ ${r.id} → ${r.assetsPath}`);
    console.log('  (ingen brief → inga ledtrådar genererade; lägg till i doodle-briefs.ts för fullt item)');
    return;
  }

  if (!args.id) {
    console.error('Usage:');
    console.error('  --id <brief-id>                 (slår upp i doodle-briefs.ts)');
    console.error('  --all                           (hela briefs-listan)');
    console.error('  --model flux|schnell|sdxl       (default flux)');
    console.error('  ad-hoc: --name "X" --concept "..." --subject athlete|artist|band|actor');
    console.error('          [--spot-color "..."] [--number "10"] [--details "..."]');
    console.error('  tuning: [--steps N] [--suffix <label>]  (suffix → <id>-<label>.webp, skriver ej över kanonisk)');
    process.exit(1);
  }

  const brief = findBrief(args.id);
  if (!brief) {
    console.error(`Ingen brief för "${args.id}" i doodle-briefs.ts. Lägg till en post eller använd ad-hoc-läget.`);
    process.exit(1);
  }
  await runOne(brief, args.model, {
    steps: args.steps,
    suffix: args.suffix,
    control: args.control,
    controlStrength: args.controlStrength,
  });
  console.log('\nKör `npm run sync-quiz-sketches` för att registrera asset:en i appen.');
}

main().catch((e) => {
  console.error(`ERROR: ${(e as Error).message}`);
  process.exit(1);
});

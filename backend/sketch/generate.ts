// AI-/filter-tecknad porträtt-pipeline för QuizVibe — "Iconic Moments".
//
// MÅL (spec 2026-05-28): rå, handtecknad look med GRAFIT-GRÅA linjer på MÖRK
// bakgrund + borttagna kommersiella logotyper. Två vägar mot samma estetik så
// vi kan jämföra kostnad vs. kvalitet (vi "utreder alternativen"):
//
//   mode=edges  (default, $0)  Deterministisk kant-detektion via sharp-convolve.
//                              Vita linjer på svart direkt ur källfotot.
//                              100 % bevarad likhet (det ÄR personens ansikte).
//                              Det enda alternativet som INTE testades i v1–v9
//                              (de var colour-dodge tonal-foto + AI text-to-image).
//
//   mode=fal    ($)            fal.ai image-to-image (Flux.1 dev). Källfotot styr
//                              komposition/ansikte (img2img, INTE text2img → rätt
//                              person, till skillnad från v6 Flux Pro), prompten
//                              tvingar bläck-linjekonst. Resultatet inverteras till
//                              vit-på-mörk. Kräver FAL_KEY.
//
//   mode=filter (legacy)       Gamla colour-dodge + vinjett (v9). Behållen för
//                              bakåtkompat — ger MÖRKA linjer på VITT (fel estetik
//                              för dark-mode, men bevarad så inget tappas).
//
// Logotyp-borttagning: i edges/fal fadar vinjett-till-svart + tröskling bort
// låg-kontrast bakgrundsbrus (badges, sponsor-text i bakgrunden). Logotyper PÅ
// kroppen (tröjmärke mitt i bild) kräver inpainting och ligger utanför scope —
// välj källfoto utan framträdande märke, eller maska manuellt.
//
// Multi-layer ("kombinera lager ur rörligt material eller stillbilder"):
//   --layers a.jpg,b.jpg,c.jpg  staplar flera källor till EN canvas (median-
//   blend) innan teckning — för ikoniska ögonblick där bästa ansikte + bästa
//   pose finns i olika frames.
//
// CLI:
//   npm run sketch-generate -- --ref <path|url> --id <id> --era "<era>" --category <athlete|artist|actor|band> [--mode edges|fal|filter]
//   npm run sketch-generate -- --layers <a,b,c> --id <id> --era "<era>" --category <...> [--mode ...]
//   npm run sketch-generate -- --batch <path-to-tsv>
//
// Batch TSV (tab-separated, no header):  id  ref  era  category  [mode]  [flags]
//   flags = '|'-separerade: bow | rembg | noiseClean=a,b | crop=x,y,w,h |
//           mask=cx,cy,rx,ry;... | vignette=none | displayName=... | strength=0.6
//   Line-art-rad: <id><TAB><ref><TAB><era><TAB>athlete<TAB>edges<TAB>bow|crop=0,0,1,0.58|displayName=...
//
// Env: FAL_KEY (krävs endast för mode=fal) — sätt i backend/.env.local.

import { fal } from '@fal-ai/client';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const OUTPUT_DIR = path.join(__dirname, '..', 'output', 'sketches');
const ASSETS_DIR = path.join(__dirname, '..', '..', 'assets', 'quiz-sketches');

// Flux.1 [dev] image-to-image: källfotot driver ansikte + komposition, prompten
// driver stilen. Till skillnad från text-to-image (v6) får vi RÄTT person.
const FAL_IMG2IMG_ENDPOINT = 'fal-ai/flux/dev/image-to-image';
// Strength = hur mycket AI:n får omforma. Lägre = närmare foto (säkrare likhet),
// högre = mer artistisk frihet (mer "tecknat", risk att ansiktet driver). 0.6 är
// en bra startpunkt för bevarad likhet + tydlig linjekonst.
const DEFAULT_FAL_STRENGTH = 0.6;

// Canny ControlNet (Flux dev Control LoRA): beräknar canny-kantkarta ur control-
// bilden och genererar längs den strukturen → bevarar komposition/likhet OCH
// ger äkta linjekonst (rätt verktyg, till skillnad från ren img2img). Output =
// mörka linjer på vitt → inverteras till grå-på-mörk i efterbehandlingen.
const FAL_CANNY_ENDPOINT = 'fal-ai/flux-control-lora-canny';
// Birefnet background-removal — ren maskning (ändrar INTE ansiktet). Används som
// försteg (--rembg) för att isolera motivet från rörig bakgrund/publik → ren
// figur, precis som en screenprint-poster. Bra på fint hår (afros etc.).
const FAL_REMBG_ENDPOINT = 'fal-ai/birefnet/v2';
// control_lora_strength: hur hårt genereringen följer kantkartan. 1.0 = trogen
// strukturen (bäst likhet); lägre ger mer artistisk frihet men driftar motivet.
const DEFAULT_CANNY_STRENGTH = 0.95;

type Category = 'athlete' | 'artist' | 'actor' | 'band';
type Mode = 'edges' | 'poster' | 'pencil' | 'fal' | 'canny' | 'filter';
// Vinjett-läge: 'portrait' tonar hårt mot ett ansikte (övre center), 'scene'
// bevarar hela action-kompositionen och dämpar bara yttersta hörnen (publik-
// brus), 'none' lämnar bilden orörd. Ikoniska ögonblick (flera personer/action)
// ska använda 'scene' så ingen del av händelsen svartläggs.
type VignetteMode = 'portrait' | 'scene' | 'none';

// Slut-format: kvadratisk vit-på-mörk webp, 800 px för bundle-storlek.
const OUTPUT_MAX = 800;

// --- Edge-detektions-tuning (empiriskt justerbart — Peters arbetssätt) --------
// Laplacian high-pass: platta ytor → svart, kanter → vita linjer. Exakt den
// vit-på-mörk-estetik specen ber om, utan AI.
const LAPLACIAN_KERNEL = [-1, -1, -1, -1, 8, -1, -1, -1, -1];
const PRE_BLUR_SIGMA = 0.5;   // dämpa foto-brus innan kant-detektion
const LINE_SOFTEN_SIGMA = 0.6; // mjuka upp kanter → pennkänsla istället för aliaserat
const LINE_GAIN = 4.8;        // kraftig gain → räta upp svaga high-pass-linjer mot vitt
const LINE_OFFSET = -13;      // bakgrunds-suppression (tryck ner brus mot svart)
// Tonmappning: skala ner de upplyfta linjerna till GRAFIT-GRÅ (255→~158) så det
// läser som blyerts, inte hård vit. Bakgrunden (0) förblir svart (0×scale=0).
const LINE_GREY_SCALE = 0.62;

// --- Poster/stencil-tuning (2-3-tons screenprint-look, à la Peters referens) --
// Tröskelvärden i greyscale (0-255) som delar bilden i tre toner. Bakgrund +
// skuggor → svart, mellanton → mörkgrå, högdager → ljusgrå. Tunbart per motiv.
const POSTER_MID_T = 95;       // > detta = minst mellanton
const POSTER_HI_T = 170;       // > detta = högdager
const POSTER_MID_LEVEL = 105;  // mellantonens grå-värde på svart botten
const POSTER_HI_LEVEL = 210;   // högdagerns grå-värde

// --- Pencil/charcoal-tuning (kontinuerlig-tons blyertsskiss, mörkt-på-vitt) ---
// colour-dodge ger linjer; vi multiplicerar in ett mjukt tonlager så ansiktet
// får kontinuerlig skuggning (inte bara konturer) + kontrast-pop för djup.
const PENCIL_BLUR = 14;        // colour-dodge-blur; lägre = finare/skarpare linjer
const PENCIL_TONE_MUL = 0.5;   // tonlagrets kompression (skuggdjup)
const PENCIL_TONE_OFF = 105;   // tonlagrets ljus-golv (högdager hålls ljusa)
const PENCIL_CONTRAST_MUL = 1.35; // slutlig kontrast
const PENCIL_CONTRAST_OFF = -28;  // djupa skuggor

interface SketchInput {
  id: string;
  era: string;
  category: Category;
  ref?: string;           // enskild källa (path|url)
  layers?: string[];      // flera källor → composeLayers
  mode?: Mode;
  vignette?: VignetteMode; // default 'portrait'
  rembg?: boolean;        // background-removal-försteg (fal birefnet) före sketch
  maskEllipses?: { cx: number; cy: number; rx: number; ry: number }[]; // logo-mask (normaliserat 0-1)
  appDark?: boolean;      // emittera ljus-på-transparent (för dark-mode-rendering i appen)
  frame?: 'q';            // rama in skissen som cameo inne i QuizVibe-Q:t (vitt inne, transparent ute)
  bow?: boolean;          // black-on-white-output (för frontend Q-mask): edges inverteras, fal/canny hoppar grey-on-dark
  noiseClean?: [number, number]; // bow levels (a,b) efter negate; käll-adaptiv (grynig källa = aggressiv, ren = mild)
  crop?: { x: number; y: number; w: number; h: number }; // beskär källan till motivet (normaliserat 0-1) före teckning

  strength?: number;      // endast mode=fal
  displayName?: string;
}

// --- Källinläsning ------------------------------------------------------------

async function loadImageBuffer(ref: string): Promise<Buffer> {
  if (/^https?:\/\//i.test(ref)) {
    const res = await fetch(ref, {
      headers: {
        'User-Agent':
          'QuizVibe/1.0 (quizvibe.se; admin@quizvibe.se) ImageFetcher/1.0',
      },
    });
    if (!res.ok) {
      throw new Error(
        `Failed to download reference image: ${res.status} ${res.statusText}`,
      );
    }
    return Buffer.from(await res.arrayBuffer());
  }
  if (!fs.existsSync(ref)) {
    throw new Error(`Reference image not found: ${ref}`);
  }
  return fs.readFileSync(ref);
}

// Multi-layer: stapla flera källor till EN normaliserad canvas via median-blend.
// Median tar bort transienta artefakter (rörligt material) och förstärker det
// stabila ansiktet. Alla lager resize:as till samma kvadrat innan blend.
async function composeLayers(refs: string[]): Promise<Buffer> {
  const SIZE = 1024;
  const normalized: Buffer[] = [];
  for (const r of refs) {
    const buf = await loadImageBuffer(r);
    const sq = await sharp(buf)
      .resize(SIZE, SIZE, { fit: 'cover', position: 'attention' })
      .greyscale()
      .normalise()
      .png()
      .toBuffer();
    normalized.push(sq);
  }
  if (normalized.length === 1) return normalized[0];

  // Median-blend: composite alla lager med fallande opacity. En riktig
  // per-pixel-median kräver rå pixel-loop; för pipeline-syfte räcker en viktad
  // overlay som drar fram det gemensamma (ansiktet) och tonar ut det unika.
  const base = sharp(normalized[0]);
  const overlays = normalized.slice(1).map((input, i) => ({
    input,
    blend: 'over' as const,
    // fallande opacity per lager via pre-multiplicerad alfa
  }));
  // sharp saknar opacity-på-composite; emulera via ensureAlpha + linear på varje
  const weighted: { input: Buffer; blend: 'over' }[] = [];
  for (let i = 1; i < normalized.length; i++) {
    const alpha = Math.round(255 / (i + 1)); // 1/2, 1/3, ...
    const layer = await sharp(normalized[i])
      .ensureAlpha()
      .composite([
        {
          input: Buffer.from([0, 0, 0, 255 - alpha]),
          raw: { width: 1, height: 1, channels: 4 },
          tile: true,
          blend: 'dest-in',
        },
      ])
      .png()
      .toBuffer();
    weighted.push({ input: layer, blend: 'over' });
  }
  void overlays;
  return base.composite(weighted).png().toBuffer();
}

// --- Estetik-steg -------------------------------------------------------------

// Vinjett: radial gradient transparent center → opak SVART kanter. Fadar bort
// bakgrund/brus så fokus hamnar på motivet.
//  - portrait: hård ton mot övre-center (ett ansikte). cy=40 % r=55 %.
//  - scene:    bevarar hela kompositionen, dämpar bara yttersta hörnen så
//              publik/bakgrund i hörnen tonas men action + figurer behålls.
//  - none:     returnerar null (ingen vinjett).
function buildBlackVignette(
  width: number,
  height: number,
  mode: VignetteMode,
): Buffer | null {
  if (mode === 'none') return null;
  const cfg =
    mode === 'scene'
      ? { cx: '50%', cy: '50%', r: '80%', clear: '68%', mid: '90%', midA: '0.5', edgeA: '0.9' }
      : { cx: '50%', cy: '40%', r: '55%', clear: '45%', mid: '72%', midA: '0.92', edgeA: '1' };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <radialGradient id="vg" cx="${cfg.cx}" cy="${cfg.cy}" r="${cfg.r}">
        <stop offset="0%" stop-color="black" stop-opacity="0"/>
        <stop offset="${cfg.clear}" stop-color="black" stop-opacity="0"/>
        <stop offset="${cfg.mid}" stop-color="black" stop-opacity="${cfg.midA}"/>
        <stop offset="100%" stop-color="black" stop-opacity="${cfg.edgeA}"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#vg)"/>
  </svg>`;
  return Buffer.from(svg);
}

// Deterministisk kant-detektion → vita linjer på svart.
async function applyEdgeSketch(
  inputBuffer: Buffer,
  vignetteMode: VignetteMode,
  opts: { greyScale?: number; softenSigma?: number; clahe?: boolean } = {},
): Promise<Buffer> {
  // Bow/line-art-läget vill ha SKARPARE + MÖRKARE linjer + lokal kontrast som
  // lyfter ansiktsdragen (Peter 2026-05-28: edges "rätt spår" men ansiktet otydligt).
  const softenSigma = opts.softenSigma ?? LINE_SOFTEN_SIGMA;
  const greyScale = opts.greyScale ?? LINE_GREY_SCALE;
  const meta = await sharp(inputBuffer).metadata();
  const width = meta.width ?? 1024;
  const height = meta.height ?? 1024;

  // 1. greyscale + normalise + median (tar bort isolerade bakgrunds-specklar
  //    som annars blir vita prickar i kant-passet) + valfri CLAHE (lokal adaptiv
  //    kontrast → svaga ansiktsgradienter ger fler/tydligare kanter) + lätt blur.
  // Bow/line-art: CLAHE (lokal kontrast) lyfter svaga ansiktsgradienter. Sharpen
  // testades men förstärkte JPEG-korn/publik lika mycket → brusigt; ansiktets
  // skärpa är källbegränsad (lågupplöst foto), inte filter-begränsad.
  let greyPipe = sharp(inputBuffer).greyscale().normalise().median(3);
  if (opts.clahe) greyPipe = greyPipe.clahe({ width: 64, height: 64, maxSlope: 3 });
  const grey = await greyPipe.blur(PRE_BLUR_SIGMA).toFormat('png').toBuffer();

  // 2. Laplacian high-pass → kanter ljusa på svart bakgrund
  const edges = await sharp(grey)
    .convolve({ width: 3, height: 3, kernel: LAPLACIAN_KERNEL })
    .normalise()
    .toFormat('png')
    .toBuffer();

  // 3a. mjuka linjer (penn-känsla) + kraftig gain → linjerna mot vitt.
  const linesBright = await sharp(edges)
    .blur(softenSigma)
    .linear(LINE_GAIN, LINE_OFFSET)
    .toFormat('png')
    .toBuffer();
  // 3b. separat pass: tonmappa ner till grafit-grå (eget sharp-anrop så skalningen
  //     garanterat appliceras ovanpå gain:en, inte överskrivs av den). greyScale=1.0
  //     (bow) behåller full ljusstyrka → rena svarta linjer efter negate.
  const lines = await sharp(linesBright)
    .linear(greyScale, 0)
    .toFormat('png')
    .toBuffer();

  // 4. vinjett-till-svart → bakgrund/brus tonas i kanterna (läge-beroende)
  const vignetteSvg = buildBlackVignette(width, height, vignetteMode);
  if (!vignetteSvg) return lines;
  const vignette = await sharp(vignetteSvg).resize(width, height).png().toBuffer();
  return sharp(lines)
    .composite([{ input: vignette, blend: 'over' }])
    .toBuffer();
}

// Posteriserad 2-3-tons stencil → grå-på-mörk (screenprint/poster-look).
// Renare än kant-linjer för hår-tunga motiv (afros etc.) där edges blir brusigt.
// Tre toner: skugga/bakgrund=svart, mellanton=mörkgrå, högdager=ljusgrå.
async function applyPosterStencil(
  inputBuffer: Buffer,
  vignetteMode: VignetteMode,
): Promise<Buffer> {
  const meta = await sharp(inputBuffer).metadata();
  const width = meta.width ?? 1024;
  const height = meta.height ?? 1024;

  // Greyscale-bas + CLAHE (lokal adaptiv kontrast → lyfter motiv ur dimmiga/
  // ojämnt belysta källor, t.ex. mörkt hår mot mörk bakgrund) + median (jämnar
  // ut → större sammanhängande tonytor, mindre brus).
  const grey = await sharp(inputBuffer)
    .greyscale()
    .normalise()
    .clahe({ width: 64, height: 64, maxSlope: 3 })
    .median(5)
    .blur(0.5)
    .toFormat('png')
    .toBuffer();

  // Två binära masker → bygg tre nivåer genom att ADDERA toner.
  const midMask = await sharp(grey).threshold(POSTER_MID_T).toFormat('png').toBuffer();
  const hiMask = await sharp(grey).threshold(POSTER_HI_T).toFormat('png').toBuffer();
  const midLayer = await sharp(midMask)
    .linear(POSTER_MID_LEVEL / 255, 0)
    .toFormat('png')
    .toBuffer();
  const hiAdd = await sharp(hiMask)
    .linear((POSTER_HI_LEVEL - POSTER_MID_LEVEL) / 255, 0)
    .toFormat('png')
    .toBuffer();
  const poster = await sharp(midLayer)
    .composite([{ input: hiAdd, blend: 'add' }])
    .toFormat('png')
    .toBuffer();

  const vignetteSvg = buildBlackVignette(width, height, vignetteMode);
  if (!vignetteSvg) return poster;
  const vignette = await sharp(vignetteSvg).resize(width, height).png().toBuffer();
  return sharp(poster)
    .composite([{ input: vignette, blend: 'over' }])
    .toBuffer();
}

// Pencil/charcoal: kontinuerlig-tons blyertsskiss, MÖRKA linjer på VITT.
// colour-dodge ger konturlinjer; vi multiplicerar in ett mjukt tonlager så
// ansiktet får kontinuerlig skuggning (inte bara linjer), sedan kontrast-pop.
// Vit radial-vinjett fadar bakgrund/kropps-kanter mot vitt → ren "papperslook".
async function applyPencilFilter(inputBuffer: Buffer): Promise<Buffer> {
  const meta = await sharp(inputBuffer).metadata();
  const width = meta.width ?? 1024;
  const height = meta.height ?? 1024;

  const grey = await sharp(inputBuffer)
    .greyscale()
    .normalise()
    .resize(width, height)
    .toFormat('png')
    .toBuffer();

  // Konturlinjer via colour-dodge (greyscale + blurrad-inverterad).
  const blurredInverted = await sharp(grey)
    .negate()
    .blur(PENCIL_BLUR)
    .toFormat('png')
    .toBuffer();
  const lines = await sharp(grey)
    .composite([{ input: blurredInverted, blend: 'colour-dodge' }])
    .toFormat('png')
    .toBuffer();

  // Mjukt tonlager (komprimerat till övre ljus-register) → multiply lägger till
  // kontinuerlig skuggning utan att svärta högdagrar.
  const tone = await sharp(grey)
    .linear(PENCIL_TONE_MUL, PENCIL_TONE_OFF)
    .toFormat('png')
    .toBuffer();
  const shaded = await sharp(lines)
    .composite([{ input: tone, blend: 'multiply' }])
    .toFormat('png')
    .toBuffer();

  const contrasted = await sharp(shaded)
    .linear(PENCIL_CONTRAST_MUL, PENCIL_CONTRAST_OFF)
    .toBuffer();

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

  return sharp(contrasted)
    .composite([{ input: vignetteBuffer, blend: 'over' }])
    .toBuffer();
}

// --- fal.ai (image-to-image + Canny ControlNet) -------------------------------

// Trademark/logo-restriktion — vävs in i ALLA fal-prompter (img2img + canny) så
// AI-genererade skisser följer samma compliance som det deterministiska
// --mask-steget: kommersiella loggor + klubbmärken MÅSTE bort, men tröjnummer
// FÅR vara kvar (inte varumärke/skyddat, + viktig gameplay-ledtråd).
const LOGO_RESTRICTION =
  'MANDATORY: completely remove, erase and leave blank ALL commercial brand logos ' +
  '(Nike, Adidas, Puma, Umbro, Reebok, etc.), manufacturer marks, sponsor patches, and ' +
  'official team crests or club/national emblems — both on the clothing AND in the background. ' +
  'ALLOWED: player jersey numbers (e.g. "10", "7") may and should be kept — they carry no ' +
  'trademark risk and are an important gameplay clue. ' +
  'NO color, NO photographic shading, NO brand text or wordmarks, NO watermark, NO crowd.';

function buildFalPrompt(input: SketchInput): string {
  // Klädsel-guide per kategori — INGA loggor/märken, men tröjnummer tillåtet.
  const subjectGuide: Record<Category, string> = {
    athlete:
      'plain athletic shirt with NO brand logos, NO team crests or club emblems and NO sponsor patches (the plain jersey number may remain)',
    artist: 'plain era-appropriate clothing with NO brand logos or merch wordmarks',
    actor:
      'themselves in that era, NOT any fictional character or copyrighted movie costume',
    band: 'plain era-appropriate clothing with NO commercial branding',
  };
  const displayName = input.displayName ?? input.id;
  // Vi genererar SVART bläck/blyerts på VITT (Flux är bäst på detta), inverterar
  // sedan deterministiskt till grå-på-mörk i efterbehandlingen.
  return [
    `A raw, energetic hand-drawn graphite pencil sketch of ${displayName} during ${input.era}.`,
    `Loose confident monochrome pencil linework with cross-hatching for shadow, on plain white paper.`,
    `Strong likeness — keep exact face shape, features and expression.`,
    subjectGuide[input.category] + '.',
    `Plain empty white background. ${LOGO_RESTRICTION}`,
  ].join(' ');
}

// Ren line art-prompt (Maradona-referensens nivå): tunna, tydliga konturlinjer,
// INGEN skuggning/hatchning/grå-toner. Som en målarboks-kontur — bara linjer som
// följer riktig ansiktsstruktur (canny ger strukturen → bevarad likhet).
function buildLineArtPrompt(input: SketchInput): string {
  const subjectGuide: Record<Category, string> = {
    athlete:
      'plain athletic shirt with NO brand logos, NO team crests or club emblems and NO sponsor patches (the plain jersey number may remain)',
    artist: 'plain era-appropriate clothing with NO brand logos or merch wordmarks',
    actor:
      'themselves in that era, NOT any fictional character or copyrighted movie costume',
    band: 'plain era-appropriate clothing with NO commercial branding',
  };
  const displayName = input.displayName ?? input.id;
  return [
    `Clean minimalist black ink line-art portrait of ${displayName} during ${input.era}.`,
    `Thin, clear, confident single-weight contour lines ONLY — like a coloring-book outline or a line-drawing tutorial.`,
    `Absolutely NO shading, NO cross-hatching, NO grey tones, NO solid fills, NO stippling — pure clean outlines on blank white.`,
    `Strong likeness — keep exact face shape, hairstyle, features and expression so the person stays recognizable.`,
    subjectGuide[input.category] + '.',
    `Pure flat white background, no scenery. ${LOGO_RESTRICTION}`,
  ].join(' ');
}

async function uploadToFal(buffer: Buffer, filename: string): Promise<string> {
  // Uint8Array (inte rå Buffer) för BlobPart-typkompatibilitet.
  const blob = new Blob([new Uint8Array(buffer)], { type: 'image/png' });
  const file = new File([blob], filename, { type: 'image/png' });
  return fal.storage.upload(file);
}

// Bevara källans URSPRUNGLIGA format (ingen square-crop): skala in i 1024-box +
// runda dims till multiplar av 16 (Flux-vänligt) → ladda upp till fal-storage
// (Wikimedia m.fl. blockar fal:s nedladdnings-bot via hotlink-skydd → 422).
async function prepAndUpload(
  sourceBuffer: Buffer,
  id: string,
): Promise<{ url: string; w: number; h: number }> {
  const pre = await sharp(sourceBuffer)
    .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();
  const m = await sharp(pre).metadata();
  const w = Math.max(256, Math.floor((m.width ?? 768) / 16) * 16);
  const h = Math.max(256, Math.floor((m.height ?? 768) / 16) * 16);
  const normalized = await sharp(pre).resize(w, h, { fit: 'fill' }).png().toBuffer();
  const url = await uploadToFal(normalized, `${id}-src.png`);
  return { url, w, h };
}

// Gemensam efterbehandling för fal-output (mörka linjer på vitt) → grå-på-mörk:
// invertera, normalisera, tonmappa till grafit-grå, lägg vinjett.
async function toGreyOnDark(drawn: Buffer, vignetteMode: VignetteMode): Promise<Buffer> {
  const meta = await sharp(drawn).metadata();
  const width = meta.width ?? 1024;
  const height = meta.height ?? 1024;
  const inverted = await sharp(drawn)
    .greyscale()
    .negate()
    .normalise()
    .linear(1.25, -15)
    .toFormat('png')
    .toBuffer();
  const greyed = await sharp(inverted)
    .linear(LINE_GREY_SCALE, 0)
    .toFormat('png')
    .toBuffer();
  const vignetteSvg = buildBlackVignette(width, height, vignetteMode);
  if (!vignetteSvg) return greyed;
  const vignette = await sharp(vignetteSvg).resize(width, height).png().toBuffer();
  return sharp(greyed)
    .composite([{ input: vignette, blend: 'over' }])
    .toBuffer();
}

// Black-on-white-efterbehandling för fal-output (line art / pencil): fal genererar
// redan svarta linjer på vitt → vi behåller polariteten (INGEN invertering som
// toGreyOnDark gör) och städar bara: rena vita ytor + tydliga svarta linjer. Detta
// är formatet frontend-ens Q-mask förväntar sig (SVART-på-VIT).
async function toBlackOnWhite(drawn: Buffer): Promise<Buffer> {
  return sharp(drawn)
    .greyscale()
    .normalise()
    .linear(1.2, -14) // lätt kontrast: vit botten verkligt vit + linjer tydligt svarta
    .flatten({ background: '#FFFFFF' })
    .toFormat('png')
    .toBuffer();
}

function extractFalImageUrl(result: unknown): string {
  const url = (result as { data?: { images?: { url: string }[] } }).data?.images?.[0]
    ?.url;
  if (!url) throw new Error('fal.ai returnerade ingen bild.');
  return url;
}

// Background-removal-försteg: isolera motivet (birefnet) → komponera mot SVART →
// ren figur utan bakgrund (matchar screenprint-posterns rena look). Ren maskning,
// ingen identitets-ändring. Returnerar buffer som sedan tecknas av valt mode.
async function falRemoveBackground(
  sourceBuffer: Buffer,
  id: string,
  falLogs: string[],
  bg: { r: number; g: number; b: number } = { r: 0, g: 0, b: 0 },
): Promise<Buffer> {
  if (!process.env.FAL_KEY) {
    throw new Error('FAL_KEY saknas — krävs för --rembg. Sätt i backend/.env.local.');
  }
  const { url } = await prepAndUpload(sourceBuffer, id);
  console.log(`[${id}] fal.ai birefnet background removal...`);
  const result = await fal.subscribe(FAL_REMBG_ENDPOINT, {
    input: { image_url: url },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        update.logs?.forEach((l) => falLogs.push(l.message));
      }
    },
  });
  const outUrl = (result as { data?: { image?: { url: string } } }).data?.image?.url;
  if (!outUrl) throw new Error('birefnet returnerade ingen bild.');
  const cutout = await loadImageBuffer(outUrl); // PNG med transparent bakgrund
  const m = await sharp(cutout).metadata();
  const w = m.width ?? 1024;
  const h = m.height ?? 1024;
  // Komponera mot vald bakgrundsfärg: VIT för pencil (mörkt-på-vitt), SVART för
  // poster/edges (ljust-på-mörkt).
  return sharp({
    create: { width: w, height: h, channels: 3, background: bg },
  })
    .composite([{ input: cutout, blend: 'over' }])
    .png()
    .toBuffer();
}

async function falImageToImage(
  sourceBuffer: Buffer,
  input: SketchInput,
  falLogs: string[],
): Promise<Buffer> {
  if (!process.env.FAL_KEY) {
    throw new Error('FAL_KEY saknas — krävs för mode=fal. Sätt i backend/.env.local.');
  }
  const { url: imageUrl } = await prepAndUpload(sourceBuffer, input.id);

  console.log(`[${input.id}] fal.ai image-to-image (strength=${input.strength ?? DEFAULT_FAL_STRENGTH})...`);
  const result = await fal.subscribe(FAL_IMG2IMG_ENDPOINT, {
    input: {
      image_url: imageUrl,
      prompt: input.bow ? buildLineArtPrompt(input) : buildFalPrompt(input),
      strength: input.strength ?? DEFAULT_FAL_STRENGTH,
      num_inference_steps: 40,
      guidance_scale: 3.5,
      enable_safety_checker: false,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        update.logs?.forEach((l) => falLogs.push(l.message));
      }
    },
  });

  const drawn = await loadImageBuffer(extractFalImageUrl(result));
  return input.bow
    ? toBlackOnWhite(drawn)
    : toGreyOnDark(drawn, input.vignette ?? 'portrait');
}

// Canny ControlNet: rätt verktyg för linjekonst med bevarad komposition. Control-
// bilden (källfotot) ger kantkartan; control_lora_strength styr hur troget
// strukturen följs. image_size sätts till källans (rundade) dims → originalformat.
async function falCannyControlNet(
  sourceBuffer: Buffer,
  input: SketchInput,
  falLogs: string[],
): Promise<Buffer> {
  if (!process.env.FAL_KEY) {
    throw new Error('FAL_KEY saknas — krävs för mode=canny. Sätt i backend/.env.local.');
  }
  const { url: controlUrl, w, h } = await prepAndUpload(sourceBuffer, input.id);
  const strength = input.strength ?? DEFAULT_CANNY_STRENGTH;

  console.log(`[${input.id}] fal.ai canny controlnet (control_lora_strength=${strength}, ${w}x${h})...`);
  const result = await fal.subscribe(FAL_CANNY_ENDPOINT, {
    input: {
      prompt: input.bow ? buildLineArtPrompt(input) : buildFalPrompt(input),
      control_lora_image_url: controlUrl,
      control_lora_strength: strength,
      num_inference_steps: 36,
      guidance_scale: 3.5,
      image_size: { width: w, height: h },
      output_format: 'png',
      enable_safety_checker: false,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        update.logs?.forEach((l) => falLogs.push(l.message));
      }
    },
  });

  const drawn = await loadImageBuffer(extractFalImageUrl(result));
  return input.bow
    ? toBlackOnWhite(drawn)
    : toGreyOnDark(drawn, input.vignette ?? 'portrait');
}

// Logo-mask: måla över ej-tillåtna märken (klubbmärken, tillverkarloggor, nummer)
// med en plan färg som smälter in i motivet. VIT för pencil (vit tröja/botten),
// SVART för poster/edges (mörk botten). Regioner anges normaliserat (0-1) av
// kuratorn per bild — QA-steg för logo-compliance. För logo PÅ färgad yta krävs
// manuell touch-up; vit/svart-patch funkar när märket sitter på vit/mörk yta.
async function applyLogoMask(
  buffer: Buffer,
  ellipses: { cx: number; cy: number; rx: number; ry: number }[] | undefined,
  mode: Mode,
  blackOnWhite: boolean,
): Promise<Buffer> {
  if (!ellipses || ellipses.length === 0) return buffer;
  const meta = await sharp(buffer).metadata();
  const w = meta.width ?? 1024;
  const h = meta.height ?? 1024;
  // Vit fyllning på mörkt-på-vitt (pencil/filter ELLER bow line art), svart på
  // ljust-på-mörkt (poster/edges utan bow). Fel polaritet → svart blob (bug 2026-05-28).
  const fill =
    mode === 'pencil' || mode === 'filter' || blackOnWhite ? 'white' : 'black';
  const shapes = ellipses
    .map(
      (e) =>
        `<ellipse cx="${(e.cx * w).toFixed(1)}" cy="${(e.cy * h).toFixed(1)}" rx="${(e.rx * w).toFixed(1)}" ry="${(e.ry * h).toFixed(1)}" fill="${fill}"/>`,
    )
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${shapes}</svg>`;
  // Patchen ska bli REN vit (= raderat till papper), inte en suddig halo. Tidigare
  // blurrades hela lagret med ~10px → halv-genomskinlig vit kant där pennstrecken
  // syntes igenom = "suddigt" (Peter 2026-05-28). Nu komponeras BARA den hårda,
  // opaka ellipsen — librsvg anti-aliasar kantpixlarna själv (~1px mjuk kant), så
  // märket täcks helt av ren vit utan någon genomskinlig övergångszon.
  return sharp(buffer)
    .composite([{ input: Buffer.from(svg), blend: 'over' }])
    .toBuffer();
}

// Dark-mode-asset: konvertera skissen till LJUSA streck på TRANSPARENT botten
// (luminans→alpha) så app:ens mörka gaming-bg + neon lyser igenom. För pencil/
// filter (mörkt-på-vitt) inverteras först; för poster/edges (redan ljust-på-mörkt)
// används luminansen direkt. Output: RGBA (webp bevarar alfa).
async function toAppDark(buffer: Buffer, mode: Mode): Promise<Buffer> {
  const isDarkOnLight = mode === 'pencil' || mode === 'filter';
  // 1-kanals "ljus-karta": ljus = streck/motiv, svart = botten (→ transparent).
  const lightMap = isDarkOnLight
    ? await sharp(buffer).greyscale().negate().toColourspace('b-w').png().toBuffer()
    : await sharp(buffer).greyscale().toColourspace('b-w').png().toBuffer();
  // RGB = ljus gråskala (strecken), Alpha = samma luminans (botten transparent).
  const rgb = await sharp(lightMap).toColourspace('srgb').removeAlpha().png().toBuffer();
  return sharp(rgb).joinChannel(lightMap).png().toBuffer();
}

// Q-frame: visa skissen som en cameo INNE i QuizVibe-Q:t. Skissens vita botten =
// "papper" inne i ringen, fadar mjukt till transparent vid ringen → app:ens mörka
// bg utanför. Q-ring + svans ritas ovanpå i brand-färg. Löser dark-mode UTAN att
// invertera blyertsen (inne i Q = vitt papper + mörk penna; utanför = mörkt).
const Q_FRAME_SIZE = 900;
const Q_RING_COLOR = '#4DA3FF'; // Colors.primary
const Q_FILL_COLOR = '#FFFFFF'; // pappers-vitt bakom skissen (täcker ev. transparens)

async function frameInQ(sketchBuffer: Buffer): Promise<Buffer> {
  const S = Q_FRAME_SIZE;
  const cx = S * 0.5;
  const cy = S * 0.47; // lite ovanför mitten → plats för svansen nedtill
  const ringR = S * 0.4;
  const ringW = Math.round(S * 0.03);
  const discR = ringR - ringW * 0.5; // vita diskens radie (precis innanför ringen)

  // 1. Skiss → kvadrat (cover, position 'top' → behåll afron, beskär nedre delen).
  const sq = await sharp(sketchBuffer)
    .resize(S, S, { fit: 'cover', position: 'top' })
    .flatten({ background: Q_FILL_COLOR })
    .toColourspace('srgb')
    .removeAlpha()
    .toFormat('png')
    .toBuffer();

  // 2. Radial alpha-mask (userSpaceOnUse): opak i mitten → transparent vid disc-
  //    radien. Cirkeln klipper, gradienten ger den mjuka fade:n vid ringen.
  const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">
    <defs>
      <radialGradient id="m" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${discR}">
        <stop offset="0" stop-color="white" stop-opacity="1"/>
        <stop offset="0.8" stop-color="white" stop-opacity="1"/>
        <stop offset="1" stop-color="white" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="black"/>
    <circle cx="${cx}" cy="${cy}" r="${discR}" fill="url(#m)"/>
  </svg>`;
  const maskBuf = await sharp(Buffer.from(maskSvg))
    .toColourspace('b-w')
    .png()
    .toBuffer();

  // 3. Applicera mask som alfa → cameo (RGBA, fadar till transparent vid ringen).
  const cameo = await sharp(sq).joinChannel(maskBuf).png().toBuffer();

  // 4. Q-ring + svans (svansen speglar QuizVibeLogo: från ~0.69r till ~1.15r diagonalt).
  const tx1 = cx + 0.69 * ringR;
  const ty1 = cy + 0.69 * ringR;
  const tx2 = cx + 1.15 * ringR;
  const ty2 = cy + 1.15 * ringR;
  const ringSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">
    <circle cx="${cx}" cy="${cy}" r="${ringR}" fill="none" stroke="${Q_RING_COLOR}" stroke-width="${ringW}"/>
    <line x1="${tx1.toFixed(1)}" y1="${ty1.toFixed(1)}" x2="${tx2.toFixed(1)}" y2="${ty2.toFixed(1)}" stroke="${Q_RING_COLOR}" stroke-width="${ringW}" stroke-linecap="round"/>
  </svg>`;

  // 5. Komponera: transparent canvas ← cameo ← Q-ring ovanpå.
  return sharp({
    create: { width: S, height: S, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: cameo },
      { input: Buffer.from(ringSvg) },
    ])
    .png()
    .toBuffer();
}

// --- Huvud-pipeline -----------------------------------------------------------

export async function generateSketch(
  input: SketchInput,
): Promise<{ id: string; outputPath: string; assetsPath: string; falLogs: string[] }> {
  const mode: Mode = input.mode ?? 'edges';
  const falLogs: string[] = [];

  // 1. Källa: enskild ref eller flera lager
  let sourceBuffer: Buffer;
  if (input.layers && input.layers.length > 0) {
    console.log(`[${input.id}] Composing ${input.layers.length} layers...`);
    sourceBuffer = await composeLayers(input.layers);
  } else if (input.ref) {
    console.log(`[${input.id}] Loading reference...`);
    sourceBuffer = await loadImageBuffer(input.ref);
  } else {
    throw new Error('Ange antingen --ref eller --layers.');
  }

  // 1a2. Valfri beskärning till motivet (normaliserat 0-1) — t.ex. huvud+afro
  //      ovanför ett watermärke, eller centrera ansiktet. Görs FÖRE rembg/teckning.
  if (input.crop) {
    const m = await sharp(sourceBuffer).metadata();
    const W = m.width ?? 1024;
    const H = m.height ?? 1024;
    const left = Math.max(0, Math.round(input.crop.x * W));
    const top = Math.max(0, Math.round(input.crop.y * H));
    const width = Math.min(W - left, Math.round(input.crop.w * W));
    const height = Math.min(H - top, Math.round(input.crop.h * H));
    sourceBuffer = await sharp(sourceBuffer)
      .extract({ left, top, width, height })
      .toFormat('png')
      .toBuffer();
  }

  // 1b. Valfritt background-removal-försteg → isolera motivet. Bakgrundsfärg
  //     matchar mode:ns estetik: VIT för pencil (mörkt-på-vitt), annars SVART.
  if (input.rembg) {
    const rembgBg =
      mode === 'pencil' || mode === 'filter'
        ? { r: 255, g: 255, b: 255 }
        : { r: 0, g: 0, b: 0 };
    sourceBuffer = await falRemoveBackground(sourceBuffer, input.id, falLogs, rembgBg);
  }

  // 2. Teckna enligt mode
  console.log(`[${input.id}] Sketching (mode=${mode})...`);
  let sketchBuffer: Buffer;
  if (mode === 'fal') {
    sketchBuffer = await falImageToImage(sourceBuffer, input, falLogs);
  } else if (mode === 'canny') {
    sketchBuffer = await falCannyControlNet(sourceBuffer, input, falLogs);
  } else if (mode === 'poster') {
    sketchBuffer = await applyPosterStencil(sourceBuffer, input.vignette ?? 'portrait');
  } else if (mode === 'pencil' || mode === 'filter') {
    sketchBuffer = await applyPencilFilter(sourceBuffer);
  } else {
    // edges ger vita linjer på svart. För bow (frontend Q-mask) kör vi utan svart
    // vinjett, med skarpare/mörkare linjer + CLAHE (tydligare ansikte), och
    // inverterar → svarta linjer på vitt (line art-polaritet).
    sketchBuffer = await applyEdgeSketch(
      sourceBuffer,
      input.bow ? 'none' : input.vignette ?? 'portrait',
      input.bow ? { greyScale: 1.0, softenSigma: 0.3, clahe: true } : {},
    );
    if (input.bow) {
      // negate → svart-på-vitt; sedan en käll-adaptiv levels-kurva som trycker
      // svagt brus mot vitt men behåller de mörka figur-linjerna. Grynig källa
      // (test.jpg) → aggressiv (2.0,-130). Ren högupplöst källa → mild (t.ex.
      // 1.3,-30) annars washas svaga ansiktslinjer bort. Default = aggressiv.
      const [na, nb] = input.noiseClean ?? [2.0, -130];
      sketchBuffer = await sharp(sketchBuffer)
        .negate()
        .linear(na, nb)
        .toFormat('png')
        .toBuffer();
    }
  }

  // 2b. Logo-mask: måla över ej-tillåtna märken (klubbmärken/loggor). Bow line art
  //     är svart-på-vitt → vit fyllning (radera till papper).
  sketchBuffer = await applyLogoMask(sketchBuffer, input.maskEllipses, mode, !!input.bow);

  // 2c. Valfritt: Q-frame (cameo inne i Q:t) ELLER ljus-på-transparent invert.
  if (input.frame === 'q') {
    sketchBuffer = await frameInQ(sketchBuffer);
  } else if (input.appDark) {
    sketchBuffer = await toAppDark(sketchBuffer, mode);
  }

  // 3. Re-encode till webp (kvadrat, max 800)
  const webp = await sharp(sketchBuffer)
    .resize(OUTPUT_MAX, OUTPUT_MAX, { fit: 'inside', withoutEnlargement: true })
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

// --- CLI ----------------------------------------------------------------------

function parseArgs(argv: string[]): Partial<SketchInput> & { batch?: string } {
  const args: Partial<SketchInput> & { batch?: string } = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--ref') args.ref = argv[++i];
    else if (a === '--layers') args.layers = argv[++i].split(',').map((s) => s.trim());
    else if (a === '--id') args.id = argv[++i];
    else if (a === '--era') args.era = argv[++i];
    else if (a === '--category') args.category = argv[++i] as Category;
    else if (a === '--mode') args.mode = argv[++i] as Mode;
    else if (a === '--vignette') args.vignette = argv[++i] as VignetteMode;
    else if (a === '--rembg') args.rembg = true;
    else if (a === '--mask') {
      args.maskEllipses = argv[++i].split(';').map((s) => {
        const [cx, cy, rx, ry] = s.split(',').map(Number);
        return { cx, cy, rx, ry };
      });
    } else if (a === '--app-dark') args.appDark = true;
    else if (a === '--bow') args.bow = true;
    else if (a === '--noise-clean') {
      const [na, nb] = argv[++i].split(',').map(Number);
      args.noiseClean = [na, nb];
    } else if (a === '--crop') {
      const [x, y, w, h] = argv[++i].split(',').map(Number);
      args.crop = { x, y, w, h };
    } else if (a === '--frame') args.frame = argv[++i] as 'q';
    else if (a === '--strength') args.strength = parseFloat(argv[++i]);
    else if (a === '--displayName') args.displayName = argv[++i];
    else if (a === '--batch') args.batch = argv[++i];
  }
  return args;
}

// Batch-TSV-kolumn 6 = valfria flaggor, '|'-separerade (mask-ellipser internt ';'):
//   bow | rembg | noiseClean=2.0,-130 | crop=0,0,1,0.58 | mask=cx,cy,rx,ry;... |
//   vignette=none | displayName=Carlos Valderrama | strength=0.6
// Line-art-produktions-rad är typiskt: ...edges<TAB>bow|crop=...|mask=...|displayName=...
function parseBatchFlags(flags: string | undefined): Partial<SketchInput> {
  const out: Partial<SketchInput> = {};
  if (!flags) return out;
  for (const f of flags.split('|').map((s) => s.trim()).filter(Boolean)) {
    const eq = f.indexOf('=');
    const key = eq === -1 ? f : f.slice(0, eq);
    const val = eq === -1 ? '' : f.slice(eq + 1);
    if (key === 'bow') out.bow = true;
    else if (key === 'rembg') out.rembg = true;
    else if (key === 'noiseClean') {
      const [a, b] = val.split(',').map(Number);
      out.noiseClean = [a, b];
    } else if (key === 'crop') {
      const [x, y, w, h] = val.split(',').map(Number);
      out.crop = { x, y, w, h };
    } else if (key === 'mask') {
      out.maskEllipses = val.split(';').map((e) => {
        const [cx, cy, rx, ry] = e.split(',').map(Number);
        return { cx, cy, rx, ry };
      });
    } else if (key === 'vignette') out.vignette = val as VignetteMode;
    else if (key === 'displayName') out.displayName = val;
    else if (key === 'strength') out.strength = parseFloat(val);
  }
  return out;
}

async function runBatch(tsvPath: string): Promise<void> {
  const lines = fs
    .readFileSync(tsvPath, 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.startsWith('#'));
  console.log(`Batch: ${lines.length} items from ${tsvPath}`);

  const results: Array<{ id: string; status: 'ok' | 'err'; msg: string }> = [];
  for (const line of lines) {
    const [id, ref, era, category, mode, flags] = line.split('\t');
    if (!id || !ref || !era || !category) {
      results.push({ id: id ?? '<empty>', status: 'err', msg: 'malformed row' });
      continue;
    }
    try {
      const r = await generateSketch({
        id,
        ref,
        era,
        category: category as Category,
        mode: (mode as Mode) || undefined,
        ...parseBatchFlags(flags),
      });
      results.push({ id, status: 'ok', msg: r.assetsPath });
      console.log(`  ✓ ${id} → ${r.assetsPath}`);
    } catch (e) {
      results.push({ id, status: 'err', msg: (e as Error).message });
      console.error(`  ✗ ${id}: ${(e as Error).message}`);
    }
    await new Promise((r) => setTimeout(r, 1500));
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

  if (!args.id || !args.era || !args.category || (!args.ref && !args.layers)) {
    console.error('Usage:');
    console.error('  Single: --ref <path|url> --id <id> --era "<era>" --category <athlete|artist|actor|band> [--mode edges|poster|fal|canny|filter] [--strength 0.6]');
    console.error('  Layers: --layers <a,b,c> --id <id> --era "<era>" --category <...> [--mode ...]');
    console.error('  Batch:  --batch <path-to-tsv>   (cols: id  ref  era  category  [mode]  [flags])');
    console.error('          flags (|-sep): bow|rembg|noiseClean=a,b|crop=x,y,w,h|mask=cx,cy,rx,ry;...|displayName=...');
    process.exit(1);
  }

  const r = await generateSketch(args as SketchInput);
  console.log(`\n✓ Generated ${r.id} (mode=${args.mode ?? 'edges'})`);
  console.log(`  output:  ${r.outputPath}`);
  console.log(`  assets:  ${r.assetsPath}`);
}

main().catch((e) => {
  console.error(`ERROR: ${(e as Error).message}`);
  process.exit(1);
});

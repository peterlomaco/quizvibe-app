// Sketch-asset-blueprint — forward-compat struktur för line-art-frågor.
//
// STATUS: schema + exempel. PRE-BACKEND (Supabase parkerad) → INTE wired till
// live-DB/cloud-storage ännu. Strukturen är medvetet "stateless": en fråga
// refererar sitt asset via path/id, ingen runtime-state, så den kan lyftas rakt
// in i en framtida questions-tabell + asset-bucket utan omskrivning.
//
// KÄRNMOTOR = deterministisk `edges` (extraherar personens RIKTIGA fotokanter →
// äkta likhet). fal/canny testades 2026-05-28 och DRIFTADE identiteten (gjorde
// Valderrama till en annan person) → används ALDRIG som identitetskälla, bara
// ev. valfri städning (rembg/denoise). Se memory project_sketch_pipeline_direction.
//
// Källor är HAND-KURERADE för peak-career-ikoncitet (admin-upload) — automatisk
// Commons-sökning ger ofta modern/civil bild (t.ex. pensionerad Valderrama i
// kostym) istället för peak-looken. Commons/arkiv används som PD/CC-bas där
// möjligt; line-art-derivatet minskar (men eliminerar inte) derivativ-verk-risk,
// så håll peak-källor försvarbara (arkiv/PD/CC + attribution).

// --- Domän-typer (speglar backend/content/schema.ts där relevant) -------------

/** Endast deterministisk edges är identitets-säker. */
export type SketchEngine = 'edges';

export type MainCategory = 'Music' | 'Film' | 'Sport';

/** Subset av ContentSubject som är image-form (line art). */
export type SketchSubject =
  | 'athlete'
  | 'artist'
  | 'band'
  | 'actor'
  | 'character';

/** Tvålagers-sourcing: Input A (pose/kontext) + Input B (ansikte/hår-närbild). */
export interface SketchSource {
  /** 'pose' = Input A (silhuett/kontext), 'face' = Input B (igenkännings-närbild). */
  role: 'pose' | 'face';
  /** Var bilden kommer ifrån. admin-upload = hand-kurerad peak-frame (default). */
  origin: 'admin-upload' | 'wikimedia-commons' | 'archival' | 'youtube-grab';
  /** Sökfrågor för Commons/research-hjälpen (peak-career-formulerade). */
  searchQueries: string[];
  /** Sätts när källan valts/laddats upp (path eller URL). */
  uri?: string;
  notes?: string;
}

/** Edge-receptet (parametrar till backend/sketch/generate.ts `--mode edges --bow`). */
export interface EdgeRecipe {
  mode: 'edges';
  bow: true; // black-on-white för Q-mask
  vignette: 'none';
  /** CLAHE lyfter svaga ansiktsgradienter (lokal kontrast). */
  clahe: boolean;
  /** 1.0 = full ljusstyrka pre-negate → rena svarta linjer. */
  greyScale: number;
  /** Linje-mjukning; 0.3 = skarpt. */
  softenSigma: number;
  /** Levels (a, b) efter negate som trycker svagt brus → vitt, behåller mörka linjer. */
  noiseClean: [number, number];
  /** Logo-mask: normaliserade (0–1) ellipser som målas rent vita (märken bort). */
  maskEllipses?: { cx: number; cy: number; rx: number; ry: number }[];
}

/** 3-fas-reveal (matchar src/components/SketchCanvas.tsx). */
export interface RevealPhases {
  driver: 'opacity';
  /** Andel av svarstiden reveal:en pågår, per assistance-nivå. */
  fractionByAssistance: Record<'full' | 'standard' | 'minimal', number>;
  phases: { name: string; toOpacity: number; note: string }[];
  /** Reveal:en fortsätter till 100 % även efter att spelaren låst sitt svar. */
  continuesAfterAnswerLock: true;
}

export interface SketchQuestionBlueprint {
  id: string;
  displayName: string;
  contentForm: 'image';
  contentSubject: SketchSubject;
  mainCategory: MainCategory;
  /** Peak-career-era (curation-hint, inte spelarsynlig). */
  era: string;
  /**
   * Styr face-vs-context-prioritet (se memory project_sketch_face_vs_context):
   *  - false (porträtt, ingen specifik händelse) → ANSIKTET prioriteras, kräver
   *    ren högupplöst ansiktskälla (Input B). Mjukt ansikte ej acceptabelt.
   *  - true  (känd historisk händelse, personen huvudperson) → kontext/silhuett
   *    bär igenkänningen, mjukare ansikte OK ("iconicity over resolution").
   */
  eventTied: boolean;
  engine: SketchEngine;
  sources: SketchSource[];
  recipe: EdgeRecipe;
  reveal: RevealPhases;
  asset: {
    path: string;
    format: 'webp';
    bg: 'white';
    polarity: 'black-on-white';
  };
  answerMethods: 'name-letters'[];
}

// --- PoC-instans: Carlos Valderrama (peak 1990-tal) ---------------------------

export const VALDERRAMA_BLUEPRINT: SketchQuestionBlueprint = {
  id: 'carlos-valderrama',
  displayName: 'Carlos Valderrama',
  contentForm: 'image',
  contentSubject: 'athlete',
  mainCategory: 'Sport',
  era: '1990-tal, peak — gul Colombia #10, massiv blond afro + mustasch',
  // Vanligt kit-porträtt, INTE knutet till en specifik historisk händelse →
  // ansiktet är enda igenkänningssignalen → Input B (ren ansiktskälla) krävs.
  eventTied: false,
  engine: 'edges',
  sources: [
    {
      role: 'face', // Input B — KRÄVS eftersom item är icke-event (face-vs-context-regeln)
      origin: 'admin-upload',
      searchQueries: [
        'Carlos Valderrama 1990 Colombia close-up face portrait',
        'Valderrama afro mustache front-facing 1994 World Cup high resolution',
        'El Pibe Valderrama peak career headshot yellow jersey',
      ],
      notes:
        'Ren, högupplöst, frontal närbild. Nuvarande assets/quiz-images/valderrama-test.jpg ' +
        'är för lågupplöst (40 KB) → ansiktet blir otydligt. Ersätt med admin-uppladdad peak-frame.',
    },
    {
      role: 'pose', // Input A — silhuett/kontext (afron + #10 på plan)
      origin: 'admin-upload',
      searchQueries: [
        'Carlos Valderrama Colombia 1990 World Cup on pitch yellow #10 full body',
        'Valderrama dribbling 1994 peak career action shot',
      ],
      notes:
        'Peak-pose i gul #10 — den massiva afro-silhuetten är den starkaste ' +
        'igenkänningssignalen och bär fas 1 av reveal:en.',
    },
  ],
  recipe: {
    mode: 'edges',
    bow: true,
    vignette: 'none',
    clahe: true,
    greyScale: 1.0,
    softenSigma: 0.3,
    noiseClean: [2.0, -130],
    // Colombia-förbundsmärke + le coq sportif-logga → rent vita. Tröjnumret "10"
    // BEHÅLLS (ej varumärke, viktig ledtråd). Koordinater sätts mot den valda
    // peak-källan (komposition-beroende) — exempelvärden mot test.jpg nedan.
    maskEllipses: [
      { cx: 0.62, cy: 0.58, rx: 0.07, ry: 0.06 }, // förbundsmärke (bröst)
    ],
  },
  reveal: {
    driver: 'opacity',
    fractionByAssistance: { full: 0.25, standard: 0.5, minimal: 0.75 },
    phases: [
      {
        name: 'Phase 1 — silhouette',
        toOpacity: 0.28,
        note: 'Massiv afro-silhuett anas faint; fin detalj washas ut.',
      },
      {
        name: 'Phase 2 — detail',
        toOpacity: 0.6,
        note: 'Sekundära linjer + tröjnummer "10" + krage injiceras.',
      },
      {
        name: 'Phase 3 — sharp',
        toOpacity: 1.0,
        note: '100 % skärpa — ansikte, mustasch, afro fullt definierade.',
      },
    ],
    continuesAfterAnswerLock: true,
  },
  asset: {
    // Producerad via: npm run sketch-generate -- --ref <peak-face-källa> \
    //   --id carlos-valderrama --era "1990s" --category athlete \
    //   --mode edges --bow --mask "0.62,0.58,0.07,0.06" --displayName "Carlos Valderrama"
    path: 'assets/quiz-sketches/carlos-valderrama.webp',
    format: 'webp',
    bg: 'white',
    polarity: 'black-on-white',
  },
  answerMethods: ['name-letters'],
};

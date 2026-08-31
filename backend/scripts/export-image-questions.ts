// Genererar src/utils/quizImageQuestions.ts med MINIMAL per-item-metadata
// + en distractor-pool-export (per category). Klienten bygger Letter Grid /
// Name Options / Full-Names-listan runtime via src/utils/imageQuestionBuilder.ts.
//
// Refactor 2026-05-27: tidigare pre-bakade 3 varianter per item (prefix-1,
// prefix-2, full-names) → ~11 KB/item × 777 items = 8.5 MB JS. Det blev tungt
// att parsa vid app-start på äldre devices. Nu skickar vi bara metadata
// (~200 bytes/item) + distractor-pool — total reduktion ~95%.
//
// MVP-noteringar:
//   • Ålder-baserad full-names-override (born 2016+ → forced full-names) körs
//     INTE klient-side ännu — kräver att getLetterGridConfig anropas i quiz.tsx
//     vid variant-val.
//
// Kör: cd backend && npx tsx scripts/export-image-questions.ts

import * as fs from 'fs';
import * as path from 'path';
import { loadCatalog, findItemsById } from '../content/registry';
import {
  Audience,
  Category,
  ContentSubject,
  FIXED_QUESTION_TEXT,
} from '../content/schema';
import { loadDistractorPool } from '../content/distractor-pool';
import { HINTS_LIBRARY } from '../../src/utils/hintsData';
import { meetsHintsThreshold, MIN_RAW_HINTS, MIN_RENDER_ENTRIES } from '../../src/utils/hintsText';

const OUTPUT_PATH = path.join(
  __dirname,
  '..',
  '..',
  'src',
  'utils',
  'quizImageQuestions.ts',
);

interface ExportedQuestion {
  id: string;
  displayName: string;
  category: Category;
  contentSubject: ContentSubject;
  correctYear?: number;
  peakFrom?: number;
  peakTo?: number;
  audiences: Audience[];
  /** Region-hierarki global ⊃ europe ⊃ nordic ⊃ land. Item-level overridar
   *  fil-headern. Sedan 2026-08-11 ENDA källan för bild-items region —
   *  HINTS_REGION_MAP:s region-roll är retirerad. */
  region: string[];
  questionText: string;
  /** Item-HCP (§4.1) = katalogens probability (0–100). Driver klientens
   *  HCP-frågefilter: item valbart om itemHcp >= spelarens HCP. */
  itemHcp: number;
}


function buildExportedQuestion(
  itemId: string,
  catalog: ReturnType<typeof loadCatalog>,
): ExportedQuestion | null {
  const matches = findItemsById(catalog, itemId);
  if (matches.length === 0) {
    console.warn(`  Item not found in catalog: ${itemId} — skipping`);
    return null;
  }

  // Items kan finnas i flera filer (t.ex. Cristiano i både gen-z och gen-alpha).
  // Samla unionen av audiences från alla träffar och plocka category +
  // contentSubject från första träffen (alltid samma per item-id om duplicerad).
  // Item-level audience-override per fil-träff har företräde.
  const audiencesSet = new Set<Audience>();
  // Region unionen över alla träffar, samma princip som audience.
  // Migrationen 2026-08-11 skrev identisk region till alla kopior av ett id,
  // så unionen är i praktiken ett enda värde — men union är rätt semantik
  // om en framtida curation låter kopiorna gå isär.
  const regionSet = new Set<string>();
  let category: Category | null = null;
  let contentSubject: ContentSubject | null = null;
  for (const match of matches) {
    const file = catalog.files.get(match.filename);
    if (!file) continue;
    if (!category) category = file.category;
    if (!contentSubject) contentSubject = file.contentSubject;
    const effectiveAudience = match.item.audience ?? file.audience;
    for (const a of effectiveAudience) audiencesSet.add(a);
    for (const r of match.item.region ?? file.region) regionSet.add(r);
  }
  if (!category || !contentSubject) return null;

  const item = matches[0].item;

  return {
    id: item.id,
    displayName: item.displayName,
    category,
    contentSubject,
    ...(item.correctYear !== undefined ? { correctYear: item.correctYear } : {}),
    ...(item.peakFrom !== undefined ? { peakFrom: item.peakFrom } : {}),
    ...(item.peakTo !== undefined ? { peakTo: item.peakTo } : {}),
    audiences: Array.from(audiencesSet),
    region: Array.from(regionSet),
    questionText: FIXED_QUESTION_TEXT[contentSubject],
    // Item-HCP (§4.1) = curator-satt probability (0–100).
    itemHcp: item.probability,
  };
}

function renderTsModule(
  questions: ExportedQuestion[],
  distractorPool: Partial<Record<Category, string[]>>,
): string {
  return `// Auto-generated. Regenerate with: cd backend && npx tsx scripts/export-image-questions.ts
//
// Image-frågor (minimal metadata per item). Letter Grid + Final Selection +
// Full-Names-lista byggs RUNTIME via src/utils/imageQuestionBuilder.ts —
// se buildImageVariant(item, assistance, audienceSet, IMAGE_QUIZ_QUESTIONS,
// DISTRACTOR_POOL_NAMES[item.category] ?? []).

export type ImageQuestionAudience =
  | 'elder'
  | 'gen-x'
  | 'millennials'
  | 'gen-z'
  | 'gen-alpha'
  | 'all';

export interface ImagePrefixOption {
  prefix: string;
  isCorrect: boolean;
}

export interface ImageNameOption {
  itemId: string;
  displayName: string;
  isCorrect: boolean;
  source: 'catalog' | 'pool';
}

export interface ImagePrefixVariant {
  mode: 'prefix';
  prefixLength: number;
  letterGrid: ImagePrefixOption[];
  optionsByPrefix: Record<string, ImageNameOption[]>;
  correctPrefix: string;
}

export interface ImageFullNamesVariant {
  mode: 'full-names';
  /** ~10 namn med exakt en isCorrect=true. */
  nameList: ImageNameOption[];
}

export type ImageQuestionVariant = ImagePrefixVariant | ImageFullNamesVariant;

export type ImageVariantKey = 'prefix-1' | 'prefix-2' | 'full-names';

export type ImageContentSubject =
  | 'artist'
  | 'band'
  | 'actor'
  | 'character'
  | 'athlete'
  | 'cultural-person'
  | 'celebrity'
  | 'city'
  | 'country'
  | 'place';

export type ImageCategory =
  | 'persons'
  | 'capitals'
  | 'artists'
  | 'songs'
  | 'actors'
  | 'sport';

export interface ImageQuizQuestion {
  id: string;
  displayName: string;
  category: ImageCategory;
  contentSubject: ImageContentSubject;
  /** Året som "rätt svar". Optional — items utan correctYear OCH peak
   *  (t.ex. capitals) är era-agnostiska. */
  correctYear?: number;
  /** Peak-recognition-fönster. När båda definierade använder era-filtret
   *  interval-overlap mot host:s era-spann. */
  peakFrom?: number;
  peakTo?: number;
  /** Vilka generationer item:t passar för (driver per-spelare-pool på klienten). */
  audiences: ImageQuestionAudience[];
  /** Region-hierarki global ⊃ europe ⊃ nordic ⊃ land — se src/utils/regionScope.ts.
   *  'unknown-region' når ingen spelare. */
  region: string[];
  questionText: string;
  /** Item-HCP (§4.1) = katalogens probability (0–100). Klientens HCP-filter
   *  väljer item om itemHcp >= spelarens HCP (relaxas om poolen blir för tunn). */
  itemHcp: number;
}

export const IMAGE_QUIZ_QUESTIONS: ImageQuizQuestion[] = ${JSON.stringify(questions, null, 2)};

/** Distractor-pool per category — fallback-namn när katalog-poolen är för
 *  tunn för att fylla Letter Grid eller Final Selection. */
export const DISTRACTOR_POOL_NAMES: Partial<Record<ImageCategory, string[]>> =
  ${JSON.stringify(distractorPool, null, 2)};

/** Filtrera frågor som passar en specifik spelar-generation. */
export function getImageQuestionsForGeneration(
  generation: ImageQuestionAudience,
): ImageQuizQuestion[] {
  return IMAGE_QUIZ_QUESTIONS.filter(
    (q) => q.audiences.includes(generation) || q.audiences.includes('all'),
  );
}
`;
}

/**
 * Katalog-items som har ett tillräckligt spelbart hints-bibliotek.
 *
 * Gaten (se meetsHintsThreshold i hintsText.ts, delad med quiz.tsx:s runtime-
 * filter): rått antal ledtrådar ≥ MIN_RAW_HINTS (10), ELLER — om ledtrådarna
 * grupperar snyggt under rubriker (Birth/Career History/Film History/Titles/
 * Trophies) — ≥ MIN_RENDER_ENTRIES (5) topp-nivå-bullets. Peter 2026-08-27:
 * ett item med få råa fakta som ändå grupperar (t.ex. Birth + Career History
 * + Trophies = 3 grupper av 7 fakta) kan vara lika spelbart som ett med 10
 * lösa fakta.
 *
 * ⚠ Urvalet gick t.o.m. 2026-08-17 på "har en webp i assets/quiz-images/".
 * Det var en kvarleva: sedan person-bilderna parkerades juridiskt renderar en
 * "image"-fråga bara flagga + ledtrådar (HintsQuizCard) och rör aldrig
 * bildfilen. Webp-listan höll därför tyst nytt hints-innehåll utanför poolen
 * (6 golfare + 2 fotbollsspelare 2026-08-12) OCH släppte samtidigt in ~560
 * bildlösa items som klienten ändå kastade. Hints-biblioteket ÄR urvalet nu —
 * assets/quiz-images/ är raderad. Lägg inte tillbaka ett filsystem-beroende.
 */
function listHintItemIds(catalog: ReturnType<typeof loadCatalog>): string[] {
  const ids = new Set<string>();
  for (const file of catalog.files.values()) {
    if (file.contentForm !== 'image') continue;
    for (const item of file.items) {
      if (meetsHintsThreshold(HINTS_LIBRARY[item.id], item.displayName)) ids.add(item.id);
    }
  }
  return [...ids].sort();
}

async function main(): Promise<void> {
  const catalog = loadCatalog();
  const ids = listHintItemIds(catalog);
  console.log(`Found ${ids.length} image items with >= ${MIN_RAW_HINTS} hints (or >= ${MIN_RENDER_ENTRIES} grouped entries)`);

  const questions: ExportedQuestion[] = [];
  for (const id of ids) {
    const q = buildExportedQuestion(id, catalog);
    if (q) questions.push(q);
  }

  const pool = loadDistractorPool();

  await fs.promises.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.promises.writeFile(OUTPUT_PATH, renderTsModule(questions, pool.names));
  console.log(`\nWrote ${questions.length} questions to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});

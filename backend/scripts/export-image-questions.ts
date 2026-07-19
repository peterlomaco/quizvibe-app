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

const ASSETS_DIR = path.join(__dirname, '..', '..', 'assets', 'quiz-images');
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
  questionText: string;
}

function listLocalImageIds(): string[] {
  if (!fs.existsSync(ASSETS_DIR)) {
    throw new Error(`assets/quiz-images/ does not exist: ${ASSETS_DIR}`);
  }
  return fs
    .readdirSync(ASSETS_DIR)
    .filter((f) => f.endsWith('.webp'))
    .map((f) => f.replace(/\.webp$/, ''))
    .sort();
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
  let category: Category | null = null;
  let contentSubject: ContentSubject | null = null;
  for (const match of matches) {
    const file = catalog.files.get(match.filename);
    if (!file) continue;
    if (!category) category = file.category;
    if (!contentSubject) contentSubject = file.contentSubject;
    const effectiveAudience = match.item.audience ?? file.audience;
    for (const a of effectiveAudience) audiencesSet.add(a);
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
    questionText: FIXED_QUESTION_TEXT[contentSubject],
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
  questionText: string;
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

async function main(): Promise<void> {
  const catalog = loadCatalog();
  const ids = listLocalImageIds();
  console.log(`Found ${ids.length} local images in assets/quiz-images/`);

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

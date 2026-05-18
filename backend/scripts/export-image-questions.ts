// Genererar src/utils/quizImageQuestions.ts med pre-baked Letter Grid +
// name-options för alla items vi har en lokal bild för (assets/quiz-images/*).
//
// Per-spelare-config (assistance-baserad prefix-length): tre varianter
// genereras per item (prefix-1 / prefix-2 / prefix-3). Klienten väljer rätt
// variant runtime baserat på aktuell spelares assistance:
//   • full      → prefix-3 (mest hjälp, smal pool)
//   • standard  → prefix-2
//   • minimal   → prefix-1 (minst hjälp, bred pool)
//
// MVP-förenklingar:
//   • Distractor-pool genereras med Millennials som playerGeneration. Klienten
//     ser samma items oavsett egen generation (audience-filter inte aktivt).
//   • Full-names-mode (Gen Alpha 2016+) skippad — annorlunda UI-shape kräver
//     separat refactor av ImageAnswerBlock.
//
// Kör: cd backend && npx tsx scripts/export-image-questions.ts

import * as fs from 'fs';
import * as path from 'path';
import { loadCatalog, findItemsById } from '../content/registry';
import { Audience, Category } from '../content/schema';
import {
  buildLetterGrid,
  buildNameOptions,
  getPrefixForItem,
  PrefixOption,
  NameOption,
} from '../content/distractors';

// MVP: distractor-pool simuleras som om spelaren är Millennials. Pool-strategin
// faller tillbaka till hela kategorin om generations-poolen är liten, så
// effekten är mild — utvidga vid riktig audience-filter-implementering.
const BASELINE_GENERATION = 'millennials' as const;

const VARIANT_PREFIX_LENGTHS = [1, 2, 3] as const;
type VariantKey = `prefix-${(typeof VARIANT_PREFIX_LENGTHS)[number]}`;

const ASSETS_DIR = path.join(__dirname, '..', '..', 'assets', 'quiz-images');
const OUTPUT_PATH = path.join(
  __dirname,
  '..',
  '..',
  'src',
  'utils',
  'quizImageQuestions.ts',
);

interface ExportedVariant {
  prefixLength: number;
  letterGrid: PrefixOption[];
  optionsByPrefix: Record<string, NameOption[]>;
  correctPrefix: string;
}

interface ExportedQuestion {
  id: string;
  displayName: string;
  category: Category;
  /** Året som "rätt svar" — för fallback-era-filtrering när peak saknas
   *  och som svar i timeline-frågor. För artister = födelseår; för
   *  band = formation-år; för musik-spår = utgivningsår. */
  correctYear: number;
  /** Peak-recognition-fönster (åren item:t var som mest känt). När
   *  båda är definierade använder quiz.tsx interval-overlap mot host:s
   *  era-spann (semantiskt rättare än correctYear för artister, vars
   *  födelseår sällan är när de var populära). Saknas → correctYear-
   *  fallback. */
  peakFrom?: number;
  peakTo?: number;
  /** Vilka generationer item:t passar för (driver per-spelare-pool på klienten). */
  audiences: Audience[];
  questionText: string;
  variants: Record<VariantKey, ExportedVariant>;
}

function questionTextFor(category: Category): string {
  switch (category) {
    case 'persons':
      return 'What is the name of this person?';
    case 'capitals':
      return 'What is the name of this place?';
    case 'artists':
      return 'What is the name of this artist?';
    case 'songs':
      return 'What is the name of this song?';
  }
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

function buildVariant(
  catalog: ReturnType<typeof loadCatalog>,
  category: Category,
  item: ReturnType<typeof findItemsById>[number]['item'],
  prefixLength: number,
): ExportedVariant {
  const letterGrid = buildLetterGrid({
    catalog,
    category,
    playerGeneration: BASELINE_GENERATION,
    correctItem: item,
    prefixLength,
  });
  const correctPrefix = getPrefixForItem(item.displayName, prefixLength);
  const optionsByPrefix: Record<string, NameOption[]> = {};
  for (const opt of letterGrid) {
    optionsByPrefix[opt.prefix] = buildNameOptions({
      catalog,
      category,
      playerGeneration: BASELINE_GENERATION,
      correctItem: item,
      selectedPrefix: opt.prefix,
      prefixLength,
    });
  }
  return { prefixLength, letterGrid, optionsByPrefix, correctPrefix };
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
  // Samla unionen av audiences från alla träffar och plocka category från
  // första träffen (alltid samma per item-id om duplicerad).
  const audiencesSet = new Set<Audience>();
  let category: Category | null = null;
  for (const match of matches) {
    const file = catalog.files.get(match.filename);
    if (!file) continue;
    if (!category) category = file.category;
    for (const a of file.audience) audiencesSet.add(a);
  }
  if (!category) return null;

  const item = matches[0].item;

  // Era-filtreringen i quiz.tsx kräver correctYear — items utan blir
  // omöjliga att inkludera i pool-byggandet eftersom det aldrig kan
  // matcha host:s eraFrom/eraTo. Skippa hellre än att bryta klientens
  // type-kontrakt.
  if (item.correctYear === undefined) {
    console.warn(`  Item ${itemId} missing correctYear — skipping`);
    return null;
  }

  const variants = {} as Record<VariantKey, ExportedVariant>;
  for (const len of VARIANT_PREFIX_LENGTHS) {
    variants[`prefix-${len}` as VariantKey] = buildVariant(
      catalog,
      category,
      item,
      len,
    );
  }

  return {
    id: item.id,
    displayName: item.displayName,
    category,
    // Garanterat definierat efter skip-check ovan.
    correctYear: item.correctYear!,
    // peak-fälten är optional i schema — utelämna helt ur exporten när
    // de saknas så generated JSON inte växer med null-rader.
    ...(item.peakFrom !== undefined ? { peakFrom: item.peakFrom } : {}),
    ...(item.peakTo !== undefined ? { peakTo: item.peakTo } : {}),
    audiences: Array.from(audiencesSet),
    questionText: questionTextFor(category),
    variants,
  };
}

function renderTsModule(questions: ExportedQuestion[]): string {
  return `// Auto-generated. Regenerate with: cd backend && npx tsx scripts/export-image-questions.ts
//
// Pre-baked image-frågor för quiz-flow. Varje item har tre varianter pre-bakade
// för olika assistance-nivåer: prefix-1 (minimal) / prefix-2 (standard) /
// prefix-3 (full). Klienten väljer variant runtime via
// pickImageQuestionVariant(question, assistance).

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

export interface ImageQuestionVariant {
  prefixLength: number;
  letterGrid: ImagePrefixOption[];
  optionsByPrefix: Record<string, ImageNameOption[]>;
  correctPrefix: string;
}

export type ImageVariantKey = 'prefix-1' | 'prefix-2' | 'prefix-3';

export interface ImageQuizQuestion {
  id: string;
  displayName: string;
  category: 'persons' | 'capitals' | 'artists' | 'songs';
  /** Året som "rätt svar" — driver fallback-era-filtrering när peak
   *  saknas och visas i timeline-frågors reveal. För artister = födelseår;
   *  band = formation-år; musik-spår = utgivningsår. */
  correctYear: number;
  /** Peak-recognition-fönster (åren item:t var som mest känt). När
   *  båda definierade använder era-filtret interval-overlap mot host:s
   *  era-spann. Saknas → correctYear-fallback. */
  peakFrom?: number;
  peakTo?: number;
  audiences: ImageQuestionAudience[];
  questionText: string;
  variants: Record<ImageVariantKey, ImageQuestionVariant>;
}

export const IMAGE_QUIZ_QUESTIONS: ImageQuizQuestion[] = ${JSON.stringify(questions, null, 2)};

/** Mappa spelarens assistance till rätt pre-baked variant. */
export function pickImageQuestionVariant(
  question: ImageQuizQuestion,
  assistance: 'minimal' | 'standard' | 'full',
): ImageQuestionVariant {
  const key: ImageVariantKey =
    assistance === 'full'
      ? 'prefix-3'
      : assistance === 'minimal'
        ? 'prefix-1'
        : 'prefix-2';
  return question.variants[key];
}

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
    console.log(`  Processing ${id}…`);
    const q = buildExportedQuestion(id, catalog);
    if (q) questions.push(q);
  }

  await fs.promises.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.promises.writeFile(OUTPUT_PATH, renderTsModule(questions));
  console.log(`\nWrote ${questions.length} questions to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});

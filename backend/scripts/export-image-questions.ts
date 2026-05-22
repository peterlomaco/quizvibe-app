// Genererar src/utils/quizImageQuestions.ts med pre-baked Letter Grid +
// name-options för alla items vi har en lokal bild för (assets/quiz-images/*).
//
// Per-spelare-variant baserat på assistance:
//   • full      → full-names (mest hjälp = se hela namnet, ingen prefix)
//   • standard  → prefix-2  (2-bokstavs prefix)
//   • minimal   → prefix-1  (1-bokstavs prefix, bredast prefix-pool)
//
// MVP-förenklingar:
//   • Distractor-pool genereras med Millennials som playerGeneration. Klienten
//     ser samma items oavsett egen generation (audience-filter inte aktivt).
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
import {
  buildLetterGrid,
  buildNameOptions,
  buildFullNamesList,
  getPrefixForItem,
  PrefixOption,
  NameOption,
} from '../content/distractors';

// MVP: distractor-pool simuleras som om spelaren är Millennials. Pool-strategin
// faller tillbaka till hela kategorin om generations-poolen är liten, så
// effekten är mild — utvidga vid riktig audience-filter-implementering.
const BASELINE_GENERATION = 'millennials' as const;

const PREFIX_LENGTHS = [1, 2] as const;
type PrefixVariantKey = `prefix-${(typeof PREFIX_LENGTHS)[number]}`;
type VariantKey = PrefixVariantKey | 'full-names';

const ASSETS_DIR = path.join(__dirname, '..', '..', 'assets', 'quiz-images');
const OUTPUT_PATH = path.join(
  __dirname,
  '..',
  '..',
  'src',
  'utils',
  'quizImageQuestions.ts',
);

interface ExportedPrefixVariant {
  mode: 'prefix';
  prefixLength: number;
  letterGrid: PrefixOption[];
  optionsByPrefix: Record<string, NameOption[]>;
  correctPrefix: string;
}

interface ExportedFullNamesVariant {
  mode: 'full-names';
  /** ~10 namn med exakt en isCorrect=true; ordning slumpad vid export. */
  nameList: NameOption[];
}

type ExportedVariant = ExportedPrefixVariant | ExportedFullNamesVariant;

interface ExportedQuestion {
  id: string;
  displayName: string;
  category: Category;
  /** Subject från katalogens contentSubject — driver frågetext-lookup. */
  contentSubject: ContentSubject;
  /** Året som "rätt svar" — för fallback-era-filtrering när peak saknas.
   *  För artister = födelseår; för band = formation-år; för musik-spår
   *  = utgivningsår. **Optional** — items utan både correctYear OCH
   *  peakFrom/peakTo (t.ex. capitals) är era-agnostiska och inkluderas
   *  i alla eras. */
  correctYear?: number;
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

function buildPrefixVariant(
  catalog: ReturnType<typeof loadCatalog>,
  category: Category,
  item: ReturnType<typeof findItemsById>[number]['item'],
  prefixLength: number,
): ExportedPrefixVariant {
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
  return {
    mode: 'prefix',
    prefixLength,
    letterGrid,
    optionsByPrefix,
    correctPrefix,
  };
}

function buildFullNamesVariant(
  catalog: ReturnType<typeof loadCatalog>,
  category: Category,
  item: ReturnType<typeof findItemsById>[number]['item'],
): ExportedFullNamesVariant {
  const nameList = buildFullNamesList({
    catalog,
    category,
    playerGeneration: BASELINE_GENERATION,
    correctItem: item,
  });
  return { mode: 'full-names', nameList };
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
  const audiencesSet = new Set<Audience>();
  let category: Category | null = null;
  let contentSubject: ContentSubject | null = null;
  for (const match of matches) {
    const file = catalog.files.get(match.filename);
    if (!file) continue;
    if (!category) category = file.category;
    if (!contentSubject) contentSubject = file.contentSubject;
    for (const a of file.audience) audiencesSet.add(a);
  }
  if (!category || !contentSubject) return null;

  const item = matches[0].item;

  // correctYear är optional för image-frågor. Items utan correctYear OCH utan
  // peakFrom/peakTo (t.ex. capitals) är era-agnostiska — runtime-filtret
  // i quiz.tsx inkluderar dem i alla eras. Items med endast peak räknar
  // overlap mot host:s era utan att behöva correctYear.

  const variants = {} as Record<VariantKey, ExportedVariant>;
  for (const len of PREFIX_LENGTHS) {
    variants[`prefix-${len}` as PrefixVariantKey] = buildPrefixVariant(
      catalog,
      category,
      item,
      len,
    );
  }
  variants['full-names'] = buildFullNamesVariant(catalog, category, item);

  return {
    id: item.id,
    displayName: item.displayName,
    category,
    contentSubject,
    // Utelämna optional-fält helt när de saknas så generated JSON
    // inte växer med null-rader.
    ...(item.correctYear !== undefined ? { correctYear: item.correctYear } : {}),
    ...(item.peakFrom !== undefined ? { peakFrom: item.peakFrom } : {}),
    ...(item.peakTo !== undefined ? { peakTo: item.peakTo } : {}),
    audiences: Array.from(audiencesSet),
    questionText: FIXED_QUESTION_TEXT[contentSubject],
    variants,
  };
}

function renderTsModule(questions: ExportedQuestion[]): string {
  return `// Auto-generated. Regenerate with: cd backend && npx tsx scripts/export-image-questions.ts
//
// Pre-baked image-frågor för quiz-flow. Tre varianter per item:
//   prefix-1   → Minimal assistance (1-bokstavs prefix-läge)
//   prefix-2   → Standard assistance (2-bokstavs prefix-läge)
//   full-names → Full assistance (ingen prefix; visa hela namnet direkt)
// Klienten väljer variant runtime via pickImageQuestionVariant(question, assistance).

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
  /** ~10 namn med exakt en isCorrect=true; ordning slumpad vid export. */
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

export interface ImageQuizQuestion {
  id: string;
  displayName: string;
  category: 'persons' | 'capitals' | 'artists' | 'songs' | 'actors' | 'athletes';
  contentSubject: ImageContentSubject;
  /** Året som "rätt svar" — driver fallback-era-filtrering när peak
   *  saknas. För artister = födelseår; band = formation-år; musik-spår =
   *  utgivningsår. **Optional** — items utan både correctYear OCH peak
   *  (t.ex. capitals/städer) är era-agnostiska och inkluderas i alla eras. */
  correctYear?: number;
  /** Peak-recognition-fönster (åren item:t var som mest känt). När
   *  båda definierade använder era-filtret interval-overlap mot host:s
   *  era-spann. Saknas → correctYear-fallback (eller era-agnostiskt om
   *  båda saknas). */
  peakFrom?: number;
  peakTo?: number;
  audiences: ImageQuestionAudience[];
  questionText: string;
  variants: Record<ImageVariantKey, ImageQuestionVariant>;
}

export const IMAGE_QUIZ_QUESTIONS: ImageQuizQuestion[] = ${JSON.stringify(questions, null, 2)};

/** Mappa spelarens assistance till rätt pre-baked variant.
 *  Full → full-names (mest hjälp = se hela namnet, ingen prefix-pussel).
 *  Standard → prefix-2 (2-bokstavs prefix-läge).
 *  Minimal → prefix-1 (1-bokstavs prefix-läge).
 *
 *  Tar bara \`question.variants\` (Record) som arg så call-sites kan passera
 *  egna domän-typer (quiz.tsx:s lokala \`ImageQuestion\`-shape) utan att
 *  strukturellt matcha hela ImageQuizQuestion.
 */
export function pickImageQuestionVariant(
  variants: Record<ImageVariantKey, ImageQuestionVariant>,
  assistance: 'minimal' | 'standard' | 'full',
): ImageQuestionVariant {
  const key: ImageVariantKey =
    assistance === 'full'
      ? 'full-names'
      : assistance === 'minimal'
        ? 'prefix-1'
        : 'prefix-2';
  return variants[key];
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

// Runtime-generation av image-fråge-varianter (Letter Grid + Final Selection
// + Full-Names-lista). Tidigare pre-bakad i quizImageQuestions.ts vid export-tid
// (~11 KB/item × 777 items = 8.5 MB JS). Nu skickar exporten bara minimal data
// per item — varianten byggs runtime när frågan väljs. Spar ~95% av filstorleken
// utan synlig perf-kostnad (~5-10 ms/fråga).
//
// Direkt port av backend/content/distractors.ts. Hålls strukturellt identisk
// med backend så audit-passes (unit-tester över algoritmen) kan jämföras.

import type {
  IMAGE_QUIZ_QUESTIONS,
  DISTRACTOR_POOL_NAMES,
  ImageContentSubject,
  ImageQuestionAudience,
  ImageQuizQuestion,
  ImageQuestionVariant,
  ImagePrefixVariant,
  ImageFullNamesVariant,
  ImagePrefixOption,
  ImageNameOption,
} from './quizImageQuestions';

export type AssistanceLevel = 'minimal' | 'standard' | 'full';

export const DEFAULT_TOTAL_OPTIONS = 10;

/**
 * Extrahera prefix från ett item:s displayName. Direkt port av
 * `backend/content/distractors.ts:getPrefixForItem` — multi-name-regel,
 * diakriter bevarade, uppercase. Splittar på whitespace, tar första `length`
 * bokstäver av varje del, joinas med space.
 */
export function getPrefixForItem(displayName: string, length: number): string {
  return displayName
    .split(/\s+/)
    .map((part) => part.replace(/[^\p{L}]/gu, '').slice(0, length).toUpperCase())
    .filter((p) => p.length > 0)
    .join(' ');
}

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Returnerar items vars audiences överlappar audience-set.
 * OBS: allItems är redan subject-filtrerat av caller (quiz.tsx) —
 * category-filtret är redundant men behålls för bakåtkompatibilitet.
 */
function getCategoryPool(
  allItems: readonly ImageQuizQuestion[],
  category: ImageQuizQuestion['category'],
  audienceSet: ReadonlySet<ImageQuestionAudience>,
): ImageQuizQuestion[] {
  return allItems.filter((item) => {
    if (item.category !== category) return false;
    for (const a of item.audiences) {
      if (audienceSet.has(a) || a === 'all') return true;
    }
    return false;
  });
}

/**
 * Fallback: hela poolen oavsett audience.
 * Returnerar alla items (category-filter är redundant när allItems är subject-filtrerat).
 */
function getCategoryFallbackPool(
  allItems: readonly ImageQuizQuestion[],
  category: ImageQuizQuestion['category'],
): ImageQuizQuestion[] {
  // Returnera alla items — caller har redan filtrerat på subject,
  // så vi vill inte filtrera bort items med annan category-kodning.
  return allItems.filter((item) => item.category === category);
}

interface BuildLetterGridArgs {
  correctItem: ImageQuizQuestion;
  prefixLength: number;
  audienceSet: ReadonlySet<ImageQuestionAudience>;
  allItems: readonly ImageQuizQuestion[];
  distractorNames: readonly string[];
  totalOptions?: number;
  rng?: () => number;
}

/**
 * Bygg Letter Grid (Steg 1). 10 prefix-knappar: 1 rätt + 9 distractors.
 * Pool-strategi (lager för lager tills target nås):
 *   1. Items i samma kategori som matchar audience-set (= union av spelares gens)
 *   2. Items i hela kategorin (oavsett audience)
 *   3. Påhittade namn från distractor-pool
 */
function buildLetterGrid(args: BuildLetterGridArgs): ImagePrefixOption[] {
  const {
    correctItem,
    prefixLength,
    audienceSet,
    allItems,
    distractorNames,
    totalOptions = DEFAULT_TOTAL_OPTIONS,
    rng = Math.random,
  } = args;

  const correctPrefix = getPrefixForItem(correctItem.displayName, prefixLength);
  // Ord-count-filter: distraktorprefixer måste matcha correctPrefix ord-count,
  // annars filtreras de bort av ImageAnswerBlock.sortedGrid.
  const correctWordCount = correctPrefix.split(' ').length;
  // Första-bokstavs-dedup: ImageAnswerBlock.sortedGrid tillåter MAX EN prefix
  // per begynnelsebokstav. Vi speglar regeln här så att vi aldrig slösar
  // ett slot på t.ex. "TH WH" (The Who) när rätt svar är "TH AR" (The Ark)
  // — båda börjar med "T" och den ena skulle tas bort av klienten.
  const seen = new Set<string>([correctPrefix]);
  const usedFirstLetters = new Set<string>([correctPrefix.charAt(0)]);
  const distractors: string[] = [];

  function pickFromPool(pool: readonly ImageQuizQuestion[]): void {
    for (const item of shuffle(pool, rng)) {
      if (item.id === correctItem.id) continue;
      const prefix = getPrefixForItem(item.displayName, prefixLength);
      if (!prefix) continue;
      if (seen.has(prefix)) continue;
      if (prefix.split(' ').length !== correctWordCount) continue;
      if (usedFirstLetters.has(prefix.charAt(0))) continue; // dedup per begynnelsebokstav
      seen.add(prefix);
      usedFirstLetters.add(prefix.charAt(0));
      distractors.push(prefix);
      if (distractors.length >= totalOptions - 1) return;
    }
  }

  function pickFromDistractorPool(): void {
    for (const name of shuffle(distractorNames, rng)) {
      const prefix = getPrefixForItem(name, prefixLength);
      if (!prefix) continue;
      if (seen.has(prefix)) continue;
      if (prefix.split(' ').length !== correctWordCount) continue;
      if (usedFirstLetters.has(prefix.charAt(0))) continue; // dedup per begynnelsebokstav
      seen.add(prefix);
      usedFirstLetters.add(prefix.charAt(0));
      distractors.push(prefix);
      if (distractors.length >= totalOptions - 1) return;
    }
  }

  pickFromPool(getCategoryPool(allItems, correctItem.category, audienceSet));

  if (distractors.length < totalOptions - 1) {
    pickFromPool(getCategoryFallbackPool(allItems, correctItem.category));
  }

  if (distractors.length < totalOptions - 1) {
    pickFromDistractorPool();
  }

  const all: ImagePrefixOption[] = [
    { prefix: correctPrefix, isCorrect: true },
    ...distractors.map((p) => ({ prefix: p, isCorrect: false })),
  ];
  return shuffle(all, rng);
}

interface BuildNameOptionsArgs {
  correctItem: ImageQuizQuestion;
  selectedPrefix: string;
  prefixLength: number;
  audienceSet: ReadonlySet<ImageQuestionAudience>;
  allItems: readonly ImageQuizQuestion[];
  distractorNames: readonly string[];
  totalOptions?: number;
  rng?: () => number;
}

/**
 * Bygg Final Selection (Steg 2) baserat på vilket prefix spelaren klickade.
 * - Om selectedPrefix === correctPrefix: 9 distractors + 1 rätt, blandade.
 * - Om selectedPrefix !== correctPrefix: upp till 10 distractors med matching prefix.
 */
function buildNameOptions(args: BuildNameOptionsArgs): ImageNameOption[] {
  const {
    correctItem,
    selectedPrefix,
    prefixLength,
    audienceSet,
    allItems,
    distractorNames,
    totalOptions = DEFAULT_TOTAL_OPTIONS,
    rng = Math.random,
  } = args;

  const correctPrefix = getPrefixForItem(correctItem.displayName, prefixLength);
  const isCorrectPrefix = selectedPrefix === correctPrefix;
  const targetDistractorCount = isCorrectPrefix ? totalOptions - 1 : totalOptions;

  const seenIds = new Set<string>([correctItem.id]);
  const seenNamesLower = new Set<string>([correctItem.displayName.toLowerCase()]);
  const distractors: ImageNameOption[] = [];

  function collectFromCatalog(pool: readonly ImageQuizQuestion[]): void {
    for (const item of shuffle(pool, rng)) {
      if (distractors.length >= targetDistractorCount) return;
      if (seenIds.has(item.id)) continue;
      const prefix = getPrefixForItem(item.displayName, prefixLength);
      if (prefix !== selectedPrefix) continue;
      seenIds.add(item.id);
      seenNamesLower.add(item.displayName.toLowerCase());
      distractors.push({
        itemId: item.id,
        displayName: item.displayName,
        isCorrect: false,
        source: 'catalog',
      });
    }
  }

  function collectFromDistractorPool(): void {
    for (const name of shuffle(distractorNames, rng)) {
      if (distractors.length >= targetDistractorCount) return;
      const lower = name.toLowerCase();
      if (seenNamesLower.has(lower)) continue;
      const prefix = getPrefixForItem(name, prefixLength);
      if (prefix !== selectedPrefix) continue;
      seenNamesLower.add(lower);
      distractors.push({
        itemId: `pool:${name.toLowerCase().replace(/\s+/g, '-')}`,
        displayName: name,
        isCorrect: false,
        source: 'pool',
      });
    }
  }

  collectFromCatalog(getCategoryPool(allItems, correctItem.category, audienceSet));
  if (distractors.length < targetDistractorCount) {
    collectFromCatalog(getCategoryFallbackPool(allItems, correctItem.category));
  }
  if (distractors.length < targetDistractorCount) {
    collectFromDistractorPool();
  }

  const options: ImageNameOption[] = distractors.slice(0, targetDistractorCount);

  if (isCorrectPrefix) {
    options.push({
      itemId: correctItem.id,
      displayName: correctItem.displayName,
      isCorrect: true,
      source: 'catalog',
    });
  }

  return shuffle(options, rng);
}

interface BuildFullNamesListArgs {
  correctItem: ImageQuizQuestion;
  audienceSet: ReadonlySet<ImageQuestionAudience>;
  allItems: readonly ImageQuizQuestion[];
  distractorNames: readonly string[];
  totalOptions?: number;
  rng?: () => number;
}

/** Bygg fullnamn-lista för Full assistance: 10 namn (1 rätt + 9 distractors). */
function buildFullNamesList(args: BuildFullNamesListArgs): ImageNameOption[] {
  const {
    correctItem,
    audienceSet,
    allItems,
    distractorNames,
    totalOptions = DEFAULT_TOTAL_OPTIONS,
    rng = Math.random,
  } = args;

  const targetDistractorCount = totalOptions - 1;
  const seenIds = new Set<string>([correctItem.id]);
  const seenNamesLower = new Set<string>([correctItem.displayName.toLowerCase()]);
  const distractors: ImageNameOption[] = [];

  function collectFromCatalog(pool: readonly ImageQuizQuestion[]): void {
    for (const item of shuffle(pool, rng)) {
      if (distractors.length >= targetDistractorCount) return;
      if (seenIds.has(item.id)) continue;
      seenIds.add(item.id);
      seenNamesLower.add(item.displayName.toLowerCase());
      distractors.push({
        itemId: item.id,
        displayName: item.displayName,
        isCorrect: false,
        source: 'catalog',
      });
    }
  }

  function collectFromDistractorPool(): void {
    for (const name of shuffle(distractorNames, rng)) {
      if (distractors.length >= targetDistractorCount) return;
      const lower = name.toLowerCase();
      if (seenNamesLower.has(lower)) continue;
      seenNamesLower.add(lower);
      distractors.push({
        itemId: `pool:${name.toLowerCase().replace(/\s+/g, '-')}`,
        displayName: name,
        isCorrect: false,
        source: 'pool',
      });
    }
  }

  collectFromCatalog(getCategoryPool(allItems, correctItem.category, audienceSet));
  if (distractors.length < targetDistractorCount) {
    collectFromCatalog(getCategoryFallbackPool(allItems, correctItem.category));
  }
  if (distractors.length < targetDistractorCount) {
    collectFromDistractorPool();
  }

  const options: ImageNameOption[] = [
    {
      itemId: correctItem.id,
      displayName: correctItem.displayName,
      isCorrect: true,
      source: 'catalog',
    },
    ...distractors,
  ];
  return shuffle(options, rng);
}

/**
 * Build runtime variant för en image-fråga utifrån spelarens assistance:
 *   • full      → full-names (ingen prefix-pussel)
 *   • standard  → prefix-2 (2-bokstavs prefix)
 *   • minimal   → prefix-1 (1-bokstavs prefix)
 *
 * Caller passar `allItems` = hela `IMAGE_QUIZ_QUESTIONS`-listan + `distractorNames`
 * = `DISTRACTOR_POOL_NAMES[correctItem.category]` så samma fil utan extra-imports.
 *
 * `rng` styr all shuffle/urval. Default `Math.random`. Remote 1v1 passar in en
 * seedad RNG (`createSeededRng('<matchId>:<questionId>')`) så båda spelarnas
 * enheter genererar EXAKT samma svarsalternativ i samma ordning — de spelar
 * frågan var för sig utan sync-kanal, så determinism är enda garantin.
 * OBS: identiskt utfall kräver även identisk `audienceSet` (och `assistance`,
 * som styr vilket variant-läge som byggs).
 */
export function buildImageVariant(
  correctItem: ImageQuizQuestion,
  assistance: AssistanceLevel,
  audienceSet: ReadonlySet<ImageQuestionAudience>,
  allItems: readonly ImageQuizQuestion[],
  distractorNames: readonly string[],
  totalOptions: number = DEFAULT_TOTAL_OPTIONS,
  rng: () => number = Math.random,
): ImageQuestionVariant {
  if (assistance === 'full') {
    const nameList = buildFullNamesList({
      correctItem,
      audienceSet,
      allItems,
      distractorNames,
      totalOptions,
      rng,
    });
    return { mode: 'full-names', nameList };
  }

  const prefixLength = assistance === 'minimal' ? 1 : 2;
  const letterGrid = buildLetterGrid({
    correctItem,
    prefixLength,
    audienceSet,
    allItems,
    distractorNames,
    totalOptions,
    rng,
  });
  const correctPrefix = getPrefixForItem(correctItem.displayName, prefixLength);
  const optionsByPrefix: Record<string, ImageNameOption[]> = {};
  for (const opt of letterGrid) {
    optionsByPrefix[opt.prefix] = buildNameOptions({
      correctItem,
      selectedPrefix: opt.prefix,
      prefixLength,
      audienceSet,
      allItems,
      distractorNames,
      totalOptions,
      rng,
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

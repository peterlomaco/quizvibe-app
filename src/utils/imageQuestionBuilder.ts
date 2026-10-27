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
 *
 * MAX TVÅ ORD (Peter 2026-10-15): "Swedish House Mafia" → "SWE HOU", inte
 * "SWE HOU MAF". Prefixet ska rymmas på EN rad i prefix-knappen, och
 * ord-klassen blir därmed 1 eller 2 — så ord-count-filtren nedan och i
 * ImageAnswerBlock betyder "1-ordssvar ↔ 1-ordsalternativ, 2+ ↔ 2+".
 */
export type PrefixMode = 'per-word' | 'leading-letters';

export function getPrefixForItem(
  displayName: string,
  length: number,
  // 'per-word' (Hints, default): `length` bokstäver per ord, max två ord.
  // 'leading-letters' (Spotify/Name, Peter 2026-10-27): de `length` FÖRSTA
  // bokstäverna i namnet, även över ordgränser, med mellanslaget kvar —
  // "Maroon 5 feat. Christina Aguilera" → "MAR", "DJ Snake" → "DJ S".
  // Kortare bara när hela namnet har färre bokstäver ("U2" → "U").
  mode: PrefixMode = 'per-word',
): string {
  const words = displayName
    .split(/\s+/)
    .map((part) => part.replace(/[^\p{L}]/gu, '').toUpperCase())
    .filter((p) => p.length > 0);
  if (mode === 'per-word') {
    return words.map((w) => w.slice(0, length)).slice(0, 2).join(' ');
  }
  const out: string[] = [];
  let remaining = length;
  for (const w of words) {
    if (remaining <= 0) break;
    out.push(w.slice(0, remaining));
    remaining -= Math.min(w.length, remaining);
  }
  return out.join(' ');
}

/** Antal bokstäver i ett prefix (mellanslag räknas inte). */
function prefixLetterCount(prefix: string): number {
  return prefix.replace(/ /g, '').length;
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
  prefixMode?: PrefixMode;
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
    prefixMode = 'per-word',
    audienceSet,
    allItems,
    distractorNames,
    totalOptions = DEFAULT_TOTAL_OPTIONS,
    rng = Math.random,
  } = args;

  const correctPrefix = getPrefixForItem(correctItem.displayName, prefixLength, prefixMode);
  // Ord-count-filter: distraktorprefixer måste matcha correctPrefix ord-count,
  // annars filtreras de bort av ImageAnswerBlock.sortedGrid.
  const correctWordCount = correctPrefix.split(' ').length;
  // För kort prefix = namnet ger inte `prefixLength` tecken. Per ord: första
  // ordet för kort. Ledande bokstäver: hela namnet har för få bokstäver.
  const isShortPrefix = (p: string): boolean =>
    prefixMode === 'per-word' ? p.split(' ')[0].length < prefixLength : prefixLetterCount(p) < prefixLength;
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
      const prefix = getPrefixForItem(item.displayName, prefixLength, prefixMode);
      if (!prefix) continue;
      if (seen.has(prefix)) continue;
      // Ord-klass gäller bara per-ord-läget (Hints) — i ledande-bokstavsläget
      // blandas "DJ S" och "MAR" fritt.
      if (prefixMode === 'per-word' && prefix.split(' ').length !== correctWordCount) continue;
      if (isShortPrefix(prefix)) continue;
      if (usedFirstLetters.has(prefix.charAt(0))) continue; // dedup per begynnelsebokstav
      seen.add(prefix);
      usedFirstLetters.add(prefix.charAt(0));
      distractors.push(prefix);
      if (distractors.length >= totalOptions - 1) return;
    }
  }

  function pickFromDistractorPool(): void {
    for (const name of shuffle(distractorNames, rng)) {
      const prefix = getPrefixForItem(name, prefixLength, prefixMode);
      if (!prefix) continue;
      if (seen.has(prefix)) continue;
      // Ord-klass gäller bara per-ord-läget (Hints) — i ledande-bokstavsläget
      // blandas "DJ S" och "MAR" fritt.
      if (prefixMode === 'per-word' && prefix.split(' ').length !== correctWordCount) continue;
      if (isShortPrefix(prefix)) continue;
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
  prefixMode?: PrefixMode;
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
    prefixMode = 'per-word',
    audienceSet,
    allItems,
    distractorNames,
    totalOptions = DEFAULT_TOTAL_OPTIONS,
    rng = Math.random,
  } = args;

  const correctPrefix = getPrefixForItem(correctItem.displayName, prefixLength, prefixMode);
  const isCorrectPrefix = selectedPrefix === correctPrefix;
  const targetDistractorCount = isCorrectPrefix ? totalOptions - 1 : totalOptions;

  const seenIds = new Set<string>([correctItem.id]);
  const seenNamesLower = new Set<string>([correctItem.displayName.toLowerCase()]);
  const distractors: ImageNameOption[] = [];

  function collectFromCatalog(pool: readonly ImageQuizQuestion[]): void {
    for (const item of shuffle(pool, rng)) {
      if (distractors.length >= targetDistractorCount) return;
      if (seenIds.has(item.id)) continue;
      const prefix = getPrefixForItem(item.displayName, prefixLength, prefixMode);
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
      const prefix = getPrefixForItem(name, prefixLength, prefixMode);
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
 * De prefix-knappar spelaren faktiskt ser — EN källa för ImageAnswerBlock och
 * testerna. Ord-klass- och längdreglerna tillämpas redan i buildLetterGrid
 * (olika per läge, se PrefixMode), så här återstår ett defensivt längdgolv
 * (färre bokstäver än `prefixLength`) + max en knapp per begynnelsebokstav
 * (rätt svar vinner, annars alfabetiskt först). Sorterat A→Ö.
 *
 * RÄTT SVAR FILTRERAS ALDRIG BORT (Peter 2026-10-27): "DJ Snake feat. Justin
 * Bieber" försvann annars helt och spelaren fick 4 alternativ utan rätt svar.
 */
export function visibleLetterGrid(
  letterGrid: readonly ImagePrefixOption[],
  prefixLength: number,
): ImagePrefixOption[] {
  const validOptions = letterGrid.filter((opt) => {
    if (!opt.isCorrect && prefixLetterCount(opt.prefix) < prefixLength) return false;
    return true;
  });

  const byFirstLetter: Record<string, ImagePrefixOption> = {};
  for (const opt of validOptions) {
    const firstLetter = opt.prefix.charAt(0);
    const existing = byFirstLetter[firstLetter];
    if (
      !existing ||
      (opt.isCorrect && !existing.isCorrect) ||
      (opt.isCorrect === existing.isCorrect && opt.prefix.localeCompare(existing.prefix, 'sv') < 0)
    ) {
      byFirstLetter[firstLetter] = opt;
    }
  }
  return Object.values(byFirstLetter).sort((a, b) => a.prefix.localeCompare(b.prefix, 'sv'));
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
  // Opt-in: tvinga prefix-läge med EXAKT denna längd, oavsett assistance —
  // används ENBART av Spotify/Name (Full=3 / Standard=2 / Minimal=1) så de
  // alltid är ett prefix-rutnät (Full ger inget full-names där). Utelämnad →
  // oförändrat beteende (Hints-vägen), så Hints/Film påverkas inte.
  forcePrefixLength?: number,
): ImageQuestionVariant {
  if (forcePrefixLength === undefined && assistance === 'full') {
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

  const prefixLength = forcePrefixLength ?? (assistance === 'minimal' ? 1 : 2);
  // Både Spotify/Name och Hints visar de N första bokstäverna, även över
  // ordgränser (Peter 2026-10-27): "DJ Snake" → "DJ S", "Astrid Lindgren" → "AS".
  // 'per-word' finns kvar i getPrefixForItem men används inte längre här.
  const prefixMode: PrefixMode = 'leading-letters';
  const letterGrid = buildLetterGrid({
    correctItem,
    prefixLength,
    prefixMode,
    audienceSet,
    allItems,
    distractorNames,
    totalOptions,
    rng,
  });
  const correctPrefix = getPrefixForItem(correctItem.displayName, prefixLength, prefixMode);
  const optionsByPrefix: Record<string, ImageNameOption[]> = {};
  for (const opt of letterGrid) {
    optionsByPrefix[opt.prefix] = buildNameOptions({
      correctItem,
      selectedPrefix: opt.prefix,
      prefixLength,
      prefixMode,
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

// Distractor-strategin för Namn-svarsmodellen.
// Bygger Letter Grid-options (Steg 1) och Final Selection-options (Steg 2)
// från content-katalogen. Pure functions — kan unit-testas isolerat.

import { Category, ContentItem } from './schema';
import { LoadedCatalog, findItemsForAudience } from './registry';
import { Generation } from './generation';
import { loadDistractorPool, poolNameToId } from './distractor-pool';

/** Default antal options i både Steg 1 och Steg 2 (motsvarar 5×2-griden i mockup B). */
export const DEFAULT_TOTAL_OPTIONS = 10;

export interface PrefixOption {
  prefix: string;
  isCorrect: boolean;
}

export interface NameOption {
  itemId: string;
  displayName: string;
  isCorrect: boolean;
  /** 'catalog' = riktigt motiv från content-katalogen; 'pool' = fallback-distractor från distractor-pool.yaml. */
  source: 'catalog' | 'pool';
}

/**
 * Extrahera prefix från ett item:s displayName.
 *
 * Multi-name-regel: splittar på whitespace och tar första `length` bokstäver
 * av varje del, joinade med space. Bindestreck inom en del räknas som
 * bokstavs-skiljare men splittar inte (Spider-Man = ett ord). Diakriter
 * (Å, Ä, Ö, Ć etc.) bevaras. Resultatet är uppercase.
 *
 * Konsekvens: multi-name items får längre/striktare prefix vid full assistance,
 * vilket smalnar Step 2-poolen kraftigt — ofta till 1-2 alternativ. Det är
 * by design: Full assistance ska göra svaret nästan givet, Standard/Minimal
 * får bredare pool eftersom kortare prefix per del = fler matchningar.
 *
 * Exempel:
 *   "ABBA", 2              → "AB"
 *   "Madonna", 3           → "MAD"
 *   "Mark Zuckerberg", 2   → "MA ZU"
 *   "Mark Zuckerberg", 3   → "MAR ZUC"
 *   "Cristiano Ronaldo", 3 → "CRI RON"
 *   "Spider-Man", 3        → "SPI"          (bindestreck = ett ord)
 *   "John F. Kennedy", 3   → "JOH F KEN"    (initial behålls som egen del)
 *   "Björn Borg", 2        → "BJ BO"
 *   "Washington, D.C.", 4  → "WASH DC"
 */
export function getPrefixForItem(displayName: string, length: number): string {
  return displayName
    .split(/\s+/)
    .map((part) =>
      part.replace(/[^\p{L}]/gu, '').slice(0, length).toUpperCase(),
    )
    .filter((p) => p.length > 0)
    .join(' ');
}

interface ShuffleableRng {
  (): number;
}

function shuffle<T>(arr: T[], rng: ShuffleableRng): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

interface PoolItem {
  filename: string;
  item: ContentItem;
}

/**
 * Hämta items i en specifik kategori som är relevanta för en spelar-generation.
 * Items från `audience: 'all'`-filer kommer alltid med.
 */
function getCategoryPool(
  catalog: LoadedCatalog,
  category: Category,
  playerGeneration: Generation,
  excludeSensitive: boolean,
): PoolItem[] {
  return findItemsForAudience(catalog, playerGeneration, { excludeSensitive })
    .filter((m) => catalog.files.get(m.filename)?.category === category);
}

/**
 * Fallback-pool: alla items i kategorin oavsett audience. Används när
 * primary pool är för liten för att fylla griden.
 */
function getCategoryFallbackPool(
  catalog: LoadedCatalog,
  category: Category,
  excludeSensitive: boolean,
): PoolItem[] {
  const out: PoolItem[] = [];
  for (const [filename, file] of catalog.files) {
    if (file.category !== category) continue;
    for (const item of file.items) {
      if (excludeSensitive && item.sensitivity === 'sensitive') continue;
      out.push({ filename, item });
    }
  }
  return out;
}

export interface BuildLetterGridArgs {
  catalog: LoadedCatalog;
  category: Category;
  playerGeneration: Generation;
  correctItem: ContentItem;
  prefixLength: number;
  totalOptions?: number;
  rng?: () => number;
  excludeSensitive?: boolean;
}

/**
 * Bygg Letter Grid (Steg 1).
 * Returnerar `totalOptions` prefix-knappar — 1 rätt + (totalOptions-1) distractors.
 * Alla prefix är unika. Resultatet är blandat (random ordning).
 *
 * Pool-strategi (lager för lager tills target nås):
 *   1. Items i samma kategori som matchar spelarens generation
 *   2. Items i hela kategorin (oavsett audience)
 *   3. Påhittade namn från `distractor-pool.yaml` (mappade till prefixer)
 *
 * Layer 3 garanterar att vi nästan alltid kan fylla griden — även om rätt
 * prefix är ovanligt och katalog-poolen har för få varierande prefixer.
 */
export function buildLetterGrid(args: BuildLetterGridArgs): PrefixOption[] {
  const {
    catalog,
    category,
    playerGeneration,
    correctItem,
    prefixLength,
    totalOptions = DEFAULT_TOTAL_OPTIONS,
    rng = Math.random,
    excludeSensitive = true,
  } = args;

  const correctPrefix = getPrefixForItem(correctItem.displayName, prefixLength);
  const seen = new Set<string>([correctPrefix]);
  const distractors: string[] = [];

  function pickFromPool(pool: PoolItem[]): void {
    for (const { item } of shuffle(pool, rng)) {
      if (item.id === correctItem.id) continue;
      const prefix = getPrefixForItem(item.displayName, prefixLength);
      if (!prefix) continue;
      if (seen.has(prefix)) continue;
      seen.add(prefix);
      distractors.push(prefix);
      if (distractors.length >= totalOptions - 1) return;
    }
  }

  function pickFromDistractorPool(): void {
    const pool = loadDistractorPool();
    const names = pool.names[category];
    for (const name of shuffle(names, rng)) {
      const prefix = getPrefixForItem(name, prefixLength);
      if (!prefix) continue;
      if (seen.has(prefix)) continue;
      seen.add(prefix);
      distractors.push(prefix);
      if (distractors.length >= totalOptions - 1) return;
    }
  }

  pickFromPool(getCategoryPool(catalog, category, playerGeneration, excludeSensitive));

  if (distractors.length < totalOptions - 1) {
    pickFromPool(getCategoryFallbackPool(catalog, category, excludeSensitive));
  }

  if (distractors.length < totalOptions - 1) {
    pickFromDistractorPool();
  }

  const all: PrefixOption[] = [
    { prefix: correctPrefix, isCorrect: true },
    ...distractors.map((p) => ({ prefix: p, isCorrect: false })),
  ];
  return shuffle(all, rng);
}

export interface BuildFullNamesListArgs {
  catalog: LoadedCatalog;
  category: Category;
  playerGeneration: Generation;
  correctItem: ContentItem;
  totalOptions?: number;
  rng?: () => number;
  excludeSensitive?: boolean;
}

/**
 * Bygg fullnamn-lista för Full assistance-läget (= ingen prefix-knapp; spelaren
 * ser N fullnamn under varandra och väljer direkt). Mestadels samma pool-strategi
 * som `buildNameOptions` men UTAN prefix-filtrering — vilket fullnamn som helst
 * från katalog/pool är giltig distractor så länge id/name inte krockar med
 * rätt svar eller redan vald distractor.
 *
 * Returnerar `totalOptions` namn (default 10) — 1 rätt + (totalOptions-1)
 * distractors, blandade.
 */
export function buildFullNamesList(args: BuildFullNamesListArgs): NameOption[] {
  const {
    catalog,
    category,
    playerGeneration,
    correctItem,
    totalOptions = DEFAULT_TOTAL_OPTIONS,
    rng = Math.random,
    excludeSensitive = true,
  } = args;

  const targetDistractorCount = totalOptions - 1;
  const seenIds = new Set<string>([correctItem.id]);
  const seenNamesLower = new Set<string>([correctItem.displayName.toLowerCase()]);
  const distractors: NameOption[] = [];

  function collectFromCatalog(pool: PoolItem[]): void {
    for (const { item } of shuffle(pool, rng)) {
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
    const pool = loadDistractorPool();
    const names = pool.names[category];
    for (const name of shuffle(names, rng)) {
      if (distractors.length >= targetDistractorCount) return;
      const lower = name.toLowerCase();
      if (seenNamesLower.has(lower)) continue;
      seenNamesLower.add(lower);
      distractors.push({
        itemId: poolNameToId(name),
        displayName: name,
        isCorrect: false,
        source: 'pool',
      });
    }
  }

  collectFromCatalog(getCategoryPool(catalog, category, playerGeneration, excludeSensitive));
  if (distractors.length < targetDistractorCount) {
    collectFromCatalog(getCategoryFallbackPool(catalog, category, excludeSensitive));
  }
  if (distractors.length < targetDistractorCount) {
    collectFromDistractorPool();
  }

  const options: NameOption[] = [
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

export interface BuildNameOptionsArgs {
  catalog: LoadedCatalog;
  category: Category;
  playerGeneration: Generation;
  correctItem: ContentItem;
  selectedPrefix: string;
  prefixLength: number;
  totalOptions?: number;
  rng?: () => number;
  excludeSensitive?: boolean;
}

/**
 * Bygg Final Selection (Steg 2) baserat på vilket prefix spelaren klickade.
 *
 * - Om selectedPrefix === correctPrefix: returnera (totalOptions-1) distractor-namn
 *   med samma prefix + det rätta motivet, blandade.
 * - Om selectedPrefix !== correctPrefix: returnera upp till totalOptions distractor-namn
 *   med matching prefix. Inget av dem är rätt — spelaren har redan låst sig vid fel prefix.
 *
 * Pool-strategi (lager för lager tills target nås):
 *   1. Items i samma kategori som matchar spelarens generation
 *   2. Items i hela kategorin (oavsett audience)
 *   3. Påhittade namn från `distractor-pool.yaml` med matching prefix
 *
 * Items dedupe:as på `id`; pool-namn dedupe:as på displayName (case-insensitive).
 */
export function buildNameOptions(args: BuildNameOptionsArgs): NameOption[] {
  const {
    catalog,
    category,
    playerGeneration,
    correctItem,
    selectedPrefix,
    prefixLength,
    totalOptions = DEFAULT_TOTAL_OPTIONS,
    rng = Math.random,
    excludeSensitive = true,
  } = args;

  const correctPrefix = getPrefixForItem(correctItem.displayName, prefixLength);
  const isCorrectPrefix = selectedPrefix === correctPrefix;
  const targetDistractorCount = isCorrectPrefix ? totalOptions - 1 : totalOptions;

  const seenIds = new Set<string>([correctItem.id]);
  const seenNamesLower = new Set<string>([correctItem.displayName.toLowerCase()]);
  const distractors: NameOption[] = [];

  function collectFromCatalog(pool: PoolItem[]): void {
    for (const { item } of shuffle(pool, rng)) {
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
    const pool = loadDistractorPool();
    const names = pool.names[category];
    for (const name of shuffle(names, rng)) {
      if (distractors.length >= targetDistractorCount) return;
      const lower = name.toLowerCase();
      if (seenNamesLower.has(lower)) continue;
      const prefix = getPrefixForItem(name, prefixLength);
      if (prefix !== selectedPrefix) continue;
      seenNamesLower.add(lower);
      distractors.push({
        itemId: poolNameToId(name),
        displayName: name,
        isCorrect: false,
        source: 'pool',
      });
    }
  }

  collectFromCatalog(getCategoryPool(catalog, category, playerGeneration, excludeSensitive));

  if (distractors.length < targetDistractorCount) {
    collectFromCatalog(getCategoryFallbackPool(catalog, category, excludeSensitive));
  }

  if (distractors.length < targetDistractorCount) {
    collectFromDistractorPool();
  }

  const options: NameOption[] = distractors.slice(0, targetDistractorCount);

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

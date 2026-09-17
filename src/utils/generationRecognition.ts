// Gentle, asymmetrisk, HCP-medveten generations-screen för Hints/bild-poolen.
//
// Bakgrund: audience-taggen är en no-op (alla items bär alla fem generationer),
// och person-items är era-agnostiska (correctYear = födelseår). Följden var att
// en gen-z-spelare (född ~2010) kunde serveras t.ex. Jimi Hendrix (elder). Den
// här modulen återinför generations-hänsyn ENBART för bild/Hints-poolen, i en
// medveten "gentle"-inställning: bara EXTREMA missmatchningar trimmas bort
// (obskyrt + mycket gammalt innehåll långt bort, samt tydligt-för-ungt
// innehåll). Ikoniskt gammalt innehåll (Hendrix, probability 65) släpps igenom.
//
// Signalen är item:ets `originGenerations` (härledd ur källfilens namn i
// export-image-questions.ts). Tom/saknad → OSPECIFICERAD → filtreras aldrig.
//
// Ren funktionell modul (ingen React/RN/AsyncStorage) → vitest-testbar från
// backend-sviten (se backend/content/test/generationRecognition.test.ts).

import { GenerationKey } from './mockPurchasedPackages';

const GEN_ORDER: GenerationKey[] = [
  'elder',
  'gen-x',
  'millennials',
  'gen-z',
  'gen-alpha',
];
const genIndex = (g: GenerationKey): number => GEN_ORDER.indexOf(g);

// ── Tunbara knappar (gentle) ────────────────────────────────────────────────
// ÄLDRE innehåll (origin äldre än spelaren): krävt itemHcp-golv per avstånd d.
// d 0-2 = inget golv (0). d 3 = 40 (bara obskyra äldre items faller; Hendrix 65
// passerar). d 4 = 60 (elder → gen-alpha; bara det mest ikoniska når fram).
const OLDER_HCP_BAR: readonly number[] = [0, 0, 0, 40, 60];

// Skickliga spelare (lågt HCP) drar igenom mer avlägset/obskyrt — golvet sänks.
function hcpBarReduction(playerHcp: number): number {
  if (playerHcp >= 80) return 0;
  if (playerHcp >= 60) return 15;
  if (playerHcp >= 40) return 30;
  if (playerHcp >= 20) return 45;
  return 999; // expert (< 20): golvet tas bort helt
}

// YNGRE innehåll (origin yngre än spelaren): hård avståndsregel. Normalt
// tillåts d <= 2 (angränsande bleed-through OK). Experter (< 20) får d <= 3.
function youngerMaxDistance(playerHcp: number): number {
  return playerHcp < 20 ? 3 : 2;
}

/**
 * Krävt itemHcp-golv för ETT (spelar-generation, origin-generation)-par.
 * Returnerar Infinity = hård uteslutning (yngre innehåll för långt bort).
 * `relax` (0..) sänker äldre-golv och vidgar yngre-avstånd steg för steg
 * (anti-kollaps).
 */
function requiredFloor(
  playerGen: GenerationKey,
  originGen: GenerationKey,
  playerHcp: number,
  relax: number,
): number {
  const d = Math.abs(genIndex(originGen) - genIndex(playerGen));
  if (d === 0) return 0;
  if (genIndex(originGen) < genIndex(playerGen)) {
    // Äldre innehåll — höj golvet med avståndet, sänk med HCP + relax.
    const bar = OLDER_HCP_BAR[Math.min(d, OLDER_HCP_BAR.length - 1)];
    return Math.max(0, bar - hcpBarReduction(playerHcp) - relax);
  }
  // Yngre innehåll — hård avståndsgräns, vidgas av relax.
  const maxD = youngerMaxDistance(playerHcp) + Math.floor(relax / 20);
  return d <= maxD ? 0 : Infinity;
}

/** Item-form som screenen läser. */
export interface GenerationScreenData {
  originGenerations?: readonly GenerationKey[];
  itemHcp?: number;
}

/**
 * Passerar item:et generations-screenen för NÅGON av de aktiva spelar-
 * generationerna? (Pool-nivå union — samma semantik som det gamla audience-
 * filtret: ett item behålls om det är OK för minst en spelare i lobbyn.)
 *
 * Ospecificerad origin (tom/saknad) → alltid true.
 */
export function itemPassesGeneration(
  data: GenerationScreenData,
  playerGens: readonly GenerationKey[],
  playerHcp: number,
  relax = 0,
): boolean {
  const origins = data.originGenerations;
  if (!origins || origins.length === 0) return true; // ospecificerad → aldrig screenad
  if (playerGens.length === 0) return true; // ingen ålders-info → bypass
  const hcp = data.itemHcp ?? 100; // saknat itemHcp = lättast (samma som filterByItemHcp)
  for (const p of playerGens) {
    for (const o of origins) {
      const floor = requiredFloor(p, o, playerHcp, relax);
      if (floor !== Infinity && hcp >= floor) return true;
    }
  }
  return false;
}

/**
 * Pool-wrapper med anti-kollaps-relaxering — speglar filterByItemHcp:s nät.
 *
 * • pool.length <= minCount → filtrera inte (liten katalog).
 * • tomma playerGens → bypassa (ingen ålders-info).
 * • annars: sänk golvet progressivt (relax 0→100 steg 20) tills poolen når
 *   minCount; om den aldrig når dit → returnera hela poolen (kollapsar aldrig).
 *
 * `getData` extraherar screen-datan ur item-typen (bild-poolen bär den nästlat
 * i `source`), så wrappern kan operera på QuizQuestion utan typ-ändring.
 */
export function filterByGenerationRecognition<T>(
  pool: T[],
  getData: (item: T) => GenerationScreenData,
  playerGens: readonly GenerationKey[],
  playerHcp: number,
  minCount: number,
): T[] {
  if (pool.length <= minCount) return pool;
  if (playerGens.length === 0) return pool;
  for (let relax = 0; relax <= 100; relax += 20) {
    const kept = pool.filter((item) =>
      itemPassesGeneration(getData(item), playerGens, playerHcp, relax),
    );
    if (kept.length >= minCount) return kept;
  }
  return pool; // fortfarande för tunn → kollapsa aldrig
}

// Audience-filter — V1-implementation. Gäller BÅDA image- och music-pools.
//
// Modell: union av aktiva spelares generationer. Items behålls om deras
// `audiences`-tag innehåller MINST EN spelares generation, ELLER om de är
// taggade 'all' (baseline). Implikation:
//
//   • Homogen lobby (alla spelare = gen-x): strict filter — bara gen-x +
//     'all'-taggade items kvalificerade.
//   • Blandad lobby (elder + millennials + gen-z): vidare filter — items
//     från någon av dessa tre + 'all'.
//
// Round-block-strukturen i quiz.tsx ger alla spelare i en rond samma
// fråge-TYP (men olika items). Union-filter håller därför poolen meningsfull
// för alla samtidigt utan att kräva per-spelare-pick.
//
// Per-spelare-filter (= "Peter Forsberg-fråga bara när det är gen-x-spelarens
// tur") kan komma i V2 om Peter vill — kräver per-tur-pick i round-block-
// loopen istället för pool-nivå-filter.

import {
  GenerationKey,
  getGenerationKeyFromBirthYear,
} from './mockPurchasedPackages';

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Härleder generations-key från en spelares aktuella ålder. Returnerar null
 * om age är undefined/null så caller kan filtrera bort spelare utan age-info.
 */
export function ageToGeneration(age: number | undefined | null): GenerationKey | null {
  if (age == null) return null;
  return getGenerationKeyFromBirthYear(CURRENT_YEAR - age);
}

/**
 * Bygger union-set:en av generationer för en spelarlista. Spelare utan age
 * (sker när Lobby:s auto-fallback inte hunnit fylla i) bidrar inte.
 */
export function buildAudienceSet(
  players: Array<{ age?: number | null | undefined }>,
): Set<GenerationKey> {
  const set = new Set<GenerationKey>();
  for (const p of players) {
    const gen = ageToGeneration(p.age);
    if (gen) set.add(gen);
  }
  return set;
}

/**
 * Filtrerar items mot audience-set:en. Items vars audiences innehåller MINST
 * EN av set:ens generationer (eller 'all'-taggade) behålls.
 *
 * Tom audience-set (= ingen spelare med age-info) → bypassa filtret helt;
 * returnera items oförändrade. Detta är "ingen filter"-fallet, inte "tomt
 * resultat"-fallet.
 */
export function filterByAudience<T extends { audiences: readonly string[] }>(
  items: T[],
  audiences: Set<GenerationKey>,
): T[] {
  if (audiences.size === 0) return items;
  return items.filter((item) =>
    item.audiences.some(
      (a) => a === 'all' || audiences.has(a as GenerationKey),
    ),
  );
}

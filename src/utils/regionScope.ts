// Regionmodell — klient-spegel av `backend/content/schema.ts`.
// HÅLL DE TVÅ I SYNK: när ett land läggs till i backend-schemat måste det
// läggas till här också, annars filtreras dess items bort på klienten.
//
// ── En STRIKT HIERARKI (bredast → smalast) ────────────────────────────────
//
//     global  ⊃  europe  ⊃  nordic  ⊃  <land>          (i dag bara 'sweden')
//
// Ett items `region`-tagg anger hur BRETT det är igenkänt. En SPELARE har
// ett land (= sitt region scope). Itemet visas om spelarens land ligger
// inom itemets region-nivå:
//
//   region: ["global"]  → alla länder, överallt
//   region: ["europe"]  → alla europeiska länder (i dag bara Sverige)
//   region: ["nordic"]  → alla nordiska länder (i dag bara Sverige)
//   region: ["sweden"]  → enbart spelare med region scope Sweden
//   region: ["unknown-region"] → INGEN spelare. Placeringen är inte beslutad
//                       ännu, så itemet hålls utanför allt innehåll.
//
// I V1 finns bara Sverige, så global/europe/nordic/sweden är alla synliga
// och unknown-region är det inte. Nivåerna börjar skilja sig åt först när
// fler länder läggs till i REGION_ANCESTRY.

/** Aggregerings-nivåer — INTE länder. Kan aldrig vara en spelares scope. */
export const REGION_TIERS = ['global', 'europe', 'nordic'] as const;

/** Länder en spelare kan ha som region scope. Utöka land för land. */
export const REGION_COUNTRIES = ['sweden'] as const;
export type RegionCountry = (typeof REGION_COUNTRIES)[number];

/**
 * Vilka region-taggar som når ett givet land, bredast → smalast.
 *
 * NÄR DU LÄGGER TILL ETT LAND: lägg till det i `REGION_COUNTRIES` och här
 * med sin fulla kedja — och gör samma sak i backend-schemat. Exempel:
 *   norway:  ['global', 'europe', 'nordic', 'norway']
 *   germany: ['global', 'europe', 'germany']    // europeiskt men ej nordiskt
 *   japan:   ['global', 'japan']                // varken europeiskt el. nordiskt
 *
 * 'unknown-region' står MEDVETET inte i någon kedja — därför når den ingen.
 */
export const REGION_ANCESTRY: Record<RegionCountry, readonly string[]> = {
  sweden: ['global', 'europe', 'nordic', 'sweden'],
};

/**
 * Spelarens land i V1. Hårdkodat eftersom Sverige är enda definierade landet.
 *
 * TODO (V2): härled från spelarens profil. OBS att `ProfileData.region`
 * ('sweden' | 'nordics' | 'global') och Lobby:ns "Region Scope"-kontroll
 * (Sweden/Nordics/Europe/Global) i dag beskriver hur BRETT innehållet ska
 * vara — inte vilket LAND spelaren befinner sig i. En av dem måste bli en
 * riktig landväljare innan den kan matas in här; att mappa "Nordics" eller
 * "Global" till ett land är odefinierat i modellen ovan.
 */
export const PLAYER_COUNTRY: RegionCountry = 'sweden';

/**
 * Är itemet synligt för en spelare i `country`?
 * Sant om NÅGON av itemets region-taggar finns i landets kedja.
 */
export function isItemInRegionScope(
  itemRegions: readonly string[],
  country: RegionCountry = PLAYER_COUNTRY,
): boolean {
  const reachable = REGION_ANCESTRY[country];
  return itemRegions.some((r) => reachable.includes(r));
}

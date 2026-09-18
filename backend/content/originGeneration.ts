// Härleder ett items "origin-generation" (recognition-audience) ur KÄLLFILENS
// namn. Bakgrund: `tag-all-audiences.ts` plattade varje items `audience`-tagg
// till alla fem generationer (audience-filtret är en no-op), så item-taggen
// duger inte längre som recognition-signal. Men filnamnet bär fortfarande
// curatorns ursprungliga avsikt: `artists-elder.yaml` = elder-recognition,
// `songs-gen-x.yaml` = gen-x-era, osv.
//
// Regel: ett filnamn som slutar på `-<generation>.yaml` (eller `.yml`) ger
// exakt den generationen. ALLT annat (tematiska/regionala/import-filer utan
// generations-suffix: songs-all, bands-classics, movies-*, *-sweden-*,
// *-import-*) → tom lista = OSPECIFICERAD. En tom lista screenas ALDRIG av
// generations-filtret på klienten (bara item-HCP-golvet gäller) — det är den
// primära garanten mot att poolen kollapsar.
//
// Ren funktion utan sido-effekter → enhetstestbar (se test/originGeneration.test.ts).

import { Generation } from './schema';

const GENERATION_SUFFIX_RE =
  /-(elder|gen-x|millennials|gen-z|gen-alpha)\.ya?ml$/;

/**
 * Origin-generationer för en katalog-fil, härledd ur filnamnet.
 * Returnerar `[gen]` för filer med rent generations-suffix, annars `[]`
 * (ospecificerad — filtreras aldrig på generation).
 *
 * Filnamnet kan vara enbart basnamn (`artists-elder.yaml`) eller prefixat
 * (`deferred/…`) — regexen ankrar på slutet så båda formerna fungerar.
 */
export function originGenerationsFromFilename(filename: string): Generation[] {
  const m = GENERATION_SUFFIX_RE.exec(filename);
  return m ? [m[1] as Generation] : [];
}

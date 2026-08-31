// Host-paket — delad runtime-logik för tema-paket (Customized Host packages).
//
// Modulen är den ENDA sanningskällan för hur ett valt paket påverkar spelet, så
// att Lobby (mixerboard-graying + era-lås + preview) och quiz.tsx (pool-filter)
// aldrig glider isär. Ren datamodul (ingen React/RN/AsyncStorage).
//
// Modell (Peter 2026-08-28):
//   • Tema-only: aktivt paket → musikpoolen restrikteras till paketets taggar.
//     Flera valda paket = union av taggar.
//   • Coverage: ett paket "täcker" en (MainCategory × källa)-cell om minst ett
//     tema-taggat item finns där. Celler utan täckning gråas ut i mixerboarden.
//   • Era-lås: Game Era låses till min/max correctYear över paketets items.
//
// Matchning sker via paketets `tags` (= katalogens genrePackages-strängar),
// INTE via paket-id — se MusicPackage-kommentaren i mockPurchasedPackages.ts.

import { PURCHASED_PACKAGES } from './mockPurchasedPackages';
import { MUSIC_QUESTIONS } from './musicQuestions';
import { subjectToMainCategory, type MainCategory } from './mainCategory';

export type PackageSourceCoverage = { youtube: boolean; spotify: boolean; hints: boolean };
export type PackageCoverage = Record<MainCategory, PackageSourceCoverage>;

/** Union av `tags` för alla valda (och kända) paket-ids. Okända ids ignoreras. */
export function resolveActivePackageTags(selectedIds: readonly string[]): Set<string> {
  const set = new Set<string>();
  for (const id of selectedIds) {
    const pkg = PURCHASED_PACKAGES.find((p) => p.id === id);
    if (pkg) for (const t of pkg.tags) set.add(t);
  }
  return set;
}

/** True om minst ett giltigt paket är aktivt (styr tema-only + era-lås + graying). */
export function hasActivePackage(selectedIds: readonly string[]): boolean {
  return resolveActivePackageTags(selectedIds).size > 0;
}

/**
 * True om Spotify FÅR vara den enda aktiva källan för de valda paketen — dvs.
 * ALLA aktiva paket har `allowSpotifyOnly` (rena musik-genre-paket). Blandas ett
 * Sport/Football-paket in (som saknar Spotify-spår) → false, så host inte kan
 * lämna det paketet utan spelbar källa. Tomt urval → false.
 */
export function packagesAllowSpotifyOnly(selectedIds: readonly string[]): boolean {
  const active = selectedIds
    .map((id) => PURCHASED_PACKAGES.find((p) => p.id === id))
    .filter((p): p is (typeof PURCHASED_PACKAGES)[number] => !!p);
  return active.length > 0 && active.every((p) => p.allowSpotifyOnly === true);
}

/** True om item:ets genrePackages matchar någon aktiv paket-tagg. */
export function itemInActivePackages(
  genrePackages: readonly string[] | undefined,
  activeTags: Set<string>,
): boolean {
  if (!genrePackages || activeTags.size === 0) return false;
  return genrePackages.some((t) => activeTags.has(t));
}

function emptyCoverage(): PackageCoverage {
  return {
    Music: { youtube: false, spotify: false, hints: false },
    Film: { youtube: false, spotify: false, hints: false },
    Sport: { youtube: false, spotify: false, hints: false },
  };
}

/**
 * (MainCategory × källa)-täckning för de valda paketen, härledd ur MUSIC_QUESTIONS.
 * Hints-täckning är alltid false — image-exporten emitterar inga genrePackages, så
 * inga image-items kan bära en paket-tagg. Inget paket valt → allt false.
 */
export function computePackageCoverage(selectedIds: readonly string[]): PackageCoverage {
  const cov = emptyCoverage();
  const activeTags = resolveActivePackageTags(selectedIds);
  if (activeTags.size === 0) return cov;
  for (const q of MUSIC_QUESTIONS) {
    if (!itemInActivePackages(q.genrePackages, activeTags)) continue;
    const mc = subjectToMainCategory(q.contentSubject);
    if (!mc) continue;
    if (q.youtubeClips && q.youtubeClips.length > 0) cov[mc].youtube = true;
    if (q.spotifyTrackId) cov[mc].spotify = true;
  }
  return cov;
}

/**
 * Game Era-spann [min, max] över de valda paketens tema-items (alla `inBaseCatalog`).
 * null när inget paket valt eller inga items har correctYear. Union över flera paket.
 */
export function computePackageEraRange(selectedIds: readonly string[]): [number, number] | null {
  const activeTags = resolveActivePackageTags(selectedIds);
  if (activeTags.size === 0) return null;
  let min = Infinity;
  let max = -Infinity;
  for (const q of MUSIC_QUESTIONS) {
    if (typeof q.correctYear !== 'number') continue;
    if (!itemInActivePackages(q.genrePackages, activeTags)) continue;
    if (q.correctYear < min) min = q.correctYear;
    if (q.correctYear > max) max = q.correctYear;
  }
  if (min === Infinity) return null;
  return [min, max];
}

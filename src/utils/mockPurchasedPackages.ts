/**
 * Katalog över extra-paket (Customized Host packages).
 *
 * OMARBETAT 2026-07-07: paket säljs INTE styckvis längre — ALLA paket i
 * katalogen INGÅR i Premium-abonnemanget. Namnet PURCHASED_PACKAGES är
 * legacy (behålls för minimal diff) men semantiken är numera "katalogen
 * av premium-inkluderade paket". Synlighet/aktivering styrs av:
 *   • Lobby: paketlistan visas bara för inloggad host med Premium som
 *     startat lobbyn som QuizVibe-user (ej guest host); paketen auto-
 *     aktiveras vid lobby-seed ("Activate Extra package"-knappen).
 *   • Profile: listan (enabledHostPackages-toggles) visas bara med Premium.
 *
 * Konventionen att exportera samma struktur som ett kommande API-anrop
 * skulle returnera gör att call-sites kan stanna oförändrade när mock:en
 * byts ut mot riktigt backend.
 *
 * Tema-paket (2026-08-28): Melodifestivalen + Hip Hop är de FÖRSTA riktiga,
 * funktionella paketen. Ett aktivt paket gör spelet tema-only (musikpoolen
 * restrikteras till paketets `tags` = katalogens genrePackages), gråar ut
 * mixerboard-celler utan material och LÅSER Game Era till paketets span. All
 * runtime-logik ligger i `hostPackages.ts` (delad av Lobby + quiz.tsx).
 * Exklusivitet styrs per item av katalogens `inBaseCatalog`: true = spelas i
 * BÅDE generiska spel och paketet; false = paket-exklusiv (export-music-
 * questions.ts emitterar numera false-items i stället för att droppa dem).
 * Rock / Film & Actors m.fl. är fortsatt parkerade till v1.1+.
 */
export interface MusicPackage {
  id: string;
  name: string;
  // De genrePackages-taggar (i katalogens `genrePackages`) som paketet
  // omfattar. Matchning mot innehåll sker via `tags`, INTE via `id`, så vi
  // slipper case-problem (id 'pkg-hiphop' vs katalog-tagg 'hiphop', name
  // 'Hip Hop'). Ett paket kan omfatta flera taggar.
  tags: string[];
  // True = paketet ingår gratis. Reserverat för framtida gratis-paket
  // (idag inga). Optional för bakåtkompat — köpta paket lämnar fältet
  // undefined.
  free?: boolean;
}

// Första riktiga tema-paketen (2026-08-28). Båda är Music-only. `id` bär
// `pkg-`-prefix (plockas INTE av LEGACY_GEN_PKG_IDS-strippningen som bara
// matchar `pkg-gen-*`). `tags` speglar genrePackages-strängarna i katalogen.
export const PURCHASED_PACKAGES: MusicPackage[] = [
  { id: 'pkg-melodifestivalen', name: 'Melodifestivalen', tags: ['Melodifestivalen'] },
  { id: 'pkg-hiphop', name: 'Hip Hop', tags: ['hiphop'] },
];

// ─── Generation-key (för audience-filter) ────────────────────────────
// Type + birth-year-mapper används av audienceFilter.ts för att härleda
// vilken generation en spelare tillhör. Inte kopplat till några paket
// längre — det här är ren content-filter-utility.
// Year-banden speglar backend/content/generation.ts:birthYearToGeneration
// så client + content-katalog håller samma definition.

export type GenerationKey =
  | 'elder'        // Silent Generation + Baby Boomers (1925-1964)
  | 'gen-x'        // Gen X (1965-1980)
  | 'millennials'  // Millennials (1981-1996)
  | 'gen-z'        // Gen Z (1997-2012)
  | 'gen-alpha';   // Gen Alpha (2013-)

export function getGenerationKeyFromBirthYear(
  birthYear: number | null | undefined,
): GenerationKey | null {
  if (birthYear == null) return null;
  if (birthYear <= 1964) return 'elder';
  if (birthYear <= 1980) return 'gen-x';
  if (birthYear <= 1996) return 'millennials';
  if (birthYear <= 2012) return 'gen-z';
  return 'gen-alpha';
}

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
 * V1-scope (2026-05-27): inga themed packages än (Hip Hop / Rock /
 * Film & Actors-mfl. parkerade till v1.1+). Tidigare auto-tilldelade
 * generations-paket ("Play as Gen X" etc.) togs bort 2026-05-27 — Peter
 * beslutade att gen-konceptet inte är aktuellt i V1. PURCHASED_PACKAGES
 * är därmed tom genom hela V1-launch.
 */
export interface MusicPackage {
  id: string;
  name: string;
  // True = paketet ingår gratis. Reserverat för framtida gratis-paket
  // (idag inga). Optional för bakåtkompat — köpta paket lämnar fältet
  // undefined.
  free?: boolean;
}

export const PURCHASED_PACKAGES: MusicPackage[] = [];

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

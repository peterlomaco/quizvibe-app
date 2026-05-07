/**
 * Mockad lista över extra-paket användaren har köpt via QuizVibe Store.
 * Tom array = inga köpta paket → CTA i Profile/Lobby visar Store-länk.
 *
 * Stand-in tills Store-integrationen kopplas in. Konventionen att
 * exportera samma struktur som ett kommande API-anrop skulle returnera
 * gör att call-sites kan stanna oförändrade när mock:en byts ut mot
 * `loadPurchasedPackages()` (eller motsvarande) mot riktigt backend.
 */
export interface MusicPackage {
  id: string;
  name: string;
  // True = paketet ingår gratis (idag: generations-paket auto-tilldelat
  // utifrån Competition Year of Birth). Visuell skiljelinje: FREE-badge
  // istället för PREMIUM. Optional för bakåtkompat — köpta paket lämnar
  // fältet undefined.
  free?: boolean;
}

export const PURCHASED_PACKAGES: MusicPackage[] = [
  { id: 'pkg-hiphop', name: 'Hip Hop' },
  { id: 'pkg-rock', name: 'Rock' },
  { id: 'pkg-film-actors', name: 'Film & Actors' },
];

// ─── Generations-paket ────────────────────────────────────────────────
// Varje user får automatiskt ETT gratis Customized Host Package kopplat
// till sin egen generation (härlett ur Competition Year of Birth). Byter
// user födelseår byts paketet automatiskt — se syncGenerationPackageIds.
// Year-banden speglar backend/content/generation.ts:birthYearToGeneration
// så client + content-katalog håller samma definition.

export type GenerationKey =
  | 'elder'        // Silent Generation + Baby Boomers (1925-1964)
  | 'gen-x'        // Gen X (1965-1980)
  | 'millennials'  // Millennials (1981-1996)
  | 'gen-z'        // Gen Z (1997-2012)
  | 'gen-alpha';   // Gen Alpha (2013-)

export const GENERATION_PACKAGES: Record<GenerationKey, MusicPackage> = {
  'elder':       { id: 'pkg-gen-elder',       name: 'Play as Silent Generation + Baby Boomers', free: true },
  'gen-x':       { id: 'pkg-gen-x',           name: 'Play as Gen X',                            free: true },
  'millennials': { id: 'pkg-gen-millennials', name: 'Play as Millennials',                      free: true },
  'gen-z':       { id: 'pkg-gen-z',           name: 'Play as Gen Z',                            free: true },
  'gen-alpha':   { id: 'pkg-gen-alpha',       name: 'Play as Gen Alpha',                        free: true },
};

// Alla möjliga gen-paket-id:n. Används för att identifiera/strippa
// gen-paket ur enabledHostPackages oavsett vilken generation user
// hade tidigare.
export const ALL_GENERATION_PACKAGE_IDS: string[] = Object.values(GENERATION_PACKAGES).map(
  (p) => p.id,
);

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

export function getFreeGenerationPackage(
  birthYear: number | null | undefined,
): MusicPackage | null {
  const key = getGenerationKeyFromBirthYear(birthYear);
  return key ? GENERATION_PACKAGES[key] : null;
}

/**
 * Strippar alla gen-paket-id:n ur listan och lägger till det aktuella
 * (om birthYear är satt). Idempotent — säker att köra på birthYear-byten
 * utan att duplicera ids eller röra köpta paket. Free-pack:et placeras
 * först så det renderas överst i listor.
 */
export function syncGenerationPackageIds(
  enabled: string[],
  birthYear: number | null | undefined,
): string[] {
  const stripped = enabled.filter((id) => !ALL_GENERATION_PACKAGE_IDS.includes(id));
  const current = getFreeGenerationPackage(birthYear);
  return current ? [current.id, ...stripped] : stripped;
}

export function isGenerationPackageId(id: string): boolean {
  return ALL_GENERATION_PACKAGE_IDS.includes(id);
}

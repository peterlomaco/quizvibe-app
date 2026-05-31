// Huvudkategori-modell — den högsta nivån av content-grouping i klienten.
// Härleds från backend-katalogens `contentSubject` via `subjectToMainCategory`.
//
// V1: tre huvudkategorier (Music/Film/Sport). Items med subject som inte
// mappar (t.ex. city/country/capital) är era-agnostiska och bär null —
// behandlas som "always available" i kategori-filter.
//
// Används av:
//   - quiz.tsx + GetReadyIntro (kategori-badge på current-box)
//   - ProfileScreen (host-default-toggle i "Main categories"-sektionen)
//   - LobbyScreen (per-spel toggle, syncas via lobby_settings)
//   - quiz.tsx:s gameQuestions-filter (pool-filter parallellt med audience + era)

export type MainCategory = 'Music' | 'Film' | 'Sport';

export const MAIN_CATEGORIES: readonly MainCategory[] = ['Music', 'Film', 'Sport'] as const;

/**
 * Användar-vänliga etiketter för lobby/profile-filtret. Filtret är PERSON-
 * centrerat (vem) medan det interna MainCategory-värdet + fråge-badgen är
 * MEDIUM-centrerat (vad). Samma mappning, bara annan etikett:
 *   Music → "Artist"  ·  Film → "Actors"  ·  Sport → "Athlete"
 * Rationale (Peter 2026-05-31): man filtrerar inte på "sport" utan på en
 * sport-ATLET — som även kan ha gjort musiklåtar eller medverkat i film
 * (genrePackages-crossover). Internt värde, filterlogik, persistens och
 * fråge-badge är OFÖRÄNDRADE — detta är enbart en display-etikett.
 */
export const MAIN_CATEGORY_LABELS: Record<MainCategory, string> = {
  Music: 'Artists',
  Film: 'Actors',
  Sport: 'Athletes',
};

/**
 * Mappar backend-subject → V1-huvudkategori. null när subjectet inte tillhör
 * någon av Music/Film/Sport (t.ex. capital, country, place — geografi-items
 * som curators valt att inte gruppera under huvudkategorierna).
 */
export function subjectToMainCategory(subject: string | undefined): MainCategory | null {
  if (!subject) return null;
  if (subject === 'song' || subject === 'artist' || subject === 'band') return 'Music';
  if (subject === 'movie' || subject === 'actor' || subject === 'character') return 'Film';
  if (subject === 'sport-event' || subject === 'athlete') return 'Sport';
  return null;
}

/**
 * Type-guard för parsning av persisted strings (URL-params, AsyncStorage,
 * DB-rader) → MainCategory. Filtrerar bort typos/legacy-värden tyst.
 */
export function isMainCategory(value: unknown): value is MainCategory {
  return value === 'Music' || value === 'Film' || value === 'Sport';
}

/**
 * Default-listan när enabledMainCategories saknas i sparad profil/lobby —
 * alla 3 aktiva (befintliga users ser inget beteendebyte vid feature-rollout).
 * Returnerar en frisk array varje anrop så call-sites kan muta den safely.
 */
export function defaultEnabledMainCategories(): MainCategory[] {
  return [...MAIN_CATEGORIES];
}

/**
 * Avgör om ett item ska visas givet host:s aktiverade huvudkategorier.
 *
 * Bas-regeln: item:ets `mainCategory` (härledd från contentSubject) måste
 * finnas i `enabled`. Items med null mainCategory (capitals/places) matchar
 * aldrig här (de hanteras separat av "alla 3 enabled = no-op"-specialfallet
 * i quiz.tsx).
 *
 * Sport-tema-undantag: en låt taggad `genrePackages: ["sport"]` (sport-musik —
 * fotbolls-VM-låt, hockey-VM-låt, idrottare som gjort musik) är subject=song
 * → mainCategory='Music', MEN surfar ÄVEN under Sport-toggeln. En host som
 * aktiverat antingen Music ELLER Sport får dessa. Driver "YouTube + musik +
 * sport"-crossover-kategorin (songs-sport.yaml).
 */
export function itemMatchesEnabledCategories(
  mainCategory: MainCategory | null,
  enabled: readonly MainCategory[],
  genrePackages?: readonly string[],
): boolean {
  if (mainCategory !== null && enabled.includes(mainCategory)) return true;
  if (genrePackages?.includes('sport') && enabled.includes('Sport')) return true;
  return false;
}

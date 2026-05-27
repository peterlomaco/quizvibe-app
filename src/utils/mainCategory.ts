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

// Huvudkategori-modell — den högsta nivån av content-grouping i klienten.
// Härleds från backend-katalogens `contentSubject` via `subjectToMainCategory`.
//
// V1: tre kategorier (Music/Film/Sport) — används uteslutande av YouTube-källan.
//
// Guess-källan (ersätter Images) är uppdelad i:
//   "Who?"   — personbilder (artist/band/actor/athlete) — juridiskt parkerade, visas EJ
//   "Where?" — platsfrågor (city/country/capital) — mainCategory=null, visas om guessWhereEnabled
//
// Items med null mainCategory (platser) behandlas som "always available" i
// YouTube-filtret men inkluderas enbart i Guess Where? i image-filtret.
//
// Används av:
//   - quiz.tsx + GetReadyIntro (kategori-badge på current-box)
//   - ProfileScreen + LobbyScreen (YouTube-toggle per profession-typ)
//   - quiz.tsx:s gameQuestions-filter

export type MainCategory = 'Music' | 'Film' | 'Sport';

export const MAIN_CATEGORIES: readonly MainCategory[] = ['Music', 'Film', 'Sport'] as const;

// Legacy — användes av Images-källan (ersatt av Guess-sektionen).
// Bevaras för bakåtkompatibilitet med mockLobbySettings.ts DB-adapter.
export const IMAGES_MANDATORY_CATEGORIES: readonly MainCategory[] = ['Film', 'Sport'] as const;

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
 * Default-listan när enabledMainCategories saknas i sparad profil/lobby.
 *
 * ⚠ MUSIC-ONLY LAUNCH (2026-09): returnerar ENBART Music. Film/Sport är parkerade
 * (katalogfilerna ligger i catalog/deferred/, se registry.ts) och ska aldrig seedas
 * som aktiverade. Detta är den ärliga "music-only"-spaken + belt-and-suspenders mot
 * befintliga users vars sparade kategori-arrayer kan innehålla Film/Sport.
 * Återställ till `[...MAIN_CATEGORIES]` när Film/Sport återaktiveras.
 *
 * Returnerar en frisk array varje anrop så call-sites kan muta den safely.
 */
export function defaultEnabledMainCategories(): MainCategory[] {
  return ['Music'];
}

/**
 * Kanonisk källmedlemskaps-check: ska ett item spelas givet host:s aktiverade
 * kategorier? NATIV mainCategory (härledd från contentSubject) måste finnas i
 * `enabled`. INGEN genrePackages-crossover.
 *
 * ⚠ Crossover BORTTAGET (2026-09, music-only launch): tidigare surfade ett
 * sport-/film-taggat item ÄVEN under Sport/Film via `genrePackages`. Men efter
 * music-only-pivoten är allt innehåll Music (movies/sport-events/actors/athletes
 * ligger i deferred/), och ett sport-taggat MUSIK-item (t.ex. songs-sport.yaml:
 * "How Much Is the Fish", `mainCategory: Music` + `genrePackages: ['sport']`) är
 * MUSIK. Crossover lät en generisk Sport-YouTube-toggle dra in det under Sport —
 * medan lobby-previewen (som aldrig crossovade) visade Hints. Preview och quiz
 * driftade isär. Regeln nu (Peters modell): sport-/film-taggad musik är Music,
 * surfar bara under Music (native) eller via ett Host-PAKET — aldrig via en
 * generisk Sport/Film-toggle. DENNA helper är den ENDA källmedlemskaps-logiken;
 * både [gameSequencePreview](../screens/LobbyScreen.tsx) och quiz-poolen
 * (app/quiz.tsx) använder den så de aldrig kan drifta isär igen.
 *
 * Items med null mainCategory (capitals/places) matchar aldrig här (de hanteras
 * separat av "alla 3 enabled = no-op"-specialfallet i quiz.tsx).
 */
export function itemInEnabledCategories(
  mainCategory: MainCategory | null,
  enabled: readonly MainCategory[],
): boolean {
  return mainCategory !== null && enabled.includes(mainCategory);
}

/** contentSubject-baserad bekvämlighets-wrapper kring itemInEnabledCategories. */
export function subjectInEnabledCategories(
  subject: string | undefined,
  enabled: readonly MainCategory[],
): boolean {
  return itemInEnabledCategories(subjectToMainCategory(subject), enabled);
}

/**
 * Vilken kategori-badge ett item ska VISA givet host:s aktiva filter — inte
 * nödvändigtvis dess bas-kategori.
 *
 * Historik (Peter 2026-08-31): tidigare visade badgen ALLTID bas-kategorin, så
 * en sport-taggad musiklåt (`genrePackages: ["sport"]`, mainCategory=Music) som
 * bara ingår i ett Sport-only-spel via crossover-regeln visade "Music". Med
 * Music bortfiltrerat kändes det som en bugg — spelaren valde Sport och fick en
 * "Music"-badge. Regeln nu: itemet visar den kategori det SURFADES under.
 *
 *   • Bas-kategorin är bland de aktiverade  → visa bas-kategorin (oförändrat i
 *     ett spel där alla kategorier är på — då är basen alltid aktiverad).
 *   • Bas-kategorin är BORTFILTRERAD men itemet kom in via en crossover-tagg
 *     som matchar en aktiverad kategori → visa den matchade kategorin.
 *
 * OBS: källmedlemskaps-filtret (itemInEnabledCategories) crossovar INTE längre
 * (music-only launch 2026-09), så ett item hamnar i poolen bara under sin NATIVA
 * kategori. Crossover-grenarna nedan är därmed onåbara för poolade items (basen
 * är alltid aktiverad då) → badgen blir alltid bas-kategorin. Grenarna behålls
 * defensivt ifall badge-funktionen återanvänds i ett framtida crossover-läge.
 * `enabled` = source-relevanta kategorier (YouTube-frågor: youtubeEnabledCategories;
 * Hints/image: imagesEnabledCategories).
 */
export function displayCategoryForItem(
  mainCategory: MainCategory | null,
  enabled: readonly MainCategory[],
  genrePackages?: readonly string[],
): MainCategory | null {
  // Bas-kategorin vinner när den faktiskt är påslagen.
  if (mainCategory !== null && enabled.includes(mainCategory)) return mainCategory;
  // Annars surfades itemet via en crossover-tagg → visa den matchade kategorin.
  if (genrePackages?.includes('sport') && enabled.includes('Sport')) return 'Sport';
  if (genrePackages?.includes('film') && enabled.includes('Film')) return 'Film';
  if (genrePackages?.includes('music') && enabled.includes('Music')) return 'Music';
  // Ingen match (t.ex. Spotify-låt som kringgår kategori-filtret, eller null
  // mainCategory) → fall tillbaka på bas-kategorin.
  return mainCategory;
}

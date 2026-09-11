// Huvudkategori-modell — den högsta nivån av content-grouping i klienten.
// Härleds från backend-katalogens `contentSubject` via `subjectToMainCategory`.
//
// V1: två kategorier (Music/Film) — används uteslutande av YouTube-källan.
// Sport är BORTTAGET ur den live modellen (2026-09): allt athlete-/sport-event-
// innehåll ligger parkerat i backend/content/catalog/deferred/ och laddas aldrig,
// så ingen runtime-logik ska längre grena på Sport. Katalog-YAML:en, backend-
// `schema.ts`s `category: 'sport'`, `genrePackages: ['sport']`-taggar på
// musik/film-items och DB-kolumnen `lobby_players.hcp_sport` lämnas orörda som
// ofarlig död data. Lägg INTE tillbaka 'Sport' här förrän det innehållet av-parkeras.
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

export type MainCategory = 'Music' | 'Film';

export const MAIN_CATEGORIES: readonly MainCategory[] = ['Music', 'Film'] as const;

// Målandel av YOUTUBE-klippen per kategori "över tid" (Peter 2026-09-12).
// YT-Film är innehållsfattigt → hålls till 10% av YT-klippen; resten Music.
// Realiseras via kategori-skuldboken (planCategorySequence) i normala spel och
// som sannolikhetsvikt i gäst-spel.
// Gäller ENBART YouTube-fasen; Hints-fasens kategorimix är oförändrad.
export const YT_CATEGORY_WEIGHTS: Record<string, number> = { Music: 0.9, Film: 0.1 };

// Legacy — användes av Images-källan (ersatt av Guess-sektionen).
// Bevaras för bakåtkompatibilitet med mockLobbySettings.ts DB-adapter.
export const IMAGES_MANDATORY_CATEGORIES: readonly MainCategory[] = ['Film'] as const;

/**
 * Användar-vänliga etiketter för lobby/profile-filtret. Filtret är PERSON-
 * centrerat (vem) medan det interna MainCategory-värdet + fråge-badgen är
 * MEDIUM-centrerat (vad). Samma mappning, bara annan etikett:
 *   Music → "Artist"  ·  Film → "Actors"
 * Rationale (Peter 2026-05-31): man filtrerar inte på "musik" utan på en
 * ARTIST — som även kan ha medverkat i film (genrePackages-crossover).
 * Internt värde, filterlogik, persistens och fråge-badge är OFÖRÄNDRADE —
 * detta är enbart en display-etikett.
 */
export const MAIN_CATEGORY_LABELS: Record<MainCategory, string> = {
  Music: 'Artists',
  Film: 'Actors',
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
  // 'sport-event'/'athlete' är parkerade subjects (deferred/) → null (ingen live-kategori).
  return null;
}

/**
 * Type-guard för parsning av persisted strings (URL-params, AsyncStorage,
 * DB-rader) → MainCategory. Filtrerar bort typos/legacy-värden tyst.
 */
export function isMainCategory(value: unknown): value is MainCategory {
  return value === 'Music' || value === 'Film';
}

/**
 * Default-listan när enabledMainCategories saknas i sparad profil/lobby.
 *
 * ⚠ MUSIC + FILM (2026-09): returnerar Music + Film — numera identiskt med
 * `[...MAIN_CATEGORIES]` sedan Sport togs bort ur den live modellen. (Sport-
 * innehållet ligger kvar parkerat i deferred/; av-parkeras det måste 'Sport'
 * återinföras i MainCategory-unionen först.)
 *
 * Belt-and-suspenders: befintliga users kan ha sparade arrayer med bara ['Music']
 * (music-only-eran) — de behåller Music-only tills de togglar Film i mixerboarden;
 * denna default gäller bara NYA profiler/färska lobbies utan sparat värde.
 *
 * Returnerar en frisk array varje anrop så call-sites kan muta den safely.
 */
export function defaultEnabledMainCategories(): MainCategory[] {
  return ['Music', 'Film'];
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
  if (genrePackages?.includes('film') && enabled.includes('Film')) return 'Film';
  if (genrePackages?.includes('music') && enabled.includes('Music')) return 'Music';
  // Ingen match (t.ex. Spotify-låt som kringgår kategori-filtret, eller null
  // mainCategory) → fall tillbaka på bas-kategorin.
  return mainCategory;
}

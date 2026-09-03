// hintsText.ts — text-pipelinen för Hints-ledtrådar: filtrering, censurering,
// radanpassning och deduplicering. Ren text-logik utan React, utbruten ur
// HintsQuizCard.tsx 2026-08-12 så den kan enhetstestas.
//
// Ordning (resolveHintText):
//   1. isRedundantHint    — säger inget utöver rubriken (Genre · Profession)
//   2. isNationalityHint  — flaggan visar redan landet
//   3. censorSensitive    — trunkerar vid dödsfall/sjukdom
//   4. censorForAnswer    — trunkerar vid svaret (spoiler-skydd)
//   5. fitHintText/fitClubText — radanpassning (se HINT_MAX_CHARS)
//
// Därefter deduplicerar `resolveHints` på den FÄRDIGA texten — se dess
// kommentar för varför det måste ske sist och inte på råvärdet.

import type { HintCategoryLabel, HintItem, HintLibrary } from './hintsData';
import { hasCountryFlag } from './hintsData';
import {
  buildRenderEntries,
  fitClubText,
  fitFilmText,
  fitHintText,
  formatHintText,
  HINT_MAX_CHARS,
  HINT_SUB_MAX_CHARS,
  selectHints,
  type ResolvedHint,
} from './hintsGenerator';

// ResolvedHint-typen bor i hintsGenerator.ts (den behövs där för render-
// grupperingen) — återexporteras härifrån så befintliga imports av
// `import { resolveHints, type ResolvedHint } from './hintsText'` är oförändrade.
export type { ResolvedHint };

// Termer som redan framgår av rubriken (Genre · Profession) och ska filtreras bort.
export const REDUNDANT_HINT_TERMS = [
  'music artist',
  'musician',
  'recording artist',
];

// ── Profession-redundans mot rubriken (Peter 2026-08-27) ────────────────────
//
// Rubriken visar redan Genre · Profession ("Music · Artist", "Film · Actor",
// "Sport · Athlete"). En profession-ledtråd ska ALDRIG bara upprepa det —
// men OM den även pekar på en annan bransch (t.ex. "Drummer & actor" när
// rubriken redan säger Actor) ska den EXTRA delen visas som crossover:
// "Also: drummer".
//
// Synonym-listorna innehåller BARA rena upprepningar av rubrik-ordet — en
// specifik gren (t.ex. "Professional golfer" för Athlete, "Nordic pop group"
// för Band, "Country singer" för Musikartist) matchar INGET av dem och visas
// därför oförändrad: den informationen finns inte redan i rubriken.
const PROFESSION_SYNONYMS: Record<HintCategoryLabel, string[]> = {
  Musikartist: [
    'music artist', 'recording artist', 'musician', 'singer', 'vocalist',
    'performer', 'entertainer', 'artist',
  ],
  Band: ['band', 'music group', 'musical group', 'group', 'duo', 'trio'],
  Actor: [
    'actor', 'actress', 'film actor', 'film actress', 'television actor',
    'tv actor', 'voice actor', 'dub actor', 'stage actor',
  ],
  Athlete: ['athlete', 'sportsperson', 'sports personality', 'professional athlete', 'sportsman', 'sportswoman'],
  Coach: ['coach', 'sports coach', 'manager', 'head coach'],
  Character: ['character', 'fictional character', 'animated character'],
};

/**
 * Delar en profession-sträng på skiljetecken/"and" och sorterar delarna i
 * (redan-i-rubriken) vs (ny info). Tre utfall:
 *   - Allt redundant  → null (dölj hela ledtråden)
 *   - Inget redundant → värdet oförändrat (ny info, t.ex. en specifik gren)
 *   - Blandat         → bara den nya delen, som crossover-fras
 */
function resolveProfessionValue(value: string, label: HintCategoryLabel): string | null {
  const synonyms = PROFESSION_SYNONYMS[label] ?? [];
  const parts = value.split(/\s*(?:&|,|\/|\band\b)\s*/i).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return null;

  const isRedundant = (p: string) => synonyms.includes(p.toLowerCase());
  const redundant = parts.filter(isRedundant);
  const extra = parts.filter((p) => !isRedundant(p));

  if (redundant.length === 0) return value;         // helt ny info — visa som den är
  if (extra.length === 0) return null;               // ren upprepning — dölj
  // KORT prefix medvetet: "Also well-known as a " ensamt är redan 21 tecken
  // av HINT_MAX_CHARS budget (25) — nästan varje verkligt crossover-ord
  // ("drummer", "winegrower", "director") hade truncateWords bort HELA
  // ordet och lämnat "Also well-known as a…" utan payload. "Also: " (6 tkn)
  // lämnar rum för ordet, som är hela poängen med hinten.
  return `Also: ${extra.join(' & ')}`;
}

// Hint-typer som alltid filtreras bort — flaggan visar redan nationalitet/land.
// OBS: birth_place filtreras INTE här — city-only värden ska visas.
// Landnamn fångas istället av NATIONALITY_TERMS-textfiltret nedan.
const NATIONALITY_HINT_TYPES: string[] = [];

// Nationalitets- och landsord som inte ska synas i ledtrådar.
// Flaggan kommunicerar redan detta — dupliceringen är en onödig ledtråd.
export const NATIONALITY_TERMS = [
  // Adjektiv (engelska)
  'swedish', 'american', 'british', 'english', 'french', 'german',
  'italian', 'spanish', 'norwegian', 'danish', 'finnish', 'canadian',
  'australian', 'dutch', 'belgian', 'swiss', 'portuguese', 'polish',
  'hungarian', 'romanian', 'czech', 'greek', 'turkish', 'japanese',
  'chinese', 'korean', 'brazilian', 'argentinian', 'argentinean', 'mexican',
  'south african', 'nigerian', 'jamaican', 'cuban', 'irish',
  'scottish', 'welsh', 'russian', 'ukrainian', 'austrian', 'colombian',
  'peruvian', 'chilean', 'venezuelan', 'ecuadorian', 'uruguayan',
  // Landnamn
  'sweden', 'united states', 'great britain', 'united kingdom', 'england',
  'france', 'germany', 'italy', 'spain', 'norway', 'denmark', 'finland',
  'canada', 'australia', 'netherlands', 'holland', 'belgium', 'switzerland',
  'portugal', 'poland', 'hungary', 'romania', 'czech republic', 'czechia',
  'greece', 'turkey', 'japan', 'china', 'south korea', 'north korea',
  'brazil', 'argentina', 'mexico', 'south africa', 'nigeria',
  'jamaica', 'cuba', 'ireland', 'scotland', 'wales', 'russia', 'ukraine', 'austria',
  'colombia', 'peru', 'chile', 'venezuela', 'ecuador', 'uruguay',
];

export function isNationalityHint(hint: { type: string }, formattedText: string): boolean {
  if (NATIONALITY_HINT_TYPES.includes(hint.type)) return true;
  const lower = formattedText.toLowerCase();
  return NATIONALITY_TERMS.some((term) => {
    const re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    return re.test(lower);
  });
}

// Känslig information som inte ska visas som ledtråd.
export const SENSITIVE_HINT_TERMS = [
  'died', 'death', 'passed away', 'deceased', 'dead',
  'killed', 'murder', 'suicide', 'overdose',
  'accident', 'crash', 'collision', 'plane crash', 'car crash',
  'cancer', 'illness', 'disease', 'diagnosed', 'tumor', 'tumour',
];

export function isRedundantHint(text: string): boolean {
  const lower = text.toLowerCase();
  return REDUNDANT_HINT_TERMS.some((term) => lower.includes(term));
}

/**
 * En rad räknas som innehållslös om den bara består av skiljetecken/citat-
 * tecken/tumtecken utan en enda bokstav eller siffra — t.ex. en ensam `"`
 * som blir kvar när `censorSensitive`/`censorForAnswer` skär av texten
 * precis efter ett inledande citattecken. En sådan rad ska aldrig visas.
 */
function hasSubstance(text: string): boolean {
  return /[A-Za-zÀ-ÖØ-öø-ÿ0-9]/.test(text);
}

/**
 * Trunkerar texten vid det första känsliga ordet och returnerar texten dessförinnan
 * (trimmad och utan avslutande skiljetecken/parenteser). Om inget återstår → null.
 * Texten visas alltså UTAN den känsliga delen, inte borttagen helt.
 */
export function censorSensitive(text: string): string | null {
  const lower = text.toLowerCase();
  let earliest = -1;
  for (const term of SENSITIVE_HINT_TERMS) {
    const idx = lower.indexOf(term);
    if (idx !== -1 && (earliest === -1 || idx < earliest)) earliest = idx;
  }
  if (earliest === -1) return text;
  const before = text.slice(0, earliest).trim().replace(/[(,:;-]+$/, '').trim();
  return hasSubstance(before) ? before : null;
}

/**
 * Kontrollerar om hint-texten innehåller svaret (displayName) och returnerar
 * i så fall bara texten FÖRE matchningen (trimmat). Om inget återstår → null
 * (= hinten ska hoppas över helt). Matchar case-insensitivt mot hela namnet
 * samt eventuella för-/efternamn separat (skydd mot "Elton John" i "Sir Elton John").
 */
export function censorForAnswer(text: string, answer: string): string | null {
  const lower = text.toLowerCase();
  const answerLower = answer.toLowerCase();
  // Matcha hela svaret samt varje ord i svaret som är längre än 3 tecken.
  // Använder ordgräns (\b) för att undvika falskt träffar inne i sammansatta ord
  // t.ex. "Tider" från "Gyllene Tider" ska INTE matcha inuti "Sommartider".
  const terms = [answerLower, ...answerLower.split(' ').filter((w) => w.length > 3)];
  let earliest = -1;
  for (const term of terms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\b${escaped}\\b`, 'i');
    const match = re.exec(lower);
    if (match && (earliest === -1 || match.index < earliest)) earliest = match.index;
  }
  if (earliest === -1) return text; // inget svar i texten — visa som vanligt
  const before = text.slice(0, earliest).trim().replace(/[,:;-]+$/, '').trim();
  return hasSubstance(before) ? before : null;
}

/**
 * Kör HELA text-pipelinen för en ledtråd och returnerar den färdiga raden,
 * eller null om ledtråden ska hoppas över. Bor här (inte i BulletHint) så
 * dubbletter kan sållas bort innan något renderas — se `resolveHints`.
 *
 * `professionLabel` = rubrikens FAKTISKA Genre·Profession-etikett (kan skilja
 * sig från library.categoryLabel vid crossover, se HintsQuizCard:s
 * `primaryLabel`). Krävs bara för `type === 'profession'`; utelämnad → ingen
 * redundans-strippning körs (profession-hinten visas som den är).
 *
 * `maxChars`/`subMaxChars` = radbudget för huvud- resp. underrader. Default är
 * de konservativa build-tidskonstanterna (HINT_MAX_CHARS/HINT_SUB_MAX_CHARS);
 * HintsQuizCard skickar i stället ett skärmbredds-härlett värde så breda
 * telefoner visar mer text på en rad (se dess kommentar). Backend-export +
 * tester använder default.
 */
export function resolveHintText(
  hint: HintItem,
  answer: string,
  professionLabel?: HintCategoryLabel,
  maxChars: number = HINT_MAX_CHARS,
  subMaxChars: number = HINT_SUB_MAX_CHARS,
): string | null {
  if (hint.type === 'club' || hint.type === 'movie') {
    const noSensitive = censorSensitive(hint.value);
    if (noSensitive === null) return null;
    const censored = censorForAnswer(noSensitive, answer);
    if (censored === null) return null;
    // Klubbnamnet/filmtiteln kortas men årtalen behålls — de bär kronologin
    // i Career History / Film History-grupperingen (se hintsGenerator.ts).
    const fitted = hint.type === 'club' ? fitClubText(censored, subMaxChars) : fitFilmText(censored, subMaxChars);
    return hasSubstance(fitted) ? fitted : null;
  }

  let raw: string;
  if (hint.type === 'profession') {
    const resolved = professionLabel ? resolveProfessionValue(hint.value, professionLabel) : hint.value;
    if (resolved === null) return null; // ren upprepning av rubriken
    raw = resolved;
  } else {
    raw = formatHintText(hint);
  }
  if (isRedundantHint(raw)) return null;
  if (isNationalityHint(hint, raw)) return null;
  const noSensitive = censorSensitive(raw);
  if (noSensitive === null) return null;
  const censored = censorForAnswer(noSensitive, answer);
  if (censored === null) return null;
  // Radanpassning SIST — censureringen ovan kan redan ha kortat texten.
  // Sista, defensiva substanskoll: fitHintText/truncateWords kan i extrema
  // edge-cases (mycket kort maxChars) landa på en ren skiljetecken-rad.
  const fitted = fitHintText(censored, maxChars);
  return hasSubstance(fitted) ? fitted : null;
}

/**
 * Löser upp alla ledtrådar till sina slutliga rader och tar bort dubbletter.
 *
 * Dedupliceringen sker på den RENDERADE texten, inte på råvärdet, eftersom
 * två olika råvärden kan sluta identiska efter kortningen:
 *   • Wikidata listar samma utmärkelse en gång per vinst — Glenn Hysén har
 *     t.ex. 'Kristallkulan' två gånger (identiska råvärden).
 *   • Radanpassningen kan kollapsa olika värden: "Golden Globe Award for Best
 *     Actress – Drama" och "…for Best Actress – Comedy" blir båda
 *     "Golden Globe: Best…".
 *   • Censureringen kan korta två olika ledtrådar till samma rest.
 * Ingen av dem fångas av value-dedupen i selectHints, som dessutom bara körs
 * i grenen för stora bibliotek.
 *
 * Ledtrådar som filtrerats bort tar INTE längre upp en reveal-slot — förr
 * returnerade BulletHint null medan indexet ändå räknades, så det uppstod
 * tysta luckor i takten.
 */
export function resolveHints(
  hints: HintItem[],
  answer: string,
  professionLabel?: HintCategoryLabel,
  maxChars: number = HINT_MAX_CHARS,
  subMaxChars: number = HINT_SUB_MAX_CHARS,
): ResolvedHint[] {
  const seen = new Set<string>();
  const out: ResolvedHint[] = [];
  for (const hint of hints) {
    const text = resolveHintText(hint, answer, professionLabel, maxChars, subMaxChars);
    if (text === null) continue;
    const key = text.toLowerCase().trim();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ hint, text });
  }
  return dropTruncatedNearDupes(out);
}

/**
 * Reducerar en bullet till en jämförbar stam: utan citattecken, avslutande
 * (årtal)-parentes och avslutande ellips/skiljetecken. `"I Will Always Love…"`
 * och `"I Will Always Love You"` får då stammarna `i will always love` resp.
 * `i will always love you` — den förra ett prefix av den senare.
 */
function dedupStem(text: string): string {
  return text
    .toLowerCase()
    .replace(/"/g, '')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .replace(/[…\s.,;:!?)]+$/, '')
    .trim();
}

/** En rad som radanpassningen kortat med ellips (ev. följt av ett citattecken). */
function isTruncatedLine(text: string): boolean {
  return text.replace(/"+\s*$/, '').trimEnd().endsWith('…');
}

/**
 * Sista sållet mot near-dupes (Peter 2026-08-30): en bullet som avkortats med
 * ellips och vars stam är ett prefix av en annan bullet visar samma fakta —
 * eller en oläsbar delmängd av den — två gånger. Whitney Houston fick t.ex.
 * BÅDE `"I Will Always Love…"` och `"I Will Always Love You"`; MTV-pris-
 * ledtrådar kollapsar till `"MTV Movie: Best…"` bredvid `"MTV Movie: Best Kiss"`.
 * Den exakta-text-dedupen ovan missar dem eftersom slutsträngarna skiljer sig.
 *
 * Bara TRUNKERADE rader är borttagningsbara — en fullständig bullet rörs aldrig,
 * så en komplett distinkt ledtråd kan aldrig försvinna. Vinner en trunkerad rad
 * över en annan med samma stam behålls den icke-trunkerade (eller den med lägst
 * index om båda är trunkerade).
 */
function dropTruncatedNearDupes(entries: ResolvedHint[]): ResolvedHint[] {
  const stems = entries.map((e) => dedupStem(e.text));
  return entries.filter((entry, i) => {
    if (!isTruncatedLine(entry.text)) return true;
    const s = stems[i];
    if (s.length < 6) return true;
    const isDup = entries.some((other, j) => {
      if (j === i) return false;
      const sf = stems[j];
      if (sf.startsWith(s) && sf.length > s.length) return true; // en fylligare rad täcker denna
      if (sf === s) return !isTruncatedLine(other.text) || j < i; // samma stam → behåll den bästa
      return false;
    });
    return !isDup;
  });
}

// ── Spelbarhets-gate (Peter 2026-09-03) ──────────────────────────────────────
//
// TVÅ hårda krav — bägge måste hålla för att en Hints-fråga ska visas:
//   1. ≥ 8 råa ledtrådar (MIN_RAW_HINTS). En fråga med färre är för tunn.
//   2. En RIKTIG landsflagga (hasCountryFlag). Flaggan är kärn-ledtråden;
//      en fråga vars enda visuella signal skulle bli den grå `🏳️`-
//      platshållaren (nationality 'unknown' eller ett omappat land) får inte
//      visas. NATIONALITY_OVERRIDES i hintsData.ts appliceras innan
//      HINTS_LIBRARY byggs, så items med korrigerbar nationalitet behåller
//      sin flagga i stället för att gallras bort.
//
// ⚠ Detta ERSÄTTER 2026-08-27-gaten som släppte in items med bara ≥5
// grupperade topp-nivå-bullets. Den vägen lät tunna items (t.ex. `rolandz` =
// 5 lösa fakta + grå flagga) nå spelaren. countPlayableEntries/
// MIN_RENDER_ENTRIES behålls exporterade för ev. framtida bruk men ingår inte
// längre i gaten.
//
// Håll de tre call-sites i synk om regeln ändras: den här funktionen,
// export-image-questions.ts (vad som bakas in i bundlen) och quiz.tsx:s
// runtime-filter (belt-and-suspenders mot en icke-omkörd export) anropar alla
// meetsHintsThreshold, så en ändring här räcker.
export const MIN_RAW_HINTS = 8;
export const MIN_RENDER_ENTRIES = 5;

/**
 * Antal TOPP-nivå-bullets (enskilda + grupp-rubriker) en fråga skulle visa,
 * givet ALLA ledtrådar i biblioteket (inget urval/slump — vi vill veta
 * bästa-fall-antalet, inte en enskild runda). `displayName` används bara som
 * censur-referens (samma som runtime) och `library.categoryLabel` som
 * profession-kontext. Ingår inte längre i gaten (se ovan) men behålls som
 * publik hjälpfunktion.
 */
export function countPlayableEntries(library: HintLibrary, displayName: string): number {
  const all = selectHints(library, library.hints.length);
  const resolved = resolveHints(all, displayName, library.categoryLabel);
  return buildRenderEntries(resolved).length;
}

/**
 * Spelbarhets-gaten själv — används av BÅDE export-image-questions.ts
 * (vad som bakas in i bundlen) och quiz.tsx:s egen runtime-filter (belt-and-
 * suspenders mot en icke-omkörd export). Håll dem i synk om regeln ändras.
 */
export function meetsHintsThreshold(library: HintLibrary | undefined): boolean {
  if (!library) return false;
  if (library.hints.length < MIN_RAW_HINTS) return false;
  return hasCountryFlag(library.nationality);
}

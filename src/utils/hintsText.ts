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

import type { HintItem } from './hintsData';
import { fitClubText, fitHintText, formatHintText } from './hintsGenerator';

/** En ledtråd med sin färdiga, radanpassade text. */
export interface ResolvedHint {
  hint: HintItem;
  text: string;
}

// Termer som redan framgår av rubriken (Genre · Profession) och ska filtreras bort.
export const REDUNDANT_HINT_TERMS = [
  'music artist',
  'musician',
  'recording artist',
];

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
  return before.length > 0 ? before : null;
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
  return before.length > 0 ? before : null;
}

/**
 * Kör HELA text-pipelinen för en ledtråd och returnerar den färdiga raden,
 * eller null om ledtråden ska hoppas över. Bor här (inte i BulletHint) så
 * dubbletter kan sållas bort innan något renderas — se `resolveHints`.
 */
export function resolveHintText(hint: HintItem, answer: string): string | null {
  if (hint.type === 'club') {
    const noSensitive = censorSensitive(hint.value);
    if (noSensitive === null) return null;
    const censored = censorForAnswer(noSensitive, answer);
    if (censored === null) return null;
    // Klubbnamnet kortas men årtalen behålls — de bär kronologin.
    return fitClubText(censored);
  }

  const raw = formatHintText(hint);
  if (isRedundantHint(raw)) return null;
  if (isNationalityHint(hint, raw)) return null;
  const noSensitive = censorSensitive(raw);
  if (noSensitive === null) return null;
  const censored = censorForAnswer(noSensitive, answer);
  if (censored === null) return null;
  // Radanpassning SIST — censureringen ovan kan redan ha kortat texten.
  return fitHintText(censored);
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
export function resolveHints(hints: HintItem[], answer: string): ResolvedHint[] {
  const seen = new Set<string>();
  const out: ResolvedHint[] = [];
  for (const hint of hints) {
    const text = resolveHintText(hint, answer);
    if (text === null) continue;
    const key = text.toLowerCase().trim();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ hint, text });
  }
  return out;
}

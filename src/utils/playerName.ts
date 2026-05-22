// Player Name-format: `[Letters]-[Digits]`
//   • Letters:  1–10 tecken, A–Z (första versal, resten gemener).
//   • Bindesstreck: alltid mellan letter- och digit-sektionen ("fixed").
//   • Digits:   0–7 tecken, 0–9.
//
// Exempel: "Abcdefghi-1234567", "Anna-1", "Guest-".
//
// Auto-genererade namn använder full max för digits (7 siffror) för att
// minimera kollisionsrisk. Letter-sektionen varierar:
//   • prefix='Guest' → "Guest" + 1 versal random = "GuestA" (6 letters).
//                      Med 7 digits = 26 × 10⁷ = 260M unika ID:n — mer än nog.
//   • inget prefix   → 9 random letters (matchar Abcdefghi-exemplet).
//   • keepLetters    → bevarar exakt typade bokstäver, randomiserar bara
//                      digits (används från "Try to keep PlayerName
//                      letters or not?"-prompten).

import { containsProfanity } from './profanity';

export const PLAYER_NAME_MAX_LETTERS = 10;
export const PLAYER_NAME_MAX_DIGITS = 7;
export const PLAYER_NAME_LETTER_RE = /^[A-Za-z]$/;
export const PLAYER_NAME_DIGIT_RE = /^[0-9]$/;
// Canonical-form regex: 1–10 letters (versal-första, sedan A-Za-z), valfri
// dash + 1–7 digits. Tillåter internal uppercase efter första bokstaven så
// auto-genererade Guest-namn ("GuestAbcde") validerar — Guest-prefixet är
// "Guest" (G versal + 4 gemener) följt av en versal random-bokstav, vilket
// matchar `[A-Z][A-Za-z]{0,9}`. Dash + digits är optional men om dash är
// med MÅSTE minst 1 digit följa — orphan trailing dash ("Anna-") är
// invalid format och strippas av `normalizePlayerName`.
export const PLAYER_NAME_FORMAT_RE = /^[A-Z][A-Za-z]{0,9}(-[0-9]{1,7})?$/;
// Intermediate-form: identisk just nu eftersom dash är optional i båda fall.
// Behålls separat för framtida divergens.
const PLAYER_NAME_INTERMEDIATE_RE = /^[A-Z][A-Za-z]{0,9}(-[0-9]{0,7})?$/;

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Två-bokstavs-kombinationer som filtreras bort från den genererade
// letter-sektionens första 2 bokstäver. Synkad med `BLOCKED_LETTER_PAIRS`
// i roomCode.ts. Defense in depth — auto-gen ska aldrig spotta ut ett
// stötande inledande par. Listan inkluderar:
//   • Generella obscena/diskriminerande förkortningar: AS, CP, KK
//   • Hat-symbol-förkortningar: SS, NS, AH, HH
//   • Borderline: NB
const BLOCKED_LETTER_LEAD_PAIRS = new Set([
  'AS', 'CP', 'KK',
  'SS', 'NS', 'AH', 'HH',
  'NB',
]);

// Substrings som inte får finnas (case-insensitive) i letter-sektionen.
// "quizvibe" reserverar brand-namnet — användare ska inte kunna registrera
// sig som "QuizVibe", "Quizvibedude", "MyQuizVibe", etc. Endast letters-
// sektionen kollas (digits filtreras inte). Auto-gen retry:ar om kandidaten
// råkar innehålla strängen.
const BLOCKED_LETTER_SUBSTRINGS = ['quizvibe'];

// Returnerar true om letter-sektionen innehåller någon av de reserverade
// substringen (case-insensitive). Exporteras för validatePlayerName-vägen.
export function containsBlockedLetterSubstring(value: string): boolean {
  const letters = getPlayerNameLetters(value).toLowerCase();
  if (letters.length === 0) return false;
  return BLOCKED_LETTER_SUBSTRINGS.some((sub) => letters.includes(sub));
}

function randomDigits(count: number): string {
  let s = '';
  for (let i = 0; i < count; i++) {
    s += Math.floor(Math.random() * 10);
  }
  return s;
}

function randomUpperLetter(): string {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)];
}

function randomLowerLetter(): string {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)].toLowerCase();
}

// Producerar `Abcdefghi`-format: första versal, resten gemener, exakt `length`
// tecken. Retry:ar om de första 2 bokstäverna träffar blocklistan.
function randomLetters(length: number): string {
  for (let attempt = 0; attempt < 20; attempt++) {
    const first = randomUpperLetter();
    const second = length >= 2 ? randomUpperLetter() : '';
    if (length >= 2 && BLOCKED_LETTER_LEAD_PAIRS.has(first + second)) continue;
    let s = first + (second ? second.toLowerCase() : '');
    for (let i = 2; i < length; i++) {
      s += randomLowerLetter();
    }
    return s;
  }
  // Statistiskt omöjlig fallback.
  return ('A' + 'abcdefghi'.slice(0, Math.max(0, length - 1)));
}

// Normaliserar en bokstavssträng till format-kraven (A–Z bara, första versal,
// resten gemener, max-längd capad). Tomt utfall → tom sträng.
export function normalizeLetters(input: string): string {
  const stripped = input.replace(/[^A-Za-z]/g, '').slice(0, PLAYER_NAME_MAX_LETTERS);
  if (stripped.length === 0) return '';
  return stripped[0].toUpperCase() + stripped.slice(1).toLowerCase();
}

// Hämtar bokstavs-sektionen (allt före första `-`). Om ingen dash finns
// returneras hela strängen.
export function getPlayerNameLetters(value: string): string {
  const dashIdx = value.indexOf('-');
  return dashIdx === -1 ? value : value.slice(0, dashIdx);
}

// Hämtar digit-sektionen (allt efter första `-`). Tom sträng om ingen dash.
export function getPlayerNameDigits(value: string): string {
  const dashIdx = value.indexOf('-');
  return dashIdx === -1 ? '' : value.slice(dashIdx + 1);
}

// Lägger till ett letter-tecken sist i letter-sektionen. Respekterar format:
//   • Bara A-Za-z accepteras.
//   • Insertas alltid sist i letter-sektionen (FÖRE dashen om sådan finns)
//     så användaren kan fortsätta editera letters även efter att digits
//     börjat fyllas i.
//   • Max 10 letters totalt.
//   • Första letter i sektionen blir versal, resterande gemena.
export function appendPlayerNameLetter(value: string, char: string): string {
  if (!PLAYER_NAME_LETTER_RE.test(char)) return value;
  const dashIdx = value.indexOf('-');
  const letters = dashIdx === -1 ? value : value.slice(0, dashIdx);
  const tail = dashIdx === -1 ? '' : value.slice(dashIdx);
  if (letters.length >= PLAYER_NAME_MAX_LETTERS) return value;
  const isFirst = letters.length === 0;
  const c = isFirst ? char.toUpperCase() : char.toLowerCase();
  return letters + c + tail;
}

// Lägger till ett digit-tecken sist i värdet. Respekterar format:
//   • Bara 0-9 accepteras.
//   • Letter-sektionen måste ha minst 1 tecken (annars no-op).
//   • Auto-inserterar dash om den saknas (= första digit-tryck).
//   • Max 7 digits totalt.
export function appendPlayerNameDigit(value: string, char: string): string {
  if (!PLAYER_NAME_DIGIT_RE.test(char)) return value;
  if (value.length === 0) return value;
  let v = value;
  if (!v.includes('-')) {
    v = v + '-';
  }
  const digits = v.slice(v.indexOf('-') + 1);
  if (digits.length >= PLAYER_NAME_MAX_DIGITS) return value;
  return v + char;
}

// Backspace-logik som matchar format:
//   • Tom sträng → no-op.
//   • Sista tecknet är dash (dvs `Abcdef-`) → ta bort dash + sista letter
//     i ett svep så letter-sektionen blir editable igen utan extra tap.
//   • Annars → ta bort sista tecknet (digit eller letter).
export function backspacePlayerName(value: string): string {
  if (value.length === 0) return value;
  if (value.endsWith('-')) {
    return value.slice(0, -2);
  }
  return value.slice(0, -1);
}

// Field-scoped backspace för letter-fältet (split-field UI). Tar bort sista
// tecknet i letter-sektionen — fungerar även när dash + digits finns (digits
// behålls intakta). Specialfall: om backspace tömmer letter-sektionen och
// digits finns, rensar vi även digits + dash eftersom orphan-digits utan
// letters är ett ogiltigt format-tillstånd.
export function backspacePlayerNameLetters(value: string): string {
  if (value.length === 0) return value;
  const dashIdx = value.indexOf('-');
  if (dashIdx === -1) return value.slice(0, -1);
  const letters = value.slice(0, dashIdx);
  if (letters.length === 0) return value;
  const newLetters = letters.slice(0, -1);
  if (newLetters.length === 0) return '';
  return newLetters + value.slice(dashIdx);
}

// Field-scoped backspace för digit-fältet (split-field UI). Två cases:
//   • Digits finns → ta bort sista digit (lämnar dash kvar tills tom).
//   • Bara dash kvar (`Abcd-`) → ta bort dash så letter-fältet blir
//     editable igen direkt.
//   • Ingen dash → no-op (digit-fältet är redan tomt).
export function backspacePlayerNameDigits(value: string): string {
  const dashIdx = value.indexOf('-');
  if (dashIdx === -1) return value;
  const digits = value.slice(dashIdx + 1);
  if (digits.length > 0) return value.slice(0, -1);
  return value.slice(0, dashIdx);
}

// Strippar trailing dash så namn utan digits sparas/visas som "Anna" istället
// för "Anna-". Format-regex:n accepterar både med och utan dash, så strip:en
// är säker — Check-handlers anropar denna före validatePlayerName så
// statusen baseras på den slutgiltiga formen som faktiskt persisteras.
export function normalizePlayerName(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) return '';
  if (trimmed.endsWith('-')) return trimmed.slice(0, -1);
  return trimmed;
}

// Validerar att värdet matchar canonical format (`Abcdef-` eller
// `Abcdef-1234567`). Används av submit-flow:n efter normalizePlayerName.
export function isPlayerNameFormatValid(value: string): boolean {
  return PLAYER_NAME_FORMAT_RE.test(value);
}

// Returnerar true om de första 2 bokstäverna i letter-sektionen träffar
// `BLOCKED_LETTER_LEAD_PAIRS` (case-insensitive). Skyddar manuell input
// från samma stötande inledande par som auto-gen retry:ar bort. Returnerar
// false för 0–1 letter (paret hinner inte bildas än).
export function hasBlockedLetterLead(value: string): boolean {
  const letters = getPlayerNameLetters(value);
  if (letters.length < 2) return false;
  return BLOCKED_LETTER_LEAD_PAIRS.has(letters.slice(0, 2).toUpperCase());
}

// Lättare validering — accepterar även "Abcdef" utan dash (intermediate-form
// medan användaren typar). Används av UI för att visa "format invalid"-feedback
// pre-Check.
export function isPlayerNameIntermediateValid(value: string): boolean {
  return PLAYER_NAME_INTERMEDIATE_RE.test(value);
}

export interface GeneratePlayerNameOptions {
  /**
   * Förinställd start på letter-sektionen, t.ex. "Guest" → "GuestA".
   * Exakt EN versal random-bokstav appendas efter prefix (se "Player Name
   * (registration + validation)" i CLAUDE.md). Prefixet normaliseras enligt
   * format-reglerna (första versal, resten gemener).
   */
  prefix?: string;
  /**
   * Bokstäver som ska UNDVIKAS i versal-positionen efter prefix. Används
   * av Guest-flödet så att två guests i samma lobby inte får samma
   * identifierar-bokstav (GuestA + GuestB istället för GuestA + GuestA).
   * Bara meningsfullt när `prefix` är satt; ignoreras annars. Om alla 26
   * bokstäver är excluded faller helpern tillbaka till en helt random
   * bokstav (statistiskt omöjligt edge case i en lobby med max 12 guests).
   */
  excludeLetters?: Set<string>;
  /**
   * Bevarar exakt dessa bokstäver utan att randomisera dem. Endast digit-
   * sektionen blir slumpad. Typiskt användning: "Try to keep PlayerName
   * letters?" → Yes-branchen passar in användarens typade bokstäver.
   * keepLetters har företräde över prefix.
   */
  keepLetters?: string;
  /**
   * Override för letter-sektionens målängd när varken prefix eller
   * keepLetters anges. Default = 9 (matchar "Abcdefghi"-exemplet).
   */
  targetLetterLength?: number;
}

/**
 * Returnerar Set:en av bokstäver som redan används som identifierar-
 * suffix på Guest-spelare i en lista av spelarnamn. Mönster:
 * `/^Guest([A-Z])/` matchar både kanoniska auto-genererade Guest-namn
 * ("GuestA-1234567") och edge case där användaren typat egen Guest-
 * prefix. Renamed-guests (t.ex. "PlayerXYZ") bidrar inte; deras letter
 * blir frigjord. Anropare ansvarar för att filtrera bort `hasLeft`-
 * spelare innan namn-listan skickas in.
 */
export function extractTakenGuestLetters(names: string[]): Set<string> {
  const letters = new Set<string>();
  for (const name of names) {
    const m = /^Guest([A-Z])/.exec(name);
    if (m) letters.add(m[1]);
  }
  return letters;
}

/**
 * Genererar ett unikt Player Name i formatet `Abcdefghi-1234567`.
 * `taken` är lowercase-Set för case-insensitive collision-check.
 *
 * Retry:ar upp till 50 gånger; med 26⁹ × 10⁷ kombinationer är kollision
 * i praktiken osannolik. Profanity-check körs på candidaten — defense in
 * depth, även om format-genereringen redan är begränsad till A–Z + 0–9.
 */
export function generatePlayerName(
  taken: Set<string>,
  options: GeneratePlayerNameOptions = {},
): string {
  const targetLetterLength = options.targetLetterLength ?? 9;
  const normalizedKeep = options.keepLetters !== undefined
    ? normalizeLetters(options.keepLetters)
    : '';
  const normalizedPrefix = options.prefix !== undefined
    ? normalizeLetters(options.prefix)
    : '';

  const buildLetters = (): string => {
    if (normalizedKeep.length > 0) return normalizedKeep;
    if (normalizedPrefix.length > 0) {
      // Lägg på exakt EN versal random-bokstav efter prefix (var tidigare
      // upp till MAX_LETTERS = 5 random tecken för "Guest"-prefixet). Versal
      // gör visuellt tydligt var prefixet slutar och random-delen börjar:
      // "Guest" + "A" = "GuestA". Defensiv cap mot MAX_LETTERS om prefix
      // redan är maxat (då returneras prefix ensamt).
      if (normalizedPrefix.length >= PLAYER_NAME_MAX_LETTERS) return normalizedPrefix;
      // excludeLetters filtrerar bort bokstäver som redan används av andra
      // guests i lobbyn så två guests inte får samma identifierar-suffix.
      // Bygg available-listan från LETTERS minus excluded. Tom available
      // (alla 26 excluded) → fallback till helt random.
      const excluded = options.excludeLetters;
      if (excluded && excluded.size > 0) {
        const available: string[] = [];
        for (const c of LETTERS) {
          if (!excluded.has(c)) available.push(c);
        }
        if (available.length > 0) {
          const pick = available[Math.floor(Math.random() * available.length)];
          return normalizedPrefix + pick;
        }
      }
      return normalizedPrefix + randomUpperLetter();
    }
    return randomLetters(Math.min(PLAYER_NAME_MAX_LETTERS, Math.max(1, targetLetterLength)));
  };

  for (let i = 0; i < 50; i++) {
    const letters = buildLetters();
    const digits = randomDigits(PLAYER_NAME_MAX_DIGITS);
    const candidate = `${letters}-${digits}`;
    if (
      !taken.has(candidate.toLowerCase()) &&
      !containsProfanity(candidate) &&
      !containsBlockedLetterSubstring(candidate)
    ) {
      return candidate;
    }
  }
  // Statistiskt omöjlig fallback (skulle krävt 50 raka kollisioner).
  const fallbackLetters = buildLetters();
  return `${fallbackLetters}-${Date.now().toString().slice(-PLAYER_NAME_MAX_DIGITS)}`;
}

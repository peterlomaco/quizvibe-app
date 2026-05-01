// Auto-genererat Player Name. Två varianter via `prefix`-arg:
//  • "PlayerName" + 5 siffror + "-" + 2 bokstäver  → Register-flödet (default)
//  • "Guest"      + 5 siffror + "-" + 2 bokstäver  → Guest-flödet (JoinModal)
// Fullt A–Z och 0–9 (inga undantag för förväxlingsbara tecken som i roomCode).

import { containsProfanity } from './profanity';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Två-bokstavs-kombinationer som filtreras bort från det genererade
// suffixet. Synkad med `BLOCKED_LETTER_PAIRS` i roomCode.ts så samma
// stötande pair blockas i alla genererade strängar (rumkoder OCH
// playerName-suffix). Listan inkluderar:
//   • Generella obscena/diskriminerande förkortningar: AS, CP, KK
//   • Hat-symbol-förkortningar: SS, NS, AH, HH
//   • Borderline: NB
// Ingen auto-genererad användare ska behöva förklara bort dessa initialer.
const BLOCKED_LETTER_SUFFIXES = new Set([
  'AS', 'CP', 'KK',
  'SS', 'NS', 'AH', 'HH',
  'NB',
]);

function randomDigits(count: number): string {
  let s = '';
  for (let i = 0; i < count; i++) {
    s += Math.floor(Math.random() * 10);
  }
  return s;
}

function randomLetter(): string {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)];
}

// Drar två slumpade bokstäver men retry:ar om paret hamnar i blocklistan.
// Med 3 blockade par av 676 möjliga är miss-raten <0.5%, så loopen
// avslutas i praktiken alltid på första försöket.
function randomLetterPair(): string {
  for (let i = 0; i < 20; i++) {
    const pair = randomLetter() + randomLetter();
    if (!BLOCKED_LETTER_SUFFIXES.has(pair)) return pair;
  }
  // Statistiskt omöjligt fallback (skulle krävt 20 raka träffar i blocklistan).
  return 'AA';
}

/**
 * Genererar ett unikt Player Name i formatet "{prefix}{5 siffror}-{2 bokstäver}".
 * `taken` förväntas innehålla redan registrerade namn i lowercase — kandidaten
 * jämförs case-insensitive. Försöker upp till 50 gånger; med ~6.7M
 * kombinationer är kollision i praktiken osannolik.
 *
 * `prefix` default = "PlayerName" (Register). Guest-flödet kallar med "Guest"
 * så formulär-defaulten signalerar att användaren joinar utan registrering.
 */
export function generatePlayerName(taken: Set<string>, prefix: string = 'PlayerName'): string {
  for (let i = 0; i < 50; i++) {
    const candidate = `${prefix}${randomDigits(5)}-${randomLetterPair()}`;
    // Defense in depth: även om formatet (fast prefix + digits + bindestreck +
    // filtrerat suffix) gör profanity i praktiken omöjlig, kör candidaten
    // genom containsProfanity för att skydda mot framtida prefix-byten eller
    // l33t-kombinationer i digit-segmentet. Skip kandidat och retry vid hit.
    if (!taken.has(candidate.toLowerCase()) && !containsProfanity(candidate)) {
      return candidate;
    }
  }
  // Fallback (extremt osannolik): timestamp-baserat suffix.
  return `${prefix}${Date.now().toString().slice(-5)}-AA`;
}

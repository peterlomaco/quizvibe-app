// Player Name-moderation: substring-baserad blocklist mot uppenbart
// kränkande/obscena termer. Inte foolproof — kreativ stavning, ny slang
// eller obskyra varianter kan slinka igenom — men fångar majoriteten av
// faktiskt missbruk i MVP.
//
// Listan är medvetet KORT och fokuserad på termer med nära-noll false-
// positive-risk i Player Names (t.ex. "ass" exkluderat eftersom det
// blockerar legit-namn som "Cassidy"). Tradeoff: hellre släppa igenom
// gränsfall än felaktigt avvisa riktiga användarnamn.
//
// TODO (backend): byt till server-side moderation som kan uppdateras
// utan ny app-release. Alternativ när det blir aktuellt:
//   - Egen DB med blocked_terms-tabell + admin-UI för att lägga till nya.
//   - Tredje-parts-API: WebPurify, Microsoft Content Moderator,
//     OpenAI Moderation API. De kan dessutom flagga subtila kontext-
//     beroende fall (sexual content, hate speech) som ren wordlist missar.

const BLOCKED_TERMS = [
  // Svenska — fokus på de tydligt kränkande termerna
  'fitta',
  'kuk',
  'knulla',
  'hora',
  'neger',
  'bög',
  // Engelska
  'fuck',
  'cunt',
  'nigger',
  'faggot',
  'whore',
  'shit',
  'pussy',
];

// Vanliga l33t-substitutioner så "fvck", "n1gger", "5hit" också fångas.
// Listan är kort med flit — överdrivet smarta substitutioner ökar
// false-positive-risken (t.ex. "0" → "o" gör att "Bob0" matchar "boo").
const CHAR_SUBSTITUTIONS: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '@': 'a',
  '$': 's',
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map((c) => CHAR_SUBSTITUTIONS[c] ?? c)
    .join('');
}

/**
 * True om `text` matchar en känd kränkande/obscen term (case-insensitive,
 * med basic l33t-substitutioner). False annars.
 *
 * Auto-genererade Player Names ("PlayerName87321-KL") är alltid säkra
 * eftersom formatet kontrolleras av oss — bara manuellt inmatade namn
 * behöver valideras med denna funktion.
 */
export function containsProfanity(text: string): boolean {
  const normalized = normalize(text);
  return BLOCKED_TERMS.some((term) => normalized.includes(term));
}

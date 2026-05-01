// Strukturerad rumkod: 3 bokstäver + 2 siffror + 1 trailing bokstav,
// t.ex. "AB10X" → display "AB1-09X". Endast engelska alfabetet
// (inga Å/Ä/Ö, inga specialtecken). Bokstäver utesluter O & I för att
// minska visuell förväxling med 0 & 1; siffror använder fullt 0–9 så
// keyboard:n täcker hela numeriska området (eftersom input nu sker via
// CodeKeyboard, inte system-tangentbord, finns ingen risk att användaren
// råkar trycka O istället för 0 — keyboard:n visar bara digit-knappar i
// digit-celler).
// Exporterade så CodeKeyboard:s knapp-rutor speglar exakt samma valid-chars
// som genererings-flödet och sanitize-regexet — om charset ändras slår det
// igenom på keyboard:n automatiskt utan att vi måste hålla två listor i sync.
export const LETTER_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // engelska A–Z minus O & I
export const DIGIT_CHARSET = '1234567890';                // fullt 0–9 (numpad-ordning)

// Blocklistor mot obscena/stötande rumkoder. Filtret gäller på
// genererings-tid så host:en aldrig får en kod att dela vidare, OCH
// på manual-entry-tid i JoinModal:s code-cells så join-formen aldrig
// "godkänner" en triplet som vi själva inte ger ut. (Backend-existence-
// check vore redundant här eftersom rummen aldrig kan skapas med en
// blockad kod till att börja med.)
//
// Bokstavskombos: 3-bokstavs-förkortningar med tydlig obscen/hatlig
// konnotation som råkar vara genererbara med vår charset. Termer som
// förutsätter utelämnade tecken (I/O, Å/Ä/Ö) listas inte här — de är
// redan omöjliga att generera (t.ex. BÖG, HOR, JÄV, PIS).
const BLOCKED_LETTER_TRIPLETS = new Set([
  // Engelska/internationella
  'ASS', 'CUM', 'FAG', 'GAY', 'JEW', 'KKK', 'NAZ', 'SEX', 'FAP',
  // Svenska
  'KUK', 'NEG', 'FAN', 'NMR',
  // Borderline (additivt på explicit user-request) — högre false-positive-
  // risk än ovan, men tillräckligt nedladdade i kontext att inte vara
  // lämpliga som delbara rumkoder.
  'SUG', 'APA', 'BAJ',
]);
// Sifferpar med tydligt sexuell/hatlig konnotation:
//   • 69, 88 — 88 = HH (Heil Hitler, åttonde bokstaven dubblad)
//   • 14, 18 — vit-supremacist-koder (14 ord-slogan; 18 = AH = Adolf Hitler)
// 14/18 var tidigare omöjliga (1 saknades ur DIGIT_CHARSET) men sedan vi
// inkluderat 0/1 måste de blockas explicit.
const BLOCKED_DIGIT_PAIRS = new Set(['14', '18', '69', '88']);

export const ROOM_CODE_LETTERS = 3;
export const ROOM_CODE_DIGITS = 2;
export const ROOM_CODE_TRAILING_LETTERS = 1;
export const ROOM_CODE_LENGTH = ROOM_CODE_LETTERS + ROOM_CODE_DIGITS + ROOM_CODE_TRAILING_LETTERS;

/**
 * True om cell-indexet i en code-cell-rad är en bokstavs-cell (vs siffer-
 * cell). Layout: [letter][letter][letter][digit][digit][letter] för
 * indexes 0–5. Används av JoinModal för att välja keyboardType/
 * autoCapitalize och sanitiserings-regex per cell.
 */
export function isLetterCellIndex(index: number): boolean {
  return index < ROOM_CODE_LETTERS || index >= ROOM_CODE_LETTERS + ROOM_CODE_DIGITS;
}

function randomLetterTriplet(): string {
  // 24³ = 13,824 möjliga, 16 blockade → miss-rate <0.12%; loopen
  // avslutas i praktiken alltid på första försöket.
  for (let i = 0; i < 20; i++) {
    let triplet = '';
    for (let j = 0; j < ROOM_CODE_LETTERS; j++) {
      triplet += LETTER_CHARSET[Math.floor(Math.random() * LETTER_CHARSET.length)];
    }
    if (!BLOCKED_LETTER_TRIPLETS.has(triplet)) return triplet;
  }
  return 'ABC'; // statistiskt omöjligt fallback
}

function randomDigitPair(): string {
  // 10² = 100 möjliga, 4 blockade → miss-rate 4%; klar på första–andra försöket.
  for (let i = 0; i < 20; i++) {
    let pair = '';
    for (let j = 0; j < ROOM_CODE_DIGITS; j++) {
      pair += DIGIT_CHARSET[Math.floor(Math.random() * DIGIT_CHARSET.length)];
    }
    if (!BLOCKED_DIGIT_PAIRS.has(pair)) return pair;
  }
  return '23'; // statistiskt omöjligt fallback
}

function randomTrailingLetter(): string {
  return LETTER_CHARSET[Math.floor(Math.random() * LETTER_CHARSET.length)];
}

export function generateRoomCode(): string {
  return randomLetterTriplet() + randomDigitPair() + randomTrailingLetter();
}

/**
 * True om de 3 bokstäverna matchar en blockad triplet. Används av
 * JoinModal:s code-cell-handler för att stoppa manual entry av samma
 * tripletset som genererings-flödet aldrig delar ut. Input antas vara
 * uppercase A–Z (sanitizeas redan i cell-input:en innan denna kallas).
 */
export function isBlockedLetterTriplet(triplet: string): boolean {
  return BLOCKED_LETTER_TRIPLETS.has(triplet);
}

export function generateJoinUrl(code: string): string {
  return `https://quizvibe.app/join?code=${code}`;
}

/**
 * Display-formaterar en rumkod genom att lägga in ett bindestreck mellan
 * de inledande 3 bokstäverna och resten (siffror + trailing letter), t.ex.
 * "ABC23X" → "ABC-23X". Använd ENBART för visning; den kanoniska formen
 * (utan bindestreck) ska sparas och jämföras som vanligt.
 */
export function formatRoomCode(code: string): string {
  if (code.length <= ROOM_CODE_LETTERS) return code;
  return `${code.slice(0, ROOM_CODE_LETTERS)}-${code.slice(ROOM_CODE_LETTERS)}`;
}
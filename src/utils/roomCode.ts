// Strukturerad rumkod: 2 bokstäver + 2 siffror + 2 trailing bokstäver,
// t.ex. "AB23XY" → display "AB-23-XY". Bindestreck mellan varje
// letter/digit-transition så strukturen är visuellt självförklarande.
// Endast engelska alfabetet (inga Å/Ä/Ö, inga specialtecken). Bokstäver
// utesluter O & I för att minska visuell förväxling med 0 & 1; siffror
// använder fullt 0–9 så keyboard:n täcker hela numeriska området
// (eftersom input nu sker via CodeKeyboard, inte system-tangentbord, finns
// ingen risk att användaren råkar trycka O istället för 0 — keyboard:n
// visar bara digit-knappar i digit-celler).
// Exporterade så CodeKeyboard:s knapp-rutor speglar exakt samma valid-chars
// som genererings-flödet och sanitize-regexet — om charset ändras slår det
// igenom på keyboard:n automatiskt utan att vi måste hålla två listor i sync.
export const LETTER_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // engelska A–Z minus O & I
export const DIGIT_CHARSET = '1234567890';                // fullt 0–9 (numpad-ordning)

// Blocklistor mot obscena/stötande rumkoder. Filtret gäller på
// genererings-tid så host:en aldrig får en kod att dela vidare, OCH
// på manual-entry-tid i JoinModal:s code-cells så join-formen aldrig
// "godkänner" ett par som vi själva inte ger ut. (Backend-existence-
// check vore redundant här eftersom rummen aldrig kan skapas med en
// blockad kod till att börja med.)
//
// Bokstavspar: 2-bokstavs-förkortningar med tydlig obscen/hatlig
// konnotation. Listan appliceras på BÅDA bokstavsparen (leading cell 0–1
// och trailing cell 4–5) — en stötande kombination är stötande oavsett
// position. 24×24 = 576 möjliga par, <2% blockas → false-positives på
// legitima koder är försumbara.
const BLOCKED_LETTER_PAIRS = new Set([
  // Generella obscena/diskriminerande förkortningar (delas med playerName.ts)
  'AS', 'CP', 'KK',
  // Hat-symbol-förkortningar
  'SS', 'NS', 'AH', 'HH',
  // Borderline (kan tas bort om för många false-positives observeras)
  'NB',
]);
// Sifferpar med tydligt sexuell/hatlig konnotation:
//   • 69, 88 — 88 = HH (Heil Hitler, åttonde bokstaven dubblad)
//   • 14, 18 — vit-supremacist-koder (14 ord-slogan; 18 = AH = Adolf Hitler)
// 14/18 var tidigare omöjliga (1 saknades ur DIGIT_CHARSET) men sedan vi
// inkluderat 0/1 måste de blockas explicit.
const BLOCKED_DIGIT_PAIRS = new Set(['14', '18', '69', '88']);

export const ROOM_CODE_LEADING_LETTERS = 2;
export const ROOM_CODE_DIGITS = 2;
export const ROOM_CODE_TRAILING_LETTERS = 2;
export const ROOM_CODE_LENGTH =
  ROOM_CODE_LEADING_LETTERS + ROOM_CODE_DIGITS + ROOM_CODE_TRAILING_LETTERS;

/**
 * True om cell-indexet i en code-cell-rad är en bokstavs-cell (vs siffer-
 * cell). Layout: [letter][letter][digit][digit][letter][letter] för
 * indexes 0–5. Används av JoinModal för att välja keyboard-mode och
 * sanitiserings-regex per cell.
 */
export function isLetterCellIndex(index: number): boolean {
  return (
    index < ROOM_CODE_LEADING_LETTERS ||
    index >= ROOM_CODE_LEADING_LETTERS + ROOM_CODE_DIGITS
  );
}

function randomLetterPair(): string {
  // 24² = 576 möjliga, ≤8 blockade → miss-rate <1.5%; loopen avslutas
  // i praktiken alltid på första försöket.
  for (let i = 0; i < 20; i++) {
    let pair = '';
    for (let j = 0; j < ROOM_CODE_LEADING_LETTERS; j++) {
      pair += LETTER_CHARSET[Math.floor(Math.random() * LETTER_CHARSET.length)];
    }
    if (!BLOCKED_LETTER_PAIRS.has(pair)) return pair;
  }
  return 'AB'; // statistiskt omöjligt fallback
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

export function generateRoomCode(): string {
  return randomLetterPair() + randomDigitPair() + randomLetterPair();
}

/**
 * True om de 2 bokstäverna matchar ett blockat par. Används av
 * JoinModal:s code-cell-handler för att stoppa manual entry av samma
 * par som genererings-flödet aldrig delar ut. Appliceras på både
 * leading-paret (cell 0–1) och trailing-paret (cell 4–5). Input antas
 * vara uppercase A–Z (sanitizeas redan i cell-input:en innan denna kallas).
 */
export function isBlockedLetterPair(pair: string): boolean {
  return BLOCKED_LETTER_PAIRS.has(pair);
}

export function generateJoinUrl(code: string): string {
  return `https://quizvibe.app/join?code=${code}`;
}

/**
 * Display-formaterar en rumkod genom att lägga in bindestreck mellan
 * varje letter/digit-segment, t.ex. "AB23XY" → "AB-23-XY". Använd ENBART
 * för visning; den kanoniska formen (utan bindestreck) ska sparas och
 * jämföras som vanligt.
 */
export function formatRoomCode(code: string): string {
  if (code.length <= ROOM_CODE_LEADING_LETTERS) return code;
  const middleEnd = ROOM_CODE_LEADING_LETTERS + ROOM_CODE_DIGITS;
  const leading = code.slice(0, ROOM_CODE_LEADING_LETTERS);
  const middle = code.slice(ROOM_CODE_LEADING_LETTERS, middleEnd);
  const trailing = code.slice(middleEnd);
  return [leading, middle, trailing].filter(Boolean).join('-');
}

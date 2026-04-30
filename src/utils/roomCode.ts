// Strukturerad rumkod: 3 bokstäver + 2 siffror, t.ex. "ABC23".
// Endast engelska alfabetet (inga Å/Ä/Ö, inga specialtecken).
// Förväxlingsbara tecken (O/I bland bokstäver, 0/1 bland siffror) är
// borttagna för att minska risken för fel-inmatning.
const LETTER_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // engelska A–Z minus O & I
const DIGIT_CHARSET = '23456789';                  // 0–9 minus 0 & 1

export const ROOM_CODE_LETTERS = 3;
export const ROOM_CODE_DIGITS = 2;
export const ROOM_CODE_LENGTH = ROOM_CODE_LETTERS + ROOM_CODE_DIGITS;

export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LETTERS; i++) {
    code += LETTER_CHARSET[Math.floor(Math.random() * LETTER_CHARSET.length)];
  }
  for (let i = 0; i < ROOM_CODE_DIGITS; i++) {
    code += DIGIT_CHARSET[Math.floor(Math.random() * DIGIT_CHARSET.length)];
  }
  return code;
}

export function generateJoinUrl(code: string): string {
  return `https://quizvibe.app/join?code=${code}`;
}

/**
 * Display-formaterar en rumkod genom att lägga in ett bindestreck mellan
 * bokstavs- och siffer-delen, t.ex. "ABC23" → "ABC-23". Använd ENBART för
 * visning; den kanoniska formen (utan bindestreck) ska sparas och
 * jämföras som vanligt.
 */
export function formatRoomCode(code: string): string {
  if (code.length <= ROOM_CODE_LETTERS) return code;
  return `${code.slice(0, ROOM_CODE_LETTERS)}-${code.slice(ROOM_CODE_LETTERS)}`;
}
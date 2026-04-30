// Auto-genererat Player Name i Register-flödet. Format:
// "PlayerName" + 5 siffror + "-" + 2 bokstäver, t.ex. "PlayerName87321-KL".
// Fullt A–Z och 0–9 (inga undantag för förväxlingsbara tecken som i roomCode).

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

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

/**
 * Genererar ett unikt Player Name i formatet "PlayerName{5 siffror}-{2 bokstäver}".
 * `taken` förväntas innehålla redan registrerade namn i lowercase — kandidaten
 * jämförs case-insensitive. Försöker upp till 50 gånger; med ~6.7M
 * kombinationer är kollision i praktiken osannolik.
 */
export function generatePlayerName(taken: Set<string>): string {
  for (let i = 0; i < 50; i++) {
    const candidate = `PlayerName${randomDigits(5)}-${randomLetter()}${randomLetter()}`;
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }
  // Fallback (extremt osannolik): timestamp-baserat suffix.
  return `PlayerName${Date.now().toString().slice(-5)}-AA`;
}

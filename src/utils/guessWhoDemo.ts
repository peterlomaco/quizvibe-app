// Demo-data för "Guess Who" split-view-prototypen (app/guess-who-demo.tsx).
//
// Speglar de 4 ledtrådarna som doodle-briefs.ts (backend) genererar per person.
// `sketchKey` pekar på en nyckel i QUIZ_SKETCHES (src/utils/quizSketches.ts) så
// prototypen renderar mot en befintlig asset direkt — när du kört
// `npm run doodle-generate --all` + `npm run sync-quiz-sketches` dyker de nya
// doodle-assetsen upp där och kan väljas i demo-skärmen.
//
// Detta är PROTOTYP-data (standalone-utforskning), inte wired till live-quiz.

export interface GuessWhoClues {
  /** Ledtråd 1 — typ. */
  category: 'Sport' | 'Music' | 'Film';
  /** Ledtråd 2 — peak-era. */
  era: string;
  /** Ledtråd 3 — ursprungsland. */
  country: string;
  /** Ledtråd 4 — 1-2 igenkännings-ord. */
  recognition: string;
}

export interface GuessWhoDemoItem {
  /** kebab-case-id (matchar doodle-brief + sketch-asset). */
  id: string;
  /** Nyckel i QUIZ_SKETCHES att rendera doodeln från. */
  sketchKey: string;
  displayName: string;
  clues: GuessWhoClues;
}

// Förinställda ledtråds-set per id. Default-asseten 'carlos-valderrama' finns
// redan i QUIZ_SKETCHES; de övriga aktiveras när motsvarande doodle genererats.
export const GUESS_WHO_DEMO: GuessWhoDemoItem[] = [
  {
    id: 'carlos-valderrama',
    sketchKey: 'carlos-valderrama',
    displayName: 'Carlos Valderrama',
    clues: { category: 'Sport', era: '1990s', country: 'Colombia', recognition: 'The Afro' },
  },
  {
    id: 'tomas-brolin',
    sketchKey: 'tomas-brolin',
    displayName: 'Tomas Brolin',
    clues: { category: 'Sport', era: '1990s', country: 'Sweden', recognition: "Italia '90" },
  },
  {
    id: 'diego-maradona',
    sketchKey: 'diego-maradona',
    displayName: 'Diego Maradona',
    clues: { category: 'Sport', era: '1980s', country: 'Argentina', recognition: 'Hand of God' },
  },
  {
    id: 'zlatan-ibrahimovic',
    sketchKey: 'zlatan-ibrahimovic',
    displayName: 'Zlatan Ibrahimović',
    clues: { category: 'Sport', era: '2010s', country: 'Sweden', recognition: 'The Kick' },
  },
  {
    id: 'freddie-mercury',
    sketchKey: 'freddie-mercury',
    displayName: 'Freddie Mercury',
    clues: { category: 'Music', era: '1980s', country: 'UK', recognition: 'The Stance' },
  },
  {
    id: 'abba',
    sketchKey: 'abba',
    displayName: 'ABBA',
    clues: { category: 'Music', era: '1970s', country: 'Sweden', recognition: 'Glam jumpsuits' },
  },
];

/** Default-clues för en sketch-nyckel utan preset (generisk fallback i demon). */
export const GENERIC_CLUES: GuessWhoClues = {
  category: 'Sport',
  era: '—',
  country: '—',
  recognition: '—',
};

export function findGuessWhoDemo(sketchKey: string): GuessWhoDemoItem | undefined {
  return GUESS_WHO_DEMO.find((d) => d.sketchKey === sketchKey || d.id === sketchKey);
}

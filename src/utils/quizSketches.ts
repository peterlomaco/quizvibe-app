// Auto-genererad sketch-katalog för line-art-bildfrågor (assets/quiz-sketches/).
//
// Genererad av backend/scripts/sync-quiz-sketches.ts — kör `npm run sync-quiz-sketches`
// efter att nya produktions-sketches processats. Registrerar BARA webps vars id matchar
// ett katalog-item (sketch-id = katalog-id → hasSketch(question.id)). Experiment-/
// jämförelse-webps ignoreras automatiskt. REDIGERA INTE FÖR HAND.
//
// require() måste vara statiska i Metro/RN → varje sketch listas explicit.

import type { ImageSourcePropType } from 'react-native';

export const QUIZ_SKETCHES: Record<string, ImageSourcePropType> = {
  'carlos-valderrama': require('../../assets/quiz-sketches/carlos-valderrama.webp'),
  'tomas-brolin': require('../../assets/quiz-sketches/tomas-brolin.webp'),
  'zlatan-ibrahimovic': require('../../assets/quiz-sketches/zlatan-ibrahimovic.webp'),
};

/** Finns en tecknad sketch för detta item-id? Driver pencil_sketch-routning. */
export function hasSketch(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(QUIZ_SKETCHES, id);
}

/** Hämta sketch-source för rendering, eller null om saknas. */
export function getQuizSketch(id: string): ImageSourcePropType | null {
  return QUIZ_SKETCHES[id] ?? null;
}

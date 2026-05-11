// Auto-generatable bild-katalog för quiz-frågor.
// require()-statements måste vara statiska i Metro/RN, så vi kan inte loop:a
// över filenames runtime — varje bild måste explicit listas här.
//
// När backend processar fler items: kopiera webp till assets/quiz-images/
// och lägg till en rad i QUIZ_IMAGES nedan.

import type { ImageSourcePropType } from 'react-native';

export const QUIZ_IMAGES: Record<string, ImageSourcePropType> = {
  'astrid-lindgren': require('../../assets/quiz-images/astrid-lindgren.webp'),
  'avicii': require('../../assets/quiz-images/avicii.webp'),
  'barack-obama': require('../../assets/quiz-images/barack-obama.webp'),
  'berlin': require('../../assets/quiz-images/berlin.webp'),
  'bjorn-borg': require('../../assets/quiz-images/bjorn-borg.webp'),
  'cristiano-ronaldo': require('../../assets/quiz-images/cristiano-ronaldo.webp'),
  'elvis-presley': require('../../assets/quiz-images/elvis-presley.webp'),
  'lionel-messi': require('../../assets/quiz-images/lionel-messi.webp'),
  'london': require('../../assets/quiz-images/london.webp'),
  'madonna': require('../../assets/quiz-images/madonna.webp'),
  'michael-jackson': require('../../assets/quiz-images/michael-jackson.webp'),
  'mrbeast': require('../../assets/quiz-images/mrbeast.webp'),
  'paris': require('../../assets/quiz-images/paris.webp'),
  'stockholm': require('../../assets/quiz-images/stockholm.webp'),
  'taylor-swift': require('../../assets/quiz-images/taylor-swift.webp'),
  'winston-churchill': require('../../assets/quiz-images/winston-churchill.webp'),
  'zlatan-ibrahimovic': require('../../assets/quiz-images/zlatan-ibrahimovic.webp'),
};

/** Lista över alla item-id:n som har en lokal bild tillgänglig. */
export const QUIZ_IMAGE_IDS = Object.keys(QUIZ_IMAGES);

/** Säker lookup — returnerar null om id saknar bild. */
export function getQuizImage(itemId: string): ImageSourcePropType | null {
  return QUIZ_IMAGES[itemId] ?? null;
}

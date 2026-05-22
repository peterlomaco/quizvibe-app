// Auto-generatable bild-katalog för quiz-frågor.
// require()-statements måste vara statiska i Metro/RN, så vi kan inte loop:a
// över filenames runtime — varje bild måste explicit listas här.
//
// När backend processar fler items: kopiera webp till assets/quiz-images/
// och lägg till en rad i QUIZ_IMAGES nedan.

import type { ImageSourcePropType } from 'react-native';

export const QUIZ_IMAGES: Record<string, ImageSourcePropType> = {
  'armand-duplantis': require('../../assets/quiz-images/armand-duplantis.webp'),
  'arnold-schwarzenegger': require('../../assets/quiz-images/arnold-schwarzenegger.webp'),
  'avicii': require('../../assets/quiz-images/avicii.webp'),
  'berlin': require('../../assets/quiz-images/berlin.webp'),
  'bjorn-borg': require('../../assets/quiz-images/bjorn-borg.webp'),
  'carl-lewis': require('../../assets/quiz-images/carl-lewis.webp'),
  'cristiano-ronaldo': require('../../assets/quiz-images/cristiano-ronaldo.webp'),
  'diego-maradona': require('../../assets/quiz-images/diego-maradona.webp'),
  'elvis-presley': require('../../assets/quiz-images/elvis-presley.webp'),
  'ingrid-bergman': require('../../assets/quiz-images/ingrid-bergman.webp'),
  'jennifer-aniston': require('../../assets/quiz-images/jennifer-aniston.webp'),
  'lasse-aberg': require('../../assets/quiz-images/lasse-aberg.webp'),
  'lionel-messi': require('../../assets/quiz-images/lionel-messi.webp'),
  'london': require('../../assets/quiz-images/london.webp'),
  'madonna': require('../../assets/quiz-images/madonna.webp'),
  'magic-johnson': require('../../assets/quiz-images/magic-johnson.webp'),
  'marilyn-monroe': require('../../assets/quiz-images/marilyn-monroe.webp'),
  'mark-spitz': require('../../assets/quiz-images/mark-spitz.webp'),
  'michael-jackson': require('../../assets/quiz-images/michael-jackson.webp'),
  'michael-jordan': require('../../assets/quiz-images/michael-jordan.webp'),
  'muhammad-ali': require('../../assets/quiz-images/muhammad-ali.webp'),
  'paris': require('../../assets/quiz-images/paris.webp'),
  'pele': require('../../assets/quiz-images/pele.webp'),
  'peter-forsberg': require('../../assets/quiz-images/peter-forsberg.webp'),
  'roger-federer': require('../../assets/quiz-images/roger-federer.webp'),
  'serena-williams': require('../../assets/quiz-images/serena-williams.webp'),
  'steffi-graf': require('../../assets/quiz-images/steffi-graf.webp'),
  'stockholm': require('../../assets/quiz-images/stockholm.webp'),
  'taylor-swift': require('../../assets/quiz-images/taylor-swift.webp'),
  'usain-bolt': require('../../assets/quiz-images/usain-bolt.webp'),
  'zlatan-ibrahimovic': require('../../assets/quiz-images/zlatan-ibrahimovic.webp'),
};

/** Lista över alla item-id:n som har en lokal bild tillgänglig. */
export const QUIZ_IMAGE_IDS = Object.keys(QUIZ_IMAGES);

/** Säker lookup — returnerar null om id saknar bild. */
export function getQuizImage(itemId: string): ImageSourcePropType | null {
  return QUIZ_IMAGES[itemId] ?? null;
}

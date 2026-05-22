// Auto-generatable bild-katalog för quiz-frågor.
// require()-statements måste vara statiska i Metro/RN, så vi kan inte loop:a
// över filenames runtime — varje bild måste explicit listas här.
//
// När backend processar fler items: kopiera webp till assets/quiz-images/
// och lägg till en rad i QUIZ_IMAGES nedan.

import type { ImageSourcePropType } from 'react-native';

export const QUIZ_IMAGES: Record<string, ImageSourcePropType> = {
  'abba': require('../../assets/quiz-images/abba.webp'),
  'acdc': require('../../assets/quiz-images/acdc.webp'),
  'armand-duplantis': require('../../assets/quiz-images/armand-duplantis.webp'),
  'arnold-schwarzenegger': require('../../assets/quiz-images/arnold-schwarzenegger.webp'),
  'audrey-hepburn': require('../../assets/quiz-images/audrey-hepburn.webp'),
  'avicii': require('../../assets/quiz-images/avicii.webp'),
  'beatles': require('../../assets/quiz-images/beatles.webp'),
  'berlin': require('../../assets/quiz-images/berlin.webp'),
  'bjorn-borg': require('../../assets/quiz-images/bjorn-borg.webp'),
  'carl-lewis': require('../../assets/quiz-images/carl-lewis.webp'),
  'cristiano-ronaldo': require('../../assets/quiz-images/cristiano-ronaldo.webp'),
  'denmark': require('../../assets/quiz-images/denmark.webp'),
  'diego-maradona': require('../../assets/quiz-images/diego-maradona.webp'),
  'elvis-presley': require('../../assets/quiz-images/elvis-presley.webp'),
  'emma-stone': require('../../assets/quiz-images/emma-stone.webp'),
  'florence-pugh': require('../../assets/quiz-images/florence-pugh.webp'),
  'france': require('../../assets/quiz-images/france.webp'),
  'germany': require('../../assets/quiz-images/germany.webp'),
  'ingrid-bergman': require('../../assets/quiz-images/ingrid-bergman.webp'),
  'italy': require('../../assets/quiz-images/italy.webp'),
  'japan': require('../../assets/quiz-images/japan.webp'),
  'jenna-ortega': require('../../assets/quiz-images/jenna-ortega.webp'),
  'jennifer-aniston': require('../../assets/quiz-images/jennifer-aniston.webp'),
  'julia-roberts': require('../../assets/quiz-images/julia-roberts.webp'),
  'lasse-aberg': require('../../assets/quiz-images/lasse-aberg.webp'),
  'led-zeppelin': require('../../assets/quiz-images/led-zeppelin.webp'),
  'leonardo-dicaprio': require('../../assets/quiz-images/leonardo-dicaprio.webp'),
  'lionel-messi': require('../../assets/quiz-images/lionel-messi.webp'),
  'london': require('../../assets/quiz-images/london.webp'),
  'madonna': require('../../assets/quiz-images/madonna.webp'),
  'magic-johnson': require('../../assets/quiz-images/magic-johnson.webp'),
  'margot-robbie': require('../../assets/quiz-images/margot-robbie.webp'),
  'marilyn-monroe': require('../../assets/quiz-images/marilyn-monroe.webp'),
  'mark-spitz': require('../../assets/quiz-images/mark-spitz.webp'),
  'michael-jackson': require('../../assets/quiz-images/michael-jackson.webp'),
  'michael-jordan': require('../../assets/quiz-images/michael-jordan.webp'),
  'millie-bobby-brown': require('../../assets/quiz-images/millie-bobby-brown.webp'),
  'muhammad-ali': require('../../assets/quiz-images/muhammad-ali.webp'),
  'nirvana': require('../../assets/quiz-images/nirvana.webp'),
  'norway': require('../../assets/quiz-images/norway.webp'),
  'paris': require('../../assets/quiz-images/paris.webp'),
  'pele': require('../../assets/quiz-images/pele.webp'),
  'peter-forsberg': require('../../assets/quiz-images/peter-forsberg.webp'),
  'pink-floyd': require('../../assets/quiz-images/pink-floyd.webp'),
  'queen': require('../../assets/quiz-images/queen.webp'),
  'roger-federer': require('../../assets/quiz-images/roger-federer.webp'),
  'rolling-stones': require('../../assets/quiz-images/rolling-stones.webp'),
  'serena-williams': require('../../assets/quiz-images/serena-williams.webp'),
  'steffi-graf': require('../../assets/quiz-images/steffi-graf.webp'),
  'stockholm': require('../../assets/quiz-images/stockholm.webp'),
  'sweden': require('../../assets/quiz-images/sweden.webp'),
  'taylor-swift': require('../../assets/quiz-images/taylor-swift.webp'),
  'tom-hanks': require('../../assets/quiz-images/tom-hanks.webp'),
  'tom-holland': require('../../assets/quiz-images/tom-holland.webp'),
  'united-states': require('../../assets/quiz-images/united-states.webp'),
  'usain-bolt': require('../../assets/quiz-images/usain-bolt.webp'),
  'zlatan-ibrahimovic': require('../../assets/quiz-images/zlatan-ibrahimovic.webp'),
};

/** Lista över alla item-id:n som har en lokal bild tillgänglig. */
export const QUIZ_IMAGE_IDS = Object.keys(QUIZ_IMAGES);

/** Säker lookup — returnerar null om id saknar bild. */
export function getQuizImage(itemId: string): ImageSourcePropType | null {
  return QUIZ_IMAGES[itemId] ?? null;
}

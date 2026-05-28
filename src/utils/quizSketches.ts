// Sketch-katalog för "pencil_sketch"-frågor — vit-på-mörk AI-/filter-tecknade
// porträtt genererade av backend/sketch/generate.ts (assets/quiz-sketches/).
//
// Samma princip som quizImages.ts: Metro/RN kräver statiska require() — kan inte
// loop:as runtime, så varje sketch måste listas explicit. Lägg till en rad när
// en ny sketch processats. (Ett sync-script kan auto-generera denna fil senare,
// likt scripts/sync-quiz-images.ts.)
//
// Routning: en image-fråga vars id finns här renderas som "pencil_sketch"
// (live-drawing-canvas). Saknas den faller quiz.tsx tillbaka till NameRevealCard.

import type { ImageSourcePropType } from 'react-native';

export const QUIZ_SKETCHES: Record<string, ImageSourcePropType> = {
  pele: require('../../assets/quiz-sketches/pele.webp'),
  // Ikoniskt action-ögonblick (Pelé, 1970 VM-firande). Inget image-question-id
  // matchar detta än → routas inte i spel, men listas i sketch-demo-previewen.
  // Två versioner för jämförelse: edges (deterministisk) vs fal (AI img2img).
  'pele-moore-1970': require('../../assets/quiz-sketches/pele-moore-1970.webp'),
  'pele-moore-1970-fal': require('../../assets/quiz-sketches/pele-moore-1970-fal.webp'),
  'pele-moore-1970-canny': require('../../assets/quiz-sketches/pele-moore-1970-canny.webp'),
  // Valderrama-jämförelse: edges vs poster (3-tons stencil) vs poster+rembg.
  'valderrama-edges': require('../../assets/quiz-sketches/valderrama-edges.webp'),
  'valderrama-poster': require('../../assets/quiz-sketches/valderrama-poster.webp'),
  // Vinnande receptet: birefnet bg-removal → poster på svart (ren figur).
  'valderrama-poster-clean': require('../../assets/quiz-sketches/valderrama-poster-clean.webp'),
  // Pencil/charcoal-stil (kontinuerlig ton, mörkt-på-vitt) — ny stil-riktning.
  'valderrama-pencil': require('../../assets/quiz-sketches/valderrama-pencil.webp'),
  // VINNANDE: pencil + rembg → rembg tar bort ljus bakgrund INNAN colour-dodge
  // → afron renderas djärv/mörk (washas inte ut) + ren vit botten. Matchar ref.
  'valderrama-pencil-clean': require('../../assets/quiz-sketches/valderrama-pencil-clean.webp'),
  // COMPLIANT: pencil + rembg + logo-mask (--mask) → klubbmärke + tillverkarlogga
  // bortmaskade. Tröjnummer ("10") BEHÅLLS (ej skyddat). Produktions-receptet.
  'valderrama-pencil-nologo': require('../../assets/quiz-sketches/valderrama-pencil-nologo.webp'),
  // LINE ART-jämförelse (Maradona-stil, smala tydliga streck, svart-på-vitt):
  // edges (gratis, äkta likhet, men brus) vs AI canny (renare linjer MEN ansiktet
  // driftar = ej igenkännbart → fel för recognition-quiz, bekräftar edges-vägen).
  'valderrama-lineart-edges': require('../../assets/quiz-sketches/valderrama-lineart-edges.webp'),
  'valderrama-lineart-ai': require('../../assets/quiz-sketches/valderrama-lineart-ai.webp'),
  // VINNANDE LINE ART: edges + CLAHE (tydligare ansikte) + levels-clean (brus →
  // vitt). Ren vit botten, äkta likhet, mörka tydliga linjer. Märket kvar (maskas).
  'valderrama-lineart-clean': require('../../assets/quiz-sketches/valderrama-lineart-clean.webp'),
  // PRODUKTION: nyckeln = katalog-item-id:t `carlos-valderrama` → quiz.tsx renderar
  // Valderrama-bildfrågan via hasSketch() som 3-fas line art-reveal i Q:t. edges +
  // crest-mask (förbundsmärket raderat, "10" behållet). End-to-end wired.
  'carlos-valderrama': require('../../assets/quiz-sketches/carlos-valderrama.webp'),
};

/** Finns en tecknad sketch för detta item-id? Driver pencil_sketch-routning. */
export function hasSketch(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(QUIZ_SKETCHES, id);
}

/** Hämta sketch-source för rendering, eller null om saknas. */
export function getQuizSketch(id: string): ImageSourcePropType | null {
  return QUIZ_SKETCHES[id] ?? null;
}

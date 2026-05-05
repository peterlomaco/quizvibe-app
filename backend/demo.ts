import { loadCatalog, findItemsById } from './content/registry';
import {
  buildLetterGrid,
  buildNameOptions,
  getPrefixForItem,
} from './content/distractors';

const catalog = loadCatalog();
const avicii = findItemsById(catalog, 'avicii')[0].item;

console.log('=== Exempel: Spelare = Millennials, standard assistance ===');
console.log('Frågan: "Who is the Artist?"');
console.log('Rätt svar: Avicii');
console.log();

const grid = buildLetterGrid({
  catalog,
  category: 'persons',
  playerGeneration: 'millennials',
  correctItem: avicii,
  prefixLength: 2,
});

console.log(`Steg 1 — Letter Grid (${grid.length} knappar):`);
for (const o of grid) {
  console.log(`  [${o.prefix}]${o.isCorrect ? '  ← rätt' : ''}`);
}
console.log();

const correctChoice = buildNameOptions({
  catalog,
  category: 'persons',
  playerGeneration: 'millennials',
  correctItem: avicii,
  selectedPrefix: 'AV',
  prefixLength: 2,
});
console.log('Steg 2a — spelaren valde "AV" (rätt prefix):');
for (const o of correctChoice) {
  console.log(`  ${o.displayName}${o.isCorrect ? '  ← rätt' : ''}`);
}
console.log();

const wrongChoice = buildNameOptions({
  catalog,
  category: 'persons',
  playerGeneration: 'millennials',
  correctItem: avicii,
  selectedPrefix: 'ZL',
  prefixLength: 2,
});
console.log('Steg 2b — spelaren valde "ZL" (fel prefix, inget rätt-svar visas):');
for (const o of wrongChoice) {
  console.log(`  ${o.displayName}${o.isCorrect ? '  ← rätt' : ''}`);
}

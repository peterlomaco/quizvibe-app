// Auto-generera src/utils/quizSketches.ts från assets/quiz-sketches/.
//
// Till skillnad från sync-quiz-images (som scannar ALLA webps) registrerar denna
// BARA sketch-webps vars id matchar ett riktigt katalog-item — konventionen som
// quiz.tsx bygger på är att sketch-id = katalog-id, så `hasSketch(question.id)`
// träffar. Experiment-/jämförelse-webps (lineart-edges/ai/clean, pencil/poster-
// tester osv.) saknar matchande katalog-id → ignoreras automatiskt och listas som
// orphans, så de aldrig tyst promotas till produktion.
//
// require() måste vara statiska i Metro/RN → varje sketch listas explicit.
//
// Användning: npm run sync-quiz-sketches  (kör efter att nya produktions-sketches
// processats via sketch-generate / sketch-generate --batch).

import * as path from 'path';
import { promises as fs } from 'fs';
import { loadCatalog } from '../content/registry';

const ASSETS_DIR = path.join(__dirname, '..', '..', 'assets', 'quiz-sketches');
const OUTPUT_FILE = path.join(__dirname, '..', '..', 'src', 'utils', 'quizSketches.ts');

function catalogItemIds(): Set<string> {
  // Active-katalogen (includeDeferred: false). Deferred-filerna saknar region-
  // fältet och fail:ar validering; deferred-items är ändå inte V1-spelbara, så en
  // sketch behöver bara matcha ett aktivt katalog-item.
  const catalog = loadCatalog(undefined, { includeDeferred: false });
  const ids = new Set<string>();
  for (const file of catalog.files.values()) {
    for (const item of file.items) ids.add(item.id);
  }
  return ids;
}

async function main() {
  const dirFiles = await fs.readdir(ASSETS_DIR);
  const allIds = dirFiles
    .filter((f) => f.endsWith('.webp'))
    .map((f) => f.replace(/\.webp$/, ''))
    .sort();
  const catalogIds = catalogItemIds();
  const registered = allIds.filter((id) => catalogIds.has(id));
  const orphans = allIds.filter((id) => !catalogIds.has(id));

  const lines: string[] = [
    '// Auto-genererad sketch-katalog för line-art-bildfrågor (assets/quiz-sketches/).',
    '//',
    '// Genererad av backend/scripts/sync-quiz-sketches.ts — kör `npm run sync-quiz-sketches`',
    '// efter att nya produktions-sketches processats. Registrerar BARA webps vars id matchar',
    '// ett katalog-item (sketch-id = katalog-id → hasSketch(question.id)). Experiment-/',
    '// jämförelse-webps ignoreras automatiskt. REDIGERA INTE FÖR HAND.',
    '//',
    '// require() måste vara statiska i Metro/RN → varje sketch listas explicit.',
    '',
    "import type { ImageSourcePropType } from 'react-native';",
    '',
    'export const QUIZ_SKETCHES: Record<string, ImageSourcePropType> = {',
  ];
  for (const id of registered) {
    lines.push(`  '${id}': require('../../assets/quiz-sketches/${id}.webp'),`);
  }
  lines.push('};');
  lines.push('');
  lines.push('/** Finns en tecknad sketch för detta item-id? Driver pencil_sketch-routning. */');
  lines.push('export function hasSketch(id: string): boolean {');
  lines.push('  return Object.prototype.hasOwnProperty.call(QUIZ_SKETCHES, id);');
  lines.push('}');
  lines.push('');
  lines.push('/** Hämta sketch-source för rendering, eller null om saknas. */');
  lines.push('export function getQuizSketch(id: string): ImageSourcePropType | null {');
  lines.push('  return QUIZ_SKETCHES[id] ?? null;');
  lines.push('}');
  lines.push('');

  await fs.writeFile(OUTPUT_FILE, lines.join('\n'), 'utf8');
  console.log(`Wrote ${registered.length} produktions-sketch(es) to ${OUTPUT_FILE}`);
  if (registered.length) console.log(`  registrerade: ${registered.join(', ')}`);
  if (orphans.length) {
    console.log(
      `\nIgnorerade ${orphans.length} webp(s) utan matchande katalog-id (experiment/orphan, ej registrerade):`,
    );
    for (const o of orphans) console.log(`  - ${o}.webp`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

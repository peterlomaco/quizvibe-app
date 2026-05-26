// Auto-generera src/utils/quizImages.ts från filer i assets/quiz-images/.
// Säkerställer att require()-map är synk med faktiska assets, undviker
// manuella alphabetical-insertions vid stora batch-rounds.
//
// Användning: tsx scripts/sync-quiz-images.ts

import * as path from 'path';
import { promises as fs } from 'fs';

const ASSETS_DIR = path.join(__dirname, '..', '..', 'assets', 'quiz-images');
const OUTPUT_FILE = path.join(__dirname, '..', '..', 'src', 'utils', 'quizImages.ts');

async function main() {
  const files = await fs.readdir(ASSETS_DIR);
  const webps = files
    .filter((f) => f.endsWith('.webp'))
    .map((f) => f.replace(/\.webp$/, ''))
    .sort();

  const lines: string[] = [
    '// Auto-generatable bild-katalog för quiz-frågor.',
    '// require()-statements måste vara statiska i Metro/RN, så vi kan inte loop:a',
    '// över filenames runtime — varje bild måste explicit listas här.',
    '//',
    '// Auto-genererad av backend/scripts/sync-quiz-images.ts.',
    "// När du processar nya items via batch-wikimedia-process, kör sedan",
    '// `tsx scripts/sync-quiz-images.ts` så uppdateras detta map automatiskt.',
    '',
    "import type { ImageSourcePropType } from 'react-native';",
    '',
    'export const QUIZ_IMAGES: Record<string, ImageSourcePropType> = {',
  ];
  for (const id of webps) {
    lines.push(`  '${id}': require('../../assets/quiz-images/${id}.webp'),`);
  }
  lines.push('};');
  lines.push('');
  lines.push('/** Lista över alla item-id:n som har en lokal bild tillgänglig. */');
  lines.push('export const QUIZ_IMAGE_IDS = Object.keys(QUIZ_IMAGES);');
  lines.push('');
  lines.push('/** Säker lookup — returnerar null om id saknar bild. */');
  lines.push('export function getQuizImage(itemId: string): ImageSourcePropType | null {');
  lines.push('  return QUIZ_IMAGES[itemId] ?? null;');
  lines.push('}');
  lines.push('');

  await fs.writeFile(OUTPUT_FILE, lines.join('\n'), 'utf8');
  console.log(`Wrote ${webps.length} entries to ${OUTPUT_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

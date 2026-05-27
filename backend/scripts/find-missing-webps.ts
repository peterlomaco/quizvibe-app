import { loadCatalog } from '../content/registry';
import { existsSync } from 'fs';
import { join } from 'path';

const ASSETS_DIR = join(__dirname, '..', '..', 'assets', 'quiz-images');

async function main() {
  const { files } = loadCatalog();
  const imageItems: Array<{
    id: string;
    displayName: string;
    file: string;
    category: string;
    subject: string;
  }> = [];

  for (const [filename, file] of files) {
    if (file.contentForm !== 'image') continue;
    for (const item of file.items) {
      imageItems.push({
        id: item.id,
        displayName: item.displayName,
        file: filename,
        category: file.category,
        subject: file.contentSubject,
      });
    }
  }

  const missing = imageItems.filter((i) => !existsSync(join(ASSETS_DIR, `${i.id}.webp`)));

  console.log(`Total image items: ${imageItems.length}`);
  console.log(`With webp: ${imageItems.length - missing.length}`);
  console.log(`Missing webp: ${missing.length}`);
  console.log('');

  const byFile = new Map<string, typeof missing>();
  for (const item of missing) {
    if (!byFile.has(item.file)) byFile.set(item.file, []);
    byFile.get(item.file)!.push(item);
  }

  for (const [filename, items] of [...byFile.entries()].sort()) {
    console.log(`\n=== ${filename} (${items.length}) ===`);
    for (const item of items) {
      console.log(`  ${item.id.padEnd(40)} ${item.displayName}`);
    }
  }
}

main();

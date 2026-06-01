import * as fs from 'fs';
import * as path from 'path';
import { loadCatalog } from '../content/registry';

const ASSETS = path.join(__dirname, '..', '..', 'assets', 'quiz-images');
const haveWebp = new Set(
  fs.readdirSync(ASSETS).filter((f) => f.endsWith('.webp')).map((f) => f.replace(/\.webp$/, '')),
);

const cat = loadCatalog(undefined, { includeDeferred: false });
const rows: any[] = [];
for (const [filename, file] of cat.files) {
  for (const item of file.items) {
    rows.push({
      id: item.id,
      name: item.displayName,
      file: filename,
      category: file.category,
      subject: file.contentSubject,
      form: file.contentForm,
      audience: file.audience.join('|'),
      hasWebp: haveWebp.has(item.id),
    });
  }
}
fs.writeFileSync(path.join(__dirname, '_catalog-dump.json'), JSON.stringify(rows, null, 2));
console.log(`Total items: ${rows.length}`);
console.log(`Image-form items: ${rows.filter((r) => r.form === 'image').length}`);
console.log(`With webp: ${rows.filter((r) => r.hasWebp).length}`);
console.log(`Image-form WITHOUT webp: ${rows.filter((r) => r.form === 'image' && !r.hasWebp).length}`);
// orphan webps (file exists but not in catalog)
const ids = new Set(rows.map((r) => r.id));
const orphans = [...haveWebp].filter((id) => !ids.has(id));
console.log(`Orphan webps (not in catalog): ${orphans.length}`);

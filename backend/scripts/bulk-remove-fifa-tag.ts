// Bulk-remove pkg-fifa-wc-tag from items (keeps item + webp for base-pool).

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const CATALOG = join(__dirname, '..', 'content', 'catalog');

const removeIds: string[] = [
  'aime-jacquet',
  'ahn-jung-hwan',
  'alessandro-del-piero',
  'carlos-valderrama',
  'cha-bum-kun',
  'claudio-caniggia',
  'cuauhtemoc-blanco',
  'david-beckham',
  'didier-drogba',
  'enzo-francescoli',
  'freddie-ljungberg',
  'garrincha',
  'gheorghe-hagi',
  'gheorghe-popescu',
  'jamie-carragher',
  'jean-marie-pfaff',
  'jean-pierre-papin',
  'john-barnes',
  'juan-roman-riquelme',
  'just-fontaine',
  'kaka',
  'karim-benzema',
  'marcel-desailly',
  'marco-van-basten',
  'patrick-kluivert',
  'peter-shilton',
  'rinus-michels',
  'roberto-carlos',
  'romario',
  'roy-keane',
  'xavi',
];

const files = readdirSync(CATALOG).filter((f) => f.startsWith('athletes-') && f.endsWith('.yaml'));

let totalRemoved = 0;
for (const filename of files) {
  const path = join(CATALOG, filename);
  let content = readFileSync(path, 'utf8');
  const useCRLF = content.includes('\r\n');
  const EOL = useCRLF ? '\r\n' : '\n';
  const lines = content.split(/\r?\n/);

  let removedInFile = 0;
  for (const id of removeIds) {
    const startIdx = lines.findIndex((l) => l.trim() === `- id: ${id}`);
    if (startIdx === -1) continue;
    // Find end of item block (next item or section)
    let endIdx = lines.length;
    for (let i = startIdx + 1; i < lines.length; i++) {
      if (/^  - id:/.test(lines[i]) || /^[a-z#]/.test(lines[i])) {
        endIdx = i;
        break;
      }
    }
    // Find and remove the pkg-fifa-wc line (or genrePackages line that only has fifa-wc)
    for (let i = startIdx + 1; i < endIdx; i++) {
      if (lines[i].includes('pkg-fifa-wc') && lines[i].includes('genrePackages')) {
        lines.splice(i, 1);
        removedInFile++;
        break;
      }
    }
  }

  if (removedInFile > 0) {
    content = lines.join(EOL);
    writeFileSync(path, content);
    console.log(`  ${filename}: ${removedInFile} tags removed`);
    totalRemoved += removedInFile;
  }
}
console.log(`\nTotal removed: ${totalRemoved}`);

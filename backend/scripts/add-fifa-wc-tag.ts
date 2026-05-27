import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const CATALOG = join(__dirname, '..', 'content', 'catalog');

interface Target { file: string; id: string; }
const targets: Target[] = [
  { file: 'athletes-elder-gen-x.yaml', id: 'nils-liedholm' },
];

const byFile = new Map<string, string[]>();
for (const t of targets) {
  if (!byFile.has(t.file)) byFile.set(t.file, []);
  byFile.get(t.file)!.push(t.id);
}

for (const [filename, ids] of byFile) {
  const path = join(CATALOG, filename);
  let content = readFileSync(path, 'utf8');
  const useCRLF = content.includes('\r\n');
  const EOL = useCRLF ? '\r\n' : '\n';

  let added = 0;
  for (const id of ids) {
    const lines = content.split(/\r?\n/);
    const startIdx = lines.findIndex((l) => l.trim() === `- id: ${id}`);
    if (startIdx === -1) {
      console.log(`  ! ${id}: not found in ${filename}`);
      continue;
    }
    let endIdx = lines.length;
    for (let i = startIdx + 1; i < lines.length; i++) {
      if (/^  - id:/.test(lines[i]) || /^[a-z#]/.test(lines[i])) {
        endIdx = i;
        break;
      }
    }
    const block = lines.slice(startIdx, endIdx);
    if (block.some((l) => l.includes('pkg-fifa-wc'))) {
      console.log(`  . ${id}: already tagged`);
      continue;
    }
    if (block.some((l) => l.includes('genrePackages:'))) {
      console.log(`  ! ${id}: has other genrePackages`);
      continue;
    }
    const amIdx = block.findIndex((l) => l.includes('answerMethods:'));
    if (amIdx === -1) {
      console.log(`  ! ${id}: no answerMethods line`);
      continue;
    }
    block.splice(amIdx + 1, 0, '    genrePackages: ["pkg-fifa-wc"]');
    lines.splice(startIdx, endIdx - startIdx, ...block);
    content = lines.join(EOL);
    added++;
    console.log(`  ok ${id}`);
  }

  if (added > 0) {
    writeFileSync(path, content);
    console.log(`Wrote ${added} updates to ${filename}`);
  }
}

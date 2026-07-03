// fix-qnumber-hints.mts
// Slår upp alla råa Wikidata Q-nummer i hintsDataGenerated.ts mot Wikidata API
// och ersätter dem med läsbara labels (sv → en → "Unknown award" fallback).
// Kör: npx tsx backend/scripts/fix-qnumber-hints.mts

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const FILE = resolve('src/utils/hintsDataGenerated.ts');

// Hitta alla unika Q-nummer i filen
const content = readFileSync(FILE, 'utf-8');
const qPattern = /value: '(Q\d+)'/g;
const qNumbers = new Set<string>();
let m: RegExpExecArray | null;
while ((m = qPattern.exec(content)) !== null) {
  qNumbers.add(m[1]);
}

console.log(`Hittade ${qNumbers.size} unika Q-nummer: ${[...qNumbers].join(', ')}\n`);

// Wikidata batch-lookup — max 50 IDs per anrop
async function lookupLabels(ids: string[]): Promise<Map<string, string>> {
  const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids.join('|')}&props=labels&languages=sv%7Cen&format=json`;
  const resp = await fetch(url);
  const data = await resp.json() as any;
  const result = new Map<string, string>();
  for (const [id, entity] of Object.entries<any>(data.entities ?? {})) {
    const label =
      entity.labels?.sv?.value ||
      entity.labels?.en?.value ||
      null;
    result.set(id, label ?? '');
  }
  return result;
}

// Dela upp i batches om 50
const ids = [...qNumbers];
const labels = new Map<string, string>();
for (let i = 0; i < ids.length; i += 50) {
  const batch = ids.slice(i, i + 50);
  const result = await lookupLabels(batch);
  for (const [k, v] of result) labels.set(k, v);
  if (i + 50 < ids.length) await new Promise(r => setTimeout(r, 500));
}

console.log('Labels:');
for (const [q, label] of labels) {
  console.log(`  ${q} → "${label || '(ingen label)'}"`);
}
console.log();

// Ersätt i filen
let fixed = content;
let replaced = 0;
let removed = 0;

for (const [q, label] of labels) {
  if (!label) {
    // Ingen label hittades — ta bort hela hint-raden
    const linePattern = new RegExp(`\\n?[ \\t]*\\{ id: '\\w+', type: '\\w+', label: '[^']*', value: '${q}', priority: \\d \\},?`, 'g');
    const before = fixed;
    fixed = fixed.replace(linePattern, '');
    if (fixed !== before) {
      console.log(`  Raderar rad med ${q} (ingen label)`);
      removed++;
    }
  } else {
    // Ersätt värdet
    const valPattern = new RegExp(`value: '${q}'`, 'g');
    const before = fixed;
    fixed = fixed.replace(valPattern, `value: '${label}'`);
    if (fixed !== before) {
      const count = (before.match(valPattern) ?? []).length;
      console.log(`  ${q} → "${label}" (${count} ersättning${count > 1 ? 'ar' : ''})`);
      replaced += count;
    }
  }
}

writeFileSync(FILE, fixed, 'utf-8');
console.log(`\nKlart: ${replaced} ersatta, ${removed} raderade rader.`);

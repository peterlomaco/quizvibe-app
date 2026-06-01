import * as fs from 'fs';
import * as path from 'path';

const rows: any[] = JSON.parse(fs.readFileSync(path.join(__dirname, '_catalog-dump.json'), 'utf8'));

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/[\.\-_'’&]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const byNorm = new Map<string, any[]>();
for (const r of rows) {
  const k = norm(r.name);
  if (!byNorm.has(k)) byNorm.set(k, []);
  byNorm.get(k)!.push(r);
  // also index by id
  const kid = norm(r.id.replace(/-/g, ' '));
  if (kid !== k) {
    if (!byNorm.has(kid)) byNorm.set(kid, []);
    byNorm.get(kid)!.push(r);
  }
}

function match(name: string) {
  const k = norm(name);
  if (byNorm.has(k)) return byNorm.get(k)!;
  // try contains
  const hits: any[] = [];
  for (const [nk, arr] of byNorm) {
    if (nk === k) continue;
    if (nk.includes(k) || k.includes(nk)) hits.push(...arr);
  }
  return hits;
}

// Task 1
const t1 = fs.readFileSync(path.join(__dirname, '_task1-names.txt'), 'utf8').trim().split('\n').map((l) => l.trim()).filter(Boolean);
const t1matched: any[] = [];
const t1unmatched: string[] = [];
for (const name of t1) {
  const m = match(name);
  if (m.length) t1matched.push({ name, ids: [...new Set(m.map((x) => x.id))], files: [...new Set(m.map((x) => x.file))] });
  else t1unmatched.push(name);
}

// Task 2
const t2 = fs.readFileSync(path.join(__dirname, '_task2-names.txt'), 'utf8').trim().split('\n').map((l) => l.trim()).filter(Boolean);
const t2exists: any[] = [];
const t2missing: any[] = [];
for (const line of t2) {
  const [name, cat] = line.split('|');
  const m = match(name);
  if (m.length) t2exists.push({ name, cat, ids: [...new Set(m.map((x) => x.id))] });
  else t2missing.push({ name, cat });
}

console.log('===== TASK 1 (replace) =====');
console.log(`Matched: ${t1matched.length} / ${t1.length}`);
console.log('UNMATCHED task1:', JSON.stringify(t1unmatched));
console.log('\n===== TASK 2 (new Swedes) =====');
console.log(`Already in catalog: ${t2exists.length}`);
console.log(`MISSING (need to add): ${t2missing.length}`);
console.log('\nMISSING list:');
for (const m of t2missing) console.log(`  [${m.cat}] ${m.name}`);

fs.writeFileSync(path.join(__dirname, '_t1matched.json'), JSON.stringify(t1matched, null, 2));
fs.writeFileSync(path.join(__dirname, '_t2missing.json'), JSON.stringify(t2missing, null, 2));
fs.writeFileSync(path.join(__dirname, '_t2exists.json'), JSON.stringify(t2exists, null, 2));

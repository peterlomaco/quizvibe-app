import * as fs from 'fs';
import * as path from 'path';
const STAGING = path.join(__dirname, '..', 'output', 'wikidata');
const ASSETS = path.join(__dirname, '..', '..', 'assets', 'quiz-images');
const man = JSON.parse(fs.readFileSync(path.join(__dirname, '_wikidata-manifest.json'), 'utf8'));
// Skip entities whose description is NOT Swedish (wrong-entity success)
const SKIP = new Set(['jerry-williams-sv']);
let applied = 0; const appliedIds: string[] = [];
for (const m of man) {
  if (m.status !== 'success') continue;
  if (SKIP.has(m.id)) continue;
  const desc = (m.desc || '').toLowerCase();
  if (!/svensk|swed/.test(desc)) { console.log('SKIP non-swedish:', m.id, m.desc); continue; }
  const src = path.join(STAGING, m.id + '.webp');
  if (!fs.existsSync(src)) { console.log('MISSING staging:', m.id); continue; }
  fs.copyFileSync(src, path.join(ASSETS, m.id + '.webp'));
  applied++; appliedIds.push(m.id);
}
console.log('Applied', applied, 'Wikidata P18 images.');
fs.writeFileSync(path.join(__dirname,'_wikidata-applied-ids.json'), JSON.stringify(appliedIds,null,1));

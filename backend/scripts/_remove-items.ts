/**
 * Remove catalog item blocks by id from all catalog YAML files (text-level,
 * preserves comments/formatting), then delete their webp assets + staged
 * replace-candidates. Run sync + export afterwards.
 * Usage: npx tsx scripts/_remove-items.ts id1 id2 ...
 */
import * as fs from 'fs';
import * as path from 'path';

const ids = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!ids.length) { console.error('no ids'); process.exit(1); }
const idSet = new Set(ids);

const CATALOG = path.join(__dirname, '..', 'content', 'catalog');
const ASSETS = path.join(__dirname, '..', '..', 'assets', 'quiz-images');
const STAGING = path.join(__dirname, '..', 'output', 'replace-candidates');

const removedFrom: Record<string, string[]> = {};

for (const file of fs.readdirSync(CATALOG).filter((f) => f.endsWith('.yaml'))) {
  const full = path.join(CATALOG, file);
  const lines = fs.readFileSync(full, 'utf8').split('\n');
  const out: string[] = [];
  let i = 0;
  let changed = false;
  const idRe = /^  - id:\s*([A-Za-z0-9-]+)\s*$/;
  while (i < lines.length) {
    const m = lines[i].match(idRe);
    if (m && idSet.has(m[1])) {
      // skip dash line + all following item-field lines (indent >= 4 spaces)
      const id = m[1];
      i++;
      while (i < lines.length && /^ {4,}\S/.test(lines[i])) i++;
      (removedFrom[file] ??= []).push(id);
      changed = true;
      continue;
    }
    out.push(lines[i]);
    i++;
  }
  if (changed) fs.writeFileSync(full, out.join('\n'), 'utf8');
}

console.log('Removed from catalog:');
for (const [f, list] of Object.entries(removedFrom)) console.log(`  ${f}: ${list.join(', ')}`);
const found = new Set(Object.values(removedFrom).flat());
const missing = ids.filter((id) => !found.has(id));
if (missing.length) console.log('NOT FOUND in catalog:', missing.join(', '));

// delete webp + staged candidate
for (const id of ids) {
  for (const p of [path.join(ASSETS, id + '.webp'), path.join(STAGING, id + '.webp')]) {
    if (fs.existsSync(p)) { fs.unlinkSync(p); console.log('deleted', path.relative(path.join(__dirname, '..', '..'), p)); }
  }
}

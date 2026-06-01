/**
 * Apply approved Task-1 replacement candidates into assets/quiz-images/.
 * Usage:
 *   npx tsx scripts/_apply-t1.ts all                 # apply every staged candidate
 *   npx tsx scripts/_apply-t1.ts id1 id2 id3 ...      # apply only these
 *   npx tsx scripts/_apply-t1.ts all --except a,b,c   # apply all but these
 * After applying, run:  npx tsx scripts/sync-quiz-images.ts && npm run export-image-questions
 */
import * as fs from 'fs';
import * as path from 'path';
const dir = __dirname;
const STAGING = path.join(dir, '..', 'output', 'replace-candidates');
const ASSETS = path.join(dir, '..', '..', 'assets', 'quiz-images');
const args = process.argv.slice(2);
const exceptIdx = args.indexOf('--except');
const except = exceptIdx >= 0 ? (args[exceptIdx + 1] || '').split(',').map((s) => s.trim()).filter(Boolean) : [];
const positional = (exceptIdx >= 0 ? args.slice(0, exceptIdx) : args).filter((a) => !a.startsWith('--'));

const staged = fs.readdirSync(STAGING).filter((f) => f.endsWith('.webp')).map((f) => f.replace(/\.webp$/, ''));
let ids: string[];
if (positional.length === 1 && positional[0] === 'all') ids = staged.filter((id) => !except.includes(id));
else ids = positional.filter((id) => staged.includes(id));

let n = 0;
for (const id of ids) {
  const src = path.join(STAGING, id + '.webp');
  if (!fs.existsSync(src)) { console.log('skip (no staged):', id); continue; }
  fs.copyFileSync(src, path.join(ASSETS, id + '.webp'));
  n++;
}
console.log(`Applied ${n} replacement images.`);
console.log('Now run:  npx tsx scripts/sync-quiz-images.ts && npm run export-image-questions');

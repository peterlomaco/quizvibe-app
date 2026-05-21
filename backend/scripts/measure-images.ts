import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const dir = path.join(__dirname, '..', '..', 'assets', 'quiz-images');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.webp')).sort();
(async () => {
  for (const f of files) {
    const md = await sharp(path.join(dir, f)).metadata();
    if (!md.width || !md.height) continue;
    const ar = (md.width / md.height).toFixed(3);
    const orient = md.width >= md.height ? 'landscape' : 'PORTRAIT';
    console.log(`${f.padEnd(30)} ${String(md.width).padStart(5)}x${md.height}  AR=${ar}  ${orient}`);
  }
})();

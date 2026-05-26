import { readFileSync } from 'fs';
import { parse } from 'yaml';

const files = ['songs-elder', 'songs-gen-x', 'songs-millennials'];
const allMissing = [];
for (const f of files) {
  const doc = parse(readFileSync(`content/catalog/${f}.yaml`, 'utf8'));
  for (const item of doc.items) {
    if (!item.youtubeClips || item.youtubeClips.length === 0) {
      allMissing.push({
        file: f,
        id: item.id,
        displayName: item.displayName,
        year: item.correctYear,
        prob: item.probability,
      });
    }
  }
}
allMissing.sort((a, b) => b.prob - a.prob);
console.log(JSON.stringify(allMissing, null, 2));
console.log(`Total missing: ${allMissing.length}`);

import * as fs from 'fs';
import * as path from 'path';

const dir = __dirname;
const read = (f: string) => (fs.existsSync(path.join(dir, f)) ? JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) : []);

const orig = read('_new-swedes-manifest.json');     // original sv-pageimage fetch
const wd = read('_wikidata-manifest.json');          // wikidata pass
const wdApplied: string[] = read('_wikidata-applied-ids.json');
const rescue = read('_rescue-manifest.json');
const table = read('_new-swedes.json');

const appliedSet = new Set(wdApplied);
const rescueById = new Map(rescue.map((r: any) => [r.id, r]));
const wdById = new Map(wd.map((r: any) => [r.id, r]));
const origById = new Map(orig.map((r: any) => [r.id, r]));

const ASSETS = path.join(dir, '..', '..', 'assets', 'quiz-images');
const have = new Set(fs.readdirSync(ASSETS).filter((f) => f.endsWith('.webp')).map((f) => f.replace(/\.webp$/, '')));

interface Final {
  id: string; name: string; file: string; hasImage: boolean;
  source: string; url?: string; license?: string | null; artist?: string | null; desc?: string;
  note?: string;
}

const finals: Final[] = [];
for (const t of table) {
  let source = 'none', url, license, artist, desc, note;
  if (rescueById.has(t.id)) {
    const r: any = rescueById.get(t.id);
    source = 'wikidata-rescue'; url = r.url; license = r.license; artist = r.artist; note = 'rescued via Wikidata P18';
  } else if (appliedSet.has(t.id)) {
    const r: any = wdById.get(t.id);
    source = 'wikidata-P18'; url = r?.url; license = r?.license; artist = r?.artist; desc = r?.desc;
  } else {
    const r: any = origById.get(t.id);
    if (r && r.status === 'success') { source = 'wikipedia/commons'; url = r.url; license = r.license; artist = r.artist; }
  }
  const hasImage = have.has(t.id);
  if (!hasImage) note = 'NO FREE IMAGE FOUND — dormant (catalog entry only)';
  finals.push({ id: t.id, name: t.name, file: t.file, hasImage, source, url, license, artist, desc, note });
}

// Attribution markdown
let md = '# New Swedish image items — attribution & status (2026-06-01)\n\n';
md += `Total catalog entries added: ${finals.length}. With image: ${finals.filter((f) => f.hasImage).length}. Dormant (no free image): ${finals.filter((f) => !f.hasImage).length}.\n\n`;
md += '| id | name | file | image | source | license | photographer | note |\n|---|---|---|---|---|---|---|---|\n';
for (const f of finals) {
  md += `| ${f.id} | ${f.name} | ${f.file} | ${f.hasImage ? 'yes' : 'NO'} | ${f.source} | ${f.license ?? ''} | ${(f.artist ?? '').slice(0, 40)} | ${f.note ?? ''} |\n`;
}
fs.writeFileSync(path.join(dir, '..', '..', 'docs', 'new-swedes-attribution.md'), md);

// Review HTML (with image)
const withImg = finals.filter((f) => f.hasImage);
let html = `<!doctype html><html><head><meta charset="utf-8"><title>New Swedes review</title>
<style>body{font-family:sans-serif;background:#111;color:#eee;padding:16px} h2{color:#4DA3FF}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px}
.card{background:#1c1c1c;border:1px solid #333;border-radius:8px;padding:8px}
.card img{width:100%;height:200px;object-fit:contain;background:#000;border-radius:4px}
.name{font-weight:700;margin-top:6px} .meta{font-size:11px;color:#999;margin-top:3px}
.lic{font-size:10px;color:#6c6}</style></head><body>
<h1>New Swedish image items — ${withImg.length} with image (verify identity)</h1>`;
const groups = [...new Set(withImg.map((f) => f.file))];
for (const g of groups) {
  html += `<h2>${g}</h2><div class="grid">`;
  for (const f of withImg.filter((x) => x.file === g)) {
    const rel = `../../assets/quiz-images/${f.id}.webp`;
    html += `<div class="card"><img src="${rel}"><div class="name">${f.name}</div>
<div class="meta">${f.id}<br>src: ${f.source}</div><div class="lic">${f.license ?? '?'}</div></div>`;
  }
  html += `</div>`;
}
const dormant = finals.filter((f) => !f.hasImage);
html += `<h2 style="color:#e66">Dormant — no free image found (${dormant.length})</h2><ul>`;
for (const f of dormant) html += `<li>${f.name} (${f.id}) — ${f.file}</li>`;
html += `</ul></body></html>`;
fs.writeFileSync(path.join(dir, '..', 'output', 'new-swedes-review.html'), html);

console.log('Wrote docs/new-swedes-attribution.md and backend/output/new-swedes-review.html');
console.log(`with image: ${withImg.length}, dormant: ${dormant.length}`);

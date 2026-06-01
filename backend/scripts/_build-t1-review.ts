import * as fs from 'fs';
import * as path from 'path';
const dir = __dirname;
const STAGING = path.join(dir, '..', 'output', 'replace-candidates');
const man = JSON.parse(fs.readFileSync(path.join(dir, '_t1-candidates-manifest.json'), 'utf8'))
  // drop items whose staged candidate was removed (e.g. items purged from the pool)
  .filter((m: any) => fs.existsSync(path.join(STAGING, m.id + '.webp')));
const input = JSON.parse(fs.readFileSync(path.join(dir, '_t1-input.json'), 'utf8'));
const fileById = new Map(input.map((r: any) => [r.id, r.file]));

// HTML saved at backend/output/replace-review.html
// current asset: ../../assets/quiz-images/<id>.webp
// candidate:     replace-candidates/<id>.webp
let html = `<!doctype html><html><head><meta charset="utf-8"><title>Task 1 — replacement candidates</title>
<style>
body{font-family:sans-serif;background:#0e0e0e;color:#eee;padding:16px}
h1{color:#4DA3FF} h2{color:#F5A623;margin-top:28px;border-bottom:1px solid #333;padding-bottom:4px}
.row{display:flex;gap:10px;align-items:flex-start;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px;margin:8px 0}
.col{flex:1;text-align:center}
.col img{width:100%;max-width:260px;height:240px;object-fit:contain;background:#000;border-radius:4px}
.lbl{font-size:12px;color:#888;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px}
.cur .lbl{color:#bbb} .cand .lbl{color:#6c6}
.info{flex:1.1;font-size:13px}
.name{font-weight:700;font-size:16px;color:#fff} .id{color:#888;font-size:12px}
.desc{color:#9cf;margin-top:6px} .lic{color:#6c6;font-size:12px;margin-top:4px}
.note{color:#e88;font-size:12px;margin-top:4px}
</style></head><body>
<h1>Task 1 — replacement-image candidates (${man.length} items)</h1>
<p style="color:#bbb">Left = current image in app. Right = candidate from Wikidata canonical photo (P18), entity verified by description. Nothing has been overwritten. Tell me which ids to apply (or "apply all"), and I'll copy the candidates into <code>assets/quiz-images/</code>.</p>`;

const files = [...new Set(man.map((m: any) => fileById.get(m.id) || 'unknown'))].sort();
for (const f of files) {
  const items = man.filter((m: any) => (fileById.get(m.id) || 'unknown') === f);
  html += `<h2>${f} (${items.length})</h2>`;
  for (const m of items) {
    const cur = `../../assets/quiz-images/${m.id}.webp`;
    const cand = m.outW ? `replace-candidates/${m.id}.webp` : '';
    html += `<div class="row">
<div class="col cur"><div class="lbl">current</div><img src="${cur}" onerror="this.style.opacity=.2"></div>
<div class="col cand"><div class="lbl">candidate</div>${cand ? `<img src="${cand}">` : '<div style="color:#e88">no candidate</div>'}</div>
<div class="info"><div class="name">${m.name}</div><div class="id">${m.id} · ${f}</div>
<div class="desc">WD: ${m.desc ?? '?'} (${m.qid ?? ''})</div>
<div class="lic">candidate license: ${m.license ?? '?'}${m.outW ? ` · ${m.outW}×${m.outH}` : ''}</div>
${m.status === 'success-low' ? '<div class="note">low-confidence occupation match — verify</div>' : ''}
${m.artist ? `<div class="lic" style="color:#888">© ${String(m.artist).slice(0, 60)}</div>` : ''}
</div></div>`;
  }
}
html += `</body></html>`;
fs.writeFileSync(path.join(dir, '..', 'output', 'replace-review.html'), html);
console.log('Wrote backend/output/replace-review.html with', man.length, 'comparison rows');

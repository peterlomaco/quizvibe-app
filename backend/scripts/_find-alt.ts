/**
 * For each item: resolve Wikidata entity (description-disambiguated) → its
 * Commons category (P373) → list many real photos (categorymembers + imageinfo),
 * plus text-search fallback. Excludes the already-rejected P18. Builds an HTML
 * contact sheet (current + alternatives) with per-candidate index + full URL.
 * Peter picks "<id>: <index>" (or pastes a URL) and I process via batch-by-url.
 */
import * as fs from 'fs';
import * as path from 'path';
const UA = 'QuizVibeBackend/0.1 (dev; mailto:dev@quizvibe.local)';
const dir = __dirname;
const OUT = path.join(dir, '..', 'output');
const rows: any[] = JSON.parse(fs.readFileSync(path.join(dir, '_alt-input.json'), 'utf8'));
const onlyIds = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const targets = onlyIds.length ? rows.filter((r) => onlyIds.includes(r.id)) : rows;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const esc = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function j(url: string) { const r = await fetch(url, { headers: { 'User-Agent': UA } }); return r.json() as any; }
async function wbSearch(name: string, lang: string) {
  return (await j('https://www.wikidata.org/w/api.php?' + new URLSearchParams({ action: 'wbsearchentities', search: name, language: lang, uselang: lang, type: 'item', limit: '20', format: 'json', origin: '*' }))).search ?? [];
}
async function claims(qid: string) {
  const d = await j('https://www.wikidata.org/w/api.php?' + new URLSearchParams({ action: 'wbgetentities', ids: qid, props: 'claims', format: 'json', origin: '*' }));
  return d.entities?.[qid]?.claims ?? {};
}
async function catFiles(category: string): Promise<string[]> {
  const d = await j('https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ action: 'query', list: 'categorymembers', cmtitle: 'Category:' + category, cmtype: 'file', cmlimit: '40', format: 'json', origin: '*' }));
  return (d.query?.categorymembers ?? []).map((m: any) => m.title).filter((t: string) => /\.(jpe?g|png)$/i.test(t));
}
async function searchFiles(term: string): Promise<string[]> {
  const d = await j('https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ action: 'query', list: 'search', srnamespace: '6', srsearch: term, srlimit: '15', format: 'json', origin: '*' }));
  return (d.query?.search ?? []).map((s: any) => s.title).filter((t: string) => /\.(jpe?g|png)$/i.test(t));
}
async function imageInfo(titles: string[]) {
  const out: any[] = [];
  for (let k = 0; k < titles.length; k += 25) {
    const batch = titles.slice(k, k + 25);
    const d = await j('https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ action: 'query', titles: batch.join('|'), prop: 'imageinfo', iiprop: 'url|extmetadata|size', iiurlwidth: '320', format: 'json', origin: '*' }));
    for (const p of Object.values(d.query?.pages ?? {}) as any[]) {
      const ii = p.imageinfo?.[0]; if (!ii) continue;
      const strip = (s?: string) => (s ? s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : null);
      out.push({ title: p.title, url: ii.url, thumb: ii.thumburl ?? ii.url, w: ii.width, h: ii.height, license: strip(ii.extmetadata?.LicenseShortName?.value), descurl: ii.descriptionurl });
    }
    await sleep(120);
  }
  return out;
}
function score(c: any, occ: string[]) {
  const d = (c.description ?? '').toLowerCase();
  if (!d) return -3; if (/disambiguation|given name|surname|wikimedia/.test(d)) return -100;
  let s = 0; if (occ.some((o) => d.includes(o))) s += 10; if (/svensk|swed/.test(d)) s += 3; return s;
}
const licRank = (l: string | null) => { const x = (l ?? '').toLowerCase(); if (!x) return 2; if (/public domain|cc0|pd-/.test(x)) return 0; if (/cc.?by|gfdl|attribution/.test(x)) return 1; if (/-nc|noncommercial/.test(x)) return 3; return 2; };
const licColor = ['#3fb950', '#4DA3FF', '#8b949e', '#ff7b72'];

(async () => {
  const sections: string[] = [];
  for (let i = 0; i < targets.length; i++) {
    const row = targets[i];
    process.stderr.write(`[${i + 1}/${targets.length}] ${row.id} ... `);
    let cands: any[] = await wbSearch(row.name, 'en');
    const sv = await wbSearch(row.name, 'sv');
    for (const s of sv) if (!cands.find((c) => c.id === s.id)) cands.push(s);
    const best = cands.map((c) => ({ c, s: score(c, row.occ) })).sort((a, b) => b.s - a.s)[0];
    let p373: string | null = null, p18: string | null = null, desc = '';
    if (best && best.s >= 6) {
      desc = best.c.description ?? '';
      const cl = await claims(best.c.id);
      p373 = cl.P373?.[0]?.mainsnak?.datavalue?.value ?? null;
      p18 = cl.P18?.[0]?.mainsnak?.datavalue?.value ?? null;
    }
    let titles: string[] = [];
    if (p373) titles = await catFiles(p373);
    if (titles.length < 4) titles = [...new Set([...titles, ...(await searchFiles(row.name))])];
    // drop the rejected P18
    const p18norm = (p18 ?? '').replace(/_/g, ' ').toLowerCase();
    titles = titles.filter((t) => t.replace(/^File:/, '').replace(/_/g, ' ').toLowerCase() !== p18norm).slice(0, 24);
    let infos = await imageInfo(titles);
    // filter junk + low-res, sort by license then resolution
    infos = infos.filter((x) => x.w >= 300 && x.h >= 300 && !/logo|icon|flag|coat of arms|signature|\.svg/i.test(x.title));
    infos.sort((a, b) => licRank(a.license) - licRank(b.license) || b.w * b.h - a.w * a.h);
    infos = infos.slice(0, 12);
    process.stderr.write(`${infos.length} alts (cat=${p373 ?? '-'})\n`);

    const cur = `<div class="cand cur"><img src="../../assets/quiz-images/${esc(row.id)}.webp" onerror="this.parentNode.querySelector('.lic').textContent='(current removed)'"><div class="lic" style="color:#d29922">CURRENT</div><div class="dim">${esc(row.id)}</div></div>`;
    const cards = infos.map((c, idx) => {
      const col = licColor[licRank(c.license)];
      const mp = (c.w * c.h / 1e6).toFixed(1);
      return `<div class="cand"><div class="idx">#${idx + 1}</div><a href="${esc(c.descurl)}" target="_blank"><img src="${esc(c.thumb)}" loading="lazy"></a><div class="lic" style="color:${col}">${esc(c.license ?? '?')}</div><div class="dim">${c.w}×${c.h} (${mp}MP)</div><input class="url" readonly value="${esc(c.url)}" onclick="this.select()"></div>`;
    }).join('');
    sections.push(`<section><h2>${esc(row.name)} <span class="id">${esc(row.id)}</span> <span class="wd">WD: ${esc(desc || '?')}</span></h2><div class="row">${cur}${cards || '<div class="nocur">no alternatives found — needs manual Commons category research</div>'}</div></section>`);
    await sleep(150);
  }
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Alt images</title><style>
body{background:#0d1117;color:#e6edf3;font-family:system-ui,sans-serif;margin:0;padding:20px}
h1{font-size:20px}.legend{color:#8b949e;font-size:13px;margin-bottom:14px}.legend b{color:#3fb950}
section{border-top:1px solid #30363d;padding:8px 0;margin-top:8px}
h2{font-size:15px;margin:0 0 8px;position:sticky;top:0;background:#0d1117;padding:4px 0}
.id{color:#8b949e;font-weight:400;font-size:12px;font-family:monospace}.wd{color:#58a6ff;font-weight:400;font-size:11px;margin-left:8px}
.row{display:flex;gap:10px;overflow-x:auto;padding-bottom:8px}
.cand{flex:0 0 175px;background:#161b22;border:1px solid #30363d;border-radius:6px;padding:6px;font-size:11px;position:relative}
.cand.cur{border-color:#d29922}.idx{position:absolute;top:8px;left:8px;background:#000a;border-radius:3px;padding:1px 5px;font-weight:700}
.cand img{width:100%;height:150px;object-fit:contain;background:#000;border-radius:4px}
.lic{font-weight:600;margin-top:4px}.dim{color:#8b949e}
.url{width:100%;margin-top:4px;font-size:9px;background:#0d1117;color:#8b949e;border:1px solid #30363d;border-radius:3px;padding:2px}
.nocur{color:#ff7b72;font-style:italic;align-self:center;padding:0 12px}</style></head><body>
<h1>Alternativa Commons/PD-bilder — ${targets.length} items (3:e alternativet)</h1>
<p class="legend">Per item: CURRENT (gul) + alternativ ur entitetens Commons-kategori. Den tidigare avvisade kandidaten (Wikidata P18) är BORTfiltrerad. <b>grön=PD/CC0</b> · blå=CC-BY/SA · grå=okänd · röd=NC. Säg <code>&lt;id&gt;: #N</code> så processar jag den, eller klistra in en URL.</p>
${sections.join('\n')}</body></html>`;
  fs.writeFileSync(path.join(OUT, 'alt-images-v2.html'), html);
  console.log('\nWrote backend/output/alt-images-v2.html');
})();

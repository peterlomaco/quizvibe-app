import * as fs from 'fs';
import * as path from 'path';
import { fetchImage, processImage, saveProcessedImage } from '../wikimedia/processor';

const UA = 'QuizVibeBackend/0.1 (dev; mailto:dev@quizvibe.local)';
const dir = __dirname;
const STAGING = path.join(dir, '..', 'output', 'replace-candidates');
const rows: any[] = JSON.parse(fs.readFileSync(path.join(dir, '_t1-input.json'), 'utf8'));
const onlyIds = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const targets = onlyIds.length ? rows.filter((r) => onlyIds.includes(r.id)) : rows;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function wbSearch(name: string, lang: string) {
  const u = 'https://www.wikidata.org/w/api.php?' + new URLSearchParams({
    action: 'wbsearchentities', search: name, language: lang, uselang: lang, type: 'item', limit: '20', format: 'json', origin: '*',
  });
  const r = await fetch(u, { headers: { 'User-Agent': UA } }); const d: any = await r.json(); return d.search ?? [];
}
async function getP18(qid: string) {
  const u = 'https://www.wikidata.org/w/api.php?' + new URLSearchParams({ action: 'wbgetentities', ids: qid, props: 'claims', format: 'json', origin: '*' });
  const r = await fetch(u, { headers: { 'User-Agent': UA } }); const d: any = await r.json();
  return d.entities?.[qid]?.claims?.P18?.[0]?.mainsnak?.datavalue?.value ?? null;
}
async function commonsInfo(file: string) {
  const u = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({ action: 'query', titles: 'File:' + file, prop: 'imageinfo', iiprop: 'url|extmetadata|size', format: 'json', origin: '*' });
  const r = await fetch(u, { headers: { 'User-Agent': UA } }); const d: any = await r.json();
  const p: any = Object.values(d.query?.pages ?? {})[0]; const ii = p?.imageinfo?.[0]; if (!ii) return null;
  const strip = (s?: string) => (s ? s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : null);
  return { url: ii.url, license: strip(ii.extmetadata?.LicenseShortName?.value), artist: strip(ii.extmetadata?.Artist?.value), w: ii.width, h: ii.height, descurl: ii.descriptionurl };
}
function score(c: any, occ: string[]): number {
  const desc = (c.description ?? '').toLowerCase();
  if (!desc) return -3;
  if (/disambiguation|given name|family name|surname|wikimedia/.test(desc)) return -100;
  let s = 0;
  if (occ.some((o) => desc.includes(o))) s += 10;
  return s;
}

interface Out { id: string; name: string; status: string; qid?: string; desc?: string; file?: string; url?: string; license?: string | null; artist?: string | null; outW?: number; outH?: number; descurl?: string; error?: string; }

async function one(row: any): Promise<Out> {
  let cands: any[] = [];
  try {
    cands = await wbSearch(row.name, 'en');
    const sv = await wbSearch(row.name, 'sv');
    for (const s of sv) if (!cands.find((c) => c.id === s.id)) cands.push(s);
    else { const i = cands.findIndex((c) => c.id === s.id); if (!cands[i].description && s.description) cands[i] = s; }
  } catch (e) { return { id: row.id, name: row.name, status: 'failed', error: 'wbsearch' }; }
  if (!cands.length) return { id: row.id, name: row.name, status: 'no-entity' };
  const scored = cands.map((c) => ({ c, s: score(c, row.occ) })).sort((a, b) => b.s - a.s);
  const best = scored[0];
  const qid = best.c.id;
  const conf = best.s >= 10 ? 'ok' : 'low';
  let p18: string | null;
  try { p18 = await getP18(qid); } catch { return { id: row.id, name: row.name, status: 'failed', qid, desc: best.c.description, error: 'p18' }; }
  if (!p18) return { id: row.id, name: row.name, status: 'no-p18', qid, desc: best.c.description };
  const info = await commonsInfo(p18);
  if (!info) return { id: row.id, name: row.name, status: 'failed', qid, desc: best.c.description, file: p18, error: 'imageinfo' };
  try {
    const buf = await fetchImage(info.url); const pr = await processImage(buf);
    await fs.promises.mkdir(STAGING, { recursive: true });
    await saveProcessedImage(pr.buffer, path.join(STAGING, row.id + '.webp'));
    return { id: row.id, name: row.name, status: conf === 'ok' ? 'success' : 'success-low', qid, desc: best.c.description, file: p18, url: info.url, license: info.license, artist: info.artist, outW: pr.width, outH: pr.height, descurl: info.descurl };
  } catch (e) { return { id: row.id, name: row.name, status: 'failed', qid, desc: best.c.description, file: p18, url: info.url, error: (e as Error).message }; }
}

(async () => {
  const out: Out[] = [];
  for (let i = 0; i < targets.length; i++) {
    process.stderr.write(`[${i + 1}/${targets.length}] ${targets[i].id} ... `);
    const r = await one(targets[i]);
    out.push(r);
    process.stderr.write(`${r.status}${r.desc ? ` ("${r.desc}")` : ''}${r.outW ? ` ${r.outW}x${r.outH} ${r.license ?? '?'}` : ''}\n`);
    await sleep(500);
  }
  const mp = path.join(dir, '_t1-candidates-manifest.json');
  let prior: Out[] = [];
  if (fs.existsSync(mp) && onlyIds.length) { prior = JSON.parse(fs.readFileSync(mp, 'utf8')).filter((p: Out) => !onlyIds.includes(p.id)); }
  fs.writeFileSync(mp, JSON.stringify([...prior, ...out], null, 2));
  const by: Record<string, number> = {}; for (const o of out) by[o.status] = (by[o.status] ?? 0) + 1;
  console.log('\n=== T1 candidates done ===', JSON.stringify(by));
})();

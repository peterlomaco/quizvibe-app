/**
 * Robust per-person image fetch via Wikidata.
 * 1. wbsearchentities(name) → candidates with descriptions.
 * 2. Score candidates: must look like a human/right occupation; prefer
 *    descriptions mentioning the expected occupation + "Swed"/"svensk".
 * 3. wbgetentities(QID, claims=P18) → Commons filename.
 * 4. Commons imageinfo → original URL + license + artist.
 * 5. Download + process + save to staging dir. Record manifest incl. the
 *    chosen Wikidata description so entity choice is auditable WITHOUT vision.
 *
 * Bands are skipped (their P18 is often a text logo that gives away the
 * answer; the sv-pageimage live photos already fetched are better).
 */
import * as fs from 'fs';
import * as path from 'path';
import { fetchImage, processImage, saveProcessedImage } from '../wikimedia/processor';

const UA = 'QuizVibeBackend/0.1 (dev; mailto:dev@quizvibe.local)';
const STAGING = path.join(__dirname, '..', 'output', 'wikidata');
const ASSETS_DIR = path.join(__dirname, '..', '..', 'assets', 'quiz-images');

interface Row {
  id: string;
  name: string;
  file: string;
  hints: string[];
}

const allRows: Row[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, '_new-swedes.json'), 'utf8'),
);

// occupation keywords per file (lowercase, matched against WD description)
const OCC: Record<string, string[]> = {
  'artists-sweden-classic': ['singer', 'musician', 'songwriter', 'rapper', 'artist'],
  'artists-sweden-modern': ['singer', 'musician', 'songwriter', 'rapper', 'artist'],
  'actors-sweden-classic': ['actor', 'actress', 'comedian', 'presenter', 'director'],
  'actors-sweden-modern': ['actor', 'actress', 'comedian', 'presenter', 'director'],
  'athletes-sweden-classic': [
    'football', 'soccer', 'hockey', 'tennis', 'athlete', 'runner', 'hurdl',
    'jumper', 'skier', 'player', 'boxer', 'sport',
  ],
  'athletes-sweden-modern': [
    'football', 'soccer', 'hockey', 'tennis', 'athlete', 'runner', 'hurdl',
    'jumper', 'skier', 'player', 'boxer', 'sport', 'discus', 'cyclist',
    'skater', 'speed skater', 'handball',
  ],
};

const onlyIds = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const rows = allRows.filter(
  (r) => r.file.startsWith('artists-') || r.file.startsWith('actors-') || r.file.startsWith('athletes-'),
);
const targets = onlyIds.length ? rows.filter((r) => onlyIds.includes(r.id)) : rows;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function wbSearch(name: string, lang: string): Promise<any[]> {
  const url =
    'https://www.wikidata.org/w/api.php?' +
    new URLSearchParams({
      action: 'wbsearchentities',
      search: name,
      language: lang,
      uselang: lang,
      type: 'item',
      limit: '15',
      format: 'json',
      origin: '*',
    });
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  const d: any = await r.json();
  return d.search ?? [];
}

async function getP18(qid: string): Promise<string | null> {
  const url =
    'https://www.wikidata.org/w/api.php?' +
    new URLSearchParams({
      action: 'wbgetentities',
      ids: qid,
      props: 'claims',
      format: 'json',
      origin: '*',
    });
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  const d: any = await r.json();
  const claims = d.entities?.[qid]?.claims;
  const p18 = claims?.P18?.[0]?.mainsnak?.datavalue?.value;
  return p18 ?? null;
}

async function commonsInfo(file: string) {
  const title = 'File:' + file;
  const url =
    'https://commons.wikimedia.org/w/api.php?' +
    new URLSearchParams({
      action: 'query',
      titles: title,
      prop: 'imageinfo',
      iiprop: 'url|extmetadata|size',
      format: 'json',
      origin: '*',
    });
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  const d: any = await r.json();
  const pages = d.query?.pages ?? {};
  const p: any = Object.values(pages)[0];
  const info = p?.imageinfo?.[0];
  if (!info) return null;
  const strip = (s?: string) => (s ? s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : null);
  return {
    url: info.url as string,
    width: info.width as number,
    height: info.height as number,
    license: strip(info.extmetadata?.LicenseShortName?.value),
    artist: strip(info.extmetadata?.Artist?.value),
    descriptionurl: info.descriptionurl as string,
  };
}

function scoreCand(c: any, occ: string[]): number {
  const desc = (c.description ?? '').toLowerCase();
  if (!desc) return -5;
  // reject obvious non-persons / disambiguation
  if (/disambiguation|wikimedia|given name|family name|surname/.test(desc)) return -100;
  let s = 0;
  if (occ.some((o) => desc.includes(o))) s += 10;
  if (/swed|svensk/.test(desc)) s += 6;
  return s;
}

interface Out {
  id: string; name: string; status: string;
  qid?: string; desc?: string; file?: string; url?: string;
  license?: string | null; artist?: string | null;
  origW?: number; origH?: number; outW?: number; outH?: number;
  descriptionUrl?: string; error?: string;
}

async function processOne(row: Row): Promise<Out> {
  const occ = OCC[row.file] ?? [];
  let cands: any[] = [];
  try {
    cands = await wbSearch(row.name, 'sv');
    if (cands.length === 0) cands = await wbSearch(row.name, 'en');
    else {
      const en = await wbSearch(row.name, 'en');
      // merge en descriptions by id
      const enById = new Map(en.map((e: any) => [e.id, e]));
      cands = cands.map((c) => (c.description ? c : enById.get(c.id) ?? c));
      // also append en-only candidates
      for (const e of en) if (!cands.find((c) => c.id === e.id)) cands.push(e);
    }
  } catch (e) {
    return { id: row.id, name: row.name, status: 'failed', error: 'wbsearch ' + (e as Error).message };
  }
  if (!cands.length) return { id: row.id, name: row.name, status: 'failed', error: 'no wd entity' };

  const scored = cands
    .map((c) => ({ c, s: scoreCand(c, occ) }))
    .sort((a, b) => b.s - a.s);
  const best = scored[0];
  if (best.s < 6) {
    // not confidently the right occupation/Sweden — bail (keep existing image)
    return {
      id: row.id, name: row.name, status: 'low-confidence',
      qid: best.c.id, desc: best.c.description ?? '',
    };
  }
  const qid = best.c.id;
  let p18: string | null;
  try {
    p18 = await getP18(qid);
  } catch (e) {
    return { id: row.id, name: row.name, status: 'failed', qid, desc: best.c.description, error: 'p18 ' + (e as Error).message };
  }
  if (!p18) return { id: row.id, name: row.name, status: 'no-p18', qid, desc: best.c.description };

  const info = await commonsInfo(p18);
  if (!info) return { id: row.id, name: row.name, status: 'failed', qid, desc: best.c.description, file: p18, error: 'no imageinfo' };
  try {
    const buf = await fetchImage(info.url);
    const processed = await processImage(buf);
    await fs.promises.mkdir(STAGING, { recursive: true });
    const outPath = path.join(STAGING, `${row.id}.webp`);
    await saveProcessedImage(processed.buffer, outPath);
    return {
      id: row.id, name: row.name, status: 'success',
      qid, desc: best.c.description, file: p18, url: info.url,
      license: info.license, artist: info.artist,
      origW: processed.original.width, origH: processed.original.height,
      outW: processed.width, outH: processed.height,
      descriptionUrl: info.descriptionurl,
    };
  } catch (e) {
    return { id: row.id, name: row.name, status: 'failed', qid, desc: best.c.description, file: p18, url: info.url, error: (e as Error).message };
  }
}

async function main() {
  const out: Out[] = [];
  for (let i = 0; i < targets.length; i++) {
    const row = targets[i];
    process.stderr.write(`[${i + 1}/${targets.length}] ${row.id} ... `);
    const r = await processOne(row);
    out.push(r);
    process.stderr.write(`${r.status}${r.desc ? ` ("${r.desc}")` : ''}${r.outW ? ` ${r.outW}x${r.outH} ${r.license ?? '?'}` : ''}\n`);
    await sleep(600);
  }
  fs.writeFileSync(path.join(__dirname, '_wikidata-manifest.json'), JSON.stringify(out, null, 2));
  const byStatus: Record<string, number> = {};
  for (const o of out) byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
  console.log('\n=== Wikidata staging done ===');
  console.log(JSON.stringify(byStatus, null, 0));
}
main().catch((e) => { console.error(e); process.exit(1); });

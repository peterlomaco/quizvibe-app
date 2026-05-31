// find-alt-images — för varje namn i alt-images-input.json, hämta KANDIDAT-bilder
// från Wikimedia Commons (text-search) + Wikipedia pageimage (en/sv), med licens +
// upplösning, och bygg en visuell HTML där man kan ögna och välja en ersättningsbild.
//
// Commons hostar ENBART fritt material (PD/CC), så alla commons-search-träffar är
// per definition lagliga; license-badgen säger bara vilken licens-typ.
//
// Användning: npx tsx scripts/find-alt-images.ts
//   → öppna backend/output/alt-images.html

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { searchCommons, findWikipediaPageImage, WikimediaSearchResult } from '../wikimedia/client';

const SCRIPTS_DIR = __dirname;
const OUT_DIR = join(__dirname, '..', 'output');
const ASSETS = join(__dirname, '..', '..', 'assets', 'quiz-images');

const names: string[] = JSON.parse(readFileSync(join(SCRIPTS_DIR, 'alt-images-input.json'), 'utf8'));

// Befintliga webp-id:n för "nuvarande bild"-jämförelse
const existingIds = new Set(
  existsSync(ASSETS) ? readdirSync(ASSETS).filter((f) => f.endsWith('.webp')).map((f) => f.replace(/\.webp$/, '')) : [],
);

function kebab(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Strippa disambigueringshint för id-gissning + rubrik
function cleanName(raw: string): string {
  return raw
    .replace(/\b(footballer|band|ishockey|ice hockey)\b/gi, '')
    .replace(/\bVieira\b/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function category(license: string | null): 'pd' | 'attribution' | 'nc' | 'unknown' {
  const l = (license ?? '').toLowerCase();
  if (!l) return 'unknown';
  if (l.includes('non-commercial') || l.includes('noncommercial') || l.includes('-nc')) return 'nc';
  if (l.includes('public domain') || l.includes('pd-') || l.includes('cc0') || l.includes('cc zero')) return 'pd';
  if (l.includes('cc-by') || l.includes('cc by') || l.includes('gfdl') || l.includes('attribution')) return 'attribution';
  return 'unknown';
}

const CAT_RANK: Record<string, number> = { pd: 0, attribution: 1, unknown: 2, nc: 3 };
const CAT_COLOR: Record<string, string> = { pd: '#3fb950', attribution: '#4DA3FF', unknown: '#8b949e', nc: '#ff7b72' };

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Cand extends WikimediaSearchResult {
  cat: string;
  mp: number;
}

async function gather(rawName: string): Promise<Cand[]> {
  const display = cleanName(rawName);
  const byUrl = new Map<string, WikimediaSearchResult>();

  // 1. Wikipedia pageimage en + sv (kuraterad huvudbild)
  for (const lang of ['en', 'sv'] as const) {
    try {
      const r = await findWikipediaPageImage(display, { lang, thumbnailWidth: 320 });
      if (r && !byUrl.has(r.url)) byUrl.set(r.url, r);
    } catch {
      /* skip */
    }
    await sleep(90);
  }
  // 2. Commons text-search (flera kandidater)
  try {
    const results = await searchCommons(rawName, { limit: 8, thumbnailWidth: 320 });
    for (const r of results) if (!byUrl.has(r.url)) byUrl.set(r.url, r);
  } catch {
    /* skip */
  }
  await sleep(120);

  const cands: Cand[] = [...byUrl.values()].map((r) => ({
    ...r,
    cat: category(r.license),
    mp: (r.width * r.height) / 1_000_000,
  }));
  // sortera: licens-rank → upplösning desc
  cands.sort((a, b) => CAT_RANK[a.cat] - CAT_RANK[b.cat] || b.mp - a.mp);
  return cands.slice(0, 8);
}

(async () => {
  mkdirSync(OUT_DIR, { recursive: true });
  const sections: string[] = [];
  let i = 0;
  for (const rawName of names) {
    i++;
    process.stderr.write(`[${i}/${names.length}] ${rawName}\n`);
    const display = cleanName(rawName);
    const idGuess = kebab(display);
    const hasCurrent = existingIds.has(idGuess);
    const cands = await gather(rawName);

    const cards = cands
      .map((c) => {
        const color = CAT_COLOR[c.cat];
        const dims = c.width ? `${c.width}×${c.height} (${c.mp.toFixed(1)}MP)` : '?';
        const lic = c.license ?? '(okänd licens)';
        const lowres = c.mp > 0 && c.mp < 0.5;
        return `<div class="cand">
          <a href="${esc(c.descriptionUrl)}" target="_blank"><img src="${esc(c.thumbnailUrl)}" loading="lazy"></a>
          <div class="lic" style="color:${color}">${esc(lic)}</div>
          <div class="dim${lowres ? ' low' : ''}">${dims}${lowres ? ' ⚠' : ''}</div>
          <input class="url" readonly value="${esc(c.url)}" onclick="this.select()">
        </div>`;
      })
      .join('');

    const current = hasCurrent
      ? `<div class="cand current"><img src="../../assets/quiz-images/${esc(idGuess)}.webp"><div class="lic" style="color:#d29922">NUVARANDE</div><div class="dim">${esc(idGuess)}.webp</div></div>`
      : `<div class="nocur">ingen nuvarande webp (id-gissning: <code>${esc(idGuess)}</code>)</div>`;

    sections.push(`<section>
      <h2>${esc(display)} <span class="cmd">npm run wikimedia-process ${esc(idGuess)} &lt;url&gt;</span></h2>
      <div class="row">${current}${cards || '<div class="nocur">inga kandidater hittades</div>'}</div>
    </section>`);
  }

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Alternativa bilder</title>
  <style>
    body{background:#0d1117;color:#e6edf3;font-family:system-ui,sans-serif;margin:0;padding:20px}
    h1{font-size:20px;margin:0 0 6px}
    .legend{color:#8b949e;font-size:13px;margin:0 0 16px}
    .legend b{color:#3fb950}
    section{border-top:1px solid #30363d;padding:10px 0 4px;margin-top:8px}
    h2{font-size:15px;margin:0 0 8px;color:#e6edf3;position:sticky;top:0;background:#0d1117;padding:4px 0}
    .cmd{color:#8b949e;font-weight:400;font-size:11px;font-family:ui-monospace,monospace;margin-left:8px}
    .row{display:flex;gap:10px;overflow-x:auto;padding-bottom:8px}
    .cand{flex:0 0 180px;background:#161b22;border:1px solid #30363d;border-radius:6px;padding:6px;font-size:11px}
    .cand.current{border-color:#d29922}
    .cand img{width:100%;height:150px;object-fit:contain;background:#000;border-radius:4px}
    .lic{font-weight:600;margin-top:4px}
    .dim{color:#8b949e}.dim.low{color:#ff7b72}
    .url{width:100%;margin-top:4px;font-size:9px;background:#0d1117;color:#8b949e;border:1px solid #30363d;border-radius:3px;padding:2px}
    .nocur{color:#8b949e;font-style:italic;align-self:center;padding:0 12px}
    code{background:#161b22;padding:1px 4px;border-radius:3px}
  </style></head><body>
  <h1>Alternativa Commons/PD-bilder — ${names.length} namn</h1>
  <p class="legend">Commons hostar bara fritt material. Sorterat per licens: <b>grön=PD/CC0</b> · blå=CC-BY/SA (kräver kredit) · grå=okänd · röd=NC. ⚠=&lt;0.5MP. Klicka bild → Commons-sida. Klicka URL-fält → markera för kopiering. Kör kommandot i h2 med vald URL.</p>
  ${sections.join('\n')}
  </body></html>`;

  const outFile = join(OUT_DIR, 'alt-images.html');
  writeFileSync(outFile, html, 'utf8');
  console.log(`\nWrote ${outFile.replace(/\\/g, '/')}`);
})();

// review-non-swedish-images — granskning av bildposter i icke-Sverige-specifika
// katalogfiler (filer utan "sweden" i filnamnet). Dessa filer innehåller en
// blandning av icke-svenska nationaliteter (Elvis, Messi, Beatles …) OCH
// svenska personer som råkar ligga i generationsfiler (Avicii, Zlatan, Stellan).
//
// Granskaren avgör visuellt per kort:
//   • Behåll  — personen är väl igenkänd och relevant för V1
//   • Parkera — inte fel men bättre passad för "global"-scope i v1.x
//   • Ta bort — otydlig, låg igenkänning eller icke-önskad
//
// Kör: npx tsx scripts/review-non-swedish-images.ts
//   → öppna sökvägen som skrivs ut i en webbläsare
//   → notera de ID:n du vill ta bort/parkera och ge dem till Claude

import * as path from 'path';
import { promises as fs } from 'fs';
import * as yaml from 'js-yaml';
import sharp from 'sharp';

const CATALOG_DIR  = path.join(__dirname, '..', 'content', 'catalog');
const ASSETS_DIR   = path.join(__dirname, '..', '..', 'assets', 'quiz-images');
const OUT_DIR      = path.join(__dirname, '..', 'output');
const OUT_FILE     = path.join(OUT_DIR, 'non-swedish-review.html');

// ── Typer ──────────────────────────────────────────────────────────────────

interface YamlItem {
  id: string;
  displayName: string;
  correctYear?: number;
  probability?: number;
}

interface YamlFile {
  contentForm?: string;
  contentSubject?: string;
  audience?: string[];
  items?: YamlItem[];
}

interface Card {
  id: string;
  displayName: string;
  correctYear?: number;
  hasWebp: boolean;
  w: number;
  h: number;
  lowRes: boolean;
}

interface FileGroup {
  fname: string;          // t.ex. "actors-gen-x.yaml"
  contentSubject: string;
  audience: string[];
  cards: Card[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function getImageDims(webpPath: string): Promise<{ w: number; h: number }> {
  try {
    const m = await sharp(webpPath).metadata();
    return { w: m.width ?? 0, h: m.height ?? 0 };
  } catch {
    return { w: 0, h: 0 };
  }
}

// ── Huvudprogram ───────────────────────────────────────────────────────────

async function main() {
  const allFiles = (await fs.readdir(CATALOG_DIR))
    .filter((f) => f.endsWith('.yaml') && !f.includes('sweden'))
    .sort();

  const groups: FileGroup[] = [];
  let totalItems   = 0;
  let totalWebps   = 0;
  let totalNoWebps = 0;

  for (const fname of allFiles) {
    const raw = await fs.readFile(path.join(CATALOG_DIR, fname), 'utf8');
    const parsed = yaml.load(raw) as YamlFile;

    // Bara bild-frågor — hoppa över YouTube-filer
    if (parsed.contentForm !== 'image') continue;
    if (!parsed.items?.length) continue;

    const cards: Card[] = [];
    for (const item of parsed.items) {
      const webpPath = path.join(ASSETS_DIR, `${item.id}.webp`);
      let hasWebp = false;
      let w = 0;
      let h = 0;
      try {
        await fs.access(webpPath);
        hasWebp = true;
        ({ w, h } = await getImageDims(webpPath));
      } catch {
        // ingen webp
      }
      cards.push({
        id:          item.id,
        displayName: item.displayName,
        correctYear: item.correctYear,
        hasWebp,
        w,
        h,
        lowRes: hasWebp && w > 0 && w * h < 500_000,
      });
      totalItems++;
      if (hasWebp) totalWebps++; else totalNoWebps++;
    }

    // Sortera: webp-kort först (med bild = granskningsprio), sedan saknar webp
    cards.sort((a, b) => {
      if (a.hasWebp !== b.hasWebp) return a.hasWebp ? -1 : 1;
      return a.displayName.localeCompare(b.displayName, 'sv');
    });

    groups.push({
      fname,
      contentSubject: parsed.contentSubject ?? '?',
      audience: parsed.audience ?? [],
      cards,
    });
  }

  // ── HTML ─────────────────────────────────────────────────────────────────

  const parts: string[] = [];
  parts.push('<!doctype html><html><head><meta charset="utf-8">');
  parts.push('<title>Non-Swedish images review</title>');
  parts.push(`<style>
    *{box-sizing:border-box}
    body{background:#0d1117;color:#e6edf3;font-family:system-ui,sans-serif;margin:0;padding:24px}
    h1{font-size:20px;margin:0 0 4px}
    .summary{color:#8b949e;font-size:13px;margin:0 0 20px}
    h2{font-size:14px;margin:36px 0 0;padding:8px 12px;background:#161b22;
       border:1px solid #30363d;border-radius:6px;color:#4DA3FF;
       position:sticky;top:0;z-index:10}
    .filemeta{color:#8b949e;font-size:12px;margin:4px 0 10px;padding-left:2px}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-top:8px}
    .card{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:8px;font-size:11px;position:relative}
    .card.nowebp{border-style:dashed;opacity:0.55}
    .card.lowres{border-color:#e3b341}
    .thumb{width:100%;height:140px;object-fit:contain;background:#000;border-radius:4px;display:block}
    .noimg{width:100%;height:140px;background:#1c2128;border-radius:4px;
           display:flex;align-items:center;justify-content:center;color:#484f58;font-size:22px}
    .name{font-weight:600;margin-top:6px;line-height:1.3;font-size:12px}
    .id{color:#8b949e;word-break:break-all;font-size:10px;margin-top:2px}
    .meta{color:#8b949e;margin-top:3px;font-size:10px}
    .badge{position:absolute;top:6px;right:6px;font-size:9px;font-weight:700;
           padding:2px 5px;border-radius:3px}
    .badge-nowbep{background:#21262d;color:#8b949e}
    .badge-lowres{background:#3d2b00;color:#e3b341}
    .toc{background:#161b22;border:1px solid #30363d;border-radius:8px;
         padding:14px 18px;margin-bottom:24px;max-width:600px}
    .toc b{display:block;margin-bottom:8px;color:#e6edf3}
    .toc ul{margin:0;padding:0 0 0 16px;list-style:disc}
    .toc li{margin:4px 0;font-size:13px}
    .toc a{color:#4DA3FF;text-decoration:none}
    .toc a:hover{text-decoration:underline}
    .toc-count{color:#8b949e;font-size:11px;margin-left:4px}
    .top-link{font-size:11px;font-weight:400;color:#8b949e;text-decoration:none;
              float:right;margin-top:2px}
    .top-link:hover{color:#4DA3FF}
  </style></head><body id="top">`);

  parts.push(`<h1>Granskning — icke-Sverige-specifika bildfiler</h1>`);
  parts.push(`<p class="summary">
    ${groups.length} filer · ${totalItems} poster totalt ·
    ${totalWebps} med webp (aktiva i poolen) ·
    ${totalNoWebps} saknar webp (ej aktiva) ·
    streckad ram = ingen webp · gul ram = low-res (&lt;0.5 MP)
  </p>`);

  // Innehållsförteckning med ankarlinks
  parts.push('<nav class="toc"><b>Hoppa till fil:</b><ul>');
  for (const g of groups) {
    const withWebp = g.cards.filter((c) => c.hasWebp).length;
    const anchor   = g.fname.replace(/[^a-z0-9]/gi, '-');
    parts.push(`<li><a href="#${anchor}">${esc(g.fname)}</a> <span class="toc-count">${g.cards.length} poster · ${withWebp} aktiva</span></li>`);
  }
  parts.push('</ul></nav>');

  for (const g of groups) {
    const withWebp    = g.cards.filter((c) => c.hasWebp).length;
    const withoutWebp = g.cards.filter((c) => !c.hasWebp).length;
    const audienceStr = g.audience.join(', ');
    const anchor      = g.fname.replace(/[^a-z0-9]/gi, '-');

    parts.push(`<h2 id="${anchor}">${esc(g.fname)} &nbsp;·&nbsp; ${g.cards.length} poster &nbsp;·&nbsp; ${withWebp} aktiva / ${withoutWebp} utan webp &nbsp;<a class="top-link" href="#top">↑ topp</a></h2>`);
    parts.push(`<div class="filemeta">subject: <b>${esc(g.contentSubject)}</b> &nbsp;|&nbsp; audience: ${esc(audienceStr)}</div>`);
    parts.push('<div class="grid">');

    for (const c of g.cards) {
      const webpSrc = `../../assets/quiz-images/${encodeURIComponent(c.id)}.webp`;
      const dims    = c.w ? `${c.w}×${c.h}` : '';
      const yearStr = c.correctYear ? ` · ${c.correctYear}` : '';
      const classes = ['card', !c.hasWebp ? 'nowebp' : '', c.lowRes ? 'lowres' : ''].filter(Boolean).join(' ');

      parts.push(`<div class="${classes}">`);

      if (c.hasWebp) {
        parts.push(`<img class="thumb" src="${webpSrc}" loading="lazy" alt="${esc(c.id)}">`);
      } else {
        parts.push(`<div class="noimg">📷</div>`);
        parts.push(`<span class="badge badge-nowbep">ingen bild</span>`);
      }
      if (c.lowRes) {
        parts.push(`<span class="badge badge-lowres">low-res</span>`);
      }

      parts.push(`<div class="name">${esc(c.displayName)}</div>`);
      parts.push(`<div class="id">${esc(c.id)}</div>`);
      if (dims || yearStr) {
        parts.push(`<div class="meta">${dims}${yearStr}</div>`);
      }
      parts.push('</div>');
    }

    parts.push('</div>');
  }

  parts.push('</body></html>');

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(OUT_FILE, parts.join('\n'), 'utf8');

  console.log(`\n✓ Review-sida klar (${totalItems} poster, ${totalWebps} med webp)\n`);
  console.log(`Öppna i webbläsare:\n  file:///${OUT_FILE.replace(/\\/g, '/')}\n`);
  console.log('Instruktion:');
  console.log('  • Hel ram   = aktiv i poolen (har webp)');
  console.log('  • Streckad  = saknar webp (ej aktiv)');
  console.log('  • Gul ram   = low-res (<0.5 MP)');
  console.log('  • Notera ID:n du vill ta bort eller parkera och ge dem till Claude.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

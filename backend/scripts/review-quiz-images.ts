// review-quiz-images — genererar en HTML contact-sheet över assets/quiz-images/ för
// visuell kurering: är varje bild ikonisk / peak / hög-igenkänning för personen?
// Visar thumbnail + displayName + id + upplösning + low-res-flagga, grupperat per
// contentSubject. Omdömet (keep/replace) är curatorns — verktyget gör granskningen
// snabb och flaggar svaga källor (lågupplöst, ingen katalog-match).
//
// Användning: npm run review-quiz-images
//   → öppna sökvägen som skrivs ut (backend/output/quiz-images-review.html) i en webbläsare.

import * as path from 'path';
import { promises as fs } from 'fs';
import sharp from 'sharp';
import { loadCatalog } from '../content/registry';

const ASSETS_DIR = path.join(__dirname, '..', '..', 'assets', 'quiz-images');
const OUT_DIR = path.join(__dirname, '..', 'output');
const OUT_FILE = path.join(OUT_DIR, 'quiz-images-review.html');

interface Meta {
  displayName: string;
  subject: string;
}

function buildIndex(): Map<string, Meta> {
  const catalog = loadCatalog(undefined, { includeDeferred: false });
  const byId = new Map<string, Meta>();
  for (const file of catalog.files.values()) {
    for (const item of file.items) {
      if (!byId.has(item.id)) {
        byId.set(item.id, {
          displayName: item.displayName,
          subject: file.contentSubject ?? file.category ?? 'unknown',
        });
      }
    }
  }
  return byId;
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

interface Card {
  id: string;
  displayName: string;
  subject: string;
  w: number;
  h: number;
  lowRes: boolean;
}

async function main() {
  const index = buildIndex();
  const files = (await fs.readdir(ASSETS_DIR)).filter((f) => f.endsWith('.webp')).sort();

  const cards: Card[] = [];
  for (const f of files) {
    const id = f.replace(/\.webp$/, '');
    const meta = index.get(id);
    let w = 0;
    let h = 0;
    try {
      const m = await sharp(path.join(ASSETS_DIR, f)).metadata();
      w = m.width ?? 0;
      h = m.height ?? 0;
    } catch {
      /* trasig/oläsbar fil → visas med ?-dims */
    }
    cards.push({
      id,
      displayName: meta?.displayName ?? '(ingen katalog-match)',
      subject: meta ? meta.subject : 'orphan (ingen katalog-match)',
      w,
      h,
      lowRes: w > 0 && w * h < 500_000, // < 0.5MP → för svag för en bra sketch
    });
  }

  const groups = new Map<string, Card[]>();
  for (const c of cards) {
    if (!groups.has(c.subject)) groups.set(c.subject, []);
    groups.get(c.subject)!.push(c);
  }
  const sortedSubjects = [...groups.keys()].sort();
  const lowResCount = cards.filter((c) => c.lowRes).length;
  const orphanCount = cards.filter((c) => c.subject.startsWith('orphan')).length;

  const parts: string[] = [];
  parts.push('<!doctype html><html><head><meta charset="utf-8"><title>Quiz-images review</title>');
  parts.push(`<style>
    body{background:#0d1117;color:#e6edf3;font-family:system-ui,sans-serif;margin:0;padding:24px}
    h1{font-size:20px;margin:0 0 4px} h2{font-size:15px;margin:30px 0 0;border-bottom:1px solid #30363d;padding-bottom:6px;color:#4DA3FF;position:sticky;top:0;background:#0d1117}
    .sub{color:#8b949e;font-size:13px;margin:0 0 8px}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;margin-top:12px}
    .card{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:8px;font-size:11px}
    .card img{width:100%;height:150px;object-fit:contain;background:#000;border-radius:4px}
    .name{font-weight:600;margin-top:6px;line-height:1.3}
    .id{color:#8b949e;word-break:break-all}
    .dims{color:#8b949e;margin-top:3px}
    .lowres{color:#ff7b72;font-weight:600}
    .card.orphan{border-color:#ff7b72}
  </style></head><body>`);
  parts.push(`<h1>Quiz-images review — ${cards.length} bilder</h1>`);
  parts.push(
    `<p class="sub">Kurera: är bilden <b>ikonisk · peak · hög igenkänning</b> för personen? &nbsp;|&nbsp; ⚠ low-res = &lt;0.5MP (för svag källa för en bra sketch): <b>${lowResCount}</b> &nbsp;|&nbsp; röd ram = ingen katalog-match: <b>${orphanCount}</b></p>`,
  );
  for (const subject of sortedSubjects) {
    const g = groups
      .get(subject)!
      .sort((a, b) => a.displayName.localeCompare(b.displayName, 'sv'));
    parts.push(`<h2>${esc(subject)} · ${g.length}</h2><div class="grid">`);
    for (const c of g) {
      const src = `../../assets/quiz-images/${encodeURIComponent(c.id)}.webp`;
      const dims = c.w ? `${c.w}×${c.h}` : '?';
      const orphan = c.subject.startsWith('orphan') ? ' orphan' : '';
      parts.push(`<div class="card${orphan}">
        <img src="${src}" loading="lazy" alt="${esc(c.id)}">
        <div class="name">${esc(c.displayName)}</div>
        <div class="id">${esc(c.id)}</div>
        <div class="dims ${c.lowRes ? 'lowres' : ''}">${dims}${c.lowRes ? ' ⚠ low-res' : ''}</div>
      </div>`);
    }
    parts.push('</div>');
  }
  parts.push('</body></html>');

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(OUT_FILE, parts.join('\n'), 'utf8');
  console.log(`Wrote review sheet (${cards.length} bilder, ${lowResCount} low-res, ${orphanCount} orphan)`);
  console.log(`Öppna i webbläsare: file:///${OUT_FILE.replace(/\\/g, '/')}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// review-youtube-clips — bäddar in ALLA youtubeClips i katalogen som lazy-
// laddade YouTube-iframes i en HTML-sida för manuell uppspelnings-test.
//
// Fångar det youtube-validate (Data API) INTE kan: content-owner embed-block
// (visar "Video unavailable" i iframe trots embeddable=true), fel innehåll/
// version (remix/live/cover), region-block. Iframe-embeds kostar ingen quota.
//
// Användning: npx tsx scripts/review-youtube-clips.ts
//   → öppna backend/output/youtube-review.html, expandera en grupp, scrolla
//     och scrubba. Embed-blockade/fel klipp syns direkt.

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { loadCatalog } from '../content/registry';

const OUT_DIR = join(__dirname, '..', 'output');
const OUT_FILE = join(OUT_DIR, 'youtube-review.html');

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

interface Clip {
  id: string;
  displayName: string;
  year: number | undefined;
  videoId: string;
  startSec: number;
  channelTitle: string;
}

const { files } = loadCatalog();
const groups: { file: string; subject: string; clips: Clip[] }[] = [];
let total = 0;

for (const [filename, file] of files) {
  if (file.contentForm !== 'youtube') continue;
  const clips: Clip[] = [];
  for (const item of file.items) {
    const c = item.youtubeClips?.[0];
    if (!c) continue;
    clips.push({
      id: item.id,
      displayName: item.displayName,
      year: item.correctYear,
      videoId: c.videoId,
      startSec: c.startSec ?? 0,
      channelTitle: c.channelTitle ?? '',
    });
    total++;
  }
  if (clips.length) {
    clips.sort((a, b) => a.displayName.localeCompare(b.displayName, 'sv'));
    groups.push({ file: filename, subject: file.contentSubject ?? '', clips });
  }
}
groups.sort((a, b) => a.file.localeCompare(b.file));

function card(c: Clip): string {
  const notTopic = !/-\s*topic$/i.test(c.channelTitle) && !/vevo$/i.test(c.channelTitle);
  const embed = `https://www.youtube.com/embed/${encodeURIComponent(c.videoId)}?start=${c.startSec}`;
  const watch = `https://www.youtube.com/watch?v=${encodeURIComponent(c.videoId)}&t=${c.startSec}`;
  return `<div class="card">
    <iframe loading="lazy" src="${embed}" allow="encrypted-media" allowfullscreen></iframe>
    <div class="meta">
      <div class="name">${esc(c.displayName)}</div>
      <div class="sub">${c.year ?? '?'} · <span class="${notTopic ? 'warn' : 'ok'}">${esc(c.channelTitle || '(okänd kanal)')}</span></div>
      <div class="ids"><code>${esc(c.id)}</code> · <a href="${watch}" target="_blank">${esc(c.videoId)}</a></div>
    </div>
  </div>`;
}

const sections = groups
  .map(
    (g) => `<details ${g.file === 'songs-sport' ? 'open' : ''}>
    <summary>${esc(g.file)} · ${g.subject} · ${g.clips.length} klipp</summary>
    <div class="grid">${g.clips.map(card).join('')}</div>
  </details>`,
  )
  .join('\n');

const html = `<!doctype html><html><head><meta charset="utf-8"><title>YouTube clip review</title>
<style>
  body{background:#0d1117;color:#e6edf3;font-family:system-ui,sans-serif;margin:0;padding:20px}
  h1{font-size:20px;margin:0 0 4px}
  .legend{color:#8b949e;font-size:13px;margin:0 0 16px}
  details{border:1px solid #30363d;border-radius:8px;margin-bottom:10px;background:#161b22}
  summary{cursor:pointer;padding:10px 14px;font-size:15px;font-weight:600;color:#4DA3FF}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;padding:14px}
  .card{background:#0d1117;border:1px solid #30363d;border-radius:8px;overflow:hidden}
  .card iframe{width:100%;height:158px;border:0;background:#000;display:block}
  .meta{padding:8px;font-size:12px}
  .name{font-weight:600;line-height:1.3}
  .sub{color:#8b949e;margin-top:3px}
  .ids{color:#8b949e;margin-top:3px;word-break:break-all}
  .warn{color:#f5a623}.ok{color:#3fb950}
  code{background:#161b22;padding:1px 4px;border-radius:3px}
  a{color:#4DA3FF}
</style></head><body>
<h1>YouTube clip review — ${total} klipp</h1>
<p class="legend">Scrubba varje klipp: spelar det? rätt innehåll/version? <b style="color:#f5a623">Gul kanal</b> = ej Topic/VEVO (störst embed-block-risk → testa noga). Embed-blockade visar "Video unavailable" i rutan. Klicka videoId → öppna på YouTube.</p>
${sections}
</body></html>`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, html, 'utf8');
console.log(`Wrote ${total} clips → ${OUT_FILE.replace(/\\/g, '/')}`);
console.log(`Öppna: file:///${OUT_FILE.replace(/\\/g, '/')}`);

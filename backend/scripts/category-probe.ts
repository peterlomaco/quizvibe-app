// Iterera Commons Category-pages per pkg-fifa-wc-item.
// För varje item: hämta alla bilder i Category:Player_name, score by filename-keywords.
//
// Output: docs/commons-categories-candidates.md (markdown med thumbnails + suggested-URLs).
//
// Usage:
//   tsx scripts/category-probe.ts --top N    (only first N items)
//   tsx scripts/category-probe.ts            (all pkg-fifa-wc items)

import { writeFileSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { loadCatalog } from '../content/registry';

const DOCS_DIR = join(__dirname, '..', '..', 'docs');
const SCRIPTS_DIR = __dirname;

// Score filename: high if contains action/kit-keywords, low if civilian-indicators
const ACTION_KEYWORDS = [
  'goal', 'celebrating', 'celebrate', 'kick', 'shot', 'match', 'vs', 'v_',
  'world_cup', 'world cup', 'wc', 'fifa', 'euro', 'championship',
  'final', 'cup', 'training', 'national_team', 'nationalmannschaft',
  'in_action', 'free_kick', 'penalty', 'corner', 'header', 'volley',
];
const CIVILIAN_KEYWORDS = [
  'press_conference', 'interview', 'red_carpet', 'awards', 'gala',
  'reception', 'wedding', 'birthday', 'with_president', 'with_prime',
  'unicef', 'foundation', 'laureus', 'web_summit', 'fashion',
  'television', 'tv_show', 'launch', 'event',
];
// Pre-1995 photos often have year in filename and are typically peak-era
const PEAK_YEAR_RE = /19[5-9]\d|20[0-1]\d/;

const urlByItemId = new Map<string, string>();
const batchFiles = readdirSync(SCRIPTS_DIR).filter((f) => f.startsWith('batch-input-') && f.endsWith('.json'));
for (const f of batchFiles) {
  try {
    const content = JSON.parse(readFileSync(join(SCRIPTS_DIR, f), 'utf8'));
    for (const entry of content) if (entry.id && entry.url) urlByItemId.set(entry.id, entry.url);
  } catch {}
}

const { files } = loadCatalog();
interface Item { id: string; displayName: string; currentUrl: string; }
const items: Item[] = [];
for (const [, file] of files) {
  for (const item of file.items) {
    if (!item.genrePackages?.includes('pkg-fifa-wc')) continue;
    items.push({ id: item.id, displayName: item.displayName, currentUrl: urlByItemId.get(item.id) ?? '' });
  }
}
items.sort((a, b) => a.displayName.localeCompare(b.displayName));

const topArg = process.argv.indexOf('--top');
const limit = topArg !== -1 ? parseInt(process.argv[topArg + 1]) : items.length;
const targetItems = items.slice(0, limit);

interface Candidate { title: string; url: string; thumb: string; score: number; reasons: string[]; }

async function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

function scoreFilename(filename: string): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const lower = filename.toLowerCase();

  for (const kw of ACTION_KEYWORDS) {
    if (lower.includes(kw)) {
      score += 10;
      reasons.push(`+10 action(${kw})`);
    }
  }
  for (const kw of CIVILIAN_KEYWORDS) {
    if (lower.includes(kw)) {
      score -= 15;
      reasons.push(`-15 civilian(${kw})`);
    }
  }
  const yearMatch = lower.match(PEAK_YEAR_RE);
  if (yearMatch) {
    const year = parseInt(yearMatch[0]);
    if (year >= 1960 && year <= 2010) {
      score += 5;
      reasons.push(`+5 era(${year})`);
    }
  }
  // Recent year (>2015) suggests post-career
  if (lower.match(/202[0-9]|201[5-9]/)) {
    score -= 5;
    reasons.push(`-5 recent`);
  }
  // .svg/.pdf/.tif = bad format
  if (/\.(svg|pdf|tif|djvu)$/i.test(filename)) {
    score -= 50;
    reasons.push(`-50 non-photo`);
  }
  return { score, reasons };
}

async function fetchCategoryMembers(category: string, limit = 50): Promise<Candidate[]> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:${encodeURIComponent(category)}&cmlimit=${limit}&cmtype=file&format=json&origin=*`;
  try {
    const res = await fetch(url);
    const data: any = await res.json();
    const members: Array<{ title: string }> = data?.query?.categorymembers ?? [];
    if (members.length === 0) return [];

    // For each File:X, fetch its thumbnail-URL + size
    const titles = members.map((m) => m.title).join('|');
    const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles)}&prop=imageinfo&iiprop=url|size&iiurlwidth=400&format=json&origin=*`;
    const infoRes = await fetch(infoUrl);
    const infoData: any = await infoRes.json();
    const pages: any = infoData?.query?.pages ?? {};

    const out: Candidate[] = [];
    for (const pageId in pages) {
      const page = pages[pageId];
      const title = page.title?.replace(/^File:/, '') ?? '';
      const info = page.imageinfo?.[0];
      if (!info || !info.url) continue;
      // Filter out non-photo + tiny
      if (info.width < 300) continue;
      if (/\.(svg|pdf|tif|djvu|ogv|webm)$/i.test(title)) continue;
      const { score, reasons } = scoreFilename(title);
      out.push({
        title,
        url: info.url,
        thumb: info.thumburl ?? info.url,
        score,
        reasons,
      });
    }
    out.sort((a, b) => b.score - a.score);
    return out;
  } catch (e) {
    return [];
  }
}

(async () => {
  const lines: string[] = [];
  lines.push(`# FIFA WC — Commons Categories curation candidates`);
  lines.push(``);
  lines.push(`Side-by-side layout. **Current webp** vs **top-3 Commons candidates** (ranked by filename-heuristic).`);
  lines.push(``);
  lines.push(`To use: visually compare. If a candidate is better, copy its URL and tell me "byt {id} till {URL}".`);
  lines.push(``);

  let processed = 0;
  for (const item of targetItems) {
    processed++;
    process.stderr.write(`[${processed}/${targetItems.length}] ${item.displayName}\n`);
    const cands = await fetchCategoryMembers(item.displayName);
    const top3 = cands.slice(0, 3);

    lines.push(`### ${item.displayName} \`${item.id}\``);
    lines.push(``);

    if (top3.length === 0) {
      lines.push(`| Current | Candidates |`);
      lines.push(`|---------|------------|`);
      const currentImg = `<img src="../assets/quiz-images/${item.id}.webp" width="160">`;
      const currentSrc = item.currentUrl ? `<br>[source](${item.currentUrl})` : `<br>_(no batch-input)_`;
      lines.push(`| ${currentImg}${currentSrc} | _No Commons \`Category:${item.displayName}\` found._ |`);
      lines.push(``);
    } else {
      // Header row
      const headers = ['**Current**', ...top3.map((c, i) => `**Cand ${i + 1}** (score ${c.score})`)];
      lines.push(`| ${headers.join(' | ')} |`);
      lines.push(`| ${headers.map(() => '---').join(' | ')} |`);

      // Image row
      const currentImg = `<img src="../assets/quiz-images/${item.id}.webp" width="160">`;
      const candImgs = top3.map((c) => `<img src="${c.thumb.replace(/\|/g, '%7C')}" width="160">`);
      lines.push(`| ${[currentImg, ...candImgs].join(' | ')} |`);

      // Caption row (filenames + URLs)
      const currentCaption = item.currentUrl
        ? `<sub>current<br>[source](${item.currentUrl})</sub>`
        : `<sub>current<br>_(no batch-input)_</sub>`;
      const candCaptions = top3.map((c) => {
        const safeTitle = c.title.length > 50 ? c.title.slice(0, 47) + '...' : c.title;
        return `<sub>${safeTitle}<br>[link](${c.url})</sub>`;
      });
      lines.push(`| ${[currentCaption, ...candCaptions].join(' | ')} |`);
      lines.push(``);
      lines.push(`Total in Category: ${cands.length}`);
      lines.push(``);
    }
    await sleep(120);
  }

  const outPath = join(DOCS_DIR, 'commons-categories-candidates.md');
  writeFileSync(outPath, lines.join('\n'));
  console.log(`\nWrote ${outPath}`);
})();

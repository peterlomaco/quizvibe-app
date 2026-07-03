/**
 * Tillfälligt probe-script: söker Wikipedia pageimage + Wikidata P18
 * för svenska Melodifestivalvinnare utan befintlig bild i assets/quiz-images/.
 * Kör: npx tsx scripts/_mello-image-probe.ts
 */

const PROBE_ARTISTS = [
  { id: 'chips-band', name: 'Chips (band)', year: 1982, hint: 'Chips pop duo Sweden' },
  { id: 'herreys', name: 'Herreys', year: 1984, hint: 'Herreys Eurovision Sweden' },
  { id: 'roger-pontare', name: 'Roger Pontare', year: 2000, hint: 'Roger Pontare Swedish singer' },
  { id: 'martin-stenmarck', name: 'Martin Stenmarck', year: 2005, hint: 'Martin Stenmarck Swedish singer' },
  { id: 'malena-ernman', name: 'Malena Ernman', year: 2009, hint: 'Malena Ernman opera singer' },
  { id: 'robin-stjernberg', name: 'Robin Stjernberg', year: 2013, hint: 'Robin Stjernberg singer' },
  { id: 'john-lundvik', name: 'John Lundvik', year: 2019, hint: 'John Lundvik singer Eurovision 2019' },
  { id: 'the-mamas', name: 'The Mamas (Eurovision)', year: 2020, hint: 'The Mamas Eurovision 2020' },
  { id: 'tusse', name: 'Tusse', year: 2021, hint: 'Tusse Chiza singer Eurovision 2021' },
  { id: 'marcus-martinus', name: 'Marcus & Martinus', year: 2024, hint: 'Marcus Martinus Norwegian pop duo' },
  { id: 'kaj-finland', name: 'KAJ', year: 2025, hint: 'KAJ Finnish comedy band Eurovision 2025' },
  { id: 'felicia-mello', name: 'Felicia (singer)', year: 2026, hint: 'Felicia Sundström Swedish singer' },
  { id: 'charlotte-nilsson-1999', name: 'Charlotte Perrelli 1999', year: 1999, hint: 'Charlotte Nilsson singer ESC 1999' },
  { id: 'friends-swedish-band', name: 'Friends (Swedish band)', year: 2001, hint: 'Friends Swedish band children Eurovision 2001' },
  { id: 'lasse-berghagen', name: 'Lasse Berghagen', year: 1975, hint: 'Lasse Berghagen Swedish singer' },
];

const WP_EN = 'https://en.wikipedia.org/w/api.php';
const WP_SV = 'https://sv.wikipedia.org/w/api.php';
const WIKIDATA = 'https://www.wikidata.org/w/api.php';

async function fetchWikipediaPageimage(name: string, lang: 'en' | 'sv' = 'en') {
  const base = lang === 'sv' ? WP_SV : WP_EN;
  const url = `${base}?action=query&generator=search&gsrsearch=${encodeURIComponent(name)}&gsrlimit=1&prop=pageimages&piprop=original&pilimit=1&format=json`;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'QuizVibeBackend/0.1 probe' } });
    const data: any = await r.json();
    const pages = data?.query?.pages;
    if (!pages) return null;
    const page = Object.values(pages as Record<string, any>)[0];
    const src = page?.original?.source;
    const w = page?.original?.width;
    const h = page?.original?.height;
    const title = page?.title;
    if (!src) return null;
    return { url: src, width: w, height: h, title, source: lang === 'sv' ? 'wp-sv' : 'wp-en' };
  } catch { return null; }
}

async function fetchWikidataP18(name: string) {
  // Step 1: find entity by name
  const searchUrl = `${WIKIDATA}?action=wbsearchentities&search=${encodeURIComponent(name)}&language=en&limit=3&format=json`;
  try {
    const r = await fetch(searchUrl, { headers: { 'User-Agent': 'QuizVibeBackend/0.1 probe' } });
    const data: any = await r.json();
    const results = data?.search || [];
    if (results.length === 0) return null;

    // Try first few results
    for (const ent of results.slice(0, 3)) {
      const entityId = ent.id;
      const entityUrl = `${WIKIDATA}?action=wbgetentities&ids=${entityId}&props=claims&format=json`;
      const r2 = await fetch(entityUrl, { headers: { 'User-Agent': 'QuizVibeBackend/0.1 probe' } });
      const d2: any = await r2.json();
      const p18 = d2?.entities?.[entityId]?.claims?.P18;
      if (p18 && p18[0]) {
        const filename = p18[0]?.mainsnak?.datavalue?.value;
        if (filename) {
          const fileEncoded = encodeURIComponent(filename.replace(/ /g, '_'));
          const thumbUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${fileEncoded}?width=400`;
          return { url: thumbUrl, filename, entityId, description: ent.description || '' };
        }
      }
    }
    return null;
  } catch { return null; }
}

async function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const results: any[] = [];

  for (const artist of PROBE_ARTISTS) {
    console.log(`\nProbing: ${artist.name} (${artist.year})`);

    // Try Wikipedia EN with hint
    const wpEn = await fetchWikipediaPageimage(artist.hint);
    await delay(300);

    // Try Wikidata P18
    const wd = await fetchWikidataP18(artist.name);
    await delay(300);

    // Try Wikipedia SV
    const wpSv = await fetchWikipediaPageimage(artist.name, 'sv');
    await delay(300);

    results.push({ ...artist, wpEn, wpSv, wikidata: wd });

    if (wpEn) console.log(`  WP-EN: ${wpEn.url.substring(0, 80)}`);
    if (wd) console.log(`  Wikidata P18: ${wd.url.substring(0, 80)} (${wd.description})`);
    if (wpSv) console.log(`  WP-SV: ${wpSv.url.substring(0, 80)}`);
  }

  // Build HTML preview
  let html = `<!DOCTYPE html>
<html lang="sv">
<head>
<meta charset="UTF-8">
<title>Melodifestivalen vinnare — Bildpreview</title>
<style>
body { font-family: sans-serif; background:#111; color:#eee; padding:20px; }
h1 { color: #F5A623; }
.grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(320px,1fr)); gap:16px; margin-top:20px; }
.card { background:#1a1a2e; border:1px solid #333; border-radius:8px; padding:12px; }
.card h2 { font-size:14px; margin:0 0 4px; color:#F5A623; }
.card .year { font-size:12px; color:#aaa; margin-bottom:8px; }
.img-row { display:flex; gap:8px; flex-wrap:wrap; }
.img-item { flex:1; min-width:80px; max-width:140px; }
.img-item img { width:100%; border-radius:4px; object-fit:contain; background:#222; max-height:160px; }
.img-item .label { font-size:10px; color:#888; margin-top:2px; text-align:center; }
.img-item .license { font-size:9px; color:#6af; }
.missing { color:#f66; font-size:12px; padding:12px; text-align:center; }
</style>
</head>
<body>
<h1>🎵 Melodifestivalen vinnare — Bildpreview för validering</h1>
<p style="color:#aaa">Artister utan befintlig bild i quiz-pool. Validera och godkänn sedan för download.</p>
<div class="grid">`;

  for (const r of results) {
    html += `<div class="card">
<h2>${r.name}</h2>
<div class="year">Melodifestivalen ${r.year}</div>
<div class="img-row">`;

    let hasAny = false;

    if (r.wikidata) {
      hasAny = true;
      html += `<div class="img-item">
  <img src="${r.wikidata.url}" alt="${r.name}" loading="lazy" onerror="this.style.display='none'">
  <div class="label">Wikidata P18</div>
  <div class="license">${r.wikidata.description}</div>
  <div class="license" style="word-break:break-all;font-size:8px">${r.wikidata.filename}</div>
</div>`;
    }

    if (r.wpEn) {
      hasAny = true;
      html += `<div class="img-item">
  <img src="${r.wpEn.url}" alt="${r.name}" loading="lazy" onerror="this.style.display='none'">
  <div class="label">WP-EN (${r.wpEn.width}×${r.wpEn.height})</div>
  <div class="license" style="word-break:break-all;font-size:8px">${r.wpEn.url.split('/').slice(-1)[0].substring(0,60)}</div>
</div>`;
    }

    if (r.wpSv) {
      hasAny = true;
      html += `<div class="img-item">
  <img src="${r.wpSv.url}" alt="${r.name}" loading="lazy" onerror="this.style.display='none'">
  <div class="label">WP-SV (${r.wpSv.width}×${r.wpSv.height})</div>
  <div class="license" style="word-break:break-all;font-size:8px">${r.wpSv.url.split('/').slice(-1)[0].substring(0,60)}</div>
</div>`;
    }

    if (!hasAny) {
      html += `<div class="missing">❌ Ingen bild hittad</div>`;
    }

    html += `</div></div>`;
  }

  html += `</div></body></html>`;

  const fs = await import('fs');
  const outPath = 'backend/output/mello-image-preview.html';
  fs.writeFileSync(`C:/Users/46725/quizvibe-app/${outPath}`, html, 'utf-8');
  console.log(`\n✅ Preview written to ${outPath}`);
}

main().catch(console.error);

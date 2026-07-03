import { writeFileSync } from 'fs';

const artists = [
  { id: 'conchita-wurst', name: 'Conchita Wurst', year: 'ESC 2014 · Österrike',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Conchita_Wurst_at_Berlinale_2026-6.jpg',
    dim: '1813×2241', label: 'WP-EN · Berlinale 2026',
    note: 'artist | audience: millennials, gen-x, gen-z',
    commons: 'https://commons.wikimedia.org/wiki/File:Conchita_Wurst_at_Berlinale_2026-6.jpg' },
  { id: 'lordi', name: 'Lordi', year: 'ESC 2006 · Finland',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/68/Lordi_Metal_Frenzy_2025_10.jpg',
    dim: '4973×3315', label: 'WP-EN · Metal Frenzy 2025 med masker',
    note: 'band | audience: gen-x, millennials. Karakteristiska monster-masker.',
    commons: 'https://en.wikipedia.org/wiki/Lordi' },
  { id: 'maneskin', name: 'Måneskin', year: 'ESC 2021 · Italien',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Maneskin_2018.jpg',
    dim: '7802×5204', label: 'WP-EN · 2018 (pre-ESC)',
    note: 'OBS: bild från 2018 — kolla om nyare finns. band | gen-z, gen-alpha',
    commons: 'https://en.wikipedia.org/wiki/M%C3%A5neskin' },
  { id: 'alexander-rybak', name: 'Alexander Rybak', year: 'ESC 2009 · Norge',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Alexander_Rybak_%284%29_20180510_EuroV.jpg',
    dim: '1755×1619', label: 'WP-EN · Eurovision 2018',
    note: 'artist | millennials, gen-x',
    commons: 'https://en.wikipedia.org/wiki/Alexander_Rybak' },
  { id: 'netta-barzilai', name: 'Netta Barzilai', year: 'ESC 2018 · Israel',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Netta_Barzilai.jpg',
    dim: '4090×4480', label: 'WP-EN',
    note: 'artist | gen-z, millennials. Distintivt utseende.',
    commons: 'https://en.wikipedia.org/wiki/Netta_Barzilai' },
  { id: 'lena-meyer-landrut', name: 'Lena Meyer-Landrut', year: 'ESC 2010 · Tyskland',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/MJK_67923_Lena_Meyer-Landrut_%28Berlin.jpg',
    dim: '4052×6079', label: 'WP-EN · Berlin',
    note: 'artist | millennials, gen-z',
    commons: 'https://en.wikipedia.org/wiki/Lena_Meyer-Landrut' },
  { id: 'dana-international', name: 'Dana International', year: 'ESC 1998 · Israel',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/af/PikiWiki_Israel_48024_Dana_Internation.jpg',
    dim: '4608×3456', label: 'WP-EN · PikiWiki',
    note: 'OBS: verifiera CC-licens på PikiWiki-bild. artist | millennials, gen-x',
    commons: 'https://en.wikipedia.org/wiki/Dana_International' },
  { id: 'duncan-laurence', name: 'Duncan Laurence', year: 'ESC 2019 · Nederländerna',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Duncan_Laurence_with_the_2019_Eurovisi.jpg',
    dim: '3000×4000', label: 'WP-EN · med ESC 2019-trophy',
    note: 'Arcade var global hit. artist | gen-z, millennials',
    commons: 'https://en.wikipedia.org/wiki/Duncan_Laurence' },
];

const missing = [
  { name: 'Kalush Orchestra', year: 'ESC 2022', note: 'Ingen Wikipedia-bild. Sök: commons.wikimedia.org' },
  { name: 'Nemo', year: 'ESC 2024', note: 'Ingen Wikipedia-bild. Sök: commons.wikimedia.org' },
  { name: 'Emmelie de Forest', year: 'ESC 2013', note: 'Ingen Wikipedia-bild hittad.' },
  { name: 'Salvador Sobral', year: 'ESC 2017', note: 'Ingen Wikipedia-bild hittad.' },
  { name: 'Helena Paparizou', year: 'ESC 2005', note: 'Fel bild returnerades (Marinella). Sök manuellt.' },
];

const CSS = `body{font-family:system-ui,sans-serif;background:#111;color:#eee;padding:20px;max-width:1100px;margin:0 auto}
h1{color:#F5A623}.sub{color:#aaa;font-size:12px;margin-bottom:20px}
.sh{font-size:14px;font-weight:700;color:#F5A623;margin:20px 0 10px;border-bottom:1px solid #333;padding-bottom:5px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
.card{background:#1a1a2e;border:1px solid #333;border-radius:10px;padding:12px}
.card h2{font-size:14px;margin:3px 0 2px}.yr{font-size:11px;color:#F5A623;font-weight:600}
.note{font-size:10px;color:#888;margin-top:5px;line-height:1.4}
.note code{background:#222;padding:1px 4px;border-radius:3px;font-size:9px}
img{width:100%;border-radius:6px;object-fit:cover;background:#222;max-height:190px;margin-top:8px}
.lbl{font-size:10px;color:#7af;margin-top:3px;text-align:center}
.dim{font-size:9px;color:#666;text-align:center}
a.cl{font-size:9px;color:#4af;display:block;text-align:center;margin-top:2px}
.ok{display:inline-block;background:#1a4a1a;color:#4f4;border-radius:4px;padding:1px 7px;font-size:10px;font-weight:600}
.ms{display:inline-block;background:#4a1a1a;color:#f66;border-radius:4px;padding:1px 7px;font-size:10px;font-weight:600}
.sum{margin-top:20px;padding:12px;background:#1a2a1a;border:1px solid #4f4;border-radius:8px}
.sum h2{color:#4f4;margin:0 0 6px}.sum p{margin:3px 0;font-size:13px}`;

const newCards = artists.map(a => {
  const cmd = `npm run wikimedia-process ${a.id} "${a.url}"`;
  return `<div class="card"><span class="ok">✓ NY BILD</span><h2>${a.name}</h2>
<div class="yr">${a.year}</div>
<div class="note">ID: <code>${a.id}</code><br>${a.note}<br>Cmd: <code>${cmd}</code></div>
<img src="${a.url}" alt="${a.name}" loading="lazy" onerror="this.style.opacity=0.1">
<div class="lbl">${a.label}</div><div class="dim">${a.dim}</div>
<a class="cl" href="${a.commons}" target="_blank">Wikipedia →</a></div>`;
}).join('\n');

const missingCards = missing.map(m =>
  `<div class="card"><span class="ms">✗ SAKNAS</span><h2>${m.name}</h2><div class="yr">${m.year}</div><div class="note">${m.note}</div></div>`
).join('\n');

const html = `<!DOCTYPE html><html lang="sv"><head><meta charset="UTF-8">
<title>ESC vinnare — Bildpreview</title>
<style>${CSS}</style></head><body>
<h1>🎤 Eurovision Song Contest vinnare — Bildpreview</h1>
<p class="sub">Godkänn de du vill ha: kör wikimedia-process → cp webp till assets/ → lägg till i artists-*.yaml → export-image-questions</p>
<div class="sh">🟢 Hittade bilder — granska och godkänn</div>
<div class="grid">${newCards}</div>
<div class="sh">🔴 Saknar fri bild — kräver manuell sökning</div>
<div class="grid">${missingCards}</div>
<div class="sum">
<h2>📊 Sammanfattning ESC build-out</h2>
<p>✅ <strong>49 nya YouTube-klipp</strong> tillagda (ESC 1970–2026)</p>
<p>✅ <strong>407 totala musik-frågor</strong> i musicQuestions.ts</p>
<p>✅ <strong>8 artister</strong> med hittade Wikipedia-bilder att granska</p>
<p>⚠️ <strong>5 artister</strong> saknar fri bild (Kalush, Nemo, Emmelie de Forest, Salvador Sobral, Helena Paparizou)</p>
<p style="color:#aaa;font-size:11px;margin-top:6px">Quota använt idag: ~8 500 av 10 000 enheter</p>
</div></body></html>`;

writeFileSync('C:/Users/46725/quizvibe-app/backend/output/esc-image-preview.html', html, 'utf-8');
console.log('Written: ' + html.length + ' chars');

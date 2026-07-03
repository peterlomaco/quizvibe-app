import { writeFileSync } from 'fs';

const artists_new = [
  { id: 'herreys', name: 'Herreys', year: '1984 · ESC-vinnare',
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Herreys_in_2016_%28cropped%29.jpg',
    dim: '2199×2200 · CC BY-SA', label: 'Wikidata P18 · 2016',
    commons: 'https://commons.wikimedia.org/wiki/File:Herreys_in_2016_(cropped).jpg' },
  { id: 'roger-pontare', name: 'Roger Pontare', year: 'Mello 2000',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Roger_Pontare.png',
    dim: 'CC BY-SA', label: 'Wikidata P18',
    commons: 'https://commons.wikimedia.org/wiki/File:Roger_Pontare.png' },
  { id: 'martin-stenmarck', name: 'Martin Stenmarck', year: 'Mello 2005',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Martin_Stenmarck.Melodifestivalen2019.jpg',
    dim: '3456×4608', label: 'WP-EN · Mello 2019 foto',
    commons: 'https://en.wikipedia.org/wiki/Martin_Stenmarck' },
  { id: 'malena-ernman', name: 'Malena Ernman', year: 'Mello 2009',
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Malena_Ernman_April_2012.png',
    dim: '347×481 (låg res!)', label: 'WP-EN · 2012',
    commons: 'https://commons.wikimedia.org/wiki/File:Malena_Ernman_April_2012.png' },
  { id: 'robin-stjernberg', name: 'Robin Stjernberg', year: 'Mello 2013',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/32/Robin_Stjernberg-2.jpg',
    dim: '1638×2027', label: 'WP-EN',
    commons: 'https://commons.wikimedia.org/wiki/File:Robin_Stjernberg-2.jpg' },
  { id: 'the-mamas', name: 'The Mamas', year: 'Mello 2020',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/68/The_Mamas_Melodifestivalen_2020_presskort.jpg',
    dim: '5200×3723', label: 'WP-EN · Mello 2020 presskort',
    commons: 'https://en.wikipedia.org/wiki/The_Mamas' },
  { id: 'john-lundvik', name: 'John Lundvik', year: 'Mello 2019',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Melodifestivalen_2025_-_Artists_-_John_Lundvik.jpg',
    dim: '2147×2716', label: 'WP-EN · Mello 2025 foto',
    commons: 'https://en.wikipedia.org/wiki/John_Lundvik' },
  { id: 'tusse', name: 'Tusse', year: 'Mello 2021',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Tusse_Chiza_2019.jpg',
    dim: '1485×1597', label: 'WP-EN · 2019',
    commons: 'https://commons.wikimedia.org/wiki/File:Tusse_Chiza_2019.jpg' },
  { id: 'marcus-martinus', name: 'Marcus & Martinus', year: 'Mello 2024',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Marcus_%26_Martinus_01_%28cropped%29.jpg',
    dim: '2372×2985 · CC BY-SA', label: 'WP-EN · cropped',
    commons: 'https://commons.wikimedia.org/wiki/File:Marcus_%26_Martinus_01_(cropped).jpg' },
];

const existing = [
  { name: 'ABBA', yr: '1974', yt: 'Waterloo ✓' },
  { name: 'Carola', yr: '1983 · 1991 · 2006', yt: 'Fångad av en stormvind + Evighet ✓' },
  { name: 'Eric Saade', yr: '2011', yt: 'Popular (officiell MV) ✓' },
  { name: 'Sanna Nielsen', yr: '2014', yt: 'Undo (officiell MV) ✓' },
  { name: 'Robin Bengtsson', yr: '2017', yt: "I Can't Go On ✓" },
  { name: 'Cornelia Jakobs', yr: '2022', yt: 'Hold Me Closer ✓' },
  { name: 'Loreen', yr: '2012 · 2023', yt: 'Euphoria + Tattoo ✓' },
  { name: 'Charlotte Perrelli', yr: '1999 · 2008', yt: 'Tusen och en natt + Hero ✓' },
  { name: 'Lena Philipsson', yr: '2004', yt: 'Det gör ont ✓' },
  { name: 'Arvingarna', yr: '1993', yt: 'Eloise ✓' },
  { name: 'Anna Bergendahl', yr: '2010', yt: 'This Is My Life ✓' },
  { name: 'Tommy Körberg', yr: '1988', yt: 'Stad i ljus ✓' },
  { name: 'Lotta Engberg', yr: '1987', yt: 'Fyra bugg och en Coca Cola ✓' },
  { name: 'Björn Skifs', yr: '1981', yt: 'Fångad i en dröm ✓' },
  { name: 'Kikki Danielsson', yr: '1985', yt: 'Bra vibrationer ✓' },
  { name: 'The Ark', yr: '2007', yt: 'The Worrying Kind ✓' },
  { name: 'Tomas Ledin', yr: '1980', yt: 'Just nu! ✓' },
  { name: 'Jill Johnson', yr: '1998', yt: 'Kärleken är ✓' },
];

const CSS = `body{font-family:system-ui,sans-serif;background:#111;color:#eee;padding:20px;max-width:1100px;margin:0 auto}
h1{color:#F5A623}.sub{color:#aaa;margin-bottom:20px;font-size:13px}
.sh{font-size:15px;font-weight:700;color:#F5A623;margin:22px 0 10px;border-bottom:1px solid #333;padding-bottom:5px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(255px,1fr));gap:14px}
.card{background:#1a1a2e;border:1px solid #333;border-radius:10px;padding:12px}
.card h2{font-size:14px;margin:4px 0 2px}.yr{font-size:11px;color:#F5A623;font-weight:600}
.note{font-size:10px;color:#888;margin-top:5px;line-height:1.4}
.note code{background:#222;padding:1px 4px;border-radius:3px;font-size:9px}
img{width:100%;border-radius:6px;object-fit:cover;background:#222;max-height:190px;margin-top:8px}
.lbl{font-size:10px;color:#7af;margin-top:3px;text-align:center}.dim{font-size:9px;color:#666;text-align:center}
a.cl{font-size:9px;color:#4af;display:block;text-align:center;margin-top:2px}
.ok{display:inline-block;background:#1a4a1a;color:#4f4;border-radius:4px;padding:1px 7px;font-size:10px;font-weight:600}
.ex{display:inline-block;background:#1a2a4a;color:#4af;border-radius:4px;padding:1px 7px;font-size:10px;font-weight:600}
.ms{display:inline-block;background:#4a1a1a;color:#f66;border-radius:4px;padding:1px 7px;font-size:10px;font-weight:600}
.sum{margin-top:28px;padding:14px;background:#1a2a1a;border:1px solid #4f4;border-radius:8px}
.sum h2{color:#4f4;margin:0 0 8px}.sum p{margin:3px 0}`;

const newCards = artists_new.map(a => {
  const cmd = `npm run wikimedia-process ${a.id} "${a.url}"`;
  return `<div class="card"><span class="ok">✓ NY BILD</span><h2>${a.name}</h2>
<div class="yr">${a.year}</div>
<div class="note">ID: <code>${a.id}</code><br>Cmd: <code>${cmd}</code></div>
<img src="${a.url}" alt="${a.name}" loading="lazy" onerror="this.style.opacity=0.1">
<div class="lbl">${a.label}</div><div class="dim">${a.dim}</div>
<a class="cl" href="${a.commons}" target="_blank">Länk →</a></div>`;
}).join('\n');

const existingCards = existing.map(e =>
  `<div class="card"><span class="ex">◎ FINNS</span><h2>${e.name}</h2><div class="yr">${e.yr}</div><div class="note">YT: ${e.yt}</div></div>`
).join('\n');

const missingCards = `
<div class="card"><span class="ms">✗ SAKNAS</span><h2>KAJ</h2><div class="yr">Mello &amp; ESC 2025</div>
<div class="note">Finsk komediduo. Sök manuellt på <a href="https://commons.wikimedia.org/w/index.php?search=KAJ+finland+band" target="_blank" style="color:#4af">Commons</a>. YT-klipp "Bara bada bastu" ✓ tillagt.</div></div>
<div class="card"><span class="ms">✗ SAKNAS</span><h2>Felicia (Sundström)</h2><div class="yr">Mello &amp; ESC 2026</div>
<div class="note">Ny vinnare. Sök: <a href="https://sv.wikipedia.org/wiki/Felicia_Sundstr%C3%B6m" target="_blank" style="color:#4af">sv.wikipedia.org</a>. YT-klipp "My System" ✓ tillagt.</div></div>
<div class="card"><span class="ms">✗ SAKNAS</span><h2>Chips (band)</h2><div class="yr">Mello 1982</div><div class="note">Elisabeth Andreasson + Kikki Danielsson. Låg prioritet.</div></div>
<div class="card"><span class="ms">✗ SAKNAS</span><h2>Friends (Swedish)</h2><div class="yr">Mello 2001</div><div class="note">Barngrupp. Låg prioritet.</div></div>`;

const html = `<!DOCTYPE html><html lang="sv"><head><meta charset="UTF-8">
<title>Melodifestivalen vinnare — Bildpreview</title>
<style>${CSS}</style></head><body>
<h1>🎵 Melodifestivalen vinnare — Bildpreview för validering</h1>
<p class="sub">Artister som saknar bild i quiz-pool. Godkänn sedan: <code>npm run wikimedia-process &lt;id&gt; &lt;url&gt;</code> → kopiera webp till assets/quiz-images/ → lägg till i artists-*.yaml</p>

<div class="sh">🟢 Hittade bilder — redo för nedladdning (9 artister)</div>
<div class="grid">${newCards}</div>

<div class="sh">🔴 Saknar fri bild — kräver manuell Commons-sökning</div>
<div class="grid">${missingCards}</div>

<div class="sh">🔵 Befintliga bilder med nya Mello-YT-klipp (17 artister)</div>
<div class="grid">${existingCards}</div>

<div class="sum">
<h2>📊 Sammanfattning — Melodifestivalen build-out 2026-06-01</h2>
<p>✅ <strong>33 nya YouTube-klipp</strong> tillagda i katalogen (åren 1980–2026)</p>
<p>✅ <strong>358 totala musik-frågor</strong> i musicQuestions.ts (regenererat)</p>
<p>✅ <strong>9 artister</strong> med hittade fria Wikipedia-bilder redo för nedladdning</p>
<p>✅ <strong>17 befintliga artister</strong> kompletterade med sina Mello-vinnarlåtar</p>
<p>⚠️ <strong>4 artister</strong> saknar fortfarande fri bild (KAJ, Felicia, Chips, Friends)</p>
<p style="color:#aaa;font-size:11px;margin-top:8px">Quota använt: ~3 500 av 10 000 enheter för idag</p>
</div>
</body></html>`;

writeFileSync('C:/Users/46725/quizvibe-app/backend/output/mello-image-preview.html', html, 'utf-8');
console.log('✅ Written: ' + html.length + ' chars');

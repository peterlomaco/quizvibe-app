import { writeFileSync } from 'fs';

const items = [
  {
    id: 'russell-crowe',
    name: 'Russell Crowe',
    type: 'Actor · actors-millennials.yaml',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Russell_Crowe_on_the_Green_Carpet_at_the_2025_Zurich_Film_Festival_06_%28cropped%29.jpg',
    dim: '2061×3092',
    label: 'WP-EN · Zurich Film Festival 2025 (cropped)',
    cmd: 'npm run wikimedia-process russell-crowe "https://upload.wikimedia.org/wikipedia/commons/a/a7/Russell_Crowe_on_the_Green_Carpet_at_the_2025_Zurich_Film_Festival_06_%28cropped%29.jpg"',
  },
  {
    id: 'torkel-petersson',
    name: 'Torkel Petersson',
    type: 'Actor · actors-sweden-classic.yaml',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Torkel_Petersson_in_August_2015.jpg',
    dim: '780×1000',
    label: 'WP-EN · August 2015',
    cmd: 'npm run wikimedia-process torkel-petersson "https://upload.wikimedia.org/wikipedia/commons/b/b4/Torkel_Petersson_in_August_2015.jpg"',
  },
  {
    id: 'tuva-novotny',
    name: 'Tuva Novotny',
    type: 'Actor · actors-sweden-modern.yaml',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Tuva_Novotny.jpg',
    dim: '443×554 ⚠️ låg res',
    label: 'WP-EN — kolla om bättre finns på Commons',
    cmd: 'npm run wikimedia-process tuva-novotny "https://upload.wikimedia.org/wikipedia/commons/0/0d/Tuva_Novotny.jpg"',
  },
  {
    id: 'frida-hyvonen',
    name: 'Frida Hyvönen',
    type: 'Artist · artists-millennials.yaml',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Frida_Hyv%C3%B6nen_%28fifthdisc%29.jpg',
    dim: '1150×863',
    label: 'WP-EN · fifthdisc',
    cmd: 'npm run wikimedia-process frida-hyvonen "https://upload.wikimedia.org/wikipedia/commons/2/21/Frida_Hyv%C3%B6nen_%28fifthdisc%29.jpg"',
  },
  {
    id: 'silvana-imam',
    name: 'Silvana Imam',
    type: 'Artist · artists-millennials.yaml',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Silvana_Imam%2C_Skeppsholmen%2C_Stockholm%2C_Sweden%2C_July_2015.jpg',
    dim: '333×500 ⚠️ låg res',
    label: 'WP-EN · Skeppsholmen Stockholm 2015 — kolla om bättre finns',
    cmd: 'npm run wikimedia-process silvana-imam "https://upload.wikimedia.org/wikipedia/commons/0/0c/Silvana_Imam%2C_Skeppsholmen%2C_Stockholm%2C_Sweden%2C_July_2015.jpg"',
  },
  {
    id: 'andres-iniesta',
    name: 'Andrés Iniesta',
    type: 'Athlete · athletes-modern.yaml',
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Andr%C3%A9s_Iniesta_%28cropped%29.jpg',
    dim: 'Wikidata P18 cropped — bättre än WP-EN 488×636',
    label: 'Wikidata P18 · cropped portrait',
    cmd: 'npm run wikimedia-process andres-iniesta "https://upload.wikimedia.org/wikipedia/commons/c/c1/Andr%C3%A9s_Iniesta_%28cropped%29.jpg"',
    urlAlt: 'https://upload.wikimedia.org/wikipedia/commons/5/57/Andr%C3%A9s_Iniesta_2019.jpg',
    labelAlt: 'WP-EN · 2019 [488×636]',
  },
  {
    id: 'jean-tigana',
    name: 'Jean Tigana',
    type: 'Athlete · athletes-elder-gen-x.yaml',
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Jean_Tigana_cropped.jpg',
    dim: '350×466 ⚠️ låg res',
    label: 'WP-EN · cropped — enda tillgängliga',
    cmd: 'npm run wikimedia-process jean-tigana "https://upload.wikimedia.org/wikipedia/commons/5/59/Jean_Tigana_cropped.jpg"',
  },
  {
    id: 'jesper-blomqvist',
    name: 'Jesper Blomqvist',
    type: 'Athlete · athletes-sweden-football-modern.yaml',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Jesper_Blomqvist.jpg',
    dim: '265×359 ⚠️ mycket låg res',
    label: 'WP-EN — enda tillgängliga, overväg att skippa',
    cmd: 'npm run wikimedia-process jesper-blomqvist "https://upload.wikimedia.org/wikipedia/commons/b/bd/Jesper_Blomqvist.jpg"',
  },
];

const CSS = `body{font-family:system-ui,sans-serif;background:#111;color:#eee;padding:20px;max-width:1000px;margin:0 auto}
h1{color:#F5A623}.sub{color:#aaa;font-size:12px;margin-bottom:20px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px}
.card{background:#1a1a2e;border:1px solid #333;border-radius:10px;padding:12px}
.card h2{font-size:14px;margin:3px 0 2px}.type{font-size:11px;color:#F5A623;font-weight:600}
.note{font-size:10px;color:#888;margin-top:5px;line-height:1.4}
.note code{background:#222;padding:1px 3px;border-radius:3px;font-size:9px}
img{width:100%;border-radius:6px;object-fit:cover;background:#222;max-height:200px;margin-top:8px}
.lbl{font-size:10px;color:#7af;margin-top:3px;text-align:center}
.dim{font-size:9px;text-align:center}
.dim.warn{color:#f90}
.dim.ok{color:#666}
a.cl{font-size:9px;color:#4af;display:block;text-align:center;margin-top:2px}
.alt{margin-top:6px;border-top:1px solid #333;padding-top:6px}`;

const cards = items.map(a => `<div class="card">
<h2>${a.name}</h2>
<div class="type">${a.type}</div>
<div class="note">ID: <code>${a.id}</code><br>Cmd: <code>${a.cmd}</code></div>
<img src="${a.url}" alt="${a.name}" loading="lazy" onerror="this.style.opacity=0.1">
<div class="lbl">${a.label}</div>
<div class="dim ${a.dim.includes('⚠️') ? 'warn' : 'ok'}">${a.dim}</div>
<a class="cl" href="https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(a.name)}&ns6=1" target="_blank">Sök fler på Commons →</a>
${a.urlAlt ? `<div class="alt"><div class="note">Alt-bild:</div><img src="${a.urlAlt}" alt="${a.name} alt" loading="lazy" onerror="this.style.opacity=0.1"><div class="lbl">${a.labelAlt}</div></div>` : ''}
</div>`).join('\n');

const html = `<!DOCTYPE html><html lang="sv"><head><meta charset="UTF-8">
<title>Bildförslag — 8 artister/skådisar/atleter</title>
<style>${CSS}</style></head><body>
<h1>🖼 Bildförslag för 8 items</h1>
<p class="sub">Godkänn de du vill ha och kör wikimedia-process-kommandot. ⚠️ = låg upplösning (kan ändå fungera).</p>
<div class="grid">${cards}</div>
</body></html>`;

writeFileSync('C:/Users/46725/quizvibe-app/backend/output/image-suggestions-8.html', html, 'utf-8');
console.log('Written: ' + html.length + ' chars');

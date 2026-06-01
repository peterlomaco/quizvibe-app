import * as fs from 'fs';
import * as path from 'path';
const dir = __dirname;
const html = fs.readFileSync(path.join(dir, '..', 'output', 'alt-images-v2.html'), 'utf8');

// picks: id -> index (#N)
const picks: Record<string, number> = {
  'charlie-chaplin': 9,
  'bruce-springsteen': 1,
  'kurt-cobain': 4,
  'peter-lemarc': 4,
  'glenn-hysen': 4,
  'goran-ivanisevic': 10,
  'ian-rush': 5,
  'ivan-lendl': 4,
  'jimmy-connors': 4,
  'magnus-wislander': 1,
  'sergio-ramos': 3,
  'genesis': 4,
  'green-day': 9,
  'kent': 6,
  'wham': 1,
  'ylvis': 1,
};

// split into sections, build id -> ordered candidate urls
const sections = html.split('<section>').slice(1);
const urlsById = new Map<string, string[]>();
for (const sec of sections) {
  const idm = sec.match(/<span class="id">([^<]+)<\/span>/);
  if (!idm) continue;
  const id = idm[1].trim();
  const urls = [...sec.matchAll(/class="url" readonly value="([^"]*)"/g)].map((m) =>
    m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
  );
  urlsById.set(id, urls);
}

const out: { id: string; url: string }[] = [];
const errors: string[] = [];
for (const [id, n] of Object.entries(picks)) {
  const urls = urlsById.get(id);
  if (!urls) { errors.push(`${id}: section not found`); continue; }
  const url = urls[n - 1];
  if (!url) { errors.push(`${id}: #${n} out of range (have ${urls.length})`); continue; }
  out.push({ id, url });
}
fs.writeFileSync(path.join(dir, '_picks.json'), JSON.stringify(out, null, 2));
console.log(`Resolved ${out.length}/${Object.keys(picks).length} picks -> _picks.json`);
for (const o of out) console.log(`  ${o.id}  <-  ${o.url}`);
if (errors.length) console.log('ERRORS:\n  ' + errors.join('\n  '));

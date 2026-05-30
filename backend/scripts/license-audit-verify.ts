// Utökad license-audit: verifierar ALLA image-items med webp.
//
// För varje item:
//   1. Om käll-URL finns i batch-input-*.json → slå upp licens + upphovsperson direkt.
//   2. Annars → re-probe:a Wikipedia pageimage på displayName (en, sedan sv),
//      återvinn filnamn → slå upp licens + upphovsperson.
//
// Re-probe-caveat: pageimage för ett namn kan ha bytts sedan vi processade,
// så återvunnen licens är en representativ proxy (samma pipeline), inte en
// garanti för att det är exakt samma fil. Räcker för en compliance-sweep:
// syftet är att fånga ev. non-commercial / non-free och bygga attribution.
//
// Output:
//   - docs/full-license-audit-verified.md  (per-kategori + per-fil-översikt)
//   - docs/image-attribution.md            (credits-manifest: id, namn, upphovsperson, licens, källa)

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { loadCatalog } from '../content/registry';
import { findWikipediaPageImage } from '../wikimedia/client';

const SCRIPTS_DIR = __dirname;
const DOCS_DIR = join(__dirname, '..', '..', 'docs');
const ASSETS = join(__dirname, '..', '..', 'assets', 'quiz-images');

// ── 1. Samla registrerade käll-URL:er från batch-input-filerna ──────────────
const urlByItemId = new Map<string, string>();
const batchFiles = readdirSync(SCRIPTS_DIR).filter(
  (f) => f.startsWith('batch-input-') && f.endsWith('.json'),
);
for (const f of batchFiles) {
  try {
    const content = JSON.parse(readFileSync(join(SCRIPTS_DIR, f), 'utf8'));
    for (const entry of content) if (entry.id && entry.url) urlByItemId.set(entry.id, entry.url);
  } catch {
    /* ignore unparsable */
  }
}

// ── 2. Lista alla image-items som har en webp på disk ───────────────────────
const { files } = loadCatalog();
interface Item {
  id: string;
  displayName: string;
  file: string;
  sourceUrl: string;
}
const items: Item[] = [];
for (const [filename, file] of files) {
  if (file.contentForm !== 'image') continue;
  for (const item of file.items) {
    if (!existsSync(join(ASSETS, `${item.id}.webp`))) continue;
    items.push({
      id: item.id,
      displayName: item.displayName,
      file: filename,
      sourceUrl: urlByItemId.get(item.id) ?? '',
    });
  }
}
// Dedupe på id (cross-gen-figurer kan ligga i flera filer)
const seen = new Set<string>();
const uniqueItems = items.filter((it) => (seen.has(it.id) ? false : (seen.add(it.id), true)));

console.log(`Total unika image items med webp: ${uniqueItems.length}`);
console.log(`  Med registrerad käll-URL: ${uniqueItems.filter((i) => i.sourceUrl).length}`);
console.log(`  Saknar URL (kräver re-probe): ${uniqueItems.filter((i) => !i.sourceUrl).length}`);

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function urlToFilename(url: string): string {
  const m = url.match(/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/]+?)(?:\/\d+px-.*)?$/);
  return m ? decodeURIComponent(m[1]) : '';
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchLicenseAndArtist(
  filename: string,
  retries = 3,
): Promise<{ license: string; artist: string }> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(
    'File:' + filename,
  )}&prop=imageinfo&iiprop=extmetadata&format=json&origin=*`;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'QuizVibeBackend/0.1 (license-audit)' } });
      if (!res.ok) {
        await sleep(500 * (attempt + 1));
        continue;
      }
      const data: any = await res.json();
      const pages = data?.query?.pages ?? {};
      for (const k in pages) {
        if (k === '-1') continue;
        const meta = pages[k]?.imageinfo?.[0]?.extmetadata;
        if (!meta) continue;
        return {
          license: meta.LicenseShortName?.value ? stripHtml(meta.LicenseShortName.value) : '',
          artist: meta.Artist?.value ? stripHtml(meta.Artist.value) : '',
        };
      }
      return { license: '', artist: '' };
    } catch {
      if (attempt === retries - 1) return { license: '', artist: '' };
      await sleep(500 * (attempt + 1));
    }
  }
  return { license: '', artist: '' };
}

function categorize(license: string): 'pd-safe' | 'attribution-required' | 'non-commercial' | 'unknown' {
  const l = license.toLowerCase();
  if (!l) return 'unknown';
  if (l.includes('non-commercial') || l.includes('noncommercial') || /\bnc\b/.test(l) || l.includes('-nc')) return 'non-commercial';
  if (l.includes('public domain') || l.includes('pd-') || l.includes('cc0') || l.includes('cc zero')) return 'pd-safe';
  if (l.includes('cc-by') || l.includes('cc by') || l.includes('gfdl') || l.includes('attribution')) return 'attribution-required';
  return 'unknown';
}

(async () => {
  interface Result extends Item {
    license: string;
    artist: string;
    category: string;
    method: 'recorded-url' | 're-probe' | 'no-source';
    descriptionUrl: string;
  }
  const results: Result[] = [];
  let i = 0;
  for (const item of uniqueItems) {
    i++;
    if (i % 25 === 0) process.stderr.write(`[${i}/${uniqueItems.length}]\n`);

    // Väg A: registrerad URL
    if (item.sourceUrl) {
      const filename = urlToFilename(item.sourceUrl);
      if (filename) {
        const { license, artist } = await fetchLicenseAndArtist(filename);
        results.push({
          ...item,
          license,
          artist,
          category: categorize(license),
          method: 'recorded-url',
          descriptionUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(filename)}`,
        });
        await sleep(150);
        continue;
      }
    }

    // Väg B: re-probe Wikipedia pageimage på displayName
    let recovered: { license: string; artist: string; descriptionUrl: string } | null = null;
    for (const lang of ['en', 'sv'] as const) {
      try {
        const r = await findWikipediaPageImage(item.displayName, { lang });
        if (r) {
          recovered = {
            license: r.license ?? '',
            artist: r.artist ?? '',
            descriptionUrl: r.descriptionUrl,
          };
          if (r.license) break; // hittade licens → klart
        }
      } catch {
        /* prova nästa språk */
      }
      await sleep(120);
    }
    if (recovered) {
      results.push({
        ...item,
        license: recovered.license,
        artist: recovered.artist,
        category: categorize(recovered.license),
        method: 're-probe',
        descriptionUrl: recovered.descriptionUrl,
      });
    } else {
      results.push({
        ...item,
        license: '',
        artist: '',
        category: 'unknown',
        method: 'no-source',
        descriptionUrl: '',
      });
    }
    await sleep(120);
  }

  // ── Sammanfattning ──
  const cats = ['pd-safe', 'attribution-required', 'non-commercial', 'unknown'] as const;
  console.log(`\n=== Summary (${results.length} items) ===`);
  for (const cat of cats) {
    const list = results.filter((r) => r.category === cat);
    const pct = ((list.length / results.length) * 100).toFixed(1);
    console.log(`  ${cat.padEnd(22)}: ${list.length} (${pct}%)`);
  }
  const stillUnknown = results.filter((r) => r.category === 'unknown');
  console.log(`\n  varav helt utan källa: ${stillUnknown.filter((r) => r.method === 'no-source').length}`);

  // ── audit-md ──
  const md: string[] = [];
  md.push(`# Full image license audit (verified)`);
  md.push(``);
  md.push(`Total: ${results.length} image items with webp`);
  for (const cat of cats) {
    const list = results.filter((r) => r.category === cat);
    const pct = ((list.length / results.length) * 100).toFixed(1);
    md.push(`- **${cat}**: ${list.length} (${pct}%)`);
  }
  md.push(``);
  md.push(`Method: recorded-url ${results.filter((r) => r.method === 'recorded-url').length} · re-probe ${results.filter((r) => r.method === 're-probe').length} · no-source ${results.filter((r) => r.method === 'no-source').length}`);
  md.push(``);
  for (const cat of cats) {
    const list = results.filter((r) => r.category === cat);
    md.push(`## ${cat.toUpperCase()} (${list.length})`);
    md.push(``);
    if (list.length === 0) {
      md.push('_(none)_');
      md.push(``);
      continue;
    }
    md.push(`| id | display | file | license | method |`);
    md.push(`| --- | --- | --- | --- | --- |`);
    for (const r of list.sort((a, b) => a.id.localeCompare(b.id))) {
      md.push(`| \`${r.id}\` | ${r.displayName} | ${r.file} | ${r.license || '_(none)_'} | ${r.method} |`);
    }
    md.push(``);
  }
  writeFileSync(join(DOCS_DIR, 'full-license-audit-verified.md'), md.join('\n'));
  console.log(`\nWrote docs/full-license-audit-verified.md`);

  // ── attribution-manifest (allt utom rena PD/CC0 behöver kredit; vi listar alla för fullständighet) ──
  const att: string[] = [];
  att.push(`# Image attribution / credits`);
  att.push(``);
  att.push(`Auto-genererad av license-audit-verify.ts. Bilder under CC-BY/CC-BY-SA/GFDL kräver upphovsperson-kredit.`);
  att.push(`PD/CC0 kräver ingen kredit men listas för transparens.`);
  att.push(``);
  att.push(`| id | display | author | license | source |`);
  att.push(`| --- | --- | --- | --- | --- |`);
  for (const r of results.sort((a, b) => a.displayName.localeCompare(b.displayName, 'sv'))) {
    const author = r.artist || '_(unknown)_';
    const src = r.descriptionUrl ? `[Commons](${r.descriptionUrl})` : '_(none)_';
    att.push(`| \`${r.id}\` | ${r.displayName} | ${author} | ${r.license || '_(none)_'} | ${src} |`);
  }
  writeFileSync(join(DOCS_DIR, 'image-attribution.md'), att.join('\n'));
  console.log(`Wrote docs/image-attribution.md`);

  // ── flag: non-commercial eller helt utan källa (de enda riktiga risker) ──
  const risks = results.filter((r) => r.category === 'non-commercial' || r.method === 'no-source');
  if (risks.length) {
    console.log(`\n⚠ ${risks.length} items att granska (non-commercial eller helt utan källa):`);
    for (const r of risks.slice(0, 50)) {
      console.log(`   ${r.id.padEnd(28)} ${r.category.padEnd(16)} ${r.method}`);
    }
  } else {
    console.log(`\n✓ Inga non-commercial-licenser och inga helt källösa items.`);
  }
})();

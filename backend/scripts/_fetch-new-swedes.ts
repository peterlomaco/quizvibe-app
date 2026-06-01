import * as fs from 'fs';
import * as path from 'path';
import {
  findWikipediaPageImage,
  searchCommons,
  WikimediaSearchResult,
} from '../wikimedia/client';
import { fetchImage, processImage, saveProcessedImage } from '../wikimedia/processor';

const OUTPUT_DIR = path.join(__dirname, '..', 'output', 'new-swedes');
const ASSETS_DIR = path.join(__dirname, '..', '..', 'assets', 'quiz-images');

interface Row {
  id: string;
  name: string;
  hints: string[];
}

const rows: Row[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, '_new-swedes.json'), 'utf8'),
);

// Optional: restrict to specific ids via CLI args (retry failures)
const onlyIds = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const targets = onlyIds.length ? rows.filter((r) => onlyIds.includes(r.id)) : rows;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function tryPageImage(
  hint: string,
  lang: 'sv' | 'en',
): Promise<WikimediaSearchResult | null> {
  try {
    return await findWikipediaPageImage(hint, { lang, thumbnailWidth: 1280 });
  } catch {
    return null;
  }
}

async function tryCommons(hint: string): Promise<WikimediaSearchResult | null> {
  try {
    const res = await searchCommons(hint, { limit: 10, thumbnailWidth: 1280 });
    // Pick the largest reasonable image that is a photo (skip svg/logo/icon)
    const photos = res.filter(
      (r) =>
        !/\.svg$/i.test(r.title) &&
        !/logo|icon|coat of arms|flag|signature/i.test(r.title) &&
        r.width >= 400 &&
        r.height >= 400,
    );
    photos.sort((a, b) => b.width * b.height - a.width * a.height);
    return photos[0] ?? null;
  } catch {
    return null;
  }
}

interface ManifestEntry {
  id: string;
  name: string;
  status: 'success' | 'failed';
  source?: string;
  url?: string;
  license?: string | null;
  artist?: string | null;
  origWidth?: number;
  origHeight?: number;
  outWidth?: number;
  outHeight?: number;
  descriptionUrl?: string;
  error?: string;
}

async function processOne(row: Row): Promise<ManifestEntry> {
  const hint = row.hints[0];
  // Order: sv pageimage → en pageimage → commons search (sv hint) → commons (name)
  let pick: WikimediaSearchResult | null = await tryPageImage(hint, 'sv');
  let source = 'wikipedia-sv';
  if (!pick) {
    pick = await tryPageImage(hint, 'en');
    source = 'wikipedia-en';
  }
  if (!pick) {
    pick = await tryCommons(hint);
    source = 'commons-search';
  }
  if (!pick) {
    pick = await tryCommons(row.name);
    source = 'commons-search-name';
  }
  if (!pick) {
    return { id: row.id, name: row.name, status: 'failed', error: 'no candidate found' };
  }
  try {
    const buf = await fetchImage(pick.url);
    const processed = await processImage(buf);
    await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });
    const outPath = path.join(OUTPUT_DIR, `${row.id}.webp`);
    await saveProcessedImage(processed.buffer, outPath);
    await fs.promises.mkdir(ASSETS_DIR, { recursive: true });
    await fs.promises.copyFile(outPath, path.join(ASSETS_DIR, `${row.id}.webp`));
    return {
      id: row.id,
      name: row.name,
      status: 'success',
      source,
      url: pick.url,
      license: pick.license,
      artist: pick.artist,
      origWidth: processed.original.width,
      origHeight: processed.original.height,
      outWidth: processed.width,
      outHeight: processed.height,
      descriptionUrl: pick.descriptionUrl,
    };
  } catch (e) {
    return {
      id: row.id,
      name: row.name,
      status: 'failed',
      source,
      url: pick.url,
      error: (e as Error).message,
    };
  }
}

async function main() {
  const manifest: ManifestEntry[] = [];
  for (let i = 0; i < targets.length; i++) {
    const row = targets[i];
    process.stderr.write(`[${i + 1}/${targets.length}] ${row.id} ... `);
    const r = await processOne(row);
    manifest.push(r);
    if (r.status === 'success') {
      process.stderr.write(
        `OK (${r.source}, ${r.origWidth}x${r.origHeight}->${r.outWidth}x${r.outHeight}, ${r.license ?? '?'})\n`,
      );
    } else {
      process.stderr.write(`FAIL: ${r.error}\n`);
    }
    await sleep(900);
  }
  const manifestPath = path.join(__dirname, '_new-swedes-manifest.json');
  // Merge with prior manifest if re-running a subset
  let prior: ManifestEntry[] = [];
  if (fs.existsSync(manifestPath) && onlyIds.length) {
    prior = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    prior = prior.filter((p) => !onlyIds.includes(p.id));
  }
  fs.writeFileSync(manifestPath, JSON.stringify([...prior, ...manifest], null, 2));

  const ok = manifest.filter((m) => m.status === 'success').length;
  const fail = manifest.filter((m) => m.status === 'failed');
  console.log(`\n=== Done: ${ok} ok, ${fail.length} failed ===`);
  if (fail.length) {
    console.log('Failed ids:', fail.map((f) => f.id).join(' '));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// sketch-source — Commons-sourcing-helper ("researchern", laglig version).
//
// Söker Wikimedia Commons (PD/CC, ingen API-nyckel) per profil och returnerar
// kandidat-källor delade i Input A (pose/kontext) + Input B (ansikte/närbild),
// rankade på upplösning + licens-användbarhet, så kuratorn kan picka bästa
// peak-career-frame → mata in i edges-pipelinen via `sketch-generate --ref <url>`.
//
// "Admin-upload" i CLI-kontext = kuratorn kör sketch-generate med valfri --ref
// (en vald Commons-URL HÄR, eller en egen hand-kurerad arkiv-/YouTube-grab-bild).
// Vi scrapar ALDRIG upphovsrättsskyddade bilder automatiskt — bara Commons +
// manuellt curator-val. line-art-derivatet minskar (men eliminerar inte)
// derivativ-verk-risk → föredra PD/CC-källor och behåll attribution.
//
// Face-vs-context-regel (se memory project_sketch_face_vs_context):
//   - Porträtt UTAN specifik händelse → prioritera Input B (ren högupplöst ansikte).
//   - Bild KOPPLAD till ikonisk händelse → Input A (pose/kontext) får bära, mjukt
//     ansikte OK.
//
// CLI:
//   npm run sketch-source -- --name "Carlos Valderrama" --era "1990 World Cup" [--theme football]
//   npm run sketch-source -- --name "..." --face-queries "a;b" --pose-queries "a;b"
//   ... [--limit 8] [--json <out-path>]

import * as fs from 'fs';
import { searchCommons, WikimediaSearchResult } from '../wikimedia/client';

type Role = 'face' | 'pose';

interface RankedCandidate extends WikimediaSearchResult {
  role: Role;
  score: number;
  licenseUsable: boolean;
  megapixels: number;
}

// Licenser som är fria att använda (PD/CC-familjen). Restriktiva/okända → "check".
const USABLE_LICENSE_RE =
  /public domain|^pd|\bpd-|cc0|cc[ -]?by(?:[ -]?sa)?|attribution|no restrictions/i;

function licenseUsable(license: string | null): boolean {
  if (!license) return false;
  return USABLE_LICENSE_RE.test(license);
}

// Bara riktiga foto-filer — uteslut bokscans/dokument/vektorer/video (.djvu, .pdf,
// .svg, .tif, .ogv, .webm, .gif) som annars kan ranka högt på ren upplösning.
const PHOTO_RE = /\.(jpe?g|png|webp)$/i;

function isPhoto(r: WikimediaSearchResult): boolean {
  return PHOTO_RE.test(r.title) || PHOTO_RE.test(r.url);
}

function defaultFaceQueries(name: string, era?: string): string[] {
  return [
    name,
    `${name} portrait`,
    era ? `${name} ${era}` : '',
    `${name} close up`,
  ].filter(Boolean);
}

function defaultPoseQueries(name: string, era?: string, theme?: string): string[] {
  return [
    era ? `${name} ${era}` : name,
    theme ? `${name} ${theme}` : '',
    `${name} action`,
  ].filter(Boolean);
}

function scoreCandidate(r: WikimediaSearchResult, role: Role, name: string): number {
  let s = 0;
  const mp = (r.width * r.height) / 1_000_000;
  // Upplösning väger tungt (peak-skärpa) men kapas så jätte-scans inte dominerar.
  s += Math.min(mp, 16) * 4;
  // Licens: fri = stor bonus, restriktiv/okänd = straff (men visa ändå).
  s += licenseUsable(r.license) ? 25 : -30;
  // Aspekt: ansikts-närbild oftast porträtt; pose/action oftast bredare.
  const portrait = r.height >= r.width;
  s += role === 'face' ? (portrait ? 10 : -4) : portrait ? -2 : 6;
  // Namn-match i titeln → relevans.
  const titleLc = r.title.toLowerCase();
  const hits = name
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2 && titleLc.includes(t)).length;
  s += hits * 5;
  return Math.round(s);
}

async function gather(
  queries: string[],
  role: Role,
  name: string,
  limit: number,
): Promise<RankedCandidate[]> {
  const byTitle = new Map<string, RankedCandidate>();
  for (const q of queries) {
    let results: WikimediaSearchResult[] = [];
    try {
      results = await searchCommons(q, { limit, thumbnailWidth: 320 });
    } catch (e) {
      console.error(`  (sökning misslyckades: "${q}" — ${(e as Error).message})`);
      continue;
    }
    for (const r of results) {
      if (!isPhoto(r)) continue; // hoppa bokscans/dokument/vektorer
      const ranked: RankedCandidate = {
        ...r,
        role,
        licenseUsable: licenseUsable(r.license),
        megapixels: Math.round(((r.width * r.height) / 1_000_000) * 10) / 10,
        score: scoreCandidate(r, role, name),
      };
      const existing = byTitle.get(r.title);
      if (!existing || ranked.score > existing.score) byTitle.set(r.title, ranked);
    }
    // Liten paus så vi inte hamrar API:t.
    await new Promise((res) => setTimeout(res, 250));
  }
  return [...byTitle.values()].sort((a, b) => b.score - a.score);
}

function printTable(label: string, hint: string, rows: RankedCandidate[], top: number): void {
  console.log(`\n=== ${label} ===`);
  console.log(hint);
  if (rows.length === 0) {
    console.log('  (inga träffar)');
    return;
  }
  for (const r of rows.slice(0, top)) {
    const lic = r.licenseUsable ? `OK:${r.license}` : `CHECK:${r.license ?? 'okänd'}`;
    console.log(
      `  [${String(r.score).padStart(3)}] ${r.width}x${r.height} (${r.megapixels}MP)  ${lic}`,
    );
    console.log(`        ${r.url}`);
    console.log(`        "${r.title}"${r.artist ? `  — ${r.artist}` : ''}`);
  }
}

interface Args {
  name?: string;
  era?: string;
  theme?: string;
  faceQueries?: string[];
  poseQueries?: string[];
  limit: number;
  top: number;
  json?: string;
}

function parseArgs(argv: string[]): Args {
  const a: Args = { limit: 8, top: 6 };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--name') a.name = argv[++i];
    else if (k === '--era') a.era = argv[++i];
    else if (k === '--theme') a.theme = argv[++i];
    else if (k === '--face-queries') a.faceQueries = argv[++i].split(';').map((s) => s.trim());
    else if (k === '--pose-queries') a.poseQueries = argv[++i].split(';').map((s) => s.trim());
    else if (k === '--limit') a.limit = parseInt(argv[++i], 10) || 8;
    else if (k === '--top') a.top = parseInt(argv[++i], 10) || 6;
    else if (k === '--json') a.json = argv[++i];
  }
  return a;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (!args.name && !args.faceQueries && !args.poseQueries) {
    console.error('Usage:');
    console.error('  --name "<Person>" [--era "<peak era>"] [--theme <football|music|film>]');
    console.error('  [--face-queries "a;b"] [--pose-queries "a;b"] [--limit 8] [--top 6] [--json <out>]');
    process.exit(1);
  }
  const name = args.name ?? '';
  const faceQ = args.faceQueries ?? defaultFaceQueries(name, args.era);
  const poseQ = args.poseQueries ?? defaultPoseQueries(name, args.era, args.theme);

  console.log(`\nCommons-sourcing för: ${name || '(custom queries)'}${args.era ? ` · ${args.era}` : ''}`);
  console.log(`Face-queries (Input B): ${faceQ.join(' | ')}`);
  console.log(`Pose-queries (Input A): ${poseQ.join(' | ')}`);

  const [faces, poses] = await Promise.all([
    gather(faceQ, 'face', name, args.limit),
    gather(poseQ, 'pose', name, args.limit),
  ]);

  printTable(
    'INPUT B — Ansikte/närbild (för porträtt-items: HÖGSTA prio)',
    'Pick högst-rankade med OK-licens + hög upplösning → ren ansiktskälla.',
    faces,
    args.top,
  );
  printTable(
    'INPUT A — Pose/kontext (för event-items: bär igenkänningen)',
    'Pick peak-pose/silhuett. CHECK-licens = verifiera innan användning.',
    poses,
    args.top,
  );

  console.log(
    '\nNästa steg: välj en URL ovan (eller en egen hand-kurerad bild) och kör:',
  );
  console.log(
    '  npm run sketch-generate -- --ref "<vald-url>" --id <id> --era "<era>" \\',
  );
  console.log('    --category athlete --mode edges --bow --displayName "<Namn>"');

  if (args.json) {
    fs.writeFileSync(
      args.json,
      JSON.stringify({ name, era: args.era, faces, poses }, null, 2),
    );
    console.log(`\nSparade kandidater → ${args.json}`);
  }
}

main().catch((e) => {
  console.error(`ERROR: ${(e as Error).message}`);
  process.exit(1);
});

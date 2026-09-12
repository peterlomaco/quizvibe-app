/**
 * One-off: reconcile the music catalog to Content/Music.xlsx (dumped to
 * music-portfolio.json + music-portfolio-idmap.json).
 *
 * Applies per matched item:
 *   - genrePackages  (AUTHORITATIVE REPLACE, canonicalized)
 *   - inBaseCatalog  (from Excel `inbasecatalogue`)
 *   - region         (item-level override, only when it differs from file header)
 *   - parentControlled (ADDITIVE — set true on Excel-flagged items, never removed)
 *
 * Line-based, CRLF-preserving YAML edit (never a js-yaml round-trip → keeps comments
 * + per-item notes). Dry-run by default; pass --apply to write.
 *
 * The 1 genuinely-new item and the 9 differing YouTube videoIds are handled in
 * separate, deliberately reviewed steps — NOT here.
 */
import { readFileSync, writeFileSync } from 'fs';
import * as path from 'path';
import { loadCatalog } from '../content/registry';

const APPLY = process.argv.includes('--apply');
const SCRIPT_DIR = __dirname;
const CATALOG_DIR = path.join(__dirname, '..', 'content', 'catalog');

interface Row {
  desc: string;
  pkgs: string[];
  inbase: string | null;
  region: string | null;
  parent: string | null;
}

const rows: Row[] = JSON.parse(
  readFileSync(path.join(SCRIPT_DIR, 'music-portfolio.json'), 'utf8'),
);
const idmap: Record<string, string | null> = JSON.parse(
  readFileSync(path.join(SCRIPT_DIR, 'music-portfolio-idmap.json'), 'utf8'),
);

function norm(s: string): string {
  return (s || '')
    .replace(/—/g, '-')
    .replace(/–/g, '-')
    .replace(/’/g, "'")
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Excel package label (lowercased+trimmed) → canonical catalog tag.
const CANON: Record<string, string> = {
  'soft & love': 'Soft & Love',
  '100% swedish': '100% in swedish',
  '100% in swedish': '100% in swedish',
  'film edition': 'Film edition',
  eurovision: 'Eurovision',
  melodifestivalen: 'Melodifestivalen',
  'club & dance': 'Club & Dance',
  eurotechno: 'Club & Dance',
  summer: 'Summer',
  rock: 'Rock',
  'rock & punk': 'Rock',
  'hip hop': 'Hip Hop',
  'sport edition': 'sport',
  'sports edition': 'sport',
  sport: 'sport',
  football: 'football',
  dansband: 'Dansband',
  'christmas edition': 'Christmas edition',
  pop: 'Pop',
  hits: 'Hits',
  'mega hits': 'Mega Hits',
};

function canonPkgs(pkgs: string[]): string[] {
  const out: string[] = [];
  for (const p of pkgs) {
    const key = p.trim().toLowerCase();
    const c = CANON[key] ?? p.trim();
    if (c && !out.includes(c)) out.push(c);
  }
  return out;
}

function mapRegion(r: string | null): string | null {
  if (!r) return null;
  const v = r.trim().toLowerCase();
  if (v === 'nordics') return 'nordic';
  return v;
}

function yamlArray(items: string[]): string {
  return '[' + items.map((s) => JSON.stringify(s)).join(', ') + ']';
}

// ---- build desired state per catalog id ----
interface Desired {
  desc: string;
  genrePackages: string[];
  inBaseCatalog: boolean | null; // null = leave existing
  region: string | null; // null = leave existing
  parentControlled: boolean; // true = ensure set (additive)
}
// The 6 older hip-hop items are DELIBERATELY kept in the base pool until the
// hip-hop package ships (CLAUDE.md). Never flip these to inBaseCatalog=false here.
const PROTECT_INBASE = new Set([
  'sugarhill-gang-rappers-delight',
  'nas-if-i-ruled-the-world',
  'dr-dre-the-next-episode',
  '50-cent-in-da-club',
  'eminem-my-name-is',
  'outkast-ms-jackson',
]);

// Group all Excel rows by catalog id (the sheet has near-duplicate clean/rough rows).
const rowsById = new Map<string, Row[]>();
for (const row of rows) {
  const id = idmap[norm(row.desc)];
  if (id == null) continue; // new item — handled separately
  if (!rowsById.has(id)) rowsById.set(id, []);
  rowsById.get(id)!.push(row);
}

const desiredById = new Map<string, Desired>();
for (const [id, rs] of rowsById) {
  // "primary" row = the clean em-dash row if present (structural truth for
  // inBase/region/parent); rough rows only contribute extra package tags.
  const primary = rs.find((r) => r.desc.includes('—')) ?? rs[0];
  // union of canonicalized packages across ALL rows
  const gp = canonPkgs(rs.flatMap((r) => r.pkgs));
  let inBase: boolean | null =
    primary.inbase == null ? null : primary.inbase.trim().toLowerCase() === 'true';
  // Guard: inBaseCatalog=false + no package = orphan (schema reject). Force base.
  if (inBase === false && gp.length === 0) {
    console.warn(`  ! ${id}: inBaseCatalog=false + no packages → forcing inBaseCatalog=true (orphan guard)`);
    inBase = true;
  }
  const region =
    mapRegion(primary.region) ??
    mapRegion(rs.map((r) => r.region).find((r) => r != null) ?? null);
  const parentControlled = rs.some(
    (r) => (r.parent ?? '').trim().toLowerCase() === 'yes',
  );
  desiredById.set(id, { desc: primary.desc, genrePackages: gp, inBaseCatalog: inBase, region, parentControlled });
}
const dupCount = [...rowsById.values()].filter((v) => v.length > 1).length;
console.log(`(${dupCount} ids had duplicate Excel rows — merged: union packages, primary row wins inBase/region)\n`);

// ---- locate each id: file + current item ----
const cat = loadCatalog();
const idToFile = new Map<string, string>();
const idToItem = new Map<string, any>();
const fileHeaderRegion = new Map<string, string[]>();
for (const [fname, file] of cat.files) {
  if ((file as any).contentSubject !== 'song') continue;
  fileHeaderRegion.set(fname, (file as any).region as string[]);
  for (const it of file.items) {
    idToFile.set(it.id, fname);
    idToItem.set(it.id, it);
  }
}

// ---- edit YAML files ----
const FIELD_ORDER = ['genrePackages', 'inBaseCatalog', 'region', 'parentControlled'];
function fieldRe(name: string) {
  return new RegExp('^    ' + name + ':');
}

let filesChanged = 0;
const gainedByTag: Record<string, number> = {};
const lostByTag: Record<string, number> = {};
const summary = {
  gained: 0,
  lost: 0,
  pkgReplaced: 0,
  inBaseChanged: 0,
  regionChanged: 0,
  parentAdded: 0,
  items: 0,
};

// group ids by file
const byFile = new Map<string, string[]>();
for (const id of desiredById.keys()) {
  const f = idToFile.get(id);
  if (!f) {
    console.warn(`  ! id not found in catalog: ${id}`);
    continue;
  }
  if (!byFile.has(f)) byFile.set(f, []);
  byFile.get(f)!.push(id);
}

for (const [fname, ids] of byFile) {
  const full = path.join(CATALOG_DIR, fname);
  const text = readFileSync(full, 'utf8');
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  let lines = text.split(/\r?\n/);

  // item boundaries
  const starts: { id: string; idx: number }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^  - id:\s*(\S+)/);
    if (m) starts.push({ id: m[1], idx: i });
  }
  const idset = new Set(ids);
  const headerRegion = fileHeaderRegion.get(fname) ?? [];

  // process from bottom to top so indices stay valid
  for (let s = starts.length - 1; s >= 0; s--) {
    const { id, idx } = starts[s];
    if (!idset.has(id)) continue;
    const end = s + 1 < starts.length ? starts[s + 1].idx : lines.length;
    let block = lines.slice(idx, end);
    const d = desiredById.get(id)!;
    const cur = idToItem.get(id);
    summary.items++;

    // anchor: answerMethods line index within block
    let anchor = block.findIndex((l) => /^    answerMethods:/.test(l));
    if (anchor === -1) anchor = block.findIndex((l) => /^    displayName:/.test(l));

    const setField = (name: string, newLine: string | null) => {
      const at = block.findIndex((l) => fieldRe(name).test(l));
      if (newLine == null) {
        if (at !== -1) block.splice(at, 1);
        return;
      }
      if (at !== -1) block[at] = newLine;
      else {
        block.splice(anchor + 1, 0, newLine);
      }
    };

    // genrePackages — authoritative replace
    const curGP: string[] = cur.genrePackages ?? [];
    const wantGP = d.genrePackages;
    const gainedTags = wantGP.filter((t) => !curGP.includes(t));
    const lostTags = curGP.filter((t) => !wantGP.includes(t));
    if (gainedTags.length || lostTags.length) {
      summary.pkgReplaced++;
      summary.gained += gainedTags.length;
      summary.lost += lostTags.length;
      for (const t of gainedTags) gainedByTag[t] = (gainedByTag[t] ?? 0) + 1;
      for (const t of lostTags) lostByTag[t] = (lostByTag[t] ?? 0) + 1;
      console.log(`${id}`);
      if (gainedTags.length) console.log(`   + ${gainedTags.join(', ')}`);
      if (lostTags.length) console.log(`   - ${lostTags.join(', ')}`);
    }
    setField('genrePackages', wantGP.length ? `    genrePackages: ${yamlArray(wantGP)}` : null);

    // inBaseCatalog
    if (d.inBaseCatalog === false && PROTECT_INBASE.has(id)) {
      console.log(`${id}   inBaseCatalog flip -> false SKIPPED (protected hip-hop base item)`);
    } else if (d.inBaseCatalog != null) {
      const curIB = cur.inBaseCatalog !== false ? true : false;
      if (curIB !== d.inBaseCatalog) {
        summary.inBaseChanged++;
        console.log(`${id}   inBaseCatalog ${curIB} -> ${d.inBaseCatalog}`);
      }
      setField('inBaseCatalog', d.inBaseCatalog === false ? '    inBaseCatalog: false' : null);
    }

    // region — only edit when the EFFECTIVE region actually changes.
    if (d.region != null) {
      const curEff: string[] = cur.region ?? headerRegion;
      const wantEff = [d.region];
      if (JSON.stringify(curEff) !== JSON.stringify(wantEff)) {
        summary.regionChanged++;
        console.log(`${id}   region ${JSON.stringify(curEff)} -> ${JSON.stringify(wantEff)}`);
        const headerIsWant =
          headerRegion.length === 1 && headerRegion[0] === d.region;
        // want==header → drop item-level override; else set item-level override
        setField('region', headerIsWant ? null : `    region: ${yamlArray(wantEff)}`);
      }
      // effective already matches → leave YAML untouched (preserve any redundant override)
    }

    // parentControlled — additive
    if (d.parentControlled) {
      const has = block.some((l) => fieldRe('parentControlled').test(l));
      if (!has) {
        summary.parentAdded++;
        console.log(`${id}   + parentControlled: true`);
        setField('parentControlled', '    parentControlled: true');
      }
    }

    lines.splice(idx, end - idx, ...block);
  }

  const newText = lines.join(eol);
  if (newText !== text) {
    filesChanged++;
    if (APPLY) writeFileSync(full, newText);
  }
}

console.log('\n=== SUMMARY ===');
console.log(summary);
console.log('gained by tag:', gainedByTag);
console.log('lost by tag:', lostByTag);
console.log(`files changed: ${filesChanged}  (mode: ${APPLY ? 'APPLIED' : 'DRY-RUN'})`);
if (!APPLY) console.log('re-run with --apply to write.');

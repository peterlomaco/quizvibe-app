#!/usr/bin/env npx tsx
// fetch-hints-data.ts — Genererar HINTS_LIBRARY_GENERATED via Wikidata API.
//
// Kör: cd backend && npx tsx scripts/fetch-hints-data.ts
// Flags:
//   --output <path>   Output-fil (default: ../src/utils/hintsDataGenerated.ts)
//   --ids <id,id,...> Kör bara för dessa catalog-id:n (komma-separerade)
//   --dry             Skriv inte till disk — bara logga vad som skulle genereras
//   --resume          Hoppa över id:n som redan finns i output-filen
//
// Throttle: 3 req/sek mot Wikidata (API-vänlig), ~4 min för 800 items.
// Sparar checkpoint efter varje item så att --resume kan återupptas vid avbrott.

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';
import { z } from 'zod';

// ── Typer (speglar hintsData.ts men utan circular import) ────────────────────

type HintType =
  | 'profession' | 'birth_date' | 'birth_place' | 'peak_year' | 'debut'
  | 'song' | 'album' | 'movie' | 'tv_show' | 'lead_singer' | 'band_member'
  | 'member_count' | 'creation_year' | 'producer' | 'characteristic'
  | 'height' | 'jersey_number' | 'club' | 'merit';

interface HintItem {
  id: string;
  type: HintType;
  label: string;
  value: string;
  priority: 1 | 2 | 3 | 4 | 5;
}

type HintCategoryLabel = 'Musikartist' | 'Band' | 'Actor' | 'Athlete' | 'Coach' | 'Character';

interface HintLibrary {
  categoryLabel: HintCategoryLabel;
  nationality: string;
  hints: HintItem[];
}

// ── Wikidata-konfiguration ────────────────────────────────────────────────────

const WIKIDATA_BASE = 'https://www.wikidata.org/w/api.php';
const THROTTLE_MS = 350; // ~3 req/sek

// Wikidata property IDs
const P = {
  birth_date:        'P569',
  death_date:        'P570',
  birth_place:       'P19',
  nationality:       'P27',
  occupation:        'P106',
  notable_work:      'P800',
  sport_team:        'P54',
  jersey_number:     'P1618',
  height:            'P2048',
  award:             'P166',
  team_start:        'P580',
  team_end:          'P582',
  genre:             'P136',
  member_of:         'P463',
  has_member:        'P527',
  date_started:      'P571',
  country:           'P17',
};

// Wikidata entity ID → nationalism-nyckel (för FLAG_MAP i hintsData.ts)
const WIKIDATA_COUNTRY: Record<string, string> = {
  Q34: 'sweden', Q35: 'denmark', Q33: 'finland', Q20: 'norway', Q189: 'iceland',
  Q30: 'usa', Q145: 'uk', Q142: 'france', Q183: 'germany', Q38: 'italy',
  Q29: 'spain', Q40: 'austria', Q39: 'switzerland', Q17: 'japan', Q55: 'netherlands',
  Q31: 'belgium', Q36: 'poland', Q137: 'monaco', Q43: 'turkey', Q212: 'ukraine',
  Q27: 'ireland', Q45: 'portugal', Q262: 'argentina', Q155: 'brazil', Q241: 'cuba',
  Q16: 'canada', Q408: 'australia', Q79: 'egypt', Q928: 'nigeria', Q1009: 'cameroon',
  Q1032: 'senegal', Q117: 'ghana', Q213: 'czechia', Q184: 'russia', Q214: 'slovakia',
  Q218: 'romania', Q219: 'bulgaria', Q28: 'hungary', Q41: 'greece', Q224: 'croatia',
  Q7352: 'barbados', Q766: 'jamaica', Q786: 'costa-rica', Q774: 'mexico', Q734: 'colombia',
  Q414: 'south-korea',
};

// ContentSubject → HintCategoryLabel
const SUBJECT_TO_CATEGORY: Record<string, HintCategoryLabel> = {
  artist: 'Musikartist',
  band: 'Band',
  actor: 'Actor',
  athlete: 'Athlete',
  character: 'Character',
};

// ── Hjälpfunktioner ───────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function wikidataFetch(params: Record<string, string>): Promise<any> {
  const url = new URL(WIKIDATA_BASE);
  url.search = new URLSearchParams({ ...params, format: 'json', formatversion: '2' }).toString();
  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'QuizVibe-hints-fetcher/1.0 (contact@quizvibe.se)' },
  });
  if (!res.ok) throw new Error(`Wikidata HTTP ${res.status}`);
  return res.json();
}

async function searchEntity(query: string): Promise<string | null> {
  const data = await wikidataFetch({
    action: 'wbsearchentities',
    search: query,
    language: 'en',
    type: 'item',
    limit: '5',
  });
  return data.search?.[0]?.id ?? null;
}

async function getEntityClaims(entityId: string): Promise<any> {
  const data = await wikidataFetch({
    action: 'wbgetentities',
    ids: entityId,
    props: 'claims|labels',
    languages: 'en',
  });
  return data.entities?.[entityId] ?? null;
}

async function getEntityLabel(entityId: string): Promise<string | null> {
  const data = await wikidataFetch({
    action: 'wbgetentities',
    ids: entityId,
    props: 'labels',
    languages: 'en',
  });
  return data.entities?.[entityId]?.labels?.en?.value ?? null;
}

// Extrahera ett enkelt string-värde från ett claim
function getClaimString(claims: any, prop: string): string | null {
  const vals = claims[prop];
  if (!vals?.length) return null;
  const ds = vals[0]?.mainsnak?.datavalue;
  if (!ds) return null;
  if (ds.type === 'string') return ds.value;
  if (ds.type === 'time') return ds.value?.time ?? null;
  if (ds.type === 'wikibase-entityid') return ds.value?.id ?? null;
  if (ds.type === 'quantity') return ds.value?.amount ?? null;
  return null;
}

function parseWikidataDate(timeStr: string): string {
  // "+1958-08-29T00:00:00Z" → "August 29, 1958"
  const m = timeStr.match(/^[+-](\d{4})-(\d{2})-(\d{2})/);
  if (!m) return timeStr;
  const [, year, month, day] = m;
  const months = ['', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const mon = parseInt(month, 10);
  const d = parseInt(day, 10);
  if (mon === 0 || d === 0) return year;
  return `${months[mon]} ${d}, ${year}`;
}

function parseYear(timeStr: string): string {
  const m = timeStr.match(/^[+-](\d{4})/);
  return m ? m[1] : timeStr;
}

function h(
  id: string, type: HintType, label: string, value: string, priority: 1 | 2 | 3 | 4 | 5,
): HintItem {
  return { id, type, label, value, priority };
}

// ── Extrahera hints från Wikidata-entity ─────────────────────────────────────

async function extractHints(
  entity: any,
  subject: string,
  displayName: string,
): Promise<HintItem[]> {
  const claims = entity.claims ?? {};
  const hints: HintItem[] = [];
  let labelsFetched: Map<string, string> = new Map();

  async function label(qid: string): Promise<string> {
    if (labelsFetched.has(qid)) return labelsFetched.get(qid)!;
    await sleep(THROTTLE_MS);
    const lbl = await getEntityLabel(qid);
    if (lbl) labelsFetched.set(qid, lbl);
    return lbl ?? qid;
  }

  // Profession / occupation (P106)
  const occQid = getClaimString(claims, P.occupation);
  if (occQid) {
    const occ = await label(occQid);
    const profValue = occ.charAt(0).toUpperCase() + occ.slice(1);
    hints.push(h('prof', 'profession', 'Profession', profValue, 1));
  } else {
    // Fallback profession from subject
    const fallbackProf: Record<string, string> = {
      artist: 'Music artist', band: 'Music group', actor: 'Actor',
      athlete: 'Athlete', character: 'Character',
    };
    if (fallbackProf[subject]) {
      hints.push(h('prof', 'profession', 'Profession', fallbackProf[subject], 1));
    }
  }

  // Nationalitet / country of citizenship (P27) for flag
  const natQid = getClaimString(claims, P.nationality);
  let nationality = 'unknown';
  if (natQid && WIKIDATA_COUNTRY[natQid]) {
    nationality = WIKIDATA_COUNTRY[natQid];
  }

  // Födelsedag (P569)
  const bdRaw = getClaimString(claims, P.birth_date);
  if (bdRaw) {
    hints.push(h('bd', 'birth_date', 'Date of birth', parseWikidataDate(bdRaw), 2));
  }

  // Födelseort (P19)
  const bpQid = getClaimString(claims, P.birth_place);
  if (bpQid) {
    const bpName = await label(bpQid);
    hints.push(h('bp', 'birth_place', 'Place of birth', bpName, 2));
  }

  // Klubb/team (P54) — för idrottare
  if (claims[P.sport_team]) {
    const teams = claims[P.sport_team].slice(0, 5);
    for (let i = 0; i < teams.length; i++) {
      const teamQid = teams[i]?.mainsnak?.datavalue?.value?.id;
      if (!teamQid) continue;
      const teamName = await label(teamQid);
      const quals = teams[i].qualifiers ?? {};
      const startRaw = quals[P.team_start]?.[0]?.datavalue?.value?.time;
      const endRaw = quals[P.team_end]?.[0]?.datavalue?.value?.time;
      const start = startRaw ? parseYear(startRaw) : '';
      const end = endRaw ? parseYear(endRaw) : '';
      const period = start ? `(${start}${end ? `–${end}` : '–'})` : '';
      const priority: 1|2|3|4|5 = i === 0 ? 4 : 3;
      hints.push(h(`club${i}`, 'club', 'Club', `${teamName} ${period}`.trim(), priority));
    }
  }

  // Tröjnummer (P1618)
  const jersey = getClaimString(claims, P.jersey_number);
  if (jersey) {
    hints.push(h('jn', 'jersey_number', 'Jersey number', `#${jersey}`, 3));
  }

  // Längd (P2048) — i cm
  const heightRaw = getClaimString(claims, P.height);
  if (heightRaw) {
    const cm = Math.round(parseFloat(heightRaw));
    if (cm > 100 && cm < 250) {
      hints.push(h('ht', 'height', 'Height', `${cm} cm`, 3));
    }
  }

  // Priser (P166) — max 3
  if (claims[P.award]) {
    const awards = claims[P.award].slice(0, 3);
    for (let i = 0; i < awards.length; i++) {
      const awardQid = awards[i]?.mainsnak?.datavalue?.value?.id;
      if (!awardQid) continue;
      const awardName = await label(awardQid);
      const dateRaw = awards[i].qualifiers?.[P.date_started]?.[0]?.datavalue?.value?.time;
      const year = dateRaw ? ` (${parseYear(dateRaw)})` : '';
      hints.push(h(`merit${i}`, 'merit', 'Merit/Award', `${awardName}${year}`, i === 0 ? 5 : 4));
    }
  }

  // Anmärkningsvärda verk (P800) — max 4 för artister/skådespelare
  if (claims[P.notable_work] && (subject === 'artist' || subject === 'actor')) {
    const works = claims[P.notable_work].slice(0, 4);
    for (let i = 0; i < works.length; i++) {
      const workQid = works[i]?.mainsnak?.datavalue?.value?.id;
      if (!workQid) continue;
      const workName = await label(workQid);
      const dateRaw = works[i].qualifiers?.[P.date_started]?.[0]?.datavalue?.value?.time;
      const year = dateRaw ? ` (${parseYear(dateRaw)})` : '';
      const type: HintType = subject === 'actor' ? 'movie' : 'song';
      const lbl = subject === 'actor' ? 'Notable film' : 'Notable work';
      const priority: 1|2|3|4|5 = i < 2 ? 4 : 3;
      hints.push(h(`work${i}`, type, lbl, `"${workName}"${year}`, priority));
    }
  }

  return { hints, nationality } as any;
}

// ── Katalog-läsning ───────────────────────────────────────────────────────────

interface CatalogItem {
  id: string;
  displayName: string;
  contentSubject: string;
  wikimediaSearchHints: string[];
  region: string[]; // effektiv region (fil-default eller item-override)
}

// Avgör om ett items region ska inkluderas — speglar hierarkin
// global ⊃ europe ⊃ nordic ⊃ sweden (se backend/content/schema.ts).
// Uppdaterad 2026-08-11: tidigare exkluderade den här funktionen 'global'
// eftersom taggen då betydde "visas EJ för svensk spelare". Med den nya
// innebörden ("igenkänt överallt → ingår i varje region scope") når 'global'
// tvärtom ALLA spelare. Endast 'unknown-region' når ingen.
const SWEDEN_REACH = ['global', 'europe', 'nordic', 'sweden'];
function isRegionIncluded(region: string[]): boolean {
  return region.some((r) => SWEDEN_REACH.includes(r));
}

// (loadManualRegionMap borttagen 2026-08-11 — parsade HINTS_REGION_MAP ur
//  src/utils/hintsData.ts som en andra region-sanning. Region läses nu ur
//  katalogens `region:`-fält, samma källa som allt annat.)

const ContentItemSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  wikimediaSearchHints: z.array(z.string()).optional().default([]),
  answerMethods: z.array(z.string()).optional().default([]),
  region: z.array(z.string()).optional(), // item-nivå override
});

const CatalogFileSchema = z.object({
  contentForm: z.string(),
  contentSubject: z.string(),
  region: z.array(z.string()).optional().default(['sweden']), // fil-nivå default
  items: z.array(ContentItemSchema),
});

function loadCatalogItems(catalogDir: string): CatalogItem[] {
  const items: CatalogItem[] = [];
  const files = fs.readdirSync(catalogDir).filter((f) => f.endsWith('.yaml'));

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(catalogDir, file), 'utf-8');
      const parsed = yaml.load(raw) as any;
      const catalog = CatalogFileSchema.safeParse(parsed);
      if (!catalog.success) continue;

      // Bara image-frågor (contentForm: image) — inte YouTube/timeline
      if (catalog.data.contentForm !== 'image') continue;

      const fileRegion = catalog.data.region;

      for (const item of catalog.data.items) {
        // Effektiv region: item-override om satt, annars fil-default
        const effectiveRegion = item.region ?? fileRegion;

        // Hoppa över items som inte visas för svenska V1-spelare
        if (!isRegionIncluded(effectiveRegion)) continue;

        items.push({
          id: item.id,
          displayName: item.displayName,
          contentSubject: catalog.data.contentSubject,
          wikimediaSearchHints: item.wikimediaSearchHints,
          region: effectiveRegion,
        });
      }
    } catch {
      // Skip broken files
    }
  }

  // Deduplicera (samma id kan förekomma i flera filer)
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

// ── Befintliga manuella hints-id:n ───────────────────────────────────────────

function loadExistingIds(outputFile: string): Set<string> {
  const ids = new Set<string>();
  if (!fs.existsSync(outputFile)) return ids;
  const content = fs.readFileSync(outputFile, 'utf-8');
  // Matcha "  'some-id': {" mönster
  for (const m of content.matchAll(/^\s+'([\w-]+)':\s+\{/gm)) {
    ids.add(m[1]);
  }
  return ids;
}

// ── Generera HintLibrary för ett item ────────────────────────────────────────

async function generateLibrary(item: CatalogItem): Promise<HintLibrary | null> {
  const subject = item.contentSubject;

  // Sökfras: displayName + search-hint om tillgänglig
  const searchQuery = item.wikimediaSearchHints[0]
    ? `${item.displayName} ${item.wikimediaSearchHints[0]}`
    : item.displayName;

  let entityId: string | null = null;
  try {
    entityId = await searchEntity(searchQuery);
  } catch (e) {
    console.warn(`  [WARN] Search failed for "${searchQuery}":`, (e as Error).message);
    return null;
  }

  if (!entityId) {
    // Försök igen utan hints
    try {
      await sleep(THROTTLE_MS);
      entityId = await searchEntity(item.displayName);
    } catch {
      return null;
    }
  }

  if (!entityId) {
    console.warn(`  [SKIP] No entity found for "${item.displayName}"`);
    return null;
  }

  await sleep(THROTTLE_MS);

  let entity: any;
  try {
    entity = await getEntityClaims(entityId);
  } catch (e) {
    console.warn(`  [WARN] Claims fetch failed for ${entityId}:`, (e as Error).message);
    return null;
  }

  if (!entity) return null;

  let extracted: any;
  try {
    extracted = await extractHints(entity, subject, item.displayName);
  } catch (e) {
    console.warn(`  [WARN] Hint extraction failed for "${item.displayName}":`, (e as Error).message);
    return null;
  }

  const { hints, nationality } = extracted;

  if (hints.length === 0) {
    console.warn(`  [SKIP] No hints extracted for "${item.displayName}"`);
    return null;
  }

  const categoryLabel = SUBJECT_TO_CATEGORY[subject] ?? 'Athlete';

  return {
    categoryLabel,
    nationality: nationality ?? 'unknown',
    hints,
  };
}

// ── Serialisera HintLibrary → TypeScript-källkod ─────────────────────────────

function serializeLibrary(id: string, lib: HintLibrary): string {
  const hintsCode = lib.hints
    .map((h) => {
      const val = h.value.replace(/'/g, "\\'");
      const lbl = h.label.replace(/'/g, "\\'");
      return `    { id: '${h.id}', type: '${h.type}', label: '${lbl}', value: '${val}', priority: ${h.priority} },`;
    })
    .join('\n');

  return `  '${id}': {
    categoryLabel: '${lib.categoryLabel}',
    nationality: '${lib.nationality}',
    hints: [
${hintsCode}
    ],
  },`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const isDry = args.includes('--dry');
  const isResume = args.includes('--resume');
  const outputIdx = args.indexOf('--output');
  const idsIdx = args.indexOf('--ids');

  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(scriptDir, '..', '..');
  const catalogDir = path.join(scriptDir, '..', 'content', 'catalog');
  const defaultOutput = path.join(repoRoot, 'src', 'utils', 'hintsDataGenerated.ts');
  const outputFile = outputIdx !== -1 ? path.resolve(args[outputIdx + 1]) : defaultOutput;

  // Manuella hints (dessa ska inte åsidosättas)
  const manualIdsFile = path.join(scriptDir, '..', '..', 'src', 'utils', 'hintsData.ts');
  const manualIds = loadExistingIds(manualIdsFile);

  // Befintliga genererade hints (för --resume)
  const existingGeneratedIds = isResume ? loadExistingIds(outputFile) : new Set<string>();

  // Ladda katalog
  const allItems = loadCatalogItems(catalogDir);
  console.log(`Loaded ${allItems.length} unique image-question items from catalog.`);

  // Filtrera efter --ids om angivet
  let targetItems = allItems;
  if (idsIdx !== -1) {
    const reqIds = new Set(args[idsIdx + 1].split(',').map((s) => s.trim()));
    targetItems = allItems.filter((item) => reqIds.has(item.id));
    console.log(`Filtered to ${targetItems.length} items.`);
  }

  // Uteslut manuellt kuraterade + redan genererade + 'global'-only scope
  const itemsToProcess = targetItems.filter((item) => {
    if (manualIds.has(item.id)) return false;            // redan manuellt kuraterat
    if (existingGeneratedIds.has(item.id)) return false; // redan auto-genererat
    // Region läses numera ur KATALOGEN (migration 2026-08-11) — inte längre
    // ur HINTS_REGION_MAP, som var en andra, divergerande sanning.
    // 'unknown-region' når ingen spelare → ingen idé att generera hints.
    if (!isRegionIncluded(item.region)) return false;
    return true;
  });
  console.log(`${itemsToProcess.length} items to process (${manualIds.size} manual, ${existingGeneratedIds.size} already generated).`);

  if (isDry) {
    console.log('DRY RUN — would process:');
    itemsToProcess.slice(0, 20).forEach((item) => console.log(`  ${item.id} (${item.contentSubject})`));
    if (itemsToProcess.length > 20) console.log(`  ... and ${itemsToProcess.length - 20} more`);
    return;
  }

  // Samlad output
  const generated: Record<string, HintLibrary> = {};

  // Ladda befintliga om --resume
  if (isResume && fs.existsSync(outputFile)) {
    console.log('Resume mode — keeping existing generated items.');
    // De befintliga läses in via loadExistingIds, faktiska data laddas inte om
    // (de skrivs ut på nytt från checkpoint-filen)
  }

  let processed = 0;
  const startTime = Date.now();

  for (const item of itemsToProcess) {
    processed++;
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const eta = processed > 1
      ? Math.round(((Date.now() - startTime) / (processed - 1)) * (itemsToProcess.length - processed) / 1000)
      : '?';
    process.stdout.write(`[${processed}/${itemsToProcess.length}] ${item.id} (${item.contentSubject}) — ${elapsed}s elapsed, ~${eta}s left\r`);

    const library = await generateLibrary(item);
    if (library) {
      generated[item.id] = library;
      console.log(`\n  ✓ ${item.id}: ${library.hints.length} hints (${library.nationality}) [${item.region.join(',')}]`);
    }

    await sleep(THROTTLE_MS);
  }

  console.log(`\n\nDone. Generated hints for ${Object.keys(generated).length} of ${itemsToProcess.length} items.`);

  // Bygg output-filen
  const entries = Object.entries(generated)
    .map(([id, lib]) => serializeLibrary(id, lib))
    .join('\n\n');

  const header = `// Auto-genererad av backend/scripts/fetch-hints-data.ts
// Kör via: cd backend && npx tsx scripts/fetch-hints-data.ts
// OBS: Redigera INTE den här filen manuellt — den skrivs om vid varje script-körning.

import type { HintLibrary } from './hintsData';

export const HINTS_LIBRARY_GENERATED: Record<string, HintLibrary> = {
`;

  const footer = `};
`;

  const output = header + entries + (entries ? '\n\n' : '') + footer;
  fs.writeFileSync(outputFile, output, 'utf-8');
  console.log(`Written to: ${outputFile}`);
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});

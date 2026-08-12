// fetch-person-gender.ts — hämtar kön (Wikidata P21) för alla person-items i
// bild-katalogen och skriver src/utils/personGenderGenerated.ts.
//
// VARFÖR: svarsalternativen i Hints-frågor ska vara köns-homogena (kvinna →
// bara kvinnor, man → bara män). Den tidigare källan `inferGender()` räknar
// he/his/him vs she/her/hers i hint-TEXTERNA — men hint-värden är fakta-
// fragment ('"Billie Jean" (1983)', 'Born: ...') utan pronomen, så den gav
// kön för 16 av 836 items (~2 %). Köns-filtret var i praktiken en no-op.
// P21 är en explicit strukturerad uppgift och täcker i stort sett alla.
//
// Kör:
//   cd backend && npm run fetch-person-gender          # full körning
//   cd backend && npm run fetch-person-gender -- --resume   # bara saknade id:n
//   cd backend && npm run fetch-person-gender -- --dry      # skriv inget
//   cd backend && npm run fetch-person-gender -- --limit 20 # smoke-test
//
// ~2 anrop per item à 350 ms → räkna med ~10 min för hela katalogen.
// Oupplösta items rapporteras i backend/output/person-gender-report.md och
// kan fyllas i manuellt i PERSON_GENDER_MANUAL (src/utils/personGender.ts).

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { z } from 'zod';

const WIKIDATA_BASE = 'https://www.wikidata.org/w/api.php';
const THROTTLE_MS = 350; // ~3 req/sek

const P_SEX = 'P21';
const P_INSTANCE_OF = 'P31';
const P_BIRTH_DATE = 'P569';
const P_OCCUPATION = 'P106';

const Q_HUMAN = 'Q5';
const Q_MALE = 'Q6581097';
const Q_FEMALE = 'Q6581072';

type Gender = 'male' | 'female';

// Bara items där kön är en meningsfull egenskap. 'band' är MEDVETET uteslutet
// — en grupp har inget kön, och köns-låsningen ska aldrig gälla band-frågor.
const PERSON_SUBJECTS = ['artist', 'actor', 'athlete', 'cultural-person', 'celebrity'];

// Beskrivnings-ord som styrker att vi hittat rätt sorts entitet. Wikidata:s
// `wbsearchentities` returnerar en description per träff — den är gratis och
// räcker för att sålla bort t.ex. en låt med samma namn som artisten.
// (Samma disambiguerings-princip som _fetch-wikidata.ts, se CLAUDE.md.)
const SUBJECT_KEYWORDS: Record<string, string[]> = {
  artist: ['singer', 'musician', 'rapper', 'songwriter', 'artist', 'composer',
           'dj', 'producer', 'vocalist', 'performer', 'entertainer'],
  actor: ['actor', 'actress', 'film', 'television', 'comedian', 'director', 'performer'],
  athlete: ['footballer', 'football', 'player', 'athlete', 'skier', 'skater',
            'swimmer', 'boxer', 'golfer', 'tennis', 'hockey', 'driver',
            'sprinter', 'runner', 'cyclist', 'coach', 'biathlete', 'gymnast'],
  'cultural-person': ['writer', 'author', 'artist', 'designer', 'chef', 'presenter'],
  celebrity: ['personality', 'presenter', 'model', 'influencer', 'celebrity'],
};

const SWEDEN_REACH = ['global', 'europe', 'nordic', 'sweden'];

const ContentItemSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  wikimediaSearchHints: z.array(z.string()).optional().default([]),
  region: z.array(z.string()).optional(),
});

const CatalogFileSchema = z.object({
  contentForm: z.string(),
  contentSubject: z.string(),
  region: z.array(z.string()).optional().default(['sweden']),
  items: z.array(ContentItemSchema),
});

interface CatalogItem {
  id: string;
  displayName: string;
  contentSubject: string;
  searchHint?: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function wikidataFetch(params: Record<string, string>): Promise<any> {
  const url = new URL(WIKIDATA_BASE);
  url.search = new URLSearchParams({ ...params, format: 'json', formatversion: '2' }).toString();
  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'QuizVibe-gender-fetcher/1.0 (contact@quizvibe.se)' },
  });
  if (!res.ok) throw new Error(`Wikidata HTTP ${res.status}`);
  return res.json();
}

interface SearchHit {
  id: string;
  label: string;
  description: string;
}

async function searchEntities(query: string): Promise<SearchHit[]> {
  const data = await wikidataFetch({
    action: 'wbsearchentities',
    search: query,
    language: 'en',
    type: 'item',
    limit: '5',
  });
  return (data.search ?? []).map((s: any) => ({
    id: s.id,
    label: s.label ?? '',
    description: s.description ?? '',
  }));
}

async function getClaims(entityId: string): Promise<any> {
  const data = await wikidataFetch({
    action: 'wbgetentities',
    ids: entityId,
    props: 'claims',
    languages: 'en',
  });
  return data.entities?.[entityId]?.claims ?? null;
}

function claimEntityIds(claims: any, prop: string): string[] {
  const vals = claims?.[prop];
  if (!Array.isArray(vals)) return [];
  return vals
    .map((v: any) => v?.mainsnak?.datavalue?.value?.id)
    .filter((id: unknown): id is string => typeof id === 'string');
}

function claimYear(claims: any, prop: string): number | null {
  const time = claims?.[prop]?.[0]?.mainsnak?.datavalue?.value?.time;
  if (typeof time !== 'string') return null;
  const m = time.match(/^[+-](\d{4})/);
  return m ? parseInt(m[1], 10) : null;
}

// Beskrivningar som tydligt pekar på ett verk i stället för en person — en
// låt/film/grupp heter ofta samma sak som artisten. Straffas BARA när
// beskrivningen saknar yrkes-signal, annars sållas t.ex. "American actor and
// film producer" bort på ordet "film".
const NON_PERSON_RE = /\b(song|album|single|film|movie|band|musical group|village|genus|episode)\b/;

/**
 * Rangordnar sökträffar. Kräver minst EN positiv signal (exakt namnmatch eller
 * yrkes-ord i beskrivningen) — annars returneras null och itemet hamnar i
 * rapporten hellre än att vi gissar på fel person.
 */
function pickBestHit(hits: SearchHit[], subject: string, displayName: string): SearchHit | null {
  const keywords = SUBJECT_KEYWORDS[subject] ?? [];
  const wanted = displayName.trim().toLowerCase();
  let best: SearchHit | null = null;
  let bestScore = 0; // > 0 krävs för att accepteras

  hits.forEach((hit, i) => {
    const desc = hit.description.toLowerCase();
    const hasKeyword = keywords.some((k) => desc.includes(k));
    let score = 0;
    if (hit.label.trim().toLowerCase() === wanted) score += 15;
    if (hasKeyword) score += 10;
    if (!hasKeyword && NON_PERSON_RE.test(desc)) score -= 100;
    score -= i; // träffordning som tie-break
    if (score > bestScore) { bestScore = score; best = hit; }
  });

  return best;
}

function loadCatalogItems(catalogDir: string): CatalogItem[] {
  const items: CatalogItem[] = [];
  for (const file of fs.readdirSync(catalogDir).filter((f) => f.endsWith('.yaml'))) {
    try {
      const parsed = yaml.load(fs.readFileSync(path.join(catalogDir, file), 'utf-8'));
      const catalog = CatalogFileSchema.safeParse(parsed);
      if (!catalog.success) continue;
      if (catalog.data.contentForm !== 'image') continue;
      if (!PERSON_SUBJECTS.includes(catalog.data.contentSubject)) continue;

      for (const item of catalog.data.items) {
        const region = item.region ?? catalog.data.region;
        if (!region.some((r) => SWEDEN_REACH.includes(r))) continue; // når ingen spelare
        items.push({
          id: item.id,
          displayName: item.displayName,
          contentSubject: catalog.data.contentSubject,
          searchHint: item.wikimediaSearchHints[0],
        });
      }
    } catch {
      // trasig fil — hoppa
    }
  }
  const seen = new Set<string>();
  return items.filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true)));
}

/** Läser redan genererade id→kön ur output-filen (för --resume). */
function loadExisting(outFile: string): Record<string, Gender> {
  if (!fs.existsSync(outFile)) return {};
  const out: Record<string, Gender> = {};
  const content = fs.readFileSync(outFile, 'utf-8');
  for (const m of content.matchAll(/^\s+'([\w-]+)':\s+'(male|female)',/gm)) {
    out[m[1]] = m[2] as Gender;
  }
  return out;
}

/** Födelseår ur befintliga hints — används som sanity-check mot Wikidata. */
function loadKnownBirthYears(): Record<string, number> {
  const out: Record<string, number> = {};
  const files = [
    path.resolve(__dirname, '../../src/utils/hintsData.ts'),
    path.resolve(__dirname, '../../src/utils/hintsDataGenerated.ts'),
  ];
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf-8');
    // Blockstart "'some-id': {" följt av ev. birth_date-hint med årtal.
    let currentId: string | null = null;
    for (const line of content.split('\n')) {
      const idMatch = line.match(/^\s+'([\w-]+)':\s+\{/);
      if (idMatch) { currentId = idMatch[1]; continue; }
      if (!currentId) continue;
      if (line.includes("'birth_date'")) {
        const y = line.match(/(\d{4})/);
        if (y && out[currentId] === undefined) out[currentId] = parseInt(y[1], 10);
        currentId = null;
      }
    }
  }
  return out;
}

interface Resolution {
  gender: Gender | null;
  reason: string;
}

async function resolveGender(item: CatalogItem, knownBirthYear?: number): Promise<Resolution> {
  // Sök på displayName FÖRST. Katalogens wikimediaSearchHints inleds nästan
  // alltid med namnet ("Tom Hanks actor"), så "namn + hint" blir en dublett-
  // fras som Wikidata inte matchar alls — den används därför bara som fallback.
  let hits: SearchHit[] = [];
  try {
    hits = await searchEntities(item.displayName);
    if (hits.length === 0 && item.searchHint) {
      await sleep(THROTTLE_MS);
      hits = await searchEntities(item.searchHint);
    }
  } catch (e) {
    return { gender: null, reason: `search failed: ${(e as Error).message}` };
  }

  const hit = pickBestHit(hits, item.contentSubject, item.displayName);
  if (!hit) return { gender: null, reason: 'no matching Wikidata entity' };

  await sleep(THROTTLE_MS);

  let claims: any;
  try {
    claims = await getClaims(hit.id);
  } catch (e) {
    return { gender: null, reason: `claims failed: ${(e as Error).message}` };
  }
  if (!claims) return { gender: null, reason: `no claims on ${hit.id}` };

  if (!claimEntityIds(claims, P_INSTANCE_OF).includes(Q_HUMAN)) {
    return { gender: null, reason: `${hit.id} is not a human ("${hit.description}")` };
  }

  // Sanity-check mot födelseåret vi redan har i hints — fångar fel person.
  const wdYear = claimYear(claims, P_BIRTH_DATE);
  if (knownBirthYear && wdYear && Math.abs(wdYear - knownBirthYear) > 1) {
    return { gender: null, reason: `birth year mismatch (hints ${knownBirthYear} vs Wikidata ${wdYear} on ${hit.id})` };
  }

  const sex = claimEntityIds(claims, P_SEX)[0];
  if (sex === Q_MALE) return { gender: 'male', reason: hit.id };
  if (sex === Q_FEMALE) return { gender: 'female', reason: hit.id };
  if (!sex) return { gender: null, reason: `no P21 on ${hit.id}` };
  return { gender: null, reason: `non-binary/other P21 (${sex}) on ${hit.id}` };
}

function serialize(map: Record<string, Gender>): string {
  const ids = Object.keys(map).sort();
  const lines = ids.map((id) => `  '${id}': '${map[id]}',`).join('\n');
  return `// Auto-genererad av backend/scripts/fetch-person-gender.ts — REDIGERA INTE.
// Källa: Wikidata P21 (sex or gender) per katalog-item.
//
// Driver köns-homogena svarsalternativ i Hints-frågor: är rätt svar en kvinna
// ska alla alternativ vara kvinnor, är det en man ska alla vara män.
// Manuella rättelser görs i PERSON_GENDER_MANUAL (src/utils/personGender.ts),
// som åsidosätter den här filen — så en ny körning skriver aldrig över dem.
//
// Items som saknas här kunde inte lösas upp mot Wikidata; se
// backend/output/person-gender-report.md.

export type PersonGender = 'male' | 'female';

export const PERSON_GENDER_GENERATED: Record<string, PersonGender> = {
${lines}
};
`;
}

async function main() {
  const args = process.argv.slice(2);
  const isDry = args.includes('--dry');
  const isResume = args.includes('--resume');
  const limitArg = args.indexOf('--limit');
  const limit = limitArg !== -1 ? parseInt(args[limitArg + 1], 10) : Infinity;

  const catalogDir = path.resolve(__dirname, '../content/catalog');
  const outFile = path.resolve(__dirname, '../../src/utils/personGenderGenerated.ts');
  const reportFile = path.resolve(__dirname, '../output/person-gender-report.md');

  const all = loadCatalogItems(catalogDir);
  const existing = isResume ? loadExisting(outFile) : {};
  const birthYears = loadKnownBirthYears();

  const todo = all.filter((i) => existing[i.id] === undefined).slice(0, limit);

  console.log(`Person-items i katalogen: ${all.length}`);
  if (isResume) console.log(`Redan lösta (resume): ${Object.keys(existing).length}`);
  console.log(`Att hämta nu: ${todo.length}`);
  if (isDry) console.log('(--dry: inget skrivs)');

  const resolved: Record<string, Gender> = { ...existing };
  const failed: Array<{ item: CatalogItem; reason: string }> = [];

  for (let i = 0; i < todo.length; i++) {
    const item = todo[i];
    const res = await resolveGender(item, birthYears[item.id]);
    if (res.gender) {
      resolved[item.id] = res.gender;
      console.log(`[${i + 1}/${todo.length}] ${item.id} → ${res.gender}`);
    } else {
      failed.push({ item, reason: res.reason });
      console.warn(`[${i + 1}/${todo.length}] ${item.id} → SKIP (${res.reason})`);
    }
    await sleep(THROTTLE_MS);

    // Skriv löpande så en avbruten körning inte tappar allt (--resume tar vid).
    if (!isDry && (i + 1) % 25 === 0) {
      fs.writeFileSync(outFile, serialize(resolved), 'utf-8');
    }
  }

  console.log(`\nKlart: ${Object.keys(resolved).length} lösta, ${failed.length} olösta.`);

  if (isDry) return;

  fs.writeFileSync(outFile, serialize(resolved), 'utf-8');
  console.log(`Skrev ${outFile}`);

  fs.mkdirSync(path.dirname(reportFile), { recursive: true });
  const report = [
    '# Person-gender — olösta items',
    '',
    `Genererad av \`fetch-person-gender.ts\`. ${Object.keys(resolved).length} lösta, ${failed.length} olösta.`,
    '',
    'Items nedan saknar kön och faller därför tillbaka på subject-filtret',
    'utan köns-låsning. Fyll i dem i `PERSON_GENDER_MANUAL`',
    '(`src/utils/personGender.ts`) om de behöver rättas.',
    '',
    '| id | displayName | subject | orsak |',
    '|---|---|---|---|',
    ...failed.map((f) => `| \`${f.item.id}\` | ${f.item.displayName} | ${f.item.contentSubject} | ${f.reason} |`),
    '',
  ].join('\n');
  fs.writeFileSync(reportFile, report, 'utf-8');
  console.log(`Skrev ${reportFile}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

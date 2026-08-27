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
  instance_of:       'P31',
  nominated_for:     'P1411',
  instrument:        'P1303',
  record_label:      'P264',
  dissolved:         'P576',
  formation_location:'P740',
};

// Samma nationalitets-/landsordslista som NATIONALITY_TERMS i src/utils/hintsText.ts
// (duplicerad hit medvetet — backend-scriptet ska inte bero på frontend-koden,
// se motiveringen i "Sharp-gotcha"-stilen ovan i denna fil för andra
// medvetna dupliceringar). Används för att strippa ett ledande nationalitets-
// adjektiv ur en Wikidata-description innan den återanvänds som ledtråd,
// annars filtreras HELA raden bort av isNationalityHint vid render.
const LEADING_NATIONALITY_RE = new RegExp(
  '^(swedish|american|british|english|french|german|italian|spanish|norwegian|' +
  'danish|finnish|canadian|australian|dutch|belgian|swiss|portuguese|polish|' +
  'hungarian|romanian|czech|greek|turkish|japanese|chinese|korean|south korean|' +
  'brazilian|argentinian|argentinean|mexican|south african|nigerian|jamaican|' +
  'cuban|irish|scottish|welsh|russian|ukrainian|austrian|colombian|peruvian|' +
  'chilean|venezuelan|ecuadorian|uruguayan)\\s+',
  'i',
);

const Q_HUMAN = 'Q5';

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

// ── Disambiguering (Peter 2026-08-27) ────────────────────────────────────────
//
// TIDIGARE: `data.search?.[0]?.id` — blint förtroende för Wikidatas FÖRSTA
// träff, utan att kolla om det ens var en människa. Det är källan till
// felmatchningar som Janne Carlsson → "Swedish translator" (fel person,
// född 1950 i stället för den verklige jazztrummisen/skådespelaren född
// 1937) — se `fetch-hints-data.ts`-verifieringen 2026-08-27.
//
// Samma poängsättningsprincip som `fetch-person-gender.ts` (SUBJECT_KEYWORDS
// + pickBestHit): kräv minst EN positiv signal (exakt namnmatch eller ett
// yrkes-ord i beskrivningen), straffa uppenbara icke-person-träffar. Hittas
// ingen träff med positiv poäng returneras null hellre än att gissa.
const SUBJECT_KEYWORDS: Record<string, string[]> = {
  artist: ['singer', 'musician', 'rapper', 'songwriter', 'artist', 'composer',
           'dj', 'producer', 'vocalist', 'performer', 'entertainer'],
  band: ['band', 'music group', 'musical group'],
  actor: ['actor', 'actress', 'film', 'television', 'comedian', 'director', 'performer'],
  athlete: ['footballer', 'football', 'player', 'athlete', 'skier', 'skater',
            'swimmer', 'boxer', 'golfer', 'tennis', 'hockey', 'driver',
            'sprinter', 'runner', 'cyclist', 'coach', 'biathlete', 'gymnast'],
  character: ['fictional character', 'character', 'video game', 'animated'],
};

const NON_PERSON_RE = /\b(song|album|single|film|movie|band|musical group|village|genus|episode|television series)\b/;

interface SearchHit { id: string; label: string; description: string; }

async function searchEntities(query: string): Promise<SearchHit[]> {
  // limit=20 (höjt från 5, 2026-08-27): korta/tvetydiga scennamn (Snow, Lena,
  // ZAYN, Nemo, Netta) hade rätt entitet långt ner i Wikidatas träfflista —
  // 5 räckte inte för scoring-funktionen att ens SE kandidaten. pickBestHit
  // straffar redan icke-person-träffar (-100) så ett bredare fönster ökar
  // inte risken för felmatchning, det ger bara scoringen fler kandidater.
  const data = await wikidataFetch({
    action: 'wbsearchentities',
    search: query,
    language: 'en',
    type: 'item',
    limit: '20',
  });
  return (data.search ?? []).map((s: any) => ({ id: s.id, label: s.label ?? '', description: s.description ?? '' }));
}

/** Se disambigueringskommentaren ovan. Kräver score > 0 för att accepteras. */
function pickBestHit(hits: SearchHit[], subject: string, displayName: string): SearchHit | null {
  const keywords = SUBJECT_KEYWORDS[subject] ?? [];
  const wanted = displayName.trim().toLowerCase();
  let best: SearchHit | null = null;
  let bestScore = 0;

  hits.forEach((hit, i) => {
    const desc = hit.description.toLowerCase();
    const hasKeyword = keywords.some((k) => desc.includes(k));
    let score = 0;
    if (hit.label.trim().toLowerCase() === wanted) score += 15;
    if (hasKeyword) score += 10;
    if (!hasKeyword && subject !== 'character' && NON_PERSON_RE.test(desc)) score -= 100;
    score -= i; // träffordning som tie-break
    if (score > bestScore) { bestScore = score; best = hit; }
  });

  return best;
}

async function searchEntity(query: string, subject: string, displayName: string): Promise<string | null> {
  const hits = await searchEntities(query);
  return pickBestHit(hits, subject, displayName)?.id ?? null;
}

async function getEntityClaims(entityId: string): Promise<any> {
  const data = await wikidataFetch({
    action: 'wbgetentities',
    ids: entityId,
    props: 'claims|labels|sitelinks|descriptions',
    languages: 'en',
  });
  return data.entities?.[entityId] ?? null;
}

// ── Andra källan: Wikipedia (se "Andra-källa-validering" i generateLibrary) ──

const WIKIPEDIA_SUMMARY_BASE = 'https://en.wikipedia.org/api/rest_v1/page/summary/';

/**
 * Bästa-försök-extraktion av födelseår ur en Wikipedia-artikels sammanfattning
 * ("... (born August 29, 1958) is an American ..."). Returnerar null om
 * artikeln saknas, inte kunde hämtas, eller inget år hittas — det betyder
 * INTE att Wikidata-uppgiften är fel, bara att den inte kunde BEKRÄFTAS.
 */
async function fetchWikipediaBirthYear(enwikiTitle: string): Promise<number | null> {
  try {
    const res = await fetch(`${WIKIPEDIA_SUMMARY_BASE}${encodeURIComponent(enwikiTitle.replace(/ /g, '_'))}`, {
      headers: { 'User-Agent': 'QuizVibe-hints-fetcher/1.0 (contact@quizvibe.se)', Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text: string = `${data.extract ?? ''} ${data.description ?? ''}`;
    const m = text.match(/\bborn\b[^.]{0,40}?(\d{4})/i) ?? text.match(/\((?:born\s*)?[^)]*?(\d{4})[^)]*\)/i);
    if (!m) return null;
    const year = parseInt(m[1], 10);
    return year > 1800 && year < 2030 ? year : null;
  } catch {
    return null;
  }
}

/** Ackumulerar avvikelser mellan Wikidata och Wikipedia — se main() för rapportskrivning. */
const birthYearConflicts: Array<{
  id: string;
  displayName: string;
  wikidataYear: number;
  wikipediaYear: number;
  enwikiTitle: string;
}> = [];

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

  // Returnerar null (INTE det råa QID:t) när entiteten saknar engelsk label —
  // annars läcker skräp som "Q10656424" rakt in i en spelarsynlig hint (hände
  // för Rolandz medlemslista 2026-08-27). Alla anropsställen MÅSTE hoppa över
  // hinten vid null, aldrig visa qid-strängen som fallback-text.
  async function label(qid: string): Promise<string | null> {
    if (labelsFetched.has(qid)) return labelsFetched.get(qid)!;
    await sleep(THROTTLE_MS);
    const lbl = await getEntityLabel(qid);
    if (lbl) labelsFetched.set(qid, lbl);
    return lbl ?? null;
  }

  // Profession / occupation (P106) — tar nu upp till 2 yrken, joinade med
  // " & ". 2026-08-27: resolveProfessionValue (hintsText.ts) splittar redan
  // på " & "/","/"/" och visar en icke-redundant andra del som "Also: X" —
  // ett andra P106-värde ger alltså en helt gratis extra render-entry för
  // personer som är kända inom mer än en gren (t.ex. sångare+skådespelare).
  const occClaims = claims[P.occupation]?.slice(0, 2) ?? [];
  if (occClaims.length > 0) {
    const occNames: string[] = [];
    for (const c of occClaims) {
      const qid = c?.mainsnak?.datavalue?.value?.id;
      if (!qid) continue;
      const occ = await label(qid);
      if (!occ) continue;
      occNames.push(occ.charAt(0).toUpperCase() + occ.slice(1));
    }
    if (occNames.length > 0) {
      hints.push(h('prof', 'profession', 'Profession', occNames.join(' & '), 1));
    }
  }
  if (occClaims.length === 0) {
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
    if (bpName) hints.push(h('bp', 'birth_place', 'Place of birth', bpName, 2));
  }

  // Klubb/team (P54) — för idrottare
  if (claims[P.sport_team]) {
    const teams = claims[P.sport_team].slice(0, 5);
    for (let i = 0; i < teams.length; i++) {
      const teamQid = teams[i]?.mainsnak?.datavalue?.value?.id;
      if (!teamQid) continue;
      const teamName = await label(teamQid);
      if (!teamName) continue;
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
      if (!awardName) continue;
      const dateRaw = awards[i].qualifiers?.[P.date_started]?.[0]?.datavalue?.value?.time;
      const year = dateRaw ? ` (${parseYear(dateRaw)})` : '';
      hints.push(h(`merit${i}`, 'merit', 'Merit/Award', `${awardName}${year}`, i === 0 ? 5 : 4));
    }
  }

  // Anmärkningsvärda verk (P800) — max 4. Utökat 2026-08-27 till 'band'
  // (var tidigare bara artist/actor) — P800 är ofta ifyllt på band-entiteter
  // med deras mest kända låtar och gav annars 0 hints för hela subjektet.
  if (claims[P.notable_work] && (subject === 'artist' || subject === 'actor' || subject === 'band')) {
    const works = claims[P.notable_work].slice(0, 4);
    for (let i = 0; i < works.length; i++) {
      const workQid = works[i]?.mainsnak?.datavalue?.value?.id;
      if (!workQid) continue;
      const workName = await label(workQid);
      if (!workName) continue;
      const dateRaw = works[i].qualifiers?.[P.date_started]?.[0]?.datavalue?.value?.time;
      const year = dateRaw ? ` (${parseYear(dateRaw)})` : '';
      const type: HintType = subject === 'actor' ? 'movie' : 'song';
      const lbl = subject === 'actor' ? 'Notable film' : 'Notable work';
      const priority: 1|2|3|4|5 = i < 2 ? 4 : 3;
      hints.push(h(`work${i}`, type, lbl, `"${workName}"${year}`, priority));
    }
  }

  // Genre (P136) — tillagd 2026-08-27. Vanligt ifylld på band-entiteter,
  // gav tidigare ingenting eftersom P.genre bara var deklarerad, aldrig läst.
  const genreQid = getClaimString(claims, P.genre);
  if (genreQid) {
    const genreName = await label(genreQid);
    if (genreName) hints.push(h('genre', 'characteristic', 'Genre', genreName, 2));
  }

  // Medlemmar (P527, "has part(s)") — tillagd 2026-08-27, bara för band.
  // Samma dödkods-fälla som genre: deklarerad property, aldrig läst.
  if (subject === 'band' && claims[P.has_member]) {
    const members = claims[P.has_member].slice(0, 4);
    const names: string[] = [];
    for (const m of members) {
      const mQid = m?.mainsnak?.datavalue?.value?.id;
      if (!mQid) continue;
      const nm = await label(mQid);
      if (!nm) continue;
      names.push(nm);
    }
    if (names.length > 0) {
      hints.push(h('members', 'band_member', 'Members', names.join(', '), 3));
    }
  }

  // Bildningsår (P571) — tillagd 2026-08-27, bara för band. Personers
  // motsvarande P569 (birth_date) hanteras redan ovan.
  if (subject === 'band') {
    const incepRaw = getClaimString(claims, P.date_started);
    if (incepRaw) {
      const year = parseYear(incepRaw);
      if (year) hints.push(h('formed', 'creation_year', 'Formed', year, 2));
    }
  }

  // Bildningsort (P740) — tillagd 2026-08-27, bara band. Ofta ifylld även
  // för tunt dokumenterade grupper (till skillnad från P527/P800/P166).
  if (subject === 'band') {
    const locQid = getClaimString(claims, P.formation_location);
    if (locQid) {
      const locName = await label(locQid);
      if (locName) hints.push(h('formloc', 'characteristic', 'Formed in', locName, 2));
    }
  }

  // Instrument (P1303) — tillagd 2026-08-27, bara solo-artister. Vanligt
  // ifylld för musiker och ger en distinkt extra render-entry utan att
  // krocka med profession-redundans-filtret (typ='characteristic', inte
  // 'profession', så det körs aldrig genom PROFESSION_SYNONYMS).
  if (subject === 'artist' && claims[P.instrument]) {
    const instrQid = claims[P.instrument][0]?.mainsnak?.datavalue?.value?.id;
    if (instrQid) {
      const instrName = await label(instrQid);
      if (instrName) hints.push(h('instr', 'characteristic', 'Instrument', instrName, 2));
    }
  }

  // Skivbolag (P264) — tillagd 2026-08-27, bara band. Marginell fakta men
  // en giltig, ofta ifylld distinkt bullet för tunt-dokumenterade grupper.
  if (subject === 'band' && claims[P.record_label]) {
    const labelQid = claims[P.record_label][0]?.mainsnak?.datavalue?.value?.id;
    if (labelQid) {
      const labelName = await label(labelQid);
      if (labelName) hints.push(h('reclabel', 'characteristic', 'Record label', labelName, 2));
    }
  }

  // Nominering (P1411) — fallback ENDAST när inga vinster (P166) finns.
  // Faktamässigt en svagare merit än en vinst, så egen etikett ("Nominated
  // for") i stället för 'Merit/Award' — bevarar distinktionen vinst/nominering
  // och undviker att classifyMerit felaktigt Titles/Trophies-grupperar en
  // nominering som om den vore en vinst.
  if (!claims[P.award] && claims[P.nominated_for]) {
    const noms = claims[P.nominated_for].slice(0, 2);
    for (let i = 0; i < noms.length; i++) {
      const nomQid = noms[i]?.mainsnak?.datavalue?.value?.id;
      if (!nomQid) continue;
      const nomName = await label(nomQid);
      if (!nomName) continue;
      hints.push(h(`nom${i}`, 'merit', 'Nominated for', nomName, 3));
    }
  }

  // Upplöst (P576) — tillagd 2026-08-27, bara nedlagda band. Formed/Disbanded
  // som par läses naturligt ihop utan att kräva ett eget grupp-block.
  if (subject === 'band') {
    const dissolvedRaw = getClaimString(claims, P.dissolved);
    if (dissolvedRaw) {
      const year = parseYear(dissolvedRaw);
      if (year) hints.push(h('disbanded', 'characteristic', 'Disbanded', year, 3));
    }
  }

  // Wikidata-description som sista utväg — tillagd 2026-08-27. Nästan alla
  // entiteter har en engelsk description ("American rock band", "Israeli
  // singer"), men den nämner nästan alltid nationalitet FÖRST, vilket
  // isNationalityHint (hintsText.ts) annars filtrerar bort HELA raden för —
  // flaggan visar redan landet, så vi strippar samma info här innan den blir
  // en hint. Ger tunt dokumenterade artister/band en sista, nästan alltid
  // tillgänglig extra render-entry.
  const rawDesc: string | undefined = entity.descriptions?.en?.value;
  if (rawDesc) {
    const stripped = rawDesc.replace(LEADING_NATIONALITY_RE, '').trim();
    const capitalized = stripped.charAt(0).toUpperCase() + stripped.slice(1);
    if (capitalized.length > 2) {
      hints.push(h('desc', 'characteristic', 'About', capitalized, 1));
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

/**
 * Läser ut varje items FÄRDIGA textblock ur en tidigare skriven output-fil,
 * nycklat på id — inte bara vilka id:n som finns (se `loadExistingIds`).
 *
 * KRITISKT för `--resume`: utan denna kastades hela den tidigare filens
 * innehåll bort vid varje körning (bara items som faktiskt processades i
 * DEN körningen skrevs ut) — `--resume` skippade om-hämtning korrekt men
 * "kom ihåg" aldrig de överhoppade items:ens data till slutresultatet.
 * En körning med en liten `--ids`-lista (eller en katalog-diff som råkade
 * bli kort) kunde därmed tysta radera tusentals rader existerande hints.
 * Verifierat 2026-08-27: en `--resume`-körning för 50 nya items krympte
 * filen från 739 till 39 entries innan denna fix.
 */
function loadExistingBlocks(outputFile: string): Map<string, string> {
  const blocks = new Map<string, string>();
  if (!fs.existsSync(outputFile)) return blocks;
  const lines = fs.readFileSync(outputFile, 'utf-8').split('\n');
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(/^ {2}'([\w-]+)':\s*\{$/);
    if (!m) { i++; continue; }
    const id = m[1];
    const start = i;
    i++;
    // Entry-blockets EGEN closing brace är den enda 2-space-indenterade
    // '},'-raden inuti blocket — hints-arrayen stänger med 4-space '],'.
    while (i < lines.length && lines[i] !== '  },') i++;
    blocks.set(id, lines.slice(start, i + 1).join('\n'));
    i++;
  }
  return blocks;
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
    entityId = await searchEntity(searchQuery, subject, item.displayName);
  } catch (e) {
    console.warn(`  [WARN] Search failed for "${searchQuery}":`, (e as Error).message);
    return null;
  }

  if (!entityId) {
    // Försök igen utan hints
    try {
      await sleep(THROTTLE_MS);
      entityId = await searchEntity(item.displayName, subject, item.displayName);
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

  // Människo-check (P31=Q5) — fångar en felmatchning MOT en icke-person (t.ex.
  // en översättare/skådis med samma namn, en by, ett släkte) som ändå klarade
  // pickBestHit:s ordbaserade poängsättning. 'character' undantas — fiktiva
  // figurer är per definition inte Q5. 'band' undantas ocksä — en musikgrupp
  // ÄR per definition inte en människa (P31=Q215380/musical group o.dyl.),
  // så checken skulle annars skippa VARJE band (upptäckt 2026-08-27 efter att
  // en hel batch på 100+ band tystnat med "is not a human").
  if (subject !== 'character' && subject !== 'band') {
    const instanceOfIds: string[] = (entity.claims?.[P.instance_of] ?? [])
      .map((v: any) => v?.mainsnak?.datavalue?.value?.id)
      .filter((v: unknown): v is string => typeof v === 'string');
    if (!instanceOfIds.includes(Q_HUMAN)) {
      console.warn(`  [SKIP] ${entityId} is not a human for "${item.displayName}"`);
      return null;
    }
  }

  let extracted: any;
  try {
    extracted = await extractHints(entity, subject, item.displayName);
  } catch (e) {
    console.warn(`  [WARN] Hint extraction failed for "${item.displayName}":`, (e as Error).message);
    return null;
  }

  // ── Andra-källa-validering av födelseår (Peter 2026-08-27) ────────────────
  // "Ledtrådarna ska kunna hittas från flera källor, inte bara förlita sig på
  // en" — Wikidata är den ENDA källan idag. Födelseåret är den mest kritiska,
  // enklast dubbelkollade uppgiften: hämta Wikipedia-sammanfattningen för
  // SAMMA entitet (via dess enwiki-sitelink, inte en ny sökning — annars
  // riskerar man att jämföra mot en ANNAN felmatchning) och se om samma år
  // nämns. Blockerar INTE automatiskt vid avvikelse (fri text-parsning är
  // egen felkälla) — loggas till backend/output/hints-birth-year-conflicts.md
  // för manuell granskning, se main().
  const birthHint = (extracted.hints as HintItem[]).find((hh) => hh.type === 'birth_date');
  const enwikiTitle: string | undefined = entity.sitelinks?.enwiki?.title;
  if (birthHint && enwikiTitle) {
    const wikidataYear = parseInt((birthHint.value.match(/(\d{4})/) ?? [])[1] ?? '', 10);
    if (!Number.isNaN(wikidataYear)) {
      await sleep(THROTTLE_MS);
      const wikipediaYear = await fetchWikipediaBirthYear(enwikiTitle);
      if (wikipediaYear !== null && Math.abs(wikipediaYear - wikidataYear) > 1) {
        birthYearConflicts.push({
          id: item.id,
          displayName: item.displayName,
          wikidataYear,
          wikipediaYear,
          enwikiTitle,
        });
      }
    }
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

  // Samlad output. I --resume-läge FÖRHANDSFYLLS den med de tidigare
  // körningarnas färdiga textblock (se loadExistingBlocks) så de övertas
  // oförändrade in i den nya filen — annars skrivs de bort helt.
  const generated: Record<string, HintLibrary> = {};
  const preservedBlocks = new Map<string, string>();

  if (isResume && fs.existsSync(outputFile)) {
    for (const [id, block] of loadExistingBlocks(outputFile)) preservedBlocks.set(id, block);
    console.log(`Resume mode — carrying forward ${preservedBlocks.size} existing generated items.`);
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

  // Bygg output-filen: nyss genererade items skriver sitt FÄRSKA block;
  // preserverade (--resume) items som inte processades i denna körning
  // återanvänder sitt gamla block verbatim. Sorterat på id för en stabil,
  // deterministisk diff mellan körningar.
  const freshBlocks = new Map(
    Object.entries(generated).map(([id, lib]) => [id, serializeLibrary(id, lib)] as const),
  );
  const allIds = new Set([...preservedBlocks.keys(), ...freshBlocks.keys()]);
  const entries = [...allIds]
    .sort()
    .map((id) => freshBlocks.get(id) ?? preservedBlocks.get(id)!)
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

  // Andra-källa-valideringsrapport (se "Andra-källa-validering" i generateLibrary).
  // Skrivs ÄVEN i --dry-läge (ingen anledning att gömma konflikter bakom flaggan).
  const reportFile = path.join(repoRoot, 'backend', 'output', 'hints-birth-year-conflicts.md');
  if (birthYearConflicts.length > 0) {
    const rows = birthYearConflicts
      .map((c) => `| \`${c.id}\` | ${c.displayName} | ${c.wikidataYear} | ${c.wikipediaYear} | [${c.enwikiTitle}](https://en.wikipedia.org/wiki/${encodeURIComponent(c.enwikiTitle.replace(/ /g, '_'))}) |`)
      .join('\n');
    const report = [
      '# Hints — födelseår-konflikter (Wikidata vs Wikipedia)',
      '',
      `Genererad av \`fetch-hints-data.ts\`. ${birthYearConflicts.length} avvikelse(r) mellan Wikidatas P569 och`,
      'Wikipedia-sammanfattningens fritext-omnämnda år (>1 års skillnad).',
      '',
      '⚠ Detta är EN signal, inte en dom — fritext-parsningen av Wikipedia-',
      'sammanfattningen är sin egen felkälla (kan t.ex. fånga ett annat',
      'årtal i texten som inte är födelseåret). Läs källorna innan du ändrar',
      'katalog- eller hints-data.',
      '',
      '| id | displayName | Wikidata-år | Wikipedia-år | Wikipedia-artikel |',
      '|---|---|---|---|---|',
      rows,
      '',
    ].join('\n');
    fs.mkdirSync(path.dirname(reportFile), { recursive: true });
    fs.writeFileSync(reportFile, report, 'utf-8');
    console.log(`⚠ ${birthYearConflicts.length} birth-year conflict(s) vs Wikipedia — see ${reportFile}`);
  } else {
    console.log('No birth-year conflicts found vs Wikipedia (second-source check).');
  }
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});

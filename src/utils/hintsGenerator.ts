// hintsGenerator.ts — slumpmässigt urval av ledtrådar från HintLibrary.
//
// selectHints(library, count=15):
//   • Alltid med: alla P5-hints (mest ikoniska, visas sist)
//   • Slumpas in: P4 → P3 → P2 → P1 tills count nåtts
//   • Sortering: ASC priority → P1 visas FIRST (warm-up), P5 LAST (reveal)
//
// Kör en gång per runda (via useMemo med resetKey som dep).

import type { HintItem, HintLibrary } from './hintsData';

// ── Radlängd ────────────────────────────────────────────────────────────────
//
// En bullet ska ALLTID rymmas på EN rad (Peter 2026-08-12) — bryter en ledtråd
// till två rader hoppar listan och de sena ledtrådarna trycks utanför kortet.
// 25 tecken är den konservativa gränsen vid fontSize 16 i hints-kolumnen
// (~250 px användbar bredd på en 390 pt-skärm ⇒ ~31 tecken; 25 håller även på
// smala skärmar och med större Dynamic Type).
export const HINT_MAX_CHARS = 25;

// Klubb-raderna (↳) renderas i fontSize 12 och rymmer proportionellt mer:
// 25 × 16/12 ≈ 33.
export const HINT_SUB_MAX_CHARS = 33;

// Typ-ordning för sekundär sortering inom samma prioritetsnivå.
// Hints av samma typ (t.ex. 'song') hamnar samlat efter varandra.
const TYPE_ORDER: Record<string, number> = {
  profession: 0,
  birth_date: 1,
  birth_place: 2,
  creation_year: 3,
  peak_year: 4,
  debut: 5,
  height: 6,
  jersey_number: 7,
  member_count: 8,
  lead_singer: 9,
  band_member: 10,
  characteristic: 11,
  club: 12,
  song: 13,
  album: 14,
  movie: 15,
  tv_show: 16,
  producer: 17,
  merit: 18,
};

function shuffleArray<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * `rng` styr vilka hints som lottas in (och i vilken ordning inom samma
 * prioritet+typ). Default `Math.random` = ny variation per runda. Remote 1v1
 * passar in en seedad RNG (se `createSeededRng`) så BÅDA spelarna får exakt
 * samma ledtrådar i samma sekvens — de spelar samma fråga var för sig och
 * måste ha identiskt underlag.
 */
export function selectHints(
  library: HintLibrary,
  count: number = 15,
  rng: () => number = Math.random,
): HintItem[] {
  const { hints } = library;

  // Om biblioteket är för litet — ta allt (sorterat)
  if (hints.length <= count) {
    const all = [...hints].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return (TYPE_ORDER[a.type] ?? 99) - (TYPE_ORDER[b.type] ?? 99);
    });
    return groupChronologically(groupChronologically(all, 'club'), 'movie');
  }

  // Gruppera per prioritet
  const buckets: Record<number, HintItem[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  for (const hint of hints) {
    buckets[hint.priority].push(hint);
  }

  const selected: HintItem[] = [];

  // P5 inkluderas alltid (de allra mest ikoniska ledtrådarna)
  selected.push(...shuffleArray(buckets[5], rng));

  // Fyll resterande platser med slumpmässigt urval från P4 → P1
  for (const p of [4, 3, 2, 1] as const) {
    if (selected.length >= count) break;
    const pool = shuffleArray(buckets[p], rng);
    const take = Math.min(pool.length, count - selected.length);
    selected.push(...pool.slice(0, take));
  }

  // Sortera primärt på prioritet (P1 FIRST → P5 LAST),
  // sekundärt på type så att hints av samma sort hamnar efter varandra.
  selected.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return (TYPE_ORDER[a.type] ?? 99) - (TYPE_ORDER[b.type] ?? 99);
  });

  // Deduplicera på normaliserat value — samma fakta kan finnas på flera
  // prioritetsnivåer (t.ex. "BRIT Awards" på P3 och P4). Behåll första
  // förekomsten (lägst prioritetsnummer = visas tidigt) och kasta resten.
  const seenValues = new Set<string>();
  const unique = selected.filter(h => {
    const key = h.value.toLowerCase().trim();
    if (seenValues.has(key)) return false;
    seenValues.add(key);
    return true;
  });

  return groupChronologically(groupChronologically(unique.slice(0, count), 'club'), 'movie');
}

// ── Kronologisk gruppering (karriärhistorik + filmografi) ───────────────────

/**
 * Årtal ur en klubb- eller film-ledtråd: 'AFC Ajax (1964–1973)' → 1964,
 * '"Jaws" — as Chief Brody (1975)' → 1975. Saknas årtal returneras Infinity
 * så odaterade poster hamnar sist.
 */
function extractYearFromValue(hint: HintItem): number {
  const paren = hint.value.match(/\((\d{4})/);
  if (paren) return parseInt(paren[1], 10);
  const anyYear = hint.value.match(/\b(\d{4})\b/);
  return anyYear ? parseInt(anyYear[1], 10) : Number.POSITIVE_INFINITY;
}

/**
 * Samlar ALLA ledtrådar av en given typ ('club' eller 'movie') i ETT block i
 * kronologisk ordning (Peter 2026-08-12, utökat till filmografi 2026-08-27)
 * — en karriärhistorik eller filmografi som hoppar i tiden är obegriplig.
 *
 * Två saker fixas här:
 *   1. Poster av samma typ ligger ofta på olika prioritetsnivåer (den mest
 *      ikoniska rollen = P5, övriga = P3-P4) och splittades därför av
 *      prioritetssorteringen i flera separata block. Nu blir det alltid EN.
 *   2. Inom en grupp var ordningen slumpad (shuffle per prioritetshink).
 *      Nu sorteras de på årtal, odaterade sist.
 *
 * Blocket placeras där den FÖRSTA posten av den här typen låg, så reveal-
 * takten i övrigt är oförändrad. Rör inte hints av andra typer.
 */
function groupChronologically(hints: HintItem[], type: 'club' | 'movie'): HintItem[] {
  const firstIdx = hints.findIndex((h) => h.type === type);
  if (firstIdx === -1) return hints;

  const group = hints.filter((h) => h.type === type);
  if (group.length < 2) return hints;

  group.sort((a, b) => extractYearFromValue(a) - extractYearFromValue(b));

  // Allt före firstIdx är per definition av annan typ → indexet är även
  // insättningspunkten i `rest`.
  const rest = hints.filter((h) => h.type !== type);
  return [...rest.slice(0, firstIdx), ...group, ...rest.slice(firstIdx)];
}

// ── Formatering + radanpassning ─────────────────────────────────────────────

/**
 * Hinttexten som den visas. De flesta hint-värden är självförklarande — bara
 * datum och ett fåtal typer behöver ett kort prefix för kontext. Prefixen
 * hålls korta eftersom de äter av HINT_MAX_CHARS ('Singer:' i stället för
 * 'Lead singer:' ger t.ex. plats åt hela "Singer: Marie Fredriksson").
 */
export function formatHintText(hint: HintItem): string {
  switch (hint.type) {
    case 'birth_date':    return `Born: ${hint.value}`;
    case 'peak_year':     return `Career: ${hint.value}`;
    case 'lead_singer':   return `Singer: ${hint.value}`;
    case 'creation_year': return `Created: ${hint.value}`;
    case 'producer':      return `Creator: ${hint.value}`;
    default:              return hint.value;
  }
}

/** Ordvis avkortning med ellips, aldrig längre än `max` tecken totalt. */
function truncateWords(text: string, max: number): string {
  if (text.length <= max) return text;
  const budget = max - 1; // plats för '…'
  const cut = text.slice(0, budget);
  const lastSpace = cut.lastIndexOf(' ');
  const head = lastSpace > budget * 0.5 ? cut.slice(0, lastSpace) : cut;
  return `${head.replace(/[\s,;:—–-]+$/, '')}…`;
}

/**
 * Lagar citattecken som avkortningen brutit isär. '"Sällskapsresan 2 – Snow…'
 * blir annars '"Sällskapsresan 2' med ett hängande inledande citattecken.
 * Sätt dit det avslutande om det ryms, annars ta bort det inledande.
 */
function balanceQuotes(text: string, max: number): string {
  const count = (text.match(/"/g) ?? []).length;
  if (count % 2 === 0) return text;
  // Bara titlar inleds med citattecken. Udda antal utan inledande citattecken
  // är typiskt tum-tecknet i längduppgifter (198 cm (6'6")) — rör inte det.
  if (!text.startsWith('"')) return text;
  return text.length < max ? `${text}"` : text.slice(1);
}

// Standardfraser i utmärkelse-namn (dominerande hint-typen 'merit') som säger
// samma sak kortare. Körs FÖRE avkortning så "Academy Award for Best Actress"
// blir "Oscar: Best Actress" i stället för "Academy Award for Best…".
const HINT_ABBREVIATIONS: [RegExp, string][] = [
  [/^Academy Award for /i, 'Oscar: '],
  [/^Screen Actors Guild Award for /i, 'SAG Award: '],
  [/^star on (the )?/i, ''],
  [/\bAward for Best\b/i, ': Best'],
  [/\bAward for\b/i, ':'],
  [/\bPrize for\b/i, ':'],
  [/\s*:\s*/g, ': '],
];

function abbreviate(text: string): string {
  let out = text;
  for (const [re, replacement] of HINT_ABBREVIATIONS) out = out.replace(re, replacement);
  return out.trim();
}

/**
 * Kortar ned en ledtråd så den ryms på en rad. Tar bort information i den
 * ordning den är minst värdefull för gissningen — standardfraser först, sedan
 * förklarande efterled, sedan årtalet, och först därefter ellips.
 */
export function fitHintText(text: string, max: number = HINT_MAX_CHARS): string {
  let out = text.trim();
  if (out.length <= max) return out;

  // 1. Standardfraser ("Academy Award for " → "Oscar: ").
  out = abbreviate(out);
  if (out.length <= max) return out;

  // 2. Förklarande efterled: '"Thriller" (1982) — best-selling album…'
  const dash = out.search(/\s[—–-]\s/);
  if (dash > 0) {
    const head = balanceQuotes(out.slice(0, dash).trim(), max);
    if (head.length > 0) {
      out = head;
      if (out.length <= max) return out;
    }
  }

  // 3. Avslutande årtals-parentes — svaret är namnet, inte året.
  const noParen = out.replace(/\s*\([^)]*\)\s*$/, '').trim();
  if (noParen.length > 0) {
    out = noParen;
    if (out.length <= max) return out;
  }

  return balanceQuotes(truncateWords(out, max), max);
}

/**
 * Klubb-rader: korta ned KLUBBNAMNET men behåll årtalen — de bär den
 * kronologiska ordningen och är hela poängen med karriärhistoriken.
 */
export function fitClubText(text: string, max: number = HINT_SUB_MAX_CHARS): string {
  const out = text.trim();
  if (out.length <= max) return out;

  const m = out.match(/^(.*?)(\s*\((\d{4})[^)]*\))$/);
  if (!m) return truncateWords(out, max);

  const [, name, years] = m;
  const nameBudget = max - years.length;
  if (nameBudget < 8) return truncateWords(out, max); // årtalen får inte äta hela raden
  return `${truncateWords(name.trim(), nameBudget)}${years}`;
}

/**
 * Film-rader (grupperade under "Film History", se buildRenderEntries): korta
 * ned TITELN men behåll årtalet — precis som fitClubText, eftersom årtalet
 * bär den kronologiska ordningen som är hela poängen med grupperingen.
 *
 * Till skillnad från fitClubText balanseras citattecken på namn-delen —
 * filmtitlar inleds nästan alltid med `"` (klubbnamn gör aldrig det), så en
 * rå truncateWords hade kunnat lämna ett hängande inledande citattecken.
 */
export function fitFilmText(text: string, max: number = HINT_SUB_MAX_CHARS): string {
  const out = text.trim();
  if (out.length <= max) return out;

  const m = out.match(/^(.*?)(\s*\((\d{4})[^)]*\))$/);
  if (!m) return balanceQuotes(truncateWords(out, max), max);

  const [, name, years] = m;
  const nameBudget = max - years.length;
  if (nameBudget < 8) return balanceQuotes(truncateWords(out, max), max); // årtalen får inte äta hela raden
  return `${balanceQuotes(truncateWords(name.trim(), nameBudget), nameBudget)}${years}`;
}

// ── Render-grupper (Peter 2026-08-27) ────────────────────────────────────────
//
// Efter text-pipelinen (se hintsText.ts) grupperas ledtrådarna för visning:
// samma mönster som karriärhistoriken ovan, men generaliserat till fyra
// rubriker som alla samlar EN samling ledtrådar oavsett var i prioritets-
// ordningen de hamnade (inte bara konsekutiva rader):
//
//   Birth          — birth_date + birth_place
//   Career History — 'club'-ledtrådar (kronologiskt, se groupChronologically)
//   Film History   — 'movie'-ledtrådar (kronologiskt, se groupChronologically)
//   Titles         — 'merit'-ledtrådar som är TÄVLINGS-/lag-titlar
//   Trophies       — 'merit'-ledtrådar som är PERSONLIGA utmärkelser
//
// En grupp bildas bara om den har ≥2 medlemmar — en ensam post visas som en
// vanlig bullet (samma regel som karriärhistoriken alltid haft).

/** En ledtråd med sin färdiga, radanpassade text (se hintsText.ts). */
export interface ResolvedHint {
  hint: HintItem;
  text: string;
}

export type SingleEntry = { kind: 'single'; hint: ResolvedHint; index: number };
export type GroupEntry = { kind: 'group'; label: string; items: { hint: ResolvedHint; index: number }[] };
export type RenderEntry = SingleEntry | GroupEntry;

type GroupKind = 'birth' | 'career' | 'film' | 'titles' | 'trophies';

const GROUP_LABELS: Record<GroupKind, string> = {
  birth: 'Birth',
  career: 'Career History',
  film: 'Film History',
  titles: 'Titles',
  trophies: 'Trophies',
};

// Etiketter som redan pekar ut TÄVLINGS-/lag-titlar entydigt (curator-satta,
// se merit-hintarna i hintsData.ts — 'Club Trophy'/'National Trophy' för lag,
// 'Major'/'Team golf'/'Tour win(s)' för individuella turneringssegrar).
const TITLE_LABELS = new Set([
  'Club Trophy', 'National Trophy', 'Major', 'Olympic', 'Olympics',
  'Team', 'Team golf', 'Tour win', 'Tour wins',
]);

// Etiketter utan egen signal (auto-genererade 'Merit/Award' + generiska
// manuella 'Merit'/'merit'/'Award') — dessa avgörs via nyckelord i VÄRDET.
const GENERIC_MERIT_LABELS = new Set(['Merit/Award', 'Merit', 'merit', 'Award']);

// Namngivna turneringar/mästerskap = en TITEL vanns. Personliga hedersnamn
// (Guldbollen, Ballon d'Or, Hart Trophy, Hall of Fame, Oscar, Grammy m.fl.)
// matchar INGET av dessa och hamnar därför under Trophies som default.
const TITLE_KEYWORDS = /\b(cup|championship|champion|wimbledon|roland garros|grand slam|super bowl|world cup|olympic|olympics|stanley cup|premier league|la liga|serie a|bundesliga|ryder cup|solheim cup|the open|masters|pga tour|lpga tour|eurovision|melodifestivalen)\b/i;

/**
 * Klassar en 'merit'-ledtråd som lag-/tävlingstitel ('title') eller personlig
 * utmärkelse ('trophy'). Bästa-försök-heuristik — se TITLE_KEYWORDS-kommentaren
 * ovan för gränsfall som medvetet hamnar under Trophies.
 */
function classifyMerit(hint: HintItem): 'title' | 'trophy' {
  if (TITLE_LABELS.has(hint.label)) return 'title';
  if (GENERIC_MERIT_LABELS.has(hint.label)) {
    return TITLE_KEYWORDS.test(hint.value) ? 'title' : 'trophy';
  }
  return 'trophy';
}

function groupKindOf(hint: HintItem): GroupKind | null {
  switch (hint.type) {
    case 'birth_date':
    case 'birth_place': return 'birth';
    case 'club':         return 'career';
    case 'movie':         return 'film';
    case 'merit':         return classifyMerit(hint) === 'title' ? 'titles' : 'trophies';
    default:              return null;
  }
}

/** Föddes-gruppen visar alltid datum FÖRE ort, oavsett ursprunglig ordning. */
function birthSortKey(hint: HintItem): number {
  return hint.type === 'birth_date' ? 0 : 1;
}

/**
 * Bygger de render-entries (enskilda bullets + rubrik-grupper) som
 * HintsQuizCard renderar. Ren funktion (ingen React) så den kan delas mellan
 * klienten och backend-exportens spelbarhets-gate (se `countRenderEntries`).
 *
 * Till skillnad från den ursprungliga klubb-bara implementationen (som bara
 * grupperade KONSEKUTIVA rader) samlar denna ALLA medlemmar av en grupp-typ
 * oavsett var de hamnade efter prioritets-sorteringen — annars splittras t.ex.
 * en filmografi där den mest ikoniska rollen medvetet ligger på P5 (visas
 * sist) från de tidigare rollerna på P3-P4.
 */
export function buildRenderEntries(hints: ResolvedHint[]): RenderEntry[] {
  const kinds = hints.map((h) => groupKindOf(h.hint));

  const indicesByKind = new Map<GroupKind, number[]>();
  kinds.forEach((k, i) => {
    if (!k) return;
    if (!indicesByKind.has(k)) indicesByKind.set(k, []);
    indicesByKind.get(k)!.push(i);
  });

  // Bara grupper med ≥2 medlemmar blir en rubrik — en ensam post är bara en bullet.
  const groupableKinds = new Set(
    [...indicesByKind.entries()].filter(([, idxs]) => idxs.length >= 2).map(([k]) => k),
  );
  const firstIndexOfKind = new Map<GroupKind, number>();
  for (const k of groupableKinds) firstIndexOfKind.set(k, indicesByKind.get(k)![0]);

  const entries: RenderEntry[] = [];
  for (let i = 0; i < hints.length; i++) {
    const kind = kinds[i];
    if (kind && groupableKinds.has(kind)) {
      if (firstIndexOfKind.get(kind) !== i) continue; // hanteras vid gruppens första index
      const idxs = indicesByKind.get(kind)!;
      const items = idxs.map((idx) => ({ hint: hints[idx], index: idx }));
      if (kind === 'career') items.sort((a, b) => extractYearFromValue(a.hint.hint) - extractYearFromValue(b.hint.hint));
      else if (kind === 'film') items.sort((a, b) => extractYearFromValue(a.hint.hint) - extractYearFromValue(b.hint.hint));
      else if (kind === 'birth') items.sort((a, b) => birthSortKey(a.hint.hint) - birthSortKey(b.hint.hint));
      // 'titles'/'trophies' behåller redan sin prioritets-ordning (idxs är scan-ordnad).
      entries.push({ kind: 'group', label: GROUP_LABELS[kind], items });
      continue;
    }
    entries.push({ kind: 'single', hint: hints[i], index: i });
  }
  return entries;
}

/**
 * Antal TOPP-nivå-bullets en fråga skulle visa (grupper räknas som EN),
 * givet ALLA ledtrådar i biblioteket. Används av spelbarhets-gaten i
 * export-image-questions.ts (se MIN_HINTS_REQUIRED/MIN_RENDER_ENTRIES där) —
 * ett item med få råa fakta som ändå grupperar snyggt (Birth + Career History
 * + Trophies = 3 grupper av kanske 7 rader) kan vara lika spelbart som ett
 * med 10 lösa fakta.
 */
export function countRenderEntries(hints: ResolvedHint[]): number {
  return buildRenderEntries(hints).length;
}

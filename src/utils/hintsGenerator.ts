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
    return orderCareerHistory(all);
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

  return orderCareerHistory(unique.slice(0, count));
}

// ── Karriärhistorik ─────────────────────────────────────────────────────────

/**
 * Startår ur en klubb-ledtråd: 'AFC Ajax (1964–1973)' → 1964.
 * Saknas årtal returneras Infinity så odaterade klubbar hamnar sist.
 */
function clubStartYear(hint: HintItem): number {
  const paren = hint.value.match(/\((\d{4})/);
  if (paren) return parseInt(paren[1], 10);
  const anyYear = hint.value.match(/\b(\d{4})\b/);
  return anyYear ? parseInt(anyYear[1], 10) : Number.POSITIVE_INFINITY;
}

/**
 * Samlar ALLA klubb-ledtrådar i ETT block i kronologisk ordning (Peter
 * 2026-08-12) — en karriärhistorik som hoppar i tiden är obegriplig som
 * ledtråd.
 *
 * Två saker fixas här:
 *   1. Klubbar ligger på olika prioritetsnivåer (ikonisk klubb = P4, övriga
 *      = P3) och splittades därför av prioritetssorteringen i två separata
 *      "Career History"-grupper. Nu blir det alltid exakt en.
 *   2. Inom en grupp var ordningen slumpad (shuffle per prioritetshink).
 *      Nu sorteras de på startår, odaterade sist.
 *
 * Blocket placeras där den FÖRSTA klubben låg, så reveal-takten i övrigt är
 * oförändrad. Rör inte hints av andra typer.
 */
function orderCareerHistory(hints: HintItem[]): HintItem[] {
  const firstClubIdx = hints.findIndex((h) => h.type === 'club');
  if (firstClubIdx === -1) return hints;

  const clubs = hints.filter((h) => h.type === 'club');
  if (clubs.length < 2) return hints;

  clubs.sort((a, b) => clubStartYear(a) - clubStartYear(b));

  // Allt före firstClubIdx är per definition icke-klubbar → indexet är även
  // insättningspunkten i `rest`.
  const rest = hints.filter((h) => h.type !== 'club');
  return [...rest.slice(0, firstClubIdx), ...clubs, ...rest.slice(firstClubIdx)];
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

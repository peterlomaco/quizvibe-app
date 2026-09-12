/**
 * QuizVibe HCP Engine — ren kärna (typer + justeringslogik + display).
 *
 * Samma roll som epochAllocation.ts har mot epochLedger.ts: INGA
 * React/AsyncStorage-beroenden och ingen läsning av väggklockan internt
 * (Date/now injiceras som argument), så filen är fullt deterministisk och
 * enhetstestas i backend-vitest. Persistensen (per-spelare-store + guest-
 * fallback) bor i hcpProgress.ts.
 *
 * MODELL (Peters beslut 2026-08-28, kategori-uppdelning 2026-08-31):
 *  • §1.1  Skala 1–99, 1 = elit, 99 = nybörjare. ALLA nya spelare startar
 *          på HCP 99 (assistance/ålder-baserat start är avfärdat).
 *  • §1.3  En spelare har TRE HCP: Music, Film (var sin egen progress + fönster)
 *          samt Total = SNITTET av de två kategorierna (härlett, aldrig lagrat).
 *          Varje HCP är dessutom kopplat till EN region scope — se
 *          hcpProgress.ts (nyckel per region). (Sport är borttaget ur den live
 *          modellen 2026-09 — allt sport-innehåll är parkerat i deferred/.)
 *  • §2.1  Ett glidande fönster per assistance-nivå (senaste 20 svaren) PER
 *          kategori. När fönstret är fullt beräknas råa STEG från fönstersumman
 *          S: ett steg per rätt svar förbi upper (S≥upper → −steg) och ett steg
 *          per fel förbi lower (S≤lower → +steg), annars 0 — OKAPAT antal steg.
 *          Stegen skalas sedan av en HCP-TIER-faktor tagen ur kategorins värde
 *          FÖRE spelet (>60 → ×0.75, 30–60 → ×0.5, 1–29 → ×0.25), i BÅDA
 *          riktningar. Den UPPÅTGÅENDE (sämre) deltan cappas dessutom per
 *          nivå × tier (WORST_DELTA_CAP); den nedåtgående (bättre) cappas ej.
 *          Kontinuerligt glidande (INGEN reset).
 *  • §2.4  Inaktivitets-decay: +0.25 per hel 7-dagarsperiod utan spel,
 *          per kategori (var kategori har sin egen lastPlayedISO-klocka).
 *
 * ⚠ EJ IMPLEMENTERAT ÄNNU (kräver Item-HCP = probability-bootstrap, egen fas):
 *  • §2.2  Viktad HCP-Impact — varje rätt svars bidrag till fönstret skalas
 *          av frågans HCP (lätt fråga < 1, sällsynt fråga upp till 2.0).
 *          Tills dess är bidraget rått: rätt = 1, fel = 0 (se appendToWindow).
 *  • §2.3  Host-override-belöning (snabbare earn-down när host satt HCP lågt).
 * Lägg inte till §2.2/§2.3 här förrän Item-HCP-datan finns på klienten.
 */
import type { AssistanceLevel } from './hcp';
import { MAIN_CATEGORIES, type MainCategory } from './mainCategory';

// Kategorierna en spelares HCP delas upp i (= YouTube/Hints-huvudkategorierna).
export const HCP_CATEGORIES = MAIN_CATEGORIES;

// Sliding-window-state (§2.1): senaste svaren rätt/fel per assistance-nivå.
// `true` = rätt, `false` = fel. Äldst först; trimmas till HCP_WINDOW_SIZE.
export type HcpWindow = boolean[];

// Progress för EN kategori (Music/Film): float-HCP, fönster per nivå och
// en egen decay-klocka. `hcp` lagras som flyttal (decay ger 0,25-steg);
// visningen avrundas uppåt (displayHcp).
export interface CategoryProgress {
  hcp: number;
  windows: Record<AssistanceLevel, HcpWindow>;
  lastPlayedISO: string | null;
}

// Hela HCP-progressen för EN registrerad spelare i EN region scope. Persisteras
// device-lokalt per (region, playerName) i hcpProgress.ts — INTE i profiles-
// raden. Total härleds som snittet av de två kategorierna (totalHcp), lagras ej.
// (Ett äldre v2-blob kan bära en kvarvarande `Sport`-nyckel — den ignoreras vid
// läsning, ingen key-bump/migration behövs.)
export interface HcpProgress {
  categories: Record<MainCategory, CategoryProgress>;
}

// §2.1 — fönstrets längd (senaste N svaren per nivå).
export const HCP_WINDOW_SIZE = 20;

// §1.1 — startvärde + gränser.
export const HCP_START = 99;
export const HCP_MIN = 1;
export const HCP_MAX = 99;

// §2.1 — trösklar per assistance-nivå. Viktad fönstersumma S:
//   S >= upper → HCP −1 (spelaren blir bättre)
//   S <= lower → HCP +1 (spelaren får det lättare)
//   däremellan → oförändrad
const WINDOW_THRESHOLDS: Record<AssistanceLevel, { lower: number; upper: number }> = {
  full:     { lower: 12, upper: 18 },
  standard: { lower: 10, upper: 16 },
  minimal:  { lower:  8, upper: 14 },
};

// §2.1 — HCP-tier (bestäms av kategorins värde FÖRE spelet). Styr både
// steg-faktorn (TIER_FACTOR) och den uppåtgående cappen (WORST_DELTA_CAP).
export type HcpTier = 'high' | 'mid' | 'low';

/** Vilken tier ett HCP-värde ligger i. 60.0 och 30.0 hamnar i 'mid'. */
export function hcpTier(hcp: number): HcpTier {
  return hcp > 60 ? 'high' : hcp >= 30 ? 'mid' : 'low';
}

// Steg-faktor per tier — hur mycket varje råstEg påverkar HCP (båda riktningar).
const TIER_FACTOR: Record<HcpTier, number> = { high: 0.75, mid: 0.5, low: 0.25 };

// Tak på den UPPÅTGÅENDE (sämre → högre HCP) deltan per assistance-nivå × tier.
// Den nedåtgående (bättre) deltan cappas ALDRIG. Ett katastrofspel kan alltså
// bara studsa tillbaka skölden ett begränsat antal poäng.
const WORST_DELTA_CAP: Record<AssistanceLevel, Record<HcpTier, number>> = {
  full:     { high: 5,   mid: 3.5, low: 1.75 },
  standard: { high: 4,   mid: 2.5, low: 1.25 },
  minimal:  { high: 3,   mid: 2.0, low: 1    },
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Klampar ett HCP-värde till [1, 99]. */
export function clampHcp(value: number): number {
  return Math.min(HCP_MAX, Math.max(HCP_MIN, value));
}

/**
 * Det heltal en spelares sköld ska visa (§1.2.3: avrundas ALLTID uppåt).
 * Ett internt 40,75 visas alltså som 41. Klampat till [1, 99].
 */
export function displayHcp(hcp: number): number {
  return clampHcp(Math.ceil(hcp));
}

/** Tom kategori-progress seedad på HCP_START (§1.1 — alla startar på 99). */
export function emptyCategoryProgress(): CategoryProgress {
  return {
    hcp: HCP_START,
    windows: { minimal: [], standard: [], full: [] },
    lastPlayedISO: null,
  };
}

/** Tomt progress-objekt: två kategorier var för sig seedade på HCP_START. */
export function emptyHcpProgress(): HcpProgress {
  return {
    categories: {
      Music: emptyCategoryProgress(),
      Film: emptyCategoryProgress(),
    },
  };
}

// §2.1 — lägg till svar i nivåns fönster (behåll senaste HCP_WINDOW_SIZE).
// Bidrag just nu = 1 (rätt) / 0 (fel). §2.2-viktningen kopplas på här när
// Item-HCP finns (varje rätt svar multipliceras då med sin impact-faktor).
function appendToWindow(win: HcpWindow, answers: boolean[]): HcpWindow {
  const next = [...win, ...answers];
  return next.length > HCP_WINDOW_SIZE ? next.slice(next.length - HCP_WINDOW_SIZE) : next;
}

/**
 * §2.1 — utvärdera nivåns fönster → RÅTT signerat stegantal (okapat).
 * Ett steg per rätt svar förbi upper (negativt = bättre) och ett steg per fel
 * förbi lower (positivt = sämre); däremellan 0. Ex FULL (12/18): 18/20 → −1,
 * 20/20 → −3, 12/20 → +1, 0/20 → +13. Tier-faktor + capp appliceras i
 * applyGameResult, INTE här.
 *
 * Kräver ett FULLT fönster (20 svar) innan något steg sker — annars skulle
 * "≤ lower" fyra direkt för en ny spelare (0 rätt ≤ lower). Ny spelares HCP
 * är därför stabilt tills nivån har 20 svar (~5 spel).
 */
export function evaluateWindow(win: HcpWindow, level: AssistanceLevel): number {
  if (win.length < HCP_WINDOW_SIZE) return 0;
  const sum = win.reduce((n, correct) => n + (correct ? 1 : 0), 0);
  const { lower, upper } = WINDOW_THRESHOLDS[level];
  if (sum >= upper) return -(sum - upper + 1); // −1 vid upper, −N längre över
  if (sum <= lower) return lower - sum + 1;    // +1 vid lower, +N längre under
  return 0;
}

/** Steg-faktorn för ett HCP-värde (>60 → 0.75, 30–60 → 0.5, 1–29 → 0.25). */
export function hcpTierFactor(hcp: number): number {
  return TIER_FACTOR[hcpTier(hcp)];
}

/**
 * §2.1 — kör en avslutad spelomgång för EN spelare på EN kategori + EN
 * assistance-nivå: lägg in svaren i den kategorins nivå-fönster, utvärdera råa
 * steg, skala med tier-faktorn (ur HCP:t FÖRE spelet), cappa den UPPÅTGÅENDE
 * deltan per nivå × tier (nedåt cappas ej), klampa [1,99], stämpla kategorins
 * lastPlayedISO. Rör bara den spelade kategorins (och nivåns) fönster — övriga
 * kategorier orörda.
 */
export function applyGameResult(
  progress: HcpProgress,
  category: MainCategory,
  level: AssistanceLevel,
  answers: boolean[],
  nowISO: string,
): HcpProgress {
  const cat = progress.categories[category];
  const win = appendToWindow(cat.windows[level], answers);
  const tier = hcpTier(cat.hcp);
  let delta = evaluateWindow(win, level) * TIER_FACTOR[tier];
  if (delta > 0) delta = Math.min(delta, WORST_DELTA_CAP[level][tier]);
  const nextCat: CategoryProgress = {
    hcp: clampHcp(cat.hcp + delta),
    windows: { ...cat.windows, [level]: win },
    lastPlayedISO: nowISO,
  };
  return {
    categories: { ...progress.categories, [category]: nextCat },
  };
}

// §2.4 — decay för EN kategori mot sin egen lastPlayedISO.
function decayCategory(cat: CategoryProgress, now: Date): CategoryProgress {
  if (!cat.lastPlayedISO) return cat;
  const last = new Date(cat.lastPlayedISO).getTime();
  if (Number.isNaN(last)) return cat;
  const periods = Math.floor((now.getTime() - last) / WEEK_MS);
  if (periods < 1) return cat;
  return {
    ...cat,
    hcp: clampHcp(cat.hcp + 0.25 * periods),
    lastPlayedISO: new Date(last + periods * WEEK_MS).toISOString(),
  };
}

/**
 * §2.4 — inaktivitets-decay: +0.25 per HEL 7-dagarsperiod sedan senaste spel,
 * OBEROENDE per kategori (varje kategori har sin egen lastPlayedISO). En
 * kategori-klocka flyttas fram med periods×7d (INTE till `now`) så vecko-resten
 * bevaras och samma period aldrig räknas två gånger vid nästa load. No-op för
 * en kategori som aldrig spelats (lastPlayedISO = null) eller < 1 vecka passerat.
 */
export function applyInactivityDecay(progress: HcpProgress, now: Date): HcpProgress {
  return {
    categories: {
      Music: decayCategory(progress.categories.Music, now),
      Film: decayCategory(progress.categories.Film, now),
    },
  };
}

/**
 * Total-HCP (flyttal) = snittet av kategorierna Music + Film — de enda live
 * kategorierna (Sport togs bort ur modellen 2026-09; dess katalog är parkerad).
 * Denna enda funktion föder profile.hcp, lobby_players.hcp,
 * player_hcp_changed-Total och varje Total-sköld (via bundleOf +
 * resolveDisplayTotalHcp).
 */
export function totalHcp(progress: HcpProgress): number {
  const { Music, Film } = progress.categories;
  return (Music.hcp + Film.hcp) / 2;
}

/**
 * Vilket HCP-tal en KATEGORI-sköld ska visa. Prefererar det sparade
 * (intjänade) värdet; faller annars tillbaka på HCP_START (§1.1). Alltid
 * avrundat uppåt (displayHcp).
 */
export function resolveDisplayCategoryHcp(storedHcp: number | undefined | null): number {
  return displayHcp(typeof storedHcp === 'number' ? storedHcp : HCP_START);
}

// Bakåtkompatibelt alias — enskilt-skalär-läsare (ProfileScreen, lobby-kolumn)
// behåller samma import/namn även efter kategori-uppdelningen.
export const resolveDisplayHcp = resolveDisplayCategoryHcp;

/** Vilket TOTAL-HCP en sköld ska visa. HCP_START-fallback för ohydrerad progress. */
export function resolveDisplayTotalHcp(progress: HcpProgress | null | undefined): number {
  return progress ? displayHcp(totalHcp(progress)) : HCP_START;
}

// §4.1 — Item-HCP-golv per spelar-HCP-nivå (Peter 2026-09-12).
// [minPlayerHcp, itemLowerBound] — nedåtsorterad; första nivån vars minPlayerHcp <= HCP vinner.
// Övre bandkanten är alltid 100 (ingen tak) — bara golvet varierar.
//   HCP ≥ 80 → itemHcp ≥ 10   (bara de mest igenkända items)
//   HCP 60–79 → ≥ 8
//   HCP 40–59 → ≥ 6
//   HCP 20–39 → ≥ 4
//   HCP < 20  → ≥ 0           (alla items, inkl. de mest obskyra)
export const HCP_RECOGNITION_TIERS: readonly (readonly [number, number])[] = [
  [80, 10],
  [60, 8],
  [40, 6],
  [20, 4],
  [0, 0],
];

/**
 * Item-HCP-golvet (lägsta `itemHcp` en spelare på `playerHcp` får serveras).
 * Ren + testbar; se HCP_RECOGNITION_TIERS för tabellen.
 */
export function hcpRecognitionLowerBound(playerHcp: number): number {
  for (const [minHcp, lower] of HCP_RECOGNITION_TIERS) {
    if (playerHcp >= minHcp) return lower;
  }
  return 0;
}

/**
 * §4.1 — HCP-frågefilter: ett ENSIDIGT golv per kategori (Peter 2026-09-12).
 *
 * En spelare på HCP `X` får items vars Item-HCP ≥ hcpRecognitionLowerBound(X);
 * övre kanten är alltid 100 (inget tak). Item-HCP bootstrappas från katalogens
 * `probability` (0–100). Nettoeffekt: golvet sänks stegvis när HCP tjänas ner,
 * så de mest obskyra items (låg probability) låses gradvis upp. Nybörjare
 * (HCP ≥ 80) utesluts bara från de allra obskyraste (probability < 10);
 * experter (HCP < 20) når hela poolen.
 *
 * Skyddsnät: om ett tomt band skulle uppstå (kategorins items alla under golvet
 * — osannolikt eftersom probability toppar ~80–90 och högsta golvet är 10)
 * returneras hela poolen. `minCount` bevaras i signaturen (call-sites orörda)
 * och används som liten-katalog-tröskel.
 *
 * Ren + generisk (enhetstestbar): items behöver bara ett `itemHcp`-fält
 * (saknas → behandlas som 100 = lättast → alltid inom bandet).
 */
export function filterByItemHcp<T extends { itemHcp?: number }>(
  pool: T[],
  playerHcp: number,
  minCount: number,
): T[] {
  if (pool.length <= minCount) return pool; // liten katalog → filtrera inte
  const lower = hcpRecognitionLowerBound(playerHcp);
  const kept = pool.filter((item) => (item.itemHcp ?? 100) >= lower);
  return kept.length > 0 ? kept : pool; // tomt band → hela poolen
}

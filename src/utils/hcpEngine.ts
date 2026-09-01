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
 *  • §1.3  En spelare har FYRA HCP: Music, Film, Sport (var sin egen
 *          progress + fönster) samt Total = SNITTET av de tre kategorierna
 *          (härlett, aldrig lagrat). Varje HCP är dessutom kopplat till EN
 *          region scope — se hcpProgress.ts (nyckel per region).
 *  • §2.1  Ett glidande fönster per assistance-nivå (senaste 20 svaren) PER
 *          kategori. När fönstret är fullt: viktad summa S ≥ upper → HCP −1,
 *          S ≤ lower → HCP +1, annars 0. Max ±1 per spel och kategori.
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

// Progress för EN kategori (Music/Film/Sport): float-HCP, fönster per nivå och
// en egen decay-klocka. `hcp` lagras som flyttal (decay ger 0,25-steg);
// visningen avrundas uppåt (displayHcp).
export interface CategoryProgress {
  hcp: number;
  windows: Record<AssistanceLevel, HcpWindow>;
  lastPlayedISO: string | null;
}

// Hela HCP-progressen för EN registrerad spelare i EN region scope. Persisteras
// device-lokalt per (region, playerName) i hcpProgress.ts — INTE i profiles-
// raden. Total härleds som snittet av de tre kategorierna (totalHcp), lagras ej.
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

/** Tomt progress-objekt: tre kategorier var för sig seedade på HCP_START. */
export function emptyHcpProgress(): HcpProgress {
  return {
    categories: {
      Music: emptyCategoryProgress(),
      Film: emptyCategoryProgress(),
      Sport: emptyCategoryProgress(),
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
 * §2.1 — utvärdera nivåns fönster → delta (−1 / 0 / +1).
 * Kräver ett FULLT fönster (20 svar) innan något steg sker — annars skulle
 * "≤ lower" fyra direkt för en ny spelare (0 rätt ≤ lower). Ny spelares HCP
 * är därför stabilt tills nivån har 20 svar (~5 spel).
 */
export function evaluateWindow(win: HcpWindow, level: AssistanceLevel): -1 | 0 | 1 {
  if (win.length < HCP_WINDOW_SIZE) return 0;
  const sum = win.reduce((n, correct) => n + (correct ? 1 : 0), 0);
  const { lower, upper } = WINDOW_THRESHOLDS[level];
  if (sum >= upper) return -1;
  if (sum <= lower) return 1;
  return 0;
}

/**
 * §2.1 — kör en avslutad spelomgång för EN spelare på EN kategori + EN
 * assistance-nivå: lägg in svaren i den kategorins nivå-fönster, utvärdera,
 * applicera max ±1, klampa [1,99], stämpla kategorins lastPlayedISO. Rör bara
 * den spelade kategorins (och nivåns) fönster — övriga kategorier orörda.
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
  const delta = evaluateWindow(win, level);
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
      Sport: decayCategory(progress.categories.Sport, now),
    },
  };
}

/**
 * Total-HCP (flyttal).
 *
 * ⚠ MUSIC-ONLY LAUNCH (2026-09): Total = Music-kategorins HCP, INTE snittet av de
 * tre. Film/Sport spelas aldrig (katalogen är parkerad) och ligger kvar på
 * HCP_START = 99 — ett snitt `(Music + 99 + 99) / 3` skulle späda ut en musik-
 * spelares Total mot 99, vilket motsäger "HCP baserat enbart på musikfrågornas
 * rätt-svarsfrekvens". Denna enda funktion föder profile.hcp, lobby_players.hcp,
 * player_hcp_changed-Total och varje Total-sköld (via bundleOf +
 * resolveDisplayTotalHcp). Återställ snittet när Film/Sport återaktiveras:
 *   const { Music, Film, Sport } = progress.categories;
 *   return (Music.hcp + Film.hcp + Sport.hcp) / 3;
 */
export function totalHcp(progress: HcpProgress): number {
  return progress.categories.Music.hcp;
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

// §4.1 — hur långt ned golvet relaxas per steg när poolen blir för tunn.
export const HCP_FILTER_STEP = 10;

/**
 * §4.1 — HCP-frågefilter med progressiv relaxering.
 *
 * En spelare ska få items vars Item-HCP >= sitt HCP (Peter 2026-08-28: "items
 * från X och uppåt"). Item-HCP bootstrappas från katalogens `probability`
 * (0–100), som toppar runt 80–90 — en ny spelare (HCP 99) skulle därför svälta
 * (nästan inga items har probability >= 99). Vi relaxar därför golvet nedåt i
 * steg om HCP_FILTER_STEP tills poolen har minst `minCount` items, annars
 * faller vi tillbaka på hela poolen. Returnerar den HÖGSTA (mest restriktiva)
 * golv-nivån som ger tillräckligt. Nettoeffekt: de svåraste (lägst Item-HCP)
 * items utesluts tills spelaren tjänat ner sitt HCP → gradvis upplåsning.
 *
 * Ren + generisk (enhetstestbar): items behöver bara ett `itemHcp`-fält
 * (saknas → behandlas som 100 = lättast = alltid med).
 */
export function filterByItemHcp<T extends { itemHcp?: number }>(
  pool: T[],
  playerHcp: number,
  minCount: number,
): T[] {
  if (pool.length <= minCount) return pool; // inget att vinna på att filtrera
  for (let floor = playerHcp; floor > HCP_MIN; floor -= HCP_FILTER_STEP) {
    const kept = pool.filter((q) => (q.itemHcp ?? 100) >= floor);
    if (kept.length >= minCount) return kept;
  }
  return pool; // ens ett lågt golv gav för få → använd hela poolen
}

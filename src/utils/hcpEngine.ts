/**
 * QuizVibe HCP Engine — ren kärna (typer + justeringslogik + display).
 *
 * Samma roll som epochAllocation.ts har mot epochLedger.ts: INGA
 * React/AsyncStorage-beroenden och ingen läsning av väggklockan internt
 * (Date/now injiceras som argument), så filen är fullt deterministisk och
 * enhetstestas i backend-vitest. Persistensen (per-spelare-store + guest-
 * fallback) bor i hcpProgress.ts.
 *
 * MODELL (Peters beslut 2026-08-28):
 *  • §1.1  Skala 1–99, 1 = elit, 99 = nybörjare. ALLA nya spelare startar
 *          på HCP 99 (assistance/ålder-baserat start är avfärdat).
 *  • §2.1  Ett glidande fönster per assistance-nivå (senaste 20 svaren).
 *          När fönstret är fullt: viktad summa S ≥ upper → HCP −1, S ≤ lower
 *          → HCP +1, annars 0. Max ±1 per spel. Kontinuerligt glidande (INGEN
 *          reset) — en konsekvent stark spelare sjunker 1/spel tills fönstret
 *          slutar korsa tröskeln (jämvikten kommer från svårighetsfiltret +
 *          §2.2-viktningen när Item-HCP landar).
 *  • §2.4  Inaktivitets-decay: +0.25 per hel 7-dagarsperiod utan spel.
 *
 * ⚠ EJ IMPLEMENTERAT ÄNNU (kräver Item-HCP = probability-bootstrap, egen fas):
 *  • §2.2  Viktad HCP-Impact — varje rätt svars bidrag till fönstret skalas
 *          av frågans HCP (lätt fråga < 1, sällsynt fråga upp till 2.0).
 *          Tills dess är bidraget rått: rätt = 1, fel = 0 (se appendToWindow).
 *  • §2.3  Host-override-belöning (snabbare earn-down när host satt HCP lågt).
 * Lägg inte till §2.2/§2.3 här förrän Item-HCP-datan finns på klienten.
 */
import type { AssistanceLevel } from './hcp';

// Sliding-window-state (§2.1): senaste svaren rätt/fel per assistance-nivå.
// `true` = rätt, `false` = fel. Äldst först; trimmas till HCP_WINDOW_SIZE.
export type HcpWindow = boolean[];

// Hela HCP-progressen för EN registrerad spelare. Persisteras device-lokalt
// per playerName (hcpProgress.ts, samma mönster som epochLedger.ts) — INTE i
// profiles-raden (se profileStorage.ts `hcp`-fältets kommentar). `hcp` lagras
// som flyttal (decay ger 0,25-steg); visningen avrundas uppåt (displayHcp).
export interface HcpProgress {
  hcp: number;
  windows: Record<AssistanceLevel, HcpWindow>;
  lastPlayedISO: string | null;
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

/** Tomt progress-objekt seedat på HCP_START (§1.1 — alla startar på 99). */
export function emptyHcpProgress(): HcpProgress {
  return {
    hcp: HCP_START,
    windows: { minimal: [], standard: [], full: [] },
    lastPlayedISO: null,
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
 * §2.1 — kör en avslutad spelomgång för EN spelare på EN assistance-nivå:
 * lägg in svaren i nivåns fönster, utvärdera, applicera max ±1, klampa [1,99],
 * stämpla lastPlayedISO. Rör bara den spelade nivåns fönster.
 */
export function applyGameResult(
  progress: HcpProgress,
  level: AssistanceLevel,
  answers: boolean[],
  nowISO: string,
): HcpProgress {
  const win = appendToWindow(progress.windows[level], answers);
  const delta = evaluateWindow(win, level);
  return {
    hcp: clampHcp(progress.hcp + delta),
    windows: { ...progress.windows, [level]: win },
    lastPlayedISO: nowISO,
  };
}

/**
 * §2.4 — inaktivitets-decay: +0.25 per HEL 7-dagarsperiod sedan senaste spel.
 * lastPlayedISO flyttas fram med periods×7d (INTE till `now`) så vecko-resten
 * bevaras och samma period aldrig räknas två gånger vid nästa load. No-op om
 * spelaren aldrig spelat (lastPlayedISO = null) eller < 1 vecka passerat.
 */
export function applyInactivityDecay(progress: HcpProgress, now: Date): HcpProgress {
  if (!progress.lastPlayedISO) return progress;
  const last = new Date(progress.lastPlayedISO).getTime();
  if (Number.isNaN(last)) return progress;
  const periods = Math.floor((now.getTime() - last) / WEEK_MS);
  if (periods < 1) return progress;
  return {
    ...progress,
    hcp: clampHcp(progress.hcp + 0.25 * periods),
    lastPlayedISO: new Date(last + periods * WEEK_MS).toISOString(),
  };
}

/**
 * Vilket HCP-tal en spelares sköld ska visa. Prefererar det sparade
 * (intjänade) värdet; faller annars tillbaka på HCP_START (§1.1 — alla
 * startar på 99). Alltid avrundat uppåt (displayHcp).
 */
export function resolveDisplayHcp(storedHcp: number | undefined | null): number {
  return displayHcp(typeof storedHcp === 'number' ? storedHcp : HCP_START);
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

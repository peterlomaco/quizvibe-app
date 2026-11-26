import type { AggregateGamePlayer } from './aggregateLeaderboard';
import type { GameMode } from './profileStorage';
import { getUserScope, scopedStorage, userKey } from './storageScope';
import type { PlayedMediaSource } from './mediaSource';

/**
 * Lokal lagring av spelresultat.
 * - "latestResult" innehåller ALLTID det senast avslutade spelet
 *   (används av Results-skärmen direkt efter quiz).
 * - "history" är en append-only-lista av minimala HistoryEntry-poster
 *   (datum/totalpoäng/snitt-poäng-per-fråga/snitt-svarstid) som driver
 *   Player history-sektionen på Profile.
 *
 * 2026-05-18: Player history förenklades till bara dessa fyra fält
 *   (tidigare visades HCP-progression, ranking, "highest scores" etc.
 *   som ingen riktig data fanns för). Migration-flaggan `HISTORY_RESET_KEY`
 *   wipe:ar historiken EN gång vid första load efter förenklingen så
 *   ingen ärvd stale-data ligger kvar från ev. tidigare history-pipelines
 *   som experimenterade med fler fält.
 *
 * 2026-05-22: **Per-user-namespacing** för history-nyckeln (samma mönster
 *   som friendsStorage/waitingInvites). Tidigare var `gameHistory/v1` en
 *   global nyckel → User A:s spel-historik syntes för User B vid logout/
 *   login på samma device. Nu lagras per `<playerName>` (lowercase):
 *   `@quizvibe/gameHistory/v1/<playerName>`. När backend kommer in byts
 *   detta mot user-id från auth-token. LATEST_KEY är fortsatt global —
 *   används bara direkt efter att en user just spelat, så scope-issue:n
 *   är begränsad till history-visningen.
 *   `HISTORY_PER_USER_RESET_KEY` wipe:ar all v1-history (legacy global +
 *   ev. per-user) vid första load post-fix så stale cross-user-data
 *   inte ärvs in i namespaced-strukturen.
 */

// Build 41: alla nycklar är per konto (project ref + Supabase-UUID). Gamla
// playerName-nycklade poster + reset-flaggorna rensas av storageTransition.
// Gäster (ingen registrerad session) skriver ingen history; deras
// latestResult hålls bara i minnet.
async function resolveScopedKey(store: string): Promise<string | null> {
  try {
    const scope = await getUserScope();
    return scope ? userKey(scope.uid, store) : null;
  } catch {
    return null;
  }
}

let sessionLatest: string | null = null;

export type AssistanceLevel = 'minimal' | 'standard' | 'full';

export interface RoundResult {
  questionNumber: number;
  category: string;
  question: string;
  correctYear: number;
  selectedYear: number;
  correct: boolean;
  points: number;
  timeUsed: number; // sekunder använda (30 - timeLeft när confirm)
}

export interface GameResult {
  id: string;
  date: string;            // ISO-datum
  totalPoints: number;
  rounds: RoundResult[];
  assistance: AssistanceLevel;
  hcpBefore: number;       // placeholder tills Fas 6 räknar riktigt
  hcpAfter: number;        // dito
}

// Dual-read mapping för results sparade innan rename
// (skill: 'easy' | 'intermediate' | 'expert' → assistance: 'full' | 'standard' | 'minimal').
const LEGACY_SKILL_TO_ASSISTANCE: Record<string, AssistanceLevel> = {
  easy: 'full',
  intermediate: 'standard',
  expert: 'minimal',
};

export async function saveLatestResult(result: GameResult): Promise<void> {
  try {
    const key = await resolveScopedKey('latestResult');
    if (!key) {
      sessionLatest = JSON.stringify(result);
      return;
    }
    await scopedStorage.setItem(key, JSON.stringify(result));
  } catch (err) {
    console.warn('[gameResults] Failed to save latest result:', err);
    throw err;
  }
}

export async function loadLatestResult(): Promise<GameResult | null> {
  try {
    const key = await resolveScopedKey('latestResult');
    const json = key ? await scopedStorage.getItem(key) : sessionLatest;
    if (!json) return null;
    const raw = JSON.parse(json) as Partial<GameResult> & { skill?: string };
    // Migrera result sparade när fältet hette `skill` med värdena
    // easy/intermediate/expert → nya `assistance` med full/standard/minimal.
    if (raw.assistance === undefined && typeof raw.skill === 'string') {
      const mapped = LEGACY_SKILL_TO_ASSISTANCE[raw.skill];
      if (mapped) raw.assistance = mapped;
      delete raw.skill;
    }
    return raw as GameResult;
  } catch (err) {
    console.warn('[gameResults] Failed to load latest result:', err);
    return null;
  }
}

export async function clearLatestResult(): Promise<void> {
  try {
    sessionLatest = null;
    const key = await resolveScopedKey('latestResult');
    if (key) await scopedStorage.removeItem(key);
  } catch (err) {
    console.warn('[gameResults] Failed to clear latest result:', err);
  }
}

// ─── Game history (Player history-sektionen) ─────────────────────────────────

/**
 * En post per avslutat spel. Innehåller både resultat-data (korrekthet,
 * svarstid) och game-time-settings (age, assistance, era) så Player
 * history visar full kontext för varje spel.
 *
 * 2026-05-22 v2: bytte totalPoints/avgPointsPerQuestion → correctAnswers/
 *   totalQuestions för korrekthetsgrad-display.
 * 2026-05-22 v3: lade till age/assistance/eraFrom/eraTo (frozen vid game-
 *   time så history visar de faktiska inställningarna vid speltillfället,
 *   inte aktuella profil-värden). `HISTORY_V3_RESET_KEY` wipe:ar
 *   pre-shape-entries vid första load post-fix.
 * 2026-05-25 v4: lade till selectedExtraPackages/youtubeEnabled/imagesEnabled
 *   så Player history visar vilket paket (Generic eller themed) spelet
 *   kördes med + vilka mediekällor (YouTube/Images) som var aktiva.
 *   `HISTORY_V4_RESET_KEY` wipe:ar pre-shape-entries.
 * 2026-08-26 v5: ersatte youtubeEnabled/imagesEnabled → `sources` (källor som
 *   FAKTISKT serverades). Booleanerna speglade host:s toggle-läge, och
 *   `imagesEnabled` var dessutom hårdkodad `true` i quiz.tsx — varje rad
 *   påstod "Images". Toggle-läget duger inte som underlag: Hints-kvoten är
 *   floor(N/4), så 2-3 rundor med Hints påslaget serverar noll Hints-frågor.
 *   `HISTORY_V5_RESET_KEY` wipe:ar pre-shape-entries.
 */
export interface HistoryEntry {
  id: string;
  date: string;             // ISO-datum-sträng (UTC)
  correctAnswers: number;   // antal rätta svar
  totalQuestions: number;   // totala frågor i spelet (rounds.length)
  avgResponseSeconds: number;     // mean av timeUsed över alla rundor
  age: number;              // spelarens ålder vid speltillfället (currentYear - birthYear)
  assistance: AssistanceLevel;    // assistance vid speltillfället
  eraFrom: number;          // Game Era from (host:s val vid speltillfället)
  eraTo: number;            // Game Era to (host:s val vid speltillfället)
  /** Theme package-IDs som host hade aktiverade vid speltillfället. Tom
   *  array = Generic (inga extra paket). När themed packages aktiveras i
   *  v1.1+ kommer detta innehålla ID:n från PURCHASED_PACKAGES. */
  selectedExtraPackages: string[];
  /** Källor som FAKTISKT serverades i spelet, i kanonisk ordning
   *  (Spotify → YouTube → Hints). Härleds ur mediesekvensen vid game-
   *  completion — INTE ur lobby-togglarna: Hints-kvoten är floor(N/4), så
   *  ett 2-3-rundors spel med Hints påslaget serverar noll Hints-frågor och
   *  ska inte märkas "Hints". Tom array = ingen media alls (bör inte hända). */
  sources: PlayedMediaSource[];
  /** Spelformen (spelläget) vid speltillfället — driver spelform-grupperingen
   *  i Player history (resolveGameForm i historyGrouping.ts). ALLA tre fält
   *  nedan är OPTIONAL med flit: poster skrivna innan detta fält lades till
   *  (2026-08-29) saknar dem och grupperas under "Unknown mode" / "Unknown
   *  host" — additivt, ingen HISTORY_Vx_RESET (som skulle wipe:a historiken). */
  gameMode?: GameMode;
  /** True = single player (flagga ovanpå gameMode). Se resolveGameForm. */
  singlePlayerDefault?: boolean;
  /** Host:ens namn vid speltillfället (turnOrder[0].name). För egna hostade
   *  spel = eget playerName; i PtP-spectator-läget = host:ens namn. */
  hostName?: string;
  /** ALLA spelares rader för spelet — samma AggregateGamePlayer-form som en
   *  marathon-games `stats`, byggd ur gamePlayers + allRoundScoresHistory vid
   *  game-completion (2026-09-11). Gör varje spel till ett tappbart final-
   *  leaderboard-kort (via buildAggregateStandings → finalizeRows →
   *  LeaderboardTable, exakt samma väg som SavedAggregatesCard). Antal spelare
   *  = players.length. OPTIONAL med flit: poster skrivna FÖRE detta fält
   *  saknar det → Player history filtrerar bort dem (de kan inte visa en
   *  leaderboard). Additivt — ingen HISTORY_Vx_RESET. */
  players?: AggregateGamePlayer[];
}

/** Kontots history-nyckel. null = ingen registrerad session → tom lista / no-op. */
function resolveHistoryKey(): Promise<string | null> {
  return resolveScopedKey('gameHistory');
}

export async function loadGameHistory(): Promise<HistoryEntry[]> {
  try {
    const key = await resolveHistoryKey();
    if (!key) return [];
    const json = await scopedStorage.getItem(key);
    if (!json) return [];
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed as HistoryEntry[];
  } catch (err) {
    console.warn('[gameResults] Failed to load history:', err);
    return [];
  }
}

export async function appendGameHistoryEntry(entry: HistoryEntry): Promise<void> {
  try {
    const key = await resolveHistoryKey();
    if (!key) {
      console.warn('[gameResults] appendGameHistoryEntry called without active profile — no-op');
      return;
    }
    const existing = await loadGameHistory();
    const next = [...existing, entry];
    await scopedStorage.setItem(key, JSON.stringify(next));
  } catch (err) {
    console.warn('[gameResults] Failed to append history entry:', err);
  }
}

/**
 * Raderar EN spel-post ur den inloggade spelarens lokala history (tap på
 * Delete i ett spels final-leaderboard). Per-device/per-user — historiken är
 * redan namespacead per playerName, så motståndarnas egna devices behåller
 * spelet. Om spelet ingick i en marathon är den serien (server) oberörd.
 */
export async function deleteGameHistoryEntry(id: string): Promise<void> {
  try {
    const key = await resolveHistoryKey();
    if (!key) return;
    const existing = await loadGameHistory();
    const next = existing.filter((e) => e.id !== id);
    await scopedStorage.setItem(key, JSON.stringify(next));
  } catch (err) {
    console.warn('[gameResults] Failed to delete history entry:', err);
  }
}

export async function clearGameHistory(): Promise<void> {
  try {
    const key = await resolveHistoryKey();
    if (!key) return;
    await scopedStorage.removeItem(key);
  } catch (err) {
    console.warn('[gameResults] Failed to clear history:', err);
  }
}

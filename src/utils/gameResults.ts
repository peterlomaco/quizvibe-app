import AsyncStorage from '@react-native-async-storage/async-storage';

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
 */

const LATEST_KEY = '@quizvibe/latestResult/v1';
const HISTORY_KEY = '@quizvibe/gameHistory/v1';
const HISTORY_RESET_KEY = '@quizvibe/migration/historyReset/v1';

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
    await AsyncStorage.setItem(LATEST_KEY, JSON.stringify(result));
  } catch (err) {
    console.warn('[gameResults] Failed to save latest result:', err);
    throw err;
  }
}

export async function loadLatestResult(): Promise<GameResult | null> {
  try {
    const json = await AsyncStorage.getItem(LATEST_KEY);
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
    await AsyncStorage.removeItem(LATEST_KEY);
  } catch (err) {
    console.warn('[gameResults] Failed to clear latest result:', err);
  }
}

// ─── Game history (Player history-sektionen) ─────────────────────────────────

/**
 * En minimal post per avslutat spel. Bara de fält som visas i Player
 * history-sektionen idag — datum, totalpoäng, snittpoäng/fråga, snitt-svarstid.
 * Avsiktligt liten så framtida tillägg blir explicita (lägg till ett fält
 * när Player history visar det, inte tvärtom).
 */
export interface HistoryEntry {
  id: string;
  date: string;             // ISO-datum-sträng (UTC)
  totalPoints: number;
  avgPointsPerQuestion: number;   // totalPoints / antal frågor
  avgResponseSeconds: number;     // mean av timeUsed över alla rundor
}

/**
 * One-shot migration: vid första load efter förenklingen (2026-05-18) wipe:ar
 * vi hela history-arrayen. Skyddar mot ärvd stale-data om någon tidigare
 * pipeline experimenterade med fler fält. Idempotent — `HISTORY_RESET_KEY`
 * sätts till '1' efter första körningen så reset:n bara körs en gång per
 * device. När backend-history kommer in kan denna helper tas bort.
 */
async function ensureHistoryReset(): Promise<void> {
  try {
    const flag = await AsyncStorage.getItem(HISTORY_RESET_KEY);
    if (flag === '1') return;
    await AsyncStorage.removeItem(HISTORY_KEY);
    await AsyncStorage.setItem(HISTORY_RESET_KEY, '1');
  } catch (err) {
    console.warn('[gameResults] history reset failed:', err);
  }
}

export async function loadGameHistory(): Promise<HistoryEntry[]> {
  await ensureHistoryReset();
  try {
    const json = await AsyncStorage.getItem(HISTORY_KEY);
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
  await ensureHistoryReset();
  try {
    const existing = await loadGameHistory();
    const next = [...existing, entry];
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch (err) {
    console.warn('[gameResults] Failed to append history entry:', err);
  }
}

export async function clearGameHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (err) {
    console.warn('[gameResults] Failed to clear history:', err);
  }
}

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Lokal lagring av spelresultat.
 * - "latestResult" innehåller ALLTID det senast avslutade spelet
 *   (används av Results-skärmen direkt efter quiz).
 * - I Fas 5 utökar vi med en full history-array för Player History-sektionen.
 */

const LATEST_KEY = '@quizvibe/latestResult/v1';

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

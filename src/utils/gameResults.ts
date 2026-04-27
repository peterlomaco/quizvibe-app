import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Lokal lagring av spelresultat.
 * - "latestResult" innehåller ALLTID det senast avslutade spelet
 *   (används av Results-skärmen direkt efter quiz).
 * - I Fas 5 utökar vi med en full history-array för Player History-sektionen.
 */

const LATEST_KEY = '@quizvibe/latestResult/v1';

export type SkillLevel = 'easy' | 'intermediate' | 'expert';

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
  skill: SkillLevel;
  hcpBefore: number;       // placeholder tills Fas 6 räknar riktigt
  hcpAfter: number;        // dito
}

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
    return JSON.parse(json) as GameResult;
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

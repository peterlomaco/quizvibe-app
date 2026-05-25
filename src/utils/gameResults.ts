import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadProfile } from './profileStorage';

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

const LATEST_KEY = '@quizvibe/latestResult/v1';
const HISTORY_KEY_PREFIX = '@quizvibe/gameHistory/v1/';
const HISTORY_LEGACY_GLOBAL_KEY = '@quizvibe/gameHistory/v1';
const HISTORY_RESET_KEY = '@quizvibe/migration/historyReset/v1';
const HISTORY_PER_USER_RESET_KEY = '@quizvibe/migration/historyPerUserReset/v1';
// V2-reset: wipe:ar gamla totalPoints/avgPointsPerQuestion-entries vid
// första load efter shape-bytet 2026-05-22 (correctAnswers/totalQuestions).
const HISTORY_V2_RESET_KEY = '@quizvibe/migration/historyV2Reset/v1';
// V3-reset: wipe:ar pre-age/assistance/era-entries vid första load efter
// shape-utökningen 2026-05-22 (samma dag som v2 men annan flagga så
// migrationen är distinkt).
const HISTORY_V3_RESET_KEY = '@quizvibe/migration/historyV3Reset/v1';
// V4-reset: wipe:ar pre-packages/sources-entries vid första load efter
// shape-utökningen 2026-05-25 (selectedExtraPackages + youtubeEnabled +
// imagesEnabled). Distinkt flagga så migrationen kan rullas oberoende.
const HISTORY_V4_RESET_KEY = '@quizvibe/migration/historyV4Reset/v1';

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
  /** YouTube-källan aktiv vid speltillfället (host:s Game Connections-val). */
  youtubeEnabled: boolean;
  /** Images-källan aktiv vid speltillfället (host:s Game Connections-val). */
  imagesEnabled: boolean;
}

/**
 * Returnerar AsyncStorage-nyckeln för inloggade user:s history.
 * null = ingen profil laddad → caller bör returnera tom lista / no-op:a save.
 */
async function resolveHistoryKey(): Promise<string | null> {
  const profile = await loadProfile();
  if (!profile?.playerName) return null;
  return `${HISTORY_KEY_PREFIX}${profile.playerName.toLowerCase()}`;
}

/**
 * One-shot reset av all v1-history-data. Wipe:ar BÅDE legacy global key
 * (pre-per-user-namespacing) OCH alla per-user-keys (i fall någon tidigare
 * implementering claim:ade legacy global → first-user-on-device). Sätter
 * `HISTORY_PER_USER_RESET_KEY` så reset:en bara körs en gång per device.
 * Alla startar tomma — användarna får börja om history från noll.
 * Idempotent — säkert att anropa flera gånger.
 *
 * (Legacy `HISTORY_RESET_KEY` från 2026-05-18-förenklingen lämnas orörd —
 * den var per-device-wipe under den globala-nyckel-eran och är inte
 * relevant för per-user-namespacing-migrationen.)
 */
async function ensureHistoryReset(): Promise<void> {
  try {
    // ALLA reset-flaggor (per-user, v2, v3, v4) måste vara satta — annars
    // wipe:a och sätt samtliga. Multi-flag-check så successiva shape-
    // ändringar var sin triggar wipe utan att räkningarna kollideras.
    const perUserFlag = await AsyncStorage.getItem(HISTORY_PER_USER_RESET_KEY);
    const v2Flag = await AsyncStorage.getItem(HISTORY_V2_RESET_KEY);
    const v3Flag = await AsyncStorage.getItem(HISTORY_V3_RESET_KEY);
    const v4Flag = await AsyncStorage.getItem(HISTORY_V4_RESET_KEY);
    if (perUserFlag === '1' && v2Flag === '1' && v3Flag === '1' && v4Flag === '1') return;
    const allKeys = await AsyncStorage.getAllKeys();
    const historyKeys = allKeys.filter(
      (k) =>
        k === HISTORY_LEGACY_GLOBAL_KEY ||
        k.startsWith(HISTORY_KEY_PREFIX),
    );
    if (historyKeys.length > 0) {
      await AsyncStorage.multiRemove(historyKeys);
    }
    await AsyncStorage.setItem(HISTORY_PER_USER_RESET_KEY, '1');
    await AsyncStorage.setItem(HISTORY_V2_RESET_KEY, '1');
    await AsyncStorage.setItem(HISTORY_V3_RESET_KEY, '1');
    await AsyncStorage.setItem(HISTORY_V4_RESET_KEY, '1');
    // Sätt även den äldre reset-flaggan så ensureHistoryReset i den
    // tidigare pre-namespacing-versionen aldrig fyrar igen om koden
    // skulle rullas tillbaka.
    await AsyncStorage.setItem(HISTORY_RESET_KEY, '1');
  } catch (err) {
    console.warn('[gameResults] history reset failed:', err);
  }
}

export async function loadGameHistory(): Promise<HistoryEntry[]> {
  await ensureHistoryReset();
  try {
    const key = await resolveHistoryKey();
    if (!key) return [];
    const json = await AsyncStorage.getItem(key);
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
    const key = await resolveHistoryKey();
    if (!key) {
      console.warn('[gameResults] appendGameHistoryEntry called without active profile — no-op');
      return;
    }
    const existing = await loadGameHistory();
    const next = [...existing, entry];
    await AsyncStorage.setItem(key, JSON.stringify(next));
  } catch (err) {
    console.warn('[gameResults] Failed to append history entry:', err);
  }
}

export async function clearGameHistory(): Promise<void> {
  try {
    const key = await resolveHistoryKey();
    if (!key) return;
    await AsyncStorage.removeItem(key);
  } catch (err) {
    console.warn('[gameResults] Failed to clear history:', err);
  }
}

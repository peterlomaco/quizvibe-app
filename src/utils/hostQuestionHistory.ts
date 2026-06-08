import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadProfile } from './profileStorage';

// Lagrar vilka fråge-IDs en Host har sett i tidigare spelomgångar,
// per spelarkonto (playerName). Används av quiz.tsx för att prioritera
// osedda frågor i varje ny omgång — sedda frågor visas bara när
// de osedda är uttömda inom de aktiva filter-inställningarna.
//
// V2: session-baserad lagring med rullande 20-sessions fönster.
// Varje session är en spelomgång (alla frågor i en hel quiz-körning).
// Äldre sessioner faller automatiskt ur fönstret när nya läggs till.
// Migration: v1 (flat Set<string>) läses vid första load och importeras
// som en enda syntetisk session.

const SEEN_KEY_PREFIX = '@quizvibe/seenQuestionIds/v1/';
const SESSION_KEY_PREFIX = '@quizvibe/seenQuestionIds/v2/';
const MAX_SESSIONS = 20;

interface SessionRecord {
  id: string;     // timestamp-sträng, unik per session
  qIds: string[]; // alla fråge-IDs som spelades i sessionen
}

interface SessionHistory {
  sessions: SessionRecord[];
}

async function resolveKey(prefix: string): Promise<string | null> {
  try {
    const profile = await loadProfile();
    if (!profile?.playerName) return null;
    return `${prefix}${profile.playerName.toLowerCase()}`;
  } catch {
    return null;
  }
}

// Läs v2-historik, med migration från v1 om v2 saknas.
async function loadSessionHistory(): Promise<SessionHistory> {
  try {
    const v2Key = await resolveKey(SESSION_KEY_PREFIX);
    if (!v2Key) return { sessions: [] };

    const raw = await AsyncStorage.getItem(v2Key);
    if (raw) {
      return JSON.parse(raw) as SessionHistory;
    }

    // Migration: importera v1 flat Set som en syntetisk session
    const v1Key = await resolveKey(SEEN_KEY_PREFIX);
    if (v1Key) {
      const v1Raw = await AsyncStorage.getItem(v1Key);
      if (v1Raw) {
        const ids: string[] = JSON.parse(v1Raw);
        if (ids.length > 0) {
          const history: SessionHistory = {
            sessions: [{ id: 'v1-migration', qIds: ids }],
          };
          await AsyncStorage.setItem(v2Key, JSON.stringify(history));
          return history;
        }
      }
    }

    return { sessions: [] };
  } catch {
    return { sessions: [] };
  }
}

// Returnerar alla fråge-IDs från de senaste MAX_SESSIONS sessionerna som ett Set.
export async function loadSeenQuestionIds(): Promise<Set<string>> {
  try {
    const history = await loadSessionHistory();
    const allIds = history.sessions.flatMap((s) => s.qIds);
    return new Set<string>(allIds);
  } catch {
    return new Set();
  }
}

// Sparar en ny spelomgång. Håller max MAX_SESSIONS sessioner (äldsta tas bort).
export async function addSessionRecord(qIds: string[]): Promise<void> {
  if (!qIds.length) return;
  try {
    const v2Key = await resolveKey(SESSION_KEY_PREFIX);
    if (!v2Key) return;

    const history = await loadSessionHistory();
    const newSession: SessionRecord = {
      id: String(Date.now()),
      qIds: [...new Set(qIds)], // dedupera inom sessionen
    };

    const sessions = [...history.sessions, newSession];
    // Håll fönstret — ta bort äldsta om för många
    const trimmed = sessions.slice(-MAX_SESSIONS);

    await AsyncStorage.setItem(v2Key, JSON.stringify({ sessions: trimmed }));
  } catch {}
}

// Bakåtkompatibel wrapper — anropas från quiz.tsx:s äldre callsites.
// Skapar en ny session-post av de givna IDs.
export async function addSeenQuestionIds(ids: string[]): Promise<void> {
  return addSessionRecord(ids);
}

// Rensar BÅDE v1 och v2 för inloggad användare.
export async function clearSeenQuestionIds(): Promise<void> {
  try {
    const [v1Key, v2Key] = await Promise.all([
      resolveKey(SEEN_KEY_PREFIX),
      resolveKey(SESSION_KEY_PREFIX),
    ]);
    const keys = [v1Key, v2Key].filter(Boolean) as string[];
    if (keys.length > 0) await AsyncStorage.multiRemove(keys);
  } catch {}
}

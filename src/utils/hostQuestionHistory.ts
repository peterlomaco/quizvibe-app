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

// Läs v2-historik för explicita nycklar, med migration från v1 om v2 saknas.
async function loadHistoryForKeys(
  v2Key: string,
  v1Key: string | null,
): Promise<SessionHistory> {
  try {
    const raw = await AsyncStorage.getItem(v2Key);
    if (raw) {
      return JSON.parse(raw) as SessionHistory;
    }

    // Migration: importera v1 flat Set som en syntetisk session
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

// Läs v2-historik för inloggade profilen.
async function loadSessionHistory(): Promise<SessionHistory> {
  const v2Key = await resolveKey(SESSION_KEY_PREFIX);
  if (!v2Key) return { sessions: [] };
  const v1Key = await resolveKey(SEEN_KEY_PREFIX);
  return loadHistoryForKeys(v2Key, v1Key);
}

// Session-append under en explicit v2-nyckel. Delas av addSessionRecord
// (profil-baserad) och addSessionRecordForNames (explicita playerNames).
async function appendSessionForKey(
  v2Key: string,
  v1Key: string | null,
  qIds: string[],
): Promise<void> {
  try {
    const history = await loadHistoryForKeys(v2Key, v1Key);
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

// Returnerar IDs enbart från den SENASTE sessionen.
// Används som "hård exkludering" i buildEpochPhase — frågor från förra spelet
// visas i princip aldrig direkt igen (om poolen tillåter det).
export async function loadLastSessionIds(): Promise<Set<string>> {
  try {
    const history = await loadSessionHistory();
    if (history.sessions.length === 0) return new Set();
    const last = history.sessions[history.sessions.length - 1];
    return new Set<string>(last.qIds);
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
    const v1Key = await resolveKey(SEEN_KEY_PREFIX);
    await appendSessionForKey(v2Key, v1Key, qIds);
  } catch {}
}

// Sparar en spelomgång under EXPLICITA playerName-nycklar (Pass-the-Phone:
// alla registrerade deltagare delar host-enheten, men resolveKey ser bara
// den inloggade profilen). Skriver `@quizvibe/seenQuestionIds/v2/<name>` för
// varje namn så deltagarnas historik finns på enheten om de senare loggar
// in/hostar där. Inloggade profilens eget namn hoppas över — det skrivs
// redan av addSessionRecord (dubbelskrivning skulle konsumera två av de
// 20 sessions-slotten för samma spel).
export async function addSessionRecordForNames(
  names: string[],
  qIds: string[],
): Promise<void> {
  if (!qIds.length || !names.length) return;
  try {
    let ownName: string | null = null;
    try {
      const profile = await loadProfile();
      ownName = profile?.playerName?.toLowerCase() ?? null;
    } catch {}
    const unique = [
      ...new Set(
        names
          .map((n) => n.trim().toLowerCase())
          .filter((n) => n.length > 0 && n !== ownName),
      ),
    ];
    await Promise.all(
      unique.map((n) =>
        appendSessionForKey(`${SESSION_KEY_PREFIX}${n}`, `${SEEN_KEY_PREFIX}${n}`, qIds),
      ),
    );
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

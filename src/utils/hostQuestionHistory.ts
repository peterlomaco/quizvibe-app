import { getUserScope, scopedStorage, userKey } from './storageScope';

// Lagrar vilka fråge-IDs en Host har sett i tidigare spelomgångar, per konto
// (project ref + Supabase-UUID sedan Build 41). Används av quiz.tsx för att
// prioritera osedda frågor i varje ny omgång.
//
// Session-baserad lagring med rullande 20-sessions fönster. Varje session är
// en spelomgång. Äldre playerName-nycklade v1/v2-poster rensas av
// storageTransition — de importeras inte (ägarskapet kan inte verifieras).
//
// Historiken skrivs ENBART för den inloggade spelaren på den här enheten.
// Medspelare i Pass-the-Phone får ingen lokal historik under sitt namn
// (Build 41: inga lokala skrivningar under en annan spelares identitet).

const MAX_SESSIONS = 20;

interface SessionRecord {
  id: string;     // timestamp-sträng, unik per session
  qIds: string[]; // alla fråge-IDs som spelades i sessionen
}

interface SessionHistory {
  sessions: SessionRecord[];
}

async function resolveKey(): Promise<string | null> {
  try {
    const scope = await getUserScope();
    return scope ? userKey(scope.uid, 'seenQuestionIds') : null;
  } catch {
    return null;
  }
}

async function loadHistoryForKey(key: string): Promise<SessionHistory> {
  try {
    const raw = await scopedStorage.getItem(key);
    if (!raw) return { sessions: [] };
    const parsed = JSON.parse(raw) as SessionHistory;
    return Array.isArray(parsed?.sessions) ? parsed : { sessions: [] };
  } catch {
    return { sessions: [] };
  }
}

// Gäster (ingen registrerad session) får en sessions-lokal historik så att
// t.ex. Play Again i ett gäst-hostat spel inte serverar om exakt samma frågor.
// Försvinner vid app-omstart — avsiktligt, gästdata ska inte persisteras.
let sessionHistory: SessionHistory = { sessions: [] };

async function loadSessionHistory(): Promise<SessionHistory> {
  const key = await resolveKey();
  if (!key) return { sessions: sessionHistory.sessions };
  return loadHistoryForKey(key);
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
  const newSession: SessionRecord = { id: String(Date.now()), qIds: [...new Set(qIds)] };
  try {
    const key = await resolveKey();
    if (!key) {
      sessionHistory = { sessions: [...sessionHistory.sessions, newSession].slice(-MAX_SESSIONS) };
      return;
    }
    const history = await loadHistoryForKey(key);
    const trimmed = [...history.sessions, newSession].slice(-MAX_SESSIONS);
    await scopedStorage.setItem(key, JSON.stringify({ sessions: trimmed }));
  } catch {}
}

// Bakåtkompatibel wrapper — anropas från quiz.tsx:s äldre callsites.
export async function addSeenQuestionIds(ids: string[]): Promise<void> {
  return addSessionRecord(ids);
}

// Rensar historiken för inloggad användare (och gästens sessions-historik).
export async function clearSeenQuestionIds(): Promise<void> {
  sessionHistory = { sessions: [] };
  try {
    const key = await resolveKey();
    if (key) await scopedStorage.removeItem(key);
  } catch {}
}

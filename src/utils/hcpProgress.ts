import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AssistanceLevel } from './hcp';
import {
  applyGameResult,
  applyInactivityDecay,
  displayHcp,
  emptyHcpProgress,
  HCP_START,
  type HcpProgress,
} from './hcpEngine';
import { loadProfile, saveProfile } from './profileStorage';

// Persistens för HCP-progressen, per registrerad spelare (playerName).
// Räknekärnan (applyGameResult / applyInactivityDecay / display) bor i
// hcpEngine.ts eftersom den är ren och enhetstestas utan React/AsyncStorage —
// den här filen sköter bara läsning/skrivning + profil-spegling.
//
// Nyckel per playerName (samma mönster som hostQuestionHistory.ts) så att
// Pass-the-Phone kan uppdatera VARJE registrerad deltagares progress på den
// delade enheten (recordGameResultForName). Den inloggade spelarens värde
// speglas dessutom till profile.hcp för synkron UI-läsning (sköldarna).

const HCP_KEY_PREFIX = '@quizvibe/hcpProgress/v1/';

// Guest / ingen sparad profil → sessions-lokal progress (som epochLedger:s
// sessionDebt). Försvinner vid app-omstart; gäster persisteras aldrig.
let sessionProgress: HcpProgress | null = null;

function keyFor(playerName: string): string {
  return `${HCP_KEY_PREFIX}${playerName.trim().toLowerCase()}`;
}

async function resolveOwnKey(): Promise<string | null> {
  try {
    const profile = await loadProfile();
    if (!profile?.playerName) return null;
    return keyFor(profile.playerName);
  } catch {
    return null;
  }
}

// Defensiv parse — säkerställ fönster-strukturen även om lagrad data är gammal.
function coerce(raw: unknown): HcpProgress {
  const p = (raw ?? {}) as Partial<HcpProgress>;
  const w = (p.windows ?? {}) as Partial<HcpProgress['windows']>;
  return {
    hcp: typeof p.hcp === 'number' ? p.hcp : HCP_START,
    windows: {
      minimal: Array.isArray(w.minimal) ? w.minimal : [],
      standard: Array.isArray(w.standard) ? w.standard : [],
      full: Array.isArray(w.full) ? w.full : [],
    },
    lastPlayedISO: typeof p.lastPlayedISO === 'string' ? p.lastPlayedISO : null,
  };
}

async function readByKey(key: string | null): Promise<HcpProgress> {
  if (!key) return sessionProgress ? { ...sessionProgress } : emptyHcpProgress();
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return emptyHcpProgress();
    return coerce(JSON.parse(raw));
  } catch {
    return emptyHcpProgress();
  }
}

async function writeByKey(key: string | null, progress: HcpProgress): Promise<void> {
  if (!key) {
    sessionProgress = progress;
    return;
  }
  try {
    await AsyncStorage.setItem(key, JSON.stringify(progress));
  } catch {}
}

// Speglar det inloggade spelarens HCP (flyttal) till profile.hcp så sköldarna
// kan läsa det synkront via getCachedProfile(). Best-effort — kastar aldrig.
async function mirrorToProfile(hcp: number): Promise<void> {
  try {
    const profile = await loadProfile();
    if (profile) await saveProfile({ ...profile, hcp });
  } catch {}
}

/**
 * §2.4 — kör inaktivitets-decay för den inloggade spelaren och spegla ev.
 * ändring till profile.hcp så skölden reflekterar decayen redan vid app-open,
 * innan spelaren spelat. No-op för gäster + när < 1 vecka passerat.
 */
export async function refreshOwnHcpDecay(now: Date = new Date()): Promise<void> {
  const key = await resolveOwnKey();
  if (!key) return; // gäster har ingen persisterad progress att decay:a
  const current = await readByKey(key);
  const decayed = applyInactivityDecay(current, now);
  if (decayed.hcp !== current.hcp || decayed.lastPlayedISO !== current.lastPlayedISO) {
    await writeByKey(key, decayed);
    await mirrorToProfile(decayed.hcp);
  }
}

/**
 * §2.1 — kör en avslutad spelomgång för den INLOGGADE spelaren (self) på den
 * spelade assistance-nivån. Applicerar decay först (fångar ev. inaktivitet),
 * sedan fönster-justeringen, sparar och speglar till profile.hcp. Returnerar
 * display-HCP före/efter (avrundat uppåt) för leaderboard-deltat (§5).
 */
export async function recordSelfGameResult(
  level: AssistanceLevel,
  answers: boolean[],
  now: Date = new Date(),
): Promise<{ before: number; after: number }> {
  const key = await resolveOwnKey();
  const decayed = applyInactivityDecay(await readByKey(key), now);
  const before = displayHcp(decayed.hcp);
  const next = applyGameResult(decayed, level, answers, now.toISOString());
  await writeByKey(key, next);
  await mirrorToProfile(next.hcp);
  return { before, after: displayHcp(next.hcp) };
}

/**
 * §2.1 — samma som recordSelfGameResult men för en NAMNGIVEN deltagare på en
 * delad enhet (Pass-the-Phone). Speglar INTE till profile.hcp (det är inte
 * denna enhets inloggade spelare). Returnerar display-HCP före/efter.
 */
export async function recordGameResultForName(
  playerName: string,
  level: AssistanceLevel,
  answers: boolean[],
  now: Date = new Date(),
): Promise<{ before: number; after: number }> {
  const key = keyFor(playerName);
  const decayed = applyInactivityDecay(await readByKey(key), now);
  const before = displayHcp(decayed.hcp);
  const next = applyGameResult(decayed, level, answers, now.toISOString());
  await writeByKey(key, next);
  return { before, after: displayHcp(next.hcp) };
}

/** Rensar den inloggade spelarens persisterade progress (+ sessionen). */
export async function clearOwnHcpProgress(): Promise<void> {
  sessionProgress = null;
  try {
    const key = await resolveOwnKey();
    if (key) await AsyncStorage.removeItem(key);
  } catch {}
}

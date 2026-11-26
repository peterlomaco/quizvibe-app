import type { AssistanceLevel } from './hcp';
import {
  applyGameResult,
  applyInactivityDecay,
  coerceContribution,
  displayHcp,
  emptyCategoryProgress,
  emptyHcpProgress,
  HCP_START,
  HCP_WINDOW_SIZE,
  totalHcp,
  type HcpContribution,
  type HcpProgress,
} from './hcpEngine';
import type { MainCategory } from './mainCategory';
import { loadProfile, saveProfile } from './profileStorage';
import { getUserScope, scopedStorage, userKey } from './storageScope';

// Persistens för HCP-progressen, per konto (project ref + Supabase-UUID sedan
// Build 41) OCH per region scope (§1.3). Räknekärnan (applyGameResult /
// applyInactivityDecay / display) bor i hcpEngine.ts — den här filen sköter
// bara läsning/skrivning + spegling.
//
// Nyckel per (konto, region) så en spelare som byter till en region scope de
// aldrig spelat börjar på 99. Den inloggade spelarens värde speglas till
// profile.hcp (+ profile.hcpByCategory) för synkron UI-läsning (sköldarna).
//
// Pass-the-Phone-medspelare: progressen lagras HOST-SCOPED under värdens konto,
// nycklad på medspelarens lobby-user_id (aldrig på namn), och adopteras aldrig
// av medspelarens eget konto. Medspelare utan user_id (gäster) får bara en
// sessions-lokal progress. Äldre playerName-nycklade v1/v2-poster rensas av
// storageTransition.

// Bundle av display-heltal (avrundade uppåt) för sköldarna (Total + Music + Film).
export interface HcpBundle {
  total: number;
  music: number;
  film: number;
}

// Svar bucketade per kategori (från quiz-slutet). Kategorier utan svar utelämnas.
// Ett bidrag per svar: boolean (rätt/fel) ELLER ett tal (viktat, t.ex. 0.5 för en
// lätt Spotify/Name-rätt = halv HCP-effekt). coercas till number i motorn.
export type CategoryAnswers = Partial<Record<MainCategory, HcpContribution[]>>;

// Guest / ingen sparad profil → sessions-lokal progress per region (som
// epochLedger:s sessionDebt). Försvinner vid app-omstart; gäster persisteras aldrig.
const sessionProgress = new Map<string, HcpProgress>();

function ownStore(region: string): string {
  return `hcp/${region}`;
}

async function resolveOwnKey(region: string): Promise<string | null> {
  try {
    const scope = await getUserScope();
    return scope ? userKey(scope.uid, ownStore(region)) : null;
  } catch {
    return null;
  }
}

// Host-scoped nyckel för en PtP-medspelare (lobby-user_id). null om värden
// saknar registrerad session eller medspelaren saknar user_id.
async function resolvePeerKey(peerUserId: string | null, region: string): Promise<string | null> {
  if (!peerUserId) return null;
  try {
    const scope = await getUserScope();
    if (!scope || scope.uid === peerUserId) return null;
    return userKey(scope.uid, `ptpPeers/${peerUserId}/hcp/${region}`);
  } catch {
    return null;
  }
}

// Defensiv parse — säkerställ kategori-strukturen även om lagrad data är gammal.
// Fönstren trimmas till senaste HCP_WINDOW_SIZE vid läsning så befintliga
// spelares gamla 20-långa fönster inte utvärderas mot de nya 10-fönster-
// trösklarna på nästa spel (skulle avfyra ETT översstort delta). Självläkande.
// Trimma + normalisera till number[]. Äldre boolean-fönster coercas här vid
// läsning (true→1, false→0) så lagrad data konvergerar mot den nya vikt-modellen.
function trimWindow(w: unknown): number[] {
  return Array.isArray(w)
    ? (w as HcpContribution[]).slice(-HCP_WINDOW_SIZE).map(coerceContribution)
    : [];
}
function coerceCategory(raw: unknown) {
  const p = (raw ?? {}) as Partial<ReturnType<typeof emptyCategoryProgress>>;
  const w = (p.windows ?? {}) as Partial<HcpProgress['categories']['Music']['windows']>;
  return {
    hcp: typeof p.hcp === 'number' ? p.hcp : HCP_START,
    windows: {
      minimal: trimWindow(w.minimal),
      standard: trimWindow(w.standard),
      full: trimWindow(w.full),
    },
    lastPlayedISO: typeof p.lastPlayedISO === 'string' ? p.lastPlayedISO : null,
  };
}

function coerce(raw: unknown): HcpProgress {
  const p = (raw ?? {}) as Partial<HcpProgress>;
  const c = (p.categories ?? {}) as Partial<HcpProgress['categories']>;
  // En äldre v2-blob kan bära en kvarvarande `Sport`-nyckel i c — den läses
  // helt enkelt inte (ingen key-bump/migration behövs).
  return {
    categories: {
      Music: coerceCategory(c.Music),
      Film: coerceCategory(c.Film),
    },
  };
}

async function readByKey(key: string | null, sessionId: string): Promise<HcpProgress> {
  if (!key) {
    const s = sessionProgress.get(sessionId);
    return s ? coerce(s) : emptyHcpProgress();
  }
  try {
    const raw = await scopedStorage.getItem(key);
    if (!raw) return emptyHcpProgress();
    return coerce(JSON.parse(raw));
  } catch {
    return emptyHcpProgress();
  }
}

async function writeByKey(key: string | null, sessionId: string, progress: HcpProgress): Promise<void> {
  if (!key) {
    sessionProgress.set(sessionId, progress);
    return;
  }
  try {
    await scopedStorage.setItem(key, JSON.stringify(progress));
  } catch {}
}

// Bygger display-bundle (avrundade heltal) ur progress.
function bundleOf(progress: HcpProgress): HcpBundle {
  return {
    total: displayHcp(totalHcp(progress)),
    music: displayHcp(progress.categories.Music.hcp),
    film: displayHcp(progress.categories.Film.hcp),
  };
}

// Speglar det inloggade spelarens region-progress till profilen så sköldarna
// kan läsa synkront via getCachedProfile(). `hcp` = Total (enda skalär-läsaren,
// lobby-kolumnen); `hcpByCategory` = alla 4 för aktuell region. Best-effort.
async function mirrorToProfile(region: string, bundle: HcpBundle): Promise<void> {
  try {
    const profile = await loadProfile();
    if (profile) {
      await saveProfile({
        ...profile,
        hcp: bundle.total,
        hcpByCategory: { region, ...bundle },
      });
    }
  } catch {}
}

// Kör en category→answers-map genom progressen: en applyGameResult per kategori
// med svar (tom map = ingen ändring). Returnerar ny progress.
function applyAllCategories(
  progress: HcpProgress,
  level: AssistanceLevel,
  answersByCategory: CategoryAnswers,
  eraYears: number,
  nowISO: string,
): HcpProgress {
  let next = progress;
  (Object.keys(answersByCategory) as MainCategory[]).forEach((cat) => {
    const answers = answersByCategory[cat];
    if (answers && answers.length > 0) {
      next = applyGameResult(next, cat, level, answers, eraYears, nowISO);
    }
  });
  return next;
}

/**
 * §2.4 — kör inaktivitets-decay för den inloggade spelaren i EN region och
 * spegla ev. ändring till profilen så skölden reflekterar decayen redan vid
 * app-open. No-op för gäster. Speglar dessutom ett friskt all-99-bundle om
 * ingen v2-progress finns ännu (så en stale v1-mirrad profile.hcp inte hänger
 * kvar tills första v2-spelet).
 */
export async function refreshOwnHcpDecay(region: string, now: Date = new Date()): Promise<void> {
  const key = await resolveOwnKey(region);
  if (!key) return; // gäster har ingen persisterad progress att decay:a
  const raw = await scopedStorage.getItem(key).catch(() => null);
  if (!raw) {
    // Ingen v2-progress ännu → spegla fräsch 99 så en stale v1-mirrad
    // profile.hcp inte hänger kvar. Skriv bara om profilen inte redan är 99.
    const profile = await loadProfile().catch(() => null);
    const already =
      profile?.hcpByCategory?.region === region &&
      profile.hcpByCategory.total === HCP_START &&
      profile.hcpByCategory.music === HCP_START &&
      profile.hcpByCategory.film === HCP_START;
    if (!already) await mirrorToProfile(region, bundleOf(emptyHcpProgress()));
    return;
  }
  const current = coerce(JSON.parse(raw));
  const decayed = applyInactivityDecay(current, now);
  // Skriv/spegla bara när decay:n faktiskt ändrade något (undviker onödiga
  // Supabase-upserts vid varje Profile-open).
  const changed =
    (['Music', 'Film'] as const).some(
      (c) =>
        decayed.categories[c].hcp !== current.categories[c].hcp ||
        decayed.categories[c].lastPlayedISO !== current.categories[c].lastPlayedISO,
    );
  if (changed) {
    await writeByKey(key, region, decayed);
    await mirrorToProfile(region, bundleOf(decayed));
  }
}

/**
 * §2.1 — kör en avslutad spelomgång för den INLOGGADE spelaren (self) i en
 * region på den spelade assistance-nivån, med svar bucketade per kategori.
 * Applicerar decay först, sedan fönster-justeringen per kategori, sparar och
 * speglar till profilen. Returnerar display-bundle före/efter (§5-deltat läser total).
 */
export async function recordSelfGameResult(
  region: string,
  level: AssistanceLevel,
  answersByCategory: CategoryAnswers,
  eraYears: number,
  now: Date = new Date(),
): Promise<{ before: HcpBundle; after: HcpBundle }> {
  const key = await resolveOwnKey(region);
  const decayed = applyInactivityDecay(await readByKey(key, region), now);
  const before = bundleOf(decayed);
  const next = applyAllCategories(decayed, level, answersByCategory, eraYears, now.toISOString());
  await writeByKey(key, region, next);
  await mirrorToProfile(region, bundleOf(next));
  return { before, after: bundleOf(next) };
}

/**
 * §2.1 — samma som recordSelfGameResult men för en Pass-the-Phone-medspelare på
 * värdens enhet. Lagras host-scoped på medspelarens lobby-user_id (Build 41,
 * aldrig på namn); utan user_id sessions-lokalt per playerId. Speglar INTE till
 * profilen. Returnerar display-bundle före/efter.
 */
export async function recordGameResultForPeer(
  peer: { playerId: string; userId: string | null },
  region: string,
  level: AssistanceLevel,
  answersByCategory: CategoryAnswers,
  eraYears: number,
  now: Date = new Date(),
): Promise<{ before: HcpBundle; after: HcpBundle }> {
  const key = await resolvePeerKey(peer.userId, region);
  const sessionId = `peer:${peer.playerId}:${region}`;
  const decayed = applyInactivityDecay(await readByKey(key, sessionId), now);
  const before = bundleOf(decayed);
  const next = applyAllCategories(decayed, level, answersByCategory, eraYears, now.toISOString());
  await writeByKey(key, sessionId, next);
  return { before, after: bundleOf(next) };
}

/**
 * Laddar den inloggade spelarens per-kategori-HCP (decayade display-flyttal) för
 * en region — driver quiz-item-filtret (en Music-fråga filtreras mot Music-HCP).
 * HCP_START-fallback per kategori för ohydrerad/ny spelare/gäst.
 */
export async function loadOwnCategoryHcp(
  region: string,
  now: Date = new Date(),
): Promise<Record<MainCategory, number>> {
  const key = await resolveOwnKey(region);
  const decayed = applyInactivityDecay(await readByKey(key, region), now);
  return {
    Music: decayed.categories.Music.hcp,
    Film: decayed.categories.Film.hcp,
  };
}

/**
 * Läser den inloggade spelarens display-HCP-bundle (Total + Music + Film, avrundade
 * uppåt) DIREKT från den auktoritativa progress-storen — SAMMA källa som motorn
 * skriver atomiskt vid game-end via recordSelfGameResult. Används av sköldarna i
 * Profile + av lobby-publiceringen så de INTE är beroende av profil-spegeln
 * (profile.hcp), som kan bli stale om en samtidig loadProfile-cache-back råkar
 * skriva över hcp-fältet (se profileStorage). Ren läsning: decay appliceras för
 * display men persisteras inte här (mount:ens refreshOwnHcpDecay sköter det).
 * Gäst/ohydrerad → all-99-bundle.
 */
export async function loadOwnHcpBundle(
  region: string,
  now: Date = new Date(),
): Promise<HcpBundle> {
  const key = await resolveOwnKey(region);
  const decayed = applyInactivityDecay(await readByKey(key, region), now);
  return bundleOf(decayed);
}

/** Rensar den inloggade spelarens persisterade progress (alla regioner + sessionen). */
export async function clearOwnHcpProgress(region?: string): Promise<void> {
  sessionProgress.clear();
  try {
    const scope = await getUserScope();
    if (!scope) return;
    if (region) {
      await scopedStorage.removeItem(userKey(scope.uid, ownStore(region)));
      return;
    }
    const mine = await scopedStorage.keysWithPrefix(userKey(scope.uid, 'hcp/'));
    if (mine.length > 0) await scopedStorage.multiRemove(mine);
  } catch {}
}

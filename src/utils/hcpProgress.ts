import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AssistanceLevel } from './hcp';
import {
  applyGameResult,
  applyInactivityDecay,
  displayHcp,
  emptyCategoryProgress,
  emptyHcpProgress,
  HCP_START,
  totalHcp,
  type HcpProgress,
} from './hcpEngine';
import type { MainCategory } from './mainCategory';
import { loadProfile, saveProfile } from './profileStorage';

// Persistens för HCP-progressen, per registrerad spelare (playerName) OCH per
// region scope (§1.3). Räknekärnan (applyGameResult / applyInactivityDecay /
// display) bor i hcpEngine.ts eftersom den är ren och enhetstestas utan
// React/AsyncStorage — den här filen sköter bara läsning/skrivning + spegling.
//
// Nyckel per (region, playerName) så att en spelare som byter till en region
// scope de aldrig spelat i börjar på 99 för alla kategorier (helt frisk
// progress), och en svensk spelares svar aldrig påverkar en annan regions
// bucket. Pass-the-Phone kan uppdatera VARJE registrerad deltagares progress på
// den delade enheten (recordGameResultForName). Den inloggade spelarens värde
// speglas dessutom till profile.hcp (+ profile.hcpByCategory) för synkron
// UI-läsning (sköldarna).

// Bumpat till v2 (kategori-uppdelning + region-segment). v1-nycklarna
// (@quizvibe/hcpProgress/v1/<name>) läses aldrig igen — ett enskilt sparat
// Total går inte att splittra i tre kategori-fönster, så vi startar friskt på 99.
const HCP_KEY_PREFIX = '@quizvibe/hcpProgress/v2/';

// Bundle av display-heltal (avrundade uppåt) för de fyra sköldarna.
export interface HcpBundle {
  total: number;
  music: number;
  film: number;
  sport: number;
}

// Svar bucketade per kategori (från quiz-slutet). Kategorier utan svar utelämnas.
export type CategoryAnswers = Partial<Record<MainCategory, boolean[]>>;

// Guest / ingen sparad profil → sessions-lokal progress per region (som
// epochLedger:s sessionDebt). Försvinner vid app-omstart; gäster persisteras aldrig.
const sessionProgress = new Map<string, HcpProgress>();

function keyFor(region: string, playerName: string): string {
  return `${HCP_KEY_PREFIX}${region}/${playerName.trim().toLowerCase()}`;
}

async function resolveOwnKey(region: string): Promise<string | null> {
  try {
    const profile = await loadProfile();
    if (!profile?.playerName) return null;
    return keyFor(region, profile.playerName);
  } catch {
    return null;
  }
}

// Defensiv parse — säkerställ 3-kategori-strukturen även om lagrad data är gammal.
function coerceCategory(raw: unknown) {
  const p = (raw ?? {}) as Partial<ReturnType<typeof emptyCategoryProgress>>;
  const w = (p.windows ?? {}) as Partial<HcpProgress['categories']['Music']['windows']>;
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

function coerce(raw: unknown): HcpProgress {
  const p = (raw ?? {}) as Partial<HcpProgress>;
  const c = (p.categories ?? {}) as Partial<HcpProgress['categories']>;
  return {
    categories: {
      Music: coerceCategory(c.Music),
      Film: coerceCategory(c.Film),
      Sport: coerceCategory(c.Sport),
    },
  };
}

async function readByKey(key: string | null, region: string): Promise<HcpProgress> {
  if (!key) {
    const s = sessionProgress.get(region);
    return s ? coerce(s) : emptyHcpProgress();
  }
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return emptyHcpProgress();
    return coerce(JSON.parse(raw));
  } catch {
    return emptyHcpProgress();
  }
}

async function writeByKey(key: string | null, region: string, progress: HcpProgress): Promise<void> {
  if (!key) {
    sessionProgress.set(region, progress);
    return;
  }
  try {
    await AsyncStorage.setItem(key, JSON.stringify(progress));
  } catch {}
}

// Bygger display-bundle (avrundade heltal) ur progress.
function bundleOf(progress: HcpProgress): HcpBundle {
  return {
    total: displayHcp(totalHcp(progress)),
    music: displayHcp(progress.categories.Music.hcp),
    film: displayHcp(progress.categories.Film.hcp),
    sport: displayHcp(progress.categories.Sport.hcp),
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
  nowISO: string,
): HcpProgress {
  let next = progress;
  (Object.keys(answersByCategory) as MainCategory[]).forEach((cat) => {
    const answers = answersByCategory[cat];
    if (answers && answers.length > 0) {
      next = applyGameResult(next, cat, level, answers, nowISO);
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
  const raw = await AsyncStorage.getItem(key).catch(() => null);
  if (!raw) {
    // Ingen v2-progress ännu → spegla fräsch 99 så en stale v1-mirrad
    // profile.hcp inte hänger kvar. Skriv bara om profilen inte redan är 99.
    const profile = await loadProfile().catch(() => null);
    const already =
      profile?.hcpByCategory?.region === region &&
      profile.hcpByCategory.total === HCP_START &&
      profile.hcpByCategory.music === HCP_START &&
      profile.hcpByCategory.film === HCP_START &&
      profile.hcpByCategory.sport === HCP_START;
    if (!already) await mirrorToProfile(region, bundleOf(emptyHcpProgress()));
    return;
  }
  const current = coerce(JSON.parse(raw));
  const decayed = applyInactivityDecay(current, now);
  // Skriv/spegla bara när decay:n faktiskt ändrade något (undviker onödiga
  // Supabase-upserts vid varje Profile-open).
  const changed =
    (['Music', 'Film', 'Sport'] as const).some(
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
  now: Date = new Date(),
): Promise<{ before: HcpBundle; after: HcpBundle }> {
  const key = await resolveOwnKey(region);
  const decayed = applyInactivityDecay(await readByKey(key, region), now);
  const before = bundleOf(decayed);
  const next = applyAllCategories(decayed, level, answersByCategory, now.toISOString());
  await writeByKey(key, region, next);
  await mirrorToProfile(region, bundleOf(next));
  return { before, after: bundleOf(next) };
}

/**
 * §2.1 — samma som recordSelfGameResult men för en NAMNGIVEN deltagare på en
 * delad enhet (Pass-the-Phone). Speglar INTE till profilen (det är inte denna
 * enhets inloggade spelare). Returnerar display-bundle före/efter.
 */
export async function recordGameResultForName(
  playerName: string,
  region: string,
  level: AssistanceLevel,
  answersByCategory: CategoryAnswers,
  now: Date = new Date(),
): Promise<{ before: HcpBundle; after: HcpBundle }> {
  const key = keyFor(region, playerName);
  const decayed = applyInactivityDecay(await readByKey(key, region), now);
  const before = bundleOf(decayed);
  const next = applyAllCategories(decayed, level, answersByCategory, now.toISOString());
  await writeByKey(key, region, next);
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
    Sport: decayed.categories.Sport.hcp,
  };
}

/** Rensar den inloggade spelarens persisterade progress (alla regioner + sessionen). */
export async function clearOwnHcpProgress(region?: string): Promise<void> {
  sessionProgress.clear();
  try {
    if (region) {
      const key = await resolveOwnKey(region);
      if (key) await AsyncStorage.removeItem(key);
      return;
    }
    // Utan region: rensa alla v2-nycklar för den inloggade spelaren.
    const profile = await loadProfile();
    if (!profile?.playerName) return;
    const suffix = `/${profile.playerName.trim().toLowerCase()}`;
    const allKeys = await AsyncStorage.getAllKeys();
    const mine = allKeys.filter((k) => k.startsWith(HCP_KEY_PREFIX) && k.endsWith(suffix));
    if (mine.length > 0) await AsyncStorage.multiRemove(mine);
  } catch {}
}

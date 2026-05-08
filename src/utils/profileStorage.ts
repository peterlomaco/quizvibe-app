import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Lokal lagring av spelarens profil via AsyncStorage.
 * Nyckeln versioneras (v1) så att vi kan migrera fältschemat senare om behovet
 * uppstår (t.ex. när backend kopplas in i Fas 4+).
 */
const PROFILE_KEY = '@quizvibe/profile/v1';

export type AssistanceLevel = 'minimal' | 'standard' | 'full';
export type Region = 'sweden' | 'nordics' | 'global';
export type AvatarSource = 'upload' | 'choose' | 'default';
export type GameMode = 'pass-the-phone' | 'individual-devices';

export interface ProfileData {
  playerName: string;
  // Email används vid registrering för att skicka aktiveringslänk.
  // Optional för bakåtkompatibilitet med profiler skapade innan fältet fanns.
  email?: string;
  birthYear: number | null;
  assistance: AssistanceLevel | null;
  region: Region | null;
  avatarSource: AvatarSource;
  selectedAvatarId: string;
  // Antal extra Host Game-credits användaren har kvar av sina KÖPTA paket
  // (5/10/20-tiers från Store). Bumpas vid purchase, dras vid Create Game när
  // freeGameCredits är slut. Optional för bakåtkompatibilitet.
  gameCredits?: number;
  // Antal Host Game-credits användaren har kvar av de GRATIS som följer med
  // Basic-planen / kampanj-bonus. Konsumeras före gameCredits vid Create Game.
  // Optional för bakåtkompatibilitet — defaultas till FREE_CREDITS_DAILY_CAP
  // i UI och fylls på automatiskt till samma cap vid första profil-load efter
  // midnatt CET (se refreshFreeCreditsIfNeeded).
  freeGameCredits?: number;
  // ISO-datum (YYYY-MM-DD i Europe/Stockholm-tidszon) för senaste auto-
  // refresh av freeGameCredits. Används av refreshFreeCreditsIfNeeded i
  // loadProfile för att avgöra om vi ska fylla på till FREE_CREDITS_DAILY_CAP.
  // Optional — saknas på profiler skapade innan refresh-logiken kom in.
  lastFreeCreditsRefreshDate?: string;
  // Om användaren har kopplat sitt Spotify-konto. Används för att spela låtar
  // ad-free under quiz-rundor. Optional för bakåtkompatibilitet.
  // TODO (auth): byt till riktigt OAuth-flöde mot Spotify Web API.
  spotifyConnected?: boolean;
  // Hur länge spelarna har på sig att svara på en fråga (i sekunder).
  // Skiljer sig från hur länge frågematerialet (låt/video/bild) spelas upp.
  // Optional för bakåtkompatibilitet — defaultas till 30 i UI.
  answerResponseSeconds?: 15 | 30 | 45 | 60;
  // Game era — år-spann för frågor (host-default vid skapande av spel).
  // Optional för bakåtkompatibilitet — defaultas till [1980, 2010] i UI.
  gameEraFrom?: number;
  gameEraTo?: number;
  // Max antal spelare per spel (host-default). 4 = gratis Basic-plan,
  // 12 = kräver Premium-paket. Optional för bakåtkompatibilitet —
  // defaultas till 4 i UI.
  maxPlayers?: 4 | 12;
  // Default game mode (host-default). 'pass-the-phone' = en delad enhet
  // (gratis), 'individual-devices' = parallellt spel (kräver Premium).
  // Optional för bakåtkompatibilitet — defaultas till 'pass-the-phone' i UI.
  gameMode?: GameMode;
  // Om checkad låser host-default till Individual Devices och Pass-the-Phone
  // visas dämpad/grå i Profile:s Game Mode-toggle. Optional för
  // bakåtkompatibilitet — defaultas till false i UI.
  singlePlayerDefault?: boolean;
  // Default antal rundor per spel (host-default). Stegrar i 2 (jämn lap-tal),
  // capas av gameMode i Lobby (Pass-the-Phone max 4, Individual Devices max
  // 20). Optional för bakåtkompatibilitet — defaultas till ROUNDS_DEFAULT i UI.
  roundsDefault?: number;
  // Lista över paket-id:n som användaren har aktiverat i sin Profile för
  // att vara valbara i Lobby (host-vyn). Paket som inte finns i denna lista
  // visas inte alls i Lobby. Optional för bakåtkompat — defaultas till alla
  // PURCHASED_PACKAGES-id:n (allt aktiverat) i UI.
  enabledHostPackages?: string[];
}

// Dual-read mapping för profiler skapade innan rename
// (skill: 'easy' | 'intermediate' | 'expert' → assistance: 'full' | 'standard' | 'minimal').
// Mer hjälp = full assistance; mindre hjälp = minimal assistance.
const LEGACY_SKILL_TO_ASSISTANCE: Record<string, AssistanceLevel> = {
  easy: 'full',
  intermediate: 'standard',
  expert: 'minimal',
};

// Daily-cap för fria Host Games. Top-up till MAX 2 vid midnatt CET via
// refreshFreeCreditsIfNeeded (anropas i loadProfile). Topp-up:en är aldrig
// destruktiv — om saldot redan är ≥ 2 (t.ex. efter en kampanj-bonus) lämnas
// det orört. Konsumeras före gameCredits vid Create Game.
export const FREE_CREDITS_DAILY_CAP = 2;

/**
 * Returnerar dagens datum i Europe/Stockholm-tidszon som "YYYY-MM-DD".
 * `sv-SE`-locale ger redan ISO-likt format ("2026-05-06") så ingen
 * extra parsing behövs. Stockholm-tidszonen hanterar DST automatiskt
 * (CET vintertid, CEST sommartid — båda gångbara enligt user-spec
 * "midnatt CET" eftersom DST styr när midnatt faktiskt inträffar).
 */
function todayCETDate(): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/**
 * Top up:ar `freeGameCredits` upp till `FREE_CREDITS_DAILY_CAP` om CET-datumet
 * har passerat sedan senaste refresh. Top-up:en är **icke-destruktiv**:
 *   • saldo ≥ cap → lämnas orört (ingen reduktion).
 *   • saldo < cap → bumpas upp till cap (skillnaden adderas).
 *   • undefined   → behandlas som 0 → bumpas upp till cap.
 * Extras (`gameCredits`) är ALLTID orört av denna funktion — bara Free
 * påverkas vid midnatt. Returnerar `{ data, changed }` så loadProfile bara
 * persisterar om något faktiskt ändrades (inkl. första-läget då datum saknas
 * på legacy-profil men saldo råkar redan vara på cap).
 *
 * Edge case: helt nya profiler (utan lastFreeCreditsRefreshDate) räknas som
 * "ny dag" → får cap direkt vid första load.
 */
function refreshFreeCreditsIfNeeded(data: ProfileData): { data: ProfileData; changed: boolean } {
  const today = todayCETDate();
  if (data.lastFreeCreditsRefreshDate === today) {
    return { data, changed: false };
  }
  const currentFree = data.freeGameCredits ?? 0;
  const nextFree = Math.max(currentFree, FREE_CREDITS_DAILY_CAP);
  return {
    data: {
      ...data,
      freeGameCredits: nextFree,
      lastFreeCreditsRefreshDate: today,
    },
    changed: true,
  };
}

export async function saveProfile(data: ProfileData): Promise<void> {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('[profileStorage] Failed to save profile:', err);
    throw err;
  }
}

export async function loadProfile(): Promise<ProfileData | null> {
  try {
    const json = await AsyncStorage.getItem(PROFILE_KEY);
    if (!json) return null;
    const raw = JSON.parse(json) as Partial<ProfileData> & {
      nickname?: string;
      skill?: string;
    };
    // Migrera gamla profiler (skapade när fältet hette `nickname`) till
    // nya schemat med `playerName`. Nästa saveProfile skriver bara nya
    // fältet, så storage konvergerar passivt mot det nya schemat.
    if (raw.playerName === undefined && typeof raw.nickname === 'string') {
      raw.playerName = raw.nickname;
      delete raw.nickname;
    }
    // Migrera profiler skapade när fältet hette `skill` med värdena
    // easy/intermediate/expert → nya `assistance` med full/standard/minimal.
    if (raw.assistance === undefined && typeof raw.skill === 'string') {
      raw.assistance = LEGACY_SKILL_TO_ASSISTANCE[raw.skill] ?? null;
      delete raw.skill;
    }
    // Auto-refresh fria credits vid första load efter midnatt CET. Skriv
    // tillbaka direkt om top-up skedde så storage konvergerar (annars
    // skulle vi top-up:a vid varje load tills användaren råkar trigga en
    // annan saveProfile-write).
    const { data: refreshed, changed } = refreshFreeCreditsIfNeeded(raw as ProfileData);
    if (changed) {
      AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(refreshed)).catch((err) => {
        console.warn('[profileStorage] Failed to persist daily-credits refresh:', err);
      });
    }
    return refreshed;
  } catch (err) {
    console.warn('[profileStorage] Failed to load profile:', err);
    return null;
  }
}

export async function clearProfile(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PROFILE_KEY);
  } catch (err) {
    console.warn('[profileStorage] Failed to clear profile:', err);
  }
}

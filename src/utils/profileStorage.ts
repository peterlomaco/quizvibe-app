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
  // Optional för bakåtkompatibilitet — defaultas till 0 i UI.
  freeGameCredits?: number;
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
}

// Dual-read mapping för profiler skapade innan rename
// (skill: 'easy' | 'intermediate' | 'expert' → assistance: 'full' | 'standard' | 'minimal').
// Mer hjälp = full assistance; mindre hjälp = minimal assistance.
const LEGACY_SKILL_TO_ASSISTANCE: Record<string, AssistanceLevel> = {
  easy: 'full',
  intermediate: 'standard',
  expert: 'minimal',
};

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
    return raw as ProfileData;
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

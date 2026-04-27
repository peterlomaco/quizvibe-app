import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Lokal lagring av spelarens profil via AsyncStorage.
 * Nyckeln versioneras (v1) så att vi kan migrera fältschemat senare om behovet
 * uppstår (t.ex. när backend kopplas in i Fas 4+).
 */
const PROFILE_KEY = '@quizvibe/profile/v1';

export type Skill  = 'easy' | 'intermediate' | 'expert';
export type Region = 'sweden' | 'nordics' | 'global';
export type AvatarSource = 'upload' | 'choose' | 'default';

export interface ProfileData {
  nickname: string;
  // Email används vid registrering för att skicka aktiveringslänk.
  // Optional för bakåtkompatibilitet med profiler skapade innan fältet fanns.
  email?: string;
  birthYear: number | null;
  skill: Skill | null;
  region: Region | null;
  avatarSource: AvatarSource;
  selectedAvatarId: string;
  // Antal spel användaren har på sitt konto. Köps via Store (Extra Games).
  // Optional för bakåtkompatibilitet med profiler sparade innan fältet fanns.
  gameCredits?: number;
  // Om användaren har kopplat sitt Spotify-konto. Används för att spela låtar
  // ad-free under quiz-rundor. Optional för bakåtkompatibilitet.
  // TODO (auth): byt till riktigt OAuth-flöde mot Spotify Web API.
  spotifyConnected?: boolean;
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
    return JSON.parse(json) as ProfileData;
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

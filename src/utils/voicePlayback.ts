/**
 * Ljuduppspelning för röstpack (expo-audio) utanför CountdownIntro.
 *
 * Två konsumenter:
 *  - Profile-pickern förhandslyssnar ett klipp (`playVoiceClip`).
 *  - LobbyScreen spelar "QuizVibe"-välkomsten i vald röst när host går in.
 *
 * CountdownIntro sköter sin EGEN förinladdning (en player per token) för tajt
 * timing — denna modul är för engångs-uppspelning + den delade audio-mode-
 * configen. Allt är best-effort: native-modulen saknas i Expo Go, så varje
 * anrop är try/catch:at och no-op:ar tyst där.
 */
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Speech from 'expo-speech';
import { resolveVoicePack, type VoiceToken } from './voicePacks';

let audioModeConfigured = false;

/**
 * Sätter audio-mode EN gång: `playsInSilentMode` (paritet med expo-speech, som
 * hörs oavsett ringläge) + `interruptionMode: 'mixWithOthers'` så Morse-ambient
 * / YouTube-WebView-ljudet inte avbryts. Idempotent; retry:ar om det failar.
 */
export async function ensureVoiceAudioMode(): Promise<void> {
  if (audioModeConfigured) return;
  audioModeConfigured = true;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
      shouldPlayInBackground: false,
    });
  } catch (_) {
    audioModeConfigured = false; // tillåt nytt försök
  }
}

/**
 * Spelar EN token ur en röst EN gång. Rösten resolvas via `resolveVoicePack`
 * (okänt/utelämnat id → default-rösten hype). Skapar en engångs-player som tas
 * bort när klippet spelat klart (+ 4 s skyddsnät). Om uppspelningen kastar
 * (klipp saknas e.d.) och `fallbackText` givits läses den via expo-speech.
 */
export function playVoiceClip(
  voiceId: string | null | undefined,
  token: VoiceToken,
  fallbackText?: string,
): void {
  const pack = resolveVoicePack(voiceId);
  void ensureVoiceAudioMode();
  try {
    const player = createAudioPlayer(pack.clips[token]);
    player.play();
    // Ta bort engångs-playern när klippet rimligen spelat klart (klippen är
    // <2 s; 4 s marginal). expo-audio saknar en enkel typad finish-lyssnare,
    // så en timeout räcker för en engångsuppspelning.
    setTimeout(() => { try { player.remove(); } catch (_) {} }, 4000);
    return;
  } catch (_) {
    // Faller igenom till TTS-fallback nedan.
  }
  if (fallbackText) {
    try { Speech.speak(fallbackText, { language: 'en-US', pitch: 0.01, rate: 0.42 }); } catch (_) {}
  }
}

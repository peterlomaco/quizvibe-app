/**
 * Ljuduppspelning för countdown-röstpack (expo-audio).
 *
 * Två konsumenter:
 *  - `ensureVoiceAudioMode()` — CountdownIntro + preview sätter audio-mode så
 *    klippen hörs även med mute-switchen på och MIXAR med WebView-ljuden.
 *  - `previewVoice()` — Profile-pickern spelar ETT klipp när ett röstval
 *    fokuseras, så spelaren hör rösten innan hen sparar.
 *
 * CountdownIntro sköter sin EGEN förinladdning (en player per token) för tajt
 * timing — denna modul är för engångs-preview + den delade audio-mode-configen.
 * Allt är best-effort: native-modulen saknas i Expo Go, så varje anrop är
 * try/catch:at och no-op:ar tyst där.
 */
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Speech from 'expo-speech';
import { getVoicePack, type VoiceToken } from './voicePacks';

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
 * Spelar en token ur ett röstpack EN gång (Profile-preview). Default-rösten
 * (eller okänt pack) faller tillbaka på expo-speech med samma djupa, långsamma
 * karaktär som countdown, så previewen speglar spelupplevelsen. Skapar en
 * engångs-player som tas bort när klippet spelat klart (+ 4 s skyddsnät).
 */
export function previewVoice(voiceId: string, token: VoiceToken = 'who'): void {
  const pack = getVoicePack(voiceId);
  if (!pack) {
    try {
      const text = token === 'who' || token === 'when'
        ? token.charAt(0).toUpperCase() + token.slice(1)
        : token;
      Speech.speak(text, { language: 'en-US', pitch: 0.01, rate: 0.42 });
    } catch (_) {}
    return;
  }
  void ensureVoiceAudioMode();
  try {
    const player = createAudioPlayer(pack.clips[token]);
    let removed = false;
    const cleanup = () => {
      if (removed) return;
      removed = true;
      try { player.remove(); } catch (_) {}
    };
    player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) cleanup();
    });
    player.play();
    setTimeout(cleanup, 4000);
  } catch (_) {}
}

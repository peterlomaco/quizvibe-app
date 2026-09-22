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
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import { resolveVoicePack, SILENT_VOICE_ID, type VoiceToken } from './voicePacks';

let audioModeConfigured = false;

/**
 * Sätter app-ens iOS-audio-mode: `playsInSilentMode` (paritet med expo-speech,
 * som hörs oavsett ringläge) + `interruptionMode: 'mixWithOthers'` så QuizVibes
 * eget ljud (Morse-ambient- / countdown- / YouTube-WebView-ljud) MIXAR med annat
 * ljud i stället för att avbryta det. Det är detta som håller en Spotify-DJ:s
 * spår igång när host växlar Spotify → QuizVibe: utan mixWithOthers återaktiverar
 * iOS vår non-mixing-session vid foreground och pausar Spotify.
 *
 * Anropas dels vid app-start (global default innan någon WebView/ljud laddats),
 * dels lazy från voice-clip-uppspelning nedan. Guardad så den bara sätts en gång
 * — men `force: true` kringgår guarden och åter-sätter läget (behövs precis före
 * en Spotify-handoff, ifall WebKit/expo-speech hunnit flippa sessionen till en
 * non-mixing-kategori efter första anropet). Idempotent; retry:ar om det failar.
 */
export async function ensureVoiceAudioMode(force = false): Promise<void> {
  if (audioModeConfigured && !force) return;
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

// ─── Sessions-uppvärmning (keep-alive) ──────────────────────────────────────
// iOS aktiverar audiosessionen ~1 s vid FÖRSTA play(). CountdownIntro monterar
// bara ~580 ms innan sin första siffra ("3") ska höras — för kort för att hinna
// aktivera, så "3" startade ~1 s sent och bara "th" hördes innan "2" fyrades
// (1300 ms senare) → de överlappade. Fixen: håll sessionen VARM redan från quiz-
// skärmens intro-fas (sekunder innan någon nedräkning) via en muted, loopande
// keep-alive-player. När nedräkningen sedan spelar sina klipp är sessionen redan
// aktiv → varje siffra hörs OMEDELBART. muted + volume 0 + mixWithOthers → helt
// tyst och stör inte YouTube/Spotify/Morse-ambient. (Peter 2026-09-22.)
let warmPlayer: AudioPlayer | null = null;

/**
 * Aktiverar + håller iOS-audiosessionen varm (idempotent — no-op om redan varm
 * eller om rösten är "No voice"). Anropas när quiz-skärmen mountar för en enhet
 * som faktiskt spelar countdown-ljud (host / ej mutad). Vilket KLIPP som loopas
 * spelar ingen roll — det är muted och finns bara för att hålla sessionen igång.
 */
export function warmVoiceSession(voiceId: string | null | undefined): void {
  if (voiceId === SILENT_VOICE_ID) return;
  if (warmPlayer) return;
  const pack = resolveVoicePack(voiceId);
  void ensureVoiceAudioMode();
  try {
    const p = createAudioPlayer(pack.clips['3']);
    p.muted = true;
    p.volume = 0;
    p.loop = true;
    p.play();
    warmPlayer = p;
  } catch (_) {
    warmPlayer = null; // tillåt nytt försök
  }
}

/** Släpper keep-alive-playern (anropas när quiz-skärmen unmountar). */
export function releaseVoiceSession(): void {
  if (!warmPlayer) return;
  try { warmPlayer.pause(); warmPlayer.remove(); } catch (_) {}
  warmPlayer = null;
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
  // "No voice" — helt tyst: inget klipp och ingen TTS-fallback (gäller både
  // Profile-förhandslyssningen och lobby-välkomsten).
  if (voiceId === SILENT_VOICE_ID) return;
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

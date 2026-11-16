// External-audio detection (Q2): QuizVibe background music must stay silent
// while another app is playing audio.
//
// expo-audio 57 has no API for this (verified 2026-11-15). Batch 6 adds a
// small read-only local Expo module that exposes iOS
// AVAudioSession.secondaryAudioShouldBeSilencedHint + its notification. Until
// then this file is a stub that reports the detector as ABSENT — which keeps
// the music engine disabled in every build without it (approved interim rule).
//
// This never changes the audio session and never affects YouTube, voice clips
// or the Sparkler — it only gates the four background music tracks.

type Listener = () => void;

/** True when the native detector module is present in this binary. */
export function isExternalAudioDetectorAvailable(): boolean {
  return false; // Batch 6: requireOptionalNativeModule('AudioSessionHint') !== null
}

/** True while another app's audio should silence our background music. */
export function isOtherAudioPlaying(): boolean {
  return false; // Batch 6: native secondaryAudioShouldBeSilencedHint
}

/** Called when the hint changes (other app starts/stops). Returns unsubscribe. */
export function subscribeExternalAudio(_listener: Listener): () => void {
  return () => {}; // Batch 6: silenceSecondaryAudioHintNotification
}

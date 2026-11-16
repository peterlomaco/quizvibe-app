// External-audio detection (Q2): QuizVibe background music must stay silent
// while another app is playing audio, and must never interrupt it.
//
// Backed by the local read-only Expo module `modules/audio-session-hint`
// (iOS AVAudioSession.secondaryAudioShouldBeSilencedHint + its notification).
// The module is OPTIONAL: binaries built before it existed (the App Store
// build, older dev builds) report it as absent, and the music engine then
// stays off in release builds (approved interim rule).
//
// This never changes the audio session and never affects YouTube, voice clips
// or the Sparkler — it only gates the four background music tracks.

import {
  addHintListener,
  isAudioSessionHintAvailable,
  isOtherAudioPlaying as nativeIsOtherAudioPlaying,
} from '@/modules/audio-session-hint';

type Listener = () => void;

/** True when the native detector module is present in this binary. */
export function isExternalAudioDetectorAvailable(): boolean {
  return isAudioSessionHintAvailable();
}

/** True while another app's audio should silence our background music. */
export function isOtherAudioPlaying(): boolean {
  return nativeIsOtherAudioPlaying();
}

/** Called when the hint changes (other app starts/stops). Returns unsubscribe. */
export function subscribeExternalAudio(listener: Listener): () => void {
  return addHintListener(() => listener());
}

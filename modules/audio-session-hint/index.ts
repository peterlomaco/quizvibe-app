// Optional native module: present only in builds compiled after 2026-11-16
// (Batch 6). Older binaries — including the App Store build under review and
// the current dev build — get `null` here and never crash.
import { requireOptionalNativeModule } from 'expo';

type HintEvent = { otherAudioPlaying: boolean };

interface AudioSessionHintNative {
  isOtherAudioPlaying(): boolean;
  addListener(event: 'onHintChange', listener: (e: HintEvent) => void): { remove(): void };
}

const native = requireOptionalNativeModule<AudioSessionHintNative>('AudioSessionHint');

export function isAudioSessionHintAvailable(): boolean {
  return native !== null;
}

export function isOtherAudioPlaying(): boolean {
  if (!native) return false;
  try {
    return native.isOtherAudioPlaying();
  } catch {
    return false;
  }
}

export function addHintListener(listener: (otherAudioPlaying: boolean) => void): () => void {
  if (!native) return () => {};
  const sub = native.addListener('onHintChange', (e) => listener(!!e?.otherAudioPlaying));
  return () => sub.remove();
}

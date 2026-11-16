// Answer sound effects — playback (no React).
//
// One preloaded expo-audio player per sound, created on the quiz screen so the
// first tap plays without a load delay. Playing restarts the clip from 0.
//
// The CALLER decides whether this device may hear sound (isAudioMutedForSelf
// in app/quiz.tsx) — this module never plays on its own initiative.
//
// ⚠ Apple Guideline 2.5.4: no background playback. Like the music engine this
// only re-applies the existing session via ensureVoiceAudioMode() (unchanged
// settings: mixWithOthers, no background) and never plays while the app is
// not 'active'.

import { AppState } from 'react-native';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { ensureVoiceAudioMode } from '@/src/utils/voicePlayback';
import { duckMusic } from './musicEngine';
import { LOCKED_DUCK, SFX_GAIN, SFX_MIN_INTERVAL_MS, SFX_SOURCE, type SfxName } from './sfxConfig';

const players = new Map<SfxName, AudioPlayer>();
const lastPlayedAt: Record<SfxName, number> = { select: 0, locked: 0 };

function log(...args: unknown[]) {
  if (__DEV__) console.log('[sfx]', ...args);
}

function getPlayer(name: SfxName): AudioPlayer | null {
  const existing = players.get(name);
  if (existing) return existing;
  try {
    const player = createAudioPlayer(SFX_SOURCE[name]);
    player.loop = false;
    player.volume = SFX_GAIN[name];
    // Re-arm at 0 as soon as a clip finishes, so the next tap can play at
    // once. Without this the player sits at the END of the clip, and a
    // play() issued before the async seekTo(0) lands does nothing — every
    // second tap was silent (Peter 2026-11-16).
    const emitter = player as unknown as {
      addListener: (
        event: 'playbackStatusUpdate',
        cb: (status: { didJustFinish?: boolean }) => void,
      ) => { remove: () => void };
    };
    emitter.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) {
        try { player.pause(); } catch {}
        void player.seekTo(0).catch(() => {});
      }
    });
    players.set(name, player);
    return player;
  } catch (e) {
    log('player create failed', name, e);
    return null;
  }
}

/** Create both players ahead of the first tap. Idempotent. */
export function preloadSfx(): void {
  void ensureVoiceAudioMode();
  getPlayer('select');
  getPlayer('locked');
}

/** Play one sound now. No-op while the app is not active. */
export function playSfx(name: SfxName): void {
  if (AppState.currentState !== 'active') return;
  const now = Date.now();
  if (now - lastPlayedAt[name] < SFX_MIN_INTERVAL_MS[name]) return;
  lastPlayedAt[name] = now;
  const player = getPlayer(name);
  if (!player) return;
  void ensureVoiceAudioMode();
  try {
    player.volume = SFX_GAIN[name]; // picks up DEV edits after Fast Refresh
    if (player.currentTime > 0.005) {
      // Still playing (fast retap) or not re-armed yet: wait for the seek,
      // otherwise play() races it and is lost.
      player.pause();
      player
        .seekTo(0)
        .then(() => player.play())
        .catch(() => {
          try { player.play(); } catch {}
        });
    } else {
      player.play();
    }
  } catch (e) {
    log('play failed', name, e);
    return;
  }
  if (name === 'locked') duckMusic(LOCKED_DUCK);
}

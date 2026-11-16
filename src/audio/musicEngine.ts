// Background music — playback engine (no React).
//
// <MusicHost/> resolves the desired { track, audible } from the visible route
// and calls setDesired(). The engine owns one lazily created expo-audio player
// per track and moves between them with JS volume ramps:
//   - same track → no-op (zones: Home routes, Lobby → Get Ready)
//   - different track → outgoing fades to exactly 0 then pauses; incoming
//     fades in to its central gain (musicConfig.ts)
//
// ⚠ Apple Guideline 2.5.4 (rejection 2026-10-14, fix b6d08cc): this engine
// must NEVER enable background playback. It does not touch
// enableBackgroundPlayback / UIBackgroundModes / shouldPlayInBackground or any
// setAudioModeAsync field — it only re-applies the existing session via
// ensureVoiceAudioMode(). Music pauses as soon as the app is not 'active'.

import { AppState, type AppStateStatus } from 'react-native';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { ensureVoiceAudioMode } from '@/src/utils/voicePlayback';
import {
  COUNTDOWN_FADE_OUT_MS,
  DEV_FORCE_MUSIC_ENGINE,
  FADE_IN_MS,
  FADE_OUT_MS,
  MUSIC_TRACK_SOURCE,
  RAMP_STEP_MS,
  RESUMING_TRACKS,
  type MusicTrack,
} from './musicConfig';
import { getTrackGain, reportMusicSilent, subscribeGain } from './musicController';
import {
  isExternalAudioDetectorAvailable,
  isOtherAudioPlaying,
  subscribeExternalAudio,
} from './externalAudio';

export interface DesiredMusic {
  track: MusicTrack | null;
  audible: boolean;
  fadeInDelayMs?: number;
  fastFadeOut?: boolean;
}

/** Interim rule (approved): no background music in builds without the
 *  external-audio detector. DEV builds may force it on for testing. */
export function isMusicEngineEnabled(): boolean {
  return isExternalAudioDetectorAvailable() || (__DEV__ && DEV_FORCE_MUSIC_ENGINE);
}

interface Slot {
  player: AudioPlayer;
  ramp: ReturnType<typeof setInterval> | null;
  /** Engine-intended state; the status guard pauses anything else. */
  shouldPlay: boolean;
  statusSub: { remove: () => void } | null;
}

const slots = new Map<MusicTrack, Slot>();
let desired: DesiredMusic = { track: null, audible: false };
/** Track currently targeted for audible playback (after all gates). */
let active: MusicTrack | null = null;
let startTimer: ReturnType<typeof setTimeout> | null = null;
let appState: AppStateStatus = AppState.currentState ?? 'active';
let started = false;

function log(...args: unknown[]) {
  if (__DEV__) console.log('[music]', ...args);
}

function getSlot(track: MusicTrack): Slot | null {
  const existing = slots.get(track);
  if (existing) return existing;
  try {
    const player = createAudioPlayer(MUSIC_TRACK_SOURCE[track]);
    player.loop = true;
    player.volume = 0;
    const slot: Slot = { player, ramp: null, shouldPlay: false, statusSub: null };
    // Guard against native auto-resume (foreground, interruption end, route
    // change) of a track the engine no longer wants.
    // SharedObject.addListener exists at runtime (expo-audio's own hooks use
    // it) but its typing doesn't resolve through AudioModule.types here.
    const emitter = player as unknown as {
      addListener: (
        event: 'playbackStatusUpdate',
        cb: (status: { playing: boolean }) => void,
      ) => { remove: () => void };
    };
    slot.statusSub = emitter.addListener('playbackStatusUpdate', (status) => {
      if (status.playing && (!slot.shouldPlay || appState !== 'active')) {
        try { player.pause(); } catch {}
        log('guard paused stray', track);
      }
    });
    slots.set(track, slot);
    return slot;
  } catch (e) {
    log('player create failed', track, e);
    return null;
  }
}

function updateSilent() {
  let silent = true;
  slots.forEach((s) => {
    if (s.shouldPlay && s.player.volume > 0.001) silent = false;
  });
  reportMusicSilent(silent);
}

function stopRamp(slot: Slot) {
  if (slot.ramp) {
    clearInterval(slot.ramp);
    slot.ramp = null;
  }
}

/** Linear ramp from the current volume to `target`; ends clamped exactly. */
function rampTo(slot: Slot, target: number, ms: number, onDone?: () => void) {
  stopRamp(slot);
  const from = slot.player.volume;
  const steps = Math.max(1, Math.round(ms / RAMP_STEP_MS));
  let i = 0;
  slot.ramp = setInterval(() => {
    i += 1;
    const v = i >= steps ? target : from + ((target - from) * i) / steps;
    try { slot.player.volume = v; } catch {}
    if (i >= steps) {
      stopRamp(slot);
      onDone?.();
      updateSilent();
    }
  }, RAMP_STEP_MS);
}

function fadeOutSlot(track: MusicTrack, ms: number) {
  const slot = slots.get(track);
  if (!slot || !slot.shouldPlay) return;
  rampTo(slot, 0, ms, () => {
    slot.shouldPlay = false;
    try { slot.player.pause(); } catch {}
    if (!RESUMING_TRACKS.has(track)) {
      void slot.player.seekTo(0).catch(() => {});
    }
    updateSilent();
  });
}

function fadeInSlot(track: MusicTrack) {
  const slot = getSlot(track);
  if (!slot) return;
  void ensureVoiceAudioMode();
  slot.shouldPlay = true;
  try {
    if (!slot.player.playing) slot.player.play();
  } catch (e) {
    log('play failed', track, e);
    slot.shouldPlay = false;
    return;
  }
  rampTo(slot, getTrackGain(track), FADE_IN_MS);
}

/** The track that should be audible after every gate. */
function resolveTarget(): MusicTrack | null {
  if (!isMusicEngineEnabled()) return null;
  if (appState !== 'active') return null;
  if (!desired.audible || !desired.track) return null;
  if (isOtherAudioPlaying()) return null;
  return desired.track;
}

function reconcile() {
  const target = resolveTarget();
  if (target === active) {
    // Same track — nothing to restart. Make sure it's actually up (e.g. a
    // pending delayed start was cancelled by an AppState blip).
    return;
  }
  if (startTimer) {
    clearTimeout(startTimer);
    startTimer = null;
  }
  const outgoing = active;
  active = target;
  const outMs = desired.fastFadeOut ? COUNTDOWN_FADE_OUT_MS : FADE_OUT_MS;
  if (outgoing) fadeOutSlot(outgoing, outMs);
  // Defensive: anything else still flagged playing fades too.
  slots.forEach((s, t) => {
    if (t !== target && t !== outgoing && s.shouldPlay) fadeOutSlot(t, outMs);
  });
  if (target) {
    const delay = Math.max(0, desired.fadeInDelayMs ?? 0);
    if (delay > 0) {
      startTimer = setTimeout(() => {
        startTimer = null;
        if (active === target) fadeInSlot(target);
      }, delay);
    } else {
      fadeInSlot(target);
    }
  }
  log('→', target ?? 'silence', outgoing ? `(from ${outgoing})` : '');
}

/** Hard stop without fade — used when the app leaves 'active'. */
function pauseAllNow() {
  if (startTimer) {
    clearTimeout(startTimer);
    startTimer = null;
  }
  slots.forEach((s) => {
    stopRamp(s);
    s.shouldPlay = false;
    try {
      s.player.volume = 0;
      s.player.pause();
    } catch {}
  });
  active = null;
  updateSilent();
}

function start() {
  if (started) return;
  started = true;
  // Pause on 'inactive' (fires before 'background') so the native layer never
  // marks our players as wasPlaying and never auto-resumes them on return.
  AppState.addEventListener('change', (next) => {
    const prev = appState;
    appState = next;
    if (next !== 'active') {
      if (prev === 'active') pauseAllNow();
      return;
    }
    // Back to active: re-apply the EXISTING session (unchanged settings) and
    // re-evaluate route + phase — only what fits now starts.
    void ensureVoiceAudioMode(true);
    reconcile();
  });
  subscribeExternalAudio(() => reconcile());
  subscribeGain((track) => {
    const slot = slots.get(track);
    if (slot && slot.shouldPlay && active === track) rampTo(slot, getTrackGain(track), FADE_IN_MS);
  });
}

/** Called by <MusicHost/> whenever the visible route's desired music changes. */
export function setDesired(next: DesiredMusic): void {
  start();
  desired = next;
  reconcile();
}

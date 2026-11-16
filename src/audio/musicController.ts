// Background music — route-scoped intent store.
//
// Screens publish what THEIR route wants; <MusicHost/> (root) reads only the
// entry for the currently visible route (usePathname). A screen still mounted
// underneath (Home under /lobby, Lobby under /quiz) can therefore never take
// audio ownership back — its entry is simply not read.
//
// Same Set-listener pattern as src/utils/leaveScreen.ts / globalOverlay.ts.

import { MUSIC_TRACK_GAIN, type MusicTrack } from './musicConfig';

export interface RouteMusic {
  /** Track this route wants right now (null = silence). */
  track: MusicTrack | null;
  /** False = this device must not hear music (non-host default, muted, …). */
  audible: boolean;
  /** Delay before the fade-in starts (Final Leaderboard: after the bang). */
  fadeInDelayMs?: number;
  /** Use the faster countdown fade when stopping into this state. */
  fastFadeOut?: boolean;
}

/** Route keys that publish their own state. Home-zone routes need none. */
export type MusicRouteKey = 'lobby' | 'quiz';

type Listener = () => void;
const listeners = new Set<Listener>();
const routeMusic: Record<MusicRouteKey, RouteMusic | null> = { lobby: null, quiz: null };
let version = 0;

function emit() {
  version += 1;
  listeners.forEach((fn) => fn());
}

function sameMusic(a: RouteMusic | null, b: RouteMusic | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.track === b.track &&
    a.audible === b.audible &&
    (a.fadeInDelayMs ?? 0) === (b.fadeInDelayMs ?? 0) &&
    !!a.fastFadeOut === !!b.fastFadeOut
  );
}

/** Publish the music state for a route. Idempotent. */
export function setRouteMusic(route: MusicRouteKey, music: RouteMusic): void {
  if (sameMusic(routeMusic[route], music)) return;
  routeMusic[route] = music;
  emit();
}

/** Clear a route's entry (unmount / leaving the screen). */
export function clearRouteMusic(route: MusicRouteKey): void {
  if (routeMusic[route] === null) return;
  routeMusic[route] = null;
  emit();
}

export function getRouteMusic(route: MusicRouteKey): RouteMusic | null {
  return routeMusic[route];
}

export function subscribeMusic(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Snapshot token for useSyncExternalStore. */
export function getMusicVersion(): number {
  return version;
}

// ─── Gain (central config + DEV override) ────────────────────────────────────

const devGain: Partial<Record<MusicTrack, number>> = {};
const gainListeners = new Set<(track: MusicTrack) => void>();

/** Current target gain for a track. Read at the start of every fade-in. */
export function getTrackGain(track: MusicTrack): number {
  const v = devGain[track] ?? MUSIC_TRACK_GAIN[track];
  return Math.max(0, Math.min(1, v));
}

/** DEV only: retarget a track's gain live (A/B listening). No-op in release. */
export function setDevTrackGain(track: MusicTrack, value: number): void {
  if (!__DEV__) return;
  devGain[track] = value;
  gainListeners.forEach((fn) => fn(track));
}

export function subscribeGain(listener: (track: MusicTrack) => void): () => void {
  gainListeners.add(listener);
  return () => {
    gainListeners.delete(listener);
  };
}

if (__DEV__) {
  // Reachable from the Metro/JS debugger console: setDevTrackGain('home', 0.15)
  (globalThis as unknown as { setDevTrackGain?: typeof setDevTrackGain }).setDevTrackGain = setDevTrackGain;
}

// ─── Silence waiters (CountdownIntro waits before the "Get ready" clip) ──────

let musicSilent = true;
const silentWaiters = new Set<() => void>();

/** Engine reports whether any music is currently audible. */
export function reportMusicSilent(silent: boolean): void {
  musicSilent = silent;
  if (silent) {
    silentWaiters.forEach((fn) => fn());
    silentWaiters.clear();
  }
}

/** Resolves when music is silent, or after maxMs at the latest. Never rejects. */
export function waitForMusicSilent(maxMs: number): Promise<void> {
  if (musicSilent) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer);
      silentWaiters.delete(done);
      resolve();
    };
    const timer = setTimeout(done, maxMs);
    silentWaiters.add(done);
  });
}

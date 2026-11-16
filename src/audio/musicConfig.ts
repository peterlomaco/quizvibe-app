// Background music — the ONE place to tune levels, fades and sources.
//
// Approved plan: "Background music & unified audio control" rev 3 (2026-11-16).
// Gains are expo-audio PLAYER volumes (0..1) for QuizVibe's own music only.
// They never touch YouTube (stays at 100), the device/system volume, the
// ringer or notifications. There is no user-facing volume control.
//
// DEV calibration: edit a number + save (Fast Refresh) — the next fade picks
// it up. For live A/B listening on the current track use
// setDevTrackGain(track, value) from musicController (DEV builds only).

export type MusicTrack = 'home' | 'part1' | 'hints' | 'final';

/** Initial DEV calibration values (Peter 2026-11-16) — not final loudness targets. */
export const MUSIC_TRACK_GAIN: Record<MusicTrack, number> = {
  home: 0.2, // Home Short
  part1: 0.25, // Part 1 — Lobby / Get Ready
  hints: 0.2, // Part 2 Variant B — Hints
  final: 0.3, // Part 3 Version 4 — Final Leaderboard
};

export const FADE_IN_MS = 400;
export const FADE_OUT_MS = 300;
/** Faster fade into Countdown so Part 1 is silent before the "Get ready" clip. */
export const COUNTDOWN_FADE_OUT_MS = 250;
/** How long the current track keeps playing while a newly visible route
 *  (Lobby / Quiz) hasn't published its music state yet. Never starts music. */
export const ROUTE_HOLD_MS = 600;
/** Ramp step — volume only, no React state. */
export const RAMP_STEP_MS = 30;

/** Files as delivered (Home + Part 2 unchanged MP3s; Part 1 + Part 3 are AAC
 *  256 kbps conversions of the WAV masters). Masters live, unbundled, in
 *  assets/music/masters/ (gitignored). Do not edit the audio. */
export const MUSIC_TRACK_SOURCE: Record<MusicTrack, number> = {
  home: require('@/assets/music/home-short.mp3'),
  part1: require('@/assets/music/part1-lobby.m4a'),
  hints: require('@/assets/music/part2-hints.mp3'),
  final: require('@/assets/music/part3-final.m4a'),
};

/** Tracks that keep their playback position when they stop (resume later).
 *  Part 1 resumes between questions and into the rematch Lobby. All others
 *  restart from 0 the next time they start (Home: "may restart" — G1). */
export const RESUMING_TRACKS: ReadonlySet<MusicTrack> = new Set(['part1']);

/**
 * DEV-only switch for testing Batches 1–5 before the external-audio detector
 * (Batch 6) exists. Release builds ignore it (__DEV__ is false there), so real
 * users never get music without Q2 protection.
 */
export const DEV_FORCE_MUSIC_ENGINE = true;

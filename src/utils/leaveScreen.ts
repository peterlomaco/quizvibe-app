// Shared "the user is leaving this screen" signal (2026-11-14).
//
// A quizVibeAlert button can't reach the state of the screen it was opened
// from, so a button marked `leavesScreen` raises the cover through this
// store. <LeaveScreenCover /> in the focused screen shows it. Screen-local
// flows (e.g. Delete Game Lobby) can still pass `visible` directly.
//
// Same Set-listener pattern as globalOverlay.ts.

export interface LeaveScreenState {
  active: boolean;
  /** Optional text; the cover shows it with a spinner if the leave takes a while. */
  text: string;
  /** Date.now() when the leave started — the destination screen's cover
   *  (mounted later) ignores it. */
  startedAt: number;
  /** Loading mode (no closing Modal): the cover is invisible (but blocks
   *  taps) until the display threshold, then shows the card. Fast operations
   *  therefore never flash anything. Without it the cover is opaque at once
   *  — needed when a sheet/dialog fades out on top of it. */
  delayed: boolean;
}

/** RN <Modal> fade (~300 ms) + margin. Wait this long after closing a sheet /
 *  dialog before router.replace — navigating mid-fade froze the app on iOS
 *  (same value as quizVibeAlert's CLOSE_ANIM_MS). Only where a Modal closes;
 *  plain navigations stay immediate. */
export const MODAL_CLOSE_WAIT_MS = 350;

type Listener = () => void;

// Safety net: a navigation that never happens must not lock a screen.
const AUTO_CLEAR_MS = 8000;

const listeners = new Set<Listener>();
let state: LeaveScreenState = { active: false, text: '', startedAt: 0, delayed: false };
let autoClearTimer: ReturnType<typeof setTimeout> | null = null;

function emit() {
  listeners.forEach((fn) => fn());
}

export function getLeaveScreen(): LeaveScreenState {
  return state;
}

/** Cover the current screen now; navigation follows. */
export function beginLeaveScreen(text = '', options?: { delayed?: boolean }): void {
  state = { active: true, text, startedAt: Date.now(), delayed: !!options?.delayed };
  if (autoClearTimer) clearTimeout(autoClearTimer);
  autoClearTimer = setTimeout(endLeaveScreen, AUTO_CLEAR_MS);
  emit();
}

/** Remove the cover (leave done, or aborted — e.g. an error alert follows). */
export function endLeaveScreen(): void {
  if (autoClearTimer) {
    clearTimeout(autoClearTimer);
    autoClearTimer = null;
  }
  if (!state.active) return;
  state = { active: false, text: '', startedAt: 0, delayed: false };
  emit();
}

/**
 * Consistent loading feedback for an action whose next screen needs backend
 * work first (Create Game, Start Game, Home from the leaderboard …).
 *
 * `work` returns true when it navigated, false when it stayed (error alert,
 * guard, user cancelled). Nothing is shown for the first
 * LOADING_THRESHOLD_MS; after that the cover + card with `text` appears and
 * stays until the screen is left. On false/throw the cover is removed.
 * Taps are blocked from the start, so the action can't run twice.
 */
export async function runWithLoadingCover(
  text: string,
  work: () => Promise<boolean>,
): Promise<boolean> {
  beginLeaveScreen(text, { delayed: true });
  let navigated = false;
  try {
    navigated = await work();
  } finally {
    if (!navigated) endLeaveScreen();
  }
  return navigated;
}

export function subscribeLeaveScreen(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

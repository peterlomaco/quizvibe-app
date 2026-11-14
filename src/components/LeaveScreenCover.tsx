import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { BrandUi, Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import {
  endLeaveScreen,
  getLeaveScreen,
  subscribeLeaveScreen,
  type LeaveScreenState,
} from '../utils/leaveScreen';

/**
 * Opaque cover for the moment between "the user chose to leave" and the
 * destination screen appearing (2026-11-14).
 *
 * Why: a confirm dialog / sheet is a RN <Modal>. Navigating while it fades
 * out froze the app on iOS, so navigation waits ~350 ms for it to close —
 * and during that wait the screen the user just left was visible again.
 *
 * This is a plain View rendered as the last child of the screen's OWN tree
 * (not a Modal, not in _layout — a plain view there renders behind the
 * native-stack screens). It appears in the same frame as the tap, sits under
 * the closing Modal, so the sheet fades straight into it, and covers until
 * the screen unmounts or loses focus.
 *
 * Two drivers:
 * - `visible` — screen-local flows (Delete Game Lobby).
 * - the leaveScreen store — quizVibeAlert buttons marked `leavesScreen` and
 *   handlers that call beginLeaveScreen(). Only a FOCUSED screen whose cover
 *   mounted BEFORE the leave started shows it, so the destination's own
 *   cover stays hidden.
 *
 * Text (if any) + spinner appear only after LOADING_THRESHOLD_MS so a quick
 * navigation never flashes a spinner. runWithLoadingCover (leaveScreen.ts)
 * uses loading mode: nothing visible at all before the threshold.
 */
// Display threshold for the card (and, in loading mode, for the cover itself).
export const LOADING_THRESHOLD_MS = 250;

export function LeaveScreenCover({ visible = false }: { visible?: boolean }) {
  const [mountedAt] = useState(() => Date.now());
  const focusedRef = useRef(true);
  const [focused, setFocused] = useState(true);
  useFocusEffect(
    useCallback(() => {
      focusedRef.current = true;
      setFocused(true);
      return () => {
        focusedRef.current = false;
        setFocused(false);
      };
    }, []),
  );

  // Owner = the screen that was focused when the leave started AND mounted
  // before it. Decided once per leave, when the store emits (inside the tap
  // handler, so it renders in the same frame as the sheet closing). A screen
  // lower in the stack (e.g. Lobby under Store on Back) and the destination
  // (mounted later) never own it.
  const [owned, setOwned] = useState<LeaveScreenState | null>(null);
  useEffect(
    () =>
      subscribeLeaveScreen(() => {
        const st = getLeaveScreen();
        if (!st.active) {
          setOwned(null);
          return;
        }
        const mine = focusedRef.current && st.startedAt >= mountedAt;
        setOwned((prev) => (prev?.startedAt === st.startedAt ? prev : mine ? st : null));
      }),
    [mountedAt],
  );

  const fromStore = owned !== null && focused;
  const shown = visible || fromStore;

  // The owner is leaving: when it blurs or unmounts, the leave is done →
  // clear the store.
  const ownedRef = useRef<LeaveScreenState | null>(null);
  useEffect(() => {
    ownedRef.current = owned;
    if (!focused && owned) endLeaveScreen();
  }, [focused, owned]);
  useEffect(() => () => {
    if (ownedRef.current) endLeaveScreen();
  }, []);

  const [showText, setShowText] = useState(false);
  useEffect(() => {
    if (!shown) return;
    const t = setTimeout(() => setShowText(true), LOADING_THRESHOLD_MS);
    return () => {
      clearTimeout(t);
      setShowText(false);
    };
  }, [shown]);

  if (!shown) return null;
  const text = fromStore ? owned.text : '';
  // Loading mode: invisible tap-blocker until the threshold (no flash on
  // fast operations), then the opaque cover + card.
  const invisible = fromStore && !visible && owned.delayed && !showText;
  return (
    <View style={[styles.cover, invisible && styles.coverInvisible]} pointerEvents="auto">
      {showText && text ? <LoadingCard text={text} /> : null}
    </View>
  );
}

/**
 * QuizVibe's standard processing card (spinner + short action text, e.g.
 * "Creating Game Lobby…"). Same look as GlobalOverlay. Reuse it wherever a
 * noticeable wait needs feedback (e.g. inside JoinModal).
 */
export function LoadingCard({ text }: { text: string }) {
  return (
    <View style={styles.card}>
      <ActivityIndicator size="small" color={BrandUi.textMuted} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    elevation: 10000,
  },
  coverInvisible: {
    backgroundColor: 'transparent',
  },
  // Same card as GlobalOverlay so a hand-over between them is invisible.
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: BrandUi.border,
    maxWidth: 320,
  },
  text: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
});

// D-v: top-banner som visas på alla devices när host inte broadcastat
// host_active_ping på 9 min. Räknar ner från 60 → 0 sek, sedan
// triggar quiz.tsx:s shutdown-flöde (cleanup + Alert + nav till Home).
// Host:s ENDA tap stoppar nedräkningen (broadcastar fresh ping →
// clients resetar lastHostActivityAt-ref → banner försvinner).
//
// Renderas över alla phases (intro/countdown/question/awaiting/reveal/
// leaderboard) eftersom inaktivitet kan inträffa i vilken som helst —
// inte bara GetReady som spec:n antyder. Pulserande röd bakgrund för
// att dra uppmärksamhet utan att blocka UI (pointerEvents='none').

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';

interface Props {
  /** Sekunder kvar till shutdown. Banner mountas/unmountas av parent
   *  baserat på om värdet är number eller null. */
  secondsLeft: number;
}

export function InactivityCountdownBanner({ secondsLeft }: Props) {
  const pulseAnim = useRef(new Animated.Value(0.7)).current;
  // Banner renderas absolut-positionerad inom phase-wrappern (View eller
  // SafeAreaView). I View-fallet (intro/countdown) saknar parent automatisk
  // safe-area-padding → utan inset:n hamnar bannern bakom status-bar/notch.
  // Vi bakar in inset+extra padding så den sitter klart under iOS-notch
  // och Android-status-bar på alla devices.
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 600,
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + Spacing.md }]} pointerEvents="none">
      <Animated.View style={[styles.banner, { opacity: pulseAnim }]}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.text} numberOfLines={1}>
          Game ending in {secondsLeft}s — host inactive
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Wrap är absolute-positionerad så banner:n flyter ovanpå phase-
  // contentet utan att påverka layout. pointerEvents='none' så
  // touches passerar igenom till UI:t under (= host:s tap fortsätter
  // resetta countdown via onTouchStart-wrappern på quiz-skärmen).
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    // paddingTop sätts inline från useSafeAreaInsets så bannern hamnar
    // klart nedanför status-bar/notch på alla devices.
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 30,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.error,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
  },
  icon: {
    fontSize: 18,
  },
  text: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

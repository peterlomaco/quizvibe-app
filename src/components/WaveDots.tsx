import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Colors, FontSize, FontWeight } from '../theme';

/**
 * Tre prickar som hoppar i sekvens (våg-effekt) — loading-indikator. Varje
 * prick har en 900ms cykel (300ms upp+ner + 600ms vila) men startas med
 * 150ms-offset så de ser ut att rulla. Flyttad hit från LobbyScreen så den
 * delas med GlobalOverlay (delete-lobby-covern).
 */
export function WaveDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const cycleMs = 900;
    const upMs = 150;
    const downMs = 150;
    const makeDot = (val: Animated.Value, offsetMs: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(offsetMs),
          Animated.timing(val, { toValue: -6, duration: upMs, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: downMs, useNativeDriver: true }),
          Animated.delay(cycleMs - offsetMs - upMs - downMs),
        ]),
      );
    const a1 = makeDot(dot1, 0);
    const a2 = makeDot(dot2, 150);
    const a3 = makeDot(dot3, 300);
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.row}>
      <Animated.Text style={[styles.dot, { transform: [{ translateY: dot1 }] }]}>.</Animated.Text>
      <Animated.Text style={[styles.dot, { transform: [{ translateY: dot2 }] }]}>.</Animated.Text>
      <Animated.Text style={[styles.dot, { transform: [{ translateY: dot3 }] }]}>.</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginLeft: 4,
  },
  dot: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginHorizontal: 1,
    // lineHeight säkrar att translateY-rörelsen inte klipps av container:s
    // tighta vertikala mått runt textens baseline.
    lineHeight: 20,
  },
});

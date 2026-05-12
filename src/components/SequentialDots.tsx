import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Colors, FontSize, FontWeight } from '../theme';

/**
 * Tre prickar som tänds en och en med fade-in, sedan släcks alla samtidigt
 * och cykeln börjar om. Används av "Waiting for…"-rutor (Lobby:s start-CTA,
 * GetReady-skärmens icke-host-vy i Individual Devices, etc.) så användaren
 * visuellt ser att appen väntar/lever. Cykellängd 1600ms (0/400/800ms-
 * stagger för ON, alla OFF vid 1200ms, 300ms blank-period).
 */
export function SequentialDots({ color }: { color?: string } = {}) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fadeMs = 100;
    const makeDot = (val: Animated.Value, onAt: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(onAt),
          Animated.timing(val, { toValue: 1, duration: fadeMs, useNativeDriver: true }),
          Animated.delay(1200 - onAt - fadeMs),
          Animated.timing(val, { toValue: 0, duration: fadeMs, useNativeDriver: true }),
          Animated.delay(300),
        ]),
      );
    const a1 = makeDot(dot1, 0);
    const a2 = makeDot(dot2, 400);
    const a3 = makeDot(dot3, 800);
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  const dotStyle = color ? [styles.dot, { color }] : styles.dot;
  return (
    <View style={styles.row}>
      <Animated.Text style={[dotStyle, { opacity: dot1 }]}>.</Animated.Text>
      <Animated.Text style={[dotStyle, { opacity: dot2 }]}>.</Animated.Text>
      <Animated.Text style={[dotStyle, { opacity: dot3 }]}>.</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginLeft: 2,
  },
  dot: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginHorizontal: 1,
    lineHeight: 20,
  },
});

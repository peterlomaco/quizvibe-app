import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import { Colors } from '../theme';

/**
 * Handrullad konfetti för prisutdelnings-sekvensen. Ingen extern modul —
 * repot har varken konfetti- eller Lottie-beroende, och resten av appens
 * animationer använder RN:s egen `Animated` (Reanimated finns installerat
 * men används ingenstans; följ omgivningen).
 *
 * PRESTANDA: EN enda Animated.Value driver alla bitar. Varje bit
 * interpolerar sin egen bana ur samma driver, så vi har en animation i
 * stället för N stycken — det håller sekvensen mjuk även på iPhone SE.
 * Allt som animeras (translate/rotate/opacity) går på native driver.
 */

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Samma korta-skärms-tröskel som QUIZ_COMPACT i quiz.tsx.
const PIECE_COUNT = SCREEN_H < 700 ? 28 : 40;

const FALL_DURATION_MS = 2600;

// Guld dominerar — det är sekvensens tema. Blå/grön/vit bryter av.
const PIECE_COLORS = [
  Colors.warning,
  Colors.warning,
  Colors.warning,
  Colors.primary,
  Colors.success,
  '#FFFFFF',
];

interface Piece {
  startX: number;
  driftX: number;
  size: number;
  color: string;
  /** 0-1: hur stor del av totalbanan biten hinner (varierar falltempo). */
  speed: number;
  /** Fördröjning som andel av hela loppet, så bitarna inte faller i lock-step. */
  delay: number;
  spin: number;
  borderRadius: number;
}

function buildPieces(): Piece[] {
  return Array.from({ length: PIECE_COUNT }, () => {
    const size = 6 + Math.random() * 5;
    return {
      startX: Math.random() * SCREEN_W,
      driftX: (Math.random() - 0.5) * 90,
      size,
      color: PIECE_COLORS[Math.floor(Math.random() * PIECE_COLORS.length)],
      speed: 0.75 + Math.random() * 0.45,
      delay: Math.random() * 0.35,
      spin: (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 540),
      // Blandning av rektanglar och små cirklar ger mer liv än enbart rutor.
      borderRadius: Math.random() < 0.3 ? size / 2 : 1.5,
    };
  });
}

interface ConfettiProps {
  /** Startar loppet när den blir true. */
  active: boolean;
}

export default function Confetti({ active }: ConfettiProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const pieces = useMemo(buildPieces, []);

  useEffect(() => {
    if (!active) return;
    progress.setValue(0);
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: FALL_DURATION_MS,
      // Lätt acceleration — konfetti faller inte linjärt.
      easing: Easing.bezier(0.25, 0.4, 0.55, 1),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [active, progress]);

  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((piece, i) => {
        // Varje bit får sitt eget fönster ur den delade drivern. Före sin
        // delay står den still ovanför skärmkanten (osynlig).
        const start = piece.delay;
        const end = Math.min(1, start + 0.65);
        const travel = (SCREEN_H + 120) * piece.speed;

        const translateY = progress.interpolate({
          inputRange: [0, start, end, 1],
          outputRange: [-60, -60, travel, travel],
          extrapolate: 'clamp',
        });
        const translateX = progress.interpolate({
          inputRange: [0, start, end, 1],
          outputRange: [0, 0, piece.driftX, piece.driftX],
          extrapolate: 'clamp',
        });
        const rotate = progress.interpolate({
          inputRange: [0, start, end, 1],
          outputRange: ['0deg', '0deg', `${piece.spin}deg`, `${piece.spin}deg`],
          extrapolate: 'clamp',
        });
        // Tonar ut på sista fjärdedelen av den egna banan.
        const opacity = progress.interpolate({
          inputRange: [0, start, start + 0.02, end - 0.16, end, 1],
          outputRange: [0, 0, 1, 1, 0, 0],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={i}
            style={[
              styles.piece,
              {
                left: piece.startX,
                width: piece.size,
                height: piece.size * 1.6,
                backgroundColor: piece.color,
                borderRadius: piece.borderRadius,
                opacity,
                transform: [{ translateY }, { translateX }, { rotate }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    top: 0,
  },
});

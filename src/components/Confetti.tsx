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
// Medvetet sparsamt (Peter 2026-11-02): konfettin ska stödja märket, inte
// konkurrera med det.
const PIECE_COUNT = SCREEN_H < 700 ? 22 : 30;

const FALL_DURATION_MS = 3200;

// QuizVibe-paletten: guld dominerar, vitt bryter av, orange/blått/grönt
// bara som sparsamma accenter.
const PIECE_COLORS = [
  Colors.warning,
  Colors.warning,
  Colors.warning,
  Colors.warning,
  '#FFD77A', // ljusare guld
  '#FFD77A',
  '#FFFFFF',
  '#FFFFFF',
  '#F08A24', // djupare orange
  Colors.primary,
  Colors.success,
];

// Sidozonerna (andel av bredden) där de långa banorna faller — utanför
// märket i mitten, som konfettin inte får konkurrera med.
const SIDE_ZONE = 0.16;

interface Piece {
  startX: number;
  startY: number;
  driftX: number;
  /** Total vertikal sträcka i px. */
  travel: number;
  size: number;
  color: string;
  /** Start och slut som andel av hela loppet. */
  start: number;
  end: number;
  spin: number;
  borderRadius: number;
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/**
 * Två sorters bitar, båda med tidig start så intensiteten toppar direkt och
 * sedan glesnar:
 *  - SIDOBITAR (~70 %): faller längs skärmens sidor, driver utåt.
 *  - TOPPBITAR (~30 %): sprider sig över övre delen och tonar ut innan de
 *    når märkets överkant (`avoidTop`).
 */
function buildPieces(avoidTop: number, avoidHalfWidth: number): Piece[] {
  // Sidobanorna fyller hela ytan UTANFÖR märket så konfettin ramar in
  // Q:t tätt, utan att någonsin korsa det.
  const sideW = Math.max(SCREEN_W * 0.08, SCREEN_W / 2 - avoidHalfWidth);
  return Array.from({ length: PIECE_COUNT }, (_, i) => {
    // Smala remsor snarare än rutor — läser elegantare.
    const size = 4 + Math.random() * 3;
    const side = i % 10 < 8;
    const start = Math.random() < 0.6 ? rand(0, 0.06) : rand(0.06, 0.2);
    let startX: number;
    let driftX: number;
    let travel: number;
    let end: number;
    const startY = rand(-40, SCREEN_H * 0.06);
    if (side) {
      const left = Math.random() < 0.5;
      startX = left ? rand(0, sideW - 6) : rand(SCREEN_W - sideW, SCREEN_W - 6);
      // Driver alltid utåt — bort från märket.
      driftX = (left ? -1 : 1) * rand(4, 18);
      travel = SCREEN_H * rand(0.55, 0.95);
      end = Math.min(1, start + rand(0.6, 0.8));
    } else {
      startX = rand(SCREEN_W * 0.12, SCREEN_W * 0.88);
      driftX = (startX < SCREEN_W / 2 ? -1 : 1) * rand(10, 40);
      travel = Math.max(40, avoidTop - 10 - startY) * rand(0.7, 1);
      end = Math.min(1, start + rand(0.35, 0.5));
    }
    return {
      startX,
      startY,
      driftX,
      travel,
      size,
      color: PIECE_COLORS[Math.floor(Math.random() * PIECE_COLORS.length)],
      start,
      end,
      // Lugn rotation — ingen virvel.
      spin: (Math.random() < 0.5 ? -1 : 1) * (160 + Math.random() * 260),
      // Blandning av rektanglar och små cirklar ger mer liv än enbart rutor.
      borderRadius: Math.random() < 0.2 ? size / 2 : 1,
    };
  });
}

interface ConfettiProps {
  /** Startar loppet när den blir true. */
  active: boolean;
  /** Y (px) för det centrala märkets överkant; toppbitarna stannar ovanför. */
  avoidTop?: number;
  /** Halva bredden (px) av märket i mitten; sidobitarna håller sig utanför. */
  avoidHalfWidth?: number;
}

export default function Confetti({
  active,
  avoidTop = SCREEN_H * 0.3,
  avoidHalfWidth = SCREEN_W * (0.5 - SIDE_ZONE),
}: ConfettiProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const pieces = useMemo(() => buildPieces(avoidTop, avoidHalfWidth), [avoidTop, avoidHalfWidth]);

  useEffect(() => {
    if (!active) return;
    progress.setValue(0);
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: FALL_DURATION_MS,
      // Linjär driver — varje bit får sin egen "burst"-kurva nedan.
      easing: Easing.linear,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [active, progress]);

  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((piece, i) => {
        const { start, end } = piece;
        const len = end - start;
        // Burst: snabb utkastning i början, sedan lugnare fall (ease-out
        // approximerat med en mellanpunkt).
        const mid = start + len * 0.3;
        const translateY = progress.interpolate({
          inputRange: [0, start, mid, end, 1],
          outputRange: [piece.startY, piece.startY, piece.startY + piece.travel * 0.55, piece.startY + piece.travel, piece.startY + piece.travel],
          extrapolate: 'clamp',
        });
        const translateX = progress.interpolate({
          inputRange: [0, start, mid, end, 1],
          outputRange: [0, 0, piece.driftX * 0.7, piece.driftX, piece.driftX],
          extrapolate: 'clamp',
        });
        const rotate = progress.interpolate({
          inputRange: [0, start, end, 1],
          outputRange: ['0deg', '0deg', `${piece.spin}deg`, `${piece.spin}deg`],
          extrapolate: 'clamp',
        });
        // Tänds direkt, tonar ut över sista ~40 % av den egna banan.
        const opacity = progress.interpolate({
          inputRange: [0, start, start + 0.02, end - len * 0.4, end, 1],
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
                height: piece.size * 2.2,
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

import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { QuizVibeMarkQOnlySvg } from './brand/QuizVibeBrandSvg';

/**
 * Passiv brand-vattenstämpel (2026-10-21): det nya QuizVibe-Q:t (Brand
 * Master, utan bågar) i dämpat guld med mycket låg opacitet. Används på
 * Final Leaderboard och i lobbyn — samma logik båda ställena.
 *
 * Ren dekoration: absolut, utan touch (pointerEvents none), påverkar varken
 * layout eller scroll. Lägg den FÖRE innehållet så den ligger bakom.
 */
const WATERMARK_COLOR = '#B8924A'; // dämpat guld — på navy blir det gunmetal-guld
const DEFAULT_OPACITY = 0.06;

export function QuizVibeWatermark({
  size,
  opacity = DEFAULT_OPACITY,
  style,
}: {
  size: number;
  opacity?: number;
  /** Positionering av den absoluta ytan (default: hela föräldern, centrerat). */
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.layer, style]} pointerEvents="none">
      <View style={{ opacity }}>
        <QuizVibeMarkQOnlySvg size={size} color={WATERMARK_COLOR} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import React, { useId } from 'react';
import { View } from 'react-native';
import Svg, { Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';
import {
  MARK_PATHS,
  MARK_VIEWBOX,
  WORDMARK_PATH,
  WORDMARK_VIEWBOX,
} from './quizVibeBrandGeometry';

// Finalized QuizVibe brand (design/brand/, approved 2026-10-16) rendered with
// react-native-svg — the method production would use. Geometry comes from the
// generated quizVibeBrandGeometry.ts; this file only adds paint.
//
// ⚠ VALIDATION ONLY (2026-10-16): used solely by the dev-only /brand-preview
// route. Production screens still render the PNG logo (QuizVibeGoldMark).

export type BrandVariant = 'metallic' | 'flatGold' | 'white' | 'mono';

// Same values as the brand SVGs (design/brand/quizvibe-*.svg).
const MARK_GOLD_STOPS: [number, string][] = [
  [0, '#FFE457'], [0.18, '#FEB221'], [0.36, '#EE9305'], [0.52, '#FDCE3F'],
  [0.62, '#FFF89C'], [0.78, '#FEB221'], [1, '#CB6A02'],
];
const WORD_GOLD_STOPS: [number, string][] = [
  [0, '#FFF0A0'], [0.3, '#FFD54A'], [0.65, '#FEB221'], [1, '#E08A06'],
];
const DEPTH = '#7A3E00';
const SOLID: Record<Exclude<BrandVariant, 'metallic'>, string> = {
  flatGold: '#F5A623',
  white: '#FFFFFF',
  mono: '#0B1220',
};

/** SVG ids must be unique per instance; React's useId contains ':' chars. */
function useSvgId(prefix: string) {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
}

const MARK_D = [
  MARK_PATHS.ring,
  ...MARK_PATHS.arcs,
  MARK_PATHS.connector,
  MARK_PATHS.handle,
];

function MarkShapes({ fill, dy = 0 }: { fill: string; dy?: number }) {
  return (
    <G fill={fill} transform={dy ? `translate(0 ${dy})` : undefined}>
      {MARK_D.map((d, i) => (
        <Path key={i} d={d} />
      ))}
    </G>
  );
}

/** The Q symbol. `size` = height in pt; width follows the viewBox ratio. */
export function QuizVibeMarkSvg({ size, variant = 'metallic' }: { size: number; variant?: BrandVariant }) {
  const id = useSvgId('qvMark');
  const { width: vw, height: vh } = MARK_VIEWBOX;
  return (
    <Svg width={(size * vw) / vh} height={size} viewBox={`0 0 ${vw} ${vh}`}>
      {variant === 'metallic' ? (
        <>
          <Defs>
            <LinearGradient id={`${id}g`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={vw} y2={vh}>
              {MARK_GOLD_STOPS.map(([o, c]) => (
                <Stop key={o} offset={o} stopColor={c} />
              ))}
            </LinearGradient>
            <LinearGradient id={`${id}s`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={vw * 0.6} y2={vh * 0.6}>
              <Stop offset={0} stopColor="#FFFFFF" stopOpacity={0.35} />
              <Stop offset={1} stopColor="#FFFFFF" stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <MarkShapes fill={DEPTH} dy={vh * 0.008} />
          <MarkShapes fill={`url(#${id}g)`} />
          <MarkShapes fill={`url(#${id}s)`} />
        </>
      ) : (
        <MarkShapes fill={SOLID[variant]} />
      )}
    </Svg>
  );
}

/** "QuizVibe" wordmark. `width` in pt; height follows the viewBox ratio. */
export function QuizVibeWordmarkSvg({ width, variant = 'metallic' }: { width: number; variant?: BrandVariant }) {
  const id = useSvgId('qvWord');
  const { width: vw, height: vh } = WORDMARK_VIEWBOX;
  return (
    <Svg
      width={width}
      height={(width * vh) / vw}
      viewBox={`0 0 ${vw} ${vh}`}
      accessibilityLabel="QuizVibe"
    >
      {variant === 'metallic' ? (
        <>
          <Defs>
            <LinearGradient id={`${id}g`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={vh}>
              {WORD_GOLD_STOPS.map(([o, c]) => (
                <Stop key={o} offset={o} stopColor={c} />
              ))}
            </LinearGradient>
            <LinearGradient id={`${id}s`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={vw * 0.6} y2={vh * 0.6}>
              <Stop offset={0} stopColor="#FFFFFF" stopOpacity={0.35} />
              <Stop offset={1} stopColor="#FFFFFF" stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={WORDMARK_PATH} fill={DEPTH} transform={`translate(0 ${vh * 0.02})`} />
          <Path d={WORDMARK_PATH} fill={`url(#${id}g)`} />
          <Path d={WORDMARK_PATH} fill={`url(#${id}s)`} />
        </>
      ) : (
        <Path d={WORDMARK_PATH} fill={SOLID[variant]} />
      )}
    </Svg>
  );
}

// Complete logo layout, identical to design/brand/quizvibe-logo.svg: the
// Home screen's proportions (mark 116 pt high, 16 pt gap, wordmark 220 pt
// wide) expressed relative to the logo width.
const LOGO_W = 2200;
const LOGO_MARK_H = 1160;
const LOGO_GAP = 160;

/** Mark above wordmark. `width` = overall logo width in pt. */
export function QuizVibeLogoSvg({ width, variant = 'metallic' }: { width: number; variant?: BrandVariant }) {
  const k = width / LOGO_W;
  return (
    <View style={{ alignItems: 'center', width }}>
      <QuizVibeMarkSvg size={LOGO_MARK_H * k} variant={variant} />
      <View style={{ height: LOGO_GAP * k }} />
      <QuizVibeWordmarkSvg width={width} variant={variant} />
    </View>
  );
}

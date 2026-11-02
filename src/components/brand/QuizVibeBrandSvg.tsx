import React, { useId } from 'react';
import { View } from 'react-native';
import Svg, { Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';
import { Colors } from '../../theme';
import {
  LOGO_MARK_HEIGHT,
  MARK_PATHS,
  MARK_VIEWBOX,
  WORDMARK_PATH,
  WORDMARK_VIEWBOX,
} from './quizVibeBrandGeometry';

// QuizVibe Brand Master (design/brand/) rendered with react-native-svg.
// Geometry comes from the generated quizVibeBrandGeometry.ts; this file only
// adds paint. Mark v2 (Peter 2026-11-02): thin closed ring, handle outside the
// ring, all three arcs inside it — built by design/brand/build-mark.py. Do not
// edit shapes or proportions here or in the generated file.
// Rollout status (2026-10-26): used by Home and the YouTube end-of-clip
// screen. The PNG QuizVibeGoldMark has no remaining call-sites.

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
  MARK_PATHS.handle,
];

// Avatar-varianten (2026-10-20): SAMMA låsta geometri, men utan de tre
// signalbågarna — läser rent i små storlekar. Inga nya former.
const MARK_Q_ONLY_D = [MARK_PATHS.ring, MARK_PATHS.handle];

function MarkShapes({ fill, dy = 0, paths = MARK_D }: { fill: string; dy?: number; paths?: string[] }) {
  return (
    <G fill={fill} transform={dy ? `translate(0 ${dy})` : undefined}>
      {paths.map((d, i) => (
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

/**
 * Bara de tre signalbågarna (samma låsta geometri + samma viewBox som
 * QuizVibeMarkSvg, så lagren kan staplas exakt ovanpå varandra). `arcs` =
 * vilka bågar som ritas (index i MARK_PATHS.arcs: 0 = yttersta, 2 = innersta).
 * `color` = platt färg (t.ex. grå "släckt"); utelämnad = metalliskt guld.
 */
export function QuizVibeMarkArcsSvg({ size, arcs = [0, 1, 2], color }: { size: number; arcs?: number[]; color?: string }) {
  const id = useSvgId('qvArc');
  const { width: vw, height: vh } = MARK_VIEWBOX;
  const paths = arcs.map((i) => MARK_PATHS.arcs[i]);
  return (
    <Svg width={(size * vw) / vh} height={size} viewBox={`0 0 ${vw} ${vh}`}>
      {color ? (
        <MarkShapes fill={color} paths={paths} />
      ) : (
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
          <MarkShapes fill={DEPTH} dy={vh * 0.008} paths={paths} />
          <MarkShapes fill={`url(#${id}g)`} paths={paths} />
          <MarkShapes fill={`url(#${id}s)`} paths={paths} />
        </>
      )}
    </Svg>
  );
}

/**
 * The Q symbol WITHOUT the three signal arcs (ring + handle from
 * the locked geometry). Used only for the default profile avatar. `size` =
 * height in pt. `color` paints it in one flat colour (e.g. muted inactive
 * state); omitted = the same metallic gold treatment as QuizVibeMarkSvg.
 */
export function QuizVibeMarkQOnlySvg({ size, color }: { size: number; color?: string }) {
  const id = useSvgId('qvQ');
  const { width: vw, height: vh } = MARK_VIEWBOX;
  return (
    <Svg width={(size * vw) / vh} height={size} viewBox={`0 0 ${vw} ${vh}`}>
      {color ? (
        <MarkShapes fill={color} paths={MARK_Q_ONLY_D} />
      ) : (
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
          <MarkShapes fill={DEPTH} dy={vh * 0.008} paths={MARK_Q_ONLY_D} />
          <MarkShapes fill={`url(#${id}g)`} paths={MARK_Q_ONLY_D} />
          <MarkShapes fill={`url(#${id}s)`} paths={MARK_Q_ONLY_D} />
        </>
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

// Complete logo layout, identical to design/brand/quizvibe-logo.svg — the
// composition B: gap 160, wordmark at 95 % of the 2200-unit logo width,
// centred. The mark height (LOGO_MARK_HEIGHT, v2 = 1024.3) keeps the ring the
// same size as in v1's 1160-high mark, whose frame also held the outer arc.
const LOGO_W = 2200;
const LOGO_MARK_H = LOGO_MARK_HEIGHT;
const LOGO_GAP = 160;
/**
 * Mark v2's frame is tighter than v1's (the outer arc moved inside the ring),
 * so the same pt height would render a bigger ring. Multiply a v1 mark height
 * (e.g. Home's 116 pt) by this to keep the ring at its v1 on-screen size.
 */
export const MARK_HEIGHT_FROM_V1 = MARK_VIEWBOX.height / 1000;

/** Frozen composition B: the wordmark is 95 % of the logo width. */
export const WORDMARK_LOGO_SCALE = 0.95;

/** Mark above wordmark. `width` = overall logo width in pt. */
export function QuizVibeLogoSvg({ width, variant = 'metallic' }: { width: number; variant?: BrandVariant }) {
  const k = width / LOGO_W;
  return (
    <View style={{ alignItems: 'center', width }}>
      <QuizVibeMarkSvg size={LOGO_MARK_H * k} variant={variant} />
      <View style={{ height: LOGO_GAP * k }} />
      <QuizVibeWordmarkSvg width={width * WORDMARK_LOGO_SCALE} variant={variant} />
    </View>
  );
}

/**
 * Official QuizVibe tagline — LOCKED Brand Master decision (2026-10-16).
 * One static string everywhere the brand lockup needs a tagline; never
 * rotated or varied by user state, game mode or screen.
 */
export const BRAND_TAGLINE = 'Anyone. Anywhere. Let’s play.';

// UI-state colours for small brand/nav elements (frozen rule): gold means
// active/selected; inactive or neutral states use reduced-opacity white.
// Never use gold decoratively where it could read as "active".
export const BRAND_UI_ACTIVE = Colors.warning;
export const BRAND_UI_INACTIVE = 'rgba(255,255,255,0.55)';

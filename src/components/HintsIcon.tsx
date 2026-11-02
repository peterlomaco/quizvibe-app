import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { BrandUi } from '../theme';
import { MARK_PATHS, MARK_RING, MARK_VIEWBOX } from './brand/quizVibeBrandGeometry';

interface Props {
  size?: number;
  color?: string;
  /** Behålls för API-kompatibilitet (Game Sequence skickar den). */
  simplified?: boolean;
}

// Q-ringens mitt ur geometrin. "?" ritades för v1:s innerradie 262 — K skalar
// den så den fyller hålet lika mycket (märke v2: större hål).
const RING_CX = MARK_RING.cx;
const RING_CY = MARK_RING.cy;
const K = MARK_RING.inner / 262;

/**
 * Hints-ikonen (Peter 2026-10-22): samma förenklade vektor-Q som bottom
 * bannerns Home-ikon (ring + handtag, inga signalbågar),
 * enfärgad, med ett "?" ritat i ringens mitt. `size` = höjd i pt.
 */
export function HintsIcon({ size = 20, color = BrandUi.iconMuted }: Props) {
  const { width: vw, height: vh } = MARK_VIEWBOX;
  const cx = RING_CX;
  return (
    <Svg width={(size * vw) / vh} height={size} viewBox={`0 0 ${vw} ${vh}`}>
      <Path d={MARK_PATHS.ring} fill={color} />
      <Path d={MARK_PATHS.handle} fill={color} />
      {/* "?" centrerat i ringhålet. */}
      <Path
        d={`M ${cx - 82 * K} ${RING_CY - 62 * K} A ${82 * K} ${82 * K} 0 1 1 ${cx + 40 * K} ${RING_CY + 8 * K} C ${cx + 8 * K} ${RING_CY + 26 * K} ${cx} ${RING_CY + 46 * K} ${cx} ${RING_CY + 82 * K}`}
        stroke={color}
        strokeWidth={62 * K}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx={cx} cy={RING_CY + 172 * K} r={36 * K} fill={color} />
    </Svg>
  );
}

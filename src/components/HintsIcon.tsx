import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { BrandUi } from '../theme';
import { MARK_PATHS, MARK_VIEWBOX } from './brand/quizVibeBrandGeometry';

interface Props {
  size?: number;
  color?: string;
  /** Behålls för API-kompatibilitet (Game Sequence skickar den). */
  simplified?: boolean;
}

// Q-ringens mitt + inre radie i MARK_VIEWBOX (uträknat ur ring-pathen).
const RING_CX = 425.93;
const RING_CY = 523.93;

/**
 * Hints-ikonen (Peter 2026-10-22): samma förenklade vektor-Q som bottom
 * bannerns Home-ikon (ring + connector + handtag, inga signalbågar),
 * enfärgad, med ett "?" ritat i ringens mitt. `size` = höjd i pt.
 */
export function HintsIcon({ size = 20, color = BrandUi.iconMuted }: Props) {
  const { width: vw, height: vh } = MARK_VIEWBOX;
  const cx = RING_CX;
  return (
    <Svg width={(size * vw) / vh} height={size} viewBox={`0 0 ${vw} ${vh}`}>
      <Path d={MARK_PATHS.ring} fill={color} />
      <Path d={MARK_PATHS.connector} fill={color} />
      <Path d={MARK_PATHS.handle} fill={color} />
      {/* "?" centrerat i ringhålet (inre radie ≈ 262). */}
      <Path
        d={`M ${cx - 82} ${RING_CY - 62} A 82 82 0 1 1 ${cx + 40} ${RING_CY + 8} C ${cx + 8} ${RING_CY + 26} ${cx} ${RING_CY + 46} ${cx} ${RING_CY + 82}`}
        stroke={color}
        strokeWidth={62}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx={cx} cy={RING_CY + 172} r={36} fill={color} />
    </Svg>
  );
}

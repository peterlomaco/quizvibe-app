import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../theme';

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Outline pointing hand on the 24-grid (same stroke language as the other
 * outline icons). Used as a swipe affordance on the year timeline.
 * Geometry adapted from Lucide "pointer" (ISC).
 */
export function SwipeHandIcon({ size = 28, color = Colors.textPrimary, strokeWidth = 1.8 }: Props) {
  const p = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M22 14a8 8 0 0 1-8 8" {...p} />
      <Path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2" {...p} />
      <Path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1" {...p} />
      <Path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10" {...p} />
      <Path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" {...p} />
    </Svg>
  );
}

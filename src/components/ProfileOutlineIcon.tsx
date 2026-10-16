import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors } from '../theme';

interface Props {
  size?: number;
  color?: string;
  /** Stroke width in viewBox units (24-unit grid, so 1 unit = size / 24 pt). */
  strokeWidth?: number;
}

/**
 * Clean person/profile outline: head circle + shoulders. Functional UI icon
 * (bottom navigation Profile tab). Drawn on the same 24-unit grid and stroke
 * weight as ShoppingCartIcon so the nav icons read as one set.
 */
export function ProfileOutlineIcon({ size = 24, color = Colors.textPrimary, strokeWidth = 1.8 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={8} r={3.75} stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Path
        d="M4.75 20 C4.75 16.1 8 13.75 12 13.75 C16 13.75 19.25 16.1 19.25 20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../theme';

interface Props {
  size?: number;
  color?: string;
  /** Stroke width in viewBox units (24-unit grid, so 1 unit = size / 24 pt). */
  strokeWidth?: number;
}

/**
 * House outline (roof + body + door). Functional UI icon for the bottom
 * navigation Home tab. Same 24-unit grid and stroke weight as
 * ProfileOutlineIcon / ShoppingCartIcon so the nav icons read as one set.
 */
export function HomeOutlineIcon({ size = 24, color = Colors.textPrimary, strokeWidth = 1.8 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3.75 10.5 L12 3.75 L20.25 10.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M5.75 9 V19.25 a1 1 0 0 0 1 1 H9.75 V14.75 H14.25 V20.25 H17.25 a1 1 0 0 0 1 -1 V9"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

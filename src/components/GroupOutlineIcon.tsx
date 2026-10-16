import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors } from '../theme';

interface Props {
  size?: number;
  color?: string;
  /** Stroke width in viewBox units (24-unit grid). */
  strokeWidth?: number;
}

/**
 * Two-person outline (a front figure with a second one behind it) for
 * "Multiplayer". Same 24-unit grid, stroke and round caps as
 * ProfileOutlineIcon / ShoppingCartIcon so they read as one icon family.
 */
export function GroupOutlineIcon({ size = 24, color = Colors.textPrimary, strokeWidth = 1.8 }: Props) {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Front figure */}
      <Circle cx={9} cy={8.25} r={3.25} {...common} />
      <Path d="M2.75 19.5 C2.75 16.2 5.6 14 9 14 C12.4 14 15.25 16.2 15.25 19.5" {...common} />
      {/* Figure behind: right half of the head + shoulder */}
      <Path d="M15.25 5.1 A3.15 3.15 0 0 1 15.25 11.4" {...common} />
      <Path d="M17.6 14.2 C19.8 14.8 21.25 16.7 21.25 19.5" {...common} />
    </Svg>
  );
}

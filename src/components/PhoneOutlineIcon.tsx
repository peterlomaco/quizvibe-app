import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { Colors } from '../theme';

interface Props {
  size?: number;
  color?: string;
  /** Stroke width in viewBox units (24-unit grid). */
  strokeWidth?: number;
}

/**
 * Smartphone outline (rounded body + earpiece slot + home bar). Same 24-unit
 * grid, stroke and round caps as ProfileOutlineIcon / GroupOutlineIcon so
 * they read as one icon family.
 */
export function PhoneOutlineIcon({ size = 24, color = Colors.textPrimary, strokeWidth = 1.8 }: Props) {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={6.25} y={2.75} width={11.5} height={18.5} rx={2.6} {...common} />
      <Path d="M10.6 5.6 H13.4" {...common} />
      <Path d="M10.4 18.2 H13.6" {...common} />
    </Svg>
  );
}

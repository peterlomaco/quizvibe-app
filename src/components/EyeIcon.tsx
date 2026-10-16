import React from 'react';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { Colors } from '../theme';

interface Props {
  size?: number;
  color?: string;
  /** true = överstruket öga (lösenordet syns, tap döljer det). */
  off?: boolean;
}

/**
 * Öga / överstruket öga för visa/dölj lösenord (Log in-formuläret).
 * Ren SVG så ingen ikon-font behöver laddas.
 */
export function EyeIcon({ size = 22, color = Colors.textSecondary, off = false }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M2 12 C4.5 7 8 5 12 5 C16 5 19.5 7 22 12 C19.5 17 16 19 12 19 C8 19 4.5 17 2 12 Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.8} fill="none" />
      {off && (
        <Line x1={4} y1={20} x2={20} y2={4} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      )}
    </Svg>
  );
}

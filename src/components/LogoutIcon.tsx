import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../theme';

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Enkel logga-ut-ikon (dörrkarm + pil ut åt höger) på samma 24-grid och
 * streckvikt som övriga UI-ikoner.
 */
export function LogoutIcon({ size = 22, color = Colors.error, strokeWidth = 1.8 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M10 4 H6 C5 4 4.5 4.5 4.5 5.5 V18.5 C4.5 19.5 5 20 6 20 H10"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M10.5 12 H19.5 M16 8.5 L19.5 12 L16 15.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

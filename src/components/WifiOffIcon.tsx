import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors } from '../theme';

interface Props {
  size?: number;
}

export function WifiOffIcon({ size = 16 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="25 25 24 24">
      {/* WiFi-arcs + dot (dämpad grå) — radier 11 / 8.5 / 6, skiftade +6y */}
      <Path
        d="M 29.22 35.22 A 11 11 0 0 1 44.78 35.22"
        fill="none"
        stroke={Colors.textSecondary}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Path
        d="M 30.99 36.99 A 8.5 8.5 0 0 1 43.01 36.99"
        fill="none"
        stroke={Colors.textSecondary}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Path
        d="M 32.76 38.76 A 6 6 0 0 1 41.24 38.76"
        fill="none"
        stroke={Colors.textSecondary}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Circle cx="37" cy="43" r="1.5" fill={Colors.textSecondary} />
      {/* Rött kryss — kortare linjer + tunnare stroke */}
      <Path
        d="M 32 32 L 42 42"
        stroke={Colors.error}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <Path
        d="M 42 32 L 32 42"
        stroke={Colors.error}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

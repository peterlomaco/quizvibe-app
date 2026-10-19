import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../theme';

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Papperskorg (lock + korg + två ränder) på samma 24-grid och streckvikt som
 * LogoutIcon. Används för destruktiva kontoåtgärder (Delete Account).
 */
export function TrashIcon({ size = 20, color = Colors.error, strokeWidth = 1.8 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 6.5 H20 M9.5 6.5 V4.5 C9.5 4 10 3.5 10.5 3.5 H13.5 C14 3.5 14.5 4 14.5 4.5 V6.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M6 6.5 L7 19 C7.1 19.9 7.7 20.5 8.6 20.5 H15.4 C16.3 20.5 16.9 19.9 17 19 L18 6.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M10 10.5 V16.5 M14 10.5 V16.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

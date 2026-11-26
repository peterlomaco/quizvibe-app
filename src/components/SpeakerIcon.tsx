import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../theme';

interface Props {
  size?: number;
  /** true = sound on (gold waves), false = muted (×). */
  on: boolean;
  /** Speaker body colour. */
  color?: string;
  /** Sound-wave colour when on. Defaults to QuizVibe gold. */
  waveColor?: string;
  /** Stroke width in viewBox units (24-unit grid). */
  strokeWidth?: number;
}

/**
 * Speaker outline in the same 24-unit grid, stroke and round caps as
 * PhoneOutlineIcon / GroupOutlineIcon / ProfileOutlineIcon.
 *
 * On: two signal arcs, echoing the arcs in the QuizVibe Q mark.
 * Off: a crisp ×, so muted reads clearly even at 16 pt.
 */
export function SpeakerIcon({
  size = 18,
  on,
  color = Colors.textPrimary,
  waveColor = Colors.warning,
  strokeWidth = 1.8,
}: Props) {
  const common = {
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3.5 9.4 H7.1 L11.6 5.4 V18.6 L7.1 14.6 H3.5 Z" stroke={color} {...common} />
      {on ? (
        <>
          <Path d="M15.2 9.6 A3.4 3.4 0 0 1 15.2 14.4" stroke={waveColor} {...common} />
          <Path d="M17.9 6.8 A7.2 7.2 0 0 1 17.9 17.2" stroke={waveColor} {...common} />
        </>
      ) : (
        <>
          <Path d="M15.6 9.6 L20.4 14.4" stroke={color} {...common} />
          <Path d="M20.4 9.6 L15.6 14.4" stroke={color} {...common} />
        </>
      )}
    </Svg>
  );
}

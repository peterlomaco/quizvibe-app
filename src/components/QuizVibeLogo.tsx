import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Colors } from '../theme';

interface Props {
  size?: number;
}

/**
 * QuizVibe-loggan: två lätt roterade rundade kvadrater med en Q-figur i
 * mitten. Används på startskärmen som brand-mark och i Lobby:s room-card
 * bredvid Room Code-numret. Färgerna kommer från theme-tokens så loggan
 * följer dark mode-paletten utan hårdkodade hex-värden.
 */
export function QuizVibeLogo({ size = 80 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      {/* Bakre kvadrat – något roterad */}
      <Rect
        x="18" y="18" width="44" height="44" rx="12"
        fill={Colors.primaryMuted}
        stroke={Colors.primaryBorder}
        strokeWidth="1.5"
        transform="rotate(12 40 40)"
      />
      {/* Främre kvadrat */}
      <Rect
        x="16" y="16" width="44" height="44" rx="12"
        fill={Colors.card}
        stroke={Colors.primary}
        strokeWidth="1.5"
        transform="rotate(-6 40 40)"
      />
      {/* Q-form (cirkel + svans) skiftad −3 i x och −1 i y från sitt
          tidigare läge så Q+svansens visuella bounding-box (24-52 ×
          24-52) hamnar centrerad i den främre kvadraten (16-60 × 16-60,
          center 38, 38). Wifi-symbolen följer med så pricken sitter
          fortsatt mitt i Q-ringen. */}
      {/* Q-form – stor cirkel */}
      <Circle
        cx="37" cy="37" r="13"
        fill="none"
        stroke={Colors.primary}
        strokeWidth="3"
      />
      {/* Q-svans */}
      <Path
        d="M46 46 L52 52"
        stroke={Colors.primary}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Wifi-symbol centrerad på Q-ringens nya center (37, 37) —
          pricken delar mittpunkt med Q-cirkeln, och bågarna är
          koncentriska. 90°-bågar med radier 3/5/7. */}
      <Path
        d="M 32.05 32.05 A 7 7 0 0 1 41.95 32.05"
        fill="none"
        stroke={Colors.primary}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Path
        d="M 33.46 33.46 A 5 5 0 0 1 40.54 33.46"
        fill="none"
        stroke={Colors.primary}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Path
        d="M 34.88 34.88 A 3 3 0 0 1 39.12 34.88"
        fill="none"
        stroke={Colors.primary}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Circle cx="37" cy="37" r="1.5" fill={Colors.primary} />
    </Svg>
  );
}

import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors } from '../theme';

interface Props {
  size?: number;
  color?: string;
}

/**
 * Standalone wifi-fan — samma symbol som sitter inuti Q-ringen i
 * `QuizVibeLogo`, men extraherad och färg-konfigurerbar för andra ytor.
 * Tre koncentriska 90°-bågar (radier 3/5/7) + en centrum-prick.
 *
 * Används idag av live-leaderboarden i `GetReadyIntro` för att signalera
 * att en spelare har unstable connection (grå/textSecondary-färg, samma
 * styl-vokabulär som "Has left the game"-raden).
 */
export function WifiFanIcon({ size = 16, color = Colors.textSecondary }: Props) {
  // Källan i QuizVibeLogo ritar mot center (37, 37) inom ett 80×80-viewBox.
  // Här croppar vi till en tight viewBox runt själva fan:n (29-45 × 29-45)
  // så ikonen fyller renderar-arean utan padding.
  return (
    <Svg width={size} height={size} viewBox="29 29 16 16">
      <Path
        d="M 32.05 32.05 A 7 7 0 0 1 41.95 32.05"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Path
        d="M 33.46 33.46 A 5 5 0 0 1 40.54 33.46"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Path
        d="M 34.88 34.88 A 3 3 0 0 1 39.12 34.88"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Circle cx="37" cy="37" r="1.5" fill={color} />
    </Svg>
  );
}

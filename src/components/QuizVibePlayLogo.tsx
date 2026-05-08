import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Colors } from '../theme';

interface Props {
  size?: number;
  /** Override för Q-ring/svans/play-triangel + båda squares-kanter. Default
   *  Colors.primary (blå brand). Sätt Colors.warning (#F5A623) i GetReady
   *  så hela loggan matchar gold-glow-halo:n runt den. */
  color?: string;
}

/**
 * Variant av QuizVibeLogo med en play-triangel ▶ centrerad i Q-ringen istället
 * för wifi-fan eller "?". Används som spelstart-knapp i GetReadyIntro så
 * brand-mark:en själv är play-affordancen — ingen separat blå fyrkant runt.
 *
 * Squares + Q-ring + Q-svans är identiska med QuizVibeLogo så loggan känns
 * konsistent över hela appen — bara symbolen inuti Q-ringen är annorlunda.
 *
 * `color`-propen styr alla brand-färgade element (squares-kanter, Q-ring,
 * svans, play-triangel) så loggan kan göras helt gold genom att passera in
 * Colors.warning. Bakre kvadratens muted-fyllning härleds som hex+alpha
 * (`color + '30'` ≈ 19 % opacity) så den blir tonad mot loggans color istället
 * för att fastna på primaryMuted-blått.
 */
export function QuizVibePlayLogo({ size = 80, color = Colors.primary }: Props) {
  // Härled muted/border-toner från color så bakre kvadraten matchar
  // huvudfärgen även när color override:as till t.ex. warning.
  const mutedFill = color + '30';   // ~19 % opacity
  const borderTone = color + '60';  // ~38 % opacity
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      {/* Bakre kvadrat */}
      <Rect
        x="18" y="18" width="44" height="44" rx="12"
        fill={mutedFill}
        stroke={borderTone}
        strokeWidth="1.5"
        transform="rotate(12 40 40)"
      />
      {/* Främre kvadrat */}
      <Rect
        x="16" y="16" width="44" height="44" rx="12"
        fill={Colors.card}
        stroke={color}
        strokeWidth="1.5"
        transform="rotate(-6 40 40)"
      />
      {/* Q-ring centrerad på (37, 37) */}
      <Circle
        cx="37" cy="37" r="13"
        fill="none"
        stroke={color}
        strokeWidth="3"
      />
      {/* Q-svans */}
      <Path
        d="M46 46 L52 52"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Play-triangel inne i Q-ringen. Triangeln pekar höger med visuell
          mitt vid (37, 37). Vänsterkanten på 33, höger-spets på 43, höjd
          mellan 31–43 → bounding box 10×12, optisk midpoint vid 36.66 så
          en liten höger-skift krävs inte. */}
      <Path
        d="M33 31 L43 37 L33 43 Z"
        fill={color}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

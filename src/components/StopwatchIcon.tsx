import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

/**
 * Modern sport-stopwatch-ikon (SVG). Renderas med en tonad färg som ärvs
 * av call-site:n så ikonen kan följa stopwatchColor (timerColor i question,
 * ljusblå i awaiting/reveal). Designen speglar en klassisk handhållen
 * sport-tidtagaruret: rund kropp, top crown-knapp, sido-knapp och en
 * minutvisare som pekar mot 1-2-positionen ("running"-känsla).
 */
export function StopwatchIcon({ size = 24, color = '#FFFFFF' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Top crown — knapp ovanpå klockan */}
      <Rect
        x="9.5"
        y="1.5"
        width="5"
        height="2"
        rx="0.6"
        fill={color}
      />
      {/* Stem mellan crown och kropp */}
      <Rect x="11" y="3" width="2" height="2" fill={color} />
      {/* Sido-knapp (top-right diagonal) */}
      <Path
        d="M18.4 4.4 L20.0 6.0"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Klockans kropp */}
      <Circle
        cx="12"
        cy="14"
        r="7.5"
        stroke={color}
        strokeWidth="1.6"
        fill="none"
      />
      {/* Inre tick-markeringar vid 12-positionen */}
      <Path
        d="M12 7.5 L12 9"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Visare som pekar mot ~1-2-positionen (45° upp-höger), antyder
          aktiv timing — startad men inte stoppad. */}
      <Path
        d="M12 14 L15.2 10.8"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Center-pivot */}
      <Circle cx="12" cy="14" r="1" fill={color} />
    </Svg>
  );
}

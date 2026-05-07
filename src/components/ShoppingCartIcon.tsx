import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors } from '../theme';

interface Props {
  size?: number;
  color?: string;
}

/**
 * Liten kundvagns-glyph (basket + två hjul) avsedd som leading-ikon på
 * Store-knappar i profilmenyn (Home) och logout-sheet:n (Profile).
 * Default-färg matchar textPrimary så ikonen smälter in i knapptexten.
 */
export function ShoppingCartIcon({ size = 22, color = Colors.textPrimary }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Handtag + basket-kontur — handtaget startar uppe vänster, går
          ner till basket-toppen, sedan över toppkanten och ner längs
          höger sida. */}
      <Path
        d="M2.5 4 H5 L7.2 14.2 H17.5 L19.5 7 H6.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Vänster hjul */}
      <Circle cx={8.5} cy={19} r={1.5} fill={color} />
      {/* Höger hjul */}
      <Circle cx={16.5} cy={19} r={1.5} fill={color} />
    </Svg>
  );
}

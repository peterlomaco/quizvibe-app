import React from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
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
      {/* Spotify-style ljudvågs-bågar — 3 staplade bågar med upward-bulge
          (frown-orientering, ⌒). Bredd avtagande topp-till-botten så de
          läser som "ljudvågor som emanerar". 2 av 3 är inne i Q-ringen
          (radius 13 från (37, 37)), den översta (största) extends utanför
          ringens topp-kant.

          Wrappade i en <G> med rotate(25 37 37) så bågarna lutar (vänster
          endpoint högre, höger lägre) precis som Spotify-loggans bågar.
          25° är empiriskt tunat — tydlig Spotify-style snedställning.
          Rotationen bevarar avstånd från Q-center så inside/outside-
          fördelningen är oförändrad. */}
      <G transform="rotate(25 37 37)">
        {/* Topp-båge (UTANFÖR Q-ringen). Endpoints (29, 23) & (45, 23),
            bredd 16 (var 22 → kortare per användarens önskan), R 12,
            midpoint (37, ~20.9). Endpoints dist ≈16 från Q-center, mid
            ≈17 — utanför ring-radius 13 med synlig clearance till
            Q-ringens kantlinje. */}
        <Path
          d="M 29 23 A 12 12 0 0 1 45 23"
          fill="none"
          stroke={Colors.primary}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Mitten-båge (INNE i Q-ringen). Endpoints (31, 30) & (43, 30),
            bredd 12, R 9, midpoint (37, ~27.7). Flyttad ner mot Q-centrum
            (y=30 var 28) per användarens önskan om mer centrerad placering. */}
        <Path
          d="M 31 30 A 9 9 0 0 1 43 30"
          fill="none"
          stroke={Colors.primary}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Botten-båge (INNE i Q-ringen). Endpoints (33, 34) & (41, 34),
            bredd 8, R 6, midpoint (37, ~32.5). Flyttad ner mot Q-centrum
            (y=34 var 32) i tandem med mitten-bågen. */}
        <Path
          d="M 33 34 A 6 6 0 0 1 41 34"
          fill="none"
          stroke={Colors.primary}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
}

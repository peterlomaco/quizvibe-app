import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Colors } from '../theme';

interface Props {
  size?: number;
}

/**
 * QuizVibe friends-loggan: variant av QuizVibeLogo där wifi-symbolen i
 * Q-ringens centrum är ersatt med två profil-silhouetter (huvud +
 * skuldror). Förstärker att QuizVibe friends-funktionen är en intern
 * Quizvibe-setup för att bjuda in andra registrerade spelare.
 *
 * Q-formen, svansen och de roterade kvadraterna är identiska med
 * QuizVibeLogo så de två märkena läses som samma visuella familj.
 *
 * ViewBox är tight (13 13 54 54) — croppar bort den tomma padding som
 * QuizVibeLogo har runt det synliga innehållet, så friends-loggan
 * fyller hela render-arean. Det gör att vänsterkanten av synligt
 * innehåll alignar med andra header-ikoners vänsterkant när de står
 * med samma left-padding i sina cards.
 */
export function QuizVibeFriendsLogo({ size = 44 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="13 13 54 54">
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
      {/* Q-form – stor cirkel. Centrerad på (38, 38) = de roterade
          kvadraternas pre-rotation-mittpunkt (squares spans 16-60 →
          mid = 38). Det centrerar Q inom själva kvadrat-formen istället
          för viewBox-mitten (40, 40), som är aningen offset från
          kvadraternas visuella mitt. */}
      <Circle
        cx="38" cy="38" r="13"
        fill="none"
        stroke={Colors.primary}
        strokeWidth="3"
      />
      {/* Q-svans */}
      <Path
        d="M47 47 L53 53"
        stroke={Colors.primary}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Profil-silhouetter centrerade i Q-ringen (38, 38) — två personer
          side-by-side, head (cirkel) + body (rounded rect). Bytte ut
          wifi-mönstret som finns i QuizVibeLogo. */}
      {/* Vänster person */}
      <Circle cx="34" cy="34" r="2" fill={Colors.primary} />
      <Rect x="31" y="37" width="6" height="5" rx="2" fill={Colors.primary} />
      {/* Höger person */}
      <Circle cx="42" cy="34" r="2" fill={Colors.primary} />
      <Rect x="39" y="37" width="6" height="5" rx="2" fill={Colors.primary} />
    </Svg>
  );
}

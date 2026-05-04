import React from 'react';
import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg';
import { Colors } from '../theme';

interface Props {
  size?: number;
}

/**
 * Variant av QuizVibeLogo med ett `?`-glyph centrerat i Q-ringen istället
 * för wifi-fan. Används som overlay-symbol i progressive reveal-covern
 * (Namn-svarsmodellen) — signalerar "vi vet inte ännu" innan bilden avslöjas.
 *
 * Squares, Q-ring och Q-svans är identiska med `QuizVibeLogo` så brand-mark:en
 * är konsekvent över hela appen — bara symbolen inuti Q-ringen är annorlunda.
 */
export function QuizVibeQuestionMarkLogo({ size = 80 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      {/* Bakre kvadrat */}
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
      {/* Q-ring centrerad på (37, 37) */}
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
      {/* "?" centrerad i Q-ringen. y=43 placerar glyphens visuella mitt
          ungefär vid y=37 (Q-ring-center) — SvgText:s y refererar till
          baseline, så vi skiftar ner ~6 från center. */}
      <SvgText
        x="37"
        y="43"
        fontSize="18"
        fontWeight="bold"
        fill={Colors.primary}
        textAnchor="middle"
      >
        ?
      </SvgText>
    </Svg>
  );
}

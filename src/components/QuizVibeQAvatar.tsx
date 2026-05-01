import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors } from '../theme';

interface Props {
  size?: number;
}

/**
 * Q-only QuizVibe-mark med ett glatt ansikte (öga-öga-glad mun) inuti
 * ringen. Default-avatar för registrerade users som inte valt en custom
 * emoji-avatar än — ersätter den generiska 👤-silhouetten i TopUserBanner
 * och logout-sheet-headers så profilen läser som "knuten till QuizVibe-
 * varumärket" direkt efter registrering.
 *
 * Inga omgärdande rutor (jfr QuizVibeLogo / QuizVibeFriendsLogo) eftersom
 * den används inline i avatar-storlek snarare än som full brand-mark —
 * Q + svans + ansikte räcker som visuell signal.
 */
export function QuizVibeQAvatar({ size = 44 }: Props) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="23 23 32 32">
        {/* Q-ring */}
        <Circle
          cx={38}
          cy={38}
          r={13}
          fill="none"
          stroke={Colors.primary}
          strokeWidth={3}
        />
        {/* Q-svans */}
        <Path
          d="M47 47 L53 53"
          stroke={Colors.primary}
          strokeWidth={3}
          strokeLinecap="round"
        />
        {/* Vänster öga */}
        <Circle cx={34} cy={34} r={1.5} fill={Colors.primary} />
        {/* Höger öga */}
        <Circle cx={42} cy={34} r={1.5} fill={Colors.primary} />
        {/* Glad mun – kvadratisk Q-curve med kontrollpunkten under
            start/slut så bågen bukar nedåt (smile). */}
        <Path
          d="M 33 39 Q 38 43 43 39"
          stroke={Colors.primary}
          strokeWidth={1.5}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

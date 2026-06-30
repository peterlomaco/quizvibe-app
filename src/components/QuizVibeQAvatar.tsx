import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { Colors } from '../theme';

interface Props {
  size?: number;
  /** Färg på alla brand-element (ring, svans, inre glyph). Default Colors.primary. */
  color?: string;
  /**
   * Innehåll inom Q-ringen. 'smile' = öga-öga-glad mun (default, används i
   * TopUserBanner och Profile-headers). 'wifi' = Spotify-stilade sound-wave-
   * arcs matchande QuizVibeLogo:s inre — används där brand-markens "audio/
   * signal"-tema förstärker meddelandet (t.ex. Final Leaderboard:s Home-
   * knapp). Wifi-arcs är verbatim-kopia av logo:s arcs translaterade +1x +1y
   * till avatar:s Q-center; viewBox expanderas så top-arc inte klipps. */
  variant?: 'smile' | 'wifi';
}

/**
 * Q-only QuizVibe-mark med valbart innehåll i ringen (glatt ansikte eller
 * wifi-fan). Default-avatar för registrerade users som inte valt en custom
 * emoji-avatar än — ersätter den generiska 👤-silhouetten i TopUserBanner
 * och logout-sheet-headers så profilen läser som "knuten till QuizVibe-
 * varumärket" direkt efter registrering.
 *
 * Inga omgärdande rutor (jfr QuizVibeLogo / QuizVibeFriendsLogo) eftersom
 * den används inline i avatar-storlek snarare än som full brand-mark —
 * Q + svans + ansikte/wifi räcker som visuell signal.
 */
export function QuizVibeQAvatar({ size = 44, variant = 'smile', color = Colors.primary }: Props) {
  // ViewBox expanderas för wifi-variant så top-bågen (som extends utanför
  // Q-ringen, samma som QuizVibeLogo) inte klipps. Smile-variant behåller
  // sin tätare viewBox för bakåtkompatibilitet med befintliga call-sites.
  const viewBoxStr = variant === 'wifi' ? '21 21 36 36' : '23 23 32 32';
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={viewBoxStr}>
        {/* Q-ring */}
        <Circle
          cx={38}
          cy={38}
          r={13}
          fill="none"
          stroke={color}
          strokeWidth={3}
        />
        {/* Q-svans */}
        <Path
          d="M47 47 L53 53"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
        />
        {variant === 'wifi' ? (
          <G transform="rotate(25 38 38)">
            <Path
              d="M 30 24 A 12 12 0 0 1 46 24"
              fill="none"
              stroke={color}
              strokeWidth={1.8}
              strokeLinecap="round"
            />
            <Path
              d="M 32 31 A 9 9 0 0 1 44 31"
              fill="none"
              stroke={color}
              strokeWidth={1.8}
              strokeLinecap="round"
            />
            <Path
              d="M 34 35 A 6 6 0 0 1 42 35"
              fill="none"
              stroke={color}
              strokeWidth={1.8}
              strokeLinecap="round"
            />
          </G>
        ) : (
          <>
            {/* Vänster öga */}
            <Circle cx={34} cy={34} r={1.5} fill={color} />
            {/* Höger öga */}
            <Circle cx={42} cy={34} r={1.5} fill={color} />
            {/* Glad mun */}
            <Path
              d="M 33 39 Q 38 43 43 39"
              stroke={color}
              strokeWidth={1.5}
              fill="none"
              strokeLinecap="round"
            />
          </>
        )}
      </Svg>
    </View>
  );
}

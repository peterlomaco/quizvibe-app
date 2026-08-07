import React from 'react';
import Svg, { Circle, Rect as SvgRect, Text as SvgText } from 'react-native-svg';
import { Colors } from '../theme';

/** 1vs1-ikonen: två profil-silhuetter med ett stort guld-"vs" lagt OVANPÅ
 *  dem (texten täcker mitten av båda figurerna — de syns alltså inte i sin
 *  helhet, vilket är avsikten).
 *
 *  Silhuetterna efterliknar QuizVibeFriendsLogo:s ("QuizVibe Community and
 *  Friends" i Profile) — huvud-cirkel + rundad kropp i samma proportioner
 *  (r : bredd : höjd : mellanrum = 2 : 6 : 5 : 1), uppskalade ×3.
 *
 *  "vs" ritas SIST (= överst i SVG:s måleriordning) och renderas två gånger:
 *  först en tjock kontur i kortets bakgrundsfärg som "halo", sedan guld-
 *  fyllningen — så texten separeras tydligt från de blå figurerna under.
 *
 *  Delas av Home:s "Remote Play"-val (HostTypeOptions) och "1vs1 Games"-
 *  knappen (MyMatchesSection) så duell-läget har EN ikon i appen. Båda
 *  ytorna har `Colors.cardElevated` som bakgrund, vilket är exakt vad
 *  halo-konturen målar med. */
export function VersusIcon({ height = 40 }: { height?: number }) {
  // viewBox 56×46 → bredd/höjd-kvot ~1.22.
  const width = height * (56 / 46);
  return (
    <Svg width={width} height={height} viewBox="0 0 56 46">
      {/* Vänster person — huvud (r 6) + kropp (17×14, rx 6), 3 luft emellan. */}
      <Circle cx={18} cy={16} r={6} fill={Colors.primary} />
      <SvgRect x={9.5} y={25} width={17} height={14} rx={6} fill={Colors.primary} />
      {/* Höger person — bara 3 enheters glapp mot den vänstra så "vs" nedan
          hamnar tvärs över båda. */}
      <Circle cx={38} cy={16} r={6} fill={Colors.primary} />
      <SvgRect x={29.5} y={25} width={17} height={14} rx={6} fill={Colors.primary} />
      {/* "vs" ovanpå — halo först, sedan guld-fyllningen. Liten (15) och
          ihoptryckt i bredd (textLength 15 + spacingAndGlyphs) så texten
          bara täcker mitten av silhuetterna. */}
      <SvgText
        x={28}
        y={32}
        fontSize={15}
        fontWeight="bold"
        fill={Colors.cardElevated}
        stroke={Colors.cardElevated}
        strokeWidth={4}
        textAnchor="middle"
        textLength={15}
        lengthAdjust="spacingAndGlyphs"
      >
        vs
      </SvgText>
      <SvgText
        x={28}
        y={32}
        fontSize={15}
        fontWeight="bold"
        fill={Colors.warning}
        textAnchor="middle"
        textLength={15}
        lengthAdjust="spacingAndGlyphs"
      >
        vs
      </SvgText>
    </Svg>
  );
}

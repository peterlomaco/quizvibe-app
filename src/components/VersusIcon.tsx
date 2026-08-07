import React from 'react';
import Svg, { Circle, Path, Rect as SvgRect } from 'react-native-svg';
import { Colors } from '../theme';

/** 1vs1-ikonen: två profil-silhuetter — den vänstra något högre, den högra
 *  något lägre — med en wifi-symbol emellan (fjärr-duell över nätet).
 *  (Guld-"vs" ovanpå togs bort 2026-08-07, prick-linjen ersattes av wifi:n
 *  samma dag, per Peter.)
 *
 *  Silhuetterna efterliknar QuizVibeFriendsLogo:s ("QuizVibe Community and
 *  Friends" i Profile) — huvud-cirkel + rundad kropp i samma proportioner
 *  (r : bredd : höjd : mellanrum = 2 : 6 : 5 : 1), uppskalade ×3. Wifi-
 *  bågarna följer QuizVibeLogo:s vokabulär (koncentriska bågar + prick,
 *  strokeWidth 1.8, rundade ändar) men i guld (Colors.warning) så de
 *  läser som accent mot de blå silhuetterna — samma blå/guld-kontrast som
 *  det tidigare "vs" hade.
 *
 *  Delas av Home:s "Remote Play"-val (HostTypeOptions), "Remote Play
 *  History"-knappen (MyMatchesSection) och samma skärms rubrik så duell-
 *  läget har EN ikon i appen. */

export function VersusIcon({ height = 40 }: { height?: number }) {
  // viewBox 64×46 → bredd/höjd-kvot ~1.39.
  const width = height * (64 / 46);
  return (
    <Svg width={width} height={height} viewBox="0 0 64 46">
      {/* Vänster person — huvud (r 6) + kropp (17×14, rx 6), 3 luft emellan.
          Sitter 4 enheter HÖGRE än den högra så paret läses som en duell
          över en diagonal linje. */}
      <Circle cx={15} cy={12} r={6} fill={Colors.primary} />
      <SvgRect x={6.5} y={21} width={17} height={14} rx={6} fill={Colors.primary} />
      {/* Höger person — samma form, 4 enheter LÄGRE. */}
      <Circle cx={49} cy={20} r={6} fill={Colors.primary} />
      <SvgRect x={40.5} y={29} width={17} height={14} rx={6} fill={Colors.primary} />
      {/* Wifi-symbol i glappet mellan figurerna (x 23.5–40.5): tre
          koncentriska bågar (R 9 / 6.5 / 4) med apex uppåt + prick i
          botten, centrerade på x=32. Bredaste bågen är 15 enheter → ~1
          enhets luft mot vardera kroppen. */}
      <Path
        d="M 24.5 22 A 9 9 0 0 1 39.5 22"
        fill="none"
        stroke={Colors.warning}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Path
        d="M 26.5 24.5 A 6.5 6.5 0 0 1 37.5 24.5"
        fill="none"
        stroke={Colors.warning}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Path
        d="M 28.5 27 A 4 4 0 0 1 35.5 27"
        fill="none"
        stroke={Colors.warning}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Circle cx={32} cy={29.5} r={1.5} fill={Colors.warning} />
    </Svg>
  );
}

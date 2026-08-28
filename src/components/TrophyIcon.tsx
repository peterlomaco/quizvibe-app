import React from 'react';
import Svg, { Path, Rect as SvgRect } from 'react-native-svg';
import { Colors } from '../theme';

/** Competition-ikonen (Home:s "Competition"-knapp): en enkel, fylld pokal i
 *  brand-blått — samma visuella vikt och samma blå (Colors.primary) som
 *  1vs1-knappens silhuetter (VersusIcon) så de två Home-knapparna läser som
 *  ett par. Handtagen är strokade bågar i samma blå; kupa/stjälk/fot är
 *  fyllda. `height`-prop + viewBox-konvention som VersusIcon/SoloIcon. */
export function TrophyIcon({ height = 22 }: { height?: number }) {
  // viewBox 40×46 → bredd/höjd-kvot ~0.87 (pokal är högre än bred).
  const width = height * (40 / 46);
  return (
    <Svg width={width} height={height} viewBox="0 0 40 46">
      {/* Handtag — strokade bågar som buktar ut från kupans sidor. */}
      <Path
        d="M 9 8 C 2 9, 2 20, 10 20"
        fill="none"
        stroke={Colors.primary}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path
        d="M 31 8 C 38 9, 38 20, 30 20"
        fill="none"
        stroke={Colors.primary}
        strokeWidth={3}
        strokeLinecap="round"
      />
      {/* Kupa. */}
      <Path
        d="M 9 6 H 31 V 15 C 31 23, 26 28, 20 28 C 14 28, 9 23, 9 15 Z"
        fill={Colors.primary}
      />
      {/* Stjälk. */}
      <SvgRect x={17.5} y={28} width={5} height={7} fill={Colors.primary} />
      {/* Stjälk-till-fot-övergång (trapets). */}
      <Path d="M 14 39 L 16 35 H 24 L 26 39 Z" fill={Colors.primary} />
      {/* Fot. */}
      <SvgRect x={12} y={39} width={16} height={4} rx={1.5} fill={Colors.primary} />
    </Svg>
  );
}

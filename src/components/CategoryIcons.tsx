import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { BrandUi } from '../theme';

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/*
 * Kategori-ikoner (Music / Film-TV / Sport) i samma outline-familj som
 * SectionIcons/ProfileOutlineIcon: 24-grid, 1.8-streck, rundade ändar.
 * Används i QuizVibeToggle-knoppen i Source Mixerboard och som paket-
 * identitet i paketraderna. Kategori-identitet bärs av ikonen — aldrig av
 * en egen ON-färg (guld är det universella aktiva läget).
 */

const stroke = (color: string, strokeWidth: number) => ({
  stroke: color,
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none',
});

/** Music — not med flagga. */
export function MusicNoteIcon({ size = 24, color = BrandUi.iconMuted, strokeWidth = 1.8 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M9 18 V5 L19 3 V16" {...stroke(color, strokeWidth)} />
      <Circle cx={6.5} cy={18} r={2.5} {...stroke(color, strokeWidth)} />
      <Circle cx={16.5} cy={16} r={2.5} {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

/** Film/TV — klappa. */
export function ClapperboardIcon({ size = 24, color = BrandUi.iconMuted, strokeWidth = 1.8 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={3.5} y={9.5} width={17} height={11} rx={1.5} {...stroke(color, strokeWidth)} />
      <Path d="M3.5 9.5 L20 6 L19.2 3 L3.2 6.5 Z" {...stroke(color, strokeWidth)} />
      <Path d="M8 5.6 L9.4 8.6 M13 4.5 L14.4 7.5" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

/** Sport — fotboll (för framtida Sport-kolumn; parkerad i dag). */
export function SportIcon({ size = 24, color = BrandUi.iconMuted, strokeWidth = 1.8 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={8.5} {...stroke(color, strokeWidth)} />
      <Path d="M12 8.2 L15.3 10.6 L14 14.4 H10 L8.7 10.6 Z" {...stroke(color, strokeWidth)} />
      <Path d="M12 8.2 V3.5 M15.3 10.6 L20 9 M14 14.4 L16.5 18.8 M10 14.4 L7.5 18.8 M8.7 10.6 L4 9" {...stroke(color, strokeWidth)} />
    </Svg>
  );
}

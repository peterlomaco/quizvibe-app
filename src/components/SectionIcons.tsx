import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { BrandUi } from '../theme';

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/*
 * Outline-ikoner för Profile-sektionernas rubriker (Home v2-ikonfamiljen):
 * 24-grid, 1.8-streck, rundade ändar — samma som ProfileOutlineIcon,
 * ShoppingCartIcon och ChevronIcon. Ersätter blå krona/Q och emoji (👥 📄).
 */

const common = (color: string, strokeWidth: number) => ({
  stroke: color,
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none',
});

/** Host default settings — krona. */
export function CrownOutlineIcon({ size = 24, color = BrandUi.iconMuted, strokeWidth = 1.8 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 17 L3 7 L8 11 L12 5 L16 11 L21 7 L20 17 Z" {...common(color, strokeWidth)} />
      <Path d="M5 20 H19" {...common(color, strokeWidth)} />
    </Svg>
  );
}

/** Customized Host packages — paket/låda. */
export function PackageOutlineIcon({ size = 24, color = BrandUi.iconMuted, strokeWidth = 1.8 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 3 L20 7 V17 L12 21 L4 17 V7 Z" {...common(color, strokeWidth)} />
      <Path d="M4 7 L12 11 L20 7 M12 11 V21" {...common(color, strokeWidth)} />
    </Svg>
  );
}

/** Community & Friends — två personer. */
export function FriendsOutlineIcon({ size = 24, color = BrandUi.iconMuted, strokeWidth = 1.8 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={9} cy={8.5} r={3.25} {...common(color, strokeWidth)} />
      <Path d="M3 19.5 C3 16.2 5.7 14.25 9 14.25 C12.3 14.25 15 16.2 15 19.5" {...common(color, strokeWidth)} />
      <Path d="M15.5 5.6 C17.2 5.9 18.3 7.2 18.3 8.75 C18.3 10.3 17.2 11.6 15.5 11.9" {...common(color, strokeWidth)} />
      <Path d="M17 14.4 C19.4 14.9 21 16.6 21 19.5" {...common(color, strokeWidth)} />
    </Svg>
  );
}

/** Legal — dokument. */
export function DocumentOutlineIcon({ size = 24, color = BrandUi.iconMuted, strokeWidth = 1.8 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M14 3 H7 C6 3 5.5 3.5 5.5 4.5 V19.5 C5.5 20.5 6 21 7 21 H17 C18 21 18.5 20.5 18.5 19.5 V7.5 Z" {...common(color, strokeWidth)} />
      <Path d="M14 3 V7.5 H18.5 M9 12.5 H15 M9 16 H15" {...common(color, strokeWidth)} />
    </Svg>
  );
}

/** Player history — klocka med pil bakåt. */
export function HistoryOutlineIcon({ size = 24, color = BrandUi.iconMuted, strokeWidth = 1.8 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4.5 12 A7.5 7.5 0 1 0 6.7 6.7" {...common(color, strokeWidth)} />
      <Path d="M4 4.5 V8 H7.5" {...common(color, strokeWidth)} />
      <Path d="M12 8 V12 L14.5 14" {...common(color, strokeWidth)} />
    </Svg>
  );
}

/** Premium-lås för låsta Premium-val. */
export function LockOutlineIcon({ size = 14, color = BrandUi.iconMuted, strokeWidth = 1.8 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={5} y={10.5} width={14} height={10} rx={2} {...common(color, strokeWidth)} />
      <Path d="M8 10.5 V7.5 C8 5.3 9.8 3.5 12 3.5 C14.2 3.5 16 5.3 16 7.5 V10.5" {...common(color, strokeWidth)} />
    </Svg>
  );
}

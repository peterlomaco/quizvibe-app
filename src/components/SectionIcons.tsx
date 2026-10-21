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

/* ── FAQ-kategorier (2026-10-21) — samma 24-grid / 1.8-streck-familj. ── */

/** Getting started — play i cirkel. */
export function PlayCircleOutlineIcon({ size = 24, color = BrandUi.iconMuted, strokeWidth = 1.8 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={8.5} {...common(color, strokeWidth)} />
      <Path d="M10.25 8.75 L15.25 12 L10.25 15.25 Z" {...common(color, strokeWidth)} />
    </Svg>
  );
}

/** Game modes — handkontroll. */
export function ControllerOutlineIcon({ size = 24, color = BrandUi.iconMuted, strokeWidth = 1.8 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M7.5 7.5 H16.5 C19 7.5 20.75 9.5 21 12.25 L21.4 15.6 C21.6 17.4 19.4 18.4 18.1 17.1 L16 15 H8 L5.9 17.1 C4.6 18.4 2.4 17.4 2.6 15.6 L3 12.25 C3.25 9.5 5 7.5 7.5 7.5 Z"
        {...common(color, strokeWidth)}
      />
      <Path d="M7.5 10 V13 M6 11.5 H9" {...common(color, strokeWidth)} />
      <Path d="M15.5 10.5 H15.51 M17.5 12.5 H17.51" {...common(color, strokeWidth + 0.6)} />
    </Svg>
  );
}

/** Connection & Individual Devices — två enheter. */
export function DevicesOutlineIcon({ size = 24, color = BrandUi.iconMuted, strokeWidth = 1.8 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={3} y={5} width={9} height={14} rx={2} {...common(color, strokeWidth)} />
      <Rect x={14} y={8} width={7} height={11} rx={1.75} {...common(color, strokeWidth)} />
      <Path d="M6.5 16 H8.5 M16.75 16 H18.25" {...common(color, strokeWidth)} />
    </Svg>
  );
}

/** Handicap (HCP) — måltavla. */
export function TargetOutlineIcon({ size = 24, color = BrandUi.iconMuted, strokeWidth = 1.8 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={8.5} {...common(color, strokeWidth)} />
      <Circle cx={12} cy={12} r={4.75} {...common(color, strokeWidth)} />
      <Circle cx={12} cy={12} r={1} {...common(color, strokeWidth)} />
    </Svg>
  );
}

/** Host Game Credits — biljett. */
export function TicketOutlineIcon({ size = 24, color = BrandUi.iconMuted, strokeWidth = 1.8 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 6.5 H20 V9.75 C18.75 9.75 17.75 10.75 17.75 12 C17.75 13.25 18.75 14.25 20 14.25 V17.5 H4 V14.25 C5.25 14.25 6.25 13.25 6.25 12 C6.25 10.75 5.25 9.75 4 9.75 Z"
        {...common(color, strokeWidth)}
      />
      <Path d="M14 6.5 V8 M14 11.25 V12.75 M14 16 V17.5" {...common(color, strokeWidth)} />
    </Svg>
  );
}

/** Premium subscription — stjärna. */
export function StarOutlineIcon({ size = 24, color = BrandUi.iconMuted, strokeWidth = 1.8 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 3.75 L14.45 8.7 L19.9 9.5 L15.95 13.35 L16.9 18.8 L12 16.2 L7.1 18.8 L8.05 13.35 L4.1 9.5 L9.55 8.7 Z"
        {...common(color, strokeWidth)}
      />
    </Svg>
  );
}

/** Region — jordglob. */
export function GlobeOutlineIcon({ size = 24, color = BrandUi.iconMuted, strokeWidth = 1.8 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={8.5} {...common(color, strokeWidth)} />
      <Path d="M3.5 12 H20.5" {...common(color, strokeWidth)} />
      <Path d="M12 3.5 C14.4 6 15.5 9 15.5 12 C15.5 15 14.4 18 12 20.5 C9.6 18 8.5 15 8.5 12 C8.5 9 9.6 6 12 3.5 Z" {...common(color, strokeWidth)} />
    </Svg>
  );
}

/** Getting started — raket. */
export function RocketOutlineIcon({ size = 24, color = BrandUi.iconMuted, strokeWidth = 1.8 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M14.5 4.2 C17 3.5 19.7 3.6 20.4 3.6 C20.4 4.3 20.5 7 19.8 9.5 C19.1 12 17.3 14.1 14.6 15.9 L8.1 9.4 C9.9 6.7 12 4.9 14.5 4.2 Z"
        {...common(color, strokeWidth)}
      />
      <Circle cx={15.25} cy={8.75} r={1.6} {...common(color, strokeWidth)} />
      <Path d="M8.1 9.4 L5 9.4 L3.6 11.6 L6.9 12.8" {...common(color, strokeWidth)} />
      <Path d="M14.6 15.9 V19 L12.4 20.4 L11.2 17.1" {...common(color, strokeWidth)} />
      <Path d="M8.6 15.4 C7.3 15.6 5.6 16.8 5.1 18.9 C7.2 18.4 8.4 16.7 8.6 15.4 Z" {...common(color, strokeWidth)} />
    </Svg>
  );
}

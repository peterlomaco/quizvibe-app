/**
 * Border-radius scale
 * Consistent rounding across all interactive surfaces
 */
export const Radius = {
  /** 6 — tight: badges, chips */
  xs: 6,
  /** 8 — small: buttons secondary, list row hover */
  sm: 8,
  /** 12 — medium: cards, inputs */
  md: 12,
  /** 16 — large: modals, main cards */
  lg: 16,
  /** 20 — xl: sheets */
  xl: 20,
  /** 999 — pill: tags, avatars, fab */
  full: 999,
} as const;
 
export type RadiusKey = keyof typeof Radius;
 
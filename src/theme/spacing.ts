// Test-kommentar för git-flödet.
/**
 * 8-pt spacing scale
 * Use multiples of 4 for micro-adjustments (xs, sm)
 * Use multiples of 8 for layout (md → xxl)
 */
export const Spacing = {
  /** 4 — micro gaps, icon padding */
  xs: 4,
  /** 8 — tight gaps, inner padding */
  sm: 8,
  /** 12 — component inner padding */
  md: 12,
  /** 16 — standard section padding, card padding */
  lg: 16,
  /** 24 — between sections */
  xl: 24,
  /** 32 — large section breaks */
  xxl: 32,
  /** 48 — screen-level top padding */
  xxxl: 48,
} as const;
 
export type SpacingKey = keyof typeof Spacing;
 
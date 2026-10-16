/**
 * Neutral UI tokens for applying the locked QuizVibe Brand Master
 * (design/brand/README.md) on navy. Introduced with Home v2 (locked
 * 2026-10-16).
 *
 * Rule: gold means brand emphasis or an active/selected state, never
 * decoration. Everything neutral, inactive or secondary uses these
 * reduced-opacity whites instead of blue or raw greys.
 */
export const BrandUi = {
  /** Neutral button/card surface on navy. */
  surface: 'rgba(255,255,255,0.06)',
  /** Neutral hairline border. */
  border: 'rgba(255,255,255,0.14)',
  /** Secondary text (tagline, footer, subtitles, section headings). */
  textMuted: 'rgba(255,255,255,0.6)',
  /** Inactive/neutral icons and chevrons. */
  iconMuted: 'rgba(255,255,255,0.55)',
  /** Functional icons on neutral surfaces. */
  icon: '#FFFFFF',
} as const;

/**
 * Design-system color tokens
 * Navy / blue dark palette — Spotify / Apple dark-mode aesthetic
 */
export const Colors = {
  // ── Backgrounds ────────────────────────────────────────────────
  background: '#0B1220',
  card: '#132238',
  cardElevated: '#1A3050',
 
  // ── Brand ──────────────────────────────────────────────────────
  primary: '#4DA3FF',
  primaryDark: '#114E91',
  primaryMuted: 'rgba(77,163,255,0.12)',
  primaryBorder: 'rgba(77,163,255,0.20)',
 
  // ── Text ───────────────────────────────────────────────────────
  textPrimary: '#FFFFFF',
  textSecondary: '#A8B3C7',
  textDisabled: 'rgba(168,179,199,0.4)',
 
  // ── Borders & dividers ─────────────────────────────────────────
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.14)',
  separator: 'rgba(255,255,255,0.05)',
 
  // ── Semantic ───────────────────────────────────────────────────
  success: '#52C87A',
  successMuted: 'rgba(82,200,122,0.12)',
  successBorder: 'rgba(82,200,122,0.25)',
 
  warning: '#F5A623',
  warningMuted: 'rgba(245,166,35,0.12)',
  warningBorder: 'rgba(245,166,35,0.25)',
 
  error: '#FF6B6B',
  errorMuted: 'rgba(255,107,107,0.12)',
} as const;
 
export type ColorKey = keyof typeof Colors;
 

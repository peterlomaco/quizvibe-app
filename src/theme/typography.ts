import { TextStyle } from 'react-native';
 
/**
 * Raw tokens — use in StyleSheet when you need individual properties
 */
export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  display: 32,
} as const;
 
export const FontWeight = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
} as const;
 
export const LineHeight = {
  tight: 16,
  normal: 20,
  relaxed: 24,
} as const;
 
/**
 * Pre-composed text styles — apply directly with spread or StyleSheet
 *
 * @example
 * <Text style={Typography.screenTitle}>Hello</Text>
 * StyleSheet.create({ label: { ...Typography.label, color: Colors.primary } })
 */
export const Typography = {
  /** Screen / modal title — 24 semibold */
  screenTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.semibold,
    letterSpacing: -0.4,
    lineHeight: 30,
  } as TextStyle,
 
  /** Section heading — 20 semibold */
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    letterSpacing: -0.3,
    lineHeight: 26,
  } as TextStyle,
 
  /** Card / row title — 17 medium */
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    lineHeight: 22,
  } as TextStyle,
 
  /** Default body text — 15 regular */
  body: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    lineHeight: 22,
  } as TextStyle,
 
  /** Emphasised body — 15 medium */
  bodyMedium: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    lineHeight: 22,
  } as TextStyle,
 
  /** Form labels, nav items — 13 medium */
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: 18,
  } as TextStyle,
 
  /** Helper / hint — 11 regular */
  caption: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    lineHeight: 16,
  } as TextStyle,
 
  /** ALL-CAPS section heading — 11 semibold */
  overline: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  } as TextStyle,
 
  /** Room-code display — 32 bold wide-tracking */
  display: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.bold,
    letterSpacing: 6,
  } as TextStyle,
} as const;
 

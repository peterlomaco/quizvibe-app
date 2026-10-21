import React from 'react';
import {
    StyleSheet,
    Text,
    ViewStyle,
} from 'react-native';
import { PRESSED_FEEDBACK, Pressable } from '@/src/components/haptic';
import { LoadingContent } from './LoadingContent';
import { METALLIC_GOLD_EDGE, MetallicGoldFill } from './MetallicGoldFill';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
 
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gold';
 
interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  /** 'compact' = 48 pt (≈8 % lägre) för sektions-Save under listor. */
  size?: 'default' | 'compact';
  style?: ViewStyle;
}
 
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  fullWidth = true,
  size = 'default',
  style,
}: ButtonProps) {
  // `loading` låser knappen men behåller dess variant-utseende (guld förblir
  // guld) — bara labeln byts mot spinnern, så knappen varken blinkar grå
  // eller ändrar storlek medan anropet pågår.
  const isDisabled = !!disabled;
  const spinnerColor =
    variant === 'gold'
      ? '#000000'
      : variant === 'ghost'
        ? Colors.primary
        : Colors.textPrimary;
 
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: !!loading }}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        size === 'compact' && styles.compact,
        styles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && !loading && PRESSED_FEEDBACK,
        style,
      ]}
    >
      {/* 'gold' = QuizVibe primär-CTA (metallisk guld + svart text), samma
          som Home:s Start New Game och Join Game. */}
      {variant === 'gold' && !isDisabled && <MetallicGoldFill />}
      <LoadingContent loading={!!loading} color={spinnerColor}>
        <Text
          style={[
            styles.label,
            variant === 'ghost' && styles.ghostLabel,
            variant === 'secondary' && styles.secondaryLabel,
            variant === 'gold' && styles.goldLabel,
            isDisabled && styles.disabledLabel,
          ]}
        >
          {label}
        </Text>
      </LoadingContent>
    </Pressable>
  );
}
 
const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  fullWidth: { alignSelf: 'stretch' },
  compact: { height: 48 },
 
  // ── Variants ────────────────────────────────────────────────────
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  gold: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: METALLIC_GOLD_EDGE,
  },
 
  // ── States ──────────────────────────────────────────────────────
  disabled: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
 
  // ── Labels ──────────────────────────────────────────────────────
  label: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    letterSpacing: 0.1,
  },
  ghostLabel: { color: Colors.primary },
  secondaryLabel: { color: Colors.textPrimary },
  goldLabel: { color: '#000000', fontWeight: FontWeight.bold },
  disabledLabel: { color: Colors.textSecondary },
});
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    ViewStyle,
} from 'react-native';
import { Pressable } from '@/src/components/haptic';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
 
export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
 
interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}
 
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  fullWidth = true,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
 
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        styles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={isDisabled ? Colors.textSecondary : Colors.textPrimary}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'ghost' && styles.ghostLabel,
            variant === 'secondary' && styles.secondaryLabel,
            isDisabled && styles.disabledLabel,
          ]}
        >
          {label}
        </Text>
      )}
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
 
  // ── States ──────────────────────────────────────────────────────
  disabled: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
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
  disabledLabel: { color: Colors.textSecondary },
});
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
 
type InfoVariant = 'info' | 'warning' | 'success';
 
interface InfoBoxProps {
  text: string;
  icon?: string;
  variant?: InfoVariant;
}
 
const DEFAULT_ICONS: Record<InfoVariant, string> = {
  info: 'ⓘ',
  warning: '⚠',
  success: '✓',
};
 
export function InfoBox({ text, icon, variant = 'info' }: InfoBoxProps) {
  const displayIcon = icon ?? DEFAULT_ICONS[variant];
 
  return (
    <View style={[styles.container, styles[variant]]}>
      <Text style={[styles.icon, styles[`${variant}Text` as never]]}>
        {displayIcon}
      </Text>
      <Text style={[styles.text, styles[`${variant}Text` as never]]}>
        {text}
      </Text>
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  // Variant backgrounds + borders
  info: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primaryBorder,
  },
  warning: {
    backgroundColor: Colors.warningMuted,
    borderColor: Colors.warningBorder,
  },
  success: {
    backgroundColor: Colors.successMuted,
    borderColor: Colors.successBorder,
  },
  // Icon + text
  icon: { fontSize: FontSize.sm, marginTop: 1 },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    flex: 1,
    lineHeight: 17,
  },
  // Variant text colours
  infoText: { color: Colors.primary },
  warningText: { color: Colors.warning },
  successText: { color: Colors.success },
});
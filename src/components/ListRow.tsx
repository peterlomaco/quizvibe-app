import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Pressable } from '@/src/components/haptic';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
 
interface ListRowProps {
  label: string;
  subtitle?: string;
  selected?: boolean;
  onPress?: () => void;
  /** Node rendered before the label */
  left?: React.ReactNode;
  /** Node rendered after the label (before checkmark) */
  right?: React.ReactNode;
  /** Show a filled circle-check when selected. Default: true */
  showCheck?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}
 
export function ListRow({
  label,
  subtitle,
  selected,
  onPress,
  left,
  right,
  showCheck = true,
  disabled,
  style,
}: ListRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.row,
        selected && styles.selected,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {left ? <View style={styles.left}>{left}</View> : null}
 
      <View style={styles.content}>
        <Text style={[styles.label, selected && styles.selectedLabel]}>
          {label}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
 
      {right ? <View style={styles.right}>{right}</View> : null}
 
      {showCheck && selected ? (
        <View style={styles.check}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
 
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
  },
  selected: { backgroundColor: Colors.primaryMuted },
  pressed: { backgroundColor: 'rgba(255,255,255,0.04)' },
 
  content: { flex: 1 },
  left: { marginRight: Spacing.md },
  right: { marginLeft: Spacing.md },
 
  label: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    color: Colors.textPrimary,
  },
  selectedLabel: {
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  checkMark: {
    color: '#fff',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
});
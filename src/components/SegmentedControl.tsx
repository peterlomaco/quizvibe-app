import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/src/components/haptic';
import { BrandUi, Colors, FontSize, FontWeight, Radius } from '../theme';
 
export interface SegmentOption {
  label: string;
  value: string;
}
 
interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
}
 
export function SegmentedControl({
  options,
  value,
  onChange,
}: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.option,
              isSelected && styles.selectedOption,
              pressed && !isSelected && styles.pressedOption,
            ]}
          >
            <Text style={[styles.label, isSelected && styles.selectedLabel]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
 
// Player history v2 (2026-10-19): nedsänkt mörk ränna, inaktiva val utan
// kant, valt val = tunn guldkant + svag guldyta (ingen glöd).
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: Radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 2,
  },
  option: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: 'rgba(245,166,35,0.06)',
    borderColor: 'rgba(245,166,35,0.55)',
  },
  pressedOption: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: BrandUi.textMuted,
  },
  selectedLabel: {
    color: Colors.warning,
    fontWeight: FontWeight.semibold,
  },
});

import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '../theme';
 
interface CardProps {
  children: React.ReactNode;
  /** Override default 16 padding */
  padding?: number;
  /** Slightly lighter background for elevated surfaces */
  elevated?: boolean;
  style?: ViewStyle;
}
 
export function Card({
  children,
  padding = Spacing.lg,
  elevated = false,
  style,
}: CardProps) {
  return (
    <View style={[styles.card, elevated && styles.elevated, { padding }, style]}>
      {children}
    </View>
  );
}
 
const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  elevated: {
    backgroundColor: Colors.cardElevated,
  },
});
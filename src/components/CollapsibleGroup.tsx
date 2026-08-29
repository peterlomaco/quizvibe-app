import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/src/components/haptic';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';

/**
 * Återanvändbar collapsible grupp-header med +/−-toggle-box. Delas av
 * Player history + Marathon-listan för BÅDA nivåerna (level 1 = host/månad,
 * level 2 = spelform). Stil portad från PlayerHistorySection:s
 * monthHeader/monthToggleBox så utseendet är oförändrat; `level` styr
 * toggle-box-storlek (26 vs 22), label-vikt och indrag.
 */
export function CollapsibleGroup({
  label,
  summary,
  level,
  open,
  onToggle,
  children,
  badge,
}: {
  label: string;
  summary?: string;
  level: 1 | 2;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  /** Valfritt märke (t.ex. flash-guidens "New update") mellan summary och
   *  +/−-boxen. */
  badge?: React.ReactNode;
}) {
  const isL1 = level === 1;
  return (
    <View style={isL1 ? styles.groupL1 : styles.groupL2}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.header, pressed && { opacity: 0.7 }]}
        hitSlop={6}
      >
        <Text style={isL1 ? styles.labelL1 : styles.labelL2} numberOfLines={1}>
          {label}
        </Text>
        {summary ? (
          <Text style={styles.summary} numberOfLines={1}>
            {summary}
          </Text>
        ) : (
          <View style={styles.spacer} />
        )}
        {badge}
        <View style={isL1 ? styles.toggleBoxL1 : styles.toggleBoxL2}>
          <Text style={isL1 ? styles.toggleTextL1 : styles.toggleTextL2}>
            {open ? '−' : '+'}
          </Text>
        </View>
      </Pressable>
      {open && <View style={styles.body}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  groupL1: { gap: Spacing.xs },
  // Level 2 (spelform) dras in något så nästlingen läses visuellt.
  groupL2: { gap: Spacing.xs, paddingLeft: Spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  labelL1: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  labelL2: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  summary: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  spacer: { flex: 1 },
  toggleBoxL1: {
    width: 26,
    height: 26,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTextL1: {
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  toggleBoxL2: {
    width: 22,
    height: 22,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTextL2: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  body: {
    paddingTop: Spacing.sm,
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/src/components/haptic';
import { BrandUi, Colors, FontSize, FontWeight, Spacing } from '../theme';
import { SectionToggle } from './SectionToggle';

/**
 * Återanvändbar collapsible grupp-header med +/−-toggle-box. Delas av
 * Player history + Marathon-listan för BÅDA nivåerna (level 1 = host/månad,
 * level 2 = spelform). Stil portad från PlayerHistorySection:s
 * monthHeader/monthToggleBox; `level` styr label-vikt och indrag. +/− är
 * den delade neutrala SectionToggle på alla nivåer (v2, 2026-10-19).
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
  /** 1 = host/månad (starkast), 2 = spelform (uppercase, indrag),
   *  3 = datum-mellannivå i Date-läget (läsbar, indrag). */
  level: 1 | 2 | 3;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  /** Valfritt märke (t.ex. flash-guidens "New update") mellan summary och
   *  +/−-boxen. */
  badge?: React.ReactNode;
}) {
  const groupStyle =
    level === 1 ? styles.groupL1 : level === 3 ? styles.groupL3 : styles.groupL2;
  const labelStyle =
    level === 1 ? styles.labelL1 : level === 3 ? styles.labelL3 : styles.labelL2;
  return (
    <View style={groupStyle}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.header, pressed && { opacity: 0.7 }]}
        hitSlop={6}
      >
        <Text style={labelStyle} numberOfLines={1}>
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
        <SectionToggle expanded={open} tone="neutral" />
      </Pressable>
      {open && <View style={styles.body}>{children}</View>}
    </View>
  );
}

// Player history v2 (2026-10-19): hierarkin bärs av typografi + luft i
// stället för avdelarlinjer. Månad = starkast, datum = sekundär, spelform =
// liten dämpad versal-etikett. Samma neutrala +/− (SectionToggle, 28 pt) på
// alla nivåer.
const styles = StyleSheet.create({
  groupL1: { gap: Spacing.xs },
  // Level 2 (spelform) och 3 (datum) dras in så nästlingen läses visuellt.
  groupL2: { gap: Spacing.xs, paddingLeft: Spacing.md },
  groupL3: { gap: Spacing.xs, paddingLeft: Spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 40,
  },
  labelL1: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  labelL3: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: 'rgba(255,255,255,0.85)',
  },
  labelL2: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: BrandUi.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summary: {
    flex: 1,
    fontSize: FontSize.xs,
    color: BrandUi.textMuted,
    fontVariant: ['tabular-nums'],
  },
  spacer: { flex: 1 },
  // Ingen paddingBottom — nästlade nivåer staplade annars luft under sista
  // kortet (Games played-kortet slutade med en stor tom yta).
  body: {
    paddingTop: Spacing.xs,
  },
});

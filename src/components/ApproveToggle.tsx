import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BrandUi, FontSize, FontWeight, Spacing } from '../theme';
import { QuizVibeToggle } from './QuizVibeToggle';

interface ApproveToggleProps {
  /** Aktuellt val — 'no' (OFF) eller 'yes' (ON). */
  value: 'no' | 'yes';
  /** Anropas när användaren togglar switch:en. */
  onChange: (next: 'no' | 'yes') => void;
  /** Optional label som visas till vänster om toggleln (t.ex. "Approve All"). */
  label?: string;
  /** D-vii: när true är toggle:n otappbar + dimmad. Driver "kan inte
   *  approva spelare med röd connection-status" — host måste vänta
   *  på stabilare uppkoppling. */
  disabled?: boolean;
}

/**
 * Approve-toggle i QuizVibe-switchens språk (Lobby v2, 2026-10-21):
 * delad QuizVibeToggle (compact) — gunmetal OFF, guld ON — i stället för
 * den gamla röd/gröna native-switchen. Bevarar 'no' | 'yes'-API:t så
 * befintliga call sites inte behöver ändras.
 */
export function ApproveToggle({ value, onChange, label, disabled }: ApproveToggleProps) {
  return (
    <View style={[styles.row, disabled && styles.rowDisabled]}>
      {label && <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>}
      <QuizVibeToggle
        variant="compact"
        value={value === 'yes'}
        onValueChange={(v) => onChange(v ? 'yes' : 'no')}
        disabled={disabled}
        accessibilityLabel={label ?? 'Approve player'}
        // Raden dimmas redan som helhet — ingen extra dimning på switchen.
        style={disabled && { opacity: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
  rowDisabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: '#FFFFFF',
  },
  labelDisabled: {
    color: BrandUi.textMuted,
  },
});

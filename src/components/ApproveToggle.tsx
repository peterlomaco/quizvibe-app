import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing } from '../theme';

interface ApproveToggleProps {
  /** Aktuellt val — 'no' (röd track) eller 'yes' (grön track). */
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
 * Approve-toggle med samma visuella språk som Game Connections-switcharna
 * (röd track = av/No, grön track = på/Yes, vit thumb, scale 0.8). Bevarar
 * 'no' | 'yes'-API:t så befintliga call sites inte behöver ändras.
 */
export function ApproveToggle({ value, onChange, label, disabled }: ApproveToggleProps) {
  return (
    <View style={[styles.row, disabled && styles.rowDisabled]}>
      {label && <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>}
      <Switch
        value={value === 'yes'}
        onValueChange={(v) => onChange(v ? 'yes' : 'no')}
        trackColor={{ false: Colors.error, true: Colors.success }}
        thumbColor="#FFF"
        // iOS native Switch:s track-fill är något smalare än outer pill —
        // utan synced bakgrund läcker `ios_backgroundColor` igenom som en
        // tunn röd flärd i kanterna även när toggle är ON. Synca med
        // aktiv track-färg så ingen röd flärd syns när aktiverad.
        ios_backgroundColor={value === 'yes' ? Colors.success : Colors.error}
        disabled={disabled}
        style={styles.switch}
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
    color: Colors.textPrimary,
  },
  labelDisabled: {
    color: Colors.textSecondary,
  },
  // Samma scale som connectionSwitch i LobbyScreen — håller switchen
  // proportionell till resten av kortets innehåll.
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
});

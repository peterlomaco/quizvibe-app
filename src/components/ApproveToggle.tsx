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
}

/**
 * Approve-toggle med samma visuella språk som Game Connections-switcharna
 * (röd track = av/No, grön track = på/Yes, vit thumb, scale 0.8). Bevarar
 * 'no' | 'yes'-API:t så befintliga call sites inte behöver ändras.
 */
export function ApproveToggle({ value, onChange, label }: ApproveToggleProps) {
  return (
    <View style={styles.row}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Switch
        value={value === 'yes'}
        onValueChange={(v) => onChange(v ? 'yes' : 'no')}
        trackColor={{ false: Colors.error, true: Colors.success }}
        thumbColor="#FFF"
        ios_backgroundColor={Colors.error}
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
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  // Samma scale som connectionSwitch i LobbyScreen — håller switchen
  // proportionell till resten av kortets innehåll.
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
});

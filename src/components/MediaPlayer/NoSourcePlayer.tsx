// Empty-state-placeholder — visas när pickMediaSource returnerar
// `kind: 'none'`. Anledningar idag: host har stängt av alla Game Connections-
// källor, eller frågan saknar curerade klipp i mock/seed-data. Stub-kortet
// hindrar quiz-skärmen från att kraschera när data är ofullständig.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/theme';

interface Props {
  reason: string;
}

export function NoSourcePlayer({ reason }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>🎵</Text>
      <Text style={styles.label}>Music</Text>
      <Text style={styles.reason}>{reason}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 200,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  icon: { fontSize: 48 },
  label: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  reason: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

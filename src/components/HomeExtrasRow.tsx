// Home:s sekundär-rad: "Competition" (vänster) + "1vs1" (höger), sida vid
// sida i två likbreda slottar. Varje knapp self-gatar till null (Competition
// = inloggad + ≥1 sparad competition; 1vs1 = ≥1 match/sparad lobby), och
// slottarna är alltid `flex: 1` så en närvarande knapp stannar på SIN sida
// även när den andra saknas (1vs1 höger, Competition vänster).
//
// När BÅDA saknas kollapsas raden med `display: 'none'` — INTE genom att
// avmontera barnen (då skulle deras async-gating aldrig köra och de kunde
// aldrig dyka upp). display:none tar bort raden ur layouten (ingen spök-gap
// i actionsSection) men behåller barnen monterade så de fortsätter ladda och
// rapportera synlighet via onVisible.

import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Spacing } from '../theme';
import { CompetitionsButton } from './CompetitionsButton';
import { MyMatchesSection } from './MyMatchesSection';

export function HomeExtrasRow() {
  const [compVisible, setCompVisible] = useState(false);
  const [matchVisible, setMatchVisible] = useState(false);
  const bothHidden = !compVisible && !matchVisible;

  return (
    <View style={[styles.row, bothHidden && styles.hidden]}>
      <View style={styles.slot}>
        <CompetitionsButton onVisible={setCompVisible} />
      </View>
      <View style={styles.slot}>
        <MyMatchesSection inRow onVisible={setMatchVisible} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  slot: {
    flex: 1,
  },
  hidden: {
    display: 'none',
  },
});

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
import { getCachedHomeRowVisible } from '../utils/homeRowVisibility';
import { CompetitionsButton } from './CompetitionsButton';
import { MyMatchesSection } from './MyMatchesSection';

export function HomeExtrasRow() {
  // Seed:a från senast kända synlighet så raden har rätt höjd redan frame 1
  // vid en re-mount av Home (t.ex. router.replace('/') efter lobby-delete) —
  // annars pop:ar knapparna in ~1s senare och skjuter Home-kolumnen (container
  // = justifyContent:'space-between'). Barnen bekräftar/korrigerar via onVisible
  // efter sin egen fetch. Se homeRowVisibility.ts.
  const [compVisible, setCompVisible] = useState(() => getCachedHomeRowVisible('competitions'));
  const [matchVisible, setMatchVisible] = useState(() => getCachedHomeRowVisible('matches'));
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

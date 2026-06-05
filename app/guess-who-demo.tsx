// Hints demo — preview-route för HintsQuizCard (flagga + progressiva ledtrådar).
// Nås via "Hints demo"-länk i Home-footern.

import { HintsQuizCard } from '@/src/components/HintsQuizCard';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/theme';
import { HINTS_DATA } from '@/src/utils/hintsData';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Assistance = 'minimal' | 'standard' | 'full';

const ASSIST_OPTIONS: Assistance[] = ['full', 'standard', 'minimal'];
const TIME_OPTIONS = [15, 30, 45, 60];

interface DemoItem {
  id: string;
  label: string;
  displayName: string;
  profession: string;
}

const DEMO_ITEMS: DemoItem[] = [
  { id: 'zlatan-ibrahimovic',  label: 'Zlatan',       displayName: 'Zlatan Ibrahimovic',  profession: 'Athlete' },
  { id: 'cristiano-ronaldo',   label: 'Ronaldo',      displayName: 'Cristiano Ronaldo',   profession: 'Athlete' },
  { id: 'lionel-messi',        label: 'Messi',        displayName: 'Lionel Messi',        profession: 'Athlete' },
  { id: 'zara-larsson',        label: 'Zara Larsson', displayName: 'Zara Larsson',        profession: 'Artist'  },
  { id: 'avicii',              label: 'Avicii',       displayName: 'Avicii',              profession: 'Artist'  },
  { id: 'beyonce',             label: 'Beyoncé',      displayName: 'Beyoncé',             profession: 'Artist'  },
  { id: 'tom-hanks',           label: 'Tom Hanks',    displayName: 'Tom Hanks',           profession: 'Actor'   },
].filter((d) => !!HINTS_DATA[d.id]);

export default function HintsDemoScreen() {
  const [selected, setSelected] = useState<DemoItem>(DEMO_ITEMS[0]);
  const [assistance, setAssistance] = useState<Assistance>('standard');
  const [seconds, setSeconds] = useState(30);
  const [revealed, setRevealed] = useState(false);
  const [run, setRun] = useState(0);

  const resetKey = `${selected.id}-${assistance}-${seconds}-${run}`;
  const hints = HINTS_DATA[selected.id]!;

  const restart = () => {
    setRevealed(false);
    setRun((r) => r + 1);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <Pressable onPress={() => router.replace('/')} hitSlop={8}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Hints preview</Text>
        <View style={styles.topSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Hints card preview */}
        <View style={styles.card}>
          <HintsQuizCard
            key={resetKey}
            profession={selected.profession}
            hints={hints}
            displayName={selected.displayName}
            resetKey={resetKey}
            totalSeconds={seconds}
            assistance={assistance}
            playerBirthYear={1990}
            isRevealed={revealed}
          />
        </View>

        <Text style={styles.hint}>
          Ledtrådarna 1–3 är alla framme vid 2/3 av svarstiden ({Math.round((seconds * 2) / 3)}s vid {seconds}s).
          {'\n'}Mosaiken på flaggan försvinner på {assistance}-tempo.
        </Text>

        <Section label="Person">
          {DEMO_ITEMS.map((d) => (
            <Chip
              key={d.id}
              label={d.label}
              active={d.id === selected.id}
              onPress={() => { setSelected(d); restart(); }}
            />
          ))}
        </Section>

        <Section label="Assistance">
          {ASSIST_OPTIONS.map((a) => (
            <Chip key={a} label={a} active={a === assistance} onPress={() => { setAssistance(a); restart(); }} />
          ))}
        </Section>

        <Section label="Svarstid">
          {TIME_OPTIONS.map((t) => (
            <Chip key={t} label={`${t}s`} active={t === seconds} onPress={() => { setSeconds(t); restart(); }} />
          ))}
        </Section>

        <View style={styles.actionRow}>
          <Pressable style={[styles.actionBtn, styles.replayBtn]} onPress={restart}>
            <Text style={styles.replayText}>↻ Replay</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, revealed ? styles.revealOn : styles.revealOff]}
            onPress={() => setRevealed((v) => !v)}
          >
            <Text style={revealed ? styles.revealOnText : styles.revealOffText}>
              {revealed ? 'Revealed ✓' : 'Reveal now'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.chipRow}>{children}</View>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}>
      <Text style={active ? styles.chipTextActive : styles.chipTextInactive}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  back: { color: Colors.textSecondary, fontSize: FontSize.md, fontWeight: '500' },
  title: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  topSpacer: { width: 48 },
  scroll: { padding: Spacing.lg, gap: Spacing.lg },
  card: {
    width: '100%',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  hint: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 18,
    textAlign: 'center',
  },
  section: { gap: Spacing.sm },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.sm, borderWidth: 1 },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  chipInactive: { borderColor: Colors.borderStrong, backgroundColor: 'transparent' },
  chipTextActive: { color: Colors.primary, fontWeight: FontWeight.bold, fontSize: FontSize.sm },
  chipTextInactive: { color: Colors.textSecondary, fontSize: FontSize.sm },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  actionBtn: { flex: 1, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  replayBtn: { borderColor: Colors.primary, backgroundColor: Colors.cardElevated },
  replayText: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '600' },
  revealOff: { borderColor: Colors.borderStrong, backgroundColor: 'transparent' },
  revealOffText: { color: Colors.textSecondary, fontSize: FontSize.md, fontWeight: '600' },
  revealOn: { borderColor: Colors.success, backgroundColor: Colors.successMuted },
  revealOnText: { color: Colors.success, fontSize: FontSize.md, fontWeight: '600' },
});

// Standalone preview-route för "Guess Who" split-view-prototypen.
// Temporär dev-skärm — nås via "Guess Who demo"-länk i Home-footern. Låter oss
// se + tweaka split-reveal:en (doodle vänster + progressiva ledtrådar i Q:t
// höger) utan att spela igenom en hel quiz. Inte wired till live-quiz ännu.

import { GuessWhoSplitView } from '@/src/components/GuessWhoSplitView';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/theme';
import { findGuessWhoDemo, GENERIC_CLUES } from '@/src/utils/guessWhoDemo';
import { getQuizSketch, QUIZ_SKETCHES } from '@/src/utils/quizSketches';
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

const SKETCH_KEYS = Object.keys(QUIZ_SKETCHES);
const ASSIST_OPTIONS: Assistance[] = ['full', 'standard', 'minimal'];
const TIME_OPTIONS = [15, 30, 45, 60];

export default function GuessWhoDemoScreen() {
  const [sketchKey, setSketchKey] = useState(SKETCH_KEYS[0] ?? '');
  const [assistance, setAssistance] = useState<Assistance>('standard');
  const [seconds, setSeconds] = useState(30);
  const [revealed, setRevealed] = useState(false);
  const [run, setRun] = useState(0);

  const resetKey = `${sketchKey}-${assistance}-${seconds}-${run}`;
  const source = getQuizSketch(sketchKey);
  const demo = findGuessWhoDemo(sketchKey);
  const clues = demo?.clues ?? GENERIC_CLUES;

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
        <Text style={styles.title}>Guess Who preview</Text>
        <View style={styles.topSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <GuessWhoSplitView
            key={resetKey}
            source={source}
            clues={clues}
            resetKey={resetKey}
            assistance={assistance}
            totalSeconds={seconds}
            isRevealed={revealed}
          />
        </View>

        <Text style={styles.answerHint}>
          Answer: {demo?.displayName ?? '(no preset for this sketch)'}
        </Text>
        <Text style={styles.hint}>
          Doodeln ritas fram på {assistance}-tempo; ledtrådarna 1–4 är alla framme
          vid 2/3 av svarstiden ({Math.round((seconds * 2) / 3)}s vid {seconds}s).
        </Text>

        <Section label="Doodle (sketch asset)">
          {SKETCH_KEYS.map((k) => (
            <Chip
              key={k}
              label={k}
              active={k === sketchKey}
              onPress={() => {
                setSketchKey(k);
                restart();
              }}
            />
          ))}
        </Section>

        <Section label="Assistance (draw speed)">
          {ASSIST_OPTIONS.map((a) => (
            <Chip key={a} label={a} active={a === assistance} onPress={() => setAssistance(a)} />
          ))}
        </Section>

        <Section label="Response time">
          {TIME_OPTIONS.map((t) => (
            <Chip key={t} label={`${t}s`} active={t === seconds} onPress={() => setSeconds(t)} />
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

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
    >
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
    aspectRatio: 16 / 10,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    overflow: 'hidden',
  },
  answerHint: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
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
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  chipInactive: { borderColor: Colors.borderStrong, backgroundColor: 'transparent' },
  chipTextActive: { color: Colors.primary, fontWeight: FontWeight.bold, fontSize: FontSize.sm },
  chipTextInactive: { color: Colors.textSecondary, fontSize: FontSize.sm },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  actionBtn: {
    flex: 1,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  replayBtn: { borderColor: Colors.primary, backgroundColor: Colors.cardElevated },
  replayText: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '600' },
  revealOff: { borderColor: Colors.borderStrong, backgroundColor: 'transparent' },
  revealOffText: { color: Colors.textSecondary, fontSize: FontSize.md, fontWeight: '600' },
  revealOn: { borderColor: Colors.success, backgroundColor: Colors.successMuted },
  revealOnText: { color: Colors.success, fontSize: FontSize.md, fontWeight: '600' },
});

import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Card } from '../components/Card';
import { InfoBox } from '../components/InfoBox';
import { ListRow } from '../components/ListRow';
import { RangeSlider } from '../components/RangeSlider';
import { SegmentedControl, SegmentOption } from '../components/SegmentedControl';
import { SliderInput } from '../components/SliderInput';
import { Colors, FontSize, Spacing, Typography } from '../theme';
 
// ─── Data ─────────────────────────────────────────────────────────────────────
 
const SKILL_OPTIONS: SegmentOption[] = [
  { label: 'Easy', value: 'easy' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Expert', value: 'expert' },
];
 
const REGIONS = ['Sweden', 'Nordics', 'Europe', 'Global'] as const;
type Region = (typeof REGIONS)[number];
 
// ─── Screen ───────────────────────────────────────────────────────────────────
 
export default function HCPSettingsScreen() {
  const [age, setAge] = useState(35);
  const [skill, setSkill] = useState('intermediate');
  const [region, setRegion] = useState<Region>('Sweden');
  const [eraLow, setEraLow] = useState(1990);
  const [eraHigh, setEraHigh] = useState(2015);
 
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Settings</Text>
          <Text style={styles.screenSubtitle}>Customize your game profile</Text>
        </View>
 
        {/* ── Age ────────────────────────────────────────────────── */}
        <Section label="Age">
          <SliderInput
            min={10}
            max={80}
            value={age}
            onChange={setAge}
            label="Your age"
            formatValue={(v) => `${v} yrs`}
          />
        </Section>
 
        {/* ── Skill level ────────────────────────────────────────── */}
        <Section label="Skill Level">
          <SegmentedControl
            options={SKILL_OPTIONS}
            value={skill}
            onChange={setSkill}
          />
        </Section>
 
        {/* ── Region ─────────────────────────────────────────────── */}
        <Section label="Region">
          {REGIONS.map((r, i) => (
            <React.Fragment key={r}>
              <ListRow
                label={r}
                selected={region === r}
                onPress={() => setRegion(r)}
              />
              {i < REGIONS.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </Section>
 
        {/* ── Preferred era ───────────────────────────────────────── */}
        <Section label="Preferred Era">
          <RangeSlider
            min={1985}
            max={2024}
            lowValue={eraLow}
            highValue={eraHigh}
            onLowChange={setEraLow}
            onHighChange={setEraHigh}
            step={1}
            label="Year range"
            formatValue={String}
          />
          <View style={styles.eraLabels}>
            <Text style={styles.eraEdge}>1985</Text>
            <Text style={styles.eraEdge}>2024</Text>
          </View>
        </Section>
 
        {/* ── Info ────────────────────────────────────────────────── */}
        <InfoBox
          text="These settings influence question difficulty and topic relevance. You can update them any time before a game starts."
          variant="info"
        />
 
        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}
 
// ─── Section wrapper ──────────────────────────────────────────────────────────
 
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <Card>{children}</Card>
    </View>
  );
}
 
// ─── Styles ───────────────────────────────────────────────────────────────────
 
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xl,
  },
 
  header: { gap: 4 },
  screenTitle: {
    ...Typography.screenTitle,
    color: Colors.textPrimary,
  },
  screenSubtitle: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
 
  section: { gap: Spacing.sm },
  sectionLabel: {
    ...Typography.overline,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.xs,
  },
 
  divider: {
    height: 1,
    backgroundColor: Colors.separator,
    marginHorizontal: Spacing.lg,
  },
 
  eraLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
    marginTop: -Spacing.xs,
  },
  eraEdge: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
 
  bottomPad: { height: Spacing.xl },
});
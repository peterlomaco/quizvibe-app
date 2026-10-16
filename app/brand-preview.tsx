import { Redirect, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  type BrandVariant,
  QuizVibeLogoSvg,
  QuizVibeMarkSvg,
  QuizVibeWordmarkSvg,
} from '@/src/components/brand/QuizVibeBrandSvg';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/theme';

// ⚠ TEMPORARY, DEV-ONLY brand validation screen (2026-10-16).
// Renders the finalized SVG brand (design/brand/) with react-native-svg on a
// real device. Not linked from any production UI; release builds redirect
// Home. Open in the dev build via the deep link quizvibeapp://brand-preview.
// Delete this route once the brand rollout is approved.

const MARK_SIZES = [128, 64, 40, 32, 24];

export default function BrandPreview() {
  const router = useRouter();
  if (!__DEV__) return <Redirect href="/" />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} hitSlop={12}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.topTitle}>Brand Preview (dev)</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Section title="Mark — large">
          <View style={styles.center}>
            <QuizVibeMarkSvg size={240} />
          </View>
        </Section>

        <Section title="Mark — 128 / 64 / 40 / 32 / 24 pt">
          <View style={styles.sizeRow}>
            {MARK_SIZES.map((s) => (
              <View key={s} style={styles.sizeCell}>
                <QuizVibeMarkSvg size={s} />
                <Text style={styles.caption}>{s}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Full logo — large">
          <View style={styles.center}>
            <QuizVibeLogoSvg width={300} />
          </View>
        </Section>

        <Section title="Full logo — Home size (220 pt) and compact (170 pt)">
          <View style={styles.sizeRow}>
            <QuizVibeLogoSvg width={220} />
            <QuizVibeLogoSvg width={170} />
          </View>
        </Section>

        <Section title="Wordmark only — 300 / 220 / 140 pt">
          <View style={styles.stack}>
            <QuizVibeWordmarkSvg width={300} />
            <QuizVibeWordmarkSvg width={220} />
            <QuizVibeWordmarkSvg width={140} />
          </View>
        </Section>

        <Section title="Variants">
          <VariantRow label="Navy + metallic gold" variant="metallic" bg={Colors.background} />
          <VariantRow label="Flat gold" variant="flatGold" bg={Colors.background} />
          <VariantRow label="White on navy" variant="white" bg={Colors.background} />
          <VariantRow label="Monochrome on white" variant="mono" bg="#FFFFFF" dark />
        </Section>

        <Section title="Simulation 1 — Home screen header">
          <View style={styles.phone}>
            <View style={styles.simBanner}>
              <View style={styles.simPill}>
                <Text style={styles.simPillText}>⚙ Player-100</Text>
              </View>
            </View>
            <View style={styles.simHomeBrand}>
              <QuizVibeMarkSvg size={116} />
              <View style={{ height: Spacing.md }} />
              <QuizVibeWordmarkSvg width={220} />
              <Text style={styles.simTagline}>Challenge yourself. Play together.</Text>
            </View>
            <View style={styles.simGoldBtn}>
              <Text style={styles.simGoldBtnText}>Start New Game</Text>
            </View>
          </View>
        </Section>

        <Section title="Simulation 2 — Game Lobby header + room card">
          <View style={styles.phone}>
            <View style={styles.simLobbyHeader}>
              <Text style={styles.simLobbyTitle}>Game Lobby</Text>
              <View style={styles.simCredits}>
                <Text style={styles.simCreditsText}>Unlimited</Text>
              </View>
            </View>
            <View style={styles.simRoomCard}>
              <View style={styles.simRoomLogo}>
                <QuizVibeMarkSvg size={83} />
              </View>
              <Text style={styles.simRoomLabel}>ROOM CODE</Text>
              <View style={styles.simCells}>
                {['A', 'B', '–', '2', '3', '–', 'X', 'Y'].map((c, i) =>
                  c === '–' ? (
                    <Text key={i} style={styles.simDash}>–</Text>
                  ) : (
                    <View key={i} style={styles.simCell}>
                      <Text style={styles.simCellText}>{c}</Text>
                    </View>
                  ),
                )}
              </View>
            </View>
          </View>
        </Section>

        <Section title="Simulation 3 — navigation / profile placements">
          <View style={styles.phone}>
            <View style={styles.simProfileRow}>
              <QuizVibeMarkSvg size={28} />
              <Text style={styles.simProfileText}>Profile settings</Text>
            </View>
            <View style={styles.simProfileRow}>
              <QuizVibeMarkSvg size={20} variant="white" />
              <Text style={styles.simProfileText}>Home (white, 20 pt)</Text>
            </View>
            <View style={styles.simTabBar}>
              <View style={styles.simTab}>
                <QuizVibeMarkSvg size={24} />
                <Text style={[styles.simTabText, { color: Colors.warning }]}>Home</Text>
              </View>
              <View style={styles.simTab}>
                <QuizVibeMarkSvg size={24} variant="white" />
                <Text style={styles.simTabText}>Profile</Text>
              </View>
              <View style={styles.simTab}>
                <QuizVibeMarkSvg size={24} variant="flatGold" />
                <Text style={styles.simTabText}>Store</Text>
              </View>
            </View>
          </View>
        </Section>

        <Text style={styles.footer}>
          Validation only. Production screens still use the PNG logo.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function VariantRow({
  label,
  variant,
  bg,
  dark = false,
}: {
  label: string;
  variant: BrandVariant;
  bg: string;
  dark?: boolean;
}) {
  return (
    <View style={[styles.variantRow, { backgroundColor: bg }]}>
      <QuizVibeMarkSvg size={64} variant={variant} />
      <View style={styles.variantRight}>
        <QuizVibeWordmarkSvg width={170} variant={variant} />
        <Text style={[styles.caption, dark && { color: '#1B2233' }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  back: { color: Colors.textSecondary, fontSize: FontSize.md, fontWeight: FontWeight.medium },
  topTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  content: { padding: Spacing.lg, gap: Spacing.xl, paddingBottom: Spacing.xxl * 2 },
  section: { gap: Spacing.md },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  center: { alignItems: 'center' },
  stack: { alignItems: 'center', gap: Spacing.lg },
  sizeRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: Spacing.lg },
  sizeCell: { alignItems: 'center', gap: Spacing.xs },
  caption: { color: Colors.textSecondary, fontSize: FontSize.xs },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  variantRight: { gap: Spacing.xs },
  phone: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    overflow: 'hidden',
  },
  simBanner: {
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    alignItems: 'flex-end',
  },
  simPill: {
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  simPillText: { color: Colors.primary, fontWeight: FontWeight.semibold, fontSize: FontSize.sm },
  simHomeBrand: { alignItems: 'center', paddingTop: Spacing.xl, paddingBottom: Spacing.lg },
  simTagline: { color: Colors.textSecondary, fontSize: 15, marginTop: Spacing.md },
  simGoldBtn: {
    margin: Spacing.lg,
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simGoldBtnText: { color: '#000', fontSize: 17, fontWeight: FontWeight.bold },
  simLobbyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  simLobbyTitle: { color: Colors.textPrimary, fontSize: 24, fontWeight: FontWeight.bold },
  simCredits: {
    borderWidth: 1.5,
    borderColor: Colors.warning,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  simCreditsText: { color: Colors.warning, fontWeight: FontWeight.bold },
  simRoomCard: {
    margin: Spacing.lg,
    marginTop: 0,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    minHeight: 170,
    justifyContent: 'flex-end',
  },
  simRoomLogo: {
    position: 'absolute',
    top: -Spacing.sm,
    left: -Spacing.sm,
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simRoomLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.xxl,
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  simCells: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 },
  simCell: {
    width: 32,
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simCellText: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  simDash: { color: Colors.textSecondary, fontSize: FontSize.xl },
  simProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    margin: Spacing.lg,
    marginBottom: 0,
    height: 52,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.cardElevated,
  },
  simProfileText: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  simTabBar: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: 52,
  },
  simTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  simTabText: { color: Colors.textSecondary, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  footer: { color: Colors.textSecondary, fontSize: FontSize.xs, textAlign: 'center' },
});

// Competitions — egen skärm som listar användarens sparade Competition
// Leaderboards (aka Aggregate Leaderboards, migration 0037).
//
// Nås via "Competition"-knappen på Home (CompetitionsButton). Listan +
// detalj-leaderboarden är EXAKT samma som Profile → Player history
// (SavedAggregatesCard återanvänds), men här får varje leaderboard en
// gyllene Re-match/Replay-knapp — Profile behåller bara "Close".
//
// ── Re-match/Replay ─────────────────────────────────────────────────────
// Två-fas-flödet (host initierar → deltagare accepterar → host startar) bor
// i CompetitionRematchActions, som SavedAggregatesCard renderar i detalj-
// modalen när showRematch är satt (migration 0041). Profile-vyn utelämnar
// showRematch → bara Close.

import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BOTTOM_BANNER_HEIGHT } from '../components/BottomBanner';
import { SavedAggregatesCard } from '../components/SavedAggregatesCard';
import { TopUserBanner } from '../components/TopUserBanner';
import { TrophyIcon } from '../components/TrophyIcon';
import { Colors, FontSize, Spacing } from '../theme';
import { isAnonymousSession } from '../utils/auth';
import { listMyAggregateLeaderboards } from '../utils/aggregateLeaderboards';

export default function CompetitionsScreen() {
  // `from` sätts av CompetitionsButton (Home '/') så Back tar spelaren
  // tillbaka dit hen kom ifrån. Whitelist:ad mappning (samma mönster som
  // MyMatchesScreen) — okända värden faller till Home.
  const { from } = useLocalSearchParams<{ from?: string }>();
  const backTo = from === '/profile' ? '/profile' : '/';

  // Egen lättviktig laddning enbart för empty-state-texten (SavedAggregatesCard
  // laddar sitt eget innehåll och returnerar null när det är tomt).
  const [empty, setEmpty] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void (async () => {
        if (await isAnonymousSession()) {
          if (!cancelled) {
            setEmpty(true);
            setLoaded(true);
          }
          return;
        }
        const saved = await listMyAggregateLeaderboards();
        if (!cancelled) {
          setEmpty(saved.length === 0);
          setLoaded(true);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  return (
    <SafeAreaView style={styles.safe}>
      <TopUserBanner onBackPress={() => router.replace(backTo)} backLabel="Back" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Marathons</Text>
          <TrophyIcon height={28} />
        </View>
        <Text style={styles.subtitle}>
          Your saved marathon tables. Open one to see the standings and
          start a re-match with the same players.
        </Text>

        {loaded && empty && (
          <Text style={styles.emptyText}>
            No saved marathons yet. Finish a re-match from the Final
            Leaderboard to save your first marathon.
          </Text>
        )}

        <SavedAggregatesCard showRematch />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.sm,
    // Extra bottom-padding så listans sista rad inte döljs bakom den globala
    // BottomBanner:n — samma konvention som MyMatchesScreen/Home/Profile/Store.
    paddingBottom: Spacing.lg + BOTTOM_BANNER_HEIGHT,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: Spacing.md,
  },
});

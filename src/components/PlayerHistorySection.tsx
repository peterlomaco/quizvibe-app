import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors, FontSize, FontWeight, Radius, Spacing, Typography } from '../theme';
import { loadGameHistory, type HistoryEntry } from '../utils/gameResults';

// Player history-sektionen visar en minimal lista över alla spel
// användaren har spelat. Per spel: datum / totalpoäng / snittpoäng per
// fråga / snitt-svarstid. Inget HCP-progressionsdiagram, rankings,
// "highest scores" eller activity-grafer — Peter förenklade till bara
// dessa fält 2026-05-18 så vi inte fakeshow:ar data som inte finns än.
//
// Persistensen läggs i src/utils/gameResults.ts (HistoryEntry).
// One-shot wipe-migration körs i loadGameHistory:s `ensureHistoryReset` så
// ev. stale-data från tidigare experiment-pipelines clearas automatiskt
// vid första load efter förenklingen.

export function PlayerHistorySection() {
  // Kollapsbart block — speglar Game connections-mönstret. Default
  // expanded så användaren ser sin senaste historik direkt vid besök.
  const [expanded, setExpanded] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Re-load varje gång Profile får fokus så listan speglar senaste
  // append:en (Quiz → Final Leaderboard → Home → Profile).
  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadGameHistory().then((list) => {
        if (!active) return;
        setHistory([...list].sort((a, b) => b.date.localeCompare(a.date)));
      });
      return () => { active = false; };
    }, []),
  );

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setExpanded(!expanded)}
        style={({ pressed }) => [
          styles.headerRow,
          pressed && { opacity: 0.7 },
        ]}
        hitSlop={8}
      >
        <Text style={styles.sectionHeaderEmoji}>🏆</Text>
        <Text style={styles.sectionTitle}>Player history</Text>
        <View style={styles.toggleBox}>
          <Text style={styles.toggleText}>{expanded ? '−' : '+'}</Text>
        </View>
      </Pressable>
      {!expanded && <View style={styles.sectionDivider} />}

      {expanded && (
        <>
          {/* HCP-skölden togs bort 2026-05-18 (introduceras i v2 när
              HCP-progression byggs ut med riktig data). */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Games played: {history.length}
            </Text>
            {history.length === 0 ? (
              <Text style={styles.emptyText}>
                No games played yet. Play your first game from Home to start
                building history.
              </Text>
            ) : (
              <View style={styles.gameList}>
                {history.map((entry, i) => (
                  <React.Fragment key={entry.id}>
                    <GameHistoryRow entry={entry} />
                    {i < history.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                ))}
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}

// Per-spel-rad: två-rad-layout.
// Topp = datum + korrekthet ("3/4 (75%)", highlighted i primary blå).
// Botten = snitt-svarstid (textSecondary). Korrekthetsgrad visar hur
// många rätta svar av totalen — mer meningsfullt än råpoäng för spelaren.
function GameHistoryRow({ entry }: { entry: HistoryEntry }) {
  const pct =
    entry.totalQuestions > 0
      ? Math.round((entry.correctAnswers / entry.totalQuestions) * 100)
      : 0;
  return (
    <View style={styles.gameRow}>
      <View style={styles.gameTopRow}>
        <Text style={styles.gameDate}>{formatDate(entry.date)}</Text>
        <Text style={styles.gameScore}>
          {entry.correctAnswers}/{entry.totalQuestions} ({pct}%)
        </Text>
      </View>
      <View style={styles.gameMetaRow}>
        <Text style={styles.gameMeta}>
          Avg response: {entry.avgResponseSeconds.toFixed(2)}s
        </Text>
      </View>
    </View>
  );
}

// Format: "18 May 2026" (kort månad + år). ISO-input parsas via Date —
// invalid input ger tom sträng så listan inte kraschar.
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const month = d.toLocaleString('en', { month: 'short' });
  return `${d.getDate()} ${month} ${d.getFullYear()}`;
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sectionHeaderEmoji: {
    fontSize: 22,
    lineHeight: 26,
  },
  sectionTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  toggleBox: {
    width: 26,
    height: 26,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },

  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },

  gameList: { gap: 0 },
  divider: {
    height: 1,
    backgroundColor: Colors.separator,
    marginVertical: Spacing.sm,
  },
  gameRow: {
    gap: 2,
  },
  gameTopRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  gameMetaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  gameScore: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
  },
  gameDate: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  gameMeta: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
});

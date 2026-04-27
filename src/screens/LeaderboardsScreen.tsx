import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing, Typography } from '../theme';

// ─── Data (mock tills backend finns) ──────────────────────────────────────────

type Timeframe = 'day' | 'week' | 'allTime';

const TIMEFRAMES: { id: Timeframe; label: string }[] = [
  { id: 'day',     label: 'Today'     },
  { id: 'week',    label: 'This Week' },
  { id: 'allTime', label: 'All Time'  },
];

interface Player {
  rank: number;
  name: string;
  emoji: string;
  points: number;
  hcp: number;
}

const MOCK_PLAYERS: Player[] = [
  { rank: 1,  name: 'Nova',        emoji: '🦊', points: 18420, hcp: 4  },
  { rank: 2,  name: 'Retrowave',   emoji: '🕹️', points: 17890, hcp: 6  },
  { rank: 3,  name: 'SynthQueen',  emoji: '🎹', points: 17235, hcp: 9  },
  { rank: 4,  name: 'PixelDragon', emoji: '🐉', points: 15602, hcp: 18 },
  { rank: 5,  name: 'You',         emoji: '🎸', points: 14910, hcp: 22 },
  { rank: 6,  name: 'Moonbeam',    emoji: '🌙', points: 13844, hcp: 31 },
  { rank: 7,  name: 'CircuitCat',  emoji: '🤖', points: 12720, hcp: 38 },
  { rank: 8,  name: 'VinylViking', emoji: '📼', points: 11558, hcp: 45 },
  { rank: 9,  name: 'Glitch',      emoji: '👾', points: 10311, hcp: 52 },
  { rank: 10, name: 'Echo',        emoji: '🎤', points: 9876,  hcp: 60 },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LeaderboardsScreen() {
  const [timeframe, setTimeframe] = useState<Timeframe>('week');

  const top3 = MOCK_PLAYERS.slice(0, 3);
  const rest = MOCK_PLAYERS.slice(3);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Leaderboards</Text>
          <Text style={styles.screenSubtitle}>Be fast. Be right. Be legendary.</Text>
        </View>

        {/* Timeframe chips */}
        <View style={styles.chipRow}>
          {TIMEFRAMES.map((tf) => (
            <Pressable
              key={tf.id}
              onPress={() => setTimeframe(tf.id)}
              style={[styles.chip, timeframe === tf.id && styles.chipActive]}
            >
              <Text
                style={[styles.chipLabel, timeframe === tf.id && styles.chipLabelActive]}
              >
                {tf.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Podium: top 3 */}
        <View style={styles.podium}>
          <PodiumSlot player={top3[1]} height={92}  medal="🥈" />
          <PodiumSlot player={top3[0]} height={116} medal="🥇" highlight />
          <PodiumSlot player={top3[2]} height={76}  medal="🥉" />
        </View>

        {/* Rest of list */}
        <View style={styles.listSection}>
          <Text style={styles.sectionLabel}>Top 10</Text>
          <View style={styles.listCard}>
            {rest.map((p, i) => (
              <React.Fragment key={p.rank}>
                <PlayerRow player={p} isYou={p.name === 'You'} />
                {i < rest.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PodiumSlot({
  player,
  height,
  medal,
  highlight,
}: {
  player: Player;
  height: number;
  medal: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.podiumSlot}>
      <View style={[styles.podiumAvatar, highlight && styles.podiumAvatarHighlight]}>
        <Text style={styles.podiumEmoji}>{player.emoji}</Text>
      </View>
      <Text style={styles.podiumName} numberOfLines={1}>
        {player.name}
      </Text>
      <Text style={styles.podiumPoints}>{player.points.toLocaleString()} pts</Text>
      <View
        style={[
          styles.podiumBlock,
          { height },
          highlight && styles.podiumBlockHighlight,
        ]}
      >
        <Text style={styles.podiumMedal}>{medal}</Text>
        <Text style={styles.podiumRank}>#{player.rank}</Text>
      </View>
    </View>
  );
}

function PlayerRow({ player, isYou }: { player: Player; isYou: boolean }) {
  return (
    <View style={[styles.row, isYou && styles.rowYou]}>
      <Text style={[styles.rowRank, isYou && styles.rowRankYou]}>#{player.rank}</Text>
      <View style={styles.rowAvatar}>
        <Text style={styles.rowEmoji}>{player.emoji}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={[styles.rowName, isYou && styles.rowNameYou]}>
          {player.name}
          {isYou && <Text style={styles.youTag}>  (you)</Text>}
        </Text>
        <Text style={styles.rowMeta}>HCP {player.hcp}</Text>
      </View>
      <Text style={styles.rowPoints}>{player.points.toLocaleString()}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xl,
  },

  // Header
  header: { gap: 4 },
  screenTitle: { ...Typography.screenTitle, color: Colors.textPrimary },
  screenSubtitle: { ...Typography.label, color: Colors.textSecondary },

  // Chips
  chipRow: { flexDirection: 'row', gap: Spacing.sm },
  chip: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primaryBorder,
  },
  chipLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  chipLabelActive: { color: Colors.primary },

  // Podium
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  podiumSlot: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  podiumAvatar: {
    width: 56, height: 56,
    borderRadius: 28,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  podiumAvatarHighlight: {
    borderColor: '#F5A623',
    backgroundColor: 'rgba(245,166,35,0.12)',
  },
  podiumEmoji: { fontSize: 28 },
  podiumName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  podiumPoints: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  podiumBlock: {
    width: '100%',
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.md,
    borderTopRightRadius: Radius.md,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.sm,
    gap: 2,
  },
  podiumBlockHighlight: {
    backgroundColor: 'rgba(245,166,35,0.08)',
    borderColor: 'rgba(245,166,35,0.35)',
  },
  podiumMedal: { fontSize: 22 },
  podiumRank: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },

  // List
  listSection: { gap: Spacing.sm },
  sectionLabel: {
    ...Typography.overline,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.xs,
  },
  listCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.separator,
    marginHorizontal: Spacing.md,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  rowYou: { backgroundColor: Colors.primaryMuted },
  rowRank: {
    width: 36,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  rowRankYou: { color: Colors.primary },
  rowAvatar: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowEmoji: { fontSize: 18 },
  rowInfo: { flex: 1 },
  rowName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  rowNameYou: { color: Colors.primary },
  youTag: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    color: Colors.primary,
  },
  rowMeta: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rowPoints: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },

  bottomPad: { height: Spacing.xl },
});

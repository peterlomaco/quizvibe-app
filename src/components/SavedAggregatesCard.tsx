import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import {
  aggregateLabel,
  buildAggregateStandings,
} from '../utils/aggregateLeaderboard';
import {
  listMyAggregateLeaderboards,
  type SavedAggregate,
} from '../utils/aggregateLeaderboards';
import { isAnonymousSession } from '../utils/auth';
import { finalizeRows, LeaderboardTable } from './LeaderboardTable';

/**
 * Sparade Aggregate Leaderboards / Scores på Profile (migration 0037).
 *
 * Renderas inuti Player history, ovanför månadsgrupperna. Självgatande:
 * inget sparat (eller anonym session) → komponenten returnerar null och
 * Player history ser ut som förut.
 *
 * Tabellen i detalj-modalen är SAMMA `LeaderboardTable` + `finalizeRows`
 * som slutskärmen använder, så en sparad serie ser identisk ut med hur den
 * såg ut i spelet.
 */
export function SavedAggregatesCard() {
  const [items, setItems] = useState<SavedAggregate[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void (async () => {
        // Anon-sessioner har per definition inga sparade serier — men gör
        // gaten explicit, samma mönster som MyMatchesSection.
        if (await isAnonymousSession()) {
          if (!cancelled) setItems([]);
          return;
        }
        const saved = await listMyAggregateLeaderboards();
        if (!cancelled) setItems(saved);
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const open = useMemo(
    () => items.find((i) => i.id === openId) ?? null,
    [items, openId],
  );
  const openRows = useMemo(() => {
    if (!open) return [];
    const data = buildAggregateStandings({ nextRoomCode: null, games: open.games });
    return finalizeRows(
      data.standings.map((s) => ({
        playerId: s.playerId,
        name: s.name,
        emoji: s.emoji,
        age: s.age,
        assistance: s.assistance,
        points: s.points,
        playedRounds: s.playedRounds,
        correctAnswers: s.correctAnswers,
        incorrectAnswers: Math.max(0, s.playedRounds - s.correctAnswers),
        avgResponseSeconds: s.avgResponseSeconds,
        lastResponseSeconds: s.lastResponseSeconds,
        lastFiveResults: s.lastFiveResults,
        hasLeft: false,
      })),
      // Wifi-kolumnen är en proxy för "frågor bakom ledaren" och bara
      // meningsfull i Individual Devices. En sparad serie kan blanda lägen,
      // så visa den inte här.
      false,
    );
  }, [open]);

  if (items.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Competition Leaderboards</Text>
      {items.map((item) => {
        const games = item.games.length;
        const others = item.participants.map((p) => p.playerName);
        return (
          <Pressable
            key={item.id}
            onPress={() => setOpenId(item.id)}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
          >
            <View style={styles.rowText}>
              <Text style={styles.rowName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.rowMeta} numberOfLines={1}>
                {aggregateLabel(item.participants.length)} · {games}{' '}
                {games === 1 ? 'game' : 'games'}
                {others.length > 1 ? ` · ${others.join(', ')}` : ''}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        );
      })}

      <Modal
        visible={open !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setOpenId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {open?.name}
            </Text>
            <ScrollView style={{ maxHeight: 360 }}>
              <LeaderboardTable entries={openRows} />
            </ScrollView>
            <Pressable
              style={({ pressed }) => [
                styles.modalCloseBtn,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => setOpenId(null)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  // Speglar MyMatchesScreens rad-vokabulär.
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  rowText: { flex: 1 },
  rowName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  rowMeta: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    alignSelf: 'stretch',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalCloseBtn: {
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
});

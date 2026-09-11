import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/src/components/haptic';
import Svg, { Path } from 'react-native-svg';
import { useFocusEffect } from 'expo-router';
import { Colors, FontSize, FontWeight, Radius, Spacing, Typography } from '../theme';
import { buildAggregateStandings } from '../utils/aggregateLeaderboard';
import {
  deleteGameHistoryEntry,
  loadGameHistory,
  type HistoryEntry,
} from '../utils/gameResults';
import { loadFriends, type Friend } from '../utils/friendsStorage';
import {
  groupHistory,
  groupHistoryByMonthDateForm,
  resolveGameForm,
  type GroupAccessors,
  type SortMode,
} from '../utils/historyGrouping';
import {
  PLAYED_MEDIA_SOURCE_LABEL,
  PLAYED_MEDIA_SOURCE_ORDER,
} from '../utils/mediaSource';
import { CollapsibleGroup } from './CollapsibleGroup';
import { finalizeRows, LeaderboardTable } from './LeaderboardTable';
import { MyMatchesSection } from './MyMatchesSection';
import { PlayerFilterPicker } from './PlayerFilterPicker';
import { SavedAggregatesCard } from './SavedAggregatesCard';
import { SegmentedControl } from './SegmentedControl';

// Player history-sektionen visar en lista över alla spel användaren har
// spelat, var och en som ett eget TAPPBART kort som öppnar spelets final-
// leaderboard. Sorterbar (Host Name / Date) + QuizVibe-friend-filter (samma
// picker som Marathon-listan). Date-läget är tre-nivå (månad → datum →
// spelform), host-läget två-nivå (host → spelform) — samma helpers som
// SavedAggregatesCard så ytorna beter sig identiskt (enda skillnaden: inget
// "Table Name"-läge, spel har inget namn).
//
// ⚠ Bara spel med lagrade all-players-rader (`players`) listas — dvs. spel
// spelade EFTER att per-spel-leaderboarden infördes (2026-09-11). Äldre poster
// saknar fältet och filtreras bort (de kan inte visa en leaderboard).
//
// Persistensen bor i src/utils/gameResults.ts (HistoryEntry). Radering av en
// post (Delete i leaderboard-modalen) är per-device/per-user — motståndarnas
// egna devices behåller spelet; ingår spelet i en marathon är serien oberörd.

const SORT_OPTIONS = [
  { label: 'Host Name', value: 'host' },
  { label: 'Date', value: 'date' },
];

const ASSISTANCE_LABEL: Record<HistoryEntry['assistance'], string> = {
  full: 'Full',
  standard: 'Standard',
  minimal: 'Minimal',
};

function toggleSetKey(prev: Set<string>, key: string): Set<string> {
  const next = new Set(prev);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}

// Format: "18 May 2026" (kort månad + år). ISO-input parsas via Date —
// invalid input ger tom sträng så listan inte kraschar.
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const month = d.toLocaleString('en', { month: 'short' });
  return `${d.getDate()} ${month} ${d.getFullYear()}`;
}

function formAvgPct(items: HistoryEntry[]): number {
  const correct = items.reduce((sum, e) => sum + e.correctAnswers, 0);
  const total = items.reduce((sum, e) => sum + e.totalQuestions, 0);
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

export function PlayerHistorySection() {
  // Kollapsbart block — speglar Game connections-mönstret.
  // Default hopfälld — alla Profile-sektioner är ihopfällda vid besök (2026-06-01).
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('date');
  const [expandedL1, setExpandedL1] = useState<Set<string>>(new Set());
  // Date-lägets mellannivå (månad::datum). Oanvänd i host-läget.
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [expandedForms, setExpandedForms] = useState<Set<string>>(new Set());
  // Spelar-filter: QuizVibe-friends + APPLICERAT urval (multi-select). Picker-
  // UI:t bor i PlayerFilterPicker (delas med Marathon-listan).
  const [friends, setFriends] = useState<Friend[]>([]);
  const [appliedFriendIds, setAppliedFriendIds] = useState<Set<string>>(new Set());
  // Detalj-modalen (final leaderboard för ETT spel) + radera-busy-guard.
  const [openId, setOpenId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Re-load varje gång Profile får fokus så listan speglar senaste
  // append:en (Quiz → Final Leaderboard → Home → Profile).
  useFocusEffect(
    useCallback(() => {
      let active = true;
      void (async () => {
        const [list, fr] = await Promise.all([loadGameHistory(), loadFriends()]);
        if (!active) return;
        // Sortera desc by date så leaf-ordningen blir nyast först oavsett
        // grupperings-läge.
        setHistory([...list].sort((a, b) => b.date.localeCompare(a.date)));
        setFriends(fr);
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  // Bara spel med lagrade all-players-rader kan visa en leaderboard — äldre
  // poster (utan `players`) göms helt (Peter-beslut).
  const games = useMemo(
    () => history.filter((e) => e.players && e.players.length > 0),
    [history],
  );

  const selectedFriends = useMemo(
    () => friends.filter((f) => appliedFriendIds.has(f.id)),
    [friends, appliedFriendIds],
  );

  // AND-filter INNAN gruppering: bara spel där ALLA valda friends deltog.
  // Friends bär inget userId → matcha på playerName (case-insensitivt) mot
  // spelarnas snapshot-namn i `players`.
  const visibleGames = useMemo(() => {
    if (selectedFriends.length === 0) return games;
    const names = selectedFriends.map((f) => f.playerName.trim().toLowerCase());
    return games.filter((g) => {
      const partNames = new Set(
        (g.players ?? []).map((p) => p.name.trim().toLowerCase()),
      );
      return names.every((n) => partNames.has(n));
    });
  }, [games, selectedFriends]);

  const accessors = useMemo<GroupAccessors<HistoryEntry>>(
    () => ({
      getHostName: (e) => e.hostName,
      getDateISO: (e) => e.date,
      getGameForm: (e) => resolveGameForm(e.gameMode, e.singlePlayerDefault),
    }),
    [],
  );

  const isDateSort = sortMode === 'date';

  const groups = useMemo(
    () => (isDateSort ? [] : groupHistory(visibleGames, sortMode, accessors)),
    [isDateSort, visibleGames, sortMode, accessors],
  );
  const dateGroups = useMemo(
    () => (isDateSort ? groupHistoryByMonthDateForm(visibleGames, accessors) : []),
    [isDateSort, visibleGames, accessors],
  );

  const openEntry = useMemo(
    () => games.find((e) => e.id === openId) ?? null,
    [games, openId],
  );
  // Final leaderboard för ETT spel: bygg en en-spels-serie och kör exakt samma
  // väg som SavedAggregatesCard (buildAggregateStandings → finalizeRows →
  // LeaderboardTable), så ett spel ser identiskt ut med hur det såg ut live.
  const openRows = useMemo(() => {
    if (!openEntry?.players) return [];
    const data = buildAggregateStandings({
      nextRoomCode: null,
      games: [{ roomCode: openEntry.id, players: openEntry.players }],
    });
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
      false,
    );
  }, [openEntry]);

  // Radera spelet ur MIN lokala history (per-device/per-user). Motståndarna
  // behåller det på sina egna devices; ingår det i en marathon är serien
  // oberörd (separat vy, separat delete).
  const handleDeleteGame = useCallback(() => {
    if (!openEntry) return;
    const id = openEntry.id;
    const multi = (openEntry.players?.length ?? 1) > 1;
    Alert.alert(
      'Delete from your history?',
      multi
        ? 'This game will be removed from your history on this device. The other players keep it in their own history.'
        : 'This game will be removed from your history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(id);
            await deleteGameHistoryEntry(id);
            setDeletingId(null);
            setHistory((prev) => prev.filter((e) => e.id !== id));
            setOpenId(null);
          },
        },
      ],
    );
  }, [openEntry]);

  const renderCard = (entry: HistoryEntry) => (
    <GameCard key={entry.id} entry={entry} onOpen={() => setOpenId(entry.id)} />
  );

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setExpanded(!expanded)}
        style={({ pressed }) => [styles.headerRow, pressed && { opacity: 0.7 }]}
        hitSlop={8}
      >
        {/* Blå pokal-silhuett (Colors.primary) — matchar blå-temat. */}
        <View style={styles.sectionHeaderSvg}>
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" fill={Colors.primary} />
          </Svg>
        </View>
        <Text style={styles.sectionTitle}>Player history</Text>
        <View style={styles.toggleBox}>
          <Text style={styles.toggleText}>{expanded ? '−' : '+'}</Text>
        </View>
      </Pressable>
      {!expanded && <View style={styles.sectionDivider} />}

      {expanded && (
        <>
          {/* Sparade Aggregate Leaderboards/Scores (0037). Självgatande —
              inget sparat eller anonym session → renderar null.
              showRematch → detalj-modalen kör den två-fas re-match-flödet
              (CompetitionRematchActions: "Send Re-match invitation" → vänta på
              accept → "Yes – start re-match"), samma som /competitions. */}
          <SavedAggregatesCard showRematch />
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Games played: {games.length}</Text>
            {games.length === 0 ? (
              <Text style={styles.emptyText}>
                No games played yet. Play your first game from Home to start
                building history.
              </Text>
            ) : (
              <>
                <SegmentedControl
                  options={SORT_OPTIONS}
                  value={sortMode}
                  onChange={(v) => setSortMode(v as SortMode)}
                />
                <PlayerFilterPicker
                  friends={friends}
                  appliedFriendIds={appliedFriendIds}
                  onApply={setAppliedFriendIds}
                />
                {selectedFriends.length > 0 &&
                  (isDateSort ? dateGroups.length === 0 : groups.length === 0) && (
                    <Text style={styles.emptyNote}>
                      No games where all selected players took part.
                    </Text>
                  )}
                <View style={styles.gameList}>
                  {isDateSort
                    ? // Tre-nivå: månad (1) → datum (3) → spelform (2) → kort.
                      dateGroups.map((m) => {
                        const monthTotal = m.dates.reduce(
                          (sum, d) =>
                            sum + d.forms.reduce((s, f) => s + f.items.length, 0),
                          0,
                        );
                        return (
                          <CollapsibleGroup
                            key={m.monthKey}
                            level={1}
                            label={m.monthLabel}
                            summary={`${monthTotal} ${
                              monthTotal === 1 ? 'game' : 'games'
                            }`}
                            open={expandedL1.has(m.monthKey)}
                            onToggle={() =>
                              setExpandedL1((prev) => toggleSetKey(prev, m.monthKey))
                            }
                          >
                            {m.dates.map((d) => {
                              const dateKey = `${m.monthKey}::${d.dateKey}`;
                              const dateTotal = d.forms.reduce(
                                (s, f) => s + f.items.length,
                                0,
                              );
                              return (
                                <CollapsibleGroup
                                  key={dateKey}
                                  level={3}
                                  label={d.dateLabel}
                                  summary={`${dateTotal} ${
                                    dateTotal === 1 ? 'game' : 'games'
                                  }`}
                                  open={expandedDates.has(dateKey)}
                                  onToggle={() =>
                                    setExpandedDates((prev) =>
                                      toggleSetKey(prev, dateKey),
                                    )
                                  }
                                >
                                  {d.forms.map((f) => {
                                    const formKey = `${dateKey}::${f.formKey}`;
                                    return (
                                      <CollapsibleGroup
                                        key={formKey}
                                        level={2}
                                        label={f.formLabel}
                                        summary={`${f.items.length} ${
                                          f.items.length === 1 ? 'game' : 'games'
                                        } · ${formAvgPct(f.items)}% avg`}
                                        open={expandedForms.has(formKey)}
                                        onToggle={() =>
                                          setExpandedForms((prev) =>
                                            toggleSetKey(prev, formKey),
                                          )
                                        }
                                      >
                                        <View style={styles.gameList}>
                                          {f.items.map(renderCard)}
                                        </View>
                                      </CollapsibleGroup>
                                    );
                                  })}
                                </CollapsibleGroup>
                              );
                            })}
                          </CollapsibleGroup>
                        );
                      })
                    : groups.map((group) => {
                        const total = group.forms.reduce(
                          (sum, f) => sum + f.items.length,
                          0,
                        );
                        return (
                          <CollapsibleGroup
                            key={group.l1Key}
                            level={1}
                            label={group.l1Label}
                            summary={`${total} ${total === 1 ? 'game' : 'games'}`}
                            open={expandedL1.has(group.l1Key)}
                            onToggle={() =>
                              setExpandedL1((prev) => toggleSetKey(prev, group.l1Key))
                            }
                          >
                            {group.forms.map((form) => {
                              const formKey = `${group.l1Key}::${form.formKey}`;
                              return (
                                <CollapsibleGroup
                                  key={formKey}
                                  level={2}
                                  label={form.formLabel}
                                  summary={`${form.items.length} ${
                                    form.items.length === 1 ? 'game' : 'games'
                                  } · ${formAvgPct(form.items)}% avg`}
                                  open={expandedForms.has(formKey)}
                                  onToggle={() =>
                                    setExpandedForms((prev) =>
                                      toggleSetKey(prev, formKey),
                                    )
                                  }
                                >
                                  <View style={styles.gameList}>
                                    {form.items.map(renderCard)}
                                  </View>
                                </CollapsibleGroup>
                              );
                            })}
                          </CollapsibleGroup>
                        );
                      })}
                </View>
              </>
            )}
          </View>

          {/* ── Remote Play History ────────────────────────────────
              Samma knapp som på Home (MyMatchesSection) och samma
              destination (/my-matches) — 1vs1-historiken bor i den vyn,
              inte här. Renderar sig själv bara när användaren har minst
              en 1vs1-match. */}
          <View style={{ marginTop: Spacing.md }}>
            <MyMatchesSection full />
          </View>
        </>
      )}

      {/* ── Detalj: ett spels final leaderboard + local delete ───────────── */}
      <Modal
        visible={openEntry !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setOpenId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {openEntry ? formatDate(openEntry.date) : ''}
              </Text>
              <Pressable
                onPress={handleDeleteGame}
                disabled={!!deletingId}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.modalDeleteBtn,
                  (pressed || !!deletingId) && { opacity: 0.6 },
                ]}
              >
                <Text style={styles.modalDeleteText}>
                  {deletingId ? 'Deleting…' : 'Delete'}
                </Text>
              </Pressable>
            </View>
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

// Per-spel-kort: tappbart → öppnar spelets final leaderboard. Inget spelnamn,
// ingen game-count, ingen last-update (det är marathon-tabell-fält). Innehåll
// per typ: single → Age · Assistance · Era; multiplayer → N players · Era.
// Båda + Package · Sources. Topp-raden behåller datum + korrekthet.
function GameCard({
  entry,
  onOpen,
}: {
  entry: HistoryEntry;
  onOpen: () => void;
}) {
  const pct =
    entry.totalQuestions > 0
      ? Math.round((entry.correctAnswers / entry.totalQuestions) * 100)
      : 0;
  const playerCount = entry.players?.length ?? 1;
  const isSingle = entry.singlePlayerDefault === true || playerCount <= 1;
  // Paket-etikett: tom/saknad array → "Generic".
  const packages =
    !entry.selectedExtraPackages || entry.selectedExtraPackages.length === 0
      ? 'Generic'
      : entry.selectedExtraPackages.join(', ');
  // Källor i appens kanoniska ordning Spotify → YouTube → Hints.
  const sourceKeys = PLAYED_MEDIA_SOURCE_ORDER.filter((s) =>
    entry.sources?.includes(s),
  );
  const sourcesLabel =
    sourceKeys.length === 0
      ? 'None'
      : sourceKeys.map((s) => PLAYED_MEDIA_SOURCE_LABEL[s]).join(' + ');
  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => [styles.gameCard, pressed && { opacity: 0.8 }]}
    >
      <View style={styles.gameTopRow}>
        <Text style={styles.gameDate}>{formatDate(entry.date)}</Text>
        <View style={styles.gameTopRight}>
          <Text style={styles.gameScore}>
            {entry.correctAnswers}/{entry.totalQuestions} ({pct}%)
          </Text>
          <Text style={styles.chevron}>›</Text>
        </View>
      </View>
      <Text style={styles.gameMeta} numberOfLines={1}>
        {isSingle
          ? `Age ${entry.age} · ${ASSISTANCE_LABEL[entry.assistance]} · Era ${entry.eraFrom}-${entry.eraTo}`
          : `${playerCount} players · Era ${entry.eraFrom}-${entry.eraTo}`}
      </Text>
      <Text style={styles.gameMeta} numberOfLines={1}>
        Package: {packages} · Sources: {sourcesLabel}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  // Wrap för SVG-ikon i rubriken — samma höjd som emoji-varianten.
  sectionHeaderSvg: { width: 24, height: 26, alignItems: 'center', justifyContent: 'center' },
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
  emptyNote: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    paddingVertical: Spacing.sm,
  },

  gameList: { gap: Spacing.sm },

  // Tappbart per-spel-kort (speglar Marathon-listans rad-vokabulär).
  gameCard: {
    gap: 2,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  gameTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gameTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
  chevron: {
    fontSize: 22,
    color: Colors.textSecondary,
  },

  // Detalj-modal (final leaderboard + delete) — speglar SavedAggregatesCard.
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
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalDeleteBtn: {
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  modalDeleteText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.error,
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

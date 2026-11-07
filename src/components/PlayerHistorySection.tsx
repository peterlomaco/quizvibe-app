import React, { useCallback, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/src/components/haptic';
import { useFocusEffect } from 'expo-router';
import { BrandUi, Colors, FontSize, FontWeight, Radius, Spacing, Typography } from '../theme';
import { SectionToggle } from './SectionToggle';
import { ChevronIcon } from './ChevronIcon';
import { QuizVibeDialogOverlay } from './QuizVibeDialog';
import { buildAggregateStandings } from '../utils/aggregateLeaderboard';
import {
  deleteGameHistoryEntry,
  loadGameHistory,
  type HistoryEntry,
} from '../utils/gameResults';
import { loadFriends, type Friend } from '../utils/friendsStorage';
import { PURCHASED_PACKAGES } from '../utils/mockPurchasedPackages';
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
import { isMultiplayerV2Copy } from '../utils/modeLabels';
import { finalizeRows, LeaderboardTable } from './LeaderboardTable';
import { MyMatchesSection } from './MyMatchesSection';
import { PlayerFilterPicker } from './PlayerFilterPicker';
import { SavedAggregatesCard } from './SavedAggregatesCard';
import { SegmentedControl } from './SegmentedControl';
import { HistoryOutlineIcon } from './SectionIcons';

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
  // Kort-kollaps för "Games played" — default hopfällt (bara rubriken syns).
  const [gamesOpen, setGamesOpen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  // Båda korten (Marathon tables + Games played) visas först när BÅDA har
  // laddat klart — annars visades "Games played: 0" en stund och korten dök
  // upp var för sig. Tills dess syns bara sektionsrubriken.
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [aggregatesLoaded, setAggregatesLoaded] = useState(false);
  const handleAggregatesLoaded = useCallback(() => setAggregatesLoaded(true), []);
  const cardsReady = historyLoaded && aggregatesLoaded;
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
  // Bekräftelse för Delete — QuizVibeDialog-kortet renderas INUTI detalj-
  // modalen (två samtidiga RN-Modals kan sväljas på iOS).
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Re-load varje gång Profile får fokus så listan speglar senaste
  // append:en (Quiz → Final Leaderboard → Home → Profile).
  useFocusEffect(
    useCallback(() => {
      let active = true;
      void (async () => {
        try {
          const [list, fr] = await Promise.all([loadGameHistory(), loadFriends()]);
          if (!active) return;
          // Sortera desc by date så leaf-ordningen blir nyast först oavsett
          // grupperings-läge.
          setHistory([...list].sort((a, b) => b.date.localeCompare(a.date)));
          setFriends(fr);
        } finally {
          if (active) setHistoryLoaded(true);
        }
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
      getGameForm: (e) => resolveGameForm(e.gameMode, e.singlePlayerDefault, isMultiplayerV2Copy()),
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
  const handleDeleteGame = useCallback(async () => {
    if (!openEntry) return;
    const id = openEntry.id;
    setConfirmDelete(false);
    setDeletingId(id);
    await deleteGameHistoryEntry(id);
    setDeletingId(null);
    setHistory((prev) => prev.filter((e) => e.id !== id));
    setOpenId(null);
  }, [openEntry]);
  const closeDetail = useCallback(() => {
    setConfirmDelete(false);
    setOpenId(null);
  }, []);

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
        {/* Samma rubrik som övriga Profile-sektioner: dämpad ikon + +/− med svag guldkant utfälld. */}
        <View style={styles.sectionHeaderSvg}>
          <HistoryOutlineIcon size={24} color={BrandUi.iconMuted} />
        </View>
        <Text style={styles.sectionTitle}>Player history</Text>
        <SectionToggle expanded={expanded} />
      </Pressable>
      {!expanded && <View style={styles.sectionDivider} />}

      {/* Innehållet är ALLTID monterat (dolt via display:none) så Marathon-
          kortet förladdar redan vid fokus i stället för först vid expand. */}
      <View style={[styles.contentWrap, !(expanded && cardsReady) && styles.hidden]}>
          {/* Sparade Aggregate Leaderboards/Scores (0037). Självgatande —
              inget sparat eller anonym session → renderar null.
              showRematch → detalj-modalen kör den två-fas re-match-flödet
              (CompetitionRematchActions: "Send Re-match invitation" → vänta på
              accept → "Yes – start re-match"), samma som /competitions. */}
          <SavedAggregatesCard
            showRematch
            collapsible
            onLoaded={handleAggregatesLoaded}
          />
          <View style={styles.card}>
            <Pressable
              onPress={() => setGamesOpen((o) => !o)}
              style={({ pressed }) => [styles.cardHeaderRow, pressed && { opacity: 0.7 }]}
              hitSlop={8}
            >
              <Text style={styles.cardTitle}>
                Games played <Text style={styles.cardCount}>{games.length}</Text>
              </Text>
              <SectionToggle expanded={gamesOpen} tone="neutral" />
            </Pressable>
            {!gamesOpen ? null : games.length === 0 ? (
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
      </View>

      {/* ── Detalj: ett spels final leaderboard + local delete ───────────── */}
      <Modal
        visible={openEntry !== null}
        transparent
        animationType="fade"
        onRequestClose={closeDetail}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {openEntry ? formatDate(openEntry.date) : ''}
              </Text>
              <Pressable
                onPress={() => setConfirmDelete(true)}
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
              <LeaderboardTable entries={openRows} variant="subtle" />
            </ScrollView>
            <Pressable
              style={({ pressed }) => [
                styles.modalCloseBtn,
                pressed && { opacity: 0.8 },
              ]}
              onPress={closeDetail}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
          </View>
          {confirmDelete && openEntry && (
            <QuizVibeDialogOverlay
              title="Delete from your history?"
              message={
                (openEntry.players?.length ?? 1) > 1
                  ? 'This game will be removed from your history on this device. The other players keep it in their own history.'
                  : 'This game will be removed from your history.'
              }
              secondaryLabel="Cancel"
              primaryLabel="Delete"
              destructive
              onPrimary={handleDeleteGame}
              onClose={() => setConfirmDelete(false)}
            />
          )}
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
      : entry.selectedExtraPackages
          .map((id) => PURCHASED_PACKAGES.find((p) => p.id === id)?.name ?? id)
          .join(', ');
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
            {entry.correctAnswers}/{entry.totalQuestions}
            <Text style={styles.gamePct}> · {pct}%</Text>
          </Text>
          <ChevronIcon size={18} strokeWidth={2} color="rgba(255,255,255,0.75)" />
        </View>
      </View>
      <Text style={styles.gameMeta} numberOfLines={1}>
        {isSingle
          ? `Age ${entry.age} · ${ASSISTANCE_LABEL[entry.assistance]} · Era ${entry.eraFrom}–${entry.eraTo}`
          : `${playerCount} players · Era ${entry.eraFrom}–${entry.eraTo}`}
      </Text>
      <Text style={styles.gameMetaTertiary} numberOfLines={1}>
        {packages} · {sourcesLabel}
      </Text>
    </Pressable>
  );
}

// Player history v2 (2026-10-19): mörka, lugna kort; hierarki via vit /
// dämpad text i stället för kanter. Guld bara för aktiva val.
const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  contentWrap: { gap: Spacing.md },
  hidden: { display: 'none' },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sectionHeaderSvg: { width: 24, height: 26, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
    flex: 1,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  card: {
    backgroundColor: BrandUi.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    paddingBottom: 20,
    gap: Spacing.md,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  cardCount: {
    fontWeight: FontWeight.medium,
    color: BrandUi.textMuted,
    fontVariant: ['tabular-nums'],
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: BrandUi.textMuted,
  },
  emptyNote: {
    fontSize: FontSize.sm,
    color: BrandUi.textMuted,
    paddingVertical: Spacing.sm,
  },

  gameList: { gap: Spacing.sm },

  // Per-spel-kort — höjs från bakgrunden via ytkontrast, nästan ingen kant.
  gameCard: {
    gap: 4,
    backgroundColor: BrandUi.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  gameTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  gameTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  gameDate: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  gameScore: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  gamePct: {
    fontWeight: FontWeight.regular,
    color: BrandUi.textMuted,
  },
  gameMeta: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.52)',
    fontVariant: ['tabular-nums'],
  },
  gameMetaTertiary: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.4)',
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
    backgroundColor: '#0F1828',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: BrandUi.border,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  modalTitle: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  // Kompakt destruktiv sekundär-action — röd men konkurrerar inte med titeln.
  modalDeleteBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.5)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    height: 30,
    justifyContent: 'center',
  },
  modalDeleteText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.error,
  },
  modalCloseBtn: {
    height: 37,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: BrandUi.border,
    backgroundColor: BrandUi.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
});

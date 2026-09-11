import { useFocusEffect } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/src/components/haptic';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import { buildAggregateStandings } from '../utils/aggregateLeaderboard';
import {
  dismissAggregateLeaderboard,
  listMyAggregateLeaderboards,
  type SavedAggregate,
} from '../utils/aggregateLeaderboards';
import { getCurrentUserId, isAnonymousSession } from '../utils/auth';
import { getAvatarEmojiById } from '../utils/avatars';
import { loadFriends, type Friend } from '../utils/friendsStorage';
import {
  groupHistory,
  groupHistoryByMonthDateForm,
  resolveGameForm,
  type GroupAccessors,
  type SortMode,
} from '../utils/historyGrouping';
import { CollapsibleGroup } from './CollapsibleGroup';
import { CompetitionRematchActions } from './CompetitionRematchActions';
import { finalizeRows, LeaderboardTable } from './LeaderboardTable';
import { NewUpdateBadge } from './NewUpdateBadge';
import { SegmentedControl } from './SegmentedControl';

/**
 * Sparade Aggregate Leaderboards / Scores på Profile (migration 0037).
 *
 * Renderas inuti Player history, ovanför månadsgrupperna, OCH på /competitions
 * (Home:s Marathon-knapp). Självgatande: inget sparat (eller anonym session) →
 * komponenten returnerar null.
 *
 * Listan är sorterbar (Host Name / Date) och två-nivå-collapsible: level 1 =
 * host / månad, level 2 = spelform. Grupperingslogiken bor i historyGrouping.ts
 * och delas med PlayerHistorySection så båda ytorna beter sig identiskt.
 *
 * Tabellen i detalj-modalen är SAMMA `LeaderboardTable` + `finalizeRows`
 * som slutskärmen använder, så en sparad serie ser identisk ut med hur den
 * såg ut i spelet.
 */
/**
 * @param showRematch  När true renderar detalj-modalen re-match/replay-
 *   åtgärderna (CompetitionRematchActions — host initierar, deltagare
 *   accepterar, host startar) ovanför Close. Används av /competitions-skärmen
 *   (öppnad från Home:s Competition-knapp). Profile-call-siten utelämnar den →
 *   bara Close, som förut.
 */
const SORT_OPTIONS = [
  { label: 'Host Name', value: 'host' },
  { label: 'Date', value: 'date' },
  { label: 'Table Name', value: 'name' },
];

function toggleSetKey(prev: Set<string>, key: string): Set<string> {
  const next = new Set(prev);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}

/** Sist spelad (updated_at ?? created_at) → "10 Sep 2026", eller null om saknas/ogiltig. */
function formatLastPlayed(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function SavedAggregatesCard({
  showRematch = false,
  focusIds,
}: {
  showRematch?: boolean;
  /** Flash-guide: leaderboard-id:n (= SavedAggregate.id) som ska blinka "New
   *  update" och vars grupp/spelform auto-fälls ut. Sätts från /competitions
   *  när Home:s "Accept re-match" tappas. */
  focusIds?: string[];
} = {}) {
  const [items, setItems] = useState<SavedAggregate[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('date');
  const [expandedL1, setExpandedL1] = useState<Set<string>>(new Set());
  // Date-lägets mellannivå (månad::datum). Oanvänd i host/name-lägena.
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [expandedForms, setExpandedForms] = useState<Set<string>>(new Set());
  // Inloggade user:s uid — för "min egen som Host först" i host-sorten.
  const [selfHostId, setSelfHostId] = useState<string | null>(null);
  // Spelar-filter: QuizVibe-friends-lista + APPLICERAT urval (multi-select) +
  // picker-sheetens PENDING kryssrutor + sheet-öppen. Väljs ur en lista med
  // kryssrutor (som Lobbyns Share invite) och appliceras via "Add".
  const [friends, setFriends] = useState<Friend[]>([]);
  const [appliedFriendIds, setAppliedFriendIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [pickerOpen, setPickerOpen] = useState(false);
  // Flash-guide: id:n som blinkar (seedade en gång per focusIds-värde).
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());
  const appliedFocusRef = useRef<string | null>(null);
  // Radera-knappen i detalj-modalen — busy-guard mot dubbeltapp.
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        const [saved, uid, fr] = await Promise.all([
          listMyAggregateLeaderboards(),
          getCurrentUserId(),
          loadFriends(),
        ]);
        if (!cancelled) {
          // Dölj serier JAG raderat ur min historik (0052) — övriga deltagare
          // behåller dem. Matchas på min egen deltagar-rads `dismissed`.
          setItems(
            saved.filter(
              (a) =>
                !a.participants.find((p) => p.userId === uid)?.dismissed,
            ),
          );
          setSelfHostId(uid);
          setFriends(fr);
        }
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

  const selectedFriends = useMemo(
    () => friends.filter((f) => appliedFriendIds.has(f.id)),
    [friends, appliedFriendIds],
  );

  // AND-filter INNAN gruppering: bara marathons där ALLA valda friends deltog.
  // Friends bär inget userId → matcha på playerName (case-insensitivt) mot
  // deltagarnas snapshot-namn.
  const visibleItems = useMemo(() => {
    if (selectedFriends.length === 0) return items;
    const names = selectedFriends.map((f) => f.playerName.trim().toLowerCase());
    return items.filter((i) => {
      const partNames = new Set(
        i.participants.map((p) => p.playerName.trim().toLowerCase()),
      );
      return names.every((n) => partNames.has(n));
    });
  }, [items, selectedFriends]);

  const accessors = useMemo<GroupAccessors<SavedAggregate>>(
    () => ({
      getHostName: (it) =>
        it.participants.find((p) => p.userId === it.createdBy)?.playerName,
      getHostUserId: (it) => it.createdBy,
      getDateISO: (it) => it.updatedAt ?? it.createdAt,
      getName: (it) => it.name,
      getGameForm: (it) =>
        resolveGameForm(
          it.latestSettings?.gameMode,
          it.latestSettings?.singlePlayerDefault,
        ),
    }),
    [],
  );

  const isDateSort = sortMode === 'date';

  // Host/Name: två-nivå (l1 → spelform). Date: tre-nivå (månad → datum →
  // spelform) via egen funktion — se render-grenen nedan.
  const groups = useMemo(
    () => (isDateSort ? [] : groupHistory(visibleItems, sortMode, accessors, selfHostId)),
    [isDateSort, visibleItems, sortMode, accessors, selfHostId],
  );
  const dateGroups = useMemo(
    () => (isDateSort ? groupHistoryByMonthDateForm(visibleItems, accessors) : []),
    [isDateSort, visibleItems, accessors],
  );

  // Flash-guide: fäll ut gruppen + spelformen som håller de utpekade raderna
  // och blinka dem. Applicera en gång per focusIds-värde (focus-reloads ska
  // inte återöppna grupper som user själv fällt ihop). Körs EFTER default-
  // expand-effekten ovan så den mergar in målgrupperna i stället för att bli
  // överskriven.
  useEffect(() => {
    if (!focusIds || focusIds.length === 0) return;
    // Vänta tills den aktiva strukturen faktiskt laddats.
    if (isDateSort ? dateGroups.length === 0 : groups.length === 0) return;
    const sig = focusIds.join(',');
    if (appliedFocusRef.current === sig) return;
    appliedFocusRef.current = sig;
    const ids = new Set(focusIds);
    setFlashIds(ids);
    const l1ToOpen = new Set<string>();
    const datesToOpen = new Set<string>();
    const formsToOpen = new Set<string>();
    if (isDateSort) {
      // månad → datum → spelform
      for (const m of dateGroups) {
        for (const d of m.dates) {
          for (const f of d.forms) {
            if (f.items.some((it) => ids.has(it.id))) {
              l1ToOpen.add(m.monthKey);
              datesToOpen.add(`${m.monthKey}::${d.dateKey}`);
              formsToOpen.add(`${m.monthKey}::${d.dateKey}::${f.formKey}`);
            }
          }
        }
      }
    } else {
      for (const g of groups) {
        for (const f of g.forms) {
          if (f.items.some((it) => ids.has(it.id))) {
            l1ToOpen.add(g.l1Key);
            formsToOpen.add(`${g.l1Key}::${f.formKey}`);
          }
        }
      }
    }
    if (l1ToOpen.size > 0) {
      setExpandedL1((prev) => new Set([...prev, ...l1ToOpen]));
      setExpandedDates((prev) => new Set([...prev, ...datesToOpen]));
      setExpandedForms((prev) => new Set([...prev, ...formsToOpen]));
    }
  }, [focusIds, groups, dateGroups, isDateSort]);

  // Radera en Marathon-tabell ur MIN historik (0052). Per-user: övriga
  // deltagare behåller den, men serien blir permanent olåsbar för re-match.
  const handleDeleteMarathon = useCallback(() => {
    if (!open) return;
    const id = open.id;
    const solo = open.participants.length <= 1;
    Alert.alert(
      'Delete from your history?',
      solo
        ? 'This marathon will be removed from your history and can no longer be replayed.'
        : 'This marathon will be removed from your history and can no longer be re-played by anyone. The other players keep it in their own history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(id);
            const ok = await dismissAggregateLeaderboard(id);
            setDeletingId(null);
            if (!ok) {
              Alert.alert('Could not delete', 'Please try again.');
              return;
            }
            setItems((prev) => prev.filter((a) => a.id !== id));
            setOpenId(null);
          },
        },
      ],
    );
  }, [open]);

  if (items.length === 0) return null;

  const renderRow = (item: SavedAggregate) => {
    const games = item.games.length;
    const players = item.participants.length;
    const lastPlayed = formatLastPlayed(item.updatedAt ?? item.createdAt);
    const isFlash = flashIds.has(item.id);
    return (
      <Pressable
        key={item.id}
        onPress={() => setOpenId(item.id)}
        style={({ pressed }) => [
          styles.row,
          isFlash && styles.rowFlash,
          pressed && { opacity: 0.8 },
        ]}
      >
        {isFlash && <NewUpdateBadge pill active style={styles.rowFlashBadge} />}
        <View style={styles.rowText}>
          <Text style={styles.rowName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.rowMeta} numberOfLines={1}>
            {games} {games === 1 ? 'game' : 'games'}
            {players > 1 ? ` · ${players} players` : ''}
          </Text>
        </View>
        <View style={styles.rowRight}>
          {lastPlayed ? (
            <Text style={styles.rowDate} numberOfLines={1}>
              Last update: {lastPlayed}
            </Text>
          ) : null}
          <Text style={styles.chevron}>›</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Marathon tables</Text>
      <SegmentedControl
        options={SORT_OPTIONS}
        value={sortMode}
        onChange={(v) => setSortMode(v as SortMode)}
      />
      {/* Spelar-filter: välj en QuizVibe-friend ur en lista (bottom-sheet, samma
          mönster som Lobbyns Share invite) för att bara visa marathons den
          spelaren deltog i. Ingen fritext-sökning. */}
      <View style={styles.filterRow}>
        <Pressable
          onPress={() => {
            setPendingIds(new Set(appliedFriendIds));
            setPickerOpen(true);
          }}
          style={({ pressed }) => [styles.filterBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.filterBtnText}>
            {selectedFriends.length > 0 ? 'Change players' : 'Filter by players'}
          </Text>
        </Pressable>
        {selectedFriends.length > 0 && (
          <View style={styles.filterChip}>
            <Text style={styles.filterChipIcon}>
              {selectedFriends.length === 1
                ? getAvatarEmojiById(selectedFriends[0].avatarId)
                : '👥'}
            </Text>
            <Text style={styles.filterChipText} numberOfLines={1}>
              {selectedFriends.length === 1
                ? selectedFriends[0].playerName
                : `${selectedFriends.length} players`}
            </Text>
            <Pressable hitSlop={8} onPress={() => setAppliedFriendIds(new Set())}>
              <Text style={styles.filterChipClear}>×</Text>
            </Pressable>
          </View>
        )}
      </View>
      {selectedFriends.length > 0 &&
        (isDateSort ? dateGroups.length === 0 : groups.length === 0) && (
          <Text style={styles.emptyNote}>
            No marathons where all selected players took part.
          </Text>
        )}
      <View style={styles.groups}>
        {isDateSort
          ? // Tre-nivå: månad (level 1) → datum (level 3) → spelform (level 2).
            dateGroups.map((m) => {
              const monthTotal = m.dates.reduce(
                (sum, d) =>
                  sum + d.forms.reduce((s, f) => s + f.items.length, 0),
                0,
              );
              const monthFlash = m.dates.some((d) =>
                d.forms.some((f) => f.items.some((it) => flashIds.has(it.id))),
              );
              return (
                <CollapsibleGroup
                  key={m.monthKey}
                  level={1}
                  label={m.monthLabel}
                  summary={`${monthTotal} ${
                    monthTotal === 1 ? 'marathon' : 'marathons'
                  }`}
                  open={expandedL1.has(m.monthKey)}
                  onToggle={() =>
                    setExpandedL1((prev) => toggleSetKey(prev, m.monthKey))
                  }
                  badge={monthFlash ? <NewUpdateBadge active /> : undefined}
                >
                  {m.dates.map((d) => {
                    const dateKey = `${m.monthKey}::${d.dateKey}`;
                    const dateTotal = d.forms.reduce(
                      (s, f) => s + f.items.length,
                      0,
                    );
                    const dateFlash = d.forms.some((f) =>
                      f.items.some((it) => flashIds.has(it.id)),
                    );
                    return (
                      <CollapsibleGroup
                        key={dateKey}
                        level={3}
                        label={d.dateLabel}
                        summary={`${dateTotal} ${
                          dateTotal === 1 ? 'marathon' : 'marathons'
                        }`}
                        open={expandedDates.has(dateKey)}
                        onToggle={() =>
                          setExpandedDates((prev) => toggleSetKey(prev, dateKey))
                        }
                        badge={dateFlash ? <NewUpdateBadge active /> : undefined}
                      >
                        {d.forms.map((f) => {
                          const formKey = `${dateKey}::${f.formKey}`;
                          const formFlash = f.items.some((it) =>
                            flashIds.has(it.id),
                          );
                          return (
                            <CollapsibleGroup
                              key={formKey}
                              level={2}
                              label={f.formLabel}
                              summary={`${f.items.length} ${
                                f.items.length === 1 ? 'marathon' : 'marathons'
                              }`}
                              open={expandedForms.has(formKey)}
                              onToggle={() =>
                                setExpandedForms((prev) =>
                                  toggleSetKey(prev, formKey),
                                )
                              }
                              badge={
                                formFlash ? <NewUpdateBadge active /> : undefined
                              }
                            >
                              <View style={styles.rowList}>
                                {f.items.map(renderRow)}
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
          : groups.map((g) => {
              const total = g.forms.reduce((sum, f) => sum + f.items.length, 0);
              const l1Flash = g.forms.some((f) =>
                f.items.some((it) => flashIds.has(it.id)),
              );
              return (
                <CollapsibleGroup
                  key={g.l1Key}
                  level={1}
                  label={g.l1Label}
                  summary={`${total} ${total === 1 ? 'marathon' : 'marathons'}`}
                  open={expandedL1.has(g.l1Key)}
                  onToggle={() =>
                    setExpandedL1((prev) => toggleSetKey(prev, g.l1Key))
                  }
                  badge={l1Flash ? <NewUpdateBadge active /> : undefined}
                >
                  {g.forms.map((f) => {
                    const formKey = `${g.l1Key}::${f.formKey}`;
                    const formFlash = f.items.some((it) => flashIds.has(it.id));
                    return (
                      <CollapsibleGroup
                        key={formKey}
                        level={2}
                        label={f.formLabel}
                        summary={`${f.items.length} ${
                          f.items.length === 1 ? 'marathon' : 'marathons'
                        }`}
                        open={expandedForms.has(formKey)}
                        onToggle={() =>
                          setExpandedForms((prev) => toggleSetKey(prev, formKey))
                        }
                        badge={formFlash ? <NewUpdateBadge active /> : undefined}
                      >
                        <View style={styles.rowList}>
                          {f.items.map(renderRow)}
                        </View>
                      </CollapsibleGroup>
                    );
                  })}
                </CollapsibleGroup>
              );
            })}
      </View>

      <Modal
        visible={open !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setOpenId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Rubrik-rad: namn till vänster, röd Delete uppe till höger.
                Delete raderar serien ur MIN historik (per-user, 0052). */}
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {open?.name}
              </Text>
              <Pressable
                onPress={handleDeleteMarathon}
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
            {/* Re-match/Replay-åtgärder — bara när kortet öppnats från Home
                (/competitions). Host initierar, deltagare accepterar, host
                startar (två-fas, migration 0041). Profile-vyn utelämnar
                showRematch → bara Close. */}
            {/* Flash-guidens sista steg: blinka "New update" över accept-
                åtgärden när modalen öppnats för en utpekad Marathon table. */}
            {showRematch && open && flashIds.has(open.id) && (
              <NewUpdateBadge pill active style={styles.modalFlashBadge} />
            )}
            {showRematch && open && (
              <CompetitionRematchActions
                saved={open}
                onClose={() => setOpenId(null)}
              />
            )}
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

      {/* ── Filter-by-player picker (bottom sheet, som Lobbyns Share invite) ── */}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}
      >
        <View style={styles.sheetOverlay}>
          <Pressable
            style={styles.sheetBackdrop}
            onPress={() => setPickerOpen(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Filter by player</Text>
            <Text style={styles.sheetSubtitle}>
              Show only marathons a QuizVibe friend took part in.
            </Text>
            {friends.length === 0 ? (
              <View style={styles.sheetEmpty}>
                <Text style={styles.sheetEmptyText}>No friends saved yet</Text>
                <Text style={styles.sheetEmptySub}>
                  Add friends via Share invite in a lobby to filter by them here.
                </Text>
              </View>
            ) : (
              <>
                {/* Header-rad: "All players" untick:ar alla; "Add" applicerar
                    de ikryssade och stänger. Filtret = marathons där ALLA
                    ikryssade spelare deltog. */}
                <View style={styles.sheetHeaderRow}>
                  <Pressable
                    hitSlop={8}
                    onPress={() => setPendingIds(new Set())}
                  >
                    <Text style={styles.friendAllText}>All players</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setAppliedFriendIds(new Set(pendingIds));
                      setPickerOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.addBtn,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Text style={styles.addBtnText}>Add</Text>
                  </Pressable>
                </View>
                <ScrollView style={{ maxHeight: 320 }}>
                  {friends.map((f) => {
                    const checked = pendingIds.has(f.id);
                    return (
                      <View key={f.id} style={styles.friendRow}>
                        <View style={styles.friendNamePill}>
                          <Text style={styles.friendPillIcon}>
                            {getAvatarEmojiById(f.avatarId)}
                          </Text>
                          <Text style={styles.friendPillText} numberOfLines={1}>
                            {f.playerName}
                          </Text>
                        </View>
                        <Pressable
                          onPress={() =>
                            setPendingIds((prev) => {
                              const next = new Set(prev);
                              if (next.has(f.id)) next.delete(f.id);
                              else next.add(f.id);
                              return next;
                            })
                          }
                          hitSlop={8}
                          style={[
                            styles.checkbox,
                            checked && styles.checkboxChecked,
                          ]}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked }}
                          accessibilityLabel={`Filter by ${f.playerName}`}
                        >
                          {checked && <Text style={styles.checkmark}>✓</Text>}
                        </Pressable>
                      </View>
                    );
                  })}
                </ScrollView>
              </>
            )}
            <Pressable
              style={({ pressed }) => [
                styles.modalCloseBtn,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => setPickerOpen(false)}
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
  groups: { gap: Spacing.sm },
  rowList: { gap: Spacing.sm },
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
  // Flash-guide: den utpekade raden får guld-kant + kant-skärande "New update".
  rowFlash: {
    borderColor: Colors.warning,
  },
  rowFlashBadge: {
    position: 'absolute',
    top: -8,
    right: Spacing.md,
    zIndex: 2,
  },
  modalFlashBadge: {
    alignSelf: 'center',
  },
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
  // Höger kolumn: sist-spelad-datum (övre högra hörnet) ovanpå chevron.
  rowRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    gap: 2,
  },
  rowDate: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  chevron: {
    fontSize: 22,
    color: Colors.textSecondary,
  },
  // ── Spelar-filter ──────────────────────────────────────────────────────
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  filterBtn: {
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  filterBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  filterChipIcon: { fontSize: 16 },
  filterChipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    maxWidth: 160,
  },
  filterChipClear: {
    fontSize: 18,
    lineHeight: 20,
    color: Colors.primary,
    paddingHorizontal: 2,
  },
  emptyNote: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    paddingVertical: Spacing.sm,
  },
  // ── Filter-picker bottom sheet (mönster: Lobbyns Share invite) ──────────
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheetBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: Spacing.xs,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sheetSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  sheetEmpty: { paddingVertical: Spacing.lg, gap: Spacing.xs },
  sheetEmptyText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  sheetEmptySub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  friendNamePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    flexShrink: 1,
  },
  friendPillIcon: { fontSize: 16 },
  friendPillText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    flexShrink: 1,
  },
  friendAllText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  addBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.background,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.background,
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
  // Röd Delete uppe till höger i modalen (radera ur egen historik).
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

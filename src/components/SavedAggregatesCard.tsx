import { useFocusEffect } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/src/components/haptic';
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
import {
  groupHistory,
  resolveGameForm,
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
];

function toggleSetKey(prev: Set<string>, key: string): Set<string> {
  const next = new Set(prev);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
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
  const [expandedForms, setExpandedForms] = useState<Set<string>>(new Set());
  // Flash-guide: id:n som blinkar (seedade en gång per focusIds-värde).
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());
  const appliedFocusRef = useRef<string | null>(null);
  // Default-expandera första gruppens första spelform EN gång per sortMode
  // (så ett sort-byte re-defaultar, men focus-reloads inte över-skriver
  // user:s toggling).
  const initedSortRef = useRef<SortMode | null>(null);

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

  const groups = useMemo(
    () =>
      groupHistory(items, sortMode, {
        getHostName: (it) =>
          it.participants.find((p) => p.userId === it.createdBy)?.playerName,
        getDateISO: (it) => it.updatedAt ?? it.createdAt,
        getGameForm: (it) =>
          resolveGameForm(
            it.latestSettings?.gameMode,
            it.latestSettings?.singlePlayerDefault,
          ),
      }),
    [items, sortMode],
  );

  useEffect(() => {
    if (groups.length === 0) return;
    if (initedSortRef.current === sortMode) return;
    initedSortRef.current = sortMode;
    const first = groups[0];
    const firstForm = first.forms[0];
    setExpandedL1(new Set([first.l1Key]));
    setExpandedForms(
      firstForm ? new Set([`${first.l1Key}::${firstForm.formKey}`]) : new Set(),
    );
  }, [sortMode, groups]);

  // Flash-guide: fäll ut gruppen + spelformen som håller de utpekade raderna
  // och blinka dem. Applicera en gång per focusIds-värde (focus-reloads ska
  // inte återöppna grupper som user själv fällt ihop). Körs EFTER default-
  // expand-effekten ovan så den mergar in målgrupperna i stället för att bli
  // överskriven.
  useEffect(() => {
    if (!focusIds || focusIds.length === 0 || groups.length === 0) return;
    const sig = focusIds.join(',');
    if (appliedFocusRef.current === sig) return;
    appliedFocusRef.current = sig;
    const ids = new Set(focusIds);
    setFlashIds(ids);
    const l1ToOpen = new Set<string>();
    const formsToOpen = new Set<string>();
    for (const g of groups) {
      for (const f of g.forms) {
        if (f.items.some((it) => ids.has(it.id))) {
          l1ToOpen.add(g.l1Key);
          formsToOpen.add(`${g.l1Key}::${f.formKey}`);
        }
      }
    }
    if (l1ToOpen.size > 0) {
      setExpandedL1((prev) => new Set([...prev, ...l1ToOpen]));
      setExpandedForms((prev) => new Set([...prev, ...formsToOpen]));
    }
  }, [focusIds, groups]);

  if (items.length === 0) return null;

  const renderRow = (item: SavedAggregate) => {
    const games = item.games.length;
    const others = item.participants.map((p) => p.playerName);
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
            {aggregateLabel(item.participants.length)} · {games}{' '}
            {games === 1 ? 'game' : 'games'}
            {others.length > 1 ? ` · ${others.join(', ')}` : ''}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
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
      <View style={styles.groups}>
        {groups.map((g) => {
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
              onToggle={() => setExpandedL1((prev) => toggleSetKey(prev, g.l1Key))}
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
                    <View style={styles.rowList}>{f.items.map(renderRow)}</View>
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
            <Text style={styles.modalTitle} numberOfLines={1}>
              {open?.name}
            </Text>
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

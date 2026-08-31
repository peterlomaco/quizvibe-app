import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/src/components/haptic';
import Svg, { Path } from 'react-native-svg';
import { useFocusEffect } from 'expo-router';
import { Colors, FontSize, FontWeight, Radius, Spacing, Typography } from '../theme';
import { loadGameHistory, type HistoryEntry } from '../utils/gameResults';
import {
  groupHistory,
  resolveGameForm,
  type SortMode,
} from '../utils/historyGrouping';
import { PLAYED_MEDIA_SOURCE_LABEL, PLAYED_MEDIA_SOURCE_ORDER } from '../utils/mediaSource';
import { CollapsibleGroup } from './CollapsibleGroup';
import { MyMatchesSection } from './MyMatchesSection';
import { SavedAggregatesCard } from './SavedAggregatesCard';
import { SegmentedControl } from './SegmentedControl';

// Player history-sektionen visar en lista över alla spel användaren har
// spelat, sorterbar (Host Name / Date) och två-nivå-collapsible: level 1 =
// host / månad, level 2 = spelform. Grupperingslogiken bor i
// historyGrouping.ts och delas med Marathon-listan (SavedAggregatesCard) så
// båda ytorna beter sig identiskt.
//
// Persistensen läggs i src/utils/gameResults.ts (HistoryEntry). One-shot
// wipe-migration körs i loadGameHistory:s `ensureHistoryReset`.

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

export function PlayerHistorySection() {
  // Kollapsbart block — speglar Game connections-mönstret.
  // Default hopfälld — alla Profile-sektioner är ihopfällda vid besök (2026-06-01).
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('date');
  const [expandedL1, setExpandedL1] = useState<Set<string>>(new Set());
  const [expandedForms, setExpandedForms] = useState<Set<string>>(new Set());
  // Default-expandera första gruppens första spelform EN gång per sortMode
  // (ett sort-byte re-defaultar; focus-reloads respekterar user:s toggling).
  const initedSortRef = useRef<SortMode | null>(null);

  // Re-load varje gång Profile får fokus så listan speglar senaste
  // append:en (Quiz → Final Leaderboard → Home → Profile).
  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadGameHistory().then((list) => {
        if (!active) return;
        // Sortera desc by date så leaf-ordningen blir nyast först oavsett
        // grupperings-läge.
        const sorted = [...list].sort((a, b) => b.date.localeCompare(a.date));
        setHistory(sorted);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const groups = useMemo(
    () =>
      groupHistory(history, sortMode, {
        getHostName: (e) => e.hostName,
        getDateISO: (e) => e.date,
        getGameForm: (e) => resolveGameForm(e.gameMode, e.singlePlayerDefault),
      }),
    [history, sortMode],
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
              inget sparat eller anonym session → renderar null. */}
          <SavedAggregatesCard />
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
              <>
                <SegmentedControl
                  options={SORT_OPTIONS}
                  value={sortMode}
                  onChange={(v) => setSortMode(v as SortMode)}
                />
                {/* Två-nivå-nästling: level 1 = månad/host, level 2 = spelform.
                    Inom spelform: spel-rader i samma flat-format som tidigare,
                    separerade av divider. */}
                <View style={styles.gameList}>
                  {groups.map((group) => {
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
                          const correctSum = form.items.reduce(
                            (sum, e) => sum + e.correctAnswers,
                            0,
                          );
                          const totalSum = form.items.reduce(
                            (sum, e) => sum + e.totalQuestions,
                            0,
                          );
                          const avgPct =
                            totalSum > 0
                              ? Math.round((correctSum / totalSum) * 100)
                              : 0;
                          return (
                            <CollapsibleGroup
                              key={formKey}
                              level={2}
                              label={form.formLabel}
                              summary={`${form.items.length} ${
                                form.items.length === 1 ? 'game' : 'games'
                              } · ${avgPct}% avg`}
                              open={expandedForms.has(formKey)}
                              onToggle={() =>
                                setExpandedForms((prev) =>
                                  toggleSetKey(prev, formKey),
                                )
                              }
                            >
                              {form.items.map((entry, i) => (
                                <React.Fragment key={entry.id}>
                                  <GameHistoryRow entry={entry} />
                                  {i < form.items.length - 1 && (
                                    <View style={styles.divider} />
                                  )}
                                </React.Fragment>
                              ))}
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
    </View>
  );
}

// Per-spel-rad: fyra-rad-layout.
// 1. Datum + korrekthet ("3/4 (75%)", highlighted i primary blå)
// 2. Game-time-settings: ålder, assistance-level, era-spann
// 3. Avg response time
// 4. Package + sources
// Settings-raderna visar inställningar som faktiskt användes vid speltill-
// fället (frozen i HistoryEntry) — viktigt för att tolka resultat över tid.
const ASSISTANCE_LABEL: Record<HistoryEntry['assistance'], string> = {
  full: 'Full',
  standard: 'Standard',
  minimal: 'Minimal',
};

function GameHistoryRow({ entry }: { entry: HistoryEntry }) {
  const pct =
    entry.totalQuestions > 0
      ? Math.round((entry.correctAnswers / entry.totalQuestions) * 100)
      : 0;
  // Paket-etikett: tom array → "Generic" (= bara basic-utbudet). När theme
  // packages aktiveras i v1.1+ visas paket-ID:n joined med kommatecken.
  // Defensive fallback för stale entries utan fältet.
  const packages =
    !entry.selectedExtraPackages || entry.selectedExtraPackages.length === 0
      ? 'Generic'
      : entry.selectedExtraPackages.join(', ');
  // Sources-etikett: källorna som FAKTISKT serverades i spelet, i appens
  // kanoniska ordning Spotify → YouTube → Hints. `entry.sources?.` skyddar
  // rader skrivna innan v5-resetet hunnit köra; "None" ska aldrig synas.
  const sourceKeys = PLAYED_MEDIA_SOURCE_ORDER.filter((s) => entry.sources?.includes(s));
  const sourcesLabel =
    sourceKeys.length === 0
      ? 'None'
      : sourceKeys.map((s) => PLAYED_MEDIA_SOURCE_LABEL[s]).join(' + ');
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
          Age {entry.age} · {ASSISTANCE_LABEL[entry.assistance]} · Era {entry.eraFrom}-{entry.eraTo}
        </Text>
      </View>
      <View style={styles.gameMetaRow}>
        <Text style={styles.gameMeta}>
          Avg response: {entry.avgResponseSeconds.toFixed(2)}s
        </Text>
      </View>
      <View style={styles.gameMetaRow}>
        <Text style={styles.gameMeta}>
          Package: {packages} · Sources: {sourcesLabel}
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

  gameList: { gap: Spacing.sm },
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

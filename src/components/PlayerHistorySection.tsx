import React, { useCallback, useMemo, useRef, useState } from 'react';
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

interface MonthGroup {
  /** YYYY-MM-key används som identifierare för expand-state. */
  key: string;
  /** "May 2026" — visas i månads-headern. */
  label: string;
  entries: HistoryEntry[];
}

function monthKeyForDate(iso: string): string {
  // YYYY-MM från ISO. Date-parsing skyddar mot ev. variation i format —
  // gameResults skriver ISO med dagsdel men header behöver bara år+månad.
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'unknown';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabelForKey(key: string): string {
  // 'YYYY-MM' → 'May 2026'. Använder Date(year, month-1, 1) så locale-
  // formatteraren får rätt månad oavsett timezone.
  const [y, m] = key.split('-').map(Number);
  if (!y || !m) return key;
  const d = new Date(y, m - 1, 1);
  return d.toLocaleString('en', { month: 'long', year: 'numeric' });
}

function groupByMonth(sortedEntries: HistoryEntry[]): MonthGroup[] {
  // Förutsätter att sortedEntries är sorted desc by date (senaste först),
  // så group-ordningen blir automatiskt rätt (senaste månad först).
  const groups: MonthGroup[] = [];
  for (const entry of sortedEntries) {
    const key = monthKeyForDate(entry.date);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.entries.push(entry);
    } else {
      groups.push({ key, label: monthLabelForKey(key), entries: [entry] });
    }
  }
  return groups;
}

export function PlayerHistorySection() {
  // Kollapsbart block — speglar Game connections-mönstret. Default
  // expanded så användaren ser sin senaste historik direkt vid besök.
  const [expanded, setExpanded] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  // Per-månads expand-state. Initial-defaulten (= senaste månaden expanded)
  // sätts en gång vid första load via didInitMonthExpansionRef-flaggan.
  // Subsequent re-focuses respekterar user:s explicita toggling.
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const didInitMonthExpansionRef = useRef(false);

  // Re-load varje gång Profile får fokus så listan speglar senaste
  // append:en (Quiz → Final Leaderboard → Home → Profile).
  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadGameHistory().then((list) => {
        if (!active) return;
        const sorted = [...list].sort((a, b) => b.date.localeCompare(a.date));
        setHistory(sorted);
        // Default-expand senaste månaden vid första load. Skyddas av ref
        // så user:s explicit toggle (inkl. collapse av senaste månaden)
        // inte över-skrivs av nästa focus-load.
        if (!didInitMonthExpansionRef.current && sorted.length > 0) {
          setExpandedMonths(new Set([monthKeyForDate(sorted[0].date)]));
          didInitMonthExpansionRef.current = true;
        }
      });
      return () => { active = false; };
    }, []),
  );

  const monthGroups = useMemo(() => groupByMonth(history), [history]);

  const toggleMonth = (key: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

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
              // Månads-grupperade rader med per-månads expand/collapse.
              // Senaste månaden default-expanderad; övriga collapsed tills
              // user tappar. Inom månad: spel-rader i samma flat-format
              // som tidigare (datum + score + meta), separerade av divider.
              <View style={styles.gameList}>
                {monthGroups.map((group) => {
                  const isOpen = expandedMonths.has(group.key);
                  const correctSum = group.entries.reduce(
                    (sum, e) => sum + e.correctAnswers,
                    0,
                  );
                  const totalSum = group.entries.reduce(
                    (sum, e) => sum + e.totalQuestions,
                    0,
                  );
                  const avgPct =
                    totalSum > 0 ? Math.round((correctSum / totalSum) * 100) : 0;
                  return (
                    <View key={group.key} style={styles.monthGroup}>
                      <Pressable
                        onPress={() => toggleMonth(group.key)}
                        style={({ pressed }) => [
                          styles.monthHeader,
                          pressed && { opacity: 0.7 },
                        ]}
                        hitSlop={6}
                      >
                        <Text style={styles.monthLabel}>{group.label}</Text>
                        <Text style={styles.monthSummary}>
                          {group.entries.length} {group.entries.length === 1 ? 'game' : 'games'} · {avgPct}% avg
                        </Text>
                        <View style={styles.monthToggleBox}>
                          <Text style={styles.monthToggleText}>
                            {isOpen ? '−' : '+'}
                          </Text>
                        </View>
                      </Pressable>
                      {isOpen && (
                        <View style={styles.monthEntries}>
                          {group.entries.map((entry, i) => (
                            <React.Fragment key={entry.id}>
                              <GameHistoryRow entry={entry} />
                              {i < group.entries.length - 1 && (
                                <View style={styles.divider} />
                              )}
                            </React.Fragment>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}

// Per-spel-rad: tre-rad-layout.
// 1. Datum + korrekthet ("3/4 (75%)", highlighted i primary blå)
// 2. Game-time-settings: ålder, assistance-level, era-spann
// 3. Avg response time
// Settings-raden visar inställningar som faktiskt användes vid speltill-
// fället (frozen i HistoryEntry) — viktigt för att tolka resultat över
// tid när profilens defaults kan ha ändrats.
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
  // packages aktiveras i v1.1+ visas paket-ID:n joined med kommatecken
  // (formatering kan bytas till human-readable labels när PURCHASED_PACKAGES
  // har items att slå upp mot). Defensive fallback för stale entries utan
  // fältet (kan hända om v4-reset inte hunnit köra på en testare:s device).
  const packages =
    !entry.selectedExtraPackages || entry.selectedExtraPackages.length === 0
      ? 'Generic'
      : entry.selectedExtraPackages.join(', ');
  // Sources-etikett: visar vilka mediekällor som var aktiva. Lobby:n
  // garanterar att minst en alltid är på, men defensive "None"-fallback
  // håller raden konsistent om data är skev.
  const sources: string[] = [];
  if (entry.youtubeEnabled) sources.push('YouTube');
  if (entry.imagesEnabled) sources.push('Images');
  const sourcesLabel = sources.length === 0 ? 'None' : sources.join(' + ');
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

  // Månads-grupp (collapsible sub-block inom card). Tunna styles —
  // gruppen ska kännas som en lättviktig list-divider, inte en egen
  // boxed sektion. monthHeader är tappable för toggle, monthEntries
  // renderas när expanded.
  monthGroup: {
    gap: Spacing.xs,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  monthLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  // Sammanfattning till höger om månads-labeln — visar antal spel +
  // avg-korrekthet så user får snabb översikt utan att behöva
  // expandera gruppen.
  monthSummary: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  monthToggleBox: {
    width: 22,
    height: 22,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthToggleText: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  // Inom månad: spel-rader stackade med samma divider-mönster som
  // tidigare flat-list. paddingTop ger luft mellan månads-header och
  // första spel-raden när expanded.
  monthEntries: {
    paddingTop: Spacing.sm,
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

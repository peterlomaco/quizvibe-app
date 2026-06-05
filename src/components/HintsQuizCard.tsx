// HintsQuizCard — split-view för Hints-frågor (ersätter bildvisning av verkliga personer).
//
// Vänster pane (mörk bakgrund):
//   • Profession-etikett uppe (visas från start)
//   • Lands-flagga (emoji, fylld container med guldram + vit innerram)
//   • ProgressiveCover mosaik-overlay på flaggan
//   • PersonName nere — avslöjas vid isRevealed=true
//
// Höger pane (kort med avrundade hörn):
//   • 3 numrerade ledtrådar med staggerad reveal
//   • Ledtråd 1 (Born + Place of Birth) vid 1/3 × 2/3 × T
//   • Ledtråd 2 (Main Profession) vid 2/3 × 2/3 × T
//   • Ledtråd 3 (Bibliography) vid 3/3 × 2/3 × T

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import type { HintBibEntry, PersonHints } from '../utils/hintsData';
import { countryToFlagEmoji } from '../utils/hintsData';
import { ProgressiveCover } from './ProgressiveCover';

type AssistanceLevel = 'minimal' | 'standard' | 'full';

// Alla 3 ledtrådar är synliga vid 2/3 av svarstiden.
const HINTS_ALL_OUT_FRACTION = 2 / 3;
const HINT_COUNT = 3;

interface Props {
  /** Profession-kategori (visas ovanför flaggan). 'Actor' | 'Artist' | 'Athlete' | 'Band' */
  profession: string;
  /** Hints-data. Optional — visas som placeholders om saknas (data hämtas via backend-script). */
  hints?: PersonHints;
  displayName: string;
  resetKey: string | number;
  totalSeconds: number;
  assistance: AssistanceLevel;
  playerBirthYear: number;
  /** true = reveal-fas: visa personens namn, snap ProgressiveCover färdig */
  isRevealed: boolean;
}

export function HintsQuizCard({
  profession,
  hints,
  displayName,
  resetKey,
  totalSeconds,
  assistance,
  playerBirthYear,
  isRevealed,
}: Props) {
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    setRevealedCount(0);

    if (isRevealed) {
      setRevealedCount(HINT_COUNT);
      return;
    }

    // Ledtråd i (1-indexerad) synlig vid i/3 × 2/3 × T
    const stepMs = (totalSeconds * HINTS_ALL_OUT_FRACTION * 1000) / HINT_COUNT;
    const timers = Array.from({ length: HINT_COUNT }, (_, i) =>
      setTimeout(() => setRevealedCount((c) => Math.max(c, i + 1)), stepMs * (i + 1)),
    );

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, totalSeconds, isRevealed]);

  const flag = hints ? countryToFlagEmoji(hints.nationality) : '🏳️';

  // Dela personnamnet vid sista mellanslag för "First Name / Last Name"-split
  const nameParts = splitDisplayName(displayName);

  return (
    <View style={styles.container}>
      {/* ── Vänster pane — flagga ─────────────────────────────────── */}
      <View style={styles.leftPane}>
        {/* Profession-etikett (från start) */}
        <Text style={styles.professionLabel} numberOfLines={1}>{profession}</Text>

        {/* Flagg-container: guldram → vit innerram → flagga + mosaik */}
        <View style={styles.flagOuter}>
          <View style={styles.flagInner}>
            {/* Flagga som stor emoji */}
            <Text style={styles.flagEmoji}>{flag}</Text>

            {/* Mosaik-overlay */}
            <ProgressiveCover
              resetKey={resetKey}
              profile={{ birthYear: playerBirthYear, assistance }}
              totalSeconds={totalSeconds}
              assistance={assistance}
            />
          </View>
        </View>

        {/* Personnamn (avslöjas vid reveal) */}
        <View style={styles.nameWrap}>
          {isRevealed ? (
            nameParts.map((part, i) => (
              <Text key={i} style={styles.nameText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                {part}
              </Text>
            ))
          ) : (
            <View style={styles.namePlaceholder} />
          )}
        </View>
      </View>

      {/* ── Höger pane — ledtråds-kort ───────────────────────────── */}
      <View style={styles.rightPane}>
        <View style={styles.hintsCard}>
          <HintRow
            index={1}
            revealed={revealedCount >= 1}
            label="Born"
            content={hints
              ? <HintBorn birthDate={hints.birthDate} birthCity={hints.birthCity} />
              : <Text style={styles.hintValueText}>—</Text>}
          />
          <View style={styles.hintDivider} />
          <HintRow
            index={2}
            revealed={revealedCount >= 2}
            label="Main Profession"
            content={<Text style={styles.hintValueText}>{hints?.mainProfession ?? '—'}</Text>}
          />
          <View style={styles.hintDivider} />
          <HintRow
            index={3}
            revealed={revealedCount >= 3}
            label="Bibliography"
            content={hints
              ? <HintBibliography entries={hints.bibliography} />
              : <Text style={styles.hintValueText}>—</Text>}
          />
        </View>
      </View>
    </View>
  );
}

// ── Hjälpkomponenter ────────────────────────────────────────────────────────

function HintRow({
  index,
  revealed,
  label,
  content,
}: {
  index: number;
  revealed: boolean;
  label: string;
  content: React.ReactNode;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: revealed ? 1 : 0,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [revealed, anim]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });

  return (
    <View style={styles.hintRow}>
      {/* Nummerbadge */}
      {revealed ? (
        <View style={styles.badgeFilled}>
          <Text style={styles.badgeFilledText}>{index}</Text>
        </View>
      ) : (
        <View style={styles.badgeEmpty}>
          <Text style={styles.badgeEmptyText}>{index}</Text>
        </View>
      )}

      {/* Innehåll — fade + slide-in */}
      <View style={styles.hintContentWrap}>
        {revealed ? (
          <Animated.View style={{ opacity: anim, transform: [{ translateY }] }}>
            <Text style={styles.hintLabelText}>{label}</Text>
            {content}
          </Animated.View>
        ) : (
          <Text style={styles.hintPending}>• • •</Text>
        )}
      </View>
    </View>
  );
}

function HintBorn({ birthDate, birthCity }: { birthDate?: string; birthCity?: string }) {
  return (
    <View>
      {birthDate ? (
        <View style={styles.hintLabelValueRow}>
          <Text style={styles.hintSubLabel}>Date of birth: </Text>
          <Text style={styles.hintValueText}>{birthDate}</Text>
        </View>
      ) : null}
      {birthCity ? (
        <View style={styles.hintLabelValueRow}>
          <Text style={styles.hintSubLabel}>Place of birth: </Text>
          <Text style={styles.hintValueText}>"{birthCity}"</Text>
        </View>
      ) : null}
    </View>
  );
}

function HintBibliography({ entries }: { entries: HintBibEntry[] }) {
  return (
    <View style={{ gap: 1 }}>
      {entries.map((e, i) => (
        <Text key={i} style={styles.hintValueText} numberOfLines={1}>
          {formatBibEntry(e)}
        </Text>
      ))}
    </View>
  );
}

function formatBibEntry(e: HintBibEntry): string {
  if (e.type === 'work') return `${e.title}  ·  ${e.year}`;
  if (e.type === 'club') return `${e.name}  ${e.from}–${e.to ?? ''}`;
  if (e.type === 'national') return `${e.caps} national caps`;
  return '';
}

function splitDisplayName(name: string): string[] {
  const lastSpace = name.lastIndexOf(' ');
  if (lastSpace === -1) return [name];
  return [name.slice(0, lastSpace), name.slice(lastSpace + 1)];
}

// ── Styles ──────────────────────────────────────────────────────────────────

const FLAG_GOLD = '#8B6914';
const FLAG_OUTER_PAD = 5;
const FLAG_INNER_PAD = 3;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 240,
  },

  // ── Vänster pane ──────────────────────────────────────────────────────────
  leftPane: {
    flex: 4,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  professionLabel: {
    color: Colors.warning,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  flagOuter: {
    flex: 1,
    width: '100%',
    backgroundColor: FLAG_GOLD,
    padding: FLAG_OUTER_PAD,
    borderRadius: 3,
  },
  flagInner: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: FLAG_INNER_PAD,
    overflow: 'hidden',
    borderRadius: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagEmoji: {
    fontSize: 72,
    textAlign: 'center',
    lineHeight: 80,
  },
  nameWrap: {
    width: '100%',
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
    gap: 0,
  },
  nameText: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    lineHeight: 22,
  },
  namePlaceholder: {
    height: 44,
  },

  // ── Höger pane ────────────────────────────────────────────────────────────
  rightPane: {
    flex: 6,
    backgroundColor: Colors.background,
    padding: Spacing.sm,
    justifyContent: 'center',
  },
  hintsCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    justifyContent: 'space-between',
  },
  hintDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: -Spacing.sm,
  },

  // Hint row
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    flex: 1,
    paddingVertical: 2,
  },
  hintContentWrap: {
    flex: 1,
    justifyContent: 'center',
  },

  // Badges
  badgeFilled: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  badgeFilledText: {
    color: Colors.background,
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  badgeEmpty: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  badgeEmptyText: {
    color: Colors.textDisabled,
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },

  // Hint text
  hintLabelText: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  hintSubLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  hintValueText: {
    color: Colors.textPrimary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    lineHeight: 16,
  },
  hintLabelValueRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
  },
  hintPending: {
    color: Colors.textDisabled,
    fontSize: FontSize.sm,
    letterSpacing: 1.5,
  },
});

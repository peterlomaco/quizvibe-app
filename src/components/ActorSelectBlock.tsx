// Svarsblock för film-frågor med actor-select-mekanik.
//
// Full assistance:    visar fullständiga namn direkt som valbara knappar.
// Standard (2-brev):  visar 2-bokstavs prefix-hint per rad; valda raden
//                     expanderas till fullnamn (inline final selection).
// Minimal (1-brev):   samma mönster som Standard men 1-bokstavs prefix.
//
// Reveal-vokabulär identisk med ImageAnswerBlock:
//   • question  → vald rad blå border (pending)
//   • awaiting  → vald rad gold border (confirmed, låst)
//   • reveal    → correct grön, spelarens fel röd, timeout alla röda

import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/src/components/haptic';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/theme';
import { createSeededRng } from '@/src/utils/seededRandom';

type Phase = 'intro' | 'countdown' | 'question' | 'awaiting' | 'reveal' | 'leaderboard';
type AssistanceLevel = 'full' | 'standard' | 'minimal';

const QUIZ_ERROR_RED = '#FF3B30';
const PREFIX_BTN_WIDTH = 72;

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Extraherar prefix ur första ordet i ett namn.
// "Tom Hanks" → "TO" (len=2) eller "T" (len=1).
function prefixOf(name: string, len: number): string {
  const firstWord = name.trim().split(/\s+/)[0];
  const letters = firstWord.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, '');
  return letters.slice(0, len).toUpperCase();
}

interface Props {
  correctNames: string[];
  distractorNames: string[];
  phase: Phase;
  pendingName: string | null;
  confirmedName: string | null;
  /** True om timer gick till 0 utan att spelaren bekräftade. */
  isTimedOut: boolean;
  onNameSelect(name: string | null): void;
  /** Reset:as när frågan byts — triggar ny shuffle. */
  resetKey: string | number;
  assistance: AssistanceLevel;
  /** Filmtitel — visas under rätt namn i reveal. */
  movieTitle?: string;
  /** Filmens releasår — visas bredvid filmtiteln i reveal. */
  movieYear?: number;
  /**
   * Deterministisk seed för svarsalternativen. Sätts i Remote 1v1
   * (`matchId:questionId`) så båda spelarna får samma namn i samma ordning —
   * de spelar frågan var för sig utan sync-kanal. Utelämnad → Math.random.
   */
  optionsSeed?: string;
}

export function ActorSelectBlock({
  correctNames,
  distractorNames,
  phase,
  pendingName,
  confirmedName,
  isTimedOut,
  onNameSelect,
  resetKey,
  assistance,
  movieTitle,
  movieYear,
  optionsSeed,
}: Props) {
  const nameList = useMemo(() => {
    const rng = optionsSeed ? createSeededRng(optionsSeed) : Math.random;
    // Alltid exakt 1 rätt svar — väljer slumpmässigt bland correctNames
    // om frågan har flera korrekta aktörer.
    const correctName = shuffle([...correctNames], rng)[0];
    if (!correctName) return [];
    const picked = shuffle([...distractorNames], rng).slice(0, 4);
    return shuffle([correctName, ...picked], rng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, optionsSeed]);

  const isRevealing = phase === 'reveal';
  const isLocked = phase === 'awaiting' || isRevealing;
  const isFullMode = assistance === 'full';
  // Prefix-längd: standard=2, minimal=1 (ignoreras i full-mode)
  const prefixLen = assistance === 'minimal' ? 1 : 2;

  return (
    <View style={styles.container}>
      {nameList.map((name) => {
        const isCorrectName = correctNames.includes(name);
        const isPlayerRow = confirmedName === name;
        const isCorrectRevealRow = isRevealing && isCorrectName;
        const wasPlayerCorrect = isPlayerRow && isCorrectName;
        const showWrongForPlayer = isPlayerRow && isLocked && !isCorrectName;
        const showWrongTimeout = isRevealing && isTimedOut && !isCorrectName;
        const isDimmed =
          isRevealing && !isPlayerRow && !isCorrectRevealRow && !isTimedOut;

        const isPending = !isLocked && pendingName === name;
        const isConfirmedRow = isLocked && confirmedName === name;
        const isSelected = isPending || isConfirmedRow;

        // Kantlinje-färg (delas av prefix-knapp och namnkort). Spelarens EGEN
        // låsta rad färgas grön/röd redan vid 'awaiting' så rätt/fel syns direkt
        // — facit-raderna (separat correct + time-out-röd) hålls till 'reveal'.
        let borderColor: string = Colors.border;
        if (isPending) borderColor = Colors.primary;
        else if (isConfirmedRow) borderColor = wasPlayerCorrect ? Colors.success : QUIZ_ERROR_RED;
        else if (isCorrectRevealRow) borderColor = Colors.success;
        else if (showWrongTimeout) borderColor = QUIZ_ERROR_RED;

        const textColor = isDimmed ? Colors.textDisabled : Colors.textPrimary;
        // Spelarens egen ✓ visas vid lås (awaiting); time-out-facitets ✓ på
        // rätta raden hålls kvar till reveal. showWrongBadge läser det nu
        // isLocked-gatade showWrongForPlayer + reveal-only showWrongTimeout.
        const showCorrectBadge =
          (isPlayerRow && wasPlayerCorrect && isLocked) ||
          (isRevealing && isCorrectRevealRow && isTimedOut);
        const showWrongBadge = showWrongForPlayer || showWrongTimeout;

        const onPress = () => {
          if (isLocked) return;
          onNameSelect(pendingName === name ? null : name);
        };

        // ── Full mode ──────────────────────────────────────────────────
        if (isFullMode) {
          const bg = isSelected || isCorrectRevealRow
            ? Colors.primaryMuted
            : Colors.cardElevated;
          const showMovieMeta = isCorrectRevealRow && movieTitle;
          return (
            <Pressable
              key={name}
              onPress={onPress}
              style={[styles.nameButton, { borderColor, backgroundColor: bg }]}
            >
              <View style={showMovieMeta ? styles.nameStack : undefined}>
                <Text style={[styles.nameText, { color: textColor }]} numberOfLines={1}>
                  {name}
                </Text>
                {showMovieMeta && (
                  <Text style={styles.movieMeta} numberOfLines={1}>
                    {movieTitle}{movieYear ? ` · ${movieYear}` : ''}
                  </Text>
                )}
              </View>
              {showCorrectBadge && (
                <View style={styles.correctBadge}>
                  <Text style={styles.correctBadgeText}>✓ Correct</Text>
                </View>
              )}
              {showWrongBadge && (
                <View style={styles.wrongBadge}>
                  <Text style={styles.wrongBadgeText}>✗</Text>
                </View>
              )}
            </Pressable>
          );
        }

        // ── Prefix mode (Standard / Minimal) ──────────────────────────
        // Namnkortet visas när raden är vald ELLER i reveal-fas.
        const showNameCard = isSelected || isRevealing;
        const prefix = prefixOf(name, prefixLen);
        const prefixColor = isDimmed ? Colors.textDisabled : Colors.primary;

        return (
          <Pressable key={name} onPress={onPress} style={styles.prefixRow}>
            {/* Prefix-knapp */}
            <View
              style={[
                styles.prefixButton,
                {
                  borderColor,
                  backgroundColor: isSelected ? Colors.primaryMuted : Colors.cardElevated,
                },
              ]}
            >
              <Text style={[styles.prefixText, { color: prefixColor }]}>{prefix}</Text>
            </View>

            {/* Namnkort — expanderas vid val/reveal */}
            {showNameCard && (
              <View
                style={[
                  styles.nameCard,
                  { borderColor, backgroundColor: Colors.primaryMuted },
                ]}
              >
                {isCorrectRevealRow && movieTitle ? (
                  <View style={styles.nameStack}>
                    <Text style={[styles.nameText, { color: textColor }]} numberOfLines={1}>
                      {name}
                    </Text>
                    <Text style={styles.movieMeta} numberOfLines={1}>
                      {movieTitle}{movieYear ? ` · ${movieYear}` : ''}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.nameText, { color: textColor }]} numberOfLines={1}>
                    {name}
                  </Text>
                )}
                {showCorrectBadge && (
                  <View style={styles.correctBadge}>
                    <Text style={styles.correctBadgeText}>✓ Correct</Text>
                  </View>
                )}
                {showWrongBadge && (
                  <View style={styles.wrongBadge}>
                    <Text style={styles.wrongBadgeText}>✗</Text>
                  </View>
                )}
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },

  // ── Full mode ────────────────────────────────────────────────────────
  nameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    position: 'relative',
    minHeight: 48,
  },

  // ── Prefix mode ──────────────────────────────────────────────────────
  prefixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: 48,
  },
  prefixButton: {
    width: PREFIX_BTN_WIDTH,
    minHeight: 48,
    borderWidth: 1.5,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefixText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.5,
  },
  nameCard: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1.5,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },

  // ── Delad ────────────────────────────────────────────────────────────
  nameText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    flex: 1,
  },
  nameStack: {
    flex: 1,
    flexDirection: 'column',
    gap: 2,
  },
  movieMeta: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 14,
  },
  correctBadge: {
    position: 'absolute',
    top: -8,
    right: Spacing.md,
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  correctBadgeText: {
    color: Colors.background,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  wrongBadge: {
    position: 'absolute',
    top: -8,
    right: Spacing.md,
    backgroundColor: QUIZ_ERROR_RED,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  wrongBadgeText: {
    color: '#fff',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
});

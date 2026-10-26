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
//   • reveal    → se reveal-matrisen vid borderColor nedan (rätt = guld/vit,
//                 fel = röd/blå, facit = grön/blå, time-out-fel = röd/grå)

import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
// Svarsalternativ (prefix + korta namn) + reveal-badges → capped mot Dynamic Type.
import { CappedText as Text } from './CappedText';
import { Pressable } from '@/src/components/haptic';
import { BrandUi, Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/theme';
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

  // Blink före val — samma affordance som Hints/Spotify Name
  // (ImageAnswerBlock). JS-driven med flit + key-ommontering när blinken
  // slutar, så en rad som väljs/låses mitt i en blink aldrig fastnar grå.
  const blinkAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.35, duration: 750, useNativeDriver: false }),
        Animated.timing(blinkAnim, { toValue: 1,    duration: 750, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [blinkAnim]);
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

        // Reveal-matris (Peter 2026-10-26) — gemensam för ALLA Name-svar
        // (Music, Film/TV, Hints), ingen kategori-skillnad. Spelarens EGEN låsta rad graderas redan vid 'awaiting';
        // facit-raderna (separat correct + time-out-röd) hålls till 'reveal'.
        //   • mitt rätta svar     → grön kant, vit text, grön "Correct Answer"
        //   • mitt fel svar       → röd kant,  vit text, röd "Wrong Answer"
        //   • rätta svaret (facit)→ grön kant, vit text, grön "Correct"
        //   • time-out, fel rader → grå kant,  grå text, röd ✗
        const isCorrectFacitRow = isCorrectRevealRow && !isPlayerRow;
        // Ovald rad: svagt blå kant (Colors.primaryBorder), samma som Hints.
        let borderColor: string = Colors.primaryBorder;
        if (isPending) borderColor = Colors.primary;
        else if (isConfirmedRow) borderColor = wasPlayerCorrect ? Colors.success : QUIZ_ERROR_RED;
        // Inget svar → facit får GULD kant (Peter 2026-10-26), annars läses
        // grön kant + grön badge som att spelaren svarat rätt.
        else if (isCorrectRevealRow) borderColor = confirmedName ? Colors.success : Colors.warning;
        else if (showWrongTimeout) borderColor = Colors.border;

        // Samma tema som Hints (ImageAnswerBlock): valt men EJ låst = blå
        // kant + blå text; först när svaret låsts blir texten vit.
        let textColor: string = Colors.textPrimary;
        if (isPending) textColor = Colors.primary;
        else if (isConfirmedRow || isCorrectFacitRow) textColor = Colors.textPrimary;
        else if (showWrongTimeout || isDimmed) textColor = Colors.textDisabled;
        // Rätt svar ALLTID vit text vid reveal (reveal-matris 2026-10-26).
        if (isRevealing && isCorrectName) textColor = Colors.textPrimary;
        const showCorrectBadge =
          (isPlayerRow && wasPlayerCorrect && isLocked) || isCorrectFacitRow;
        const showWrongPill = showWrongForPlayer;
        const showWrongIcon = showWrongTimeout;

        const onPress = () => {
          if (isLocked) return;
          onNameSelect(pendingName === name ? null : name);
        };
        const shouldBlink = !isPending && !isLocked && phase === 'question';

        // ── Full mode ──────────────────────────────────────────────────
        if (isFullMode) {
          const bg = isSelected || isCorrectRevealRow || showWrongTimeout
            ? BrandUi.selectedFill
            : Colors.cardElevated;
          const showMovieMeta = isCorrectRevealRow && movieTitle;
          return (
            <Pressable pressFeedback
              key={name}
              onPress={onPress}
              style={[styles.nameButton, { borderColor, backgroundColor: bg }]}
            >
              {/* Samma layout som före blink-ändringen (Peter 2026-10-26):
                  texten ligger direkt i en stil-lös vy — INGEN extra flex-
                  wrapper, som gjorde raderna lika låga som Hints före valet.
                  Den vyn ÄR blink-vyn, så bara texten blinkar (inte rutan). */}
              {showMovieMeta ? (
                <View style={styles.nameStack}>
                  <Text style={[styles.nameText, { color: textColor }]} numberOfLines={1}>
                    {name}
                  </Text>
                  <Text style={styles.movieMeta} numberOfLines={1}>
                    {movieTitle}{movieYear ? ` · ${movieYear}` : ''}
                  </Text>
                </View>
              ) : (
                <Animated.View
                  key={shouldBlink ? 'blink' : 'still'}
                  style={{ opacity: shouldBlink ? blinkAnim : 1 }}
                >
                  <Text style={[styles.nameText, { color: textColor }]} numberOfLines={1}>
                    {name}
                  </Text>
                </Animated.View>
              )}
              {showCorrectBadge && (
                <View style={styles.correctBadge}>
                  <Text style={styles.correctBadgeText}>{isPlayerRow ? '✓ Correct Answer' : '✓ Correct'}</Text>
                </View>
              )}
              {showWrongPill && (
                <View style={styles.wrongBadge}>
                  <Text style={styles.wrongBadgeText}>✗ Wrong Answer</Text>
                </View>
              )}
              {showWrongIcon && (
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
        // Prefix-texten följer namnkortets färg på graderade rader (mitt svar,
        // facit, time-out-fel) och valt-ej-låst (blå); ovalda = vit, dimmade = grå.
        const prefixColor =
          isPending || isConfirmedRow || isCorrectFacitRow || showWrongTimeout
            ? textColor
            : isDimmed ? Colors.textDisabled : Colors.textPrimary;

        return (
          <Pressable pressFeedback key={name} onPress={onPress} style={styles.prefixRow}>
            {/* Prefix-knapp — bara texten blinkar före val (samma som Hints) */}
            <View
              style={[
                styles.prefixButton,
                {
                  borderColor,
                  backgroundColor: isSelected ? BrandUi.selectedFill : Colors.cardElevated,
                },
              ]}
            >
              <Animated.View
                key={shouldBlink ? 'blink' : 'still'}
                style={{ opacity: shouldBlink ? blinkAnim : 1 }}
              >
                <Text style={[styles.prefixText, { color: prefixColor }]}>{prefix}</Text>
              </Animated.View>
            </View>

            {/* Namnkort — expanderas vid val/reveal */}
            {showNameCard && (
              <View
                style={[
                  styles.nameCard,
                  { borderColor, backgroundColor: BrandUi.selectedFill },
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
                    <Text style={styles.correctBadgeText}>{isPlayerRow ? '✓ Correct Answer' : '✓ Correct'}</Text>
                  </View>
                )}
                {showWrongPill && (
                  <View style={styles.wrongBadge}>
                    <Text style={styles.wrongBadgeText}>✗ Wrong Answer</Text>
                  </View>
                )}
                {showWrongIcon && (
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
    color: '#fff',
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

// Letter Grid + inline Final Selection-svar för bild-frågor i quiz.tsx.
//
// Layout: vertikal lista där varje rad = en prefix-knapp till vänster + (när
// raden är vald eller vid reveal) det fullständiga namn-alternativet till
// höger. Spelaren växlar mellan rader genom att tappa annan prefix-knapp.
//
// Fasbeteende:
//   • question  → alla prefix-knappar tappbara. Vald prefix får blå border
//     + namn-kort med blå border (pending).
//   • awaiting  → låst. Spelarens confirmed prefix får gold border + gold-
//     bordered namn-kort. Övriga prefix syns men är inaktiva.
//   • reveal    → låst. Spelarens namn-kort får Correct (grön) eller Wrong
//     (röd) badge i top-right. Om spelaren svarade fel ELLER tiden tog slut
//     utan svar, renderas ÄVEN rätta prefix:ens namn-kort utfällt med grön
//     border + Correct-badge så spelaren ser facit i samma vy.

import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Colors,
  FontSize,
  FontWeight,
  Radius,
  Spacing,
} from '@/src/theme';
import {
  ImageNameOption,
  ImagePrefixOption,
} from '@/src/utils/quizImageQuestions';

type Phase = 'intro' | 'countdown' | 'question' | 'awaiting' | 'reveal' | 'leaderboard';

// Lokal kopia av quiz.tsx:s QUIZ_ERROR_RED för Wrong-badgen — Apple iOS
// system-red (#FF3B30) ger urgency-kontrast mot Colors.error (soft coral
// #FF6B6B som används för icke-quiz röda element). Medvetet duplicerad
// konstant så ImageAnswerBlock inte behöver kräna in quiz-screen-state.
const QUIZ_ERROR_RED = '#FF3B30';

// Minimal subset av en image-fråga som ImageAnswerBlock behöver — tillåter
// både `ImageQuizQuestion` (auto-genererad från katalogen) och quiz.tsx:s
// interna `ImageQuestion`-shape.
interface ImageAnswerQuestion {
  letterGrid: ImagePrefixOption[];
  optionsByPrefix: Record<string, ImageNameOption[]>;
  /** Antal letters per ord — filtrerar bort prefix som blivit kortare än
   *  detta (t.ex. items med kort displayName efter non-letter-strippning). */
  prefixLength: number;
  /** Den korrekta prefixens nyckel — driver reveal-fasens green-Correct-
   *  expansion när spelaren svarade fel eller tiden tog slut. */
  correctPrefix: string;
}

interface Props {
  question: ImageAnswerQuestion;
  phase: Phase;
  pendingName: ImageNameOption | null;
  confirmedName: ImageNameOption | null;
  /** True när tiden gått ut utan Confirm (= phase=reveal + ingen confirmedName). */
  isTimedOut: boolean;
  /** Anropas vid prelim. namn-val. null = avmarkera (t.ex. vid prefix-byte). */
  onNameSelect(name: ImageNameOption | null): void;
  /** Reset:as när frågan byts (questionIndex i parent). */
  resetKey: string | number;
}

export function ImageAnswerBlock({
  question,
  phase,
  pendingName,
  confirmedName,
  isTimedOut,
  onNameSelect,
  resetKey,
}: Props) {
  const [selectedPrefix, setSelectedPrefix] = useState<string | null>(null);

  // Reset:a prefix-state vid fråge-byte. Annars hänger förra fråges prefix
  // kvar och visar fel namn-options.
  useEffect(() => {
    setSelectedPrefix(null);
  }, [resetKey]);

  // Letter Grid-bygge med tre filter (i ordning):
  //   1. Längd-filter: prefixens första ord måste ha ≥ variantens prefixLength.
  //      Skydd mot edge case där distractor-pool-namn med kort displayName ger
  //      kortare prefix än target.
  //   2. Word-count-filter: alla prefix-knappar måste matcha rätta svarets
  //      ord-count. Om rätt svar är "Astrid Lindgren" (2 ord, "AS LI") visas
  //      bara 2-ord-distractors — inte 1-ord items som "AV" (Avicii). Garanterar
  //      visuell konsistens.
  //   3. Dedupering: max EN prefix-knapp per begynnelsebokstav. Vid dubbletter
  //      prefererar vi rätt prefix; annars alfabetiskt först.
  //
  // Resultatet sorteras alfabetiskt så spelaren kan lokalisera prefix snabbt.
  const sortedGrid = useMemo(() => {
    const expectedLen = question.prefixLength;
    const correctOpt = question.letterGrid.find((p) => p.isCorrect);
    const correctWordCount = correctOpt
      ? correctOpt.prefix.split(' ').length
      : null;

    const validOptions = question.letterGrid.filter((opt) => {
      const words = opt.prefix.split(' ');
      if (words[0].length < expectedLen) return false;
      if (correctWordCount !== null && words.length !== correctWordCount) {
        return false;
      }
      return true;
    });

    const byFirstLetter: Record<string, ImagePrefixOption> = {};
    for (const opt of validOptions) {
      const firstLetter = opt.prefix.charAt(0);
      const existing = byFirstLetter[firstLetter];
      if (
        !existing ||
        (opt.isCorrect && !existing.isCorrect) ||
        (opt.isCorrect === existing.isCorrect &&
          opt.prefix.localeCompare(existing.prefix, 'sv') < 0)
      ) {
        byFirstLetter[firstLetter] = opt;
      }
    }
    return Object.values(byFirstLetter).sort((a, b) =>
      a.prefix.localeCompare(b.prefix, 'sv'),
    );
  }, [question]);

  // Plocka ETT namn per prefix:
  //   • För spelarens prefix: rätt namn om prefix matchar correctPrefix,
  //     annars alfabetiskt första distractor (= visualization av vad
  //     spelaren såg när de tappade prefix-knappen).
  //   • För correctPrefix vid reveal: alltid det rätta namnet (oavsett
  //     position i optionsByPrefix[correctPrefix]-arrayen).
  function pickNameForPrefix(prefix: string): ImageNameOption | null {
    const opts = question.optionsByPrefix[prefix] ?? [];
    if (opts.length === 0) return null;
    const correct = opts.find((o) => o.isCorrect);
    if (correct) return correct;
    return [...opts].sort((a, b) =>
      a.displayName.localeCompare(b.displayName, 'sv'),
    )[0];
  }

  function handlePrefixPress(prefix: string): void {
    // Locked vid awaiting/reveal/timeout — taps får ingen effekt.
    if (confirmedName || isTimedOut || phase !== 'question') return;
    setSelectedPrefix(prefix);
    // Sätt direkt det enda namnet som pending — det är hela "Final Selection".
    // Confirm-knappen i quiz.tsx blir då aktiv så snart en prefix-rad valts.
    const name = pickNameForPrefix(prefix);
    onNameSelect(name);
  }

  const isLocked = phase === 'awaiting' || phase === 'reveal';
  const isRevealing = phase === 'reveal';
  const wasPlayerCorrect = confirmedName?.isCorrect === true;

  // playerExpandedPrefix = den prefix-rad som ska expanderas med spelarens
  // valda namn-kort. Under question = pending-tap (selectedPrefix). Under
  // awaiting/reveal med bekräftelse = samma selectedPrefix (låst sen Confirm).
  // Vid time-out (reveal utan confirmedName) = null — ev. tappad-men-ej-
  // bekräftad prefix ska inte expanderas eftersom spelaren inte committade.
  let playerExpandedPrefix: string | null = null;
  if (phase === 'question') {
    playerExpandedPrefix = selectedPrefix;
  } else if (confirmedName) {
    playerExpandedPrefix = selectedPrefix;
  }

  // showSeparateCorrect = sant under reveal när spelaren INTE fick rätt
  // (= fel svar ELLER time-out) OCH correctPrefix-raden inte redan är
  // expanderad som player-row.
  const showSeparateCorrect =
    isRevealing &&
    (!confirmedName || !wasPlayerCorrect) &&
    question.correctPrefix !== playerExpandedPrefix;

  return (
    <View style={styles.card}>
      <Text style={styles.stepHeading}>Choose the matching prefix</Text>
      <Text style={styles.stepSubtitle}>
        Tap a prefix — the full name appears next to it
      </Text>
      <View style={styles.gridWrap}>
        {sortedGrid.map((opt) => {
          const isPlayerRow = opt.prefix === playerExpandedPrefix;
          const isCorrectRevealRow =
            showSeparateCorrect && opt.prefix === question.correctPrefix;

          // Vilket namn-kort ska renderas på denna rad?
          //   • Spelarens rad: spelarens valda namn (pickNameForPrefix:s
          //     deterministiska val matchar det som visades vid prefix-tap).
          //   • Correct-reveal-rad: alltid rätta namnet.
          //   • Annars: inget namn-kort.
          let nameOpt: ImageNameOption | null = null;
          if (isPlayerRow) {
            nameOpt = pickNameForPrefix(opt.prefix);
          } else if (isCorrectRevealRow) {
            nameOpt = pickNameForPrefix(opt.prefix);
          }

          // Border-styling-state per kort:
          //   • pending (question, player) → blå border
          //   • confirmed (awaiting/reveal, player) → gold border
          //   • correctReveal (reveal, separate correct) → grön border
          let nameCardStyle = styles.nameCardPending;
          let nameTextStyle = styles.nameTextPending;
          if (isPlayerRow && isLocked) {
            nameCardStyle = styles.nameCardConfirmed;
            nameTextStyle = styles.nameTextConfirmed;
          } else if (isCorrectRevealRow) {
            nameCardStyle = styles.nameCardCorrect;
            nameTextStyle = styles.nameTextCorrect;
          }

          // Badge-state — visas BARA i reveal-fas:
          //   • Spelaren rätt:  green "Correct"-badge på spelarens rad
          //   • Spelaren fel:   red "Wrong"-badge på spelarens rad +
          //                     green "Correct"-badge på rätta raden
          //   • Time-out:       green "Correct"-badge på rätta raden
          let badgeType: 'correct' | 'wrong' | null = null;
          if (isRevealing) {
            if (isPlayerRow && confirmedName) {
              badgeType = wasPlayerCorrect ? 'correct' : 'wrong';
            } else if (isCorrectRevealRow) {
              badgeType = 'correct';
            }
          }

          // Prefix-knapp-styling — selected-state följer playerExpandedPrefix
          // oavsett fas så spelarens val syns visuellt även när raden är låst.
          // Correct-reveal-raden får grön styling för visuell konsistens med
          // det gröna namn-kortet bredvid. Under reveal dimmas text på alla
          // rader som varken är spelarens val eller rätta svaret så fokus
          // ligger på de relevanta valen.
          const isPrefixSelected = isPlayerRow;
          const isPrefixCorrectReveal = isCorrectRevealRow;
          const isPrefixLocked = isLocked || isTimedOut;
          const isPrefixDimmed =
            isRevealing && !isPlayerRow && !isCorrectRevealRow;

          return (
            <View key={opt.prefix} style={styles.prefixRow}>
              <Pressable
                onPress={() => handlePrefixPress(opt.prefix)}
                disabled={isPrefixLocked}
                style={({ pressed }) => [
                  styles.prefixButton,
                  isPrefixSelected && !isLocked && styles.prefixButtonActive,
                  isPrefixSelected && isLocked && styles.prefixButtonLocked,
                  isPrefixCorrectReveal && styles.prefixButtonCorrectReveal,
                  pressed && styles.prefixButtonPressed,
                ]}
              >
                <Text
                  style={[
                    styles.prefixText,
                    isPrefixSelected && !isLocked && styles.prefixTextActive,
                    isPrefixSelected && isLocked && styles.prefixTextLocked,
                    isPrefixCorrectReveal && styles.prefixTextCorrectReveal,
                    isPrefixDimmed && styles.prefixTextDimmed,
                  ]}
                >
                  {opt.prefix}
                </Text>
              </Pressable>
              {nameOpt && (
                <View style={[styles.nameCard, nameCardStyle]}>
                  <Text style={[styles.nameText, nameTextStyle]}>
                    {nameOpt.displayName}
                  </Text>
                  {badgeType === 'correct' && (
                    <Text style={[styles.revealBadge, styles.revealBadgeCorrect]}>
                      Correct
                    </Text>
                  )}
                  {badgeType === 'wrong' && (
                    <Text style={[styles.revealBadge, styles.revealBadgeWrong]}>
                      Wrong
                    </Text>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
  },
  stepHeading: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  stepSubtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  gridWrap: {
    flexDirection: 'column',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  // Varje rad: prefix-knapp vänster (smal) + ev. namn-kort höger (fyller resten).
  // alignItems: 'stretch' håller prefix-knappen och namn-kortet på samma höjd.
  // Ingen minHeight — raden får växa naturligt från innehållets padding.
  prefixRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.sm,
  },
  prefixButton: {
    width: 96,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Question-phase selected — blå border (pending).
  prefixButtonActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  // Awaiting/reveal-phase selected — gold border, men behåller primaryMuted-bg
  // från Active så bakgrunden känns konsistent över faser. Bara kantlinjen
  // skiftar färg för att signalera confirmation-state.
  prefixButtonLocked: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.warning,
    borderWidth: 2,
  },
  // Reveal-phase correct answer (visad separat när spelaren svarade fel
  // eller tiden tog slut) — grön border, blå bg (samma logik som locked).
  prefixButtonCorrectReveal: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.success,
    borderWidth: 2,
  },
  prefixButtonPressed: {
    opacity: 0.85,
  },
  prefixText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    letterSpacing: 1,
  },
  // Vald prefix-knapp: text byter till blå primary för alla aktiva
  // tillstånd. Locked/correctReveal behåller samma blå text — bara
  // kantlinjen på rutan signalerar state (gold/green).
  prefixTextActive: {
    color: Colors.primary,
  },
  prefixTextLocked: {
    color: Colors.primary,
  },
  prefixTextCorrectReveal: {
    color: Colors.primary,
  },
  // Reveal — dimma text på irrelevanta prefix-knappar (alla utom spelarens
  // val + rätta svaret) så fokus ligger på de två relevanta raderna.
  prefixTextDimmed: {
    color: Colors.textDisabled,
  },
  // Name-card är `position: 'relative'` så badge:n (absolute top:-8 right:8)
  // kan skära kortets övre kantlinje. Får INTE vara `overflow: 'hidden'`.
  nameCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 2,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    position: 'relative',
  },
  // Alla tre name-card-tillstånd delar samma primaryMuted (blå) bakgrund —
  // bara kantlinjens färg signalerar state (blå pending → gold confirmed →
  // grön correct). Konsistent bg gör att svarsrutorna ser ut som "samma
  // ruta som under spelets gång" oavsett fas.
  nameCardPending: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  nameCardConfirmed: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.warning,
  },
  nameCardCorrect: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.success,
  },
  // Text-färgen är konstant blå över alla tillstånd — bara kantlinjen
  // signalerar state (per redesign-direktivet "bara kantlinje" 2026-05-21).
  // Style-slottar för per-state-färger kvarhållna som tomma overrides ifall
  // vi vill differentiera senare.
  nameText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    flex: 1,
    color: Colors.primary,
  },
  nameTextPending: {},
  nameTextConfirmed: {},
  nameTextCorrect: {},
  // Border-cutting badge — sitter på namn-kortets övre kantlinje (top: -8)
  // istället för inuti kortet. Solid bg matchar borderColor så taggen
  // visuellt "är en del av" ramen. Speglar HOST/GUEST-taggen på PlayerRow
  // + ✓/✗-badgen på quiz:s reveal-feedback-kort.
  revealBadge: {
    position: 'absolute',
    top: -10,
    right: Spacing.md,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    color: '#fff',
    letterSpacing: 0.5,
    overflow: 'hidden',
  },
  revealBadgeCorrect: {
    backgroundColor: Colors.success,
  },
  revealBadgeWrong: {
    backgroundColor: QUIZ_ERROR_RED,
  },
});

// Letter Grid + inline Final Selection-svar för bild-frågor i quiz.tsx.
//
// Layout: vertikal lista där varje rad = en prefix-knapp till vänster + (när
// raden är vald) det fullständiga namn-alternativet till höger. Spelaren
// växlar mellan rader genom att tappa annan prefix-knapp — namnet följer
// med till den nya raden. Confirm-knappen sitter i quiz.tsx:s action-wrap
// och låser det aktiva namn-valet.
//
// State i komponenten: bara `selectedPrefix` för att veta vilken rad som
// ska visa namnet. Pending/confirmed-namn-state ligger i quiz.tsx för
// paritet med musik-flödets pendingYear/selectedYear.

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

// Minimal subset av en image-fråga som ImageAnswerBlock behöver — tillåter
// både `ImageQuizQuestion` (auto-genererad från katalogen) och quiz.tsx:s
// interna `ImageQuestion`-shape.
interface ImageAnswerQuestion {
  letterGrid: ImagePrefixOption[];
  optionsByPrefix: Record<string, ImageNameOption[]>;
  /** Antal letters per ord — filtrerar bort prefix som blivit kortare än
   *  detta (t.ex. items med kort displayName efter non-letter-strippning). */
  prefixLength: number;
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

  // Plocka ETT namn per vald prefix (rätt namn om prefix matchar, annars
  // alfabetiskt första distractor).
  function pickNameForPrefix(prefix: string): ImageNameOption | null {
    const opts = question.optionsByPrefix[prefix] ?? [];
    if (opts.length === 0) return null;
    const correct = opts.find((o) => o.isCorrect);
    if (correct) return correct;
    return [...opts].sort((a, b) =>
      a.displayName.localeCompare(b.displayName, 'sv'),
    )[0];
  }

  const selectedNameOption = useMemo(
    () => (selectedPrefix ? pickNameForPrefix(selectedPrefix) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [question, selectedPrefix],
  );

  function handlePrefixPress(prefix: string): void {
    if (confirmedName || isTimedOut) return;
    setSelectedPrefix(prefix);
    // Sätt direkt det enda namnet som pending — det är hela "Final Selection".
    // Confirm-knappen i quiz.tsx blir då aktiv så snart en prefix-rad valts.
    const name = pickNameForPrefix(prefix);
    onNameSelect(name);
  }

  // I reveal-fasen renderas inte Letter Grid — quiz.tsx hanterar feedback-
  // kortet utanför komponenten via egen reveal-block.
  if (phase === 'reveal') return null;

  const locked = !!confirmedName || isTimedOut;

  return (
    <View style={styles.card}>
      <Text style={styles.stepHeading}>Choose the matching prefix</Text>
      <Text style={styles.stepSubtitle}>
        Tap a prefix — the full name appears next to it
      </Text>
      <View style={styles.gridWrap}>
        {sortedGrid.map((opt) => {
          const isSelected = selectedPrefix === opt.prefix;
          const nameOpt = isSelected ? selectedNameOption : null;
          const isPending = nameOpt && pendingName?.itemId === nameOpt.itemId;
          return (
            <View key={opt.prefix} style={styles.prefixRow}>
              <Pressable
                onPress={() => handlePrefixPress(opt.prefix)}
                disabled={locked}
                style={({ pressed }) => [
                  styles.prefixButton,
                  isSelected && styles.prefixButtonActive,
                  pressed && styles.prefixButtonPressed,
                ]}
              >
                <Text
                  style={[
                    styles.prefixText,
                    isSelected && styles.prefixTextActive,
                  ]}
                >
                  {opt.prefix}
                </Text>
              </Pressable>
              {isSelected && nameOpt && (
                <View
                  style={[
                    styles.nameCard,
                    isPending && styles.nameCardSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.nameText,
                      isPending && styles.nameTextSelected,
                    ]}
                  >
                    {nameOpt.displayName}
                  </Text>
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
  prefixButtonActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
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
  prefixTextActive: {
    color: Colors.primary,
  },
  nameCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  nameCardSelected: {
    // Samma som default — name-card är alltid "selected" när det visas
    // eftersom det binder till prefix-tappet. Bevarad style-slot för
    // framtida differentiering (t.ex. confirmed vs pending state).
  },
  nameText: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    flex: 1,
  },
  nameTextSelected: {
    color: Colors.primary,
  },
});

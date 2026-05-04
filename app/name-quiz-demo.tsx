/**
 * Skiss-demo för Namn-svarsmodellen.
 * Renderar 3 förgenererade frågor (Astrid Lindgren, Stockholm, Cristiano Ronaldo)
 * från src/utils/nameQuizDemo.ts. Inga timer/poäng/leaderboard — bara:
 *   bild → frågetext → Letter Grid → Final Selection → Confirm → ✓/✗-feedback → next.
 *
 * Spelar-profilen som genererade datan: Millennials (1990), intermediate skill.
 */
import { router, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressiveCover } from '@/src/components/ProgressiveCover';
import {
  Colors,
  FontSize,
  FontWeight,
  Radius,
  Spacing,
} from '@/src/theme';
import {
  DEMO_QUESTIONS,
  DemoNameOption,
  DemoQuestion,
} from '@/src/utils/nameQuizDemo';
import { RevealProfile } from '@/src/utils/revealCurve';

// Demon kör med samma profil som datan genererades för.
const DEMO_PROFILE: RevealProfile = {
  birthYear: 1990,
  skill: 'intermediate',
};
const DEMO_TOTAL_SECONDS = 30;

export default function NameQuizDemoScreen() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedPrefix, setSelectedPrefix] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState<DemoNameOption | null>(null);
  const [confirmedName, setConfirmedName] = useState<DemoNameOption | null>(null);

  const question: DemoQuestion = DEMO_QUESTIONS[questionIndex];
  const isLast = questionIndex === DEMO_QUESTIONS.length - 1;

  // Alfabetisk sortering — spelaren ska kunna lokalisera prefix snabbt.
  const sortedGrid = useMemo(
    () =>
      [...question.letterGrid].sort((a, b) =>
        a.prefix.localeCompare(b.prefix, 'sv'),
      ),
    [question],
  );

  const sortedNameOptions = useMemo(() => {
    if (!selectedPrefix) return [];
    const opts = question.optionsByPrefix[selectedPrefix] ?? [];
    return [...opts].sort((a, b) =>
      a.displayName.localeCompare(b.displayName, 'sv'),
    );
  }, [question, selectedPrefix]);

  function handlePrefixPress(prefix: string): void {
    setSelectedPrefix(prefix);
    setPendingName(null);
    setConfirmedName(null);
  }

  function handleBack(): void {
    setSelectedPrefix(null);
    setPendingName(null);
    setConfirmedName(null);
  }

  function handleNamePress(name: DemoNameOption): void {
    if (confirmedName) return;
    setPendingName(name);
  }

  function handleConfirm(): void {
    if (!pendingName) return;
    setConfirmedName(pendingName);
  }

  function handleNext(): void {
    if (isLast) {
      setQuestionIndex(0);
    } else {
      setQuestionIndex((i) => i + 1);
    }
    setSelectedPrefix(null);
    setPendingName(null);
    setConfirmedName(null);
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerBackBtn}>
            <Text style={styles.headerBackText}>← Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Name Quiz Demo</Text>
          <View style={styles.headerBackBtn} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Mediabild i 16:9-ram. Skarpa originalet hela tiden — mosaik-cover
              ovanpå försvinner block för block över DEMO_TOTAL_SECONDS. */}
          <View style={styles.mediaCard}>
            <Image
              key={questionIndex}
              source={{ uri: question.imageUrl }}
              style={styles.mediaImage}
              resizeMode="cover"
            />
            <ProgressiveCover
              key={questionIndex}
              resetKey={questionIndex}
              profile={DEMO_PROFILE}
              totalSeconds={DEMO_TOTAL_SECONDS}
              isRevealed={!!confirmedName}
              logoSize={320}
            />
          </View>

          {/* Frågemeta + frågetext */}
          <View style={styles.questionCard}>
            <Text style={styles.questionMeta}>
              Question {questionIndex + 1} of {DEMO_QUESTIONS.length}
            </Text>
            <Text style={styles.questionText}>{question.questionText}</Text>
          </View>

          {/* Steg 1: Letter Grid */}
          {!selectedPrefix && (
            <View style={styles.stepCard}>
              <Text style={styles.stepHeading}>1. Choose Starting Letters</Text>
              <Text style={styles.stepSubtitle}>
                Select the prefix that matches the answer
              </Text>
              <View style={styles.gridWrap}>
                {sortedGrid.map((opt) => (
                  <Pressable
                    key={opt.prefix}
                    onPress={() => handlePrefixPress(opt.prefix)}
                    style={({ pressed }) => [
                      styles.prefixButton,
                      pressed && styles.prefixButtonPressed,
                    ]}
                  >
                    <Text style={styles.prefixText}>{opt.prefix}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Steg 2: Final Selection (med Confirm-steg) */}
          {selectedPrefix && !confirmedName && (
            <View style={styles.stepCard}>
              <Text style={styles.stepHeading}>2. Pick the full name</Text>
              <View style={styles.selectedPrefixPill}>
                <Text style={styles.selectedPrefixPillText}>
                  Selected: {selectedPrefix}
                </Text>
              </View>
              <Pressable
                onPress={handleBack}
                style={({ pressed }) => [
                  styles.backRow,
                  pressed && styles.backRowPressed,
                ]}
              >
                <Text style={styles.backRowText}>← Back</Text>
              </Pressable>

              {sortedNameOptions.length === 0 && (
                <Text style={styles.emptyOptions}>
                  No matching names — wrong prefix.
                </Text>
              )}
              {sortedNameOptions.map((opt) => {
                const isPending = pendingName?.itemId === opt.itemId;
                return (
                  <Pressable
                    key={opt.itemId}
                    onPress={() => handleNamePress(opt)}
                    style={({ pressed }) => [
                      styles.nameButton,
                      isPending && styles.nameButtonSelected,
                      pressed && styles.nameButtonPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.nameButtonText,
                        isPending && styles.nameButtonTextSelected,
                      ]}
                    >
                      {opt.displayName}
                    </Text>
                    <Text style={styles.nameSourceText}>
                      {opt.source === 'pool' ? 'pool' : 'catalog'}
                    </Text>
                  </Pressable>
                );
              })}

              {/* Confirm-knapp visas när ett namn är preliminärt valt */}
              {pendingName && (
                <Pressable
                  onPress={handleConfirm}
                  style={({ pressed }) => [
                    styles.confirmButton,
                    pressed && styles.confirmButtonPressed,
                  ]}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Steg 3: Feedback (efter Confirm) */}
          {confirmedName && (
            <View
              style={[
                styles.feedbackCard,
                confirmedName.isCorrect
                  ? styles.feedbackCorrect
                  : styles.feedbackWrong,
              ]}
            >
              <Text
                style={[
                  styles.feedbackBadge,
                  confirmedName.isCorrect
                    ? styles.feedbackBadgeCorrect
                    : styles.feedbackBadgeWrong,
                ]}
              >
                {confirmedName.isCorrect ? '✓ Correct Answer' : '✗ Wrong Answer'}
              </Text>
              <Text style={styles.feedbackYouChose}>
                You chose: <Text style={styles.feedbackBold}>{confirmedName.displayName}</Text>
              </Text>
              {!confirmedName.isCorrect && (
                <Text style={styles.feedbackCorrectAnswer}>
                  Correct answer: <Text style={styles.feedbackBold}>{question.displayName}</Text>
                </Text>
              )}
              <Pressable
                onPress={handleNext}
                style={({ pressed }) => [
                  styles.nextButton,
                  pressed && styles.nextButtonPressed,
                ]}
              >
                <Text style={styles.nextButtonText}>
                  {isLast ? '↻ Restart' : 'Next question →'}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Attribution-rad */}
          <Text style={styles.attribution}>
            Photo: {question.attribution.artist ?? 'Unknown'} ·{' '}
            {question.attribution.license} · Wikimedia
          </Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerBackBtn: {
    minWidth: 60,
  },
  headerBackText: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  mediaCard: {
    aspectRatio: 16 / 9,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  questionCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  questionMeta: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
  },
  questionText: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  stepCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  prefixButton: {
    width: '18%',
    aspectRatio: 1,
    minWidth: 56,
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefixButtonPressed: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  prefixText: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    lineHeight: FontSize.lg,
    height: FontSize.lg,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    // iOS-specifik fix: bold-glyphen hänger mot baseline även med matchande
    // lineHeight. translateY är en ren render-shift (påverkar inte layout)
    // som skiftar glyphen ~2px uppåt så den blir visuellt centrerad.
    transform: [{ translateY: -2 }],
  },
  selectedPrefixPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  selectedPrefixPillText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
  },
  // "Back"-knappen ligger direkt under selected-prefix-pillen så det är
  // tydligt var spelaren backar tillbaka till Letter Grid.
  backRow: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.cardElevated,
  },
  backRowPressed: {
    backgroundColor: Colors.card,
  },
  backRowText: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  emptyOptions: {
    color: Colors.textSecondary,
    fontStyle: 'italic',
    fontSize: FontSize.sm,
    paddingVertical: Spacing.md,
  },
  nameButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  nameButtonSelected: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  nameButtonPressed: {
    opacity: 0.7,
  },
  nameButtonText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  nameButtonTextSelected: {
    color: Colors.primary,
  },
  nameSourceText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  confirmButtonPressed: {
    opacity: 0.85,
  },
  confirmButtonText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  feedbackCard: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 2,
    gap: Spacing.sm,
  },
  feedbackCorrect: {
    backgroundColor: Colors.successMuted,
    borderColor: Colors.success,
  },
  feedbackWrong: {
    backgroundColor: Colors.errorMuted,
    borderColor: Colors.error,
  },
  feedbackBadge: {
    alignSelf: 'flex-start',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  feedbackBadgeCorrect: {
    color: Colors.success,
    backgroundColor: 'rgba(82,200,122,0.18)',
  },
  feedbackBadgeWrong: {
    color: Colors.error,
    backgroundColor: 'rgba(255,107,107,0.18)',
  },
  feedbackYouChose: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
  },
  feedbackBold: {
    fontWeight: FontWeight.bold,
  },
  feedbackCorrectAnswer: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  nextButtonPressed: {
    opacity: 0.8,
  },
  nextButtonText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  attribution: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});

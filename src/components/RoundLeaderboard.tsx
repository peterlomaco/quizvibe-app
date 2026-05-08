import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import { QuizVibeQAvatar } from './QuizVibeQAvatar';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AssistanceLevel = 'minimal' | 'standard' | 'full';

export interface LeaderboardPlayer {
  id: string;
  name: string;
  emoji: string;
  assistance: AssistanceLevel;
  age: number;
  isYou?: boolean;
  isHost?: boolean;
}

export interface RoundScore {
  playerId: string;
  points: number;
  correct: boolean;
  timeUsed: number; // sekunder
}

export interface HcpChange {
  before: number;
  after: number;
}

// Startpunkter för mock-motspelarnas HCP (lägre = bättre).
// Används när HCP-förändring beräknas vid final leaderboard.
export const MOCK_OPPONENT_HCP_BEFORE: Record<string, number> = {
  sam:    25,  // minimal assistance / elit
  jordan: 55,  // standard assistance / mid
  casey:  85,  // full assistance / casual
};

// ─── Mock opponents (matchar Lobby-skärmdumpen) ───────────────────────────────
// "You" injiceras dynamiskt av quiz.tsx från profildata/URL-params.

export const MOCK_OPPONENTS: LeaderboardPlayer[] = [
  { id: 'sam',    name: 'Sam L.',    emoji: '🎸', assistance: 'minimal',  age: 28 },
  { id: 'jordan', name: 'Jordan M.', emoji: '🤖', assistance: 'standard', age: 20 },
  { id: 'casey',  name: 'Casey P.',  emoji: '🐉', assistance: 'full',     age: 41 },
];

// ─── Opponent score generator (mock AI) ───────────────────────────────────────
// Returnerar bara poäng+correct — timeUsed och playerId sätts av anroparen.
// Mer assistans = lägre accuracy + lägre poäng-range (casual-spelare).

export function generateOpponentRoundScore(assistance: AssistanceLevel): { points: number; correct: boolean } {
  const accuracy = { full: 0.45, standard: 0.65, minimal: 0.78 }[assistance];
  const correct = Math.random() < accuracy;
  if (!correct) {
    return { points: 0, correct: false };
  }
  const range = {
    full:     [400, 1400],
    standard: [800, 2200],
    minimal:  [1500, 2800],
  }[assistance];
  const points = Math.round(range[0] + Math.random() * (range[1] - range[0]));
  return { points, correct: true };
}

// Mock svarstid för en motspelare (5–25 sekunder).
export function generateOpponentTimeUsed(): number {
  return Math.round(5 + Math.random() * 20);
}

// ─── Main leaderboard component ───────────────────────────────────────────────

export function RoundLeaderboard({
  players,
  totalsByPlayerId,
  roundNumber,
  totalRounds,
  onNextRound,
  onPlayAgain,
  onGoHome,
  isLastRound,
  allRoundScoresHistory,
}: {
  players: LeaderboardPlayer[];
  /** Behållen för API-bakåtkompabilitet — tabellen aggregerar allt från
   *  allRoundScoresHistory så roundScores och hcpChanges används inte längre
   *  i renderingen. Lämnas i signaturen så call-sites slipper ändras. */
  roundScores: RoundScore[];
  totalsByPlayerId: Record<string, number>;
  roundNumber: number;
  totalRounds: number;
  onNextRound?: () => void;
  onPlayAgain?: () => void;
  onGoHome?: () => void;
  isLastRound: boolean;
  allRoundScoresHistory: RoundScore[][];
  hcpChanges?: Record<string, HcpChange>;
}) {
  // Aggregera per-spelare-statistik (samma struktur som GetReadyIntro:s
  // live-leaderboard så det är lätt att jämföra). Sortering: poäng desc →
  // avg response asc (ties brutna av snabbaste genomsnitt).
  const tableEntries = useMemo(() => {
    const entries = players.map((p) => {
      const playerScores = allRoundScoresHistory.flatMap((round) =>
        round.filter((s) => s.playerId === p.id),
      );
      const correctAnswers = playerScores.filter((s) => s.correct).length;
      const incorrectAnswers = playerScores.length - correctAnswers;
      const avgResponseSeconds =
        playerScores.length > 0
          ? playerScores.reduce((sum, s) => sum + s.timeUsed, 0) / playerScores.length
          : 0;
      const lastResponseSeconds =
        playerScores.length > 0
          ? playerScores[playerScores.length - 1].timeUsed
          : null;
      const lastFiveResults = playerScores.slice(-5).map((s) => s.correct);
      return {
        playerId: p.id,
        name: p.name,
        emoji: p.emoji,
        points: totalsByPlayerId[p.id] ?? 0,
        playedRounds: playerScores.length,
        correctAnswers,
        incorrectAnswers,
        avgResponseSeconds,
        lastResponseSeconds,
        lastFiveResults,
      };
    });
    return entries.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return a.avgResponseSeconds - b.avgResponseSeconds;
    });
  }, [players, allRoundScoresHistory, totalsByPlayerId]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>
          {isLastRound ? 'Final Leaderboard' : 'Leaderboard'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {isLastRound ? 'Final result' : `Round ${roundNumber} of ${totalRounds}`}
        </Text>
      </View>

      {/* Sport-tabell-layout — speglar GetReadyIntro:s leaderboard:
          fixed Player-kolumn vänster, scroll:bar middle med detail-stats,
          fixed PTS-kolumn höger. */}
      <View style={styles.lbTable}>
        {/* Vänster fixed kolumn: Position + Namn */}
        <View style={styles.lbLeftCol}>
          <View style={[styles.lbCell, styles.lbHeaderCell, styles.lbLeftCell]}>
            <Text style={styles.lbHeaderText}>Player</Text>
          </View>
          {tableEntries.map((entry, index) => (
            <View
              key={entry.playerId}
              style={[styles.lbCell, styles.lbLeftCell]}
            >
              <Text style={styles.lbPos}>{index + 1}</Text>
              <Text style={styles.lbName} numberOfLines={1}>
                {entry.emoji ? `${entry.emoji} ` : ''}
                {entry.name}
              </Text>
            </View>
          ))}
        </View>

        {/* Mitt scroll:bar kolumn — alla detail-celler */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.lbMidScroll}
        >
          <View>
            <View style={[styles.lbMidRow, styles.lbHeaderCell]}>
              <Text style={[styles.lbMidHeader, styles.lbColR]}>Q</Text>
              <Text style={[styles.lbMidHeader, styles.lbColCheck]}>✓</Text>
              <Text style={[styles.lbMidHeader, styles.lbColCheck]}>✗</Text>
              <Text style={[styles.lbMidHeader, styles.lbColTime]}>AVG</Text>
              <Text style={[styles.lbMidHeader, styles.lbColTime]}>LAST</Text>
              <Text style={[styles.lbMidHeader, styles.lbColLast5]}>Last 5</Text>
            </View>
            {tableEntries.map((entry) => (
              <View key={entry.playerId} style={styles.lbMidRow}>
                <Text style={[styles.lbMidCell, styles.lbColR]}>
                  {entry.playedRounds}
                </Text>
                <Text
                  style={[
                    styles.lbMidCell,
                    styles.lbColCheck,
                    styles.lbCorrectText,
                  ]}
                >
                  {entry.correctAnswers}
                </Text>
                <Text
                  style={[
                    styles.lbMidCell,
                    styles.lbColCheck,
                    styles.lbWrongText,
                  ]}
                >
                  {entry.incorrectAnswers}
                </Text>
                <Text style={[styles.lbMidCell, styles.lbColTime]}>
                  {entry.playedRounds > 0
                    ? `${entry.avgResponseSeconds.toFixed(2)}s`
                    : '—'}
                </Text>
                <Text style={[styles.lbMidCell, styles.lbColTime]}>
                  {entry.lastResponseSeconds !== null
                    ? `${entry.lastResponseSeconds.toFixed(2)}s`
                    : '—'}
                </Text>
                <View style={[styles.lbColLast5, styles.lbLast5Wrap]}>
                  {Array.from({ length: 5 }).map((_, i) => {
                    const offset = entry.lastFiveResults.length - 5 + i;
                    const result =
                      offset >= 0 ? entry.lastFiveResults[offset] : undefined;
                    if (result === undefined) {
                      return <View key={i} style={styles.lbDotEmpty} />;
                    }
                    return (
                      <View
                        key={i}
                        style={[
                          styles.lbDot,
                          result ? styles.lbDotCorrect : styles.lbDotWrong,
                        ]}
                      >
                        <Text style={styles.lbDotGlyph}>
                          {result ? '✓' : '✗'}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Höger fixed kolumn: PTS */}
        <View style={styles.lbRightCol}>
          <View style={[styles.lbCell, styles.lbHeaderCell, styles.lbRightCell]}>
            <Text style={styles.lbHeaderText}>PTS</Text>
          </View>
          {tableEntries.map((entry) => (
            <View
              key={entry.playerId}
              style={[styles.lbCell, styles.lbRightCell]}
            >
              <Text style={styles.lbPoints}>{entry.points}</Text>
            </View>
          ))}
        </View>
      </View>

      {isLastRound ? (
        <View style={styles.finalActions}>
          {/* Home-knapp = QuizVibe Q-logo (= samma brand-mark som
              TopUserBanner i Profile-skärmens övre vänstra hörn). */}
          <Pressable
            onPress={onGoHome}
            style={({ pressed }) => [styles.finalHomeBtn, pressed && { opacity: 0.7 }]}
          >
            <QuizVibeQAvatar size={28} />
            <Text style={styles.finalHomeBtnText}>Home</Text>
          </Pressable>
          {/* Play Again = golden bg + svart text för premium-känsla. */}
          <Pressable
            onPress={onPlayAgain}
            style={({ pressed }) => [styles.finalPlayAgainBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.finalPlayAgainText}>🔁 Play Again</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={onNextRound}
          style={({ pressed }) => [styles.nextBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.nextBtnText}>Next Round  →</Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },

  // ── Sport-tabell-layout (speglar GetReadyIntro:s leaderboard) ──────────
  lbTable: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  lbCell: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lbHeaderCell: {
    backgroundColor: Colors.cardElevated,
  },
  lbHeaderText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  lbLeftCol: {
    minWidth: 130,
    maxWidth: 180,
  },
  lbLeftCell: {
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
    gap: 6,
  },
  lbPos: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
    width: 16,
  },
  lbName: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  lbMidScroll: {
    flex: 1,
  },
  lbMidRow: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lbMidCell: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  lbMidHeader: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  lbColR: { width: 32 },
  lbColCheck: { width: 32 },
  lbColTime: { width: 60 },
  lbColLast5: { width: 96 },
  lbCorrectText: { color: Colors.success, fontWeight: FontWeight.semibold },
  lbWrongText: { color: Colors.error, fontWeight: FontWeight.semibold },
  lbLast5Wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    paddingHorizontal: 4,
  },
  lbDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lbDotCorrect: { backgroundColor: Colors.success },
  lbDotWrong: { backgroundColor: Colors.error },
  lbDotEmpty: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.border,
    opacity: 0.4,
  },
  lbDotGlyph: {
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 12,
  },
  lbRightCol: {
    minWidth: 56,
  },
  lbRightCell: {
    paddingHorizontal: Spacing.md,
    justifyContent: 'flex-end',
  },
  lbPoints: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },

  // ── Action-knappar ───────────────────────────────────────────────────
  nextBtn: {
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  nextBtnText: {
    fontSize: 17,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },

  finalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  // Home-knapp: Q-logo + "Home"-text, transparent bg + tunn border (matchar
  // Profile:s topbanner-stil där samma Q-avatar används som "Home"-länk).
  finalHomeBtn: {
    flex: 1,
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  finalHomeBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  // Play Again: gold bg + svart text — premium-CTA-vokabulär (samma som
  // Lobby:s Start Game-knapp). Skuggor + elevation lyfter knappen visuellt.
  finalPlayAgainBtn: {
    flex: 1,
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.warning,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  finalPlayAgainText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.background,
    letterSpacing: 0.3,
  },
});

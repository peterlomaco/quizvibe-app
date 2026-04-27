import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import { Avatar } from './Avatar';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SkillLevel = 'easy' | 'intermediate' | 'expert';

export interface LeaderboardPlayer {
  id: string;
  name: string;
  emoji: string;
  skill: SkillLevel;
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

// Aggregerad detalj per runda för en spelare (används i expanderat läge)
export interface RoundDetail {
  roundNumber: number;
  points: number;
  timeUsed: number;
  correct: boolean;
  rank: number; // rank i denna specifika runda (baserat på kumulativ total t.o.m. ronden)
}

// Startpunkter för mock-motspelarnas HCP (lägre = bättre).
// Används när HCP-förändring beräknas vid final leaderboard.
export const MOCK_OPPONENT_HCP_BEFORE: Record<string, number> = {
  sam:    25,  // expert/elite
  jordan: 55,  // intermediate/mid
  casey:  85,  // easy/casual
};

// ─── Mock opponents (matchar Lobby-skärmdumpen) ───────────────────────────────
// "You" injiceras dynamiskt av quiz.tsx från profildata/URL-params.

export const MOCK_OPPONENTS: LeaderboardPlayer[] = [
  { id: 'sam',    name: 'Sam L.',    emoji: '🎸', skill: 'expert',       age: 28 },
  { id: 'jordan', name: 'Jordan M.', emoji: '🤖', skill: 'intermediate', age: 20 },
  { id: 'casey',  name: 'Casey P.',  emoji: '🐉', skill: 'easy',         age: 41 },
];

// ─── Opponent score generator (mock AI) ───────────────────────────────────────
// Returnerar bara poäng+correct — timeUsed och playerId sätts av anroparen.

export function generateOpponentRoundScore(skill: SkillLevel): { points: number; correct: boolean } {
  const accuracy = { easy: 0.45, intermediate: 0.65, expert: 0.78 }[skill];
  const correct = Math.random() < accuracy;
  if (!correct) {
    return { points: 0, correct: false };
  }
  const range = {
    easy:         [400, 1400],
    intermediate: [800, 2200],
    expert:       [1500, 2800],
  }[skill];
  const points = Math.round(range[0] + Math.random() * (range[1] - range[0]));
  return { points, correct: true };
}

// Mock svarstid för en motspelare (5–25 sekunder).
export function generateOpponentTimeUsed(): number {
  return Math.round(5 + Math.random() * 20);
}

// ─── Skill label helper ───────────────────────────────────────────────────────

const SKILL_LABELS: Record<SkillLevel, string> = {
  easy:         'Easy',
  intermediate: 'Intermediate',
  expert:       'Advanced',
};

// ─── Player row (visual style matches Lobby PlayerRow) ────────────────────────

function getRankStyle(rank: number): { bg: string; text: string; border: string } {
  if (rank === 1) return { bg: '#F5A623', text: '#000',           border: '#F5A623' }; // gold
  if (rank === 2) return { bg: '#C8D0DE', text: '#0B1220',        border: '#C8D0DE' }; // silver
  if (rank === 3) return { bg: '#B87333', text: '#fff',           border: '#B87333' }; // bronze
  return           { bg: Colors.primary,  text: '#fff',           border: Colors.primary };
}

function PlayerLeaderboardRow({
  player,
  rank,
  roundScore,
  totalScore,
  hcpChange,
  roundDetails,
}: {
  player: LeaderboardPlayer;
  rank: number;
  roundScore: RoundScore | null;
  totalScore: number;
  hcpChange?: HcpChange;
  roundDetails?: RoundDetail[]; // ronder t.o.m. nuvarande (används i expand-läge)
}) {
  const rankStyle = getRankStyle(rank);
  const [expanded, setExpanded] = useState(false);

  const hcpDelta = hcpChange ? hcpChange.before - hcpChange.after : 0;
  const hasRoundDetails = !!roundDetails && roundDetails.length > 0;

  return (
    <View style={styles.cardWrapper}>
      {/* Rank-flik ovanför kortets vänstra kant */}
      <View style={[styles.rankTab, { backgroundColor: rankStyle.bg, borderColor: rankStyle.border }]}>
        <Text style={[styles.rankTabText, { color: rankStyle.text }]}>#{rank}</Text>
      </View>

      <Pressable
        onPress={() => hasRoundDetails && setExpanded((v) => !v)}
        style={({ pressed }) => [
          styles.card,
          player.isYou && styles.cardYou,
          pressed && hasRoundDetails && { opacity: 0.85 },
        ]}
      >
        {/* Top row: avatar | name + tags | expand-chevron */}
        <View style={styles.row}>
          <Avatar emoji={player.emoji} size={40} />

          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>{player.name}</Text>
              {player.isHost && (
                <View style={styles.hostTag}>
                  <Text style={styles.hostTagText}>HOST</Text>
                </View>
              )}
              {player.isYou && (
                <View style={styles.youTag}>
                  <Text style={styles.youTagText}>YOU</Text>
                </View>
              )}
            </View>

            {/* Round result replaces the "Ready" line */}
            {roundScore ? (
              <View style={styles.statusRow}>
                <Text
                  style={[
                    styles.resultIcon,
                    roundScore.correct ? styles.iconCorrect : styles.iconWrong,
                  ]}
                >
                  {roundScore.correct ? '✓' : '✗'}
                </Text>
                <Text
                  style={[
                    styles.resultText,
                    roundScore.correct ? styles.resultCorrect : styles.resultWrong,
                  ]}
                >
                  {roundScore.correct ? `+${roundScore.points.toLocaleString()}` : 'Missed'}
                </Text>
              </View>
            ) : (
              <View style={styles.statusRow}>
                <Text style={styles.resultText}>—</Text>
              </View>
            )}
          </View>

          {hasRoundDetails && (
            <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
          )}
        </View>

        {/* Bottom row: skill · age + total score */}
        <View style={styles.bottomRow}>
          <Text style={styles.meta}>
            {SKILL_LABELS[player.skill]} · Age {player.age}
          </Text>
          <View style={styles.totalPill}>
            <Text style={styles.totalPillText}>{totalScore.toLocaleString()} pts</Text>
          </View>
        </View>

        {/* HCP-rad (visas bara på final leaderboard) */}
        {hcpChange && (
          <View style={styles.hcpRow}>
            <Text style={styles.hcpLabel}>HCP</Text>
            <View style={styles.hcpValues}>
              <Text style={styles.hcpBefore}>{hcpChange.before}</Text>
              <Text style={styles.hcpArrow}>→</Text>
              <Text style={styles.hcpAfter}>{hcpChange.after}</Text>
              <View style={[
                styles.hcpDeltaBadge,
                hcpDelta > 0 ? styles.hcpDeltaImproved : styles.hcpDeltaFlat,
              ]}>
                <Text style={[
                  styles.hcpDeltaText,
                  hcpDelta > 0 ? styles.hcpDeltaTextImproved : styles.hcpDeltaTextFlat,
                ]}>
                  {hcpDelta > 0 ? `−${hcpDelta}` : hcpDelta < 0 ? `+${-hcpDelta}` : '±0'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Expanderat läge: rond-för-rond-tabell */}
        {expanded && hasRoundDetails && (
          <View style={styles.detailsSection}>
            <View style={styles.detailsHeader}>
              <Text style={[styles.detailsHeaderCell, { flex: 1 }]}>ROUND</Text>
              <Text style={[styles.detailsHeaderCell, { width: 48, textAlign: 'center' }]}>RANK</Text>
              <Text style={[styles.detailsHeaderCell, { width: 50, textAlign: 'center' }]}>TIME</Text>
              <Text style={[styles.detailsHeaderCell, { width: 64, textAlign: 'right' }]}>POINTS</Text>
            </View>
            {roundDetails!.map((d) => (
              <View key={d.roundNumber} style={styles.detailsRow}>
                <Text style={[styles.detailsCell, { flex: 1 }]}>#{d.roundNumber}</Text>
                <Text style={[styles.detailsCell, { width: 48, textAlign: 'center' }]}>#{d.rank}</Text>
                <Text style={[styles.detailsCell, { width: 50, textAlign: 'center' }]}>{d.timeUsed}s</Text>
                <Text
                  style={[
                    styles.detailsCell,
                    { width: 64, textAlign: 'right' },
                    d.correct ? styles.detailsPointsCorrect : styles.detailsPointsWrong,
                  ]}
                >
                  {d.correct ? `+${d.points}` : '0'}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Pressable>
    </View>
  );
}

// ─── Main leaderboard component ───────────────────────────────────────────────

export function RoundLeaderboard({
  players,
  roundScores,
  totalsByPlayerId,
  roundNumber,
  totalRounds,
  onNextRound,
  onPlayAgain,
  onGoHome,
  isLastRound,
  allRoundScoresHistory,
  hcpChanges,
}: {
  players: LeaderboardPlayer[];
  roundScores: RoundScore[];           // denna rundas poäng per spelare
  totalsByPlayerId: Record<string, number>;
  roundNumber: number;
  totalRounds: number;
  onNextRound?: () => void;            // används när INTE sista rundan
  onPlayAgain?: () => void;            // används när sista rundan
  onGoHome?: () => void;               // används när sista rundan
  isLastRound: boolean;
  allRoundScoresHistory: RoundScore[][]; // alla ronders poäng per spelare (historik)
  hcpChanges?: Record<string, HcpChange>; // endast på final leaderboard
}) {
  // Sort by total score descending
  const sorted = [...players].sort(
    (a, b) => (totalsByPlayerId[b.id] ?? 0) - (totalsByPlayerId[a.id] ?? 0),
  );

  // Beräkna rond-för-rond-detaljer per spelare (inkl. rank i varje runda).
  // Rank i runda N = position när alla spelares kumulativa total t.o.m. N sorteras.
  const roundDetailsByPlayer = useMemo(() => {
    const result: Record<string, RoundDetail[]> = {};
    players.forEach((p) => { result[p.id] = []; });

    // Kumulativa totaler per spelare, uppdateras per runda
    const cumulative: Record<string, number> = {};
    players.forEach((p) => { cumulative[p.id] = 0; });

    allRoundScoresHistory.forEach((roundScores, roundIdx) => {
      // 1) Lägg ihop denna rondas poäng i kumulativen
      roundScores.forEach((s) => {
        cumulative[s.playerId] = (cumulative[s.playerId] ?? 0) + s.points;
      });

      // 2) Sortera alla spelare efter kumulativ total → rank
      const sortedIds = Object.entries(cumulative)
        .sort((a, b) => b[1] - a[1])
        .map(([id]) => id);

      // 3) Lägg till en RoundDetail för varje spelare som har en score i denna runda
      roundScores.forEach((s) => {
        const rank = sortedIds.indexOf(s.playerId) + 1;
        result[s.playerId].push({
          roundNumber: roundIdx + 1,
          points: s.points,
          timeUsed: s.timeUsed,
          correct: s.correct,
          rank,
        });
      });
    });

    return result;
  }, [players, allRoundScoresHistory]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <Text style={styles.headerSubtitle}>
          {isLastRound ? 'Final result' : `Round ${roundNumber} of ${totalRounds}`}
        </Text>
      </View>

      <View style={styles.list}>
        {sorted.map((player, i) => {
          const roundScore = roundScores.find((s) => s.playerId === player.id) ?? null;
          const totalScore = totalsByPlayerId[player.id] ?? 0;
          return (
            <PlayerLeaderboardRow
              key={player.id}
              player={player}
              rank={i + 1}
              roundScore={roundScore}
              totalScore={totalScore}
              hcpChange={hcpChanges?.[player.id]}
              roundDetails={roundDetailsByPlayer[player.id]}
            />
          );
        })}
      </View>

      {isLastRound ? (
        <View style={styles.finalActions}>
          <Pressable
            onPress={onGoHome}
            style={({ pressed }) => [styles.finalSecondaryBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.finalSecondaryBtnText}>🏠 Home</Text>
          </Pressable>
          <Pressable
            onPress={onPlayAgain}
            style={({ pressed }) => [styles.finalPrimaryBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.finalPrimaryBtnText}>🔁 Play Again</Text>
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

  list: { gap: Spacing.md + 4 }, // lite extra gap så rank-flikar inte kolliderar

  // Wrapper så rank-fliken kan sticka upp ovanför kortet
  cardWrapper: {
    position: 'relative',
    paddingTop: 14, // plats för fliken att sticka upp
  },

  // Rank-flik (top-left, ovanför kortets övre kant)
  rankTab: {
    position: 'absolute',
    top: 0,
    left: Spacing.md,
    minWidth: 44,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 2,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    zIndex: 2,
  },
  rankTabText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'],
  },

  // Card (same visual style as Lobby PlayerRow)
  card: {
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardYou: {
    borderColor: Colors.primaryBorder,
    backgroundColor: Colors.primaryMuted,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  info: { flex: 1, minWidth: 0 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 3,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  hostTag: {
    backgroundColor: '#F5A623',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  hostTagText: {
    fontSize: 9,
    fontWeight: FontWeight.semibold,
    color: '#000',
    letterSpacing: 0.5,
  },
  youTag: {
    backgroundColor: Colors.primary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  youTagText: {
    fontSize: 9,
    fontWeight: FontWeight.semibold,
    color: '#000',
    letterSpacing: 0.5,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  resultIcon: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  iconCorrect: { color: Colors.success },
  iconWrong:   { color: Colors.error },
  resultText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    fontVariant: ['tabular-nums'],
  },
  resultCorrect: { color: Colors.success },
  resultWrong:   { color: Colors.textDisabled },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  meta: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  totalPill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    backgroundColor: Colors.primaryMuted,
  },
  totalPillText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
  },

  // Expand-chevron på kortets översta rad
  chevron: {
    fontSize: 12,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.xs,
  },

  // HCP-rad (visas bara på final leaderboard)
  hcpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
  },
  hcpLabel: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  hcpValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  hcpBefore: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  hcpArrow: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  hcpAfter: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  hcpDeltaBadge: {
    marginLeft: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  hcpDeltaImproved: {
    backgroundColor: Colors.successMuted,
    borderColor: Colors.successBorder,
  },
  hcpDeltaFlat: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primaryBorder,
  },
  hcpDeltaText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    fontVariant: ['tabular-nums'],
  },
  hcpDeltaTextImproved: { color: Colors.success },
  hcpDeltaTextFlat:     { color: Colors.primary },

  // Expanded details section (rond-för-rond-tabell)
  detailsSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
    paddingTop: Spacing.sm,
    gap: 2,
  },
  detailsHeader: {
    flexDirection: 'row',
    paddingVertical: Spacing.xs,
  },
  detailsHeaderCell: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.6,
  },
  detailsRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  detailsCell: {
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
    fontWeight: FontWeight.medium,
  },
  detailsPointsCorrect: { color: Colors.success, fontWeight: FontWeight.semibold },
  detailsPointsWrong:   { color: Colors.textDisabled },

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

  // Sista rundans actions (Play Again + Home)
  finalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  finalPrimaryBtn: {
    flex: 1,
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finalPrimaryBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#fff',
    letterSpacing: 0.3,
  },
  finalSecondaryBtn: {
    flex: 1,
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  finalSecondaryBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
});

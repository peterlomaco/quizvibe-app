import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import { QuizVibeQAvatar } from './QuizVibeQAvatar';

/**
 * Liten SVG-pil som placeras längs Play Again-knappens kant. Många små
 * pilar i klockvis flöde runt hela perimetern signalerar "play again /
 * restart" via en visuell rotations-loop kring knappen.
 *
 * Bas-arrow:n är ritad pekande HÖGER i viewBoxen; rotation:en roteras
 * för andra riktningar via parent-View:s transform.
 */
const PLAY_AGAIN_ARROW_W = 14;
const PLAY_AGAIN_ARROW_H = 10;
// Knappens långsida (top/bottom) får 3 pilar; kortsidan (left/right) får 1
// pil — proportionellt mot sidans längd så den visuella tätheten håller sig
// jämn runt hela perimetern.
const PLAY_AGAIN_ARROWS_LONG = 3;
const PLAY_AGAIN_ARROWS_SHORT = 1;

function PlayAgainEdgeArrow({ rotation }: { rotation: 0 | 90 | 180 | 270 }) {
  return (
    <View style={{ transform: [{ rotate: `${rotation}deg` }] }}>
      <Svg width={PLAY_AGAIN_ARROW_W} height={PLAY_AGAIN_ARROW_H} viewBox="0 0 14 10">
        <Path
          d="M 0 4 L 8 4 L 8 1 L 14 5 L 8 9 L 8 6 L 0 6 Z"
          fill={Colors.textSecondary}
        />
      </Svg>
    </View>
  );
}

// Jämnt fördelade procent-positioner längs en sida — N pilar mellan
// 1/(N+1) och N/(N+1) av sidans längd. Cast till DimensionValue-template
// (`${number}%`) så RN:s ViewStyle-typer accepterar dem som left/top.
type PercentValue = `${number}%`;
function buildArrowOffsets(count: number): PercentValue[] {
  return Array.from(
    { length: count },
    (_, i) => `${((100 / (count + 1)) * (i + 1)).toFixed(2)}%` as PercentValue,
  );
}
const PLAY_AGAIN_LONG_OFFSETS = buildArrowOffsets(PLAY_AGAIN_ARROWS_LONG);
const PLAY_AGAIN_SHORT_OFFSETS = buildArrowOffsets(PLAY_AGAIN_ARROWS_SHORT);

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
  /** Spelaren har lämnat spelet via Leave Game (non-host i Individual
   *  Devices). Mid-row-stats ersätts av "Has left the game"-text och
   *  PTS-kolumnen visar streck. */
  hasLeft?: boolean;
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

// Mock svarstid för en motspelare (5–25 sekunder, 2-decimals-precision så
// AVG/LAST-kolumnen i leaderboarden visar variation istället för "x.00").
export function generateOpponentTimeUsed(): number {
  return Math.round((5 + Math.random() * 20) * 100) / 100;
}

const ASSISTANCE_LABEL: Record<AssistanceLevel, string> = {
  minimal: 'Minimal',
  standard: 'Standard',
  full: 'Full',
};

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
        age: p.age,
        assistance: p.assistance,
        points: totalsByPlayerId[p.id] ?? 0,
        playedRounds: playerScores.length,
        correctAnswers,
        incorrectAnswers,
        avgResponseSeconds,
        lastResponseSeconds,
        lastFiveResults,
        hasLeft: !!p.hasLeft,
      };
    });
    return entries.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return a.avgResponseSeconds - b.avgResponseSeconds;
    });
  }, [players, allRoundScoresHistory, totalsByPlayerId]);

  return (
    <View style={styles.outer}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>
            {isLastRound ? 'Final Leaderboard' : 'Leaderboard'}
          </Text>
          {/* Round X of Y-undertitel renderas bara vid icke-sista ronder.
              Final-vyn döljer den helt så bara huvudrubriken syns längst upp. */}
          {!isLastRound && (
            <Text style={styles.headerSubtitle}>
              Round {roundNumber} of {totalRounds}
            </Text>
          )}
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
          {tableEntries.map((entry, index) => {
            const meta = [
              entry.assistance ? ASSISTANCE_LABEL[entry.assistance] : null,
              typeof entry.age === 'number' ? `Age ${entry.age}` : null,
            ].filter(Boolean).join(' · ');
            return (
              <View
                key={entry.playerId}
                style={[styles.lbCell, styles.lbLeftCell]}
              >
                <Text style={styles.lbPos}>{index + 1}</Text>
                <View style={styles.lbNameStack}>
                  <Text style={styles.lbName} numberOfLines={1}>
                    {entry.emoji ? `${entry.emoji} ` : ''}
                    {entry.name}
                  </Text>
                  {meta.length > 0 && (
                    <Text style={styles.lbNameMeta} numberOfLines={1}>
                      {meta}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
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
            {tableEntries.map((entry) =>
              entry.hasLeft ? (
                <View
                  key={entry.playerId}
                  style={[styles.lbMidRow, styles.lbHasLeftRow]}
                >
                  <Text style={styles.lbHasLeftText} numberOfLines={1}>
                    Has left the game
                  </Text>
                </View>
              ) : (
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
              ),
            )}
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
              <Text style={styles.lbPoints}>
                {entry.hasLeft ? '—' : entry.points}
              </Text>
            </View>
          ))}
        </View>
      </View>
      </ScrollView>

      {/* Sticky footer-rad — flex-baserad pinning vid skärmens nederkant så
          knapparna alltid syns även när tabellen scrollar. justifyContent:
          'flex-end' höger-ställer Home + Play Again i ändan av raden. */}
      <View style={styles.stickyFooter}>
      {isLastRound ? (
        <View style={styles.finalActions}>
          {/* Home-knapp = QuizVibe Q-logo + "Home"-text i column-stack —
              speglar TopUserBanner:s "Home"-länk i Profile-skärmens övre
              vänstra hörn (samma Q-mark, samma stack-layout, samma textstil). */}
          <Pressable
            onPress={onGoHome}
            style={({ pressed }) => [styles.finalHomeBtn, pressed && { opacity: 0.7 }]}
          >
            <QuizVibeQAvatar size={32} />
            <Text style={styles.finalHomeBtnText}>Home</Text>
          </Pressable>
          {/* Play Again — knappen omgärdad av små pilar i klockvis flöde
              (3 per långsida, 1 per kortsida = 8 totalt: top→ / right↓ /
              bottom← / left↑) som visuellt signalerar "play again / restart"
              via en rotations-loop kring hela perimetern. Pilarna är absolut-
              positionerade med center på border-linjen så de "skär igenom"
              ramen. */}
          <Pressable
            onPress={onPlayAgain}
            style={({ pressed }) => [styles.finalPlayAgainBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.finalPlayAgainText}>Play Again</Text>
            {PLAY_AGAIN_LONG_OFFSETS.map((pct, i) => (
              <View
                key={`top-${i}`}
                style={[
                  styles.playAgainEdgeArrow,
                  {
                    top: -PLAY_AGAIN_ARROW_H / 2,
                    left: pct,
                    marginLeft: -PLAY_AGAIN_ARROW_W / 2,
                  },
                ]}
                pointerEvents="none"
              >
                <PlayAgainEdgeArrow rotation={0} />
              </View>
            ))}
            {PLAY_AGAIN_SHORT_OFFSETS.map((pct, i) => (
              <View
                key={`right-${i}`}
                style={[
                  styles.playAgainEdgeArrow,
                  {
                    right: -PLAY_AGAIN_ARROW_W / 2,
                    top: pct,
                    marginTop: -PLAY_AGAIN_ARROW_H / 2,
                  },
                ]}
                pointerEvents="none"
              >
                <PlayAgainEdgeArrow rotation={90} />
              </View>
            ))}
            {PLAY_AGAIN_LONG_OFFSETS.map((pct, i) => (
              <View
                key={`bottom-${i}`}
                style={[
                  styles.playAgainEdgeArrow,
                  {
                    bottom: -PLAY_AGAIN_ARROW_H / 2,
                    left: pct,
                    marginLeft: -PLAY_AGAIN_ARROW_W / 2,
                  },
                ]}
                pointerEvents="none"
              >
                <PlayAgainEdgeArrow rotation={180} />
              </View>
            ))}
            {PLAY_AGAIN_SHORT_OFFSETS.map((pct, i) => (
              <View
                key={`left-${i}`}
                style={[
                  styles.playAgainEdgeArrow,
                  {
                    left: -PLAY_AGAIN_ARROW_W / 2,
                    top: pct,
                    marginTop: -PLAY_AGAIN_ARROW_H / 2,
                  },
                ]}
                pointerEvents="none"
              >
                <PlayAgainEdgeArrow rotation={270} />
              </View>
            ))}
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
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Outer container — flex column som fyller hela SafeAreaView. Scroll:n tar
  // tillgängligt utrymme; sticky footer pinnas naturligt vid bottom via
  // flex-layout (ingen absolute-positioning behövs).
  outer: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  // Sticky footer — naturligt placerad efter ScrollView i flex-layouten.
  // borderTop ger visuell separation från scrollande tabell-content.
  stickyFooter: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  // Matchar Lobby:s screenTitle (24 / 700) så Final Leaderboard-rubriken
  // läser i samma vikt och hierarki som "Game Lobby" i lobby-vyn.
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
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
    height: 56,
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
  // Bredare än tidigare (180 → 220) så meta-raden ("Standard · Age 32") får
  // plats på en rad utan att truncatas till bara "Age...". Tar utrymme från
  // mid-scroll-kolumnen som redan scrollar horisontellt vid behov.
  lbLeftCol: {
    minWidth: 170,
    maxWidth: 220,
  },
  lbLeftCell: {
    paddingLeft: Spacing.sm,
    paddingRight: 4,
    gap: 4,
  },
  lbPos: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
    width: 16,
  },
  // Stack:ar namn ovanpå meta-rad (assistance + ålder) under sig så namnet
  // står i top-anchored position mens metadata sitter i textSecondary under.
  lbNameStack: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
  },
  lbName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  lbNameMeta: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    letterSpacing: 0,
  },
  lbMidScroll: {
    flex: 1,
  },
  lbMidRow: {
    height: 56,
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
  // "Has left the game"-rad ersätter Q/✓/✗/AVG/LAST/Last-5 för spelare som
  // gjort Leave Game. Spänner mid-row-bredden istället för att fördela
  // cellerna; PTS-kolumnen visar streck i samma rad.
  lbHasLeftRow: {
    paddingHorizontal: Spacing.sm,
    justifyContent: 'flex-start',
  },
  lbHasLeftText: {
    fontSize: FontSize.sm,
    fontStyle: 'italic',
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
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

  // Action-row i sticky footer — Home (flex:1) på vänster halva, Play Again
  // (flex:1) på höger halva med Spacing.sm gap mellan. Knapparna stretchar
  // över hela bredden så footer:n känns full istället för att lämna tomrum
  // i mitten.
  finalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  // Home-knapp: Q-logo VÄNSTER om "Home"-text på samma rad. Bg matchar
  // leaderboard-tabellens dataradsbg (Colors.card) så knappen visuellt knyter
  // an till leaderboardens nedre del.
  finalHomeBtn: {
    flex: 1,
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
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
  // Play Again — gul rundad rektangel med tjock blå border. Pilar
  // (PlayAgainEdgeArrow) absolut-positioneras runt border:n för
  // rotations-loop-effekt. Shadow + elevation matchar tidigare premium-känsla.
  // overflow: 'visible' så pilarnas spetsar som sticker ut utanför border:n
  // inte klipps.
  finalPlayAgainBtn: {
    flex: 1,
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  finalPlayAgainText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  // Bas-stil för pilar runt Play Again-knappens kant — top/left/bottom/right
  // + marginLeft/marginTop sätts inline per pil för att jämnt fördela 4 st
  // per sida (PLAY_AGAIN_ARROW_OFFSETS).
  playAgainEdgeArrow: {
    position: 'absolute',
  },
});

import {
    generateOpponentRoundScore,
    generateOpponentTimeUsed,
    MOCK_OPPONENT_HCP_BEFORE,
    MOCK_OPPONENTS,
    RoundLeaderboard,
    type HcpChange,
    type LeaderboardPlayer,
    type RoundScore,
} from '@/src/components/RoundLeaderboard';
import type { LobbyPlayer } from '@/src/screens/LobbyScreen';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/theme';
import { track } from '@/src/utils/analytics';
import { saveLatestResult, type GameResult, type RoundResult } from '@/src/utils/gameResults';
import { clearPendingLobbyPlayers, savePendingLobbyPlayers } from '@/src/utils/pendingLobby';
import { clearLeftPlayers } from '@/src/utils/leftPlayers';
import { registerActiveRoom } from '@/src/utils/mockActiveRooms';
import { generateRoomCode } from '@/src/utils/roomCode';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

type SkillLevel = 'easy' | 'intermediate' | 'expert';

interface TimelineQuestion {
  type: 'timeline';
  id: string;
  questionNumber: number;
  totalQuestions: number;
  category: string;
  question: string;
  correctYear: number;
  hint: string;
}

const SEED_QUESTIONS: TimelineQuestion[] = [
  { type: 'timeline', id: '1', questionNumber: 1, totalQuestions: 5, category: 'Music', question: 'When was "Bohemian Rhapsody" by Queen released?', correctYear: 1975, hint: 'Classic rock era' },
  { type: 'timeline', id: '2', questionNumber: 2, totalQuestions: 5, category: 'Music', question: 'When did ABBA release "Dancing Queen"?', correctYear: 1976, hint: 'Disco era' },
  { type: 'timeline', id: '3', questionNumber: 3, totalQuestions: 5, category: 'Music', question: 'When was "Smells Like Teen Spirit" by Nirvana released?', correctYear: 1991, hint: 'Grunge era' },
  { type: 'timeline', id: '4', questionNumber: 4, totalQuestions: 5, category: 'Music', question: 'When did Adele release "Rolling in the Deep"?', correctYear: 2010, hint: 'Modern era' },
  { type: 'timeline', id: '5', questionNumber: 5, totalQuestions: 5, category: 'Music', question: 'When was "Shape of You" by Ed Sheeran released?', correctYear: 2017, hint: 'Recent era' },
];

function getIntervalForSkill(skill: SkillLevel): number {
  if (skill === 'expert') return 0;
  if (skill === 'intermediate') return 3;
  return 5; // easy
}

function getYearRange(correctYear: number): { min: number; max: number } {
  return {
    min: Math.max(1900, correctYear - 30),
    max: Math.min(new Date().getFullYear(), correctYear + 30),
  };
}

function isCorrect(selectedYear: number, correctYear: number, interval: number): boolean {
  if (interval === 0) return selectedYear === correctYear;
  return Math.abs(selectedYear - correctYear) <= Math.floor(interval / 2);
}

function calculatePoints(timeLeft: number, correct: boolean): number {
  if (!correct) return 0;
  return Math.round(1000 * (timeLeft / 30));
}

// ─── Mått ─────────────────────────────────────────────────────────────────────
const SCREEN_WIDTH = Dimensions.get('window').width;

// ITEM_WIDTH (avstånd mellan ticks) sätts dynamiskt per skill-nivå inuti komponenten:
// Easy: tät (≥10 år synliga), Intermediate: medium (≥8), Expert: gles (4–5 syns)

// Tidslinjen – alla mått relativa till container-toppen
const CONTAINER_HEIGHT = 108;
const TRACK_Y = 55;           // horisontell linje (mitten av svarsrutan)
const TICK_TOP = 24;          // ticks börjar ovanför svarsrutan
const TICK_BOTTOM = 86;       // ticks slutar under svarsrutan
const TICK_TOTAL = TICK_BOTTOM - TICK_TOP; // = 62px total tick-höjd
const YEAR_TEXT_Y = 90;       // årstext direkt under tickarna

// Svarsruta – kortare ram som tickarna tydligt skär genom
const SELECTOR_TOP = 34;      // 10px under tick-toppen
const SELECTOR_BOTTOM = 76;   // 10px över tick-botten
const SELECTOR_H = SELECTOR_BOTTOM - SELECTOR_TOP; // = 42px

// Energisk färg för svarsrutan (används oavsett skill-nivå)
const BOX_COLOR = '#F5A623';       // gyllene
const BOX_BG = 'rgba(26,48,80,0.92)'; // mörkare navy – tydligt distinkt mot bakgrund #0B1220

// ─── Timeline Selector ────────────────────────────────────────────────────────

function TimelineSelector({
  skill, correctYear, birthYear, onConfirm, disabled,
}: {
  skill: SkillLevel; correctYear: number; birthYear: number;
  onConfirm: (year: number) => void; disabled: boolean;
}) {
  // Dynamisk celltätlhet per skill-nivå (smalare celler = fler år syns på skärmen)
  const ITEM_WIDTH =
    skill === 'expert' ? 75 :
    skill === 'intermediate' ? 40 :
    32; // easy

  // Padding runt scroll-innehållet så min/max-ticks kan scrollas till tidslinjens mitt.
  // Tidslinjen är inuti wrapper-containern som har Spacing.lg padding på varje sida,
  // så vi räknar på dess faktiska bredd – inte hela skärmbredden.
  const TIMELINE_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;
  const SCROLL_PADDING = Math.max(40, TIMELINE_WIDTH / 2 - ITEM_WIDTH / 2);

  const interval = getIntervalForSkill(skill);
  const { min, max } = getYearRange(correctYear);
  const middleYear = Math.round((min + max) / 2);
  const [selectedYear, setSelectedYear] = useState(middleYear);

  const years = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const half = Math.floor(interval / 2);
  // Klampa det VISADE intervallet till [min, max] – förhindrar att rutan visar år som inte finns på tidslinjen
  const rangeStart = interval === 0 ? selectedYear : Math.max(min, selectedYear - half);
  const rangeEnd = interval === 0 ? selectedYear : Math.min(max, selectedYear + half);

  const skillColor = {
    easy: Colors.success,
    intermediate: Colors.primary,
    expert: '#F5A623',
  }[skill];

  // Svarsrutan täcker HELA cellen för varje år i intervallet – så att både ticks OCH
  // årtalsetiketten under tidslinjen ligger inom rutan.
  // (2*half + 1) = antal år i intervallet, gånger ITEM_WIDTH = bredden av alla celler
  const selectorWidth = (2 * half + 1) * ITEM_WIDTH;

  // Adaptiv textstorlek – skalar ner när rutan är smal (korta intervall + smala celler)
  const textFontSize =
    interval === 0 ? 20 :
    selectorWidth >= 180 ? 22 :
    selectorWidth >= 130 ? 18 :
    14;

  // Scrollens startposition: mittenåret ska synas i mitten av skärmen vid uppstart
  const initialScrollOffset = (middleYear - min) * ITEM_WIDTH;

  const handleScroll = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / ITEM_WIDTH);
    const year = Math.min(max, Math.max(min, min + index));
    setSelectedYear(year);
  };

  return (
    <View style={tl.wrapper}>

      {/* Assist label */}
      <View style={tl.assistRow}>
        <View style={[tl.assistLine, { backgroundColor: skillColor + '50' }]} />
        <View style={[tl.assistBadge, { backgroundColor: skillColor + '20', borderColor: skillColor + '50' }]}>
          <Text style={[tl.assistText, { color: skillColor }]}>
            {skill.toUpperCase()} ASSIST
          </Text>
        </View>
        <Text style={[tl.assistDesc, { color: skillColor + 'bb' }]}>
          {interval === 0 ? 'Pick the exact year' : `Select a ${interval}-year interval`}
        </Text>
        <View style={[tl.assistLine, { backgroundColor: skillColor + '50' }]} />
      </View>

      {/* Timeline container */}
      <View style={{ height: CONTAINER_HEIGHT, position: 'relative' }}>

        {/* ScrollView med tidslinjen */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SCROLL_PADDING }}
          contentOffset={{ x: initialScrollOffset, y: 0 }}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          onMomentumScrollEnd={handleScroll}
          onScrollEndDrag={handleScroll}
          onScroll={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / ITEM_WIDTH);
            const year = Math.min(max, Math.max(min, min + index));
            setSelectedYear(year);
          }}
          scrollEventThrottle={16}
          scrollEnabled={!disabled}
          style={StyleSheet.absoluteFill}
        >
          {/* Horisontell linje – sträcker sig genom hela det scrollbara området */}
          <View style={{
            position: 'absolute',
            top: TRACK_Y,
            left: -SCROLL_PADDING,
            width: years.length * ITEM_WIDTH + SCROLL_PADDING * 2,
            height: 1.5,
            backgroundColor: Colors.borderStrong,
          }} />

          {years.map((year) => {
            const isInRange = interval > 0 && year >= rangeStart && year <= rangeEnd;
            const isSelected = year === selectedYear;
            const tickColor = isInRange || isSelected
              ? skillColor
              : Colors.primary + '44';

            return (
              <View
                key={year}
                style={{
                  width: ITEM_WIDTH,
                  height: CONTAINER_HEIGHT,
                  alignItems: 'center',
                }}
              >
                {/* Lodrätt streck – skär den horisontella linjen */}
                <View style={{
                  position: 'absolute',
                  top: TICK_TOP,
                  width: 1,
                  height: TICK_TOTAL,
                  backgroundColor: tickColor,
                  borderRadius: 1,
                }} />

                {/* Årstext – alla på samma Y */}
                <Text style={{
                  position: 'absolute',
                  top: YEAR_TEXT_Y,
                  fontSize: 10,
                  color: isInRange || isSelected
                    ? skillColor
                    : Colors.textSecondary + '88',
                  fontWeight: isInRange || isSelected ? '600' : '400',
                  textAlign: 'center',
                  width: ITEM_WIDTH,
                }}>
                  {year}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Selector-ram – energisk gul, tickarna skär rutan, årtalet inuti */}
        <View
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
        >
          <View style={{
            position: 'absolute',
            left: '50%',
            top: SELECTOR_TOP,
            width: selectorWidth,
            height: SELECTOR_H,
            marginLeft: -(selectorWidth / 2),
            borderWidth: 3,
            borderRadius: 10,
            borderColor: BOX_COLOR,
            backgroundColor: BOX_BG,
            shadowColor: BOX_COLOR,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.85,
            shadowRadius: 18,
            elevation: 8,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{
              fontSize: textFontSize,
              fontWeight: '700',
              color: BOX_COLOR,
              fontVariant: ['tabular-nums'],
              letterSpacing: -0.5,
            }}>
              {interval === 0 ? `${selectedYear}` : `${rangeStart} – ${rangeEnd}`}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[tl.hint, { color: Colors.textSecondary }]}>
        Swipe to move
      </Text>

      {!disabled && (
        <TouchableOpacity
          style={[tl.confirmBtn, { backgroundColor: skillColor }]}
          onPress={() => onConfirm(selectedYear)}
          activeOpacity={0.85}
        >
          <Text style={tl.confirmText}>Confirm</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const tl = StyleSheet.create({
  wrapper: { gap: Spacing.md, paddingHorizontal: Spacing.lg },
  assistRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  assistLine: { flex: 1, height: 1 },
  assistBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  assistText: { fontSize: 10, fontWeight: FontWeight.semibold, letterSpacing: 0.5 },
  assistDesc: { fontSize: 11, fontWeight: FontWeight.medium },

  hint: { textAlign: 'center', fontSize: 10, fontStyle: 'italic' },
  confirmBtn: { height: 56, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  confirmText: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
});

// ─── Reveal Screen ────────────────────────────────────────────────────────────

function RevealScreen({
  question, selectedYear, skill, birthYear, points,
  onNextRound, onViewLeaderboard, isLastQuestion,
}: {
  question: TimelineQuestion; selectedYear: number; skill: SkillLevel;
  birthYear: number; points: number;
  onNextRound: () => void;
  onViewLeaderboard: () => void;
  isLastQuestion: boolean;
}) {
  const interval = getIntervalForSkill(skill);
  const correct = isCorrect(selectedYear, question.correctYear, interval);
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={rv.container}>
      <Animated.View style={[rv.answerCard, { transform: [{ scale }], opacity }]}>
        <Text style={rv.answerLabel}>Correct Answer</Text>
        <Text style={rv.answerYear}>{question.correctYear}</Text>
        <Text style={rv.answerHint}>{question.hint}</Text>
      </Animated.View>

      <View style={[rv.resultRow, correct ? rv.correct : rv.wrong]}>
        <Text style={rv.resultIcon}>{correct ? '✓' : '✗'}</Text>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[rv.resultTitle, { color: correct ? Colors.success : Colors.error }]}>
            {correct ? 'Correct!' : 'Not quite'}
          </Text>
          <Text style={rv.resultSub}>
            {correct
              ? `You were ${selectedYear === question.correctYear ? 'spot on!' : `within ${Math.abs(selectedYear - question.correctYear)} year${Math.abs(selectedYear - question.correctYear) !== 1 ? 's' : ''}`}`
              : `The answer was ${question.correctYear}`}
          </Text>
        </View>
        <View style={rv.pts}>
          <Text style={rv.ptsNum}>+{points}</Text>
          <Text style={rv.ptsLabel}>pts</Text>
        </View>
      </View>

      {isLastQuestion ? (
        <TouchableOpacity style={rv.nextBtn} onPress={onViewLeaderboard} activeOpacity={0.85}>
          <Text style={rv.nextBtnText}>🏆  Final Leaderboard</Text>
        </TouchableOpacity>
      ) : (
        <View style={rv.twoBtnRow}>
          <TouchableOpacity
            style={rv.secondaryBtn}
            onPress={onViewLeaderboard}
            activeOpacity={0.85}
          >
            <Text style={rv.secondaryBtnText}>View Leaderboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={rv.primaryBtn}
            onPress={onNextRound}
            activeOpacity={0.85}
          >
            <Text style={rv.primaryBtnText}>Next Round  →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const rv = StyleSheet.create({
  container: { gap: Spacing.lg, paddingHorizontal: Spacing.lg },
  answerCard: {
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.primaryBorder,
    padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm,
  },
  answerLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  answerYear: { fontSize: 64, fontWeight: '700', color: Colors.primary, fontVariant: ['tabular-nums'] },
  answerHint: { fontSize: FontSize.sm, color: Colors.textSecondary },
  resultRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderRadius: Radius.md, padding: Spacing.lg, borderWidth: 1,
  },
  correct: { backgroundColor: Colors.successMuted, borderColor: Colors.successBorder },
  wrong: { backgroundColor: Colors.errorMuted, borderColor: Colors.error + '40' },
  resultIcon: { fontSize: 24 },
  resultTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  resultSub: { fontSize: FontSize.xs, color: Colors.textSecondary },
  pts: { alignItems: 'center' },
  ptsNum: { fontSize: 22, fontWeight: '700', color: Colors.primary },
  ptsLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  nextBtn: { height: 56, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  nextBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },

  // Två knappar sida vid sida (sekundär "View Leaderboard" + primär "Next Round")
  twoBtnRow: { flexDirection: 'row', gap: Spacing.sm },
  secondaryBtn: {
    flex: 1,
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.primaryBorder,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  primaryBtn: {
    flex: 1,
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
});

// ─── Main Quiz Screen ─────────────────────────────────────────────────────────

export default function QuizScreen() {
  const params = useLocalSearchParams<{ skill?: string; age?: string }>();
  const skill = (params.skill ?? 'intermediate') as SkillLevel;
  const age = parseInt(params.age ?? '30');
  const birthYear = new Date().getFullYear() - age;

  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<'question' | 'reveal' | 'leaderboard'>('question');
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [roundPoints, setRoundPoints] = useState(0);
  const [rounds, setRounds] = useState<RoundResult[]>([]);

  // ── Multiplayer state (mock-motspelare genererade per runda) ──────────────
  const [currentRoundScores, setCurrentRoundScores] = useState<RoundScore[]>([]);
  const [allRoundScoresHistory, setAllRoundScoresHistory] = useState<RoundScore[][]>([]);
  const [opponentTotals, setOpponentTotals] = useState<Record<string, number>>(
    Object.fromEntries(MOCK_OPPONENTS.map((o) => [o.id, 0])),
  );
  const [playerHcpChanges, setPlayerHcpChanges] = useState<Record<string, HcpChange>>({});

  // Spel-start: trackas en gång när QuizScreen mountas (router pushar
  // hit från Lobby:s "Start Game"-flöde). Region/land sätts av
  // analytics-vendor:n på dashboard-sidan, behöver inte skickas här.
  useEffect(() => {
    track('game_started', { skill });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "YOU"-spelare (hostar spelet; använder params.skill/age)
  const youPlayer: LeaderboardPlayer = useMemo(
    () => ({
      id: 'you',
      name: 'You',
      emoji: '🎮',
      skill,
      age,
      isYou: true,
      isHost: true,
    }),
    [skill, age],
  );
  const allPlayers: LeaderboardPlayer[] = useMemo(
    () => [youPlayer, ...MOCK_OPPONENTS],
    [youPlayer],
  );

  const timerRef = useRef<any>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const question = SEED_QUESTIONS[questionIndex];
  const isLastQuestion = questionIndex === SEED_QUESTIONS.length - 1;

  const startTimer = useCallback(() => {
    setTimeLeft(30);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, [questionIndex]);

  useEffect(() => {
    if (timeLeft === 0 && phase === 'question') {
      // Time ran out – registrera ronden som missad (0 poäng, inget giltigt svar)
      const defaultGuess = new Date().getFullYear() - 20;
      setSelectedYear(defaultGuess);
      setRoundPoints(0);
      setRounds((prev) => [
        ...prev,
        {
          questionNumber: question.questionNumber,
          category: question.category,
          question: question.question,
          correctYear: question.correctYear,
          selectedYear: defaultGuess,
          correct: false,
          points: 0,
          timeUsed: 30,
        },
      ]);
      // Generera motspelarnas rond-poäng och uppdatera totals
      simulateOpponentRound(0, false, 30);
      setPhase('reveal');
    }
  }, [timeLeft]);

  // ── Mock-motspelare: generera poäng för denna runda ─────────────────────
  const simulateOpponentRound = (yourPoints: number, yourCorrect: boolean, yourTimeUsed: number) => {
    const opponentScores: RoundScore[] = MOCK_OPPONENTS.map((opp) => {
      const gen = generateOpponentRoundScore(opp.skill);
      return {
        playerId: opp.id,
        points: gen.points,
        correct: gen.correct,
        timeUsed: generateOpponentTimeUsed(),
      };
    });
    const yourScore: RoundScore = {
      playerId: 'you',
      points: yourPoints,
      correct: yourCorrect,
      timeUsed: yourTimeUsed,
    };
    const allScores = [yourScore, ...opponentScores];
    setCurrentRoundScores(allScores);
    setAllRoundScoresHistory((prev) => [...prev, allScores]);
    setOpponentTotals((prev) => {
      const next = { ...prev };
      opponentScores.forEach((s) => {
        next[s.playerId] = (next[s.playerId] ?? 0) + s.points;
      });
      return next;
    });
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [questionIndex]);

  useEffect(() => {
    if (timeLeft <= 5 && phase === 'question') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 250, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [timeLeft, phase]);

  const handleConfirm = (year: number) => {
    clearInterval(timerRef.current);
    const interval = getIntervalForSkill(skill);
    const correct = isCorrect(year, question.correctYear, interval);
    const pts = calculatePoints(timeLeft, correct);
    const timeUsed = 30 - timeLeft;
    setSelectedYear(year);
    setRoundPoints(pts);
    setTotalPoints((prev) => prev + pts);
    setRounds((prev) => [
      ...prev,
      {
        questionNumber: question.questionNumber,
        category: question.category,
        question: question.question,
        correctYear: question.correctYear,
        selectedYear: year,
        correct,
        points: pts,
        timeUsed,
      },
    ]);
    // Generera motspelarnas rond-poäng och uppdatera totals
    simulateOpponentRound(pts, correct, timeUsed);
    setPhase('reveal');
  };

  // ── Navigations-handlers ────────────────────────────────────────────────

  // Från Reveal: visa leaderboard
  const handleShowLeaderboard = () => {
    setPhase('leaderboard');
  };

  // Från Reveal eller Leaderboard: hoppa direkt till nästa fråga
  const handleAdvanceToNextRound = () => {
    setQuestionIndex((prev) => prev + 1);
    setPhase('question');
    setSelectedYear(null);
  };

  // Spara det avslutade spelet till AsyncStorage (görs när final leaderboard visas).
  // Player history (i Fas 5) kan sedan hämta denna data.
  const saveFinalGame = async () => {
    // TODO (Fas 6): beräkna riktig HCP-förändring från totalPoints + skill + ålder
    const hcpBefore = 99;
    const hcpDelta = Math.round(totalPoints / 500); // tillfällig: 1 HCP-poäng per 500 pts
    const hcpAfter = Math.max(1, hcpBefore - hcpDelta);

    const result: GameResult = {
      id: `g-${Date.now()}`,
      date: new Date().toISOString(),
      totalPoints,
      rounds,
      skill,
      hcpBefore,
      hcpAfter,
    };

    try {
      await saveLatestResult(result);
    } catch {
      // Om sparning misslyckas – leaderboarden visas ändå
    }
  };

  // Kör när sista rundans leaderboard visas: beräkna HCP-förändringar + spara spel
  useEffect(() => {
    if (phase === 'leaderboard' && isLastQuestion) {
      // Beräkna HCP-förändring för alla spelare.
      // Formel (placeholder till Fas 6): delta = round(totalPoints / 500)
      const changes: Record<string, HcpChange> = {};

      // YOU
      const yourBefore = 99;
      const yourDelta = Math.round(totalPoints / 500);
      changes.you = { before: yourBefore, after: Math.max(1, yourBefore - yourDelta) };

      // Motspelare
      MOCK_OPPONENTS.forEach((opp) => {
        const oppTotal = opponentTotals[opp.id] ?? 0;
        const oppDelta = Math.round(oppTotal / 500);
        const before = MOCK_OPPONENT_HCP_BEFORE[opp.id] ?? 99;
        changes[opp.id] = { before, after: Math.max(1, before - oppDelta) };
      });

      setPlayerHcpChanges(changes);
      saveFinalGame();
      track('game_completed', {
        skill,
        total_points: totalPoints,
        rounds_played: rounds.length,
      });
    }
  }, [phase, isLastQuestion]);

  // Sista rundans actions: starta nytt rum i Lobby (ev. med samma spelare) eller gå hem
  const goToNewLobby = async (reusePlayers: boolean) => {
    if (reusePlayers) {
      // Behåll alla spelare från detta spel
      const lobbyPlayers: LobbyPlayer[] = allPlayers.map((p) => ({
        id: p.id,
        name: p.isYou ? 'You' : p.name,
        emoji: p.emoji,
        isReady: true,
        type: 'registered' as const,
        age: p.age,
        skill: p.skill,
        hcpComplete: true,
        isHost: p.isHost ?? false,
      }));
      await savePendingLobbyPlayers(lobbyPlayers);
    } else {
      // Tom lobby förutom YOU som host
      const justHost: LobbyPlayer[] = [{
        id: 'you',
        name: 'You',
        emoji: '🎮',
        isReady: true,
        type: 'registered',
        age,
        skill,
        hcpComplete: true,
        isHost: true,
      }];
      await savePendingLobbyPlayers(justHost);
    }
    const newCode = generateRoomCode();
    // Registrera nya koden som aktivt rum så join-flödena kan validera
    // mot den (samma princip som handleCreateGame på Home-skärmen).
    registerActiveRoom(newCode);
    // Färsk leftPlayers-store för nya koden — undviker stale test-data.
    clearLeftPlayers(newCode);
    router.replace(`/(tabs)/lobby?code=${newCode}&isHost=true`);
  };

  const handlePlayAgain = () => {
    Alert.alert(
      'Re-use all players?',
      'Start the next room with the same players, or begin fresh?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start fresh', onPress: () => goToNewLobby(false) },
        { text: 'Yes, keep them', onPress: () => goToNewLobby(true) },
      ],
    );
  };

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  const timerColor = timeLeft > 10 ? Colors.primary : timeLeft > 5 ? Colors.warning : Colors.error;
  const timerBg = timeLeft > 10 ? Colors.primaryMuted : timeLeft > 5 ? Colors.warningMuted : Colors.errorMuted;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {phase !== 'leaderboard' && (
        <>
        <View style={styles.mediaCard}>
          <View style={styles.mediaInner}>
            <Text style={styles.mediaIcon}>{question.category === 'Music' ? '🎵' : '🌍'}</Text>
            <Text style={styles.mediaCategory}>{question.category}</Text>
            <Text style={styles.mediaHint}>Video / Image coming soon</Text>
          </View>

          {phase === 'question' && (
            <Animated.View style={[
              styles.timerOverlay,
              { backgroundColor: timerBg, transform: [{ scale: pulseAnim }] },
            ]}>
              <Text style={[styles.timerNum, { color: timerColor }]}>
                {String(timeLeft).padStart(2, '0')}
              </Text>
              <Text style={styles.timerSec}>sec</Text>
            </Animated.View>
          )}

          <TouchableOpacity style={styles.exitBtn} onPress={() => router.back()}>
            <Text style={styles.exitText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.questionCard}>
          <View style={styles.questionTop}>
            <Text style={styles.questionMeta}>
              Question {question.questionNumber} of {question.totalQuestions}
            </Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>Year</Text>
            </View>
          </View>
          <Text style={styles.questionText}>{question.question}</Text>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreNum}>{totalPoints}</Text>
            <Text style={styles.scoreLabel}> pts total</Text>
          </View>
        </View>
        </>
        )}

        {phase === 'question' && (
          <View style={styles.speedRow}>
            <View style={styles.speedLine} />
            <Text style={styles.speedText}>SPEED COUNTS — CONFIRM FOR POINTS</Text>
            <View style={styles.speedLine} />
          </View>
        )}

        {phase === 'question' && (
          <TimelineSelector
            skill={skill}
            correctYear={question.correctYear}
            birthYear={birthYear}
            onConfirm={handleConfirm}
            disabled={false}
          />
        )}

        {phase === 'reveal' && (
          <RevealScreen
            question={question}
            selectedYear={selectedYear ?? question.correctYear}
            skill={skill}
            birthYear={birthYear}
            points={roundPoints}
            onNextRound={handleAdvanceToNextRound}
            onViewLeaderboard={handleShowLeaderboard}
            isLastQuestion={isLastQuestion}
          />
        )}

        {phase === 'leaderboard' && (
          <RoundLeaderboard
            players={allPlayers}
            roundScores={currentRoundScores}
            totalsByPlayerId={{ you: totalPoints, ...opponentTotals }}
            roundNumber={question.questionNumber}
            totalRounds={question.totalQuestions}
            onNextRound={handleAdvanceToNextRound}
            onPlayAgain={handlePlayAgain}
            onGoHome={handleGoHome}
            isLastRound={isLastQuestion}
            allRoundScoresHistory={allRoundScoresHistory}
            hcpChanges={isLastQuestion ? playerHcpChanges : undefined}
          />
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { gap: Spacing.md, paddingBottom: Spacing.xxl },

  mediaCard: { height: 200, backgroundColor: Colors.card, position: 'relative', overflow: 'hidden' },
  mediaInner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  mediaIcon: { fontSize: 44 },
  mediaCategory: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  mediaHint: { fontSize: FontSize.xs, color: Colors.textSecondary },

  timerOverlay: {
    position: 'absolute', top: Spacing.md, right: Spacing.md,
    borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    alignItems: 'center', minWidth: 56,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  timerNum: { fontSize: 28, fontWeight: '700', fontVariant: ['tabular-nums'], lineHeight: 32 },
  timerSec: { fontSize: 9, color: Colors.textSecondary, letterSpacing: 0.5 },

  exitBtn: {
    position: 'absolute', top: Spacing.md, left: Spacing.md,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  exitText: { fontSize: 13, color: Colors.textSecondary },

  questionCard: {
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.lg, gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
  },
  questionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  questionMeta: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  typeBadge: {
    backgroundColor: Colors.primaryMuted, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 3,
    borderWidth: 1, borderColor: Colors.primaryBorder,
  },
  typeBadgeText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold },
  questionText: { fontSize: 18, fontWeight: FontWeight.semibold, color: Colors.textPrimary, lineHeight: 26 },
  scoreBadge: { flexDirection: 'row', alignItems: 'baseline' },
  scoreNum: { fontSize: 16, fontWeight: '700', color: Colors.primary, fontVariant: ['tabular-nums'] },
  scoreLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },

  speedRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.lg },
  speedLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  speedText: { fontSize: 9, color: Colors.textSecondary, letterSpacing: 0.8 },
});
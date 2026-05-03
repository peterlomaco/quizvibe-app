import { GetReadyIntro } from '@/src/components/GetReadyIntro';
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
import { deactivateRoom, registerActiveRoom } from '@/src/utils/mockActiveRooms';
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
  skill, correctYear, birthYear, onYearChange, disabled,
}: {
  skill: SkillLevel; correctYear: number; birthYear: number;
  // Notifierar parent om vald-år-ändring vid varje scroll-tick. Confirm-knappen
  // lyfts ut till quiz.tsx så samma knapp-yta kan byta label/handler beroende
  // på fas (Confirm under question / Next Round under reveal).
  onYearChange: (year: number) => void; disabled: boolean;
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

  // Notifiera parent vid varje vald-år-ändring (inkl. mount via middleYear) så
  // quiz.tsx:s Confirm-knapp har det aktuella året när användaren trycker.
  useEffect(() => {
    onYearChange(selectedYear);
  }, [selectedYear, onYearChange]);

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

      {!disabled && (
        <Text style={[tl.hint, { color: Colors.textSecondary }]}>
          Swipe to move
        </Text>
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
});

// ─── Main Quiz Screen ─────────────────────────────────────────────────────────

type TurnOrderPlayer = { id: string; name: string; emoji?: string; avatarUri?: string };

export default function QuizScreen() {
  const params = useLocalSearchParams<{
    skill?: string;
    age?: string;
    gameMode?: 'pass-the-phone' | 'individual-devices';
    players?: string;
    roundsCount?: string;
    roomCode?: string;
  }>();
  const skill = (params.skill ?? 'intermediate') as SkillLevel;
  const age = parseInt(params.age ?? '30');
  const birthYear = new Date().getFullYear() - age;
  const gameMode = params.gameMode ?? 'pass-the-phone';
  // Antal rundor sätts av host i Lobby (slider 3–20, default 10). Fallback 5
  // om param saknas — t.ex. direkt-nav till /quiz utan att gå via Lobby.
  // SEED_QUESTIONS har 5 frågor i mock; för totalRounds > 5 cyklas listan via
  // modulo nedan tills riktig fråge-bank finns på plats.
  const totalRounds = Math.max(1, parseInt(String(params.roundsCount ?? '5'), 10));
  // Turordningen levereras som JSON-sträng från Lobby:s handleStartGame.
  // try/catch:en gör att en korrupt payload graceful degradar till tom lista
  // → 'intro'-fasen hoppas över istället för att skärmen fastnar tom.
  const turnOrder = useMemo<TurnOrderPlayer[]>(() => {
    if (!params.players) return [];
    try {
      const parsed = JSON.parse(params.players);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [params.players]);

  // En "runda" = ett varv där alla spelare svarar en gång. Totalt antal frågor
  // i spelomgången = rundor × spelare. Med 4 spelare × 4 rundor = 16 frågor.
  // Math.max(1, ...) skyddar fallback-fallet då turnOrder är tom (direkt-nav
  // till /quiz utan Lobby).
  const totalQuestions = totalRounds * Math.max(1, turnOrder.length);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  // Initial fas är 'intro' när vi har en turordning (gäller båda lägena vid
  // spelstart). Faller tillbaka till 'question' om payload saknas/parse-failar.
  const [phase, setPhase] = useState<'intro' | 'question' | 'reveal' | 'leaderboard'>(
    turnOrder.length > 0 ? 'intro' : 'question',
  );
  // Spelare som kommer efter current i turordningen (med wrap-around till
  // början). Drivs av Get-Ready-skärmens "Then: …"-rad så spelarna ser kön.
  const queueNames = useMemo<string[]>(() => {
    if (turnOrder.length <= 1) return [];
    return [
      ...turnOrder.slice(currentPlayerIndex + 1),
      ...turnOrder.slice(0, currentPlayerIndex),
    ].map((p) => p.name);
  }, [turnOrder, currentPlayerIndex]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  // Senaste valda år från TimelineSelector (uppdateras vid varje scroll-tick).
  // Quiz-skärmens egna Confirm-knapp läser detta när användaren trycker submit.
  const [pendingYear, setPendingYear] = useState<number | null>(null);
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
  // pulseAnim driver opacity:n på timer-progress-baren när tiden
  // är kritisk (≤5s). Default 1 = full opacity, oscillerar mot 0.55 i loop.
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Spring-in-animation för inline reveal-blocket (svar-card + result-row).
  // Triggas när phase växlar till 'reveal' så användaren ser
  // svaret poppa in. Kopierad logik från den borttagna RevealScreen-komponenten.
  const revealScale = useRef(new Animated.Value(0.6)).current;
  const revealOpacity = useRef(new Animated.Value(0)).current;

  const question = SEED_QUESTIONS[questionIndex % SEED_QUESTIONS.length];
  const isLastQuestion = questionIndex === totalQuestions - 1;
  // Aktuell spelares namn i Pass-the-Phone-rotationen — visas subtilt i fråge-
  // kortet ("Answering: {namn}"). Skip:as för Individual Devices (varje
  // spelare är på sin egen enhet och vet redan vem de är).
  const currentPlayerName = turnOrder[currentPlayerIndex]?.name;
  // Skill-färg används som accent på Confirm-knappen så den visuellt matchar
  // TimelineSelector:s assist-badge för samma skill-nivå. Reveal-fasens
  // Next Round-/Final Leaderboard-knapp använder Colors.primary istället.
  const skillColor = skill === 'easy' ? Colors.success : skill === 'expert' ? '#F5A623' : Colors.primary;

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
          questionNumber: questionIndex + 1,
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
    // Timern ska bara ticka i question-fasen — under 'intro' (Get Ready to
    // Vibe) får spelaren gott om tid att ta emot telefonen. `phase` i deps
    // gör att timern (åter)startas när vi går från 'intro' → 'question'.
    if (phase !== 'question') return;
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [questionIndex, phase]);

  useEffect(() => {
    // Pulsa progress-barens opacity (1 → 0.55 → 1) när ≤5s kvar för att
    // signalera att tiden är kritisk. Native driver eftersom det är ren
    // opacity-animation.
    if (timeLeft <= 5 && phase === 'question') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.55, duration: 250, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [timeLeft, phase]);

  // Spring-in inline-reveal när phase växlar till 'reveal'. Reset:ar värdena
  // varje gång så animationen körs på varje frågetransition (inte bara första).
  useEffect(() => {
    if (phase === 'reveal') {
      revealScale.setValue(0.6);
      revealOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(revealScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        Animated.timing(revealOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [phase, revealScale, revealOpacity]);

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
        questionNumber: questionIndex + 1,
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
    setSelectedYear(null);
    setPendingYear(null);
    // Pass-the-phone: rotera till nästa spelare i turordningen och visa
    // Get-Ready-skärmen så telefonen kan lämnas över. Individual Devices:
    // varje spelare är på sin egen enhet — inget overlämnings-flöde behövs
    // mellan rundor, gå direkt till nästa fråga.
    if (gameMode === 'pass-the-phone' && turnOrder.length > 0) {
      setCurrentPlayerIndex((prev) => (prev + 1) % turnOrder.length);
      setPhase('intro');
    } else {
      setPhase('question');
    }
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

  // Quit Game: avslutar pågående spel mitt i, river lobby:n och kastar ut
  // host till Home. Speglar host-flödet "Delete this Game Lobby" från
  // LobbyScreen — deactiverar rumkoden i mockActiveRooms (så ev. ifyllda
  // join-koder börjar visa "Room not found") och rensar leftPlayers-store:n
  // för koden så ingen stale-data ärver in när koden ev. återanvänds.
  const handleQuitGame = () => {
    Alert.alert(
      'Quit game?',
      'This will end the game and close the lobby for everyone. You will return to the start screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Quit game',
          style: 'destructive',
          onPress: () => {
            const code = params.roomCode;
            if (code) {
              deactivateRoom(code);
              clearLeftPlayers(code);
            }
            router.replace('/');
          },
        },
      ],
    );
  };

  // Timer-progress-barens färg byter vid 10s (warning) och 5s (error).
  const timerColor = timeLeft > 10 ? Colors.primary : timeLeft > 5 ? Colors.warning : Colors.error;
  // Klampa till [0, 1] så barens bredd aldrig overshootar/blir negativ vid
  // edge-cases (t.ex. om timern hinner gå till 0 medan reveal-transitionen
  // körs). 30s är hårdkodat tills answerResponseSeconds-paramet vävs in.
  const timerProgress = Math.max(0, Math.min(1, timeLeft / 30));

  // Get-Ready-skärmen renderas före quiz-UI:t. Vid spelstart för båda lägena,
  // och mellan rundor för Pass-the-phone (ej Individual Devices). Faller
  // tillbaka till 'You' om turnOrder skulle vara tom (defensiv — initial
  // phase-init filtrerar redan bort det fallet).
  if (phase === 'intro') {
    const currentPlayer = turnOrder[currentPlayerIndex];
    const playerCount = Math.max(1, turnOrder.length);
    const currentRound = Math.floor(questionIndex / playerCount) + 1;
    const currentQuestion = questionIndex + 1;
    // Kö-spelarnas runda och fråge-nummer räknas på den absoluta
    // question-positionen där just den spelaren faktiskt får sin tur
    // (questionIndex + 1 + i, 0-baserat). Cap:a på totalQuestions så
    // wrap-around-spelare i sista rundan som aldrig hinner spela försvinner
    // från listan helt — annars hade vi visat siffror som overshootar.
    // Alla tre arrays slicas parallellt så indexen håller ihop.
    const queueWithCounts = queueNames
      .map((name, i) => {
        const absoluteQuestion0 = questionIndex + 1 + i; // 0-baserat
        return {
          name,
          round: Math.floor(absoluteQuestion0 / playerCount) + 1,
          question: absoluteQuestion0 + 1, // 1-baserat
          withinBudget: absoluteQuestion0 < totalQuestions,
        };
      })
      .filter((entry) => entry.withinBudget);
    const introQueueNames = queueWithCounts.map((entry) => entry.name);
    const queueRoundNumbers = queueWithCounts.map((entry) => entry.round);
    const queueQuestionNumbers = queueWithCounts.map((entry) => entry.question);
    return (
      <GetReadyIntro
        playerName={currentPlayer?.name ?? 'You'}
        queueNames={introQueueNames}
        queueRoundNumbers={queueRoundNumbers}
        queueQuestionNumbers={queueQuestionNumbers}
        currentRound={currentRound}
        totalRounds={totalRounds}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        playerCount={playerCount}
        onReady={() => setPhase('question')}
        onQuit={handleQuitGame}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {phase !== 'leaderboard' && (
          <>
            {/* Mediakort — placeholder tills riktig YouTube/Spotify/AI-bild-
                integration kopplas in. Spelas/visas oförändrat även under
                reveal-fasen (användaren har bett om att uppspelningen ska
                fortsätta tills "Next Round" trycks). */}
            <View style={styles.mediaCard}>
              <View style={styles.mediaInner}>
                <Text style={styles.mediaIcon}>{question.category === 'Music' ? '🎵' : '🌍'}</Text>
                <Text style={styles.mediaCategory}>{question.category}</Text>
                <Text style={styles.mediaHint}>Video / Image coming soon</Text>
              </View>
            </View>

            {/* Horisontell timer-progress-bar — krymper från 100% → 0% över
                30s, byter färg vid 10s/5s, pulserar i opacity vid ≤5s. Fryses
                vid sin sista bredd när phase=reveal (interval clear:as i
                handleConfirm). Sekunderna kvar visas till höger som ett
                tabular-nums-värde i samma färg som baren. */}
            <View style={styles.timerSection}>
              <View style={styles.timerTrack}>
                <Animated.View
                  style={[
                    styles.timerFill,
                    {
                      width: `${timerProgress * 100}%`,
                      backgroundColor: timerColor,
                      opacity: pulseAnim,
                    },
                  ]}
                />
              </View>
              <Animated.Text
                style={[
                  styles.timerLabel,
                  { color: timerColor, opacity: pulseAnim },
                ]}
              >
                {`${timeLeft}s`}
              </Animated.Text>
            </View>

            <View style={styles.questionCard}>
              <View style={styles.questionTop}>
                <Text style={styles.questionMeta}>
                  Question {questionIndex + 1} of {totalQuestions}
                </Text>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>Year</Text>
                </View>
              </View>
              {/* Subtil player-rad — bara i Pass-the-Phone, så det är tydligt
                  vems tur det är även när intro-skärmen är borta. Individual
                  Devices: spelaren är på egen enhet, vet redan vem de är. */}
              {gameMode === 'pass-the-phone' && currentPlayerName && (
                <Text style={styles.answeringPlayer}>
                  Answering:{' '}
                  <Text style={styles.answeringPlayerName}>{currentPlayerName}</Text>
                </Text>
              )}
              <Text style={styles.questionText}>{question.question}</Text>
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreNum}>{totalPoints}</Text>
                <Text style={styles.scoreLabel}> pts total</Text>
              </View>
            </View>

            {phase === 'question' && (
              <View style={styles.speedRow}>
                <View style={styles.speedLine} />
                <Text style={styles.speedText}>SPEED COUNTS — CONFIRM FOR POINTS</Text>
                <View style={styles.speedLine} />
              </View>
            )}

            {/* TimelineSelector renderas i båda faserna. key={questionIndex}
                tvingar remount mellan frågor så internal selectedYear reset:as
                till middleYear för nya frågans range. disabled när phase=reveal
                så användaren ser sitt val låst. */}
            <TimelineSelector
              key={questionIndex}
              skill={skill}
              correctYear={question.correctYear}
              birthYear={birthYear}
              onYearChange={setPendingYear}
              disabled={phase === 'reveal'}
            />

            {/* Inline reveal: kompakt svar-card. Result-row (rätt/fel + diff)
                är borttagen — användaren ser sitt val i den (låsta) Timeline-
                Selector:n och rätt år i kortet, så jämförelsen är synlig utan
                en egen ruta. +pts-feedbacken sitter i högerkanten av samma
                kort så den nya Next Round-knappen ryms i viewport utan scroll. */}
            {phase === 'reveal' && selectedYear !== null && (
              <View style={rv.container}>
                <Animated.View
                  style={[
                    rv.answerCard,
                    { transform: [{ scale: revealScale }], opacity: revealOpacity },
                  ]}
                >
                  <Text style={rv.answerYear}>{question.correctYear}</Text>
                  <View style={rv.answerInfo}>
                    <Text style={rv.answerLabel}>Correct Answer</Text>
                    <Text style={rv.answerHint}>{question.hint}</Text>
                  </View>
                  <View style={rv.answerPts}>
                    <Text style={rv.answerPtsNum}>+{roundPoints}</Text>
                    <Text style={rv.answerPtsLabel}>pts</Text>
                  </View>
                </Animated.View>
              </View>
            )}

            {/* Fas-medveten action-knapp: Confirm under question, Next Round
                under reveal, Final Leaderboard på sista frågans reveal. */}
            <View style={styles.actionWrap}>
              {phase === 'question' ? (
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    { backgroundColor: skillColor },
                    pendingYear === null && styles.actionBtnDisabled,
                  ]}
                  onPress={() => {
                    if (pendingYear !== null) handleConfirm(pendingYear);
                  }}
                  disabled={pendingYear === null}
                  activeOpacity={0.85}
                >
                  <Text style={styles.actionBtnText}>Confirm</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
                  onPress={isLastQuestion ? handleShowLeaderboard : handleAdvanceToNextRound}
                  activeOpacity={0.85}
                >
                  <Text style={styles.actionBtnText}>
                    {isLastQuestion ? '🏆  Final Leaderboard' : 'Next Round  →'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        {phase === 'leaderboard' && (
          <RoundLeaderboard
            players={allPlayers}
            roundScores={currentRoundScores}
            totalsByPlayerId={{ you: totalPoints, ...opponentTotals }}
            roundNumber={questionIndex + 1}
            totalRounds={totalQuestions}
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

  mediaCard: { height: 200, backgroundColor: Colors.card },
  mediaInner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  mediaIcon: { fontSize: 44 },
  mediaCategory: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  mediaHint: { fontSize: FontSize.xs, color: Colors.textSecondary },

  // Timer-section — radlayout med bar:en (flex 1) + sekund-räknaren till
  // höger. Sitter direkt under mediakortet (negativ marginTop -Spacing.md
  // kompenserar för ScrollView-content:s gap så sektionen limmar mot
  // mediakortets underkant istället för att flyta i tomrum). Horisontell
  // padding matchar fråge-kortets margin så bar:en linjerar med kortets
  // sidkanter istället för att vara edge-to-edge.
  timerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginTop: -Spacing.md,
  },
  timerTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    borderRadius: 3,
  },
  timerLabel: {
    minWidth: 32,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
    letterSpacing: 0.3,
  },

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
  // Subtil "Answering: {namn}"-rad — ärver xs-storleken från questionMeta-
  // raden ovanför men markerar namnet i textPrimary + semibold så det syns
  // utan att skrika.
  answeringPlayer: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
  answeringPlayerName: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  questionText: { fontSize: 18, fontWeight: FontWeight.semibold, color: Colors.textPrimary, lineHeight: 26 },
  scoreBadge: { flexDirection: 'row', alignItems: 'baseline' },
  scoreNum: { fontSize: 16, fontWeight: '700', color: Colors.primary, fontVariant: ['tabular-nums'] },
  scoreLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },

  speedRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.lg },
  speedLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  speedText: { fontSize: 9, color: Colors.textSecondary, letterSpacing: 0.8 },

  // Action-knapp (Confirm / Next Round / Final Leaderboard) — paddningen
  // matchar TimelineSelector:s wrapper så knappen står i samma kolumn.
  actionWrap: {
    paddingHorizontal: Spacing.lg,
  },
  actionBtn: {
    height: 56,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
  actionBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
});

// Inline reveal-block — kompakt horisontellt svar-card (year vänster, info
// mitten, +pts höger). Animeras in via revealScale/revealOpacity. Resultatet
// är en låg ruta så Next Round-knappen ryms direkt i viewport efter Confirm
// utan att användaren behöver scrolla.
const rv = StyleSheet.create({
  container: { paddingHorizontal: Spacing.lg },
  answerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  answerYear: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  answerInfo: { flex: 1, gap: 2 },
  answerLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: FontWeight.semibold,
  },
  answerHint: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  answerPts: {
    alignItems: 'center',
    minWidth: 56,
  },
  answerPtsNum: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
  },
  answerPtsLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
});
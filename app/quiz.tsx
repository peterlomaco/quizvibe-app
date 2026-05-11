import { CountdownIntro } from '@/src/components/CountdownIntro';
import { GetReadyIntro } from '@/src/components/GetReadyIntro';
import { ImageAnswerBlock } from '@/src/components/ImageAnswerBlock';
import { MediaPlayer } from '@/src/components/MediaPlayer';
import { ProgressiveCover } from '@/src/components/ProgressiveCover';
import { StopwatchIcon } from '@/src/components/StopwatchIcon';
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
import { clearEjected } from '@/src/utils/ejectedPlayers';
import { clearLobbyPlayers } from '@/src/utils/mockLobbyPlayers';
import { clearLobbySettings } from '@/src/utils/mockLobbySettings';
import { clearGameStarted } from '@/src/utils/mockStartedGames';
import { pickMediaSource, type YoutubeClip } from '@/src/utils/mediaSource';
import { MUSIC_QUESTIONS } from '@/src/utils/musicQuestions';
import {
  IMAGE_QUIZ_QUESTIONS,
  type ImageNameOption,
  type ImageQuestionVariant,
  type ImageVariantKey,
} from '@/src/utils/quizImageQuestions';
import { getQuizImage } from '@/src/utils/quizImages';
import { getAvatarEmojiById } from '@/src/utils/avatars';
import { loadProfile } from '@/src/utils/profileStorage';
import { generateRoomCode } from '@/src/utils/roomCode';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

type AssistanceLevel = 'minimal' | 'standard' | 'full';

interface TimelineQuestion {
  type: 'timeline';
  id: string;
  questionNumber: number;
  totalQuestions: number;
  category: string;
  question: string;
  correctYear: number;
  hint: string;
  // Pre-curerade YouTube-klipp för frågan. Optional — items utan klipp
  // renderar `NoSourcePlayer`-placeholder via pickMediaSource. Real katalog
  // (Phase 4 → riktig fråge-bank) kommer ha clips fyllda från
  // backend/content/catalog/*.yaml.
  youtubeClips?: YoutubeClip[];
}

interface ImageQuestion {
  type: 'image';
  id: string;
  questionNumber: number;
  totalQuestions: number;
  category: string;
  question: string;
  /** Rätt svar — visas i reveal-feedback. */
  displayName: string;
  /** Pre-baked Letter Grid + name-options per prefix-längd. Klienten väljer
   *  variant runtime via `pickImageQuestionVariant(q, assistance)`. */
  variants: Record<ImageVariantKey, ImageQuestionVariant>;
}

type QuizQuestion = TimelineQuestion | ImageQuestion;

// Spelet ställer endast Music-frågor (YouTube delvis, Spotify alltid). Själva
// låten spelas upp via media-pipen — frågetexten är därmed alltid samma
// generic "Which year was this song released?". `hint` används bara internt
// i reveal-vyn ("Disco era") så den behålls för smak.
const MUSIC_QUESTION_TEXT = 'Which year was this song released?';

// Frågorna kommer från backend-curerad katalog (backend/content/catalog/songs-*.yaml).
// Regenerera src/utils/musicQuestions.ts efter katalog-ändringar med:
//   cd backend && npm run export-music-questions
// Items utan youtubeClips filtreras bort av export-scriptet.
const SEED_QUESTIONS: TimelineQuestion[] = MUSIC_QUESTIONS.map((q, i) => ({
  type: 'timeline',
  id: q.id,
  questionNumber: i + 1,
  totalQuestions: MUSIC_QUESTIONS.length,
  category: 'Music',
  question: MUSIC_QUESTION_TEXT,
  correctYear: q.correctYear,
  hint: q.displayName,
  youtubeClips: q.youtubeClips,
}));

// Bild-frågor (Letter Grid → Final Selection-svar). category='Image' triggar
// per-typ-rendering i question-card / mediaCard / answer-block / reveal-block.
const IMAGE_SEED_QUESTIONS: ImageQuestion[] = IMAGE_QUIZ_QUESTIONS.map(
  (q, i) => ({
    type: 'image',
    id: q.id,
    questionNumber: i + 1,
    totalQuestions: IMAGE_QUIZ_QUESTIONS.length,
    category: 'Image',
    question: q.questionText,
    displayName: q.displayName,
    variants: q.variants,
  }),
);

function getIntervalForAssistance(assistance: AssistanceLevel): number {
  if (assistance === 'minimal') return 0;
  if (assistance === 'standard') return 3;
  return 5; // full
}

/**
 * Beräknar svarsruta-fönstret runt selectedYear så att FULL bredd alltid
 * preserveras — även när selected ligger nära era-min eller era-max.
 * Vid edge shiftas fönstret in i intervallet istället för att klippas
 * (annars skulle full=5 år kollapsa till 3 år vid kanterna).
 */
function getAnswerRange(
  selectedYear: number,
  interval: number,
  min: number,
  max: number,
): { start: number; end: number } {
  if (interval === 0) {
    return { start: selectedYear, end: selectedYear };
  }
  const half = Math.floor(interval / 2);
  let start = selectedYear - half;
  let end = selectedYear + half;
  if (start < min) {
    end += min - start;
    start = min;
  }
  if (end > max) {
    start -= end - max;
    end = max;
  }
  // Final clamp om hela era-spannet är smalare än interval (mycket smal era)
  start = Math.max(min, start);
  end = Math.min(max, end);
  return { start, end };
}

function isCorrect(
  selectedYear: number,
  correctYear: number,
  interval: number,
  eraMin: number,
  eraMax: number,
): boolean {
  const range = getAnswerRange(selectedYear, interval, eraMin, eraMax);
  return correctYear >= range.start && correctYear <= range.end;
}

function calculatePoints(timeLeft: number, correct: boolean, totalSeconds: number): number {
  if (!correct) return 0;
  return Math.round(1000 * (timeLeft / totalSeconds));
}

// ─── Mått ─────────────────────────────────────────────────────────────────────
const SCREEN_WIDTH = Dimensions.get('window').width;

// ITEM_WIDTH (avstånd mellan ticks) sätts dynamiskt per assistance-nivå inuti komponenten:
// Full: tät (≥10 år synliga), Standard: medium (≥8), Minimal: gles (4–5 syns)

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

// Energisk färg för svarsrutan (används oavsett assistance-nivå)
const BOX_COLOR = '#F5A623';       // gyllene
const BOX_BG = 'rgba(26,48,80,0.92)'; // mörkare navy – tydligt distinkt mot bakgrund #0B1220

// ─── Timeline Selector ────────────────────────────────────────────────────────

function TimelineSelector({
  assistance, onYearChange, disabled, eraFrom, eraTo,
}: {
  assistance: AssistanceLevel;
  // Notifierar parent om vald-år-ändring vid varje scroll-tick. Confirm-knappen
  // lyfts ut till quiz.tsx så samma knapp-yta kan byta label/handler beroende
  // på fas (Confirm under question / Next Round under reveal).
  onYearChange: (year: number) => void; disabled: boolean;
  // Game Era från Lobby — låser tidslinjens span exakt till det årsspann
  // host valde. Spelaren kan inte scrolla till år utanför era-perioden.
  eraFrom: number; eraTo: number;
}) {
  // Dynamisk celltätlhet per assistance-nivå (smalare celler = fler år syns på skärmen)
  const ITEM_WIDTH =
    assistance === 'minimal' ? 75 :
    assistance === 'standard' ? 40 :
    32; // full

  // Padding runt scroll-innehållet så min/max-ticks kan scrollas till tidslinjens mitt.
  // Tidslinjen är inuti wrapper-containern som har Spacing.lg padding på varje sida,
  // så vi räknar på dess faktiska bredd – inte hela skärmbredden.
  const TIMELINE_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;
  const SCROLL_PADDING = Math.max(40, TIMELINE_WIDTH / 2 - ITEM_WIDTH / 2);

  const interval = getIntervalForAssistance(assistance);
  // Tidslinjens span = host:s valda Game Era. Spelarens scroll-räckvidd
  // capas mot eraFrom/eraTo så även selector-rutan (year-interval) håller
  // sig inom perioden via existerande Math.max/min-clamps nedan.
  const min = eraFrom;
  const max = eraTo;
  const middleYear = Math.round((min + max) / 2);
  const [selectedYear, setSelectedYear] = useState(middleYear);

  // Notifiera parent vid varje vald-år-ändring (inkl. mount via middleYear) så
  // quiz.tsx:s Confirm-knapp har det aktuella året när användaren trycker.
  useEffect(() => {
    onYearChange(selectedYear);
  }, [selectedYear, onYearChange]);

  // Pulserande swipe-affordance: två gold-pilar utanför selector-rutans
  // vänster/höger-kant. Loop:as i opacity + scale så de "dunkar" tills
  // användaren scrollar (timeline:n disablar arrows när phase=reveal).
  const arrowPulse = useRef(new Animated.Value(0.35)).current;
  const arrowScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (disabled) {
      arrowPulse.stopAnimation();
      arrowPulse.setValue(0);
      arrowScale.stopAnimation();
      arrowScale.setValue(1);
      return;
    }
    const opacityLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowPulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(arrowPulse, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ]),
    );
    const scaleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowScale, { toValue: 1.18, duration: 700, useNativeDriver: true }),
        Animated.timing(arrowScale, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    opacityLoop.start();
    scaleLoop.start();
    return () => {
      opacityLoop.stop();
      scaleLoop.stop();
    };
  }, [disabled, arrowPulse, arrowScale]);

  const years = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const half = Math.floor(interval / 2);
  // Använd getAnswerRange-helper:n så fönstret behåller FULL bredd även vid
  // era-kanterna (shiftar inåt istället för att klippa). Annars skulle t.ex.
  // full=5 kollapsa till 3 år vid edge.
  const { start: rangeStart, end: rangeEnd } = getAnswerRange(
    selectedYear,
    interval,
    min,
    max,
  );

  const assistanceColor = {
    full: Colors.success,
    standard: Colors.primary,
    minimal: '#F5A623',
  }[assistance];

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
        <View style={[tl.assistLine, { backgroundColor: assistanceColor + '50' }]} />
        <View style={[tl.assistBadge, { backgroundColor: assistanceColor + '20', borderColor: assistanceColor + '50' }]}>
          <Text style={[tl.assistText, { color: assistanceColor }]}>
            {assistance.toUpperCase()} ASSIST
          </Text>
        </View>
        <Text style={[tl.assistDesc, { color: assistanceColor + 'bb' }]}>
          {interval === 0 ? 'Pick the exact year' : `Select a ${interval}-year interval`}
        </Text>
        <View style={[tl.assistLine, { backgroundColor: assistanceColor + '50' }]} />
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
              ? assistanceColor
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
                    ? assistanceColor
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

          {/* Vänster swipe-pil — pulserande gold-glyph utanför rutans
              vänsterkant. right: '50%' anchorar på timeline-mitten,
              marginRight skiftar till vänster om rutan. */}
          <Animated.View style={{
            position: 'absolute',
            top: SELECTOR_TOP + (SELECTOR_H - 36) / 2,
            right: '50%',
            marginRight: selectorWidth / 2 + 6,
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: arrowPulse,
            transform: [{ scale: arrowScale }],
          }}>
            <Text style={tl.swipeArrow}>‹</Text>
          </Animated.View>

          {/* Höger swipe-pil — speglar vänster, left: '50%' + marginLeft */}
          <Animated.View style={{
            position: 'absolute',
            top: SELECTOR_TOP + (SELECTOR_H - 36) / 2,
            left: '50%',
            marginLeft: selectorWidth / 2 + 6,
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: arrowPulse,
            transform: [{ scale: arrowScale }],
          }}>
            <Text style={tl.swipeArrow}>›</Text>
          </Animated.View>
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
  // Pulserande gold-pilar utanför selector-rutan. textShadow ger en mjuk
  // glow som matchar rutans gold-shadow så elementen hör visuellt ihop.
  swipeArrow: {
    fontSize: 38,
    fontWeight: '900',
    color: BOX_COLOR,
    lineHeight: 38,
    textShadowColor: BOX_COLOR,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});

// ─── Main Quiz Screen ─────────────────────────────────────────────────────────

type TurnOrderPlayer = {
  id: string;
  name: string;
  emoji?: string;
  avatarUri?: string;
  // Per-player assistance — driver TimelineSelector:s svarsruta-intervall
  // (full=5 år, standard=3 år, minimal=1 år) när det är spelarens tur.
  assistance?: AssistanceLevel;
  age?: number;
};

export default function QuizScreen() {
  const params = useLocalSearchParams<{
    assistance?: string;
    age?: string;
    gameMode?: 'pass-the-phone' | 'individual-devices';
    players?: string;
    roundsCount?: string;
    roomCode?: string;
    eraFrom?: string;
    eraTo?: string;
    answerResponseSeconds?: string;
    youtubeEnabled?: string;
    spotifyEnabled?: string;
  }>();
  // Default assistance från URL-param — fallback om turnOrder-spelaren
  // saknar egen assistance-flagga. Per-player-värdet från turnOrder:n
  // har företräde när det är satt (= bygg-tid sätts av Lobby).
  const fallbackAssistance = (params.assistance ?? 'standard') as AssistanceLevel;
  const age = parseInt(params.age ?? '30');
  const gameMode = params.gameMode ?? 'pass-the-phone';
  // Initial answerResponseSeconds från Lobby-param. Spelaren kan justera
  // mellan ronder via GetReadyIntro:s settings-block, så vi håller värdet
  // som state istället för konst. Endast 15/30/45/60 är giltiga (= host:s
  // val i Lobby), default 30 om paramet saknas vid direkt-nav.
  const initialResponseSeconds = (() => {
    const parsed = parseInt(String(params.answerResponseSeconds ?? '30'), 10);
    return [15, 30, 45, 60].includes(parsed) ? (parsed as 15 | 30 | 45 | 60) : 30;
  })();
  const [responseSeconds, setResponseSeconds] = useState<15 | 30 | 45 | 60>(
    initialResponseSeconds,
  );
  // Antal rundor sätts av host i Lobby (slider 3–20, default 10). Fallback 5
  // om param saknas — t.ex. direkt-nav till /quiz utan att gå via Lobby.
  // SEED_QUESTIONS har 5 frågor i mock; för totalRounds > 5 cyklas listan via
  // modulo nedan tills riktig fråge-bank finns på plats.
  const totalRounds = Math.max(1, parseInt(String(params.roundsCount ?? '5'), 10));
  // Game era — host:s valda år-spann i Lobby (post-clamp mot youngest player).
  // Frågor filtreras på correctYear ∈ [eraFrom, eraTo] så bara perioderna
  // host valt visas i spelet. Defaults till maximalt range om params saknas
  // (t.ex. direkt-nav till /quiz utan Lobby).
  const eraFrom = parseInt(String(params.eraFrom ?? '1900'), 10);
  const eraTo = parseInt(String(params.eraTo ?? new Date().getFullYear()), 10);
  // Game Connections-källor från Lobby. Default till YouTube=on, Spotify=off
  // vid direkt-nav (utan Lobby) så MediaPlayer-stuben renderar klipp för
  // mock-frågor med youtubeClips. Stränga 'true'-jämförelser så ev. tomma
  // params inte falskt aktiverar Spotify.
  const youtubeEnabled = (params.youtubeEnabled ?? 'true') === 'true';
  const spotifyEnabled = params.spotifyEnabled === 'true';
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

  // Pool av frågor för spelet, organiserad i ROUND-BLOCKS:
  //
  //   Pass-the-Phone-regel: alla spelare i samma rond ska få samma fråge-TYP
  //   (alla får musik, eller alla får bild) men olika ITEMS. Mellan ronder
  //   växlar typen.
  //
  //   Pool-struktur (med 4 spelare per rond, alternerande typ):
  //     Round 0 (block 0, type=music): music[0], music[1], music[2], music[3]
  //     Round 1 (block 1, type=image): image[0], image[1], image[2], image[3]
  //     Round 2 (block 2, type=music): music[4], music[5], music[0], music[1] (cykling)
  //     Round 3 (block 3, type=image): image[4], image[5], image[6], image[7]
  //
  //   Individual Devices (parallel play): alla spelare svarar samma fråga
  //   samtidigt — round-block-strukturen är inte semantiskt nödvändig där men
  //   bryter ingenting heller. Kommer behöva omdesignas separat när Individual
  //   Devices flödet kopplas in (parkerad per Peter 2026-05-11).
  //
  // MÅSTE deklareras EFTER `turnOrder` — annars TDZ-error eftersom deps
  // läser turnOrder.length innan const är initialiserad.
  const gameQuestions = useMemo<QuizQuestion[]>(() => {
    const inEra = SEED_QUESTIONS.filter(
      (q) => q.correctYear >= eraFrom && q.correctYear <= eraTo,
    );
    const musicPool: QuizQuestion[] = inEra.length > 0 ? inEra : SEED_QUESTIONS;
    const imagePool: QuizQuestion[] = IMAGE_SEED_QUESTIONS;

    const playerCount = Math.max(1, turnOrder.length);
    const hasMusic = musicPool.length > 0;
    const hasImage = imagePool.length > 0;

    // Edge cases: om en pool är tom, kör bara den andra. Om båda tomma →
    // fallback till SEED_QUESTIONS (vilket är musik som hardcoded mock).
    if (!hasMusic && !hasImage) return SEED_QUESTIONS;

    // Bygg pool täckande hela spelet utan modulo-cykling i UI-laget.
    // questionIndex stiger till totalRounds × playerCount; vi bygger N block
    // där N = totalRounds.
    const mixed: QuizQuestion[] = [];
    for (let block = 0; block < totalRounds; block++) {
      // Alternera musik ↔ bild per block. Om bara en typ finns, använd alltid den.
      const isMusicBlock = hasMusic && hasImage
        ? block % 2 === 0
        : hasMusic;
      const pool = isMusicBlock ? musicPool : imagePool;
      // Cyklisk indexering inom poolen — items kan upprepas om pool < block*players,
      // men varje block:s spelare får olika items (det är det viktiga för
      // round-paritet).
      for (let q = 0; q < playerCount; q++) {
        const idx = (block * playerCount + q) % pool.length;
        mixed.push(pool[idx]);
      }
    }
    return mixed.length > 0 ? mixed : SEED_QUESTIONS;
  }, [eraFrom, eraTo, turnOrder.length, totalRounds]);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  // Aktuell spelares assistance — driver svarsruta-intervallet (full=5 år,
  // standard=3 år, minimal=1 år) per rond. Faller tillbaka till fallback-
  // Assistance om turnOrder-payload saknar fältet (legacy-data).
  const currentAssistance: AssistanceLevel =
    turnOrder[currentPlayerIndex]?.assistance ?? fallbackAssistance;
  // Initial fas är 'intro' när vi har en turordning (gäller båda lägena vid
  // spelstart). Faller tillbaka till 'question' om payload saknas/parse-failar.
  // 'countdown' fas:as in efter intro:n när användaren tappar play-knappen —
  // visar 3-2-1-nedräkning i en stor Q-logga innan question-vyn dyker upp.
  // 'awaiting' fas:as in efter Confirm — TimelineSelector låses men reveal-
  // feedbacken döljs tills timer:n går till 0. Det ger alla spelare samma
  // tidsbudget oavsett om de svarar tidigt eller sent.
  const [phase, setPhase] = useState<'intro' | 'countdown' | 'question' | 'awaiting' | 'reveal' | 'leaderboard'>(
    turnOrder.length > 0 ? 'intro' : 'question',
  );
  // Spelare som kommer efter current i turordningen (med wrap-around till
  // början). Drivs av Get-Ready-skärmens "Then: …"-rad så spelarna ser kön.
  const queue = useMemo<TurnOrderPlayer[]>(() => {
    if (turnOrder.length <= 1) return [];
    return [
      ...turnOrder.slice(currentPlayerIndex + 1),
      ...turnOrder.slice(0, currentPlayerIndex),
    ];
  }, [turnOrder, currentPlayerIndex]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  // Senaste valda år från TimelineSelector (uppdateras vid varje scroll-tick).
  // Quiz-skärmens egna Confirm-knapp läser detta när användaren trycker submit.
  const [pendingYear, setPendingYear] = useState<number | null>(null);
  const [rounds, setRounds] = useState<RoundResult[]>([]);
  // Bekräftad svarstid i sekunder med 2-decimals-precision. Sätts via
  // Date.now()-diff i handleConfirm — setInterval ger bara sekund-precision
  // så vi behöver tidsstämpla separat. Driver:
  //   • avatar-markören på timer-bar:en (placerad vid elapsed/30 av bredden)
  //   • "Answer time: X.YYs"-raden i feedback-kortet vid rätt svar
  const [confirmedTimeUsed, setConfirmedTimeUsed] = useState<number | null>(null);

  // ── Bild-fråge-state ───────────────────────────────────────────────────
  // Förlik state med musik-flödet:
  //   • pendingNameOption = motsvarighet till pendingYear (preliminärt val
  //     i Final Selection, kan ändras tills Confirm tryckts).
  //   • confirmedNameOption = motsvarighet till selectedYear post-Confirm
  //     (låst, driver reveal-feedbacken). Null vid time-out → reveal visar
  //     ✗ + "Correct: X" utan "You chose"-rad.
  const [pendingNameOption, setPendingNameOption] = useState<ImageNameOption | null>(null);
  const [confirmedNameOption, setConfirmedNameOption] = useState<ImageNameOption | null>(null);

  // ── Multiplayer state ──────────────────────────────────────────────────
  // Per-runda-poäng (= scores för senaste avslutade fråga). Aggregerade
  // per-spelare-totals härleds från allRoundScoresHistory via gameTotals.
  const [currentRoundScores, setCurrentRoundScores] = useState<RoundScore[]>([]);
  const [allRoundScoresHistory, setAllRoundScoresHistory] = useState<RoundScore[][]>([]);
  const [playerHcpChanges, setPlayerHcpChanges] = useState<Record<string, HcpChange>>({});

  // Spel-start: trackas en gång när QuizScreen mountas (router pushar
  // hit från Lobby:s "Start Game"-flöde). Region/land sätts av
  // analytics-vendor:n på dashboard-sidan, behöver inte skickas här.
  useEffect(() => {
    track('game_started', { assistance: fallbackAssistance });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "YOU"-spelare (hostar spelet). Läser namn + emoji från turnOrder[0]
  // (= host i mock-setupen) så leaderboarden visar host:s riktiga avatar/
  // namn istället för hardcoded "You" / 🎮. Faller tillbaka till generic
  // "You" / 🎮 om turnOrder är tom (defensiv vid direkt-nav till /quiz
  // utan Lobby).
  const hostFromTurn = turnOrder[0];
  const youPlayer: LeaderboardPlayer = useMemo(
    () => ({
      id: 'you',
      name: hostFromTurn?.name ?? 'You',
      emoji: hostFromTurn?.emoji ?? '🎮',
      assistance: fallbackAssistance,
      age: hostFromTurn?.age ?? age,
      isYou: true,
      isHost: true,
    }),
    [hostFromTurn?.name, hostFromTurn?.emoji, hostFromTurn?.age, fallbackAssistance, age],
  );
  // gamePlayers = den faktiska spelarlistan i detta spel.
  // Pass-the-Phone: alla spelare finns i turnOrder. Visa dem i leaderboarden
  // istället för MOCK_OPPONENTS (som inte spelar i pass-the-phone).
  // Direkt-nav (turnOrder tom) faller tillbaka till [you + mocks].
  const gamePlayers: LeaderboardPlayer[] = useMemo(() => {
    if (turnOrder.length > 0) {
      return turnOrder.map((p, i) => ({
        id: p.id,
        name: p.name,
        emoji: p.emoji ?? '👤',
        assistance: p.assistance ?? fallbackAssistance,
        age: p.age ?? age,
        isYou: i === 0,
        isHost: i === 0,
      }));
    }
    return [youPlayer, ...MOCK_OPPONENTS];
  }, [turnOrder, youPlayer, fallbackAssistance, age]);

  // Aggregera per-spelare-totals direkt från allRoundScoresHistory så
  // leaderboarden alltid speglar exakt vilka som faktiskt har scoreats —
  // ingen mock-spelare räknas upp om de inte har en post i history.
  const gameTotals: Record<string, number> = useMemo(() => {
    const totals: Record<string, number> = {};
    allRoundScoresHistory.forEach((round) => {
      round.forEach((s) => {
        totals[s.playerId] = (totals[s.playerId] ?? 0) + s.points;
      });
    });
    return totals;
  }, [allRoundScoresHistory]);

  const allPlayers: LeaderboardPlayer[] = gamePlayers;

  // Host:s id (= "your" perspektiv från denna enhet). Pass-the-phone:
  // turnOrder[0]; direkt-nav fallback: 'you'.
  const hostId = turnOrder[0]?.id ?? 'you';
  // Derived host-total — ersätter den tidigare totalPoints-state:n. Räknas
  // alltid mot host:s id i gameTotals så host:s "your" total reflekterar
  // bara sina egna scoreade ronder, inte andras (kritiskt i pass-the-phone).
  const totalPoints = gameTotals[hostId] ?? 0;

  // Live-leaderboard till GetReadyIntro:s utfällbara block. Aggregerar
  // allRoundScoresHistory per spelare till position/poäng/rounds/correct/
  // avg/last response. Sortering: poäng desc → avg response asc (ties bryts
  // av snabbast genomsnitt).
  const liveLeaderboard = useMemo(() => {
    const totalsMap: Record<string, number> = gameTotals;
    const entries = gamePlayers.map((p) => {
      const playerScores: RoundScore[] = allRoundScoresHistory.flatMap((round) =>
        round.filter((s) => s.playerId === p.id),
      );
      const correctAnswers = playerScores.filter((s) => s.correct).length;
      const incorrectAnswers = playerScores.length - correctAnswers;
      const avgResponseSeconds = playerScores.length > 0
        ? playerScores.reduce((sum, s) => sum + s.timeUsed, 0) / playerScores.length
        : 0;
      const lastResponseSeconds = playerScores.length > 0
        ? playerScores[playerScores.length - 1].timeUsed
        : null;
      // Senaste 5 utfallen, äldst → nyast (slice tar upp till 5 sista i
      // historik-ordning). Renderas som färgade dotts/glyphs i leaderboard.
      const lastFiveResults = playerScores.slice(-5).map((s) => s.correct);
      return {
        playerId: p.id,
        name: p.name,
        emoji: p.emoji,
        age: p.age,
        assistance: p.assistance,
        points: totalsMap[p.id] ?? 0,
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
  }, [gamePlayers, gameTotals, allRoundScoresHistory]);

  const timerRef = useRef<any>(null);
  // pulseAnim driver opacity:n på timer-progress-baren när tiden
  // är kritisk (≤5s). Default 1 = full opacity, oscillerar mot 0.55 i loop.
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Spring-in-animation för inline reveal-blocket (svar-card + result-row).
  // Triggas när phase växlar till 'reveal' så användaren ser
  // svaret poppa in. Kopierad logik från den borttagna RevealScreen-komponenten.
  const revealScale = useRef(new Animated.Value(0.6)).current;
  const revealOpacity = useRef(new Animated.Value(0)).current;
  // Confirm-knappens blue glow + scale-pulse — körs i loop medan question-
  // fasen är aktiv och pendingYear är giltig (knappen är tappbar). Speglar
  // Lobby:s Start Game-CTA + GetReady:s play-knapp.
  const confirmPulse = useRef(new Animated.Value(1)).current;
  const confirmGlow = useRef(new Animated.Value(0.35)).current;
  // Pulserande ring runt sekund-räknaren till höger om timer-bar:en. Färgen
  // ärvs från timerColor (primary → warning → error). Två separata loops:
  // scale (subtil "andning") + halo-opacity (glow-effekten bakom ringen).
  const timerRingPulse = useRef(new Animated.Value(1)).current;
  const timerRingGlow = useRef(new Animated.Value(0.3)).current;
  // Förfluten tid med 2-decimals-precision (ms) — driver stopwatch-displayen
  // under timer-bar:en (räknar UPPÅT från 00.00 mot responseSeconds). Drivs
  // av en 20 Hz tick som läser Date.now()-diff så värdet är drift-fritt.
  // Initialiseras till 0 — visas som "00.00" innan timer:n startar.
  const [decimalElapsedMs, setDecimalElapsedMs] = useState<number>(0);

  const question: QuizQuestion = gameQuestions[questionIndex % gameQuestions.length];
  const isImageQuestion = question.type === 'image';
  const isLastQuestion = questionIndex === totalQuestions - 1;
  // Aktiv media-källa för aktuell fråga. Returneras `kind: 'none'` om
  // host stängt av alla källor eller frågan saknar curerade klipp —
  // MediaPlayer renderar då NoSourcePlayer-placeholder istället för att
  // krascha. Memoiseras på question-id + lobby-toggles så pickMediaSource
  // inte körs varje render-cykel under en pågående fråga.
  const mediaSource = useMemo(
    () =>
      pickMediaSource(
        {
          // Image-frågor har inga YouTube-klipp; pickMediaSource returnerar
          // då 'none' och MediaPlayer renderas inte (image-grenen ovan).
          youtubeClips:
            question.type === 'timeline' ? question.youtubeClips : undefined,
        },
        { youtubeEnabled, spotifyEnabled, gameMode },
      ),
    [question, youtubeEnabled, spotifyEnabled, gameMode],
  );
  // Aktuell spelares namn i Pass-the-Phone-rotationen — visas subtilt i fråge-
  // kortet ("Answering: {namn}"). Skip:as för Individual Devices (varje
  // spelare är på sin egen enhet och vet redan vem de är).
  const currentPlayerName = turnOrder[currentPlayerIndex]?.name;

  // Ref för exakt question-start-tidpunkt (ms) — används för att räkna ut
  // svarstiden med 2 decimaler vid Confirm. setInterval ger bara sekund-
  // precision så vi måste timestampa separat med Date.now().
  const questionStartMsRef = useRef<number>(0);
  // Smooth bar-progress 1 → 0 över exakt 30 s, animerad via Animated.timing
  // med RAF (requestAnimationFrame). Körs OBEROENDE av setInterval-baserade
  // sekund-räknaren så bar:en aldrig "fryser" eller stepar — kritiskt för
  // upplevelsen att tiden flyter på även medan handleConfirm batchar
  // setStates och React re-renderar action-knappen. Krävs för Individual-
  // Devices-flödet där flera spelare confirmar vid olika tidpunkter.
  const timerProgressAnim = useRef(new Animated.Value(1)).current;

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(responseSeconds);
    questionStartMsRef.current = Date.now();
    // Native-driver kan inte hantera procentuell width, så useNativeDriver:
    // false. Animated.timing schemaläggs ändå via RAF så bar:en uppdateras
    // varje frame oberoende av setInterval-tick:n eller övriga JS-händelser.
    timerProgressAnim.stopAnimation();
    timerProgressAnim.setValue(1);
    Animated.timing(timerProgressAnim, {
      toValue: 0,
      duration: responseSeconds * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
    // Sekund-räknaren (1 Hz) driver bara den siffer-baserade "23s"-labeln +
    // existing scoring/time-out-logik som jobbar i hela sekunder. Bar:en
    // styrs separat av Animated.Value ovan.
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, [questionIndex, timerProgressAnim, responseSeconds]);

  // Unmount-cleanup så timern inte läcker om component unmounts (t.ex.
  // Quit Game mid-question). Lever utanför phase-baserade effects.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerProgressAnim.stopAnimation();
    };
  }, [timerProgressAnim]);

  useEffect(() => {
    if (timeLeft !== 0) return;
    if (phase === 'awaiting') {
      // Användaren har redan confirmat — runda + poäng är redan registrerade
      // i handleConfirm. Bara visa reveal-feedbacken när tiden går ut.
      setPhase('reveal');
      return;
    }
    if (phase === 'question') {
      // Time ran out utan Confirm — registrera ronden som missad (0 poäng,
      // inget giltigt svar) och gå direkt till reveal. För image-frågor
      // sätts correctYear/selectedYear=0 (RoundResult-shapen är musik-
      // formad; year-fälten ignoreras i image-reveal-rendering).
      if (question.type === 'timeline') {
        const defaultGuess = new Date().getFullYear() - 20;
        setSelectedYear(defaultGuess);
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
            timeUsed: responseSeconds,
          },
        ]);
      } else {
        // Image time-out: confirmedNameOption förblir null, reveal visar
        // ✗ Wrong Answer + "Correct: {displayName}".
        setRounds((prev) => [
          ...prev,
          {
            questionNumber: questionIndex + 1,
            category: question.category,
            question: question.question,
            correctYear: 0,
            selectedYear: 0,
            correct: false,
            points: 0,
            timeUsed: responseSeconds,
          },
        ]);
      }
      recordRoundScore(0, false, responseSeconds);
      setPhase('reveal');
    }
  }, [timeLeft]);

  // Registrera score:n för en avslutad fråga. I Pass-the-Phone (eller när
  // turnOrder är satt) skapar vi en post för ENDAST den aktiva spelaren —
  // mock-motspelare auto-genereras inte eftersom alla spelare är riktiga
  // och delar denna enhet (en spelare i taget). Direkt-nav till /quiz utan
  // turnOrder simulerar fortfarande mock-motspelare för gameplay-testning.
  const recordRoundScore = (yourPoints: number, yourCorrect: boolean, yourTimeUsed: number) => {
    const activePlayerId = turnOrder[currentPlayerIndex]?.id ?? 'you';
    const yourScore: RoundScore = {
      playerId: activePlayerId,
      points: yourPoints,
      correct: yourCorrect,
      timeUsed: yourTimeUsed,
    };
    let allScores: RoundScore[] = [yourScore];
    // Mock-motspelare genereras BARA vid direkt-nav (tom turnOrder).
    if (turnOrder.length === 0) {
      const opponentScores: RoundScore[] = MOCK_OPPONENTS.map((opp) => {
        const gen = generateOpponentRoundScore(opp.assistance);
        return {
          playerId: opp.id,
          points: gen.points,
          correct: gen.correct,
          timeUsed: generateOpponentTimeUsed(),
        };
      });
      allScores = [yourScore, ...opponentScores];
    }
    setCurrentRoundScores(allScores);
    setAllRoundScoresHistory((prev) => [...prev, allScores]);
  };

  useEffect(() => {
    // Timern startas vid 'question'-entry (efter intro/countdown). När
    // användaren bekräftar svaret går phase → 'awaiting' men timern ska
    // FORTSÄTTA ticka — alla spelare får samma tidsbudget oavsett när de
    // bekräftade. Därför ingen cleanup här som klipper intervallet vid
    // phase-byte; intervallet self-clearas när timeLeft hits 0 (eller via
    // unmount-cleanup ovan).
    if (phase !== 'question') return;
    startTimer();
  }, [questionIndex, phase]);

  useEffect(() => {
    // Pulsa progress-barens opacity (1 → 0.55 → 1) när ≤5s kvar för att
    // signalera att tiden är kritisk. Native driver eftersom det är ren
    // opacity-animation. Gäller både question OCH awaiting (timer:n tickar
    // ned till 0 i båda faserna).
    if (timeLeft <= 5 && (phase === 'question' || phase === 'awaiting')) {
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

  // Pulserande ring + glow runt sekund-räknaren — körs i alla aktiva timer-
  // faser ('question' + 'awaiting'). Stoppas i intro/countdown/reveal/
  // leaderboard så ringen står still när timern inte tickar.
  useEffect(() => {
    const isActive = phase === 'question' || phase === 'awaiting';
    if (!isActive) {
      timerRingPulse.stopAnimation();
      timerRingPulse.setValue(1);
      timerRingGlow.stopAnimation();
      timerRingGlow.setValue(0.3);
      return;
    }
    const scaleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(timerRingPulse, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(timerRingPulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(timerRingGlow, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        Animated.timing(timerRingGlow, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ]),
    );
    scaleLoop.start();
    glowLoop.start();
    return () => {
      scaleLoop.stop();
      glowLoop.stop();
    };
  }, [phase, timerRingPulse, timerRingGlow]);

  // 2-decimal countdown-tick (20 Hz). Körs ENDAST i 'question'-fasen — så
  // fort spelaren confirmar (phase → 'awaiting') stoppas tick:n och displayen
  // fryses på exakt confirm-värdet (sätts explicit i handleConfirm). I
  // intro/countdown/reveal/leaderboard återställs till "30.00".
  useEffect(() => {
    const totalMs = responseSeconds * 1000;
    if (phase !== 'question') {
      if (phase === 'intro' || phase === 'countdown') {
        setDecimalElapsedMs(0);
      }
      return;
    }
    const tick = () => {
      const elapsedMs = Date.now() - questionStartMsRef.current;
      const clamped = Math.min(totalMs, Math.max(0, elapsedMs));
      setDecimalElapsedMs(clamped);
    };
    tick();
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, [phase, questionIndex, responseSeconds]);

  // "Kan användaren confirma just nu?" — discriminerad-union-helper.
  // Musik: pendingYear satt. Bild: pendingNameOption satt.
  const canConfirm = isImageQuestion
    ? pendingNameOption !== null
    : pendingYear !== null;

  // Confirm-knappens scale + glow-loop. Körs medan phase === 'question' OCH
  // ett svar är preliminärt valt (knappen är tappbar). Stoppas i andra faser så
  // disabled-knappen står still — pulserande disabled-knapp läses som "klick-
  // bar men inte". Båda loops använder native driver (transform/opacity).
  useEffect(() => {
    if (phase !== 'question' || !canConfirm) {
      confirmPulse.stopAnimation();
      confirmPulse.setValue(1);
      confirmGlow.stopAnimation();
      confirmGlow.setValue(0.35);
      return;
    }
    const scaleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(confirmPulse, { toValue: 1.04, duration: 800, useNativeDriver: true }),
        Animated.timing(confirmPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(confirmGlow, { toValue: 0.8, duration: 800, useNativeDriver: true }),
        Animated.timing(confirmGlow, { toValue: 0.35, duration: 800, useNativeDriver: true }),
      ]),
    );
    scaleLoop.start();
    glowLoop.start();
    return () => {
      scaleLoop.stop();
      glowLoop.stop();
    };
  }, [phase, canConfirm, confirmPulse, confirmGlow]);

  const handleConfirm = (year: number) => {
    // Defensiv guard: handleConfirm är musik-specifik (year-baserad). Image-
    // frågor anropar handleConfirmName istället. Skydd mot fel-binding i UI.
    if (question.type !== 'timeline') return;
    // Timer:n stoppas INTE — alla spelare får samma tidsbudget oavsett när
    // de bekräftade. Reveal-feedbacken visas först när timer:n går till 0
    // (i useEffect:en på timeLeft nedan).
    const interval = getIntervalForAssistance(currentAssistance);
    const correct = isCorrect(year, question.correctYear, interval, eraFrom, eraTo);
    const pts = calculatePoints(timeLeft, correct, responseSeconds);
    // 2-decimals svarstid via Date.now()-diff (questionStartMsRef sätts i
    // startTimer). Cap:as till responseSeconds så ev. clock drift inte ger
    // > totalSeconds. Används både till stopwatch-display, reveal-card och
    // leaderboard-aggregat — heltals-derived `responseSeconds - timeLeft`
    // undviks medvetet eftersom den ger "x.00" i AVG/LAST-kolumnerna.
    const totalMs = responseSeconds * 1000;
    const exactElapsedMs = Math.max(0, Date.now() - questionStartMsRef.current);
    const exactElapsedSec = Math.min(responseSeconds, exactElapsedMs / 1000);
    setConfirmedTimeUsed(exactElapsedSec);
    // Frys stopwatch-displayen på EXAKT confirm-värdet. Tick-effekten ovan
    // stoppar (phase blir 'awaiting' direkt efter), men det senast tickade
    // värdet kan vara upp till 50 ms före confirm. Genom att skriva exakt
    // elapsed här matchar displayen confirmed time + avatar-markörens
    // x-position på timer-bar:en.
    const elapsedAtConfirm = Math.min(totalMs, Math.max(0, exactElapsedMs));
    setDecimalElapsedMs(elapsedAtConfirm);
    setSelectedYear(year);
    // totalPoints uppdateras automatiskt via gameTotals (deriveras från
    // history när recordRoundScore tillsätter en post nedan).
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
        timeUsed: exactElapsedSec,
      },
    ]);
    // Registrera score:n för aktuell spelare (och i direkt-nav-fallet
    // även mock-motspelarnas auto-genererade poäng). Skickar 2-decimals-
    // exakt elapsed så leaderboardens AVG/LAST-kolumner visar variation.
    recordRoundScore(pts, correct, exactElapsedSec);
    setPhase('awaiting');
  };

  // Image-fråge-Confirm: speglar handleConfirm men för name-svar.
  // correct = opt.isCorrect (pre-baked från distractor-builderns rätt-flagga).
  const handleConfirmName = (opt: ImageNameOption) => {
    if (question.type !== 'image') return;
    const correct = opt.isCorrect;
    const pts = calculatePoints(timeLeft, correct, responseSeconds);
    const totalMs = responseSeconds * 1000;
    const exactElapsedMs = Math.max(0, Date.now() - questionStartMsRef.current);
    const exactElapsedSec = Math.min(responseSeconds, exactElapsedMs / 1000);
    setConfirmedTimeUsed(exactElapsedSec);
    const elapsedAtConfirm = Math.min(totalMs, Math.max(0, exactElapsedMs));
    setDecimalElapsedMs(elapsedAtConfirm);
    setConfirmedNameOption(opt);
    // RoundResult-shapen är musik-formad (correctYear/selectedYear som number).
    // Image-rundor sätter 0 för year-fälten — reveal-renderingen läser
    // displayName från question istället för selectedYear/correctYear.
    setRounds((prev) => [
      ...prev,
      {
        questionNumber: questionIndex + 1,
        category: question.category,
        question: question.question,
        correctYear: 0,
        selectedYear: 0,
        correct,
        points: pts,
        timeUsed: exactElapsedSec,
      },
    ]);
    recordRoundScore(pts, correct, exactElapsedSec);
    setPhase('awaiting');
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
    setConfirmedTimeUsed(null);
    // Reset image-fråge-state så nästa fråga (oavsett typ) startar rent.
    setPendingNameOption(null);
    setConfirmedNameOption(null);
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
    // TODO (Fas 6): beräkna riktig HCP-förändring från totalPoints + assistance + ålder
    const hcpBefore = 99;
    const hcpDelta = Math.round(totalPoints / 500); // tillfällig: 1 HCP-poäng per 500 pts
    const hcpAfter = Math.max(1, hcpBefore - hcpDelta);

    const result: GameResult = {
      id: `g-${Date.now()}`,
      date: new Date().toISOString(),
      totalPoints,
      rounds,
      assistance: fallbackAssistance,
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

      // Iterera över alla gamePlayers (turnOrder i pass-the-phone, mocks
      // vid direkt-nav). gameTotals har redan per-id summorna från history.
      gamePlayers.forEach((p) => {
        const total = gameTotals[p.id] ?? 0;
        const delta = Math.round(total / 500);
        const before = p.isHost ? 99 : MOCK_OPPONENT_HCP_BEFORE[p.id] ?? 99;
        changes[p.id] = { before, after: Math.max(1, before - delta) };
      });

      setPlayerHcpChanges(changes);
      saveFinalGame();
      track('game_completed', {
        assistance: fallbackAssistance,
        total_points: totalPoints,
        rounds_played: rounds.length,
      });
    }
  }, [phase, isLastQuestion]);

  // Sista rundans actions: starta nytt rum i Lobby (ev. med samma spelare) eller gå hem.
  // `keepSettings` styr om per-spelare-settings (age/assistance) bärs över från
  // detta spel — settings kan ha redigerats av host i Lobby:n. När false:
  // - Host (you): behåller egen profil-baserad age/assistance (kommer från params).
  // - Övriga registrerade: defaults till standard/30 så Lobby:s profile-merge
  //   senare kan fylla i deras profil-värden vid mount.
  // - Guests: defaults till standard/30 så host får redigera om i Lobby.
  const goToNewLobby = async (reusePlayers: boolean, keepSettings: boolean = true) => {
    // Ladda host-profilen FÖRE players-listan byggs så host:s riktiga
    // playerName + avatar bär in i carry-over (annars hade host:s rad i
    // nya lobby:n stått som 'You'/🎮 tills mergeProfileIntoHost hann fyra).
    const profile = await loadProfile();
    const hostName = profile?.playerName?.trim() || 'You';
    const hostEmoji = profile ? getAvatarEmojiById(profile.selectedAvatarId) : '🎮';
    if (reusePlayers) {
      // Behåll alla spelare från detta spel
      const lobbyPlayers: LobbyPlayer[] = allPlayers.map((p) => ({
        id: p.id,
        name: p.isYou ? hostName : p.name,
        emoji: p.isYou ? hostEmoji : p.emoji,
        isReady: true,
        type: 'registered' as const,
        age: keepSettings || p.isYou ? p.age : 30,
        assistance: keepSettings || p.isYou ? p.assistance : 'standard',
        hcpComplete: true,
        isHost: p.isHost ?? false,
      }));
      await savePendingLobbyPlayers(lobbyPlayers);
    } else {
      // Tom lobby förutom host
      const justHost: LobbyPlayer[] = [{
        id: 'you',
        name: hostName,
        emoji: hostEmoji,
        isReady: true,
        type: 'registered',
        age,
        assistance: fallbackAssistance,
        hcpComplete: true,
        isHost: true,
      }];
      await savePendingLobbyPlayers(justHost);
    }
    const newCode = generateRoomCode();
    // Registrera nya koden som aktivt rum + lagra host:s metadata (samma
    // princip som handleCreateGame på Home-skärmen). currentPlayerCount
    // räknas från carry-over-listan vid reusePlayers=true; annars startar
    // den på 1 (bara host i nya lobbyn). LobbyScreen:s sync-effekter
    // korrigerar countet om SEED_PLAYERS injiceras eller spelare flyttas.
    // TODO (subscription): byt hardcoded `false` mot riktig profile.isPremium.
    const initialCount = reusePlayers ? Math.max(1, allPlayers.length) : 1;
    await registerActiveRoom(newCode, {
      maxPlayers: profile?.maxPlayers ?? 4,
      hostIsPremium: false,
      currentPlayerCount: initialCount,
      hostPlayerName: profile?.playerName ?? '',
    });
    // Färsk leftPlayers-store + lobbyPlayers-store + ejected-store för nya
    // koden — undviker stale test-data och garanterar att non-host:s polling
    // startar tomt utan eject-status från en tidigare session.
    clearLeftPlayers(newCode);
    clearLobbyPlayers(newCode);
    clearLobbySettings(newCode);
    clearEjected(newCode);
    clearGameStarted(newCode);
    router.replace(`/(tabs)/lobby?code=${newCode}&isHost=true`);
  };

  // Sekventiell Alert-flow: först fråga om spelarna ska följa med, sedan
  // (om ja) en uppföljning om per-spelare-settings ska bevaras eftersom de
  // kan ha redigerats av host under spelet/i Lobby:n. iOS Alert har max 3
  // knappar utan radbryt — därav två steg istället för 4-vägs-prompt.
  const askKeepSettingsThenGo = () => {
    Alert.alert(
      'Keep same settings per player?',
      'Settings (assistance level + age) may have been edited during this game. Keep them or reset to defaults?',
      [
        { text: 'Reset', onPress: () => goToNewLobby(true, false) },
        { text: 'Keep settings', onPress: () => goToNewLobby(true, true) },
      ],
    );
  };

  const handlePlayAgain = async () => {
    // Host Game Credits-gate (samma som Home:s Create Game + Lobby:s Start
    // Game): blockera Play Again om både Free och Extras är 0. loadProfile()
    // refreshar Free-saldot vid första load efter midnatt CET så vi alltid
    // jämför mot aktuellt värde. Bättre att fånga det här innan vi visar
    // re-use-players-prompten — annars fyller man i 2 alerts och får sedan
    // blockaden i Lobby:n vid Start Game.
    const freshProfile = await loadProfile();
    const free = freshProfile?.freeGameCredits ?? 0;
    const extras = freshProfile?.gameCredits ?? 0;
    if (free === 0 && extras === 0) {
      Alert.alert(
        'Out of Host Game Credits',
        'You have no credits left for today. Buy extra credits in Store, wait for the daily refresh at midnight CET, or upgrade to a QuizVibe membership for unlimited host games.',
        [
          { text: 'Cancel', style: 'cancel' },
          // Pushar Store UTAN `from=...`-paramet så Store:s Back-knapp fall:er
          // till `router.back()` istället för `router.replace(from)`. Det
          // bevarar /quiz på root Stack:en med Final Leaderboard-state intakt
          // — annars hade replace:n unmountat Quiz-komponenten och spelaren
          // skulle landa på en tom /quiz-vy efter köpet.
          { text: 'Go to Store', onPress: () => router.push('/(tabs)/store?focus=credits') },
        ],
      );
      return;
    }

    Alert.alert(
      'Re-use all players?',
      'Start the next room with the same players, or begin fresh?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start fresh', onPress: () => goToNewLobby(false) },
        { text: 'Yes, keep them', onPress: askKeepSettingsThenGo },
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
          onPress: async () => {
            const code = params.roomCode;
            if (code) {
              await deactivateRoom(code);
              clearLeftPlayers(code);
              clearLobbyPlayers(code);
              clearLobbySettings(code);
              clearEjected(code);
              clearGameStarted(code);
            }
            router.replace('/');
          },
        },
      ],
    );
  };

  // Timer-progress-barens färg byter vid 10s (warning) och 5s (error).
  // Bar:ens BREDD drivs av timerProgressAnim (Animated.Value, RAF-driven).
  // Färgen styrs fortfarande av sekund-räknaren timeLeft eftersom färg-
  // tröskeln är vid hela sekunder.
  const timerColor = timeLeft > 10 ? Colors.primary : timeLeft > 5 ? Colors.warning : Colors.error;
  // Stopwatch:n (decimal-rutan) byter till en lugnare ljusblå ton så fort
  // användaren confirmat (awaiting) OCH stannar blå genom reveal-fasen så
  // den inte byter till varnings-röd när tiden går ut. Question-fasen
  // använder vanlig timerColor så användaren ser tidens-status normalt.
  const STOPWATCH_AWAITING_COLOR = '#8CC1FF';
  const stopwatchColor =
    phase === 'question' ? timerColor : STOPWATCH_AWAITING_COLOR;

  // Get-Ready-skärmen renderas före quiz-UI:t. Vid spelstart för båda lägena,
  // och mellan rundor för Pass-the-phone (ej Individual Devices). Faller
  // tillbaka till 'You' om turnOrder skulle vara tom (defensiv — initial
  // phase-init filtrerar redan bort det fallet).
  if (phase === 'intro') {
    const currentPlayer = turnOrder[currentPlayerIndex] ?? {
      id: 'you',
      name: 'You',
      emoji: '🎮',
    };
    const playerCount = Math.max(1, turnOrder.length);
    const currentRound = Math.floor(questionIndex / playerCount) + 1;
    const currentQuestion = questionIndex + 1;
    // Kö-spelarnas runda och fråge-nummer räknas på den absoluta
    // question-positionen där just den spelaren faktiskt får sin tur
    // (questionIndex + 1 + i, 0-baserat). Cap:a på totalQuestions så
    // wrap-around-spelare i sista rundan som aldrig hinner spela försvinner
    // från listan helt — annars hade vi visat siffror som overshootar.
    // Alla tre arrays slicas parallellt så indexen håller ihop.
    const queueWithCounts = queue
      .map((p, i) => {
        const absoluteQuestion0 = questionIndex + 1 + i; // 0-baserat
        return {
          player: p,
          round: Math.floor(absoluteQuestion0 / playerCount) + 1,
          question: absoluteQuestion0 + 1, // 1-baserat
          withinBudget: absoluteQuestion0 < totalQuestions,
        };
      })
      .filter((entry) => entry.withinBudget);
    const introQueue = queueWithCounts.map((entry) => entry.player);
    const queueRoundNumbers = queueWithCounts.map((entry) => entry.round);
    const queueQuestionNumbers = queueWithCounts.map((entry) => entry.question);
    // Answer response time får BARA ändras vid round-boundary i Pass-the-
    // Phone-läget — dvs när nästa spelare = första i turordningen
    // (currentPlayerIndex === 0 = alla har svarat lika många gånger).
    // Individual Devices skippar intro mellan ronder så där är det alltid
    // adjustable när intro visas (typiskt bara vid game start).
    const responseSecondsLocked =
      gameMode === 'pass-the-phone' && currentPlayerIndex !== 0;
    return (
      <GetReadyIntro
        currentPlayer={currentPlayer}
        queue={introQueue}
        queueRoundNumbers={queueRoundNumbers}
        queueQuestionNumbers={queueQuestionNumbers}
        currentRound={currentRound}
        totalRounds={totalRounds}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        playerCount={playerCount}
        eraFrom={eraFrom}
        eraTo={eraTo}
        answerResponseSeconds={responseSeconds}
        onAnswerResponseSecondsChange={setResponseSeconds}
        responseSecondsLocked={responseSecondsLocked}
        leaderboard={liveLeaderboard}
        onReady={() => setPhase('countdown')}
        onQuit={handleQuitGame}
      />
    );
  }

  // 3-2-1-nedräkning mellan tap på play-knappen i intro:n och fråge-vyn.
  // playerName + playerEmoji från turordningen så Pass-the-Phone-mode
  // anchorar nedräkningen till rätt spelare även medan telefonen lämnas över.
  if (phase === 'countdown') {
    const countdownPlayer = turnOrder[currentPlayerIndex];
    return (
      <CountdownIntro
        playerName={countdownPlayer?.name}
        playerEmoji={countdownPlayer?.emoji}
        onComplete={() => setPhase('question')}
      />
    );
  }

  // Leaderboard renderas UTANFÖR den övergripande ScrollView:n så dess sticky
  // footer (Home + Play Again) kan pinnas vid skärmens nederkant via flex —
  // läggs den inuti parent-scroll:n följer footer:n med upp när användaren
  // scrollar och blir inte längre alltid synlig.
  if (phase === 'leaderboard') {
    return (
      <SafeAreaView style={styles.safe}>
        <RoundLeaderboard
          players={gamePlayers}
          roundScores={currentRoundScores}
          totalsByPlayerId={gameTotals}
          roundNumber={questionIndex + 1}
          totalRounds={totalQuestions}
          onNextRound={handleAdvanceToNextRound}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
          isLastRound={isLastQuestion}
          allRoundScoresHistory={allRoundScoresHistory}
          hcpChanges={isLastQuestion ? playerHcpChanges : undefined}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* phase är här narrowed till 'question' | 'awaiting' | 'reveal'
            (leaderboard fångas av early-return ovan), så ingen extra
            phase-check behövs runt question UI. */}
            {/* MediaPlayer — provider-agnostisk dispatcher som väljer rätt
                impl (YouTube/Spotify/None) baserat på pickMediaSource. Stuben
                i Expo Go visar thumbnail + clip-meta; Phase 4 byter den mot
                en riktig WebView-baserad player utan att röra detta call-
                site. isPlaying håller på genom hela question→awaiting→reveal-
                cykeln (uppspelningen fortsätter tills Next-tab trycks per
                tidigare UX-spec). showVideo gömmer video-frame:n under
                question/awaiting (annars ger thumbnail visuella ledtrådar
                till svaret) och visar den vid reveal. */}
            {isImageQuestion ? (
              <View style={styles.imageMediaCard}>
                {getQuizImage(question.id) ? (
                  <Image
                    key={question.id}
                    source={getQuizImage(question.id)!}
                    style={styles.imageMediaImage}
                    resizeMode="cover"
                  />
                ) : (
                  // Defensiv fallback om assets-mappen saknar förväntad
                  // bild — borde inte hända eftersom quizImageQuestions
                  // genereras från samma fil-lista.
                  <View style={styles.imageMediaPlaceholder} />
                )}
                <ProgressiveCover
                  key={questionIndex}
                  resetKey={questionIndex}
                  profile={{ birthYear: 1990, assistance: currentAssistance }}
                  assistance={currentAssistance}
                  totalSeconds={responseSeconds}
                  isRevealed={phase === 'awaiting' || phase === 'reveal'}
                  logoSize={220}
                />
              </View>
            ) : (
              <MediaPlayer
                source={mediaSource}
                isPlaying={
                  phase === 'question' ||
                  phase === 'awaiting' ||
                  phase === 'reveal'
                }
                showVideo={phase === 'reveal'}
              />
            )}

            {/* Horisontell timer-progress-bar — krymper från 100% → 0% över
                30s, byter färg vid 10s/5s, pulserar i opacity vid ≤5s. Fryses
                vid sin sista bredd när phase=reveal (interval clear:as i
                handleConfirm). Sekunderna kvar visas till höger som ett
                tabular-nums-värde i samma färg som baren. */}
            <View style={styles.timerSection}>
              <View style={styles.timerTrack}>
                {/* Yttre pulse-wrapper håller opacity (native driver). Inre
                    fill håller width (JS driver). Måste separeras på olika
                    Animated.Views — annars markerar native driver noden
                    som "owned" och JS-driver-uppdatering av width kraschar
                    med "Attempting to run JS driven animation on animated
                    node that has been moved to native". */}
                <Animated.View
                  style={[styles.timerFillPulseWrap, { opacity: pulseAnim }]}
                >
                  <Animated.View
                    style={[
                      styles.timerFill,
                      {
                        // Bredden interpoleras från Animated.Value (0 → 1) till
                        // procent (0 % → 100 %) — RAF-driven, så bar:en rör sig
                        // smooth varje frame även när JS-tråden är upptagen med
                        // Confirm-handlerns batch av setStates.
                        width: timerProgressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                        backgroundColor: timerColor,
                      },
                    ]}
                  />
                </Animated.View>
                {/* Avatar-markör vid bekräftad svarstid. timerFill krymper
                    från höger mot vänster (left-anchored fill med width
                    = timeLeft/30). Avataren ska sitta vid fillens HÖGRA
                    kant vid confirm-momentet = (timeLeft/30) av bredden
                    från vänster, dvs (1 − elapsed/30) × 100 %. När timer:n
                    fortsätter ticka krymper fillen förbi avataren. */}
                {confirmedTimeUsed !== null && (
                  <View
                    pointerEvents="none"
                    style={[
                      styles.timerMarker,
                      { left: `${((responseSeconds - confirmedTimeUsed) / responseSeconds) * 100}%` },
                    ]}
                  >
                    {turnOrder[currentPlayerIndex]?.avatarUri ? (
                      <Image
                        source={{ uri: turnOrder[currentPlayerIndex].avatarUri }}
                        style={styles.timerMarkerAvatar}
                      />
                    ) : (
                      <View style={styles.timerMarkerFallback}>
                        <Text style={styles.timerMarkerEmoji}>
                          {turnOrder[currentPlayerIndex]?.emoji ?? '👤'}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
              {/* Höger-siffran sitter i en pulserande ring vars border-färg
                  ärvs från timerColor. Halo:n bakom ger glow på Android som
                  saknar shadowColor-stöd; iOS får dessutom shadow via
                  timerRingHalo:s skugga. */}
              <Animated.View
                style={[
                  styles.timerRingWrap,
                  { transform: [{ scale: timerRingPulse }] },
                ]}
              >
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.timerRingHalo,
                    { backgroundColor: timerColor, opacity: timerRingGlow },
                  ]}
                />
                <View style={[styles.timerRing, { borderColor: timerColor }]}>
                  <Animated.Text
                    style={[
                      styles.timerRingNum,
                      { color: timerColor, opacity: pulseAnim },
                    ]}
                  >
                    {timeLeft}
                  </Animated.Text>
                </View>
              </Animated.View>
            </View>

            {/* 2-decimal countdown under timer-bar:en. Sitter i en glowing
                box vars border + halo färgas av timerColor (primary → warning
                → error). Halo:n pulserar i opacity för cross-platform glow.
                Integer i timerColor (huvudvärde), decimal i textSecondary
                (finish) så hierarkin är tydlig. */}
            <View style={styles.decimalTimerWrap}>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.decimalTimerHalo,
                  { backgroundColor: timerColor, opacity: timerRingGlow },
                ]}
              />
              <View style={[styles.decimalTimerBox, { borderColor: stopwatchColor }]}>
                {/* Wrap-View med integer-höjd centrerar SVG:n vertikalt
                    relativt den stora sekund-siffran (38 px lineHeight). */}
                <View style={styles.decimalTimerIconWrap}>
                  <StopwatchIcon size={32} color={stopwatchColor} />
                </View>
                <Text style={[styles.decimalTimerInt, { color: stopwatchColor }]}>
                  {String(Math.floor(decimalElapsedMs / 1000)).padStart(2, '0')}
                </Text>
                <Text style={[styles.decimalTimerDec, { color: Colors.textSecondary }]}>
                  .{String(Math.floor((decimalElapsedMs % 1000) / 10)).padStart(2, '0')}
                </Text>
              </View>
            </View>

            <View style={styles.questionCard}>
              {/* Top-rad: Question-räkneverk vänster + Answering-pillen höger.
                  Pass-the-Phone-only — Individual Devices har spelaren på
                  egen enhet och vet redan vem de är. */}
              <View style={styles.questionTopRow}>
                <Text style={styles.questionMeta}>
                  Question {questionIndex + 1} of {totalQuestions}
                </Text>
                {gameMode === 'pass-the-phone' && currentPlayerName && (
                  <View style={styles.answeringStack}>
                    <Text style={styles.answeringLabel}>Answering:</Text>
                    <Text style={styles.answeringPlayerName} numberOfLines={1}>
                      {currentPlayerName}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.questionTextWrap}>
                {/* Music-frågor split:as i två rader: stor headline "Which
                    year" + bevarad sub-rad "was this song released?". Övriga
                    kategorier (kommande Capitals/Persons etc.) renderar
                    questiontexten som en enda rad. */}
                {question.category === 'Music' ? (
                  <>
                    <Text style={styles.questionTextHeadline}>Which year</Text>
                    <Text style={styles.questionText}>
                      was this song released?
                    </Text>
                  </>
                ) : (
                  <Text style={styles.questionText}>{question.question}</Text>
                )}
              </View>
            </View>

            {/* Svarsmetod beror på fråge-typ:
                • timeline → TimelineSelector (år-svar)
                • image    → ImageAnswerBlock (Letter Grid → Final Selection)
                Disabled-states följer phase: båda låsta i awaiting + reveal
                så svar inte kan ändras efter Confirm. */}
            {question.type === 'timeline' ? (
              <TimelineSelector
                key={`${questionIndex}-${currentAssistance}`}
                assistance={currentAssistance}
                eraFrom={eraFrom}
                eraTo={eraTo}
                onYearChange={setPendingYear}
                disabled={phase === 'awaiting' || phase === 'reveal'}
              />
            ) : (() => {
              // Per-spelare-variant baserat på assistance:
              //   full → prefix-3 / standard → prefix-2 / minimal → prefix-1
              const variantKey: ImageVariantKey =
                currentAssistance === 'full'
                  ? 'prefix-3'
                  : currentAssistance === 'minimal'
                    ? 'prefix-1'
                    : 'prefix-2';
              const variant = question.variants[variantKey];
              return (
                <ImageAnswerBlock
                  question={variant}
                  phase={phase}
                  pendingName={pendingNameOption}
                  confirmedName={confirmedNameOption}
                  isTimedOut={phase === 'reveal' && confirmedNameOption === null}
                  onNameSelect={setPendingNameOption}
                  resetKey={`${questionIndex}-${currentAssistance}`}
                />
              );
            })()}

            {/* Inline reveal-feedback: green vid rätt, red vid fel. Visas
                ENDAST i 'reveal'-fasen (= efter timer hit 0) — under awaiting
                hålls feedbacken dold trots att svaret redan är låst, så
                tidiga svarare inte får facit före sena.
                  • timeline: "Correct year: xxxx" — användarens val syns i låst TimelineSelector.
                  • image:    "Correct: <Name>" — användarens val (om något) syns inte separat.
                Båda grenar delar samma badge / next-tab / answer-time-row. */}
            {phase === 'reveal' && (() => {
              let wasCorrect: boolean;
              let correctLabel: string;
              let correctValue: string;
              if (question.type === 'timeline') {
                if (selectedYear === null) return null;
                const interval = getIntervalForAssistance(currentAssistance);
                wasCorrect = isCorrect(
                  selectedYear,
                  question.correctYear,
                  interval,
                  eraFrom,
                  eraTo,
                );
                correctLabel = 'Correct year:';
                correctValue = String(question.correctYear);
              } else {
                // Image — wasCorrect = confirmedNameOption.isCorrect, eller
                // false vid time-out (confirmedNameOption === null).
                wasCorrect = confirmedNameOption?.isCorrect ?? false;
                correctLabel = 'Correct:';
                correctValue = question.displayName;
              }
              return (
                <View style={rv.container}>
                  <Animated.View
                    style={[
                      rv.feedbackCard,
                      wasCorrect ? rv.feedbackCorrect : rv.feedbackWrong,
                      { transform: [{ scale: revealScale }], opacity: revealOpacity },
                    ]}
                  >
                    <Text
                      style={[
                        rv.feedbackBadge,
                        wasCorrect ? rv.feedbackBadgeCorrect : rv.feedbackBadgeWrong,
                      ]}
                    >
                      {wasCorrect ? '✓ Correct Answer' : '✗ Wrong Answer'}
                    </Text>
                    {/* Correct-rad och Next-tab delar samma rad så
                        tab:ens underkant linjerar med textens underkant. */}
                    <View style={rv.feedbackYearRow}>
                      <Text style={rv.feedbackCorrectYear}>
                        {correctLabel}{' '}
                        <Text style={rv.feedbackCorrectYearBold}>
                          {correctValue}
                        </Text>
                      </Text>
                      <TouchableOpacity
                        style={[
                          rv.nextTab,
                          wasCorrect ? rv.nextTabCorrect : rv.nextTabWrong,
                        ]}
                        onPress={isLastQuestion ? handleShowLeaderboard : handleAdvanceToNextRound}
                        activeOpacity={0.85}
                      >
                        <Text style={rv.nextTabText}>
                          {isLastQuestion ? '🏆  Final Leaderboard' : 'Next  →'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {wasCorrect && confirmedTimeUsed !== null && (
                      <Text style={rv.feedbackAnswerTime}>
                        Answer time:{' '}
                        <Text style={rv.feedbackBold}>
                          {confirmedTimeUsed.toFixed(2)}s
                        </Text>
                      </Text>
                    )}
                  </Animated.View>
                </View>
              );
            })()}

            {/* Fas-medveten action-knapp:
                  • question  → Confirm (blå glow + pulse)
                  • awaiting  → låst "Confirmed — waiting for time"
                  • reveal    → ingenting; Next/Final Leaderboard sitter
                    inuti feedback-kortet ovan */}
            {phase !== 'reveal' && (
              <View style={styles.actionWrap}>
                {phase === 'question' && (
                  <Animated.View
                    style={[
                      styles.confirmWrap,
                      { transform: [{ scale: confirmPulse }] },
                    ]}
                  >
                    <Animated.View
                      style={[styles.confirmHalo, { opacity: confirmGlow }]}
                      pointerEvents="none"
                    />
                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        styles.actionBtnConfirm,
                        !canConfirm && styles.actionBtnDisabled,
                      ]}
                      onPress={() => {
                        if (!canConfirm) return;
                        if (question.type === 'image' && pendingNameOption) {
                          handleConfirmName(pendingNameOption);
                        } else if (question.type === 'timeline' && pendingYear !== null) {
                          handleConfirm(pendingYear);
                        }
                      }}
                      disabled={!canConfirm}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.actionBtnText}>Confirm</Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}
                {phase === 'awaiting' && (
                  <View style={[styles.actionBtn, styles.actionBtnAwaiting]}>
                    <Text style={styles.actionBtnAwaitingText}>
                      ✓ Confirmed — waiting for time
                    </Text>
                  </View>
                )}
              </View>
            )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { gap: Spacing.md, paddingBottom: Spacing.xxl },

  // Image-fråge-mediaCard: 16:9-ram för bilden + ProgressiveCover-overlay.
  // Letterbox:as automatiskt om källan är porträtt (t.ex. paris.webp).
  imageMediaCard: {
    aspectRatio: 16 / 9,
    backgroundColor: Colors.card,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  imageMediaImage: {
    width: '100%',
    height: '100%',
  },
  imageMediaPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.cardElevated,
  },


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
    // Ingen overflow:hidden — avatar-markören (timerMarker) extenderar långt
    // utanför 6 px bar-höjden. timerFill har egen borderRadius:3 så fillen
    // ser fortsatt rundad ut vid edges utan klippning.
    position: 'relative',
  },
  timerFillPulseWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  timerFill: {
    height: '100%',
    borderRadius: 3,
  },
  // Avatar-markör som sitter på timer-bar:en vid den x-position som motsvarar
  // tiden då spelaren bekräftade. left: ${elapsed/30 * 100}% — track:s
  // egen position:relative gör att percentagen räknas mot den.
  // marginLeft -14 centrerar 28-wide avataren på den exakta x-pixeln.
  // top: bar-center (3) - avatar-radie (14) = -11.
  timerMarker: {
    position: 'absolute',
    top: -11,
    marginLeft: -14,
    width: 28,
    height: 28,
    zIndex: 10,
  },
  timerMarkerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.warning,
    backgroundColor: Colors.cardElevated,
  },
  timerMarkerFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.warning,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerMarkerEmoji: {
    fontSize: 16,
  },
  // Pulserande ring runt sekund-räknaren till höger om timer-bar:en. Cirkel-
  // form via lika width/height + borderRadius:50% (= halv av storleken).
  // timerRingHalo ligger absolut inset utanför ringen och pulserar i
  // opacity för cross-platform glow.
  timerRingWrap: {
    position: 'relative',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerRingHalo: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 32,
  },
  timerRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerRingNum: {
    fontSize: 24,
    fontWeight: FontWeight.bold,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.2,
  },

  // Wrap runt 2-decimal countdown — håller halo + box. Centrerad
  // horisontellt. Negativ marginTop drar boxen nära timer-bar:en (ScrollView-
  // content-gap pushar annars ned med Spacing.md = 16 px); -10 lämnar bara
  // ~6 px luft mellan bar:ens nedkant och stopwatch-boxens överkant.
  decimalTimerWrap: {
    alignSelf: 'center',
    position: 'relative',
    marginTop: -10,
  },
  // Halo bakom boxen — pulserar i opacity via timerRingGlow så glöden
  // matchar ringen runt sekund-räknaren ovanför.
  decimalTimerHalo: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: Radius.lg + 4,
  },
  // Själva boxen runt stopwatch-ikon + tal. Border-färgen ärvs från
  // stopwatchColor (sätts dynamiskt i render). Bakgrund Colors.cardElevated
  // så texten har kontrast mot halo:n bakom. alignItems:'center' centrerar
  // ikonen + decimal-delen vertikalt med den stora integer-siffran (38 px).
  decimalTimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 2,
    backgroundColor: Colors.cardElevated,
  },
  // Wrap runt SVG-ikonen — höjden matchar integer-textens lineHeight (40)
  // så ikonens visuella mitt linjerar exakt med siffrans visuella mitt.
  decimalTimerIconWrap: {
    width: 32,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decimalTimerInt: {
    fontSize: 38,
    fontWeight: FontWeight.bold,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  decimalTimerDec: {
    fontSize: 22,
    fontWeight: FontWeight.semibold,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },

  questionCard: {
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.lg, gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    minHeight: 140,
  },
  // Top-rad pinnas mot kortets överkant så frågan kan flex-centreras under.
  // alignItems:'flex-start' gör att höger Answering-stack:en kan vara två rader
  // tall utan att skjuta question-räknaren neråt; båda anchorar mot top-edge.
  questionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  // Wrap runt frågetexten så den kan flex-centreras lodrätt mellan top-raden
  // och kortets nederkant. gap: 2 ger tight spacing mellan headline och
  // sub-rad så de läses som en sammanhängande fråga.
  questionTextWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    gap: 2,
  },
  questionMeta: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  // "Answering"-stack — label ovanpå PlayerName, höger-justerat. Två rader
  // ger plats åt långa Player Names utan att kollidera med question-räknaren
  // i vänster kolumn. alignItems:'flex-end' så båda raderna är högerställda
  // (textAlign på Text-elementen behövs inte när container redan är höger-
  // anchored).
  answeringStack: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 1,
  },
  answeringLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
  answeringPlayerName: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.2,
    maxWidth: 180,
  },
  // Headline för split-formatet (rad 1) — markant större än sub-raden så
  // ögat fastnar på "Which year" först, sedan läser fortsättningen.
  questionTextHeadline: {
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    lineHeight: 38,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  questionText: { fontSize: 18, fontWeight: FontWeight.semibold, color: Colors.textPrimary, lineHeight: 26, textAlign: 'center' },

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
  // Confirm-knappens stil: blue + iOS shadow för glow-effekten. Halo:n bakom
  // (confirmHalo) ger cross-platform glow på Android som saknar shadow-color.
  actionBtnConfirm: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 18,
    elevation: 12,
  },
  // Wrap runt Confirm-knappen för scale-pulse + halo-positionering.
  // position: relative så confirmHalo (absolute) ankrars hit istället för
  // mot ScrollView:n. Speglar Lobby:s startGameWrap-mönster.
  confirmWrap: {
    position: 'relative',
  },
  confirmHalo: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: Radius.md + 4,
    backgroundColor: Colors.primary,
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
  // Awaiting-state-knapp: passiv pillar med subtila brand-toner — signalerar
  // "låst, vänta på tiden" utan att se klickbar ut. Speglar Lobby:s
  // waitingForHostBox-styling (primaryMuted bg + primaryBorder).
  actionBtnAwaiting: {
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  actionBtnAwaitingText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
  actionBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
});

// Inline reveal-feedback — green/red-bordered card med ✓/✗ badge i övre
// vänstra hörnet, "You chose: X" och (vid fel) "Correct answer: Y". Speglar
// name-quiz-demo:s feedback-mönster så reveal-vyn ser likadan ut oavsett
// fråge-typ. Pts-räknaren sitter i övre högra hörnet på samma rad som badgen.
const rv = StyleSheet.create({
  container: { paddingHorizontal: Spacing.lg },
  feedbackCard: {
    borderRadius: Radius.lg,
    borderWidth: 2,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    gap: 2,
  },
  // Båda statusarna delar bg-färg (Colors.card) som matchar question-kortet
  // ovanför så reveal-vyn känns som en seamless förlängning av frågan istället
  // för en "alarm-ruta". Status-färgen bärs på badge + border.
  feedbackCorrect: {
    backgroundColor: Colors.card,
    borderColor: Colors.success,
  },
  feedbackWrong: {
    backgroundColor: Colors.card,
    borderColor: Colors.error,
  },
  feedbackBadge: {
    alignSelf: 'flex-start',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  feedbackBadgeCorrect: {
    color: Colors.success,
    backgroundColor: 'rgba(82,200,122,0.18)',
  },
  feedbackBadgeWrong: {
    color: Colors.error,
    backgroundColor: 'rgba(255,107,107,0.18)',
  },
  // "Correct year: 1980" — fortfarande primärt fokus i reveal-vyn men
  // krympt så hela kortet håller låg höjd oavsett assistance-nivå (kortet
  // ska bara vara så högt att badge + correct-year-raden får plats).
  feedbackCorrectYear: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  feedbackCorrectYearBold: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
  // Subtilare än Correct year så hierarkin är tydlig. Krympt + negativ
  // marginTop för att rätt-svars-kortet inte ska bli onödigt högt — den
  // är en sekundär info-rad som bara visas vid rätt svar.
  feedbackAnswerTime: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: -2,
  },
  feedbackBold: {
    fontWeight: FontWeight.bold,
  },
  // Row som håller correct-year-text + Next-tab på samma rad. alignItems:
  // 'flex-end' bottom-anchorar båda så tab:ens underkant linjerar med
  // correct-year-textens underkant (per Peter:s spec). justifyContent:
  // 'space-between' separerar texten (vänster) från tab:en (höger).
  feedbackYearRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  // Next-tab inuti feedback-kortet — sitter på samma rad som correct-year-
  // texten (alignItems:'flex-end' i feedbackYearRow bottom-anchorar tab:en
  // mot textens baseline). Kompakt; bg-färg ärvs från nextTabCorrect/Wrong
  // (båda primary, så tab:en alltid signalerar "fortsätt" oavsett status).
  nextTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  // Båda statusarna använder primary-blå så Next-tab:en alltid signalerar
  // "fortsätt"-action. Card:ens border + badge bär status-färgen (grön vid
  // rätt, röd vid fel) — tab:en behöver inte upprepa den.
  nextTabCorrect: {
    backgroundColor: Colors.primary,
  },
  nextTabWrong: {
    backgroundColor: Colors.primary,
  },
  nextTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.4,
  },
});
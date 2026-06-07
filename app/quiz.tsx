import { ConnectionUnstableOverlay } from '@/src/components/ConnectionUnstableOverlay';
import { CountdownIntro } from '@/src/components/CountdownIntro';
import { GetReadyIntro, type QuestionMediaType } from '@/src/components/GetReadyIntro';
import { ActorSelectBlock } from '@/src/components/ActorSelectBlock';
import { ImageAnswerBlock } from '@/src/components/ImageAnswerBlock';
import { InactivityCountdownBanner } from '@/src/components/InactivityCountdownBanner';
import { MediaPlayer } from '@/src/components/MediaPlayer';
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
import { SequentialDots } from '@/src/components/SequentialDots';
import { StopwatchIcon } from '@/src/components/StopwatchIcon';
import { useConnectionStatus } from '@/src/lib/network/connectionMonitor';
import { subscribeSyncChannel, type SyncChannel } from '@/src/lib/realtime/syncChannel';
import type { LobbyPlayer } from '@/src/screens/LobbyScreen';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/theme';
import { track } from '@/src/utils/analytics';
import { getAvatarEmojiById } from '@/src/utils/avatars';
import { clearEjected } from '@/src/utils/ejectedPlayers';
import { appendGameHistoryEntry, saveLatestResult, type GameResult, type HistoryEntry, type RoundResult } from '@/src/utils/gameResults';
import { clearLeftPlayers } from '@/src/utils/leftPlayers';
import { pickMediaSource, type YoutubeClip } from '@/src/utils/mediaSource';
import { deactivateRoom, registerActiveRoom } from '@/src/utils/mockActiveRooms';
import { clearLobbyPlayers, setLobbyPlayers } from '@/src/utils/mockLobbyPlayers';
import {
  clearLobbySettings,
  getLobbySettings,
  getPlayerAudioOverrides,
  setLobbySettings,
  setPlayerAudioOverride,
  type PlayerAudioOverrides,
} from '@/src/utils/mockLobbySettings';
import { buildAudienceSet, filterByAudience } from '@/src/utils/audienceFilter';
import { isMainCategory, subjectToMainCategory, itemMatchesEnabledCategories, type MainCategory } from '@/src/utils/mainCategory';
import { clearGameStarted } from '@/src/utils/mockStartedGames';
import { MUSIC_QUESTIONS } from '@/src/utils/musicQuestions';
import {
  computeDJRotationPlan,
  getDJForQuestionIndex,
  openSpotifyTrack,
  fetchSpotifyAlbumArt,
  type DJRotationPlan,
  type SpotifyDJPlayer,
} from '@/src/utils/spotifyDJ';
import { SpotifyBrandIcon } from '@/src/components/SpotifyBrandIcon';
import { savePendingLobbyPlayers } from '@/src/utils/pendingLobby';
import { loadProfile } from '@/src/utils/profileStorage';
import {
  IMAGE_QUIZ_QUESTIONS,
  DISTRACTOR_POOL_NAMES,
  type ImageQuestionAudience,
  type ImageNameOption,
  type ImageQuestionVariant,
  type ImageQuizQuestion,
} from '@/src/utils/quizImageQuestions';
import { buildImageVariant } from '@/src/utils/imageQuestionBuilder';
import { HINTS_LIBRARY, getHintRegionScope, inferGender, type HintLibrary } from '@/src/utils/hintsData';
import { HintsQuizCard } from '@/src/components/HintsQuizCard';
import { HeartbeatSound } from '@/src/components/HeartbeatSound';
// import { getQuizImage } from '@/src/utils/quizImages';
// ↑ Borttagen 2026-05-27 — text-rendering ersätter foto-rendering. Återintroducera
// när sketches kommer (då med getQuizSketch() från assets/quiz-sketches/).
// NameRevealCard, SketchCanvas, hasSketch, getQuizSketch ersatta av HintsQuizCard.
import { generateRoomCode } from '@/src/utils/roomCode';
import { addSeenQuestionIds, loadSeenQuestionIds } from '@/src/utils/hostQuestionHistory';
import { hasPremiumSubscription } from '@/src/utils/subscriptionStorage';
import { supabase } from '@/src/utils/supabase';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Svg, { Circle, G, Path } from 'react-native-svg';

type AssistanceLevel = 'minimal' | 'standard' | 'full';

interface TimelineQuestion {
  type: 'timeline';
  id: string;
  questionNumber: number;
  totalQuestions: number;
  category: string;
  /** V1-huvudkategori härledd från backend:s contentSubject — driver
   *  GetReadyIntro:s badge på första kö-rutan. null om subjectet inte
   *  mappar (t.ex. capital). */
  mainCategory: MainCategory | null;
  question: string;
  correctYear: number;
  hint: string;
  /** Genre/tema-paket-taggar (t.ex. ["sport"]) från backend-katalogen. Driver
   *  crossover-filter: sport-musik (subject=song → mainCategory='Music') surfar
   *  ÄVEN under Sport-toggeln. Se itemMatchesEnabledCategories. */
  genrePackages?: readonly string[];
  // Pre-curerade YouTube-klipp för frågan. Optional — items utan klipp
  // renderar `NoSourcePlayer`-placeholder via pickMediaSource.
  youtubeClips?: YoutubeClip[];
  /** Spotify track ID — satt när frågan är en Spotify DJ-kandidat.
   *  Driver isSpotifyQuestion + djRotationPlan i quiz-screen:en. */
  spotifyTrackId?: string;
}

interface ImageQuestion {
  type: 'image';
  id: string;
  questionNumber: number;
  totalQuestions: number;
  category: string;
  /** V1-huvudkategori härledd från backend:s contentSubject — driver
   *  GetReadyIntro:s badge på första kö-rutan. null om subjectet inte
   *  mappar (t.ex. capital). */
  mainCategory: MainCategory | null;
  question: string;
  /** Rätt svar — visas i reveal-feedback. */
  displayName: string;
  /** "Rätt svar"-året (för artister = födelseår; band = formation-år).
   *  Används som FALLBACK i era-filtret när peak saknas. **Optional** —
   *  items utan correctYear OCH utan peak (t.ex. capitals) är era-
   *  agnostiska och inkluderas i alla eras. */
  correctYear?: number;
  /** Peak-recognition-fönster (åren item:t var som mest känt). När båda
   *  definierade använder era-filtret interval-overlap mot host:s era-
   *  spann (semantiskt rättare än correctYear för artister). */
  peakFrom?: number;
  peakTo?: number;
  /** Backreference till källan från IMAGE_QUIZ_QUESTIONS — driver runtime-
   *  generation av variants via buildImageVariant() istället för pre-bakad
   *  data (sparade ~8.3 MB av JS-bundlen, refactor 2026-05-27). */
  source: ImageQuizQuestion;
  /** Hints-data om tillgänglig — aktiverar HintsQuizCard-rendering (flagga + ledtrådar)
   *  istället för legacy foto-rendering (juridiskt parkerad). */
  hints?: HintLibrary;
  /** Profession-etikett härledd från contentSubject ('Actor' | 'Artist' | 'Athlete' | 'Band'). */
  profession?: string;
}

interface ActorSelectQuestion {
  type: 'actor-select';
  id: string;
  questionNumber: number;
  totalQuestions: number;
  category: string;
  mainCategory: MainCategory | null;
  question: string;
  /** Filmtitel — visas i reveal-feedback. */
  displayName: string;
  /** True = animerad film (frågar karaktärnamn), false = live-action (skådespelarnamn). */
  isAnimated: boolean;
  /** Godkända svar (1–2 namn). Räcker att välja ett. */
  correctNames: string[];
  /** Felaktiga svarsalternativ som visas i namnlistan. */
  distractorNames: string[];
  /** Filmens releasår — används för era-filtrering (inte för scoring). */
  correctYear?: number;
  genrePackages?: readonly string[];
  youtubeClips?: YoutubeClip[];
}

type QuizQuestion = TimelineQuestion | ImageQuestion | ActorSelectQuestion;

// Frågorna kommer från backend-curerad katalog (backend/content/catalog/songs-*.yaml).
// Regenerera src/utils/musicQuestions.ts efter katalog-ändringar med:
//   cd backend && npm run export-music-questions
// Items utan youtubeClips filtreras bort av export-scriptet.
// `questionText` bakas in i exporten via backend-schemats FIXED_QUESTION_TEXT-
// map (matrisens "Fixed Question text"-kolumn) så frågetexten är härledd ur
// `contentSubject`, inte hårdkodad här. `hint` används bara internt
// i reveal-vyn ("Disco era") så den behålls för smak.
const SEED_QUESTIONS: (TimelineQuestion | ActorSelectQuestion)[] = MUSIC_QUESTIONS.map((q, i) => {
  if (q.correctNames && q.correctNames.length > 0) {
    // Film-fråga: actor-select-mekanik (skådespelar-/karaktärnamn istället för år)
    const actorQ: ActorSelectQuestion = {
      type: 'actor-select',
      id: q.id,
      questionNumber: i + 1,
      totalQuestions: MUSIC_QUESTIONS.length,
      category: 'Film',
      mainCategory: subjectToMainCategory(q.contentSubject),
      question: q.questionText,
      displayName: q.displayName,
      isAnimated: q.isAnimated ?? false,
      correctNames: q.correctNames,
      distractorNames: q.distractorNames ?? [],
      correctYear: q.correctYear,
      genrePackages: q.genrePackages,
      youtubeClips: q.youtubeClips,
    };
    return actorQ;
  }
  const tq: TimelineQuestion = {
    type: 'timeline',
    id: q.id,
    questionNumber: i + 1,
    totalQuestions: MUSIC_QUESTIONS.length,
    category: 'Music',
    mainCategory: subjectToMainCategory(q.contentSubject),
    question: q.questionText,
    correctYear: q.correctYear!,
    hint: q.displayName,
    genrePackages: q.genrePackages,
    youtubeClips: q.youtubeClips,
    spotifyTrackId: q.spotifyTrackId,
  };
  return tq;
});

function professionFromSubject(subject: string | undefined): string {
  if (subject === 'artist') return 'Artist';
  if (subject === 'band') return 'Band';
  if (subject === 'actor') return 'Actor';
  if (subject === 'athlete') return 'Athlete';
  if (subject === 'city' || subject === 'country' || subject === 'place') return 'Place';
  if (subject) return subject.charAt(0).toUpperCase() + subject.slice(1);
  return 'Person';
}

// Bild-frågor (Letter Grid → Final Selection-svar). category='Image' triggar
// per-typ-rendering i question-card / mediaCard / answer-block / reveal-block.
// Items med hints-data i HINTS_LIBRARY får library attachad vid konvertering.
// 'unknown-region'-items filtreras bort. Items med färre än 10 hints visas ej —
// de saknar tillräckliga ledtrådar för en meningsfull fråga.
const MIN_HINTS_REQUIRED = 10;
const IMAGE_SEED_QUESTIONS: ImageQuestion[] = IMAGE_QUIZ_QUESTIONS
  .filter((q) =>
    getHintRegionScope(q.id) !== 'unknown-region' &&
    (HINTS_LIBRARY[q.id]?.hints.length ?? 0) >= MIN_HINTS_REQUIRED,
  )
  .map((q, i, arr) => ({
    type: 'image',
    id: q.id,
    questionNumber: i + 1,
    totalQuestions: arr.length,
    category: 'Image',
    mainCategory: subjectToMainCategory(q.contentSubject),
    question: q.questionText,
    displayName: q.displayName,
    correctYear: q.correctYear,
    peakFrom: q.peakFrom,
    peakTo: q.peakTo,
    source: q,
    hints: HINTS_LIBRARY[q.id],
    profession: professionFromSubject(q.contentSubject),
  }),
);

// Fisher-Yates-shuffle — slumpar ordningen i en ny kopia utan att muttera originalet.
function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

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

// Poäng-modell: rätt svar = 1 poäng, fel = 0. Tie-break på leaderboarden
// hanteras av sorteringen (poäng desc → avgResponseSeconds asc) — så två
// spelare med samma antal rätt rankas efter lägst genomsnittlig svarstid.
// Year-frågor (timeline):   minimal=5p, standard=3p, full=1p
// Letter-frågor (name/film): minimal=3p, standard=2p, full=1p
// Utan assistance (fallback): binärt 1/0
function calculatePoints(
  correct: boolean,
  assistance?: AssistanceLevel,
  questionKind?: 'year' | 'name',
): number {
  if (!correct) return 0;
  if (!assistance) return 1;
  if (questionKind === 'year') {
    return assistance === 'minimal' ? 5 : assistance === 'standard' ? 3 : 1;
  }
  return assistance === 'minimal' ? 3 : assistance === 'standard' ? 2 : 1;
}

// Quiz-lokal klarröd som ersätter den globala Colors.error i tre intentional
// quiz-kontexter (timer-bar/ring/integer vid <5s, Wrong Answer-badge bg,
// Wrong-feedback-kortets border). Den globala Colors.error är medvetet
// mjukare/rosa-tonad så Lobby:s toggle-off-state, papperskorgs-pressed osv.
// inte skriker. Quiz-vyn vill däremot ha en distinkt urgency-röd.
const QUIZ_ERROR_RED = '#FF3B30';

// ─── Mått ─────────────────────────────────────────────────────────────────────
const SCREEN_WIDTH = Dimensions.get('window').width;

// ITEM_WIDTH (avstånd mellan ticks) sätts dynamiskt per assistance-nivå inuti komponenten:
// Full: tät (≥10 år synliga), Standard: medium (≥8), Minimal: gles (4–5 syns)

// Tidslinjen – alla mått relativa till container-toppen.
// Hela layouten skiftad UPP 12 px från tidigare värden (CONTAINER_HEIGHT
// 108→96, TICK_TOP 24→12, etc.) — frigör vertikal yta så reveal-feedback-
// rutan inte längre överlappar Next-knappen i nedre högra hörnet.
const CONTAINER_HEIGHT = 96;
const TRACK_Y = 43;           // horisontell linje (mitten av svarsrutan)
const TICK_TOP = 12;          // ticks börjar ovanför svarsrutan
const TICK_BOTTOM = 74;       // ticks slutar under svarsrutan
const TICK_TOTAL = TICK_BOTTOM - TICK_TOP; // = 62px total tick-höjd
const YEAR_TEXT_Y = 78;       // årstext direkt under tickarna

// Svarsruta – kortare ram som tickarna tydligt skär genom
const SELECTOR_TOP = 22;      // 10px under tick-toppen
const SELECTOR_BOTTOM = 64;   // 10px över tick-botten
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
  // gap tidigare Spacing.md (16 px) — minskat till 0 så assist-headern
  // sitter precis ovanför timeline-containern. Tillsammans med
  // CONTAINER_HEIGHT-kompressionen (108→96) sparar detta 28 px vertikalt
  // så reveal-feedbackrutan inte överlappar Next-knappen.
  wrapper: { gap: 0, paddingHorizontal: Spacing.lg },
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
    isHost?: string;
    selfPlayerId?: string;
    players?: string;
    roundsCount?: string;
    roomCode?: string;
    eraFrom?: string;
    eraTo?: string;
    answerResponseSeconds?: string;
    /** JSON-stringifierad array av MainCategory-strings aktiva för YouTube-källan. Min 1. */
    youtubeEnabledCategories?: string;
    /** JSON-stringifierad array av MainCategory-strings aktiva för Images-källan.
     *  Actors/Athletes Images följer sin YouTube-toggle (Auto-beteende i Lobby). */
    imagesEnabledCategories?: string;
    /** JSON-stringifierad array av theme package-IDs aktiva vid spelstart.
     *  Tom array = Generic. Used för att frysa in i HistoryEntry. */
    selectedExtraPackages?: string;
    /** 'true' om Spotify DJ-läge är aktiverat i Lobby + host:ns konto kopplat. */
    spotifyEnabled?: string;
  }>();
  // Default assistance från URL-param — fallback om turnOrder-spelaren
  // saknar egen assistance-flagga. Per-player-värdet från turnOrder:n
  // har företräde när det är satt (= bygg-tid sätts av Lobby).
  const fallbackAssistance = (params.assistance ?? 'standard') as AssistanceLevel;
  const age = parseInt(params.age ?? '30');
  const gameMode = params.gameMode ?? 'pass-the-phone';
  // True om enheten kör host:s vy. Sätts av Lobby:s handleStartGame ('true')
  // resp. non-host:s Realtime-driven navigation ('false'). Defaultas till
  // 'true' så direkt-nav (utan Lobby) behåller host-beteende (Quit Game-
  // knapp etc.) — speglar tidigare implicit-host-antagande.
  const isHost = (params.isHost ?? 'true') === 'true';
  // Det egna player_id:t (= lobby_players.player_id) som Lobby skickade.
  // Används av non-host:s Leave-flöde för att broadcasta `player_left` så
  // host:s skärm kan visa popup + markera spelaren som hasLeft i leader-
  // boarden. Faller tillbaka till tom sträng vid direkt-nav (utan Lobby).
  const selfPlayerId = params.selfPlayerId ?? '';
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
  // Spotify DJ-läge — kräver Individual Devices (DJ lämnar appen → Spotify-appen).
  // PtP och Single Player stöds inte: en delad enhet kan inte "lämna" appen
  // och komma tillbaka för övriga spelares skull.
  const spotifyEnabled =
    (params.spotifyEnabled ?? 'false') === 'true' &&
    gameMode === 'individual-devices';

  // D-iv: host-styrt per-spelare audio (IndDev). Saknad key i mappen
  // tolkas client-side: host=on, övriga=off. Initial-fetch sker vid
  // mount (se separat useEffect nedan); incremental updates kommer via
  // player_audio_state_changed-broadcast. Deklareras tidigt så
  // isAudioMutedForSelf-compute:n längre ner kan läsa state utan TDZ.
  const [playerAudioOverrides, setPlayerAudioOverridesState] =
    useState<PlayerAudioOverrides>({});
  // D-v: host-inactivity-watchdog. lastHostActivityRef speglar (a) host:s
  // egna tap-tid när isHost=true eller (b) senast mottagna host_active_ping
  // när isHost=false. Båda håller fönstret på "9 min utan host-aktivitet
  // = countdown startar; 10 min = shutdown". Init till mount-tid så timern
  // börjar tickande från quiz-entry istället för 1970-epoch.
  const lastHostActivityRef = useRef<number>(Date.now());
  // Throttle-skydd för host:s ping-broadcast (max 1 per 5s).
  const lastPingEmittedRef = useRef<number>(0);
  // Sätts true av shutdown-handler:n så den bara fyrar en gång även om
  // interval-tick:en gör flera överskridanden innan navigation-replace
  // hinner unmounta /quiz.
  const inactivityShutdownTriggeredRef = useRef(false);
  // Visar countdown-banner när non-null (60→0). null = host aktiv inom
  // 9 min, ingen banner.
  const [inactivityCountdownSec, setInactivityCountdownSec] =
    useState<number | null>(null);
  // D-vi: host-disconnect grace. När non-host:s peer-tracker markerar host
  // som disconnected i reveal-fas → 10-sek grace innan auto-route till
  // GetReady. graceActive driver tick:en, graceCountdownSec är null första
  // 7 sek (frozen reveal-UI) sen 3/2/1 sista 3 sek (visas som big-number-
  // overlay). graceStartRef håller starttiden lokalt så Date.now-diff är
  // drift-fri jämfört med en räknande state-variabel.
  const [hostDisconnectGraceActive, setHostDisconnectGraceActive] = useState(false);
  const [hostDisconnectGraceCountdownSec, setHostDisconnectGraceCountdownSec] =
    useState<number | null>(null);
  const hostDisconnectGraceStartRef = useRef<number | null>(null);
  // D-iii: bad-connection-detection. Övervakas via connectionMonitor som får
  // signaler från syncChannel:s state-events. Gating på
  // gameMode='individual-devices' sker per call-site (overlay + disabled-
  // props) — hooken är säker att anropa i båda lägen, monitor:n bara
  // rapporterar något i IndDev där syncChannel:n är aktiv.
  const connection = useConnectionStatus();
  const isConnectionUnstable =
    gameMode === 'individual-devices' && connection.status === 'unstable';
  // Sticky-latch: när unstable fyrar förblir overlay:n + input-låsningen
  // kvar tills spelaren explicit tappar Retry. ENDAST för non-host —
  // host:s monitor-recovery clearar overlay:n direkt eftersom host driver
  // broadcast-flödet och kan inte bail:a mid-game (det skulle frysa alla
  // andra devices i reveal). Host:s blip är därför rent live-state-driven.
  const [stickyUnstableForQuestion, setStickyUnstableForQuestion] = useState(false);
  useEffect(() => {
    if (isConnectionUnstable && !isHost) setStickyUnstableForQuestion(true);
  }, [isConnectionUnstable, isHost]);
  // Derived: drivs av OR mellan live-state och sticky-latch. Allt UI-disable
  // + overlay-mount använder denna istället för raw `isConnectionUnstable`.
  const shouldLockForUnstable =
    isConnectionUnstable || stickyUnstableForQuestion;
  // YouTube-felhantering: sätts true när spelaren rapporterar embed-fel
  // (borttagen video, region-block, etc.). Triggar ett "Video unavailable"-kort
  // istället för MediaPlayer och auto-advancerar till reveal efter 2.5 s.
  // Resetas per fråga via useEffect nedan.
  const [youtubeError, setYoutubeError] = useState(false);
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
  // Per-source profession-category-filter. YouTube: min 1, alla tre valbara.
  // Images: Actors/Athletes är mandatory (alltid inkluderade), Music valbar.
  const youtubeEnabledCategories = useMemo<MainCategory[]>(() => {
    if (!params.youtubeEnabledCategories) return ['Music', 'Film', 'Sport'];
    try {
      const parsed = JSON.parse(params.youtubeEnabledCategories);
      // Tom array [] är ett giltigt explicit val (= YouTube helt av).
      // Fallback till default BARA om parse misslyckas eller inte är array.
      if (!Array.isArray(parsed)) return ['Music', 'Film', 'Sport'];
      return parsed.filter(isMainCategory);
    } catch {
      return ['Music', 'Film', 'Sport'];
    }
  }, [params.youtubeEnabledCategories]);
  const imagesEnabledCategories = useMemo<MainCategory[]>(() => {
    if (!params.imagesEnabledCategories) return ['Music', 'Film', 'Sport'];
    try {
      const parsed = JSON.parse(params.imagesEnabledCategories);
      // Tom array [] är ett giltigt explicit val (= Images helt av).
      if (!Array.isArray(parsed)) return ['Music', 'Film', 'Sport'];
      return parsed.filter(isMainCategory);
    } catch {
      return ['Music', 'Film', 'Sport'];
    }
  }, [params.imagesEnabledCategories]);
  // Deriverade source-flags: YouTube aktiv om min 1 kategori vald, Images alltid aktiv.
  const youtubeEnabled = youtubeEnabledCategories.length > 0;
  const imagesEnabled = true;
  // Theme packages aktiva vid spelstart (host:s lobby-val, JSON-stringifierad
  // array av paket-IDs). Tom array = Generic. Default tom vid direkt-nav
  // utan Lobby. Behövs i HistoryEntry vid game-completion så Player history
  // visar vilket paket spelet kördes med.
  const selectedExtraPackages = useMemo<string[]>(() => {
    if (!params.selectedExtraPackages) return [];
    try {
      const parsed = JSON.parse(params.selectedExtraPackages);
      return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : [];
    } catch {
      return [];
    }
  }, [params.selectedExtraPackages]);
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

  // En "runda" = ett varv där alla spelare svarar en gång.
  //   Pass-the-Phone: spelarna turas om på samma enhet → 1 fråga per spelare
  //     per runda → totalQuestions = rundor × spelare. 4×4 = 16 frågor.
  //   Individual Devices: alla spelare svarar på SAMMA fråga samtidigt på
  //     egna enheter → 1 fråga per runda totalt → totalQuestions = rundor.
  // Math.max(1, ...) skyddar fallback-fallet då turnOrder är tom (direkt-nav
  // till /quiz utan Lobby).
  const totalQuestions =
    gameMode === 'individual-devices'
      ? totalRounds
      : totalRounds * Math.max(1, turnOrder.length);

  // Pool av frågor för spelet, organiserad i ROUND-BLOCKS:
  //
  //   Pass-the-Phone-regel: alla spelare i samma rond ska få samma fråge-TYP
  //   (alla får YouTube-content, eller alla får image) men olika ITEMS.
  //   Mellan ronder växlar typen.
  //
  //   Pool-struktur (med 4 spelare per rond, alternerande typ):
  //     Round 0 (block 0, type=youtube): yt[0], yt[1], yt[2], yt[3]
  //     Round 1 (block 1, type=image):   img[0], img[1], img[2], img[3]
  //     Round 2 (block 2, type=youtube): yt[4], yt[5], yt[0], yt[1] (cykling)
  //     Round 3 (block 3, type=image):   img[4], img[5], img[6], img[7]
  //
  //   YouTube-poolen idag = enbart musik-items via SEED_QUESTIONS (= items
  //   med youtubeClips). Designad så att framtida non-music YouTube-content
  //   (sport, tal, comedy) kan addas till samma pool utan kod-ändring —
  //   gating + filter är källagnostiskt.
  //
  //   Individual Devices (parallel play): alla spelare svarar samma fråga
  //   samtidigt — round-block-strukturen är inte semantiskt nödvändig där men
  //   bryter ingenting heller. Kommer behöva omdesignas separat när Individual
  //   Devices flödet kopplas in (parkerad per Peter 2026-05-11).
  //
  // MÅSTE deklareras EFTER `turnOrder` — annars TDZ-error eftersom deps
  // läser turnOrder.length innan const är initialiserad.
  // Audience-set lyfts ut som top-level useMemo så det kan återanvändas
  // av image-variant-builderns runtime-generation (gameQuestions räknar
  // ut samma värde internt — pekar tillsammans mot samma sak).
  const audienceSetForVariants = useMemo(
    () => buildAudienceSet(turnOrder) as Set<ImageQuestionAudience>,
    [turnOrder],
  );

  // Fråge-IDs som hosten sett i tidigare omgångar — laddas från AsyncStorage
  // vid mount. Används av gameQuestions-useMemo för att ordna osedda frågor
  // först. Startar tom; uppdateras asynkront inom ~50 ms (innan spelaren
  // hinner trycka Play i GetReadyIntro).
  // MÅSTE deklareras FÖRE gameQuestions-useMemo (TDZ-fel annars).
  const [seenQuestionIds, setSeenQuestionIds] = useState<Set<string>>(new Set());
  const savedSeenRef = useRef(false);

  const gameQuestions = useMemo<QuizQuestion[]>(() => {
    // Filter-hierarki (i ordning, från hård → mjuk):
    //   1. Source-toggle (youtubeEnabled / imagesEnabled) — HÅRD. Host:s val.
    //   2. Era (correctYear ∈ [eraFrom, eraTo]) — HÅRD. Host:s val.
    //   3. Audience (union av spelares generationer) — PREFERENS. Relaxbar
    //      när era+audience är tom; era stannar alltid.
    //
    // Rationale: era är en explicit host-väljning ("spel om 80-talet"). En
    // 80-talsspel ska ALDRIG visa låtar/items från 2020 även om alla spelare
    // är gen-z — det skulle bryta host:s era-intent. Däremot OK att visa
    // 80-talslåt med audiences=['elder'] till en gen-z-spelare när det är
    // enda alternativet inom 80-talsfönstret.
    //
    // Audience-set byggs en gång och delas mellan båda pools.
    const audienceSet = buildAudienceSet(turnOrder);

    // ── Music-pool ────────────────────────────────────────────────────
    // Era HÅRD: filtrera SEED_QUESTIONS på correctYear ∈ [eraFrom, eraTo].
    // Bygg music-pool när YT är aktivt ELLER Spotify är aktivt — Spotify DJ
    // är en separat toggle och ska fungera även när youtubeEnabledCategories=[].
    const inEraMusic = (youtubeEnabled || spotifyEnabled)
      ? SEED_QUESTIONS.filter(
          (q) => q.correctYear !== undefined
            ? q.correctYear >= eraFrom && q.correctYear <= eraTo
            : true,
        )
      : [];
    // Audience MJUK: filtrera era-träffarna ytterligare. MUSIC_QUESTIONS har
    // `audiences`-prop; SEED_QUESTIONS-mappen droppar fältet, så vi filtrerar
    // mot id-set:en från MUSIC_QUESTIONS.
    const audienceAllowedMusicIds = new Set(
      filterByAudience(MUSIC_QUESTIONS, audienceSet).map((q) => q.id),
    );
    const inEraAudienceMusic = inEraMusic.filter((q) =>
      audienceAllowedMusicIds.has(q.id),
    );
    // Fallback: era + audience → era-only (audience relaxas, era HÅRD).
    // Tom era-only-array → pool tom (youtubeEnabled=false eller era-fönster
    // utan items). Inga fallbacks som strippar era — host:s era-intent
    // respekteras alltid.
    const youtubePoolPreCategory: QuizQuestion[] =
      inEraAudienceMusic.length > 0 ? inEraAudienceMusic : inEraMusic;
    // ── Image-pool ────────────────────────────────────────────────────
    // Era HÅRD för icke-person-items: peak-recognition-fönster när det finns,
    // annars correctYear för eventbaserade items (t.ex. sport-events, platser).
    //
    // Person-items (artist/band/actor/athlete): correctYear = födelseår, INTE
    // eventår. Utan explicit peakFrom/peakTo är person-items ERA-AGNOSTISKA —
    // födelseåret ska aldrig era-filtrera bort t.ex. Michael Jackson (f.1958)
    // från ett spel med era 1980-nu. Peak används om tillgängligt.
    const PERSON_SUBJECTS = new Set([
      'artist', 'band', 'actor', 'character', 'athlete', 'celebrity', 'cultural-person',
    ]);
    const inEraImages = imagesEnabled
      ? IMAGE_SEED_QUESTIONS.filter((q) => {
          if (q.peakFrom !== undefined && q.peakTo !== undefined) {
            // Interval-overlap: [eraFrom, eraTo] ∩ [peakFrom, peakTo] ≠ ∅
            return eraFrom <= q.peakTo && eraTo >= q.peakFrom;
          }
          // Person utan peak: era-agnostisk (födelseår är inte ett eventår).
          if (PERSON_SUBJECTS.has(q.source.contentSubject)) {
            return true;
          }
          if (q.correctYear !== undefined) {
            return q.correctYear >= eraFrom && q.correctYear <= eraTo;
          }
          // Era-agnostisk — alltid inkluderad.
          return true;
        })
      : [];
    // Audience MJUK: filtrera era-träffarna ytterligare. Samma pattern som
    // music — IMAGE_SEED_QUESTIONS droppar `audiences`, filtrera mot id-set.
    const audienceAllowedImageIds = new Set(
      filterByAudience(IMAGE_QUIZ_QUESTIONS, audienceSet).map((q) => q.id),
    );
    const inEraAudienceImages = inEraImages.filter((q) =>
      audienceAllowedImageIds.has(q.id),
    );
    // Fallback: era + audience → era-only. Era HÅRD.
    const imagePoolPreCategory: QuizQuestion[] =
      inEraAudienceImages.length > 0 ? inEraAudienceImages : inEraImages;

    // ── Per-source category-filter ───────────────────────────────────
    // YouTube: filtreras mot youtubeEnabledCategories (Music/Film/Sport).
    // Guess Where?: bara platsfrågor med null mainCategory (städer/länder).
    //   Personbilder (artist/band/actor/athlete — non-null mainCategory) är
    //   juridiskt parkerade och aldrig inkluderade oavsett toggles.
    const isAllYoutubeCats =
      youtubeEnabledCategories.length === 3 &&
      youtubeEnabledCategories.includes('Music') &&
      youtubeEnabledCategories.includes('Film') &&
      youtubeEnabledCategories.includes('Sport');
    const youtubePool = isAllYoutubeCats
      ? youtubePoolPreCategory
      : youtubePoolPreCategory.filter((q) =>
          itemMatchesEnabledCategories(
            q.mainCategory,
            youtubeEnabledCategories,
            q.type === 'timeline' ? q.genrePackages : undefined,
          ),
        );
    // Hints-pool: alla image-items renderas via HintsQuizCard (flagga + progressiva
    // ledtrådar). Items med data i HINTS_LIBRARY får faktiska hints; övriga visar
    // placeholders tills backend-script populerar HINTS_LIBRARY med Wikidata-data.
    const isAllImageCats =
      imagesEnabledCategories.length === 3 &&
      imagesEnabledCategories.includes('Music') &&
      imagesEnabledCategories.includes('Film') &&
      imagesEnabledCategories.includes('Sport');
    const imagePool: QuizQuestion[] = isAllImageCats
      ? imagePoolPreCategory
      : imagePoolPreCategory.filter((q) => {
          const mc = q.mainCategory;
          return isAllImageCats ? true : mc !== null && imagesEnabledCategories.includes(mc);
        });

    // ── Spotify-pool (separat tredje pool) ──────────────────────────────
    // Byggs från pre-category-poolen (youtubePoolPreCategory) för att vara
    // oberoende av youtubeEnabledCategories — Spotify DJ ska fungera även
    // när YT Music är avstängt (youtubeEnabledCategories=[] eller Music saknas).
    const spotifyPool: QuizQuestion[] = spotifyEnabled
      ? youtubePoolPreCategory.filter((q) => q.type === 'timeline' && q.spotifyTrackId)
      : [];
    // Ren YouTube-pool: category-filtrad pool minus Spotify-items.
    const pureYoutubePool: QuizQuestion[] = spotifyEnabled
      ? youtubePool.filter((q) => !(q.type === 'timeline' && q.spotifyTrackId))
      : youtubePool;

    const playerCount = Math.max(1, turnOrder.length);
    const hasSpotify = spotifyPool.length > 0;
    const hasPureYoutube = pureYoutubePool.length > 0;
    const hasImage = imagePool.length > 0;

    // Edge case: alla pooler tomma → sista-utvägs-fallback.
    // Använd bara YouTube SEED_QUESTIONS om YouTube faktiskt är aktiverat;
    // annars returnera bildpool ignorerandes era (era-filter kan ha tömt poolen).
    if (!hasSpotify && !hasPureYoutube && !hasImage) {
      if (youtubeEnabled) return SEED_QUESTIONS;
      // YouTube av, Hints tom pga era-filter eller saknad data → visa alla
      // person-items utan era-filter som nödlösning.
      const fallbackImages = IMAGE_SEED_QUESTIONS.filter(
        (q) => PERSON_SUBJECTS.has(q.source.contentSubject),
      );
      return fallbackImages.length > 0 ? fallbackImages : SEED_QUESTIONS;
    }

    // Prioritera frågor som hosten inte sett i tidigare spelomgångar.
    const prioritiseUnseen = (pool: QuizQuestion[]): QuizQuestion[] => {
      if (!seenQuestionIds.size) return shuffleArray(pool);
      const unseen = shuffleArray(pool.filter((q) => !seenQuestionIds.has(q.id)));
      const seen = shuffleArray(pool.filter((q) => seenQuestionIds.has(q.id)));
      return [...unseen, ...seen];
    };

    const CATEGORY_ORDER: MainCategory[] = ['Music', 'Film', 'Sport'];

    const groupByCategory = (pool: QuizQuestion[]): QuizQuestion[] => {
      const result: QuizQuestion[] = [];
      for (const cat of CATEGORY_ORDER) {
        const catPool = pool.filter((q) => q.mainCategory === cat);
        if (catPool.length) result.push(...prioritiseUnseen(catPool));
      }
      const uncategorized = pool.filter(
        (q) => !q.mainCategory || !CATEGORY_ORDER.includes(q.mainCategory as MainCategory),
      );
      if (uncategorized.length) result.push(...prioritiseUnseen(uncategorized));
      return result;
    };

    // Spotify: alltid Musik → enbart unseen-first, ingen kategori-gruppering.
    const orderedSpotifyPool: QuizQuestion[] =
      !hasSpotify ? [] : prioritiseUnseen(spotifyPool);

    // Ren YouTube: Musik → Film → Sport (osedda först per grupp).
    const hasOther = hasPureYoutube || hasImage;
    const orderedPureYoutubePool: QuizQuestion[] =
      !hasPureYoutube ? [] :
      !hasImage       ? prioritiseUnseen(pureYoutubePool) :
                        groupByCategory(pureYoutubePool);

    // Bilder: samma kategori-ordning som YouTube-sektionen.
    const orderedImagePool: QuizQuestion[] =
      !hasImage  ? [] :
      !hasOther  ? prioritiseUnseen(imagePool) :
                   groupByCategory(imagePool);

    // PtP: questionsPerBlock = antal spelare (alla svarar på olika frågor i samma block).
    // IndDev + Single Player: questionsPerBlock = 1 (varje rund = en fråga per spelare).
    const questionsPerBlock = (gameMode === 'individual-devices' || playerCount <= 1) ? 1 : playerCount;

    // ── Sekventiell fasordning: Spotify → YouTube → Hints/Image ────────
    // Ratio med Spotify (IndDev):  25% Spotify / 25% YouTube / 50% Hints.
    // Ratio utan Spotify (PtP/SP): 50% YouTube / 50% Hints — Spotify-blocken
    // absorberas av YouTube om YT är aktiverat, annars av Hints.
    // Fallback: saknas Hints → Spotify → YouTube.
    let spotifyBlockCount = hasSpotify ? Math.floor(totalRounds / 4) : 0;
    // YouTube: 25% om Spotify aktiv, 50% om Spotify saknas (absorberar Spotify-blocken).
    const ytDivisor = hasSpotify ? 4 : 2;
    let ytBlockCount = hasPureYoutube ? Math.floor(totalRounds / ytDivisor) : 0;
    let imageBlockCount = totalRounds - spotifyBlockCount - ytBlockCount;

    if (!hasImage && imageBlockCount > 0) {
      // Hints-block omdirigeras: Spotify i första hand → YouTube
      if (hasSpotify) spotifyBlockCount += imageBlockCount;
      else if (hasPureYoutube) ytBlockCount += imageBlockCount;
      imageBlockCount = 0;
    }

    const mixed: QuizQuestion[] = [];
    const buildSequentialPhase = (pool: QuizQuestion[], count: number) => {
      for (let block = 0; block < count; block++) {
        for (let q = 0; q < questionsPerBlock; q++) {
          if (pool.length === 0) continue;
          mixed.push(pool[(block * questionsPerBlock + q) % pool.length]);
        }
      }
    };

    // Fas 1: Spotify
    buildSequentialPhase(orderedSpotifyPool, spotifyBlockCount);

    // Fas 2: YouTube — alla block per kategori samlade (Music → Film → Sport).
    // Blockantalet fördelas jämnt; resten läggs på de första kategorierna.
    // Inom en kategori körs alla block i följd med osedd-prioritering.
    if (ytBlockCount > 0 && hasPureYoutube) {
      const ytCatPools = (youtubeEnabledCategories as MainCategory[])
        .map((cat) => ({
          pool: prioritiseUnseen(
            pureYoutubePool.filter((q) => q.mainCategory === cat),
          ),
        }))
        .filter((e) => e.pool.length > 0);

      if (ytCatPools.length > 0) {
        const base = Math.floor(ytBlockCount / ytCatPools.length);
        const remainder = ytBlockCount % ytCatPools.length;
        ytCatPools.forEach(({ pool }, catIdx) => {
          const blocksForCat = base + (catIdx < remainder ? 1 : 0);
          for (let block = 0; block < blocksForCat; block++) {
            for (let q = 0; q < questionsPerBlock; q++) {
              if (pool.length === 0) continue;
              mixed.push(pool[(block * questionsPerBlock + q) % pool.length]);
            }
          }
        });
      }
    }

    // Fas 3: Hints/Images — alla block per kategori samlade (Music → Film → Sport).
    // Blockantalet fördelas jämnt per aktiv bild-kategori.
    if (imageBlockCount > 0 && hasImage) {
      const imgCatPools = (imagesEnabledCategories as MainCategory[])
        .map((cat) => ({
          pool: prioritiseUnseen(
            imagePool.filter((q) => q.mainCategory === cat),
          ),
        }))
        .filter((e) => e.pool.length > 0);

      if (imgCatPools.length > 0) {
        const base = Math.floor(imageBlockCount / imgCatPools.length);
        const remainder = imageBlockCount % imgCatPools.length;
        imgCatPools.forEach(({ pool }, catIdx) => {
          const blocksForCat = base + (catIdx < remainder ? 1 : 0);
          for (let block = 0; block < blocksForCat; block++) {
            for (let q = 0; q < questionsPerBlock; q++) {
              if (pool.length === 0) continue;
              mixed.push(pool[(block * questionsPerBlock + q) % pool.length]);
            }
          }
        });
      } else {
        buildSequentialPhase(orderedImagePool, imageBlockCount);
      }
    }
    // Nödfallback: mixed tom trots att pool-bygget körde (t.ex. alla pools
    // oväntat tomma). Föredra bild-frågor framför YouTube-SEED när YouTube av.
    if (mixed.length === 0) {
      if (!youtubeEnabled) {
        const personFallback = IMAGE_SEED_QUESTIONS.filter(
          (q) => PERSON_SUBJECTS.has(q.source.contentSubject),
        );
        return personFallback.length > 0 ? personFallback : IMAGE_SEED_QUESTIONS.length > 0 ? IMAGE_SEED_QUESTIONS : SEED_QUESTIONS;
      }
      return SEED_QUESTIONS;
    }
    return mixed;
  }, [eraFrom, eraTo, turnOrder, totalRounds, youtubeEnabled, imagesEnabled, gameMode, youtubeEnabledCategories, imagesEnabledCategories, seenQuestionIds, spotifyEnabled]);

  // Media-källa per fråga (driver GetReadyIntro:s IndDev media-kö).
  // Image-frågor → 'image'; timeline-frågor (YouTube-content idag, men
  // pickMediaSource är källagnostisk så future YouTube-non-music kommer
  // hit oförändrat) → kör pickMediaSource för att se om YouTube är aktiv
  // för just den frågan givet host:s toggles.
  // Memoiseras parallellt med gameQuestions så ingen tomt-laddning sker i
  // render-loop.
  const mediaSourceByQuestion = useMemo<QuestionMediaType[]>(() => {
    return gameQuestions.map((q) => {
      if (q.type === 'image') return 'image';
      // Spotify-frågor från den separata Spotify-poolen identifieras via
      // spotifyTrackId + spotifyEnabled. Dessa hanteras av DJ-flödet, inte
      // YouTube-spelaren — returnera 'spotify' för korrekt kö-ikon i GetReadyIntro.
      if (spotifyEnabled && q.type === 'timeline' && q.spotifyTrackId) return 'spotify';
      const picked = pickMediaSource(
        { youtubeClips: q.youtubeClips },
        { youtubeEnabled, gameMode },
      );
      if (picked.kind === 'youtube') return 'youtube';
      return 'none';
    });
  }, [gameQuestions, youtubeEnabled, gameMode, spotifyEnabled]);

  // V1-huvudkategori per fråga (Music/Film/Sport). Driver GetReadyIntro:s
  // kant-skärande badge på första kö-rutan så spelaren ser i förväg vilken
  // typ av fråga som kommer härnäst. Härleds från backend:s contentSubject
  // (lagras på QuizQuestion.mainCategory vid SEED-konvertering); null om
  // subject inte mappar till någon V1-kategori (t.ex. capital).
  //
  // OBS: badgen visar den FAKTISKA fråge-typen (sport-temad musik = "Music",
  // inte "Sport"). Sport är ett LOBBY-FILTER, inte en badge: väljer host Sport
  // får hen sport-relaterade frågor ur både musik- och sport-poolen (via
  // genrePackages: ["sport"] + itemMatchesEnabledCategories), men frågan i sig
  // är fortfarande en musikfråga och visas så. Samma mönster planeras för Film
  // (idrottare som varit med i film / sport-tema-filmer).
  const categoryByQuestion = useMemo<(MainCategory | null)[]>(() => {
    return gameQuestions.map((q) => q.mainCategory);
  }, [gameQuestions]);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  // ── Spotify DJ-state ─────────────────────────────────────────────────
  // albumArtUrl: hämtas async från Spotify Web API per fråga (gissarnas skärm).
  const [spotifyAlbumArtUrl, setSpotifyAlbumArtUrl] = useState<string | null>(null);
  // djStarted: DJ:n har tryckt "Starta i Spotify" → knapptext byts till ✓.
  const [spotifyDJStarted, setSpotifyDJStarted] = useState(false);

  /**
   * DJ-rotationsplan — track-baserad, inte positions-baserad.
   *
   * Varje fråga i gameQuestions som har `spotifyTrackId` ÄR per definition
   * en Spotify-runda. DJs roterar bland spelarna i ordning.
   *
   * Tidigare använde vi computeDJRotationPlan (positions-baserad) som
   * tilldelade fasta index (t.ex. 5, 10, 15) utan att garantera att frågan
   * på det indexet faktiskt hade spotifyTrackId → inga Spotify-rundor.
   */
  const djRotationPlan = useMemo<DJRotationPlan | null>(() => {
    if (!spotifyEnabled || turnOrder.length === 0) return null;

    const djPlayers: SpotifyDJPlayer[] = turnOrder.map((p) => ({
      id: p.id,
      name: p.name,
      emoji: p.emoji,
    }));

    const spotifyQuestionIndices: number[] = [];
    const djAssignments = new Map<number, SpotifyDJPlayer>();

    // Gå igenom ALLA gameQuestions — varje fråga med spotifyTrackId blir
    // automatiskt en Spotify-runda med en roterande DJ-tilldelning.
    gameQuestions.forEach((q, i) => {
      if (q.type === 'timeline' && q.spotifyTrackId) {
        const djIndex = spotifyQuestionIndices.length % djPlayers.length;
        spotifyQuestionIndices.push(i);
        djAssignments.set(i, djPlayers[djIndex]);
      }
    });

    if (spotifyQuestionIndices.length === 0) return null;
    return { spotifyQuestionIndices, djAssignments };
  }, [spotifyEnabled, turnOrder, gameQuestions]);

  // Är nuvarande fråga en Spotify-fråga?
  const currentQ = gameQuestions[questionIndex];
  const isSpotifyQuestion =
    !!djRotationPlan?.spotifyQuestionIndices.includes(questionIndex) &&
    currentQ?.type === 'timeline' &&
    !!currentQ.spotifyTrackId;

  // Track ID för nuvarande Spotify-fråga (null om ej Spotify-fråga).
  const currentSpotifyTrackId: string | null =
    isSpotifyQuestion && currentQ?.type === 'timeline'
      ? (currentQ.spotifyTrackId ?? null)
      : null;

  // Vilken spelare är DJ för nuvarande fråga?
  const currentDJPlayer: SpotifyDJPlayer | null =
    djRotationPlan && isSpotifyQuestion
      ? getDJForQuestionIndex(djRotationPlan, questionIndex)
      : null;

  // Är JAGET DJ denna runda?
  //   Pass-the-Phone: aktiv spelare (currentPlayerIndex) jämförs mot DJ.
  //   Individual Devices: selfPlayerId jämförs mot DJ.
  const isCurrentPlayerDJ: boolean = currentDJPlayer !== null && (
    gameMode === 'pass-the-phone'
      ? turnOrder[currentPlayerIndex]?.id === currentDJPlayer.id
      : selfPlayerId === currentDJPlayer.id
  );

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
  // Timern + flaggans mosaik aktiveras 2 s efter quiz-vyn visas.
  const [timerActive, setTimerActive] = useState(false);
  useEffect(() => {
    if (phase !== 'question') { setTimerActive(false); return; }
    // Återställ display OMEDELBART så rätt respons-tid och full timer-bar
    // visas under buffer-perioden (inte stale 0 eller default 30 från
    // förra frågan / initialt state).
    setTimeLeft(responseSeconds);
    timerProgressAnim.stopAnimation();
    timerProgressAnim.setValue(1);
    const id = setTimeout(() => setTimerActive(true), 2000);
    return () => { clearTimeout(id); };
  }, [phase, questionIndex, responseSeconds, timerProgressAnim]);
  // Hints visas direkt när quiz-vyn öppnas (ingen delay).
  // Flaggans mosaik har kvar sin 2 s delay via timerActive/mosaicActive.
  const hintsReady = phase === 'question' || phase === 'awaiting' || phase === 'reveal';
  // Sticky-unstable-latchen rensas ENDAST av handleRetryFromUnstable
  // (= explicit Retry-tap). Tidigare auto-reset på phase=intro/countdown
  // togs bort (D-iii follow-up): per design är retry ända vägen tillbaka
  // för att aktivera spelaren igen + flippa A:s leaderboard från
  // "Connection unstable" till connected. question_advance fortsätter
  // bumpa questionIndex i bakgrunden (B håller sig synkad), men
  // play_command ignoreras tills sticky är rensad.
  // Spelare som kommer efter current i turordningen — cyklar genom hela
  // turnOrder så queue.length matchar antalet återstående frågor (inte
  // bara nästa rond). För 2 spelare × 4 rondor vid Q1: queue blir 7
  // element (P2, P1, P2, P1, P2, P1, P2 → Q2..Q8). Drivs av GetReady:s
  // chip-rad så plats 3+ visas även när turnOrder är kort.
  const queue = useMemo<TurnOrderPlayer[]>(() => {
    if (turnOrder.length <= 1) return [];
    const remaining = Math.max(0, totalQuestions - questionIndex - 1);
    const result: TurnOrderPlayer[] = [];
    for (let i = 0; i < remaining; i++) {
      const playerIdx = (currentPlayerIndex + 1 + i) % turnOrder.length;
      result.push(turnOrder[playerIdx]);
    }
    return result;
  }, [turnOrder, currentPlayerIndex, totalQuestions, questionIndex]);
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
  // Förlik state med timeline-flödet:
  //   • pendingNameOption = motsvarighet till pendingYear (preliminärt val
  //     i Final Selection, kan ändras tills Confirm tryckts).
  //   • confirmedNameOption = motsvarighet till selectedYear post-Confirm
  //     (låst, driver reveal-feedbacken). Null vid time-out → reveal visar
  //     ✗ + "Correct: X" utan "You chose"-rad.
  const [pendingNameOption, setPendingNameOption] = useState<ImageNameOption | null>(null);
  const [confirmedNameOption, setConfirmedNameOption] = useState<ImageNameOption | null>(null);

  // ── Actor-select-state (film-frågor) ───────────────────────────────────
  const [pendingActorName, setPendingActorName] = useState<string | null>(null);
  const [confirmedActorName, setConfirmedActorName] = useState<string | null>(null);

  // ── Multiplayer state ──────────────────────────────────────────────────
  // Per-runda-poäng (= scores för senaste avslutade fråga). Aggregerade
  // per-spelare-totals härleds från allRoundScoresHistory via gameTotals.
  const [currentRoundScores, setCurrentRoundScores] = useState<RoundScore[]>([]);
  const [allRoundScoresHistory, setAllRoundScoresHistory] = useState<RoundScore[][]>([]);
  const [playerHcpChanges, setPlayerHcpChanges] = useState<Record<string, HcpChange>>({});
  // Set över player_id:n som lämnat spelet via Leave Game (non-host).
  // Driver "Has left the game"-rendering i leaderboard:erna (både live i
  // GetReadyIntro och final i RoundLeaderboard). Alla approved klienter
  // (inkl. host) håller samma state — sync via `player_left`-broadcast.
  const [leftPlayerIds, setLeftPlayerIds] = useState<Set<string>>(new Set());
  // Per-spelare confirm-time för PÅGÅENDE fråga. Nyckel = lobby_players.player_id,
  // värde = sekunder från fråge-start till confirm. Driver avatar-markörer på
  // timer-bar:en i Individual Devices — confirmade spelares avatar fryses vid
  // sin position, ej-confirmade rör sig med timern. Reset:as vid frågebyte.
  const [playerConfirms, setPlayerConfirms] = useState<Record<string, number>>({});

  // Spel-start: trackas en gång när QuizScreen mountas (router pushar
  // hit från Lobby:s "Start Game"-flöde). Region/land sätts av
  // analytics-vendor:n på dashboard-sidan, behöver inte skickas här.
  useEffect(() => {
    track('game_started', { assistance: fallbackAssistance });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ladda Host:s tidigare sedda fråge-IDs från AsyncStorage. Sker asynkront
  // men klart innan spelaren hinner trycka Play i GetReadyIntro (~50 ms).
  // Uppdaterar seenQuestionIds vilket triggerar gameQuestions-useMemo att
  // räkna om med korrekt unseen-prioritering.
  useEffect(() => {
    loadSeenQuestionIds().then(setSeenQuestionIds);
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
        hasLeft: leftPlayerIds.has(p.id),
      }));
    }
    return [youPlayer, ...MOCK_OPPONENTS];
  }, [turnOrder, youPlayer, fallbackAssistance, age, leftPlayerIds]);

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
        hasLeft: leftPlayerIds.has(p.id),
      };
    });
    return entries.sort((a, b) => {
      // 1. Pts desc — flest poäng vinner
      if (b.points !== a.points) return b.points - a.points;
      // 2. Spelare med 0 spelade ronder får avgResponseSeconds=0 vilket
      //    annars skulle leapfrogga ALLA spelare med faktisk data (0 < deras
      //    avg). Garantera att tom-data alltid sorteras sist.
      if (a.playedRounds === 0 && b.playedRounds > 0) return 1;
      if (b.playedRounds === 0 && a.playedRounds > 0) return -1;
      // 3. Avg response time asc — snabbare avg vinner vid pts-tie. Spelare
      //    som timeoutat alla frågor har avg=max-tiden; en spelare som hann
      //    svara (även fel) har lägre avg och ska därför ranka högre.
      return a.avgResponseSeconds - b.avgResponseSeconds;
    });
  }, [gamePlayers, gameTotals, allRoundScoresHistory, leftPlayerIds]);

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
  const confirmGlow = useRef(new Animated.Value(0.4)).current;
  // Next-tab:ens scale-pulse på reveal-vyn. Speglar startskärmens primary-
  // CTA-pulse (1 ↔ 1.03 over 900ms). Körs kontinuerligt — vid mount och
  // framåt — eftersom tab:en bara renderas i reveal-fasen ändå.
  const nextTabPulse = useRef(new Animated.Value(1)).current;
  // Blinkande "scroll for more"-indicator i botten på image-frågor. Prefix-
  // gridens 10 rader + Confirm-knappen ryms inte på en skärm — pilen
  // signalerar till spelaren att fortsätta scrolla. Opacity-loop 1 ↔ 0.3
  // (faster cadence än övriga pulses för att grab attention).
  const scrollHintOpacity = useRef(new Animated.Value(1)).current;
  // True när användaren scrollat tillräckligt nära botten att Confirm-knappen
  // är synlig — pilen göms då (annars blinkar den onödigt över Confirm).
  // Reset:as till false vid varje frågebyte så pilen återkommer på nästa
  // image-fråga oavsett föregående scroll-position.
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
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
  const isActorSelectQuestion = question.type === 'actor-select';
  const isLastQuestion = questionIndex === totalQuestions - 1;

  // Bygg image-variant runtime baserat på source + assistance + audience-set.
  // Memo:as på question-id + assistance så shuffle/distractor-pick körs ENDAST
  // när frågan byts eller spelarens assistance ändras (= turnordnings-rotation
  // i Pass-the-Phone). Annars skulle prefix-knappar randomiseras varje render
  // → ImageAnswerBlock skulle få ny variant-prop per frame.
  const imageVariant = useMemo<ImageQuestionVariant | null>(() => {
    if (question.type !== 'image') return null;
    // Filtrera distraktor-pool till samma contentSubject som det rätta svaret
    // (t.ex. bara 'band' för band-frågor, bara 'athlete' för idrottare).
    const sameSubject = IMAGE_QUIZ_QUESTIONS.filter(
      (q) => q.contentSubject === question.source.contentSubject,
    );
    // Genus-filter: om rätt svar är manligt/kvinnligt (härleds från pronomen i hints)
    // visas bara distraktorter med samma kön. Fallback till sameSubject om genus saknas
    // ELLER om genus-filtrerat pool < 5 (behöver minst 4 distraktorter + 1 rätt).
    // Faller ALDRIG tillbaka till IMAGE_QUIZ_QUESTIONS — subject-integritet alltid.
    const correctLib  = HINTS_LIBRARY[question.source.id];
    const correctGender = correctLib ? inferGender(correctLib) : null;
    const sameGender = correctGender
      ? sameSubject.filter((q) => {
          const lib = HINTS_LIBRARY[q.id];
          if (!lib) return true; // okänt kön → tillåt som distraktor
          const g = inferGender(lib);
          return g === null || g === correctGender;
        })
      : sameSubject;
    // Använd genus-pool om tillräckligt stor, annars subject-pool (aldrig alla subjects).
    const itemPool = sameGender.length >= 5 ? sameGender : sameSubject;
    return buildImageVariant(
      question.source,
      currentAssistance,
      audienceSetForVariants,
      itemPool,
      DISTRACTOR_POOL_NAMES[question.source.category] ?? [],
      5, // 5 svarsalternativ
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, currentAssistance, audienceSetForVariants]);
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
          // Actor-select (film-frågor) har YouTube-trailer-klipp.
          youtubeClips:
            question.type === 'timeline' || question.type === 'actor-select'
              ? question.youtubeClips
              : undefined,
        },
        { youtubeEnabled, gameMode },
      ),
    [question, youtubeEnabled, gameMode],
  );

  // D-iv: host:s player_id är alltid turnOrder[0] (Lobby-handleStartGame
  // bygger arrayen med host först). Används för default-audio-policyn
  // (host = on när override saknas) + GetReadyIntro:s "Host"-tagg på
  // audio-modal-raden.
  const hostPlayerId = turnOrder[0]?.id;
  // D-iv: ska denna enhet vara mute:ad under uppspelning? Pass-the-Phone
  // delar device → alltid ljud på. Vid direkt-nav utan selfPlayerId →
  // fallback till audio på så ljudet hörs i mock-mode. I IndDev läses
  // overrides-mappen; default-policyn kickar in vid saknad key.
  const isAudioMutedForSelf = useMemo(() => {
    if (gameMode === 'pass-the-phone') return false;
    if (!selfPlayerId) return false;
    if (Object.prototype.hasOwnProperty.call(playerAudioOverrides, selfPlayerId)) {
      return !playerAudioOverrides[selfPlayerId];
    }
    return !isHost;
  }, [gameMode, selfPlayerId, playerAudioOverrides, isHost]);
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
      // inget giltigt svar) och gå direkt till reveal.
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
        // Image/actor-select time-out: confirmed*-state förblir null,
        // reveal visar ✗ Wrong Answer + rätt svar.
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
    // Vilken spelare attribueras score:n till?
    //   • Pass-the-Phone: turnOrder[currentPlayerIndex] — aktiv spelare
    //     roterar mellan ronder, alla scoreposter går till "current"-rad:n.
    //   • Individual Devices: selfPlayerId — varje enhet är EN spelare.
    //     currentPlayerIndex stannar på 0 i IndDev (ingen rotation), så om
    //     vi också använde turnOrder[currentPlayerIndex] skulle ALLA scores
    //     på non-host:s enhet attribueras till host (turnOrder[0]) — vilket
    //     gjorde att non-host:s egen rad visade 0 i played rounds/correct/
    //     avg/pts genom hela spelet.
    //   • Direkt-nav utan turnOrder: 'you' som sista fallback.
    const activePlayerId =
      gameMode === 'individual-devices' && selfPlayerId
        ? selfPlayerId
        : (turnOrder[currentPlayerIndex]?.id ?? 'you');
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
    if (phase !== 'question' || !timerActive) return;
    startTimer();
  }, [questionIndex, phase, timerActive]);

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

  // Next-tab:ens kontinuerliga scale-pulse (1 ↔ 1.03 over 900ms each way) —
  // speglar startskärmens primary-CTA-pulse exakt. Körs på mount och framåt
  // utan phase-gating; tab:en är ändå bara monterad i reveal-fasen.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(nextTabPulse, { toValue: 1.03, duration: 900, useNativeDriver: true }),
        Animated.timing(nextTabPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [nextTabPulse]);

  // Scroll-hint-pulse på image-frågor (1 ↔ 0.3 opacity, 600ms varje håll).
  // Snabbare cadence än övriga pulses så down-chevronen blinkar tydligare och
  // grabbar attention. Körs kontinuerligt — pilen är ändå bara monterad när
  // phase + question-typ matchar.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scrollHintOpacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(scrollHintOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scrollHintOpacity]);

  // Reset scroll-hint-synlighet vid varje frågebyte — pilen ska återkomma
  // på nästa image-fråga oavsett om spelaren scrollat ner i föregående fråga.
  useEffect(() => {
    setScrolledToBottom(false);
    setYoutubeError(false);
    // Spotify: nollställ album art + DJ-startad-flagga per fråga.
    setSpotifyAlbumArtUrl(null);
    setSpotifyDJStarted(false);
  }, [questionIndex]);

  // Hämta albumomslag för Spotify-frågor (gissarnas vy).
  // Anropas varje gång currentSpotifyTrackId ändras (= nytt frågebyte).
  // DJ ser inte albumomslaget (de vet svaret) — men vi hämtar det ändå
  // för reveal-fasen där alla ser det korrekt svaret.
  useEffect(() => {
    if (!currentSpotifyTrackId) return;
    let cancelled = false;
    fetchSpotifyAlbumArt(currentSpotifyTrackId).then((url) => {
      if (!cancelled && url) setSpotifyAlbumArtUrl(url);
    });
    return () => { cancelled = true; };
  }, [currentSpotifyTrackId]);

  // ScrollView:s onScroll → räkna avstånd från content-botten. När < 24 px
  // kvar (≈ Confirm-knappen är fully visible) → setScrolledToBottom(true) →
  // pilen göms via gate i JSX. useCallback för att inte re-skapa handler:n
  // per render (ScrollView re-mountar då).
  const handleScrollHintScroll = useCallback((e: {
    nativeEvent: {
      contentOffset: { y: number };
      layoutMeasurement: { height: number };
      contentSize: { height: number };
    };
  }) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    setScrolledToBottom(distanceFromBottom <= 24);
  }, []);

  // 2-decimal countdown-tick (20 Hz). Körs ENDAST i 'question'-fasen — så
  // fort spelaren confirmar (phase → 'awaiting') stoppas tick:n och displayen
  // fryses på exakt confirm-värdet (sätts explicit i handleConfirm). I
  // intro/countdown/reveal/leaderboard återställs till "30.00".
  useEffect(() => {
    const totalMs = responseSeconds * 1000;
    if (phase !== 'question' || !timerActive) {
      if (phase === 'intro' || phase === 'countdown' || !timerActive) {
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
  }, [phase, questionIndex, responseSeconds, timerActive]);

  // Spara alla unika fråge-IDs i denna omgång när spelet är klart.
  // savedSeenRef förhindrar dubbelskrivning om effekten av någon anledning
  // re-fyrar. seenQuestionIds-state uppdateras lokalt också så nästa Play
  // Again direkt i samma session redan ser de nyss spelade frågorna.
  useEffect(() => {
    if (phase !== 'leaderboard' || savedSeenRef.current) return;
    savedSeenRef.current = true;
    const playedIds = [...new Set(gameQuestions.map((q) => q.id))];
    addSeenQuestionIds(playedIds).then(() =>
      setSeenQuestionIds((prev) => new Set([...prev, ...playedIds])),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // "Kan användaren confirma just nu?" — discriminerad-union-helper.
  // Musik: pendingYear satt. Bild: aktiv direkt när hints visas (hintsReady)
  // så knappen pulsar från start — spelaren väljer svar och trycker sedan Confirm.
  // Klick utan valt svar gör ingenting (handleConfirmName-grenen checkar pendingNameOption).
  // DJ kan aldrig confirma (de svarar inte på Spotify-frågor).
  const canConfirm = isCurrentPlayerDJ
    ? false
    : isImageQuestion
      ? hintsReady
      : isActorSelectQuestion
        ? pendingActorName !== null
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
      confirmGlow.setValue(0.4);
      return;
    }
    // Cadensen (1.03 scale + 0.4↔0.85 opacity, 1100ms varje håll) speglar
    // Lobby:s Start Game-CTA exakt så de två "go-action"-knapparna i
    // host-flödet andas i samma rytm.
    const scaleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(confirmPulse, { toValue: 1.03, duration: 1100, useNativeDriver: true }),
        Animated.timing(confirmPulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
      ]),
    );
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(confirmGlow, { toValue: 0.85, duration: 1100, useNativeDriver: true }),
        Animated.timing(confirmGlow, { toValue: 0.4, duration: 1100, useNativeDriver: true }),
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
    // Defensiv guard: handleConfirm är timeline-specifik (year-baserad).
    // Image-frågor anropar handleConfirmName istället. Skydd mot fel-binding i UI.
    if (question.type !== 'timeline') return;
    // Timer:n stoppas INTE — alla spelare får samma tidsbudget oavsett när
    // de bekräftade. Reveal-feedbacken visas först när timer:n går till 0
    // (i useEffect:en på timeLeft nedan).
    const interval = getIntervalForAssistance(currentAssistance);
    const correct = isCorrect(year, question.correctYear, interval, eraFrom, eraTo);
    const pts = calculatePoints(correct, currentAssistance, 'year');
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
    // Markera own confirm lokalt + broadcast till andra devices så deras
    // timer-bar uppdaterar avatar-positionen för denna spelare. Gated på
    // IndDev — i Pass-the-Phone delar alla samma enhet/markör.
    if (gameMode === 'individual-devices' && selfPlayerId) {
      setPlayerConfirms((prev) => ({ ...prev, [selfPlayerId]: exactElapsedSec }));
      if (syncChannelRef.current) {
        syncChannelRef.current
          .broadcastPlayerAnswerConfirmed({
            player_id: selfPlayerId,
            time_used: exactElapsedSec,
          })
          .catch(() => {});
      }
    }
    setPhase('awaiting');
  };

  // YouTube-felhantering: kallas när MediaPlayer rapporterar embed-fel.
  // Räknas som missad fråga (0 pts) — spelaren kunde inte se videon.
  // Övergår till reveal-fas efter 2.5 s så rätt svar visas ändå.
  // Gated på 'question'-fas: om felet fyrar under awaiting/reveal har
  // score:n redan registrerats och vi ska inte dubbel-räkna.
  // recordRoundScore är en vanlig funktion (inte useCallback) — referensen
  // är stabil per render, ref-pattern undviker stale-closure utan dep-array.
  const recordRoundScoreRef = useRef(recordRoundScore);
  recordRoundScoreRef.current = recordRoundScore;
  const handleYoutubeError = useCallback(() => {
    if (phase !== 'question') return;
    if (youtubeError) return;
    setYoutubeError(true);
    recordRoundScoreRef.current(0, false, responseSeconds);
    setTimeout(() => setPhase('reveal'), 2500);
  }, [phase, youtubeError, responseSeconds]);

  // Image-fråge-Confirm: speglar handleConfirm men för name-svar.
  // correct = opt.isCorrect (pre-baked från distractor-builderns rätt-flagga).
  const handleConfirmName = (opt: ImageNameOption) => {
    if (question.type !== 'image') return;
    const correct = opt.isCorrect;
    const pts = calculatePoints(correct, currentAssistance, 'name');
    const totalMs = responseSeconds * 1000;
    const exactElapsedMs = Math.max(0, Date.now() - questionStartMsRef.current);
    const exactElapsedSec = Math.min(responseSeconds, exactElapsedMs / 1000);
    setConfirmedTimeUsed(exactElapsedSec);
    const elapsedAtConfirm = Math.min(totalMs, Math.max(0, exactElapsedMs));
    setDecimalElapsedMs(elapsedAtConfirm);
    setConfirmedNameOption(opt);
    // RoundResult-shapen är timeline-formad (correctYear/selectedYear som number).
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
    if (gameMode === 'individual-devices' && selfPlayerId) {
      setPlayerConfirms((prev) => ({ ...prev, [selfPlayerId]: exactElapsedSec }));
      if (syncChannelRef.current) {
        syncChannelRef.current
          .broadcastPlayerAnswerConfirmed({
            player_id: selfPlayerId,
            time_used: exactElapsedSec,
          })
          .catch(() => {});
      }
    }
    setPhase('awaiting');
  };

  // Actor-select-Confirm: speglar handleConfirmName men för filmfrågor.
  // correct = spelarens val finns i question.correctNames.
  const handleConfirmActor = (name: string) => {
    if (question.type !== 'actor-select') return;
    const correct = question.correctNames.includes(name);
    const pts = calculatePoints(correct, currentAssistance, 'name');
    const totalMs = responseSeconds * 1000;
    const exactElapsedMs = Math.max(0, Date.now() - questionStartMsRef.current);
    const exactElapsedSec = Math.min(responseSeconds, exactElapsedMs / 1000);
    setConfirmedTimeUsed(exactElapsedSec);
    const elapsedAtConfirm = Math.min(totalMs, Math.max(0, exactElapsedMs));
    setDecimalElapsedMs(elapsedAtConfirm);
    setConfirmedActorName(name);
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
    if (gameMode === 'individual-devices' && selfPlayerId) {
      setPlayerConfirms((prev) => ({ ...prev, [selfPlayerId]: exactElapsedSec }));
      if (syncChannelRef.current) {
        syncChannelRef.current
          .broadcastPlayerAnswerConfirmed({
            player_id: selfPlayerId,
            time_used: exactElapsedSec,
          })
          .catch(() => {});
      }
    }
    setPhase('awaiting');
  };

  // ── Navigations-handlers ────────────────────────────────────────────────

  // Från Reveal: visa leaderboard
  const handleShowLeaderboard = () => {
    setPhase('leaderboard');
  };

  // D-iii: non-host:s Retry-knapp i ConnectionUnstableOverlay. Rensar
  // sticky-latch + pending-answer-state + routar till intro + broadcastar
  // player_rejoined så A:s leaderboard flippar oss från 'disconnected'
  // tillbaka till connected (heartbeat ENSAM gör inte det per design).
  // När host sedan broadcastar play_command kör B:s playCommandHandler
  // som vanligt (sticky är nu false → ingen ignore).
  const handleRetryFromUnstable = () => {
    setPendingYear(null);
    setSelectedYear(null);
    setPendingNameOption(null);
    setConfirmedNameOption(null);
    setPendingActorName(null);
    setConfirmedActorName(null);
    setConfirmedTimeUsed(null);
    setStickyUnstableForQuestion(false);
    setPhase('intro');
    if (selfPlayerId && syncChannelRef.current) {
      syncChannelRef.current
        .broadcastPlayerRejoined({ sender_id: selfPlayerId })
        .catch(() => {
          // Fire-and-forget. Om broadcast fail:ar (t.ex. flapping connection)
          // sitter A med stale 'disconnected'-flag. Acceptabelt MVP — B kan
          // försöka tapa Retry igen vid nästa stable-moment.
        });
    }
  };

  // Från Reveal eller Leaderboard: hoppa direkt till nästa fråga.
  // `explicitNextIndex` används av non-host:s questionAdvanceHandler för
  // att synka till broadcast:ens canonical-värde — om B missade tidigare
  // question_advance medan offline skulle +1 ge stale index. Host:s
  // lokala Next-tap kallar utan arg → faller tillbaka till +1 (host är
  // alltid canonical så drift kan inte uppstå).
  const handleAdvanceToNextRound = (explicitNextIndex?: number) => {
    if (explicitNextIndex !== undefined) {
      setQuestionIndex(explicitNextIndex);
    } else {
      setQuestionIndex((prev) => prev + 1);
    }
    setSelectedYear(null);
    setPendingYear(null);
    setConfirmedTimeUsed(null);
    // Reset image- + actor-select-state så nästa fråga (oavsett typ) startar rent.
    setPendingNameOption(null);
    setConfirmedNameOption(null);
    setPendingActorName(null);
    setConfirmedActorName(null);
    // Reset per-spelare-confirm-mappen så nästa frågas avatar-markörer
    // börjar från höger kant igen. hasLeft-flag:n påverkas inte.
    setPlayerConfirms({});
    // Båda lägen återgår till GetReady (intro-fasen) mellan frågor:
    // - Pass-the-Phone: telefonen lämnas över till nästa spelare;
    //   currentPlayerIndex roterar.
    // - Individual Devices: host kontrollerar speltempot — Play-tap i
    //   GetReady startar nästa fråga och broadcastar till non-host:s
    //   enheter. Ingen player-rotation (alla på egna devices).
    if (gameMode === 'pass-the-phone' && turnOrder.length > 0) {
      setCurrentPlayerIndex((prev) => (prev + 1) % turnOrder.length);
    }
    setPhase('intro');
  };

  // ── Spotify DJ-handlers ───────────────────────────────────────────────────
  /**
   * DJ:n trycker "Starta låten i Spotify".
   * 1. Öppnar Spotify-appen via deep link (Linking.openURL).
   * 2. Markerar DJ-startad lokalt (knapptext → ✓).
   * 3. Broadcastar spotify_dj_track_started (IndDev) så gissarnas timer-text
   *    uppdateras från "Väntar på DJ…" → "Gissa nu!".
   */
  const handleStartSpotifyTrack = async () => {
    if (!currentSpotifyTrackId || spotifyDJStarted) return;
    const ok = await openSpotifyTrack(currentSpotifyTrackId);
    if (ok) {
      setSpotifyDJStarted(true);
      if (gameMode === 'individual-devices' && syncChannelRef.current && currentDJPlayer) {
        syncChannelRef.current
          .broadcastSpotifyDJTrackStarted({
            dj_player_id: currentDJPlayer.id,
            spotify_track_id: currentSpotifyTrackId,
          })
          .catch(() => {});
      }
    }
  };

  // ── IndDev host-broadcast-wrappers ───────────────────────────────────────
  // Host:s Play-tap: 2 s dramatisk paus innan nedräkning startar.
  // Broadcast skickas efter samma fördröjning så host + non-host synkar.
  const handleHostStartFromGetReady = () => {
    setPhase('countdown');
    if (gameMode === 'individual-devices' && syncChannelRef.current) {
      syncChannelRef.current
        .broadcastPlayCommand({ question_index: questionIndex })
        .catch(() => {});
    }
  };
  // Host:s Next-tap i reveal: trigga lokal handleAdvance + broadcast.
  // isLastQuestion-fallet broadcastar next_question_index=null så non-host
  // går till leaderboard, men host själv kör handleShowLeaderboard via
  // existing Next-tab-callback (denna funktion täcker bara non-last-fallet).
  const handleHostAdvanceFromReveal = () => {
    handleAdvanceToNextRound();
    if (gameMode === 'individual-devices' && syncChannelRef.current) {
      syncChannelRef.current
        .broadcastQuestionAdvance({ next_question_index: questionIndex + 1 })
        .catch(() => {});
    }
  };
  // Host:s Final Leaderboard-tap.
  const handleHostShowLeaderboard = () => {
    handleShowLeaderboard();
    if (gameMode === 'individual-devices' && syncChannelRef.current) {
      syncChannelRef.current
        .broadcastQuestionAdvance({ next_question_index: null })
        .catch(() => {});
    }
  };
  // D-iv: host togglar audio för en spelare via GetReady-modalen.
  // Trippelt parallellt: optimistisk lokal state (UI uppdateras direkt),
  // Supabase-persist (cross-device durability) + broadcast (fast-path så
  // den drabbade spelarens device mute:as inom <100ms istället för att
  // vänta på Realtime-postgres-changes). Body:n är fire-and-forget; om
  // Supabase-write fail:ar fortsätter broadcast:en så lokal session inte
  // blockas av nätverks-glitch.
  const handlePlayerAudioChange = useCallback(
    (playerId: string, audioOn: boolean) => {
      setPlayerAudioOverridesState((prev) => ({ ...prev, [playerId]: audioOn }));
      if (params.roomCode) {
        setPlayerAudioOverride(params.roomCode, playerId, audioOn).catch(() => {});
      }
      if (gameMode === 'individual-devices' && syncChannelRef.current) {
        syncChannelRef.current
          .broadcastPlayerAudioStateChanged({ player_id: playerId, audio_on: audioOn })
          .catch(() => {});
      }
    },
    [params.roomCode, gameMode],
  );

  // D-v: host:s tap-signal. Anropas av onTouchStart-wrapper på alla
  // return-paths. Resetar host:s egen lastHostActivityRef + broadcastar
  // host_active_ping (throttlat till max 1/5s — fortsatta taps inom
  // fönstret skippar broadcast men resetar fortfarande egna ref:en så
  // host:s lokala countdown inte triggar oönskat).
  const signalHostActivity = useCallback(() => {
    if (gameMode !== 'individual-devices' || !isHost) return;
    const now = Date.now();
    lastHostActivityRef.current = now;
    if (now - lastPingEmittedRef.current < 5000) return;
    lastPingEmittedRef.current = now;
    syncChannelRef.current
      ?.broadcastHostActivePing({
        sender_id: selfPlayerId,
        // D-vi: bär questionIndex så non-host som missat broadcasts under
        // offline kan sync:a vid nästa mottagna ping (heal-on-reconnect).
        question_index: questionIndex,
      })
      .catch(() => {});
  }, [gameMode, isHost, selfPlayerId, questionIndex]);

  // D-v: shutdown vid 10 min host-inaktivitet. Host river rummet
  // (deactivateRoom + clear all stores) så stale data inte ärver in
  // i nästa session. Non-host hoppar över cleanup — det är host:s
  // ansvar; pg_cron tar hand om force-quit-fallet via 24h-expiry på
  // rooms-tabellen. Båda får samma Alert + Home-nav.
  const handleInactivityShutdown = useCallback(async () => {
    if (inactivityShutdownTriggeredRef.current) return;
    inactivityShutdownTriggeredRef.current = true;
    if (isHost && params.roomCode) {
      try {
        await deactivateRoom(params.roomCode);
      } catch {
        /* fortsätt även om cleanup fail:ar */
      }
      clearLeftPlayers(params.roomCode);
      clearLobbyPlayers(params.roomCode);
      clearLobbySettings(params.roomCode);
      clearEjected(params.roomCode);
      clearGameStarted(params.roomCode);
    }
    Alert.alert(
      'Game ended',
      'Game ended due to host inactivity.',
      [{ text: 'OK', onPress: () => router.replace('/') }],
      { cancelable: false },
    );
  }, [isHost, params.roomCode]);

  // D-v: 1-sek interval som driver banner-countdown + shutdown-trigger.
  // Värdet räknas alltid från lastHostActivityRef (host-egen aktivitet
  // eller mottagen ping) så host + non-host konvergerar på samma
  // shutdown-tid utan att behöva broadcasta nedräkningen i sig.
  // Trigger-trösklar: 59 min = banner startar; 60 min = shutdown
  // (= 60-sek-countdown). Total tolerans = 1 timme utan host-aktivitet.
  useEffect(() => {
    if (gameMode !== 'individual-devices') return;
    const INACTIVITY_BANNER_MS = 59 * 60 * 1000;
    const INACTIVITY_SHUTDOWN_MS = 60 * 60 * 1000;
    const interval = setInterval(() => {
      const gap = Date.now() - lastHostActivityRef.current;
      if (gap >= INACTIVITY_SHUTDOWN_MS) {
        handleInactivityShutdown();
      } else if (gap >= INACTIVITY_BANNER_MS) {
        const remaining = Math.max(
          0,
          Math.ceil((INACTIVITY_SHUTDOWN_MS - gap) / 1000),
        );
        setInactivityCountdownSec(remaining);
      } else {
        setInactivityCountdownSec((prev) => (prev === null ? prev : null));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [gameMode, handleInactivityShutdown]);

  // ── Broadcast-listener-refs ──────────────────────────────────────────────
  // Skriv färska handlers in i refs varje render så subscription-callback:n
  // (etablerad en gång på mount) alltid kallar latest logic. Non-host kör
  // samma transition-funktioner som host (lokalt) — de är idempotenta.
  useEffect(() => {
    playCommandHandlerRef.current = (qIdx) => {
      // D-iii sticky-gate: om spelaren är låst i unstable-overlay (sticky
      // ELLER live-unstable) → IGNORERA play_command. Spelaren kvarstår i
      // sin nuvarande fas + overlay tills de explicit tappar Retry. Detta
      // är central design-regel: B kan inte hoppa in i ny fråga utan att
      // ha bekräftat sig som "tillbaka" via Retry → broadcast player_rejoined.
      // questionIndex hålls synkad via question_advance (som processas
      // oavsett sticky), så när B sedan retry:ar är de redo för nästa
      // play_command direkt.
      if (stickyUnstableForQuestion || isConnectionUnstable) {
        return;
      }
      // Sync questionIndex från broadcast — kritiskt för reconnect-fallet:
      // om B var offline under host:s tidigare question_advance kan B:s
      // lokala questionIndex vara stale (peka på en gammal fråga). Host:s
      // play_command bär canonical question_index → vi alignar B direkt.
      // setQuestionIndex är idempotent när qIdx === questionIndex, så
      // normalfallet (B var online och redan synkad) är no-op.
      setQuestionIndex(qIdx);
      // Reset answer-state så B inte ärver pending-svar från förra fråga
      // (kan finnas kvar om B retry:ade i sticky-låst tillstånd och inte
      // nådde nästa rondens normalt-rensa-path via handleAdvanceToNextRound).
      setPendingYear(null);
      setSelectedYear(null);
      setPendingNameOption(null);
      setConfirmedNameOption(null);
      setPendingActorName(null);
      setConfirmedActorName(null);
      setConfirmedTimeUsed(null);
      // Defensiv: bara från intro-phase tillåts countdown-transition.
      // Skyddar mot late-arriving broadcasts efter att non-host redan
      // advancerat (t.ex. via reconnect i D-vi senare).
      setPhase((current) => (current === 'intro' ? 'countdown' : current));
    };
    questionAdvanceHandlerRef.current = (nextIdx) => {
      if (nextIdx === null) {
        handleShowLeaderboard();
      } else {
        // Passa canonical-indexet från broadcast så B alignar även när
        // tidigare advances missats (offline-fönster). Utan denna sync
        // skulle dot-bar:ens currentQuestion-räknare stanna kvar bakom
        // host i en eller flera frågor.
        handleAdvanceToNextRound(nextIdx);
      }
    };
    // Mottagare av player_left: alla klienter (inkl. host) markerar
    // spelaren som hasLeft. Host visar dessutom en Alert-popup. Spelaren
    // själv har redan navigerat till '/' innan broadcast skickas, så de
    // ser aldrig sin egen "Has left"-rad.
    playerLeftHandlerRef.current = (playerId, playerName) => {
      setLeftPlayerIds((prev) => {
        if (prev.has(playerId)) return prev;
        const next = new Set(prev);
        next.add(playerId);
        return next;
      });
      if (isHost) {
        Alert.alert(`${playerName} has left`, undefined, [{ text: 'OK' }]);
      }
    };
    // Mottagare av player_answer_confirmed: uppdatera per-spelare-confirm-
    // mappen så timer-bar:ens avatar-markörer fryses vid sin position på
    // alla devices. Self-confirms hanteras lokalt i handleConfirm; denna
    // listener fyrar bara för andra spelares confirms.
    playerAnswerConfirmedHandlerRef.current = (playerId, timeUsed) => {
      setPlayerConfirms((prev) => {
        if (prev[playerId] !== undefined) return prev;
        return { ...prev, [playerId]: timeUsed };
      });
    };
    // Mottagare av response_seconds_changed: host ändrade Answer response
    // time i GetReady mellan ronder. Non-host:s read-only-display + timer-
    // budgeten nästa fråga uppdateras till host:s nya värde.
    responseSecondsChangedHandlerRef.current = (seconds) => {
      setResponseSeconds(seconds);
    };
  });

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

    // Append:a HistoryEntry till Player history-listan med game-time-
    // settings frozna (age, assistance, era). Age beräknas från
    // profilen:s birthYear vid speltillfället. assistance/era läses
    // från quiz-state vid kall-tiden (= värden som faktiskt användes
    // i spelet). Tom rounds-array (shouldn't happen men defensiv) →
    // skippa append:n så vi inte spammar 0/NaN-entries.
    if (rounds.length > 0) {
      const totalTime = rounds.reduce((sum, r) => sum + (r.timeUsed ?? 0), 0);
      const correctAnswers = rounds.filter((r) => r.correct).length;
      const profile = await loadProfile();
      const birthYear = profile?.birthYear;
      const age =
        typeof birthYear === 'number'
          ? new Date().getFullYear() - birthYear
          : 0;
      const entry: HistoryEntry = {
        id: result.id,
        date: result.date,
        correctAnswers,
        totalQuestions: rounds.length,
        avgResponseSeconds: totalTime / rounds.length,
        age,
        assistance: fallbackAssistance,
        eraFrom,
        eraTo,
        selectedExtraPackages,
        youtubeEnabled,
        imagesEnabled,
      };
      try {
        await appendGameHistoryEntry(entry);
      } catch {
        // Profile history kan visa stale-state utan denna append — inget
        // som ska blockera leaderboard-rendering.
      }
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
    // Bygg carry-over-listan UTANFÖR if/else så vi kan referera den senare
    // för att skriva direkt till lobby_players-tabellen (innan broadcast)
    // — annars hinner inte host:s LobbyScreen mounta + skriva via useEffect
    // innan non-host:s LobbyScreen:s `getLobbyPlayers` läser för att hitta
    // ev. pre-seeded matchande rad → race ger duplicate-row.
    let carryOverPlayers: LobbyPlayer[];
    if (reusePlayers) {
      // Behåll alla spelare från detta spel. Non-hosts får `approved:
      // false` så de hamnar i "To be approved by Host"-listan i nya
      // lobbyn — host måste re-approva dem innan nästa Start Game.
      // Host själv är alltid implicit approved.
      carryOverPlayers = allPlayers.map((p) => ({
        id: p.id,
        name: p.isYou ? hostName : p.name,
        emoji: p.isYou ? hostEmoji : p.emoji,
        isReady: true,
        type: 'registered' as const,
        age: keepSettings || p.isYou ? p.age : 30,
        assistance: keepSettings || p.isYou ? p.assistance : 'standard',
        hcpComplete: true,
        isHost: p.isHost ?? false,
        approved: !!p.isHost,
      }));
      await savePendingLobbyPlayers(carryOverPlayers);
    } else {
      // Tom lobby förutom host. **KRITISKT**: host:s id MÅSTE vara `'1'`
      // (= SEED_PLAYERS[0].id i LobbyScreen) eftersom LobbyScreen:s mount-
      // sekvens först sätter `players = [SEED_PLAYERS[0]]` (id='1') och
      // useEffect på `[players]` skriver den raden till lobby_players-
      // tabellen INNAN consumePendingLobbyPlayers() hinner ersätta state
      // med carry-over:n. Om carry-over:s host-id skiljer sig (t.ex. 'you')
      // skapar consumePendingLobbyPlayers + nästa useEffect-write en ANDRA
      // host-rad i DB:n — setLobbyPlayers UPSERT:ar utan att DELETE:a stale
      // rader, så Alex K-raden (id='1') överlever och visas för non-host
      // som en tredje (fantom) spelare i leaderboard + timeline-banner
      // under quiz. Genom att matcha id='1' träffar carry-over-skrivningen
      // SAMMA DB-rad → bara name/emoji uppdateras, ingen extra host-rad.
      carryOverPlayers = [{
        id: '1',
        name: hostName,
        emoji: hostEmoji,
        isReady: true,
        type: 'registered',
        age,
        assistance: fallbackAssistance,
        hcpComplete: true,
        isHost: true,
      }];
      await savePendingLobbyPlayers(carryOverPlayers);
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
      gameStarted: false,
    });
    // Färsk leftPlayers-store + lobbyPlayers-store + ejected-store för nya
    // koden — undviker stale test-data och garanterar att non-host:s polling
    // startar tomt utan eject-status från en tidigare session.
    clearLeftPlayers(newCode);
    clearLobbyPlayers(newCode);
    clearLobbySettings(newCode);
    clearEjected(newCode);
    clearGameStarted(newCode);
    // KRITISKT race-fix: skriv carry-over-listan DIREKT till lobby_players
    // (innan broadcastPlayAgainLobbyReady nedan). Annars hinner inte host:s
    // LobbyScreen mounta + skriva via useEffect innan non-host:s LobbyScreen
    // ankommer och läser `getLobbyPlayers` för dup-detection — non-host
    // skulle då inte hitta sin pre-seeded rad och skapa ett nytt joiner-id,
    // vilket resulterar i två rader med samma playerName.
    if (reusePlayers && params.roomCode && carryOverPlayers.length > 0) {
      // Re-mappa id:t med rumkoden i prefixet så lobby_players-rader inte
      // krockar med det gamla rummet (vi behåller bara namn/age/assistance/
      // approved-data; id:t är rumspecifikt). Faktiskt — vi vill BEHÅLLA
      // id:t exakt så non-host:s ownPlayerId från quiz-sessionen mappar
      // direkt till sin rad i nya rummet via dup-detection-fixet.
      await setLobbyPlayers(newCode, carryOverPlayers).catch(() => {
        // Tyst — vid fail fall:er host:s LobbyScreen-useEffect tillbaka
        // till sin egen write, så nya lobbyn fungerar ändå (dock med
        // potentiell race för non-host).
      });
    }
    // Carry-over av game-settings när host valt "Yes, keep them" + "Keep
    // settings". Läser föregående rums lobby_settings-rad och upsert:ar
    // den på nya rumkoden — bevarar gameMode (PtP/IndDev),
    // singlePlayerDefault (= single-player-läget), roundsCount, eraFrom,
    // eraTo, region, samt media-toggles. answerResponseSeconds override:as
    // med host:s AKTUELLA quiz-state (kan ha justerats mid-game via
    // GetReadyIntro:s dropdown). Vid keepSettings=false (Start fresh)
    // lämnar vi nya rummet utan settings-rad så LobbyScreen:s host-seed
    // -effekt fyller den från profilens host-defaults.
    if (keepSettings && params.roomCode) {
      const oldSettings = await getLobbySettings(params.roomCode);
      if (oldSettings) {
        await setLobbySettings(newCode, {
          ...oldSettings,
          answerResponseSeconds: responseSeconds,
        }).catch(() => {
          // Tyst — om upsert fail:ar fall:er nya lobbyn bara tillbaka till
          // host-profil-defaults, vilket är OK degradation istället för att
          // blockera Play Again-flödet.
        });
      }
    }
    // Broadcasta nya rumkoden till non-host:s syncChannel INNAN navigation —
    // när host:s component unmountar rivs sync:n så non-host slutar lyssna.
    // Non-host:s leaderboard har själv en aktiv syncChannel som tar emot
    // detta event och routar dem till nya lobbyn (förutsatt att de tappat
    // Approve Play Again). Fire-and-forget; om send fail:ar (rara race)
    // hänger non-host kvar på lock-overlay tills timeout/manual exit, men
    // host:s egna nav-flow får aldrig blockas.
    if (gameMode === 'individual-devices' && syncChannelRef.current) {
      await syncChannelRef.current
        .broadcastPlayAgainLobbyReady({ room_code: newCode })
        .catch(() => {});
    }
    router.replace(`/lobby?code=${newCode}&isHost=true`);
  };

  // Sekventiell Alert-flow: först fråga om spelarna ska följa med, sedan
  // (om ja) en uppföljning om per-spelare-settings ska bevaras eftersom de
  // kan ha redigerats av host under spelet/i Lobby:n. iOS Alert har max 3
  // knappar utan radbryt — därav två steg istället för 4-vägs-prompt.
  //
  // `withCancel`-flaggan inkluderar en extra Cancel-knapp (3 totalt).
  // Används av single-player-Play-Again-flödet där "Re-use all players?"-
  // alerten skippas helt och denna popup blir det enda Play Again-steget
  // — host måste då ha en utväg utan att tvingas välja Reset eller Keep.
  // Vid multi-player anrop:as den utan flagga (= 2 knappar) eftersom den
  // föregående "Yes, keep them"-tap:en redan motsvarade en Cancel-möjlighet.
  const askKeepSettingsThenGo = (withCancel = false) => {
    // Title växlar beroende på single-player (withCancel=true) vs multi-
    // player: single-player har bara en spelare = host så "per player"-
    // formuleringen är missvisande; använd "for lobby" istället för att
    // signalera att det är lobby-wide settings som diskuteras.
    const title = withCancel
      ? 'Keep same setting for lobby'
      : 'Keep same settings per player?';
    Alert.alert(
      title,
      'Settings (assistance level + age) may have been edited during this game. Keep them or reset to defaults?',
      withCancel
        ? [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Reset', onPress: () => goToNewLobby(true, false) },
            { text: 'Keep settings', onPress: () => goToNewLobby(true, true) },
          ]
        : [
            { text: 'Reset', onPress: () => goToNewLobby(true, false) },
            { text: 'Keep settings', onPress: () => goToNewLobby(true, true) },
          ],
    );
  };

  const handlePlayAgain = async () => {
    // Broadcasta intent IMMEDIATELY innan vi öppnar dialogerna — non-host:s
    // "Approve Play Again"-knapp ska lysa upp så snart host tappat, oavsett
    // hur lång tid host tar på sig i credit-gate-popupen eller re-use-
    // players-alerten. Om host avbryter (Cancel i credit-gate eller re-use-
    // dialog) håller knappen kvar aktiv tills antingen non-host själva
    // lämnar eller host trycker Play Again igen + slutför flödet.
    if (gameMode === 'individual-devices' && syncChannelRef.current) {
      syncChannelRef.current
        .broadcastPlayAgainInitiated({ sender_id: selfPlayerId })
        .catch(() => {});
    }

    // Host Game Credits-gate (samma som Home:s Create Game + Lobby:s Start
    // Game): blockera Play Again om både Free och Extras är 0. loadProfile()
    // refreshar Free-saldot vid första load efter midnatt CET så vi alltid
    // jämför mot aktuellt värde. Bättre att fånga det här innan vi visar
    // re-use-players-prompten — annars fyller man i 2 alerts och får sedan
    // blockaden i Lobby:n vid Start Game.
    const [freshProfile, hasPremium] = await Promise.all([
      loadProfile(),
      hasPremiumSubscription(),
    ]);
    // Membership = obegränsade host-spel; ingen gate. Lobby:s handleStartGame
    // skippar också deduktionen så Free/Extras-saldon förblir orörda.
    if (!hasPremium) {
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
            { text: 'Go to Store', onPress: () => router.push('/store?focus=credits') },
          ],
        );
        return;
      }
    }

    // För Pass-the-Phone (= alla på samma enhet) finns inga non-hosts att
    // vänta in → använd vanlig Alert direkt. För Individual Devices visar
    // vi custom modal istället så vi kan rendera "Yes, keep them"-knappen
    // som utgråad tills alla non-hosts broadcastat sin Approve-signal.
    //
    // Single-player (= PtP med exakt 1 spelare i turnOrder) skippar
    // "Re-use all players?"-frågan helt — det finns ingen att "behålla"
    // utöver host själv. Istället hoppar vi direkt till "Keep same
    // settings?"-popupen med extra Cancel-knapp så host har en utväg
    // tillbaka till Final Leaderboard utan att tvingas till Reset/Keep.
    if (gameMode === 'pass-the-phone') {
      const isSinglePlayer = turnOrder.length === 1;
      if (isSinglePlayer) {
        askKeepSettingsThenGo(true);
      } else {
        Alert.alert(
          'Re-use all players?',
          'Start the next room with the same players, or begin fresh?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Start fresh', onPress: () => goToNewLobby(false) },
            { text: 'Yes, keep them', onPress: () => askKeepSettingsThenGo() },
          ],
        );
      }
    } else {
      // BEHÅLL existerande approvals när host re-tappar Play Again efter
      // Cancel. Non-host:s "Please Wait..."-overlay tas inte ner vid host:s
      // Cancel (deras awaitingNewLobby state lever vidare) så de re-broadcastar
      // inte sin Approve vid host:s andra Play Again-tap. Om vi reset:ade
      // approvals här hade "Yes, keep them"-knappen varit utgråad trots
      // att non-host redan tidigare godkänt — host skulle behöva nå non-host
      // via annan kanal för att be dem trycka Approve på nytt, vilket inte
      // funkar eftersom "Please Wait..."-overlay:n blockar tap. Att behålla
      // approvals löser det: host:s nästa Play Again-tap öppnar modal:en med
      // "Yes, keep them" redan upplåst om alla redan approvat.
      setPlayAgainModalVisible(true);
    }
  };

  const handleGoHome = async () => {
    // När host trycker Home från Final Leaderboard är lobby:n effektivt
    // stängd — Play Again-flödet är övergivet. Notifiera non-host:s
    // syncChannel + cleanup alla per-rum-stores så de inte fastnar på
    // "Please Wait..."-overlay:n (efter att de tappat Approve) eller
    // stannar passivt på Final Leaderboard. Gated på IndDev + host
    // eftersom Pass-the-Phone bara har en device.
    if (
      isHost &&
      gameMode === 'individual-devices' &&
      params.roomCode &&
      syncChannelRef.current
    ) {
      // Fire FÖRE deactivateRoom/clear så non-host:s syncChannel hinner
      // ta emot innan vi rivs vid component-unmount. Fire-and-forget —
      // ev. send-fail blockar inte host:s nav-flow.
      syncChannelRef.current
        .broadcastLobbyDeleted({ room_code: params.roomCode })
        .catch(() => {});
    }
    if (isHost && params.roomCode) {
      // Cleanup-bunten speglar Quit Game-flödet — stänger rummet i Supabase
      // (server-side flagga + RLS-stäng) och rensar alla per-rum-mock-stores.
      try {
        await deactivateRoom(params.roomCode);
      } catch {
        // Tyst — låt navigation gå igenom även om DB-roundtrip skulle failla.
      }
      clearLeftPlayers(params.roomCode);
      clearLobbyPlayers(params.roomCode);
      clearLobbySettings(params.roomCode);
      clearEjected(params.roomCode);
      clearGameStarted(params.roomCode);
    }
    router.replace('/');
  };

  // ── Non-host Play Again-flöde ───────────────────────────────────────────
  // Två oberoende state-bits driver knappens läge på Final Leaderboard:
  // - `hostInitiatedPlayAgain`: host har tappat Play Again-knappen (sin
  //   sida). Flippar Approve-knappen från dimmed → active.
  // - `nextLobbyCode`: host har skapat nytt rum + broadcastat koden.
  //   Driver auto-navigation till nya lobbyn så snart non-host tappat
  //   Approve.
  // - `awaitingNewLobby`: non-host har själv tappat Approve. Lås
  //   skärmen med overlay tills nextLobbyCode kommer in.
  //
  // Race-fall: om nextLobbyCode kommer FÖRE non-host tappat Approve
  // (host plöjde snabbt genom alerts), state hålls kvar tills tap. Tap
  // → useEffect:en nedanför ser båda värdena satta + navigerar.
  // Om non-host valt Home INNAN host:s tap → component unmountar →
  // syncChannel rivs → events tas inte emot → de stannar på Home.
  const [hostInitiatedPlayAgain, setHostInitiatedPlayAgain] = useState(false);
  const [nextLobbyCode, setNextLobbyCode] = useState<string | null>(null);
  const [awaitingNewLobby, setAwaitingNewLobby] = useState(false);

  // Host-side state: vilka non-hosts har broadcastat sin Approve-tap.
  // `playAgainApprovals` är en Set av player_id:n. När size === antal
  // non-hosts i turnOrder, är "Yes, keep them"-knappen i modal:en
  // upplyst (innan dess är den utgråad).
  const [playAgainApprovals, setPlayAgainApprovals] = useState<Set<string>>(
    () => new Set(),
  );
  // Host-side modal: visas istället för Alert.alert efter host:s
  // Play Again-tap så vi kan rendera disabled state visuellt.
  const [playAgainModalVisible, setPlayAgainModalVisible] = useState(false);

  const handleApprovePlayAgain = () => {
    if (!hostInitiatedPlayAgain) return; // belt-and-suspenders mot disabled tap
    setAwaitingNewLobby(true);
    // Broadcasta approval-signal till host:s syncChannel så host:s
    // counter triggas och "Yes, keep them"-knappen kan låsas upp när
    // alla non-hosts godkänt.
    if (
      gameMode === 'individual-devices' &&
      syncChannelRef.current &&
      selfPlayerId
    ) {
      syncChannelRef.current
        .broadcastPlayerApprovedPlayAgain({ player_id: selfPlayerId })
        .catch(() => {});
    }
  };

  // När båda non-host:s approval OCH host:s nya-lobby-event ankommit:
  // navigera till nya lobbyn. router.replace ersätter /quiz på Stack:n så
  // Back-knapp inte tar tillbaka till Final Leaderboard.
  useEffect(() => {
    if (awaitingNewLobby && nextLobbyCode) {
      router.replace(`/lobby?code=${nextLobbyCode}&isHost=false`);
    }
  }, [awaitingNewLobby, nextLobbyCode]);

  // Refs för broadcast-handlers — captureras av syncChannel-subscribe:n.
  const playAgainInitiatedHandlerRef = useRef<() => void>(() => {});
  const playAgainLobbyReadyHandlerRef = useRef<(code: string) => void>(() => {});
  const playerApprovedPlayAgainHandlerRef = useRef<(playerId: string) => void>(
    () => {},
  );
  // D-iv: handler för per-spelare audio-state-broadcast från host.
  // Alla klienter uppdaterar sin lokala overrides-map; den drabbade
  // spelarens device flippar mute via isMuted-prop till MediaPlayer.
  const playerAudioStateChangedHandlerRef = useRef<
    (playerId: string, audioOn: boolean) => void
  >(() => {});
  // D-v: handler för host-active-ping. Non-host:s receiver resetar
  // lastHostActivityRef när host bevisar liv. Host själv får aldrig
  // detta event (Realtime undertrycker self-echo). D-vi-utökning:
  // signaturen tar host:s questionIndex för heal-on-reconnect-sync.
  const hostActivePingHandlerRef = useRef<(questionIndex: number) => void>(
    () => {},
  );
  // Synkron mirror av awaitingNewLobby så lobby-ready-handler:n kan
  // läsa den AKTUELLA värden vid event-ankomst utan att vara beroende
  // av att useEffect:en hunnit uppdatera handler-closure:n. Skyddar mot
  // millisekund-race där non-host tappar Approve "samtidigt" som host:s
  // lobby-ready-event ankommer.
  const awaitingNewLobbyRef = useRef(awaitingNewLobby);
  awaitingNewLobbyRef.current = awaitingNewLobby;
  // Guard så popup:en "Host has already started"-inte fyrar flera
  // gånger om host av någon anledning broadcastar lobby_ready upprepade
  // gånger.
  const hostStartedWithoutMeAlertedRef = useRef(false);
  // Guard så lobby-deleted-popup:en inte fyrar dubbelt om host:s broadcast
  // skulle nå non-host flera gånger (race vid edge-case-disconnect).
  const lobbyDeletedAlertedRef = useRef(false);
  // Ref för broadcast-handler av lobby-deleted-event.
  const lobbyDeletedHandlerRef = useRef<() => void>(() => {});
  useEffect(() => {
    playAgainInitiatedHandlerRef.current = () => {
      if (!isHost) setHostInitiatedPlayAgain(true);
    };
    playAgainLobbyReadyHandlerRef.current = (code: string) => {
      if (isHost) return;
      if (awaitingNewLobbyRef.current) {
        // Non-host har tappat Approve och väntar med lock-overlay —
        // sätt koden så useEffect:en navigerar oss till nya lobbyn.
        setNextLobbyCode(code);
      } else if (!hostStartedWithoutMeAlertedRef.current) {
        // Non-host har INTE hunnit tappa Approve men host startar redan
        // nytt spel (= Start fresh-vägen, eftersom "Yes, keep them" är
        // utgråad tills alla approvat). Visa info-popup + skicka non-host
        // till startskärmen.
        hostStartedWithoutMeAlertedRef.current = true;
        Alert.alert(
          'Host has already started a new Game',
          '',
          [{ text: 'OK', onPress: () => router.replace('/') }],
          { cancelable: false },
        );
      }
    };
    playerApprovedPlayAgainHandlerRef.current = (playerId: string) => {
      // Bara host:s sida räknar approvals; non-hosts ignorerar
      if (!isHost) return;
      setPlayAgainApprovals((prev) => {
        if (prev.has(playerId)) return prev;
        const next = new Set(prev);
        next.add(playerId);
        return next;
      });
    };
    playerAudioStateChangedHandlerRef.current = (playerId, audioOn) => {
      // Speglar host:s ändring i lokal state — varje klient (inkl. host
      // själv om de skulle få eko, vilket Realtime undertrycker) håller
      // egen kopia av overrides-mappen. MediaPlayer:s isMuted re-evalu-
      // eras nästa render via useMemo-deps.
      setPlayerAudioOverridesState((prev) => ({ ...prev, [playerId]: audioOn }));
    };
    lobbyDeletedHandlerRef.current = () => {
      // Host har tappat Home från Final Leaderboard — lobby:n är stängd.
      // Bara non-host:s sida bryr sig (host själv broadcastar och navigerar
      // omedelbart). Visar info-Alert + auto-nav till startskärmen. Guard
      // mot dubbelfyrning via lobbyDeletedAlertedRef. Resetar
      // awaitingNewLobby så ev. "Please Wait..."-overlay släpps innan
      // popupen visas (Alert renderas över overlay:n, men cleanup gör
      // state-tree:t konsistent vid nav).
      if (isHost) return;
      if (lobbyDeletedAlertedRef.current) return;
      lobbyDeletedAlertedRef.current = true;
      setAwaitingNewLobby(false);
      Alert.alert(
        'Host has deleted this lobby',
        '',
        [{ text: 'OK', onPress: () => router.replace('/') }],
        { cancelable: false },
      );
    };
    hostActivePingHandlerRef.current = (hostQuestionIndex: number) => {
      // Host:s broadcast bekräftar liv → non-host resetar gap-tracker.
      // Detta är den ENDA vägen lastHostActivityRef uppdateras på
      // non-host-sidan; idle non-host:s tap dock påverkar inte ref:en
      // (vi spårar host:s aktivitet, inte vår egen).
      lastHostActivityRef.current = Date.now();
      // D-vi heal-on-reconnect: sync questionIndex mot host:s canonical
      // värde. Idempotent när redan synkad. Skyddar mot stale-index efter
      // offline-fönster där missade play_command/question_advance inte
      // replayas av Supabase Realtime.
      setQuestionIndex((prev) =>
        prev === hostQuestionIndex ? prev : hostQuestionIndex,
      );
    };
  }, [isHost]);

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
            // Spara frågor som visats hittills (index 0 till questionIndex-1)
            // så hosten inte ser dem igen vid nästa spelstart.
            if (questionIndex > 0) {
              const playedIds = [
                ...new Set(gameQuestions.slice(0, questionIndex).map((q) => q.id)),
              ];
              await addSeenQuestionIds(playedIds);
            }
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

  // Leave Game: non-host:s motsvarighet till Quit Game. Spelet och lobby:n
  // lever vidare för övriga; bara den här spelaren lämnar och navigerar Home.
  // Innan navigation broadcastar vi `player_left` till alla andra approved
  // enheter så host får popup + leaderboarden uppdateras med "Has left the
  // game" för spelaren. Fire-and-forget — om broadcast fail:ar (network
  // ned) blir host:s vy out-of-sync tills senare reconnect-flow, men user:s
  // navigation hem ska aldrig blockas.
  const handleLeaveGame = () => {
    Alert.alert(
      'Leave game?',
      'You will return to the start screen. The game continues for the other players.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave game',
          style: 'destructive',
          onPress: () => {
            if (
              gameMode === 'individual-devices' &&
              syncChannelRef.current &&
              selfPlayerId
            ) {
              const selfName =
                turnOrder.find((p) => p.id === selfPlayerId)?.name ?? 'Player';
              syncChannelRef.current
                .broadcastPlayerLeft({
                  player_id: selfPlayerId,
                  player_name: selfName,
                })
                .catch(() => {});
            }
            router.replace('/');
          },
        },
      ],
    );
  };

  // Cross-device-detection (Slice D-i): när host raderar rummet via Quit
  // Game ska non-host:s /quiz-skärm få samma "Game has been deleted by
  // Host"-popup som LobbyScreen visar. Realtime-DELETE-event på rooms-
  // tabellen är canonical-signalen. Gated på !isHost — host:en initierade
  // delete:n och navigerar bort själv, så vi behöver inte poppa något åt
  // dem. Samma defensive channel-cleanup-pattern som LobbyScreen så
  // remount inte racear med stale-subscribed-channels.
  const [hostDeletedDetected, setHostDeletedDetected] = useState(false);
  useEffect(() => {
    if (isHost || !params.roomCode) return;
    const code = params.roomCode;
    const topic = `realtime:quiz_room:${code}`;
    supabase.getChannels()
      .filter((c) => c.topic === topic)
      .forEach((c) => supabase.removeChannel(c));
    const channel = supabase
      .channel(`quiz_room:${code}`)
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'rooms', filter: `code=eq.${code}` },
        () => setHostDeletedDetected(true),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isHost, params.roomCode]);

  useEffect(() => {
    if (!hostDeletedDetected) return;
    Alert.alert(
      'Game ended',
      'Game has been deleted by Host.',
      [{ text: 'OK', onPress: () => router.replace('/') }],
      { cancelable: false },
    );
  }, [hostDeletedDetected]);

  // ── Individual Devices sync ──────────────────────────────────────────────
  // Host:s Play- och Next-tap broadcast:as till alla approved enheter via
  // Realtime broadcast-channel `quiz_sync:<roomCode>`. Speglar D-ii-spec:n
  // i docs/individual-devices-spec.md — minimal version utan readiness-
  // handshake/preload/clock-sync, bara screen-transition-events.
  //
  // Båda host och non-host subscribe:ar; default `broadcast.self: false` i
  // Supabase Realtime hindrar host från att eka tillbaka sina egna events.
  // Pass-the-Phone behöver inte sync — alla på samma enhet.
  const syncChannelRef = useRef<SyncChannel | null>(null);
  // Refs så broadcast-listenern alltid pekar på senaste handlern (annars
  // skulle subscription:n captura stale closures vid mount).
  const playCommandHandlerRef = useRef<(qIdx: number) => void>(() => {});
  const questionAdvanceHandlerRef = useRef<(nextIdx: number | null) => void>(() => {});
  const playerLeftHandlerRef = useRef<(playerId: string, playerName: string) => void>(
    () => {},
  );
  const playerAnswerConfirmedHandlerRef = useRef<
    (playerId: string, timeUsed: number) => void
  >(() => {});
  const responseSecondsChangedHandlerRef = useRef<(seconds: 15 | 30 | 45 | 60) => void>(
    () => {},
  );
  // D-iii: per-peer connection-status. Drivs av två separata signaler:
  //   - watchdog (15s silence från remote sender) → 'disconnected'
  //   - player_rejoined-event (sender:s explicit Retry-tap) → 'connected'
  // Heartbeat-receipt ENSAM räcker INTE för att flippa tillbaka — sender
  // måste eksplicit broadcasta player_rejoined för att A:s leaderboard ska
  // markera dem som åter aktiva. Egen player_id är aldrig nyckel här.
  const [playerConnectionStatus, setPlayerConnectionStatus] = useState<
    Record<string, 'connected' | 'disconnected'>
  >({});
  useEffect(() => {
    if (gameMode !== 'individual-devices' || !params.roomCode) return;
    const sync = subscribeSyncChannel(params.roomCode, selfPlayerId, {
      onPlayCommand: (payload) => playCommandHandlerRef.current(payload.question_index),
      onQuestionAdvance: (payload) =>
        questionAdvanceHandlerRef.current(payload.next_question_index),
      onPlayerLeft: (payload) =>
        playerLeftHandlerRef.current(payload.player_id, payload.player_name),
      onPlayerAnswerConfirmed: (payload) =>
        playerAnswerConfirmedHandlerRef.current(payload.player_id, payload.time_used),
      onResponseSecondsChanged: (payload) =>
        responseSecondsChangedHandlerRef.current(payload.seconds),
      onPlayAgainInitiated: () => playAgainInitiatedHandlerRef.current(),
      onPlayAgainLobbyReady: (payload) =>
        playAgainLobbyReadyHandlerRef.current(payload.room_code),
      onPlayerApprovedPlayAgain: (payload) =>
        playerApprovedPlayAgainHandlerRef.current(payload.player_id),
      onLobbyDeleted: () => lobbyDeletedHandlerRef.current(),
      onPlayerAudioStateChanged: (payload) =>
        playerAudioStateChangedHandlerRef.current(payload.player_id, payload.audio_on),
      onHostActivePing: (payload) =>
        hostActivePingHandlerRef.current(payload.question_index),
      onPlayerConnectionChange: (playerId, status) => {
        setPlayerConnectionStatus((prev) => ({ ...prev, [playerId]: status }));
      },
      onPlayerRejoined: (playerId) => {
        // Explicit Retry-tap från remote spelare → flippa till 'connected'.
        // Detta är ENDA vägen tillbaka (heartbeat-receipt räcker inte).
        setPlayerConnectionStatus((prev) => ({ ...prev, [playerId]: 'connected' }));
      },
      // Spotify DJ: DJ:n har öppnat Spotify — uppdatera gissarnas UI-text.
      // Scoring och timer påverkas INTE — timer löper oberoende av DJ:ns tap.
      onSpotifyDJTrackStarted: () => {
        setSpotifyDJStarted(true);
      },
    });
    syncChannelRef.current = sync;
    return () => {
      sync.unsubscribe();
      syncChannelRef.current = null;
    };
  }, [gameMode, params.roomCode, selfPlayerId]);

  // D-iv: initial-fetch av audio-overrides-mappen från lobby_settings
  // vid mount. Krävs för non-host som joinar mid-session — broadcasten
  // är fast-path för LIVE-ändringar men ger ingen state-snapshot vid
  // late-join. Host kör samma fetch (idempotent) så pre-existing
  // overrides från carry-over (Play Again) återställs i lokal state.
  useEffect(() => {
    if (gameMode !== 'individual-devices' || !params.roomCode) return;
    let cancelled = false;
    getPlayerAudioOverrides(params.roomCode)
      .then((map) => {
        if (!cancelled) setPlayerAudioOverridesState(map);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [gameMode, params.roomCode]);

  // D-iii: när lokal monitor återgår från unstable → ok, rensa peer-
  // tracking-state. Allt vi har om andra spelare från perioden vi var
  // offline är potentiellt stale (vi tappade DERAS heartbeats medan VI
  // var offline). Utan reset skulle GetReady visa stale "Connection
  // unstable"-rader för spelare som faktiskt aldrig var disconnected,
  // tills nästa heartbeat från varje peer hinner fram (upp till 10s
  // flicker). Reset:n täcker både UI-map:en + syncChannel:s interna
  // lastSeen/lastReported så watchdog:n inte fyrar gammal disconnect-
  // status igen.
  const prevConnectionStatusRef = useRef<'ok' | 'unstable'>('ok');
  useEffect(() => {
    const wasUnstable = prevConnectionStatusRef.current === 'unstable';
    const isOk = connection.status === 'ok';
    if (wasUnstable && isOk) {
      setPlayerConnectionStatus({});
      syncChannelRef.current?.resetPeerTracking();
    }
    prevConnectionStatusRef.current = connection.status;
  }, [connection.status]);

  // D-iii: host-popup vid edge-transition 0→≥1 disconnected peer:s. Bara
  // host (host driver speltempot — non-host behöver inte aware:nessa om
  // andra peers, deras egna overlay räcker). Popup:en får BARA fyra när
  // host är i GetReady (phase='intro') — aldrig mid-quiz. Disconnects
  // som inträffar under question/awaiting/reveal köas via pendingAlertRef
  // och fyrar när host återvänder till intro. Re-armas när alla
  // återansluts (count → 0) så nästa nya disconnect-våg ger nytt popup.
  // Non-IndDev: ingen popup (map:en hålls tom där).
  const prevDisconnectedCountRef = useRef(0);
  const pendingDisconnectAlertRef = useRef(false);
  useEffect(() => {
    if (!isHost || gameMode !== 'individual-devices') return;
    const disconnectedCount = Object.values(playerConnectionStatus).filter(
      (s) => s === 'disconnected',
    ).length;
    // Edge 0→≥1: markera pending. Coalescerar flera disconnects till en
    // popup — ytterligare disconnects mellan edge och fire ger inte extra
    // popups.
    if (disconnectedCount >= 1 && prevDisconnectedCountRef.current === 0) {
      pendingDisconnectAlertRef.current = true;
    }
    // Edge ≥1→0: alla återanslutna (via player_rejoined). Pending blir
    // inaktuellt → rensa så situationen inte rapporteras i efterhand.
    if (disconnectedCount === 0) {
      pendingDisconnectAlertRef.current = false;
    }
    prevDisconnectedCountRef.current = disconnectedCount;
    // Fire-gate: bara i intro-phase. Effekten triggas på phase-byten
    // (phase är i deps) så pending som sattes mid-quiz fyrar automatiskt
    // när host kommer till nästa GetReady.
    if (pendingDisconnectAlertRef.current && phase === 'intro') {
      pendingDisconnectAlertRef.current = false;
      Alert.alert('Please note', 'Some players connection unstable.');
    }
  }, [playerConnectionStatus, isHost, gameMode, phase]);

  // D-vi: detect-effect för host-disconnect-grace. Triggar grace när
  // non-host är i reveal-fas och host är markerad som disconnected i
  // peer-tracker. Cancel:s när antingen host återansluts ELLER phase
  // byter (= host:s question_advance kommit fram, normalt flow återupp-
  // taget). Pass-the-Phone bryr sig inte (gameMode-gate).
  useEffect(() => {
    if (isHost || gameMode !== 'individual-devices') return;
    const hostId = turnOrder[0]?.id;
    if (!hostId) return;
    const isHostDisconnected = playerConnectionStatus[hostId] === 'disconnected';
    const inReveal = phase === 'reveal';
    if (isHostDisconnected && inReveal && !hostDisconnectGraceActive) {
      hostDisconnectGraceStartRef.current = Date.now();
      setHostDisconnectGraceActive(true);
    } else if (
      (!isHostDisconnected || !inReveal) &&
      hostDisconnectGraceActive
    ) {
      hostDisconnectGraceStartRef.current = null;
      setHostDisconnectGraceActive(false);
      setHostDisconnectGraceCountdownSec(null);
    }
  }, [
    isHost,
    gameMode,
    turnOrder,
    playerConnectionStatus,
    phase,
    hostDisconnectGraceActive,
  ]);

  // D-vi: tick-effect — kör ENDAST när grace är aktiv. Var 250ms räknas
  // remaining; första 7 sek (>3s kvar) håller countdownSec null så bara
  // normal reveal-UI syns ("frozen reveal-state med feedback synlig"
  // per spec). Sista 3 sek (≤3s kvar) sätter countdownSec till 3/2/1
  // som driver big-number-overlay. Vid 0 sek → setPhase('intro') routar
  // till GetReady; cancel-grenen i detect-effect:en ovan rensar sedan
  // graceActive eftersom phase ändras.
  useEffect(() => {
    if (!hostDisconnectGraceActive) return;
    const interval = setInterval(() => {
      const start = hostDisconnectGraceStartRef.current;
      if (start === null) return;
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 10_000 - elapsed);
      if (remaining <= 0) {
        hostDisconnectGraceStartRef.current = null;
        setHostDisconnectGraceActive(false);
        setHostDisconnectGraceCountdownSec(null);
        setPhase('intro');
      } else if (remaining <= 3_000) {
        setHostDisconnectGraceCountdownSec(Math.ceil(remaining / 1000));
      } else {
        // >3s kvar: ingen visuell countdown än, bara frozen reveal-UI.
        setHostDisconnectGraceCountdownSec((prev) =>
          prev === null ? prev : null,
        );
      }
    }, 250);
    return () => clearInterval(interval);
  }, [hostDisconnectGraceActive]);

  // Timer-progress-barens färg byter vid 10s (warning) och 5s (error).
  // Bar:ens BREDD drivs av timerProgressAnim (Animated.Value, RAF-driven).
  // Färgen styrs fortfarande av sekund-räknaren timeLeft eftersom färg-
  // tröskeln är vid hela sekunder.
  const timerColor = timeLeft > 10 ? Colors.primary : timeLeft > 5 ? Colors.warning : QUIZ_ERROR_RED;
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
    // Pre-decode kommande image-fråga genom att mounta osynlig <Image>
    // redan i intro-fasen. iOS UIImageView avkodar 1920×1080 WebP
    // asynkront (typiskt 100–500 ms första gången) — utan pre-decode
    // visas pure-svart innan ProgressiveCover-mosaiken hinner reveal:a
    // tillräckligt för att bild bakom syns. Genom att rendera Image
    // tidigare (oavsett storlek) börjar RN:s image-cache decode-jobbet
    // direkt; samma source-require:t i question-fasen återanvänder
    // cachat bitmap. 1×1 px + opacity 0 → ingen visuell påverkan, men
    // räcker för att trigga decode-pipeline:n.
    return (
      <View style={styles.touchWrap} onTouchStart={signalHostActivity}>
      <GetReadyIntro
        mode={gameMode}
        currentPlayer={currentPlayer}
        queue={introQueue}
        queueRoundNumbers={queueRoundNumbers}
        queueQuestionNumbers={queueQuestionNumbers}
        currentRound={currentRound}
        totalRounds={totalRounds}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        playerCount={playerCount}
        mediaSourceByQuestion={mediaSourceByQuestion}
        categoryByQuestion={categoryByQuestion}
        spotifyQuestionIndices={djRotationPlan?.spotifyQuestionIndices}
        eraFrom={eraFrom}
        eraTo={eraTo}
        answerResponseSeconds={responseSeconds}
        onAnswerResponseSecondsChange={(seconds) => {
          setResponseSeconds(seconds);
          // I IndDev broadcastar host:s ändring så non-host:s read-only-
          // display + nästa frågas timer-budget syncas. Pass-the-Phone
          // delar device → ingen broadcast behövs.
          if (
            gameMode === 'individual-devices' &&
            isHost &&
            syncChannelRef.current
          ) {
            syncChannelRef.current
              .broadcastResponseSecondsChanged({ seconds })
              .catch(() => {});
          }
        }}
        responseSecondsLocked={responseSecondsLocked}
        leaderboard={liveLeaderboard}
        // D-iii: per-peer connection-status driver disconnect-ikon framför
        // namnet i live-leaderboard. Tom map = ingen indikator.
        playerConnectionStatus={playerConnectionStatus}
        // D-iii: unstable-overlay i intro-fasen styrs av sticky-latch +
        // live-monitor, så B fastnar i overlay genom alla phase-byten
        // tills Retry trycks. Bara non-host får Retry-knappen (host kan
        // inte bail:a mid-game eftersom det river broadcast-flödet).
        unstableLocked={shouldLockForUnstable}
        unstableCanRetry={!isConnectionUnstable && stickyUnstableForQuestion}
        onUnstableRetry={!isHost ? handleRetryFromUnstable : undefined}
        // D-iv: audio-toggle-block. Renderas bara för host i IndDev
        // (showAudioTrigger-gate i GetReadyIntro). Pass-the-Phone får
        // tom allPlayers via gating så trigger:n döljs där.
        allPlayers={gameMode === 'individual-devices' ? turnOrder : undefined}
        hostPlayerId={hostPlayerId}
        playerAudioOverrides={playerAudioOverrides}
        onPlayerAudioChange={handlePlayerAudioChange}
        // I IndDev wrappar vi onReady så host:s tap också broadcastar
        // play_command till non-host:s enheter. Pass-the-Phone behöver
        // ingen wrapping (alla på samma enhet). Non-host i IndDev får
        // ändå inte tryck — knappen är dold via isHost-prop nedan.
        onReady={handleHostStartFromGetReady}
        isHost={isHost}
        // Host får Quit Game (river rummet); non-host får Leave Game
        // (lämnar bara egen plats). Båda går ALDRIG via samma codepath
        // för cleanup eftersom non-host inte ska avsluta spelet för andra.
        onQuit={isHost ? handleQuitGame : undefined}
        onLeave={!isHost ? handleLeaveGame : undefined}
      />
      {/* Pre-decode-trick borttaget 2026-05-27 — text-rendering kräver ingen
          asset-decode. När AI-tecknade sketches kommer på plats behöver vi
          återintroducera detta block för sketch-decode-preload. */}
      {inactivityCountdownSec !== null && (
        <InactivityCountdownBanner secondsLeft={inactivityCountdownSec} />
      )}
      </View>
    );
  }

  // 3-2-1-nedräkning mellan tap på play-knappen i intro:n och fråge-vyn.
  // playerName + playerEmoji från turordningen så Pass-the-Phone-mode
  // anchorar nedräkningen till rätt spelare även medan telefonen lämnas över.
  if (phase === 'countdown') {
    const countdownPlayer = turnOrder[currentPlayerIndex];
    return (
      <View style={styles.touchWrap} onTouchStart={signalHostActivity}>
      <CountdownIntro
        mode={gameMode}
        playerName={countdownPlayer?.name}
        playerEmoji={countdownPlayer?.emoji}
        onComplete={() => setPhase('question')}
        sayWho={isImageQuestion || isActorSelectQuestion}
        silent={!isHost}
      />
      {/* Pre-decode-trick borttaget 2026-05-27 (text-rendering = no decode). */}
      {inactivityCountdownSec !== null && (
        <InactivityCountdownBanner secondsLeft={inactivityCountdownSec} />
      )}
      </View>
    );
  }

  // Leaderboard renderas UTANFÖR den övergripande ScrollView:n så dess sticky
  // footer (Home + Play Again) kan pinnas vid skärmens nederkant via flex —
  // läggs den inuti parent-scroll:n följer footer:n med upp när användaren
  // scrollar och blir inte längre alltid synlig.
  if (phase === 'leaderboard') {
    return (
      <SafeAreaView style={styles.safe} onTouchStart={signalHostActivity}>
        {inactivityCountdownSec !== null && (
          <InactivityCountdownBanner secondsLeft={inactivityCountdownSec} />
        )}
        <RoundLeaderboard
          players={gamePlayers}
          roundScores={currentRoundScores}
          totalsByPlayerId={gameTotals}
          roundNumber={questionIndex + 1}
          totalRounds={totalQuestions}
          onNextRound={handleAdvanceToNextRound}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
          onApprovePlayAgain={handleApprovePlayAgain}
          isLastRound={isLastQuestion}
          isHost={isHost}
          hostInitiatedPlayAgain={hostInitiatedPlayAgain}
          allRoundScoresHistory={allRoundScoresHistory}
          hcpChanges={isLastQuestion ? playerHcpChanges : undefined}
        />
        {/* Lock-overlay för non-host som tappat Approve Play Again men där
            host ännu inte hunnit skapa nya lobbyn. cancelable: false →
            ingen tap utanför card:en kan stänga; non-host väntar tills
            nextLobbyCode kommer in via syncChannel → useEffect navigerar
            dem automatiskt. Speglar LobbyScreen:s "Please Wait — Deleting
            this Lobby"-overlay i form och färgpalett. */}
        <Modal
          visible={awaitingNewLobby}
          transparent
          animationType="fade"
        >
          <View style={styles.waitingLobbyOverlay}>
            <View style={styles.waitingLobbyCard}>
              <View style={styles.waitingLobbyTextRow}>
                <Text style={styles.waitingLobbyText}>
                  Please Wait — Host is creating new game
                </Text>
                <SequentialDots />
              </View>
            </View>
          </View>
        </Modal>

        {/* Re-use-players-modal för host (Individual Devices) — ersätter
            Alert.alert så vi kan rendera "Yes, keep them" som utgråad
            tills alla non-hosts har broadcastat sin Approve-signal.
            totalNonHosts = turnOrder.length - 1 (host vid index 0).
            allApproved = alla non-hosts har broadcastat in. */}
        {(() => {
          const totalNonHosts = Math.max(0, turnOrder.length - 1);
          const approvedCount = playAgainApprovals.size;
          const allApproved = totalNonHosts === 0 || approvedCount >= totalNonHosts;
          const waitingPlayers = totalNonHosts - approvedCount;
          return (
            <Modal
              visible={playAgainModalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setPlayAgainModalVisible(false)}
            >
              <View style={styles.playAgainModalOverlay}>
                <View style={styles.playAgainModalCard}>
                  <Text style={styles.playAgainModalTitle}>
                    Re-use all players?
                  </Text>
                  <Text style={styles.playAgainModalBody}>
                    Start the next room with the same players, or begin fresh?
                  </Text>
                  {totalNonHosts > 0 && (
                    <View style={styles.playAgainModalStatus}>
                      {allApproved ? (
                        <Text style={styles.playAgainModalStatusReadyText}>
                          ✓ All players have approved
                        </Text>
                      ) : (
                        <View style={styles.playAgainModalStatusWaitingRow}>
                          <Text style={styles.playAgainModalStatusWaitingText}>
                            Waiting for {waitingPlayers} of {totalNonHosts}{' '}
                            {totalNonHosts === 1 ? 'player' : 'players'} to approve
                          </Text>
                          <SequentialDots color={Colors.textSecondary} />
                        </View>
                      )}
                    </View>
                  )}
                  <View style={styles.playAgainModalActions}>
                    <Pressable
                      onPress={() => setPlayAgainModalVisible(false)}
                      style={({ pressed }) => [
                        styles.playAgainModalBtn,
                        styles.playAgainModalBtnCancel,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Text style={styles.playAgainModalBtnTextCancel}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setPlayAgainModalVisible(false);
                        goToNewLobby(false);
                      }}
                      style={({ pressed }) => [
                        styles.playAgainModalBtn,
                        styles.playAgainModalBtnSecondary,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Text style={styles.playAgainModalBtnTextSecondary}>
                        Start fresh
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={
                        allApproved
                          ? () => {
                              setPlayAgainModalVisible(false);
                              askKeepSettingsThenGo();
                            }
                          : undefined
                      }
                      style={({ pressed }) => [
                        styles.playAgainModalBtn,
                        allApproved
                          ? styles.playAgainModalBtnPrimary
                          : styles.playAgainModalBtnDisabled,
                        allApproved && pressed && { opacity: 0.85 },
                      ]}
                    >
                      <Text
                        style={
                          allApproved
                            ? styles.playAgainModalBtnTextPrimary
                            : styles.playAgainModalBtnTextDisabled
                        }
                      >
                        Yes, keep them
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>
          );
        })()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} onTouchStart={signalHostActivity}>
      {inactivityCountdownSec !== null && (
        <InactivityCountdownBanner secondsLeft={inactivityCountdownSec} />
      )}
      {/* D-vi: 3-2-1-countdown-overlay sista 3 sek av host-disconnect-grace
          (sec 7-10 efter reveal-start, när host inte svarat på question_
          advance). pointerEvents='none' så reveal-UI:t bakom fortsatt
          interaktivt — användaren kan inte avbryta countdown:n (host
          måste reconnecta + advance:a, eller låta countdown:n nå 0). */}
      {hostDisconnectGraceCountdownSec !== null && (
        <View style={styles.graceCountdownOverlay} pointerEvents="none">
          <View style={styles.graceCountdownCard}>
            <Text style={styles.graceCountdownLabel}>
              Host disconnected — returning to lobby in
            </Text>
            <Text style={styles.graceCountdownNumber}>
              {hostDisconnectGraceCountdownSec}
            </Text>
          </View>
        </View>
      )}
      {/* Fixed-top zone — media + timer + question card är ALLTID synliga.
          Tidigare låg alla element i en enda ScrollView vilket lät spelaren
          scrolla bort media+timer när de letade bland prefix-knappar.
          Layout nu: [fixed-top: media+timer+question] + [ScrollView: bara
          answer-block + reveal-feedback] + [sticky-bottom: Confirm-bar]. */}
      <View style={styles.fixedTopZone}>
        {/* Hjärtslag enbart för Hints-frågor under aktiv svarstid.
            YT- och Spotify-frågor är tysta i quiz-vyn. */}
        {isHost && isImageQuestion && (phase === 'question' || phase === 'awaiting') && (
          <HeartbeatSound bpm={80} />
        )}
        {/* phase är här narrowed till 'question' | 'awaiting' | 'reveal'
            (leaderboard fångas av early-return ovan), så ingen extra
            phase-check behövs runt question UI. */}
            {/* MediaPlayer — provider-agnostisk dispatcher som väljer rätt
                impl (YouTube/None) baserat på pickMediaSource. Stuben
                i Expo Go visar thumbnail + clip-meta; Phase 4 byter den mot
                en riktig WebView-baserad player utan att röra detta call-
                site. isPlaying håller på genom hela question→awaiting→reveal-
                cykeln (uppspelningen fortsätter tills Next-tab trycks per
                tidigare UX-spec). showVideo gömmer video-frame:n under
                question/awaiting (annars ger thumbnail visuella ledtrådar
                till svaret) och visar den vid reveal. */}
            {/* ── Spotify DJ-fråga ────────────────────────────────────────────
                Tre renderingsgrenar beroende på roll + fas:
                  1. DJ under question/awaiting → DJ-kort + "Starta i Spotify"-knapp
                  2. Gissare under question/awaiting → albumomslag
                  3. Reveal (alla) → albumomslag + reveal-overlay (samma bild)
                Albumomslaget hämtas async i useEffect ovan; visar Q-logga
                som platshållare tills bilden kommit in. */}
            {isSpotifyQuestion ? (
              isCurrentPlayerDJ ? (
                /* ── DJ-vyn ────────────────────────────────────────────────── */
                <View style={styles.spotifyDJCard}>
                  <View style={styles.spotifyDJIconRow}>
                    <SpotifyBrandIcon size={28} variant="white" />
                    <Text style={styles.spotifyDJLabel}>You are the DJ</Text>
                  </View>
                  <Text style={styles.spotifyDJSublabel}>
                    {currentDJPlayer?.name ?? ''}
                  </Text>
                  {/* Albumomslaget visas DOLT för DJ under question-fasen
                      (de ska inte se det — de vet redan svaret via Spotify-appen).
                      Vid reveal visas det precis som för alla andra. */}
                  {(phase === 'reveal') && spotifyAlbumArtUrl ? (
                    <Image
                      source={{ uri: spotifyAlbumArtUrl }}
                      style={styles.spotifyAlbumArt}
                      resizeMode="cover"
                    />
                  ) : (
                    <Pressable
                      style={[
                        styles.spotifyStartBtn,
                        spotifyDJStarted && styles.spotifyStartBtnDone,
                      ]}
                      onPress={handleStartSpotifyTrack}
                      disabled={spotifyDJStarted || phase === 'reveal'}
                    >
                      <SpotifyBrandIcon
                        size={20}
                        variant={spotifyDJStarted ? 'white' : 'white'}
                      />
                      <Text style={styles.spotifyStartBtnText}>
                        {spotifyDJStarted ? '✓ Track started' : 'Start track in Spotify'}
                      </Text>
                    </Pressable>
                  )}
                  <Text style={styles.spotifyDJHint}>
                    Other players will guess the year
                  </Text>
                </View>
              ) : (
                /* ── Gissare-vyn ─────────────────────────────────────────── */
                <View style={styles.spotifyGuesserCard}>
                  {spotifyAlbumArtUrl ? (
                    <Image
                      source={{ uri: spotifyAlbumArtUrl }}
                      style={styles.spotifyAlbumArt}
                      resizeMode="cover"
                    />
                  ) : (
                    /* Platshållare tills albumomslaget laddats */
                    <View style={styles.spotifyAlbumArtPlaceholder}>
                      <SpotifyBrandIcon size={48} variant="white" />
                    </View>
                  )}
                  <View style={styles.spotifyGuesserStatus}>
                    <SpotifyBrandIcon size={14} variant="white" />
                    <Text style={styles.spotifyGuesserStatusText}>
                      {spotifyDJStarted
                        ? `${currentDJPlayer?.name ?? 'DJ'} is playing — guess the year!`
                        : `Waiting for ${currentDJPlayer?.name ?? 'DJ'} to start the track…`}
                    </Text>
                  </View>
                </View>
              )
            ) : isImageQuestion ? (
              <View style={styles.imageMediaCard}>
                <HintsQuizCard
                  key={questionIndex}
                  library={question.type === 'image' ? question.hints : undefined}
                  displayName={question.type === 'image' ? question.displayName : ''}
                  resetKey={questionIndex}
                  totalSeconds={responseSeconds}
                  assistance={currentAssistance}
                  playerBirthYear={
                    turnOrder[currentPlayerIndex]?.age
                      ? new Date().getFullYear() - turnOrder[currentPlayerIndex].age
                      : 1990
                  }
                  isRevealed={phase === 'reveal'}
                  hintsActive={hintsReady}
                  mosaicActive={timerActive}
                />
              </View>
            ) : youtubeError ? (
              <View style={styles.youtubeErrorCard}>
                <Text style={styles.youtubeErrorIcon}>⚠</Text>
                <Text style={styles.youtubeErrorTitle}>Video unavailable</Text>
                <Text style={styles.youtubeErrorSub}>Skipping to result…</Text>
              </View>
            ) : (
              <MediaPlayer
                source={mediaSource}
                isPlaying={
                  phase === 'question' ||
                  phase === 'awaiting' ||
                  phase === 'reveal'
                }
                // Film-trailer (actor-select) visar video alltid — spelaren
                // ska se klippet för att gissa skådespelaren. Musik (timeline)
                // döljer videon under frågan för att undvika år-spoilers i
                // YouTube-titeln.
                showVideo={isActorSelectQuestion ? true : phase === 'reveal'}
                isMuted={isAudioMutedForSelf}
                onError={handleYoutubeError}
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
                {/* Timer-bar avatar-markörer.
                    - Pass-the-Phone: en markör för current player vid
                      sin confirm-position (timerFill krymper bakom).
                    - Individual Devices: en markör per turnOrder-spelare.
                      Confirmade spelare har fast left% baserat på sin
                      time_used; ej-confirmade rör sig med timerProgressAnim
                      (rätta kanten av krympande fyllningen). Spelare som
                      lämnat (hasLeft) döljs. Vertikal stagger per index så
                      ej-confirmade avatarer som ligger på samma x ändå syns. */}
                {gameMode === 'pass-the-phone'
                  ? confirmedTimeUsed !== null && (
                      <View
                        pointerEvents="none"
                        style={[
                          styles.timerMarker,
                          {
                            left: `${
                              ((responseSeconds - confirmedTimeUsed) /
                                responseSeconds) *
                              100
                            }%`,
                          },
                        ]}
                      >
                        {turnOrder[currentPlayerIndex]?.avatarUri ? (
                          <Image
                            source={{
                              uri: turnOrder[currentPlayerIndex].avatarUri,
                            }}
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
                    )
                  : turnOrder
                      .filter((p) => !leftPlayerIds.has(p.id))
                      .map((p, idx) => {
                        const used = playerConfirms[p.id];
                        const isConfirmed = used !== undefined;
                        const topOffset = -11 + idx * 4;
                        const avatarNode = p.avatarUri ? (
                          <Image
                            source={{ uri: p.avatarUri }}
                            style={styles.timerMarkerAvatar}
                          />
                        ) : (
                          <View style={styles.timerMarkerFallback}>
                            <Text style={styles.timerMarkerEmoji}>
                              {p.emoji ?? '👤'}
                            </Text>
                          </View>
                        );
                        if (isConfirmed) {
                          return (
                            <View
                              key={p.id}
                              pointerEvents="none"
                              style={[
                                styles.timerMarker,
                                {
                                  top: topOffset,
                                  left: `${
                                    ((responseSeconds - used) /
                                      responseSeconds) *
                                    100
                                  }%`,
                                },
                              ]}
                            >
                              {avatarNode}
                            </View>
                          );
                        }
                        return (
                          <Animated.View
                            key={p.id}
                            pointerEvents="none"
                            style={[
                              styles.timerMarker,
                              {
                                top: topOffset,
                                left: timerProgressAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: ['0%', '100%'],
                                }),
                              },
                            ]}
                          >
                            {avatarNode}
                          </Animated.View>
                        );
                      })}
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
                {/* Frågetexten renderas som ett enskilt Text-element med
                    inline-highlight på nyckelordet (Year/Name/City/Country)
                    via nested Text-styling. Bara nyckelordet är stort; resten
                    är vanlig läs-storlek. Detta håller frågekortet kompakt
                    (1-2 rader istället för tidigare 2-3-rader-split) och styr
                    blicken direkt till frågans semantiska anker.
                    Regex är case-insensitive + \b-ordsgränser så vi inte
                    matchar substrings (t.ex. "Yearly"). Första matchen
                    highlightas; resterande förekomster (sällsynt) lämnas
                    orörda. */}
                {(() => {
                  const match = question.question.match(
                    /^(.*?)\b(Year|Name|City|Country)\b(.*)$/i,
                  );
                  if (match) {
                    const [, before, keyword, after] = match;
                    // Tvinga versal begynnelsebokstav på keyword oavsett hur det
                    // står i FIXED_QUESTION_TEXT (city/country är lowercase i
                    // matrisen men ska visuellt vara "City"/"Country" som
                    // semantisk titel).
                    const capitalized =
                      keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase();
                    return (
                      <Text style={styles.questionText}>
                        {before}
                        <Text style={styles.questionTextHeadline}>{capitalized}</Text>
                        {after}
                      </Text>
                    );
                  }
                  return (
                    <Text style={styles.questionText}>{question.question}</Text>
                  );
                })()}
              </View>
            </View>
      </View>
      {/* Scroll-zone — wrappar BARA svar-blocket (TimelineSelector eller
          ImageAnswerBlock) + reveal-feedback. ScrollView:s flex: 1 låter den
          ta resterande höjd mellan fixed-top och sticky-Confirm-bar. */}
      <ScrollView
        style={styles.scrollZone}
        contentContainerStyle={styles.scrollZoneContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScrollHintScroll}
        scrollEventThrottle={32}
      >
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
                // D-iii: vid unstable spelaren får inte avge svar. Reuse
                // existerande disabled-prop:s phase-gating + OR:a in
                // connection-status så låsningen sker både post-Confirm
                // OCH vid network-blip.
                disabled={
                  phase === 'awaiting' || phase === 'reveal' || shouldLockForUnstable
                }
              />
            ) : question.type === 'actor-select' ? (
              <View
                pointerEvents={shouldLockForUnstable ? 'none' : 'auto'}
                style={shouldLockForUnstable ? { opacity: 0.4 } : undefined}
              >
                <ActorSelectBlock
                  correctNames={question.correctNames}
                  distractorNames={question.distractorNames}
                  phase={phase}
                  pendingName={pendingActorName}
                  confirmedName={confirmedActorName}
                  isTimedOut={phase === 'reveal' && confirmedActorName === null}
                  onNameSelect={setPendingActorName}
                  resetKey={questionIndex}
                  assistance={currentAssistance}
                />
              </View>
            ) : imageVariant ? (
              // Variant byggdes runtime via `imageVariant`-useMemo ovan.
              // D-iii: ImageAnswerBlock har ingen egen disabled-prop —
              // wrappa i View med pointerEvents='none' + dimmad opacity
              // när connection är unstable. Komponenten själv behåller
              // sin phase-baserade låsning oförändrat.
              <View
                pointerEvents={shouldLockForUnstable ? 'none' : 'auto'}
                style={shouldLockForUnstable ? { opacity: 0.4 } : undefined}
              >
                <ImageAnswerBlock
                  question={imageVariant}
                  phase={phase}
                  pendingName={pendingNameOption}
                  confirmedName={confirmedNameOption}
                  isTimedOut={phase === 'reveal' && confirmedNameOption === null}
                  onNameSelect={setPendingNameOption}
                  resetKey={`${questionIndex}-${currentAssistance}`}
                />
              </View>
            ) : null}

            {/* Inline reveal-feedback: green vid rätt, red vid fel. Visas
                ENDAST i 'reveal'-fasen (= efter timer hit 0) — under awaiting
                hålls feedbacken dold trots att svaret redan är låst, så
                tidiga svarare inte får facit före sena.
                  • timeline: "Correct year: xxxx" — användarens val syns i låst TimelineSelector.
                  • image:    SKIPPAS — ImageAnswerBlock renderar Correct/Wrong-
                    badges direkt på spelarens (och rätta) namn-kort istället
                    så reveal-state syns inline i svarsrutan. */}
            {phase === 'reveal' && question.type === 'timeline' && (() => {
              if (selectedYear === null) return null;
              const interval = getIntervalForAssistance(currentAssistance);
              const wasCorrect = isCorrect(
                selectedYear,
                question.correctYear,
                interval,
                eraFrom,
                eraTo,
              );
              const correctLabel = 'Correct year:';
              const correctValue = String(question.correctYear);
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
                    <Text style={rv.feedbackCorrectYear}>
                      {correctLabel}{' '}
                      <Text style={rv.feedbackCorrectYearBold}>
                        {correctValue}
                      </Text>
                    </Text>
                    {/* Låt-titel + artist från question.hint (format
                        "Title — Artist" från MUSIC_QUESTIONS.displayName).
                        FontSize.xs + tight lineHeight håller raden kompakt
                        så feedback-kortet inte växer märkbart. numberOfLines=1
                        + ellipsizeMode='tail' skyddar mot långa titlar som
                        annars skulle wrappa och pusha kortet längre ner. */}
                    {question.hint && (
                      <Text
                        style={rv.feedbackSongMeta}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {question.hint}
                      </Text>
                    )}
                  </Animated.View>
                </View>
              );
            })()}

      </ScrollView>
      {/* Sticky Confirm/Awaiting-bar — ligger UTANFÖR ScrollView så Confirm-
          knappen alltid är synlig oavsett hur långt spelaren scrollat bland
          prefix/fullnamn-alternativen. Tidigare låg blocket inuti ScrollView
          vilket tvingade spelaren scrolla till slutet av answer-listan för
          att nå Confirm. Renderas bara i question/awaiting; reveal har sin
          egen Next-tab i bottom-right (absolute-positionerad nedan).
          Fas-medveten action-knapp:
            • question  → Confirm (blå glow + pulse)
            • awaiting  → låst "Confirmed — waiting for time" */}
      {(phase === 'question' || phase === 'awaiting') && (
        <View style={styles.stickyConfirmBar}>
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
                  (!canConfirm || shouldLockForUnstable) &&
                    styles.actionBtnDisabled,
                ]}
                onPress={() => {
                  if (!canConfirm || shouldLockForUnstable) return;
                  if (question.type === 'image' && pendingNameOption) {
                    handleConfirmName(pendingNameOption);
                  } else if (question.type === 'actor-select' && pendingActorName) {
                    handleConfirmActor(pendingActorName);
                  } else if (question.type === 'timeline' && pendingYear !== null) {
                    handleConfirm(pendingYear);
                  }
                }}
                disabled={!canConfirm || shouldLockForUnstable}
                activeOpacity={0.85}
              >
                {/* Q-glyph (ring + tail + 3 ljudvågs-bågar från QuizVibe-
                    loggan) ersätter ett typografiskt C så ordet läses som
                    "Qonfirm" med QuizVibe:s brand-Q. Färgas i Colors.warning
                    (gold) för att framhäva brand-glyfen mot den vita
                    "onfirm"-texten. Bågarna är arc-koordinater från
                    QuizVibeLogo, translerade +3x/+1y eftersom Q-center
                    sitter på (40,38) här istället för loggans (37,37).
                    Rotation 25° kring Q-center matchar loggans snedställning.
                    strokeWidth 1.6 på bågarna = klart smalare än Q-ringens
                    6.5 så de läses som "ljudvågor" inom ringen. */}
                <View style={styles.actionBtnContent}>
                  {/* viewBox expanderad till "23 18 34 37" (från "24 22 30
                      32") för att rymma Q-ringens tjockare 6.5-stroke utan
                      klippning på vänster kant, samt den breddade topp-
                      bågens rotation-bbox. SVG-dimensionerna bumpade till
                      24 för att kompensera så Q-glyfens visuella storlek
                      är ungefär densamma som tidigare. */}
                  <Svg width={24} height={24} viewBox="23 18 34 37">
                    <Circle cx="40" cy="38" r="13" fill="none" stroke={Colors.warning} strokeWidth="6.5" />
                    <Path d="M49 47 L53 51" stroke={Colors.warning} strokeWidth="6.5" strokeLinecap="round" />
                    <G transform="rotate(25 40 38)">
                      {/* Topp-båge (utanför Q-ringens topp-kant) — chord 20,
                          radius bumpad från 12 → 16 så bågen är flatare
                          och mer parallell med Q-ringens kantlinje. Mindre
                          sagitta minskar också rotation-bbox så bågen inte
                          klipps av viewBox:s topp efter 25°-rotationen. */}
                      <Path d="M 30 22 A 16 16 0 0 1 50 22" fill="none" stroke={Colors.warning} strokeWidth="1.6" strokeLinecap="round" />
                      {/* Mitten-båge (inne i Q-ringen) */}
                      <Path d="M 34 33 A 9 9 0 0 1 46 33" fill="none" stroke={Colors.warning} strokeWidth="1.6" strokeLinecap="round" />
                      {/* Botten-båge (inne i Q-ringen) */}
                      <Path d="M 36 35 A 6 6 0 0 1 44 35" fill="none" stroke={Colors.warning} strokeWidth="1.6" strokeLinecap="round" />
                    </G>
                  </Svg>
                  <Text style={styles.actionBtnText}>onfirm</Text>
                </View>
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
      {/* Next-tab / Waiting-for-host-pill — absolute-positionerad i nedre
          högra hörnet av SafeAreaView:n så CTA:n alltid är synlig oavsett
          ScrollView:s scroll-position. Visas i reveal-fas för BÅDA timeline-
          och image-frågor (identisk placering och storlek så hörnet är den
          permanenta Next-positionen oavsett fråge-typ). I IndDev kontrollerar
          host speltempot; non-host ser en passiv "Waiting for host"-pill
          istället för Next-tab. */}
      {phase === 'reveal' && (
        <View style={rv.revealNextAbsolute} pointerEvents="box-none">
          {gameMode === 'individual-devices' && !isHost ? (
            <View style={rv.waitingForHostPill}>
              <Text style={rv.waitingForHostPillText}>Waiting for host</Text>
              <SequentialDots color={Colors.textSecondary} />
            </View>
          ) : (
            <Animated.View style={{ transform: [{ scale: nextTabPulse }] }}>
              <TouchableOpacity
                style={[rv.nextTab, shouldLockForUnstable && { opacity: 0.4 }]}
                onPress={
                  isLastQuestion
                    ? handleHostShowLeaderboard
                    : handleHostAdvanceFromReveal
                }
                activeOpacity={0.85}
                disabled={shouldLockForUnstable}
              >
                <Text style={rv.nextTabText}>
                  {isLastQuestion ? '🏆  Final Leaderboard' : 'Next  →'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      )}
      {/* Scroll-hint pil — blinkar i botten av skärmen på image-frågor för att
          signalera att fler prefix-knappar + Confirm-knappen finns längre ned.
          Gäller question/awaiting; under reveal sitter Next-tab i bottom-right
          som permanent CTA så scroll-hint behövs inte där. Pinnad ovanför
          safe-area:n via SafeAreaView:s flex-tree; absolute positioning.
          pointerEvents='none' så taps under den når Confirm/grid. */}
      {question.type === 'image' && (phase === 'question' || phase === 'awaiting') && !scrolledToBottom && (
        <Animated.View
          style={[scrollHintStyles.wrap, { opacity: scrollHintOpacity }]}
          pointerEvents="none"
        >
          <View style={scrollHintStyles.pill}>
            <Text style={scrollHintStyles.chevron}>⌄</Text>
          </View>
        </Animated.View>
      )}
      {/* D-iii: bad-connection-overlay. Modal:n hanterar sin egen fullscreen-
          rendering med high zIndex, så den ligger ovanpå ScrollView:n utan
          extra wrapping. Bara aktiv i IndDev (gated via shouldLockForUnstable
          — Pass-the-Phone får aldrig unstable-state eftersom syncChannel
          inte subscribar:as där). Använder sticky-latch så overlay:n står
          kvar ända till nästa rondens GetReady även om uppkopplingen
          återkommer mid-question.

          Retry-knapp passas BARA för non-host. Host:s retry skulle riva
          host:s authoritative-driver-roll mid-question (broadcasts skulle
          inte gå ut, andra devices fastnar i reveal) — host måste vänta
          ut sin runda. canRetry = sticky-latched MEN connection åter OK.
          När fortfarande live-unstable visas grå "Waiting for connection…"-
          text istället. */}
      <ConnectionUnstableOverlay
        visible={shouldLockForUnstable}
        onRetry={!isHost ? handleRetryFromUnstable : undefined}
        canRetry={!isConnectionUnstable && stickyUnstableForQuestion}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  // D-v: outer wrapper för fragment-baserade return-paths (intro/countdown)
  // så onTouchStart kan registrera host:s activity utan att claim:a
  // responder från SafeAreaView/GetReadyIntro inuti.
  touchWrap: { flex: 1 },
  // D-vi: 3-2-1-countdown vid host-disconnect i reveal-fas. Center-
  // positionerad så den dominerar visuellt under sista 3 sek innan
  // auto-route till GetReady. pointerEvents='none' sätts på View:n
  // i JSX (inte här) eftersom det är en runtime-prop, inte style.
  graceCountdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9998,
    elevation: 25,
  },
  graceCountdownCard: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderWidth: 2,
    borderColor: Colors.warning,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    gap: 8,
    minWidth: 240,
  },
  graceCountdownLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  graceCountdownNumber: {
    fontSize: 80,
    fontWeight: '900',
    color: Colors.warning,
    fontVariant: ['tabular-nums'],
    lineHeight: 88,
  },
  content: { gap: Spacing.md, paddingBottom: Spacing.xxl },
  // Fixed-top-zonen — media + timer + question card hålls alltid i toppen
  // (utanför ScrollView). gap: md ger samma luftiga avstånd mellan elementen
  // som tidigare ScrollView.contentContainerStyle.content.
  fixedTopZone: {
    gap: Spacing.md,
  },
  // Scroll-zonen — wrappar bara svar-block + ev. reveal-feedback. flex: 1 så
  // den expanderar till resterande höjd mellan fixed-top och sticky-Confirm.
  scrollZone: {
    flex: 1,
  },
  scrollZoneContent: {
    gap: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },

  // Lock-overlay för non-host som tappat Approve Play Again men väntar
  // på host:s lobby-ready-event. Mörk backdrop + centrerat card med
  // statustext + animerade dots. Speglar LobbyScreen:s deletingOverlay
  // 1:1 (form, padding, färgpalett, dots-position).
  waitingLobbyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingLobbyCard: {
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  waitingLobbyTextRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  waitingLobbyText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },

  // Re-use-players-modal för host (Individual Devices). Speglar
  // alert-formen men har en disabled-state på "Yes, keep them" som låses
  // upp först när alla non-hosts broadcastat sin Approve-signal.
  playAgainModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  playAgainModalCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    width: '100%',
    maxWidth: 360,
    gap: Spacing.md,
  },
  playAgainModalTitle: {
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  playAgainModalBody: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  playAgainModalStatus: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  playAgainModalStatusWaitingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  playAgainModalStatusWaitingText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  playAgainModalStatusReadyText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.success,
  },
  playAgainModalActions: {
    flexDirection: 'column',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  playAgainModalBtn: {
    height: 48,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  playAgainModalBtnCancel: {
    backgroundColor: 'transparent',
    borderColor: Colors.border,
  },
  playAgainModalBtnTextCancel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  playAgainModalBtnSecondary: {
    backgroundColor: 'transparent',
    borderColor: Colors.primary,
  },
  playAgainModalBtnTextSecondary: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  playAgainModalBtnPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  playAgainModalBtnTextPrimary: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  playAgainModalBtnDisabled: {
    backgroundColor: 'transparent',
    borderColor: Colors.borderStrong,
  },
  playAgainModalBtnTextDisabled: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textDisabled,
  },

  // Image-fråge-mediaCard: 16:9-ram med `resizeMode='contain'`. Container-
  // storleken är fix (matchar timeline-frågors media-area så layout är
  // konsistent mellan fråge-typer). Bilden anpassas inom ramen — inget
  // klipps men porträtt-bilder (14 av 17 i poolen) får letterbox vänster+
  // höger i `Colors.card`-färg. Landscape-bilder (städer) fyller bredden
  // med liten letterbox topp+botten. ProgressiveCover-mosaiken täcker hela
  // containern via absoluteFill.
  imageMediaCard: {
    aspectRatio: 16 / 9,
    backgroundColor: Colors.card,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  // ── Spotify DJ-kortet (DJ:ns vy) ──────────────────────────────────────
  // Samma höjd-budget som YouTube-spelaren (220 px) för layout-konsistens.
  spotifyDJCard: {
    height: 220,
    backgroundColor: '#0D2010',   // Mörk Spotify-grön — tydlig Spotify-kontext
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#1DB954',
  },
  spotifyDJIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  spotifyDJLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  spotifyDJSublabel: {
    fontSize: FontSize.sm,
    color: '#1DB954',
    fontWeight: FontWeight.semibold,
  },
  spotifyStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#1DB954',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  spotifyStartBtnDone: {
    backgroundColor: '#157a38',   // Mörkare grön när startad — indikerar "klart"
  },
  spotifyStartBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  spotifyDJHint: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.5)',
    marginTop: Spacing.xs,
  },
  // ── Spotify gissare-kortet ────────────────────────────────────────────
  spotifyGuesserCard: {
    height: 220,
    backgroundColor: '#0A1A0D',   // Ännu mörkare grön för gissarens vy
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  spotifyAlbumArt: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  spotifyAlbumArtPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A1A0D',
  },
  spotifyGuesserStatus: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  spotifyGuesserStatusText: {
    fontSize: FontSize.xs,
    color: '#FFFFFF',
    flex: 1,
  },
  // Visas när YouTubeMediaPlayer rapporterar embed-fel — ersätter spelaren
  // med en diskret felindikator i samma höjd (220 px = PLAYER_HEIGHT).
  youtubeErrorCard: {
    height: 220,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  youtubeErrorIcon: {
    fontSize: 28,
    color: Colors.textSecondary,
  },
  youtubeErrorTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  youtubeErrorSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    opacity: 0.7,
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
    // Tidigare marginTop: -Spacing.md drog upp raden 16 px in i medie-
    // kortet — ringen (56×56) + halon (+4 px topp) krockade då med
    // YouTube-spelarens nedre högra hörn. Borttagen så `content.gap`
    // (Spacing.md) ger normalt avstånd och halon klarar sig själv.
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
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.xs,
    marginHorizontal: Spacing.lg,
    // minHeight borttagen — keyword-highlight ger naturlig 1-2-rads-höjd
    // (~70-90px) istället för tidigare fixed 140px.
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
  // Wrap runt frågetexten — kompakt vertikal yta eftersom keyword-highlight
  // ryms på 1-2 rader istället för tidigare 2-3-rad-split. Liten padding så
  // frågekortet blir totalhöjd ~80px istället för ~140px.
  questionTextWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
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
  // Inline keyword-highlight (nested inom questionText). Markant större +
  // bold så ögat fastnar på frågans semantiska anker (Year/Name/City/
  // Country). Renderas via <Text> nested i parent <Text>, så text-flowet
  // håller orden tillsammans på samma rad/wrap-ningsformat.
  questionTextHeadline: {
    fontSize: 30,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  questionText: { fontSize: 18, fontWeight: FontWeight.semibold, color: Colors.textPrimary, lineHeight: 30, textAlign: 'center' },

  // Action-knapp (Confirm / Next Round / Final Leaderboard) — paddningen
  // matchar TimelineSelector:s wrapper så knappen står i samma kolumn.
  actionWrap: {
    paddingHorizontal: Spacing.lg,
  },
  // Sticky Confirm-bar — sitter UTANFÖR ScrollView som sibling i SafeArea-
  // tree:n så Confirm-knappen alltid är synlig medan spelaren scrollar bland
  // prefix/fullnamn-alternativen. Bg + border-top markerar den som en
  // visuellt separat zone från scroll-innehållet ovanför. paddingVertical
  // ger luft runt knappen så den inte limmar mot border-top:en.
  stickyConfirmBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    height: 56,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Row-wrap för Q-glyph + "onfirm"-text inuti Confirm-knappen. Tight gap
  // så Q och bokstäverna läses som ett sammanhängande ord. alignItems:
  // 'center' baseline-justerar Q-SVG:n mot text-mitten.
  actionBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  // Confirm-knappens stil: blue + iOS shadow för glow-effekten. Halo:n bakom
  // (confirmHalo) ger cross-platform glow på Android som saknar shadow-color.
  // Confirm-knappen delar färgschema med rv.nextTab (outline blå border på
  // Colors.cardElevated-bg). Den separata confirmHalo-View:n bakom knappen
  // bär fortfarande den pulserande blå glow:en — så Confirm har samma fyll-
  // färger som Next, men extra glow för CTA-fokus.
  actionBtnConfirm: {
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.primary,
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
    color: Colors.warning,
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
    // marginTop ger badgen (top: -8, border-cutting) andrum att protruda
    // uppåt utan att krocka med fråge-kortet ovanför.
    marginTop: Spacing.sm,
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
    borderColor: QUIZ_ERROR_RED,
  },
  // Border-cutting badge: sitter på kortets övre kantlinje (top: -8) istället
  // för inuti kortet. Speglar HOST/GUEST-taggen på PlayerRow och FREE/PREMIUM-
  // badgen på Game Mode-toggle:n. Solid bg matchar kortets borderColor så
  // taggen visuellt "är en del av" ramen. Vit text för kontrast mot grön/röd.
  feedbackBadge: {
    position: 'absolute',
    top: -8,
    right: Spacing.lg,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    zIndex: 10,
    elevation: 4,
  },
  feedbackBadgeCorrect: {
    backgroundColor: Colors.success,
  },
  feedbackBadgeWrong: {
    backgroundColor: QUIZ_ERROR_RED,
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
  // Låt-titel + artist under "Correct year"-raden i timeline-reveal:
  // FontSize.xs (11) + tight lineHeight 13 ger en kompakt rad som bara
  // adderar ~2-3px till kort-höjden. textSecondary för att inte konkurrera
  // visuellt med "Correct year"-värdet ovanför.
  feedbackSongMeta: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    lineHeight: 13,
    letterSpacing: 0.2,
  },
  feedbackCorrectYearBold: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
  // Wrapper för Next-tab UTANFÖR feedback-kortet — sträcker sig full bredd
  // i container:n (paddingHorizontal: Spacing.lg från rv.container ger
  // konsekvent högra/vänstra marginal mot skärmkanten). marginTop ger luft
  // mot kortets underkant. Default alignItems (stretch) gör att Animated.View-
  // wrappern och TouchableOpacity inom fyller bredden.
  revealNextWrap: {
    marginTop: Spacing.md,
  },
  // Next-tab / Waiting-pill positionerad absolut i nedre högra hörnet av
  // SafeAreaView:n. Sibling till ScrollView så den alltid syns oavsett
  // scroll-position. zIndex + elevation behövs för iOS + Android stacking
  // över ScrollView-innehåll. pointerEvents='box-none' på wrappern så taps
  // utanför själva knappen når underliggande ScrollView (knappen själv
  // fångar sina taps via TouchableOpacity).
  revealNextAbsolute: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    zIndex: 60,
    elevation: 60,
    alignItems: 'flex-end',
  },
  // Next-tab — speglar startskärmens pulserande Join/Create-CTA:er (`gameBtn`
  // i app/index.tsx) i visuell vokabulär: höjd 56, Colors.cardElevated bg,
  // 1px Colors.primary border, Radius.md. Reveal-kortets border + badge bär
  // status-färgen (grön/röd), tab:en är en neutral "fortsätt"-CTA.
  nextTab: {
    height: 56,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextTabText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  // Non-host:s "Waiting for host…"-pill i IndDev — sitter i samma position
  // som Next-tab skulle. Dämpad styling (textSecondary + borderStrong)
  // signalerar passiv vänte-state istället för aktion.
  waitingForHostPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    backgroundColor: 'transparent',
    gap: 4,
  },
  waitingForHostPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
});

// Scroll-hint-pil i botten på image-frågor. Eget StyleSheet så `styles` och
// `rv` namespacen inte blir röriga med fler keys. Solid Colors.primary-pill +
// elevation/shadow för att garantera synlighet över både Colors.card-grid:n
// och ev. media-card-bilder. zIndex + elevation behövs båda (iOS + Android).
const scrollHintStyles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    // Bottom: sitter ovanför sticky Confirm-bar:n (~88px hög: 56 button + 32
    // paddingVertical). Tidigare Spacing.lg räckte när Confirm var inuti
    // ScrollView, men nu skulle pilen krocka med sticky-bar:n.
    bottom: 96,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
    elevation: 50,
  },
  pill: {
    minWidth: 64,
    height: 36,
    paddingHorizontal: Spacing.lg,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  chevron: {
    fontSize: 32,
    lineHeight: 32,
    color: '#FFFFFF',
    fontWeight: '900',
    // Negative marginTop kompenserar för Text:s default line-box som har
    // ascent-utrymme ovanför glyfen — utan det ligger ⌄ visuellt under
    // pillens vertikala center.
    marginTop: -10,
  },
});
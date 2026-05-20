import { ConnectionUnstableOverlay } from '@/src/components/ConnectionUnstableOverlay';
import { CountdownIntro } from '@/src/components/CountdownIntro';
import { GetReadyIntro, type QuestionMediaType } from '@/src/components/GetReadyIntro';
import { ImageAnswerBlock } from '@/src/components/ImageAnswerBlock';
import { InactivityCountdownBanner } from '@/src/components/InactivityCountdownBanner';
import { MediaPlayer } from '@/src/components/MediaPlayer';
import { ProgressiveCover } from '@/src/components/ProgressiveCover';
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
import { clearGameStarted } from '@/src/utils/mockStartedGames';
import { MUSIC_QUESTIONS } from '@/src/utils/musicQuestions';
import { savePendingLobbyPlayers } from '@/src/utils/pendingLobby';
import { loadProfile } from '@/src/utils/profileStorage';
import {
  IMAGE_QUIZ_QUESTIONS,
  type ImageNameOption,
  type ImageQuestionVariant,
  type ImageVariantKey,
} from '@/src/utils/quizImageQuestions';
import { getQuizImage } from '@/src/utils/quizImages';
import { generateRoomCode } from '@/src/utils/roomCode';
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
import Svg, { Circle, Path } from 'react-native-svg';

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
  /** "Rätt svar"-året (för artister = födelseår; band = formation-år).
   *  Används som FALLBACK i era-filtret när peak saknas. */
  correctYear: number;
  /** Peak-recognition-fönster (åren item:t var som mest känt). När båda
   *  definierade använder era-filtret interval-overlap mot host:s era-
   *  spann (semantiskt rättare än correctYear för artister). */
  peakFrom?: number;
  peakTo?: number;
  /** Pre-baked Letter Grid + name-options per prefix-längd. Klienten väljer
   *  variant runtime via `pickImageQuestionVariant(q, assistance)`. */
  variants: Record<ImageVariantKey, ImageQuestionVariant>;
}

type QuizQuestion = TimelineQuestion | ImageQuestion;

// Spelet ställer endast Music-frågor (YouTube). Själva
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
    correctYear: q.correctYear,
    peakFrom: q.peakFrom,
    peakTo: q.peakTo,
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

// Poäng-modell: rätt svar = 1 poäng, fel = 0. Tie-break på leaderboarden
// hanteras av sorteringen (poäng desc → avgResponseSeconds asc) — så två
// spelare med samma antal rätt rankas efter lägst genomsnittlig svarstid.
function calculatePoints(correct: boolean): number {
  return correct ? 1 : 0;
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
    isHost?: string;
    selfPlayerId?: string;
    players?: string;
    roundsCount?: string;
    roomCode?: string;
    eraFrom?: string;
    eraTo?: string;
    answerResponseSeconds?: string;
    youtubeEnabled?: string;
    imagesEnabled?: string;
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
  // Game Connections-källor från Lobby. Default båda=on vid direkt-nav
  // (utan Lobby) så MediaPlayer-stuben renderar klipp för mock-frågor och
  // image-items också kommer in i poolen. youtubeEnabled gatar items med
  // youtubeClips (= today's music-pool); imagesEnabled gatar image-items.
  const youtubeEnabled = (params.youtubeEnabled ?? 'true') === 'true';
  const imagesEnabled = (params.imagesEnabled ?? 'true') === 'true';
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
  const gameQuestions = useMemo<QuizQuestion[]>(() => {
    // Gate på host:s media-source-toggles innan era-filter. Host som stängt
    // av YouTube ska inte få några items med youtubeClips i spelet, även
    // om eran skulle ha matchat. Lobby blockar avstängning av sista källan,
    // så minst en pool är garanterat på här.
    const inEra = youtubeEnabled
      ? SEED_QUESTIONS.filter(
          (q) => q.correctYear >= eraFrom && q.correctYear <= eraTo,
        )
      : [];
    // YouTube-pool fallback: era-tom → hela SEED_QUESTIONS (bara aktiverad
    // när source-toggle är på, så vi inte oavsiktligt återupplivar
    // avstängda källor via fallback).
    const youtubePool: QuizQuestion[] =
      inEra.length > 0
        ? inEra
        : youtubeEnabled
          ? SEED_QUESTIONS
          : [];
    // Image-pool: peak-recognition-fönster när det finns (artister var
    // sällan kända det år de föddes — peak speglar host:s intent bättre).
    // Fallback till correctYear när peak saknas. Era-tom → hela IMAGE_
    // SEED_QUESTIONS-poolen (samma fallback-strategi som YouTube-poolen),
    // men bara när source-toggle är på.
    const inEraImages = imagesEnabled
      ? IMAGE_SEED_QUESTIONS.filter((q) => {
          if (q.peakFrom !== undefined && q.peakTo !== undefined) {
            // Interval-overlap: [eraFrom, eraTo] ∩ [peakFrom, peakTo] ≠ ∅
            return eraFrom <= q.peakTo && eraTo >= q.peakFrom;
          }
          return q.correctYear >= eraFrom && q.correctYear <= eraTo;
        })
      : [];
    const imagePool: QuizQuestion[] =
      inEraImages.length > 0
        ? inEraImages
        : imagesEnabled
          ? IMAGE_SEED_QUESTIONS
          : [];

    const playerCount = Math.max(1, turnOrder.length);
    const hasYoutube = youtubePool.length > 0;
    const hasImage = imagePool.length > 0;

    // Edge cases: om en pool är tom, kör bara den andra. Om båda tomma →
    // sista-utvägs-fallback till SEED_QUESTIONS (hardcoded mock). Lobby
    // blockar normalt detta läge ("Minimum 1 Game connection source") så
    // i praktiken ska vi aldrig hamna här.
    if (!hasYoutube && !hasImage) return SEED_QUESTIONS;

    // Bygg pool täckande hela spelet utan modulo-cykling i UI-laget.
    //   Pass-the-Phone: questionsPerBlock = playerCount (alla spelare i ronden
    //     får varsin item av samma typ).
    //   Individual Devices: questionsPerBlock = 1 (alla spelare svarar på
    //     samma fråga samtidigt → 1 item per rond totalt).
    const questionsPerBlock =
      gameMode === 'individual-devices' ? 1 : playerCount;
    const mixed: QuizQuestion[] = [];
    for (let block = 0; block < totalRounds; block++) {
      // Alternera YouTube ↔ image per block. Om bara en typ finns, använd alltid den.
      const isYoutubeBlock = hasYoutube && hasImage
        ? block % 2 === 0
        : hasYoutube;
      const pool = isYoutubeBlock ? youtubePool : imagePool;
      // Cyklisk indexering inom poolen — items kan upprepas om pool < block*players,
      // men varje block:s spelare får olika items (det är det viktiga för
      // round-paritet).
      for (let q = 0; q < questionsPerBlock; q++) {
        const idx = (block * questionsPerBlock + q) % pool.length;
        mixed.push(pool[idx]);
      }
    }
    return mixed.length > 0 ? mixed : SEED_QUESTIONS;
  }, [eraFrom, eraTo, turnOrder.length, totalRounds, youtubeEnabled, imagesEnabled, gameMode]);

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
      const picked = pickMediaSource(
        { youtubeClips: q.youtubeClips },
        { youtubeEnabled, gameMode },
      );
      if (picked.kind === 'youtube') return 'youtube';
      return 'none';
    });
  }, [gameQuestions, youtubeEnabled, gameMode]);

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
      if (b.points !== a.points) return b.points - a.points;
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
      // inget giltigt svar) och gå direkt till reveal. För image-frågor
      // sätts correctYear/selectedYear=0 (RoundResult-shapen är timeline-
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
  }, [questionIndex]);

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
    const pts = calculatePoints(correct);
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

  // Image-fråge-Confirm: speglar handleConfirm men för name-svar.
  // correct = opt.isCorrect (pre-baked från distractor-builderns rätt-flagga).
  const handleConfirmName = (opt: ImageNameOption) => {
    if (question.type !== 'image') return;
    const correct = opt.isCorrect;
    const pts = calculatePoints(correct);
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
    // Reset image-fråge-state så nästa fråga (oavsett typ) startar rent.
    setPendingNameOption(null);
    setConfirmedNameOption(null);
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

  // ── IndDev host-broadcast-wrappers ───────────────────────────────────────
  // Host:s Play-tap: trigga lokal transition + broadcast så non-host:s
  // /quiz-skärm också flyttar från GetReady → countdown.
  const handleHostStartFromGetReady = () => {
    setPhase('countdown');
    if (gameMode === 'individual-devices' && syncChannelRef.current) {
      syncChannelRef.current
        .broadcastPlayCommand({ question_index: questionIndex })
        .catch(() => {
          // Broadcast fail = non-host fastnar på GetReady. Logga men blocka
          // inte host:s eget spel. Full retry-handling sker i D-vi.
        });
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

    // Append:a minimal HistoryEntry till Player history-listan. Räkna
    // snitt-svarstid från rounds[]:s timeUsed (i sekunder, 2 decimaler).
    // Tom rounds-array (shouldn't happen men defensiv) → skippa append:n
    // så vi inte spammar 0/NaN-entries.
    if (rounds.length > 0) {
      const totalTime = rounds.reduce((sum, r) => sum + (r.timeUsed ?? 0), 0);
      const entry: HistoryEntry = {
        id: result.id,
        date: result.date,
        totalPoints,
        avgPointsPerQuestion: totalPoints / rounds.length,
        avgResponseSeconds: totalTime / rounds.length,
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
      // Tom lobby förutom host
      carryOverPlayers = [{
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
    if (gameMode === 'pass-the-phone') {
      Alert.alert(
        'Re-use all players?',
        'Start the next room with the same players, or begin fresh?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Start fresh', onPress: () => goToNewLobby(false) },
          { text: 'Yes, keep them', onPress: askKeepSettingsThenGo },
        ],
      );
    } else {
      // Reset approvals så host kan trycka Play Again igen vid behov
      // (t.ex. efter Cancel) utan att gamla approvals lever kvar.
      setPlayAgainApprovals(new Set());
      setPlayAgainModalVisible(true);
    }
  };

  const handleGoHome = () => {
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
      {isImageQuestion && getQuizImage(question.id) && (
        // Absolute-positionerad ovanpå GetReadyIntro med opacity 0 + 1×1
        // storlek — hamnar visuellt utanför skärmen. iOS startar decode-
        // pipeline:n så fort source-prop:n resolveras; cachat bitmap
        // återanvänds när Image mount:as för riktig storlek i question-
        // fasen. pointerEvents flyttad in i style (RN Image-prop:n
        // accepterar inte top-level pointerEvents).
        <Image
          source={getQuizImage(question.id)!}
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            opacity: 0,
          }}
        />
      )}
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
      />
      {/* Pre-decode forts. (se kommentar i intro-grenen). Två mount-platser
          ger maximal tids-marginal: host som tappar Play snabbt får decode
          via countdown-fasen; långsam tap → decode hinner via intro. */}
      {isImageQuestion && getQuizImage(question.id) && (
        <Image
          source={getQuizImage(question.id)!}
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            opacity: 0,
          }}
        />
      )}
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
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScrollHintScroll}
        scrollEventThrottle={32}
      >
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
                isMuted={isAudioMutedForSelf}
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
                // D-iii: vid unstable spelaren får inte avge svar. Reuse
                // existerande disabled-prop:s phase-gating + OR:a in
                // connection-status så låsningen sker både post-Confirm
                // OCH vid network-blip.
                disabled={
                  phase === 'awaiting' || phase === 'reveal' || shouldLockForUnstable
                }
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
              // D-iii: ImageAnswerBlock har ingen egen disabled-prop —
              // wrappa i View med pointerEvents='none' + dimmad opacity
              // när connection är unstable. Komponenten själv behåller
              // sin phase-baserade låsning oförändrat.
              return (
                <View
                  pointerEvents={shouldLockForUnstable ? 'none' : 'auto'}
                  style={shouldLockForUnstable ? { opacity: 0.4 } : undefined}
                >
                  <ImageAnswerBlock
                    question={variant}
                    phase={phase}
                    pendingName={pendingNameOption}
                    confirmedName={confirmedNameOption}
                    isTimedOut={phase === 'reveal' && confirmedNameOption === null}
                    onNameSelect={setPendingNameOption}
                    resetKey={`${questionIndex}-${currentAssistance}`}
                  />
                </View>
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
                    <Text style={rv.feedbackCorrectYear}>
                      {correctLabel}{' '}
                      <Text style={rv.feedbackCorrectYearBold}>
                        {correctValue}
                      </Text>
                    </Text>
                  </Animated.View>
                  {/* Next-tab / Waiting-for-host-pill ligger UTANFÖR feedback-
                      kortet — right-aligned i botten på reveal-vyn så
                      användaren fokuserar på resultatet i kortet och CTA:n
                      sitter separat. I IndDev kontrollerar host speltempot;
                      non-host ser en passiv pill istället för tab. */}
                  <View style={rv.revealNextWrap}>
                    {gameMode === 'individual-devices' && !isHost ? (
                      <View style={rv.waitingForHostPill}>
                        <Text style={rv.waitingForHostPillText}>
                          Waiting for host
                        </Text>
                        <SequentialDots color={Colors.textSecondary} />
                      </View>
                    ) : (
                      <Animated.View
                        style={{
                          width: '50%',
                          alignSelf: 'flex-end',
                          transform: [{ scale: nextTabPulse }],
                        }}
                      >
                        <TouchableOpacity
                          style={[
                            rv.nextTab,
                            shouldLockForUnstable && { opacity: 0.4 },
                          ]}
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
                        (!canConfirm || shouldLockForUnstable) &&
                          styles.actionBtnDisabled,
                      ]}
                      onPress={() => {
                        if (!canConfirm || shouldLockForUnstable) return;
                        if (question.type === 'image' && pendingNameOption) {
                          handleConfirmName(pendingNameOption);
                        } else if (question.type === 'timeline' && pendingYear !== null) {
                          handleConfirm(pendingYear);
                        }
                      }}
                      disabled={!canConfirm || shouldLockForUnstable}
                      activeOpacity={0.85}
                    >
                      {/* Q-glyph (ring + tail från QuizVibe-loggan) ersätter
                          ett typografiskt C så ordet läses som "Qonfirm" med
                          QuizVibe:s brand-Q. Samma vit-stroke som omgivande
                          text. Tight viewBox + minimal gap så Q och "onfirm"
                          sitter ihop som en sammanhängande glyph-rad. */}
                      <View style={styles.actionBtnContent}>
                        <Svg width={22} height={22} viewBox="24 22 30 32">
                          <Circle cx="40" cy="38" r="13" fill="none" stroke="#fff" strokeWidth="4.5" />
                          <Path d="M49 47 L53 51" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" />
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

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
      {/* Scroll-hint pil — blinkar i botten av skärmen på image-frågor för att
          signalera att fler prefix-knappar + Confirm-knappen finns längre ned.
          Pinnad ovanför safe-area:n via SafeAreaView:s flex-tree; absolute
          positioning. pointerEvents='none' så taps under den når Confirm/grid. */}
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
    bottom: Spacing.lg,
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
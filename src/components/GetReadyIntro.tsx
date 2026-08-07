import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import { MainCategory } from '../utils/mainCategory';
import Svg, { Path } from 'react-native-svg';
import { MediaSourceIcon } from './MediaSourceIcon';
import { SpotifyBrandIcon } from './SpotifyBrandIcon';
import { QuizVibeLogo } from './QuizVibeLogo';
import { QuizVibePlayLogo } from './QuizVibePlayLogo';
import { SequentialDots } from './SequentialDots';
import { ConnectionUnstableOverlay } from './ConnectionUnstableOverlay';
import { useConnectionStatus } from '../lib/network/connectionMonitor';
import { WifiFanIcon } from './WifiFanIcon';
import { WifiOffIcon } from './WifiOffIcon';
import { HeartbeatSound } from './HeartbeatSound';

/** Minimal player-shape som GetReadyIntro behöver för att rendera namn + avatar.
 *  Speglar TurnOrderPlayer i quiz.tsx. */
export interface IntroPlayer {
  id: string;
  name: string;
  emoji?: string;
  avatarUri?: string;
}

export type AnswerResponseSeconds = 30 | 45 | 60;
const RESPONSE_SECONDS_OPTIONS: AnswerResponseSeconds[] = [30, 45, 60];

/** Live-leaderboard-rad. Sortering ligger hos parent (poäng desc, ties
 *  brutna av lägsta avg response time). */
export interface LeaderboardLiveEntry {
  playerId: string;
  name: string;
  emoji?: string;
  /** Spelarens ålder — visas som subtext under namnet ("Standard · Age 32"). */
  age?: number;
  /** Spelarens assistance level — visas som subtext under namnet. */
  assistance?: 'minimal' | 'standard' | 'full';
  points: number;
  playedRounds: number;
  correctAnswers: number;
  incorrectAnswers: number;
  /** Genomsnittlig svarstid i sekunder över alla spelade ronder. 0 om inga. */
  avgResponseSeconds: number;
  /** Senaste ronds svarstid i sekunder. null om inga ronder spelade ännu. */
  lastResponseSeconds: number | null;
  /** Senaste 5 frågornas utfall, ÄLDST → NYAST. true = rätt, false = fel.
   *  Tomt array om inga ronder spelade ännu. */
  lastFiveResults: boolean[];
  /** Antal frågor som spelaren missade pga dålig uppkoppling. */
  connectionErrors: number;
  /** Spelaren har lämnat spelet via Leave Game. Mid-row-stats ersätts av
   *  "Has left the game"-text och PTS-kolumnen visar streck. */
  hasLeft?: boolean;
}

const ASSISTANCE_LABEL: Record<'minimal' | 'standard' | 'full', string> = {
  minimal: 'Minimal',
  standard: 'Standard',
  full: 'Full',
};

/** Media-källa per fråga, för IndDev:s media-source-kö. 'none' renderas som
 *  ❓ när YouTube inte är aktiv för frågan. */
export type QuestionMediaType = 'youtube' | 'spotify' | 'image' | 'none';

interface Props {
  /** Game mode — styr vilken vy av kö-tabellen som renderas + ev. UI-text.
   *  'remote-1v1' beter sig som single-player (self-paced solo-session). */
  mode?: 'pass-the-phone' | 'individual-devices' | 'remote-1v1';
  /** Spelaren som ska börja sin runda — visas i Pass-the-Phone-rutan.
   *  I IndDev döljs current-player-raden helt; bara queue-tabellen renderas. */
  currentPlayer: IntroPlayer;
  /** Spelare som kommer på tur EFTER current — i ordning, med ev. wrap-around.
   *  Capade i quiz.tsx så endast spelare som faktiskt hinner spela ingår.
   *  Används bara i Pass-the-Phone — i IndDev ignoreras detta fält. */
  queue: IntroPlayer[];
  /** Rond-nummer per kö-spelare (1-baserat, parallell till queue). Bara PtP. */
  queueRoundNumbers: number[];
  /** Fråge-nummer per kö-spelare (1-baserat, parallell till queue). Bara PtP. */
  queueQuestionNumbers: number[];
  /** Aktuell runda för den som ska svara (1-baserad). Bara PtP. */
  currentRound: number;
  /** Totalt antal rundor — visas bara i header-räkneverket ovanför rutan. Bara PtP. */
  totalRounds: number;
  /** Aktuellt frågenummer för den som ska svara (1-baserat, löpande över hela spelomgången). */
  currentQuestion: number;
  /** Totalt antal frågor — visas bara i header-räkneverket. */
  totalQuestions: number;
  /** Antal spelare i spelomgången — visas högerställt i header-raden. */
  playerCount: number;
  /** Media-källa per fråga (0-baserat). KRÄVS i IndDev. Längd = totalQuestions
   *  (eller kortare; saknade index renderar som 'none'/❓). */
  mediaSourceByQuestion?: QuestionMediaType[];
  /** V1-huvudkategori per fråga (0-baserat). Driver kant-skärande badge på
   *  första kö-rutan i båda lägen (PtP + IndDev). Längd = totalQuestions
   *  (eller kortare; saknade index → ingen badge renderas). null-värden
   *  inom arrayn renderar heller ingen badge (t.ex. capital-frågor som
   *  inte mappar till V1-huvudkategori). */
  categoryByQuestion?: (MainCategory | null)[];
  /** Svarstyp per fråga — 'Year' (timeline) eller 'Name' (actor-select/image).
   *  Driver blå badge på currentMediaBox/currentPlayerBox i IndDev + Single.
   *  Om prop saknas faller logiken tillbaka till kategori-heuristik. */
  answerTypeByQuestion?: ('Year' | 'Name')[];
  /** 0-baserade frågeindex som är Spotify DJ-rundor. Driver speciell
   *  grön chip-rendering i kön (Spotify-ikon + "Spotify DJ"-label). */
  spotifyQuestionIndices?: number[];
  /** Namn på DJ:n för frågan som visas härnäst (currentQuestion - 1).
   *  Undefined om frågan inte är en Spotify-runda. */
  nextDJName?: string;
  /** Game era från Lobby — visas i Game settings-blocket. */
  eraFrom: number;
  eraTo: number;
  /** Aktuell answerResponseSeconds — visas + kan justeras innan Play tap. */
  answerResponseSeconds: AnswerResponseSeconds;
  /** Callback när användaren tappar ett alternativ i dropdown:n. */
  onAnswerResponseSecondsChange: (seconds: AnswerResponseSeconds) => void;
  /** När true är dropdown:n låst — tap visar info-popup istället för att
   *  öppna alternativen. Sätts av parent när vi är mitt i en runda i Pass-
   *  the-Phone (alla spelare har inte svarat lika många gånger ännu). */
  responseSecondsLocked?: boolean;
  /** Live-leaderboard-data, sorterad. När utelämnad eller tom array
   *  renderas inte leaderboard-blocket. */
  leaderboard?: LeaderboardLiveEntry[];
  onReady: () => void;
  /** IndDev: PlayerName för spelaren som använder DENNA enhet. Visas
   *  högerställd i top-bannern (samma rad som Quit/Leave Game). Renderas
   *  bara i Individual Devices-läget — PtP delar enhet så "device-ägare"
   *  saknar mening där. */
  selfPlayerName?: string;
  /** Optional: visar Quit Game-knappen längst upp som river lobby:n. Host-only. */
  onQuit?: () => void;
  /** Optional: visar Leave Game-knappen längst upp för non-host (IndDev).
   *  Renderas BARA om onQuit inte är satt. */
  onLeave?: () => void;
  /** Är användaren host? Styr om Play-knappen renderas (host i båda lägen +
   *  alla i Pass-the-Phone) eller om "Waiting for Host to start quiz"-rutan
   *  visas i Play-knappens position (non-host i Individual Devices).
   *  Default true — befintliga call-sites påverkas inte. */
  isHost?: boolean;
  /** D-iii: per-peer connection-status. När en spelares status är
   *  `'disconnected'` renderas en disconnect-ikon framför namnet i
   *  live-leaderboard. Map:en kan vara tom (alla connected) eller saknas
   *  helt (Pass-the-Phone-läget bryr sig inte om detta). */
  playerConnectionStatus?: Record<string, 'connected' | 'disconnected'>;
  /** D-iii: parent (quiz.tsx) styr unstable-overlay i intro-fasen så
   *  sticky-låsningen kan följa över phase-byten. När `unstableLocked`
   *  är true mountas overlay:n med Retry-knapp; `unstableCanRetry`
   *  styr aktiv/disabled-state; `onUnstableRetry` är callback. När
   *  utelämnad fallback till internt connection-monitor-state
   *  (= övriga skärmar som inte behöver sticky-semantik). */
  unstableLocked?: boolean;
  unstableCanRetry?: boolean;
  onUnstableRetry?: () => void;
  /** D-iv: alla spelare i spelet (host + non-hosts). Driver audio-toggle-
   *  listan i IndDev:s Game Settings-block. När utelämnad eller tom array
   *  döljs audio-trigger:n (= ingen att toggla). Pass-the-Phone bryr sig
   *  inte om detta (single device = alltid ljud på). */
  allPlayers?: IntroPlayer[];
  /** D-iv: host:s player_id, används för default-audio-policyn (saknad
   *  key i playerAudioOverrides → host=on, övriga=off). */
  hostPlayerId?: string;
  /** D-iv: aktuell map över host:s audio-overrides per spelar-id.
   *  Saknad key tolkas via default-policyn (se hostPlayerId). */
  playerAudioOverrides?: Record<string, boolean>;
  /** D-iv: callback när host togglar audio för en spelare. Parent skriver
   *  till lobby_settings + broadcastar via syncChannel. */
  onPlayerAudioChange?: (playerId: string, audioOn: boolean) => void;
}

/** Liten avatar-cell som visas före spelarnamnet — uri-bild om finns, annars
 *  emoji, annars 👤-fallback. Storleken sätts av call-site (stor i big-counter-
 *  raden, mindre i kö-listan). */
function PlayerAvatar({ player, size }: { player: IntroPlayer; size: number }) {
  if (player.avatarUri) {
    return (
      <Image
        source={{ uri: player.avatarUri }}
        style={[avatarStyles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }
  return (
    <View
      style={[
        avatarStyles.emojiWrap,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[avatarStyles.emoji, { fontSize: size * 0.62 }]}>
        {player.emoji ?? '👤'}
      </Text>
    </View>
  );
}

const avatarStyles = StyleSheet.create({
  image: {
    backgroundColor: Colors.cardElevated,
  },
  emojiWrap: {
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
});

const SCREEN_WIDTH = Dimensions.get('window').width;
// Brand-logon i Game settings-blocket. Mindre än tidigare corner-logo
// (140) eftersom den nu sitter inline med settings-text till höger.
const LOGO_SIZE = Math.min(96, SCREEN_WIDTH - 200);
// Storleken på Q-play-loggan + halo:n bakom. SVG:n har transparent padding så
// halo-insetten räknas mot den synliga square-kanten (~16px-margin runt logon).
const PLAY_BUTTON_SIZE = 140;
const PLAY_HALO_INSET = 14;
// Avatar-storlek i tabellradens Player-kolumn — samma för current och kö
// så alla rader linjerar lodrätt.
const QUEUE_AVATAR_SIZE = 32;

/**
 * Hand-off-skärmen som visas innan en spelare börjar sin runda i Pass-the-
 * phone-läget — och initialt på spelstarten i båda lägena. Tre block:
 *   1. Stor statisk Q-logga med "GET READY / TO VIBE" overlay:ad mitt på
 *      det främre rundade kvadrat-fältet.
 *   2. Up next-block: en bred ruta med current player:s namn, plus en
 *      "Then: …"-rad utanför rutan som visar vilka som kommer i kö.
 *   3. Kvadratisk play-knapp som pulserar och har en glowande halo. Under
 *      knappen står "<namn> – press play when ready".
 */
export function GetReadyIntro({
  mode = 'pass-the-phone',
  currentPlayer,
  queue,
  queueRoundNumbers,
  queueQuestionNumbers,
  categoryByQuestion,
  answerTypeByQuestion,
  spotifyQuestionIndices,
  nextDJName,
  currentRound,
  totalRounds,
  currentQuestion,
  totalQuestions,
  playerCount,
  mediaSourceByQuestion,
  eraFrom,
  eraTo,
  answerResponseSeconds,
  onAnswerResponseSecondsChange,
  responseSecondsLocked = false,
  leaderboard,
  onReady,
  selfPlayerName,
  onQuit,
  onLeave,
  isHost = true,
  playerConnectionStatus,
  unstableLocked,
  unstableCanRetry,
  onUnstableRetry,
  allPlayers,
  hostPlayerId,
  playerAudioOverrides,
  onPlayerAudioChange,
}: Props) {
  const isIndDev = mode === 'individual-devices';
  // Non-host i IndDev innan host:s fråge-sekvens (broadcastAllQuestionIds)
  // ankommit: quiz.tsx skickar då TOM mediaSourceByQuestion-array (hellre än
  // fel ikoner från lokal shuffle). Rendera "Waiting for question data…"
  // med tickande prickar istället för ❓/"Unknown"-fallback.
  const questionDataPending =
    isIndDev && !isHost && (mediaSourceByQuestion?.length ?? 0) === 0;
  // Single Player körs som Pass-the-Phone med exakt 1 spelare. I den vyn är
  // round-konceptet meningslöst (1 spelare ⇒ rounds = questions), så
  // Rounds-dotbar, Round-separators i kö och Round-del i footer-texten
  // gömms. Blink-pulsen på "nästa fråga"-rutan gäller alla tre lägen
  // (Single, PtP, IndDev) — den lever utanför denna gating.
  const isSinglePlayer = !isIndDev && playerCount === 1;
  // D-iv: audio-trigger visas bara för host i IndDev. Pass-the-Phone har
  // gemensam enhet → alltid ljud på → ingen trigger.
  const showAudioTrigger = isIndDev && isHost && !!hostPlayerId;
  // Helper: vad är effektiv audio-state för en spelare just nu? Saknad
  // key i overrides-mappen → default-policy: host on, övriga off.
  const audioOnForPlayer = (playerId: string): boolean => {
    if (playerAudioOverrides && Object.prototype.hasOwnProperty.call(playerAudioOverrides, playerId)) {
      return playerAudioOverrides[playerId];
    }
    return playerId === hostPlayerId;
  };
  // Host:s effektiva audio-state — driver trigger-text + HeartbeatSound-gating.
  const hostAudioOn = hostPlayerId ? audioOnForPlayer(hostPlayerId) : true;
  const [audioModalOpen, setAudioModalOpen] = useState(false);
  // Interceptar play-knappens onPress i IndDev för att varna host om
  // disconnected peers INNAN nästa fråga startar.
  const handlePlayPress = () => {
    if (isIndDev && isHost && playerConnectionStatus) {
      const disconnectedCount = Object.values(playerConnectionStatus).filter(
        (s) => s === 'disconnected',
      ).length;
      if (disconnectedCount > 0) {
        Alert.alert(
          'Unstable network',
          'Some players seem to have unstable network. These will not participate in next question. Play anyway?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Play anyway', onPress: onReady },
          ],
        );
        return;
      }
    }
    onReady();
  };
  // D-iii: bad-connection-overlay. Visning styrs av parent (quiz.tsx) via
  // `unstableLocked`-prop när satt — det inkluderar sticky-latch-logiken
  // som persisterar genom phase-byten tills Retry trycks. När prop:en är
  // utelämnad fallback:ar vi till intern monitor-state (för standalone-
  // användning). Pass-the-Phone har aldrig overlay (saknar syncChannel).
  const connection = useConnectionStatus();
  const overlayVisible =
    isIndDev &&
    (unstableLocked !== undefined
      ? unstableLocked
      : connection.status === 'unstable');
  const playerName = currentPlayer.name;
  // V1-huvudkategori för nästa fråga (den som currentQuestion pekar på).
  // Driver kant-skärande badge på currentPlayerBox (PtP/Single) och
  // currentMediaBox (IndDev) så spelaren ser i förväg vilken typ av
  // fråga som kommer härnäst. null → ingen badge renderas (t.ex. capital).
  const currentCategory = categoryByQuestion?.[currentQuestion - 1] ?? null;
  // Svarstyp-badge på VÄNSTER övre kant av fråge-rutan (IndDev + single player).
  // Prefererar answerTypeByQuestion (per-fråga, från quiz.tsx) framför kategori-
  // heuristik — så YT/Film-frågor med answerMethods:["timeline"] visar "Year"
  // och YT/Film-frågor med answerMethods:["actor-select"] visar "Name".
  // Fallback-heuristik om prop saknas: Spotify/YT-musik/YT-sport → "Year",
  // YT-film/Hints → "Name".
  const currentAnswerType: 'Year' | 'Name' | null = (() => {
    const explicit = answerTypeByQuestion?.[currentQuestion - 1];
    if (explicit != null) return explicit;
    // Legacy-fallback om prop inte passas.
    const src = mediaSourceByQuestion?.[currentQuestion - 1];
    if (src === 'spotify') return 'Year';
    if (src === 'youtube') return currentCategory === 'Film' ? 'Name' : 'Year';
    if (src === 'image') return 'Name';
    return null;
  })();
  // I Pass-the-Phone betraktas alla som "den som ska starta" (telefonen lämnas
  // runt; vem som än håller den får trycka). I Individual Devices är det bara
  // host som kan starta — non-host ser en passiv "Waiting for Host"-ruta i
  // samma position som Play-knappen skulle suttit. Remote 1v1 är self-paced
  // solo — BÅDA spelarna startar sina egna frågor oavsett isHost.
  const canStartGame = mode === 'pass-the-phone' || mode === 'remote-1v1' || isHost;
  // Answer response time-fältet är read-only för non-host i Individual
  // Devices (host bestämmer värdet i Lobby OCH justerar det här mellan
  // ronder). PtP-läget har alltid alla på samma device, så där spelar
  // isHost ingen roll — där styrs editability istället av responseSecondsLocked
  // (mid-round = låst). Remote 1v1: ALLTID read-only för båda — värdet är
  // låst i match-snapshotten; lokala ändringar skulle göra duellen orättvis.
  const responseSecondsReadOnly =
    mode === 'remote-1v1' || (mode === 'individual-devices' && !isHost);

  // Dot-bar progress: rad-rektangulära pillar i två rader vid >10 dots,
  // en rad vid ≤10. total alltid jämn (Lobby:s ROUNDS_STEP=2 × heltal
  // players), så splitten blir alltid total/2 + total/2.
  const renderDotBar = (
    total: number,
    filled: number,
    label: string,
    iconsByDot?: (QuestionMediaType | null)[],
  ) => {
    const halfSplit = total > 10;
    const topCount = halfSplit ? total / 2 : total;
    const bottomCount = halfSplit ? total / 2 : 0;
    // Aktuella frågans dot pulserar (opacity 1 ↔ 0.4) i Question-baren för
    // att signalera "näst på tur att besvara". Övriga dots renderas som
    // vanliga View:er. Rounds-baren har ingen pulse (Peter: bara Questions).
    // Varje dot innehåller sin 1-baserade siffra (blå text) så användaren
    // ser exakt vilken runda/fråga som syns och har klarats av — ersätter
    // den tidigare footer-raden "Round X of Y · Question N of M".
    const renderDot = (globalIdx: number) => {
      const isFilled = globalIdx < filled;
      const isCurrent = label === 'Question' && globalIdx === filled - 1;
      const icon = iconsByDot?.[globalIdx] ?? null;
      const style = [
        styles.progressDot,
        isFilled && styles.progressDotFilled,
        icon != null && styles.progressDotRow,
      ];
      const content = (
        <>
          <Text style={styles.progressDotNumber}>{globalIdx + 1}</Text>
          {icon != null && <MediaSourceIcon source={icon} size={14} />}
        </>
      );
      if (isCurrent) {
        return (
          <Animated.View
            key={`pdot-${label}-${globalIdx}`}
            style={[style, { opacity: nextBlink }]}
          >
            {content}
          </Animated.View>
        );
      }
      return (
        <View key={`pdot-${label}-${globalIdx}`} style={style}>
          {content}
        </View>
      );
    };
    return (
      <View style={styles.progressBarBlock}>
        <Text style={styles.progressBarLabel}>{label}</Text>
        <View style={styles.progressBarRowsWrap}>
          <View style={styles.progressBarRow}>
            {Array.from({ length: topCount }).map((_, i) => renderDot(i))}
          </View>
          {bottomCount > 0 && (
            <View style={styles.progressBarRow}>
              {Array.from({ length: bottomCount }).map((_, i) =>
                renderDot(topCount + i),
              )}
            </View>
          )}
        </View>
      </View>
    );
  };
  // Dropdown för Answer response time. Stängs efter val eller tap utanför.
  const [responseDropdownOpen, setResponseDropdownOpen] = useState(false);
  // Utfällbar leaderboard — default COLLAPSED vid första entry från Lobby
  // (= game start). User kan expandera via header-tap. Vid pass-the-phone-
  // mellan-ronder spawnar vi nya GetReadyIntro-instanser så state nollställs
  // — det är önskat: leaderboarden börjar collapsed varje gång intro:n visas.
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [queueExpanded, setQueueExpanded] = useState(false);
  // Trigger:n hanterar locked vs unlocked separat — locked → info-Alert,
  // unlocked → öppna dropdown.
  const handleResponseTriggerPress = () => {
    if (responseSecondsLocked) {
      Alert.alert(
        'Answer response time locked',
        'In Pass-the-Phone mode the response time can only be changed at the start of a new round — when all players have answered the same number of questions. The current round must finish first.',
      );
      return;
    }
    setResponseDropdownOpen(true);
  };
  const handleResponseSelect = (seconds: AnswerResponseSeconds) => {
    onAnswerResponseSecondsChange(seconds);
    setResponseDropdownOpen(false);
  };
  // Två separata loops på native-driver: scale på hela knappen + halo, och
  // opacity på halo:n så det "andas" tillsammans med skalningen.
  const playPulse = useRef(new Animated.Value(1)).current;
  const playGlow = useRef(new Animated.Value(0.35)).current;
  // Opacity-pulse på "nästa fråga"-rutan (currentPlayerBox i PtP/Single,
  // currentMediaBox i IndDev). Signalerar visuellt vilken ruta som är näst
  // på tur att besvaras. Native driver så bar:en aldrig laggar trots övrig
  // JS-driven layout (dot-bars, dropdowns).
  const nextBlink = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const scaleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(playPulse, { toValue: 1.06, duration: 800, useNativeDriver: true }),
        Animated.timing(playPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(playGlow, { toValue: 0.8, duration: 800, useNativeDriver: true }),
        Animated.timing(playGlow, { toValue: 0.35, duration: 800, useNativeDriver: true }),
      ]),
    );
    const blinkLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(nextBlink, { toValue: 0.4, duration: 700, useNativeDriver: true }),
        Animated.timing(nextBlink, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    scaleLoop.start();
    glowLoop.start();
    blinkLoop.start();
    return () => {
      scaleLoop.stop();
      glowLoop.stop();
      blinkLoop.stop();
    };
  }, [playPulse, playGlow, nextBlink]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* HeartbeatSound ersatt av MorseAmbientSound-fortsättning monterad i quiz.tsx (phase==='intro') */}
      {/* Top-bar längst upp — Quit Game för host (river hela lobbyn) eller
          Leave Game för non-host i IndDev (lämnar bara egen plats, går till
          Home). Båda speglar TopUserBanner:s vokabulär (Colors.card bg +
          borderBottom). onQuit har företräde om båda är satta. */}
      {onQuit || onLeave ? (
        <View style={styles.quitBar}>
          <TouchableOpacity
            style={styles.quitBtn}
            onPress={onQuit ?? onLeave}
            accessibilityLabel={onQuit ? 'Quit Game' : 'Leave Game'}
          >
            <Text style={styles.quitBtnText}>
              {onQuit ? 'Quit Game' : 'Leave Game'}
            </Text>
          </TouchableOpacity>
          {/* IndDev: enhetens egen spelare högerställd i bannern — speglar
              TopUserBanner:s login-pill-position så användaren alltid ser
              vilken identitet enheten spelar som. */}
          {isIndDev && selfPlayerName ? (
            <Text
              style={styles.selfPlayerText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Player Name: {selfPlayerName}
            </Text>
          ) : null}
        </View>
      ) : null}

      {/* ── Game settings-block: centrerad logo + settings-info till höger.
          Visar Game era (host:s val i Lobby, fixt under hela spelet) och
          Answer response time (justerbar — se RESPONSE_SECONDS_OPTIONS-
          knapparna). Layouten är en row som alignSelf:'center' så hela
          gruppen sitter i mitten av skärmen. */}
      <View style={styles.settingsBlock}>
        <QuizVibeLogo size={LOGO_SIZE} />
        <View style={styles.settingsTextWrap}>
          <TouchableOpacity
            style={styles.settingsTitleRow}
            onPress={() => setSettingsExpanded((v) => !v)}
            activeOpacity={0.7}
          >
            <Text style={styles.settingsTitle}>Game settings</Text>
            <View style={styles.settingsToggleBox}>
              <Text style={styles.settingsToggleGlyph}>
                {settingsExpanded ? '−' : '+'}
              </Text>
            </View>
          </TouchableOpacity>
          {settingsExpanded && (
            <>
              <View style={styles.responseDropdownRow}>
                <Text style={styles.settingsRow}>Game era:</Text>
                <View style={styles.settingsValueBox}>
                  <Text style={styles.settingsValueBoxText}>
                    {eraFrom} – {eraTo}
                  </Text>
                </View>
              </View>
              <View style={styles.responseDropdownRow}>
                <Text style={styles.settingsRow}>Answer response time:</Text>
                {responseSecondsReadOnly ? (
                  // Non-host i IndDev: bara värdet som ren text. Inget tap-mål,
                  // ingen chevron, ingen 🔒. Host bestämmer värdet.
                  <Text style={styles.responseDropdownReadOnlyText}>
                    {answerResponseSeconds}s
                  </Text>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.responseDropdownTrigger,
                      responseSecondsLocked && styles.responseDropdownTriggerLocked,
                    ]}
                    onPress={handleResponseTriggerPress}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.responseDropdownTriggerText,
                        responseSecondsLocked && styles.responseDropdownTriggerTextLocked,
                      ]}
                    >
                      {answerResponseSeconds}s
                    </Text>
                    <Text
                      style={[
                        styles.responseDropdownChevron,
                        responseSecondsLocked && styles.responseDropdownTriggerTextLocked,
                      ]}
                    >
                      {responseSecondsLocked ? '🔒' : '▼'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {/* D-iv: audio-trigger — bara host i IndDev. Tap öppnar modal
                  med per-spelare on/off-toggle. Trigger-texten visar live-
                  summering "N on" så host kan snabbt se status utan att
                  öppna modalen. */}
              {showAudioTrigger && (
                <View style={styles.responseDropdownRow}>
                  <Text style={styles.settingsRow}>Audio:</Text>
                  <TouchableOpacity
                    style={styles.responseDropdownTrigger}
                    onPress={() => setAudioModalOpen(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.responseDropdownTriggerText}>
                      {hostAudioOn ? 'On' : 'Off'}
                    </Text>
                    <Text style={styles.responseDropdownChevron}>▼</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </View>

      {/* ── Current Leaderboard (utfällbar) ────────────────────────────
          Header sitter alltid i normal-flow mellan settings och play.
          Body är absolute-positionerad och OVERLAY:ar play-knappen +
          turordningstabellen när expanded — innehållet under flyttas
          inte, det göms bara bakom panelen. Default COLLAPSED. */}
      {leaderboard && leaderboard.length > 0 && (
        <View style={styles.leaderboardBlock}>
          <TouchableOpacity
            style={[
              styles.leaderboardHeader,
              leaderboardOpen && styles.leaderboardHeaderOpen,
            ]}
            onPress={() => setLeaderboardOpen((v) => !v)}
            activeOpacity={0.7}
          >
            <Text style={styles.leaderboardHeaderTitle}>
              {`🏆  Current Leaderboard - ${playerCount} ${playerCount === 1 ? 'Player' : 'Players'}`}
            </Text>
            <View style={styles.leaderboardToggleBox}>
              <Text style={styles.leaderboardToggleGlyph}>
                {leaderboardOpen ? '−' : '+'}
              </Text>
            </View>
          </TouchableOpacity>
          {leaderboardOpen && (() => {
            // D-iii: dela upp i två sektioner. Disconnected (men inte hasLeft)
            // hamnar längst ner utan placering, under en "Connection unstable"-
            // separator. hasLeft-spelare stannar i den vanliga listan med sin
            // poäng + "Has left the game"-mid-row (existerande beteende).
            const isDisco = (e: LeaderboardLiveEntry) =>
              playerConnectionStatus?.[e.playerId] === 'disconnected' && !e.hasLeft;
            const connectedEntries = leaderboard.filter((e) => !isDisco(e));
            const disconnectedEntries = leaderboard.filter(isDisco);
            const showDisconnectedSection = disconnectedEntries.length > 0;
            return (
            <View style={styles.leaderboardBodyOverlay}>
              {/* Sport-tabell-layout: fixed Klubb-kolumn vänster, horisontellt
                  scroll:bar middle med detail-kolumner, fixed PTS-kolumn
                  höger. Mönster speglar fotbolls-tabell. */}
              <View style={styles.lbTable}>
                {/* Vänster fixed kolumn: Position + Namn */}
                <View style={styles.lbLeftCol}>
                  <View style={[styles.lbCell, styles.lbHeaderCell, styles.lbLeftCell]}>
                    <Text style={styles.lbHeaderText}>Player</Text>
                  </View>
                  {connectedEntries.map((entry, index) => {
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
                  {/* Section-separator + disconnected-rader. Rendereras BARA
                      när minst en spelare är offline. Separator visar grå
                      WiFi-ikon + "Connection unstable"-text; disconnect-
                      rader har ingen placering, grå WiFi-ikon framför namn
                      och dämpad text-färg. */}
                  {showDisconnectedSection && (
                    <>
                      <View style={[styles.lbCell, styles.lbDisconnectedSeparator]}>
                        <WifiFanIcon size={14} color={Colors.error} />
                        <Text style={styles.lbDisconnectedSeparatorText} numberOfLines={1}>
                          Connection unstable
                        </Text>
                      </View>
                      {disconnectedEntries.map((entry) => {
                        const meta = [
                          entry.assistance ? ASSISTANCE_LABEL[entry.assistance] : null,
                          typeof entry.age === 'number' ? `Age ${entry.age}` : null,
                        ].filter(Boolean).join(' · ');
                        return (
                          <View
                            key={entry.playerId}
                            style={[styles.lbCell, styles.lbLeftCell, styles.lbDisconnectedRow]}
                          >
                            {/* Ingen placering — WiFi-ikon istället. */}
                            <View style={styles.lbDisconnectedIconSlot}>
                              <WifiFanIcon size={14} color={Colors.textSecondary} />
                            </View>
                            <View style={styles.lbNameStack}>
                              <Text
                                style={[styles.lbName, styles.lbDisconnectedNameText]}
                                numberOfLines={1}
                              >
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
                    </>
                  )}
                </View>

                {/* Mitt scroll:bar kolumn — alla detail-celler */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.lbMidScroll}
                >
                  <View>
                    {/* Header — "Q" = antal questions ställda till den
                        spelaren (= 1 fråga per round i pass-the-phone). */}
                    <View style={[styles.lbMidRow, styles.lbHeaderCell]}>
                      <Text style={[styles.lbMidHeader, styles.lbColR]}>Q</Text>
                      <Text style={[styles.lbMidHeader, styles.lbColCheck]}>✓</Text>
                      <Text style={[styles.lbMidHeader, styles.lbColCheck]}>✗</Text>
                      <View style={[styles.lbColConnErr, { alignItems: 'center', justifyContent: 'center' }]}>
                        <WifiOffIcon size={17} />
                      </View>
                      <Text style={[styles.lbMidHeader, styles.lbColTime]}>AVG</Text>
                      <Text style={[styles.lbMidHeader, styles.lbColTime]}>LAST</Text>
                      <Text style={[styles.lbMidHeader, styles.lbColLast5]}>
                        Last 5
                      </Text>
                    </View>
                    {/* Spelar-rader. Två fall i connected-sektionen:
                        - `hasLeft`: centrerad "Has left the game"-text
                          ersätter hela stats-bredden.
                        - default: vanlig Q/✓/✗/AVG/LAST/Last-5-rad.
                        Disconnected spelare hamnar i egen sektion längst
                        ner och passerar inte detta map. */}
                    {connectedEntries.map((entry) => {
                      if (entry.hasLeft) {
                        return (
                          <View
                            key={entry.playerId}
                            style={[styles.lbMidRow, styles.lbHasLeftRow]}
                          >
                            <Text style={styles.lbHasLeftText} numberOfLines={1}>
                              Has left the game
                            </Text>
                          </View>
                        );
                      }
                      return (
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
                          <Text style={[styles.lbMidCell, styles.lbColConnErr, entry.connectionErrors > 0 ? styles.lbWrongText : styles.lbConnErrZero]}>
                            {entry.connectionErrors > 0 ? String(entry.connectionErrors) : '—'}
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
                            {/* Visa exakt 5 dotts: padda med tomma platser
                                vänster om färre än 5 spelats. */}
                            {Array.from({ length: 5 }).map((_, i) => {
                              const offset = entry.lastFiveResults.length - 5 + i;
                              const result =
                                offset >= 0 ? entry.lastFiveResults[offset] : undefined;
                              if (result === undefined) {
                                return (
                                  <View key={i} style={styles.lbDotEmpty} />
                                );
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
                      );
                    })}
                    {/* Disconnected-sektion: separator-rad + tomma rader så
                        höjden alignar med vänster kolumnens disconnected-
                        rader. Inga stats renderas — sektionens text bor
                        i vänster kolumn (Connection unstable + namn).
                        Separator-raden delar bg + border med vänster
                        kolumnens lbDisconnectedSeparator så hela raden
                        ser ut som ett enhetligt band tvärs alla kolumner. */}
                    {showDisconnectedSection && (
                      <>
                        <View style={[styles.lbMidRow, styles.lbDisconnectedSeparatorBand]} />
                        {disconnectedEntries.map((entry) => (
                          <View
                            key={entry.playerId}
                            style={[styles.lbMidRow, styles.lbDisconnectedDataRow]}
                          />
                        ))}
                      </>
                    )}
                  </View>
                </ScrollView>

                {/* Höger fixed kolumn: PTS. hasLeft-spelare visar — istället
                    för siffror (mid-row redan har "Has left the game"-text).
                    Disconnected-spelare renderas i egen sektion utan poäng. */}
                <View style={styles.lbRightCol}>
                  <View style={[styles.lbCell, styles.lbHeaderCell, styles.lbRightCell]}>
                    <Text style={styles.lbHeaderText}>PTS</Text>
                  </View>
                  {connectedEntries.map((entry) => (
                    <View
                      key={entry.playerId}
                      style={[styles.lbCell, styles.lbRightCell]}
                    >
                      <Text style={styles.lbPoints}>
                        {entry.hasLeft ? '—' : entry.points}
                      </Text>
                    </View>
                  ))}
                  {showDisconnectedSection && (
                    <>
                      <View style={[styles.lbCell, styles.lbRightCell, styles.lbDisconnectedSeparatorBand]} />
                      {disconnectedEntries.map((entry) => (
                        <View
                          key={entry.playerId}
                          style={[styles.lbCell, styles.lbRightCell, styles.lbDisconnectedDataRow]}
                        >
                          <Text style={[styles.lbPoints, styles.lbDisconnectedPointsText]}>—</Text>
                        </View>
                      ))}
                    </>
                  )}
                </View>
              </View>
            </View>
            );
          })()}
        </View>
      )}

      {/* D-iv: audio-per-spelare-modal. Tap utanför panel:n stänger;
          varje rad har en Switch som direkt anropar onPlayerAudioChange.
          Host kan justera audio mellan ronder; mid-question är audio
          låst (host är då i question/awaiting/reveal-fas, inte intro). */}
      <Modal
        visible={audioModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setAudioModalOpen(false)}
      >
        <Pressable
          style={styles.dropdownBackdrop}
          onPress={() => setAudioModalOpen(false)}
        >
          <Pressable
            style={styles.audioPanel}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.dropdownTitle}>Audio</Text>
            <ScrollView style={styles.audioList} showsVerticalScrollIndicator={false}>
              {(allPlayers ?? []).filter((p) => p.id === hostPlayerId).map((player) => {
                const audioOn = audioOnForPlayer(player.id);
                const isHostRow = player.id === hostPlayerId;
                return (
                  <View key={player.id} style={styles.audioRow}>
                    <View style={styles.audioRowLeft}>
                      <PlayerAvatar player={player} size={32} />
                      <View style={styles.audioRowNameStack}>
                        <Text style={styles.audioRowName} numberOfLines={1}>
                          {player.name}
                        </Text>
                        {isHostRow && (
                          <Text style={styles.audioRowHostTag}>Host</Text>
                        )}
                      </View>
                    </View>
                    <Switch
                      value={audioOn}
                      onValueChange={(v) => onPlayerAudioChange?.(player.id, v)}
                      trackColor={{ false: Colors.borderStrong, true: Colors.success }}
                      thumbColor="#FFFFFF"
                      // Synca ios_backgroundColor med aktiv track-färg så
                      // ingen grå flärd läcker igenom när toggle är ON.
                      ios_backgroundColor={audioOn ? Colors.success : Colors.borderStrong}
                    />
                  </View>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={styles.audioDoneBtn}
              onPress={() => setAudioModalOpen(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.audioDoneBtnText}>Done</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Dropdown-modal för Answer response time-val. Tap utanför listan
          (semi-transparent backdrop) stänger; varje option-rad anropar
          handleResponseSelect. */}
      <Modal
        visible={responseDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setResponseDropdownOpen(false)}
      >
        <Pressable
          style={styles.dropdownBackdrop}
          onPress={() => setResponseDropdownOpen(false)}
        >
          <Pressable
            style={styles.dropdownPanel}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.dropdownTitle}>Answer response time</Text>
            {RESPONSE_SECONDS_OPTIONS.map((sec) => {
              const isActive = sec === answerResponseSeconds;
              return (
                <TouchableOpacity
                  key={sec}
                  style={[
                    styles.dropdownOption,
                    isActive && styles.dropdownOptionActive,
                  ]}
                  onPress={() => handleResponseSelect(sec)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      isActive && styles.dropdownOptionTextActive,
                    ]}
                  >
                    {sec}s
                  </Text>
                  {isActive && <Text style={styles.dropdownOptionCheck}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      <View style={styles.container}>
        {/* ── Play: QuizVibe Q-logga med play-triangel istället för wifi-fan.
            Pulserar via scale-loop på wrappen och har en mjuk primary-färgad
            halo bakom (cross-platform glow — iOS har också shadow-stöd via
            playLogoShadow). Non-host i Individual Devices ser istället en
            passiv "Waiting for Host to start quiz"-ruta i samma position;
            samma halo + scale-pulse så den visuella rytmen behålls. ── */}
        <View style={styles.playBlock}>
          {canStartGame ? (
            <>
              {/* Yttre wrapper omfamnar text + logo — ringar sitter här
                  så de aldrig skär in i "Press Play"-texten ovanför. */}
              <Animated.View
                style={[styles.playOuterWrap, { transform: [{ scale: playPulse }] }]}
              >
                <View style={styles.playRingOuter} pointerEvents="none" />
                <View style={styles.playRingInner} pointerEvents="none" />
                <View style={styles.tapHereRow}>
                  <Text style={styles.tapHereText}>Press Play</Text>
                  <Svg width={18} height={18} viewBox="0 0 18 18">
                    <Path d="M4 2 L16 9 L4 16 Z" fill={Colors.warning} />
                  </Svg>
                </View>
                <View style={styles.playLogoWrap}>
                  <Animated.View
                    style={[styles.playLogoHalo, { opacity: playGlow }]}
                    pointerEvents="none"
                  />
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handlePlayPress}
                    accessibilityLabel={`${playerName} press to start your turn`}
                    style={styles.playLogoTouchable}
                  >
                    <QuizVibePlayLogo size={PLAY_BUTTON_SIZE} color={Colors.warning} />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </>
          ) : (
            // Same gold-halo Q-play-logo som host, men non-tappable + text
            // under loggan. Inget tap-target — host kontrollerar speltempot.
            <View style={styles.waitingForHostBlock}>
              <Animated.View
                style={[styles.playLogoWrap, { transform: [{ scale: playPulse }] }]}
              >
                <Animated.View
                  style={[styles.playLogoHalo, { opacity: playGlow }]}
                  pointerEvents="none"
                />
                <View style={styles.playLogoTouchable} pointerEvents="none">
                  <QuizVibePlayLogo size={PLAY_BUTTON_SIZE} color={Colors.warning} />
                </View>
              </Animated.View>
              <View style={styles.waitingForHostLabel}>
                <Text style={styles.waitingForHostText}>
                  Waiting - Host will start quiz
                </Text>
                <SequentialDots color={Colors.warning} />
              </View>
            </View>
          )}
        </View>

        {isIndDev || isSinglePlayer ? (
          // ── IndDev / Single Player: dot-bar progress + media-source-kö ───
          // Q-kolumnen är borttagen — overall progress visas istället som
          // en dot-bar ovanför listan (totalQuestions dots, currentQuestion
          // filled). Kö-tabellen är single-column (Media source) och
          // visar bara icon + label per fråga. Single Player delar layout
          // med IndDev eftersom rond-konceptet är meningslöst med en spelare
          // (questions = rounds) — bara header-labeln skiljer sig: IndDev
          // visar "Next:", Single Player visar "Player name: {playerName}".
          <View style={styles.tableBlock}>
            {/* Bara Question-bar (ingen Round-uppdelning — varje fråga är
                egen runda i IndDev, och i Single Player finns bara en
                spelare så Rounds = Questions). */}
            {renderDotBar(totalQuestions, currentQuestion, 'Question')}

            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <View style={[styles.colPlayer, styles.cellHeader]}>
                <Text style={styles.headerCellText}>
                  {isSinglePlayer
                    ? `Player name: ${playerName}`
                    : 'Next:'}
                </Text>
              </View>
            </View>

            {/* Current question-rad — primary-bordered box runt media-ikonen.
                Kant-skärande kategori-badge ovanpå boxen visar V1-kategori
                (Music/Film/Sport) för nästa fråga så spelaren vet vad som
                kommer. Badge:n är `pointerEvents: 'none'` så den inte stör
                tap-handling i boxen. */}
            <View style={styles.tableRow}>
              <View style={[styles.colPlayer, styles.colPlayerCurrentWrap]}>
                <View style={[
                  styles.currentMediaBox,
                  (spotifyQuestionIndices?.includes(currentQuestion - 1) ?? false) && styles.currentMediaBoxSpotify,
                ]}>
                  <Text style={[
                    styles.currentMediaNumber,
                    (spotifyQuestionIndices?.includes(currentQuestion - 1) ?? false) && styles.currentMediaNumberSpotify,
                  ]}>{currentQuestion}</Text>
                  {questionDataPending ? (
                    <View style={styles.waitingForDataRow}>
                      <Text style={styles.waitingForDataText}>
                        Waiting for question data
                      </Text>
                      <SequentialDots color={Colors.textSecondary} />
                    </View>
                  ) : (
                    <>
                      <MediaSourceIcon
                        source={mediaSourceByQuestion?.[currentQuestion - 1]}
                        size={28}
                      />
                      <Text style={styles.mediaLabel} numberOfLines={1}>
                        {mediaSourceLabel(mediaSourceByQuestion?.[currentQuestion - 1])}
                      </Text>
                    </>
                  )}
                  {nextDJName && (
                    <Text style={styles.nextDJLabel} numberOfLines={1}>
                      Next DJ: {nextDJName}
                    </Text>
                  )}
                  {!questionDataPending && currentAnswerType && (
                    <View style={styles.answerTypeBadge} pointerEvents="none">
                      <Text style={styles.answerTypeBadgeText}>{currentAnswerType}</Text>
                    </View>
                  )}
                  {!questionDataPending && currentCategory && (
                    <View style={styles.categoryBadge} pointerEvents="none">
                      <Text style={styles.categoryBadgeText}>{currentCategory}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Kö-chips (upp till 9 kommande frågor) — vänster-packade så
                chips sitter tight intill varandra. flexWrap låter chips
                gå till nya rader när alla 9 inte ryms på en rad (~3 chips
                per rad vid 110pt width → 9 chips ≈ 3 rader). Cap är 9 så
                att Next-rutan + chip-kön tillsammans visar max 10 frågor.
                  - End of Game-fallet (sista chip = totalQuestions) renderas
                    inline efter chips med 🏁-ikon — följer kön visuellt.
                  - + more questions-fallet (queue överstiger 9 chips) renderas
                    centrerat på egen rad UTAN ikon — separation gör att längre
                    text inte tvingar oönskad wrap inom chip-raden. */}
            {currentQuestion < totalQuestions ? (() => {
              const queueQuestions = Array.from({
                length: Math.min(9, totalQuestions - currentQuestion),
              }).map((_, i) => currentQuestion + i + 1);
              const lastChipQ = queueQuestions[queueQuestions.length - 1];
              const isEndOfGame = lastChipQ === totalQuestions;
              return (
                <>
                  <TouchableOpacity
                    style={styles.queueToggleRow}
                    onPress={() => setQueueExpanded((v) => !v)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.queueToggleLabel}>Playing queue</Text>
                    <View style={styles.settingsToggleBox}>
                      <Text style={styles.settingsToggleGlyph}>
                        {queueExpanded ? '−' : '+'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {queueExpanded && questionDataPending ? (
                    // Non-host väntar på host:s fråge-sekvens — chips skulle
                    // bara visa ❓/"Unknown" per fråga. Visa väntetext istället.
                    <View style={styles.waitingForDataRow}>
                      <Text style={styles.waitingForDataText}>
                        Waiting for question data
                      </Text>
                      <SequentialDots color={Colors.textSecondary} />
                    </View>
                  ) : queueExpanded ? (
                    <>
                      <View style={styles.mediaQueueChipsRow}>
                        {queueQuestions.map((q, i) => {
                          const source = mediaSourceByQuestion?.[q - 1];
                          const isSpotify = spotifyQuestionIndices?.includes(q - 1) ?? false;
                          return (
                            <View
                              key={`mchip-${i}`}
                              style={[styles.queueChip, isSpotify && styles.queueChipSpotify]}
                            >
                              <Text style={[styles.queueChipNumber, isSpotify && styles.queueChipNumberSpotify]}>
                                {q}
                              </Text>
                              {isSpotify ? (
                                <SpotifyBrandIcon size={14} variant="white" />
                              ) : (
                                <MediaSourceIcon source={source} size={16} />
                              )}
                              <Text
                                style={[styles.queueChipName, isSpotify && styles.queueChipNameSpotify]}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                              >
                                {isSpotify ? 'Spotify' : mediaSourceLabel(source)}
                              </Text>
                            </View>
                          );
                        })}
                        {isEndOfGame && (
                          <Text
                            style={styles.endOfGameInline}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.8}
                          >
                            🏁  End of Game
                          </Text>
                        )}
                      </View>
                      {!isEndOfGame && (
                        <View style={styles.endOfGameRow}>
                          <Text style={styles.endOfGameText}>+ more questions</Text>
                        </View>
                      )}
                    </>
                  ) : null}
                </>
              );
            })() : (
              <View style={styles.endOfGameRow}>
                <Text style={styles.endOfGameText}>🏁  End of Game</Text>
              </View>
            )}
          </View>
        ) : (
          // ── Pass-the-Phone: dot-bars (Rounds + Question) + spelarkö ──
          // R- och Q-kolumnerna är borttagna; progress visas istället som
          // två dot-bars ovanför kö-tabellen. Kö-tabellen är single-column
          // (Pass-the-Phone to:) och visar bara avatar + namn. Round-
          // separator-raden i kön behålls eftersom det är enda visuella
          // signal för round-byten i listan nu.
          <View style={styles.tableBlock}>
            {!isSinglePlayer && renderDotBar(
              totalRounds,
              currentRound,
              'Rounds',
              mediaSourceByQuestion
                ? (() => {
                    const turnIdx = (currentQuestion - 1) % Math.max(1, playerCount);
                    return Array.from({ length: totalRounds }, (_, r) =>
                      mediaSourceByQuestion[r * playerCount + turnIdx] ?? null,
                    );
                  })()
                : undefined,
            )}
            {renderDotBar(totalQuestions, currentQuestion, 'Question')}

            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <View style={[styles.colPlayer, styles.cellHeader]}>
                <Text style={styles.headerCellText}>Pass-the-Phone to:</Text>
              </View>
            </View>

            {/* Current player-rad — Player-cellen får en primary-bordered
                box runt avatar+namn så det är tydligt vem som är näst på tur.
                Kant-skärande kategori-badge ovanpå boxen visar V1-kategori
                (Music/Film/Sport) för nästa fråga så spelaren vet vad som
                kommer. */}
            <View style={styles.tableRow}>
              <View style={[styles.colPlayer, styles.colPlayerCurrentWrap]}>
                <View style={styles.currentPlayerBox}>
                  <Text style={styles.currentMediaNumber}>{currentQuestion}</Text>
                  <PlayerAvatar player={currentPlayer} size={QUEUE_AVATAR_SIZE} />
                  <Text style={styles.currentPlayerName} numberOfLines={1}>
                    {playerName}
                  </Text>
                  {currentAnswerType && (
                    <View style={styles.answerTypeBadge} pointerEvents="none">
                      <Text style={styles.answerTypeBadgeText}>{currentAnswerType}</Text>
                    </View>
                  )}
                  {currentCategory && (
                    <View style={styles.categoryBadge} pointerEvents="none">
                      <Text style={styles.categoryBadgeText}>{currentCategory}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Kö-rader (scrollar internt om kön är lång). "Round X"-separator
                infogas mellan kö-rader när rondnumret förändras — visuell
                signal för round-byten i listan när R-kolumnen är borta. */}
            {/* Kö-chips (upp till 9 kommande spelare) — vänster-packade med
                flexWrap, samma layout som IndDev:s media-kö. Cap är 9 så att
                Next-rutan + chip-kön tillsammans visar max 10 frågor. Inga
                Round-dividers i chip-raden — ev. rond-byten framgår av
                frågenumren. End of Game inline efter sista chip när kön
                slutar exakt vid totalQuestions; annars + more questions
                centrerat på egen rad. */}
            {queue.length > 0 && (() => {
              const visibleQueue = queue.slice(0, 9);
              const lastChipQ =
                queueQuestionNumbers[visibleQueue.length - 1] ?? currentQuestion;
              const isEndOfGame = totalQuestions - lastChipQ <= 0;
              return (
                <>
                  <TouchableOpacity
                    style={styles.queueToggleRow}
                    onPress={() => setQueueExpanded((v) => !v)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.queueToggleLabel}>Playing queue</Text>
                    <View style={styles.settingsToggleBox}>
                      <Text style={styles.settingsToggleGlyph}>
                        {queueExpanded ? '−' : '+'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {queueExpanded && (
                    <>
                      <View style={styles.mediaQueueChipsRow}>
                        {visibleQueue.map((p, i) => (
                          <View key={`chip-${i}`} style={styles.queueChip}>
                            <Text style={styles.queueChipNumber}>
                              {queueQuestionNumbers[i]}
                            </Text>
                            <Text
                              style={styles.queueChipName}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {p.name}
                            </Text>
                          </View>
                        ))}
                        {isEndOfGame && (
                          <Text
                            style={styles.endOfGameInline}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.8}
                          >
                            🏁  End of Game
                          </Text>
                        )}
                      </View>
                      {!isEndOfGame && (
                        <View style={styles.endOfGameRow}>
                          <Text style={styles.endOfGameText}>+ more questions</Text>
                        </View>
                      )}
                    </>
                  )}
                </>
              );
            })()}

            {/* Empty-queue-fallback — sista spelarens vy där kön är tom. */}
            {queue.length === 0 && (
              <View style={styles.endOfGameRow}>
                <Text style={styles.endOfGameText}>🏁  End of Game</Text>
              </View>
            )}

          </View>
        )}
      </View>
      {/* D-iii: bad-connection-overlay. Modal renderar fullscreen ovanpå allt
          (inkl. play-knappen + quit-bar), så användaren kan inte starta
          spelet eller ändra response time medan kanalen är unstable.
          Retry-knapp ärvs från parent (quiz.tsx) när sticky-latchen är
          aktiv — annars saknas onUnstableRetry och overlay:n auto-
          dismissar bara vid recovery. */}
      <ConnectionUnstableOverlay
        visible={overlayVisible}
        onRetry={onUnstableRetry}
        canRetry={unstableCanRetry}
      />
    </SafeAreaView>
  );
}

function mediaSourceLabel(source: QuestionMediaType | undefined): string {
  switch (source) {
    case 'youtube': return 'YouTube';
    case 'spotify': return 'Spotify';
    case 'image': return 'Hints';
    default: return 'Unknown';
  }
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Top banner med Quit Game vänsterställd ─────────────────────────────
  // Full-bredd-band överst på skärmen i samma vokabulär som TopUserBanner
  // (Colors.card bg + borderBottom). Quit/Leave-pillen sitter till vänster;
  // space-between skjuter selfPlayerPill (IndDev, enhetens egen spelare)
  // till höger. Utan pill (PtP) stannar knappen vänster som förut.
  quitBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  // IndDev: enhetens spelarnamn i bannerns högerkant — ren grå text utan
  // ram/bakgrund. maxWidth skyddar mot överlapp med Quit/Leave-knappen
  // vid långa PlayerNames (upp till 10 letters + 7 digits).
  selfPlayerText: {
    maxWidth: '55%',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
  // Non-host i IndDev innan host:s fråge-sekvens ankommit — "Waiting for
  // question data" + SequentialDots istället för ❓/"Unknown". Används i
  // BÅDA current question-boxen och Playing queue-sektionen.
  waitingForDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  waitingForDataText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  quitBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.errorMuted,
    backgroundColor: 'rgba(255,107,107,0.08)',
  },
  quitBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.error,
    letterSpacing: 0.4,
  },
  container: {
    flex: 1,
    // Tight paddingTop (var Spacing.xxxl * 2 = 96px) så play-knappen +
    // tableBlock + chip-grid + "+ more questions"-raden ryms inom
    // skärmens höjd även vid lång kö (4 rondor × 3+ spelare → chip-grid
    // wrappar till 3 rader). Settings-block + leaderboard-block ovanför
    // har egen paddingTop/marginTop så naturlig separation behålls utan
    // ytterligare container-padding. gap mellan play och tableBlock
    // (Spacing.xxl) ger luft så Rounds-baren inte sitter klistrad
    // direkt under play-knappen.
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 40,
    paddingBottom: Spacing.sm,
    gap: Spacing.xxl,
  },

  // ── Game settings-block ────────────────────────────────────────────────
  // Centrerad row med logo + settings-text. alignSelf: 'center' så hela
  // gruppen sitter i mitten oavsett text-bredd. paddingHorizontal ger
  // andrum från skärm-kanterna.
  settingsBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignSelf: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  settingsTextWrap: {
    gap: 2,
    // Fast minWidth så justifyContent:'space-between' i varje settings-rad
    // har utrymme att skjuta value-boxen åt höger. Räcker för "Answer
    // response time:"-labeln (~140pt) + 90pt value-box + Spacing.sm gap.
    minWidth: 240,
  },
  settingsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  queueToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  queueToggleLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  settingsToggleBox: {
    width: 26,
    height: 26,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsToggleGlyph: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  settingsTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.4,
  },
  settingsRow: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  // Row-wrapper för alla tre settings-rader (Game era, Answer response time,
  // Audio per player). justifyContent:'space-between' höger-anchorar
  // value-cellen så Game era:s plain-text-box + de två dropdown-trigger:na
  // alla startar på samma x-position. Kräver att parent (settingsTextWrap)
  // har minWidth — annars kollapsar raden till content-bredd.
  responseDropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  // Plain-text value-box för Game era (read-only). Speglar trigger:ns
  // minWidth + padding så de tre value-cellerna är lika breda. Ingen
  // border/bg eftersom det inte är ett tap-mål — bara visuell alignment
  // med dropdown-trigger:na.
  settingsValueBox: {
    minWidth: 66,
    paddingHorizontal: 4,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsValueBoxText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  // Dropdown-trigger för Answer response time. Visar nuvarande värde + ▼.
  // Locked-state (mid-round i Pass-the-Phone) byter chevron till 🔒 och
  // dimmar texten — tap visar info-Alert istället för att öppna dropdown:n.
  // minWidth + justifyContent:'center' säkrar att Audio- och Response-
  // trigger:na alltid är lika breda oavsett inner-content-skillnader
  // ("15s ▼" vs "1 on ▼"). Värdet matchar settingsValueBox.minWidth.
  responseDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 66,
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  responseDropdownTriggerLocked: {
    borderColor: Colors.borderStrong,
    backgroundColor: 'transparent',
  },
  responseDropdownTriggerText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  responseDropdownTriggerTextLocked: {
    color: Colors.textSecondary,
  },
  responseDropdownChevron: {
    fontSize: 10,
    color: Colors.primary,
  },
  // Non-host:s read-only-rendering av Answer response time. Bara värdet
  // som primary-fet text — ingen border/bg/chevron/lock-ikon.
  responseDropdownReadOnlyText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  // ── Current Leaderboard ──────────────────────────────────────────────
  // Wrapper sitter i normal-flow mellan settings och play. position:
  // 'relative' anchorar body-overlay:n. zIndex + elevation lyfter hela
  // blocket över play-knappen + turordningstabellen så body kan täcka
  // dem när expanded.
  leaderboardBlock: {
    position: 'relative',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    zIndex: 100,
    elevation: 10,
  },
  // Header alltid synlig — fungerar som tap-trigger och visuell anchor.
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
  },
  // När open: header får bara rundade top-corners så den knyter visuellt
  // ihop med body-panelen direkt under (som har rundade bottom-corners).
  leaderboardHeaderOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  leaderboardHeaderTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.4,
  },
  leaderboardToggleBox: {
    width: 26,
    height: 26,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderboardToggleGlyph: {
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  // Body-overlay: absolute under header (top: '100%') så den FLOATAR ovanpå
  // play + turordningstabell istället för att skjuta dem nedåt. Solid bg
  // + border + shadow så den faktiskt göms och har visuell separation.
  leaderboardBodyOverlay: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.border,
    borderBottomLeftRadius: Radius.md,
    borderBottomRightRadius: Radius.md,
    paddingVertical: Spacing.xs,
    // iOS shadow + Android elevation för visuell lyft över innehållet
    // bakom — tydligt att panelen är "ovanpå".
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  // ── Sport-tabell-layout för leaderboard ──────────────────────────────
  // 3-kolumn: fixed left (Pos+Namn) | scroll:bar middle (detail) | fixed
  // right (PTS). Cell-höjd är konstant så de tre kolumnerna alignar
  // horisontellt utan flexbox-quirks.
  lbTable: {
    flexDirection: 'row',
  },
  // Generisk cell — fixed höjd så header + alla spelar-rader linjerar
  // mellan kolumnerna.
  lbCell: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  // Header-cell ärver lbCell + bg-toning så den sticker ut från data-rader.
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

  // Vänster fixed kolumn — Pos + Namn med trim/numberOfLines. Bredare än
  // standard så meta-raden ("Standard · Age 32") får plats på en rad utan
  // att truncatas. Mid-scroll tar tillgängligt resterande utrymme.
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
  // Stack:ar namn ovanpå meta-rad (assistance + ålder) — namnet i textPrimary,
  // meta i textSecondary mindre storlek så det läses som en sub-info-rad.
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

  // Mitt scrollbar kolumn — innehåller alla detail-celler.
  lbMidScroll: {
    flex: 1,
  },
  lbMidRow: {
    height: 52,
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
  // Per-kolumn-bredder så header + cells alignar lodrätt.
  // Q + ✓ + ✗ komprimerade till 22 px vardera (var 32) så AVG-kolumnen
  // ryms inom initial mid-scroll-vyn på iPhone-bredd utan horisontell
  // scroll. 22 räcker för 2-siffriga värden (max ~20 questions/correct/wrong)
  // i tabular-nums + xs-header.
  lbColR: { width: 22 },
  lbColCheck: { width: 22 },
  lbColTime: { width: 60 },
  lbColLast5: { width: 96 },
  lbColConnErr: { width: 36 },
  lbConnErrZero: { color: Colors.textSecondary },
  lbCorrectText: { color: Colors.success, fontWeight: FontWeight.semibold },
  lbWrongText: { color: Colors.error, fontWeight: FontWeight.semibold },

  // "Has left the game"-rad ersätter mid-row-statistik för spelare som
  // gjort Leave Game. Spänner hela detail-kolumnens bredd för läsbarhet.
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
  // D-iii: separator-rad + disconnect-rader längst ner i leaderboarden.
  // Visar grå WiFi-ikon + "Connection unstable"-rubrik i vänster kolumn;
  // spelar-rader nedanför har ingen placering, grå WiFi-ikon istället för
  // siffra, och dämpad text-färg. Middle/right kolumn renderar spacer-
  // rader med matchande höjd för layout-alignment.
  lbDisconnectedSeparator: {
    paddingLeft: Spacing.sm,
    paddingRight: 4,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.cardElevated,
  },
  lbDisconnectedSeparatorText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.error,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  lbDisconnectedRow: {
    opacity: 0.7,
  },
  // Slot där position-siffran skulle suttit — håller WiFi-ikon istället.
  // Samma bredd (16) som lbPos så namn-stacken börjar på samma x-position.
  lbDisconnectedIconSlot: {
    width: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lbDisconnectedNameText: {
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  // Separator-band i middle + right kolumnerna — speglar
  // lbDisconnectedSeparator:s bg + topp-border så raden ser ut som EN
  // enhetlig sektion-rubrik tvärs alla tre kolumner. Innehållet (WiFi-
  // ikon + text) ligger bara i vänster kolumn; middle/right är tomma
  // band i samma färg.
  lbDisconnectedSeparatorBand: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.cardElevated,
  },
  // Data-rad-spacer i middle/right kolumn för layout-alignment med
  // vänster kolumnens disconnect-rader. Ingen text — bara höjd + samma
  // opacity-dimming som vänster kolumnens lbDisconnectedRow så hela raden
  // läses som "inactive".
  lbDisconnectedDataRow: {
    opacity: 0.7,
  },
  lbDisconnectedPointsText: {
    color: Colors.textSecondary,
  },

  // Last-5-dot-rad: 5 cirklar med ✓/✗ glyph. Höger-justerad så de "sista 5"
  // alltid pekar mot nuvarande slut.
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

  // Höger fixed kolumn — PTS, alltid synlig.
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

  // Dropdown-modal: semi-transparent backdrop + centrerad panel med
  // option-list. Tap utanför stänger.
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownPanel: {
    minWidth: 200,
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  dropdownTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    marginBottom: 2,
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
  },
  dropdownOptionActive: {
    backgroundColor: Colors.primaryMuted,
  },
  dropdownOptionText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  dropdownOptionTextActive: {
    color: Colors.primary,
  },
  dropdownOptionCheck: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },

  // ── D-iv: Audio per player-modal ─────────────────────────────────────
  // Bredare panel än response-time-dropdown:n eftersom varje rad har
  // avatar + namn + Switch (mer horisontellt content). Delar dropdown-
  // Backdrop + dropdownTitle med response-time-modalen för enhetlig
  // visuell vokabulär.
  audioPanel: {
    width: 320,
    maxWidth: '90%',
    maxHeight: '70%',
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  audioHint: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
    lineHeight: 16,
  },
  audioList: {
    flexGrow: 0,
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  audioRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  audioRowNameStack: {
    flexDirection: 'column',
    flex: 1,
    gap: 1,
  },
  audioRowName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  audioRowHostTag: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  audioDoneBtn: {
    marginTop: Spacing.sm,
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  audioDoneBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    letterSpacing: 0.3,
  },

  // ── Turordningstabell ────────────────────────────────────────────────
  // R | Q | Pass-the-Phone to:-grid där header, current player och kö-rader
  // delar samma cellstruktur så kolumn-vänsterkanter linjerar perfekt över
  // alla rader. Vertikala dividers via borderRight på R/Q-cellerna; horison-
  // tella dividers via borderBottom på varje rad (utom sista kö-raden).
  tableBlock: {
    width: '100%',
    alignItems: 'stretch',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableHeaderRow: {
    minHeight: 36,
    // Tight marginTop så "Pass-the-Phone to:"-rubriken sitter nära dot-bars
    // ovanför — frigör vertikal yta så "+ more questions"-raden under chip-
    // grid:n inte trycks under skärmkanten vid 4 rondor × 3+ spelare.
    marginTop: Spacing.xs,
  },
  tableRowNoBorder: {
    borderBottomWidth: 0,
  },
  // Smala R/Q-celler centrerar sin siffra. borderRight separerar dem från
  // nästa kolumn. paddingVertical garanterar minHeight-luft även med små
  // siffror.
  colR: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  colQ: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  colPlayer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  // För current-player-cellen: ingen egen padding (boxen styr sina margins
  // via container) men inner-box-wrappen behöver flex 1 så boxen sträcker
  // sig över hela kolumnens bredd minus ev. spacing.
  colPlayerCurrentWrap: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: 0,
  },
  cellHeader: {
    paddingVertical: Spacing.xs,
  },
  headerCellText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  numText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
  },
  // Boxen runt avatar + namn för nuvarande spelare. Primary-bordered med
  // primaryMuted-fill, rundade hörn — speglar den tidigare upNextBox-
  // styling:en men kompakt nog att rymmas i en tabellrad.
  currentPlayerBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    position: 'relative',
  },
  currentPlayerName: {
    flexShrink: 1,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  playerName: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  // ── IndDev media-source-celler ───────────────────────────────────────
  // currentMediaBox speglar currentPlayerBox (primary-bordered + primary-
  // muted fyllning) så current-question-raden ser likadan ut visuellt.
  currentMediaBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    position: 'relative',
  },
  // Fråge-sekvensnummer i box:ens vänsterkant. Absolut-positionerad så
  // ikon+label kan vara CENTRERAT i boxen oavsett siffrans bredd —
  // annars hade nummret skuffat det centrerade innehållet åt höger.
  // Speglar queueChipNumber:s typografi men större (FontSize.lg) för
  // visuell hierarki mellan current-box och queue-chips.
  currentMediaNumber: {
    position: 'absolute',
    left: Spacing.xxl,
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
  },
  // Tar inte flex:1 — då skulle texten sträcka sig över hela bredden och
  // pusha ikonen åt vänster trots justifyContent:center. flexShrink:1
  // räcker för att lång text trunkeras med ellipsen.
  mediaLabel: {
    flexShrink: 1,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  nextDJLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: '#1DB954',
    textAlign: 'center',
    flexShrink: 1,
    marginTop: 2,
  },
  // ── Kö-chips-rad (delas av IndDev + PtP) ─────────────────────────────
  // Vänster-packad rad: chips med 4pt gap mellan, slutmarkören inline efter
  // sista chip:en (flexWrap låter den gå till ny rad om bredden inte räcker).
  // Båda lägen visar upp till 9 chips → 3 chips per rad vid 110pt width
  // = max 3 rader. Cap 9 så Next-rutan + chip-kön visar max 10 frågor.
  mediaQueueChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    // Tight paddingVertical så chip-grid:n sitter närmare current-player-
    // boxen ovanför, vilket gör att "+ more questions"-raden under syns
    // även vid 4 rondor × 3+ spelare (chip-grid:n wrappar då till flera rader).
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  // Slutmarkör inline efter sista chip:en — speglar endOfGameText:s
  // typografi men kompaktare (xs istället för sm) så den ryms efter
  // chip:en utan att tvinga radbryt vid 3 chips. flexShrink:0 hindrar
  // texten från att kompressera om utrymmet blir trångt — då wrap:ar
  // hela texten till ny rad istället via flexWrap på parent.
  endOfGameInline: {
    // Bredd matchar queueChip (110pt) så End of Game-pillen ryms i samma
    // visuella slot som ett chip — den hakar med på samma rad som sista
    // spelar-chippet när sista raden i grid:n inte är full (1–2 chips kvar).
    // Tighter font + letterSpacing + horizontal padding så "🏁 End of Game"
    // ryms inom slot-bredden vid default-skalning.
    width: 110,
    flexShrink: 0,
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    paddingHorizontal: 2,
    textAlign: 'center',
  },

  // Kant-skärande kategori-badge ovanpå currentPlayerBox (PtP/Single) och
  // currentMediaBox (IndDev). Speglar PREMIUM-badge-mönstret från
  // Lobby/Profile (top:-9, paddingHorizontal:8, borderRadius:4). Alla
  // V1-kategorier (Music/Film/Sport) delar samma guld bg + svart text för
  // visuell konsistens — per-kategori-färgning testades men gav splittrad
  // känsla; enhetlig "info-badge" läser tydligare.
  categoryBadge: {
    position: 'absolute',
    top: -9,
    right: Spacing.md,
    backgroundColor: Colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
    elevation: 4,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#000',
    textTransform: 'uppercase',
  },

  // Svarstyp-badge på VÄNSTER övre kant — speglar categoryBadge:s kant-
  // skärande mönster (top:-9) men sitter till vänster och är blå istället
  // för guld så de två badges läser som separata datapunkter.
  answerTypeBadge: {
    position: 'absolute',
    top: -9,
    left: Spacing.md,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
    elevation: 4,
  },
  answerTypeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#fff',
    textTransform: 'uppercase',
  },

  queueChip: {
    // Fast width 110pt: 3 chips × 110 + 4pt gap = 334pt av ~342pt tillgänglig
    // bredd → ~3 chips per rad. flexWrap på mediaQueueChipsRow rader:ar
    // resterande chips automatiskt (9 chips ≈ 3 rader).
    width: 110,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background,
  },
  // Spotify DJ-chip: grön kant + mörkgrön bakgrund markerar tydligt
  // att den frågan är en speciell DJ-runda.
  queueChipSpotify: {
    borderColor: '#1DB954',
    backgroundColor: Colors.background,
  },
  queueChipNumberSpotify: {
    color: '#FFFFFF',
  },
  queueChipNameSpotify: {
    color: '#FFFFFF',
  },
  currentMediaBoxSpotify: {
    borderColor: '#1DB954',
    backgroundColor: 'rgba(29,185,84,0.12)',
  },
  currentMediaNumberSpotify: {
    color: '#1DB954',
  },
  // Siffran är frågenumret (queueQuestionNumbers[i]) — primary-blå för
  // att linka visuellt till Question-dot-bar:ens siffror ovan.
  queueChipNumber: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    minWidth: 12,
    textAlign: 'center',
  },
  // Mindre text + tighter letterSpacing så fler chars ryms innan ellipsen.
  // ellipsizeMode="tail" på <Text> ger "Guest..." för långa namn.
  // flexShrink + minWidth speglar chip-stylen så ellipsen fyrar istället
  // för att texten driver chip-bredden över sitt fair share.
  queueChipName: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
    letterSpacing: -0.2,
  },

  // ── Dot-bar progress (IndDev) ──────────────────────────────────────────
  // Ersätter Q-kolumnen i kö-tabellen. Render:as ovanför "Media source:"-
  // raden. totalQuestions dots fördelade left-to-right, wrap:ar vid 10 per
  // rad (= 10+10 vid max 20 ronder). Filled = currentQuestion st (gjorda
  // + näst-på-tur), empty = resten. Speglar exemplet Peter delade.
  progressBarBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  // Label sitter VÄNSTER om dot-raden med fast bredd så Rounds + Question
  // labels alignerar vertikalt och båda dot-raderna startar på samma x.
  // lineHeight: 24 matchar dot-höjden så labeln vertikalt centreras mot
  // dot-raden vid 1-rad fall — och vid 2-rad fall (Question max 16 dots)
  // top-alignar labeln mot första raden istället för att hamna i gapet.
  progressBarLabel: {
    width: 70,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  // Dots-wrap tar resten av bredden (flex:1). Vertikal stack vid >10 dots.
  progressBarRowsWrap: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
  },
  // Dots-raden fyller hela rowsWrap-bredden — dots flex-distribuerade så
  // Rounds (4 dots) automatiskt blir bredare per styck än Question (8 dots).
  progressBarRow: {
    flexDirection: 'row',
    gap: 4,
  },
  // Rektangulär pill — fyllda dots delar färgtema med currentPlayerBox
  // (primaryMuted bg + primary border). flex:1 så dots delar bredden lika
  // inom progressBarRow — antal dots styr deras individuella bredd.
  progressDot: {
    flex: 1,
    height: 24,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotFilled: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  // Rad-layout när mediaikonen visas inuti dot:en (Rounds-baren).
  progressDotRow: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 6,
  },
  // Siffra inuti varje dot (1-baserad globalIdx). Blå-tonad så den läses
  // mot både unfilled (transparent bg) och filled (primaryMuted bg) — primary
  // mot primaryMuted ger dämpad-men-läsbar kontrast utan att skrika.
  progressDotNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    lineHeight: 13,
    includeFontPadding: false,
  },

  // "Round X"-separator infogas mellan kö-rader vid varje rondbyte. Spänner
  // hela tabellbredden, primary-tonad bg så ögat fångar transitionen utan
  // att den konkurrerar med spelar-radernas innehåll.
  roundSeparator: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.primaryMuted,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundSeparatorText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  // Slutmarkör (+ more questions / 🏁 End of Game) under tabellen.
  endOfGameRow: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endOfGameText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  // Diskret total-räknare under tabellen — bevarar info från det tidigare
  // headerCounter-blocket utan att stjäla plats från själva tabellen.
  tableFooter: {
    paddingTop: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  // ── Play ───────────────────────────────────────────────────────────────
  // Q-play-loggan har transparent padding inåt (~16px innan synliga squares),
  // så halo:n placeras nästan kant-i-kant med wrappen för att glöden ska
  // visas runt själva loggan istället för långt utanför den. Gold glow
  // (Colors.warning #F5A623) speglar Lobby:s Start Game-CTA-mönster — samma
  // visuella vokabulär signalerar "premium action moment".
  playBlock: {
    alignItems: 'center',
    // gap: Spacing.sm (var Spacing.lg) — tightare spacing mellan "Tap Here"-
    // texten och Play-loggan. Påverkar bara host-branchen; non-host:s
    // waitingForHostBlock är en enskild child så gap:n har ingen effekt där.
    gap: Spacing.sm,
  },
  tapHereRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tapHereText: {
    color: Colors.warning,
    fontSize: 22,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  playLogoWrap: {
    position: 'relative',
    width: PLAY_BUTTON_SIZE,
    height: PLAY_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.warning,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 18,
    elevation: 12,
  },
  playLogoHalo: {
    position: 'absolute',
    top: PLAY_HALO_INSET,
    left: PLAY_HALO_INSET,
    right: PLAY_HALO_INSET,
    bottom: PLAY_HALO_INSET,
    borderRadius: Radius.xl,
    backgroundColor: Colors.warning,
  },
  playLogoTouchable: {
    width: PLAY_BUTTON_SIZE,
    height: PLAY_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playOuterWrap: {
    position: 'relative',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 16,
  },
  playRingOuter: {
    position: 'absolute',
    top: -14,
    left: -14,
    right: -14,
    bottom: -14,
    borderRadius: 40,
    borderWidth: 2.5,
    borderColor: Colors.warning,
  },
  playRingInner: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 32,
    borderWidth: 2.5,
    borderColor: Colors.warning,
  },
  // Non-host:s waiting-vy i Individual Devices: samma gold-halo'd Q-play-logo
  // som host, plus en text-rad under loggan med "Waiting - Host will start
  // quiz" + animerade dots. Loggan är non-tappable; text:n förklarar varför.
  waitingForHostBlock: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  waitingForHostLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  waitingForHostText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.warning,
    textAlign: 'center',
    letterSpacing: 0.3,
  },

});

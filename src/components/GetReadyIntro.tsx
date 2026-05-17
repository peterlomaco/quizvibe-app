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
import { MediaSourceIcon } from './MediaSourceIcon';
import { QuizVibeLogo } from './QuizVibeLogo';
import { QuizVibePlayLogo } from './QuizVibePlayLogo';
import { SequentialDots } from './SequentialDots';
import { ConnectionUnstableOverlay } from './ConnectionUnstableOverlay';
import { useConnectionStatus } from '../lib/network/connectionMonitor';
import { WifiFanIcon } from './WifiFanIcon';

/** Minimal player-shape som GetReadyIntro behöver för att rendera namn + avatar.
 *  Speglar TurnOrderPlayer i quiz.tsx. */
export interface IntroPlayer {
  id: string;
  name: string;
  emoji?: string;
  avatarUri?: string;
}

export type AnswerResponseSeconds = 15 | 30 | 45 | 60;
const RESPONSE_SECONDS_OPTIONS: AnswerResponseSeconds[] = [15, 30, 45, 60];

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
 *  ❓ när varken YouTube eller Spotify är aktiv för frågan. */
export type QuestionMediaType = 'youtube' | 'spotify' | 'image' | 'none';

interface Props {
  /** Game mode — styr vilken vy av kö-tabellen som renderas + ev. UI-text. */
  mode?: 'pass-the-phone' | 'individual-devices';
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
  // D-iv: audio-trigger visas bara för host i IndDev och bara om vi har
  // en spelarlista att visa toggles för. Pass-the-Phone har gemensam
  // enhet → alltid ljud på → ingen trigger.
  const showAudioTrigger =
    isIndDev && isHost && !!allPlayers && allPlayers.length > 0;
  // Helper: vad är effektiv audio-state för en spelare just nu? Saknad
  // key i overrides-mappen → default-policy: host on, övriga off.
  const audioOnForPlayer = (playerId: string): boolean => {
    if (playerAudioOverrides && Object.prototype.hasOwnProperty.call(playerAudioOverrides, playerId)) {
      return playerAudioOverrides[playerId];
    }
    return playerId === hostPlayerId;
  };
  // Räkna hur många som har audio på (för "N on"-summering i trigger).
  const audioOnCount = (allPlayers ?? []).reduce(
    (acc, p) => acc + (audioOnForPlayer(p.id) ? 1 : 0),
    0,
  );
  const [audioModalOpen, setAudioModalOpen] = useState(false);
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
  // I Pass-the-Phone betraktas alla som "den som ska starta" (telefonen lämnas
  // runt; vem som än håller den får trycka). I Individual Devices är det bara
  // host som kan starta — non-host ser en passiv "Waiting for Host"-ruta i
  // samma position som Play-knappen skulle suttit.
  const canStartGame = mode === 'pass-the-phone' || isHost;
  // Answer response time-fältet är read-only för non-host i Individual
  // Devices (host bestämmer värdet i Lobby OCH justerar det här mellan
  // ronder). PtP-läget har alltid alla på samma device, så där spelar
  // isHost ingen roll — där styrs editability istället av responseSecondsLocked
  // (mid-round = låst).
  const responseSecondsReadOnly = mode === 'individual-devices' && !isHost;

  // Dot-bar progress: rad-rektangulära pillar i två rader vid >10 dots,
  // en rad vid ≤10. total alltid jämn (Lobby:s ROUNDS_STEP=2 × heltal
  // players), så splitten blir alltid total/2 + total/2.
  const renderDotBar = (total: number, filled: number, label: string) => {
    const halfSplit = total > 10;
    const topCount = halfSplit ? total / 2 : total;
    const bottomCount = halfSplit ? total / 2 : 0;
    const renderDot = (globalIdx: number) => (
      <View
        key={`pdot-${label}-${globalIdx}`}
        style={[
          styles.progressDot,
          globalIdx < filled && styles.progressDotFilled,
        ]}
      />
    );
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
    scaleLoop.start();
    glowLoop.start();
    return () => {
      scaleLoop.stop();
      glowLoop.stop();
    };
  }, [playPulse, playGlow]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top-bar längst upp — Quit Game för host (river hela lobbyn) eller
          Leave Game för non-host i IndDev (lämnar bara egen plats, går till
          Home). Båda speglar TopUserBanner:s vokabulär (Colors.card bg +
          borderBottom). onQuit har företräde om båda är satta. */}
      {onQuit ? (
        <View style={styles.quitBar}>
          <TouchableOpacity
            style={styles.quitBtn}
            onPress={onQuit}
            accessibilityLabel="Quit Game"
          >
            <Text style={styles.quitBtnText}>Quit Game</Text>
          </TouchableOpacity>
        </View>
      ) : onLeave ? (
        <View style={styles.quitBar}>
          <TouchableOpacity
            style={styles.quitBtn}
            onPress={onLeave}
            accessibilityLabel="Leave Game"
          >
            <Text style={styles.quitBtnText}>Leave Game</Text>
          </TouchableOpacity>
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
          <Text style={styles.settingsTitle}>Game settings</Text>
          <Text style={styles.settingsRow}>
            Game era:{' '}
            <Text style={styles.settingsValue}>{eraFrom} – {eraTo}</Text>
          </Text>
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
              <Text style={styles.settingsRow}>🔊 Audio per player:</Text>
              <TouchableOpacity
                style={styles.responseDropdownTrigger}
                onPress={() => setAudioModalOpen(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.responseDropdownTriggerText}>
                  {audioOnCount} on
                </Text>
                <Text style={styles.responseDropdownChevron}>▼</Text>
              </TouchableOpacity>
            </View>
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
              🏆  Current Leaderboard
            </Text>
            <Text style={styles.leaderboardHeaderChevron}>
              {leaderboardOpen ? '▾' : '▸'}
            </Text>
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
                        <WifiFanIcon size={14} color={Colors.textSecondary} />
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
            <Text style={styles.dropdownTitle}>Audio per player</Text>
            <Text style={styles.audioHint}>
              Toggle which devices play audio. Default: host on, others muted.
            </Text>
            <ScrollView style={styles.audioList} showsVerticalScrollIndicator={false}>
              {(allPlayers ?? []).map((player) => {
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
                      ios_backgroundColor={Colors.borderStrong}
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
            <Animated.View
              style={[styles.playLogoWrap, { transform: [{ scale: playPulse }] }]}
            >
              <Animated.View
                style={[styles.playLogoHalo, { opacity: playGlow }]}
                pointerEvents="none"
              />
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onReady}
                accessibilityLabel={`${playerName} press to start your turn`}
                style={styles.playLogoTouchable}
              >
                <QuizVibePlayLogo size={PLAY_BUTTON_SIZE} color={Colors.warning} />
              </TouchableOpacity>
            </Animated.View>
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

        {isIndDev ? (
          // ── IndDev: dot-bar progress + media-source-kö ───────────────
          // Q-kolumnen är borttagen — overall progress visas istället som
          // en dot-bar ovanför listan (totalQuestions dots, currentQuestion
          // filled). Kö-tabellen är single-column (Media source) och
          // visar bara icon + label per fråga.
          <View style={styles.tableBlock}>
            {/* IndDev: bara Question-bar (ingen Round-uppdelning — varje
                fråga = egen runda). */}
            {renderDotBar(totalQuestions, currentQuestion, 'Question')}

            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <View style={[styles.colPlayer, styles.cellHeader]}>
                <Text style={styles.headerCellText}>Next:</Text>
              </View>
            </View>

            {/* Current question-rad — primary-bordered box runt media-ikonen. */}
            <View style={styles.tableRow}>
              <View style={[styles.colPlayer, styles.colPlayerCurrentWrap]}>
                <View style={styles.currentMediaBox}>
                  <MediaSourceIcon
                    source={mediaSourceByQuestion?.[currentQuestion - 1]}
                    size={28}
                  />
                  <Text style={styles.mediaLabel} numberOfLines={1}>
                    {mediaSourceLabel(mediaSourceByQuestion?.[currentQuestion - 1])}
                  </Text>
                </View>
              </View>
            </View>

            {/* Kö-rader: fråge-nummer currentQuestion+1..totalQuestions med
                respektive media-källa. Scrollar internt om många frågor. */}
            {currentQuestion < totalQuestions && (
              <ScrollView
                style={styles.queueScroll}
                showsVerticalScrollIndicator={false}
              >
                {Array.from({
                  length: totalQuestions - currentQuestion,
                }).map((_, i) => {
                  const q = currentQuestion + i + 1; // 1-baserat
                  const isLast = i === totalQuestions - currentQuestion - 1;
                  return (
                    <View
                      key={`indq-${q}`}
                      style={[
                        styles.tableRow,
                        isLast && styles.tableRowNoBorder,
                      ]}
                    >
                      <View style={styles.colPlayer}>
                        <MediaSourceIcon
                          source={mediaSourceByQuestion?.[q - 1]}
                          size={24}
                        />
                        <Text style={styles.mediaQueueLabel} numberOfLines={1}>
                          {mediaSourceLabel(mediaSourceByQuestion?.[q - 1])}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}

            <View style={styles.endOfGameRow}>
              <Text style={styles.endOfGameText}>🏁  End of Game</Text>
            </View>

            <Text style={styles.tableFooter}>
              {`Question ${currentQuestion} of ${totalQuestions} · ${playerCount} players`}
            </Text>
          </View>
        ) : (
          // ── Pass-the-Phone: dot-bars (Rounds + Question) + spelarkö ──
          // R- och Q-kolumnerna är borttagna; progress visas istället som
          // två dot-bars ovanför kö-tabellen. Kö-tabellen är single-column
          // (Pass-the-Phone to:) och visar bara avatar + namn. Round-
          // separator-raden i kön behålls eftersom det är enda visuella
          // signal för round-byten i listan nu.
          <View style={styles.tableBlock}>
            {renderDotBar(totalRounds, currentRound, 'Rounds')}
            {renderDotBar(totalQuestions, currentQuestion, 'Question')}

            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <View style={[styles.colPlayer, styles.cellHeader]}>
                <Text style={styles.headerCellText}>Pass-the-Phone to:</Text>
              </View>
            </View>

            {/* Current player-rad — Player-cellen får en primary-bordered
                box runt avatar+namn så det är tydligt vem som är näst på tur. */}
            <View style={styles.tableRow}>
              <View style={[styles.colPlayer, styles.colPlayerCurrentWrap]}>
                <View style={styles.currentPlayerBox}>
                  <PlayerAvatar player={currentPlayer} size={QUEUE_AVATAR_SIZE} />
                  <Text style={styles.currentPlayerName} numberOfLines={1}>
                    {playerName}
                  </Text>
                </View>
              </View>
            </View>

            {/* Kö-rader (scrollar internt om kön är lång). "Round X"-separator
                infogas mellan kö-rader när rondnumret förändras — visuell
                signal för round-byten i listan när R-kolumnen är borta. */}
            {queue.length > 0 && (
              <ScrollView
                style={styles.queueScroll}
                showsVerticalScrollIndicator={false}
              >
                {queue.map((p, i) => {
                  const round = queueRoundNumbers[i];
                  const prevRound = i === 0 ? currentRound : queueRoundNumbers[i - 1];
                  const isNewRound = round !== prevRound;
                  return (
                    <React.Fragment key={`${i}-${p.id}`}>
                      {isNewRound && (
                        <View style={styles.roundSeparator}>
                          <Text style={styles.roundSeparatorText}>
                            Round {round}
                          </Text>
                        </View>
                      )}
                      <View
                        style={[
                          styles.tableRow,
                          i === queue.length - 1 && styles.tableRowNoBorder,
                        ]}
                      >
                        <View style={styles.colPlayer}>
                          <PlayerAvatar player={p} size={QUEUE_AVATAR_SIZE} />
                          <Text style={styles.playerName} numberOfLines={1}>
                            {p.name}
                          </Text>
                        </View>
                      </View>
                    </React.Fragment>
                  );
                })}
              </ScrollView>
            )}

            {/* Slutmarkör — 🏁 End of Game om sista kö-frågan = totalQuestions,
                annars 🔁 + more questions. */}
            {(() => {
              const lastQ =
                queueQuestionNumbers[queueQuestionNumbers.length - 1] ?? currentQuestion;
              const isEndOfGame = totalQuestions - lastQ <= 0;
              return (
                <View style={styles.endOfGameRow}>
                  <Text style={styles.endOfGameText}>
                    {isEndOfGame ? '🏁  End of Game' : '🔁  + more questions'}
                  </Text>
                </View>
              );
            })()}

            {/* Footer: total-räknare + #Players som diskret subtitle under
                tabellen. Bevarar information som tidigare fanns i header-
                räkneverket men tar mycket mindre plats. */}
            <Text style={styles.tableFooter}>
              {`Round ${currentRound} of ${totalRounds} · Question ${currentQuestion} of ${totalQuestions} · ${playerCount} players`}
            </Text>
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
    case 'image': return 'Image';
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
  // (Colors.card bg + borderBottom). Quit Game-pillen sitter till vänster
  // via flex-row + ingen justifyContent-override (default flex-start).
  quitBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    // Vertikal-centrerad grupp av play+upNext. paddingTop > paddingBottom
    // biasar centreringen NEDÅT så hela gruppen sitter lägre i bild — ger
    // luft mellan QuitBar/corner-logo och play-knappen.
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxxl * 2,
    paddingBottom: Spacing.xl,
    gap: Spacing.xxxl,
  },

  // ── Game settings-block ────────────────────────────────────────────────
  // Centrerad row med logo + settings-text. alignSelf: 'center' så hela
  // gruppen sitter i mitten oavsett text-bredd. paddingHorizontal ger
  // andrum från skärm-kanterna.
  settingsBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  settingsTextWrap: {
    gap: 2,
  },
  settingsTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  settingsRow: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  settingsValue: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  // Row-wrapper så "Answer response time:"-rubriken och dropdown-trigger:n
  // sitter på samma rad istället för att stapelas vertikalt.
  responseDropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  // Dropdown-trigger för Answer response time. Visar nuvarande värde + ▼.
  // Locked-state (mid-round i Pass-the-Phone) byter chevron till 🔒 och
  // dimmar texten — tap visar info-Alert istället för att öppna dropdown:n.
  responseDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
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
  // som primary-fet text — ingen border/bg/chevron/lock-ikon. Speglar
  // settingsValue-stilen för Game era så de två settings-raderna ser
  // visuellt konsistenta ut för non-host.
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
  leaderboardHeaderChevron: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
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
  lbColR: { width: 32 },
  lbColCheck: { width: 32 },
  lbColTime: { width: 60 },
  lbColLast5: { width: 96 },
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
    color: Colors.textSecondary,
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
    paddingHorizontal: Spacing.sm,
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
    gap: Spacing.md,
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
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
    gap: Spacing.md,
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  mediaLabel: {
    flexShrink: 1,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  mediaQueueLabel: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },

  // Kö-listan scrollar internt om många rader; cap:as så slutmarkör + footer
  // alltid syns under den.
  queueScroll: {
    width: '100%',
    maxHeight: 180,
  },

  // ── Dot-bar progress (IndDev) ──────────────────────────────────────────
  // Ersätter Q-kolumnen i kö-tabellen. Render:as ovanför "Media source:"-
  // raden. totalQuestions dots fördelade left-to-right, wrap:ar vid 10 per
  // rad (= 10+10 vid max 20 ronder). Filled = currentQuestion st (gjorda
  // + näst-på-tur), empty = resten. Speglar exemplet Peter delade.
  progressBarBlock: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: 6,
  },
  // Samma dämpade overline-stil som "Next:"-header-cellen så de två
  // sub-rubrikerna i IndDev-blocket läses som en visuell grupp.
  progressBarLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  // Vertikal stack av 1-2 rader dots. >10 frågor splittas jämnt så raderna
  // får liknande bredd istället för en full + en kort rad.
  progressBarRowsWrap: {
    flexDirection: 'column',
    gap: 4,
  },
  progressBarRow: {
    flexDirection: 'row',
    gap: 4,
  },
  // Rektangulär pill — 28×16 form skiljer fyllda från ofyllda. Fyllda
  // dots delar färgtema med currentPlayerBox/currentMediaBox ("Next:"-
  // rad nedanför): primaryMuted bg + primary border. Det binder ihop
  // progressen visuellt med "var du är nu just nu"-indikatorn istället
  // för två konkurrerande primary-toner. Ofyllda får en muted border
  // så de håller layout-utrymmet utan att skrika.
  progressDot: {
    width: 28,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    backgroundColor: 'transparent',
  },
  progressDotFilled: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
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

  // Slutmarkör (🔁 + more questions / 🏁 End of Game) under tabellen.
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
    gap: Spacing.lg,
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

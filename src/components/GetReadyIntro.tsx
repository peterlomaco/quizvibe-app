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
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import { QuizVibeLogo } from './QuizVibeLogo';
import { QuizVibePlayLogo } from './QuizVibePlayLogo';

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
}

interface Props {
  /** Spelaren som ska börja sin runda — visas i Pass-the-Phone-rutan. */
  currentPlayer: IntroPlayer;
  /** Spelare som kommer på tur EFTER current — i ordning, med ev. wrap-around.
   *  Capade i quiz.tsx så endast spelare som faktiskt hinner spela ingår. */
  queue: IntroPlayer[];
  /** Rond-nummer per kö-spelare (1-baserat, parallell till queue). */
  queueRoundNumbers: number[];
  /** Fråge-nummer per kö-spelare (1-baserat, parallell till queue). */
  queueQuestionNumbers: number[];
  /** Aktuell runda för den som ska svara (1-baserad). */
  currentRound: number;
  /** Totalt antal rundor — visas bara i header-räkneverket ovanför rutan. */
  totalRounds: number;
  /** Aktuellt frågenummer för den som ska svara (1-baserat, löpande över hela spelomgången). */
  currentQuestion: number;
  /** Totalt antal frågor — visas bara i header-räkneverket. */
  totalQuestions: number;
  /** Antal spelare i spelomgången — visas högerställt i header-raden. */
  playerCount: number;
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
  /** Optional: visar Quit Game-knappen längst upp som river lobby:n. */
  onQuit?: () => void;
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
  currentPlayer,
  queue,
  queueRoundNumbers,
  queueQuestionNumbers,
  currentRound,
  totalRounds,
  currentQuestion,
  totalQuestions,
  playerCount,
  eraFrom,
  eraTo,
  answerResponseSeconds,
  onAnswerResponseSecondsChange,
  responseSecondsLocked = false,
  leaderboard,
  onReady,
  onQuit,
}: Props) {
  const playerName = currentPlayer.name;
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
      {/* Quit Game-bar längst upp — körs via Alert-bekräftelse i quiz.tsx
          (deactiverar rummet och kastar ut host till Home). Renderas bara när
          parent passerar in onQuit-handler:n. */}
      {onQuit && (
        <View style={styles.quitBar}>
          <TouchableOpacity
            style={styles.quitBtn}
            onPress={onQuit}
            accessibilityLabel="Quit Game"
          >
            <Text style={styles.quitBtnText}>Quit Game</Text>
          </TouchableOpacity>
        </View>
      )}

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
          </View>
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
          {leaderboardOpen && (
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
                  {leaderboard.map((entry, index) => (
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
                    {/* Spelar-rader */}
                    {leaderboard.map((entry) => (
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
                    ))}
                  </View>
                </ScrollView>

                {/* Höger fixed kolumn: PTS */}
                <View style={styles.lbRightCol}>
                  <View style={[styles.lbCell, styles.lbHeaderCell, styles.lbRightCell]}>
                    <Text style={styles.lbHeaderText}>PTS</Text>
                  </View>
                  {leaderboard.map((entry) => (
                    <View
                      key={entry.playerId}
                      style={[styles.lbCell, styles.lbRightCell]}
                    >
                      <Text style={styles.lbPoints}>{entry.points}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>
      )}

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
            playLogoShadow). ── */}
        <View style={styles.playBlock}>
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
        </View>

        {/* ── Turordningstabell ──────────────────────────────────────────
            En enhetlig tabell med kolumnerna R: (Round) | Q: (Question) |
            Pass-the-Phone to:. Header-raden står först, sedan current player
            som en highlighted box i sista kolumnen, sedan kö-spelarna utan
            box. Slutmarkör (🔁 + more questions / 🏁 End of Game) under kön. */}
        <View style={styles.tableBlock}>
          {/* Header-rad */}
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <View style={[styles.colR, styles.cellHeader]}>
              <Text style={styles.headerCellText}>R:</Text>
            </View>
            <View style={[styles.colQ, styles.cellHeader]}>
              <Text style={styles.headerCellText}>Q:</Text>
            </View>
            <View style={[styles.colPlayer, styles.cellHeader]}>
              <Text style={styles.headerCellText}>Pass-the-Phone to:</Text>
            </View>
          </View>

          {/* Current player-rad — R/Q-cellerna ser ut som vanliga rad-celler,
              men Player-cellen får en primary-bordered box runt avatar+namn
              så det är tydligt vem som är näst på tur. */}
          <View style={styles.tableRow}>
            <View style={styles.colR}>
              <Text style={styles.numText}>{currentRound}</Text>
            </View>
            <View style={styles.colQ}>
              <Text style={styles.numText}>{currentQuestion}</Text>
            </View>
            <View style={[styles.colPlayer, styles.colPlayerCurrentWrap]}>
              <View style={styles.currentPlayerBox}>
                <PlayerAvatar player={currentPlayer} size={QUEUE_AVATAR_SIZE} />
                <Text style={styles.currentPlayerName} numberOfLines={1}>
                  {playerName}
                </Text>
              </View>
            </View>
          </View>

          {/* Kö-rader (scrollar internt om kön är lång). Sista raden får
              ingen botten-divider så slutmarkören sitter direkt under den.
              "Round X"-separator infogas mellan två kö-rader när rondnumret
              förändras (jämfört med föregående rad eller current player) —
              redundant info mot R-kolumnen men gör round-bytena tydligare
              vid en snabb blick på listan. */}
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
                      <View style={styles.colR}>
                        <Text style={styles.numText}>{round}</Text>
                      </View>
                      <View style={styles.colQ}>
                        <Text style={styles.numText}>{queueQuestionNumbers[i]}</Text>
                      </View>
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
      </View>
    </SafeAreaView>
  );
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
    height: 36,
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

  // Vänster fixed kolumn — Pos + Namn med trim/numberOfLines.
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

  // Mitt scrollbar kolumn — innehåller alla detail-celler.
  lbMidScroll: {
    flex: 1,
  },
  lbMidRow: {
    height: 36,
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

  // Kö-listan scrollar internt om många rader; cap:as så slutmarkör + footer
  // alltid syns under den.
  queueScroll: {
    width: '100%',
    maxHeight: 180,
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
});

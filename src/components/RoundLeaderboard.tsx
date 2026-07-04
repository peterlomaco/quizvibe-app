import { Nunito_700Bold, useFonts } from '@expo-google-fonts/nunito';
import React, { useMemo } from 'react';
import { Animated, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import { QuizVibeQAvatar } from './QuizVibeQAvatar';
import { WifiOffIcon } from './WifiOffIcon';

// Final Leaderboard bakgrunds-Q + pokal. Q-SVG:n är ~90% av skärmbredden så
// figuren dominerar mid-screen-arean utan att överlappa Home/Play Again-
// knapparna i botten. Pokal-emojin är ~40% av Q-storleken så den fyller
// Q-ringen tydligt utan att svämma över kantlinjen.
// viewBox "19 19 36 36" centrerar Q-ringen (cx=37, cy=37) EXAKT i SVG-
// render-boxen så pokal-emojin (centrerad i wrap:ern) hamnar precis i
// mitten av Q-ringen. Q-koordinater matchar QuizVibeLogo:s Q exakt
// (cx=37, cy=37, r=13, svans M46→L52, strokeWidth 3).
const BG_Q_SIZE = Math.round(Dimensions.get('window').width * 0.9);
const BG_TROPHY_SIZE = Math.round(BG_Q_SIZE * 0.4);

/**
 * Looped-arrow-BORDER som fyller hela Play Again-knappens yta och
 * fungerar som button:s synliga kantlinje (Pressable:n själv har ingen
 * borderWidth). En enda Path tracer en stängd rundad rektangel CCW
 * med en INTEGRERAD chevron-notch i botten-kanten nära vänstra hörnet —
 * notchen dippar ner i en V-form som visuellt fungerar som pilspets
 * nedåt och fortsätter sedan tillbaka upp i bottenkanten. Hela formen
 * ryms innanför width × height (= button-bounds) så ingen overflow
 * klipps av sticky footer eller safe area.
 */
function PlayAgainLoopBorder({
  width,
  buttonHeight,
  bottomY,
  color,
  strokeWidth = 2,
}: {
  width: number;
  /** Pressable:s höjd (touchable area). SVG positioneras absolute med
   *  top: 0, så denna styr alignering med Pressable. */
  buttonHeight: number;
  /** Y-koordinaten där rektangelns bottenkant + chevron-spetsen ligger
   *  (= Home-knappens bottom-edge). För host: = buttonHeight; för
   *  non-host: = buttonHeight - TRIANGLE_HALF_H. Chevron spänner
   *  bottomY±TRIANGLE_HALF_H så host:s chevron extends under Pressable:n. */
  bottomY: number;
  color: string;
  strokeWidth?: number;
}) {
  const cornerR = 14;
  const inset = strokeWidth / 2 + 1.5;
  const TRIANGLE_HEIGHT = 14;     // total vertikal spann (halv-ovan + halv-under bottenkant)
  const TRIANGLE_REACH = 16;      // hur långt vänster spetsen extends
  const TRIANGLE_LEFT_GAP = 5;    // luft mellan spetsen och vänster bottenkant
  const TRIANGLE_HALF_H = TRIANGLE_HEIGHT / 2;
  const left = inset;
  const right = width - inset;
  const top = inset;
  // bottom = rektangelns nedre kant = chevron-spetsens y = Home-bottom y
  const bottom = bottomY;
  // SVG-höjden måste rymma chevron-botten (= bottom + TRIANGLE_HALF_H)
  // plus en liten marginal för strokeLinejoin-round. Om SVG-höjden >
  // buttonHeight extends SVG:n under Pressable:n (overflow: visible på
  // parent tillåter det).
  const svgHeight = Math.max(buttonHeight, bottom + TRIANGLE_HALF_H + 1);
  // Triangelns top-hörn — OVAN bottenkanten med halv-höjd
  const triangleTopX = width / 2 + 4; // svagt höger om mitten för visuell balans
  const triangleTopY = bottom - TRIANGLE_HALF_H;
  // Triangelns bottom-hörn (samma x, UNDER bottenkanten med halv-höjd)
  const triangleBottomX = triangleTopX;
  const triangleBottomY = bottom + TRIANGLE_HALF_H;
  // Triangelns spets pekar vänster, EXAKT på bottenkantens y
  const triangleTipX = triangleTopX - TRIANGLE_REACH;
  const triangleTipY = bottom;
  // Var vänster bottenkant återupptas — strax vänster om spetsen
  const leftEdgeResumeX = triangleTipX - TRIANGLE_LEFT_GAP;

  // Bakgrunds-fyllning — STÄNGD rounded rectangle (utan gap) som fylls
  // med Colors.card så button:s interiör matchar Home-knappens utseende.
  // Renderas FÖRE outline:n nedan så outline-stroken och chevron-triangeln
  // sitter ovanpå. Bgens shape matchar outline:s yttre bounds exakt.
  const bgPath = [
    `M ${left + cornerR} ${top}`,
    `L ${right - cornerR} ${top}`,
    `Q ${right} ${top} ${right} ${top + cornerR}`,
    `L ${right} ${bottom - cornerR}`,
    `Q ${right} ${bottom} ${right - cornerR} ${bottom}`,
    `L ${left + cornerR} ${bottom}`,
    `Q ${left} ${bottom} ${left} ${bottom - cornerR}`,
    `L ${left} ${top + cornerR}`,
    `Q ${left} ${top} ${left + cornerR} ${top}`,
    'Z',
  ].join(' ');

  // Rektangelns outline med gap i bottenkanten. Höger bottenkant slutar
  // EXAKT vid triangelns top-hörn (CONNECTED på höger sida). Vänster
  // bottenkant återupptas vid leftEdgeResumeX (= LÄNGRE VÄNSTER än
  // triangelns spets) → synligt gap mellan spetsen och vänster
  // bottenkant. Ingen `Z` — path:en avslutas öppen där den startade
  // för att undvika oönskad diagonal-closure genom rektangeln.
  const rectPath = [
    `M ${left + cornerR} ${top}`,
    `L ${right - cornerR} ${top}`,
    `Q ${right} ${top} ${right} ${top + cornerR}`,
    `L ${right} ${bottom - cornerR}`,
    `Q ${right} ${bottom} ${right - cornerR} ${bottom}`,
    // Höger bottenkant — slutar EXAKT vid triangelns top-hörn (connected)
    `L ${triangleTopX} ${bottom}`,
    // MOVE över gapet — vänster bottenkant återupptas väl till vänster
    // om triangelns spets
    `M ${leftEdgeResumeX} ${bottom}`,
    `L ${left + cornerR} ${bottom}`,
    `Q ${left} ${bottom} ${left} ${bottom - cornerR}`,
    `L ${left} ${top + cornerR}`,
    `Q ${left} ${top} ${left + cornerR} ${top}`,
  ].join(' ');

  // ◁-triangel som hänger ner under bottenkanten. Top-hörnet sitter på
  // bottenkant-nivå (= där höger bottenkant slutar → CONNECTED).
  // Path-ordning: top → bottom (vertikal höger-sida) → tip (diagonal
  // UP-LEFT) → Z stänger tillbaka till top (diagonal UP-RIGHT = top-arm).
  const chevronPath = [
    `M ${triangleTopX} ${triangleTopY}`,
    `L ${triangleBottomX} ${triangleBottomY}`,
    `L ${triangleTipX} ${triangleTipY}`,
    'Z',
  ].join(' ');

  return (
    <Svg
      width={width}
      height={svgHeight}
      viewBox={`0 0 ${width} ${svgHeight}`}
      style={{ position: 'absolute', top: 0, left: 0 }}
      pointerEvents="none"
    >
      {/* Bg-fill FÖRST så den ligger bakom outline + chevron */}
      <Path d={bgPath} fill={Colors.card} stroke="none" />
      <Path
        d={rectPath}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d={chevronPath}
        stroke={color}
        strokeWidth={strokeWidth}
        fill={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Play Again matchar Home-knappens dimensioner exakt — ingen overflow
// utanför button-bounds, ingen tail-extension. Loop-symbolik bärs av en
// inline-ikon till vänster om "PLAY AGAIN"-texten (samma layout-mönster
// som Home:s Q-logo + "Home"-text).
//
// Två höjd-varianter:
// - HOST (single-line "PLAY AGAIN"): 56 px räcker — chevron landar
//   ~1.5 px under texten utan överlapp.
// - NON-HOST (two-line "Approve / Play Again"): texten är ~32 px tall
//   så den skulle överlappa chevron i en 56-px-button. Vi använder 74 px
//   istället — bottenkanten + chevron skiftas ner ~18 px, vilket ger
//   ~4-5 px luft mellan text-botten och chevron-toppen.
const PLAY_AGAIN_BUTTON_HEIGHT_COMPACT = 56;
const PLAY_AGAIN_BUTTON_HEIGHT_EXPANDED = 64;

/**
 * Final Leaderboard:s Play Again-knapp. Loop-SVG i bakgrunden + text
 * centrerad ovanpå + valfri kant-skärande badge i top-position.
 *
 * `color` styr både SVG-loopens stroke och textens färg. `disabled` mörkar
 * texten och ignorerar tap. `badge` (om satt) renderas absolut-positionerad
 * vid loopens topp-kant så den "skär igenom" loopens streckade ram (samma
 * mönster som FREE/PREMIUM-badges på Game Mode-toggle:n).
 */
function PlayAgainButton({
  lines,
  color,
  onPress,
  disabled,
  badge,
  buttonHeight,
  bottomY,
}: {
  /** Etiketten är title-case strings ("Play again", "Approve") som
   *  renderas as-is utan textTransform. Two-line varianten stackar
   *  raderna vertikalt med mindre fontsize. */
  lines: string[];
  color: string;
  onPress?: () => void;
  disabled: boolean;
  badge?: string;
  /** Pressable:s höjd (touchable area). */
  buttonHeight: number;
  /** Y-koordinaten där rektangelns bottenkant + chevron-spetsen ligger
   *  (= där Home-knappens bottom-edge ska linjera). */
  bottomY: number;
}) {
  const [width, setWidth] = React.useState(0);
  const twoLine = lines.length > 1;
  const pulse = React.useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    if (disabled) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [disabled, pulse]);
  return (
    <Animated.View style={{ flex: 1, transform: [{ scale: pulse }] }}>
    <Pressable
      onPress={disabled ? undefined : onPress}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={({ pressed }) => [
        styles.finalPlayAgainBtn,
        { height: buttonHeight },
        !disabled && pressed && { opacity: 0.85 },
      ]}
    >
      {width > 0 && (
        <PlayAgainLoopBorder
          width={width}
          buttonHeight={buttonHeight}
          bottomY={bottomY}
          color={color}
          strokeWidth={2}
        />
      )}
      <View style={[styles.finalPlayAgainTextWrap, { height: buttonHeight }]}>
        {lines.map((line, idx) => (
          <Text
            key={idx}
            style={[
              twoLine ? styles.finalPlayAgainTextSmall : styles.finalPlayAgainText,
              { color },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {line}
          </Text>
        ))}
      </View>
      {badge && (
        <View
          style={[styles.playAgainBadge, { backgroundColor: color }]}
          pointerEvents="none"
        >
          <Text style={styles.playAgainBadgeText}>{badge}</Text>
        </View>
      )}
    </Pressable>
    </Animated.View>
  );
}

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
  /** true när frågan missades pga dålig uppkoppling (non-host unstableLocked). */
  connectionError?: boolean;
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

// Mock-opponent-score: speglar calculatePoints i quiz.tsx.
// Rätt svar = 1p oavsett assistance; assistance styr bara träffsäkerhet.
export function generateOpponentRoundScore(
  assistance: AssistanceLevel,
  questionKind: 'year' | 'name' = 'name',
): { points: number; correct: boolean } {
  const accuracy = { full: 0.45, standard: 0.65, minimal: 0.78 }[assistance];
  const correct = Math.random() < accuracy;
  return { points: correct ? 1 : 0, correct };
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
  onApprovePlayAgain,
  isLastRound,
  isHost = true,
  guestHost = false,
  guestReplaysUsed = 0,
  hostInitiatedPlayAgain = false,
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
  /** Host:s Play Again-tap (eller PtP där isHost alltid är true). */
  onPlayAgain?: () => void;
  onGoHome?: () => void;
  /** Non-host:s Approve Play Again-tap. Endast aktiv när
   *  hostInitiatedPlayAgain === true. */
  onApprovePlayAgain?: () => void;
  isLastRound: boolean;
  /** Driver vilken final-knapp som visas: host får "Play Again",
   *  non-host får "Approve Play Again" med dimmed/active-läge baserat
   *  på hostInitiatedPlayAgain. Default true (= Pass-the-Phone-fallet
   *  + bakåt-kompat för befintliga call-sites). */
  isHost?: boolean;
  /** True när spelets host är en guest ("Start Game as Guest"-lobby).
   *  Guest hosts har max 1 Play Again-replay: omgång 1 (guestReplaysUsed=0)
   *  visar Play Again + not; omgång 2 (>=1) visar bara Home. Non-host i
   *  guest-spel ser Home tills hostInitiatedPlayAgain — då gold Approve
   *  (aldrig den dimmade "Activated by Host"-placeholdern). */
  guestHost?: boolean;
  /** Antal replays guest-hosten förbrukat (bara meningsfullt på host-
   *  enheten; non-host styrs av hostInitiatedPlayAgain). Default 0. */
  guestReplaysUsed?: number;
  /** Non-host: host har tappat Play Again → button lights up. Ignored
   *  för host. */
  hostInitiatedPlayAgain?: boolean;
  allRoundScoresHistory: RoundScore[][];
  hcpChanges?: Record<string, HcpChange>;
}) {
  // Nunito 700 Bold för Final Leaderboard:s "QuizVibe"-vattenstämpel-text
  // under Q+pokal-loggan. Matchar startskärmens appName-textformat 1:1.
  // Faller tillbaka till systemfont under font-load.
  const [fontsLoaded] = useFonts({ Nunito_700Bold });
  const brandFont = fontsLoaded ? 'Nunito_700Bold' : undefined;
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
    // connectionErrors = antal frågor spelaren missat jämfört med den som
    // spelat flest. Om A spelat 3 och B spelat 2 → B får 1 i wifi-kolumnen.
    const maxRounds = entries.reduce((m, e) => Math.max(m, e.playedRounds), 0);
    const entriesWithErrors = entries.map((e) => ({
      ...e,
      connectionErrors: Math.max(0, maxRounds - e.playedRounds),
    }));
    return entriesWithErrors.sort((a, b) => {
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
              <View style={[styles.lbColConnErr, { alignItems: 'center', justifyContent: 'center' }]}>
                <WifiOffIcon size={17} />
              </View>
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

      {/* Bakgrunds-Q med pokal-ikon som transparent vattenstämpel ÖVER
          leaderboard-tabellen. Renderas EFTER ScrollView i JSX så den ligger
          ovanpå tabellen i z-order (men UNDER sticky footer som renderas
          efter denna). pointerEvents='none' så taps på underliggande tabell-
          rader/Pressables inte blockas. Q+trophy är centrerade i wrap:erns
          flex-layout och låg opacity (G opacity={0.22}, trophy opacity 0.22)
          säkerställer att leaderboard-text + statistik förblir läsbara genom
          vattenstämpeln. */}
      {isLastRound && (
        <View style={styles.bgFinalWrap} pointerEvents="none">
          <Svg
            width={BG_Q_SIZE}
            height={BG_Q_SIZE}
            viewBox="19 19 36 36"
          >
            {/* G-wrap med opacity istället för per-element opacity — där
                Q-ringen och svansen tangerar varandra ackumuleras annars
                stroke-opacity vid overlap och området får en tydligt
                mörkare nyans. Med opacity på G-nivå komponeras gruppen
                som en enhet efter att stroke-pixlarna ritats → enhetlig
                ton över hela Q-formen. Färgsatt i Colors.warning (gold)
                för att signalera "vinnar-skärm" passande för Final
                Leaderboard. */}
            <G opacity={0.22}>
              <Circle
                cx={37}
                cy={37}
                r={13}
                fill="none"
                stroke={Colors.warning}
                strokeWidth={3}
              />
              <Path
                d="M46 46 L52 52"
                stroke={Colors.warning}
                strokeWidth={3}
                strokeLinecap="round"
              />
            </G>
          </Svg>
          <Text style={styles.bgFinalTrophy} numberOfLines={1}>
            🏆
          </Text>
          {/* "QuizVibe"-brand-text under Q+pokal-loggan. Naturligt flöde
              under SVG:n (trophy är absolute så påverkar inte). Matchar
              startskärmens appName-typografi (fontSize 38, weight 700,
              letterSpacing -0.5, Nunito_700Bold) men i gold och med samma
              transparens som Q+pokal (opacity 0.22). */}
          <Text
            style={[styles.bgFinalBrand, brandFont && { fontFamily: brandFont }]}
            numberOfLines={1}
          >
            QuizVibe
          </Text>
        </View>
      )}

      {/* Sticky footer-rad — flex-baserad pinning vid skärmens nederkant så
          knapparna alltid syns även när tabellen scrollar. justifyContent:
          'flex-end' höger-ställer Home + Play Again i ändan av raden. */}
      <View style={styles.stickyFooter}>
      {isLastRound ? (
        (() => {
          // Två separata höjd-värden:
          //   playAgainHeight = Pressable:s touchable area
          //   bottomY = rektangel-outline-botten + chevron-spets y
          //           (= där Home:s underkant ska linjera)
          //
          // HOST: playAgain = 56, bottomY = 56 (= playAgain). Chevron
          //       extends 7 px UNDER Pressable. Home matchar bottomY (56).
          // NON-HOST: playAgain = 74, bottomY = 67 (= playAgain - 7).
          //       Chevron ryms HELT inom Pressable (bottom-corner vid 74).
          //       Home matchar bottomY (67) — KORTARE än Play Again så
          //       finalActions kräver alignItems: 'flex-start' för top-align.
          const TRIANGLE_HALF_H = 7;
          const playAgainHeight = isHost
            ? PLAY_AGAIN_BUTTON_HEIGHT_COMPACT
            : PLAY_AGAIN_BUTTON_HEIGHT_EXPANDED;
          const bottomY = isHost
            ? playAgainHeight
            : playAgainHeight - TRIANGLE_HALF_H;
          const homeHeight = bottomY;
          // Guest-hostat spel — max 1 replay:
          //   • Host, omgång 2 (guestReplaysUsed >= 1): bara Home.
          //   • Non-host: bara Home TILLS hostInitiatedPlayAgain-broadcasten
          //     anländer — då faller vi igenom till gold Approve-grenen.
          //     Den dimmade "Activated by Host"-placeholdern renderas ALDRIG
          //     i guest-spel (den bär ingen information här: på omgång 2
          //     broadcastar host aldrig, så Home-only är rätt slutläge utan
          //     att non-host behöver känna till replay-räknaren).
          //   • Host, omgång 1: faller igenom till normal blå Play Again +
          //     "Replay only possible 1 time..."-not (renderas nedan).
          if (guestHost && (isHost ? guestReplaysUsed >= 1 : !hostInitiatedPlayAgain)) {
            return (
              <View style={styles.finalActions}>
                <Pressable
                  onPress={onGoHome}
                  style={({ pressed }) => [
                    styles.finalHomeBtn,
                    { height: PLAY_AGAIN_BUTTON_HEIGHT_COMPACT },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <QuizVibeQAvatar size={32} variant="wifi" />
                  <Text style={styles.finalHomeBtnText}>Home</Text>
                </Pressable>
              </View>
            );
          }
          return (
            <>
              {/* Guest host omgång 1: replay-begränsningen kommuniceras
                  ovanför knapparna (Peters copy). Bara host-enheten — non-
                  host känner inte till räknaren. */}
              {guestHost && isHost && guestReplaysUsed === 0 && (
                <Text style={styles.guestReplayNote}>
                  Replay only possible 1 time for Guest Hosts
                </Text>
              )}
            <View style={styles.finalActions}>
              {/* Home-knapp — höjden = bottomY så Home:s underkant linjerar
                  exakt med rektangel-outline-botten + chevron-spetsens y i
                  Play Again-knappen. */}
              <Pressable
                onPress={onGoHome}
                style={({ pressed }) => [
                  styles.finalHomeBtn,
                  { height: homeHeight },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <QuizVibeQAvatar size={32} variant="wifi" />
                <Text style={styles.finalHomeBtnText}>Home</Text>
              </Pressable>
              {isHost ? (
                /* Host (eller Pass-the-Phone): Play again-knapp aktiv direkt.
                   Loop-border + integrerad arrow-chevron längs nedre kanten. */
                <PlayAgainButton
                  lines={['Play again']}
                  color={Colors.primary}
                  onPress={onPlayAgain}
                  disabled={false}
                  buttonHeight={playAgainHeight}
                  bottomY={bottomY}
                />
              ) : hostInitiatedPlayAgain ? (
                /* Non-host efter host:s tap: "Approve" / "Play again" på två
                   rader så texten ryms inom button-bredden. Aktiv styling i
                   GULD — host har "öppnat upp" knappen, så den lyser i
                   warning/premium-färgen för att signalera "actionable" och
                   skilja från host:s vanliga blå Play again. */
                <PlayAgainButton
                  lines={['Approve', 'Play again']}
                  color={Colors.warning}
                  onPress={onApprovePlayAgain}
                  disabled={false}
                  buttonHeight={playAgainHeight}
                  bottomY={bottomY}
                />
              ) : (
                /* Non-host innan host tappat: dämpad two-line + "Activated by
                    Host"-badge kant-skärande i top-position. */
                <PlayAgainButton
                  lines={['Approve', 'Play again']}
                  color={Colors.textSecondary}
                  onPress={undefined}
                  disabled={true}
                  badge="Activated by Host"
                  buttonHeight={playAgainHeight}
                  bottomY={bottomY}
                />
              )}
            </View>
            </>
          );
        })()
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
  // Bakgrunds-Q wrapper — absolute-positionerad i mitten av skärmen, BAKOM
  // ScrollView:n. Q-SVG:n och pokal-emojin centreras inom wrappern.
  // pointerEvents='none' sätts på View:n i JSX (runtime-prop) så taps når
  // ScrollView:s rader och Play Again-knappen utan att blockas.
  bgFinalWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Pokal-emoji centrerad ovanpå Q-SVG:n. position: 'absolute' så storleken
  // inte påverkar wrap:erns flex-layout — Q och pokal staplas konceptuellt.
  // FontSize matchar ~halv Q-storlek så pokalen sitter inuti Q-ringen.
  // opacity låg så bakgrunden inte konkurrerar med leaderboard-innehållet.
  bgFinalTrophy: {
    position: 'absolute',
    fontSize: BG_TROPHY_SIZE,
    opacity: 0.22,
    // textAlignVertical Android-quirk + lineHeight = exakt fontSize på iOS
    // håller emojin pixel-centrerad inom sin Text-box.
    lineHeight: BG_TROPHY_SIZE,
    textAlign: 'center',
  },
  // "QuizVibe"-brand-text under Q+pokal — naturligt flow under SVG:n (inte
  // absolute) så wrap:erns column-flex stackar dem vertikalt centrerat.
  // fontFamily appliceras inline i JSX via brandFont-ref (kräver useFonts-
  // load). Textformat matchar app/index.tsx:s `appName`-stil i övrigt
  // (weight, letterSpacing, fontFamily) men fontSize bumpad till 52 för
  // att brand-texten ska få visuell pondus som vattenstämpel under den
  // stora Q-loggan. Gold (Colors.warning) + opacity 0.22 håller texten
  // som vattenstämpel utan att konkurrera med leaderboard-innehållet.
  bgFinalBrand: {
    fontSize: 52,
    fontWeight: '700',
    color: Colors.warning,
    letterSpacing: -0.5,
    textAlign: 'center',
    opacity: 0.22,
    // Negativ marginTop drar texten närmare Q:et. Q-SVG:n har ~3 viewBox-
    // units (= ~30 px på vanlig telefon-bredd) tom plats under Q-svansen
    // innan SVG:s underkant. -Spacing.xxl klämmer ihop det gapet så texten
    // sitter precis intill svansens visuella slut.
    marginTop: -Spacing.xxl,
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
  // Slimmad padding: top sm (8), bottom md (12) ger kompakt footer-höjd
  // utan att kollidera med iPhone:s home-indikator (SafeAreaView ovan
  // hanterar inset på riktiga enheter).
  stickyFooter: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
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
  // Q + ✓ + ✗ komprimerade till 22 px vardera (var 32) så AVG-kolumnen
  // ryms inom initial mid-scroll-vyn utan horisontell scroll. Synkat
  // med GetReadyIntro:s lb-tabell — håll dem identiska.
  lbColR: { width: 22 },
  lbColCheck: { width: 22 },
  lbColTime: { width: 60 },
  lbColLast5: { width: 96 },
  lbColConnErr: { width: 36 },
  lbConnErrZero: { color: Colors.textSecondary },
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

  // Action-row i sticky footer — Home (flex:1) på vänster halva, Play
  // again (flex:1) på höger halva med Spacing.sm gap mellan. För
  // non-host är Home (67px) kortare än Play again (74px), så vi
  // top-alignar med 'flex-start' — Home:s underkant landar vid
  // bottomY (= chevron-spets) istället för stretching till hela höjden.
  // För host är båda 56px och top-align ger samma visuella resultat
  // som default-stretch.
  finalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  // Home-knapp: Q-logo VÄNSTER om "Home"-text på samma rad. Bg matchar
  // leaderboard-tabellens dataradsbg (Colors.card) så knappen visuellt knyter
  // an till leaderboardens nedre del.
  finalHomeBtn: {
    flex: 1,
    // height sätts inline från RoundLeaderboard:s `buttonHeight` (varierar
    // mellan host:s 56 px och non-host:s 74 px så raden förblir alignad).
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
  // Replay-begränsnings-not för guest hosts (omgång 1) — liten grå rad
  // ovanför footer-knapparna, speglar LobbyScreen:s guestHostNote-stil.
  guestReplayNote: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  // Play Again — same height as Home men ingen egen border eller bg;
  // PlayAgainLoopBorder-SVG:n absolut-positioneras innanför och fungerar
  // som button:s synliga kantlinje (loop med integrerad pil i nedre
  // kanten). overflow: 'visible' så badgens kant-skärande top-position
  // inte klipps; loop-pilen själv ryms innanför button-bounds.
  finalPlayAgainBtn: {
    flex: 1,
    // height sätts inline från PlayAgainButton:s `buttonHeight` prop
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    position: 'relative',
  },
  // Text-wrap: column-stack så två-rads-varianten (Approve/Play Again)
  // stackar vertikalt. Padding-horizontal lämnar lite marginal till
  // loop-border:s vänster + höger sida så texten aldrig touchar SVG-
  // strecken vid smala button-bredder.
  finalPlayAgainTextWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  // Title-case text utan textTransform — använder string-casen direkt
  // ("Play again", "Approve") så bara begynnelsebokstaven är versal i
  // varje ord vi vill markera, resten gemener.
  finalPlayAgainText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  // Two-line varianten används av non-host:s "Approve / Play again".
  // Mindre fontsize (sm) så båda raderna ryms bekvämt inom button-bredden
  // tillsammans (även när badge:n är ovanför).
  finalPlayAgainTextSmall: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.2,
    textAlign: 'center',
    lineHeight: 16,
  },
  // Kant-skärande badge "Activated by Host" i top-position på loop-frame:n
  // (signal: knappen aktiveras först när host tryckt Play Again). Speglar
  // FREE/PREMIUM-badge-mönstret: små letters + bg matchande knappens
  // border-färg (driven av PlayAgainButton:s `color`-prop via inline-style)
  // + svart text, top: negativ så badgen klipper SVG-linjen ovanför
  // button-text-arean. Den dämpade (pre-host-tap) varianten får grå badge
  // så texten OCH badgen samtidigt signalerar "inaktiv" tills host trycker
  // Play Again. Background-värdet sätts inline i komponenten — denna
  // stylesheet-entry definierar bara layout/storlek.
  playAgainBadge: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  playAgainBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.background,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});

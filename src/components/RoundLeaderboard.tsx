import { Nunito_700Bold, useFonts } from '@expo-google-fonts/nunito';
import React, { useMemo, useState } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import { HostTypeOptions, type HostLobbyType } from './HostTypeOptions';
import { QuizVibeQAvatar } from './QuizVibeQAvatar';
import { VersusIcon } from './VersusIcon';
import { aggregateLabel, type AggregateLeaderboardData } from '../utils/aggregateLeaderboard';
import { containsProfanity } from '../utils/profanity';
import {
  finalizeRows,
  LeaderboardTable,
} from './LeaderboardTable';

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
/** Scale-puls 1 ↔ 1.04 över 700 ms — samma cadens som PlayAgainButton och
 *  Home:s gameBtn, så alla CTA:er på slutskärmen andas i takt. Pausas när
 *  `paused` (låst/grå knapp ska stå still) och nollas till 1. */
function useCtaPulse(paused: boolean) {
  const pulse = React.useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    if (paused) {
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
  }, [paused, pulse]);
  return pulse;
}

/** Samma cap som andra användarsynliga fritext-namn i appen. */
const RENAME_MAX_LENGTH = 40;

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

/**
 * Färdigaggregerad statistik för en spelare vars per-fråga-svar INTE finns
 * i allRoundScoresHistory. Remote 1v1 använder det för motståndaren:
 * `remote_match_answers` är RLS-skyddad per user, så bara summary-raden
 * (poäng/rätt/snittid) är läsbar. Fält vi saknar underlag för — LAST och
 * Last 5 — renderas som '—' respektive tomma prickar.
 */
export interface LeaderboardSummaryStats {
  playedRounds: number;
  correctAnswers: number;
  avgResponseSeconds: number | null;
  points: number;
}

export interface LeaderboardPlayer {
  id: string;
  name: string;
  emoji: string;
  /** Optional: remote-motståndarens rad kan sakna dem (meta-raden hoppas
   *  då över istället för att visa "Age 0"). */
  assistance?: AssistanceLevel;
  age?: number;
  /** Sätts istället för att aggregera ur allRoundScoresHistory. */
  summaryStats?: LeaderboardSummaryStats;
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
  /**
   * 0-baserat absolut frågeindex. Krävs för match highlights (bäst på
   * Musik/YouTube/…) som joinar mot effectiveCategoryByQuestion /
   * effectiveMediaSourceByQuestion — båda indexerade mot host:s
   * auktoritativa sekvens.
   *
   * Man kan INTE använda allRoundScoresHistory:s yttre index istället: i
   * Individual Devices appendas mottagna peer-scores som nya yttre poster i
   * ankomstordning (se playerScoreRecordedHandlerRef i quiz.tsx), så yttre
   * index ≠ frågeindex så fort fler än en enhet spelar.
   *
   * Optional för bakåtkompatibilitet — poster utan index filtreras bort ur
   * kategori-/källkorten men räknas fortfarande i totaler och snittider.
   */
  questionIndex?: number;
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
  belowTable,
  remote1v1 = false,
  onStartNewGame,
  startNewGameLocked = false,
  onStartNewGameLockedPress,
  onStartNewGamePress,
  startNewGameExpanded: startNewGameExpandedProp,
  hideRemotePlay = false,
  onReplayYes,
  onReplayNo,
  replayTitle = 'Re-match with Competition Leaderboard?',
  aggregateName,
  onRenameAggregate,
  replayAnswered = false,
  replayLocked = false,
  onReplayLockedPress,
  replayNote,
  homeOnlyFooter = false,
  interimFooter,
  trackConnectionErrors = false,
  aggregate,
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
  /** Extra sektion som renderas UNDER tabellen, inuti scroll-innehållet
   *  (dvs ovanför sticky-footern). Remote 1v1 skickar hit sin duell-panel
   *  ("Waiting for Player: X to play" / W-L-D-resultat) så spelarens eget
   *  resultat står överst och motståndar-statusen kommer efter. */
  belowTable?: React.ReactNode;
  /** Remote 1v1 — rubriken blir "Final Leaderboard - 1vs1" med duell-
   *  ikonen (samma VersusIcon som Home:s Remote Play + 1vs1 Matches). */
  remote1v1?: boolean;
  /** Gold "Start New Game"-knapp ovanför footer-knapparna med SAMMA inline-
   *  utfällning (Local Play / Remote Play) som Home:s knapp. Sätts av
   *  remote 1v1-slutskärmen, där Play Again inte finns — utan den vore
   *  Home enda vägen vidare och spelaren måste ta omvägen via startsidan
   *  för att utmana igen — OCH (2026-08-08) av host:s lokala slutskärm, där
   *  knappen ERSÄTTER Play Again. Är den satt för en host renderas ingen
   *  Play Again-knapp i footern (Home står ensam där).
   *  Utelämnas → knappen renderas inte alls. */
  onStartNewGame?: (lobbyType: HostLobbyType) => void;
  /**
   * Remote 1v1: true medan motståndaren fortfarande har frågor kvar att
   * spela. Knappen renderas då grå/inaktiv och tapp:en expanderar INTE
   * utfällningen — den kallar `onStartNewGameLockedPress` i stället, så
   * call-siten äger förklaringen.
   */
  startNewGameLocked?: boolean;
  onStartNewGameLockedPress?: () => void;
  /**
   * Sätts av lokala re-match-flödet: tappet lämnas till call-siten (som
   * kör credit-gaten) och panelens öppet-läge ägs där via
   * `startNewGameExpanded`. Utelämnas (remote-fallet) → komponenten togglar
   * panelen själv.
   */
  onStartNewGamePress?: () => void;
  /** Kontrollerat läge för utfällningen. Utelämnas → internt state. */
  startNewGameExpanded?: boolean;
  /** Dölj Remote Play i utfällningen. Guest hosts når aldrig remote 1vs1
   *  (läget är QuizVibe-users-only). */
  hideRemotePlay?: boolean;
  /**
   * "Re-match with Aggregate Leaderboard?" — slutskärmens FÖRSTA fråga till
   * host (Peter 2026-08-24 rev 3). Rubrik + inline Yes/No; Start New Game
   * visas INTE i detta läge (call-siten utelämnar `onStartNewGame` tills
   * host svarat No). Utelämnas `onReplayYes` → hela blocket renderas inte
   * (remote 1v1, non-host, guest host som förbrukat sin enda replay).
   *
   * Yes → carry-over-flödet (invite + Keep settings). No → call-siten
   * skickar in `onStartNewGame` i stället och blocket försvinner.
   */
  onReplayYes?: () => void;
  onReplayNo?: () => void;
  /** Rubriken över Yes/No. Single player aggregerar en SCORE (en spelare),
   *  flerspelar en LEADERBOARD — call-siten äger ordvalet så komponenten
   *  slipper känna till spellägen. */
  replayTitle?: string;
  /** Host har svarat Yes: No-knappen göms och `replayNote` visar väntan.
   *  Host kan inte ångra sig — inbjudan är redan utskickad (Peter). */
  replayAnswered?: boolean;
  /** Yes-knappen grå + otappbar medan non-hosts godkänner (IndDev). Tapp:en
   *  är kvar och förklarar väntan i stället för att vara död yta; när alla
   *  godkänt tänds den och host tappar den igen för att gå vidare. */
  replayLocked?: boolean;
  onReplayLockedPress?: () => void;
  /** Statusrad under Yes/No ("Waiting for 1 of 2 players to approve"
   *  / "✓ All players have approved"). */
  replayNote?: React.ReactNode;
  /** Slutskärmens footer blir Home-only. Används av Pass-the-Phone-
   *  spectatorn: re-match finns inte i PtP (Peter 2026-08-25), och utan
   *  flaggan får de den dimmade "Approve / Re-match"-knappen med badgen
   *  "Activated by Host" — en knapp som aldrig kan tändas. */
  homeOnlyFooter?: boolean;
  /** Ersätter "Next Round →"-knappen på INTERIM-leaderboarden.
   *  ⚠ Den knappen renderas annars identiskt tänd även utan `onNextRound`
   *  (onPress blir bara undefined, ingen disabled-styling) — en läsare utan
   *  rätt att gå vidare ser alltså en fullt levande CTA som inte gör något.
   *  PtP-spectatorn skickar hit en passiv "Waiting for host"-pill. */
  interimFooter?: React.ReactNode;
  /** Wifi-kolumnen härleds ur "antal frågor bakom ledaren", vilket bara är
   *  en giltig proxy för tappad uppkoppling när ALLA spelare förväntas svara
   *  på VARJE fråga (= Individual Devices). I Pass-the-Phone turas spelarna
   *  om, så en spelare som inte haft sin tur skulle annars få en falsk
   *  wifi-siffra. Default false — call-siten måste aktivt intyga läget. */
  trackConnectionErrors?: boolean;
  /**
   * Seriens sammanslagna standings ("Re-match with Aggregate Leaderboard").
   * Satt → slutskärmen blir en två-sidig pager: spelet som just spelats
   * först, seriens totalsumma på slide 2. Utelämnas (eller `gamesPlayed < 2`)
   * → oförändrad enkel-vy, så alla andra call-sites är orörda.
   *
   * Raderna går genom SAMMA finalizeRows som spelets egna — "utifrån samma
   * kriterier som Final Leaderboard" är hela poängen.
   */
  aggregate?: AggregateLeaderboardData;
  /** Namnet på den SERVER-sparade serien. Satt → visas som rubrik på
   *  aggregat-sidan i stället för den generiska etiketten. */
  aggregateName?: string | null;
  /** Host får byta namn. Utelämnas → ingen penna, ingen modal. Namnet syns
   *  för alla deltagare på deras Profile, så det ska bara vara host:s val. */
  onRenameAggregate?: (name: string) => void;
}) {
  // Nunito 700 Bold för Final Leaderboard:s "QuizVibe"-vattenstämpel-text
  // under Q+pokal-loggan. Matchar startskärmens appName-textformat 1:1.
  // Faller tillbaka till systemfont under font-load.
  const [fontsLoaded] = useFonts({ Nunito_700Bold });
  const brandFont = fontsLoaded ? 'Nunito_700Bold' : undefined;
  // "Start New Game"-knappens inline-utfällning (samma mönster som Home:
  // tap togglar panelen, valet stänger den och lämnar över till callbacken).
  // Kontrollerbart utifrån: lokala re-match-flödet skjuter in invite-frågan
  // mellan tapp och utfällning och äger därför öppet/stängt-läget själv.
  const [internalStartNewGameExpanded, setInternalStartNewGameExpanded] =
    useState(false);
  const isStartNewGameControlled = startNewGameExpandedProp !== undefined;
  const startNewGameExpanded = isStartNewGameControlled
    ? startNewGameExpandedProp
    : internalStartNewGameExpanded;
  // Puls på slutskärmens två gula CTA:er. Låst/grå knapp står still, och
  // Start New Game slutar pulsa när panelen är utfälld — pulsen betyder
  // "tappbar just nu", och då är valet redan gjort.
  const replayPulse = useCtaPulse(replayLocked);
  const startNewGamePulse = useCtaPulse(startNewGameLocked || startNewGameExpanded);
  // Aggregera per-spelare-statistik (samma struktur som GetReadyIntro:s
  // live-leaderboard så det är lätt att jämföra). Sortering: poäng desc →
  // avg response asc (ties brutna av snabbaste genomsnitt).
  const tableEntries = useMemo(() => {
    const entries = players.map((p) => {
      // Förberäknad rad (remote-motståndaren) — vi har ingen per-fråga-
      // historik att aggregera, så statistiken kommer färdig utifrån.
      if (p.summaryStats) {
        const s = p.summaryStats;
        return {
          playerId: p.id,
          name: p.name,
          emoji: p.emoji,
          age: p.age,
          assistance: p.assistance,
          points: s.points,
          playedRounds: s.playedRounds,
          correctAnswers: s.correctAnswers,
          incorrectAnswers: Math.max(0, s.playedRounds - s.correctAnswers),
          avgResponseSeconds: s.avgResponseSeconds ?? 0,
          lastResponseSeconds: null as number | null,
          lastFiveResults: [] as boolean[],
          hasLeft: !!p.hasLeft,
        };
      }
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
    return finalizeRows(entries, trackConnectionErrors);
  }, [players, allRoundScoresHistory, totalsByPlayerId, trackConnectionErrors]);

  // Slutskärmens två sidor: 0 = spelet som just spelats (ALLTID default —
  // det är resultatet spelarna precis skapade), 1 = seriens totalsumma.
  const [slide, setSlide] = useState(0);
  // Omdöpning: appen har ingen inline-edit-precedens — all fritext ligger i
  // modaler — så pennan öppnar en bottom-sheet i samma vokabulär som
  // Profile:s friends-modal.
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameText, setRenameText] = useState('');
  const [renameError, setRenameError] = useState<string | null>(null);
  // Sidbredden mäts i stället för att antas: pagern ligger innanför
  // scroll-innehållets padding, och `pagingEnabled` behöver exakt bredd för
  // att snäppa rätt.
  const [pageWidth, setPageWidth] = useState(0);
  const pagerRef = React.useRef<ScrollView>(null);

  // Aggregate-vyn: seriens sammanslagna standings genom SAMMA
  // finalizeRows-pipeline som spelet ovan, så kolumner och sortering är
  // identiska. `hasLeft` finns inte i serien — en spelare som lämnade ett av
  // spelen har ändå riktiga siffror från de andra.
  const aggregateEntries = useMemo(() => {
    if (!aggregate) return null;
    return finalizeRows(
      aggregate.standings.map((s) => ({
        playerId: s.playerId,
        name: s.name,
        emoji: s.emoji,
        age: s.age,
        assistance: s.assistance,
        points: s.points,
        playedRounds: s.playedRounds,
        correctAnswers: s.correctAnswers,
        incorrectAnswers: Math.max(0, s.playedRounds - s.correctAnswers),
        avgResponseSeconds: s.avgResponseSeconds,
        lastResponseSeconds: s.lastResponseSeconds,
        lastFiveResults: s.lastFiveResults,
        hasLeft: false,
      })),
      trackConnectionErrors,
    );
  }, [aggregate, trackConnectionErrors]);

  // Ett enda spel är ingen serie — då renderas den vanliga enkel-vyn och
  // ingen pager, inga flikar.
  const showAggregate =
    isLastRound && !!aggregateEntries && (aggregate?.gamesPlayed ?? 0) >= 2;
  const goToSlide = (index: number) => {
    setSlide(index);
    pagerRef.current?.scrollTo({ x: index * pageWidth, y: 0, animated: true });
  };

  return (
    <View style={styles.outer}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          {/* Remote 1v1 får duell-ikonen bredvid rubriken så slutskärmen
              matchar Home:s "Remote Play" + 1vs1 Matches-vokabulär. */}
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {showAggregate && slide === 1
                ? aggregateName?.trim() ||
                  aggregateLabel(aggregate?.standings.length ?? 0)
                : isLastRound
                  ? 'Final Leaderboard'
                  : 'Leaderboard'}
              {remote1v1 ? ' - 1vs1' : ''}
            </Text>
            {remote1v1 && <VersusIcon height={26} />}
            {/* Pennan bara på aggregat-sidan, och bara för host. Tappet på
                FLIKEN byter redan sida, så rename får inte hänga där. */}
            {showAggregate && slide === 1 && !!onRenameAggregate && (
              <Pressable
                onPress={() => {
                  setRenameText(aggregateName ?? '');
                  setRenameError(null);
                  setRenameOpen(true);
                }}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.renameBtn,
                  pressed && { opacity: 0.7 },
                ]}
                accessibilityLabel="Rename"
              >
                <Text style={styles.renameBtnGlyph}>✎</Text>
              </Pressable>
            )}
          </View>
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
        {showAggregate ? (
          <View
            style={styles.pagerWrap}
            onLayout={(e) => setPageWidth(e.nativeEvent.layout.width)}
          >
            {/* Flikarna är BÅDE indikator och kontroll. Svep fungerar över
                Player- och PTS-kolumnerna (de scrollar inte), men mitt-
                kolumnen är en egen horisontell ScrollView som äter gesten
                där — därför måste vyn alltid gå att nå med ett tapp. */}
            <View style={styles.slideTabs}>
              {['This game', `All ${aggregate?.gamesPlayed ?? 0} games`].map(
                (label, index) => (
                  <Pressable
                    key={label}
                    onPress={() => goToSlide(index)}
                    style={({ pressed }) => [
                      styles.slideTab,
                      slide === index && styles.slideTabActive,
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.slideTabText,
                        slide === index && styles.slideTabTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {label}
                    </Text>
                  </Pressable>
                ),
              )}
            </View>
            {/* Svep-hinten sitter DIREKT under flikarna (Peter 2026-08-26) —
                det är där blicken är när man just läst etiketterna. */}
            <Text style={styles.slideHint}>
              {slide === 1
                ? '←  Swipe back to this game'
                : `Swipe for the ${aggregateLabel(
                    aggregate?.standings.length ?? 0,
                  )}  →`}
            </Text>
            {/* Före första onLayout vet vi ingen bredd — rendera spelets
                tabell rakt av så slutskärmen aldrig blinkar tom. */}
            {pageWidth > 0 ? (
              <ScrollView
                ref={pagerRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) =>
                  setSlide(
                    Math.round(e.nativeEvent.contentOffset.x / pageWidth),
                  )
                }
              >
                <View style={{ width: pageWidth }}>
                  <LeaderboardTable entries={tableEntries} />
                </View>
                <View style={{ width: pageWidth }}>
                  <LeaderboardTable entries={aggregateEntries!} />
                </View>
              </ScrollView>
            ) : (
              <LeaderboardTable entries={tableEntries} />
            )}
          </View>
        ) : (
          <LeaderboardTable entries={tableEntries} />
        )}

      {/* Extra sektion under tabellen (Remote 1v1-duellpanelen). Ligger inuti
          scroll-innehållet så den hamnar mellan leaderboarden och sticky-
          footern istället för under Home/Play Again-knapparna. */}
      {belowTable}
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
      {/* Guest host, omgång 1: replay-begränsningen kommuniceras överst i
          footern (Peters copy). Bara host-enheten — non-host känner inte
          till räknaren. Låg sedan 2026-08-08 inuti Play Again-grenen, men
          guest hosts kör numera "Start New Game"-flödet och tar därför
          Home-only-grenen; noten hör till knappen, inte till grenen. */}
      {isLastRound && guestHost && isHost && guestReplaysUsed === 0 && (
        <Text style={styles.guestReplayNote}>
          Replay only possible 1 time for Guest Hosts
        </Text>
      )}
      {/* Slutskärmens FÖRSTA fråga till host: rubrik + inline Yes/No
          (Peter 2026-08-24 rev 3 — ingen popup, valet syns direkt). Medan
          den står uppe skickar call-siten INTE in onStartNewGame, så den
          knappen finns inte i DOM:en alls. Home-raden ligger kvar nedanför
          som vanligt. */}
      {isLastRound && onReplayYes && (
        <View style={styles.replayWrap}>
          <Text style={styles.replayTitle}>{replayTitle}</Text>
          <View style={styles.replayActions}>
            <Animated.View
              style={{ flex: 1, transform: [{ scale: replayPulse }] }}
            >
              <Pressable
                onPress={() => {
                  if (replayLocked) {
                    onReplayLockedPress?.();
                    return;
                  }
                  onReplayYes();
                }}
                style={({ pressed }) => [
                  styles.replayYesBtn,
                  replayLocked && styles.startNewGameBtnLocked,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text
                  style={[
                    styles.replayYesBtnText,
                    replayLocked && styles.startNewGameBtnTextLocked,
                  ]}
                >
                  Yes
                </Text>
              </Pressable>
            </Animated.View>
            {/* No göms sa fort host svarat Yes — inbjudan ar redan utskickad
                till non-hosts, sa det finns inget att angra (Peters val). */}
            {!replayAnswered && (
              <Pressable
                onPress={onReplayNo}
                style={({ pressed }) => [
                  styles.replayNoBtn,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.replayNoBtnText}>No</Text>
              </Pressable>
            )}
          </View>
          {!!replayNote && (
            <View style={styles.startNewGameNote}>{replayNote}</View>
          )}
        </View>
      )}
      {/* Gold "Start New Game" med samma inline-utfällning som Home:s knapp
          (Local Play / Remote Play). Renderas när call-siten skickar
          onStartNewGame: remote 1v1-slutskärmen (som saknar Play Again) och
          — sedan 2026-08-08 — host:s lokala slutskärm, där knappen ERSÄTTER
          Play Again. Panelen fälls ut UNDER knappen precis som på Home, och
          medan den är utfälld göms Home/Play Again-raden så valet står
          ensamt (samma mönster som Home döljer sina övriga knappar). */}
      {isLastRound && onStartNewGame && (
        <View style={styles.startNewGameWrap}>
          {/* Låst läge (remote: motståndaren spelar fortfarande) — grå
              knapp, ingen utfällning. Tapp:en är kvar och förklarar varför
              i stället för att vara en död yta. */}
          <Animated.View style={{ transform: [{ scale: startNewGamePulse }] }}>
          <Pressable
            onPress={() => {
              if (startNewGameLocked) {
                onStartNewGameLockedPress?.();
                return;
              }
              // Lokala flödet: call-siten kör credit-gaten och öppnar
              // panelen. Sedan 2026-08-24 ställs INGA carry-over-frågor här
              // — knappen beter sig exakt som Home:s. Vill host ta med
              // spelarna finns "Re-match with Aggregate Leaderboard?" ovanför.
              if (onStartNewGamePress) {
                onStartNewGamePress();
                return;
              }
              setInternalStartNewGameExpanded((prev) => !prev);
            }}
            style={({ pressed }) => [
              styles.startNewGameBtn,
              startNewGameLocked && styles.startNewGameBtnLocked,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text
              style={[
                styles.startNewGameBtnText,
                startNewGameLocked && styles.startNewGameBtnTextLocked,
              ]}
            >
              Start New Game
            </Text>
          </Pressable>
          </Animated.View>
          {startNewGameExpanded && !startNewGameLocked && (
            <HostTypeOptions
                accentColor={Colors.warning}
                remoteMode={hideRemotePlay ? 'hidden' : 'available'}
                onSelect={(lobbyType) => {
                  if (!isStartNewGameControlled) {
                    setInternalStartNewGameExpanded(false);
                  }
                  onStartNewGame(lobbyType);
                }}
            />
          )}
        </View>
      )}
      {startNewGameExpanded ? null : isLastRound ? (
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
          // Nya slutskärms-flödet ERSÄTTER Play Again för host:en — footer-
          // raden blir Home-only och den gula knappen ovanför är vägen
          // vidare. ⚠ Måste testa BÅDA callbacksen: i rev 3 skickas
          // `onStartNewGame` först när host svarat No på re-match-frågan, så
          // enbart `!!onStartNewGame` lät den dormanta blå "Play again"
          // dyka upp under Yes-knappen i steg 1 (Peter 2026-08-24).
          const hostUsesStartNewGame = isHost && (!!onStartNewGame || !!onReplayYes);
          if (
            homeOnlyFooter ||
            hostUsesStartNewGame ||
            (guestHost && (isHost ? guestReplaysUsed >= 1 : !hostInitiatedPlayAgain))
          ) {
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
                /* Non-host efter host:s tap: "Approve" / "Re-match" på två
                   rader så texten ryms inom button-bredden. Aktiv styling i
                   GULD — host har "öppnat upp" knappen, så den lyser i
                   warning/premium-färgen för att signalera "actionable" och
                   skilja från host:s vanliga blå Play again. */
                <PlayAgainButton
                  lines={['Approve', 'Re-match']}
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
                  lines={['Approve', 'Re-match']}
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
      ) : interimFooter ? (
        interimFooter
      ) : (
        <Pressable
          onPress={onNextRound}
          style={({ pressed }) => [styles.nextBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.nextBtnText}>Next Round  →</Text>
        </Pressable>
      )}
      </View>

      {/* Omdöpning. Speglar Profile:s friends-modal (bottom-sheet +
          KeyboardAvoidingView) — appen har ingen inline-edit-precedens.
          Namnet syns för alla deltagare på deras Profile, så det går genom
          containsProfanity precis som andra användarsynliga namn. */}
      <Modal
        visible={renameOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setRenameOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.renameOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable
            style={styles.renameBackdrop}
            onPress={() => setRenameOpen(false)}
          />
          <View style={styles.renameSheet}>
            <View style={styles.renameHandle} />
            <Text style={styles.renameTitle}>
              Rename {aggregateLabel(aggregate?.standings.length ?? 0)}
            </Text>
            <TextInput
              style={styles.renameInput}
              value={renameText}
              onChangeText={(t) => {
                setRenameText(t);
                if (renameError) setRenameError(null);
              }}
              placeholder="e.g. Friday Quiz"
              placeholderTextColor={Colors.textDisabled}
              maxLength={RENAME_MAX_LENGTH}
              returnKeyType="done"
              autoFocus
            />
            {!!renameError && (
              <Text style={styles.renameError}>{renameError}</Text>
            )}
            <Pressable
              onPress={() => {
                const next = renameText.trim();
                if (!next) {
                  setRenameError('Give it a name first.');
                  return;
                }
                if (containsProfanity(next)) {
                  setRenameError('Please choose a different name.');
                  return;
                }
                setRenameOpen(false);
                onRenameAggregate?.(next);
              }}
              style={({ pressed }) => [
                styles.renameSaveBtn,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.renameSaveBtnText}>Save</Text>
            </Pressable>
            <Pressable
              onPress={() => setRenameOpen(false)}
              style={({ pressed }) => [
                styles.renameCancelBtn,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.renameCancelBtnText}>Cancel</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  // Rubrik + ev. duell-ikon på samma rad. 'center' (inte 'baseline') så
  // VersusIcon:s SVG-box linjerar mot textens mitt istället för att hänga
  // under baslinjen.
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexShrink: 1,
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

  // ── Final ⟷ Aggregate-pager ───────────────────────────────────────────
  pagerWrap: {
    gap: Spacing.sm,
  },
  slideTabs: {
    flexDirection: 'row',
    gap: Spacing.xs,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 3,
  },
  slideTab: {
    flex: 1,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Vald flik: guld RAM + vit text, men BLÅ bakgrund (Peter 2026-08-26).
  // Guld-fyllningen togs bort — den gav hela fliken en gul ton. Ramen bär
  // "vald"-signalen, bakgrunden hör till appens vanliga blå vokabulär.
  slideTabActive: {
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  slideTabText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  slideTabTextActive: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  slideHint: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  renameBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  renameBtnGlyph: {
    fontSize: 14,
    color: Colors.primary,
  },
  // Bottom-sheet — speglar ProfileScreen:s friendsModal 1:1.
  renameOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  renameBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  renameSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  renameHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderStrong,
    alignSelf: 'center',
  },
  renameTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  renameInput: {
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingHorizontal: Spacing.lg,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  renameError: {
    fontSize: FontSize.sm,
    color: Colors.error,
  },
  renameSaveBtn: {
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  renameSaveBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  renameCancelBtn: {
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  renameCancelBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
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
  // "Start New Game"-blocket (knapp + ev. utfälld lobbytyp-panel). Marginal
  // nedåt skiljer det från Home/Play Again-raden när panelen är infälld.
  startNewGameWrap: {
    marginBottom: Spacing.sm,
  },
  // Speglar Home:s gameBtn + gameBtnUser 1:1 (höjd 56, gold bg + gold kant,
  // svart text) så knappen läses som exakt samma CTA som på startskärmen.
  // Re-match-frågan: gold rubrik + Yes/No på en 50/50-rad under. Rubriken
  // är text (inte knapp) — den ställer frågan, knapparna svarar.
  replayWrap: {
    marginBottom: Spacing.sm,
  },
  replayTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.warning,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  replayActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  // Yes = primär: samma gold-fyllda vokabulär som Start New Game.
  replayYesBtn: {
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.warning,
    borderWidth: 1,
    borderColor: Colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replayYesBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
  },
  // No = sekundär: neutral outline, ingen puls. Att tacka nej ska inte
  // konkurrera visuellt med Yes.
  replayNoBtn: {
    flex: 1,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replayNoBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  startNewGameBtn: {
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.warning,
    borderWidth: 1,
    borderColor: Colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Statusrad under lobbytyp-panelen (re-match: väntar på godkännanden).
  startNewGameNote: {
    marginTop: Spacing.sm,
    marginHorizontal: Spacing.sm,
    alignItems: 'center',
  },
  startNewGameBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  // Låst läge: samma geometri, grå palett (samma vokabulär som PREMIUM-
  // badgens grå = "inte tillgängligt ännu", inte "fel").
  startNewGameBtnLocked: {
    backgroundColor: Colors.cardElevated,
    borderColor: Colors.borderStrong,
  },
  startNewGameBtnTextLocked: {
    color: Colors.textDisabled,
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

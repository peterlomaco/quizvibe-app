import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import { QuizVibeLogo } from './QuizVibeLogo';

interface Props {
  playerName: string;
  /** Spelare som kommer på tur EFTER current — i ordning, med ev. wrap-around.
   *  Capade i quiz.tsx så endast spelare som faktiskt hinner spela ingår. */
  queueNames: string[];
  /** Rond-nummer per kö-spelare (1-baserat, parallell till queueNames). */
  queueRoundNumbers: number[];
  /** Fråge-nummer per kö-spelare (1-baserat, parallell till queueNames). */
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
  onReady: () => void;
  /** Optional: visar Quit Game-knappen längst upp som river lobby:n. */
  onQuit?: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
// Liten corner-logo i övre högra hörn som accent — frigör hela vertikala
// flödet för play-knappen och upNext-blocket. Capad mot skärmbredd för
// säkerhets skull, fast 140 är trångt nog att alltid få plats.
const LOGO_SIZE = Math.min(140, SCREEN_WIDTH - 96);
// Storleken på den "förlängda" Up next-rutan + dess inramning av play-knappen
// hänger på halo:ns extra storlek runt knappen.
const PLAY_BUTTON_SIZE = 120;
const PLAY_HALO_INSET = 22;

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
  playerName,
  queueNames,
  queueRoundNumbers,
  queueQuestionNumbers,
  currentRound,
  totalRounds,
  currentQuestion,
  totalQuestions,
  playerCount,
  onReady,
  onQuit,
}: Props) {
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

      {/* ── Logo + GET READY TO VIBE-overlay som corner-accent i övre
          högra hörnet. Absolut-positionerad utanför container-flödet så
          den inte tar vertikal plats från play-knappen och upNext-blocket. */}
      <View style={styles.logoCorner} pointerEvents="none">
        <View style={styles.logoWrap}>
          <QuizVibeLogo size={LOGO_SIZE} />
          <View style={styles.logoTextOverlay} pointerEvents="none">
            <Text style={styles.logoOverlayText}>GET READY</Text>
            <Text style={styles.logoOverlayText}>TO VIBE</Text>
          </View>
        </View>
      </View>

      <View style={styles.container}>
        {/* ── Play: kvadratisk pulserande+glowande knapp, centrerad mellan
            quitbar/logo-corner och pass-the-phone-blocket via container:s
            space-around-distribution över 2 barn (play + upNext). ── */}
        <View style={styles.playBlock}>
          <Animated.View
            style={[styles.playButtonWrap, { transform: [{ scale: playPulse }] }]}
          >
            <Animated.View
              style={[styles.playButtonHalo, { opacity: playGlow }]}
              pointerEvents="none"
            />
            <TouchableOpacity
              style={styles.playButton}
              activeOpacity={0.85}
              onPress={onReady}
              accessibilityLabel={`${playerName} press to start your turn`}
            >
              <Text style={styles.playGlyph}>▶</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* ── Pass-the-Phone: extended box med current player + vertikal kö ──
            Current player står inuti den primary-bordered rutan (white, bold,
            display-storlek). Resten av turordningen radas upp som en löpande
            lista i grå text under rutan så spelarna hela tiden ser vems tur
            det är efter denna, och efter den, osv. Block:et ligger längst ner
            i bild så turordningen är det sista användaren ser innan tap. */}
        <View style={styles.upNextBlock}>
          {/* Header-rad: vänster = Round/Question-räkneverk (2 rader med
              labels + delad cell-ruta + "of N"-suffix); höger = #Players-
              indikator på samma vertikala nivå. Total-värdena (Y, M) visas
              som "of N"-suffix eftersom de är fastställda vid spelstart. */}
          <View style={styles.headerRow}>
            <View style={styles.headerCounter}>
              <View style={styles.headerCounterRow}>
                <Text style={styles.headerCounterLabel}>Round</Text>
                <View style={[styles.headerCounterCell, styles.counterCellTop]}>
                  <Text style={styles.headerCounterNumber}>{currentRound}</Text>
                </View>
                <Text style={styles.headerCounterTotal}>{`of ${totalRounds}`}</Text>
              </View>
              <View style={styles.headerCounterRow}>
                <Text style={styles.headerCounterLabel}>Question</Text>
                <View style={[styles.headerCounterCell, styles.counterCellBottom]}>
                  <Text style={styles.headerCounterNumber}>{currentQuestion}</Text>
                </View>
                <Text style={styles.headerCounterTotal}>{`of ${totalQuestions}`}</Text>
              </View>
            </View>
            <View style={styles.headerPlayers}>
              <Text style={styles.headerPlayersLabel}>#Players:</Text>
              <Text style={styles.headerPlayersValue}>{playerCount}</Text>
            </View>
          </View>
          <View style={styles.upNextBox}>
            {/* Stort räkneverk för den som ska svara — staplad ruta med
                rond-X (topp) och fråge-X (botten), namn till höger. */}
            <View style={styles.upNextBoxRow}>
              <View style={styles.bigCounter}>
                <View style={[styles.bigCounterCell, styles.counterCellTop]}>
                  <Text style={styles.bigCounterNumber}>{currentRound}</Text>
                </View>
                <View style={styles.bigCounterCell}>
                  <Text style={styles.bigCounterNumber}>{currentQuestion}</Text>
                </View>
              </View>
              <View style={styles.upNextNameWrap}>
                <Text style={styles.upNextNameLabel}>Pass-the-Phone to:</Text>
                <Text style={styles.upNextName} numberOfLines={1}>
                  {playerName}
                </Text>
              </View>
            </View>
          </View>
          {queueNames.length > 0 && (
            <ScrollView
              style={styles.queueList}
              contentContainerStyle={styles.queueListContent}
              showsVerticalScrollIndicator={false}
            >
              {queueNames.map((name, i) => (
                <View key={`${i}-${name}`} style={styles.queueRow}>
                  <View style={styles.miniCounter}>
                    <View style={[styles.miniCounterCell, styles.counterCellTop]}>
                      <Text style={styles.miniCounterNumber}>
                        {queueRoundNumbers[i]}
                      </Text>
                    </View>
                    <View style={styles.miniCounterCell}>
                      <Text style={styles.miniCounterNumber}>
                        {queueQuestionNumbers[i]}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.queueItem} numberOfLines={1}>
                    {name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
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

  // ── Quit Game-bar ──────────────────────────────────────────────────────
  // Sticky topp-bar utanför container-View:n så den inte stör space-between-
  // distributionen av hero/play/upNext-blocken nedanför.
  quitBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
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
    // Vertikal-centrerad grupp av play+upNext med liten gap mellan dem så
    // upNext-blocket ligger tätt under play-knappen istället för längst ner.
    // paddingBottom > paddingTop biasar centreringen uppåt så play-knappen
    // hamnar i övre tredjedelen istället för exakt mitten.
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 0,
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.xxxl,
  },

  // ── Logo corner-accent ─────────────────────────────────────────────────
  // Absolut-positionerad i övre högra hörnet så den inte tar plats från
  // play-knappen / upNext-blocket. top: Spacing.sm = matchar QuitBar:s
  // paddingTop så logo-elementets överkant linjerar med QuitGame-knappens
  // överkant (kan inte gå högre än så — undviker överlapp med statusbar/
  // batteri-symbol). SVG:n har transparent padding inåt så själva Q-figuren
  // syns en bit ned från elementets överkant.
  logoCorner: {
    position: 'absolute',
    top: Spacing.xxl,
    right: 0,
  },
  logoWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTextOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoOverlayText: {
    // Krympt från 26 → 18 i takt med att LOGO_SIZE minskat så proportionerna
    // i hero-blocket håller sig.
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: Colors.background,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },

  // ── Pass-the-Phone (Up next) ──────────────────────────────────────────
  upNextBlock: {
    width: '100%',
    alignItems: 'stretch',
    gap: Spacing.sm,
  },

  // Header-rad: räkneverk vänster + #Players höger.
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Header-räkneverk: 2 rader (Round / Question), labels vänster,
  // delad-ruta-cells höger, "of N"-suffix längst höger.
  headerCounter: {
    paddingLeft: Spacing.xs,
    gap: 0,
  },
  // #Players:-block — högerställt på samma vertikala nivå som räkneverket.
  // Label i samma grå styling som Round/Question, värdet i primary-blå.
  headerPlayers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingRight: Spacing.xs,
  },
  headerPlayersLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.6,
  },
  headerPlayersValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  headerCounterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  headerCounterLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.6,
    minWidth: 72,
  },
  headerCounterCell: {
    width: 36,
    height: 28,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCounterNumber: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  headerCounterTotal: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },

  upNextBox: {
    width: '100%',
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  upNextBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },

  // Stort räkneverk inne i nästa-på-tur-rutan: 2-radigt med rond/fråga.
  bigCounter: {
    width: 56,
    overflow: 'hidden',
  },
  bigCounterCell: {
    height: 38,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigCounterNumber: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },

  upNextNameWrap: {
    flex: 1,
  },
  upNextNameLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  upNextName: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },

  // Cell-modifiers så de två cellerna i ett räkneverk delar en kant
  // (top-cell har rundad topp + ingen bottom-border; bottom-cell har
  // rundad botten). Skapar visuellt en delad ruta utan dubbel-border.
  counterCellTop: {
    borderTopLeftRadius: Radius.sm,
    borderTopRightRadius: Radius.sm,
    borderBottomWidth: 0.75,
  },
  counterCellBottom: {
    borderBottomLeftRadius: Radius.sm,
    borderBottomRightRadius: Radius.sm,
    borderTopWidth: 0.75,
  },

  queueList: {
    width: '100%',
    marginTop: Spacing.sm,
    // Cap:ar listan så långa köer (6+ spelare) scrollar internt istället
    // för att knuffa play-knappen utanför skärmen.
    maxHeight: 180,
  },
  queueListContent: {
    alignItems: 'stretch',
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
    // Box:en har 1.5px border + paddingHorizontal Spacing.lg → content-edge
    // ligger 17.5px från ytterkant. Spegla det här så kö-radernas slot-kant
    // linjerar med big-counter-kanten ovanför.
    paddingHorizontal: Spacing.lg + 1.5,
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  // miniCounter är ett "slot" i samma bredd som bigCounter (56) så
  // räkneverkets center-linje hamnar exakt under bigCounter:s. De faktiska
  // cellerna (36 breda) centreras inom slottet via alignItems: 'center'.
  // Resultatet: båda räkneverken delar centerlinje, OCH eftersom slot-bredden
  // är samma + samma gap till namnet, hamnar kö-namnen i samma kolumn som
  // det stora namnet ovanför.
  miniCounter: {
    width: 56,
    alignItems: 'center',
  },
  miniCounterCell: {
    width: 36,
    height: 22,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCounterNumber: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  queueItem: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },

  // ── Play ───────────────────────────────────────────────────────────────
  playBlock: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  playButtonWrap: {
    position: 'relative',
    width: PLAY_BUTTON_SIZE,
    height: PLAY_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonHalo: {
    position: 'absolute',
    top: -PLAY_HALO_INSET,
    left: -PLAY_HALO_INSET,
    right: -PLAY_HALO_INSET,
    bottom: -PLAY_HALO_INSET,
    borderRadius: Radius.xl + PLAY_HALO_INSET / 2,
    backgroundColor: Colors.primary,
  },
  playButton: {
    width: PLAY_BUTTON_SIZE,
    height: PLAY_BUTTON_SIZE,
    borderRadius: Radius.xl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    // iOS: primary-färgad shadow ger en mjuk blå glow runt knappen. Android
    // har inte shadowColor-support → faller tillbaka till grå elevation,
    // halo-View:n över ger då glowen istället.
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 18,
    elevation: 12,
  },
  playGlyph: {
    fontSize: 56,
    color: Colors.textPrimary,
    // ▶-glyfen är vänster-tung — liten höger-skift centrerar den optiskt.
    marginLeft: 4,
  },
});

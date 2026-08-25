import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Dimensions,
  Easing,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFonts, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { Colors, FontSize, FontWeight, Radius, Spacing, Typography } from '../theme';
import Confetti from './Confetti';
import SparkleDrawQ, { DRAW_MS } from './SparkleDrawQ';
import SparklerSound from './SparklerSound';
import { MediaSourceIcon } from './MediaSourceIcon';
import type { HighlightCard } from '../utils/matchHighlights';

/**
 * Prisutdelnings-sekvensen mellan sista frågans reveal och Final Leaderboard.
 *
 * Renderas som en OVERLAY ovanpå den redan monterade slutskärmen — inte som
 * en ersättande vy. Skälet: slutskärmens effekter (saveFinalGame,
 * finalizePlayer mot servern, analytics) körs redan när phase blir
 * 'leaderboard' och ska inte fördröjas av en animation. Med overlay startar
 * de direkt medan sekvensen spelar, och RoundLeaderboard behöver inte röras.
 *
 * ── Varje enhet äger sin egen sekvens ───────────────────────────────────
 * Ingen host-styrning och ingen broadcast: spelaren bläddrar själv och
 * lämnar när de vill via "Leave summary". En host som går till Home
 * avbryter alltså INTE en non-host som fortfarande tittar — den uppskjutna
 * "Host has deleted this lobby"-popupen visas först när de lämnar (se
 * pendingLobbyDeletedRef i quiz.tsx).
 *
 * ── Entrén: Q:t RITAS fram ──────────────────────────────────────────────
 * Q:t poppar inte in färdigt utan ritas med en gnistrande penna (se
 * SparkleDrawQ). Först när ringen och svansen är klara landar pokalen och
 * "QuizVibe" i märket — konfettin fyras av i samma ögonblick, så
 * uppmärksamheten går ritning → avslöjande → hyllning i den ordningen.
 *
 * ── Den mjuka övergången ────────────────────────────────────────────────
 * Märket här (guld Q + pokal + "QuizVibe") använder EXAKT samma geometri och
 * storlek som RoundLeaderboards vattenstämpel (bgFinalWrap/bgFinalTrophy/
 * bgFinalBrand). Det springer in i full opacitet, håller, och tonas sedan
 * ned till vattenstämpelns opacity 0.22 — på samma plats. När slöjan till
 * sist försvinner ligger den riktiga vattenstämpeln redan där, identisk, så
 * bytet är osynligt: det ser ut som ETT märke som dimmas.
 *
 * HÅLL DERAS GEOMETRI I SYNK — ändras BG_Q_SIZE eller bgFinalBrand i
 * RoundLeaderboard.tsx måste motsvarande konstanter här ändras med.
 */

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Speglar BG_Q_SIZE / BG_TROPHY_SIZE i RoundLeaderboard.tsx.
const Q_SIZE = Math.round(SCREEN_W * 0.9);
const TROPHY_SIZE = Math.round(Q_SIZE * 0.4);

/** Vattenstämpelns opacitet — sluttillståndet för märket. */
const WATERMARK_OPACITY = 0.22;

const COMPACT = SCREEN_H < 700;

/** En "sida" i kort-slidern är hela skärmbredden — krävs för pagingEnabled. */
const PAGE_W = SCREEN_W;

interface Timing {
  markIn: number;
  hold: number;
  settle: number;
  blockIn: number;
  cardHold: number;
  veilOut: number;
}

const FULL_TIMING: Timing = {
  markIn: 220,
  // Kortare än förr: rit-sekvensen (DRAW_MS) ligger nu före hållet, så den
  // totala celebration-tiden hamnar ändå på ungefär samma ~3,5 s.
  hold: 1100,
  settle: 900,
  blockIn: 350,
  cardHold: 2500,
  veilOut: 500,
};

// Reduce Motion: ingen fjädring, ingen konfetti, kortare håll — men
// sekvensen körs fullständigt så ingen går miste om innehållet.
const REDUCED_TIMING: Timing = {
  markIn: 1,
  hold: 900,
  settle: 250,
  blockIn: 200,
  cardHold: 1800,
  veilOut: 250,
};

type Stage = 'celebration' | 'highlights' | 'fading';

interface FinalCelebrationProps {
  /** Korten som ska visas. Tom array → bara celebration + Leave-knappen. */
  highlights: HighlightCard[];
  /** Anropas EN gång när uttoningen är klar. Parent döljer då overlayen. */
  onDone: () => void;
  /**
   * Enhetens ljudgrind. Skickas som `isAudioMutedForSelf` från quiz.tsx —
   * appens ENDA källa till sanning för om den här enheten ska låta. Lägg
   * aldrig en egen ljud-check här.
   */
  muted?: boolean;
}

export default function FinalCelebration({
  highlights,
  onDone,
  muted = false,
}: FinalCelebrationProps) {
  const [fontsLoaded] = useFonts({ Nunito_700Bold });
  const brandFont = fontsLoaded ? 'Nunito_700Bold' : undefined;

  const [stage, setStage] = useState<Stage>('celebration');
  const [pageIndex, setPageIndex] = useState(0);
  // Så fort spelaren själv sveper slutar korten bläddra automatiskt — annars
  // slåss auto-framåt mot den som just svepte bakåt. De lämnar då via
  // "Leave summary" i stället för att sekvensen tar slut av sig själv.
  const [userTookOver, setUserTookOver] = useState(false);
  const [confettiOn, setConfettiOn] = useState(false);
  const timingRef = useRef<Timing>(FULL_TIMING);
  const reduceMotionRef = useRef(false);
  const doneFiredRef = useRef(false);
  const stageRef = useRef<Stage>('celebration');
  stageRef.current = stage;
  const scrollRef = useRef<ScrollView>(null);

  // Startar på 1 — slöjan är OPAK redan i första framen. Med en fade-in
  // hann leaderboard-tabellen under synas ~400 ms först (och ännu längre:
  // AccessibilityInfo-kollen nedan await:as INNAN animationen startar), och
  // det lästes som en blixt när man kom in på slutskärmen. Bara uttoningen
  // i slutet animerar det här värdet.
  const veil = useRef(new Animated.Value(1)).current;
  const markScale = useRef(new Animated.Value(0.94)).current;
  const markOpacity = useRef(new Animated.Value(0)).current;
  // Startar på 0 och byggs upp MEDAN Q:t ritas — en glöd som ligger färdig
  // från första framen skulle avslöja märket innan pennan hunnit dit.
  const haloOpacity = useRef(new Animated.Value(0)).current;
  const blockOpacity = useRef(new Animated.Value(0)).current;

  // Pokalen + "QuizVibe" landar först NÄR Q:t är färdigritat.
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentScale = useRef(new Animated.Value(0.55)).current;
  const [sparkle, setSparkle] = useState(true);
  // Ljudet monteras först när vi VET att ritningen ska köras — annars hade
  // WebView:n monterats och rivits direkt för Reduce Motion-användare.
  const [playSound, setPlaySound] = useState(false);
  // Mount-tid = ungefär när SparkleDrawQ:s rit-effekt startar. Ljudet
  // använder den för att kompensera för WebView:ns laddningstid.
  const startedAtRef = useRef(Date.now());

  const fireDone = useCallback(() => {
    if (doneFiredRef.current) return;
    doneFiredRef.current = true;
    onDone();
  }, [onDone]);

  // ── Celebration-fasen ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    let anim: Animated.CompositeAnimation | null = null;
    let halo: Animated.CompositeAnimation | null = null;
    let confetti: ReturnType<typeof setTimeout> | null = null;
    let watchdog: ReturnType<typeof setTimeout> | null = null;

    (async () => {
      let reduce = false;
      try {
        reduce = await AccessibilityInfo.isReduceMotionEnabled();
      } catch {
        // Kan kasta på vissa plattformar/versioner — full animation är
        // säkert default (samma beteende som före denna feature).
      }
      if (cancelled) return;
      reduceMotionRef.current = reduce;
      const t = reduce ? REDUCED_TIMING : FULL_TIMING;
      timingRef.current = t;

      // Reduce Motion: ingen ritning och inga gnistor — Q:t står färdigt
      // från första framen och tonar bara in med resten av märket. Då
      // finns inget att sprakande ljudsätta heller.
      if (reduce) setSparkle(false);
      else if (!muted) setPlaySound(true);

      if (!reduce) {
        halo = Animated.sequence([
          // Glöden tänds i takt med ritningen och börjar pulsera först när
          // ringen slutits.
          Animated.delay(t.markIn),
          Animated.timing(haloOpacity, {
            toValue: 0.35,
            duration: Math.max(1, DRAW_MS - t.markIn),
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.loop(
            Animated.sequence([
              Animated.timing(haloOpacity, {
                toValue: 0.8,
                duration: 800,
                useNativeDriver: true,
              }),
              Animated.timing(haloOpacity, {
                toValue: 0.35,
                duration: 800,
                useNativeDriver: true,
              }),
            ]),
          ),
        ]);
        halo.start();
      }

      anim = Animated.sequence([
        // Ingen veil-fade-in: slöjan är redan opak (se veil-initieringen).
        Animated.parallel([
          Animated.timing(markOpacity, {
            toValue: 1,
            duration: t.markIn,
            useNativeDriver: true,
          }),
          Animated.timing(markScale, {
            toValue: 1,
            duration: t.markIn,
            useNativeDriver: true,
          }),
        ]),
        // ⚠ Bara en VÄNTAN, inte rit-animationen. SparkleDrawQ äger sin
        // egen ritning och rapporterar ingenting tillbaka — sekvensen här
        // får aldrig kunna fastna på den. En tidigare version hade
        // ritningen som ett steg i kedjan, och när dess callback uteblev
        // stannade allt i 'celebration': ingen pokal, ingen summary, ingen
        // väg ut ur den touch-blockerande slöjan.
        // ⚠ DRAW_MS räknas från MOUNT, inte härifrån: SparkleDrawQ startar
        // sin ritning i sin egen mount-effekt, parallellt med markIn ovan.
        // Utan avdraget landar pokalen 220 ms efter att Q:t blivit klart —
        // och efter fyrverkerismällen, som också ligger på mount+DRAW_MS.
        Animated.delay(reduce ? 0 : Math.max(0, DRAW_MS - t.markIn)),
        // Pokalen + ordmärket landar i det färdigritade Q:t.
        Animated.parallel([
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: reduce ? 1 : 260,
            useNativeDriver: true,
          }),
          reduce
            ? Animated.timing(contentScale, {
                toValue: 1,
                duration: 1,
                useNativeDriver: true,
              })
            : Animated.spring(contentScale, {
                toValue: 1,
                friction: 5,
                tension: 80,
                useNativeDriver: true,
              }),
        ]),
        Animated.delay(t.hold),
        // Märket sätter sig: tonas ned till vattenstämpelns opacitet, på
        // exakt samma plats och storlek som den riktiga stämpeln under.
        Animated.timing(markOpacity, {
          toValue: WATERMARK_OPACITY,
          duration: t.settle,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]);

      anim.start(({ finished }) => {
        if (!finished || cancelled) return;
        halo?.stop();
        setStage('highlights');
      });

      if (!reduce) {
        // Konfettin fyras av när pennan når slutet av svansen — alltså i
        // samma ögonblick som pokalen landar. Startar den tidigare tävlar
        // den om blicken med ritningen.
        confetti = setTimeout(() => {
          if (!cancelled) setConfettiOn(true);
        }, Math.max(0, DRAW_MS - 60));
      }

      // Skyddsnät. Att bli kvar i 'celebration' betyder att spelaren är
      // INLÅST bakom slöjan — ingen summary, ingen "Leave summary", inga
      // knappar som går att träffa. Skulle sekvensen mot förmodan inte
      // rapportera klart tar den här timern över.
      // 900 ms åt pokalens fjädring (den har ingen fast duration) och 1200
      // ms marginal ovanpå, så skyddsnätet aldrig hinner före ett normalt
      // avslut.
      const total =
        (reduce ? t.markIn : DRAW_MS) + 900 + t.hold + t.settle + 1200;
      watchdog = setTimeout(() => {
        if (cancelled || stageRef.current !== 'celebration') return;
        anim?.stop();
        halo?.stop();
        markOpacity.setValue(WATERMARK_OPACITY);
        contentOpacity.setValue(1);
        contentScale.setValue(1);
        setStage('highlights');
      }, total);
    })();

    return () => {
      cancelled = true;
      anim?.stop();
      halo?.stop();
      if (confetti) clearTimeout(confetti);
      if (watchdog) clearTimeout(watchdog);
    };
    // Körs en gång vid mount — sekvensen äger sin egen livscykel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Highlights-fasen: kort-slidern tonas in ────────────────────────────
  useEffect(() => {
    if (stage !== 'highlights') return;
    const anim = Animated.timing(blockOpacity, {
      toValue: 1,
      duration: timingRef.current.blockIn,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [stage, highlights.length, blockOpacity]);

  // Auto-bläddring — stannar permanent så fort spelaren svept själv.
  //
  // ⚠ Sekvensen avslutas ALDRIG av sig själv: når auto-bläddringen sista
  // kortet stannar den där och väntar på "Leave summary". Varje enhet ska
  // styra sin egen vy tills spelaren själv trycker — slutade den automatiskt
  // hamnade två enheter med samma antal kort och samma timing i mål nästan
  // exakt samtidigt, vilket såg ut som att hostens tapp kastade ut de andra.
  useEffect(() => {
    if (stage !== 'highlights' || userTookOver) return;
    if (highlights.length === 0) return;
    if (pageIndex >= highlights.length - 1) return;
    const id = setTimeout(() => {
      const next = pageIndex + 1;
      scrollRef.current?.scrollTo({
        x: next * PAGE_W,
        animated: !reduceMotionRef.current,
      });
      setPageIndex(next);
    }, timingRef.current.cardHold);
    return () => clearTimeout(id);
  }, [stage, pageIndex, userTookOver, highlights.length]);

  // ── Uttoning → onDone ──────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'fading') return;
    setConfettiOn(false);
    const t = timingRef.current;
    // ⚠ BARA `veil` animeras. Den ligger på overlayens ROT, så allt inuti
    // (märke, kort, prickar) tonar med automatiskt.
    //
    // Att dessutom animera blockOpacity/markOpacity här FRÖS skärmen: kort-
    // slidern avmonterades i samma ögonblick som stage blev 'fading', och en
    // native-driven animation mot en avmonterad nod fick Animated.parallel
    // (stopTogether: true) att aldrig rapportera `finished` → onDone fyrade
    // aldrig → den touch-blockerande slöjan låg kvar för alltid.
    //
    // Bonus: märket stannar kvar på vattenstämpelns 0.22 under uttoningen,
    // vilket är exakt vad den riktiga stämpeln under visar — överlämningen
    // blir sömlös.
    const anim = Animated.timing(veil, {
      toValue: 0,
      duration: t.veilOut,
      useNativeDriver: true,
    });
    anim.start(({ finished }) => {
      if (finished) fireDone();
    });
    // Skyddsnät: en kvarliggande slöja blockerar ALL input, så spelaren
    // måste komma vidare även om animationen mot förmodan aldrig rapporterar
    // klart. fireDone är idempotent.
    const watchdog = setTimeout(fireDone, t.veilOut + 400);
    return () => {
      anim.stop();
      clearTimeout(watchdog);
    };
  }, [stage, veil, fireDone]);

  const handleLeave = useCallback(() => {
    if (stageRef.current === 'fading') return;
    setStage('fading');
  }, []);

  const handleScrollBegin = useCallback(() => setUserTookOver(true), []);

  const handleMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(e.nativeEvent.contentOffset.x / PAGE_W);
      setPageIndex(Math.max(0, Math.min(highlights.length - 1, next)));
    },
    [highlights.length],
  );

  // Även utan kort ska blocket visas — "Leave summary" är enda vägen ut.
  // Blir kvar under 'fading' så det tonar bort MED overlayen i stället för
  // att poppa ur, och så ingen animation råkar peka på en avmonterad nod.
  const showHighlights = stage === 'highlights' || stage === 'fading';

  return (
    <Animated.View
      style={[styles.overlay, { opacity: veil }]}
      pointerEvents="box-none"
    >
      {/* Slöjan. Nästan opak så leaderboarden under inte konkurrerar, men
          inte helt — den lilla genomskinligheten gör uttoningen mjukare.

          Pressable med no-op onPress, INTE en vanlig View: overlayen är
          box-none och en View utan touch-handler blir aldrig responder, så
          taps skulle falla igenom till Home/Play Again i slutskärmens
          sticky footer under. Spelaren hade då kunnat trycka blint på
          knappar de inte ser. */}
      <Pressable style={styles.veil} onPress={() => {}} />

      {confettiOn && <Confetti active />}

      {/* Sprakljudet. Monterat bara under celebration-fasen — WebView:n
          rivs när korten tar över, vilket också är all städning som
          behövs. Efterknastret hinner klinga ut långt innan dess. */}
      {playSound && stage === 'celebration' && (
        <SparklerSound startedAt={startedAtRef.current} durationMs={DRAW_MS} />
      )}

      {/* Märket — samma geometri som RoundLeaderboards vattenstämpel. */}
      <Animated.View
        style={[
          styles.markWrap,
          { opacity: markOpacity, transform: [{ scale: markScale }] },
        ]}
        pointerEvents="none"
      >
        <Animated.View
          style={[styles.halo, { opacity: stage === 'celebration' ? haloOpacity : 0 }]}
        />
        <SparkleDrawQ size={Q_SIZE} active sparkle={sparkle} compact={COMPACT} />
        <Animated.Text
          style={[
            styles.trophy,
            { opacity: contentOpacity, transform: [{ scale: contentScale }] },
          ]}
          numberOfLines={1}
        >
          🏆
        </Animated.Text>
        <Animated.Text
          style={[
            styles.brand,
            brandFont ? { fontFamily: brandFont } : null,
            { opacity: contentOpacity, transform: [{ scale: contentScale }] },
          ]}
          numberOfLines={1}
        >
          QuizVibe
        </Animated.Text>
      </Animated.View>

      {showHighlights && (
        <Animated.View style={[styles.sliderBlock, { opacity: blockOpacity }]}>
          {/* Sekvensens egen rubrik — den tillhör overlayen och försvinner
              därför tillsammans med korten när spelaren trycker "Leave
              summary". Slutskärmens egen "Final Leaderboard"-rubrik tar då
              över. */}
          <Text style={styles.summaryHeading}>Game Summary</Text>

          {highlights.length > 0 && (
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScrollBeginDrag={handleScrollBegin}
              onMomentumScrollEnd={handleMomentumEnd}
              style={styles.pager}
              contentContainerStyle={styles.pagerContent}
            >
              {highlights.map((card) => (
                <View key={card.id} style={styles.page}>
                  <View style={styles.card}>
                    {/* Kategori → appens kant-skärande guld-badge (samma
                        vokabulär som GetReadyIntro:s categoryBadge). Alla tre
                        kategorier delar MEDVETET en enda guldfärg. */}
                    {card.category && (
                      <View style={styles.categoryBadge} pointerEvents="none">
                        <Text style={styles.categoryBadgeText}>{card.category}</Text>
                      </View>
                    )}
                    {/* Källa → appens OFFICIELLA brand-ikon (YouTubes röda
                        play-knapp, Spotify vit monokrom, Q+"?" för Hints).
                        Aldrig emoji — MediaSourceIcon är enda källan för
                        dessa så brand-reglerna hålls på ett ställe. */}
                    {card.source ? (
                      <MediaSourceIcon source={card.source} size={COMPACT ? 34 : 42} />
                    ) : card.icon ? (
                      <Text style={styles.cardIcon}>{card.icon}</Text>
                    ) : null}
                    <Text style={styles.cardTitle}>{card.title}</Text>
                    {card.playerName && (
                      <View style={styles.cardPlayerRow}>
                        {card.playerEmoji ? (
                          <Text style={styles.cardPlayerEmoji}>{card.playerEmoji}</Text>
                        ) : null}
                        <Text style={styles.cardPlayerName} numberOfLines={1}>
                          {card.playerName}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.cardValue}>{card.value}</Text>
                    {card.detail ? (
                      <Text style={styles.cardDetail}>{card.detail}</Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Prickar: vilket kort av hur många. Döljs vid ett enda kort. */}
          {highlights.length > 1 && (
            <View style={styles.dots} pointerEvents="none">
              {highlights.map((card, i) => (
                <View
                  key={card.id}
                  style={[styles.dot, i === pageIndex && styles.dotActive]}
                />
              ))}
            </View>
          )}

          {/* Direkt nedanför och UTANFÖR kortet. Renderas ÄVEN utan kort —
              det är enda vägen ur sekvensen, som aldrig avslutas av sig
              själv (se auto-bläddringen ovan). */}
          <Pressable
            onPress={handleLeave}
            style={({ pressed }) => [styles.leaveBtn, pressed && { opacity: 0.7 }]}
            hitSlop={10}
          >
            <Text style={styles.leaveText}>Leave summary</Text>
          </Pressable>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 80,
    elevation: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  veil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    opacity: 0.97,
  },
  // Speglar bgFinalWrap i RoundLeaderboard.tsx.
  markWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Guldglöd bakom märket under celebration-fasen. iOS-skugga; Android får
  // den mjuka fyllningen (elevation ger ingen färgad glow på RN).
  halo: {
    position: 'absolute',
    width: Q_SIZE * 0.62,
    height: Q_SIZE * 0.62,
    borderRadius: Q_SIZE,
    backgroundColor: Colors.warning,
    shadowColor: Colors.warning,
    shadowOpacity: 0.9,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
  },
  // Speglar bgFinalTrophy.
  trophy: {
    position: 'absolute',
    fontSize: TROPHY_SIZE,
    lineHeight: TROPHY_SIZE,
    textAlign: 'center',
  },
  // Speglar bgFinalBrand (utan dess opacity — den ligger på markWrap här).
  brand: {
    fontSize: 52,
    fontWeight: '700',
    color: Colors.warning,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginTop: -Spacing.xxl,
  },
  // Enda IN-FLOW-barnet i overlayen (slöja, märke och konfetti är alla
  // absolut positionerade), så overlayens alignItems/justifyContent center
  // centrerar det exakt. Medvetet INTE absolute — absoluta barn utan
  // top/bottom placeras enligt förälderns alignment i Yoga, vilket fungerar
  // men är implicit; den här formen är otvetydig.
  sliderBlock: {
    width: PAGE_W,
    alignItems: 'center',
  },
  // Samma vikt och storlek som slutskärmens egen rubrik (24 / 700 vit), så
  // de två läser som samma nivå i hierarkin när sekvensen lämnar över.
  summaryHeading: {
    fontSize: COMPACT ? 20 : 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: COMPACT ? Spacing.md : Spacing.lg,
  },
  // flexGrow: 0 så ScrollView:n tar kortets höjd i stället för att sträcka
  // sig över hela overlayen.
  pager: {
    width: PAGE_W,
    flexGrow: 0,
  },
  pagerContent: {
    alignItems: 'center',
  },
  page: {
    width: PAGE_W,
    paddingHorizontal: Spacing.xl,
    // Luft ovanför så den kant-skärande kategoribadgen (top: -9) inte
    // klipps av ScrollView:ns överkant.
    paddingTop: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    alignSelf: 'stretch',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.warningBorder,
    paddingVertical: COMPACT ? Spacing.lg : Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.xs,
    // Lyfter kortet från slöjan så det läses som ett eget lager.
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  // Kant-skärande kategoribadge — speglar GetReadyIntro:s categoryBadge
  // 1:1. Kortet får INTE sättas till overflow: 'hidden', då klipps badgen
  // (samma villkor som HOST/GUEST-badgen på PlayerRow).
  categoryBadge: {
    position: 'absolute',
    top: -9,
    left: Spacing.md,
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
  cardIcon: {
    fontSize: COMPACT ? 30 : 38,
    lineHeight: COMPACT ? 34 : 44,
  },
  cardTitle: {
    ...Typography.overline,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  cardPlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  cardPlayerEmoji: {
    fontSize: 22,
    lineHeight: 26,
  },
  cardPlayerName: {
    fontSize: COMPACT ? FontSize.lg : FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  cardValue: {
    fontSize: COMPACT ? 28 : 34,
    fontWeight: FontWeight.bold,
    color: Colors.warning,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
    marginTop: Spacing.xs,
  },
  cardDetail: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.borderStrong,
  },
  dotActive: {
    backgroundColor: Colors.warning,
  },
  // Grå fyllning med vit text. '#6B7280' är samma grå som appens övriga
  // neutrala/låsta element (PREMIUM-badgen utan prenumeration, RoundsRulers
  // klammer, HostTypeOptions muted badge) — inget nytt värde införs.
  leaveBtn: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: '#6B7280',
  },
  leaveText: {
    ...Typography.label,
    color: Colors.textPrimary,
  },
});

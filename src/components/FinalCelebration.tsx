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
import Svg, { Circle, G, Path } from 'react-native-svg';
import { useFonts, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { Colors, FontSize, FontWeight, Radius, Spacing, Typography } from '../theme';
import Confetti from './Confetti';
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
  markIn: 600,
  hold: 1800,
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
}

export default function FinalCelebration({ highlights, onDone }: FinalCelebrationProps) {
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
  const markScale = useRef(new Animated.Value(0.6)).current;
  const markOpacity = useRef(new Animated.Value(0)).current;
  const haloOpacity = useRef(new Animated.Value(0.35)).current;
  const blockOpacity = useRef(new Animated.Value(0)).current;

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

      if (!reduce) {
        halo = Animated.loop(
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
        );
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
          reduce
            ? Animated.timing(markScale, {
                toValue: 1,
                duration: t.markIn,
                useNativeDriver: true,
              })
            : Animated.spring(markScale, {
                toValue: 1,
                friction: 6,
                tension: 70,
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
        // Konfettin startar strax efter slöjan så den inte fyras av mot
        // en fortfarande genomskinlig bakgrund.
        setTimeout(() => {
          if (!cancelled) setConfettiOn(true);
        }, 200);
      }
    })();

    return () => {
      cancelled = true;
      anim?.stop();
      halo?.stop();
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
        <Svg width={Q_SIZE} height={Q_SIZE} viewBox="19 19 36 36">
          <G>
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
        <Text style={styles.trophy} numberOfLines={1}>
          🏆
        </Text>
        <Text
          style={[styles.brand, brandFont ? { fontFamily: brandFont } : null]}
          numberOfLines={1}
        >
          QuizVibe
        </Text>
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

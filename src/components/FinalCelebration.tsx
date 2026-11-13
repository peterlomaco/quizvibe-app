import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Dimensions,
  Easing,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Pressable } from '@/src/components/haptic';
import { Colors, FontSize, FontWeight, Radius, Spacing, Typography } from '../theme';
import Confetti from './Confetti';
import SparkleDrawQ, {
  DRAW_MS,
  RING_BOTTOM_FRACTION,
  RING_HOLE_FRACTION,
  RING_OUTER_FRACTION,
  RING_TOP_FRACTION,
} from './SparkleDrawQ';
import SparklerSound from './SparklerSound';
import HcpProgressSummary, { HCP_CARD_HOLD_MS } from './HcpProgressSummary';
import { QuizVibeWordmarkSvg } from './brand/QuizVibeBrandSvg';
import { WORDMARK_VIEWBOX } from './brand/quizVibeBrandGeometry';
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
 * lämnar när de vill via "Go to Final leaderboard". En host som går till Home
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

// Paus efter att slutskärmen är uppe innan prisutdelningen (Q-ritning + fyrverkeri)
// startar — så fyrverkeriet inte fyrar i själva landningsögonblicket utan en tydlig
// beat EFTER att spelaren nått slutskärmen. Se `ready`-effekten nedan. (Peter 2026-09-22.)
const CELEBRATION_START_DELAY_MS = 550;

// Logo-lockup (Peter 2026-11-02, tredje passet): Q:t är det dominanta
// märket, pokalen fyller ringhålet och ordmärket sitter tätt under ringen —
// en sammanhållen logga, inte tre lösa delar.
const Q_SIZE = Math.round(Math.min(SCREEN_W * 0.88, SCREEN_H * 0.46));
// Pokalen = EXAKT samma källa som "Final Leaderboard"-knappen i quiz.tsx
// ('🏆  Final Leaderboard'): systemets 🏆-emoji, bara uppskalad (Peter
// 2026-11-02). Rita INTE en egen pokal och byt inte till TrophyIcon.
export const FINAL_LEADERBOARD_TROPHY = '🏆';
const RING_HOLE_R = (Q_SIZE * RING_HOLE_FRACTION) / 2;
// Emojins glyf fyller ~85 % av em-rutan; storleken väljs så hörnen landar
// strax innanför ringhålet.
const TROPHY_FONT = Math.round(RING_HOLE_R * 1.5);
// Ordmärket (det riktiga Manrope-ordmärket från Brand Master). Smalare än
// ringen så det ryms under ringen till vänster om handtagets spets.
const WORDMARK_W = Math.round(Q_SIZE * 0.64);
const WORDMARK_H = (WORDMARK_W * WORDMARK_VIEWBOX.height) / WORDMARK_VIEWBOX.width;
// Glyferna börjar ~24/185 ned i ordmärkets viewBox och slutar ~160/185.
const WORDMARK_GLYPH_TOP = (WORDMARK_H * 24) / WORDMARK_VIEWBOX.height;
const WORDMARK_GLYPH_BOTTOM = (WORDMARK_H * 160) / WORDMARK_VIEWBOX.height;
// Luft mellan ringens underkant och bokstävernas överkant.
// ~16 pt synlig luft mellan ringen och bokstäverna (Peter 2026-11-02). Talet
// är större än luften eftersom glyf-insetten ovan underskattar ordmärkets
// tomma överkant något — med 0 överlappade bokstäverna ringen.
const LOCKUP_GAP = 22;
// Dra upp ordmärket över qBox:ens tomma botten (under ringen) och glyfernas
// inre luft, så avståndet ring → text blir exakt LOCKUP_GAP.
const WORDMARK_MARGIN_TOP = -(Q_SIZE * (1 - RING_BOTTOM_FRACTION)) - WORDMARK_GLYPH_TOP + LOCKUP_GAP;
// Kolumnens synliga innehåll: ringens överkant → glyfernas underkant. Vi
// centrerar DET (inte layout-boxarna) genom att förskjuta kolumnen.
const COLUMN_H = Q_SIZE + WORDMARK_MARGIN_TOP + WORDMARK_H;
const VISIBLE_TOP_IN_COLUMN = Q_SIZE * RING_TOP_FRACTION;
const VISIBLE_BOTTOM_IN_COLUMN = Q_SIZE + WORDMARK_MARGIN_TOP + WORDMARK_GLYPH_BOTTOM;
const LOCKUP_SHIFT = Math.round(
  COLUMN_H / 2 - (VISIBLE_TOP_IN_COLUMN + VISIBLE_BOTTOM_IN_COLUMN) / 2,
);
// Ringens överkant på skärmen — konfettin håller sig ovanför/utanför den.
// Ringens halva ytterbredd — konfettins sidobanor håller sig utanför den.
const RING_OUTER_HALF = (Q_SIZE * RING_OUTER_FRACTION) / 2;
const MARK_TOP = Math.round((SCREEN_H - COLUMN_H) / 2 + LOCKUP_SHIFT + VISIBLE_TOP_IN_COLUMN);

/** Sluttillstånd för märket (Q + pokal). Final Leaderboard har sedan 2026-10-21
 *  en ANNAN vattenstämpel (det nya Q:t, QuizVibeWatermark), så märket tonas
 *  ut helt i stället för att landa på den gamla vattenstämpelns 0.22 —
 *  annars hade bilden hoppat när slöjan försvinner. */
const WATERMARK_OPACITY = 0;

const COMPACT = SCREEN_H < 700;

/** En "sida" i kort-slidern är hela skärmbredden — krävs för pagingEnabled. */
const PAGE_W = SCREEN_W;

/**
 * Tak för placeringslistans höjd. Ett 12-spelarspel (premium IndDev) ryms
 * inte på en kort skärm, så listan scrollar internt i stället för att
 * trycka ut "Go to Final leaderboard" ur bild. Vid ~6 spelare eller färre
 * binder taket aldrig.
 */
const RANK_LIST_MAX_H = Math.round(SCREEN_H * 0.34);
// Taller than the rank list: each HCP progression is a full shield row.
const HCP_LIST_MAX_H = Math.round(SCREEN_H * 0.5);

/**
 * Extra hålltid per rad i ett placeringskort. En lista med tio namn hinner
 * inte läsas på samma tid som ett kort med ett enda tal.
 */
const RANK_ROW_HOLD_MS = 260;

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
  /** Spelarnamnet under "Game Summary"-rubriken (denna enhets spelare). */
  playerName?: string;
  /** Ersätter "Game Summary"-rubriken, t.ex. för den som når H2H-slutskärmen
   *  först (motståndaren har inte spelat klart → inga kort att visa). */
  heading?: string;
}

/**
 * Top Game Performance: den snabbaste tiden när flera delar högsta antalet
 * rätt — det är den som avgör vinnaren, så den lyfts fram i guld och pulserar
 * (scale 1 ↔ 1.12, native driver).
 */
function PulsingFastestTime({ text }: { text: string }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.12,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return (
    <Animated.Text
      style={[styles.rankSecondary, styles.rankSecondaryFastest, { transform: [{ scale: pulse }] }]}
    >
      {text}
    </Animated.Text>
  );
}

export default function FinalCelebration({
  highlights,
  onDone,
  muted = false,
  playerName,
  heading,
}: FinalCelebrationProps) {

  const [stage, setStage] = useState<Stage>('celebration');
  const [pageIndex, setPageIndex] = useState(0);
  // Så fort spelaren själv sveper slutar korten bläddra automatiskt — annars
  // slåss auto-framåt mot den som just svepte bakåt. De lämnar då via
  // "Go to Final leaderboard" i stället för att sekvensen tar slut av sig
  // själv.
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
  const leavePulse = useRef(new Animated.Value(1)).current;

  // Pokalen + "QuizVibe" landar först NÄR Q:t är färdigritat.
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentScale = useRef(new Animated.Value(0.55)).current;
  const [sparkle, setSparkle] = useState(true);
  // Ljudet monteras först när vi VET att ritningen ska köras — annars hade
  // WebView:n monterats och rivits direkt för Reduce Motion-användare.
  const [playSound, setPlaySound] = useState(false);
  // Sätts när sekvensen faktiskt STARTAR (se `ready` nedan). Ljudet använder den
  // för att kompensera för WebView:ns laddningstid — måste därför spegla samma
  // ögonblick som Q-ritningen, inte mount.
  const startedAtRef = useRef(0);

  // ⚠ Starta HELA prisutdelningen först en TYDLIG BEAT efter att slutskärmen lagt
  // sig — inte vid mount. Två skäl:
  //  1) Q:t ritas av SparkleDrawQ mot wall-clock (Date.now()). Startade ritningen
  //     vid mount hann det tunga phase==='leaderboard'-arbetet (saveFinalGame,
  //     finalizePlayer, matchHighlights, RoundLeaderboard-mount) blocka JS-tråden,
  //     och Q:t tonade in redan ~70 % ritat.
  //  2) Även efter att blocket lagt sig fyrade fyrverkeriet nästan i landnings-
  //     ögonblicket — det kändes igång INNAN spelaren hunnit uppfatta att de nått
  //     slutskärmen ("still a little bit too early").
  // FinalCelebration monteras exakt när phase→'leaderboard' (samma commit som
  // slutskärmen), så en setTimeout härifrån mäter från "slutskärmen är uppe". En
  // setTimeout-callback kan dessutom inte köra medan tråden är blockerad → den
  // fyrar ALLTID efter det tunga arbetet + beaten, och Q:t ritas då från 0. Slöjan
  // är opak (Colors.background) från mount, så spelaren ser en ren mörk "resultat
  // laddas"-beat, inget läckage. Fallback:en garanterar att ingen fastnar bakom
  // slöjan. Justera CELEBRATION_START_DELAY_MS om beaten känns för kort/lång.
  // (Peter 2026-09-22.)
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    // Resolvera Reduce Motion HÄR, under beaten — så sekvens-effekten kan läsa
    // reduceMotionRef SYNKRONT och slippa await:a mitt i timingen. Den await:en
    // låg tidigare inuti sekvensen och sköt konfetti/pokal/mark-fade en variabel
    // stund EFTER att SparkleDrawQ:s wall-clock-ritning redan startat → de gled
    // ur synk med Q:ts avslut. Beaten är ~550 ms, gott om tid för kollen.
    const beat = setTimeout(() => {
      void (async () => {
        try {
          reduceMotionRef.current = await AccessibilityInfo.isReduceMotionEnabled();
        } catch {
          // full animation = säkert default
        }
        if (!cancelled) setReady(true);
      })();
    }, CELEBRATION_START_DELAY_MS);
    const fallback = setTimeout(() => {
      if (!cancelled) setReady(true);
    }, CELEBRATION_START_DELAY_MS + 1500);
    return () => {
      cancelled = true;
      clearTimeout(beat);
      clearTimeout(fallback);
    };
  }, []);

  const fireDone = useCallback(() => {
    if (doneFiredRef.current) return;
    doneFiredRef.current = true;
    onDone();
  }, [onDone]);

  // ── Celebration-fasen ──────────────────────────────────────────────────
  // Startar först när `ready` (post-settle, se ovan). Q-ritning, pokal, konfetti
  // och ljud ankras alla till detta ögonblick → de förblir i synk.
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    let anim: Animated.CompositeAnimation | null = null;
    let halo: Animated.CompositeAnimation | null = null;
    let confetti: ReturnType<typeof setTimeout> | null = null;
    let watchdog: ReturnType<typeof setTimeout> | null = null;
    let startRaf: number | null = null;

    // Reduce Motion är redan resolverad under beaten (se `ready`-effekten), så
    // vi läser den SYNKRONT här — ingen await mellan Q-ritningens start och
    // konfetti/pokal-schemat. Allt nedan ankras därmed till exakt samma
    // ögonblick som SparkleDrawQ:s draw-start och håller synk med Q:ts avslut.
    {
      const reduce = reduceMotionRef.current;
      const t = reduce ? REDUCED_TIMING : FULL_TIMING;
      timingRef.current = t;

      // Reduce Motion: ingen ritning och inga gnistor — Q:t står färdigt
      // från första framen och tonar bara in med resten av märket. Då
      // finns inget att sprakande ljudsätta heller. (Ljudet monteras i rAF:en
      // nedan så SparklerSound får samma post-jank startedAt som ritningen.)
      if (reduce) setSparkle(false);

      if (!reduce) {
        halo = Animated.sequence([
          // Glöden tänds i takt med ritningen och börjar pulsera först när
          // ringen slutits.
          Animated.delay(t.markIn),
          Animated.timing(haloOpacity, {
            toValue: 0.25,
            duration: Math.max(1, DRAW_MS - t.markIn),
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.loop(
            Animated.sequence([
              Animated.timing(haloOpacity, {
                toValue: 0.5,
                duration: 800,
                useNativeDriver: true,
              }),
              Animated.timing(haloOpacity, {
                toValue: 0.25,
                duration: 800,
                useNativeDriver: true,
              }),
            ]),
          ),
        ]);
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
        // ⚠ markIn OCH SparkleDrawQ:s ritning startar på SAMMA första rAF-frame
        // (se startRaf nedan resp. SparkleDrawQ). markIn löper t.markIn ms; sedan
        // väntar vi DRAW_MS − markIn så pokalen landar exakt vid draw-start +
        // DRAW_MS = Q:ts avslut. Utan avdraget landade pokalen markIn ms för sent.
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

      // ⚠ Starta HELA sekvensen (mark-fade, glöd, pokal, konfetti) på FÖRSTA
      // rAF-framen, inte synkront här. Celebrationens mount (SparkLayer:s ~100
      // skugg-tunga gnist-vyer + ljud-WebView) blockar JS-tråden ~1 s precis nu.
      // SparkleDrawQ ankrar sin ritning till SIN första rAF av samma skäl;
      // genom att ankra markIn + pokal + konfetti hit delar de EN post-jank-
      // anchor → elden ritar Q:t synligt 0→100 % och pokal/konfetti landar på
      // Q:ts avslut, i synk. startedAtRef speglar samma ögonblick (för ljudet).
      startRaf = requestAnimationFrame(() => {
        if (cancelled || !anim) return;
        startedAtRef.current = Date.now();
        // Ljud-WebView:n monteras HÄR (efter startedAtRef) så SparklerSound får
        // samma post-jank-anchor som ritningen och kan hoppa förbi sin egen
        // laddningstid via startedAt.
        if (!reduce && !muted) setPlaySound(true);
        halo?.start();
        anim.start(({ finished }) => {
          if (!finished || cancelled) return;
          halo?.stop();
          setStage('highlights');
        });
        if (!reduce) {
          // Konfettin fyras av när pennan når slutet av svansen — alltså i
          // samma ögonblick som pokalen landar.
          confetti = setTimeout(() => {
            if (!cancelled) setConfettiOn(true);
          }, Math.max(0, DRAW_MS - 60));
        }

        // Skyddsnät. Att bli kvar i 'celebration' betyder att spelaren är
        // INLÅST bakom slöjan — ingen summary, ingen "Go to Final leaderboard",
        // inga knappar som går att träffa. Skulle sekvensen mot förmodan inte
        // rapportera klart tar den här timern över. Schemaläggs HÄR (inte
        // synkront) så den mäter från sekvensens verkliga start — annars kunde
        // ett långt mount-block skjuta starten förbi marginalen och watchdogen
        // fyra i förtid. 900 ms åt pokalens fjädring (ingen fast duration) +
        // 1200 ms marginal.
        const total = (reduce ? t.markIn : DRAW_MS) + 900 + t.hold + t.settle + 1200;
        watchdog = setTimeout(() => {
          if (cancelled || stageRef.current !== 'celebration') return;
          anim?.stop();
          halo?.stop();
          markOpacity.setValue(WATERMARK_OPACITY);
          contentOpacity.setValue(1);
          contentScale.setValue(1);
          setStage('highlights');
        }, total);
      });
    }

    return () => {
      cancelled = true;
      if (startRaf != null) cancelAnimationFrame(startRaf);
      anim?.stop();
      halo?.stop();
      if (confetti) clearTimeout(confetti);
      if (watchdog) clearTimeout(watchdog);
    };
    // Startar när `ready` blir true (post-settle); sekvensen äger sin livscykel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

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
  // kortet stannar den där och väntar på "Go to Final leaderboard". Varje enhet ska
  // styra sin egen vy tills spelaren själv trycker — slutade den automatiskt
  // hamnade två enheter med samma antal kort och samma timing i mål nästan
  // exakt samtidigt, vilket såg ut som att hostens tapp kastade ut de andra.
  useEffect(() => {
    if (stage !== 'highlights' || userTookOver) return;
    if (highlights.length === 0) return;
    if (pageIndex >= highlights.length - 1) return;
    // Placeringskort får längre hålltid — de bär en hel lista, inte ett tal.
    const rowCount = highlights[pageIndex]?.rows?.length ?? 0;
    // HCP-kortet står tills myntsnurret landat, pulsen klingat ut och
    // resultatet hunnit läsas — annars bläddrar det mitt i avslöjandet.
    const hold = highlights[pageIndex]?.hcp || highlights[pageIndex]?.hcpList
      ? Math.max(timingRef.current.cardHold, HCP_CARD_HOLD_MS) *
        Math.max(1, Math.min(2, highlights[pageIndex]?.hcpList?.length ?? 1))
      : timingRef.current.cardHold + rowCount * RANK_ROW_HOLD_MS;
    const id = setTimeout(() => {
      const next = pageIndex + 1;
      scrollRef.current?.scrollTo({
        x: next * PAGE_W,
        animated: !reduceMotionRef.current,
      });
      setPageIndex(next);
    }, hold);
    return () => clearTimeout(id);
  }, [stage, pageIndex, userTookOver, highlights]);

  // Puls på "Go to Final leaderboard". Scale 1 ↔ 1.04 över 700 ms — samma
  // cadens som useCtaPulse i RoundLeaderboard och Home:s gameBtn, så alla
  // CTA:er på slutskärmen andas i takt. Lokal kopia i stället för import:
  // FinalCelebration ska inte dra in hela RoundLeaderboard-modulen för en
  // fyrradig loop. Stoppas under uttoningen — knappen är då redan tryckt.
  useEffect(() => {
    if (stage !== 'highlights') {
      leavePulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(leavePulse, {
          toValue: 1.04,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(leavePulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [stage, leavePulse]);

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

  // Även utan kort ska blocket visas — "Go to Final leaderboard" är enda vägen ut.
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

      {confettiOn && <Confetti active avoidTop={MARK_TOP} avoidHalfWidth={RING_OUTER_HALF + 24} />}

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
          // translateY centrerar det SYNLIGA märket (ring → ordmärke).
          { opacity: markOpacity, transform: [{ translateY: LOCKUP_SHIFT }, { scale: markScale }] },
        ]}
        pointerEvents="none"
      >
        {/* Symbolen i egen Q_SIZE-ruta så glöd, skiva och pokal centreras på
            RINGENS mitt — inte på hela kolumnen (ring + ordmärke). */}
        <View style={styles.qBox}>
          <Animated.View
            style={[styles.halo, { opacity: stage === 'celebration' ? haloOpacity : 0 }]}
          />
          {/* Mörk skiva i ringhålet: ger guldpokalen kontrast mot glöden. */}
          <View style={styles.trophyDisc} />
          <SparkleDrawQ size={Q_SIZE} active={ready} sparkle={sparkle} compact={COMPACT} />
          <Animated.View
            style={[
              styles.trophy,
              { opacity: contentOpacity, transform: [{ scale: contentScale }] },
            ]}
          >
            <Text style={styles.trophyGlyph} allowFontScaling={false}>
              {FINAL_LEADERBOARD_TROPHY}
            </Text>
          </Animated.View>
        </View>
        <Animated.View
          style={[
            styles.brand,
            { opacity: contentOpacity, transform: [{ scale: contentScale }] },
          ]}
        >
          <QuizVibeWordmarkSvg width={WORDMARK_W} variant="metallic" />
        </Animated.View>
      </Animated.View>

      {showHighlights && (
        <Animated.View style={[styles.sliderBlock, { opacity: blockOpacity }]}>
          {/* Sekvensens egen rubrik — den tillhör overlayen och försvinner
              därför tillsammans med korten när spelaren trycker "Leave
              summary". Slutskärmens egen "Final Leaderboard"-rubrik tar då
              över. */}
          <Text
            style={[
              styles.summaryHeading,
              !!heading && styles.summaryHeadingNotice,
              !!playerName && styles.summaryHeadingWithName,
            ]}
          >
            {heading ?? 'Game Summary'}
          </Text>
          {playerName ? (
            <Text style={styles.summaryPlayerName} numberOfLines={1}>
              {playerName}
            </Text>
          ) : null}

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
              {highlights.map((card, cardIndex) => (
                <View key={card.id} style={styles.page}>
                  <View style={styles.card}>
                    <Text style={[styles.cardTitle, styles.cardTitleSolo]}>
                      {card.title}
                    </Text>
                    {card.hcpList ? (
                      /* Hybrid 1 by 1 host: one HCP progression per player
                         who played on this phone, in ONE taller card that
                         scrolls vertically when they don't all fit. */
                      <ScrollView
                        style={styles.hcpListScroll}
                        contentContainerStyle={styles.hcpListContent}
                        nestedScrollEnabled
                        showsVerticalScrollIndicator
                      >
                        {card.hcpList.map((h) => (
                          <View key={h.playerId} style={styles.hcpListItem}>
                            <Text style={styles.hcpListName} numberOfLines={1}>
                              {h.name}
                            </Text>
                            <HcpProgressSummary
                              before={h.before}
                              after={h.after}
                              active={stage === 'highlights' && pageIndex === cardIndex}
                            />
                          </View>
                        ))}
                      </ScrollView>
                    ) : card.hcp ? (
                      <HcpProgressSummary
                        before={card.hcp.before}
                        after={card.hcp.after}
                        active={stage === 'highlights' && pageIndex === cardIndex}
                      />
                    ) : card.performance ? (
                      /* Game Performance: rätt svar primärt, snittiden
                         sekundär — samma kort, inte två. */
                      <View style={styles.perfBlock}>
                        <Text style={styles.perfPrimary}>
                          {card.performance.correct} / {card.performance.total}
                        </Text>
                        <Text style={styles.perfLabel}>Correct Answers</Text>
                        <View style={styles.perfDivider} />
                        <Text style={styles.perfSecondary}>
                          {card.performance.avgSeconds === null
                            ? '—'
                            : `${card.performance.avgSeconds.toFixed(2)}s`}
                        </Text>
                        <Text style={styles.perfLabel}>Average Lock-in Time</Text>
                      </View>
                    ) : card.rows ? (
                      /* Top Game Performance — bara de som delar högsta
                         antalet rätt, sorterade på snittid (lägst vinner). */
                      <ScrollView
                        style={styles.rankList}
                        contentContainerStyle={styles.rankListContent}
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={false}
                      >
                        {card.rows.map((row) => (
                          <View key={row.playerId} style={styles.rankRow}>
                            <Text
                              style={[styles.rankPlace, row.place === 1 && styles.rankPlaceTop]}
                            >
                              {`${row.place}.`}
                            </Text>
                            {row.emoji ? (
                              <Text style={styles.rankEmoji}>{row.emoji}</Text>
                            ) : null}
                            <Text style={styles.rankName} numberOfLines={1}>
                              {row.name}
                            </Text>
                            <Text style={styles.rankValue}>{row.value}</Text>
                            {row.fastest ? (
                              <PulsingFastestTime text={row.secondary} />
                            ) : (
                              <Text style={styles.rankSecondary}>{row.secondary}</Text>
                            )}
                          </View>
                        ))}
                      </ScrollView>
                    ) : null}
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
          <Animated.View style={{ transform: [{ scale: leavePulse }] }}>
            <Pressable
              onPress={handleLeave}
              style={({ pressed }) => [styles.leaveBtn, pressed && { opacity: 0.7 }]}
              hitSlop={10}
            >
              <Text style={styles.leaveText}>Go to Final leaderboard</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // ⚠ Explicit position:absolute + top/left/right/bottom, INTE
  // `...StyleSheet.absoluteFillObject`-spread. På nya arkitekturen (dev-build)
  // applicerades spreaden inte som absolut → overlayn hamnade i normalt flöde
  // och tryckte ner Final Leaderboards footer/innehåll. Explicit form matchar
  // de absoluta element som fungerar (halo m.fl.).
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 80,
    elevation: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  veil: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    opacity: 0.97,
  },
  // Speglar bgFinalWrap i RoundLeaderboard.tsx.
  markWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Guldglöd bakom märket under celebration-fasen. iOS-skugga; Android får
  // den mjuka fyllningen (elevation ger ingen färgad glow på RN).
  qBox: {
    width: Q_SIZE,
    height: Q_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: Q_SIZE * RING_OUTER_FRACTION,
    height: Q_SIZE * RING_OUTER_FRACTION,
    borderRadius: Q_SIZE,
    backgroundColor: Colors.warning,
    shadowColor: Colors.warning,
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  trophyDisc: {
    position: 'absolute',
    width: Q_SIZE * RING_HOLE_FRACTION + 2,
    height: Q_SIZE * RING_HOLE_FRACTION + 2,
    borderRadius: Q_SIZE,
    backgroundColor: Colors.background,
  },
  // Pokalen centrerad i ringhålet.
  trophy: {
    position: 'absolute',
  },
  trophyGlyph: {
    fontSize: TROPHY_FONT,
    lineHeight: Math.round(TROPHY_FONT * 1.18),
    textAlign: 'center',
  },
  // Ordmärket tätt under ringen — se WORDMARK_MARGIN_TOP.
  brand: {
    marginTop: WORDMARK_MARGIN_TOP,
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
  // Längre text (H2H, först i mål) — något mindre och med sidoluft.
  summaryHeadingNotice: {
    fontSize: COMPACT ? 18 : 22,
    paddingHorizontal: Spacing.lg,
  },
  // Med spelarnamn under: rubriken släpper sin luft till namnraden.
  summaryHeadingWithName: {
    marginBottom: 2,
  },
  summaryPlayerName: {
    fontSize: COMPACT ? FontSize.md : FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
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
    // Tjock kant i SOLID guld (Peter 2026-08-25) — kortet ska läsas som ett
    // eget lager ovanpå slöjan, inte som en svag ruta. `Colors.warningBorder`
    // är guld på 25 % opacitet och blev grådaskigt vid 3 px; det är
    // `Colors.warning` som är brand-guldet, samma ton som märket och
    // "Go to Final leaderboard"-knappen.
    borderWidth: 3,
    borderColor: Colors.warning,
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
  cardTitle: {
    ...Typography.overline,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  // Solospelets två kort (HCP Progress / Game Performance): ~36 % större
  // rubrik, identisk på båda. Multiplayer-korten behåller cardTitle.
  cardTitleSolo: {
    fontSize: 15,
    letterSpacing: 1,
  },
  // ── Hybrid 1 by 1: stacked HCP progressions on the host ───────────────
  hcpListScroll: {
    alignSelf: 'stretch',
    maxHeight: HCP_LIST_MAX_H,
    flexGrow: 0,
  },
  hcpListContent: {
    gap: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  hcpListItem: {
    alignItems: 'center',
  },
  hcpListName: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  // ── Placeringslista — ALLA korttyper som namnger spelare ──────────────
  rankList: {
    alignSelf: 'stretch',
    maxHeight: RANK_LIST_MAX_H,
    marginTop: Spacing.xs,
    // flexGrow: 0 så listan tar sitt innehålls höjd i stället för att
    // sträcka ut kortet när det är få spelare.
    flexGrow: 0,
  },
  rankListContent: {
    gap: COMPACT ? 4 : 6,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rankPlace: {
    width: 22,
    textAlign: 'right',
    fontSize: COMPACT ? FontSize.sm : FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  // Delad förstaplats syns genom att guld-siffran "1" upprepas på flera
  // rader — detail-raden under förklarar regeln.
  rankPlaceTop: {
    color: Colors.warning,
  },
  rankEmoji: {
    fontSize: COMPACT ? 16 : 18,
    lineHeight: COMPACT ? 20 : 22,
  },
  rankName: {
    flex: 1,
    fontSize: COMPACT ? FontSize.sm : FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  rankValue: {
    fontSize: COMPACT ? FontSize.md : FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.warning,
    fontVariant: ['tabular-nums'],
  },
  // Top Game Performance: snittiden — sekundär, grå.
  // Snabbaste tiden vid lika antal rätt — avgör vinnaren.
  rankSecondaryFastest: {
    color: Colors.warning,
    fontWeight: FontWeight.bold,
  },
  rankSecondary: {
    minWidth: 58,
    textAlign: 'right',
    fontSize: COMPACT ? FontSize.sm : FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  // ── Game Performance (solospel) ──────────────────────────────────────
  perfBlock: {
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  perfPrimary: {
    fontSize: COMPACT ? 40 : 48,
    fontWeight: FontWeight.bold,
    color: Colors.warning,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  perfLabel: {
    ...Typography.caption,
    fontSize: FontSize.sm,
    lineHeight: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  perfDivider: {
    width: 48,
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: COMPACT ? Spacing.sm : Spacing.md,
  },
  perfSecondary: {
    fontSize: COMPACT ? FontSize.xl : 26,
    fontWeight: FontWeight.semibold,
    color: Colors.warning,
    fontVariant: ['tabular-nums'],
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
  // Gold fyllning med SVART text (Peter 2026-08-25) — appens vokabulär för
  // en aktiv, upplåst CTA (samma par som PREMIUM-badgen med prenumeration
  // och Home:s "Start New Game"). Pulserar via leavePulse; grå-med-vitt var
  // fel signal för enda vägen vidare.
  leaveBtn: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.warning,
  },
  leaveText: {
    ...Typography.label,
    fontWeight: FontWeight.bold,
    color: '#000',
  },
});

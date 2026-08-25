import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors } from '../theme';

/**
 * Q-märket i prisutdelnings-sekvensen — RITAS fram som ett tomtebloss i
 * stället för att poppa in färdigt.
 *
 * Tre lager:
 *   1. Gnistor (vanliga Animated.View:s) — den brinnande spetsen i
 *      ritpunkten plus skurar som sprutar ut där den passerar.
 *   2. Q:t självt: ring + svans, ritade som en växande båge.
 *   3. En bredare, halvgenomskinlig kopia under som flimrar — den ger
 *      sprak-känslan. Huvudstrecket blinkar MEDVETET aldrig; det är
 *      märket som ska stå kvar.
 *
 * ── ⚠ INGA animerade SVG-props. Det är ett medvetet val ─────────────────
 * Första versionen ritade med `strokeDashoffset` bunden till en
 * Animated.Value (JS-drivaren — dash finns inte i native-drivarens
 * vitlista). Det LÅSTE skärmen: rit-animationen rapporterade aldrig klart,
 * så sekvensen i FinalCelebration stannade i 'celebration' och varken
 * pokal, summary-kort eller "Leave summary" dök upp. Spelaren blev
 * inlåst bakom en touch-blockerande slöja.
 *
 * Nu ritas bågen i stället om från vanlig React-state (rAF-loop), och
 * gnistorna går på native-drivaren precis som konfettin. Ingen
 * Animated.Value rör en SVG-prop, och ingen del av sekvensen väntar på
 * ett callback som kan utebli. Gå INTE tillbaka till dash-animation.
 *
 * ── Geometrin är låst mot RoundLeaderboards vattenstämpel ───────────────
 * viewBox, cx/cy/r och svansen speglar bgFinal*-märket i
 * RoundLeaderboard.tsx exakt, så sluttillståndet är pixelidentiskt med
 * stämpeln som ligger kvar när overlayen tonat bort.
 */

// SVG-koordinater (samma som QuizVibeLogo / RoundLeaderboards stämpel).
const VB_X = 19;
const VB_SIZE = 36;
const CX = 37;
const CY = 37;
const R = 13;
const TAIL_FROM = 46;
const TAIL_TO = 52;

/** Hur stor del av ritningen som är ringen; resten är svansen. */
const CIRCLE_END = 0.78;

/** Total rit-tid. Exporteras så parenten kan sekvensera mot den. */
export const DRAW_MS = 1150;

interface Spark {
  key: string;
  /** Mittpunkt i px inom size×size-boxen. */
  x: number;
  y: number;
  /** Utkastriktning i grader. */
  dir: number;
  /** Progress-värde när gnistan tänds. */
  trigger: number;
  /** Gnistans livslängd i progress-enheter (0-1). */
  life: number;
  /** Hur långt den flyger, px. */
  dist: number;
  /** Fall i px innan den slocknar — mätt i VÄRLDENS y, inte gnistans. */
  gravity: number;
  size: number;
  color: string;
}

// Tomtebloss brinner vitglödgat i kärnan och gulnar utåt. Vitt dominerar
// med flit — rent guld läser som konfetti, inte som gnistor.
const SPARK_COLORS = [
  '#FFFFFF',
  '#FFFFFF',
  '#FFF3D6',
  '#FFD98A',
  Colors.warning,
  '#FFB33C',
];

function pickColor(): string {
  return SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];
}

/**
 * En gnistskur från EN punkt. Det är burst:en som gör tomtebloss-känslan:
 * enstaka gnistor per punkt läser som glitter, en spray i alla riktningar
 * läser som något som brinner.
 */
function emitBurst(
  out: Spark[],
  keyPrefix: string,
  x: number,
  y: number,
  baseDir: number,
  trigger: number,
  count: number,
  compact: boolean,
) {
  for (let j = 0; j < count; j += 1) {
    // ±90° kring den utåtriktade normalen — nästan omni, men fortfarande
    // med tyngdpunkt bort från strecket.
    const dir = baseDir + (Math.random() - 0.5) * 180;
    // Var sjätte gnista är en "långskytt" som far iväg dubbelt så långt.
    // Det är de som ger blosset dess spretiga siluett.
    const long = Math.random() < 0.17;
    const reach = (compact ? 22 : 30) + Math.random() * (compact ? 26 : 44);
    out.push({
      key: `${keyPrefix}-${j}`,
      x,
      y,
      dir,
      trigger,
      life: 0.1 + Math.random() * 0.12 + (long ? 0.06 : 0),
      dist: long ? reach * 2.1 : reach,
      gravity: (compact ? 10 : 16) + Math.random() * (compact ? 12 : 20),
      size: (long ? 1.6 : 2.2) + Math.random() * 3,
      color: pickColor(),
    });
  }
}

function buildSparks(size: number, compact: boolean): Spark[] {
  const scale = size / VB_SIZE;
  const rPx = R * scale;
  const centerPx = size / 2;
  const sparks: Spark[] = [];
  const perBurst = compact ? 3 : 4;

  // Runt ringen: en skur per varv-position, tänd när pennan passerar.
  const ringCount = compact ? 12 : 20;
  for (let i = 0; i < ringCount; i += 1) {
    // Jämnt fördelat plus lite slump så skurarna inte känns metronomiska.
    const deg = (360 / ringCount) * i + (Math.random() - 0.5) * 10;
    const rad = (deg * Math.PI) / 180;
    emitBurst(
      sparks,
      `ring-${i}`,
      centerPx + Math.cos(rad) * rPx,
      centerPx + Math.sin(rad) * rPx,
      deg, // radiellt utåt
      (CIRCLE_END * (((deg % 360) + 360) % 360)) / 360,
      perBurst,
      compact,
    );
  }

  // Längs svansen: färre punkter, men samma skur — avslutet ska knäppa till.
  const tailCount = compact ? 4 : 6;
  for (let i = 0; i < tailCount; i += 1) {
    const f = i / Math.max(1, tailCount - 1);
    const svgPos = TAIL_FROM + (TAIL_TO - TAIL_FROM) * f;
    const px = ((svgPos - VB_X) / VB_SIZE) * size;
    emitBurst(
      sparks,
      `tail-${i}`,
      px,
      px,
      45, // svansen pekar ned-höger; skuren spretar kring den
      CIRCLE_END + (1 - CIRCLE_END) * f,
      perBurst,
      compact,
    );
  }

  return sparks;
}

/**
 * Gnistor lyser inte jämnt — de knastrar. Stoppen är andelar av gnistans
 * livslängd; värdena är opacitet. Delas av alla gnistor (en modulnivå-
 * konstant i stället för N slumpade ramper) så interpolationen blir billig.
 */
const FLICKER_AT = [0, 0.1, 0.24, 0.38, 0.54, 0.72, 1];
const FLICKER_TO = [1, 0.4, 1, 0.5, 0.92, 0.3, 0];

/**
 * Flimret i själva spetsen — den brinner, den lyser inte jämnt. Bygger en
 * sågtandad ramp mellan `from` och `to` som slocknar i båda ändarna, så
 * spetsen kan tändas när ritningen börjar och släckas när den är framme.
 */
function buildTipFlicker(from: number, to: number, ticks: number) {
  const input: number[] = [from - 0.015, from];
  const output: number[] = [0, 1];
  for (let i = 1; i <= ticks; i += 1) {
    input.push(from + ((to - from) * i) / ticks);
    output.push(i % 2 === 0 ? 1 : 0.62);
  }
  input.push(to + 0.015);
  output.push(0);
  return { input, output };
}

const tipScaleFrom = (v: number) => (v === 0 ? 0.6 : v === 1 ? 1.25 : 0.9);

/**
 * Den brinnande spetsen: vitglödgad kärna i en mjuk guldgård. Gården är en
 * egen vy och inte bara en shadow — Android renderar ingen färgad
 * shadow-glöd, så utan den blir spetsen bara en vit prick där.
 */
function Tip({ size }: { size: number }) {
  const glow = size * 2.8;
  return (
    <>
      <View
        style={[
          styles.tipGlow,
          {
            width: glow,
            height: glow,
            borderRadius: glow / 2,
            left: (size - glow) / 2,
            top: (size - glow) / 2,
          },
        ]}
      />
      <View
        style={[styles.tipCore, { width: size, height: size, borderRadius: size / 2 }]}
      />
    </>
  );
}

interface SparkLayerProps {
  size: number;
  compact: boolean;
  /** 0-1 på native-drivaren, samma bana som bågens rit-progress. */
  progress: Animated.Value;
}

/**
 * Gnistlagret. Memoiserat med flit: bågen ovanför ritas om varje frame
 * från React-state, och utan memo hade ~104 gnistvyer byggts om lika ofta.
 * Alla props är stabila referenser, så det här renderas exakt en gång.
 */
const SparkLayer = React.memo(function SparkLayer({
  size,
  compact,
  progress,
}: SparkLayerProps) {
  const scale = size / VB_SIZE;
  const rPx = R * scale;
  const centerPx = size / 2;
  const sparks = useMemo(() => buildSparks(size, compact), [size, compact]);

  const ringFlicker = buildTipFlicker(0.02, CIRCLE_END - 0.02, 26);
  const tailFlicker = buildTipFlicker(CIRCLE_END, 0.98, 8);

  const headRotate = progress.interpolate({
    inputRange: [0, CIRCLE_END],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'clamp',
  });
  const headOpacity = progress.interpolate({
    inputRange: ringFlicker.input,
    outputRange: ringFlicker.output,
    extrapolate: 'clamp',
  });
  // Spetsen andas i takt med flimret — en gnista som bara skiftar opacitet
  // ser dimmad ut, en som också pulsar i storlek ser ut att brinna.
  const headScale = progress.interpolate({
    inputRange: ringFlicker.input,
    outputRange: ringFlicker.output.map(tipScaleFrom),
    extrapolate: 'clamp',
  });

  const tailTravel = progress.interpolate({
    inputRange: [CIRCLE_END, 1],
    outputRange: [0, (TAIL_TO - TAIL_FROM) * scale],
    extrapolate: 'clamp',
  });
  const tailHeadOpacity = progress.interpolate({
    inputRange: tailFlicker.input,
    outputRange: tailFlicker.output,
    extrapolate: 'clamp',
  });
  const tailHeadScale = progress.interpolate({
    inputRange: tailFlicker.input,
    outputRange: tailFlicker.output.map(tipScaleFrom),
    extrapolate: 'clamp',
  });

  const headSize = compact ? 11 : 15;
  const tailStart = ((TAIL_FROM - VB_X) / VB_SIZE) * size;

  return (
    <>
      {/* Ritpunkten på ringen. Rotationen sitter på en absoluteFill-box vars
          mitt ÄR ringens mitt — därför sveper spetsen exakt på strecket.
          Skala får INTE ligga här: den skulle skala boxen kring ringmitten
          och alltså ändra radien. */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { transform: [{ rotate: headRotate }] }]}
      >
        <Animated.View
          style={{
            position: 'absolute',
            width: headSize,
            height: headSize,
            left: centerPx + rPx - headSize / 2,
            top: centerPx - headSize / 2,
            opacity: headOpacity,
            transform: [{ scale: headScale }],
          }}
        >
          <Tip size={headSize} />
        </Animated.View>
      </Animated.View>

      {/* Ritpunkten på svansen. */}
      <Animated.View
        style={{
          position: 'absolute',
          width: headSize,
          height: headSize,
          left: tailStart - headSize / 2,
          top: tailStart - headSize / 2,
          opacity: tailHeadOpacity,
          transform: [
            { translateX: tailTravel },
            { translateY: tailTravel },
            { scale: tailHeadScale },
          ],
        }}
      >
        <Tip size={headSize} />
      </Animated.View>

      {sparks.map((s) => {
        // Fönstret gnistan lever i. Klampas in i (0,1) så interpolationens
        // inputRange alltid är strikt växande.
        const t0 = Math.min(0.96, Math.max(0.02, s.trigger));
        const t1 = Math.min(0.985, t0 + s.life);
        const span = t1 - t0;

        const opacity = progress.interpolate({
          inputRange: [0, ...FLICKER_AT.map((f) => t0 + span * f), 1],
          outputRange: [0, ...FLICKER_TO, 0],
          extrapolate: 'clamp',
        });
        // Kastet bromsar in: 65 % av vägen på första tredjedelen.
        const travel = progress.interpolate({
          inputRange: [0, t0, t0 + span * 0.35, t1, 1],
          outputRange: [0, 0, s.dist * 0.65, s.dist, s.dist],
          extrapolate: 'clamp',
        });
        const fall = progress.interpolate({
          inputRange: [0, t0, t0 + span * 0.5, t1, 1],
          outputRange: [0, 0, s.gravity * 0.25, s.gravity, s.gravity],
          extrapolate: 'clamp',
        });
        const shrink = progress.interpolate({
          inputRange: [0, t0, t1, 1],
          outputRange: [1, 1, 0.25, 0.25],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={s.key}
            style={[
              styles.spark,
              {
                left: s.x - s.size / 2,
                top: s.y - s.size / 2,
                width: s.size,
                height: s.size,
                borderRadius: s.size / 2,
                backgroundColor: s.color,
                shadowColor: s.color,
                opacity,
                // ⚠ ORDNINGEN BÄR HELA BANAN. `fall` ligger FÖRE rotationen
                // och verkar därför i förälderns (världens) koordinater =
                // rakt nedåt. `travel` ligger EFTER och verkar i det
                // roterade systemet = rakt utåt i s.dir. Flyttas fall efter
                // rotate faller gnistorna åt varsitt håll i stället för mot
                // marken.
                transform: [
                  { translateY: fall },
                  { rotate: `${s.dir}deg` },
                  { translateX: travel },
                  { scale: shrink },
                ],
              },
            ]}
          />
        );
      })}
    </>
  );
});

/** Växande båge från klockan 3 och medurs. */
function arcPath(deg: number): string {
  const rad = (deg * Math.PI) / 180;
  const x = CX + R * Math.cos(rad);
  const y = CY + R * Math.sin(rad);
  return `M${CX + R} ${CY} A${R} ${R} 0 ${deg > 180 ? 1 : 0} 1 ${x.toFixed(3)} ${y.toFixed(3)}`;
}

const TAIL_D = `M${TAIL_FROM} ${TAIL_FROM} L${TAIL_TO} ${TAIL_TO}`;

/**
 * Glödlagrets flimmer. En sågtand som fasas ut mot slutet — ⚠ den MÅSTE
 * landa på 0 vid progress 1, för då byter komponenten till det statiska
 * märket som inte har något glödlager alls. Slutar flimret på ett värde
 * > 0 syns bytet som en knäpp.
 */
function glowAt(p: number): number {
  if (p >= 1) return 0;
  const flicker = 0.5 + 0.5 * Math.sin(p * 46);
  const fade = p > 0.85 ? (1 - p) / 0.15 : 1;
  return (0.14 + 0.42 * flicker) * fade;
}

interface SparkleDrawQProps {
  size: number;
  /** Startar ritningen när den blir true. */
  active: boolean;
  /** false (Reduce Motion) → märket står färdigt direkt, inga gnistor. */
  sparkle: boolean;
  compact?: boolean;
}

export default function SparkleDrawQ({
  size,
  active,
  sparkle,
  compact = false,
}: SparkleDrawQProps) {
  const [progress, setProgress] = useState(0);
  const sparkProgress = useRef(new Animated.Value(0)).current;
  const ease = useMemo(() => Easing.inOut(Easing.quad), []);

  useEffect(() => {
    if (!active) return;
    if (!sparkle) {
      // Reduce Motion: hoppa direkt till färdigt märke.
      setProgress(1);
      sparkProgress.setValue(1);
      return;
    }

    let raf = 0;
    const startedAt = Date.now();

    // Gnistorna går på native-drivaren (som konfettin) med samma duration
    // och easing som bågen nedan — samma bana, olika mekanism.
    sparkProgress.setValue(0);
    const anim = Animated.timing(sparkProgress, {
      toValue: 1,
      duration: DRAW_MS,
      easing: ease,
      useNativeDriver: true,
    });
    anim.start();

    const step = () => {
      const t = Math.min(1, (Date.now() - startedAt) / DRAW_MS);
      setProgress(ease(t));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      anim.stop();
    };
  }, [active, sparkle, ease, sparkProgress]);

  const done = progress >= 1;

  // Färdigt märke: pixelidentiskt med RoundLeaderboards vattenstämpel — och
  // med sista framen av ritningen, så bytet inte syns. Här försvinner
  // samtidigt hela gnistlagret (~104 vyer) inför hållet + kort-sekvensen.
  if (done) {
    return (
      <View style={{ width: size, height: size }} pointerEvents="none">
        <Svg width={size} height={size} viewBox="19 19 36 36">
          <Circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={Colors.warning}
            strokeWidth={3}
          />
          <Path d={TAIL_D} stroke={Colors.warning} strokeWidth={3} strokeLinecap="round" />
        </Svg>
      </View>
    );
  }

  const circleT = Math.min(1, progress / CIRCLE_END);
  const tailT = progress <= CIRCLE_END ? 0 : (progress - CIRCLE_END) / (1 - CIRCLE_END);
  const deg = 360 * circleT;
  // En båge vars ändpunkter sammanfaller ritas inte alls enligt SVG-specen,
  // så sista graderna renderas som en hel cirkel i stället.
  const fullRing = deg >= 359.5;
  const ringD = deg > 0.5 ? arcPath(Math.min(deg, 359.4)) : null;
  const tailD =
    tailT > 0
      ? `M${TAIL_FROM} ${TAIL_FROM} L${(TAIL_FROM + (TAIL_TO - TAIL_FROM) * tailT).toFixed(3)} ${(TAIL_FROM + (TAIL_TO - TAIL_FROM) * tailT).toFixed(3)}`
      : null;
  const glow = glowAt(progress);

  return (
    <View style={{ width: size, height: size }} pointerEvents="none">
      <Svg width={size} height={size} viewBox="19 19 36 36">
        {/* Glödlager: bredare streck, låg opacitet, samma bana. */}
        {fullRing ? (
          <Circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={Colors.warning}
            strokeWidth={8}
            strokeOpacity={glow}
          />
        ) : ringD ? (
          <Path
            d={ringD}
            fill="none"
            stroke={Colors.warning}
            strokeWidth={8}
            strokeLinecap="round"
            strokeOpacity={glow}
          />
        ) : null}
        {tailD && (
          <Path
            d={tailD}
            stroke={Colors.warning}
            strokeWidth={8}
            strokeLinecap="round"
            strokeOpacity={glow}
          />
        )}

        {/* Själva märket. */}
        {fullRing ? (
          <Circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={Colors.warning}
            strokeWidth={3}
          />
        ) : ringD ? (
          <Path
            d={ringD}
            fill="none"
            stroke={Colors.warning}
            strokeWidth={3}
            strokeLinecap="round"
          />
        ) : null}
        {tailD && (
          <Path d={tailD} stroke={Colors.warning} strokeWidth={3} strokeLinecap="round" />
        )}
      </Svg>

      {sparkle && <SparkLayer size={size} compact={compact} progress={sparkProgress} />}
    </View>
  );
}

const styles = StyleSheet.create({
  tipGlow: {
    position: 'absolute',
    backgroundColor: Colors.warning,
    opacity: 0.45,
  },
  tipCore: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFE9B0',
    shadowOpacity: 1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  spark: {
    position: 'absolute',
    shadowOpacity: 1,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 0 },
  },
});

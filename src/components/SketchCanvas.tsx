// SketchCanvas — "penslas fram"-rendering för line-art-bildfrågor, maskad inne i
// QuizVibe-Q:t.
//
// Modell (spec 2026-05-29): Q:ts innercirkel börjar MÖRK (dark mode). Flera pennslar
// sveper och "suddar bort" mörkret → den KOMPLETTA line art-webp:en framträder mer
// och mer mot VIT bakgrund, region för region. Som mosaik-reveal:en (ProgressiveCover)
// fast med pensel-drag för bättre konstnärs-känsla.
//
// Varför raster (webp) och inte vektor: den täta line art:en (afro-lockar m.m.) går
// inte att vektorisera till rena ritbara streck utan att antingen tappa detaljen
// (gles) eller spränga bundlen (1250 streck/244 KB). Raster-reveal visar den exakta
// kompletta webp:en + skalar (~40 KB/sketch). Vi offrar "äkta per-streck-A→B" mot
// completeness + skalbarhet (Peters prioritet 2026-05-29).
//
// Asset = SVART line art på VIT botten (deterministisk edges → äkta likhet). Webp:en
// maskas in i Q:ts inre cirkel; mörk bg lyser igenom utanför; Q-ring + svans ovanpå.
// Penslandet körs på egen tidslinje (fraction × totalSeconds) och fortsätter till
// 100 % oavsett när spelaren låser sitt svar.

import { Colors } from '@/src/theme';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, ImageSourcePropType, StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  Image as SvgImage,
  Line,
  Mask,
  Path,
  Rect,
} from 'react-native-svg';

type AssistanceLevel = 'minimal' | 'standard' | 'full';

const ASSISTANCE_DRAW_FRACTION: Record<AssistanceLevel, number> = {
  full: 0.25,
  standard: 0.5,
  minimal: 0.75,
};

// --- Q-geometri (0–100 viewBox) -----------------------------------------------
const QX = 50;
const QY = 47;
const QR = 40;
const RING_W = (QR * 3) / 13;
const DISC_R = QR - RING_W / 2;
const TAIL_X1 = QX + 0.69 * QR;
const TAIL_Y1 = QY + 0.69 * QR;
const TAIL_X2 = QX + 1.12 * QR;
const TAIL_Y2 = QY + 1.12 * QR;
const IMG_X = QX - QR;
const IMG_Y = QY - QR;
const IMG_SIZE = QR * 2;

// Mörk botten i Q:t innan penslandet (dark mode som suddas bort).
const DARK = Colors.background;
// Flera penslar = flera samtidiga horisontella band → konstnärligt skissande.
const BRUSH_COUNT = 5;
// Pensel-bredd (viewBox-enheter): bred mjuk pensel-känsla. Klart > radavstånd →
// kraftig överlappning → garanterat inga gap kvar vid slutet (full reveal).
const BRUSH_W = 8;
const ROW_STEP = 2.8;

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Bygg BRUSH_COUNT pensel-banor: diskens höjd delas i band, varje band fylls med
// en boustrophedon (fram-och-tillbaka rader) = ett pensel-drag som sveper bandet.
// Varje band-path är EN sammanhängande subpath → strokeDashoffset ritar den
// tillförlitligt A→B (ingen multi-subpath-osäkerhet).
function buildBrushes(): { d: string; length: number }[] {
  const top = QY - DISC_R;
  const bottom = QY + DISC_R;
  const left = QX - DISC_R;
  const right = QX + DISC_R;
  const bandH = (bottom - top) / BRUSH_COUNT;
  const amp = 1.5;
  const sampleStep = 3;
  const brushes: { d: string; length: number }[] = [];
  for (let k = 0; k < BRUSH_COUNT; k++) {
    const bTop = top + k * bandH;
    const bBot = bTop + bandH;
    const pts: [number, number][] = [];
    let row = 0;
    // Lite överlapp uppåt/nedåt (±BRUSH_W/2) så inga gap mellan banden vid slutet.
    for (let y = bTop - BRUSH_W / 2; y <= bBot + BRUSH_W / 2 + 0.001; y += ROW_STEP, row++) {
      const ltr = row % 2 === 0;
      const xs: number[] = [];
      // Sträck rader lite förbi disc-kanten (±BRUSH_W/2) så round-cap-penseln
      // täcker hela cirkelbredden ut till kanten (clippas av qWindow).
      for (let x = left - BRUSH_W / 2; x <= right + BRUSH_W / 2 + 0.001; x += sampleStep) xs.push(x);
      if (!ltr) xs.reverse();
      for (const x of xs) pts.push([x, y + amp * Math.sin((x / 7) * Math.PI)]);
    }
    let length = 0;
    for (let i = 1; i < pts.length; i++) {
      length += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    }
    const d =
      pts.length > 0
        ? `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)} ` +
          pts.slice(1).map((p) => `L${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ')
        : '';
    brushes.push({ d, length });
  }
  return brushes;
}

const BRUSHES = buildBrushes();

interface Props {
  /** SVART line art på VIT botten (getQuizSketch(id)) — den kompletta webp:en. */
  source: ImageSourcePropType;
  /** Ändras (typiskt questionIndex) → penslandet startar om från mörk botten. */
  resetKey: string | number;
  /** Answer Response Time i sekunder — sätter pensel-tempot. */
  totalSeconds: number;
  /** Spelarens assistance-nivå (default 'standard'). */
  assistance?: AssistanceLevel;
  /** När true: snap:a direkt till färdig (allt avslöjat) — standalone/demo. */
  isRevealed?: boolean;
}

export function SketchCanvas({
  source,
  resetKey,
  totalSeconds,
  assistance = 'standard',
  isRevealed = false,
}: Props) {
  // progress 0→1 driver alla penslars dashoffset (alla sveper samtidigt).
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    if (isRevealed) {
      progress.setValue(1);
      return;
    }
    const fraction = ASSISTANCE_DRAW_FRACTION[assistance] ?? 0.5;
    const drawMs = Math.max(900, totalSeconds * fraction * 1000);
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: drawMs,
      useNativeDriver: false, // SVG strokeDashoffset → JS-driver
    });
    anim.start();
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, assistance, totalSeconds, isRevealed]);

  const brushOffsets = useMemo(
    () =>
      BRUSHES.map((b) =>
        progress.interpolate({ inputRange: [0, 1], outputRange: [b.length, 0] }),
      ),
    [progress],
  );

  return (
    <View style={styles.canvas}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <Defs>
          <ClipPath id="qWindow">
            <Circle cx={QX} cy={QY} r={DISC_R} />
          </ClipPath>
          {/* Reveal-mask: svart = mörk botten kvar, vita pensel-drag = avslöjat. */}
          <Mask id="reveal">
            <Rect x="0" y="0" width="100" height="100" fill="black" />
            {BRUSHES.map((b, i) => (
              <AnimatedPath
                key={i}
                d={b.d}
                stroke="white"
                strokeWidth={BRUSH_W}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                strokeDasharray={`${b.length}`}
                strokeDashoffset={brushOffsets[i]}
              />
            ))}
          </Mask>
        </Defs>

        <G clipPath="url(#qWindow)">
          {/* Mörk botten (dark mode) — syns där penseln ännu inte svept. */}
          <Circle cx={QX} cy={QY} r={DISC_R} fill={DARK} />
          {/* Komplett line art-webp (vit botten + svarta linjer), avslöjad av
              pensel-masken → vit bakgrund + ritning framträder där penseln svept. */}
          <SvgImage
            href={source}
            x={IMG_X}
            y={IMG_Y}
            width={IMG_SIZE}
            height={IMG_SIZE}
            preserveAspectRatio="xMidYMid slice"
            mask="url(#reveal)"
          />
        </G>

        {/* Q-ring + svans ovanpå (brand-frame). */}
        <Circle cx={QX} cy={QY} r={QR} fill="none" stroke={Colors.primary} strokeWidth={RING_W} />
        <Line
          x1={TAIL_X1}
          y1={TAIL_Y1}
          x2={TAIL_X2}
          y2={TAIL_Y2}
          stroke={Colors.primary}
          strokeWidth={RING_W}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
});

// SketchCanvas — "developing drawing"-rendering för line-art-frågor, maskad inne
// i QuizVibe-Q:t, med en 3-FAS-reveal (faint silhuett → detalj → full skärpa).
//
// Arkitektur (spec 2026-05-28):
//   - Asset = SVART line art på VIT botten (deterministisk edges → ÄKTA likhet;
//     fal/canny driftar identiteten och används INTE som identitetskälla).
//   - Frontend maskar in skissen i Q:ts inre cirkel via SVG clipPath: VITT papper
//     + skiss INNANFÖR Q:t, app:ens mörka dark-mode-bg lyser igenom UTANFÖR.
//     Q-ring + svans ritas ovanpå i brand-färg.
//   - 3-fas-reveal via animerad bild-OPACITY över den vita disken:
//       Fas 1 (start):  låg opacity → bara de mörkaste konturerna (afro-silhuett)
//                       anas faint; fin detalj washas ut.
//       Fas 2 (midway): opacity upp → sekundära linjer + tröjnummer "injiceras".
//       Fas 3 (slut):   full opacity → 100 % skärpa.
//     Mörka linjer (bold konturer) överlever låg opacity bättre än ljusa (fin
//     detalj) → starkaste silhuetten avslöjas FÖRST, fin detalj SIST, naturligt
//     ur ETT enda flat asset (ingen lager-separation behövs).
//   - Körs på egen tidslinje (fraction × totalSeconds) och fortsätter till 100 %
//     OAVSETT när spelaren låser sitt svar (alla ser samma reveal-tempo).
//
// Allt sker i ett 0–100 viewBox-koordinatrum; Svg:n centreras i containern (meet)
// så Q-cirkeln sitter mitt i med mörka marginaler vänster/höger.

import { Colors } from '@/src/theme';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, ImageSourcePropType, StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  Image as SvgImage,
  Line,
} from 'react-native-svg';

type AssistanceLevel = 'minimal' | 'standard' | 'full';

// Andel av svarstiden som reveal:en pågår (mer assistance = snabbare full skärpa).
const ASSISTANCE_DRAW_FRACTION: Record<AssistanceLevel, number> = {
  full: 0.25,
  standard: 0.5,
  minimal: 0.75,
};

// --- Q-geometri (0–100 viewBox) -----------------------------------------------
const QX = 50;
const QY = 47; // lite ovanför mitten → plats för svansen
const QR = 40;
// Matcha appens Q-ring-tjocklek: QuizVibeLogo har r=13, strokeWidth=3 → ringen
// skalas till samma ratio (3/13) av radien så den ser likadan ut som överallt annars.
const RING_W = (QR * 3) / 13; // ≈ 9.2
const DISC_R = QR - RING_W / 2; // vita pappers-diskens radie (innanför ringen)
// Q-svans: speglar QuizVibeLogo (~0.69r → ~1.12r diagonalt nedåt-höger).
const TAIL_X1 = QX + 0.69 * QR;
const TAIL_Y1 = QY + 0.69 * QR;
const TAIL_X2 = QX + 1.12 * QR;
const TAIL_Y2 = QY + 1.12 * QR;
// Skiss-bilden täcker cirkelns bounding box.
const IMG_X = QX - QR;
const IMG_Y = QY - QR;
const IMG_SIZE = QR * 2;

const AnimatedImage = Animated.createAnimatedComponent(SvgImage);

interface Props {
  /** SVART line art på VIT botten (getQuizSketch(id)). */
  source: ImageSourcePropType;
  /** Ändras (typiskt questionIndex) → reveal:en startar om från tomt vitt papper. */
  resetKey: string | number;
  /** Answer Response Time i sekunder — sätter reveal-tempot. */
  totalSeconds: number;
  /** Spelarens assistance-nivå (default 'standard'). */
  assistance?: AssistanceLevel;
  /** När true: snap:a direkt till färdig (full skärpa) — standalone/demo. */
  isRevealed?: boolean;
}

export function SketchCanvas({
  source,
  resetKey,
  totalSeconds,
  assistance = 'standard',
  isRevealed = false,
}: Props) {
  // reveal: 0 = tomt vitt papper, 1 = full skärpa.
  const reveal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    reveal.setValue(0);
    if (isRevealed) {
      reveal.setValue(1);
      return;
    }
    const fraction = ASSISTANCE_DRAW_FRACTION[assistance] ?? 0.5;
    const total = Math.max(900, totalSeconds * fraction * 1000);
    const seg = total / 3;
    const hold = seg * 0.1; // kort paus mellan faserna → tydlig fas-känsla
    const anim = Animated.sequence([
      // Fas 1: faint silhuett (mörkaste konturer anas).
      Animated.timing(reveal, {
        toValue: 1 / 3,
        duration: seg,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false, // SVG-element-opacity → JS-driver
      }),
      Animated.delay(hold),
      // Fas 2: injicera sekundära linjer + tröjnummer.
      Animated.timing(reveal, {
        toValue: 2 / 3,
        duration: seg,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.delay(hold),
      // Fas 3: full skärpa.
      Animated.timing(reveal, {
        toValue: 1,
        duration: seg,
        easing: Easing.in(Easing.quad),
        useNativeDriver: false,
      }),
    ]);
    anim.start();
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, assistance, totalSeconds, isRevealed]);

  // reveal → bild-opacity. Icke-linjär: fas 1 hålls låg (bara bold-linjer anas),
  // fas 3 når full. Bold-first-tiering kommer av att mörka linjer syns vid låg
  // opacity medan ljusa fin-detaljer washas ut.
  const imageOpacity = useMemo(
    () =>
      reveal.interpolate({
        inputRange: [0, 1 / 3, 2 / 3, 1],
        outputRange: [0.0, 0.28, 0.6, 1.0],
      }),
    [reveal],
  );

  return (
    <View style={styles.canvas}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          {/* Q-fönstret: klipp allt till den inre cirkeln. */}
          <ClipPath id="qWindow">
            <Circle cx={QX} cy={QY} r={DISC_R} />
          </ClipPath>
        </Defs>

        {/* Allt nedan klipps till Q-cirkeln → inget syns utanför Q:t. */}
        <G clipPath="url(#qWindow)">
          {/* Tomt vitt papper (alltid synligt → blank canvas i Q:t). */}
          <Circle cx={QX} cy={QY} r={DISC_R} fill="#FFFFFF" />
          {/* Svart line art på vit botten; opacity ramp:as 0→1 i tre faser. Bildens
              vita botten = osynlig mot pappret (vit-på-vit); bara linjerna tonar in. */}
          <AnimatedImage
            href={source}
            x={IMG_X}
            y={IMG_Y}
            width={IMG_SIZE}
            height={IMG_SIZE}
            preserveAspectRatio="xMidYMid slice"
            opacity={imageOpacity}
          />
        </G>

        {/* Q-ring + svans ovanpå (brand-frame). */}
        <Circle
          cx={QX}
          cy={QY}
          r={QR}
          fill="none"
          stroke={Colors.primary}
          strokeWidth={RING_W}
        />
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
  // Transparent container → parent (mörk gaming-bg) lyser igenom utanför Q:t.
  canvas: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
});

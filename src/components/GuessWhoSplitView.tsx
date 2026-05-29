// GuessWhoSplitView — split-view "Guess Who"-fråga (prototyp, spec 2026-05-29).
//
//   SESSION A (vänster, WHITE MODE): ren vit canvas. Doodeln (svart line-art på
//     vitt, från fal.ai-doodle-motorn) avslöjas gradvis vänster→höger ("ritas
//     fram") i takt med nedräkningen.
//   SESSION B (höger, DARK MODE): stor blå Q. Inne i Q:t avslöjas 4 ledtrådar
//     progressivt: 1) typ (Sport/Music/Film) 2) peak-era 3) ursprungsland
//     4) 1-2 igenkännings-ord.
//
// Timing: alla 4 ledtrådar är framme vid 2/3 av total-tiden T (ledtråd i visas
// vid (i+1)/4 · 2/3 · T → t.ex. 5/10/15/20 s vid T=30). Doodle-reveal körs på
// assistance-tempo (full=0.25, standard=0.5, minimal=0.75 av T) och fortsätter
// till 100 % oavsett när spelaren svarar (samma princip som SketchCanvas/
// ProgressiveCover). Self-driving på `resetKey` — standalone-vänlig.
//
// PROTOTYP: inte wired till quiz.tsx phase-machine ännu (svars-block/Letter Grid
// läggs under split-viewen när vi integrerar).

import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/theme';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  Image as SvgImage,
  Line,
  Mask,
  Rect,
} from 'react-native-svg';
import type { GuessWhoClues } from '@/src/utils/guessWhoDemo';

type AssistanceLevel = 'minimal' | 'standard' | 'full';

const ASSISTANCE_DRAW_FRACTION: Record<AssistanceLevel, number> = {
  full: 0.25,
  standard: 0.5,
  minimal: 0.75,
};

// Andel av T när SISTA ledtråden är framme (spec: 2/3-märket).
const CLUES_ALL_OUT_FRACTION = 2 / 3;
const CLUE_COUNT = 4;

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface Props {
  /** SVART line-art-doodle på VIT botten (getQuizSketch(id)). */
  source: ImageSourcePropType | null;
  /** De 4 ledtrådarna (visas i ordning inne i Q:t). */
  clues: GuessWhoClues;
  /** Ändras (questionIndex) → reveal + ledtrådar börjar om. */
  resetKey: string | number;
  /** Answer Response Time i sekunder — sätter tempot för båda sessionerna. */
  totalSeconds: number;
  /** Spelarens assistance-nivå (default 'standard') — styr doodle-tempot. */
  assistance?: AssistanceLevel;
  /** När true: snap:a direkt till färdig (allt avslöjat) — demo/reveal. */
  isRevealed?: boolean;
}

export function GuessWhoSplitView({
  source,
  clues,
  resetKey,
  totalSeconds,
  assistance = 'standard',
  isRevealed = false,
}: Props) {
  // Vänster: doodle-wipe-progress 0→1 (vänster→höger).
  const wipe = useRef(new Animated.Value(0)).current;
  // Höger: hur många ledtrådar som avslöjats (0–4).
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    wipe.setValue(0);
    setRevealedCount(0);

    if (isRevealed) {
      wipe.setValue(1);
      setRevealedCount(CLUE_COUNT);
      return;
    }

    const fraction = ASSISTANCE_DRAW_FRACTION[assistance] ?? 0.5;
    const drawMs = Math.max(900, totalSeconds * fraction * 1000);
    const anim = Animated.timing(wipe, {
      toValue: 1,
      duration: drawMs,
      useNativeDriver: false, // SVG-mask-bredd → JS-driver
    });
    anim.start();

    // Ledtråd i (0-indexerad) framme vid (i+1)/4 · 2/3 · T.
    const stepMs = (totalSeconds * CLUES_ALL_OUT_FRACTION * 1000) / CLUE_COUNT;
    const timers = Array.from({ length: CLUE_COUNT }, (_, i) =>
      setTimeout(() => setRevealedCount((c) => Math.max(c, i + 1)), stepMs * (i + 1)),
    );

    return () => {
      anim.stop();
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, assistance, totalSeconds, isRevealed]);

  const wipeWidth = useMemo(
    () => wipe.interpolate({ inputRange: [0, 1], outputRange: [0, 100] }),
    [wipe],
  );

  return (
    <View style={styles.row}>
      {/* SESSION A — vit canvas, doodle ritas fram vänster→höger */}
      <View style={styles.leftPane}>
        {source ? (
          <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <Defs>
              <Mask id="gw-wipe">
                <Rect x="0" y="0" width="100" height="100" fill="black" />
                <AnimatedRect x="0" y="0" height="100" width={wipeWidth} fill="white" />
              </Mask>
            </Defs>
            <SvgImage
              href={source}
              x={0}
              y={0}
              width={100}
              height={100}
              preserveAspectRatio="xMidYMid meet"
              mask="url(#gw-wipe)"
            />
          </Svg>
        ) : (
          <Text style={styles.missing}>No doodle</Text>
        )}
      </View>

      <View style={styles.divider} />

      {/* SESSION B — mörk, blå Q med progressiva ledtrådar inuti */}
      <View style={styles.rightPane}>
        <View style={styles.qWrap}>
          <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            {/* Q-ring + svans (brand-blå), speglar QuizVibeLogo-geometrin. */}
            <Circle cx={50} cy={48} r={40} fill="none" stroke={Colors.primary} strokeWidth={4} />
            <Line
              x1={50 + 0.69 * 40}
              y1={48 + 0.69 * 40}
              x2={50 + 1.12 * 40}
              y2={48 + 1.12 * 40}
              stroke={Colors.primary}
              strokeWidth={4}
              strokeLinecap="round"
            />
          </Svg>

          {/* Ledtråds-stack centrerad inne i Q-ringen */}
          <View style={styles.clueStack} pointerEvents="none">
            <ClueRow index={0} revealed={revealedCount > 0} label="Type" value={clues.category} />
            <ClueRow index={1} revealed={revealedCount > 1} label="Era" value={clues.era} />
            <ClueRow index={2} revealed={revealedCount > 2} label="From" value={clues.country} />
            <ClueRow index={3} revealed={revealedCount > 3} label="Hint" value={clues.recognition} />
          </View>
        </View>
      </View>
    </View>
  );
}

// En ledtråds-rad: nummer-badge + label + värde. Fade + slide-up när den avslöjas;
// dämpad placeholder-prick innan dess (stabil höjd → ingen layout-hopp i ringen).
function ClueRow({
  index,
  revealed,
  label,
  value,
}: {
  index: number;
  revealed: boolean;
  label: string;
  value: string;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: revealed ? 1 : 0,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [revealed, anim]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [6, 0] });

  if (!revealed) {
    return (
      <View style={styles.clueRow}>
        <View style={styles.clueBadgeLocked}>
          <Text style={styles.clueBadgeLockedText}>{index + 1}</Text>
        </View>
        <Text style={styles.cluePlaceholder}>• • •</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.clueRow, { opacity: anim, transform: [{ translateY }] }]}>
      <View style={styles.clueBadge}>
        <Text style={styles.clueBadgeText}>{index + 1}</Text>
      </View>
      <View style={styles.clueTextWrap}>
        <Text style={styles.clueLabel}>{label}</Text>
        <Text style={styles.clueValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flex: 1, flexDirection: 'row' },
  leftPane: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  divider: { width: 1, backgroundColor: Colors.borderStrong },
  rightPane: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  missing: { color: Colors.textSecondary, fontSize: FontSize.sm },

  qWrap: { width: '100%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  clueStack: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: '18%',
  },
  clueRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, minHeight: 30 },
  clueBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clueBadgeText: { color: Colors.background, fontSize: 10, fontWeight: FontWeight.bold },
  clueBadgeLocked: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clueBadgeLockedText: { color: Colors.textDisabled, fontSize: 10, fontWeight: FontWeight.bold },
  clueTextWrap: { flexShrink: 1 },
  clueLabel: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  clueValue: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  cluePlaceholder: { color: Colors.textDisabled, fontSize: FontSize.sm, letterSpacing: 1 },
});

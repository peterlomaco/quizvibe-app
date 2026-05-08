import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Colors, FontSize, FontWeight, Spacing } from '../theme';

interface Props {
  /** Anropas när nedräkningen passerat 1 → 0 OCH "?" har visats. */
  onComplete: () => void;
  /** Sekunder att räkna ner från (default 3). */
  startFrom?: number;
  /** Namn på spelaren som ska börja sin runda — visas ovan Q-loggan så
   *  spelarna ser vems tur det är även när nedräkningen körs. */
  playerName?: string;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
// Q-loggan dominerar bilden så användaren omedelbart läser hela skärmen som
// "QuizVibe-frågesignal". Capad mot skärmbredd minus liten edge-gutter.
const LOGO_SIZE = Math.min(360, SCREEN_WIDTH - 40);

// Storlek på siffran och "?" — sätts så glyfen ryms innanför Q-ringens inre
// diameter (Q-ring radius 13 i 80-viewBox, strokeWidth 3 → inre diameter
// ~23 i viewBox-enheter ≈ 28.75 % av LOGO_SIZE). 0.28 ger en tight men
// klar passform med liten luft mellan glyf och ring-stroke.
const GLYPH_FONT_SIZE = LOGO_SIZE * 0.28;

/**
 * 3-2-1-nedräkning som visas mellan tap på Play-knappen i GetReadyIntro och
 * att fråge-vyn dyker upp. En stor Q-logga står centrerad — under räkningen
 * visas siffran (3, 2, 1) med spring-pop på Q-ringens center; när 1 fadar
 * ut pop:as "?" in på samma plats för att signalera "fråga snart". Efter
 * att "?" visats i ~1 s fyras `onComplete` så parent kan växla fas till
 * `'question'`.
 */
export function CountdownIntro({ onComplete, startFrom = 3, playerName }: Props) {
  const [count, setCount] = useState(startFrom);
  // Två separata pop-animationer så siffran och "?" kan röra sig oberoende.
  const numberScale = useRef(new Animated.Value(1.4)).current;
  const numberOpacity = useRef(new Animated.Value(0)).current;
  const qmarkScale = useRef(new Animated.Value(1.4)).current;
  const qmarkOpacity = useRef(new Animated.Value(0)).current;
  // useRef för callbacken så ev. ny prop-identitet inte ändrar setInterval-deps.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // En tick per sekund 3 → 2 → 1 → 0. När count blir 0 byts siffran mot "?"
  // och en uppföljande timeout (1 s) fyrar onComplete så parent växlar fas.
  useEffect(() => {
    setCount(startFrom);
    const id = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(id);
          setTimeout(() => onCompleteRef.current(), 1000);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [startFrom]);

  // Pop-animation per siffer-byte (3, 2, 1). Skala 1.4 → 1, opacity 0 → 1
  // över 250 ms.
  useEffect(() => {
    if (count <= 0) return;
    numberScale.setValue(1.4);
    numberOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(numberScale, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(numberOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [count, numberScale, numberOpacity]);

  // "?" pop:as in när count går 1 → 0 (efter 1:ans 1-sekund). Samma feel
  // som siffer-poppen men på en separat Animated.Value så vi kan rendera
  // båda elementen samtidigt och låta dem fadea in/ut oberoende.
  useEffect(() => {
    if (count !== 0) return;
    qmarkScale.setValue(1.4);
    qmarkOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(qmarkScale, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(qmarkOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [count, qmarkScale, qmarkOpacity]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* PlayerName ovan loggan — anchorar nedräkningen till rätt spelare
            (Pass-the-Phone-mode kan lämna telefonen i 1–3 sek innan svar). */}
        {playerName ? (
          <View style={styles.playerWrap}>
            <Text style={styles.playerLabel}>Pass-the-Phone to:</Text>
            <Text style={styles.playerName} numberOfLines={1}>
              {playerName}
            </Text>
          </View>
        ) : null}
        <View style={styles.logoStack}>
          <CountdownQLogo size={LOGO_SIZE} />
          {/* Glyph-overlay centrerad på Q-ringens center. Q-ringen ligger
              vid SVG-koord (37, 37) av 80×80-viewBox = 46.25 % av LOGO_SIZE.
              50/50-flex-centrering räcker här — sista ~3.75 % offset från
              exakt visuell mitt är inte värd komplexiteten på den här skalan. */}
          <View pointerEvents="none" style={styles.glyphOverlay}>
            {count > 0 ? (
              <Animated.Text
                style={[
                  styles.glyphText,
                  {
                    opacity: numberOpacity,
                    transform: [{ scale: numberScale }],
                  },
                ]}
              >
                {count}
              </Animated.Text>
            ) : (
              <Animated.Text
                style={[
                  styles.glyphText,
                  {
                    opacity: qmarkOpacity,
                    transform: [{ scale: qmarkScale }],
                  },
                ]}
              >
                ?
              </Animated.Text>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

/**
 * Inline Q-logga utan inre symbol — siffran/"?" ritas ovanpå via
 * absolute-positionerad Animated.Text. Annars samma squares + Q-ring +
 * Q-svans som QuizVibeLogo.
 */
function CountdownQLogo({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Rect
        x="18" y="18" width="44" height="44" rx="12"
        fill={Colors.primaryMuted}
        stroke={Colors.primaryBorder}
        strokeWidth="1.5"
        transform="rotate(12 40 40)"
      />
      <Rect
        x="16" y="16" width="44" height="44" rx="12"
        fill={Colors.card}
        stroke={Colors.primary}
        strokeWidth="1.5"
        transform="rotate(-6 40 40)"
      />
      <Circle
        cx="37" cy="37" r="13"
        fill="none"
        stroke={Colors.primary}
        strokeWidth="3"
      />
      <Path
        d="M46 46 L52 52"
        stroke={Colors.primary}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  // PlayerName-block ovan loggan: liten label + stort namn så användaren
  // omedelbart förstår vem nedräkningen riktar sig till.
  playerWrap: {
    alignItems: 'center',
    gap: 2,
  },
  playerLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
  playerName: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  logoStack: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphText: {
    fontSize: GLYPH_FONT_SIZE,
    lineHeight: GLYPH_FONT_SIZE,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
    textShadowColor: Colors.background,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});

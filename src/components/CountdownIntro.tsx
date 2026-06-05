import { Nunito_700Bold, useFonts } from '@expo-google-fonts/nunito';
import * as Speech from 'expo-speech';
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
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';

interface Props {
  /** Anropas när nedräkningen passerat 1 → 0 OCH "?" har visats. */
  onComplete: () => void;
  /** Sekunder att räkna ner från (default 3). */
  startFrom?: number;
  /** Game mode — styr texten ovan Q-loggan. Pass-the-Phone visar
   *  "Pass-the-Phone to: <playerName>" med avatar-box; IndDev visar bara
   *  "Get Ready to Vibe" (ingen spelar-specifik info). */
  mode?: 'pass-the-phone' | 'individual-devices';
  /** Namn på spelaren som ska börja sin runda — visas ovan Q-loggan i PtP
   *  så spelarna ser vems tur det är även när nedräkningen körs. Ignoreras
   *  i IndDev. */
  playerName?: string;
  /** Avatar-emoji för spelaren — renderas i playerName-boxen som visuellt
   *  matchar GetReadyIntro:s currentPlayerBox (avatar + namn på rad). PtP-only. */
  playerEmoji?: string;
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
export function CountdownIntro({ onComplete, startFrom = 3, mode = 'pass-the-phone', playerName, playerEmoji }: Props) {
  const isIndDev = mode === 'individual-devices';
  // Nunito 700 Bold för "QuizVibe"-brandraden — matchar startskärmens
  // appName-textformat 1:1. Faller tillbaka till systemfont under font-
  // load (kort flicker, acceptabel kostnad för att slippa block:a render).
  const [fontsLoaded] = useFonts({ Nunito_700Bold });
  const brandFont = fontsLoaded ? 'Nunito_700Bold' : undefined;
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

  // Pop-in per siffer-byte (3, 2, 1) följt av kontinuerlig zoom-puls
  // (1.0 ↔ 1.18) tills siffran byts. Pop-in:n körs som spring 1.4 → 1 +
  // opacity 0 → 1 över ~250 ms; därefter fyras puls-loopen som scale-
  // sekvens 1 → 1.18 → 1 (350 ms varje håll = ~1.4 puls per sekund).
  // loopRef håller referens till loop-CompositeAnim:en så cleanup vid
  // count-change kan stoppa den innan nästa cykel.
  useEffect(() => {
    if (count <= 0) return;
    numberScale.setValue(1.4);
    numberOpacity.setValue(0);
    let loopAnim: Animated.CompositeAnimation | null = null;
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
    ]).start(({ finished }) => {
      // Bara starta puls-loopen om pop-in:n hann avslutas innan effekten
      // teardown:as (vid snabb count-change kan finished=false).
      if (!finished) return;
      loopAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(numberScale, {
            toValue: 1.18,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(numberScale, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),
      );
      loopAnim.start();
    });
    return () => {
      loopAnim?.stop();
    };
  }, [count, numberScale, numberOpacity]);

  // Röst-nedräkning: mörk mansröst, djupt och släpande.
  // pitch: 0.01 = absolut lägsta (mörkast möjligt), rate: 0.42 = långsamt.
  // Stop anropas i cleanup (returnvärdet från useEffect) så det inte krockar
  // med det nya speak-anropet vid count-byte. Try/catch skyddar mot saknad
  // native-modul i dev-build.
  useEffect(() => {
    try {
      console.log('speaking', count);
      Speech.speak(count <= 0 ? 'Go' : String(count), {
        language: 'en-US',
        pitch: 0.01,
        rate: 0.42,
      });
    } catch (e) { console.log('speech error', e); }
    return () => { try { Speech.stop(); } catch (_) {} };
  }, [count]);

  // "?" pop:as in när count går 1 → 0 + samma puls-loop som siffrorna ovan.
  // Separat Animated.Value så vi kan rendera båda elementen samtidigt under
  // korta överlapp och låta dem fadea in/ut oberoende.
  useEffect(() => {
    if (count !== 0) return;
    qmarkScale.setValue(1.4);
    qmarkOpacity.setValue(0);
    let loopAnim: Animated.CompositeAnimation | null = null;
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
    ]).start(({ finished }) => {
      if (!finished) return;
      loopAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(qmarkScale, {
            toValue: 1.18,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(qmarkScale, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),
      );
      loopAnim.start();
    });
    return () => {
      loopAnim?.stop();
    };
  }, [count, qmarkScale, qmarkOpacity]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Pre-countdown-headline ovan loggan. PtP: "Pass-the-Phone to:" +
            spelar-box (avatar + namn) så användaren vet vems tur det är
            även under nedräkningen. IndDev: "Get Ready to" / "QuizVibe"
            stackat på två rader så brand-namnet får visuellt fokus på rad 2.
            Alla spelare på sina egna enheter — ingen specifik spelare att namnge. */}
        {isIndDev ? (
          <View style={styles.playerBlock}>
            <Text style={styles.getReadyHeadline}>Get Ready to</Text>
            <Text style={[styles.getReadyBrandHeadline, brandFont && { fontFamily: brandFont }]}>
              QuizVibe
            </Text>
          </View>
        ) : playerName ? (
          <View style={styles.playerBlock}>
            <Text style={styles.playerLabel}>Pass-the-Phone to:</Text>
            <View style={styles.playerBox}>
              {playerEmoji ? (
                <View style={styles.playerEmojiWrap}>
                  <Text style={styles.playerEmoji}>{playerEmoji}</Text>
                </View>
              ) : null}
              <Text style={styles.playerName} numberOfLines={1}>
                {playerName}
              </Text>
            </View>
          </View>
        ) : null}
        <View style={styles.logoStack}>
          {/* Q-loggan shift:as RIGHT med 3.75 % av LOGO_SIZE så Q-ringens
              center (SVG-koord (37, 37) = 46.25 % från vänster) hamnar på
              50 % horisontellt — exakt under/i mitten av glyph-overlay:s
              centrerade siffra/?. Glyph-overlay:n flyttas INTE eftersom dess
              flex-centrering redan ankrar mot logoStack-mitten. */}
          <View
            style={[
              StyleSheet.absoluteFillObject,
              { transform: [{ translateX: LOGO_SIZE * 0.0375 }] },
            ]}
            pointerEvents="none"
          >
            <CountdownQLogo size={LOGO_SIZE} />
          </View>
          {/* Glyph-overlay centrerad i logoStack — samverkar med ovanstående
              Q-shift så siffran/? landar exakt i Q-ringens visuella center. */}
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
  // PlayerName-block ovan loggan: label + framed box. Spacing.xl mellan
  // label och box ger luftig separation (per Peter:s spec).
  playerBlock: {
    alignItems: 'center',
    gap: Spacing.xl,
  },
  playerLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
  // IndDev-headline: stor och bold, ersätter både "Pass-the-Phone to:"-label
  // och playerBox. Storleksmässigt motsvarar playerName-fontSize så
  // visuell vikt över loggan blir likadan i båda lägena.
  getReadyHeadline: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  // Brand-rad ("QuizVibe") under "Get Ready to" — matchar startskärmens
  // appName-textformat exakt (fontSize 38, weight 700, letterSpacing -0.5,
  // Nunito_700Bold via brandFont-prop:en på Text-elementet). Inlagd
  // fontFamily-override krävs på själva Text-elementet eftersom StyleSheet
  // inte kan villkorat applicera font-name baserat på fonts-loaded-state.
  getReadyBrandHeadline: {
    fontSize: 38,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  // Framed box runt avatar + namn — speglar GetReadyIntro:s currentPlayerBox
  // (primary-border + primaryMuted bg + Radius.md) så Pass-the-Phone-spelaren
  // visuellt kontinueras från turn-passing-skärmen genom nedräkningen.
  playerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  playerEmojiWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerEmoji: {
    fontSize: 26,
    textAlign: 'center',
  },
  playerName: {
    flexShrink: 1,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.4,
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

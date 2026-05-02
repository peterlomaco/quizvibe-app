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
  /** Spelare som kommer på tur EFTER current — i ordning, med ev. wrap-around. */
  queueNames: string[];
  onReady: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
// Logan något större än ursprungliga 320, capad mot skärmbredd så loggan
// inte spiller över på smala enheter (iPhone SE m.fl.).
const LOGO_SIZE = Math.min(360, SCREEN_WIDTH - 32);
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
export function GetReadyIntro({ playerName, queueNames, onReady }: Props) {
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
      <View style={styles.container}>
        {/* ── Hero: stor statisk logo med "GET READY / TO VIBE" overlay ──── */}
        <View style={styles.heroBlock}>
          <View style={styles.logoWrap}>
            <QuizVibeLogo size={LOGO_SIZE} />
            <View style={styles.logoTextOverlay} pointerEvents="none">
              <Text style={styles.logoOverlayText}>GET READY</Text>
              <Text style={styles.logoOverlayText}>TO VIBE</Text>
            </View>
          </View>
        </View>

        {/* ── Play: kvadratisk pulserande+glowande knapp, centrerad mellan
            hero och pass-the-phone-blocket via container:s space-between. ── */}
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
          <Text style={styles.upNextLabel}>Pass-the-Phone to:</Text>
          <View style={styles.upNextBox}>
            {/* Liten play-pil i vänsterkant — visuell signal att rutans
                spelare är nästa på tur. Absolut-positionerad så namnet
                förblir horisontellt centrerat i rutan. */}
            <View style={styles.upNextBoxArrowWrap} pointerEvents="none">
              <Text style={styles.upNextBoxArrow}>▶</Text>
            </View>
            <Text style={styles.upNextName} numberOfLines={1}>
              {playerName}
            </Text>
          </View>
          {queueNames.length > 0 && (
            <ScrollView
              style={styles.queueList}
              contentContainerStyle={styles.queueListContent}
              showsVerticalScrollIndicator={false}
            >
              {queueNames.map((name, i) => (
                <Text
                  key={`${i}-${name}`}
                  style={styles.queueItem}
                  numberOfLines={1}
                >
                  {name}
                </Text>
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
  container: {
    flex: 1,
    // space-between distribuerar de tre blocken: hero överst, play visuellt
    // centrerat i screen-middle, pass-the-phone-blocket längst ner.
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 0,
    paddingBottom: Spacing.xl,
  },

  // ── Hero ───────────────────────────────────────────────────────────────
  heroBlock: {
    alignItems: 'center',
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
    // ~30% större än tidigare FontSize.xl (20) → 26.
    fontSize: 26,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 1.2,
    textAlign: 'center',
    textShadowColor: Colors.background,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },

  // ── Pass-the-Phone (Up next) ──────────────────────────────────────────
  upNextBlock: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  upNextLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  upNextBox: {
    width: '100%',
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    // position: relative för att absolut-positionera play-pilen i kanten
    // utan att kantra namnets horisontella centrering.
    position: 'relative',
  },
  upNextBoxArrowWrap: {
    position: 'absolute',
    left: Spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  upNextBoxArrow: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  upNextName: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  queueList: {
    width: '100%',
    marginTop: Spacing.sm,
    // Cap:ar listan så långa köer (6+ spelare) scrollar internt istället
    // för att knuffa play-knappen utanför skärmen.
    maxHeight: 180,
  },
  queueListContent: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  queueItem: {
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

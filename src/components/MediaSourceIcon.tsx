import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors, FontWeight } from '../theme';
import { YouTubeBrandIcon } from './YouTubeBrandIcon';
import { SpotifyBrandIcon } from './SpotifyBrandIcon';

/** Media-källa per fråga, för IndDev:s media-source-kö i GetReadyIntro. */
export type MediaSourceType = 'youtube' | 'spotify' | 'image' | 'none';

interface Props {
  source: MediaSourceType | undefined;
  /** Wrap-storlek (= cirkel diameter). Default 28 matchar Lobby. */
  size?: number;
}

/**
 * Renderar en av media-källikonerna. Speglar Lobby:s Game Connections-rad:
 *   • youtube  — YouTube:s officiella play-button (röd rounded-rect + vit
 *                triangel) per deras Branding Guidelines. Bevarar aspect-
 *                ratio så ikonen är wider-than-tall i en transparent
 *                size×size-wrap (centrerad).
 *   • image    — Q-figur (cirkel + svans) i primary-blå med "?"-glyph överlagrad
 *                (matchar Lobby:s "Guess"-ikon + QuizVibeQuestionMarkLogo-
 *                symboliken; platsfrågor = "Guess Where?")
 *   • none/?   — grå cirkel med ❓
 */
export function MediaSourceIcon({ source, size = 28 }: Props) {
  const wrapStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  if (source === 'youtube') {
    return (
      <View style={wrapStyle}>
        <YouTubeBrandIcon size={size} />
      </View>
    );
  }
  if (source === 'spotify') {
    return (
      <View style={wrapStyle}>
        <SpotifyBrandIcon size={size} variant="white" />
      </View>
    );
  }
  if (source === 'image') {
    return (
      <View style={wrapStyle}>
        {/* Q-figuren från startskärmens logga (utan omgivande kvadrater).
            Svg:n renderas i normalt flöde och fyller size×size-wrappen. "?"-
            glyfen läggs i en ABSOLUT overlay-VIEW från StyleSheet.create som
            flex-centrerar Texten — exakt samma struktur som CountdownIntro:s
            glyphOverlay, som fungerar på nya arkitekturen (dev-build). På den
            här builden appliceras position:absolute BARA från en View i
            StyleSheet.create; på själva <Svg>, på <Text> eller via inline-objekt
            ignorerades det → "?" hamnade UNDER Q:t. */}
        <Svg width={size} height={size} viewBox="24 22 32 32">
          <Circle
            cx="40"
            cy="38"
            r="13"
            fill="none"
            stroke={Colors.primary}
            strokeWidth="2.5"
          />
          <Path
            d="M49 47 L53 51"
            stroke={Colors.primary}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </Svg>
        <View style={styles.qMarkOverlay} pointerEvents="none">
          <Text style={[styles.questionGlyph, { fontSize: size * 0.55 }]}>?</Text>
        </View>
      </View>
    );
  }
  // none / unknown
  return (
    <View style={wrapStyle}>
      <Text style={[styles.glyph, { fontSize: size * 0.6 }]}>❓</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  glyph: {
    textAlign: 'center',
  },
  // Absolut overlay-View som flex-centrerar "?"-glyfen ovanpå den in-flow
  // Svg:n — exakt CountdownIntro:s glyphOverlay-mönster (fungerar på nya
  // arkitekturen). Q-ringens center (viewBox 40,38) sitter i wrap-mitten, så
  // flex-center landar glyfen i ringen.
  qMarkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // "?"-glyph — in-flow i qMarkOverlay, centreras av dess flex-layout. Upprät
  // (ingen italic) — italic på ett ensamt "?" dubbel-lutar glyfen. translateY
  // -1 finjusterar vertikal centrering mot Q-ringens visuella mitt.
  questionGlyph: {
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    transform: [{ translateY: -1 }],
  },
});

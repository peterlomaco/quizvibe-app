import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors, FontWeight } from '../theme';

/** Media-källa per fråga, för IndDev:s media-source-kö i GetReadyIntro.
 *  Samma symbolik som Lobby:s Game Connections-rad (generisk play-cirkel
 *  för YouTube-källan, Q+"?" för Images) så de två skärmarna känns
 *  visuellt konsistenta. Vi använder INTE YouTube:s officiella varumärke
 *  — se LobbyScreen connectionIconYoutube-stilen för rationale. */
export type MediaSourceType = 'youtube' | 'image' | 'none';

interface Props {
  source: MediaSourceType | undefined;
  /** Wrap-storlek (= cirkel diameter). Default 28 matchar Lobby. */
  size?: number;
}

/**
 * Renderar en av media-källikonerna i en cirkulär wrap. Speglar Lobby:s
 * Game Connections-rad:
 *   • youtube  — primary-blå cirkel med vit CSS-triangel-play (generic media-
 *                icon, INTE YouTube:s varumärke)
 *   • image    — Q-figur (cirkel + svans) i primary-blå med "?"-glyph överlagrad
 *                (matchar Lobby:s "Images"-rad-ikon + QuizVibeQuestionMarkLogo-
 *                symboliken; tidigare italicized "AI"-text, bytt 2026-05-23)
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
      <View style={[wrapStyle, styles.youtubeBg]}>
        <View
          style={[
            styles.youtubeArrow,
            {
              borderLeftWidth: size * 0.32,
              borderTopWidth: size * 0.21,
              borderBottomWidth: size * 0.21,
              marginLeft: size * 0.07,
            },
          ]}
        />
      </View>
    );
  }
  if (source === 'image') {
    return (
      <View style={wrapStyle}>
        {/* Q-figuren från startskärmens logga (utan omgivande kvadrater).
            Samma SVG-koordinater som Lobby:s Profiles & Places-ikon. */}
        <Svg
          width={size}
          height={size}
          viewBox="24 22 32 32"
          style={StyleSheet.absoluteFillObject}
        >
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
        <Text style={[styles.questionGlyph, { fontSize: size * 0.55 }]}>?</Text>
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
  // Generic media-icon: primary-blå cirkel + vit play-triangel.
  // Cirkulär form ärvs från wrapStyle.borderRadius (= size/2) i runtime.
  // Vi använder INTE YouTube:s varumärke (röd kvadrat + #FF0000) här —
  // se LobbyScreen connectionIconYoutube-stilen för rationale.
  youtubeBg: {
    backgroundColor: Colors.primary,
  },
  youtubeArrow: {
    width: 0,
    height: 0,
    borderLeftColor: '#FFFFFF',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  glyph: {
    textAlign: 'center',
  },
  // "?"-glyph centrerad inom Q-ringen (cx=40, cy=38 i viewBox). Upprät
  // (ingen italic) — italic på ett ensamt "?" dubbel-lutar glyfen och
  // läses inte cleant. translateY -1 finjusterar vertikal centrering så
  // glyfens visuella mitt landar exakt på Q-ring-mitt.
  questionGlyph: {
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    transform: [{ translateY: -1 }],
  },
});

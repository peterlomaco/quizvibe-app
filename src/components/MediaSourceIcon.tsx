import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors, FontWeight } from '../theme';

/** Media-källa per fråga, för IndDev:s media-source-kö i GetReadyIntro.
 *  Samma symbolik som Lobby:s Game Connections-rad (röd YouTube-ruta, grön
 *  Spotify-ruta, Q+AI för Images) så de två skärmarna känns visuellt
 *  konsistenta. */
export type MediaSourceType = 'youtube' | 'spotify' | 'image' | 'none';

interface Props {
  source: MediaSourceType | undefined;
  /** Wrap-storlek (= cirkel diameter). Default 28 matchar Lobby. */
  size?: number;
}

/**
 * Renderar en av tre media-källikoner i en cirkulär wrap. Speglar Lobby:s
 * Game Connections-rad:
 *   • youtube  — röd rundad ruta med vit CSS-triangel-play
 *   • spotify  — grön cirkel med 🎵-emoji
 *   • image    — Q-figur (cirkel + svans) i primary-blå med "AI"-text överlagrad
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
            },
          ]}
        />
      </View>
    );
  }
  if (source === 'spotify') {
    return (
      <View style={[wrapStyle, styles.spotifyBg]}>
        <Text style={[styles.glyph, { fontSize: size * 0.5 }]}>🎵</Text>
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
        <Text style={[styles.aiText, { fontSize: size * 0.36 }]}>AI</Text>
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
  youtubeBg: {
    backgroundColor: '#FF0000',
    borderRadius: 6,
  },
  youtubeArrow: {
    width: 0,
    height: 0,
    borderLeftColor: '#FFFFFF',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 2,
  },
  spotifyBg: {
    backgroundColor: '#1DB954',
  },
  glyph: {
    textAlign: 'center',
  },
  aiText: {
    fontWeight: FontWeight.bold,
    fontStyle: 'italic',
    color: Colors.primary,
    letterSpacing: 0.5,
    transform: [{ translateY: -1 }],
  },
});

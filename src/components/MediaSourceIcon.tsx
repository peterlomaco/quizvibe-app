import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors, FontWeight } from '../theme';
import { YouTubeBrandIcon } from './YouTubeBrandIcon';

/** Media-källa per fråga, för IndDev:s media-source-kö i GetReadyIntro.
 *  YouTube-källor renderas med YouTube:s officiella play-button-ikon
 *  (röd rounded-rect + vit triangel) per deras Branding Guidelines —
 *  signalerar tydligt att klippet kommer från YouTube. Images renderas
 *  med Q+"?" som matchar Lobby:s "Images"-rad-ikon. */
export type MediaSourceType = 'youtube' | 'image' | 'none';

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
    // YouTube-loggan är wider-than-tall (≈ 1.43:1). Centrerad i transparent
    // size×size-wrap så raderna fortsätter linjera lodrätt med andra ikoner.
    return (
      <View style={wrapStyle}>
        <YouTubeBrandIcon size={size} />
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

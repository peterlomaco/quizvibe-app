import React, { useId, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Radius } from '../theme';

// Guldtoner samplade ur guld-Q-loggan (quizvibe-q-gold.png, percentiler av
// luminans) så knapparna läser som samma metall som loggan (2026-10-15).
export const METALLIC_GOLD_EDGE = '#B85F02';
const STOPS: [number, string][] = [
  [0, '#CB6A02'],
  [0.18, '#EE9305'],
  [0.36, '#FEB221'],
  // Mittens highlight dämpad ~30 % (Peter 2026-10-16): knapparna ska kännas
  // premium-guld men logotypen ska förbli det mest lysande guldet.
  // Tidigare #FFE457 / #FFF89C; dämpat i två steg (senast Home v2-låsningen)
  // så toppen ligger klart under loggans #FFF89C-glans.
  [0.48, '#FFCE3E'],
  [0.54, '#FFD55C'],
  [0.62, '#FDC838'],
  [0.82, '#EE9305'],
  [1, '#CB6A02'],
];

/**
 * Metallisk guld-bakgrund — fyller sin förälder (absolute). Rendera som
 * FÖRSTA barn i en knapp med `overflow: 'hidden'` eller matchande radie.
 * Ren react-native-svg (redan installerad) → ingen native-modul, OTA-säker.
 */
export function MetallicGoldFill({ radius = Radius.md }: { radius?: number }) {
  // Unikt gradient-id per instans — flera knappar på samma skärm får annars
  // dela id och iOS kan rendera fel gradient.
  const id = `metallicGold${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  // Mät föräldern och rita med EXAKTA pt-mått. Svg width="100%" upplöstes
  // fel i Lobby/Get Ready (gradienten täckte bara ~85 % av knappen och den
  // platta bakgrundsfärgen syntes till höger) — procent ska inte användas här.
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  return (
    <View
      style={styles.fill}
      pointerEvents="none"
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setSize((prev) => (prev && prev.w === width && prev.h === height ? prev : { w: width, h: height }));
      }}
    >
      {size && (
        <Svg width={size.w} height={size.h}>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              {STOPS.map(([offset, color]) => (
                <Stop key={offset} offset={offset} stopColor={color} />
              ))}
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={size.w} height={size.h} rx={radius} ry={radius} fill={`url(#${id})`} />
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Explicit absolute, inte absoluteFillObject-spread — spreaden applicerades
  // inte som absolut på nya arkitekturen (se YouTubeMediaPlayer endedOverlay).
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
});

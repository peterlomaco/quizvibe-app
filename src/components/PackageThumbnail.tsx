import React from 'react';
import { Image, ImageSourcePropType, StyleSheet } from 'react-native';
import { BrandUi, Radius } from '../theme';

/**
 * PackageThumbnail (2026-10-19) — kvadratisk tumnagel för Host-paket.
 *
 * Central mappning paket-id → lokal asset (assets/package-thumbnails/,
 * beskurna ur QuizVibe-paketgrafiken utan etiketter). Bilderna bär redan sin
 * egen guld/navy-behandling, så komponenten lägger INGEN kant, glöd eller
 * overlay — bara rundade hörn. Tre lägen (on/off/unavailable), se
 * PackageThumbnailState. Switchen är fortsatt den primära ON/OFF-signalen.
 *
 * `pkg-dansband` + `pkg-rock` är förberedda för kommande paket; de syns först
 * när en entry med det id:t läggs i PURCHASED_PACKAGES.
 */

type ThumbSet = { on: ImageSourcePropType; off: ImageSourcePropType; unavailable: ImageSourcePropType };

// RN saknar saturation-filter → tre förrenderade varianter per paket:
//   <id>.webp             master (källa för varianterna, används ej direkt)
//   <id>.on.webp          ON  — ljusstyrka 93 % + kontrast 95 % (titeln ska dominera)
//   <id>.off.webp         OFF — färgmättnad 60 % (tydligt valbar, ej grå)
//   <id>.unavailable.webp UNAVAILABLE — nästan gråskala (5 % mättnad)
export const PACKAGE_THUMBNAILS: Record<string, ThumbSet> = {
  'pkg-100-swedish': {
    on: require('../../assets/package-thumbnails/pkg-100-swedish.on.webp'),
    off: require('../../assets/package-thumbnails/pkg-100-swedish.off.webp'),
    unavailable: require('../../assets/package-thumbnails/pkg-100-swedish.unavailable.webp'),
  },
  'pkg-dance-music': {
    on: require('../../assets/package-thumbnails/pkg-dance-music.on.webp'),
    off: require('../../assets/package-thumbnails/pkg-dance-music.off.webp'),
    unavailable: require('../../assets/package-thumbnails/pkg-dance-music.unavailable.webp'),
  },
  'pkg-disco-pop': {
    on: require('../../assets/package-thumbnails/pkg-disco-pop.on.webp'),
    off: require('../../assets/package-thumbnails/pkg-disco-pop.off.webp'),
    unavailable: require('../../assets/package-thumbnails/pkg-disco-pop.unavailable.webp'),
  },
  'pkg-hiphop': {
    on: require('../../assets/package-thumbnails/pkg-hiphop.on.webp'),
    off: require('../../assets/package-thumbnails/pkg-hiphop.off.webp'),
    unavailable: require('../../assets/package-thumbnails/pkg-hiphop.unavailable.webp'),
  },
  'pkg-melodifestivalen': {
    on: require('../../assets/package-thumbnails/pkg-melodifestivalen.on.webp'),
    off: require('../../assets/package-thumbnails/pkg-melodifestivalen.off.webp'),
    unavailable: require('../../assets/package-thumbnails/pkg-melodifestivalen.unavailable.webp'),
  },
  'pkg-soft-love': {
    on: require('../../assets/package-thumbnails/pkg-soft-love.on.webp'),
    off: require('../../assets/package-thumbnails/pkg-soft-love.off.webp'),
    unavailable: require('../../assets/package-thumbnails/pkg-soft-love.unavailable.webp'),
  },
  'pkg-dansband': {
    on: require('../../assets/package-thumbnails/pkg-dansband.on.webp'),
    off: require('../../assets/package-thumbnails/pkg-dansband.off.webp'),
    unavailable: require('../../assets/package-thumbnails/pkg-dansband.unavailable.webp'),
  },
  'pkg-rock': {
    on: require('../../assets/package-thumbnails/pkg-rock.on.webp'),
    off: require('../../assets/package-thumbnails/pkg-rock.off.webp'),
    unavailable: require('../../assets/package-thumbnails/pkg-rock.unavailable.webp'),
  },
};

export function hasPackageThumbnail(id: string): boolean {
  return id in PACKAGE_THUMBNAILS;
}

/**
 * ON = valt. OFF = valbart men ej valt (dämpat, fortfarande i färg).
 * UNAVAILABLE = kan inte väljas just nu (t.ex. blockerat av Parent Control) —
 * nästan gråskala + lägre opacitet så det skiljer sig tydligt från OFF.
 */
export type PackageThumbnailState = 'on' | 'off' | 'unavailable';

const STATE_OPACITY: Record<PackageThumbnailState, number> = {
  on: 1,
  off: 0.65,
  unavailable: 0.4,
};

// 1 pt kant i ALLA lägen (bara färgen byter) så bilden aldrig ändrar mått.
//   ON          — dämpat QuizVibe-guld, svagare än switchens kant (0.65).
//   OFF         — knappt synlig neutral gunmetal.
//   UNAVAILABLE — ingen synlig kant.
const STATE_BORDER: Record<PackageThumbnailState, string> = {
  on: 'rgba(245,166,35,0.45)',
  off: BrandUi.toggleOffBorder,
  unavailable: 'transparent',
};

interface Props {
  packageId: string;
  state: PackageThumbnailState;
  size?: number;
}

export function PackageThumbnail({ packageId, state, size = 48 }: Props) {
  const set = PACKAGE_THUMBNAILS[packageId];
  if (!set) return null;
  return (
    <Image
      source={set[state]}
      resizeMode="cover"
      accessibilityIgnoresInvertColors
      accessible={false}
      style={[
        styles.thumb,
        { width: size, height: size, opacity: STATE_OPACITY[state], borderColor: STATE_BORDER[state] },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  thumb: {
    aspectRatio: 1,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
});

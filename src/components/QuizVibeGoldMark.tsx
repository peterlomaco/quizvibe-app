import React from 'react';
import { Image } from 'react-native';

// Nya brand-marken "Navy + Metallic Gold" (2026-10-15). Metallguldet är
// inbakat i PNG:erna (transparent bakgrund, nycklade från Peters original),
// så inga tema-färger här. RN Image (inte expo-image) — inga transition-
// effekter på en statisk logga.
const MARK = require('@/assets/brand/quizvibe-mark-gold.png');
const WORDMARK = require('@/assets/brand/quizvibe-wordmark-gold.png');

// Källfilernas bildförhållanden (bredd / höjd) — mätta på de nycklade PNG:erna.
const MARK_RATIO = 587 / 608;
const WORDMARK_RATIO = 780 / 185;

// Q:t UTAN wifi-bågar (ring + förstorings-handtag) — för vyer som ritar
// eget innehåll i ringen, t.ex. nedräkningens 3-2-1/?.
const Q_ONLY = require('@/assets/brand/quizvibe-q-gold.png');
const Q_ONLY_W = 538;
const Q_ONLY_H = 532;
// Ringhålets mitt i källbilden (px), uppmätt — inte bildens mitt, eftersom
// handtaget sticker ut nere till höger.
const Q_HOLE_X = 263;
const Q_HOLE_Y = 234;

/**
 * Guld-Q:t utan bågar, positionerat så ringhålets mitt hamnar i mitten av
 * en `box × box`-ruta. `width` = Q-bildens bredd i pt. Rendera i en
 * relativ förälder av storlek `box`.
 */
export function QuizVibeGoldQCentered({
  box,
  width,
  offsetY = 0,
}: {
  box: number;
  width: number;
  /** Extra vertikal förskjutning av Q:t i pt (negativ = uppåt). */
  offsetY?: number;
}) {
  const k = width / Q_ONLY_W;
  return (
    <Image
      source={Q_ONLY}
      style={{
        position: 'absolute',
        width,
        height: Q_ONLY_H * k,
        left: box / 2 - Q_HOLE_X * k,
        top: box / 2 - Q_HOLE_Y * k + offsetY,
      }}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
    />
  );
}

/** Guld-Q:t. `size` = höjden i pt; bredden följer bildförhållandet. */
export function QuizVibeGoldMark({ size = 140 }: { size?: number }) {
  return (
    <Image
      source={MARK}
      style={{ width: size * MARK_RATIO, height: size }}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
    />
  );
}

/** Ordmärket "QuizVibe" i metallguld. `width` i pt; höjden följer bildförhållandet. */
export function QuizVibeGoldWordmark({ width = 220 }: { width?: number }) {
  return (
    <Image
      source={WORDMARK}
      style={{ width, height: width / WORDMARK_RATIO }}
      resizeMode="contain"
      accessible
      accessibilityLabel="QuizVibe"
      accessibilityIgnoresInvertColors
    />
  );
}

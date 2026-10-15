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

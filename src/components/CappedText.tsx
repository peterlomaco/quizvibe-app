// CappedText — <Text> med ett tak för iOS Dynamic Type ("Larger Text").
//
// Använd på TRÅNGA UI-element (badges, pills, tabell-celler, timer-siffror,
// en-rads-etiketter i fasta boxar) där obegränsad fontskalning klipper
// layouten. Lämna brödtext/läsbar text (frågetext, ledtrådar, FAQ,
// beskrivningar) som vanlig <Text> så de fortsatt skalar fullt.
//
// Taket (TIGHT_TEXT_MAX_SCALE) kan överridas per anrop eftersom {...props}
// spreadas EFTER default:en — passa ett eget maxFontSizeMultiplier vid behov.
//
// I filer där ALLA texter är trånga (t.ex. LeaderboardTable) importeras den
// som `import { CappedText as Text } from './CappedText'` så befintlig JSX
// blir capped utan ändring.

import React from 'react';
import { Text, type TextProps } from 'react-native';
import { TIGHT_TEXT_MAX_SCALE } from '../theme';

export function CappedText(props: TextProps) {
  return <Text maxFontSizeMultiplier={TIGHT_TEXT_MAX_SCALE} {...props} />;
}

// NameRevealCard — mellanlösning för image-frågor medan AI-tecknade sketches
// genereras. Renderar spelarens namn i stor läsbar typografi på paper-texture-
// liknande bakgrund. ProgressiveCover-mosaik appliceras ovanpå av quiz.tsx,
// så samma reveal-mekanism (32×18 block) funkar — bara underlying content
// är text istället för foto.
//
// När sketch-pipelinen är klar och `assets/quiz-sketches/<id>.webp` finns,
// switchar quiz.tsx till bild-rendering automatiskt via hasSketch(id)-check.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontWeight } from '@/src/theme';

interface Props {
  displayName: string;
}

export function NameRevealCard({ displayName }: Props) {
  // Auto-justera font-size för långa namn så de ryms inom card-bredden
  const isLong = displayName.length > 16;
  const isVeryLong = displayName.length > 24;
  const fontSize = isVeryLong ? 32 : isLong ? 44 : 56;

  return (
    <View style={styles.card}>
      <Text
        style={[styles.name, { fontSize }]}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
      >
        {displayName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#1a3050', // matcha quiz dark-blue-aesthetic
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  name: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

import type { MarkerProps } from '@ptomasroos/react-native-multi-slider';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../theme';

// Custom MultiSlider markers för Game Era-slidern. Solid-guld cirklar
// med − (vänster) / + (höger) som visuell signal: dra utåt för att
// förlänga intervallet, inåt för att förkorta. Växer vid drag (pressed)
// så användaren ser feedback.
const styles = StyleSheet.create({
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbPressed: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  sign: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.background,
    // includeFontPadding: false drar bort Android:s extra glyph-padding så
    // tecknet centreras korrekt vertikalt; lineHeight matchar fontSize av
    // samma anledning.
    lineHeight: 18,
    textAlign: 'center',
    includeFontPadding: false,
  },
  signPressed: {
    fontSize: 22,
    lineHeight: 22,
  },
});

export function EraMarkerMinus({ pressed }: MarkerProps) {
  return (
    <View style={[styles.thumb, pressed && styles.thumbPressed]}>
      <Text style={[styles.sign, pressed && styles.signPressed]}>−</Text>
    </View>
  );
}

export function EraMarkerPlus({ pressed }: MarkerProps) {
  return (
    <View style={[styles.thumb, pressed && styles.thumbPressed]}>
      <Text style={[styles.sign, pressed && styles.signPressed]}>+</Text>
    </View>
  );
}

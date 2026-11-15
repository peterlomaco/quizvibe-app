// "Paste code" for the room-code fields in JoinModal (Peter 2026-11-15).
//
// iOS 16+: Apple's native UIPasteControl via expo-clipboard's
// ClipboardPasteButton — pasting through it never triggers the
// "Allow Paste?" prompt. Its label ("Paste", localised by iOS) and icon are
// fixed by Apple; only colours and corner style can be set.
// Older iOS / other platforms: a QuizVibe-styled button that reads the
// clipboard with Clipboard.getStringAsync().
//
// Both paths hand the raw text to `onText`; the caller parses and validates.
// `disabled` never mounts the native control (it does not reliably honour
// pointerEvents from a parent) and renders a dimmed, non-interactive
// placeholder of the same size instead.

import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/src/components/haptic';
import { BrandUi, Colors, Radius } from '@/src/theme';

const BUTTON_W = 120;
const BUTTON_H = 36;

type Props = {
  onText: (text: string) => void;
  disabled?: boolean;
};

export function PasteCodeButton({ onText, disabled = false }: Props) {
  if (disabled) {
    return (
      <View style={[styles.fallback, styles.disabled]} pointerEvents="none">
        <Text style={styles.label}>Paste code</Text>
      </View>
    );
  }

  if (Platform.OS === 'ios' && Clipboard.isPasteButtonAvailable) {
    return (
      <View style={styles.nativeWrap}>
        <Clipboard.ClipboardPasteButton
          acceptedContentTypes={['plain-text']}
          backgroundColor={BrandUi.selectedFill}
          foregroundColor={Colors.warning}
          cornerStyle="medium"
          displayMode="iconAndLabel"
          style={styles.native}
          onPress={(data) => {
            if (data.type === 'text') onText(data.text);
          }}
        />
      </View>
    );
  }

  const handlePress = async () => {
    let text = '';
    try {
      text = await Clipboard.getStringAsync();
    } catch {
      text = '';
    }
    onText(text);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Paste room code"
      style={({ pressed }) => [styles.fallback, pressed && styles.pressed]}
    >
      <Text style={styles.label}>Paste code</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  nativeWrap: {
    alignSelf: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.45)',
    overflow: 'hidden',
  },
  native: { width: BUTTON_W, height: BUTTON_H },
  fallback: {
    alignSelf: 'center',
    width: BUTTON_W,
    height: BUTTON_H,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.45)',
    backgroundColor: BrandUi.selectedFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.45 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.warning },
});

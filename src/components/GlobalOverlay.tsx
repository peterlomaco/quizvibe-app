import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { BrandUi, Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import {
  GlobalOverlayState,
  getGlobalOverlay,
  subscribeGlobalOverlay,
} from '../utils/globalOverlay';

/**
 * Global full-skärms-cover renderad i app/_layout.tsx (utanför Stack-
 * navigatorn) så den överlever router.replace. Driven av globalOverlay-storen.
 * Se globalOverlay.ts för varför den inte kan bo i en enskild skärm.
 *
 * animationType="fade" ger en mjuk uttoning som avslöjar den redan färdig-
 * målade destinationsskärmen (t.ex. Home med BottomBanner på plats).
 */
export function GlobalOverlay() {
  const [state, setState] = useState<GlobalOverlayState>(() => getGlobalOverlay());

  useEffect(() => subscribeGlobalOverlay(() => setState(getGlobalOverlay())), []);

  return (
    <Modal visible={state.visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Lobby v2: appens standard-spinner + text (ersatte WaveDots, vars
              prickar krockade med texten på smala skärmar). */}
          <View style={styles.textRow}>
            <ActivityIndicator size="small" color={BrandUi.textMuted} />
            <Text style={styles.text}>{state.text}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Täcker hela skärmen med dimmad backdrop, centrerar ett card.
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: BrandUi.border,
    maxWidth: 320,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  text: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
});

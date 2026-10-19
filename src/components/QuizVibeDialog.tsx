import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { BrandUi, Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';

/**
 * QuizVibeDialog (2026-10-19) — in-app ersättare för native Alert.alert i
 * navy/guld-systemet. Mörk dimmad overlay, navy-kort med tunn neutral kant,
 * guld enbart på primär-knappen.
 *
 * En eller två actions: `secondaryLabel` utelämnad → bara primär-knappen
 * (fullbredd). Tap på overlayen = onClose (samma som Cancel).
 */

interface Props {
  visible: boolean;
  title: string;
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onClose: () => void;
}

export function QuizVibeDialog({
  visible,
  title,
  message,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onClose,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityLabel="Close dialog"
        />
        <View style={styles.card} accessibilityViewIsModal>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            {secondaryLabel ? (
              <Button
                label={secondaryLabel}
                onPress={onClose}
                variant="secondary"
                size="compact"
                fullWidth={false}
                style={styles.actionBtn}
              />
            ) : null}
            <Button
              label={primaryLabel}
              onPress={onPrimary}
              variant="gold"
              size="compact"
              fullWidth={false}
              style={styles.actionBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  backdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: BrandUi.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  message: {
    fontSize: FontSize.md,
    lineHeight: 22,
    color: BrandUi.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  actionBtn: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
  },
});

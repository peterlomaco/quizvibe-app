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
  /** Destruktiv primär-action (t.ex. Delete): röd kontur i stället för guld —
   *  guld betyder aldrig fel/förlust. */
  destructive?: boolean;
}

export function QuizVibeDialog({ visible, onClose, ...rest }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <QuizVibeDialogOverlay onClose={onClose} {...rest} />
    </Modal>
  );
}

/**
 * Samma dialog UTAN egen <Modal> — för att visa en bekräftelse inne i en
 * redan öppen RN-Modal (två samtidiga Modals kan sväljas på iOS). Lägg den
 * sist i modalens träd; den fyller hela ytan med dimmad overlay.
 */
export function QuizVibeDialogOverlay({
  title,
  message,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onClose,
  destructive = false,
}: Omit<Props, 'visible'>) {
  return (
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
          {destructive ? (
            <Pressable
              onPress={onPrimary}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.actionBtn,
                styles.destructiveBtn,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.destructiveLabel}>{primaryLabel}</Text>
            </Pressable>
          ) : (
            <Button
              label={primaryLabel}
              onPress={onPrimary}
              variant="gold"
              size="compact"
              fullWidth={false}
              style={styles.actionBtn}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  destructiveBtn: {
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.6)',
    backgroundColor: 'rgba(255,107,107,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  destructiveLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.error,
  },
});

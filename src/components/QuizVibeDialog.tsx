import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { LoadingContent } from './LoadingContent';
import { SlideToConfirm } from './SlideToConfirm';
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
  /** Valfri ikon ovanför titeln (t.ex. röd papperskorg för Delete Account). */
  icon?: React.ReactNode;
  /** Valfri avskild varningsrad under meddelandet (dämpad röd). */
  warning?: string;
  /** Valfri ikon före etiketten på den destruktiva knappen. */
  destructiveIcon?: React.ReactNode;
  /** Ersätter den primära knappen med en dra-för-att-bekräfta-kontroll
   *  (Cancel fullbredd överst, slidern under). `onPrimary` körs när slidern
   *  dragits hela vägen. Under `busy` är Cancel + overlay-tap avstängda. */
  /** Primär-actionen väntar på backend: spinner i knappen, båda knapparna
   *  + overlay-tap avstängda (ingen dubbel-submit, ingen halv-avbruten action). */
  primaryLoading?: boolean;
  slideToConfirm?: {
    label: string;
    busyLabel: string;
    busy: boolean;
    accessibilityHint?: string;
  };
  /** Egen handler för sekundär-knappen (default = onClose). Används av
   *  quizVibeAlert där backdrop-tap inte ska stänga men Cancel ska. */
  onSecondary?: () => void;
  /** Tre eller fler val (quizVibeAlert): staplade knappar i stället för
   *  primär/sekundär-raden. */
  stackedActions?: { label: string; onPress: () => void; kind: 'gold' | 'secondary' | 'destructive' }[];
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
  icon,
  warning,
  destructiveIcon,
  slideToConfirm,
  primaryLoading = false,
  onSecondary,
  stackedActions,
}: Omit<Props, 'visible'>) {
  const busy = (slideToConfirm?.busy ?? false) || primaryLoading;
  return (
    <View style={styles.overlay}>
      <Pressable
        style={styles.backdrop}
        onPress={busy ? undefined : onClose}
        accessibilityLabel="Close dialog"
      />
      <View style={[styles.card, slideToConfirm && styles.cardCompact]} accessibilityViewIsModal>
        {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {warning ? (
          <>
            <View style={styles.warningDivider} />
            <Text style={styles.warning}>{warning}</Text>
          </>
        ) : null}
        {slideToConfirm ? (
          <View style={styles.slideActions}>
            {secondaryLabel ? (
              <Button
                label={secondaryLabel}
                onPress={onClose}
                variant="secondary"
                size="compact"
                disabled={busy}
                style={styles.slideCancelBtn}
              />
            ) : null}
            <SlideToConfirm
              label={slideToConfirm.label}
              busyLabel={slideToConfirm.busyLabel}
              busy={busy}
              onConfirm={onPrimary}
              accessibilityLabel={primaryLabel}
              accessibilityHint={slideToConfirm.accessibilityHint}
            />
          </View>
        ) : stackedActions ? (
          <View style={styles.slideActions}>
            {stackedActions.map((a, i) =>
              a.kind === 'destructive' ? (
                <Pressable
                  key={i}
                  onPress={a.onPress}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.destructiveBtn,
                    pressed && { opacity: 0.82, transform: [{ scale: 0.985 }] },
                  ]}
                >
                  <Text style={styles.destructiveLabel}>{a.label}</Text>
                </Pressable>
              ) : (
                <Button key={i} label={a.label} onPress={a.onPress} variant={a.kind} size="compact" />
              ),
            )}
          </View>
        ) : (
        <View style={[styles.actions, destructive && styles.actionsDestructive]}>
          {secondaryLabel ? (
            <Button
              label={secondaryLabel}
              onPress={onSecondary ?? onClose}
              disabled={busy}
              variant="secondary"
              size="compact"
              fullWidth={false}
              style={styles.actionBtn}
            />
          ) : null}
          {destructive ? (
            <Pressable
              onPress={onPrimary}
              disabled={primaryLoading}
              accessibilityRole="button"
              accessibilityState={{ busy: primaryLoading }}
              style={({ pressed }) => [
                styles.actionBtn,
                styles.destructiveBtn,
                pressed && !primaryLoading && { opacity: 0.82, transform: [{ scale: 0.985 }] },
              ]}
            >
              <LoadingContent loading={primaryLoading} color={Colors.error}>
                <View style={styles.destructiveInner}>
                  {destructiveIcon}
                  <Text style={styles.destructiveLabel}>{primaryLabel}</Text>
                </View>
              </LoadingContent>
            </Pressable>
          ) : (
            <Button
              label={primaryLabel}
              onPress={onPrimary}
              loading={primaryLoading}
              variant="gold"
              size="compact"
              fullWidth={false}
              style={styles.actionBtn}
            />
          )}
        </View>
        )}
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
    // Mjuk skugga (ingen glöd) så kortet lyfter från den dimmade ytan.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
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
  // Slide-läget: Cancel överst, slidern under — gott om luft mot feltryck.
  slideActions: {
    gap: 10,
    marginTop: 2,
  },
  // Slide-läget: Cancel lägre och mer sekundär (transparent yta, neutral
  // hårfin kant) så den inte konkurrerar med slidern.
  slideCancelBtn: {
    height: 42,
    backgroundColor: 'transparent',
    borderColor: BrandUi.border,
  },
  // Slide-läget: tätare vertikalt så dialogen känns kompakt.
  cardCompact: {
    paddingVertical: Spacing.md,
    gap: 8,
  },
  // Extra luft mellan Cancel och den destruktiva knappen mot feltryck.
  actionsDestructive: {
    gap: Spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.35)',
    backgroundColor: 'rgba(255,107,107,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningDivider: {
    height: 1,
    backgroundColor: BrandUi.border,
  },
  warning: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: 'rgba(255,107,107,0.85)',
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
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destructiveInner: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  destructiveLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.error,
  },
});

import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import { SequentialDots } from './SequentialDots';

interface Props {
  visible: boolean;
  /**
   * Anropas när spelaren tappar Retry. När utelämnad renderas ingen
   * knapp alls — overlay:n auto-dismissar då bara vid recovery. Används
   * av non-host:s sticky-locked-quiz-fas: connection har återkommit men
   * vi vill inte släppa låsningen automatiskt utan låta spelaren själv
   * välja att gå tillbaka till GetReady.
   */
  onRetry?: () => void;
  /**
   * True när Retry-knappen ska vara aktiv (= connection faktiskt
   * återkommit). False = knappen renderas men dimmas + är otappbar,
   * med text som signalerar "wait for connection". Bara meningsful
   * när `onRetry` är passad.
   */
  canRetry?: boolean;
}

/**
 * Fullscreen-overlay som monteras när connectionMonitor rapporterar
 * `unstable`-state i Individual Devices-läget. Spelaren kan inte avge
 * svar under bortfallet — input-knapparna gråas separat av consumer
 * (quiz.tsx / GetReadyIntro) via `pointerEvents: 'none'`-mönstret.
 *
 * Vanlig mode (ingen `onRetry`-prop): auto-dismissar när monitor:n går
 * tillbaka till `ok` (2s hysteresis-fönster mot flapping). Används i
 * GetReadyIntro:s mid-game-reload-fall där sticky-låsning saknas.
 *
 * OK-mode (`onRetry` passad): visar en knapp i bottenkant. Disabled
 * tills `canRetry` blir true (= connection återkommit). Pressed →
 * `onRetry()` (consumer rensar sticky-latch + routar till intro +
 * broadcastar player_rejoined). Används i quiz.tsx:s question/
 * awaiting/reveal-faser där sticky-latchen håller overlay:n uppe
 * även efter recovery.
 *
 * D-vi-text-update: title bytt från "Connection unstable" → "Reconnecting..."
 * och button-label från "Retry" → "OK" så framing speglar att tapet
 * INTE försöker resume:a aktuell fråga utan acknowledgar disconnect:n
 * och routar till GetReady. Beteendet är oförändrat (gating på
 * canRetry kvar — undviker meningslös cycle om connection inte är
 * tillbaka när användaren tappar).
 */
export function ConnectionUnstableOverlay({ visible, onRetry, canRetry }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      // statusBarTranslucent säkrar att overlay-bg:n täcker även status-
      // bar-zonen på Android. iOS ignorerar prop:n (status bar ovanpå
      // hanteras av Modal:s presentation-style som default).
      statusBarTranslucent
      // Hardware back på Android: ingen action — overlay:n dismissar bara
      // när monitor:n recoverar. Spelaren kan inte avbryta manuellt.
      onRequestClose={() => {}}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <SignalLostIcon />
          </View>
          <Text style={styles.title}>Reconnecting…</Text>
          <Text style={styles.body}>
            Please verify your network connection. You can rejoin the next
            question once connection is restored.
          </Text>
          <View style={styles.dotsRow}>
            <SequentialDots color={Colors.error} />
          </View>
          {onRetry && (
            <Pressable
              style={({ pressed }) => [
                styles.retryBtn,
                !canRetry && styles.retryBtnDisabled,
                pressed && canRetry && styles.retryBtnPressed,
              ]}
              onPress={() => {
                if (canRetry) onRetry();
              }}
              disabled={!canRetry}
              accessibilityRole="button"
              accessibilityLabel={canRetry ? 'OK' : 'Waiting for connection'}
            >
              <Text
                style={[styles.retryBtnText, !canRetry && styles.retryBtnTextDisabled]}
              >
                {canRetry ? 'OK' : 'Waiting for connection…'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

/**
 * Egen SVG av en signal-tower-symbol med röd diagonal-strykning. Antennen
 * sitter i en cirkel i centrum, vågorna bågar ut åt båda sidor, och en
 * röd / korsande linje signalerar "no signal". Renderas i error-färg.
 */
function SignalLostIcon() {
  const c = Colors.error;
  return (
    <Svg width={56} height={56} viewBox="0 0 24 24" fill="none">
      {/* Inre antenn-punkt */}
      <Circle cx="12" cy="12" r="1.6" fill={c} />
      {/* Två närmaste vågor (vänster + höger) */}
      <Path
        d="M 8.8 8.8 a 4.5 4.5 0 0 0 0 6.4"
        stroke={c}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Path
        d="M 15.2 8.8 a 4.5 4.5 0 0 1 0 6.4"
        stroke={c}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      {/* Yttre vågor — dämpade via samma färg men tunnare line för djup */}
      <Path
        d="M 6.2 6.2 a 8 8 0 0 0 0 11.6"
        stroke={c}
        strokeWidth={1.2}
        strokeLinecap="round"
        opacity={0.5}
      />
      <Path
        d="M 17.8 6.2 a 8 8 0 0 1 0 11.6"
        stroke={c}
        strokeWidth={1.2}
        strokeLinecap="round"
        opacity={0.5}
      />
      {/* Diagonal-stryk genom mitten = "no signal" */}
      <Path d="M 4 20 L 20 4" stroke={c} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    // Mörkare än vanliga modals (0.6 vs 0.4) — signalerar "kritiskt", inte
    // bara "modal öppen". Speglar specens § D-iii overlay-styling.
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.error,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    minWidth: 280,
    maxWidth: 360,
  },
  iconWrap: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  body: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  dotsRow: {
    marginTop: Spacing.md,
    height: 22,
    justifyContent: 'center',
  },
  // Retry-knapp visas bara när consumer passar onRetry-prop. Disabled-state
  // håller knappen kvar i layouten men dimmar färgerna så spelaren ser att
  // den är otappbar (= väntar på recovery), istället för att knappen
  // popp:ar in/ut visuellt.
  retryBtn: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    minWidth: 200,
    alignItems: 'center',
  },
  retryBtnDisabled: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  retryBtnPressed: {
    opacity: 0.7,
  },
  retryBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    letterSpacing: 0.4,
  },
  retryBtnTextDisabled: {
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
});

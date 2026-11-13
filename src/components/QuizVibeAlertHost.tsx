import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { QuizVibeDialogOverlay } from './QuizVibeDialog';
import {
  type QuizVibeAlertButton,
  ensureAlertHost,
  getAlertStoreVersion,
  getCurrentAlert,
  isTopAlertHost,
  markAlertDisplayed,
  registerAlertHost,
  resolveCurrentAlert,
  subscribeAlerts,
  unregisterAlertHost,
} from '../utils/quizVibeAlert';

/**
 * Renderar quizVibeAlert()-dialoger (se src/utils/quizVibeAlert.ts). Lägg en i
 * app/_layout.tsx och en SIST inuti varje RN-Modal som kan visa en dialog,
 * med `active` = samma uttryck som Modal:ens `visible`.
 *
 * ⚠ `active` krävs för hosts inuti en Modal: på iOS (nya arkitekturen) kan en
 * stängd Modal ligga kvar MONTERAD tills native onDismiss kommer — och den
 * kommer inte alltid. En host som registrerades på mount trodde då att den
 * fortfarande var överst, dialogen ritades osynligt i den stängda sheeten och
 * alla senare dialoger köades bakom den (switchar "svarade inte").
 *
 * Knapp-mappning som en iOS-alert: en knapp → ensam primär; två → 'cancel'
 * (annars den första) till vänster som sekundär, den andra som primär
 * (destruktiv = röd kontur); tre eller fler → staplade knappar.
 */
export function QuizVibeAlertHost({
  active = true,
  inModal = false,
}: {
  active?: boolean;
  /** Rot-hosten i app/_layout.tsx: en vanlig vy där hamnar BAKOM native-
   *  stackens skärmar på iOS, så reserv-hosten måste ligga i en egen Modal.
   *  Skärm- och sheet-hostar (som registreras senare och därmed vinner) är
   *  vanliga vyer. */
  inModal?: boolean;
}) {
  // ⚠ React Compiler är på (app.json experiments.reactCompiler). Den
  // memoiserade getCurrentAlert()/isTopAlertHost() — de läser en modul-kö
  // utanför React — så hosten fick aldrig se en ny dialog och skyddsnätet
  // visade iOS-alerten (Peter 2026-11-13). Komponenten undantas därför, och
  // prenumerationen går via useSyncExternalStore.
  'use no memo';
  const [hostId, setHostId] = useState<number | null>(null);
  useSyncExternalStore(subscribeAlerts, getAlertStoreVersion);

  useEffect(() => {
    if (!active) return;
    const id = registerAlertHost();
    setHostId(id);
    return () => {
      unregisterAlertHost(id);
      setHostId(null);
    };
  }, [active]);

  const alert = getCurrentAlert();
  // Normalt ritar den senast registrerade aktiva hosten. Har skyddsnätet
  // flaggat dialogen (forceRoot) ritar i stället rot-hosten (inModal).
  const showing =
    active &&
    hostId !== null &&
    !!alert &&
    (alert.forceRoot ? inModal : isTopAlertHost(hostId));

  // Självläkning + kvittens: håll hosten registrerad (om registret tappat
  // den) och kvittera att dialogen faktiskt ritats, annars tar
  // native-fallbacken i quizVibeAlert över.
  useEffect(() => {
    if (active && hostId !== null) ensureAlertHost(hostId);
    if (showing && alert) markAlertDisplayed(alert.id);
  });

  // Inaktiv host (stängd sheet) ritar ingenting alls.
  if (!active) return null;

  let content: React.ReactNode = null;
  if (!showing || !alert) {
    content = null;
  } else if (alert.buttons.length >= 3) {
    const { buttons } = alert;
    content = (
      <QuizVibeDialogOverlay
        title={alert.title}
        message={alert.message ?? ''}
        primaryLabel=""
        onPrimary={() => {}}
        onClose={() => {}}
        stackedActions={buttons.map((b, i) => ({
          label: b.text ?? 'OK',
          onPress: () => resolveCurrentAlert(b),
          kind:
            b.style === 'destructive'
              ? 'destructive'
              : b.style === 'cancel'
                ? 'secondary'
                : buttons.findIndex((x) => x.style !== 'cancel' && x.style !== 'destructive') === i
                  ? 'gold'
                  : 'secondary',
        }))}
      />
    );
  } else {
    const { buttons } = alert;
    let secondary: QuizVibeAlertButton | undefined;
    let primary: QuizVibeAlertButton;
    if (buttons.length === 2) {
      const cancelIdx = buttons.findIndex((b) => b.style === 'cancel');
      const secIdx = cancelIdx >= 0 ? cancelIdx : 0;
      secondary = buttons[secIdx];
      primary = buttons[secIdx === 0 ? 1 : 0];
    } else {
      primary = buttons[0];
    }
    content = (
      <QuizVibeDialogOverlay
        title={alert.title}
        message={alert.message ?? ''}
        primaryLabel={primary.text ?? 'OK'}
        onPrimary={() => resolveCurrentAlert(primary)}
        secondaryLabel={secondary ? secondary.text ?? 'Cancel' : undefined}
        // Backdrop-tap stänger inte (som en iOS-alert); Cancel-knappen
        // kör den sekundära knappens handler.
        onClose={() => {}}
        onSecondary={secondary ? () => resolveCurrentAlert(secondary) : undefined}
        destructive={primary.style === 'destructive'}
      />
    );
  }

  // Alltid i en egen RN-Modal (2026-11-13). En vanlig vy ritades inte på
  // enhet (den hamnade bakom native-stackens skärmar / skärmens innehåll);
  // en Modal ritas överst — samma mönster som info-popuparna (InfoDialog),
  // som fungerar. En host inuti en öppen sheet-Modal får en nästlad Modal,
  // vilket iOS presenterar ovanpå sheeten. `inModal` behålls för bakåt-
  // kompatibilitet men styr inte längre något.
  //
  // ⚠ Modalen är ALLTID monterad medan hosten är aktiv och växlar bara
  // `visible` (som InfoDialog). Att avmontera en synlig RN-Modal på iOS kan
  // lämna ett osynligt lager kvar ovanpå appen som sväljer alla tryck — appen
  // frös efter att en popup stängts (Peter 2026-11-13).
  void inModal;
  return (
    <Modal visible={showing} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.layer} pointerEvents="box-none">
        {content}
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 1000,
  },
});

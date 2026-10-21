import { InteractionManager } from 'react-native';

// Lättviktig module-level pub/sub-store för en GLOBAL full-skärms-overlay som
// renderas i app/_layout.tsx (utanför Stack-navigatorn). Eftersom _layout
// aldrig avmonteras under Stack-navigation kan overlay:n ligga kvar SYNLIG
// tvärs över en router.replace — till skillnad från en Modal som ägs av en
// skärm (den rivs synkront när skärmen unmountar).
//
// Används av lobby-delete-flödet: "Please Wait — Deleting this Lobby"-covern
// täcker HELA navigationen till Home, så BottomBanner + Home hinner måla bakom
// covern och avslöjas först när den tonas bort — ingen banner-flash före Home.
//
// Mönstret speglar subscribeProfileChanges i profileStorage.ts (Set<listener>).

export interface GlobalOverlayState {
  visible: boolean;
  text: string;
}

/** Kort settle efter navigationen innan covern tonas bort (ingen flash). */
export const GLOBAL_OVERLAY_SETTLE_MS = 150;

type Listener = () => void;

const listeners = new Set<Listener>();
let state: GlobalOverlayState = { visible: false, text: '' };

export function getGlobalOverlay(): GlobalOverlayState {
  return state;
}

export function showGlobalOverlay(text: string): void {
  state = { visible: true, text };
  listeners.forEach((fn) => fn());
}

export function hideGlobalOverlay(): void {
  if (!state.visible) return;
  state = { ...state, visible: false };
  listeners.forEach((fn) => fn());
}

export function subscribeGlobalOverlay(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Visar den globala covern DIREKT, kör `work` (backend-anrop + avslutande
 * router.replace) och tonar bort covern först när nästa skärm hunnit måla.
 *
 * För "Yes"-knappar i bekräftelse-dialoger som annars await:ar nätverket
 * innan något händer på skärmen (Peter 2026-10-21: tappet såg ut att inte
 * registreras). Ingen artificiell väntan — covern ligger exakt så länge
 * arbetet tar. Kastar `work` stängs covern ändå så skärmen aldrig låses.
 */
export async function runBehindGlobalOverlay(
  text: string,
  work: () => Promise<void> | void,
): Promise<void> {
  showGlobalOverlay(text);
  try {
    await work();
  } finally {
    InteractionManager.runAfterInteractions(() => {
      setTimeout(hideGlobalOverlay, GLOBAL_OVERLAY_SETTLE_MS);
    });
  }
}

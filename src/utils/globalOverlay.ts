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

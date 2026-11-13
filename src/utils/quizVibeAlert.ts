import { Alert } from 'react-native';

// Drop-in ersättare för Alert.alert i navy/guld-systemet (Lobby v2,
// 2026-10-21). Samma signatur som RN:s Alert.alert så call-sites bara byter
// funktionsnamn; renderingen sker av <QuizVibeAlertHost /> via
// QuizVibeDialogOverlay.
//
// Hostar: en per skärm som använder quizVibeAlert (vanlig vy sist i skärmens
// träd), en inuti varje RN-Modal som kan visa en dialog (active = Modal:ens
// visible) och en reserv i app/_layout.tsx (i egen Modal). Den SENAST
// registrerade aktiva hosten visar dialogen.
//
// Skyddsnät: en dialog som ingen host har ritat inom FALLBACK_MS visas som
// vanlig iOS-alert i stället — en kontroll får aldrig se trasig ut.

export type QuizVibeAlertButton = {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

export interface QuizVibeAlertRequest {
  id: number;
  title: string;
  message?: string;
  buttons: QuizVibeAlertButton[];
  /** Satt av skyddsnätet när den översta hosten inte ritade dialogen —
   *  då tar rot-hosten i app/_layout.tsx (alltid ritad) över. */
  forceRoot?: boolean;
}

type Listener = () => void;

// Skyddsnätets väntetid innan rot-hosten tar över, och innan native-alerten
// används. Var 300 ms: på en tung skärm (Lobby i dev-bygget) hann React inte
// rita om hostarna efter tappet, så skyddsnätet trodde att ingen ritade och
// visade iOS-alerten — trots att dialogen var på väg (Metro-loggen 2026-11-13).
// En riktigt saknad host fångas redan direkt (inga hostar → native).
const FALLBACK_MS = 300;
// Väntetid innan en ny dialog öppnas efter att en stängts (Modal-fade ~300 ms).
const REOPEN_DELAY_MS = 400;
const USE_IN_APP_DIALOG = true;

// Tillståndet ligger på globalThis, inte i modul-variabler: när koden laddas
// om (Fast Refresh) skapas en ny kopia av den här modulen medan redan
// monterade hostar (t.ex. rot-hosten i _layout) håller kvar den gamla. Med
// separata köer hamnade dialoger i en kö som ingen synlig host läste.
interface AlertStore {
  listeners: Set<Listener>;
  queue: QuizVibeAlertRequest[];
  hosts: number[];
  displayed: Set<number>;
  nextId: number;
  lastClosedAt: number;
}
const g = globalThis as unknown as { __quizVibeAlertStore?: AlertStore };
const store: AlertStore = (g.__quizVibeAlertStore ??= {
  listeners: new Set<Listener>(),
  queue: [],
  hosts: [],
  displayed: new Set<number>(),
  nextId: 1,
  lastClosedAt: 0,
});
// Äldre store (från före Fast Refresh) kan sakna fältet.
if (typeof store.lastClosedAt !== 'number') store.lastClosedAt = 0;
const { listeners, queue, hosts, displayed } = store;

function emit() {
  listeners.forEach((fn) => fn());
}

/** Kontrollerar att aktuell dialog faktiskt ritats. Steg 1: låt rot-hosten
 *  (egen Modal i _layout, ritas alltid) ta över. Steg 2: native-fallback. */
function scheduleFallbackCheck() {
  const current = queue[0];
  if (!current) return;
  setTimeout(() => {
    if (queue[0] !== current || displayed.has(current.id)) return;
    if (!current.forceRoot) {
      // Den översta hosten ritade inte (t.ex. en skärm som inte syns och
      // därför inte renderas om). Ge dialogen till rot-hosten.
      if (__DEV__) console.warn('[quizVibeAlert] top host did not draw — handing to root host:', current.title, hosts);
      current.forceRoot = true;
      emit();
      scheduleFallbackCheck();
      return;
    }
    // Inte ens rot-hosten ritade dialogen → visa den som vanlig iOS-alert.
    if (__DEV__) console.warn('[quizVibeAlert] no host drew the dialog — native fallback:', current.title);
    queue.shift();
    emit();
    Alert.alert(
      current.title,
      current.message,
      current.buttons.map((b) => ({ text: b.text, style: b.style, onPress: b.onPress })),
    );
    scheduleFallbackCheck();
  }, FALLBACK_MS);
}

/** Samma anrop som Alert.alert(title, message?, buttons?, options?). */
export function quizVibeAlert(
  title: string,
  message?: string,
  buttons?: QuizVibeAlertButton[],
  // Alert.alert:s options (cancelable m.m.) — dialogen stängs ändå bara via
  // en knapp, precis som en iOS-alert.
  _options?: unknown,
): void {
  // 2026-11-13: påslagen igen — hostarna ritar nu dialogen i en egen RN-Modal
  // (som InfoDialog), vilket är det mönster som syns på enhet. Sätt false för
  // att falla tillbaka på native iOS-alerten.
  if (!USE_IN_APP_DIALOG || hosts.length === 0) {
    Alert.alert(
      title,
      message,
      buttons?.map((b) => ({ text: b.text, style: b.style, onPress: b.onPress })),
    );
    return;
  }
  // En dialog som öppnas direkt efter att en annan stängts (t.ex. från dess
  // knapp) väntar tills den förra Modalens stängning är klar — två RN-Modals
  // som stängs/öppnas samtidigt kan sväljas eller låsa appen på iOS.
  const sinceClose = Date.now() - store.lastClosedAt;
  if (sinceClose < REOPEN_DELAY_MS) {
    setTimeout(() => quizVibeAlert(title, message, buttons), REOPEN_DELAY_MS - sinceClose);
    return;
  }
  // Upprepade tryck på samma kontroll ska inte stapla identiska dialoger
  // (OK skulle då bara visa nästa likadana).
  if (queue.some((a) => a.title === title && (a.message ?? '') === (message ?? ''))) return;
  queue.push({
    id: store.nextId++,
    title,
    message,
    buttons: buttons && buttons.length > 0 ? buttons : [{ text: 'OK' }],
  });
  emit();
  if (queue.length === 1) scheduleFallbackCheck();
}

export function getCurrentAlert(): QuizVibeAlertRequest | null {
  return queue[0] ?? null;
}

/** Anropas av hosten när den faktiskt har ritat dialogen. */
export function markAlertDisplayed(id: number): void {
  displayed.add(id);
}

/** Stänger aktuell dialog och kör knappens handler (efter stängning, som iOS). */
export function resolveCurrentAlert(button: QuizVibeAlertButton | undefined): void {
  const done = queue.shift();
  store.lastClosedAt = Date.now();
  if (done) displayed.delete(done.id);
  emit();
  scheduleFallbackCheck();
  if (button?.onPress) setTimeout(() => button.onPress?.(), 0);
}

export function registerAlertHost(): number {
  const id = store.nextId++;
  hosts.push(id);
  emit();
  return id;
}

/** Självläkning: en host som fortfarande är monterad men saknas i registret
 *  (t.ex. efter en Fast Refresh som laddat om den här modulen) läggs tillbaka. */
export function ensureAlertHost(id: number): void {
  if (!hosts.includes(id)) {
    hosts.push(id);
    emit();
  }
}

export function unregisterAlertHost(id: number): void {
  const i = hosts.indexOf(id);
  if (i >= 0) hosts.splice(i, 1);
  emit();
}

export function isTopAlertHost(id: number): boolean {
  return hosts[hosts.length - 1] === id;
}

export function subscribeAlerts(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

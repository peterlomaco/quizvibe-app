// Lättviktig analytics-wrapper. Loggar bara till console just nu — byt
// implementationen i `track`/`identify` när vendor är vald (PostHog,
// Firebase Analytics, Amplitude, etc.). Call-sites runt om i appen
// stannar oförändrade så vendor-byte är ett en-fils-byte.
//
// Konvention för event-namn: snake_case verb i preteritum
// (`user_registered`, `game_completed`). Properties: snake_case keys,
// primitiva värden (string | number | boolean | null) så de funkar i
// alla vendor-SDKs utan transform.
//
// Region/land: alla större vendors (PostHog, Firebase) sätter
// `country_code` automatiskt baserat på IP/locale, så vi behöver INTE
// skicka det själva i varje event. Slicing per region/land funkar i
// dashboarden out-of-the-box. App Store Connect ger nedladdningar per
// region som separat datakälla.

export type AnalyticsEventName =
  // Acquisition / lifecycle
  | 'user_registered'
  | 'user_logged_in'
  | 'user_logged_out'

  // Game flow
  | 'guest_name_created'
  | 'room_code_created'
  | 'game_started'
  | 'game_completed'

  // Monetization
  | 'purchase_completed';

export type AnalyticsProps = Record<string, string | number | boolean | null>;

/**
 * Logga ett product-event. Anropa på user-driven milestones — inte vid
 * varje render eller state-change, det blir bara brus i dashboarden.
 *
 * Exempel:
 *   track('user_registered', { method: 'email', assistance: 'standard', region: 'global' });
 *   track('purchase_completed', { type: 'extra_package', product_id: 'hip_hop', price_amount: 29, price_currency: 'SEK' });
 */
export function track(name: AnalyticsEventName, props?: AnalyticsProps): void {
  // TODO (analytics): byt console.log mot vendor-SDK-anrop när
  // leverantör är vald. T.ex.:
  //   PostHog: posthog.capture(name, props);
  //   Firebase: analytics().logEvent(name, props);
  //   Amplitude: amplitude.track(name, props);
  // Init körs i `app/_layout.tsx` på app-start.
  if (__DEV__) {
    console.log('[analytics]', name, props ?? {});
  }
}

/**
 * Associera efterföljande events med en specifik user. Anropa vid
 * registrering och login (med Player Name som userId tills riktig auth
 * finns). Guest-sessions identifieras INTE — de stannar anonyma men
 * deras events spåras ändå (t.ex. `guest_name_created`).
 *
 * Traits på identify hamnar som user-properties i analytics-tool:et och
 * kan sedan användas för att segmentera ALLA framtida events från den
 * användaren (utan att skicka traits i varje track-anrop).
 */
export function identify(userId: string, traits?: AnalyticsProps): void {
  // TODO (analytics): byt mot vendor-SDK. T.ex.:
  //   PostHog: posthog.identify(userId, traits);
  //   Firebase: analytics().setUserId(userId); + setUserProperty per trait;
  if (__DEV__) {
    console.log('[analytics] identify', userId, traits ?? {});
  }
}

/**
 * Rensa user-association (vid logout). Anonyma events efter detta
 * spåras med en ny anonym session-id som vendor:n hanterar.
 */
export function resetIdentity(): void {
  // TODO (analytics): byt mot vendor.reset() / analytics().resetAnalyticsData()
  if (__DEV__) {
    console.log('[analytics] reset');
  }
}

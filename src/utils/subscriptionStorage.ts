// Premium-state — appens ENDA läskälla för "har user Premium just nu".
//
// Alla 7 gates i appen (Max 12 players, 20 rundor, obegränsade host-
// credits, UNLIMITED-pillen, Extra Host packages) går genom
// hasPremiumSubscription(). Lägg därför ALDRIG in en parallell egen
// premium-check i en skärm — utöka den här funktionen i stället.
//
// TVÅ LAGER, i prioritetsordning:
//
//   1. BETALD prenumeration. `KEY` är en lokal spegel av RevenueCats
//      'premium'-entitlement. Nyckeln ÄGS av app/_layout.tsx, som skriver
//      hasEntitlement(...) vid varje app-start OCH vid varje customer-info-
//      ändring (renew/expire/restore/cross-device).
//
//   2. FREE PREMIUM LAUNCH PROMO. En gratismånad user själv startar via
//      "Free"-knappen i Store. Se src/utils/promoPremium.ts.
//
// ⚠ Promon får ALDRIG persisteras in i `KEY`. Utan RevenueCat konfigurerad
// (ingen key, Expo Go) returnerar getCustomerInfo() null och _layout:s
// skrivning blir `false` — en promo som skrivit `true` dit hade alltså
// raderats vid nästa app-start. Därför utvärderas promon vid LÄSNING här
// nedan i stället för att lagras i samma nyckel.
//
// Per-device-state (ej namespacad per user). RevenueCat knyter köpet till
// user-id via sin egen SDK; promo-claimen är device-lokal på samma sätt.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { hasActiveFreePremium } from './promoPremium';

const KEY = '@quizvibe/subscription/hasPremium/v1';

/**
 * True om användaren har Premium just nu — via betald prenumeration ELLER
 * via en pågående gratismånad från launch-kampanjen. Fail-closed:
 * returnerar false vid storage-error, så locked-state är default.
 */
export async function hasPremiumSubscription(): Promise<boolean> {
  try {
    // Lager 1 — betald entitlement (speglad från RevenueCat av _layout).
    const value = await AsyncStorage.getItem(KEY);
    if (value === 'true') return true;
  } catch (err) {
    console.warn('[subscriptionStorage] hasPremiumSubscription failed:', err);
    // Faller igenom till promo-checken — en trasig läsning av den betalda
    // flaggan ska inte tysta en giltig gratismånad.
  }
  // Lager 2 — launch-kampanjens gratismånad.
  return hasActiveFreePremium();
}

/**
 * Markerar Premium-prenumerationen som aktiv. Idempotent. Anropas av
 * StoreScreen.handleBuySubscription efter mock-purchase.
 */
export async function setPremiumActive(active: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, active ? 'true' : 'false');
  } catch (err) {
    console.warn('[subscriptionStorage] setPremiumActive failed:', err);
  }
}

/**
 * Rensa subscription-flaggan helt (vid logout, dev-reset, etc.).
 */
export async function clearPremiumSubscription(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (err) {
    console.warn('[subscriptionStorage] clearPremiumSubscription failed:', err);
  }
}

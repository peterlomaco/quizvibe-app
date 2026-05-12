// Mock subscription-state — Premium / Multiplayer Individual Devices-gating.
//
// Lokal AsyncStorage-flagga som speglar "user har en aktiv Premium-prenu-
// meration". Sätts av StoreScreen:s handleBuySubscription (mock-purchase),
// läses av LobbyScreen:s `hasPremium`-derivering för att unlock:a Individual
// Devices + Max 12 Players-toggles utan Store-deeplink.
//
// För launch (pre-launch-checklist): byt mot RevenueCat (eller motsvarande
// IAP-vendor) entitlement-check. Call-sites stannar oförändrade när
// has/setPremium-signaturerna bibehålls.
//
// Per-device-state nu (ej namespacad per user) eftersom subscription är
// device-agnostisk i mock-läget. När RevenueCat kommer in cookieas det till
// user-id automatiskt via deras SDK.

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@quizvibe/subscription/hasPremium/v1';

/**
 * True om användaren har en aktiv Premium-prenumeration. Fail-open:
 * returnerar false vid storage-error eller saknad key, så locked-state är
 * default.
 */
export async function hasPremiumSubscription(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(KEY);
    return value === 'true';
  } catch (err) {
    console.warn('[subscriptionStorage] hasPremiumSubscription failed:', err);
    return false;
  }
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

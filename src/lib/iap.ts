// ─────────────────────────────────────────────────────────────────────
// In-App Purchases — RevenueCat wrapper.
//
// Pre-launch blocker (Apple App Store Review Guidelines 3.1.1 + 3.1.5):
// virtuella varor MÅSTE sourcas via StoreKit. Vi använder RevenueCat som
// abstraction över StoreKit (iOS) — det hanterar receipt validation,
// subscription state, restore-flow + cross-device entitlement sync åt oss
// gratis upp till $10K MTR.
//
// Mental modell:
//   - Products = SKU:er i App Store Connect (pkg_credits_5, pkg_sub_monthly...)
//   - Entitlements = vad user har tillgång till ('premium', 'package_hiphop'...)
//   - Offerings = grupperingar av products visade i Store-skärmen
//   - Packages = items inside an offering (en package wrap:ar ett product)
//
// Type-mappning till QuizVibe:
//   - Consumable (5/10/20 credit-packs) → bumpa profile.gameCredits lokalt
//     vid purchase-success. Spåras INTE som entitlement (förbrukas).
//   - Non-consumable (Hip Hop, Rock, Film & Actors) → entitlement granted
//     permanent. Mappa till profile.enabledHostPackages.
//   - Auto-renewable subscription (1/3/6/12 månader) → entitlement 'premium'
//     aktiv så länge sub är giltig. Mappa till profile.hasPremium-derivering.
// ─────────────────────────────────────────────────────────────────────

import { Platform } from 'react-native';
import Purchases, {
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';

// Public API-key från RevenueCat Dashboard (Project Settings → API Keys).
// iOS-keyen börjar med 'appl_...'. Android-keyen ('goog_...') sätts först
// när Android-launch aktualiseras — iOS-only first launch per
// project_launch_scope_ios_only-memory:n.
const IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
const ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

// Entitlement-namn — MÅSTE matcha exakt vad som är definierat i RevenueCat
// Dashboard (Project → Entitlements). Ändra ALDRIG dessa strings utan att
// uppdatera RC-dashboarden samtidigt — entitlement-lookup använder dem
// som keys.
//
// V1 har BARA premium-entitlement. Themed packages (Hip Hop / Rock /
// Film & Actors) är parkerade till v1.1+; för v1 har user bara det gratis
// gen-paketet som inte mappar mot RC-entitlement (helt klient-driven via
// getFreeGenerationPackage(birthYear)).
export const ENTITLEMENTS = {
  /** Auto-renewable subscription (Premium membership) — unlocks Individual
      Devices, Max 12 players, Rounds up to 20, m.fl. */
  PREMIUM: 'premium',
} as const;

export type EntitlementKey = (typeof ENTITLEMENTS)[keyof typeof ENTITLEMENTS];

// Mappning från RC product-identifiers → consumable credit-mängd. Sätt
// upp product-ID:n i RC Dashboard så de matchar nycklarna nedan, sedan
// uppdatera värdena efter Store-skärmens tier-design (5/10/20).
//
// När en consumable purchase lyckas läser vi product-ID:n och bumpar
// profile.gameCredits med motsvarande värde — RC själv spårar inte
// consumable-balanser, det är vårt ansvar.
export const CREDIT_PRODUCT_AMOUNTS: Record<string, number> = {
  pkg_credits_5: 5,
  pkg_credits_10: 10,
  pkg_credits_20: 20,
};

let configured = false;

/**
 * Konfigurerar RevenueCat-SDK vid app-start. Idempotent — säkert att anropa
 * flera gånger (t.ex. om app:n re-mount:as via fast refresh under dev).
 *
 * `userId`-arg:t kopplar RC anonymous user till Supabase auth user. När
 * en user loggar in/registrerar via Supabase, anropa configurePurchases
 * igen med userId:t så purchases följer med över enheter. När user loggar
 * ut, anropa logOutPurchases för att resetta tillbaka till anonym RC user.
 */
export async function configurePurchases(userId?: string): Promise<void> {
  if (Platform.OS === 'ios') {
    if (!IOS_API_KEY) {
      console.warn(
        '[iap] EXPO_PUBLIC_REVENUECAT_IOS_KEY saknas i .env — IAP är inaktiv.',
      );
      return;
    }
    if (!configured) {
      // Logga RC SDK-info-meddelanden i dev, tystare i prod.
      if (__DEV__) {
        Purchases.setLogLevel(Purchases.LOG_LEVEL.WARN);
      } else {
        Purchases.setLogLevel(Purchases.LOG_LEVEL.ERROR);
      }
      Purchases.configure({ apiKey: IOS_API_KEY, appUserID: userId });
      configured = true;
    } else if (userId) {
      // Re-configure inte vid varje login — använd logIn istället så RC
      // mergear anonymous purchases med den nya user:n.
      try {
        await Purchases.logIn(userId);
      } catch (err) {
        console.warn('[iap] Purchases.logIn failed:', err);
      }
    }
    return;
  }
  if (Platform.OS === 'android') {
    if (!ANDROID_API_KEY) {
      // Android-keyen sätts först när Android-launch aktualiseras —
      // bara warna en gång på debug, ingen funktionalitet är broken.
      if (__DEV__) {
        console.warn('[iap] Android RevenueCat-key saknas — IAP är inaktiv på Android.');
      }
      return;
    }
    if (!configured) {
      Purchases.configure({ apiKey: ANDROID_API_KEY, appUserID: userId });
      configured = true;
    }
    return;
  }
  // Web/övriga: SDK:n stödjer inte web officiellt, no-op.
}

/**
 * När user loggar ut — reset:a RC tillbaka till anonym state så nästa
 * inloggning kan associera med rätt user-id. Bör anropas från logout-flow:t
 * i Profile + Home.
 */
export async function logOutPurchases(): Promise<void> {
  if (!configured) return;
  try {
    await Purchases.logOut();
  } catch (err) {
    console.warn('[iap] Purchases.logOut failed:', err);
  }
}

/**
 * Hämtar default offering från RevenueCat. Returnerar null om SDK:n inte
 * är konfigurerad eller om inga offerings är satt upp i dashboard:en än.
 * Store-skärmen mappar packages → CreditTier/PackageTier/SubscriptionTier
 * för rendering.
 */
export async function loadOfferings(): Promise<PurchasesOffering | null> {
  if (!configured) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch (err) {
    console.warn('[iap] loadOfferings failed:', err);
    return null;
  }
}

/**
 * Triggrar Apple's native purchase-modal för en package. Returnerar
 * customerInfo + product-id vid success, eller en discriminated `cancelled`
 * / `error`-result.
 *
 * Apple visar Touch ID / Face ID / password-prompt — vi har inget UI-ansvar
 * under själva flowen, bara handle resultatet.
 */
export type PurchaseResult =
  | { kind: 'success'; customerInfo: CustomerInfo; productIdentifier: string }
  | { kind: 'cancelled' }
  | { kind: 'error'; reason: string };

export async function purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult> {
  if (!configured) {
    return { kind: 'error', reason: 'iap_not_configured' };
  }
  try {
    const { customerInfo, productIdentifier } = await Purchases.purchasePackage(pkg);
    return { kind: 'success', customerInfo, productIdentifier };
  } catch (err: unknown) {
    // User-cancelled purchases är NOT en error i vår mening — Apple's
    // SDK kastar med userCancelled=true. Hantera tyst.
    const e = err as { userCancelled?: boolean; message?: string };
    if (e?.userCancelled) {
      return { kind: 'cancelled' };
    }
    return { kind: 'error', reason: e?.message ?? 'unknown_purchase_error' };
  }
}

/**
 * "Restore Purchases" — App Store krav. Användare som installerade om
 * appen / bytte device kan återställa tidigare köpta non-consumables +
 * aktiva subscriptions via en knapp i Store-skärmen.
 *
 * Consumable credits återställs INTE via denna (förbrukad ⇒ förbrukad).
 */
export async function restorePurchases(): Promise<
  { kind: 'success'; customerInfo: CustomerInfo } | { kind: 'error'; reason: string }
> {
  if (!configured) {
    return { kind: 'error', reason: 'iap_not_configured' };
  }
  try {
    const customerInfo = await Purchases.restorePurchases();
    return { kind: 'success', customerInfo };
  } catch (err: unknown) {
    const e = err as { message?: string };
    return { kind: 'error', reason: e?.message ?? 'unknown_restore_error' };
  }
}

/**
 * Snapshot av user:s nuvarande entitlements + purchase-history. Anropas
 * vid app-start och efter login/logout för att sync:a lokala flagor med
 * RC-state.
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!configured) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch (err) {
    console.warn('[iap] getCustomerInfo failed:', err);
    return null;
  }
}

/**
 * Listener för entitlement-uppdateringar — fyrar när subscriptions
 * renewar/expirar, eller när bakgrunden-sync upptäcker en transaction.
 * Använd för att hålla lokala flagor synkade utan att poll:a aktivt.
 *
 * Returnerar en cleanup-funktion för useEffect.
 */
export function addCustomerInfoListener(
  callback: (info: CustomerInfo) => void,
): () => void {
  if (!configured) return () => {};
  Purchases.addCustomerInfoUpdateListener(callback);
  return () => {
    Purchases.removeCustomerInfoUpdateListener(callback);
  };
}

/**
 * Helper — kollar om en specifik entitlement är aktiv just nu i den
 * passerade customerInfo. Använder activeEntitlements (inkluderar både
 * subscriptions och non-consumables; expired är borta).
 */
export function hasEntitlement(
  info: CustomerInfo | null,
  key: EntitlementKey,
): boolean {
  if (!info) return false;
  return info.entitlements.active[key] !== undefined;
}

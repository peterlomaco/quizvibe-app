// Premium-state — appens ENDA läskälla för "har user Premium just nu".
//
// Alla 7 gates i appen (Max 12 players, 20 rundor, obegränsade host-
// credits, PREMIUM/Unlimited-pillen, Extra Host packages) går genom
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
// Båda lagren är per KONTO sedan Build 41 (nyckeln bär Supabase-UUID), så en
// flagga från ett annat konto på samma telefon läses aldrig.

import { hasActiveFreePremium } from './promoPremium';
import { currentAuthEpoch, getUserScope, scopedStorage, userKey } from './storageScope';

// Build 41: den betalda flaggan lagras per konto (project ref + UUID). Utan
// registrerad session finns ingen nyckel → lager 1 är alltid false.
async function resolvePaidKey(): Promise<string | null> {
  try {
    const scope = await getUserScope();
    return scope ? userKey(scope.uid, 'hasPremium') : null;
  } catch {
    return null;
  }
}

// ── Synkron spegel ──────────────────────────────────────────────────────
//
// Senast kända premium-status, läsbar UTAN await. Samma mönster (och samma
// skäl) som profileStorage:s `getCachedProfile`.
//
// Varför: skärmar seedar sitt `hasPremium`-state vid mount och fyller det
// först när den async läsningen nedan resolvar. Med `useState(false)` som
// startvärde renderade en Premium-host därför en hel frame av LÅST läge —
// Peter såg credits-pillen visa grå PREMIUM-badge + "Free: 4" och sedan
// hoppa till guld + "Unlimited" när han öppnade en lobby direkt efter köp
// (2026-08-13). Spegeln gör att första framen redan är rätt.
//
// `undefined` = ännu inte utvärderad. Call-sites ska då falla tillbaka på
// `false` (fail-closed, låst är rätt default) och låta den async läsningen
// korrigera — det är bara vid en genuint kall start spegeln är tom.
let cachedPremium: boolean | undefined = undefined;

/** Senast kända premium-status, synkront. `undefined` = ej utvärderad än. */
export function getCachedPremium(): boolean | undefined {
  return cachedPremium;
}

/**
 * True om användaren har Premium just nu — via betald prenumeration ELLER
 * via en pågående gratismånad från launch-kampanjen. Fail-closed:
 * returnerar false vid storage-error, så locked-state är default.
 *
 * Uppdaterar alltid den synkrona spegeln, så varje anrop gör nästa skärm-
 * mount snabbare.
 */
export async function hasPremiumSubscription(): Promise<boolean> {
  // Kontobyte medan läsningen pågick: förra kontots svar får aldrig hamna i
  // spegeln (Build 41). Räkna om tills epoken är stabil (max 3 försök).
  for (let attempt = 0; attempt < 3; attempt++) {
    const epoch = currentAuthEpoch();
    const result = await computePremium();
    if (epoch === currentAuthEpoch()) {
      cachedPremium = result;
      return result;
    }
  }
  cachedPremium = undefined;
  return false;
}

async function computePremium(): Promise<boolean> {
  try {
    // Lager 1 — betald entitlement (speglad från RevenueCat av _layout).
    const key = await resolvePaidKey();
    const value = key ? await scopedStorage.getItem(key) : null;
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
 * Räknar om den synkrona spegeln. Anropas efter en ändring som INTE går via
 * setPremiumActive — i praktiken kampanjens gratismånad, som lever i sin
 * egen nyckel (se promoPremium) och annars inte skulle synas förrän nästa
 * skärm hann göra sin async läsning.
 */
export async function refreshPremiumMirror(): Promise<void> {
  await hasPremiumSubscription();
}

/**
 * Markerar Premium-prenumerationen som aktiv. Idempotent. Anropas av
 * StoreScreen.handleBuySubscription efter köp + av RevenueCats customer-
 * info-listener i app/_layout.tsx.
 */
export async function setPremiumActive(active: boolean): Promise<void> {
  try {
    const key = await resolvePaidKey();
    if (key) await scopedStorage.setItem(key, active ? 'true' : 'false');
  } catch (err) {
    console.warn('[subscriptionStorage] setPremiumActive failed:', err);
  }
  // `false` betyder INTE nödvändigtvis "ingen premium" — kampanjens
  // gratismånad kan vara igång i lager 2. Räkna därför alltid om spegeln
  // via båda lagren i stället för att spegla argumentet rakt av.
  await refreshPremiumMirror();
}

/**
 * Rensa subscription-flaggan helt (vid nyregistrering, dev-reset, etc.).
 */
export async function clearPremiumSubscription(): Promise<void> {
  try {
    const key = await resolvePaidKey();
    if (key) await scopedStorage.removeItem(key);
  } catch (err) {
    console.warn('[subscriptionStorage] clearPremiumSubscription failed:', err);
  }
  await refreshPremiumMirror();
}

// Värm spegeln vid app-start så första skärmen som seedar från den har rätt
// läge. Fire-and-forget — misslyckas den står spegeln kvar på `undefined`
// och call-sites faller tillbaka på sin async läsning som förut.
void hasPremiumSubscription();

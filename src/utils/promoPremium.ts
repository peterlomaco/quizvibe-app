// ─────────────────────────────────────────────────────────────────────
// Free Premium launch promo — QuizVibe bjuder på Premium under lansering.
//
// TVÅ OBEROENDE KLOCKOR. Att hålla isär dem ÄR hela designen:
//
//   1. OFFER WINDOW (global) — om erbjudandet över huvud taget visas i
//      Store och om en ny claim/förnyelse får göras. Styrs av Peter via
//      Supabase-raden `app_config.free_premium_promo` (migration 0035),
//      med OFFER_BACKSTOP_UNTIL som bakad hård gräns för enheter som
//      aldrig når Supabase. Att stänga erbjudandet kräver alltså INGEN
//      App Store-release.
//
//   2. CLAIM (per enhet) — EN användares gratismånad. Startar när de
//      trycker "Free" i Store, tar slut en kalendermånad senare. Vill de
//      fortsätta går de tillbaka till Store och trycker "Free" igen.
//      Ingen gräns för antal förnyelser så länge offer window är öppet.
//
// `hasActiveFreePremium` läser MEDVETET bara klocka 2. Det är det som
// "grandfathar" en pågående månad förbi erbjudandets slut: stänger Peter
// erbjudandet mitt i någons månad så byter Store till 79 kr-kortet för
// alla, men den som redan har en månad igång behåller Premium tills
// DERAS månad tar slut — de kan bara inte förnya. Ingen blir av med
// något de blivit lovade.
//
// ⚠ Promon skriver ALDRIG in sig i subscriptionStorage:s
// `@quizvibe/subscription/hasPremium/v1`. Den nyckeln ÄGS av
// app/_layout.tsx, som skriver `hasEntitlement(...)` vid varje app-start
// OCH vid varje RevenueCat customer-info-ändring — utan RC konfigurerad
// (ingen key, Expo Go) blir den skrivningen `false`. En promo som
// persisterade `true` dit skulle alltså raderas vid nästa start. Därför
// utvärderas promon vid LÄSNING i hasPremiumSubscription() i stället.
// ─────────────────────────────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// ─── Offer window (klocka 1) ──────────────────────────────────────────

/**
 * Bakad bortre gräns för erbjudandet. Detta är BARA ett skyddsnät för en
 * enhet som aldrig lyckats läsa `app_config` — det verkliga slutdatumet
 * bor i Supabase-raden och kan flyttas när som helst utan ny build. Sätt
 * det därför generöst: App Store-lanseringsdatumet är inte spikat, och
 * det vore värre att promon dör i förtid för offline-enheter än att den
 * ligger kvar några extra veckor i ett kant-fall.
 */
export const OFFER_BACKSTOP_UNTIL = '2026-12-31T23:59:59+01:00';

/** Konfig-nyckeln i `app_config`-tabellen (migration 0035). */
const OFFER_CONFIG_KEY = 'free_premium_promo';

/** Cache av senast hämtade remote-konfig. Överlever app-omstarter. */
const OFFER_CACHE_KEY = '@quizvibe/promo/offerConfig/v1';

/** Tidsstämpel (ISO) för när användaren senast tryckte "Free". */
const CLAIM_KEY = '@quizvibe/promo/freePremiumClaimedAt/v1';

/** Gratismånadens längd. En kalendermånad — se addMonthsClamped. */
export const FREE_PREMIUM_CLAIM_MONTHS = 1;

interface OfferConfig {
  enabled: boolean;
  until: string;
}

function parseOfferConfig(raw: unknown): OfferConfig | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as { enabled?: unknown; until?: unknown };
  if (typeof value.enabled !== 'boolean' || typeof value.until !== 'string') {
    return null;
  }
  // Ogiltigt datum → behandla hela raden som trasig hellre än att räkna
  // med NaN (som gör alla jämförelser false = erbjudandet tyst stängt).
  if (Number.isNaN(new Date(value.until).getTime())) return null;
  return { enabled: value.enabled, until: value.until };
}

/**
 * Hämtar `free_premium_promo` från Supabase och cachar den lokalt.
 *
 * ENDA funktionen i modulen som rör nätverket — alla läsvägar nedan är
 * rena AsyncStorage-läsningar så de är säkra att anropa från hot paths
 * (hasPremiumSubscription körs vid varje lobby-fokus).
 *
 * Best-effort: vid nätverksfel/trasig payload lämnas den tidigare cachen
 * orörd så en offline-start behåller senast kända läge.
 *
 * Anropas från app/_layout.tsx vid app-start.
 */
export async function refreshOfferConfig(): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', OFFER_CONFIG_KEY)
      .maybeSingle();

    if (error) {
      // Kolumn/tabell saknas (migration 0035 ej körd) eller nätverksfel —
      // båda är icke-fatala, vi faller tillbaka på cache/backstop.
      console.warn('[promoPremium] refreshOfferConfig failed:', error.message);
      return;
    }
    const parsed = parseOfferConfig(data?.value);
    if (!parsed) return;
    await AsyncStorage.setItem(OFFER_CACHE_KEY, JSON.stringify(parsed));
  } catch (err) {
    console.warn('[promoPremium] refreshOfferConfig failed:', err);
  }
}

async function readOfferConfig(): Promise<OfferConfig | null> {
  try {
    const raw = await AsyncStorage.getItem(OFFER_CACHE_KEY);
    if (!raw) return null;
    return parseOfferConfig(JSON.parse(raw));
  } catch (err) {
    console.warn('[promoPremium] readOfferConfig failed:', err);
    return null;
  }
}

/**
 * True om erbjudandet är öppet — dvs. om Store ska visa Free-kortet och
 * en ny claim/förnyelse får göras.
 *
 * Cachad remote-konfig vinner när den någonsin hämtats; annars gäller
 * OFFER_BACKSTOP_UNTIL. `enabled: false` stänger omedelbart oavsett datum.
 */
export async function isOfferWindowOpen(): Promise<boolean> {
  const config = await readOfferConfig();
  if (config) {
    if (!config.enabled) return false;
    return Date.now() < new Date(config.until).getTime();
  }
  return Date.now() < new Date(OFFER_BACKSTOP_UNTIL).getTime();
}

// ─── Claim (klocka 2) ─────────────────────────────────────────────────

/**
 * Lägger till N kalendermånader och klampar dagen mot målmånadens längd,
 * så "en månad" betyder samma datum nästa månad (31 jan → 28 feb, inte
 * 3 mars som naiv setMonth ger). Matchar formuleringen "Single month".
 */
function addMonthsClamped(from: Date, months: number): Date {
  const result = new Date(from.getTime());
  const targetDay = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const daysInTargetMonth = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0,
  ).getDate();
  result.setDate(Math.min(targetDay, daysInTargetMonth));
  return result;
}

/**
 * Startar (eller förnyar) gratismånaden. Förnyelse är samma anrop — den
 * skriver bara över tidsstämpeln, så månaden räknas om från nu.
 *
 * Anropas ENBART från Store:s Free-knapp, som i sin tur bara är tappbar
 * när canClaimFreePremium() är true.
 */
export async function claimFreePremium(): Promise<void> {
  try {
    await AsyncStorage.setItem(CLAIM_KEY, new Date().toISOString());
  } catch (err) {
    console.warn('[promoPremium] claimFreePremium failed:', err);
  }
}

/**
 * När den nuvarande gratismånaden tar slut, eller null om användaren
 * aldrig tryckt "Free".
 */
export async function getFreePremiumExpiry(): Promise<Date | null> {
  try {
    const raw = await AsyncStorage.getItem(CLAIM_KEY);
    if (!raw) return null;
    const claimedAt = new Date(raw);
    if (Number.isNaN(claimedAt.getTime())) return null;
    return addMonthsClamped(claimedAt, FREE_PREMIUM_CLAIM_MONTHS);
  } catch (err) {
    console.warn('[promoPremium] getFreePremiumExpiry failed:', err);
    return null;
  }
}

/**
 * True om en gratismånad är igång just nu.
 *
 * MEDVETET oberoende av offer window — se grandfathering-resonemanget i
 * filhuvudet. Detta är funktionen subscriptionStorage.hasPremiumSubscription
 * faller tillbaka på, och därmed det som låser upp Max 12 players, 20
 * rundor, obegränsade host-credits och Extra Host packages.
 */
export async function hasActiveFreePremium(): Promise<boolean> {
  const expiry = await getFreePremiumExpiry();
  if (!expiry) return false;
  return Date.now() < expiry.getTime();
}

/**
 * True om Free-knappen ska vara tappbar: erbjudandet är öppet OCH ingen
 * månad är redan igång. Under en pågående månad visar Store i stället en
 * grön ACTIVE-pill utan knapp — man kan inte starta om månaden i förtid.
 */
export async function canClaimFreePremium(): Promise<boolean> {
  if (await hasActiveFreePremium()) return false;
  return isOfferWindowOpen();
}

// ─── Display ──────────────────────────────────────────────────────────

/**
 * "9 September 2026". Europe/Stockholm för att matcha appens övriga
 * CET-konvention (jfr todayCETDate i profileStorage).
 */
export function formatPromoDate(date: Date): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Europe/Stockholm',
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

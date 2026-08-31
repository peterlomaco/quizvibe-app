// ─────────────────────────────────────────────────────────────────────
// Free Premium launch promo + vouchers — QuizVibe bjuder på Premium under
// lansering, och Peter kan dela ut individuella voucher-koder för fler
// månader.
//
// TVÅ OBEROENDE KLOCKOR. Att hålla isär dem ÄR hela designen:
//
//   1. OFFER WINDOW (global) — om erbjudandet över huvud taget visas i
//      Store. Styrs av Peter via Supabase-raden
//      `app_config.free_premium_promo` (migration 0035), med
//      OFFER_BACKSTOP_UNTIL som bakad hård gräns för enheter som aldrig
//      når Supabase. Att stänga erbjudandet kräver INGEN App Store-release.
//
//   2. GRANT (per KONTO, SERVER-side) — en beviljad Premium-månad, gratis
//      eller via voucher. Bor i Supabase-tabellen `premium_grants`
//      (migration 0047) och speglas lokalt i MIRROR_KEY för synkron-vänlig
//      läsning. Gratismånaden gäller EXAKT en gång per registrerad profil
//      (unikt index server-side); vouchers är individuella engångskoder.
//      REGEL (Peter): en månad kan bara aktiveras när INGEN premium är
//      aktiv — servern avvisar annars med 'already_active'. Ingen stapling.
//
// `hasActiveFreePremium` läser MEDVETET bara klocka 2. Det "grandfathar" en
// pågående månad förbi erbjudandets slut: stänger Peter erbjudandet mitt i
// någons månad byter Store till 79 kr-kortet för alla, men den som redan
// har en månad igång behåller Premium tills DEN tar slut.
//
// ⚠ Promon skriver ALDRIG in sig i subscriptionStorage:s
// `@quizvibe/subscription/hasPremium/v1`. Den nyckeln ÄGS av
// app/_layout.tsx (RevenueCat-spegeln) och skulle wipa en promo-`true`.
// Därför utvärderas grants vid LÄSNING i hasPremiumSubscription() i stället.
//
// ⚠ Server-cutover (2026): gratismånaden var tidigare en device-lokal claim
// (CLAIM_KEY v2) med obegränsade förnyelser. Den modellen är BORTA. Gamla
// v2-poster migreras INTE — vid lansering är server-tabellen tom, så en
// pre-cutover lokal claim ignoreras och kontot behandlas som berättigat
// (medvetet, minimalt med riktiga users innan launch).
// ─────────────────────────────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCachedProfile, loadProfile } from './profileStorage';
import { supabase } from './supabase';

// ─── Offer window + paid-flagga (klocka 1 / remote-config) ────────────

/**
 * Bakad bortre gräns för erbjudandet. BARA ett skyddsnät för en enhet som
 * aldrig lyckats läsa `app_config` — det verkliga slutdatumet bor i Supabase
 * och kan flyttas utan ny build. Sätt det generöst.
 */
export const OFFER_BACKSTOP_UNTIL = '2026-12-31T23:59:59+01:00';

/** Konfig-nyckeln i `app_config`-tabellen (migration 0035). */
const OFFER_CONFIG_KEY = 'free_premium_promo';

/** Feature-flagga för det betalda abonnemanget (migration 0047). Default av. */
const PAID_CONFIG_KEY = 'paid_subscription';

/** Cache av senast hämtade remote-konfig. Överlever app-omstarter. */
const OFFER_CACHE_KEY = '@quizvibe/promo/offerConfig/v1';
const PAID_CACHE_KEY = '@quizvibe/promo/paidConfig/v1';

/**
 * Lokal spegel av kontots server-grant: `{ premiumUntil, freeMonthUsed, owner }`.
 *
 * ⚠ `owner` (= playerName, lowercased) är inte kosmetik. AsyncStorage är per
 * ENHET, medan granten tillhör ett KONTO. Utan ägarstämpeln skulle konto B på
 * samma telefon läsa konto A:s speglade grant. Vid ägar-mismatch behandlas
 * spegeln som frånvarande tills refreshPromoGrants körts för rätt konto.
 */
const MIRROR_KEY = '@quizvibe/promo/premiumGrant/v3';

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
  // Ogiltigt datum → behandla raden som trasig hellre än att räkna med NaN.
  if (Number.isNaN(new Date(value.until).getTime())) return null;
  return { enabled: value.enabled, until: value.until };
}

function parsePaidEnabled(raw: unknown): boolean | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as { enabled?: unknown };
  if (typeof value.enabled !== 'boolean') return null;
  return value.enabled;
}

/**
 * Hämtar remote-config (offer window + paid-flagga) från Supabase och cachar
 * lokalt. ENDA offer-config-funktionen som rör nätverket — läsvägarna nedan
 * är rena AsyncStorage-läsningar.
 *
 * Best-effort: vid nätverksfel/trasig payload lämnas tidigare cache orörd.
 * Anropas från app/_layout.tsx vid app-start.
 */
export async function refreshOfferConfig(): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('key,value')
      .in('key', [OFFER_CONFIG_KEY, PAID_CONFIG_KEY]);

    if (error) {
      // Tabell saknas (migration ej körd) eller nätverksfel — icke-fatalt.
      console.warn('[promoPremium] refreshOfferConfig failed:', error.message);
      return;
    }
    for (const row of data ?? []) {
      if (row.key === OFFER_CONFIG_KEY) {
        const parsed = parseOfferConfig(row.value);
        if (parsed) await AsyncStorage.setItem(OFFER_CACHE_KEY, JSON.stringify(parsed));
      } else if (row.key === PAID_CONFIG_KEY) {
        const enabled = parsePaidEnabled(row.value);
        if (enabled !== null) {
          await AsyncStorage.setItem(PAID_CACHE_KEY, JSON.stringify({ enabled }));
        }
      }
    }
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
 * True om erbjudandet är öppet — dvs. om Store ska visa Free-kortet och en ny
 * gratismånad får aktiveras. Cachad remote-konfig vinner när den någonsin
 * hämtats; annars gäller OFFER_BACKSTOP_UNTIL. `enabled: false` stänger direkt.
 */
export async function isOfferWindowOpen(): Promise<boolean> {
  const config = await readOfferConfig();
  if (config) {
    if (!config.enabled) return false;
    return Date.now() < new Date(config.until).getTime();
  }
  return Date.now() < new Date(OFFER_BACKSTOP_UNTIL).getTime();
}

/**
 * True om det betalda 79 kr-abonnemanget ska visas i Store. Default FALSE (av
 * i v1) tills Peter sätter `paid_subscription.enabled=true` i app_config OCH
 * pkg_sub_monthly-IAP:n är live i App Store Connect.
 */
export async function isPaidSubscriptionEnabled(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(PAID_CACHE_KEY);
    if (!raw) return false;
    return parsePaidEnabled(JSON.parse(raw)) === true;
  } catch (err) {
    console.warn('[promoPremium] isPaidSubscriptionEnabled failed:', err);
    return false;
  }
}

// ─── Grant (klocka 2, server-backed) ──────────────────────────────────

interface GrantMirror {
  /** ISO-tidsstämpel då den aktiva månaden tar slut, eller null. */
  premiumUntil: string | null;
  /** Har kontot någonsin förbrukat sin gratismånad? */
  freeMonthUsed: boolean;
  /** playerName (lowercased) på kontot spegeln gäller. */
  owner: string;
}

function parseGrantMirror(raw: string | null): GrantMirror | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as {
      premiumUntil?: unknown;
      freeMonthUsed?: unknown;
      owner?: unknown;
    };
    if (!p || typeof p !== 'object') return null;
    if (typeof p.owner !== 'string' || !p.owner) return null;
    if (typeof p.freeMonthUsed !== 'boolean') return null;
    if (p.premiumUntil !== null && typeof p.premiumUntil !== 'string') return null;
    return {
      premiumUntil: p.premiumUntil ?? null,
      freeMonthUsed: p.freeMonthUsed,
      owner: p.owner,
    };
  } catch {
    return null;
  }
}

/**
 * Inloggat playerName (lowercased), eller null om ingen är inloggad. Läser i
 * första hand den SYNKRONA profil-spegeln; `undefined` (cold start) → betala
 * för loadProfile(). `undefined` får ALDRIG tolkas som utloggad.
 */
async function resolveCurrentOwner(): Promise<string | null> {
  const cached = getCachedProfile();
  const profile = cached === undefined ? await loadProfile() : cached;
  const name = profile?.playerName?.trim();
  return name ? name.toLowerCase() : null;
}

/** Spegeln, men bara om den tillhör det INLOGGADE kontot. Annars null. */
async function readOwnedMirror(): Promise<GrantMirror | null> {
  try {
    const mirror = parseGrantMirror(await AsyncStorage.getItem(MIRROR_KEY));
    if (!mirror) return null;
    const owner = await resolveCurrentOwner();
    if (!owner || mirror.owner !== owner) return null;
    return mirror;
  } catch (err) {
    console.warn('[promoPremium] readOwnedMirror failed:', err);
    return null;
  }
}

/**
 * Hämtar kontots grant-status från servern och skriver den lokala spegeln.
 * Anropas vid app-start, vid SIGNED_IN, och efter claim/redeem.
 *
 * Best-effort + no-op om ingen är inloggad (granten hör till ett konto).
 * Vid nätverksfel lämnas tidigare spegel orörd (fail-open).
 */
export async function refreshPromoGrants(): Promise<void> {
  const owner = await resolveCurrentOwner();
  if (!owner) return;
  try {
    const { data, error } = await supabase.rpc('get_promo_premium_status');
    if (error) {
      console.warn('[promoPremium] refreshPromoGrants failed:', error.message);
      return;
    }
    const row = (data ?? {}) as { premium_until?: unknown; free_month_used?: unknown };
    const mirror: GrantMirror = {
      premiumUntil: typeof row.premium_until === 'string' ? row.premium_until : null,
      freeMonthUsed: row.free_month_used === true,
      owner,
    };
    await AsyncStorage.setItem(MIRROR_KEY, JSON.stringify(mirror));
  } catch (err) {
    console.warn('[promoPremium] refreshPromoGrants failed:', err);
  }
}

/**
 * True om en promo-/voucher-månad är igång just nu (reflekterar BÅDA källorna).
 *
 * MEDVETET oberoende av offer window — grandfathering. Detta är funktionen
 * subscriptionStorage.hasPremiumSubscription faller tillbaka på, och därmed
 * det som låser upp Max 12 players, 20 rundor, obegränsade host-credits och
 * Extra Host packages.
 */
export async function hasActiveFreePremium(): Promise<boolean> {
  const mirror = await readOwnedMirror();
  if (!mirror?.premiumUntil) return false;
  const t = new Date(mirror.premiumUntil).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() < t;
}

/** När den aktiva månaden tar slut, eller null om ingen är igång. */
export async function getFreePremiumExpiry(): Promise<Date | null> {
  const mirror = await readOwnedMirror();
  if (!mirror?.premiumUntil) return null;
  const d = new Date(mirror.premiumUntil);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Har kontot redan förbrukat sin engångs-gratismånad? Driver gray-out. */
export async function getFreeMonthUsed(): Promise<boolean> {
  const mirror = await readOwnedMirror();
  return mirror?.freeMonthUsed ?? false;
}

// ── Claim / redeem-resultat ──────────────────────────────────────────
//
// Fel-reason speglar RPC:ns raise-token. Anroparen (StoreScreen) mappar den
// till Alert-copy. Efter framgång uppdaterar funktionerna PROMO-spegeln; det
// är anroparens ansvar att därefter köra refreshPremiumMirror() (undviker
// cirkulär import mot subscriptionStorage).

export type ClaimReason =
  | 'not_authenticated'
  | 'not_registered'
  | 'already_active'
  | 'already_used'
  | 'error';

export type ClaimResult = { ok: true; until: Date } | { ok: false; reason: ClaimReason };

export type RedeemReason =
  | 'not_authenticated'
  | 'not_registered'
  | 'already_active'
  | 'invalid_code'
  | 'already_redeemed'
  | 'expired'
  | 'error';

export type RedeemResult = { ok: true; until: Date } | { ok: false; reason: RedeemReason };

function mapReason<T extends string>(message: string | undefined, known: readonly T[]): T | 'error' {
  const m = (message ?? '').toLowerCase();
  for (const reason of known) {
    if (m.includes(reason)) return reason;
  }
  return 'error';
}

const CLAIM_REASONS = [
  'not_authenticated',
  'not_registered',
  'already_active',
  'already_used',
] as const;

const REDEEM_REASONS = [
  'not_authenticated',
  'not_registered',
  'already_active',
  'invalid_code',
  'already_redeemed',
  'expired',
] as const;

/**
 * Aktiverar kontots engångs-gratismånad via servern. En månad kan bara
 * aktiveras när ingen premium är aktiv (server avvisar 'already_active') och
 * bara en gång per konto ('already_used').
 */
export async function claimFreeMonth(): Promise<ClaimResult> {
  try {
    const { data, error } = await supabase.rpc('claim_free_month');
    if (error) return { ok: false, reason: mapReason(error.message, CLAIM_REASONS) };
    const until = data ? new Date(data as string) : null;
    if (!until || Number.isNaN(until.getTime())) return { ok: false, reason: 'error' };
    await refreshPromoGrants();
    return { ok: true, until };
  } catch (err) {
    console.warn('[promoPremium] claimFreeMonth failed:', err);
    return { ok: false, reason: 'error' };
  }
}

/**
 * Löser in en voucher-kod för en extra månad. Koden förbrukas server-side
 * (engångs). Blockeras när premium redan är aktiv ('already_active').
 */
export async function redeemVoucher(code: string): Promise<RedeemResult> {
  const trimmed = code.trim();
  if (!trimmed) return { ok: false, reason: 'invalid_code' };
  try {
    const { data, error } = await supabase.rpc('redeem_voucher', { p_code: trimmed });
    if (error) return { ok: false, reason: mapReason(error.message, REDEEM_REASONS) };
    const until = data ? new Date(data as string) : null;
    if (!until || Number.isNaN(until.getTime())) return { ok: false, reason: 'error' };
    await refreshPromoGrants();
    return { ok: true, until };
  } catch (err) {
    console.warn('[promoPremium] redeemVoucher failed:', err);
    return { ok: false, reason: 'error' };
  }
}

// ─── Display ──────────────────────────────────────────────────────────

/** "9 September 2026". Europe/Stockholm för att matcha appens CET-konvention. */
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

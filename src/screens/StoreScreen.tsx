import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Pressable } from '@/src/components/haptic';
import type { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { TopUserBanner } from '../components/TopUserBanner';
import {
  CREDIT_PRODUCT_AMOUNTS,
  ENTITLEMENTS,
  hasEntitlement,
  loadOfferings,
  purchasePackage,
  restorePurchases,
} from '../lib/iap';
import { Colors, FontSize, FontWeight, Radius, Spacing, Typography } from '../theme';
import { track } from '../utils/analytics';
import { loadProfile, saveProfile } from '../utils/profileStorage';
import {
  claimFreeMonth,
  formatPromoDate,
  getFreeMonthUsed,
  getFreePremiumExpiry,
  hasActiveFreePremium,
  isOfferWindowOpen,
  isPaidSubscriptionEnabled,
  redeemVoucher,
  refreshPromoGrants,
} from '../utils/promoPremium';
import {
  hasPremiumSubscription,
  refreshPremiumMirror,
  setPremiumActive,
} from '../utils/subscriptionStorage';

// Extra bottenmarginal mellan det fokuserade voucher-fältet och tangentbordet
// (läggs ovanpå iOS automatiska keyboard-inset). ~24pt = luftigt utan att
// tvinga onödig scroll.
const KEYBOARD_MARGIN = 48;

// ─── Tier-data ────────────────────────────────────────────────────────────────
// Tier-konstanter mappar mot App Store Connect-products via `productId`.
// Vid mount laddar vi RC-offering:n och letar upp varje tier:s package via
// productId — då får vi `localizedPriceString` från Apple (lokal valuta +
// region-anpassat pris) som visas istället för hardcoded fallback-priserna.
//
// `price` + `priceAmount` är fallback-värden som visas (a) i dev-läge utan
// RC-key, (b) under första render innan offerings hunnit ladda, (c) om
// offering-load failar (network, RC misconfig). Synk med ASC-priserna så
// fallback alltid är realistisk.

interface CreditTier {
  id: string;
  productId: string;       // App Store Connect product ID (för RC-lookup)
  games: number;
  price: string;           // fallback-display ("19 kr")
  priceAmount: number;     // för analytics
  pricePerGame: string;
  badge?: string;
  savePct?: number;
}

// Engångsköpta Host Game Credits BORTTAGNA ur V1 (2026-07-07) — enda köpet
// är Premium-abonnemanget. Tom array döljer hela Credit packages-sektionen
// (creditsSection → null, samma parkerings-mönster som PACKAGE_TIERS).
// CreditTierCard + handleBuyCredits finns kvar som död kod för ev. framtida
// re-aktivering; tidigare tiers: 5/19kr, 10/29kr, 20/49kr (pkg_credits_5/10/20).
const CREDIT_TIERS: CreditTier[] = [];

// Customized Host Packages — extra-content som hosten kan köpa per styck.
// IDn matchar `PURCHASED_PACKAGES` i `src/utils/mockPurchasedPackages.ts`
// så Profile/Lobby refererar till samma paket. Priser hardcodade tills IAP
// är kopplad. Ikon-emoji väljs så raden känns igen visuellt.
interface PackageTier {
  id: string;
  name: string;
  icon: string;
  description: string;
  price: string;
  priceAmount: number;
}

const PACKAGE_TIERS: PackageTier[] = [];

interface SubscriptionTier {
  id: string;
  productId: string;         // App Store Connect product ID (för RC-lookup)
  label: string;             // "Monthly subscription", "3 months", etc.
  price: string;             // fallback-display
  priceAmount: number;       // för analytics
  pricePerMonth: string;     // "79 kr / month" eller "~66 kr / month"
  badge?: string;
  savePct?: number;
}

const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'sub-1mth',
    productId: 'pkg_sub_monthly',
    label: 'Monthly subscription',
    price: '79 kr',
    priceAmount: 79,
    pricePerMonth: '79 kr / month',
  },
];

interface SubscriptionFeature {
  premium: string;
  basic: string;
}

/**
 * ⚠ ORDAGRANN SPEGEL av `PREMIUM_FEATURES` i [app/index.tsx](app/index.tsx)
 * (Home:ns "QuizVibe user vs Guest"-info-modal renderar samma strängar i
 * samma kort-layout). Ändra ALLTID båda.
 */
const SUBSCRIPTION_FEATURES: SubscriptionFeature[] = [
  { premium: 'Host Game Credits Unlimited', basic: '4 games per day' },
  { premium: '20 rounds per game (Individual device)', basic: 'Max 4 rounds per game' },
  { premium: 'Invite 12 players per game (Individual device)', basic: 'Max 4 players' },
  { premium: 'All Extra Host packages included', basic: 'Generic content only' },
];

// Peters copy (2026): en promo-/voucher-månad kan bara aktiveras när INGEN
// premium är aktiv. Server avvisar annars med 'already_active'; klienten visar
// detta. Delas av gratismånads-claim och voucher-inlösen.
const ALREADY_ACTIVE_MESSAGE =
  "You already have an active subscription. You can only activate a free month when you don't have any active subscription.";

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function StoreScreen() {
  // `?focus=…` styr render-ordning. Lägen + default:
  //   • subscription — Subscriptions överst, sedan Basic → Packages → Credits.
  //     Sätts av PREMIUM-tap på Individual Devices och Rounds-rulern (båda
  //     subscription-gated features), Host Game Credits-pillen och "Out of
  //     Host Game Credits"-popupen. Individual Devices unlock:ar implicit
  //     12-spelar-cap via gameMode-deriverad maxPlayers sedan 2026-05-25.
  //   • credits (LEGACY 2026-07-07) — engångsköpta credits borttagna;
  //     ev. kvarvarande/stale credits-deeplinks mappas till subscription.
  //   • packages / packages-only (LEGACY 2026-07-07) — paket säljs inte
  //     styckvis längre (Extra packages ingår i Premium-abonnemanget);
  //     stale packages-deeplinks mappas också till subscription.
  //   • default (utan param) — Basic → Credits → Packages → Subscriptions.
  const { focus, from, fromCode } = useLocalSearchParams<{
    focus?: string;
    from?: string;
    fromCode?: string;
  }>();
  const focusMode: 'subscription' | 'default' =
    focus === 'credits' || focus === 'packages' || focus === 'packages-only' || focus === 'subscription'
      ? 'subscription'
      : 'default';

  const router = useRouter();
  // Back-knappens beteende: föredra router.back() när vi har navigation-
  // history. Det returnerar till den BEFINTLIGA föregående-screen-instansen
  // (Lobby:s React-state + Supabase Realtime-channels intakta) istället för
  // att router.replace skulle skapa en ny /lobby-instans ovanpå den gamla,
  // remounta LobbyScreen och racea med Realtime-channel-cleanup → krash
  // "cannot add postgres_changes callbacks after subscribe()".
  //
  // Fallback med `from`-paramen används bara när router.canGoBack() är false
  // (typiskt vid deep-link direkt in till Store utan föregående screen). Då
  // rekonstruerar vi /lobby?code=<fromCode>&isHost=true så Lobby:s polling
  // har rätt kontext (annars triggar "Lobby deleted by Host"-popupen).
  // Lobby-Store-länkar är alltid host-actions så isHost: 'true' är säkert.
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (from === '/lobby' && fromCode) {
      router.replace({
        pathname: '/lobby',
        params: { code: fromCode, isHost: 'true' },
      });
      return;
    }
    if (from && typeof from === 'string') {
      router.replace(from as any);
      return;
    }
    router.replace('/');
  };

  // Success-popup-copy + nav efter köp. Vid besök från lobby:n vill vi
  // signalera "tillbaka till spelet" och navigera direkt; annars visar vi
  // produktspecifik bekräftelse och ger användaren möjlighet att fortsätta
  // shoppa eller gå tillbaka.
  const fromLobby = from === '/lobby';
  const successCopy = (defaultBody: string) =>
    fromLobby
      ? { title: 'Successfully added to your account', body: 'Back to game' }
      : { title: 'Purchase successful', body: defaultBody };

  // ─── RevenueCat offerings + purchase state ────────────────────────────
  // offering laddas vid mount via useEffect nedan. När laddat används
  // RC:s localizedPriceString (region-anpassat pris från App Store) istället
  // för hardcoded fallback-värden i CREDIT_TIERS/SUBSCRIPTION_TIERS.
  //
  // purchasing-state håller tier:s id under pågående purchase så vi kan
  // dimma + disable knappen + visa spinner. Också blockar andra Buy-knappar
  // så user inte kan trigga parallella purchases samtidigt.
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadOfferings().then((current) => {
      if (!cancelled) setOffering(current);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Free Premium launch promo + vouchers ─────────────────────────────
  // Klockor/flaggor (se src/utils/promoPremium.ts):
  //   offerOpen     — erbjudandet är öppet ⇒ visa Free-kortet. Styrs av Peter.
  //   claimActive   — kontots gratis-/voucher-månad är igång ⇒ ACTIVE-pill.
  //   freeMonthUsed — kontot har förbrukat sin engångs-gratismånad (server)
  //                   ⇒ grå "Used"-knapp; voucher blir vägen till fler månader.
  //   paidEnabled   — feature-flaggan för 79 kr-kortet. Default AV i v1.
  //   premiumActive — hasPremiumSubscription() (paid ELLER promo). Behövs för
  //                   "already active"-blocket. MEDVETEN, snäv avvikelse från
  //                   "Store läser inte hasPremiumSubscription" — vi visar
  //                   fortfarande promo-UI, men måste kunna blockera aktivering
  //                   när premium redan är igång.
  const [offerOpen, setOfferOpen] = useState(false);
  const [claimActive, setClaimActive] = useState(false);
  const [promoExpiry, setPromoExpiry] = useState<Date | null>(null);
  const [freeMonthUsed, setFreeMonthUsed] = useState(false);
  const [paidEnabled, setPaidEnabled] = useState(false);
  const [premiumActive, setPremiumActiveFlag] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  // Keyboard-avoidance för voucher-fältet. iOS automaticallyAdjustKeyboardInsets
  // scrollar fältet FLUSH mot tangentbordet; för att lägga till marginal puttar
  // vi scrollen +KEYBOARD_MARGIN i keyboardDidShow (efter att auto-scroll
  // landat). contentInset komponerar inte på New Architecture — därför denna väg.
  const scrollRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);
  const voucherFocusedRef = useRef(false);

  const loadPromoState = async () => {
    const [open, active, expiry, used, paid, premium] = await Promise.all([
      isOfferWindowOpen(),
      hasActiveFreePremium(),
      getFreePremiumExpiry(),
      getFreeMonthUsed(),
      isPaidSubscriptionEnabled(),
      hasPremiumSubscription(),
    ]);
    return { open, active, expiry, used, paid, premium };
  };

  const applyPromoState = (s: Awaited<ReturnType<typeof loadPromoState>>) => {
    setOfferOpen(s.open);
    setClaimActive(s.active);
    setPromoExpiry(s.expiry);
    setFreeMonthUsed(s.used);
    setPaidEnabled(s.paid);
    setPremiumActiveFlag(s.premium);
  };

  useEffect(() => {
    let cancelled = false;
    // Pull kontots server-grant (annan enhet kan ha claimat/löst in) innan vi
    // läser spegel-baserade flaggorna, så gray-out/ACTIVE är korrekt.
    refreshPromoGrants()
      .then(loadPromoState)
      .then((s) => {
        if (!cancelled) applyPromoState(s);
      });
    return () => {
      cancelled = true;
    };
    // Kör en gång vid mount — applyPromoState/loadPromoState är stabila nog
    // (bara setState + rena läsare) att inte behöva vara i deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lyfter voucher-fältet KEYBOARD_MARGIN över tangentbordet. keyboardDidShow
  // fyrar EFTER att iOS auto-scroll (automaticallyAdjustKeyboardInsets) landat,
  // så en relativ +margin-nudge sätter sig utan att fightas tillbaka (fältet är
  // redan synligt → auto-scroll drar inte ned det igen). RAF säkrar att vi läser
  // scrollYRef efter auto-scrollens onScroll. Bara när voucher-fältet har fokus.
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      if (!voucherFocusedRef.current) return;
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          y: scrollYRef.current + KEYBOARD_MARGIN,
          animated: true,
        });
      });
    });
    return () => sub.remove();
  }, []);

  // Lookup-tabell product-ID → RC PurchasesPackage. När RC har laddat
  // offerings:n låter vi det vara source of truth för pris-display. Innan
  // load (eller om RC-key saknas i .env) faller call-sites tillbaka till
  // hardcoded tier.price.
  const packageByProductId = useMemo(() => {
    const map: Record<string, PurchasesPackage> = {};
    if (!offering) return map;
    offering.availablePackages.forEach((pkg) => {
      map[pkg.product.identifier] = pkg;
    });
    return map;
  }, [offering]);

  // Helper: returnerar RC:s localizedPriceString för product-ID:t om
  // tillgänglig, annars fallback. Visar exakt vad Apple kommer debitera
  // user i deras lokala valuta — undviker discrepancy mellan vad vi visar
  // och vad Apple's purchase-modal visar.
  const getDisplayPrice = (productId: string, fallback: string): string => {
    const pkg = packageByProductId[productId];
    return pkg?.product.priceString ?? fallback;
  };

  // ─── Buy-handlers — riktiga RC-purchases ──────────────────────────────
  // Apple's native purchase-modal visas direkt utan vår egen "Confirm
  // purchase"-Alert (Apple's modal är confirmation:en). Vi triggar bara
  // purchasePackage() → väntar på resultat → bumpar lokala state.
  //
  // handleBuyCredits är DÖD KOD sedan 2026-07-07 (CREDIT_TIERS tom —
  // engångsköp borttagna, enda köpet är Premium-abonnemanget). Behålls
  // för ev. framtida re-aktivering via CREDIT_TIERS-arrayn.
  const handleBuyCredits = async (tier: CreditTier) => {
    const pkg = packageByProductId[tier.productId];
    if (!pkg) {
      Alert.alert(
        'Store unavailable',
        'Could not load this product right now. Please try again in a moment.',
      );
      return;
    }
    const profile = await loadProfile();
    if (!profile) {
      Alert.alert('Sign in required', 'Log in or register before buying credits.');
      return;
    }

    setPurchasing(tier.id);
    const result = await purchasePackage(pkg);
    setPurchasing(null);

    if (result.kind === 'cancelled') return; // tyst — user trycka Cancel
    if (result.kind === 'error') {
      Alert.alert('Purchase failed', result.reason);
      return;
    }

    // Success — bumpa lokal gameCredits-count via product-amount-tabellen
    // i iap.ts. RC själv spårar inte consumable-balanser; det är vårt ansvar.
    const amount = CREDIT_PRODUCT_AMOUNTS[result.productIdentifier] ?? tier.games;
    const newCredits = (profile.gameCredits ?? 0) + amount;
    await saveProfile({ ...profile, gameCredits: newCredits });
    track('purchase_completed', {
      type: 'credits',
      product_id: tier.id,
      price_amount: tier.priceAmount,
      price_currency: 'SEK',
    });
    const { title, body } = successCopy(
      `${amount} Host Games added — you now have ${newCredits} credits.`,
    );
    Alert.alert(title, body, [{ text: 'OK', onPress: handleBack }]);
  };

  // Themed packages (Hip Hop / Rock / Film & Actors) är parkerade till
  // v1.1+ men PackageTierCard-render-koden finns kvar för enkel re-
  // aktivering. När items läggs tillbaka i PACKAGE_TIERS måste denna
  // funktion uppdateras till en riktig RC purchasePackage()-flow
  // motsvarande handleBuyCredits/handleBuySubscription nedan.
  const handleBuyPackage = (_tier: PackageTier) => {
    Alert.alert('Coming soon', 'Themed packages are not yet available.');
  };

  const handleBuySubscription = async (tier: SubscriptionTier) => {
    const pkg = packageByProductId[tier.productId];
    if (!pkg) {
      Alert.alert(
        'Store unavailable',
        'Could not load this subscription right now. Please try again in a moment.',
      );
      return;
    }

    setPurchasing(tier.id);
    const result = await purchasePackage(pkg);
    setPurchasing(null);

    if (result.kind === 'cancelled') return;
    if (result.kind === 'error') {
      Alert.alert('Subscription failed', result.reason);
      return;
    }

    // Success — RC:s customerInfo har nu premium-entitlement aktiv.
    // Lokal hasPremium-flag (subscriptionStorage) speglas via
    // _layout.tsx:s customer-info-listener, men sätt direkt här också
    // så Lobby/Profile uppdateras omedelbart utan att vänta på listener.
    if (hasEntitlement(result.customerInfo, ENTITLEMENTS.PREMIUM)) {
      await setPremiumActive(true);
    }
    track('purchase_completed', {
      type: 'subscription',
      product_id: tier.id,
      price_amount: tier.priceAmount,
      price_currency: 'SEK',
    });
    const { title, body } = successCopy(
      'QuizVibe Premium is now active. Enjoy unlimited host games!',
    );
    Alert.alert(
      fromLobby ? title : 'Subscription activated',
      body,
      [{ text: 'OK', onPress: handleBack }],
    );
  };

  // Free Premium-kampanjen: aktiverar kontots engångs-gratismånad server-side
  // (migration 0047). Inget IAP-anrop — inga pengar byter ägare, så StoreKit
  // ska inte vara med, och flödet funkar i Expo Go.
  //
  // Blockeras när premium redan är aktiv (Peters regel) och när kontot redan
  // förbrukat sin gratismånad. Servern enforce:ar båda; klienten mappar
  // reason → Alert-copy.
  const handleClaimFreePremium = async () => {
    // Belt-and-suspenders: state kan vara stale mellan load och tap. Servern
    // avvisar ändå, men detta ger direkt feedback utan round-trip.
    if (premiumActive) {
      Alert.alert('Already active', ALREADY_ACTIVE_MESSAGE);
      return;
    }

    setClaiming(true);
    const result = await claimFreeMonth();
    if (!result.ok) {
      setClaiming(false);
      switch (result.reason) {
        case 'already_active':
          Alert.alert('Already active', ALREADY_ACTIVE_MESSAGE);
          break;
        case 'already_used':
          Alert.alert(
            'Free month already used',
            "You've already used your free month on this account. Redeem a voucher code below for another month.",
          );
          break;
        case 'not_registered':
        case 'not_authenticated':
          Alert.alert(
            'Sign in required',
            'Register or log in to your QuizVibe account to activate your free month.',
          );
          break;
        default:
          Alert.alert('Could not activate', 'Something went wrong. Please try again in a moment.');
      }
      // Håll UI:t i synk (t.ex. already_used ⇒ gray-out efter refresh).
      await refreshPremiumMirror();
      applyPromoState(await loadPromoState());
      return;
    }

    // Gratismånaden lever i promoPremiums egen nyckel och passerar aldrig
    // setPremiumActive, så den synkrona premium-spegeln måste räknas om
    // explicit. Utan detta seedar nästa skärm-mount (Lobby/Profile) låst läge.
    await refreshPremiumMirror();
    applyPromoState(await loadPromoState());
    setClaiming(false);

    track('free_premium_claimed', {
      renewal: false, // förnyelser finns inte längre — alltid första gången
      expires_at: result.until.toISOString(),
    });

    Alert.alert(
      'QuizVibe Premium activated',
      `Free until ${formatPromoDate(result.until)}. No payment and no auto-renewal.`,
      [{ text: 'OK', onPress: handleBack }],
    );
  };

  // Voucher-inlösen: individuell engångskod → en extra månad. Server förbrukar
  // koden (engångs) och blockerar när premium redan är aktiv. Inget IAP —
  // funkar i Expo Go, samma väg som gratismånaden.
  const handleRedeemVoucher = async () => {
    const code = voucherCode.trim();
    if (!code) return;
    if (premiumActive) {
      Alert.alert('Already active', ALREADY_ACTIVE_MESSAGE);
      return;
    }

    setRedeeming(true);
    const result = await redeemVoucher(code);
    if (!result.ok) {
      setRedeeming(false);
      switch (result.reason) {
        case 'invalid_code':
          Alert.alert('Invalid code', 'That voucher code was not recognised. Check it and try again.');
          break;
        case 'already_redeemed':
          Alert.alert('Code already used', 'This voucher code has already been redeemed.');
          break;
        case 'expired':
          Alert.alert('Code expired', 'This voucher code is no longer valid.');
          break;
        case 'already_active':
          Alert.alert('Already active', ALREADY_ACTIVE_MESSAGE);
          break;
        case 'not_registered':
        case 'not_authenticated':
          Alert.alert(
            'Sign in required',
            'Register or log in to your QuizVibe account to redeem a voucher.',
          );
          break;
        default:
          Alert.alert('Could not redeem', 'Something went wrong. Please try again in a moment.');
      }
      return;
    }

    await refreshPremiumMirror();
    applyPromoState(await loadPromoState());
    setRedeeming(false);
    setVoucherCode('');

    track('voucher_redeemed', { expires_at: result.until.toISOString() });

    Alert.alert(
      'QuizVibe Premium activated',
      `Voucher redeemed. Premium is active until ${formatPromoDate(result.until)}.`,
      [{ text: 'OK', onPress: handleBack }],
    );
  };

  // Restore Purchases — Apple App Store krav för apps med non-consumables
  // eller subscriptions. Användare som installerade om appen / bytte device
  // kan återställa tidigare köp via en knapp. Consumables återställs INTE
  // (förbrukad = förbrukad).
  const handleRestorePurchases = async () => {
    setRestoring(true);
    const result = await restorePurchases();
    setRestoring(false);

    if (result.kind === 'error') {
      Alert.alert('Restore failed', result.reason);
      return;
    }

    const hasPremium = hasEntitlement(result.customerInfo, ENTITLEMENTS.PREMIUM);
    if (hasPremium) {
      await setPremiumActive(true);
      Alert.alert('Purchases restored', 'Your QuizVibe Premium membership is active.');
    } else {
      Alert.alert(
        'Nothing to restore',
        'No active purchases found for this Apple ID. If you believe this is an error, email info@quizvibe.se.',
      );
    }
  };

  // Sektionerna deklareras som JSX-konstanter så ordningen kan flippas
  // utan duplicering. `focusMode` styr ordningen.
  // otherHeading är OANVÄND sedan 2026-07-07 (packages/credits-fokus-lägena
  // som använde "Other"-separatorn är legacy-mappade till subscription) —
  // parkerad för ev. framtida fokus-läge med sekundär-sektioner.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const otherHeading = (
    <View style={styles.otherHeadingWrap}>
      <Text style={styles.otherHeading}>Other</Text>
    </View>
  );

  // Basic plan-sektionen är BORTTAGEN ur Store-vyn 2026-08-07 (Peter) —
  // Store ska bara sälja Premium, gratis-planen behöver ingen egen ruta.
  // Renderas inte i något focusMode; JSX:n parkeras här (samma mönster som
  // otherHeading/PACKAGE_TIERS) ifall den ska tillbaka.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const basicSection = (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Basic plan</Text>
      <View style={[styles.tierCard, styles.tierCardActive]}>
        <View style={styles.freeBadge}>
          <Text style={styles.freeBadgeText}>FREE</Text>
        </View>
        <View style={styles.tierContent}>
          <View style={styles.tierLeft}>
            <Text
              style={styles.tierHeadline}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              4 Host Games / day
            </Text>
            <Text style={styles.tierSubline}>+ Unlimited games as invited player</Text>
            <Text style={styles.tierSubline}>Refreshes every day at midnight CET</Text>
          </View>
          <View style={styles.activePill}>
            <Text style={styles.activePillText}>ACTIVE</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Customized Host Packages-sektionen — DÖD sedan 2026-07-07: Extra
  // packages säljs inte styckvis längre utan INGÅR i Premium-abonnemanget
  // (se SUBSCRIPTION_FEATURES-raden "All Extra Host packages included").
  // PACKAGE_TIERS är tom → sektionen renderas aldrig; render-koden +
  // PackageTierCard + handleBuyPackage behålls som parkerad kod ifall
  // styckförsäljning skulle återinföras.
  const packagesSection = PACKAGE_TIERS.length === 0
    ? null
    : (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customized Host Packages</Text>
        <Text style={styles.sectionSubtitle}>
          One-time purchase. Adds extra question content to your Lobby host setup.
        </Text>
        <View style={styles.tierList}>
          {PACKAGE_TIERS.map((tier) => (
            <PackageTierCard
              key={tier.id}
              tier={tier}
              onBuy={() => handleBuyPackage(tier)}
            />
          ))}
        </View>
      </View>
    );

  // Tom CREDIT_TIERS (engångsköp borttagna 2026-07-07) → hela sektionen
  // göms. Render-koden kvar för enkel re-aktivering via arrayn.
  const creditsSection = CREDIT_TIERS.length === 0 ? null : (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Credit packages</Text>
      <Text style={styles.sectionSubtitle}>
        One-time purchase. Credits never expire.
      </Text>
      <View style={styles.tierList}>
        {CREDIT_TIERS.map((tier) => (
          <CreditTierCard
            key={tier.id}
            tier={tier}
            displayPrice={getDisplayPrice(tier.productId, tier.price)}
            isPurchasing={purchasing === tier.id}
            disabled={purchasing !== null}
            onBuy={() => handleBuyCredits(tier)}
          />
        ))}
      </View>
    </View>
  );

  // ── Härledda visnings-tillstånd (Peter 2026-08-31) ───────────────────
  // Free-kortet är fortfarande claimbart (tillstånd A, under kampanj).
  const canClaimFree = offerOpen && !freeMonthUsed && !premiumActive;
  // Betal-kortet visas — speglar EXAKT de två render-grenarna nedan så inget
  // beteende ändras, men återanvänds för auto-renewal-disclosuren.
  const showPaidCard =
    paidEnabled && ((offerOpen && freeMonthUsed && !premiumActive) || !offerOpen);
  // Voucher-fältet: free använt ELLER free ej claimbart (kampanj stängd),
  // aldrig medan premium är aktivt (Peters kant-beslut). Under kampanjen med
  // free fortfarande valbar ⇒ dolt tills free använts.
  const showVoucher = !premiumActive && (freeMonthUsed || !offerOpen);

  const subscriptionSection = (
    <View style={styles.section}>
      {/* Skärmens topprubrik sedan headern togs bort — screenTitle-storlek
          (samma typografi som "Add QuizVibe Premium" hade). */}
      <Text style={styles.screenTitle}>QuizVibe membership</Text>

      {/* Feature-lista med Premium-vs-Basic-jämförelse per rad. */}
      <View style={styles.featureList}>
        {SUBSCRIPTION_FEATURES.map((feature) => (
          <View key={feature.premium} style={styles.featureRow}>
            <Text style={styles.featureCheck}>✓</Text>
            <View style={styles.featureTextWrap}>
              <Text style={styles.featurePremium}>{feature.premium}</Text>
              <Text style={styles.featureBasic}>Basic: {feature.basic}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Pris-tiers. Under launch-kampanjen (offerOpen) visas Free-kortet;
          det betalda 79 kr-kortet gatas på paidEnabled (feature-flagga,
          default AV i v1 — förberett men inte submittat). När Peter stänger
          kampanjen OCH slår på paidEnabled visas betal-kortet i stället. */}
      {offerOpen ? (
        <View style={styles.tierList}>
          <PromoTierCard
            expiry={promoExpiry}
            claimActive={claimActive}
            freeMonthUsed={freeMonthUsed}
            premiumActive={premiumActive}
            isClaiming={claiming}
            onClaim={handleClaimFreePremium}
            showVoucher={showVoucher}
            voucherCode={voucherCode}
            onVoucherChange={setVoucherCode}
            onRedeem={handleRedeemVoucher}
            redeeming={redeeming}
            onVoucherFocusChange={(f) => {
              voucherFocusedRef.current = f;
            }}
          />
          {/* Betal-kortet får INTE gå att aktivera förrän kontot förbrukat sin
              gratismånad (Peter 2026-08-31). Gaten: paidEnabled (feature-flagga)
              + freeMonthUsed (server, per konto) + !premiumActive (ingen köp-CTA
              medan en gratis-/voucher-månad är igång — ingen månadskostnad under
              fri-perioden). Ny user: freeMonthUsed=false ⇒ bara Free-kortet.
              ⚠ APPLE-REVIEW: en fresh granskar-konto har freeMonthUsed=false ⇒
              ser inte köpet. Demo-kontot i PROD MÅSTE ha free_month_used=true +
              ingen aktiv premium, annars nekas IAP:n som onåbar (Guideline 2.1). */}
          {showPaidCard &&
            SUBSCRIPTION_TIERS.map((tier) => (
              <SubscriptionTierCard
                key={tier.id}
                tier={tier}
                displayPrice={getDisplayPrice(tier.productId, tier.price)}
                isPurchasing={purchasing === tier.id}
                disabled={purchasing !== null}
                onBuy={() => handleBuySubscription(tier)}
              />
            ))}
        </View>
      ) : showPaidCard ? (
        <View style={styles.tierList}>
          {SUBSCRIPTION_TIERS.map((tier) => (
            <SubscriptionTierCard
              key={tier.id}
              tier={tier}
              displayPrice={getDisplayPrice(tier.productId, tier.price)}
              isPurchasing={purchasing === tier.id}
              disabled={purchasing !== null}
              onBuy={() => handleBuySubscription(tier)}
            />
          ))}
        </View>
      ) : null}

      {/* Voucher fristående BARA post-kampanj — under kampanjen bäddas det in i
          Single month-kortet (PromoTierCard). Utan detta försvinner voucher-
          vägen när kampanjen stängts (showVoucher = freeMonthUsed || !offerOpen,
          och Single month-kortet renderas inte då). */}
      {showVoucher && !offerOpen && (
        <VoucherBox
          voucherCode={voucherCode}
          onChangeText={setVoucherCode}
          onRedeem={handleRedeemVoucher}
          redeeming={redeeming}
          onFocusChange={(f) => {
            voucherFocusedRef.current = f;
          }}
        />
      )}

      {/* Free-note — bara tillstånd A (Single month-kortet visar "Free"-knapp,
          inget voucher/paid). Auto-renewal-noten bor numera inne i Monthly
          subscription-kortet och voucher-noten inne i voucher-boxen. */}
      {canClaimFree && (
        <Text style={styles.autoRenewNote}>
          Free for one month. No payment and no auto-renewal.
        </Text>
      )}
      {/* Grandfathering: kampanjen stängd men kontot har en månad kvar.
          Under kampanjen visar PromoTierCard "Free until …" i stället. */}
      {!offerOpen && claimActive && promoExpiry && (
        <Text style={styles.autoRenewNote}>
          Your Premium is active until {formatPromoDate(promoExpiry)}.
        </Text>
      )}

      {/* Restore Purchases — Apple App Store-krav. Användare som
          installerade om appen eller bytte device kan återställa tidigare
          subscriptions här. Discrete styling så det inte konkurrerar
          med köp-CTA:erna — bara en länk-stil-text under sub-tiers. */}
      <Pressable
        onPress={handleRestorePurchases}
        disabled={restoring || purchasing !== null}
        style={({ pressed }) => [
          styles.restoreBtn,
          pressed && { opacity: 0.7 },
          (restoring || purchasing !== null) && { opacity: 0.5 },
        ]}
      >
        {restoring ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Text style={styles.restoreBtnText}>Restore Purchases</Text>
        )}
      </Pressable>

      {/* Privacy Policy + Terms of Use — Apple Guideline 3.1.2 kräver
          funktionella länkar till båda intill köp-/prenumerations-UI:t.
          Öppnas in-app via expo-web-browser (samma mönster som Profile →
          Legal). Renderas alltid i subscription-sektionen, oavsett om
          kampanjen är öppen eller det betalda kortet visas. */}
      <View style={styles.legalLinksRow}>
        <Pressable
          onPress={() => WebBrowser.openBrowserAsync('https://quizvibe.se/legal/privacy/')}
          hitSlop={8}
          style={({ pressed }) => pressed && { opacity: 0.7 }}
        >
          <Text style={styles.legalLink}>Privacy Policy</Text>
        </Pressable>
        <Text style={styles.legalLinkSeparator}>·</Text>
        <Pressable
          onPress={() => WebBrowser.openBrowserAsync('https://quizvibe.se/legal/terms/')}
          hitSlop={8}
          style={({ pressed }) => pressed && { opacity: 0.7 }}
        >
          <Text style={styles.legalLink}>Terms of Use</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Sticky TopUserBanner med ← Back vänster + login-pillen höger.
          Back kör handleBack ovan (router.back() med Home-tab-fallback). */}
      <TopUserBanner onBackPress={handleBack} backLabel="Back" />
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => {
          scrollYRef.current = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        // iOS scrollar det fokuserade voucher-fältet flush ovanför tangentbordet;
        // keyboardDidShow-effekten ovan lägger sedan till KEYBOARD_MARGIN luft.
        // persistTaps "handled" gör att Redeem-tappet registreras medan
        // keyboardet är uppe.
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
      >
        {/* Skärm-headern ("Add QuizVibe Premium" + undertext) togs bort
            2026-08-07 (Peter) — "QuizVibe membership plans" är nu skärmens
            enda topprubrik och bär screenTitle-typografin. */}
        {focusMode === 'subscription' && (
          <>
            {subscriptionSection}
            {packagesSection}
            {creditsSection}
          </>
        )}
        {focusMode === 'default' && (
          <>
            {creditsSection}
            {packagesSection}
            {subscriptionSection}
          </>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Credit tier card ─────────────────────────────────────────────────────────

// ─── Package tier card ────────────────────────────────────────────────────────

function PackageTierCard({
  tier,
  onBuy,
}: {
  tier: PackageTier;
  onBuy: () => void;
}) {
  return (
    <View style={styles.tierCard}>
      <View style={styles.tierContent}>
        <View style={styles.tierLeft}>
          <Text style={styles.tierHeadline}>
            {tier.icon} {tier.name}
          </Text>
          <Text style={styles.tierSubline}>{tier.description}</Text>
        </View>
        <View style={styles.tierRight}>
          <Text style={styles.tierPrice}>{tier.price}</Text>
          <Pressable
            onPress={onBuy}
            style={({ pressed }) => [
              styles.buyBtn,
              { backgroundColor: Colors.primary },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.buyBtnText}>Buy</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function CreditTierCard({
  tier,
  displayPrice,
  isPurchasing,
  disabled,
  onBuy,
}: {
  tier: CreditTier;
  displayPrice: string;
  isPurchasing: boolean;
  disabled: boolean;
  onBuy: () => void;
}) {
  const isHighlight = tier.badge === 'BEST VALUE';
  const accent = isHighlight ? Colors.warning : Colors.primary;

  return (
    <View style={[styles.tierCard, isHighlight && { borderColor: accent }]}>
      {tier.badge && (
        <View style={[styles.tierBadge, { backgroundColor: accent }]}>
          <Text style={styles.tierBadgeText}>{tier.badge}</Text>
        </View>
      )}
      <View style={styles.tierContent}>
        <View style={styles.tierLeft}>
          <Text style={styles.tierHeadline}>
            🎟️ {tier.games}{' '}
            <Text style={styles.tierHeadlineUnit}>Host Games</Text>
          </Text>
          <Text style={styles.tierSubline}>{tier.pricePerGame}</Text>
          {tier.savePct !== undefined && (
            <Text style={[styles.tierSave, { color: accent }]}>
              Save {tier.savePct}%
            </Text>
          )}
        </View>
        <View style={styles.tierRight}>
          <Text style={styles.tierPrice}>{displayPrice}</Text>
          <Pressable
            onPress={onBuy}
            disabled={disabled}
            style={({ pressed }) => [
              styles.buyBtn,
              { backgroundColor: accent },
              pressed && { opacity: 0.85 },
              disabled && { opacity: 0.5 },
            ]}
          >
            {isPurchasing ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.buyBtnText}>Buy</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── Voucher-inlösen ──────────────────────────────────────────────────────────
// Delas av Single month-kortet (embedded — under den grå "already used"-texten)
// och en fristående render post-kampanj (då Single month-kortet inte finns).
function VoucherBox({
  voucherCode,
  onChangeText,
  onRedeem,
  redeeming,
  embedded,
  onFocusChange,
}: {
  voucherCode: string;
  onChangeText: (v: string) => void;
  onRedeem: () => void;
  redeeming: boolean;
  embedded?: boolean;
  onFocusChange?: (focused: boolean) => void;
}) {
  return (
    <View style={embedded ? styles.voucherEmbedded : styles.voucherBox}>
      <Text style={styles.voucherLabel}>Have a voucher code?</Text>
      <View style={styles.voucherRow}>
        <TextInput
          style={styles.voucherInput}
          value={voucherCode}
          onChangeText={onChangeText}
          onFocus={() => onFocusChange?.(true)}
          onBlur={() => onFocusChange?.(false)}
          placeholder="QVGIFT-XXXX"
          placeholderTextColor={Colors.textSecondary}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!redeeming}
          maxLength={32}
        />
        <Pressable
          onPress={onRedeem}
          disabled={redeeming || voucherCode.trim().length === 0}
          style={({ pressed }) => [
            styles.voucherBtn,
            pressed && { opacity: 0.85 },
            (redeeming || voucherCode.trim().length === 0) && { opacity: 0.5 },
          ]}
        >
          {redeeming ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.voucherBtnText}>Redeem</Text>
          )}
        </Pressable>
      </View>
      <Text style={styles.voucherNote}>
        Redeem a voucher code above for another free month.
      </Text>
    </View>
  );
}

// ─── Free Premium promo card ──────────────────────────────────────────────────

// Launch-kampanjens kort. Speglar SubscriptionTierCard:s geometri men har
// inget pris — det finns ingen prenumeration, bara en engångs-gratismånad.
//
// Tre lägen (prioritetsordning):
//   premiumActive=true  → grön ACTIVE-pill, INGEN knapp (månad igång, eller
//                         betald premium aktiv). Kan inte aktiveras på nytt.
//   freeMonthUsed=true  → grå "Used"-knapp (förbrukad engångsmånad) + note
//                         som pekar på voucher. Ingen ny gratismånad.
//   annars              → gold "Free"-knapp.
function PromoTierCard({
  expiry,
  claimActive,
  freeMonthUsed,
  premiumActive,
  isClaiming,
  onClaim,
  showVoucher,
  voucherCode,
  onVoucherChange,
  onRedeem,
  redeeming,
  onVoucherFocusChange,
}: {
  expiry: Date | null;
  claimActive: boolean;
  freeMonthUsed: boolean;
  premiumActive: boolean;
  isClaiming: boolean;
  onClaim: () => void;
  showVoucher: boolean;
  voucherCode: string;
  onVoucherChange: (v: string) => void;
  onRedeem: () => void;
  redeeming: boolean;
  onVoucherFocusChange?: (focused: boolean) => void;
}) {
  const accent = Colors.warning;

  return (
    // Grön kort-styling när premium är aktivt — grönt betyder "aktiv" i resten
    // av appen. Måla inte grönt innan man aktiverat.
    <View style={[styles.tierCard, premiumActive && styles.tierCardActive]}>
      <View style={[styles.tierContent, { alignItems: 'flex-start' }]}>
        <View style={styles.tierLeft}>
          <Text style={styles.tierHeadline}>Single month</Text>
          <Text style={styles.tierSubline}>no auto-renewal</Text>
          {claimActive && expiry && (
            <Text style={styles.tierSubline}>Free until {formatPromoDate(expiry)}</Text>
          )}
          {!premiumActive && freeMonthUsed && (
            <Text style={styles.tierSubline}>
              Free month already used — redeem a voucher below
            </Text>
          )}
        </View>
        <View style={[styles.tierRight, { alignItems: 'center' }]}>
          {premiumActive ? (
            <View style={styles.activePill}>
              <Text style={styles.activePillText}>ACTIVE</Text>
            </View>
          ) : freeMonthUsed ? (
            // Förbrukad — grå, otryckbar. Voucher blir vägen till fler månader.
            <View style={[styles.buyBtn, styles.usedBtn]}>
              <Text style={styles.usedBtnText}>Used</Text>
            </View>
          ) : (
            <Pressable
              onPress={onClaim}
              disabled={isClaiming}
              style={({ pressed }) => [
                styles.buyBtn,
                { backgroundColor: accent },
                pressed && { opacity: 0.85 },
                isClaiming && { opacity: 0.5 },
              ]}
            >
              {isClaiming ? (
                // Mörk spinner — vit syns dåligt mot guld.
                <ActivityIndicator size="small" color={Colors.background} />
              ) : (
                <Text style={styles.buyBtnText}>Free</Text>
              )}
            </Pressable>
          )}
        </View>
      </View>
      {/* Voucher-fältet inbäddat i kortet, direkt under den grå "already
          used"-texten (Peter 2026-08-31). */}
      {showVoucher && (
        <VoucherBox
          embedded
          voucherCode={voucherCode}
          onChangeText={onVoucherChange}
          onRedeem={onRedeem}
          redeeming={redeeming}
          onFocusChange={onVoucherFocusChange}
        />
      )}
    </View>
  );
}

// ─── Subscription tier card ───────────────────────────────────────────────────

function SubscriptionTierCard({
  tier,
  displayPrice,
  isPurchasing,
  disabled,
  onBuy,
}: {
  tier: SubscriptionTier;
  displayPrice: string;
  isPurchasing: boolean;
  disabled: boolean;
  onBuy: () => void;
}) {
  const isHighlight = tier.badge === 'BEST VALUE';
  // Guld på Subscribe-knappen (Peter 2026-08-07) — samma premium-vokabulär
  // som PREMIUM-badges och Start Game-CTA:n. buyBtnText är redan mörk
  // (Colors.background), vilket ger rätt kontrast mot guld.
  const accent = Colors.warning;

  return (
    <View style={[styles.tierCard, isHighlight && { borderColor: accent }]}>
      {tier.badge && (
        <View style={[styles.tierBadge, { backgroundColor: accent }]}>
          <Text style={styles.tierBadgeText}>{tier.badge}</Text>
        </View>
      )}
      {/* flex-start (istället för tierContent:s center) → prisets översta
          rad linjerar med "Monthly subscription"-rubriken. Båda är 18px så
          baslinjerna hamnar på samma höjd. */}
      <View style={[styles.tierContent, { alignItems: 'flex-start' }]}>
        <View style={styles.tierLeft}>
          <Text style={styles.tierHeadline}>{tier.label}</Text>
          {/* pricePerMonth-sublinen borttagen 2026-08-07 — perioden visas
              nu direkt vid priset ("79 kr / month") till höger. */}
          {tier.savePct !== undefined && (
            <Text style={[styles.tierSave, { color: accent }]}>
              Save {tier.savePct}%
            </Text>
          )}
        </View>
        {/* alignItems center (istället för tierRight:s flex-end) → priset
            centreras över Subscribe-knappen i stället för att högerställas
            mot kortets kant. */}
        <View style={[styles.tierRight, { alignItems: 'center' }]}>
          {/* "/ month" hängs på RC:s lokaliserade pris (eller fallbacken)
              sedan den separata pricePerMonth-sublinen togs bort — perioden
              måste framgå vid priset för att abonnemanget ska vara tydligt. */}
          <Text style={styles.tierPrice}>{displayPrice} / month</Text>
          <Pressable
            onPress={onBuy}
            disabled={disabled}
            style={({ pressed }) => [
              styles.buyBtn,
              { backgroundColor: accent },
              pressed && { opacity: 0.85 },
              disabled && { opacity: 0.5 },
            ]}
          >
            {isPurchasing ? (
              // Mörk spinner (samma färg som knapptexten) — vit syns dåligt
              // mot guld.
              <ActivityIndicator size="small" color={Colors.background} />
            ) : (
              <Text style={styles.buyBtnText}>Subscribe</Text>
            )}
          </Pressable>
        </View>
      </View>
      {/* Auto-renewal-disclosure inbäddad längst ner i kortet (Peter
          2026-08-31) — intill det köpbara abonnemanget per Apple 3.1.2. */}
      <Text style={styles.tierFootnote}>
        All subscriptions auto-renew. Cancel anytime in your App Store or
        Google Play account.
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl + 52, // + BOTTOM_BANNER_HEIGHT
    gap: Spacing.xl,
  },

  // Screen header
  header: { gap: 4 },
  screenTitle: { ...Typography.screenTitle, color: Colors.textPrimary },
  screenSubtitle: { ...Typography.label, color: Colors.textSecondary },

  // Section blocks
  section: { gap: Spacing.sm },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  // Empty-state-text för packages-only-vyn när PACKAGE_TIERS = []. Lite
  // mer luft (paddingVertical) än sectionSubtitle eftersom det är den
  // enda textrad som syns i hela vyn — vill att den känns intentionell
  // och inte glömd.
  packagesEmptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    paddingVertical: Spacing.md,
    lineHeight: 22,
  },
  // "Other"-rubrik som separerar primära fokus-sektioner (focus=packages
  // eller focus=credits) från resten av Store-utbudet. Subtilt: tunn
  // top-border + Typography.overline-stil för att signalera "härnedan
  // ligger sekundära alternativ" utan att ta över synfältet.
  otherHeadingWrap: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  otherHeading: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  // Feature list (subscription)
  featureList: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  featureCheck: {
    fontSize: FontSize.md,
    color: Colors.success,
    fontWeight: FontWeight.bold,
    width: 16,
    marginTop: 1,
  },
  featureTextWrap: {
    flex: 1,
    gap: 2,
  },
  featurePremium: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
    lineHeight: 20,
  },
  featureBasic: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },

  // Tier list (vertikal stack)
  tierList: {
    gap: Spacing.md,
  },
  tierCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    position: 'relative',
  },
  // Basic plan-card: subtilt grön border så aktiv-state syns
  tierCardActive: {
    borderColor: Colors.successBorder,
    backgroundColor: Colors.successMuted,
  },
  // Border-cutting badges (matchar mönster från Lobby PlayerRow + Game Mode)
  tierBadge: {
    position: 'absolute',
    top: -8,
    left: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    zIndex: 10,
    elevation: 4,
  },
  tierBadgeText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: '#000',
    letterSpacing: 0.5,
  },
  freeBadge: {
    position: 'absolute',
    top: -8,
    left: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    backgroundColor: Colors.success,
    zIndex: 10,
    elevation: 4,
  },
  freeBadgeText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  tierContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  tierLeft: {
    flex: 1,
    gap: 2,
  },
  tierHeadline: {
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  tierHeadlineUnit: {
    fontSize: 14,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  tierSubline: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tierSave: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    marginTop: 2,
  },
  tierRight: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  tierPrice: {
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  buyBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.md,
  },
  buyBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.background,
    letterSpacing: 0.3,
  },

  // ACTIVE-pill för basic-plan
  activePill: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.success,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#000',
    letterSpacing: 0.6,
  },

  // Subscription-fotnot
  autoRenewNote: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 16,
  },
  // Restore Purchases — Apple-krav. Discrete link-style så det inte
  // konkurrerar med köp-CTA:erna. Centerar text + minimal padding så
  // hela raden är tappbar utan att se ut som en stor knapp.
  restoreBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    minHeight: 40,
  },
  restoreBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },

  // Privacy Policy · Terms of Use — App Store 3.1.2. Diskret rad under
  // Restore Purchases; länk-stil så den inte konkurrerar med köp-CTA:erna.
  legalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  legalLink: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  legalLinkSeparator: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },

  // Förbrukad gratismånad — grå, otryckbar knapp (samma geometri som buyBtn).
  usedBtn: {
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  usedBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textDisabled,
    letterSpacing: 0.3,
  },

  // Voucher-inlösen
  voucherBox: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  voucherLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  voucherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  voucherInput: {
    flex: 1,
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  voucherBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    minWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voucherBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  // Voucher inbäddad i Single month-kortet — ingen egen kortbakgrund, bara en
  // hairline-separator mot texten ovanför.
  voucherEmbedded: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  voucherNote: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  // Auto-renewal-not inbäddad längst ner i Monthly subscription-kortet.
  tierFootnote: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 16,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  bottomPad: { height: Spacing.xl },
});

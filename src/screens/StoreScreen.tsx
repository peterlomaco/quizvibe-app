import React from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing, Typography } from '../theme';
import { track } from '../utils/analytics';
import { loadProfile, saveProfile } from '../utils/profileStorage';

// ─── Tier-data (mock tills IAP finns) ─────────────────────────────────────────
// TODO (backend): Priser, paket-IDn och köpstatus hämtas från App Store /
// Play Store-IAP via expo-iap eller RevenueCat. Just nu mock — vid "köp"
// av credits ökar bara local gameCredits i AsyncStorage; subscription
// markerar inget state (kräver att ProfileData får ett subscription-fält).

interface CreditTier {
  id: string;
  games: number;
  price: string;
  priceAmount: number;     // för analytics (numeriskt belopp)
  pricePerGame: string;
  badge?: string;
  savePct?: number;
}

const CREDIT_TIERS: CreditTier[] = [
  {
    id: 'credits-5',
    games: 5,
    price: '19 kr',
    priceAmount: 19,
    pricePerGame: '3.80 kr / game',
  },
  {
    id: 'credits-10',
    games: 10,
    price: '29 kr',
    priceAmount: 29,
    pricePerGame: '2.90 kr / game',
    savePct: 24,
  },
  {
    id: 'credits-20',
    games: 20,
    price: '49 kr',
    priceAmount: 49,
    pricePerGame: '2.45 kr / game',
    badge: 'BEST VALUE',
    savePct: 36,
  },
];

interface SubscriptionTier {
  id: string;
  label: string;             // "1 month", "3 months", etc.
  price: string;             // "79 kr"
  priceAmount: number;       // för analytics
  pricePerMonth: string;     // "79 kr / month" eller "~66 kr / month"
  badge?: string;
  savePct?: number;
}

const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'sub-1mth',
    label: '1 month',
    price: '79 kr',
    priceAmount: 79,
    pricePerMonth: '79 kr / month',
  },
  {
    id: 'sub-3mth',
    label: '3 months',
    price: '199 kr',
    priceAmount: 199,
    pricePerMonth: '~66 kr / month',
    savePct: 16,
  },
  {
    id: 'sub-6mth',
    label: '6 months',
    price: '279 kr',
    priceAmount: 279,
    pricePerMonth: '~47 kr / month',
    savePct: 41,
  },
  {
    id: 'sub-year',
    label: '12 months',
    price: '399 kr',
    priceAmount: 399,
    pricePerMonth: '~33 kr / month',
    badge: 'BEST VALUE',
    savePct: 58,
  },
];

interface SubscriptionFeature {
  premium: string;
  basic: string;
}

const SUBSCRIPTION_FEATURES: SubscriptionFeature[] = [
  { premium: 'Unlimited Host Games', basic: '2 games per week' },
  { premium: 'Max 10 rounds per game', basic: 'Max 3 rounds per game' },
  { premium: 'Invite up to 12 players per Game', basic: '4 players' },
  { premium: 'Individual Device Game mode', basic: 'Not available' },
  {
    premium: 'Spotify access (still requires all players in the same Game to have Spotify account connected)',
    basic: 'Not available',
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function StoreScreen() {
  // Mock-purchase av credit-paket: bekräfta + öka gameCredits i sparad profil.
  // TODO (backend): byt mot riktig IAP-flow (expo-iap eller RevenueCat).
  const handleBuyCredits = (tier: CreditTier) => {
    Alert.alert(
      'Confirm purchase',
      `Buy ${tier.games} Host Games for ${tier.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy',
          onPress: async () => {
            const profile = await loadProfile();
            if (!profile) {
              Alert.alert('Sign in required', 'Log in or register before buying credits.');
              return;
            }
            const newCredits = (profile.gameCredits ?? 0) + tier.games;
            await saveProfile({ ...profile, gameCredits: newCredits });
            track('purchase_completed', {
              type: 'credits',
              product_id: tier.id,
              price_amount: tier.priceAmount,
              price_currency: 'SEK',
            });
            Alert.alert(
              'Purchase successful',
              `${tier.games} Host Games added — you now have ${newCredits} credits.`,
            );
          },
        },
      ],
    );
  };

  // Mock-purchase av subscription. TODO (backend): RevenueCat hanterar
  // subscription-state via webhooks; lägg till `subscription`-fält på
  // ProfileData när det är relevant och uppdatera entitlements här.
  const handleBuySubscription = (tier: SubscriptionTier) => {
    Alert.alert(
      'Start subscription',
      `Subscribe to QuizVibe Premium for ${tier.price} (${tier.label}). Auto-renews until cancelled.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: () => {
            track('purchase_completed', {
              type: 'subscription',
              product_id: tier.id,
              price_amount: tier.priceAmount,
              price_currency: 'SEK',
            });
            Alert.alert(
              'Subscription activated',
              'QuizVibe Premium is now active. Enjoy unlimited host games!',
            );
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Screen header ────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Add Host Game Credits</Text>
          <Text style={styles.screenSubtitle}>
            Choose your plan — Basic, single packages or unlimited with subscription.
          </Text>
        </View>

        {/* ── Sektion 1: Basic plan (Free, alltid aktiv) ──────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic plan</Text>
          <View style={[styles.tierCard, styles.tierCardActive]}>
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>FREE</Text>
            </View>
            <View style={styles.tierContent}>
              <View style={styles.tierLeft}>
                <Text style={styles.tierHeadline}>2 Host Games per week</Text>
                <Text style={styles.tierSubline}>+ Unlimited games as invited player</Text>
                <Text style={styles.tierSubline}>Refreshes every Monday</Text>
              </View>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>ACTIVE</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Sektion 2: Credit packages (one-time purchase) ──── */}
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
                onBuy={() => handleBuyCredits(tier)}
              />
            ))}
          </View>
        </View>

        {/* ── Sektion 3: QuizVibe Premium (subscription) ──────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QuizVibe subscription</Text>
          <Text style={styles.sectionSubtitle}>
            Unlimited host games + premium features.
          </Text>

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

          {/* Pris-tiers */}
          <View style={styles.tierList}>
            {SUBSCRIPTION_TIERS.map((tier) => (
              <SubscriptionTierCard
                key={tier.id}
                tier={tier}
                onBuy={() => handleBuySubscription(tier)}
              />
            ))}
          </View>

          <Text style={styles.autoRenewNote}>
            All subscriptions auto-renew. Cancel anytime in your App Store
            or Google Play account.
          </Text>
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Credit tier card ─────────────────────────────────────────────────────────

function CreditTierCard({
  tier,
  onBuy,
}: {
  tier: CreditTier;
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
          <Text style={styles.tierPrice}>{tier.price}</Text>
          <Pressable
            onPress={onBuy}
            style={({ pressed }) => [
              styles.buyBtn,
              { backgroundColor: accent },
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

// ─── Subscription tier card ───────────────────────────────────────────────────

function SubscriptionTierCard({
  tier,
  onBuy,
}: {
  tier: SubscriptionTier;
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
          <Text style={styles.tierHeadline}>{tier.label}</Text>
          <Text style={styles.tierSubline}>{tier.pricePerMonth}</Text>
          {tier.savePct !== undefined && (
            <Text style={[styles.tierSave, { color: accent }]}>
              Save {tier.savePct}%
            </Text>
          )}
        </View>
        <View style={styles.tierRight}>
          <Text style={styles.tierPrice}>{tier.price}</Text>
          <Pressable
            onPress={onBuy}
            style={({ pressed }) => [
              styles.buyBtn,
              { backgroundColor: accent },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.buyBtnText}>Subscribe</Text>
          </Pressable>
        </View>
      </View>
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
    paddingBottom: Spacing.xxl,
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
    color: '#000',
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

  bottomPad: { height: Spacing.xl },
});

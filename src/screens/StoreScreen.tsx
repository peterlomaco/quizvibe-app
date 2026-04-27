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
import { loadProfile, saveProfile } from '../utils/profileStorage';

// ─── Extra Games tiers (mock tills IAP finns) ─────────────────────────────────
// TODO (backend): Priser och köpstatus hämtas från App Store / Play Store-IAP
// i Fas X. Just nu mock — vid "köp" ökar bara local gameCredits i AsyncStorage.

interface ExtraGamesTier {
  id: string;
  games: number;
  price: string;            // visas i UI
  pricePerGame: string;     // visas i UI ("$0.40/game")
  badge?: string;           // t.ex. "MOST POPULAR" eller "BEST VALUE"
  savePct?: number;         // hur många % billigare per game vs minsta paketet
}

const TIERS: ExtraGamesTier[] = [
  {
    id: 'tier-5',
    games: 5,
    price: '$1.99',
    pricePerGame: '$0.40 / game',
  },
  {
    id: 'tier-15',
    games: 15,
    price: '$4.99',
    pricePerGame: '$0.33 / game',
    savePct: 17,
  },
  {
    id: 'tier-50',
    games: 50,
    price: '$13.99',
    pricePerGame: '$0.28 / game',
    badge: 'MOST POPULAR',
    savePct: 30,
  },
  {
    id: 'tier-100',
    games: 100,
    price: '$24.99',
    pricePerGame: '$0.25 / game',
    badge: 'BEST VALUE',
    savePct: 38,
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function StoreScreen() {
  // Mock-purchase: bekräfta + öka gameCredits i sparad profil.
  // TODO (backend): byt mot riktig IAP-flow (App Store / Play Store).
  const handleBuy = (tier: ExtraGamesTier) => {
    Alert.alert(
      'Confirm purchase',
      `Buy ${tier.games} Extra Games for ${tier.price}?`,
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
            Alert.alert(
              'Purchase successful',
              `${tier.games} games added — you now have ${newCredits} credits.`,
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Store</Text>
          <Text style={styles.screenSubtitle}>
            Buy Extra Games — the more you buy, the cheaper per game.
          </Text>
        </View>

        {/* Ad-Free banner */}
        <View style={styles.adFreeBanner}>
          <Text style={styles.adFreeIcon}>🎉</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.adFreeTitle}>Includes Ad-Free Experience</Text>
            <Text style={styles.adFreeSubtitle}>
              For you & everyone in your room
            </Text>
          </View>
        </View>

        {/* Tiers (vertical list) */}
        <View style={styles.tierList}>
          {TIERS.map((tier) => (
            <TierCard key={tier.id} tier={tier} onBuy={() => handleBuy(tier)} />
          ))}
        </View>

        {/* Footer note */}
        <Text style={styles.footerNote}>
          Credits never expire — use them whenever you create a game.
        </Text>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Tier Card ────────────────────────────────────────────────────────────────

function TierCard({ tier, onBuy }: { tier: ExtraGamesTier; onBuy: () => void }) {
  const isHighlight = tier.badge === 'BEST VALUE' || tier.badge === 'MOST POPULAR';
  const accent = tier.badge === 'BEST VALUE' ? Colors.warning : Colors.primary;

  return (
    <View style={[styles.tierCard, isHighlight && { borderColor: accent }]}>
      {tier.badge && (
        <View style={[styles.tierBadge, { backgroundColor: accent }]}>
          <Text style={styles.tierBadgeText}>{tier.badge}</Text>
        </View>
      )}
      <View style={styles.tierContent}>
        <View style={styles.tierLeft}>
          <Text style={styles.tierGames}>
            🎟️ {tier.games}{' '}
            <Text style={styles.tierGamesUnit}>games</Text>
          </Text>
          <Text style={styles.tierPerGame}>{tier.pricePerGame}</Text>
          {tier.savePct !== undefined && (
            <Text style={[styles.tierSave, { color: accent }]}>Save {tier.savePct}%</Text>
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

  // Header
  header: { gap: 4 },
  screenTitle: { ...Typography.screenTitle, color: Colors.textPrimary },
  screenSubtitle: { ...Typography.label, color: Colors.textSecondary },

  // Ad-Free banner (gold, prominent)
  adFreeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.warningMuted,
    borderWidth: 1,
    borderColor: Colors.warningBorder,
    shadowColor: Colors.warning,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  adFreeIcon: { fontSize: 26 },
  adFreeTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.warning,
    letterSpacing: 0.2,
  },
  adFreeSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
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
  tierContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  tierLeft: {
    flex: 1,
    gap: 2,
  },
  tierGames: {
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  tierGamesUnit: {
    fontSize: 14,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  tierPerGame: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
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
    fontSize: 20,
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

  // Footer
  footerNote: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },

  bottomPad: { height: Spacing.xl },
});

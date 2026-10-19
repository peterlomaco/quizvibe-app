import { router, usePathname } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/src/components/haptic';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND_UI_ACTIVE, BRAND_UI_INACTIVE } from './brand/QuizVibeBrandSvg';
import { ProfileOutlineIcon } from './ProfileOutlineIcon';
import { QuizVibeQAvatar } from './QuizVibeQAvatar';
import { ShoppingCartIcon } from './ShoppingCartIcon';
import { Colors, FontSize, Radius, Spacing } from '../theme';
import { getCachedProfile, loadProfile, subscribeProfileChanges } from '../utils/profileStorage';
import { supabase } from '../utils/supabase';
// Osparade ändringar (Profile) → samma "Unsaved changes"-popup som top bannerns Home.
import { runWithNavigationGuard } from '../utils/navigationGuard';

export const BOTTOM_BANNER_HEIGHT = 52;

const SHOW_ON = ['/', '/profile', '/store', '/my-matches', '/competitions'];

// Normalized nav icon set: every icon sits in the same 24 pt box and uses the
// same visible stroke weight (1.8 pt). The Q gets a slightly smaller render
// size (its glyph fills more of its viewBox) and its strokes are given in its
// own viewBox units, converted so they land on the same pt weights.
const NAV_ICON_BOX = 24;
const NAV_STROKE_PT = 1.8;
const NAV_Q_SIZE = 22;
const Q_WIFI_VIEWBOX = 36; // QuizVibeQAvatar 'wifi' viewBox width
const Q_UNITS_PER_PT = Q_WIFI_VIEWBOX / NAV_Q_SIZE;
// Brand rule: the arcs stay thinner than the ring.
const NAV_Q_RING_STROKE = NAV_STROKE_PT * Q_UNITS_PER_PT;
const NAV_Q_ARC_STROKE = NAV_STROKE_PT * 0.75 * Q_UNITS_PER_PT;

interface TabItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onPress: () => void;
}

function TabItem({ icon, label, active, onPress }: TabItemProps) {
  return (
    <Pressable
      style={[styles.tab, active && styles.tabActive]}
      onPress={onPress}
      hitSlop={4}
    >
      <View style={styles.iconBox}>{icon}</View>
      <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export function BottomBanner() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // Bannern visas bara för inloggade users (samma definition som Home:s
  // isLoggedIn = !!profile). Bannern lever i _layout utanför screen-trädet
  // så useFocusEffect fungerar inte — istället lyssnar vi på:
  //   1. subscribeProfileChanges — fyrar vid saveProfile (register) och
  //      clearProfile (logout/delete account).
  //   2. supabase auth-events — SIGNED_IN fyrar vid login (profilen läses
  //      då från Supabase innan lokala cachen hunnit skrivas).
  //   3. pathname-byten — belt-and-suspenders vid navigation.
  //   4. den synkrona profil-spegeln (getCachedProfile) som seed — annars
  //      försvann bannern under varje route-bytes loadProfile-roundtrip och
  //      poppade tillbaka en stund senare.
  const [loggedIn, setLoggedIn] = useState(() => !!getCachedProfile());

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const profile = await loadProfile();
      if (!cancelled) setLoggedIn(!!profile);
    };
    // Spegeln först (synkront), sedan den auktoritativa laddningen.
    // `undefined` = ohydrerad → rör inte state.
    const cached = getCachedProfile();
    if (cached !== undefined) setLoggedIn(!!cached);
    void refresh();
    const unsubscribeProfile = subscribeProfileChanges(() => {
      void refresh();
    });
    const { data: authSub } = supabase.auth.onAuthStateChange(() => {
      void refresh();
    });
    return () => {
      cancelled = true;
      unsubscribeProfile();
      authSub.subscription.unsubscribe();
    };
  }, [pathname]);

  if (!loggedIn || !SHOW_ON.includes(pathname)) return null;

  const isHome = pathname === '/';
  const isProfile = pathname === '/profile';
  const isStore = pathname === '/store';

  // Brand UI-state rule (design/brand/README.md): ONLY the active tab is gold;
  // every inactive tab uses the same reduced-opacity white.
  const col = (active: boolean) => (active ? BRAND_UI_ACTIVE : BRAND_UI_INACTIVE);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors.background },
        { paddingBottom: insets.bottom || Spacing.sm },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.divider} />
      <View style={styles.row}>
        <TabItem
          icon={
            <QuizVibeQAvatar
              size={NAV_Q_SIZE}
              variant="wifi"
              color={col(isHome)}
              strokeWidth={NAV_Q_RING_STROKE}
              detailStrokeWidth={NAV_Q_ARC_STROKE}
            />
          }
          label="Home"
          active={isHome}
          onPress={() => runWithNavigationGuard(() => router.replace('/'))}
        />
        <TabItem
          icon={<ProfileOutlineIcon size={NAV_ICON_BOX} color={col(isProfile)} strokeWidth={NAV_STROKE_PT} />}
          label="Profile"
          active={isProfile}
          onPress={() => router.replace('/profile')}
        />
        <TabItem
          icon={<ShoppingCartIcon size={NAV_ICON_BOX} color={col(isStore)} />}
          label="Store"
          active={isStore}
          onPress={() => runWithNavigationGuard(() => router.replace('/store'))}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    height: BOTTOM_BANNER_HEIGHT,
    paddingHorizontal: Spacing.sm,
    paddingTop: 8,
    gap: Spacing.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabActive: {},
  iconBox: {
    width: NAV_ICON_BOX,
    height: NAV_ICON_BOX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FontSize.xs,
    color: BRAND_UI_INACTIVE,
    fontWeight: '500',
  },
  labelActive: {
    color: BRAND_UI_ACTIVE,
    fontWeight: '600',
  },
});

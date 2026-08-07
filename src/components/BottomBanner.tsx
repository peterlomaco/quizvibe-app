import { router, usePathname } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QuizVibeQAvatar } from './QuizVibeQAvatar';
import { ShoppingCartIcon } from './ShoppingCartIcon';
import { Colors, FontSize, Radius, Spacing } from '../theme';
import { loadProfile, subscribeProfileChanges } from '../utils/profileStorage';
import { supabase } from '../utils/supabase';

export const BOTTOM_BANNER_HEIGHT = 52;

const SHOW_ON = ['/', '/profile', '/store', '/my-matches'];

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
      {icon}
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
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const profile = await loadProfile();
      if (!cancelled) setLoggedIn(!!profile);
    };
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

  const col = (active: boolean) => (active ? Colors.warning : Colors.textSecondary);

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom || Spacing.sm },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.divider} />
      <View style={styles.row}>
        <TabItem
          icon={<QuizVibeQAvatar size={26} variant="wifi" color={col(isHome)} />}
          label="Home"
          active={isHome}
          onPress={() => router.replace('/')}
        />
        <TabItem
          icon={<QuizVibeQAvatar size={26} variant="smile" color={col(isProfile)} />}
          label="Profile"
          active={isProfile}
          onPress={() => router.replace('/profile')}
        />
        <TabItem
          icon={<ShoppingCartIcon size={22} color={col(isStore)} />}
          label="Store"
          active={isStore}
          onPress={() => router.replace('/store')}
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
  label: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  labelActive: {
    color: Colors.warning,
    fontWeight: '600',
  },
});

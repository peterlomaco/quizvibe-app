import {
  addCustomerInfoListener,
  configurePurchases,
  ENTITLEMENTS,
  getCustomerInfo,
  hasEntitlement,
  logOutPurchases,
} from '@/src/lib/iap';
import { BottomBanner } from '@/src/components/BottomBanner';
import { Colors } from '@/src/theme';
import { setPremiumActive } from '@/src/utils/subscriptionStorage';
import { supabase } from '@/src/utils/supabase';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  // Konfigurera RevenueCat IAP-SDK vid app-start. Om EXPO_PUBLIC_REVENUECAT_IOS_KEY
  // saknas i .env är detta en no-op (no-throw) så dev-flow fortsätter funka
  // tills Peter satt upp RC-projektet. configurePurchases är idempotent.
  // userId-arg:t passas in via auth-state-change-listener nedan när en session
  // dyker upp så purchases följer med user över devices.
  //
  // Efter init:n syncar vi customerInfo → lokal hasPremium-flag (driven av
  // subscriptionStorage som Lobby/Profile läser). Plus en listener för
  // entitlement-uppdateringar (subscription renew/expire, restore-flow,
  // cross-device-sync). Det säkrar att en subscription som expirerar
  // tystnar Premium-features i appen utan att kräva manual refresh.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await configurePurchases();
      if (cancelled) return;

      const info = await getCustomerInfo();
      if (cancelled) return;
      await setPremiumActive(hasEntitlement(info, ENTITLEMENTS.PREMIUM));
    })();

    const removeListener = addCustomerInfoListener((info) => {
      // Best-effort — om sync misslyckas (rare disk-write-fel) återhämtar
      // sig nästa app-launch via init-syncen ovan.
      void setPremiumActive(hasEntitlement(info, ENTITLEMENTS.PREMIUM));
    });

    return () => {
      cancelled = true;
      removeListener();
    };
  }, []);

  // Lyssna på auth-events globalt så vi kan reagera vid TOKEN_REFRESHED /
  // SIGNED_OUT / USER_UPDATED utanför Home-skärmen (t.ex. om session expirar
  // medan user är i Lobby). RevenueCat-identiteten sync:as här så purchases
  // automatiskt associerar med rätt Supabase-user vid login + reset:as till
  // anonymous user vid logout.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (__DEV__) {
        console.log('[supabase] auth event:', event);
      }
      if (event === 'SIGNED_IN' && session?.user?.id && !session.user.is_anonymous) {
        // Real user-id — koppla RC till Supabase user för cross-device sync.
        // is_anonymous-check så vi inte associerar RC med en throw-away anon user.
        void configurePurchases(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        void logOutPurchases();
      }
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor={Colors.background} />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Bottom tab-bar borttagen (D-0 2026-05-12). Alla skärmar ligger
            som plain Stack-routes; navigation mellan dem sker explicit via
            TopUserBanner, in-screen-knappar och router.push/replace med
            `from`-param för Back-routing. */}
        <Stack.Screen name="index" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="lobby" />
        <Stack.Screen name="leaderboards" />
        <Stack.Screen name="store" />
        <Stack.Screen name="quiz" />
        <Stack.Screen name="name-quiz-demo" />
        <Stack.Screen name="sketch-demo" />
        <Stack.Screen name="guess-who-demo" />
      </Stack>
      <BottomBanner />
    </GestureHandlerRootView>
  );
}
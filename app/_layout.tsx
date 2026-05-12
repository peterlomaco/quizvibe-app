import { Colors } from '@/src/theme';
import { supabase } from '@/src/utils/supabase';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  // Lyssna på auth-events globalt så vi kan reagera vid TOKEN_REFRESHED /
  // SIGNED_OUT / USER_UPDATED utanför Home-skärmen (t.ex. om session expirar
  // medan user är i Lobby). Skärmarna driver UI:t lokalt via setProfile, så
  // den här lyssnaren loggar bara just nu — vidare reaktioner kopplas in i
  // Fas 2 när profil-data flyttas till Supabase-tabell.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (__DEV__) {
        console.log('[supabase] auth event:', event);
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
      </Stack>
    </GestureHandlerRootView>
  );
}
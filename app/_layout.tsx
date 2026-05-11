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
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="quiz" options={{ headerShown: false }} />
        <Stack.Screen name="name-quiz-demo" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
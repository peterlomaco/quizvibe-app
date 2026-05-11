// Supabase client singleton — Fas 1 (auth-only).
//
// Backend-integration börjar med auth (email/password). Övriga mock-stores
// (mockActiveRooms, mockLobbyPlayers, profileStorage etc.) lever vidare som-är
// tills senare faser portar dem till Supabase-tabeller + Realtime.
//
// Konfiguration läses från EXPO_PUBLIC_*-env-vars i .env (gitignore:ad). Vid
// builds via Expo inlines:as dessa i bundlen vid kompilering. Saknas värdena
// kastar vi early så vi inte tyst kör mot 'undefined.supabase.co'.

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    'Missing Supabase env vars. Copy .env.example to .env and fill in EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
  );
}

export const supabase = createClient(url, key, {
  auth: {
    // AsyncStorage persisterar sessionen mellan app-omstarter så user inte
    // behöver logga in varje gång appen öppnas.
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // RN saknar URL fragment-detect som webben använder för OAuth-callback;
    // sätt false så SDK:n inte försöker parsa window.location.
    detectSessionInUrl: false,
  },
});

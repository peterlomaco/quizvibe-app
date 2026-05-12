// Auth-session helpers — Fas 3 Slice C-ii.
//
// Guests har ingen registrerad Supabase-konto, men RLS-policies på
// lobby_players (INSERT requires authenticated, UPDATE requires
// user_id = auth.uid()) blockerar utan en session. Lösning: Supabase
// anonymous auth — guests får en riktig auth.uid() (med is_anonymous=true
// i JWT) som tilldelas authenticated-rollen, så existerande RLS-policies
// funkar utan ändringar.
//
// Kräver att "Anonymous sign-ins" är aktiverat i Supabase Dashboard under
// Authentication > Sign In / Up > Anonymous Sign-Ins. Annars returnerar
// signInAnonymously en 422-error "Anonymous sign-ins are disabled".
//
// Sessionen persisteras via AsyncStorage (konfigurerat i supabase.ts) så
// guests behåller samma anon user_id mellan app-restarts — bra både för
// "guest kommer tillbaka senare och ser sina egna left-rader" och för
// att inte spamma auth.users med ny rad varje gång appen öppnas.

import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

// In-flight Promise så samtidiga anrop (t.ex. både handleJoinAsGuest och
// upsertOwnLobbyPlayer triggar på samma render-cykel) delar samma
// sign-in-Promise istället för att skapa flera anon users i parallell.
let pendingAuthPromise: Promise<User | null> | null = null;

/**
 * Säkerställer att klienten har en aktiv Supabase-session. Om en session
 * redan finns (registrerad user eller tidigare anon-session från
 * AsyncStorage) returneras user:n direkt. Annars signas user:n in som
 * anonym och den nya user:n returneras.
 *
 * Returnerar null om sign-in misslyckas (t.ex. anonymous auth disabled
 * i Supabase Dashboard, network error). Call-sites bör logga och
 * fortsätta — RLS kommer fortfarande blockera writes, men app:en
 * kraschar inte.
 *
 * Idempotent + concurrent-safe via pendingAuthPromise-cache. Inga
 * race conditions skapar duplicate anon users.
 */
export async function ensureAuthSession(): Promise<User | null> {
  if (pendingAuthPromise) return pendingAuthPromise;
  pendingAuthPromise = (async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user) {
        return sessionData.session.user;
      }
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.warn('[auth] signInAnonymously failed:', error.message);
        return null;
      }
      return data.user ?? null;
    } catch (err) {
      console.warn('[auth] ensureAuthSession threw:', err);
      return null;
    } finally {
      // Rensa cachen så future-anrop kan starta om vid sign-out/network-fail.
      pendingAuthPromise = null;
    }
  })();
  return pendingAuthPromise;
}

// Auth-session helpers — Fas 3 Slice C-ii.
//
// Guests har ingen registrerad Supabase-konto, men RLS-policies på
// lobby_players (INSERT requires authenticated, UPDATE requires
// user_id = auth.uid()) blockerar utan en session. Lösning: Supabase
// anonymous auth — guests får en riktig auth.uid() (med is_anonymous=true
// i JWT) som tilldelas authenticated-rollen, så existerande RLS-policies
// funkar utan ändringar.
//
// Pre-launch bot-skydd (2026-05-22): vi anropar Edge Function 'anon-signup'
// istället för direkt supabase.auth.signInAnonymously(). Function:n
// rate-limitar per IP (max 5 signups per IP per 1h) för att stoppa bots
// från att spamma anon-signups → MAU-bloat. Function:n returnerar
// access/refresh tokens som vi sätter via supabase.auth.setSession() så
// klient-state blir identisk med direkt sign-in-flödet.
//
// Vid 429 rate-limit returnerar function:n felmeddelande och klienten
// får null tillbaka (samma fail-mode som "anonymous auth disabled").
// Call-sites hanterar redan null-user via existerande if-checks.
//
// Kräver att "Anonymous sign-ins" är aktiverat i Supabase Dashboard under
// Authentication > Sign In / Up > Anonymous Sign-Ins (function:n använder
// signInAnonymously server-side).
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
 * AsyncStorage) returneras user:n direkt. Annars anropas Edge Function
 * 'anon-signup' som rate-limit-checkar + signar in anonymt + returnerar
 * tokens; tokens sätts via setSession och user:n returneras.
 *
 * Returnerar null om sign-in misslyckas (rate-limited, function deploy
 * saknad, anonymous auth disabled i Dashboard, network error). Call-
 * sites bör logga och fortsätta — RLS kommer fortfarande blockera
 * writes, men app:en kraschar inte.
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

      const { data, error } = await supabase.functions.invoke<{
        access_token?: string;
        refresh_token?: string;
        user?: User;
        error?: string;
        message?: string;
      }>('anon-signup', { method: 'POST' });

      if (error) {
        console.warn('[auth] anon-signup invoke failed:', error.message);
        return null;
      }
      if (data?.error) {
        // Edge Function returnerade ett 4xx/5xx-body med error-fält
        // (typiskt 'rate_limited' eller 'signup_failed').
        console.warn('[auth] anon-signup returned error:', data.error, data.message ?? '');
        return null;
      }
      if (!data?.access_token || !data?.refresh_token) {
        console.warn('[auth] anon-signup returned no tokens');
        return null;
      }

      const { data: setData, error: setError } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      if (setError || !setData.user) {
        console.warn('[auth] setSession failed:', setError?.message);
        return null;
      }
      return setData.user;
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

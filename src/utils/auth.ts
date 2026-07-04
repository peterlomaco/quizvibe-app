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

import AsyncStorage from '@react-native-async-storage/async-storage';
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

/**
 * Login-via-PlayerName utan att exponera email:en klient-side.
 *
 * Anropar Edge Function 'login-by-name' som slår upp email:en server-side,
 * kör signInWithPassword, och returnerar session-tokens (aldrig email:en).
 * Tokens sätts via setSession så klient-state blir identisk med ett vanligt
 * signInWithPassword-flöde.
 *
 * Ersätter det tidigare klient-flödet (lookupEmailByPlayerName +
 * signInWithPassword) som läckte email givet ett öppet synligt PlayerName.
 *
 * Function:n returnerar ett generiskt 'invalid_credentials' för BÅDE
 * "namnet finns inte" och "fel lösenord" — ingen enumerering. Returnerar
 * { ok: false, reason } vid alla fel; call-site visar ett generiskt
 * "Invalid PlayerName or password"-meddelande.
 */
export async function signInWithPlayerName(
  playerName: string,
  password: string,
): Promise<{ ok: true; user: User } | { ok: false; reason: string }> {
  try {
    const { data, error } = await supabase.functions.invoke<{
      access_token?: string;
      refresh_token?: string;
      user?: User;
      error?: string;
    }>('login-by-name', { method: 'POST', body: { playerName, password } });

    if (error) {
      console.warn('[auth] login-by-name invoke failed:', error.message);
      return { ok: false, reason: error.message ?? 'invoke_failed' };
    }
    if (data?.error || !data?.access_token || !data?.refresh_token) {
      return { ok: false, reason: data?.error ?? 'invalid_credentials' };
    }

    const { data: setData, error: setError } = await supabase.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
    if (setError || !setData.user) {
      console.warn('[auth] setSession failed:', setError?.message);
      return { ok: false, reason: setError?.message ?? 'session_failed' };
    }
    return { ok: true, user: setData.user };
  } catch (err) {
    console.warn('[auth] signInWithPlayerName threw:', err);
    return { ok: false, reason: 'network_error' };
  }
}

/**
 * Permanent radering av inloggad user — driver "Delete Account"-knappen
 * i Profile-skärmens logout-sheet. Krav från Apple App Store Guideline
 * 5.1.1(v): apps med kontoflow måste erbjuda in-app deletion.
 *
 * Flöde:
 *   1. Anropar Edge Function 'delete-account' som validerar JWT:n och
 *      kör admin.auth.admin.deleteUser(user_id). CASCADE-policies på
 *      profiles + rooms + waiting_invites rensar resten automatiskt
 *      server-side. lobby_players.user_id → NULL (SET NULL).
 *   2. Nuke:ar ALL lokal AsyncStorage under `@quizvibe/*`-prefixet —
 *      profile-cache, friends, waiting-invites-cache, gameHistory osv.
 *      User har explicit bett om permanent deletion så ingen anledning
 *      att behålla per-user-data lokalt.
 *   3. Kör supabase.auth.signOut() för att rensa session-token.
 *
 * Returnerar `{ ok: true }` vid success, `{ ok: false, reason }` annars.
 * Call-site:s ansvar att visa lämpligt felmeddelande + analytics. Lokal
 * AsyncStorage rensas BARA om server-deletion lyckades — annars hamnar
 * vi i ett inconsistent state där lokala data är borta men user:n
 * fortfarande finns i Supabase.
 */
export async function deleteAccount(): Promise<
  { ok: true } | { ok: false; reason: string }
> {
  try {
    const { data, error } = await supabase.functions.invoke<{
      ok?: boolean;
      error?: string;
      message?: string;
    }>('delete-account', { method: 'POST' });

    if (error) {
      return { ok: false, reason: error.message ?? 'invoke_failed' };
    }
    if (!data?.ok) {
      return { ok: false, reason: data?.error ?? 'unknown_error' };
    }

    // Server-deletion lyckades — rensa lokal storage.
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const quizvibeKeys = allKeys.filter((k) => k.startsWith('@quizvibe/'));
      if (quizvibeKeys.length > 0) {
        await AsyncStorage.multiRemove(quizvibeKeys);
      }
    } catch (storageErr) {
      // Logga men bryt inte success-pathen — server-side är redan klart,
      // local storage kan rensas senare via reinstall om det skulle behövas.
      console.warn('[auth] AsyncStorage cleanup failed after delete:', storageErr);
    }

    // Rensa Supabase session-token. signOut är best-effort — om den
    // failar har user fortfarande en stale token lokalt men auth-user:n
    // är raderad server-side så token:en är oanvändbar i praktiken.
    try {
      await supabase.auth.signOut();
    } catch (signOutErr) {
      console.warn('[auth] signOut after delete failed:', signOutErr);
    }

    return { ok: true };
  } catch (err) {
    console.warn('[auth] deleteAccount threw:', err);
    return { ok: false, reason: 'network_error' };
  }
}

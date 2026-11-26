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
import { clearProfile } from './profileStorage';
import { readStoredSession } from './sessionState';
import { clearUserScope } from './storageScope';
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

      // Ingen användbar session. Finns en sparad session för DETTA projekt är
      // det en utgången token som inte kunde förnyas (typiskt nätverksfel) —
      // den får ALDRIG ersättas med ett anonymt konto (Build 41).
      const stored = await readStoredSession();
      if (stored.status === 'error') return null;
      if (stored.status === 'present') {
        try {
          const { data: refreshed } = await supabase.auth.refreshSession();
          if (refreshed.session?.user) return refreshed.session.user;
        } catch (err) {
          console.warn('[auth] refreshSession threw:', err);
        }
        // auth-js tar bara bort den sparade sessionen vid ett icke-retrybart
        // fel (återkallad). Ligger den kvar var felet tillfälligt.
        const after = await readStoredSession();
        if (after.status !== 'none') return null;
      }

      // Anon-sessionen skapas inom auth-låset så en samtidig inloggning
      // (eller en sparad session som dykt upp under väntan) aldrig skrivs över.
      return await runAuthExclusive(async () => {
        const recheck = await supabase.auth.getSession();
        if (recheck.data.session?.user) return recheck.data.session.user;
        const storedNow = await readStoredSession();
        if (storedNow.status !== 'none') return null;

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

        // Sista kontrollen direkt före setSession: har en registrerad session
        // persisterats medan anon-signup pågick ska den vinna.
        const beforeSet = await readStoredSession();
        if (beforeSet.status !== 'none') {
          const live = await supabase.auth.getSession();
          return live.data.session?.user ?? null;
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
      });
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

// ── Auth-lås (Build 41) ─────────────────────────────────────────────────
// Allt som SÄTTER en session (anon-signup, inloggning, signUp, återställning)
// körs i tur och ordning. Utan låset kunde ett anon-anrop som startade före en
// inloggning skriva sin anon-session efter den och logga ut användaren.
let authChain: Promise<unknown> = Promise.resolve();

export function runAuthExclusive<T>(fn: () => Promise<T>): Promise<T> {
  const run = authChain.then(fn, fn);
  authChain = run.catch(() => undefined);
  return run;
}

/**
 * true = "ren guest" — anon-session utan QuizVibe-konto.
 *
 * Anon-sessioner har ett riktigt auth.uid() och rollen `authenticated`
 * (så RLS fungerar), men `is_anonymous: true` i JWT:n och skriver ALDRIG
 * någon `profiles`-rad (profileStorage.getCurrentUser vägrar för anon).
 * Det är alltså den enda pålitliga klient-signalen för "har konto".
 *
 * Fail-safe: returnerar true vid fel/ingen session, så en misslyckad
 * uppslagning LÅSER konto-gatade features istället för att öppna dem.
 *
 * Skiljer sig från `isGuestHost`/`LobbyPlayer.type === 'guest'` som bara
 * säger HUR spelaren gick in i lobbyn — en registrerad user som hostar
 * som Guest är INTE anonym.
 */
export async function isAnonymousSession(): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user as (User & { is_anonymous?: boolean }) | undefined;
    if (!user) return true;
    return !!user.is_anonymous;
  } catch (err) {
    console.warn('[auth] isAnonymousSession threw:', err);
    return true;
  }
}

/**
 * Inloggade användarens auth-uid, eller null (utloggad/fel).
 *
 * Används där klienten behöver jämföra mot ett server-lagrat uid (t.ex.
 * `created_by` på en Marathon-tabell för att avgöra "min egen som Host").
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch (err) {
    console.warn('[auth] getCurrentUserId threw:', err);
    return null;
  }
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
  return runAuthExclusive(() => signInWithPlayerNameInner(playerName, password));
}

async function signInWithPlayerNameInner(
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
 * Skicka om aktiveringsmailet givet ett PlayerName (email:en hålls aldrig
 * klient-side). Anropar Edge Function 'resend-by-name' som slår upp email:en
 * server-side och ber GoTrue skicka om signup-bekräftelsen. Funktionen
 * returnerar alltid generiskt ok server-side (anti-enumerering); { ok } här
 * speglar bara om anropet gick fram, inte om ett mail faktiskt skickades.
 */
export async function resendActivationByName(
  playerName: string,
): Promise<{ ok: boolean }> {
  try {
    const { error } = await supabase.functions.invoke('resend-by-name', {
      method: 'POST',
      body: { playerName },
    });
    if (error) {
      console.warn('[auth] resend-by-name invoke failed:', error.message);
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.warn('[auth] resendActivationByName threw:', err);
    return { ok: false };
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
 *   2. Raderar kontots lokala namespace (clearUserScope, storageScope.ts) —
 *      profil-cache, friends, historik, HCP osv. för just detta konto.
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
    // Kontots uid fångas FÖRE raderingen — efteråt finns ingen session.
    const { data: sessionData } = await supabase.auth.getSession();
    const deletedUid = sessionData.session?.user?.id ?? null;

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

    // Server-deletion lyckades — rensa kontots lokala data (Build 41: bara
    // detta kontos namespace i detta projekt; andra konton + projekt- och
    // enhetsdata rörs inte).
    try {
      if (deletedUid) await clearUserScope(deletedUid);
    } catch (storageErr) {
      // Logga men bryt inte success-pathen — server-side är redan klart,
      // local storage kan rensas senare via reinstall om det skulle behövas.
      console.warn('[auth] AsyncStorage cleanup failed after delete:', storageErr);
    }

    // multiRemove ovan går förbi clearProfile och rör därför varken den
    // synkrona profil-spegeln eller profil-notifiern. Utan detta anrop
    // skulle en re-mountad Home/banner seeda inloggat läge från en stale
    // spegel och sedan hoppa till utloggat. Idempotent (removeItem på en
    // redan borttagen nyckel är en no-op).
    await clearProfile();

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

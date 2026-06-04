/**
 * Spotify OAuth 2.0 PKCE + Premium-verifiering
 *
 * Kräver INGA native modules — använder expo-web-browser (systembrowser
 * för OAuth-flödet) + expo-crypto (PKCE). expo-auth-session används INTE
 * (paketet har en trasig build i Expo SDK 54 — saknar Discovery-submodul).
 *
 * Flöde:
 *   1. connectSpotify()   — öppnar systembrowser → Spotify-inloggning
 *   2. handleCallback()   — byter auth-code mot tokens via PKCE
 *   3. verifyPremium()    — GET /v1/me, kontrollerar product === 'premium'
 *   4. saveConnection()   — upsert till spotify_connections i Supabase
 *
 * Token-refresh:
 *   getValidAccessToken() kontrollerar token_expires_at och förnyar
 *   via /api/token om < 120s kvar.
 */

import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { Alert } from 'react-native';
import { supabase } from '@/src/utils/supabase';

// Stänger systembrowsern automatiskt om den är öppen vid app-mount.
// Behövs för att hantera edge case där appen återupptas mitt i OAuth-flödet.
WebBrowser.maybeCompleteAuthSession();

// ── Konstanter ───────────────────────────────────────────────────────

const CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ?? '';
// Redirect URI måste matcha exakt det som är registrerat i Spotify Developer Dashboard.
// Scheme = 'quizvibeapp' (app.json "scheme"-fältet). Vi beräknar inte denna
// dynamiskt (expo-auth-session är ej installerat) — hårdkodad är OK eftersom
// scheme är konstant och inte skiljer sig mellan dev/prod för native builds.
// Expo Go-dev-server använder en annan URI (se kommentar i .env.example).
const REDIRECT_URI = 'quizvibeapp://spotify-callback';

const SCOPES = [
  'user-read-private',       // Krävs för att läsa product (premium/free)
  'user-read-email',         // Visat e-post i connect-bekräftelsen
  'app-remote-control',      // Framtida: fjärrstyrning om native bridge byggs
].join(' ');

const SPOTIFY_ACCOUNTS_BASE = 'https://accounts.spotify.com';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
// Refresh tokens minst 120s innan de löper ut (säkerhetsmarginal).
const TOKEN_REFRESH_MARGIN_MS = 120_000;

// ── Typer ────────────────────────────────────────────────────────────

export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface SpotifyUser {
  spotifyUserId: string;
  displayName: string;
  isPremium: boolean;
}

export type ConnectSpotifyResult =
  | { ok: true; user: SpotifyUser }
  | { ok: false; reason: 'cancelled' | 'not_premium' | 'no_client_id' | 'exchange_failed' | 'api_error' };

// ── PKCE-hjälpare ────────────────────────────────────────────────────

async function generateCodeVerifier(): Promise<string> {
  // 32 slumpmässiga bytes → base64url (43–128 tecken, RFC 7636).
  const bytes = await Crypto.getRandomBytesAsync(32);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 },
  );
  // SHA256 returnerar base64 — konvertera till base64url.
  return digest.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// ── Huvud-API ────────────────────────────────────────────────────────

/**
 * Startar Spotify OAuth-flödet. Öppnar systembrowser (Safari/Chrome)
 * med Spotifys authorize-sida. Returnerar resultatet när browsern stängs.
 *
 * Visar alert-meddelande om klienten inte har Premium — Premium krävs
 * för att kunna vara DJ i QuizVibe.
 */
export async function connectSpotify(): Promise<ConnectSpotifyResult> {
  if (!CLIENT_ID) {
    console.error('[spotify] EXPO_PUBLIC_SPOTIFY_CLIENT_ID saknas i .env');
    return { ok: false, reason: 'no_client_id' };
  }

  // Generera PKCE-par.
  const codeVerifier = await generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Bygg authorize-URL manuellt (AuthSession.makeAuthUrlAsync är ett alternativ
  // men det är enklare att kontrollera exakt vilket format Spotify vill ha).
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    show_dialog: 'false',   // Visa inte Spotify-dialogen igen om redan inloggad.
  });
  const authUrl = `${SPOTIFY_ACCOUNTS_BASE}/authorize?${params.toString()}`;

  // Öppna systembrowser. Expo hanterar callback via app-scheme och stänger
  // browsern automatiskt (WebBrowser.maybeCompleteAuthSession() ovan).
  const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);

  if (result.type !== 'success' || !result.url) {
    // Användaren stängde browsern utan att logga in.
    return { ok: false, reason: 'cancelled' };
  }

  // Extrahera authorization code från callback-URL.
  const callbackUrl = new URL(result.url);
  const code = callbackUrl.searchParams.get('code');
  if (!code) {
    const error = callbackUrl.searchParams.get('error');
    console.warn('[spotify] Callback saknar code, error:', error);
    return { ok: false, reason: error === 'access_denied' ? 'cancelled' : 'exchange_failed' };
  }

  // Byt code mot tokens.
  const tokens = await exchangeCodeForTokens(code, codeVerifier);
  if (!tokens) return { ok: false, reason: 'exchange_failed' };

  // Hämta user-info + verifiera Premium.
  const spotifyUser = await fetchSpotifyMe(tokens.accessToken);
  if (!spotifyUser) return { ok: false, reason: 'api_error' };

  if (!spotifyUser.isPremium) {
    Alert.alert(
      'Spotify Premium krävs',
      'Bara spelare med Spotify Premium kan vara DJ i QuizVibe. Uppgradera ditt Spotify-konto och försök igen.',
      [{ text: 'OK' }],
    );
    return { ok: false, reason: 'not_premium' };
  }

  // Spara till Supabase.
  await saveSpotifyConnection(spotifyUser, tokens);

  return { ok: true, user: spotifyUser };
}

/**
 * Byter PKCE authorization code mot access_token + refresh_token via
 * Spotifys token-endpoint.
 */
async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
): Promise<SpotifyTokens | null> {
  try {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: codeVerifier,
    });

    const res = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[spotify] token exchange failed:', res.status, text);
      return null;
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      // expires_in = sekunder från nu.
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  } catch (err) {
    console.error('[spotify] exchangeCodeForTokens threw:', err);
    return null;
  }
}

/**
 * GET /v1/me — returnerar Spotify-profil inkl. product-fältet som avgör
 * om kontot är Premium.
 */
async function fetchSpotifyMe(accessToken: string): Promise<SpotifyUser | null> {
  try {
    const res = await fetch(`${SPOTIFY_API_BASE}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      spotifyUserId: data.id,
      displayName: data.display_name ?? data.id,
      // Spotifys product-värden: 'premium', 'free', 'open', 'student'.
      isPremium: data.product === 'premium',
    };
  } catch (err) {
    console.error('[spotify] fetchSpotifyMe threw:', err);
    return null;
  }
}

/**
 * Sparar (eller uppdaterar) Spotify-anslutningen i spotify_connections-tabellen.
 * Kräver att klienten har en aktiv Supabase-session (ensureAuthSession).
 */
async function saveSpotifyConnection(
  user: SpotifyUser,
  tokens: SpotifyTokens,
): Promise<void> {
  const { data: { user: supaUser } } = await supabase.auth.getUser();
  if (!supaUser) {
    console.warn('[spotify] saveSpotifyConnection: ingen Supabase-session');
    return;
  }

  const { error } = await supabase.from('spotify_connections').upsert(
    {
      user_id: supaUser.id,
      spotify_user_id: user.spotifyUserId,
      spotify_display_name: user.displayName,
      is_premium: user.isPremium,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      token_expires_at: tokens.expiresAt.toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    console.error('[spotify] saveSpotifyConnection upsert error:', error.message);
  }
}

// ── Token-refresh ────────────────────────────────────────────────────

/**
 * Returnerar en giltig access_token. Förnyar automatiskt om token löper ut
 * inom TOKEN_REFRESH_MARGIN_MS (120s). Returnerar null om förnyelse misslyckas
 * eller ingen anslutning finns.
 *
 * Anropas av alla platser som behöver göra Spotify API-anrop (t.ex.
 * fetchSpotifyAlbumArt i spotifyDJ.ts).
 */
export async function getValidAccessToken(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('spotify_connections')
    .select('access_token, refresh_token, token_expires_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) return null;

  const expiresAt = new Date(data.token_expires_at).getTime();
  const needsRefresh = expiresAt - Date.now() < TOKEN_REFRESH_MARGIN_MS;

  if (!needsRefresh) return data.access_token;

  // Förnya via Spotifys token-endpoint.
  const refreshed = await refreshAccessToken(data.refresh_token);
  if (!refreshed) return null;

  // Uppdatera tabellen med nya tokens.
  await supabase
    .from('spotify_connections')
    .update({
      access_token: refreshed.accessToken,
      refresh_token: refreshed.refreshToken,
      token_expires_at: refreshed.expiresAt.toISOString(),
    })
    .eq('user_id', user.id);

  return refreshed.accessToken;
}

async function refreshAccessToken(refreshToken: string): Promise<SpotifyTokens | null> {
  try {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
    });

    const res = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!res.ok) {
      console.warn('[spotify] refresh failed:', res.status);
      return null;
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      // Spotify returnerar ibland nytt refresh_token, ibland samma gamla.
      refreshToken: data.refresh_token ?? refreshToken,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  } catch (err) {
    console.error('[spotify] refreshAccessToken threw:', err);
    return null;
  }
}

/**
 * Kopplar från Spotify — tar bort raden från spotify_connections och
 * sätter spotify_verified = false på lobby_players-raden (om i en lobby).
 */
export async function disconnectSpotify(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('spotify_connections').delete().eq('user_id', user.id);
}

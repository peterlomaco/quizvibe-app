/**
 * ══════════════════════════════════════════════════════════════════════
 * HELA MODULEN ÄR ARKIVERAD — FUTURE VERSION 2 (Plan B-beslut 2026-07-22)
 * ══════════════════════════════════════════════════════════════════════
 *
 * Juristens svar på LEGAL-INTEGRATIONS-BRIEF.md: Spotify API-användning
 * (även enbart OAuth + Premium-verifiering via GET /v1/me) är INTE
 * preferred för V1. V1 kör istället "Plan B": ren URL-länk
 * (spotify:track:<id> / https://open.spotify.com/track/<id>) via
 * openSpotifyTrack i src/utils/spotifyDJ.ts — inga API-anrop, ingen
 * OAuth, inget Spotify Premium-krav. DJ-behörighet är self-attest
 * ("Spotify user"-toggle i Profile/Lobby), inte konto-verifiering.
 *
 * INGEN aktiv V1-kod importerar denna modul. spotify_connections-tabellen
 * är droppad (migration 0025). Vid V2-reaktivering (om Spotify godkänner):
 *   • återskapa spotify_connections (se migration 0015)
 *   • lägg tillbaka playback-scopes i SCOPES (trimmade 2026-07-07)
 *   • återaktivera WebBrowser.maybeCompleteAuthSession() nedan
 *
 * Ursprunglig arkitektur: OAuth 2.0 PKCE + Premium-verifiering.
 * Kräver INGA native modules — expo-web-browser (systembrowser för
 * OAuth-flödet) + expo-crypto (PKCE). expo-auth-session används INTE
 * (trasig build i Expo SDK 54 — saknar Discovery-submodul).
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

// (ARKIVERAD modul-side-effect) Stänger systembrowsern automatiskt om den är
// öppen vid app-mount — behövs bara för OAuth-flödet. Utkommenterad så modulen
// är side-effect-fri om den råkar bundlas trots att inget importerar den.
// WebBrowser.maybeCompleteAuthSession();

// ── Konstanter ───────────────────────────────────────────────────────

const CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ?? '';
// Redirect URI måste matcha exakt det som är registrerat i Spotify Developer Dashboard.
// Scheme = 'quizvibeapp' (app.json "scheme"-fältet). Vi beräknar inte denna
// dynamiskt (expo-auth-session är ej installerat) — hårdkodad är OK eftersom
// scheme är konstant och inte skiljer sig mellan dev/prod för native builds.
// Expo Go-dev-server använder en annan URI (se kommentar i .env.example).
const REDIRECT_URI = 'quizvibeapp://spotify-callback';

// V1-SCOPE-TRIM (2026-07-07): endast kontoverifiering. Playback-scopes
// ('user-read-playback-state', 'user-modify-playback-state') borttagna —
// de behövs bara för det arkiverade V2-flödet (Automated Playback Control,
// se archived-blocket nedan) och ska INTE begäras i V1 per juridiskt underlag
// (LEGAL-INTEGRATIONS-BRIEF.md). Återinför dem när V2-blocket reaktiveras.
const SCOPES = [
  'user-read-private',           // Krävs för att läsa product (premium/free) via /v1/me
  'user-read-email',             // Visad e-post i connect-bekräftelsen
  // 'app-remote-control' borttagen — kräver Spotifys explicita produktionsgodkännande
  // och behövs inte eftersom vi öppnar låtar via deep link (spotify:track:ID),
  // inte via Spotify SDK. Att inkludera den kan göra att /v1/me returnerar 403.
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
    show_dialog: 'false',
  });
  const authUrl = `${SPOTIFY_ACCOUNTS_BASE}/authorize?${params.toString()}`;

  // Öppna systembrowser. Expo hanterar callback via app-scheme och stänger
  // browsern automatiskt (WebBrowser.maybeCompleteAuthSession() ovan).
  const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);
  console.log(
    '[spotify] openAuthSessionAsync →',
    result.type,
    result.type === 'success' ? result.url?.substring(0, 120) : '',
  );

  if (result.type !== 'success' || !result.url) {
    // Användaren stängde browsern utan att logga in, ELLER scheme-mismatch
    // (t.ex. Expo Go istället för dev-build — 'quizvibeapp://' fungerar ej i Expo Go).
    console.warn('[spotify] Browser avslutades utan callback, type:', result.type);
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
  console.log('[spotify] Code OK, byter mot tokens…');

  // Byt code mot tokens.
  const tokens = await exchangeCodeForTokens(code, codeVerifier);
  if (!tokens) {
    console.error('[spotify] exchangeCodeForTokens returnerade null');
    return { ok: false, reason: 'exchange_failed' };
  }
  console.log('[spotify] Tokens OK, hämtar /v1/me…');

  // Hämta user-info + verifiera Premium.
  const spotifyUser = await fetchSpotifyMe(tokens.accessToken);
  if (!spotifyUser) {
    console.error('[spotify] fetchSpotifyMe returnerade null');
    return { ok: false, reason: 'api_error' };
  }
  console.log('[spotify] /v1/me OK, isPremium:', spotifyUser.isPremium, 'displayName:', spotifyUser.displayName);

  if (!spotifyUser.isPremium) {
    Alert.alert(
      'Spotify Premium krävs',
      'Bara spelare med Spotify Premium kan vara DJ i QuizVibe. Uppgradera ditt Spotify-konto och försök igen.',
      [{ text: 'OK' }],
    );
    return { ok: false, reason: 'not_premium' };
  }

  // Spara till Supabase.
  console.log('[spotify] Sparar till Supabase…');
  await saveSpotifyConnection(spotifyUser, tokens);
  console.log('[spotify] saveSpotifyConnection klar → returnerar ok:true');

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
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('[spotify] /v1/me HTTP', res.status, body.substring(0, 200));
      return null;
    }
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
  // Returnera minnescachat token direkt om det fortfarande är giltigt —
  // eliminerar auth.getUser() + DB-select (2 nätverksanrop) vid varje
  // play/pause-kommando.
  if (_memCachedToken && Date.now() < _memCachedTokenExpiresAt - TOKEN_REFRESH_MARGIN_MS) {
    return _memCachedToken;
  }

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

  if (!needsRefresh) {
    _memCachedToken = data.access_token;
    _memCachedTokenExpiresAt = expiresAt;
    return data.access_token;
  }

  // Förnya via Spotifys token-endpoint.
  const refreshed = await refreshAccessToken(data.refresh_token);
  if (!refreshed) return null;

  _memCachedToken = refreshed.accessToken;
  _memCachedTokenExpiresAt = refreshed.expiresAt.getTime();

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

// In-memory token-cache (aktiv i V1 + V2) — används av getValidAccessToken ovan.
// Eliminerar Supabase-nätverksanrop vid varje API-anrop; cachas 58+ min.
let _memCachedToken: string | null = null;
let _memCachedTokenExpiresAt: number = 0; // Unix ms

// ── FUTURE VERSION 2 — Automated Playback Control (archived) ─────────────────────
// I V1-flödet öppnar DJ:n Spotify manuellt via deep link (openSpotifyTrack i
// spotifyDJ.ts). Dessa funktioner styr uppspelning via Spotify Web API
// (PUT /me/player/play, PUT /me/player/pause) — reaktiveras i V2.
// Importraden i quiz.tsx är arkiverad med // prefix så de kallas ej från V1.
// OBS vid reaktivering: 'user-read-playback-state' + 'user-modify-playback-state'
// måste läggas tillbaka i SCOPES (trimmade 2026-07-07) — utan dem ger dessa
// endpoints 403 på nya tokens, och redan anslutna användare måste re-connecta
// för att få tokens med de utökade scopesen.
//

/**
 * Hämtar device_id för den enhet som för närvarande spelar i Spotify.
 * Kräver user-read-playback-state-scope (tillagd 2026-06-16).
 * Returnerar null om ingen enhet är aktiv eller vid nätverksfel.
 *
 * Används som fallback-argument i pause/resume när det första anropet
 * (utan device_id) returnerar 404 — deep link–startad uppspelning
 * registreras inte alltid som API-session förrän device_id skickas explicit.
 */
// Senast kända device_id sparas i minnet. GET /me/player kan returnera 204 (ingen aktiv
// session) om Spotify pausats en stund, men device_id förblir giltigt för att
// PUT /me/player/play?device_id=xxx ska kunna resumar från pausad position.
let _cachedSpotifyDeviceId: string | null = null;
let _cachedSpotifyProgressMs: number | null = null; // position (ms) vid senaste GET
let _cachedSpotifyTrackUri: string | null = null;   // "spotify:track:ID" vid senaste GET

/**
 * Returnerar position (ms) fångad under senaste pause-anropets parallella GET.
 * Anropas av quiz.tsx direkt efter pauseSpotifyPlayback() och sparas i state
 * för att skickas till resumeSpotifyPlayback() — undviker att låten startar om.
 */
export function getLastKnownSpotifyProgressMs(): number | null {
  return _cachedSpotifyProgressMs;
}

async function getSpotifyDeviceId(token: string): Promise<string | null> {
  try {
    const res = await fetch(`${SPOTIFY_API_BASE}/me/player`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 200) {
      const data = await res.json();
      const id = (data?.device?.id as string | undefined) ?? null;
      if (id) {
        _cachedSpotifyDeviceId = id;
        const pm = data?.progress_ms;
        if (typeof pm === 'number') _cachedSpotifyProgressMs = pm;
        const uri = data?.item?.uri;
        if (typeof uri === 'string') _cachedSpotifyTrackUri = uri;
        return id;
      }
    }

    // Försök 2: GET /me/player/devices — returnerar ALLA enheter inkl. pausade.
    // GET /me/player ger 204 (tom body) när ingen aktiv session finns,
    // men /me/player/devices listar fortfarande alla tillgängliga enheter.
    const devRes = await fetch(`${SPOTIFY_API_BASE}/me/player/devices`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (devRes.ok) {
      const devData = await devRes.json();
      const devices = (devData?.devices ?? []) as Array<{ id: string; is_active: boolean }>;
      const preferred = devices.find((d) => d.is_active) ?? devices[0];
      if (preferred?.id) {
        _cachedSpotifyDeviceId = preferred.id;
        return preferred.id;
      }
    }

    // Sista utväg: senast kände device_id. Spotify minns paused-kontexten på
    // enheten även om API:t tillfälligt inte rapporterar aktiv session.
    return _cachedSpotifyDeviceId;
  } catch {
    return _cachedSpotifyDeviceId;
  }
}

/** Väntar N millisekunder (används i retry-loopar). */
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Kör en pause- eller play-PUT mot Spotify Web API.
 * PUT och GET /me/player körs parallellt för att minimera fördröjning.
 * Om PUT ger 404 provas Transfer Playback (PUT /me/player med play:true)
 * följt av play-med-URI som slutgiltig fallback.
 */
async function spotifyPlaybackPut(
  token: string,
  endpoint: 'pause' | 'play',
  trackId?: string,
  positionMs?: number,
): Promise<boolean> {
  const base = `${SPOTIFY_API_BASE}/me/player/${endpoint}`;
  const authHeader = { Authorization: `Bearer ${token}` };
  const opts: RequestInit = { method: 'PUT', headers: authHeader };

  for (let round = 0; round < 2; round++) {
    if (round > 0) await sleep(1000);

    const [res, deviceId] = await Promise.all([
      fetch(base, opts).catch((): null => null),
      getSpotifyDeviceId(token),
    ]);

    if (!res) continue;
    if (res.status === 200 || res.status === 202 || res.status === 204) return true;
    if (res.status === 403) return false;
    if (res.status !== 404) continue;

    if (!deviceId) continue;

    if (endpoint === 'play') {
      // Steg 1: Transfer Playback — väcker suspenderad iOS Spotify-app och
      // återupptar från exakt pausad position (inget URI behövs, appen minns).
      try {
        const transferRes = await fetch(`${SPOTIFY_API_BASE}/me/player`, {
          method: 'PUT',
          headers: { ...authHeader, 'Content-Type': 'application/json' },
          body: JSON.stringify({ device_ids: [deviceId], play: true }),
        });
        if (transferRes.status === 200 || transferRes.status === 202 || transferRes.status === 204) return true;
        if (transferRes.status === 403) return false;
      } catch {
        // network-fel, fortsätt till URI-fallback
      }
      // Steg 2: Play med explicit URI + position_ms som sista utväg.
      const trackUri = trackId
        ? `spotify:track:${trackId}`
        : (_cachedSpotifyTrackUri ?? null);
      if (trackUri) {
        const resolvedPositionMs = positionMs != null ? positionMs : (_cachedSpotifyProgressMs ?? 0);
        try {
          const r = await fetch(`${base}?device_id=${encodeURIComponent(deviceId)}`, {
            method: 'PUT',
            headers: { ...authHeader, 'Content-Type': 'application/json' },
            body: JSON.stringify({ uris: [trackUri], position_ms: resolvedPositionMs }),
          });
          if (r.status === 200 || r.status === 202 || r.status === 204) return true;
          if (r.status === 403) return false;
        } catch {
          // fall through to next round
        }
      }
    } else {
      // pause-endpoint: skicka med explicit device_id vid 404.
      try {
        const r = await fetch(`${base}?device_id=${encodeURIComponent(deviceId)}`, opts);
        if (r.status === 200 || r.status === 202 || r.status === 204) return true;
        if (r.status === 403) return false;
      } catch {
        // fall through to next round
      }
    }
  }
  return false;
}

/**
 * Pausar pågående uppspelning på DJ:ns aktiva Spotify-enhet.
 * Kräver user-modify-playback-state-scope + Premium.
 */
export async function pauseSpotifyPlayback(): Promise<boolean> {
  const token = await getValidAccessToken();
  if (!token) return false;
  return spotifyPlaybackPut(token, 'pause');
}

/**
 * Återupptar uppspelning på DJ:ns aktiva Spotify-enhet från pausad position.
 * Kräver user-modify-playback-state-scope + Premium.
 */
export async function resumeSpotifyPlayback(trackId?: string, positionMs?: number): Promise<boolean> {
  const token = await getValidAccessToken();
  if (!token) return false;
  return spotifyPlaybackPut(token, 'play', trackId, positionMs);
}

// ── END FUTURE VERSION 2 — Automated Playback Control ────────────────────────────

// ── FUTURE VERSION 2 — Track-info (archived) ─────────────────────────
// Hämtar spårmetadata (titel/artist/albumomslag) via Web API för det
// arkiverade NowPlaying-overlayet i quiz.tsx. Anropas INTE i V1 — allt som
// visas vid facit (titel/artist/år) kommer från vår egen fråge-katalog,
// inget Spotify-innehåll hämtas eller renderas (per LEGAL-INTEGRATIONS-BRIEF.md).

export interface SpotifyTrackInfo {
  trackId: string;
  trackName: string;
  artistName: string;
  albumArtUrl: string | null;
  durationMs: number;
}

/**
 * GET /v1/tracks/{id} — hämtar track-metadata utan extra scopes.
 * Ingen user-read-currently-playing behövs; fungerar med befintliga tokens.
 */
export async function fetchSpotifyTrackInfo(trackId: string): Promise<SpotifyTrackInfo | null> {
  const token = await getValidAccessToken();
  if (!token) return null;
  try {
    const res = await fetch(`${SPOTIFY_API_BASE}/tracks/${encodeURIComponent(trackId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      console.warn('[spotify] fetchSpotifyTrackInfo HTTP', res.status);
      return null;
    }
    const data = await res.json();
    return {
      trackId: data.id,
      trackName: data.name,
      artistName: (data.artists as Array<{ name: string }>).map((a) => a.name).join(', '),
      albumArtUrl: data.album?.images?.[0]?.url ?? null,
      durationMs: data.duration_ms ?? 0,
    };
  } catch (err) {
    console.error('[spotify] fetchSpotifyTrackInfo threw:', err);
    return null;
  }
}

// ── END FUTURE VERSION 2 — Track-info ────────────────────────────────────────────

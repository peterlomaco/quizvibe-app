/**
 * Spotify DJ-rotation + Deep Link
 *
 * Arkitektur: "Backend-styrd Deep Link via Supabase"
 *
 * Ingen native Spotify SDK — bara:
 *   • Linking.openURL('spotify:track:ID')   ← öppnar Spotify-appen
 *   • Supabase REST/Realtime               ← synkroniserar DJ-state
 *   • Spotify Web API /v1/tracks/{id}      ← hämtar albumomslag
 *
 * DJ-rotation är DETERMINISTISK och behöver ingen DB-rad:
 *   djIndex = spotifyQuestionIndex % playerCount
 *
 * Vad som händer per Spotify-fråga (Individual Devices):
 *   1. Host broadcastar spotify_question_ready (inkl. trackId + djPlayerId).
 *   2. DJ:n ser "Starta låten i Spotify"-knapp → openSpotifyTrack().
 *   3. Gissarna ser albumomslag (fetchSpotifyAlbumArt) + timer + årsväljare.
 *   4. DJ broadcastar spotify_dj_track_started när Spotify öppnat.
 *   5. Vid timer=0 → normal reveal-fas.
 *   6. DJ byter manuellt tillbaka till QuizVibe → trycker "Nästa fråga".
 */

import { Linking, Alert } from 'react-native';
import { supabase } from '@/src/utils/supabase';
import { getValidAccessToken } from '@/src/lib/spotify';

// ── Typer ────────────────────────────────────────────────────────────

export interface SpotifyDJPlayer {
  id: string;       // lobby_players.player_id
  name: string;
  emoji?: string;
}

/** Resultatet av att beräkna en sessions DJ-rotation. */
export interface DJRotationPlan {
  /** Vilka absoluta frågeindex (0-baserat) som är Spotify-frågor. */
  spotifyQuestionIndices: number[];
  /** djAssignments[spotifyQuestionIndex] = spelaren som är DJ för den frågan. */
  djAssignments: Map<number, SpotifyDJPlayer>;
}

/** Data vi behöver rendera en Spotify-fråga på gissarnas skärmar. */
export interface SpotifyQuestionMeta {
  spotifyTrackId: string;
  /** Visningsnamn på låten (från katalogen, ex. "Dancing Queen — ABBA"). */
  displayName: string;
  /** Albumomslag-URL, hämtad via fetchSpotifyAlbumArt. Null tills klar. */
  albumArtUrl: string | null;
  /** Spelarens correctYear (= releaseår som ska gissas). */
  correctYear: number;
}

/** Status för en spelares Spotify-anslutning från spotify_connections-tabellen. */
export interface SpotifyConnectionStatus {
  connected: boolean;
  isPremium: boolean;
  spotifyDisplayName: string | null;
  tokenExpiresAt: Date | null;
}

// ── DJ-rotation ───────────────────────────────────────────────────────

/**
 * Räknar ut hur många Spotify-frågor som ryms i en session och placerar dem
 * jämnt fördelade i fråge-sekvensen.
 *
 * Regel: en DJ-tur per spelare, exakt (= antalet Spotify-frågor = playerCount).
 * Spotify-frågorna placeras med jämna mellanrum så ingen spelare får sin
 * DJ-tur tre gånger i rad.
 *
 * Exempel: 4 spelare, 12 frågor totalt
 *   → 4 Spotify-frågor på index [2, 5, 8, 11]
 *   → spacing = floor(12 / 4) = 3, startoffset = 2
 *
 * @param totalQuestions  Totalt antal frågor i sessionen (roundsCount).
 * @param players         Spelarordningen (= turnOrder från quiz.tsx).
 * @returns DJRotationPlan med indices + assignments, eller null om Spotify är
 *          inaktiverat (0 spelare eller playerCount > totalQuestions).
 */
export function computeDJRotationPlan(
  totalQuestions: number,
  players: SpotifyDJPlayer[],
): DJRotationPlan | null {
  const playerCount = players.length;
  if (playerCount === 0 || playerCount > totalQuestions) return null;

  const spacing = Math.floor(totalQuestions / playerCount);
  // Startoffset = halva spacingen så Spotify-frågan inte hamnar allra först
  // (host vill köra in spelarna med en vanlig fråga innan DJ-logiken börjar).
  const startOffset = Math.max(1, Math.floor(spacing / 2));

  const spotifyQuestionIndices: number[] = [];
  const djAssignments = new Map<number, SpotifyDJPlayer>();

  for (let i = 0; i < playerCount; i++) {
    const questionIndex = startOffset + i * spacing;
    if (questionIndex >= totalQuestions) break;
    spotifyQuestionIndices.push(questionIndex);
    // Rotation: spelare i = DJ för Spotify-fråga i.
    djAssignments.set(questionIndex, players[i]);
  }

  return { spotifyQuestionIndices, djAssignments };
}

/**
 * Returnerar vilken spelare som är DJ för ett givet absolutt frågeindex,
 * givet rotationsplanen. Returnerar null om frågan inte är en Spotify-fråga.
 */
export function getDJForQuestionIndex(
  plan: DJRotationPlan,
  questionIndex: number,
): SpotifyDJPlayer | null {
  return plan.djAssignments.get(questionIndex) ?? null;
}

// ── Spotify Deep Link ─────────────────────────────────────────────────

const SPOTIFY_URI_SCHEME = 'spotify:track:';

/**
 * Öppnar Spotify-appen på rätt låt via deep link.
 *
 * Kräver inga native modules — använder RN:s inbyggda Linking.
 * iOS: 'spotify:track:ID' hanteras av OS:s URL-scheme-router → Spotify öppnar.
 * Android: samma (Spotify registrerar intent-filtret).
 *
 * Om Spotify inte är installerat: faller tillbaka till webbläsaren som
 * erbjuder att öppna App Store/Google Play.
 *
 * @param spotifyTrackId  Spotify track ID (ex. "4iV5W9uYEdYUVa79Axb7Rh"),
 *                        INTE full URI ("spotify:track:...").
 * @returns true om openURL lyckades, false om felet var fatalt.
 */
export async function openSpotifyTrack(spotifyTrackId: string): Promise<boolean> {
  const nativeUri = `${SPOTIFY_URI_SCHEME}${spotifyTrackId}`;

  try {
    // Kör direkt openURL utan canOpenURL-gate — canOpenURL returnerar alltid false
    // i Expo Go eftersom LSApplicationQueriesSchemes i app.json bara gäller
    // dev-/standalone-builds. Direktanrop låter OS:t hantera: Spotify öppnar om
    // installerat, annars visar systemet ett "no app" varningsdialogruta.
    await Linking.openURL(nativeUri);
    return true;
  } catch (err) {
    console.warn('[spotifyDJ] openSpotifyTrack failed:', err);
    Alert.alert(
      'Kunde inte öppna Spotify',
      'Kontrollera att Spotify är installerat och försök igen.',
    );
    return false;
  }
}

// ── Albumomslag (för gissarnas skärmar) ──────────────────────────────

/**
 * Hämtar albumomslagets URL via Spotify Web API.
 * Hämtar token automatiskt via getValidAccessToken (inkl. refresh-logik).
 * Returnerar den största tillgängliga bilden (index 0 = störst).
 *
 * Anropas av gissarnas klienter strax innan Spotify-frågan börjar visas.
 * DJ:n ser inte albumomslaget (de vet redan svaret).
 *
 * @param spotifyTrackId  Spotify track ID (ex. "4iV5W9uYEdYUVa79Axb7Rh").
 * @returns URL-sträng, eller null vid fel / saknad token.
 */
export async function fetchSpotifyAlbumArt(spotifyTrackId: string): Promise<string | null> {
  const accessToken = await getValidAccessToken();
  if (!accessToken) return null;
  try {
    const res = await fetch(`https://api.spotify.com/v1/tracks/${spotifyTrackId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const images: Array<{ url: string; width: number; height: number }> =
      data?.album?.images ?? [];
    return images[0]?.url ?? null;
  } catch {
    return null;
  }
}

// ── Supabase: hämta anslutningsstatus ────────────────────────────────

/**
 * Läser spelarens Spotify-anslutningsstatus från spotify_connections-tabellen.
 * Används i Lobby-skärmen för att visa "Connect Spotify"-CTA eller grön bock.
 */
export async function getSpotifyConnectionStatus(
  userId: string,
): Promise<SpotifyConnectionStatus> {
  const { data } = await supabase
    .from('spotify_connections')
    .select('is_premium, spotify_display_name, token_expires_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data) {
    return { connected: false, isPremium: false, spotifyDisplayName: null, tokenExpiresAt: null };
  }

  return {
    connected: true,
    isPremium: data.is_premium,
    spotifyDisplayName: data.spotify_display_name,
    tokenExpiresAt: data.token_expires_at ? new Date(data.token_expires_at) : null,
  };
}

// ── Expo-konfiguration (läs detta innan du testar) ────────────────────
//
// För att Linking.canOpenURL('spotify:...') ska fungera:
//
// iOS — lägg till i app.json under expo.ios.infoPlist:
//   "LSApplicationQueriesSchemes": ["spotify"]
//
// Android — lägg till i app.json under expo.android.intentFilters:
//   {
//     "action": "android.intent.action.VIEW",
//     "data": [{ "scheme": "spotify" }]
//   }
// Alternativt: expo.android.queries: [{ "package": "com.spotify.music" }]
//
// Utan dessa konfigurationer returnerar canOpenURL alltid false på iOS 9+
// och Android 11+, och Linking.openURL kastar undantag.
//
// ── Katalog-utökning (nästa steg) ────────────────────────────────────
//
// För att Spotify-frågor ska ha data att spela behöver varje `song`-item
// i backend/content/catalog/songs-*.yaml ett nytt fält:
//
//   spotifyTrackId: "4iV5W9uYEdYUVa79Axb7Rh"   # optional
//
// Schema-ändring i backend/content/schema.ts:
//   ContentItemSchema: lägg till `spotifyTrackId: z.string().optional()`
//
// Export-script backend/scripts/export-music-questions.ts:
//   Inkludera spotifyTrackId i MusicQuestion-typen + JSON-exporten.
//
// Items utan spotifyTrackId exkluderas automatiskt från Spotify-poolen
// (filtrera på `q.spotifyTrackId != null` i quiz.tsx:s pool-bygge).

/**
 * Spotify DJ-rotation + Deep Link
 *
 * Arkitektur V1 (Plan B, jurist-beslut 2026-07-22): REN URL — inga Spotify
 * API-anrop, ingen OAuth, inget Premium-krav.
 *   • Linking.openURL('spotify:track:ID')   ← öppnar Spotify-appen (fallback:
 *     https://open.spotify.com/track/ID — web player / App Store-prompt)
 *   • Supabase REST/Realtime               ← synkroniserar DJ-state (vår egen DB)
 * DJ-behörighet är SELF-ATTEST ("Spotify user"-toggle) — OAuth-verifieringen
 * (getSpotifyConnectionStatus + src/lib/spotify.ts) är ARKIVERAD till V2,
 * liksom albumomslag via Web API. Se LEGAL-INTEGRATIONS-BRIEF.md.
 *
 * DJ-rotation är DETERMINISTISK och behöver ingen DB-rad:
 *   djIndex = spotifyQuestionIndex % playerCount
 *
 * Vad som händer per Spotify-fråga (Individual Devices):
 *   1. Host broadcastar spotify_question_ready (inkl. trackId + djPlayerId).
 *   2. DJ:n ser "Starta låten i Spotify"-knapp → openSpotifyTrack().
 *   3. Gissarna ser timer + årsväljare/svarsalternativ (inget Spotify-innehåll i V1).
 *   4. DJ broadcastar spotify_dj_track_started när Spotify öppnat.
 *   5. Vid timer=0 → normal reveal-fas (titel/artist/år från vår egen katalog).
 *   6. DJ byter manuellt tillbaka till QuizVibe → trycker "Nästa fråga".
 */

import { Linking, Alert } from 'react-native';
// ARKIVERADE imports (FUTURE VERSION 2 — används bara av arkiverade block nedan):
// import { supabase } from '@/src/utils/supabase';
// import { getValidAccessToken } from '@/src/lib/spotify';

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
  /** Albumomslag-URL (FUTURE V2 — fetchSpotifyAlbumArt arkiverad; alltid null i V1). */
  albumArtUrl: string | null;
  /** Spelarens correctYear (= releaseår som ska gissas). */
  correctYear: number;
}

// (FUTURE VERSION 2) Status för en spelares Spotify-anslutning från
// spotify_connections-tabellen — arkiverad tillsammans med
// getSpotifyConnectionStatus nedan. I V1 är "connected" ersatt av
// self-attest-flaggan spotifyAppConfirmed (ProfileData) / spotify_verified.
// export interface SpotifyConnectionStatus {
//   connected: boolean;
//   isPremium: boolean;
//   spotifyDisplayName: string | null;
//   tokenExpiresAt: Date | null;
// }

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
const SPOTIFY_WEB_URL_BASE = 'https://open.spotify.com/track/';

/**
 * Öppnar Spotify-appen på rätt låt via deep link — REN URL, inget API-anrop
 * (Plan B per juridiskt underlag). Autoplay är inte garanterat: Spotify styr
 * om låten auto-startar eller om DJ:n måste trycka Play — timer-aktiveraren
 * i quiz-flödet absorberar båda fallen.
 *
 * Kräver inga native modules — använder RN:s inbyggda Linking.
 * iOS: 'spotify:track:ID' hanteras av OS:s URL-scheme-router → Spotify öppnar.
 * Android: samma (Spotify registrerar intent-filtret).
 *
 * Om native-schemat misslyckas (Spotify ej installerat / scheme blockerat):
 * fallback till https://open.spotify.com/track/<id> — öppnar web player
 * eller App Store/Google Play-prompt.
 *
 * @param spotifyTrackId  Spotify track ID (ex. "4iV5W9uYEdYUVa79Axb7Rh"),
 *                        INTE full URI ("spotify:track:...").
 * @returns true om någon av URL-öppningarna lyckades, false om båda föll.
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
    console.warn('[spotifyDJ] openSpotifyTrack native scheme failed:', err);
    try {
      await Linking.openURL(`${SPOTIFY_WEB_URL_BASE}${spotifyTrackId}`);
      return true;
    } catch (webErr) {
      console.warn('[spotifyDJ] openSpotifyTrack web fallback failed:', webErr);
      Alert.alert(
        'Kunde inte öppna Spotify',
        'Kontrollera att Spotify är installerat och försök igen.',
      );
      return false;
    }
  }
}

/**
 * Öppnar Spotify-appen och tar den till förgrunden WITHOUT att starta om
 * det aktuella spåret. Använd när låten redan spelas och DJ bara behöver
 * navigera tillbaka till Spotify (t.ex. fallback-knappen under frågan eller
 * "Open Spotify" under reveal för att stoppa låten).
 *
 * `spotify:` (utan track-ID) activerar appen men ändrar inte uppspelning.
 */
export async function openSpotifyApp(): Promise<boolean> {
  try {
    await Linking.openURL('spotify:');
    return true;
  } catch (err) {
    console.warn('[spotifyDJ] openSpotifyApp failed:', err);
    Alert.alert(
      'Kunde inte öppna Spotify',
      'Kontrollera att Spotify är installerat och försök igen.',
    );
    return false;
  }
}

// ── FUTURE VERSION 2 — Albumomslag (archived) ────────────────────────
// Anropas INTE i V1 — inget Spotify-innehåll (omslag/metadata) hämtas
// eller visas i appen (per LEGAL-INTEGRATIONS-BRIEF.md). Behålls för
// enkel V2-reaktivering av gissarnas albumomslags-vy.

/**
 * Hämtar albumomslagets URL via Spotify Web API.
 * Hämtar token automatiskt via getValidAccessToken (inkl. refresh-logik).
 * Returnerar den största tillgängliga bilden (index 0 = störst).
 *
 * (V2-flöde) Anropas av gissarnas klienter strax innan Spotify-frågan visas.
 * DJ:n ser inte albumomslaget (de vet redan svaret).
 */
// export async function fetchSpotifyAlbumArt(spotifyTrackId: string): Promise<string | null> {
//   const accessToken = await getValidAccessToken();
//   if (!accessToken) return null;
//   try {
//     const res = await fetch(`https://api.spotify.com/v1/tracks/${spotifyTrackId}`, {
//       headers: { Authorization: `Bearer ${accessToken}` },
//     });
//     if (!res.ok) return null;
//     const data = await res.json();
//     const images: Array<{ url: string; width: number; height: number }> =
//       data?.album?.images ?? [];
//     return images[0]?.url ?? null;
//   } catch {
//     return null;
//   }
// }

// ── END FUTURE VERSION 2 — Albumomslag ───────────────────────────────

// ── FUTURE VERSION 2 — OAuth-anslutningsstatus (archived 2026-07-22) ─
// Plan B: ingen OAuth i V1 — spotify_connections-tabellen är droppad
// (migration 0025). "Har spelaren Spotify?" är i V1 en self-attest-flagga
// (ProfileData.spotifyAppConfirmed → lobby_players.spotify_verified),
// inte ett DB-lookup. Reaktiveras tillsammans med src/lib/spotify.ts i V2.

/**
 * (V2) Läser spelarens Spotify-anslutningsstatus från spotify_connections.
 * Användes i Lobby/Profile för att visa "Connect Spotify"-CTA eller grön bock.
 */
// export async function getSpotifyConnectionStatus(
//   userId: string,
// ): Promise<SpotifyConnectionStatus> {
//   const { data } = await supabase
//     .from('spotify_connections')
//     .select('is_premium, spotify_display_name, token_expires_at')
//     .eq('user_id', userId)
//     .maybeSingle();
//
//   if (!data) {
//     return { connected: false, isPremium: false, spotifyDisplayName: null, tokenExpiresAt: null };
//   }
//
//   return {
//     connected: true,
//     isPremium: data.is_premium,
//     spotifyDisplayName: data.spotify_display_name,
//     tokenExpiresAt: data.token_expires_at ? new Date(data.token_expires_at) : null,
//   };
// }

// ── END FUTURE VERSION 2 — OAuth-anslutningsstatus ───────────────────

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

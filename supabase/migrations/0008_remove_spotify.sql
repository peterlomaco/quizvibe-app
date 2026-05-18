-- ─────────────────────────────────────────────────────────────────────
-- 0008_remove_spotify — Spotify-cleanup maj 2026
-- Tar bort alla Spotify-relaterade kolumner från profiles + lobby-tabellerna.
--
-- Bakgrund: Spotify-integration parkerades i maj 2026 efter SDK-research
-- (Fas 3 Slice D-viii avbruten). Det finns ingen maintained Spotify
-- playback-modul för React Native + Expo i ekosystemet — alla kända
-- bibliotek är deprecated/övergivna, och Spotifys preview_url-fältet är
-- blockerat för appar registrerade efter nov 2024. UI:t har strippats
-- helt på klient-sidan; denna migration rensar persistens-lagret så
-- type-mappnings stämmer mot DB-schemat.
--
-- Återupptas om:
--   • En maintained native-modul dyker upp i ekosystemet, eller
--   • Vi bygger eget native Swift+Kotlin-bridge (~2-3 dev-veckor).
-- Se memory/project_spotify_dashboard.md för Spotify Developer Dashboard-
-- config (Client ID + redirect URIs är bevarade där om vi återupptar).
-- ─────────────────────────────────────────────────────────────────────

alter table public.profiles
  drop column if exists spotify_connected;

alter table public.lobby_players
  drop column if exists spotify_connected;

alter table public.lobby_settings
  drop column if exists spotify_host_toggle;

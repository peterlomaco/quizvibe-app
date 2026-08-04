-- 0025: Drop spotify_connections (Plan B, jurist-beslut 2026-07-22)
--
-- Juristens svar på LEGAL-INTEGRATIONS-BRIEF.md: Spotify API-användning
-- (OAuth + Premium-verifiering) är inte preferred för V1. Spotify DJ kör
-- nu "Plan B": ren URL-länk till Spotify-appen, ingen OAuth, inga tokens.
-- DJ-behörighet är self-attest (ProfileData.spotifyAppConfirmed →
-- lobby_players.spotify_verified) — ingen kod läser/skriver
-- spotify_connections längre (src/lib/spotify.ts är helt arkiverad).
--
-- GDPR: tabellen innehöll OAuth access/refresh-tokens — droppas hellre än
-- lämnas vilande. V2 kan återskapa den via migration 0015 om Spotify-
-- integrationen återupptas med Spotifys godkännande.
--
-- BEHÅLLS (används fortsatt av self-attest-flödet):
--   • lobby_players.spotify_verified  (nu = self-attest-flagga, inte OAuth)
--   • lobby_settings.spotify_enabled  (host:s DJ-läge-val)
--
-- Appliceras manuellt via Supabase Dashboard → SQL Editor (projektkonvention).

drop table if exists public.spotify_connections cascade;

-- Trigger-funktionen skapades i 0015 enbart för spotify_connections-tabellens
-- updated_at — triggern försvann med tabellen (cascade), funktionen städas här.
drop function if exists public.touch_spotify_connections();

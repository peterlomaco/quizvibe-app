-- ─────────────────────────────────────────────────────────────────────
-- 0015_spotify_connections — Spotify Premium-koppling + DJ-rotation stöd
--
-- Arkitektur: "Backend-styrd Deep Link via Supabase"
-- Ingen Spotify playback-SDK krävs. Flödet:
--   1. Spelare kopplar Spotify Premium via OAuth (expo-auth-session, PKCE).
--      Tokens lagras i denna tabell.
--   2. Spelstart: host räknar hur många Spotify-frågor som ryms (en per spelare)
--      och vilka frågeindex de hamnar på.
--   3. DJ-rotation: deterministisk client-side (spotifyQIndex % playerCount),
--      broadcastad via quiz_sync-channel (transient, ingen DB-rad behövs).
--   4. DJ:n trycker "Starta i Spotify" → Linking.openURL('spotify:track:ID').
--   5. Gissarna ser albumomslag (Spotify Web API /v1/albums/{id}/images)
--      + tidtagning i QuizVibe.
--
-- Varför INTE lagra DJ-rotation i DB:
--   Rotation är deterministisk (index % count) och synkas via Realtime
--   broadcast — att skriva och läsa en extra DB-rad per fråga ger latens
--   utan mervärde. DB äger bara persistent state (tokens, Premium-status).
--
-- Appliceras manuellt via Supabase SQL editor (som övriga migrations).
-- ─────────────────────────────────────────────────────────────────────

-- ── Spotify OAuth-tokens + Premium-status per användare ──────────────
--
-- access_token: kortlivad (1h), används för Spotify Web API-anrop
--   (hämta albumomslag via /v1/tracks/{id} — albumbild visas för gissarna).
-- refresh_token: långlivad, används för att förnya access_token utan ny
--   OAuth-runda. Supabase Edge Function "spotify-refresh" förnyar vid behov.
--
-- Säkerhet: tokens lagras i klartext med RLS (user kan bara se sina egna).
-- Upgrade-path: flytta till Supabase Vault om compliance-krav uppstår.
-- ─────────────────────────────────────────────────────────────────────

create table if not exists public.spotify_connections (
  -- PK = user_id — en anslutning per QuizVibe-konto.
  user_id           uuid primary key references auth.users(id) on delete cascade,

  -- Spotify-sidans identitet
  spotify_user_id   text not null,
  spotify_display_name text,                 -- ex. "Peter Björklund"

  -- Premiumverifiering
  -- Kollas vid lobby-start mot Spotify /v1/me. Cachat här så vi slipper
  -- API-anrop per spelomgång; invalideras vid token-refresh.
  is_premium        boolean not null default false,

  -- OAuth-tokens
  access_token      text not null,
  refresh_token     text not null,
  token_expires_at  timestamptz not null,    -- UTC

  -- Metadata
  connected_at      timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Automatisk updated_at-trigger (återanvänder helpers som profiles-tabellen)
create or replace function public.touch_spotify_connections()
  returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger trg_spotify_connections_updated_at
  before update on public.spotify_connections
  for each row execute function public.touch_spotify_connections();

-- ── RLS ──────────────────────────────────────────────────────────────
alter table public.spotify_connections enable row level security;

-- Spelare ser och hanterar bara sin egna anslutning.
create policy "user_owns_spotify_connection"
  on public.spotify_connections for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Service-role (Edge Functions) når alla rader utan RLS.
-- (Supabase service_role hoppar implicit förbi RLS.)

-- ── lobby_players: flagga att spelaren har verifierat Spotify Premium ─
--
-- Separerat från spotify_connections av tre skäl:
--   a) Non-registrerade gäster (type='guest') saknar user_id och kan
--      inte ha en spotify_connections-rad — men vi behöver ändå veta
--      att de sagt "Jag har Premium" (hedersystem i V1).
--   b) En spelare kan ha Premium men vilja spela utan Spotify denna session.
--   c) Lobby-polling läser lobby_players för att rendera UI — ett extra
--      JOIN mot spotify_connections varje poll är onödig kostnad.
--
-- Flaggan sätts av klienten när spelaren tryckt "Verify Spotify" i Lobby.
-- Rensas vid lobby-cleanup (clearLobbyPlayers).
alter table public.lobby_players
  add column if not exists spotify_verified boolean not null default false;

-- ── lobby_settings: host:s val för Spotify-läge ──────────────────────
--
-- spotify_enabled = false  → rent YouTube+bild-spel (alla kan delta)
-- spotify_enabled = true   → DJ-rotationsläge (kräver att ALLA spelare
--                            har spotify_verified = true)
alter table public.lobby_settings
  add column if not exists spotify_enabled boolean not null default false;

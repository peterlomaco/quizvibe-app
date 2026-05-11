-- ─────────────────────────────────────────────────────────────────────
-- 0003_lobby_tables — Fas 3 Slice B (player-list + settings + Realtime)
-- Ersätter de tidigare in-memory `mockLobbyPlayers` + `mockLobbySettings`-
-- Map:erna. Player-listan och host-settings syncas nu cross-device via
-- Realtime-broadcasts (alter publication ... add table ... aktiverar dem).
-- ─────────────────────────────────────────────────────────────────────

-- ── lobby_players: en rad per spelare i ett rum ──────────────────────
create table public.lobby_players (
  id uuid primary key default gen_random_uuid(),
  room_code text not null references public.rooms(code) on delete cascade,
  -- In-app id (host-..., guest-..., joiner-...). Stabilare än uuid över
  -- klient-restart eftersom det härleds från LobbyScreen:s init-logik.
  player_id text not null,
  -- null för guests (de saknar Supabase-auth). För registrerade kopplas
  -- detta till auth.users så vi kan slå upp profile för cross-device-sync.
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  emoji text not null default '👤',
  avatar_uri text,
  -- Matchar LobbyPlayer.type i TS:
  --   'registered' = signed-up user joinar via room code
  --   'guest'      = guest joinar via Join as Guest
  --   'manual'     = host-added via + Add Player (ej real account)
  type text not null check (type in ('manual', 'guest', 'registered')),
  age int,
  assistance text check (assistance in ('minimal', 'standard', 'full')),
  hcp_override int,
  hcp_complete boolean not null default false,
  is_host boolean not null default false,
  is_ready boolean not null default false,
  approved boolean not null default false,
  turn_order int not null default 0,
  spotify_connected boolean not null default false,
  lobby_edited boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Per-room player_id-uniqueness så ingen kan injicera dubbletter
  unique (room_code, player_id)
);

create trigger lobby_players_updated_at
before update on public.lobby_players
for each row execute function public.touch_updated_at();

create index lobby_players_room_idx on public.lobby_players (room_code);

-- ── lobby_settings: 1:1 mot rooms (per-rum host-settings) ────────────
create table public.lobby_settings (
  room_code text primary key references public.rooms(code) on delete cascade,
  game_mode text not null default 'pass-the-phone'
    check (game_mode in ('pass-the-phone', 'individual-devices')),
  single_player_default boolean not null default false,
  region text not null default 'global'
    check (region in ('sweden', 'nordics', 'europe', 'global')),
  answer_response_seconds int not null default 30
    check (answer_response_seconds in (15, 30, 45, 60)),
  era_from int not null default 1980,
  era_to int not null default 2010,
  rounds_count int not null default 4,
  selected_extra_packages text[] not null default array[]::text[],
  youtube_enabled boolean not null default true,
  spotify_host_toggle boolean not null default true,
  profiles_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger lobby_settings_updated_at
before update on public.lobby_settings
for each row execute function public.touch_updated_at();

-- ── RLS: lobby_players ────────────────────────────────────────────────
alter table public.lobby_players enable row level security;

create policy "anyone can read lobby players"
on public.lobby_players for select
to anon, authenticated
using (true);

create policy "authenticated can join lobby"
on public.lobby_players for insert
to authenticated
with check (true);

create policy "host manages lobby players"
on public.lobby_players for all
to authenticated
using (
  exists (
    select 1 from public.rooms r
    where r.code = lobby_players.room_code
      and r.host_user_id = auth.uid()
  )
);

create policy "player can update own row"
on public.lobby_players for update
to authenticated
using (user_id = auth.uid());

create policy "player can delete own row"
on public.lobby_players for delete
to authenticated
using (user_id = auth.uid());

-- ── RLS: lobby_settings ───────────────────────────────────────────────
alter table public.lobby_settings enable row level security;

create policy "anyone can read lobby settings"
on public.lobby_settings for select
to anon, authenticated
using (true);

create policy "host manages lobby settings"
on public.lobby_settings for all
to authenticated
using (
  exists (
    select 1 from public.rooms r
    where r.code = lobby_settings.room_code
      and r.host_user_id = auth.uid()
  )
);

-- ── Enable Realtime ──────────────────────────────────────────────────
alter publication supabase_realtime add table public.lobby_players;
alter publication supabase_realtime add table public.lobby_settings;

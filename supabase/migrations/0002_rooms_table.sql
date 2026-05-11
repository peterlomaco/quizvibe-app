-- ─────────────────────────────────────────────────────────────────────
-- 0002_rooms_table — Fas 3 Slice A (cross-device room registry)
-- Ersätter den tidigare in-memory `mockActiveRooms`-Map:en. Room codes
-- funkar nu cross-device: host registrerar rummet, andra users (inkl.
-- anon-guests) verifierar koden mot DB innan join.
-- ─────────────────────────────────────────────────────────────────────

create table public.rooms (
  -- 6-char alfanumerisk room code är canonical identifier (delas verbalt
  -- mellan host och spelare). Inget separat UUID — koden ÄR id:t.
  code text primary key,
  host_user_id uuid not null references auth.users(id) on delete cascade,
  -- Denormaliserat playerName så non-auth-flöden (guest-join) kan visa
  -- host:s identitet utan extra JOIN mot profiles.
  host_player_name text not null,
  max_players int not null default 4 check (max_players in (4, 12)),
  host_is_premium boolean not null default false,
  current_player_count int not null default 1,
  -- True när host tryckt Start Game. Rummet räknas inte längre som
  -- "joinable" — checken i isActiveRoom filtrerar bort dessa. expires_at
  -- rörs INTE när game_started sätts (vi behåller +24h så Lobby:s
  -- room-exists-polling inte fellaktigt triggar "deleted by host" för
  -- non-hosts som ännu inte navigerat till /quiz).
  game_started boolean not null default false,
  -- Auto-expiry: rummet räknas inaktivt 24h efter creation. pg_cron-jobb
  -- (TODO i framtida migration) tar bort expired rader för att hålla
  -- tabellen ren. Lazy-expiry via WHERE-filter i queries räcker tills dess.
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at-trigger (samma helper som profiles)
create trigger rooms_updated_at
before update on public.rooms
for each row execute function public.touch_updated_at();

-- Index för cleanup-jobb + expiry-queries
create index rooms_expires_at_idx on public.rooms (expires_at);

-- RLS: SELECT öppet (security via code-obscurity — koden är 6-char
-- random, ~30M kombos), mutation endast av host
alter table public.rooms enable row level security;

-- Både anon (guest-join) och authenticated får läsa
create policy "anyone can read rooms by code"
on public.rooms for select
to anon, authenticated
using (true);

create policy "host can insert own room"
on public.rooms for insert
to authenticated
with check (auth.uid() = host_user_id);

create policy "host can update own room"
on public.rooms for update
to authenticated
using (auth.uid() = host_user_id);

create policy "host can delete own room"
on public.rooms for delete
to authenticated
using (auth.uid() = host_user_id);

-- TODO: pg_cron-jobb som DELETEar expired rows en gång per timme
-- (kräver pg_cron-extension enable:ad). Lazy-expiry via WHERE-filter
-- räcker tills stale-rad-mängden blir märkbar.

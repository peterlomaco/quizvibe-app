-- ─────────────────────────────────────────────────────────────────────
-- 0001_profiles_table — Fas 2 (cross-device profile sync + PlayerName-login)
-- Applied via Supabase SQL Editor (manuell körning, vi använder inte
-- Supabase CLI migrations idag). Filen sparas här som schema-källa-of-
-- truth så framtida miljö-rekreation kan applicera den deterministiskt.
-- ─────────────────────────────────────────────────────────────────────

-- profiles-tabell: 1:1 mot auth.users via shared id (UUID)
create extension if not exists citext;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  player_name citext not null unique,
  birth_year int,
  assistance text check (assistance in ('minimal','standard','full')),
  region text check (region in ('sweden','nordics','global')),
  avatar_source text not null default 'default'
    check (avatar_source in ('upload','choose','default')),
  selected_avatar_id text not null default '',
  game_credits int not null default 0,
  free_game_credits int not null default 2,
  last_free_credits_refresh_date text,
  spotify_connected boolean not null default false,
  answer_response_seconds int not null default 30
    check (answer_response_seconds in (15,30,45,60)),
  game_era_from int,
  game_era_to int,
  max_players int not null default 4 check (max_players in (4,12)),
  game_mode text not null default 'pass-the-phone'
    check (game_mode in ('pass-the-phone','individual-devices')),
  single_player_default boolean not null default false,
  enabled_host_packages text[] not null default array[]::text[],
  rounds_count int not null default 4,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at auto-bumpas vid varje UPDATE
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

-- RLS: user läser/skriver bara sin egen rad
alter table public.profiles enable row level security;

create policy "users can read own profile"
on public.profiles for select using (auth.uid() = id);

create policy "users can insert own profile"
on public.profiles for insert with check (auth.uid() = id);

create policy "users can update own profile"
on public.profiles for update using (auth.uid() = id);

-- (Ingen DELETE-policy — defaultet är deny-all)

-- RPC: PlayerName → email (för login-flow innan auth)
-- security definer kör med ägar-rättigheter, kringgår RLS, men returnerar
-- bara email (en string) — ingen annan profil-data läcker.
create or replace function public.lookup_email_by_player_name(p_name text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  found_email text;
begin
  select email into found_email
  from public.profiles
  where player_name = p_name
  limit 1;
  return found_email;
end;
$$;

grant execute on function public.lookup_email_by_player_name(text)
  to anon, authenticated;

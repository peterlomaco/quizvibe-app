-- ─────────────────────────────────────────────────────────────────────
-- 0060_deleted_account_tombstones — blockera återregistrering i 12 mån
-- efter "Delete Account".
-- Applied via Supabase SQL Editor (manuell körning). Idempotent.
--
-- Problem: delete-account hard-deletar auth.users → profiles CASCADE:as
-- och INGENTING mindes. Både email:en och PlayerName:t var lediga direkt:
--   - någon annan kunde ta en raderad users PlayerName omedelbart, och
--   - samma user kunde radera + registrera om med samma email för att få
--     färska credits + en ny gratis Premium-månad (premium_grants är per
--     konto).
--
-- Lösning: delete-account-funktionen skriver en TOMBSTONE (hashad email +
-- PlayerName) INNAN kontot raderas. I 365 dagar räknas email:en och namnet
-- som "upptagna":
--   - email_exists / player_name_exists returnerar true (Check-knapparna
--     + Add Player + guest-namn-checkarna visar "taken" utan klientändring),
--   - handle_new_user RAISE:ar som server-backstop (en moddad klient kan
--     inte hoppa förbi Check-knapparna).
--
-- Den raderade användaren kontaktar info@quizvibe.se; support släpper
-- blocket manuellt (se SUPPORT-snippet sist i filen).
--
-- GDPR: email:en lagras ALDRIG i klartext — bara sha256(lower(trim(email))).
-- Support kan ändå verifiera en avsändare genom att hasha adressen de
-- skriver från. Raderna rensas automatiskt efter 365 dagar (pg_cron).
--
-- ⚠ Hashningen MÅSTE vara identisk med delete-account-funktionens
-- Web Crypto-SHA-256 över email.trim().toLowerCase() (hex, gemener).
-- ─────────────────────────────────────────────────────────────────────

create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext;

-- ── 1. Tabellen ──────────────────────────────────────────────────────
create table if not exists public.deleted_account_tombstones (
  id           uuid primary key default gen_random_uuid(),
  email_hash   text not null,
  player_name  citext not null,
  deleted_at   timestamptz not null default now()
);

create index if not exists deleted_account_tombstones_email_hash_idx
  on public.deleted_account_tombstones (email_hash);
create index if not exists deleted_account_tombstones_player_name_idx
  on public.deleted_account_tombstones (player_name);

-- Ingen klient-åtkomst alls: RLS på utan policies + explicita grants
-- (Supabase default privileges ger annars anon/authenticated åtkomst).
alter table public.deleted_account_tombstones enable row level security;
revoke all on public.deleted_account_tombstones from anon, authenticated;
grant all on public.deleted_account_tombstones to service_role;

-- ── 2. Hash-helper (intern) ──────────────────────────────────────────
create or replace function public._tombstone_email_hash(p_email text)
returns text
language sql
immutable
set search_path = public, extensions
as $$
  select encode(extensions.digest(lower(trim(p_email)), 'sha256'), 'hex');
$$;

-- Default privileges ger nya funktioner EXECUTE till anon/authenticated
-- (se 0059) — revoke explicit. Ofarlig att exponera, men intern.
revoke execute on function public._tombstone_email_hash(text) from public, anon, authenticated;

-- ── 3. Är email/namn blockerat? (intern) ─────────────────────────────
create or replace function public._is_tombstoned(p_email text, p_name text)
returns boolean
language sql
stable
security definer
set search_path = public, extensions
as $$
  select exists (
    select 1 from public.deleted_account_tombstones t
    where t.deleted_at > now() - interval '365 days'
      and (
        (p_email is not null and t.email_hash = public._tombstone_email_hash(p_email))
        or (p_name is not null and t.player_name = p_name::citext)
      )
  );
$$;

revoke execute on function public._is_tombstoned(text, text) from public, anon, authenticated;

-- ── 4. email_exists (0040) + player_name_exists (0022) ───────────────
create or replace function public.email_exists(p_email text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from auth.users where lower(email) = lower(trim(p_email))
  ) or public._is_tombstoned(p_email, null);
$$;

grant execute on function public.email_exists(text) to anon, authenticated;

create or replace function public.player_name_exists(p_name text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.profiles where player_name = p_name)
      or public._is_tombstoned(null, p_name);
$$;

grant execute on function public.player_name_exists(text) to anon, authenticated;

-- ── 5. handle_new_user (0048) — server-backstop ──────────────────────
-- Oförändrad mot 0048 utöver tombstone-checken. RAISE abortar hela
-- signUp:en; GoTrue returnerar då "Database error saving new user", som
-- klienten mappar till ett vänligt meddelande.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- Hoppa över anon/guest-users (ingen email, ingen registrerings-metadata).
  if new.email is null
     or (new.raw_user_meta_data->>'playerName') is null then
    return null;
  end if;

  if public._is_tombstoned(new.email, new.raw_user_meta_data->>'playerName') then
    raise exception 'registration_blocked_deleted_account';
  end if;

  insert into public.profiles (
    id, email, player_name, birth_year, assistance, region,
    game_era_from, game_era_to
  ) values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'playerName',
    nullif(new.raw_user_meta_data->>'birthYear', '')::int,
    new.raw_user_meta_data->>'assistance',
    new.raw_user_meta_data->>'region',
    nullif(new.raw_user_meta_data->>'gameEraFrom', '')::int,
    nullif(new.raw_user_meta_data->>'gameEraTo', '')::int
  )
  on conflict (id) do nothing;  -- id-backstop; player_name-krock får RAISE:a

  return null;  -- AFTER-trigger: returvärdet ignoreras
end;
$$;

-- Trigger:n från 0048 pekar redan på funktionen — ingen omskapning behövs.

-- ── 6. pg_cron — rensa tombstones äldre än 365 dagar ─────────────────
do $$
begin
  perform cron.unschedule('deleted-tombstone-purge');
exception when others then
  null;
end
$$;

select cron.schedule(
  'deleted-tombstone-purge',
  '45 3 * * *',
  $$delete from public.deleted_account_tombstones
    where deleted_at < now() - interval '365 days'$$
);

-- ── SUPPORT: släpp ett block (kör i SQL Editor) ──────────────────────
-- Verifiera först att avsändaren äger kontot: hasha adressen de mejlar
-- från och jämför mot raden.
--
--   select player_name, deleted_at,
--          email_hash = public._tombstone_email_hash('their@email.se') as email_matches
--   from public.deleted_account_tombstones
--   where player_name = 'Anna-42';
--
-- Släpp på namn:
--   delete from public.deleted_account_tombstones where player_name = 'Anna-42';
-- Släpp på email:
--   delete from public.deleted_account_tombstones
--   where email_hash = public._tombstone_email_hash('their@email.se');

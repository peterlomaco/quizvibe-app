-- ─────────────────────────────────────────────────────────────────────
-- 0017_user_friends — Vänner cross-device (ersätter AsyncStorage-mock)
--
-- Ersätter `src/utils/friendsStorage.ts`:s AsyncStorage-lagring med
-- Supabase så vän-listan synkas cross-device och host kan skicka
-- invites till vänner oavsett vilken enhet de loggar in från.
--
-- Design-val:
--   • Enkel "jag har sparat den här personen som vän"-modell (V1).
--     Ingen ömsesidig godkänning — asymmetrisk precis som följning.
--   • friend_user_id backfillas via trigger (samma mönster som
--     waiting_invites / 0010) så Realtime-subscriptions kan filtrera
--     på user_id utan extra lookup.
--   • friend_player_name är citext (case-insensitive unique) för att
--     spegla hur PlayerName är lagrat i profiles.
--   • CASCADE på user_id: om en user raderar konto försvinner deras
--     vän-lista. Deras entries i ANDRAS vän-listor berörs ej —
--     de är separata rader ägda av den andra parten.
--
-- Appliceras manuellt via Supabase SQL Editor.
-- ─────────────────────────────────────────────────────────────────────


-- ── user_friends ──────────────────────────────────────────────────────

create table public.user_friends (
  id                  uuid primary key default gen_random_uuid(),

  -- Ägaren av denna vänrelation
  user_id             uuid not null references auth.users(id)
                        on delete cascade,

  -- Väns identitet — snapshot-namn + optional user_id-koppling
  friend_player_name  citext not null,            -- case-insensitive jämförelse
  friend_user_id      uuid references auth.users(id)
                        on delete set null,       -- null = vännen saknar konto
  friend_avatar_id    text,                       -- cachat för snabb rendering

  added_at            timestamptz not null default now(),

  -- Förhindrar duplikat: en user kan bara ha en rad per vän-namn
  unique (user_id, friend_player_name)
);

-- Primär index: "ladda mina vänner" (Friends-modal på Profile + Lobby)
create index user_friends_user_idx
  on public.user_friends (user_id, added_at desc);

-- Index: reverse lookup — "vem har lagt mig som vän?" (framtida
-- "mutual friends"-feature, notifikationer etc.)
create index user_friends_friend_user_idx
  on public.user_friends (friend_user_id)
  where friend_user_id is not null;

-- Index: citext-sökning på namn (Share invite: "lägg till via PlayerName")
create index user_friends_friend_name_idx
  on public.user_friends (friend_player_name);


-- ── RLS ──────────────────────────────────────────────────────────────
alter table public.user_friends enable row level security;

-- Spelare ser bara sina egna vänner
create policy "user reads own friends"
  on public.user_friends for select
  to authenticated
  using (user_id = auth.uid());

-- Spelare lägger till sina egna vänner
create policy "user inserts own friends"
  on public.user_friends for insert
  to authenticated
  with check (user_id = auth.uid());

-- Spelare uppdaterar (t.ex. byter friend_avatar_id vid profilbyte)
create policy "user updates own friends"
  on public.user_friends for update
  to authenticated
  using (user_id = auth.uid());

-- Spelare tar bort en vän
create policy "user deletes own friends"
  on public.user_friends for delete
  to authenticated
  using (user_id = auth.uid());


-- ── Trigger: backfilla friend_user_id vid INSERT ──────────────────────
-- Speglar set_invite_to_user_id från migration 0010. Slår upp
-- vännens user_id i profiles (citext-match på player_name) vid INSERT
-- så RLS-filter och Realtime-subscriptions kan använda UUID.
--
-- security definer: kringgår profiles-RLS (own-row-only) för uppslaget.
-- Läcker bara en uuid — ingen annan profil-data exponeras.

create or replace function public.set_friend_user_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.friend_user_id is null then
    select id into new.friend_user_id
    from public.profiles
    where player_name = new.friend_player_name;
  end if;
  return new;
end;
$$;

create trigger user_friends_set_friend_user_id
  before insert on public.user_friends
  for each row execute function public.set_friend_user_id();


-- ── Trigger: synka friend_user_id när vännen registrerar sig ─────────
-- Om User A har sparat User B som vän INNAN B registrerat sig i appen,
-- förblir friend_user_id null. Denna trigger fyller i UUID:t när B
-- skapar sin profil-rad — utan detta missar Realtime-push till A.
--
-- Fires AFTER INSERT on profiles (ny registrering).

create or replace function public.backfill_friend_user_id_on_registration()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Uppdatera alla rader som pekar på det nyregistrerade player_name
  update public.user_friends
  set friend_user_id = new.id
  where friend_player_name = new.player_name
    and friend_user_id is null;
  return new;
end;
$$;

create trigger profiles_backfill_friend_ids
  after insert on public.profiles
  for each row execute function public.backfill_friend_user_id_on_registration();


-- ── Realtime ─────────────────────────────────────────────────────────
-- Aktivera Realtime på user_friends för framtida "ny vän lade till dig"-
-- notifikationer och live-sync av vän-listan cross-device.
-- V1: appen läser bara via SELECT; Realtime-subscriptionen wiras in
-- när notification-feature byggs.
alter publication supabase_realtime add table public.user_friends;

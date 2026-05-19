-- ─────────────────────────────────────────────────────────────────────
-- 0010_waiting_invites — Fas 3 (cross-device Share invite delivery)
-- Ersätter den lokala AsyncStorage-only waitingInvites-mock:en så invites
-- pushas cross-device via Supabase istället för att fastna på hostens
-- device. Mottagaren hämtar sin inbox vid Home-mount/JoinModal-open via
-- SELECT på to_user_id = auth.uid().
--
-- Applied via Supabase SQL Editor (manuell körning, vi använder inte
-- Supabase CLI migrations idag). Filen sparas här som schema-källa-of-
-- truth så framtida miljö-rekreation kan applicera den deterministiskt.
-- ─────────────────────────────────────────────────────────────────────

create table public.waiting_invites (
  id uuid primary key default gen_random_uuid(),
  -- Mottagarens playerName lowercase. Speglar AsyncStorage-nyckelns
  -- konvention så same-key-lookup fortsätter funka offline.
  to_player_name text not null,
  -- Backfillas av set_invite_to_user_id-trigger vid INSERT — recipient kan
  -- då läsa sin egen rad via to_user_id = auth.uid() utan att gå via
  -- playerName-resolve. Null när mottagaren saknar registrerat konto
  -- (raden blir då osynlig för alla via RLS — det är ok, vi accepterar
  -- att invites till oregistrerade users tappas tyst för MVP).
  to_user_id uuid references auth.users(id) on delete cascade,
  -- Rumkod inviten gäller. Cascade så stale invites till raderade lobby:s
  -- försvinner automatiskt när host trycker Delete this Game Lobby.
  room_code text not null references public.rooms(code) on delete cascade,
  from_player_name text not null,
  from_avatar_id text,
  sent_at timestamptz not null default now(),
  -- Per-recipient + per-room + per-avsändare uniqueness — dubbel-invite på
  -- samma rum från samma host blir INSERT ... ON CONFLICT DO NOTHING-no-op
  -- istället för rad-duplicering. Speglar AsyncStorage-mockens dedup-logik
  -- (skippa om samma roomCode + fromPlayerName redan finns).
  unique (to_player_name, room_code, from_player_name)
);

create index waiting_invites_to_user_idx on public.waiting_invites (to_user_id);
create index waiting_invites_to_player_idx on public.waiting_invites (to_player_name);

-- ── RLS ───────────────────────────────────────────────────────────────
alter table public.waiting_invites enable row level security;

-- INSERT: alla authenticated kan skicka invite till valfri spelare. UI:t
-- gate:ar genom att bara visa Invite-knapparna i Share invite-modalen för
-- spelare i hostens QuizVibe friends-lista. Anti-spam på server-side är
-- framtida ansvar (rate limits, recipient blocklist, etc.).
create policy "authenticated can send invites"
on public.waiting_invites for insert
to authenticated
with check (true);

-- SELECT: bara mottagaren ser sin egen inbox. Drivs av to_user_id =
-- auth.uid() (backfilled vid INSERT via trigger).
create policy "recipient reads own invites"
on public.waiting_invites for select
to authenticated
using (to_user_id = auth.uid());

-- DELETE: bara mottagaren kan ta bort sina egna invites (Accept-flödet
-- + cleanup av stale invite när host raderat lobby:n).
create policy "recipient deletes own invites"
on public.waiting_invites for delete
to authenticated
using (to_user_id = auth.uid());

-- ── Trigger: backfilla to_user_id vid INSERT ──────────────────────────
-- Host vet bara recipient:s playerName, inte deras user_id. Trigger:n
-- slår upp det i profiles via citext-eq på player_name (case-insensitive
-- match) så SELECT-policyn "recipient reads own invites" hittar raden
-- direkt utan att klienten behöver göra ett separat playerName→user_id-
-- anrop före INSERT (vilket inte hade fungerat ändå eftersom RLS på
-- profiles tillåter bara own-row-läsning).
--
-- security definer kör med ägar-rättigheter så set_invite_to_user_id
-- kringgår profiles-RLS för uppslaget. Returnerar bara user_id (en uuid),
-- ingen annan profil-data läcker via trigger:n.
create or replace function public.set_invite_to_user_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.to_user_id is null then
    select id into new.to_user_id
    from public.profiles
    where player_name = new.to_player_name::citext;
  end if;
  return new;
end;
$$;

create trigger waiting_invites_set_to_user_id
before insert on public.waiting_invites
for each row execute function public.set_invite_to_user_id();

-- ── Realtime ──────────────────────────────────────────────────────────
-- Driver framtida Home-screen-subscription för live-push av invites utan
-- att mottagaren behöver re-öppna JoinModal:en. Idag laddas inbox:en bara
-- vid modal-open, men publication-add:n förbereder för Realtime-flödet.
alter publication supabase_realtime add table public.waiting_invites;

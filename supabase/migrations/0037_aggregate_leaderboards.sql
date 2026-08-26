-- ─────────────────────────────────────────────────────────────────────
-- 0037_aggregate_leaderboards — namngivna Aggregate Leaderboards/Scores
--                               + låst spelaruppsättning i re-match-lobbyn
-- Applied via Supabase SQL Editor (manuell körning).
--
-- ── Bakgrund ─────────────────────────────────────────────────────────
-- "Aggregate Leaderboard" byggdes först som en REN LOKAL serie
-- (src/utils/aggregateLeaderboard.ts, AsyncStorage), kedjad via rumkoden:
-- när host startar en re-match stämplas den kommande koden, och nästa spel
-- som slutar i det rummet fortsätter serien. Den modellen behöver varken
-- server eller synkat series-id och lever kvar oförändrad — den är det som
-- driver flikarna på slutskärmen, även för gäst-spel.
--
-- Denna migration lägger ett ANDRA lager ovanpå: när spelet består av
-- 100 % QuizVibe-users sparas serien dessutom NAMNGIVEN på varje deltagares
-- konto, så den (a) överlever telefonbyte, (b) syns under Player history hos
-- alla deltagare, och (c) kan återupptas en annan kväll — "Add to existing
-- Aggregate Leaderboard?" listar tidigare serier med EXAKT samma spelare.
--
-- En serie med en enda deltagare heter "Aggregate Score" i UI:t (single
-- player-varianten "Replay & Aggregate score"); datamodellen är identisk.
--
-- ── Två delar ────────────────────────────────────────────────────────
--   DEL 1: rooms-kolumner som låser re-match-lobbyns spelaruppsättning.
--   DEL 2: tabellerna + RPC:erna för sparade aggregat.
-- ─────────────────────────────────────────────────────────────────────


-- ═════════════════════════════════════════════════════════════════════
-- DEL 1 — Låst spelaruppsättning i re-match-lobbyn
-- ═════════════════════════════════════════════════════════════════════
--
-- Väljer host "Re-match" ska den nya lobbyn innehålla EXAKT spelarna från
-- förra spelet — varken fler eller färre. Annars kan aggregatet inte längre
-- vara en rättvis serie: en spelare som tillkommer mitt i har inte spelat
-- samma spel som de andra.
--
-- Varför på `rooms` och inte i `lobby_settings`: exakt samma skäl som
-- is_remote_1v1 (0031). `lobby_settings` skrivs av hostens LobbyScreen genom
-- en 300 ms DEBOUNCE, så en join-gate som läser den är FAIL-OPEN i ~1s efter
-- att lobbyn skapats. `registerActiveRoom` skriver rums-raden ATOMISKT vid
-- skapandet — innan koden ens är joinbar för någon annan.
--
-- Legacy: rum skapade före denna migration får false/{} och beter sig som
-- förr. De expirerar inom 24h; ingen backfill behövs.

alter table public.rooms
  add column if not exists rematch_locked boolean not null default false,
  add column if not exists rematch_player_ids text[] not null default array[]::text[];

comment on column public.rooms.rematch_locked is
  'True när lobbyn skapades via Re-match/Replay från Final Leaderboard. '
  'Spelaruppsättningen är då låst: "+ Add Player" och papperskorgen döljs, '
  'Game Mode-sektionen blir statisk (varje lägesbyte ejectar spelare), och '
  'join-gaten släpper bara in spelare som redan finns i lobby_players.';

comment on column public.rooms.rematch_player_ids is
  'lobby_players.player_id för spelarna från föregående spel. Host:s Start '
  'Game blockeras tills varje id finns i lobby_players utan has_left, så '
  'ingen kan starta en re-match med halva uppsättningen.';


-- ═════════════════════════════════════════════════════════════════════
-- DEL 2 — Sparade Aggregate Leaderboards / Scores
-- ═════════════════════════════════════════════════════════════════════

-- Parent. `participants_key` är sorterade user_id:n joinade med ',' och
-- beräknas ALLTID inne i RPC:n — aldrig av klienten, som annars kunde
-- knyta en serie till en uppsättning den inte tillhör.
--
-- Medvetet INTE unique: samma gäng ska kunna ha flera namngivna serier
-- ("Fredagsquiz", "Semestern"). Det är hela poängen med listan i
-- "Add to existing Aggregate Leaderboard?".
create table if not exists public.aggregate_leaderboards (
  id               uuid primary key default gen_random_uuid(),
  name             text not null check (char_length(name) between 1 and 40),
  participants_key text not null,
  created_by       uuid not null references auth.users(id) on delete cascade,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists aggregate_leaderboards_participants_idx
  on public.aggregate_leaderboards (participants_key);

-- Deltagaruppsättningen. Immutabel — sätts en gång av create-RPC:n.
--
-- `player_name` är ett SNAPSHOT och måste vara det: profiles har
-- own-row-only SELECT-RLS (0001), så en klient kan ALDRIG läsa en annan
-- spelares player_name. Samma skäl som remote_match_players.player_name
-- och lobby_players.account_player_name (0030).
create table if not exists public.aggregate_leaderboard_players (
  leaderboard_id uuid not null references public.aggregate_leaderboards(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  player_name    text not null,

  primary key (leaderboard_id, user_id)
);

create index if not exists aggregate_leaderboard_players_user_idx
  on public.aggregate_leaderboard_players (user_id);

-- Ett spel i serien. `stats` är klientens AggregateGamePlayer[] verbatim
-- (points/playedRounds/correctAnswers/totalResponseSeconds/results/…), så
-- summeringen kan göras av EXAKT samma funktion som räknar den lokala
-- serien (buildAggregateStandings). Lokal vy och sparad vy kan därför inte
-- glida isär.
--
-- Composite-PK (leaderboard_id, room_code) ger IDEMPOTENS: slutskärmen
-- skriver om sig när sena peer-scores droppar in i Individual Devices, och
-- ska då ersätta spelets rad — inte lägga till en till.
create table if not exists public.aggregate_leaderboard_games (
  leaderboard_id uuid not null references public.aggregate_leaderboards(id) on delete cascade,
  room_code      text not null,
  played_at      timestamptz not null default now(),
  stats          jsonb not null,

  primary key (leaderboard_id, room_code)
);


-- ── RLS ──────────────────────────────────────────────────────────────
-- SECURITY DEFINER-helper: "är caller deltagare i serien?". Krävs för att
-- undvika RLS-REKURSION — en policy på aggregate_leaderboard_players som
-- själv SELECT:ar aggregate_leaderboard_players ger infinite recursion.
-- Samma mönster som is_remote_match_participant (0027).
create or replace function public.is_aggregate_leaderboard_participant(lid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.aggregate_leaderboard_players p
    where p.leaderboard_id = lid and p.user_id = auth.uid()
  );
$$;

revoke all on function public.is_aggregate_leaderboard_participant(uuid) from public;
grant execute on function public.is_aggregate_leaderboard_participant(uuid) to authenticated;

alter table public.aggregate_leaderboards        enable row level security;
alter table public.aggregate_leaderboard_players enable row level security;
alter table public.aggregate_leaderboard_games   enable row level security;

-- Bara SELECT-policyer. INGEN insert/update/delete — all skrivning går via
-- RPC:erna nedan, deny-by-default. Samma doktrin som remote_matches.
drop policy if exists "participants read aggregate leaderboards" on public.aggregate_leaderboards;
create policy "participants read aggregate leaderboards"
  on public.aggregate_leaderboards for select
  to authenticated
  using (public.is_aggregate_leaderboard_participant(id));

drop policy if exists "participants read aggregate leaderboard players" on public.aggregate_leaderboard_players;
create policy "participants read aggregate leaderboard players"
  on public.aggregate_leaderboard_players for select
  to authenticated
  using (public.is_aggregate_leaderboard_participant(leaderboard_id));

drop policy if exists "participants read aggregate leaderboard games" on public.aggregate_leaderboard_games;
create policy "participants read aggregate leaderboard games"
  on public.aggregate_leaderboard_games for select
  to authenticated
  using (public.is_aggregate_leaderboard_participant(leaderboard_id));


-- ── Intern helper: kanonisk nyckel för en uppsättning user_id:n ───────
create or replace function public._aggregate_participants_key(p_user_ids uuid[])
returns text
language sql
immutable
as $$
  select string_agg(x::text, ',' order by x) from unnest(p_user_ids) x;
$$;

revoke all on function public._aggregate_participants_key(uuid[]) from public;


-- ── RPC: skapa ───────────────────────────────────────────────────────
-- Servern avgör själv att VARJE deltagare är en registrerad QuizVibe-user
-- genom att kräva en profiles-rad per uid. Anon-sessioner (gäster) skriver
-- aldrig profiles, så "profiles-rad finns" ÄR registrerad-testet — samma
-- resonemang som create_remote_match (0029). Klientens 'type' är spoofbar
-- och används inte.
create or replace function public.create_aggregate_leaderboard(
  p_name text,
  p_user_ids uuid[]
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller   uuid := auth.uid();
  uniq_ids uuid[];
  new_id   uuid;
  uid      uuid;
  pname    text;
  clean    text := btrim(coalesce(p_name, ''));
begin
  if caller is null then
    raise exception 'aggregate leaderboard: no authenticated caller' using errcode = 'P0001';
  end if;
  if p_user_ids is null or array_length(p_user_ids, 1) is null then
    raise exception 'aggregate leaderboard requires at least one participant' using errcode = 'P0001';
  end if;

  select array_agg(distinct x) into uniq_ids from unnest(p_user_ids) x;

  if not (caller = any(uniq_ids)) then
    raise exception 'caller must be a participant' using errcode = 'P0001';
  end if;
  if clean = '' then
    raise exception 'aggregate leaderboard name required' using errcode = 'P0001';
  end if;
  clean := left(clean, 40);

  -- Alla deltagare måste vara registrerade — annars sparas ingenting.
  foreach uid in array uniq_ids loop
    if not exists (select 1 from public.profiles p where p.id = uid) then
      raise exception 'all participants must be registered QuizVibe users' using errcode = 'P0001';
    end if;
  end loop;

  insert into public.aggregate_leaderboards (name, participants_key, created_by)
  values (clean, public._aggregate_participants_key(uniq_ids), caller)
  returning id into new_id;

  foreach uid in array uniq_ids loop
    select p.player_name::text into pname from public.profiles p where p.id = uid;
    insert into public.aggregate_leaderboard_players (leaderboard_id, user_id, player_name)
    values (new_id, uid, coalesce(pname, 'Player'));
  end loop;

  return new_id;
end;
$$;

revoke all on function public.create_aggregate_leaderboard(text, uuid[]) from public;
grant execute on function public.create_aggregate_leaderboard(text, uuid[]) to authenticated;


-- ── RPC: hitta serier med EXAKT denna uppsättning ─────────────────────
-- PostgREST kan inte uttrycka mängd-likhet över en embedded child-tabell,
-- därav en RPC. `participants_key` är redan kanonisk, så jämförelsen är en
-- enkel likhet mot samma nyckel beräknad ur argumentet.
create or replace function public.list_aggregate_leaderboards_for_participants(
  p_user_ids uuid[]
) returns table (
  id uuid,
  name text,
  games_count int,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  caller   uuid := auth.uid();
  uniq_ids uuid[];
begin
  if caller is null then
    raise exception 'aggregate leaderboard: no authenticated caller' using errcode = 'P0001';
  end if;
  if p_user_ids is null or array_length(p_user_ids, 1) is null then
    return;
  end if;

  select array_agg(distinct x) into uniq_ids from unnest(p_user_ids) x;
  if not (caller = any(uniq_ids)) then
    raise exception 'caller must be a participant' using errcode = 'P0001';
  end if;

  return query
    select l.id,
           l.name,
           (select count(*)::int from public.aggregate_leaderboard_games g
             where g.leaderboard_id = l.id) as games_count,
           l.updated_at
      from public.aggregate_leaderboards l
     where l.participants_key = public._aggregate_participants_key(uniq_ids)
     order by l.updated_at desc;
end;
$$;

revoke all on function public.list_aggregate_leaderboards_for_participants(uuid[]) from public;
grant execute on function public.list_aggregate_leaderboards_for_participants(uuid[]) to authenticated;


-- ── RPC: bokför ett spel ─────────────────────────────────────────────
-- ⚠ Bara HOST anropar denna. En non-host som lämnat mitt i spelet har en
--   ofullständig allRoundScoresHistory och skulle skriva trunkerad
--   statistik. Servern kan inte veta vem som är host just nu, så guarden
--   här är "deltagare" och host-only-regeln bor i klienten (quiz.tsx).
create or replace function public.record_aggregate_leaderboard_game(
  p_leaderboard_id uuid,
  p_room_code text,
  p_stats jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  code   text := upper(btrim(coalesce(p_room_code, '')));
begin
  if caller is null then
    raise exception 'aggregate leaderboard: no authenticated caller' using errcode = 'P0001';
  end if;
  if not public.is_aggregate_leaderboard_participant(p_leaderboard_id) then
    raise exception 'caller must be a participant' using errcode = 'P0001';
  end if;
  if code = '' then
    raise exception 'room code required' using errcode = 'P0001';
  end if;
  if p_stats is null or jsonb_typeof(p_stats) <> 'array' then
    raise exception 'stats must be a json array' using errcode = 'P0001';
  end if;

  insert into public.aggregate_leaderboard_games (leaderboard_id, room_code, stats)
  values (p_leaderboard_id, code, p_stats)
  on conflict (leaderboard_id, room_code)
  do update set stats = excluded.stats;

  update public.aggregate_leaderboards
     set updated_at = now()
   where id = p_leaderboard_id;
end;
$$;

revoke all on function public.record_aggregate_leaderboard_game(uuid, text, jsonb) from public;
grant execute on function public.record_aggregate_leaderboard_game(uuid, text, jsonb) to authenticated;


-- ── RPC: byt namn ────────────────────────────────────────────────────
-- Guarden är "deltagare" — servern vet inte vem som är host just nu.
-- Klienten visar pennan bara för host (RoundLeaderboard).
create or replace function public.rename_aggregate_leaderboard(
  p_leaderboard_id uuid,
  p_name text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  clean  text := btrim(coalesce(p_name, ''));
begin
  if caller is null then
    raise exception 'aggregate leaderboard: no authenticated caller' using errcode = 'P0001';
  end if;
  if not public.is_aggregate_leaderboard_participant(p_leaderboard_id) then
    raise exception 'caller must be a participant' using errcode = 'P0001';
  end if;
  if clean = '' then
    raise exception 'aggregate leaderboard name required' using errcode = 'P0001';
  end if;

  update public.aggregate_leaderboards
     set name = left(clean, 40), updated_at = now()
   where id = p_leaderboard_id;
end;
$$;

revoke all on function public.rename_aggregate_leaderboard(uuid, text) from public;
grant execute on function public.rename_aggregate_leaderboard(uuid, text) to authenticated;

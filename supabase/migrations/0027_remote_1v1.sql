-- ─────────────────────────────────────────────────────────────────────
-- 0027_remote_1v1 — Nytt spelläge: Remote 1v1 (asynkron duell)
-- Applied via Supabase SQL Editor (manuell körning).
--
-- Remote 1v1: exakt 2 spelare svarar på SAMMA frågesekvens oberoende av
-- varandra, på egna enheter, inom 48h från matchstart. Kräver server-side
-- persistens (frågesekvens + per-fråga-svar + resultat) eftersom spelarna
-- kan spela vid olika tidpunkter — ingen realtime-sync under spel.
--
-- Innehåll:
--   DEL 1: CHECK-uppdateringar (game_mode + max_players får nya värden)
--   DEL 2: Nya tabeller remote_matches / remote_match_players /
--          remote_match_answers
--   DEL 3: RLS (participant-läsning via SECURITY DEFINER-helper för att
--          undvika RLS-rekursion; skrivning enbart via RPC:er)
--   DEL 4: RPC:er — create_remote_match, set_remote_match_questions,
--          finalize_remote_match_player (+ intern vinnar-helper)
--   DEL 5: Realtime publication (My 1v1 Matches live-uppdatering)
--   DEL 6: pg_cron — deadline-sweep (walkover/void) + guest-cleanup
--   DEL 7: waiting_invites sender-läs-policy (max-4-invites-räkning)
--
-- Design-beslut:
--   - remote_matches.room_code är text-SNAPSHOT utan FK mot rooms —
--     matchen ska överleva rummets 24h-expiry (pg_cron 0006 raderar
--     rooms; matchens egen livscykel är 48h + retention).
--   - Klienten kan ALDRIG skriva winner/status/question_ids direkt:
--     remote_matches och remote_match_players saknar INSERT/UPDATE-
--     policyer helt. All skrivning går via SECURITY DEFINER-RPC:erna
--     som validerar caller = deltagare. Förhindrar resultat-manipulation
--     på DB-nivå (jfr Security hardening-passet 2026-07-04).
--   - Vinnare beräknas atomiskt i Postgres med radlås (FOR UPDATE) —
--     två klienter som finaliserar nära-samtidigt kan inte race:a.
--   - Guests har riktiga anon-sessioner (auth.uid() finns) så RLS
--     fungerar oförändrat för dem.
-- ─────────────────────────────────────────────────────────────────────

-- ── DEL 1 ── CHECK-uppdateringar ──────────────────────────────────────
-- Auto-genererade constraint-namn följer <tabell>_<kolumn>_check för
-- inline enkolumns-CHECKs. Verifiera vid behov med:
--   select conname, pg_get_constraintdef(oid) from pg_constraint
--   where conrelid = 'public.profiles'::regclass and contype = 'c';

-- profiles.game_mode: + 'remote-1v1'
alter table public.profiles drop constraint if exists profiles_game_mode_check;
alter table public.profiles add constraint profiles_game_mode_check
  check (game_mode in ('pass-the-phone','individual-devices','remote-1v1'));

-- profiles.max_players: + 2 (defensivt — klienten sparar normalt inte 2
-- som profil-default, men save-pathen ska inte kunna faila på det)
alter table public.profiles drop constraint if exists profiles_max_players_check;
alter table public.profiles add constraint profiles_max_players_check
  check (max_players in (2, 4, 12));

-- rooms.max_players: + 2 — host sätter 2 vid val av Remote 1v1 så
-- befintlig capacity-guard i Home:s JoinModal blockar spelare #3 utan
-- ny klientkod.
alter table public.rooms drop constraint if exists rooms_max_players_check;
alter table public.rooms add constraint rooms_max_players_check
  check (max_players in (2, 4, 12));

-- lobby_settings.game_mode + max_players
alter table public.lobby_settings drop constraint if exists lobby_settings_game_mode_check;
alter table public.lobby_settings add constraint lobby_settings_game_mode_check
  check (game_mode in ('pass-the-phone','individual-devices','remote-1v1'));

alter table public.lobby_settings drop constraint if exists lobby_settings_max_players_check;
alter table public.lobby_settings add constraint lobby_settings_max_players_check
  check (max_players in (2, 4, 12));

-- game_sessions.game_mode (0016 — oanvänd av klienten idag, men håll
-- enum:en i synk så framtida aktivering inte snubblar). VILLKORLIG:
-- 0016 är inte applicerad i alla miljöer (Peters projekt saknade tabellen
-- 2026-08-07 → "relation does not exist" fällde hela 0027-körningen) —
-- DO-blocket hoppar tyst över när tabellen saknas.
do $$
begin
  if to_regclass('public.game_sessions') is not null then
    alter table public.game_sessions drop constraint if exists game_sessions_game_mode_check;
    alter table public.game_sessions add constraint game_sessions_game_mode_check
      check (game_mode in ('pass-the-phone','individual-devices','single-player','remote-1v1'));
  end if;
end
$$;

-- ── DEL 2 ── Nya tabeller ─────────────────────────────────────────────

create table public.remote_matches (
  id            uuid primary key default gen_random_uuid(),

  -- Snapshot av rumkoden — INGEN FK (rummet dör efter 24h, matchen
  -- lever 48h + retention). Används för kod-återinträde i JoinModal.
  room_code     text not null,

  status        text not null default 'active'
                  check (status in ('active','finished','expired_walkover','void')),

  -- Frågesekvensen (jsonb-array av question-id-strängar). null tills
  -- host:s quiz-mount persisterat sin genererade sekvens — därefter
  -- auktoritativ för BÅDA enheter (även host-resume läser härifrån).
  question_ids  jsonb,

  -- Settings-snapshot vid matchstart (speglar 0016-stilen). Behövs för
  -- att motståndaren ska kunna spela långt efter att rummet/lobby-
  -- settings raderats. Spotify är alltid av i detta läge → ingen kolumn.
  rounds_count              int not null default 4,
  answer_response_seconds   int not null default 30
                              check (answer_response_seconds in (15,30,45,60)),
  era_from                  int not null,
  era_to                    int not null,
  youtube_enabled_categories text[] not null default array['Music','Film','Sport']::text[],
  images_enabled_categories  text[] not null default array['Music','Film','Sport']::text[],
  selected_extra_packages    text[] not null default array[]::text[],

  started_at    timestamptz not null default now(),
  -- 48h-fönstret: efter deadline avgör cron-sweepen walkover/void.
  deadline_at   timestamptz not null default (now() + interval '48 hours'),

  -- Resultat — sätts ENBART av finalize-RPC:n eller deadline-sweepen.
  winner_user_id uuid,          -- null = draw/void/oavgjort ännu
  result        text check (result in ('decided','draw','walkover','void')),
  finished_at   timestamptz
);

create index remote_matches_status_deadline_idx
  on public.remote_matches (status, deadline_at);

create index remote_matches_room_code_idx
  on public.remote_matches (room_code);

create table public.remote_match_players (
  match_id      uuid not null references public.remote_matches(id) on delete cascade,
  -- CASCADE: raderar en user sitt konto försvinner deras deltagande;
  -- motståndarens rad + matchen finns kvar (visas som ofullständig/
  -- städas av retention).
  user_id       uuid not null references auth.users(id) on delete cascade,
  player_name   text not null,   -- snapshot vid matchstart
  is_host       boolean not null,
  player_type   text not null check (player_type in ('registered','guest')),
  assistance    text,
  age           int,

  -- Sätts av finalize-RPC:n när spelaren spelat klart alla frågor.
  finished_at   timestamptz,
  total_points  int not null default 0,
  correct_answers int not null default 0,
  avg_response_seconds numeric(6,3),

  primary key (match_id, user_id)
);

-- My 1v1 Matches: "mina matcher" slås upp på user_id
create index remote_match_players_user_idx
  on public.remote_match_players (user_id, finished_at);

create table public.remote_match_answers (
  id              uuid primary key default gen_random_uuid(),
  match_id        uuid not null references public.remote_matches(id) on delete cascade,
  user_id         uuid not null,
  question_index  int not null check (question_index >= 0 and question_index < 100),
  question_id     text not null,
  correct         boolean not null,
  points          int not null default 0 check (points >= 0 and points <= 10),
  time_used_seconds numeric(6,3) not null check (time_used_seconds >= 0),
  created_at      timestamptz not null default now(),

  -- Idempotent upsert per (match, spelare, fråga) — gör resume och
  -- retry-skrivningar säkra (ingen dubbelräkning).
  unique (match_id, user_id, question_index)
);

create index remote_match_answers_match_user_idx
  on public.remote_match_answers (match_id, user_id);

-- ── DEL 3 ── RLS ──────────────────────────────────────────────────────

-- SECURITY DEFINER-helper: "är caller deltagare i matchen?". Krävs för
-- att undvika RLS-REKURSION — en policy på remote_match_players som
-- själv SELECT:ar remote_match_players ger infinite recursion; definer-
-- funktionen kringgår RLS internt och bryter cykeln.
create or replace function public.is_remote_match_participant(mid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.remote_match_players p
    where p.match_id = mid and p.user_id = auth.uid()
  );
$$;

revoke all on function public.is_remote_match_participant(uuid) from public;
grant execute on function public.is_remote_match_participant(uuid) to authenticated;

alter table public.remote_matches enable row level security;
alter table public.remote_match_players enable row level security;
alter table public.remote_match_answers enable row level security;

-- remote_matches: deltagare läser. INGEN insert/update/delete-policy —
-- all skrivning via RPC:er (definer).
create policy "participants read remote matches"
  on public.remote_matches for select
  to authenticated
  using (public.is_remote_match_participant(id));

-- remote_match_players: deltagare läser BÅDA raderna (motståndarens
-- summary behövs för resultatvyn). Ingen skrivpolicy — RPC-only.
create policy "participants read remote match players"
  on public.remote_match_players for select
  to authenticated
  using (public.is_remote_match_participant(match_id));

-- remote_match_answers: enbart EGNA rader (motståndarens per-fråga-facit
-- ska inte gå att snoka mitt i matchen). Insert + update för upsert.
create policy "players read own remote answers"
  on public.remote_match_answers for select
  to authenticated
  using (user_id = auth.uid());

create policy "players insert own remote answers"
  on public.remote_match_answers for insert
  to authenticated
  with check (user_id = auth.uid() and public.is_remote_match_participant(match_id));

create policy "players update own remote answers"
  on public.remote_match_answers for update
  to authenticated
  using (user_id = auth.uid());

-- ── DEL 4 ── RPC:er ───────────────────────────────────────────────────

-- Skapar match + exakt 2 spelarrader atomiskt. Anropas av host vid
-- Start Game. players-jsonb: array av
--   { "user_id": uuid, "player_name": text, "is_host": bool,
--     "player_type": "registered"|"guest", "assistance": text, "age": int }
create or replace function public.create_remote_match(
  p_room_code text,
  p_settings jsonb,
  p_players jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  new_id uuid;
  pl jsonb;
  host_count int := 0;
begin
  if caller is null then
    raise exception 'remote match: no authenticated caller' using errcode = 'P0001';
  end if;
  if jsonb_array_length(p_players) <> 2 then
    raise exception 'remote match requires exactly 2 players' using errcode = 'P0001';
  end if;
  -- Caller måste vara host-raden i players-payloaden (motståndare kan
  -- inte skapa matchen åt host).
  if not exists (
    select 1 from jsonb_array_elements(p_players) e
    where (e->>'user_id')::uuid = caller and (e->>'is_host')::boolean = true
  ) then
    raise exception 'caller must be the match host' using errcode = 'P0001';
  end if;

  insert into public.remote_matches (
    room_code, rounds_count, answer_response_seconds, era_from, era_to,
    youtube_enabled_categories, images_enabled_categories, selected_extra_packages
  ) values (
    p_room_code,
    coalesce((p_settings->>'rounds_count')::int, 4),
    coalesce((p_settings->>'answer_response_seconds')::int, 30),
    (p_settings->>'era_from')::int,
    (p_settings->>'era_to')::int,
    coalesce((select array_agg(x) from jsonb_array_elements_text(p_settings->'youtube_enabled_categories') x),
             array['Music','Film','Sport']::text[]),
    coalesce((select array_agg(x) from jsonb_array_elements_text(p_settings->'images_enabled_categories') x),
             array['Music','Film','Sport']::text[]),
    coalesce((select array_agg(x) from jsonb_array_elements_text(p_settings->'selected_extra_packages') x),
             array[]::text[])
  ) returning id into new_id;

  for pl in select * from jsonb_array_elements(p_players) loop
    if (pl->>'user_id') is null then
      raise exception 'remote match player missing user_id' using errcode = 'P0001';
    end if;
    if (pl->>'is_host')::boolean then
      host_count := host_count + 1;
    end if;
    insert into public.remote_match_players (
      match_id, user_id, player_name, is_host, player_type, assistance, age
    ) values (
      new_id,
      (pl->>'user_id')::uuid,
      coalesce(pl->>'player_name', 'Player'),
      coalesce((pl->>'is_host')::boolean, false),
      coalesce(pl->>'player_type', 'guest'),
      pl->>'assistance',
      (pl->>'age')::int
    );
  end loop;

  if host_count <> 1 then
    raise exception 'remote match requires exactly 1 host' using errcode = 'P0001';
  end if;

  return new_id;
end;
$$;

revoke all on function public.create_remote_match(text, jsonb, jsonb) from public;
grant execute on function public.create_remote_match(text, jsonb, jsonb) to authenticated;

-- Persisterar frågesekvensen EN gång (host:s quiz-mount). Guard på
-- question_ids IS NULL — en host-resume med ny lokal shuffle kan aldrig
-- skriva över den auktoritativa sekvensen.
create or replace function public.set_remote_match_questions(
  p_match_id uuid,
  p_question_ids jsonb
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  updated int;
begin
  if caller is null or not public.is_remote_match_participant(p_match_id) then
    raise exception 'not a participant of this match' using errcode = 'P0001';
  end if;
  if jsonb_typeof(p_question_ids) <> 'array'
     or jsonb_array_length(p_question_ids) < 1
     or jsonb_array_length(p_question_ids) > 100 then
    raise exception 'invalid question_ids payload' using errcode = 'P0001';
  end if;

  update public.remote_matches
  set question_ids = p_question_ids
  where id = p_match_id and question_ids is null;

  get diagnostics updated = row_count;
  return updated > 0;   -- false = redan satt (förlorad race är OK)
end;
$$;

revoke all on function public.set_remote_match_questions(uuid, jsonb) from public;
grant execute on function public.set_remote_match_questions(uuid, jsonb) to authenticated;

-- Intern vinnar-helper (anropas av finalize + deadline-sweep, ALDRIG
-- exponerad mot klient). Förutsätter att callern håller radlås på
-- matchen. Tiebreak speglar klientens leaderboard-sort:
-- pts desc → avg response asc → draw.
create or replace function public._compute_remote_match_winner(mid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  p1 record;
  p2 record;
  w uuid;
  res text;
begin
  select * into p1 from public.remote_match_players
    where match_id = mid order by user_id limit 1;
  select * into p2 from public.remote_match_players
    where match_id = mid order by user_id desc limit 1;

  if p1.total_points > p2.total_points then
    w := p1.user_id; res := 'decided';
  elsif p2.total_points > p1.total_points then
    w := p2.user_id; res := 'decided';
  elsif coalesce(p1.avg_response_seconds, 9999) < coalesce(p2.avg_response_seconds, 9999) then
    w := p1.user_id; res := 'decided';
  elsif coalesce(p2.avg_response_seconds, 9999) < coalesce(p1.avg_response_seconds, 9999) then
    w := p2.user_id; res := 'decided';
  else
    w := null; res := 'draw';
  end if;

  update public.remote_matches
  set status = 'finished', result = res, winner_user_id = w, finished_at = now()
  where id = mid;
end;
$$;

revoke all on function public._compute_remote_match_winner(uuid) from public;

-- Finaliserar CALLERNS spelarrad. När båda spelare är klara beräknas
-- vinnaren atomiskt (radlåset på remote_matches serialiserar två
-- nära-samtidiga finalizers).
create or replace function public.finalize_remote_match_player(
  p_match_id uuid,
  p_total_points int,
  p_correct_answers int,
  p_avg_response_seconds numeric
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  m record;
  both_done boolean;
begin
  if caller is null then
    raise exception 'no authenticated caller' using errcode = 'P0001';
  end if;

  -- Radlås serialiserar konkurrenta finalizers på samma match.
  select * into m from public.remote_matches where id = p_match_id for update;
  if not found then
    raise exception 'match not found' using errcode = 'P0001';
  end if;
  if m.status <> 'active' then
    return;   -- redan avgjord (walkover-sweep hann före) — no-op
  end if;

  update public.remote_match_players
  set finished_at = coalesce(finished_at, now()),
      total_points = greatest(0, least(coalesce(p_total_points, 0), 100)),
      correct_answers = greatest(0, least(coalesce(p_correct_answers, 0), 100)),
      avg_response_seconds = p_avg_response_seconds
  where match_id = p_match_id and user_id = caller;

  if not found then
    raise exception 'not a participant of this match' using errcode = 'P0001';
  end if;

  select bool_and(finished_at is not null) into both_done
  from public.remote_match_players where match_id = p_match_id;

  if both_done then
    perform public._compute_remote_match_winner(p_match_id);
  end if;
end;
$$;

revoke all on function public.finalize_remote_match_player(uuid, int, int, numeric) from public;
grant execute on function public.finalize_remote_match_player(uuid, int, int, numeric) to authenticated;

-- ── DEL 5 ── Realtime ─────────────────────────────────────────────────
-- Driver "My 1v1 Matches"-listans live-uppdatering + "opponent finished"
-- på slutskärmen. RLS (participant-SELECT) gäller även för postgres_changes.
alter publication supabase_realtime add table public.remote_matches;

-- ── DEL 6 ── pg_cron ──────────────────────────────────────────────────
-- pg_cron är redan aktiverad (0006). Idempotent unschedule-mönster.

-- Deadline-sweep: active-matcher vars deadline passerat →
--   1 spelare klar  → expired_walkover + den spelaren vinner
--   0 spelare klara → void
--   (2 klara ska inte kunna vara active — finalize sätter finished —
--    men defensivt körs vinnarberäkningen även där.)
create or replace function public.sweep_remote_match_deadlines()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  m record;
  done_count int;
  the_winner uuid;
begin
  for m in
    select id from public.remote_matches
    where status = 'active' and deadline_at < now()
    for update skip locked
  loop
    select count(*) filter (where finished_at is not null) into done_count
    from public.remote_match_players where match_id = m.id;

    if done_count = 2 then
      perform public._compute_remote_match_winner(m.id);
    elsif done_count = 1 then
      select user_id into the_winner from public.remote_match_players
      where match_id = m.id and finished_at is not null limit 1;
      update public.remote_matches
      set status = 'expired_walkover', result = 'walkover',
          winner_user_id = the_winner, finished_at = now()
      where id = m.id;
    else
      update public.remote_matches
      set status = 'void', result = 'void', finished_at = now()
      where id = m.id;
    end if;
  end loop;
end;
$$;

revoke all on function public.sweep_remote_match_deadlines() from public;

do $$
begin
  perform cron.unschedule('remote-1v1-deadline-sweep');
exception when others then
  null;
end
$$;

select cron.schedule(
  'remote-1v1-deadline-sweep',
  '15 * * * *',
  $$select public.sweep_remote_match_deadlines()$$
);

-- Guest-retention: matcher där INGEN deltagare är registrerad raderas
-- 24h efter avslut (kravet "gäster behåller ingen historik"). Matcher
-- med minst en registrerad deltagare behålls för head-to-head-historik.
do $$
begin
  perform cron.unschedule('remote-1v1-guest-cleanup');
exception when others then
  null;
end
$$;

select cron.schedule(
  'remote-1v1-guest-cleanup',
  '30 3 * * *',
  $$delete from public.remote_matches m
    where m.status <> 'active'
      and m.finished_at < now() - interval '24 hours'
      and not exists (
        select 1 from public.remote_match_players p
        where p.match_id = m.id and p.player_type = 'registered'
      )$$
);

-- ── DEL 7 ── waiting_invites: sender-läsning ──────────────────────────
-- SELECT-RLS är recipient-only (0010) — hosten kan inte räkna sina egna
-- utestående invites, vilket max-4-obesvarade-1v1-invites-regeln kräver.
-- from_user_id sätts trusted server-side sedan 0024.
create policy "sender reads own invites"
  on public.waiting_invites for select
  to authenticated
  using (from_user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────
-- 0066_hybrid_turn_results — Multiplayer v2 Step 4 (hybrid 1 by 1)
-- Applied via Supabase SQL Editor (manuell körning). STAGING first; PROD
-- only after the App Store review is approved. Requires 0062.
--
-- The host's accepted result per question in a hybrid 1 by 1 game.
-- Realtime broadcasts carry no verified sender, so a "host decided" flag on
-- a broadcast could be forged by any participant. This table is the
-- server-verified record instead:
--   • record_turn_result — HOST ONLY (rooms.host_user_id = auth.uid()) and
--     v2 rooms only. `on conflict do nothing`: the first accepted result is
--     final, a late answer can never overwrite it.
--   • get_turn_results — the host or a lobby member (own lobby_players row).
-- Every device rebuilds its final results from these rows before saving
-- HCP progression or Player history, so all devices converge.
--
-- New table only; nothing existing changes. Legacy rooms never write here.
-- ─────────────────────────────────────────────────────────────────────

create table if not exists public.lobby_turn_results (
  room_code        text not null references public.rooms(code) on delete cascade,
  question_index   int  not null check (question_index >= 0 and question_index < 1000),
  player_id        text not null,
  points           int  not null default 0,
  correct          boolean not null default false,
  time_used        double precision not null default 0,
  answer           text,
  connection_error boolean not null default false,
  recorded_at      timestamptz not null default now(),
  primary key (room_code, question_index)
);
alter table public.lobby_turn_results enable row level security;
revoke all on public.lobby_turn_results from anon, authenticated;

create or replace function public.record_turn_result(
  p_room_code text,
  p_question_index int,
  p_player_id text,
  p_points int,
  p_correct boolean,
  p_time_used double precision,
  p_answer text,
  p_connection_error boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(p_room_code);
  v_room public.rooms%rowtype;
  v_row public.lobby_turn_results%rowtype;
begin
  select * into v_room from public.rooms where code = v_code;
  if not found then
    raise exception 'qv_turn_rejected:room_not_found';
  end if;
  if v_room.host_user_id is distinct from auth.uid() then
    raise exception 'qv_turn_rejected:not_host';
  end if;
  if not coalesce(v_room.multiplayer_v2, false) then
    raise exception 'qv_turn_rejected:not_v2';
  end if;

  insert into public.lobby_turn_results
    (room_code, question_index, player_id, points, correct, time_used, answer, connection_error)
  values
    (v_code, p_question_index, p_player_id, coalesce(p_points, 0), coalesce(p_correct, false),
     coalesce(p_time_used, 0), p_answer, coalesce(p_connection_error, false))
  on conflict (room_code, question_index) do nothing;

  -- Return the stored (first, final) row so the host can see what won.
  select * into v_row from public.lobby_turn_results
  where room_code = v_code and question_index = p_question_index;
  return to_jsonb(v_row);
end;
$$;

create or replace function public.get_turn_results(p_room_code text)
returns setof public.lobby_turn_results
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_code text := upper(p_room_code);
begin
  if not (
    exists (select 1 from public.rooms where code = v_code and host_user_id = auth.uid())
    or public.is_lobby_member(v_code)
  ) then
    raise exception 'qv_turn_rejected:not_member';
  end if;
  return query
    select * from public.lobby_turn_results
    where room_code = v_code
    order by question_index;
end;
$$;

revoke execute on function public.record_turn_result(text, int, text, int, boolean, double precision, text, boolean) from public, anon;
revoke execute on function public.get_turn_results(text) from public, anon;
grant execute on function public.record_turn_result(text, int, text, int, boolean, double precision, text, boolean) to authenticated;
grant execute on function public.get_turn_results(text) to authenticated;

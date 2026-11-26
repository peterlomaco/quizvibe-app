-- ─────────────────────────────────────────────────────────────────────────
-- 0070_v2_join_requires_device_client — staging verification, SQL part.
--
-- STAGING ONLY. Never run against PROD. Requires 0062–0068 + 0070 applied.
--
-- Paste the WHOLE file into the SQL Editor and run it once. Everything runs
-- in one transaction that is ROLLED BACK on purpose: the script ends by
-- raising an error whose message is the report, e.g.
--   ERROR: QVT_0070_REPORT ... N passed, M failed
-- No users, rooms or rows are kept.
--
-- "Build 40" writes = own-row INSERT/upsert WITHOUT device_mode (exactly what
-- b6d08cc's upsertOwnLobbyPlayer sends). "Build 41" writes carry device_mode.
-- The OTA'd Build 40 sends the same rows as plain Build 40 (the OTA only adds
-- the client-side update gate), so one case covers both.
-- ─────────────────────────────────────────────────────────────────────────

drop table if exists pg_temp.qvt_results;
create temp table qvt_results (n serial, ok boolean, name text, detail text);

create or replace function pg_temp.qvt_ok(p_name text, p_ok boolean, p_detail text)
returns void language sql as $f$
  insert into pg_temp.qvt_results (ok, name, detail) values (coalesce(p_ok, false), p_name, p_detail);
$f$;

create or replace function pg_temp.qvt_expect_err(p_name text, p_err text, p_match text default null)
returns void language sql as $f$
  select pg_temp.qvt_ok(
    p_name,
    p_err is not null and (p_match is null or p_err ~* p_match),
    coalesce('rejected: ' || p_err, 'expected an error, got success'));
$f$;

create or replace function pg_temp.qvt_expect_ok(p_name text, p_err text)
returns void language sql as $f$
  select pg_temp.qvt_ok(p_name, p_err is null, coalesce('unexpected error: ' || p_err, 'ok'));
$f$;

create or replace function pg_temp.qvt_as(p_uid uuid, p_anon boolean)
returns void language plpgsql as $f$
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', p_uid, 'role', 'authenticated', 'is_anonymous', p_anon)::text, true);
  perform set_config('request.jwt.claim.sub', p_uid::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  execute 'set local role authenticated';
end $f$;

create or replace function pg_temp.qvt_admin()
returns void language plpgsql as $f$
begin
  execute 'reset role';
  perform set_config('request.jwt.claims', '', true);
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claim.role', '', true);
end $f$;

create or replace function pg_temp.qvt_exec(p_uid uuid, p_anon boolean, p_sql text)
returns text language plpgsql as $f$
declare v_err text;
begin
  begin
    perform pg_temp.qvt_as(p_uid, p_anon);
    execute p_sql;
    execute 'reset role';
  exception when others then
    get stacked diagnostics v_err = message_text;
  end;
  perform pg_temp.qvt_admin();
  return v_err;
end $f$;

create or replace function pg_temp.qvt_user(p_label text, p_anon boolean, p_sfx text)
returns uuid language plpgsql as $f$
declare v_id uuid := gen_random_uuid();
        v_email text := case when p_anon then null
                             else 'qvt-' || lower(p_label) || '-' || p_sfx || '@test.invalid' end;
begin
  insert into auth.users (id, instance_id, aud, role, email, is_anonymous,
                          raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values (v_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
          v_email, p_anon, '{}'::jsonb, '{}'::jsonb, now(), now());
  if not p_anon then
    insert into public.profiles (id, email, player_name) values (v_id, v_email, p_label || '-' || p_sfx);
  end if;
  return v_id;
end $f$;

-- Own-row join as a client: INSERT … ON CONFLICT like upsertOwnLobbyPlayer.
-- p_device null = Build 40 payload (no device_mode column at all).
create or replace function pg_temp.qvt_join(p_uid uuid, p_anon boolean, p_code text, p_pid text, p_device text)
returns text language plpgsql as $f$
begin
  if p_device is null then
    return pg_temp.qvt_exec(p_uid, p_anon, format($q$
      insert into public.lobby_players (room_code, player_id, user_id, name, type, is_host, approved, has_left)
      values (%L, %L, %L, 'Tester', %L, false, false, false)
      on conflict (room_code, player_id) do update
        set user_id = excluded.user_id, name = excluded.name, has_left = excluded.has_left$q$,
      p_code, p_pid, p_uid, case when p_anon then 'guest' else 'registered' end));
  end if;
  return pg_temp.qvt_exec(p_uid, p_anon, format($q$
    insert into public.lobby_players (room_code, player_id, user_id, name, type, is_host, approved, has_left, device_mode)
    values (%L, %L, %L, 'Tester', %L, false, false, false, %L)
    on conflict (room_code, player_id) do update
      set user_id = excluded.user_id, name = excluded.name, has_left = excluded.has_left,
          device_mode = excluded.device_mode$q$,
    p_code, p_pid, p_uid, case when p_anon then 'guest' else 'registered' end, p_device));
end $f$;

do $$
declare
  s text := lpad((floor(random() * 9000000) + 1000000)::int::text, 7, '0');
  A uuid; B uuid; C uuid; G uuid; H uuid;
  et text; okb boolean; v_order text[]; report text; npass int; nfail int;
begin
  perform pg_temp.qvt_admin();

  A := pg_temp.qvt_user('Qvthost', false, s);   -- host (Build 41)
  B := pg_temp.qvt_user('Qvtregb', false, s);   -- registered player
  C := pg_temp.qvt_user('Qvtanon', true,  s);   -- guest (anon session)
  G := pg_temp.qvt_user('Qvtregg', false, s);   -- second registered player
  H := pg_temp.qvt_user('Qvtregh', false, s);   -- carry-over seat owner

  insert into public.rooms (code, host_user_id, host_player_name, multiplayer_v2, max_players)
  values ('QVTV01', A, 'Host', true, 12),          -- v2 room (Build 41 host)
         ('QVTL01', A, 'Host', false, 12);         -- legacy room
  insert into public.rooms (code, host_user_id, host_player_name, multiplayer_v2, max_players,
                            rematch_locked, rematch_player_ids)
  values ('QVTR01', A, 'Host', true, 12, true, array['comp-' || H::text]);  -- v2 re-match

  insert into public.lobby_players (room_code, player_id, user_id, name, type, is_host, approved, device_mode)
  values ('QVTV01', '1', A, 'Host', 'registered', true, true, 'own'),
         ('QVTL01', '1', A, 'Host', 'registered', true, true, null),
         ('QVTR01', '1', A, 'Host', 'registered', true, true, 'own');

  -- ═════ v2 room: fresh joins ═════
  et := pg_temp.qvt_join(B, false, 'QVTV01', 'joiner-b40', null);
  perform pg_temp.qvt_expect_err('V2-1 Build 40 registered join (no device) → update_required', et, 'update_required');

  et := pg_temp.qvt_join(C, true, 'QVTV01', 'guest-c40', null);
  perform pg_temp.qvt_expect_err('V2-2 Build 40 guest join (no device) → update_required', et, 'update_required');

  et := pg_temp.qvt_join(B, false, 'QVTV01', 'joiner-b41', 'own');
  perform pg_temp.qvt_expect_ok('V2-3 Build 41 registered join (own device)', et);

  et := pg_temp.qvt_join(C, true, 'QVTV01', 'guest-c41', 'own');
  perform pg_temp.qvt_expect_ok('V2-4 Build 41 guest join (own device)', et);

  et := pg_temp.qvt_join(G, false, 'QVTV01', 'joiner-g41', 'host');
  perform pg_temp.qvt_expect_ok('V2-5 Build 41 registered join (host device)', et);

  -- ═════ v2 room: later own-row writes on a live row ═════
  et := pg_temp.qvt_join(B, false, 'QVTV01', 'joiner-b41', null);
  perform pg_temp.qvt_expect_ok('V2-6 re-upsert of a live row without device (no join transition)', et);

  et := pg_temp.qvt_exec(B, false, $q$update public.lobby_players set hcp = 80 where room_code='QVTV01' and player_id='joiner-b41'$q$);
  perform pg_temp.qvt_expect_ok('V2-7 own HCP publish on a v2 row', et);

  et := pg_temp.qvt_exec(B, false, $q$update public.lobby_players set has_left = true where room_code='QVTV01' and player_id='joiner-b41'$q$);
  perform pg_temp.qvt_expect_ok('V2-8 Leave (has_left → true)', et);

  -- ═════ v2 room: rejoin ═════
  et := pg_temp.qvt_join(B, false, 'QVTV01', 'joiner-b41', 'own');
  perform pg_temp.qvt_expect_ok('V2-9 Build 41 rejoin after Leave (device written)', et);

  -- A left row without a device (e.g. written before 0063/0067) rejoined by Build 40.
  insert into public.lobby_players (room_code, player_id, user_id, name, type, is_host, approved, has_left, device_mode)
  values ('QVTV01', 'joiner-g-old', G, 'Tester', 'registered', false, false, true, null);
  et := pg_temp.qvt_join(G, false, 'QVTV01', 'joiner-g-old', null);
  perform pg_temp.qvt_expect_err('V2-10 Build 40 rejoin of a device-less left row → update_required', et, 'update_required');

  -- ═════ host writes ═════
  et := pg_temp.qvt_exec(A, false, $q$
    insert into public.lobby_players (room_code, player_id, user_id, name, type, is_host, approved)
    values ('QVTV01', 'guest-added', null, 'Tester', 'guest', false, true)$q$);
  perform pg_temp.qvt_expect_ok('V2-11 host adds a host-device guest (user_id null)', et);

  et := pg_temp.qvt_exec(A, false, $q$
    insert into public.lobby_players (room_code, player_id, user_id, name, type, is_host, approved)
    values ('QVTV01', '1', null, 'Host', 'registered', true, true)
    on conflict (room_code, player_id) do update set name = excluded.name$q$);
  perform pg_temp.qvt_expect_ok('V2-12 host bulk upsert of own host row', et);

  -- ═════ v2 re-match carry-over (Build 41) ═════
  insert into public.lobby_players (room_code, player_id, user_id, name, type, is_host, approved)
  values ('QVTR01', 'comp-' || H::text, null, 'Tester', 'registered', false, true);   -- host pre-seed
  et := pg_temp.qvt_exec(H, false, format($q$select public.claim_carry_over_row('QVTR01', %L)$q$, 'comp-' || H::text));
  perform pg_temp.qvt_expect_ok('RM-1 Build 41 carry-over claim (no device in the claim)', et);
  et := pg_temp.qvt_join(H, false, 'QVTR01', 'comp-' || H::text, 'own');
  perform pg_temp.qvt_expect_ok('RM-2 Build 41 carry-over follow-up upsert (device written)', et);
  select user_id = H into okb from public.lobby_players where room_code='QVTR01' and player_id='comp-' || H::text;
  perform pg_temp.qvt_ok('RM-3 seat is bound to its owner', coalesce(okb, false), coalesce(okb::text, 'row missing'));

  -- ═════ legacy room: unchanged ═════
  et := pg_temp.qvt_join(B, false, 'QVTL01', 'joiner-bl', null);
  perform pg_temp.qvt_expect_ok('L-1 Build 40 registered join into a legacy room', et);
  et := pg_temp.qvt_join(C, true, 'QVTL01', 'guest-cl', null);
  perform pg_temp.qvt_expect_ok('L-2 Build 40 guest join into a legacy room', et);
  et := pg_temp.qvt_exec(B, false, $q$update public.lobby_players set has_left = true where room_code='QVTL01' and player_id='joiner-bl'$q$);
  if et is null then
    et := pg_temp.qvt_join(B, false, 'QVTL01', 'joiner-bl', null);
  end if;
  perform pg_temp.qvt_expect_ok('L-3 Build 40 leave + rejoin in a legacy room', et);

  -- ═════ trigger order ═════
  select array_agg(tgname::text order by tgname) into v_order
  from pg_trigger where tgrelid = 'public.lobby_players'::regclass and not tgisinternal
    and tgname in ('enforce_lobby_join_eligibility', 'enforce_v2_join_client');
  perform pg_temp.qvt_ok('T-1 enforce_v2_join_client fires after enforce_lobby_join_eligibility',
    v_order = array['enforce_lobby_join_eligibility', 'enforce_v2_join_client'], coalesce(v_order::text, 'missing'));

  -- ── report + rollback ──
  select count(*) filter (where qvt_results.ok), count(*) filter (where not qvt_results.ok) into npass, nfail from pg_temp.qvt_results;
  select string_agg((case when qvt_results.ok then 'PASS  ' else 'FAIL  ' end) || name
                    || case when qvt_results.ok then '' else '  ->  ' || coalesce(detail, '') end, E'\n' order by qvt_results.n)
    into report from pg_temp.qvt_results;
  raise exception E'QVT_0070_REPORT (rolled back on purpose, nothing kept)\n%\n\n% passed, % failed', report, npass, nfail;
end $$;

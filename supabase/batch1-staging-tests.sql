-- ─────────────────────────────────────────────────────────────────────
-- Batch 1 (0068_security_guards) — staging verification, SQL part.
--
-- STAGING ONLY. Never run against PROD.
--
-- Paste the WHOLE file into the SQL Editor and run it once.
-- Everything happens inside one transaction that is ROLLED BACK on
-- purpose at the end: the script finishes by raising an error whose
-- message is the test report. So the result panel shows
--   ERROR: QVT_BATCH1_REPORT ... N passed, M failed
-- That "error" is expected. No users, rooms, rows or reports are kept.
--
-- Test users are inserted into auth.users and impersonated by setting
-- request.jwt.claims + SET LOCAL ROLE (authenticated / anon /
-- service_role), so RLS and the 0068 triggers run exactly as they do
-- for real app requests.
-- ─────────────────────────────────────────────────────────────────────

-- ── helpers (temporary, vanish with the session) ─────────────────────
drop table if exists pg_temp.qvt_results;
create temp table qvt_results (n serial, ok boolean, name text, detail text);

create or replace function pg_temp.qvt_ok(p_name text, p_ok boolean, p_detail text)
returns void language sql as $f$
  insert into pg_temp.qvt_results (ok, name, detail) values (coalesce(p_ok, false), p_name, p_detail);
$f$;

-- Expect an error (optionally matching a regex).
create or replace function pg_temp.qvt_expect_err(p_name text, p_err text, p_match text default null)
returns void language sql as $f$
  select pg_temp.qvt_ok(
    p_name,
    p_err is not null and (p_match is null or p_err ~* p_match),
    coalesce('rejected: ' || p_err, 'expected an error, got success'));
$f$;

-- Switch to a client identity. p_uid null = no session (role anon).
create or replace function pg_temp.qvt_as(p_uid uuid, p_anon boolean)
returns void language plpgsql as $f$
begin
  if p_uid is null then
    perform set_config('request.jwt.claims', '{"role":"anon"}', true);
    perform set_config('request.jwt.claim.sub', '', true);
    perform set_config('request.jwt.claim.role', 'anon', true);
    execute 'set local role anon';
  else
    perform set_config('request.jwt.claims',
      json_build_object('sub', p_uid, 'role', 'authenticated', 'is_anonymous', p_anon)::text, true);
    perform set_config('request.jwt.claim.sub', p_uid::text, true);
    perform set_config('request.jwt.claim.role', 'authenticated', true);
    execute 'set local role authenticated';
  end if;
end $f$;

create or replace function pg_temp.qvt_admin()
returns void language plpgsql as $f$
begin
  execute 'reset role';
  perform set_config('request.jwt.claims', '', true);
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claim.role', '', true);
end $f$;

-- Run a statement as a client. Returns null on success, else the error text.
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

-- Run a single-value query as a client. err is null on success.
create or replace function pg_temp.qvt_val(p_uid uuid, p_anon boolean, p_sql text,
  out err text, out val text)
language plpgsql as $f$
begin
  begin
    perform pg_temp.qvt_as(p_uid, p_anon);
    execute p_sql into val;
    execute 'reset role';
  exception when others then
    get stacked diagnostics err = message_text;
  end;
  perform pg_temp.qvt_admin();
end $f$;

-- Same, but as service_role (the Edge Function's role).
create or replace function pg_temp.qvt_service_val(p_sql text, out err text, out val text)
language plpgsql as $f$
begin
  begin
    perform set_config('request.jwt.claims', '{"role":"service_role"}', true);
    execute 'set local role service_role';
    execute p_sql into val;
    execute 'reset role';
  exception when others then
    get stacked diagnostics err = message_text;
  end;
  perform pg_temp.qvt_admin();
end $f$;

create or replace function pg_temp.qvt_user(p_label text, p_anon boolean, p_profile boolean, p_sfx text)
returns uuid language plpgsql as $f$
declare v_id uuid := gen_random_uuid();
        v_email text := case when p_anon then null
                             else 'qvt-' || lower(p_label) || '-' || p_sfx || '@test.invalid' end;
begin
  insert into auth.users (id, instance_id, aud, role, email, is_anonymous,
                          raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values (v_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
          v_email, p_anon, '{}'::jsonb, '{}'::jsonb, now(), now());
  if p_profile and not p_anon then
    insert into public.profiles (id, email, player_name) values (v_id, v_email, p_label || '-' || p_sfx);
  end if;
  return v_id;
end $f$;

create or replace function pg_temp.qvt_lp(p_code text, p_pid text, p_uid uuid,
  p_approved boolean default false, p_host boolean default false, p_type text default 'registered')
returns void language sql as $f$
  insert into public.lobby_players (room_code, player_id, user_id, name, type, is_host, approved)
  values (p_code, p_pid, p_uid, 'Tester', p_type, p_host, p_approved);
$f$;

create or replace function pg_temp.qvt_row(p_code text, p_pid text)
returns public.lobby_players language sql as $f$
  select * from public.lobby_players where room_code = p_code and player_id = p_pid;
$f$;

-- ── tests ────────────────────────────────────────────────────────────
do $$
declare
  s text := lpad((floor(random() * 9000000) + 1000000)::int::text, 7, '0');
  A uuid; B uuid; D uuid; E uuid; C uuid; C2 uuid; F uuid; G uuid; N uuid;
  et text; rv record; r public.lobby_players; r2 public.lobby_players;
  okb boolean; has_v2 boolean; has_vouchers boolean; report text; npass int; nfail int;
begin
  perform pg_temp.qvt_admin();

  A  := pg_temp.qvt_user('Qvthosta', false, true, s);
  B  := pg_temp.qvt_user('Qvtplayb', false, true, s);
  D  := pg_temp.qvt_user('Qvtplayd', false, true, s);
  E  := pg_temp.qvt_user('Qvtoutse', false, true, s);
  C  := pg_temp.qvt_user('Qvtanon',  true,  false, s);
  F  := pg_temp.qvt_user('Qvtother', false, true, s);

  select exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'rooms' and column_name = 'multiplayer_v2')
    into has_v2;

  -- ═════ 1A: own-row guard ═════
  insert into public.rooms (code, host_user_id, host_player_name) values ('QVTA01', A, 'Host'), ('QVTB01', A, 'Host');
  perform pg_temp.qvt_lp('QVTA01', '1', A, true, true);
  perform pg_temp.qvt_lp('QVTA01', 'joiner-b', B, false);

  et := pg_temp.qvt_exec(B, false, $q$update public.lobby_players set room_code='QVTB01' where room_code='QVTA01' and player_id='joiner-b'$q$);
  perform pg_temp.qvt_expect_err('1A-1 B moves own row to another room', et, 'immutable_column');

  et := pg_temp.qvt_exec(B, false, $q$update public.lobby_players set is_host=true where room_code='QVTA01' and player_id='joiner-b'$q$);
  r := pg_temp.qvt_row('QVTA01', 'joiner-b');
  perform pg_temp.qvt_ok('1A-2 B sets is_host=true -> kept false', et is null and r.is_host = false, coalesce(et, 'is_host=' || r.is_host));

  et := pg_temp.qvt_exec(B, false, $q$update public.lobby_players set approved=true where room_code='QVTA01' and player_id='joiner-b'$q$);
  r := pg_temp.qvt_row('QVTA01', 'joiner-b');
  perform pg_temp.qvt_ok('1A-3 B self-approves -> stays unapproved', et is null and r.approved = false, coalesce(et, 'approved=' || r.approved));

  et := pg_temp.qvt_exec(B, false, format($q$update public.lobby_players set user_id=%L where room_code='QVTA01' and player_id='joiner-b'$q$, A));
  perform pg_temp.qvt_expect_err('1A-6 B sets user_id to A', et);

  rv := pg_temp.qvt_val(B, false, $q$with x as (update public.lobby_players set user_id=null where room_code='QVTA01' and player_id='joiner-b' returning 1) select count(*) from x$q$);
  perform pg_temp.qvt_ok('1A-12a B detaches own row (user_id=null) -> blocked', rv.err is not null or rv.val = '0', coalesce('rejected: ' || rv.err, 'rows=' || rv.val));

  et := pg_temp.qvt_exec(B, false, format($q$insert into public.lobby_players (room_code, player_id, user_id, name, type, approved)
       values ('QVTA01','joiner-b',%L,'Tester','registered',true)
       on conflict (room_code, player_id) do update set approved=excluded.approved, name=excluded.name, user_id=excluded.user_id$q$, B));
  r := pg_temp.qvt_row('QVTA01', 'joiner-b');
  perform pg_temp.qvt_ok('1A-upsert B rejoin upsert approved=true -> stays false', et is null and r.approved = false, coalesce(et, 'approved=' || r.approved));

  et := pg_temp.qvt_exec(B, false, format($q$insert into public.lobby_players (room_code, player_id, user_id, name, type, is_host)
       values ('QVTA01','joiner-b',%L,'Tester','registered',true)
       on conflict (room_code, player_id) do update set is_host=excluded.is_host$q$, B));
  r := pg_temp.qvt_row('QVTA01', 'joiner-b');
  perform pg_temp.qvt_ok('1A-upsert-b B upsert with is_host=true -> rejected or kept false', et is not null or r.is_host = false, coalesce('rejected: ' || et, 'is_host=' || r.is_host));

  et := pg_temp.qvt_exec(C, true, format($q$insert into public.lobby_players (room_code, player_id, user_id, name, type, approved)
       values ('QVTA01','guest-c',%L,'Tester','guest',true)$q$, C));
  r := pg_temp.qvt_row('QVTA01', 'guest-c');
  perform pg_temp.qvt_ok('1A-4 anon C inserts own row approved=true -> stored false', et is null and r.approved = false, coalesce(et, 'approved=' || r.approved));

  et := pg_temp.qvt_exec(C, true, format($q$insert into public.lobby_players (room_code, player_id, user_id, name, type, is_host)
       values ('QVTA01','guest-c2',%L,'Tester','guest',true)$q$, C));
  perform pg_temp.qvt_expect_err('1A-5 anon C inserts own row is_host=true', et);

  et := pg_temp.qvt_exec(A, false, $q$update public.lobby_players set approved=true where room_code='QVTA01' and player_id='joiner-b'$q$);
  r := pg_temp.qvt_row('QVTA01', 'joiner-b');
  perform pg_temp.qvt_ok('1A-S1 host approves B', et is null and r.approved, coalesce(et, 'approved=' || r.approved));

  et := pg_temp.qvt_exec(B, false, format($q$insert into public.lobby_players (room_code, player_id, user_id, name, type, approved)
       values ('QVTA01','joiner-b',%L,'Tester','registered',true)
       on conflict (room_code, player_id) do update set approved=excluded.approved, user_id=excluded.user_id, name=excluded.name$q$, B));
  r := pg_temp.qvt_row('QVTA01', 'joiner-b');
  perform pg_temp.qvt_ok('1A-S4 B rejoin upsert keeps approval', et is null and r.approved, coalesce(et, 'approved=' || r.approved));

  et := pg_temp.qvt_exec(B, false, $q$update public.lobby_players set hcp=80, account_player_name='Tester', seen_question_ids='{"seen":[]}'::jsonb where room_code='QVTA01' and player_id='joiner-b'$q$);
  if et is null then
    et := pg_temp.qvt_exec(B, false, $q$update public.lobby_players set has_left=true where room_code='QVTA01' and player_id='joiner-b'$q$);
  end if;
  r := pg_temp.qvt_row('QVTA01', 'joiner-b');
  perform pg_temp.qvt_ok('1A-S3 B publishes hcp/account name/seen ids + leaves', et is null and r.has_left, coalesce(et, 'has_left=' || r.has_left));

  et := pg_temp.qvt_exec(B, false, $q$update public.lobby_players set has_left=false, approved=false where room_code='QVTA01' and player_id='joiner-b'$q$);
  r := pg_temp.qvt_row('QVTA01', 'joiner-b');
  perform pg_temp.qvt_ok('1A-S4b B rejoins and may downgrade own approval', et is null and not r.has_left and not r.approved, coalesce(et, 'state wrong'));

  et := pg_temp.qvt_exec(A, false, $q$insert into public.lobby_players (room_code, player_id, name, type, approved, turn_order)
       values ('QVTA01','joiner-b','Tester','registered',true,1)
       on conflict (room_code, player_id) do update set approved=excluded.approved, turn_order=excluded.turn_order$q$);
  r := pg_temp.qvt_row('QVTA01', 'joiner-b');
  perform pg_temp.qvt_ok('1A-S2 host bulk upsert of non-host rows', et is null and r.approved and r.user_id = B, coalesce(et, 'row changed wrongly'));

  perform pg_temp.qvt_lp('QVTA01', 'manual-x', null, true, false, 'manual');
  rv := pg_temp.qvt_val(C, true, $q$select public.claim_carry_over_row('QVTA01','manual-x')$q$);
  r := pg_temp.qvt_row('QVTA01', 'manual-x');
  perform pg_temp.qvt_ok('1A-7 anon claims host-added guest row -> false', rv.val = 'false' and r.user_id is null, coalesce(rv.err, rv.val));

  -- ═════ 1A-claim: re-match seats ═════
  insert into public.rooms (code, host_user_id, host_player_name) values ('QVTO01', A, 'Host');
  perform pg_temp.qvt_lp('QVTO01', '1', A, true, true);
  perform pg_temp.qvt_lp('QVTO01', 'joiner-b1', B, true);
  perform pg_temp.qvt_lp('QVTO01', 'joiner-d1', D, true);
  insert into public.rooms (code, host_user_id, host_player_name, rematch_locked, rematch_player_ids)
  values ('QVTN01', A, 'Host', true, array['1', 'joiner-b1', 'joiner-d1']);

  et := pg_temp.qvt_exec(A, false, format($q$insert into public.lobby_players (room_code, player_id, name, type, approved, is_host, user_id)
       values ('QVTN01','1','Tester','registered',true,true,%L)$q$, A));
  if et is null then
    et := pg_temp.qvt_exec(A, false, $q$insert into public.lobby_players (room_code, player_id, name, type, approved)
         values ('QVTN01','joiner-b1','Tester','registered',true), ('QVTN01','joiner-d1','Tester','registered',true)$q$);
  end if;
  r := pg_temp.qvt_row('QVTN01', 'joiner-b1'); r2 := pg_temp.qvt_row('QVTN01', 'joiner-d1');
  perform pg_temp.qvt_ok('1A-S5a host pre-seed binds reserved seats to owners',
    et is null and r.user_id = B and r2.user_id = D and r.approved and r2.approved, coalesce(et, 'b=' || coalesce(r.user_id::text,'null') || ' d=' || coalesce(r2.user_id::text,'null')));

  rv := pg_temp.qvt_val(D, false, $q$select public.claim_carry_over_row('QVTN01','joiner-b1')$q$);
  r := pg_temp.qvt_row('QVTN01', 'joiner-b1');
  perform pg_temp.qvt_ok('1A-9 cross-claim: D claims B''s seat -> false', rv.val = 'false' and r.user_id = B, coalesce(rv.err, rv.val));

  rv := pg_temp.qvt_val(D, false, $q$with x as (update public.lobby_players set name='Hijack' where room_code='QVTN01' and player_id='joiner-b1' returning 1) select count(*) from x$q$);
  perform pg_temp.qvt_ok('1A-9b D PATCHes B''s seat -> 0 rows', rv.err is not null or rv.val = '0', coalesce('rejected: ' || rv.err, 'rows=' || rv.val));

  rv := pg_temp.qvt_val(B, false, $q$select public.claim_carry_over_row('QVTN01','joiner-b1')$q$);
  et := pg_temp.qvt_exec(B, false, format($q$insert into public.lobby_players (room_code, player_id, user_id, name, type, approved)
       values ('QVTN01','joiner-b1',%L,'Tester','registered',true)
       on conflict (room_code, player_id) do update set approved=excluded.approved, user_id=excluded.user_id, name=excluded.name, has_left=false$q$, B));
  r := pg_temp.qvt_row('QVTN01', 'joiner-b1');
  perform pg_temp.qvt_ok('1A-S5b B joins own seat (claim false, upsert ok, approved)', rv.err is null and et is null and r.user_id = B and r.approved,
    coalesce(rv.err, et, 'state wrong'));

  insert into public.rooms (code, host_user_id, host_player_name, rematch_locked, rematch_player_ids)
  values ('QVTN02', A, 'Host', true, array['1', 'joiner-b1', 'joiner-d1']);
  perform pg_temp.qvt_lp('QVTN02', 'joiner-b1', null, true);
  perform pg_temp.qvt_lp('QVTN02', 'joiner-d1', null, true);

  rv := pg_temp.qvt_val(D, false, $q$select public.claim_carry_over_row('QVTN02','joiner-b1')$q$);
  perform pg_temp.qvt_ok('1A-9c unbound seat: D claims B''s seat -> false', rv.val = 'false', coalesce(rv.err, rv.val));
  rv := pg_temp.qvt_val(E, false, $q$select public.claim_carry_over_row('QVTN02','joiner-d1')$q$);
  perform pg_temp.qvt_ok('1A-8 outsider E claims a seat -> false', rv.val = 'false', coalesce(rv.err, rv.val));
  rv := pg_temp.qvt_val(B, false, $q$select public.claim_carry_over_row('QVTN02','joiner-b1')$q$);
  r := pg_temp.qvt_row('QVTN02', 'joiner-b1');
  perform pg_temp.qvt_ok('1A-S5c unbound seat: owner B claims own -> true', rv.val = 'true' and r.user_id = B, coalesce(rv.err, rv.val));
  rv := pg_temp.qvt_val(D, false, format($q$with x as (update public.lobby_players set user_id=%L where room_code='QVTN02' and player_id='joiner-d1' returning 1) select count(*) from x$q$, D));
  perform pg_temp.qvt_ok('1A-9d D sets user_id on unbound seat directly -> blocked', rv.err is not null or rv.val = '0', coalesce('rejected: ' || rv.err, 'rows=' || rv.val));

  -- several historical rooms with the same player_id
  insert into public.rooms (code, host_user_id, host_player_name) values ('QVTO02', A, 'Host');
  perform pg_temp.qvt_lp('QVTO02', 'joiner-b1', B, true);
  insert into public.rooms (code, host_user_id, host_player_name, rematch_locked, rematch_player_ids)
  values ('QVTN03', A, 'Host', true, array['joiner-b1']);
  et := pg_temp.qvt_exec(A, false, $q$insert into public.lobby_players (room_code, player_id, name, type, approved) values ('QVTN03','joiner-b1','Tester','registered',true)$q$);
  r := pg_temp.qvt_row('QVTN03', 'joiner-b1');
  perform pg_temp.qvt_ok('1A-H1 same player_id in several old rooms, same user -> bound', et is null and r.user_id = B, coalesce(et, 'user_id=' || coalesce(r.user_id::text, 'null')));

  insert into public.rooms (code, host_user_id, host_player_name) values ('QVTO03', A, 'Host');
  perform pg_temp.qvt_lp('QVTO03', 'joiner-b1', D, true);
  insert into public.rooms (code, host_user_id, host_player_name, rematch_locked, rematch_player_ids)
  values ('QVTN04', A, 'Host', true, array['joiner-b1']);
  et := pg_temp.qvt_exec(A, false, $q$insert into public.lobby_players (room_code, player_id, name, type, approved) values ('QVTN04','joiner-b1','Tester','registered',true)$q$);
  r := pg_temp.qvt_row('QVTN04', 'joiner-b1');
  perform pg_temp.qvt_ok('1A-H2 same player_id held by two users -> unbound (fail closed)', et is null and r.user_id is null, coalesce(et, 'user_id=' || coalesce(r.user_id::text, 'null')));
  rv := pg_temp.qvt_val(B, false, $q$select public.claim_carry_over_row('QVTN04','joiner-b1')$q$);
  perform pg_temp.qvt_ok('1A-H3 ambiguous seat: B cannot claim', rv.val = 'false', coalesce(rv.err, rv.val));
  rv := pg_temp.qvt_val(D, false, $q$select public.claim_carry_over_row('QVTN04','joiner-b1')$q$);
  perform pg_temp.qvt_ok('1A-H3b ambiguous seat: D cannot claim', rv.val = 'false', coalesce(rv.err, rv.val));

  insert into public.rooms (code, host_user_id, host_player_name) values ('QVTF01', F, 'Host');
  perform pg_temp.qvt_lp('QVTF01', 'joiner-z', E, true);
  insert into public.rooms (code, host_user_id, host_player_name, rematch_locked, rematch_player_ids)
  values ('QVTN05', A, 'Host', true, array['joiner-z']);
  et := pg_temp.qvt_exec(A, false, $q$insert into public.lobby_players (room_code, player_id, name, type, approved) values ('QVTN05','joiner-z','Tester','registered',true)$q$);
  r := pg_temp.qvt_row('QVTN05', 'joiner-z');
  perform pg_temp.qvt_ok('1A-H4 player_id from another host''s room is ignored', et is null and r.user_id is null, coalesce(et, 'user_id=' || coalesce(r.user_id::text, 'null')));

  insert into public.rooms (code, host_user_id, host_player_name, rematch_locked, rematch_player_ids)
  values ('QVTN06', A, 'Host', true, array['joiner-b1']);
  et := pg_temp.qvt_exec(A, false, $q$insert into public.lobby_players (room_code, player_id, name, type, approved) values ('QVTN06','joiner-d1','Tester','registered',true)$q$);
  r := pg_temp.qvt_row('QVTN06', 'joiner-d1');
  perform pg_temp.qvt_ok('1A-H5 id outside the line-up -> not bound', et is null and r.user_id is null, coalesce(et, 'user_id=' || coalesce(r.user_id::text, 'null')));

  -- Marathon re-match (comp-<uid>)
  insert into public.rooms (code, host_user_id, host_player_name, rematch_locked, rematch_player_ids)
  values ('QVTC01', A, 'Host', true, array['1', 'comp-' || B, 'comp-' || D]);
  et := pg_temp.qvt_exec(A, false, format($q$insert into public.lobby_players (room_code, player_id, name, type, approved)
       values ('QVTC01',%L,'Tester','registered',true), ('QVTC01',%L,'Tester','registered',true)$q$, 'comp-' || B, 'comp-' || D));
  r := pg_temp.qvt_row('QVTC01', 'comp-' || B); r2 := pg_temp.qvt_row('QVTC01', 'comp-' || D);
  perform pg_temp.qvt_ok('1A-S6a Marathon pre-seed binds comp-<uid> seats', et is null and r.user_id = B and r2.user_id = D, coalesce(et, 'not bound'));
  rv := pg_temp.qvt_val(D, false, format($q$select public.claim_carry_over_row('QVTC01',%L)$q$, 'comp-' || B));
  perform pg_temp.qvt_ok('1A-10 D claims comp-<B> -> false', rv.val = 'false', coalesce(rv.err, rv.val));

  insert into public.rooms (code, host_user_id, host_player_name, rematch_locked, rematch_player_ids)
  values ('QVTC02', A, 'Host', true, array['1', 'comp-' || B]);
  et := pg_temp.qvt_exec(A, false, format($q$insert into public.lobby_players (room_code, player_id, user_id, name, type, approved, has_left, is_ready, hcp_complete)
       values ('QVTC02',%L,null,'Tester','registered',true,true,true,true)
       on conflict (room_code, player_id) do update set has_left=excluded.has_left$q$, 'comp-' || B));
  r := pg_temp.qvt_row('QVTC02', 'comp-' || B);
  perform pg_temp.qvt_ok('1A-S6b Marathon seed (has_left=true) binds the seat', et is null and r.user_id = B and r.has_left, coalesce(et, 'state wrong'));
  rv := pg_temp.qvt_val(B, false, format($q$select public.claim_carry_over_row('QVTC02',%L)$q$, 'comp-' || B));
  et := pg_temp.qvt_exec(B, false, format($q$insert into public.lobby_players (room_code, player_id, user_id, name, type, approved, has_left)
       values ('QVTC02',%L,%L,'Tester','registered',true,false)
       on conflict (room_code, player_id) do update set approved=excluded.approved, user_id=excluded.user_id, has_left=excluded.has_left, name=excluded.name$q$, 'comp-' || B, B));
  r := pg_temp.qvt_row('QVTC02', 'comp-' || B);
  perform pg_temp.qvt_ok('1A-S6c invitee joins: has_left=false, stays approved', et is null and not r.has_left and r.approved and r.user_id = B, coalesce(et, 'state wrong'));

  -- Account deletion cascade (ON DELETE SET NULL)
  G := pg_temp.qvt_user('Qvtdelme', false, true, s);
  perform pg_temp.qvt_lp('QVTA01', 'joiner-g', G, true);
  begin
    delete from auth.users where id = G;
    r := pg_temp.qvt_row('QVTA01', 'joiner-g');
    perform pg_temp.qvt_ok('1A-S7 account deletion sets lobby user_id=null', r.player_id is not null and r.user_id is null, 'row missing or not nulled');
  exception when others then
    get stacked diagnostics et = message_text;
    perform pg_temp.qvt_ok('1A-S7 account deletion sets lobby user_id=null', false, 'delete failed: ' || et);
  end;

  et := pg_temp.qvt_exec(A, false, $q$update public.lobby_players set user_id=null where room_code='QVTN01' and player_id='joiner-d1'$q$);
  rv := pg_temp.qvt_val(E, false, $q$select public.claim_carry_over_row('QVTN01','joiner-d1')$q$);
  perform pg_temp.qvt_ok('1A-12b host detaches D''s seat; outsider E cannot claim it', et is null and rv.val = 'false', coalesce(et, rv.err, rv.val));

  if has_v2 then
    execute format($x$insert into public.rooms (code, host_user_id, host_player_name, multiplayer_v2, game_started) values ('QVTV01', %L, 'Host', true, true)$x$, A);
    execute format($x$insert into public.rooms (code, host_user_id, host_player_name) values ('QVTL01', %L, 'Host')$x$, E);
    et := pg_temp.qvt_exec(B, false, format($q$insert into public.lobby_players (room_code, player_id, user_id, name, type) values ('QVTL01','joiner-bl',%L,'Tester','registered')$q$, B));
    perform pg_temp.qvt_ok('setup: B joins legacy room', et is null, coalesce(et, 'ok'));
    et := pg_temp.qvt_exec(B, false, $q$update public.lobby_players set room_code='QVTV01' where player_id='joiner-bl'$q$);
    perform pg_temp.qvt_expect_err('1A-11 B moves legacy row into started v2 room', et, 'immutable_column');

    execute format($x$insert into public.rooms (code, host_user_id, host_player_name, multiplayer_v2, max_players) values ('QVTV02', %L, 'Host', true, 4)$x$, A);
    et := pg_temp.qvt_exec(D, false, format($q$insert into public.lobby_players (room_code, player_id, user_id, name, type, device_mode) values ('QVTV02','joiner-dv',%L,'Tester','registered','own')$q$, D));
    r := pg_temp.qvt_row('QVTV02', 'joiner-dv');
    perform pg_temp.qvt_ok('1A-S8 v2 own-device join', et is null and r.device_mode = 'own', coalesce(et, 'device=' || coalesce(r.device_mode, 'null')));
    et := pg_temp.qvt_exec(D, false, $q$update public.lobby_players set has_left=true where room_code='QVTV02' and player_id='joiner-dv'$q$);
    if et is null then
      et := pg_temp.qvt_exec(D, false, $q$update public.lobby_players set has_left=false, device_mode='host' where room_code='QVTV02' and player_id='joiner-dv'$q$);
    end if;
    r := pg_temp.qvt_row('QVTV02', 'joiner-dv');
    perform pg_temp.qvt_ok('1A-S9 v2 leave + rejoin with host device', et is null and r.device_mode = 'host', coalesce(et, 'device=' || coalesce(r.device_mode, 'null')));
  end if;

  -- ═════ 1B: clip reports ═════
  et := pg_temp.qvt_exec(null, false, $q$insert into public.clip_playback_errors (video_id, error_code) values ('qvtaaaaaaaa','video_not_found')$q$);
  perform pg_temp.qvt_expect_err('1B-1 no session inserts report', et);
  et := pg_temp.qvt_exec(C, true, $q$insert into public.clip_playback_errors (video_id, error_code, reporter) values ('qvtaaaaaaaa','video_not_found', null)$q$);
  perform pg_temp.qvt_expect_err('1B-2 reporter=null', et);
  et := pg_temp.qvt_exec(C, true, format($q$insert into public.clip_playback_errors (video_id, error_code, reporter) values ('qvtaaaaaaaa','video_not_found', %L)$q$, A));
  perform pg_temp.qvt_expect_err('1B-3 reporter=another user', et);
  et := pg_temp.qvt_exec(C, true, $q$insert into public.clip_playback_errors (video_id, error_code) values ('qvtaaaaaaaa','video_not_found')$q$);
  perform pg_temp.qvt_ok('1B-4 reporter omitted -> stored as caller',
    et is null and exists (select 1 from public.clip_playback_errors where video_id = 'qvtaaaaaaaa' and reporter = C), coalesce(et, 'reporter wrong'));
  et := pg_temp.qvt_exec(E, false, $q$insert into public.clip_playback_errors (video_id, error_code)
       select 'qvtv' || lpad(gs::text, 7, '0'), 'video_not_found' from generate_series(1, 11) gs$q$);
  perform pg_temp.qvt_expect_err('1B-5 11th report within 24h rejected', et, 'rate limit');

  insert into public.clip_playback_errors (video_id, error_code, reporter) values
    ('qvtxxxxxxxx', 'video_not_found', C), ('qvtxxxxxxxx', 'video_not_found', A),
    ('qvtyyyyyyyy', 'embed_not_allowed', A), ('qvtyyyyyyyy', 'embed_not_allowed', B);
  rv := pg_temp.qvt_service_val($q$select coalesce(string_agg(coalesce(video_id, '<null>') || ':' || breaker_tripped, ',' order by video_id), '') from public.clip_blocklist(array['qvtxxxxxxxx','qvtyyyyyyyy','qvtaaaaaaaa'])$q$);
  perform pg_temp.qvt_ok('1B-6a 1 anon + 1 registered -> not dead; 2 registered -> dead',
    rv.err is null and rv.val = 'qvtyyyyyyyy:false', coalesce(rv.err, rv.val));

  insert into public.clip_playback_errors (video_id, error_code, reporter)
  select 'qvtz' || lpad(gs::text, 7, '0'), 'video_not_found', u
  from generate_series(1, 26) gs cross join (values (A), (B)) as t(u);
  rv := pg_temp.qvt_service_val($q$select coalesce(string_agg(coalesce(video_id, '<null>') || ':' || breaker_tripped, ','), '') from public.clip_blocklist(array['qvtyyyyyyyy'])$q$);
  perform pg_temp.qvt_ok('1B-6b global breaker trips at >25 clips / 24h', rv.err is null and rv.val like '%:true', coalesce(rv.err, rv.val));

  rv := pg_temp.qvt_val(B, false, $q$select count(*) from public.clip_blocklist(array['qvtyyyyyyyy'])$q$);
  perform pg_temp.qvt_expect_err('1B-7 clients cannot call clip_blocklist', rv.err);

  -- ═════ 1C: invites ═════
  et := pg_temp.qvt_exec(B, false, format($q$insert into public.waiting_invites (to_player_name, room_code, from_player_name, from_user_id, to_user_id)
       values (%L,'QVTA01','Tester',%L,%L)$q$, 'qvtplayd-' || s, A, E));
  select count(*) = 1 into okb from public.waiting_invites
   where room_code = 'QVTA01' and from_user_id = B and to_user_id = D;
  perform pg_temp.qvt_ok('1C-1 spoofed from_user_id/to_user_id are overwritten', et is null and okb, coalesce(et, 'ids not overwritten'));

  et := pg_temp.qvt_exec(B, false, format($q$insert into public.waiting_invites (to_player_name, room_code, from_player_name, from_user_id)
       select 'qvtgt' || gs, 'QVTA01', 'Tester', %L from generate_series(1, 55) gs$q$, A));
  perform pg_temp.qvt_expect_err('1C-2 rate limit cannot be escaped with a spoofed sender', et, 'rate limit');

  -- ═════ 1D: anonymous identities ═════
  et := pg_temp.qvt_exec(C, true, format($q$insert into public.profiles (id, email, player_name) values (%L, 'qvt-anon@test.invalid', %L)$q$, C, 'Qvtanonx-' || s));
  perform pg_temp.qvt_expect_err('1D-1 anon inserts profiles row', et);
  et := pg_temp.qvt_exec(C, true, format($q$insert into public.profiles (id, email, player_name) values (%L, 'qvt-anon@test.invalid', %L)
       on conflict (id) do update set player_name=excluded.player_name$q$, C, 'Qvtanonx-' || s));
  perform pg_temp.qvt_expect_err('1D-1b anon upserts profiles row', et);

  C2 := pg_temp.qvt_user('Qvtanon2', true, false, s);
  insert into public.profiles (id, email, player_name) values (C2, 'qvt-oldanon-' || s || '@test.invalid', 'Qvtoldan-' || s);
  rv := pg_temp.qvt_val(C2, true, $q$select public.claim_free_month()::text$q$);
  perform pg_temp.qvt_expect_err('1D-2 anon with legacy profile cannot claim_free_month', rv.err, 'not_registered');
  rv := pg_temp.qvt_val(C, true, $q$select public.claim_free_month()::text$q$);
  perform pg_temp.qvt_expect_err('1D-2b anon without profile cannot claim_free_month', rv.err, 'not_registered');
  et := pg_temp.qvt_exec(C, true, format($q$insert into public.premium_grants (user_id, source, premium_until) values (%L,'free_month', now() + interval '1 month')$q$, C));
  perform pg_temp.qvt_expect_err('1D-2c anon inserts premium_grants directly', et);

  select exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'vouchers') into has_vouchers;
  if has_vouchers then
    insert into public.vouchers (code, duration_months, note) values ('QVTEST-' || s, 1, 'batch1 test, rolled back');
    rv := pg_temp.qvt_val(C2, true, format($q$select public.redeem_voucher(%L)::text$q$, 'QVTEST-' || s));
    perform pg_temp.qvt_ok('1D-2d anon (legacy profile) cannot redeem a voucher',
      rv.err is not null or not exists (select 1 from public.premium_grants where user_id = C2), coalesce('rejected: ' || rv.err, 'redeemed: ' || rv.val));
  end if;

  rv := pg_temp.qvt_val(C2, true, format($q$select public.create_remote_match('QVTR01', '{"era_from":1980,"era_to":2020}'::jsonb, %L::jsonb)::text$q$,
    json_build_array(json_build_object('user_id', C2, 'is_host', true, 'player_name', 'Tester'),
                     json_build_object('user_id', B, 'is_host', false, 'player_name', 'Tester'))::text));
  perform pg_temp.qvt_expect_err('1D-3 anon (legacy profile) cannot host a remote match', rv.err, 'not_registered');
  rv := pg_temp.qvt_val(A, false, format($q$select public.create_remote_match('QVTR02', '{"era_from":1980,"era_to":2020}'::jsonb, %L::jsonb)::text$q$,
    json_build_array(json_build_object('user_id', A, 'is_host', true, 'player_name', 'Tester'),
                     json_build_object('user_id', C, 'is_host', false, 'player_name', 'Tester'))::text));
  perform pg_temp.qvt_expect_err('1D-3b registered host cannot pull in an anon opponent', rv.err, 'not_registered');
  rv := pg_temp.qvt_val(A, false, format($q$select public.create_remote_match('QVTR03', '{"era_from":1980,"era_to":2020}'::jsonb, %L::jsonb)::text$q$,
    json_build_array(json_build_object('user_id', A, 'is_host', true, 'player_name', 'Tester'),
                     json_build_object('user_id', B, 'is_host', false, 'player_name', 'Tester'))::text));
  perform pg_temp.qvt_ok('1D-S3 registered vs registered remote match still works', rv.err is null and rv.val is not null, coalesce(rv.err, 'no id'));

  -- New registered user end to end (handle_new_user creates the profile)
  N := gen_random_uuid();
  insert into auth.users (id, instance_id, aud, role, email, is_anonymous, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values (N, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
          'qvt-new-' || s || '@test.invalid', false, '{}'::jsonb,
          json_build_object('playerName', 'Qvtnewu-' || s, 'birthYear', '1990')::jsonb, now(), now());
  et := pg_temp.qvt_exec(N, false, format($q$insert into public.profiles (id, email, player_name) values (%L, %L, %L)
       on conflict (id) do update set player_name=excluded.player_name$q$, N, 'qvt-new-' || s || '@test.invalid', 'Qvtnewu-' || s));
  rv := pg_temp.qvt_val(N, false, $q$select public.claim_free_month()::text$q$);
  perform pg_temp.qvt_ok('1D-S4 new registered user: profile save works',
    et is null and exists (select 1 from public.profiles where id = N), coalesce(et, 'no profile'));
  -- claim_free_month can also fail for reasons unrelated to 0068 (promo window closed);
  -- only "not_registered" would be a 0068 regression.
  perform pg_temp.qvt_ok('1D-S4b new registered user is not refused as anonymous',
    rv.err is null or rv.err !~* 'not_registered', coalesce('claim error (not 0068): ' || rv.err, 'claimed until ' || rv.val));

  rv := pg_temp.qvt_val(C, true, format($q$with x as (update public.profiles set id=%L where id=%L returning 1) select count(*) from x$q$, C, B));
  perform pg_temp.qvt_ok('1D-4 anon cannot repoint someone else''s profile to itself', rv.err is not null or rv.val = '0', coalesce('rejected: ' || rv.err, 'rows=' || rv.val));

  if has_v2 then
    execute 'select public.qv_is_registered_user($1)' into okb using C;
    perform pg_temp.qvt_ok('1D-5 v2 qv_is_registered_user(anon without profile) = false', okb = false, okb::text);
  end if;

  -- ═════ grants on the new helpers ═════
  perform pg_temp.qvt_ok('grant: _lobby_seat_owner not client-executable',
    to_regprocedure('public._lobby_seat_owner(text,text)') is not null
    and not has_function_privilege('anon', 'public._lobby_seat_owner(text,text)', 'execute')
    and not has_function_privilege('authenticated', 'public._lobby_seat_owner(text,text)', 'execute'), 'missing or client-executable');
  perform pg_temp.qvt_ok('grant: clip_blocklist not client-executable',
    to_regprocedure('public.clip_blocklist(text[])') is not null
    and not has_function_privilege('anon', 'public.clip_blocklist(text[])', 'execute')
    and not has_function_privilege('authenticated', 'public.clip_blocklist(text[])', 'execute'), 'missing or client-executable');
  perform pg_temp.qvt_ok('grant: claim_carry_over_row not executable without a session',
    not has_function_privilege('anon', 'public.claim_carry_over_row(text,text)', 'execute'), 'executable by anon');

  -- ── report + rollback ──
  select count(*) filter (where qvt_results.ok), count(*) filter (where not qvt_results.ok) into npass, nfail from pg_temp.qvt_results;
  select string_agg((case when qvt_results.ok then 'PASS  ' else 'FAIL  ' end) || name
                    || case when qvt_results.ok then '' else '  ->  ' || coalesce(detail, '') end, E'\n' order by qvt_results.n)
    into report from pg_temp.qvt_results;
  raise exception E'QVT_BATCH1_REPORT (rolled back on purpose, nothing kept)\n%\n\n% passed, % failed', report, npass, nfail;
end $$;

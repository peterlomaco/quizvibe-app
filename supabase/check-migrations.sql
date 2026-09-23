-- Which migrations are applied? Paste into Supabase Dashboard → SQL Editor and Run.
-- Read-only: it only inspects the catalog. One row per migration, missing ones first.
-- Each migration is checked by one "signature" object it creates.
-- 0008/0009/0039/0044x are left out (renames/grants with no reliable signature).
-- 0016 (game_sessions) has never been applied on purpose, so MISSING there is expected.

with checks(migration, kind, obj) as (values
  ('0001_profiles_table',                'table',  'public.profiles'),
  ('0002_rooms_table',                   'table',  'public.rooms'),
  ('0003_lobby_tables',                  'table',  'public.lobby_settings'),
  ('0005_has_left_flag',                 'column', 'public.lobby_players.has_left'),
  ('0006_pg_cron_rooms_cleanup',         'cron',   'rooms'),
  ('0007_player_audio_overrides',        'column', 'public.lobby_settings.player_audio_overrides'),
  ('0010_waiting_invites',               'table',  'public.waiting_invites'),
  ('0011_anon_signup_rate_limit',        'table',  'public.anon_signup_attempts'),
  ('0013_sketch_enabled',                'column', 'public.lobby_settings.sketch_enabled'),
  ('0014_per_source_categories',         'column', 'public.lobby_settings.youtube_enabled_categories'),
  ('0015_spotify_connections (lobby)',   'column', 'public.lobby_players.spotify_verified'),
  ('0016_game_sessions (never applied)', 'table',  'public.game_sessions'),
  ('0017_user_friends',                  'table',  'public.user_friends'),
  ('0019_lobby_settings_max_players',    'column', 'public.lobby_settings.max_players'),
  ('0021_question_answers',              'table',  'public.question_answers'),
  ('0022_player_name_lookup_hardening',  'func',   'public.player_name_exists'),
  ('0023_player_name_check_constraints', 'constraint', 'profiles_player_name_format'),
  ('0024_waiting_invites_rate_limit',    'func',   'public.enforce_invite_rate_limit'),
  ('0025_drop_spotify_connections',      'notable','public.spotify_connections'),
  ('0026_lobby_players_seen_questions',  'column', 'public.lobby_players.seen_question_ids'),
  ('0027_remote_1v1',                    'table',  'public.remote_match_answers'),
  ('0028_remote_match_cancel',           'func',   'public.cancel_remote_match'),
  ('0029_remote_match_guest_alias',      'column', 'public.remote_match_players.account_player_name'),
  ('0030_lobby_players_account_name',    'column', 'public.lobby_players.account_player_name'),
  ('0031_rooms_is_remote_1v1',           'column', 'public.rooms.is_remote_1v1'),
  ('0032_remote_match_forfeit',          'func',   'public.forfeit_remote_match'),
  ('0033_lobby_settings_remote_assist',  'column', 'public.lobby_settings.remote_assistance'),
  ('0034_lobby_settings_mutual_assist',  'column', 'public.lobby_settings.remote_assistance_enabled'),
  ('0035_app_config',                    'table',  'public.app_config'),
  ('0036_drop_quiz_image_assets',        'notable','public.quiz_image_assets'),
  ('0037_aggregate_leaderboards',        'table',  'public.aggregate_leaderboard_games'),
  ('0038_waiting_invites_already_friend','column', 'public.waiting_invites.already_friend'),
  ('0040_email_exists',                  'func',   'public.email_exists'),
  ('0041_competition_rematch_requests',  'table',  'public.competition_rematch_requests'),
  ('0042_lobby_players_hcp',             'column', 'public.lobby_players.hcp'),
  ('0043_aggregate_game_settings',       'column', 'public.aggregate_leaderboard_games.settings'),
  ('0044b_check_constraints',            'constraint', 'profiles_birth_year_range'),
  ('0046_subscription_entitlements',     'table',  'public.subscription_entitlements'),
  ('0047_premium_promo_grants',          'table',  'public.premium_grants'),
  ('0048_handle_new_user',               'func',   'public.handle_new_user'),
  ('0049_welcome_email_on_confirm',      'func',   'public.on_email_confirmed'),
  ('0050_lobby_players_hcp_categories',  'column', 'public.lobby_players.hcp_music'),
  ('0051_waiting_invites_competition_nm','column', 'public.waiting_invites.competition_name'),
  ('0052_aggregate_lb_dismissal',        'column', 'public.aggregate_leaderboard_players.dismissed'),
  ('0053_remote_match_dismissal',        'column', 'public.remote_match_players.dismissed'),
  ('0054_lobby_players_read_hardening',  'func',   'public.get_lobby_roster'),
  ('0055_lobby_settings_package_toggles','column', 'public.lobby_settings.package_hints_enabled'),
  ('0056_clip_playback_errors',          'table',  'public.clip_playback_errors'),
  ('0057_remote_match_answers_skipped',  'column', 'public.remote_match_answers.skipped'),
  ('0057 (forfeit ignores skipped)',     'funcbody','public.forfeit_remote_match|skipped')
)
select * from (
select
  migration,
  case when case kind
    when 'table'   then to_regclass(obj) is not null
    when 'notable' then to_regclass(obj) is null
    when 'column'  then exists (
      select 1 from information_schema.columns
      where table_schema = split_part(obj, '.', 1)
        and table_name   = split_part(obj, '.', 2)
        and column_name  = split_part(obj, '.', 3))
    when 'func'    then exists (
      select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname || '.' || p.proname = obj)
    when 'funcbody' then exists (
      select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname || '.' || p.proname = split_part(obj, '|', 1)
        and p.prosrc ilike '%' || split_part(obj, '|', 2) || '%')
    when 'constraint' then exists (select 1 from pg_constraint where conname = obj)
    when 'cron'    then exists (
      select 1 from pg_extension where extname = 'pg_cron')
  end then '✅ applied' else '❌ MISSING' end as status,
  obj as checked_object
from checks
) r
order by (status like '❌%') desc, migration;

-- Extra checks for things that are not migrations (run separately if you want):
-- Vault secrets used by 0049 (welcome email):
--   select name from vault.decrypted_secrets where name in ('welcome_email_url','welcome_email_secret');
-- Scheduled cron jobs (0006 + 0027):
--   select jobname, schedule from cron.job order by jobname;

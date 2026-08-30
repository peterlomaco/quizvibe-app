# Supabase migrations — apply order & applied-state ledger

Migrations here are **applied by hand** via the Supabase SQL editor (no CLI linked;
no `config.toml`). The numbered files in `migrations/` are the ordered source of
truth, but Postgres keeps **no record of which file was applied to which project**.
This ledger is that record — keep it honest so `prod` and `staging` never drift
unnoticed (that's how `0016` ended up ambiguous).

**When you apply a migration**, tick its box for that environment with the date.
**When you add a new migration file**, add a row here.

Legend: `✅ <date>` applied · `⬜` not applied (held/skipped) · `✅? ` assumed
applied (the app depends on it) but not individually re-verified · `—` env not set up yet.

## Special cases (read before mirroring prod → staging)
- **`0016_game_sessions`** — the `game_sessions` / `game_player_results` /
  `game_round_results` tables have **zero client references**; almost certainly
  never applied to prod. Replaying it into staging is harmless (dead tables). If
  ever revived, ship it with `user_id = auth.uid()` checks, not `with check(true)`.
- **`0044a/b/c`** — the single "safe hardening" migration was split into three
  risk tiers; all three applied to prod **2026-08-30**.
- **`0045` / `0046`** — intentionally **held** (see the pre-launch plan). `0045`
  needs a two-device join-flow test; `0046` is inert until the RevenueCat webhook
  is wired. Test both on **staging** first.
- **Drop migrations** (`0008`, `0025`, `0036`) remove tables earlier migrations
  created — replaying the full sequence in order nets the correct final schema.

## Ledger

| Migration | Prod | Staging | Notes |
|---|---|---|---|
| 0001_profiles_table | ✅? | — | enables `citext` |
| 0002_rooms_table | ✅? | — | |
| 0003_lobby_tables | ✅? | — | |
| 0004_realtime_rooms | ✅? | — | |
| 0005_has_left_flag | ✅? | — | |
| 0006_pg_cron_rooms_cleanup | ✅? | — | needs `pg_cron` extension |
| 0007_player_audio_overrides | ✅? | — | |
| 0008_remove_spotify | ✅? | — | drop |
| 0009_rename_profiles_to_images | ✅? | — | |
| 0010_waiting_invites | ✅? | — | |
| 0011_anon_signup_rate_limit | ✅? | — | |
| 0012_main_categories | ✅? | — | |
| 0013_sketch_enabled | ✅? | — | |
| 0014_per_source_categories | ✅? | — | |
| 0015_spotify_connections | ✅? | — | (dropped again by 0025) |
| 0016_game_sessions | ⬜ (never — no client refs) | — | see Special cases |
| 0017_user_friends | ✅? | — | |
| 0018_quiz_image_assets | ✅? | — | (dropped again by 0036) |
| 0019_lobby_settings_max_players | ✅? | — | |
| 0020_claim_carry_over_policy | ✅? | — | |
| 0021_question_answers | ✅? | — | |
| 0022_player_name_lookup_hardening | ✅? | — | |
| 0023_player_name_check_constraints | ✅? | — | CHECKs are NOT VALID |
| 0024_waiting_invites_rate_limit | ✅? | — | |
| 0025_drop_spotify_connections | ✅? | — | drop |
| 0026_lobby_players_seen_questions | ✅? | — | |
| 0027_remote_1v1 | ✅? | — | needs `pg_cron` |
| 0028_remote_match_cancel | ✅? | — | |
| 0029_remote_match_guest_alias | ✅? | — | |
| 0030_lobby_players_account_name | ✅? | — | |
| 0031_rooms_is_remote_1v1 | ✅? | — | |
| 0032_remote_match_forfeit | ✅? | — | |
| 0033_lobby_settings_remote_assistance | ✅? | — | |
| 0034_lobby_settings_mutual_assistance | ✅? | — | |
| 0035_app_config | ✅? | — | |
| 0036_drop_quiz_image_assets | ✅? | — | drop |
| 0037_aggregate_leaderboards | ✅? | — | |
| 0038_waiting_invites_already_friend | ✅? | — | |
| 0039_waiting_invites_replica_identity_full | ✅? | — | |
| 0040_email_exists | ✅? | — | |
| 0041_competition_rematch_requests | ✅? | — | |
| 0042_lobby_players_hcp | ✅? | — | |
| 0043_aggregate_game_settings | ✅? | — | |
| 0044a_fk_indexes | ✅ 2026-08-30 | — | |
| 0044b_check_constraints | ✅ 2026-08-30 | — | |
| 0044c_policy_hardening | ✅ 2026-08-30 | — | |
| 0045_lobby_players_insert_hardening | ⬜ (held — test in staging) | — | |
| 0046_subscription_entitlements | ⬜ (held — E1 foundation) | — | + deploy `functions/revenuecat-webhook` |

> The `✅?` marks are best-effort: the app runs against prod, so it depends on
> these, but they were applied before this ledger existed. When you set up
> staging (replaying `0001 → 0044c`), you can treat that replay as the
> authoritative baseline and upgrade the prod column to `✅` as you verify.

## Edge Functions (deployed per project, NOT covered by SQL replay)
`anon-signup`, `delete-account`, `login-by-name`, `revenuecat-webhook` — deploy to
each project separately. Auth settings to mirror: **Verify JWT = OFF** for
`anon-signup` + `delete-account`; enable **Anonymous sign-ins** + email/password.

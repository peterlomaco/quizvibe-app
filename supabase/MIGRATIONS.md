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
| 0001_profiles_table | ✅? | ✅ 2026-08-30 | enables `citext` |
| 0002_rooms_table | ✅? | ✅ 2026-08-30 | |
| 0003_lobby_tables | ✅? | ✅ 2026-08-30 | |
| 0004_realtime_rooms | ✅? | ✅ 2026-08-30 | |
| 0005_has_left_flag | ✅? | ✅ 2026-08-30 | |
| 0006_pg_cron_rooms_cleanup | ✅? | ✅ 2026-08-30 | needs `pg_cron` extension |
| 0007_player_audio_overrides | ✅? | ✅ 2026-08-30 | |
| 0008_remove_spotify | ✅? | ✅ 2026-08-30 | drop |
| 0009_rename_profiles_to_images | ✅? | ✅ 2026-08-30 | |
| 0010_waiting_invites | ✅? | ✅ 2026-08-30 | |
| 0011_anon_signup_rate_limit | ✅? | ✅ 2026-08-30 | |
| 0012_main_categories | ✅? | ✅ 2026-08-30 | |
| 0013_sketch_enabled | ✅? | ✅ 2026-08-30 | |
| 0014_per_source_categories | ✅? | ✅ 2026-08-30 | |
| 0015_spotify_connections | ✅? | ✅ 2026-08-30 | (dropped again by 0025) |
| 0016_game_sessions | ⬜ (never — no client refs) | ✅ 2026-08-30 | see Special cases |
| 0017_user_friends | ✅? | ✅ 2026-08-30 | |
| 0018_quiz_image_assets | ✅? | ✅ 2026-08-30 | (dropped again by 0036) |
| 0019_lobby_settings_max_players | ✅? | ✅ 2026-08-30 | |
| 0020_claim_carry_over_policy | ✅? | ✅ 2026-08-30 | |
| 0021_question_answers | ✅? | ✅ 2026-08-30 | |
| 0022_player_name_lookup_hardening | ✅? | ✅ 2026-08-30 | |
| 0023_player_name_check_constraints | ✅? | ✅ 2026-08-30 | CHECKs are NOT VALID |
| 0024_waiting_invites_rate_limit | ✅? | ✅ 2026-08-30 | |
| 0025_drop_spotify_connections | ✅? | ✅ 2026-08-30 | drop |
| 0026_lobby_players_seen_questions | ✅? | ✅ 2026-08-30 | |
| 0027_remote_1v1 | ✅? | ✅ 2026-08-30 | needs `pg_cron` |
| 0028_remote_match_cancel | ✅? | ✅ 2026-08-30 | |
| 0029_remote_match_guest_alias | ✅? | ✅ 2026-08-30 | |
| 0030_lobby_players_account_name | ✅? | ✅ 2026-08-30 | |
| 0031_rooms_is_remote_1v1 | ✅? | ✅ 2026-08-30 | |
| 0032_remote_match_forfeit | ✅? | ✅ 2026-08-30 | |
| 0033_lobby_settings_remote_assistance | ✅? | ✅ 2026-08-30 | |
| 0034_lobby_settings_mutual_assistance | ✅? | ✅ 2026-08-30 | |
| 0035_app_config | ✅? | ✅ 2026-08-30 | |
| 0036_drop_quiz_image_assets | ✅? | ✅ 2026-08-30 | drop |
| 0037_aggregate_leaderboards | ✅? | ✅ 2026-08-30 | |
| 0038_waiting_invites_already_friend | ✅? | ✅ 2026-08-30 | |
| 0039_waiting_invites_replica_identity_full | ✅? | ✅ 2026-08-30 | |
| 0040_email_exists | ✅? | ✅ 2026-08-30 | |
| 0041_competition_rematch_requests | ✅? | ✅ 2026-08-30 | |
| 0042_lobby_players_hcp | ✅? | ✅ 2026-08-30 | |
| 0043_aggregate_game_settings | ✅? | ✅ 2026-08-30 | |
| 0044a_fk_indexes | ✅ 2026-08-30 | ✅ 2026-08-30 | |
| 0044b_check_constraints | ✅ 2026-08-30 | ✅ 2026-08-30 | |
| 0044c_policy_hardening | ✅ 2026-08-30 | ✅ 2026-08-30 | |
| 0045_lobby_players_insert_hardening | ⬜ (held — test in staging) | — | |
| 0046_subscription_entitlements | ⬜ (held — E1 foundation) | — | + deploy `functions/revenuecat-webhook` |

> The `✅?` marks are best-effort: the app runs against prod, so it depends on
> these, but they were applied before this ledger existed. When you set up
> staging (replaying `0001 → 0044c`), you can treat that replay as the
> authoritative baseline and upgrade the prod column to `✅` as you verify.

## Edge Functions (deployed per project, NOT covered by SQL replay)
`anon-signup`, `delete-account`, `login-by-name`, `revenuecat-webhook` — deploy to
each project separately. Auth settings to mirror: **Verify JWT = OFF** on all;
enable **Anonymous sign-ins**; **Confirm email = OFF** (the app has no email-
confirm step); email/password on.

| Function | Prod | Staging |
|---|---|---|
| anon-signup | ✅ (pre-existing) | ✅ 2026-08-30 (JWT off) |
| delete-account | ✅ (pre-existing) | ✅ 2026-08-30 (JWT off) |
| login-by-name | ✅ (pre-existing) | ✅ 2026-08-30 (JWT off) |
| revenuecat-webhook | ⬜ (E1 — not deployed anywhere yet) | ⬜ (deploy with `0046`) |

## Staging project — quizvibe-staging (set up 2026-08-30)
Project ref `tottbiuikbdarsjlpxwn`, region eu-west-1 (Free). Schema `0001→0044c`
replayed 2026-08-30 (publication-adds made idempotent for the combined run;
staging additionally has `0016`'s dead tables, which prod lacks — harmless).
Anonymous sign-ins on, Confirm email off. Local dev points here via `.env`
(prod values kept as commented lines). **Not yet wired to EAS build environments**
— `development`/`preview` still need the staging URL/key so preview/TestFlight
builds use staging (deferred until builds resume post-Apple-conversion).

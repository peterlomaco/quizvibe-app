# QuizVibe 1.0.1 — Final Release Readiness Review

Prepared 2026-11-27. Nothing in this document has been executed against PROD, master, production EAS or App Store Connect. Every step marked **GO** needs Peter's separate approval.

## 1. Verdict

**Ready for the cutover. No open blockers.**

| # | Blocker | Status |
|---|---|---|
| B1 | `EXPO_PUBLIC_YT_OWN_WRAPPER=1` was set in EAS **preview** (what #41 was tested with) but missing in EAS **production**, so #42 would have shipped the untested old YouTube player path. | **Resolved 2026-11-27** (Peter's go): variable created in EAS `production` only (plaintext, value `1`). Verified: production env lists it; preview unchanged; no build or OTA triggered (latest iOS build still the 2026-11-26 `build40-compat`, build counter still 41, channel heads `production` `e80008e0`, `preview` `5b056fd2`, `build40-compat-test` `fe4319dd`); PROD Supabase not contacted. |

No other open defects. No feature work is pending for 1.0.1.

### B1 and the Build 40 gate OTA
The gate OTA (step 9) is published with `--environment production`, so it now gets `EXPO_PUBLIC_YT_OWN_WRAPPER=1` in its build environment. **No effect:** the gate branch `release/build40-update-gate` (`a75b457`) and the Build 40 source (`b6d08cc`) never reference the variable — the own wrapper only exists in 1.0.1 code. Metro inlines only `process.env.EXPO_PUBLIC_*` names the code reads, so the Build 40 bundle is unchanged. The only variables the gate code reads are the Supabase URL/key, RevenueCat keys and the Spotify client id, which are unchanged. No change to the step 9 command is needed.

## 2. Source

| Item | Value |
|---|---|
| Release branch | `fix/auth-session-integrity` |
| Last code commit | `ec13101` (branch HEAD carries only documentation after it) |
| Release candidate tag | `rc/1.0.1-build41-staging` → `4b113e7` (what TestFlight #41 was built from) |
| Code commits after #41 | `e909500` (non-host legacy roster excludes players who left — ghost players), `ec13101` (Hints category-complete reveal) |
| Other commits after #41 | documentation and tests only |
| App files changed since #41 | `LobbyScreen.tsx`, `nonHostRoster.ts`, `hintsGenerator.ts`, `HintsQuizCard.tsx` (+ 3 test files) |
| master | origin `0c5c667`, local `5b74b64` (0059 record). Both are ancestors of HEAD → **fast-forward merge, no conflicts** |
| Included branches | `logo-gold-home` (`32f8e61`) and `feat/name-reveal-colors` (`6f24e0b`) are fully in HEAD |
| Kept apart (never merged) | `test/build40-compat`, `test/build40-compat-gate`; `release/build40-update-gate` (`a75b457`) is published separately as an OTA, not merged |
| Deferred to 2.0.0 / later | `feat/welcome-free-credits`, `fix/double-tap-single-flight` (rest), `remove-dormant-features` |

## 3. Automated checks (run 2026-11-27 on HEAD)

| Check | Result |
|---|---|
| Backend vitest | **700 passed, 3 skipped**, 36 files |
| TypeScript, app | 50 errors — identical to #41 (`4b113e7`), none new |
| TypeScript, full project | 51 — all present at #41 (known baseline: `parentControlled` type, StatusBar prop, `Generation` export, duplicate keys in `hintsData`) |
| iOS fingerprint at HEAD | `32682a4…` = #41 runtime (JS-only changes since #41) |
| `UIBackgroundModes` (Apple 2.5.4) | absent ✅ |
| App version / next build | `1.0.1` / remote counter at 41 → production build will be **#42** |

## 4. Physical tests

| Area | Status |
|---|---|
| Part B — Build 40 compatibility | C1–C11, C14, G1–G5 **PASS**. C12, C13, C15 optional, **not executed** |
| Part A — #41 on STAGING | R1a–e, R2a, R2b (automated + manual), R2c, R3a–c, R4, R5, R7a–e, R8, R9a–b, R10a–c, R11a–e **PASS** |
| STAGING OTA `5b056fd2` on #41 | Hints reveal + ghost players (B1/B2) **PASS** on both iPhones |
| R9c clip swap | **N/A** — no dead clip occurred; covered by unchanged code from 1.0.0 and unit tests |
| R6 upgrade 1.0.0 (Build 40) → 1.0.1 (expected Build 42) | **Deferred** to the production TestFlight build (section 9, P1) |
| Ghost-player regression | **Repeat** on #42 (section 8) |
| Final STAGING config | `feature_gates` = `{"allAtOnce":"everyone","multiplayerV2":true}`, no `min_supported_build` row |

## 5. Known limitations and accepted risks

| Item | Accepted by / note |
|---|---|
| Local history, HCP (→ 99), friends, ledgers and saved lobbies reset on first 1.0.1 start | Peter 2026-11-26 |
| Saved Parent Control choices are kept; accounts without a saved value get mature content ON | Peter 2026-11-26 |
| Build 40 joining a v2 room is silently refused (logged only); player stays in their own lobby view and can Leave | 0070 design |
| Build 40 rejoin of a row that already has a device from a Build 41 join is let through | very rare (same account, two devices) |
| Build 40 keeps the ghost-player display bug | fixed in 1.0.1 only |
| Build 40 OTA gate only reaches devices that open the app (applies on the next cold start) | expo-updates default |
| One game per account: a device closed mid-game without Leave locks the account on other devices up to 24 h | Peter 2026-11-26 |
| `check-clips` has no caller auth (read-only, max 60 ids, quota risk) | Build 42 backlog |
| `lobby_players.account_player_name` / hcp columns are client-writable server-side | Build 41 client stops it; server trigger in backlog |
| RevenueCat account-switch race can only write `false` while no paid IAP is live | must be fixed before 2.0.0 |
| `QuizVibeAlertHost` can draw above `UpdateRequiredScreen` | cosmetic, backlog |
| Athletes keep the old Hints grouping (no athlete questions in the playable pool today) | Peter 2026-11-27 |
| `docs/legal/terms.md` §7.1 still mentions images | legal text, Peter's decision |

## 6. Merge and tagging procedure (GO for each)

```powershell
git switch master
git pull --ff-only origin master
git merge --ff-only fix/auth-session-integrity
git tag -a v1.0.1 -m "QuizVibe 1.0.1"
git push origin master
git push origin v1.0.1
```
- Fast-forward only — if `--ff-only` refuses, stop and report (it shouldn't: master is an ancestor of HEAD).
- Tag `v1.0.1` on the exact commit the production build is made from. If the build happens before the merge, build from the branch HEAD and tag that commit.
- Do not merge or push `test/*` or `release/build40-update-gate`. No force-push, no branch deletion.

## 7. Production build configuration

| Setting | Value |
|---|---|
| Profile | `production` (channel `production`, `autoIncrement`, EAS environment `production`) |
| Supabase | `pyndqehlebtxochwpwex` (PROD) — verified in EAS production env |
| Env vars needed | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `EXPO_PUBLIC_REVENUECAT_IOS_KEY` (present), `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` (profile), `EXPO_PUBLIC_YT_OWN_WRAPPER=1` (added 2026-11-27, B1) — all present |
| Build number | #42 (verify with `npx eas build:version:get -p ios` right before) |
| Version | 1.0.1 |

Before building (read-only):
```powershell
npx eas env:list --environment production
npx expo config --type introspect
npx eas build:version:get -p ios
```
Build (GO):
```powershell
npx eas build --profile production --platform ios --auto-submit
```
After the build: check the build log shows env loaded from **production**, and note the runtime version (should equal #41's `32682a4…` if nothing native changed; any production OTA must target it).

⚠ Never select #41 (or any `staging-testflight` build) in App Store Connect.

## 8. PROD cutover order (GO for each step)

Migration dependencies verified against the files:
- `0060` creates `deleted_account_tombstones` → must run **before** redeploying `delete-account` (otherwise deletes fail with `tombstone_failed`).
- `0061` standalone (profiles default; not tracked in `check-migrations.sql` — verify with the column-default query below).
- `0062 → 0063 → 0064 → 0065 → 0066 → 0067 → 0070` in order: 0063 adds `device_mode`, 0064 the join trigger + `start_lobby_game` + `game_config`, 0065 `lobby_removed_players`, 0066 `lobby_turn_results`, 0067 rewrites the join trigger, 0070 adds `enforce_v2_join_client` reading `rooms.multiplayer_v2` and `device_mode`.
- `0068` independent (it does not reference v2 objects; mentions are comments). Needs `batch1-precheck.sql` first; rollback `supabase/rollback/0068_revert.sql`.
- `0069` standalone (`lobby_settings` filter columns).
- New `check-clips` needs 0068's `clip_blocklist`; it fails open without it.

| Step | Action | Verify |
|---|---|---|
| 1 | PROD backup / PITR checkpoint noted | timestamp recorded |
| 2 | `0060` → redeploy `delete-account` (Verify JWT OFF, check Code tab) | `check-migrations.sql` 0060 ✅; deleting a PROD test account adds one row to `deleted_account_tombstones` |
| 3 | `0061` | `select column_default from information_schema.columns where table_name='profiles' and column_name='images_enabled_categories';` → `'{}'::text[]` |
| 4 | `0062` (main SQL only, never the commented snippets), `0063`, `0064`, `0065`, `0066`, `0067` | `check-migrations.sql` all ✅; `feature_gates` has `"multiplayerV2": false` |
| 5 | `0069` | `check-migrations.sql` 0069 ✅ |
| 6 | `0070` | `check-migrations.sql` 0070 ✅. Do **not** run `0070-staging-tests.sql` in PROD |
| 7 | Production TestFlight acceptance (section 9) against PROD | all pass |
| 8 | `feature_gates.multiplayerV2 = true` | `select value from app_config where key='feature_gates';` |
| 9 | Publish the Build 40 gate OTA from `release/build40-update-gate` (`a75b457`): LF-normalise `patches/*.patch`, confirm against update group `e80008e0` that no other text from that OTA is missing, then `npx eas update --branch production --platform ios --environment production --message "Build 40: update-required gate"` | runtime `4b73aa7…`; gate stays inert (no `min_supported_build` row) |
| 10 | Submit 1.0.1 (section 10) | — |
| 11 | After approval: manual release | — |
| 12 | `min_supported_build = {"ios": 41}` | Build 40 device shows Update required after its second cold start |
| 13 | `0068`: `batch1-precheck.sql` → show result to Peter → apply → `check-migrations.sql` → smoke test (lobby, join, approve, game, Final Leaderboard re-match, Marathon re-match, delete test account) → deploy `check-clips` (Verify JWT OFF, check Code tab). Conditions: gate active and Build 40 adoption negligible (or accepted). Never run `batch1-staging-tests.sql` in PROD | all ✅ |
| 14 | 48 h monitoring | errors, joins, deletes, credits |

Not part of 1.0.1: `0046` server-premium cutover, `paid_subscription.enabled`, `pkg_sub_monthly`.

## 9. Production TestFlight acceptance (#42 against PROD)

Run after step 6 (migrations in place), before submit.

| # | Test | Expected |
|---|---|---|
| P1 = R6 | **Upgrade public 1.0.0 (Build 40, App Store) → production 1.0.1 (expected Build 42, TestFlight).** Phone with the App Store 1.0.0 (Build 40), logged in to a PROD account, a few games played, a Parent Control choice saved. Install the production-profile TestFlight 1.0.1 (#42) over it without deleting the app. Not #41 — that build talks to STAGING | Still logged in (same account, no re-login); local history/HCP/friends/saved lobbies reset (accepted); saved Parent Control choice kept; Marathon tables + H2H intact; no other account's data |
| P2 | Ghost-player regression (legacy room, `multiplayerV2` still false): approved guest joins and leaves before Start; play All at Once and Pass-the-Phone follower | Non-host live + Final Leaderboard show only real participants |
| P3 | Smoke as `Apple-2` (review account): create lobby → join from second phone → approve → play → Re-match → Store shows the free month | Works end to end against PROD |
| P4 | Hints question on #42 | Category-complete reveal, clues append at the bottom |
| P5 | YouTube clip plays with own wrapper (B1) | Plays, ends with QuizVibe logo |
| P6 | After step 8 (`multiplayerV2=true`): two-device 1 by 1 and All at Once game | v2 flow works; Build 40 device can't join the v2 room |
| P7 | Delete a PROD test account | Tombstone row; re-registration with same email/name blocked |
| P8 | Register a new PROD account | Confirmation mail arrives; Hints off by default; mature content on |

## 10. App Store submission checklist

- [x] B1 resolved (EAS production env, 2026-11-27)
- [ ] #42 built with production env (log verified)
- [ ] Section 8 steps 1–8 done and verified
- [ ] Section 9 P1–P8 pass
- [ ] Version 1.0.1, build **#42** selected (not #41)
- [ ] What's New text (UI + Multiplayer)
- [ ] Screenshots still accurate for the new UI (6.9")
- [ ] App Review Information: contact, `Apple-2` credentials, notes describing the two-device test (Apple-1 + Apple-2), All at Once vs 1 by 1
- [ ] **No IAP attached**, no paid features in the build (`pkg_sub_monthly` stays for 2.0.0)
- [ ] Age rating and privacy answers unchanged vs 1.0.0 (account deletion in-app ✅)
- [ ] Manual release, Phased Release OFF
- [ ] After release: step 12, then step 13, then 48 h monitoring

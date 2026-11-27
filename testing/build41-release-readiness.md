# QuizVibe 1.0.1 — Final Release Readiness Review

Prepared 2026-11-27, accepted by Peter 2026-11-27 with corrections (rev 3, this version: build from a tag on the release branch, master merge deferred until 0060 is live in PROD, email branding + screenshots added). Nothing in this document has been executed against PROD Supabase, production EAS (build/OTA) or App Store Connect. Every step marked **GO** needs Peter's separate approval.

## 1. Verdict

**Ready for the cutover. No open blockers.**

| # | Blocker | Status |
|---|---|---|
| B1 | `EXPO_PUBLIC_YT_OWN_WRAPPER=1` was set in EAS **preview** (what #41 was tested with) but missing in EAS **production**, so #42 would have shipped the untested old YouTube player path. | **Resolved 2026-11-27** (Peter's go): variable created in EAS `production` only (plaintext, value `1`). Verified: production env lists it; preview unchanged; no build or OTA triggered (latest iOS build still the 2026-11-26 `build40-compat`, build counter still 41, channel heads `production` `e80008e0`, `preview` `5b056fd2`, `build40-compat-test` `fe4319dd`); PROD Supabase not contacted. |

No other open defects. No feature work is pending for 1.0.1.

### B1 and the Build 40 gate OTA
The gate OTA is published with `--environment production`, so it now gets `EXPO_PUBLIC_YT_OWN_WRAPPER=1` in its build environment. **No effect:** the gate branch `release/build40-update-gate` (`a75b457`) and the Build 40 source (`b6d08cc`) never reference the variable — the own wrapper only exists in 1.0.1 code. Metro inlines only `process.env.EXPO_PUBLIC_*` names the code reads, so the Build 40 bundle is unchanged. The only variables the gate code reads are the Supabase URL/key, RevenueCat keys and the Spotify client id, which are unchanged. No change to the publish command is needed.

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
| Ghost-player regression | **Repeat** on #42 (section 9, P2) |
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
| Reset password: reusing the old password gives 422, the form stays on the code step, and re-submitting the same (now consumed) code shows a misleading "Invalid code" (seen in STAGING E4). Existing in Build 40 | Build 42 backlog; testers use a different new password |
| Gate OTA vs published `e80008e0` cannot be compared exactly (section 8, step 17) | open; not marked as passed |

## 6. Tagging, build source and deferred master merge

**Decision (Peter 2026-11-27, option 2):** Production Build #42 is built from the release branch via an annotated `v1.0.1` tag. **master stays unchanged** until migration 0060 and the updated `delete-account` Edge Function are deployed and verified in PROD (section 8, step 4). Only then is master fast-forwarded, which also publishes the new quizvibe.se site and the updated Privacy Policy (section 11).

### 6.1 Tag `v1.0.1` (GO)
Preconditions (stop if any fails): clean working tree; local = remote `fix/auth-session-integrity`; `git diff --stat ec13101 <tag-commit> -- . ':!*.md' ':!testing'` empty (no app code change since the approved RC); automated results (700 passed, 3 skipped) still applicable; tag doesn't exist locally or on origin.
```powershell
git switch fix/auth-session-integrity
git pull --ff-only origin fix/auth-session-integrity
git tag -a v1.0.1 -m "QuizVibe 1.0.1 (production build source)"
git push origin v1.0.1
git rev-parse v1.0.1^{commit}
```
- **Pushing the tag triggers nothing** (verified 2026-11-27): no workflow has a `push`/`tags` trigger (`ota-on-clip-fix-merge.yml` = closed PR into master + manual dispatch; `youtube-validate-nightly.yml` = schedule + manual dispatch), and GitHub Pages builds only from the `master` branch. EAS builds/OTAs only start from explicit CLI commands. One thing the repo can't show: check the Expo project's GitHub integration (expo.dev → project → GitHub) has no "build on push" trigger configured.
- The tag commit is the branch HEAD at the moment of tagging (documentation-only on top of `ec13101`).

### 6.2 Build #42 from the tag
Build from a checkout where `HEAD` = `v1.0.1^{commit}` (on the branch while it hasn't moved, or `git switch --detach v1.0.1`), clean tree. After the build, the EAS build's git commit must equal `v1.0.1^{commit}` — record both in the release notes. Section 7 has the command.

### 6.3 Master merge after 0060 is verified (GO, section 8 step 4a)
```powershell
git switch master
git pull --ff-only origin master
git merge --ff-only v1.0.1
git push origin master
```
- Merge **exactly the tag first**, so master's head = the build source = the tag.
- Documentation-only commits made on the branch after the tag may be fast-forwarded afterwards (`git merge --ff-only fix/auth-session-integrity`), after checking `git diff --stat v1.0.1 fix/auth-session-integrity -- . ':!*.md' ':!testing' ':!docs'` is empty and reviewing any `docs/` change (it publishes to quizvibe.se).
- Traceability: `v1.0.1` = Build #42's EAS git commit = the commit master first fast-forwards to.
- Do not merge or push `test/*` or `release/build40-update-gate`. No force-push, no branch deletion.

## 7. Production build configuration

| Setting | Value |
|---|---|
| Profile | `production` (channel `production`, `autoIncrement`, EAS environment `production`) |
| Supabase | `pyndqehlebtxochwpwex` (PROD) — verified in EAS production env |
| Env vars | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `EXPO_PUBLIC_REVENUECAT_IOS_KEY`, `EXPO_PUBLIC_YT_OWN_WRAPPER=1` (B1) in EAS production; `EXPO_PUBLIC_SPOTIFY_CLIENT_ID` from the profile — all present |
| Build number | #42 (verify with `npx eas build:version:get -p ios` right before) |
| Version | 1.0.1 |

Before building (read-only):
```powershell
npx eas env:list --environment production
npx expo config --type introspect
npx eas build:version:get -p ios
```
Build (GO, from a clean checkout of `v1.0.1`, section 6.2):
```powershell
npx eas build --profile production --platform ios --auto-submit
```
- `--auto-submit` **only uploads** the build to App Store Connect / TestFlight. It does **not** submit it for App Review; that is a separate manual action in App Store Connect (section 10).
- After the build: the build log must show env loaded from **production**; note the build number (expected 42) and runtime version (expected `32682a4…`; any production OTA must target it).
- ⚠ Never select #41 (or any `staging-testflight` build) in App Store Connect.

## 8. PROD cutover sequence (GO for each step)

Migration dependencies verified against the files:
- `0060` creates `deleted_account_tombstones` → must run **before** redeploying `delete-account` (otherwise deletes fail with `tombstone_failed`).
- `0061` standalone (profiles default; not tracked in `check-migrations.sql` — verify with the column-default query).
- `0062 → 0063 → 0064 → 0065 → 0066 → 0067 → 0070` in order: 0063 adds `device_mode`, 0064 the join trigger + `start_lobby_game` + `game_config`, 0065 `lobby_removed_players`, 0066 `lobby_turn_results`, 0067 rewrites the join trigger, 0070 adds `enforce_v2_join_client` reading `rooms.multiplayer_v2` and `device_mode`.
- `0068` independent (mentions of v2 objects are comments only); its Build 40 compatibility is already verified (C2, C5, C6, C7, C11), so it does **not** wait for Build 40 adoption to become negligible.
- `0069` standalone (`lobby_settings` filter columns).
- New `check-clips` needs 0068's `clip_blocklist`; it fails open without it.
- **Excluded from PROD on purpose:** `0013` (sketch_enabled, dead), `0016` (game_sessions, open `with check(true)` — never apply as written), `0017` (user_friends, unused). They exist on STAGING only; `check-migrations.sql` shows them as MISSING on PROD, which is correct.

Test accounts: every destructive test (deletes, the R6 upgrade, re-registration) uses a **dedicated PROD test account**, never a real user or the App Review accounts.

### Phase A — read-only pre-checks
| Step | Action | Verify |
|---|---|---|
| 1 | `check-migrations.sql` on PROD | 0001–0059 ✅ except 0013/0016/0017 (MISSING, correct); 0060–0070 MISSING |
| 2 | `select key, value from public.app_config where key in ('feature_gates','free_premium_promo','min_supported_build');` | `feature_gates` = `{"allAtOnce":"everyone","multiplayerV2":false}`; `free_premium_promo.until` is the intended campaign end (Peter confirms the date; placeholder was 2026-12-31, backstop `OFFER_BACKSTOP_UNTIL` 2026-12-31); no `min_supported_build` row |

### Phase B — migrations (multiplayerV2 stays OFF)
| Step | Action | Verify |
|---|---|---|
| 3 | Fresh PROD backup / PITR checkpoint | timestamp recorded |
| 4 | `0060` → redeploy `delete-account` (Verify JWT OFF, check the Code tab) | `check-migrations.sql` 0060 ✅; deleting a **dedicated test account** adds one row to `deleted_account_tombstones` |
| 4a | Fast-forward master to `v1.0.1` and push (section 6.3) | GitHub Pages deployment succeeds (Actions → "pages build and deployment" green, or `gh api repos/:owner/:repo/pages/builds/latest` = `built`); section 11 checks pass |
| 5 | `0061` | `select column_default from information_schema.columns where table_name='profiles' and column_name='images_enabled_categories';` → `'{}'::text[]` |
| 6 | **Build 40 smoke test** (public App Store 1.0.0): log in, host + join a game on two phones, play to Final Leaderboard, Re-match | works as before |
| 7 | `0062` (main SQL only, never the commented snippets), `0063`, `0064`, `0065`, `0066`, `0067` | `check-migrations.sql` all ✅; `feature_gates.multiplayerV2` still `false` |
| 8 | `0069`, then `0070` | `check-migrations.sql` 0069 + 0070 ✅. Never run `0070-staging-tests.sql` in PROD |
| 9 | **Build 40 smoke test** again (same as step 6, plus Pass-the-Phone and a guest join) | works as before (legacy rooms are untouched by the v2 migrations) |
| 10 | Email templates to PROD (section 12.1), after STAGING verification and separate approval; requires step 4a (hosted logo) | test mails on a dedicated PROD account show the new logo; links/codes work |

### Phase C — production TestFlight #42 (section 9)
| Step | Action | Verify |
|---|---|---|
| 11 | Build #42 (section 7) | build log env = production, build 42 |
| 12 | Run **P1–P5, P7, P8** with `multiplayerV2` **OFF** | all pass |
| 13 | `feature_gates.multiplayerV2 = true` | `select value from public.app_config where key='feature_gates';` → `{"allAtOnce":"everyone","multiplayerV2":true}` (**allAtOnce must be `everyone`**) |
| 14 | Run **P6** and the final smoke (P3 again) with this release configuration | all pass |

### Phase D — submission and release
| Step | Action | Verify |
|---|---|---|
| 14a | New 1.0.1 screenshots uploaded to App Store Connect (section 12.2), after separate approval | screenshots verified against #42 |
| 15 | Submit 1.0.1 build #42 for App Review in App Store Connect (section 10) | status "Waiting for Review" |
| 16 | After approval: manual release (Phased Release OFF) | status "Ready for Distribution" |
| 17 | Publish the Build 40 **gate-only** OTA from `release/build40-update-gate` (`a75b457`) — see "Gate OTA" below | runtime `4b73aa7…`; gate stays **inactive** (no `min_supported_build` row) |
| 18 | **Physical iPhone check:** on an iPhone with App Store 1.0.0 (Build 40), signed in to the **Swedish** App Store, open the App Store page / Updates → 1.0.1 is offered and installs | confirmed with screenshot/date |
| 19 | Activate Forced Update with the actual public build number, expected `{"ios": 42}`: `insert into public.app_config (key, value) values ('min_supported_build','{"ios": 42}'::jsonb) on conflict (key) do update set value = excluded.value, updated_at = now();` | Build 40 phone: "Update required" after the gate OTA is applied (2nd cold start); 1.0.1 phone: not blocked |
| 20 | `0068`, only after step 18 + 19: run `batch1-precheck.sql` (read-only) → show the result to Peter → explicit approval → fresh backup/PITR checkpoint → `supabase/rollback/0068_revert.sql` reviewed and at hand → apply `0068_security_guards.sql` → `check-migrations.sql` (0068 ✅) → smoke test on 1.0.1 (lobby, join, approve, game, Final Leaderboard re-match, Marathon re-match, delete a dedicated test account). Never run `batch1-staging-tests.sql` in PROD | all ✅ |
| 21 | Deploy the new `check-clips` (Verify JWT OFF, check the Code tab), then verify it: invoke with one live and one known-dead video id (or check Edge Function logs after a game) | live id reported alive, dead id reported dead; no errors in logs; a game still plays YouTube clips |
| 22 | 48 h monitoring | errors, joins, deletes, credits, Edge Function logs |

### Gate OTA (step 17) — requirements
- It must **preserve the Store text and all functionality of the currently published OTA** `e80008e0` (published 2026-10-29 with message "Store: expired free month copy (no voucher reference)"). The gate branch is `b6d08cc` + `e72e442` (Store copy, reconstructed 2026-11-26) + the gate.
- **Exact comparison is not possible from git:** EAS records `e80008e0`'s commit as `b6d08cc`, but the published bundle contained an uncommitted Store copy change (the working-tree flag is not recorded), and `e72e442` was committed afterwards from the message. **This comparison is unverified and must not be marked as passed.** Before publishing: download the `e80008e0` iOS bundle (from its manifest) and a local `npx expo export --platform ios` of `a75b457`, and diff the user-visible strings (at least `StoreScreen` around line ~1054, "Redeem a voucher code above"). Record the result; any difference other than the gate must be resolved first.
- LF-normalise `patches/*.patch`, then: `npx eas update --branch production --platform ios --environment production --message "Build 40: update-required gate"`.
- The gate stays inactive until step 18 confirms 1.0.1 is publicly available.

Not part of 1.0.1: `0046` server-premium cutover, `paid_subscription.enabled`, `pkg_sub_monthly`.

## 9. Production TestFlight acceptance (#42 against PROD)

Run after Phase B. P1–P5, P7, P8 with `multiplayerV2` **OFF** (step 12); P6 and the final smoke after `multiplayerV2 = true` with `allAtOnce = everyone` (step 14). Destructive tests use dedicated PROD test accounts.

| # | Test | Expected |
|---|---|---|
| P1 = R6 | **Upgrade public 1.0.0 (Build 40, App Store) → production 1.0.1 (expected Build 42, TestFlight).** Phone with the App Store 1.0.0 (Build 40), logged in to a **dedicated PROD test account**, a few games played, a Parent Control choice saved. Install the production-profile TestFlight 1.0.1 (#42) over it without deleting the app. Not #41 — that build talks to STAGING | Still logged in (same account, no re-login); local history/HCP/friends/saved lobbies reset (accepted); saved Parent Control choice kept; Marathon tables + H2H intact; no other account's data |
| P2 | Ghost-player regression in **legacy** rooms (`multiplayerV2` OFF): an approved guest joins and leaves before Start; play a **legacy Individual device** game and a **legacy Pass-the-Phone** game with a follower | Non-host (Individual device) and follower (Pass-the-Phone) live + Final Leaderboard show only real participants |
| P3 | Smoke as `Apple-2` (review account): create lobby → join from second phone → approve → play → Re-match → Store shows the free month | Works end to end against PROD |
| P4 | Hints question on #42 | Category-complete reveal, clues append at the bottom |
| P5 | YouTube clip plays with own wrapper (B1) | Plays, ends with QuizVibe logo |
| P6 | After `multiplayerV2 = true` + `allAtOnce = everyone`: two-device 1 by 1 and All at Once games; a Build 40 phone tries to join a v2 room | v2 flow works; Build 40 device can't join the v2 room |
| P7 | Delete a **dedicated PROD test account** | Tombstone row; re-registration with the same email/name blocked |
| P8 | Register a new **dedicated PROD test account** (after step 10) | Confirmation mail with the new branding arrives, link confirms and lands on `email-confirmed.html`; welcome mail arrives with the new logo; Hints off by default; mature content on |

## 10. App Store submission checklist

Upload vs submission: the EAS `--auto-submit` step only uploads #42 to App Store Connect / TestFlight. Submission for App Review is the manual "Add for Review" → "Submit" in App Store Connect, after Phase C.

- [x] B1 resolved (EAS production env, 2026-11-27)
- [ ] #42 built with production env (log verified) and uploaded to App Store Connect
- [ ] Phase A–C done and verified (section 8 steps 1–14)
- [ ] Section 9 P1–P8 pass
- [ ] Version 1.0.1, build **#42** selected (not #41)
- [ ] What's New text (UI + Multiplayer)
- [ ] New 1.0.1 screenshots uploaded and verified against #42 (section 12.2)
- [ ] Email templates in PROD updated and verified (section 12.1) before P8
- [ ] App Review Information: contact, `Apple-2` credentials, notes describing the two-device test (Apple-1 + Apple-2), All at Once vs 1 by 1
- [ ] **No IAP attached**, no paid features in the build (`pkg_sub_monthly` stays for 2.0.0)
- [ ] **Privacy declarations reviewed for 1.0.1** (not assumed unchanged): data types collected (incl. the deleted-account block — a one-way hash of the email + Player Name kept 12 months), purposes, linking to identity, third parties (Supabase, RevenueCat, YouTube, Spotify link-out), privacy policy URL current
- [ ] **Age rating reviewed for 1.0.1** (not assumed unchanged): theme-specific questions can be enabled by free users; mature content is ON by default for accounts without a saved choice and can be turned off; YouTube/film content; no user-generated content or chat
- [ ] Account deletion in-app ✅ (5.1.1(v))
- [ ] Manual release, Phased Release OFF
- [ ] After release: steps 17–22

## 11. GitHub Pages publication at the master merge (step 4a)

Pushing `master` triggers a GitHub Pages build (legacy, `master:/docs`, CNAME `quizvibe.se`). That is why the merge waits until 0060 is live (Peter 2026-11-27). The merge publishes:
- new site layout and CSS (`docs/_layouts/default.html`, `docs/assets/css/quizvibe.css`, brand assets incl. `quizvibe-logo-email.png`);
- redesigned `docs/email-confirmed.html` (the post-confirmation landing page);
- `docs/legal/privacy.md`: the new retention row for the **deleted-account block** (12 months), accurate once 0060 is live.

No GitHub Actions workflow runs on a push to master.

**Live today (checked 2026-11-27):** `/email-confirmed.html` 200 (old version), `/legal/privacy` 301 (redirect), `/assets/brand/quizvibe-logo-email.png` **404**, `/assets/css/quizvibe.css` **404** — the new assets only exist after the merge.

### email-confirmed.html — Build 40 / Build 42 compatibility
- Both builds send the same `emailRedirectTo: 'https://quizvibe.se/email-confirmed.html'` (verified in `b6d08cc` and HEAD), and resent links land on the Site URL homepage in both.
- The page is static (no script, no token handling): Supabase verifies the link server-side and only then redirects. Nothing on the page depends on the app build, so a page change can't break confirmation for either build.
- Still verify after publishing: confirm one signup created from Build 40 and one from Build 42 → both land on the new page, it renders on iPhone Safari, and the account can log in.

### After the Pages build (step 4a verify)
- Pages build status `built`, no errors.
- On iPhone Safari and desktop: `/`, `/legal/privacy` (shows the 12-month row), `/legal/terms`, `/legal/` index, `/email-confirmed.html`, `/assets/brand/quizvibe-logo-email.png` (200), `/assets/css/quizvibe.css` (200); CNAME still `quizvibe.se`, HTTPS valid; no broken links in the footer/legal navigation.
- The App Store "Privacy Policy URL" and the app's in-app legal links still resolve.

## 12. Mandatory release preparation (added 2026-11-27)

Neither activity blocks tagging or Build #42. Dependencies: 12.1 needs the master merge (step 4a) for the hosted logo and must be in PROD before P8; 12.2 must be done before App Review submission (step 15). No PROD or App Store Connect change without separate approval.

### 12.1 Email branding
Inventory (verify the dashboard list on both projects — the repo only holds some of them):

| Email | Source | Used by the app | Status |
|---|---|---|---|
| Confirm signup | Supabase dashboard template; repo `supabase/email-templates/confirm-signup.html` | Register, Resend link (email + Player Name via `resend-by-name`) | Repo version branded; **live = dashboard copy, must be pasted** |
| Reset password | Dashboard template; repo `supabase/email-templates/reset-password.html` | Forgot password (6-digit code, `verifyOtp` type `recovery`) | Repo version branded, tagline updated 2026-11-27; paste into dashboard |
| Change email address | Dashboard template only | Not triggered by the app (no `updateUser({ email })`) | Default Supabase template; brand it for consistency |
| Magic link, Invite user, Reauthentication | Dashboard templates only | Not used by the app | Default; brand or leave, but list as reviewed |
| Welcome mail | Edge Function `send-welcome-email` (HTML inline) | DB trigger 0049 after confirmation | Branded in repo, tagline updated 2026-11-27; deploy = redeploy the function (compare deployed code first) |

**Technical dependencies found:**
- All branded mails load `https://quizvibe.se/assets/brand/quizvibe-logo-email.png`, which is **404 until the master merge** (step 4a). Before that, a test mail shows a broken image.
- ✅ The PNG was re-rendered from the v2 logo (same file name, canvas 360×297, transparent) and committed in `b57fa17` before tagging; the site mark and the `email-confirmed.html` logo were also moved to v2. The merge publishes them.

Procedure:
1. ✅ Logo re-rendered and approved (`b57fa17`); taglines in reset password + welcome email set to "Play your way. Anytime. Anywhere." (text only). Remaining steps: checklist Part C (E3a–E6).
2. STAGING (any time): paste the templates into STAGING Auth → Emails → Templates; brand Change email and the unused ones; redeploy `send-welcome-email` on STAGING if changed. Check per template: the `{{ .ConfirmationURL }}` / `{{ .Token }}` / `{{ .Email }}` variables are byte-identical to the current working templates, the subject line, plain wording.
3. STAGING functional test on a phone (not desktop — link scanners consume tokens): signup → confirm link works → lands on `email-confirmed.html` → login; Resend link (email + Player Name); reset password code works; welcome mail arrives. Logo rendering can only be checked after step 4a.
4. After step 4a: re-check logo rendering in Apple Mail, Gmail (app + web) and Outlook on STAGING mails.
5. PROD (separate approval, step 10): paste the same templates into PROD; redeploy `send-welcome-email` on PROD if changed (Verify JWT OFF, check the Code tab); verify with a dedicated PROD test account. Must be done **before P8**.

### 12.2 App Store Connect screenshots
1. Shot list (6.9" required): Home with the new branding; Game Lobby (Game Mode 1 by 1 / All at Once, players with device icons); Get Ready; a question (YouTube Year and Hints with the new reveal); Final Leaderboard / Game Summary; Profile or Store. Show multiplayer with two or more players.
2. Capture on STAGING TestFlight #41 with the latest preview OTA (`5b056fd2`), using test accounts and neutral names; no STAGING-specific text visible.
3. Verify against the final production build #42: same UI, no differences in the captured screens; retake any screen that differs.
4. Upload to App Store Connect (separate approval) and replace all screenshots showing the previous UI, before step 15.

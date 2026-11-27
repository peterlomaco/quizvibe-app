# Build 41 (1.0.1) — release test checklists

Two checklists:
- **Part A** (R1–R11) verifies the changes since the 33 approved DEV tests. Nothing else is repeated.
- **Part B** verifies that live Build 40 clients behave in a controlled way against migrations 0068 + 0070 and the forced-update gate.

---

## Part A — R1–R11 (STAGING TestFlight build)

**Build:** QuizVibe **1.0.1 (41)**, commit `4b113e7`, profile `staging-testflight`.
- Supabase: STAGING (`tottbiuikbdarsjlpxwn`).
- Channel: `preview`.
- `EXPO_PUBLIC_YT_OWN_WRAPPER=1`.
- STAGING `feature_gates = {"multiplayerV2": true, "allAtOnce": "everyone"}`.
- 0001–0070 applied on STAGING.

**Devices:**
- **Phone 1** = TestFlight 1.0.1 (41).
- **Phone 2** = TestFlight 1.0.1 (41), needed for the multiplayer items.

⚠ **R6 is NOT run here.** It needs the production-profile TestFlight build (PROD, build #42) installed over App Store Build 40. See R6 below.

| # | Test | Steps | Expected |
|---|---|---|---|
| R1a | Parent Control preserved | Account that had Parent Control **ON** before this build. Open Profile → Host default settings → Filter. | "Include mature content" is **OFF**. Unchanged after relaunch. |
| R1b | Preserved: OFF | Account that had Parent Control **OFF**. | "Include mature content" is **ON**. |
| R1c | New account default | Register a new account → Profile → Filter. | "Include mature content" **ON**, "Include theme-specific questions" **OFF**. |
| R1d | Saved choice sticks | Change "Include mature content", Save, kill the app, reopen. | Your choice is kept (no reset). |
| R1e | Guest Host locked | Start Game as Guest → lobby. | Filter switches locked OFF; tap shows the locked info. |
| R2a | Mature OFF blocks restricted | Host, mature OFF → activate Hip Hop & RnB. | "Parent controlled" dialog; package not activated without "Deactivate now". |
| R2b | Theme switch ON | Generic game (no package), theme switch ON, 4+ rounds × a few games. | Theme-only clips can appear in Generic games; with mature OFF no Hip Hop/RnB items. |
| R2b-auto | Theme switch, automated (2026-11-27) | `cd backend; npx vitest run content/test/filterThemeQuestions.test.ts` | **PASS (12/12).** Real catalog: 257 theme-only items (48 Hip Hop/RnB, 209 other). Theme ON + mature OFF admits all 209 unrestricted and none of the 48; theme ON + mature ON admits all 257; theme OFF admits none. Source guards: no Premium input to the pool rule, and no Premium gate on the switch in Lobby, Profile, quiz or FilterGroup (only Guest Host is locked). Manual R2b still required for real gameplay. |
| R2c | Filter sync | Phone 1 hosts, Phone 2 joins. Host flips both Filter switches. | Phone 2 shows the host's values read-only within a few seconds. |
| R3a | Host leaves Final LB (All at Once) | Finish a game, Phone 1 (host) taps Home while Phone 2 is on the Final Leaderboard/Game Summary. | Phone 2: **no popup**, stays on the leaderboard, grey "The Host has left the game", **Start New Game** (QuizVibe user) + Home. Accept/Re-match not shown. |
| R3b | Start New Game after host left | Phone 2 taps Start New Game. | Normal new lobby (own room), credits/premium rules as usual. |
| R3c | No forced shutdown | Phone 2 stays on the Final LB for 2+ minutes after the host left. | No inactivity popup / forced exit. |
| R4 | Re-match fly-in | Host taps Yes on "Re-match …?" after Phone 2 closed Game Summary. Repeat with Phone 2 still in Game Summary. | Accept/Re-match flies from the centre to its place above Home; never animates behind Game Summary (appears after it closes). Approval count works; re-match lobby opens for both. |
| R5 | Countdown 1 by 1 | 1 by 1 game with one own-device player (Phone 2). Watch countdowns. | On the device that is NOT next, the next-player box is greyed; the active player's box is normal. |
| R6 | **Upgrade 40 → 41 (separate, production build)** | Phone with **App Store Build 40**, logged in to a PROD account, a few games played. Install **production-profile TestFlight 1.0.1 (#42)** over it. Open. | Still logged in (same account, no re-login). Local history/HCP/friends/saved lobbies reset (accepted). Parent Control as before (R1a/b). Server data (Marathon tables, H2H) intact. No zombie/other-account data. |
| R7a | v2: 1 by 1 | Phone 1 hosts, Phone 2 joins "On my own device", a host-device guest added. | 1 by 1 flow; hybrid turns work end-to-end; leaderboard + HCP saved. |
| R7b | v2: All at Once | Two own-device players, Premium/everyone gate. | All at Once flow end-to-end. |
| R7c | v2: Guest Host | Start Game as Guest, Phone 2 joins. | Guest Host on the resolver: 1 by 1 / All at Once rules as in Step 6–7; YouTube-only, 30 s. |
| R7d | v2: re-match | After R7a/b, re-match. | Same line-up, re-match lobby works; Marathon table updates once. |
| R7e | v2: join device step | Phone 2 joins by code. | Device step shown; "On the host's device" rejected with Spotify on / > 4 players. |
| R8 | Legacy room after flip | **Approved by Peter 2026-11-27** (temporary STAGING flag change, restore to true afterwards). Steps in "R8 procedure" below. | Room keeps legacy behaviour (Pass-the-Phone / Individual device labels, no device step), game completes. New rooms after the flip are v2. |
| R9a | YouTube own wrapper | Play 3+ YouTube questions (music + film). | Clips play with audio; autoplay works; no error 153 / "Video unavailable". |
| R9b | Mute + end overlay | Non-host muted device; let a clip end. | Muted device silent; end-of-clip QuizVibe overlay appears. |
| R9c | Clip swap | (If a dead clip appears) | "Clip unavailable" handling swaps the question as before. |
| R10a | Background music | Home → Lobby → Get Ready → Hints question → Final Leaderboard. | Home loop, Part 1, Part 2 (Hints), Part 3 after the fireworks; no music during countdown/YouTube/Spotify. |
| R10b | Other app's audio | Start Spotify/Apple Music, then open QuizVibe. | QuizVibe background music stays silent; the other app keeps playing. |
| R10c | Background | Send QuizVibe to the background with music playing. | Music stops; does not play in the background. |
| R11a | Gate: no requirement | Normal use (STAGING has no `min_supported_build`). | Never blocked. |
| R11b | Gate: block | STAGING SQL: set `min_supported_build = {"ios": 42}`. Background the app ≥ 60 s, foreground. | Full-screen "Update required"; music stops; Update opens the App Store page. |
| R11c | Gate: offline | While blocked, enable airplane mode, kill + reopen. Airplane mode off afterwards. | Still blocked (confirmed requirement kept). |
| R11d | Gate: direct recovery | While **still blocked on `{"ios": 42}`** (no lowering first): delete the row. Background ≥ 60 s, foreground (online). | Unblocks straight from the active "Update required" screen; app usable, music resumes where it belongs. |
| R11e | Gate: supported | Set `{"ios": 41}`. Background ≥ 60 s, foreground. | Build 41 is NOT blocked. Afterwards delete the row again. |

**R8 procedure (STAGING):**
1. Flag off:
   ```sql
   update public.app_config set value = jsonb_set(value,'{multiplayerV2}','false'::jsonb), updated_at = now() where key = 'feature_gates';
   ```
2. Phone 1: kill the app fully and reopen it (the flag is read at app start). Create a Multiplayer lobby and note its room code. Expected labels: Pass-the-Phone / Individual device.
3. Flag back on:
   ```sql
   update public.app_config set value = jsonb_set(value,'{multiplayerV2}','true'::jsonb), updated_at = now() where key = 'feature_gates';
   ```
4. Phone 2: kill + reopen (now on true), then join Phone 1's room by code. Expected: **no device step**; joins the legacy room; host approves; play a short game (2 rounds) to the end.
5. Phone 1: Home → kill + reopen → create a NEW Multiplayer lobby; Phone 2 joins by code. Expected: v2 (1 by 1 / All at Once labels, device step shown).
6. Confirm: `select r.code, r.multiplayer_v2 from public.rooms r where r.code in ('<legacy code>','<new code>');` → legacy `false`, new `true`.

**Final STAGING configuration check (after all Part A tests):**
```sql
select key, value from public.app_config where key in ('feature_gates','min_supported_build');
```
Expected: exactly one row, `feature_gates` = `{"allAtOnce":"everyone","multiplayerV2":true}`; no `min_supported_build` row.

### Part A results — round 1 (Peter, 2026-11-27, STAGING TestFlight #41 on both iPhones)
| # | Result | Observed |
|---|---|---|
| R1a–R1d | **PASS** | |
| R1e | **PASS** (by design) | The Guest Host lobby doesn't show the Filter group at all, so it can't be changed. Correct for the stripped-down guest lobby. |
| R2a | **PASS** | |
| R2b (automated) | **PASS** | See R2b-auto: real catalog + no-Premium-gate source guards, 12/12. |
| R2b (manual) | **pending** | Theme-only clips in Generic games during real play were not separately reported. |
| R2c | **PASS** | |
| R3a, R3b | **PASS** | |
| R3c | **pending** | Not run yet. |
| R4 + R7d | **PASS** | |
| R5 | **PASS** | |
| R6 | **deferred** | Runs only on the final production TestFlight build (#42) over App Store Build 40. |
| R7a, R7b, R7c, R7e | **PASS** | |
| R8 | **PASS** | The legacy lobby kept its behaviour across the flag flip, and the new lobby `CQ75CX` = `multiplayer_v2 true`. Only the new lobby's code was checked in SQL; the legacy lobby is confirmed by its in-app behaviour. |
| R9a | **PASS** | |
| R9b | **PASS** | |
| R9c | **N/A** (not passed) | No dead clip occurred, so the swap path was not exercised. |
| R10a | **PASS** (Hints fix verified in round 2) | Music works. Hints finding fixed in `ec13101` (category-complete reveal) and verified on both iPhones via STAGING OTA `5b056fd2` — see round 2. |
| R10b, R10c | **PASS** | |
| R11a–R11e | **PASS** | Includes R11d direct recovery from an active block. |
| Final STAGING config | **verified** | Only `feature_gates` = `{"allAtOnce":"everyone","multiplayerV2":true}`. |

Ghost-player regression (`e909500`) is deferred to #42.

### Part A results — round 2 (Peter, 2026-11-27), STAGING OTA on TestFlight #41
**OTA:** update group `5b056fd2-c968-4da4-9d1b-6ef95beb020a` (iOS `01a21d9c-a930-7780-84cc-3f4a7d359f6b`), branch/channel `preview`, runtime `32682a4fbe103e5a00a729c3a53f0b033a4d225f`, commit `ec13101`, EAS env `preview` (STAGING). Production (`e80008e0`) and `build40-compat-test` (`fe4319dd`) unchanged.

| # | Result | Observed |
|---|---|---|
| Step 0: OTA on both phones | **PASS** | Both iPhones run the new update (new Hints layout visible). |
| R10a / Test A: Hints category-complete reveal | **PASS** | Clues only added at the bottom, headings complete in order, Other last, Profession under Birth & Career, auto-scroll keeps the newest clue visible; identical order on both phones (All at Once). |
| Test B1: ghost players, Individual device (legacy) | **PASS** | Final Leaderboard on the non-host shows only real participants. |
| Test B2: ghost players, Pass-the-Phone follower (legacy) | **PASS** | Live + final leaderboard show only real participants. |
| STAGING restore after Test B | **verified** | Only `feature_gates` = `{"allAtOnce":"everyone","multiplayerV2":true}`. |
| R3c | **pending** | Not run. |
| R2b (manual) | **pending** | Not run. |
| R6 | **deferred** | Final production TestFlight build (#42). |
| Ghost-player check on production build | **deferred** | Repeat on #42 (legacy path). |
---

## Part B — Build 40 compatibility (0068 + 0070 + gate)

**Status: prepared, NOT built.** It needs Peter's explicit go.

**Build:**
- Branch `test/build40-compat` (`d32aa8a`, worktree `..\qv-build40-compat`).
- Code: Build 40 (`b6d08cc`) + the 2026-10-29 OTA text (`e72e442`) + a test-only profile:
  - profile `build40-compat`: internal (ad-hoc), environment `preview` = STAGING, channel `build40-compat-test`;
  - `appVersionSource: local` + `ios.buildNumber "40"`, so the binary reports **CFBundleVersion 40** and **does not consume a remote/production build number**.
- Command (after go): `eas build --profile build40-compat --platform ios` from `..\qv-build40-compat`.
- Fingerprint `66d6edf…`. It differs from Build 40's `4b73aa7` only because `eas.json` changed; the code is Build 40's.

**Gate OTA for the test build:**
- Branch `test/build40-compat-gate` (`08ef8b6`), same fingerprint `66d6edf…`.
- Publish (after go): LF-normalize `patches/*.patch`, then `npx eas update --branch build40-compat-test --platform ios --environment preview --message "TEST: Build 40 gate"`.

⚠ Same bundle id `se.quizvibe.app`: installing the ad-hoc build **replaces** the QuizVibe app on that phone. Don't use the phone that holds App Store Build 40 for R6. The device must be registered for ad-hoc (`eas device:list`).

**Devices:**
- **B40** = Build 40 compat build (STAGING).
- **B41** = TestFlight 1.0.1 (41) (STAGING).

**STAGING has 0068 + 0070 applied.** Some legacy-room cases need `multiplayerV2 = false` temporarily, which is Peter's go per change. That is also the PROD state between steps 6 and 7 of the cutover.

### B1 — without the gate OTA

| # | Scenario | Steps | Expected (controlled) |
|---|---|---|---|
| C1 | Build 40 host, legacy room | B40 creates a multiplayer lobby (always legacy). B41 joins by code. | Join works (no device step); host approves; game completes on both. |
| C2 | Build 40 approve (0068) | In C1, B40 host approves/un-approves B41. | Works; B41 cannot approve itself. |
| C3 | Build 40 non-host in legacy room | Flag false → B41 creates lobby (legacy) → B40 joins by code. | Join works; host approves; game completes. |
| C4 | Build 40 guest join, legacy | As C3 but B40 uses "Join with Room Code — guest". | Works. |
| C5 | Rejoin, legacy | In C3, B40 Leave → rejoin with the same code. | Rejoin works; host sees B40 again (approval per 0068 rules). |
| C6 | Re-match carry-over, Build 40 host | After C1, B40 host Re-match → B41 accepts. | B41 lands in the re-match lobby with its seat (claim succeeds); game starts. |
| C7 | Re-match carry-over, Build 40 joiner | After C3, B41 host Re-match → B40 accepts. | B40 claims its seat (0068 `_lobby_seat_owner`), stays approved, game starts. **Key 0068 risk — record exactly what happens.** |
| C8 | Build 40 joins a v2 room (0070) | Flag true → B41 creates lobby (v2) → B40 joins by code (registered). | B40 shows its own lobby view but never appears for the host; no crash; Leave returns to Home. Host can start without B40. No orphan row. |
| C9 | Build 40 guest joins a v2 room | As C8 with guest join. | Same as C8. |
| C10 | Invite Build 41 → Build 40 | B41 (v2 room) invites B40's player name. B40 accepts. | Invite arrives; accept behaves like C8 (rejected join, controlled). |
| C11 | Invite Build 40 → Build 41 | B40 (legacy) invites B41. | Invite arrives (sender set server-side by 0068); accept joins the legacy room. |
| C12 | Remote 1vs1 | B40 creates H2H, B41 joins (registered both). | Match plays; results on both. |
| C13 | Clip error report | If a dead clip occurs on B40. | No visible error (report insert allowed; reporter defaults to auth.uid()). |
| C14 | Account | B40: register + confirm, then delete a test account. | Works; delete-account writes the tombstone. |
| C15 | Single player | B40 single player game. | Unchanged. |

### B2 — with the gate OTA (after publishing to `build40-compat-test`)

**Published 2026-11-26:**
- Update group `fe4319dd-104c-441d-9cc1-2240eefa2f9d` (iOS update `01a21a0f-a310-7619-be25-4e4dd2c32c24`).
- Branch/channel `build40-compat-test`, runtime `build40-compat-1`, environment `preview` (STAGING), commit `6842839`.
- `production` (still `e80008e0`) and `preview` (still `9a4b0555`) are untouched.

**Run order (Peter):** C10, C8, C9, C14 first (with `multiplayerV2 = true`), then G1–G5. After G-tests: `min_supported_build` row deleted and `multiplayerV2` still `true` on STAGING.

| # | Scenario | Steps | Expected |
|---|---|---|---|
| G1 | OTA delivery | Cold-start B40 twice. | Second start runs the OTA (gate inactive: no row). Store copy unchanged ("Free month used — you continue on the free Basic plan"). |
| G2 | Block Build 40 | STAGING `min_supported_build = {"ios": 41}`. Foreground B40 and B41. | B40: "Update required" (blocks all screens). B41: not blocked. |
| G3 | Offline | B40 blocked → airplane mode → kill + reopen. | Still blocked. |
| G4 | Unblock | Delete the row → foreground B40. | Unblocked. |
| G5 | No OTA yet | Fresh install of the compat build (no OTA fetched), row set. | **Not** blocked on the first launch (OTA not applied yet) — joins into v2 rooms are still rejected by 0070 (C8). Blocked after the second cold start. Documents the residual window. |

### Recording results
For each C/G item, record PASS/FAIL plus what was seen. Deciding 0068 for PROD needs C2, C5, C6, C7 and C11, plus the EAS adoption of runtime `4b73aa7` after the real Build 40 OTA.

### Results — round 1 (Peter, 2026-11-26)
**Setup:**
- iPhone 1 = TestFlight 1.0.1 (41), STAGING.
- iPhone 2 = compatibility build 1.0.0 (40), STAGING, no gate OTA.
- Two different registered accounts.
- STAGING has 0068 + 0070 applied and `multiplayerV2 = true`.

| # | Result | Observed |
|---|---|---|
| C10 | **PASS (UX as designed)** — DB check pending, see below | Build 41 (v2 room) invited Build 40; Build 40 received and accepted. Build 40 shows its own lobby, unapproved; the Build 41 host never sees it. This is the documented 0070 rejection: Build 40 only `console.warn`s the failed join. |
| C11 | **PASS** | Build 40 (legacy room) invited Build 41; Build 41 received, accepted, appeared in the host's lobby. |
| C1 | **PASS** (via invite instead of room code) | Build 41 joined Build 40's legacy lobby and the game completed. |
| C2 | **PASS** (round 2) | Build 40 host approved Build 41; approval works under 0068. |
| C6 | **PASS** (round 2) | Build 40 host → full game → Re-match / Play Again → both players carried over to the new lobby, approval works, next game starts. Build 41 claimed its re-match seat under 0068 (`claim_carry_over_row` + seat owner). |
| C7 | **open** | The reverse direction (Build 41 host, Build 40 claims its seat) is NOT covered by round 2. It needs `multiplayerV2 = false` on STAGING. |

**DB check for C10** (STAGING SQL Editor, read-only). Expect **zero** rows for the Build 40 account in v2 rooms:
```sql
select r.code, r.multiplayer_v2, r.created_at, lp.player_id, lp.name, lp.type,
       lp.is_host, lp.approved, lp.has_left, lp.device_mode, lp.user_id
from public.rooms r
join public.lobby_players lp on lp.room_code = r.code
where r.created_at > now() - interval '1 day'
order by r.created_at desc, lp.is_host desc;
```
- In the Scenario A room (`multiplayer_v2 = true`), only the Build 41 host (and any other Build 41 joiners) should appear. Nothing should have Build 40's `user_id` or `device_mode` null on a non-host row.
- In the Scenario B room (`multiplayer_v2 = false`), Build 40 is the host and Build 41 is a non-host with `device_mode` null.

### Results — round 4 (Peter, 2026-11-26), STAGING `multiplayerV2 = false`, Build 41 host + Build 40 participant
| # | Result | Observed |
|---|---|---|
| C3 | **PASS** | Build 40 joins a Build 41 legacy lobby by code; approval + game OK. |
| C4 | **PASS** | Build 40 guest join into a Build 41 legacy lobby OK. |
| C5 | **PASS** | Build 40 leave + rejoin OK under 0068. |
| C7 | **PASS** | Build 41 host Re-match → Build 40 accepts, claims its seat (0068 `_lobby_seat_owner`), stays approved, next game OK. |

Both critical re-match directions (C6, C7) now pass. The ghost-player display on Build 40 after an approved guest left is the known existing bug (round 3), fixed in 1.0.1 only.

### Results — round 5 (Peter, 2026-11-27), STAGING `multiplayerV2 = true`, Build 41 host (v2 room) + Build 40 joiner by room code
| # | Result | Observed |
|---|---|---|
| C8 | **PASS** (both physical iPhones) | Registered Build 40 user joined the Build 41 Multiplayer v2 lobby by room code and never appeared in the host's lobby (0070 `update_required` rejection). |
| C9 | **PASS** (both physical iPhones) | Build 40 guest joined the same way and never appeared in the host's lobby. |

**DB check (2026-11-27, STAGING, room `SM50MN`, created 08:23 UTC, `multiplayer_v2 = true`): PASS.** Run while the Build 40 guest sat in its own lobby view. The query returned exactly 1 row: the Build 41 host `Peter-99` (`is_host = true`, `approved = true`, `has_left = false`). There were no rows for the registered Build 40 user or the guest. The rejected joins wrote nothing.
- The host row has `device_mode = NULL`. That's expected: `device_mode` is written only by a joiner's own join write, and the host is treated as `own` by the resolver.

- **C14 PASS (Peter, 2026-11-27):** Peter registered, confirmed and deleted the account `Lomaco` on Build 40 against STAGING without errors. `deleted_account_tombstones` has a new top row `Lomaco` with `deleted_at` 2026-11-27 08:34:33 UTC and a hashed email.
- **G1 PASS (Peter, 2026-11-27):** Peter cold-started Build 40 twice with the gate OTA on `build40-compat-test` and no `min_supported_build` row. No visible change and no block, as expected while the gate is inactive.
- **G2 PASS (Peter, 2026-11-27):** with `min_supported_build = {"ios": 41}` on STAGING, Build 40 shows "Update required". The 1.0.1 device (Peter wrote "build42"; the only 1.0.1 build that exists is STAGING TestFlight #41) is not blocked.
- **G3 PASS:** Build 40 stays blocked in airplane mode after a kill + reopen.
- **G4 PASS:** after the row was deleted, foregrounding Build 40 removed the block.
- **G5 PASS (Peter, 2026-11-27):** compatibility build `9e504e22` reinstalled fresh with `min_supported_build = {"ios": 41}` set beforehand. The first launch was not blocked (embedded Build 40 JS, OTA downloading). The second cold start applied the OTA and showed "Update required". This documents the expected one-launch adoption window. **Final STAGING cleanup verified:** `min_supported_build` deleted; `app_config` returns only `feature_gates` = `{"allAtOnce":"everyone","multiplayerV2":true}`. **Part B is complete (G1–G5 PASS).**
- **Cleanup verified:** `app_config` returns only `feature_gates` = `{"allAtOnce":"everyone","multiplayerV2":true}`, and there is no `min_supported_build` row.
- **C10 also re-run in `SM50MN` (Peter, 2026-11-27):** before the query, the Build 41 host invited the Build 40 player and Build 40 accepted. The same single-row result covers the invite path too, so the C10 DB check is a **PASS**.

### Finding — ghost players on the non-host Final Leaderboard (round 3, Peter 2026-11-26)
**Setup:** STAGING, `multiplayerV2 = false` (legacy room), Build 41 host, Build 40 non-host.

**Observed on Build 40:**
- Two guests joined from the Build 40 device, were approved, then left before the start.
- Peter-1 joined from the same device, and the game was played by Peter-1 + Peter-99.
- The Build 41 host showed 2 players (correct).
- The Build 40 non-host showed 4: the left guests with 0 answers and 2 connection errors each.

**Cause:**
- The non-host's legacy roster (`goToQuizAsNonHost`) kept `approved || isHost` rows from `get_lobby_roster`, which also returns left rows (`has_left = true`, `approved` still true).
- **This bug already exists in live Build 40.** It isn't caused by mixing versions or by 0068/0070.
- v2 rooms were never affected (frozen server roster).

**Build 41 fix (commit on `fix/auth-session-integrity`):**
- `buildNonHostRoster` in `src/utils/nonHostRoster.ts` excludes `hasLeft` in legacy rooms. The v2 frozen roster is unchanged.
- One helper is used by every non-host path: Individual Devices, the Pass-the-Phone "Follow leaderboard" follower, and v2 own-device.
- Vitest: `backend/content/test/nonHostRoster.test.ts`, 8 tests.
- Build 40 is not fixed (its OTA stays gate-only); the bug disappears as Build 40 is forced to update.

**Regression item for the production-profile TestFlight run (#42), legacy path:**
- Needs `multiplayerV2 = false` on the test environment.
- Two devices on 1.0.1: approve a guest, the guest leaves before the start, play a game.
- Non-host Final Leaderboard (Individual Devices) and the Pass-the-Phone follower view show only real participants.
- Not covered by the STAGING build #41 (built before the fix).

**Mandatory before approving the 1.0.1 RC (decided 2026-11-26):**
1. **C10 DB check — DONE (PASS, round 5, `SM50MN`):** no row for Build 40 in the v2 room.
2. **C8 + C9 — DONE (PASS, round 5):** Build 40 joins a Build 41 v2 room **by room code**, registered and as guest. This is the most likely real path (a shared code), and it has a different client path from the invite.
3. **C14 — DONE (PASS, round 5, tombstone `Lomaco`):** register + delete account on Build 40 against STAGING (0060 tombstone + current `delete-account`). 0060 and the function redeploy go to PROD while Build 40 is still live.
4. **G1 + G2 — DONE (PASS, round 5; G3 + G4 also PASS):** the gate OTA reaches the test build and blocks build 40 at `min_supported_build = 41` while Build 41 stays unblocked. It needs a go to publish the test OTA to `build40-compat-test`. This proves the forced-update path before the real Build 40 OTA.

**Mandatory before 0068 goes to PROD:** C7 + C5 — **DONE (PASS, round 4)**. All 0068-relevant Build 40 paths are now device-tested: C2, C5, C6, C7, C11.

**Status after round 4:** C1–C7 and C11 PASS, C10 UX PASS. Still open and mandatory: items 1–4 above (C10 DB check, C8 + C9, C14, G1 + G2). C8 + C9 need `multiplayerV2 = true` again on STAGING.

**Status after round 5 (2026-11-27):** C1–C11 and C14 PASS, including the C10 DB check: room `SM50MN`, with the invite, the room-code join and the guest join all rejected and no row written. G1–G5 PASS, and the final STAGING cleanup after G5 is verified. **Part B is complete.** After G5, install STAGING TestFlight #41 on both iPhones and run the targeted R tests. **R6 stays deferred** until the production-profile TestFlight (#42) exists. The ghost-player regression item (`e909500`, below) stays on the list for #42.

**G5 procedure (STAGING, compatibility build):**
1. Use the iPhone that has the Build 40 compatibility build (EAS `9e504e22`). It must not be the phone with App Store Build 40.
2. Delete the QuizVibe app from that iPhone, so no downloaded OTA is left on the device.
3. Before reinstalling, set the row in the STAGING SQL Editor:
   ```sql
   insert into public.app_config (key, value) values ('min_supported_build', '{"ios": 41}'::jsonb)
   on conflict (key) do update set value = excluded.value, updated_at = now();
   ```
4. Reinstall the compatibility build from its EAS install link (build `9e504e22`). Keep the network on.
5. **First launch:** open the app and wait ~15 s on Home.
   - Expected: **not** blocked. It runs the embedded Build 40 JS, which has no gate, while the gate OTA downloads in the background.
   - Optional: from that first session, join a v2 lobby created on Build 41 by room code. The Build 41 host must not see Build 40; 0070 still protects the room.
6. Fully close the app (swipe it away), then open it again (2nd cold start).
   - Expected: the OTA is applied and "Update required" is shown.
   - If it isn't blocked yet, close and reopen once more. A slow download can push the switch to the 3rd start. Note how many starts it took.
7. Record the result in the G5 row.

**Final STAGING cleanup after G5:**
```sql
delete from public.app_config where key = 'min_supported_build';
select key, value from public.app_config where key in ('feature_gates','min_supported_build');
```
Expected: only `feature_gates`, with `{"allAtOnce":"everyone","multiplayerV2":true}`. The compatibility build stays installed; it does no harm, and the next step replaces it with TestFlight #41.

**Part B final tally (2026-11-27):**
- **Passed on devices:** C1, C2, C3, C4, C5, C6, C7, C8, C9, C10 (UX + DB check), C11, C14, G1, G2, G3, G4, G5.
- **Optional, NOT executed:** C12 (Remote 1vs1 B40 ⇄ B41), C13 (clip error report from B40; needs a dead clip), C15 (B40 single player). They are untested, not passed. The server side they touch is covered by `0070-staging-tests.sql` and the Batch 1 suite.
- G1: "no visible change" was confirmed; the Store copy was not separately compared.

**Remaining (full list):**
- **Now (flag stays true):**
  - C2 (explicit approve on Build 40);
  - **C6** (Build 40 host re-match → Build 41 accepts);
  - C8 (Build 40 joins v2 by room code) + C9 (Build 40 guest join, v2);
  - C12, C13, C15 (optional, not executed); C14 PASS;
  - after the test-gate OTA is published (needs go): G1–G5.
- **Needs STAGING `multiplayerV2 = false` temporarily (Peter's go)** so Build 41 creates legacy rooms with Build 40 as non-host:
  - C3, C4, C5 (Build 40 leave + rejoin);
  - **C7** (Build 41 host re-match → Build 40 accepts and claims its seat under 0068).
  - Restore with `true` afterwards.

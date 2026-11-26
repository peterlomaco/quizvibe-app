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
| R8 | Legacy room after flip | Needs STAGING `multiplayerV2 = false` temporarily (Peter's go): create a lobby on Phone 1, then set the flag back to true, Phone 2 joins the SAME room. | Room keeps legacy behaviour (Pass-the-Phone / Individual device labels, no device step), game completes. New rooms after the flip are v2. |
| R9a | YouTube own wrapper | Play 3+ YouTube questions (music + film). | Clips play with audio; autoplay works; no error 153 / "Video unavailable". |
| R9b | Mute + end overlay | Non-host muted device; let a clip end. | Muted device silent; end-of-clip QuizVibe overlay appears. |
| R9c | Clip swap | (If a dead clip appears) | "Clip unavailable" handling swaps the question as before. |
| R10a | Background music | Home → Lobby → Get Ready → Hints question → Final Leaderboard. | Home loop, Part 1, Part 2 (Hints), Part 3 after the fireworks; no music during countdown/YouTube/Spotify. |
| R10b | Other app's audio | Start Spotify/Apple Music, then open QuizVibe. | QuizVibe background music stays silent; the other app keeps playing. |
| R10c | Background | Send QuizVibe to the background with music playing. | Music stops; does not play in the background. |
| R11a | Gate: no requirement | Normal use (STAGING has no `min_supported_build`). | Never blocked. |
| R11b | Gate: block | Peter's go: STAGING SQL `insert into app_config (key, value) values ('min_supported_build', '{"ios": 42}');` Bring the app to the foreground. | Full-screen "Update required"; music stops; Update opens the App Store page. |
| R11c | Gate: offline | While blocked, enable airplane mode, kill + reopen. | Still blocked (confirmed requirement kept). |
| R11d | Gate: clear | `delete from app_config where key = 'min_supported_build';` Online, foreground the app. | Unblocks on the next foreground. |
| R11e | Gate: supported | Set `{"ios": 41}`. | Build 41 is NOT blocked. Afterwards delete the row again. |

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

| # | Scenario | Steps | Expected |
|---|---|---|---|
| G1 | OTA delivery | Cold-start B40 twice. | Second start runs the OTA (gate inactive: no row). Store copy unchanged ("Free month used — you continue on the free Basic plan"). |
| G2 | Block Build 40 | STAGING `min_supported_build = {"ios": 41}`. Foreground B40 and B41. | B40: "Update required" (blocks all screens). B41: not blocked. |
| G3 | Offline | B40 blocked → airplane mode → kill + reopen. | Still blocked. |
| G4 | Unblock | Delete the row → foreground B40. | Unblocked. |
| G5 | No OTA yet | Fresh install of the compat build (no OTA fetched), row set. | **Not** blocked on the first launch (OTA not applied yet) — joins into v2 rooms are still rejected by 0070 (C8). Blocked after the second cold start. Documents the residual window. |

### Recording results
For each C/G item, record PASS/FAIL plus what was seen. Deciding 0068 for PROD needs C2, C5, C6, C7 and C11, plus the EAS adoption of runtime `4b73aa7` after the real Build 40 OTA.

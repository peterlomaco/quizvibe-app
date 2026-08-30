# QuizVibe — Pre-Launch Checklist

Internal doc (kept at repo root, NOT under `docs/` which publishes to quizvibe.se).
Generated from the 2026-08-30 pre-launch code review. Full findings + remediation
status: `.claude/plans/` (or ask Claude for the review summary).

Legend: 🔴 must-do before shipping · 🟡 verify / be aware · ✅ already done.

---

## 0. Ship the review fixes (they're in source, not yet in a build)

The client fixes below are committed to source and will ship with your next EAS
build. They were found by **reading** code — verify on device (§2) before trusting.

- [ ] Cut a fresh EAS build (dev/TestFlight) that includes the review fixes.
- [ ] Merge the improved nightly workflow to `master` (scheduled cron only runs the
      default-branch version — see §1).

---

## 1. Content-health cron (YouTube + Spotify nightly)

Catches dead YouTube clips / dead-or-wrong Spotify track IDs before players hit them.
Workflow: `.github/workflows/youtube-validate-nightly.yml` (reworked so DEGRADED ≠ red,
transient API errors don't red, Spotify identity-audit fails on wrong-song).

- [ ] 🔴 Confirm `YOUTUBE_API_KEY` exists: GitHub → Settings → Secrets and variables →
      Actions. If missing, create a YouTube Data API v3 key (Google Cloud Console →
      enable API → create key) and add it. Without it, the `youtube-validate` step
      hard-fails every night.
- [ ] Verify end-to-end now (don't wait for 06:00 UTC): Actions → youtube-validate-nightly
      → Run workflow → branch `feat/quiz-next-countdown` → `apply_fixes = false` → Run.
      - [ ] `Run youtube-validate` step green (red only if a genuinely dead item — log names it).
      - [ ] `spotify-validate` + `spotify-identity-audit` steps green.
      - [ ] `spotify-track-identity.md` artifact uploaded.
- [ ] 🔴 Merge the workflow to `master` so the scheduled cron uses the new item-level logic
      (until then the nightly runs the OLD per-clip version from `master`).
- [ ] (Optional) Add a Slack/Discord webhook for failure alerts; GitHub emails the repo
      owner by default.

Note: `permissions: contents: write` was added to the job so the auto-apply commit path
(manual `apply_fixes=true` only) can push under the default read-only token.

---

## 2. On-device verification of the review fixes

Use a **real dev/TestFlight build** (NOT Expo Go — Spotify install-check + IAP are inert
there). Most tests need **two devices** in an **Individual Devices** game with **Spotify enabled**.

### A1 — Spotify DJ-handover deadlock (Critical)
- [ ] IndDev game, Spotify question, second device is the DJ. DJ opens Spotify + starts track; let timer run to reveal.
- [ ] Mid-reveal, **force-quit the DJ app** (or kill its WiFi) BEFORE it taps "End DJ".
- [ ] **Expect:** host is NOT stuck. After ~12 s a **"Continue without DJ →"** button appears; tapping it advances the game.
- [ ] Happy path: DJ taps "End DJ" normally → host advances immediately (3× retry shouldn't change this).

### C1 — YouTube alternate-clip fallback
- [ ] Temporarily edit a catalog item that has **two `youtubeClips`** so the *first* clip's `videoId` is bogus/dead; run `npm run export-music-questions`.
- [ ] Play that question. **Expect:** brief error, then it plays the **second clip** — NOT "Video unavailable / auto-0".
- [ ] Revert the edit + re-export.

### B1 — 20 Hz re-render perf fix
- [ ] On a mid-range device, during the answer phase (timer running + media playing) the UI is smooth with no periodic hitching.
- [ ] (Optional, dev build) React DevTools profiler: quiz screen re-renders ~1×/sec, not ~20×/sec, while `AnswerStopwatch` ticks on its own.

### A2 — DJ-away dead-air
- [ ] Spotify game where the DJ never starts the track: visible skip countdown now begins after ~45 s (was ~4 min).

---

## 3. App Store readiness

### 🔴 Critical — verify before the next production build
- [ ] **Production build env vars.** App reads 5 `EXPO_PUBLIC_*` vars; `eas.json` production
      `env` only provides `EXPO_PUBLIC_SPOTIFY_CLIENT_ID`. Confirm the other four are
      registered as EAS Environment Variables (production):
      `eas env:list --environment production` should show
      `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
      `EXPO_PUBLIC_REVENUECAT_IOS_KEY`, `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`.
      If missing, a cloud build ships with **no Supabase backend + RevenueCat no-op'd**.
      (Local `expo start` reads `.env`; a cloud EAS build does not.)

### 🟡 Verify / be aware
- [ ] **iOS Privacy Manifest.** No committed `PrivacyInfo.xcprivacy`. AsyncStorage uses a
      required-reason API (NSUserDefaults, CA92.1). Expo usually auto-generates the
      aggregated manifest at prebuild — but watch for an Apple **ITMS-91053** warning email
      after upload; if it arrives, add the declaration (`expo-build-properties` or a manifest config).
- [ ] **IAP / free-promo.** During the launch campaign the only "purchase" is the 0-kr claim
      (no StoreKit), so v1.0 has no reachable purchasable IAP. Submit v1.0 with **no IAP
      product attached to the version**; submit `pkg_sub_monthly` with the later update that
      ends the campaign.
- [ ] **New Architecture + React Compiler both ON** (`newArchEnabled`, `experiments.reactCompiler`).
      Verify the app on a real EAS build (the compiler doesn't run in Expo Go).
- [ ] **EAS Update OTA into TestFlight** (flagged unverified in CLAUDE.md): from a TestFlight
      build, `eas update --branch production` with a trivial change, relaunch twice, confirm
      via `eas update:view` that the build fetched it.

### ✅ Already good (no action)
- ASC API key (`.p8`) + `.secrets/` gitignored and untracked — no key exposure.
- `expo-updates ~29.0.20` present; EAS Update configured (fingerprint policy).
- `ITSAppUsesNonExemptEncryption: false` — correct (HTTPS-only exempt).
- App record exists (`ascAppId: 6772559846`); Spotify query schemes set.
- Only publishable keys bundled; no secrets in the client.

---

## 4. Deferred security items (post-launch / infra — NOT launch blockers today)

Written and ready; apply-by-hand SQL/Edge files exist. Pre-launch app has no real users,
so nothing here is exposed today. Recommended order after launch:

- [ ] `0045_lobby_players_insert_hardening.sql` — apply after a two-device join-flow test
      (see revert snippet in the file header). Best paired with E2 below.
- [ ] **E2 Realtime sender-auth** (private `quiz_sync` channels — Supabase dashboard + RLS).
      The bigger half of the score/state-injection hole; do with 0045.
- [ ] `0046_subscription_entitlements.sql` + `revenuecat-webhook` — E1 server-side premium
      authority. Follow the activation order in the migration header (RC webhook + client
      cutover). Closes the "modded client = free premium" hole.
- [ ] E4 enumeration throttle, E5 `anon-signup` XFF, E6/E7 claim/invite scoping — lower priority.

Applied already (safe tier): `0044a` (FK indexes), `0044b` (CHECK constraints), `0044c`
(profiles UPDATE with-check + question_answers INSERT scoping).

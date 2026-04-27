# QuizVibe

Expo Router quiz app (React Native 0.81, React 19, Expo SDK 54). Dark-themed, mobile-first. Mock data only — no backend yet.

## Routing

`"main": "expo-router/entry"` — file-based routes in `app/`.

- `app/_layout.tsx` — root Stack: `(tabs)` and `quiz`.
- `app/(tabs)/_layout.tsx` — bottom tabs: Home, Profile, Lobby, Leaderboards, Store.
- `app/(tabs)/index.tsx` — Home screen + JoinModal + Logo (2k+ lines, needs splitting).
- `app/(tabs)/{lobby,profile,leaderboards,store}.tsx` — thin re-exports of `src/screens/*Screen.tsx`.
- `app/quiz.tsx` — gameplay screen.
- `app/modal.tsx` — currently unregistered.

## Source layout (`src/`)

- `screens/` — large screen files (Lobby, Profile, Leaderboards, Store, HCPSettings).
- `components/` — shared UI (Button, Card, PlayerRow, RoundLeaderboard, etc.).
- `theme/` — `Colors`, `Spacing`, `Radius`, `Typography`, `FontSize`, `FontWeight`. Import via `@/src/theme`.
- `utils/` — AsyncStorage helpers (`profileStorage`, `friendsStorage`, `pendingLobby`, `waitingInvites`, `gameResults`), plus `avatars`, `hcp`, `roomCode`.
- `navigation/`, `types/navigation.ts` — **dead** (React Navigation leftovers, see below).

Path alias: `@/*` → repo root (e.g. `@/src/theme`, `@/src/components/Button`).

## Cross-file types

- `LobbyPlayer` is exported from `src/screens/LobbyScreen.tsx` and imported by `app/quiz.tsx`. Don't move it without updating both.
- `LobbyPlayer.spotifyConnected?: boolean` drives the Spotify auto-enable rule in Game Connections. Sourced from `profile.spotifyConnected` for the host (via `mergeProfileIntoHost`); guests and `+ Add Player` entries leave it falsy by design.
- `RoundLeaderboard` re-exports several types (`LeaderboardPlayer`, `RoundScore`, `HcpChange`, mocks).

## Persistence

All client-side via AsyncStorage. No server. Screens reload data on focus (`useFocusEffect` + `loadX()`), so writing through `src/utils/*Storage.ts` is the canonical pattern. No reactive store yet.

## Dead code (safe to delete)

- `App.tsx` + `src/navigation/AppNavigator.tsx` — old React Navigation entry, unused since expo-router took over.
- Root `components/` (themed-text, hello-wave, parallax-scroll-view, ui/icon-symbol, etc.), `hooks/`, `constants/theme.ts` — Expo template scaffolding, not imported by `src/` or `app/`.
- `@react-navigation/*` deps in `package.json` — only AppNavigator uses them.

## Conventions

- Comments are often in Swedish. Keep that style when editing existing files; new files can be English.
- Theme tokens, never raw hex. `Colors.background`, `Spacing.md`, etc.
- Screens currently mix layout, modals, and domain logic in one file — when extending, prefer extracting sub-components into `src/components/`.
- **Border-cutting badge pattern** for "tag" labels that overlap a card/button border (HOST/GUEST in `PlayerRow`, FREE on the Register button in `app/(tabs)/index.tsx`, FREE/PREMIUM on the Game Mode toggle in `LobbyScreen`). The badge is `position: 'absolute'` with `top: -8`, a matching `backgroundColor` to the parent border, and `paddingHorizontal: 8 / paddingVertical: 2`. The parent must be `position: 'relative'` and must NOT use `overflow: 'hidden'`, or the badge gets clipped.
- **Host-vs-non-host settings pattern** (Game Mode buttons, Game Connections switches, Use Packages chips): always render the control for everyone in the lobby so non-hosts see the host's choice in real time, but pass `disabled={!hostMode}` so only host can change it. Read-only state still uses brand colors so the host's choice is legible. Don't gate the JSX with `{hostMode && (…)}` for these — that's the wrong default.

## Lobby — Game Settings card

Game Mode and Game Connections share a single bordered card (`gameSettingsBorder` in `LobbyScreen.tsx`) — they're treated as one "spelregler"-grupp. Order inside Game Connections: YouTube → Spotify → Use Packages sub-block → Profiles and Places.

**Spotify auto-enable rule is mode-dependent** (non-obvious — easy to break):

- Pass-the-Phone → `spotifyAutoEnabled = true` unconditionally (songs play on host's device).
- Individual Devices → all approved players (incl. host) need `spotifyConnected === true` (each player streams on their own phone).
- Host has an additional manual override (`spotifyHostToggle`); displayed state = `auto && hostToggle`.
- The Spotify switch is rendered for everyone, `disabled` when non-host or when `!spotifyAutoEnabled`. The dimmed-grey track/thumb (`#3A3F4B` / `#9CA3AF`) is reserved for the auto-disabled case so the visual reads "blocked by lobby rules" not just "off".
- The info `(i)` icon next to the Spotify pill is **always** visible and shows the rule for both modes — users need to understand criteria regardless of current state.

**Use Packages mutual-exclusion**: `useBasicPackage` and `selectedExtraPackages[]` are mutually exclusive. Selecting any extra package auto-deactivates Basic; deselecting the last extra auto-reactivates Basic; toggling Basic on clears all extras. There must always be at least one active source. When the combined `spotifyEnabled` is false, all package chips (Basic + Buy + Extras) get `packageChipDimmed` (opacity 0.4) and `disabled` — picking packages is meaningless when Spotify itself is off. The "Buy Extra packages" CTA is **always** the first chip in the grid (regardless of purchase state) and navigates to `/(tabs)/store`.

**Status-pill width sync**: `statusPillEnabled`, `statusPillDisabled`, and `youtubeEnabledPill` all share `minWidth: 80` + `alignItems: 'center'` so YouTube's "Enabled" and Spotify's "Enabled/Disabled" align vertically across rows. `connectionLabel.minWidth` is set so the pills start at the same x-position regardless of label-text width.

## Scripts

`npm start` (Expo dev), `npm run ios` / `android` / `web`, `npm run lint` (`expo lint`). No tests, no CI.

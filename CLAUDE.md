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

## Scripts

`npm start` (Expo dev), `npm run ios` / `android` / `web`, `npm run lint` (`expo lint`). No tests, no CI.

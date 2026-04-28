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

Game Mode and Game Connections share a single bordered card (`gameSettingsBorder` in `LobbyScreen.tsx`) — they're treated as one "spelregler"-grupp. Order inside Game Connections: YouTube → Spotify → Profiles & Places → "Customized Host packages" sub-block (`usePackagesBlock`).

**Profiles & Places icon** uses an inline SVG of the Q-figure from `QuizVibeLogo` (circle + tail in `Colors.primary`, no surrounding squares) with an "AI"-Text overlay centered in the Q ring. `viewBox="24 22 32 32"` centers the Q at icon coords (14, 14) which matches the wrap's flex center; AI text gets `transform: translateY(-1)` to compensate for glyph baseline offset.

**Spotify auto-enable rule is mode-dependent** (non-obvious — easy to break):

- Pass-the-Phone → `spotifyAutoEnabled = false` unconditionally. Opening Spotify on the single shared device steals focus from QuizVibe and breaks the in-game timer that ticks while the song plays — Spotify is incompatible with this mode.
- Individual Devices → all approved players (incl. host) need `spotifyConnected === true` (each player streams on their own phone).
- Host has an additional manual override (`spotifyHostToggle`); displayed state = `auto && hostToggle`.
- The Spotify switch is rendered for everyone, `disabled` when non-host or when `!spotifyAutoEnabled`. The dimmed-grey track/thumb (`#3A3F4B` / `#9CA3AF`) is reserved for the auto-disabled case so the visual reads "blocked by lobby rules" not just "off" — this now covers Pass-the-Phone too.
- The info `(i)` icon sits **directly after the "Spotify" label** (inside `connectionLabelGroup`, not after the pill) and is **always** visible. It shows the rule for both modes so users can check criteria regardless of current state. Placing the icon there frees the right-side flow so Spotify's switch lines up with YouTube's and Profiles & Places' switches via `marginLeft: 'auto'`.

**Customized Host packages** (sub-block `usePackagesBlock` inside Game Connections): Basic-utbudet är alltid implicit aktivt (ingen synlig rad) — hosten kan välja till köpta extra-paket via `selectedExtraPackages[]` ovanpå. `PURCHASED_PACKAGES` är hardcodad mock (Hip Hop, Rock, Film & Actors — id, name only) tills Store-integrationen är inkopplad.

Layouten under "Customized Host packages"-rubriken: en yttre `extraPackagesWrapper` (`Colors.background`-bg, padding 3 horisontellt + top, paddingBottom Spacing.xl, gap 4, Radius.md, 1px Colors.border — geometrin matchar `modeToggle` förutom asymmetrisk paddingBottom). Inuti, i ordning:

1. **Sub-rubrik-rad** (`extraPackagesHeadingRow`) med "Packages available for you:"-text på vänster + "Select all"-grupp (label + Switch via `marginLeft: 'auto'`) på höger. Switchen kör `handleToggleAll` som sätter `selectedExtraPackages` till tom eller alla paket-id:n. Switchen är `disabled` när `PURCHASED_PACKAGES` är tom. Heading-Text:en har `transform: translateY(-1)` för att glyferna ska linjera med switchens visuella mitt.
2. **Empty state** — om `PURCHASED_PACKAGES.length === 0` rendras `<Text>` "No Extra packages purchased" istället för listan. Buy CTA visas fortsatt nedanför.
3. **Paket-rader** (`purchasedPackageRow`, sorterade alfabetiskt via `localeCompare` med `numeric: true`): info-ikon (centrerad mellan wrapper-yttre-vänsterkant och box-vänsterkant via `paddingLeft: 4` + ikon-bredd 20 + `gap: Spacing.sm` = box-vänster vid 36 absolut) → bordered text-box (`purchasedPackageBox`, `width: 204` så höger-kanten linjerar med connection-radernas pill-höger) → Switch (höger via `marginLeft: 'auto'` + `paddingRight: 4` så den linjerar med YouTube/Spotify/Profiles-switcharna ovanför). Box off-state = grå `borderStrong` + transparent + `textSecondary` text. Box on-state = `Colors.primary` border + `Colors.cardElevated` bg + vit text (matchar Buy CTA). Info-ikonen visar `Alert.alert(pkg.name, '...')` — info-texten kommer fyllas på från Store-integrationen.
4. **Buy CTA** (`packageChipBuyCta` inuti `packageChipBuyCtaWrap` Animated.View) — pulserande knapp (`scale 1 → 1.03 → 1` loop, 900ms per riktning, samma mönster som Create Game-knappen på startskärmen). Wrap är `width: '70%'` centered, TouchableOpacity:n stretches till full wrap-bredd via `alignSelf: 'stretch'` (override:ar `packageChip.alignSelf: 'flex-start'`). Färgteman matchar Create Game: `Colors.cardElevated` bg + `Colors.primary` border + vit text. Texten är "+ QuizVibe Store", `disabled={!hostMode}` (oberoende av Spotify-status — Store-navigation alltid giltig).

**Switch alignment math (empiriskt)**: `connectionRow` har `paddingRight: 18`; package row (`purchasedPackageRow`) har `paddingRight: 4`; `extraPackagesHeadingRow` har `paddingRight: 0`. Trots olika värden landar alla switchar på samma x-position visuellt — wrapper:s 4px border+padding-inset + box:ens egna paddings förskjuter saker så empirisk justering krävs (matematiken stämmer inte exakt).

**Status-pill width sync**: `statusPillEnabled`, `statusPillDisabled`, and `youtubeEnabledPill` all share `minWidth: 80` + `alignItems: 'center'` so the Enabled/Disabled-pillar på YouTube-, Spotify- och Profiles & Places-raderna får samma bredd. `connectionLabel.minWidth` is sized to fit the **widest** label ("Profiles & Places") so all three pills start at the same x-position regardless of which label is rendered. Profiles & Places använder samma `youtubeEnabledPill` + `freeBadgeSmall`-mönster som YouTube för Enabled-tillståndet (FREE-badge skär kantlinjen).

**FREE-badgen är alltid synlig** på YouTube- och Profiles & Places-pillarna (oavsett om de är Enabled eller Disabled) eftersom funktionerna ingår gratis. I Disabled-läget appliceras `freeBadgeSmallGrey` + `freeBadgeSmallTextGrey` på badgen så den dämpas till grått — `statusPillDisabled` har därför `position: 'relative'` så badgen kan sticka upp över kantlinjen även där. Spotify-pillen visar aldrig FREE-badge.

**Minst en Game Connection-källa måste alltid vara aktiv** (YouTube, Spotify, eller Profiles & Places) — utan källa finns inget underlag att hämta frågor från. `handleToggleSource` i `LobbyScreen.tsx` blockerar avstängning när `enabledSourceCount === 1` och visar Alert "Minimum 1 Game connection source needs to be enabled." Switchen återställs visuellt eftersom setter:n aldrig anropas. För Spotify räknas `spotifyEnabled` (kombinerad `spotifyAutoEnabled && spotifyHostToggle`) som "aktiv källa", inte host-toggeln ensam.

## Scripts

`npm start` (Expo dev), `npm run ios` / `android` / `web`, `npm run lint` (`expo lint`). No tests, no CI.

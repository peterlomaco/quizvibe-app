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
- **Host-vs-non-host settings pattern** (Game Mode buttons, mfl.): default är att alltid rendera kontrollen för alla i lobbyn så icke-host ser hostens val i real-tid, men passera `disabled={!hostMode}` så bara host kan ändra. Read-only state använder fortfarande brand-colors så hostens val är läsligt. Don't gate the JSX with `{hostMode && (…)}` for these — that's the wrong default.
  - **Undantag: Game Connections-blocket** (YouTube/Spotify/Profiles & Places-rader + "Customized Host packages"-sub-blocket). Här gömmer vi alla switchar, "Select all"-raden och Buy CTA för icke-host. Guests ser bara Enabled/Disabled-pillar på source-raderna och en read-only lista över *aktiva* paket (filtrerad via `selectedExtraPackages`) i en active-stylad text-box. Spotify-rad-info-(i)-ikonen behålls även för guests så de förstår varför Spotify ev. är Disabled. Sub-rubriken byter till "Packages for this lobby selected by the Host:" när `!hostMode`.

## Lobby — Game Settings card

Game Mode and Game Connections share a single bordered card (`gameSettingsBorder` in `LobbyScreen.tsx`) — they're treated as one "spelregler"-grupp. Order inside Game Connections: YouTube → Spotify → Profiles & Places → "Customized Host packages" sub-block (`usePackagesBlock`).

**Profiles & Places icon** uses an inline SVG of the Q-figure (circle + tail in `Colors.primary`, no surrounding squares) with an "AI"-Text overlay centered in the Q ring. `viewBox="24 22 32 32"` centers the Q at icon coords (14, 14) which matches the wrap's flex center; AI text gets `transform: translateY(-1)` to compensate for glyph baseline offset. **Gotcha**: this inline SVG is **independent** from `QuizVibeLogo` and still uses the original Q coords (cx=40, cy=38, r=13). The shared `QuizVibeLogo` component shifted its Q to (37, 37) for box-centering — they're intentionally decoupled, so changing one doesn't affect the other.

**Spotify auto-enable rule is mode-dependent** (non-obvious — easy to break):

- Pass-the-Phone → `spotifyAutoEnabled = false` unconditionally. Opening Spotify on the single shared device steals focus from QuizVibe and breaks the in-game timer that ticks while the song plays — Spotify is incompatible with this mode.
- Individual Devices → all approved players (incl. host) need `spotifyConnected === true` (each player streams on their own phone).
- Host has an additional manual override (`spotifyHostToggle`); displayed state = `auto && hostToggle`.
- Spotify-switchen renderas endast för host (Game Connections-undantaget); för host:en är den `disabled` när `!spotifyAutoEnabled`. Den dämpade gråa track/thumb-paletten (`#3A3F4B` / `#9CA3AF`) är reserverad för auto-disabled-fallet så det visuella signalerar "blocked by lobby rules" snarare än bara "off" — det täcker även Pass-the-Phone-fallet. Icke-host ser ingen switch alls, bara Enabled/Disabled-pillen.
- The info `(i)` icon sits **directly after the "Spotify" label** (inside `connectionLabelGroup`, not after the pill) and is **always** visible. It shows the rule for both modes so users can check criteria regardless of current state. Placing the icon there frees the right-side flow so Spotify's switch lines up with YouTube's and Profiles & Places' switches via `marginLeft: 'auto'`.

**Customized Host packages** (sub-block `usePackagesBlock` inside Game Connections): Basic-utbudet är alltid implicit aktivt (ingen synlig rad) — hosten kan välja till köpta extra-paket via `selectedExtraPackages[]` ovanpå. `PURCHASED_PACKAGES` är hardcodad mock (Hip Hop, Rock, Film & Actors — id, name only) tills Store-integrationen är inkopplad.

Layouten under "Customized Host packages"-rubriken: en yttre `extraPackagesWrapper` (`Colors.background`-bg, padding 3 horisontellt + top, paddingBottom Spacing.xl, gap 4, Radius.md, 1px Colors.border — geometrin matchar `modeToggle` förutom asymmetrisk paddingBottom). Inuti, i ordning:

1. **Sub-rubrik-rad** (`extraPackagesHeadingRow`) med text på vänster + "Select all"-grupp (label + Switch via `marginLeft: 'auto'`) på höger. Heading-texten är "Packages available for you:" för host och "Packages for this lobby selected by the Host:" för icke-host. "Select all"-gruppen renderas **endast för host**; switchen kör `handleToggleAll` som sätter `selectedExtraPackages` till tom eller alla paket-id:n och är `disabled` när `PURCHASED_PACKAGES` är tom. Heading-Text:en har `transform: translateY(-1)` för att glyferna ska linjera med switchens visuella mitt.
2. **Empty state** — host: om `PURCHASED_PACKAGES.length === 0` rendras `<Text>` "No Extra packages purchased". Icke-host: om hosten inte aktiverat något paket (filtrerade listan tom) rendras "No extra packages active in this lobby". Buy CTA visas fortsatt för host nedanför empty-state-texten.
3. **Paket-rader** (`purchasedPackageRow`, sorterade alfabetiskt via `localeCompare` med `numeric: true`): host ser hela `PURCHASED_PACKAGES`-listan, icke-host ser endast paket vars id finns i `selectedExtraPackages` (filtrerade innan sort). Layout per rad: info-ikon (centrerad mellan wrapper-yttre-vänsterkant och box-vänsterkant via `paddingLeft: 4` + ikon-bredd 20 + `gap: Spacing.sm` = box-vänster vid 36 absolut) → bordered text-box (`purchasedPackageBox`, `width: 204` så höger-kanten linjerar med connection-radernas pill-höger) → Switch (host-only, höger via `marginLeft: 'auto'` + `paddingRight: 4` så den linjerar med YouTube/Spotify/Profiles-switcharna ovanför). Box off-state = grå `borderStrong` + transparent + `textSecondary` text. Box on-state = `Colors.primary` border + `Colors.cardElevated` bg + vit text (matchar Buy CTA). För icke-host används alltid on-state-stilen eftersom alla synliga rader per definition är aktiva. Info-ikonen visar `Alert.alert(pkg.name, '...')` även för guests.
4. **Buy CTA** (`packageChipBuyCta` inuti `packageChipBuyCtaWrap` Animated.View) — host-only (gated av `{hostMode && (…)}`); icke-host ser ingen knapp. Pulserande knapp (`scale 1 → 1.03 → 1` loop, 900ms per riktning, samma mönster som Create Game-knappen på startskärmen). Wrap är `width: '70%'` centered, TouchableOpacity:n stretches till full wrap-bredd via `alignSelf: 'stretch'` (override:ar `packageChip.alignSelf: 'flex-start'`). Färgteman matchar Create Game: `Colors.cardElevated` bg + `Colors.primary` border + vit text. Texten är "+ QuizVibe Store" (oberoende av Spotify-status — Store-navigation alltid giltig).

**Switch alignment math (empiriskt)**: `connectionRow` har `paddingRight: 18`; package row (`purchasedPackageRow`) har `paddingRight: 4`; `extraPackagesHeadingRow` har `paddingRight: 0`. Trots olika värden landar alla switchar på samma x-position visuellt — wrapper:s 4px border+padding-inset + box:ens egna paddings förskjuter saker så empirisk justering krävs (matematiken stämmer inte exakt).

**Status-pill width sync**: `statusPillEnabled`, `statusPillDisabled`, and `youtubeEnabledPill` all share `minWidth: 80` + `alignItems: 'center'` so the Enabled/Disabled-pillar på YouTube-, Spotify- och Profiles & Places-raderna får samma bredd. `connectionLabel.minWidth` is sized to fit the **widest** label ("Profiles & Places") so all three pills start at the same x-position regardless of which label is rendered. Profiles & Places använder samma `youtubeEnabledPill` + `freeBadgeSmall`-mönster som YouTube för Enabled-tillståndet (FREE-badge skär kantlinjen).

**FREE-badgen är alltid synlig** på YouTube- och Profiles & Places-pillarna (oavsett om de är Enabled eller Disabled) eftersom funktionerna ingår gratis. I Disabled-läget appliceras `freeBadgeSmallGrey` + `freeBadgeSmallTextGrey` på badgen så den dämpas till grått — `statusPillDisabled` har därför `position: 'relative'` så badgen kan sticka upp över kantlinjen även där. Spotify-pillen visar aldrig FREE-badge.

**Minst en Game Connection-källa måste alltid vara aktiv** (YouTube, Spotify, eller Profiles & Places) — utan källa finns inget underlag att hämta frågor från. `handleToggleSource` i `LobbyScreen.tsx` blockerar avstängning när `enabledSourceCount === 1` och visar Alert "Minimum 1 Game connection source needs to be enabled." Switchen återställs visuellt eftersom setter:n aldrig anropas. För Spotify räknas `spotifyEnabled` (kombinerad `spotifyAutoEnabled && spotifyHostToggle`) som "aktiv källa", inte host-toggeln ensam.

## Lobby — Room card

The room-code Card (`roomCard`) is laid out very differently for host vs guest. Both share the absolute-positioned QuizVibeLogo in the upper-left:

- Logo: `<QuizVibeLogo size={104} />` wrapped in `roomCodeLogoWrap` with `position: 'absolute'`, `top: -Spacing.sm`, `left: -Spacing.sm` — pinned to the Card's padding-edge top-left corner. Same size as Home's brand logo.
- Room code rendered as 5 cells (3 letters + 2 digits) using the **same filled-cell styling** as JoinModal's `codeCellFilled` (`Colors.primary` border + `Colors.primaryMuted` bg). Hyphen between letters and digits is a separate `<Text style={styles.roomCodeCellDash}>–</Text>`. Iterates raw `roomCode.split('')` — canonical form has no hyphen.

**Host layout**: hostBadge ("👑 You are the host") at top, then "Room Code" label (small overline) + cell row in the row stack, then Share-invite button. Standard stacked layout in flow.

**Guest layout** (non-trivial, empirically pixel-tuned):

- "ROOM CODE" label uses `roomLabelGuestAbsolute` — `FontSize.xxl` (24), letterSpacing 1.2, **absolute-positioned** at `top: 27`, `left: 0`, `right: 0`, `textAlign: 'center'`. Absolute positioning bypasses flex/lineHeight quirks that made label-vs-logo alignment unpredictable. The label's vertical center (~y=41 in card padded coords) lines up with the logo's visible center (cy=38 in 80-unit viewBox → 49.4 from logo top → -8+49.4 ≈ 41 in padded coords).
- Label is **horizontally centered** in the card (textAlign center on full-width absolute Text) — NOT aligned with the logo's horizontal center. Earlier iteration tried that and Peter rejected it.
- `roomCodeRowGuestSpacing: { marginTop: 52 }` on the row so the cell row clears the logo's lower portion. The 52 is empirical — gap between label-bottom and cells is intentionally tight (~−1px, cells start just where the label ends).
- No "Share invite" button.

`formatRoomCode(code)` from `src/utils/roomCode.ts` inserts a hyphen between letters and digits ("ABC23" → "ABC-23"). **Display-only** — storage (AsyncStorage invites, navigation params) and comparison still use the canonical 5-char form. Used by the OS share message and the Home Waiting-Invites list. The cell-based room-code display in Lobby splits the raw code char-by-char, so it doesn't call `formatRoomCode`.

## Lobby — Players in Lobby

Non-host gets a **read-only view** of the player list:

- Section hint changes by mode: "Turn order — top plays first. Use ↑↓ to reorder." (host) → "Playing order — selected by Host" (guest).
- `PlayerRow`'s up/down arrow buttons (`turnArrows` block) are gated on **handler presence** — if neither `onMoveUp` nor `onMoveDown` is passed, the entire turnArrows block is hidden. `LobbyScreen` passes `undefined` for both handlers when `!hostMode`. The turn-number badge stays visible.

**Auto-add joining player** (mount useEffect in `LobbyScreen.tsx`): non-hosts are inserted into the players list immediately on lobby entry as `approved: false`, so they appear in the "To be Approved by Host" section right away — no separate waiting screen.

- `asGuest=true` + `guestName` (Guest-form path): inserts as `type: 'guest'` from form params.
- `!hostMode` without guest-form params (code-only join): loads `loadProfile()` and inserts as `type: 'registered'` from profile (name, avatar, age, skill, spotifyConnected). Falls back to "You" / 👤 / `type: 'guest'` if no profile saved.

## Shared visual components

- `src/components/QuizVibeLogo.tsx` — brand SVG used on Home and Lobby room-card (both at `size={104}`). The Q-figure (ring + tail + wifi-fan in the center) is shifted **−3 in x, −1 in y** from the original (40, 38) center so the Q+tail bounding box (24-52, 24-52) is centered in the front rounded square (16-60, 16-60, center 38, 38). Wifi-fan replaces the old single dot — three concentric 90°-arcs (radii 3 / 5 / 7, `sweep-flag=1` so they bulge upward) + a 1.5px dot, all centered at (37, 37) (= Q ring center). 90° was chosen over 120° to match the iOS status-bar wifi icon's compactness — sweep-flag=0 produced inverted (frown) arcs, easy to flip back accidentally.
- `src/components/TopUserBanner.tsx` — full-width banner with a login pill (avatar + nickname, or "Register or Login" when no profile) in the top-right corner. Loads profile via `useFocusEffect` so updates from Profile-tab edits flow through. **Optional `onPress`**: when omitted the pill renders as a plain `<View>` instead of `<TouchableOpacity>` (used on Profile screen — user is already there, no destination); Home passes `setProfileMenuVisible(true)`; Lobby passes `router.push('/(tabs)/profile')`. **Sticky-on-scroll pattern**: place as a direct child of `<SafeAreaView>`, **outside** the `<ScrollView>`, so it remains pinned at the top while content scrolls. Used on Home, Lobby, and Profile screens.

## Scripts

`npm start` (Expo dev), `npm run ios` / `android` / `web`, `npm run lint` (`expo lint`). No tests, no CI.

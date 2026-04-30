# QuizVibe

Expo Router quiz app (React Native 0.81, React 19, Expo SDK 54). Dark-themed, mobile-first. Mock data only — no backend yet.

## Routing

`"main": "expo-router/entry"` — file-based routes in `app/`.

- `app/_layout.tsx` — root Stack: `(tabs)` and `quiz`.
- `app/(tabs)/_layout.tsx` — bottom tabs: Home, Profile, Lobby, Leaderboards, Store.
- `app/(tabs)/index.tsx` — Home screen + JoinModal + Logo (2k+ lines, needs splitting).
- `app/(tabs)/{lobby,profile,leaderboards,store}.tsx` — thin re-exports of `src/screens/*Screen.tsx`.
- `app/quiz.tsx` — gameplay screen.

## Source layout (`src/`)

- `screens/` — large screen files (Lobby, Profile, Leaderboards, Store, HCPSettings). HCPSettings har ingen route i `app/` än (planeras kopplas in framöver).
- `components/` — shared UI (Button, Card, PlayerRow, RoundLeaderboard, etc.).
- `theme/` — `Colors`, `Spacing`, `Radius`, `Typography`, `FontSize`, `FontWeight`. Import via `@/src/theme`.
- `utils/` — AsyncStorage helpers (`profileStorage`, `friendsStorage`, `pendingLobby`, `waitingInvites`, `gameResults`), plus `avatars`, `hcp`, `roomCode`, `playerName`, `analytics`, `profanity`.

Path alias: `@/*` → repo root (e.g. `@/src/theme`, `@/src/components/Button`).

## Cross-file types

- `LobbyPlayer` is exported from `src/screens/LobbyScreen.tsx` and imported by `app/quiz.tsx`. Don't move it without updating both.
- `LobbyPlayer.spotifyConnected?: boolean` drives the Spotify auto-enable rule in Game Connections. Sourced from `profile.spotifyConnected` for the host (via `mergeProfileIntoHost`); guests and `+ Add Player` entries leave it falsy by design.
- `RoundLeaderboard` re-exports several types (`LeaderboardPlayer`, `RoundScore`, `HcpChange`, mocks).

## Persistence

All client-side via AsyncStorage. No server. Screens reload data on focus (`useFocusEffect` + `loadX()`), so writing through `src/utils/*Storage.ts` is the canonical pattern. No reactive store yet.

**Field rename migration (dual-read)**: when renaming a persisted field (e.g. `nickname → playerName`), use passive dual-read in the load function — read the new field first, fall back to the old. Next save writes only the new shape so storage converges passively. See `profileStorage.ts`, `friendsStorage.ts`, `waitingInvites.ts`. The fallback can be dropped 2-3 release cycles after rename when most users have migrated.

## Conventions

- Comments are often in Swedish. Keep that style when editing existing files; new files can be English.
- Theme tokens, never raw hex. `Colors.background`, `Spacing.md`, etc.
- Screens currently mix layout, modals, and domain logic in one file — when extending, prefer extracting sub-components into `src/components/`.
- **Border-cutting badge pattern** for "tag" labels that overlap a card/button border (HOST/GUEST in `PlayerRow`, FREE on the Register button in `app/(tabs)/index.tsx`, FREE/PREMIUM on the Game Mode toggle in `LobbyScreen`). The badge is `position: 'absolute'` with `top: -8`, a matching `backgroundColor` to the parent border, and `paddingHorizontal: 8 / paddingVertical: 2`. The parent must be `position: 'relative'` and must NOT use `overflow: 'hidden'`, or the badge gets clipped.
- **Host-vs-non-host settings pattern** (Game Mode buttons, mfl.): default är att alltid rendera kontrollen för alla i lobbyn så icke-host ser hostens val i real-tid, men passera `disabled={!hostMode}` så bara host kan ändra. Read-only state använder fortfarande brand-colors så hostens val är läsligt. Don't gate the JSX with `{hostMode && (…)}` for these — that's the wrong default.
  - **Undantag: Game Connections-blocket** (YouTube/Spotify/Profiles & Places-rader + "Customized Host packages"-sub-blocket). Här gömmer vi alla switchar, "Select all"-raden och Buy CTA för icke-host. Guests ser bara Enabled/Disabled-pillar på source-raderna och en read-only lista över *aktiva* paket (filtrerad via `selectedExtraPackages`) i en active-stylad text-box. Spotify-rad-info-(i)-ikonen behålls även för guests så de förstår varför Spotify ev. är Disabled. Sub-rubriken byter till "Packages for this lobby selected by the Host:" när `!hostMode`.

## Player Name (registration + validation)

Auto-generated format: `PlayerName{5 digits}-{2 letters}` (e.g. `PlayerName87321-KL`) via `src/utils/playerName.ts → generatePlayerName(taken)`. Auto-filled in:

- **Register form** (`app/(tabs)/index.tsx`): on email-becomes-valid transition (tracked via `prevRegEmailValidRef`).
- **Guest form** in JoinModal: on entry to guest step (tracked via `prevGuestStepRef`).

Both use `useRef`-based transition detection so manual clear of the field doesn't trigger a refill.

`validatePlayerName(name)` (module-level helper in `app/(tabs)/index.tsx`) returns `'available' | 'taken' | 'invalid'`. Profanity check (`src/utils/profanity.ts` — short blocklist of severe SE/EN terms with basic l33t-substitutions, conservative on false-positives) runs first, then uniqueness check against mock `TAKEN_PLAYER_NAMES`. UI status type: `PlayerNameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'`.

`handleLogin` accepts **Player Name OR email** as identifier — if input contains `@`, the email-prefix is derived as the saved `playerName` (mock; real auth will resolve email → playerName via backend lookup).

Default Skill='intermediate', Region='global' on the Register form so the user can submit immediately after Year of birth — both fields show under a "Use default or select prefered setup" hint.

## Profile screen

Three top-level collapsible sections — all use the same tappable-header pattern with a `+/−`-toggle box (26×26, `borderColor: borderStrong`) next to the title (`Typography.title` + bold + `Colors.textPrimary`). When collapsed, a 1px `sectionDivider` line shows under the header for visual separation. Default expanded; state per section is local (not persisted across app restarts).

1. **Profile default settings** — avatar + Player Name (read-only `Text`, set at registration, NOT editable from this screen), competition setup (Year of birth, auto Competition Age, Skill level), Host defaults block (Region scope + Answer response time half-width side-by-side, then Game era slider full-width), Save Profile button. The "Host default settings" sub-heading sits left-aligned at full card width as visual separator between user-defaults and host-defaults.
2. **Game connections** — Spotify card, YouTube card, QuizVibe friends card. All three share `spotifyHeader/spotifyTitle/spotifySubtitle/spotifyBtn`-styles for structural consistency; only accent colors and icon differ (Spotify green, YouTube red `#FF0000`, friends primary blue).
3. **Player history** — `src/components/PlayerHistorySection.tsx` manages its own collapse state. HCP shield lives in a dedicated card directly under the section heading (was previously in the profile card).

**Game era slider** mirrors Lobby's `MultiSlider` pattern (`ERA_MIN=1900`, `ERA_MAX=current year`, `SLIDER_WIDTH=280`, default `[1980, 2010]`). No player-clamping on Profile — it's host-default setup with no players in context. Persisted as `gameEraFrom`/`gameEraTo` on `ProfileData`.

**Answer response time** (`answerResponseSeconds: 15 | 30 | 45 | 60`, default 30) = how long players have to answer a question. Distinct from how long question media (song/video/image) plays.

**TopUserBanner pill on Profile** opens a logout sheet via `logoutModalVisible` state — mirrors Home's `profileMenu` for the logged-in case (header with avatar emoji + Player Name + green "Logged in" status + red Log out button + Cancel). After logout: `clearProfile()` + analytics + `router.replace('/')` to Home.

## Store screen

Three sections in `src/screens/StoreScreen.tsx` under header "Add Host Game Credits":

1. **Basic plan** — single card with FREE badge (border-cutting pattern, green) + green ACTIVE pill in card-right. "+ Unlimited games as invited player" subline highlights the bonus.
2. **Credit packages** — 3 one-time-purchase tiers (5/10/20 Host Games at 19/29/49 kr). Save% computed against the smallest tier; BEST VALUE badge on the 20-game tier.
3. **QuizVibe subscription** — 5-feature comparison list (Premium left / Basic right per row) inside a feature card, then 4 subscription tiers (1mth/3mth/6mth/12mth at 79/199/279/399 kr). All auto-renewal (footnote: "Cancel anytime in your App Store or Google Play account."). BEST VALUE on annual (399 kr/12mth ≈ 33 kr/month, save 58% vs monthly).

Shared `CreditTierCard` and `SubscriptionTierCard` mirror the same layout (left: headline + per-game/per-month subline + optional save%; right: price + Buy/Subscribe button).

Mock IAP: credit purchases bump `gameCredits` on profile + emit `purchase_completed` event (`type: 'credits'`). Subscriptions emit same event (`type: 'subscription'`) but don't yet persist state (requires future `ProfileData.subscription` field + RevenueCat integration). Currency hardcoded to `'SEK'` until vendor SDK provides `localizedPrice`.

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
- `src/components/QuizVibeFriendsLogo.tsx` — brand-mark variant for the QuizVibe friends card on Profile. Q-form + tail + rotated squares are identical to `QuizVibeLogo`, but the wifi-pattern inside the Q ring is replaced with two profile silhouettes (head circle + body rounded-rect side-by-side). ViewBox tightened to `"13 13 54 54"` (vs `"0 0 80 80"` in `QuizVibeLogo`) to crop the empty padding around the rotated squares so visible content fills the render area at small sizes (44-52px). Q is centered at **(38, 38)** to match the squares' pre-rotation visual center, NOT (40, 40) which is the viewBox geometric mid. Default `size=44` to match Spotify/YouTube icon-wraps on the same screen; rendered inside a `friendsIconWrap` (44×44 View) for layout-dimension safety.
- `src/components/TopUserBanner.tsx` — full-width banner with a login pill (avatar + Player Name, or "Register or Login" when no profile) in the top-right corner. **Optional `onPress`**: when omitted the pill renders as a plain `<View>` instead of `<TouchableOpacity>` (used on Profile screen — user is already there, no destination); Home passes `setProfileMenuVisible(true)`; Lobby passes `router.push('/(tabs)/profile')`. **Optional `profile` prop (controlled mode)**: skärmar med in-place-login (Home — login-modalen lever på samma skärm som bannern) MÅSTE passera sin egen profile-state så bannern uppdateras direkt vid login/logout — useFocusEffect-self-load triggar inte eftersom skärmen aldrig tappar focus. Lobby/Profile utelämnar proppen och låter bannern self-loada via useFocusEffect (de re-renderas naturligt vid tab-byte). **Sticky-on-scroll pattern**: place as a direct child of `<SafeAreaView>`, **outside** the `<ScrollView>`, so it remains pinned at the top while content scrolls. Used on Home, Lobby, and Profile screens.

## Analytics

Lättviktig wrapper i [src/utils/analytics.ts](src/utils/analytics.ts) — `track(name, props?)`, `identify(userId, traits?)`, `resetIdentity()`. Implementationen loggar bara till console just nu; byt till vendor-SDK (PostHog / Firebase Analytics / Amplitude) när leverantör är vald — call-sites runt om i appen stannar oförändrade.

Event-taxonomi (snake_case verb i preteritum):
- **Lifecycle**: `user_registered`, `user_logged_in`, `user_logged_out`
- **Game flow**: `guest_name_created`, `room_code_created`, `game_started`, `game_completed`
- **Monetization**: `purchase_completed` (props: `type` = `'extra_package'` | `'subscription'` | `'credits'`, `product_id`, `price_amount`, `price_currency`)

Region/land skickas INTE i events — alla större vendors auto-fyller `country_code` via IP/locale så slicing per region funkar i dashboarden out-of-the-box. App Store Connect ger nedladdningar per region som separat datakälla. Skicka inte heller PII (email, fullt namn) i props.

Call-sites finns redan i: `handleRegisterSubmit`, `handleLogin`, `handleLogout`, `handleCreateGame`, `handleJoinAsGuest` ([app/(tabs)/index.tsx](app/(tabs)/index.tsx)) och `QuizScreen` (mount + final leaderboard) ([app/quiz.tsx](app/quiz.tsx)). `purchase_completed` saknar fortfarande call-site — instrumentera när Store-integrationen kopplas in.

## Scripts

`npm start` (Expo dev), `npm run ios` / `android` / `web`, `npm run lint` (`expo lint`). No tests, no CI.

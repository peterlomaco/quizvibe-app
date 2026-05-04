# QuizVibe

Expo Router quiz app (React Native 0.81, React 19, Expo SDK 54). Dark-themed, mobile-first. Mock data on the client; en `backend/`-folder är påbörjad för content-katalog + bild-pipeline (ingen live-API ännu — se "Backend" nedan).

## Routing

`"main": "expo-router/entry"` — file-based routes in `app/`.

- `app/_layout.tsx` — root Stack: `(tabs)`, `quiz`, `name-quiz-demo`.
- `app/(tabs)/_layout.tsx` — bottom tabs: Home, Profile, Lobby, Leaderboards, Store.
- `app/(tabs)/index.tsx` — Home screen + JoinModal + Logo (2k+ lines, needs splitting). Innehåller även en temporär "🧪 Try Name Quiz Demo"-knapp efter footer som navigerar till demo-routen.
- `app/(tabs)/{lobby,profile,leaderboards,store}.tsx` — thin re-exports of `src/screens/*Screen.tsx`.
- `app/quiz.tsx` — gameplay screen.
- `app/name-quiz-demo.tsx` — fristående skiss-demo för Namn-svarsmodellen (Letter Grid + Final Selection + ProgressiveCover-mosaik). Använder hardcoded data från `src/utils/nameQuizDemo.ts` (auto-genererad via `cd backend && npm run export-demo`). Inte integrerad med befintlig quiz-flow ännu.

## Source layout (`src/`)

- `screens/` — large screen files (Lobby, Profile, Leaderboards, Store, HCPSettings). HCPSettings har ingen route i `app/` än (planeras kopplas in framöver).
- `components/` — shared UI (Button, Card, PlayerRow, RoundLeaderboard, etc.).
- `theme/` — `Colors`, `Spacing`, `Radius`, `Typography`, `FontSize`, `FontWeight`. Import via `@/src/theme`.
- `utils/` — AsyncStorage helpers (`profileStorage`, `friendsStorage`, `pendingLobby`, `waitingInvites`, `gameResults`, `leftPlayers`), plus `avatars`, `hcp`, `roomCode`, `playerName`, `analytics`, `profanity`, `mockActiveRooms`, `revealCurve` (Namn-svarsmodellens reveal-kurva), `nameQuizDemo` (auto-genererad demo-data, gitignore:as inte men regenereras via `backend/scripts/export-demo.ts`).

Path alias: `@/*` → repo root (e.g. `@/src/theme`, `@/src/components/Button`).

## Cross-file types

- `LobbyPlayer` is exported from `src/screens/LobbyScreen.tsx` and imported by `app/quiz.tsx`. Don't move it without updating both.
- `LobbyPlayer.spotifyConnected?: boolean` drives the Spotify auto-enable rule in Game Connections. Sourced from `profile.spotifyConnected` for the host (via `mergeProfileIntoHost`); guests and `+ Add Player` entries leave it falsy by design.
- `LobbyPlayer.hasLeft?: boolean` triggers grayed-out "LEFT THIS GAME LOBBY"-rendering i `PlayerRow`. Sätts av Lobby:s `useFocusEffect` baserat på `getLeftPlayers(roomCode)` från `src/utils/leftPlayers.ts`. Host:en exkluderas alltid från denna check (host kan ej lämna sin egen lobby).
- `RoundLeaderboard` re-exports several types (`LeaderboardPlayer`, `RoundScore`, `HcpChange`, mocks).

## Persistence

All client-side via AsyncStorage. No server. Screens reload data on focus (`useFocusEffect` + `loadX()`), so writing through `src/utils/*Storage.ts` is the canonical pattern. No reactive store yet.

**Field rename migration (dual-read)**: when renaming a persisted field (e.g. `nickname → playerName`), use passive dual-read in the load function — read the new field first, fall back to the old. Next save writes only the new shape so storage converges passively. See `profileStorage.ts`, `friendsStorage.ts`, `waitingInvites.ts`. The fallback can be dropped 2-3 release cycles after rename when most users have migrated.

**Mock backend stores** (sessions/AsyncStorage stand-ins för kommande backend-API): konventionen är att exportera funktioner med samma signatur som API-anrop kommer att ha så att call-sites förblir oförändrade när impl byts ut. Två stores idag:
- `src/utils/mockActiveRooms.ts` — **in-memory `Set<string>`** över aktiva rumkoder. `registerActiveRoom(code)` (vid Create Game/Play Again), `isActiveRoom(code)` (validation i `handleJoinWithCode`/`handleJoinAsGuest` — visar "Room not found"-Alert vid miss), `deactivateRoom(code)` (när host trycker Delete this Game Lobby). Sessions-bunden (förstörs vid app-reload). Test-seeds: `'AB23XY'`, `'QV45LV'`.
- `src/utils/leftPlayers.ts` — **AsyncStorage** per rumkod. Lagrar `LeftPlayerSnapshot[]` (inte bara id) så nya joiners som inte har lämnande spelaren i sin SEED-baseline kan rendera kortet med `hasLeft`-styling via orphan-injection (se "Lobby — TopUserBanner actions" nedan). `addLeftPlayer(roomCode, snapshot)`, `getLeftPlayers(roomCode)`, `clearLeftPlayers(roomCode)` (anropas av `handleCreateGame`/Play Again för fresh slate på återanvänd kod).

## Backend (content catalog + image pipeline)

`backend/` är ett separat Node-projekt med egen `package.json` (sharp, zod, js-yaml, vitest, tsx). 77 tester, alla gröna. Live-call-CLIs mot Wikipedia/Commons + mock data exportör för klient-demo. Ingen live HTTP-API ännu — Supabase-setup parkerad.

**Struktur**:
- `backend/content/catalog/*.yaml` — innehållslistor per generation × kategori. 5 generations-grupper: `elder` (Silent + Boomers, 1925-1964), `gen-x`, `millennials`, `gen-z`, `gen-alpha` + `'all'` (baseline). Items har: `id` (kebab-case), `displayName`, `correctYear`, `probability` (0-100), `wikimediaSearchHints[]`, `answerMethods: ('timeline'|'name-letters')[]`, `sensitivity: 'standard'|'sensitive'`. 71 items totalt över persons/capitals/artists.
- `backend/content/schema.ts` — Zod-schema. Validation: items med `'timeline'` i answerMethods MÅSTE ha `correctYear`. Cross-audience-figurer (Zlatan, Cristiano, Messi, ABBA, Madonna, etc.) listas en gång per fil — registry tolererar dubblett-IDs över filer men kräver unika inom en fil.
- `backend/content/registry.ts` — `loadCatalog`, `findItemsForAudience` (default `excludeSensitive: true` → Hitler/Stalin filtreras bort i spelutbud, admin sätter `excludeSensitive: false` för full vy), `findItemsById`.
- `backend/content/generation.ts` — `birthYearToGeneration`, `generationDistance`, `getLetterGridConfig` (skill → prefix-längd: easy=3, intermediate=2, expert=1; specialregler: född 2016+ alltid hela namn; 2013-2015 hela namn om distance>1; övriga hela namn om distance>2 — Millennials har max-distance 2 så får alltid prefix).
- `backend/content/distractors.ts` — `getPrefixForItem` (extraherar prefix, behåller diakriter, skipparar non-letters), `buildLetterGrid`, `buildNameOptions`. Pool-strategi: kategori+audience → kategori-fallback → `distractor-pool.yaml` med ~50 plausibla namn per kategori. `NameOption.source` = `'catalog'` eller `'pool'`.
- `backend/wikimedia/client.ts` — Wikipedia pageimage-lookup (primär källa, kuraterade huvudbilder) + Commons text-search (fallback) + license/artist från Commons imageinfo. CLI: `npm run wikimedia-search <item-id>`.
- `backend/wikimedia/processor.ts` + `process.ts` — `fetchImage` + sharp-pipeline (resize max 1280×720 med aspect ratio bevarat + WebP @ q85). CLI: `npm run wikimedia-process <item-id>`. Output till `backend/output/` (gitignore:ad).
- `backend/scripts/export-demo.ts` — genererar `src/utils/nameQuizDemo.ts` med 3 förgenererade frågor (Astrid, Stockholm, Cristiano) inkl. Letter Grid + name-options per prefix. CLI: `npm run export-demo`.

**Sharp-gotcha**: `sharp(input).resize(...).resize(...)` — den första `resize()` ignoreras tyst när två chainas. Måste köra som två separata `sharp()`-instanser med mellan-buffer:
```ts
const downscaled = await sharp(input).resize(w, h, { kernel: sharp.kernel.nearest }).png().toBuffer();
const buffer = await sharp(downscaled).resize(upW, upH, { kernel: sharp.kernel.nearest }).jpeg().toBuffer();
```

**Wikimedia thumbnail URL-construction** (`buildWikimediaThumbnailUrl` i `client.ts`): använder ren strängmanipulation (inte `URL`-class) för att undvika att Node re-encodar `()` → `%28%29`. iOS expo-image kan ha problem med vissa percent-encoded thumbnail-URLer. För säker rendering: använd vanlig RN `Image` (inte `expo-image`) för data-URI/thumbnail-källor i demo-flow.

**Image rendering iOS gotchas**:
- `expo-image` har `transition`-prop som default fadar in nya source — kan blockera snabba source-byten via state-changes. Sätt `transition={0}` eller använd `<Image>` från `react-native`.
- `cachePolicy="memory-disk"` cachar per source-uri. Vid frågebyte kan förra bilden visas under ny load. Lägg `key={questionIndex}` på `<Image>` för att tvinga remount, eller `cachePolicy="none"` för demo.
- iOS native UIImageView interpolerar smooth vid upscale → "blurry → sharp" inte "blocky pixels". Äkta pixelation kräver pre-rendering serverside med `kernel: 'nearest'` + nedladdning som data-URI eller statisk fil.

**Generation-mappning** (i `generation.ts`):
| Värde | Födelseår |
|---|---|
| `elder` | 1925-1964 (Silent + Boomers) |
| `gen-x` | 1965-1980 |
| `millennials` | 1981-1996 |
| `gen-z` | 1997-2012 |
| `gen-alpha` | 2013-2028 |
| `all` | baseline (alltid distance 0) |

## Conventions

- Comments are often in Swedish. Keep that style when editing existing files; new files can be English.
- Theme tokens, never raw hex. `Colors.background`, `Spacing.md`, etc.
- Screens currently mix layout, modals, and domain logic in one file — when extending, prefer extracting sub-components into `src/components/`.
- **Border-cutting badge pattern** for "tag" labels that overlap a card/button border (HOST/GUEST in `PlayerRow`, FREE on the Register button in `app/(tabs)/index.tsx`, FREE/PREMIUM on the Game Mode toggle in `LobbyScreen`). The badge is `position: 'absolute'` with `top: -8`, a matching `backgroundColor` to the parent border, and `paddingHorizontal: 8 / paddingVertical: 2`. The parent must be `position: 'relative'` and must NOT use `overflow: 'hidden'`, or the badge gets clipped.
- **Host-vs-non-host settings pattern** (Game Mode buttons, mfl.): default är att alltid rendera kontrollen för alla i lobbyn så icke-host ser hostens val i real-tid, men passera `disabled={!hostMode}` så bara host kan ändra. Read-only state använder fortfarande brand-colors så hostens val är läsligt. Don't gate the JSX with `{hostMode && (…)}` for these — that's the wrong default.
  - **Undantag: Game Connections-blocket** (YouTube/Spotify/Profiles & Places-rader + "Customized Host packages"-sub-blocket). Här gömmer vi alla switchar, "Select all"-raden och Buy CTA för icke-host. Guests ser bara Enabled/Disabled-pillar på source-raderna och en read-only lista över *aktiva* paket (filtrerad via `selectedExtraPackages`) i en active-stylad text-box. Spotify-rad-info-(i)-ikonen behålls även för guests så de förstår varför Spotify ev. är Disabled. Sub-rubriken byter till "Packages for this lobby selected by the Host:" när `!hostMode`.

## Player Name (registration + validation)

Auto-generated via `src/utils/playerName.ts → generatePlayerName(taken, prefix?)`. Två varianter via `prefix`-arg:

- **Register form** (`app/(tabs)/index.tsx`): default-prefix `"PlayerName"` → t.ex. `PlayerName87321-KL`. Triggas på email-becomes-valid transition (tracked via `prevRegEmailValidRef`).
- **Guest form** in JoinModal: prefix `"Guest"` → t.ex. `Guest87321-KL`. Triggas på entry to guest step (tracked via `prevGuestStepRef`). Annan prefix än Register-formen så default-namnet signalerar att användaren joinar utan registrering.

Both use `useRef`-based transition detection so manual clear of the field doesn't trigger a refill. Autofill-detektion i `handleJoinAsGuest` använder regex `^Guest\d{5}-[A-Z]{2}$` (matchar Guest-flödets format).

**Suffix-blocklista** `BLOCKED_LETTER_SUFFIXES` i `playerName.ts` är synkad med `BLOCKED_LETTER_PAIRS` i `roomCode.ts` — full lista: `AS, CP, KK, SS, NS, AH, HH, NB`. Filtrerar bort par från det genererade `-XX`-suffixet (`randomLetterPair()` retry:ar tills paret är OK). Gäller båda flödena. Hat-symbol-förkortningar inkluderade så även playerName-suffix skyddas, inte bara rumkoder.

`validatePlayerName(name)` (module-level helper in `app/(tabs)/index.tsx`) returns `'available' | 'taken' | 'invalid'`. Profanity check (`src/utils/profanity.ts`) runs first, then uniqueness check against mock `TAKEN_PLAYER_NAMES`. UI status type: `PlayerNameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'`.

**Profanity filter scope** (defense in depth — alla PlayerName-paths täcks):
- `containsProfanity()` normaliserar text via lowercase + l33t-subs (`0→o, 1→i, 3→e, 4→a, 5→s, 7→t, @→a, $→s`) **+ strippar icke-bokstav/siffra-tecken via `\p{L}\p{N}` unicode-regex**. Sista steget fångar obfuscation som "F.u.c.k", "sh-it", "n_e_g_e_r". Diacritics (åäöé) bevaras så svenska blocklist-termer som "bög" matchar.
- `generatePlayerName()` kör kandidaten genom `containsProfanity()` och retry:ar vid hit. Formatet (fast prefix + digits + bindestreck + filtrerat suffix) gör profanity i praktiken omöjlig, men checken skyddar mot framtida prefix-byten eller l33t-kombinationer i digit-segmentet.
- Manuella namn (typade via custom keyboard eller register-formens system-keyboard) gated på `Check`-knapp-tryck → `validatePlayerName()` → status='available' krävs för submit. Status nollställs vid varje text-ändring så outchecked manuell text aldrig kan submittas.

**Custom CodeKeyboard för PlayerName-fältet** (i BÅDA flödena — guest + register): TextInput sätter `showSoftInputOnFocus={false}` så system-tangentbordet aldrig kommer fram (undviker modal-jump). Custom `CodeKeyboard` renderas under ScrollView:n när fältet är fokuserat, med:
- `letterCharset="ABCDEFGHIJKLMNOPQRSTUVWXYZ"` (fullt 26-letter A–Z, vs Room Code:s 24-letter charset som exkluderar O/I för disambiguation).
- `onModeToggle` callback för att växla mellan letter ('123'-knapp) och digit ('ABC'-knapp) lägen — fri-text-fält behöver manuell mode-toggle vs Room Code-cellerna där cell-index styr mode automatiskt.
- Charset:n innehåller INGEN bindestreck (`-`) — bindestreck används bara i auto-genererade namn, manuell input ska inte innehålla det.

**Case-logik vid manuell input** (för stilfullare lobbyn-display): `handlePlayerNameKeyPress` checkar om det redan finns en bokstav i namnet — första bokstaven blir versal, resterande gemener. Digits skickas as-is. Resultat: typade namn blir `Anna` (inte `ANNA` eller `anna`). Auto-genererade namn behåller sin CamelCase-prefix (`PlayerName...` / `Guest...`) som-är.

**Remove + Auto-generate-knappar under namnfältet**: mutually-exclusive enable — Remove är aktiv när fältet har innehåll (Auto-generate dimmas), Auto-generate är aktiv när fältet är tomt (Remove dimmas). Båda renderas alltid för stabil layout (gate inte med `value.length > 0 &&`). Båda dimmas under `status === 'checking'`. Vit text + `opacity: 0.4` när disabled. `Auto-generate` kallar `Keyboard.dismiss()` så nästa låst fält (Year/Password) blir synligt direkt; `Remove` refokuserar input via ref så CodeKeyboard:n stannar uppe (custom keyboard pushar inte layouten).

`handleLogin` accepts **Player Name OR email** as identifier — if input contains `@`, the email-prefix is derived as the saved `playerName` (mock; real auth will resolve email → playerName via backend lookup).

Default Skill='intermediate', Region='global' on the Register form so the user can submit immediately after Year of birth — both fields show under a "Use default or select prefered setup" hint.

## Register modal — keyboard handling

Register-formen har komplex keyboard-hantering eftersom Email/Password använder system-keyboard medan PlayerName använder custom CodeKeyboard. Hårt vunna lärdomar:

**Sheet bounding & ScrollView shrinkage**: `profileMenu.sheet` har `maxHeight: '90%'`; ScrollView:n inuti har `style={{ flexShrink: 1, maxHeight: 320 }}`. Utan dessa pushar KAV (`behavior="padding"`) hela sheet:en upp och toppen klipps — Email/PlayerName/Password försvinner ovanför skärmen. Med dem krymper ScrollView:n och allt stannar synligt.

**KAV behavior är `"padding"`, INTE `"height"`**: `behavior="height"` har en känd iOS-bugg där KAV:n ibland fastnar i shrunk-läge efter att tangentbordet stängts → sheet:en blir liten även utan keyboard. Stick to padding.

**Password scroll-to-top via `Keyboard.addListener`** (inte `onFocus + setTimeout/RAF`): RAF kör mot stale layout (KAV-padding inte applicerad än), setTimeout är opålitlig mot variation i animations-tid. `keyboardDidShow` fyrar deterministiskt EFTER att KAV-padding och keyboard-animation är klara. Lyssnaren är monterad en gång (deps `[]`) och scrollar till `regPasswordYRef.current` (sparas via `onLayout` på Password-fieldGroup) när `regPasswordFocusedRef.current === true`.

**Scroll bara EN gång per focus-session** (`didScrollRef`-guard inne i listener-effekten, resetas på `keyboardDidHide`): iOS:s autofill/QuickType-bar kan ändra keyboard-frame under typning vilket re-fyrar `keyboardDidShow`. Utan guarden skulle ScrollView:n vara i konstant `animated: true`-scroll och Confirm-knappens hit-target hoppa under användarens tap.

**`keyboardShouldPersistTaps="always"`** på register-ScrollView:n (INTE `"handled"`): edge-case där `"handled"` lät keyboard-dismiss konsumera första tappet på Confirm/Check istället för att fyra `onPress`. `"always"` garanterar att tappet alltid når handler:n.

**`automaticallyAdjustKeyboardInsets` borttaget**: den auto-justerade `contentInset` parallellt med min manuella scrollTo → de fightade och Password klipptes bort. Antingen den ELLER manuell scroll, inte båda.

**PlayerName-scroll** (custom keyboard, ingen system-keyboard-animation): använder fortfarande `requestAnimationFrame` i `onFocus` eftersom CodeKeyboard renderas direkt vid `setRegPlayerNameFocused(true)` — ingen 250ms-animation att vänta på.

## Modal reset patterns

Defensive belt-and-suspenders för att garantera färska fält när användaren öppnar formulär igen:

- **Close-side reset** (`useEffect` på `[profileMenuVisible]` med `if (!profileMenuVisible)` + 300ms timeout): rensar fält efter close-animationen. Räcker normalt men `clearTimeout` i cleanup cancellar resetten om användaren öppnar modalen igen inom 300ms (fast Cancel + Register-tryckning).
- **Open-side reset** (samma effect-deps men `if (profileMenuVisible)`): rensar direkt vid open. Garanterar färsk state oavsett om close-side hann köra. Backup om close-side blev cancellad.
- **Step-side reset** (`useEffect` på `[profileMenuStep]` med `if (profileMenuStep === 'register')`): rensar varje gång användaren navigerar in i `'register'`-steget. Fångar Back→Register-igen-fallet där modalen ALDRIG stängs (`profileMenuVisible` förblir true) men step växlar `'register' → 'menu' → 'register'`. Open-side resetet täcker INTE detta fall eftersom dess dep inte ändras.

Alla tre kör samma reset-logic. Redundansen är medveten — om ett path missar tar ett annat över.

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
- Room code rendered as 6 cells (2 leading letters + 2 digits + 2 trailing letters, e.g. `AB23XY`) using the **same filled-cell styling** as JoinModal's `codeCellFilled` (`Colors.primary` border + `Colors.primaryMuted` bg). Hyphens at every letter/digit-transition (after cell 1 and after cell 3) are separate `<Text style={styles.roomCodeCellDash}>–</Text>`-element (display: `AB-23-XY`). Iterates raw `roomCode.split('')` — canonical form has no hyphens.

**Host layout**: hostBadge ("👑 You are the host") at top, then "Room Code" label (small overline) + cell row in the row stack, then Share-invite button. Standard stacked layout in flow.

**Non-host layout** (gäller både guest och registrerad icke-host som joinat via kod) — empiriskt pixel-tuned:

- **"You are invited"-badge** ovanför "Room Code" (`guestInvitedBadgeWrap` → `guestInvitedBadge` → `guestInvitedBadgeText`). Pill-styling speglar `hostBadge`/`hostBadgeText` exakt (primaryMuted bg + primaryBorder + xs-font + primary-färg) så host- och guest-vyn känns visuellt lika på sin identitets-rad. Wrap absolut-positionerad `top: 6`, `alignItems: 'center'` så pillen krymper till sitt textinnehåll.
- "ROOM CODE" label uses `roomLabelGuestAbsolute` — `FontSize.xxl` (24), letterSpacing 1.2, **absolute-positioned** at `top: 39`, `left: 0`, `right: 0`, `textAlign: 'center'`. (Var tidigare `top: 27` aligned mot logo-mitt vid y≈41; flyttad ned till 39 för att skapa luft mellan badge och label, badge+label är nu primär visuell stack ovanför cellerna istället för att labelen "går genom" loggan.)
- Label is **horizontally centered** in the card (textAlign center on full-width absolute Text) — NOT aligned with the logo's horizontal center. Earlier iteration tried that and Peter rejected it.
- `roomCodeRowGuestSpacing: { marginTop: 64 }` on the row so the cell row clears the logo's lower portion. (Höjt från 52 i takt med label-flytten ovan så label↔cells-relationen bevaras.)
- No "Share invite" button.

`formatRoomCode(code)` from `src/utils/roomCode.ts` inserts hyphens at each letter/digit-transition ("AB23XY" → "AB-23-XY"). **Display-only** — storage (AsyncStorage invites, navigation params) and comparison still use the canonical 6-char form. Used by the OS share message and the Home Waiting-Invites list. The cell-based room-code display in Lobby splits the raw code char-by-char, so it doesn't call `formatRoomCode`.

## Custom CodeKeyboard (`src/components/CodeKeyboard.tsx`)

Custom in-app keyboard som ersätter system-tangentbord på flera fält. iOS har ingen keyboardType som ger letter-only utan "123"-switch, ingen number-only med samma höjd som default-QWERTY → custom view är enda lösningen för strikt content + ingen layout-jump. Används idag av:

- **Room code-cellerna** i JoinModal — letter-mode på cell 0–1, 4–5; digit-mode på cell 2–3. Mode auto-styras av cell-index via `isLetterCellIndex`. Charset = `LETTER_CHARSET` (24 bokstäver, exkl. O/I) + `DIGIT_CHARSET` (0–9). Ingen `onModeToggle` — inget knapp-byte behövs.
- **PlayerName-fältet** i guest-formen OCH register-formen — fri-text-input med både letter och digit. Charset = fullt 26 A–Z + 0–9. `onModeToggle`-callback skickas in → renderar `'123'`/`'ABC'`-toggle-knapp bredvid Backspace i botten-raden.

**Props**:
- `mode: 'letter' | 'digit'` — styr aktuell vy.
- `onPress(char)` — tecken-tap.
- `onBackspace()` — backspace-tap.
- `letterCharset?: string` — override default `LETTER_CHARSET`. För PlayerName: `"ABCDEFGHIJKLMNOPQRSTUVWXYZ"`.
- `onModeToggle?: () => void` — om definierad, render mode-toggle-knapp i botten-raden bredvid Backspace. Utelämnad → bara Backspace.

**Layout-detaljer**:
- Container-höjd är dynamisk från antal letter-rader (`Math.ceil(letterCharset.length / LETTER_COLS)`) — så mode-toggle behåller samma totalhöjd när rader byter (digit-grid stretchas via `flex: 1` på rader). 26 letters i 6 cols → 5 rader (sista har Y/Z + 4 osynliga `keySpacer`-celler för grid-justering).
- TextInputs sätter `showSoftInputOnFocus={false}` — system-tangentbord kommer aldrig fram.

**Code-cell-specifik logik** (gäller bara JoinModal:s code-cells, inte PlayerName):
- **Sekventiell focus**: `handleCellFocus(i)` snäpper fokus till "next-empty cell" (eller sista cellen om alla fyllda så backspace fungerar därifrån). Användaren kan inte tap:a en disallowed cell — markören snäpper tillbaka. Forward = type tecken (auto-advance via `handleCodeCellChange`), backward = backspace (auto-retreat).
- Backspace-knappen i CodeKeyboard:n: tom cell → flytta fokus + töm föregående; ifylld cell → töm sig själv.

`roomCode.ts` exporterar `isLetterCellIndex(index)` (cell 0–1, 4–5 = letter; cell 2–3 = digit) som driver per-cell-sanitize och keyboard-mode. `isBlockedLetterPair(pair)` används av `handleCodeCellChange` för att stoppa manual entry av samma par som `BLOCKED_LETTER_PAIRS`-genereringsfilter blockerar — visar Alert "Combination not compliant — Please re-enter" och avbryter ändringen (cell behåller tidigare värde, ingen auto-focus-shift). Två oberoende checks: leading-paret (cell 0–1) valideras när någon av dem ändras och båda är fyllda; trailing-paret (cell 4–5) valideras separat på samma sätt — så även edge-case:t där användaren går tillbaka och ändrar en redan ifylld cell fångas i båda paren.

**Room code blocklists** (gäller både generering OCH manual entry):
- `BLOCKED_LETTER_PAIRS` — appliceras på BÅDA bokstavsparen (leading cell 0–1 och trailing cell 4–5). Innehåller generella obscena/diskriminerande förkortningar (AS, CP, KK — delas med `playerName.ts`), hat-symbol-förkortningar (SS, NS, AH, HH) samt borderline-fall (NB). Listan är medvetet kort — <2% av 576 möjliga par blockas så false-positives på legitima koder förblir minimala.
- `BLOCKED_DIGIT_PAIRS` — 14, 18 (vit-supremacist-koder), 69, 88. 14/18 var tidigare omöjliga eftersom 1 saknades; nu inkluderat eftersom DIGIT_CHARSET utvidgats till fullt 0–9 (för CodeKeyboard).

## Lobby — TopUserBanner actions (leave & delete)

Bannern är roll-beroende i Lobby (`src/screens/LobbyScreen.tsx`):

- **Host** (hostMode=true): tap → `hostDeleteSheetVisible` Modal med röd "Delete this Game Lobby"-knapp + Cancel. Knappen → Alert "Delete this Game Lobby?" → Yes anropar `deactivateRoom(roomCode)` (tar bort från `mockActiveRooms`), visar **loading-overlay** med "Please Wait — Deleting this Lobby" + animerade våg-prickar (`<WaveDots />`-komponent inline i samma fil) i 1.6s, sedan `router.replace('/')`. **Viktigt**: `setDeletingLobby(false)` MÅSTE anropas explicit innan navigation eftersom Lobby ligger i `(tabs)` och tab-navigatorn bevarar Modal-state över route-replace — annars hänger overlay:n kvar över Home.
- **Non-host** (oavsett guest eller registrerad): tap → `guestLeaveSheetVisible` Modal med röd "Leave Game Lobby — Go to Home"-knapp + Cancel. Knappen → Alert "Leave this Game Lobby?" → Yes sparar **full snapshot** av spelaren via `addLeftPlayer(roomCode, snapshot)` (id, name, emoji, type, age, skill, hcpComplete, approved) → `router.replace('/')`. Sheet-headern visar dynamiskt avatar+namn+status från `players.find(p => p.id === ownPlayerIdRef.current)` — guest får "Guest", registrerad får "Player".
- Profile-tabben i bottom nav är host:s väg till profil-hantering (banner-tappet är inte längre Profile-genvägen för någon i Lobby).

**Non-host detection of room deletion**: useEffect:en (gating på `!hostMode`) initial-check + 2s polling-interval anropar `isActiveRoom(roomCode)`. När den blir false sätts `roomDeletedDetected=true` → separat useEffect triggar Alert "Game Lobby deleted / This Game Lobby has been deleted by Host" med `cancelable: false` → OK → `router.replace('/')`. Polling istället för event-driven eftersom mockstoren saknar event-bus; ersätts med WS/SSE-prenumeration när backend kommer in.

**`hasLeft` orphan injection** (i `useFocusEffect`): efter att ha mappat över befintliga `players[]` och applicerat `hasLeft` på matchande id:n, läggs alla `LeftPlayerSnapshot` som INTE redan finns i listan till som nya `LobbyPlayer`-objekt med `hasLeft: true`. Detta krävs för att en NY user (t.ex. guest B) som joinar samma rum efter att en annan user (guest A) lämnat ska se A:s gråa "LEFT THIS GAME LOBBY"-kort — A finns inte i B:s SEED-baseline. Snapshot:en bär `approved`-flaggan så kortet hamnar i rätt sektion (Approved / To be Approved by Host).

## Lobby — Players in Lobby

Non-host gets a **read-only view** of the player list:

- Section hint changes by mode: "Turn order — top plays first. Use ↑↓ to reorder." (host) → "Playing order — selected by Host" (guest).
- `PlayerRow`'s up/down arrow buttons (`turnArrows` block) are gated on **handler presence** — if neither `onMoveUp` nor `onMoveDown` is passed, the entire turnArrows block is hidden. `LobbyScreen` passes `undefined` for both handlers when `!hostMode` (and även för spelare med `hasLeft: true`). The turn-number badge stays visible.

**Auto-add joining player** (`useEffect` i `LobbyScreen.tsx`): non-hosts inserts into players list immediately on lobby entry as `approved: false`, så de syns i "To be Approved by Host"-sektionen direkt — no separate waiting screen.

- `asGuest=true` + `guestName` (Guest-form path): inserts as `type: 'guest'` from form params, `id = guest-${Date.now()}`.
- `!hostMode` utan guest-form-params (code-only join): loads `loadProfile()` och inserts as `type: 'registered'` from profile (name, avatar, age, skill, spotifyConnected), `id = joiner-${Date.now()}`. Falls back to "You" / 👤 / `type: 'guest'` om profil saknas.

**Deps på URL-params + state-reset (kritiskt)**: useEffect:en deps är `[code, guestMode, guestName, guestBirthYear, guestSkill, hostMode]` — INTE `[]`. Lobby ligger i `(tabs)` och tab-navigatorn återanvänder samma component-instans över transitions (t.ex. `host → home tab → join som guest`). Med `[]`-deps re-fyrade aldrig auto-add när params bytte → nya identiteten lades aldrig in. Effekten reset:ar även `setPlayers(SEED_PLAYERS)` + `ownPlayerIdRef.current = null` i början av varje run så ingen state ärver över.

**`mergeProfileIntoHost` gating**: i `useFocusEffect` är merge:n gated på `hostMode && profile && p.isHost` — INTE bara `profile && p.isHost`. När non-host joinar ska seed-host:en Alex K. visas oförändrad, INTE få den nuvarande user:s profil-data tilldelad (annars ser det ut som att joinaren är host eftersom HOST-badge:n + ens egen avatar/namn syns på det kortet).

**`PlayerRow.hasLeft` rendering**: när `hasLeft: true` får kortet neutral grå border (override:ar approved/waiting-färgerna), avatar dämpas, namn/HCP-rad i `textDisabled`, status-raden ersätts med "LEFT THIS GAME LOBBY"-text, approve-toggle och move-arrows döljs. Host-spelaren får ALDRIG `hasLeft` (defensiv guard i useFocusEffect — host kan inte lämna sin egen lobby).

## Quiz — Get Ready to Vibe intro screen

Hand-off-skärmen mellan Lobby:s Start Game-tap och första quiz-frågan. [src/components/GetReadyIntro.tsx](src/components/GetReadyIntro.tsx) renderas av [app/quiz.tsx](app/quiz.tsx) som en ny `'intro'`-fas — initial fas vid spelstart i båda lägena, OCH mellan rundor i Pass-the-phone (telefon-överlämning).

**Phase union i `quiz.tsx`**: `'intro' | 'question' | 'reveal' | 'leaderboard'`. Init = `'intro'` om `turnOrder.length > 0`, annars `'question'` (graceful degradation om payload saknas/parse-failar — skärmen fastnar aldrig på tom intro).

**Turordning skickas från Lobby via expo-router params**: `LobbyScreen.handleStartGame` bygger `turnOrder = approvedPlayers.filter(!hasLeft).map(p => ({id, name, emoji, avatarUri}))` och pushar som `players: JSON.stringify(turnOrder)` + `gameMode` + `roundsCount` + `roomCode`. `roomCode`-paramet behövs av Quit Game-flödet i quiz.tsx (deactivera rum + clearLeftPlayers vid mid-game-quit). `quiz.tsx` parsar `players` med `try/catch` i `useMemo` så korrupt payload faller tillbaka till tom array. Defensiv `Alert` i `handleStartGame` blockar push om turnOrder är tom (host alltid index 0 i normalflöde, men `hasLeft`-filtret skyddar). Den minimala `TurnOrderPlayer`-shape:n är distinkt från `LobbyPlayer` — bara fälten quiz behöver för att rendera intro:n.

**Mode-dependent fas-flöde i `handleAdvanceToNextRound`**:
- **Pass-the-Phone**: rotera `currentPlayerIndex` (mod `turnOrder.length`) → sätt fas till `'intro'` så "Pass-the-Phone to: <namn>" visas innan nästa fråga.
- **Individual Devices**: hoppa över intro mellan rundor (parallel play, ingen telefon-överlämning) → gå direkt till `'question'`. Vid spelstart visas intro:n dock även här (varje spelare på sin enhet behöver tap för att starta).

**Timer-gate (kritisk)**: `useEffect` som anropar `startTimer()` MÅSTE vara gated på `phase === 'question'` — annars tickar timern under intro:n. `phase` ingår i deps så timern startar om när intro → question.

**`queueNames`-beräkning** (i `quiz.tsx`): `[...turnOrder.slice(currentPlayerIndex+1), ...turnOrder.slice(0, currentPlayerIndex)].map(p => p.name)` — wrap-around så listan visar kommande tur i ordning även när vi cyklar tillbaka till början av turordningen.

**Round/question-progress prop:ar till `<GetReadyIntro>`** (beräknas i `quiz.tsx:if (phase === 'intro')`-grenen):
- `currentRound = Math.floor(questionIndex / playerCount) + 1` — Härledd; `questionIndex` är redan inkrementerat av `handleAdvanceToNextRound` INNAN fasen växlas till `'intro'`, så `questionIndex` pekar alltid på den **kommande** frågan (inte den just-besvarade). Vid spelstart är `questionIndex=0` → currentRound=1.
- `currentQuestion = questionIndex + 1` (1-baserat löpande nummer över hela spelomgången)
- `totalQuestions = totalRounds × playerCount` (redan beräknat i quiz.tsx)
- `playerCount = Math.max(1, turnOrder.length)`
- `queueRoundNumbers[i]` / `queueQuestionNumbers[i]` — parallella arrays till `queueNames`. För kö-position `i` (0-baserat) är spelarens absoluta fråge-position `questionIndex + 1 + i` (1-baserat = `currentQuestion + 1 + i`); ronden = `Math.floor((questionIndex + 1 + i) / playerCount) + 1`.
- **Cap-filter**: kö-spelare vars `absoluteQuestion >= totalQuestions` filtreras bort från BÅDA name- och number-arrayerna parallellt. Skyddar mot wrap-around i sista rundan där en spelare som "kommer på tur" enligt rotationen aldrig faktiskt får sin tur (game ends först). Utan filter skulle UI:t visa rond/fråge-siffror som overshootar `totalRounds`/`totalQuestions`.

**Layout** ([GetReadyIntro.tsx](src/components/GetReadyIntro.tsx)) — fyra delar i SafeAreaView:
1. **Quit Game-bar** (top-left, sticky utanför container): röd-tonad pill (`Colors.errorMuted`-border, `rgba(255,107,107,0.08)`-bg, `Colors.error`-text). `onPress` → Alert med destructive-bekräftelse → `deactivateRoom(roomCode)` + `clearLeftPlayers(roomCode)` + `router.replace('/')`. Renderas bara när parent passerar in `onQuit`-handler. Speglar `handleQuitGame` i quiz.tsx — samma effekt som "Delete this Game Lobby" från Lobby.
2. **Logo corner-accent** (top-right, absolut-positionerad utanför container-flödet): `<QuizVibeLogo size={Math.min(140, SCREEN_WIDTH - 96)} />` med "GET READY / TO VIBE"-text-overlay (`fontSize: 18`, bold). `top: Spacing.xxl, right: 0` placerar den runda kvadratens överkant ungefär i linje med Quit Game-knappens överkant (SVG har transparent padding så elementets bounding-box-överkant är ~26px ovanför visible Q). Pekar inte (`pointerEvents="none"`).
3. **Container** (`flex: 1`, `justifyContent: 'center'`, `alignItems: 'center'`, `paddingBottom: Spacing.xxxl * 2`, `gap: Spacing.xxxl`): Centrerar play+upNext som grupp; den stora paddingBottom biasar centrum uppåt så play landar i övre tredjedelen istället för exakt screen-mitt. Gap:n styr avståndet mellan play och upNext-blocket.
4. **Play-knapp**: 120×120 kvadrat (`Radius.xl`), pulserande+glowande. Glow:en är **cross-platform** via en absolut halo-`View` runt knappen (22px-inset → 164×164, `Colors.primary` bg, animated `opacity 0.35 → 0.8`) PLUS statisk iOS-only shadow med `shadowColor: Colors.primary`. Skala (`1 → 1.06`, 800ms) och glow-opacity körs i två separata `Animated.Value`-loopar, båda native driver.
5. **upNext-blocket**: tre under-block — header-rad, current-player-ruta, kö-lista. Detaljer i nästa avsnitt.

**Round/Question/#Players-räkneverk i upNext-blocket** — gemensamt visuellt språk: 2-rads staplad ruta (rond X på topp, fråga N på botten) med horisontell delar-linje. Cell-modifiers `counterCellTop` (rundade top-corners + `borderBottomWidth: 0.75`) och `counterCellBottom` (rundade bottom-corners + `borderTopWidth: 0.75`) delar borderkant mellan cellerna utan dubbel-border. Tre storlekar:
- **Header-räkneverk** (liten, övre rad): två rader `[Round] [cell-X] of Y` / `[Question] [cell-N] of M` vänsterställt, plus `#Players: N` högerställt på samma rad-höjd via `headerRow` (`flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'center'`). `Round`/`Question`/`#Players:`-labels alla i `Colors.textSecondary` semibold, siffrorna i `Colors.primary` bold. `headerCounterLabel.minWidth: 72` så `Question` får plats men räkneverket sitter tätt intill texten.
- **Stort räkneverk** i nästa-på-tur-rutan (`bigCounter`, width 56, två 38px-höga celler): primary border + `Colors.background`-bg så cellerna sticker fram mot rutans `primaryMuted`-fyllning. Spelarens namn sitter höger om det, `flex: 1` för centrering med subline `Pass-the-Phone to:` i grått ovanför namnet.
- **Mini-räkneverk** per kö-rad (`miniCounter`, width 56 SLOT med inner cells width 36 centered via `alignItems: 'center'`, två 22px-höga celler): tunnare border (`primaryBorder`), `primaryMuted`-bg, primary text. Slot-bredden matchar bigCounter så centerlinjerna linjerar lodrätt över raderna.

**Kö-lista alignment-detalj** (`queueListContent.paddingHorizontal: Spacing.lg + 1.5`): kompenserar för `upNextBox.borderWidth: 1.5` så kö-radernas slot-vänsterkant linjerar med big-counter-vänsterkanten inuti rutan. Med `miniCounter`-slot:en width 56 (samma som `bigCounter`) + samma gap-till-namn (`Spacing.lg`) = både counter-centerlinjerna OCH spelarnamnen ligger i samma kolumn över rutan och alla kö-rader.

**Kö-lista cap**: `ScrollView` med `maxHeight: 180`. Ej-i-budget-spelare (de som filtrerats bort av cap-filtret ovan) renderas inte alls — om alla kö-spelare är out-of-budget faller `{queueNames.length > 0 && (…)}`-gaten naturligt.

## Quiz — Question screen (answering + reveal phases)

Fråge-vyn i [app/quiz.tsx](app/quiz.tsx) är samma layout för `'question'`- och `'reveal'`-faserna — reveal-info renderas inline istället för i en separat skärm. Det betyder att mediakortet, timer-baren, fråge-kortet och TimelineSelector:n stannar synliga genom hela svars→reveal-cykeln, vilket simulerar att "media fortsätter spelas" efter Confirm tills användaren trycker Next Round.

**Ingen Quit Game-bar under question/reveal**: Quit lever bara i GetReadyIntro. Användaren väntar ut timern eller svarar, trycker Next Round, hamnar i kö-listevyn (intro:n) och kan välja Quit därifrån. Konsekvens: i Individual Devices-läget (där intro:n hoppas över mellan rundor) finns idag ingen mid-game-quit-väg — det får återbesökas när Individual Devices särdesignas.

**Timer-progress-bar**: row-layout med bar:en (flex 1) + sekund-räknaren (`{timeLeft}s`) till höger, inom samma `paddingHorizontal: Spacing.lg`-wrapper. Bar:en är 6px hög, `borderRadius: 3`, `Colors.border`-track + animated fill. Färg-trösklar: `>10s = primary`, `≤10s = warning`, `≤5s = error`. `pulseAnim` (Animated.Value) kör opacity 1 ↔ 0.55 i 250ms-loop när `timeLeft <= 5 && phase === 'question'`, annars stop + setValue(1). Sekund-räknaren använder samma `timerColor` + `pulseAnim`-opacity för synk. Sektionen har `marginTop: -Spacing.md` så den limmar mot mediakortets underkant istället för att flyta i ScrollView-content:s gap.

**Action-knapp är fas-medveten** (i [quiz.tsx](app/quiz.tsx), inte i TimelineSelector):

| phase     | isLastQuestion | label                  | bg-färg          | handler                   |
|-----------|----------------|------------------------|------------------|---------------------------|
| question  | n/a            | "Confirm"              | `skillColor`     | `handleConfirm(pendingYear)` |
| reveal    | false          | "Next Round  →"        | `Colors.primary` | `handleAdvanceToNextRound`  |
| reveal    | true           | "🏆  Final Leaderboard"| `Colors.primary` | `handleShowLeaderboard`     |

`skillColor` = `Colors.success` (easy) / `Colors.primary` (intermediate) / `'#F5A623'` (expert) — matchar TimelineSelector:s assist-badge så Confirm-knappen visuellt hör ihop med tidslinjen. Disabled när `phase === 'question' && pendingYear === null` (defensiv — TimelineSelector:s `useEffect` på `selectedYear` notifierar parent direkt vid mount via middleYear, så pendingYear är typiskt aldrig null efter första rendret).

**TimelineSelector — lift-out av Confirm**: Confirm-knappen är borttagen ur [TimelineSelector](app/quiz.tsx) — quiz.tsx äger en enda action-knapp som byter label/handler per fas (se ovan). TimelineSelector exponerar `onYearChange(year)` istället för det gamla `onConfirm(year)`. Implementation: en `useEffect` med deps `[selectedYear, onYearChange]` notifierar parent vid varje scroll-tick (inkl. initial mount via middleYear). Parent-state: `const [pendingYear, setPendingYear] = useState<number | null>(null)` — hanteras separat från `selectedYear` (det "låsta" året efter Confirm). pendingYear nollställs i `handleAdvanceToNextRound` så TimelineSelector startar fresh på nästa fråga.

**`key={questionIndex}` på TimelineSelector** är kritiskt: tvingar remount mellan frågor så internal `selectedYear` reset:as till nya frågans `middleYear`. Utan det skulle stale-state från föregående fråga ärva in (TimelineSelector beräknar middleYear i mount men håller selectedYear i useState efter det). Remount bevarar också scroll-positions-init (`contentOffset={{ x: initialScrollOffset, y: 0 }}`) eftersom propet bara läses vid mount.

**Subtil "Answering: {namn}"-rad**: i fråge-kortet, mellan `questionTop` och `questionText`. Endast Pass-the-Phone (`gameMode === 'pass-the-phone' && currentPlayerName && ...`) — Individual Devices har spelaren på egen enhet och vet redan vem de är. Styling: `FontSize.xs`, `Colors.textSecondary`, namnet i `Colors.textPrimary` + `FontWeight.semibold`. Skicka inte avatar/emoji här — Peter valde uttryckligen "subtilt utan avatar" framför "prominent med avatar".

**Inline reveal-card** (renderas när `phase === 'reveal' && selectedYear !== null`): kompakt **horisontell** layout — år (vänster, 36px primary bold), label "Correct Answer" + hint (mitten, vertikal stack), `+X pts` (höger, primary bold). `paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg` — höjden landar runt 70px (var ~140px med tidigare vertikala layout + ~70px till med separat result-row, totalt ~210px). Den kompakta höjden är ett **explicit krav från användaren** så Next Round-knappen ryms direkt i viewport efter Confirm utan scroll. **Result-row med rätt/fel-ikon + diff-text är medvetet borttagen** — användaren ser sitt val i den låsta TimelineSelector:n (med selector-rutan markerad) och rätt år i kortet, så jämförelsen är synlig utan en egen ruta. Spring-in-animation (`revealScale` 0.6→1, `revealOpacity` 0→1) triggas i en `useEffect` på `phase`-deps som re-set:ar värdena varje gång phase blir 'reveal' (annars körs animationen bara på första frågans reveal).

**Time-out-flöde** (`useEffect` på `[timeLeft]` med gating `timeLeft === 0 && phase === 'question'`): registrerar ronden som missad med `defaultGuess = currentYear - 20` (**inte** pendingYear) och 0 poäng → `simulateOpponentRound(0, false, 30)` → `setPhase('reveal')`. defaultGuess är hårdkodad — användaren straffas med en generisk gissning för att inte ha tryckt Confirm. selectedYear sätts till defaultGuess i samma effect så reveal-renderingen har ett värde att jämföra mot.

**Inga separata `RevealScreen`-komponenter** kvar — den tidigare standalone-komponenten med "View Leaderboard" + "Next Round"-knappar är borttagen. View Leaderboard mellan rundor är borttaget per användarens val: leaderboarden visas bara vid game-end (sista frågans Confirm/timeout → reveal → "🏆 Final Leaderboard"-knappen → `phase = 'leaderboard'` → RoundLeaderboard).

**Mock-frågor cyklas via modulo** (`SEED_QUESTIONS[questionIndex % SEED_QUESTIONS.length]`) — när `totalRounds × playerCount > 5` återanvänds frågorna tills riktig fråge-bank kommer in. Mock-listan är 5 Music-timeline-frågor.

## Shared visual components

- `src/components/QuizVibeLogo.tsx` — brand SVG used on Home and Lobby room-card (both at `size={104}`). The Q-figure (ring + tail + wifi-fan in the center) is shifted **−3 in x, −1 in y** from the original (40, 38) center so the Q+tail bounding box (24-52, 24-52) is centered in the front rounded square (16-60, 16-60, center 38, 38). Wifi-fan replaces the old single dot — three concentric 90°-arcs (radii 3 / 5 / 7, `sweep-flag=1` so they bulge upward) + a 1.5px dot, all centered at (37, 37) (= Q ring center). 90° was chosen over 120° to match the iOS status-bar wifi icon's compactness — sweep-flag=0 produced inverted (frown) arcs, easy to flip back accidentally.
- `src/components/QuizVibeFriendsLogo.tsx` — brand-mark variant for the QuizVibe friends card on Profile. Q-form + tail + rotated squares are identical to `QuizVibeLogo`, but the wifi-pattern inside the Q ring is replaced with two profile silhouettes (head circle + body rounded-rect side-by-side). ViewBox tightened to `"13 13 54 54"` (vs `"0 0 80 80"` in `QuizVibeLogo`) to crop the empty padding around the rotated squares so visible content fills the render area at small sizes (44-52px). Q is centered at **(38, 38)** to match the squares' pre-rotation visual center, NOT (40, 40) which is the viewBox geometric mid. Default `size=44` to match Spotify/YouTube icon-wraps on the same screen; rendered inside a `friendsIconWrap` (44×44 View) for layout-dimension safety.
- `src/components/TopUserBanner.tsx` — full-width banner with a login pill (avatar + Player Name, or "Register or Login" when no profile) in the top-right corner. **Optional `onPress`**: when omitted the pill renders as a plain `<View>` istället för `<TouchableOpacity>` (used on Profile screen — user is already there, no destination); Home passes `setProfileMenuVisible(true)`; Lobby passes role-baserad handler (host → delete-sheet, non-host → leave-sheet — se "Lobby — TopUserBanner actions"). **Optional `profile` prop (controlled mode)**: skärmar med in-place-login (Home — login-modalen lever på samma skärm som bannern) MÅSTE passera sin egen profile-state så bannern uppdateras direkt vid login/logout — useFocusEffect-self-load triggar inte eftersom skärmen aldrig tappar focus. Lobby/Profile utelämnar proppen och låter bannern self-loada via useFocusEffect (de re-renderas naturligt vid tab-byte). **Optional `guestName` prop**: när profile saknas men guestName finns visar pillen 👤 + guestName i muted styling (samma look som "Register or Login"-fallback) — driver display för gäster som joinat lobby:n via guest-form. Registrerade users (profile != null) har företräde om båda råkar vara satta. **Sticky-on-scroll pattern**: place as a direct child of `<SafeAreaView>`, **outside** the `<ScrollView>`, so it remains pinned at the top while content scrolls. Used on Home, Lobby, and Profile screens.
- `src/components/CodeKeyboard.tsx` — custom in-app keyboard som används av Room Code-cellerna i JoinModal OCH PlayerName-fältet i båda flödena (guest + register). Se "Custom CodeKeyboard" för props (`letterCharset`, `onModeToggle`), layout-detaljer och rationale.

## Analytics

Lättviktig wrapper i [src/utils/analytics.ts](src/utils/analytics.ts) — `track(name, props?)`, `identify(userId, traits?)`, `resetIdentity()`. Implementationen loggar bara till console just nu; byt till vendor-SDK (PostHog / Firebase Analytics / Amplitude) när leverantör är vald — call-sites runt om i appen stannar oförändrade.

Event-taxonomi (snake_case verb i preteritum):
- **Lifecycle**: `user_registered`, `user_logged_in`, `user_logged_out`
- **Game flow**: `guest_name_created`, `room_code_created`, `game_started`, `game_completed`
- **Monetization**: `purchase_completed` (props: `type` = `'extra_package'` | `'subscription'` | `'credits'`, `product_id`, `price_amount`, `price_currency`)

Region/land skickas INTE i events — alla större vendors auto-fyller `country_code` via IP/locale så slicing per region funkar i dashboarden out-of-the-box. App Store Connect ger nedladdningar per region som separat datakälla. Skicka inte heller PII (email, fullt namn) i props.

Call-sites finns redan i: `handleRegisterSubmit`, `handleLogin`, `handleLogout`, `handleCreateGame`, `handleJoinAsGuest` ([app/(tabs)/index.tsx](app/(tabs)/index.tsx)) och `QuizScreen` (mount + final leaderboard) ([app/quiz.tsx](app/quiz.tsx)). `purchase_completed` saknar fortfarande call-site — instrumentera när Store-integrationen kopplas in.

## Name-answer model — demo route

`app/name-quiz-demo.tsx` är en fristående demo som visar två-stegs-svaret:

1. **Letter Grid**: 10 prefix-knappar i 5×2-grid, alfabetiskt sorterade (`localeCompare(b, 'sv')` så Å/Ä/Ö hamnar rätt). Single-select.
2. **Final Selection**: lista av fulla namn med matching prefix, alfabetiskt sorterade. Visar `catalog`/`pool`-tag per rad. "← Back" under "Selected: XX"-pillen.
3. **Confirm-steg**: klick på namn highlightar (primary-blå border), Confirm-knappen syns. Klick på Confirm låser → grön "✓ Correct Answer" / röd "✗ Wrong Answer"-feedback med rätt svar.

Demo-data (`src/utils/nameQuizDemo.ts`) genererad för Millennials (1990) + intermediate skill = 2-bokstavs prefix.

**ProgressiveCover** ([src/components/ProgressiveCover.tsx](src/components/ProgressiveCover.tsx)) — mosaik-overlay som avslöjar bilden under sig:
- 32×18 = 576 svarta block, 4 block tas bort per tick (~208ms per tick över 30s = totalt 144 ticks)
- Random reveal-order (Fisher-Yates shuffle) regenererad per `resetKey`-byte
- `<QuizVibeQuestionMarkLogo>` centrerad ovanpå mosaiken, opacity = `1 - revealedCount / TOTAL_BLOCKS`
- `key={questionIndex}` på själva ProgressiveCover (i demo-route) — tvingar full remount vid frågebyte, säkerställer att alla block är svarta från första render utan blink av förra fråges state
- React.memo på `<Block>`-komponenten — bara de 4 block som ändras per tick re-renderas, inte alla 576
- `isRevealed=true` → snap till alla block borta (för Confirm-flow). I demon visas bilden direkt vid Confirm; i framtida quiz-integration ska mosaik fortsätta tills timer slut även efter Confirm (öppen design-fråga, dokumenterad i konversation).
- Original-bilden under är ALDRIG pixlad — den är skarp hela tiden, bara skymd av cover-block som plockas bort. Bilden själv klipps inte — `mediaCard` har `overflow: 'hidden'` + `aspectRatio: 16/9`.

**logoSize-tweaking** för QuizVibeQuestionMarkLogo i mediaCard: 320 är empiriskt lagom för 16:9 på iPhone (~390px wide × 220px tall). 360+ klipps av top/bottom. <280 ser för litet ut.

## Shared visual components (sessions-tillägg)

- [src/components/QuizVibeQuestionMarkLogo.tsx](src/components/QuizVibeQuestionMarkLogo.tsx) — variant av `QuizVibeLogo` med `?`-glyph (SVG `<Text>`) i Q-ringen istället för wifi-fan. Squares + Q-ring + Q-svans identiska. ViewBox 0-80 × 0-80, Q-ring center (37, 37). `?` placeras på y=43 så glyph-mitten hamnar runt y=37 (SvgText:s y refererar till baseline).
- [src/components/ProgressiveCover.tsx](src/components/ProgressiveCover.tsx) — mosaik-reveal-cover (se "Name-answer model — demo route").

## Scripts

`npm start` (Expo dev), `npm run ios` / `android` / `web`, `npm run lint` (`expo lint`). No tests, no CI.

`backend/`-projektet har egna scripts: `npm test` (vitest, 77 tester), `npm run validate` (parsea katalog), `npm run export-demo` (regenerera demo-data), `npm run wikimedia-search <id>`, `npm run wikimedia-process <id>`, `npm run demo` (skriver ut Letter Grid-output i konsolen).

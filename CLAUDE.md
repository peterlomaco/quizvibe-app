# QuizVibe

Expo Router quiz app (React Native 0.81, React 19, Expo SDK 54). Dark-themed, mobile-first. Mock data on the client; en `backend/`-folder är påbörjad för content-katalog + bild-pipeline (ingen live-API ännu — se "Backend" nedan).

## Routing

`"main": "expo-router/entry"` — file-based routes in `app/`.

- `app/_layout.tsx` — root Stack registrerar alla skärmar individuellt. `screenOptions={{ headerShown: false }}` på Stack-nivå så ingen native-header visas.
- **Ingen bottom tab-bar** (D-0 2026-05-12). Tidigare hade vi `app/(tabs)/_layout.tsx` med 5 tabs (Home/Profile/Lobby/Leaderboards/Store) men det är borttaget — alla skärmar är plain Stack-routes. Navigation mellan dem sker explicit via TopUserBanner, in-screen-knappar (Profile settings/Store i login-modaler) och `router.push/replace` med `from`-param för Back-routing. Lobby + Quiz har sina egna exit-knappar (Quit Game / Leave Game) som enda utväg.
- `app/index.tsx` — Home screen + JoinModal + Logo (2k+ lines, needs splitting). Innehåller även en temporär "🧪 Try Name Quiz Demo"-knapp efter footer som navigerar till demo-routen.
- `app/{lobby,profile,leaderboards,store}.tsx` — thin re-exports of `src/screens/*Screen.tsx`.
- `app/quiz.tsx` — gameplay screen.
- `app/name-quiz-demo.tsx` — fristående skiss-demo för Namn-svarsmodellen (Letter Grid + Final Selection + ProgressiveCover-mosaik). Använder hardcoded data från `src/utils/nameQuizDemo.ts` (auto-genererad via `cd backend && npm run export-demo`). Inte integrerad med befintlig quiz-flow ännu.
- **Leaderboards-entry**: efter D-0 saknas en explicit ingång till `/leaderboards` (tidigare via tab-bar). Avvaktas — Home-shortcut + ev. Profile-link designas senare.

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
- `src/utils/mockActiveRooms.ts` — **in-memory `Map<string, RoomMeta>`** över aktiva rumkoder + per-room metadata. `RoomMeta = { maxPlayers: 4 | 12; hostIsPremium: boolean; currentPlayerCount: number; hostPlayerName: string }`. API:
  - `registerActiveRoom(code, meta)` vid Create Game/Play Again — host:s `maxPlayers` + `hostPlayerName` läses från profil, `hostIsPremium` är hardcodad `false` med TODO tills subscription-state finns.
  - `isActiveRoom(code)` + `isLobbyFull(code)` + `isOwnLobby(code, playerName)` + `getRoomMeta(code)` — driver join-validation i `handleJoinWithCode`/`handleJoinAsGuest`. `isLobbyFull` + `isOwnLobby` är fail-open (false om koden saknar meta eller playerName är tomt). `isOwnLobby` jämför case-insensitive trim mot `hostPlayerName`.
  - `setRoomPlayerCount(code, n)` + `setRoomMaxPlayers(code, max)` — Lobby:s sync-effekter skriver tillbaka när `players` ändras eller host togglar Max 4/12 (maxPlayers-syncen är gated på `hostMode` så non-host:s default-state aldrig överskriver host:s val).
  - `deactivateRoom(code)` när host trycker Delete this Game Lobby. Idempotent.
  - Sessions-bunden (förstörs vid app-reload).
  - **Test-seeds**: `'AB23XY'` (Free, max 4, count 1, joinable) + `'QV45LV'` (Premium, max 12, count 1, joinable) + `'AB99FF'` (Free, max 4, FULL → triggar "or to upgrade"-popup) + `'QV99FF'` (Premium, max 12, FULL → triggar "remove players"-popup). Alla seeds har syntetiska `hostPlayerName` (`TestSeedHost1`–`TestSeedHost4`) som inte matchar real-user-namn så `isOwnLobby` aldrig fyrar mot dem.
  - **Capacity-popup-helper** `checkLobbyCapacity(code)` i [app/index.tsx](app/index.tsx) anropas från båda join-handlers efter `isActiveRoom`-checken. Returnerar `true` om popup visades (= caller abortar). Free host: "Lobby is full. Host either need to remove players from lobby or to upgrade". Premium host: "Lobby is full. Host need to remove players from lobby for others to join".
  - **Own-lobby-check** via `isOwnLobby(code, playerName)` körs i båda join-handlers FÖRE capacity-check (mer specifikt felmeddelande först). `JoinModal` får `currentPlayerName` som prop från HomeScreen (`profile?.playerName ?? null`). `handleJoinWithCode` jämför mot `currentPlayerName`; `handleJoinAsGuest` jämför mot BÅDA `currentPlayerName` OCH `guestName.trim()` så identitet både via inloggning och guest-form-input fångas. Popup: "User already exists in the lobby". Use case: samma user inloggad på två enheter försöker använda Join Game från device B med koden från device A.
- `src/utils/leftPlayers.ts` — **AsyncStorage** per rumkod. Lagrar `LeftPlayerSnapshot[]` (inte bara id) så nya joiners som inte har lämnande spelaren i sin SEED-baseline kan rendera kortet med `hasLeft`-styling via orphan-injection (se "Lobby — TopUserBanner actions" nedan). `addLeftPlayer(roomCode, snapshot)`, `getLeftPlayers(roomCode)`, `clearLeftPlayers(roomCode)` (anropas av `handleCreateGame`/Play Again för fresh slate på återanvänd kod).
- `src/utils/mockLobbyPlayers.ts` — **in-memory `Map<string, LobbyPlayer[]>`** för host:s authoritative player-lista per rumkod. Host:s `useEffect` på `players[]` skriver hela arrayen via `setLobbyPlayers(code, players)`; non-host:s polling läser via `getLobbyPlayers(code)` och rebuilds lokal state. `clearLobbyPlayers(code)` rensar tillsammans med `deactivateRoom`/`clearLeftPlayers` på alla lifecycle-sites. Importerar `LobbyPlayer` som `import type` för att undvika runtime-circulär dep (LobbyScreen → utils → LobbyScreen).
- `src/utils/mockLobbySettings.ts` — **in-memory `Map<string, LobbySettings>`** för host:s authoritative game-settings (gameMode, singlePlayerDefault, region, answerResponseSeconds, eraFrom/To, roundsCount, selectedExtraPackages, youtubeEnabled, spotifyHostToggle, profilesEnabled). Driver non-host:s vy av Game Mode-toggle, Region Scope, Game Era, Number of Rounds, Answer response time, Customized Host packages och Game Connections-pillar. `setLobbySettings`/`getLobbySettings`/`clearLobbySettings`. Skiljd från `mockLobbyPlayers` så ändringar i en sub-domän inte triggar onödig sync av den andra.
- `src/utils/ejectedPlayers.ts` — **in-memory `Map<string, Set<string>>`** över spelare host har radat (trash) eller indirekt utkastat (single-player-default-toggle ON för alla non-hosts). `markEjected(code, playerId)`, `isEjected(code, playerId)`, `clearEjected(code)`. Non-host:s polling-effekt körs PRE-flight (innan settings/players-läsning) — om self är markerad → "User have been removed from this lobby"-popup + Home navigation, och resten av sync hoppas över.
- `src/utils/mockStartedGames.ts` — **in-memory `Set<string>`** över rumkoder där host tryckt Start Game och navigerat till `/quiz`. `markGameStarted(code)` anropas i `handleStartGame` precis före `router.push('/quiz')`. Non-host:s polling-effekt kollar `isGameStarted(code)` PRE-flight efter eject-checken — träff + self är **inte** approved → "Game already started — Host started game without this user"-popup + Home navigation. Approved non-hosts hanteras INTE här ännu (separat gap: ingen real-time sync flyttar dem till /quiz mock-tiden ut). `clearGameStarted(code)` ingår i cleanup-bunten.

**Per-user-namespacing** för friends + waitingInvites (för att undvika att User A:s data syns för User B vid logout/login på samma device):
- AsyncStorage-nyckeln innehåller inloggade user:s playerName lowercase: `@quizvibe/friends/v1/<playerName>`, `@quizvibe/waitingInvites/v1/<recipient-playerName>`. Identifieras via `loadProfile()` inuti varje load/save i `friendsStorage.ts` resp. `waitingInvites.ts`. När backend kommer in byts detta mot user-id från auth-token.
- `addInvite(toPlayerName, invite)` tar mottagarens playerName som **explicit första-arg** eftersom invites är cross-user — kan inte härledas från inloggad profil (= avsändaren). Lobby:s `handleInviteFriend` passar `friend.playerName`. `loadInvites`/`removeInvite` opererar däremot på inloggade user:s inbox.
- **One-shot reset** vid första load efter migrationen: `ensureFriendsReset` / `ensureInvitesReset` läser `getAllKeys()`, filtrerar `@quizvibe/friends/v1*` resp. `@quizvibe/waitingInvites/v1*`, `multiRemove`:ar alla, sätter en migrations-flagga (`@quizvibe/migration/friendsReset/v1` etc.) så reset:n bara körs en gång. Alla startar tomma — undviker att stale legacy-data ärvs av "första-bästa user efter fix" (bug i en tidigare migrationsversion).
- **Ej namespacad** ännu: `gameResults.ts` (samma globala-nyckel-bugg, parkerad).

## Backend (content catalog + image pipeline)

`backend/` är ett separat Node-projekt med egen `package.json` (sharp, zod, js-yaml, vitest, tsx). 77 tester, alla gröna. Live-call-CLIs mot Wikipedia/Commons + mock data exportör för klient-demo. Ingen live HTTP-API ännu — Supabase-setup parkerad.

**Struktur**:
- `backend/content/catalog/*.yaml` — innehållslistor per generation × kategori. 5 generations-grupper: `elder` (Silent + Boomers, 1925-1964), `gen-x`, `millennials`, `gen-z`, `gen-alpha` + `'all'` (baseline). Items har: `id` (kebab-case), `displayName`, `correctYear`, `probability` (0-100), `wikimediaSearchHints[]`, `answerMethods: ('timeline'|'name-letters')[]`, `sensitivity: 'standard'|'sensitive'`. 64 items totalt över persons/capitals/artists. **Fiktiva karaktärer (Elsa, Spider-Man, Mario, Sonic, Peppa Pig, Bluey, Wednesday Addams) togs bort 2026-05-10** — officiella karaktärs-illustrationer är upphovsrättsskyddade och kan inte användas i kommersiell quiz-app utan licens. Återinför ev. via skaparen (Miyamoto → Mario, Idina Menzel → Elsa).
- `backend/content/schema.ts` — Zod-schema. Validation: items med `'timeline'` i answerMethods MÅSTE ha `correctYear`. Cross-audience-figurer (Zlatan, Cristiano, Messi, ABBA, Madonna, etc.) listas en gång per fil — registry tolererar dubblett-IDs över filer men kräver unika inom en fil.
- `backend/content/registry.ts` — `loadCatalog`, `findItemsForAudience` (default `excludeSensitive: true` → Hitler/Stalin filtreras bort i spelutbud, admin sätter `excludeSensitive: false` för full vy), `findItemsById`.
- `backend/content/generation.ts` — `birthYearToGeneration`, `generationDistance`, `getLetterGridConfig` (assistance → prefix-längd: full=3, standard=2, minimal=1; specialregler: född 2016+ alltid hela namn; 2013-2015 hela namn om distance>1; övriga hela namn om distance>2 — Millennials har max-distance 2 så får alltid prefix).
- `backend/content/distractors.ts` — `getPrefixForItem` (extraherar prefix, behåller diakriter, skipparar non-letters), `buildLetterGrid`, `buildNameOptions`. Pool-strategi: kategori+audience → kategori-fallback → `distractor-pool.yaml` med ~50 plausibla namn per kategori. `NameOption.source` = `'catalog'` eller `'pool'`.
- `backend/wikimedia/client.ts` — Wikipedia pageimage-lookup (primär källa, kuraterade huvudbilder) + Commons text-search (fallback) + license/artist från Commons imageinfo. CLI: `npm run wikimedia-search <item-id>`.
- `backend/wikimedia/processor.ts` + `process.ts` — `fetchImage` + sharp-pipeline (resize max 1920×1080 med aspect ratio bevarat + WebP @ q85). CLI: `npm run wikimedia-process <item-id>`. Output till `backend/output/` (gitignore:ad).
- `backend/scripts/export-demo.ts` — genererar `src/utils/nameQuizDemo.ts` med 3 förgenererade frågor (Astrid, Stockholm, Cristiano) inkl. Letter Grid + name-options per prefix. CLI: `npm run export-demo`.
- `backend/scripts/export-image-questions.ts` — genererar `src/utils/quizImageQuestions.ts` med Letter Grid + distractor-options för alla items i `assets/quiz-images/`. Pre-bakas för Millennials/standard-profilen (prefix-length=2). CLI: `npm run export-image-questions`. Regenerera efter att nya bilder lagts till.

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
- Theme tokens, never raw hex. `Colors.background`, `Spacing.md`, etc. Brand-paletten har **två blå-nyanser**: `Colors.primary` (`#4DA3FF`, default brand) och `Colors.primaryDark` (`#114E91`, mörk variant — används för subtila accenter som single-player-checkboxens border).
- Screens currently mix layout, modals, and domain logic in one file — when extending, prefer extracting sub-components into `src/components/`.
- **Border-cutting badge pattern** for "tag" labels that overlap a card/button border (HOST/GUEST in `PlayerRow`, FREE on the Register button in `app/index.tsx`, FREE/PREMIUM on the Game Mode toggle in `LobbyScreen`). The badge is `position: 'absolute'` with `top: -8`, a matching `backgroundColor` to the parent border, and `paddingHorizontal: 8 / paddingVertical: 2`. The parent must be `position: 'relative'` and must NOT use `overflow: 'hidden'`, or the badge gets clipped.
- **Host-vs-non-host settings pattern** (Game Mode buttons, mfl.): default är att alltid rendera kontrollen för alla i lobbyn så icke-host ser hostens val i real-tid, men passera `disabled={!hostMode}` så bara host kan ändra. Read-only state använder fortfarande brand-colors så hostens val är läsligt. Don't gate the JSX with `{hostMode && (…)}` for these — that's the wrong default.
  - **Undantag: Game Connections-blocket** (YouTube/Spotify/Profiles & Places-rader + "Customized Host packages"-sub-blocket). Här gömmer vi alla switchar, "Select all"-raden och Buy CTA för icke-host. Guests ser bara Enabled/Disabled-pillar på source-raderna och en read-only lista över *aktiva* paket (filtrerad via `selectedExtraPackages`) i en active-stylad text-box. Spotify-rad-info-(i)-ikonen behålls även för guests så de förstår varför Spotify ev. är Disabled. Sub-rubriken byter till "Packages for this lobby selected by the Host:" när `!hostMode`.

## Player Name (registration + validation)

**Format spec** (`src/utils/playerName.ts`): `[Letters]-[Digits]` där Letters = 1–10 A–Z (första versal, resten gemener) och Digits = 0–7 siffror. Dash är optional i lagrad form — om användaren inte typar några digits sparas namnet som `Anna` (inte `Anna-`). Exempel: `Anna`, `Anna-1234`, `GuestAbcde-1234567`.

Helpers exporteras: `appendPlayerNameLetter`, `appendPlayerNameDigit`, `backspacePlayerNameLetters`, `backspacePlayerNameDigits`, `normalizePlayerName`, `isPlayerNameFormatValid`, `hasBlockedLetterLead`, `getPlayerNameLetters`, `getPlayerNameDigits`. Konstanter: `PLAYER_NAME_MAX_LETTERS = 10`, `PLAYER_NAME_MAX_DIGITS = 7`.

**`generatePlayerName(taken, options)`** tar `{ prefix?, keepLetters?, targetLetterLength? }`:
- `prefix: 'Guest'` → `GuestAbcde-1234567`. Prefix normaliseras (G versal + rest gemener) och första random-bokstaven efter prefix capitaliseras (`A` i `Guestabcde`-position) så användaren visuellt ser var prefixet slutar; resten gemener. Total letter-section = 10 chars (prefix 5 + random 5). Plus 7 random digits.
- Inget `prefix` (Register-default) → `Abcdefghi-1234567` (9 random letters + 7 digits, första versal, resten gemener).
- `keepLetters: 'Anna'` → bevarar exakt typade letters, randomiserar bara digits. Används av "Try to keep PlayerName letters?"-promptens Yes-branch.

**Format-regex** `PLAYER_NAME_FORMAT_RE = /^[A-Z][A-Za-z]{0,9}(-[0-9]{1,7})?$/` — tillåter internal uppercase efter första bokstaven (så `GuestAbcde` validerar) och dash + 1–7 digits är optional. Orphan trailing dash (`Anna-`) är invalid och strippas av `normalizePlayerName` innan validation/save. Manuell input via CodeKeyboard styrs av `appendPlayerNameLetter` som följer striktare regel (första versal/resten gemener); regex:n är därmed bara löst nog att inte underkänna giltiga auto-genererade kombinationer.

**Filter aktiva både i auto-gen OCH manuell input**:
- `BLOCKED_LETTER_LEAD_PAIRS` (`AS, CP, KK, SS, NS, AH, HH, NB`) — synkad med `BLOCKED_LETTER_PAIRS` i `roomCode.ts`. Filtrerar de första 2 bokstäverna. Auto-gen retry:ar; manuell input blockas via `hasBlockedLetterLead()` i `validatePlayerName`/`validateAddPlayerName`.
- `containsProfanity()` (l33t-normalisering + obfuscation-strip) körs på alla auto-gen kandidater + alla manuella Check-tryck.

**`normalizePlayerName(value)`** strippar trailing dash så `Anna-` → `Anna`. Anropas på två platser:
1. Check-handlers (innan validation) så statusen baseras på den slutgiltiga formen.
2. Save-/navigation-sites (`handleRegisterSubmit`, `handleJoinAsGuest`, `AddPlayerModal.handleAdd`) som defensiv belt-and-suspenders så trailing dash garanterat inte läcker till persisted state.

**Split-field UI** (i alla tre forms — JoinModal guest + Register + AddPlayerModal): två separata TextInputs `[Letters] – [Digits]` med fixed text-separator `–` mellan. State håller sammansatt sträng (`"Anna-1234"`) som single source of truth; fälten visar derived `getPlayerNameLetters(state)` / `getPlayerNameDigits(state)`. Letters-fältet är alltid editable; digits-fältet dimmas (`opacity 0.45`) + blir read-only tills letters har minst 1 tecken (digit-tap snäppar fokus tillbaka till letters om tomt). Backspace dispatchas per fokuserat fält:
- `backspacePlayerNameLetters` tar bort sista letter; om letters töms helt clearas digits + dash också (orphan-prevention).
- `backspacePlayerNameDigits` tar bort sista digit; om digits töms tas dashen bort så letter-fältet blir editable.

**Field-styling** (`playerNameLettersInput` flex 7, `playerNameDigitsInput` flex 6, båda `paddingHorizontal: Spacing.sm` + `textAlign: 'center'`): empiriskt tunad ratio så `GuestAbcde` (10 chars) ryms i letters och alla 7 digits ryms i digit-fältet. Reducerad padding (8px vs default 16px) sparar 16px content-yta per fält. `playerNameSeparator` är fontSize 22, `Colors.textSecondary`, `paddingHorizontal: 2`.

**Cursor-låsning på alla 6 inputs** — `selection={{ start: value.length, end: value.length }}` håller cursor efter sista tecknet vid varje render, `selectTextOnFocus={false}` förhindrar select-all vid focus, `contextMenuHidden={true}` döljer Cut/Copy/Select All-context-menyn. Resultat: enda sättet att redigera är via CodeKeyboard:s Backspace som alltid tar sista tecknet i fokuserat fält.

**Auto-generate prompt** "Try to keep PlayerName letters or not?" (Cancel / Replace all / Keep letters) visas när användaren tappar Auto-generate och letters-sektionen har innehåll. Tom field → genererar direkt utan prompt. Replace all = ny full random; Keep letters = behåller letters, randomiserar bara digits. Knappen är ALLTID enabled (förutom under `status === 'checking'`) — Remove är aktiv när field har innehåll.

**Register-formen auto-fyller INTE PlayerName** (efter sessionsbeslut): fältet startar tomt. Användaren måste typa själv eller trycka Auto-generate. Guest-formen och AddPlayerModal auto-fyller fortfarande vid open via `prefix: 'Guest'`-pathen.

**`validatePlayerName(name)` / `validateAddPlayerName(name)`** kontrollerar i ordning: (1) `isPlayerNameFormatValid`, (2) `hasBlockedLetterLead`, (3) `containsProfanity`, (4) uniqueness mot mock taken-lista. Returnerar `'available' | 'taken' | 'invalid'`. UI status-type: `PlayerNameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'`.

**Field-labels** (Register + JoinModal guest): "Player Name - Letter-digit format". **Format-hint under fältet** (alla tre forms): "Format: 1-{PLAYER_NAME_MAX_LETTERS} letters, 0-{PLAYER_NAME_MAX_DIGITS} digits" — deriveras från konstanterna så framtida ändringar slår igenom automatiskt.

**Auto-fill-detektion-regex** i `handleJoinAsGuest` analytics: `/^Guest[A-Z][a-z]{4}-\d{7}$/` matchar Guest-prefix + capitalized first random + 4 lowercase random + 7 digits.

`handleLogin` accepts **Player Name OR email** as identifier — if input contains `@`, the email-prefix is derived as the saved `playerName` (mock; real auth will resolve email → playerName via backend lookup).

Default Assistance='standard', Region='global' on the Register form so the user can submit immediately after Year of birth — both fields show under a "Use default or select prefered setup" hint.

**Year of birth-caps**: Profile, Register-form och Guest-form har gemensamma cap:ar `MIN_BIRTH_YEAR = 1930`, `MAX_BIRTH_YEAR = 2020`. Endpoints renderas via `formatBirthYear`-helper som lägger till "or earlier" på 1930 och "or later" på 2020 — representerar öppna intervall (alla födda ≤1930 / ≥2020). `formatBirthYear` används både i picker-listan och i selector-trigger-texten så framing är konsistent. Profile + Register + Guest delar samma `BIRTH_YEARS`-array och format-helper (Profile har egen kopia eftersom den lever i en annan fil — håll dem synkade vid framtida ändringar).

**Password** (Register-form): `REG_PASSWORD_MIN_LENGTH = 6`, `REG_PASSWORD_MAX_LENGTH = 32`. Placeholder + maxLength + format-hint ("Format: min 6-32 characters") under fältet deriveras från konstanterna. Min 6 = NIST-baseline så användare inte tvingas migrera vid backend-integration. Max 32 = under bcrypt:s 72-byte-cap med marginal + täcker alla realistiska lösenord/passphrases utan att blåsa upp testytan.

**Assistance level** (`'minimal' | 'standard' | 'full'`, persisted as `ProfileData.assistance`) styr mängden hjälp i spelet — `full` = mest hjälp (3-letter prefix i Letter Grid, snabb reveal-curve), `standard` = 2-letter prefix + linjär reveal, `minimal` = 1-letter prefix + slow reveal som aldrig fullt avslöjar bilden. Tidigare hette fältet `skill` med värdena `easy/intermediate/expert`; båda `loadProfile` (i `profileStorage.ts`) och `loadLatestResult` (i `gameResults.ts`) gör dual-read av gammalt fält + värde-mappning så befintliga profiler/resultat migreras passivt vid nästa save. Mappning: `easy → full`, `intermediate → standard`, `expert → minimal`.

**Stylesheet-keys medvetet kvar som `skillRow`/`skillBtn`/`skillBtnText`** i `app/index.tsx` och `LobbyScreen.tsx` även efter rename:n — det är privat CSS-vokabulär per fil (inte domän-koncept) och de exporteras inte. Att jaga dem skulle bara öka diff-ytan utan att förbättra läsbarhet. Skapa nya stylesheet-nycklar med `assistance*`-prefix om du behöver mer styling, men byt inte namn på de befintliga reflexmässigt.

`handleLogin` accepts **Player Name OR email** as identifier — if input contains `@`, the email-prefix is derived as the saved `playerName` (mock; real auth will resolve email → playerName via backend lookup).

Default Assistance='standard', Region='global' on the Register form so the user can submit immediately after Year of birth — both fields show under a "Use default or select prefered setup" hint.

**Year of birth-caps**: Profile, Register-form och Guest-form har gemensamma cap:ar `MIN_BIRTH_YEAR = 1930`, `MAX_BIRTH_YEAR = 2020`. Endpoints renderas via `formatBirthYear`-helper som lägger till "or earlier" på 1930 och "or later" på 2020 — representerar öppna intervall (alla födda ≤1930 / ≥2020). `formatBirthYear` används både i picker-listan och i selector-trigger-texten så framing är konsistent. Profile + Register + Guest delar samma `BIRTH_YEARS`-array och format-helper (Profile har egen kopia eftersom den lever i en annan fil — håll dem synkade vid framtida ändringar).

**Assistance level** (`'minimal' | 'standard' | 'full'`, persisted as `ProfileData.assistance`) styr mängden hjälp i spelet — `full` = mest hjälp (3-letter prefix i Letter Grid, snabb reveal-curve), `standard` = 2-letter prefix + linjär reveal, `minimal` = 1-letter prefix + slow reveal som aldrig fullt avslöjar bilden. Tidigare hette fältet `skill` med värdena `easy/intermediate/expert`; båda `loadProfile` (i `profileStorage.ts`) och `loadLatestResult` (i `gameResults.ts`) gör dual-read av gammalt fält + värde-mappning så befintliga profiler/resultat migreras passivt vid nästa save. Mappning: `easy → full`, `intermediate → standard`, `expert → minimal`.

**Stylesheet-keys medvetet kvar som `skillRow`/`skillBtn`/`skillBtnText`** i `app/index.tsx` och `LobbyScreen.tsx` även efter rename:n — det är privat CSS-vokabulär per fil (inte domän-koncept) och de exporteras inte. Att jaga dem skulle bara öka diff-ytan utan att förbättra läsbarhet. Skapa nya stylesheet-nycklar med `assistance*`-prefix om du behöver mer styling, men byt inte namn på de befintliga reflexmässigt.

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

Five top-level collapsible sections — all use the same tappable-header pattern with a `+/−`-toggle box (26×26, `borderColor: borderStrong`) next to the title (`Typography.title` + bold + `Colors.textPrimary`). When collapsed, a 1px `sectionDivider` line shows under the header for visual separation. Default expanded; state per section is local (not persisted across app restarts).

1. **Profile default settings** — avatar + Player Name (read-only `Text`, set at registration, NOT editable from this screen), competition setup (Year of birth, auto Competition Age, Assistance level), Save Profile button. Innehåller bara user-defaults nu — host-defaults har lyfts ut till egen top-level sektion (#2).
2. **Host default settings** — Game Mode (Pass-the-Phone vs Individual Devices), Number of Players per Game, Region scope + Answer response time, Game era, Number of Rounds, "Save Host settings"-knapp. Tidigare en sub-rubrik inom Profile defaults; lyftes ut 2026-05-06 till egen kollapsbar sektion för att hålla sektionerna semantiskt separerade.
3. **Customized Host packages** — "+ Add host packages"-CTA + "Purchased and available when you are the Host:"-listrubrik + per-paket-toggles + "Select all"-toggle på egen rad + "Save settings"-knapp. Driver `enabledHostPackages` i ProfileData (se "Customized Host packages" nedan).
4. **Game connections** — Spotify card + QuizVibe friends card. Båda delar `spotifyHeader/spotifyTitle/spotifySubtitle/spotifyBtn`-styles för strukturell konsistens; bara accent-färger och ikon skiljer (Spotify green, friends primary blue). **Spotify-kortets border** är `#1DB954` (Spotify-grön) bara när `spotifyConnected === true`; i ocopplat läge override:as den till `#3A3F4B` (samma muted-grå som `iconWrapMuted`) via `spotifyCardMuted` så hela kortet signalerar "inactive" tills user kopplar konto. Den gröna bg-tinten (`rgba(29,185,84,0.08)`) lämnas oförändrad så blocket fortfarande läses som "Spotify". YouTube-membership-kortet plockades ut 2026-05-06 — användaren kommer tills vidare inte blanda in YouTube-konton i appen (YouTube finns kvar som content-source-toggle i Lobby:s Game Connections, men det är källflagga, inte konto-koppling).
5. **Player history** — `src/components/PlayerHistorySection.tsx` manages its own collapse state. HCP shield lives in a dedicated card directly under the section heading (was previously in the profile card).

**Tre oberoende Save-knappar** (en per editable sektion: Profile defaults, Host defaults, Customized packages — `'defaults' | 'host' | 'packages'`). Driver av `savedSection`-state — när en knapp trycks visar bara den knappen "✓ Saved" i 2 s, övriga står kvar i sin label. Underliggande `handleSave(section)` persisterar hela profilen i ett svep oavsett knapp (en blob i AsyncStorage); det är bara den visuella bekräftelsen som är knapp-lokal.

**Game era slider** mirrors Lobby's `MultiSlider` pattern (`ERA_MIN=1930`, `ERA_MAX=current year`, `SLIDER_WIDTH=280`, default `[1980, 2010]`). No player-clamping on Profile — it's host-default setup with no players in context. Persisted as `gameEraFrom`/`gameEraTo` on `ProfileData`. Loadning clampar from/to till nuvarande range eftersom äldre profiler (när ERA_MIN var 1900) kan ha sparat värden < 1930 — utan clamp:n skulle rutan ovan visa t.ex. "1925" medan thumben sitter låst på 1930.

**Game era — shared spec mellan Profile och Lobby** (host-vyn):
- Titel: "🕐 Game Era (min 10 year interval)" (Lobby) / "Game era (min 10 year interval)" (Profile-fieldLabel).
- Year-range-ruta: gul-glödande `eraGuestBox` (border `#F5A623` = `Colors.warning`, bg `rgba(26,48,80,0.92)`) — visar `{from} – {to}` i samma stil som in-game year-selector i `app/quiz.tsx`. Profile har en privat copy av styles (`eraGuestBoxWrap` / `eraGuestBox` / `eraGuestBoxText`) som speglar Lobby-versionen 1:1.
- Slider-linje: tunn 6 px hög ruta (`trackStyle.height: 6`) som extends/shrinks i bredd. `selectedStyle` = guld-fylld glödande pill (`backgroundColor: Colors.warning`, `shadowColor: Colors.warning`, `shadowOpacity: 0.85`, `shadowRadius: 8`, `elevation: 4`, `borderRadius: 3`). Ingen border (gold-on-gold = onödig). `unselectedStyle.backgroundColor: Colors.border` ger subtil grå bakgrunds-track så slider-räckvidden syns.
- **Custom markers** ([src/components/EraSliderMarker.tsx](src/components/EraSliderMarker.tsx), delas av Lobby + Profile): `customMarkerLeft={EraMarkerMinus}` + `customMarkerRight={EraMarkerPlus}` (kräver `isMarkersSeparated`) renderar 24×24 solid-guld cirklar med "−" / "+"-glyph (Colors.background-färg, fontSize 18, weight 900) — växer till 28×28 vid drag. `markerOffsetY={3}` är **kritiskt** — utan det lägger MultiSlider thumben med center vid fullTrack-top istället för track-centerline (= track-höjd / 2 = 3 på en 6 px-track). Tidigare hidden-marker-mönster (`customMarker={() => null}`) testades men användarna hittade inte drag-zonerna och slidern kändes "fastnad" — synliga thumbs är nödvändiga för att förmedla extend/shrink-affordance.
- **SLIDER_INSET** (12 px på vardera sida): `SLIDER_WIDTH = 280` är viewport-bredden men `sliderLength = SLIDER_INNER_WIDTH = 256` skickas till MultiSlider. DecadeMarks räknar in samma offset i varje labels position (`position = SLIDER_INSET + ((year - ERA_MIN) / (ERA_MAX - ERA_MIN)) * SLIDER_INNER_WIDTH`). Detta håller thumb-cirklarna (radie 12) inom slider-trackens kanter vid extremerna istället för att sticka ut förbi. `ERA_MIN_INTERVAL_PX` räknas från `SLIDER_INNER_WIDTH`, inte `SLIDER_WIDTH`.
- 10-år-minimum: `ERA_MIN_INTERVAL = 10` (år), `ERA_MIN_INTERVAL_PX = Math.ceil((10 / (ERA_MAX - ERA_MIN)) * SLIDER_INNER_WIDTH)` skickas som `minMarkerOverlapDistance` till MultiSlider (lib:n håller markörerna isär i pixel). Defensiv guard i `onValuesChange`: `if (vals[1] - vals[0] < ERA_MIN_INTERVAL) return;` — släpper inte igenom state-updates som bryter regeln.
- **Haptik per år-tick**: `Haptics.selectionAsync()` (expo-haptics) anropas i `onValuesChange` efter interval-guarden. Ger Apple:s picker-tick-feel på iOS (UIPickerView-haptic) och `KEYBOARD_TAP`-feedback på Android (haptik + OS-klickljud). Step=1 ⇒ exakt en haptic per år-ändring; lib:n fyrar bara onValuesChange vid faktisk värde-ändring så ingen manuell throttling behövs. Audio-klick på iOS kräver `expo-audio` + sound-asset (parkerad — inte installerad).
- **DecadeMarks-axeln**: labels positionerade på **faktiska års-värden**, INTE jämnt fördelade — `position = SLIDER_INSET + ((year - ERA_MIN) / (ERA_MAX - ERA_MIN)) * SLIDER_INNER_WIDTH` per label. Det gör att thumben landar exakt på sin label (eftersom slidern mappar ERA_MIN..ERA_MAX linjärt). Tidigare jämn-fördelning gav 1–5 års offset mellan thumb och label vilket Peter explicit avvisade. Aktuella labels: `['<1930', '1940', '1950', '1960', '1970', '1980', '1990', '2000', '2010', '2020']` — 10 st total, leftmost är symboliskt (`<1930` på position 0 = år 1930), rightmost-tick är 2020. Slidern går fortsatt till `ERA_MAX` (current year, dynamisk) men ingen tick-label där — `eraGuestBox` ovan visar exakt valt år ändå. Tick-linjen är 14 px hög med `marginTop: -10` så den pokar 10 px upp i slider-zonen och visuellt skär track:en. Label-text i `60×20`-container roterad 90° (= 20 wide × 60 tall efter rotation) med fontSize 16.
- Lobby har dessutom `clampEraToPlayer`-warning ovanpå (gulvarning om youngest player är född efter `to`); Profile har inget motsvarande eftersom inga spelare finns i kontext. Lobby:s clamp använder redan `toYear - 10` som adjustedFrom så det aligned:ar mot 10-års-minimum.
- Profile:s `loadProfile`-effect clampar `gameEraFrom`/`gameEraTo` till nuvarande range (`Math.max(ERA_MIN, ...)` / `Math.min(ERA_MAX, ...)`) så äldre profiler från tiden då ERA_MIN var 1900 inte hamnar i ett tillstånd där rutan visar t.ex. "1925" medan thumben sitter låst på 1930.

**Answer response time** (`answerResponseSeconds: 15 | 30 | 45 | 60`, default 30) = how long players have to answer a question. Distinct from how long question media (song/video/image) plays.

**TopUserBanner pill on Profile** opens a logout sheet via `logoutModalVisible` state — mirrors Home's `profileMenu` for the logged-in case (header with avatar emoji + Player Name + green "Logged in" status + red Log out button + Cancel). After logout: `clearProfile()` + analytics + `router.replace('/')` to Home.

**"Profile settings" från Home:s TopUserBanner** (logged-in profil-meny): blå-konturad `secondaryBtn` ovanför röda "Log out"-knappen. Tap stänger menyn och `router.push({ pathname: '/profile', params: { scrollToTop: '1' } })`. Profile-skärmen läser `scrollToTop` via `useLocalSearchParams` och anropar `scrollRef.current?.scrollTo({ y: 0, animated: false })` i en `useFocusEffect` med deps `[localParams.scrollToTop]`, sedan `router.setParams({ scrollToTop: undefined })` för att rensa paramen — annars skulle framtida besök utan param också (felaktigt) snäppa till toppen.

**Store-knappar i user-login-modaler** (logged-in läget):
- **Home `profileMenu`** — `Profile settings` (med leading `<QuizVibeQAvatar size={26} />`) och `Store` (med leading `<ShoppingCartIcon size={22} />`). Båda i `secondaryBtn`-stil. Innehållet wrappas i `secondaryBtnInner` (`flexDirection: 'row'` + `gap: Spacing.sm`); knappens egen `alignItems/justifyContent: 'center'` centrerar wrapper:n så ikon + text grupperas centrerat.
- **Profile `logoutSheet`** — bara `Store` (med leading `<ShoppingCartIcon size={22} />`) ovanför Log out. Egen `logoutStoreBtn`/`logoutStoreBtnInner`-stilar speglar Home:s `secondaryBtn` (blå-konturad, höjd 52, `Colors.cardElevated` bg).
- **Båda** kör `router.push('/store?from=/<source>')` utan focus-param → default-ordning (Basic → Credits → Packages → Subscriptions). `from`-paramet säkrar att Store:s ← Back tar tillbaka till exakt rätt ursprungstab (Profile från Profile, Home från Home).

**Friends modal (Profile)** — KeyboardAvoidingView wrap:ar `friendsModal.overlay` med `behavior={Platform.OS === 'ios' ? 'padding' : undefined}` så input-fältet "Add by Player Name" inte täcks av tangentbordet. Android sköter det via systemet automatiskt. Speglar samma KAV-mönster som Register modal — sheet:en pushas uppåt vid keyboard-show.

**`mergeProfileIntoHost`-fallbacks**: när host:s profil saknar `birthYear` eller `assistance` används fallbacks så host-spelarkortet i Lobby alltid har komplett HCP (annars blockas Start Game). `birthYear` saknas → `randomBirthYear()` ger random år 1970–2005 (vuxen 21–56); `assistance` saknas → `'standard'`. `hcpComplete`/`isReady` är alltid `true` på host:s kort eftersom host startar aldrig spelblockerad. En Profile-sida (`randomAdultBirthYear()`) gör motsvarande för Profile:s state-load — defensive auto-save kör om något fält saknas, så slumpvärden inte regenereras vid varje reload.

**Profile auto-augment** i `loadProfile`-effekten: alla saknade fält fylls i med generic-fallback-spec (Pass-the-Phone, Max 4, Global, 1981→`ERA_MAX` (= current year), `ROUNDS_DEFAULT`, 30 sek, Standard assistance, alla paket aktiverade, `randomAdultBirthYear`-värde). Augmented-profilen beräknas EN gång per load så samma random-värde används för både setState och eventuell write-back. Om något fält var saknat persisteras augmented direkt via `saveProfile` i bakgrunden — one-shot defensive write så fallbacks inte regenereras nästa load (särskilt random birthYear).

## singlePlayerDefault-toggle (Profile + Lobby)

Checkbox **"Use single player mode as default"** ovanför Game Mode-toggle:n i både Profile (host-default) och Lobby (per-spel). Logik:

- **Checked**: BÅDA multiplayer-rutorna dimmas — Pass-the-Phone OCH Individual Devices får `Colors.borderStrong`-grå border, transparent bg, dämpad text (`Colors.textSecondary`), grå badges. Speglar Individual Devices-rutans inaktiva look så låst läge är konsistent.
- Number of Players-toggle:n följer samma dimming-mönster (Max 4 + Max 12 dimmas på samma sätt).
- **Tap på dämpad Pass-the-Phone / Max 4** → uncheck + aktivera Pass-the-Phone + Max 4 i samma gest.
- **Tap på dämpad Individual Devices / Max 12** är Premium-gated:
  - Premium-användare → uncheck + aktivera den valda rutan direkt.
  - Icke-Premium → samma "Premium feature — Go to Store"-popup som vanlig Individual Devices/Max 12-tap. **Ingen state-ändring** — Pass-the-Phone tänds inte upp; användaren måste tappa Pass-the-Phone-rutan eller bocka ur checkboxen för att lämna single-player-läget.
- **Uncheck via checkbox** → alltid Pass-the-Phone + Max 4 (gratis-läget på båda toggles), oavsett vad som var aktivt innan check. Säkrar att en Premium-användare som hade Individual Devices inte hamnar kvar där efter uncheck.
- **Tickbox-styling**: 20×20 kvadrat, `Colors.primary` border (alltid blå även i ocheckat läge), bockmarkering vit på primary-bg när checkad.
- **"Multiplayer mode"-klammer** under Game Mode-toggle:n: uppåt-öppen U (1.5px border, `#6B7280` grå, 10 px höga ben, rundade botten-hörn) med "MULTIPLAYER MODE"-label centrerat under. Speglar Lobby:s Number of Rounds-bracket exakt — samma form/färg/mått.

Persisteras som `singlePlayerDefault?: boolean` på `ProfileData`. Lobby:s state initialiseras lokalt (default false) och seeds från profil i host-mount-effekten.

## Customized Host packages (Profile-toggle → Lobby-filter)

Profile-toggle som filtrerar vilka paket som syns i Lobby:n när användaren är host. State + flow:

- **`enabledHostPackages?: string[]`** på `ProfileData` — lista över paket-id:n som är aktiverade. Default = alla `PURCHASED_PACKAGES`-id:n + free generations-paket-id (allt aktiverat) så nyköpta paket dyker upp i Lobby utan extra steg via Profile.
- **Free generations-paket** (alla users får ett gratis): `getFreeGenerationPackage(birthYear)` i [src/utils/mockPurchasedPackages.ts](src/utils/mockPurchasedPackages.ts) returnerar ett `MusicPackage` med `free: true` baserat på user:s `birthYear` enligt fem generations-band:
  - `pkg-gen-elder` "Play as Silent Generation + Baby Boomers" (1925-1964)
  - `pkg-gen-x` "Play as Gen X" (1965-1980)
  - `pkg-gen-millennials` "Play as Millennials" (1981-1996)
  - `pkg-gen-z` "Play as Gen Z" (1997-2012)
  - `pkg-gen-alpha` "Play as Gen Alpha" (2013-)
  - Year-banden speglar `backend/content/generation.ts:birthYearToGeneration` så client + content-katalog håller samma definition. ID-konstanter finns i `GENERATION_PACKAGES`-Record + `ALL_GENERATION_PACKAGE_IDS`-array; `isGenerationPackageId(id)` är predikatet andra moduler använder.
  - **Auto-byte vid birthYear-ändring**: `syncGenerationPackageIds(prev, birthYear)` strippar alla gen-paket-id:n ur listan och lägger till aktuell. Idempotent. Profile-screen kör helpern i (1) `loadProfile`-augmenten (täcker fresh + legacy-profiler), (2) en `useEffect` på `[birthYear]` så year-picker-byte direkt syncar enabledHostPackages. `wasIncomplete`-checken i load inkluderar `packagesChanged`-flagga (jämför saved vs augmented) så defensive auto-save persisterar swap:en.
- **Profile-UI**: `availablePackages = freeGen ? [freeGen, ...PURCHASED_PACKAGES] : [...PURCHASED_PACKAGES]` via `useMemo`. Free gen-paket renderas först med kantskärande FREE-badge (`packageFreeBadge` — grön bg + svart text, dämpas till grå när toggle:n är OFF). Per-paket-toggle (samma `connectionSwitch`-styling — röd/grön track + vit thumb + 0.8-skala) + "Select all"-toggle på egen rad ovanför listan, högerställd. Info-tap på free-rad visar "Included for free based on your Competition Year of Birth"-text istället för standard placeholder.
- **Lobby-render** ([LobbyScreen.tsx](src/screens/LobbyScreen.tsx)): `allPackagesCatalog = [...Object.values(GENERATION_PACKAGES), ...PURCHASED_PACKAGES]` (komplett möjlighets-katalog). `availablePackages` skiljer host vs non-host:
  - **Host**: `allPackagesCatalog.filter(p => enabledHostPackages.includes(p.id))` — paket avstängda i Profile visas inte alls.
  - **Non-host**: hela `allPackagesCatalog` returneras oförändrad. Non-host vet inte vilka paket host äger (det är host:s privat-data); `selectedExtraPackages` från `mockLobbySettings` styr vad som faktiskt renderas via `visiblePackages`-filter. Free gen-pack visas för non-host endast om host enabled:at det i lobby:n.
  - Free-paket-raden får samma kantskärande FREE-badge som i Profile (`packageRowFreeBadge`). `isFree`-detektion: `pkg.free || isGenerationPackageId(pkg.id)` som belt-and-suspenders så icke-host (som får packages från katalogen där `free: true` är satt) också taggas korrekt även om någon framtida data-källa skulle utelämna `free`-flaggan.
- **Seeding**: Lobby host-seed-effekten läser `profile.enabledHostPackages` (som redan innehåller rätt gen-pack-id efter ProfileScreen:s sync). Bara host får filterlistan (non-hosts ser endast paket som hosten faktiskt aktiverat för denna lobby via `selectedExtraPackages`).

## Generic + Add host packages-rad (Lobby host-vyn)

Två-knapps-rad direkt under "Customized Host packages"-rubriken i Lobby — host-only:

- **Generic** (vänster, 50% bredd) — visuell indikator + tappbar. Lyser **grön** (`Colors.success` border + `Colors.primaryMuted` bg + grön FREE-badge med svart text) när `selectedExtraPackages.length === 0` (lobby:n kör utan extra-paket = bara basic). **Grå** (borderStrong + transparent bg + grå FREE-badge) så fort minst ett paket är valt — inklusive Select all-läget. Tap på dämpad Generic → Alert "Switch to Generic? This will deactivate all selected packages..." → Switch tömmer `selectedExtraPackages` (alla paket avaktiveras → Generic blir grön igen).
- **+ Add host packages** (höger, 50% bredd) — egen `addPackageBtn`-styling (modeOption-baserad, transparent bg, borderStrong, `Radius.sm`, 46 px hög). Grå PREMIUM-badge i kantskärande position. Tap → `router.push('/store?focus=packages&from=/lobby')` — Store renderar Packages överst, Back tar tillbaka till Lobby. Ersatte den tidigare pulserande "+ QuizVibe Store"-CTA längst ner i wrappern.
- Layout `packageActionsRow`: `flexDirection: 'row'` + `gap: 4` (matchar `modeToggle`-gap) + `flex: 1` på båda → 50/50 bredd.

## Host Game Credits (pill + daily refresh + deduktion)

**Pill i headern** på både Profile (övre höger, "Profile"-titel vänster) och Lobby (övre höger, "Game Lobby"-titel vänster). Identisk styling i båda:

- `creditsPill`: 1 px `Colors.primaryBorder`, `Colors.cardElevated` bg, `Radius.md`, `minWidth: 210`, `gap: 8` (extra rymd så Extras-boxens kant-skärande badge inte överlappar "HOST GAME CREDITS"-labeln).
- **"Free: N"** — grön text (`Colors.success`), `fontVariant: 'tabular-nums'`.
- **Extras-box** — egen Pressable inom pillen med 1 px border, `paddingHorizontal: 14` / `paddingRight: 18` / `paddingVertical: 2`, `Radius: 4`, `position: 'relative'`. Kant-skärande PREMIUM-badge i `position: 'absolute', top: -7, right: 4`:
  - `gameCredits > 0` → gold border (`#F5A623`) + gold badge med svart text.
  - `gameCredits === 0` → grey border (`#6B7280`) + grey badge med vit text.
- **Tap på Extras-boxen** → Alert "Extra Host Game Credits" + dynamisk body + Cancel/Go to Store-knappar. Nested Pressable i RN konsumerar tap så outer pillens onPress (som också navigerar till Store) inte fyrar dubbel.
- **Tap på övriga delar av pillen** → `router.push('/store?focus=credits&from=/lobby')` (eller `from=/profile` på Profile-skärmen) — Store renderar Credits överst, Back returnerar till källan.

**Daily refresh** i `src/utils/profileStorage.ts`:

- `FREE_CREDITS_DAILY_CAP = 2` styr top-up-cap.
- `todayCETDate()` använder `Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' })` så CET/CEST-DST hanteras automatiskt.
- `refreshFreeCreditsIfNeeded` är **icke-destruktiv top-up**: jämför sparat `lastFreeCreditsRefreshDate` mot dagens CET-datum, och om dagen passerat sätts `freeGameCredits = Math.max(currentFree, FREE_CREDITS_DAILY_CAP)` + ny date. Saldo redan ≥ cap → lämnas orört. Saldo < cap → bumpas upp till cap. `gameCredits` (Extras) är ALLTID orört av denna funktion — bara Free påverkas vid midnatt.
- Triggar i `loadProfile` så fort Profile/Lobby får fokus efter midnatt CET. **Caveat**: om appen ligger öppen ÖVER midnatt utan att Profile/Lobby får fokus, sker refresh först nästa fokus. För strikt "exakt midnatt"-refresh skulle en AppState-listener eller intervall-timer krävas.

**Credit-deduktion på Start Game** (Lobby `handleStartGame`):

- 1 credit konsumeras per påbörjat spel — **Free först, Extras sedan**: `nextFree = free > 0 ? free - 1 : 0`, `nextExtras = free > 0 ? extras : extras - 1`.
- Om båda är 0 → blockad start med Alert "Out of Host Game Credits — buy more in Store, wait for daily refresh, or upgrade to membership" + Cancel/Go to Store-knappar.
- Persisteras via `saveProfile({ ...profile, freeGameCredits: nextFree, gameCredits: nextExtras })` (spread:ar in alla andra profil-fält så ingen annan sparad setting strippas). Lokal `setFreeGameCredits/setGameCredits` så pill:en uppdateras direkt utan att vänta på nästa fokus-load.

`lastFreeCreditsRefreshDate?: string` på `ProfileData` MÅSTE passeras genom alla `saveProfile`-anrop (handleSave + Spotify-flowen) — annars strippas datumet och refresh fyrar igen samma dag.

## Store screen

Four sections in `src/screens/StoreScreen.tsx` under header **"Add QuizVibe Premium"** (subtitle: "Choose extra packages, and Extra Host game credits or unlimited with QuizVibe membership plans"):

1. **Basic plan** — single card with FREE badge (border-cutting pattern, green) + green ACTIVE pill in card-right. Headline `"2 (+2 bonus) Host Games / day"` med `numberOfLines={1}` + `adjustsFontSizeToFit` + `minimumFontScale={0.75}` så texten inte wrap:as på smala skärmar. "+ Unlimited games as invited player" + "Refreshes every day at midnight CET" sublines.
2. **Customized Host Packages** — 3 hardcoded paket (Hip Hop 🎤, Rock 🎸, Film & Actors 🎬) à 29 kr. ID:n matchar `PURCHASED_PACKAGES` i `src/utils/mockPurchasedPackages.ts` så Profile/Lobby refererar till samma paket. `PackageTierCard` speglar `CreditTierCard`:s struktur (icon + namn vänster + beskrivning, pris + Buy höger).
3. **Credit packages** — 3 one-time-purchase tiers (5/10/20 Host Games at 19/29/49 kr). Save% computed against the smallest tier; BEST VALUE badge on the 20-game tier.
4. **QuizVibe membership plans** — 5-feature comparison list (Premium left / Basic right per row) inside a feature card, then 4 subscription tiers (1mth/3mth/6mth/12mth at 79/199/279/399 kr). All auto-renewal (footnote: "Cancel anytime in your App Store or Google Play account."). BEST VALUE on annual (399 kr/12mth ≈ 33 kr/month, save 58% vs monthly).

Shared `CreditTierCard`, `PackageTierCard` and `SubscriptionTierCard` mirror the same layout (left: headline + per-game/per-month subline + optional save%; right: price + Buy/Subscribe button).

Mock IAP: credit purchases bump `gameCredits` on profile + emit `purchase_completed` event (`type: 'credits'`). Subscriptions emit same event (`type: 'subscription'`) but don't yet persist state (requires future `ProfileData.subscription` field + RevenueCat integration). Currency hardcoded to `'SEK'` until vendor SDK provides `localizedPrice`.

**Sticky TopUserBanner**: Store har samma sticky-banner som Home/Lobby/Profile, placerad direkt under `<SafeAreaView>` utanför `<ScrollView>`. Använder `TopUserBanner`:s nya `backLabel="Back"`-läge (plain `← Back`-text i textSecondary, speglar Join-as-guest-modalens backBtn-style) istället för default Q + "Home"-stilen. Login-pillen i högra hörnet renderas read-only (ingen `onPress`) — Store-användare ändrar inte profil härifrån.

**`?focus=…`-paramet styr render-ordning** — fyra lägen + default. Sektionerna deklareras som JSX-konstanter (`basicSection`, `packagesSection`, `creditsSection`, `subscriptionSection`) och placeras sedan i ordning beroende på `focusMode`:

| `?focus` | Ordning | Triggas av |
|---|---|---|
| `subscription` | Subscription → Basic → Packages → Credits | Individual Devices Premium-popup, Max 12 Players Premium-popup, Rounds-rulerns guld PREMIUM-badge (Lobby + Profile) |
| `packages` | Packages → Basic → **[Other heading]** → Credits → Subscriptions | "+ Add host packages"-CTA (Lobby Game Connections + Profile Customized Host packages-blocket) |
| `credits` | Credits → Basic → **[Other heading]** → Subscriptions → Packages | Host Game Credits-pillen, Extras-rutans köp-popup, "Out of Host Game Credits"-popup vid Start Game (Lobby + Profile) |
| (ingen) | Basic → Credits → Packages → Subscriptions | User-login-modalens Store-knappar (Home + Profile) |

"Other"-rubriken (`otherHeadingWrap` + `otherHeading`) är en tunn 1px top-border + uppercase overline-stil (textSecondary, letterSpacing 1.2) som visuellt separerar primär-fokus-sektionerna från resten. Renderas bara i `packages`/`credits`-läget — `subscription`-läget och default-läget har ingen Other-rubrik (Subscription-läget är redan top-positionerat och default är "naturlig" ordning).

**`?from=<path>`-paramet styr Back-knappens destination** (kritiskt för korrekt UX):

- Alla push-callsiter skickar `&from=<source-path>`: `/lobby`, `/profile`, eller `/`.
- Store:s `handleBack` läser `from` och kör `router.replace(from)` — explicit destination istället för `router.back()`.
- **Varför**: explicit `from`-destination ger förutsägbar Back-routing när Store nås från flera källor (Lobby:s Host Game Credits-pill, Profile:s logoutSheet Store-knapp, Home:s profileMenu Store-knapp osv.). `router.back()` ensam hade poppat något godtyckligt på navigation-stacken; med `from` vet vi alltid var användaren ska tillbaka.
- Saknas `from` faller `handleBack` tillbaka till `router.canGoBack() → router.back()`, sedan `router.replace('/')` (Home) som sista utväg så användaren alltid har en utväg.

## Subscription-styling (host-vyn) — IndDev + Rounds of Game

Två separata color-regler i Lobby:s host-vy som speglar host:s subscription-status. Båda gated på `hasMultiplayerPackage` (Lobby) eller `hasPremium` (Profile, för Rounds-rulern i host-defaults-blocket) — båda hardcoded `false` tills Store-integrationen kopplas in.

**Individual Devices-rutan** (Game Mode-toggle):

| Sub | Vald | Frame | Badge |
|---|---|---|---|
| off | nej | grey | grey |
| on | **ja** (IndDev aktivt) | gold | gold |
| on | nej (Pass-the-Phone eller Single Play vald) | grey | gold |

Frame är guld **endast** när IndDev faktiskt är vald — host kan ha Premium men ändå föredra Pass-the-Phone eller Single Play. Badgen signalerar däremot ren subscription-status oavsett vilket läge som är valt: guld = unlocked, grey = locked. `singlePlayerDefault`-checkboxen dämpar fortfarande hela rutan oförändrat (grey + grey badge). Implementation: `modeOptionPremiumActive`-stilen appliceras endast när `hasMultiplayerPackage && gameMode === 'individual-devices'`; annars `modeOptionInactive` (grey).

**Rounds of Game-rulern** (`RoundsRuler`-komponenten via `hasSubscription`-prop):

| Sub | Klammer | Tick-streck + Siffror | Badge |
|---|---|---|---|
| off | grey #6B7280 | grey (`borderStrong` / `textDisabled`) | grey #6B7280 + vit text |
| on | gold #F5A623 | **blue** (`Colors.primary`) | gold #F5A623 + svart text |

Två separata färggrupper — klammer + badge växlar grey↔gold (premium-status), tick-streck + siffror växlar grey↔blue (availability). När sub är på blir alla siffror på nummeraxeln blåa (samma som unlocked-tickar) → locked-distinktionen försvinner visuellt eftersom host *äger* dem; klammern + badge stannar dock kvar för att markera att Pass-the-Phone fortsatt capar valet till 4. Lokala variabler i komponenten: `klammerColor`, `lockedTickColor`, `lockedFigureColor`, `badgeBg`, `badgeTextColor` — alla deriverade från `hasSubscription` så call-sites bara passerar bool:en.

Non-host-vyn använder fortfarande default `hasSubscription={false}` → grå styling oavsett host:s subscription-status (klammer + badge döljs ändå när `onPremiumPress` saknas, så bara siffer-färgningen är synlig).

## Lobby — Game Settings card

Game Mode and Game Connections share a single bordered card (`gameSettingsBorder` in `LobbyScreen.tsx`) — they're treated as one "spelregler"-grupp. Order inside Game Connections: YouTube → Spotify → Profiles & Places → "Customized Host packages" sub-block (`usePackagesBlock`).

**Lobby host-seed-effekten** (i URL-params-deps useEffect:n) läser host:s profil vid varje lobby-mount och seeds lokala lobby-settings: `gameMode`, `maxPlayers`, `singlePlayerDefault`, `region` (mappas via `mapProfileRegion`-helper: `'sweden' → 'Sweden'`, `'nordics' → 'Nordics'`, `'global' → 'Global'`; null → `'Global'`-fallback eftersom Lobby:s Region-set inkluderar `'Europe'` som Profile saknar), `answerResponseSeconds`, `eraValues` (clamp:as till `[ERA_MIN, ERA_MAX]`), `roundsCount` (clamp:as mot `roundsMax`), `enabledHostPackages`. Generic-fallbacks per fält om profil saknar värdet — speglar Profile:s motsvarande spec (Pass-the-Phone, Max 4, Global, 1981→`ERA_MAX` (current year), `ROUNDS_DEFAULT`, 30 sek, alla paket aktiverade). Effekten triggar både vid första lobby-mount OCH vid Play Again-återinträde (component re-mountar då URL-params byter).

**Answer response time-rad** (under Number of Rounds, inom samma `quizSettingsBorder`): 4-knapps-rad (15s/30s/45s/60s) med aktiv ruta i `primaryBorder` + `primaryMuted`-bg, label-text bold + textPrimary i aktivt läge. Renderas för alla i lobbyn men `disabled={!hostMode}` så bara host kan ändra (samma "render-for-all-but-disable-for-non-host"-mönster som Game Mode och Region scope). Default seedas från host:s profil via `setAnswerResponseSeconds(profile?.answerResponseSeconds ?? 30)` i host-seed-effekten ovan; non-host syncar via `mockLobbySettings`-polling.

**Profiles & Places icon** uses an inline SVG of the Q-figure (circle + tail in `Colors.primary`, no surrounding squares) with an "AI"-Text overlay centered in the Q ring. `viewBox="24 22 32 32"` centers the Q at icon coords (14, 14) which matches the wrap's flex center; AI text gets `transform: translateY(-1)` to compensate for glyph baseline offset. **Gotcha**: this inline SVG is **independent** from `QuizVibeLogo` and still uses the original Q coords (cx=40, cy=38, r=13). The shared `QuizVibeLogo` component shifted its Q to (37, 37) for box-centering — they're intentionally decoupled, so changing one doesn't affect the other.

**Spotify auto-enable rule is mode-dependent** (non-obvious — easy to break):

- Pass-the-Phone → `spotifyAutoEnabled = false` unconditionally. Opening Spotify on the single shared device steals focus from QuizVibe and breaks the in-game timer that ticks while the song plays — Spotify is incompatible with this mode.
- Individual Devices → all approved players (incl. host) need `spotifyConnected === true` (each player streams on their own phone).
- Host has an additional manual override (`spotifyHostToggle`); displayed state = `auto && hostToggle`.
- Spotify-switchen renderas endast för host (Game Connections-undantaget); för host:en är den `disabled` när `!spotifyAutoEnabled`. Den dämpade gråa track/thumb-paletten (`#3A3F4B` / `#9CA3AF`) är reserverad för auto-disabled-fallet så det visuella signalerar "blocked by lobby rules" snarare än bara "off" — det täcker även Pass-the-Phone-fallet. Icke-host ser ingen switch alls, bara Enabled/Disabled-pillen.
- The info `(i)` icon sits **directly after the "Spotify" label** (inside `connectionLabelGroup`, not after the pill) and is **always** visible. It shows the rule for both modes so users can check criteria regardless of current state. Placing the icon there frees the right-side flow so Spotify's switch lines up with YouTube's and Profiles & Places' switches via `marginLeft: 'auto'`.

**Customized Host packages** (sub-block `usePackagesBlock` inside Game Connections): Basic-utbudet är alltid implicit aktivt (ingen synlig rad) — hosten kan välja till köpta extra-paket via `selectedExtraPackages[]` ovanpå. `PURCHASED_PACKAGES` (i `src/utils/mockPurchasedPackages.ts`) är hardcodad mock filtrerad genom Profile:s `enabledHostPackages` → `availablePackages` (se "Customized Host packages (Profile-toggle → Lobby-filter)" ovan).

Layouten under "Customized Host packages"-rubriken (i ordning):

1. **Generic + Add host packages-rad** (`packageActionsRow`, host-only) — två-knapps-rad direkt under rubriken. Generic vänster (50% bredd, gold/grey beroende på selection), "+ Add host packages" höger (50% bredd, grå PREMIUM-badge). Se "Generic + Add host packages-rad" ovan för detaljerad logik. Ersatte tidigare pulserande "+ QuizVibe Store"-CTA längst ner i wrappern.
2. **Yttre svart container** (`extraPackagesWrapper`, `Colors.background`-bg, padding 3 horisontellt + top, paddingBottom Spacing.xl, gap 4, Radius.md, 1px Colors.border — geometrin matchar `modeToggle` förutom asymmetrisk paddingBottom).
3. **Sub-rubrik-rad** (`extraPackagesHeadingRow`) inom wrappern: text vänster + "Select all"-grupp höger. Heading-texten är "Packages available for you:" för host och "Packages for this lobby selected by the Host:" för icke-host. "Select all"-gruppen renderas **endast för host**; switchen kör `handleToggleAll` som sätter `selectedExtraPackages` till tom eller alla `availablePackages`-id:n.
4. **Empty state** — host: om `availablePackages.length === 0` rendras `<Text>` "No Extra packages purchased". Icke-host: om hosten inte aktiverat något paket (filtrerade listan tom) rendras "No extra packages active in this lobby".
5. **Paket-rader** (`purchasedPackageRow`, sorterade alfabetiskt via `localeCompare` med `numeric: true`): host ser hela `availablePackages`-listan, icke-host ser endast paket vars id finns i `selectedExtraPackages` (filtrerade innan sort). Layout per rad: info-ikon → bordered text-box (`purchasedPackageBox`, `width: 204`) → Switch (host-only, `marginLeft: 'auto'`). Box off-state = grå `borderStrong` + transparent + `textSecondary` text. Box on-state = `Colors.primary` border + `Colors.cardElevated` bg + vit text. För icke-host används alltid on-state-stilen.

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
- `modeToggleDisabled?: boolean` — när true dimmas toggle-knappen och tap blir no-op. Används av PlayerName-flöden där digit-mode är låst tills letters-sektionen har minst 1 tecken — knappen renderas fortsatt för stabil layout men signalerar visuellt att letters måste komma först. PlayerName-formerna sätter även toggle-handler:n att flytta fokus till motsvarande TextInput (split-field UI: letters → letters-input, digits → digits-input).

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

- **Host** (hostMode=true): tap → `hostDeleteSheetVisible` Modal med röd "Delete this Game Lobby"-knapp + Cancel. Knappen → Alert "Delete this Game Lobby?" → Yes anropar `deactivateRoom(roomCode)` (tar bort från `mockActiveRooms`), visar **loading-overlay** med "Please Wait — Deleting this Lobby" + animerade våg-prickar (`<WaveDots />`-komponent inline i samma fil) i 1.6s, sedan `router.replace('/')`. **Viktigt**: `setDeletingLobby(false)` MÅSTE anropas explicit innan navigation — Stack-navigatorn kan bevara Modal-state över route-replace, så utan dismiss hänger overlay:n kvar över Home.
- **Non-host** (oavsett guest eller registrerad): tap → `guestLeaveSheetVisible` Modal med röd "Leave Game Lobby — Go to Home"-knapp + Cancel. Knappen → Alert "Leave this Game Lobby?" → Yes sparar **full snapshot** av spelaren via `addLeftPlayer(roomCode, snapshot)` (id, name, emoji, type, age, assistance, hcpComplete, approved) → `router.replace('/')`. Sheet-headern visar dynamiskt avatar+namn+status från `players.find(p => p.id === ownPlayerIdRef.current)` — guest får "Guest", registrerad får "Player".
- Efter D-0 (bottom tab-bar borttagen) finns ingen direkt-link till Profile från Lobby. Host:s väg till profil-hantering är via Home → TopUserBanner-login-pill → "Profile settings".

**Non-host detection of room deletion**: useEffect:en (gating på `!hostMode`) initial-check + 2s polling-interval anropar `isActiveRoom(roomCode)`. När den blir false sätts `roomDeletedDetected=true` → separat useEffect triggar Alert "Game Lobby deleted / This Game Lobby has been deleted by Host" med `cancelable: false` → OK → `router.replace('/')`. Polling istället för event-driven eftersom mockstoren saknar event-bus; ersätts med WS/SSE-prenumeration när backend kommer in.

**`hasLeft` orphan injection** (i `useFocusEffect`): efter att ha mappat över befintliga `players[]` och applicerat `hasLeft` på matchande id:n, läggs alla `LeftPlayerSnapshot` som INTE redan finns i listan till som nya `LobbyPlayer`-objekt med `hasLeft: true`. Detta krävs för att en NY user (t.ex. guest B) som joinar samma rum efter att en annan user (guest A) lämnat ska se A:s gråa "LEFT THIS GAME LOBBY"-kort — A finns inte i B:s SEED-baseline. Snapshot:en bär `approved`-flaggan så kortet hamnar i rätt sektion (Approved / To be Approved by Host).

## Lobby — Players in Lobby

Non-host gets a **read-only view** of the player list:

- Section hint changes by mode: "Turn order — top plays first. Use ↑↓ to reorder." (host) → "Playing order — selected by Host" (guest).
- `PlayerRow`'s up/down arrow buttons (`turnArrows` block) are gated on **handler presence** — if neither `onMoveUp` nor `onMoveDown` is passed, the entire turnArrows block is hidden. `LobbyScreen` passes `undefined` for both handlers when `!hostMode` (and även för spelare med `hasLeft: true`). The turn-number badge stays visible.

**Auto-add joining player** (`useEffect` i `LobbyScreen.tsx`): non-hosts inserts into players list immediately on lobby entry as `approved: false`, så de syns i "To be Approved by Host"-sektionen direkt — no separate waiting screen.

- `asGuest=true` + `guestName` (Guest-form path): inserts as `type: 'guest'` from form params, `id = guest-${Date.now()}`.
- `!hostMode` utan guest-form-params (code-only join): loads `loadProfile()` och inserts as `type: 'registered'` from profile (name, avatar, age, assistance, spotifyConnected), `id = joiner-${Date.now()}`. Falls back to "You" / 👤 / `type: 'guest'` om profil saknas.

**Deps på URL-params + state-reset (kritiskt)**: useEffect:en deps är `[code, guestMode, guestName, guestBirthYear, guestAssistance, hostMode]` — INTE `[]`. Stack-navigatorn kan återanvända samma component-instans över transitions (t.ex. `host → home → join som guest`). Med `[]`-deps re-fyrade aldrig auto-add när params bytte → nya identiteten lades aldrig in. Effekten reset:ar även `setPlayers(SEED_PLAYERS)` + `ownPlayerIdRef.current = null` i början av varje run så ingen state ärver över.

**`mergeProfileIntoHost` gating**: i `useFocusEffect` är merge:n gated på `hostMode && profile && p.isHost` — INTE bara `profile && p.isHost`. När non-host joinar ska seed-host:en Alex K. visas oförändrad, INTE få den nuvarande user:s profil-data tilldelad (annars ser det ut som att joinaren är host eftersom HOST-badge:n + ens egen avatar/namn syns på det kortet).

**`PlayerRow.hasLeft` rendering**: när `hasLeft: true` får kortet neutral grå border (override:ar approved/waiting-färgerna), avatar dämpas, namn/HCP-rad i `textDisabled`, status-raden ersätts med "LEFT THIS GAME LOBBY"-text, approve-toggle och move-arrows döljs. Host-spelaren får ALDRIG `hasLeft` (defensiv guard i useFocusEffect — host kan inte lämna sin egen lobby).

**Section header**: räknaren renderas på två rader, högerställd i headern intill "+ Add Player"-knappen. Övre rad "Approved:" (textSecondary, `FontSize.xs`); undre "{x} of max {y}" (primary, `FontSize.sm`). x = `approvedPlayers.filter(p => !p.hasLeft).length` (host räknas alltid som approved via `isPlayerApproved` + lämnade spelare frigör platsen). y = `maxPlayers` (host:s 4/12-cap, inte `players.length`). Stack:n centreras gentemot varandra via `alignItems: 'center'`.

**ApproveToggle använder standard React Native `Switch`** ([src/components/ApproveToggle.tsx](src/components/ApproveToggle.tsx)) med samma styling som Game Connections-raderna (röd/grön track, vit thumb, scale 0.8). Behåller `'no' | 'yes'`-API:t internt så call sites är oförändrade. Den tidigare custom Yes/No-svep-pillen är borttagen.

**PlayerRow card layout** (host-vyn):
- **Topp-rad**: turnColumn (Pass-the-Phone) + avatar + info (namn + ev. "Missing info"-status) + approve-toggle. Toggle:n pinnas mot kortets översta kant via `toggleSlot { alignSelf: 'flex-start' }` så den hamnar i övre högra hörnet och linjerar med "Approve All"-toggleln ovanför listan (samma right-padding via `row.paddingHorizontal: Spacing.lg`).
- **Botten-rad** (`hcpRow`): tre flex-slottar — meta vänster (`hcpRowLeft, flex: 1`), HCP-badge centrerat (`hcpRowCenter`, intrinsic-bredd), trash höger (`hcpRowRight, flex: 1`). Lika-stora flex på sidorna garanterar matematisk centrering av badgen oavsett meta-textens bredd.
- **Host:s eget kort** är specialfall i `hcpRow`: badge renderas i höger-slotten istället för center-slotten (höger-justerad), och ingen trash visas (host kan inte radera sig själv).
- **"Ready"-status borttagen** för alla spelare. Endast `!player.isReady` (= "Missing info" warning) eller `hasLeft` (= "LEFT THIS GAME LOBBY") renderas — i alla andra fall är status-raden helt tom (en redo spelare är default-läget).

**Papperskorgs-knapp** (host-only, `onDelete`-prop på PlayerRow): grå (`Colors.textSecondary`) trash-SVG i botten-radens höger-slot, visas bara på rader i waiting-listan. För approved-spelare måste host först toggla tillbaka till No så kortet hamnar i waiting-listan igen och papperskorgen syns. Tap → `Alert "Remove player — Are you sure you want to delete this Player from this Lobby?"` → confirm filtrerar bort spelaren ur `players[]` OCH anropar `markEjected(roomCode, id)` så non-host:s polling triggar "User have been removed from this lobby"-popup → Home navigation. Pressed-feedback `Colors.borderStrong` (subtil grå highlight). Hide:s när `hasLeft: true` — left-spelaren är redan borta som aktiv part.

**`PlayerRow.hcpAlignRight`** (prop): driver var HCP-badgen renderas i `hcpRow`. `false` (default, host-vyn) → badge i `hcpRowCenter` med trash i höger-slot. `true` (non-host:s vy via `hcpAlignRight={!hostMode}`) → badge i `hcpRowRight` (höger-justerad), eftersom non-host saknar approve-toggle och trash → tom höger-slot annars. Host:s eget kort använder samma höger-slot-gren (via `isHostPlayer || hcpAlignRight`-kondition).

## Lobby — + Add Player

[src/screens/LobbyScreen.tsx](src/screens/LobbyScreen.tsx)'s `AddPlayerModal` speglar Home-skärmens Join-as-Guest-flöde 1:1 minus Room Code-steget. Innehåller:

- Player Name med custom `CodeKeyboard` (fullt A–Z + 0–9, mode-toggle), inline `Check`-knapp + `Remove`/`Auto-generate`-rad + status-meddelanden (✓ available / ✗ taken / ✗ inappropriate language). Auto-fill vid open via `generatePlayerName(TAKEN_PLAYER_NAMES_LOBBY, 'Guest')`.
- Year of Birth (drop-down picker med "or earlier"/"or later"-suffix på endpoints) — låst tills Player Name validerat.
- Assistance level (Full/Standard/Minimal-knapprad), default `'standard'` — låst tills Year valt. "Use default or select prefered setup"-hint ovanför.
- Submit "Add to Lobby" enable:as bara när formuläret är giltigt (Player Name available + Year valt).

**`TAKEN_PLAYER_NAMES_LOBBY`** är en lokal mock-Set (samma värden som hemskärmens `TAKEN_PLAYER_NAMES` i `app/index.tsx`). **Avsiktlig duplicering** tills riktig backend-uniqueness-check kommer in — call sites bryts ut då. Samma sak för `validateAddPlayerName`/`formatAddPlayerBirthYear`-helpers (lokala kopior av Home-skärmens motsvarigheter).

**Capacity-check** sker i två lägen:
- **Vid + Add Player-knappens onPress** (`handleOpenAddPlayer`): `isLobbyAtCapacity()` (= `players.filter(p => !p.hasLeft).length >= maxPlayers`) → om full visas Alert direkt och modalen öppnas inte. Skyddar host från att slösa tid på att fylla i formuläret.
- **Vid Confirm i formuläret** (`handleAddPlayer`): samma check körs igen som race-condition-skydd om någon joinar via room code mellan knapp-tryck och confirm.

Båda Alert:ar visar samma text: `Alert.alert('Lobby is full', 'Lobby is already full with waiting and approved players. Remove players if to add others')`.

## Lobby — Player edit (host-only)

Host kan redigera **Assistance level**, **Competition Year of Birth** och **HCP** på valfri spelare i lobbyn (inkl. sig själv). Tap-targets: HCP-meta-raden ("Standard · Age 32") OCH HCP-badgen — båda öppnar samma `playerEditSheet`-modal i [src/screens/LobbyScreen.tsx](src/screens/LobbyScreen.tsx). För guests är HCP-badgen istället ett tap-mål för en separat "Guest HCP cannot be changed"-popup (`onGuestHcpTap` på `PlayerRow`).

**Lobby-lokal scope via `lobbyEdited`-flagga** (`LobbyPlayer.lobbyEdited?: boolean`): inga skrivningar går till `saveProfile()` från detta flöde — alla uppdateringar är `setPlayers(...)` mot lokal lobby-state. Skyddet mot att profil-merge clobbar lokala redigeringar:

- `mergeProfileIntoHost` bailar tidigt om `existing.lobbyEdited === true` och uppdaterar bara avatar/playerName/spotifyConnected (fält som inte exponeras i edit-modalen). Annars skulle host:s redigeringar av sitt eget kort återställas vid varje `useFocusEffect`-merge när host återvänder till lobby-tabben.
- För non-host registrerade spelare körs ingen merge alls (deras profil-data kommer från URL-params vid join), så `lobbyEdited` är där bara informativt.
- Flaggan persisteras inte över sessions — när lobbyn lämnas/raderas är hela lobby-state borta.

**Validation-regler** (alla med popup vid försök):

1. **HCP** kan endast sänkas, inte höjas. Originalet hämtas från `target.hcpOverride ?? calculateInitialHCP(target.age, target.assistance)` (pre-edit-värde via `playerEditTarget` som inte muterats förrän Save). Vid `parsed > originalHcp` → `Alert "Cannot raise HCP — HCP can only be lowered, pick a value of {N} or less."` Stå-still tillåtet.
2. **HCP-floor** = `MIN_HCP = 50` (export från [src/utils/hcp.ts](src/utils/hcp.ts)). Vid `parsed < MIN_HCP || parsed > 99` → `Alert "Invalid HCP — HCP must be a number between 50 and 99."`. Edge case: om en spelares `originalHcp < 50` (från progression) blir HCP de facto låst för host-edit — alla värden träffar antingen floor:n eller cannot-raise-regeln.
3. **Assistance** följer ranking `full=2 → standard=1 → minimal=0` (lägre = svårare). Tillåtna transitions: stå still eller progress nedåt. `Minimal → annat` blockas explicit. Validering körs både **tap-tid** (`handleSelectEditAssistance`) OCH **save-tid** (belt + suspenders). Disallowed knappar dimmas via `skillBtnLocked` (opacity 0.4) men förblir tappbara så popupen kan informera. Popups: `"Cannot change Minimal — Once a player has Minimal assistance, it cannot be changed."` / `"Cannot raise assistance — Assistance can only progress in the order Full → Standard → Minimal."`
4. **Age** kan endast höjas (= tidigare birth year). Vid `nextAge < originalAge` → `Alert "Cannot lower age — Age can only be raised, pick an earlier Year of Birth."`. Stå-still tillåtet. Year-pickern dim:as inte (för långt list); validation enbart vid Save.

**Guest HCP** är aldrig direkt redigerbart (`hcpOverride` på guest:er sätts ALDRIG till ett konkret värde — sätts alltid till `undefined` i save-handlern). HCP-fältet göms i modal:en för guests och ersätts med info-texten `"Guest HCP is auto-calculated and cannot be edited."`. Assistance + Year är dock fritt redigerbara för guests via samma modal.

## HCP utility ([src/utils/hcp.ts](src/utils/hcp.ts))

- **`MIN_HCP = 50`** — universell floor. Gäller både guest-auto-derivering OCH host:s manuella redigering. Bättre nivåer (< 50) är reserverade för spelare som tjänar in dem genom progression via `calculateNewHCP`, inte för manuell justering.
- **`roundHcp(value)`** — wrapper kring `Math.round` med kommentar om policyn (närmaste heltal, 0,5 uppåt). Singel-källa för avrundnings-regeln. Använd den i alla HCP-beräkningar som kan producera decimaler. JS:s `Math.round` följer regeln för positiva tal (HCP är alltid 1–99).
- **`calculateNewHCP`** använder `roundHcp(pointsEarned / 10)` — så 5 poäng → 1 i reduktion (avrundat upp), 4 poäng → 0. Tidigare `Math.floor` ändrades till `roundHcp` när policy-regeln formaliserades.
- **`getGuestHcpFromClosestAge(guestAge, registeredPlayers)`** — guest:s dolda HCP-värde:
  - **>1 registrerad** → HCP hos den vars `age` ligger närmast guest:ens (tie-break på array-ordning, typiskt host eftersom host är index 0).
  - **Endast en registrerad** (typiskt host ensam) → `roundHcp((refHcp + 100) / 2)`. Med en enda match-kandidat blir närmaste-age-algoritmen meningslös; midpoint mot 100 biasar guest:en mot nybörjar-änden istället.
  - Resultat clampas till `[MIN_HCP, 99]` — guests får aldrig "för bra" HCP oavsett referens.
  - Returnerar null om inga registrerade spelare alls.
  - Visuellt visar guest-kort ALLTID "Guest HCP"-placeholder (utan siffra) — det härledda värdet är dolt för spelarna och konsumeras bara av spel-logik som behöver det.

## Lobby — Share invite (friends-only)

Share invite-modalen i [src/screens/LobbyScreen.tsx](src/screens/LobbyScreen.tsx) skickar **endast** invites in-app till QuizVibe friends. OS-share-fallback (SMS/WhatsApp/Messenger) är borttagen — användaren kan inte längre dela rumkoder externt. Modalen renderar bara friends-listan (med one-tap "Invite"/"✓ Invited"-knappar) eller empty-state ("No friends saved yet — Add friends in Profile to invite them with one tap.") + "Done"-knapp. `QuizVibeFriendsLogo` (size 28) renderas bredvid "QuizVibe friends"-section-labeln för visuell anchor — speglar Profile-skärmens friends-kort-ikon.

**`handleAcceptInvite` guards** (i Home:s `JoinModal`, [app/index.tsx](app/index.tsx)) — körs i ordning innan navigation:
1. **`isActiveRoom(invite.roomCode)`** — om host raderat lobby:n efter att invite skickades: ta bort invite ur listan (`removeInvite` + `setInvites`) + Alert "Lobby no longer available — This lobby has been deleted by the Host." Cleanup först eftersom inviten inte längre är actionable.
2. **`checkLobbyCapacity(invite.roomCode)`** — om lobby:n är full: BEHÅLL invite (transient — kan frigöras), Alert med Free vs Premium-host-copy. Skiljs medvetet från active-room-fallet i cleanup-semantik.
3. Annars: `removeInvite` + navigate.

## Lobby — Non-host visibility & host→non-host sync

Non-host:s vy ska spegla EXAKT vad host har valt för den specifika lobbyn. Architecture i avsaknad av backend: 3 mock-stores + polling-pattern.

**Polling-arkitektur (2s-interval)** — Lobby-state-mocks saknar event-bus, så non-host:s `useEffect`-baserade syncar kör `setInterval(..., 2000)` med initial sync direkt vid mount. Samma mönster delas av:
- Room-deletion-detection (`isActiveRoom`) → "Game Lobby deleted"-popup → Home.
- Player-eject-detection (`isEjected`) → "User have been removed from this lobby"-popup → Home.
- maxPlayers-sync från `RoomMeta`.
- Player-list-sync från `mockLobbyPlayers`.
- Settings-sync från `mockLobbySettings`.

Host:s sida skriver via `useEffect`-deps på relevant state (gated på `hostMode`). Ingen sync sker andra hållet.

**Cleanup-paritet** — alla 4 lifecycle-cleanup-sites anropar samma cleanup-bunt:
- Lobby:s "Delete this Game Lobby" (host)
- Quiz:s `handleQuitGame` (host mid-game)
- Quiz:s Play Again (`goToNewLobby` med ny kod)
- Home:s `handleCreateGame`

```ts
deactivateRoom(code);          // mockActiveRooms
clearLeftPlayers(code);        // leftPlayers
clearLobbyPlayers(code);       // mockLobbyPlayers
clearLobbySettings(code);      // mockLobbySettings
clearEjected(code);            // ejectedPlayers
clearGameStarted(code);        // mockStartedGames
```

Glöm inte lägga till nya stores här när de skapas — annars läcker stale data mellan sessions med återanvänd kod.

**Synkat per non-host UI-element** (alla deriverade från host-driven state):

| UI | Source-store | Non-host läser |
|---|---|---|
| Number of Players (Max 4/12) | `mockActiveRooms.RoomMeta.maxPlayers` | `getRoomMeta().maxPlayers` |
| Approved players list | `mockLobbyPlayers` | `getLobbyPlayers()` (filtrerad till approved/isHost) |
| Game Mode toggle | `mockLobbySettings.gameMode` | `getLobbySettings()` |
| Region Scope | `mockLobbySettings.region` | ↑ |
| Game Era | `mockLobbySettings.eraFrom/To` | ↑ |
| Number of Rounds | `mockLobbySettings.roundsCount` | ↑ |
| Answer response time | `mockLobbySettings.answerResponseSeconds` | ↑ |
| Customized Host packages | `mockLobbySettings.selectedExtraPackages` | ↑ |
| Game Connections-pillar | `mockLobbySettings.{youtubeEnabled,spotifyHostToggle,profilesEnabled}` | ↑ |

**Synthetic-host fallback** ([src/screens/LobbyScreen.tsx](src/screens/LobbyScreen.tsx) i non-host:s player-poll): om host saknas i `getLobbyPlayers`-resultatet (test-seed-kod eller fresh kod där host inte hunnit skriva ännu), syntheserar polling en placeholder-rad från `RoomMeta.hostPlayerName`:
- `id: 'synthetic-host'`, `emoji: '👑'`, `type: 'registered'`, `isHost: true`, `approved: true`.
- **`age: 35` (fixed) + `assistance: 'standard'` + `hcpComplete: true`** — fixed (inte random) så HCP-raden inte flickrar varannan poll. Real host-data ersätter raden vid nästa poll efter att host:s write körts.
- Säkerställer att `Assistance · Age · HCP`-raden alltid renderas på host:s kort i non-host:s vy oavsett tajming.

**Initial state för non-host** är `setPlayers([])` (inte `SEED_PLAYERS`). Polling fyller listan från host:s authoritative data + self-injection. Utan denna gating skulle non-host se hardcodade fake-spelare (Sam L., Jordan M., Casey P.) som host inte ens approverat.

**Non-host UI-strip** — host-only-element döljs explicit:
- Header credits-pill (Host Game Credits) — gated på `hostMode`.
- "Use single player mode as default"-checkbox — gated på `hostMode`.
- Bracket + "MULTIPLAYER MODE"-label under Game Mode-toggle:n — non-host får istället `"Game Mode - Multiplayer"` inline i sectionLabel (Typography.overline auto-uppercasar).
- Subtitlar under Region/Game Era/Number of Rounds/Game Connections — gated.
- modeDescription ("Players take turns…" / "Each player plays…") — gated.
- Approve-toggle, trash-knapp, edit-handlers — gated på `hostMode`.
- RoundsRuler:s klammer + PREMIUM-badge — gated på `onPremiumPress`-prop (saknas för non-host = read-only-läge), MEN locked-tickarnas grå-styling behålls så non-host ser host:s rätts-cap.
- Number of Players Max 4/12: aktiva rutan får `modeOptionIndivActive` (blå border) + vit text + INGA badges för non-host (host får grön/guld + FREE/PREMIUM-badges).

**Single-player-toggle ON ejectar non-hosts** — när host bockar i singlePlayerDefault iterar handler:n `players` och anropar `markEjected(roomCode, p.id)` för varje `!p.isHost && !p.hasLeft`, sedan `setPlayers((prev) => prev.filter((p) => p.isHost))` så host:s vy tömmer non-hosts direkt. Non-host:s polling fyrar ejectpopup → Home. Uncheck:n "återanställer" inte ejectade — det är en envägs-action; flagga uncheck:n bara återställer Game Mode + Max Players till gratis-defaults.

**Eject-detection PRE-sync** — `syncFromStore` i non-host:s player-poll kollar `isEjected(roomCode, ownPlayerIdRef.current)` ALLRA FÖRST. Träff → setPlayerEjectedDetected(true) + early-return. Resten av sync hoppas över så user inte ser approval-listan uppdateras strax innan popup.

**Game-started-detection PRE-sync** — direkt efter eject-checken körs `isGameStarted(roomCode)` + check om self är approved (via `getLobbyPlayers`). Träff + self är **inte** approved → `setStartedWithoutMeDetected(true)` + early-return + popup "Game already started — Host started game without this user" → OK → Home. Approved non-hosts hanteras inte här (separat gap dokumenterad i koden).

**Scroll-to-top vid lobby-entry** — `mainScrollRef` på lobby:s primär-ScrollView. URL-params-effekten (samma som hanterar fresh entry från host/guest/registered-flow) anropar `mainScrollRef.current?.scrollTo({ y: 0, animated: false })` i en `requestAnimationFrame`-wrapper vid varje fresh entry. Krävs eftersom Stack-navigatorn kan återanvända samma route-instans och ärva tidigare scroll-position — utan denna landar guest-användare som joinar via Join Game mitt på sidan istället för vid headern.

**Gold-glowing CTA-position** (Start Game / Waiting for Host) — båda renderas på samma plats i `startSection` och delar visuell vokabulär (gold halo + scale-pulse). Implementation:
- En enda `Animated.Value`-pair (`startGlow`, `startPulse`) körs i `Animated.loop` utan `hostMode`-gating — bara en ruta renderas åt gången per role, så animationen är "billig dubbelproduktion" oavsett.
- Host: `Pressable` med "Start Game"-text i `Colors.background` (mörk på guld).
- Non-host: `View` med "Waiting for Host to Start Game" + `<SequentialDots color={Colors.background} />`.
- Båda ärver styling från `startGameWrap` + `startGameHalo` + `startGameButton`. Waiting-rutan override:ar bara `flexDirection: 'row'` via `waitingForHostBox`-stilen.

## Quiz — frågetyper (discriminerad union)

`quiz.tsx` håller frågorna i en **discriminerad union** `QuizQuestion = TimelineQuestion | ImageQuestion` (diskriminator: `type: 'timeline' | 'image'`):

- **TimelineQuestion** — musik-fråga. `correctYear`, `youtubeClips?`. Svar via `TimelineSelector` (year-scroll), scoring via `isCorrect(year, correctYear, interval, eraFrom, eraTo)`. Mediakort = `MediaPlayer` (YouTube/Spotify).
- **ImageQuestion** — bild-fråga. `displayName`, `letterGrid`, `optionsByPrefix`, `correctPrefix`, `prefixLength`. Svar via `ImageAnswerBlock` (Letter Grid → Final Selection), scoring via `pendingNameOption.isCorrect`. Mediakort = bild + `ProgressiveCover`.

**Pool-blandning** (`gameQuestions`) — **round-block-struktur** för Pass-the-Phone-paritet: alla spelare i samma rond ska få samma fråge-TYP (men olika ITEMS); typen växlar mellan ronder. Block-storlek = `turnOrder.length` (= antal spelare per rond). Per block: alternering musik ↔ bild (block 0=music, block 1=image, block 2=music, ...). Inom block: items från relevanta pool (era-filtrerad musik / IMAGE_SEED_QUESTIONS) via cyklisk indexering `(block * playerCount + q) % pool.length` så alla spelare i ronden får olika items även om poolen är mindre än spelarantalet. Pool byggs för exakt `totalRounds` block — `questionIndex` stiger linjärt utan modulo-cykling.

Edge cases:
- En pool tom (t.ex. era utan musik-träffar): kör enbart andra typen alla ronder.
- Båda pooler tomma: fallback till `SEED_QUESTIONS` (musik-hardcoded).
- **Individual Devices** (parallel play, alla samtidigt på samma fråga): round-block-strukturen är inte semantiskt nödvändig där men bryter inget. Omdesign parkerad till separat session (2026-05-11).

**State-paritet musik ↔ bild**:
| musik | bild | beskrivning |
|---|---|---|
| `pendingYear` | `pendingNameOption` | Preliminärt val pre-Confirm |
| `selectedYear` | `confirmedNameOption` | Låst val post-Confirm (driver reveal) |
| `handleConfirm(year)` | `handleConfirmName(opt)` | Phase → 'awaiting' + recordRoundScore |

`canConfirm`-derived: `isImageQuestion ? pendingNameOption !== null : pendingYear !== null`. Driver Confirm-knappens disabled-state och pulse-loop.

**RoundResult-shapen är musik-formad** (`correctYear` + `selectedYear` som number). Image-frågor sätter båda = 0; reveal-renderingen läser `question.displayName` istället för selectedYear/correctYear för image. Player History som visar selectedYear (idag i `src/components/PlayerHistorySection.tsx`) kan behöva discriminator-anpassning innan den används för image-rundor.

**Per-spelare prefix-length** (implementerad): backend pre-bakar tre varianter per item (`prefix-1` / `prefix-2` / `prefix-3`). Klienten väljer variant runtime via inline-mapping i quiz.tsx: `full → prefix-3`, `standard → prefix-2`, `minimal → prefix-1`. `resetKey` på `ImageAnswerBlock` inkluderar `currentAssistance` så Letter Grid reset:as när spelaren byts i Pass-the-Phone (annars fastnar förra spelarens prefix-state). **Full-names-mode (Gen Alpha 2016+)** är fortfarande inte implementerat — annorlunda UI-shape (ingen prefix-knapp, direkt full-name-lista) kräver separat refactor av ImageAnswerBlock.

**Letter Grid-filter** (klient, `ImageAnswerBlock.sortedGrid` — i ordning):
1. **Längd-filter**: prefixens första ord måste ha ≥ variantens `prefixLength`. Skydd mot edge case där distractor-pool-namn med kort displayName ger kortare prefix än target.
2. **Word-count-filter**: alla prefix-knappar måste matcha rätta svarets ord-count. Om rätt svar är "Astrid Lindgren" (2 ord, "AS LI") visas bara 2-ord-distractors — 1-ord items som "Avicii" filtreras bort. Garanterar visuell konsistens i grid:n.
3. **Dedupering**: max EN prefix-knapp per begynnelsebokstav (vid "MA" och "MR" → båda börjar med 'M' behålls bara EN). Prio: prefix som matchar rätt svar; annars alfabetiskt först.

Edge case för word-count-filter: om kategorin har för få items med samma ord-count som rätt svar kan grid:n bli mindre än 10 knappar. Acceptabelt MVP-trade-off; pool är generellt stor nog.

**Inline Final Selection** (klient): Letter Grid + Final Selection är HOPSLAGNA i samma vy — varje prefix-rad har prefix-knapp till vänster (smal, 96 px) och, när vald, det fullständiga namn-kortet till höger (`flex: 1`). Tap på annan prefix-knapp flyttar namn-kortet till den nya raden. Inget separat "Step 2"-flöde, ingen Back-knapp. Pending-name sätts direkt vid prefix-tap så Confirm-knappen i quiz.tsx blir aktiv så snart en rad valts.

Namnet som visas (`pickNameForPrefix`): det rätta namnet om prefix matchar `correctPrefix`, annars alfabetiskt första distractor-namnet. Backend-datan (`optionsByPrefix`) lagrar fortfarande full pool så filtreringen är ren UI-tweak.

**audience-filter inte gjord (MVP)**: `audiences[]` på `ImageQuizQuestion` är inkluderad i datan men quiz.tsx filtrerar inte poolen baserat på host:s/aktiva spelarens generation. Alla 17 items visas oberoende av spelarprofil.

## Image questions (MVP)

Bild-pipelinen från backend till in-game-rendering:

1. **Wikimedia-pipeline** (`backend/wikimedia/`): `wikimedia-search` föreslår källor → `wikimedia-process <id>` laddar ner + sharp-resize (max 1920×1080 / WebP q85) → `backend/output/<id>.webp`.
2. **Asset-kopiering** till klient: webp-filer ligger i `assets/quiz-images/` (kopierade manuellt från `backend/output/`).
3. **Require-map** ([src/utils/quizImages.ts](src/utils/quizImages.ts)): static `Record<itemId, ImageSourcePropType>` med `require()`-statements (Metro/RN kräver statiska require:s — kan inte loop:as). Lägg till en rad när nya items processas. `getQuizImage(id)` returnerar `ImageSourcePropType | null`.
4. **Pre-baked fråga-data** ([src/utils/quizImageQuestions.ts](src/utils/quizImageQuestions.ts)): auto-genererad av `cd backend && npm run export-image-questions` ([backend/scripts/export-image-questions.ts](backend/scripts/export-image-questions.ts)). Scannar `assets/quiz-images/*.webp`, slår upp i katalog (`findItemsById`), genererar Letter Grid + distractor-options per item (för Millennials/standard-profilen). Exporterar `IMAGE_QUIZ_QUESTIONS: ImageQuizQuestion[]` + `getImageQuestionsForGeneration(gen)`-helper.
5. **In-game-rendering** i quiz.tsx (`question.type === 'image'`-grenen):
   - Mediakort: `<View imageMediaCard>` (16:9) med `<Image>` (`getQuizImage(question.id)`) + `<ProgressiveCover>` overlay. ProgressiveCover återanvänds som-är: `resetKey={questionIndex}`, `profile={{ birthYear: 1990, assistance: currentAssistance }}` (birthYear placeholder), `assistance={currentAssistance}` (driver reveal-fraktionen full=0.25/standard=0.5/minimal=0.75), `totalSeconds={responseSeconds}`, `isRevealed={phase === 'awaiting' || phase === 'reveal'}` (bilden snappas till revealed vid Confirm OCH bibehålls genom reveal-fasen tills Next-tap).
   - Svarsmetod: `<ImageAnswerBlock>` ([src/components/ImageAnswerBlock.tsx](src/components/ImageAnswerBlock.tsx)) — speglar mekanik från `app/name-quiz-demo.tsx` men anpassad för phase-machinery. Intern state för `selectedPrefix` (Letter Grid → Final Selection toggle), reset:as via `resetKey={questionIndex}`-prop. Pending/confirmed-namn-state lyfts till parent (quiz.tsx) för paritet med musik-flödets pendingYear/selectedYear.
   - Reveal-feedback: samma kort som musik-frågor men `correctLabel: 'Correct:'` + `correctValue: question.displayName` istället för year-rad.

**Bild-kvalitet (MVP-fakta)**: höjt tak från 1280×720 → 1920×1080 (Q85 oförändrat) gav märkbar förbättring bara för källor med >1280px upplösning (Stockholm 1631×1080 / London 1620×1080 / Berlin 1620×1080 / Madonna 675×1080 / Messi 808×1080 etc.). Wikipedia pageimage för Astrid (402×570), Cristiano (566×650), Zlatan (332×480) och Björn Borg (622×934) är källbegränsade — för bättre kvalitet på dessa krävs explicit Commons-URL via `wikimedia-process <id> <url>`. Paris-bilden är porträtt (648×1080, Eiffeltornet stående) och **letterbox:as i 16:9 mediaCard** — accepterat MVP-trade-off.

## Quiz — phase machinery

`quiz.tsx`-skärmen kör en linjär state-maskin per fråga:

```
'intro' → 'countdown' → 'question' → 'awaiting' → 'reveal' → ('leaderboard' | nästa fråga)
```

| Phase | Visas | Vad händer |
|---|---|---|
| `intro` | GetReadyIntro | Pass-the-phone: telefon-överlämning till nästa spelare. Visas också vid spelstart i båda lägena. Tap på Q-play-logo → `countdown`. |
| `countdown` | CountdownIntro | 3-2-1-nedräkning i Q-logga, sedan "?" pop:as in i samma Q-ring efter 1:an försvinner. När hela sekvensen är klar (~4 s) → `question`. |
| `question` | Question UI (timer-bar + media + fråge-kort + TimelineSelector + Confirm-knapp) | Timer tickar, spelaren svipar tidslinje + tappar Confirm. |
| `awaiting` | Samma UI som `question`, TimelineSelector låst | Reveal döljs tills timer:n går till 0. Säkerställer att alla spelare får samma tidsbudget oavsett när de bekräftade — kritiskt för kommande Individual-Devices-flöde där flera spelare svarar parallellt. |
| `reveal` | Question UI + feedback-kort (✓/✗ + Correct year + ev. Answer time + Next-tab) | Visas när timeLeft hits 0. Tap på Next-tab inom kortet → nästa fråga (eller `leaderboard` på sista). |
| `leaderboard` | RoundLeaderboard | Final scores + Home/Play Again-knappar. |

**Turordning skickas från Lobby via expo-router params**: `LobbyScreen.handleStartGame` bygger `turnOrder = approvedPlayers.filter(!hasLeft).map(p => ({id, name, emoji, avatarUri, assistance, age}))` och pushar som `players: JSON.stringify(turnOrder)` + `gameMode` + `roundsCount` + `roomCode` + `eraFrom`/`eraTo` + `answerResponseSeconds`. `quiz.tsx` parsar `players` med `try/catch` i `useMemo` så korrupt payload faller tillbaka till tom array. Den minimala `TurnOrderPlayer`-shape:n inkluderar `assistance` och `age` per spelare så quiz-skärmen kan applicera per-spelare-svarsruta-intervall i Pass-the-Phone.

**Per-spelare-state derivation från turnOrder**:
- `currentAssistance: AssistanceLevel = turnOrder[currentPlayerIndex]?.assistance ?? fallbackAssistance` — driver TimelineSelector:s svarsruta-intervall (full=5 år, standard=3 år, minimal=exakt) per rond. URL-paramets `assistance` används bara som fallback.
- `gamePlayers = turnOrder.length > 0 ? turnOrder.map(...) : [youPlayer, ...MOCK_OPPONENTS]` — den faktiska spelarlistan i spelet, replacerar tidigare hardcoded `[you + mocks]`. Pass-the-Phone visar de riktiga spelarna i leaderboarden istället för mocks.
- `gameTotals: Record<string, number>` — per-spelare-totals aggregerade direkt från `allRoundScoresHistory`. Replacerar tidigare `{ you: totalPoints, ...opponentTotals }`-uppdelning. `totalPoints` är derived = `gameTotals[hostId] ?? 0` (host:s id = `turnOrder[0]?.id`).
- `youPlayer` läser `name`/`emoji`/`age` från `turnOrder[0]` så leaderboarden visar host:s riktiga avatar/namn istället för hardcoded `'You'` / `'🎮'`.

**Play Again carry-over** (`goToNewLobby` i [app/quiz.tsx](app/quiz.tsx)): laddar `loadProfile()` FÖRST, sedan bygger `lobbyPlayers`-arrayn till `savePendingLobbyPlayers`. Host:s rad får `name: profile?.playerName ?? 'You'` och `emoji: getAvatarEmojiById(profile.selectedAvatarId)` — INTE hardcoded `'You'` / `'🎮'` som tidigare. Annars hade host:s namn synts som "You" i nästa lobby + nästa spel:s leaderboard tills `mergeProfileIntoHost` hann fyra (vilket är efter mount). Gäller både "keep players" och "fresh"-grenarna i goToNewLobby.

**Score per fråga går till EN spelare** — `recordRoundScore(pts, correct, timeUsed)` (tidigare `simulateOpponentRound`):
- I Pass-the-Phone (turnOrder satt) skapas endast en post per fråga med `playerId = turnOrder[currentPlayerIndex].id`. Mock-opponents auto-genererar **inte** poäng eftersom alla riktiga spelare delar enheten.
- Vid direkt-nav (turnOrder tom) bibehålls mock-opponent-flödet för gameplay-testning.
- `currentRoundScores` + `allRoundScoresHistory` uppdateras med exakt en post per fråga i pass-the-phone — så leaderboarden bara räknar upp Q-kolumnen för spelaren som faktiskt svarat.

## Quiz — Get Ready to Vibe intro screen

Hand-off-skärmen mellan Lobby:s Start Game-tap och första quiz-frågan. [src/components/GetReadyIntro.tsx](src/components/GetReadyIntro.tsx) renderas av [app/quiz.tsx](app/quiz.tsx) som `'intro'`-fas — initial fas vid spelstart i båda lägena, OCH mellan rundor i Pass-the-phone (telefon-överlämning). Tap på Q-play-logo i intro:n → `'countdown'`-fas (3-2-1) → `'question'`-fas.

**Mode-dependent fas-flöde i `handleAdvanceToNextRound`**:
- **Pass-the-Phone**: rotera `currentPlayerIndex` (mod `turnOrder.length`) → sätt fas till `'intro'` så "Pass-the-Phone to: <namn>" visas innan nästa fråga.
- **Individual Devices**: hoppa över intro mellan rundor (parallel play, ingen telefon-överlämning) → gå direkt till `'question'`. Vid spelstart visas intro:n dock även här (varje spelare på sin enhet behöver tap för att starta).

**Timer-gate**: `useEffect` som anropar `startTimer()` är gated på `phase === 'question'` (entry från countdown). Cleanup i den effekten klippper INTE intervallet vid `question → awaiting`-transition — kritiskt så timer:n fortsätter ticka oberoende av phase-byte. Self-clearing sker i `setInterval`-handler:n när `timeLeft = 0`. Separat unmount-only useEffect cleanup:ar timer:n vid Quit Game.

**Layout** ([GetReadyIntro.tsx](src/components/GetReadyIntro.tsx)) — i SafeAreaView från topp till botten:

1. **Top banner med Quit Game** (banner-styling: full-bredd-band med `Colors.card` bg + `borderBottom`, `paddingHorizontal: lg / paddingVertical: sm + 2` — samma vokabulär som `TopUserBanner`). Quit Game-pillen vänsterställd via `flexDirection: 'row'` + `justifyContent: 'flex-start'`. Tap → Alert → `deactivateRoom(roomCode)` + `clearLeftPlayers(roomCode)` + `router.replace('/')`.
2. **Game settings-block** (centrerad row med Q-logo + settings-text till höger, `gap: Spacing.sm`). Innehåller:
   - `<QuizVibeLogo size={96} />` (utan tidigare "GET READY TO VIBE"-overlay).
   - **"Game settings"**-rubrik (FontSize.lg, bold).
   - **Game era**: `{eraFrom} – {eraTo}` (host:s val från Lobby, fixt under hela spelet).
   - **Answer response time**: dropdown-trigger på samma rad som rubriken — visar `{N}s ▼` (`{N}s 🔒` när låst). Tap → Modal med 4 options (15s/30s/45s/60s). Quiz.tsx håller `responseSeconds` som state och passar `onAnswerResponseSecondsChange` så användaren kan justera mellan ronder.
   - **Locked-state i Pass-the-Phone**: `responseSecondsLocked = gameMode === 'pass-the-phone' && currentPlayerIndex !== 0`. När låst → tap visar info-Alert ("response time can only be changed at the start of a new round — when all players have answered the same number of questions"). Trigger:s border + text dimmas + ▼ byts till 🔒.
3. **Current Leaderboard (utfällbar)** mellan settings och play. Default **collapsed** vid varje GetReadyIntro-mount. Tap på header → expand. Body är `position: 'absolute'` med `top: '100%'` + `zIndex: 100` + `elevation: 10` → **OVERLAY:ar** play + turordningstabellen istället för att skjuta dem nedåt. Innehållet bakom stannar på sin plats men göms tills body collapses igen. Layout: 3-kolumns sport-tabell (se "Leaderboard table" nedan).
4. **Play-knapp** (centrerad): `<QuizVibePlayLogo size={140} color={Colors.warning} />` — Q-logo med play-triangel inuti Q-ringen (ersätter den gamla blå rektangulära knappen). **Gold glow** runt logon: `playLogoHalo` (absolut-positionerad bakom, `Colors.warning` bg + animated opacity 0.35 → 0.8) + iOS-only shadow med `shadowColor: Colors.warning`. Scale-pulse 1 → 1.06 över 800ms.
5. **Turordningstabell** under play-knappen — fixed-höjd 3-kolumns-grid:
   - **Header**: `R: | Q: | Pass-the-Phone to:` (textSecondary, semibold, uppercase via Typography.overline-mönster).
   - **Current player-rad**: R/Q-värden i vanliga celler; Player-cellen wrap:ar avatar + namn i en primary-bordered box (`primaryMuted` bg).
   - **Kö-rader**: avatar (32×32) + namn i textSecondary-tonad text. Tabellen scrollar internt vid lång kö (maxHeight 180).
   - **`Round X`-separator** infogas mellan två kö-rader när rondnumret förändras (jämfört med föregående rad eller current player). `paddingVertical: 4`, `Colors.primaryMuted` bg, `primaryBorder` top+bottom, FontSize.xs bold uppercase primary text. Hjälper till att markera round-bytena visuellt utöver den befintliga R-kolumnens siffra.
   - **Slutmarkör** under tabellen: `🏁 End of Game` om sista kö-frågan = totalQuestions, annars `🔁 + more questions` (kompakt en-rad).
   - **Footer**: `Round X of Y · Question N of M · K players` — diskret total-räknare under markören.

## Quiz — Leaderboard table (delas av GetReady + final RoundLeaderboard)

Sport-tabell-layout som driver både GetReadyIntro:s utfällbara leaderboard OCH final-leaderboarden i [src/components/RoundLeaderboard.tsx](src/components/RoundLeaderboard.tsx). Identisk struktur så användaren ser samma data-vy under hela spelet och vid game-end.

**3-kolumn**: fixed Player (Pos + Namn + meta-rad) | scrollable middle (`Q | ✓ | ✗ | AVG | LAST | Last 5`) | fixed PTS:
- **Vänster fixed**: position (1-based) + namn-stack (emoji+namn ovanpå "Standard · Age 32"-meta-rad i textSecondary). Namn + meta trim:as via `numberOfLines={1}`. Min-width 170 / max 220 px (bumpat från 130/180 så meta-raden får plats utan trunkering — tar utrymme från mid-scroll-kolumnen som scrollar horisontellt vid behov). `lbNameStack` är column-flex med gap 2; `lbName` (FontSize.sm semibold textPrimary) ovanpå `lbNameMeta` (FontSize.xs medium textSecondary, letterSpacing 0).
- **Mitten scrollbar horisontellt**: ScrollView som spänner över ALLA rader (header + spelare) så de scrollar synkat. Cell-höjd 52-56 px konstant så namn+meta-stacken får plats och kolumnerna alignar.
  - **Q** = antal frågor spelaren faktiskt svarat på (= playedRounds; "Q" är användaren-vänligare än "R" i sport-tabell-formatet).
  - **✓** (grön) / **✗** (röd) — räknare för rätt/fel.
  - **AVG** / **LAST** — svarstid med **2 decimaler** (t.ex. `7.48s`). `LAST` = senaste avslutade fråga. Decimal-precisionen kommer från `handleConfirm` som skickar `exactElapsedSec` (Date.now-diff) till `recordRoundScore`, INTE heltals-derived `responseSeconds - timeLeft` — det senare gav alltid `x.00` i dessa kolumner. Mock-opponent `generateOpponentTimeUsed` har på samma sätt `Math.round((5 + Math.random()*20) * 100) / 100` så även auto-genererade svarstider visar variation.
  - **Last 5** — 5 färgade dotts (grön ✓ / röd ✗ / grå tom plats för ej-spelade-ronder), höger-justerade så de senaste 5 alltid pekar mot listans slut.
- **Höger fixed**: PTS — total points i primary blå bold, höger-justerad. Min-width 56 px, alltid synlig.

**Sortering**: poäng desc → avg response time asc (ties brutna av snabbast genomsnitt).

**Aggregering**: `tableEntries` deriveras direkt från `allRoundScoresHistory` per spelare-id. `playedRounds` = antal scores för spelaren, `correctAnswers` = filter på `correct=true`, `avgResponseSeconds` = mean av `timeUsed`, `lastResponseSeconds` = sista entry:s `timeUsed`, `lastFiveResults: boolean[]` = `playerScores.slice(-5).map(s => s.correct)`. När färre än 5 ronder spelats padd:as resten med grå tomma platser. `age` + `assistance` per spelare bärs in från `LeaderboardPlayer`-shape:n och driver meta-raden i Player-kolumnen via `ASSISTANCE_LABEL`-mapping.

## Final Leaderboard-vyn — layout

[src/components/RoundLeaderboard.tsx](src/components/RoundLeaderboard.tsx) renderar Final Leaderboard som en **flex column med intern ScrollView + sticky footer**:
- Outer View `flex: 1` fyller hela SafeAreaView:n.
- ScrollView (header + tabell) tar resterande höjd via `flex: 1`. Scrollar internt när tabellen är längre än skärmen.
- `stickyFooter` (Home + Play Again) pinnas naturligt vid skärmens nederkant via flex-layouten — ingen `position: 'absolute'` behövs. `borderTop` + `Colors.background`-bg ger visuell separation från den scrollande tabellen ovanför.

**Renderas UTANFÖR quiz.tsx:s parent ScrollView** via en early-return i renderingen (`if (phase === 'leaderboard') return <SafeAreaView><RoundLeaderboard.../></SafeAreaView>`). Annars hade RoundLeaderboard:s sticky footer följt med uppåt vid scroll i parent och inte längre alltid varit synlig.

**Header**: `headerTitle` = `fontSize: 24, fontWeight: '700'` (matchar Lobby:s screenTitle exakt). `headerSubtitle` ("Round X of Y") renderas BARA när `!isLastRound` — Final-vyn visar enbart huvudrubriken. Tidigare "Final result"-undertitel borttagen för minimalistisk layout.

**Final leaderboard-knappar** (när `isLastRound`, i sticky footer):
- **Home** (vänster, `flex: 1`): `<QuizVibeQAvatar size={32} />` + "Home"-text i `flexDirection: 'row'` + `gap: Spacing.sm`. Bg `Colors.card`, border `Colors.border` (1.5 px), `Colors.primary`-text. Speglar TopUserBanner:s "Home"-backlink men på en row-layout istället för column.
- **Play Again** (höger, `flex: 1`): bg `Colors.card`, border `Colors.border` (1.5 px), `Colors.primary`-text "Play Again". Knappens hela perimeter omgärdad av små grå (`Colors.textSecondary`) SVG-pilar i klockvis flöde — **3 per långsida (top + bottom) + 1 per kortsida (left + right) = 8 totalt**: top→ / right↓ / bottom← / left↑. Pilarna är 14×10, absolut-positionerade med center på border-linjen så de "skär igenom" ramen. Procent-positioner derived via `buildArrowOffsets(N)` (N+1 jämn fördelning) — 3 långsida → 25/50/75 %, 1 kortsida → 50 %. SVG-fill cast:as till `${number}%` template-typ för RN:s `DimensionValue`-typer. Visuellt signalerar rotations-loop:en "play again / restart" utan en ikon inuti knappen.

Båda knappar `flex: 1` så footer-raden fylls 50/50 med Spacing.sm gap mellan; `gap` + `flexDirection: 'row'` på `finalActions`-container.

## Quiz — Question screen (question + awaiting + reveal phases)

Fråge-vyn i [app/quiz.tsx](app/quiz.tsx) är samma layout för `'question'`-, `'awaiting'`- och `'reveal'`-faserna — reveal-feedbacken renderas inline istället för i en separat skärm. Mediakortet, timer-baren, stopwatch:n, fråge-kortet och TimelineSelector:n stannar synliga genom hela cykeln; bara feedback-kortet läggs till vid `'reveal'`.

**Quit Game**: bor bara i GetReadyIntro:s top-banner. Question/awaiting/reveal har ingen Quit-knapp — användaren får vänta ut timern, sedan tappar Next-tab inom feedback-kortet → nästa intro där Quit är tillgänglig.

### Timer-arkitektur (smooth + drift-fri)

Tre parallella mekanismer driver tidsvisningen oberoende av varandra:

1. **`timerProgressAnim`** (Animated.Value, RAF-driven) — bar:ens BREDD interpoleras från `0 → 1` mappat till `'0%' → '100%'`. Animated.timing kör `1 → 0` med `Easing.linear` över `responseSeconds * 1000` ms. **useNativeDriver: false** (procent-width kräver JS-driver), men RAF-schemaläggningen gör att bar:en uppdateras varje frame oberoende av setInterval, setStates eller Confirm-handlerns batch. Kritiskt så bar:en aldrig "fryser" eller stepar — ger upplevelsen att tiden flyter på även medan flera spelare confirmar parallellt (kommande Individual-Devices-flöde).
2. **`timerRef.current`** (setInterval 1 Hz) — driver heltals-`timeLeft`-state för "23s"-räknaren och scoring/time-out-logiken (jobbar i hela sekunder). Self-clearas i sin handler vid `timeLeft = 0`.
3. **`decimalElapsedMs`** (setInterval 20 Hz, beräknar mot `Date.now()`-diff) — driver stopwatch:ns 2-decimals-display under timer-bar:en. Räknar UPPÅT från `00.00` mot `responseSeconds`. Gateas på `phase === 'question'` så tick:en stoppar vid Confirm; senaste värdet fryses tills nästa fråga.

**Native/JS-driver-konflikt**: opacity (native) och width (JS) får INTE applicieras på samma `Animated.View`-nod (kraschar med "Attempting to run JS driven animation on animated node that has been moved to native"). Lösning: `timerFillPulseWrap` (yttre, opacity = pulseAnim, native) wrap:ar `timerFill` (inre, width-interpolation, JS). Två separata noder.

**Color-trösklar för `timerColor`** (drives bar:ens fill-färg + ring-border + integer-color):
- `timeLeft > 10` → `Colors.primary` (blå)
- `timeLeft > 5` → `Colors.warning` (gul)
- `timeLeft <= 5` → `Colors.error` (röd)

**`stopwatchColor`** (decimal-rutans border + integer-color) följer EJ timerColor i awaiting/reveal — då skiftar den till en lugn ljusblå (`#8CC1FF`) för att signalera "du har confirmat — vänta på reveal" istället för att fortsätta varna i gult/rött:
```ts
const stopwatchColor = phase === 'question' ? timerColor : '#8CC1FF';
```

### Layout (sekvens uppifrån)

1. **Mediakort** — för `question.type === 'timeline'` (musik) renderas `MediaPlayer` (YouTube/Spotify/none). För `question.type === 'image'` renderas `imageMediaCard` (16:9 wrap, `aspectRatio: 16/9`, `overflow: 'hidden'`) med `<Image source={getQuizImage(question.id)!} resizeMode="cover">` + `<ProgressiveCover>` overlay (se "Image questions (MVP)" nedan).
2. **Timer-section** (row): timer-bar (flex 1) + **pulserande ring runt sekund-räknaren**. Ringen är 56×56 cirkel med dynamisk `borderColor: timerColor`, halo-View bakom (samma färg, `opacity` pulserar 0.3 → 0.7 över 700 ms native), och scale-pulse 1 → 1.08. Sekund-siffran (24 px bold tabular-nums) sitter inuti ringen.
   - **Avatar-markör på timer-bar:en** vid bekräftad svarstid: 28×28 gold-bordered avatar (URI-bild eller emoji-fallback) absolut-positionerad inom timerTrack med `left: ${((responseSeconds − confirmedTimeUsed) / responseSeconds) * 100}%` — sitter exakt på fillens högra kant vid Confirm-momentet. När timer:n fortsätter krymper fillen FÖRBI avataren så användaren ser "tiden har passerat ditt svarsmoment".
3. **Stopwatch-rutan** (centrerad under bar:en) — räknar UPPÅT med 2 decimaler:
   - `<StopwatchIcon size={32} color={stopwatchColor} />` ([src/components/StopwatchIcon.tsx](src/components/StopwatchIcon.tsx)) — modern SVG-ikon (rund kropp, top crown-knapp, sido-knapp, visare som pekar mot 1-2-positionen). Wrap-View med height 40 (= integer-textens lineHeight) centrerar SVG:n vertikalt med stora siffran.
   - Integer "07" (38 px bold, `stopwatchColor`) + decimal ".48" (22 px semibold, `Colors.textSecondary`).
   - Hela rutan har `borderWidth: 2 / borderColor: stopwatchColor` + halo bakom (`backgroundColor: stopwatchColor` + animated `opacity: timerRingGlow` — synkat med ringens pulse).
   - Display **fryses** vid Confirm via `setDecimalElapsedMs(elapsedAtConfirm)` i handleConfirm, sedan stopp på 20 Hz-tick:en när phase blir `'awaiting'`.
4. **Fråge-kort** (`minHeight: 140`):
   - Top-rad: `Question N of M` (vänster) + `Answering`-stack (höger, bara Pass-the-Phone). Stack:en är `flexDirection: 'column'` + `alignItems: 'flex-end'` + `gap: 1` så "Answering:"-label sitter ovanpå PlayerName i två högerställda rader istället för en lång rad. `questionTopRow` har `alignItems: 'flex-start'` så stack:en kan vara två rader utan att skuffa question-räknaren neråt.
   - Frågetext (`flex: 1`, vertikalt centrerad). **Music-frågor split:as i två rader**: `<Text style={questionTextHeadline}>Which year</Text>` (32 px bold) + `<Text style={questionText}>was this song released?</Text>` (18 px semibold). Övriga kategorier (kommande Capitals/Persons) renderar `question.question` som single-text.
5. **TimelineSelector** med pulserande gold-pilar utanför svarsruta-edges:
   - `‹` / `›`-glyfer (38 px bold, `BOX_COLOR` + textShadow för glow), absolut-positionerade vid `right: '50%' + marginRight: selectorWidth/2 + 6` (vänster) respektive `left: '50%' + marginLeft: selectorWidth/2 + 6` (höger). Loop:ar opacity 0.35 ↔ 1 + scale 1 ↔ 1.18 över 700 ms (native driver). Stoppas när `disabled`.
   - **Era-låst tidslinje**: `min = eraFrom`, `max = eraTo` (via props från quiz.tsx). Spelaren kan inte scrolla utanför Game Era. **`getAnswerRange(selectedYear, interval, min, max)`** shiftar fönstret in i intervallet vid kanterna istället för att klippa det — så full=5 kollapsar inte till 3 år vid edge. `isCorrect` använder samma helper så scoring synkar med visuella fönstret.
6. **Action-knapp / pillar** (fas-medveten):
   - `'question'`: **Confirm**-knapp i `Colors.primary` med pulsande blue glow (halo-View bakom, opacity 0.35 ↔ 0.8 + scale 1 ↔ 1.04). Loops stoppas när `pendingYear === null` (disabled-knapp pulserar inte).
   - `'awaiting'`: passiv pillar `✓ Confirmed — waiting for time` (primaryMuted bg + primaryBorder, textSecondary text, ingen tap).
   - `'reveal'`: ingen action-knapp i actionWrap — Next-tab sitter INUTI feedback-kortet istället.
7. **Feedback-kort** (visas BARA i `'reveal'`, inte i `'awaiting'` — se nedan):
   - `borderWidth: 2`, kompakt padding (`paddingVertical: xs / paddingHorizontal: sm / gap: 2`).
   - **Båda statusarna delar bg-färg `Colors.card`** (samma som question-kortet ovanför) så reveal-vyn känns som en seamless förlängning av frågan istället för en "alarm-ruta". Status-färgen bärs enbart på badge + border: grön border (`Colors.success`) vid rätt, röd border (`Colors.error`) vid fel.
   - **Badge**: `✓ Correct Answer` (success) eller `✗ Wrong Answer` (error) i top-vänster.
   - **`feedbackYearRow`** (row + `alignItems: 'flex-end'` + `justifyContent: 'space-between'`): "Correct year: {N}" vänster + Next-tab höger på SAMMA rad. `alignItems: 'flex-end'` bottom-anchorar båda så Next-tab:ens underkant linjerar med correct-year-textens underkant — driver tab:ens vertikala position så den läser som en logisk fortsättning på årsraden istället för en separat botten-knapp.
   - **Answer time** (bara vid rätt svar): `Answer time: {X.YY}s` i FontSize.xs `textSecondary` + `marginTop: -2`. Renderas UNDER feedbackYearRow.
   - **Next-tab** (i feedbackYearRow): `Next →` eller `🏆 Final Leaderboard`. **Bg = `Colors.primary` (blå)** för båda fallen oavsett rätt/fel — Card:ens border + badge bär status-färgen, tab:en signalerar bara "fortsätt".

### Confirm + awaiting + reveal-flödet

**`handleConfirm(year)`**:
1. Räknar exakt elapsed via `Date.now() - questionStartMsRef` → `exactElapsedSec` (cap:as till `responseSeconds`).
2. `recordRoundScore(pts, correct, exactElapsedSec)` registrerar score:n under **active player's id** (`turnOrder[currentPlayerIndex]?.id ?? 'you'`). **Skickar `exactElapsedSec` (2-decimaler) — INTE heltals-derived `responseSeconds - timeLeft`** — annars hade leaderboardens AVG/LAST-kolumner alltid visat `x.00`. Samma värde sparas i `setRounds`-historiken som `timeUsed`. I Pass-the-Phone genereras inga mock-opponent-poäng — endast aktiva spelaren får en post. `allRoundScoresHistory` uppdateras.
3. Sätter `confirmedTimeUsed`, `decimalElapsedMs` (frys), `selectedYear`.
4. Stoppar **inte** timer:n. Sätter `phase = 'awaiting'`.

**Awaiting-fasen**:
- TimelineSelector låst (`disabled`), feedback-kortet INTE renderat ännu.
- Stopwatch:n fryser på exakt confirm-värdet.
- Timer-bar:en + sekund-räknaren tickar VIDARE oberoende → ringen pulserar fortsatt i timerColor (gul/röd när tiden tar slut), stopwatch:n står still i ljusblå.
- När `timeLeft === 0` (eller `timeLeft <= 0` clamp:as) → `setPhase('reveal')` triggas av useEffect på `[timeLeft]`. Round redan registrerad i handleConfirm så ingen dubbelregistrering.

**Time-out utan Confirm** (`phase === 'question' && timeLeft === 0`):
- Default-guess = `currentYear - 20`, 0 poäng. `recordRoundScore(0, false, responseSeconds)` registrerar miss. `setPhase('reveal')`.

**Spring-in-animation** för feedback-kortet (`revealScale: 0.6 → 1` + `revealOpacity: 0 → 1`) triggas i useEffect på `phase`-deps varje gång phase blir 'reveal'.

### Music question + answer mock data

**`MUSIC_QUESTION_TEXT = 'Which year was this song released?'`** — alla mock-frågor delar denna text (själva låten är frågan via Spotify/YouTube). `correctYear` + `hint` (era) per fråga är fortfarande unika så reveal-vyn varierar i hint-texten även om frågetexten är generisk.

**`calculatePoints(timeLeft, correct, totalSeconds)`** — max 1000 pts vid omedelbart svar (`Math.round(1000 * (timeLeft / totalSeconds))`). totalSeconds-paramet skalar scoring så 30s/15s/45s/60s response time alla ger samma max.

**Answer response time** (`responseSeconds: 15 | 30 | 45 | 60`) är dynamisk state i quiz.tsx, justerbar via GetReadyIntro:s dropdown. Används överallt där 30 tidigare var hardcoded:
- `startTimer`: `setTimeLeft(responseSeconds)` + `Animated.timing.duration: responseSeconds * 1000`.
- `decimalElapsedMs`-tick + cap: `responseSeconds * 1000`.
- `handleConfirm`: `responseSeconds - timeLeft` för timeUsed; `calculatePoints(..., responseSeconds)`.
- Avatar-marker: `((responseSeconds − confirmedTimeUsed) / responseSeconds) * 100%`.
- Color-trösklar (warning ≤10s, error ≤5s, pulse ≤5s) bevarade som **absoluta sekunder** — universell "lite tid kvar"-perception.

**Game era → fråge-filter + tidslinje-cap**: Lobby:s `handleStartGame` skickar `eraFrom`/`eraTo` som router-params (post-clamp via `clampEraToPlayer`). Quiz använder dem för:
- `eraFilteredQuestions = SEED_QUESTIONS.filter(q => q.correctYear ∈ [eraFrom, eraTo])`. Fallback till hela `SEED_QUESTIONS` om filtret tomt.
- `<TimelineSelector eraFrom={eraFrom} eraTo={eraTo} />` — tidslinjens `min`/`max` är exakt era-spannet. Spelaren kan inte scrolla utanför.

**Mock-frågor cyklas via modulo** (`eraFilteredQuestions[questionIndex % length]`) tills riktig fråge-bank kommer in.

## Shared visual components

- `src/components/QuizVibeLogo.tsx` — brand SVG used on Home and Lobby room-card (both at `size={104}`). The Q-figure (ring + tail + wifi-fan in the center) is shifted **−3 in x, −1 in y** from the original (40, 38) center so the Q+tail bounding box (24-52, 24-52) is centered in the front rounded square (16-60, 16-60, center 38, 38). Wifi-fan replaces the old single dot — three concentric 90°-arcs (radii 3 / 5 / 7, `sweep-flag=1` so they bulge upward) + a 1.5px dot, all centered at (37, 37) (= Q ring center). 90° was chosen over 120° to match the iOS status-bar wifi icon's compactness — sweep-flag=0 produced inverted (frown) arcs, easy to flip back accidentally.
- `src/components/QuizVibeFriendsLogo.tsx` — brand-mark variant for the QuizVibe friends card on Profile. Q-form + tail + rotated squares are identical to `QuizVibeLogo`, but the wifi-pattern inside the Q ring is replaced with two profile silhouettes (head circle + body rounded-rect side-by-side). ViewBox tightened to `"13 13 54 54"` (vs `"0 0 80 80"` in `QuizVibeLogo`) to crop the empty padding around the rotated squares so visible content fills the render area at small sizes (44-52px). Q is centered at **(38, 38)** to match the squares' pre-rotation visual center, NOT (40, 40) which is the viewBox geometric mid. Default `size=44` to match Spotify/YouTube icon-wraps on the same screen; rendered inside a `friendsIconWrap` (44×44 View) for layout-dimension safety.
- `src/components/TopUserBanner.tsx` — full-width banner with a login pill (avatar + Player Name, or "Register or Login" when no profile) in the top-right corner. **Optional `onPress`**: when omitted the pill renders as a plain `<View>` istället för `<TouchableOpacity>` (used on Profile screen — user is already there, no destination); Home passes `setProfileMenuVisible(true)`; Lobby passes role-baserad handler (host → delete-sheet, non-host → leave-sheet — se "Lobby — TopUserBanner actions"). **Optional `profile` prop (controlled mode)**: skärmar med in-place-login (Home — login-modalen lever på samma skärm som bannern) MÅSTE passera sin egen profile-state så bannern uppdateras direkt vid login/logout — useFocusEffect-self-load triggar inte eftersom skärmen aldrig tappar focus. Lobby/Profile utelämnar proppen och låter bannern self-loada via useFocusEffect (de re-renderas naturligt när skärmen åter får focus). **Optional `guestName` prop**: när profile saknas men guestName finns visar pillen 👤 + guestName i muted styling (samma look som "Register or Login"-fallback) — driver display för gäster som joinat lobby:n via guest-form. Registrerade users (profile != null) har företräde om båda råkar vara satta. **Optional `onBackPress` + `backLabel?: 'Home' | 'Back'`**: när `onBackPress` är satt renderas en tillbaka-länk i bannerns vänstra kant och `topBoard` byter till `justifyContent: 'space-between'`. `backLabel='Home'` (default) visar Q-avatar + "Home"-text i column-stack (Colors.primary). `backLabel='Back'` visar plain `← Back`-text (Colors.textSecondary, fontWeight 500) som speglar Join-as-guest-modalens backBtn-style — används i Store. **Sticky-on-scroll pattern**: place as a direct child of `<SafeAreaView>`, **outside** the `<ScrollView>`, so it remains pinned at the top while content scrolls. Used on Home, Lobby, Profile, and Store screens.
- [src/components/ShoppingCartIcon.tsx](src/components/ShoppingCartIcon.tsx) — minimal SVG-ikon (basket-kontur + två hjul i Path/Circle) som leading-ikon på Store-knappar i user-login-modalerna (Home `profileMenu` + Profile `logoutSheet`). Default `size=22`, `color=Colors.textPrimary` så den smälter in i knapptexten istället för att dra fokus.
- `src/components/CodeKeyboard.tsx` — custom in-app keyboard som används av Room Code-cellerna i JoinModal OCH PlayerName-fältet i båda flödena (guest + register). Se "Custom CodeKeyboard" för props (`letterCharset`, `onModeToggle`), layout-detaljer och rationale.
- [src/components/RoundsRuler.tsx](src/components/RoundsRuler.tsx) — linjemätare för Number of Rounds + alla `ROUNDS_*`-konstanter (`ROUNDS_MIN=2`, `ROUNDS_MAX_PASS=4`, `ROUNDS_MAX_INDIV=20`, `ROUNDS_STEP=2`, `ROUNDS_DEFAULT=4`). Delas mellan Lobby (host-vy + non-host read-only) och Profile (host-default-block). PREMIUM-pillen över locked-tickarna är rektangulär (`borderRadius: 4`, `paddingHorizontal: 8 / paddingVertical: 2`, `fontSize: 10`) — speglar Individual Devices PREMIUM-badgens form, INTE pill-formen som ursprunglig Buy CTA hade. Centreras under bracket-bredden via en absolutpositionerad wrapper med `alignItems: 'center'` så bredden auto-anpassar till "PREMIUM"-textens bredd (ingen fixed `width: 100` längre).
- [src/utils/mockPurchasedPackages.ts](src/utils/mockPurchasedPackages.ts) — delad mock över köpta extra-paket (`MusicPackage[]`, default 3 paket: Hip Hop / Rock / Film & Actors). Profile (Customized Host packages-listan) + Lobby (Customized Host packages-block) + Store (PACKAGE_TIERS via shared id:n) refererar alla till denna lista. När Store-integrationen kopplas in ska mock:en bytas mot `loadPurchasedPackages()` mot riktigt backend; call-sites stannar oförändrade.

## Analytics

Lättviktig wrapper i [src/utils/analytics.ts](src/utils/analytics.ts) — `track(name, props?)`, `identify(userId, traits?)`, `resetIdentity()`. Implementationen loggar bara till console just nu; byt till vendor-SDK (PostHog / Firebase Analytics / Amplitude) när leverantör är vald — call-sites runt om i appen stannar oförändrade.

Event-taxonomi (snake_case verb i preteritum):
- **Lifecycle**: `user_registered`, `user_logged_in`, `user_logged_out`
- **Game flow**: `guest_name_created`, `room_code_created`, `game_started`, `game_completed`
- **Monetization**: `purchase_completed` (props: `type` = `'extra_package'` | `'subscription'` | `'credits'`, `product_id`, `price_amount`, `price_currency`)

Region/land skickas INTE i events — alla större vendors auto-fyller `country_code` via IP/locale så slicing per region funkar i dashboarden out-of-the-box. App Store Connect ger nedladdningar per region som separat datakälla. Skicka inte heller PII (email, fullt namn) i props.

Call-sites finns redan i: `handleRegisterSubmit`, `handleLogin`, `handleLogout`, `handleCreateGame`, `handleJoinAsGuest` ([app/index.tsx](app/index.tsx)) och `QuizScreen` (mount + final leaderboard) ([app/quiz.tsx](app/quiz.tsx)). `purchase_completed` saknar fortfarande call-site — instrumentera när Store-integrationen kopplas in.

## Name-answer model — demo route

`app/name-quiz-demo.tsx` är en fristående demo som visar två-stegs-svaret:

1. **Letter Grid**: 10 prefix-knappar i 5×2-grid, alfabetiskt sorterade (`localeCompare(b, 'sv')` så Å/Ä/Ö hamnar rätt). Single-select.
2. **Final Selection**: lista av fulla namn med matching prefix, alfabetiskt sorterade. Visar `catalog`/`pool`-tag per rad. "← Back" under "Selected: XX"-pillen.
3. **Confirm-steg**: klick på namn highlightar (primary-blå border), Confirm-knappen syns. Klick på Confirm låser → grön "✓ Correct Answer" / röd "✗ Wrong Answer"-feedback med rätt svar.

Demo-data (`src/utils/nameQuizDemo.ts`) genererad för Millennials (1990) + standard assistance = 2-bokstavs prefix.

**ProgressiveCover** ([src/components/ProgressiveCover.tsx](src/components/ProgressiveCover.tsx)) — mosaik-overlay som avslöjar bilden under sig:
- 32×18 = 576 svarta block, 4 block tas bort per tick. Total reveal-tid styrs av `assistance`-propen: `full=0.25 × totalSeconds`, `standard=0.5 × totalSeconds`, `minimal=0.75 × totalSeconds` (mer assistance = snabbare reveal, så Full-spelaren ser bilden tydligt långt innan time-out medan Minimal-spelaren får facit först precis innan tiden tar slut)
- Random reveal-order (Fisher-Yates shuffle) regenererad per `resetKey`-byte
- `<QuizVibeQuestionMarkLogo>` centrerad ovanpå mosaiken, fadar 1 → 0 över exakt 3 sekunder via separat tick-loop (oberoende av mosaik-speed) — så loggan inte hänger kvar och konkurrerar med bilden under hela response-time:n vid minimal/standard-assistance
- `key={questionIndex}` på själva ProgressiveCover (i demo-route) — tvingar full remount vid frågebyte, säkerställer att alla block är svarta från första render utan blink av förra fråges state
- React.memo på `<Block>`-komponenten — bara de 4 block som ändras per tick re-renderas, inte alla 576
- `isRevealed=true` → snap till alla block borta (för Confirm-flow). I demon visas bilden direkt vid Confirm; i framtida quiz-integration ska mosaik fortsätta tills timer slut även efter Confirm (öppen design-fråga, dokumenterad i konversation).
- Original-bilden under är ALDRIG pixlad — den är skarp hela tiden, bara skymd av cover-block som plockas bort. Bilden själv klipps inte — `mediaCard` har `overflow: 'hidden'` + `aspectRatio: 16/9`.

**logoSize-tweaking** för QuizVibeQuestionMarkLogo i mediaCard: 320 är empiriskt lagom för 16:9 på iPhone (~390px wide × 220px tall). 360+ klipps av top/bottom. <280 ser för litet ut.

## Shared visual components (sessions-tillägg)

- [src/components/QuizVibeQuestionMarkLogo.tsx](src/components/QuizVibeQuestionMarkLogo.tsx) — variant av `QuizVibeLogo` med `?`-glyph (SVG `<Text>`) i Q-ringen istället för wifi-fan. Squares + Q-ring + Q-svans identiska. ViewBox 0-80 × 0-80, Q-ring center (37, 37). `?` placeras på y=43 så glyph-mitten hamnar runt y=37 (SvgText:s y refererar till baseline).
- [src/components/QuizVibePlayLogo.tsx](src/components/QuizVibePlayLogo.tsx) — variant med play-triangel inuti Q-ringen istället för wifi-fan/?. Tar `color`-prop (default `Colors.primary`) som styr alla brand-färgade element (Q-ring, svans, play-triangel, squares-kanter). Bakre kvadratens muted-fyllning härleds som `color + '30'` (~19% opacity hex-alpha) så hela loggan toner mot color-värdet — i GetReady passas `Colors.warning` så loggan blir gold för att matcha gold-glow-halo:n runt den.
- [src/components/CountdownIntro.tsx](src/components/CountdownIntro.tsx) — 3-2-1-nedräkning mellan tap på play-knappen i intro:n och fråge-vyn. Stor `CountdownQLogo` centrerad (size 360 px på fullbreds-skärmar). Siffran (3, 2, 1) och `?`-glyfen pop:as in i Q-ringen via overlay-Animated.Text med spring-scale 1.4 → 1 + opacity 0 → 1, **följt av en kontinuerlig zoom-puls 1 ↔ 1.18 (350 ms varje håll, ~1.4 puls/sek)** tills siffran byts. Loop:n stoppas i useEffect cleanup vid count-byte så nästa siffrans pop-in inte krockar med den gamla loopen. Total tid ~4 s. **Q-loggan shift:as `LOGO_SIZE * 0.0375` åt höger** via en absolute-positionerad wrap-View så Q-ringens center (SVG-koord (37, 37) = 46.25 % av LOGO_SIZE) hamnar exakt på 50 % horisontellt under glyph-overlay:ns centrerade siffra/?. **PlayerName-block ovan loggan**: `Pass-the-Phone to:`-label + framed box (`primaryMuted` bg + `Colors.primary` border + Radius.md, padding sm/lg) som matchar GetReadyIntro:s `currentPlayerBox` 1:1 — avatar (40×40 cirkel) + namn (FontSize.xxl bold) i row-layout. `playerEmoji?: string`-prop skickas in från quiz.tsx via `turnOrder[currentPlayerIndex]?.emoji`. `playerBlock.gap = Spacing.xl` ger luftig separation mellan label-rad och box.
- [src/components/StopwatchIcon.tsx](src/components/StopwatchIcon.tsx) — modern sport-stopwatch SVG (rund kropp, top crown-knapp, sido-knapp diagonal, tick-mark vid 12-position, visare mot 1-2-positionen, center-pivot). `color`-prop styr alla element. ViewBox 24×24, default size 24. Används i quiz-skärmens decimal-stopwatch under timer-bar:en — ersätter den tidigare ⏱-emojin som rendereades inkonsekvent över plattformar.
- [src/components/ProgressiveCover.tsx](src/components/ProgressiveCover.tsx) — mosaik-reveal-cover (se "Name-answer model — demo route"). Tar `assistance`-prop som styr reveal-fraktion: `full=0.25`, `standard=0.5`, `minimal=0.75` av `totalSeconds` (mer assistance = snabbare reveal). Q-loggan fadar oberoende av mosaiken — alltid helt borta efter 3 s via separat tick-loop.

## Host Game Credits — gate på Create Game + Play Again

[`refreshFreeCreditsIfNeeded` i src/utils/profileStorage.ts](src/utils/profileStorage.ts) top-up:ar `freeGameCredits` upp till `FREE_CREDITS_DAILY_CAP = 2` vid första `loadProfile()` efter midnatt CET (icke-destruktiv: saldo ≥ cap lämnas orört). Det innebär att flödet `loadProfile() → kontrollera saldo` alltid jämför mot färska värden inkl. dagens refresh.

**Tre gates som blockerar host:s spelstart vid 0/0-saldo** (samma copy + Store-deeplink för konsistent UX):
1. **Home — `handleCreateGame`** ([app/index.tsx](app/index.tsx)): async, läser fresh `loadProfile()`, blockerar med `Out of Host Game Credits`-Alert (Cancel + Go to Store → `/store?focus=credits&from=/`) om både `freeGameCredits === 0 && gameCredits === 0`. Fångar tom-saldo INNAN lobby skapas.
2. **Lobby — `handleStartGame`** ([src/screens/LobbyScreen.tsx](src/screens/LobbyScreen.tsx)): samma gate vid Start Game-tap. Detta är där credit-deduktionen FAKTISKT sker (1 credit konsumeras, Free först sedan Extras). Backup-gate om host kommit förbi Home-gaten via Play Again eller direkt-nav.
3. **Quiz — `handlePlayAgain`** ([app/quiz.tsx](app/quiz.tsx)): async, läser fresh `loadProfile()` FÖRE re-use-players-prompten så user inte fyller i alerts först och sedan blockas i Lobby:n. **Verifierar** bara saldot — drar INGA credits här. Deduktionen sker först när host trycker Start Game i Lobby (samma flöde som Home → Create Game → Lobby → Start Game).

Alla tre använder identisk Alert-copy + same Store-deeplink. `handlePlayAgain` pushar Store **utan** `from=...`-paramet så Store:s Back-knapp faller till `router.back()` istället för `router.replace(from)` — det bevarar /quiz på root Stack:en med Final Leaderboard-state intakt även efter köp + auto-back via `handleBack`-callback i success-Alert:en (StoreScreen.handleBuyCredits).

## Scripts

`npm start` (Expo dev), `npm run ios` / `android` / `web`, `npm run lint` (`expo lint`). No tests, no CI.

`backend/`-projektet har egna scripts: `npm test` (vitest, 77 tester), `npm run validate` (parsea katalog), `npm run export-demo` (regenerera demo-data), `npm run wikimedia-search <id>`, `npm run wikimedia-process <id>`, `npm run demo` (skriver ut Letter Grid-output i konsolen).

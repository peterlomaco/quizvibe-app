# Individual Devices — implementation spec

Detaljerad implementation-spec för D-fasen (Individual Devices-läget). Kompletterar [`project_individual_devices_flow.md`](../../.claude/projects/C--Users-46725-quizvibe-app/memory/project_individual_devices_flow.md) i auto-memory:n — memory:n håller **decisions** (vad), denna doc håller **implementation** (hur).

Varje slice får egen sektion när den specas. När en slice är implementerad uppdateras sektionen med status `✅ Implemented` + ev. avvikelser från ursprungsspec.

## Status

| Slice | Status | Spec |
|---|---|---|
| D-0 | ✅ Implemented (2026-05-12) | Bottom tab-bar borttagen, alla skärmar plain Stack-routes |
| D-i | 🟡 Partial — GetReady/Countdown IndDev-variant landad; Premium-mock + host-deleted broadcast | Se commit `92006cc` |
| D-ii | 📋 Spec'd (this doc) — not implemented | [§ D-ii](#d-ii--synkad-media-start) |
| D-iii | 🟡 Partial (2026-05-13) — heartbeat-only signal lager landad; media-buffering-signal kräver D-ii media-adapters (ej byggda än) | [§ D-iii](#d-iii--bad-connection-detection) |
| D-iv | ⏳ Pending | — |
| D-v | ⏳ Pending | — |
| D-vi | ⏳ Pending | — |
| D-vii | ⏳ Pending | — |
| D-viii | ⏳ Pending | — |

## Shared architectural prerequisites

Innan D-ii kan implementeras finns några generella saker att etablera. De är inte slice-bundna — de delas av D-ii till D-vii.

### Supabase Realtime broadcast channel

Cross-device-sync mellan klienter i samma rum sker via **en gemensam channel per room**:

```
channel name: room:<roomCode>:sync
```

- **Subscribe** vid entry till Lobby OCH bibehålls genom Quiz-skärmen tills user lämnar rummet (Quit Game / Leave Game / room deleted).
- **Unsubscribe** vid teardown i `app/quiz.tsx`-unmount + `LobbyScreen`-unmount-cleanup. Idempotent — samma channel:s `unsubscribe()` kan anropas flera gånger utan effekt.
- **Discriminerade events** via en `type`-prop på payload:en. Alla payloads delar en gemensam envelope (se nedan).
- **Inte table-backed** — events är transient (lever bara så länge channel:n är öppen). Behovs ingen persistens; om en spelare missar ett event medan deras app är off-line så är de redan i bad-connection-flowet (se D-iii).

Skiljs medvetet från befintliga table-backed Realtime-subscriptions (`rooms`, `lobby_players`, `lobby_settings`) som driver persistent state-sync. Broadcast-channel:n är till för event-bus mellan klienter där state inte ska skrivas till DB.

### Event envelope

Alla broadcast-events delar en gemensam shape så channel-listenern kan dispatch:a på `type`-fältet:

```ts
// src/lib/realtime/syncChannel.ts
export type SyncEvent =
  | PlayerMediaReadyEvent
  | PlayCommandEvent
  | QuestionAdvanceEvent
  | HostActivityPingEvent   // D-v
  | PlayerConnectionStatusEvent  // D-vii
  // ...läggs på allt eftersom slices specas

export interface SyncEventBase {
  type: SyncEvent['type'];
  /** Avsändarens player_id från lobby_players. Mottagare ignorerar egna events. */
  sender_player_id: string;
  /** Date.now() vid avsändning. Används för late-join (ignorera stale events vid join). */
  sent_at: number;
}
```

### Clock-sync (MVP)

- Använd `Date.now()` på alla klienter direkt. Antagande: NTP-sync på enheterna ger ~100ms tolerance — acceptabelt för fairness i konsument-quiz-app.
- **Upgrade path** (deferred): om mätningar visar >300ms drift hos någon device-typ, lägg en Supabase Edge Function `get-server-time` som varje klient pingar vid GetReady-entry för att räkna ut sin offset. Ej planerad för MVP.

## D-ii — Synkad media-start

**Mål**: när host trycker Play i GetReady ska alla approved spelares enheter **samtidigt** byta till `'question'`-fasen med media spelandes från första frame. Drift mellan enheter ska vara <100ms i typfallet, <300ms worst case.

### High-level flow

```
host & non-hosts båda i GetReady (för question N)
      │
      │  varje klient laddar media för N (cueVideoById / prepare / Image.prefetch)
      │  → broadcastar player_media_ready när cued + network OK
      ▼
host ser per-player 🟢 / 🟡 / 🔴 i sin GetReady-vy
non-host ser bara egen ready-pill
      │
      │  host trycker Play (kan göra det även om vissa är 🔴)
      ▼
host broadcastar play_command { start_at, question_index }
      │
      │  alla klienter schemalägger:
      │  - countdown 3-2-1 start: omedelbart (visuellt fill av väntan)
      │  - question phase enter: vid exakt start_at (setTimeout-equivalent)
      ▼
start_at träffar → alla klienter samtidigt phase='question'
media börjar spela (YT.playVideo(), Spotify.resume(), ProgressiveCover startar)
timer börjar ticka
      │
      │  spelare svarar individuellt; timer går ut
      ▼
varje klient lokalt: question → awaiting → reveal
host broadcastar question_advance när reveal-tab tappas (eller efter idle-timeout)
      ▼
alla klienter: tillbaka till GetReady för question N+1
```

### Broadcast events (D-ii-specifika)

```ts
// Spelaren signalerar att deras media är cued + nätverk OK för en specifik fråga.
// Broadcastas EN gång per fråga + per spelare (debouncas på avsändarsidan om state flaprar).
export interface PlayerMediaReadyEvent extends SyncEventBase {
  type: 'player_media_ready';
  question_index: number;       // 0-based
  /** Vilken media-typ klienten har förberett. Mismatch mot host:s katalog = config-error. */
  media_type: 'youtube' | 'spotify' | 'image';
}

// Host trycker Play. start_at är ett Date.now()-värde i framtiden (typiskt now+4500ms).
// Tas emot av ALLA klienter inkl. host själv (host använder den interna kopian för att schemalägga sin egen lokala transition).
export interface PlayCommandEvent extends SyncEventBase {
  type: 'play_command';
  question_index: number;
  start_at: number;             // Date.now() epoch ms — exakt moment då question-phase ska börja
  /** Snapshot av per-spelare ready-state vid host:s tap. Spelare som inte är 🟢 routas till degraderad UI. */
  readiness_snapshot: Record<string, 'ready' | 'unstable' | 'loading'>; // playerId → status
}

// Host advancar till nästa fråga efter reveal. Broadcastas vid Next-tab-tap i reveal-fasen.
// För sista frågan broadcastas istället game_completed (kommer i senare slice; ej D-ii).
export interface QuestionAdvanceEvent extends SyncEventBase {
  type: 'question_advance';
  next_question_index: number;
}
```

### Pre-load pool

En per-klient in-memory-pool håller media för current + next fråga cued samtidigt:

```ts
// src/lib/media/preloadPool.ts
interface PoolEntry {
  questionIndex: number;
  mediaType: 'youtube' | 'spotify' | 'image';
  /** Klar att spela utan ytterligare nätverks-roundtrip. */
  cued: boolean;
  /** Buffering / load timeout / image-prefetch-error → 'unstable'. */
  status: 'loading' | 'cued' | 'unstable';
}

export class PreloadPool {
  // Håller högst 2 entries: current (N) och next (N+1).
  private entries: PoolEntry[] = [];

  /** Anropas vid GetReady-mount + vid question-advance. */
  async ensureCued(currentIndex: number, questions: QuizQuestion[]): Promise<void>;

  /** Säger åt YT/Spotify-player:n att börja spela current. */
  play(currentIndex: number): void;

  /** Släpper N när vi advancar till N+1. Idempotent. */
  release(questionIndex: number): void;

  /** Subscribe på status-change (klient lyssnar för att uppdatera ready-state). */
  on(event: 'status', listener: (entry: PoolEntry) => void): () => void;
}
```

**Pre-load-semantik per media-typ**:

| Type | "Cued" betyder | API-call |
|---|---|---|
| `youtube` | Thumbnail visad + IFrame-player ready event mottaget + `cueVideoById(id, startSeconds)` returnerat | `player.cueVideoById({ videoId, startSeconds })` (notera: `cue*` inte `load*` — annars auto-play:ar) |
| `spotify` | Track-URI resolved + buffered första chunken | `spotifySdk.prepare(uri)` (väntar pause-state) |
| `image` | Bild prefetched till memory-cache | `await Image.prefetch(uri)` från `react-native` |

**Rotation vid question-advance**:
1. `release(N)` — släpp YT-player-instans / Spotify-state / image-ref för fråga N.
2. Item som tidigare var N+1 promotas till N (redan cued).
3. `ensureCued(N+1)` på den nya next-frågan — kicka pre-load i bakgrunden.

Pool:en hålls i ett **module-level singleton** så samma instans överlever phase-byten inom Quiz-skärmen. Cleanas vid `app/quiz.tsx`-unmount (Quit / game-end / leave).

### State machine per device (GetReady-fasen)

```
Tillstånd:
  loading-media      ← initialt vid GetReady-entry
  validating         ← media cued + Realtime channel JOINED, 1500ms-fönster
  ready              ← validering passerat, broadcast skickad
  unstable           ← buffering / heartbeat-drop / image-load-error

Transitions:
  loading-media → validating
    triggers: PreloadPool.status='cued' för current question
              AND Supabase Realtime channel state === 'SUBSCRIBED'

  validating → ready
    triggers: 1500ms har passerat sedan validating-entry
              AND inga unstable-events under fönstret
    side-effect: broadcast PlayerMediaReadyEvent

  validating → unstable
    triggers: PreloadPool.status='unstable' under fönstret
              OR Realtime channel state-change till 'CHANNEL_ERROR' / 'TIMED_OUT'

  ready → unstable
    triggers: samma som validating → unstable

  unstable → loading-media
    triggers: PreloadPool.status='cued' again AND Realtime channel re-SUBSCRIBED
              (= recovery; re-run hela validation-cykeln)
```

`loading-media`-tillståndet visas också om host advancar till nästa fråga medan klienten fortfarande validerar — flow:n åter-startar för N+1.

### GetReady UI — host vs non-host

#### Host

- **Top-band** ovanför Game settings-blocket: liten horisontell rad med per-spelare-status-chips:
  - Format: `<Avatar 24×24> <playerName trunkerat 12 chars> <status-dot>`
  - Status-dot: 🟢 ready / 🟡 validating / 🔴 unstable / ⚪ loading
  - Renderas i `ScrollView horizontal` så fler än 4 spelare scrollar.
- **Play-knappen** är alltid enabled (host kan trycka oavsett andras readiness — per design).
- **Färgning av Play-knappen**:
  - Alla 🟢 → gold + halo (normalt utseende).
  - Minst en 🔴 eller 🟡 → gold men halo:n är dämpad (opacity 0.4) + en liten varningstext under: `"N players not ready"`.

#### Non-host

- **Ingen** per-spelare-status-chips-rad (privacy: man ser inte andras connection-status).
- **Egen ready-pill** ovanför "Waiting for Host..."-rutan:
  - 🟢 `Ready` (success-grön bg, success border)
  - 🟡 `Validating connection...` (warning bg, warning border)
  - 🔴 `Connection unstable — please verify` (error bg, error border)
  - ⚪ `Loading media...` (textSecondary bg, border)
- **"Waiting for Host..."-rutan** är samma som idag, men dämpas till opacity 0.5 om own state ≠ ready.

### Play handoff — exakt timing

1. **Host tappar Play** (vilken som helst readiness-state):
   - Host:s klient computar `start_at = Date.now() + START_DELAY_MS` där `START_DELAY_MS = 2500` (2s kortad countdown + 500ms broadcast safety buffer).
   - Bygger `PlayCommandEvent` med `start_at`, `question_index`, `readiness_snapshot` (kopia av lokala per-spelare-state-mappen).
   - Broadcastar.

   **Notera**: `CountdownIntro` behöver kortas från nuvarande ~4s (3-2-1 + "?"-pop) till ~2s (3-2-1 i snabbare takt, ~650ms per siffra, ingen separat "?"-pop). Påverkar BÅDA lägen (Pass-the-Phone också) — beslutat 2026-05-12 eftersom hand-off av telefonen i Pass-the-Phone sker före Play-tap (på GetReady-skärmen), inte under countdown. Countdown är ren visuell mark-time.

2. **Alla klienter (inkl. host) tar emot `play_command`**:
   - Validera att `question_index` matchar lokal current question (annars discard — late event).
   - Schemalägg lokal phase-transition:
     ```ts
     const msUntilStart = playCommand.start_at - Date.now();
     // Klient räknar ner countdown:
     setPhase('countdown');  // CountdownIntro renderas
     setTimeout(() => {
       setPhase('question');
       preloadPool.play(playCommand.question_index);  // YT.playVideo() etc.
       startTimer();  // existerande timer-logik
     }, msUntilStart);
     ```
   - Om `msUntilStart <= 0` (broadcast försenat förbi `start_at`): hoppa direkt till question men logga warning för telemetri. Bör vara sällsynt med 500ms buffer.

3. **Konsekvens för 🔴-spelare**:
   - De får också `play_command` och kör samma local schedule.
   - Men deras phase-transition routas till **degraded question UI** istället för normal:
     - Timer renderas men är **inactive** (visar `responseSeconds` statiskt, ingen tick).
     - TimelineSelector / ImageAnswerBlock greyas ut + `pointerEvents: 'none'`.
     - Centrerad popup `"Connection unstable. Please verify"` med ingen action-knapp.
     - När recovery sker mid-question (state återgår till `ready`): popup tas bort, timer börjar ticka från **resterande tid relativt `start_at`**, input enables. De har då en kortare svarstid.

### Question-advance handoff (D-ii minimal-scope)

För D-ii räcker det att host:s klient broadcastar `question_advance` vid Next-tab-tap. Non-hosts kör samma local-advance-logik mot fråga N+1 och re-mountar PreloadPool på N+1.

Detaljer för "reveal-tab visible även när andra spelare inte hunnit reveal" (= sync av reveal-fasen själv) — pre-fasen och själva question-fasen är synkade av `play_command`, men awaiting → reveal sker lokalt per device baserat på timer + confirm. Olika devices kommer alltså göra reveal-transitionen lite olika tid om de confirmade olika snabbt.

**Beslut**: reveal är lokal. När varje spelare själv tappat Next i sin reveal-feedback, väntar de på host:s `question_advance` innan de byter till GetReady N+1. Host:s tap är auktoritär.

Om host väntar (typ är distraherad) och alla andra har tappat Next → en `"Waiting for host to advance..."`-pill på respektive non-host:s reveal-vy. (Implementeras i D-ii eftersom det är synk-grundat.)

### Failure modes

| Scenario | Beteende |
|---|---|
| Host trycker Play medan host själv är 🔴 | Tillåtet (host kontrollerar spelet). Host:s egen UI degraderas precis som för icke-host 🔴. |
| Broadcast `play_command` aldrig anländer hos en klient | Klient stannar i GetReady. När channel re-connects (Supabase auto-reconnect) får klienten event från senare frågor och kan re-syncas via senaste `play_command` om host re-broadcastar. **Force-recovery**: klienten timar ut efter 60s i samma question_index och visar `"Lost sync with host"`-popup → tap → routas till GetReady som loading-media. Detaljerat reconnect-flow specas i D-vi. |
| `play_command` med `start_at` redan passerat | Hopp direkt till question-phase, men markerad som `late-sync` i telemetri. Acceptabelt; spelaren tappar bara countdown-luxen. |
| Spelare i `unstable` när `play_command` anländer + spelare återhämtar sig mid-question | Phase är redan `question`; ta bort overlay-popupen, beräkna `timeLeft` från `start_at + responseSeconds*1000 - Date.now()`. Om <0 → auto-fel (samma som timeout). |
| Två konkurrerande `play_command` (host taps två gånger snabbt) | Ignorera den andra om question_index är samma som första och tid sedan första är <2s. |

### Files att skapa / modifiera

| Fil | Action | Innehåll |
|---|---|---|
| `src/lib/realtime/syncChannel.ts` | NEW | Subscribe/publish-helpers för `room:<code>:sync`. Exposear `subscribeSyncChannel(roomCode, handlers) → unsubscribe`. Wraps Supabase Realtime broadcast-API. |
| `src/lib/media/preloadPool.ts` | NEW | `PreloadPool`-klass + module-singleton-export. |
| `src/lib/media/youtubeAdapter.ts` | NEW | Wrapper kring YT IFrame API:s `cueVideoById` + `playVideo` så PreloadPool är agnostisk över media-typer. |
| `src/lib/media/spotifyAdapter.ts` | NEW (stub i D-ii) | Stub som logging-no-op:ar; D-viii fyller i. |
| `src/lib/media/imageAdapter.ts` | NEW | Wrapper kring `Image.prefetch`. |
| `app/quiz.tsx` | MODIFY | Add `gameMode`-awareness: in IndDev, ersätt local-only timer-start med broadcast-driven start. Wrap existing phase-machinery i en mode-gated branch. |
| `src/screens/GetReadyIndividualDevices.tsx` | MODIFY | Wire in per-player-status-chips (host) + own ready-pill (non-host). Subscribe på syncChannel events. Skicka broadcast vid Play-tap. |
| `src/components/PlayerReadinessChip.tsx` | NEW | Avatar + namn + status-dot. Återanvänds i Lobby för D-vii. |
| `src/utils/clockSync.ts` | NEW | Trivial wrapper just nu — exporterar `serverNow() => Date.now()`. Centraliserad så D-vi/D-viii kan byta impl utan att call-sites ändras. |

### Resolved questions (2026-05-12)

1. **`PlayCommandEvent`-payload-storlek**: ✅ **Bara `question_index`** (Alt A). Fråge-katalogen finns redan lokalt i quiz.tsx på alla approved-klienter via Lobby-state. Gäller båda lägen.

2. **`START_DELAY_MS`**: ✅ **2500ms** (kortad från 4500ms). Påverkar BÅDA Pass-the-Phone och Individual Devices — hand-off av telefonen i PtP sker före Play-tap, inte under countdown. `CountdownIntro` kortas till ~2s totalt (3-2-1 ~650ms per siffra, ingen separat "?"-pop).

3. **Late-join under play_command-fönstret**: ✅ **Kan inte hända.** Approval-listan låses vid Start Game (i Lobby), så alla spelare som följer med till `/quiz`-fasen har redan en aktiv Realtime-subscription. `play_command` skickas först efter Start Game. Spinner-blocking i GetReady är därför inte nödvändig. Reconnect mid-game faller under D-vi.

4. **Reveal-fas-synk**: ✅ **Behåll asymmetrin.** Varje spelare läser facit i sin egen takt; host:s Next-tap är auktoritärt och advancar alla. Non-host som tappat sin Next ser `"Waiting for host to advance..."` tills host gör det.

### Tests / verification (innan landing)

Eftersom Supabase Realtime är externt beroende går det inte att enhetstesta channel:n direkt. Verifierings-plan:

1. **Manual two-device-test**: host på en device, non-host på en annan. Mät visuellt om mediastart är synkad (filma båda samtidigt → frame-by-frame i video-editor → tolerance <3 frames @ 60fps = 50ms).
2. **Throttle host:s nätverk** (Charles Proxy / Network Link Conditioner: 3G profil) → verifiera att `play_command` ändå anländer hos non-host inom 500ms safety buffer.
3. **Disable WiFi mid-validation** på non-host → verifiera unstable-state + popup.
4. **Snabb-rotation** mellan questions 5 ronder i rad → verifiera att PreloadPool inte läcker player-instanser eller image-refs (RN debugger memory-snapshot).

## D-iii — Bad-connection detection

**Mål**: detektera när en spelares enhet inte kan delta i synkat spel pga nätverk eller media-buffering, och rendera en greyed-out UI med popup `"Connection unstable. Please verify"` som auto-dismissar vid recovery. Detektions-lagret är delad infrastruktur som D-vi (full disconnect) och D-vii (Lobby-status) återanvänder.

### Implementation-status (2026-05-13)

Landat (🟡 partial):
- `src/lib/network/connectionMonitor.ts` — singleton + `useConnectionStatus`-hook, 2s hysteresis, dubbel-signal-OR (media + realtime), reset-API för cleanup.
- `src/lib/realtime/syncChannel.ts` — `network_heartbeat`-event (10s broadcast), 15s watchdog som rapporterar `heartbeat-drop` om inga events alls tagits emot, channel-state-callback som rapporterar `CHANNEL_ERROR`/`TIMED_OUT`/`CLOSED` som error. Watchdog skippar detection tills första event mottagits (undviker false-positive vid solo-channel).
- `src/components/ConnectionUnstableOverlay.tsx` — fullscreen Modal med error-bordered Card, signal-lost-SVG-ikon, error-färgade SequentialDots. Auto-dismiss via `visible`-prop bunden till monitor:s status.
- `app/quiz.tsx` — `useConnectionStatus` + overlay mountad i `question/awaiting/reveal`-render. `TimelineSelector` får `disabled` via OR med `isConnectionUnstable`; `ImageAnswerBlock` wrappad i `pointerEvents='none'`-View (komponenten saknar egen disabled-prop). Confirm + Next-tab disabled vid unstable.
- `src/components/GetReadyIntro.tsx` — overlay mountad oavsett intro-state när `mode='individual-devices'`.

Inte landat (kräver D-ii media-adapters som ej byggda än):
- `reportMediaStatus` är klar i monitor:n men inga consumers wire:ar in — YouTube/Spotify/Image-adapters saknas.
- **Konsekvens**: D-iii MVP fångar nätverks-bortfall (signal 2) men INTE media-buffering utan nätverks-fel (signal 1). När D-ii:s preloadPool/adapters landar wire:as deras buffering-events till `connectionMonitor.reportMediaStatus()` utan ändringar i monitor:ns API.

### Scope-avgränsning mot D-vi och D-vii

| Slice | Scenario | Behavior |
|---|---|---|
| **D-iii** | Transient unstable (≤15s) under quiz-fas | Greyed UI + auto-dismiss popup. Spelaren förblir i nuvarande phase. |
| **D-vi** | Disconnect ≥15s av kontinuerlig unstable | Non-cancelable `"Reconnecting..."`-popup med OK-knapp → routas till GetReady efter recovery. |
| **D-vii** | Status-visualisering i Lobby (pre-game) | 3-nivå 🟢/🟡/🔴-chips per spelare. Återanvänder samma detection-signals. |

D-iii är detection-lagret och den binära overlay-UI:n. D-vi bygger ovanpå med disconnect-eskalering. D-vii bygger ovanpå med latency-buckets.

### Detection signals

Två oberoende signals OR:ed — endera räcker för `unstable`-state:

#### Signal 1: Media-buffering / load-timeout

| Media-typ | Trigger | Threshold |
|---|---|---|
| YouTube | IFrame API `onStateChange` med state `3` (BUFFERING) | Mid-playback: kvar i BUFFERING >2s. Pre-load: ingen `onReady`/`onStateChange=5` (CUED) inom 5s från `cueVideoById`-anrop. |
| Spotify | SDK buffering-event (state `loading`/`buffering`) | Samma trösklar som YouTube. |
| Image | `Image.prefetch(uri)` Promise | Inte resolved inom 5s → unstable. |

**Implementation**: varje media-adapter exponerar en `subscribeStatus(listener)`-metod som emit:ar `'loading' | 'cued' | 'unstable'` (redan delvis specificerad i D-ii:s PreloadPool). D-iii kopplar adapter-status till global `connectionMonitor`.

#### Signal 2: Realtime channel heartbeat

Supabase Realtime SDK exponerar channel-state-events:
- `SUBSCRIBED` — OK
- `CHANNEL_ERROR` / `TIMED_OUT` / `CLOSED` → omedelbart unstable
- **Custom inactivity-timer**: om INGA events (broadcasts, presence) tagits emot på channel:n på >15s → unstable. Supabase Realtime har inbyggd presence-ping ~30s; vi kompletterar med en custom `network_heartbeat`-event som alla klienter broadcastar var 10:e sekund (lågt overhead, små payloads).

```ts
export interface NetworkHeartbeatEvent extends SyncEventBase {
  type: 'network_heartbeat';
  // Ingen extra payload — bara närvaron räcker. sender_player_id + sent_at i envelopen är allt vi behöver.
}
```

**Latency-mätning** (för D-vii) är inte D-iii scope men `NetworkHeartbeatEvent` är designad så `sent_at - receivedAtLocal` kan användas för 3-nivå-buckets i D-vii utan att ändra event-shapen.

### Connection-monitor — central singleton

```ts
// src/lib/network/connectionMonitor.ts
export type ConnectionStatus = 'ok' | 'unstable';

export interface ConnectionMonitorState {
  status: ConnectionStatus;
  /** Vilken signal triggrade unstable-state. För telemetri/debug. */
  reason: 'media-buffering' | 'media-timeout' | 'realtime-error' | 'heartbeat-drop' | null;
  /** Date.now() när unstable först blev satt. Används för D-vi:s 15s-eskalering. */
  unstableSince: number | null;
}

class ConnectionMonitor {
  private state: ConnectionMonitorState;
  private listeners: Set<(s: ConnectionMonitorState) => void>;

  /** Anropas av media-adapter när status ändras. */
  reportMediaStatus(status: 'loading' | 'cued' | 'unstable'): void;

  /** Anropas av syncChannel vid channel state-change eller heartbeat-timeout. */
  reportRealtimeStatus(status: 'ok' | 'error' | 'heartbeat-drop'): void;

  /** Hysteresis: kräv 2s av clean state innan ok-transition. Förhindrar flapping. */
  private clearUnstableTimer: ReturnType<typeof setTimeout> | null = null;

  subscribe(listener: (s: ConnectionMonitorState) => void): () => void;
  getState(): ConnectionMonitorState;
}

export const connectionMonitor = new ConnectionMonitor();
```

**Module-singleton** så samma instans delas över Lobby-, Quiz- och eventuella andra screens. Cleanas inte vid screen-byte — bara vid app-unmount.

```ts
// React hook för komponenter
export function useConnectionStatus(): ConnectionMonitorState {
  const [state, setState] = useState(connectionMonitor.getState());
  useEffect(() => connectionMonitor.subscribe(setState), []);
  return state;
}
```

### State machine

```
ok → unstable
  triggers:
    - reportMediaStatus('unstable')
    - reportRealtimeStatus('error' | 'heartbeat-drop')
  side-effects:
    - state.reason satt enligt trigger
    - state.unstableSince = Date.now()
    - clearUnstableTimer cancelled (om aktiv)
    - listeners notified

unstable → ok
  triggers:
    - reportMediaStatus('cued') AND reportRealtimeStatus('ok')
    - OCH 2000ms hysteresis-fönster passerat utan ny unstable-trigger
  side-effects:
    - state.reason = null
    - state.unstableSince = null
    - listeners notified
```

**Hysteresis-detalj**: när båda signals återgår till OK startar en `setTimeout(2000)`. Om någon signal flippar till unstable igen under fönstret cancellas timer:n och state stannar i unstable. Förhindrar att overlay flackar in/ut vid intermittent buffering.

### UI overlay

Ny komponent `src/components/ConnectionUnstableOverlay.tsx`:

```ts
interface Props {
  visible: boolean;
}
```

- **Fullscreen overlay** med `position: 'absolute'`, `top/left/right/bottom: 0`, `zIndex: 999`.
- **Bg**: `rgba(0, 0, 0, 0.6)` (mörkare än modal-overlays för att signalera "kritiskt").
- **Centrerad Card** (Colors.card, Colors.error border, Radius.lg):
  - 📡-ikon (eller egen SVG) i `Colors.error`, size 40
  - Titel: `"Connection unstable"` (FontSize.xl, bold, textPrimary)
  - Body: `"Please verify your network connection."` (FontSize.md, textSecondary)
  - Animerade våg-prickar (`<WaveDots />` från LobbyScreen) under body:n för att signalera "väntar på recovery"
  - **Ingen action-knapp** — overlay:n auto-dismissar vid recovery via `visible={status === 'unstable'}`-binding.

**Konsumenter**:

| Screen | Phase | Overlay mountas? |
|---|---|---|
| `GetReadyIndividualDevices` | Hela skärmen | Ja, alltid |
| `quiz.tsx` | `'question'` | Ja |
| `quiz.tsx` | `'awaiting'` | Ja (men spelaren har redan confirmat, så input är redan låst — overlay:n är informativ) |
| `quiz.tsx` | `'reveal'` | Ja (Next-tab disabled tills recovery) |
| `quiz.tsx` | `'leaderboard'` | Nej — final-vyn, ingen synk behövs längre |
| `quiz.tsx` | `'intro'` / `'countdown'` | Nej i IndDev — D-ii:s state-machine tar redan hand om dem via play_command-flow:n |
| `LobbyScreen` | — | Nej — Lobby har egen sync via lobby_players/lobby_settings; ingen IndDev-overlay där |

### Phase-specifika beteenden vid unstable

#### `'question'`

- Timer-bar fortsätter ticka (`Animated.timing` i quiz.tsx pausas INTE — fairness: tiden gäller för alla oavsett individuell uppkoppling).
- TimelineSelector / ImageAnswerBlock disabled via `pointerEvents: 'none'` + `opacity: 0.4`.
- Confirm-knappen disabled.
- Overlay täcker hela skärmen — men timer-bar:en lyser igenom (overlay:n har semi-transparent bg så spelaren kan se hur mycket tid som är kvar).
- **Recovery mid-question**: overlay försvinner, input enables omedelbart, spelaren har kvarvarande tid (`responseSeconds - elapsed`).
- **Timeout under unstable**: vid `timeLeft === 0` triggas auto-fel som vanligt (`recordRoundScore(0, false, responseSeconds)`). Phase går till `'reveal'`. Overlay stannar tills recovery.

#### `'awaiting'`

- Spelaren har redan confirmat — score är redan registrerad lokalt.
- Overlay visar bara att kopplingen är dålig, men inget action behövs från spelaren.
- Phase-transition till `'reveal'` sker oberoende av connection-state (drivs av timer).

#### `'reveal'`

- Feedback-kortet renderas som vanligt under overlay:n (overlay:n är semi-transparent).
- Next-tab inom feedback-kortet är disabled.
- **Vid recovery**: Next-tab enables. Spelaren tappar → väntar på host:s `question_advance` (eller är host själv och broadcastar).

#### `'leaderboard'`

- Ingen overlay. Final-vyn antar att spelet är klart — connection spelar ingen roll längre.

### Score-recording under unstable

Score skrivs lokalt via `recordRoundScore` oavsett connection-state. Det är D-vi:s ansvar att sync:a scores cross-device för leaderboard-aggregering (öppen design-fråga — antingen broadcast vid confirm eller batch-sync vid game-end).

**För D-iii räcker det att**:
- Spelarens egen score sparas lokalt även under unstable.
- Om de inte hinner confirma innan timeout: auto-fel (0p) sparas lokalt.
- Cross-device-aggregering är inte D-iii-scope.

### Files att skapa / modifiera

| Fil | Action | Innehåll |
|---|---|---|
| `src/lib/network/connectionMonitor.ts` | NEW | Singleton + `useConnectionStatus()`-hook. State + hysteresis-logic. |
| `src/lib/realtime/syncChannel.ts` | MODIFY (skapad i D-ii) | Lägg till `network_heartbeat`-event-typ. Skicka var 10:e sekund i en `setInterval`. Lyssna på channel state-events och rapportera till `connectionMonitor`. |
| `src/lib/media/youtubeAdapter.ts` | MODIFY (skapad i D-ii) | Buffering-threshold-timer (2s mid-playback, 5s pre-load). Rapportera till `connectionMonitor`. |
| `src/lib/media/spotifyAdapter.ts` | MODIFY (stub i D-ii) | Samma som YouTube när Spotify-impl är klar (D-viii). I D-iii: stub som inte rapporterar något. |
| `src/lib/media/imageAdapter.ts` | MODIFY (skapad i D-ii) | 5s-timeout på `Image.prefetch`-Promise. |
| `src/components/ConnectionUnstableOverlay.tsx` | NEW | Fullscreen overlay-komponent. |
| `app/quiz.tsx` | MODIFY | `useConnectionStatus()`-hook. Mount overlay i question/awaiting/reveal-faser. Disabla TimelineSelector/ImageAnswerBlock/Confirm/Next vid unstable. |
| `src/screens/GetReadyIndividualDevices.tsx` | MODIFY | `useConnectionStatus()`-hook. Mount overlay alltid. Egen ready-pill går till 🔴-state via existing D-ii FSM (samma signal). |

### Failure modes

| Scenario | Beteende |
|---|---|
| Connection bryts precis vid timeout | Phase går till `'reveal'` (auto-fel registreras), overlay stannar tills recovery. Reveal-kortet renderas under overlay:n; Next-tab disabled. |
| Connection bryts precis efter Confirm-tap | Score redan registrerad lokalt. Overlay visas under awaiting/reveal. Inget tappas. |
| Heartbeat-drop men media spelar fortfarande | Unstable settas. Spelaren kan se mediakortet (det är cached/streaming från egen koppling) men input låses. Detta är intended — om Realtime-kanalen är död kan vi inte synka deras svar med övriga spelare. |
| Buffering klar men Realtime fortfarande nere | Stannar unstable. Båda signals måste OK för recovery. |
| Unstable i ≥15s | D-vi:s eskalering tar över: byt overlay till `"Reconnecting..."` non-cancelable popup med OK-knapp → GetReady. Implementation i D-vi. |
| Host:s egen connection unstable | Samma flow som non-host. Host:s UI greyas ut för host själv. `question_advance`-broadcasts kommer inte gå ut förrän host recoverar. Non-hosts ser sin reveal som vanligt + "Waiting for host to advance..."-pill (D-ii:s asymmetri-design). |
| App backgroundas mid-question på iOS | JS-timers pausas av OS efter ~30s. Vid foreground-return: `connectionMonitor` re-evaluerar. Om phase fortfarande är `'question'` och timer:n borde ha tickat ut → automatisk auto-fel. (Edge case; D-v hanterar host-backgrounded scenariot uttömmande.) |

### Resolved questions (2026-05-12)

1. **`NetworkHeartbeatEvent` cadence**: ✅ **10s.** ~1000 events per 30-min-spel × 6 spelare = försumbart Realtime-cost.

2. **Hysteresis-fönster**: ✅ **2s.** Justeras om field-test visar flapping eller stale overlays.

3. **Image-load-timeout**: ✅ **5s.** Pre-launch-checklist får FAQ-item: `"Bästa möjliga upplevelse fås vid stabil uppkoppling via WiFi"` så användare på svag 3G förstår att false-positives kan ske. (Tillagt i [project_pre_launch_checklist.md](../../.claude/projects/C--Users-46725-quizvibe-app/memory/project_pre_launch_checklist.md).)

4. **`'awaiting'`-overlay**: ✅ **Behåll fullscreen.** Konsistent visuell signal viktigare än redundansrisk; mini-pill kan missas.

### Tests / verification

1. **Toggla flygplansläge** mid-question på en spelare → verifiera overlay + greyed UI + auto-recovery vid återanslutning.
2. **Throttle till offline** via Charles Proxy under 10s, sedan back-on → verifiera hysteresis (2s delay innan overlay försvinner).
3. **Network Link Conditioner: 100% loss** under 20s → verifiera D-vi-eskalering kickar in vid 15s.
4. **Disable wifi** (router off) på host:s device under awaiting-fas → verifiera att non-hosts ser reveal som vanligt men "Waiting for host to advance"-pill efter att de tappat Next.
5. **Snabb-toggle** flygplansläge på/av (5x på 5s) → verifiera att overlay inte flackar och hysteresis fungerar.

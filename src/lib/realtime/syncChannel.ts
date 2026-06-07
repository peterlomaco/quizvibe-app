// Supabase Realtime broadcast-channel för per-room sync-events i Individual
// Devices-läget. Transient events (lever bara så länge channel:n är öppen) —
// inga DB-tabeller eller migrations behövs.
//
// MVP-omfattning: play_command, question_advance, player_left,
// player_answer_confirmed, response_seconds_changed (D-ii) + network_heartbeat
// (D-iii). Full D-ii-spec (player_media_ready, start_at-timestamp,
// readiness-handshake) layer:as in senare; denna fil utökas då med fler
// event-typer.
//
// Skiljs medvetet från postgres_changes-baserade Realtime-subscriptions
// (rooms/lobby_players/lobby_settings) som driver persistent state. Broadcast
// är for event-bus mellan klienter där state inte ska skrivas till DB.

import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/src/utils/supabase';
import { connectionMonitor } from '@/src/lib/network/connectionMonitor';

export interface PlayCommandPayload {
  /** 0-baserat. Klienten validerar att den match:ar lokal current question. */
  question_index: number;
  /** Exakt question ID som host visar — non-host söker upp denna fråga i sin
   *  lokala pool för att garantera att alla enheter visar samma fråga oavsett
   *  lokal shuffle-ordning (IndDev question-sync). */
  question_id: string;
}

export interface QuestionAdvancePayload {
  /** null = sista frågan, gå till leaderboard. Annars next question index (0-baserat). */
  next_question_index: number | null;
}

export interface PlayerLeftPayload {
  /** Lobby_players.player_id för den som lämnar. Mottagare markerar
   *  spelaren som `hasLeft` i lokal state. */
  player_id: string;
  /** Visningsnamn för host:s popup. */
  player_name: string;
}

export interface PlayerAnswerConfirmedPayload {
  /** Lobby_players.player_id för den som confirmade. */
  player_id: string;
  /** Sekunder från fråge-start till confirm (0..responseSeconds, 2-decimaler). */
  time_used: number;
}

export interface ResponseSecondsChangedPayload {
  /** Host:s nya val. Speglar Lobby:s val-set (15/30/45/60). */
  seconds: 15 | 30 | 45 | 60;
}

/**
 * Host signalerar att de tappat Play Again på Final Leaderboard. Non-host:s
 * "Approve Play Again"-knapp aktiveras (= flippar från muted till primary
 * styling). Sker INNAN host visar re-use-players Alert:en så non-host:s
 * knapp lyser så snart host:s intent registrerats — long-tail-händelser i
 * Alert-flödet (host pausar/avbryter) håller knappen aktiv tills antingen
 * host-completion (lobby_ready) eller spelaren själv lämnar.
 */
export interface PlayAgainInitiatedPayload {
  /** Tom payload-stub. Hålls med fält för framtida utökning utan att
   *  ändra broadcast-formen. */
  sender_id: string;
}

/**
 * Host har skapat nytt rum och är på väg att navigera till /lobby. Skickas
 * direkt efter `registerActiveRoom` och INNAN `router.replace` så
 * non-host:s syncChannel hinner ta emot innan host:s channel rivs.
 */
export interface PlayAgainLobbyReadyPayload {
  /** Den nya rumkoden non-host ska navigera till. */
  room_code: string;
}

/**
 * Non-host signalerar att de tappat "Approve Play again" på sin enhet.
 * Host använder detta för att räkna approvals och låsa upp "Yes, keep
 * them"-knappen när alla non-hosts har godkänt.
 */
export interface PlayerApprovedPlayAgainPayload {
  /** Non-host:s lobby_players.player_id som tappat Approve. */
  player_id: string;
}

/**
 * Host har lämnat post-game-flödet via "Home"-knappen på Final Leaderboard.
 * Lobby:n är permanent stängd (deactivateRoom + cleanup-stores). Non-hosts
 * som fortfarande sitter på Final Leaderboard (inklusive de som tryckt
 * Approve Play Again och väntar på "Please Wait..."-overlay) ska få en
 * informativ popup + auto-navigera till Home.
 *
 * Skickas direkt efter `deactivateRoom`/cleanup men INNAN host:s
 * `router.replace('/')` så non-host:s syncChannel hinner ta emot innan
 * host:s channel rivs vid component-unmount.
 */
export interface LobbyDeletedPayload {
  /** Rumkoden som just stängts. Bara informativt — non-host vet redan
   *  vilken kod de är i; vi skickar koden för parity med övriga
   *  lobby-events och möjlig framtida debugging. */
  room_code: string;
}

/**
 * Host signalerar att en Spotify-fråga börjar. Broadcastas precis innan
 * fråge-fasen startar. Gissarna visar albumomslag + timer; DJ:n visar
 * "Starta låten i Spotify"-knapp.
 *
 * Host beräknar DJ-tilldelningen via computeDJRotationPlan i spotifyDJ.ts
 * och inkluderar dj_player_id i payloaden så varje klient vet om de är DJ.
 */
export interface SpotifyQuestionReadyPayload {
  /** 0-baserat absolut frågeindex — klienten validerar mot lokal state. */
  question_index: number;
  /** Spotify track ID (ex. "4iV5W9uYEdYUVa79Axb7Rh"). */
  spotify_track_id: string;
  /** Visningsnamn (ex. "Dancing Queen — ABBA") för gissarnas screen. */
  display_name: string;
  /** Releaseåret som gissarna ska gissa. */
  correct_year: number;
  /** lobby_players.player_id för den utsedde DJ:n. */
  dj_player_id: string;
}

/**
 * DJ:n har tryckt "Starta låten i Spotify" och Spotify-appen har öppnats.
 * Gissarnas timer och svarsblock aktiveras (de kan börja gissa nu).
 * Broadcastas av DJ:ns klient direkt efter att openSpotifyTrack() returnerat.
 */
export interface SpotifyDJTrackStartedPayload {
  /** DJ:ns lobby_players.player_id — bekräftar vem som startade. */
  dj_player_id: string;
  /** Spotify track ID, för att mottagare ska kunna verifiera att det stämmer
   *  med deras lokala fråge-state. */
  spotify_track_id: string;
}

/**
 * D-iv: host justerade audio för en specifik spelare i GetReady-vyn.
 * Incremental update — bara den ändrade spelaren broadcastas, inte hela
 * map:en. Mottagare uppdaterar sin lokala `playerAudioOverrides[player_id]`
 * och flippar MediaPlayer:s mute-state om det är dem själva.
 *
 * Source of truth är lobby_settings.player_audio_overrides; broadcasten
 * är fast-path. Initial state läses från getLobbySettings vid game-mount.
 */
export interface PlayerAudioStateChangedPayload {
  /** Spelaren vars audio host justerat. */
  player_id: string;
  /** Nytt värde: true = audio på på den enheten, false = mute. */
  audio_on: boolean;
}

/**
 * D-v: host signalerar att de fortfarande är aktiva (= app i foreground,
 * tar emot user-interactions). Throttlat till max 1 broadcast per 5s
 * på sender-sidan. Mottagare uppdaterar sin lokala `lastHostActivityAt`-
 * ref. Om gapet växer > 9 min utan ny ping → 60-sek-countdown startar
 * på alla devices. 10 min total utan ping → game ends via Alert + nav
 * till Home. Force-quit och iOS-30s-background-suspend ser identiska
 * ut från mottagar-sidan (inga pings = inactivity).
 *
 * D-vi-utökning: payloaden bär även host:s aktuella `question_index` så
 * non-host som missat broadcasts under offline-fönster (Realtime replay:ar
 * inte missade events) kan sync:a sin lokala questionIndex vid nästa
 * mottagna ping. Utan denna fix kvarstår non-host med stale questionIndex
 * tills nästa play_command — vilket gör GetReady-dot-bar:en felräknad
 * direkt efter reconnect.
 *
 * Non-host får ALDRIG broadcasta detta event — bara host-sidans signal.
 */
export interface HostActivePingPayload {
  /** Host:s lobby_players.player_id. För log/debug; mottagar-flödet
   *  bryr sig bara om event-mottagning, inte sender-identitet. */
  sender_id: string;
  /** Host:s aktuella questionIndex (0-baserat). Mottagare alignar lokal
   *  state mot detta värde — idempotent när redan synkad. */
  question_index: number;
}

/**
 * Lättviktigt heartbeat-event som varje klient broadcastar var 10:e sekund.
 * Driver per-sender disconnect-detection: om vi inte hör från en specifik
 * sender på >15s markeras DEN spelaren som disconnected (NOT vi själva).
 *
 * `sender_id` är REQUIRED — det är det enda fältet konsumenten behöver för
 * att veta vem som broadcastade.
 */
export interface NetworkHeartbeatPayload {
  /** Avsändarens lobby_players.player_id. Krävs för per-sender-tracking. */
  sender_id: string;
}

/**
 * Explicit "jag är tillbaka i spelet"-signal. Broadcastas av non-host:s
 * Retry-tap i ConnectionUnstableOverlay. Mottagare flippar sender:n från
 * 'disconnected' till 'connected' i sin lokala playerConnectionStatus-map.
 * Heartbeat-receivers gör INTE detta automatiskt (D-iii-design) — bara
 * detta event räknas som canonical rejoin-signal.
 */
export interface PlayerRejoinedPayload {
  /** Avsändarens lobby_players.player_id. */
  sender_id: string;
}

export type PlayerConnectionStatus = 'connected' | 'disconnected';

export interface SyncChannelHandlers {
  onPlayCommand?: (payload: PlayCommandPayload) => void;
  onQuestionAdvance?: (payload: QuestionAdvancePayload) => void;
  onPlayerLeft?: (payload: PlayerLeftPayload) => void;
  onPlayerAnswerConfirmed?: (payload: PlayerAnswerConfirmedPayload) => void;
  onResponseSecondsChanged?: (payload: ResponseSecondsChangedPayload) => void;
  /** Host tappade Play Again — non-host:s knapp ska aktiveras. */
  onPlayAgainInitiated?: (payload: PlayAgainInitiatedPayload) => void;
  /** Host har skapat nya lobby:n — non-host som tappat Approve ska
   *  navigera dit. */
  onPlayAgainLobbyReady?: (payload: PlayAgainLobbyReadyPayload) => void;
  /** En non-host har tappat "Approve Play again" — host använder för att
   *  räkna approvals och låsa upp "Yes, keep them"-knappen. */
  onPlayerApprovedPlayAgain?: (payload: PlayerApprovedPlayAgainPayload) => void;
  /** Host har lämnat Final Leaderboard via Home → lobby permanent stängd.
   *  Non-host visar "Host has deleted this lobby"-popup + auto-nav Home. */
  onLobbyDeleted?: (payload: LobbyDeletedPayload) => void;
  /** Spotify-fråga börjar. DJ:n visar "Starta i Spotify"-knapp;
   *  gissarna förbereder albumomslags-fetch. */
  onSpotifyQuestionReady?: (payload: SpotifyQuestionReadyPayload) => void;
  /** DJ:n har öppnat Spotify — gissarnas timer + svar-block aktiveras. */
  onSpotifyDJTrackStarted?: (payload: SpotifyDJTrackStartedPayload) => void;
  /** D-iv: host justerade audio för en spelare. Alla mottagare uppdaterar
   *  sin playerAudioOverrides-map; den drabbade spelarens device mute:as/
   *  unmute:as i MediaPlayer. */
  onPlayerAudioStateChanged?: (payload: PlayerAudioStateChangedPayload) => void;
  /** D-v: host:s aktivitets-heartbeat (throttlad till 1/5s på sender-
   *  sidan). Mottagar-callback fyrar för varje mottaget event;
   *  klienten resetar sin lastHostActivityAt-ref och eventuell pågående
   *  inactivity-countdown avbryts. */
  onHostActivePing?: (payload: HostActivePingPayload) => void;
  /**
   * Fyrar när en remote spelares heartbeat-state övergår till
   * 'disconnected' (= vi har inte hört från sender:n på >15s, efter att
   * vi tidigare tagit emot minst en heartbeat från dem). Driver host:s
   * disconnect-flag i live-leaderboard. 'connected'-transitionen fyrar
   * INTE härifrån — den hanteras separat av `onPlayerRejoined`.
   */
  onPlayerConnectionChange?: (
    playerId: string,
    status: PlayerConnectionStatus,
  ) => void;
  /**
   * Fyrar när en remote spelare broadcastat `player_rejoined` — explicit
   * "jag är tillbaka"-signal från deras Retry-tap. Använd för att flippa
   * spelaren tillbaka från 'disconnected' till 'connected' i UI:n.
   */
  onPlayerRejoined?: (playerId: string) => void;
}

export interface SyncChannel {
  channel: RealtimeChannel;
  broadcastPlayCommand: (payload: PlayCommandPayload) => Promise<void>;
  broadcastQuestionAdvance: (payload: QuestionAdvancePayload) => Promise<void>;
  broadcastPlayerLeft: (payload: PlayerLeftPayload) => Promise<void>;
  broadcastPlayerAnswerConfirmed: (
    payload: PlayerAnswerConfirmedPayload,
  ) => Promise<void>;
  broadcastResponseSecondsChanged: (
    payload: ResponseSecondsChangedPayload,
  ) => Promise<void>;
  broadcastPlayAgainInitiated: (
    payload: PlayAgainInitiatedPayload,
  ) => Promise<void>;
  broadcastPlayAgainLobbyReady: (
    payload: PlayAgainLobbyReadyPayload,
  ) => Promise<void>;
  broadcastPlayerApprovedPlayAgain: (
    payload: PlayerApprovedPlayAgainPayload,
  ) => Promise<void>;
  broadcastLobbyDeleted: (payload: LobbyDeletedPayload) => Promise<void>;
  /** Host broadcastar start av Spotify-fråga med DJ-tilldelning. */
  broadcastSpotifyQuestionReady: (payload: SpotifyQuestionReadyPayload) => Promise<void>;
  /** DJ:ns klient broadcastar att Spotify-appen öppnats. */
  broadcastSpotifyDJTrackStarted: (payload: SpotifyDJTrackStartedPayload) => Promise<void>;
  /** D-iv: host broadcastar ny audio-state för en specifik spelare. */
  broadcastPlayerAudioStateChanged: (
    payload: PlayerAudioStateChangedPayload,
  ) => Promise<void>;
  /** D-v: host broadcastar "jag är aktiv". Bara host-sidan kallar
   *  denna; call-site i quiz.tsx throttlar till max 1/5s. */
  broadcastHostActivePing: (payload: HostActivePingPayload) => Promise<void>;
  /**
   * Broadcasta "jag är tillbaka"-signal när Retry trycks i
   * ConnectionUnstableOverlay. Andra klienter flippar oss från
   * 'disconnected' till 'connected' i sin playerConnectionStatus-map.
   */
  broadcastPlayerRejoined: (payload: PlayerRejoinedPayload) => Promise<void>;
  /**
   * Rensar per-sender lastSeen + lastReported så watchdog:n börjar om från
   * scratch. Anropas av quiz.tsx när lokal monitor återgår från unstable
   * till ok — då är all peer-data potentiellt stale (vi tappade ALLAS
   * heartbeats medan VI var offline). Nästa heartbeat från varje peer
   * etablerar fresh status; ingen peer rapporteras som disconnected
   * förrän först en heartbeat tagits emot OCH sedan saknats >15s.
   */
  resetPeerTracking: () => void;
  unsubscribe: () => void;
}

/** Heartbeat-broadcast var 10:e sekund. */
const HEARTBEAT_BROADCAST_MS = 10_000;
/** Per-sender silence-threshold innan vi markerar dem som disconnected. */
const PEER_TIMEOUT_MS = 15_000;
/** Watchdog-tick — kollar per-sender lastSeen. 5s ger worst-case 5s extra
 *  latens innan disconnect detektion; acceptabelt vs overhead av tätare ticks. */
const PEER_WATCHDOG_MS = 5_000;

/**
 * Subscribe till `quiz_sync:<roomCode>`-channel. Bägge host och non-host
 * kan subscribe:a — `broadcast.self: false` är default i Supabase Realtime
 * så sender:n inte ekoar tillbaka egna events.
 *
 * Defensive cleanup av stale channels med samma topic körs INNAN subscribe
 * så React-remount inte lämnar duplicate listeners.
 *
 * Två oberoende health-signal:
 *
 *   1. **Egen connection** (connectionMonitor) — drivs ENBART av Supabase
 *      channel-state-events. När vår WebSocket dör (t.ex. flygplansläge på)
 *      fyrar Supabase CHANNEL_ERROR/TIMED_OUT/CLOSED → vi går till `error`.
 *      Vid återkoppling fyrar SUBSCRIBED → `ok`. Detta signal är
 *      DEVICE-LOKAL — om OTHER players försvinner påverkar det INTE vår
 *      egna monitor.
 *
 *   2. **Per-peer connection** (onPlayerConnectionChange-callback) — drivs
 *      av per-sender heartbeat-watchdog. Om vi inte hör från en specifik
 *      sender på >15s markeras DEN spelaren som disconnected hos OSS.
 *      Används för host:s live-leaderboard-disconnect-ikoner.
 *
 * Skillnaden är kritisk: i en 2-device-setup där Device B går offline
 * tappar Device A bort B:s heartbeats — A:s `lastSeenBySender[B]` växer
 * förbi 15s → A fyrar `onPlayerConnectionChange(B, 'disconnected')`.
 * A:s egna monitor förblir `ok` eftersom A:s WebSocket är vid liv.
 *
 * @param roomCode - Rummets unika kod (driver channel topic)
 * @param selfPlayerId - Egen lobby_players.player_id. Används i heartbeat-
 *   broadcast så peers kan tracka oss. Får inte vara tom sträng — då
 *   skippas heartbeat-broadcast (men receivers fungerar fortfarande).
 * @param handlers - Event-handlers. Alla är optional.
 */
export function subscribeSyncChannel(
  roomCode: string,
  selfPlayerId: string,
  handlers: SyncChannelHandlers = {},
): SyncChannel {
  const topic = `quiz_sync:${roomCode}`;
  supabase
    .getChannels()
    .filter((c) => c.topic === `realtime:${topic}`)
    .forEach((c) => supabase.removeChannel(c));

  const channel = supabase.channel(topic);

  // Per-sender lastSeen — uppdateras ENBART av heartbeat-events. Andra
  // event-typer ignoreras här eftersom de fyrar oregelbundet och inte ger
  // tillförlitlig "alive"-signal. Heartbeat är canonical-spåret.
  const lastSeenBySender: Map<string, number> = new Map();
  // Senast rapporterad status per sender, så vi bara fyrar callback vid
  // ÄNDRING. Annars skulle watchdog:n spamma 'disconnected' var 5:e sek.
  const lastReportedStatus: Map<string, PlayerConnectionStatus> = new Map();

  if (handlers.onPlayCommand) {
    channel.on('broadcast', { event: 'play_command' }, ({ payload }) => {
      handlers.onPlayCommand!(payload as PlayCommandPayload);
    });
  }
  if (handlers.onQuestionAdvance) {
    channel.on('broadcast', { event: 'question_advance' }, ({ payload }) => {
      handlers.onQuestionAdvance!(payload as QuestionAdvancePayload);
    });
  }
  if (handlers.onPlayerLeft) {
    channel.on('broadcast', { event: 'player_left' }, ({ payload }) => {
      handlers.onPlayerLeft!(payload as PlayerLeftPayload);
    });
  }
  if (handlers.onPlayerAnswerConfirmed) {
    channel.on('broadcast', { event: 'player_answer_confirmed' }, ({ payload }) => {
      handlers.onPlayerAnswerConfirmed!(payload as PlayerAnswerConfirmedPayload);
    });
  }
  if (handlers.onResponseSecondsChanged) {
    channel.on('broadcast', { event: 'response_seconds_changed' }, ({ payload }) => {
      handlers.onResponseSecondsChanged!(payload as ResponseSecondsChangedPayload);
    });
  }
  if (handlers.onPlayAgainInitiated) {
    channel.on('broadcast', { event: 'play_again_initiated' }, ({ payload }) => {
      handlers.onPlayAgainInitiated!(payload as PlayAgainInitiatedPayload);
    });
  }
  if (handlers.onPlayAgainLobbyReady) {
    channel.on('broadcast', { event: 'play_again_lobby_ready' }, ({ payload }) => {
      handlers.onPlayAgainLobbyReady!(payload as PlayAgainLobbyReadyPayload);
    });
  }
  if (handlers.onPlayerApprovedPlayAgain) {
    channel.on('broadcast', { event: 'player_approved_play_again' }, ({ payload }) => {
      handlers.onPlayerApprovedPlayAgain!(payload as PlayerApprovedPlayAgainPayload);
    });
  }
  if (handlers.onLobbyDeleted) {
    channel.on('broadcast', { event: 'lobby_deleted' }, ({ payload }) => {
      handlers.onLobbyDeleted!(payload as LobbyDeletedPayload);
    });
  }
  if (handlers.onSpotifyQuestionReady) {
    channel.on('broadcast', { event: 'spotify_question_ready' }, ({ payload }) => {
      handlers.onSpotifyQuestionReady!(payload as SpotifyQuestionReadyPayload);
    });
  }
  if (handlers.onSpotifyDJTrackStarted) {
    channel.on('broadcast', { event: 'spotify_dj_track_started' }, ({ payload }) => {
      handlers.onSpotifyDJTrackStarted!(payload as SpotifyDJTrackStartedPayload);
    });
  }
  if (handlers.onPlayerAudioStateChanged) {
    channel.on('broadcast', { event: 'player_audio_state_changed' }, ({ payload }) => {
      handlers.onPlayerAudioStateChanged!(payload as PlayerAudioStateChangedPayload);
    });
  }
  if (handlers.onHostActivePing) {
    channel.on('broadcast', { event: 'host_active_ping' }, ({ payload }) => {
      handlers.onHostActivePing!(payload as HostActivePingPayload);
    });
  }
  // Heartbeat-receiver: per-sender-tracking. Markera bara lastSeen —
  // INGEN auto-'connected'-callback ens om sender:n tidigare var
  // disconnected. Per design (D-iii): återanslutning kräver explicit
  // player_rejoined-broadcast från spelaren (= deras Retry-tap). Heartbeat
  // ensam räcker inte — sender:n kan vara online utan att ha tappat på
  // Retry-knappen, och då ska A:s leaderboard fortsatt visa dem som
  // 'disconnected'.
  channel.on('broadcast', { event: 'network_heartbeat' }, ({ payload }) => {
    const p = payload as NetworkHeartbeatPayload;
    if (!p.sender_id || p.sender_id === selfPlayerId) return;
    lastSeenBySender.set(p.sender_id, Date.now());
  });
  // player_rejoined-receiver: explicit "jag är tillbaka"-signal som B
  // broadcastar när Retry trycks i ConnectionUnstableOverlay. Detta är
  // det ENDA spåret som flippar en disconnect:ad spelare tillbaka till
  // 'connected' i A:s vy. Synkar även lastReportedStatus så watchdog:n
  // inte fyrar gammal disconnect-callback igen.
  if (handlers.onPlayerRejoined) {
    channel.on('broadcast', { event: 'player_rejoined' }, ({ payload }) => {
      const p = payload as PlayerRejoinedPayload;
      if (!p.sender_id || p.sender_id === selfPlayerId) return;
      lastSeenBySender.set(p.sender_id, Date.now());
      lastReportedStatus.set(p.sender_id, 'connected');
      handlers.onPlayerRejoined!(p.sender_id);
    });
  }

  // Subscribe-callback rapporterar channel-state till connectionMonitor.
  // SUBSCRIBED → ok. CHANNEL_ERROR/TIMED_OUT/CLOSED → error. DETTA är
  // det enda som driver lokal monitor — heartbeat-drop går INTE hit
  // (det är peer-status, inte vår status).
  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      connectionMonitor.reportRealtimeStatus('ok');
    } else if (
      status === 'CHANNEL_ERROR' ||
      status === 'TIMED_OUT' ||
      status === 'CLOSED'
    ) {
      connectionMonitor.reportRealtimeStatus('error');
    }
  });

  // Heartbeat-broadcast var 10:e sekund. Fire-and-forget; om send fail:ar
  // (t.ex. channel ej subscribed än, eller offline) ignoreras felet —
  // channel-state-callbacken fångar det istället. Skippas helt om vi
  // saknar selfPlayerId (defensiv mot direct-nav utan Lobby).
  const heartbeatInterval = selfPlayerId
    ? setInterval(() => {
        channel
          .send({
            type: 'broadcast',
            event: 'network_heartbeat',
            payload: { sender_id: selfPlayerId } satisfies NetworkHeartbeatPayload,
          })
          .catch(() => {});
      }, HEARTBEAT_BROADCAST_MS)
    : null;

  // Per-sender watchdog: var 5:e sek kolla varje känd sender:s lastSeen.
  // Om gap > 15s OCH vi tidigare rapporterat dem som connected (= vi har
  // hört från dem minst en gång) → markera disconnected och fyra callback.
  // Vid recovery (nästa heartbeat in) flyttas de tillbaka till connected
  // av heartbeat-handlern ovan.
  const watchdogInterval = setInterval(() => {
    const now = Date.now();
    lastSeenBySender.forEach((seenAt, senderId) => {
      const gap = now - seenAt;
      const currentStatus = lastReportedStatus.get(senderId);
      if (gap > PEER_TIMEOUT_MS && currentStatus !== 'disconnected') {
        // Första gången vi ser en disconnect: rapportera och latcha.
        // Om vi aldrig rapporterat status för denna sender är det första
        // event:et — då rapporterar vi 'disconnected' direkt utan
        // implicit 'connected' först. Det är OK; den första-mottagna-
        // heartbeat:en har redan satt lastSeen → om vi nu har gap > 15s
        // betyder det att vi tappat dem direkt efter första kontakt.
        lastReportedStatus.set(senderId, 'disconnected');
        handlers.onPlayerConnectionChange?.(senderId, 'disconnected');
      }
    });
  }, PEER_WATCHDOG_MS);

  return {
    channel,
    broadcastPlayCommand: async (payload) => {
      await channel.send({ type: 'broadcast', event: 'play_command', payload });
    },
    broadcastQuestionAdvance: async (payload) => {
      await channel.send({ type: 'broadcast', event: 'question_advance', payload });
    },
    broadcastPlayerLeft: async (payload) => {
      await channel.send({ type: 'broadcast', event: 'player_left', payload });
    },
    broadcastPlayerAnswerConfirmed: async (payload) => {
      await channel.send({
        type: 'broadcast',
        event: 'player_answer_confirmed',
        payload,
      });
    },
    broadcastResponseSecondsChanged: async (payload) => {
      await channel.send({
        type: 'broadcast',
        event: 'response_seconds_changed',
        payload,
      });
    },
    broadcastPlayAgainInitiated: async (payload) => {
      await channel.send({
        type: 'broadcast',
        event: 'play_again_initiated',
        payload,
      });
    },
    broadcastPlayAgainLobbyReady: async (payload) => {
      await channel.send({
        type: 'broadcast',
        event: 'play_again_lobby_ready',
        payload,
      });
    },
    broadcastPlayerApprovedPlayAgain: async (payload) => {
      await channel.send({
        type: 'broadcast',
        event: 'player_approved_play_again',
        payload,
      });
    },
    broadcastLobbyDeleted: async (payload) => {
      await channel.send({
        type: 'broadcast',
        event: 'lobby_deleted',
        payload,
      });
    },
    broadcastSpotifyQuestionReady: async (payload) => {
      await channel.send({ type: 'broadcast', event: 'spotify_question_ready', payload });
    },
    broadcastSpotifyDJTrackStarted: async (payload) => {
      await channel.send({ type: 'broadcast', event: 'spotify_dj_track_started', payload });
    },
    broadcastPlayerAudioStateChanged: async (payload) => {
      await channel.send({
        type: 'broadcast',
        event: 'player_audio_state_changed',
        payload,
      });
    },
    broadcastHostActivePing: async (payload) => {
      await channel.send({
        type: 'broadcast',
        event: 'host_active_ping',
        payload,
      });
    },
    broadcastPlayerRejoined: async (payload) => {
      await channel.send({
        type: 'broadcast',
        event: 'player_rejoined',
        payload,
      });
    },
    resetPeerTracking: () => {
      lastSeenBySender.clear();
      lastReportedStatus.clear();
    },
    unsubscribe: () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      clearInterval(watchdogInterval);
      supabase.removeChannel(channel);
      // Reset monitor så nästa subscribe (t.ex. Play Again) börjar fresh.
      // Annars ärver vi unstable-state från förra session:s teardown.
      connectionMonitor.reset();
    },
  };
}

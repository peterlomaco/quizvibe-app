// Supabase Realtime broadcast-channel för per-room sync-events i Individual
// Devices-läget. Transient events (lever bara så länge channel:n är öppen) —
// inga DB-tabeller eller migrations behövs.
//
// MVP-omfattning: play_command, question_advance, player_left,
// player_answer_confirmed, response_seconds_changed (D-ii) + network_heartbeat
// (D-iii). Av D-ii:s readiness-spec finns nu `start_at`-stämpeln
// (play_command.timer_start_at) och readiness-handskakningen
// (player_rejoined-hälsning + `player_ready`) på plats.
//
// ⚠ `player_media_ready` finns fortfarande INTE, och kan inte byggas som den
// skisserades: YouTube-WebView:n skapas först när phase blir 'question', dvs
// EFTER att host tryckt Play — ett media-ready-event kan därför aldrig hinna
// grinda själva Play-tappet. En äkta media-gate kräver att spelaren
// för-mountas dold under intro/countdown (finns inte i dag, och har en
// YouTube-ToS-dimension eftersom vi då renderar en dold spelare). `player_ready`
// är det pragmatiska substitutet: enheten är settled, inte spelaren laddad.
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
  /** Alla fråge-IDs i host:s spel-ordning (index = questionIndex 0..N-1).
   *  Används av non-host för att visa korrekta media-source-ikoner i GetReady-kön
   *  oavsett lokal shuffle-ordning. Inkluderas i varje play_command så
   *  reconnecting players alltid har aktuell sekvens. */
  all_question_ids?: string[];
  /** Host:s Spotify-svarstyps-inställningar — synkas med varje play_command för reconnect-fall. */
  spotify_answer_year?: boolean;
  spotify_answer_name?: boolean;
  /** Wall-clock ms (Date.now()) för när host:s timer kommer att starta —
   *  700ms initial paus + 5×1300ms tick + 1000ms ?-display + 2000ms timerActive-delay
   *  = ~10200ms + 300ms marginal = ~10500ms efter broadcasten.
   *  Non-host använder detta för att återsynka sin timer korrekt om de vaknar
   *  upp från iOS-bakgrund under nedräknings- eller fråge-fasen. */
  timer_start_at?: number;
  /** DJ-spelarens player_id för denna Spotify-fråga. Skickas med play_command
   *  (som ankommer vid countdown-start, ~10 s INNAN spelaren behöver trycka
   *  "Start track in Spotify") så non-host inte behöver vänta på det separata
   *  spotify_question_ready-broadcastet som ankommer senare. */
  dj_player_id?: string;
}

export interface QuestionAdvancePayload {
  /** null = sista frågan, gå till leaderboard. Annars next question index (0-baserat). */
  next_question_index: number | null;
  /** Host:s auktoritativa frågesekvens — skickas med varje advance så non-host håller sig synkad vid reconnect. */
  all_question_ids?: string[];
  /** Host:s Spotify-svarstyps-inställningar — synkas vid varje advance för reconnect-fall. */
  spotify_answer_year?: boolean;
  spotify_answer_name?: boolean;
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
  /** Host:s nya val. Speglar Lobby:s val-set (30/45/60). */
  seconds: 30 | 45 | 60;
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
  /** true när spelarna carry:as över till nya lobbyn OCH host bypassade
   *  approval-gaten (t.ex. credit-gate:ns "Restart as Guest"). Non-hosts
   *  ska då följa med direkt även utan Approve-tap — deras pre-seedade
   *  rad finns redan i nya lobbyn. Utan flaggan (Start fresh) visas
   *  "Host has already started a new Game"-popupen → Home som tidigare. */
  auto_join?: boolean;
  /** Id på den SERVER-sparade Aggregate Leaderboard/Score (migration 0037)
   *  som serien är kopplad till. Non-host stämplar det på sin LOKALA serie
   *  tillsammans med rumkoden och seedar sedan sin aggregat-vy från servern
   *  — de är deltagare, så RLS tillåter läsningen. Utelämnas när spelet inte
   *  sparas (gäst i uppsättningen) eller vid äldre klienter. */
  aggregate_leaderboard_id?: string;
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
  /** Svarstyp för denna fråga: 'year' = TimelineSelector, 'name' = Letter Grid. */
  answer_type: 'year' | 'name';
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
  /** Wall-clock ms när timern faktiskt kommer starta (Date.now() + 2000ms delay).
   *  Mottagare uppdaterar hostTimerStartAtRef med detta värde så startTimer()
   *  inte kompenserar för stale tid från play_command (som skickades 20-60 s
   *  innan DJ tryckte "Activate Timer"). */
  timer_start_at?: number;
}

/**
 * DJ:n har tryckt "Start track in Spotify" och Spotify-appen öppnats.
 * Broadcastas INNAN DJ trycker "Activate timer" så gissarnas step-guide
 * kan hoppa från steg 1 → steg 2.
 */
export interface SpotifyDJOpenedAppPayload {
  /** DJ:ns lobby_players.player_id. */
  dj_player_id: string;
}

/**
 * DJ:n har tryckt "End DJ – handover to Host" i reveal-fasen.
 * Broadcastas till alla enheter så host:s Next-knapp låses upp och
 * non-hosts byter från "Waiting for DJ…" till "Waiting for host…".
 */
export interface SpotifyDJHandoverPayload {
  /** DJ:ns lobby_players.player_id. */
  dj_player_id: string;
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
  /** Host:s kompletta frågesekvens. Non-host sätter broadcastAllQuestionIds
   *  om den fortfarande är null — täcker mid-game reload-scenariot. */
  all_question_ids?: string[];
  /** Host:s aktuella fas ('intro'/'countdown'/'question' etc.). Non-host som
   *  kommit ur sticky-unstable-låst läge kan catch-upa via detta fält. */
  phase?: string;
}

/**
 * Host broadcastar hela fråge-sekvensen en gång vid quiz-mount, 800ms
 * efter subscribe:n (för att non-host hunnit subscriba). Används av
 * non-host för att beräkna korrekta media-source-ikoner i GetReady-kön
 * från och med FÖRSTA GetReady-skärmen (innan första play_command).
 *
 * play_command bär samma data i all_question_ids för reconnect-fall.
 */
export interface GameSequenceInitPayload {
  /** Alla fråge-IDs i host:s spel-ordning (index = questionIndex 0..N-1). */
  all_question_ids: string[];
  /** Host:s Spotify-svarstyps-inställningar — krävs av non-host för att beräkna
   *  rätt Year/Name-badge för kommande Spotify-frågor i GetReady-kön. */
  spotify_answer_year?: boolean;
  spotify_answer_name?: boolean;
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

/**
 * Host signalerar att DERAS uppkoppling just återupprättats (connection.status
 * gick från 'unstable' → 'ok'). Non-host:ar som tagit emot detta event vet
 * att host kan ha missat deras player_score_recorded-broadcasts under offline-
 * fönstret och skickar om sina pending scores.
 *
 * Symmetriskt med player_rejoined (non-host → host): precis som non-host
 * drainer sin pending-kö och skickar player_rejoined vid sin reconnect,
 * triggar detta event samma drain på non-host:arnas sida vid HOST:s reconnect.
 */
export interface HostRejoinedPayload {
  /** Host:s lobby_players.player_id. Informativt. */
  sender_id: string;
}

/**
 * En spelare har svarat och fått sin score registrerad för den aktuella
 * frågan. Broadcastas av VARJE klient i IndDev-läget direkt efter att
 * `recordRoundScore` kört — mottagarna lägger in posten i sin lokala
 * `allRoundScoresHistory` så alla enheter ser hela leaderboard-bilden.
 *
 * `broadcast.self: false` garanterar att sändarens klient ALDRIG tar
 * emot sitt eget event (ingen double-count-risk). `question_index` driver
 * idempotent dedup på mottagarsidan.
 */
export interface PlayerScoreRecordedPayload {
  /** Lobby_players.player_id för spelaren som just scorade. */
  player_id: string;
  /** 0-baserat absolut frågeindex. Används för dedup (samma event kan
   *  dupliceras vid reconnect-replay). */
  question_index: number;
  points: number;
  correct: boolean;
  time_used: number;
}

/**
 * En spelare har räknat om sitt Player-HCP vid game-end. Broadcastas av VARJE
 * IndDev-klient EN gång (med några retries) när sista rundans leaderboard
 * visas — mottagarna merge:ar deltat i sin `playerHcpChanges` så §5-raden
 * ("HCP 42 (-1)") syns för alla spelare på alla enheter. `before`/`after` är
 * DISPLAY-HCP (avrundat uppåt). Idempotent: mottagaren nycklar på player_id.
 */
export interface HcpCatDelta {
  /** Nytt display-HCP (1–99). */
  after: number;
  /** Förändring after − before (0 / -x / +y). */
  delta: number;
}
export interface PlayerHcpChangedPayload {
  /** Lobby_players.player_id för spelaren vars HCP räknades om. */
  player_id: string;
  /** Display-HCP före/efter denna omgång (1–99). */
  before: number;
  after: number;
  /** §1.3 — per-kategori nytt värde + förändring, så alla enheter kan visa
   *  varandras kategori-sköldar + delta i leaderboarden. Optional (äldre
   *  klienter/Total-only-fall utelämnar). */
  categories?: {
    total: HcpCatDelta;
    music: HcpCatDelta;
    film: HcpCatDelta;
    sport: HcpCatDelta;
  };
}

/**
 * Non-host skickar sin lokala fråge-historik (rullande 20-sessions-fönstret
 * från hostQuestionHistory) till host direkt vid quiz-mount. Host unionerar
 * ALLA spelares historik och exkluderar frågor som NÅGON deltagare sett i
 * sina senaste 20 spel — så samma låt inte återkommer bara för att en annan
 * spelare hostar nästa spel. Broadcastas med retries (host är redan
 * subscribed eftersom host mountar quiz före non-hosts navigerar in).
 */
/**
 * `player_ready` — non-host signalerar att enheten är SETTLED och redo att
 * spela upp frågematerial. Skilt från `player_rejoined`, som bara betyder
 * "jag är på kanalen": hälsningen skickas 300 ms efter subscribe, alltså mitt
 * i enhetens tyngsta mount-arbete (AsyncStorage-läsningar, gameQuestions-
 * memon över ~970 items, audio-override-fetch). Släpper host:s Play-knapp på
 * hälsningen hamnar allt det arbetet MITT I nedräkningen i stället för före —
 * och CountdownIntro:s kedjade setTimeout:ar drar då iväg additivt, vilket
 * försenar när enheten går in i question-fasen och därmed när dess
 * YouTube-WebView ens börjar boota.
 *
 * Skickas när ALLA fyra är klara: seen-ids + epoch-ledger + audio-overrides
 * inlästa, och host:s frågesekvens mottagen. Retries av samma skäl som
 * hälsningen (Realtime replayar inte). Idempotent hos host.
 */
export interface PlayerReadyPayload {
  /** Avsändarens lobby_players.player_id. */
  player_id: string;
}

export interface PlayerSeenQuestionsPayload {
  /** Avsändarens lobby_players.player_id. */
  player_id: string;
  /** Fråge-IDs från avsändarens senaste 20 sessioner (trimmad till cap). */
  seen_q_ids: string[];
  /** Fråge-IDs enbart från avsändarens SENASTE session (hård exkludering). */
  last_q_ids: string[];
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
  /** DJ:n har tryckt "Start track in Spotify" — gissarnas step-guide hoppar
   *  från steg 1 till steg 2 (innan timer aktiveras). */
  onSpotifyDJOpenedApp?: (payload: SpotifyDJOpenedAppPayload) => void;
  /** DJ:n har öppnat Spotify — gissarnas timer + svar-block aktiveras. */
  onSpotifyDJTrackStarted?: (payload: SpotifyDJTrackStartedPayload) => void;
  /** DJ:n har tryckt "End DJ – handover to Host" i reveal-fasen. */
  onSpotifyDJHandover?: (payload: SpotifyDJHandoverPayload) => void;
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
   * Host broadcastar hela fråge-sekvensen vid quiz-mount (800ms delay).
   * Non-host sätter broadcastAllQuestionIds → korrekta media-source-ikoner
   * i GetReady-kön från första GetReady-skärmen.
   */
  onGameSequenceInit?: (payload: GameSequenceInitPayload) => void;
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
  /**
   * Fyrar när host broadcastat `host_rejoined` — host:s uppkoppling just
   * återupprättats. Non-host:ar drainer sin pending score-kö vid mottagning
   * så host:s leaderboard får resultat host kan ha missat under offline-fönstret.
   */
  onHostRejoined?: (senderId: string) => void;
  /**
   * Fyrar när watchdog:n detekterar att en peer kommit tillbaka efter att ha
   * markerts som 'disconnected' — dvs. vi tar emot ett nytt heartbeat från dem
   * inom PEER_TIMEOUT_MS efter att de var tysta. Kompletterar `onPlayerRejoined`
   * (som kräver explicit Retry-tap) med watchdog-baserad auto-recovery.
   * Används av host för att broadcastas `host_rejoined` → non-host drainer scores.
   * Används av non-host för att draina pending scores + broadcastas `player_rejoined`.
   */
  onPeerReconnected?: (senderId: string) => void;
  /**
   * En annan spelare i IndDev har svarat och registrerat sin score.
   * Merge:as in i lokal `allRoundScoresHistory` för komplett leaderboard.
   */
  onPlayerScoreRecorded?: (payload: PlayerScoreRecordedPayload) => void;
  /**
   * En annan IndDev-spelare har räknat om sitt Player-HCP vid game-end.
   * Merge:as in i `playerHcpChanges` för §5-raden på alla enheter.
   */
  onPlayerHcpChanged?: (payload: PlayerHcpChangedPayload) => void;
  /**
   * En non-host har skickat sin lokala fråge-historik (20-sessions-fönstret).
   * Host unionerar in i peer-seen-set:en som exkluderar frågor någon
   * deltagare redan sett — ignoreras efter att spelet startat (pool-rebuild
   * mitt i spelet skulle byta aktuell fråga).
   */
  onPlayerReady?: (payload: PlayerReadyPayload) => void;
  onPlayerSeenQuestions?: (payload: PlayerSeenQuestionsPayload) => void;
  /**
   * Valfritt membership-predikat. Om satt droppar vi player-id-bärande
   * events (player_left, player_score_recorded, player_answer_confirmed,
   * player_approved_play_again) vars id INTE finns i lobby-rostern — stoppar
   * forged/okända ids från en fientlig klient. Fail-open när det saknas.
   *
   * OBS: detta autentiserar INTE avsändaren. Supabase broadcast signerar
   * inte sender-identitet, så en angripare kan fortfarande sända ett
   * well-formed event med ett RIKTIGT player_id (synligt via lobby_players).
   * Full sender-auth kräver Supabase broadcast-authorization (separat item).
   */
  isKnownSender?: (playerId: string) => boolean;
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
  /** DJ:ns klient broadcastar att "Start track in Spotify" tryckts (innan timer). */
  broadcastSpotifyDJOpenedApp: (payload: SpotifyDJOpenedAppPayload) => Promise<void>;
  /** DJ:ns klient broadcastar att Spotify-appen öppnats. */
  broadcastSpotifyDJTrackStarted: (payload: SpotifyDJTrackStartedPayload) => Promise<void>;
  /** DJ:n broadcastar att hen överlämnar till host efter reveal. */
  broadcastSpotifyDJHandover: (payload: SpotifyDJHandoverPayload) => Promise<void>;
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
   * Host broadcastar "min uppkoppling är återupprättad" vid wasUnstable→ok.
   * Non-host:ar skickar om sina pending scores på mottagning.
   */
  broadcastHostRejoined: (payload: HostRejoinedPayload) => Promise<void>;
  /**
   * Broadcasta att vi just scorat en fråga i IndDev. Alla mottagare
   * lägger till vår RoundScore i sin lokala `allRoundScoresHistory`
   * så leaderboarden är komplett på alla enheter.
   */
  broadcastPlayerScoreRecorded: (payload: PlayerScoreRecordedPayload) => Promise<void>;
  /** Broadcasta vårt omräknade Player-HCP vid game-end (IndDev). */
  broadcastPlayerHcpChanged: (payload: PlayerHcpChangedPayload) => Promise<void>;
  /**
   * Non-host broadcastar sin lokala fråge-historik till host vid quiz-mount
   * så host:s pool-bygge kan exkludera frågor NÅGON deltagare sett i sina
   * senaste 20 spel.
   */
  broadcastPlayerReady: (payload: PlayerReadyPayload) => Promise<void>;
  broadcastPlayerSeenQuestions: (payload: PlayerSeenQuestionsPayload) => Promise<void>;
  /**
   * Rensar per-sender lastSeen + lastReported så watchdog:n börjar om från
   * scratch. Anropas av quiz.tsx när lokal monitor återgår från unstable
   * till ok — då är all peer-data potentiellt stale (vi tappade ALLAS
   * heartbeats medan VI var offline). Nästa heartbeat från varje peer
   * etablerar fresh status; ingen peer rapporteras som disconnected
   * förrän först en heartbeat tagits emot OCH sedan saknats >15s.
   */
  resetPeerTracking: () => void;
  /** Host broadcastar hela fråge-sekvensen vid quiz-mount. */
  broadcastGameSequenceInit: (payload: GameSequenceInitPayload) => Promise<void>;
  unsubscribe: () => void;
}

/** Heartbeat-broadcast var 10:e sekund. */
const HEARTBEAT_BROADCAST_MS = 10_000;
/** Per-sender silence-threshold innan vi markerar dem som disconnected. */
const PEER_TIMEOUT_MS = 15_000;
/** Watchdog-tick — kollar per-sender lastSeen. 5s ger worst-case 5s extra
 *  latens innan disconnect detektion; acceptabelt vs overhead av tätare ticks. */
const PEER_WATCHDOG_MS = 5_000;

// ── Payload-validering ──────────────────────────────────────────────────
// Broadcast-payloads kommer från andra klienter över en OAUTENTISERAD
// Realtime-channel — vem som helst med rumkoden kan subscribe:a OCH sända.
// Tidigare castades payloaden rått (`as XPayload`) utan runtime-koll, så en
// fientlig eller buggig klient kunde skicka fel typer, out-of-range-index
// eller ett poisonat timer_start_at och krascha/störa spelet på andra
// enheter. Vi validerar därför varje payload strukturellt + range-checkar
// innan handlern körs; ogiltiga events droppas (loggas som warning).
//
// Detta autentiserar INTE avsändaren (se isKnownSender-noten). Målet här är
// att garantera väl-formade, rimliga värden så ingen hostil/trasig payload
// kan orsaka odefinierat beteende — exakta spel-regler (t.ex. att points
// verkligen är 0/1, eller att index < antal frågor) ägs av quiz.tsx-handlern
// som har den lokala speldatan.

const MAX_QUESTION_INDEX = 10_000; // sanity-cap; riktig bound (< antal frågor) görs i quiz.tsx
const MAX_QUESTION_IDS = 500; // sanity-cap på sekvenslängd
const MAX_STRING_LEN = 512; // sanity-cap på fria strängfält
const TIMER_WINDOW_MS = 60_000; // timer_start_at får avvika ±60s från now (legit är ~+10.5s framåt)
const MAX_TIME_USED_SEC = 3600;
const MAX_POINTS = 1000;

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}
function str(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0 && v.length <= MAX_STRING_LEN;
}
function num(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}
function index(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= MAX_QUESTION_INDEX;
}
/** Valfri boolean → behåll om boolean, annars undefined (strip). */
function optBool(v: unknown): boolean | undefined {
  return typeof v === 'boolean' ? v : undefined;
}
/** Valfri sträng → behåll om giltig icke-tom sträng inom cap, annars undefined. */
function optStr(v: unknown): string | undefined {
  return str(v) ? v : undefined;
}
/** Valfri all_question_ids → array av icke-tomma strängar inom cap, annars undefined. */
function optIds(v: unknown): string[] | undefined {
  if (!Array.isArray(v) || v.length === 0 || v.length > MAX_QUESTION_IDS) return undefined;
  return v.every((x) => str(x)) ? (v as string[]) : undefined;
}
/** Valfri timer_start_at → behåll om inom ±TIMER_WINDOW_MS från now, annars
 *  undefined så konsumenten faller tillbaka på sin default-timing istället för
 *  att agera på ett poisonat (stale/far-future) värde. */
function optTimerStart(v: unknown): number | undefined {
  if (typeof v !== 'number' || !Number.isFinite(v)) return undefined;
  const delta = v - Date.now();
  return delta >= -TIMER_WINDOW_MS && delta <= TIMER_WINDOW_MS ? v : undefined;
}

function vPlayCommand(raw: unknown): PlayCommandPayload | null {
  if (!isObj(raw) || !index(raw.question_index) || !str(raw.question_id)) return null;
  return {
    question_index: raw.question_index,
    question_id: raw.question_id,
    all_question_ids: optIds(raw.all_question_ids),
    spotify_answer_year: optBool(raw.spotify_answer_year),
    spotify_answer_name: optBool(raw.spotify_answer_name),
    timer_start_at: optTimerStart(raw.timer_start_at),
    dj_player_id: optStr(raw.dj_player_id),
  };
}
function vQuestionAdvance(raw: unknown): QuestionAdvancePayload | null {
  if (!isObj(raw)) return null;
  const nqi = raw.next_question_index;
  if (nqi !== null && !index(nqi)) return null;
  return {
    next_question_index: nqi as number | null,
    all_question_ids: optIds(raw.all_question_ids),
    spotify_answer_year: optBool(raw.spotify_answer_year),
    spotify_answer_name: optBool(raw.spotify_answer_name),
  };
}
function vPlayerLeft(raw: unknown): PlayerLeftPayload | null {
  if (!isObj(raw) || !str(raw.player_id)) return null;
  return { player_id: raw.player_id, player_name: optStr(raw.player_name) ?? '' };
}
function vPlayerAnswerConfirmed(raw: unknown): PlayerAnswerConfirmedPayload | null {
  if (!isObj(raw) || !str(raw.player_id) || !num(raw.time_used)) return null;
  if (raw.time_used < 0 || raw.time_used > MAX_TIME_USED_SEC) return null;
  return { player_id: raw.player_id, time_used: raw.time_used };
}
function vResponseSecondsChanged(raw: unknown): ResponseSecondsChangedPayload | null {
  if (!isObj(raw)) return null;
  const s = raw.seconds;
  if (s !== 30 && s !== 45 && s !== 60) return null;
  return { seconds: s };
}
function vPlayAgainInitiated(raw: unknown): PlayAgainInitiatedPayload | null {
  if (!isObj(raw) || !str(raw.sender_id)) return null;
  return { sender_id: raw.sender_id };
}
function vPlayAgainLobbyReady(raw: unknown): PlayAgainLobbyReadyPayload | null {
  if (!isObj(raw) || !str(raw.room_code)) return null;
  return {
    room_code: raw.room_code,
    // Optional bool — allt annat än exakt true tolkas som frånvarande så
    // äldre payloads utan fältet beter sig som tidigare.
    auto_join: raw.auto_join === true ? true : undefined,
    aggregate_leaderboard_id: str(raw.aggregate_leaderboard_id)
      ? raw.aggregate_leaderboard_id
      : undefined,
  };
}
function vPlayerApprovedPlayAgain(raw: unknown): PlayerApprovedPlayAgainPayload | null {
  if (!isObj(raw) || !str(raw.player_id)) return null;
  return { player_id: raw.player_id };
}
function vLobbyDeleted(raw: unknown): LobbyDeletedPayload | null {
  if (!isObj(raw) || !str(raw.room_code)) return null;
  return { room_code: raw.room_code };
}
function vSpotifyQuestionReady(raw: unknown): SpotifyQuestionReadyPayload | null {
  if (
    !isObj(raw) ||
    !index(raw.question_index) ||
    !str(raw.spotify_track_id) ||
    !str(raw.display_name) ||
    !num(raw.correct_year) ||
    !str(raw.dj_player_id)
  )
    return null;
  if (raw.answer_type !== 'year' && raw.answer_type !== 'name') return null;
  if (raw.correct_year < 1000 || raw.correct_year > 3000) return null;
  return {
    question_index: raw.question_index,
    spotify_track_id: raw.spotify_track_id,
    display_name: raw.display_name,
    correct_year: raw.correct_year,
    dj_player_id: raw.dj_player_id,
    answer_type: raw.answer_type,
  };
}
function vSpotifyDJOpenedApp(raw: unknown): SpotifyDJOpenedAppPayload | null {
  if (!isObj(raw) || !str(raw.dj_player_id)) return null;
  return { dj_player_id: raw.dj_player_id };
}
function vSpotifyDJTrackStarted(raw: unknown): SpotifyDJTrackStartedPayload | null {
  if (!isObj(raw) || !str(raw.dj_player_id) || !str(raw.spotify_track_id)) return null;
  return {
    dj_player_id: raw.dj_player_id,
    spotify_track_id: raw.spotify_track_id,
    timer_start_at: optTimerStart(raw.timer_start_at),
  };
}
function vSpotifyDJHandover(raw: unknown): SpotifyDJHandoverPayload | null {
  if (!isObj(raw) || !str(raw.dj_player_id)) return null;
  return { dj_player_id: raw.dj_player_id };
}
function vPlayerAudioStateChanged(raw: unknown): PlayerAudioStateChangedPayload | null {
  if (!isObj(raw) || !str(raw.player_id) || typeof raw.audio_on !== 'boolean') return null;
  return { player_id: raw.player_id, audio_on: raw.audio_on };
}
function vHostActivePing(raw: unknown): HostActivePingPayload | null {
  if (!isObj(raw) || !str(raw.sender_id) || !index(raw.question_index)) return null;
  return {
    sender_id: raw.sender_id,
    question_index: raw.question_index,
    all_question_ids: optIds(raw.all_question_ids),
    phase: optStr(raw.phase),
  };
}
function vGameSequenceInit(raw: unknown): GameSequenceInitPayload | null {
  if (!isObj(raw)) return null;
  const ids = optIds(raw.all_question_ids);
  if (!ids) return null;
  return {
    all_question_ids: ids,
    spotify_answer_year: optBool(raw.spotify_answer_year),
    spotify_answer_name: optBool(raw.spotify_answer_name),
  };
}
function vNetworkHeartbeat(raw: unknown): NetworkHeartbeatPayload | null {
  if (!isObj(raw) || !str(raw.sender_id)) return null;
  return { sender_id: raw.sender_id };
}
function vPlayerRejoined(raw: unknown): PlayerRejoinedPayload | null {
  if (!isObj(raw) || !str(raw.sender_id)) return null;
  return { sender_id: raw.sender_id };
}
function vHostRejoined(raw: unknown): HostRejoinedPayload | null {
  if (!isObj(raw) || !str(raw.sender_id)) return null;
  return { sender_id: raw.sender_id };
}
function vPlayerReady(raw: unknown): PlayerReadyPayload | null {
  if (!isObj(raw) || !str(raw.player_id)) return null;
  return { player_id: raw.player_id };
}
function vPlayerSeenQuestions(raw: unknown): PlayerSeenQuestionsPayload | null {
  if (!isObj(raw) || !str(raw.player_id)) return null;
  // optIds returnerar undefined för tom/ogiltig array — behandla som tom
  // lista istället för att droppa hela payloaden (last_q_ids kan t.ex. vara
  // giltig även när seen_q_ids saknas hos en ny spelare).
  return {
    player_id: raw.player_id,
    seen_q_ids: optIds(raw.seen_q_ids) ?? [],
    last_q_ids: optIds(raw.last_q_ids) ?? [],
  };
}
function vPlayerScoreRecorded(raw: unknown): PlayerScoreRecordedPayload | null {
  if (
    !isObj(raw) ||
    !str(raw.player_id) ||
    !index(raw.question_index) ||
    !num(raw.points) ||
    typeof raw.correct !== 'boolean' ||
    !num(raw.time_used)
  )
    return null;
  if (raw.points < 0 || raw.points > MAX_POINTS) return null;
  if (raw.time_used < 0 || raw.time_used > MAX_TIME_USED_SEC) return null;
  return {
    player_id: raw.player_id,
    question_index: raw.question_index,
    points: raw.points,
    correct: raw.correct,
    time_used: raw.time_used,
  };
}

function vHcpCatDelta(raw: unknown): HcpCatDelta | null {
  if (!isObj(raw) || !num(raw.after) || !num(raw.delta)) return null;
  if (raw.after < 1 || raw.after > 99) return null;
  return { after: raw.after, delta: raw.delta };
}
function vPlayerHcpChanged(raw: unknown): PlayerHcpChangedPayload | null {
  if (!isObj(raw) || !str(raw.player_id) || !num(raw.before) || !num(raw.after))
    return null;
  if (raw.before < 1 || raw.before > 99 || raw.after < 1 || raw.after > 99)
    return null;
  const out: PlayerHcpChangedPayload = { player_id: raw.player_id, before: raw.before, after: raw.after };
  // Kategori-delen är optional — validera den om den finns, annars droppa den
  // (Total-förändringen fungerar ändå).
  const c = isObj(raw.categories) ? raw.categories : null;
  if (c) {
    const total = vHcpCatDelta(c.total);
    const music = vHcpCatDelta(c.music);
    const film = vHcpCatDelta(c.film);
    const sport = vHcpCatDelta(c.sport);
    if (total && music && film && sport) out.categories = { total, music, film, sport };
  }
  return out;
}

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

  // ── Validerad event-wiring ──────────────────────────────────────────
  // Varje broadcast valideras strukturellt + range-checkas (se validator-
  // sektionen ovan) innan handlern körs. Ogiltiga payloads droppas + loggas.
  const onEvent = <T>(
    event: string,
    validate: (raw: unknown) => T | null,
    handler: (p: T) => void,
  ) => {
    channel.on('broadcast', { event }, ({ payload }) => {
      const valid = validate(payload);
      if (valid === null) {
        console.warn(`[syncChannel] dropped invalid '${event}' payload`);
        return;
      }
      handler(valid);
    });
  };

  // Membership-guard: valfri. Om quiz.tsx passar isKnownSender droppar vi
  // player-id-bärande events vars id inte finns i lobby-rostern (stoppar
  // forged/okända ids). Fail-open när predikatet saknas.
  const known = (id: string, event: string): boolean => {
    if (!handlers.isKnownSender || handlers.isKnownSender(id)) return true;
    console.warn(`[syncChannel] dropped '${event}' from unknown sender ${id}`);
    return false;
  };

  if (handlers.onPlayCommand) onEvent('play_command', vPlayCommand, handlers.onPlayCommand);
  if (handlers.onQuestionAdvance)
    onEvent('question_advance', vQuestionAdvance, handlers.onQuestionAdvance);
  if (handlers.onPlayerLeft)
    onEvent('player_left', vPlayerLeft, (p) => {
      if (known(p.player_id, 'player_left')) handlers.onPlayerLeft!(p);
    });
  if (handlers.onPlayerAnswerConfirmed)
    onEvent('player_answer_confirmed', vPlayerAnswerConfirmed, (p) => {
      if (known(p.player_id, 'player_answer_confirmed')) handlers.onPlayerAnswerConfirmed!(p);
    });
  if (handlers.onResponseSecondsChanged)
    onEvent('response_seconds_changed', vResponseSecondsChanged, handlers.onResponseSecondsChanged);
  if (handlers.onPlayAgainInitiated)
    onEvent('play_again_initiated', vPlayAgainInitiated, handlers.onPlayAgainInitiated);
  if (handlers.onPlayAgainLobbyReady)
    onEvent('play_again_lobby_ready', vPlayAgainLobbyReady, handlers.onPlayAgainLobbyReady);
  if (handlers.onPlayerApprovedPlayAgain)
    onEvent('player_approved_play_again', vPlayerApprovedPlayAgain, (p) => {
      if (known(p.player_id, 'player_approved_play_again')) handlers.onPlayerApprovedPlayAgain!(p);
    });
  if (handlers.onLobbyDeleted) onEvent('lobby_deleted', vLobbyDeleted, handlers.onLobbyDeleted);
  if (handlers.onSpotifyQuestionReady)
    onEvent('spotify_question_ready', vSpotifyQuestionReady, handlers.onSpotifyQuestionReady);
  if (handlers.onSpotifyDJOpenedApp)
    onEvent('spotify_dj_opened_app', vSpotifyDJOpenedApp, handlers.onSpotifyDJOpenedApp);
  if (handlers.onSpotifyDJTrackStarted)
    onEvent('spotify_dj_track_started', vSpotifyDJTrackStarted, handlers.onSpotifyDJTrackStarted);
  if (handlers.onSpotifyDJHandover)
    onEvent('spotify_dj_handover', vSpotifyDJHandover, handlers.onSpotifyDJHandover);
  if (handlers.onPlayerAudioStateChanged)
    onEvent('player_audio_state_changed', vPlayerAudioStateChanged, handlers.onPlayerAudioStateChanged);
  if (handlers.onHostActivePing)
    onEvent('host_active_ping', vHostActivePing, handlers.onHostActivePing);
  if (handlers.onGameSequenceInit)
    onEvent('game_sequence_init', vGameSequenceInit, handlers.onGameSequenceInit);

  // Heartbeat-receiver: per-sender-tracking. Markera bara lastSeen —
  // INGEN auto-'connected'-callback ens om sender:n tidigare var
  // disconnected. Per design (D-iii): återanslutning kräver explicit
  // player_rejoined-broadcast från spelaren (= deras Retry-tap). Heartbeat
  // ensam räcker inte — sender:n kan vara online utan att ha tappat på
  // Retry-knappen, och då ska A:s leaderboard fortsatt visa dem som
  // 'disconnected'.
  channel.on('broadcast', { event: 'network_heartbeat' }, ({ payload }) => {
    const p = vNetworkHeartbeat(payload);
    if (!p || p.sender_id === selfPlayerId) return;
    lastSeenBySender.set(p.sender_id, Date.now());
  });
  // player_rejoined-receiver: explicit "jag är tillbaka"-signal som B
  // broadcastar när Retry trycks i ConnectionUnstableOverlay. Detta är
  // det ENDA spåret som flippar en disconnect:ad spelare tillbaka till
  // 'connected' i A:s vy. Synkar även lastReportedStatus så watchdog:n
  // inte fyrar gammal disconnect-callback igen.
  if (handlers.onPlayerRejoined) {
    channel.on('broadcast', { event: 'player_rejoined' }, ({ payload }) => {
      const p = vPlayerRejoined(payload);
      if (!p || p.sender_id === selfPlayerId) return;
      lastSeenBySender.set(p.sender_id, Date.now());
      lastReportedStatus.set(p.sender_id, 'connected');
      handlers.onPlayerRejoined!(p.sender_id);
    });
  }
  if (handlers.onHostRejoined) {
    channel.on('broadcast', { event: 'host_rejoined' }, ({ payload }) => {
      const p = vHostRejoined(payload);
      if (!p) return;
      handlers.onHostRejoined!(p.sender_id);
    });
  }
  // player_score_recorded: en annan IndDev-spelare har svarat. Mottagaren
  // mergar in score:n i sin lokala allRoundScoresHistory för komplett
  // leaderboard. broadcast.self: false garanterar att sändarens egna klient
  // ALDRIG tar emot sitt eget event.
  if (handlers.onPlayerScoreRecorded)
    onEvent('player_score_recorded', vPlayerScoreRecorded, (p) => {
      if (known(p.player_id, 'player_score_recorded')) handlers.onPlayerScoreRecorded!(p);
    });
  // player_hcp_changed: en annan IndDev-enhet har räknat om sitt Player-HCP
  // vid game-end. Player-id-bärande → samma membership-guard som scores.
  if (handlers.onPlayerHcpChanged)
    onEvent('player_hcp_changed', vPlayerHcpChanged, (p) => {
      if (known(p.player_id, 'player_hcp_changed')) handlers.onPlayerHcpChanged!(p);
    });
  // player_seen_questions: non-host:s fråge-historik → host:s peer-union.
  // Player-id-bärande → membership-guard som övriga sådana events.
  if (handlers.onPlayerReady)
    onEvent('player_ready', vPlayerReady, (p) => {
      if (known(p.player_id, 'player_ready')) handlers.onPlayerReady!(p);
    });
  if (handlers.onPlayerSeenQuestions)
    onEvent('player_seen_questions', vPlayerSeenQuestions, (p) => {
      if (known(p.player_id, 'player_seen_questions')) handlers.onPlayerSeenQuestions!(p);
    });

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
  // Disconnect: gap > 15s OCH status !== 'disconnected' → markera + callback.
  // Reconnect: gap <= 15s OCH status === 'disconnected' → flip 'connected' +
  //   callback + onPeerReconnected (trigger score-drain på mottagarsidan).
  // Obs: "vid recovery flyttas de tillbaka av heartbeat-handlern" i gamla
  // kommentaren var FEL — heartbeat uppdaterar bara lastSeen, inte status.
  const watchdogInterval = setInterval(() => {
    const now = Date.now();
    lastSeenBySender.forEach((seenAt, senderId) => {
      const gap = now - seenAt;
      const currentStatus = lastReportedStatus.get(senderId);
      if (gap > PEER_TIMEOUT_MS && currentStatus !== 'disconnected') {
        // Disconnect: tystnad > 15s sedan senaste heartbeat.
        lastReportedStatus.set(senderId, 'disconnected');
        handlers.onPlayerConnectionChange?.(senderId, 'disconnected');
      } else if (gap <= PEER_TIMEOUT_MS && currentStatus === 'disconnected') {
        // Reconnect: var 'disconnected' men vi tar nu emot fresh heartbeat.
        // Flip status → 'connected' + notifiera quiz.tsx via onPeerReconnected
        // (quiz.tsx broadcastar host_rejoined / drainer pending scores).
        lastReportedStatus.set(senderId, 'connected');
        handlers.onPlayerConnectionChange?.(senderId, 'connected');
        handlers.onPeerReconnected?.(senderId);
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
    broadcastSpotifyDJOpenedApp: async (payload) => {
      await channel.send({ type: 'broadcast', event: 'spotify_dj_opened_app', payload });
    },
    broadcastSpotifyDJTrackStarted: async (payload) => {
      await channel.send({ type: 'broadcast', event: 'spotify_dj_track_started', payload });
    },
    broadcastSpotifyDJHandover: async (payload) => {
      await channel.send({ type: 'broadcast', event: 'spotify_dj_handover', payload });
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
    broadcastHostRejoined: async (payload) => {
      await channel.send({
        type: 'broadcast',
        event: 'host_rejoined',
        payload,
      });
    },
    broadcastPlayerScoreRecorded: async (payload) => {
      await channel.send({ type: 'broadcast', event: 'player_score_recorded', payload });
    },
    broadcastPlayerHcpChanged: async (payload) => {
      await channel.send({ type: 'broadcast', event: 'player_hcp_changed', payload });
    },
    broadcastPlayerReady: async (payload) => {
      await channel.send({ type: 'broadcast', event: 'player_ready', payload });
    },
    broadcastPlayerSeenQuestions: async (payload) => {
      await channel.send({ type: 'broadcast', event: 'player_seen_questions', payload });
    },
    broadcastGameSequenceInit: async (payload) => {
      await channel.send({ type: 'broadcast', event: 'game_sequence_init', payload });
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

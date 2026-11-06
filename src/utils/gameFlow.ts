// Multiplayer v2 — game-flow resolver + device-capacity rules (pure).
//
// The user-facing flows map onto the EXISTING internal game modes, which are
// deliberately not renamed (checked ~175 places, DB CHECKs, history):
//
//   1 by 1      → 'pass-the-phone'
//   All at Once → 'individual-devices'
//
// Nothing here is wired into the lobby yet (Step 1 of the Multiplayer v2
// plan). Single Player and Remote 1v1 never go through this resolver.
//
// Tests: backend/content/test/multiplayerV2.test.ts

export type DeviceMode = 'host' | 'own';
export type MultiplayerGameMode = 'pass-the-phone' | 'individual-devices';

export const ONE_BY_ONE: MultiplayerGameMode = 'pass-the-phone';
export const ALL_AT_ONCE: MultiplayerGameMode = 'individual-devices';

/**
 * 1 by 1 total cap — the existing Pass-the-Phone limit, unchanged.
 * Mirrors resolveMaxPlayers in LobbyScreen (PtP = 4); unify in Step 5.
 */
export const ONE_BY_ONE_MAX_PLAYERS = 4;

/** Total room capacity per flow. Mirrors resolveMaxPlayers' multiplayer branch. */
export function roomCapacity(gameMode: MultiplayerGameMode, hostIsPremium: boolean): 4 | 12 {
  return gameMode === ALL_AT_ONCE && hostIsPremium ? 12 : 4;
}

export interface FlowParticipant {
  id: string;
  isHost?: boolean;
  /** Undefined only for legacy rows — treated as 'own' (the host is always 'own'). */
  deviceMode?: DeviceMode;
  /** Registered QuizVibe user (not a guest / anon session). */
  isRegistered: boolean;
  approved?: boolean;
  hasLeft?: boolean;
  /** Existing Spotify self-attest ("I have the Spotify app"). */
  spotifyAttested?: boolean;
}

function deviceOf(p: FlowParticipant): DeviceMode {
  if (p.isHost) return 'own';
  return p.deviceMode ?? 'own';
}

function activeParticipants(participants: readonly FlowParticipant[]): FlowParticipant[] {
  return participants.filter((p) => !p.hasLeft);
}

export type GameFlowReason =
  | 'host-device-participant'
  | 'spotify'
  | 'not-entitled'
  | 'override'
  | 'default';

export interface ResolveGameFlowInput {
  participants: readonly FlowParticipant[];
  hostOverrideOneByOne: boolean;
  spotifyEnabled: boolean;
  allAtOnceEntitled: boolean;
}

export interface ResolvedGameFlow {
  gameMode: MultiplayerGameMode;
  /** Whether the host may toggle the "1 by 1" override right now. */
  overrideAvailable: boolean;
  /** False when the override had to be ignored/cleared (Spotify, forced 1 by 1). */
  overrideApplied: boolean;
  reason: GameFlowReason;
  /** Spotify is on but the configuration cannot play it (must be resolved before Start). */
  spotifyConflict: boolean;
}

/**
 * Derives the flow from participants' device choices.
 *
 * Rules, in order:
 *   1. Any approved non-host on the host's device → 1 by 1 (override unavailable).
 *   2. Spotify on → All at Once (override unavailable and cleared).
 *   3. All at Once not entitled → 1 by 1.
 *   4. Otherwise All at Once, or 1 by 1 if the host override is on.
 *
 * The override is also unavailable while the lobby holds more players than
 * 1 by 1 allows (decision D-A — Premium limits are never expanded).
 */
export function resolveGameFlow(input: ResolveGameFlowInput): ResolvedGameFlow {
  const active = activeParticipants(input.participants);
  const hasHostDevicePlayer = active.some(
    (p) => !p.isHost && p.approved !== false && deviceOf(p) === 'host',
  );
  const fitsOneByOne = active.length <= ONE_BY_ONE_MAX_PLAYERS;

  if (hasHostDevicePlayer) {
    return {
      gameMode: ONE_BY_ONE,
      overrideAvailable: false,
      overrideApplied: false,
      reason: 'host-device-participant',
      spotifyConflict: input.spotifyEnabled,
    };
  }
  if (input.spotifyEnabled) {
    return {
      gameMode: ALL_AT_ONCE,
      overrideAvailable: false,
      overrideApplied: false,
      reason: 'spotify',
      spotifyConflict: !input.allAtOnceEntitled,
    };
  }
  if (!input.allAtOnceEntitled) {
    return {
      gameMode: ONE_BY_ONE,
      overrideAvailable: false,
      overrideApplied: false,
      reason: 'not-entitled',
      spotifyConflict: false,
    };
  }
  const overrideAvailable = fitsOneByOne;
  if (input.hostOverrideOneByOne && overrideAvailable) {
    return {
      gameMode: ONE_BY_ONE,
      overrideAvailable,
      overrideApplied: true,
      reason: 'override',
      spotifyConflict: false,
    };
  }
  return {
    gameMode: ALL_AT_ONCE,
    overrideAvailable,
    overrideApplied: false,
    reason: 'default',
    spotifyConflict: false,
  };
}

// ─── Capacity (decision D-A) ──────────────────────────────────────────

export type JoinBlockReason = 'room-full' | 'own-device-required';

export interface JoinCheckInput {
  /** Non-left participants currently in the lobby, host included. */
  currentTotal: number;
  deviceMode: DeviceMode;
  /** Current total room capacity (roomCapacity of the resolved flow). */
  roomCapacity: number;
}

export interface JoinCheck {
  allowed: boolean;
  reason: JoinBlockReason | null;
}

/**
 * Whether one more participant may join with the given device.
 *
 * A host-device participant forces 1 by 1, so they fit only while the total
 * stays within ONE_BY_ONE_MAX_PLAYERS. If they don't fit but an own-device
 * join would, the reason is 'own-device-required' so the UI can keep the
 * joiner on the device step ("Own Device Required").
 */
export function canJoinWithDevice(input: JoinCheckInput): JoinCheck {
  const after = input.currentTotal + 1;
  const ownFits = after <= input.roomCapacity;
  if (input.deviceMode === 'own') {
    return ownFits ? { allowed: true, reason: null } : { allowed: false, reason: 'room-full' };
  }
  const hostFits = after <= Math.min(input.roomCapacity, ONE_BY_ONE_MAX_PLAYERS);
  if (hostFits) return { allowed: true, reason: null };
  return { allowed: false, reason: ownFits ? 'own-device-required' : 'room-full' };
}

/**
 * "+ Add Guest" — a manually added guest always plays on the host's device.
 * Any block surfaces as the existing "Lobby is full" Alert.
 */
export function canAddManualGuest(currentTotal: number, roomCap: number): boolean {
  return canJoinWithDevice({ currentTotal, deviceMode: 'host', roomCapacity: roomCap }).allowed;
}

// ─── Spotify eligibility (decision D-B) ───────────────────────────────

export interface SpotifyEnablePlan {
  /** Guests and registered host-device participants — removed after host confirmation. */
  toRemove: string[];
  /** Registered own-device participants who stay. */
  remaining: string[];
  /** Remaining participants without attestation — these block enabling, as today. */
  blockingUnattested: string[];
  /** Spotify can never be enabled (e.g. Guest Host, or All at Once not entitled). */
  hostIneligible: boolean;
}

/**
 * Partitions a lobby for "host enables Spotify". Only the REMAINING set must
 * satisfy the existing attestation requirement — participants scheduled for
 * removal never block the confirmation/removal step.
 */
export function planSpotifyEnable(
  participants: readonly FlowParticipant[],
  opts: { hostIsRegistered: boolean; allAtOnceEntitled: boolean },
): SpotifyEnablePlan {
  const toRemove: string[] = [];
  const remaining: string[] = [];
  const blockingUnattested: string[] = [];
  for (const p of activeParticipants(participants)) {
    if (p.isHost) continue;
    if (!p.isRegistered || deviceOf(p) === 'host') {
      toRemove.push(p.id);
      continue;
    }
    remaining.push(p.id);
    if (!p.spotifyAttested) blockingUnattested.push(p.id);
  }
  return {
    toRemove,
    remaining,
    blockingUnattested,
    hostIneligible: !opts.hostIsRegistered || !opts.allAtOnceEntitled,
  };
}

/** Join-time Spotify gate: when Spotify is on, only registered own-device joiners are accepted. */
export function spotifyJoinBlock(
  joiner: { isRegistered: boolean; deviceMode: DeviceMode },
  spotifyEnabled: boolean,
): 'guest-not-allowed' | 'own-device-required' | null {
  if (!spotifyEnabled) return null;
  if (!joiner.isRegistered) return 'guest-not-allowed';
  if (joiner.deviceMode === 'host') return 'own-device-required';
  return null;
}

// ─── Device choice (Step 2) ───────────────────────────────────────────

export function isDeviceMode(v: unknown): v is DeviceMode {
  return v === 'host' || v === 'own';
}

/**
 * The device mode a lobby_players row represents. The host is always 'own';
 * a stored value wins; host-added guests (guest + no user_id, the existing
 * addedByHost heuristic) are 'host'; anything else is legacy → undefined.
 */
export function deviceModeFromRow(row: {
  is_host: boolean;
  device_mode?: string | null;
  type: string;
  user_id: string | null;
}): DeviceMode | undefined {
  if (row.is_host) return 'own';
  if (isDeviceMode(row.device_mode)) return row.device_mode;
  if (row.type === 'guest' && row.user_id === null) return 'host';
  return undefined;
}

/**
 * Device mode a joiner publishes for its own row. An explicit choice (join UI
 * in Step 6, or the carry-over param on Play Again) wins. In a Multiplayer v2
 * room the default is 'own' — the joiner is on their own phone. In legacy
 * rooms nothing is written, so old behaviour is untouched.
 */
export function resolveJoinDeviceMode(
  param: string | undefined,
  roomIsMultiplayerV2: boolean,
): DeviceMode | undefined {
  if (isDeviceMode(param)) return param;
  return roomIsMultiplayerV2 ? 'own' : undefined;
}

// ─── Server rule errors (Step 3, migration 0064) ──────────────────────

export type ServerRejectionKind = 'join' | 'start' | 'spotify';

export interface ServerRejection {
  kind: ServerRejectionKind;
  reason: string;
}

/**
 * Parses the 'qv_<kind>_rejected:<reason>' messages raised by the 0064
 * trigger/RPCs. Anything else (network, RLS, missing migration) → null so
 * callers keep their existing generic handling.
 */
export function parseServerRejection(message: string | null | undefined): ServerRejection | null {
  if (!message) return null;
  const m = /qv_(join|start|spotify)_rejected:([a-z_0-9]+)/.exec(message);
  return m ? { kind: m[1] as ServerRejectionKind, reason: m[2] } : null;
}

/** Frozen snapshot written by start_lobby_game (rooms.game_config). */
export interface FrozenGameConfig {
  version: number;
  gameMode: MultiplayerGameMode;
  override: boolean;
  spotifyEnabled: boolean;
  allAtOnceAllowed: boolean;
  participants: { playerId: string; isHost: boolean; deviceMode: DeviceMode; registered: boolean }[];
}

/** Tolerant reader for rooms.game_config. Unknown/invalid shape → null. */
export function parseFrozenGameConfig(raw: unknown): FrozenGameConfig | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (o.gameMode !== ONE_BY_ONE && o.gameMode !== ALL_AT_ONCE) return null;
  if (!Array.isArray(o.participants)) return null;
  const participants: FrozenGameConfig['participants'] = [];
  for (const p of o.participants) {
    if (!p || typeof p !== 'object') return null;
    const q = p as Record<string, unknown>;
    if (typeof q.playerId !== 'string' || !q.playerId) return null;
    participants.push({
      playerId: q.playerId,
      isHost: q.isHost === true,
      deviceMode: isDeviceMode(q.deviceMode) ? q.deviceMode : 'own',
      registered: q.registered === true,
    });
  }
  if (participants.length === 0) return null;
  return {
    version: typeof o.version === 'number' ? o.version : 1,
    gameMode: o.gameMode as MultiplayerGameMode,
    override: o.override === true,
    spotifyEnabled: o.spotifyEnabled === true,
    allAtOnceAllowed: o.allAtOnceAllowed !== false,
    participants,
  };
}

/** User-facing copy for a rejected Start Game. */
export function startRejectionMessage(reason: string): { title: string; message: string } {
  switch (reason) {
    case 'roster_changed':
      return { title: 'Players changed', message: 'A player joined or left just now. Check the lobby and press Start Game again.' };
    case 'host_device_requires_one_by_one':
      return { title: 'Pass-the-Phone required', message: 'Someone is playing on your device, so this game has to be played Pass-the-Phone.' };
    case 'too_many_for_one_by_one':
      return { title: 'Too many players', message: 'Pass-the-Phone allows max 4 players.' };
    case 'all_at_once_not_entitled':
      return { title: 'Premium feature', message: 'Individual devices requires QuizVibe Premium.' };
    case 'spotify_conflict':
      return { title: 'Spotify DJ not applicable', message: 'Spotify DJ requires Individual devices and that every player is a QuizVibe user on their own device.' };
    default:
      return { title: 'Cannot start game', message: 'Check your connection and try again.' };
  }
}

/** User-facing copy for a join rejected by the server. */
export function joinRejectionMessage(reason: string): { title: string; message: string } {
  switch (reason) {
    case 'game_started':
      return { title: 'Game already started', message: 'The Host has already started this game.' };
    case 'room_full':
      return { title: 'Lobby is full', message: 'This lobby is full.' };
    case 'own_device_required':
      return { title: 'Own Device Required', message: "This room requires you to play on your own device. Please select 'On my own device' to join." };
    case 'spotify_own_device_required':
      return {
        title: 'Own Device Required',
        message: "Spotify is enabled in this lobby. You must play from your own device to join.\n\nAsk the host to disable Spotify if you prefer to play on the host's device.",
      };
    case 'spotify_guest':
      return { title: 'Spotify lobby', message: 'Spotify is enabled in this lobby. Only QuizVibe users playing on their own device can join.' };
    case 'removed':
      return { title: 'Removed from lobby', message: 'The Host enabled Spotify. Join again from your own device as a QuizVibe user.' };
    case 'device_locked':
      return { title: 'Device choice locked', message: 'Leave the lobby and join again to change device.' };
    default:
      return { title: 'Could not join', message: 'Check your connection and try again.' };
  }
}

// ─── Hybrid 1 by 1 quiz params (Step 4) ──────────────────────────────

/**
 * Own-device non-host participants in a frozen 1 by 1 game. Non-empty =
 * hybrid 1 by 1 (someone answers on their own phone). Empty for All at
 * Once, for an all-host-device 1 by 1 game, and for legacy rooms (no config).
 */
export function hybridOwnDeviceIds(config: FrozenGameConfig | null | undefined): string[] {
  if (!config || config.gameMode !== ONE_BY_ONE) return [];
  return config.participants.filter((p) => !p.isHost && p.deviceMode === 'own').map((p) => p.playerId);
}

/** Quiz route params that switch the quiz engine into hybrid 1 by 1. */
export function hybridQuizParams(
  config: FrozenGameConfig | null | undefined,
): { hybridOneByOne?: string; hybridOwnDeviceIds?: string } {
  const ids = hybridOwnDeviceIds(config);
  return ids.length > 0 ? { hybridOneByOne: 'true', hybridOwnDeviceIds: JSON.stringify(ids) } : {};
}

// ─── Lobby UI (Step 5) ───────────────────────────────────────────────

/** Minimal lobby-player shape the flow rules need (LobbyPlayer satisfies it). */
export interface LobbyFlowPlayer {
  id: string;
  isHost?: boolean;
  deviceMode?: DeviceMode;
  type?: string;
  approved?: boolean;
  hasLeft?: boolean;
  spotifyConnected?: boolean;
}

/** Maps lobby players to resolver participants. */
export function toFlowParticipants(players: readonly LobbyFlowPlayer[]): FlowParticipant[] {
  return players.map((p) => ({
    id: p.id,
    isHost: !!p.isHost,
    deviceMode: p.deviceMode,
    isRegistered: p.type === 'registered',
    // The host counts as approved; waiting rows are not part of the game yet.
    approved: !!p.isHost || !!p.approved,
    hasLeft: !!p.hasLeft,
    spotifyAttested: !!p.spotifyConnected,
  }));
}

/** 1 by 1 keeps the existing Pass-the-Phone round cap (decision D-C). */
export const ONE_BY_ONE_MAX_ROUNDS = 4;

/**
 * Round count a game actually starts with. Applied at Start on BOTH host and
 * non-host from the frozen game mode, so a flip to 1 by 1 right before Start
 * can't leave a 20-round 1 by 1 game while the lobby's clamp effect is pending.
 */
export function clampRoundsForFlow(rounds: number, gameMode: string): number {
  return gameMode === ONE_BY_ONE ? Math.min(rounds, ONE_BY_ONE_MAX_ROUNDS) : rounds;
}

/** One-line explanation under the flow indicator (null = nothing to explain). */
export function flowReasonText(reason: GameFlowReason): string | null {
  switch (reason) {
    case 'host-device-participant':
      return 'Someone is playing on your phone, so the game is played 1 by 1.';
    case 'spotify':
      return 'Spotify DJ needs every player on their own phone, so the game is played All at Once.';
    case 'not-entitled':
      return 'All at Once requires QuizVibe Premium.';
    default:
      return null;
  }
}

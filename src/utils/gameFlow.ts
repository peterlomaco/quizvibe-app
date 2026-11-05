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

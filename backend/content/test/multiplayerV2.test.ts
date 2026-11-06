// Multiplayer v2 Step 1 — game-flow resolver, device capacity (D-A),
// Spotify eligibility (D-B) and entitlements. Pure modules, no wiring yet.
//
// Ligger i backend-sviten (enda vitest-harnessen i repot) men testar
// klient-modulerna under src/utils.

import { describe, it, expect } from 'vitest';
import {
  ALL_AT_ONCE,
  ONE_BY_ONE,
  ONE_BY_ONE_MAX_PLAYERS,
  canAddManualGuest,
  canJoinWithDevice,
  planSpotifyEnable,
  resolveGameFlow,
  roomCapacity,
  spotifyJoinBlock,
  type FlowParticipant,
} from '../../../src/utils/gameFlow';
import {
  DEFAULT_FEATURE_GATES,
  canUse,
  parseFeatureGates,
} from '../../../src/utils/entitlements';

const host: FlowParticipant = { id: '1', isHost: true, isRegistered: true, approved: true };
const own = (id: string, extra: Partial<FlowParticipant> = {}): FlowParticipant => ({
  id, deviceMode: 'own', isRegistered: true, approved: true, ...extra,
});
const onHost = (id: string, extra: Partial<FlowParticipant> = {}): FlowParticipant => ({
  id, deviceMode: 'host', isRegistered: true, approved: true, ...extra,
});

const base = { hostOverrideOneByOne: false, spotifyEnabled: false, allAtOnceEntitled: true };

describe('resolveGameFlow', () => {
  it('maps flows onto the existing internal mode identifiers', () => {
    expect(ONE_BY_ONE).toBe('pass-the-phone');
    expect(ALL_AT_ONCE).toBe('individual-devices');
  });

  it('host alone → All at Once by default, override available', () => {
    const r = resolveGameFlow({ ...base, participants: [host] });
    expect(r.gameMode).toBe(ALL_AT_ONCE);
    expect(r.reason).toBe('default');
    expect(r.overrideAvailable).toBe(true);
  });

  it('all own devices → All at Once', () => {
    const r = resolveGameFlow({ ...base, participants: [host, own('a'), own('b')] });
    expect(r.gameMode).toBe(ALL_AT_ONCE);
  });

  it('any approved participant on the host device → 1 by 1, override unavailable', () => {
    const r = resolveGameFlow({ ...base, participants: [host, own('a'), onHost('b')] });
    expect(r.gameMode).toBe(ONE_BY_ONE);
    expect(r.reason).toBe('host-device-participant');
    expect(r.overrideAvailable).toBe(false);
  });

  it('manually added guest (unregistered, host device) forces 1 by 1', () => {
    const r = resolveGameFlow({
      ...base,
      participants: [host, onHost('g', { isRegistered: false })],
    });
    expect(r.gameMode).toBe(ONE_BY_ONE);
  });

  it('host-device player still waiting for approval does not force 1 by 1 yet', () => {
    const r = resolveGameFlow({ ...base, participants: [host, onHost('b', { approved: false })] });
    expect(r.gameMode).toBe(ALL_AT_ONCE);
  });

  it('host-device player who left does not force 1 by 1', () => {
    const r = resolveGameFlow({ ...base, participants: [host, onHost('b', { hasLeft: true })] });
    expect(r.gameMode).toBe(ALL_AT_ONCE);
  });

  it('legacy participant without deviceMode counts as own device', () => {
    const r = resolveGameFlow({ ...base, participants: [host, { id: 'x', isRegistered: true, approved: true }] });
    expect(r.gameMode).toBe(ALL_AT_ONCE);
  });

  it('host override selects 1 by 1 when all are on own devices', () => {
    const r = resolveGameFlow({ ...base, hostOverrideOneByOne: true, participants: [host, own('a')] });
    expect(r.gameMode).toBe(ONE_BY_ONE);
    expect(r.reason).toBe('override');
    expect(r.overrideApplied).toBe(true);
  });

  it('override is unavailable and ignored with more than 4 players (D-A)', () => {
    const five = [host, own('a'), own('b'), own('c'), own('d')];
    const r = resolveGameFlow({ ...base, hostOverrideOneByOne: true, participants: five });
    expect(r.overrideAvailable).toBe(false);
    expect(r.overrideApplied).toBe(false);
    expect(r.gameMode).toBe(ALL_AT_ONCE);
  });

  it('override is available at exactly 4 players', () => {
    const four = [host, own('a'), own('b'), own('c')];
    expect(resolveGameFlow({ ...base, participants: four }).overrideAvailable).toBe(true);
  });

  it('Spotify forces All at Once and clears the override', () => {
    const r = resolveGameFlow({
      ...base, spotifyEnabled: true, hostOverrideOneByOne: true, participants: [host, own('a')],
    });
    expect(r.gameMode).toBe(ALL_AT_ONCE);
    expect(r.reason).toBe('spotify');
    expect(r.overrideAvailable).toBe(false);
    expect(r.overrideApplied).toBe(false);
    expect(r.spotifyConflict).toBe(false);
  });

  it('Spotify with a host-device participant is a conflict (1 by 1 wins)', () => {
    const r = resolveGameFlow({ ...base, spotifyEnabled: true, participants: [host, onHost('b')] });
    expect(r.gameMode).toBe(ONE_BY_ONE);
    expect(r.spotifyConflict).toBe(true);
  });

  it('All at Once not entitled → 1 by 1, no override', () => {
    const r = resolveGameFlow({ ...base, allAtOnceEntitled: false, participants: [host, own('a')] });
    expect(r.gameMode).toBe(ONE_BY_ONE);
    expect(r.reason).toBe('not-entitled');
    expect(r.overrideAvailable).toBe(false);
  });

  it('Spotify without All at Once entitlement is a conflict', () => {
    const r = resolveGameFlow({
      ...base, allAtOnceEntitled: false, spotifyEnabled: true, participants: [host, own('a')],
    });
    expect(r.spotifyConflict).toBe(true);
  });
});

describe('roomCapacity (mirrors resolveMaxPlayers, unchanged limits)', () => {
  it('1 by 1 is always 4, even with Premium', () => {
    expect(roomCapacity(ONE_BY_ONE, false)).toBe(4);
    expect(roomCapacity(ONE_BY_ONE, true)).toBe(4);
  });
  it('All at Once is 4 without Premium, 12 with Premium', () => {
    expect(roomCapacity(ALL_AT_ONCE, false)).toBe(4);
    expect(roomCapacity(ALL_AT_ONCE, true)).toBe(12);
  });
  it('1 by 1 cap constant is 4', () => {
    expect(ONE_BY_ONE_MAX_PLAYERS).toBe(4);
  });
});

describe('canJoinWithDevice (D-A)', () => {
  it('5th player on host device with 4 own-device players → Own Device Required (Premium room)', () => {
    expect(canJoinWithDevice({ currentTotal: 4, deviceMode: 'host', roomCapacity: 12 }))
      .toEqual({ allowed: false, reason: 'own-device-required' });
  });
  it('5th player on own device may join a Premium All at Once room', () => {
    expect(canJoinWithDevice({ currentTotal: 4, deviceMode: 'own', roomCapacity: 12 }))
      .toEqual({ allowed: true, reason: null });
  });
  it('5th player is blocked in a non-Premium room (room full), whatever the device', () => {
    expect(canJoinWithDevice({ currentTotal: 4, deviceMode: 'own', roomCapacity: 4 }).reason).toBe('room-full');
    expect(canJoinWithDevice({ currentTotal: 4, deviceMode: 'host', roomCapacity: 4 }).reason).toBe('room-full');
  });
  it('host-device join fits while total stays ≤ 4', () => {
    expect(canJoinWithDevice({ currentTotal: 3, deviceMode: 'host', roomCapacity: 12 }).allowed).toBe(true);
    expect(canJoinWithDevice({ currentTotal: 3, deviceMode: 'host', roomCapacity: 4 }).allowed).toBe(true);
  });
  it('own-device join is bounded by room capacity (12)', () => {
    expect(canJoinWithDevice({ currentTotal: 11, deviceMode: 'own', roomCapacity: 12 }).allowed).toBe(true);
    expect(canJoinWithDevice({ currentTotal: 12, deviceMode: 'own', roomCapacity: 12 }).reason).toBe('room-full');
  });
  it('a 1 by 1 room (cap 4) never accepts a 5th player', () => {
    const cap = roomCapacity(ONE_BY_ONE, true);
    expect(canJoinWithDevice({ currentTotal: 4, deviceMode: 'own', roomCapacity: cap }).reason).toBe('room-full');
  });
});

describe('canAddManualGuest (D-A)', () => {
  it('allowed below 4 participants', () => {
    expect(canAddManualGuest(3, 12)).toBe(true);
  });
  it('blocked at 4 participants even in a Premium room', () => {
    expect(canAddManualGuest(4, 12)).toBe(false);
    expect(canAddManualGuest(4, 4)).toBe(false);
  });
});

describe('planSpotifyEnable (D-B)', () => {
  const opts = { hostIsRegistered: true, allAtOnceEntitled: true };

  it('removes guests and registered host-device players, keeps registered own-device players', () => {
    const plan = planSpotifyEnable(
      [
        host,
        own('reg-own', { spotifyAttested: true }),
        onHost('reg-host'),
        own('guest-own', { isRegistered: false }),
        onHost('guest-manual', { isRegistered: false }),
      ],
      opts,
    );
    expect(plan.toRemove.sort()).toEqual(['guest-manual', 'guest-own', 'reg-host']);
    expect(plan.remaining).toEqual(['reg-own']);
    expect(plan.blockingUnattested).toEqual([]);
    expect(plan.hostIneligible).toBe(false);
  });

  it('only remaining participants are checked for attestation', () => {
    const plan = planSpotifyEnable(
      [host, own('a', { spotifyAttested: false }), onHost('b', { spotifyAttested: false }),
        own('g', { isRegistered: false, spotifyAttested: false })],
      opts,
    );
    expect(plan.blockingUnattested).toEqual(['a']);
    expect(plan.toRemove.sort()).toEqual(['b', 'g']);
  });

  it('players who left are ignored', () => {
    const plan = planSpotifyEnable([host, onHost('b', { hasLeft: true })], opts);
    expect(plan.toRemove).toEqual([]);
  });

  it('Guest Host can never enable Spotify', () => {
    expect(planSpotifyEnable([host], { ...opts, hostIsRegistered: false }).hostIneligible).toBe(true);
  });

  it('Spotify is ineligible when All at Once is not entitled', () => {
    expect(planSpotifyEnable([host], { ...opts, allAtOnceEntitled: false }).hostIneligible).toBe(true);
  });
});

describe('spotifyJoinBlock', () => {
  it('no block when Spotify is off', () => {
    expect(spotifyJoinBlock({ isRegistered: false, deviceMode: 'host' }, false)).toBeNull();
  });
  it('registered own-device joiner allowed', () => {
    expect(spotifyJoinBlock({ isRegistered: true, deviceMode: 'own' }, true)).toBeNull();
  });
  it('registered host-device joiner → own-device-required', () => {
    expect(spotifyJoinBlock({ isRegistered: true, deviceMode: 'host' }, true)).toBe('own-device-required');
  });
  it('guest blocked regardless of device', () => {
    expect(spotifyJoinBlock({ isRegistered: false, deviceMode: 'own' }, true)).toBe('guest-not-allowed');
    expect(spotifyJoinBlock({ isRegistered: false, deviceMode: 'host' }, true)).toBe('guest-not-allowed');
  });
});

describe('feature gates + entitlements', () => {
  it('defaults: multiplayerV2 off, All at Once for everyone', () => {
    expect(DEFAULT_FEATURE_GATES).toEqual({ multiplayerV2: false, allAtOnce: 'everyone' });
    expect(parseFeatureGates(null)).toEqual(DEFAULT_FEATURE_GATES);
    expect(parseFeatureGates('nope')).toEqual(DEFAULT_FEATURE_GATES);
  });

  it('parses valid fields and falls back per field', () => {
    expect(parseFeatureGates({ multiplayerV2: true, allAtOnce: 'premium' }))
      .toEqual({ multiplayerV2: true, allAtOnce: 'premium' });
    expect(parseFeatureGates({ multiplayerV2: 'yes', allAtOnce: 'premium' }))
      .toEqual({ multiplayerV2: false, allAtOnce: 'premium' });
    expect(parseFeatureGates({ multiplayerV2: true, allAtOnce: 'vip' }))
      .toEqual({ multiplayerV2: true, allAtOnce: 'everyone' });
  });

  it("launch ('everyone'): All at Once for free hosts and Guest Hosts", () => {
    const gates = { multiplayerV2: true, allAtOnce: 'everyone' as const };
    expect(canUse('allAtOnce', { isPremium: false, isGuestHost: false }, gates)).toBe(true);
    expect(canUse('allAtOnce', { isPremium: false, isGuestHost: true }, gates)).toBe(true);
  });

  it("later ('premium'): only Premium registered hosts", () => {
    const gates = { multiplayerV2: true, allAtOnce: 'premium' as const };
    expect(canUse('allAtOnce', { isPremium: true, isGuestHost: false }, gates)).toBe(true);
    expect(canUse('allAtOnce', { isPremium: false, isGuestHost: false }, gates)).toBe(false);
    expect(canUse('allAtOnce', { isPremium: true, isGuestHost: true }, gates)).toBe(false);
  });

  it('entitlement feeds the resolver: losing it falls back to 1 by 1', () => {
    const gates = { multiplayerV2: true, allAtOnce: 'premium' as const };
    const entitled = canUse('allAtOnce', { isPremium: false, isGuestHost: false }, gates);
    const r = resolveGameFlow({ ...base, allAtOnceEntitled: entitled, participants: [host, own('a')] });
    expect(r.gameMode).toBe(ONE_BY_ONE);
  });
});

// ─── Step 2: device choice data model ───
import {
  deviceModeFromRow,
  isDeviceMode,
  resolveJoinDeviceMode,
} from '../../../src/utils/gameFlow';

describe('deviceModeFromRow', () => {
  const row = (o: Partial<{ is_host: boolean; device_mode: string | null; type: string; user_id: string | null }>) => ({
    is_host: false,
    device_mode: null,
    type: 'registered',
    user_id: 'u1',
    ...o,
  });

  it('host is always own, even if a value is stored', () => {
    expect(deviceModeFromRow(row({ is_host: true, device_mode: 'host' }))).toBe('own');
  });
  it('stored value wins for non-hosts', () => {
    expect(deviceModeFromRow(row({ device_mode: 'host' }))).toBe('host');
    expect(deviceModeFromRow(row({ device_mode: 'own' }))).toBe('own');
  });
  it('host-added guest (guest + no user_id) is host', () => {
    expect(deviceModeFromRow(row({ type: 'guest', user_id: null }))).toBe('host');
  });
  it('self-joined guest without a stored value is legacy (undefined)', () => {
    expect(deviceModeFromRow(row({ type: 'guest', user_id: 'anon' }))).toBeUndefined();
  });
  it('legacy registered row is undefined; garbage values are ignored', () => {
    expect(deviceModeFromRow(row({}))).toBeUndefined();
    expect(deviceModeFromRow(row({ device_mode: 'phone' }))).toBeUndefined();
  });
  it('missing column (pre-0063 row) behaves like null', () => {
    expect(deviceModeFromRow({ is_host: false, type: 'registered', user_id: 'u' })).toBeUndefined();
  });
});

describe('resolveJoinDeviceMode', () => {
  it('explicit choice wins in any room', () => {
    expect(resolveJoinDeviceMode('host', false)).toBe('host');
    expect(resolveJoinDeviceMode('own', true)).toBe('own');
  });
  it('v2 room without a choice defaults to own', () => {
    expect(resolveJoinDeviceMode(undefined, true)).toBe('own');
  });
  it('legacy room without a choice writes nothing', () => {
    expect(resolveJoinDeviceMode(undefined, false)).toBeUndefined();
  });
  it('invalid param is ignored', () => {
    expect(resolveJoinDeviceMode('banana', false)).toBeUndefined();
    expect(resolveJoinDeviceMode('banana', true)).toBe('own');
  });
  it('isDeviceMode guards', () => {
    expect(isDeviceMode('own')).toBe(true);
    expect(isDeviceMode('host')).toBe(true);
    expect(isDeviceMode(null)).toBe(false);
  });
});

// ─── Step 3: server rule parsing ───
import {
  joinRejectionMessage,
  parseFrozenGameConfig,
  parseServerRejection,
  startRejectionMessage,
} from '../../../src/utils/gameFlow';

describe('parseServerRejection', () => {
  it('reads kind + reason from a Postgres exception message', () => {
    expect(parseServerRejection('qv_join_rejected:game_started')).toEqual({ kind: 'join', reason: 'game_started' });
    expect(parseServerRejection('ERROR: qv_start_rejected:roster_changed')).toEqual({ kind: 'start', reason: 'roster_changed' });
    expect(parseServerRejection('qv_spotify_rejected:unattested')).toEqual({ kind: 'spotify', reason: 'unattested' });
  });
  it('ignores unrelated errors', () => {
    expect(parseServerRejection('new row violates row-level security policy')).toBeNull();
    expect(parseServerRejection(undefined)).toBeNull();
  });
});

describe('parseFrozenGameConfig', () => {
  const valid = {
    version: 1,
    gameMode: 'pass-the-phone',
    override: true,
    spotifyEnabled: false,
    allAtOnceAllowed: true,
    participants: [
      { playerId: '1', isHost: true, deviceMode: 'own', registered: true },
      { playerId: 'g1', isHost: false, deviceMode: 'host', registered: false },
    ],
  };
  it('parses the RPC snapshot and keeps participant order', () => {
    const c = parseFrozenGameConfig(valid)!;
    expect(c.gameMode).toBe('pass-the-phone');
    expect(c.participants.map((p) => p.playerId)).toEqual(['1', 'g1']);
    expect(c.participants[1].deviceMode).toBe('host');
  });
  it('null / legacy / malformed → null', () => {
    expect(parseFrozenGameConfig(null)).toBeNull();
    expect(parseFrozenGameConfig({ ...valid, gameMode: 'remote-1v1' })).toBeNull();
    expect(parseFrozenGameConfig({ ...valid, participants: [] })).toBeNull();
    expect(parseFrozenGameConfig({ ...valid, participants: [{ isHost: true }] })).toBeNull();
  });
  it('unknown device falls back to own', () => {
    const c = parseFrozenGameConfig({ ...valid, participants: [{ playerId: 'x', deviceMode: 'tv' }] })!;
    expect(c.participants[0].deviceMode).toBe('own');
  });
});

describe('rejection copy', () => {
  it('uses the agreed Own Device Required texts', () => {
    expect(joinRejectionMessage('own_device_required')).toEqual({
      title: 'Own Device Required',
      message: "This room requires you to play on your own device. Please select 'On my own device' to join.",
    });
    expect(joinRejectionMessage('spotify_own_device_required').message).toContain('Spotify is enabled in this lobby.');
  });
  it('unknown reasons fall back to a generic message', () => {
    expect(startRejectionMessage('???').title).toBe('Cannot start game');
    expect(joinRejectionMessage('???').title).toBe('Could not join');
  });
});

describe('Spotify removal copy (C2)', () => {
  it('a tombstoned player gets the removed message', () => {
    expect(parseServerRejection('qv_join_rejected:removed')).toEqual({ kind: 'join', reason: 'removed' });
    expect(joinRejectionMessage('removed').title).toBe('Removed from lobby');
  });
});

// ─── Step 6: join device step ───
import {
  evaluateDeviceChoice,
  lockedDeviceForRejoin,
  needsDeviceStep,
} from '../../../src/utils/gameFlow';

describe('needsDeviceStep', () => {
  it('only standard multiplayer v2 rooms ask', () => {
    expect(needsDeviceStep({ multiplayerV2: true })).toBe(true);
    expect(needsDeviceStep({ multiplayerV2: false })).toBe(false);
    expect(needsDeviceStep({ multiplayerV2: true, isRemote1v1: true })).toBe(false);
    expect(needsDeviceStep({ multiplayerV2: true, rematchLocked: true })).toBe(false);
    expect(needsDeviceStep({ multiplayerV2: true, singlePlayer: true })).toBe(false);
  });
});

describe('lockedDeviceForRejoin (reconnection keeps the device)', () => {
  const roster = [
    { name: 'Host', isHost: true, deviceMode: 'own' as const },
    { name: 'Anna-1', deviceMode: 'host' as const },
    { name: 'Bo', hasLeft: true, deviceMode: 'host' as const },
    { name: 'Cia' },
  ];
  it('live row with a device → that device (case-insensitive)', () => {
    expect(lockedDeviceForRejoin(roster, ' anna-1 ')).toBe('host');
  });
  it('left row → no lock (leave + rejoin may change device)', () => {
    expect(lockedDeviceForRejoin(roster, 'Bo')).toBeUndefined();
  });
  it('row without stored device, unknown name, host name, no roster → undefined', () => {
    expect(lockedDeviceForRejoin(roster, 'Cia')).toBeUndefined();
    expect(lockedDeviceForRejoin(roster, 'Zed')).toBeUndefined();
    expect(lockedDeviceForRejoin(roster, 'Host')).toBeUndefined();
    expect(lockedDeviceForRejoin(null, 'Anna-1')).toBeUndefined();
    expect(lockedDeviceForRejoin(roster, '')).toBeUndefined();
  });
});

describe('evaluateDeviceChoice', () => {
  const base = { isRegistered: true, spotifyEnabled: false, currentTotal: 2, roomCapacity: 4 };
  it('free lobby: both devices ok', () => {
    expect(evaluateDeviceChoice({ ...base, choice: 'own' })).toEqual({ outcome: 'ok' });
    expect(evaluateDeviceChoice({ ...base, choice: 'host' })).toEqual({ outcome: 'ok' });
  });
  it('4 players in a 12-cap lobby: host device → Own Device Required (stay), own ok', () => {
    const s = { ...base, currentTotal: 4, roomCapacity: 12 };
    expect(evaluateDeviceChoice({ ...s, choice: 'host' })).toEqual({ outcome: 'stay', reason: 'own_device_required' });
    expect(evaluateDeviceChoice({ ...s, choice: 'own' })).toEqual({ outcome: 'ok' });
  });
  it('total capacity reached → Lobby is full for BOTH choices (never Own Device Required)', () => {
    const s = { ...base, currentTotal: 4, roomCapacity: 4 };
    expect(evaluateDeviceChoice({ ...s, choice: 'host' })).toEqual({ outcome: 'abort', reason: 'room_full' });
    expect(evaluateDeviceChoice({ ...s, choice: 'own' })).toEqual({ outcome: 'abort', reason: 'room_full' });
    const p = { ...base, currentTotal: 12, roomCapacity: 12 };
    expect(evaluateDeviceChoice({ ...p, choice: 'host' })).toEqual({ outcome: 'abort', reason: 'room_full' });
  });
  it('Spotify on: registered host-device → stay; registered own ok; guest aborts', () => {
    const s = { ...base, spotifyEnabled: true };
    expect(evaluateDeviceChoice({ ...s, choice: 'host' })).toEqual({ outcome: 'stay', reason: 'spotify_own_device_required' });
    expect(evaluateDeviceChoice({ ...s, choice: 'own' })).toEqual({ outcome: 'ok' });
    expect(evaluateDeviceChoice({ ...s, isRegistered: false, choice: 'own' })).toEqual({ outcome: 'abort', reason: 'spotify_guest' });
    expect(evaluateDeviceChoice({ ...s, isRegistered: false, choice: 'host' })).toEqual({ outcome: 'abort', reason: 'spotify_guest' });
  });
  it('full room wins over Spotify messages', () => {
    expect(
      evaluateDeviceChoice({ ...base, spotifyEnabled: true, currentTotal: 4, roomCapacity: 4, choice: 'host' }),
    ).toEqual({ outcome: 'abort', reason: 'room_full' });
  });
  it('guest without Spotify: both devices follow the capacity rule', () => {
    const s = { ...base, isRegistered: false };
    expect(evaluateDeviceChoice({ ...s, choice: 'host' })).toEqual({ outcome: 'ok' });
    expect(evaluateDeviceChoice({ ...s, currentTotal: 4, roomCapacity: 12, choice: 'host' })).toEqual({
      outcome: 'stay',
      reason: 'own_device_required',
    });
  });
});

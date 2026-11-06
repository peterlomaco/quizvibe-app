// Multiplayer v2 Step 5 — lobby wiring of the flow resolver.
//
// Covers the rules the lobby relies on: player → participant mapping, the
// host override surviving a forced 1 by 1 (and being cleared only by
// Spotify), manual-guest capacity against the RESULTING flow, and the round
// clamp applied at Start from the frozen game mode.

import { describe, it, expect } from 'vitest';
import {
  ALL_AT_ONCE,
  ONE_BY_ONE,
  canAddManualGuest,
  clampRoundsForFlow,
  flowReasonText,
  resolveGameFlow,
  roomCapacity,
  toFlowParticipants,
  type LobbyFlowPlayer,
} from '../../../src/utils/gameFlow';

const host: LobbyFlowPlayer = { id: '1', isHost: true, type: 'registered', approved: true, deviceMode: 'own' };
const ownUser = (id: string, extra: Partial<LobbyFlowPlayer> = {}): LobbyFlowPlayer => ({
  id, type: 'registered', approved: true, deviceMode: 'own', ...extra,
});
const manualGuest = (id: string): LobbyFlowPlayer => ({ id, type: 'guest', approved: true, deviceMode: 'host' });

function flowFor(players: LobbyFlowPlayer[], override: boolean, spotify = false, entitled = true) {
  return resolveGameFlow({
    participants: toFlowParticipants(players),
    hostOverrideOneByOne: override,
    spotifyEnabled: spotify,
    allAtOnceEntitled: entitled,
  });
}

describe('toFlowParticipants', () => {
  it('maps registration, device, approval and attestation', () => {
    const [h, g, w] = toFlowParticipants([
      host,
      manualGuest('g'),
      ownUser('w', { approved: false, spotifyConnected: true }),
    ]);
    expect(h).toMatchObject({ isHost: true, approved: true, isRegistered: true });
    expect(g).toMatchObject({ isRegistered: false, deviceMode: 'host', approved: true });
    expect(w).toMatchObject({ approved: false, spotifyAttested: true });
  });

  it('a WAITING host-device player does not force 1 by 1', () => {
    const waiting = { ...manualGuest('g'), approved: false };
    expect(flowFor([host, ownUser('a'), waiting], false).gameMode).toBe(ALL_AT_ONCE);
  });
});

describe('host override persistence (final clarification 2)', () => {
  it('override OFF: guest forces 1 by 1, guest leaves → All at Once', () => {
    expect(flowFor([host, ownUser('a'), manualGuest('g')], false).gameMode).toBe(ONE_BY_ONE);
    expect(flowFor([host, ownUser('a'), { ...manualGuest('g'), hasLeft: true }], false).gameMode).toBe(ALL_AT_ONCE);
  });

  it('override ON: guest forces 1 by 1 (override hidden), guest leaves → still 1 by 1', () => {
    const forced = flowFor([host, ownUser('a'), manualGuest('g')], true);
    expect(forced.gameMode).toBe(ONE_BY_ONE);
    expect(forced.reason).toBe('host-device-participant');
    expect(forced.overrideAvailable).toBe(false);
    const after = flowFor([host, ownUser('a')], true);
    expect(after.gameMode).toBe(ONE_BY_ONE);
    expect(after.reason).toBe('override');
    expect(after.overrideAvailable).toBe(true);
  });

  it('Spotify wins over the override (lobby then clears it)', () => {
    const f = flowFor([host, ownUser('a', { spotifyConnected: true })], true, true);
    expect(f.gameMode).toBe(ALL_AT_ONCE);
    expect(f.reason).toBe('spotify');
    expect(f.overrideApplied).toBe(false);
  });

  it('not entitled → 1 by 1 regardless of override', () => {
    expect(flowFor([host, ownUser('a')], false, false, false).gameMode).toBe(ONE_BY_ONE);
  });

  it('override unavailable with more than 4 players', () => {
    const five = [host, ownUser('a'), ownUser('b'), ownUser('c'), ownUser('d')];
    const f = flowFor(five, true);
    expect(f.overrideAvailable).toBe(false);
    expect(f.gameMode).toBe(ALL_AT_ONCE);
  });
});

describe('manual guest capacity uses the resulting 1 by 1 flow (clarification 1)', () => {
  it('4 present in an All at Once Premium room (cap 12) → blocked', () => {
    expect(roomCapacity(ALL_AT_ONCE, true)).toBe(12);
    expect(canAddManualGuest(4, roomCapacity(ALL_AT_ONCE, true))).toBe(false);
  });
  it('3 present → allowed', () => {
    expect(canAddManualGuest(3, roomCapacity(ALL_AT_ONCE, true))).toBe(true);
  });
});

describe('clampRoundsForFlow (final verification)', () => {
  it('1 by 1 caps at 4 even if the lobby still shows 20', () => {
    expect(clampRoundsForFlow(20, ONE_BY_ONE)).toBe(4);
    expect(clampRoundsForFlow(2, ONE_BY_ONE)).toBe(2);
  });
  it('All at Once keeps the chosen count', () => {
    expect(clampRoundsForFlow(20, ALL_AT_ONCE)).toBe(20);
  });
});

describe('flowReasonText', () => {
  it('explains forced flows only', () => {
    expect(flowReasonText('host-device-participant')).toMatch(/1 by 1/);
    expect(flowReasonText('spotify')).toMatch(/All at Once/);
    expect(flowReasonText('default')).toBeNull();
    expect(flowReasonText('override')).toBeNull();
  });
});

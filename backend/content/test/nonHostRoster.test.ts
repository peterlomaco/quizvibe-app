import { describe, expect, it } from 'vitest';
import { buildNonHostRoster } from '../../../src/utils/nonHostRoster';

// Build 41 (2026-11-26): the non-host roster for /quiz (Individual Devices +
// Pass-the-Phone follower). Regression: an approved guest who left before
// the start appeared on the non-host's Final Leaderboard in legacy rooms.

const host = { id: '1', isHost: true, approved: true, hasLeft: false, name: 'Peter-99' };
const peter1 = { id: 'joiner-p1', approved: true, hasLeft: false, name: 'Peter-1' };
const leftGuestA = { id: 'guest-a', approved: true, hasLeft: true, name: 'GuestP-8834867' };
const leftGuestB = { id: 'guest-b', approved: true, hasLeft: true, name: 'GuestT-1505884' };
const waiting = { id: 'joiner-w', approved: false, hasLeft: false, name: 'Waiting' };

describe('buildNonHostRoster — legacy rooms', () => {
  it('drops approved guests who left before the game started', () => {
    const roster = buildNonHostRoster([host, leftGuestA, leftGuestB, peter1], null);
    expect(roster.map((p) => p.id)).toEqual(['1', 'joiner-p1']);
  });

  it('keeps the host and approved players, drops unapproved ones', () => {
    expect(buildNonHostRoster([host, peter1, waiting], null).map((p) => p.id)).toEqual(['1', 'joiner-p1']);
  });

  it('a player who left and rejoined (hasLeft false again) is included', () => {
    const rejoined = { ...leftGuestA, hasLeft: false };
    expect(buildNonHostRoster([host, rejoined], null).map((p) => p.id)).toEqual(['1', 'guest-a']);
  });

  it('missing hasLeft (older rows) counts as present', () => {
    const noFlag = { id: 'x', approved: true };
    expect(buildNonHostRoster([noFlag], undefined).map((p) => p.id)).toEqual(['x']);
  });

  it('no roster → empty', () => {
    expect(buildNonHostRoster(null, null)).toEqual([]);
  });
});

describe('buildNonHostRoster — v2 frozen roster (unchanged)', () => {
  it('returns exactly the frozen participants in frozen order', () => {
    const roster = buildNonHostRoster([host, peter1, waiting], ['joiner-p1', '1']);
    expect(roster.map((p) => p.id)).toEqual(['joiner-p1', '1']);
  });

  it('frozen ids missing from the stored rows are skipped', () => {
    expect(buildNonHostRoster([host], ['1', 'gone']).map((p) => p.id)).toEqual(['1']);
  });

  it('the frozen roster is authoritative even for a row marked left', () => {
    // A frozen participant's own row may be re-claimed (0064/0065); v2 keeps
    // the server's frozen list as-is.
    expect(buildNonHostRoster([host, leftGuestA], ['1', 'guest-a']).map((p) => p.id)).toEqual(['1', 'guest-a']);
  });
});

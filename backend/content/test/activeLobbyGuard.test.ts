import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Ett konto, ett spel åt gången (Peter 2026-11-26). checkActiveElsewhere är
 * en HÅRD spärr mot en annan enhet: ingen "Continue here", den andra enhetens
 * spel rörs aldrig. Egna kvarlämnade rader på samma enhet städas tyst, och ett
 * startat Remote 1vs1-rum spärrar inte.
 */
const h = vi.hoisted(() => ({
  memberships: [] as { roomCode: string; playerId: string; isHost: boolean }[],
  ledger: new Set<string>(),
  meta: new Map<string, { isRemote1v1?: boolean; gameStarted: boolean }>(),
  left: [] as string[],
  alerts: [] as { title: string; buttons: { text: string }[] }[],
}));

vi.mock('../../../src/utils/mockLobbyPlayers', () => ({
  findOtherActiveMembershipsForUser: async (exclude?: string) =>
    h.memberships.filter((m) => m.roomCode !== exclude?.toUpperCase()),
  leaveOtherActiveMemberships: async (ms: { roomCode: string }[]) => {
    h.left.push(...ms.map((m) => m.roomCode));
  },
}));
vi.mock('../../../src/utils/ownLobbyLedger', () => ({
  getOwnMembershipKeys: async () => h.ledger,
}));
vi.mock('../../../src/utils/mockActiveRooms', () => ({
  getRoomMeta: async (code: string) => h.meta.get(code),
}));
vi.mock('../../../src/utils/quizVibeAlert', () => ({
  quizVibeAlert: (title: string, _msg: string, buttons: { text: string; onPress?: () => void }[]) => {
    h.alerts.push({ title, buttons });
    buttons[0]?.onPress?.();
  },
}));

const { checkActiveElsewhere } = await import('../../../src/utils/activeLobbyGuard');

beforeEach(() => {
  h.memberships = [];
  h.ledger = new Set();
  h.meta = new Map();
  h.left = [];
  h.alerts = [];
});

describe('checkActiveElsewhere — ett spel per konto', () => {
  it('inget aktivt deltagande → fritt fram', async () => {
    expect(await checkActiveElsewhere()).toBe(false);
    expect(h.alerts).toEqual([]);
  });

  it('lobby/spel på en ANNAN enhet → hård spärr, bara OK, den andra enheten rörs inte', async () => {
    h.memberships = [{ roomCode: 'AB23XY', playerId: '1', isHost: true }];
    h.meta.set('AB23XY', { gameStarted: true });
    expect(await checkActiveElsewhere()).toBe(true);
    expect(h.alerts).toHaveLength(1);
    expect(h.alerts[0].buttons.map((b) => b.text)).toEqual(['OK']);
    expect(h.left).toEqual([]);
  });

  it('spärren gäller redan i lobby-fasen (spelet ej startat)', async () => {
    h.memberships = [{ roomCode: 'AB23XY', playerId: 'joiner-1', isHost: false }];
    h.meta.set('AB23XY', { gameStarted: false });
    expect(await checkActiveElsewhere()).toBe(true);
  });

  it('egna kvarlämnade rader på samma enhet städas tyst utan popup', async () => {
    h.memberships = [{ roomCode: 'OLD123', playerId: '1', isHost: true }];
    h.ledger.add('OLD123:1');
    expect(await checkActiveElsewhere()).toBe(false);
    expect(h.left).toEqual(['OLD123']);
    expect(h.alerts).toEqual([]);
  });

  it('ett startat Remote 1vs1-rum spärrar inte (asynkron duell)', async () => {
    h.memberships = [{ roomCode: 'RM11AA', playerId: '1', isHost: true }];
    h.meta.set('RM11AA', { isRemote1v1: true, gameStarted: true });
    expect(await checkActiveElsewhere()).toBe(false);
  });

  it('en Remote 1vs1-LOBBY som inte startat spärrar', async () => {
    h.memberships = [{ roomCode: 'RM11AA', playerId: '1', isHost: true }];
    h.meta.set('RM11AA', { isRemote1v1: true, gameStarted: false });
    expect(await checkActiveElsewhere()).toBe(true);
  });

  it('rummet man själv är på väg in i undantas', async () => {
    h.memberships = [{ roomCode: 'AB23XY', playerId: 'joiner-1', isHost: false }];
    expect(await checkActiveElsewhere('ab23xy')).toBe(false);
  });
});

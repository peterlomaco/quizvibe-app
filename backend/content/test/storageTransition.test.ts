import { describe, expect, it } from 'vitest';
import {
  cacheBelongsTo,
  parseStoredSessionUser,
  pickBackfillIdentity,
  projectRefFromUrl,
} from '../../../src/utils/sessionIdentity';
import {
  MIGRATED_PREFERENCE_FIELDS,
  PROTECTED_SESSION_REFS,
  deviceKeyFor,
  isForeignSessionKey,
  isLegacyKey,
  planTransition,
  runTransition,
  transitionMarkerKey,
  userKeyFor,
  type TransitionIO,
} from '../../../src/utils/storageTransition';

/**
 * Build 41 (2026-11-26) — engångsövergång till projekt- och kontoscopad lagring.
 * Ren logik: inga native-moduler behövs.
 */

const REF = 'prodref';
const STAGING = 'stagref';
const session = (user: Record<string, unknown>) =>
  JSON.stringify({ access_token: 'a', refresh_token: 'r', user });

function memIO(initial: Record<string, string>, failOn?: 'multiRemove' | 'multiSet' | 'marker') {
  const store = new Map(Object.entries(initial));
  let fail = failOn;
  const io: TransitionIO & { store: Map<string, string>; heal(): void } = {
    store,
    heal() {
      fail = undefined;
    },
    async getItem(k) {
      return store.get(k) ?? null;
    },
    async getAllKeys() {
      return [...store.keys()];
    },
    async multiSet(pairs) {
      if (fail === 'multiSet') throw new Error('disk full');
      pairs.forEach(([k, v]) => store.set(k, v));
    },
    async multiRemove(keys) {
      if (fail === 'multiRemove') throw new Error('crash');
      keys.forEach((k) => store.delete(k));
    },
    async setItem(k, v) {
      if (fail === 'marker' && k === transitionMarkerKey(REF)) throw new Error('crash');
      store.set(k, v);
    },
  };
  return io;
}

describe('sessionIdentity', () => {
  it('projectRefFromUrl tar första host-segmentet', () => {
    expect(projectRefFromUrl('https://pyndq.supabase.co')).toBe('pyndq');
    expect(projectRefFromUrl('https://tottb.supabase.co/')).toBe('tottb');
  });

  it('parseStoredSessionUser kräver refresh_token och user.id', () => {
    expect(parseStoredSessionUser(null)).toBeNull();
    expect(parseStoredSessionUser('not json')).toBeNull();
    expect(parseStoredSessionUser(JSON.stringify({ user: { id: 'u' } }))).toBeNull();
    expect(parseStoredSessionUser(session({ id: 'u', email: 'A@x.se' }))).toMatchObject({
      id: 'u',
      isAnonymous: false,
    });
    expect(parseStoredSessionUser(session({ id: 'g', is_anonymous: true }))?.isAnonymous).toBe(true);
  });

  it('cacheBelongsTo: uid först, e-post som fallback, utan e-post = INTE ägd', () => {
    const user = { id: 'u1', email: 'anna@x.se' };
    expect(cacheBelongsTo({ ownerUserId: 'u1' }, user)).toBe(true);
    expect(cacheBelongsTo({ ownerUserId: 'u2', email: 'anna@x.se' }, user)).toBe(false);
    expect(cacheBelongsTo({ email: 'ANNA@x.se' }, user)).toBe(true);
    expect(cacheBelongsTo({ email: 'bo@x.se' }, user)).toBe(false);
    expect(cacheBelongsTo({}, user)).toBe(false);
    expect(cacheBelongsTo({ email: 'anna@x.se' }, { id: 'u1', email: null })).toBe(false);
    expect(cacheBelongsTo(null, user)).toBe(false);
  });

  it('pickBackfillIdentity: metadata > ägd cache > e-postprefix', () => {
    const user = { id: 'u1', email: 'anna@x.se' };
    const foreignCache = { playerName: 'Goran', email: 'goran@x.se', birthYear: 1960 };
    expect(pickBackfillIdentity({ playerName: 'Anna' }, foreignCache, user).playerName).toBe('Anna');
    expect(pickBackfillIdentity(undefined, foreignCache, user).playerName).not.toBe('Goran');
    expect(
      pickBackfillIdentity(undefined, { playerName: 'Anna-1', ownerUserId: 'u1' }, user).playerName,
    ).toBe('Anna-1');
  });
});

describe('planTransition', () => {
  it('rensar bara legacy-nycklar och sessioner från ANDRA projekt', () => {
    const keys = [
      '@quizvibe/profile/v1',
      '@quizvibe/gameHistory/v1/anna',
      '@quizvibe/hcpProgress/v2/sweden/anna',
      '@quizvibe/migration/historyV5Reset/v1',
      `sb-${STAGING}-auth-token`,
      `sb-${REF}-auth-token`,
      `sb-${REF}-auth-token-code-verifier`,
      '@quizvibe/u/prodref/u1/profile',
      '@quizvibe/env/prodref/featureGates',
      '@quizvibe/device/home/guestStartBtnY',
      'some-other-lib-key',
      '@quizvibe/somethingNew/v9',
    ];
    const { deletes } = planTransition({ ref: REF, keys, values: {} });
    expect(deletes.sort()).toEqual(
      [
        '@quizvibe/profile/v1',
        '@quizvibe/gameHistory/v1/anna',
        '@quizvibe/hcpProgress/v2/sweden/anna',
        '@quizvibe/migration/historyV5Reset/v1',
        `sb-${STAGING}-auth-token`,
      ].sort(),
    );
  });

  it('behåller nuvarande projekts giltiga session', () => {
    expect(isForeignSessionKey(`sb-${REF}-auth-token`, REF)).toBe(false);
    expect(isForeignSessionKey(`sb-${STAGING}-auth-token-user`, REF)).toBe(true);
    expect(isLegacyKey(`sb-${REF}-auth-token`)).toBe(false);
  });

  it('flyttar endast de godkända preferensfälten, och bara vid e-postmatch', () => {
    const legacy = {
      playerName: 'Goran',
      email: 'anna@x.se',
      hcp: 12,
      gameCredits: 999,
      freeGameCredits: 50,
      voice: 'hype',
      parentControlEnabled: false,
      spotifyAppConfirmed: true,
      spotifyDefaultEnabled: true,
      spotifyAnswerYear: true,
      spotifyAnswerName: false,
    };
    const { writes } = planTransition({
      ref: REF,
      keys: [],
      values: {
        '@quizvibe/profile/v1': JSON.stringify(legacy),
        [`sb-${REF}-auth-token`]: session({ id: 'u1', email: 'Anna@X.se' }),
      },
    });
    expect(writes).toHaveLength(1);
    expect(writes[0].key).toBe(userKeyFor(REF, 'u1', 'legacyPrefs'));
    const moved = JSON.parse(writes[0].value);
    expect(Object.keys(moved).sort()).toEqual([...MIGRATED_PREFERENCE_FIELDS].sort());
    // Identitet, Premium, credits och HCP följer ALDRIG med.
    expect(moved.playerName).toBeUndefined();
    expect(moved.hcp).toBeUndefined();
    expect(moved.gameCredits).toBeUndefined();
  });

  it('migrerar inget vid e-post-mismatch, anonym session, saknad e-post eller annan projekt-session', () => {
    const legacy = JSON.stringify({ email: 'goran@x.se', voice: 'hype' });
    const cases: Record<string, string | null>[] = [
      { '@quizvibe/profile/v1': legacy, [`sb-${REF}-auth-token`]: session({ id: 'u1', email: 'anna@x.se' }) },
      { '@quizvibe/profile/v1': legacy, [`sb-${REF}-auth-token`]: session({ id: 'g', is_anonymous: true }) },
      { '@quizvibe/profile/v1': JSON.stringify({ voice: 'hype' }), [`sb-${REF}-auth-token`]: session({ id: 'u1', email: 'goran@x.se' }) },
      { '@quizvibe/profile/v1': legacy },
      { '@quizvibe/profile/v1': 'garbage', [`sb-${REF}-auth-token`]: session({ id: 'u1', email: 'goran@x.se' }) },
    ];
    for (const values of cases) {
      expect(planTransition({ ref: REF, keys: [], values }).writes).toEqual([]);
    }
  });

  it('flyttar Home-layoutvärdet till device-nyckeln', () => {
    const { writes } = planTransition({
      ref: REF,
      keys: ['@quizvibe/home/guestStartBtnY/v1'],
      values: { '@quizvibe/home/guestStartBtnY/v1': '412' },
    });
    expect(writes).toEqual([{ key: deviceKeyFor('home/guestStartBtnY'), value: '412' }]);
  });
});

describe('runTransition', () => {
  const seed = () => ({
    '@quizvibe/profile/v1': JSON.stringify({ email: 'anna@x.se', voice: 'deep', playerName: 'Anna' }),
    '@quizvibe/friends/v1/anna': '[]',
    [`sb-${REF}-auth-token`]: session({ id: 'u1', email: 'anna@x.se' }),
    [`sb-${STAGING}-auth-token`]: session({ id: 's1', email: 'anna@x.se' }),
    unrelated: 'keep',
  });

  it('kör en gång, behåller sessionen och okänd data, sätter markören sist', async () => {
    const io = memIO(seed());
    expect(await runTransition(io, REF)).toBe('completed');
    expect(io.store.has(`sb-${REF}-auth-token`)).toBe(true);
    expect(io.store.has(`sb-${STAGING}-auth-token`)).toBe(false);
    expect(io.store.has('@quizvibe/profile/v1')).toBe(false);
    expect(io.store.get('unrelated')).toBe('keep');
    expect(JSON.parse(io.store.get(userKeyFor(REF, 'u1', 'legacyPrefs'))!)).toEqual({ voice: 'deep' });
    expect(io.store.has(transitionMarkerKey(REF))).toBe(true);
  });

  it('är idempotent — andra körningen gör ingenting och rör ny data inte', async () => {
    const io = memIO(seed());
    await runTransition(io, REF);
    io.store.set('@quizvibe/u/prodref/u1/profile', 'new');
    io.store.set('@quizvibe/profile/v1', 'reappeared');
    expect(await runTransition(io, REF)).toBe('skipped');
    expect(io.store.get('@quizvibe/u/prodref/u1/profile')).toBe('new');
    expect(io.store.get('@quizvibe/profile/v1')).toBe('reappeared');
  });

  it('avbruten körning (krasch mitt i rensningen) lämnar ingen markör och slutförs nästa start', async () => {
    const io = memIO(seed(), 'multiRemove');
    expect(await runTransition(io, REF)).toBe('failed');
    expect(io.store.has(transitionMarkerKey(REF))).toBe(false);
    io.heal();
    expect(await runTransition(io, REF)).toBe('completed');
    expect(io.store.has('@quizvibe/friends/v1/anna')).toBe(false);
    expect(JSON.parse(io.store.get(userKeyFor(REF, 'u1', 'legacyPrefs'))!)).toEqual({ voice: 'deep' });
  });

  it('krasch efter rensning men före markör: omkörning är ofarlig', async () => {
    const io = memIO(seed(), 'marker');
    expect(await runTransition(io, REF)).toBe('failed');
    io.heal();
    expect(await runTransition(io, REF)).toBe('completed');
    expect(io.store.has(`sb-${REF}-auth-token`)).toBe(true);
  });

  it('nyinstallation (tom lagring) slutförs utan skrivningar', async () => {
    const io = memIO({});
    expect(await runTransition(io, REF)).toBe('completed');
    expect([...io.store.keys()]).toEqual([transitionMarkerKey(REF)]);
  });

  it('ett staging-bygge i samma app-container raderar aldrig PROD-sessionen', async () => {
    const PROD = PROTECTED_SESSION_REFS[0];
    const io = memIO({
      [`sb-${PROD}-auth-token`]: session({ id: 'p1', email: 'anna@x.se' }),
      [`sb-${REF}-auth-token`]: session({ id: 'u1', email: 'anna@x.se' }),
    });
    expect(await runTransition(io, STAGING)).toBe('completed');
    expect(io.store.has(`sb-${PROD}-auth-token`)).toBe(true);
    expect(io.store.has(`sb-${REF}-auth-token`)).toBe(false);
    // Varje projekt har sin egen markör.
    expect(io.store.has(transitionMarkerKey(STAGING))).toBe(true);
    expect(io.store.has(transitionMarkerKey(REF))).toBe(false);
  });
});

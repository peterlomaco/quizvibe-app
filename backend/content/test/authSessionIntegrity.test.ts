import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TEST_AUTH_KEY, TEST_REF, createFakeAsyncStorage, createFakeSupabase } from './helpers/fakeSupabase';

/**
 * Build 41 (2026-11-26) — flödestester för session- och lagringsintegriteten.
 * Kör de riktiga klientmodulerna (auth, sessionState, storageScope,
 * profileStorage, subscriptionStorage, friendsStorage, gameResults, hcpProgress)
 * mot en AsyncStorage i minnet och en fejkad supabase-js som persisterar
 * sessionen precis som auth-js gör.
 *
 * Modulerna laddas om per test (vi.resetModules) så modul-state (spegel,
 * epok, övergång) börjar om — som en kall app-start.
 */

(globalThis as { __DEV__?: boolean }).__DEV__ = false;

const h = vi.hoisted(() => ({ storage: null as any, fake: null as any }));

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: new Proxy({}, { get: (_t, k) => (h.storage as any)[k] }),
}));
vi.mock('../../../src/utils/supabase', () => ({
  SUPABASE_PROJECT_REF: 'testref',
  SUPABASE_AUTH_STORAGE_KEY: 'sb-testref-auth-token',
  supabase: new Proxy({}, { get: (_t, k) => (h.fake.supabase as any)[k] }),
}));

const ANNA = { id: 'uid-anna', email: 'anna@x.se', user_metadata: { playerName: 'Anna' } };
const BO = { id: 'uid-bo', email: 'bo@x.se', user_metadata: { playerName: 'Bo' } };
const annaRow = { id: ANNA.id, email: ANNA.email, player_name: 'Anna', birth_year: 1980 };
const boRow = { id: BO.id, email: BO.email, player_name: 'Bo', birth_year: 1990 };

async function boot(seed?: (s: ReturnType<typeof createFakeAsyncStorage>, f: ReturnType<typeof createFakeSupabase>) => void) {
  vi.resetModules();
  h.storage = createFakeAsyncStorage();
  h.fake = createFakeSupabase(h.storage);
  h.fake.state.profileRows.set(ANNA.id, annaRow);
  h.fake.state.profileRows.set(BO.id, boRow);
  seed?.(h.storage, h.fake);
  const scope = await import('../../../src/utils/storageScope');
  await scope.storageReady;
  return {
    scope,
    auth: await import('../../../src/utils/auth'),
    profile: await import('../../../src/utils/profileStorage'),
    sessionState: await import('../../../src/utils/sessionState'),
    storage: h.storage as ReturnType<typeof createFakeAsyncStorage>,
    fake: h.fake as ReturnType<typeof createFakeSupabase>,
  };
}

const profileKey = (uid: string) => `@quizvibe/u/${TEST_REF}/${uid}/profile`;

describe('sessionstatus', () => {
  it('skiljer online / offline / gäst / utloggad / okänd', async () => {
    const t = await boot();
    expect((await t.sessionState.getSessionState()).kind).toBe('signedOut');
    t.fake.signIn(ANNA);
    expect((await t.sessionState.getSessionState()).kind).toBe('online');
    t.fake.goOfflineExpired();
    expect((await t.sessionState.getSessionState()).kind).toBe('offline');
    t.storage.setFailReads(true);
    expect((await t.sessionState.getSessionState()).kind).toBe('unknown');
    t.storage.setFailReads(false);
    await t.fake.supabase.auth.signOut();
    t.fake.state.anonUserId = 'anon-x';
    await t.fake.supabase.auth.setSession({ access_token: 'anon-a', refresh_token: 'anon-r' });
    expect((await t.sessionState.getSessionState()).kind).toBe('guest');
  });

  it('en sparad session för ETT ANNAT projekt räknas aldrig', async () => {
    const t = await boot((_s, f) => f.persistForeign('stagref', ANNA));
    expect((await t.sessionState.getSessionState()).kind).toBe('signedOut');
    expect(await t.profile.loadProfile()).toBeNull();
  });

  it('offline-läget ger aldrig serverbehörighet', async () => {
    const t = await boot();
    t.fake.signIn(ANNA);
    await t.profile.loadProfile();
    t.fake.goOfflineExpired();
    expect(await t.profile.canSaveProfileNow()).toBe(false);
    const before = t.fake.state.upserts.length;
    await t.profile.saveProfile({ ...(await t.profile.loadProfile())!, voice: 'deep' });
    expect(t.fake.state.upserts.length).toBe(before);
  });
});

describe('ensureAuthSession', () => {
  it('nätverksfel med utgången token ersätter ALDRIG en registrerad session med anon', async () => {
    const t = await boot();
    t.fake.signIn(ANNA);
    t.fake.goOfflineExpired();
    t.fake.state.refreshMode = 'network';
    expect(await t.auth.ensureAuthSession()).toBeNull();
    expect(t.fake.state.anonCalls).toBe(0);
    expect(JSON.parse(t.storage.store.get(TEST_AUTH_KEY)!).user.id).toBe(ANNA.id);
  });

  it('utgången session återhämtas via refresh när nätet är tillbaka', async () => {
    const t = await boot();
    t.fake.signIn(ANNA);
    t.fake.goOfflineExpired();
    t.fake.state.refreshMode = 'ok';
    expect((await t.auth.ensureAuthSession())?.id).toBe(ANNA.id);
    expect(t.fake.state.anonCalls).toBe(0);
  });

  it('återkallad session → får bli gäst', async () => {
    const t = await boot();
    t.fake.signIn(ANNA);
    t.fake.goOfflineExpired();
    t.fake.state.refreshMode = 'revoked';
    const u = await t.auth.ensureAuthSession();
    expect(u?.is_anonymous).toBe(true);
    expect(t.fake.state.anonCalls).toBe(1);
  });

  it('riktiga gäster får fortfarande en anon-session (host/join funkar)', async () => {
    const t = await boot();
    const u = await t.auth.ensureAuthSession();
    expect(u?.is_anonymous).toBe(true);
    expect((await t.sessionState.getSessionState()).kind).toBe('guest');
  });

  it('samtidiga anrop skapar exakt EN anon-session', async () => {
    const t = await boot();
    t.fake.state.anonDelayMs = 20;
    const [a, b, c] = await Promise.all([
      t.auth.ensureAuthSession(),
      t.auth.ensureAuthSession(),
      t.auth.ensureAuthSession(),
    ]);
    expect(t.fake.state.anonCalls).toBe(1);
    expect(a?.id).toBe(b?.id);
    expect(b?.id).toBe(c?.id);
  });

  it('en inloggning under pågående anon-signup skrivs aldrig över (inkl. persisterad session)', async () => {
    const t = await boot();
    t.fake.state.anonDelayMs = 30;
    const guest = t.auth.ensureAuthSession();
    // Inloggningen går genom auth-låset precis som i appen.
    const login = t.auth.runAuthExclusive(async () => t.fake.signIn(ANNA));
    await Promise.all([guest, login]);
    const stored = JSON.parse(t.storage.store.get(TEST_AUTH_KEY)!);
    expect(stored.user.id).toBe(ANNA.id);
    expect((await t.fake.supabase.auth.getSession()).data.session?.user.id).toBe(ANNA.id);
  });

  it('en registrerad session som persisteras mellan anon-svar och setSession vinner', async () => {
    const t = await boot();
    t.fake.state.anonDelayMs = 30;
    const guest = t.auth.ensureAuthSession();
    // Supabase interna persistering (t.ex. en annan flik/process) utanför låset.
    setTimeout(() => t.fake.signIn(ANNA), 10);
    await guest;
    expect(JSON.parse(t.storage.store.get(TEST_AUTH_KEY)!).user.id).toBe(ANNA.id);
  });
});

describe('profil — ägarskap och läckage', () => {
  it('zombie: lokal profil utan session ger utloggat läge', async () => {
    const t = await boot((s) =>
      s.store.set(profileKey(ANNA.id), JSON.stringify({ playerName: 'Anna', ownerUserId: ANNA.id })),
    );
    expect(await t.profile.loadProfile()).toBeNull();
    expect(t.profile.getCachedProfile()).toBeNull();
  });

  it('gäst har ingen profil och kan inte skriva en', async () => {
    const t = await boot();
    await t.auth.ensureAuthSession();
    expect(await t.profile.loadProfile()).toBeNull();
    await t.profile.saveProfile({ playerName: 'Goran' } as any);
    expect([...t.storage.store.keys()].some((k) => k.includes('/profile'))).toBe(false);
  });

  it('tillfälligt DB-fel raderar inte den lokala profilen', async () => {
    const t = await boot();
    t.fake.signIn(ANNA);
    await t.profile.loadProfile();
    t.fake.state.profileReadError = true;
    const p = await t.profile.loadProfile();
    expect(p?.playerName).toBe('Anna');
    expect(t.storage.store.has(profileKey(ANNA.id))).toBe(true);
  });

  it('offline visar kontots EGEN cache', async () => {
    const t = await boot();
    t.fake.signIn(ANNA);
    await t.profile.loadProfile();
    t.fake.goOfflineExpired();
    expect((await t.profile.loadProfile())?.playerName).toBe('Anna');
  });

  it('kontobyte på samma enhet: Bo ser aldrig Annas profil', async () => {
    const t = await boot();
    t.fake.signIn(ANNA);
    await t.profile.loadProfile();
    await t.fake.supabase.auth.signOut();
    await t.profile.clearProfile();
    t.fake.signIn(BO);
    t.fake.goOfflineExpired();
    // Offline direkt efter bytet: ingen Bo-cache än → ingen profil, aldrig Annas.
    expect(await t.profile.loadProfile()).toBeNull();
  });

  it('en cache med annan ägare används inte ens vid e-postmatch', async () => {
    const t = await boot((s) =>
      s.store.set(profileKey(ANNA.id), JSON.stringify({ playerName: 'Goran', email: ANNA.email, ownerUserId: 'uid-goran' })),
    );
    t.fake.signIn(ANNA);
    t.fake.goOfflineExpired();
    expect(await t.profile.loadProfile()).toBeNull();
  });

  it('backfill tar kontots signup-metadata, inte en främmande cache', async () => {
    const t = await boot((s) =>
      s.store.set('@quizvibe/profile/v1', JSON.stringify({ playerName: 'Goran', email: 'goran@x.se' })),
    );
    t.fake.state.profileRows.delete(ANNA.id);
    t.fake.signIn(ANNA);
    expect((await t.profile.loadProfile())?.playerName).toBe('Anna');
  });

  it('sent svar efter kontobyte når inte det nya kontots spegel', async () => {
    const t = await boot();
    t.fake.signIn(ANNA);
    const slow = t.profile.loadProfile();
    t.fake.signIn(BO); // byte innan Annas laddning hunnit klart
    await slow;
    expect(t.profile.getCachedProfile()?.playerName).toBe('Bo');
  });

  it('godkända preferenser från en äldre cache följer med, inget annat', async () => {
    const t = await boot((s) => {
      s.store.set(TEST_AUTH_KEY, JSON.stringify({ access_token: 'a', refresh_token: 'r', user: ANNA }));
      s.store.set(
        '@quizvibe/profile/v1',
        JSON.stringify({ email: ANNA.email, playerName: 'Goran', voice: 'deep', hcp: 3, freeGameCredits: 99 }),
      );
    });
    t.fake.signIn(ANNA);
    const p = await t.profile.loadProfile();
    expect(p?.voice).toBe('deep');
    expect(p?.playerName).toBe('Anna');
    expect(p?.hcp).toBeUndefined();
    expect(p?.freeGameCredits).not.toBe(99);
  });
});

// Parent Control / "Include mature content" (Peter 2026-11-26): ett sparat val
// bevaras alltid — även Build 40-användarens. Ingen engångsreset.
describe('Parent Control — sparade val bevaras', () => {
  const legacyCache = (parentControlEnabled: boolean) => (s: ReturnType<typeof createFakeAsyncStorage>) => {
    s.store.set(TEST_AUTH_KEY, JSON.stringify({ access_token: 'a', refresh_token: 'r', user: ANNA }));
    s.store.set('@quizvibe/profile/v1', JSON.stringify({ email: ANNA.email, playerName: 'Anna', parentControlEnabled }));
  };

  it('Build 40-användare med Parent Control PÅ behåller det (mature content AV)', async () => {
    const t = await boot(legacyCache(true));
    t.fake.signIn(ANNA);
    expect((await t.profile.loadProfile())?.parentControlEnabled).toBe(true);
    // Andra laddningen (egen cache) ändrar inget.
    expect((await t.profile.loadProfile())?.parentControlEnabled).toBe(true);
  });

  it('Build 40-användare med Parent Control AV behåller det (mature content PÅ)', async () => {
    const t = await boot(legacyCache(false));
    t.fake.signIn(ANNA);
    expect((await t.profile.loadProfile())?.parentControlEnabled).toBe(false);
  });

  it('ett val sparat i Build 41 överlever omladdning', async () => {
    const t = await boot();
    t.fake.signIn(ANNA);
    const p = await t.profile.loadProfile();
    await t.profile.saveProfile({ ...p!, parentControlEnabled: true });
    expect((await t.profile.loadProfile())?.parentControlEnabled).toBe(true);
    expect((await t.profile.loadProfile())?.parentControlEnabled).toBe(true);
  });

  it('nytt konto utan sparat val → ej satt (skärmarnas default = mature content PÅ)', async () => {
    const t = await boot();
    t.fake.signIn(ANNA);
    expect((await t.profile.loadProfile())?.parentControlEnabled ?? false).toBe(false);
  });
});

describe('Premium — ingen läcka mellan konton', () => {
  it('Annas betalda flagga syns inte för Bo, och utan session är Premium av', async () => {
    const t = await boot();
    const sub = await import('../../../src/utils/subscriptionStorage');
    t.fake.signIn(ANNA);
    await sub.setPremiumActive(true);
    expect(await sub.hasPremiumSubscription()).toBe(true);
    t.fake.signIn(BO);
    expect(await sub.hasPremiumSubscription()).toBe(false);
    await t.fake.supabase.auth.signOut();
    expect(await sub.hasPremiumSubscription()).toBe(false);
  });
});

describe('lokal data per konto', () => {
  it('history, vänner och HCP lagras per UUID — aldrig synliga för nästa konto', async () => {
    const t = await boot();
    const friends = await import('../../../src/utils/friendsStorage');
    const results = await import('../../../src/utils/gameResults');
    const hcp = await import('../../../src/utils/hcpProgress');
    t.fake.signIn(ANNA);
    await t.profile.loadProfile();
    await friends.addFriend('Cleo');
    await results.appendGameHistoryEntry({ id: 'g1' } as any);
    await hcp.recordSelfGameResult('sweden', 'full', { Music: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1] }, 15);
    t.fake.signIn(BO);
    await t.profile.loadProfile();
    expect(await friends.loadFriends()).toEqual([]);
    expect(await results.loadGameHistory()).toEqual([]);
    expect((await hcp.loadOwnCategoryHcp('sweden')).Music).toBe(99);
    t.fake.signIn(ANNA);
    expect((await results.loadGameHistory()).map((e) => e.id)).toEqual(['g1']);
  });

  it('PtP-medspelares HCP nycklas på värd + lobby-UUID, aldrig på namn', async () => {
    const t = await boot();
    const hcp = await import('../../../src/utils/hcpProgress');
    t.fake.signIn(ANNA);
    await hcp.recordGameResultForPeer({ playerId: 'p2', userId: BO.id }, 'sweden', 'full', { Music: [1] }, 15);
    const keys = [...t.storage.store.keys()];
    expect(keys).toContain(`@quizvibe/u/${TEST_REF}/${ANNA.id}/ptpPeers/${BO.id}/hcp/sweden`);
    expect(keys.some((k) => k.toLowerCase().includes('/bo'))).toBe(false);
    // Bo:s eget konto adopterar aldrig värdens kopia.
    t.fake.signIn(BO);
    expect(keys.some((k) => k.startsWith(`@quizvibe/u/${TEST_REF}/${BO.id}/`))).toBe(false);
  });

  it('medspelare utan UUID (gäst) får bara sessions-lokal progress', async () => {
    const t = await boot();
    const hcp = await import('../../../src/utils/hcpProgress');
    t.fake.signIn(ANNA);
    const before = t.storage.store.size;
    await hcp.recordGameResultForPeer({ playerId: 'g1', userId: null }, 'sweden', 'full', { Music: [1] }, 15);
    expect(t.storage.store.size).toBe(before);
  });
});

describe('degraderat läge', () => {
  it('misslyckad övergång blockerar alla användarskrivningar tills nästa start', async () => {
    vi.resetModules();
    h.storage = createFakeAsyncStorage();
    h.fake = createFakeSupabase(h.storage);
    h.fake.state.profileRows.set(ANNA.id, annaRow);
    const realRemove = h.storage.multiRemove;
    h.storage.store.set('@quizvibe/profile/v1', '{}');
    h.storage.multiRemove = async () => {
      throw new Error('disk');
    };
    const scope = await import('../../../src/utils/storageScope');
    expect(await scope.storageReady).toBe('failed');
    expect(scope.isStorageDegraded()).toBe(true);
    h.storage.multiRemove = realRemove;
    const profile = await import('../../../src/utils/profileStorage');
    h.fake.signIn(ANNA);
    await profile.loadProfile();
    await scope.scopedStorage.setItem(`@quizvibe/u/${TEST_REF}/${ANNA.id}/friends`, '["x"]');
    const userKeys = [...h.storage.store.keys()].filter((k) => k.startsWith('@quizvibe/u/'));
    expect(userKeys).toEqual([]);
  });
});

describe('borttagning av konto', () => {
  it('clearUserScope rensar bara det kontots nycklar', async () => {
    const t = await boot();
    t.storage.store.set(`@quizvibe/u/${TEST_REF}/${ANNA.id}/friends`, '[]');
    t.storage.store.set(`@quizvibe/u/${TEST_REF}/${BO.id}/friends`, '[]');
    t.storage.store.set(`@quizvibe/env/${TEST_REF}/featureGates`, '{}');
    await t.scope.clearUserScope(ANNA.id);
    expect(t.storage.store.has(`@quizvibe/u/${TEST_REF}/${ANNA.id}/friends`)).toBe(false);
    expect(t.storage.store.has(`@quizvibe/u/${TEST_REF}/${BO.id}/friends`)).toBe(true);
    expect(t.storage.store.has(`@quizvibe/env/${TEST_REF}/featureGates`)).toBe(true);
  });
});

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
});

describe('lobby — gäster publicerar inget konto', () => {
  it('anonym session skriver varken account_player_name eller hcp', async () => {
    const t = await boot();
    const lobby = await import('../../../src/utils/mockLobbyPlayers');
    await t.auth.ensureAuthSession(); // gäst
    await lobby.publishOwnAccountName('AB23XY', 'p1', 'Goran');
    await lobby.publishOwnHcp('AB23XY', 'p1', { total: 40, music: 40, film: 40 });
    expect(t.fake.state.lobbyUpdates).toEqual([]);
  });

  it('registrerad spelare (även som gäst-alias) publicerar fortfarande', async () => {
    const t = await boot();
    const lobby = await import('../../../src/utils/mockLobbyPlayers');
    t.fake.signIn(ANNA);
    await lobby.publishOwnAccountName('AB23XY', 'p1', 'Anna');
    expect(t.fake.state.lobbyUpdates).toHaveLength(1);
    expect(t.fake.state.lobbyUpdates[0]).toMatchObject({ account_player_name: 'Anna', user_id: ANNA.id });
  });
});

describe('ingen rå lagringsåtkomst utanför scope-lagret', () => {
  it('bara de fyra tillåtna modulerna importerar AsyncStorage eller skriver @quizvibe/-nycklar', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const root = path.resolve(__dirname, '../../..');
    const allowed = new Set(
      ['storageScope.ts', 'storageTransition.ts', 'sessionState.ts', 'supabase.ts'].map((f) =>
        path.join(root, 'src', 'utils', f),
      ),
    );
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(tsx?)$/.test(e.name) && !allowed.has(p)) {
          const code = fs
            .readFileSync(p, 'utf8')
            .split(/\r?\n/)
            .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l))
            .join('\n');
          if (/@react-native-async-storage\/async-storage/.test(code) || /['"`]@quizvibe\//.test(code)) {
            offenders.push(path.relative(root, p));
          }
        }
      }
    };
    walk(path.join(root, 'src'));
    walk(path.join(root, 'app'));
    expect(offenders).toEqual([]);
  });
});

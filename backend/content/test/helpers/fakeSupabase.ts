// Shared fakes for the Build 41 auth/storage regression tests.
//
// `fakeAsyncStorage` is an in-memory AsyncStorage. `createFakeSupabase` mimics
// the parts of supabase-js the client uses: it keeps a live session in memory
// and PERSISTS it under `sb-<ref>-auth-token` exactly like auth-js does, so
// tests can simulate "token expired + network down" (live session gone,
// stored session kept) and "session revoked" (both gone).

export const TEST_REF = 'testref';
export const TEST_AUTH_KEY = `sb-${TEST_REF}-auth-token`;

export function createFakeAsyncStorage() {
  const store = new Map<string, string>();
  let failReads = false;
  const api = {
    store,
    setFailReads(v: boolean) {
      failReads = v;
    },
    async getItem(k: string) {
      if (failReads) throw new Error('read failed');
      return store.get(k) ?? null;
    },
    async setItem(k: string, v: string) {
      store.set(k, v);
    },
    async removeItem(k: string) {
      store.delete(k);
    },
    async multiRemove(keys: string[]) {
      keys.forEach((k) => store.delete(k));
    },
    async multiSet(pairs: [string, string][]) {
      pairs.forEach(([k, v]) => store.set(k, v));
    },
    async getAllKeys() {
      if (failReads) throw new Error('read failed');
      return [...store.keys()];
    },
  };
  return api;
}

export interface FakeUser {
  id: string;
  email: string | null;
  is_anonymous?: boolean;
  user_metadata?: Record<string, unknown>;
}

type Listener = (event: string, session: { user: FakeUser } | null) => void;

export function createFakeSupabase(storage: ReturnType<typeof createFakeAsyncStorage>) {
  let live: { user: FakeUser; access_token: string; refresh_token: string } | null = null;
  const listeners = new Set<Listener>();
  const state = {
    /** 'ok' | 'network' (keep stored) | 'revoked' (drop stored) */
    refreshMode: 'ok' as 'ok' | 'network' | 'revoked',
    anonCalls: 0,
    /** Delay (ms) before anon-signup responds — to model a race. */
    anonDelayMs: 0,
    anonUserId: 'anon-1',
    profileRows: new Map<string, Record<string, unknown>>(),
    profileReadError: false,
    upserts: [] as Record<string, unknown>[],
    lobbyUpdates: [] as Record<string, unknown>[],
  };

  const persist = (s: typeof live) => {
    if (s) {
      storage.store.set(
        TEST_AUTH_KEY,
        JSON.stringify({ access_token: s.access_token, refresh_token: s.refresh_token, user: s.user }),
      );
    } else {
      storage.store.delete(TEST_AUTH_KEY);
    }
  };
  const emit = (event: string) => listeners.forEach((l) => l(event, live ? { user: live.user } : null));

  const builder = (table: string) => {
    const q: { filters: Record<string, unknown> } = { filters: {} };
    const chain: any = {
      select: () => chain,
      eq: (col: string, val: unknown) => {
        q.filters[col] = val;
        return chain;
      },
      maybeSingle: async () => {
        if (table === 'profiles' && state.profileReadError) return { data: null, error: { message: 'network' } };
        return { data: state.profileRows.get(String(q.filters.id)) ?? null, error: null };
      },
      upsert: async (row: Record<string, unknown>) => {
        state.upserts.push(row);
        return { error: null };
      },
      update: (vals: Record<string, unknown>) => {
        const u: any = {
          eq: (col: string, val: unknown) => {
            q.filters[col] = val;
            return u;
          },
          then: (resolve: (v: unknown) => void) => {
            state.lobbyUpdates.push({ ...vals, ...q.filters });
            resolve({ error: null });
          },
        };
        return u;
      },
    };
    return chain;
  };

  const supabase = {
    auth: {
      async getSession() {
        return { data: { session: live }, error: null };
      },
      async getUser() {
        return { data: { user: live?.user ?? null }, error: null };
      },
      async refreshSession() {
        const raw = storage.store.get(TEST_AUTH_KEY);
        if (!raw) return { data: { session: null }, error: { message: 'no session' } };
        if (state.refreshMode === 'network') return { data: { session: null }, error: { message: 'fetch failed' } };
        if (state.refreshMode === 'revoked') {
          persist(null);
          return { data: { session: null }, error: { message: 'revoked' } };
        }
        const parsed = JSON.parse(raw);
        live = { user: parsed.user, access_token: 'a2', refresh_token: parsed.refresh_token };
        persist(live);
        emit('TOKEN_REFRESHED');
        return { data: { session: live }, error: null };
      },
      async setSession(tokens: { access_token: string; refresh_token: string }) {
        const user: FakeUser = tokens.access_token.startsWith('anon')
          ? { id: state.anonUserId, email: null, is_anonymous: true }
          : JSON.parse(tokens.access_token.slice('user:'.length));
        live = { user, ...tokens };
        persist(live);
        emit('SIGNED_IN');
        return { data: { user, session: live }, error: null };
      },
      async signOut() {
        live = null;
        persist(null);
        emit('SIGNED_OUT');
        return { error: null };
      },
      onAuthStateChange(cb: Listener) {
        listeners.add(cb);
        return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } };
      },
    },
    functions: {
      async invoke(name: string) {
        if (name === 'anon-signup') {
          state.anonCalls += 1;
          if (state.anonDelayMs) await new Promise((r) => setTimeout(r, state.anonDelayMs));
          return { data: { access_token: 'anon-a', refresh_token: 'anon-r' }, error: null };
        }
        return { data: null, error: { message: 'unknown function' } };
      },
    },
    from: builder,
    async rpc() {
      return { data: null, error: { message: 'rpc not faked' } };
    },
  };

  return {
    supabase,
    state,
    /** Signs a registered user in (live + persisted), as a successful login would. */
    signIn(user: FakeUser) {
      live = { user, access_token: 'acc', refresh_token: 'ref' };
      persist(live);
      emit('SIGNED_IN');
    },
    /** Access token expired and auto-refresh could not reach the server. */
    goOfflineExpired() {
      live = null;
    },
    /** Stores a session for a DIFFERENT project (e.g. a staging build). */
    persistForeign(ref: string, user: FakeUser) {
      storage.store.set(`sb-${ref}-auth-token`, JSON.stringify({ access_token: 'x', refresh_token: 'y', user }));
    },
    reset() {
      live = null;
      listeners.forEach(() => undefined);
    },
  };
}

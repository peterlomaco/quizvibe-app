import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadProfile } from './profileStorage';
import { supabase } from './supabase';

/**
 * "Waiting Invites" — inbjudningar som hostar har skickat till mig via
 * Share invite (in-app, dvs när jag är registrerad i hostens QuizVibe
 * friends-lista).
 *
 * Cross-device-delivery via Supabase (Slice 3D, migration 0010):
 *   • `addInvite` INSERT:ar i `waiting_invites`-tabellen — trigger:n
 *     `set_invite_to_user_id` slår upp recipient:s user_id via profiles.
 *     RLS-policy "recipient reads own invites" gör att bara mottagaren
 *     kan SELECT:a raden via to_user_id = auth.uid().
 *   • `loadInvites` SELECT:ar inbox:en med to_user_id = auth.uid()
 *     (recipient-RLS gör att vi inte behöver explicit WHERE-clause —
 *     SELECT * räcker, men vi filtrerar ändå för tydlighet).
 *   • `removeInvite` DELETE:ar via id.
 *
 * AsyncStorage parallellt med Supabase som:
 *   1. Optimistisk lokal cache så UI kan visa lista direkt vid load.
 *   2. Offline-fallback om Supabase-anrop failar (network, RLS-error).
 *   3. Single-device-testfall (logout/login mellan host och recipient på
 *      samma device — DB-anropet fail:ar tyst för guests, AsyncStorage
 *      bär flödet).
 *
 * **Per-user-namespacing av AsyncStorage-nyckeln**: `@quizvibe/waitingInvites/v1/<lowercase-playerName>`.
 * När backend kommer in helt kan denna ersättas med ren Supabase-cache;
 * tills dess är dual-write säker default.
 */

const INVITES_KEY_PREFIX = '@quizvibe/waitingInvites/v1/';
// Flagga för one-shot reset av all v1-invites-data. Sätts efter första load
// efter per-user-namespacing-fixen. Innan flaggan finns nuk:as allt:
//   - legacy-nyckeln @quizvibe/waitingInvites/v1 (pre-namespacing global lista)
//   - alla @quizvibe/waitingInvites/v1/<playerName>-nycklar.
// Resultatet: alla startar tomma. Hostar får skicka invites på nytt.
const INVITES_RESET_FLAG_KEY = '@quizvibe/migration/invitesReset/v1';

export interface WaitingInvite {
  id: string;
  roomCode: string;
  fromPlayerName: string;
  fromAvatarId?: string;
  // ms timestamp — används för att sortera nyaste först och visa "1m ago" etc.
  sentAt: number;
}

// DB row-shape (snake_case). Mappar till WaitingInvite via rowToInvite.
interface WaitingInviteRow {
  id: string;
  to_player_name: string;
  to_user_id: string | null;
  room_code: string;
  from_player_name: string;
  from_avatar_id: string | null;
  sent_at: string; // ISO-timestamp från Supabase
}

function rowToInvite(row: WaitingInviteRow): WaitingInvite {
  return {
    id: row.id,
    roomCode: row.room_code,
    fromPlayerName: row.from_player_name,
    fromAvatarId: row.from_avatar_id ?? undefined,
    sentAt: new Date(row.sent_at).getTime(),
  };
}

function keyFor(playerName: string): string {
  return `${INVITES_KEY_PREFIX}${playerName.toLowerCase()}`;
}

/**
 * Returnerar AsyncStorage-nyckeln för inloggade user:s invite-inbox.
 * null = ingen profil laddad → caller bör returnera tom lista / no-op:a save.
 */
async function resolveActiveInvitesKey(): Promise<string | null> {
  const profile = await loadProfile();
  if (!profile?.playerName) return null;
  return keyFor(profile.playerName);
}

function parseInvites(json: string): WaitingInvite[] {
  const items = JSON.parse(json) as (Partial<WaitingInvite> & { fromNickname?: string })[];
  // Migrera gamla items (skapade när fältet hette `fromNickname`) till
  // nya schemat med `fromPlayerName`. Nästa save skriver bara nya fältet.
  return items.map((i) => ({
    id: i.id ?? `inv-${Date.now()}`,
    roomCode: i.roomCode ?? '',
    fromPlayerName: i.fromPlayerName ?? i.fromNickname ?? '',
    fromAvatarId: i.fromAvatarId,
    sentAt: i.sentAt ?? Date.now(),
  }));
}

/**
 * One-shot reset av all v1-invites-data. Tar bort legacy-nyckeln och alla
 * per-user-nycklar så ingen ärver felaktig data från pre-namespacing-tiden.
 * Sätter en flagga så reset:en bara körs en gång. Idempotent.
 */
async function ensureInvitesReset(): Promise<void> {
  try {
    const flag = await AsyncStorage.getItem(INVITES_RESET_FLAG_KEY);
    if (flag) return;
    const allKeys = await AsyncStorage.getAllKeys();
    const inviteKeys = allKeys.filter(
      (k) =>
        k === '@quizvibe/waitingInvites/v1' || k.startsWith(INVITES_KEY_PREFIX),
    );
    if (inviteKeys.length > 0) {
      await AsyncStorage.multiRemove(inviteKeys);
    }
    await AsyncStorage.setItem(INVITES_RESET_FLAG_KEY, '1');
  } catch (err) {
    console.warn('[waitingInvites] Reset failed:', err);
  }
}

/**
 * Merge:ar Supabase-listan ovanpå lokal cache. Supabase är authoritative
 * (den vinner vid konflikt på roomCode + fromPlayerName-tuple — DB:s
 * unique-constraint matchar AsyncStorage-mockens dedup-logik). Local-only
 * rader (t.ex. invites mottagna i offline-läge eller single-device-test
 * där host:s INSERT failade tyst) behålls.
 */
function mergeInvites(local: WaitingInvite[], remote: WaitingInvite[]): WaitingInvite[] {
  const seen = new Set<string>();
  const merged: WaitingInvite[] = [];
  const dedupKey = (i: WaitingInvite) =>
    `${i.roomCode}__${i.fromPlayerName.toLowerCase()}`;
  for (const inv of remote) {
    merged.push(inv);
    seen.add(dedupKey(inv));
  }
  for (const inv of local) {
    if (!seen.has(dedupKey(inv))) merged.push(inv);
  }
  // Nyast först (matchar AsyncStorage-mockens unshift-pattern).
  merged.sort((a, b) => b.sentAt - a.sentAt);
  return merged;
}

/**
 * Laddar inloggade user:s invite-inbox. Försöker Supabase först (cross-
 * device-källan); fallback till AsyncStorage om query failar eller user
 * saknar session. Resultatet merge:as så local-only invites (offline)
 * inte tappas.
 */
export async function loadInvites(): Promise<WaitingInvite[]> {
  await ensureInvitesReset();

  // 1) AsyncStorage först — snabb, alltid tillgänglig, fungerar offline.
  let local: WaitingInvite[] = [];
  try {
    const key = await resolveActiveInvitesKey();
    if (key) {
      const json = await AsyncStorage.getItem(key);
      if (json) local = parseInvites(json);
    }
  } catch (err) {
    console.warn('[waitingInvites] AsyncStorage load failed:', err);
  }

  // 2) Supabase — cross-device. RLS-policy "recipient reads own invites"
  //    säkrar att vi bara ser våra egna rader via to_user_id = auth.uid().
  //    Om ingen session finns (guest, eller pre-login) failar query:n och
  //    vi nöjer oss med local.
  try {
    const { data: userResp } = await supabase.auth.getUser();
    if (!userResp.user) return local;
    const { data, error } = await supabase
      .from('waiting_invites')
      .select('*')
      .eq('to_user_id', userResp.user.id)
      .order('sent_at', { ascending: false });
    if (error) {
      console.warn('[waitingInvites] Supabase load failed:', error.message);
      return local;
    }
    const remote = (data as WaitingInviteRow[]).map(rowToInvite);
    return mergeInvites(local, remote);
  } catch (err) {
    console.warn('[waitingInvites] Supabase load threw:', err);
    return local;
  }
}

async function saveInvitesForKey(key: string, invites: WaitingInvite[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(invites));
}

export async function saveInvites(invites: WaitingInvite[]): Promise<void> {
  try {
    await ensureInvitesReset();
    const key = await resolveActiveInvitesKey();
    if (!key) {
      console.warn('[waitingInvites] saveInvites called without active profile — no-op');
      return;
    }
    await saveInvitesForKey(key, invites);
  } catch (err) {
    console.warn('[waitingInvites] save failed:', err);
    throw err;
  }
}

/**
 * Lägger till en invite i `toPlayerName`:s inbox.
 *   • Supabase INSERT (cross-device delivery — primär källa).
 *   • AsyncStorage-skrivning i hostens egen device-namespace
 *     (`@quizvibe/waitingInvites/v1/<toPlayerName>`) som offline-fallback
 *     OCH single-device-testfall (logout/login mellan host och recipient
 *     på samma device).
 *
 * Båda skrivningarna är best-effort — om Supabase failar (offline, RLS-
 * konfig, missing migration) bär AsyncStorage flödet på single-device.
 * Om AsyncStorage failar är det inte värt att blockera Supabase-vägen.
 *
 * Caller måste passera mottagarens playerName explicit — invites är till
 * sin natur cross-user och kan inte härledas från inloggad profil (som är
 * *avsändaren* för Share invite-flödet).
 */
export async function addInvite(
  toPlayerName: string,
  invite: Omit<WaitingInvite, 'id' | 'sentAt'>,
): Promise<WaitingInvite[]> {
  await ensureInvitesReset();
  const trimmed = toPlayerName.trim();
  if (!trimmed) return [];
  const normalizedTo = trimmed.toLowerCase();

  // 1) Supabase INSERT — primär cross-device-delivery. Unique-constraint
  //    på (to_player_name, room_code, from_player_name) gör att en
  //    duplicate-invite från samma host till samma rum failas med error
  //    code 23505. Det är ok — vi loggar inte det som ett fel.
  try {
    const { error } = await supabase.from('waiting_invites').insert({
      to_player_name: normalizedTo,
      room_code: invite.roomCode,
      from_player_name: invite.fromPlayerName,
      from_avatar_id: invite.fromAvatarId ?? null,
    });
    if (error && error.code !== '23505') {
      console.warn('[waitingInvites] Supabase insert failed:', error.message);
    }
  } catch (err) {
    console.warn('[waitingInvites] Supabase insert threw:', err);
  }

  // 2) AsyncStorage-skrivning i recipient:s namespace på hostens device.
  //    Speglar AsyncStorage-mockens tidigare beteende exakt — kommer att
  //    läsas av loadInvites när recipient loggar in på SAMMA device.
  //    Skiljs från Supabase-vägen — om host-device är offline når invite:n
  //    fortfarande recipient via login-byte på samma telefon.
  const key = keyFor(trimmed);
  let current: WaitingInvite[] = [];
  try {
    const json = await AsyncStorage.getItem(key);
    if (json) current = parseInvites(json);
  } catch (err) {
    console.warn('[waitingInvites] addInvite read failed:', err);
  }
  const dup = current.find(
    (i) =>
      i.roomCode === invite.roomCode &&
      i.fromPlayerName.toLowerCase() === invite.fromPlayerName.toLowerCase(),
  );
  if (dup) return current;
  const next: WaitingInvite = {
    ...invite,
    id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sentAt: Date.now(),
  };
  const updated = [next, ...current];
  try {
    await saveInvitesForKey(key, updated);
  } catch (err) {
    console.warn('[waitingInvites] addInvite save failed:', err);
  }
  return updated;
}

/**
 * Tar bort en invite ur inboxen. Försöker både Supabase DELETE och
 * AsyncStorage-filter-och-save så lokal cache + cross-device-state hålls
 * synkroniserade. RLS gör att Supabase-DELETE bara träffar egna rader
 * (recipient = auth.uid()) — hostens lokala AsyncStorage-kopia
 * (i hostens egen device-namespace) påverkas inte.
 */
/**
 * Tar bort ALLA invites för ett specifikt rum. Anropas när host startar
 * spelet (`markRoomGameStarted` flippar `game_started=true` men raderar
 * inte rooms-raden — så ON DELETE CASCADE fyrar inte). Realtime DELETE-
 * events broadcastas till varje mottagares JoinModal-subscription så
 * stale invites försvinner live utan re-open.
 *
 * Lobby-deletion (`deactivateRoom`) behöver INTE anropa denna — rooms-
 * raden raderas där och ON DELETE CASCADE i `waiting_invites` tar
 * automatiskt bort alla invites för rummet. Den är dedikerad till
 * game-start-fallet.
 *
 * Best-effort: loggar fel men kastar inte. Idempotent — anrop med okänd
 * code är no-op.
 */
export async function clearWaitingInvitesForRoom(code: string): Promise<void> {
  if (!code) return;
  const normalized = code.toUpperCase();
  try {
    const { error } = await supabase
      .from('waiting_invites')
      .delete()
      .eq('room_code', normalized);
    if (error) {
      console.warn('[waitingInvites] clearWaitingInvitesForRoom failed:', error.message);
    }
  } catch (err) {
    console.warn('[waitingInvites] clearWaitingInvitesForRoom threw:', err);
  }
}

export async function removeInvite(id: string): Promise<WaitingInvite[]> {
  // Supabase DELETE — best-effort. id är primary key, så vi behöver inte
  // ytterligare WHERE-clauses; RLS-policy "recipient deletes own invites"
  // gate:ar via to_user_id = auth.uid().
  try {
    const { error } = await supabase.from('waiting_invites').delete().eq('id', id);
    if (error) {
      console.warn('[waitingInvites] Supabase delete failed:', error.message);
    }
  } catch (err) {
    console.warn('[waitingInvites] Supabase delete threw:', err);
  }

  // AsyncStorage-cleanup på recipient:s egen inbox-nyckel.
  try {
    await ensureInvitesReset();
    const key = await resolveActiveInvitesKey();
    if (key) {
      const json = await AsyncStorage.getItem(key);
      if (json) {
        const current = parseInvites(json);
        const updated = current.filter((i) => i.id !== id);
        await saveInvitesForKey(key, updated);
      }
    }
  } catch (err) {
    console.warn('[waitingInvites] AsyncStorage removeInvite failed:', err);
  }

  // Returnera färska listan via loadInvites så caller får den korrekta
  // post-delete-vyn (efter Supabase + AsyncStorage cleanup).
  return loadInvites();
}

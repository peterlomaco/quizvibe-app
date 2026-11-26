import { getUserScope, scopedStorage, userKey } from './storageScope';
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
 * Lokal cache (userKey(uid,'invites'), Build 41) parallellt med Supabase:
 *   1. Optimistisk lokal cache så UI kan visa lista direkt vid load.
 *   2. Offline-fallback om Supabase-anrop failar.
 * Avsändaren skriver ALDRIG i mottagarens lokala inbox — Supabase + Realtime
 * är leveransvägen.
 */

export interface WaitingInvite {
  id: string;
  roomCode: string;
  fromPlayerName: string;
  fromAvatarId?: string;
  // ms timestamp — används för att sortera nyaste först och visa "1m ago" etc.
  sentAt: number;
  // Sattes av avsändaren vid send-time (Peter 2026-08-27): true om
  // mottagaren redan var en sparad friend på hostens sida när inviten
  // skickades. Styr om recipient-klienten visar consent-popupen
  // ("...adds you to his/her QuizVibe friend list") innan Accept.
  alreadyFriend: boolean;
  // Marathon-tabellens namn när inviten kommer från en Competition re-match
  // ("Continue with new Game", migration 0051). Satt → invite-kortet visar
  // "Marathon table: <namn>" i stället för den härledda lobbytypen. Bärs på
  // inbjudan eftersom room→serie-kopplingen bara finns på hostens enhet.
  competitionName?: string;
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
  already_friend: boolean;
  // Optional — saknas på rader från FÖRE migration 0051 (undefined → null).
  competition_name?: string | null;
}

function rowToInvite(row: WaitingInviteRow): WaitingInvite {
  return {
    id: row.id,
    roomCode: row.room_code,
    fromPlayerName: row.from_player_name,
    fromAvatarId: row.from_avatar_id ?? undefined,
    sentAt: new Date(row.sent_at).getTime(),
    alreadyFriend: row.already_friend,
    competitionName: row.competition_name ?? undefined,
  };
}

/** Kontots inbox-nyckel, eller null utan registrerad session. */
async function resolveActiveInvitesKey(): Promise<string | null> {
  const scope = await getUserScope();
  return scope ? userKey(scope.uid, 'invites') : null;
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
    competitionName: i.competitionName,
    sentAt: i.sentAt ?? Date.now(),
    // Legacy cached invites (pre-migration) don't have this field — default
    // to true (assume already-friend / no popup) since we genuinely don't
    // know, and showing a spurious consent popup is worse than skipping one.
    alreadyFriend: i.alreadyFriend ?? true,
  }));
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
  // 1) AsyncStorage först — snabb, alltid tillgänglig, fungerar offline.
  let local: WaitingInvite[] = [];
  try {
    const key = await resolveActiveInvitesKey();
    if (key) {
      const json = await scopedStorage.getItem(key);
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
  await scopedStorage.setItem(key, JSON.stringify(invites));
}

export async function saveInvites(invites: WaitingInvite[]): Promise<void> {
  try {
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
 *   • Ingen lokal kopia i mottagarens namespace (Build 41, togs bort så
 *     ingen data skrivs under en annan spelares namn).
 *
 * Best-effort — fel loggas, kastas inte. Returnerar alltid [] (oanvänt).
 *
 * Caller måste passera mottagarens playerName explicit — invites är till
 * sin natur cross-user och kan inte härledas från inloggad profil (som är
 * *avsändaren* för Share invite-flödet).
 */
export async function addInvite(
  toPlayerName: string,
  invite: Omit<WaitingInvite, 'id' | 'sentAt'>,
): Promise<WaitingInvite[]> {
  const trimmed = toPlayerName.trim();
  if (!trimmed) return [];
  const normalizedTo = trimmed.toLowerCase();

  // 1) Supabase INSERT — primär cross-device-delivery. Unique-constraint
  //    på (to_player_name, room_code, from_player_name) gör att en
  //    duplicate-invite från samma host till samma rum failas med error
  //    code 23505. Det är ok — vi loggar inte det som ett fel.
  try {
    // `competition_name` läggs till ENBART när den finns (marathon-invite) så
    // vanliga invites är byte-identiska med förr — en icke-applicerad 0051
    // bryter då aldrig det ordinarie Share invite-flödet (okänd kolumn i en
    // INSERT failar HELA raden). Marathon-invites kräver 0051 applicerad för
    // cross-device-leverans; utan den faller de tyst till AsyncStorage-vägen.
    const payload: Record<string, unknown> = {
      to_player_name: normalizedTo,
      room_code: invite.roomCode,
      from_player_name: invite.fromPlayerName,
      from_avatar_id: invite.fromAvatarId ?? null,
      already_friend: invite.alreadyFriend,
    };
    if (invite.competitionName) payload.competition_name = invite.competitionName;
    const { error } = await supabase.from('waiting_invites').insert(payload);
    if (error && error.code !== '23505') {
      console.warn('[waitingInvites] Supabase insert failed:', error.message);
    }
  } catch (err) {
    console.warn('[waitingInvites] Supabase insert threw:', err);
  }

  // Ingen lokal skrivning i mottagarens namespace (Build 41) — leveransen
  // sker enbart via Supabase + Realtime.
  return [];
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
    const key = await resolveActiveInvitesKey();
    if (key) {
      const json = await scopedStorage.getItem(key);
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

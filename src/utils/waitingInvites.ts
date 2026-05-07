import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadProfile } from './profileStorage';

/**
 * Lokal lagring av "Waiting Invites" — inbjudningar som hostar har skickat
 * till mig via Share invite (in-app, dvs när jag är registrerad i hostens
 * QuizVibe friends-lista).
 *
 * MOCK: I dagens single-device-app sparar både skickare och mottagare i
 * samma AsyncStorage. När hosten "skickar" en invite till en vän hamnar
 * den i mottagarens per-user-nyckel — vilket gör att du kan testa hela
 * skicka→ta-emot-loopen utan backend.
 *
 * **Per-user-namespacing**: nyckeln innehåller mottagarens playerName
 * (lowercase) så User A inte ser invites som skickats till User B.
 *   - `loadInvites()` / `removeInvite()` opererar på *inloggade* user:s inbox.
 *   - `addInvite()` tar `toPlayerName` som första-arg så host kan skriva
 *     till specifik mottagares inbox oberoende av vem som är inloggad.
 *
 * När backend kommer in byts detta mot user-id från auth-token; tills dess
 * är playerName unique-key per design (validatePlayerName säkrar
 * case-insensitive uniqueness).
 *
 * TODO (backend): byt till backend där invites pushas till mottagarens
 * konto. Då rör sig denna storage istället mot en server-cache.
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

export async function loadInvites(): Promise<WaitingInvite[]> {
  try {
    await ensureInvitesReset();
    const key = await resolveActiveInvitesKey();
    if (!key) return [];
    const json = await AsyncStorage.getItem(key);
    if (!json) return [];
    return parseInvites(json);
  } catch (err) {
    console.warn('[waitingInvites] load failed:', err);
    return [];
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
 * Lägger till en invite i `toPlayerName`:s inbox (case-insensitive nyckel).
 * Caller måste passera mottagarens playerName explicit — invites är till
 * sin natur cross-user och kan inte härledas från inloggad profil (som
 * är *avsändaren* för Share invite-flödet).
 */
export async function addInvite(
  toPlayerName: string,
  invite: Omit<WaitingInvite, 'id' | 'sentAt'>,
): Promise<WaitingInvite[]> {
  await ensureInvitesReset();
  const trimmed = toPlayerName.trim();
  if (!trimmed) return [];
  const key = keyFor(trimmed);
  // Läs ev. befintlig inbox för exakt denna mottagare (inte aktiv profil).
  let current: WaitingInvite[] = [];
  try {
    const json = await AsyncStorage.getItem(key);
    if (json) current = parseInvites(json);
  } catch (err) {
    console.warn('[waitingInvites] addInvite read failed:', err);
  }
  // Skippa om samma rumkod redan finns från samma host (undviker dubletter
  // när host trycker invite två gånger på samma vän).
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
  await saveInvitesForKey(key, updated);
  return updated;
}

export async function removeInvite(id: string): Promise<WaitingInvite[]> {
  const current = await loadInvites();
  const updated = current.filter((i) => i.id !== id);
  await saveInvites(updated);
  return updated;
}

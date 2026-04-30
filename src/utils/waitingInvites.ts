import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Lokal lagring av "Waiting Invites" — inbjudningar som hostar har skickat
 * till mig via Share invite (in-app, dvs när jag är registrerad i hostens
 * QuizVibe friends-lista).
 *
 * MOCK: I dagens single-device-app sparar både skickare och mottagare i
 * samma AsyncStorage. När hosten "skickar" en invite till en vän hamnar
 * den i denna lista på samma enhet — vilket gör att du kan testa hela
 * skicka→ta-emot-loopen utan backend.
 *
 * TODO (backend): byt till backend där invites pushas till mottagarens
 * konto. Då rör sig denna storage istället mot en server-cache.
 */

const KEY = '@quizvibe/waitingInvites/v1';

export interface WaitingInvite {
  id: string;
  roomCode: string;
  fromPlayerName: string;
  fromAvatarId?: string;
  // ms timestamp — används för att sortera nyaste först och visa "1m ago" etc.
  sentAt: number;
}

export async function loadInvites(): Promise<WaitingInvite[]> {
  try {
    const json = await AsyncStorage.getItem(KEY);
    if (!json) return [];
    const items = JSON.parse(json) as (Partial<WaitingInvite> & { fromNickname?: string })[];
    // Migrera gamla items (skapade när fältet hette `fromNickname`) till
    // nya schemat med `fromPlayerName`. Nästa saveInvites skriver bara
    // nya fältet.
    return items.map((i) => ({
      id: i.id ?? `inv-${Date.now()}`,
      roomCode: i.roomCode ?? '',
      fromPlayerName: i.fromPlayerName ?? i.fromNickname ?? '',
      fromAvatarId: i.fromAvatarId,
      sentAt: i.sentAt ?? Date.now(),
    }));
  } catch (err) {
    console.warn('[waitingInvites] load failed:', err);
    return [];
  }
}

export async function saveInvites(invites: WaitingInvite[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(invites));
  } catch (err) {
    console.warn('[waitingInvites] save failed:', err);
    throw err;
  }
}

export async function addInvite(
  invite: Omit<WaitingInvite, 'id' | 'sentAt'>,
): Promise<WaitingInvite[]> {
  const current = await loadInvites();
  // Skippa om samma rumkod redan finns från samma host (undviker dubletter
  // när host trycker invite två gånger på samma vän)
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
  await saveInvites(updated);
  return updated;
}

export async function removeInvite(id: string): Promise<WaitingInvite[]> {
  const current = await loadInvites();
  const updated = current.filter((i) => i.id !== id);
  await saveInvites(updated);
  return updated;
}

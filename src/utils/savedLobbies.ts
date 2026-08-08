// Sparade Remote 1v1-lobbies — "Save 1vs1 – Play later" (Peter 2026-08-08).
//
// En sparad lobby är INTE en match. Matchraden (remote_matches) skapas
// först när host trycker Start Game; fram till dess finns bara rummet
// (rooms-raden, 24h TTL). Den här storen låter BÅDE host och motståndare
// lämna lobbyn utan att tappa bort den: posten visas i Remote Play History
// under "Not started" och tap:en tar spelaren tillbaka in i lobbyn.
//
// Lokal per-user-lagring (AsyncStorage), samma namespacing som friends/
// gameHistory/seenQuestionIds: nyckeln bär inloggade users playerName så
// User A:s sparade lobbies inte syns för User B på samma device. Remote
// 1v1 är QuizVibe-users-only, så en profil finns alltid — saknas den
// (anon-session) blir alla anrop no-ops.
//
// Ingen DB-tabell och ingen migration: posten är en ren UI-genväg till ett
// rum som redan lever server-side. Den auktoritativa livslängden ägs av
// rooms-raden — MyMatchesScreen prunar posten så fort rummet är borta,
// expired eller startat (då tar den riktiga matchraden över listan).

import AsyncStorage from '@react-native-async-storage/async-storage';

import { loadProfile } from './profileStorage';

const KEY_PREFIX = '@quizvibe/savedLobbies/v1/';
// Taket är rent defensivt — i praktiken har en spelare någon enstaka
// sparad lobby åt gången (rummen lever bara 24h).
const MAX_SAVED = 20;

export interface SavedLobby {
  /** Kanonisk 6-teckenskod (versaler, utan bindestreck). */
  roomCode: string;
  /** True när DEN HÄR användaren är lobbyns host (styr re-entry-params). */
  isHost: boolean;
  /**
   * Motspelarens visningsnamn vid sparandet — bara för radens undertext.
   * null när ingen motståndare hunnit joina (host kan spara en tom lobby
   * och dela koden senare).
   */
  opponentName: string | null;
  /** ISO-tidpunkt då spelaren tryckte "Save 1vs1 – Play later". */
  savedAt: string;
}

async function resolveKey(): Promise<string | null> {
  try {
    const profile = await loadProfile();
    if (!profile?.playerName) return null;
    return `${KEY_PREFIX}${profile.playerName.toLowerCase()}`;
  } catch {
    return null;
  }
}

async function readAll(key: string): Promise<SavedLobby[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedLobby[]) : [];
  } catch {
    return [];
  }
}

/** Sparade lobbies för inloggad user, senast sparad först. */
export async function getSavedLobbies(): Promise<SavedLobby[]> {
  const key = await resolveKey();
  if (!key) return [];
  return readAll(key);
}

/**
 * Sparar (eller uppdaterar) en lobby. Dedupe:ar på roomCode så att spara
 * samma lobby två gånger bara uppdaterar posten istället för att lägga
 * till en dubblett.
 */
export async function saveLobby(entry: SavedLobby): Promise<void> {
  const key = await resolveKey();
  if (!key) return;
  const code = entry.roomCode.toUpperCase();
  const existing = await readAll(key);
  const next = [
    { ...entry, roomCode: code },
    ...existing.filter((e) => e.roomCode.toUpperCase() !== code),
  ].slice(0, MAX_SAVED);
  try {
    await AsyncStorage.setItem(key, JSON.stringify(next));
  } catch {
    // Tyst — sparandet är en bekvämlighet, inte en förutsättning för att
    // rummet ska leva vidare (det gör det server-side i 24h oavsett).
  }
}

/** Tar bort en sparad lobby (rummet dog/startade, eller spelaren gick in i den). */
export async function removeSavedLobby(roomCode: string): Promise<void> {
  const key = await resolveKey();
  if (!key) return;
  const code = roomCode.toUpperCase();
  const existing = await readAll(key);
  const next = existing.filter((e) => e.roomCode.toUpperCase() !== code);
  if (next.length === existing.length) return;
  try {
    await AsyncStorage.setItem(key, JSON.stringify(next));
  } catch {
    // Tyst — nästa prune-pass i MyMatchesScreen försöker igen.
  }
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadProfile } from './profileStorage';
import { clampEpochDebt, emptyEpochDebt, type EpochDebt } from './epochAllocation';

// Persistens för epok-skuldboken, per Host (playerName). Räknekärnan
// (planEpochSequence / sequenceToQuotas) bor i epochAllocation.ts eftersom den
// är ren och enhetstestas utan React/AsyncStorage — den här filen sköter bara
// läsning och skrivning.
//
// Varför skuldboken finns: epok-målandelen går inte att uppfylla inom EN
// spelomgång. Med 4 rundor är E1:s 11% = 0,44 frågor, vilket LRM alltid
// avrundar till 0 — E1 visades därför aldrig, oavsett hur mycket innehåll som
// fanns. Genom att spara resten mellan spel ackumuleras 0,44 tills den passerar
// 1 och epoken får sin plats.

const LEDGER_KEY_PREFIX = '@quizvibe/epochLedger/v1/';

// Guests saknar sparat playerName — de får en sessions-lokal skuldbok istället
// för ingen alls, så epok-spridningen fungerar även inom ett gästspel.
let sessionDebt: EpochDebt = emptyEpochDebt();

async function resolveKey(): Promise<string | null> {
  try {
    const profile = await loadProfile();
    if (!profile?.playerName) return null;
    return `${LEDGER_KEY_PREFIX}${profile.playerName.toLowerCase()}`;
  } catch {
    return null;
  }
}

export async function loadEpochLedger(): Promise<EpochDebt> {
  try {
    const key = await resolveKey();
    if (!key) return { ...sessionDebt };
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return emptyEpochDebt();
    return clampEpochDebt(JSON.parse(raw));
  } catch {
    return emptyEpochDebt();
  }
}

export async function saveEpochLedger(debt: EpochDebt): Promise<void> {
  const clamped = clampEpochDebt(debt);
  try {
    const key = await resolveKey();
    if (!key) {
      sessionDebt = clamped;
      return;
    }
    await AsyncStorage.setItem(key, JSON.stringify(clamped));
  } catch {}
}

export async function clearEpochLedger(): Promise<void> {
  sessionDebt = emptyEpochDebt();
  try {
    const key = await resolveKey();
    if (key) await AsyncStorage.removeItem(key);
  } catch {}
}

import { getUserScope, scopedStorage, userKey } from './storageScope';
import { clampCategoryDebt, emptyCategoryDebt, type CategoryDebt } from './epochAllocation';

// Persistens för kategori-skuldboken, per Host (playerName). Räknekärnan
// (planCategorySequence / sequenceToCategoryQuotas) bor i epochAllocation.ts
// eftersom den är ren och enhetstestas utan React/AsyncStorage — den här filen
// sköter bara läsning och skrivning. Speglar epochLedger.ts 1:1.
//
// Varför skuldboken finns: målandelen (t.ex. 10% Film av YouTube-klippen) går
// inte att uppfylla inom EN spelomgång. Med 4 rundor ger YouTube-fasen ~3 block
// och 10% = 0,3 block, vilket alltid avrundas till 0 — Film visades därför
// aldrig. Genom att spara resten mellan spel ackumuleras 0,3 tills den passerar
// 1 och Film får ett block (~vart 3:e 4-rundorsspel).

// Guests saknar sparat playerName — de får en sessions-lokal skuldbok istället
// för ingen alls, så kategori-spridningen fungerar även inom ett gästspel.
let sessionDebt: CategoryDebt = emptyCategoryDebt();

async function resolveKey(): Promise<string | null> {
  try {
    const scope = await getUserScope();
    return scope ? userKey(scope.uid, 'categoryLedger') : null;
  } catch {
    return null;
  }
}

export async function loadCategoryLedger(): Promise<CategoryDebt> {
  try {
    const key = await resolveKey();
    if (!key) return { ...sessionDebt };
    const raw = await scopedStorage.getItem(key);
    if (!raw) return emptyCategoryDebt();
    return clampCategoryDebt(JSON.parse(raw));
  } catch {
    return emptyCategoryDebt();
  }
}

export async function saveCategoryLedger(debt: CategoryDebt): Promise<void> {
  const clamped = clampCategoryDebt(debt);
  try {
    const key = await resolveKey();
    if (!key) {
      sessionDebt = clamped;
      return;
    }
    await scopedStorage.setItem(key, JSON.stringify(clamped));
  } catch {}
}

export async function clearCategoryLedger(): Promise<void> {
  sessionDebt = emptyCategoryDebt();
  try {
    const key = await resolveKey();
    if (key) await scopedStorage.removeItem(key);
  } catch {}
}

// Ren, beroende-fri gruppering för Marathon- / spelhistorik-listorna.
//
// Inga React/RN/Supabase-imports → vitest-importbar (samma konvention som
// competitionRematchSettings.ts / hcpEngine.ts / mediaSource.ts). Delas av
// SavedAggregatesCard (Marathon-listan) och PlayerHistorySection (per-spel-
// historiken) så båda ytorna sorterar/grupperar med EXAKT samma logik.

export type GameFormKey =
  | 'single-player'
  | 'pass-the-phone'
  | 'individual-devices'
  | 'unknown';

export interface GameForm {
  key: GameFormKey;
  label: string;
}

/** Fast render-ordning för level-2-grupperna (spelform). */
export const GAME_FORM_ORDER: readonly GameFormKey[] = [
  'single-player',
  'pass-the-phone',
  'individual-devices',
  'unknown',
];

/**
 * Härleder spelformen (level-2-gruppen) ur ett spels lagrade läge.
 *
 * `singlePlayerDefault` vinner — single player är en flagga OVANPÅ ett gameMode
 * (ett solospel bär oftast gameMode 'pass-the-phone'). Okänt/saknat/remote-1v1
 * → "Unknown mode": remote når aldrig dessa ytor (H2H skrivs inte hit), och
 * poster skrivna innan spelform lagrades saknar fälten helt och faller hit.
 * Tar `string` (inte GameMode-unionen) med flit — värdet läses ur JSONB /
 * AsyncStorage och kan vara en godtycklig äldre sträng.
 */
export function resolveGameForm(
  gameMode?: string | null,
  singlePlayerDefault?: boolean | null,
): GameForm {
  if (singlePlayerDefault === true) {
    return { key: 'single-player', label: 'Single player' };
  }
  if (gameMode === 'pass-the-phone') {
    return { key: 'pass-the-phone', label: 'Pass-the-Phone' };
  }
  if (gameMode === 'individual-devices') {
    return { key: 'individual-devices', label: 'Individual Devices' };
  }
  return { key: 'unknown', label: 'Unknown mode' };
}

export type SortMode = 'host' | 'date';

// ── Månads-helpers ────────────────────────────────────────────────────────
// Flyttade hit från PlayerHistorySection så samma månads-logik driver både
// per-spel-historiken och Marathon-listan (single source of truth).

export function monthKeyForDate(iso: string): string {
  // YYYY-MM ur ISO. Date-parsing skyddar mot format-variation — history
  // skriver ISO med dagsdel men headern behöver bara år + månad.
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'unknown';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabelForKey(key: string): string {
  // 'YYYY-MM' → 'May 2026'. Date(year, month-1, 1) så locale-formatteraren
  // får rätt månad oavsett timezone.
  const [y, m] = key.split('-').map(Number);
  if (!y || !m) return key;
  const d = new Date(y, m - 1, 1);
  return d.toLocaleString('en', { month: 'long', year: 'numeric' });
}

// ── Två-nivå-gruppering ────────────────────────────────────────────────────

export interface GroupAccessors<T> {
  getHostName: (item: T) => string | undefined;
  getDateISO: (item: T) => string | undefined;
  getGameForm: (item: T) => GameForm;
}

export interface FormGroup<T> {
  formKey: GameFormKey;
  formLabel: string;
  items: T[];
}

export interface L1Group<T> {
  l1Key: string;
  l1Label: string;
  forms: FormGroup<T>[];
}

const UNKNOWN_HOST_KEY = '__unknown_host__';
const UNKNOWN_DATE_KEY = 'unknown';

/**
 * Grupperar `items` i två nivåer: level 1 = host name ELLER månad (styrt av
 * `sortMode`), level 2 = spelform (fast ordning via GAME_FORM_ORDER).
 *
 * - Level-1-sort: host = alfabetiskt ("Unknown host" sist); date = månads-
 *   nyckel nyast först ("Unknown date" sist).
 * - Level 2: tomma spelform-hinkar slängs.
 * - Level 3 (items): inkommande ordning bevaras — anropare skickar dem redan
 *   sorterade nyast först, så leaf-ordningen förblir nyast först.
 */
export function groupHistory<T>(
  items: T[],
  sortMode: SortMode,
  acc: GroupAccessors<T>,
): L1Group<T>[] {
  // 1) Bucketa på level-1-nyckel (bevara insättningsordning inom hinken).
  const l1Map = new Map<string, { label: string; items: T[] }>();
  for (const item of items) {
    let key: string;
    let label: string;
    if (sortMode === 'host') {
      const host = acc.getHostName(item)?.trim();
      if (host) {
        key = host;
        label = host;
      } else {
        key = UNKNOWN_HOST_KEY;
        label = 'Unknown host';
      }
    } else {
      const iso = acc.getDateISO(item);
      const mk = iso ? monthKeyForDate(iso) : UNKNOWN_DATE_KEY;
      if (mk !== UNKNOWN_DATE_KEY) {
        key = mk;
        label = monthLabelForKey(mk);
      } else {
        key = UNKNOWN_DATE_KEY;
        label = 'Unknown date';
      }
    }
    let bucket = l1Map.get(key);
    if (!bucket) {
      bucket = { label, items: [] };
      l1Map.set(key, bucket);
    }
    bucket.items.push(item);
  }

  // 2) Sortera level-1-grupperna.
  const entries = [...l1Map.entries()];
  entries.sort(([ka, ba], [kb, bb]) => {
    if (sortMode === 'host') {
      const aUnknown = ka === UNKNOWN_HOST_KEY;
      const bUnknown = kb === UNKNOWN_HOST_KEY;
      if (aUnknown !== bUnknown) return aUnknown ? 1 : -1; // Unknown sist
      return ba.label.localeCompare(bb.label);
    }
    // date: nyast först (YYYY-MM desc), Unknown sist
    const aUnknown = ka === UNKNOWN_DATE_KEY;
    const bUnknown = kb === UNKNOWN_DATE_KEY;
    if (aUnknown !== bUnknown) return aUnknown ? 1 : -1;
    return kb.localeCompare(ka);
  });

  // 3) Level-2 (spelform) i fast ordning; släng tomma hinkar.
  return entries.map(([l1Key, bucket]) => {
    const formMap = new Map<GameFormKey, { label: string; items: T[] }>();
    for (const item of bucket.items) {
      const form = acc.getGameForm(item);
      let fb = formMap.get(form.key);
      if (!fb) {
        fb = { label: form.label, items: [] };
        formMap.set(form.key, fb);
      }
      fb.items.push(item);
    }
    const forms: FormGroup<T>[] = [];
    for (const fk of GAME_FORM_ORDER) {
      const fb = formMap.get(fk);
      if (fb && fb.items.length > 0) {
        forms.push({ formKey: fk, formLabel: fb.label, items: fb.items });
      }
    }
    return { l1Key, l1Label: bucket.label, forms };
  });
}

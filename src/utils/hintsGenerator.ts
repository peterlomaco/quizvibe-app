// hintsGenerator.ts — slumpmässigt urval av ledtrådar från HintLibrary.
//
// selectHints(library, count=15):
//   • Alltid med: alla P5-hints (mest ikoniska, visas sist)
//   • Slumpas in: P4 → P3 → P2 → P1 tills count nåtts
//   • Sortering: ASC priority → P1 visas FIRST (warm-up), P5 LAST (reveal)
//
// Kör en gång per runda (via useMemo med resetKey som dep).

import type { HintItem, HintLibrary } from './hintsData';

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function selectHints(library: HintLibrary, count: number = 15): HintItem[] {
  const { hints } = library;

  // Om biblioteket är för litet — ta allt (sorterat)
  if (hints.length <= count) {
    return [...hints].sort((a, b) => a.priority - b.priority);
  }

  // Gruppera per prioritet
  const buckets: Record<number, HintItem[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  for (const hint of hints) {
    buckets[hint.priority].push(hint);
  }

  const selected: HintItem[] = [];

  // P5 inkluderas alltid (de allra mest ikoniska ledtrådarna)
  selected.push(...shuffleArray(buckets[5]));

  // Fyll resterande platser med slumpmässigt urval från P4 → P1
  for (const p of [4, 3, 2, 1] as const) {
    if (selected.length >= count) break;
    const pool = shuffleArray(buckets[p]);
    const take = Math.min(pool.length, count - selected.length);
    selected.push(...pool.slice(0, take));
  }

  // Sortera ASC: P1 visas FIRST (varm-upp), P5 visas LAST (avslöjande)
  selected.sort((a, b) => a.priority - b.priority);

  return selected.slice(0, count);
}

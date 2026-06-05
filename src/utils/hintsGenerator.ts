// hintsGenerator.ts — slumpmässigt urval av ledtrådar från HintLibrary.
//
// selectHints(library, count=15):
//   • Alltid med: alla P5-hints (mest ikoniska, visas sist)
//   • Slumpas in: P4 → P3 → P2 → P1 tills count nåtts
//   • Sortering: ASC priority → P1 visas FIRST (warm-up), P5 LAST (reveal)
//
// Kör en gång per runda (via useMemo med resetKey som dep).

import type { HintItem, HintLibrary } from './hintsData';

// Typ-ordning för sekundär sortering inom samma prioritetsnivå.
// Hints av samma typ (t.ex. 'song') hamnar samlat efter varandra.
const TYPE_ORDER: Record<string, number> = {
  profession: 0,
  birth_date: 1,
  birth_place: 2,
  creation_year: 3,
  peak_year: 4,
  debut: 5,
  height: 6,
  jersey_number: 7,
  member_count: 8,
  lead_singer: 9,
  band_member: 10,
  characteristic: 11,
  club: 12,
  song: 13,
  album: 14,
  movie: 15,
  tv_show: 16,
  producer: 17,
  merit: 18,
};

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
    return [...hints].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return (TYPE_ORDER[a.type] ?? 99) - (TYPE_ORDER[b.type] ?? 99);
    });
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

  // Sortera primärt på prioritet (P1 FIRST → P5 LAST),
  // sekundärt på type så att hints av samma sort hamnar efter varandra.
  selected.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return (TYPE_ORDER[a.type] ?? 99) - (TYPE_ORDER[b.type] ?? 99);
  });

  return selected.slice(0, count);
}

// Helpers för Namn-svarsmodellen — generations-mappning och Letter Grid-logik.
// Ren funktionell kod utan beroenden — kan unit-testas isolerat och senare
// kopieras / importeras av klienten eller spel-API:t.

import { Audience, Generation } from './schema';

export type SkillLevel = 'easy' | 'intermediate' | 'expert';

// Ordningsindex för generations-avstånds-beräkning.
// 0 = elder, 4 = gen-alpha. Avstånd = |index_a - index_b|.
const GENERATION_ORDER: Generation[] = [
  'elder',
  'gen-x',
  'millennials',
  'gen-z',
  'gen-alpha',
];

// Födelseår-gränser. Inklusive på båda sidor.
const GENERATION_BIRTH_RANGES: Array<{
  generation: Generation;
  minYear: number;
  maxYear: number;
}> = [
  { generation: 'elder', minYear: 1925, maxYear: 1964 },
  { generation: 'gen-x', minYear: 1965, maxYear: 1980 },
  { generation: 'millennials', minYear: 1981, maxYear: 1996 },
  { generation: 'gen-z', minYear: 1997, maxYear: 2012 },
  { generation: 'gen-alpha', minYear: 2013, maxYear: 2028 },
];

/**
 * Mappa födelseår till generation. Spelare utanför 1925-2028 mappas till
 * närmsta gränsgrupp (clamping).
 */
export function birthYearToGeneration(birthYear: number): Generation {
  if (birthYear < GENERATION_BIRTH_RANGES[0].minYear) return 'elder';
  for (const range of GENERATION_BIRTH_RANGES) {
    if (birthYear >= range.minYear && birthYear <= range.maxYear) {
      return range.generation;
    }
  }
  return 'gen-alpha';
}

/**
 * Minsta antal generationer mellan player och item-audience.
 * 0 = item är inom spelarens generation; 4 = max distans (elder ↔ gen-alpha).
 * 'all' i audience betyder alltid 0 (relevant för alla).
 */
export function generationDistance(
  player: Generation,
  audience: Audience[],
): number {
  if (audience.includes('all')) return 0;
  const playerIndex = GENERATION_ORDER.indexOf(player);
  let minDist = Infinity;
  for (const a of audience) {
    if (a === 'all') return 0;
    const aIndex = GENERATION_ORDER.indexOf(a);
    if (aIndex === -1) continue;
    minDist = Math.min(minDist, Math.abs(playerIndex - aIndex));
  }
  return minDist === Infinity ? GENERATION_ORDER.length : minDist;
}

// Prefix-längd per skill level för Letter Grid Steg 1.
// Easy = 3 bokstäver; Intermediate = 2; Expert (Advanced) = 1.
const PREFIX_LENGTH_BY_SKILL: Record<SkillLevel, number> = {
  easy: 3,
  intermediate: 2,
  expert: 1,
};

export type LetterGridConfig =
  | { mode: 'full-names' }
  | { mode: 'prefix'; length: number };

/**
 * Avgör hur Steg 1 (Letter Grid) ska visas för en spelare på ett item.
 *
 * Reglerna (i prioritetsordning):
 * 1. Född 2016+ → alltid hela namn (yngsta gen Alpha kan inte hantera prefix).
 * 2. Född 2013-2015 → prefix om generations-avstånd ≤ 1, annars hela namn.
 * 3. Övriga → prefix om generations-avstånd ≤ 2, annars hela namn.
 *    (Millennials har max-avstånd 2 till alla generationer, så får alltid prefix.)
 *
 * När mode = 'prefix' bestäms längden av playerSkill.
 */
export function getLetterGridConfig(args: {
  playerBirthYear: number;
  playerSkill: SkillLevel;
  itemAudience: Audience[];
}): LetterGridConfig {
  const { playerBirthYear, playerSkill, itemAudience } = args;

  if (playerBirthYear >= 2016) {
    return { mode: 'full-names' };
  }

  const player = birthYearToGeneration(playerBirthYear);
  const distance = generationDistance(player, itemAudience);

  // Specialregel för äldre Gen Alpha (födda 2013-2015): tröskeln är >1, inte >2.
  if (playerBirthYear >= 2013 && playerBirthYear <= 2015) {
    if (distance > 1) return { mode: 'full-names' };
  } else {
    if (distance > 2) return { mode: 'full-names' };
  }

  return { mode: 'prefix', length: PREFIX_LENGTH_BY_SKILL[playerSkill] };
}

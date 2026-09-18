import { describe, it, expect } from 'vitest';
import {
  itemPassesGeneration,
  filterByGenerationRecognition,
  GenerationScreenData,
} from '../../../src/utils/generationRecognition';

// gen index: elder 0, gen-x 1, millennials 2, gen-z 3, gen-alpha 4.
const HENDRIX: GenerationScreenData = { originGenerations: ['elder'], itemHcp: 65 };
const OBSCURE_ELDER: GenerationScreenData = { originGenerations: ['elder'], itemHcp: 30 };

describe('itemPassesGeneration — gentle older-content screen', () => {
  it('never screens older content within 2 generations', () => {
    // gen-x player (d=1) and millennials player (d=2) — no bar.
    expect(itemPassesGeneration(OBSCURE_ELDER, ['gen-x'], 99)).toBe(true);
    expect(itemPassesGeneration(OBSCURE_ELDER, ['millennials'], 99)).toBe(true);
  });

  it('at distance 3 keeps iconic old content but screens obscure', () => {
    // gen-z player vs elder origin (d=3), bar 40.
    expect(itemPassesGeneration(HENDRIX, ['gen-z'], 99)).toBe(true); // 65 >= 40
    expect(itemPassesGeneration(OBSCURE_ELDER, ['gen-z'], 99)).toBe(false); // 30 < 40
  });

  it('at distance 4 (elder → gen-alpha) only the most iconic survive', () => {
    // gen-alpha player vs elder origin (d=4), bar 60.
    expect(itemPassesGeneration(HENDRIX, ['gen-alpha'], 99)).toBe(true); // 65 >= 60
    expect(
      itemPassesGeneration({ originGenerations: ['elder'], itemHcp: 50 }, ['gen-alpha'], 99),
    ).toBe(false); // 50 < 60
  });

  it('lowers the bar for skilled (low-HCP) players', () => {
    // Same obscure distant item, expert player (< 20) → bar removed.
    expect(itemPassesGeneration(OBSCURE_ELDER, ['gen-z'], 15)).toBe(true);
  });
});

describe('itemPassesGeneration — younger-content distance rule', () => {
  const GENZ_ORIGIN: GenerationScreenData = { originGenerations: ['gen-z'], itemHcp: 100 };
  const GENX_ORIGIN: GenerationScreenData = { originGenerations: ['gen-x'], itemHcp: 100 };
  const ALPHA_ORIGIN: GenerationScreenData = { originGenerations: ['gen-alpha'], itemHcp: 100 };

  it('excludes younger content at distance >= 3', () => {
    // elder player vs gen-z origin (d=3) → excluded regardless of itemHcp.
    expect(itemPassesGeneration(GENZ_ORIGIN, ['elder'], 99)).toBe(false);
  });

  it('allows younger content at distance <= 2', () => {
    expect(itemPassesGeneration(GENX_ORIGIN, ['elder'], 99)).toBe(true); // d=1
    expect(itemPassesGeneration(ALPHA_ORIGIN, ['millennials'], 99)).toBe(true); // d=2
  });

  it('lets experts reach younger content one generation further (d=3)', () => {
    expect(itemPassesGeneration(GENZ_ORIGIN, ['elder'], 15)).toBe(true); // expert d=3
  });
});

describe('itemPassesGeneration — bypass cases', () => {
  it('always passes unconstrained items (empty / undefined origin)', () => {
    expect(itemPassesGeneration({ originGenerations: [], itemHcp: 5 }, ['gen-z'], 99)).toBe(true);
    expect(itemPassesGeneration({ itemHcp: 5 }, ['gen-z'], 99)).toBe(true);
  });

  it('bypasses when there are no player generations (no age info)', () => {
    expect(itemPassesGeneration(OBSCURE_ELDER, [], 99)).toBe(true);
  });

  it('uses union semantics across players — kept if OK for any player', () => {
    // Mixed lobby: elder + gen-z. Elder origin is fine for the elder player (d=0),
    // so an obscure elder item stays even though it fails for the gen-z player.
    expect(itemPassesGeneration(OBSCURE_ELDER, ['elder', 'gen-z'], 99)).toBe(true);
  });
});

describe('filterByGenerationRecognition — anti-collapse', () => {
  const id = (x: GenerationScreenData) => x;

  it('screens obscure old content when the pool is large enough', () => {
    const pool: GenerationScreenData[] = [
      ...Array.from({ length: 40 }, () => ({ originGenerations: ['elder'] as const, itemHcp: 65 })),
      ...Array.from({ length: 20 }, () => ({ originGenerations: ['elder'] as const, itemHcp: 20 })),
    ];
    const kept = filterByGenerationRecognition(pool, id, ['gen-z'], 99, 30);
    // 40 iconic (65 >= 40) kept at relax 0, which already >= minCount → obscure screened.
    expect(kept.length).toBe(40);
    expect(kept.every((q) => q.itemHcp === 65)).toBe(true);
  });

  it('relaxes rather than collapsing below minCount', () => {
    // 31 obscure elder items for a gen-z player: strict screening keeps 0, so the
    // wrapper relaxes until they pass — never collapses the pool.
    const pool: GenerationScreenData[] = Array.from({ length: 31 }, () => ({
      originGenerations: ['elder'] as const,
      itemHcp: 20,
    }));
    // Sanity: strict (relax 0) would drop them all.
    expect(pool.every((q) => !itemPassesGeneration(q, ['gen-z'], 99, 0))).toBe(true);
    const kept = filterByGenerationRecognition(pool, id, ['gen-z'], 99, 30);
    expect(kept.length).toBe(31);
  });

  it('does not filter a pool at or below minCount', () => {
    const pool: GenerationScreenData[] = Array.from({ length: 10 }, () => ({
      originGenerations: ['elder'] as const,
      itemHcp: 20,
    }));
    const kept = filterByGenerationRecognition(pool, id, ['gen-z'], 99, 30);
    expect(kept.length).toBe(10);
  });

  it('bypasses when player generations are empty', () => {
    const pool: GenerationScreenData[] = Array.from({ length: 40 }, () => ({
      originGenerations: ['elder'] as const,
      itemHcp: 20,
    }));
    const kept = filterByGenerationRecognition(pool, id, [], 99, 30);
    expect(kept.length).toBe(40);
  });
});

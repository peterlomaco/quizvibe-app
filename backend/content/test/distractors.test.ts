import { describe, it, expect } from 'vitest';
import {
  getPrefixForItem,
  buildLetterGrid,
  buildNameOptions,
  DEFAULT_TOTAL_OPTIONS,
} from '../distractors';
import { loadCatalog, findItemsById } from '../registry';

// Deterministisk rng för reproducerbara tester. Mulberry32-style.
function seededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('getPrefixForItem', () => {
  it('extracts simple prefix from one-word name', () => {
    expect(getPrefixForItem('ABBA', 2)).toBe('AB');
    expect(getPrefixForItem('Madonna', 3)).toBe('MAD');
    expect(getPrefixForItem('Eminem', 1)).toBe('E');
  });

  it('skips spaces and takes letters from full name', () => {
    expect(getPrefixForItem('Mark Zuckerberg', 2)).toBe('MA');
    expect(getPrefixForItem('Mark Zuckerberg', 3)).toBe('MAR');
    expect(getPrefixForItem('Olof Palme', 3)).toBe('OLO');
  });

  it('skips punctuation and special characters', () => {
    expect(getPrefixForItem('Spider-Man', 3)).toBe('SPI');
    expect(getPrefixForItem('John F. Kennedy', 3)).toBe('JOH');
    expect(getPrefixForItem('Washington, D.C.', 4)).toBe('WASH');
  });

  it('preserves diacritics', () => {
    expect(getPrefixForItem('Björn Borg', 2)).toBe('BJ');
    expect(getPrefixForItem('Carola Häggkvist', 3)).toBe('CAR');
    expect(getPrefixForItem('Lasse Åberg', 3)).toBe('LAS');
    expect(getPrefixForItem('Zlatan Ibrahimović', 2)).toBe('ZL');
  });

  it('returns full available letters when length exceeds name', () => {
    expect(getPrefixForItem('Ed', 5)).toBe('ED');
  });

  it('returns empty string for non-letter input', () => {
    expect(getPrefixForItem('123', 2)).toBe('');
    expect(getPrefixForItem('---', 2)).toBe('');
  });
});

describe('buildLetterGrid', () => {
  it('includes the correct prefix exactly once', () => {
    const catalog = loadCatalog();
    const correct = findItemsById(catalog, 'cristiano-ronaldo')[0].item;
    const grid = buildLetterGrid({
      catalog,
      category: 'persons',
      playerGeneration: 'millennials',
      correctItem: correct,
      prefixLength: 2,
      rng: seededRng(1),
    });

    const correctOptions = grid.filter((o) => o.isCorrect);
    expect(correctOptions).toHaveLength(1);
    expect(correctOptions[0].prefix).toBe('CR');
  });

  it('returns up to totalOptions unique prefixes', () => {
    const catalog = loadCatalog();
    const correct = findItemsById(catalog, 'abba')[0].item;
    const grid = buildLetterGrid({
      catalog,
      category: 'persons',
      playerGeneration: 'gen-x',
      correctItem: correct,
      prefixLength: 2,
      rng: seededRng(42),
    });

    expect(grid.length).toBeLessThanOrEqual(DEFAULT_TOTAL_OPTIONS);
    const prefixes = grid.map((o) => o.prefix);
    expect(new Set(prefixes).size).toBe(prefixes.length);
  });

  it('respects totalOptions parameter', () => {
    const catalog = loadCatalog();
    const correct = findItemsById(catalog, 'astrid-lindgren')[0].item;
    const grid = buildLetterGrid({
      catalog,
      category: 'persons',
      playerGeneration: 'elder',
      correctItem: correct,
      prefixLength: 2,
      totalOptions: 5,
      rng: seededRng(7),
    });
    expect(grid.length).toBeLessThanOrEqual(5);
  });

  it('falls back to broader pool when audience-pool is too small', () => {
    // capitals-elder.yaml har bara 1 item (Moscow). För Moscow ska vi
    // hämta distractor-prefixer från övriga capitals-filer (London, Paris...).
    const catalog = loadCatalog();
    const correct = findItemsById(catalog, 'moscow')[0].item;
    const grid = buildLetterGrid({
      catalog,
      category: 'capitals',
      playerGeneration: 'elder',
      correctItem: correct,
      prefixLength: 2,
      rng: seededRng(3),
    });

    // Vi har 9 capitals totalt; minus Moscow = 8 möjliga distractors.
    // Plus Moscow självt = 9 unika prefixer max.
    expect(grid.length).toBeGreaterThan(1);
    expect(grid.find((o) => o.isCorrect)?.prefix).toBe('MO');
  });

  it('excludes sensitive items by default', () => {
    const catalog = loadCatalog();
    // Welch Hitler skulle ge prefix "AD" (Adolf), Stalin "JO" (Josef).
    // Vid expert (1 bokstav) skulle vi få "A" och "J" — lätt att verifiera frånvaro.
    const correct = findItemsById(catalog, 'winston-churchill')[0].item;
    const grid = buildLetterGrid({
      catalog,
      category: 'persons',
      playerGeneration: 'elder',
      correctItem: correct,
      prefixLength: 4,
      rng: seededRng(99),
    });
    const prefixes = grid.map((o) => o.prefix);
    expect(prefixes).not.toContain('ADOL');
    expect(prefixes).not.toContain('JOSE');
  });

  it('produces deterministic output with the same seed', () => {
    const catalog = loadCatalog();
    const correct = findItemsById(catalog, 'avicii')[0].item;
    const args = {
      catalog,
      category: 'persons' as const,
      playerGeneration: 'millennials' as const,
      correctItem: correct,
      prefixLength: 2,
    };
    const a = buildLetterGrid({ ...args, rng: seededRng(123) });
    const b = buildLetterGrid({ ...args, rng: seededRng(123) });
    expect(a).toEqual(b);
  });

  it('fills to totalOptions even for capitals where catalog is tiny (uses distractor-pool)', () => {
    // capitals-elder.yaml har bara 1 item (Moscow). capitals totalt = 9.
    // Med distractor-pool fallback ska vi alltid kunna fylla 10 unika prefixer.
    const catalog = loadCatalog();
    const correct = findItemsById(catalog, 'moscow')[0].item;
    const grid = buildLetterGrid({
      catalog,
      category: 'capitals',
      playerGeneration: 'elder',
      correctItem: correct,
      prefixLength: 2,
      rng: seededRng(50),
    });
    expect(grid).toHaveLength(DEFAULT_TOTAL_OPTIONS);
  });
});

describe('buildNameOptions', () => {
  it('includes correct item when correct prefix is selected', () => {
    const catalog = loadCatalog();
    const correct = findItemsById(catalog, 'lionel-messi')[0].item;
    const options = buildNameOptions({
      catalog,
      category: 'persons',
      playerGeneration: 'millennials',
      correctItem: correct,
      selectedPrefix: 'LI',
      prefixLength: 2,
      rng: seededRng(5),
    });
    const correctOption = options.find((o) => o.isCorrect);
    expect(correctOption?.itemId).toBe('lionel-messi');
  });

  it('does NOT include correct item when wrong prefix is selected', () => {
    const catalog = loadCatalog();
    const correct = findItemsById(catalog, 'lionel-messi')[0].item;
    // Spelaren valde "ZL" (Zlatan), men rätt motiv är Messi (LI). Inget rätt-svar i listan.
    const options = buildNameOptions({
      catalog,
      category: 'persons',
      playerGeneration: 'millennials',
      correctItem: correct,
      selectedPrefix: 'ZL',
      prefixLength: 2,
      rng: seededRng(5),
    });
    expect(options.every((o) => !o.isCorrect)).toBe(true);
    expect(options.find((o) => o.itemId === 'lionel-messi')).toBeUndefined();
  });

  it('all options have the same prefix as selectedPrefix', () => {
    const catalog = loadCatalog();
    const correct = findItemsById(catalog, 'cristiano-ronaldo')[0].item;
    const options = buildNameOptions({
      catalog,
      category: 'persons',
      playerGeneration: 'gen-z',
      correctItem: correct,
      selectedPrefix: 'CR',
      prefixLength: 2,
      rng: seededRng(11),
    });
    for (const opt of options) {
      expect(getPrefixForItem(opt.displayName, 2)).toBe('CR');
    }
  });

  it('dedupes items that appear in multiple files (cross-audience)', () => {
    // Zlatan finns i både millennials och gen-z. Han ska bara dyka upp en gång
    // även om audience-pool inkluderar båda filerna.
    const catalog = loadCatalog();
    const correct = findItemsById(catalog, 'zlatan-ibrahimovic')[0].item;
    const options = buildNameOptions({
      catalog,
      category: 'persons',
      playerGeneration: 'gen-z',
      correctItem: correct,
      selectedPrefix: 'ZL',
      prefixLength: 2,
      rng: seededRng(17),
    });
    const zlatanOccurrences = options.filter((o) => o.itemId === 'zlatan-ibrahimovic');
    expect(zlatanOccurrences).toHaveLength(1);
    expect(zlatanOccurrences[0].isCorrect).toBe(true);
  });

  it('produces deterministic output with the same seed', () => {
    const catalog = loadCatalog();
    const correct = findItemsById(catalog, 'mario')[0].item;
    const args = {
      catalog,
      category: 'persons' as const,
      playerGeneration: 'gen-alpha' as const,
      correctItem: correct,
      selectedPrefix: 'MA',
      prefixLength: 2,
    };
    const a = buildNameOptions({ ...args, rng: seededRng(2024) });
    const b = buildNameOptions({ ...args, rng: seededRng(2024) });
    expect(a).toEqual(b);
  });

  it('returns at most totalOptions when wrong prefix is selected', () => {
    const catalog = loadCatalog();
    const correct = findItemsById(catalog, 'lionel-messi')[0].item;
    const options = buildNameOptions({
      catalog,
      category: 'persons',
      playerGeneration: 'millennials',
      correctItem: correct,
      selectedPrefix: 'ZL',
      prefixLength: 2,
      totalOptions: 10,
      rng: seededRng(5),
    });
    expect(options.length).toBeLessThanOrEqual(10);
  });

  it('all options have source field set to catalog or pool', () => {
    const catalog = loadCatalog();
    const correct = findItemsById(catalog, 'astrid-lindgren')[0].item;
    const options = buildNameOptions({
      catalog,
      category: 'persons',
      playerGeneration: 'elder',
      correctItem: correct,
      selectedPrefix: 'AS',
      prefixLength: 2,
      rng: seededRng(99),
    });
    for (const opt of options) {
      expect(['catalog', 'pool']).toContain(opt.source);
    }
  });

  it('fills with pool-distractors when catalog has too few matching prefix', () => {
    // For "AS"-prefixed Millennials persons, catalogen har bara Astrid Lindgren
    // (i elder, inte millennials) → millennials-pool har inga "AS"-personer.
    // Pool-fallback ska ge oss namn som börjar med "AS".
    const catalog = loadCatalog();
    const correct = findItemsById(catalog, 'avicii')[0].item;
    const options = buildNameOptions({
      catalog,
      category: 'persons',
      playerGeneration: 'millennials',
      correctItem: correct,
      selectedPrefix: 'AN', // "Anna ..." finns i pool
      prefixLength: 2,
      rng: seededRng(42),
    });
    // Förvänta att åtminstone några options finns (från pool om inte katalog)
    expect(options.length).toBeGreaterThan(0);
    for (const opt of options) {
      expect(getPrefixForItem(opt.displayName, 2)).toBe('AN');
    }
  });

  it('pool-options have itemId starting with "pool:"', () => {
    const catalog = loadCatalog();
    const correct = findItemsById(catalog, 'avicii')[0].item;
    const options = buildNameOptions({
      catalog,
      category: 'persons',
      playerGeneration: 'millennials',
      correctItem: correct,
      selectedPrefix: 'AN',
      prefixLength: 2,
      rng: seededRng(42),
    });
    const poolOptions = options.filter((o) => o.source === 'pool');
    for (const opt of poolOptions) {
      expect(opt.itemId.startsWith('pool:')).toBe(true);
    }
  });
});

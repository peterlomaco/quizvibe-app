import { describe, it, expect } from 'vitest';
import {
  birthYearToGeneration,
  generationDistance,
  getLetterGridConfig,
} from '../generation';

describe('birthYearToGeneration', () => {
  it('maps representative years to correct generation', () => {
    expect(birthYearToGeneration(1950)).toBe('elder');
    expect(birthYearToGeneration(1970)).toBe('gen-x');
    expect(birthYearToGeneration(1990)).toBe('millennials');
    expect(birthYearToGeneration(2000)).toBe('gen-z');
    expect(birthYearToGeneration(2015)).toBe('gen-alpha');
  });

  it('handles boundary years correctly', () => {
    expect(birthYearToGeneration(1925)).toBe('elder');
    expect(birthYearToGeneration(1964)).toBe('elder');
    expect(birthYearToGeneration(1965)).toBe('gen-x');
    expect(birthYearToGeneration(1980)).toBe('gen-x');
    expect(birthYearToGeneration(1981)).toBe('millennials');
    expect(birthYearToGeneration(1996)).toBe('millennials');
    expect(birthYearToGeneration(1997)).toBe('gen-z');
    expect(birthYearToGeneration(2012)).toBe('gen-z');
    expect(birthYearToGeneration(2013)).toBe('gen-alpha');
    expect(birthYearToGeneration(2028)).toBe('gen-alpha');
  });

  it('clamps out-of-range years', () => {
    expect(birthYearToGeneration(1900)).toBe('elder');
    expect(birthYearToGeneration(2050)).toBe('gen-alpha');
  });
});

describe('generationDistance', () => {
  it('returns 0 when audience contains player generation', () => {
    expect(generationDistance('millennials', ['millennials'])).toBe(0);
  });

  it('returns 0 when audience is "all"', () => {
    expect(generationDistance('elder', ['all'])).toBe(0);
    expect(generationDistance('gen-alpha', ['all'])).toBe(0);
  });

  it('measures linear distance between generations', () => {
    expect(generationDistance('elder', ['gen-x'])).toBe(1);
    expect(generationDistance('elder', ['millennials'])).toBe(2);
    expect(generationDistance('elder', ['gen-z'])).toBe(3);
    expect(generationDistance('elder', ['gen-alpha'])).toBe(4);
    expect(generationDistance('gen-alpha', ['elder'])).toBe(4);
  });

  it('returns minimum distance across audience array', () => {
    // Item kända för Elder + Gen X. Millennials är 1 från gen-x, 2 från elder.
    expect(generationDistance('millennials', ['elder', 'gen-x'])).toBe(1);
  });

  it('Millennials max-distance to any single generation is 2', () => {
    expect(generationDistance('millennials', ['elder'])).toBe(2);
    expect(generationDistance('millennials', ['gen-alpha'])).toBe(2);
    // Detta bekräftar Peters logik: Millennials får aldrig "full-names"
    // utlöst av distance > 2-regeln (de är max 2 från alla generationer).
  });
});

describe('getLetterGridConfig', () => {
  it('returns full-names for players born 2016 or later', () => {
    expect(
      getLetterGridConfig({
        playerBirthYear: 2016,
        playerAssistance: 'full',
        itemAudience: ['gen-alpha'],
      }),
    ).toEqual({ mode: 'full-names' });
    expect(
      getLetterGridConfig({
        playerBirthYear: 2020,
        playerAssistance: 'minimal',
        itemAudience: ['millennials'],
      }),
    ).toEqual({ mode: 'full-names' });
  });

  it('born 2013-2015: full-names if distance > 1', () => {
    // Distance från gen-alpha till gen-x är 3 → full-names
    expect(
      getLetterGridConfig({
        playerBirthYear: 2014,
        playerAssistance: 'standard',
        itemAudience: ['gen-x'],
      }),
    ).toEqual({ mode: 'full-names' });
  });

  it('born 2013-2015: prefix if distance ≤ 1', () => {
    // Distance från gen-alpha till gen-z är 1 → prefix
    expect(
      getLetterGridConfig({
        playerBirthYear: 2014,
        playerAssistance: 'standard',
        itemAudience: ['gen-z'],
      }),
    ).toEqual({ mode: 'prefix', length: 2 });
  });

  it('non-Alpha player: full-names if distance > 2', () => {
    // Elder spelare, item kända för Gen Alpha → distance 4 → full-names
    expect(
      getLetterGridConfig({
        playerBirthYear: 1950,
        playerAssistance: 'full',
        itemAudience: ['gen-alpha'],
      }),
    ).toEqual({ mode: 'full-names' });
  });

  it('non-Alpha player: prefix if distance ≤ 2', () => {
    // Millennial spelare, item kända för Elder → distance 2 → prefix
    expect(
      getLetterGridConfig({
        playerBirthYear: 1990,
        playerAssistance: 'standard',
        itemAudience: ['elder'],
      }),
    ).toEqual({ mode: 'prefix', length: 2 });
  });

  it('Millennials always gets prefix (distance ≤ 2 to all generations)', () => {
    // Verify Peters logik: Millennials får aldrig full-names utlöst av distance
    const generations = ['elder', 'gen-x', 'millennials', 'gen-z', 'gen-alpha'] as const;
    for (const aud of generations) {
      const config = getLetterGridConfig({
        playerBirthYear: 1990,
        playerAssistance: 'standard',
        itemAudience: [aud],
      });
      expect(config.mode, `Millennials vs ${aud}`).toBe('prefix');
    }
  });

  it('assistance level controls prefix length', () => {
    const baseArgs = {
      playerBirthYear: 1990,
      itemAudience: ['millennials' as const],
    };
    expect(
      getLetterGridConfig({ ...baseArgs, playerAssistance: 'full' }),
    ).toEqual({ mode: 'prefix', length: 3 });
    expect(
      getLetterGridConfig({ ...baseArgs, playerAssistance: 'standard' }),
    ).toEqual({ mode: 'prefix', length: 2 });
    expect(
      getLetterGridConfig({ ...baseArgs, playerAssistance: 'minimal' }),
    ).toEqual({ mode: 'prefix', length: 1 });
  });

  it('audience "all" always gives distance 0', () => {
    // Capitals audience=all → alla spelare får prefix oavsett ålder
    expect(
      getLetterGridConfig({
        playerBirthYear: 1950,
        playerAssistance: 'standard',
        itemAudience: ['all'],
      }),
    ).toEqual({ mode: 'prefix', length: 2 });
  });
});

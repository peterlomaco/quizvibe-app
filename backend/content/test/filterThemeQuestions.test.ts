import { describe, expect, it } from 'vitest';

/**
 * Filter group (Peter 2026-11-26): "Include theme-specific questions" puts the
 * theme-only items (inBaseCatalog: false) into Generic games; "Include mature
 * content" takes precedence. Client module under src/utils (pure).
 */
import { inGenericPool, themeItemAllowed } from '../../../src/utils/hostPackages';
import { MUSIC_QUESTIONS } from '../../../src/utils/musicQuestions';

const base = { inBaseCatalog: true, genrePackages: ['Melodifestivalen'] };
const mello = { inBaseCatalog: false, genrePackages: ['Melodifestivalen'] };
const hiphop = { inBaseCatalog: false, genrePackages: ['Hip Hop'] };
const rnb = { inBaseCatalog: false, genrePackages: ['RnB'] };

describe('themeItemAllowed', () => {
  it('allows everything when mature content is included', () => {
    expect(themeItemAllowed(['Hip Hop'], false)).toBe(true);
    expect(themeItemAllowed(['Melodifestivalen'], false)).toBe(true);
  });
  it('keeps parent-restricted package items out when mature content is excluded', () => {
    expect(themeItemAllowed(['Hip Hop'], true)).toBe(false);
    expect(themeItemAllowed(['RnB'], true)).toBe(false);
    expect(themeItemAllowed(['Melodifestivalen'], true)).toBe(true);
    expect(themeItemAllowed(undefined, true)).toBe(true);
  });
});

describe('inGenericPool', () => {
  it('theme OFF changes nothing: only base-catalog items', () => {
    for (const pc of [true, false]) {
      expect(inGenericPool(base, false, pc)).toBe(true);
      expect(inGenericPool(mello, false, pc)).toBe(false);
      expect(inGenericPool(hiphop, false, pc)).toBe(false);
    }
  });
  it('theme ON adds Melodifestivalen items', () => {
    expect(inGenericPool(mello, true, false)).toBe(true);
    expect(inGenericPool(mello, true, true)).toBe(true);
  });
  it('theme ON + mature excluded keeps Hip Hop & RnB items out', () => {
    expect(inGenericPool(hiphop, true, true)).toBe(false);
    expect(inGenericPool(rnb, true, true)).toBe(false);
    expect(inGenericPool(hiphop, true, false)).toBe(true);
  });
  it('real catalog: theme OFF pool equals the old base-catalog rule', () => {
    const old = MUSIC_QUESTIONS.filter((q) => q.inBaseCatalog !== false).length;
    const now = MUSIC_QUESTIONS.filter((q) => inGenericPool(q, false, false)).length;
    expect(now).toBe(old);
    const withTheme = MUSIC_QUESTIONS.filter((q) => inGenericPool(q, true, false)).length;
    expect(withTheme).toBeGreaterThan(old);
  });
});

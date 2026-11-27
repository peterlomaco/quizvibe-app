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

/**
 * R2b automated verification (Build 41 release checklist, 2026-11-27):
 * a FREE user (no Premium, no package) can include previously theme-exclusive
 * questions via the Filter switch, while "Include mature content" OFF still
 * keeps parent-restricted (Hip Hop & RnB) items out. Runs against the real
 * exported catalog, plus source guards that no Premium check gates the switch.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PURCHASED_PACKAGES } from '../../../src/utils/mockPurchasedPackages';

const RESTRICTED = new Set(
  PURCHASED_PACKAGES.filter((p) => p.parentRestricted).flatMap((p) => p.tags),
);
const isRestricted = (q: { genrePackages?: readonly string[] }) =>
  (q.genrePackages ?? []).some((t) => RESTRICTED.has(t));
const themeOnly = MUSIC_QUESTIONS.filter((q) => q.inBaseCatalog === false);
const repo = (p: string) => readFileSync(resolve(__dirname, '../../..', p), 'utf8');

describe('R2b — Free users and theme-specific questions (real catalog)', () => {
  it('the catalog has theme-only items, both restricted and unrestricted', () => {
    expect(themeOnly.length).toBeGreaterThan(0);
    expect(themeOnly.some(isRestricted)).toBe(true);
    expect(themeOnly.some((q) => !isRestricted(q))).toBe(true);
  });

  it('theme ON + mature excluded: every unrestricted theme-only item joins, no restricted one', () => {
    const pool = MUSIC_QUESTIONS.filter((q) => inGenericPool(q, true, true));
    const poolIds = new Set(pool.map((q) => q.id));
    for (const q of themeOnly) {
      expect(poolIds.has(q.id), q.id).toBe(!isRestricted(q));
    }
  });

  it('theme ON + mature included: every theme-only item joins', () => {
    const poolIds = new Set(MUSIC_QUESTIONS.filter((q) => inGenericPool(q, true, false)).map((q) => q.id));
    for (const q of themeOnly) expect(poolIds.has(q.id), q.id).toBe(true);
  });

  it('theme OFF: no theme-only item joins, regardless of mature content', () => {
    for (const pc of [true, false]) {
      expect(themeOnly.some((q) => inGenericPool(q, false, pc))).toBe(false);
    }
  });

  it('the pool rule takes no Premium input (signature guard)', () => {
    // (item, includeThemeQuestions, parentControlEnabled) — nothing else.
    expect(inGenericPool.length).toBe(3);
    expect(themeItemAllowed.length).toBe(2);
  });

  it('no Premium gate on the theme switch in Lobby, Profile, quiz or FilterGroup', () => {
    const quiz = repo('app/quiz.tsx');
    const derive = quiz.match(/const includeThemeQuestions =[^;]+;/)?.[0] ?? '';
    expect(derive).toContain("params.includeThemeQuestions === 'true'");
    expect(derive).not.toMatch(/premium/i);

    const lobby = repo('src/screens/LobbyScreen.tsx');
    const filterJsx = lobby.slice(lobby.indexOf('<FilterGroup'), lobby.indexOf('/>', lobby.indexOf('<FilterGroup')));
    expect(filterJsx).toContain('themeIncluded={includeThemeQuestions && !isGuestHost}');
    expect(filterJsx).not.toMatch(/premium/i);

    const group = repo('src/components/FilterGroup.tsx');
    expect(group).not.toMatch(/hasPremium|PremiumSubscription|getCachedPremium/);

    const profile = repo('src/screens/ProfileScreen.tsx');
    const pStart = profile.indexOf('<FilterGroup');
    expect(pStart).toBeGreaterThan(-1);
    const profileJsx = profile.slice(pStart, profile.indexOf('/>', pStart));
    expect(profileJsx).not.toMatch(/premium/i);
  });
});

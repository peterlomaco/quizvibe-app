// Tester för återanvända musik-pool-tracks som song-hints (Peter 2026-09-22):
//   1. Join sker på displayName-artist-delen (em-dash), inte id-prefix.
//   2. Bara TUNNA entries (< 8 hints) toppas upp — rika lämnas orörda.
//   3. Inga dubblett-titlar introduceras (dedup).
//
// Ligger i backend-sviten (enda vitest-harnessen) men testar src/utils-modulerna.
// Appendade kandidat-hints har id-mönstret `song<n>` (unikt — se generatorn),
// vilket används här för att skilja dem från kuraterade/genererade hints.

import { describe, it, expect } from 'vitest';
import { HINTS_LIBRARY, HintLibrary } from '../../../src/utils/hintsData';
import { HINTS_SONG_CANDIDATES } from '../../../src/utils/hintsSongsGenerated';
import { HINTS_LIBRARY_GENERATED } from '../../../src/utils/hintsDataGenerated';

const CANDIDATE_ID_RE = /^song\d+$/;
const VALUE_RE = /^".+" \(\d{4}\)$/;

function songTitleKeys(lib: HintLibrary): string[] {
  return lib.hints
    .filter((h) => h.type === 'song' || h.type === 'album' || h.type === 'movie')
    .map((h) => h.value.match(/^"([^"]+)"/)?.[1]?.toLowerCase().trim())
    .filter((t): t is string => !!t);
}

describe('song-hint candidates (generated)', () => {
  it('joins on displayName artist-part, not song id-prefix', () => {
    // the-rolling-stones: band id has `the-` prefix but song ids are
    // `rolling-stones-*` — a prefix join would miss it.
    const rs = HINTS_SONG_CANDIDATES['the-rolling-stones'];
    expect(rs, 'the-rolling-stones should have candidates').toBeTruthy();
    expect(rs.some((h) => h.value.includes('Satisfaction'))).toBe(true);
  });

  it('every candidate is a P3 "Title" (Year) song hint', () => {
    for (const [id, hints] of Object.entries(HINTS_SONG_CANDIDATES)) {
      for (const h of hints) {
        expect(h.type, id).toBe('song');
        expect(h.priority, id).toBe(3);
        expect(h.value, `${id} / ${h.value}`).toMatch(VALUE_RE);
      }
    }
  });
});

describe('HINTS_LIBRARY enrichment', () => {
  it('lifts at least one previously-thin generated artist to >= 8 hints', () => {
    const lifted = Object.keys(HINTS_SONG_CANDIDATES).filter((id) => {
      const gen = HINTS_LIBRARY_GENERATED[id];
      return gen && gen.hints.length < 8 && (HINTS_LIBRARY[id]?.hints.length ?? 0) >= 8;
    });
    expect(lifted.length).toBeGreaterThan(0);
  });

  it('appended entries carry the song<n> marker and never exceed the target', () => {
    for (const [id, lib] of Object.entries(HINTS_LIBRARY)) {
      const appended = lib.hints.filter((h) => CANDIDATE_ID_RE.test(h.id));
      if (appended.length === 0) continue;
      // Only thin entries get appends, capped at target 10.
      expect(lib.hints.length, `${id} exceeded target`).toBeLessThanOrEqual(10);
    }
  });

  it('leaves a richly-curated entry (michael-jackson) untouched', () => {
    const mj = HINTS_LIBRARY['michael-jackson'];
    expect(mj.hints.length).toBeGreaterThanOrEqual(8);
    // No appended candidate hints on a rich entry.
    expect(mj.hints.some((h) => CANDIDATE_ID_RE.test(h.id))).toBe(false);
  });

  it('appended hints never duplicate an existing or each-other song title', () => {
    // Scope: only the enrichment we add (song<n> markers). Pre-existing curated
    // data can legitimately repeat a title (e.g. an album named after its title
    // track) — that is out of this change's scope.
    for (const [id, lib] of Object.entries(HINTS_LIBRARY)) {
      const appended = lib.hints.filter((h) => CANDIDATE_ID_RE.test(h.id));
      if (appended.length === 0) continue;
      const existing = new Set(
        songTitleKeys({ ...lib, hints: lib.hints.filter((h) => !CANDIDATE_ID_RE.test(h.id)) }),
      );
      const seen = new Set<string>();
      for (const h of appended) {
        const key = h.value.match(/^"([^"]+)"/)?.[1]?.toLowerCase().trim();
        expect(key, `${id} appended hint missing title`).toBeTruthy();
        expect(existing.has(key!), `${id} appended dup of existing title ${key}`).toBe(false);
        expect(seen.has(key!), `${id} appended dup title ${key}`).toBe(false);
        seen.add(key!);
      }
    }
  });
});

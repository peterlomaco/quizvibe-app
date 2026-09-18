import { describe, it, expect } from 'vitest';
import { originGenerationsFromFilename } from '../originGeneration';

describe('originGenerationsFromFilename', () => {
  it('maps clean generation-suffixed image files to that generation', () => {
    expect(originGenerationsFromFilename('artists-elder.yaml')).toEqual(['elder']);
    expect(originGenerationsFromFilename('actors-gen-x.yaml')).toEqual(['gen-x']);
    expect(originGenerationsFromFilename('artists-millennials.yaml')).toEqual(['millennials']);
    expect(originGenerationsFromFilename('actors-gen-z.yaml')).toEqual(['gen-z']);
  });

  it('maps generation-suffixed song files too', () => {
    expect(originGenerationsFromFilename('songs-gen-x.yaml')).toEqual(['gen-x']);
    expect(originGenerationsFromFilename('songs-gen-alpha.yaml')).toEqual(['gen-alpha']);
  });

  it('returns [] (unconstrained) for thematic / regional / import files', () => {
    expect(originGenerationsFromFilename('songs-all.yaml')).toEqual([]);
    expect(originGenerationsFromFilename('bands-classics.yaml')).toEqual([]);
    expect(originGenerationsFromFilename('artists-sweden-classic.yaml')).toEqual([]);
    expect(originGenerationsFromFilename('artists-sweden-modern.yaml')).toEqual([]);
    expect(originGenerationsFromFilename('artists-import-2026-09.yaml')).toEqual([]);
    expect(originGenerationsFromFilename('movies-classics.yaml')).toEqual([]);
    expect(originGenerationsFromFilename('bands-sweden.yaml')).toEqual([]);
  });

  it('handles the .yml variant and path-prefixed keys (anchored on end)', () => {
    expect(originGenerationsFromFilename('artists-elder.yml')).toEqual(['elder']);
    expect(originGenerationsFromFilename('deferred/songs-gen-z.yaml')).toEqual(['gen-z']);
  });

  it('does not false-match a generation word that is not the file suffix', () => {
    // "gen-x" only counts when it is the trailing token before the extension.
    expect(originGenerationsFromFilename('gen-x-history.yaml')).toEqual([]);
  });
});

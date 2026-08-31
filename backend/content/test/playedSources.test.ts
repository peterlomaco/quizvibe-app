// Tester för collectPlayedSources — underlaget till Player history:s
// "Sources"-etikett.
//
// Bakgrund: etiketten byggdes tidigare ur host:s TOGGLE-läge, och
// `imagesEnabled` var dessutom hårdkodad `true` i quiz.tsx, så varje rad
// påstod "Images" oavsett vad som spelats. Underlaget är nu källorna som
// FAKTISKT serverades. Toggle-läget duger inte: Hints-kvoten är floor(N/4),
// så 2-3 rundor med Hints påslaget serverar noll Hints-frågor.
//
// Ligger i backend-sviten (enda vitest-harnessen i repot) men testar
// klient-modulen under src/utils.

import { describe, it, expect } from 'vitest';
import {
  collectPlayedSources,
  PLAYED_MEDIA_SOURCE_ORDER,
  PLAYED_MEDIA_SOURCE_LABEL,
  type PlayedMediaSource,
} from '../../../src/utils/mediaSource';

/** Alla index i en sekvens — "spelaren spelade hela spelet". */
const allOf = (seq: readonly unknown[]) => seq.map((_, i) => i);

describe('collectPlayedSources', () => {
  it("exkluderar 'none' — frågor utan media räknas inte som en källa", () => {
    const seq = ['youtube', 'none', 'none'] as const;
    expect(collectPlayedSources(seq, allOf(seq))).toEqual(['youtube']);
  });

  it('ger tom array när ingenting serverades', () => {
    const seq = ['none', 'none'] as const;
    expect(collectPlayedSources(seq, allOf(seq))).toEqual([]);
  });

  it('kollapsar dubbletter till distinkta källor', () => {
    const seq = ['youtube', 'youtube', 'youtube', 'image'] as const;
    expect(collectPlayedSources(seq, allOf(seq))).toEqual(['youtube', 'image']);
  });

  it('returnerar kanonisk ordning Spotify → YouTube → Hints oavsett input-ordning', () => {
    const seq = ['image', 'youtube', 'spotify'] as const;
    expect(collectPlayedSources(seq, allOf(seq))).toEqual(['spotify', 'youtube', 'image']);
    // Omvänd input ger samma output.
    const reversed = ['spotify', 'youtube', 'image'] as const;
    expect(collectPlayedSources(reversed, allOf(reversed))).toEqual([
      'spotify',
      'youtube',
      'image',
    ]);
  });

  it('ignorerar index utanför sekvensen', () => {
    const seq = ['youtube', 'image'] as const;
    // Negativa och för höga index (t.ex. skev questionNumber) får inte krascha.
    expect(collectPlayedSources(seq, [-1, 0, 99])).toEqual(['youtube']);
  });

  it('ignorerar tom index-lista', () => {
    const seq = ['youtube', 'image'] as const;
    expect(collectPlayedSources(seq, [])).toEqual([]);
  });

  it('PtP-spectator: bara spelarens EGNA turer räknas', () => {
    // 4 frågor i matchen; spelaren svarade på fråga 2 och 4 (index 1 och 3).
    // De var båda YouTube — Hints på index 0/2 var någon annans turer och
    // ska INTE hamna på den här spelarens history-rad.
    const seq = ['image', 'youtube', 'image', 'youtube'] as const;
    expect(collectPlayedSources(seq, [1, 3])).toEqual(['youtube']);
  });

  it('regressionen: YouTube-only-spel märks aldrig med Hints', () => {
    // 3-rundors spel med Hints påslaget i lobbyn → floor(3/4) = 0 Hints-frågor.
    const seq = ['youtube', 'youtube', 'youtube'] as const;
    const sources = collectPlayedSources(seq, allOf(seq));
    expect(sources).toEqual(['youtube']);
    expect(sources).not.toContain('image');
  });

  it('fullt spel med alla tre källorna', () => {
    const seq = ['youtube', 'spotify', 'image', 'youtube', 'spotify'] as const;
    expect(collectPlayedSources(seq, allOf(seq))).toEqual(['spotify', 'youtube', 'image']);
  });
});

describe('källvokabulär', () => {
  it("etiketterar 'image' som Hints — inte Images", () => {
    expect(PLAYED_MEDIA_SOURCE_LABEL.image).toBe('Hints');
  });

  it('har en etikett för varje källa i ordningen', () => {
    for (const src of PLAYED_MEDIA_SOURCE_ORDER) {
      expect(PLAYED_MEDIA_SOURCE_LABEL[src]).toBeTruthy();
    }
    expect(PLAYED_MEDIA_SOURCE_ORDER).toHaveLength(
      Object.keys(PLAYED_MEDIA_SOURCE_LABEL).length,
    );
  });

  it('renderad etikett matchar Player history-formatet', () => {
    const seq = ['spotify', 'youtube', 'image'] as const;
    const label = collectPlayedSources(seq, allOf(seq))
      .map((s: PlayedMediaSource) => PLAYED_MEDIA_SOURCE_LABEL[s])
      .join(' + ');
    expect(label).toBe('Spotify + YouTube + Hints');
  });
});

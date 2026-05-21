import { describe, expect, it } from 'vitest';
import { scoreSuggestion } from '../scoring';
import type { YoutubeSearchResult, YoutubeVideoDetails } from '../client';

function makeSearch(overrides: Partial<YoutubeSearchResult> = {}): YoutubeSearchResult {
  return {
    videoId: 'vid12345678',
    title: '',
    channelTitle: '',
    channelId: '',
    description: '',
    publishedAt: '2024-01-01',
    thumbnailUrl: '',
    ...overrides,
  };
}

function makeDetails(overrides: Partial<YoutubeVideoDetails> = {}): YoutubeVideoDetails {
  return {
    videoId: 'vid12345678',
    title: '',
    channelTitle: '',
    channelId: '',
    description: '',
    publishedAt: '2024-01-01',
    durationSec: 200,
    embeddable: true,
    privacyStatus: 'public',
    ageRestricted: false,
    blockedRegions: null,
    allowedRegions: null,
    license: 'youtube',
    madeForKids: false,
    definition: 'hd',
    ...overrides,
  };
}

describe('scoreSuggestion', () => {
  it('rewards HD videos', () => {
    const { score, notes } = scoreSuggestion(makeSearch(), makeDetails({ definition: 'hd' }), []);
    expect(score).toBeGreaterThanOrEqual(10);
    expect(notes.some((n) => n.includes('HD'))).toBe(true);
  });

  it('penalizes SD videos', () => {
    const { score, notes } = scoreSuggestion(makeSearch(), makeDetails({ definition: 'sd' }), []);
    expect(score).toBeLessThan(0);
    expect(notes.some((n) => n.includes('SD'))).toBe(true);
  });

  it('boosts titles containing "Official Music Video"', () => {
    const { score } = scoreSuggestion(
      makeSearch({ title: 'Thriller (Official Music Video)' }),
      makeDetails(),
      [],
    );
    // HD (+10) + official-video pattern (+8) = 18
    expect(score).toBeGreaterThanOrEqual(18);
  });

  it('penalizes lyric-video titles heavily', () => {
    const { score, notes } = scoreSuggestion(
      makeSearch({ title: 'Beat It - Lyric Video' }),
      makeDetails(),
      [],
    );
    // HD (+10) + lyric penalty (-10) = 0
    expect(score).toBe(0);
    expect(notes.some((n) => n.includes('lyric'))).toBe(true);
  });

  it('rewards VEVO channels', () => {
    const { score, notes } = scoreSuggestion(
      makeSearch(),
      makeDetails({ channelTitle: 'MichaelJacksonVEVO' }),
      [],
    );
    // HD (+10) + VEVO (+6) = 16
    expect(score).toBeGreaterThanOrEqual(16);
    expect(notes.some((n) => n.includes('VEVO'))).toBe(true);
  });

  it('penalizes Topic channels (auto-uploaded static album art)', () => {
    const { score, notes } = scoreSuggestion(
      makeSearch(),
      makeDetails({ channelTitle: 'Michael Jackson - Topic' }),
      [],
    );
    // HD (+10) + Topic (-8) = 2
    expect(score).toBe(2);
    expect(notes.some((n) => n.toLowerCase().includes('topic'))).toBe(true);
  });

  it('sinks blocked clips with large negative penalty', () => {
    const { score } = scoreSuggestion(makeSearch(), makeDetails(), ['SD resolution']);
    // -100 (blocked) + 10 (HD) = -90
    expect(score).toBeLessThanOrEqual(-90);
  });

  it('handles missing details gracefully', () => {
    const { score, notes } = scoreSuggestion(makeSearch(), undefined, ['details missing']);
    // Only blocked penalty applies; no HD/SD/channel signals
    expect(score).toBeLessThanOrEqual(-100);
    expect(notes[0]).toMatch(/blocked/);
  });

  it('combines multiple positive signals for top candidates', () => {
    const { score } = scoreSuggestion(
      makeSearch({ title: 'Bad - Official Music Video' }),
      makeDetails({ channelTitle: 'michaeljacksonVEVO', definition: 'hd' }),
      [],
    );
    // HD (+10) + official-video (+8) + VEVO (+6) = 24
    expect(score).toBeGreaterThanOrEqual(24);
  });
});

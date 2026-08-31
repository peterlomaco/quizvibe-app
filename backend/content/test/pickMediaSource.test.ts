// Tester för pickMediaSource — vilket YouTube-klipp som spelas när ett item
// bär FLERA (t.ex. officiell musikvideo + lyrics-version).
//
// Bakgrund: katalogen är på väg mot två klipp per item, dels för omväxling
// mellan spel, dels som redundans om ett klipp tas ner. Valet måste vara
// slumpat MELLAN spel men identiskt INOM ett spel: i Individual Devices
// renderar varje enhet sin egen media utifrån host:s broadcastade question_id,
// och remote 1v1 har ingen sync-kanal alls. Utan gemensam seed skulle spelarna
// se olika videor — och olika startSec — för samma fråga.
//
// Ligger i backend-sviten (enda vitest-harnessen i repot) men testar
// klient-modulen under src/utils.

import { describe, it, expect } from 'vitest';
import { pickMediaSource, type YoutubeClip } from '../../../src/utils/mediaSource';

const official: YoutubeClip = { videoId: 'OFFICIAL', startSec: 5, endSec: 35 };
const lyrics: YoutubeClip = { videoId: 'LYRICS', startSec: 0, endSec: 30 };

const opts = (clipSeed?: string) => ({
  youtubeEnabled: true,
  gameMode: 'individual-devices' as const,
  ...(clipSeed ? { clipSeed } : {}),
});

/** videoId för ett givet urval — kastar om källan inte blev youtube. */
function pick(clips: YoutubeClip[], clipSeed?: string): string {
  const r = pickMediaSource({ youtubeClips: clips }, opts(clipSeed));
  if (r.kind !== 'youtube') throw new Error('förväntade youtube, fick ' + r.kind);
  return r.clip.videoId;
}

describe('pickMediaSource — ett klipp', () => {
  it('returnerar det enda klippet oavsett seed', () => {
    expect(pick([official])).toBe('OFFICIAL');
    expect(pick([official], 'ROOM1:song')).toBe('OFFICIAL');
  });

  it('ger none när YouTube är avstängd', () => {
    const r = pickMediaSource({ youtubeClips: [official] }, { youtubeEnabled: false, gameMode: 'pass-the-phone' });
    expect(r.kind).toBe('none');
  });

  it('ger none när klipplistan är tom eller saknas', () => {
    expect(pickMediaSource({ youtubeClips: [] }, opts()).kind).toBe('none');
    expect(pickMediaSource({}, opts()).kind).toBe('none');
  });
});

describe('pickMediaSource — flera klipp', () => {
  it('samma seed ger ALLTID samma klipp (enheterna i ett spel måste vara överens)', () => {
    const seed = 'AB23XY:shakira-waka-waka';
    const first = pick([official, lyrics], seed);
    for (let i = 0; i < 50; i++) {
      expect(pick([official, lyrics], seed)).toBe(first);
    }
  });

  it('olika seed ger olika utfall över tid — annars vore omväxlingen meningslös', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 60; i++) {
      seen.add(pick([official, lyrics], `ROOM${i}:song`));
    }
    expect(seen).toEqual(new Set(['OFFICIAL', 'LYRICS']));
  });

  it('utan seed slumpas valet lokalt (enda korrekta läget när ingen annan enhet renderar)', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) seen.add(pick([official, lyrics]));
    expect(seen).toEqual(new Set(['OFFICIAL', 'LYRICS']));
  });

  it('väljer alltid ett klipp UR listan, aldrig utanför', () => {
    const many = ['A', 'B', 'C', 'D', 'E'].map((v) => ({ videoId: v, startSec: 0, endSec: 30 }));
    const ids = new Set(many.map((c) => c.videoId));
    for (let i = 0; i < 300; i++) {
      expect(ids.has(pick(many, `S${i}:q`))).toBe(true);
    }
  });

  it('fördelningen är någorlunda jämn — inget klipp svälts ut', () => {
    let officialCount = 0;
    const N = 400;
    for (let i = 0; i < N; i++) {
      if (pick([official, lyrics], `ROOM${i}:q`) === 'OFFICIAL') officialCount++;
    }
    expect(officialCount).toBeGreaterThan(N * 0.3);
    expect(officialCount).toBeLessThan(N * 0.7);
  });

  it('seeden skiljer på FRÅGA — två items i samma spel väljer oberoende', () => {
    const room = 'AB23XY';
    const perQuestion = new Set<string>();
    for (let i = 0; i < 60; i++) perQuestion.add(pick([official, lyrics], `${room}:song-${i}`));
    expect(perQuestion.size).toBe(2);
  });

  it('behåller klippets startSec — valet får inte tappa metadata', () => {
    const r = pickMediaSource({ youtubeClips: [official, lyrics] }, opts('ROOM:q'));
    if (r.kind !== 'youtube') throw new Error('förväntade youtube');
    const src = r.clip.videoId === 'OFFICIAL' ? official : lyrics;
    expect(r.clip.startSec).toBe(src.startSec);
    expect(r.clip.endSec).toBe(src.endSec);
  });
});

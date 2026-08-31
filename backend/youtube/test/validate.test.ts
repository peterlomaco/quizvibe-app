// Tester för classifyItems — item-nivå-status i youtube-validate.
//
// Bakgrund: katalogen är på väg mot flera klipp per item (officiell
// musikvideo + lyrics-version), dels för omväxling, dels som redundans.
// Validatorn klassade tidigare per KLIPP och exitade 1 så fort något klipp
// var brutet. Med två klipp per item hade nightly-cronen då blivit röd så
// fort ett av dem föll bort, trots att frågan fortfarande går att spela —
// och ett larm som alltid är rött slutar man läsa.
//
// Regeln är därför: larma när en FRÅGA slutar fungera, inte när ett klipp
// gör det.

import { describe, expect, it } from 'vitest';
import { classifyItems } from '../validate';

type Status = 'ok' | 'warn' | 'broken' | 'missing';

/** Minimal ClipReport — classifyItems läser bara ref + status. */
function clip(itemId: string, videoId: string, status: Status, filename = 'songs-gen-z.yaml') {
  return {
    ref: { filename, itemId, displayName: `${itemId} display`, clip: { videoId, startSec: 0, endSec: 30 } },
    status,
    hardReasons: status === 'broken' || status === 'missing' ? ['test-reason'] : [],
    softReasons: status === 'warn' ? ['SD resolution'] : [],
  } as unknown as Parameters<typeof classifyItems>[0][number];
}

const statusOf = (reports: Parameters<typeof classifyItems>[0], id: string) =>
  classifyItems(reports).find((i) => i.itemId === id)?.status;

describe('classifyItems — ett klipp per item (oförändrat beteende)', () => {
  it('ok när klippet fungerar', () => {
    expect(statusOf([clip('a', 'V1', 'ok')], 'a')).toBe('ok');
  });

  it('warn räknas som spelbart — mjuka anmärkningar fäller inte itemet', () => {
    expect(statusOf([clip('a', 'V1', 'warn')], 'a')).toBe('ok');
  });

  it('dead när det enda klippet är brutet', () => {
    expect(statusOf([clip('a', 'V1', 'broken')], 'a')).toBe('dead');
  });

  it('dead när det enda klippet är borttaget', () => {
    expect(statusOf([clip('a', 'V1', 'missing')], 'a')).toBe('dead');
  });
});

describe('classifyItems — flera klipp per item', () => {
  it('degraded när ett av två klipp är brutet — frågan går fortfarande att spela', () => {
    expect(statusOf([clip('a', 'V1', 'broken'), clip('a', 'V2', 'ok')], 'a')).toBe('degraded');
  });

  it('degraded även när det kvarvarande klippet bara har mjuka anmärkningar', () => {
    expect(statusOf([clip('a', 'V1', 'missing'), clip('a', 'V2', 'warn')], 'a')).toBe('degraded');
  });

  it('dead först när BÅDA klippen fallit bort', () => {
    expect(statusOf([clip('a', 'V1', 'broken'), clip('a', 'V2', 'missing')], 'a')).toBe('dead');
  });

  it('ok när alla klipp fungerar', () => {
    expect(statusOf([clip('a', 'V1', 'ok'), clip('a', 'V2', 'warn')], 'a')).toBe('ok');
  });

  it('delar upp klippen i failed/healthy så rapporten kan visa vad som är kvar', () => {
    const [item] = classifyItems([clip('a', 'V1', 'broken'), clip('a', 'V2', 'ok'), clip('a', 'V3', 'warn')]);
    expect(item.failed.map((r) => r.ref.clip.videoId)).toEqual(['V1']);
    expect(item.healthy.map((r) => r.ref.clip.videoId)).toEqual(['V2', 'V3']);
  });
});

describe('classifyItems — gruppering', () => {
  it('håller isär items i samma fil', () => {
    const reports = [clip('a', 'V1', 'broken'), clip('b', 'V2', 'ok')];
    expect(statusOf(reports, 'a')).toBe('dead');
    expect(statusOf(reports, 'b')).toBe('ok');
  });

  it('håller isär samma item-id i OLIKA filer — registry tillåter dubbletter', () => {
    const reports = [
      clip('dup', 'V1', 'broken', 'songs-gen-x.yaml'),
      clip('dup', 'V2', 'ok', 'songs-gen-z.yaml'),
    ];
    const items = classifyItems(reports);
    expect(items).toHaveLength(2);
    expect(items.find((i) => i.filename === 'songs-gen-x.yaml')?.status).toBe('dead');
    expect(items.find((i) => i.filename === 'songs-gen-z.yaml')?.status).toBe('ok');
  });

  it('tom lista ger inga items', () => {
    expect(classifyItems([])).toEqual([]);
  });
});

describe('classifyItems — exit-kontraktet', () => {
  it('BARA dead ska fälla cronen; degraded får inte göra det', () => {
    const reports = [
      clip('lever', 'V1', 'broken'),
      clip('lever', 'V2', 'ok'),
      clip('doer', 'V3', 'missing'),
    ];
    const dead = classifyItems(reports).filter((i) => i.status === 'dead');
    expect(dead.map((i) => i.itemId)).toEqual(['doer']);
  });
});

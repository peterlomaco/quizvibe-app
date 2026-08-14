// Tester för epok-fördelningen (Peter 2026-08-14):
//   1. planEpochSequence summerar till N och konvergerar mot målandelen.
//   2. Epoker utanför aktuell Game Era fryses och återupptas.
//   3. shuffleBlocks bevarar turordning + kategori per block.
//
// Ligger i backend-sviten (enda vitest-harnessen i repot) men testar
// klient-modulen under src/utils.

import { describe, it, expect } from 'vitest';
import {
  emptyEpochDebt,
  getActiveEpochs,
  planEpochSequence,
  sequenceToQuotas,
  type EpochDebt,
  type EpochId,
} from '../../../src/utils/epochAllocation';

// Spegel av shuffleBlocks i app/quiz.tsx. Kopieras hit eftersom quiz.tsx är en
// React-skärm som inte går att importera i node-miljön; håll dem i synk.
function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
function shuffleBlocks<T>(seq: T[], questionsPerBlock: number): T[] {
  if (questionsPerBlock <= 1) return shuffleArray(seq);
  const blocks: T[][] = [];
  let i = 0;
  for (; i + questionsPerBlock <= seq.length; i += questionsPerBlock) {
    blocks.push(seq.slice(i, i + questionsPerBlock));
  }
  return [...shuffleArray(blocks).flat(), ...seq.slice(i)];
}

const WIDE = getActiveEpochs(1950, 2026);

function share(seq: EpochId[], id: EpochId): number {
  return seq.filter((x) => x === id).length / seq.length;
}

// Kör `games` spel à `rounds` frågor med EN skuldbok som bärs mellan spelen.
function runGames(
  games: number,
  rounds: number,
  epochs = WIDE,
  startDebt: EpochDebt = emptyEpochDebt(),
): { all: EpochId[]; perGame: EpochId[][]; debt: EpochDebt } {
  let debt = startDebt;
  const perGame: EpochId[][] = [];
  for (let g = 0; g < games; g++) {
    const { sequence, nextDebt } = planEpochSequence(rounds, epochs, debt);
    perGame.push(sequence);
    debt = nextDebt;
  }
  return { all: perGame.flat(), perGame, debt };
}

describe('planEpochSequence', () => {
  it('returns exactly n slots, all from active epochs', () => {
    const { sequence } = planEpochSequence(7, WIDE, emptyEpochDebt());
    expect(sequence).toHaveLength(7);
    const activeIds = WIDE.map((e) => e.id);
    for (const id of sequence) expect(activeIds).toContain(id);
  });

  it('returns nothing for n <= 0 or no active epochs', () => {
    expect(planEpochSequence(0, WIDE, emptyEpochDebt()).sequence).toEqual([]);
    expect(planEpochSequence(4, [], emptyEpochDebt()).sequence).toEqual([]);
  });

  it('does not mutate the debt passed in', () => {
    const debt = emptyEpochDebt();
    planEpochSequence(20, WIDE, debt);
    expect(debt).toEqual(emptyEpochDebt());
  });

  it('reaches E1 across games even though 4 rounds can never contain 11%', () => {
    // Kärnbuggen: 4 × 11% = 0,44 frågor. Utan skuldbok avrundas det bort varje
    // spel och E1 visas ALDRIG — det var precis vad Peter observerade.
    const { all } = runGames(40, 4);
    expect(all.filter((x) => x === 1).length).toBeGreaterThan(0);
  });

  it('converges on the target share over many games', () => {
    const { all } = runGames(200, 4);
    for (const e of WIDE) {
      expect(Math.abs(share(all, e.id) - e.normWeight)).toBeLessThan(0.02);
    }
  });

  it('spreads a single 4-round game across several epochs', () => {
    // Före fixen gav ett 4-rundorsspel alltid E3 fyra gånger.
    const { sequence } = planEpochSequence(4, WIDE, emptyEpochDebt());
    expect(new Set(sequence).size).toBeGreaterThan(1);
  });
});

describe('planEpochSequence — era changes', () => {
  const NARROW = getActiveEpochs(1980, 2000); // E2, E3, E4 — E1 och E5 inaktiva

  it('freezes epochs outside the current era', () => {
    const first = planEpochSequence(4, WIDE, emptyEpochDebt());
    const frozen = first.nextDebt[1];
    const narrow = planEpochSequence(12, NARROW, first.nextDebt);
    expect(narrow.nextDebt[1]).toBe(frozen);
    expect(narrow.sequence).not.toContain(1);
    expect(narrow.sequence).not.toContain(5);
  });

  it('resumes a frozen epoch when its era returns', () => {
    let debt = emptyEpochDebt();
    for (let g = 0; g < 3; g++) debt = planEpochSequence(4, WIDE, debt).nextDebt;
    const before = debt[1];
    for (let g = 0; g < 5; g++) debt = planEpochSequence(4, NARROW, debt).nextDebt;
    expect(debt[1]).toBe(before); // orörd under den smala eran
    const back = planEpochSequence(20, WIDE, debt);
    expect(back.sequence).toContain(1);
  });

  it('hits each era target independently when eras are interleaved', () => {
    let debt = emptyEpochDebt();
    const wide: EpochId[] = [];
    const narrow: EpochId[] = [];
    for (let g = 0; g < 90; g++) {
      const useNarrow = g % 3 === 2;
      const r = planEpochSequence(4, useNarrow ? NARROW : WIDE, debt);
      (useNarrow ? narrow : wide).push(...r.sequence);
      debt = r.nextDebt;
    }
    for (const e of WIDE) {
      expect(Math.abs(share(wide, e.id) - e.normWeight)).toBeLessThan(0.04);
    }
    for (const e of NARROW) {
      expect(Math.abs(share(narrow, e.id) - e.normWeight)).toBeLessThan(0.06);
    }
  });

  it('keeps the debt bounded over a long history', () => {
    const { debt } = runGames(500, 4);
    for (const id of [1, 2, 3, 4, 5] as EpochId[]) {
      expect(Math.abs(debt[id])).toBeLessThanOrEqual(10);
    }
  });
});

describe('sequenceToQuotas', () => {
  it('counts each epoch and preserves the total', () => {
    const quotas = sequenceToQuotas([3, 1, 3, 5, 3]);
    expect(quotas).toEqual([
      { epochId: 1, quota: 1 },
      { epochId: 3, quota: 3 },
      { epochId: 5, quota: 1 },
    ]);
    expect(quotas.reduce((s, q) => s + q.quota, 0)).toBe(5);
  });

  it('returns nothing for an empty sequence', () => {
    expect(sequenceToQuotas([])).toEqual([]);
  });
});

// Spegel av fas-storleks-uträkningen i app/quiz.tsx (gameQuestions). Kopieras
// hit av samma skäl som shuffleBlocks ovan; håll dem i synk.
function sourceSplit(
  totalRounds: number,
  playerCount: number,
  opts: { hasImage?: boolean; hasSpotify?: boolean; hasPureYoutube?: boolean; poolLen?: number } = {},
) {
  const { hasImage = true, hasSpotify = true, hasPureYoutube = true, poolLen = 99 } = opts;
  let img = hasImage ? Math.floor(totalRounds / 4) : 0;
  let rest = totalRounds - img;
  const canRotateDJ = hasSpotify && playerCount > 0 && totalRounds >= playerCount;
  let sp = 0;
  if (canRotateDJ) {
    const raw = Math.min(Math.floor(rest / 2), poolLen);
    const rotations = Math.max(1, Math.floor(raw / playerCount));
    const capped = Math.min(rotations * playerCount, poolLen, totalRounds);
    sp = Math.floor(capped / playerCount) * playerCount;
    if (sp > rest) { img = totalRounds - sp; rest = sp; }
  }
  let yt = hasPureYoutube ? rest - sp : 0;
  const un = totalRounds - sp - yt - img;
  if (un > 0) {
    if (hasPureYoutube) yt += un;
    else if (hasImage) img += un;
    else if (hasSpotify) sp = Math.min(sp + un, poolLen);
  }
  return { sp, yt, img };
}

describe('source split — DJ rotation', () => {
  const ROUNDS = [2, 3, 4, 5, 6, 8, 10, 12, 16, 20];
  const PLAYERS = [2, 3, 4, 6, 12];

  it('always allocates exactly totalRounds', () => {
    for (const R of ROUNDS) {
      for (const P of PLAYERS) {
        const s = sourceSplit(R, P);
        expect(s.sp + s.yt + s.img).toBe(R);
      }
    }
  });

  it('gives every player the same number of DJ turns', () => {
    // Kärnregeln: djRotationPlan delar ut DJ round-robin, så ett antal som
    // inte är jämnt delbart med spelarantalet gor att nagon DJ:ar oftare.
    for (const R of ROUNDS) {
      for (const P of PLAYERS) {
        expect(sourceSplit(R, P).sp % P).toBe(0);
      }
    }
  });

  it('makes both questions Spotify at 2 rounds with 2 players', () => {
    // Peters rapporterade fall — förut 1 sp / 1 yt, dvs bara spelare 1 DJ:ade.
    expect(sourceSplit(2, 2)).toEqual({ sp: 2, yt: 0, img: 0 });
  });

  it('keeps Spotify present at the default 4 rounds', () => {
    expect(sourceSplit(4, 2).sp).toBe(2);
    expect(sourceSplit(4, 3).sp).toBe(3);
  });

  it('drops Spotify when no full rotation fits', () => {
    // Färre rundor än spelare → hellre ingen Spotify än att bara en delmängd
    // av spelarna får DJ:a.
    expect(sourceSplit(2, 4).sp).toBe(0);
    expect(sourceSplit(3, 6).sp).toBe(0);
  });

  it('still fills a Spotify-only game when no rotation fits', () => {
    // Undantaget: noll skulle lämna spelet helt utan frågor, så ojämna
    // DJ-turer accepteras när Spotify är enda källan.
    const s = sourceSplit(2, 4, { hasImage: false, hasPureYoutube: false });
    expect(s.sp).toBe(2);
    expect(s.sp + s.yt + s.img).toBe(2);
  });

  it('never allocates half a rotation when the pool is too small', () => {
    expect(sourceSplit(8, 2, { poolLen: 1 }).sp).toBe(0);
    expect(sourceSplit(8, 2, { poolLen: 3 }).sp).toBe(2);
  });

  it('sends leftover blocks to Hints rather than breaking the rotation', () => {
    // Utfyllnad går YT → Hints → Spotify; Spotify sist så varvet inte bryts.
    const s = sourceSplit(8, 3, { hasPureYoutube: false });
    expect(s.sp % 3).toBe(0);
    expect(s.sp + s.yt + s.img).toBe(8);
  });
});

describe('shuffleBlocks', () => {
  it('shuffles individual questions when questionsPerBlock is 1', () => {
    const seq = [1, 2, 3, 4, 5, 6, 7, 8];
    expect(shuffleBlocks(seq, 1).sort()).toEqual(seq);
  });

  it('keeps turn order and one category per block in Pass-the-Phone', () => {
    // 3 spelare, 6 block: varje block = ett helt turvarv p0,p1,p2 i EN kategori.
    const cats = ['Music', 'Film', 'Sport'];
    const seq = cats.flatMap((c, ci) =>
      [0, 1].flatMap((b) =>
        [0, 1, 2].map((p) => ({ cat: c, player: `p${p}`, block: ci * 2 + b })),
      ),
    );
    for (let run = 0; run < 25; run++) {
      const out = shuffleBlocks(seq, 3);
      expect(out).toHaveLength(seq.length);
      for (let i = 0; i < out.length; i += 3) {
        const blk = out.slice(i, i + 3);
        expect(blk.map((x) => x.player)).toEqual(['p0', 'p1', 'p2']);
        expect(new Set(blk.map((x) => x.cat)).size).toBe(1);
      }
    }
  });

  it('pins a trailing partial block to the end', () => {
    // Enkategori-grenen i buildCategoryAlignedPhase trimmar inte till
    // blockmultipel, så ett halvt block kan förekomma — det får inte hamna
    // mitt i sekvensen och klyva ett turvarv.
    const seq = ['a0', 'a1', 'a2', 'b0', 'b1', 'b2', 'tail'];
    for (let run = 0; run < 25; run++) {
      expect(shuffleBlocks(seq, 3)[6]).toBe('tail');
    }
  });
});

// Tester för Game Summary — korten i prisutdelnings-sekvensen.
//
// Multiplayer (Peter 2026-11-03):
//   1. Däck: HCP Progress (denna enhets inloggade spelare) → Top Game
//      Performance. Inget kort jämför allas HCP (finns på Final Leaderboard).
//      Gäst / saknat resultat → bara Top.
//   2. Top Game Performance: bara de med högst antal rätt, sorterade på
//      snittid (lägst vinner), alltid unika placeringar, avhoppare
//      uteslutna. Snittiden räknar MED timeouts men BORT connectionError.
// Solospel: buildSinglePlayerSummary (oförändrat).
//
// Ligger i backend-sviten (enda vitest-harnessen i repot) men testar
// klient-modulen under src/utils.

import { describe, it, expect } from 'vitest';
import {
  buildMultiplayerSummary,
  buildSinglePlayerSummary,
  type BuildMultiplayerSummaryInput,
  type HighlightCard,
} from '../../../src/utils/matchHighlights';
import type {
  LeaderboardPlayer,
  RoundScore,
} from '../../../src/components/RoundLeaderboard';

const ANNA: LeaderboardPlayer = { id: 'p1', name: 'Anna', emoji: '🦊' };
const BEN: LeaderboardPlayer = { id: 'p2', name: 'Ben', emoji: '🐼' };
const CIA: LeaderboardPlayer = { id: 'p3', name: 'Cia', emoji: '🐨' };

function score(
  playerId: string,
  questionIndex: number,
  correct: boolean,
  timeUsed: number,
  extra: Partial<RoundScore> = {},
): RoundScore {
  return {
    playerId,
    questionIndex,
    correct,
    timeUsed,
    points: correct ? 1 : 0,
    ...extra,
  };
}

/** Två frågor: Anna 2/2 @3s, Ben 2/2 @5s, Cia 1/2 @1s. */
const SCORES: RoundScore[][] = [
  [score('p1', 0, true, 3), score('p2', 0, true, 5), score('p3', 0, true, 1)],
  [score('p1', 1, true, 3), score('p2', 1, true, 5), score('p3', 1, false, 1)],
];

function build(over: Partial<BuildMultiplayerSummaryInput> = {}) {
  return buildMultiplayerSummary({
    scores: SCORES,
    players: [ANNA, BEN, CIA],
    selfPlayerId: 'p1',
    selfHcp: { before: 60, after: 57 },
    ...over,
  });
}

const kinds = (cards: HighlightCard[]) => cards.map((c) => c.kind);
const top = (cards: HighlightCard[]) => cards.find((c) => c.kind === 'top-performance')!;

describe('buildMultiplayerSummary — däck', () => {
  it('egen HCP Progress → Top Game Performance, inget HCP-jämförelsekort', () => {
    const cards = build();
    expect(kinds(cards)).toEqual(['hcp-progress', 'top-performance']);
    expect(cards[0].hcp).toEqual({ before: 60, after: 57 });
  });

  it('utan eget HCP-resultat (remote / guest-hostat / ingen bokföring): bara Top', () => {
    expect(kinds(build({ selfHcp: null }))).toEqual(['top-performance']);
  });

  it('en gäst får aldrig ett HCP-kort, även om ett värde skulle finnas', () => {
    expect(kinds(build({ guestIds: new Set(['p1']) }))).toEqual(['top-performance']);
  });

  it('returnerar inga kort utan svar och utan HCP', () => {
    expect(build({ scores: [], selfHcp: null })).toEqual([]);
  });
});

describe('Top Game Performance', () => {
  it('markerar BARA den snabbaste vid delad topp — inte en ensam toppspelare', () => {
    expect(top(build()).rows!.map((r) => !!r.fastest)).toEqual([true, false]);
    const scores = [[score('p1', 0, true, 3), score('p2', 0, false, 1)]];
    expect(top(build({ scores, players: [ANNA, BEN] })).rows![0].fastest).toBeFalsy();
  });

  it('visar bara de med högst antal rätt, lägst snittid först', () => {
    const rows = top(build()).rows!;
    expect(rows.map((r) => `${r.place}:${r.name}:${r.value}:${r.secondary}`)).toEqual([
      '1:Anna:2/2:3.00s',
      '2:Ben:2/2:5.00s',
    ]);
  });

  it('en ensam toppspelare ger en rad', () => {
    const scores = [[score('p1', 0, true, 3), score('p2', 0, false, 1)]];
    const rows = top(build({ scores, players: [ANNA, BEN] })).rows!;
    expect(rows.map((r) => r.name)).toEqual(['Anna']);
  });

  it('ger alltid unika placeringar, även vid samma visade tid', () => {
    const scores = [[score('p1', 0, true, 4.004), score('p2', 0, true, 4.001)]];
    const rows = top(build({ scores, players: [ANNA, BEN] })).rows!;
    expect(rows.map((r) => `${r.place}:${r.name}`)).toEqual(['1:Ben', '2:Anna']);
  });

  it('visar inte spelare med färre rätt', () => {
    const scores = [
      [score('p1', 0, true, 9), score('p2', 0, true, 2), score('p3', 0, true, 1)],
      [score('p1', 1, true, 9), score('p2', 1, true, 2), score('p3', 1, false, 1)],
    ];
    const rows = top(build({ scores })).rows!;
    expect(rows.map((r) => `${r.place}:${r.name}`)).toEqual(['1:Ben', '2:Anna']);
  });

  it('utesluter den som lämnade mitt i matchen', () => {
    const rows = top(build({ players: [{ ...ANNA, hasLeft: true }, BEN, CIA] })).rows!;
    expect(rows.map((r) => r.name)).toEqual(['Ben']);
  });

  it('räknar MED timeouts men BORT connectionError i snittiden', () => {
    const scores = [
      [score('p1', 0, true, 2)],
      [score('p1', 1, false, 30)],
      [score('p1', 2, false, 1, { connectionError: true })],
    ];
    const rows = top(build({ scores, players: [ANNA], selfHcp: null })).rows!;
    expect(rows[0].secondary).toBe('16.00s');
    expect(rows[0].value).toBe('1/3');
  });

  it('läser remote-motståndaren ur summaryStats', () => {
    const OPP: LeaderboardPlayer = {
      id: 'remote-opponent-x',
      name: 'Ben',
      emoji: '👤',
      summaryStats: { playedRounds: 2, correctAnswers: 2, avgResponseSeconds: 2.5, points: 2 },
    };
    const scores = [[score('p1', 0, true, 4)], [score('p1', 1, true, 4)]];
    const rows = top(build({ scores, players: [ANNA, OPP], selfHcp: null })).rows!;
    expect(rows.map((r) => `${r.place}:${r.name}:${r.secondary}`)).toEqual([
      '1:Ben:2.50s',
      '2:Anna:4.00s',
    ]);
  });
});

describe('buildSinglePlayerSummary', () => {
  const scores = [
    [score('p1', 0, true, 2)],
    [score('p1', 1, false, 4)],
    [score('p1', 2, true, 3, { connectionError: true })],
  ];

  it('gives exactly HCP Progress then Game Performance', () => {
    const cards = buildSinglePlayerSummary({
      scores,
      player: ANNA,
      hcp: { before: 99, after: 96 },
    });
    expect(cards.map((c) => c.kind)).toEqual(['hcp-progress', 'game-performance']);
    expect(cards[0].hcp).toEqual({ before: 99, after: 96 });
  });

  it('keeps an unchanged HCP as its own card', () => {
    const cards = buildSinglePlayerSummary({ scores, player: ANNA, hcp: { before: 80, after: 80 } });
    expect(cards[0].kind).toBe('hcp-progress');
    expect(cards).toHaveLength(2);
  });

  it('puts correct answers and average lock-in time on one card', () => {
    const [, perf] = buildSinglePlayerSummary({ scores, player: ANNA, hcp: { before: 99, after: 98 } });
    expect(perf.performance).toEqual({ correct: 2, total: 3, avgSeconds: 3 });
  });

  it('never emits category, source or separate stat cards', () => {
    const cards = buildSinglePlayerSummary({ scores, player: ANNA, hcp: { before: 99, after: 98 } });
    expect(cards.some((c) => c.rows)).toBe(false);
    expect(cards.some((c) => c.kind === 'top-performance')).toBe(false);
  });

  it('shows only Game Performance when the game records no HCP (guest)', () => {
    const cards = buildSinglePlayerSummary({ scores, player: ANNA, hcp: null });
    expect(cards.map((c) => c.kind)).toEqual(['game-performance']);
  });
});

describe('buildMultiplayerSummary — hybrid host-device HCP (Step 4)', () => {
  it('two or more host-device players → ONE stacked HCP card, before Top', () => {
    const cards = build({
      deviceHcps: [
        { playerId: 'p1', name: 'Anna', before: 60, after: 57 },
        { playerId: 'p3', name: 'Cia', before: 80, after: 81 },
      ],
    });
    expect(kinds(cards)).toEqual(['hcp-progress', 'top-performance']);
    expect(cards[0].hcpList?.map((h) => h.name)).toEqual(['Anna', 'Cia']);
    expect(cards[0].hcp).toBeUndefined();
  });
  it('guests are dropped; a single entry keeps the normal self card', () => {
    const cards = build({
      guestIds: new Set(['p3']),
      deviceHcps: [
        { playerId: 'p1', name: 'Anna', before: 60, after: 57 },
        { playerId: 'p3', name: 'Cia', before: 80, after: 81 },
      ],
    });
    expect(cards[0].hcpList).toBeUndefined();
    expect(cards[0].hcp).toEqual({ before: 60, after: 57 });
  });
});

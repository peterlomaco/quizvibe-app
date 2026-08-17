// Tester för match highlights — korten i prisutdelnings-sekvensen.
//
//   1. Kort-ordningen (flest rätt → snittid → snabbaste enskilda).
//   2. ≥2-regeln för kategori-/källhinkar.
//   3. Maxtaket på antal kort.
//   4. Tomma hinkar hoppas över automatiskt (t.ex. Spotify som inte spelats).
//   5. personal vs competitive väljer rätt formulering.
//   6. Snittiden räknar MED timeouts men BORT connectionError — och ger
//      samma tal som leaderboardens AVG-kolumn.
//
// Ligger i backend-sviten (enda vitest-harnessen i repot) men testar
// klient-modulen under src/utils.

import { describe, it, expect } from 'vitest';
import {
  MAX_HIGHLIGHT_CARDS,
  MIN_QUESTIONS_PER_BUCKET,
  buildMatchHighlights,
  type BuildMatchHighlightsInput,
} from '../../../src/utils/matchHighlights';
import type { MainCategory } from '../../../src/utils/mainCategory';
import type { QuestionMediaType } from '../../../src/components/GetReadyIntro';
import type {
  LeaderboardPlayer,
  RoundScore,
} from '../../../src/components/RoundLeaderboard';

const ANNA: LeaderboardPlayer = { id: 'p1', name: 'Anna', emoji: '🦊' };
const BEN: LeaderboardPlayer = { id: 'p2', name: 'Ben', emoji: '🐼' };

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

function build(over: Partial<BuildMatchHighlightsInput> = {}) {
  const base: BuildMatchHighlightsInput = {
    scores: [],
    players: [ANNA, BEN],
    categoryByQuestion: [],
    mediaSourceByQuestion: [],
    mode: 'competitive',
    ...over,
  };
  return buildMatchHighlights(base);
}

describe('buildMatchHighlights — grundfall', () => {
  it('returnerar inga kort utan spelare eller utan svar', () => {
    expect(build({ players: [] })).toEqual([]);
    expect(build({ scores: [] })).toEqual([]);
  });

  it('lägger flest rätt först och snittiden som kort 2', () => {
    const cards = build({
      scores: [
        [score('p1', 0, true, 5), score('p2', 0, false, 9)],
        [score('p1', 1, true, 6), score('p2', 1, true, 8)],
      ],
    });
    expect(cards[0].kind).toBe('most-correct');
    expect(cards[1].kind).toBe('fastest-average');
    // Snittid är näst viktigast — före det snabbaste enskilda svaret.
    expect(cards[2].kind).toBe('fastest-single');
  });

  it('utser rätt vinnare på flest rätt och på snittid', () => {
    const cards = build({
      scores: [
        [score('p1', 0, true, 12), score('p2', 0, false, 3)],
        [score('p1', 1, true, 12), score('p2', 1, true, 3)],
      ],
    });
    const mostCorrect = cards.find((c) => c.kind === 'most-correct')!;
    expect(mostCorrect.playerName).toBe('Anna'); // 2 rätt mot 1
    expect(mostCorrect.value).toBe('2 of 2');

    // Ben är långsammare på rätt men snabbast överlag → vinner snittiden.
    const avg = cards.find((c) => c.kind === 'fastest-average')!;
    expect(avg.playerName).toBe('Ben');
    expect(avg.value).toBe('3.00s');
  });

  it('hoppar över snabbaste enskilda svar när ingen svarat rätt', () => {
    const cards = build({
      scores: [[score('p1', 0, false, 5), score('p2', 0, false, 7)]],
    });
    expect(cards.some((c) => c.kind === 'fastest-single')).toBe(false);
  });
});

describe('snittiden speglar leaderboardens AVG-kolumn', () => {
  it('räknar MED timeouts (full svarstid)', () => {
    // Anna svarar snabbt på en och missar en helt (30s timeout) → snitt 17.50.
    // Ben ligger jämnt på 16s → snitt 16.00 och vinner.
    const cards = build({
      scores: [
        [score('p1', 0, true, 5), score('p2', 0, true, 16)],
        [score('p1', 1, false, 30), score('p2', 1, false, 16)],
      ],
    });
    const avg = cards.find((c) => c.kind === 'fastest-average')!;
    expect(avg.playerName).toBe('Ben');
    expect(avg.value).toBe('16.00s');
  });

  it('räknar BORT frågor som missades pga uppkoppling', () => {
    // Annas 30s-post är ett connectionError → ska inte dra upp hennes snitt.
    const cards = build({
      scores: [
        [score('p1', 0, true, 5), score('p2', 0, true, 6)],
        [
          score('p1', 1, false, 30, { connectionError: true }),
          score('p2', 1, true, 6),
        ],
      ],
    });
    const avg = cards.find((c) => c.kind === 'fastest-average')!;
    expect(avg.playerName).toBe('Anna');
    expect(avg.value).toBe('5.00s');
  });
});

describe('kategori- och källkort', () => {
  const cats: (MainCategory | null)[] = ['Music', 'Music', 'Sport', 'Film'];
  const sources: QuestionMediaType[] = ['youtube', 'youtube', 'image', 'youtube'];
  const scores = [
    [score('p1', 0, true, 4), score('p2', 0, false, 9)],
    [score('p1', 1, true, 4), score('p2', 1, false, 9)],
    [score('p1', 2, true, 4), score('p2', 2, false, 9)],
    [score('p1', 3, true, 4), score('p2', 3, false, 9)],
  ];

  it('ger kort åt hinkar med minst MIN_QUESTIONS_PER_BUCKET frågor', () => {
    const cards = build({ scores, categoryByQuestion: cats, mediaSourceByQuestion: sources });
    // Music har 2 frågor → kort. YouTube har 3 → kort.
    expect(cards.some((c) => c.id === 'category-Music')).toBe(true);
    expect(cards.some((c) => c.id === 'source-youtube')).toBe(true);
  });

  it('hoppar över hinkar under tröskeln', () => {
    const cards = build({ scores, categoryByQuestion: cats, mediaSourceByQuestion: sources });
    // Sport och Film har 1 fråga var, Hints (image) har 1 → inga kort.
    expect(cards.some((c) => c.id === 'category-Sport')).toBe(false);
    expect(cards.some((c) => c.id === 'category-Film')).toBe(false);
    expect(cards.some((c) => c.id === 'source-image')).toBe(false);
    expect(MIN_QUESTIONS_PER_BUCKET).toBe(2);
  });

  it('hoppar över källor som inte spelats alls (t.ex. Spotify)', () => {
    const cards = build({ scores, categoryByQuestion: cats, mediaSourceByQuestion: sources });
    expect(cards.some((c) => c.id === 'source-spotify')).toBe(false);
  });

  it('hoppar över hinkar där ingen fick något rätt', () => {
    const allWrong = [
      [score('p1', 0, false, 4), score('p2', 0, false, 9)],
      [score('p1', 1, false, 4), score('p2', 1, false, 9)],
    ];
    const cards = build({
      scores: allWrong,
      categoryByQuestion: ['Music', 'Music'],
      mediaSourceByQuestion: ['youtube', 'youtube'],
    });
    expect(cards.some((c) => c.kind === 'category')).toBe(false);
    expect(cards.some((c) => c.kind === 'source')).toBe(false);
  });

  it('ignorerar poster utan questionIndex i hink-korten', () => {
    const legacy: RoundScore[][] = [
      [{ playerId: 'p1', points: 1, correct: true, timeUsed: 4 }],
      [{ playerId: 'p1', points: 1, correct: true, timeUsed: 4 }],
    ];
    const cards = build({
      scores: legacy,
      players: [ANNA],
      categoryByQuestion: ['Music', 'Music'],
      mediaSourceByQuestion: ['youtube', 'youtube'],
      mode: 'personal',
    });
    // Totalerna fungerar fortfarande — bara hink-korten faller bort.
    expect(cards.some((c) => c.kind === 'most-correct')).toBe(true);
    expect(cards.some((c) => c.kind === 'category')).toBe(false);
  });

  it('respekterar maxtaket på antal kort', () => {
    // 12 frågor: 4 per kategori och 4 per källa → alla hinkar kvalificerar,
    // vilket ger 9 möjliga kort. Taket ska klippa till MAX_HIGHLIGHT_CARDS.
    const manyCats: (MainCategory | null)[] = [];
    const manySources: QuestionMediaType[] = [];
    const manyScores: RoundScore[][] = [];
    const catCycle: MainCategory[] = ['Music', 'Film', 'Sport'];
    const srcCycle: QuestionMediaType[] = ['youtube', 'spotify', 'image'];
    for (let i = 0; i < 12; i++) {
      manyCats.push(catCycle[i % 3]);
      manySources.push(srcCycle[i % 3]);
      manyScores.push([score('p1', i, true, 4), score('p2', i, false, 9)]);
    }
    const cards = build({
      scores: manyScores,
      categoryByQuestion: manyCats,
      mediaSourceByQuestion: manySources,
    });
    expect(cards.length).toBe(MAX_HIGHLIGHT_CARDS);
  });
});

describe('personal vs competitive', () => {
  const scores = [
    [score('p1', 0, true, 5)],
    [score('p1', 1, false, 8)],
  ];

  it('competitive namnger vinnaren', () => {
    const cards = build({
      scores: [[score('p1', 0, true, 5), score('p2', 0, false, 8)]],
      mode: 'competitive',
    });
    const card = cards[0];
    expect(card.playerName).toBe('Anna');
    expect(card.playerEmoji).toBe('🦊');
    expect(card.title).toBe('Most correct answers');
  });

  it('personal utelämnar namnet och byter rubrik', () => {
    const cards = build({ scores, players: [ANNA], mode: 'personal' });
    const card = cards[0];
    expect(card.playerName).toBeNull();
    expect(card.playerEmoji).toBeNull();
    expect(card.title).toBe('Correct answers');
    expect(card.value).toBe('1 of 2');
  });

  it('personal använder källans namn utan "Best on"-prefix', () => {
    const cards = build({
      scores: [
        [score('p1', 0, true, 5)],
        [score('p1', 1, true, 5)],
      ],
      players: [ANNA],
      mediaSourceByQuestion: ['youtube', 'youtube'],
      mode: 'personal',
    });
    const yt = cards.find((c) => c.id === 'source-youtube')!;
    expect(yt.title).toBe('YouTube');
  });
});

// Källor och kategorier har VAR SIN app-standard: källor renderas med
// MediaSourceIcon (YouTubes röda play-knapp osv.), kategorier med den gula
// kant-skärande badgen. Ingen av dem får falla tillbaka på emoji.
describe('standard-ikoner per korttyp', () => {
  const scores = [
    [score('p1', 0, true, 4)],
    [score('p1', 1, true, 4)],
  ];

  it('källkort bär source-fältet och ingen emoji', () => {
    const cards = build({
      scores,
      players: [ANNA],
      mediaSourceByQuestion: ['youtube', 'youtube'],
      mode: 'personal',
    });
    const yt = cards.find((c) => c.id === 'source-youtube')!;
    expect(yt.source).toBe('youtube');
    expect(yt.icon).toBeUndefined();
    expect(yt.category).toBeUndefined();
  });

  it('varje källkort mappar till rätt MediaSourceIcon-nyckel', () => {
    const six: RoundScore[][] = [];
    const srcs: QuestionMediaType[] = [
      'youtube', 'youtube', 'spotify', 'spotify', 'image', 'image',
    ];
    srcs.forEach((_, i) => six.push([score('p1', i, true, 4)]));
    const cards = build({
      scores: six,
      players: [ANNA],
      mediaSourceByQuestion: srcs,
      mode: 'personal',
    });
    expect(cards.find((c) => c.id === 'source-youtube')?.source).toBe('youtube');
    expect(cards.find((c) => c.id === 'source-spotify')?.source).toBe('spotify');
    expect(cards.find((c) => c.id === 'source-image')?.source).toBe('image');
  });

  it('kategorikort bär category-fältet, ingen emoji, och upprepar inte namnet i rubriken', () => {
    const cards = build({
      scores,
      players: [ANNA],
      categoryByQuestion: ['Music', 'Music'],
      mode: 'personal',
    });
    const music = cards.find((c) => c.id === 'category-Music')!;
    expect(music.category).toBe('Music');
    expect(music.icon).toBeUndefined();
    expect(music.source).toBeUndefined();
    // Badgen bär namnet — rubriken säger vad talet betyder.
    expect(music.title).toBe('Correct answers');
  });

  it('de generella korten behåller sin dekorativa emoji', () => {
    const cards = build({ scores, players: [ANNA], mode: 'personal' });
    const mostCorrect = cards.find((c) => c.kind === 'most-correct')!;
    expect(mostCorrect.icon).toBeTruthy();
    expect(mostCorrect.source).toBeUndefined();
    expect(mostCorrect.category).toBeUndefined();
  });
});

describe('remote 1v1 — motståndaren som summaryStats', () => {
  // Motståndarens per-fråga-svar är RLS-skyddade; bara summary-raden finns.
  const OPPONENT: LeaderboardPlayer = {
    id: 'remote-opponent-x',
    name: 'Ben',
    emoji: '👤',
    summaryStats: {
      playedRounds: 4,
      correctAnswers: 4,
      avgResponseSeconds: 3.5,
      points: 4,
    },
  };

  it('jämför flest rätt och snittid head-to-head trots saknad per-frågedata', () => {
    const cards = build({
      scores: [
        [score('p1', 0, true, 9)],
        [score('p1', 1, false, 9)],
      ],
      players: [ANNA, OPPONENT],
      mode: 'personal',
    });
    const mostCorrect = cards.find((c) => c.kind === 'most-correct')!;
    expect(mostCorrect.value).toBe('4 of 4'); // motståndaren vann

    const avg = cards.find((c) => c.kind === 'fastest-average')!;
    expect(avg.value).toBe('3.50s');
  });
});

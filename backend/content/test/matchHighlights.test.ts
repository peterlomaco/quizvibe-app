// Tester för match highlights — korten i prisutdelnings-sekvensen.
//
//   1. Kort-ordningen: Correct answers → Spotify → YouTube → Hints →
//      Fastest fingers.
//   2. Placeringslistorna: alla spelare med, DELAD plats vid lika (1, 1, 3).
//   3. Källkorten: bara förstaplatsen, men alla som delar den namnges.
//   4. Källor som inte spelats får inget kort.
//   5. personal/solo faller tillbaka på value-layouten.
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
  type HighlightCard,
} from '../../../src/utils/matchHighlights';
import type { QuestionMediaType } from '../../../src/components/GetReadyIntro';
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

function build(over: Partial<BuildMatchHighlightsInput> = {}) {
  const base: BuildMatchHighlightsInput = {
    scores: [],
    players: [ANNA, BEN],
    mediaSourceByQuestion: [],
    mode: 'competitive',
    ...over,
  };
  return buildMatchHighlights(base);
}

/** Kompakt "plats:namn"-vy av ett listkort, för läsbara assertions. */
function places(card: HighlightCard): string[] {
  return (card.rows ?? []).map((r) => `${r.place}:${r.name}`);
}

describe('buildMatchHighlights — grundfall', () => {
  it('returnerar inga kort utan spelare eller utan svar', () => {
    expect(build({ players: [] })).toEqual([]);
    expect(build({ scores: [] })).toEqual([]);
  });

  it('lägger Correct answers först och Fastest fingers sist', () => {
    const cards = build({
      scores: [
        [score('p1', 0, true, 5), score('p2', 0, false, 9)],
        [score('p1', 1, true, 6), score('p2', 1, true, 8)],
      ],
      mediaSourceByQuestion: ['youtube', 'youtube'],
    });
    expect(cards[0].id).toBe('most-correct');
    expect(cards[cards.length - 1].id).toBe('fastest-average');
  });

  it('håller källordningen Spotify → YouTube → Hints', () => {
    const srcs: QuestionMediaType[] = ['image', 'youtube', 'spotify'];
    const cards = build({
      scores: srcs.map((_, i) => [score('p1', i, true, 4), score('p2', i, false, 9)]),
      mediaSourceByQuestion: srcs,
    });
    expect(cards.map((c) => c.id)).toEqual([
      'most-correct',
      'source-spotify',
      'source-youtube',
      'source-image',
      'fastest-average',
    ]);
  });
});

describe('kort 1 — Correct answers som placeringslista', () => {
  it('listar ALLA spelare i fallande antal rätt', () => {
    const cards = build({
      players: [ANNA, BEN, CIA],
      scores: [
        [score('p1', 0, false, 5), score('p2', 0, true, 9), score('p3', 0, true, 7)],
        [score('p1', 1, false, 5), score('p2', 1, true, 9), score('p3', 1, false, 7)],
      ],
    });
    const card = cards.find((c) => c.id === 'most-correct')!;
    expect(places(card)).toEqual(['1:Ben', '2:Cia', '3:Anna']);
    expect(card.rows!.map((r) => r.value)).toEqual(['2/2', '1/2', '0/2']);
    // Listkortet bär inget eget huvudtal — raderna gör det.
    expect(card.value).toBeUndefined();
  });

  it('ger DELAD placering vid samma antal rätt och hoppar sedan över platsen', () => {
    // Anna och Ben har 1 rätt var, Cia 0 → 1, 1, 3 (inte 1, 1, 2).
    const cards = build({
      players: [ANNA, BEN, CIA],
      scores: [
        [score('p1', 0, true, 5), score('p2', 0, true, 9), score('p3', 0, false, 7)],
      ],
    });
    const card = cards.find((c) => c.id === 'most-correct')!;
    expect(places(card)).toEqual(['1:Anna', '1:Ben', '3:Cia']);
    expect(card.rows!.map((r) => r.shared)).toEqual([true, true, false]);
  });

  it('delar plats på ANTAL RÄTT, inte på träffprocent', () => {
    // Anna 2 av 2, Ben 2 av 3 → samma antal rätt → delad förstaplats.
    const cards = build({
      scores: [
        [score('p1', 0, true, 5), score('p2', 0, true, 9)],
        [score('p1', 1, true, 5), score('p2', 1, true, 9)],
        [score('p2', 2, false, 9)],
      ],
    });
    const card = cards.find((c) => c.id === 'most-correct')!;
    expect(places(card)).toEqual(['1:Anna', '1:Ben']);
    expect(card.rows!.map((r) => r.value)).toEqual(['2/2', '2/3']);
  });

  it('tar med spelare som aldrig svarade, sist i listan', () => {
    const cards = build({
      players: [ANNA, BEN],
      scores: [[score('p1', 0, true, 5)]],
    });
    const card = cards.find((c) => c.id === 'most-correct')!;
    expect(places(card)).toEqual(['1:Anna', '2:Ben']);
    expect(card.rows![1].value).toBe('0/0');
  });
});

describe('kort 5 — Fastest fingers som placeringslista', () => {
  it('listar alla spelare i stigande snittid', () => {
    const cards = build({
      players: [ANNA, BEN, CIA],
      scores: [
        [score('p1', 0, true, 12), score('p2', 0, true, 3), score('p3', 0, false, 7)],
      ],
    });
    const card = cards.find((c) => c.id === 'fastest-average')!;
    expect(card.title).toBe('Fastest fingers');
    expect(places(card)).toEqual(['1:Ben', '2:Cia', '3:Anna']);
    expect(card.rows!.map((r) => r.value)).toEqual(['3.00s', '7.00s', '12.00s']);
  });

  it('delar placering på det VISADE talet (2 decimaler)', () => {
    // 4.001 och 4.002 visas båda som "4.00s" → måste dela plats, annars
    // läses listan som en bugg.
    const cards = build({
      scores: [[score('p1', 0, true, 4.001), score('p2', 0, true, 4.002)]],
    });
    const card = cards.find((c) => c.id === 'fastest-average')!;
    expect(places(card)).toEqual(['1:Anna', '1:Ben']);
  });

  it('utelämnar spelare utan tidsunderlag ur listan', () => {
    const cards = build({
      players: [ANNA, BEN],
      scores: [
        [score('p1', 0, true, 5)],
        [score('p2', 0, false, 9, { connectionError: true })],
      ],
    });
    const card = cards.find((c) => c.id === 'fastest-average')!;
    expect(places(card)).toEqual(['1:Anna']);
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
    const card = cards.find((c) => c.id === 'fastest-average')!;
    expect(card.rows![0].name).toBe('Ben');
    expect(card.rows![0].value).toBe('16.00s');
    expect(card.rows![1].value).toBe('17.50s');
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
    const card = cards.find((c) => c.id === 'fastest-average')!;
    expect(card.rows![0].name).toBe('Anna');
    expect(card.rows![0].value).toBe('5.00s');
  });
});

describe('kort 2-4 — källkorten visar bara förstaplatsen', () => {
  const sources: QuestionMediaType[] = ['youtube', 'youtube', 'image', 'spotify'];
  const scores = [
    [score('p1', 0, true, 4), score('p2', 0, false, 9)],
    [score('p1', 1, true, 4), score('p2', 1, false, 9)],
    [score('p1', 2, true, 4), score('p2', 2, false, 9)],
    [score('p1', 3, true, 4), score('p2', 3, false, 9)],
  ];

  it('använder SAMMA radlayout som listkorten: plats 1 + antal rätt/antal frågor', () => {
    const cards = build({ scores, mediaSourceByQuestion: sources });
    const yt = cards.find((c) => c.id === 'source-youtube')!;
    expect(places(yt)).toEqual(['1:Anna']);
    expect(yt.rows!.map((r) => r.value)).toEqual(['2/2']);
    // Raderna bär talet — inget separat huvudtal på kortet.
    expect(yt.value).toBeUndefined();
  });

  it('nämnaren är hinkens storlek, inte spelarens antal svar', () => {
    // Hints-hinken har 1 fråga → "1/1", aldrig "1/4".
    const cards = build({ scores, mediaSourceByQuestion: sources });
    const hints = cards.find((c) => c.id === 'source-image')!;
    expect(hints.rows!.map((r) => r.value)).toEqual(['1/1']);
  });

  it('ger kort åt en källa som spelats EN gång', () => {
    // Standardspelet är 4 rundor → Hints-kvoten är 1 fråga. Det kortet
    // måste kunna visas.
    const cards = build({ scores, mediaSourceByQuestion: sources });
    expect(cards.some((c) => c.id === 'source-image')).toBe(true);
    expect(MIN_QUESTIONS_PER_BUCKET).toBe(1);
  });

  it('hoppar över källor som inte spelats alls', () => {
    const cards = build({
      scores: scores.slice(0, 2),
      mediaSourceByQuestion: ['youtube', 'youtube'],
    });
    expect(cards.some((c) => c.id === 'source-spotify')).toBe(false);
    expect(cards.some((c) => c.id === 'source-image')).toBe(false);
  });

  it('namnger ALLA som delar förstaplatsen', () => {
    const cards = build({
      players: [ANNA, BEN, CIA],
      scores: [
        [score('p1', 0, true, 4), score('p2', 0, true, 9), score('p3', 0, false, 7)],
        [score('p1', 1, true, 4), score('p2', 1, true, 9), score('p3', 1, false, 7)],
      ],
      mediaSourceByQuestion: ['spotify', 'spotify'],
    });
    const sp = cards.find((c) => c.id === 'source-spotify')!;
    // Delad förstaplats → båda på plats 1, Cia listas inte alls.
    expect(places(sp)).toEqual(['1:Anna', '1:Ben']);
    expect(sp.rows!.map((r) => r.shared)).toEqual([true, true]);
    expect(sp.detail).toBe('2 players share first place');
  });

  it('hoppar över källor där ingen fick något rätt', () => {
    const cards = build({
      scores: [
        [score('p1', 0, false, 4), score('p2', 0, false, 9)],
        [score('p1', 1, false, 4), score('p2', 1, false, 9)],
      ],
      mediaSourceByQuestion: ['youtube', 'youtube'],
    });
    expect(cards.some((c) => c.kind === 'source')).toBe(false);
  });

  it('ignorerar poster utan questionIndex i källkorten', () => {
    const legacy: RoundScore[][] = [
      [{ playerId: 'p1', points: 1, correct: true, timeUsed: 4 }],
      [{ playerId: 'p1', points: 1, correct: true, timeUsed: 4 }],
    ];
    const cards = build({
      scores: legacy,
      players: [ANNA],
      mediaSourceByQuestion: ['youtube', 'youtube'],
      mode: 'personal',
    });
    // Totalerna fungerar fortfarande — bara källkorten faller bort.
    expect(cards.some((c) => c.kind === 'most-correct')).toBe(true);
    expect(cards.some((c) => c.kind === 'source')).toBe(false);
  });

  it('respekterar maxtaket på antal kort', () => {
    const srcCycle: QuestionMediaType[] = ['youtube', 'spotify', 'image'];
    const manySources: QuestionMediaType[] = [];
    const manyScores: RoundScore[][] = [];
    for (let i = 0; i < 12; i++) {
      manySources.push(srcCycle[i % 3]);
      manyScores.push([score('p1', i, true, 4), score('p2', i, false, 9)]);
    }
    const cards = build({ scores: manyScores, mediaSourceByQuestion: manySources });
    // Däcket ger 5 kort — taket binder inte, men får aldrig överskridas.
    expect(cards.length).toBe(5);
    expect(cards.length).toBeLessThanOrEqual(MAX_HIGHLIGHT_CARDS);
  });
});

describe('solo och personal-läge', () => {
  const scores = [
    [score('p1', 0, true, 5)],
    [score('p1', 1, false, 8)],
  ];

  it('en ensam spelare får value-layouten, inte en lista med en rad', () => {
    const cards = build({ scores, players: [ANNA], mode: 'personal' });
    const card = cards.find((c) => c.id === 'most-correct')!;
    expect(card.rows).toBeUndefined();
    expect(card.value).toBe('1 of 2');
    expect(card.title).toBe('Correct answers');

    const avg = cards.find((c) => c.id === 'fastest-average')!;
    expect(avg.title).toBe('Average lock-in time');
    expect(avg.value).toBe('6.50s');
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
    // Ingen att placera sig mot → value-layouten, inga rader.
    expect(yt.rows).toBeUndefined();
    expect(yt.value).toBe('2 of 2');
  });

  it('competitive namnger vinnaren på källkortet', () => {
    const cards = build({
      scores: [
        [score('p1', 0, true, 5), score('p2', 0, false, 8)],
        [score('p1', 1, true, 5), score('p2', 1, false, 8)],
      ],
      mediaSourceByQuestion: ['youtube', 'youtube'],
      mode: 'competitive',
    });
    const yt = cards.find((c) => c.id === 'source-youtube')!;
    expect(yt.title).toBe('Best on YouTube');
    expect(yt.rows![0].place).toBe(1);
    expect(yt.rows![0].name).toBe('Anna');
    expect(yt.rows![0].emoji).toBe('🦊');
  });
});

// Källor har en app-standard: MediaSourceIcon (YouTubes röda play-knapp
// osv.). De får aldrig falla tillbaka på emoji; listkorten har ingen
// standard-ikon och behåller därför sin dekorativa emoji.
describe('standard-ikoner per korttyp', () => {
  it('källkort bär source-fältet och ingen emoji', () => {
    const cards = build({
      scores: [[score('p1', 0, true, 4)], [score('p1', 1, true, 4)]],
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
    const srcs: QuestionMediaType[] = [
      'youtube', 'youtube', 'spotify', 'spotify', 'image', 'image',
    ];
    const six: RoundScore[][] = srcs.map((_, i) => [score('p1', i, true, 4)]);
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

  it('listkorten behåller sin dekorativa emoji', () => {
    const cards = build({
      scores: [[score('p1', 0, true, 4), score('p2', 0, false, 9)]],
    });
    for (const id of ['most-correct', 'fastest-average']) {
      const card = cards.find((c) => c.id === id)!;
      expect(card.icon).toBeTruthy();
      expect(card.source).toBeUndefined();
      expect(card.category).toBeUndefined();
    }
  });

  it('emitterar inga kategorikort — de är dormanta', () => {
    const cards = build({
      scores: [[score('p1', 0, true, 4), score('p2', 0, false, 9)]],
      categoryByQuestion: ['Music'],
      mediaSourceByQuestion: ['youtube'],
    });
    expect(cards.some((c) => c.kind === 'category')).toBe(false);
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

  it('placerar de två mot varandra trots personal-läge och saknad per-frågedata', () => {
    // ⚠ Listkorten gatas på ANTALET SPELARE, inte på mode — remote kör
    // personal-läge men har två spelare med fullgott underlag.
    const cards = build({
      scores: [
        [score('p1', 0, true, 9)],
        [score('p1', 1, false, 9)],
      ],
      players: [ANNA, OPPONENT],
      mode: 'personal',
    });
    const mostCorrect = cards.find((c) => c.id === 'most-correct')!;
    expect(places(mostCorrect)).toEqual(['1:Ben', '2:Anna']);
    expect(mostCorrect.rows![0].value).toBe('4/4');

    const avg = cards.find((c) => c.id === 'fastest-average')!;
    expect(places(avg)).toEqual(['1:Ben', '2:Anna']);
    expect(avg.rows![0].value).toBe('3.50s');
  });
});

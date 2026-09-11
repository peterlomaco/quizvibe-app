// Tester för match highlights — korten i prisutdelnings-sekvensen.
//
//   1. Kort-ordningen: Correct answers → Best on Music → Best on Film →
//      Best on Hints - Music → Best on Hints - Film → Fastest fingers.
//   2. Placeringslistorna: alla spelare med, DELAD plats vid lika (1, 1, 3).
//   3. Hink-korten: bara förstaplatsen, men alla som delar den namnges.
//   4. Hinkar som inte spelats får inget kort.
//   5. personal/solo faller tillbaka på value-layouten.
//   6. Snittiden räknar MED timeouts men BORT connectionError — och ger
//      samma tal som leaderboardens AVG-kolumn.
//   7. Hink-logiken: Music = Spotify + YouTube-Music, Film = YouTube-Film,
//      Hints splittas på kategori.
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
import type { MainCategory } from '../../../src/utils/mainCategory';
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

/**
 * Bygger scores + aligned källa/kategori-arrayer från en per-fråga-lista.
 * `right` styr vilka spelare som svarade rätt på just den frågan (default
 * bara p1), så en hink garanterat har någon med ≥1 rätt.
 */
function fromQuestions(
  questions: { src: QuestionMediaType; cat?: MainCategory | null; right?: string[] }[],
  players: LeaderboardPlayer[] = [ANNA, BEN],
): Pick<BuildMatchHighlightsInput, 'scores' | 'mediaSourceByQuestion' | 'categoryByQuestion'> {
  const scores: RoundScore[][] = questions.map((q, i) => {
    const right = q.right ?? ['p1'];
    return players.map((p) =>
      score(p.id, i, right.includes(p.id), right.includes(p.id) ? 4 : 9),
    );
  });
  return {
    scores,
    mediaSourceByQuestion: questions.map((q) => q.src),
    categoryByQuestion: questions.map((q) => q.cat ?? null),
  };
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
      categoryByQuestion: ['Music', 'Music'],
    });
    expect(cards[0].id).toBe('most-correct');
    expect(cards[cards.length - 1].id).toBe('fastest-average');
  });

  it('håller hink-ordningen Music → Film → Hints-Music → Hints-Film', () => {
    const cards = build(
      fromQuestions([
        { src: 'spotify', cat: null }, // → Music
        { src: 'youtube', cat: 'Music' }, // → Music
        { src: 'youtube', cat: 'Film' }, // → Film
        { src: 'image', cat: 'Music' }, // → Hints-Music
        { src: 'image', cat: 'Film' }, // → Hints-Film
      ]),
    );
    expect(cards.map((c) => c.id)).toEqual([
      'most-correct',
      'best-music',
      'best-film',
      'best-hints-music',
      'best-hints-film',
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

describe('kort 6 — Fastest fingers som placeringslista', () => {
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

describe('kort 2-5 — kategori-hinkarna', () => {
  it('slår ihop Spotify och YouTube-Music till EN Music-hink', () => {
    const cards = build(
      fromQuestions([
        { src: 'spotify', cat: null },
        { src: 'youtube', cat: 'Music' },
      ]),
    );
    const music = cards.find((c) => c.id === 'best-music')!;
    // Nämnaren = hinkens storlek (2 frågor), Anna rätt på båda.
    expect(music.rows!.map((r) => r.value)).toEqual(['2/2']);
    // Ingen separat Spotify- eller YouTube-hink längre.
    expect(cards.some((c) => c.id === 'source-spotify' || c.id === 'source-youtube')).toBe(false);
  });

  it('Film räknar BARA YouTube-Film (inte YouTube-Music)', () => {
    const cards = build(
      fromQuestions([
        { src: 'youtube', cat: 'Film' },
        { src: 'youtube', cat: 'Music' },
      ]),
    );
    const film = cards.find((c) => c.id === 'best-film')!;
    expect(film.rows!.map((r) => r.value)).toEqual(['1/1']);
    const music = cards.find((c) => c.id === 'best-music')!;
    expect(music.rows!.map((r) => r.value)).toEqual(['1/1']);
  });

  it('splittar Hints på kategori', () => {
    const cards = build(
      fromQuestions([
        { src: 'image', cat: 'Music' },
        { src: 'image', cat: 'Film' },
      ]),
    );
    expect(cards.find((c) => c.id === 'best-hints-music')!.rows!.map((r) => r.value)).toEqual(['1/1']);
    expect(cards.find((c) => c.id === 'best-hints-film')!.rows!.map((r) => r.value)).toEqual(['1/1']);
  });

  it('använder SAMMA radlayout som listkorten: plats 1 + antal rätt/antal frågor', () => {
    const cards = build(
      fromQuestions([
        { src: 'youtube', cat: 'Music' },
        { src: 'youtube', cat: 'Music' },
      ]),
    );
    const music = cards.find((c) => c.id === 'best-music')!;
    expect(places(music)).toEqual(['1:Anna']);
    expect(music.rows!.map((r) => r.value)).toEqual(['2/2']);
    // Raderna bär talet — inget separat huvudtal på kortet.
    expect(music.value).toBeUndefined();
  });

  it('ger kort åt en hink som spelats EN gång', () => {
    const cards = build(fromQuestions([{ src: 'image', cat: 'Film' }]));
    expect(cards.some((c) => c.id === 'best-hints-film')).toBe(true);
    expect(MIN_QUESTIONS_PER_BUCKET).toBe(1);
  });

  it('hoppar över hinkar som inte spelats alls', () => {
    const cards = build(fromQuestions([{ src: 'youtube', cat: 'Music' }]));
    expect(cards.some((c) => c.id === 'best-film')).toBe(false);
    expect(cards.some((c) => c.id === 'best-hints-music')).toBe(false);
    expect(cards.some((c) => c.id === 'best-hints-film')).toBe(false);
  });

  it('bygger inga kategori-hinkar utan kategori-data', () => {
    // YouTube-frågor utan kategori → varken Music eller Film.
    const cards = build({
      scores: [
        [score('p1', 0, true, 4), score('p2', 0, false, 9)],
        [score('p1', 1, true, 4), score('p2', 1, false, 9)],
      ],
      mediaSourceByQuestion: ['youtube', 'youtube'],
    });
    expect(cards.map((c) => c.id)).toEqual(['most-correct', 'fastest-average']);
  });

  it('namnger ALLA som delar förstaplatsen', () => {
    const cards = build(
      fromQuestions(
        [
          { src: 'spotify', cat: null, right: ['p1', 'p2'] },
          { src: 'spotify', cat: null, right: ['p1', 'p2'] },
        ],
        [ANNA, BEN, CIA],
      ),
    );
    const music = cards.find((c) => c.id === 'best-music')!;
    // Delad förstaplats → båda på plats 1, Cia listas inte alls.
    expect(places(music)).toEqual(['1:Anna', '1:Ben']);
    expect(music.rows!.map((r) => r.shared)).toEqual([true, true]);
    expect(music.detail).toBe('2 players share first place');
  });

  it('hoppar över hinkar där ingen fick något rätt', () => {
    const cards = build({
      scores: [
        [score('p1', 0, false, 4), score('p2', 0, false, 9)],
        [score('p1', 1, false, 4), score('p2', 1, false, 9)],
      ],
      mediaSourceByQuestion: ['youtube', 'youtube'],
      categoryByQuestion: ['Music', 'Music'],
    });
    expect(cards.some((c) => c.id === 'best-music')).toBe(false);
  });

  it('ignorerar poster utan questionIndex i hink-korten', () => {
    const legacy: RoundScore[][] = [
      [{ playerId: 'p1', points: 1, correct: true, timeUsed: 4 }],
      [{ playerId: 'p1', points: 1, correct: true, timeUsed: 4 }],
    ];
    const cards = build({
      scores: legacy,
      players: [ANNA],
      mediaSourceByQuestion: ['youtube', 'youtube'],
      categoryByQuestion: ['Music', 'Music'],
      mode: 'personal',
    });
    // Totalerna fungerar fortfarande — bara hink-korten faller bort.
    expect(cards.some((c) => c.kind === 'most-correct')).toBe(true);
    expect(cards.some((c) => c.id === 'best-music')).toBe(false);
  });

  it('respekterar maxtaket på antal kort', () => {
    // Alla fyra hinkar + Correct + Fastest = 6 kort — under taket (8).
    const cards = build(
      fromQuestions([
        { src: 'spotify', cat: null },
        { src: 'youtube', cat: 'Music' },
        { src: 'youtube', cat: 'Film' },
        { src: 'image', cat: 'Music' },
        { src: 'image', cat: 'Film' },
      ]),
    );
    expect(cards.length).toBe(6);
    expect(cards.length).toBeLessThanOrEqual(MAX_HIGHLIGHT_CARDS);
  });
});

describe('solo och personal-läge', () => {
  it('en ensam spelare får value-layouten, inte en lista med en rad', () => {
    const cards = build({
      scores: [[score('p1', 0, true, 5)], [score('p1', 1, false, 8)]],
      players: [ANNA],
      mode: 'personal',
    });
    const card = cards.find((c) => c.id === 'most-correct')!;
    expect(card.rows).toBeUndefined();
    expect(card.value).toBe('1 of 2');
    expect(card.title).toBe('Correct answers');

    const avg = cards.find((c) => c.id === 'fastest-average')!;
    expect(avg.title).toBe('Average lock-in time');
    expect(avg.value).toBe('6.50s');
  });

  it('personal använder hinkens namn utan "Best on"-prefix', () => {
    const cards = build({
      scores: [[score('p1', 0, true, 5)], [score('p1', 1, true, 5)]],
      players: [ANNA],
      mediaSourceByQuestion: ['youtube', 'youtube'],
      categoryByQuestion: ['Music', 'Music'],
      mode: 'personal',
    });
    const music = cards.find((c) => c.id === 'best-music')!;
    expect(music.title).toBe('Music');
    // Ingen att placera sig mot → value-layouten, inga rader.
    expect(music.rows).toBeUndefined();
    expect(music.value).toBe('2 of 2');
  });

  it('competitive namnger vinnaren och använder "Best on"-prefix', () => {
    const cards = build(
      fromQuestions([
        { src: 'youtube', cat: 'Film' },
        { src: 'youtube', cat: 'Film' },
      ]),
    );
    const film = cards.find((c) => c.id === 'best-film')!;
    expect(film.title).toBe('Best on Film');
    expect(film.rows![0].place).toBe(1);
    expect(film.rows![0].name).toBe('Anna');
    expect(film.rows![0].emoji).toBe('🦊');
  });

  it('Hints-korten byter till "· "-titel i personal-läge', () => {
    const cards = build({
      scores: [[score('p1', 0, true, 5)]],
      players: [ANNA],
      mediaSourceByQuestion: ['image'],
      categoryByQuestion: ['Music'],
      mode: 'personal',
    });
    expect(cards.find((c) => c.id === 'best-hints-music')!.title).toBe('Hints · Music');
  });
});

// Ikon-treatment per korttyp:
//   • Kategorikort (Music/Film) → gold kategoribadge + genre-emoji, ingen source.
//   • Hints-kort → Hints-källikon (source: 'image') + kategoribadge, ingen emoji.
//   • Listkort → dekorativ emoji, ingen source/category.
describe('ikon-treatment per korttyp', () => {
  it('Music/Film bär kategori + emoji, ingen source', () => {
    const cards = build(
      fromQuestions([
        { src: 'spotify', cat: null },
        { src: 'youtube', cat: 'Film' },
      ]),
    );
    const music = cards.find((c) => c.id === 'best-music')!;
    expect(music.category).toBe('Music');
    expect(music.icon).toBe('🎵');
    expect(music.source).toBeUndefined();

    const film = cards.find((c) => c.id === 'best-film')!;
    expect(film.category).toBe('Film');
    expect(film.icon).toBe('🎬');
    expect(film.source).toBeUndefined();
  });

  it('Hints-korten bär source: "image" + kategoribadge, ingen emoji', () => {
    const cards = build(
      fromQuestions([
        { src: 'image', cat: 'Music' },
        { src: 'image', cat: 'Film' },
      ]),
    );
    const hMusic = cards.find((c) => c.id === 'best-hints-music')!;
    expect(hMusic.source).toBe('image');
    expect(hMusic.category).toBe('Music');
    expect(hMusic.icon).toBeUndefined();

    const hFilm = cards.find((c) => c.id === 'best-hints-film')!;
    expect(hFilm.source).toBe('image');
    expect(hFilm.category).toBe('Film');
    expect(hFilm.icon).toBeUndefined();
  });

  it('listkorten behåller sin dekorativa emoji utan source/category', () => {
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
      scores: [[score('p1', 0, true, 9)], [score('p1', 1, false, 9)]],
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

// —— Avhoppare rankas inte ——————————————————————————————————
//
// Den som lämnade MITT i matchen slutade svara, så deras delsumma är ingen
// giltig placering. Utan filtret kunde de toppa "Correct answers" sekunder
// innan slutskärmen visar dem längst ner utan placeringssiffra.
describe('spelare som lämnat mitt i matchen', () => {
  const BEN_LEFT: LeaderboardPlayer = { ...BEN, hasLeft: true };

  it('visas inte alls när bara EN spelare är kvar (ingen lista att stå i)', () => {
    const cards = build({
      // Ben hann två rätt innan han gick; Anna spelade hela matchen
      // och svarade fel på allt.
      scores: [
        [score('p1', 0, false, 20), score('p2', 0, true, 2)],
        [score('p1', 1, false, 20), score('p2', 1, true, 2)],
        [score('p1', 2, false, 20)],
        [score('p1', 3, false, 20)],
      ],
      players: [ANNA, BEN_LEFT],
    });
    // Bara EN kvarvarande spelare → ingen placeringslista, utan kortet
    // faller tillbaka på value-layouten (samma gate som ett solospel).
    const mostCorrect = cards.find((c) => c.id === 'most-correct')!;
    expect(mostCorrect.rows).toBeUndefined();
    // Och Ben får inte dyka upp på NÅGOT kort.
    expect(JSON.stringify(cards)).not.toContain('Ben');
  });

  it('räknas bort ur listan men lämnar övriga placeringar intakta', () => {
    const cards = build({
      scores: [
        [score('p1', 0, true, 5), score('p2', 0, true, 1), score('p3', 0, false, 9)],
        [score('p1', 1, true, 5), score('p2', 1, true, 1), score('p3', 1, true, 9)],
      ],
      players: [ANNA, BEN_LEFT, CIA],
    });
    const mostCorrect = cards.find((c) => c.id === 'most-correct')!;
    // Ben leder på både rätt och tid men är borta: Anna och Cia rankas mot
    // varandra som om han aldrig funnits, och Ben hängs på sist UTAN
    // placeringssiffra och med "Left" i stället för resultat.
    expect(places(mostCorrect)).toEqual(['1:Anna', '2:Cia', 'null:Ben']);
    const benRow = mostCorrect.rows!.find((r) => r.name === 'Ben')!;
    expect(benRow.place).toBeNull();
    expect(benRow.value).toBe('Left');

    const avg = cards.find((c) => c.id === 'fastest-average')!;
    expect(places(avg)).toEqual(['1:Anna', '2:Cia', 'null:Ben']);
    expect(avg.rows!.find((r) => r.name === 'Ben')!.value).toBe('Left');
  });

  it('vinner ALDRIG ett hink-kort — de visar bara förstaplatsen', () => {
    const cards = build({
      // Ben har flest rätt på Music men lämnade; Cia ska ta kortet.
      scores: [
        [score('p1', 0, false, 5), score('p2', 0, true, 1), score('p3', 0, true, 9)],
        [score('p1', 1, false, 5), score('p2', 1, true, 1), score('p3', 1, false, 9)],
      ],
      players: [ANNA, BEN_LEFT, CIA],
      mediaSourceByQuestion: ['youtube', 'youtube'],
      categoryByQuestion: ['Music', 'Music'],
    });
    const music = cards.find((c) => c.id === 'best-music')!;
    expect(places(music)).toEqual(['1:Cia']);
  });

  it('rör INTE den som lämnade efter slutsignalen (hasLeft sätts aldrig då)', () => {
    const cards = build({
      scores: [
        [score('p1', 0, false, 20), score('p2', 0, true, 2)],
        [score('p1', 1, false, 20), score('p2', 1, true, 2)],
      ],
      players: [ANNA, BEN],
    });
    const mostCorrect = cards.find((c) => c.id === 'most-correct')!;
    expect(places(mostCorrect)).toEqual(['1:Ben', '2:Anna']);
  });
});

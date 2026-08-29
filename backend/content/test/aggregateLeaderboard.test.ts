import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Aggregate Leaderboard — serien bakom "Re-match with Aggregate Leaderboard?".
 *
 * Ligger i backend-sviten eftersom det är repots enda vitest-harness, men
 * testar klient-modulen under src/utils (samma mönster som hints.test.ts).
 * AsyncStorage mockas till en Map — modulen ska aldrig kräva en riktig
 * native-store för att räknas ut.
 */
const store = new Map<string, string>();
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: async (k: string) => store.get(k) ?? null,
    setItem: async (k: string, v: string) => {
      store.set(k, v);
    },
    removeItem: async (k: string) => {
      store.delete(k);
    },
  },
}));

const {
  aggregateLabel,
  attachSeriesToLeaderboard,
  defaultAggregateName,
  nextMarathonName,
  buildAggregateStandings,
  clearAggregateSeries,
  loadAggregateSeries,
  markSeriesContinues,
  recordGameInSeries,
} = await import('../../../src/utils/aggregateLeaderboard');
const { describeMissingPlayers, findMissingRematchPlayers } = await import(
  '../../../src/utils/rematchLineup'
);

type Player = Parameters<typeof recordGameInSeries>[1][number];

function player(id: string, over: Partial<Player> = {}): Player {
  return {
    playerId: id,
    name: id.toUpperCase(),
    emoji: '🦊',
    assistance: 'standard',
    age: 40,
    points: 2,
    playedRounds: 4,
    correctAnswers: 2,
    totalResponseSeconds: 40,
    results: [true, false, true, false],
    lastResponseSeconds: 10,
    ...over,
  };
}

beforeEach(async () => {
  store.clear();
  await clearAggregateSeries();
});

describe('aggregate series chaining', () => {
  it('ett fristående spel bildar en serie om ett spel (ingen aggregate-vy)', async () => {
    await recordGameInSeries('AB23XY', [player('a')]);
    const agg = buildAggregateStandings(await loadAggregateSeries());
    expect(agg.gamesPlayed).toBe(1);
  });

  it('en stämplad rumkod fortsätter serien', async () => {
    await recordGameInSeries('AB23XY', [player('a')]);
    await markSeriesContinues('CD45ZW');
    await recordGameInSeries('CD45ZW', [player('a')]);
    const agg = buildAggregateStandings(await loadAggregateSeries());
    expect(agg.gamesPlayed).toBe(2);
    expect(agg.standings[0].points).toBe(4);
    expect(agg.standings[0].playedRounds).toBe(8);
  });

  it('ett OSTÄMPLAT spel startar om serien (Start New Game)', async () => {
    await recordGameInSeries('AB23XY', [player('a')]);
    await markSeriesContinues('CD45ZW');
    await recordGameInSeries('CD45ZW', [player('a')]);
    // Host valde "Start New Game" → ingen stämpel.
    await recordGameInSeries('EF67GH', [player('a')]);
    const agg = buildAggregateStandings(await loadAggregateSeries());
    expect(agg.gamesPlayed).toBe(1);
    expect(agg.standings[0].points).toBe(2);
  });

  it('kedjan är förbrukad efter ett spel — nästa ostämplade spel bryter', async () => {
    await recordGameInSeries('AB23XY', [player('a')]);
    await markSeriesContinues('CD45ZW');
    await recordGameInSeries('CD45ZW', [player('a')]);
    expect((await loadAggregateSeries())?.nextRoomCode).toBeNull();
  });
});

describe('idempotens', () => {
  it('samma spel skrivet två gånger dubbelräknas inte', async () => {
    await recordGameInSeries('AB23XY', [player('a')]);
    await markSeriesContinues('CD45ZW');
    await recordGameInSeries('CD45ZW', [player('a', { points: 1 })]);
    // Sen peer-score droppar in → slutskärmen skriver om SAMMA spel.
    await recordGameInSeries('CD45ZW', [player('a', { points: 3 })]);
    const agg = buildAggregateStandings(await loadAggregateSeries());
    expect(agg.gamesPlayed).toBe(2);
    expect(agg.standings[0].points).toBe(5);
  });

  it('en omskrivning nollar INTE en redan stämplad kedja', async () => {
    await recordGameInSeries('AB23XY', [player('a')]);
    // Host startar re-matchen …
    await markSeriesContinues('CD45ZW');
    // … och en efterslängande score skriver om spelet som just avslutades.
    await recordGameInSeries('AB23XY', [player('a', { points: 3 })]);
    expect((await loadAggregateSeries())?.nextRoomCode).toBe('CD45ZW');
    await recordGameInSeries('CD45ZW', [player('a')]);
    expect(buildAggregateStandings(await loadAggregateSeries()).gamesPlayed).toBe(2);
  });
});

describe('summering', () => {
  it('snittiden viktas mot antal svar, inte mot antal spel', async () => {
    await recordGameInSeries('AB23XY', [
      player('a', { playedRounds: 4, totalResponseSeconds: 40 }),
    ]);
    await markSeriesContinues('CD45ZW');
    await recordGameInSeries('CD45ZW', [
      player('a', { playedRounds: 2, totalResponseSeconds: 2 }),
    ]);
    const agg = buildAggregateStandings(await loadAggregateSeries());
    // (40 + 2) / (4 + 2) = 7
    expect(agg.standings[0].avgResponseSeconds).toBeCloseTo(7);
  });

  it('Last 5 löper över spelgränsen och kapas till fem', async () => {
    await recordGameInSeries('AB23XY', [
      player('a', { results: [true, true, true, true] }),
    ]);
    await markSeriesContinues('CD45ZW');
    await recordGameInSeries('CD45ZW', [
      player('a', { results: [false, false] }),
    ]);
    expect(buildAggregateStandings(await loadAggregateSeries()).standings[0].lastFiveResults)
      .toEqual([true, true, true, false, false]);
  });

  it('namn och avatar tas från det senaste spelet spelaren deltog i', async () => {
    await recordGameInSeries('AB23XY', [player('a', { name: 'Old', emoji: '🐢' })]);
    await markSeriesContinues('CD45ZW');
    await recordGameInSeries('CD45ZW', [player('a', { name: 'New', emoji: '🦅' })]);
    const row = buildAggregateStandings(await loadAggregateSeries()).standings[0];
    expect(row.name).toBe('New');
    expect(row.emoji).toBe('🦅');
  });

  it('en spelare som bara var med i första spelet behåller sina siffror', async () => {
    await recordGameInSeries('AB23XY', [player('a'), player('b')]);
    await markSeriesContinues('CD45ZW');
    await recordGameInSeries('CD45ZW', [player('a')]);
    const agg = buildAggregateStandings(await loadAggregateSeries());
    const b = agg.standings.find((s) => s.playerId === 'b');
    expect(b?.points).toBe(2);
    expect(b?.playedRounds).toBe(4);
  });
});

describe('aggregateLabel — solo heter Score, flerspelar table', () => {
  it('en deltagare ger "Marathon Score"', () => {
    expect(aggregateLabel(1)).toBe('Marathon Score');
  });

  it('flera deltagare ger "Marathon table"', () => {
    expect(aggregateLabel(2)).toBe('Marathon table');
    expect(aggregateLabel(12)).toBe('Marathon table');
  });

  it('tom serie faller tillbaka på Score (en spelare är minimum)', () => {
    expect(aggregateLabel(0)).toBe('Marathon Score');
  });
});

describe('koppling till sparad serie', () => {
  it('kedjan bär med sig leaderboardId till nästa spel', async () => {
    await recordGameInSeries('AB23XY', [player('a')]);
    await attachSeriesToLeaderboard('lb-1', []);
    await markSeriesContinues('CD45ZW');
    await recordGameInSeries('CD45ZW', [player('a')]);
    expect((await loadAggregateSeries())?.leaderboardId).toBe('lb-1');
  });

  it('en ny serie ärver INTE föregående series koppling', async () => {
    await recordGameInSeries('AB23XY', [player('a')]);
    await attachSeriesToLeaderboard('lb-1', []);
    // Ostämplad kod = "Start New Game" → ny serie.
    await recordGameInSeries('EF67GH', [player('a')]);
    expect((await loadAggregateSeries())?.leaderboardId).toBeNull();
  });

  it('attach seedar serverns spel men lokala vinner på samma rumskod', async () => {
    await recordGameInSeries('AB23XY', [player('a', { points: 9 })]);
    await attachSeriesToLeaderboard('lb-1', [
      // Serverns kopia av SAMMA omgång är äldre — lokala ska vinna.
      { roomCode: 'AB23XY', players: [player('a', { points: 1 })] },
      { roomCode: 'ZZ11ZZ', players: [player('a', { points: 5 })] },
    ]);
    const agg = buildAggregateStandings(await loadAggregateSeries());
    expect(agg.gamesPlayed).toBe(2);
    expect(agg.standings[0].points).toBe(14); // 9 (lokalt) + 5 (server)
  });

  it('non-host kan stämpla kedjan MED ett leaderboardId i ett anrop', async () => {
    await recordGameInSeries('AB23XY', [player('a')]);
    await markSeriesContinues('CD45ZW', 'lb-7');
    await recordGameInSeries('CD45ZW', [player('a')]);
    const series = await loadAggregateSeries();
    expect(series?.leaderboardId).toBe('lb-7');
    expect(series?.games).toHaveLength(2);
  });
});

describe('server-mappade spel räknas identiskt med lokala', () => {
  it('samma games ger samma standings oavsett var de kom ifrån', async () => {
    const games = [
      { roomCode: 'AB23XY', players: [player('a', { points: 3 })] },
      { roomCode: 'CD45ZW', players: [player('a', { points: 4 })] },
    ];
    // "Lokal" väg: bokförda spel.
    await recordGameInSeries('AB23XY', games[0].players);
    await markSeriesContinues('CD45ZW');
    await recordGameInSeries('CD45ZW', games[1].players);
    const local = buildAggregateStandings(await loadAggregateSeries());
    // "Server" väg: rader mappade rakt in i samma form.
    const server = buildAggregateStandings({ nextRoomCode: null, games });
    expect(server.gamesPlayed).toBe(local.gamesPlayed);
    expect(server.standings).toEqual(local.standings);
  });
});

describe('låst spelaruppsättning i re-match-lobbyn', () => {
  const lineup = [
    { id: '1', name: 'Anna' },
    { id: 'p2', name: 'Bo' },
    { id: 'p3', name: 'Cee' },
  ];

  it('alla på plats → inget saknas', () => {
    expect(findMissingRematchPlayers(['1', 'p2', 'p3'], lineup)).toEqual([]);
  });

  it('en spelare som lämnat räknas som saknad', () => {
    const withLeaver = lineup.map((p) =>
      p.id === 'p2' ? { ...p, hasLeft: true } : p,
    );
    const missing = findMissingRematchPlayers(['1', 'p2', 'p3'], withLeaver);
    expect(missing).toEqual([{ id: 'p2', name: 'Bo' }]);
    expect(describeMissingPlayers(missing)).toBe('Bo');
  });

  it('en spelare vars rad saknas helt räknas också som saknad', () => {
    const missing = findMissingRematchPlayers(['1', 'p2', 'p9'], lineup);
    expect(missing).toEqual([{ id: 'p9', name: null }]);
    // Utan namn faller texten tillbaka på ett antal.
    expect(describeMissingPlayers(missing)).toBe('1 player');
  });

  it('tom förväntad lista blockerar ALDRIG (0037 inte körd)', () => {
    expect(findMissingRematchPlayers([], [])).toEqual([]);
  });

  it('flera saknade namnges i förväntad ordning', () => {
    // Båda har lämnat — raderna finns kvar, så namnen kan visas.
    const left = lineup.map((p) =>
      p.id === 'p2' ? p : { ...p, hasLeft: true },
    );
    const missing = findMissingRematchPlayers(['p3', '1'], left);
    expect(describeMissingPlayers(missing)).toBe('Cee, Anna');
  });
});

describe('defaultAggregateName', () => {
  it('en spelare får solo-suffix', () => {
    expect(defaultAggregateName(['Anna-42'])).toBe('Anna-42 — solo');
  });

  it('flera spelare joinas', () => {
    expect(defaultAggregateName(['Anna-42', 'Bo-7'])).toBe('Anna-42 & Bo-7');
  });

  it('långa uppsättningar kortas under DB-cappen på 40 tecken', () => {
    const many = ['Alexandra-1', 'Bartholomew-2', 'Christopher-3', 'Dominique-4'];
    const name = defaultAggregateName(many);
    expect(name.length).toBeLessThanOrEqual(40);
    expect(name).toContain('Alexandra-1');
  });
});

describe('nextMarathonName', () => {
  it('inga tidigare namn → Marathon 1', () => {
    expect(nextMarathonName([])).toBe('Marathon 1');
  });

  it('befintlig Marathon 7 → Marathon 8', () => {
    expect(nextMarathonName(['Marathon 7'])).toBe('Marathon 8');
  });

  it('högsta numret vinner, custom-namn ignoreras', () => {
    expect(
      nextMarathonName(['Marathon 3', 'Anna & Bo', 'Marathon 7']),
    ).toBe('Marathon 8');
  });

  it('bara custom-namn → Marathon 1', () => {
    expect(nextMarathonName(['Friday Quiz', 'Anna — solo'])).toBe('Marathon 1');
  });

  it('matchar case-insensitivt och trimmar', () => {
    expect(nextMarathonName(['  marathon 4  '])).toBe('Marathon 5');
  });
});

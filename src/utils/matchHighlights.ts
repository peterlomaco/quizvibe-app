/**
 * Match highlights — korten som visas i prisutdelnings-sekvensen mellan
 * sista frågans reveal och Final Leaderboard.
 *
 * Ren funktion utan React så regeln kan enhetstestas
 * (backend/content/test/matchHighlights.test.ts).
 *
 * ── Däcket (Peter 2026-08-25) ───────────────────────────────────────────
 *   1. Correct answers  — PLACERINGSLISTA över ALLA spelare
 *   2. Best on Spotify  — enbart förstaplatsen
 *   3. Best on YouTube  — enbart förstaplatsen
 *   4. Best on Hints    — enbart förstaplatsen
 *   5. Fastest fingers  — PLACERINGSLISTA över ALLA spelare
 *
 * Ordningen är explicit begärd; ändra den inte utan nytt beslut. Spotify
 * ligger FÖRE YouTube trots att YouTube är den vanligaste källan.
 *
 * ── Delad placering ─────────────────────────────────────────────────────
 * Listkorten använder standard competition ranking (1, 1, 3): spelare med
 * samma antal rätt delar plats. Det skiljer sig MEDVETET från Final
 * Leaderboard, som bryter poänglika på snittsvarstid och därför alltid ger
 * en unik ordning. Korten firar prestationen, tabellen kör tävlingen.
 *
 * Källkorten (2-4) visar BARA förstaplatsen — men flera spelare kan dela
 * den, och då namnges alla. De använder SAMMA radlayout som listkorten
 * ("1. 🦊 Anna … 2/2", antal rätt / antal frågor i källan), så alla kort i
 * sekvensen läses likadant.
 *
 * ── Snittiden (kort 5, "Fastest fingers") ───────────────────────────────
 * Mäter tiden att LÅSA ett svar, oavsett om det blev rätt eller fel. Det är
 * samma tal som redan står i leaderboardens AVG-kolumn och som redan avgör
 * vid poänglika i sorteringen — sekvensen förstärker alltså den poängmodell
 * spelarna redan spelar efter i stället för att införa ett nytt mått.
 *   • Timeouts räknas MED (registreras med full svarstid — man låste aldrig
 *     ett svar och ska inte belönas för det).
 *   • connectionError-poster räknas BORT (nätverkets fel, inte spelarens;
 *     leaderboarden särredovisar dem redan i egen kolumn).
 * Delad placering avgörs på det VISADE talet (2 decimaler) — annars kan två
 * rader som båda står på "8.42s" hamna på plats 1 och 2, vilket läses som
 * en bugg.
 *
 * ── Dormant: kategorikort (Musik/Film/Sport) + snabbaste enskilda svar ──
 * Fanns t.o.m. 2026-08-25 och föll bort när däcket ovan spikades. Typfältet
 * `category`, kind:arna 'category'/'fastest-single' och badge-renderingen i
 * FinalCelebration lämnas kvar så de kan återinföras med en loop över
 * CATEGORY_CARDS — men inget emitterar dem i dag, och `categoryByQuestion`
 * är därför oanvänd (den skickas fortfarande från quiz.tsx).
 */

import type { MainCategory } from './mainCategory';
import type { QuestionMediaType } from '../components/GetReadyIntro';
import type { LeaderboardPlayer, RoundScore } from '../components/RoundLeaderboard';

/**
 * Max antal kort i sekvensen. Däcket ovan ger som mest 5, så taket binder
 * inte i dag — det står kvar som skyddsnät om fler korttyper återinförs.
 */
export const MAX_HIGHLIGHT_CARDS = 6;

/**
 * Minsta antal frågor i en källhink för att den ska förtjäna ett eget kort.
 *
 * ⚠ 1, inte 2 (sänkt 2026-08-25). Regeln är "visa inte kort för källor som
 * inte spelats" — en källa som spelats EN gång HAR spelats. Tröskeln 2 var
 * dessutom oförenlig med däcket: standardspelet är 4 rundor och Hints-kvoten
 * är floor(N/4) = 1 fråga, så Hints-kortet hade aldrig kunnat visas.
 */
export const MIN_QUESTIONS_PER_BUCKET = 1;

export type HighlightKind =
  | 'most-correct'
  | 'fastest-average'
  /** Dormant — se filhuvudet. */
  | 'fastest-single'
  | 'source'
  /** Dormant — se filhuvudet. */
  | 'category';

/** En namngiven spelare på ett kort (källkortens förstaplats). */
export interface HighlightPlayerRef {
  playerId: string;
  name: string;
  emoji: string | null;
}

/** En rad i ett placeringskort. `place` är delad vid lika (1, 1, 3). */
export interface HighlightRankRow extends HighlightPlayerRef {
  /**
   * `null` = spelaren rankas inte. Gäller den som lämnade mitt i matchen:
   * de listas fortfarande (placeringslistorna namnger ALLA spelare) men utan
   * siffra, och `value` är "Left" i stället för ett resultat.
   */
  place: number | null;
  /** Radens tal, t.ex. "3/4" eller "8.42s" — eller "Left". */
  value: string;
  /** true när minst en annan rad delar samma placering. */
  shared: boolean;
}

export interface HighlightCard {
  /** Stabil nyckel för React + tester. */
  id: string;
  kind: HighlightKind;
  /** Kort rubrik, t.ex. "Correct answers" eller "Best on YouTube". */
  title: string;
  /**
   * Placeringslista. ENDA sättet ett kort namnger spelare — alla korttyper
   * använder samma radlayout ("1. 🦊 Anna … 2/2"). Listkorten (1 och 5) tar
   * med ALLA spelare; källkorten (2-4) bara förstaplatsen, som kan delas av
   * flera. Sätts inte i solospel/personal-läge — där bär `value` kortet.
   */
  rows?: HighlightRankRow[];
  /**
   * Huvudtalet, t.ex. "3 of 4" eller "4.12s". Används i stället för `rows`
   * när det inte finns någon att placera sig mot (solospel/personal).
   */
  value?: string;
  /** Valfri underrad, t.ex. "3 questions". */
  detail?: string;
  /**
   * Källkort renderas med appens OFFICIELLA källikon via `MediaSourceIcon`
   * (YouTubes röda play-knapp, Spotify vit monokrom, Q+"?" för Hints) —
   * aldrig emoji. Samma komponent som GetReadyIntro:s kö och CountdownIntro.
   */
  source?: QuestionMediaType;
  /**
   * DORMANT (se filhuvudet). Kategorikort renderades med appens gold
   * kant-skärande kategoribadge; inget emitterar dem i dag.
   */
  category?: MainCategory;
  /**
   * Dekorativ emoji — BARA för de generella korten (placeringslistorna).
   * Källor har en app-standard-ikon och ska därför aldrig sätta detta fält.
   */
  icon?: string;
}

export type HighlightMode = 'personal' | 'competitive';

export interface BuildMatchHighlightsInput {
  /** allRoundScoresHistory, platt eller nästlad — vi flattar själva. */
  scores: RoundScore[][];
  players: LeaderboardPlayer[];
  /** DORMANT — kategorikorten är borttagna, se filhuvudet. */
  categoryByQuestion?: (MainCategory | null)[];
  /** Indexerad mot host:s auktoritativa frågesekvens. */
  mediaSourceByQuestion: QuestionMediaType[];
  mode: HighlightMode;
}

/**
 * Källor som får ett eget kort, i VISNINGSORDNING: Spotify → YouTube →
 * Hints (kort 2, 3 och 4). Ordningen är explicit begärd.
 */
const SOURCE_CARDS: { source: QuestionMediaType; label: string }[] = [
  { source: 'spotify', label: 'Spotify' },
  { source: 'youtube', label: 'YouTube' },
  // 'image' heter Hints i appen — personbilderna är juridiskt parkerade och
  // det som faktiskt spelas är flagga + ledtrådar (samma frågepool).
  { source: 'image', label: 'Hints' },
];

/** DORMANT — se filhuvudet. Behålls så kategorikorten kan återinföras. */
export const CATEGORY_CARDS: MainCategory[] = ['Music', 'Film', 'Sport'];

/** Sekunder med två decimaler, som leaderboardens AVG/LAST-kolumner. */
function formatSeconds(value: number): string {
  return `${value.toFixed(2)}s`;
}

interface PlayerAgg {
  player: LeaderboardPlayer;
  correct: number;
  answered: number;
  /** Snittid att låsa svar; null när inget underlag finns. */
  avgSeconds: number | null;
}

/**
 * Aggregerar per spelare ur de platta scores:en. Spelare med
 * `summaryStats` (remote-motståndaren, vars per-fråga-svar är RLS-skyddade)
 * läses därifrån i stället.
 */
function aggregatePlayers(flat: RoundScore[], players: LeaderboardPlayer[]): PlayerAgg[] {
  return players.map((player) => {
    if (player.summaryStats) {
      return {
        player,
        correct: player.summaryStats.correctAnswers,
        answered: player.summaryStats.playedRounds,
        avgSeconds: player.summaryStats.avgResponseSeconds,
      };
    }
    const own = flat.filter((s) => s.playerId === player.id);
    // Snittiden exkluderar uppkopplingsmissar — se filhuvudet.
    const timed = own.filter((s) => !s.connectionError);
    return {
      player,
      correct: own.filter((s) => s.correct).length,
      answered: own.length,
      avgSeconds:
        timed.length > 0
          ? timed.reduce((sum, s) => sum + s.timeUsed, 0) / timed.length
          : null,
    };
  });
}

function toRef(player: LeaderboardPlayer): HighlightPlayerRef {
  return { playerId: player.id, name: player.name, emoji: player.emoji ?? null };
}

interface RankEntry {
  player: LeaderboardPlayer;
  /** Sorteringstal. */
  sortValue: number;
  /** Radens visade tal. */
  value: string;
  /**
   * Nyckel för DELAD placering. Två rader med samma nyckel får samma plats.
   * Skiljd från sortValue så snittiden kan dela plats på det VISADE talet.
   */
  tieKey: string;
}

/**
 * Standard competition ranking: 1, 1, 3 (inte 1, 1, 2). Sorteringen är
 * stabil, så rader med samma tieKey behåller inbördes ordning från
 * `players` — vilket är turordningen, inte något godtyckligt.
 */
function buildRankRows(entries: RankEntry[], higherIsBetter: boolean): HighlightRankRow[] {
  const sorted = [...entries].sort((a, b) =>
    higherIsBetter ? b.sortValue - a.sortValue : a.sortValue - b.sortValue,
  );
  const counts = new Map<string, number>();
  for (const e of sorted) counts.set(e.tieKey, (counts.get(e.tieKey) ?? 0) + 1);

  let place = 0;
  let prevKey: string | null = null;
  return sorted.map((e, i) => {
    if (e.tieKey !== prevKey) {
      place = i + 1;
      prevKey = e.tieKey;
    }
    return {
      ...toRef(e.player),
      place,
      value: e.value,
      shared: (counts.get(e.tieKey) ?? 1) > 1,
    };
  });
}

/**
 * Placeringslistorna namnger ALLA spelare, så den som lämnade mitt i matchen
 * ska synas — men utan resultat (Peter 2026-08-26). De läggs sist, utan
 * placeringssiffra, med "Left" i stället för sitt tal. Deras delsumma är
 * ingen giltig placering: de slutade svara.
 *
 * ⚠ Gäller BARA listkorten. Källkorten ("Best on Spotify" osv.) visar bara
 * förstaplatsen — där ska en avhoppare inte kunna vinna, så de filtreras
 * bort ur `aggs` innan korten byggs.
 */
function appendDepartedRows(
  rows: HighlightRankRow[],
  departed: LeaderboardPlayer[],
): HighlightRankRow[] {
  if (departed.length === 0) return rows;
  return [
    ...rows,
    ...departed.map((player) => ({
      ...toRef(player),
      place: null,
      value: 'Left',
      shared: false,
    })),
  ];
}

/**
 * Bygger korten för en avslutad match. Returnerar max MAX_HIGHLIGHT_CARDS
 * kort; källor utan underlag hoppas över helt (spelades ingen Spotify finns
 * inget Spotify-kort — ingen extra flagga behövs).
 */
export function buildMatchHighlights(
  input: BuildMatchHighlightsInput,
): HighlightCard[] {
  const { scores, mediaSourceByQuestion, mode } = input;
  // ⚠ Den som lämnade MITT i matchen RANKAS inte (Peter 2026-08-26) — de
  // slutade svara, så deras delsumma är ingen giltig placering. Utan det
  // kunde någon som gick efter två rätta svar toppa "Correct answers"
  // sekunder innan slutskärmen visar dem längst ner utan placeringssiffra.
  // Samma regel som `finalizeRows` i LeaderboardTable.
  //
  // De VISAS ändå i listkorten, sist och utan siffra, med "Left" i stället
  // för ett resultat — listorna namnger alla spelare. Se `appendDepartedRows`.
  // Ur allt annat (aggregering, källkort, ranked-gaten) är de borta.
  //
  // `hasLeft` sätts bara för avhopp under pågående spel (`leftDuringGameIds`
  // i quiz.tsx); den som lämnar EFTER slutsignalen spelade hela matchen och
  // är kvar här som vanligt.
  const players = input.players.filter((p) => !p.hasLeft);
  const departed = input.players.filter((p) => p.hasLeft);
  if (players.length === 0) return [];

  const flat = scores.flat();
  if (flat.length === 0) return [];

  const personal = mode === 'personal';
  const aggs = aggregatePlayers(flat, players);
  const cards: HighlightCard[] = [];

  /**
   * Placeringslistor kräver någon att placera sig MOT. Med en enda spelare
   * degenererar listan till en rad, så solospelet behåller value-layouten.
   *
   * ⚠ Gaten är antalet spelare, INTE `mode`. Remote 1v1 kör personal-läge
   * (kategori-/källjämförelser saknar underlag) men har två spelare med
   * fullgott underlag för BÅDA listkorten — de ska placeras mot varandra.
   */
  const ranked = players.length >= 2;

  // ── 1. Correct answers ─────────────────────────────────────────────────
  // Delad placering på ANTAL RÄTT — "3/4" och "3/3" delar plats, eftersom
  // regeln är formulerad på antalet rätt, inte på träffprocent.
  if (ranked) {
    cards.push({
      id: 'most-correct',
      kind: 'most-correct',
      title: 'Correct answers',
      rows: appendDepartedRows(
        buildRankRows(
          aggs.map((a) => ({
            player: a.player,
            sortValue: a.correct,
            value: `${a.correct}/${a.answered}`,
            tieKey: String(a.correct),
          })),
          true,
        ),
        departed,
      ),
      detail: 'Same number of correct answers shares a place',
      icon: '🎯',
    });
  } else {
    const solo = aggs[0];
    if (solo && solo.answered > 0) {
      cards.push({
        id: 'most-correct',
        kind: 'most-correct',
        title: 'Correct answers',
        value: `${solo.correct} of ${solo.answered}`,
        icon: '🎯',
      });
    }
  }

  /**
   * Källkorten (2-4). Kortet skapas bara om källan spelats
   * (MIN_QUESTIONS_PER_BUCKET frågor) OCH någon svarat rätt på minst en —
   * sekvensen ska vara firande, och "Best on Spotify — 0 of 3" är inte det.
   *
   * Flera spelare kan DELA förstaplatsen; då namnges alla. Placeringar
   * under första visas aldrig här.
   */
  const sourceCard = (
    id: string,
    title: string,
    source: QuestionMediaType,
    questionIndices: Set<number>,
  ): HighlightCard | null => {
    if (questionIndices.size < MIN_QUESTIONS_PER_BUCKET) return null;
    // Poster utan questionIndex (äldre data) kan inte hänföras till en källa.
    const inBucket = flat.filter(
      (s) => s.questionIndex !== undefined && questionIndices.has(s.questionIndex),
    );
    if (inBucket.length === 0) return null;

    const perPlayer = players
      .map((player) => {
        const own = inBucket.filter((s) => s.playerId === player.id);
        return {
          player,
          correct: own.filter((s) => s.correct).length,
          answered: own.length,
        };
      })
      .filter((p) => p.answered > 0);
    if (perPlayer.length === 0) return null;

    const top = Math.max(...perPlayer.map((p) => p.correct));
    // Ingen fick något rätt → hoppa över.
    if (top === 0) return null;
    const winners = perPlayer.filter((p) => p.correct === top);

    return {
      id,
      kind: 'source',
      title,
      // Samma radlayout som listkorten ("1. 🦊 Anna … 2/2"), men BARA
      // förstaplatsen. Alla vinnare har per definition samma `correct`;
      // `answered` kan skilja om någon tappade uppkopplingen, så nämnaren
      // är hinkens storlek — antal rätt / antal frågor i källan.
      rows: personal
        ? undefined
        : winners.map((w) => ({
            ...toRef(w.player),
            place: 1,
            value: `${w.correct}/${questionIndices.size}`,
            shared: winners.length > 1,
          })),
      // Personal-läget har ingen att placera sig mot — talet bär kortet.
      value: personal ? `${top} of ${questionIndices.size}` : undefined,
      detail:
        winners.length > 1 && !personal
          ? `${winners.length} players share first place`
          : undefined,
      source,
    };
  };

  const indicesWhere = <T,>(arr: T[], match: (v: T) => boolean): Set<number> => {
    const out = new Set<number>();
    arr.forEach((v, i) => {
      if (match(v)) out.add(i);
    });
    return out;
  };

  // ── 2-4. Källor: Spotify → YouTube → Hints ─────────────────────────────
  // Rubriken behåller källans NAMN eftersom Hints-ikonen (Q + "?") inte är
  // självförklarande på egen hand — brand-ikonen och namnet förstärker
  // varandra, precis som i Lobby:s Game Connections-rader.
  for (const { source, label } of SOURCE_CARDS) {
    const card = sourceCard(
      `source-${source}`,
      personal ? label : `Best on ${label}`,
      source,
      indicesWhere(mediaSourceByQuestion, (s) => s === source),
    );
    if (card) cards.push(card);
  }

  // ── 5. Fastest fingers ─────────────────────────────────────────────────
  // Spelare utan tidsunderlag (svarade aldrig, eller bara connectionError)
  // kan inte placeras och utelämnas ur listan.
  const timedAggs = aggs.filter(
    (a): a is PlayerAgg & { avgSeconds: number } => a.avgSeconds !== null,
  );
  if (timedAggs.length > 0) {
    if (ranked) {
      cards.push({
        id: 'fastest-average',
        kind: 'fastest-average',
        title: 'Fastest fingers',
        rows: appendDepartedRows(
          buildRankRows(
            timedAggs.map((a) => ({
              player: a.player,
              sortValue: a.avgSeconds,
              value: formatSeconds(a.avgSeconds),
              // Delad placering på det VISADE talet — se filhuvudet.
              tieKey: formatSeconds(a.avgSeconds),
            })),
            false,
          ),
          departed,
        ),
        detail: 'Average time to lock in an answer',
        icon: '⚡',
      });
    } else {
      const solo = timedAggs[0];
      cards.push({
        id: 'fastest-average',
        kind: 'fastest-average',
        title: 'Average lock-in time',
        value: formatSeconds(solo.avgSeconds),
        detail: 'Average across all answers',
        icon: '⚡',
      });
    }
  }

  return cards.slice(0, MAX_HIGHLIGHT_CARDS);
}

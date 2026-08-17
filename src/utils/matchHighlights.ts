/**
 * Match highlights — korten som visas i prisutdelnings-sekvensen mellan
 * sista frågans reveal och Final Leaderboard.
 *
 * Ren funktion utan React så regeln kan enhetstestas
 * (backend/content/test/matchHighlights.test.ts).
 *
 * ── Kort-ordning (prioritet) ────────────────────────────────────────────
 *   1. Flest rätt totalt                        — alltid
 *   2. Snabbast att låsa svar (snittid)          — alltid
 *   3. Snabbaste enskilda rätta svar             — om något rätt svar finns
 *   4-6. Bäst på YouTube / Spotify / Hints       — källan har ≥2 frågor
 *   7-9. Bäst på Musik / Film / Sport            — kategorin har ≥2 frågor
 *
 * ── Varför ≥2-regeln ────────────────────────────────────────────────────
 * Standardspelet är 4 rundor. Utan tröskeln dyker kort som "Bäst på Sport —
 * Anna, 1 av 1 rätt" upp och läses som ihåligt. Med den får ett 4-rundorsspel
 * några få meningsfulla kort och ett 20-rundorsspel hela uppsättningen.
 *
 * ── Snittiden (kort 2) ──────────────────────────────────────────────────
 * Mäter tiden att LÅSA ett svar, oavsett om det blev rätt eller fel. Det är
 * samma tal som redan står i leaderboardens AVG-kolumn och som redan avgör
 * vid poänglika i sorteringen — sekvensen förstärker alltså den poängmodell
 * spelarna redan spelar efter i stället för att införa ett nytt mått.
 *   • Timeouts räknas MED (registreras med full svarstid — man låste aldrig
 *     ett svar och ska inte belönas för det).
 *   • connectionError-poster räknas BORT (nätverkets fel, inte spelarens;
 *     leaderboarden särredovisar dem redan i egen kolumn).
 */

import type { MainCategory } from './mainCategory';
import type { QuestionMediaType } from '../components/GetReadyIntro';
import type { LeaderboardPlayer, RoundScore } from '../components/RoundLeaderboard';

/** Max antal kort i sekvensen — håller den under ~15 s. */
export const MAX_HIGHLIGHT_CARDS = 6;

/** Minsta antal frågor i en hink för att den ska förtjäna ett eget kort. */
export const MIN_QUESTIONS_PER_BUCKET = 2;

export type HighlightKind =
  | 'most-correct'
  | 'fastest-average'
  | 'fastest-single'
  | 'source'
  | 'category';

export interface HighlightCard {
  /** Stabil nyckel för React + tester. */
  id: string;
  kind: HighlightKind;
  /** Kort rubrik, t.ex. "Most correct answers" eller "Best on YouTube". */
  title: string;
  /** Vinnarens namn, eller null i personal-läge (då bär value:t allt). */
  playerName: string | null;
  playerEmoji: string | null;
  /** Huvudtalet, t.ex. "7 of 10" eller "4.12s". */
  value: string;
  /** Valfri underrad, t.ex. "3 questions". */
  detail?: string;
  /**
   * Källkort renderas med appens OFFICIELLA källikon via `MediaSourceIcon`
   * (YouTubes röda play-knapp, Spotify vit monokrom, Q+"?" för Hints) —
   * aldrig emoji. Samma komponent som GetReadyIntro:s kö och CountdownIntro.
   */
  source?: QuestionMediaType;
  /**
   * Kategorikort renderas med appens gold kant-skärande kategoribadge
   * (samma vokabulär som GetReadyIntro:s `categoryBadge`). Alla tre
   * kategorier delar MEDVETET en enda guldfärg — per-kategori-färgning har
   * testats tidigare och gav splittrad känsla.
   */
  category?: MainCategory;
  /**
   * Dekorativ emoji — BARA för de generella korten (flest rätt, snittid,
   * snabbaste svar). De har ingen app-standard-ikon; källor och kategorier
   * har det och ska därför aldrig sätta detta fält.
   */
  icon?: string;
}

export type HighlightMode = 'personal' | 'competitive';

export interface BuildMatchHighlightsInput {
  /** allRoundScoresHistory, platt eller nästlad — vi flattar själva. */
  scores: RoundScore[][];
  players: LeaderboardPlayer[];
  /** Indexerad mot host:s auktoritativa frågesekvens. */
  categoryByQuestion: (MainCategory | null)[];
  /** Indexerad mot host:s auktoritativa frågesekvens. */
  mediaSourceByQuestion: QuestionMediaType[];
  mode: HighlightMode;
}

/** Källor som får ett eget kort, i visningsordning. */
const SOURCE_CARDS: { source: QuestionMediaType; label: string }[] = [
  { source: 'youtube', label: 'YouTube' },
  { source: 'spotify', label: 'Spotify' },
  // 'image' heter Hints i appen — personbilderna är juridiskt parkerade och
  // det som faktiskt spelas är flagga + ledtrådar (samma frågepool).
  { source: 'image', label: 'Hints' },
];

const CATEGORY_CARDS: MainCategory[] = ['Music', 'Film', 'Sport'];

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
  /** Snabbaste enskilda RÄTTA svar; null om inga rätta svar. */
  fastestCorrect: number | null;
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
        // Per-fråga-underlag saknas → inget "snabbaste enskilda svar".
        fastestCorrect: null,
      };
    }
    const own = flat.filter((s) => s.playerId === player.id);
    // Snittiden exkluderar uppkopplingsmissar — se filhuvudet.
    const timed = own.filter((s) => !s.connectionError);
    const correctTimes = own.filter((s) => s.correct).map((s) => s.timeUsed);
    return {
      player,
      correct: own.filter((s) => s.correct).length,
      answered: own.length,
      avgSeconds:
        timed.length > 0
          ? timed.reduce((sum, s) => sum + s.timeUsed, 0) / timed.length
          : null,
      fastestCorrect: correctTimes.length > 0 ? Math.min(...correctTimes) : null,
    };
  });
}

/** Vinnaren enligt `better`, eller null om ingen kandidat har underlag. */
function pickWinner<T>(
  candidates: T[],
  valueOf: (c: T) => number | null,
  better: (a: number, b: number) => boolean,
): T | null {
  let best: T | null = null;
  let bestValue: number | null = null;
  for (const c of candidates) {
    const v = valueOf(c);
    if (v === null) continue;
    if (bestValue === null || better(v, bestValue)) {
      best = c;
      bestValue = v;
    }
  }
  return best;
}

const higher = (a: number, b: number) => a > b;
const lower = (a: number, b: number) => a < b;

/**
 * Bygger korten för en avslutad match. Returnerar max MAX_HIGHLIGHT_CARDS
 * kort; hinkar utan underlag hoppas över helt (spelades ingen Spotify finns
 * inget Spotify-kort — ingen extra flagga behövs).
 */
export function buildMatchHighlights(
  input: BuildMatchHighlightsInput,
): HighlightCard[] {
  const { scores, players, categoryByQuestion, mediaSourceByQuestion, mode } = input;
  if (players.length === 0) return [];

  const flat = scores.flat();
  if (flat.length === 0) return [];

  const personal = mode === 'personal';
  const aggs = aggregatePlayers(flat, players);
  const cards: HighlightCard[] = [];

  // Namnfält utelämnas i personal-läge — då bär title + value hela kortet
  // ("Music — you got 3 of 4 right") i stället för att utse en "vinnare"
  // bland en enda spelare.
  const nameOf = (p: LeaderboardPlayer) => (personal ? null : p.name);
  const emojiOf = (p: LeaderboardPlayer) => (personal ? null : p.emoji);

  // ── 1. Flest rätt totalt ───────────────────────────────────────────────
  const mostCorrect = pickWinner(aggs, (a) => (a.answered > 0 ? a.correct : null), higher);
  if (mostCorrect) {
    cards.push({
      id: 'most-correct',
      kind: 'most-correct',
      title: personal ? 'Correct answers' : 'Most correct answers',
      playerName: nameOf(mostCorrect.player),
      playerEmoji: emojiOf(mostCorrect.player),
      value: `${mostCorrect.correct} of ${mostCorrect.answered}`,
      icon: '🎯',
    });
  }

  // ── 2. Snabbast att låsa svar (snittid) ────────────────────────────────
  const fastestAvg = pickWinner(aggs, (a) => a.avgSeconds, lower);
  if (fastestAvg && fastestAvg.avgSeconds !== null) {
    cards.push({
      id: 'fastest-average',
      kind: 'fastest-average',
      title: personal ? 'Average lock-in time' : 'Fastest to lock an answer',
      playerName: nameOf(fastestAvg.player),
      playerEmoji: emojiOf(fastestAvg.player),
      value: formatSeconds(fastestAvg.avgSeconds),
      detail: 'Average across all answers',
      icon: '⚡',
    });
  }

  // ── 3. Snabbaste enskilda rätta svar ───────────────────────────────────
  const fastestSingle = pickWinner(aggs, (a) => a.fastestCorrect, lower);
  if (fastestSingle && fastestSingle.fastestCorrect !== null) {
    cards.push({
      id: 'fastest-single',
      kind: 'fastest-single',
      title: 'Fastest correct answer',
      playerName: nameOf(fastestSingle.player),
      playerEmoji: emojiOf(fastestSingle.player),
      value: formatSeconds(fastestSingle.fastestCorrect),
      icon: '🚀',
    });
  }

  /**
   * Gemensam byggare för källa-/kategorikorten. `questionIndices` är de
   * frågeindex som tillhör hinken; kortet skapas bara om hinken har minst
   * MIN_QUESTIONS_PER_BUCKET frågor OCH någon svarat rätt på minst en.
   */
  const bucketCard = (
    id: string,
    kind: HighlightKind,
    title: string,
    visual: Pick<HighlightCard, 'source' | 'category'>,
    questionIndices: Set<number>,
  ): HighlightCard | null => {
    if (questionIndices.size < MIN_QUESTIONS_PER_BUCKET) return null;
    // Poster utan questionIndex (äldre data) kan inte hänföras till en hink.
    const inBucket = flat.filter(
      (s) => s.questionIndex !== undefined && questionIndices.has(s.questionIndex),
    );
    if (inBucket.length === 0) return null;

    const perPlayer = players.map((player) => {
      const own = inBucket.filter((s) => s.playerId === player.id);
      return {
        player,
        correct: own.filter((s) => s.correct).length,
        answered: own.length,
      };
    });
    const winner = pickWinner(
      perPlayer,
      (p) => (p.answered > 0 ? p.correct : null),
      higher,
    );
    // Ingen fick något rätt → hoppa över. Sekvensen ska vara firande.
    if (!winner || winner.correct === 0) return null;

    return {
      id,
      kind,
      title,
      playerName: nameOf(winner.player),
      playerEmoji: emojiOf(winner.player),
      value: `${winner.correct} of ${winner.answered}`,
      detail: `${questionIndices.size} ${questionIndices.size === 1 ? 'question' : 'questions'}`,
      ...visual,
    };
  };

  const indicesWhere = <T,>(arr: T[], match: (v: T) => boolean): Set<number> => {
    const out = new Set<number>();
    arr.forEach((v, i) => {
      if (match(v)) out.add(i);
    });
    return out;
  };

  // ── 4-6. Källor ────────────────────────────────────────────────────────
  // Rubriken behåller källans NAMN eftersom Hints-ikonen (Q + "?") inte är
  // självförklarande på egen hand — brand-ikonen och namnet förstärker
  // varandra, precis som i Lobby:s Game Connections-rader.
  for (const { source, label } of SOURCE_CARDS) {
    const card = bucketCard(
      `source-${source}`,
      'source',
      personal ? label : `Best on ${label}`,
      { source },
      indicesWhere(mediaSourceByQuestion, (s) => s === source),
    );
    if (card) cards.push(card);
  }

  // ── 7-9. Kategorier ────────────────────────────────────────────────────
  // Kategorinamnet bärs av den kant-skärande guld-badgen (appens standard),
  // så rubriken upprepar det INTE — den säger vad talet betyder i stället.
  for (const category of CATEGORY_CARDS) {
    const card = bucketCard(
      `category-${category}`,
      'category',
      personal ? 'Correct answers' : 'Best player',
      { category },
      indicesWhere(categoryByQuestion, (c) => c === category),
    );
    if (card) cards.push(card);
  }

  return cards.slice(0, MAX_HIGHLIGHT_CARDS);
}

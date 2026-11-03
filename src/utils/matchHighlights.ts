/**
 * Game Summary — korten som visas i prisutdelnings-sekvensen mellan sista
 * frågans reveal och Final Leaderboard.
 *
 * Ren funktion utan React så reglerna kan enhetstestas
 * (backend/content/test/matchHighlights.test.ts).
 *
 * ── Multiplayer-däcket (Peter 2026-11-03, förenklat samma dag) ─────────
 *   1. HCP Progress — DENNA enhets inloggade spelare (sköld + myntsnurr,
 *      samma kort som solo). Utelämnas för gäst / saknat HCP-resultat.
 *   2. Top Game Performance.
 *   Remote 1v1 / guest-hostat spel: bara Top Game Performance (inget HCP).
 *
 * Det finns INGET kort som jämför alla spelares HCP — den informationen
 * finns redan på Final Leaderboard ("HCP N (delta)" + "+"-popupen). Inga
 * kategori-/Hints-kort och inga separata Correct answers / Fastest fingers.
 * Återinför dem inte utan nytt beslut.
 *
 * ── Top Game Performance ────────────────────────────────────────────────
 * Bara spelarna som delar HÖGSTA antalet rätt. Varje rad visar rätt svar
 * (primärt) och snittid att låsa ett svar (sekundärt); raderna sorteras på
 * snittiden — lägst vinner. Placeringarna är alltid unika (1, 2, 3 …), även
 * vid samma visade tid (då behålls turordningen). Spelare med färre rätt
 * visas inte alls (Peter 2026-11-03).
 * Snittiden: timeouts räknas MED (full svarstid), connectionError räknas BORT
 * — samma tal som leaderboardens AVG-kolumn. Den som lämnade mitt i matchen
 * är utesluten.
 */

import type { LeaderboardPlayer, RoundScore } from '../components/RoundLeaderboard';

export type HighlightKind =
  // Spelarens egen HCP före/efter (sköld + myntsnurr).
  | 'hcp-progress'
  // Topp-spelarna: rätt svar + snittid (multiplayer).
  | 'top-performance'
  // Solospel: rätt svar + snittid i ETT kort (buildSinglePlayerSummary).
  | 'game-performance';

/** En namngiven spelare på ett kort. */
export interface HighlightPlayerRef {
  playerId: string;
  name: string;
  emoji: string | null;
}

/** En rad i Top Game Performance. `place` är alltid unik (1, 2, 3 …). */
export interface HighlightRankRow extends HighlightPlayerRef {
  place: number;
  /** Primärt tal, t.ex. "3/4". */
  value: string;
  /** Sekundärt tal, t.ex. "7.42s" (snittid). */
  secondary: string;
  /**
   * true på den snabbaste raden när FLERA delar högsta antalet rätt — då är
   * det snittiden som avgör, och den tiden lyfts fram (guld + puls).
   */
  fastest?: boolean;
}

export interface HighlightCard {
  /** Stabil nyckel för React + tester. */
  id: string;
  kind: HighlightKind;
  title: string;
  /** Top Game Performance-rader. */
  rows?: HighlightRankRow[];
  /** Valfri underrad. */
  detail?: string;
  /**
   * HCP-progressionskortet: Total-HCP före och efter spelet (display-värden,
   * heltal 1–99). Renderas som [förändrings-sköld] → [nytt HCP].
   */
  hcp?: { before: number; after: number };
  /**
   * Game Performance-kortet (solospel): rätt svar är primärt, snittiden att
   * låsa ett svar sekundär. `avgSeconds` null = inget tidsunderlag.
   */
  performance?: { correct: number; total: number; avgSeconds: number | null };
}

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
    // Snittiden exkluderar uppkopplingsmissar.
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

export interface BuildMultiplayerSummaryInput {
  /** allRoundScoresHistory, nästlad — vi flattar själva. */
  scores: RoundScore[][];
  /** Spelarna i turordning. */
  players: LeaderboardPlayer[];
  /** Id:n för spelare som spelar som gäst (inget HCP). */
  guestIds?: ReadonlySet<string>;
  /** Denna enhets spelare. */
  selfPlayerId?: string | null;
  /**
   * Denna enhets HCP före/efter. null/utelämnat = inget HCP-kort (gäst,
   * remote, guest-hostat spel eller inget resultat).
   */
  selfHcp?: { before: number; after: number } | null;
}

/** Multiplayer-däcket — se filhuvudet. */
export function buildMultiplayerSummary(
  input: BuildMultiplayerSummaryInput,
): HighlightCard[] {
  const guestIds = input.guestIds ?? new Set<string>();
  const selfId = input.selfPlayerId ?? null;
  const cards: HighlightCard[] = [];

  // ── HCP Progress — denna enhets inloggade spelare ─────────────────────
  if (input.selfHcp && selfId && !guestIds.has(selfId)) {
    cards.push({
      id: 'hcp-progress',
      kind: 'hcp-progress',
      title: 'HCP progress',
      hcp: { before: input.selfHcp.before, after: input.selfHcp.after },
    });
  }

  // ── Top Game Performance ──────────────────────────────────────────────
  const active = input.players.filter((p) => !p.hasLeft);
  const aggs = aggregatePlayers(input.scores.flat(), active).filter((a) => a.answered > 0);
  if (aggs.length > 0) {
    const top = Math.max(...aggs.map((a) => a.correct));
    // Lägst snittid först; spelare utan tidsunderlag sist. Stabil sortering
    // behåller turordningen vid lika.
    const sorted = aggs
      .filter((a) => a.correct === top)
      .sort((a, b) => {
        if (a.avgSeconds === null) return b.avgSeconds === null ? 0 : 1;
        if (b.avgSeconds === null) return -1;
        return a.avgSeconds - b.avgSeconds;
      });
    // Unika placeringar: snabbast = 1, näst snabbast = 2 osv.
    const rows: HighlightRankRow[] = sorted.map((a, i) => ({
      ...toRef(a.player),
      place: i + 1,
      value: `${a.correct}/${a.answered}`,
      secondary: a.avgSeconds === null ? '—' : formatSeconds(a.avgSeconds),
      fastest: sorted.length > 1 && i === 0 && a.avgSeconds !== null,
    }));
    cards.push({
      id: 'top-performance',
      kind: 'top-performance',
      title: 'Top game performance',
      rows,
      detail:
        rows.length > 1
          ? 'Same score — fastest average lock-in time wins'
          : 'Correct answers · average lock-in time',
    });
  }

  return cards;
}

/**
 * Solospelets Game Summary — EXAKT två kort, i fast ordning:
 *   1. HCP Progress   ([förändring] → [nytt HCP])
 *   2. Game Performance (rätt svar + snittid i samma kort)
 *
 * Inga kategori-/källkort (Music, Film/TV, Hints) och inga separata kort för
 * rätt svar eller snittid. `hcp` saknas när spelet inte grundar något HCP
 * (gäst) — då visas bara Game Performance.
 */
export function buildSinglePlayerSummary(input: {
  scores: RoundScore[][];
  player: LeaderboardPlayer;
  hcp?: { before: number; after: number } | null;
}): HighlightCard[] {
  const [agg] = aggregatePlayers(input.scores.flat(), [input.player]);
  const cards: HighlightCard[] = [];
  if (input.hcp) {
    cards.push({
      id: 'hcp-progress',
      kind: 'hcp-progress',
      title: 'HCP progress',
      hcp: { before: input.hcp.before, after: input.hcp.after },
    });
  }
  cards.push({
    id: 'game-performance',
    kind: 'game-performance',
    title: 'Game performance',
    performance: {
      correct: agg?.correct ?? 0,
      total: agg?.answered ?? 0,
      avgSeconds: agg?.avgSeconds ?? null,
    },
  });
  return cards;
}

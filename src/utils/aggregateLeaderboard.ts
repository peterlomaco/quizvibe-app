import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AssistanceLevel } from '../components/RoundLeaderboard';

/**
 * Aggregate Leaderboard — serien av spel som hänger ihop via
 * "Re-match with Aggregate Leaderboard?" på Final Leaderboard.
 *
 * Slutskärmen visar ALLTID spelet som just spelats. Har serien fler än ett
 * spel går det att svepa (eller tappa fliken) till "Aggregate Leaderboard",
 * som är exakt samma tabell — samma kolumner, samma sortering — fast över
 * alla spel i serien.
 *
 * ── Varför ingen delad series-id över enheterna ─────────────────────────
 * Varje enhet håller sin EGEN kopia och visar bara sin egen vy. Så länge
 * enheterna råkar bokföra samma spel blir siffrorna identiska, och de gör
 * de: i Individual Devices har alla enheter hela `allRoundScoresHistory`
 * via `player_score_recorded`-broadcasten.
 *
 * Kedjan avgörs därför lokalt på RUMKODEN i stället för på ett id som
 * skulle behöva synkas: när en re-match startas stämplas den kommande
 * rumkoden i `nextRoomCode`, och nästa spel som slutar i just det rummet
 * fortsätter serien. Allt annat startar en ny serie. Det kräver varken
 * DB-migration, nytt broadcast-event eller att enheterna kommer överens
 * om något.
 *   • Host stämplar i `goToNewLobby` (reusePlayers = true).
 *   • Non-host stämplar när `play_again_lobby_ready` faktiskt tar dem
 *     vidare till nya lobbyn.
 *
 * ── Idempotens ──────────────────────────────────────────────────────────
 * Spel lagras som per-spel-snapshots nycklade på rumkod och ERSÄTTS vid
 * omskrivning. Slutskärmen skriver om sig när sena peer-scores droppar in
 * utan att spelet dubbelräknas. Summeringen sker vid LÄSNING
 * (`buildAggregateStandings`), inte vid skrivning.
 */

const KEY = '@quizvibe/aggregateSeries/v1';
/** Rullande tak — en serie är ett sittande, inte en livshistorik. */
const MAX_GAMES = 20;

/** Ett spels bidrag till serien, per spelare. */
export interface AggregateGamePlayer {
  playerId: string;
  name: string;
  emoji: string;
  assistance?: AssistanceLevel;
  age?: number;
  points: number;
  /** Antal frågor spelaren faktiskt svarade på i det spelet. */
  playedRounds: number;
  correctAnswers: number;
  /** Summa svarstid (sek). Snittet räknas om över hela serien vid läsning. */
  totalResponseSeconds: number;
  /** Rätt/fel i frågeordning — driver "Last 5" över serien. */
  results: boolean[];
  /** Sista svarstiden i spelet (null om spelaren aldrig svarade). */
  lastResponseSeconds: number | null;
}

export interface AggregateSeriesGame {
  roomCode: string;
  players: AggregateGamePlayer[];
}

export interface AggregateSeries {
  /** Rumkoden som en PÅBÖRJAD re-match kommer spelas i. */
  nextRoomCode: string | null;
  games: AggregateSeriesGame[];
  /**
   * Id på den SERVER-sparade serien (migration 0037), när spelet består av
   * 100 % QuizVibe-users. null = serien lever bara lokalt (gäst med i spelet,
   * eller servern otillgänglig) — flikarna på slutskärmen fungerar ändå.
   * Se [aggregateLeaderboards.ts](./aggregateLeaderboards.ts).
   */
  leaderboardId?: string | null;
}

/** En färdig rad i den sammanslagna tabellen. */
export interface AggregateStanding {
  playerId: string;
  name: string;
  emoji: string;
  assistance?: AssistanceLevel;
  age?: number;
  points: number;
  playedRounds: number;
  correctAnswers: number;
  avgResponseSeconds: number;
  lastResponseSeconds: number | null;
  lastFiveResults: boolean[];
}

/**
 * En serie med EN deltagare heter "Marathon Score" (single player-varianten
 * "Replay & Marathon score"), med flera "Marathon table". Peters
 * ordval — datamodellen är identisk.
 *
 * ⚠ Detta är UI-COPY. Tabeller, RPC:er och kod-identifierare heter
 *   fortsatt `aggregate*` (migration 0037 är körd) — döp inte om dem.
 *
 * Uppsättningen är låst genom hela serien (re-match-lobbyn tillåter varken
 * tillägg eller borttag), så antalet är stabilt och etiketten kan aldrig
 * hoppa mitt i en serie.
 */
export function aggregateLabel(participantCount: number): string {
  return participantCount <= 1 ? 'Marathon Score' : 'Marathon table';
}

/**
 * Namnförslag när en ny sparad serie skapas. Host döper ändå om från
 * aggregat-fliken, så detta ska bara vara igenkännbart — inte perfekt.
 *
 * Ligger HÄR och inte i aggregateLeaderboards.ts med resten av server-API:t:
 * den modulen importerar Supabase-klienten (→ react-native), vilket gör den
 * oimporterbar i vitest. En ren strängfunktion ska inte behöva den kedjan.
 *
 * Cappas till 40 tecken — samma gräns som DB-constraintet på `name`.
 */
export function defaultAggregateName(playerNames: string[]): string {
  if (playerNames.length === 0) return 'Marathon';
  if (playerNames.length === 1) return `${playerNames[0]} — solo`;
  const joined = playerNames.join(' & ');
  if (joined.length <= 40) return joined;
  return `${playerNames[0]} & ${playerNames.length - 1} more`;
}

export interface AggregateLeaderboardData {
  gamesPlayed: number;
  standings: AggregateStanding[];
}

const EMPTY: AggregateSeries = { nextRoomCode: null, games: [] };

function isSeries(value: unknown): value is AggregateSeries {
  if (!value || typeof value !== 'object') return false;
  const v = value as AggregateSeries;
  return Array.isArray(v.games);
}

export async function loadAggregateSeries(): Promise<AggregateSeries | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isSeries(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function writeSeries(series: AggregateSeries): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(series));
  } catch {
    // Aggregate är en bonusvy — en misslyckad skrivning får aldrig blockera
    // slutskärmen.
  }
}

export async function clearAggregateSeries(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // Ignorera — nästa recordGameInSeries skriver ändå över.
  }
}

/**
 * Stämplar rumkoden som en påbörjad re-match kommer spelas i. Nästa
 * `recordGameInSeries` med SAMMA kod fortsätter serien.
 */
export async function markSeriesContinues(
  nextRoomCode: string,
  leaderboardId?: string | null,
): Promise<void> {
  const code = nextRoomCode?.trim();
  if (!code) return;
  const stored = (await loadAggregateSeries()) ?? EMPTY;
  await writeSeries({
    ...stored,
    nextRoomCode: code,
    // undefined = "ingen uppgift" (behåll), null = "koppla loss".
    leaderboardId:
      leaderboardId === undefined ? stored.leaderboardId ?? null : leaderboardId,
  });
}

/**
 * Kopplar den lokala serien till en SPARAD leaderboard och seedar den med
 * dess redan spelade omgångar, så slutskärmens aggregat-flik visar hela
 * historiken direkt — utan en extra hämtning i quiz-vyn.
 *
 * Spelen dedupliceras på rumkod: en omgång som redan finns lokalt (den som
 * just spelades) ska inte dubbleras av serverkopian.
 */
export async function attachSeriesToLeaderboard(
  leaderboardId: string,
  serverGames: AggregateSeriesGame[],
): Promise<AggregateSeries> {
  const stored = (await loadAggregateSeries()) ?? EMPTY;
  const byCode = new Map<string, AggregateSeriesGame>();
  serverGames.forEach((g) => byCode.set(g.roomCode, g));
  // Lokala spel vinner — de är färskast (och innehåller omgången som just
  // avslutades, vilken servern kanske inte hunnit få än).
  stored.games.forEach((g) => byCode.set(g.roomCode, g));
  const next: AggregateSeries = {
    ...stored,
    leaderboardId,
    games: [...byCode.values()].slice(-MAX_GAMES),
  };
  await writeSeries(next);
  return next;
}

/**
 * Bokför ett avslutat spel. Fortsätter serien när rumkoden är den som
 * stämplades vid re-matchen (eller när samma spel skrivs om — sena
 * peer-scores), annars startas en ny serie med bara det här spelet.
 */
export async function recordGameInSeries(
  roomCode: string,
  players: AggregateGamePlayer[],
): Promise<AggregateSeries> {
  const code = roomCode?.trim();
  if (!code) return EMPTY;
  const stored = await loadAggregateSeries();
  const alreadyInSeries = !!stored?.games.some((g) => g.roomCode === code);
  const continues = !!stored && (stored.nextRoomCode === code || alreadyInSeries);
  const previous = continues ? stored!.games : [];
  const games = alreadyInSeries
    ? previous.map((g) => (g.roomCode === code ? { roomCode: code, players } : g))
    : [...previous, { roomCode: code, players }];
  const next: AggregateSeries = {
    // Kopplingen till den sparade serien följer med så länge kedjan håller.
    leaderboardId: continues ? stored?.leaderboardId ?? null : null,
    // Ett NYTT spel förbrukar kedjan — en kommande re-match stämplar en ny
    // kod. En OMSKRIVNING av ett redan bokfört spel (sena peer-scores) måste
    // däremot lämna stämpeln orörd: host hinner annars starta re-matchen och
    // få den nollställd av en efterslängande score, varpå nästa spel tappar
    // serien.
    nextRoomCode: alreadyInSeries ? stored?.nextRoomCode ?? null : null,
    games: games.slice(-MAX_GAMES),
  };
  await writeSeries(next);
  return next;
}

/**
 * Summerar serien till tabellrader. Sorteras INTE här — Final Leaderboard
 * äger sorteringskriterierna och tillämpar dem på båda vyerna, så de aldrig
 * kan glida isär.
 */
export function buildAggregateStandings(
  series: AggregateSeries | null,
): AggregateLeaderboardData {
  if (!series || series.games.length === 0) {
    return { gamesPlayed: 0, standings: [] };
  }
  const byId = new Map<string, AggregateStanding>();
  // Kronologisk ordning — sista spelet bär de färskaste namnen/avatarerna
  // och står sist i "Last 5".
  series.games.forEach((game) => {
    game.players.forEach((p) => {
      const prev = byId.get(p.playerId);
      const playedRounds = (prev?.playedRounds ?? 0) + p.playedRounds;
      const totalSeconds =
        (prev ? prev.avgResponseSeconds * prev.playedRounds : 0) +
        p.totalResponseSeconds;
      byId.set(p.playerId, {
        playerId: p.playerId,
        // Namn/avatar/meta tas alltid från det SENASTE spelet spelaren
        // deltog i — host kan ha döpt om dem mellan omgångarna.
        name: p.name,
        emoji: p.emoji,
        assistance: p.assistance ?? prev?.assistance,
        age: p.age ?? prev?.age,
        points: (prev?.points ?? 0) + p.points,
        playedRounds,
        correctAnswers: (prev?.correctAnswers ?? 0) + p.correctAnswers,
        avgResponseSeconds: playedRounds > 0 ? totalSeconds / playedRounds : 0,
        lastResponseSeconds: p.lastResponseSeconds ?? prev?.lastResponseSeconds ?? null,
        lastFiveResults: [...(prev?.lastFiveResults ?? []), ...p.results].slice(-5),
      });
    });
  });
  return { gamesPlayed: series.games.length, standings: [...byId.values()] };
}

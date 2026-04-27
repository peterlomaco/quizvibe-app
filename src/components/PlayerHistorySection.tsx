import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { Colors, FontSize, FontWeight, Radius, Spacing, Typography } from '../theme';

// ─── Types & labels ───────────────────────────────────────────────────────────

type Skill  = 'easy' | 'intermediate' | 'expert';
type Region = 'sweden' | 'nordics' | 'global';

interface GameResult {
  id: string;
  date: Date;
  score: number;
  skill: Skill;
  region: Region;
  age: number;
  hcpAfter: number;
}

const SKILL_LABELS:  Record<Skill,  string> = { easy: 'Easy',   intermediate: 'Intermediate', expert: 'Advanced' };
const REGION_LABELS: Record<Region, string> = { sweden: 'Sweden', nordics: 'Nordics', global: 'Global' };

// ─── Mock game history ────────────────────────────────────────────────────────
// TODO (backend, Fas 5/6): Ersätt mockdatan med riktig spelhistorik från
// AsyncStorage eller backend. Just nu visas scaffolding för UI:et.

const MOCK_GAMES: GameResult[] = [
  { id: 'g01', date: new Date(2026, 1, 25), score: 1120, skill: 'easy',         region: 'sweden',  age: 45, hcpAfter: 96 },
  { id: 'g02', date: new Date(2026, 2, 1),  score: 1380, skill: 'easy',         region: 'sweden',  age: 45, hcpAfter: 93 },
  { id: 'g03', date: new Date(2026, 2, 4),  score: 1540, skill: 'intermediate', region: 'sweden',  age: 45, hcpAfter: 91 },
  { id: 'g04', date: new Date(2026, 2, 8),  score: 1810, skill: 'intermediate', region: 'nordics', age: 45, hcpAfter: 88 },
  { id: 'g05', date: new Date(2026, 2, 10), score: 720,  skill: 'intermediate', region: 'sweden',  age: 45, hcpAfter: 90 },
  { id: 'g06', date: new Date(2026, 2, 14), score: 2010, skill: 'intermediate', region: 'sweden',  age: 45, hcpAfter: 86 },
  { id: 'g07', date: new Date(2026, 2, 18), score: 1950, skill: 'intermediate', region: 'sweden',  age: 45, hcpAfter: 83 },
  { id: 'g08', date: new Date(2026, 2, 22), score: 2180, skill: 'intermediate', region: 'nordics', age: 45, hcpAfter: 80 },
  { id: 'g09', date: new Date(2026, 2, 26), score: 2340, skill: 'intermediate', region: 'sweden',  age: 45, hcpAfter: 75 },
  { id: 'g10', date: new Date(2026, 2, 30), score: 2090, skill: 'intermediate', region: 'sweden',  age: 45, hcpAfter: 71 },
  { id: 'g11', date: new Date(2026, 3, 3),  score: 2450, skill: 'intermediate', region: 'sweden',  age: 45, hcpAfter: 68 },
  { id: 'g12', date: new Date(2026, 3, 7),  score: 2620, skill: 'expert',       region: 'global',  age: 45, hcpAfter: 67 },
  { id: 'g13', date: new Date(2026, 3, 10), score: 1480, skill: 'expert',       region: 'sweden',  age: 45, hcpAfter: 69 },
  { id: 'g14', date: new Date(2026, 3, 14), score: 2780, skill: 'intermediate', region: 'sweden',  age: 45, hcpAfter: 62 },
  { id: 'g15', date: new Date(2026, 3, 18), score: 2510, skill: 'expert',       region: 'nordics', age: 45, hcpAfter: 58 },
  { id: 'g16', date: new Date(2026, 3, 22), score: 2690, skill: 'expert',       region: 'sweden',  age: 45, hcpAfter: 54 },
];

// Placering (mock)
const MOCK_RANKINGS = [
  { label: 'Age 45–54', rank: 142     },
  { label: 'Sweden',    rank: 2840    },
  { label: 'Nordics',   rank: 15432   },
  { label: 'Global',    rank: 108204  },
];

// Rank progression mock — varje kategori har en historik (äldst → nyast).
// Lägre rank = bättre, så ett nedåtgående trend-spår betyder förbättring.
// TODO (backend): byt mot riktig progression-data när rank-historik sparas.
const MOCK_RANK_PROGRESSION: { label: string; history: number[] }[] = [
  { label: 'Age 45–54', history: [205, 198, 180, 175, 165, 150, 144, 142] },
  { label: 'Sweden',    history: [3200, 3120, 3050, 2980, 2920, 2895, 2860, 2840] },
  { label: 'Nordics',   history: [16800, 16500, 16200, 15950, 15780, 15600, 15500, 15432] },
  { label: 'Global',    history: [120000, 117500, 115000, 113200, 111000, 109500, 108800, 108204] },
];

// ─── Main component ───────────────────────────────────────────────────────────

export function PlayerHistorySection() {
  const byNewestFirst = [...MOCK_GAMES].sort((a, b) => b.date.getTime() - a.date.getTime());
  const byHighestScore = [...MOCK_GAMES].sort((a, b) => b.score - a.score);

  const totalGames   = MOCK_GAMES.length;
  const bestScore    = byHighestScore[0]?.score ?? 0;
  const currentHcp   = byNewestFirst[0]?.hcpAfter ?? 99;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Player history</Text>

      <StatsOverview gamesPlayed={totalGames} bestScore={bestScore} currentHcp={currentHcp} />

      <HCPProgressionCard games={MOCK_GAMES} />

      <ActivityCard games={MOCK_GAMES} />

      <GameListCard title="Recent games"   games={byNewestFirst.slice(0, 5)} />

      <GameListCard title="Highest scores" games={byHighestScore.slice(0, 3)} highlight />

      <RankProgressionCard progressions={MOCK_RANK_PROGRESSION} />

      <RankingsCard rankings={MOCK_RANKINGS} />
    </View>
  );
}

// ─── Stats overview ───────────────────────────────────────────────────────────

function StatsOverview({
  gamesPlayed, bestScore, currentHcp,
}: { gamesPlayed: number; bestScore: number; currentHcp: number }) {
  return (
    <View style={styles.card}>
      <View style={styles.statsRow}>
        <Stat label="Games played" value={String(gamesPlayed)} />
        <View style={styles.statDivider} />
        <Stat label="Best score"   value={bestScore.toLocaleString()} />
        <View style={styles.statDivider} />
        <Stat label="Current HCP"  value={String(currentHcp)} />
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── HCP progression (line graph) ─────────────────────────────────────────────

function HCPProgressionCard({ games }: { games: GameResult[] }) {
  const chronological = [...games].sort((a, b) => a.date.getTime() - b.date.getTime());
  const hcps = chronological.map((g) => g.hcpAfter);

  const W = 300, H = 90, padX = 6, padY = 10;
  const min = Math.min(...hcps);
  const max = Math.max(...hcps);
  const range = max - min || 1;

  const points = hcps.map((hcp, i) => ({
    x: padX + (i / (hcps.length - 1)) * (W - padX * 2),
    // HCP lower = better = higher on graph (inverted y)
    y: padY + ((hcp - min) / range) * (H - padY * 2),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const fillPath = `${linePath} L ${W - padX} ${H} L ${padX} ${H} Z`;
  const latest = points[points.length - 1];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>HCP progression</Text>
        <Text style={styles.cardSubtitle}>
          {max} → {min}
        </Text>
      </View>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <Path d={fillPath} fill="rgba(77,163,255,0.14)" />
        <Path d={linePath} stroke={Colors.primary} strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {latest && (
          <Rect
            x={latest.x - 3}
            y={latest.y - 3}
            width={6}
            height={6}
            rx={3}
            fill={Colors.primary}
          />
        )}
      </Svg>
      <Text style={styles.graphCaption}>
        Lower is better · last {hcps.length} games
      </Text>
    </View>
  );
}

// ─── Activity (bar graph, games per week) ─────────────────────────────────────

function ActivityCard({ games }: { games: GameResult[] }) {
  // Group games into weekly buckets (8 weeks back)
  const WEEKS = 8;
  const now = new Date();
  const buckets = new Array(WEEKS).fill(0);

  games.forEach((g) => {
    const diffMs = now.getTime() - g.date.getTime();
    const weeksAgo = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
    if (weeksAgo < WEEKS) {
      buckets[WEEKS - 1 - weeksAgo] += 1;
    }
  });

  const W = 300, H = 70;
  const barSpacing = 4;
  const barWidth = (W - (WEEKS - 1) * barSpacing) / WEEKS;
  const maxCount = Math.max(...buckets, 1);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Activity</Text>
        <Text style={styles.cardSubtitle}>{games.length} games · 8 weeks</Text>
      </View>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {buckets.map((count, i) => {
          const h = (count / maxCount) * (H - 8);
          return (
            <Rect
              key={i}
              x={i * (barWidth + barSpacing)}
              y={H - h}
              width={barWidth}
              height={h}
              rx={2}
              fill={count > 0 ? Colors.primary : 'rgba(77,163,255,0.2)'}
              opacity={count > 0 ? 0.85 : 1}
            />
          );
        })}
      </Svg>
    </View>
  );
}

// ─── Game list (Recent / Highest) ─────────────────────────────────────────────

function GameListCard({
  title, games, highlight,
}: { title: string; games: GameResult[]; highlight?: boolean }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.gameList}>
        {games.map((g, i) => (
          <React.Fragment key={g.id}>
            <GameRow game={g} rank={highlight ? i + 1 : undefined} />
            {i < games.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

function GameRow({ game, rank }: { game: GameResult; rank?: number }) {
  return (
    <View style={styles.gameRow}>
      {rank !== undefined && (
        <View style={styles.gameRank}>
          <Text style={styles.gameRankText}>{rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}</Text>
        </View>
      )}
      <View style={{ flex: 1, gap: 2 }}>
        <View style={styles.gameTopRow}>
          <Text style={styles.gameScore}>{game.score.toLocaleString()}</Text>
          <Text style={styles.gameDate}>{formatDate(game.date)}</Text>
        </View>
        <Text style={styles.gameMeta}>
          {SKILL_LABELS[game.skill]} · {REGION_LABELS[game.region]} · Age {game.age}
        </Text>
      </View>
    </View>
  );
}

// ─── Rank progression (sparkline per kategori) ────────────────────────────────

function RankProgressionCard({
  progressions,
}: { progressions: typeof MOCK_RANK_PROGRESSION }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Rank progression</Text>
        <Text style={styles.cardSubtitle}>Lower is better</Text>
      </View>
      <View style={styles.rankProgressionList}>
        {progressions.map((p, i) => (
          <React.Fragment key={p.label}>
            <RankProgressionRow label={p.label} history={p.history} />
            {i < progressions.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

function RankProgressionRow({ label, history }: { label: string; history: number[] }) {
  const current = history[history.length - 1];
  const start = history[0];
  // Förbättring = lägre rank, alltså positivt delta-värde (start - current).
  const improvement = start - current;
  const isImproving = improvement > 0;

  // Sparkline-mått
  const W = 90, H = 28, padY = 3;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;

  const points = history.map((rank, i) => ({
    x: (i / (history.length - 1)) * W,
    // Lägre rank = bättre = HÖGRE på grafen (inverterad y, samma som HCP-grafen)
    y: padY + ((rank - min) / range) * (H - padY * 2),
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const trendColor = isImproving ? Colors.success : Colors.error;

  return (
    <View style={styles.rankProgressionRow}>
      <View style={styles.rankProgressionLeft}>
        <Text style={styles.rankProgressionLabel}>{label}</Text>
        <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <Path
            d={linePath}
            stroke={trendColor}
            strokeWidth="1.5"
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </Svg>
      </View>
      <View style={styles.rankProgressionRight}>
        <Text style={styles.rankValue}>#{current.toLocaleString()}</Text>
        <Text style={[styles.rankProgressionDelta, { color: trendColor }]}>
          {isImproving ? '↑' : '↓'} {Math.abs(improvement).toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

// ─── Rankings ─────────────────────────────────────────────────────────────────

function RankingsCard({ rankings }: { rankings: typeof MOCK_RANKINGS }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Rankings</Text>
      <View style={styles.rankList}>
        {rankings.map((r, i) => (
          <React.Fragment key={r.label}>
            <View style={styles.rankRow}>
              <Text style={styles.rankLabel}>{r.label}</Text>
              <Text style={styles.rankValue}>#{r.rank.toLocaleString()}</Text>
            </View>
            {i < rankings.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  const month = date.toLocaleString('en', { month: 'short' });
  return `${date.getDate()} ${month}`;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { gap: Spacing.md },

  sectionTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.sm,
  },

  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },

  // Stats overview
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.separator,
  },

  // Graph
  graphCaption: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },

  // Game list
  gameList: { gap: 0 },
  divider: {
    height: 1,
    backgroundColor: Colors.separator,
    marginVertical: Spacing.sm,
  },
  gameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  gameRank: {
    width: 32,
    alignItems: 'center',
  },
  gameRankText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  gameTopRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  gameScore: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
  },
  gameDate: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  gameMeta: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },

  // Rankings
  rankList: { gap: 0 },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  rankLabel: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  rankValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
  },

  // Rank progression
  rankProgressionList: { gap: 0 },
  rankProgressionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  rankProgressionLeft: {
    flex: 1,
    gap: 4,
  },
  rankProgressionLabel: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  rankProgressionRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  rankProgressionDelta: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    fontVariant: ['tabular-nums'],
  },
});

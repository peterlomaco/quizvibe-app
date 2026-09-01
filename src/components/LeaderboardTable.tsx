import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import type { AssistanceLevel } from './RoundLeaderboard';
import { Avatar } from './Avatar';
import { WifiOffIcon } from './WifiOffIcon';

// Höjd på den utfällda per-kategori-sköld-raden (Total/Music/Film/Sport med
// förändrings-badge). Samma värde i ALLA tre kolumnerna (spacer) så rader
// ligger i linje.
// Rad-höjd för spelar-raderna. Något högre än rubrikraden så långa PlayerNames
// får plats på två rader (stats-kolumnerna hamnar då lägre/under namnet).
const ROW_H = 74;
const HEADER_H = 56;

// Per-kategori-HCP-förändring efter spelet: nytt värde + delta (after − before).
export interface HcpDelta {
  after: number;
  delta: number;
}
export interface HcpCategoryChange {
  total: HcpDelta;
  music: HcpDelta;
  film: HcpDelta;
  sport: HcpDelta;
}

/**
 * Sport-tabellen som visar en leaderboard (Player | Q ✓ ✗ 📶 AVG LAST Last5 | PTS).
 *
 * Utbruten ur RoundLeaderboard 2026-08-25 så att TRE vyer kan dela EXAKT
 * samma rendering och sortering:
 *   • Final Leaderboard — spelet som just spelats
 *   • Aggregate-sidan   — hela serien sammanslagen
 *   • Profile           — en sparad Aggregate Leaderboard/Score
 *
 * "Utifrån samma kriterier som Final Leaderboard" är hela poängen med
 * aggregatet, så sorteringen får bara finnas på ETT ställe (finalizeRows).
 * Bygg aldrig en parallell tabell.
 */

const ASSISTANCE_LABEL: Record<AssistanceLevel, string> = {
  minimal: 'Minimal',
  standard: 'Standard',
  full: 'Full',
};


// ─── Tabellen (delas av Final- och Aggregate-vyn) ─────────────────────────────

/**
 * En färdig tabellrad. Byggs antingen ur `allRoundScoresHistory` (spelet som
 * just spelats) eller ur seriens sammanslagna standings — och renderas sedan
 * av EXAKT samma komponent, så de två vyerna aldrig kan glida isär.
 */
export interface LeaderboardRow {
  playerId: string;
  name: string;
  emoji: string;
  avatarUri?: string;
  age?: number;
  assistance?: AssistanceLevel;
  points: number;
  playedRounds: number;
  correctAnswers: number;
  incorrectAnswers: number;
  avgResponseSeconds: number;
  lastResponseSeconds: number | null;
  lastFiveResults: boolean[];
  hasLeft: boolean;
  connectionErrors: number;
}

/**
 * Wifi-kolumn + sortering. Gemensam för båda vyerna — "samma kriterier som
 * Final Leaderboard" är hela poängen med Aggregate-vyn.
 *
 * connectionErrors = antal frågor spelaren missat jämfört med den som spelat
 * flest. Om A spelat 3 och B spelat 2 → B får 1 i wifi-kolumnen. Gäller bara
 * när trackConnectionErrors är satt — se prop-kommentaren.
 */
export function finalizeRows(
  rows: Omit<LeaderboardRow, 'connectionErrors'>[],
  trackConnectionErrors: boolean,
): LeaderboardRow[] {
  const maxRounds = rows.reduce((m, e) => Math.max(m, e.playedRounds), 0);
  return rows
    .map((e) => ({
      ...e,
      connectionErrors: trackConnectionErrors
        ? Math.max(0, maxRounds - e.playedRounds)
        : 0,
    }))
    .sort((a, b) => {
      // 0. Den som lämnade MITT i spelet hamnar sist, oavsett poäng.
      //    De slutade svara, så deras delsumma är ingen giltig placering —
      //    utan den här regeln kunde någon som gick efter två rätta svar
      //    vinna över en som spelade hela matchen och svarade fel på allt.
      //    (`hasLeft` sätts bara för avhopp under pågående spel; se
      //    `leftDuringGameIds` i quiz.tsx. Aggregatvyn sätter alltid false.)
      if (a.hasLeft !== b.hasLeft) return a.hasLeft ? 1 : -1;
      // 1. Pts desc — flest poäng vinner
      if (b.points !== a.points) return b.points - a.points;
      // 2. Spelare med 0 spelade ronder får avgResponseSeconds=0 vilket
      //    annars skulle leapfrogga ALLA spelare med faktisk data (0 < deras
      //    avg). Garantera att tom-data alltid sorteras sist.
      if (a.playedRounds === 0 && b.playedRounds > 0) return 1;
      if (b.playedRounds === 0 && a.playedRounds > 0) return -1;
      // 3. Avg response time asc — snabbare avg vinner vid pts-tie. Spelare
      //    som timeoutat alla frågor har avg=max-tiden; en spelare som hann
      //    svara (även fel) har lägre avg och ska därför ranka högre.
      return a.avgResponseSeconds - b.avgResponseSeconds;
    });
}

export function LeaderboardTable({
  entries,
  hcpChanges,
  hcpCategoryChanges,
}: {
  entries: LeaderboardRow[];
  // §5 — nytt Total-HCP + förändring från matchens start per spelare, t.ex.
  // "HCP 42 (-1)". Visas under assistance/age. Bara rader som finns i mappen
  // får en HCP-rad. Utelämnad (Aggregate-vyn) → ingen HCP-rad.
  hcpChanges?: Record<string, { before: number; after: number }>;
  // §1.3 — per-kategori-HCP-förändring. Spelare som finns här får en "+" i
  // Player-kolumnen som fäller ut en text-uppställning av förändringen
  // (Total/Music/Film/Sport, 0 / -x / +y). Bara spelare vars per-kategori-
  // delta denna enhet räknat (self + PtP-deltagare); IndDev-peers saknar den.
  hcpCategoryChanges?: Record<string, HcpCategoryChange>;
}) {
  // MUSIC-ONLY LAUNCH: kategori-sköld-popupen borttagen (bara inline Total-HCP).
  return (
    <View>
        <View style={styles.lbTable}>
        {/* Vänster fixed kolumn: Position + Namn */}
        <View style={styles.lbLeftCol}>
          <View style={[styles.lbCell, styles.lbHeaderCell, styles.lbLeftCell]}>
            <Text style={styles.lbHeaderText}>Player</Text>
          </View>
          {entries.map((entry, index) => {
            const meta = [
              entry.assistance ? ASSISTANCE_LABEL[entry.assistance] : null,
              typeof entry.age === 'number' ? `Age ${entry.age}` : null,
            ].filter(Boolean).join(' · ');
            // §5 — HCP + förändring (after − before). Negativ = bättre.
            const hcp = hcpChanges?.[entry.playerId];
            const hcpDelta = hcp ? hcp.after - hcp.before : 0;
            return (
              <View key={entry.playerId} style={[styles.lbCell, styles.lbLeftCell]}>
                {/* Avhoppare får ingen placeringssiffra — de deltog inte
                    i hela matchen och rankas därför inte. Texten renderas
                    ändå (tom) så `lbPos`:ens fasta bredd håller kolumnen
                    i linje. Sorteringen lägger dem sist, så `index + 1`
                    förblir korrekt för de spelare som FÅR en siffra. */}
                <Text style={styles.lbPos}>
                  {entry.hasLeft ? '' : index + 1}
                </Text>
                <Avatar uri={entry.avatarUri} emoji={entry.emoji} name={entry.name} size={26} useBrandFallback />
                <View style={styles.lbNameStack}>
                  <Text style={styles.lbName} numberOfLines={2}>
                    {entry.name}
                  </Text>
                  {meta.length > 0 && (
                    <Text style={styles.lbNameMeta} numberOfLines={1}>
                      {meta}
                    </Text>
                  )}
                  {/* MUSIC-ONLY LAUNCH: inline "HCP N (delta)" kvar; "+"-knappen
                      + 4-sköld-popupen (Total/Music/Film/Sport) borttagna. */}
                  {hcp && (
                    <View style={styles.lbHcpLine}>
                      <Text style={styles.lbNameHcp} numberOfLines={1}>
                        HCP {hcp.after}
                        {hcpDelta !== 0 ? ` (${hcpDelta > 0 ? '+' : ''}${hcpDelta})` : ''}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Mitt scroll:bar kolumn — alla detail-celler */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.lbMidScroll}
        >
          <View>
            <View style={[styles.lbMidRow, styles.lbHeaderCell]}>
              <Text style={[styles.lbMidHeader, styles.lbColR]}>Q</Text>
              <Text style={[styles.lbMidHeader, styles.lbColCheck]}>✓</Text>
              <Text style={[styles.lbMidHeader, styles.lbColCheck]}>✗</Text>
              <View style={[styles.lbColConnErr, { alignItems: 'center', justifyContent: 'center' }]}>
                <WifiOffIcon size={17} />
              </View>
              <Text style={[styles.lbMidHeader, styles.lbColTime]}>AVG</Text>
              <Text style={[styles.lbMidHeader, styles.lbColTime]}>LAST</Text>
              <Text style={[styles.lbMidHeader, styles.lbColLast5]}>Last 5</Text>
            </View>
            {entries.map((entry) =>
              entry.hasLeft ? (
                <View
                  key={entry.playerId}
                  style={[styles.lbMidRow, styles.lbHasLeftRow]}
                >
                  <Text style={styles.lbHasLeftText} numberOfLines={1}>
                    Left the game
                  </Text>
                </View>
              ) : (
                <View key={entry.playerId} style={styles.lbMidRow}>
                  <Text style={[styles.lbMidCell, styles.lbColR]}>
                    {entry.playedRounds}
                  </Text>
                  <Text
                    style={[
                      styles.lbMidCell,
                      styles.lbColCheck,
                      styles.lbCorrectText,
                    ]}
                  >
                    {entry.correctAnswers}
                  </Text>
                  <Text
                    style={[
                      styles.lbMidCell,
                      styles.lbColCheck,
                      styles.lbWrongText,
                    ]}
                  >
                    {entry.incorrectAnswers}
                  </Text>
                  <Text style={[styles.lbMidCell, styles.lbColConnErr, entry.connectionErrors > 0 ? styles.lbWrongText : styles.lbConnErrZero]}>
                    {entry.connectionErrors > 0 ? String(entry.connectionErrors) : '—'}
                  </Text>
                  <Text style={[styles.lbMidCell, styles.lbColTime]}>
                    {entry.playedRounds > 0 && entry.avgResponseSeconds > 0
                      ? `${entry.avgResponseSeconds.toFixed(2)}s`
                      : '—'}
                  </Text>
                  <Text style={[styles.lbMidCell, styles.lbColTime]}>
                    {entry.lastResponseSeconds !== null
                      ? `${entry.lastResponseSeconds.toFixed(2)}s`
                      : '—'}
                  </Text>
                  <View style={[styles.lbColLast5, styles.lbLast5Wrap]}>
                    {Array.from({ length: 5 }).map((_, i) => {
                      const offset = entry.lastFiveResults.length - 5 + i;
                      const result =
                        offset >= 0 ? entry.lastFiveResults[offset] : undefined;
                      if (result === undefined) {
                        return <View key={i} style={styles.lbDotEmpty} />;
                      }
                      return (
                        <View
                          key={i}
                          style={[
                            styles.lbDot,
                            result ? styles.lbDotCorrect : styles.lbDotWrong,
                          ]}
                        >
                          <Text style={styles.lbDotGlyph}>
                            {result ? '✓' : '✗'}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ),
            )}
          </View>
        </ScrollView>

        {/* Höger fixed kolumn: PTS */}
        <View style={styles.lbRightCol}>
          <View style={[styles.lbCell, styles.lbHeaderCell, styles.lbRightCell]}>
            <Text style={styles.lbHeaderText}>PTS</Text>
          </View>
          {entries.map((entry) => (
            <View
              key={entry.playerId}
              style={[styles.lbCell, styles.lbRightCell]}
            >
              <Text style={styles.lbPoints}>
                {entry.hasLeft ? '—' : entry.points}
              </Text>
            </View>
          ))}
        </View>
      </View>
      {/* MUSIC-ONLY LAUNCH: per-kategori-HCP-popupen (Total/Music/Film/Sport)
          borttagen — inline "HCP N (delta)" i Player-kolumnen räcker. */}
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Sport-tabell-layout (speglar GetReadyIntro:s leaderboard) ──────────
  lbTable: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  lbCell: {
    height: ROW_H,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lbHeaderCell: {
    height: HEADER_H,
    backgroundColor: Colors.cardElevated,
  },
  lbHeaderText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  // Bredare än tidigare (180 → 220) så meta-raden ("Standard · Age 32") får
  // plats på en rad utan att truncatas till bara "Age...". Tar utrymme från
  // mid-scroll-kolumnen som redan scrollar horisontellt vid behov.
  lbLeftCol: {
    minWidth: 170,
    maxWidth: 220,
  },
  lbLeftCell: {
    paddingLeft: Spacing.sm,
    paddingRight: 4,
    gap: 4,
  },
  lbPos: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
    width: 16,
  },
  // Stack:ar namn ovanpå meta-rad (assistance + ålder) under sig så namnet
  // står i top-anchored position mens metadata sitter i textSecondary under.
  lbNameStack: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
  },
  lbName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  lbNameMeta: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    letterSpacing: 0,
  },
  // §5 — HCP-raden i Player-kolumnen ("HCP 42 (-1)"). Blå + halvfet så den
  // sticker ut lite mer än den grå meta-raden ovanför.
  lbNameHcp: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    letterSpacing: 0,
  },
  // HCP-text + "+"-knapp på SAMMA rad, under playername/meta.
  lbHcpLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  // "+"/"−"-knapp i Player-cellen som fäller ut kategori-sköldarna.
  lbHcpExpandBtn: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardElevated,
    marginLeft: 2,
  },
  lbHcpExpandText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textSecondary,
    lineHeight: 15,
  },
  // Popup med den utfällda spelarens kategori-sköldar (Total/Music/Film/Sport).
  lbHcpModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  lbHcpModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.warning,
    borderRadius: Radius.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.lg,
    alignItems: 'center',
  },
  lbHcpModalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    alignSelf: 'stretch',
  },
  // Namn på rad 1, "HCP Progression" på rad 2.
  lbHcpModalTitleStack: {
    flexShrink: 1,
    flexDirection: 'column',
  },
  lbHcpModalName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  lbHcpModalSub: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  lbHcpModalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
  },
  lbHcpModalClose: {
    marginTop: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.cardElevated,
  },
  lbHcpModalCloseText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  lbMidScroll: {
    flex: 1,
  },
  lbMidRow: {
    height: ROW_H,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lbMidCell: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  lbMidHeader: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  // Q + ✓ + ✗ komprimerade till 22 px vardera (var 32) så AVG-kolumnen
  // ryms inom initial mid-scroll-vyn utan horisontell scroll. Synkat
  // med GetReadyIntro:s lb-tabell — håll dem identiska.
  lbColR: { width: 22 },
  lbColCheck: { width: 22 },
  lbColTime: { width: 60 },
  lbColLast5: { width: 96 },
  lbColConnErr: { width: 36 },
  lbConnErrZero: { color: Colors.textSecondary },
  lbCorrectText: { color: Colors.success, fontWeight: FontWeight.semibold },
  lbWrongText: { color: Colors.error, fontWeight: FontWeight.semibold },
  // "Has left the game"-rad ersätter Q/✓/✗/AVG/LAST/Last-5 för spelare som
  // gjort Leave Game. Spänner mid-row-bredden istället för att fördela
  // cellerna; PTS-kolumnen visar streck i samma rad.
  lbHasLeftRow: {
    paddingHorizontal: Spacing.sm,
    justifyContent: 'flex-start',
  },
  lbHasLeftText: {
    fontSize: FontSize.sm,
    fontStyle: 'italic',
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  lbLast5Wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    paddingHorizontal: 4,
  },
  lbDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lbDotCorrect: { backgroundColor: Colors.success },
  lbDotWrong: { backgroundColor: Colors.error },
  lbDotEmpty: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.border,
    opacity: 0.4,
  },
  lbDotGlyph: {
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 12,
  },
  lbRightCol: {
    minWidth: 56,
  },
  lbRightCell: {
    paddingHorizontal: Spacing.md,
    justifyContent: 'flex-end',
  },
  lbPoints: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },
});

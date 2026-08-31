// Remote 1v1 — duellstatus/resultat-panel.
//
// Visas som egen sektion UNDER Final Leaderboard i quiz.tsx när ett
// Remote 1v1-spel avslutats (spelaren ser sitt eget resultat överst,
// motståndar-statusen därunder), och i 1vs1 Matches-resultatvyn på
// Home. Hämtar matchen +
// prenumererar på Realtime-UPDATE:s så "Waiting for opponent" flippar
// till W/L/D-banner live när motståndaren spelar klart (finalize-RPC:n
// uppdaterar remote_matches → postgres_changes → refetch).
//
// All vinnarberäkning sker server-side — panelen läser bara
// match.result/winner_user_id och renderar.

import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '../theme';
import {
  formatPlayerLabel,
  getMatch,
  getOwnUserId,
  splitMatchForUser,
  type MyRemoteMatch,
} from '../utils/remoteMatches';
import { subscribeToMatch } from '../utils/remoteMatches';
import { SequentialDots } from './SequentialDots';

interface Props {
  matchId: string;
}

/** Timmar kvar till deadline, golvat till 0. */
function hoursLeft(deadlineAt: string): number {
  return Math.max(0, Math.ceil((new Date(deadlineAt).getTime() - Date.now()) / 3_600_000));
}

export function RemoteMatchResultPanel({ matchId }: Props) {
  const [my, setMy] = useState<MyRemoteMatch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [match, userId] = await Promise.all([getMatch(matchId), getOwnUserId()]);
      if (cancelled) return;
      setMy(match && userId ? splitMatchForUser(match, userId) : null);
      setLoading(false);
    };
    void load();
    const unsubscribe = subscribeToMatch(matchId, () => { void load(); });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [matchId]);

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.waitRow}>
          <Text style={styles.waitText}>Loading match</Text>
          <SequentialDots color={Colors.textSecondary} />
        </View>
      </View>
    );
  }
  if (!my) return null;

  const { match, me, opponent } = my;
  // Guest alias → "GuestA-1234567 (Anna-42)" så det syns vilket konto som
  // ligger bakom namnet (delad helper med My Matches-listan).
  const oppName = formatPlayerLabel(opponent);

  // Pågående: motståndaren har inte spelat klart ännu.
  if (match.status === 'active') {
    const opponentDone = opponent?.finishedAt != null;
    return (
      <View style={styles.card}>
        {opponentDone ? (
          // Motståndaren klar men jag inte finaliserad än (transient) —
          // realtime-refetchen flippar till resultat-läget strax.
          <View style={styles.waitRow}>
            <Text style={styles.waitText}>Finalizing result</Text>
            <SequentialDots color={Colors.textSecondary} />
          </View>
        ) : (
          <>
            <View style={styles.waitRow}>
              <Text style={styles.waitText}>Waiting for Player: {oppName} to play</Text>
              <SequentialDots color={Colors.warning} />
            </View>
            <Text style={styles.subText}>
              {hoursLeft(match.deadlineAt)}h left — check &quot;H2H Matches&quot; on the Home screen later.
            </Text>
          </>
        )}
      </View>
    );
  }

  // En spelare tryckte "Quit match" — motståndaren vinner på walkover.
  // Egen branch före den generiska walkover-texten så copyn kan säga
  // "opponent quit" istället för det tvetydiga "walkover" (som annars
  // också betyder "tiden gick ut").
  if (match.status === 'forfeited') {
    const iWon = match.winnerUserId === me.userId;
    return (
      <View style={[styles.card, iWon ? styles.cardWin : styles.cardLose]}>
        <Text style={[styles.banner, iWon ? styles.bannerWin : styles.bannerLose]}>
          {iWon ? 'You won — walkover' : 'You lost — you quit the match'}
        </Text>
      </View>
    );
  }

  // Host avbröt matchen (äldre cancel-väg) — inget resultat, bara kvittot.
  if (match.status === 'cancelled') {
    return (
      <View style={[styles.card, styles.cardNeutral]}>
        <Text style={styles.neutralBanner}>Lobby deleted by Host</Text>
      </View>
    );
  }

  // Avgjord (finished / expired_walkover / void).
  if (match.result === 'void') {
    return (
      <View style={[styles.card, styles.cardNeutral]}>
        <Text style={styles.neutralBanner}>Match void — neither player finished in time</Text>
      </View>
    );
  }

  const iWon = match.winnerUserId === me.userId;
  const isDraw = match.result === 'draw';
  const isWalkover = match.result === 'walkover';
  // Enbart utfallet — poäng och rätt/fel läses av i leaderboard-tabellen
  // ovanför, så boxen upprepar dem inte.
  const bannerText = isDraw
    ? "It's a draw!"
    : iWon
      ? isWalkover
        ? 'You won — walkover'
        : 'You won'
      : isWalkover
        ? 'You lost — walkover'
        : 'You lost';

  return (
    <View style={[styles.card, isDraw ? styles.cardNeutral : iWon ? styles.cardWin : styles.cardLose]}>
      <Text
        style={[
          styles.banner,
          isDraw ? styles.bannerNeutral : iWon ? styles.bannerWin : styles.bannerLose,
        ]}
      >
        {bannerText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.primaryBorder,
    backgroundColor: Colors.cardElevated,
    gap: Spacing.xs,
  },
  cardWin: { borderColor: Colors.success },
  cardLose: { borderColor: Colors.error },
  cardNeutral: { borderColor: Colors.borderStrong },
  waitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  waitText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  banner: {
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  bannerWin: { color: Colors.success },
  bannerLose: { color: Colors.error },
  bannerNeutral: { color: Colors.textPrimary },
  neutralBanner: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  subText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});

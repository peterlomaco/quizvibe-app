// 1vs1 Matches — egen skärm som listar användarens Remote 1v1-dueller.
//
// Nås via huvudknappen "1vs1 Matches" på Home (MyMatchesSection — knappen
// navigerar hit istället för att fälla ut listan inline, Peter 2026-08-07).
// Radstatusar:
//   • "Your turn"             — jag har frågor kvar (tap → spela/återuppta)
//   • "Waiting for opponent"  — jag är klar, motståndaren spelar inom 48h
//   • "You won/lost/Draw"     — avgjord (tap → resultat-modal)
//   • "Lobby deleted by Host" — host avbröt matchen (Quit Game)
//   • "Void"                  — ingen spelade före deadline
//
// Gäster (anon-session): ser aktiva + host-avbrutna matcher — avgjorda
// resultat döljs (ingen historik-kravet; server-cron städar guest-only).
//
// Live-uppdatering via subscribeToMyMatches + refetch vid screen-focus.
// Back-knappen går alltid till Home (skärmen nås bara därifrån).

import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { TopUserBanner } from '../components/TopUserBanner';
import { BOTTOM_BANNER_HEIGHT } from '../components/BottomBanner';
import { RemoteMatchResultPanel } from '../components/RemoteMatchResultPanel';
import { Colors, FontSize, Radius, Spacing } from '../theme';
import { supabase } from '../utils/supabase';
import {
  buildRemoteQuizParams,
  getMyMatches,
  subscribeToMyMatches,
  type MyRemoteMatch,
} from '../utils/remoteMatches';

function hoursLeft(deadlineAt: string): number {
  return Math.max(0, Math.ceil((new Date(deadlineAt).getTime() - Date.now()) / 3_600_000));
}

export default function MyMatchesScreen() {
  const [matches, setMatches] = useState<MyRemoteMatch[]>([]);
  const [isGuestSession, setIsGuestSession] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [resultMatchId, setResultMatchId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const [{ data: sessionData }, mine] = await Promise.all([
      supabase.auth.getSession(),
      getMyMatches(),
    ]);
    const anon = !!(sessionData.session?.user as { is_anonymous?: boolean } | undefined)
      ?.is_anonymous;
    setIsGuestSession(anon);
    setMatches(mine);
    setLoaded(true);
  }, []);

  // Refetch vid varje focus (spelaren kan komma tillbaka från quiz).
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  // Realtime: motståndaren blir klar / deadline-sweep avgör → listan flippar.
  useEffect(() => {
    const unsubscribe = subscribeToMyMatches(() => { void reload(); });
    return unsubscribe;
  }, [reload]);

  // Gäster: aktiva + host-avbrutna ("Lobby deleted by Host"-kvittot ska
  // synas även för guest-motståndare); avgjorda resultat döljs.
  const visible = isGuestSession
    ? matches.filter((m) => m.match.status === 'active' || m.match.status === 'cancelled')
    : matches;

  return (
    <SafeAreaView style={styles.safe}>
      <TopUserBanner onBackPress={() => router.replace('/')} backLabel="Back" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.screenTitle}>1vs1 Matches</Text>
        <Text style={styles.screenSubtitle}>
          Remote duels — each player answers on their own device within 48 hours.
        </Text>

        {loaded && visible.length === 0 && (
          <Text style={styles.emptyText}>
            No 1vs1 matches yet. Create a game with the Remote (1vs1) mode and
            invite a friend to start your first duel.
          </Text>
        )}

        <View style={styles.list}>
          {visible.map((m) => {
            const { match, me, opponent } = m;
            const oppName = opponent?.playerName ?? 'Opponent';
            const myTurn = match.status === 'active' && me.finishedAt == null;
            const waiting = match.status === 'active' && me.finishedAt != null;

            let statusText: string;
            let statusColor: string = Colors.textSecondary;
            if (myTurn) {
              statusText = `Your turn — ${hoursLeft(match.deadlineAt)}h left`;
              statusColor = Colors.warning;
            } else if (waiting) {
              statusText = `Waiting for ${oppName} — ${hoursLeft(match.deadlineAt)}h left`;
            } else if (match.status === 'cancelled') {
              statusText = 'Lobby deleted by Host';
            } else if (match.result === 'void') {
              statusText = 'Void — no one played';
            } else if (match.result === 'draw') {
              statusText = `Draw ${me.totalPoints}–${opponent?.totalPoints ?? 0}`;
              statusColor = Colors.textPrimary;
            } else if (match.winnerUserId === me.userId) {
              statusText = `You won ${me.totalPoints}–${opponent?.totalPoints ?? 0}${match.result === 'walkover' ? ' (walkover)' : ''}`;
              statusColor = Colors.success;
            } else {
              statusText = `${oppName} won ${opponent?.totalPoints ?? 0}–${me.totalPoints}${match.result === 'walkover' ? ' (walkover)' : ''}`;
              statusColor = Colors.error;
            }

            return (
              <TouchableOpacity
                key={match.id}
                style={[styles.row, myTurn && styles.rowYourTurn]}
                activeOpacity={0.7}
                onPress={() =>
                  myTurn
                    ? router.push({ pathname: '/quiz', params: buildRemoteQuizParams(m) })
                    : setResultMatchId(match.id)
                }
              >
                <View style={styles.rowText}>
                  <Text style={styles.opponentName} numberOfLines={1}>
                    vs {oppName}
                  </Text>
                  <Text style={[styles.statusText, { color: statusColor }]} numberOfLines={1}>
                    {statusText}
                  </Text>
                </View>
                <Text style={[styles.chevron, myTurn && { color: Colors.warning }]}>
                  {myTurn ? '▶' : '›'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Resultat-modal — RemoteMatchResultPanel återanvänds (samma vy som
          quiz-slutskärmens duellpanel, live via Realtime). */}
      <Modal
        visible={resultMatchId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setResultMatchId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {resultMatchId && <RemoteMatchResultPanel matchId={resultMatchId} />}
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setResultMatchId(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.sm,
    // Extra bottom-padding så listans sista rad inte döljs bakom den
    // globala BottomBanner:n (Home/Profile/Store-tabbarna, visas på
    // /my-matches sedan 2026-08-07) — samma konvention som Home/Profile/Store.
    paddingBottom: Spacing.lg + BOTTOM_BANNER_HEIGHT,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  screenSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: Spacing.md,
  },
  list: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  rowYourTurn: {
    borderColor: Colors.warning,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  opponentName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  statusText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  chevron: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    alignSelf: 'stretch',
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  modalCloseBtn: {
    marginHorizontal: Spacing.lg,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});

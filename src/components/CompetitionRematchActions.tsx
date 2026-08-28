// Re-match/Replay-åtgärderna inuti en öppnad Competition Leaderboard
// (SavedAggregatesCard-modalen, ENDAST från Home → /competitions). Speglar
// Final Leaderboards re-match men cross-device och i två faser (migration
// 0041):
//
//   Host (competitionens created_by):
//     • Solo (1 deltagare)      → "Replay" → skapar lobby direkt.
//     • Multi, ingen request    → "Re-match" → createRematchRequest.
//     • Multi, väntar på accepts→ "Waiting for X of Y players to accept" (+Cancel).
//     • Multi, alla accepterat  → "Yes – start re-match" → skapar lobby +
//                                 markerar request:en started (deltagarnas auto-nav).
//   Deltagare (ej host):
//     • Aktiv request, ej accepterad → "Accept re-match".
//     • Aktiv request, accepterad    → "Waiting for host to start".
//     • Request started (room_code)  → auto-navigeras in i lobbyn.
//     • Ingen request                → inget (modalen visar bara Close).

import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import type { SavedAggregate } from '../utils/aggregateLeaderboards';
import { startCompetitionRematch } from '../utils/competitionRematch';
import {
  acceptRematchRequest,
  cancelRematchRequest,
  createRematchRequest,
  getLatestRematchRequest,
  startRematchRequest,
  subscribeToRematchRequests,
  type CompetitionRematchRequest,
} from '../utils/competitionRematchRequests';
import type { LobbyRegion } from '../utils/mockLobbySettings';
import { loadProfile } from '../utils/profileStorage';
import { getOwnUserId } from '../utils/remoteMatches';
import { hasPremiumSubscription } from '../utils/subscriptionStorage';
import { SequentialDots } from './SequentialDots';

export function CompetitionRematchActions({
  saved,
  onClose,
}: {
  saved: SavedAggregate;
  onClose: () => void;
}) {
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [request, setRequest] = useState<CompetitionRematchRequest | null>(null);
  const [busy, setBusy] = useState(false);
  const [, forceTick] = useState(0);
  const navigatedRef = useRef(false);

  const isSolo = saved.participants.length <= 1;
  const opponentCount = Math.max(0, saved.participants.length - 1);

  const reload = useCallback(async () => {
    const req = await getLatestRematchRequest(saved.id);
    setRequest(req);
  }, [saved.id]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const uid = await getOwnUserId();
      if (!cancelled) setMyUserId(uid);
      const req = await getLatestRematchRequest(saved.id);
      if (!cancelled) setRequest(req);
    })();
    const unsub = subscribeToRematchRequests(() => {
      void reload();
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [saved.id, reload]);

  const isHost = !!myUserId && saved.createdBy === myUserId;
  const now = Date.now();
  const activeRequest =
    request &&
    request.status === 'active' &&
    new Date(request.expiresAt).getTime() > now
      ? request
      : null;
  const startedRequest =
    request && request.status === 'started' && request.roomCode ? request : null;

  // Re-render när den aktiva request:en löper ut så host:s knapp återgår till
  // "Re-match" (läsning filtrerar på expiry, men inget event fyrar av sig
  // själv vid utgången).
  const activeExpiresAt = activeRequest?.expiresAt;
  useEffect(() => {
    if (!activeExpiresAt) return;
    const ms = new Date(activeExpiresAt).getTime() - Date.now();
    if (ms <= 0) return;
    const t = setTimeout(() => forceTick((n) => n + 1), ms + 500);
    return () => clearTimeout(t);
  }, [activeExpiresAt]);

  // Host räknas aldrig som "accepterat" (RPC:n blockar det), men filtrera bort
  // host:s uid defensivt så X/Y aldrig blir fel.
  const acceptedCount = activeRequest
    ? activeRequest.acceptedUserIds.filter((id) => id !== saved.createdBy).length
    : 0;
  const iAccepted = !!(
    myUserId && activeRequest?.acceptedUserIds.includes(myUserId)
  );
  const allAccepted = acceptedCount >= opponentCount;

  // Deltagare auto-navigeras in i lobbyn när host startat (fallback: en
  // waiting_invite på Home fångar den som inte har modalen öppen).
  useEffect(() => {
    if (isHost || !startedRequest?.roomCode || navigatedRef.current) return;
    navigatedRef.current = true;
    onClose();
    router.push({
      pathname: '/lobby',
      params: { code: startedRequest.roomCode, isHost: 'false' },
    });
  }, [isHost, startedRequest, onClose]);

  // ── Credit-gate + lobby-skapande (host) ──
  const ensureCredits = useCallback(async () => {
    const [profile, hasPremium] = await Promise.all([
      loadProfile(),
      hasPremiumSubscription(),
    ]);
    if (!hasPremium && (profile?.freeGameCredits ?? 0) === 0) {
      Alert.alert(
        'Out of Host Game Credits',
        'You have used your free host games for today. Wait for the daily refresh at midnight CET, or upgrade to QuizVibe Premium for unlimited host games.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Go to Store',
            onPress: () =>
              router.push('/store?focus=subscription&from=/competitions'),
          },
        ],
      );
      return null;
    }
    return { profile, hasPremium };
  }, []);

  const createLobbyAndGo = useCallback(
    async (requestId?: string) => {
      const gate = await ensureCredits();
      if (!gate) return;
      const { profile, hasPremium } = gate;
      const hostUserId = await getOwnUserId();
      const region: LobbyRegion =
        profile?.region === 'sweden'
          ? 'Sweden'
          : profile?.region === 'nordics'
            ? 'Nordics'
            : 'Global';
      const result = await startCompetitionRematch({
        saved,
        hostUserId,
        hostPlayerName: profile?.playerName ?? '',
        hostAvatarId: profile?.selectedAvatarId,
        hasPremium,
        eraFrom: profile?.gameEraFrom,
        eraTo: profile?.gameEraTo,
        roundsCount: profile?.roundsDefault,
        answerResponseSeconds: profile?.answerResponseSeconds,
        region,
      });
      if (!result.ok || !result.code) {
        Alert.alert(
          'Could not start re-match',
          result.reason === 'identity'
            ? 'We could not match your account to this competition. Try again after signing in.'
            : 'The lobby could not be created. Check your connection and that you are signed in, then try again.',
        );
        return;
      }
      // Markera request:en started så accepterande deltagare auto-navigeras in.
      if (requestId) await startRematchRequest(requestId, result.code);
      onClose();
      router.push({
        pathname: '/lobby',
        params: {
          code: result.code,
          isHost: 'true',
          lobbyType: result.lobbyType ?? 'multiplayer',
          ...(result.isMulti
            ? { rematchLocked: 'true', competitionRematch: 'true' }
            : {}),
        },
      });
    },
    [ensureCredits, onClose, saved],
  );

  // ── Handlers ──
  const runBusy = useCallback(async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  }, []);

  const handleInitiate = () =>
    runBusy(async () => {
      // Credit-gate FÖRST — initiera inte om host inte kan starta ändå.
      const gate = await ensureCredits();
      if (!gate) return;
      const id = await createRematchRequest(saved.id);
      if (!id) {
        Alert.alert('Could not start re-match', 'Please try again.');
        return;
      }
      await reload();
    });

  const handleStart = () =>
    runBusy(async () => {
      if (!activeRequest) return;
      await createLobbyAndGo(activeRequest.id);
    });

  const handleReplaySolo = () => runBusy(() => createLobbyAndGo());

  const handleAccept = () =>
    runBusy(async () => {
      if (!activeRequest) return;
      const ok = await acceptRematchRequest(activeRequest.id);
      if (!ok) {
        Alert.alert('Could not accept', 'The re-match may have expired. Try again.');
      }
      await reload();
    });

  const handleCancel = () =>
    runBusy(async () => {
      if (!activeRequest) return;
      await cancelRematchRequest(activeRequest.id);
      await reload();
    });

  // ── Render ──
  // Innan identiteten laddats vet vi inte host vs deltagare — visa inget
  // (modalens Close räcker under den korta stunden).
  if (myUserId === null) return null;

  const goldButton = (label: string, onPress: () => void) => (
    <Pressable
      style={({ pressed }) => [styles.goldBtn, pressed && { opacity: 0.85 }]}
      onPress={onPress}
      disabled={busy}
    >
      {busy ? (
        <ActivityIndicator color="#000000" />
      ) : (
        <Text style={styles.goldBtnText}>{label}</Text>
      )}
    </Pressable>
  );

  const waitingBox = (label: string) => (
    <View style={styles.waitBox}>
      <Text style={styles.waitText} numberOfLines={2}>
        {label}
      </Text>
      <SequentialDots color={Colors.warning} />
    </View>
  );

  if (isHost) {
    if (isSolo) return goldButton('Replay', handleReplaySolo);
    if (!activeRequest) return goldButton('Re-match', handleInitiate);
    if (!allAccepted) {
      return (
        <View style={styles.stack}>
          {waitingBox(
            `Waiting for ${acceptedCount} of ${opponentCount} players to accept`,
          )}
          <Pressable
            onPress={handleCancel}
            disabled={busy}
            style={({ pressed }) => [styles.cancelLink, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.cancelLinkText}>Cancel re-match</Text>
          </Pressable>
        </View>
      );
    }
    return goldButton('Yes – start re-match', handleStart);
  }

  // Deltagare.
  if (!activeRequest) return null;
  if (!iAccepted) return goldButton('Accept re-match', handleAccept);
  return waitingBox('Waiting for host to start');
}

const styles = StyleSheet.create({
  stack: { gap: Spacing.sm },
  goldBtn: {
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: '#000000',
  },
  waitBox: {
    height: 52,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.warning,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    gap: 2,
  },
  waitText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  cancelLinkText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
});

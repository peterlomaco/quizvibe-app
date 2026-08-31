// Competition-ingången på Home — huvudknapp bredvid "1vs1" som öppnar den
// dedikerade /competitions-skärmen (listan av sparade Competition
// Leaderboards, samma som Profile → Player history, men med re-match/replay).
//
// Dyker upp först när användaren är inloggad (icke-anon) OCH har sparat sin
// FÖRSTA competition — annars null. Samma gating-mönster som
// MyMatchesSection (isAnonymousSession + en server-lista), och samma
// self-gating-null.
//
// "Accept re-match"-signal (blinkande guld) — tänds när en re-match väntar på
// MIN accept (host ≠ jag, jag har inte accepterat än, ej utgången). Samma
// visuella språk som 1vs1-knappens "New update". Live via Realtime på
// competition_rematch_requests (migration 0041).
//
// `onVisible` rapporterar upp om knappen faktiskt renderas, så HomeExtrasRow
// kan kollapsa raden när varken Competition eller 1vs1 finns.

import { router, useFocusEffect, usePathname } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from '@/src/components/haptic';

import { Colors, FontSize, Radius, Spacing } from '../theme';
import { TrophyIcon } from './TrophyIcon';
import { isAnonymousSession } from '../utils/auth';
import {
  getCachedHomeRowVisible,
  setCachedHomeRowVisible,
} from '../utils/homeRowVisibility';
import { listMyAggregateLeaderboards } from '../utils/aggregateLeaderboards';
import {
  getPendingAcceptRequestLeaderboardIds,
  subscribeToRematchRequests,
} from '../utils/competitionRematchRequests';

export function CompetitionsButton({
  onVisible,
}: { onVisible?: (v: boolean) => void } = {}) {
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  // Leaderboard-id:na där en re-match väntar på min accept — driver både
  // blink-signalen (längd > 0) och flash-guiden (skickas som focusAggregateIds).
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  // false tills mountens första reload klarat — innan dess litar vi på
  // session-cachen så knappen renderas med rätt höjd direkt vid en re-mount
  // i stället för att pop:a in (se homeRowVisibility.ts).
  const [hydrated, setHydrated] = useState(false);

  const reload = useCallback(async () => {
    // Anon-sessioner har per definition inga sparade competitions.
    if (await isAnonymousSession()) {
      setCount(0);
      setPendingIds([]);
      setHydrated(true);
      return;
    }
    const [saved, pending] = await Promise.all([
      listMyAggregateLeaderboards(),
      getPendingAcceptRequestLeaderboardIds(),
    ]);
    setCount(saved.length);
    setPendingIds(pending);
    setHydrated(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  // Live: en ny/ändrad re-match-request kan tända (eller släcka) signalen.
  useEffect(() => {
    const unsub = subscribeToRematchRequests(() => {
      void reload();
    });
    return unsub;
  }, [reload]);

  const hasUpdate = pendingIds.length > 0;
  const blink = useBlink(hasUpdate);

  const dataVisible = count > 0;
  // Innan mountens första reload klarat: rendera optimistiskt om cachen säger
  // att knappen var synlig senast → ingen pop-in vid re-mount. Efter hydrering
  // gäller riktig data (så en tömd rad kollapsar).
  const visible = dataVisible || (!hydrated && getCachedHomeRowVisible('competitions'));

  useEffect(() => {
    if (hydrated) setCachedHomeRowVisible('competitions', dataVisible);
  }, [hydrated, dataVisible]);

  useEffect(() => {
    onVisible?.(visible);
  }, [visible, onVisible]);

  if (!visible) return null;

  return (
    <TouchableOpacity
      style={styles.btn}
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: '/competitions',
          params: {
            from: pathname || '/',
            // Flash-guide: peka ut exakt de Marathon-rader som väntar på min
            // accept så /competitions kan blinka dem. Utelämnas när inget väntar.
            ...(pendingIds.length > 0
              ? { focusAggregateIds: pendingIds.join(',') }
              : {}),
          },
        })
      }
    >
      {/* Blå pokal + "Competition"-etikett som EN vänsterställd grupp. */}
      <View style={styles.iconGroup}>
        <TrophyIcon height={22} />
        <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
          Marathon
        </Text>
      </View>
      {hasUpdate && (
        <Animated.Text
          style={[styles.acceptLabel, { opacity: blink }]}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {'Accept\nre-match'}
        </Animated.Text>
      )}
      <Animated.Text
        style={[styles.chevron, hasUpdate && { color: Colors.warning, opacity: blink }]}
      >
        ›
      </Animated.Text>
    </TouchableOpacity>
  );
}

/** Blink-loop (samma fade-kurva som MyMatchesSection/Lobby). */
function useBlink(active: boolean, duration = 600): Animated.Value {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!active) {
      opacity.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      opacity.setValue(1);
    };
  }, [active, opacity, duration]);
  return opacity;
}

const styles = StyleSheet.create({
  // Speglar MyMatchesSection:s mainBtn/mainBtnInRow-vokabulär (höjd ~56, vit
  // kant, cardElevated, tight padding) så Competition- och 1vs1-knappen ser ut
  // som ett par. Ingen egen bredd/alignSelf — fyller sin slot i HomeExtrasRow.
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    minHeight: 56,
    borderWidth: 1,
    borderColor: Colors.textPrimary,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardElevated,
    paddingHorizontal: 6,
    paddingVertical: Spacing.sm,
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
    flexShrink: 1,
  },
  // Gold-signal när en re-match väntar på min accept. Tvåradig + centrerad så
  // den ryms i den smala knappen (samma mönster som 1vs1:s "New update").
  acceptLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.warning,
    lineHeight: 13,
    textAlign: 'center',
    flexShrink: 1,
  },
  chevron: {
    fontSize: 22,
    color: Colors.textPrimary,
  },
});

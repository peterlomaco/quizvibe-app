// "1vs1 Matches" — Home-huvudknapp för Remote 1v1-dueller.
//
// EN knapp på Home (Peter 2026-08-07 rev 2): tap → navigerar till den
// dedikerade /my-matches-skärmen där matcherna listas (ingen inline-
// expansion). Knappen visar antal + gold-accent med "Your turn in N
// matches"-subtitel när någon match väntar på spelaren.
//
// Gäster (anon-session): räknar aktiva + host-avbrutna matcher (avgjorda
// resultat är dolda för gäster — ingen historik-kravet). Registrerade
// räknar allt. Renderar null när användaren inte har några matcher alls.
//
// Live-uppdatering av räknaren via subscribeToMyMatches + refetch vid
// varje Home-focus (spelaren kan komma tillbaka från quiz/my-matches).

import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '../theme';
import { supabase } from '../utils/supabase';
import {
  getMyMatches,
  subscribeToMyMatches,
  type MyRemoteMatch,
} from '../utils/remoteMatches';

export function MyMatchesSection() {
  const [matches, setMatches] = useState<MyRemoteMatch[]>([]);
  const [isGuestSession, setIsGuestSession] = useState(false);

  const reload = useCallback(async () => {
    const [{ data: sessionData }, mine] = await Promise.all([
      supabase.auth.getSession(),
      getMyMatches(),
    ]);
    const anon = !!(sessionData.session?.user as { is_anonymous?: boolean } | undefined)
      ?.is_anonymous;
    setIsGuestSession(anon);
    setMatches(mine);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  useEffect(() => {
    const unsubscribe = subscribeToMyMatches(() => { void reload(); });
    return unsubscribe;
  }, [reload]);

  const visible = isGuestSession
    ? matches.filter((m) => m.match.status === 'active' || m.match.status === 'cancelled')
    : matches;
  if (visible.length === 0) return null;

  // "Your turn"-räknaren driver gold-accenten så spelaren ser att en match
  // väntar utan att behöva öppna listan.
  const yourTurnCount = visible.filter(
    (m) => m.match.status === 'active' && m.me.finishedAt == null,
  ).length;

  return (
    <TouchableOpacity
      style={[styles.mainBtn, yourTurnCount > 0 && styles.mainBtnYourTurn]}
      activeOpacity={0.8}
      onPress={() => router.push('/my-matches')}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.mainBtnTitle}>1vs1 Matches</Text>
        <Text
          style={[
            styles.mainBtnSubtitle,
            yourTurnCount > 0 && { color: Colors.warning },
          ]}
          numberOfLines={1}
        >
          {yourTurnCount > 0
            ? `Your turn in ${yourTurnCount} ${yourTurnCount === 1 ? 'match' : 'matches'}`
            : `${visible.length} ${visible.length === 1 ? 'match' : 'matches'}`}
        </Text>
      </View>
      <Text style={[styles.chevron, yourTurnCount > 0 && { color: Colors.warning }]}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Huvudknappen — speglar Home:s gameBtn-vokabulär (höjd ~56, bordered,
  // cardElevated).
  mainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 56,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  // Gold-accent när minst en match väntar på spelarens tur.
  mainBtnYourTurn: {
    borderColor: Colors.warning,
  },
  mainBtnTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  mainBtnSubtitle: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  chevron: {
    fontSize: 24,
    color: Colors.textSecondary,
  },
});

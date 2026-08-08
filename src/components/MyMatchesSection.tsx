// "Remote Play History" — Home-huvudknapp för Remote 1v1-dueller.
//
// EN knapp på Home (Peter 2026-08-07 rev 2): tap → navigerar till den
// dedikerade /my-matches-skärmen där matcherna listas (ingen inline-
// expansion). Knappen är ren titel utan subtitel (rev 3).
//
// "New update"-signal (rev 4): blinkande gold-etikett i knappen så fort
// NÅGON av spelarens 1vs1-matcher ändrat tillstånd sedan hen senast
// öppnade /my-matches — ny match, motståndaren spelade klart, matchen
// avgjordes/avbröts, eller det blev spelarens tur. Implementerat som en
// signatur-jämförelse (id:status:mitt-klar:motståndar-klar:resultat) mot
// ett AsyncStorage-snapshot som skrivs när knappen tappas. Samma visuella
// språk som Lobby:s "New Player joined"/"Players Waiting" (BlinkingLabel).
//
// Gäster (anon-session): räknar aktiva + host-avbrutna matcher (avgjorda
// resultat är dolda för gäster — ingen historik-kravet). Registrerade
// räknar allt. Renderar null när användaren inte har några matcher alls —
// knappen dyker alltså upp först när det finns en duell att visa (Peter
// 2026-08-07; det tidigare `alwaysShow`-läget för inloggade är borttaget).
//
// Live-uppdatering via subscribeToMyMatches + refetch vid varje
// Home-focus (spelaren kan komma tillbaka från quiz/my-matches).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect, usePathname } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '../theme';
import { VersusIcon } from './VersusIcon';
import { supabase } from '../utils/supabase';
import {
  getMyMatches,
  subscribeToMyMatches,
  type MyRemoteMatch,
} from '../utils/remoteMatches';

// Per-user-namespacad nyckel (samma mönster som friends/gameHistory) så
// User A:s "sett"-snapshot inte tystar signalen för User B på samma device.
const SEEN_KEY_PREFIX = '@quizvibe/myMatches/seen/v1/';

/**
 * Signatur över matchernas tillstånd. Ändras så fort något som är
 * intressant för spelaren ändrats: ny/borttagen match, status (active →
 * finished/cancelled/void), vem som spelat klart, eller resultatet.
 */
function buildSignature(list: MyRemoteMatch[]): string {
  return list
    .map(
      (m) =>
        `${m.match.id}:${m.match.status}:${m.me.finishedAt ? 1 : 0}:${
          m.opponent?.finishedAt ? 1 : 0
        }:${m.match.result ?? ''}`,
    )
    .sort()
    .join('|');
}

/**
 * @param full  Bred variant: full bredd med centrerad "Remote Play
 *   History"-titel. Används ENBART av Profile → Player history.
 *
 * DEFAULT är den smala varianten (Peter 2026-08-08): en tredjedel av
 * skärmbredden, högerställd, utan titel-text — bara ikon + "New update" +
 * pil. Defaulten är medvetet den smala: Home har flera render-grenar
 * (inloggad/guest) och en framtida gren som glömmer proppen ska få den
 * smala rutan, inte råka återinföra den breda.
 */
export function MyMatchesSection({ full = false }: { full?: boolean } = {}) {
  const compact = !full;
  // Var knappen renderas ('/' på Home, '/profile' i Player history) —
  // skickas med som `from` så /my-matches Back-knapp går tillbaka hit
  // istället för alltid till Home (samma mönster som Store-skärmen).
  const pathname = usePathname();
  const [matches, setMatches] = useState<MyRemoteMatch[]>([]);
  const [isGuestSession, setIsGuestSession] = useState(false);
  const [seenSignature, setSeenSignature] = useState<string | null>(null);
  const seenKeyRef = useRef<string | null>(null);

  const reload = useCallback(async () => {
    const [{ data: sessionData }, mine] = await Promise.all([
      supabase.auth.getSession(),
      getMyMatches(),
    ]);
    const user = sessionData.session?.user as
      | { id?: string; is_anonymous?: boolean }
      | undefined;
    const anon = !!user?.is_anonymous;
    setIsGuestSession(anon);
    setMatches(mine);

    // Läs "sett"-snapshotten för aktuell user. Saknas user-id kan vi inte
    // namespace:a — då hoppar vi signalen helt (hellre ingen badge än en
    // som läcker mellan konton).
    const key = user?.id ? `${SEEN_KEY_PREFIX}${user.id}` : null;
    seenKeyRef.current = key;
    if (!key) {
      setSeenSignature(null);
      return;
    }
    try {
      setSeenSignature((await AsyncStorage.getItem(key)) ?? '');
    } catch {
      setSeenSignature('');
    }
  }, []);

  const handlePress = useCallback(
    (signature: string) => {
      // Markera allt som sett innan navigation så etiketten är borta när
      // spelaren kommer tillbaka till Home.
      setSeenSignature(signature);
      const key = seenKeyRef.current;
      if (key) void AsyncStorage.setItem(key, signature).catch(() => {});
      router.push({ pathname: '/my-matches', params: { from: pathname || '/' } });
    },
    [pathname],
  );

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

  // Något har hänt sedan spelaren senast öppnade listan → blinkande signal.
  // seenSignature === null = ingen user-id (kan inte namespace:a) → tyst.
  const signature = buildSignature(visible);
  const hasUpdate =
    visible.length > 0 && seenSignature !== null && seenSignature !== signature;

  // Hooks måste köras före den villkorliga return:en nedan.
  const blink = useBlink(hasUpdate);

  if (visible.length === 0) return null;

  return (
    <TouchableOpacity
      style={[styles.mainBtn, compact && styles.mainBtnCompact]}
      activeOpacity={0.8}
      onPress={() => handlePress(signature)}
    >
      {/* Full variant (Profile): titeln är absolut-centrerad i hela knappen
          så den sitter still oavsett om "New update"-etiketten visas eller
          inte (en vanlig flex-cell hade förskjutits när etiketten dyker upp).
          pointerEvents none → taps går vidare till knappen. */}
      {!compact && (
        <View style={styles.titleOverlay} pointerEvents="none">
          <Text style={styles.mainBtnTitle}>Remote Play History</Text>
        </View>
      )}
      {/* Samma 1vs1-märke som Home:s "Remote Play"-val (blå silhuetter +
          guld-wifi emellan) så duell-läget har EN ikon i appen. marginLeft
          skjuter in den från vänsterkanten så den inte klistrar sig mot
          rutans ram — mindre inskjut i compact (Peter 2026-08-08) eftersom
          rutan där bara är en tredjedel bred. */}
      <View style={{ marginLeft: compact ? Spacing.sm : Spacing.md }}>
        <VersusIcon height={compact ? 22 : 30} />
      </View>
      {/* Spacer i full variant → "New update" + pilen grupperas högerställt
          medan titeln ligger kvar centrerad. Compact använder
          justifyContent: space-between istället. */}
      {!compact && <View style={{ flex: 1 }} />}
      {/* Blinkande "New update" + pil i guld — speglar Lobby:s "New Player
          joined"-signal så samma visuella språk används för "något har hänt"
          över skärmarna. Båda delar samma opacity-värde så de blinkar i takt.
          Utan update: ingen etikett, fast vit pil. Etiketten sätts på TVÅ
          rader ("New" / "update") så den tar mindre bredd. */}
      {hasUpdate && (
        <Animated.Text
          style={[styles.newUpdateLabel, compact && styles.newUpdateLabelCompact, { opacity: blink }]}
          numberOfLines={2}
          adjustsFontSizeToFit={compact}
          minimumFontScale={0.75}
        >
          {'New\nupdate'}
        </Animated.Text>
      )}
      <Animated.Text
        style={[
          styles.chevron,
          compact && styles.chevronCompact,
          hasUpdate && { color: Colors.warning, opacity: blink },
        ]}
      >
        ›
      </Animated.Text>
    </TouchableOpacity>
  );
}

/**
 * Blink-loop som ägs av anropande komponent så flera noder kan dela exakt
 * samma opacity (annars driftar separata loopar isär visuellt). Loopen
 * startas/stoppas på `active` och nollställs till 1 när den stängs av —
 * samma fade-kurva som Lobby:s BlinkingLabel.
 */
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
  // Huvudknappen — speglar Home:s gameBtn-vokabulär (höjd ~56, bordered,
  // cardElevated).
  mainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 56,
    borderWidth: 1,
    // Vit kant (Peter 2026-08-07) — skiljer 1vs1-knappen från Home:s
    // blå/gröna/grå CTA-familjer utan att införa en ny brand-färg.
    borderColor: Colors.textPrimary,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  // Compact (Home, Peter 2026-08-08): smal ruta högerställd på skärmen —
  // utan titeln behövs bara ikon + signal + pil, så knappen tar en
  // tredjedel av bredden och ligger kvar på samma höjd i flödet.
  mainBtnCompact: {
    width: '33.33%',
    alignSelf: 'flex-end',
    justifyContent: 'space-between',
    gap: 4,
    paddingHorizontal: 6,
  },
  // Gold-signal när någon match ändrat tillstånd sedan senaste besök.
  // Samma typografi som Lobby:s playersWaitingLabel.
  newUpdateLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.warning,
    // Tight radavstånd + centrering så tvåradaren håller sig inom
    // knappens höjd (56) och läser som ETT märke.
    lineHeight: 15,
    textAlign: 'center',
  },
  // Mindre typografi + flexShrink så etiketten ger vika i den smala
  // compact-rutan istället för att trycka ut pilen.
  newUpdateLabelCompact: {
    fontSize: FontSize.xs,
    lineHeight: 13,
    flexShrink: 1,
  },
  // Absolut-fyllande wrapper som centrerar titeln i hela knappen — flex-
  // centrering är plattformsoberoende (till skillnad från textAlignVertical
  // som ignoreras på iOS).
  titleOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBtnTitle: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  // Fast vit i vila; guld + blinkande när det finns en ny update.
  chevron: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  chevronCompact: {
    fontSize: 22,
  },
});

// 1vs1-ingången — Home-huvudknapp för Remote 1v1-dueller. Labeln skiljer
// sig per variant (Peter 2026-08-12): compact (Home) visar "1vs1", full
// (Profile → Player history) visar "1vs1 History". Alert-copy i Lobby +
// Home hänvisar till "1vs1" eftersom det är vad spelaren ser på Home.
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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from '@/src/components/haptic';

import { Colors, FontSize, Radius, Spacing } from '../theme';
import { VersusIcon } from './VersusIcon';
import { supabase } from '../utils/supabase';
import { isAnonymousSession } from '../utils/auth';
import {
  getMyMatches,
  subscribeToMyMatches,
  type MyRemoteMatch,
} from '../utils/remoteMatches';
import { getSavedLobbies } from '../utils/savedLobbies';
import {
  getCachedHomeRowVisible,
  setCachedHomeRowVisible,
} from '../utils/homeRowVisibility';

// Per-user-namespacad nyckel (samma mönster som friends/gameHistory) så
// User A:s "sett"-snapshot inte tystar signalen för User B på samma device.
const SEEN_KEY_PREFIX = '@quizvibe/myMatches/seen/v1/';

/**
 * Signatur över matchernas tillstånd. Ändras så fort något som är
 * intressant för spelaren ändrats: ny/borttagen match, status (active →
 * finished/cancelled/void), vem som spelat klart, eller resultatet.
 */
/** Per-match-tupel `id:status:mitt-klar:motståndar-klar:resultat`. Match-id
 *  (UUID) innehåller inga kolon, så första fältet kan läsas ut med split(':'). */
function matchTuple(m: MyRemoteMatch): string {
  return `${m.match.id}:${m.match.status}:${m.me.finishedAt ? 1 : 0}:${
    m.opponent?.finishedAt ? 1 : 0
  }:${m.match.result ?? ''}`;
}

function buildSignature(list: MyRemoteMatch[]): string {
  return list.map(matchTuple).sort().join('|');
}

/**
 * Match-id:na vars tillstånd ändrats sedan senaste "sett"-snapshot — driver
 * flash-guiden (skickas som focusMatchIds till /my-matches så exakt de nya
 * matcherna blinkar). `seen` === null (ej namespace:at) eller '' (inget sett
 * förut) → allt räknas som nytt.
 */
function changedMatchIds(list: MyRemoteMatch[], seen: string | null): string[] {
  if (!seen) return list.map((m) => m.match.id);
  const seenById = new Map<string, string>();
  for (const part of seen.split('|')) {
    if (!part) continue;
    seenById.set(part.split(':')[0], part);
  }
  return list
    .filter((m) => seenById.get(m.match.id) !== matchTuple(m))
    .map((m) => m.match.id);
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
export function MyMatchesSection({
  full = false,
  inRow = false,
  onVisible,
}: { full?: boolean; inRow?: boolean; onVisible?: (v: boolean) => void } = {}) {
  const compact = !full;
  // Var knappen renderas ('/' på Home, '/profile' i Player history) —
  // skickas med som `from` så /my-matches Back-knapp går tillbaka hit
  // istället för alltid till Home (samma mönster som Store-skärmen).
  const pathname = usePathname();
  const [matches, setMatches] = useState<MyRemoteMatch[]>([]);
  const [isGuestSession, setIsGuestSession] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [seenSignature, setSeenSignature] = useState<string | null>(null);
  const seenKeyRef = useRef<string | null>(null);
  // false tills mountens första reload klarat — dessförinnan litar vi på
  // session-cachen så knappen renderas med rätt höjd direkt vid en re-mount
  // i stället för att pop:a in (se homeRowVisibility.ts).
  const [hydrated, setHydrated] = useState(false);

  const reload = useCallback(async () => {
    const [{ data: sessionData }, anon, mine, saved] = await Promise.all([
      supabase.auth.getSession(),
      isAnonymousSession(),
      getMyMatches(),
      getSavedLobbies(),
    ]);
    // Sparade lobbies ("Save 1vs1 – Play later") räknas som innehåll så
    // knappen dyker upp även innan någon match skapats. Ingen prune här —
    // /my-matches äger städningen mot rooms-raden; en död post ger på sin
    // höjd en extra knapp tills spelaren öppnat listan en gång.
    setSavedCount(saved.length);
    // Sessionen läses fortfarande direkt eftersom vi behöver user.id till
    // "sett"-nyckeln nedan; guest-avgörandet går via den delade helpern.
    const user = sessionData.session?.user as { id?: string } | undefined;
    setIsGuestSession(anon);
    setMatches(mine);
    // Synligheten (matcher + sparade lobbies + guest-status) är nu känd —
    // markera hydrerad så cachen tar över från det optimistiska render-läget.
    // Läses av `show`-beräkningen nedan; seenSignature-logiken därunder kan
    // early-return:a utan att påverka detta.
    setHydrated(true);

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

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  useEffect(() => {
    const unsubscribe = subscribeToMyMatches(() => { void reload(); });
    return unsubscribe;
  }, [reload]);

  // Ren guest (anon-session, inget QuizVibe-konto) ser INGEN 1vs1-ingång
  // alls (Peter 2026-08-08). Remote 1v1 kräver konto sedan samma datum —
  // rena guests kan inte längre skapa matcher, men anon-sessioner från
  // FÖRE spärren kan ha kvar legacy-rader som annars hade renderat knappen
  // på Home. De löper ut på sin 48h-deadline och sveps av cron:en.
  const visible = useMemo(
    () => (isGuestSession ? [] : matches),
    [isGuestSession, matches],
  );
  // Sparade lobbies är kontobundna (storen nycklas på playerName) — samma
  // guard som matcherna så en anon-session aldrig får ingången.
  const visibleSavedCount = isGuestSession ? 0 : savedCount;

  // Något har hänt sedan spelaren senast öppnade listan → blinkande signal.
  // seenSignature === null = ingen user-id (kan inte namespace:a) → tyst.
  const signature = buildSignature(visible);
  const hasUpdate =
    visible.length > 0 && seenSignature !== null && seenSignature !== signature;

  // Hooks måste köras före den villkorliga return:en nedan.
  const blink = useBlink(hasUpdate);

  // Definieras EFTER `visible`/`hasUpdate` (TDZ) — flash-guiden behöver dem.
  const handlePress = useCallback(
    (signature: string) => {
      // Vilka matcher är NYA sedan senast? Beräknas mot den ännu ej
      // överskrivna snapshotten (setSeenSignature nedan markerar allt sett så
      // Home-etiketten är borta när spelaren kommer tillbaka).
      const changed = changedMatchIds(visible, seenSignature);
      setSeenSignature(signature);
      const key = seenKeyRef.current;
      if (key) void AsyncStorage.setItem(key, signature).catch(() => {});
      router.push({
        pathname: '/my-matches',
        params: {
          from: pathname || '/',
          // Skicka bara focus-id:n när det faktiskt finns en update — annars
          // ska /my-matches öppnas utan flash.
          ...(hasUpdate && changed.length > 0
            ? { focusMatchIds: changed.join(',') }
            : {}),
        },
      });
    },
    [pathname, visible, seenSignature, hasUpdate],
  );

  // Rapportera synlighet uppåt (HomeExtrasRow kollapsar raden när varken
  // Competition eller 1vs1 finns). Effekten måste ligga före return:en.
  const dataVisible = !(visible.length === 0 && visibleSavedCount === 0);
  // Innan mountens första reload klarat: rendera optimistiskt om cachen säger
  // att knappen var synlig senast → ingen pop-in vid re-mount. Efter hydrering
  // gäller riktig data (så en tömd rad kollapsar).
  const show = dataVisible || (!hydrated && getCachedHomeRowVisible('matches'));

  useEffect(() => {
    if (hydrated) setCachedHomeRowVisible('matches', dataVisible);
  }, [hydrated, dataVisible]);

  useEffect(() => {
    onVisible?.(show);
  }, [show, onVisible]);

  if (!show) return null;

  return (
    <TouchableOpacity
      style={[
        styles.mainBtn,
        compact && (inRow ? styles.mainBtnInRow : styles.mainBtnCompact),
      ]}
      activeOpacity={0.8}
      onPress={() => handlePress(signature)}
    >
      {/* Full variant (Profile): titeln är absolut-centrerad i hela knappen
          så den sitter still oavsett om "New update"-etiketten visas eller
          inte (en vanlig flex-cell hade förskjutits när etiketten dyker upp).
          pointerEvents none → taps går vidare till knappen. */}
      {!compact && (
        <View style={styles.titleOverlay} pointerEvents="none">
          <Text style={styles.mainBtnTitle}>H2H History</Text>
        </View>
      )}
      {/* Samma 1vs1-märke som Home:s "Remote Play"-val (blå silhuetter +
          guld-wifi emellan) så duell-läget har EN ikon i appen. marginLeft
          skjuter in den från vänsterkanten så den inte klistrar sig mot
          rutans ram.

          Compact bär dessutom en "1vs1"-etikett direkt efter ikonen (Peter
          2026-08-12) — ikon + text grupperas i EN nod så knappens
          space-between fördelar [ikon+text] · [New update] · [pil] i stället
          för att spreta isär ikonen och etiketten. */}
      <View
        style={[
          styles.iconGroup,
          { marginLeft: compact ? Spacing.sm : Spacing.md },
        ]}
      >
        <VersusIcon height={compact ? 22 : 30} />
        {compact && <Text style={styles.compactLabel}>H2H</Text>}
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
  // Compact (Home): halv skärmbredd, högerställd (Peter 2026-08-12 — var
  // en tredjedel utan text-etikett). Knappen ligger kvar på samma höjd i
  // flödet; bara bredden växer, så resten av Home-layouten är orörd.
  mainBtnCompact: {
    width: '50%',
    alignSelf: 'flex-end',
    justifyContent: 'space-between',
    gap: 4,
    paddingHorizontal: 6,
  },
  // Home-rad-variant (HomeExtrasRow): samma compact-visual men UTAN egen
  // bredd/alignSelf — fyller sin flex:1-slot så knappen anchoras till höger
  // halvan bredvid Competition-knappen. Slot:ens default stretch ger full
  // bredd inom halvan.
  mainBtnInRow: {
    justifyContent: 'space-between',
    gap: 4,
    paddingHorizontal: 6,
  },
  // Ikon + "1vs1"-etikett som EN vänsterställd grupp.
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  // Speglar mainBtnTitle-typografin (full-variantens rubrik) så de två
  // varianterna låter likadant — bara mindre eftersom compact-rutan delar
  // bredden med "New update"-signalen och pilen.
  compactLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
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

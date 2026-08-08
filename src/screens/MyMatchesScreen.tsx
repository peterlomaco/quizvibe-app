// Remote Play History — egen skärm som listar användarens Remote 1v1-dueller.
//
// Nås via huvudknappen "Remote Play History" på Home (MyMatchesSection — knappen
// navigerar hit istället för att fälla ut listan inline, Peter 2026-08-07).
//
// Matcherna grupperas i tre kollapsbara sektioner (samma +/−-mönster som
// Profile-skärmens rubriker, Peter 2026-08-07):
//   1. Not started        — aktiv match där jag inte svarat på någon fråga
//   2. Ongoing            — aktiv match jag påbörjat, eller där jag är klar
//                           och väntar på motståndaren
//   3. Status: Finished   — avgjorda/void/host-avbrutna matcher
//
// "Not started" vs "Ongoing" kan inte härledas ur `me.finishedAt` (null i
// båda fallen) — därför hämtas mina svarade match-id:n i en extra query
// (getMyAnsweredMatchIds) parallellt med matchlistan.
//
// SPARADE LOBBIES (Peter 2026-08-08): överst i "Not started" ligger även
// lobbies som spelaren parkerat via "Save 1vs1 – Play later" i lobbyns
// TopUserBanner-sheet. De är INTE matcher — ingen remote_matches-rad finns
// ännu — utan lokala genvägar (savedLobbies.ts) tillbaka in i ett rum som
// lever server-side i 24h. Tap:en går till /lobby, inte /quiz. Varje reload
// prunar dem mot rooms-raden: saknas den (raderad/utgången) eller är
// game_started satt (då finns en riktig match som tar över raden) raderas
// posten ur storen.
//
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
// Back-knappen går tillbaka dit spelaren kom ifrån (`from`-param: Home
// eller Profile → Player history).

import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
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
import { VersusIcon } from '../components/VersusIcon';
import { Colors, FontSize, FontWeight, Radius, Spacing, Typography } from '../theme';
import { isAnonymousSession } from '../utils/auth';
import { getLobbyPlayers } from '../utils/mockLobbyPlayers';
import { getRoomMeta } from '../utils/mockActiveRooms';
import {
  buildRemoteQuizParams,
  formatPlayerLabel,
  getMyAnsweredMatchIds,
  getMyMatches,
  subscribeToMyMatches,
  type MyRemoteMatch,
} from '../utils/remoteMatches';
import { formatRoomCode } from '../utils/roomCode';
import { getSavedLobbies, removeSavedLobby, type SavedLobby } from '../utils/savedLobbies';

function hoursLeft(deadlineAt: string): number {
  return Math.max(0, Math.ceil((new Date(deadlineAt).getTime() - Date.now()) / 3_600_000));
}

/** YYYY-MM-DD i enhetens lokala tidszon (manuellt formaterat — inget Intl-beroende). */
function formatDate(iso: string): string {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/**
 * Sparad lobby berikad med rummets 24h-deadline (läses från rooms-raden
 * vid varje reload — den lagrade posten känner bara till när den sparades).
 */
type SavedLobbyRow = SavedLobby & { expiresAt?: string };

/** Sektionerna i listan — ordningen här är renderingsordningen. */
type SectionKey = 'notStarted' | 'ongoing' | 'history';

const SECTION_TITLES: Record<SectionKey, string> = {
  notStarted: 'Status: Not started',
  ongoing: 'Status: Ongoing',
  history: 'Status: Finished',
};

export default function MyMatchesScreen() {
  // `from` sätts av MyMatchesSection (Home '/' eller Profile '/profile') så
  // Back tar spelaren tillbaka dit hen kom ifrån. Saknas/ogiltig → Home.
  // Whitelist:ad mappning (inte rå param) så expo-routers typade
  // router.replace accepterar värdet och okända värden inte kan smitas in.
  const { from } = useLocalSearchParams<{ from?: string }>();
  const backTo = from === '/profile' ? '/profile' : '/';
  const [matches, setMatches] = useState<MyRemoteMatch[]>([]);
  // Lobbies spelaren parkerat via "Save 1vs1 – Play later" i lobbyns
  // TopUserBanner-sheet. Ingen match finns ännu — de renderas som egna
  // rader överst i "Not started" och tap:en går tillbaka in i lobbyn.
  const [savedLobbies, setSavedLobbies] = useState<SavedLobbyRow[]>([]);
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());
  const [isGuestSession, setIsGuestSession] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [resultMatchId, setResultMatchId] = useState<string | null>(null);
  // Historiken startar kollapsad så de spelbara matcherna syns direkt;
  // de två aktiva sektionerna är utfällda från start.
  const [expanded, setExpanded] = useState<Record<SectionKey, boolean>>({
    notStarted: true,
    ongoing: true,
    history: false,
  });

  // Historikens motståndar-grupper (nyckel = PlayerName) — alla startar
  // ihopfällda; state lever bara medan skärmen är monterad.
  const [expandedOpponents, setExpandedOpponents] = useState<Record<string, boolean>>({});

  const toggleSection = useCallback((key: SectionKey) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Nyckeln är motståndarens user-id (inte namnet) så en spelare som bytt
  // mellan kontonamn och Guest alias inte splittas i två grupper.
  const toggleOpponent = useCallback((oppKey: string) => {
    setExpandedOpponents((prev) => ({ ...prev, [oppKey]: !prev[oppKey] }));
  }, []);

  const reload = useCallback(async () => {
    const [anon, mine, saved] = await Promise.all([
      isAnonymousSession(),
      getMyMatches(),
      getSavedLobbies(),
    ]);
    // Bara aktiva matcher behöver svarslookupen (historiken grupperas på
    // status) — håller queryn liten.
    const answered = await getMyAnsweredMatchIds(
      mine.filter((m) => m.match.status === 'active').map((m) => m.match.id),
    );
    // Sparade lobbies prunas mot rooms-raden, som äger sanningen: saknas
    // metan är rummet raderat eller utgånget (24h), och `gameStarted`
    // betyder att host tryckt Start Game — då finns en riktig matchrad som
    // tar över raden i listan. Bortprunade poster raderas ur storen så de
    // inte städas om vid varje focus.
    const roomStates = await Promise.all(
      saved.map(async (s) => {
        const [meta, roster] = await Promise.all([
          getRoomMeta(s.roomCode),
          // Motparten läses om varje gång: host kan ha sparat en tom lobby
          // och fått en motståndare efteråt. Faller tillbaka på namnet som
          // sparades om rostern inte går att läsa.
          getLobbyPlayers(s.roomCode),
        ]);
        const counterpart = s.isHost
          ? roster?.find((p) => !p.isHost && !p.hasLeft)
          : roster?.find((p) => p.isHost);
        return { saved: s, meta, opponentName: counterpart?.name ?? s.opponentName };
      }),
    );
    const liveSaved: SavedLobbyRow[] = [];
    for (const { saved: s, meta, opponentName } of roomStates) {
      if (meta && !meta.gameStarted) {
        liveSaved.push({ ...s, opponentName, expiresAt: meta.expiresAt });
      } else {
        void removeSavedLobby(s.roomCode);
      }
    }
    setIsGuestSession(anon);
    setMatches(mine);
    setSavedLobbies(liveSaved);
    setAnsweredIds(answered);
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

  // Sparade lobbies är per definition kontobundna (Remote 1v1 är
  // users-only, och storen nycklas på playerName) — anon-sessioner ser
  // dem aldrig. Guarden är defensiv mot legacy-state på delade enheter.
  const visibleSaved = isGuestSession ? [] : savedLobbies;

  // Gruppering: aktiv + inga egna svar → Not started; aktiv i övrigt
  // (påbörjad ELLER klar och väntar på motståndaren) → Ongoing; allt
  // annat (finished/void/walkover/cancelled) → History.
  const sections: Record<SectionKey, MyRemoteMatch[]> = {
    notStarted: [],
    ongoing: [],
    history: [],
  };
  for (const m of visible) {
    if (m.match.status !== 'active') sections.history.push(m);
    else if (m.me.finishedAt == null && !answeredIds.has(m.match.id)) sections.notStarted.push(m);
    else sections.ongoing.push(m);
  }
  // Not started + Ongoing sorteras kronologiskt med ÄLDST överst (= den
  // som är närmast sin 48h-deadline först). History behåller
  // getMyMatches-ordningen (nyast först).
  const oldestFirst = (a: MyRemoteMatch, b: MyRemoteMatch) =>
    new Date(a.match.startedAt).getTime() - new Date(b.match.startedAt).getTime();
  sections.notStarted.sort(oldestFirst);
  sections.ongoing.sort(oldestFirst);

  const renderRow = (m: MyRemoteMatch, section: SectionKey) => {
    const { match, me, opponent } = m;
    // Guest alias visas som "GuestA-1234567 (Anna-42)" så man ser vilket
    // konto man faktiskt mötte även när motståndaren spelade som Guest.
    const oppName = formatPlayerLabel(opponent);
    const myTurn = match.status === 'active' && me.finishedAt == null;
    const waiting = match.status === 'active' && me.finishedAt != null;

    let statusText: string;
    let statusColor: string = Colors.textSecondary;
    if (myTurn && section === 'notStarted') {
      // Sektionsrubriken säger redan "Not started" — raden behöver bara
      // visa hur länge matchen är spelbar.
      const h = hoursLeft(match.deadlineAt);
      statusText = `Time left: ${h} ${h === 1 ? 'hour' : 'hours'}`;
      statusColor = Colors.warning;
    } else if (myTurn) {
      statusText = `Your turn — ${hoursLeft(match.deadlineAt)}h left`;
      statusColor = Colors.warning;
    } else if (waiting) {
      const h = hoursLeft(match.deadlineAt);
      statusText = `Waiting time left for ${oppName}: ${h} ${h === 1 ? 'hour' : 'hours'}`;
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
            {/* I historiken står motståndaren redan i underrubriken —
                raden visar då när matchen skapades istället. */}
            {section === 'history'
              ? `Game created: ${formatDate(match.startedAt)}`
              : `Game against: ${oppName}`}
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
  };

  /**
   * Sparad lobby — ingen match finns ännu, så raden bär rumskoden och
   * (om någon hunnit joina) motparten. Tap → tillbaka in i lobbyn med
   * samma params som den ursprungliga ingången: host återtar sin lobby
   * (lobbyType styr den forcerade 1v1-seeden), motståndaren går in som
   * non-host och får settings via lobby_settings-synken.
   */
  const renderSavedRow = (s: SavedLobbyRow) => {
    const h = s.expiresAt ? hoursLeft(s.expiresAt) : null;
    return (
      <TouchableOpacity
        key={`saved-${s.roomCode}`}
        style={[styles.row, styles.rowSaved]}
        activeOpacity={0.7}
        onPress={() =>
          router.push({
            pathname: '/lobby',
            params: {
              code: s.roomCode,
              isHost: String(s.isHost),
              ...(s.isHost ? { lobbyType: '1v1' } : {}),
            },
          })
        }
      >
        <View style={styles.rowText}>
          <Text style={styles.opponentName} numberOfLines={1}>
            Saved lobby: {formatRoomCode(s.roomCode)}
          </Text>
          <Text style={[styles.statusText, { color: Colors.primary }]} numberOfLines={1}>
            {s.opponentName ? `With: ${s.opponentName}` : 'Waiting for opponent to join'}
            {h != null ? ` · Lobby open ${h} ${h === 1 ? 'hour' : 'hours'}` : ''}
          </Text>
        </View>
        <Text style={[styles.chevron, { color: Colors.primary }]}>›</Text>
      </TouchableOpacity>
    );
  };

  // Historiken grupperas per motståndar-USER-ID, inte namn — en spelare
  // kan möta samma konto både under dess riktiga namn och under ett Guest
  // alias, och det ska ändå bli EN grupp. Etiketten tas från senaste
  // matchen i gruppen. Grupperna sorteras alfabetiskt på etiketten; inom
  // en grupp ligger senast skapade matchen överst.
  const historyGroups = new Map<string, { label: string; rows: MyRemoteMatch[] }>();
  for (const m of sections.history) {
    const key = m.opponent?.userId ?? 'unknown-opponent';
    const group = historyGroups.get(key);
    if (group) group.rows.push(m);
    else historyGroups.set(key, { label: formatPlayerLabel(m.opponent), rows: [m] });
  }
  // Inom varje grupp: senast skapade matchen överst.
  for (const group of historyGroups.values()) {
    group.rows.sort(
      (a, b) => new Date(b.match.startedAt).getTime() - new Date(a.match.startedAt).getTime(),
    );
  }
  const historyByOpponent = [...historyGroups.entries()].sort((a, b) =>
    a[1].label.localeCompare(b[1].label, 'sv'),
  );

  // Underrubrik per motståndare i historiken — samma +/−-vokabulär som
  // sektionsrubrikerna men en snäpp mindre och indragen.
  const renderOpponentGroup = (oppKey: string, oppName: string, rows: MyRemoteMatch[]) => {
    const isOpen = expandedOpponents[oppKey] ?? false;
    return (
      <View key={oppKey} style={styles.opponentGroup}>
        <Pressable
          onPress={() => toggleOpponent(oppKey)}
          style={({ pressed }) => [styles.subHeaderRow, pressed && { opacity: 0.7 }]}
          hitSlop={8}
        >
          <Text style={styles.subHeader} numberOfLines={1}>
            Game against: {oppName}
          </Text>
          <View style={styles.subToggleBox}>
            <Text style={styles.subChevron}>{isOpen ? '−' : '+'}</Text>
          </View>
          <Text style={styles.sectionCount}>{rows.length}</Text>
        </Pressable>
        {!isOpen && <View style={styles.sectionDivider} />}
        {isOpen && <View style={styles.list}>{rows.map((m) => renderRow(m, 'history'))}</View>}
      </View>
    );
  };

  // Kollapsbar sektionsrubrik — speglar Profile-skärmens +/−-mönster
  // (toggle-box + tunn divider när sektionen är ihopfälld).
  const renderSection = (key: SectionKey) => {
    const rows = sections[key];
    const isOpen = expanded[key];
    // Sparade lobbies (ingen match ännu) hör hemma överst i "Not started"
    // och räknas in i sektionens antal.
    const saved = key === 'notStarted' ? visibleSaved : [];
    const total = rows.length + saved.length;
    return (
      <View key={key} style={styles.section}>
        <Pressable
          onPress={() => toggleSection(key)}
          style={({ pressed }) => [styles.sectionHeaderRow, pressed && { opacity: 0.7 }]}
          hitSlop={8}
        >
          <Text style={styles.sectionHeader}>{SECTION_TITLES[key]}</Text>
          {/* +/−-boxen sitter direkt efter rubriken (som i Profile);
              antalet högerställs via marginLeft: 'auto'. */}
          <View style={styles.sectionToggleBox}>
            <Text style={styles.sectionChevron}>{isOpen ? '−' : '+'}</Text>
          </View>
          <Text style={styles.sectionCount}>{total}</Text>
        </Pressable>
        {/* Grått skiljestreck — bara i ihopfällt läge (som i Profile);
            utfälld sektion separeras av sina egna match-rader. */}
        {!isOpen && <View style={styles.sectionDivider} />}
        {isOpen && (
          <View style={styles.list}>
            {saved.map(renderSavedRow)}
            {total === 0 ? (
              <Text style={styles.sectionEmptyText}>No matches here.</Text>
            ) : key === 'history' ? (
              // Historiken grupperas per motståndare — en utfällbar
              // underrubrik per konto (alfabetisk ordning på etiketten).
              historyByOpponent.map(([oppKey, group]) =>
                renderOpponentGroup(oppKey, group.label, group.rows),
              )
            ) : (
              rows.map((m) => renderRow(m, key))
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopUserBanner onBackPress={() => router.replace(backTo)} backLabel="Back" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Rubrik + 1vs1-märket (två blå silhuetter förbundna av prickar)
            direkt efter — samma ikon som Home:s "Remote Play History"-knapp. */}
        <View style={styles.screenTitleRow}>
          <Text style={styles.screenTitle}>Remote Play History</Text>
          <VersusIcon height={30} />
        </View>
        <Text style={styles.screenSubtitle}>
          Remote duels — each player answers on their own device within 48 hours.
        </Text>

        {loaded && visible.length === 0 && visibleSaved.length === 0 && (
          <Text style={styles.emptyText}>
            No 1vs1 matches yet. Tap &quot;Start New Game&quot; on Home, choose
            Remote Play (1vs1) and invite a friend to start your first duel.
          </Text>
        )}

        {/* Sektionerna renderas alltid när användaren har minst en match —
            en tom sektion visar "No matches here." när den fälls ut. */}
        {(visible.length > 0 || visibleSaved.length > 0) && (
          <View style={styles.sections}>
            {(['notStarted', 'ongoing', 'history'] as SectionKey[]).map(renderSection)}
          </View>
        )}
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
  screenTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
  sections: {
    gap: Spacing.md,
  },
  section: {
    gap: Spacing.sm,
  },
  // Kollapsbar sektionsrubrik — samma vokabulär som Profile-skärmens
  // sektioner (titel + 26×26 toggle-box med +/−, divider när kollapsad).
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionHeader: {
    ...Typography.title,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  // Antalet matcher i sektionen — dämpad så rubriken behåller vikten,
  // högerställd så toggle-boxen kan sitta tätt intill rubriken.
  sectionCount: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginLeft: 'auto',
  },
  sectionToggleBox: {
    width: 26,
    height: 26,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionChevron: {
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  // Motståndar-grupper i historiken — indragna en snäpp så de läses som
  // en nivå under sektionsrubriken.
  opponentGroup: {
    gap: Spacing.sm,
    paddingLeft: Spacing.sm,
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  subHeader: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  subToggleBox: {
    width: 22,
    height: 22,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subChevron: {
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  sectionEmptyText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
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
  // Sparad lobby (ingen match ännu) — blå kant skiljer den från de gyllene
  // "din tur"-raderna: här ska spelaren tillbaka in i LOBBYN, inte in i ett
  // quiz.
  rowSaved: {
    borderColor: Colors.primary,
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

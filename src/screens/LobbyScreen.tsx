import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { ApproveToggle } from '../components/ApproveToggle';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Player, PlayerRow } from '../components/PlayerRow';
import { Colors, FontSize, FontWeight, Radius, Spacing, Typography } from '../theme';
import { getAvatarEmojiById } from '../utils/avatars';
import { loadFriends, type Friend } from '../utils/friendsStorage';
import { consumePendingLobbyPlayers } from '../utils/pendingLobby';
import { loadProfile, type ProfileData } from '../utils/profileStorage';
import { generateRoomCode } from '../utils/roomCode';
import { addInvite } from '../utils/waitingInvites';

export interface LobbyPlayer extends Player {
  type: 'registered' | 'guest' | 'manual';
  age?: number;
  skill?: 'easy' | 'intermediate' | 'expert';
  hcpComplete: boolean;
  isHost?: boolean;
  // Host godkänner spelare innan de tas in i spelet. Host själv är
  // alltid auto-approved (treats !!isHost as approved när approved saknas).
  approved?: boolean;
  // True om host lade till spelaren manuellt via +Add Player. Dessa
  // spelare saknar egen mobil och måste tas bort om läget byts till
  // Individual Devices.
  addedByHost?: boolean;
  // Driver "Spotify enabled/disabled"-statusen i Game Connections-sektionen.
  // Sätts från profile.spotifyConnected för registrerade spelare (host via
  // mergeProfileIntoHost, room-code-joiners via deras profil när det flödet
  // implementeras). Guests och manuellt tillagda spelare lämnas falsy —
  // de räknas alltid som "ej Spotify-kopplade".
  spotifyConnected?: boolean;
}

type GameMode = 'pass-the-phone' | 'individual-devices';

// Year-of-birth gränser (samma som registreringsformuläret för gäster) ....
const CURRENT_YEAR = new Date().getFullYear();
const MIN_BIRTH_YEAR = 1930;
const MAX_BIRTH_YEAR = CURRENT_YEAR - 5;
const BIRTH_YEARS = Array.from(
  { length: MAX_BIRTH_YEAR - MIN_BIRTH_YEAR + 1 },
  (_, i) => MAX_BIRTH_YEAR - i,
);

/**
 * Mergar sparad profildata in i host-spelarkortet. Behåller övriga fält
 * som id och isHost, men skriver över namn/avatar/age/skill med profilens
 * värden. Om profilen saknar required fält (skill eller birthYear) markeras
 * hcpComplete=false så host-kortet visar "HCP Required" på samma sätt som
 * andra spelare utan komplett HCP.
 */
function mergeProfileIntoHost(existing: LobbyPlayer, profile: ProfileData): LobbyPlayer {
  const currentYear = new Date().getFullYear();
  const age = profile.birthYear ? currentYear - profile.birthYear : undefined;
  const hcpComplete = !!(profile.skill && age !== undefined);
  return {
    ...existing,
    name: profile.nickname?.trim() || existing.name,
    emoji: getAvatarEmojiById(profile.selectedAvatarId),
    age,
    skill: profile.skill ?? undefined,
    hcpComplete,
    isReady: hcpComplete,
    type: 'registered',
    isHost: true,
    spotifyConnected: profile.spotifyConnected ?? false,
  };
}

const SEED_PLAYERS: LobbyPlayer[] = [
  { id: '1', name: 'Alex K.',   emoji: '🦊', isReady: true,  type: 'registered', hcpComplete: true,  age: 32, skill: 'intermediate', isHost: true, approved: true,  spotifyConnected: true  },
  { id: '2', name: 'Sam L.',    emoji: '🎸', isReady: true,  type: 'registered', hcpComplete: true,  age: 28, skill: 'expert',                    approved: false, spotifyConnected: true  },
  { id: '3', name: 'Jordan M.', emoji: '🤖', isReady: true,  type: 'guest',      hcpComplete: true,  age: 35, skill: 'intermediate',              approved: false                          },
  { id: '4', name: 'Casey P.',  emoji: '🐉', isReady: true,  type: 'registered', hcpComplete: true,  age: 41, skill: 'easy',                      approved: false, spotifyConnected: false },
];

const REGIONS = ['Sweden', 'Nordics', 'Europe', 'Global'] as const;
type Region = typeof REGIONS[number];

// Music packages — extra paket host kan köpa via QuizVibe Store och välja
// per room. Tom array = host har inga köpta paket → "Buy Extra packages"
// CTA visas. Mockas här tills Store-integrationen är inkopplad.
interface MusicPackage {
  id: string;
  name: string;
  emoji: string;
}
const PURCHASED_PACKAGES: MusicPackage[] = [
  { id: 'pkg-80s', name: '80s Hits', emoji: '📻' },
  { id: 'pkg-rock', name: 'Rock Classics', emoji: '🎸' },
  { id: 'pkg-hiphop', name: 'Hip-Hop 2010s', emoji: '🎤' },
];

const REGION_FLAGS: Record<Region, string> = {
  Sweden: '🇸🇪', Nordics: '🌐', Europe: '🇪🇺', Global: '🌍',
};

const ERA_MIN = 1900;
const ERA_MAX = new Date().getFullYear();
const SLIDER_WIDTH = 280;

function clampEraToPlayer(fromYear: number, toYear: number, players: LobbyPlayer[]) {
  const currentYear = new Date().getFullYear();
  const ages = players.filter((p) => p.hcpComplete && p.age).map((p) => p.age as number);
  if (ages.length === 0) return { from: fromYear, to: toYear, warning: null };
  const youngestBirth = currentYear - Math.min(...ages);
  if (toYear < youngestBirth) {
    const adjustedFrom = Math.max(ERA_MIN, toYear - 10);
    return { from: adjustedFrom, to: toYear, warning: `Youngest player born ${youngestBirth}. Showing: ${adjustedFrom}–${toYear}.` };
  }
  return { from: fromYear, to: toYear, warning: null };
}

function DecadeMarks() {
  const decades = Array.from(
    { length: Math.floor((ERA_MAX - ERA_MIN) / 10) + 1 },
    (_, i) => ERA_MIN + i * 10
  );
  return (
    <View style={{ width: SLIDER_WIDTH, height: 50, marginTop: 6 }}>
      {decades.map((year) => {
        const position = ((year - ERA_MIN) / (ERA_MAX - ERA_MIN)) * SLIDER_WIDTH;
        return (
          <View key={year} style={{ position: 'absolute', left: position, alignItems: 'center', width: 1 }}>
            <View style={{ width: 1, height: 5, backgroundColor: Colors.borderStrong }} />
            <View style={{ width: 30, height: 10, marginTop: 12, transform: [{ rotate: '90deg' }] }}>
              <Text style={{ fontSize: 8, color: Colors.textSecondary, textAlign: 'center', width: 30 }}>
                {year}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── Region Modal ─────────────────────────────────────────────────────────────

function RegionModal({ visible, value, onChange, onClose }: {
  visible: boolean; value: Region; onChange: (r: Region) => void; onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={regionSheet.overlay}>
        <TouchableOpacity style={regionSheet.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={regionSheet.container}>
          <View style={regionSheet.handle} />
          <Text style={regionSheet.title}>Region Scope</Text>
          <Text style={regionSheet.subtitle}>Sets the cultural context for questions</Text>
          <View style={regionSheet.list}>
            {REGIONS.map((r, i) => (
              <TouchableOpacity
                key={r}
                activeOpacity={0.7}
                style={[regionSheet.item, r === value && regionSheet.itemActive, i < REGIONS.length - 1 && regionSheet.itemBorder]}
                onPress={() => { onChange(r); onClose(); }}
              >
                <Text style={regionSheet.itemFlag}>{REGION_FLAGS[r]}</Text>
                <Text style={[regionSheet.itemText, r === value && regionSheet.itemTextActive]}>{r}</Text>
                {r === value && <Text style={regionSheet.check}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={regionSheet.cancelBtn} activeOpacity={0.7} onPress={onClose}>
            <Text style={regionSheet.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const regionSheet = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  container: { backgroundColor: Colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: 48, borderWidth: 1, borderColor: Colors.border },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.borderStrong, alignSelf: 'center', marginBottom: Spacing.md },
  title: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg, marginTop: 4 },
  list: { backgroundColor: Colors.background, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', marginBottom: Spacing.md },
  item: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  itemActive: { backgroundColor: Colors.primaryMuted },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.separator },
  itemFlag: { fontSize: 22 },
  itemText: { flex: 1, fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  itemTextActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
  check: { fontSize: 16, color: Colors.primary, fontWeight: FontWeight.semibold },
  cancelBtn: { padding: Spacing.md, alignItems: 'center', borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border },
  cancelText: { fontSize: FontSize.md, color: Colors.textSecondary },
});

// ─── Add Player Modal ─────────────────────────────────────────────────────────

type AddPlayerSkill = 'easy' | 'intermediate' | 'expert';
const ADD_PLAYER_SKILL_OPTIONS: { id: AddPlayerSkill; label: string }[] = [
  { id: 'easy',         label: 'Easy' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'expert',       label: 'Advanced' },
];

function AddPlayerModal({ visible, onClose, onAdd }: {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, age: number, skill: AddPlayerSkill) => void;
}) {
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [skill, setSkill] = useState<AddPlayerSkill | null>(null);
  const [yearPickerOpen, setYearPickerOpen] = useState(false);

  // Återställ allt när modalen stängs (med liten delay för slide-animation)
  useEffect(() => {
    if (!visible) {
      const t = setTimeout(() => {
        setName('');
        setBirthYear(null);
        setSkill(null);
        setYearPickerOpen(false);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const isFormValid = !!name.trim() && birthYear !== null && skill !== null;

  const handleAdd = () => {
    if (!isFormValid || birthYear === null || skill === null) return;
    const age = CURRENT_YEAR - birthYear;
    onAdd(name.trim(), age, skill);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={modal.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={modal.container}>
          <Text style={modal.title}>Add Player</Text>
          <Text style={modal.subtitle}>For local guests playing on this phone</Text>

          {/* Nickname */}
          <View style={modal.fieldGroup}>
            <Text style={modal.fieldLabel}>Nickname</Text>
            <TextInput
              style={modal.input}
              placeholder="Pick a nickname"
              placeholderTextColor={Colors.textDisabled}
              value={name}
              onChangeText={setName}
              maxLength={20}
              returnKeyType="done"
            />
          </View>

          {/* Year of Birth */}
          <View style={modal.fieldGroup}>
            <Text style={modal.fieldLabel}>Competition Year of Birth</Text>
            <TouchableOpacity
              style={modal.yearTrigger}
              activeOpacity={0.7}
              onPress={() => {
                Keyboard.dismiss();
                setYearPickerOpen(true);
              }}
            >
              <Text
                style={[
                  modal.yearTriggerText,
                  birthYear === null && modal.yearTriggerPlaceholder,
                ]}
              >
                {birthYear ?? 'Select year'}
              </Text>
              <Text style={modal.yearTriggerArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Skill Level */}
          <View style={modal.fieldGroup}>
            <Text style={modal.fieldLabel}>Skill Level</Text>
            <View style={modal.skillRow}>
              {ADD_PLAYER_SKILL_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[modal.skillBtn, skill === opt.id && modal.skillBtnActive]}
                  onPress={() => setSkill(opt.id)}
                >
                  <Text style={[modal.skillBtnText, skill === opt.id && modal.skillBtnTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            label="Add to Lobby"
            onPress={handleAdd}
            disabled={!isFormValid}
            variant="primary"
          />
          <TouchableOpacity onPress={onClose} style={modal.cancelBtn}>
            <Text style={modal.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Year picker som conditional overlay (inte nested Modal) */}
        {yearPickerOpen && (
          <View style={modal.yearPickerOverlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setYearPickerOpen(false)}
            />
            <View style={modal.yearPickerSheet}>
              <View style={modal.yearPickerHandle} />
              <Text style={modal.title}>Select Year of Birth</Text>
              <ScrollView style={{ maxHeight: 360 }}>
                {BIRTH_YEARS.map((year) => {
                  const selected = birthYear === year;
                  return (
                    <TouchableOpacity
                      key={year}
                      style={[modal.yearItem, selected && modal.yearItemSelected]}
                      onPress={() => {
                        setBirthYear(year);
                        setYearPickerOpen(false);
                      }}
                    >
                      <Text style={[modal.yearItemText, selected && modal.yearItemTextSelected]}>
                        {year}
                      </Text>
                      {selected && <Text style={modal.yearItemCheck}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <TouchableOpacity onPress={() => setYearPickerOpen(false)} style={modal.cancelBtn}>
                <Text style={modal.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LobbyScreen() {
  const {
    code,
    isHost,
    asGuest,
    guestName,
    guestBirthYear,
    guestSkill,
  } = useLocalSearchParams<{
    code: string;
    isHost: string;
    asGuest?: string;
    guestName?: string;
    guestBirthYear?: string;
    guestSkill?: string;
  }>();
  // Om ingen kod skickas (t.ex. om man öppnar lobby-tabben direkt) genereras en.
  // useMemo ser till att koden är stabil över re-renders.
  const roomCode = useMemo(() => code ?? generateRoomCode(), [code]);
  const hostMode = isHost === 'true';
  const guestMode = asGuest === 'true';

  const [players, setPlayers] = useState<LobbyPlayer[]>(SEED_PLAYERS);

  // Vid mount: kolla om det finns "pending players" från föregående spel
  // (sparat av quiz-skärmen när användaren valde "Yes, keep them" i Play Again-dialogen).
  // Om användaren kommer hit som gäst: lägg in dem som en guest-spelare överst
  // (efter host) så de syns som "you" i listan.
  useEffect(() => {
    consumePendingLobbyPlayers().then((carriedOver) => {
      if (carriedOver && carriedOver.length > 0) {
        setPlayers(carriedOver);
        return;
      }
      if (guestMode && guestName) {
        const currentYear = new Date().getFullYear();
        const age = guestBirthYear ? currentYear - parseInt(guestBirthYear, 10) : undefined;
        const skill = (guestSkill === 'easy' || guestSkill === 'intermediate' || guestSkill === 'expert')
          ? guestSkill
          : 'intermediate';
        const guestPlayer: LobbyPlayer = {
          id: `guest-${Date.now()}`,
          name: guestName,
          emoji: '👤',
          isReady: true,
          type: 'guest',
          age,
          skill,
          hcpComplete: true,
        };
        // Sätt in gästen direkt efter host (index 1) så de syns högt upp.
        setPlayers((prev) => {
          const hostIdx = prev.findIndex((p) => p.isHost);
          const insertAt = hostIdx === -1 ? 0 : hostIdx + 1;
          const next = [...prev];
          next.splice(insertAt, 0, guestPlayer);
          return next;
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Varje gång Lobby får fokus (t.ex. man kommer tillbaka från Profile-tabben):
  // ladda sparad profil och uppdatera host-spelarkortet med profilens värden.
  // Detta gör att ändringar i Profile (nickname, ålder, skill, avatar) slår
  // igenom direkt på host-kortet i Lobby.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadProfile().then((profile) => {
        if (!active || !profile) return;
        setPlayers((prev) =>
          prev.map((p) => (p.isHost ? mergeProfileIntoHost(p, profile) : p)),
        );
      });
      return () => {
        active = false;
      };
    }, []),
  );
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [eraValues, setEraValues] = useState([1980, 2010]);
  const [region, setRegion] = useState<Region>('Sweden');
  const [regionModalOpen, setRegionModalOpen] = useState(false);

  // Share invite modal
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [invitedFriendIds, setInvitedFriendIds] = useState<Set<string>>(new Set());

  // Master "Approve All"-state — återställs automatiskt till 'no' när
  // waiting-listan blivit tom (efter approve all eller när ingen väntar).
  const [approveAllValue, setApproveAllValue] = useState<'no' | 'yes'>('no');

  // Game mode toggle (Pass-the-Phone vs Multiplayer Individual Devices)
  const [gameMode, setGameMode] = useState<GameMode>('pass-the-phone');
  // YouTube är alltid tillgänglig som källa, men host kan slå av/på manuellt
  // via en toggle. Default = på. Skickas till alla via lobbyns state.
  const [youtubeEnabled, setYoutubeEnabled] = useState(true);
  // Host-override för Spotify ovanpå auto-regeln (alla spelare måste ha
  // Spotify-konto). Spotify visas som Enabled bara om både auto OCH toggle är på.
  const [spotifyHostToggle, setSpotifyHostToggle] = useState(true);
  // Profiles and Places styrs helt av host-toggeln. Default = på.
  const [profilesEnabled, setProfilesEnabled] = useState(true);
  // Use Packages — Basic är default på. Att välja minst ett extra-paket
  // avaktiverar Basic; att åter-aktivera Basic avaktiverar alla extras.
  // Knytningen mellan packages och room-code är implicit (lobby-state).
  const [useBasicPackage, setUseBasicPackage] = useState(true);
  const [selectedExtraPackages, setSelectedExtraPackages] = useState<string[]>([]);

  const handleToggleBasic = () => {
    if (useBasicPackage) {
      setUseBasicPackage(false);
    } else {
      setUseBasicPackage(true);
      setSelectedExtraPackages([]);
    }
  };

  const handleToggleExtraPackage = (id: string) => {
    setSelectedExtraPackages((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((p) => p !== id);
        // Om sista extra-paketet just avaktiverades — auto-aktivera Basic
        // så det alltid finns minst en aktiv källa.
        if (next.length === 0) setUseBasicPackage(true);
        return next;
      }
      // Att markera ett extra-paket auto-avaktiverar Basic
      setUseBasicPackage(false);
      return [...prev, id];
    });
  };
  // TODO (Store integration): koppla till riktig köpstatus när Store-paketet är inkopplat.
  const hasMultiplayerPackage = false;

  const handleSelectMode = (mode: GameMode) => {
    if (mode === gameMode) return;
    if (mode === 'individual-devices' && !hasMultiplayerPackage) {
      Alert.alert(
        'Premium feature',
        'Multiplayer on individual devices requires the "Multiplayer Individual Devices" package. Get it in the Store?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Store', onPress: () => router.push('/store') },
        ],
      );
      return;
    }
    // Vid byte till Individual Devices: varna om host har manuellt tillagda
    // spelare. De saknar egen mobil och måste tas bort när alla ska spela
    // från sina egna enheter.
    if (mode === 'individual-devices') {
      const manualPlayers = players.filter((p) => p.addedByHost);
      if (manualPlayers.length > 0) {
        Alert.alert(
          'Switch to Individual Devices?',
          'Manual added players will be removed — ask them to join with their own device.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Switch & remove',
              style: 'destructive',
              onPress: () => {
                setPlayers((prev) => prev.filter((p) => !p.addedByHost));
                setGameMode(mode);
              },
            },
          ],
        );
        return;
      }
    }
    setGameMode(mode);
  };

  // Approved spelare = i spelet, har turn-nummer, syns överst.
  // Host räknas alltid som approved oavsett approved-flaggans värde.
  // Alla spelare som hamnar i lobbyn har komplett HCP (sätts vid Join as
  // Guest eller importeras automatiskt för registrerade användare) — så
  // det finns ingen "missing info"-grupp längre.
  const isPlayerApproved = (p: LobbyPlayer) => !!p.approved || !!p.isHost;
  const approvedPlayers = players.filter((p) => isPlayerApproved(p));
  const waitingForApproval = players.filter((p) => !isPlayerApproved(p));
  // Spotify-kravet beror på Game Mode:
  //  • Pass-the-Phone — låtar spelas lokalt på en enda enhet, så Spotify
  //    är alltid auto-Enabled i detta läge. Info-ikonen visas ändå med
  //    kriterierna så användaren förstår förutsättningarna.
  //  • Individual Devices — varje spelare streamar låtarna på sin egen
  //    telefon, så ALLA godkända spelare behöver ett Spotify-konto.
  // Host kan ovanpå auto-regeln manuellt slå av via spotifyHostToggle;
  // visad status = auto AND host-toggle. Info-ikonen visas alltid i båda
  // lägena (enabled som disabled) med samma rules-text — så att användaren
  // alltid kan kontrollera vilket kriterium som gäller per Game Mode.
  const spotifyAutoEnabled =
    gameMode === 'pass-the-phone'
      ? true
      : approvedPlayers.length > 0 &&
        approvedPlayers.every((p) => p.spotifyConnected === true);
  const spotifyEnabled = spotifyAutoEnabled && spotifyHostToggle;
  const { from: clampedFrom, to: clampedTo, warning: eraWarning } = clampEraToPlayer(eraValues[0], eraValues[1], players);

  const handleAddPlayer = (name: string, age: number, skill: AddPlayerSkill) => {
    setPlayers((prev) => [
      ...prev,
      {
        id: `guest-${Date.now()}`,
        name,
        emoji: '👤',
        isReady: true,
        type: 'guest',
        age,
        skill,
        hcpComplete: true,
        addedByHost: true,
      },
    ]);
  };
  const handleSetApproved = (id: string, approved: boolean) => {
    setPlayers((prev) => prev.map((p) => p.id === id ? { ...p, approved } : p));
  };
  const handleApproveAll = () => {
    setPlayers((prev) => prev.map((p) => p.hcpComplete ? { ...p, approved: true } : p));
  };
  const movePlayer = (id: string, dir: 'up' | 'down') => {
    setPlayers((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      const next = dir === 'up' ? idx - 1 : idx + 1;
      if (idx === -1 || next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  };
  // Öppnar Share invite-modalen och laddar in den senaste friends-listan.
  const handleOpenShareModal = async () => {
    setInvitedFriendIds(new Set());
    setShareModalOpen(true);
    const list = await loadFriends();
    setFriends(list);
  };

  // Skickar invite in-app till en vän — sparas i deras Waiting Invites.
  // Använder hostens profil-nickname/avatar som "from"-data.
  const handleInviteFriend = async (friend: Friend) => {
    const profile = await loadProfile();
    const fromNickname = profile?.nickname?.trim() || 'Host';
    await addInvite({
      roomCode,
      fromNickname,
      fromAvatarId: profile?.selectedAvatarId,
    });
    setInvitedFriendIds((prev) => {
      const next = new Set(prev);
      next.add(friend.id);
      return next;
    });
  };

  // Befintliga OS-level share-flödet (SMS/WhatsApp/Messenger osv).
  const handleShareViaOS = async () => {
    setShareModalOpen(false);
    try {
      await Share.share({ message: `Join my QuizVibe game! Room code: ${roomCode}` });
    } catch {
      // tyst — användaren avbröt
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Game Lobby</Text>
        </View>

        <Card style={styles.roomCard} padding={Spacing.xl}>
          {hostMode && <View style={styles.hostBadge}><Text style={styles.hostBadgeText}>👑 You are the host</Text></View>}
          <Text style={styles.roomLabel}>Room Code</Text>
          <Text style={styles.roomCode}>{roomCode}</Text>
          {/* Share invite är host-only — bara host bjuder in nya spelare */}
          {hostMode && (
            <TouchableOpacity onPress={handleOpenShareModal} style={styles.shareBtn}>
              <Text style={styles.shareBtnText}>↑ Share invite</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* ── Game Settings ───────────────────────────────────────
            Game Mode + Game Connections delar en gemensam blåbordrad
            container. Ger semantiskt en "vad spelet ska spelas som"-sektion
            som visuellt skiljer sig från Players in Lobby nedanför. */}
        <View style={styles.gameSettingsBorder}>
        {/* ── Game Mode ─────────────────────────────────────────── */}
        {/* Visas för alla i lobbyn, men kan bara *ändras* av host. För icke-host
            döljs FREE/PREMIUM-badges (de är host-relevanta paketdetaljer) och
            det aktiva läget får istället den blå "lit" kanten — samma primary-
            färg som startskärmens knappar — så att det aktuella host-valet
            tydligt sticker ut utan att se ut som en interaktiv toggle. */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Game Mode
            {!hostMode && <Text style={styles.sectionHint}> – defined by Host</Text>}
          </Text>

          <View style={styles.modeToggle}>
            {/* Pass-the-Phone */}
            <TouchableOpacity
              style={[
                styles.modeOption,
                gameMode === 'pass-the-phone'
                  ? (hostMode ? styles.modeOptionPassActive : styles.modeOptionIndivActive)
                  : styles.modeOptionInactive,
              ]}
              onPress={() => handleSelectMode('pass-the-phone')}
              disabled={!hostMode}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.modeLabel,
                gameMode === 'pass-the-phone' && styles.modeLabelActiveFree,
              ]}>
                Pass-the-Phone
              </Text>
              {hostMode && gameMode === 'pass-the-phone' && (
                <View style={styles.freeBadge} pointerEvents="none">
                  <Text style={styles.freeBadgeText}>FREE</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Individual Devices — premium-låst för host (paketkrav). För icke-host
                visas blå "lit" kant när läget är aktivt, oavsett deras egna paket. */}
            <TouchableOpacity
              style={[
                styles.modeOption,
                gameMode === 'individual-devices' && (hostMode ? hasMultiplayerPackage : true)
                  ? styles.modeOptionIndivActive
                  : styles.modeOptionInactive,
              ]}
              onPress={() => handleSelectMode('individual-devices')}
              disabled={!hostMode}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.modeLabel,
                gameMode === 'individual-devices' && (
                  hostMode
                    ? hasMultiplayerPackage && styles.modeLabelActive
                    : styles.modeLabelActiveFree
                ),
              ]}>
                Individual Devices
              </Text>
              {hostMode && !(gameMode === 'individual-devices' && hasMultiplayerPackage) && (
                <View
                  style={[styles.premiumBadge, !hasMultiplayerPackage && styles.premiumBadgeGrey]}
                  pointerEvents="none"
                >
                  <Text
                    style={[styles.premiumBadgeText, !hasMultiplayerPackage && styles.premiumBadgeTextGrey]}
                  >
                    PREMIUM
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.modeDescription}>
            {gameMode === 'pass-the-phone'
              ? 'Players take turns answering on this single device. Free.'
              : 'Each player plays simultaneously on their own phone. Requires the Multiplayer Individual Devices package.'}
          </Text>
        </View>

        {/* ── Game Connections ─────────────────────────────────── */}
        {/* Visar vilka källor spelet drar frågor från. Vänsterjusterad lista
            med färgade brand-badges (samma mönster som Spotify-kortet på
            Profile-sidan, fast i kompakt list-format). */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Game Connections</Text>
          <View style={styles.connectionsList}>
            {/* YouTube — alltid tillgänglig, host kan toggla av/på manuellt.
                Enabled-pillen får grön kantlinje + FREE-badge (samma border-
                skärande badge-mönster som Pass-the-Phone-knappen). Switchen
                till höger är host-only och får grön track när på, röd när av.
                Pilen i YouTube-loggan är en CSS-triangel (border-trick) så
                den alltid är vit oavsett emoji-rendering på iOS vs Android. */}
            <View style={styles.connectionRow}>
              <View style={[styles.connectionIconWrap, styles.connectionIconYoutube]}>
                <View style={styles.connectionIconYoutubeRect}>
                  <View style={styles.connectionIconYoutubeArrow} />
                </View>
              </View>
              <Text style={styles.connectionLabel}>YouTube</Text>
              {youtubeEnabled ? (
                <View style={styles.youtubeEnabledPill}>
                  <Text style={styles.youtubeEnabledText}>Enabled</Text>
                  <View style={styles.freeBadgeSmall} pointerEvents="none">
                    <Text style={styles.freeBadgeTextSmall}>FREE</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.statusPillDisabled}>
                  <Text style={styles.statusPillTextDisabled}>Disabled</Text>
                </View>
              )}
              <Switch
                value={youtubeEnabled}
                onValueChange={setYoutubeEnabled}
                disabled={!hostMode}
                trackColor={{ false: Colors.error, true: Colors.success }}
                thumbColor="#FFF"
                ios_backgroundColor={Colors.error}
                style={styles.connectionSwitch}
              />
            </View>
            <View style={styles.connectionRow}>
              <View style={[styles.connectionIconWrap, styles.connectionIconSpotify]}>
                <Text style={styles.connectionIconGlyph}>🎵</Text>
              </View>
              <Text style={styles.connectionLabel}>Spotify</Text>
              <View style={spotifyEnabled ? styles.statusPillEnabled : styles.statusPillDisabled}>
                <Text style={spotifyEnabled ? styles.statusPillTextEnabled : styles.statusPillTextDisabled}>
                  {spotifyEnabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
              {/* Info-ikonen visas alltid (oavsett mode och enabled/disabled-
                  state) med samma rules-text. Användaren ska alltid kunna
                  kontrollera kriterierna för båda Game Modes. */}
              <TouchableOpacity
                style={styles.infoIconBtn}
                onPress={() =>
                  Alert.alert(
                    'Spotify requirements',
                    'Pass-the-Phone — Host needs to have a Spotify account activated in Profile.\n\nIndividual Devices — All Players need to have a Spotify account activated in their Profiles.',
                  )
                }
                hitSlop={8}
                accessibilityLabel="Spotify requirements"
              >
                <Text style={styles.infoIconText}>i</Text>
              </TouchableOpacity>
              <Switch
                value={spotifyHostToggle}
                onValueChange={setSpotifyHostToggle}
                // Locked för icke-host (read-only) ELLER när auto-regeln
                // inte uppfylls (alla godkända måste ha Spotify-konto).
                // Vid auto-disable visas en mörkgrå track och ljusgrå thumb
                // istället för röd/grön-paletten, för att tydligt signalera
                // "ej tillgänglig". För icke-host med auto-enabled visas
                // togglens färg matching host-valet — bara icke-interaktiv.
                disabled={!hostMode || !spotifyAutoEnabled}
                trackColor={
                  spotifyAutoEnabled
                    ? { false: Colors.error, true: Colors.success }
                    : { false: '#3A3F4B', true: '#3A3F4B' }
                }
                thumbColor={spotifyAutoEnabled ? '#FFF' : '#9CA3AF'}
                ios_backgroundColor={spotifyAutoEnabled ? Colors.error : '#3A3F4B'}
                style={styles.connectionSwitch}
              />
            </View>

            {/* Use Packages — sub-block under Spotify för musikpaket-val.
                Basic är gratis och alltid tillgängligt. Extra packages är
                köpta paket från QuizVibe Store. Basic OCH extras är ömsesidigt
                uteslutande: aktivera ett extra → Basic avaktiveras (FREE-badge
                gråas); aktivera Basic igen → alla extras avaktiveras. För
                icke-host visas allt read-only (disabled på TouchableOpacity). */}
            <View style={styles.usePackagesBlock}>
              <TouchableOpacity
                style={[
                  styles.packageChipBasic,
                  useBasicPackage ? styles.packageChipBasicActive : styles.packageChipBasicInactive,
                  !spotifyEnabled && styles.packageChipDimmed,
                ]}
                onPress={handleToggleBasic}
                disabled={!hostMode || !spotifyEnabled}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.packageChipBasicText,
                    !useBasicPackage && styles.packageChipBasicTextInactive,
                  ]}
                >
                  Basic
                </Text>
                <View
                  style={[styles.freeBadge, !useBasicPackage && styles.packageFreeBadgeGrey]}
                  pointerEvents="none"
                >
                  <Text
                    style={[styles.freeBadgeText, !useBasicPackage && styles.packageFreeBadgeTextGrey]}
                  >
                    FREE
                  </Text>
                </View>
              </TouchableOpacity>

              <Text style={styles.extraPackagesLabel}>Extra packages:</Text>

              <View style={styles.extraPackagesGrid}>
                {/* "Buy Extra packages" är alltid första chip i grid:en —
                    oavsett om host köpt paket eller ej. Klick navigerar
                    till QuizVibe Store. PREMIUM-badgen i grått markerar
                    att paketen är köp-låsta. */}
                <TouchableOpacity
                  style={[
                    styles.packageChip,
                    styles.packageChipExtra,
                    styles.packageChipInactive,
                    !spotifyEnabled && styles.packageChipDimmed,
                  ]}
                  onPress={() => router.push('/(tabs)/store')}
                  disabled={!hostMode || !spotifyEnabled}
                  activeOpacity={0.7}
                >
                  <Text style={styles.packageChipText} numberOfLines={1}>
                    Buy Extra packages
                  </Text>
                  <View style={styles.packagePremiumBadgeGrey} pointerEvents="none">
                    <Text style={styles.packagePremiumBadgeGreyText}>PREMIUM</Text>
                  </View>
                </TouchableOpacity>
                {PURCHASED_PACKAGES.map((pkg) => {
                  const isSelected = selectedExtraPackages.includes(pkg.id);
                  return (
                    <TouchableOpacity
                      key={pkg.id}
                      style={[
                        styles.packageChip,
                        styles.packageChipExtra,
                        isSelected ? styles.packageChipExtraActive : styles.packageChipInactive,
                        !spotifyEnabled && styles.packageChipDimmed,
                      ]}
                      onPress={() => handleToggleExtraPackage(pkg.id)}
                      disabled={!hostMode || !spotifyEnabled}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.packageChipText, isSelected && styles.packageChipTextActive]}>
                        {pkg.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* AI — mörkblå cirkel med blå primary-border och italiserad "AI"-text. */}
            <View style={styles.connectionRow}>
              <View style={[styles.connectionIconWrap, styles.connectionIconAi]}>
                <Text style={styles.connectionIconAiText}>AI</Text>
              </View>
              <Text style={styles.connectionLabel}>Profiles and Places</Text>
              <Switch
                value={profilesEnabled}
                onValueChange={setProfilesEnabled}
                disabled={!hostMode}
                trackColor={{ false: Colors.error, true: Colors.success }}
                thumbColor="#FFF"
                ios_backgroundColor={Colors.error}
                style={styles.connectionSwitch}
              />
            </View>
          </View>
        </View>
        </View>{/* /gameSettingsBorder */}

        {/* ── Players in Lobby ─────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>Players in Lobby</Text>
            <View style={styles.sectionRowRight}>
              <Text style={styles.sectionMeta}>{approvedPlayers.length}/{players.length} approved</Text>
              {hostMode && gameMode === 'pass-the-phone' && (
                <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalVisible(true)}>
                  <Text style={styles.addBtnText}>+ Add Player</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {gameMode === 'pass-the-phone' && approvedPlayers.length > 0 && (
            <Text style={styles.turnOrderHint}>
              Turn order — top plays first. Use ↑↓ to reorder.
            </Text>
          )}

          <View style={styles.playerBoard}>
            {/* Approved spelare = i spelet, har turn-nummer.
                Host ser toggle på övriga approved (men inte sig själv). */}
            {approvedPlayers.map((player, index) => (
              <PlayerRow
                key={player.id}
                player={player}
                index={players.indexOf(player)}
                onMoveUp={() => movePlayer(player.id, 'up')}
                onMoveDown={() => movePlayer(player.id, 'down')}
                canMoveUp={index > 0}
                canMoveDown={index < approvedPlayers.length - 1}
                hcpComplete={player.hcpComplete}
                age={player.age}
                skill={player.skill}
                isHostPlayer={player.isHost}
                isGuest={player.type === 'guest'}
                turnNumber={gameMode === 'pass-the-phone' ? index + 1 : undefined}
                showApproveToggle={hostMode && !player.isHost}
                approved={true}
                onApproveChange={(next) => handleSetApproved(player.id, next)}
              />
            ))}

            {/* Waiting-for-approval section: divider + master toggle + spelarkort */}
            {waitingForApproval.length > 0 && (
              <View style={styles.waitingSection}>
                <Text style={styles.waitingSectionLabel}>
                  To be Approved by Host
                </Text>

                {/* Master "Approve All"-toggle — bara host ser/använder den.
                    Drar host till Yes godkänns alla aktuellt väntande spelare. */}
                {hostMode && waitingForApproval.length > 0 && (
                  <View style={styles.approveAllRow}>
                    <ApproveToggle
                      label="Approve All"
                      value={approveAllValue}
                      onChange={(next) => {
                        setApproveAllValue(next);
                        if (next === 'yes') {
                          handleApproveAll();
                          // Reset till 'no' så toggleln åter visas i No-läge
                          // när nya spelare hamnar i listan i framtiden.
                          setTimeout(() => setApproveAllValue('no'), 400);
                        }
                      }}
                    />
                  </View>
                )}

                {waitingForApproval.map((player) => (
                  <PlayerRow
                    key={player.id}
                    player={player}
                    index={players.indexOf(player)}
                    hcpComplete={player.hcpComplete}
                    age={player.age}
                    skill={player.skill}
                    isHostPlayer={false}
                    isGuest={player.type === 'guest'}
                    showApproveToggle={hostMode}
                    approved={false}
                    onApproveChange={(next) => handleSetApproved(player.id, next)}
                  />
                ))}
              </View>
            )}

          </View>
        </View>

        {/* ── Quiz Settings ───────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Quiz Settings</Text>

          <Card padding={Spacing.lg}>
            <Text style={styles.cardTitle}>🕐 Game Era</Text>
            <Text style={styles.cardSubtitle}>Set the time span for questions</Text>
            <View style={styles.eraDisplay}>
              <Text style={styles.eraDisplayYear}>{clampedFrom}</Text>
              <Text style={styles.eraDisplayDash}>–</Text>
              <Text style={styles.eraDisplayYear}>{clampedTo}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <MultiSlider
                values={eraValues}
                min={ERA_MIN}
                max={ERA_MAX}
                step={1}
                onValuesChange={(vals) => setEraValues(vals)}
                selectedStyle={{ backgroundColor: Colors.primary }}
                unselectedStyle={{ backgroundColor: Colors.border }}
                markerStyle={{ backgroundColor: Colors.primary, borderColor: Colors.background, borderWidth: 2, width: 22, height: 22 }}
                trackStyle={{ height: 4, borderRadius: 2 }}
                containerStyle={{ alignSelf: 'center' }}
                sliderLength={SLIDER_WIDTH}
              />
              <DecadeMarks />
            </View>
            {eraWarning && <View style={styles.eraWarning}><Text style={styles.eraWarningText}>⚠️ {eraWarning}</Text></View>}
          </Card>

          <Card padding={Spacing.lg}>
            <Text style={styles.cardTitle}>🌍 Region Scope</Text>
            <Text style={styles.cardSubtitle}>Sets the cultural context for questions</Text>
            <TouchableOpacity
              style={styles.regionTrigger}
              activeOpacity={0.7}
              onPress={() => { if (hostMode) setRegionModalOpen(true); }}
            >
              <Text style={{ fontSize: 18 }}>{REGION_FLAGS[region]}</Text>
              <Text style={styles.regionTriggerText}>{region}</Text>
              <Text style={{ fontSize: 14, color: Colors.textSecondary }}>⌄</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* ── Start game ──────────────────────────────────────── */}
        <View style={styles.startSection}>
          <Button
            label="Start Game"
            onPress={() => router.push({ pathname: '/quiz', params: { skill: 'intermediate', age: '32' } })}
            variant="primary"
          />
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Alla modaler utanför ScrollView */}
      <AddPlayerModal visible={addModalVisible} onClose={() => setAddModalVisible(false)} onAdd={handleAddPlayer} />
      <RegionModal
        visible={regionModalOpen}
        value={region}
        onChange={setRegion}
        onClose={() => setRegionModalOpen(false)}
      />

      {/* ── Share invite modal ──────────────────────────────────── */}
      <Modal
        visible={shareModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setShareModalOpen(false)}
      >
        <View style={shareSheet.overlay}>
          <TouchableOpacity
            style={shareSheet.backdrop}
            activeOpacity={1}
            onPress={() => setShareModalOpen(false)}
          />
          <View style={shareSheet.container}>
            <View style={shareSheet.handle} />
            <Text style={shareSheet.title}>Share invite</Text>
            <Text style={shareSheet.subtitle}>
              Send to QuizVibe friends or share by other means.
            </Text>

            {/* QuizVibe friends list */}
            <Text style={shareSheet.sectionLabel}>QuizVibe friends</Text>
            {friends.length === 0 ? (
              <View style={shareSheet.emptyState}>
                <Text style={shareSheet.emptyText}>No friends saved yet</Text>
                <Text style={shareSheet.emptySubtext}>
                  Add friends in Profile to invite them with one tap.
                </Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 260 }}>
                {friends.map((friend, i) => {
                  const invited = invitedFriendIds.has(friend.id);
                  return (
                    <View key={friend.id}>
                      <View style={shareSheet.friendRow}>
                        <Text style={shareSheet.friendEmoji}>
                          {getAvatarEmojiById(friend.avatarId)}
                        </Text>
                        <Text style={shareSheet.friendName}>{friend.nickname}</Text>
                        <TouchableOpacity
                          onPress={() => handleInviteFriend(friend)}
                          disabled={invited}
                          style={[
                            shareSheet.inviteBtn,
                            invited && shareSheet.inviteBtnDone,
                          ]}
                        >
                          <Text
                            style={[
                              shareSheet.inviteBtnText,
                              invited && shareSheet.inviteBtnTextDone,
                            ]}
                          >
                            {invited ? '✓ Invited' : 'Invite'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {i < friends.length - 1 && <View style={shareSheet.divider} />}
                    </View>
                  );
                })}
              </ScrollView>
            )}

            {/* OS share fallback */}
            <View style={shareSheet.divider} />
            <TouchableOpacity onPress={handleShareViaOS} style={shareSheet.osShareRow}>
              <Text style={shareSheet.osShareIcon}>📤</Text>
              <View style={{ flex: 1 }}>
                <Text style={shareSheet.osShareTitle}>Share via SMS, WhatsApp…</Text>
                <Text style={shareSheet.osShareSubtitle}>
                  Send the room code to anyone outside QuizVibe
                </Text>
              </View>
              <Text style={shareSheet.osShareArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShareModalOpen(false)}
              style={shareSheet.closeBtn}
            >
              <Text style={shareSheet.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.xxl, gap: Spacing.xl },

  header: { gap: 4 },
  screenTitle: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },

  hostBadge: { backgroundColor: Colors.primaryMuted, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 4, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.primaryBorder },
  hostBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.primary },

  roomCard: { alignItems: 'center' },
  roomLabel: { ...Typography.overline, color: Colors.textSecondary, marginBottom: Spacing.sm },
  roomCode: { ...Typography.display, color: Colors.textPrimary, fontVariant: ['tabular-nums'] },
  shareBtn: { marginTop: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full, backgroundColor: Colors.primaryMuted, borderWidth: 1, borderColor: Colors.primaryBorder },
  shareBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.primary },

  section: { gap: Spacing.sm },

  // Wrapper-container runt Game Mode + Game Connections — markerar dem som
  // en sammanhängande "spelregler"-grupp. Använder samma kort-bakgrund
  // (Colors.card + diskret border) som playerBoard nedanför, så de två
  // grupperingarna visuellt matchar varandra.
  gameSettingsBorder: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },

  // Game Mode toggle (Pass-the-Phone vs Individual Devices) — yttre container
  // som håller två permanenta inre rutor side-by-side.
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 46,
    gap: 4,
  },
  // Bas-stil för båda inre rutorna. Konkret kant-/bg-färg sätts av varianterna nedan.
  modeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  // Inaktiv ruta — svag grå kantlinje, transparent bg. Används för båda alternativen
  // när de inte är valda (samt för Individual Devices så länge premium saknas).
  modeOptionInactive: {
    borderColor: Colors.borderStrong,
    backgroundColor: 'transparent',
  },
  // Pass-the-Phone aktiv (gratis-läge) — grön kant, muted bg.
  modeOptionPassActive: {
    borderColor: Colors.success,
    backgroundColor: Colors.primaryMuted,
  },
  // Individual Devices aktiv MED premium — "lit" blå kant (samma som
  // startskärmens primary-knappar), muted bg.
  modeOptionIndivActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  // FREE-badge som skär den gröna kantlinjen — samma teknik som HOST-taggen i
  // PlayerRow och Register-knappen i Profile-menyn.
  freeBadge: {
    position: 'absolute',
    top: -8,
    right: Spacing.sm,
    backgroundColor: Colors.success,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 10,
    elevation: 4,
  },
  freeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.6,
  },
  // PREMIUM-badge i guld — markerar att Individual Devices kräver paketet.
  // Försvinner när användaren har premium aktivt.
  premiumBadge: {
    position: 'absolute',
    top: -8,
    right: Spacing.sm,
    backgroundColor: '#F5A623',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 10,
    elevation: 4,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.6,
  },
  // Grå variant av PREMIUM-badge — appliceras när host inte köpt paketet än.
  // Guld signalerar "tillgängligt", grått signalerar "låst tills du köper".
  premiumBadgeGrey: {
    backgroundColor: '#6B7280',
  },
  premiumBadgeTextGrey: {
    color: '#FFF',
  },
  modeLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  modeLabelActive: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  // Aktiv label-stil för Pass-the-Phone när läget är gratis (grön pill).
  // Vit text för bättre kontrast mot den muted bakgrunden + grön kantlinje.
  modeLabelActiveFree: {
    color: '#FFF',
    fontWeight: FontWeight.semibold,
  },
  modeDescription: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.xs,
    lineHeight: 17,
  },

  // Game Connections — vänsterjusterad lista över källor (YouTube/Spotify/AI VIBE).
  // Varje rad har en färgad brand-badge (samma mönster som Profile-sidans
  // Spotify-ikon: rundad, brand-färgad bakgrund med emoji centrerad inuti)
  // i kompakt list-format.
  connectionsList: {
    // Stretch så varje rad fyller hela bredden — gör att switchar kan
    // höger-justeras med marginLeft:'auto'.
    alignItems: 'stretch',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  connectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // YouTube "Enabled"-pill: grön kantlinje + muted bg + vit text, med
  // FREE-badge som skär kantlinjen i toppen (samma border-skärande badge-
  // mönster som Pass-the-Phone-knappen i Game Mode-toggle). Pillen måste
  // vara position:relative och får inte ha overflow:hidden — annars klipps
  // FREE-badgen som sticker upp 8px ovanför pillen.
  youtubeEnabledPill: {
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.success,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    marginLeft: Spacing.xs,
    position: 'relative',
    // Matchar statusPillEnabled/Disabled så pillar linjerar mellan raderna.
    minWidth: 80,
    alignItems: 'center',
  },
  youtubeEnabledText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: '#FFF',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  // Mindre variant av freeBadge för den kompakta YouTube-pillen, så texten
  // "Enabled" inte täcks. Samma teknik som freeBadge men med mindre padding,
  // mindre fontstorlek och något lägre top-offset.
  freeBadgeSmall: {
    position: 'absolute',
    top: -7,
    right: 4,
    backgroundColor: Colors.success,
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
    zIndex: 10,
    elevation: 4,
  },
  freeBadgeTextSmall: {
    fontSize: 8,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.5,
  },
  // Switchen är default ganska stor; krymp till 80% så den passar i list-raden.
  // marginLeft:'auto' pressar switchen till höger kant — övriga element
  // (ikon, label, ev. status-pill) hålls grupperade till vänster.
  connectionSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    marginLeft: 'auto',
  },
  // YouTube: vit cirkel + röd rundad rektangel inuti + vit playpil (CSS-triangel).
  connectionIconYoutube: { backgroundColor: '#FFFFFF' },
  connectionIconYoutubeRect: {
    width: 18,
    height: 13,
    borderRadius: 3,
    backgroundColor: '#FF0000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionIconYoutubeArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderTopWidth: 3.5,
    borderBottomWidth: 3.5,
    borderLeftColor: '#FFFFFF',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 1, // optisk centrering — pilen ser balanserad ut mot röd bg
  },
  // Spotify: brand-grön cirkel med 🎵 (samma färg som Profile-sidans icon-wrap).
  connectionIconSpotify: { backgroundColor: '#1DB954' },
  connectionIconGlyph: { fontSize: 14 },
  // AI: mörk navy bakgrund (theme background) med primary-blå border + text.
  connectionIconAi: {
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  connectionIconAiText: {
    fontSize: 11,
    fontWeight: '800',
    fontStyle: 'italic',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  // Status-pill för "Enabled"/"Disabled" bredvid en Game Connection.
  // Fast minWidth så Enabled/Disabled-pillar (och YouTubes Enabled-pill)
  // får samma bredd och linjerar visuellt mellan raderna.
  statusPillEnabled: {
    // Bakgrund + border matchar YouTubes Enabled-pill: blå-tonad muted bg
    // (Colors.primaryMuted) och solid grön kantlinje (Colors.success).
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.success,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    marginLeft: Spacing.xs,
    minWidth: 80,
    alignItems: 'center',
  },
  statusPillDisabled: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    marginLeft: Spacing.xs,
    minWidth: 80,
    alignItems: 'center',
  },
  statusPillTextEnabled: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: '#FFF',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  statusPillTextDisabled: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  // Use Packages — sub-block under Spotify för musikpaket-val. Vänsterställt
  // mot connectionsList-kanten så "Extra packages:"-labeln och chipsen börjar
  // på samma x-position som ikonerna på YouTube/Spotify-raderna ovanför.
  usePackagesBlock: {
    gap: Spacing.sm,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  usePackagesLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  extraPackagesLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  // Chip-stil för Extra packages + Buy-CTA. Höjd och border-radius matchar
  // Individual Devices-knappen i Game Mode-toggle:n (height 40, Radius.sm).
  // Position:relative så att PREMIUM-badgen kan sticka upp över kantlinjen
  // — samma teknik som badge:n på Individual Devices.
  packageChip: {
    alignSelf: 'flex-start',
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: 1,
    position: 'relative',
  },
  // Basic-chip — matchar Individual Devices-knappen och Extra-package-chipsen
  // i höjd (40), borderRadius (Radius.sm), textstorlek (FontSize.sm) OCH
  // bredd (48% — samma som chipsen i extraPackagesGrid).
  // Position:relative så FREE-badgen kan sticka upp över kantlinjen.
  packageChipBasic: {
    width: '48%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: 1,
    position: 'relative',
  },
  // Basic aktiv = grön kantlinje (samma som Pass-the-Phone) + muted blå bg.
  packageChipBasicActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.success,
  },
  // Basic inaktiv — matchar Spotifys Disabled-pill (faint white bg, border).
  packageChipBasicInactive: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: Colors.border,
  },
  packageChipBasicText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: '#FFF',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  packageChipBasicTextInactive: {
    color: Colors.textSecondary,
  },
  // Extra package aktiv = blå primary-kant (samma som Individual Devices).
  packageChipExtraActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  packageChipInactive: {
    backgroundColor: 'transparent',
    borderColor: Colors.border,
  },
  // Utgråad chip — appliceras på alla package-chips (Basic, Buy, Extras)
  // när Spotify självt är Disabled (auto-regeln ej uppfylld eller host-toggle
  // av). Paketval är meningslöst i det läget eftersom låtarna inte spelas.
  packageChipDimmed: {
    opacity: 0.4,
  },
  packageChipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  packageChipTextActive: {
    color: '#FFF',
    fontWeight: FontWeight.semibold,
  },
  packageChipEmoji: { fontSize: 14 },
  // 2-kolumners grid för köpta extra packages. justifyContent:'space-between'
  // på rad-nivå pressar vänster chip mot vänsterkanten och höger chip mot
  // högerkanten; det horisontella mellanrummet bestäms av att chipsen är
  // ~48% breda. rowGap ger vertikalt mellanrum vid wrap (3+ paket).
  extraPackagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.sm,
  },
  // Extra-chip-modifier: överskuggar packageChip.alignSelf och låser bredden
  // till 48% så två ryms per rad. Innehållet (paketnamnet) centreras.
  packageChipExtra: {
    alignSelf: 'auto',
    width: '48%',
    justifyContent: 'center',
  },
  // Basic-chipens FREE-badge använder freeBadgeSmall + freeBadgeTextSmall
  // (samma som YouTubes Enabled-pill). När Basic är inaktivt appliceras
  // dessa grå-overrides ovanpå för att signalera "host har valt extras".
  packageFreeBadgeGrey: {
    backgroundColor: '#6B7280',
  },
  packageFreeBadgeTextGrey: {
    color: Colors.textSecondary,
  },
  // Grå PREMIUM-badge — markerar att paketen är köp-låsta. Skiljer sig
  // från den guldgula premiumBadge ovan (som markerar Multiplayer-paketet).
  packagePremiumBadgeGrey: {
    position: 'absolute',
    top: -8,
    right: Spacing.sm,
    backgroundColor: '#6B7280',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 10,
    elevation: 4,
  },
  packagePremiumBadgeGreyText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.6,
  },

  // Liten info-knapp ("i" i en cirkel) bredvid en Disabled-pill — tap visar
  // en Alert med förklaringen istället för att alltid skriva ut texten.
  infoIconBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
  infoIconText: {
    fontSize: 12,
    fontWeight: '700',
    fontStyle: 'italic',
    color: Colors.textSecondary,
    lineHeight: 14,
  },
  connectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    // Reservera samma horisontella utrymme för alla labels så efterföljande
    // status-pillar (YouTubes Enabled / Spotifys Disabled) linjerar exakt
    // under varandra trots att t.ex. "YouTube" och "Spotify" har olika
    // pixel-bredd i proportionell font. "Profiles and Places" är längre
    // och bryter naturligt över denna minWidth — vilket är OK eftersom
    // den raden inte har någon pill. Värdet är knappt över bredden på
    // "YouTube"/"Spotify" så pillarna sitter tätt mot texten.
    minWidth: 60,
  },

  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xs },
  sectionRowRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  sectionLabel: { ...Typography.overline, color: Colors.textSecondary },
  sectionHint: { fontSize: FontSize.xs, color: Colors.textSecondary, fontStyle: 'italic' },
  sectionMeta: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.primary },
  addBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.md, backgroundColor: Colors.primaryMuted, borderWidth: 1, borderColor: Colors.primaryBorder },
  addBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.primary },

  playerBoard: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.md, gap: Spacing.xs },
  turnOrderHint: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.xs,
    paddingTop: Spacing.xs,
    lineHeight: 17,
    fontStyle: 'italic',
  },

  missingSection: { gap: Spacing.xs, marginTop: Spacing.xs },
  missingSectionLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.warning, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.xs, paddingHorizontal: Spacing.xs },

  // "Waiting to be approved by Host" — separator + grupp under approved-listan
  waitingSection: { gap: Spacing.xs, marginTop: Spacing.md },
  approveAllRow: {
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    marginBottom: Spacing.xs,
  },
  waitingSectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
  },
  missingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.warningMuted, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.warningBorder, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.md },
  missingEmoji: { fontSize: 20 },
  missingInfo: { flex: 1 },
  missingName: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.textPrimary, marginBottom: 2 },
  missingSubtext: { fontSize: FontSize.xs, color: Colors.warning, lineHeight: 16 },
  missingArrow: { fontSize: 18, color: Colors.warning },

  cardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: 2 },
  cardSubtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: Spacing.md },

  eraDisplay: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  eraDisplayYear: { fontSize: 36, fontWeight: '700', color: Colors.primary, fontVariant: ['tabular-nums'] },
  eraDisplayDash: { fontSize: 28, fontWeight: '300', color: Colors.textSecondary },
  eraWarning: { backgroundColor: Colors.warningMuted, borderRadius: Radius.sm, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.warningBorder, marginTop: Spacing.sm },
  eraWarningText: { fontSize: FontSize.xs, color: Colors.warning, lineHeight: 17 },

  regionTrigger: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.background, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.borderStrong, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  regionTriggerText: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.textPrimary },

  startSection: { gap: Spacing.md },
  startHint: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', lineHeight: 17 },
  bottomPad: { height: Spacing.xl },
});

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  container: { backgroundColor: Colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.xl, gap: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  fieldGroup: { gap: Spacing.xs },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  input: { height: 52, borderRadius: Radius.md, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.borderStrong, paddingHorizontal: Spacing.lg, fontSize: 16, color: Colors.textPrimary },
  skillRow: { flexDirection: 'row', gap: Spacing.sm },
  skillBtn: { flex: 1, height: 40, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  skillBtnActive: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primaryBorder },
  skillBtnText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  skillBtnTextActive: { color: Colors.primary },
  previewBox: { backgroundColor: Colors.primaryMuted, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.primaryBorder, alignItems: 'center' },
  previewText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.primary },
  cancelBtn: { alignItems: 'center', paddingVertical: Spacing.xs },
  cancelText: { fontSize: 14, color: Colors.textSecondary },

  // Year of birth — drop-down trigger (för Add Player)
  yearTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingHorizontal: Spacing.lg,
  },
  yearTriggerText: { fontSize: 16, fontWeight: '500', color: Colors.textPrimary },
  yearTriggerPlaceholder: { color: Colors.textDisabled, fontWeight: '400' },
  yearTriggerArrow: { fontSize: 18, color: Colors.textSecondary },

  // Year picker som conditional overlay inuti samma Modal
  yearPickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  yearPickerSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  yearPickerHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.borderStrong,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  yearItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  yearItemSelected: { backgroundColor: Colors.primaryMuted },
  yearItemText: { fontSize: 17, color: Colors.textPrimary, fontVariant: ['tabular-nums'] },
  yearItemTextSelected: { color: Colors.primary, fontWeight: '700' },
  yearItemCheck: { fontSize: 16, color: Colors.primary, fontWeight: '700' },
});

const shareSheet = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  container: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.borderStrong,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.sm },

  sectionLabel: {
    ...Typography.overline,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.xs,
  },

  emptyState: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.md,
  },
  emptyText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  emptySubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },

  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  friendEmoji: { fontSize: 22, width: 36, textAlign: 'center' },
  friendName: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  inviteBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  inviteBtnDone: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.success,
  },
  inviteBtnText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: '#fff', letterSpacing: 0.3 },
  inviteBtnTextDone: { color: Colors.success },

  divider: { height: 1, backgroundColor: Colors.separator },

  osShareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  osShareIcon: { fontSize: 22, width: 36, textAlign: 'center' },
  osShareTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  osShareSubtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  osShareArrow: { fontSize: 20, color: Colors.textSecondary },

  closeBtn: {
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  closeBtnText: { fontSize: 15, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
});
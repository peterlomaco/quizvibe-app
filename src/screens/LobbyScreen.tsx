import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
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
import Svg, { Circle, Path } from 'react-native-svg';
import { ApproveToggle } from '../components/ApproveToggle';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Player, PlayerRow } from '../components/PlayerRow';
import { QuizVibeLogo } from '../components/QuizVibeLogo';
import { TopUserBanner } from '../components/TopUserBanner';
import { Colors, FontSize, FontWeight, Radius, Spacing, Typography } from '../theme';
import { getAvatarEmojiById } from '../utils/avatars';
import { loadFriends, type Friend } from '../utils/friendsStorage';
import { consumePendingLobbyPlayers } from '../utils/pendingLobby';
import { loadProfile, type ProfileData } from '../utils/profileStorage';
import { ROOM_CODE_LETTERS, formatRoomCode, generateRoomCode } from '../utils/roomCode';
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
    name: profile.playerName?.trim() || existing.name,
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
}
const PURCHASED_PACKAGES: MusicPackage[] = [
  { id: 'pkg-hiphop', name: 'Hip Hop' },
  { id: 'pkg-rock', name: 'Rock' },
  { id: 'pkg-film-actors', name: 'Film & Actors' },
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

          {/* PlayerName */}
          <View style={modal.fieldGroup}>
            <Text style={modal.fieldLabel}>Player Name</Text>
            <TextInput
              style={modal.input}
              placeholder="Pick a Player Name"
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

  // Pulserande Buy CTA — drar host:ens uppmärksamhet till QuizVibe Store-knappen.
  // Samma loop-mönster (scale 1 → 1.03 → 1, 900ms per riktning) som
  // Create Game-knappen på startskärmen.
  const buyCtaPulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(buyCtaPulse, { toValue: 1.03, duration: 900, useNativeDriver: true }),
        Animated.timing(buyCtaPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    ).start();
  }, [buyCtaPulse]);

  // Vid mount: kolla om det finns "pending players" från föregående spel
  // (sparat av quiz-skärmen när användaren valde "Yes, keep them" i Play Again-dialogen).
  // Om användaren kommer hit som gäst: lägg in dem som en guest-spelare överst
  // (efter host) så de syns som "you" i listan.
  useEffect(() => {
    consumePendingLobbyPlayers().then(async (carriedOver) => {
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
          // Explicit false så de hamnar i "To be Approved by Host"-listan
          // direkt vid join, istället för att vänta på att host bjuder in.
          approved: false,
        };
        // Sätt in gästen direkt efter host (index 1) så de syns högt upp.
        setPlayers((prev) => {
          const hostIdx = prev.findIndex((p) => p.isHost);
          const insertAt = hostIdx === -1 ? 0 : hostIdx + 1;
          const next = [...prev];
          next.splice(insertAt, 0, guestPlayer);
          return next;
        });
        return;
      }
      if (!hostMode) {
        // Code-only join (ingen guest-form-data): användaren har redan en
        // sparad profil från registreringen. Ladda profilen och lägg in
        // dem som "to be approved by host" så de ser sig själva i lobbyn
        // direkt — de behöver inte vänta på godkännande för att se rummet.
        // Fallback till en generisk "Guest"-rad om profil saknas.
        const profile = await loadProfile();
        const currentYear = new Date().getFullYear();
        const age = profile?.birthYear ? currentYear - profile.birthYear : undefined;
        const skill = profile?.skill ?? undefined;
        const hcpComplete = !!(skill && age !== undefined);
        const joiner: LobbyPlayer = {
          id: `joiner-${Date.now()}`,
          name: profile?.playerName?.trim() || 'You',
          emoji: profile ? getAvatarEmojiById(profile.selectedAvatarId) : '👤',
          isReady: hcpComplete,
          type: profile ? 'registered' : 'guest',
          age,
          skill,
          hcpComplete,
          spotifyConnected: profile?.spotifyConnected ?? false,
          approved: false,
        };
        setPlayers((prev) => {
          const hostIdx = prev.findIndex((p) => p.isHost);
          const insertAt = hostIdx === -1 ? 0 : hostIdx + 1;
          const next = [...prev];
          next.splice(insertAt, 0, joiner);
          return next;
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Varje gång Lobby får fokus (t.ex. man kommer tillbaka från Profile-tabben):
  // ladda sparad profil och uppdatera host-spelarkortet med profilens värden.
  // Detta gör att ändringar i Profile (playerName, ålder, skill, avatar) slår
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
  const ROOM_LOGO_SIZE = 104;
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
  // Use Packages — Basic-utbudet är alltid implicit aktivt (ingen UI). Hosten
  // kan välja till extra-paket ovanpå. Knytningen mellan packages och
  // room-code är implicit (lobby-state).
  const [selectedExtraPackages, setSelectedExtraPackages] = useState<string[]>([]);

  const handleToggleExtraPackage = (id: string) => {
    setSelectedExtraPackages((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };
  // "Select all"-toggle på rubrik-raden — låter host aktivera/avaktivera
  // alla köpta paket med ett enda klick.
  const isAllSelected =
    PURCHASED_PACKAGES.length > 0 &&
    selectedExtraPackages.length === PURCHASED_PACKAGES.length;
  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelectedExtraPackages([]);
    } else {
      setSelectedExtraPackages(PURCHASED_PACKAGES.map((p) => p.id));
    }
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
  //  • Pass-the-Phone — bara en enhet skickas runt; en Spotify-låt skulle
  //    tvinga öppna Spotify-appen och stjäla fokus från QuizVibe, vilket
  //    bryter timern som tickar medan låten spelas. Spotify är därför
  //    alltid auto-Disabled i detta läge.
  //  • Individual Devices — varje spelare streamar låtarna på sin egen
  //    telefon, så ALLA godkända spelare behöver ett Spotify-konto.
  // Host kan ovanpå auto-regeln manuellt slå av via spotifyHostToggle;
  // visad status = auto AND host-toggle. Info-ikonen visas alltid i båda
  // lägena (enabled som disabled) med samma rules-text — så att användaren
  // alltid kan kontrollera vilket kriterium som gäller per Game Mode.
  const spotifyAutoEnabled =
    gameMode === 'individual-devices' &&
    approvedPlayers.length > 0 &&
    approvedPlayers.every((p) => p.spotifyConnected === true);
  const spotifyEnabled = spotifyAutoEnabled && spotifyHostToggle;
  // Minst en Game Connection-källa måste vara aktiv — annars finns inget
  // underlag att hämta frågor från. Räkna aktiva källor och blockera när
  // användaren försöker stänga av den enda kvarvarande.
  const enabledSourceCount =
    (youtubeEnabled ? 1 : 0) + (spotifyEnabled ? 1 : 0) + (profilesEnabled ? 1 : 0);
  const handleToggleSource = (
    currentlyEnabled: boolean,
    setter: (v: boolean) => void,
    nextValue: boolean,
  ) => {
    if (!nextValue && currentlyEnabled && enabledSourceCount === 1) {
      Alert.alert(
        'Game connections',
        'Minimum 1 Game connection source needs to be enabled.',
      );
      return;
    }
    setter(nextValue);
  };
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
  // Använder hostens profil-playerName/avatar som "from"-data.
  const handleInviteFriend = async (friend: Friend) => {
    const profile = await loadProfile();
    const fromPlayerName = profile?.playerName?.trim() || 'Host';
    await addInvite({
      roomCode,
      fromPlayerName,
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
      await Share.share({ message: `Join my QuizVibe game! Room code: ${formatRoomCode(roomCode)}` });
    } catch {
      // tyst — användaren avbröt
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top board (login status) — sticky utanför ScrollView så den följer
          med när användaren scrollar i lobbyn. Tap navigerar till Profile-
          tabben för att hantera profil/avatar. */}
      <TopUserBanner onPress={() => router.push('/(tabs)/profile')} />
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
          {/* Loggan är absolut-positionerad i Card:ens övre vänstra hörn med
              en liten inset från kantlinjen. Card är default position:
              relative i RN så absolute children pinnas mot Card:s padding-
              edge. */}
          <View style={styles.roomCodeLogoWrap}>
            <QuizVibeLogo size={ROOM_LOGO_SIZE} />
          </View>
          {/* För guest renderas labeln absolut i Card:s övre del med
              vertikal mitt direkt på loggans visuella mitt — ger ett
              "label-genom-loggan"-uttryck som inte kan rubbas av flex-
              layout-quirks. textAlign center + left/right: 0 håller
              labeln horisontellt centrerad i kortet. */}
          {!hostMode && (
            <Text style={styles.roomLabelGuestAbsolute}>Room Code</Text>
          )}
          {hostMode && <View style={styles.hostBadge}><Text style={styles.hostBadgeText}>👑 You are the host</Text></View>}
          <View style={[styles.roomCodeRow, !hostMode && styles.roomCodeRowGuestSpacing]}>
            <View style={styles.roomCodeStack}>
              {hostMode && (
                <Text style={styles.roomLabel}>Room Code</Text>
              )}
              {/* Varje tecken i en bordered cell — samma look som "Enter Room
                  Code"-inputen i Join-modalen i fyllt läge (Colors.primary
                  border + Colors.primaryMuted bg). Bindestrecket renderas
                  som ett separat textelement mellan bokstavs- och siffer-
                  cellerna, identiskt med Join-modalens layout. */}
              <View style={styles.roomCodeCellsRow}>
                {roomCode.split('').map((ch, i) => (
                  <React.Fragment key={i}>
                    <View style={styles.roomCodeCell}>
                      <Text style={styles.roomCodeCellText}>{ch}</Text>
                    </View>
                    {i === ROOM_CODE_LETTERS - 1 && (
                      <Text style={styles.roomCodeCellDash}>–</Text>
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>
          </View>
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
            tydligt sticker ut utan att se ut som en interaktiv toggle.
            marginTop ger lite extra luft mellan kortets överkant och rubriken. */}
        <View style={[styles.section, { marginTop: Spacing.xs }]}>
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
            Profile-sidan, fast i kompakt list-format). marginTop ger lite
            extra luft mellan Game Mode-beskrivningen och denna rubrik. */}
        <View style={[styles.section, { marginTop: Spacing.sm }]}>
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
              {/* FREE-badgen sitter alltid kvar — i Enabled-läge med grön bg
                  och svart text, i Disabled-läge med grå bg och dämpad text
                  så den signalerar "ingår gratis" utan att konkurrera med
                  Disabled-pillens budskap. */}
              <View style={youtubeEnabled ? styles.youtubeEnabledPill : styles.statusPillDisabled}>
                <Text style={youtubeEnabled ? styles.youtubeEnabledText : styles.statusPillTextDisabled}>
                  {youtubeEnabled ? 'Enabled' : 'Disabled'}
                </Text>
                <View
                  style={[styles.freeBadgeSmall, !youtubeEnabled && styles.freeBadgeSmallGrey]}
                  pointerEvents="none"
                >
                  <Text style={[styles.freeBadgeTextSmall, !youtubeEnabled && styles.freeBadgeSmallTextGrey]}>
                    FREE
                  </Text>
                </View>
              </View>
              {hostMode && (
                <Switch
                  value={youtubeEnabled}
                  onValueChange={(v) => handleToggleSource(youtubeEnabled, setYoutubeEnabled, v)}
                  trackColor={{ false: Colors.error, true: Colors.success }}
                  thumbColor="#FFF"
                  ios_backgroundColor={Colors.error}
                  style={styles.connectionSwitch}
                />
              )}
            </View>
            <View style={styles.connectionRow}>
              <View style={[styles.connectionIconWrap, styles.connectionIconSpotify]}>
                <Text style={styles.connectionIconGlyph}>🎵</Text>
              </View>
              {/* Label + info-ikon paras ihop i en grupp som upptar samma
                  minWidth (130) som vanlig connectionLabel — så pillen efter
                  startar på exakt samma x-position som YouTubes och Profiles
                  & Places-radens pillar, och switchen längst ut linjerar med
                  de andra radernas switchar via marginLeft:'auto'. */}
              <View style={styles.connectionLabelGroup}>
                <Text style={[styles.connectionLabel, styles.connectionLabelInGroup]}>Spotify</Text>
                {/* Info-ikonen visas alltid (oavsett mode och enabled/disabled-
                    state) med samma rules-text. Sitter direkt efter "Spotify"
                    så den läses som en del av labeln. */}
                <TouchableOpacity
                  style={styles.infoIconBtn}
                  onPress={() =>
                    Alert.alert(
                      'Spotify requirements',
                      'Pass-the-Phone — Spotify is unavailable in this mode.\n\nIndividual Devices — All approved players (incl. host) need a Spotify account activated in their Profile.',
                    )
                  }
                  hitSlop={8}
                  accessibilityLabel="Spotify requirements"
                >
                  <Text style={styles.infoIconText}>i</Text>
                </TouchableOpacity>
              </View>
              <View style={spotifyEnabled ? styles.statusPillEnabled : styles.statusPillDisabled}>
                <Text style={spotifyEnabled ? styles.statusPillTextEnabled : styles.statusPillTextDisabled}>
                  {spotifyEnabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
              {hostMode && (
                <Switch
                  value={spotifyHostToggle}
                  onValueChange={(v) => handleToggleSource(spotifyEnabled, setSpotifyHostToggle, v)}
                  // Locked för host när auto-regeln inte uppfylls (alla godkända
                  // måste ha Spotify-konto). Vid auto-disable visas en mörkgrå
                  // track och ljusgrå thumb istället för röd/grön-paletten, för
                  // att tydligt signalera "ej tillgänglig".
                  disabled={!spotifyAutoEnabled}
                  trackColor={
                    spotifyAutoEnabled
                      ? { false: Colors.error, true: Colors.success }
                      : { false: '#3A3F4B', true: '#3A3F4B' }
                  }
                  thumbColor={spotifyAutoEnabled ? '#FFF' : '#9CA3AF'}
                  ios_backgroundColor={spotifyAutoEnabled ? Colors.error : '#3A3F4B'}
                  style={styles.connectionSwitch}
                />
              )}
            </View>

            {/* AI — mörkblå cirkel med blå primary-border och italiserad "AI"-text. */}
            <View style={styles.connectionRow}>
              <View style={styles.connectionIconWrap}>
                {/* Q-figuren från startskärmens logga (utan omgivande kvadrater).
                    "AI"-text överlagrad i mitten ersätter den lilla pricken. */}
                <Svg width={28} height={28} viewBox="24 22 32 32" style={StyleSheet.absoluteFillObject}>
                  <Circle cx="40" cy="38" r="13" fill="none" stroke={Colors.primary} strokeWidth="2.5" />
                  <Path d="M49 47 L53 51" stroke={Colors.primary} strokeWidth="2.5" strokeLinecap="round" />
                </Svg>
                <Text style={styles.connectionIconAiText}>AI</Text>
              </View>
              <Text style={styles.connectionLabel}>Profiles & Places</Text>
              {/* FREE-badgen sitter alltid kvar (samma mönster som YouTube) —
                  grön i Enabled, grå i Disabled. */}
              <View style={profilesEnabled ? styles.youtubeEnabledPill : styles.statusPillDisabled}>
                <Text style={profilesEnabled ? styles.youtubeEnabledText : styles.statusPillTextDisabled}>
                  {profilesEnabled ? 'Enabled' : 'Disabled'}
                </Text>
                <View
                  style={[styles.freeBadgeSmall, !profilesEnabled && styles.freeBadgeSmallGrey]}
                  pointerEvents="none"
                >
                  <Text style={[styles.freeBadgeTextSmall, !profilesEnabled && styles.freeBadgeSmallTextGrey]}>
                    FREE
                  </Text>
                </View>
              </View>
              {hostMode && (
                <Switch
                  value={profilesEnabled}
                  onValueChange={(v) => handleToggleSource(profilesEnabled, setProfilesEnabled, v)}
                  trackColor={{ false: Colors.error, true: Colors.success }}
                  thumbColor="#FFF"
                  ios_backgroundColor={Colors.error}
                  style={styles.connectionSwitch}
                />
              )}
            </View>

            {/* Use Packages — sub-block sist i Game Connections för musikpaket-val.
                Basic-utbudet är alltid implicit aktivt (ingen synlig chip);
                hosten kan välja till köpta Extra packages ovanpå. För
                icke-host visas allt read-only (disabled på TouchableOpacity). */}
            <View style={styles.usePackagesBlock}>
              <Text style={styles.sectionLabel}>Customized Host packages</Text>

              {/* Yttre svart container som omsluter Buy CTA + paketlistan —
                  speglar modeToggle:s padding (3), gap (4), borderRadius (md)
                  och Colors.background-bakgrund. Det ger Buy CTA samma
                  inre avstånd från ramen som Individual Devices har i
                  Game Mode-toggeln. */}
              <View style={styles.extraPackagesWrapper}>
                {/* Sub-rubrik högst upp i wrappern. För host introducerar den
                    de egna köpta paketen; för icke-host listas de paket hosten
                    valt att aktivera i den här lobbyn. */}
                <View style={styles.extraPackagesHeadingRow}>
                  <Text style={styles.extraPackagesHeading}>
                    {hostMode ? 'Packages available for you:' : 'Packages for this lobby selected by the Host:'}
                  </Text>
                  {hostMode && (
                    <View style={styles.selectAllGroup}>
                      <Text style={styles.selectAllLabel}>Select all</Text>
                      <Switch
                        value={isAllSelected}
                        onValueChange={handleToggleAll}
                        disabled={PURCHASED_PACKAGES.length === 0}
                        trackColor={{ false: Colors.error, true: Colors.success }}
                        thumbColor="#FFF"
                        ios_backgroundColor={Colors.error}
                        style={styles.connectionSwitch}
                      />
                    </View>
                  )}
                </View>

                {/* Host ser hela köpta listan med switch per paket; icke-host
                    ser endast paket som hosten aktiverat — alltid i active-
                    style eftersom de per definition är "på" i denna lobby. */}
                {(() => {
                  const visiblePackages = hostMode
                    ? [...PURCHASED_PACKAGES]
                    : PURCHASED_PACKAGES.filter((pkg) => selectedExtraPackages.includes(pkg.id));
                  const sorted = visiblePackages.sort((a, b) =>
                    a.name.localeCompare(b.name, undefined, { numeric: true }),
                  );

                  if (sorted.length === 0) {
                    return (
                      <Text style={styles.noExtraPackagesText}>
                        {hostMode ? 'No Extra packages purchased' : 'No extra packages active in this lobby'}
                      </Text>
                    );
                  }

                  return sorted.map((pkg) => {
                    const isSelected = selectedExtraPackages.includes(pkg.id);
                    // För icke-host är raden alltid "aktiv" (vi visar bara
                    // valda paket), så active-stylen används oavsett.
                    const showActive = hostMode ? isSelected : true;
                    return (
                      <View key={pkg.id} style={styles.purchasedPackageRow}>
                        <TouchableOpacity
                          style={styles.infoIconBtn}
                          onPress={() =>
                            Alert.alert(
                              pkg.name,
                              'Information about this package will be available later.',
                            )
                          }
                          hitSlop={8}
                          accessibilityLabel={`${pkg.name} info`}
                        >
                          <Text style={styles.infoIconText}>i</Text>
                        </TouchableOpacity>
                        <View
                          style={[
                            styles.purchasedPackageBox,
                            showActive && styles.purchasedPackageBoxActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.purchasedPackageName,
                              showActive && styles.purchasedPackageNameActive,
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {pkg.name}
                          </Text>
                        </View>
                        {hostMode && (
                          <Switch
                            value={isSelected}
                            onValueChange={() => handleToggleExtraPackage(pkg.id)}
                            trackColor={{ false: Colors.error, true: Colors.success }}
                            thumbColor="#FFF"
                            ios_backgroundColor={Colors.error}
                            style={styles.connectionSwitch}
                          />
                        )}
                      </View>
                    );
                  });
                })()}

                {/* Buy Extra packages-CTA längst ner i wrappern — pulserande
                    knapp som drar uppmärksamhet till QuizVibe Store. Visas
                    enbart för host; köp är inte aktuellt för guests. */}
                {hostMode && (
                  <Animated.View
                    style={[styles.packageChipBuyCtaWrap, { transform: [{ scale: buyCtaPulse }] }]}
                  >
                    <TouchableOpacity
                      style={[styles.packageChip, styles.packageChipBuyCta]}
                      onPress={() => router.push('/(tabs)/store')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.packageChipText}>
                        + QuizVibe Store
                      </Text>
                      <View style={[styles.premiumBadge, styles.premiumBadgeGrey]} pointerEvents="none">
                        <Text style={[styles.premiumBadgeText, styles.premiumBadgeTextGrey]}>PREMIUM</Text>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </View>
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
              {hostMode
                ? 'Turn order — top plays first. Use ↑↓ to reorder.'
                : 'Playing order — selected by Host'}
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
                onMoveUp={hostMode ? () => movePlayer(player.id, 'up') : undefined}
                onMoveDown={hostMode ? () => movePlayer(player.id, 'down') : undefined}
                canMoveUp={hostMode && index > 0}
                canMoveDown={hostMode && index < approvedPlayers.length - 1}
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
                        <Text style={shareSheet.friendName}>{friend.playerName}</Text>
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
  // Logga + Room Code-stack på en rad. Stacken har `flex: 1` och en
  // matchande spacer på höger sida så Room Code-numret hamnar centrerat
  // i kortet samtidigt som loggan ligger vänsterställd. width: '100%' så
  // raden fyller hela inner-bredden av Card:en (overrides parent:s
  // alignItems: 'center').
  // Stacken centreras mot hela kortets bredd via justifyContent. Loggan
  // ligger utanför raden (absolut i Card:s övre vänstra hörn) så raden
  // behöver inte reservera flex-utrymme för den.
  roomCodeRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // För icke-host saknas host-badgen som annars knuffar ner cell-raden.
  // Labeln är absolut-positionerad (roomLabelGuestAbsolute) med top: 29 +
  // höjd ~24 → label-bottom vid y≈53. marginTop placerar cell-raden
  // strax under labeln; värdet är empiriskt finjusterat så cellerna inte
  // ligger för långt ner i kortet.
  roomCodeRowGuestSpacing: { marginTop: 52 },
  // Loggan pinnas i Card:s övre vänstra hörn. top/left: 0 = inkant av
  // Card:s padding-edge (RN positionerar absolute children från padding-
  // edge, inte content-edge). Negativa offsets drar in loggan i själva
  // padding-zonen så den hamnar närmare Card:s rundade kant.
  roomCodeLogoWrap: {
    position: 'absolute',
    top: -Spacing.sm,
    left: -Spacing.sm,
  },
  roomCodeStack: { alignItems: 'center' },
  roomLabel: { ...Typography.overline, color: Colors.textSecondary, marginBottom: Spacing.sm },
  // Guest-label position och utseende. Pinnas absolut i Card:ens övre del
  // så vertikalpositionen blir helt deterministisk (oberoende av flex/
  // line-height-quirks). top är beräknat så label-mitten landar på
  // loggans visuella mitt:
  //   • Loggan: top=-Spacing.sm=-8, höjd 104. SVG synlig center vid cy=38
  //     i 80-unit viewBox → 38/80 × 104 = 49.4 från logg-topp.
  //   • Logo center y i padded coords = -8 + 49.4 ≈ 41
  //   • Label center y = top + halv label-höjd (~12 för fontSize 20)
  //   • top ≈ 41 - 12 = 29
  // left/right: 0 + textAlign center ger horisontell centrering över hela
  // kortets bredd.
  roomLabelGuestAbsolute: {
    ...Typography.overline,
    fontSize: FontSize.xxl,
    letterSpacing: 1.2,
    color: Colors.textSecondary,
    position: 'absolute',
    // top justerad ner från 29 → 27 så labelns nya större halv-höjd (~14
    // för fontSize 24 / lineHeight ~28) fortfarande hamnar på loggans
    // visuella mitt vid y≈41.
    top: 27,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  // Cell-rad för rumskoden — speglar Join-modalens "Enter Room Code"-cells
  // i fyllt läge. Storleken (36×50) håller raden tillräckligt smal för att
  // logga + cell-rad ska få plats sida vid sida i den centrerade stacken.
  roomCodeCellsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  roomCodeCell: {
    width: 36,
    height: 50,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomCodeCellText: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  roomCodeCellDash: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    marginHorizontal: 2,
  },
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
    // Höger-inset så att switcharna linjerar vertikalt med switcharna i
    // paketlistan nedanför. Pillarna shiftas vänster med samma värde via
    // en mindre connectionLabel.minWidth.
    paddingRight: 18,
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
  // Grey overrides för freeBadgeSmall + freeBadgeTextSmall som appliceras när
  // host stängt av en gratis-funktion (YouTube eller Profiles & Places). FREE-
  // badgen behålls för att kommunicera "ingår utan kostnad", men dämpas till
  // grått så pillen tydligt läses som Disabled.
  freeBadgeSmallGrey: {
    backgroundColor: '#6B7280',
  },
  freeBadgeSmallTextGrey: {
    color: Colors.textSecondary,
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
  // AI: Q-figur från startskärmens logga (cirkel + svans i primary-blå),
  // utan omgivande ram. "AI"-text överlagras i Q-cirkelns mitt — mindre
  // fontSize än tidigare så texten ryms inuti cirkeln.
  connectionIconAiText: {
    fontSize: 10,
    fontWeight: '800',
    fontStyle: 'italic',
    color: Colors.primary,
    letterSpacing: 0.5,
    // translateY -1 kompenserar för att Text:s default-line-box har
    // descender-utrymme under baseline — utan det ligger glyferna något
    // under Q-ringens visuella mitt trots att box-centret är linjerat.
    transform: [{ translateY: -1 }],
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
    // position:'relative' så att FREE-badgen (på YouTube- och Profiles &
    // Places-raderna) kan sticka upp över kantlinjen även i Disabled-läget.
    position: 'relative',
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
    // Extra luft ovanför så "Customized Host packages"-rubriken inte
    // hamnar för nära Profiles & Places-radens switch ovanför.
    marginTop: Spacing.md,
  },
  usePackagesLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  // Chip-stil för Buy-CTA. Auto-höjd + paddingVertical så texten kan rendras
  // på två rader (rubrik + CTA-uppmaning) utan att klippas. border-radius
  // matchar Individual Devices-knappen i Game Mode-toggle:n. Position:relative
  // så att PREMIUM-badgen kan sticka upp över kantlinjen.
  packageChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.sm,
    borderWidth: 1,
    position: 'relative',
  },
  packageChipText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  // Wrapper kring Buy CTA — Animated.View som driver pulse-scaling. Positions-
  // egenskaper (alignSelf, width, marginTop) sitter här så scale-transformen
  // appliceras på rätt nivå utan att bryta wrapper-flödet.
  packageChipBuyCtaWrap: {
    alignSelf: 'center',
    width: '70%',
    marginTop: Spacing.xl,
  },
  // Container-färg för Buy Extra packages-CTA:n — matchar Create Game-knappen
  // på startskärmen (Colors.cardElevated bg, Colors.primary blå border, vit
  // text). alignSelf: 'stretch' override:ar packageChip.alignSelf: 'flex-start'
  // så att knappen fyller hela wrap:ens (80%) bredd och därmed centreras
  // korrekt via wrap:ens alignSelf: 'center'.
  packageChipBuyCta: {
    backgroundColor: Colors.cardElevated,
    borderColor: Colors.primary,
    alignSelf: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  // Yttre wrapper kring sub-rubriken, paketlistan och Buy CTA. Geometrin
  // (padding 3, gap 4, Radius.md, 1px Colors.border, Colors.background-bg)
  // är identisk med modeToggle:n så att Buy CTA hamnar i samma inre avstånd
  // från ramen som Individual Devices har, och så att svart-bakgrunden runt
  // om har samma bredd som modeToggle ovanför.
  extraPackagesWrapper: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingHorizontal: 3,
    paddingTop: 3,
    // Större bottom-padding ger extra luft mellan Buy CTA:ns underkant och
    // wrappern:s nederkant — bryter med modeToggle:s symmetri här.
    paddingBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  // Sub-rubrik högst upp i extraPackagesWrapper — matchar paket-namnens
  // storlek och färg (FontSize.sm + Colors.textPrimary) så raden läses som
  // en likvärdig introduktion till listan under den.
  // Rubrik-rad: heading text på vänster, "Select all"-grupp på höger.
  // paddingRight: 0 (mindre än paket-radernas 4) eftersom Switch:en sitter
  // i en sub-grupp (selectAllGroup) som kompenserar layouten — utan denna
  // justering hamnar Select all-switchen marginellt vänster om paket-switcharna.
  extraPackagesHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.xs,
    paddingRight: 0,
    paddingTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  extraPackagesHeading: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    // translateY puttar rubrikens visuella glyfer uppåt så de linjerar med
    // switchens visuella mitt.
    transform: [{ translateY: -1 }],
  },
  // "Select all"-gruppen (label + switch) pushas till höger via marginLeft:'auto'.
  selectAllGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginLeft: 'auto',
  },
  selectAllLabel: {
    fontSize: FontSize.xs,
    fontStyle: 'italic',
    color: Colors.textSecondary,
  },
  // Empty-state-text när hosten inte har köpt några extra-paket. Italic +
  // dämpad färg signalerar att det är ett informativt placeholder, inte
  // en aktiv lista. Buy CTA visas fortsatt nedanför så host kan köpa.
  noExtraPackagesText: {
    fontSize: FontSize.sm,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
  // Layout-rad för ett köpt extra-paket: bordered text-box (vänster, indenterat
  // så det startar vid Buy CTA:s vänsterkant) + Switch (höger via
  // connectionSwitch.marginLeft:'auto'). Ingen border på själva raden —
  // bara text-boxen är inramad.
  purchasedPackageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // Layout per child från rad-vänster: paddingLeft 4 → info-ikon (width 20)
    // → gap 8 → text-box → marginLeft:auto (på switch) → switch → paddingRight 4.
    // Info-ikonens center hamnar vid rad x=14 (4 + 10) = absolut x=18 (mitt
    // mellan wrapper-yttre-vänsterkant 0 och box-vänsterkant 36, där wrapper-
    // inset 4 + paddingLeft 4 + ikon 20 + gap 8 = 36 = absolut x för box-left).
    paddingLeft: 4,
    paddingRight: 4,
    gap: Spacing.sm,
  },
  // Inramad text-box: omsluter ENDAST paketnamnet (inte switchen). Default-
  // state (toggle av): grå borderStrong-kant + transparent bg + dämpad text.
  // Aktivt state (toggle på): blå primary-kant + Colors.cardElevated bg + vit
  // text (matchar Buy CTA:s tema). Bredd 204 så höger-kanten linjerar med
  // connection-radernas pill-höger (icon 28 + gap 8 + label.minWidth 112 +
  // gap 8 + pill.marginLeft 4 + pill.minWidth 80 = 240, minus box.left 36
  // = 204) — ger samma avstånd från box till switch som pill till switch.
  purchasedPackageBox: {
    width: 204,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.sm,
  },
  purchasedPackageBoxActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.cardElevated,
  },
  purchasedPackageName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  purchasedPackageNameActive: {
    color: Colors.textPrimary,
  },
  // Liten info-knapp ("i" i en cirkel) som sitter direkt efter Spotify-labeln
  // i connectionLabelGroup — tap visar en Alert med förklaringen istället för
  // att alltid skriva ut texten. Avstånd till labeln styrs av gruppens gap.
  infoIconBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
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
    // status-pillar (YouTubes Enabled / Spotifys Enabled-Disabled / Profiles
    // & Places Enabled-Disabled) linjerar exakt under varandra trots att
    // labels har olika pixel-bredd i proportionell font. Värdet måste rymma
    // den bredaste labeln ("Profiles & Places") — annars trycks just den
    // radens pill till höger och bryter linjeringen. Värdet är paret med
    // connectionRow.paddingRight (18) så att pillarna och switcharna båda
    // shiftas vänster med 18px och linjerar med paketlistans switchar.
    minWidth: 112,
  },
  // Spotify-radens label + info-ikon ligger i en gemensam grupp som upptar
  // samma minWidth (130) som plain connectionLabel — då stannar pillen och
  // switchen i linje med YouTube- och Profiles & Places-radernas. Texten
  // inuti måste få minWidth: 0 (via connectionLabelInGroup) för att inte
  // själv ta hela 130px och skuffa info-ikonen utanför gruppens bredd.
  connectionLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minWidth: 112,
  },
  connectionLabelInGroup: {
    minWidth: 0,
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
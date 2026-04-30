import { QuizVibeLogo } from '@/src/components/QuizVibeLogo';
import { TopUserBanner } from '@/src/components/TopUserBanner';
import { Colors, Radius, Spacing } from '@/src/theme';
import { identify, resetIdentity, track } from '@/src/utils/analytics';
import { getAvatarEmojiById } from '@/src/utils/avatars';
import { generatePlayerName } from '@/src/utils/playerName';
import { containsProfanity } from '@/src/utils/profanity';
import { clearProfile, loadProfile, saveProfile, type ProfileData } from '@/src/utils/profileStorage';
import { formatRoomCode, generateRoomCode, ROOM_CODE_LENGTH, ROOM_CODE_LETTERS } from '@/src/utils/roomCode';
import { loadInvites, removeInvite, type WaitingInvite } from '@/src/utils/waitingInvites';
import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, useFonts } from '@expo-google-fonts/nunito';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
// ─── Join Modal ───────────────────────────────────────────────────────────────

type JoinStep = 'choose' | 'code' | 'invites' | 'guest';

interface JoinModalProps {
  visible: boolean;
  onClose: () => void;
  initialStep?: JoinStep;
  // Döljer Guest-valet i chooser-steget. Sätts när användaren öppnat
  // modalen via "Join Game — as registered user"-knappen, eftersom
  // guest då är ett irrelevant val.
  hideGuest?: boolean;
}

type GuestSkill = 'easy' | 'intermediate' | 'expert';
const GUEST_SKILL_OPTIONS: { id: GuestSkill; label: string }[] = [
  { id: 'easy',         label: 'Easy' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'expert',       label: 'Advanced' },
];

// Mock-list över "redan tagna" playerNames så availability-checken har något
// att faktiskt fela på. Lowercase för case-insensitive match.
// TODO (backend): byt mot riktig playerName-uniqueness-check mot servern.
const TAKEN_PLAYER_NAMES = new Set([
  'player one', 'anna', 'kalle', 'admin', 'test', 'guest', 'host', 'quizvibe',
]);

type PlayerNameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

// Validerar ett manuellt inmatat Player Name. Profanity-check körs först
// så att kränkande namn aldrig hamnar i taken-listan av misstag och så
// användaren får ett mer specifikt felmeddelande.
function validatePlayerName(name: string): 'available' | 'taken' | 'invalid' {
  const trimmed = name.trim();
  if (containsProfanity(trimmed)) return 'invalid';
  if (TAKEN_PLAYER_NAMES.has(trimmed.toLowerCase())) return 'taken';
  return 'available';
}

// Lös format-validering — tillräckligt för UI-feedback. Riktig validering
// sker server-side via aktiverings-/recovery-mail.
const REG_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RegRegion = 'sweden' | 'nordics' | 'global';
const REG_REGION_OPTIONS: { id: RegRegion; label: string }[] = [
  { id: 'sweden',  label: 'Sweden'  },
  { id: 'nordics', label: 'Nordics' },
  { id: 'global',  label: 'Global'  },
];

const CURRENT_YEAR = new Date().getFullYear();
const MIN_BIRTH_YEAR = 1930;
const MAX_BIRTH_YEAR = CURRENT_YEAR - 5;
// Lista, nyaste år först — samma ordning som ProfileScreens year picker.
const BIRTH_YEARS = Array.from(
  { length: MAX_BIRTH_YEAR - MIN_BIRTH_YEAR + 1 },
  (_, i) => MAX_BIRTH_YEAR - i,
);

function JoinModal({ visible, onClose, initialStep = 'choose', hideGuest = false }: JoinModalProps) {
  const [step, setStep] = useState<JoinStep>(initialStep);
  const [code, setCode] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestBirthYearText, setGuestBirthYearText] = useState('');
  // Default-värde: användaren kan gå direkt till Room Code efter year of birth.
  // Skill kan ändras via skill-knapparna men har förvalt 'intermediate'.
  const [guestSkill, setGuestSkill] = useState<GuestSkill>('intermediate');
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const [playerNameStatus, setPlayerNameStatus] = useState<PlayerNameStatus>('idle');
  const [invites, setInvites] = useState<WaitingInvite[]>([]);

  // Refs till de 5 cells för rumkoden — för auto-fokus framåt och bakåt.
  const codeRefs = useRef<Array<TextInput | null>>([]);
  // Spåra om föregående step var 'guest' så Player Name-autofill bara
  // triggar vid transition INTO guest-steget (inte refill om användaren
  // rensat fältet efter en autofill).
  const prevGuestStepRef = useRef(false);
  // Avled cell-värdena från `code`-strängen så de alltid är i sync.
  const codeCells: string[] = Array.from({ length: ROOM_CODE_LENGTH }, (_, i) => code[i] ?? '');

  const handleCodeCellChange = (index: number, char: string) => {
    // Per-cell-filter: cell 1–3 = A–Z, cell 4–5 = 0–9
    const isLetterCell = index < ROOM_CODE_LETTERS;
    const allowed = isLetterCell ? /[^A-Z]/g : /[^0-9]/g;
    const clean = char.toUpperCase().replace(allowed, '').slice(0, 1);
    const arr = [...codeCells];
    arr[index] = clean;
    setCode(arr.join(''));
    if (clean && index < ROOM_CODE_LENGTH - 1) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeCellKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !codeCells[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  // När modalen öppnas: nollställ ALLT state och börja på det step caller
  // bad om. Reset på öppning (inte stängning) så att state alltid är färskt
  // även om användaren stänger och öppnar igen snabbt — under fade-out
  // behåller modalen senaste UI-state, vilket är önskvärt visuellt.
  // Reset:ar även prevGuestStepRef så Player Name-autofill alltid triggar
  // vid nästa entry till guest-steget (oavsett om det sker via chooser
  // eller initialStep='guest' direkt från Home-skärmens Join-as-Guest-knapp).
  useEffect(() => {
    if (visible) {
      setCode('');
      setGuestName('');
      setGuestBirthYearText('');
      setGuestSkill('intermediate');
      setYearPickerOpen(false);
      setPlayerNameStatus('idle');
      setStep(initialStep);
      prevGuestStepRef.current = false;
    }
  }, [visible, initialStep]);

  // Ladda invites när modalen öppnas — vi behöver längden redan på chooser-steget
  // för att kunna visa rätt enabled/disabled-läge på "Join Waiting Invites".
  useEffect(() => {
    if (visible) {
      loadInvites().then(setInvites);
    }
  }, [visible]);

  const handleAcceptInvite = async (invite: WaitingInvite) => {
    await removeInvite(invite.id);
    onClose();
    router.push({
      pathname: '/(tabs)/lobby',
      params: { code: invite.roomCode, isHost: 'false' },
    });
  };

  const handleJoinWithCode = () => {
    if (code.length < ROOM_CODE_LENGTH) return;
    onClose();
    router.push({ pathname: '/(tabs)/lobby', params: { code, isHost: 'false' } });
  };

  // Parsea och validera birth year. Returnerar null om input inte är ett
  // giltigt 4-siffrigt år inom tillåtet intervall.
  const parsedBirthYear = (() => {
    const n = parseInt(guestBirthYearText, 10);
    if (isNaN(n)) return null;
    if (n < MIN_BIRTH_YEAR || n > MAX_BIRTH_YEAR) return null;
    return n;
  })();

  // Sekventiella låsnings-gates: varje fält låses upp först när föregående
  // är klart. PlayerNamet måste *valideras* (inte bara skrivas) innan year
  // låses upp — det är hur vi visar progress mot lobbyn.
  const yearUnlocked = playerNameStatus === 'available';
  const skillUnlocked = yearUnlocked && parsedBirthYear !== null;
  // Skill är default-ifylld, så code-låset följer skill-låset direkt.
  const codeUnlocked = skillUnlocked;

  const isGuestFormValid =
    playerNameStatus === 'available' &&
    parsedBirthYear !== null &&
    code.length === ROOM_CODE_LENGTH;

  // Om användaren ändrar playerNamet efter en validering — återställ status.
  // Year/skill/code-värden behålls men deras gates återstängs tills nick
  // är validerat igen.
  const handleGuestNameChange = (t: string) => {
    setGuestName(t);
    if (playerNameStatus !== 'idle') setPlayerNameStatus('idle');
  };

  const handleCheckPlayerName = () => {
    const trimmed = guestName.trim();
    if (!trimmed) return;
    Keyboard.dismiss();
    setPlayerNameStatus('checking');
    // Mock-latens — byt mot riktigt API-anrop när backend finns.
    setTimeout(() => {
      setPlayerNameStatus(validatePlayerName(trimmed));
    }, 600);
  };

  // Auto-fyll Player Name när användaren går in i guest-steget och fältet
  // är tomt. Genererar ett unikt namn (verifierat mot mock TAKEN_PLAYER_NAMES)
  // och markerar status som 'available' så användaren kan gå direkt till
  // year of birth. Manuell ändring återställer status till 'idle' via
  // handleGuestNameChange och kräver Check innan formuläret går vidare.
  useEffect(() => {
    const wasGuest = prevGuestStepRef.current;
    prevGuestStepRef.current = step === 'guest';
    if (step === 'guest' && !wasGuest && guestName === '') {
      const generated = generatePlayerName(TAKEN_PLAYER_NAMES);
      setGuestName(generated);
      setPlayerNameStatus('available');
    }
  }, [step, guestName]);

  const handleJoinAsGuest = () => {
    if (!isGuestFormValid || parsedBirthYear === null || guestSkill === null) return;
    // TODO (backend): validera att playerNamet är unikt mot QuizVibe-databasen
    // och att rumkoden faktiskt existerar. Just nu litar vi på input.
    // Autofill-detektion: matchar genererade namnens format
    // ("PlayerName" + 5 siffror + "-" + 2 bokstäver). Om användaren
    // ändrat namnet manuellt blir flaggan false.
    const autofilled = /^PlayerName\d{5}-[A-Z]{2}$/.test(guestName.trim());
    track('guest_name_created', { autofilled, skill: guestSkill });
    onClose();
    router.push({
      pathname: '/(tabs)/lobby',
      params: {
        code,
        isHost: 'false',
        asGuest: 'true',
        guestName: guestName.trim(),
        guestBirthYear: String(parsedBirthYear),
        guestSkill: guestSkill,
      },
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={modal.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={modal.sheet}>
          {step !== 'choose' && (
            <TouchableOpacity
              onPress={() => {
                // Guest-flödet är meant som en snabb-väg: chooser:s
                // andra alternativ (Room Code / Waiting Invites) är inte
                // relevanta för någon som valt guest. Back stänger
                // modalen istället för att leda tillbaka till chooser:n.
                if (step === 'guest') {
                  onClose();
                } else {
                  setStep('choose');
                }
              }}
              style={modal.backBtn}
              hitSlop={10}
            >
              <Text style={modal.backText}>← Back</Text>
            </TouchableOpacity>
          )}

          {step === 'choose' && (
            <>
              <Text style={modal.title}>Join Game</Text>
              <Text style={modal.subtitle}>Pick how you want to join</Text>
              <View style={modal.choiceList}>
                <ChoiceRow
                  icon="🔑"
                  label="Join with Room Code"
                  subtitle="Enter a code shared by the host"
                  onPress={() => setStep('code')}
                />
                <ChoiceRow
                  icon="📨"
                  label="Join Waiting Invites"
                  subtitle="See invites hosts have sent you"
                  disabled={invites.length === 0}
                  onPress={() => {
                    if (invites.length === 0) {
                      Alert.alert(
                        'No Waiting Invites',
                        "You don't have any pending invites yet. When a host sends you one, it will appear here.",
                      );
                      return;
                    }
                    setStep('invites');
                  }}
                />
                {!hideGuest && (
                  <ChoiceRow
                    icon="👤"
                    label="Join as Guest"
                    subtitle="No account — just pick a Player Name"
                    onPress={() => setStep('guest')}
                  />
                )}
              </View>
            </>
          )}

          {step === 'code' && (
            <>
              <Text style={modal.title}>Enter Room Code</Text>
              <Text style={modal.subtitle}>Ask the host for the code</Text>
              {/* Samma 5-cell-layout som i guest-steget: 3 bokstäver + bindestreck + 2 siffror.
                  Cell 1–3 visar bokstavstangentbord, 4–5 sifferkeypad.
                  Auto-fokus hoppar framåt vid input och bakåt vid backspace. */}
              <View style={modal.codeCellRow}>
                {(() => {
                  const nextEmpty = codeCells.findIndex((c) => !c);
                  return codeCells.map((cell, i) => {
                    const isLetterCell = i < ROOM_CODE_LETTERS;
                    const isNextCell = i === nextEmpty;
                    return (
                      <React.Fragment key={i}>
                        <TextInput
                          ref={(ref) => { codeRefs.current[i] = ref; }}
                          style={[
                            modal.codeCell,
                            !!cell && modal.codeCellFilled,
                            isNextCell && !cell && modal.codeCellActive,
                          ]}
                          value={cell}
                          onChangeText={(t) => handleCodeCellChange(i, t)}
                          onKeyPress={(e) => handleCodeCellKeyPress(i, e.nativeEvent.key)}
                          maxLength={1}
                          keyboardType={isLetterCell ? 'default' : 'number-pad'}
                          autoCapitalize={isLetterCell ? 'characters' : 'none'}
                          selectTextOnFocus
                          autoFocus={i === 0}
                        />
                        {i === ROOM_CODE_LETTERS - 1 && (
                          <Text style={modal.codeDash}>–</Text>
                        )}
                      </React.Fragment>
                    );
                  });
                })()}
              </View>
              <TouchableOpacity
                style={[
                  modal.joinBtn,
                  code.length < ROOM_CODE_LENGTH && modal.joinBtnDisabled,
                ]}
                onPress={handleJoinWithCode}
                disabled={code.length < ROOM_CODE_LENGTH}
              >
                <Text style={modal.joinBtnText}>Join Game Lobby</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 'invites' && (
            <>
              <Text style={modal.title}>Waiting Invites</Text>
              <Text style={modal.subtitle}>Invites that hosts have sent you</Text>
              {invites.length === 0 ? (
                <View style={modal.emptyState}>
                  <Text style={modal.emptyIcon}>📭</Text>
                  <Text style={modal.emptyText}>No invites yet</Text>
                  <Text style={modal.emptySubtext}>
                    When a host shares a room with you, it will appear here.
                  </Text>
                </View>
              ) : (
                invites.map((inv) => (
                  <TouchableOpacity
                    key={inv.id}
                    style={modal.inviteRow}
                    activeOpacity={0.7}
                    onPress={() => handleAcceptInvite(inv)}
                  >
                    <Text style={modal.inviteEmoji}>
                      {getAvatarEmojiById(inv.fromAvatarId)}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={modal.inviteFrom}>{inv.fromPlayerName}</Text>
                      <Text style={modal.inviteCode}>Room {formatRoomCode(inv.roomCode)}</Text>
                    </View>
                    <Text style={modal.inviteJoinText}>Join ›</Text>
                  </TouchableOpacity>
                ))
              )}
            </>
          )}

          {step === 'guest' && (
            <>
              <Text style={modal.title}>Join as Guest</Text>
              <Text style={modal.subtitle}>Tap a field to fill in your details</Text>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                style={{ maxHeight: 420 }}
                contentContainerStyle={{ gap: Spacing.md }}
              >
                {/* PlayerName — måste valideras mot DB innan nästa fält öppnas */}
                <View style={modal.fieldGroup}>
                  <Text style={modal.fieldLabel}>Player Name</Text>
                  <View style={modal.playerNameRow}>
                    <TextInput
                      style={[
                        modal.inputText,
                        modal.playerNameInput,
                        // Highlightad border medan playerName är aktivt steg
                        // (inte validerat än) — samma färg som year-triggerns border.
                        playerNameStatus !== 'available' && modal.playerNameInputActive,
                      ]}
                      placeholder="Pick a unique Player Name"
                      placeholderTextColor={Colors.textDisabled}
                      value={guestName}
                      onChangeText={handleGuestNameChange}
                      maxLength={20}
                      editable={playerNameStatus !== 'checking'}
                      returnKeyType="done"
                      onSubmitEditing={handleCheckPlayerName}
                    />
                    <TouchableOpacity
                      onPress={handleCheckPlayerName}
                      disabled={!guestName.trim() || playerNameStatus === 'checking' || playerNameStatus === 'available'}
                      style={[
                        modal.checkBtn,
                        (!guestName.trim() || playerNameStatus === 'checking') && modal.checkBtnDisabled,
                        playerNameStatus === 'available' && modal.checkBtnDone,
                      ]}
                    >
                      <Text
                        style={[
                          modal.checkBtnText,
                          playerNameStatus === 'available' && modal.checkBtnTextDone,
                        ]}
                      >
                        {playerNameStatus === 'checking' ? '…'
                          : playerNameStatus === 'available' ? '✓'
                          : 'Check'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {/* Status-rad */}
                  {playerNameStatus === 'checking' && (
                    <Text style={modal.statusHint}>Checking availability…</Text>
                  )}
                  {playerNameStatus === 'available' && (
                    <Text style={[modal.statusHint, modal.statusHintOk]}>
                      ✓ Player Name is available
                    </Text>
                  )}
                  {playerNameStatus === 'taken' && (
                    <Text style={[modal.statusHint, modal.statusHintError]}>
                      ✗ Player Name already taken — try another
                    </Text>
                  )}
                  {playerNameStatus === 'invalid' && (
                    <Text style={[modal.statusHint, modal.statusHintError]}>
                      ✗ Player Name contains inappropriate language — try another
                    </Text>
                  )}
                </View>

                {/* Year of birth — drop-down picker (låst tills playerName validerat) */}
                <View
                  style={[modal.fieldGroup, !yearUnlocked && modal.fieldGroupLocked]}
                  pointerEvents={yearUnlocked ? 'auto' : 'none'}
                >
                  <Text style={modal.fieldLabel}>Competition Year of Birth</Text>
                  <TouchableOpacity
                    style={[
                      modal.yearTrigger,
                      // Lys upp triggeren när den är "nästa steg" (upplåst
                      // men inget år valt än) så ögat dras dit.
                      yearUnlocked && !parsedBirthYear && modal.yearTriggerActive,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      Keyboard.dismiss();
                      setYearPickerOpen(true);
                    }}
                  >
                    <Text
                      style={[
                        modal.yearTriggerText,
                        !parsedBirthYear && modal.yearTriggerPlaceholder,
                        yearUnlocked && !parsedBirthYear && modal.yearTriggerPlaceholderActive,
                      ]}
                    >
                      {parsedBirthYear ?? 'Select year'}
                    </Text>
                    <Text style={modal.yearTriggerArrow}>›</Text>
                  </TouchableOpacity>
                </View>

                {/* Skill level (låst tills year valt). Default 'intermediate'
                    är förvalt, så användaren kan gå direkt till Room Code. */}
                <Text
                  style={[
                    modal.statusHint,
                    !skillUnlocked && modal.fieldGroupLocked,
                  ]}
                >
                  Use default or select prefered setup
                </Text>
                <View
                  style={[modal.fieldGroup, !skillUnlocked && modal.fieldGroupLocked]}
                  pointerEvents={skillUnlocked ? 'auto' : 'none'}
                >
                  <Text style={modal.fieldLabel}>Skill Level</Text>
                  <View style={modal.skillRow}>
                    {GUEST_SKILL_OPTIONS.map((opt) => {
                      const isSelected = guestSkill === opt.id;
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          style={[
                            modal.skillBtn,
                            isSelected && modal.skillBtnActive,
                          ]}
                          onPress={() => setGuestSkill(opt.id)}
                        >
                          <Text
                            style={[
                              modal.skillBtnText,
                              isSelected && modal.skillBtnTextActive,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Room code — 3 bokstäver + bindestreck + 2 siffror.
                    Cell 1–3 visar bokstavstangentbord, 4–5 sifferkeypad.
                    Låst tills skill level är valt. */}
                <View
                  style={[modal.fieldGroup, !codeUnlocked && modal.fieldGroupLocked]}
                  pointerEvents={codeUnlocked ? 'auto' : 'none'}
                >
                  <Text style={modal.fieldLabel}>Room Code</Text>
                  <View style={modal.codeCellRow}>
                    {(() => {
                      // Hitta nästa tomma cell — den ska highlightas medan
                      // användaren fyller i koden.
                      const nextEmpty = codeCells.findIndex((c) => !c);
                      return codeCells.map((cell, i) => {
                        const isLetterCell = i < ROOM_CODE_LETTERS;
                        const isNextCell = codeUnlocked && i === nextEmpty;
                        return (
                          <React.Fragment key={i}>
                            <TextInput
                              ref={(ref) => { codeRefs.current[i] = ref; }}
                              style={[
                                modal.codeCell,
                                !!cell && modal.codeCellFilled,
                                isNextCell && !cell && modal.codeCellActive,
                              ]}
                              value={cell}
                              onChangeText={(t) => handleCodeCellChange(i, t)}
                              onKeyPress={(e) => handleCodeCellKeyPress(i, e.nativeEvent.key)}
                              maxLength={1}
                              keyboardType={isLetterCell ? 'default' : 'number-pad'}
                              autoCapitalize={isLetterCell ? 'characters' : 'none'}
                              selectTextOnFocus
                            />
                            {i === ROOM_CODE_LETTERS - 1 && (
                              <Text style={modal.codeDash}>–</Text>
                            )}
                          </React.Fragment>
                        );
                      });
                    })()}
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity
                style={[
                  modal.joinBtn,
                  !isGuestFormValid && modal.joinBtnDisabled,
                ]}
                onPress={handleJoinAsGuest}
                disabled={!isGuestFormValid}
              >
                <Text style={modal.joinBtnText}>Join as Guest</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity onPress={onClose} style={modal.cancelBtn}>
            <Text style={modal.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* ── Year-picker overlay ─────────────────────────────────
            Renderas inuti samma Modal som conditional overlay för att
            slippa nästlade native-modals (kan strula på iOS). */}
        {yearPickerOpen && (
          <View style={modal.yearPickerOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setYearPickerOpen(false)}
            />
            <View style={modal.yearPickerSheet}>
              <View style={modal.yearPickerHandle} />
              <Text style={modal.title}>Select Year of Birth</Text>
              <ScrollView style={{ maxHeight: 360 }}>
                {BIRTH_YEARS.map((year) => {
                  const selected = parsedBirthYear === year;
                  return (
                    <TouchableOpacity
                      key={year}
                      style={[modal.yearItem, selected && modal.yearItemSelected]}
                      onPress={() => {
                        setGuestBirthYearText(String(year));
                        setYearPickerOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          modal.yearItemText,
                          selected && modal.yearItemTextSelected,
                        ]}
                      >
                        {year}
                      </Text>
                      {selected && <Text style={modal.yearItemCheck}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <TouchableOpacity
                onPress={() => setYearPickerOpen(false)}
                style={modal.cancelBtn}
              >
                <Text style={modal.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ChoiceRow({
  icon, label, subtitle, onPress, disabled = false,
}: {
  icon: string; label: string; subtitle: string;
  onPress: () => void; disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[modal.choiceRow, disabled && modal.choiceRowDisabled]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[modal.choiceIcon, disabled && modal.choiceTextDisabled]}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[modal.choiceLabel, disabled && modal.choiceTextDisabled]}>{label}</Text>
        <Text style={[modal.choiceSubtitle, disabled && modal.choiceTextDisabled]}>{subtitle}</Text>
      </View>
      <Text style={[modal.choiceArrow, disabled && modal.choiceTextDisabled]}>›</Text>
    </TouchableOpacity>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const [joinVisible, setJoinVisible] = useState(false);
  const [joinInitialStep, setJoinInitialStep] = useState<JoinStep>('choose');
  const [joinHideGuest, setJoinHideGuest] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [profileMenuStep, setProfileMenuStep] = useState<'menu' | 'login' | 'register' | 'forgot'>('menu');
  const [loginPlayerName, setLoginPlayerName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  // ── Register-form state (sekventiell upplåsning som guest-flödet) ──
  const [regEmail, setRegEmail] = useState('');
  const [regPlayerName, setRegPlayerName] = useState('');
  const [regPlayerNameStatus, setRegPlayerNameStatus] = useState<PlayerNameStatus>('idle');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirmed, setRegPasswordConfirmed] = useState(false);
  const [regBirthYearText, setRegBirthYearText] = useState('');
  // Default-värden: användaren kan registrera direkt efter year of birth.
  // Skill och Region är förvalda men kan ändras via picker:erna.
  const [regSkill, setRegSkill] = useState<GuestSkill>('intermediate');
  const [regRegion, setRegRegion] = useState<RegRegion>('global');
  const [regYearPickerOpen, setRegYearPickerOpen] = useState(false);
  const [regSkillPickerOpen, setRegSkillPickerOpen] = useState(false);
  const [regRegionPickerOpen, setRegRegionPickerOpen] = useState(false);

  const pulse = useRef(new Animated.Value(1)).current;

  // Spåra föregående regEmailValid så Player Name-autofill bara triggar
  // vid email-becomes-valid-transition (inte refill om användaren rensat
  // fältet efter en autofill).
  const prevRegEmailValidRef = useRef(false);

  // Återställ menyns sub-step + alla form-fields när modalen stängs
  useEffect(() => {
    if (!profileMenuVisible) {
      const t = setTimeout(() => {
        setProfileMenuStep('menu');
        setLoginPlayerName('');
        setLoginPassword('');
        setForgotEmail('');
        setRegEmail('');
        setRegPlayerName('');
        setRegPlayerNameStatus('idle');
        setRegPassword('');
        setRegPasswordConfirmed(false);
        setRegBirthYearText('');
        setRegSkill('intermediate');
        setRegRegion('global');
        setRegYearPickerOpen(false);
        setRegSkillPickerOpen(false);
        setRegRegionPickerOpen(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [profileMenuVisible]);

  // TODO (auth): byt till riktig login-status när auth är inkopplad. Just nu
  // använder vi sparad profil i AsyncStorage som proxy för inloggad-state.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadProfile().then((data) => {
        if (active) setProfile(data);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const isLoggedIn = !!profile;

  const openJoin = (step: JoinStep = 'choose', options?: { hideGuest?: boolean }) => {
    setJoinInitialStep(step);
    setJoinHideGuest(options?.hideGuest ?? false);
    setJoinVisible(true);
  };

  const [fontsLoaded] = useFonts({
    Nunito_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
  });

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.03, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleCreateGame = () => {
    const code = generateRoomCode();
    track('room_code_created');
    router.push({ pathname: '/(tabs)/lobby', params: { code, isHost: 'true' } });
  };

  // Mock-login: sparar en minimal profil med användarens playerName.
  // Lösenordet valideras inte — det är bara UI-scaffolding.
  // Identifier-fältet accepterar både Player Name OCH email. För Player
  // Name lagrar vi som-är. För email finns ingen backend-uppslagning av
  // motsvarande Player Name, så som mock härleder vi det från email-
  // prefixet (delen före '@'). Bannern måste alltid visa ett Player
  // Name, aldrig själva email-adressen.
  // TODO (auth): byt till riktigt auth-API som validerar Player Name/
  // email + password mot backend, returnerar session-token och hämtar
  // hela profilen (inkl. det riktiga Player Name som hör till email:en).
  const handleLogin = async () => {
    const trimmed = loginPlayerName.trim();
    if (!trimmed || !loginPassword.trim()) return;
    const isEmail = trimmed.includes('@');
    const playerName = isEmail ? trimmed.split('@')[0] : trimmed;
    const minimalProfile: ProfileData = {
      playerName: playerName,
      birthYear: null,
      skill: null,
      region: null,
      avatarSource: 'default',
      selectedAvatarId: '',
    };
    await saveProfile(minimalProfile);
    setProfile(minimalProfile);
    // TODO (auth): byt playerName mot riktig user-id (UUID från backend).
    identify(playerName);
    track('user_logged_in', { method: isEmail ? 'email' : 'player_name' });
    setProfileMenuVisible(false);
  };

  // Register öppnar ett formulär i samma menyn med samma fält som
  // Profile-skärmens setup (utom Room code som inte finns här).
  const handleRegister = () => {
    setProfileMenuStep('register');
  };

  // Forgot password / playerName: skicka recovery-mail med playerName + nytt
  // lösenord + aktiveringslänk. TODO (auth): byt mock mot riktigt API-anrop.
  const forgotEmailValid = REG_EMAIL_REGEX.test(forgotEmail.trim());

  const handleForgotSubmit = () => {
    if (!forgotEmailValid) return;
    const trimmed = forgotEmail.trim();
    Keyboard.dismiss();
    setProfileMenuVisible(false);
    Alert.alert(
      'Recovery email sent',
      `We've sent your Player Name and a new password to ${trimmed}, along with an activation link.`,
    );
  };

  // ── Register-form: parsa year, gates, och submit ──────────────────
  const regParsedBirthYear = (() => {
    const n = parseInt(regBirthYearText, 10);
    if (isNaN(n) || n < MIN_BIRTH_YEAR || n > MAX_BIRTH_YEAR) return null;
    return n;
  })();
  const regEmailValid = REG_EMAIL_REGEX.test(regEmail.trim());
  // Password måste ha minst 4 tecken — minimal validering tills riktig
  // policy definieras (server-side). Användaren måste även explicit trycka
  // Confirm för att låsa lösenordet och låsa upp nästa fält.
  const regPasswordValid = regPassword.length >= 4;
  // Sekventiella gates: email → playerName → password → year → skill → region
  const regPlayerNameUnlocked = regEmailValid;
  const regPasswordUnlocked = regPlayerNameUnlocked && regPlayerNameStatus === 'available';
  const regYearUnlocked = regPasswordUnlocked && regPasswordConfirmed;
  const regSkillUnlocked = regYearUnlocked && regParsedBirthYear !== null;
  // Skill och Region är default-ifyllda, så region-låset följer skill-låset.
  const regRegionUnlocked = regSkillUnlocked;
  const isRegisterFormValid =
    regEmailValid &&
    regPlayerNameStatus === 'available' &&
    regPasswordConfirmed &&
    regParsedBirthYear !== null;

  const handleRegPlayerNameChange = (t: string) => {
    setRegPlayerName(t);
    if (regPlayerNameStatus !== 'idle') setRegPlayerNameStatus('idle');
  };

  const handleRegCheckPlayerName = () => {
    const trimmed = regPlayerName.trim();
    if (!trimmed) return;
    Keyboard.dismiss();
    setRegPlayerNameStatus('checking');
    setTimeout(() => {
      setRegPlayerNameStatus(validatePlayerName(trimmed));
    }, 600);
  };

  // Auto-fyll Player Name när email blir giltig (transition false → true)
  // och fältet är tomt. Genererar ett unikt namn (verifierat mot mock
  // TAKEN_PLAYER_NAMES) och markerar status som 'available' så användaren
  // kan gå vidare direkt. Användaren kan ändå skriva över namnet → status
  // faller tillbaka till 'idle' via handleRegPlayerNameChange och kräver Check.
  useEffect(() => {
    const wasValid = prevRegEmailValidRef.current;
    prevRegEmailValidRef.current = regEmailValid;
    if (regEmailValid && !wasValid && regPlayerName === '') {
      const generated = generatePlayerName(TAKEN_PLAYER_NAMES);
      setRegPlayerName(generated);
      setRegPlayerNameStatus('available');
    }
  }, [regEmailValid, regPlayerName]);

  // Password — användaren måste explicit Confirm:a innan year låses upp.
  // Om de ändrar password efteråt återställs confirmed-state.
  const handleRegPasswordChange = (t: string) => {
    setRegPassword(t);
    if (regPasswordConfirmed) setRegPasswordConfirmed(false);
  };

  const handleRegConfirmPassword = () => {
    if (!regPasswordValid) return;
    Keyboard.dismiss();
    setRegPasswordConfirmed(true);
  };

  // När registreringen är klar — spara komplett profil + logga in.
  // TODO (auth): trigga riktig aktiveringsmail via backend istället för
  // mock-alerten nedan. Profilen bör då markeras som "pending verification"
  // tills användaren klickat på länken.
  const handleRegisterSubmit = async () => {
    if (!isRegisterFormValid || regParsedBirthYear === null) return;
    const trimmedEmail = regEmail.trim();
    const newProfile: ProfileData = {
      playerName: regPlayerName.trim(),
      email: trimmedEmail,
      birthYear: regParsedBirthYear,
      skill: regSkill,
      region: regRegion,
      avatarSource: 'default',
      selectedAvatarId: '',
    };
    await saveProfile(newProfile);
    setProfile(newProfile);
    // TODO (auth): byt playerName mot riktig user-id (UUID från backend).
    identify(newProfile.playerName, { skill: regSkill, region: regRegion });
    track('user_registered', { skill: regSkill, region: regRegion });
    setProfileMenuVisible(false);
    Alert.alert(
      'Activation email sent',
      `We've sent an activation link to ${trimmedEmail}. Tap the link to verify your account.`,
    );
  };

  // Bekräftar och loggar ut. "Logout" rensar profilen från AsyncStorage.
  // TODO (auth): när riktig auth finns ska detta också rensa session/token,
  // inte själva profildatan.
  const handleLogout = () => {
    Alert.alert(
      'Log out?',
      'Your profile will be removed from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            await clearProfile();
            setProfile(null);
            track('user_logged_out');
            resetIdentity();
            setProfileMenuVisible(false);
          },
        },
      ],
    );
  };

  const appNameFont = fontsLoaded ? 'Nunito_700Bold' : undefined;
  const taglineFont = fontsLoaded ? 'Nunito_400Regular' : undefined;

  return (
    <SafeAreaView style={styles.safe}>

      {/* ── Top board (login status) ─────────────────────────── */}
      <TopUserBanner profile={profile} onPress={() => setProfileMenuVisible(true)} />

      <View style={styles.container}>

        {/* ── Brand ──────────────────────────────────────────── */}
        <View style={styles.brandSection}>
          <QuizVibeLogo size={104} />
          <Text style={[styles.appName, { fontFamily: appNameFont }]}>
            QuizVibe
          </Text>
          <Text style={[styles.tagline, { fontFamily: taglineFont }]}>
            Be fast. Be right. Be legendary.
          </Text>
        </View>

        {/* ── Primary actions (Join + Create) ───────────────── */}
        {/* Pulse-animationen följer den primära knappen för aktuellt
            login-state: registered när inloggad, guest när utloggad. */}
        <View style={styles.actionsSection}>
          {/* Join Game — as registered user (låst när utloggad) */}
          <Animated.View
            style={isLoggedIn ? { transform: [{ scale: pulse }] } : undefined}
          >
            <TouchableOpacity
              style={[styles.gameBtn, !isLoggedIn && styles.gameBtnDisabled]}
              activeOpacity={0.85}
              onPress={
                isLoggedIn
                  ? () => openJoin('choose', { hideGuest: true })
                  : () => setProfileMenuVisible(true)
              }
            >
              <Text
                style={[
                  styles.gameBtnText,
                  !isLoggedIn && styles.gameBtnTextDisabled,
                  { fontFamily: fontsLoaded ? 'Nunito_600SemiBold' : undefined },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {isLoggedIn
                  ? 'Join Game — as registered user'
                  : '🔒 Join Game — as registered user'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Join Game — as guest (utgråad när inloggad — då används registered).
              Döljs visuellt när Join-modalen är öppen så att modal-sheetens
              rundade ovankant inte avslöjar knappen bakom. Layout-utrymmet
              bevaras med opacity/pointerEvents så övriga knappar inte hoppar. */}
          <Animated.View
            style={[
              !isLoggedIn ? { transform: [{ scale: pulse }] } : undefined,
              joinVisible && { opacity: 0 },
            ]}
            pointerEvents={joinVisible ? 'none' : 'auto'}
          >
            <TouchableOpacity
              style={[styles.gameBtn, isLoggedIn && styles.gameBtnDisabled]}
              activeOpacity={0.85}
              onPress={() => openJoin('guest')}
              disabled={isLoggedIn}
            >
              <Text
                style={[
                  styles.gameBtnText,
                  isLoggedIn && styles.gameBtnTextDisabled,
                  { fontFamily: fontsLoaded ? 'Nunito_600SemiBold' : undefined },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Join Game — as guest
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Create Game (låst när utloggad) */}
          <Animated.View
            style={isLoggedIn ? { transform: [{ scale: pulse }] } : undefined}
          >
            <TouchableOpacity
              style={[styles.gameBtn, !isLoggedIn && styles.gameBtnDisabled]}
              activeOpacity={0.85}
              onPress={isLoggedIn ? handleCreateGame : () => setProfileMenuVisible(true)}
            >
              <Text
                style={[
                  styles.gameBtnText,
                  !isLoggedIn && styles.gameBtnTextDisabled,
                  { fontFamily: fontsLoaded ? 'Nunito_600SemiBold' : undefined },
                ]}
              >
                {isLoggedIn ? 'Create Game' : '🔒 Create Game'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {!isLoggedIn && (
            <Text style={[styles.createGameHint, { fontFamily: taglineFont }]}>
              Register and Log in to unlock the locked options
            </Text>
          )}
        </View>

        {/* ── Footer ─────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { fontFamily: taglineFont }]}>About QuizVibe</Text>
          <Text style={[styles.footerDot, { fontFamily: taglineFont }]}>·</Text>
          <Text style={[styles.footerText, { fontFamily: taglineFont }]}>Help</Text>
        </View>

      </View>

      <JoinModal
        visible={joinVisible}
        onClose={() => setJoinVisible(false)}
        initialStep={joinInitialStep}
        hideGuest={joinHideGuest}
      />

      {/* ── Profile-meny ─────────────────────────────────────── */}
      {/* När utloggad: Register / Log in. När inloggad: Log out.
          Login-steget visar playerName + password-form. */}
      <Modal
        visible={profileMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileMenuVisible(false)}
      >
        <KeyboardAvoidingView
          style={profileMenu.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={profileMenu.backdrop}
            activeOpacity={1}
            onPress={() => setProfileMenuVisible(false)}
          />
          <View style={profileMenu.sheet}>
            {/* ── Inloggad: header + Log out ────────────── */}
            {isLoggedIn && profileMenuStep === 'menu' && (
              <>
                <View style={profileMenu.header}>
                  <Text style={profileMenu.headerEmoji}>
                    {getAvatarEmojiById(profile?.selectedAvatarId)}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={profileMenu.headerName}>
                      {profile?.playerName?.trim() || 'Signed in'}
                    </Text>
                    <Text style={profileMenu.headerStatus}>Logged in</Text>
                  </View>
                </View>

                <TouchableOpacity style={profileMenu.logoutBtn} onPress={handleLogout}>
                  <Text style={profileMenu.logoutText}>Log out</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── Utloggad: Register / Log in ──────────── */}
            {!isLoggedIn && profileMenuStep === 'menu' && (
              <>
                <Text style={profileMenu.title}>Welcome to QuizVibe</Text>
                <Text style={profileMenu.subtitle}>Sign in to create and join games</Text>

                <View style={profileMenu.btnWithBadge}>
                  <TouchableOpacity
                    style={[profileMenu.secondaryBtn, profileMenu.secondaryBtnFree]}
                    onPress={handleRegister}
                  >
                    <Text style={profileMenu.secondaryBtnText}>Register</Text>
                  </TouchableOpacity>
                  {/* FREE-badge som skär kantlinjen — samma teknik som
                      HOST/GUEST-badges på spelarkorten i Lobbyn. */}
                  <View style={profileMenu.freeBadge} pointerEvents="none">
                    <Text style={profileMenu.freeBadgeText}>FREE</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={profileMenu.secondaryBtn}
                  onPress={() => setProfileMenuStep('login')}
                >
                  <Text style={profileMenu.secondaryBtnText}>Log in</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── Login-form ───────────────────────────── */}
            {!isLoggedIn && profileMenuStep === 'login' && (
              <>
                <TouchableOpacity
                  onPress={() => setProfileMenuStep('menu')}
                  style={profileMenu.backBtn}
                  hitSlop={10}
                >
                  <Text style={profileMenu.backText}>← Back</Text>
                </TouchableOpacity>

                <Text style={profileMenu.title}>Log in</Text>
                <Text style={profileMenu.subtitle}>Enter your Player Name or email and password</Text>

                {/* Sekventiell upplåsning: playerName först, sedan password.
                    Aktivt steg får primärblå border-highlight. */}
                <TextInput
                  style={[
                    profileMenu.input,
                    !loginPlayerName.trim() && profileMenu.inputActive,
                  ]}
                  placeholder="Player Name or email"
                  placeholderTextColor={Colors.textDisabled}
                  value={loginPlayerName}
                  onChangeText={setLoginPlayerName}
                  maxLength={20}
                  returnKeyType="next"
                />
                <View
                  pointerEvents={loginPlayerName.trim() ? 'auto' : 'none'}
                  style={!loginPlayerName.trim() && { opacity: 0.4 }}
                >
                  <TextInput
                    style={[
                      profileMenu.input,
                      !!loginPlayerName.trim() && !loginPassword.trim() && profileMenu.inputActive,
                    ]}
                    placeholder="Password"
                    placeholderTextColor={Colors.textDisabled}
                    value={loginPassword}
                    onChangeText={setLoginPassword}
                    secureTextEntry
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                </View>

                {/* Forgot-länk — leder till recovery-flow via email */}
                <TouchableOpacity
                  onPress={() => setProfileMenuStep('forgot')}
                  style={profileMenu.forgotLinkWrap}
                  hitSlop={6}
                >
                  <Text style={profileMenu.forgotLinkText}>
                    Forgot your Player Name or password?
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    profileMenu.primaryBtn,
                    (!loginPlayerName.trim() || !loginPassword.trim()) && profileMenu.primaryBtnDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={!loginPlayerName.trim() || !loginPassword.trim()}
                >
                  <Text style={profileMenu.primaryBtnText}>Log in</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── Forgot password / playerName ──────────────── */}
            {!isLoggedIn && profileMenuStep === 'forgot' && (
              <>
                <TouchableOpacity
                  onPress={() => setProfileMenuStep('login')}
                  style={profileMenu.backBtn}
                  hitSlop={10}
                >
                  <Text style={profileMenu.backText}>← Back</Text>
                </TouchableOpacity>

                <Text style={profileMenu.title}>Recover account</Text>
                <Text style={profileMenu.subtitle}>
                  Enter your email and we&apos;ll send your Player Name, a new password
                  and an activation link.
                </Text>

                <TextInput
                  style={[
                    profileMenu.input,
                    !forgotEmailValid && profileMenu.inputActive,
                  ]}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.textDisabled}
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={60}
                  returnKeyType="send"
                  onSubmitEditing={handleForgotSubmit}
                />

                <TouchableOpacity
                  style={[
                    profileMenu.primaryBtn,
                    !forgotEmailValid && profileMenu.primaryBtnDisabled,
                  ]}
                  onPress={handleForgotSubmit}
                  disabled={!forgotEmailValid}
                >
                  <Text style={profileMenu.primaryBtnText}>Send recovery email</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── Register-form ──────────────────────────── */}
            {!isLoggedIn && profileMenuStep === 'register' && (
              <>
                <TouchableOpacity
                  onPress={() => setProfileMenuStep('menu')}
                  style={profileMenu.backBtn}
                  hitSlop={10}
                >
                  <Text style={profileMenu.backText}>← Back</Text>
                </TouchableOpacity>

                <Text style={profileMenu.title}>Register</Text>
                <Text style={profileMenu.subtitle}>Set up your profile to start playing</Text>

                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  // automaticallyAdjustKeyboardInsets gör att iOS auto-scrollar
                  // det fokuserade fältet till syn när tangentbordet öppnas.
                  automaticallyAdjustKeyboardInsets
                  // maxHeight begränsar formens höjd så hela sheet:en alltid
                  // ryms ovanför tangentbordet (sheet chrome tar resten).
                  style={{ maxHeight: 320 }}
                  contentContainerStyle={{ gap: Spacing.md }}
                >
                  {/* Email — först ut. Aktiveringslänk skickas hit efter Register. */}
                  <View style={modal.fieldGroup}>
                    <Text style={modal.fieldLabel}>Email</Text>
                    <TextInput
                      style={[
                        modal.inputText,
                        // Highlight medan email är aktivt steg (ej giltigt än)
                        !regEmailValid && modal.playerNameInputActive,
                      ]}
                      placeholder="you@example.com"
                      placeholderTextColor={Colors.textDisabled}
                      value={regEmail}
                      onChangeText={setRegEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      maxLength={60}
                      returnKeyType="next"
                    />
                    <Text style={modal.statusHint}>
                      We&apos;ll send an activation link here to verify your address.
                    </Text>
                  </View>

                  {/* PlayerName (låst tills email är giltig) */}
                  <View
                    style={[modal.fieldGroup, !regPlayerNameUnlocked && modal.fieldGroupLocked]}
                    pointerEvents={regPlayerNameUnlocked ? 'auto' : 'none'}
                  >
                    <Text style={modal.fieldLabel}>Player Name</Text>
                    <View style={modal.playerNameRow}>
                      <TextInput
                        style={[
                          modal.inputText,
                          modal.playerNameInput,
                          regPlayerNameUnlocked && regPlayerNameStatus !== 'available' && modal.playerNameInputActive,
                        ]}
                        placeholder="Pick a unique Player Name"
                        placeholderTextColor={Colors.textDisabled}
                        value={regPlayerName}
                        onChangeText={handleRegPlayerNameChange}
                        maxLength={20}
                        editable={regPlayerNameStatus !== 'checking'}
                        returnKeyType="done"
                        onSubmitEditing={handleRegCheckPlayerName}
                      />
                      <TouchableOpacity
                        onPress={handleRegCheckPlayerName}
                        disabled={!regPlayerName.trim() || regPlayerNameStatus === 'checking' || regPlayerNameStatus === 'available'}
                        style={[
                          modal.checkBtn,
                          (!regPlayerName.trim() || regPlayerNameStatus === 'checking') && modal.checkBtnDisabled,
                          regPlayerNameStatus === 'available' && modal.checkBtnDone,
                        ]}
                      >
                        <Text
                          style={[
                            modal.checkBtnText,
                            regPlayerNameStatus === 'available' && modal.checkBtnTextDone,
                          ]}
                        >
                          {regPlayerNameStatus === 'checking' ? '…'
                            : regPlayerNameStatus === 'available' ? '✓'
                            : 'Check'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {/* När inget status-meddelande visas — visa max-längd-info */}
                    {regPlayerNameStatus === 'idle' && (
                      <Text style={modal.statusHint}>
                        Max 20 characters · {regPlayerName.length}/20
                      </Text>
                    )}
                    {regPlayerNameStatus === 'checking' && (
                      <Text style={modal.statusHint}>Checking availability…</Text>
                    )}
                    {regPlayerNameStatus === 'available' && (
                      <Text style={[modal.statusHint, modal.statusHintOk]}>
                        ✓ Player Name is available
                      </Text>
                    )}
                    {regPlayerNameStatus === 'taken' && (
                      <Text style={[modal.statusHint, modal.statusHintError]}>
                        ✗ Player Name already taken — try another
                      </Text>
                    )}
                    {regPlayerNameStatus === 'invalid' && (
                      <Text style={[modal.statusHint, modal.statusHintError]}>
                        ✗ Player Name contains inappropriate language — try another
                      </Text>
                    )}
                  </View>

                  {/* Password (låst tills playerName är validerat).
                      Användaren måste trycka Confirm för att låsa upp Year. */}
                  <View
                    style={[modal.fieldGroup, !regPasswordUnlocked && modal.fieldGroupLocked]}
                    pointerEvents={regPasswordUnlocked ? 'auto' : 'none'}
                  >
                    <Text style={modal.fieldLabel}>Password</Text>
                    <View style={modal.playerNameRow}>
                      <TextInput
                        style={[
                          modal.inputText,
                          modal.playerNameInput,
                          regPasswordUnlocked && !regPasswordConfirmed && modal.playerNameInputActive,
                        ]}
                        placeholder="At least 4 characters"
                        placeholderTextColor={Colors.textDisabled}
                        value={regPassword}
                        onChangeText={handleRegPasswordChange}
                        secureTextEntry
                        maxLength={50}
                        returnKeyType="done"
                        onSubmitEditing={handleRegConfirmPassword}
                      />
                      <TouchableOpacity
                        onPress={handleRegConfirmPassword}
                        disabled={!regPasswordValid || regPasswordConfirmed}
                        style={[
                          modal.checkBtn,
                          !regPasswordValid && modal.checkBtnDisabled,
                          regPasswordConfirmed && modal.checkBtnDone,
                        ]}
                      >
                        <Text
                          style={[
                            modal.checkBtnText,
                            regPasswordConfirmed && modal.checkBtnTextDone,
                          ]}
                        >
                          {regPasswordConfirmed ? '✓' : 'Confirm'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Year of birth */}
                  <View
                    style={[modal.fieldGroup, !regYearUnlocked && modal.fieldGroupLocked]}
                    pointerEvents={regYearUnlocked ? 'auto' : 'none'}
                  >
                    <Text style={modal.fieldLabel}>Competition Year of Birth</Text>
                    <TouchableOpacity
                      style={[
                        modal.yearTrigger,
                        regYearUnlocked && !regParsedBirthYear && modal.yearTriggerActive,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => {
                        Keyboard.dismiss();
                        setRegYearPickerOpen(true);
                      }}
                    >
                      <Text
                        style={[
                          modal.yearTriggerText,
                          !regParsedBirthYear && modal.yearTriggerPlaceholder,
                          regYearUnlocked && !regParsedBirthYear && modal.yearTriggerPlaceholderActive,
                        ]}
                      >
                        {regParsedBirthYear ?? 'Select year'}
                      </Text>
                      <Text style={modal.yearTriggerArrow}>›</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Skill level + Region scope side by side, drop-down pickers.
                      Default-värden ('intermediate'/'global') är förvalda så
                      användaren kan registrera direkt efter year of birth. */}
                  <Text
                    style={[
                      modal.statusHint,
                      !regSkillUnlocked && modal.fieldGroupLocked,
                    ]}
                  >
                    Use default or select prefered setup
                  </Text>
                  <View style={modal.fieldRow}>
                    {/* Skill level (vänster halva) */}
                    <View
                      style={[modal.fieldGroupHalf, !regSkillUnlocked && modal.fieldGroupLocked]}
                      pointerEvents={regSkillUnlocked ? 'auto' : 'none'}
                    >
                      <Text style={modal.fieldLabel}>Skill Level</Text>
                      <TouchableOpacity
                        style={modal.yearTrigger}
                        activeOpacity={0.7}
                        onPress={() => {
                          Keyboard.dismiss();
                          setRegSkillPickerOpen(true);
                        }}
                      >
                        <Text style={modal.yearTriggerText} numberOfLines={1}>
                          {GUEST_SKILL_OPTIONS.find((o) => o.id === regSkill)?.label}
                        </Text>
                        <Text style={modal.yearTriggerArrow}>›</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Region scope (höger halva) */}
                    <View
                      style={[modal.fieldGroupHalf, !regRegionUnlocked && modal.fieldGroupLocked]}
                      pointerEvents={regRegionUnlocked ? 'auto' : 'none'}
                    >
                      <Text style={modal.fieldLabel}>Region Scope</Text>
                      <TouchableOpacity
                        style={modal.yearTrigger}
                        activeOpacity={0.7}
                        onPress={() => {
                          Keyboard.dismiss();
                          setRegRegionPickerOpen(true);
                        }}
                      >
                        <Text style={modal.yearTriggerText} numberOfLines={1}>
                          {REG_REGION_OPTIONS.find((o) => o.id === regRegion)?.label}
                        </Text>
                        <Text style={modal.yearTriggerArrow}>›</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={[
                    profileMenu.primaryBtn,
                    !isRegisterFormValid && profileMenu.primaryBtnDisabled,
                  ]}
                  onPress={handleRegisterSubmit}
                  disabled={!isRegisterFormValid}
                >
                  <Text style={profileMenu.primaryBtnText}>Register</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={profileMenu.cancelBtn}
              onPress={() => setProfileMenuVisible(false)}
            >
              <Text style={profileMenu.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Year picker overlay för register-formen */}
          {regYearPickerOpen && (
            <View style={modal.yearPickerOverlay}>
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={() => setRegYearPickerOpen(false)}
              />
              <View style={modal.yearPickerSheet}>
                <View style={modal.yearPickerHandle} />
                <Text style={modal.title}>Select Year of Birth</Text>
                <ScrollView style={{ maxHeight: 360 }}>
                  {BIRTH_YEARS.map((year) => {
                    const selected = regParsedBirthYear === year;
                    return (
                      <TouchableOpacity
                        key={year}
                        style={[modal.yearItem, selected && modal.yearItemSelected]}
                        onPress={() => {
                          setRegBirthYearText(String(year));
                          setRegYearPickerOpen(false);
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
                <TouchableOpacity onPress={() => setRegYearPickerOpen(false)} style={modal.cancelBtn}>
                  <Text style={modal.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Skill picker overlay för register-formen */}
          {regSkillPickerOpen && (
            <View style={modal.yearPickerOverlay}>
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={() => setRegSkillPickerOpen(false)}
              />
              <View style={modal.yearPickerSheet}>
                <View style={modal.yearPickerHandle} />
                <Text style={modal.title}>Select Skill Level</Text>
                {GUEST_SKILL_OPTIONS.map((opt) => {
                  const selected = regSkill === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[modal.yearItem, selected && modal.yearItemSelected]}
                      onPress={() => {
                        setRegSkill(opt.id);
                        setRegSkillPickerOpen(false);
                      }}
                    >
                      <Text style={[modal.yearItemText, selected && modal.yearItemTextSelected]}>
                        {opt.label}
                      </Text>
                      {selected && <Text style={modal.yearItemCheck}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity onPress={() => setRegSkillPickerOpen(false)} style={modal.cancelBtn}>
                  <Text style={modal.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Region picker overlay för register-formen */}
          {regRegionPickerOpen && (
            <View style={modal.yearPickerOverlay}>
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={() => setRegRegionPickerOpen(false)}
              />
              <View style={modal.yearPickerSheet}>
                <View style={modal.yearPickerHandle} />
                <Text style={modal.title}>Select Region Scope</Text>
                {REG_REGION_OPTIONS.map((opt) => {
                  const selected = regRegion === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[modal.yearItem, selected && modal.yearItemSelected]}
                      onPress={() => {
                        setRegRegion(opt.id);
                        setRegRegionPickerOpen(false);
                      }}
                    >
                      <Text style={[modal.yearItemText, selected && modal.yearItemTextSelected]}>
                        {opt.label}
                      </Text>
                      {selected && <Text style={modal.yearItemCheck}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity onPress={() => setRegRegionPickerOpen(false)} style={modal.cancelBtn}>
                  <Text style={modal.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
    justifyContent: 'space-between',
  },

  brandSection: { alignItems: 'center', gap: Spacing.sm },
  appName: {
    fontSize: 38,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginTop: Spacing.sm,
  },
  tagline: {
    fontSize: 15,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },

  actionsSection: { gap: Spacing.md },
  gameBtn: {
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  gameBtnDisabled: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    opacity: 0.6,
  },
  gameBtnTextDisabled: {
    color: Colors.textSecondary,
  },
  createGameHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: -Spacing.sm,
    fontStyle: 'italic',
  },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, paddingTop: Spacing.sm },
  footerText: { fontSize: 12, color: Colors.textSecondary },
  footerDot: { fontSize: 12, color: Colors.textSecondary },
});

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.xl, gap: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  input: {
    height: 52, borderRadius: Radius.md, backgroundColor: Colors.background,
    borderWidth: 1, borderColor: Colors.borderStrong, paddingHorizontal: Spacing.lg,
    fontSize: 22, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', letterSpacing: 4,
  },
  inputText: {
    height: 52, borderRadius: Radius.md, backgroundColor: Colors.background,
    borderWidth: 1, borderColor: Colors.borderStrong, paddingHorizontal: Spacing.lg,
    fontSize: 16, fontWeight: '500', color: Colors.textPrimary,
  },
  joinBtn: { height: 52, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  joinBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.06)' },
  joinBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  cancelBtn: { alignItems: 'center', paddingVertical: Spacing.xs },
  cancelText: { fontSize: 14, color: Colors.textSecondary },

  backBtn: { alignSelf: 'flex-start', paddingVertical: 4, paddingRight: Spacing.md },
  backText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },

  // Choice list (chooser step)
  choiceList: { gap: Spacing.sm, marginTop: Spacing.xs },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  choiceIcon: { fontSize: 22, width: 28, textAlign: 'center' },
  choiceLabel: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  choiceSubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  choiceArrow: { fontSize: 22, color: Colors.textSecondary },
  choiceRowDisabled: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.06)',
  },
  choiceTextDisabled: { color: Colors.textDisabled },

  // Empty state (invites)
  emptyState: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
  },
  emptyIcon: { fontSize: 36 },
  emptyText: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
    lineHeight: 18,
  },

  // Guest-form fält
  fieldGroup: { gap: 6 },
  fieldGroupLocked: { opacity: 0.4 },
  // Side-by-side fältlayout (skill + region i samma row)
  fieldRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  fieldGroupHalf: {
    flex: 1,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.xs,
  },

  // PlayerName-rad: input + Check-knapp inline
  playerNameRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  playerNameInput: {
    flex: 1,
  },
  playerNameInputActive: {
    borderColor: Colors.primary,
  },
  checkBtn: {
    minWidth: 72,
    height: 52,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  checkBtnDone: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.success,
  },
  checkBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  checkBtnTextDone: {
    color: Colors.success,
    fontSize: 18,
  },

  // Status-rad under playerName
  statusHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.xs,
    marginTop: 2,
  },
  statusHintOk: {
    color: Colors.success,
    fontWeight: '600',
  },
  statusHintError: {
    color: Colors.error,
    fontWeight: '600',
  },
  skillRow: { flexDirection: 'row', gap: Spacing.sm },
  skillBtn: {
    flex: 1,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  skillBtnActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primaryBorder,
  },
  skillBtnText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  skillBtnTextActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },

  // Year of birth — drop-down trigger
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
  yearTriggerActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  yearTriggerText: { fontSize: 16, fontWeight: '500', color: Colors.textPrimary },
  yearTriggerPlaceholder: { color: Colors.textDisabled, fontWeight: '400' },
  yearTriggerPlaceholderActive: { color: '#FFFFFF', fontWeight: '600' },
  yearTriggerArrow: { fontSize: 18, color: Colors.textSecondary },

  // Year picker overlay (inuti samma Modal)
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

  // Room code cells (5 separata rutor med auto-focus)
  codeCellRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  codeCell: {
    flex: 1,
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  codeCellFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  // Highlight på nästa tomma cell — visar var användaren förväntas skriva
  codeCellActive: {
    borderColor: Colors.primary,
  },
  codeDash: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textSecondary,
    alignSelf: 'center',
  },

  // Invite-rader (waiting invites-listan)
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  inviteEmoji: { fontSize: 24, width: 36, textAlign: 'center' },
  inviteFrom: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  inviteCode: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
    marginTop: 2,
  },
  inviteJoinText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});

const profileMenu = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerEmoji: {
    fontSize: 28,
    width: 40,
    textAlign: 'center',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerStatus: {
    fontSize: 12,
    color: Colors.success,
    marginTop: 2,
  },
  logoutBtn: {
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,107,107,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  cancelText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Login / Register sub-menu
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  primaryBtn: {
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Matchar startskärmens gameBtn-style så Register / Log in i menyn
  // ser ut som Join Game / Create Game-knapparna.
  secondaryBtn: {
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  // Override för Register: grön kantlinje som matchar FREE-badgen och
  // signalerar "gratis / new-user-friendly".
  secondaryBtnFree: {
    borderColor: Colors.success,
  },

  // Wrapper som ger position-context för FREE-badgen på Register-knappen
  btnWithBadge: {
    position: 'relative',
  },
  freeBadge: {
    position: 'absolute',
    top: -8,
    right: Spacing.lg,
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
  input: {
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  inputActive: {
    borderColor: Colors.primary,
  },
  // "Forgot password"-länk under password-fältet
  forgotLinkWrap: {
    alignSelf: 'flex-end',
    paddingVertical: 2,
  },
  forgotLinkText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingRight: Spacing.md,
  },
  backText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
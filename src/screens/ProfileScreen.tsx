import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { HCPShield } from '../components/HCPShield';
import { PlayerHistorySection } from '../components/PlayerHistorySection';
import { Colors, FontSize, FontWeight, Radius, Spacing, Typography } from '../theme';
import type { ProfileScreenProps } from '../types/navigation';
import { AVATARS, getAvatarEmojiById } from '../utils/avatars';
import {
    addFriend,
    loadFriends,
    removeFriend,
    type Friend,
} from '../utils/friendsStorage';
import {
    loadProfile,
    saveProfile,
    type AvatarSource,
    type Region,
    type Skill,
} from '../utils/profileStorage';

// ─── Data ─────────────────────────────────────────────────────────────────────

type AvatarCategory = 'All' | 'Retro' | 'Music' | 'Tech' | 'Fun';

const CATEGORIES: AvatarCategory[] = ['All', 'Retro', 'Music', 'Tech', 'Fun'];

// ─── Birth year options (descending, newest first) ────────────────────────────
const CURRENT_YEAR = new Date().getFullYear();
const MIN_BIRTH_YEAR = 1930;
const MAX_BIRTH_YEAR = CURRENT_YEAR - 5;
const BIRTH_YEARS = Array.from(
  { length: MAX_BIRTH_YEAR - MIN_BIRTH_YEAR + 1 },
  (_, i) => MAX_BIRTH_YEAR - i,
);

const SOURCE_OPTIONS: { id: AvatarSource; icon: string; label: string; subtitle: string }[] = [
  { id: 'upload',  icon: '📤', label: 'Upload Photo',   subtitle: 'Use a photo from your library' },
  { id: 'choose',  icon: '✨', label: 'Choose Avatar',  subtitle: 'Pick from our collection'      },
  { id: 'default', icon: '😶', label: 'Default Image',  subtitle: 'Anonymous silhouette'          },
];

// ─── Competition defaults ─────────────────────────────────────────────────────
// NOTE: skill-id matchar quiz.tsx ('expert') men visas som "Advanced" i UI
const SKILL_OPTIONS: { id: Skill; label: string }[] = [
  { id: 'easy',         label: 'Easy'         },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'expert',       label: 'Advanced'     },
];

const REGION_OPTIONS: { id: Region; label: string }[] = [
  { id: 'sweden',  label: 'Sweden'  },
  { id: 'nordics', label: 'Nordics' },
  { id: 'global',  label: 'Global'  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen(_props: ProfileScreenProps) {
  const [source, setSource]               = useState<AvatarSource>('choose');
  const [category, setCategory]           = useState<AvatarCategory>('All');
  const [selectedAvatarId, setSelectedId] = useState<string>('5');
  const [isSaved, setIsSaved]             = useState(false);
  const [pickerOpen, setPickerOpen]       = useState(false);
  const [nickname, setNickname]           = useState('Player One');
  const [birthYear, setBirthYear]         = useState<number | null>(null);
  const [skill, setSkill]                 = useState<Skill | null>(null);
  const [region, setRegion]               = useState<Region | null>(null);
  const [gameCredits, setGameCredits]     = useState<number>(0);
  const [spotifyConnected, setSpotifyConnected] = useState<boolean>(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsModalOpen, setFriendsModalOpen] = useState(false);
  const [newFriendNickname, setNewFriendNickname] = useState('');
  const [yearPickerOpen, setYearPickerOpen]     = useState(false);
  const [skillPickerOpen, setSkillPickerOpen]   = useState(false);
  const [regionPickerOpen, setRegionPickerOpen] = useState(false);

  // Ladda sparad profil från AsyncStorage vid mount
  useEffect(() => {
    loadProfile().then((data) => {
      if (!data) return;
      setNickname(data.nickname);
      setBirthYear(data.birthYear);
      setSkill(data.skill);
      setRegion(data.region);
      setSource(data.avatarSource);
      setSelectedId(data.selectedAvatarId);
      setGameCredits(data.gameCredits ?? 0);
      setSpotifyConnected(data.spotifyConnected ?? false);
    });
  }, []);

  // Refresh game credits varje gång Profile får fokus — t.ex. när användaren
  // kommer tillbaka från Store efter att ha köpt Extra Games.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadProfile().then((data) => {
        if (active && data) setGameCredits(data.gameCredits ?? 0);
      });
      loadFriends().then((list) => {
        if (active) setFriends(list);
      });
      return () => { active = false; };
    }, []),
  );

  const handleAddFriend = async () => {
    if (!newFriendNickname.trim()) return;
    const updated = await addFriend(newFriendNickname);
    setFriends(updated);
    setNewFriendNickname('');
  };

  const handleRemoveFriend = async (id: string) => {
    const updated = await removeFriend(id);
    setFriends(updated);
  };

  const selectedAvatar = AVATARS.find((a) => a.id === selectedAvatarId);
  const age = birthYear !== null ? CURRENT_YEAR - birthYear : null;
  const skillLabel  = SKILL_OPTIONS.find((s) => s.id === skill)?.label;
  const regionLabel = REGION_OPTIONS.find((r) => r.id === region)?.label;

  const handleSave = async () => {
    try {
      await saveProfile({
        nickname,
        birthYear,
        skill,
        region,
        avatarSource: source,
        selectedAvatarId,
        gameCredits,
        spotifyConnected,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch {
      // TODO: visa felmeddelande till användaren om spara misslyckas
    }
  };

  const previewCaption =
    source === 'upload'  ? 'Custom photo'
    : source === 'default' ? 'Default image'
    : `${selectedAvatar?.category ?? ''} avatar`;

  // Mock Spotify connect: för riktig integration används OAuth via Spotify
  // Web API + expo-auth-session. Just nu togglas bara state + spara på profil.
  // TODO (auth): implementera riktig Spotify OAuth.
  const handleConnectSpotify = async () => {
    setSpotifyConnected(true);
    try {
      const data = await loadProfile();
      const next = {
        nickname: data?.nickname ?? nickname,
        birthYear: data?.birthYear ?? birthYear,
        skill: data?.skill ?? skill,
        region: data?.region ?? region,
        avatarSource: data?.avatarSource ?? source,
        selectedAvatarId: data?.selectedAvatarId ?? selectedAvatarId,
        gameCredits: data?.gameCredits ?? gameCredits,
        spotifyConnected: true,
      };
      await saveProfile(next);
    } catch {
      // tyst — UI:t har redan uppdaterats
    }
  };

  const handleDisconnectSpotify = () => {
    Alert.alert(
      'Disconnect Spotify?',
      'Songs during games will play with Spotify ads.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            setSpotifyConnected(false);
            try {
              const data = await loadProfile();
              if (data) {
                await saveProfile({ ...data, spotifyConnected: false });
              }
            } catch {
              // tyst
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.screenTitle}>Profile</Text>
            <Text style={styles.screenSubtitle}>Define your setup</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.creditsPill,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => router.push('/store')}
          >
            <Text style={styles.creditsLabel}>Game credits</Text>
            <View style={styles.creditsValueRow}>
              <Text style={styles.creditsIcon}>🎟️</Text>
              <Text style={styles.creditsValue}>{gameCredits}</Text>
              <Text style={styles.creditsArrow}>›</Text>
            </View>
          </Pressable>
        </View>

        {/* ── Profile card: avatar + nickname (vänster), competition setup (höger), Save längst ner */}
        {/* TODO (backend): Nickname måste vara unikt i Quizvibe — lägg till
            en check mot backend när användaren sparar (eller on-blur), så att
            samma nickname inte kan registreras av flera profiler. Används
            senare för vän-sökning. */}
        <View style={styles.preview}>
          <View style={styles.columnsRow}>
          {/* Vänsterkolumn: avatar + nickname under */}
          <View style={styles.leftColumn}>
            <Pressable
              onPress={() => setPickerOpen(true)}
              style={({ pressed }) => [
                styles.avatarButton,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Avatar
                emoji={source === 'default' ? '😶' : selectedAvatar?.emoji}
                size={96}
              />
              <View style={styles.changeBadge} pointerEvents="none">
                <Text style={styles.changeBadgeText}>Change</Text>
              </View>
            </Pressable>

            <TextInput
              value={nickname}
              onChangeText={setNickname}
              maxLength={20}
              placeholder="Nickname"
              placeholderTextColor={Colors.textDisabled}
              style={styles.nicknameInput}
              returnKeyType="done"
              textAlign="center"
            />

            {/* HCP-sköld – visuell indikator för spelarens ranking.
                TODO (Fas 6): Värdet ska beräknas dynamiskt från spelade
                rundor + skill-golv (Easy=66, Intermediate=33, Expert=1).
                Just nu är 99 hårdkodat (standardvärde för ny spelare). */}
            <HCPShield hcp={99} size={96} />
          </View>

          {/* Högerkolumn: competition setup */}
          <View style={styles.rightColumn}>
            <Text style={styles.setupHeader}>
              Define competition default setup
            </Text>

            {/* Competition Year of birth */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Competition Year of birth</Text>
              <Pressable
                onPress={() => setYearPickerOpen(true)}
                style={({ pressed }) => [
                  styles.selector,
                  pressed && styles.selectorPressed,
                ]}
              >
                <Text
                  style={[
                    styles.selectorText,
                    birthYear === null && styles.selectorPlaceholder,
                  ]}
                >
                  {birthYear ?? 'Select'}
                </Text>
                <Text style={styles.selectorChevron}>›</Text>
              </Pressable>
            </View>

            {/* Competition Age (auto-beräknad, icke-tappbar) */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Competition Age</Text>
              <View style={styles.readonlyValue}>
                <Text
                  style={[
                    styles.selectorText,
                    age === null && styles.selectorPlaceholder,
                  ]}
                >
                  {age ?? '—'}
                </Text>
              </View>
            </View>

            {/* Skill level */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Skill level</Text>
              <Pressable
                onPress={() => setSkillPickerOpen(true)}
                style={({ pressed }) => [
                  styles.selector,
                  pressed && styles.selectorPressed,
                ]}
              >
                <Text
                  style={[
                    styles.selectorText,
                    skill === null && styles.selectorPlaceholder,
                  ]}
                >
                  {skillLabel ?? 'Select'}
                </Text>
                <Text style={styles.selectorChevron}>›</Text>
              </Pressable>
            </View>

            {/* Region */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Region</Text>
              <Pressable
                onPress={() => setRegionPickerOpen(true)}
                style={({ pressed }) => [
                  styles.selector,
                  pressed && styles.selectorPressed,
                ]}
              >
                <Text
                  style={[
                    styles.selectorText,
                    region === null && styles.selectorPlaceholder,
                  ]}
                >
                  {regionLabel ?? 'Select'}
                </Text>
                <Text style={styles.selectorChevron}>›</Text>
              </Pressable>
            </View>
          </View>
          </View>

          {/* ── Save (inuti kortet) ─────────────────────────────── */}
          <Button
            label={isSaved ? '✓ Saved' : 'Save Profile'}
            onPress={handleSave}
            variant={isSaved ? 'secondary' : 'primary'}
          />
        </View>

        {/* ── Spotify-koppling ──────────────────────────────────── */}
        {/* Viktig integration: tillåter ad-free playback under quiz-rundor. */}
        <View style={styles.spotifyCard}>
          <View style={styles.spotifyHeader}>
            <View style={styles.spotifyIconWrap}>
              <Text style={styles.spotifyIcon}>🎵</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.spotifyTitle}>
                {spotifyConnected ? 'Spotify connected' : 'Connect your Spotify account'}
              </Text>
              <Text style={styles.spotifySubtitle}>
                {spotifyConnected
                  ? 'Songs play full-length with no Spotify ads.'
                  : 'Play full songs ad-free during game rounds.'}
              </Text>
            </View>
            {spotifyConnected && <Text style={styles.spotifyCheck}>✓</Text>}
          </View>

          <Pressable
            onPress={spotifyConnected ? handleDisconnectSpotify : handleConnectSpotify}
            style={({ pressed }) => [
              styles.spotifyBtn,
              spotifyConnected ? styles.spotifyBtnDisconnect : styles.spotifyBtnConnect,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={[
              styles.spotifyBtnText,
              spotifyConnected && styles.spotifyBtnTextDisconnect,
            ]}>
              {spotifyConnected ? 'Disconnect' : 'Connect Spotify'}
            </Text>
          </Pressable>
        </View>

        {/* ── QuizVibe friends ─────────────────────────────────── */}
        {/* Sparade nicknames används senare för direktinbjudningar via
            Lobby's Share invite (visas hos vänner i Join Waiting Invites). */}
        <View style={styles.friendsCard}>
          <View style={styles.friendsHeader}>
            <View style={styles.friendsIconWrap}>
              <Text style={styles.friendsIcon}>👥</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.friendsTitle}>QuizVibe friends</Text>
              <Text style={styles.friendsSubtitle}>
                {friends.length === 0
                  ? 'Add friends to invite them in one tap.'
                  : `${friends.length} ${friends.length === 1 ? 'friend' : 'friends'} saved`}
              </Text>
            </View>
            <View style={styles.friendsCount}>
              <Text style={styles.friendsCountText}>{friends.length}</Text>
            </View>
          </View>

          <Pressable
            onPress={() => setFriendsModalOpen(true)}
            style={({ pressed }) => [
              styles.friendsBtn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.friendsBtnText}>+ Add QuizVibe Friends</Text>
          </Pressable>
        </View>

        {/* ── Player history (mockdata tills backend finns) ──────── */}
        <PlayerHistorySection />

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* ── Avatar picker modal ──────────────────────────────────── */}
      <Modal
        visible={pickerOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPickerOpen(false)}
      >
        <AvatarPicker
          source={source}
          setSource={setSource}
          category={category}
          setCategory={setCategory}
          selectedAvatarId={selectedAvatarId}
          setSelectedId={setSelectedId}
          onClose={() => setPickerOpen(false)}
        />
      </Modal>

      {/* ── Friends management modal ──────────────────────────────── */}
      <Modal
        visible={friendsModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setFriendsModalOpen(false)}
      >
        <View style={friendsModal.overlay}>
          <Pressable
            style={friendsModal.backdrop}
            onPress={() => setFriendsModalOpen(false)}
          />
          <View style={friendsModal.sheet}>
            <View style={friendsModal.handle} />
            <Text style={friendsModal.title}>QuizVibe friends</Text>
            <Text style={friendsModal.subtitle}>
              Save nicknames to invite friends with one tap from Lobby.
            </Text>

            {/* Add friend row */}
            <View style={friendsModal.addRow}>
              <TextInput
                style={friendsModal.addInput}
                placeholder="Add by nickname"
                placeholderTextColor={Colors.textDisabled}
                value={newFriendNickname}
                onChangeText={setNewFriendNickname}
                maxLength={20}
                returnKeyType="done"
                onSubmitEditing={handleAddFriend}
              />
              <Pressable
                onPress={handleAddFriend}
                disabled={!newFriendNickname.trim()}
                style={({ pressed }) => [
                  friendsModal.addBtn,
                  !newFriendNickname.trim() && friendsModal.addBtnDisabled,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={friendsModal.addBtnText}>Add</Text>
              </Pressable>
            </View>

            {/* List */}
            <ScrollView style={{ maxHeight: 320 }}>
              {friends.length === 0 ? (
                <View style={friendsModal.emptyState}>
                  <Text style={friendsModal.emptyIcon}>🫥</Text>
                  <Text style={friendsModal.emptyText}>No friends yet</Text>
                  <Text style={friendsModal.emptySubtext}>
                    Add a nickname above to start your list.
                  </Text>
                </View>
              ) : (
                friends.map((friend, i) => (
                  <View key={friend.id}>
                    <View style={friendsModal.friendRow}>
                      <Text style={friendsModal.friendEmoji}>
                        {getAvatarEmojiById(friend.avatarId)}
                      </Text>
                      <Text style={friendsModal.friendName}>{friend.nickname}</Text>
                      <Pressable
                        onPress={() => handleRemoveFriend(friend.id)}
                        hitSlop={10}
                        style={friendsModal.removeBtn}
                      >
                        <Text style={friendsModal.removeBtnText}>×</Text>
                      </Pressable>
                    </View>
                    {i < friends.length - 1 && <View style={friendsModal.divider} />}
                  </View>
                ))
              )}
            </ScrollView>

            <Pressable
              onPress={() => setFriendsModalOpen(false)}
              style={friendsModal.closeBtn}
            >
              <Text style={friendsModal.closeBtnText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ── Birth year picker modal ──────────────────────────────── */}
      <Modal
        visible={yearPickerOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setYearPickerOpen(false)}
      >
        <Pressable
          style={styles.pickerBackdrop}
          onPress={() => setYearPickerOpen(false)}
        >
          <Pressable style={styles.pickerCard} onPress={() => {}}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Birth Year</Text>
              <Pressable
                onPress={() => setYearPickerOpen(false)}
                style={({ pressed }) => [
                  styles.modalClose,
                  pressed && { opacity: 0.6 },
                ]}
                hitSlop={10}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>
            <FlatList
              data={BIRTH_YEARS}
              keyExtractor={(y) => y.toString()}
              showsVerticalScrollIndicator={false}
              initialScrollIndex={
                birthYear !== null
                  ? Math.max(0, BIRTH_YEARS.indexOf(birthYear) - 2)
                  : Math.max(0, BIRTH_YEARS.indexOf(1990) - 2)
              }
              getItemLayout={(_, index) => ({
                length: 48,
                offset: 48 * index,
                index,
              })}
              renderItem={({ item }) => {
                const isSelected = birthYear === item;
                const itemAge = CURRENT_YEAR - item;
                return (
                  <Pressable
                    onPress={() => {
                      setBirthYear(item);
                      setYearPickerOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.yearRow,
                      isSelected && styles.yearRowSelected,
                      pressed && styles.yearRowPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.yearText,
                        isSelected && styles.yearTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                    <Text style={styles.yearAge}>{itemAge} yrs</Text>
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Skill picker modal ───────────────────────────────────── */}
      <Modal
        visible={skillPickerOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setSkillPickerOpen(false)}
      >
        <Pressable
          style={styles.pickerBackdrop}
          onPress={() => setSkillPickerOpen(false)}
        >
          <Pressable style={styles.pickerCardShort} onPress={() => {}}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Skill level</Text>
              <Pressable
                onPress={() => setSkillPickerOpen(false)}
                style={({ pressed }) => [
                  styles.modalClose,
                  pressed && { opacity: 0.6 },
                ]}
                hitSlop={10}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>
            {SKILL_OPTIONS.map((opt) => {
              const isSelected = skill === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => {
                    setSkill(opt.id);
                    setSkillPickerOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.optionRow,
                    isSelected && styles.optionRowSelected,
                    pressed && styles.optionRowPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {isSelected && <Text style={styles.optionCheck}>✓</Text>}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Region picker modal ──────────────────────────────────── */}
      <Modal
        visible={regionPickerOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setRegionPickerOpen(false)}
      >
        <Pressable
          style={styles.pickerBackdrop}
          onPress={() => setRegionPickerOpen(false)}
        >
          <Pressable style={styles.pickerCardShort} onPress={() => {}}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Region</Text>
              <Pressable
                onPress={() => setRegionPickerOpen(false)}
                style={({ pressed }) => [
                  styles.modalClose,
                  pressed && { opacity: 0.6 },
                ]}
                hitSlop={10}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>
            {REGION_OPTIONS.map((opt) => {
              const isSelected = region === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => {
                    setRegion(opt.id);
                    setRegionPickerOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.optionRow,
                    isSelected && styles.optionRowSelected,
                    pressed && styles.optionRowPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {isSelected && <Text style={styles.optionCheck}>✓</Text>}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Avatar picker (inside modal) ─────────────────────────────────────────────

function AvatarPicker({
  source, setSource,
  category, setCategory,
  selectedAvatarId, setSelectedId,
  onClose,
}: {
  source: AvatarSource;
  setSource: (s: AvatarSource) => void;
  category: AvatarCategory;
  setCategory: (c: AvatarCategory) => void;
  selectedAvatarId: string;
  setSelectedId: (id: string) => void;
  onClose: () => void;
}) {
  const filteredAvatars =
    category === 'All' ? AVATARS : AVATARS.filter((a) => a.category === category);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Change Avatar</Text>
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [styles.modalClose, pressed && { opacity: 0.6 }]}
          hitSlop={10}
        >
          <Text style={styles.modalCloseText}>✕</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.modalContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Source selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Photo Source</Text>
          <Card padding={Spacing.sm}>
            {SOURCE_OPTIONS.map((opt, i) => (
              <React.Fragment key={opt.id}>
                <SourceRow
                  icon={opt.icon}
                  label={opt.label}
                  subtitle={opt.subtitle}
                  selected={source === opt.id}
                  onPress={() => setSource(opt.id)}
                />
                {i < SOURCE_OPTIONS.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </Card>
        </View>

        {/* Avatar picker (only when source = 'choose') */}
        {source === 'choose' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Avatar Collection</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
            >
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[styles.chip, category === cat && styles.chipActive]}
                >
                  <Text style={[styles.chipLabel, category === cat && styles.chipLabelActive]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Card padding={Spacing.md}>
              <View style={styles.grid}>
                {filteredAvatars.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => setSelectedId(item.id)}
                    style={styles.gridCell}
                  >
                    <Avatar
                      emoji={item.emoji}
                      size={56}
                      selected={selectedAvatarId === item.id}
                    />
                  </Pressable>
                ))}
              </View>
            </Card>
          </View>
        )}

        <Button label="Done" onPress={onClose} variant="primary" />

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── SourceRow sub-component ──────────────────────────────────────────────────

function SourceRow({
  icon, label, subtitle, selected, onPress,
}: {
  icon: string; label: string; subtitle: string;
  selected: boolean; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.sourceRow,
        selected && styles.sourceRowSelected,
        pressed && styles.sourceRowPressed,
      ]}
    >
      <View style={[styles.sourceIcon, selected && styles.sourceIconSelected]}>
        <Text style={styles.sourceIconText}>{icon}</Text>
      </View>
      <View style={styles.sourceInfo}>
        <Text style={[styles.sourceLabel, selected && styles.sourceLabelSelected]}>
          {label}
        </Text>
        <Text style={styles.sourceSubtitle}>{subtitle}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xl,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  headerLeft: { flex: 1, gap: 4 },
  screenTitle: { ...Typography.screenTitle, color: Colors.textPrimary },
  screenSubtitle: { ...Typography.label, color: Colors.textSecondary },

  // Game credits pill (top-right of Profile header)
  creditsPill: {
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    alignItems: 'center',
    gap: 2,
    minWidth: 110,
  },
  creditsLabel: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  creditsValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  creditsIcon: { fontSize: 14 },
  creditsValue: {
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
  },
  creditsArrow: { fontSize: 16, color: Colors.primary, marginLeft: 2 },

  // Spotify connect-card (viktig integration — Spotify-grön accent)
  spotifyCard: {
    backgroundColor: 'rgba(29,185,84,0.08)',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: '#1DB954',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  spotifyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  spotifyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotifyIcon: { fontSize: 22 },
  spotifyTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  spotifySubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  spotifyCheck: {
    fontSize: 22,
    color: '#1DB954',
    fontWeight: FontWeight.bold,
  },
  spotifyBtn: {
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotifyBtnConnect: {
    backgroundColor: '#1DB954',
  },
  spotifyBtnDisconnect: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  spotifyBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  spotifyBtnTextDisconnect: {
    color: Colors.textSecondary,
  },

  // QuizVibe friends card (samma struktur som Spotify-kortet:
  // header upptill, full-bredd-knapp i underkant)
  friendsCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  friendsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  friendsIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendsIcon: { fontSize: 22 },
  friendsTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  friendsSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  friendsCount: {
    minWidth: 32,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendsCountText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
  },
  friendsBtn: {
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendsBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // Preview card — vertical container: [columns row] + [Save button]
  preview: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  // Inre rad som håller vänster- och högerkolumnen sida vid sida
  columnsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.lg,
  },

  // Left column: avatar + nickname under
  leftColumn: {
    alignItems: 'center',
    gap: Spacing.md,
    width: 104,
  },
  avatarButton: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeBadge: {
    position: 'absolute',
    bottom: 4,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(11,18,32,0.85)',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  changeBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  nicknameInput: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    padding: 0,
    margin: 0,
    width: '100%',
  },

  // Right column: competition setup
  rightColumn: {
    flex: 1,
    gap: Spacing.sm + 2,
  },
  setupHeader: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  field: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.sm + 2,
    backgroundColor: Colors.cardElevated,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectorPressed: { opacity: 0.7 },
  selectorText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  selectorPlaceholder: {
    color: Colors.textDisabled,
    fontWeight: FontWeight.regular,
  },
  selectorChevron: {
    fontSize: 18,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  readonlyValue: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.sm + 2,
  },

  // Option-rows in skill/region pickers
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  optionRowSelected: { backgroundColor: Colors.primaryMuted },
  optionRowPressed: { backgroundColor: 'rgba(255,255,255,0.04)' },
  optionText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  optionCheck: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },

  // Modal
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  modalClose: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.card,
    alignItems: 'center', justifyContent: 'center',
  },
  modalCloseText: { fontSize: 14, color: Colors.textSecondary },
  modalContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xl,
  },

  // Sections
  section: { gap: Spacing.sm },
  sectionLabel: {
    ...Typography.overline,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.separator,
    marginHorizontal: Spacing.md,
  },

  // Source rows
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    gap: Spacing.md,
  },
  sourceRowSelected: { backgroundColor: Colors.primaryMuted },
  sourceRowPressed: { backgroundColor: 'rgba(255,255,255,0.04)' },
  sourceIcon: {
    width: 40, height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  sourceIconSelected: { backgroundColor: Colors.primaryBorder },
  sourceIconText: { fontSize: 18 },
  sourceInfo: { flex: 1 },
  sourceLabel: { ...Typography.bodyMedium, color: Colors.textPrimary },
  sourceLabelSelected: { color: Colors.primary },
  sourceSubtitle: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderColor: Colors.primary },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },

  // Category chips
  categoryRow: { gap: Spacing.sm, paddingBottom: Spacing.xs },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm - 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primaryBorder },
  chipLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  chipLabelActive: { color: Colors.primary },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  gridCell: { width: '22%', alignItems: 'center', paddingVertical: Spacing.xs },

  // Year picker modal (centered card)
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  pickerCard: {
    maxHeight: '65%',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  pickerCardShort: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
  yearRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  yearRowSelected: { backgroundColor: Colors.primaryMuted },
  yearRowPressed: { backgroundColor: 'rgba(255,255,255,0.04)' },
  yearText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  yearTextSelected: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  yearAge: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },

  bottomPad: { height: Spacing.xl },
});

const friendsModal = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
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
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderStrong,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  addRow: {
    gap: Spacing.sm,
  },
  addInput: {
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingHorizontal: Spacing.lg,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  addBtn: {
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  addBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#fff',
    letterSpacing: 0.3,
  },
  emptyState: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.xl,
  },
  emptyIcon: { fontSize: 36 },
  emptyText: {
    fontSize: 16,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  friendEmoji: {
    fontSize: 22,
    width: 36,
    textAlign: 'center',
  },
  friendName: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    fontSize: 18,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.separator,
  },
  closeBtn: {
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
});

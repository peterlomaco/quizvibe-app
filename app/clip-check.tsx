// Clip Check — curator-verktyg för att spela ETT valt YouTube-klipp genom
// EXAKT samma inbäddade spelare som quizet använder.
//
// Varför det behövs: den vanliga quiz-loopen slumpar fram frågor, så det
// går inte att kontrollera ett specifikt klipp efter att man bytt videoId.
// Och att titta på youtube.com bevisar ingenting — de fel vi drabbas av
// (embedding avstängd, region-block, allow-list utan SE) gäller just den
// INBÄDDADE spelaren. Watch-sidan kan spela perfekt medan embedden visar
// "Video unavailable". Därför renderar den här skärmen <MediaPlayer> med
// samma props som quiz.tsx.
//
// Nås via deep link (ingen knapp i UI:t — det här är ett dev-verktyg):
//   exp://<expo-url>/--/clip-check        (Expo Go)
//   quizvibeapp://clip-check              (dev-/standalone-build)
//
// Vad man tittar efter:
//   1. Spelas ljudet alls? (annars: embed-block → hårt fel)
//   2. Startar det på rätt ställe? (startSec)
//   3. Syns ett ÅRTAL i YouTube-titelraden? Det spoilar Year-frågor.
//   4. Är bilden acceptabel? (SD-klipp är märkbart pixliga)

import { MediaPlayer } from '@/src/components/MediaPlayer';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/theme';
import type { YoutubeClip } from '@/src/utils/mediaSource';
import { MUSIC_QUESTIONS, type MusicQuestion } from '@/src/utils/musicQuestions';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

/**
 * Klipp som bytts eller lagts till senast och ännu inte hörts i appen.
 * Uppdatera listan vid varje curerings-pass så det är noll friktion att
 * verifiera. Tom lista → bara sökfältet visas.
 */
const PENDING_VERIFICATION: string[] = [
  'queen-we-are-the-champions',
  'queen-we-will-rock-you',
  'queen-another-one-bites-the-dust',
];

type PlayerStatus = 'idle' | 'loading' | 'ready' | 'ended' | 'error';

const STATUS_LABEL: Record<PlayerStatus, string> = {
  idle: 'Not started',
  loading: 'Loading…',
  ready: 'Playing',
  ended: 'Clip ended',
  error: 'ERROR — embed refused (this is the bug we hunt)',
};

const STATUS_COLOR: Record<PlayerStatus, string> = {
  idle: Colors.textSecondary,
  loading: Colors.textSecondary,
  ready: Colors.success,
  ended: Colors.textSecondary,
  error: Colors.error,
};

/** Bara items som faktiskt har ett klipp att spela. */
const PLAYABLE = MUSIC_QUESTIONS.filter((q) => q.youtubeClips.length > 0);

export default function ClipCheckScreen() {
  const [selected, setSelected] = useState<MusicQuestion | null>(null);
  const [status, setStatus] = useState<PlayerStatus>('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [query, setQuery] = useState('');

  const pending = useMemo(
    () =>
      PENDING_VERIFICATION.map((id) => PLAYABLE.find((q) => q.id === id)).filter(
        (q): q is MusicQuestion => !!q,
      ),
    [],
  );

  // Sök först när användaren skrivit något — 495 rader på en gång är inte
  // hjälpsamt och gör listan trög.
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (term.length < 2) return [];
    return PLAYABLE.filter(
      (q) =>
        q.displayName.toLowerCase().includes(term) ||
        q.id.toLowerCase().includes(term),
    ).slice(0, 25);
  }, [query]);

  function handleSelect(q: MusicQuestion) {
    setSelected(q);
    setStatus('loading');
    setIsPlaying(true);
  }

  const clip: YoutubeClip | null = selected?.youtubeClips[0] ?? null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.replace('/')} hitSlop={8}>
          <Text style={styles.backText}>← Home</Text>
        </Pressable>
        <Text style={styles.topTitle}>Clip Check</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ── Spelare ─────────────────────────────────────────────── */}
        {selected && clip ? (
          <View style={styles.playerBlock}>
            {/* key tvingar remount vid klippbyte — annars kan expo-image/
                WebView-cachen visa förra klippet en stund. */}
            <MediaPlayer
              key={clip.videoId}
              source={{ kind: 'youtube', clip }}
              isPlaying={isPlaying}
              // Alltid synlig video här (till skillnad från quizet, som
              // döljer den under frågan) — vi MÅSTE kunna läsa titelraden
              // för att upptäcka årtals-spoilers.
              showVideo
              isMuted={false}
              onReady={() => setStatus('ready')}
              onEnded={() => {
                setStatus('ended');
                setIsPlaying(false);
              }}
              onError={() => {
                setStatus('error');
                setIsPlaying(false);
              }}
            />

            <Text style={[styles.status, { color: STATUS_COLOR[status] }]}>
              {STATUS_LABEL[status]}
            </Text>

            <Text style={styles.nowTitle}>{selected.displayName}</Text>
            <View style={styles.metaBox}>
              <MetaRow label="Item id" value={selected.id} />
              <MetaRow label="Video id" value={clip.videoId} />
              <MetaRow label="Channel" value={clip.channelTitle ?? '—'} />
              <MetaRow
                label="Window"
                value={`${clip.startSec}s – ${clip.endSec}s`}
              />
              <MetaRow
                label="Correct year"
                value={selected.correctYear ? String(selected.correctYear) : '—'}
              />
            </View>
            {/* endSec klipper INTE uppspelningen (spelaren sätter medvetet
                inte `end` i initialPlayerParams) — i quizet stoppas ljudet
                av svarstimern. Här spelar klippet vidare tills man stoppar. */}
            <Text style={styles.hint}>
              Playback starts at {clip.startSec}s and keeps going — {clip.endSec}s
              is only the intended in-game window.
            </Text>

            <Pressable
              style={styles.playBtn}
              onPress={() => {
                if (isPlaying) {
                  setIsPlaying(false);
                } else {
                  setStatus('loading');
                  setIsPlaying(true);
                }
              }}
            >
              <Text style={styles.playBtnText}>
                {isPlaying ? '■  Stop' : '▶  Play again'}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.emptyPlayer}>
            <Text style={styles.emptyPlayerText}>
              Pick a clip below to play it through the real in-app player.
            </Text>
          </View>
        )}

        {/* ── Väntar på verifiering ───────────────────────────────── */}
        {pending.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Pending verification</Text>
            {pending.map((q) => (
              <ClipRow
                key={q.id}
                question={q}
                active={selected?.id === q.id}
                onPress={() => handleSelect(q)}
              />
            ))}
          </>
        )}

        {/* ── Sök ─────────────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Find any clip</Text>
        <TextInput
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder="Search title or item id…"
          placeholderTextColor={Colors.textDisabled}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.trim().length >= 2 && results.length === 0 && (
          <Text style={styles.noResults}>No clips match “{query.trim()}”.</Text>
        )}
        {results.map((q) => (
          <ClipRow
            key={q.id}
            question={q}
            active={selected?.id === q.id}
            onPress={() => handleSelect(q)}
          />
        ))}

        <Text style={styles.footNote}>
          {PLAYABLE.length} clips in the catalog. This screen is a dev tool —
          it has no entry point in the app UI.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function ClipRow({
  question,
  active,
  onPress,
}: {
  question: MusicQuestion;
  active: boolean;
  onPress: () => void;
}) {
  const clip = question.youtubeClips[0];
  return (
    <Pressable
      style={[styles.row, active && styles.rowActive]}
      onPress={onPress}
    >
      <Text style={[styles.rowTitle, active && styles.rowTitleActive]} numberOfLines={1}>
        {question.displayName}
      </Text>
      <Text style={styles.rowMeta} numberOfLines={1}>
        {clip.videoId} · {clip.channelTitle ?? 'unknown channel'} ·{' '}
        {clip.startSec}–{clip.endSec}s
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  backText: { color: Colors.textSecondary, fontSize: FontSize.md, fontWeight: '500' },
  topTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  content: { padding: Spacing.lg, gap: Spacing.sm, paddingBottom: Spacing.xxl },

  playerBlock: { gap: Spacing.sm, marginBottom: Spacing.md },
  emptyPlayer: {
    height: 160,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  emptyPlayerText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  status: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  nowTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  metaBox: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.card,
    padding: Spacing.sm,
    gap: 2,
  },
  metaRow: { flexDirection: 'row', gap: Spacing.sm },
  metaLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    width: 92,
  },
  metaValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.xs,
    flex: 1,
    fontVariant: ['tabular-nums'],
  },
  hint: { color: Colors.textSecondary, fontSize: FontSize.xs, fontStyle: 'italic' },
  playBtn: {
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnText: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },

  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: Spacing.md,
  },
  row: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.card,
    padding: Spacing.sm,
    gap: 2,
  },
  rowActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  rowTitle: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '600' },
  rowTitleActive: { color: Colors.primary },
  rowMeta: { color: Colors.textSecondary, fontSize: FontSize.xs },

  search: {
    height: 44,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.sm,
    backgroundColor: Colors.card,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.sm,
    fontSize: FontSize.sm,
  },
  noResults: { color: Colors.textSecondary, fontSize: FontSize.sm },
  footNote: {
    color: Colors.textDisabled,
    fontSize: FontSize.xs,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
});

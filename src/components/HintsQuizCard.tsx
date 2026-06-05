// HintsQuizCard — redesign v3.
//
// Layout: vänster kolumn (hints) + höger kolumn (flagga + personnamn).
//
//   Vänster (flex:1): kategori-label + punktlista med hints (hela bredden utom RIGHT_COL_W).
//   Höger (110px):    övre halvan = flagga med ProgressiveCover + Nationality-chip.
//                     nedre halvan = personnamn (fade-in vid reveal).
//
// Höjd matchar PLAYER_HEIGHT (~220 px) via flex:1 i parent-containern.
// Inga nummerbadges — enbart •-punkter och ↳ för sub-rader.
// Konsekutiva 'club'-hints grupperas under "Career History" rubrik; varje klubb = 1 hint.
// Alla hints synliga vid T/2 (HINTS_ALL_OUT_FRACTION = 0.5).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import type { HintItem, HintLibrary } from '../utils/hintsData';
import { countryToFlagEmoji } from '../utils/hintsData';
import { selectHints } from '../utils/hintsGenerator';
import { ProgressiveCover } from './ProgressiveCover';

type AssistanceLevel = 'minimal' | 'standard' | 'full';

const HINTS_ALL_OUT_FRACTION = 0.5;
const MAX_HINTS = 15;
const RIGHT_COL_W = 110; // px — flagga + namn-kolumn

interface Props {
  library?: HintLibrary;
  displayName: string;
  resetKey: string | number;
  totalSeconds: number;
  assistance: AssistanceLevel;
  playerBirthYear: number;
  isRevealed: boolean;
  /** Hints börjar visas när true — false under buffer-perioden (media laddar). */
  hintsActive?: boolean;
}

// ── Hint-gruppering ─────────────────────────────────────────────────────────

type SingleEntry = { kind: 'single'; hint: HintItem; index: number };
type GroupEntry  = { kind: 'group'; label: string; items: Array<{ hint: HintItem; index: number }> };
type RenderEntry = SingleEntry | GroupEntry;

function buildRenderEntries(hints: HintItem[]): RenderEntry[] {
  const entries: RenderEntry[] = [];
  let i = 0;
  while (i < hints.length) {
    if (hints[i].type === 'club') {
      const items: GroupEntry['items'] = [];
      while (i < hints.length && hints[i].type === 'club') {
        items.push({ hint: hints[i], index: i });
        i++;
      }
      entries.push({ kind: 'group', label: 'Career History', items });
    } else {
      entries.push({ kind: 'single', hint: hints[i], index: i });
      i++;
    }
  }
  return entries;
}

// Formatera hinttexten — de flesta hint-värden är självförklarande.
// Bara datum och ett fåtal typer behöver kort prefix för kontext.
function formatHintText(hint: HintItem): string {
  switch (hint.type) {
    case 'birth_date':    return `Born: ${hint.value}`;
    case 'peak_year':     return `Career: ${hint.value}`;
    case 'lead_singer':   return `Lead singer: ${hint.value}`;
    case 'creation_year': return `Created: ${hint.value}`;
    case 'producer':      return `Creator: ${hint.value}`;
    default:              return hint.value;
  }
}

function categoryToGenre(label: string): string {
  if (label === 'Musikartist' || label === 'Band') return 'Music';
  if (label === 'Actor' || label === 'Character') return 'Film';
  if (label === 'Athlete' || label === 'Coach') return 'Sport';
  return 'Music';
}

function categoryToProfession(label: string): string {
  if (label === 'Musikartist') return 'Artist';
  if (label === 'Band') return 'Band';
  if (label === 'Actor') return 'Actor';
  if (label === 'Athlete') return 'Athlete';
  if (label === 'Coach') return 'Coach';
  if (label === 'Character') return 'Character';
  return 'Artist';
}

function splitDisplayName(name: string): string[] {
  const lastSpace = name.lastIndexOf(' ');
  if (lastSpace === -1) return [name];
  return [name.slice(0, lastSpace), name.slice(lastSpace + 1)];
}

// Termer som redan framgår av rubriken (Genre · Profession) och ska filtreras bort.
const REDUNDANT_HINT_TERMS = [
  'music artist',
  'musician',
  'recording artist',
];

// Känslig information som inte ska visas som ledtråd.
const SENSITIVE_HINT_TERMS = [
  'died', 'death', 'passed away', 'deceased', 'dead',
  'killed', 'murder', 'suicide', 'overdose',
  'accident', 'crash', 'collision', 'plane crash', 'car crash',
  'cancer', 'illness', 'disease', 'diagnosed', 'tumor', 'tumour',
];

function isRedundantHint(text: string): boolean {
  const lower = text.toLowerCase();
  return REDUNDANT_HINT_TERMS.some((term) => lower.includes(term));
}

/**
 * Trunkerar texten vid det första känsliga ordet och returnerar texten dessförinnan
 * (trimmad och utan avslutande skiljetecken/parenteser). Om inget återstår → null.
 * Texten visas alltså UTAN den känsliga delen, inte borttagen helt.
 */
function censorSensitive(text: string): string | null {
  const lower = text.toLowerCase();
  let earliest = -1;
  for (const term of SENSITIVE_HINT_TERMS) {
    const idx = lower.indexOf(term);
    if (idx !== -1 && (earliest === -1 || idx < earliest)) earliest = idx;
  }
  if (earliest === -1) return text;
  const before = text.slice(0, earliest).trim().replace(/[(,:;-]+$/, '').trim();
  return before.length > 0 ? before : null;
}

/**
 * Kontrollerar om hint-texten innehåller svaret (displayName) och returnerar
 * i så fall bara texten FÖRE matchningen (trimmat). Om inget återstår → null
 * (= hinten ska hoppas över helt). Matchar case-insensitivt mot hela namnet
 * samt eventuella för-/efternamn separat (skydd mot "Elton John" i "Sir Elton John").
 */
function censorForAnswer(text: string, answer: string): string | null {
  const lower = text.toLowerCase();
  const answerLower = answer.toLowerCase();
  // Matcha hela svaret samt varje ord i svaret som är längre än 3 tecken
  const terms = [answerLower, ...answerLower.split(' ').filter((w) => w.length > 3)];
  let earliest = -1;
  for (const term of terms) {
    const idx = lower.indexOf(term);
    if (idx !== -1 && (earliest === -1 || idx < earliest)) earliest = idx;
  }
  if (earliest === -1) return text; // inget svar i texten — visa som vanligt
  const before = text.slice(0, earliest).trim().replace(/[,:;-]+$/, '').trim();
  return before.length > 0 ? before : null;
}

// ── Huvud-komponent ─────────────────────────────────────────────────────────

export function HintsQuizCard({
  library,
  displayName,
  resetKey,
  totalSeconds,
  assistance,
  playerBirthYear,
  isRevealed,
  hintsActive = true,
}: Props) {
  const [revealedCount, setRevealedCount] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const nameAnim  = useRef(new Animated.Value(0)).current;

  const hints = useMemo(
    () => (library ? selectHints(library, MAX_HINTS) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resetKey, library],
  );
  const renderEntries = useMemo(() => buildRenderEntries(hints), [hints]);

  // Staggerad reveal — alla synliga vid T/2.
  // Startar INTE förrän hintsActive=true (buffer-period medan media laddar).
  // isRevealed kollas FÖRE hintsActive-gaten — hints ska alltid visas vid
  // reveal även om hintsActive blivit false (phase lämnade 'question').
  useEffect(() => {
    setRevealedCount(0);
    if (isRevealed) { setRevealedCount(hints.length); return; }
    if (!hintsActive) return;                           // vänta på timer-start
    if (!hints.length) return;
    const stepMs = (totalSeconds * HINTS_ALL_OUT_FRACTION * 1000) / hints.length;
    const timers = hints.map((_, i) =>
      setTimeout(() => setRevealedCount((c) => Math.max(c, i + 1)), stepMs * (i + 1)),
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, totalSeconds, isRevealed, hints.length, hintsActive]);

  // Auto-scroll till senaste hint
  useEffect(() => {
    if (revealedCount > 0) scrollRef.current?.scrollToEnd({ animated: true });
  }, [revealedCount]);

  // Personnamn fade-in
  useEffect(() => {
    Animated.timing(nameAnim, {
      toValue: isRevealed ? 1 : 0,
      duration: 380,
      useNativeDriver: true,
    }).start();
  }, [isRevealed, nameAnim]);

  const flag       = library ? countryToFlagEmoji(library.nationality) : '🏳️';
  const rawLabel   = library?.categoryLabel ?? 'Musikartist';
  const genre      = categoryToGenre(rawLabel);
  const profession = categoryToProfession(rawLabel);
  const nameParts  = splitDisplayName(displayName);

  return (
    <View style={styles.container}>

      {/* ── Vänster: hints ───────────────────────────────── */}
      <View style={styles.hintsCol}>
        <Text style={styles.categoryLabel} numberOfLines={1}>
          {genre} · {profession}
        </Text>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!hintsActive ? (
            <Text style={styles.hintsPlaceholder}>· · ·</Text>
          ) : renderEntries.map((entry, ei) =>
            entry.kind === 'group' ? (
              <ClubGroup
                key={`g${ei}`}
                entry={entry}
                revealedCount={revealedCount}
                isRevealed={isRevealed}
                answer={displayName}
              />
            ) : (
              <BulletHint
                key={entry.hint.id}
                entry={entry}
                revealedCount={revealedCount}
                isRevealed={isRevealed}
                answer={displayName}
              />
            ),
          )}
        </ScrollView>
      </View>

      {/* ── Höger: flagga + personnamn ───────────────────── */}
      <View style={styles.rightCol}>

        {/* Flagga (övre halvan) */}
        <View style={styles.flagWrap}>
          <View style={styles.flagInner}>
            <Text style={styles.flagEmoji}>{flag}</Text>
            <ProgressiveCover
              resetKey={resetKey}
              profile={{ birthYear: playerBirthYear, assistance }}
              totalSeconds={totalSeconds}
              assistance="standard"
              isRevealed={isRevealed}
              logoSize={120}
              active={hintsActive}
            />
          </View>
        </View>

        {/* Personnamn (nedre halvan — visas vid reveal) */}
        <Animated.View style={[styles.nameWrap, { opacity: nameAnim }]}>
          {nameParts.map((part, i) => (
            <Text
              key={i}
              style={styles.nameText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.52}
            >
              {part}
            </Text>
          ))}
        </Animated.View>

      </View>
    </View>
  );
}

// ── BulletHint ──────────────────────────────────────────────────────────────

function BulletHint({
  entry,
  revealedCount,
  isRevealed,
  answer,
}: {
  entry: SingleEntry;
  revealedCount: number;
  isRevealed: boolean;
  answer: string;
}) {
  const shown = revealedCount > entry.index || isRevealed;
  const anim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: shown ? 1 : 0, duration: 240, useNativeDriver: true }).start();
  }, [shown, anim]);

  if (!shown) return null;

  const raw        = formatHintText(entry.hint);
  if (isRedundantHint(raw)) return null;
  const noSensitive = censorSensitive(raw);
  if (noSensitive === null) return null;
  const censored    = censorForAnswer(noSensitive, answer);
  if (censored === null) return null;

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [5, 0] });

  return (
    <Animated.View style={[styles.bulletRow, { opacity: anim, transform: [{ translateY }] }]}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.hintText} numberOfLines={2}>{censored}</Text>
    </Animated.View>
  );
}

// ── ClubGroup ───────────────────────────────────────────────────────────────

function ClubGroup({
  entry,
  revealedCount,
  isRevealed,
  answer,
}: {
  entry: GroupEntry;
  revealedCount: number;
  isRevealed: boolean;
  answer: string;
}) {
  const headerShown = revealedCount > entry.items[0].index || isRevealed;
  const headerAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: headerShown ? 1 : 0, duration: 240, useNativeDriver: true }).start();
  }, [headerShown, headerAnim]);

  if (!headerShown) return null;

  const headerTY = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [5, 0] });

  return (
    <View>
      {/* Grupprubrik */}
      <Animated.View style={[styles.bulletRow, { opacity: headerAnim, transform: [{ translateY: headerTY }] }]}>
        <Text style={styles.bullet}>•</Text>
        <Text style={[styles.hintText, styles.groupHeaderText]}>{entry.label}</Text>
      </Animated.View>

      {/* Klubbrader */}
      {entry.items.map(({ hint, index }) => {
        const visible = revealedCount > index || isRevealed;
        return visible ? <ClubSubRow key={hint.id} hint={hint} answer={answer} /> : null;
      })}
    </View>
  );
}

function ClubSubRow({ hint, answer }: { hint: HintItem; answer: string }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 240, useNativeDriver: true }).start();
  }, [anim]);

  const noSensitive = censorSensitive(hint.value);
  if (noSensitive === null) return null;
  const censored = censorForAnswer(noSensitive, answer);
  if (censored === null) return null;

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [4, 0] });

  return (
    <Animated.View style={[styles.subRow, { opacity: anim, transform: [{ translateY }] }]}>
      <Text style={styles.subArrow}>↳</Text>
      <Text style={[styles.hintText, styles.subHintText]} numberOfLines={1}>{censored}</Text>
    </Animated.View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.background,
  },

  // ── Hints-kolumn ──────────────────────────────────────────────────────────
  hintsCol: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 6,
    paddingTop: 6,
    paddingBottom: 4,
  },
  categoryLabel: {
    color: Colors.warning,
    fontSize: 12,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  scroll: { flex: 1 },
  scrollContent: { gap: 0, paddingBottom: 2 },
  hintsPlaceholder: {
    flex: 1,
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 22,
    letterSpacing: 8,
    marginTop: 24,
  },

  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 2,
    gap: 5,
  },
  bullet: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    width: 10,
    flexShrink: 0,
  },
  hintText: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  groupHeaderText: {
    color: Colors.textSecondary,
    fontWeight: FontWeight.bold,
    fontSize: 12,
  },

  subRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 1,
    paddingLeft: 15,
    gap: 4,
  },
  subArrow: {
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    width: 12,
    flexShrink: 0,
  },
  subHintText: {
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textSecondary,
  },

  // ── Höger kolumn ──────────────────────────────────────────────────────────
  rightCol: {
    width: RIGHT_COL_W,
    flexDirection: 'column',
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: Colors.border,
  },

  // Flagga — övre halvan
  flagWrap: {
    flex: 1,
    flexDirection: 'column',
  },
  natBadgeWrap: {
    alignSelf: 'center',
    marginTop: 4,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 2,
  },
  natBadgeText: {
    color: Colors.textSecondary,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  flagInner: {
    flex: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 4,
    marginTop: 6,
    marginBottom: 20,
    borderRadius: 2,
  },
  flagEmoji: {
    fontSize: 100,
    textAlign: 'center',
    lineHeight: 108,
    marginTop: -8,
    marginLeft: -2,
  },

  // Personnamn — nedre halvan
  nameWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 5,
    paddingTop: 4,
    paddingBottom: 4,
  },
  nameText: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    lineHeight: 21,
  },
});

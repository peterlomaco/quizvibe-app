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
// Ledtrådar grupperas under rubriker (Birth/Career History/Film History/
// Titles/Trophies) via buildRenderEntries i hintsGenerator.ts — se den för
// grupperingsreglerna. Ogrupperade fakta (t.ex. en ensam merit) visas som
// vanliga bullets.
// Alla hints synliga vid T/2 (HINTS_ALL_OUT_FRACTION = 0.5).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import type { HintCategoryLabel, HintLibrary } from '../utils/hintsData';
import { countryToFlagEmoji } from '../utils/hintsData';
import { buildRenderEntries, HINT_MAX_CHARS, HINT_SUB_MAX_CHARS, selectHints, type GroupEntry, type SingleEntry } from '../utils/hintsGenerator';
import { resolveHints } from '../utils/hintsText';
import { createSeededRng } from '../utils/seededRandom';
import { ProgressiveCover } from './ProgressiveCover';

type AssistanceLevel = 'minimal' | 'standard' | 'full';

const HINTS_ALL_OUT_FRACTION = 2 / 3; // alla hints synliga vid T×2/3
const MAX_HINTS = 15;
const RIGHT_COL_W = 80; // px — flagga + namn-kolumn (smalare → mer plats åt ledtrådstext)

// Skärmbredds-härledd radbudget (Peter 2026-09-03). De statiska
// HINT_MAX_CHARS/HINT_SUB_MAX_CHARS är tunade för smalaste iPhone (SE) och
// kapade ledtrådstext med "…" i onödan på breda telefoner. hintsCol får hela
// bredden UTOM flagg-/namn-kolumnen (RIGHT_COL_W), sin egen h-padding
// (paddingLeft 10 + paddingRight 6 = 16) och bullet-zonen (bullet 10 + gap 5 =
// 15). ~8.7 px/tecken vid fontSize 16 är konservativt mot de ~8.1 som faktiskt
// får plats, så fitHintText hinner korta på ordgräns inom EN rad (numberOfLines
// = 1 klipper annars mitt i ordet med native-ellips). Golv vid det gamla säkra
// värdet så inget smalt läge regredierar. Läses en gång per session — appen är
// porträttlåst (app.json), så bredden ändras inte under körning.
const SCREEN_W = Dimensions.get('window').width;
const HINT_TEXT_W = SCREEN_W - RIGHT_COL_W - 16 - 15;
const HINT_MAX_CHARS_DYNAMIC = Math.max(HINT_MAX_CHARS, Math.round(HINT_TEXT_W / 8.7));
// Underrader (↳, fontSize 12) beräknas ur SIN EGEN bredd — de äter mer horisontell
// chrome än huvudraderna (paddingLeft 15 + arrow 12 + gap 4 = 31 mot bullet-zonens
// 15), så den enkla font-ratio-skalningen (×16/12) överskattar. ~6.6 px/tecken vid
// fontSize 12. Golv vid det gamla säkra värdet.
const HINT_SUB_TEXT_W = SCREEN_W - RIGHT_COL_W - 16 - 31;
const HINT_SUB_MAX_CHARS_DYNAMIC = Math.max(HINT_SUB_MAX_CHARS, Math.round(HINT_SUB_TEXT_W / 6.6));

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
  /** Flaggans mosaik börjar tas bort när true — kan ha längre delay än hintsActive. */
  mosaicActive?: boolean;
  /** contentSubject från katalog-YAML ('artist'|'band'|'actor'|'athlete' osv.)
   *  Styr kategori-rubrikens primära label och möjliggör crossover-text. */
  contentSubject?: string;
  /**
   * Deterministisk seed för hint-urvalet. Sätts i Remote 1v1 (`matchId:questionId`)
   * så båda spelarna får EXAKT samma ledtrådar i samma sekvens — de spelar
   * frågan var för sig på egna enheter utan sync-kanal. Utelämnad → Math.random
   * (ny variation per runda, korrekt för lokala lägen där alla ser samma skärm).
   */
  hintsSeed?: string;
}

// ── Hint-gruppering ─────────────────────────────────────────────────────────
//
// Grupperingslogiken (Birth/Career History/Film History/Titles/Trophies) bor
// i src/utils/hintsGenerator.ts (buildRenderEntries) — ren funktion utan
// React, delad med backend-exportens spelbarhets-gate. Se dess kommentar.

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

// Mappar contentSubject (från YAML-katalogen) till HintCategoryLabel-ekvivalent
// så att quiz-frågans kontext styr kategorirubrikens primära label.
function contentSubjectToHintLabel(subject: string): HintCategoryLabel | null {
  switch (subject) {
    case 'artist':  return 'Musikartist';
    case 'band':    return 'Band';
    case 'actor':   return 'Actor';
    case 'athlete': return 'Athlete';
    default:        return null; // city, country, place → faller tillbaka på library.categoryLabel
  }
}

function splitDisplayName(name: string): string[] {
  const lastSpace = name.lastIndexOf(' ');
  if (lastSpace === -1) return [name];
  return [name.slice(0, lastSpace), name.slice(lastSpace + 1)];
}

// Text-pipelinen (filter, censur, radanpassning, dedup) bor i
// src/utils/hintsText.ts — se resolveHints där.

// ── Huvud-komponent ─────────────────────────────────────────────────────────

// B1-perf: memoiserad så quiz-skärmens 1 Hz timeLeft-re-renders inte ritar om
// hela hint-kortet. Alla props är primitiver eller stabila referenser (library
// = question.hints per fråga), så shallow-compare bailar korrekt.
function HintsQuizCardBase({
  library,
  displayName,
  resetKey,
  totalSeconds,
  assistance,
  playerBirthYear,
  isRevealed,
  hintsActive = true,
  mosaicActive,
  contentSubject,
  hintsSeed,
}: Props) {
  const [revealedCount, setRevealedCount] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const nameAnim  = useRef(new Animated.Value(0)).current;

  // Latch: när mosaicActive väl blivit true fortsätter mosaikunderlaget
  // tas bort även om mosaicActive sedan sätts till false (phase → awaiting/reveal).
  // Resetas bara när frågan byts (resetKey).
  const [mosaicEverStarted, setMosaicEverStarted] = useState(false);
  useEffect(() => { setMosaicEverStarted(false); }, [resetKey]);
  useEffect(() => {
    if (mosaicActive === true) setMosaicEverStarted(true);
  }, [mosaicActive]);

  // Rubrikens FAKTISKA Genre·Profession-etikett — beräknas här (inte längre
  // nere vid JSX:en) eftersom profession-redundans-strippningen i
  // resolveHints() behöver veta den för att kunna dölja/omformulera
  // profession-bullet:en (se "Profession-redundans" i hintsText.ts).
  const libraryLabel: HintCategoryLabel = library?.categoryLabel ?? 'Musikartist';
  const subjectLabel = contentSubject ? contentSubjectToHintLabel(contentSubject) : null;
  const primaryLabel: HintCategoryLabel = subjectLabel ?? libraryLabel;

  const hints = useMemo(
    () =>
      library
        ? resolveHints(
            selectHints(library, MAX_HINTS, hintsSeed ? createSeededRng(hintsSeed) : undefined),
            displayName,
            primaryLabel,
            HINT_MAX_CHARS_DYNAMIC,
            HINT_SUB_MAX_CHARS_DYNAMIC,
          )
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resetKey, library, hintsSeed, displayName, primaryLabel],
  );
  const renderEntries = useMemo(() => buildRenderEntries(hints), [hints]);

  // Monotont ökande maximum — aldrig minskar inom en frågecykel.
  // Måste ligga EFTER hints-useMemo eftersom displayRevealedCount använder hints.length.
  // Komponent remountas (key=questionIndex) vid ny fråga så ref resettas automatiskt.
  const maxRevealedRef = useRef(0);
  if (revealedCount > maxRevealedRef.current) maxRevealedRef.current = revealedCount;
  const displayRevealedCount = isRevealed ? hints.length : maxRevealedRef.current;

  // Reset räknaren ENBART vid ny fråga (resetKey-byte) — aldrig pga
  // hintsActive/phase-ändringar, annars nollställs synliga hints i awaiting/reveal.
  useEffect(() => {
    setRevealedCount(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  // Staggerad reveal + isRevealed-snap.
  // isRevealed kollas FÖRE hintsActive så att alla hints visas i reveal-fasen
  // även om hintsActive är false (phase lämnade 'question').
  // När hintsActive går false (awaiting/reveal) stoppas bara timers via cleanup
  // — revealedCount rörs INTE, hints stannar kvar.
  useEffect(() => {
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

  const flag          = library ? countryToFlagEmoji(library.nationality) : '🏳️';
  // libraryLabel/subjectLabel/primaryLabel beräknas längre upp (krävs redan
  // av hints-useMemo:n för profession-redundans-strippningen).
  const genre         = categoryToGenre(primaryLabel);
  const profession    = categoryToProfession(primaryLabel);
  // Crossover: visa "also known as X" när quiz-kontexten skiljer sig från library-etiketten.
  const crossoverProf = (subjectLabel && subjectLabel !== libraryLabel)
    ? categoryToProfession(libraryLabel)
    : null;
  const nameParts     = splitDisplayName(displayName);

  return (
    <View style={styles.container}>

      {/* ── Vänster: hints ───────────────────────────────── */}
      <View style={styles.hintsCol}>
        <Text style={styles.categoryLabel} numberOfLines={1}>
          {genre} · {profession}{crossoverProf ? ` also known as ${crossoverProf}` : ''}
        </Text>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!hintsActive && !isRevealed ? (
            <Text style={styles.hintsPlaceholder}>· · ·</Text>
          ) : renderEntries.map((entry, ei) =>
            entry.kind === 'group' ? (
              <HintGroup
                key={`g${ei}`}
                entry={entry}
                revealedCount={displayRevealedCount}
                isRevealed={isRevealed}
              />
            ) : (
              <BulletHint
                key={entry.hint.hint.id}
                entry={entry}
                revealedCount={displayRevealedCount}
                isRevealed={isRevealed}
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
              active={mosaicEverStarted || (mosaicActive ?? hintsActive)}
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
}: {
  entry: SingleEntry;
  revealedCount: number;
  isRevealed: boolean;
}) {
  const shown = revealedCount > entry.index || isRevealed;
  const anim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: shown ? 1 : 0, duration: 240, useNativeDriver: true }).start();
  }, [shown, anim]);

  if (!shown) return null;

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [5, 0] });

  return (
    <Animated.View style={[styles.bulletRow, { opacity: anim, transform: [{ translateY }] }]}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.hintText} numberOfLines={1}>{entry.hint.text}</Text>
    </Animated.View>
  );
}

// ── HintGroup ───────────────────────────────────────────────────────────────
//
// Generisk rubrik+underrader-block — driver Birth, Career History,
// Film History, Titles och Trophies (se buildRenderEntries i
// hintsGenerator.ts). Namnet "HintGroup" ersätter det tidigare "ClubGroup"
// (2026-08-27) eftersom komponenten alltid var läges-agnostisk — den läser
// `entry.label` istället för att hårdkoda "Career History".

function HintGroup({
  entry,
  revealedCount,
  isRevealed,
}: {
  entry: GroupEntry;
  revealedCount: number;
  isRevealed: boolean;
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

      {/* Underrader */}
      {entry.items.map(({ hint, index }) => {
        const visible = revealedCount > index || isRevealed;
        return visible ? <HintSubRow key={hint.hint.id} text={hint.text} /> : null;
      })}
    </View>
  );
}

function HintSubRow({ text }: { text: string }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 240, useNativeDriver: true }).start();
  }, [anim]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [4, 0] });

  return (
    <Animated.View style={[styles.subRow, { opacity: anim, transform: [{ translateY }] }]}>
      <Text style={styles.subArrow}>↳</Text>
      <Text style={[styles.hintText, styles.subHintText]} numberOfLines={1}>{text}</Text>
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
    overflow: 'hidden',
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
    fontSize: 66,
    textAlign: 'center',
    lineHeight: 72,
    marginTop: -5,
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

export const HintsQuizCard = React.memo(HintsQuizCardBase);

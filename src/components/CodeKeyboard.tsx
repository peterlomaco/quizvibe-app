import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/src/components/haptic';
import { Colors, Radius, Spacing } from '../theme';
import { DIGIT_CHARSET, LETTER_CHARSET } from '../utils/roomCode';

/**
 * In-app tangentbord för Room Code-cellerna OCH PlayerName-fältet i
 * JoinModal. Renderas istället för system-tangentbordet (TextInputs sätter
 * `showSoftInputOnFocus={false}`) så vi har full kontroll över:
 *   • Innehåll: bara A–Z (letter-mode) eller 0–9 (digit-mode), exakt vad
 *     sanitize-regexet i call-site:n accepterar. Ingen 123/ABC-switch som
 *     iOS:s system-tangentbord påtvingar (utom när explicit `onModeToggle`
 *     skickas in — då renderas en mode-toggle-knapp i botten-raden).
 *   • Höjd: container räknas ut från antal rader i `letterCharset` så vi
 *     fortsatt har samma höjd när mode växlar mellan letter och digit
 *     (digit-grid:en stretchas via flex:1 på rader till samma totalhöjd).
 *   • Tap-targets: digit-mode har färre keys → de stretchas större för att
 *     fylla samma container-höjd som letter-grid:en.
 *
 * Charsets: default-letter charsetet är `LETTER_CHARSET` (24 bokstäver,
 * exklusive O/I) som matchar Room Code-genereringens valid-chars. För
 * fri-text-fält (PlayerName) skickas `letterCharset` = fullt A–Z (26).
 * Digit-charsetet är alltid `DIGIT_CHARSET` (0–9).
 */
// Responsiv höjd-skalning så tangentbordet ryms tillsammans med det aktiva
// fältet på äldre/kortare iOS-telefoner (iPhone SE/8 = 667 px, SE1 = 568 px).
// På normala skärmar (≥ 700 px) behålls den fulla 44 px-tap-target-höjden.
// På korta skärmar krymper key-höjd + gap + padding så hela formuläret +
// tangentbordet får plats inom modal-sheetens maxHeight (90 %) — annars
// kollapsar den flexShrink:1-ScrollView som håller fälten till ~0 px och
// användaren ser inte vad de skriver in.
const SCREEN_H = Dimensions.get('window').height;
const COMPACT = SCREEN_H < 700;
const VERY_COMPACT = SCREEN_H < 600;

const KEY_HEIGHT = VERY_COMPACT ? 30 : COMPACT ? 36 : 44;
const KEY_GAP = COMPACT ? 6 : 8;
const VPADDING = COMPACT ? 8 : 12;
const HPADDING = 8;
const MARGIN_TOP = COMPACT ? Spacing.sm : Spacing.md;
const LETTER_COLS = 6;

// UI v2-färger: mörk navy-panel, nästan svarta tangenter med subtil kant,
// sekundära knappar (Delete/Cancel/123) en nyans ljusare men fortfarande dämpade.
const KB_PANEL_BG = '#0F1828';
const KB_KEY_BG = '#0B1220';
const KB_KEY_BORDER = 'rgba(255,255,255,0.08)';
const KB_SECONDARY_BG = '#141C2B';
const DIGIT_COLS = 5;  // 10 digits / 5 cols = 2 rows ("12345" / "67890")

interface Props {
  mode: 'letter' | 'digit';
  onPress: (char: string) => void;
  onBackspace: () => void;
  /** Override default LETTER_CHARSET. När t.ex. ett fritext-fält (PlayerName)
   *  behöver fullt A–Z istället för Room Code:s 24-bokstavs-uppsättning. */
  letterCharset?: string;
  /** När definierad renderas en mode-toggle-knapp ("123" / "ABC") bredvid
   *  Backspace i botten-raden. Utan callback visas bara Backspace (default
   *  för Room Code-cellerna där mode styrs av cell-typen). Om `onCancel`
   *  OCKSÅ är satt flyttas toggle-knappen istället in i grid:en (direkt
   *  efter sista tecknet på sista raden) — se `onCancel`. */
  onModeToggle?: () => void;
  /** När true dimmas mode-toggle-knappen och tap blir no-op. Används av
   *  PlayerName-flöden där digit-sektionen är låst tills letter-sektionen
   *  har minst 1 tecken — toggle-knappen renderas fortsatt för stabil
   *  layout men signalerar visuellt att letters måste komma först. */
  modeToggleDisabled?: boolean;
  /**
   * När definierad renderas en "Cancel"-knapp i botten-raden ISTÄLLET för
   * mode-toggle-knappen (Peter 2026-08-27 — formulär utan en egen "Done"/
   * stäng-knapp i närheten, t.ex. Lobby:s Share invite och Profile:s Add
   * QuizVibe friend, saknade annars ett sätt att avbryta namn-inmatningen
   * och stänga tangentbordet). Anropas vid tap; call-siten ansvarar för att
   * nollställa fältet och dölja tangentbordet (typiskt: töm text, blur:a
   * TextInputs, sätt focused-state till false).
   *
   * Om `onModeToggle` också är satt flyttas TOGGLE-knappen upp in i själva
   * bokstavs-/siffer-grid:en — appenderad direkt efter sista tecknet på
   * sista raden om det finns plats (t.ex. direkt efter "Z" i ett fullt A–Z-
   * charset), annars i en egen ny rad. Botten-raden blir då [Cancel]
   * [Delete] istället för [123/ABC] [Delete].
   */
  onCancel?: () => void;
  /**
   * När definierad renderas en "Next ›"-knapp sist i botten-raden (Register,
   * 2026-10-20): tar användaren vidare till nästa fält utan att behöva förstå
   * att formuläret måste scrollas. Guld när `nextEnabled`, annars dämpad.
   */
  onNext?: () => void;
  nextEnabled?: boolean;
}

function chunk(chars: string, cols: number): string[][] {
  const rows: string[][] = [];
  for (let i = 0; i < chars.length; i += cols) {
    rows.push(chars.slice(i, i + cols).split(''));
  }
  return rows;
}

export function CodeKeyboard({
  mode,
  onPress,
  onBackspace,
  letterCharset,
  onModeToggle,
  modeToggleDisabled = false,
  onCancel,
  onNext,
  nextEnabled = false,
}: Props) {
  const activeLetterCharset = letterCharset ?? LETTER_CHARSET;
  const letterRowCount = Math.ceil(activeLetterCharset.length / LETTER_COLS);
  // Container-höjd baseras på antal rader i letter-mode så toggle till
  // digit-mode behåller samma totalhöjd (rows har flex:1).
  const containerHeight =
    letterRowCount * KEY_HEIGHT +
    (letterRowCount - 1) * KEY_GAP +
    2 * VPADDING +
    KEY_HEIGHT + // botten-rad (backspace + valfri toggle/cancel)
    KEY_GAP;

  const rows =
    mode === 'letter'
      ? chunk(activeLetterCharset, LETTER_COLS)
      : chunk(DIGIT_CHARSET, DIGIT_COLS);
  const cols = mode === 'letter' ? LETTER_COLS : DIGIT_COLS;

  // Inline mode-toggle (2026-08-27): när `onCancel` är satt flyttas "123"/
  // "ABC"-knappen upp in i grid:en — direkt efter sista tecknet på sista
  // raden om det finns plats (t.ex. direkt efter "Z"), annars i en egen ny
  // rad — så botten-raden får plats för Cancel istället.
  const showInlineToggle = !!onModeToggle && !!onCancel;
  const lastRowIndex = rows.length - 1;
  const lastRowHasRoom = rows[lastRowIndex].length < cols;

  const toggleKey = (
    <Pressable
      onPress={modeToggleDisabled ? undefined : onModeToggle}
      disabled={modeToggleDisabled}
      style={({ pressed }) => [
        styles.key,
        styles.toggleKey,
        pressed && !modeToggleDisabled && styles.keyPressed,
        modeToggleDisabled && styles.bottomBtnDisabled,
      ]}
    >
      <Text
        style={[
          styles.toggleKeyText,
          modeToggleDisabled && styles.bottomBtnTextDisabled,
        ]}
      >
        {mode === 'letter' ? '123' : 'ABC'}
      </Text>
    </Pressable>
  );

  return (
    <View style={[styles.container, { height: containerHeight }]}>
      <View style={styles.grid}>
        {rows.map((row, ri) => {
          const isLastRow = ri === lastRowIndex;
          const appendToggleHere = showInlineToggle && isLastRow && lastRowHasRoom;
          const usedCells = row.length + (appendToggleHere ? 1 : 0);
          return (
            <View key={ri} style={styles.row}>
              {row.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => onPress(c)}
                  style={({ pressed }) => [
                    styles.key,
                    pressed && styles.keyPressed,
                  ]}
                >
                  <Text style={styles.keyText}>{c}</Text>
                </Pressable>
              ))}
              {appendToggleHere && toggleKey}
              {/* Pad incomplete row med osynliga spacers så grid-justeringen
                  bevaras (t.ex. 26-letter charset → sista raden har bara 2
                  tecken (+ ev. inline toggle); resterande cell-bredder ska
                  vara tomma, inte stretcha tecknen). */}
              {usedCells < cols &&
                Array.from({ length: cols - usedCells }).map((_, i) => (
                  <View key={`spacer-${ri}-${i}`} style={styles.keySpacer} />
                ))}
            </View>
          );
        })}
        {/* Sista raden var redan full (t.ex. digit-mode: 10 siffror fyller
            exakt 2 rader utan rest) → togglen får en egen rad. */}
        {showInlineToggle && !lastRowHasRoom && (
          <View style={styles.row}>
            {toggleKey}
            {Array.from({ length: cols - 1 }).map((_, i) => (
              <View key={`toggle-row-spacer-${i}`} style={styles.keySpacer} />
            ))}
          </View>
        )}
      </View>
      <View style={styles.bottomRow}>
        {!showInlineToggle && onModeToggle && (
          <Pressable
            onPress={modeToggleDisabled ? undefined : onModeToggle}
            disabled={modeToggleDisabled}
            style={({ pressed }) => [
              styles.bottomBtn,
              pressed && !modeToggleDisabled && styles.keyPressed,
              modeToggleDisabled && styles.bottomBtnDisabled,
            ]}
          >
            <Text
              style={[
                styles.bottomBtnText,
                modeToggleDisabled && styles.bottomBtnTextDisabled,
              ]}
            >
              {mode === 'letter' ? '123' : 'ABC'}
            </Text>
          </Pressable>
        )}
        {onCancel && (
          <Pressable
            onPress={onCancel}
            style={({ pressed }) => [
              styles.bottomBtn,
              pressed && styles.keyPressed,
            ]}
          >
            <Text style={styles.bottomBtnText}>Cancel</Text>
          </Pressable>
        )}
        <Pressable
          onPress={onBackspace}
          style={({ pressed }) => [
            styles.bottomBtn,
            pressed && styles.keyPressed,
          ]}
        >
          <Text style={styles.bottomBtnText}>⌫  Delete</Text>
        </Pressable>
        {onNext && (
          <Pressable
            onPress={nextEnabled ? onNext : undefined}
            disabled={!nextEnabled}
            style={({ pressed }) => [
              styles.bottomBtn,
              nextEnabled && styles.nextBtnEnabled,
              pressed && nextEnabled && styles.keyPressed,
              !nextEnabled && styles.bottomBtnDisabled,
            ]}
          >
            <Text
              style={[
                styles.bottomBtnText,
                nextEnabled ? styles.nextBtnTextEnabled : styles.bottomBtnTextDisabled,
              ]}
            >
              Next ›
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Mörk navy-panel (UI v2) — tidigare cardElevated gav en för blå yta.
  container: {
    backgroundColor: KB_PANEL_BG,
    paddingHorizontal: HPADDING,
    paddingVertical: VPADDING,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: MARGIN_TOP,
  },
  grid: {
    flex: 1,
    gap: KEY_GAP,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    gap: KEY_GAP,
  },
  key: {
    flex: 1,
    borderRadius: Radius.sm,
    backgroundColor: KB_KEY_BG,
    borderWidth: 1,
    borderColor: KB_KEY_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keySpacer: {
    flex: 1,
    // Osynlig — tar samma flex-bredd som en knapp men ingen border/bg/press.
  },
  // Neutral tryck-feedback (ingen blå, ingen guld per tangent).
  keyPressed: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderColor: 'rgba(255,255,255,0.18)',
  },
  keyText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  // Inline mode-toggle-cellen (2026-08-27, "123"/"ABC" flyttad in i grid:en
  // — se onCancel-proppen) delar `key`:s geometri men får dämpad textSecondary-
  // färg + mindre fontstorlek så den läses som en funktionsknapp bland
  // bokstavs-/siffer-cellerna istället för som ett tecken att skriva.
  toggleKey: {
    backgroundColor: KB_SECONDARY_BG,
  },
  toggleKeyText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  bottomRow: {
    marginTop: KEY_GAP,
    height: KEY_HEIGHT,
    flexDirection: 'row',
    gap: KEY_GAP,
  },
  bottomBtn: {
    flex: 1,
    borderRadius: Radius.sm,
    backgroundColor: KB_SECONDARY_BG,
    borderWidth: 1,
    borderColor: KB_KEY_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBtnText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  // Next: guldkant + guldtext när nästa steg är upplåst (guld = klart/giltigt).
  nextBtnEnabled: {
    borderColor: 'rgba(245,166,35,0.65)',
  },
  nextBtnTextEnabled: {
    color: '#F5A623',
    fontWeight: '700',
  },
  bottomBtnDisabled: {
    opacity: 0.4,
  },
  bottomBtnTextDisabled: {
    color: Colors.textDisabled,
  },
});

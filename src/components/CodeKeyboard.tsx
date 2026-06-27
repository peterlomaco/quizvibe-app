import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
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
   *  för Room Code-cellerna där mode styrs av cell-typen). */
  onModeToggle?: () => void;
  /** När true dimmas mode-toggle-knappen och tap blir no-op. Används av
   *  PlayerName-flöden där digit-sektionen är låst tills letter-sektionen
   *  har minst 1 tecken — toggle-knappen renderas fortsatt för stabil
   *  layout men signalerar visuellt att letters måste komma först. */
  modeToggleDisabled?: boolean;
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
}: Props) {
  const activeLetterCharset = letterCharset ?? LETTER_CHARSET;
  const letterRowCount = Math.ceil(activeLetterCharset.length / LETTER_COLS);
  // Container-höjd baseras på antal rader i letter-mode så toggle till
  // digit-mode behåller samma totalhöjd (rows har flex:1).
  const containerHeight =
    letterRowCount * KEY_HEIGHT +
    (letterRowCount - 1) * KEY_GAP +
    2 * VPADDING +
    KEY_HEIGHT + // botten-rad (backspace + valfri toggle)
    KEY_GAP;

  const rows =
    mode === 'letter'
      ? chunk(activeLetterCharset, LETTER_COLS)
      : chunk(DIGIT_CHARSET, DIGIT_COLS);
  const cols = mode === 'letter' ? LETTER_COLS : DIGIT_COLS;

  return (
    <View style={[styles.container, { height: containerHeight }]}>
      <View style={styles.grid}>
        {rows.map((row, ri) => (
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
            {/* Pad incomplete row med osynliga spacers så grid-justeringen
                bevaras (t.ex. 26-letter charset → sista raden har bara 2
                tecken; resterande 4 cell-bredder ska vara tomma, inte
                stretcha tecknen). */}
            {row.length < cols &&
              Array.from({ length: cols - row.length }).map((_, i) => (
                <View key={`spacer-${ri}-${i}`} style={styles.keySpacer} />
              ))}
          </View>
        ))}
      </View>
      <View style={styles.bottomRow}>
        {onModeToggle && (
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
        <Pressable
          onPress={onBackspace}
          style={({ pressed }) => [
            styles.bottomBtn,
            pressed && styles.keyPressed,
          ]}
        >
          <Text style={styles.bottomBtnText}>⌫  Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardElevated,
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
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keySpacer: {
    flex: 1,
    // Osynlig — tar samma flex-bredd som en knapp men ingen border/bg/press.
  },
  keyPressed: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  keyText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
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
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBtnText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  bottomBtnDisabled: {
    opacity: 0.4,
  },
  bottomBtnTextDisabled: {
    color: Colors.textDisabled,
  },
});

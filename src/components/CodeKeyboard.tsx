import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing } from '../theme';
import { DIGIT_CHARSET, LETTER_CHARSET } from '../utils/roomCode';

/**
 * In-app tangentbord för Room Code-cellerna i JoinModal. Renderas istället
 * för system-tangentbordet (TextInputs sätter `showSoftInputOnFocus={false}`)
 * så vi har full kontroll över:
 *   • Innehåll: bara A–Z (letter-mode) eller 0–9 (digit-mode), exakt vad
 *     sanitize-regexet i `handleCodeCellChange` accepterar. Ingen 123/ABC-
 *     switch som iOS:s system-tangentbord påtvingar.
 *   • Höjd: container är fixed-height oavsett mode, så switch mellan letter-
 *     och digit-mode reflowar inte modal-layouten.
 *   • Tap-targets: digit-mode har färre keys → de stretchas större för att
 *     fylla samma höjd som letter-grid:en (4 rader vs 2 rader).
 *
 * Charsets importeras från roomCode.ts så keyboard:n alltid visar exakt
 * de chars som genererings-flödet och cell-sanitize-lagret tillåter.
 */
const KEY_HEIGHT = 44;
const KEY_GAP = 8;
const VPADDING = 12;
const HPADDING = 8;
const LETTER_COLS = 6; // 24 letters / 6 cols = 4 rows
const LETTER_ROWS = 4;
const DIGIT_COLS = 5;  // 10 digits / 5 cols = 2 rows ("12345" / "67890")
// Total fixed height: 4 letter-rader + 3 gaps + paddings + backspace + 1 gap.
// Digit-mode återanvänder samma höjd via flex:1 på rader (2 rader → 2x höjd
// per row → större knappar, samma totala container-höjd).
export const CODE_KEYBOARD_HEIGHT =
  LETTER_ROWS * KEY_HEIGHT +
  (LETTER_ROWS - 1) * KEY_GAP +
  2 * VPADDING +
  KEY_HEIGHT + // backspace
  KEY_GAP;     // gap between grid and backspace

interface Props {
  mode: 'letter' | 'digit';
  onPress: (char: string) => void;
  onBackspace: () => void;
}

function chunk(chars: string, cols: number): string[][] {
  const rows: string[][] = [];
  for (let i = 0; i < chars.length; i += cols) {
    rows.push(chars.slice(i, i + cols).split(''));
  }
  return rows;
}

export function CodeKeyboard({ mode, onPress, onBackspace }: Props) {
  const rows =
    mode === 'letter'
      ? chunk(LETTER_CHARSET, LETTER_COLS)
      : chunk(DIGIT_CHARSET, DIGIT_COLS);

  return (
    <View style={styles.container}>
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
          </View>
        ))}
      </View>
      <Pressable
        onPress={onBackspace}
        style={({ pressed }) => [
          styles.backspaceBtn,
          pressed && styles.keyPressed,
        ]}
      >
        <Text style={styles.backspaceText}>⌫  Delete</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: CODE_KEYBOARD_HEIGHT,
    backgroundColor: Colors.cardElevated,
    paddingHorizontal: HPADDING,
    paddingVertical: VPADDING,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.md,
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
  keyPressed: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  keyText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  backspaceBtn: {
    marginTop: KEY_GAP,
    height: KEY_HEIGHT,
    borderRadius: Radius.sm,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backspaceText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
});

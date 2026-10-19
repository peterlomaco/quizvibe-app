import React, { type ReactNode, type RefObject } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '../theme';
import { PLAYER_NAME_MAX_DIGITS, PLAYER_NAME_MAX_LETTERS } from '../utils/playerName';

/**
 * Delad Player Name-inmatning (2026-10-19): [ Name ] – [ 1234 ].
 * Ren presentation — två TextInputs för bokstäver resp. siffror som drivs av
 * QuizVibe:s egna CodeKeyboard (systemtangentbordet visas aldrig). All
 * input-logik, fokus-flytt och validering ägs av anroparen; komponenten
 * bara standardiserar utseendet så Login, Register och Add Friend ser
 * identiska ut.
 *
 * Fokus = guldkant på det aktiva fältet. done = namnet är komplett/giltigt
 * → dämpad guldkant på båda fälten.
 */
interface Props {
  letters: string;
  digits: string;
  lettersRef?: RefObject<TextInput | null>;
  digitsRef?: RefObject<TextInput | null>;
  /** Vilket fält som visar fokuskant just nu (null = inget). */
  focusedField: 'letter' | 'digit' | null;
  done?: boolean;
  lettersEditable?: boolean;
  digitsEditable?: boolean;
  /** Dimma siffer-fältet (låst tills bokstäver finns). */
  digitsDimmed?: boolean;
  onLettersFocus: () => void;
  onDigitsFocus: () => void;
  onBlur: () => void;
  /** Valfritt element till höger om fälten (t.ex. Check / Add / ✓). */
  trailing?: ReactNode;
}

export const PLAYER_NAME_PLACEHOLDER_COLOR = 'rgba(255,255,255,0.3)';

export function PlayerNameInput({
  letters,
  digits,
  lettersRef,
  digitsRef,
  focusedField,
  done = false,
  lettersEditable = true,
  digitsEditable = true,
  digitsDimmed = false,
  onLettersFocus,
  onDigitsFocus,
  onBlur,
  trailing,
}: Props) {
  const fieldStyle = (field: 'letter' | 'digit') => [
    styles.field,
    field === 'letter' ? styles.letters : styles.digits,
    done && styles.fieldDone,
    focusedField === field && styles.fieldFocused,
    field === 'digit' && digitsDimmed && styles.fieldDimmed,
  ];
  return (
    <View style={styles.row}>
      <TextInput
        ref={lettersRef}
        style={fieldStyle('letter')}
        placeholder="Name"
        placeholderTextColor={PLAYER_NAME_PLACEHOLDER_COLOR}
        value={letters}
        maxLength={PLAYER_NAME_MAX_LETTERS}
        editable={lettersEditable}
        showSoftInputOnFocus={false}
        // Cursor låst efter sista tecknet — Backspace på CodeKeyboard är
        // enda sättet att radera.
        selection={{ start: letters.length, end: letters.length }}
        selectTextOnFocus={false}
        contextMenuHidden={true}
        onFocus={onLettersFocus}
        onBlur={onBlur}
      />
      <Text style={styles.separator}>–</Text>
      <TextInput
        ref={digitsRef}
        style={fieldStyle('digit')}
        placeholder="1234"
        placeholderTextColor={PLAYER_NAME_PLACEHOLDER_COLOR}
        value={digits}
        maxLength={PLAYER_NAME_MAX_DIGITS}
        editable={digitsEditable}
        showSoftInputOnFocus={false}
        selection={{ start: digits.length, end: digits.length }}
        selectTextOnFocus={false}
        contextMenuHidden={true}
        onFocus={onDigitsFocus}
        onBlur={onBlur}
      />
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  field: {
    height: 46,
    minWidth: 0,
    borderRadius: Radius.md,
    backgroundColor: '#141C2B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: Spacing.sm,
    fontSize: 15,
    color: Colors.textPrimary,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  // Bokstäver (upp till 10) får mer plats än siffrorna; siffer-fältet har
  // ett golv så 7 siffror aldrig kläms på smala iPhones.
  letters: { flex: 7 },
  digits: { flex: 5, minWidth: 76 },
  fieldFocused: { borderColor: 'rgba(245,166,35,0.65)' },
  fieldDone: { borderColor: 'rgba(245,166,35,0.45)' },
  fieldDimmed: { opacity: 0.45 },
  separator: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.3)',
    paddingHorizontal: Spacing.xs,
  },
});

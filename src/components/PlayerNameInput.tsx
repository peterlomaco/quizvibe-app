import React, { useState, type ReactNode, type RefObject } from 'react';
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

// Namnfältets andel av fältytan (bokstäver upp till 10 > siffror upp till 7).
const LETTERS_SHARE = 0.6;
const DIGITS_MIN_W = 76;
const SEPARATOR_W = 16;

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
    done && styles.fieldDone,
    focusedField === field && styles.fieldFocused,
  ];
  // Exakta bredder ur uppmätt fältyta (raden minus ev. trailing-knapp).
  // flex-andelar räckte inte: på iOS blev namnfältet smalast när Register-✓
  // tog plats. Före första mätningen gäller flex-fallbacken i styles.
  const [areaW, setAreaW] = useState(0);
  const inner = Math.max(0, areaW - SEPARATOR_W - 2 * Spacing.sm);
  const digitsW = Math.max(DIGITS_MIN_W, Math.round(inner * (1 - LETTERS_SHARE)));
  const lettersW = Math.max(0, inner - digitsW);
  const measured = areaW > 0;
  return (
    <View style={styles.row}>
      <View style={styles.area} onLayout={(e) => setAreaW(e.nativeEvent.layout.width)}>
        <View style={measured ? { width: lettersW } : styles.letters}>
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
        </View>
        <Text style={styles.separator}>–</Text>
        <View
          style={[
            measured ? { width: digitsW } : styles.digits,
            digitsDimmed && styles.fieldDimmed,
          ]}
        >
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
        </View>
      </View>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: Spacing.sm,
  },
  area: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  field: {
    width: '100%',
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
  // ett golv så 7 siffror aldrig kläms på smala iPhones. flexBasis 0 är
  // explicit: med `flex: N` krympte namnfältet mer än sifferfältet när en
  // trailing-knapp (Register-✓) tog plats, så namnet blev smalast. Nu delas
  // utrymmet alltid 3:2 oavsett innehåll och trailing. Flex sitter på
  // wrapper-Views (iOS-TextInput respekterade inte sin flex-andel direkt).
  letters: { flexGrow: 3, flexShrink: 1, flexBasis: 0, minWidth: 0 },
  digits: { flexGrow: 2, flexShrink: 1, flexBasis: 0, minWidth: 76 },
  fieldFocused: { borderColor: 'rgba(245,166,35,0.65)' },
  fieldDone: { borderColor: 'rgba(245,166,35,0.45)' },
  fieldDimmed: { opacity: 0.45 },
  separator: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.3)',
    width: SEPARATOR_W,
    textAlign: 'center',
  },
});

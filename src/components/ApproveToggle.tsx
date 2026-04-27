import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';

interface ApproveToggleProps {
  /** Aktuellt val — 'no' (röd) eller 'yes' (grön). */
  value: 'no' | 'yes';
  /** Anropas när användaren tappar den motsatta sidan. */
  onChange: (next: 'no' | 'yes') => void;
  /** Optional label som visas till vänster om toggleln (t.ex. "Approve All"). */
  label?: string;
}

/**
 * Bidirektionell svep-toggle: No (röd) ↔ Yes (grön). Pillen animerar
 * mellan sidorna när `value`-propen ändras. Båda sidor är tappbara —
 * tap på den motsatta sidan triggar `onChange`.
 *
 * Återanvänder samma visuella mönster som GameMode-toggleln i Lobby.
 */
export function ApproveToggle({ value, onChange, label }: ApproveToggleProps) {
  // Animationsvärde startar synkat med initial value
  const slideAnim = useRef(new Animated.Value(value === 'yes' ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: value === 'yes' ? 1 : 0,
      useNativeDriver: false,
      friction: 9,
      tension: 70,
    }).start();
  }, [value, slideAnim]);

  const handleSelectNo = () => {
    if (value !== 'no') onChange('no');
  };
  const handleSelectYes = () => {
    if (value !== 'yes') onChange('yes');
  };

  // Pillens färg interpoleras mellan röd (No) och grön (Yes) baserat
  // på slideAnim — så toggleln signalerar tillstånd via färg.
  const pillBg = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,107,107,0.18)', 'rgba(82,200,122,0.18)'],
  });
  const pillBorder = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.error, Colors.success],
  });

  return (
    <View style={styles.row}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.toggle}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pill,
            {
              left: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['1%', '50%'],
              }),
              backgroundColor: pillBg,
              borderColor: pillBorder,
            },
          ]}
        />
        <TouchableOpacity style={styles.option} onPress={handleSelectNo} activeOpacity={0.7}>
          <Text style={styles.optionText}>No</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={handleSelectYes} activeOpacity={0.7}>
          <Text style={[styles.optionText, styles.optionTextYes]}>Yes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    // Höger-justera label + toggle så de sitter tätt ihop på höger sida
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  toggle: {
    position: 'relative',
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 36,
    minWidth: 130,
  },
  pill: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    width: '49%',
    borderRadius: Radius.sm,
    borderWidth: 1,
    // backgroundColor + borderColor sätts dynamiskt via Animated
    // (röd vid No, grön vid Yes).
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  optionText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  // Yes är default "ej valt" — vit text för läsbarhet utan att vara
  // för dominerande som grön (success-färgen reserveras för pillen).
  optionTextYes: {
    color: Colors.textPrimary,
  },
});

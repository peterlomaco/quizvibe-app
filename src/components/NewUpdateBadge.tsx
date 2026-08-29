import { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '../theme';

/**
 * Delad blinkande "New update"-signal i guld (opacity 1↔0.3 / 600ms) — samma
 * fade-kurva som Lobby:s BlinkingLabel och Home-knapparnas useBlink. Loopen
 * ägs av komponenten själv (startar vid mount, stoppas vid unmount) så den
 * re-blinkar pålitligt vid varje remount.
 *
 * Syftet är att LEDA blicken vidare från Home-knappens "New update" hela vägen
 * ner till det faktiska spelet: sektionsrubriker, den specifika raden och
 * accept-åtgärden i Marathon-modalen bär alla samma märke. Returnerar null när
 * `active` är false så den bara tar plats när det finns något att peka på.
 *
 * @param pill  Guldfylld pill med svart text (samma vokabulär som PREMIUM-
 *   badgen) — för kant-skärande rad-badges. Default: enkel inline guldtext,
 *   samma som den befintliga "New update"-texten i knapparna.
 */
export function NewUpdateBadge({
  active = true,
  label = 'New update',
  pill = false,
  style,
  textStyle,
}: {
  active?: boolean;
  label?: string;
  pill?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!active) {
      opacity.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      opacity.setValue(1);
    };
  }, [active, opacity]);

  if (!active) return null;

  if (pill) {
    return (
      <Animated.View style={[styles.pill, style, { opacity }]}>
        <Animated.Text style={[styles.pillText, textStyle]} numberOfLines={1}>
          {label}
        </Animated.Text>
      </Animated.View>
    );
  }
  return (
    <Animated.Text
      style={[styles.inline, textStyle, { opacity }]}
      numberOfLines={1}
    >
      {label}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  // Inline: speglar knapparnas newUpdateLabel-typografi.
  inline: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.warning,
    letterSpacing: 0.2,
  },
  // Pill: guldfylld med svart text (samma som PREMIUM-badgen) — läses som ett
  // märke ovanpå en rad/kant.
  pill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    backgroundColor: Colors.warning,
  },
  pillText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.2,
  },
});

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';

// Delad tagline för Home + Lobby (Peter 2026-10-26): två fraser som
// växlar i samma slot — den gamla tonas ut helt innan den nya tonas in. Index 0 ligger i flow och sätter höjden;
// övriga ligger absolut ovanpå så layouten aldrig hoppar.
export const TAGLINES = ['Play your way. Anytime. Anywhere.', 'Music. Film/TV. Play.'];
const HOLD_MS = 4000;
const FADE_MS = 600;
/** Tom paus mellan ut- och intoning. */
const GAP_MS = 150;

interface Props {
  textStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  /** En rad; krymper hellre än bryts (Lobby-headern). */
  singleLine?: boolean;
}

export function RotatingTagline({ textStyle, style, singleLine = false }: Props) {
  const opacities = useRef(TAGLINES.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;
  const idxRef = useRef(0);

  useEffect(() => {
    let anim: Animated.CompositeAnimation | null = null;
    const id = setInterval(() => {
      const cur = idxRef.current;
      const next = (cur + 1) % TAGLINES.length;
      const ease = Easing.bezier(0.4, 0, 0.2, 1);
      // Sekventiellt (Peter 2026-10-26): ut helt FÖRST, sedan in — de två
      // fraserna syns aldrig samtidigt ovanpå varandra.
      anim = Animated.sequence([
        Animated.timing(opacities[cur], { toValue: 0, duration: FADE_MS, easing: ease, useNativeDriver: true }),
        Animated.delay(GAP_MS),
        Animated.timing(opacities[next], { toValue: 1, duration: FADE_MS, easing: ease, useNativeDriver: true }),
      ]);
      anim.start();
      idxRef.current = next;
    }, HOLD_MS + FADE_MS * 2 + GAP_MS);
    return () => {
      clearInterval(id);
      anim?.stop();
    };
  }, [opacities]);

  return (
    <View style={style}>
      {TAGLINES.map((text, i) => (
        <Animated.Text
          key={text}
          style={[textStyle, i > 0 && styles.overlay, { opacity: opacities[i] }]}
          {...(singleLine ? { numberOfLines: 1, adjustsFontSizeToFit: true, minimumFontScale: 0.75 } : {})}
        >
          {text}
        </Animated.Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0 },
});

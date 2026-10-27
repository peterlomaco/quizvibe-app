import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { SwipeHandIcon } from './SwipeHandIcon';

/**
 * Hand-guide för Name-svar (Peter 2026-10-27): samma diskreta hand som på
 * årtalslinjens första fråga, men den glider NEDÅT över alla svarsalternativ
 * (två svep) och tonas sedan ut. Försvinner direkt när spelaren rör listan.
 *
 * Wrappar svarsblocket; handen ligger i ett pointerEvents="none"-lager så den
 * aldrig stjäl ett tap från alternativen.
 */
interface Props {
  /** Visa guiden (t.ex. bara på spelets första Name-fråga). */
  enabled: boolean;
  /** false när svaret är låst / fasen inte är 'question'. */
  active: boolean;
  children: React.ReactNode;
}

const HAND_SIZE = 24;
const PASSES = 2;

export function NameSwipeHint({ enabled, active, children }: Props) {
  const [height, setHeight] = useState(0);
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState(false);
  const handY = useRef(new Animated.Value(0)).current;
  const handOpacity = useRef(new Animated.Value(0)).current;

  const show = enabled && active && !touched && !done && height > 0;

  useEffect(() => {
    if (!show) {
      handY.stopAnimation();
      handOpacity.stopAnimation();
      return;
    }
    // Fingertoppen börjar på första raden och slutar på sista.
    const top = 14;
    const bottom = Math.max(top, height - HAND_SIZE - 14);
    const pass = Animated.sequence([
      Animated.timing(handY, { toValue: top, duration: 0, useNativeDriver: true }),
      Animated.timing(handOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(handY, {
        toValue: bottom,
        duration: Math.min(2600, Math.max(1200, (bottom - top) * 6)),
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(handOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.delay(200),
    ]);
    const anim = Animated.loop(pass, { iterations: PASSES });
    anim.start(({ finished }) => { if (finished) setDone(true); });
    return () => anim.stop();
  }, [show, height, handY, handOpacity]);

  return (
    <View
      onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
      onTouchStart={() => { if (!touched) setTouched(true); }}
    >
      {children}
      {show && (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', top: 0, left: 36 }}
        >
          <Animated.View style={{ opacity: handOpacity, transform: [{ translateY: handY }] }}>
            <SwipeHandIcon size={HAND_SIZE} color="rgba(255,255,255,0.7)" strokeWidth={1.6} />
          </Animated.View>
        </View>
      )}
    </View>
  );
}

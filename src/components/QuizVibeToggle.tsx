import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Dimensions, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Pressable } from '@/src/components/haptic';
import { BrandUi, Colors } from '../theme';
import { MetallicGoldFill } from './MetallicGoldFill';

/**
 * QuizVibeToggle (2026-10-19) — delad ON/OFF-kontroll i navy/guld-systemet.
 *
 *   OFF = mörk navy/gunmetal-spår + gunmetal-knopp, ingen glöd.
 *   ON  = svagt guldtonat spår + metallisk guldknopp med diskret glöd.
 *
 * Binär (aldrig volym): knoppen glider horisontellt (OFF vänster, ON höger)
 * och den frilagda sidan visar alltid aktuellt läge i text ("OFF"/"ON"), så
 * läget aldrig hänger på färg ensam.
 *
 * KONTROLLERAD: renderas enbart från `value`. Tappet anropar bara
 * `onValueChange(!value)` — avbryter en guard i handlern (sätter inte state)
 * står toggeln kvar, exakt som RN-Switch. Flera Profile-handlers bygger på det.
 *
 * Varianter: 'mixer' (Source Mixerboard, starkast) och 'compact' (paket,
 * Spotify-svarslägen — ca 75 % storlek, svagare glöd).
 */

export type QuizVibeToggleVariant = 'mixer' | 'compact';

interface Props {
  value: boolean;
  onValueChange?: (next: boolean) => void;
  variant?: QuizVibeToggleVariant;
  disabled?: boolean;
  /** Ikon i knoppen (t.ex. MusicNoteIcon). Får färgen för aktuellt läge. */
  icon?: (color: string, size: number) => React.ReactNode;
  accessibilityLabel: string;
  /** Layout/opacitet på spåret (t.ex. marginLeft, låst-dimning). Läggs sist,
   *  så en opacity här ERSÄTTER disabled-dimningen i stället för att staplas. */
  style?: StyleProp<ViewStyle>;
  /** Låst kontroll (t.ex. gäst-host): tappet går fortfarande till
   *  onValueChange (som visar låst-popupen) men knoppen flippar inte. */
  locked?: boolean;
}

// Smala skärmar (iPhone SE / Display Zoom = 320 pt): mixer-kolumnerna i
// Profile är bara ~67 pt breda, så mixer-varianten krymper där.
const NARROW = Dimensions.get('window').width < 360;

const SIZES = {
  mixer: NARROW
    ? { w: 58, h: 28, knob: 22, font: 9, icon: 13, glow: 0.28 }
    : { w: 66, h: 32, knob: 26, font: 10, icon: 15, glow: 0.3 },
  compact: { w: 50, h: 24, knob: 18, font: 8, icon: 11, glow: 0.25 },
} as const;

const PAD = 2; // luft mellan knopp och spårkant (innanför 1 pt-kanten)
const DURATION = 160;
// Utan nytt värde inom denna tid (guard/bekräftelse avböjde) glider knoppen tillbaka.
const REVERT_AFTER_MS = 900;

export function QuizVibeToggle({
  value,
  onValueChange,
  variant = 'mixer',
  disabled = false,
  icon,
  accessibilityLabel,
  style,
  locked = false,
}: Props) {
  const s = SIZES[variant];
  const travel = s.w - 2 - s.knob - PAD * 2; // 2 = spårets kant (1 pt × 2)
  // useState-initialiserare (inte useRef().current) — samma stabila instans,
  // men ingen ref-läsning under render (react-hooks/refs).
  const [progress] = useState(() => new Animated.Value(value ? 1 : 0));
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((rm) => {
        if (active) setReduceMotion(rm);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Omedelbar respons (2026-10-21): togglen är kontrollerad, så den rörde
  // sig först när föräldern ritats om med nytt värde — på Lobby (en mycket
  // tung skärm) kändes tappet oregistrerat. Nu visas det nya läget DIREKT
  // (optimistiskt) och animationen startas native innan föräldern
  // uppdateras; onValueChange körs först nästa frame. Kommer inget nytt
  // värde (guard/bekräftelse-dialog avböjde) glider den tillbaka.
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const valueRef = useRef(value);
  const revertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shown = optimistic ?? value;

  const animateTo = (on: boolean) => {
    Animated.timing(progress, {
      toValue: on ? 1 : 0,
      duration: reduceMotion ? 0 : DURATION,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    valueRef.current = value;
    if (optimistic !== null && value === optimistic) {
      setOptimistic(null);
      if (revertTimer.current) {
        clearTimeout(revertTimer.current);
        revertTimer.current = null;
      }
    }
    animateTo(optimistic ?? value);
    // animateTo läser bara stabila värden + reduceMotion (i deps).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, optimistic, reduceMotion, progress]);

  useEffect(
    () => () => {
      if (revertTimer.current) clearTimeout(revertTimer.current);
    },
    [],
  );

  const handlePress = () => {
    if (!onValueChange) return;
    if (locked) {
      onValueChange(!value);
      return;
    }
    const next = !shown;
    animateTo(next);
    setOptimistic(next);
    if (revertTimer.current) clearTimeout(revertTimer.current);
    revertTimer.current = setTimeout(() => {
      revertTimer.current = null;
      if (valueRef.current !== next) setOptimistic(null);
    }, REVERT_AFTER_MS);
    // Låt animationen starta innan den tunga föräldra-uppdateringen.
    requestAnimationFrame(() => onValueChange(next));
  };

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, travel] });
  // Frilagd sida visar aktuellt läge: OFF syns till höger när knoppen står
  // vänster, ON syns till vänster när knoppen står höger.
  const offLabelOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const onLabelOpacity = progress;

  // Ikonen syns i båda lägen: dämpad i OFF, mörk högkontrast på guldet i ON.
  const iconColor = shown ? BrandUi.toggleIconOn : BrandUi.iconMuted;

  return (
    <Pressable
      onPress={disabled || !onValueChange ? undefined : handlePress}
      disabled={disabled}
      hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: shown, disabled }}
      style={({ pressed }) => [
        styles.track,
        {
          width: s.w,
          height: s.h,
          borderRadius: s.h / 2,
          backgroundColor: shown ? BrandUi.toggleOnTrack : BrandUi.toggleOffTrack,
          borderColor: shown ? BrandUi.toggleOnBorder : BrandUi.toggleOffBorder,
        },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {/* Läges-etiketter i spåret (under knoppen i z-ordning). */}
      <Animated.Text
        style={[styles.label, styles.labelOn, { fontSize: s.font, left: s.h / 2 - 6, opacity: onLabelOpacity }]}
        allowFontScaling={false}
      >
        ON
      </Animated.Text>
      <Animated.Text
        style={[styles.label, styles.labelOff, { fontSize: s.font, right: s.h / 2 - 6, opacity: offLabelOpacity }]}
        allowFontScaling={false}
      >
        OFF
      </Animated.Text>

      <Animated.View
        style={[
          styles.knobWrap,
          {
            width: s.knob,
            height: s.knob,
            borderRadius: s.knob / 2,
            left: PAD,
            transform: [{ translateX }],
            // Diskret guldglöd bara i ON (iOS-skugga; Android får ingen färgad glöd).
            shadowColor: BrandUi.toggleOnGlow,
            shadowOpacity: shown ? s.glow : 0,
            shadowRadius: shown ? 4 : 0,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      >
        <View
          style={[
            styles.knob,
            {
              width: s.knob,
              height: s.knob,
              borderRadius: s.knob / 2,
              backgroundColor: BrandUi.toggleKnobOff,
              borderColor: shown ? 'transparent' : BrandUi.toggleKnobOffBorder,
            },
          ]}
        >
          {/* Metallisk guldyta tonas in med progress → mjuk övergång. */}
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: progress }]} pointerEvents="none">
            <MetallicGoldFill radius={s.knob / 2} />
          </Animated.View>
          {icon ? <View style={styles.iconWrap}>{icon(iconColor, s.icon)}</View> : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}

// Exporterad så layouter kan reservera rätt bredd (t.ex. mixer-celler).
export function quizVibeToggleWidth(variant: QuizVibeToggleVariant): number {
  return SIZES[variant].w;
}

const styles = StyleSheet.create({
  track: {
    borderWidth: 1,
    justifyContent: 'center',
  },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.85 },
  label: {
    position: 'absolute',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  labelOn: { color: Colors.warning },
  labelOff: { color: BrandUi.toggleLabelOff },
  knobWrap: {
    position: 'absolute',
  },
  knob: {
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

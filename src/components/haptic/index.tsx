import React, { forwardRef } from 'react';
import {
  Pressable as RNPressable,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
  Switch as RNSwitch,
  TouchableOpacity as RNTouchableOpacity,
} from 'react-native';
import { tapHaptic } from '@/src/utils/haptics';

/**
 * Auto-haptiska varianter av RN:s tryck-primitiver.
 *
 * Exporteras med EXAKT samma namn som react-native (`Pressable`,
 * `TouchableOpacity`, `Switch`) så att call-sites bara byter import-källa —
 * JSX-kroppen är oförändrad. Haptiken fyras BARA när den relevanta handlern
 * faktiskt finns, så rena container-tryck utan handler förblir tysta.
 *
 * Fyras på onPress (release), inte press-in: RN avbryter onPress när ett tryck
 * blir en scroll, så vi slipper spurious surr när man drar i en lista.
 * Disabled-kontroller anropar aldrig sin handler → tysta automatiskt.
 */

type PressableProps = React.ComponentProps<typeof RNPressable> & {
  /**
   * Standard-feedback vid tryck (samma som Button: opacity 0.82 + scale
   * 0.985) för Pressables vars style är statisk. Opt-in — backdrops och
   * "svälj tapp"-kort ska inte blinka. En style-FUNKTION vinner alltid.
   */
  pressFeedback?: boolean;
};

/** Delad, återhållsam tryck-feedback (= Button.pressed). */
export const PRESSED_FEEDBACK: ViewStyle = {
  opacity: 0.82,
  transform: [{ scale: 0.985 }],
};

/** Default-opacitet för TouchableOpacity (RN:s 0.2 får knappen att nästan försvinna). */
export const PRESSED_ACTIVE_OPACITY = 0.7;
type TouchableOpacityProps = React.ComponentProps<typeof RNTouchableOpacity>;
type SwitchProps = React.ComponentProps<typeof RNSwitch>;

export const Pressable = forwardRef<
  React.ElementRef<typeof RNPressable>,
  PressableProps
>(({ onPress, pressFeedback, style, ...rest }, ref) => {
  const handlePress: PressableProps['onPress'] = onPress
    ? (event) => {
        tapHaptic();
        onPress(event);
      }
    : undefined;
  const resolvedStyle =
    pressFeedback && typeof style !== 'function'
      ? ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> => [
          style as StyleProp<ViewStyle>,
          pressed && !rest.disabled && PRESSED_FEEDBACK,
        ]
      : style;
  return <RNPressable ref={ref} onPress={handlePress} style={resolvedStyle} {...rest} />;
});
Pressable.displayName = 'HapticPressable';

export const TouchableOpacity = forwardRef<
  React.ElementRef<typeof RNTouchableOpacity>,
  TouchableOpacityProps
>(({ onPress, activeOpacity = PRESSED_ACTIVE_OPACITY, ...rest }, ref) => {
  const handlePress: TouchableOpacityProps['onPress'] = onPress
    ? (event) => {
        tapHaptic();
        onPress(event);
      }
    : undefined;
  return (
    <RNTouchableOpacity
      ref={ref}
      onPress={handlePress}
      activeOpacity={activeOpacity}
      {...rest}
    />
  );
});
TouchableOpacity.displayName = 'HapticTouchableOpacity';

export const Switch = forwardRef<
  React.ElementRef<typeof RNSwitch>,
  SwitchProps
>(({ onValueChange, ...rest }, ref) => {
  const handleValueChange: SwitchProps['onValueChange'] = onValueChange
    ? (value) => {
        tapHaptic();
        onValueChange(value);
      }
    : undefined;
  return <RNSwitch ref={ref} onValueChange={handleValueChange} {...rest} />;
});
Switch.displayName = 'HapticSwitch';

import React, { forwardRef } from 'react';
import {
  Pressable as RNPressable,
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

type PressableProps = React.ComponentProps<typeof RNPressable>;
type TouchableOpacityProps = React.ComponentProps<typeof RNTouchableOpacity>;
type SwitchProps = React.ComponentProps<typeof RNSwitch>;

export const Pressable = forwardRef<
  React.ElementRef<typeof RNPressable>,
  PressableProps
>(({ onPress, ...rest }, ref) => {
  const handlePress: PressableProps['onPress'] = onPress
    ? (event) => {
        tapHaptic();
        onPress(event);
      }
    : undefined;
  return <RNPressable ref={ref} onPress={handlePress} {...rest} />;
});
Pressable.displayName = 'HapticPressable';

export const TouchableOpacity = forwardRef<
  React.ElementRef<typeof RNTouchableOpacity>,
  TouchableOpacityProps
>(({ onPress, ...rest }, ref) => {
  const handlePress: TouchableOpacityProps['onPress'] = onPress
    ? (event) => {
        tapHaptic();
        onPress(event);
      }
    : undefined;
  return <RNTouchableOpacity ref={ref} onPress={handlePress} {...rest} />;
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

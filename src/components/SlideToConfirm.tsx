import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { TrashIcon } from './TrashIcon';
import { Colors, FontWeight, Radius } from '../theme';

/**
 * SlideToConfirm (2026-10-20) — avsiktlig "dra hela vägen"-bekräftelse för
 * destruktiva åtgärder (Delete Account). Ett tap gör ingenting: thumben måste
 * dras till ≥ CONFIRM_FRACTION av spåret, annars fjädrar den tillbaka.
 *
 * Vid lyckad dragning låses kontrollen direkt (inga dubbla anrop) och
 * `onConfirm` körs EN gång. Parent driver `busy` medan åtgärden pågår; går
 * `busy` tillbaka till false (fel) återställs slidern så man kan försöka igen.
 *
 * Visuellt (polish 2026-10-20): kompakt 48 pt-spår, rund thumb, dämpad röd
 * kant i vila som skärps medan man drar, diskreta dubbel-chevroner.
 */

const TRACK_H = 44;
const BORDER_W = 1;
const PAD = 4;
// Thumben mäts mot spårets INNERHÖJD (inom kanten) så top = PAD centrerar den exakt.
const THUMB = TRACK_H - BORDER_W * 2 - PAD * 2;
const CONFIRM_FRACTION = 0.92;
const DANGER = 'rgba(255,107,107,';
const BORDER_IDLE = `${DANGER}0.3)`;
const BORDER_ACTIVE = `${DANGER}0.65)`;

interface Props {
  label: string;
  busyLabel: string;
  busy: boolean;
  onConfirm: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function SlideToConfirm({
  label,
  busyLabel,
  busy,
  onConfirm,
  accessibilityLabel,
  accessibilityHint,
}: Props) {
  const x = useRef(new Animated.Value(0)).current;
  const maxXRef = useRef(0);
  const lockedRef = useRef(false);
  const [maxX, setMaxX] = useState(0);
  const [locked, setLocked] = useState(false);
  const onConfirmRef = useRef(onConfirm);
  onConfirmRef.current = onConfirm;

  const springBack = () => {
    Animated.spring(x, {
      toValue: 0,
      useNativeDriver: false,
      bounciness: 0,
      speed: 14,
    }).start();
  };

  const confirm = () => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    setLocked(true);
    Animated.timing(x, {
      toValue: maxXRef.current,
      duration: 120,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onConfirmRef.current();
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !lockedRef.current,
      onMoveShouldSetPanResponder: (_, g) =>
        !lockedRef.current && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, g) => {
        if (lockedRef.current) return;
        x.setValue(Math.max(0, Math.min(maxXRef.current, g.dx)));
      },
      onPanResponderRelease: (_, g) => {
        if (lockedRef.current) return;
        const max = maxXRef.current;
        if (max > 0 && g.dx >= max * CONFIRM_FRACTION) confirm();
        else springBack();
      },
      onPanResponderTerminate: () => {
        if (!lockedRef.current) springBack();
      },
    }),
  ).current;

  // Åtgärden misslyckades (busy true → false medan vi är låsta) → återställ.
  const wasBusyRef = useRef(false);
  useEffect(() => {
    if (wasBusyRef.current && !busy && lockedRef.current) {
      lockedRef.current = false;
      setLocked(false);
      springBack();
    }
    wasBusyRef.current = busy;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy]);

  const onLayout = (e: LayoutChangeEvent) => {
    const m = Math.max(0, e.nativeEvent.layout.width - BORDER_W * 2 - PAD * 2 - THUMB);
    maxXRef.current = m;
    setMaxX(m);
  };

  const showBusy = locked || busy;
  const fillWidth = Animated.add(x, THUMB + PAD);
  const labelOpacity =
    maxX > 0
      ? x.interpolate({ inputRange: [0, maxX * 0.6], outputRange: [1, 0], extrapolate: 'clamp' })
      : 1;
  // Dämpad kant i vila, skärps så fort man börjar dra (och under radering).
  const borderColor = showBusy
    ? BORDER_ACTIVE
    : maxX > 0
      ? x.interpolate({
          inputRange: [0, maxX * 0.12, maxX],
          outputRange: [BORDER_IDLE, `${DANGER}0.5)`, BORDER_ACTIVE],
          extrapolate: 'clamp',
        })
      : BORDER_IDLE;

  return (
    <Animated.View
      style={[styles.track, { borderColor }]}
      onLayout={onLayout}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ busy: showBusy, disabled: showBusy }}
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'activate') confirm();
      }}
    >
      <Animated.View style={[styles.fill, { width: fillWidth }]} pointerEvents="none" />
      {showBusy ? (
        <View style={[styles.labelWrap, styles.busyWrap]} pointerEvents="none">
          <ActivityIndicator size="small" color={Colors.error} />
          <Text style={styles.label}>{busyLabel}</Text>
        </View>
      ) : (
        <Animated.View style={[styles.labelWrap, { opacity: labelOpacity }]} pointerEvents="none">
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
        </Animated.View>
      )}
      {!showBusy && (
        <Animated.View style={[styles.chevron, { opacity: labelOpacity }]} pointerEvents="none">
          <Svg width={16} height={10} viewBox="0 0 16 10">
            <Path
              d="M2 1.5 L5.5 5 L2 8.5 M8.5 1.5 L12 5 L8.5 8.5"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </Animated.View>
      )}
      <Animated.View
        style={[styles.thumb, { transform: [{ translateX: x }] }, showBusy && { opacity: 0 }]}
        {...pan.panHandlers}
      >
        <TrashIcon size={18} color={Colors.error} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: TRACK_H,
    borderRadius: Radius.md,
    borderWidth: BORDER_W,
    backgroundColor: '#141C2B',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: `${DANGER}0.1)`,
  },
  labelWrap: {
    position: 'absolute',
    left: THUMB + PAD * 2,
    right: 24,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  busyWrap: {
    left: PAD,
    right: PAD,
  },
  label: {
    fontSize: 14,
    fontWeight: FontWeight.semibold,
    color: 'rgba(255,255,255,0.85)',
  },
  chevron: {
    position: 'absolute',
    right: 12,
  },
  thumb: {
    position: 'absolute',
    top: PAD,
    left: PAD,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 1,
    borderColor: `${DANGER}0.45)`,
    backgroundColor: '#2A1C24',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

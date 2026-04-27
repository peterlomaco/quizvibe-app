import React, { useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing } from '../theme';
 
const THUMB_SIZE = 22;
 
interface SliderInputProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  label?: string;
  formatValue?: (value: number) => string;
}
 
export function SliderInput({
  min,
  max,
  value,
  onChange,
  step = 1,
  label,
  formatValue,
}: SliderInputProps) {
  const [trackWidth, setTrackWidth] = useState(0);
 
  /**
   * Always-fresh ref — safe to read inside the PanResponder closure.
   * Avoids stale-closure bugs with min/max/step changing between renders.
   */
  const r = useRef({ min, max, step, onChange, trackWidth: 0 });
  r.current = { min, max, step, onChange, trackWidth };
 
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => applyX(evt.nativeEvent.locationX, r.current),
      onPanResponderMove: (evt) => applyX(evt.nativeEvent.locationX, r.current),
    })
  ).current;
 
  const progress = trackWidth > 0 ? (value - min) / (max - min) : 0;
  const thumbLeft = progress * (trackWidth - THUMB_SIZE);
  const displayValue = formatValue ? formatValue(value) : String(value);
 
  return (
    <View style={styles.wrapper}>
      {label ? (
        <View style={styles.header}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{displayValue}</Text>
        </View>
      ) : null}
 
      <View
        style={styles.trackContainer}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
      >
        <View style={styles.track}>
          <View
            style={[styles.fill, { width: Math.max(0, thumbLeft + THUMB_SIZE / 2) }]}
          />
        </View>
 
        {trackWidth > 0 && (
          <View style={[styles.thumb, { left: Math.max(0, thumbLeft) }]} />
        )}
      </View>
    </View>
  );
}
 
function applyX(
  x: number,
  ctx: { min: number; max: number; step: number; trackWidth: number; onChange: (v: number) => void }
) {
  const { min, max, step, trackWidth, onChange } = ctx;
  if (trackWidth === 0) return;
  const usable = trackWidth - THUMB_SIZE;
  const ratio = Math.max(0, Math.min(1, (x - THUMB_SIZE / 2) / usable));
  const raw = min + ratio * (max - min);
  const stepped = Math.round(raw / step) * step;
  onChange(Math.max(min, Math.min(max, stepped)));
}
 
const styles = StyleSheet.create({
  wrapper: { paddingVertical: Spacing.xs },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  value: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  trackContainer: { height: 44, justifyContent: 'center' },
  track: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.card,
    top: (44 - THUMB_SIZE) / 2,
  },
});
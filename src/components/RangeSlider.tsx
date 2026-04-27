import React, { useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing } from '../theme';
 
const THUMB_SIZE = 22;
 
interface RangeSliderProps {
  min: number;
  max: number;
  lowValue: number;
  highValue: number;
  onLowChange: (v: number) => void;
  onHighChange: (v: number) => void;
  step?: number;
  label?: string;
  formatValue?: (v: number) => string;
}
 
export function RangeSlider({
  min,
  max,
  lowValue,
  highValue,
  onLowChange,
  onHighChange,
  step = 1,
  label,
  formatValue,
}: RangeSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const activeThumb = useRef<'low' | 'high' | null>(null);
 
  /** Always-fresh ref — avoids stale closures inside PanResponder */
  const r = useRef({
    min, max, step, lowValue, highValue,
    onLowChange, onHighChange, trackWidth: 0,
  });
  r.current = { min, max, step, lowValue, highValue, onLowChange, onHighChange, trackWidth };
 
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { lowValue, highValue, min, max, trackWidth } = r.current;
        const x = evt.nativeEvent.locationX;
        const usable = trackWidth - THUMB_SIZE;
        const lowX  = ((lowValue  - min) / (max - min)) * usable + THUMB_SIZE / 2;
        const highX = ((highValue - min) / (max - min)) * usable + THUMB_SIZE / 2;
        activeThumb.current =
          Math.abs(x - lowX) <= Math.abs(x - highX) ? 'low' : 'high';
        applyX(x, activeThumb.current, r.current);
      },
      onPanResponderMove: (evt) => {
        if (!activeThumb.current) return;
        applyX(evt.nativeEvent.locationX, activeThumb.current, r.current);
      },
      onPanResponderRelease: () => {
        activeThumb.current = null;
      },
    })
  ).current;
 
  const toX = (v: number) =>
    trackWidth > 0 ? ((v - min) / (max - min)) * (trackWidth - THUMB_SIZE) : 0;
 
  const lowX  = toX(lowValue);
  const highX = toX(highValue);
  const fmt   = formatValue ?? String;
 
  return (
    <View style={styles.wrapper}>
      {label ? (
        <View style={styles.header}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{fmt(lowValue)} – {fmt(highValue)}</Text>
        </View>
      ) : null}
 
      <View
        style={styles.trackContainer}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
      >
        {/* Background track */}
        <View style={styles.track} />
 
        {/* Active range fill */}
        {trackWidth > 0 && (
          <View
            style={[
              styles.fill,
              { left: lowX + THUMB_SIZE / 2, width: Math.max(0, highX - lowX) },
            ]}
          />
        )}
 
        {/* Low thumb */}
        {trackWidth > 0 && <View style={[styles.thumb, { left: lowX }]} />}
 
        {/* High thumb */}
        {trackWidth > 0 && <View style={[styles.thumb, { left: highX }]} />}
      </View>
    </View>
  );
}
 
type Ctx = {
  min: number; max: number; step: number; trackWidth: number;
  lowValue: number; highValue: number;
  onLowChange: (v: number) => void; onHighChange: (v: number) => void;
};
 
function applyX(x: number, thumb: 'low' | 'high', ctx: Ctx) {
  const { min, max, step, trackWidth, lowValue, highValue, onLowChange, onHighChange } = ctx;
  if (trackWidth === 0) return;
  const usable = trackWidth - THUMB_SIZE;
  const ratio  = Math.max(0, Math.min(1, (x - THUMB_SIZE / 2) / usable));
  const v      = Math.round((min + ratio * (max - min)) / step) * step;
 
  if (thumb === 'low')  onLowChange(Math.max(min, Math.min(v, highValue - step)));
  else                  onHighChange(Math.min(max, Math.max(v, lowValue + step)));
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
  },
  fill: {
    position: 'absolute',
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    top: (44 - 4) / 2,
  },
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
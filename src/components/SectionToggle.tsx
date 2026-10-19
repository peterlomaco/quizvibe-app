import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { BrandUi, Colors, Radius } from '../theme';

interface Props {
  expanded: boolean;
  /** 'neutral' = ingen guldton i utfällt läge — för vanlig navigering i
   *  listor (Player history-grupper/kort). Guld reserveras för sektioner. */
  tone?: 'accent' | 'neutral';
  style?: StyleProp<ViewStyle>;
}

/**
 * Delad +/− för utfällbara sektioner (Profile v2, 2026-10-19).
 * Hopfälld: mörk gunmetal-ruta, svag grå kant, dämpat grått +.
 * Utfälld: svag guldkant + guld −.
 * Ritat på 24-gridet med samma streckvikt (1.8) som övriga outline-ikoner,
 * så alla expand/collapse-kontroller har identisk storlek och vikt.
 */
export function SectionToggle({ expanded, tone = 'accent', style }: Props) {
  const accent = expanded && tone === 'accent';
  const color = accent ? Colors.warning : BrandUi.iconMuted;
  return (
    <View style={[styles.box, accent && styles.boxActive, style]}>
      <Svg width={16} height={16} viewBox="0 0 24 24">
        <Line x1={6} y1={12} x2={18} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
        {!expanded && (
          <Line x1={12} y1={6} x2={12} y2={18} stroke={color} strokeWidth={2} strokeLinecap="round" />
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#141C2B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: { borderColor: 'rgba(245,166,35,0.55)' },
});

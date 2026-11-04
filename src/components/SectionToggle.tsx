import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BrandUi, Colors, Radius } from '../theme';
import { ChevronIcon } from './ChevronIcon';

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
export function SectionToggle({ expanded, tone: _tone = 'accent', style }: Props) {
  // Utfälld = ALLTID guldkant + guld chevron, även tone 'neutral'
  // (Peter 2026-11-04). tone behålls i API:t men påverkar inte längre.
  const accent = expanded;
  const color = accent ? Colors.warning : BrandUi.iconMuted;
  return (
    <View style={[styles.box, accent && styles.boxActive, style]}>
      {/* Chevron i stället för +/− (Peter 2026-11-04): ned = hopfälld,
          upp = utfälld. */}
      <ChevronIcon size={16} color={color} strokeWidth={2} direction={expanded ? 'up' : 'down'} />
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

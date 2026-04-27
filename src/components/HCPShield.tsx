import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { FontWeight } from '../theme';

interface HCPShieldProps {
  hcp: number; // 1–99
  size?: number; // bredd i px; höjd ≈ size * 1.15
}

/**
 * Tre tiers efter HCP-nivå (lågt = elit).
 * Färg och glöd-intensitet ökar när HCP sjunker.
 * Matchar projektvisionen: brons → silver → guld.
 */
function getTier(hcp: number) {
  if (hcp <= 33) {
    return {
      stroke: '#FFD166',       // guld
      fill:   'rgba(255,209,102,0.12)',
      glowOpacity: 0.85,
      glowRadius: 20,
    };
  }
  if (hcp <= 66) {
    return {
      stroke: '#2DD4BF',       // teal (mellantier)
      fill:   'rgba(45,212,191,0.10)',
      glowOpacity: 0.55,
      glowRadius: 16,
    };
  }
  return {
    stroke: '#B08A5A',         // brons (nybörjare)
    fill:   'rgba(176,138,90,0.08)',
    glowOpacity: 0.3,
    glowRadius: 12,
  };
}

export function HCPShield({ hcp, size = 100 }: HCPShieldProps) {
  const tier = getTier(hcp);
  const w = size;
  const h = size * 1.15;
  const r = 6; // radius för rundade topp-hörn

  // Klassisk sköld: rundade topp-hörn, raka sidor, spetsig bottenkurva
  const d = `
    M ${r} 2
    L ${w - r} 2
    Q ${w - 2} 2 ${w - 2} ${r + 2}
    L ${w - 2} ${h * 0.55}
    Q ${w - 2} ${h * 0.82} ${w / 2} ${h - 2}
    Q 2 ${h * 0.82} 2 ${h * 0.55}
    L 2 ${r + 2}
    Q 2 2 ${r} 2
    Z
  `.trim();

  return (
    <View
      style={[
        styles.wrapper,
        {
          width: w,
          height: h,
          shadowColor: tier.stroke,
          shadowOpacity: tier.glowOpacity,
          shadowRadius: tier.glowRadius,
        },
      ]}
    >
      <Svg width={w} height={h}>
        <Path d={d} stroke={tier.stroke} strokeWidth={2.5} fill={tier.fill} />
      </Svg>

      {/* Textöverlagring – "HCP" över, siffra under */}
      <View style={[styles.textLayer, { paddingBottom: h * 0.1 }]} pointerEvents="none">
        <Text style={[styles.labelText, { fontSize: size * 0.14 }]}>HCP</Text>
        <Text style={[styles.valueText, { fontSize: size * 0.34 }]}>{hcp}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  textLayer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontWeight: FontWeight.bold,
    color: '#fff',
    letterSpacing: 1.8,
  },
  valueText: {
    fontWeight: FontWeight.bold,
    color: '#fff',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
});

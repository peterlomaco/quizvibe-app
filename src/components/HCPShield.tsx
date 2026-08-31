import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors, FontWeight } from '../theme';

interface HCPShieldProps {
  hcp: number; // 1–99
  size?: number; // bredd i px; höjd ≈ size * 1.15
  // Guest-läge (§3): sköldens SIFFRA döljs och ersätts av vattenstämpeln
  // "Not Defined". Rent kosmetiskt — gästen har fortfarande ett riktigt,
  // dynamiskt härlett HCP internt (getGuestHcpFromClosestAge), det visas
  // bara inte som ett tal. `hcp`-propen ignoreras när detta är true.
  notDefined?: boolean;
}

// Neutral tier för Guest-sköld ("Not Defined") — grå, ingen elit-glöd.
const NOT_DEFINED_TIER = {
  stroke: '#6B7280',
  fill: 'rgba(107,114,128,0.10)',
  glowOpacity: 0.25,
  glowRadius: 10,
};

/**
 * Fyra tiers efter HCP-nivå (lågt = elit), app-paletten (Peter 2026-08-28):
 *   99–60 → grå (nybörjare)   ·   59–40 → blå
 *   39–20 → brons             ·   19–1  → guld (elit)
 * Glöd-intensiteten ökar när HCP sjunker. Blå = Colors.primary, guld =
 * Colors.warning (theme-tokens); grå (#6B7280, appens muted-grå) och brons
 * (#B08A5A) saknar tokens och sätts direkt.
 */
function getTier(hcp: number) {
  // 19–1 → guld (elit)
  if (hcp <= 19) {
    return {
      stroke: Colors.warning,               // #F5A623
      fill:   'rgba(245,166,35,0.14)',
      glowOpacity: 0.85,
      glowRadius: 20,
    };
  }
  // 39–20 → brons
  if (hcp <= 39) {
    return {
      stroke: '#B08A5A',
      fill:   'rgba(176,138,90,0.12)',
      glowOpacity: 0.6,
      glowRadius: 16,
    };
  }
  // 59–40 → blå
  if (hcp <= 59) {
    return {
      stroke: Colors.primary,               // #4DA3FF
      fill:   'rgba(77,163,255,0.12)',
      glowOpacity: 0.5,
      glowRadius: 14,
    };
  }
  // 99–60 → grå (nybörjare)
  return {
    stroke: '#6B7280',
    fill:   'rgba(107,114,128,0.10)',
    glowOpacity: 0.3,
    glowRadius: 12,
  };
}

export function HCPShield({ hcp, size = 100, notDefined = false }: HCPShieldProps) {
  const tier = notDefined ? NOT_DEFINED_TIER : getTier(hcp);
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

      {/* Textöverlagring – "HCP" över, siffra (eller "Not Defined") under */}
      <View style={[styles.textLayer, { paddingBottom: h * 0.1 }]} pointerEvents="none">
        <Text style={[styles.labelText, { fontSize: size * 0.14 }]}>HCP</Text>
        {notDefined ? (
          <Text style={[styles.notDefinedText, { fontSize: size * 0.14 }]}>
            Not{'\n'}Defined
          </Text>
        ) : (
          <Text style={[styles.valueText, { fontSize: size * 0.34 }]}>{hcp}</Text>
        )}
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
  notDefinedText: {
    fontWeight: FontWeight.bold,
    color: '#fff',
    marginTop: 2,
    textAlign: 'center',
    opacity: 0.85,
  },
});

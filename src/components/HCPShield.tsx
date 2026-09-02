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
// Fyllningen är en LJUS version av tier-färgen (kantlinjen) — samma opacitet
// (0.22) för alla tiers så interiören läses som en ljus tint av respektive färg.
const NOT_DEFINED_TIER = {
  stroke: '#6B7280',
  fill: 'rgba(107,114,128,0.22)',
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
      fill:   'rgba(245,166,35,0.22)',
      glowOpacity: 0.85,
      glowRadius: 20,
    };
  }
  // 39–20 → brons
  if (hcp <= 39) {
    return {
      stroke: '#B08A5A',
      fill:   'rgba(176,138,90,0.22)',
      glowOpacity: 0.6,
      glowRadius: 16,
    };
  }
  // 59–40 → blå
  if (hcp <= 59) {
    return {
      stroke: Colors.primary,               // #4DA3FF
      fill:   'rgba(77,163,255,0.22)',
      glowOpacity: 0.5,
      glowRadius: 14,
    };
  }
  // 99–60 → grå (nybörjare)
  return {
    stroke: '#6B7280',
    fill:   'rgba(107,114,128,0.22)',
    glowOpacity: 0.3,
    glowRadius: 12,
  };
}

/** Sköldens tier-färg (kantlinje) för ett HCP-tal. Export så en omgivande
 *  ruta kan matcha sköldens färg (HCPShieldCard). */
export function getShieldTierColor(hcp: number, notDefined = false): string {
  return notDefined ? NOT_DEFINED_TIER.stroke : getTier(hcp).stroke;
}

/** Region scope → flagg-emoji (badgen ovan-höger på ett sköld-kort). V1 alltid
 *  Sweden; övriga breddnivåer får en placeholder tills fler länder finns. */
export function regionFlagEmoji(region: string | undefined | null): string {
  switch ((region ?? 'sweden').toLowerCase()) {
    case 'sweden':
      return '🇸🇪';
    case 'nordics':
    case 'nordic':
      return '🇸🇪';
    case 'europe':
      return '🇪🇺';
    default:
      return '🌍';
  }
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

// ── Sköld-KORT: sköld i en ruta vars kant matchar sköldens färg, med en
// etikett-badge under (Total/Music/Film/Sport) och en region-flagg-badge
// ovan-höger (§1.3 UI-krav). notDefined → gäst-vattenstämpel + neutral grå kant.
interface HCPShieldCardProps {
  hcp: number;
  size?: number;
  label?: string;
  regionFlag?: string;
  notDefined?: boolean;
  // Etikett-badgens färger. Default = sköldens tier-färg + vit text. Kategori-
  // korten (Music/Film/Sport) skickar guld + svart för att matcha GetReady/
  // countdown-vyns kategori-badge.
  badgeColor?: string;
  badgeTextColor?: string;
  // HCP-förändring efter spelet (after − before). När satt renderas en badge i
  // övre HÖGRA hörnet: 0 (grå) / -x (grön = bättre) / +y (röd = sämre). Flaggan
  // flyttas då till övre VÄNSTRA hörnet så de inte krockar.
  deltaBadge?: number;
}

export function HCPShieldCard({
  hcp,
  size = 64,
  label,
  regionFlag,
  notDefined = false,
  badgeColor,
  badgeTextColor,
  deltaBadge,
}: HCPShieldCardProps) {
  const color = getShieldTierColor(hcp, notDefined);
  const labelBg = badgeColor ?? color;
  const labelFg = badgeTextColor ?? '#fff';
  const hasDelta = typeof deltaBadge === 'number';
  const deltaColor =
    deltaBadge === undefined || deltaBadge === 0
      ? '#6B7280'
      : deltaBadge < 0
        ? Colors.success
        : Colors.error;
  const deltaText = deltaBadge === undefined ? '' : deltaBadge > 0 ? `+${deltaBadge}` : `${deltaBadge}`;
  return (
    <View style={[cardStyles.box, { borderColor: color }]}>
      {regionFlag ? (
        // Flaggan ligger till höger som standard; med delta-badge → vänster.
        <View style={hasDelta ? cardStyles.flagBadgeLeft : cardStyles.flagBadge}>
          <Text style={cardStyles.flagBadgeText}>{regionFlag}</Text>
        </View>
      ) : null}
      {hasDelta ? (
        <View style={[cardStyles.deltaBadge, { backgroundColor: deltaColor }]}>
          <Text style={cardStyles.deltaBadgeText}>{deltaText}</Text>
        </View>
      ) : null}
      <HCPShield hcp={hcp} size={size} notDefined={notDefined} />
      {label ? (
        <View style={cardStyles.labelBadgeWrap} pointerEvents="none">
          <View style={[cardStyles.labelBadge, { backgroundColor: labelBg }]}>
            <Text style={[cardStyles.labelBadgeText, { color: labelFg }]} numberOfLines={1}>{label}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

// ── Sköld-KLUSTER: Total-kortet alltid; de tre kategori-korten när `expanded`.
// Parenten äger expand-state + ev. "+"-knapp (Profile: alltid expanded; lobby/
// leaderboard: bakom "+"). notDefined = gäst → alla kort visar "Not Defined".
export interface HcpShieldBundle {
  total: number;
  music: number;
  film: number;
  sport: number;
}
interface HCPShieldClusterProps {
  bundle: HcpShieldBundle;
  region?: string;
  expanded?: boolean;
  size?: number;
  notDefined?: boolean;
}

export function HCPShieldCluster({
  bundle,
  region,
  expanded = true,
  size = 60,
  notDefined = false,
}: HCPShieldClusterProps) {
  const subSize = Math.round(size * 0.8);
  return (
    <View style={cardStyles.clusterWrap}>
      <HCPShieldCard
        hcp={bundle.total}
        size={size}
        label="Total"
        notDefined={notDefined}
      />
      {expanded ? (
        <View style={cardStyles.clusterRow}>
          <HCPShieldCard hcp={bundle.music} size={subSize} label="Music" notDefined={notDefined} badgeColor={Colors.warning} badgeTextColor="#000" />
          <HCPShieldCard hcp={bundle.film} size={subSize} label="Film" notDefined={notDefined} badgeColor={Colors.warning} badgeTextColor="#000" />
          <HCPShieldCard hcp={bundle.sport} size={subSize} label="Sport" notDefined={notDefined} badgeColor={Colors.warning} badgeTextColor="#000" />
        </View>
      ) : null}
    </View>
  );
}

const cardStyles = StyleSheet.create({
  box: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderWidth: 2,
    borderRadius: 10,
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 10,
  },
  // HCP-förändrings-badge i övre HÖGRA hörnet (0 / -x / +y).
  deltaBadge: {
    position: 'absolute',
    top: -8,
    right: 4,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    zIndex: 11,
    elevation: 7,
  },
  deltaBadgeText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  flagBadge: {
    position: 'absolute',
    top: -8,
    right: 4,
    backgroundColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    zIndex: 10,
    elevation: 6,
  },
  // Flaggan i övre VÄNSTRA hörnet (när delta-badge upptar högra hörnet).
  flagBadgeLeft: {
    position: 'absolute',
    top: -8,
    left: 4,
    backgroundColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    zIndex: 10,
    elevation: 6,
  },
  flagBadgeText: {
    fontSize: 13,
  },
  // Kant-skärande etikett-badge på boxens NEDRE kantlinje (centrerad).
  labelBadgeWrap: {
    position: 'absolute',
    bottom: -9,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    elevation: 6,
  },
  labelBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  labelBadgeText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: '#fff',
    letterSpacing: 0.4,
  },
  clusterWrap: {
    alignItems: 'center',
    gap: 10,
  },
  clusterRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
    // Extra luft ned till kategori-sköldarna så de inte krockar med spelar-
    // namnet/Details-raden när de fälls ut i lobby-kortet.
    marginTop: 12,
  },
});

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

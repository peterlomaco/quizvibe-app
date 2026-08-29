import { Colors, Radius, Spacing } from '@/src/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Rect as SvgRect, Text as SvgText } from 'react-native-svg';
import { VersusIcon } from '@/src/components/VersusIcon';

// ─── Lobbytyp-väljare (Start New Game / Start Game as Guest) ─────────────────
// Renodlad 1vs1-lobby (2026-08-07): vägvalet mellan vanlig lobby och 1vs1-
// lobby görs på Home istället för via en Game Mode-ruta inne i lobbyn.
// Delas av BÅDA host-vägarna (registrerad + guest host) — samma sheet-/
// ChoiceRow-vokabulär som JoinModal:s choose-steg. Bor i src/components
// sedan 2026-08-08 eftersom Final Leaderboard (1vs1) har en egen
// "Start New Game"-knapp med samma utfällning.
export type HostLobbyType = 'single' | 'multiplayer' | '1v1';
/** De två lokala lobbytyperna — allt utom Remote 1vs1. */
export type LocalLobbyType = Exclude<HostLobbyType, '1v1'>;

// VersusIcon (två silhuetter + guld-"vs") bor i src/components/VersusIcon.tsx
// sedan 2026-08-07 — delas med "1vs1"-knappen på Home (MyMatchesSection)
// så duell-läget har EN ikon i appen.

/** Ikon för "Single & Multiplayer mode": **Here&Now** på tre rader —
 *  "Here" överst och "Now" underst i blått, med ett guld-"&" i mitten.
 *  &-tecknet ritas SIST så det lägger sig ovanpå och täcker en del av både
 *  "Here" och "Now". Halo i kortets bakgrundsfärg separerar &-tecknet från
 *  orden under. Blått speglar VersusIcon:s blå silhuetter. */
function HereNowIcon({ height = 60 }: { height?: number }) {
  // viewBox 56×46 — VersusIcon är sedan 2026-08-07 något bredare (64×46);
  // ikon-kolumnen (iconWrap) centrerar båda så de väger jämnt ändå.
  const width = height * (56 / 46);
  return (
    <Svg width={width} height={height} viewBox="0 0 56 46">
      <SvgText x={28} y={18} fontSize={15} fontWeight="bold" fill={Colors.primary} textAnchor="middle">
        Here
      </SvgText>
      <SvgText x={28} y={44} fontSize={15} fontWeight="bold" fill={Colors.primary} textAnchor="middle">
        Now
      </SvgText>
      {/* "&" ovanpå — halo först, sedan guld-fyllningen. textLength trycker
          ihop tecknet i bredd så det inte breder ut sig över orden. */}
      <SvgText
        x={28}
        y={33}
        fontSize={18}
        fontWeight="bold"
        fill={Colors.cardElevated}
        stroke={Colors.cardElevated}
        strokeWidth={4}
        textAnchor="middle"
        textLength={11}
        lengthAdjust="spacingAndGlyphs"
      >
        &amp;
      </SvgText>
      <SvgText
        x={28}
        y={33}
        fontSize={18}
        fontWeight="bold"
        fill={Colors.warning}
        textAnchor="middle"
        textLength={11}
        lengthAdjust="spacingAndGlyphs"
      >
        &amp;
      </SvgText>
    </Svg>
  );
}

/** Ikon för "Single Game": EN blå profil-silhuett. Samma proportioner som
 *  VersusIcon:s två figurer (huvud r 6 + kropp 17×14, rx 6) så de tre
 *  raderna i panelen läses som en familj — en figur = solo, två = duell. */
function SoloIcon({ height = 50 }: { height?: number }) {
  // Samma viewBox-kvot som HereNowIcon (56×46) — iconWrap centrerar båda.
  const width = height * (56 / 46);
  return (
    <Svg width={width} height={height} viewBox="0 0 56 46">
      {/* Figurens span är 8.5–37.5 → vertikalt centrerad i 46. */}
      <Circle cx={28} cy={14.5} r={6} fill={Colors.primary} />
      <SvgRect x={19.5} y={23.5} width={17} height={14} rx={6} fill={Colors.primary} />
    </Svg>
  );
}

/** Inline-utfällning under Start-knappen (Peter 2026-08-07 rev 2: ingen
 *  separat modal — alternativen är en del av knappen och fälls ut under
 *  den). `accentColor` ärvs från knappen ovanför (guld för inloggad,
 *  grå för guest) så panelen läses som knappens förlängning. */
export function HostTypeOptions({
  accentColor, onSelect, remoteMode = 'available', onRemoteLockedPress, localBadge,
}: {
  accentColor: string;
  onSelect: (lobbyType: HostLobbyType) => void;
  /**
   * Remote 1vs1 spelas ENBART av QuizVibe-users mot varandra (Peter
   * 2026-08-08) — det finns ingen guest-variant av läget. Raden har
   * därför tre öden beroende på vem som tittar:
   *
   *   'available' — normal, valbar. Registrerade "Start New Game".
   *   'locked'    — UTLOGGAD guest: dimmad + grön "QuizVibe user"-badge,
   *                 tap → register-upsell. Visas (inte göms) för
   *                 upptäckbarhet — guests ska se att läget finns och vad
   *                 som krävs.
   *   'hidden'    — INLOGGAD user i guest-panelen: raden renderas inte
   *                 alls. De har redan konto (en "account required"-badge
   *                 vore nonsens) och valet skulle skapa en guest-remote-
   *                 match, vilket inte längre existerar.
   */
  remoteMode?: 'available' | 'locked' | 'hidden';
  onRemoteLockedPress?: () => void;
  /**
   * Badge på Local Play-raden. Sätts av guest-call-siten så knappens egen
   * badge kan gömmas vid utfällning utan att informationen försvinner:
   * utloggad → grön "FREE", inloggad → grå "No Data Saved" (lokala
   * guest-spel skriver ingen Player History). Utelämnas av den
   * registrerade call-siten — där kostar hosting credits och spelen
   * sparas, så ingendera badge stämmer.
   *
   * Sätts på BÅDA lokala raderna — gratis-/ingen-historik-villkoret gäller
   * lika för Single och Multiplayer. Remote Play-raden bär antingen sin
   * egen "QuizVibe user"-badge ('locked') eller renderas inte alls
   * ('hidden').
   */
  localBadge?: { text: string; muted?: boolean };
}) {
  return (
    <View style={hostTypeStyles.panel}>
      {/* Single/Multiplayer väljs sedan 2026-08-24 HÄR i stället för via
          Game Mode-rutorna inne i lobbyn — lobbyn öppnas med rätt läge
          förvalt, men båda lobbytyperna visar fortfarande hela Game Mode-
          sektionen så host kan byta utan att lämna. */}
      <HostTypeOptionRow
        accentColor={accentColor}
        icon={<SoloIcon height={50} />}
        label="Single Game"
        subtitle="Play solo on this device"
        badgeText={localBadge?.text}
        badgeMuted={localBadge?.muted}
        onPress={() => onSelect('single')}
      />
      <HostTypeOptionRow
        accentColor={accentColor}
        icon={<HereNowIcon height={50} />}
        label="Multiplayer Game"
        subtitle="Pass-the-Phone or Individual devices"
        badgeText={localBadge?.text}
        badgeMuted={localBadge?.muted}
        onPress={() => onSelect('multiplayer')}
      />
      {remoteMode !== 'hidden' && (
        <HostTypeOptionRow
          accentColor={accentColor}
          icon={<VersusIcon height={50} />}
          label="Head-to-head"
          // Samma subtitel oavsett låst/olåst — "QuizVibe user"-badgen bär
          // kontokravet, subtiteln får beskriva vad läget ÄR.
          subtitle="H2H — challenge friends remotely"
          locked={remoteMode === 'locked'}
          badgeText={remoteMode === 'locked' ? 'QuizVibe user' : undefined}
          onPress={() => {
            if (remoteMode === 'locked') {
              onRemoteLockedPress?.();
              return;
            }
            onSelect('1v1');
          }}
        />
      )}
    </View>
  );
}

function HostTypeOptionRow({
  accentColor, icon, label, subtitle, onPress, locked = false, badgeText, badgeMuted = false,
}: {
  accentColor: string;
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  onPress: () => void;
  /** Kontogatad rad: dimmas, men förblir tappbar så tryck kan visa
   *  upsell:en istället för att välja läget. Badgen sätts separat via
   *  `badgeText` — dimning och badge är oberoende. */
  locked?: boolean;
  /** Kant-skärande badge i övre högra hörnet ("FREE", "QuizVibe user",
   *  "No Data Saved"). Dimmas ALDRIG — den ska förbli läsbar på en låst
   *  rad. */
  badgeText?: string;
  /** Grå badge (`#6B7280`) i stället för grön — speglar `homeUserBadge`
   *  på knapparna ovanför. Används för varningar ("No Data Saved"), medan
   *  grönt är för det som är gratis/upplåsande. */
  badgeMuted?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        hostTypeStyles.row,
        { borderColor: locked ? Colors.borderStrong : accentColor },
        locked && hostTypeStyles.rowLocked,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Dimningen ligger på INNEHÅLLET, inte på raden — badgen ska förbli
          helt läsbar. */}
      <View style={[hostTypeStyles.iconWrap, locked && hostTypeStyles.lockedDim]}>{icon}</View>
      <View style={[{ flex: 1 }, locked && hostTypeStyles.lockedDim]}>
        <Text style={hostTypeStyles.label}>{label}</Text>
        <Text style={hostTypeStyles.subtitle}>{subtitle}</Text>
      </View>
      <Text
        style={[
          hostTypeStyles.arrow,
          { color: locked ? Colors.borderStrong : accentColor },
          locked && hostTypeStyles.lockedDim,
        ]}
      >
        ›
      </Text>
      {!!badgeText && (
        <View
          style={[hostTypeStyles.rowBadge, badgeMuted && hostTypeStyles.rowBadgeMuted]}
          pointerEvents="none"
        >
          <Text style={hostTypeStyles.rowBadgeText}>{badgeText}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const hostTypeStyles = StyleSheet.create({
  // Panelen sitter direkt under knappen (litet gap) och är något indragen
  // så den visuellt hänger ihop med — men är underordnad — knappen.
  panel: {
    marginTop: 6,
    marginHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    // 78 (var 92) sedan panelen gick från två till tre rader — den bor i
    // Final Leaderboard:s ICKE-scrollande stickyFooter, så varje extra
    // pixel äts från poängtabellen ovanför.
    minHeight: 78,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    backgroundColor: Colors.cardElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  // Kant-skärande badge kräver relative + INGEN overflow:hidden på raden
  // (samma mönster som HOST/GUEST i PlayerRow och FREE/PREMIUM-badgarna).
  rowLocked: {
    position: 'relative',
    backgroundColor: Colors.card,
  },
  lockedDim: {
    opacity: 0.45,
  },
  // Grön + vit kant = Home:s badge-konvention (FREE / "QuizVibe USER" på
  // knapparna ovanför). På den låsta Remote-raden signalerar grönt VAD som
  // låser upp den, inte "avstängd".
  rowBadge: {
    position: 'absolute',
    top: -8,
    right: Spacing.md,
    backgroundColor: Colors.success,
    borderWidth: 1,
    borderColor: Colors.textPrimary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  rowBadgeMuted: {
    backgroundColor: '#6B7280',
  },
  rowBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#FFF',
  },
  iconWrap: {
    // 74 rymmer VersusIcon:s bredd vid height 50 (50 × 64/46 ≈ 70). Sänkt
    // från 88 när ikonerna krympte — den frigjorda bredden går till de
    // längre undertexterna ("Pass-the-Phone or Individual devices").
    width: 74,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  arrow: {
    fontSize: 28,
  },
});

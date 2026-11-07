import { Colors, Radius, Spacing } from '@/src/theme';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from '@/src/components/haptic';
import { VersusIcon } from '@/src/components/VersusIcon';
import { GroupOutlineIcon } from '@/src/components/GroupOutlineIcon';
import { ProfileOutlineIcon } from '@/src/components/ProfileOutlineIcon';
import { getCachedFeatureGates } from '@/src/utils/featureGates';
import { modeLabels } from '@/src/utils/gameFlow';

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

// Single/Multiplayer-ikonerna är rena outline-ikoner (Home v2, 2026-10-16)
// i samma familj som bottenmenyns Profile/Store — ersätter den blå
// silhuetten och "Here&Now"-textgrafiken. Q:et används aldrig här.
const MODE_ICON_SIZE = 36;
const MODE_ICON_STROKE = 1.6;

/** Inline-utfällning under Start-knappen (Peter 2026-08-07 rev 2: ingen
 *  separat modal — alternativen är en del av knappen och fälls ut under
 *  den). `accentColor` ärvs från knappen ovanför (guld för inloggad,
 *  grå för guest) så panelen läses som knappens förlängning. */
export function HostTypeOptions({
  accentColor, onSelect, remoteMode = 'available', onRemoteLockedPress, localBadge,
  iconColor, iconAccentColor, arrowColor, pressedBorderColor, heading, loadingType = null,
  guestHost = false,
}: {
  /** Guest-host-panelen: Multiplayer-raden nämner bara Pass-the-Phone. */
  guestHost?: boolean;
  accentColor: string;
  /** Optional title above the cards (Home: "Choose how to play"). */
  heading?: string;
  /** Functional icon colour (Solo / Here&Now / Versus). Default: legacy blue. */
  iconColor?: string;
  /** Icon accents ("&", wifi arcs). Default: legacy gold. */
  iconAccentColor?: string;
  /** Row arrow colour. Default: accentColor. */
  arrowColor?: string;
  /** Border colour while a row is pressed (gold = selected). Default: none. */
  pressedBorderColor?: string;
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
  /** Raden vars val väntar på backend (credit-gate + rums-registrering):
   *  pilen byts mot spinnern och ALLA rader är otappbara tills den settlar. */
  loadingType?: HostLobbyType | null;
}) {
  const anyLoading = loadingType != null;
  return (
    <View style={hostTypeStyles.panel}>
      {!!heading && <Text style={hostTypeStyles.heading}>{heading}</Text>}
      {/* Single/Multiplayer väljs sedan 2026-08-24 HÄR i stället för via
          Game Mode-rutorna inne i lobbyn — lobbyn öppnas med rätt läge
          förvalt, men båda lobbytyperna visar fortfarande hela Game Mode-
          sektionen så host kan byta utan att lämna. */}
      <HostTypeOptionRow
        accentColor={accentColor}
        arrowColor={arrowColor}
        pressedBorderColor={pressedBorderColor}
        icon={<ProfileOutlineIcon size={MODE_ICON_SIZE} color={iconColor ?? Colors.textPrimary} strokeWidth={MODE_ICON_STROKE} />}
        label="Single Player"
        subtitle="Play solo on this device"
        badgeText={localBadge?.text}
        badgeMuted={localBadge?.muted}
        onPress={() => onSelect('single')}
        loading={loadingType === 'single'}
        disabled={anyLoading}
      />
      <HostTypeOptionRow
        accentColor={accentColor}
        arrowColor={arrowColor}
        pressedBorderColor={pressedBorderColor}
        icon={<GroupOutlineIcon size={MODE_ICON_SIZE} color={iconColor ?? Colors.textPrimary} strokeWidth={MODE_ICON_STROKE} />}
        label="Multiplayer"
        subtitle="Play together here & now"
        // Legacy: guest host kan inte hosta Individual device (Peter 2026-11-04).
        // Multiplayer v2: båda lägena listas alltid — lobbyn visar vad som är
        // låst för just den hosten (Peter 2026-11-07).
        detail={multiplayerDetail(guestHost)}
        badgeText={localBadge?.text}
        badgeMuted={localBadge?.muted}
        onPress={() => onSelect('multiplayer')}
        loading={loadingType === 'multiplayer'}
        disabled={anyLoading}
      />
      {remoteMode !== 'hidden' && (
        <HostTypeOptionRow
          accentColor={accentColor}
          arrowColor={arrowColor}
          pressedBorderColor={pressedBorderColor}
          icon={<VersusIcon height={50} color={iconColor} accentColor={iconAccentColor} />}
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
          loading={loadingType === '1v1'}
          disabled={anyLoading}
        />
      )}
    </View>
  );
}

function HostTypeOptionRow({
  accentColor, icon, label, subtitle, detail, onPress, locked = false, badgeText, badgeMuted = false,
  arrowColor, pressedBorderColor, loading = false, disabled = false,
}: {
  accentColor: string;
  arrowColor?: string;
  pressedBorderColor?: string;
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  /** Optional smaller secondary line under the subtitle. */
  detail?: string;
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
  loading?: boolean;
  disabled?: boolean;
}) {
  // Gold border while pressed = "selected" (only when pressedBorderColor is set).
  const [pressed, setPressed] = useState(false);
  const restBorder = locked ? Colors.borderStrong : accentColor;
  return (
    <TouchableOpacity
      style={[
        hostTypeStyles.row,
        {
          borderColor:
            (pressed || loading) && pressedBorderColor && !locked ? pressedBorderColor : restBorder,
        },
        locked && hostTypeStyles.rowLocked,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityState={{ disabled, busy: loading }}
      onPressIn={pressedBorderColor ? () => setPressed(true) : undefined}
      onPressOut={pressedBorderColor ? () => setPressed(false) : undefined}
      activeOpacity={0.7}
    >
      {/* Dimningen ligger på INNEHÅLLET, inte på raden — badgen ska förbli
          helt läsbar. */}
      <View style={[hostTypeStyles.iconWrap, locked && hostTypeStyles.lockedDim]}>{icon}</View>
      <View style={[{ flex: 1 }, locked && hostTypeStyles.lockedDim]}>
        <Text style={hostTypeStyles.label}>{label}</Text>
        <Text style={hostTypeStyles.subtitle}>{subtitle}</Text>
        {!!detail && <Text style={hostTypeStyles.detail}>{detail}</Text>}
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={pressedBorderColor ?? arrowColor ?? accentColor} />
      ) : (
        <Text
          style={[
            hostTypeStyles.arrow,
            { color: locked ? Colors.borderStrong : (arrowColor ?? accentColor) },
            locked && hostTypeStyles.lockedDim,
          ]}
        >
          ›
        </Text>
      )}
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
  heading: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  detail: {
    fontSize: 12,
    color: Colors.textSecondary, // var textDisabled — för svag (2026-10-16)
    marginTop: 2,
    lineHeight: 16,
  },
});

function multiplayerDetail(guestHost: boolean | undefined): string {
  const gates = getCachedFeatureGates();
  const { oneByOne, allAtOnce } = modeLabels(gates.multiplayerV2);
  if (gates.multiplayerV2) return `${oneByOne} or ${allAtOnce}`;
  return guestHost ? oneByOne : `${oneByOne} or individual devices`;
}

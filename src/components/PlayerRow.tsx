import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { PeerHealth } from '../lib/realtime/lobbyHealthChannel';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import type { AssistanceLevel } from '../utils/hcp';
import { ApproveToggle } from './ApproveToggle';
import { Avatar } from './Avatar';
import { WifiFanIcon } from './WifiFanIcon';

export interface Player {
  id: string;
  name: string;
  emoji?: string;
  avatarUri?: string;
  isReady: boolean;
}

interface PlayerRowProps {
  player: Player;
  index: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  hcpComplete?: boolean;
  age?: number;
  assistance?: AssistanceLevel;
  isHostPlayer?: boolean;
  // När spelaren är gäst: visa "Guest HCP"-badge istället för räknad HCP.
  // Hur Guest HCP faktiskt räknas är inte definierat ännu.
  isGuest?: boolean;
  // Turn number 1..N. When set, a numbered badge is shown to indicate
  // play order in Pass-the-Phone mode. #1 = goes first.
  turnNumber?: number;
  // Bidirektionell Approve-toggle inuti kortet. Bara host ser den.
  showApproveToggle?: boolean;
  approved?: boolean;
  onApproveChange?: (next: boolean) => void;
  // True om spelaren har lämnat lobby:n. Då renderas kortet i muted/grå
  // styling och status-raden ersätts med "LEFT THIS GAME LOBBY". Override:ar
  // approved/waiting-borderfärger (kortet får neutral grå border istället)
  // och approve-toggeln döljs eftersom det inte längre är meningsfullt
  // att godkänna en spelare som har gått.
  hasLeft?: boolean;
  // Papperskorgs-knapp (host-only). När definierad renderas en röd-tonad
  // trash-ikon till höger om ApproveToggle. Används bara för spelare i
  // "To be Approved by Host"-listan — för approved-spelare måste host
  // först toggla tillbaka till No så raden hamnar i waiting-listan igen.
  onDelete?: () => void;
  // Tap-handler för player-edit (Assistance + Year of Birth + HCP).
  // När definierad blir meta-raden ("Standard · Age 32") tryckbar för
  // host och öppnar edit-modalen i parent.
  onEditPlayer?: () => void;
  // D-vii: connection-health-tier från lobby-peer-tracker. Renderas som
  // liten färgad dot (green/yellow/red) i bottom-right på avataren.
  // Endast Individual Devices-läget — Pass-the-Phone delar device.
  // Utelämnad → ingen dot renderas (= Pass-the-Phone eller hasLeft).
  // 'self' = visa hardcoded grön dot (vi rendererar = vi är alive).
  peerHealth?: PeerHealth | 'self';
}

export function PlayerRow({
  player,
  index,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  hcpComplete,
  age,
  assistance,
  isHostPlayer,
  isGuest,
  turnNumber,
  showApproveToggle,
  approved,
  onApproveChange,
  hasLeft,
  onDelete,
  onEditPlayer,
  peerHealth,
}: PlayerRowProps) {
  return (
    <View style={styles.cardWrapper}>
      <View
        style={[
          styles.card,
          // Approved/waiting border-färg — gäller alla utom host (host
          // har sin egen guld-border via cardHost nedan).
          !isHostPlayer && !hasLeft && approved === true && styles.cardApproved,
          !isHostPlayer && !hasLeft && approved === false && styles.cardWaiting,
          isHostPlayer && !hasLeft && styles.cardHost,
          // hasLeft override:ar alla border-färger till neutral grå för att
          // visuellt nedprioritera kortet och signalera "ej längre aktiv".
          hasLeft && styles.cardLeft,
        ]}
      >

      {/* ── Övre rad ───────────────────────────────────────── */}
      <View style={styles.row}>
        {turnNumber !== undefined && (
          <View style={styles.turnColumn}>
            <View style={[styles.turnBadge, turnNumber === 1 && !hasLeft && styles.turnBadgeFirst, hasLeft && styles.turnBadgeLeft]}>
              <Text style={[styles.turnBadgeText, turnNumber === 1 && !hasLeft && styles.turnBadgeTextFirst, hasLeft && styles.textLeft]}>
                {turnNumber}
              </Text>
            </View>
            {(onMoveUp || onMoveDown) && !hasLeft && (
              <View style={styles.turnArrows}>
                <Pressable
                  onPress={onMoveUp}
                  disabled={!canMoveUp}
                  hitSlop={4}
                  style={[styles.turnArrowBtn, !canMoveUp && styles.turnArrowBtnDisabled]}
                >
                  <Text style={styles.turnArrowText}>↑</Text>
                </Pressable>
                <Pressable
                  onPress={onMoveDown}
                  disabled={!canMoveDown}
                  hitSlop={4}
                  style={[styles.turnArrowBtn, !canMoveDown && styles.turnArrowBtnDisabled]}
                >
                  <Text style={styles.turnArrowText}>↓</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
        <View style={[styles.avatarWrap, hasLeft && styles.avatarLeft]}>
          <Avatar
            uri={player.avatarUri}
            emoji={player.emoji}
            name={player.name}
            size={40}
            useBrandFallback={!isGuest}
          />
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, hasLeft && styles.textLeft]} numberOfLines={1}>{player.name}</Text>
          </View>
          {/* Wifi-ikon direkt under playername — connection-health-indikator
              för Individual Devices. Färg: grön (ok/self), gul (slow), röd
              (unstable). hasLeft-spelare slipper indikator (de signaleras
              som "borta" via grå styling). */}
          {peerHealth !== undefined && !hasLeft && (
            <View style={styles.healthIconRow}>
              <WifiFanIcon
                size={16}
                color={
                  peerHealth === 'ok' || peerHealth === 'self'
                    ? Colors.success
                    : peerHealth === 'slow'
                      ? Colors.warning
                      : Colors.error
                }
              />
            </View>
          )}
          {hasLeft ? (
            // Replace status-row med "LEFT THIS GAME LOBBY"-text. Ingen dot
            // (dot:en signalerar Ready/Missing-state som inte längre är
            // relevant). Texten är samma muted-grå som övrig text i kortet.
            <View style={styles.statusRow}>
              <Text style={[styles.statusText, styles.textLeft, styles.leftLabel]} numberOfLines={1}>
                LEFT THIS GAME LOBBY
              </Text>
            </View>
          ) : !player.isReady ? (
            // "Ready"-status (med grön dot) renderas inte längre — det
            // visuella standardläget för en spelare i lobby:n är att de
            // är redo, så raden tillför inget. "Missing info" syns dock
            // fortfarande som en warning eftersom den signalerar något
            // som behöver åtgärdas.
            <View style={styles.statusRow}>
              <View style={[styles.dot, styles.dotPending]} />
              <Text style={[styles.statusText, styles.pending]}>
                Missing info
              </Text>
            </View>
          ) : null}
        </View>

        {/* Approve-toggle i övre högra hörnet av kortet. alignSelf:
            'flex-start' pinnar wrappern mot kortets översta kant så
            toggleln linjerar visuellt med "Approve All"-toggleln ovanför
            listan (samma right-padding via row.paddingHorizontal). */}
        {showApproveToggle && !hasLeft && (
          <View style={styles.toggleSlot}>
            <ApproveToggle
              value={approved ? 'yes' : 'no'}
              onChange={(next) => onApproveChange?.(next === 'yes')}
              // D-vii: blockera approve när spelaren har röd connection-
              // status. Host måste vänta på stabilare uppkoppling — auto-
              // un-approve-effekten i LobbyScreen håller dem i waiting
              // tills health återgår till ok/slow.
              disabled={peerHealth === 'unstable'}
            />
          </View>
        )}
      </View>

      {/* ── Meta-rad: Assistance · Age + ev. trash ─────────────── */}
      {/* Döljs helt för left-spelare — kortet ska kännas minimalistiskt
          och signalera "borta", inte presentera spel-data. HCP-värdet
          används fortsatt internt (scoring + edit-modal) men har ingen
          synlig representation på spelarkortet. */}
      {!hasLeft && hcpComplete && age && assistance && (
        <View style={styles.hcpRow}>
          {/* Vänster slot: meta-text "Assistance · Age". Tryckbar för
              host så raden öppnar player-edit-modalen i parent. */}
          <View style={styles.hcpRowLeft}>
            {onEditPlayer ? (
              <Pressable
                onPress={onEditPlayer}
                hitSlop={6}
                style={({ pressed }) => [pressed && styles.hcpMetaPressed]}
                accessibilityRole="button"
                accessibilityLabel="Edit player settings"
              >
                <Text style={styles.hcpMeta}>
                  {assistance.charAt(0).toUpperCase() + assistance.slice(1)} · Age {age}
                </Text>
              </Pressable>
            ) : (
              <Text style={styles.hcpMeta}>
                {assistance.charAt(0).toUpperCase() + assistance.slice(1)} · Age {age}
              </Text>
            )}
          </View>

          {/* Höger slot: papperskorgs-knapp i kortets nedre högra hörn.
              Host-only, grå-färgad. Visas bara på rader med onDelete
              (waiting-listan idag) och inte på host:s eget kort. */}
          <View style={styles.hcpRowRight}>
            {!isHostPlayer && onDelete && (
              <Pressable
                onPress={onDelete}
                hitSlop={6}
                style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
                accessibilityRole="button"
                accessibilityLabel="Delete player from lobby"
              >
                <Svg width={20} height={20} viewBox="0 0 24 24">
                  {/* Lock-stång */}
                  <Path d="M3 6h18" stroke={Colors.textSecondary} strokeWidth={2} strokeLinecap="round" />
                  {/* Handtag */}
                  <Path
                    d="M9 6V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V6"
                    stroke={Colors.textSecondary}
                    strokeWidth={2}
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Korpkropp */}
                  <Path
                    d="M5.5 6l1 13.5A2 2 0 0 0 8.5 21h7a2 2 0 0 0 2-1.5L18.5 6"
                    stroke={Colors.textSecondary}
                    strokeWidth={2}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Lodräta streck inuti korgen */}
                  <Path d="M10 10v7" stroke={Colors.textSecondary} strokeWidth={2} strokeLinecap="round" />
                  <Path d="M14 10v7" stroke={Colors.textSecondary} strokeWidth={2} strokeLinecap="round" />
                </Svg>
              </Pressable>
            )}
          </View>
        </View>
      )}

      </View>

      {/* ── HOST-tag som skär kantlinjen ──────────────────────── */}
      {isHostPlayer && (
        <View style={styles.hostBorderTag} pointerEvents="none">
          <Text style={styles.hostBorderTagText}>HOST</Text>
        </View>
      )}

      {/* ── GUEST-tag som skär kantlinjen (mutually exclusive med HOST) ── */}
      {!isHostPlayer && isGuest && (
        <View style={styles.guestBorderTag} pointerEvents="none">
          <Text style={styles.guestBorderTagText}>GUEST</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Wrapper-vy så att HOST-rutan kan position:absolute överlappa kortets
  // kantlinje utan att klippas av kortets overflow:hidden.
  cardWrapper: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  card: {
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardHost: {
    borderColor: '#F5A623',
  },
  cardApproved: {
    borderColor: Colors.success,
  },
  cardWaiting: {
    borderColor: Colors.error,
  },
  // hasLeft-stil: neutral grå border + dämpad bakgrund. Override:ar
  // approved/waiting/host-borderfärger så kortet visuellt nedprioriteras
  // jämfört med aktiva spelarkort.
  cardLeft: {
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.cardElevated,
    opacity: 0.7,
  },
  // Text-färg som appliceras på alla text-element (namn, status,
  // turn-badge-siffran) när hasLeft är true. Använder textDisabled så
  // texten upplevs som "ljust grå" enligt user-request.
  textLeft: {
    color: Colors.textDisabled,
  },
  // Specialstilar för "LEFT THIS GAME LOBBY"-labeln: lite mer letterspacing
  // + bold för att den ska läsas som ett distinkt status, inte vanlig text.
  leftLabel: {
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
  },
  // Turn-badge när spelaren har left: bakgrunden blir muted (override:ar
  // both turnBadge-default och turnBadgeFirst om aktiv).
  turnBadgeLeft: {
    backgroundColor: Colors.cardElevated,
    borderColor: Colors.borderStrong,
  },
  // Avatar-wrapper bär `position: 'relative'` så D-vii health-dot kan
  // absolute-positioneras i bottom-right utan att påverka övrig
  // avatar-layout.
  avatarWrap: {
    position: 'relative',
  },
  // Avatar-wrapper när spelaren har left: dimmas via opacity så själva
  // emoji/foto kvarstår men signalerar nedprioritet.
  avatarLeft: {
    opacity: 0.5,
  },
  // D-vii: 12×12 dot i avataren:s bottom-right-hörn. White border ger
  // separation mot avatar-bg så dot:en syns även vid mörk/färgglad
  // avatar. Färgen sätts via en av tre additivt-tillämpade styles
  // (healthDotOk/Slow/Unstable) baserat på peerHealth-prop:n.
  healthDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.card,
  },
  healthDotOk: {
    backgroundColor: Colors.success,
  },
  healthDotSlow: {
    backgroundColor: Colors.warning,
  },
  healthDotUnstable: {
    backgroundColor: Colors.error,
  },
  // HOST-tagg som sitter på kortets övre kantlinje
  hostBorderTag: {
    position: 'absolute',
    top: -8,
    left: Spacing.lg,
    backgroundColor: '#F5A623',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 10,
    elevation: 4,
  },
  hostBorderTagText: {
    fontSize: 9,
    fontWeight: FontWeight.semibold,
    color: '#000',
    letterSpacing: 0.5,
  },

  // GUEST-tagg — samma kantlinje-skärningsteknik men neutral mörk färg
  // för att skilja sig tydligt från HOST (gold).
  guestBorderTag: {
    position: 'absolute',
    top: -8,
    left: Spacing.lg,
    backgroundColor: Colors.cardElevated,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 10,
    elevation: 4,
  },
  guestBorderTagText: {
    fontSize: 9,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },

  // Wrapper kring approve-toggle. alignSelf: 'flex-start' pinnar toggleln
  // mot kortets översta kant så den hamnar i övre högra hörnet och
  // linjerar med "Approve All"-toggleln ovanför listan (samma right-
  // padding via row.paddingHorizontal).
  toggleSlot: {
    alignSelf: 'flex-start',
  },

  // Turn-order column (only shown in Pass-the-Phone mode):
  // numbered badge on top, ↑↓ reorder arrows directly underneath.
  turnColumn: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  turnBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  turnBadgeFirst: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  turnBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  turnBadgeTextFirst: {
    color: '#FFF',
  },
  turnArrows: {
    flexDirection: 'row',
    gap: 4,
  },
  turnArrowBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  turnArrowBtnDisabled: {
    opacity: 0.3,
  },
  turnArrowText: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    lineHeight: 14,
  },

  info: { flex: 1, minWidth: 0 },
  // Wifi-ikon-rad direkt under playername. marginTop bara tillräckligt
  // för subtil separation från namnet utan att skapa stor luftig gap.
  healthIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 3,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },

  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotReady: { backgroundColor: Colors.success },
  dotPending: { backgroundColor: Colors.warning },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  ready: { color: Colors.success },
  pending: { color: Colors.warning },

  // Meta-rad: två slottar — text vänster, trash höger.
  hcpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  hcpRowLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  hcpRowRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  hcpMeta: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  // Diskret opacity-dim på meta-raden när host tappar för att öppna
  // edit-modalen — signalerar tryckbar utan att skrika.
  hcpMetaPressed: {
    opacity: 0.6,
  },

  // Papperskorgs-knapp i kort-headern. Lättviktig hit-zon (tap-target ≥30px
  // via padding+hitSlop) men visuellt minimal — bara ikonen är synlig.
  deleteBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
  },
  deleteBtnPressed: {
    backgroundColor: Colors.borderStrong,
  },
});
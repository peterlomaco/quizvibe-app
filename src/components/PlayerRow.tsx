import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { PeerHealth } from '../lib/realtime/lobbyHealthChannel';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import type { AssistanceLevel } from '../utils/hcp';
import { ApproveToggle } from './ApproveToggle';
import { Avatar } from './Avatar';
import { SpotifyBrandIcon } from './SpotifyBrandIcon';
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
  // Spotify-koppling för spelaren — true = kopplat konto (grön), false/undefined = ej kopplat (grå).
  spotifyConnected?: boolean;
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
  spotifyConnected,
}: PlayerRowProps) {
  // "Details +/-"-toggle per spelarkort — gömmer Assistance + Age-pillarna
  // tills man fäller ut. Default hopfällt (Details +).
  // Default-läge för "Details": utfällt för non-host som väntar på godkännande
  // (host ska se assist level + age innan approve), hopfällt för host:ens eget
  // kort och för redan godkända spelare. När en väntande spelare godkänns löpande
  // fäller den ihop sig automatiskt (effekten nedan reagerar på approved-byte).
  // Manuell toggle gäller tills nästa approved-byte.
  const isWaitingNonHost = !isHostPlayer && !hasLeft && !approved;
  const [detailsExpanded, setDetailsExpanded] = useState(isWaitingNonHost);
  useEffect(() => {
    setDetailsExpanded(isWaitingNonHost);
  }, [isWaitingNonHost]);
  const hasDetails = !hasLeft && hcpComplete && !!age && !!assistance;
  // Höger-slotens kontroller (approve-toggle / papperskorg) som måste synas
  // även i hopfällt läge — styr om meta-raden ska renderas trots att pillarna
  // är gömda. Saknas de helt (t.ex. host:ens eget kort) skippas meta-raden i
  // hopfällt läge så "Details +" sitter tätt mot kortets nederkant.
  // Meta-radens höger-slot innehåller bara papperskorg (waiting). Approve-
  // toggeln är absolut-positionerad i övre raden. Styr om meta-raden ska
  // renderas i hopfällt läge trots gömda pillar.
  const hasRightSlot = !isHostPlayer && !!onDelete;
  // När ett turn-nummer (turnColumn) renderas är avataren indragen förbi
  // turnColumn:en. Meta-radens pillar ligger annars kvar vid kort-kanten →
  // indrag dem lika mycket så de vänsterställs i linje med avataren.
  // turnColumn-bredd = pil-rad (48) om pilarna visas, annars bara badge (26).
  const showTurnArrows = (!!onMoveUp || !!onMoveDown) && !hasLeft;
  const metaIndent =
    turnNumber !== undefined ? (showTurnArrows ? 48 : 26) + Spacing.md : 0;
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
          {peerHealth !== undefined && !hasLeft && (() => {
            const healthColor =
              peerHealth === 'ok' || peerHealth === 'self'
                ? Colors.success
                : peerHealth === 'slow'
                  ? Colors.warning
                  : Colors.error;
            return (
              <View style={styles.healthIconRow}>
                <WifiFanIcon size={16} color={healthColor} />
                <Text style={[styles.healthLabel, { color: healthColor }]}>Internet</Text>
              </View>
            );
          })()}
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
          {/* "Details +/-"-toggle — fäller ut/in Assistance + Age-pillarna nedan. */}
          {hasDetails && (
            <Pressable
              onPress={() => setDetailsExpanded((v) => !v)}
              hitSlop={6}
              style={({ pressed }) => [styles.detailsToggle, pressed && styles.hcpMetaPressed]}
              accessibilityRole="button"
              accessibilityLabel={detailsExpanded ? 'Hide player details' : 'Show player details'}
            >
              <Text style={styles.detailsToggleText}>
                {detailsExpanded ? 'Details −' : 'Details +'}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Approve-toggle i övre högra hörnet av kortet — visas BARA
            för waiting-cards (approved=false). För approved non-host
            flyttas toggleln till hcpRowRight i meta-raden så övre raden
            kan ge mer horisontellt utrymme åt PlayerName-texten (man
            ser mer av långa namn innan ellipsering). alignSelf:
            'flex-start' pinnar wrappern mot kortets översta kant. */}
        {showApproveToggle && !hasLeft && !approved && (
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
        {/* Approved non-host: approve-toggeln absolut-positionerad i nedre
            högra hörnet av övre raden (≈ "Details +"-nivån). Out-of-flow →
            PlayerName-raden får full bredd och ellipseras inte, och meta-raden
            behöver inte renderas bara för toggeln (mindre kort-höjd hopfällt). */}
        {showApproveToggle && !hasLeft && !isHostPlayer && approved && (
          <View style={styles.approveSlotApproved}>
            <ApproveToggle
              value={approved ? 'yes' : 'no'}
              onChange={(next) => onApproveChange?.(next === 'yes')}
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
      {hasDetails && (detailsExpanded || hasRightSlot) && (
        <View style={styles.hcpRow}>
          {/* Vänster slot: två blå-bordered pillar för Assistance Level
              och Age — signalerar att de är valbara för editering (host
              tappar någonstans i pill-raden → öppnar player-edit-modal i
              parent). När onEditPlayer saknas (non-host-vy) renderas
              pillarna utan Pressable så de bara visar info. */}
          <View style={[styles.hcpRowLeft, metaIndent > 0 && { marginLeft: metaIndent }]}>
            {detailsExpanded && (onEditPlayer ? (
              <Pressable
                onPress={onEditPlayer}
                hitSlop={6}
                style={({ pressed }) => [pressed && styles.hcpMetaPressed]}
                accessibilityRole="button"
                accessibilityLabel="Edit player settings"
              >
                <View style={styles.hcpPillRow}>
                  <View style={styles.hcpPill}>
                    <Text style={styles.hcpPillText}>
                      {assistance.charAt(0).toUpperCase() + assistance.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.hcpPill}>
                    <Text style={styles.hcpPillText}>Age {age}</Text>
                  </View>
                </View>
              </Pressable>
            ) : (
              <View style={styles.hcpPillRow}>
                <View style={styles.hcpPill}>
                  <Text style={styles.hcpPillText}>
                    {assistance.charAt(0).toUpperCase() + assistance.slice(1)}
                  </Text>
                </View>
                <View style={styles.hcpPill}>
                  <Text style={styles.hcpPillText}>Age {age}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Höger slot: papperskorgs-knapp (waiting-cards). Approve-toggeln
              för approved non-host ligger absolut-positionerad i övre raden. */}
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

      {/* ── QuizVibe user-tag — registrerade non-host (ej guest, ej host).
          Samma blå-tema som "+ Add Guest"-knappen (primaryMuted + primaryBorder). ── */}
      {!isHostPlayer && !isGuest && (
        <View style={styles.quizUserBorderTag} pointerEvents="none">
          <Text style={[styles.quizUserBorderTagText, { color: '#FFFFFF' }]}>QuizVibe user</Text>
        </View>
      )}

      {/* ── Spotify-attest-badge — uppe till höger på kortets kantlinje.
          Plan B (2026-07-22): visar spelarens self-attest ("jag har Spotify-
          appen"), inte en OAuth-koppling. ── */}
      <View style={[styles.spotifyBorderTag, { borderColor: spotifyConnected ? '#1DB954' : Colors.borderStrong }]} pointerEvents="none">
        <SpotifyBrandIcon size={10} variant="white" />
        {spotifyConnected ? (
          <Text style={styles.spotifyBorderTagConnected}>Spotify ready</Text>
        ) : (
          <Text style={styles.spotifyBorderTagNone}>No Spotify</Text>
        )}
      </View>
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

  // QuizVibe user-tagg — registrerade non-host. Blå-tema identiskt med
  // "+ Add Guest"-knappen (primaryMuted bg + primaryBorder + primary text).
  quizUserBorderTag: {
    position: 'absolute',
    top: -8,
    left: Spacing.lg,
    // Opak blå fyllning + opak blå kant (ersätter translucenta primaryMuted/
    // primaryBorder) så kortets kantlinje inte skiner igenom badgen.
    backgroundColor: '#16294A',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
    // paddingRight något större än vänster: RN klipper annars sista glyfen när
    // letterSpacing reserverar trailing-space efter sista tecknet (sista "R").
    paddingLeft: 8,
    paddingRight: 11,
    paddingVertical: 2,
    zIndex: 10,
    elevation: 4,
  },
  quizUserBorderTagText: {
    fontSize: 9,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
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
    // Bottom-aligned så approve-toggeln hamnar på samma nivå som
    // "Details +"-texten (info-kolumnens nedersta rad) istället för uppe
    // vid PlayerName. 2026-06-01.
    alignSelf: 'flex-end',
  },
  // Approved non-host: approve-toggeln absolut-positionerad i nedre högra
  // hörnet av övre raden (≈ Details-nivån) — out-of-flow så PlayerName får
  // full bredd. right/bottom matchar radens paddingHorizontal/paddingVertical.
  approveSlotApproved: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.md,
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
    gap: 4,
  },
  healthLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    marginTop: -5,
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
  // Pill-rad för Assistance Level + Age — två blå-bordered "chips" som
  // signalerar att fälten är valbara för editering. Sittande på samma
  // rad i hcpRowLeft. Tap-zon delas av båda pillarna via parent
  // Pressable (onEditPlayer) — användaren öppnar edit-modalen oavsett
  // vilken pill som tappas.
  hcpPillRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  hcpPill: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  hcpPillText: {
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  // Diskret opacity-dim på meta-raden när host tappar för att öppna
  // edit-modalen — signalerar tryckbar utan att skrika.
  hcpMetaPressed: {
    opacity: 0.6,
  },
  // "Details +/-"-toggle under PlayerName — diskret muted-grå text i appens
  // befintliga färgtema (samma som meta-pillarnas text).
  detailsToggle: {
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  detailsToggleText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
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
  spotifyBorderTag: {
    position: 'absolute',
    top: -8,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.cardElevated,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    paddingLeft: 6,
    paddingRight: 8,
    paddingVertical: 2,
    zIndex: 10,
    elevation: 4,
  },
  spotifyBorderTagConnected: {
    fontSize: 9,
    fontWeight: FontWeight.semibold,
    color: '#1DB954',
  },
  spotifyBorderTagNone: {
    fontSize: 9,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
});
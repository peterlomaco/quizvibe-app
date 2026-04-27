import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import { calculateInitialHCP, getHCPColor, SkillLevel } from '../utils/hcp';
import { ApproveToggle } from './ApproveToggle';
import { Avatar } from './Avatar';

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
  isMoving?: boolean;
  onMovePress?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  hcpComplete?: boolean;
  age?: number;
  skill?: SkillLevel;
  onHcpPress?: () => void;
  isHost?: boolean;
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
}

export function PlayerRow({
  player,
  index,
  isMoving,
  onMovePress,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  hcpComplete,
  age,
  skill,
  onHcpPress,
  isHost,
  isHostPlayer,
  isGuest,
  turnNumber,
  showApproveToggle,
  approved,
  onApproveChange,
}: PlayerRowProps) {
  const hcp = hcpComplete && age && skill
    ? calculateInitialHCP(age, skill)
    : null;

  const hcpColor = hcpComplete && skill ? getHCPColor(skill) : Colors.textSecondary;

  return (
    <View style={styles.cardWrapper}>
      <View
        style={[
          styles.card,
          isMoving && styles.cardMoving,
          // Approved/waiting border-färg — gäller alla utom host (host
          // har sin egen guld-border via cardHost nedan).
          !isHostPlayer && approved === true && styles.cardApproved,
          !isHostPlayer && approved === false && styles.cardWaiting,
          isHostPlayer && styles.cardHost,
        ]}
      >

      {/* ── Övre rad ───────────────────────────────────────── */}
      <View style={styles.row}>
        {turnNumber !== undefined && (
          <View style={styles.turnColumn}>
            <View style={[styles.turnBadge, turnNumber === 1 && styles.turnBadgeFirst]}>
              <Text style={[styles.turnBadgeText, turnNumber === 1 && styles.turnBadgeTextFirst]}>
                {turnNumber}
              </Text>
            </View>
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
          </View>
        )}
        <Avatar
          uri={player.avatarUri}
          emoji={player.emoji}
          name={player.name}
          size={40}
        />

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{player.name}</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.dot, player.isReady ? styles.dotReady : styles.dotPending]} />
            <Text style={[styles.statusText, player.isReady ? styles.ready : styles.pending]}>
              {player.isReady ? 'Ready' : 'Missing info'}
            </Text>
          </View>
        </View>

        {/* Approve-toggle inne i kortets header — bara host ser den.
            Bidirektionell: drag Yes godkänner, drag No återkallar. */}
        {showApproveToggle && (
          <ApproveToggle
            value={approved ? 'yes' : 'no'}
            onChange={(next) => onApproveChange?.(next === 'yes')}
          />
        )}
      </View>

      {/* ── HCP-rad (färdig) ───────────────────────────────── */}
      {hcpComplete && age && skill && (isGuest || hcp !== null) && (
        <View style={styles.hcpRow}>
          <Text style={styles.hcpMeta}>
            {skill.charAt(0).toUpperCase() + skill.slice(1)} · Age {age}
          </Text>
          {isGuest ? (
            <View style={[styles.hcpBadge, styles.hcpBadgeGuest]}>
              <Text style={[styles.hcpBadgeText, styles.hcpBadgeTextGuest]}>
                Guest HCP
              </Text>
            </View>
          ) : (
            <View style={[
              styles.hcpBadge,
              { borderColor: hcpColor + '60', backgroundColor: hcpColor + '25' }
            ]}>
              <Text style={[styles.hcpBadgeText, { color: hcpColor }]}>
                HCP {hcp}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* ── HCP Required ───────────────────────────────────── */}
      {isHost && !hcpComplete && (
        <Pressable style={styles.hcpRequired} onPress={onHcpPress}>
          <Text style={styles.hcpRequiredIcon}>⚠️</Text>
          <Text style={styles.hcpRequiredText}>HCP Required – tap to set</Text>
          <Text style={styles.hcpRequiredArrow}>›</Text>
        </Pressable>
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
  cardMoving: {
    borderColor: Colors.primaryBorder,
    backgroundColor: Colors.primaryMuted,
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

  hcpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  hcpMeta: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  hcpBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
  },
  hcpBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  // Guest HCP-badge: dämpad neutral look — räkneregler för guest definieras senare.
  hcpBadgeGuest: {
    borderColor: Colors.borderStrong,
    backgroundColor: Colors.cardElevated,
  },
  hcpBadgeTextGuest: {
    color: Colors.textSecondary,
  },

  hcpRequired: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.warningMuted,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.warningBorder,
  },
  hcpRequiredIcon: { fontSize: 12 },
  hcpRequiredText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.warning,
    fontWeight: FontWeight.medium,
  },
  hcpRequiredArrow: {
    fontSize: 16,
    color: Colors.warning,
  },

});
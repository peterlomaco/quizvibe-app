import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/src/components/haptic';
import Svg, { Path } from 'react-native-svg';
import { BrandUi, Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
import { getAvatarEmojiById } from '../utils/avatars';
import type { Friend } from '../utils/friendsStorage';

/**
 * QuizVibe-friend-filter som delas av Marathon-listan (SavedAggregatesCard) och
 * per-spel-historiken (PlayerHistorySection). Samma mönster som Lobbyns Share
 * invite: en "Filter by players"-knapp + chip för det applicerade urvalet, och
 * en bottom-sheet med kryssrutor per friend + "Add". Multi-select → parent
 * AND-filtrerar sin lista på de valda spelarnas namn.
 *
 * Kontrollerad: parent äger `appliedFriendIds` och får nya set via `onApply`.
 * Picker-sheetens PENDING kryssrutor + open-state är interna.
 */
export function PlayerFilterPicker({
  friends,
  appliedFriendIds,
  onApply,
}: {
  friends: Friend[];
  appliedFriendIds: Set<string>;
  onApply: (ids: Set<string>) => void;
}) {
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [pickerOpen, setPickerOpen] = useState(false);

  const selectedFriends = friends.filter((f) => appliedFriendIds.has(f.id));

  return (
    <>
      {/* Player history v2 (2026-10-19): kompakt sekundär pill. Guld bara
          när ett filter faktiskt är aktivt ("Players · 2" + ×). */}
      <View style={styles.filterRow}>
        <Pressable
          onPress={() => {
            setPendingIds(new Set(appliedFriendIds));
            setPickerOpen(true);
          }}
          style={({ pressed }) => [
            styles.filterBtn,
            selectedFriends.length > 0 && styles.filterBtnActive,
            pressed && { opacity: 0.85 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            selectedFriends.length > 0
              ? `Filtered by ${selectedFriends.length} players. Change filter`
              : 'Filter by players'
          }
        >
          <FilterIcon
            color={selectedFriends.length > 0 ? Colors.warning : BrandUi.iconMuted}
          />
          <Text style={styles.filterBtnText} numberOfLines={1}>
            {selectedFriends.length > 0
              ? `Players · ${selectedFriends.length}`
              : 'Filter by players'}
          </Text>
          {selectedFriends.length > 0 && (
            <Pressable
              hitSlop={10}
              onPress={() => onApply(new Set())}
              accessibilityLabel="Clear player filter"
            >
              <Text style={styles.filterClear}>×</Text>
            </Pressable>
          )}
        </Pressable>
      </View>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}
      >
        <View style={styles.sheetOverlay}>
          <Pressable
            style={styles.sheetBackdrop}
            onPress={() => setPickerOpen(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Filter by player</Text>
            <Text style={styles.sheetSubtitle}>
              Show only games a QuizVibe friend took part in.
            </Text>
            {friends.length === 0 ? (
              <View style={styles.sheetEmpty}>
                <Text style={styles.sheetEmptyText}>No friends saved yet</Text>
                <Text style={styles.sheetEmptySub}>
                  Add friends via Share invite in a lobby to filter by them here.
                </Text>
              </View>
            ) : (
              <>
                {/* Header-rad: "All players" untick:ar alla; "Add" applicerar de
                    ikryssade och stänger. Filtret = rader där ALLA ikryssade
                    spelare deltog. */}
                <View style={styles.sheetHeaderRow}>
                  <Pressable hitSlop={8} onPress={() => setPendingIds(new Set())}>
                    <Text style={styles.friendAllText}>All players</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      onApply(new Set(pendingIds));
                      setPickerOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.addBtn,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Text style={styles.addBtnText}>Add</Text>
                  </Pressable>
                </View>
                <ScrollView style={{ maxHeight: 320 }}>
                  {friends.map((f) => {
                    const checked = pendingIds.has(f.id);
                    return (
                      <View key={f.id} style={styles.friendRow}>
                        <View style={styles.friendNamePill}>
                          <Text style={styles.friendPillIcon}>
                            {getAvatarEmojiById(f.avatarId)}
                          </Text>
                          <Text style={styles.friendPillText} numberOfLines={1}>
                            {f.playerName}
                          </Text>
                        </View>
                        <Pressable
                          onPress={() =>
                            setPendingIds((prev) => {
                              const next = new Set(prev);
                              if (next.has(f.id)) next.delete(f.id);
                              else next.add(f.id);
                              return next;
                            })
                          }
                          hitSlop={8}
                          style={[styles.checkbox, checked && styles.checkboxChecked]}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked }}
                          accessibilityLabel={`Filter by ${f.playerName}`}
                        >
                          {checked && <Text style={styles.checkmark}>✓</Text>}
                        </Pressable>
                      </View>
                    );
                  })}
                </ScrollView>
              </>
            )}
            <Pressable
              style={({ pressed }) => [
                styles.closeBtn,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => setPickerOpen(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

function FilterIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24">
      <Path
        d="M4 5h16l-6.2 7.4V18l-3.6 1.8v-7.4L4 5z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: BrandUi.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm + 2,
    height: 28,
  },
  filterBtnActive: {
    backgroundColor: 'rgba(245,166,35,0.06)',
    borderColor: 'rgba(245,166,35,0.55)',
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: FontWeight.medium,
    color: 'rgba(255,255,255,0.85)',
  },
  filterClear: {
    fontSize: 18,
    lineHeight: 20,
    color: BrandUi.iconMuted,
    marginLeft: 2,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheetBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: Spacing.xs,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sheetSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  sheetEmpty: { paddingVertical: Spacing.lg, gap: Spacing.xs },
  sheetEmptyText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  sheetEmptySub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  friendNamePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: BrandUi.surface,
    borderWidth: 1,
    borderColor: BrandUi.border,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    flexShrink: 1,
  },
  friendPillIcon: { fontSize: 16 },
  friendPillText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  friendAllText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  addBtn: {
    backgroundColor: Colors.warning,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  addBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.background,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.warning,
    borderColor: Colors.warning,
  },
  checkmark: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.background,
  },
  closeBtn: {
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: BrandUi.border,
    backgroundColor: BrandUi.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
});

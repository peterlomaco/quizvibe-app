import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Pressable } from '@/src/components/haptic';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../theme';
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
      <View style={styles.filterRow}>
        <Pressable
          onPress={() => {
            setPendingIds(new Set(appliedFriendIds));
            setPickerOpen(true);
          }}
          style={({ pressed }) => [styles.filterBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.filterBtnText}>
            {selectedFriends.length > 0 ? 'Change players' : 'Filter by players'}
          </Text>
        </Pressable>
        {selectedFriends.length > 0 && (
          <View style={styles.filterChip}>
            <Text style={styles.filterChipIcon}>
              {selectedFriends.length === 1
                ? getAvatarEmojiById(selectedFriends[0].avatarId)
                : '👥'}
            </Text>
            <Text style={styles.filterChipText} numberOfLines={1}>
              {selectedFriends.length === 1
                ? selectedFriends[0].playerName
                : `${selectedFriends.length} players`}
            </Text>
            <Pressable hitSlop={8} onPress={() => onApply(new Set())}>
              <Text style={styles.filterChipClear}>×</Text>
            </Pressable>
          </View>
        )}
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

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  filterBtn: {
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  filterBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  filterChipIcon: { fontSize: 16 },
  filterChipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    maxWidth: 160,
  },
  filterChipClear: {
    fontSize: 18,
    lineHeight: 20,
    color: Colors.primary,
    paddingHorizontal: 2,
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
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    flexShrink: 1,
  },
  friendPillIcon: { fontSize: 16 },
  friendPillText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
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
    backgroundColor: Colors.primary,
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
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.background,
  },
  closeBtn: {
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
});

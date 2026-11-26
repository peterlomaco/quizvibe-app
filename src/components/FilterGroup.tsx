// Filter-gruppen (Peter 2026-11-26) — delas av Lobby och Profile (host
// defaults) så båda ser exakt likadana ut.
//
// Layout (Peter 2026-11-26, rev 2 — som tema-paketen): "Filter"-rubriken är
// en flik. Tapp öppnar en popup med båda switcharna. Under fliken visas BARA
// de filter som är PÅ (som lobbyns paketlista bara visar aktiverade paket).
//
// Regel för BÅDA switcharna: AV = exkluderat, PÅ = ingår i spelet.
//   • "Include mature content"           — UI-inverterad Parent Control
//     (parentControlEnabled = !matureIncluded). Info-ikonen förklarar det.
//   • "Include theme-specific questions" — tema-only-items (inBaseCatalog:
//     false) ingår även i Generic-spel.
// Mature content har företräde: utan mature content hålls tema-items från
// parent-restricted paket (Hip Hop & RnB) ute även med tema-switchen PÅ
// (se themeItemAllowed i hostPackages.ts).

import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { CappedText as Text } from './CappedText';
import { QuizVibeToggle } from './QuizVibeToggle';
import { QuizVibeAlertHost } from './QuizVibeAlertHost';
import { ChevronIcon } from './ChevronIcon';
import { BrandUi, Colors, FontSize, FontWeight, Radius, Spacing, Typography } from '../theme';
import { matureContentInfo, themeQuestionsInfo, type InfoText } from '../utils/infoTexts';

interface Props {
  matureIncluded: boolean;
  themeIncluded: boolean;
  onToggleMature?: () => void;
  onToggleTheme?: () => void;
  /** Öppnar info-dialogen (useInfoDialog().showInfo). */
  onInfo: (info: InfoText) => void;
  /** 'profile' = host-default-text, 'lobby' = det här spelet. */
  scope: 'lobby' | 'profile';
  /** Non-host: read-only (visar host:ens värden, fliken öppnar inget). */
  disabled?: boolean;
  /** Guest host: båda låsta AV; tapp på fliken visar onLockedPress. */
  locked?: boolean;
  onLockedPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function FilterGroup({
  matureIncluded,
  themeIncluded,
  onToggleMature,
  onToggleTheme,
  onInfo,
  scope,
  disabled = false,
  locked = false,
  onLockedPress,
  style,
}: Props) {
  const [popupOpen, setPopupOpen] = useState(false);
  const rows: {
    key: string;
    label: string;
    value: boolean;
    onToggle?: () => void;
    info: InfoText;
  }[] = [
    {
      key: 'mature',
      label: 'Include mature content',
      value: matureIncluded,
      onToggle: onToggleMature,
      info: matureContentInfo(scope),
    },
    {
      key: 'theme',
      label: 'Include theme-specific questions',
      value: themeIncluded,
      onToggle: onToggleTheme,
      info: themeQuestionsInfo(scope),
    },
  ];
  const activeRows = rows.filter((r) => r.value);
  const canEdit = !disabled && !locked;

  const handleTabPress = () => {
    if (locked) {
      onLockedPress?.();
      return;
    }
    if (canEdit) setPopupOpen(true);
  };

  return (
    <View style={[styles.wrapper, style]}>
      <Pressable
        onPress={handleTabPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Filter"
        style={({ pressed }) => [styles.tab, pressed && canEdit && { opacity: 0.7 }]}
      >
        <Text style={styles.heading}>Filter</Text>
        <Text style={styles.tabCount}>
          {activeRows.length} of {rows.length}
        </Text>
        {!disabled && <ChevronIcon size={16} direction={popupOpen ? 'down' : 'right'} />}
      </Pressable>

      {activeRows.map((r) => (
          <View key={r.key} style={[styles.row, styles.rowOn]}>
            <Text style={styles.rowText} numberOfLines={2}>
              {r.label}
            </Text>
            <Pressable
              style={({ pressed }) => [styles.infoBtn, pressed && { opacity: 0.7 }]}
              onPress={() => onInfo(r.info)}
              hitSlop={12}
              accessibilityLabel={`${r.label} info`}
            >
              <Text style={styles.infoText}>i</Text>
            </Pressable>
          </View>
      ))}

      <Modal
        visible={popupOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPopupOpen(false)}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={() => setPopupOpen(false)} />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Filter</Text>
            <Text style={styles.sheetSubtitle}>
              Off means left out, on means included in the game
            </Text>
            {/* Info-ikonerna utelämnas här — deras dialog skulle öppnas
                ovanpå den här Modal:en (modal-swap-fällan på iOS). De finns
                på raderna under fliken. */}
            {rows.map((r) => (
              <View key={r.key} style={[styles.row, styles.sheetRow, r.value && styles.rowOn]}>
                <Text style={[styles.rowText, !r.value && styles.rowTextOff]} numberOfLines={2}>
                  {r.label}
                </Text>
                <QuizVibeToggle
                  variant="mixer"
                  value={r.value}
                  onValueChange={r.onToggle}
                  accessibilityLabel={r.label}
                />
              </View>
            ))}
            <Pressable
              style={({ pressed }) => [styles.doneBtn, pressed && { opacity: 0.7 }]}
              onPress={() => setPopupOpen(false)}
            >
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>
        </View>
        <QuizVibeAlertHost active={popupOpen} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // = Lobbyns extraPackagesWrapper (CHOICE_BG-ram) men utan Buy-CTA-luften.
  wrapper: {
    backgroundColor: '#111826',
    borderRadius: Radius.md,
    paddingHorizontal: 3,
    paddingTop: 3,
    paddingBottom: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: BrandUi.border,
    backgroundColor: BrandUi.surface,
  },
  heading: { ...Typography.overline, color: 'rgba(255,255,255,0.78)', flex: 1 },
  tabCount: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  // = packageListRow / packageListRowOn.
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: BrandUi.border,
    backgroundColor: BrandUi.surface,
  },
  rowOn: { borderColor: 'rgba(245,166,35,0.2)' },
  rowText: {
    flex: 1,
    minWidth: 0,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  rowTextOff: { color: 'rgba(255,255,255,0.75)' },
  infoBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: BrandUi.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontFamily: 'Georgia',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    fontStyle: 'italic',
    color: BrandUi.iconMuted,
  },
  // Popup = lobbyns "+ Add package"-sheet (addPkgSheet).
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#131A27',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  sheetSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  sheetRow: { alignSelf: 'stretch' },
  doneBtn: {
    marginTop: Spacing.md,
    alignSelf: 'stretch',
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: BrandUi.surface,
    borderWidth: 1,
    borderColor: BrandUi.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
});

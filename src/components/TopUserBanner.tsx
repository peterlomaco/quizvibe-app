import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Spacing } from '../theme';
import { getAvatarEmojiById } from '../utils/avatars';
import { loadProfile, type ProfileData } from '../utils/profileStorage';
import { QuizVibeQAvatar } from './QuizVibeQAvatar';

interface Props {
  /**
   * Tap-handler för login-pillen. Lämna ofylld på skärmar där pillen är
   * rent informativ (t.ex. Profile-sidan, där användaren redan är där
   * pillen skulle navigera till) — då renderas pillen som en plain View
   * istället för TouchableOpacity.
   */
  onPress?: () => void;
  /**
   * Tap-handler för en tillbaka-länk i bannerns vänstra kant.
   * När den är satt renderas en leading-ikon (QuizVibe Q vid 'Home',
   * vänster-chevron vid 'Back') med text under i Colors.primary, och
   * topBoard:en byter till justifyContent:'space-between' så pillen stannar
   * längst till höger. Lämna ofylld på skärmar där tillbaka-navigation
   * inte är relevant (Home, Lobby).
   */
  onBackPress?: () => void;
  /**
   * Label för tillbaka-länken. Default 'Home' (visar Q-ikon, navigerar
   * till startskärmen). Sätt 'Back' i Store för att visa vänster-chevron
   * + 'Back'-text i stället, och låt onBackPress göra `router.back()`.
   */
  backLabel?: 'Home' | 'Back';
  /**
   * Optional kontrollerad profil. Skärmar med in-place-login (som Home,
   * där pillen och login-modalen lever på samma skärm) måste passera
   * sin profil här så bannern uppdateras direkt när profilen ändras —
   * useFocusEffect-self-load triggar inte eftersom skärmen aldrig
   * tappar focus. Skärmar som bara läser profilen (Lobby, Profile)
   * kan utelämna proppen och låta bannern self-loada via useFocusEffect.
   */
  profile?: ProfileData | null;
  /**
   * Visa-namn för en gäst som joinat lobbyn via guest-formen. När
   * `profile` saknas men `guestName` finns visar pillen 👤 + guestName
   * i muted styling (samma look som "Register or Login"-fallback).
   * Den default-silhouetten räcker som visuell guest-signal eftersom
   * registrerade users alltid har en custom emoji-avatar — så vi
   * behöver ingen separat "guest"-styling. Registrerade users (profile
   * != null) har företräde — om båda finns visas profilen.
   */
  guestName?: string;
}

/**
 * Full-bredd-band överst på en skärm med en login-pill i högra hörnet.
 * Pillen visar inloggad användares avatar + playerName (eller "Register or
 * Login" när profil saknas). När `profile`-proppen utelämnas läses den
 * via AsyncStorage på focus så den uppdateras när användaren ändrar
 * playerName/avatar i Profile-tabben och sedan kommer tillbaka.
 */
export function TopUserBanner({ onPress, onBackPress, backLabel = 'Home', profile: profileProp, guestName }: Props) {
  const [internalProfile, setInternalProfile] = useState<ProfileData | null>(null);
  const isControlled = profileProp !== undefined;

  useFocusEffect(
    useCallback(() => {
      if (isControlled) return;
      let active = true;
      loadProfile().then((data) => {
        if (active) setInternalProfile(data);
      });
      return () => {
        active = false;
      };
    }, [isControlled]),
  );

  const profile = isControlled ? profileProp : internalProfile;
  const isLoggedIn = !!profile;
  // Gäster i lobbyn (joinade via guest-form) saknar sparad profil men har
  // ett valt Player Name via URL-params. Visas i muted styling — registrerade
  // users har företräde om båda råkar vara satta.
  const trimmedGuestName = guestName?.trim() ?? '';
  const isGuest = !isLoggedIn && trimmedGuestName.length > 0;
  const pillStyle = [
    styles.loginPill,
    isLoggedIn ? styles.loginPillActive : styles.loginPillMuted,
  ];
  // Inloggad utan vald emoji-avatar (selectedAvatarId tom efter registrering)
  // → rendera QuizVibe Q-mark som default-avatar istället för 👤. Custom
  // emoji-avatarer renderas oförändrat när användaren valt en.
  const showBrandAvatar = isLoggedIn && !profile?.selectedAvatarId;
  const iconText = isLoggedIn ? getAvatarEmojiById(profile?.selectedAvatarId) : '👤';
  const labelText = isLoggedIn
    ? (profile?.playerName?.trim() || 'Signed in')
    : isGuest
      ? trimmedGuestName
      : 'Register or Login';
  const labelStyle = [
    styles.loginPillText,
    isLoggedIn ? styles.loginPillTextActive : styles.loginPillTextMuted,
  ];

  return (
    <View style={[styles.topBoard, onBackPress && styles.topBoardWithBack]}>
      {onBackPress && (backLabel === 'Back' ? (
        // Plain "← Back" text — speglar Join-as-guest-modalens backBtn-stil:
        // textSecondary, fontWeight 500, ingen icon-stack. Lättviktigt och
        // signalerar "stänger denna vy" snarare än "går till en specifik
        // destination" som Q-iconen gör för 'Home'.
        <TouchableOpacity
          style={styles.backLinkSimple}
          activeOpacity={0.7}
          onPress={onBackPress}
          hitSlop={10}
        >
          <Text style={styles.backLinkSimpleText}>← Back</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.backLink}
          activeOpacity={0.7}
          onPress={onBackPress}
        >
          {/* wifi-variant matchar Final Leaderboard:s Home-knapp och
              start-skärmens QuizVibeLogo — brand-konsistent Q-mark. */}
          <QuizVibeQAvatar size={20} variant="wifi" />
          <Text style={styles.backLinkText}>{backLabel}</Text>
        </TouchableOpacity>
      ))}
      {onPress ? (
        <TouchableOpacity style={pillStyle} activeOpacity={0.7} onPress={onPress}>
          {showBrandAvatar ? (
            <QuizVibeQAvatar size={16} />
          ) : (
            <Text style={styles.loginPillIcon}>{iconText}</Text>
          )}
          <Text style={labelStyle} numberOfLines={1}>
            {labelText}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={pillStyle}>
          {showBrandAvatar ? (
            <QuizVibeQAvatar size={16} />
          ) : (
            <Text style={styles.loginPillIcon}>{iconText}</Text>
          )}
          <Text style={labelStyle} numberOfLines={1}>
            {labelText}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topBoard: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  // När onBackPress är satt: byt till space-between så back-länken sitter
  // till vänster och login-pillen till höger.
  topBoardWithBack: {
    justifyContent: 'space-between',
  },
  // "Home"-länk: Q-mark ovanpå "Home"-text (i blått). Tappable med samma
  // visuella vikt som login-pillens text så de balanserar i banner-raden.
  backLink: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  backLinkText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  // Join-as-guest-modalens backBtn-style — plain "← Back"-text, ingen icon-
  // stack. Används i Store där Back betyder "stäng denna vy och gå tillbaka
  // till föregående route" (router.back()) snarare än hard-coded "Home".
  backLinkSimple: {
    paddingVertical: 4,
    paddingRight: Spacing.md,
  },
  backLinkSimpleText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  loginPill: {
    flexDirection: 'row',
    alignItems: 'center',
    // Vänsterjustera innehållet så avatar/ikon alltid sitter mot vänster
    // kant av pillen — då hamnar avatarbilden på samma position oavsett
    // om man är inloggad eller utloggad.
    justifyContent: 'flex-start',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    // Fast minWidth motsvarar "Register or Login"-textens bredd så pillen
    // håller samma storlek både utloggad och inloggad.
    minWidth: 165,
    maxWidth: 200,
  },
  loginPillActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primaryBorder,
  },
  loginPillMuted: {
    backgroundColor: Colors.cardElevated,
    borderColor: Colors.border,
  },
  loginPillIcon: {
    fontSize: 14,
  },
  loginPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loginPillTextActive: {
    color: Colors.primary,
  },
  loginPillTextMuted: {
    color: Colors.textSecondary,
  },
});

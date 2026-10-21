import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

/**
 * Knapp-innehåll som byts mot appens spinner utan att knappen ändrar storlek.
 *
 * Under `loading` ligger barnen kvar i layouten men osynliga (opacity 0) —
 * de håller knappens bredd/höjd — och en `ActivityIndicator size="small"`
 * centreras ovanpå. Samma spinner som Store/Button/CompetitionRematchActions
 * redan använder; färgen ska vara knappens textfärg.
 *
 * Används INUTI en tryckbar knapp: <TouchableOpacity ...><LoadingContent
 * loading={busy} color="#000"><Text>Join</Text></LoadingContent></...>.
 * RN-vyer är position: relative per default, så overlayn fyller knappen.
 */
export function LoadingContent({
  loading,
  color,
  children,
}: {
  loading: boolean;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <View style={loading ? styles.hidden : undefined}>{children}</View>
      {loading && (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator size="small" color={color} />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  hidden: { opacity: 0 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

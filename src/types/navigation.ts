import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
 
// ─── Root stack ───────────────────────────────────────────────────────────────
// Add future full-screen / modal routes here (e.g. GameScreen)
export type RootStackParamList = {
  MainTabs: undefined;
  // Example future routes:
  // Game: { roomCode: string };
};
 
// ─── Bottom tabs ──────────────────────────────────────────────────────────────
export type TabParamList = {
  HCPSettings: undefined;
  Profile: undefined;
  Lobby: undefined;
};
 
// ─── Typed screen props helpers ───────────────────────────────────────────────
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
 
export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
 
// Convenience aliases
export type HCPSettingsScreenProps = TabScreenProps<'HCPSettings'>;
export type ProfileScreenProps = TabScreenProps<'Profile'>;
export type LobbyScreenProps = TabScreenProps<'Lobby'>;
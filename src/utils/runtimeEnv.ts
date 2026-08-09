// ─────────────────────────────────────────────────────────────────────
// Runtime-miljö-detektering.
//
// Expo Go kör vår JS men INTE våra native-konfigurationer (app.json:s
// infoPlist/queries gäller bara dev-/standalone-builds, eftersom Expo Go
// har sin egen Info.plist). Flera features måste därför bete sig annor-
// lunda där:
//   - IAP (src/lib/iap.ts): hoppa över Purchases.configure helt — utan
//     native-modulen console.error:ar SDK:n innan den kastar.
//   - Spotify-install-check (src/utils/spotifyDJ.ts): canOpenURL('spotify:')
//     returnerar ALLTID false i Expo Go eftersom LSApplicationQueriesSchemes
//     saknas → resultatet måste tolkas som "vet ej", inte "saknas".
//
// Konstanten bodde tidigare privat i iap.ts. Flyttad hit när Spotify-
// checken behövde samma detektering — två kopior av samma uttryck driftar
// isär förr eller senare.
// ─────────────────────────────────────────────────────────────────────

import Constants, { ExecutionEnvironment } from 'expo-constants';

export const IS_EXPO_GO =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

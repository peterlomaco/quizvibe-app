/**
 * Mockad lista över extra-paket användaren har köpt via QuizVibe Store.
 * Tom array = inga köpta paket → CTA i Profile/Lobby visar Store-länk.
 *
 * Stand-in tills Store-integrationen kopplas in. Konventionen att
 * exportera samma struktur som ett kommande API-anrop skulle returnera
 * gör att call-sites kan stanna oförändrade när mock:en byts ut mot
 * `loadPurchasedPackages()` (eller motsvarande) mot riktigt backend.
 */
export interface MusicPackage {
  id: string;
  name: string;
}

export const PURCHASED_PACKAGES: MusicPackage[] = [
  { id: 'pkg-hiphop', name: 'Hip Hop' },
  { id: 'pkg-rock', name: 'Rock' },
  { id: 'pkg-film-actors', name: 'Film & Actors' },
];

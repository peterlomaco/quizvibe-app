// Mock-store för host:s authoritative lobby-settings per rumkod. Sessions-
// bunden in-memory Map (förstörs vid app-reload).
//
// Lifecycle:
//   • Host:s LobbyScreen skriver settings-state till storen via useEffect på
//     varje ändring (setLobbySettings).
//   • Non-host:s LobbyScreen poll:ar storen var 2:a sekund och syncar lokal
//     state med host:s val. Gör att icke-host:s vy alltid speglar host:s
//     aktuella inställningar utan event-bus.
//   • host:s "Delete this Game Lobby" + handleQuitGame + handleCreateGame /
//     Play Again rensar storen via clearLobbySettings för fresh slate.
//
// Settings-blob:en täcker EXAKT det non-host visuellt konsumerar i Lobby:s
// renderingstree. Lägg till nya fält här i takt med att fler host-set
// kontroller exponeras för non-host. När backend kommer in ersätts detta
// med en server-cache (REST/WS).

export type LobbyGameMode = 'pass-the-phone' | 'individual-devices';
export type LobbyRegion = 'Sweden' | 'Nordics' | 'Europe' | 'Global';
export type LobbyAnswerResponse = 15 | 30 | 45 | 60;

export interface LobbySettings {
  gameMode: LobbyGameMode;
  // True om host har valt single-player-default; driver dimming/eject-flödet.
  // Non-host kan inte längre vara kvar när detta blir true (de ejectas via
  // markEjected) men host:s vy använder fortsatt fältet för dimming.
  singlePlayerDefault: boolean;
  region: LobbyRegion;
  // Svar-tid i sekunder per fråga (driver Answer response time-radens highlight).
  answerResponseSeconds: LobbyAnswerResponse;
  // Game Era — år-spann [from, to] som visas i den gula eraGuestBox-rutan.
  eraFrom: number;
  eraTo: number;
  // Antal rundor — visas i den blå-bordred rutan + RoundsRuler:s aktiva tick.
  roundsCount: number;
  // Lista över paket-id:n host har aktivt valt för denna lobby (ovanpå
  // basic-utbudet). Driver Customized Host packages-blockets aktiva rader
  // för non-host (filtrerad lista, read-only).
  selectedExtraPackages: string[];
  // Game Connections — host:s on/off-toggles per källa. Non-host ser dem
  // som Enabled/Disabled-pillar.
  youtubeEnabled: boolean;
  spotifyHostToggle: boolean;
  profilesEnabled: boolean;
}

const LOBBY_SETTINGS = new Map<string, LobbySettings>();

/**
 * Skriver host:s settings-blob till storen. No-op vid tom rumkod. Shallow-
 * copy:ar `selectedExtraPackages` så host:s state-mutationer inte påverkar
 * non-host:s snapshot.
 */
export function setLobbySettings(code: string, settings: LobbySettings): void {
  if (!code) return;
  LOBBY_SETTINGS.set(code.toUpperCase(), {
    ...settings,
    selectedExtraPackages: [...settings.selectedExtraPackages],
  });
}

/**
 * Returnerar host:s aktuella settings-blob. undefined om host:en aldrig har
 * skrivit till storen — non-host:s polling tolkar då som "behåll lokal state"
 * (mock-only edge case när non-host joinar utan aktiv host).
 */
export function getLobbySettings(code: string): LobbySettings | undefined {
  if (!code) return undefined;
  const stored = LOBBY_SETTINGS.get(code.toUpperCase());
  return stored
    ? { ...stored, selectedExtraPackages: [...stored.selectedExtraPackages] }
    : undefined;
}

/**
 * Rensar storen för en rumkod. Kallas vid lobby-radering och vid skapande/
 * återanvändande av kod så stale settings inte ärvs. Idempotent.
 */
export function clearLobbySettings(code: string): void {
  if (!code) return;
  LOBBY_SETTINGS.delete(code.toUpperCase());
}

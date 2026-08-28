// Competition re-match — startar en ny lobby dedikerad till de registrerade
// deltagarna i en sparad Competition Leaderboard (öppnad från Home →
// /competitions → gyllene Re-match/Replay-knapp).
//
// Till skillnad från Final Leaderboards re-match (goToNewLobby) är de andra
// deltagarna INTE anslutna — de får en cross-device-inbjudan (waiting_invites)
// och joinar på egen enhet. Flödet återanvänder därför:
//   • Den låsta uppsättningen (rooms.rematch_locked + rematch_player_ids, 0037)
//     → host:s Start Game blockeras tills alla joinat (findMissingRematchPlayers).
//   • Join-gaten checkRematchLockedLobby (Home) — bara deltagarna släpps in.
//   • waiting_invites (addInvite) för leverans + accept.
//   • Serie-fortsättningen (attachSeriesToLeaderboard + markSeriesContinues)
//     så nästa spel bokförs i SAMMA sparade competition.
//
// Multi (>1 deltagare) → låst Individual Devices-lobby + inbjudningar + 5-min
// expiry (i LobbyScreen). Solo (1 deltagare) → vanlig single-lobby som bara
// fortsätter serien (ingen låsning, inga inbjudningar).

import { attachSeriesToLeaderboard, markSeriesContinues } from './aggregateLeaderboard';
import type { SavedAggregate } from './aggregateLeaderboards';
import { clearEjected } from './ejectedPlayers';
import { clearLeftPlayers } from './leftPlayers';
import { registerActiveRoom } from './mockActiveRooms';
import {
  clearLobbyPlayers,
  seedRematchInviteePlayers,
} from './mockLobbyPlayers';
import {
  clearLobbySettings,
  setLobbySettings,
  type LobbySettings,
} from './mockLobbySettings';
import { clearGameStarted } from './mockStartedGames';
import { defaultEnabledMainCategories } from './mainCategory';
import { generateRoomCode } from './roomCode';
import { addInvite } from './waitingInvites';

// Host:s lobby-player_id — matchar SEED_PLAYERS[0].id i LobbyScreen (host:s
// kort behåller '1' genom mergeProfileIntoHost).
const HOST_PLAYER_ID = '1';
const CURRENT_YEAR = new Date().getFullYear();

export type CompetitionRematchLobbyType = 'single' | 'multiplayer';

export interface StartCompetitionRematchOptions {
  saved: SavedAggregate;
  hostUserId: string | null;
  hostPlayerName: string;
  hostAvatarId?: string;
  hasPremium: boolean;
  /** Host-defaults från profilen, för en rimlig spel-setup (host kan justera). */
  eraFrom?: number;
  eraTo?: number;
  roundsCount?: number;
  answerResponseSeconds?: 30 | 45 | 60;
  region?: LobbySettings['region'];
}

export interface StartCompetitionRematchResult {
  ok: boolean;
  reason?: 'identity' | 'register';
  code?: string;
  lobbyType?: CompetitionRematchLobbyType;
  isMulti?: boolean;
}

function buildRematchSettings(
  opts: StartCompetitionRematchOptions,
  maxPlayers: 4 | 12,
): LobbySettings {
  const all = defaultEnabledMainCategories();
  return {
    // Individual Devices — de inbjudna spelar på egna enheter (remote join).
    gameMode: 'individual-devices',
    singlePlayerDefault: false,
    maxPlayers,
    region: opts.region ?? 'Global',
    answerResponseSeconds: opts.answerResponseSeconds ?? 30,
    eraFrom: opts.eraFrom ?? 1970,
    eraTo: opts.eraTo ?? CURRENT_YEAR,
    roundsCount: opts.roundsCount ?? 4,
    selectedExtraPackages: [],
    youtubeEnabledCategories: [...all],
    imagesEnabledCategories: [...all],
    sketchEnabled: false,
    spotifyEnabled: false,
    spotifyAnswerYear: true,
    spotifyAnswerName: true,
    parentControlEnabled: false,
    remoteAssistance: 'full',
    mutualAssistanceEnabled: false,
  };
}

/**
 * Skapar och navigerar (via caller) till en Competition re-match-lobby.
 * Caller ansvarar för credit-gaten FÖRE anropet och för router.push efter
 * ett `ok`-resultat.
 *
 * `reason: 'identity'` = den inloggade användaren kunde inte matchas mot
 * någon deltagare i den sparade serien (bör inte hända — listan är RLS-scoped
 * till deltagare — men vi felar hellre tydligt än skapar en trasig lobby).
 * `reason: 'register'` = rums-raden kunde inte skrivas (offline/utloggad).
 */
export async function startCompetitionRematch(
  opts: StartCompetitionRematchOptions,
): Promise<StartCompetitionRematchResult> {
  const { saved, hostUserId, hostPlayerName, hostAvatarId, hasPremium } = opts;

  // Identifiera host bland deltagarna — userId primärt (stabilt), playerName
  // som fallback (om uid saknas). De ÖVRIGA är de som ska bjudas in.
  const nameLc = hostPlayerName.trim().toLowerCase();
  const hostParticipant = saved.participants.find(
    (p) =>
      (hostUserId && p.userId === hostUserId) ||
      p.playerName.trim().toLowerCase() === nameLc,
  );
  if (!hostParticipant) return { ok: false, reason: 'identity' };

  const invitees = saved.participants.filter((p) => p !== hostParticipant);
  const isMulti = invitees.length > 0;
  const lobbyType: CompetitionRematchLobbyType = isMulti ? 'multiplayer' : 'single';
  const maxPlayers: 4 | 12 = saved.participants.length > 4 ? 12 : 4;

  const code = generateRoomCode();

  // player_id per inbjuden — deterministiskt inom lobbyn. code-only-joinen
  // matchar på NAMN och ärver id:t, så själva värdet är godtyckligt (bara
  // unikt inom rummet krävs).
  const seeded = invitees.map((p, i) => ({
    playerId: `comp-${i}`,
    playerName: p.playerName,
  }));
  const rematchPlayerIds = isMulti
    ? [HOST_PLAYER_ID, ...seeded.map((s) => s.playerId)]
    : [];

  const registered = await registerActiveRoom(code, {
    maxPlayers: isMulti ? maxPlayers : 4,
    hostIsPremium: hasPremium,
    currentPlayerCount: 1,
    hostPlayerName,
    gameStarted: false,
    rematchLocked: isMulti,
    rematchPlayerIds,
  });
  if (!registered) return { ok: false, reason: 'register' };

  // Fresh slate — samma cleanup-bunt som handleCreateGame/goToNewLobby.
  clearLeftPlayers(code);
  await clearLobbyPlayers(code);
  await clearLobbySettings(code);
  clearEjected(code);
  clearGameStarted(code);

  // Serie-koppling: seeda lokala serien med de sparade spelen + stämpla
  // rummet så nästa spel bokförs i SAMMA sparade competition (quiz.tsx läser
  // leaderboardId ur serien vid mount + recordAggregateGame vid spelslut).
  await attachSeriesToLeaderboard(saved.id, saved.games);
  await markSeriesContinues(code, saved.id);

  if (isMulti) {
    // Tvinga Individual Devices genom att skriva stored settings — host-seeden
    // föredrar dem över profil-defaults, så vi rör inte den känsliga seed-
    // logiken. Host kan ändå justera rundor/era/svarstid i lobbyn.
    await setLobbySettings(code, buildRematchSettings(opts, maxPlayers));
    // Pre-seeda de inbjudnas rader (has_left=true → "inte på plats" tills join).
    await seedRematchInviteePlayers(code, seeded);
    // Cross-device-inbjudan till varje deltagare. alreadyFriend:true hoppar
    // consent-popupen (det här är inte en friend-inbjudan).
    for (const inv of invitees) {
      await addInvite(inv.playerName, {
        roomCode: code,
        fromPlayerName: hostPlayerName,
        fromAvatarId: hostAvatarId,
        alreadyFriend: true,
      });
    }
  }

  return { ok: true, code, lobbyType, isMulti };
}

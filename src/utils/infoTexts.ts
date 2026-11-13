// Shared texts for info-icon (ⓘ) popups (Peter 2026-11-07). Lobby and Profile
// explain the same settings from here so the two screens never drift apart.
//
// Pure: no React, no storage. Mode names come in as `allAtOnce` (from
// modeLabels(...)), so legacy rooms/profiles still say "Individual device".
//
// Body format (rendered by InfoDialog): paragraphs separated by a blank line;
// "Term: text" paragraphs get a bold term.

export interface InfoText {
  title: string;
  message: string;
}

const ASSISTANCE_LEVELS =
  'Full: Pick from a list of names. Year questions use a 5-year window.\n\n' +
  'Standard: 2-letter hint. Year questions use a 3-year window.\n\n' +
  'Minimal: 1-letter hint. Year questions need the exact year.';

export function assistanceInfo(): InfoText {
  return { title: 'Assistance level', message: ASSISTANCE_LEVELS };
}

export function mutualAssistanceInfo(): InfoText {
  return {
    title: 'Mutual assistance level',
    message:
      'On: Both players use the same level, chosen by the Host.\n\n' +
      'Off: Each player uses their own level.\n\n' +
      ASSISTANCE_LEVELS,
  };
}

/** Multiplayer v2 game mode — identical for registered and Guest Hosts. */
export function gameModeInfo(): InfoText {
  return {
    title: 'Game mode',
    message:
      'All at Once: Everyone plays simultaneously on their Own Device.\n\n' +
      '1 by 1: Everyone takes turns, regardless of device.',
  };
}

export function addGuestInfo(): InfoText {
  return {
    title: 'Add Guest',
    message: 'Adding a guest requires 1 by 1 mode. Guests play on the Host Device.',
  };
}

export function playersInfo(allAtOnce: string): InfoText {
  return {
    title: 'Players',
    message: `Max 4 players is free. Max 12 needs Premium and ${allAtOnce}.`,
  };
}

export function spotifyInfo(allAtOnce: string): InfoText {
  return {
    title: 'Spotify DJ',
    message:
      'One player at a time is the DJ and plays the track in their Spotify app — free or Premium.\n\n' +
      `Spotify games are played ${allAtOnce}, with everyone on their Own Device.`,
  };
}

export function youtubeInfo(): InfoText {
  return { title: 'YouTube', message: 'Music videos, film clips and trailers from YouTube.' };
}

export function hintsInfo(): InfoText {
  return { title: 'Hints', message: 'Guess the artist, band or actor using progressively revealed clues.' };
}

export function parentControlInfo(scope: 'lobby' | 'profile'): InfoText {
  return {
    title: 'Parent Control',
    message:
      scope === 'profile'
        ? 'When on, mature clips and packages are left out of the games you host.'
        : 'When on, mature clips and packages are left out of the game.',
  };
}

export function hostPackagesInfo(): InfoText {
  return {
    title: 'Host packages',
    message: 'Generic: The standard quiz mix.\n\nExtra packages: Themed quizzes, included with Premium.',
  };
}

export const PARENT_CONTROLLED_PACKAGE_TEXT = 'Turn off Parent Control to use this package.';

export function parentControlledPackageInfo(): InfoText {
  return { title: 'Parent controlled', message: PARENT_CONTROLLED_PACKAGE_TEXT };
}

export function gameEraInfo(): InfoText {
  return { title: 'Game Era', message: 'Choose the year range for your questions. Minimum 15 years. With an Extra package, the range stays within the package’s years and is minimum 25 years.' };
}

/**
 * Rounds limit depends on the lobby: multiplayer (20 only with Premium in All
 * at Once), H2H (20 with Premium) or Guest Host / Single (no upgrade line).
 */
export function roundsInfo(variant: 'multiplayer' | 'h2h' | 'basic', allAtOnce: string): InfoText {
  const base = 'Each round, every player answers one question.';
  const limit =
    variant === 'multiplayer'
      ? ` Up to 4 rounds, or 20 with Premium in ${allAtOnce}.`
      : variant === 'h2h'
        ? ' Up to 4 rounds, or 20 with Premium.'
        : '';
  return { title: 'Number of Rounds', message: base + limit };
}

export function gameSequenceInfo(): InfoText {
  return { title: 'Game Sequence', message: 'Which source each round uses: Spotify, YouTube or Hints.' };
}

export function answerTimeInfo(): InfoText {
  return { title: 'Answer time', message: 'Time allowed to answer each question.' };
}

export function voiceInfo(): InfoText {
  return {
    title: 'Voice',
    message: 'The voice for the 3-2-1 countdown and the lobby welcome. Tap ▶ to hear it, or choose No voice.',
  };
}

export function regionScopeInfo(): InfoText {
  return { title: 'Region Scope', message: 'Questions are picked for what players in this region recognise.' };
}

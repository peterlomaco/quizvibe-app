// Heuristisk scoring av YouTube-kandidater för suggest-CLI:n. Renderar
// inte CLI-output — bara ren logik som tar (search, details, blockReasons)
// och returnerar score + breakdown. Bryts medvetet ut ur suggest.ts så
// scoringen kan unit-testas utan att CLI:ns top-level main() körs vid
// import.

import type { YoutubeSearchResult, YoutubeVideoDetails } from './client';

/**
 * Heuristik som rankar suggest-kandidater. Hämtar signaler från
 * details (HD/SD, channel-namn) + search (title) + blockReasons.
 * Kommer inte att vara perfekt — sista beslut fattas av curatorn —
 * men sparar tid genom att lyfta sannolikt-bra-kandidater till toppen
 * av listan.
 *
 * Returnerar { score, notes }. Notes listar varje signal som påverkade
 * scoren med +/- prefix.
 */
export function scoreSuggestion(
  search: YoutubeSearchResult,
  details: YoutubeVideoDetails | undefined,
  blockReasons: string[],
): { score: number; notes: string[] } {
  const notes: string[] = [];
  let score = 0;

  // Hård bottom-prio: blockerade klipp ska aldrig hamna överst, oavsett
  // andra positiva signaler. Curator ser dem fortfarande i listan men
  // tydligt nedstyrda.
  if (blockReasons.length > 0) {
    score -= 100;
    notes.push(`-100 blocked (${blockReasons.length})`);
  }

  // HD/SD-vikt — kompletterar HD-gate:en (SD blockas men ska ändå
  // hamna nedanför HD om båda råkar ligga utan andra block-reasons).
  if (details?.definition === 'hd') {
    score += 10;
    notes.push('+10 HD');
  } else if (details?.definition === 'sd') {
    score -= 10;
    notes.push('-10 SD');
  }

  const title = (search.title ?? '').toLowerCase();
  const channel = (details?.channelTitle ?? search.channelTitle ?? '').toLowerCase();

  // Titel-positiva: starka indikatorer för rörlig-bild-källa.
  if (/\b(official\s+(music\s+)?video|official\s+mv|\(official\s+video\))\b/.test(title)) {
    score += 8;
    notes.push('+8 official-video title');
  } else if (/\bmusic\s+video\b/.test(title)) {
    score += 5;
    notes.push('+5 music-video title');
  } else if (/\bofficial\b/.test(title)) {
    score += 3;
    notes.push('+3 "official" in title');
  }

  // Titel-negativa: starka indikatorer för stillbild / endast ljud.
  if (/\b(lyric(s)?\s+video|lyrics?\b|audio\s+only|\baudio\b|static|album\s+art|slideshow)\b/.test(title)) {
    score -= 10;
    notes.push('-10 lyric/audio/static title');
  }

  // Kanal-signaler. VEVO-suffix = nästan alltid official MV.
  // "Topic"-suffix = YouTube-genererad album-upload (statisk konst).
  if (/vevo$/.test(channel)) {
    score += 6;
    notes.push('+6 VEVO channel');
  } else if (/\s+-\s+topic$/.test(channel) || /\btopic$/.test(channel)) {
    score -= 8;
    notes.push('-8 Topic channel (auto album upload)');
  } else if (/\bofficial\b/.test(channel)) {
    score += 4;
    notes.push('+4 "official" in channel');
  }

  return { score, notes };
}

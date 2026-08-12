// Kuraterad metadata för Spotify DJ-artister (alla artister i musik-katalogen
// som har spotifyTrackId). Driver relevans-filtreringen av Name-svarsalternativ
// för Spotify/Name-frågor i quiz.tsx — en svensk kvinnlig soloartist ska få
// andra svenska kvinnliga soloartister som distraktorer, ett amerikanskt band
// andra amerikanska band, osv.
//
// VARFÖR EN MANUELL TABELL: bara ~40 % av Spotify-artisterna finns i bild-
// poolen/HINTS_LIBRARY, och inferGender (pronomen-räkning på hint-texter) är
// opålitlig för artister (The Weeknd klassas t.ex. som 'female' pga låttext-
// pronomen). En explicit kuraterad tabell är deterministisk och textbillig.
//
// CURATOR-REGEL: när en ny låt får spotifyTrackId i backend-katalogen, lägg
// till artisten här (nyckel = exakta artist-delen av displayName efter " — ",
// lowercase). Saknad entry är INTE ett fel — quiz.tsx faller tillbaka till
// den ofiltrerade artist+band-poolen (samma beteende som före tabellen).
//
// - type: 'artist' = soloakt (frågetext-mässigt en person), 'band' = grupp/duo.
// - gender: för soloartister 'male'/'female'; för band 'male'/'female' endast
//   när HELA gruppen har samma kön (First Aid Kit = female), annars 'mixed'.
// - country: normaliserad lowercase, samma vokabulär som HINTS_LIBRARY
//   nationality ('sweden', 'usa', 'uk', ...). För akter med dubbel hemvist
//   används landet med starkast svensk igenkännings-association
//   (Dr. Alban/Günther = 'sweden').

export interface SpotifyArtistMeta {
  type: 'artist' | 'band';
  gender: 'male' | 'female' | 'mixed' | null;
  country: string;
}

export const SPOTIFY_ARTIST_META: Record<string, SpotifyArtistMeta> = {
  // ── Svenska soloartister ──
  'avicii': { type: 'artist', gender: 'male', country: 'sweden' },
  'benjamin ingrosso': { type: 'artist', gender: 'male', country: 'sweden' },
  'björn skifs': { type: 'artist', gender: 'male', country: 'sweden' },
  'cornelis vreeswijk': { type: 'artist', gender: 'male', country: 'sweden' },
  'eric prydz': { type: 'artist', gender: 'male', country: 'sweden' },
  'lasse berghagen': { type: 'artist', gender: 'male', country: 'sweden' },
  'markoolio': { type: 'artist', gender: 'male', country: 'sweden' },
  'petter': { type: 'artist', gender: 'male', country: 'sweden' },
  'tomas ledin': { type: 'artist', gender: 'male', country: 'sweden' },
  'ted gärdestad': { type: 'artist', gender: 'male', country: 'sweden' },
  'niklas strömstedt': { type: 'artist', gender: 'male', country: 'sweden' },
  'hasse andersson': { type: 'artist', gender: 'male', country: 'sweden' },
  'kapten röd': { type: 'artist', gender: 'male', country: 'sweden' },
  'anis don demina': { type: 'artist', gender: 'male', country: 'sweden' },
  'dr. alban': { type: 'artist', gender: 'male', country: 'sweden' },
  'günther': { type: 'artist', gender: 'male', country: 'sweden' },
  'lucianoz': { type: 'artist', gender: 'male', country: 'sweden' },
  'edivibz': { type: 'artist', gender: 'male', country: 'sweden' },
  'kikki danielsson': { type: 'artist', gender: 'female', country: 'sweden' },
  'laleh': { type: 'artist', gender: 'female', country: 'sweden' },
  'lill lindfors': { type: 'artist', gender: 'female', country: 'sweden' },
  'lill-babs': { type: 'artist', gender: 'female', country: 'sweden' },
  'loreen': { type: 'artist', gender: 'female', country: 'sweden' },
  'lotta engberg': { type: 'artist', gender: 'female', country: 'sweden' },
  'miss li': { type: 'artist', gender: 'female', country: 'sweden' },
  'robyn': { type: 'artist', gender: 'female', country: 'sweden' },
  'veronica maggio': { type: 'artist', gender: 'female', country: 'sweden' },
  'cajsa stina åkerström': { type: 'artist', gender: 'female', country: 'sweden' },
  'dotter': { type: 'artist', gender: 'female', country: 'sweden' },
  'orup': { type: 'artist', gender: 'male', country: 'sweden' },

  // ── Svenska band/duos/grupper ──
  'abba': { type: 'band', gender: 'mixed', country: 'sweden' },
  'ace of base': { type: 'band', gender: 'mixed', country: 'sweden' },
  'arvingarna': { type: 'band', gender: 'male', country: 'sweden' },
  'barbados': { type: 'band', gender: 'male', country: 'sweden' },
  'bolaget': { type: 'band', gender: 'male', country: 'sweden' },
  'brandsta': { type: 'band', gender: 'male', country: 'sweden' },
  'first aid kit': { type: 'band', gender: 'female', country: 'sweden' },
  'ges': { type: 'band', gender: 'male', country: 'sweden' },
  'gyllene tider': { type: 'band', gender: 'male', country: 'sweden' },
  'icona pop': { type: 'band', gender: 'female', country: 'sweden' },
  'lili & sussie': { type: 'band', gender: 'female', country: 'sweden' },
  'mando diao': { type: 'band', gender: 'male', country: 'sweden' },
  'rednex': { type: 'band', gender: 'mixed', country: 'sweden' },
  'rolandz': { type: 'band', gender: 'male', country: 'sweden' },
  'ronny & ragge': { type: 'band', gender: 'male', country: 'sweden' },
  'roxette': { type: 'band', gender: 'mixed', country: 'sweden' },
  'sarek': { type: 'band', gender: 'mixed', country: 'sweden' },
  'streaplers': { type: 'band', gender: 'male', country: 'sweden' },
  'sven-ingvars': { type: 'band', gender: 'male', country: 'sweden' },
  'svenne rubins': { type: 'band', gender: 'male', country: 'sweden' },
  'swedish house mafia': { type: 'band', gender: 'male', country: 'sweden' },
  'the cardigans': { type: 'band', gender: 'mixed', country: 'sweden' },
  'the hives': { type: 'band', gender: 'male', country: 'sweden' },
  'vikingarna': { type: 'band', gender: 'male', country: 'sweden' },
  'albin lee meldau & per gessle': { type: 'band', gender: 'male', country: 'sweden' },

  // ── USA ──
  '50 cent': { type: 'artist', gender: 'male', country: 'usa' },
  'cab calloway': { type: 'artist', gender: 'male', country: 'usa' },
  'eminem': { type: 'artist', gender: 'male', country: 'usa' },
  'nat king cole': { type: 'artist', gender: 'male', country: 'usa' },
  'neil diamond': { type: 'artist', gender: 'male', country: 'usa' },
  'stevie wonder': { type: 'artist', gender: 'male', country: 'usa' },
  'judy garland': { type: 'artist', gender: 'female', country: 'usa' },
  'dr. dre ft. snoop dogg': { type: 'artist', gender: 'male', country: 'usa' },
  'jay-z ft. alicia keys': { type: 'artist', gender: 'male', country: 'usa' },
  'nas ft. lauryn hill': { type: 'artist', gender: 'male', country: 'usa' },
  'eagles': { type: 'band', gender: 'male', country: 'usa' },
  'imagine dragons': { type: 'band', gender: 'male', country: 'usa' },
  'sugarhill gang': { type: 'band', gender: 'male', country: 'usa' },
  'dj jazzy jeff & the fresh prince': { type: 'band', gender: 'male', country: 'usa' },
  'lady gaga': { type: 'artist', gender: 'female', country: 'usa' },
  'lionel richie': { type: 'artist', gender: 'male', country: 'usa' },
  'lady gaga & bruno mars': { type: 'artist', gender: 'mixed', country: 'usa' },
  'marvin gaye & tammi terrell': { type: 'artist', gender: 'mixed', country: 'usa' },

  // ── UK ──
  'ed sheeran': { type: 'artist', gender: 'male', country: 'uk' },
  'bee gees': { type: 'band', gender: 'male', country: 'uk' },
  'glass animals': { type: 'band', gender: 'male', country: 'uk' },
  'mungo jerry': { type: 'band', gender: 'male', country: 'uk' },
  'queen': { type: 'band', gender: 'male', country: 'uk' },
  'dario g': { type: 'artist', gender: 'male', country: 'uk' },
  'bonnie tyler': { type: 'artist', gender: 'female', country: 'uk' },
  'the rolling stones': { type: 'band', gender: 'male', country: 'uk' },
  'the who': { type: 'band', gender: 'male', country: 'uk' },

  // ── Övriga världen ──
  'ac/dc': { type: 'band', gender: 'male', country: 'australia' },
  'sia': { type: 'artist', gender: 'female', country: 'australia' },
  'bryan adams': { type: 'artist', gender: 'male', country: 'canada' },
  'bryan adams & melanie c': { type: 'artist', gender: 'mixed', country: 'canada' },
  'the weeknd': { type: 'artist', gender: 'male', country: 'canada' },
  'rihanna': { type: 'artist', gender: 'female', country: 'barbados' },
  'bob marley & the wailers': { type: 'band', gender: 'male', country: 'jamaica' },
  'inner circle': { type: 'band', gender: 'male', country: 'jamaica' },
  'ylvis': { type: 'band', gender: 'male', country: 'norway' },
  'keiino': { type: 'band', gender: 'mixed', country: 'norway' },
  'dj ötzi': { type: 'artist', gender: 'male', country: 'austria' },
  'bellini': { type: 'band', gender: 'mixed', country: 'germany' },
  'r.i.o.': { type: 'band', gender: 'male', country: 'germany' },
  'kaoma': { type: 'band', gender: 'mixed', country: 'france' },
  'joost klein': { type: 'artist', gender: 'male', country: 'netherlands' },
  'martin garrix ft. bono & the edge': { type: 'artist', gender: 'male', country: 'netherlands' },
  'southside spinners': { type: 'band', gender: 'male', country: 'netherlands' },
  'elena tsagkrinou': { type: 'artist', gender: 'female', country: 'greece' },
  'eleni foureira': { type: 'artist', gender: 'female', country: 'greece' },
  'hadise': { type: 'artist', gender: 'female', country: 'turkey' },
};

/**
 * Slå upp metadata för ett artistnamn (artist-delen av "Title — Artist").
 * Case-insensitiv exakt match; på miss provas delen före " ft."/" feat."
 * så featured-collabs matchar huvudartisten.
 */
export function getSpotifyArtistMeta(name: string): SpotifyArtistMeta | null {
  const key = name.trim().toLowerCase();
  const direct = SPOTIFY_ARTIST_META[key];
  if (direct) return direct;
  const beforeFeat = key.split(/\s+(?:ft\.?|feat\.?)\s+/)[0]?.trim();
  if (beforeFeat && beforeFeat !== key) {
    return SPOTIFY_ARTIST_META[beforeFeat] ?? null;
  }
  return null;
}

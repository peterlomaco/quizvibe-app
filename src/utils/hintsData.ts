// Hints-data för Hints-frågor.
//
// PersonHints visas progressivt i HintsQuizCard under svarstiden.
// HINTS_DATA: Record<itemId, PersonHints>
//   Nyckel = samma id som i IMAGE_QUIZ_QUESTIONS / YAML-katalogen.
//   Initialt: 30 manuellt kuraterade items (10 per profession).
//   Utökas via backend/scripts/fetch-hints-data.ts (Wikidata API).
//
// Flagga: nationality → emoji via countryToFlagEmoji().

export type HintBibEntry =
  | { type: 'work'; title: string; year: number }
  | { type: 'club'; name: string; from: number; to?: number }
  | { type: 'national'; caps: number };

export interface PersonHints {
  nationality: string;       // 'sweden', 'argentina', 'usa', etc.
  birthDate?: string;        // 'YYYY-MM-DD' eller 'YYYY'
  birthCity?: string;
  mainProfession: string;    // 'Football player', 'Music artist', 'Actor'
  bibliography: HintBibEntry[];
}

// ── Emoji-flaggor ─────────────────────────────────────────────────────────

const FLAG_MAP: Record<string, string> = {
  sweden: '🇸🇪',
  norway: '🇳🇴',
  denmark: '🇩🇰',
  finland: '🇫🇮',
  iceland: '🇮🇸',
  usa: '🇺🇸',
  'united-states': '🇺🇸',
  uk: '🇬🇧',
  'united-kingdom': '🇬🇧',
  england: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  france: '🇫🇷',
  germany: '🇩🇪',
  spain: '🇪🇸',
  italy: '🇮🇹',
  brazil: '🇧🇷',
  argentina: '🇦🇷',
  portugal: '🇵🇹',
  croatia: '🇭🇷',
  netherlands: '🇳🇱',
  belgium: '🇧🇪',
  austria: '🇦🇹',
  switzerland: '🇨🇭',
  barbados: '🇧🇧',
  russia: '🇷🇺',
  ukraine: '🇺🇦',
  poland: '🇵🇱',
  czechia: '🇨🇿',
  greece: '🇬🇷',
  turkey: '🇹🇷',
  canada: '🇨🇦',
  australia: '🇦🇺',
  japan: '🇯🇵',
  china: '🇨🇳',
  'south-korea': '🇰🇷',
  mexico: '🇲🇽',
  colombia: '🇨🇴',
  nigeria: '🇳🇬',
  senegal: '🇸🇳',
  'ivory-coast': '🇨🇮',
  cameroon: '🇨🇲',
  ghana: '🇬🇭',
  jamaica: '🇯🇲',
};

export function countryToFlagEmoji(nationality: string): string {
  return FLAG_MAP[nationality.toLowerCase()] ?? '🏳️';
}

// ── Hints-data: 10 Artists + 10 Actors + 10 Athletes ─────────────────────

export const HINTS_DATA: Record<string, PersonHints> = {

  // ── ARTISTS ──────────────────────────────────────────────────────────────

  'michael-jackson': {
    nationality: 'usa',
    birthDate: '1958-08-29',
    birthCity: 'Gary, Indiana',
    mainProfession: 'Music artist',
    bibliography: [
      { type: 'work', title: 'Thriller', year: 1982 },
      { type: 'work', title: 'Billie Jean', year: 1983 },
      { type: 'work', title: 'Beat It', year: 1982 },
    ],
  },

  'madonna': {
    nationality: 'usa',
    birthDate: '1958-08-16',
    birthCity: 'Bay City, Michigan',
    mainProfession: 'Music artist',
    bibliography: [
      { type: 'work', title: 'Like a Virgin', year: 1984 },
      { type: 'work', title: 'Material Girl', year: 1984 },
      { type: 'work', title: 'Vogue', year: 1990 },
    ],
  },

  'elvis-presley': {
    nationality: 'usa',
    birthDate: '1935-01-08',
    birthCity: 'Tupelo, Mississippi',
    mainProfession: 'Music artist',
    bibliography: [
      { type: 'work', title: 'Hound Dog', year: 1956 },
      { type: 'work', title: 'Jailhouse Rock', year: 1957 },
      { type: 'work', title: 'Suspicious Minds', year: 1969 },
    ],
  },

  'beyonce': {
    nationality: 'usa',
    birthDate: '1981-09-04',
    birthCity: 'Houston, Texas',
    mainProfession: 'Music artist',
    bibliography: [
      { type: 'work', title: 'Crazy in Love', year: 2003 },
      { type: 'work', title: 'Irreplaceable', year: 2006 },
      { type: 'work', title: 'Halo', year: 2008 },
    ],
  },

  'avicii': {
    nationality: 'sweden',
    birthDate: '1989-09-08',
    birthCity: 'Stockholm',
    mainProfession: 'Music artist',
    bibliography: [
      { type: 'work', title: 'Levels', year: 2011 },
      { type: 'work', title: 'Wake Me Up', year: 2013 },
      { type: 'work', title: 'The Nights', year: 2014 },
    ],
  },

  'adele': {
    nationality: 'uk',
    birthDate: '1988-05-05',
    birthCity: 'Tottenham, London',
    mainProfession: 'Music artist',
    bibliography: [
      { type: 'work', title: 'Rolling in the Deep', year: 2010 },
      { type: 'work', title: 'Someone Like You', year: 2011 },
      { type: 'work', title: 'Hello', year: 2015 },
    ],
  },

  'rihanna': {
    nationality: 'barbados',
    birthDate: '1988-02-20',
    birthCity: 'Saint Michael',
    mainProfession: 'Music artist',
    bibliography: [
      { type: 'work', title: 'Umbrella', year: 2007 },
      { type: 'work', title: 'We Found Love', year: 2011 },
      { type: 'work', title: 'Diamonds', year: 2012 },
    ],
  },

  'zara-larsson': {
    nationality: 'sweden',
    birthDate: '1997-12-16',
    birthCity: 'Stockholm',
    mainProfession: 'Music artist',
    bibliography: [
      { type: 'work', title: 'Lush Life', year: 2015 },
      { type: 'work', title: 'Never Forget You', year: 2015 },
      { type: 'work', title: 'Symphony', year: 2017 },
    ],
  },

  'whitney-houston': {
    nationality: 'usa',
    birthDate: '1963-08-09',
    birthCity: 'Newark, New Jersey',
    mainProfession: 'Music artist',
    bibliography: [
      { type: 'work', title: 'Greatest Love of All', year: 1985 },
      { type: 'work', title: 'I Wanna Dance with Somebody', year: 1987 },
      { type: 'work', title: 'I Will Always Love You', year: 1992 },
    ],
  },

  'eminem': {
    nationality: 'usa',
    birthDate: '1972-10-17',
    birthCity: 'St. Joseph, Missouri',
    mainProfession: 'Music artist',
    bibliography: [
      { type: 'work', title: 'The Real Slim Shady', year: 2000 },
      { type: 'work', title: 'Lose Yourself', year: 2002 },
      { type: 'work', title: 'Without Me', year: 2002 },
    ],
  },

  // ── ACTORS ───────────────────────────────────────────────────────────────

  'marilyn-monroe': {
    nationality: 'usa',
    birthDate: '1926-06-01',
    birthCity: 'Los Angeles, California',
    mainProfession: 'Actor',
    bibliography: [
      { type: 'work', title: 'Gentlemen Prefer Blondes', year: 1953 },
      { type: 'work', title: 'The Seven Year Itch', year: 1955 },
      { type: 'work', title: 'Some Like It Hot', year: 1959 },
    ],
  },

  'tom-hanks': {
    nationality: 'usa',
    birthDate: '1956-07-09',
    birthCity: 'Concord, California',
    mainProfession: 'Actor',
    bibliography: [
      { type: 'work', title: 'Forrest Gump', year: 1994 },
      { type: 'work', title: 'Cast Away', year: 2000 },
      { type: 'work', title: 'The Da Vinci Code', year: 2006 },
    ],
  },

  'audrey-hepburn': {
    nationality: 'belgium',
    birthDate: '1929-05-04',
    birthCity: 'Ixelles, Brussels',
    mainProfession: 'Actor',
    bibliography: [
      { type: 'work', title: 'Roman Holiday', year: 1953 },
      { type: 'work', title: "Breakfast at Tiffany's", year: 1961 },
      { type: 'work', title: 'My Fair Lady', year: 1964 },
    ],
  },

  'marlon-brando': {
    nationality: 'usa',
    birthDate: '1924-04-03',
    birthCity: 'Omaha, Nebraska',
    mainProfession: 'Actor',
    bibliography: [
      { type: 'work', title: 'A Streetcar Named Desire', year: 1951 },
      { type: 'work', title: 'The Godfather', year: 1972 },
      { type: 'work', title: 'Apocalypse Now', year: 1979 },
    ],
  },

  'charlie-chaplin': {
    nationality: 'uk',
    birthDate: '1889-04-16',
    birthCity: 'Walworth, London',
    mainProfession: 'Actor',
    bibliography: [
      { type: 'work', title: 'City Lights', year: 1931 },
      { type: 'work', title: 'Modern Times', year: 1936 },
      { type: 'work', title: 'The Great Dictator', year: 1940 },
    ],
  },

  'arnold-schwarzenegger': {
    nationality: 'austria',
    birthDate: '1947-07-30',
    birthCity: 'Thal, Styria',
    mainProfession: 'Actor',
    bibliography: [
      { type: 'work', title: 'The Terminator', year: 1984 },
      { type: 'work', title: 'Predator', year: 1987 },
      { type: 'work', title: 'Total Recall', year: 1990 },
    ],
  },

  'julia-roberts': {
    nationality: 'usa',
    birthDate: '1967-10-28',
    birthCity: 'Smyrna, Georgia',
    mainProfession: 'Actor',
    bibliography: [
      { type: 'work', title: 'Pretty Woman', year: 1990 },
      { type: 'work', title: "My Best Friend's Wedding", year: 1997 },
      { type: 'work', title: 'Erin Brockovich', year: 2000 },
    ],
  },

  'leonardo-dicaprio': {
    nationality: 'usa',
    birthDate: '1974-11-11',
    birthCity: 'Los Angeles, California',
    mainProfession: 'Actor',
    bibliography: [
      { type: 'work', title: 'Titanic', year: 1997 },
      { type: 'work', title: 'The Aviator', year: 2004 },
      { type: 'work', title: 'Inception', year: 2010 },
    ],
  },

  'tom-cruise': {
    nationality: 'usa',
    birthDate: '1962-07-03',
    birthCity: 'Syracuse, New York',
    mainProfession: 'Actor',
    bibliography: [
      { type: 'work', title: 'Top Gun', year: 1986 },
      { type: 'work', title: 'Mission: Impossible', year: 1996 },
      { type: 'work', title: 'Jerry Maguire', year: 1996 },
    ],
  },

  'meryl-streep': {
    nationality: 'usa',
    birthDate: '1949-06-22',
    birthCity: 'Summit, New Jersey',
    mainProfession: 'Actor',
    bibliography: [
      { type: 'work', title: 'Kramer vs. Kramer', year: 1979 },
      { type: 'work', title: "Sophie's Choice", year: 1982 },
      { type: 'work', title: 'The Devil Wears Prada', year: 2006 },
    ],
  },

  // ── ATHLETES ─────────────────────────────────────────────────────────────

  'michael-jordan': {
    nationality: 'usa',
    birthDate: '1963-02-17',
    birthCity: 'Brooklyn, New York',
    mainProfession: 'Basketball player',
    bibliography: [
      { type: 'club', name: 'Chicago Bulls', from: 1984, to: 1998 },
      { type: 'work', title: '6× NBA Championship', year: 1991 },
      { type: 'work', title: '2× Olympic gold medal', year: 1984 },
    ],
  },

  'pele': {
    nationality: 'brazil',
    birthDate: '1940-10-23',
    birthCity: 'Três Corações',
    mainProfession: 'Football player',
    bibliography: [
      { type: 'club', name: 'Santos FC', from: 1956, to: 1974 },
      { type: 'club', name: 'New York Cosmos', from: 1975, to: 1977 },
      { type: 'national', caps: 92 },
    ],
  },

  'diego-maradona': {
    nationality: 'argentina',
    birthDate: '1960-10-30',
    birthCity: 'Lanús, Buenos Aires',
    mainProfession: 'Football player',
    bibliography: [
      { type: 'club', name: 'Napoli', from: 1984, to: 1991 },
      { type: 'club', name: 'Barcelona', from: 1982, to: 1984 },
      { type: 'national', caps: 91 },
    ],
  },

  'muhammad-ali': {
    nationality: 'usa',
    birthDate: '1942-01-17',
    birthCity: 'Louisville, Kentucky',
    mainProfession: 'Boxer',
    bibliography: [
      { type: 'work', title: 'World Heavyweight Champion', year: 1964 },
      { type: 'work', title: 'Rumble in the Jungle', year: 1974 },
      { type: 'work', title: 'Thrilla in Manila', year: 1975 },
    ],
  },

  'zlatan-ibrahimovic': {
    nationality: 'sweden',
    birthDate: '1981-10-03',
    birthCity: 'Malmö',
    mainProfession: 'Football player',
    bibliography: [
      { type: 'club', name: 'Paris Saint-Germain', from: 2012, to: 2016 },
      { type: 'club', name: 'Manchester United', from: 2016, to: 2018 },
      { type: 'national', caps: 116 },
    ],
  },

  'cristiano-ronaldo': {
    nationality: 'portugal',
    birthDate: '1985-02-05',
    birthCity: 'Funchal',
    mainProfession: 'Football player',
    bibliography: [
      { type: 'club', name: 'Manchester United', from: 2003, to: 2009 },
      { type: 'club', name: 'Real Madrid', from: 2009, to: 2018 },
      { type: 'national', caps: 205 },
    ],
  },

  'lionel-messi': {
    nationality: 'argentina',
    birthDate: '1987-06-24',
    birthCity: 'Rosario',
    mainProfession: 'Football player',
    bibliography: [
      { type: 'club', name: 'FC Barcelona', from: 2003, to: 2021 },
      { type: 'club', name: 'Inter Miami', from: 2023 },
      { type: 'national', caps: 180 },
    ],
  },

  'serena-williams': {
    nationality: 'usa',
    birthDate: '1981-09-26',
    birthCity: 'Saginaw, Michigan',
    mainProfession: 'Tennis player',
    bibliography: [
      { type: 'work', title: '23 Grand Slam singles titles', year: 1999 },
      { type: 'work', title: 'US Open debut victory', year: 1999 },
      { type: 'work', title: 'Olympic singles gold medal', year: 2012 },
    ],
  },

  'usain-bolt': {
    nationality: 'jamaica',
    birthDate: '1986-08-21',
    birthCity: 'Sherwood Content',
    mainProfession: 'Sprinter',
    bibliography: [
      { type: 'work', title: '100m World Record: 9.58s', year: 2009 },
      { type: 'work', title: 'Olympic triple-triple champion', year: 2016 },
      { type: 'work', title: '8× Olympic gold medals', year: 2008 },
    ],
  },

  'roger-federer': {
    nationality: 'switzerland',
    birthDate: '1981-08-08',
    birthCity: 'Basel',
    mainProfession: 'Tennis player',
    bibliography: [
      { type: 'work', title: '20 Grand Slam titles', year: 2003 },
      { type: 'work', title: 'Wimbledon Champion (8 times)', year: 2003 },
      { type: 'work', title: 'World No.1 for 310 weeks', year: 2004 },
    ],
  },

};

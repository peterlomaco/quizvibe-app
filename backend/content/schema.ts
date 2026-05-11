import { z } from 'zod';

// Fem generations-grupper enligt QuizVibes namn-svarsmodell.
// Silent Generation och Baby Boomers är ihopslagna till "elder" eftersom
// de utgör en enskild kunskaps-grupp i namn-modellens generations-avståndsregel.
export const GenerationSchema = z.enum([
  'elder',         // Silent Generation + Baby Boomers (1925-1964)
  'gen-x',         // 1965-1980
  'millennials',   // 1981-1996
  'gen-z',         // 1997-2012
  'gen-alpha',     // 2013-2028
]);
export type Generation = z.infer<typeof GenerationSchema>;

// Audience = en konkret generation eller 'all' (relevant för alla).
export const AudienceSchema = z.union([
  GenerationSchema,
  z.literal('all'),
]);
export type Audience = z.infer<typeof AudienceSchema>;

export const CategorySchema = z.enum(['persons', 'capitals', 'artists', 'songs']);
export type Category = z.infer<typeof CategorySchema>;

export const SensitivitySchema = z.enum(['standard', 'sensitive']);
export type Sensitivity = z.infer<typeof SensitivitySchema>;

// Svarsmodell per item.
// - 'timeline'      = Når-frågan ("Vilket år föddes/bildades X?") — kräver correctYear.
// - 'name-letters'  = Namn-svarsmodellen (Letter Grid + Final Selection)
//                     — kräver bara displayName.
// Ett item kan stödja båda; spel-logiken väljer per fråga.
export const AnswerMethodSchema = z.enum(['timeline', 'name-letters']);
export type AnswerMethod = z.infer<typeof AnswerMethodSchema>;

// Pre-curerat YouTube-klipp som kan användas som frågans media istället
// för en bild. videoId är den 11-tecken långa YouTube-identifieraren
// (t.ex. "dQw4w9WgXcQ"). startSec/endSec definierar utdraget som spelas
// — typiskt 10–20s för låt-frågor. Klipp curera-väljs offline via
// `npm run youtube-search <item-id>` och valideras med `npm run youtube-validate`.
export const YoutubeClipSchema = z
  .object({
    videoId: z
      .string()
      .regex(
        /^[A-Za-z0-9_-]{11}$/,
        'videoId must be a 11-char YouTube id (A-Z, a-z, 0-9, _, -)',
      ),
    startSec: z.number().int().min(0),
    endSec: z.number().int().min(1),
    // Kanalnamn för audit ("Vevo", "BBC", verifierad artist-kanal).
    channelTitle: z.string().optional(),
    license: z.enum(['standard', 'creative-commons']).default('standard'),
    notes: z.string().optional(),
  })
  .refine((d) => d.endSec > d.startSec, {
    message: 'endSec must be greater than startSec',
  });
export type YoutubeClip = z.infer<typeof YoutubeClipSchema>;

// Media-källa per item — discriminerad union på `kind`.
// En källa per item: om "samma låt" finns på både YouTube och Spotify
// modelleras de som TVÅ separata items (inte ett item med flera sources).
// Förenklar deduplikation, lobby-filter och URL-validering — men spelaren
// kan se samma låt två gånger om båda källorna är aktiverade i en lobby.
const YoutubeMediaSchema = z.object({
  kind: z.literal('youtube'),
  videoId: z
    .string()
    .regex(
      /^[A-Za-z0-9_-]{11}$/,
      'videoId must be a 11-char YouTube id (A-Z, a-z, 0-9, _, -)',
    ),
  startSec: z.number().int().min(0),
  endSec: z.number().int().min(1),
  channelTitle: z.string().optional(),
  license: z.enum(['standard', 'creative-commons']).default('standard'),
  notes: z.string().optional(),
});

const SpotifyMediaSchema = z.object({
  kind: z.literal('spotify'),
  // Spotify track ID (22 base62-chars), från track-URI:n
  // (spotify:track:6rqhFgbbKwnb9MLmUQDhG6 → "6rqhFgbbKwnb9MLmUQDhG6").
  trackId: z
    .string()
    .regex(
      /^[A-Za-z0-9]{22}$/,
      'spotify trackId must be 22 base62 chars',
    ),
  // Optional klipp-fönster i millisekunder (Spotify Web Playback använder ms).
  // Om utelämnat spelas låten från 0 till antingen previewens slut (30s) eller
  // slut av track beroende på SDK-läge.
  startMs: z.number().int().min(0).optional(),
  endMs: z.number().int().min(1).optional(),
  notes: z.string().optional(),
});

const AiImageMediaSchema = z.object({
  kind: z.literal('ai-image'),
  // Slut-URL till hostad AI-genererad bild (CDN/objekt-storage).
  imageUrl: z.string().url(),
  // Pekare till prompt/seed/job-id för regenerering. Format öppet —
  // landar troligen som "<provider>:<job-id>" när AI-pipelinen kopplas in.
  promptId: z.string().optional(),
  notes: z.string().optional(),
});

export const MediaSourceSchema = z.discriminatedUnion('kind', [
  YoutubeMediaSchema,
  SpotifyMediaSchema,
  AiImageMediaSchema,
]);
export type MediaSource = z.infer<typeof MediaSourceSchema>;

export const ContentItemSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'id must be kebab-case (a-z, 0-9, hyphens)'),
  displayName: z.string().min(1),
  // Året som är "rätt svar" i timeline-frågan. Krävs om answerMethods
  // inkluderar 'timeline'. För personer: typiskt födelseår. För grupper:
  // formation-år. För fiktiva karaktärer: debutår (film/TV/spel).
  correctYear: z.number().int().min(-3000).max(2100).optional(),
  // Sannolikhet att en spelare i target-audience kan svara rätt (0-100).
  probability: z.number().int().min(0).max(100),
  // Söktermer för Wikimedia Commons. Mer specifika hint ger bättre träff.
  wikimediaSearchHints: z.array(z.string().min(1)).min(1),
  // Vilka svarsmetoder som är giltiga för detta item.
  answerMethods: z.array(AnswerMethodSchema).min(1),
  // Media-källa för item:t. Vid launch: YouTube + Spotify för musik (year-frågor),
  // ai-image för personer/platser (letter-frågor). Optional tills katalogen
  // migrerats — items utan media faller tillbaka till Wikimedia-pipeline.
  media: MediaSourceSchema.optional(),
  // @deprecated Använd `media` med `kind: 'youtube'` istället. Behålls
  // tills befintliga YAML-filer migrerats till nya media-formatet.
  // Refine längre ner blockerar kombinationen `media` + `youtubeClips`
  // så vi inte råkar ha båda samtidigt under transition-perioden.
  youtubeClips: z.array(YoutubeClipSchema).optional(),
  // Peak-recognition-fönster: åren då item:t var som mest känt. Driver
  // recognition-decay-funktionen tillsammans med `audience` (= generation).
  // - Musik: typiskt peakFrom = peakTo = produktionsåret (= correctYear).
  // - Personer: ett intervall (Cristiano Ronaldo: peakFrom=2008, peakTo=2018).
  // - Images (städer t.ex.): båda null — recognition är inte tids-bunden.
  peakFrom: z.number().int().min(-3000).max(2100).optional(),
  peakTo: z.number().int().min(-3000).max(2100).optional(),
  // 'sensitive' = motiv kräver extra omtanke vid bildval. Default-filtreras
  // bort av spel-API:t.
  sensitivity: SensitivitySchema.default('standard'),
  // Music question tagging (V1 launch — endast musik-items är aktiva).
  // Varje item måste signalera om det hör hemma i base-utbudet (alla
  // hostar får oavsett köpta paket) och/eller är knutet till ett eller
  // flera genre-Host-paket. Defaulten 'inBaseCatalog=true + genrePackages=[]'
  // = bakåt-kompatibel (alla existerande items hamnar i base utan att
  // någon YAML behöver röras). När en host aktiverar ett genre-paket
  // (t.ex. pkg-hiphop) ska items med matchande genrePackages[] addera
  // ovanpå base-poolen — items kan vara i båda eller bara genre.
  // OBS: generations-paket (pkg-gen-millennials etc.) använder INTE detta
  // fält — där härleds tillhörighet ur fil-nivåns `audience`-fält. Endast
  // genre-paket (pkg-hiphop, pkg-rock m.fl.) listas i `genrePackages`.
  // Se memory/project_music_question_tagging.md för fullständig spec.
  inBaseCatalog: z.boolean().default(true),
  genrePackages: z.array(z.string().min(1)).default([]),
  notes: z.string().optional(),
})
  .refine(
    (item) => !(item.media && item.youtubeClips),
    {
      message:
        'item cannot have both `media` and `youtubeClips` (legacy). Migrate the YAML to `media`.',
    },
  )
  .refine(
    (item) =>
      item.peakFrom === undefined ||
      item.peakTo === undefined ||
      item.peakTo >= item.peakFrom,
    { message: 'peakTo must be >= peakFrom' },
  )
  .refine(
    (item) => {
      if (item.media?.kind !== 'spotify') return true;
      if (item.media.startMs === undefined || item.media.endMs === undefined) {
        return true;
      }
      return item.media.endMs > item.media.startMs;
    },
    { message: 'spotify media endMs must be > startMs when both are set' },
  )
  .refine(
    (item) => {
      if (item.media?.kind !== 'youtube') return true;
      return item.media.endSec > item.media.startSec;
    },
    { message: 'youtube media endSec must be > startSec' },
  )
  .refine(
    (item) => item.inBaseCatalog || item.genrePackages.length > 0,
    {
      message:
        'item must be in base catalog (inBaseCatalog=true) and/or tagged with at least one genrePackages entry; orphan items (both empty) are not allowed',
    },
  );
export type ContentItem = z.infer<typeof ContentItemSchema>;

export const ContentFileSchema = z
  .object({
    audience: z.array(AudienceSchema).min(1),
    category: CategorySchema,
    items: z.array(ContentItemSchema).min(1),
  })
  .refine(
    (data) => {
      const ids = data.items.map((i) => i.id);
      return ids.length === new Set(ids).size;
    },
    { message: 'item ids must be unique within a file' },
  )
  .refine(
    (data) =>
      data.items.every(
        (i) =>
          !i.answerMethods.includes('timeline') || i.correctYear !== undefined,
      ),
    {
      message:
        'items with answerMethod "timeline" must have correctYear set',
    },
  );
export type ContentFile = z.infer<typeof ContentFileSchema>;

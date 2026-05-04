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

export const CategorySchema = z.enum(['persons', 'capitals', 'artists']);
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
  // 'sensitive' = motiv kräver extra omtanke vid bildval. Default-filtreras
  // bort av spel-API:t.
  sensitivity: SensitivitySchema.default('standard'),
  notes: z.string().optional(),
});
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

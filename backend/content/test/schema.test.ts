import { describe, it, expect } from 'vitest';
import { loadCatalog, findItemsForAudience, findItemsById } from '../registry';
import { ContentItemSchema, ContentFileSchema, YoutubeClipSchema } from '../schema';

describe('content catalog', () => {
  it('loads all yaml files without validation errors', () => {
    expect(() => loadCatalog()).not.toThrow();
  });

  it('default load contains active V1-categories post-purge + V2-parking', () => {
    const { files } = loadCatalog();
    const categories = new Set(
      Array.from(files.values()).map((f) => f.category),
    );
    expect(categories.has('artists')).toBe(true);
    expect(categories.has('songs')).toBe(true);
    expect(categories.has('actors')).toBe(true);
    expect(categories.has('sport')).toBe(true);
    // persons-* raderade vid politiker-purge:n (2026-05-21) — items
    // omkategoriserade till artists/actors/athletes eller strikna.
    expect(categories.has('persons')).toBe(false);
    // capitals (städer + länder) parkerade till deferred/ 2026-05-22 —
    // svår att definiera vilken generation som faktiskt kan dem. V2-task.
    expect(categories.has('capitals')).toBe(false);
  });

  it('deferred catalog opt-in flag fortfarande funktionellt (för framtida items)', () => {
    expect(() => loadCatalog(undefined, { includeDeferred: true })).not.toThrow();
  });

  it('every item has at least one wikimedia search hint', () => {
    const { files } = loadCatalog();
    for (const [filename, file] of files) {
      for (const item of file.items) {
        expect(
          item.wikimediaSearchHints.length,
          `${filename} :: ${item.id}`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it('every item has at least one answerMethod', () => {
    const { files } = loadCatalog();
    for (const [filename, file] of files) {
      for (const item of file.items) {
        expect(
          item.answerMethods.length,
          `${filename} :: ${item.id}`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it('items with timeline answerMethod have correctYear set', () => {
    const { files } = loadCatalog();
    for (const [filename, file] of files) {
      for (const item of file.items) {
        if (item.answerMethods.includes('timeline')) {
          expect(
            item.correctYear,
            `${filename} :: ${item.id} has timeline but no correctYear`,
          ).toBeDefined();
        }
      }
    }
  });

  it('every item probability is 0-100', () => {
    const { files } = loadCatalog();
    for (const [filename, file] of files) {
      for (const item of file.items) {
        expect(item.probability, `${filename} :: ${item.id}`).toBeGreaterThanOrEqual(0);
        expect(item.probability, `${filename} :: ${item.id}`).toBeLessThanOrEqual(100);
      }
    }
  });

  it('item ids are unique within each file', () => {
    const { files } = loadCatalog();
    for (const [filename, file] of files) {
      const ids = file.items.map((i) => i.id);
      expect(new Set(ids).size, `${filename} has duplicate ids`).toBe(ids.length);
    }
  });

  it('findItemsForAudience returns expected music matches', () => {
    const catalog = loadCatalog();
    const millennials = findItemsForAudience(catalog, 'millennials');
    expect(millennials.length).toBeGreaterThan(0);
    // Songs med audience='all' ska komma med också (universella låtar).
    const allCategories = new Set(
      millennials.map((m) => {
        const file = catalog.files.get(m.filename);
        return file?.category;
      }),
    );
    expect(allCategories.has('songs')).toBe(true);
  });

  it.skip('findItemsForAudience excludes sensitive items by default', () => {
    // SKIPPAD 2026-05-21 — sensitive-items (Hitler/Stalin) raderades vid
    // politiker-purge:n. Sensitivity-filter-logiken är fortfarande aktiv;
    // återinför testet med mock-catalog-fixture om regression upptäcks.
  });

  it.skip('findItemsForAudience includes sensitive items when explicitly requested', () => {
    // SKIPPAD 2026-05-21 — samma anledning som ovan.
  });

  it('findItemsById finds cross-audience figure via audience-array', () => {
    // Modern fotbollsstjärnor (Zlatan/Cristiano/Messi) ligger nu i ett
    // enskilt athletes-modern.yaml med audience-array ["millennials",
    // "gen-z", "gen-alpha"] istället för dupliceras över flera filer.
    // findItemsById ska hitta dem som single match.
    const catalog = loadCatalog();
    const zlatan = findItemsById(catalog, 'zlatan-ibrahimovic');
    expect(zlatan.length).toBe(1);
    const file = catalog.files.get(zlatan[0].filename);
    expect(file?.audience).toContain('millennials');
    expect(file?.audience).toContain('gen-z');
    expect(file?.audience).toContain('gen-alpha');
  });
});

describe('schema rejection', () => {
  it('rejects invalid id format', () => {
    const result = ContentItemSchema.safeParse({
      id: 'Has Spaces',
      displayName: 'Test',
      probability: 50,
      wikimediaSearchHints: ['Test'],
      answerMethods: ['name-letters'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects probability > 100', () => {
    const result = ContentItemSchema.safeParse({
      id: 'test',
      displayName: 'Test',
      probability: 150,
      wikimediaSearchHints: ['Test'],
      answerMethods: ['name-letters'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty wikimediaSearchHints', () => {
    const result = ContentItemSchema.safeParse({
      id: 'test',
      displayName: 'Test',
      probability: 50,
      wikimediaSearchHints: [],
      answerMethods: ['name-letters'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty answerMethods', () => {
    const result = ContentItemSchema.safeParse({
      id: 'test',
      displayName: 'Test',
      probability: 50,
      wikimediaSearchHints: ['Test'],
      answerMethods: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects file with timeline item missing correctYear', () => {
    const result = ContentFileSchema.safeParse({
      audience: ['millennials'],
      region: ['sweden'],
      category: 'persons',
      contentForm: 'image',
      contentSubject: 'cultural-person',
      items: [
        {
          id: 'no-year',
          displayName: 'No Year',
          probability: 50,
          wikimediaSearchHints: ['x'],
          answerMethods: ['timeline'],
          // correctYear saknas
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('accepts file with name-letters-only item without correctYear', () => {
    const result = ContentFileSchema.safeParse({
      audience: ['all'],
      region: ['sweden'],
      category: 'capitals',
      contentForm: 'image',
      contentSubject: 'city',
      items: [
        {
          id: 'somewhere',
          displayName: 'Somewhere',
          probability: 50,
          wikimediaSearchHints: ['x'],
          answerMethods: ['name-letters'],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('defaults inBaseCatalog=true and genrePackages=[] when fields omitted', () => {
    const result = ContentItemSchema.safeParse({
      id: 'untagged',
      displayName: 'Untagged',
      correctYear: 1990,
      probability: 50,
      wikimediaSearchHints: ['x'],
      answerMethods: ['timeline'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.inBaseCatalog).toBe(true);
      expect(result.data.genrePackages).toEqual([]);
    }
  });

  it('accepts item tagged with a genre package and base=true (cross-tagged)', () => {
    const result = ContentItemSchema.safeParse({
      id: 'eminem-like',
      displayName: 'Eminem-like',
      correctYear: 1972,
      probability: 90,
      wikimediaSearchHints: ['x'],
      answerMethods: ['timeline'],
      inBaseCatalog: true,
      genrePackages: ['pkg-hiphop'],
    });
    expect(result.success).toBe(true);
  });

  it('accepts item that is genre-only (not in base)', () => {
    const result = ContentItemSchema.safeParse({
      id: 'genre-only',
      displayName: 'Genre Only',
      correctYear: 1995,
      probability: 80,
      wikimediaSearchHints: ['x'],
      answerMethods: ['timeline'],
      inBaseCatalog: false,
      genrePackages: ['pkg-rock'],
    });
    expect(result.success).toBe(true);
  });

  it('accepts item with audience-override (single audience)', () => {
    const result = ContentItemSchema.safeParse({
      id: 'drifters-2026',
      displayName: 'Drifters 2026',
      correctYear: 2026,
      probability: 75,
      wikimediaSearchHints: ['Drifters dansband 2026'],
      answerMethods: ['timeline'],
      audience: ['elder'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.audience).toEqual(['elder']);
    }
  });

  it('accepts item with audience-override (multi-gen)', () => {
    const result = ContentItemSchema.safeParse({
      id: 'drifters-cross-gen',
      displayName: 'Cross-gen dansband',
      correctYear: 2026,
      probability: 80,
      wikimediaSearchHints: ['dansband'],
      answerMethods: ['timeline'],
      audience: ['elder', 'gen-x', 'millennials'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.audience).toEqual(['elder', 'gen-x', 'millennials']);
    }
  });

  it('audience is undefined when omitted (fil-fallback)', () => {
    const result = ContentItemSchema.safeParse({
      id: 'no-override',
      displayName: 'Inherits from file',
      correctYear: 1990,
      probability: 60,
      wikimediaSearchHints: ['x'],
      answerMethods: ['timeline'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.audience).toBeUndefined();
    }
  });

  it('rejects empty audience-override array', () => {
    const result = ContentItemSchema.safeParse({
      id: 'empty-aud',
      displayName: 'Empty',
      correctYear: 1990,
      probability: 50,
      wikimediaSearchHints: ['x'],
      answerMethods: ['timeline'],
      audience: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects orphan item (not in base and no genre packages)', () => {
    const result = ContentItemSchema.safeParse({
      id: 'orphan',
      displayName: 'Orphan',
      correctYear: 1990,
      probability: 50,
      wikimediaSearchHints: ['x'],
      answerMethods: ['timeline'],
      inBaseCatalog: false,
      genrePackages: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects duplicate item ids in a file', () => {
    const result = ContentFileSchema.safeParse({
      audience: ['millennials'],
      region: ['sweden'],
      category: 'persons',
      contentForm: 'image',
      contentSubject: 'cultural-person',
      items: [
        {
          id: 'dup',
          displayName: 'A',
          probability: 50,
          wikimediaSearchHints: ['a'],
          answerMethods: ['name-letters'],
        },
        {
          id: 'dup',
          displayName: 'B',
          probability: 50,
          wikimediaSearchHints: ['b'],
          answerMethods: ['name-letters'],
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects file where contentSubject does not belong to contentForm', () => {
    // 'song' är ett youtube-subject — kombineras det med form='image' ska
    // refinen från matrisen avvisa filen.
    const result = ContentFileSchema.safeParse({
      audience: ['all'],
      region: ['sweden'],
      category: 'songs',
      contentForm: 'image',
      contentSubject: 'song',
      items: [
        {
          id: 'test',
          displayName: 'Test',
          probability: 50,
          wikimediaSearchHints: ['x'],
          answerMethods: ['name-letters'],
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('accepts all matrix-valid form/subject pairs', () => {
    // Spegla SUBJECTS_BY_FORM från schema.ts så testet failar om någon
    // ny subject läggs till utan att matrisen uppdateras parallellt.
    const validPairs: Array<{ form: 'youtube' | 'image'; subject: string }> = [
      { form: 'youtube', subject: 'song' },
      { form: 'youtube', subject: 'movie' },
      { form: 'youtube', subject: 'sport-event' },
      { form: 'image', subject: 'artist' },
      { form: 'image', subject: 'band' },
      { form: 'image', subject: 'actor' },
      { form: 'image', subject: 'character' },
      { form: 'image', subject: 'athlete' },
      { form: 'image', subject: 'cultural-person' },
      { form: 'image', subject: 'celebrity' },
      { form: 'image', subject: 'city' },
      { form: 'image', subject: 'country' },
      { form: 'image', subject: 'place' },
    ];
    for (const { form, subject } of validPairs) {
      const result = ContentFileSchema.safeParse({
        audience: ['all'],
        region: ['sweden'],
        category: 'persons',
        contentForm: form,
        contentSubject: subject,
        items: [
          {
            id: `test-${subject}`,
            displayName: 'Test',
            probability: 50,
            wikimediaSearchHints: ['x'],
            answerMethods: ['name-letters'],
          },
        ],
      });
      expect(result.success, `${form}/${subject} should be valid`).toBe(true);
    }
  });
});

describe('YoutubeClipSchema', () => {
  it('accepts a minimal valid clip', () => {
    const result = YoutubeClipSchema.safeParse({
      videoId: 'dQw4w9WgXcQ',
      startSec: 30,
      endSec: 45,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.license).toBe('standard');
    }
  });

  it('accepts a fully populated clip with creative-commons license', () => {
    const result = YoutubeClipSchema.safeParse({
      videoId: 'abcDEF12345',
      startSec: 0,
      endSec: 15,
      channelTitle: 'Vevo',
      license: 'creative-commons',
      notes: 'Official upload',
    });
    expect(result.success).toBe(true);
  });

  it('rejects videoId with wrong length', () => {
    const tooShort = YoutubeClipSchema.safeParse({
      videoId: 'short',
      startSec: 0,
      endSec: 10,
    });
    expect(tooShort.success).toBe(false);

    const tooLong = YoutubeClipSchema.safeParse({
      videoId: 'dQw4w9WgXcQXX',
      startSec: 0,
      endSec: 10,
    });
    expect(tooLong.success).toBe(false);
  });

  it('rejects videoId with invalid characters', () => {
    const result = YoutubeClipSchema.safeParse({
      videoId: 'has spaces!',
      startSec: 0,
      endSec: 10,
    });
    expect(result.success).toBe(false);
  });

  it('rejects endSec equal to startSec', () => {
    const result = YoutubeClipSchema.safeParse({
      videoId: 'dQw4w9WgXcQ',
      startSec: 30,
      endSec: 30,
    });
    expect(result.success).toBe(false);
  });

  it('rejects endSec less than startSec', () => {
    const result = YoutubeClipSchema.safeParse({
      videoId: 'dQw4w9WgXcQ',
      startSec: 60,
      endSec: 45,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative startSec', () => {
    const result = YoutubeClipSchema.safeParse({
      videoId: 'dQw4w9WgXcQ',
      startSec: -1,
      endSec: 10,
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer seconds', () => {
    const result = YoutubeClipSchema.safeParse({
      videoId: 'dQw4w9WgXcQ',
      startSec: 30.5,
      endSec: 45,
    });
    expect(result.success).toBe(false);
  });
});

describe('ContentItem with youtubeClips', () => {
  it('accepts an item without youtubeClips (backwards compatible)', () => {
    const result = ContentItemSchema.safeParse({
      id: 'no-clips',
      displayName: 'Plain Item',
      correctYear: 1990,
      probability: 50,
      wikimediaSearchHints: ['x'],
      answerMethods: ['timeline'],
    });
    expect(result.success).toBe(true);
  });

  it('accepts an item with one youtube clip', () => {
    const result = ContentItemSchema.safeParse({
      id: 'with-clip',
      displayName: 'Clip Item',
      correctYear: 1990,
      probability: 50,
      wikimediaSearchHints: ['x'],
      answerMethods: ['timeline'],
      youtubeClips: [
        { videoId: 'dQw4w9WgXcQ', startSec: 30, endSec: 45 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('accepts an item with multiple youtube clips', () => {
    const result = ContentItemSchema.safeParse({
      id: 'multi-clip',
      displayName: 'Multi',
      correctYear: 1990,
      probability: 50,
      wikimediaSearchHints: ['x'],
      answerMethods: ['timeline'],
      youtubeClips: [
        { videoId: 'dQw4w9WgXcQ', startSec: 30, endSec: 45 },
        { videoId: 'oHg5SJYRHA0', startSec: 0, endSec: 20, channelTitle: 'Vevo' },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects an item where any youtube clip is invalid', () => {
    const result = ContentItemSchema.safeParse({
      id: 'bad-clip',
      displayName: 'Bad',
      correctYear: 1990,
      probability: 50,
      wikimediaSearchHints: ['x'],
      answerMethods: ['timeline'],
      youtubeClips: [
        { videoId: 'dQw4w9WgXcQ', startSec: 30, endSec: 45 },
        { videoId: 'invalid!', startSec: 0, endSec: 10 },
      ],
    });
    expect(result.success).toBe(false);
  });
});

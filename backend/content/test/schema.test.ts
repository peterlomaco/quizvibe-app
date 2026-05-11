import { describe, it, expect } from 'vitest';
import { loadCatalog, findItemsForAudience, findItemsById } from '../registry';
import { ContentItemSchema, ContentFileSchema, YoutubeClipSchema } from '../schema';

describe('content catalog', () => {
  it('loads all yaml files without validation errors', () => {
    expect(() => loadCatalog()).not.toThrow();
  });

  it('default load contains music-only categories (V1 launch scope)', () => {
    const { files } = loadCatalog();
    const categories = new Set(
      Array.from(files.values()).map((f) => f.category),
    );
    expect(categories.has('artists')).toBe(true);
    expect(categories.has('songs')).toBe(true);
    // persons + capitals flyttade till deferred/ — inte aktiva i V1.
    expect(categories.has('persons')).toBe(false);
    expect(categories.has('capitals')).toBe(false);
  });

  it('deferred catalog still validates against schema when opted-in', () => {
    expect(() => loadCatalog(undefined, { includeDeferred: true })).not.toThrow();
    const { files } = loadCatalog(undefined, { includeDeferred: true });
    const categories = new Set(
      Array.from(files.values()).map((f) => f.category),
    );
    expect(categories.has('persons')).toBe(true);
    expect(categories.has('capitals')).toBe(true);
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

  it('findItemsForAudience excludes sensitive items by default (deferred opt-in)', () => {
    // Sensitive items (Hitler/Stalin) ligger i persons-* som flyttats till
    // deferred/. Vi måste opt-in:a för att se dem alls; default-vyn har redan
    // ingen exponering av dessa.
    const catalog = loadCatalog(undefined, { includeDeferred: true });
    const elder = findItemsForAudience(catalog, 'elder');
    const ids = elder.map((m) => m.item.id);
    expect(ids).not.toContain('adolf-hitler');
    expect(ids).not.toContain('josef-stalin');
  });

  it('findItemsForAudience includes sensitive items when explicitly requested', () => {
    const catalog = loadCatalog(undefined, { includeDeferred: true });
    const elder = findItemsForAudience(catalog, 'elder', {
      excludeSensitive: false,
    });
    const ids = elder.map((m) => m.item.id);
    expect(ids).toContain('adolf-hitler');
    expect(ids).toContain('josef-stalin');
  });

  it('findItemsById finds known cross-audience figures in deferred catalog', () => {
    // Zlatan finns i Peters listor under millennials OCH gen-z (båda i persons-*
    // som ligger i deferred/ — post-V1-release).
    const catalog = loadCatalog(undefined, { includeDeferred: true });
    const zlatan = findItemsById(catalog, 'zlatan-ibrahimovic');
    expect(zlatan.length).toBeGreaterThanOrEqual(2);
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
      category: 'persons',
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
      category: 'capitals',
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
      category: 'persons',
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

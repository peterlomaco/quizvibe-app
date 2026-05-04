import { describe, it, expect } from 'vitest';
import { loadCatalog, findItemsForAudience, findItemsById } from '../registry';
import { ContentItemSchema, ContentFileSchema } from '../schema';

describe('content catalog', () => {
  it('loads all yaml files without validation errors', () => {
    expect(() => loadCatalog()).not.toThrow();
  });

  it('contains at least one persons, capitals, and artists file', () => {
    const { files } = loadCatalog();
    const categories = new Set(
      Array.from(files.values()).map((f) => f.category),
    );
    expect(categories.has('persons')).toBe(true);
    expect(categories.has('capitals')).toBe(true);
    expect(categories.has('artists')).toBe(true);
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

  it('findItemsForAudience returns expected matches', () => {
    const catalog = loadCatalog();
    const millennials = findItemsForAudience(catalog, 'millennials');
    expect(millennials.length).toBeGreaterThan(0);
    // Capitals med audience='all' ska komma med också
    const allCategories = new Set(
      millennials.map((m) => {
        const file = catalog.files.get(m.filename);
        return file?.category;
      }),
    );
    expect(allCategories.has('capitals')).toBe(true);
  });

  it('findItemsForAudience excludes sensitive items by default', () => {
    const catalog = loadCatalog();
    const elder = findItemsForAudience(catalog, 'elder');
    const ids = elder.map((m) => m.item.id);
    expect(ids).not.toContain('adolf-hitler');
    expect(ids).not.toContain('josef-stalin');
  });

  it('findItemsForAudience includes sensitive items when explicitly requested', () => {
    const catalog = loadCatalog();
    const elder = findItemsForAudience(catalog, 'elder', {
      excludeSensitive: false,
    });
    const ids = elder.map((m) => m.item.id);
    expect(ids).toContain('adolf-hitler');
    expect(ids).toContain('josef-stalin');
  });

  it('findItemsById finds known cross-audience figures', () => {
    const catalog = loadCatalog();
    // Zlatan finns i Peters listor under millennials OCH gen-z
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

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { ContentFile, ContentFileSchema, ContentItem, Audience } from './schema';

const CATALOG_DIR = path.join(__dirname, 'catalog');

export interface LoadedCatalog {
  /** filename → parsed file content */
  files: Map<string, ContentFile>;
}

export function loadCatalog(catalogDir: string = CATALOG_DIR): LoadedCatalog {
  const filenames = fs
    .readdirSync(catalogDir)
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
    .sort();

  const files = new Map<string, ContentFile>();

  for (const filename of filenames) {
    const fullPath = path.join(catalogDir, filename);
    const raw = fs.readFileSync(fullPath, 'utf8');
    let parsed: unknown;
    try {
      parsed = yaml.load(raw);
    } catch (err) {
      throw new Error(
        `Failed to parse YAML in ${filename}: ${(err as Error).message}`,
      );
    }
    const result = ContentFileSchema.safeParse(parsed);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
        .join('\n');
      throw new Error(`Invalid catalog file ${filename}:\n${issues}`);
    }
    files.set(filename, result.data);
  }

  return { files };
}

export interface AudienceQueryOptions {
  /**
   * Exkludera items som är märkta `sensitivity: 'sensitive'`.
   * Default `true` — fail-safe så nya call-sites inte oavsiktligt exponerar
   * känsliga motiv. Sätt explicit `false` i admin-verktyg som behöver se
   * full katalog (t.ex. för manuell granskning).
   */
  excludeSensitive?: boolean;
}

/**
 * Hämta alla items som är relevanta för en given audience.
 * 'all'-filer matchar alla audiences. Items som förekommer i flera filer
 * (t.ex. Zlatan i både millennials- och gen-z-filerna) returneras som
 * separata träffar — admin-flowet ser då fil-kontexten.
 */
export function findItemsForAudience(
  catalog: LoadedCatalog,
  audience: Audience,
  options: AudienceQueryOptions = {},
): Array<{ filename: string; item: ContentItem }> {
  const { excludeSensitive = true } = options;
  const matches: Array<{ filename: string; item: ContentItem }> = [];
  for (const [filename, file] of catalog.files) {
    const matches_audience =
      file.audience.includes(audience) || file.audience.includes('all');
    if (!matches_audience) continue;
    for (const item of file.items) {
      if (excludeSensitive && item.sensitivity === 'sensitive') continue;
      matches.push({ filename, item });
    }
  }
  return matches;
}

/** Hitta alla förekomster av en specifik item-id. */
export function findItemsById(
  catalog: LoadedCatalog,
  id: string,
): Array<{ filename: string; item: ContentItem }> {
  const matches: Array<{ filename: string; item: ContentItem }> = [];
  for (const [filename, file] of catalog.files) {
    const item = file.items.find((i) => i.id === id);
    if (item) matches.push({ filename, item });
  }
  return matches;
}

// CLI: kör `npx tsx content/registry.ts` för att validera hela katalogen.
if (require.main === module) {
  try {
    const catalog = loadCatalog();
    let totalItems = 0;
    for (const file of catalog.files.values()) totalItems += file.items.length;
    console.log(
      `Catalog loaded: ${catalog.files.size} files, ${totalItems} items.`,
    );
    for (const [filename, file] of catalog.files) {
      console.log(
        `  ${filename}  (${file.category}, audience=[${file.audience.join(',')}], ${file.items.length} items)`,
      );
    }
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }
}

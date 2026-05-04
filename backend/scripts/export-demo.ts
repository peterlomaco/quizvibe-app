// Genererar src/utils/nameQuizDemo.ts med några förgenererade testfrågor
// (Letter Grid + Final Selection per prefix-knapp + Wikipedia-bild-URL).
//
// Spelar-profil för demon: född 1990 (Millennials), intermediate skill.
//
// Kör: npm run export-demo

import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { loadCatalog, findItemsById } from '../content/registry';
import { Category, ContentItem } from '../content/schema';
import { getLetterGridConfig, SkillLevel } from '../content/generation';
import {
  buildLetterGrid,
  buildNameOptions,
  getPrefixForItem,
  PrefixOption,
  NameOption,
} from '../content/distractors';
import { findWikipediaPageImage } from '../wikimedia/client';
import { fetchImage } from '../wikimedia/processor';

// Pixel-stages för progressive reveal — bredd i pixlar (innan upscale).
// Stage 0 = mest pixlad, sista index = original-URL (skarp).
const PIXELATION_STAGE_WIDTHS = [32, 64, 128, 256];
// Storlek vi upskalar varje pixlad version till. Större = tydligare blocks
// i mediaCard, men större filer i demo-datan.
const UPSCALE_WIDTH = 640;

const EXAMPLE_PROFILE = {
  birthYear: 1990,
  skill: 'intermediate' as SkillLevel,
  generation: 'millennials' as const,
};

const ITEMS_TO_INCLUDE = [
  'astrid-lindgren',
  'stockholm',
  'cristiano-ronaldo',
];

interface DemoQuestion {
  id: string;
  displayName: string;
  category: Category;
  questionText: string;
  imageUrl: string;
  thumbnailUrl: string;
  /** Pixel-stages för progressive reveal: URLer i ordning pixlad → skarp. */
  pixelationStages: string[];
  attribution: {
    source: 'wikimedia';
    license: string;
    artist: string | null;
    sourceUrl: string;
  };
  prefixLength: number;
  letterGrid: PrefixOption[];
  optionsByPrefix: Record<string, NameOption[]>;
  correctPrefix: string;
}

function questionTextFor(category: Category): string {
  switch (category) {
    case 'persons':
      return 'What is the name of this person?';
    case 'capitals':
      return 'What is the name of this place?';
    case 'artists':
      return 'What is the name of this artist?';
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function buildQuestion(
  filename: string,
  item: ContentItem,
  fileAudience: readonly string[],
  fileCategory: Category,
): Promise<DemoQuestion | null> {
  console.log(`  Looking up Wikipedia pageimage for ${item.id}…`);
  const wiki = await findWikipediaPageImage(item.wikimediaSearchHints[0], {
    lang: 'en',
  });
  if (!wiki) {
    console.warn(`  No Wikipedia pageimage found — skipping ${item.id}`);
    return null;
  }

  const catalog = loadCatalog();
  const config = getLetterGridConfig({
    playerBirthYear: EXAMPLE_PROFILE.birthYear,
    playerSkill: EXAMPLE_PROFILE.skill,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    itemAudience: fileAudience as any,
  });

  // Demo förutsätter prefix-mode (ingen full-names-fallback i denna iteration).
  const prefixLength = config.mode === 'prefix' ? config.length : 2;

  const letterGrid = buildLetterGrid({
    catalog,
    category: fileCategory,
    playerGeneration: EXAMPLE_PROFILE.generation,
    correctItem: item,
    prefixLength,
  });

  const correctPrefix = getPrefixForItem(item.displayName, prefixLength);

  const optionsByPrefix: Record<string, NameOption[]> = {};
  for (const opt of letterGrid) {
    optionsByPrefix[opt.prefix] = buildNameOptions({
      catalog,
      category: fileCategory,
      playerGeneration: EXAMPLE_PROFILE.generation,
      correctItem: item,
      selectedPrefix: opt.prefix,
      prefixLength,
    });
  }

  // Generera pre-pixlade bilder via sharp med nearest-neighbor kernel
  // (bevarar pixel-blocks). Konvertera till data-URI så klienten kan rendera
  // utan extra fetch. Sista stage = original-URL:en (skarp).
  console.log(`  Generating pixelated stages…`);
  const inputBuffer = await fetchImage(wiki.url);
  const meta = await sharp(inputBuffer).metadata();
  const aspect = (meta.width ?? 1) / (meta.height ?? 1);
  const upscaleHeight = Math.round(UPSCALE_WIDTH / aspect);

  const pixelatedStages: string[] = [];
  for (const w of PIXELATION_STAGE_WIDTHS) {
    const h = Math.max(1, Math.round(w / aspect));
    // Sharp ignorerar andra resize() på samma pipeline — vi måste köra
    // downscale och upscale i två separata sharp-instanser.
    const downscaled = await sharp(inputBuffer)
      .resize(w, h, { kernel: sharp.kernel.nearest })
      .png()
      .toBuffer();
    const buffer = await sharp(downscaled)
      .resize(UPSCALE_WIDTH, upscaleHeight, { kernel: sharp.kernel.nearest })
      .jpeg({ quality: 75 })
      .toBuffer();
    pixelatedStages.push(`data:image/jpeg;base64,${buffer.toString('base64')}`);
  }
  const pixelationStages = [...pixelatedStages, wiki.url];

  return {
    id: item.id,
    displayName: item.displayName,
    category: fileCategory,
    questionText: questionTextFor(fileCategory),
    imageUrl: wiki.url,
    thumbnailUrl: wiki.thumbnailUrl,
    pixelationStages,
    attribution: {
      source: 'wikimedia',
      license: wiki.license ?? 'unknown',
      artist: wiki.artist,
      sourceUrl: wiki.descriptionUrl,
    },
    prefixLength,
    letterGrid,
    optionsByPrefix,
    correctPrefix,
  };
}

function renderTsModule(questions: DemoQuestion[]): string {
  return `// Auto-generated demo data. Regenerate with: cd backend && npm run export-demo
// Player profile used: born ${EXAMPLE_PROFILE.birthYear} (${EXAMPLE_PROFILE.generation}), ${EXAMPLE_PROFILE.skill} skill.

export interface DemoAttribution {
  source: 'wikimedia';
  license: string;
  artist: string | null;
  sourceUrl: string;
}

export interface DemoPrefixOption {
  prefix: string;
  isCorrect: boolean;
}

export interface DemoNameOption {
  itemId: string;
  displayName: string;
  isCorrect: boolean;
  source: 'catalog' | 'pool';
}

export interface DemoQuestion {
  id: string;
  displayName: string;
  category: 'persons' | 'capitals' | 'artists';
  questionText: string;
  imageUrl: string;
  thumbnailUrl: string;
  /** Pixel-stages för progressive reveal: URLer i ordning pixlad → skarp. */
  pixelationStages: string[];
  attribution: DemoAttribution;
  prefixLength: number;
  letterGrid: DemoPrefixOption[];
  optionsByPrefix: Record<string, DemoNameOption[]>;
  correctPrefix: string;
}

export const DEMO_QUESTIONS: DemoQuestion[] = ${JSON.stringify(questions, null, 2)};
`;
}

async function main(): Promise<void> {
  const catalog = loadCatalog();
  const questions: DemoQuestion[] = [];

  for (const id of ITEMS_TO_INCLUDE) {
    console.log(`\nProcessing ${id}…`);
    const matches = findItemsById(catalog, id);
    if (matches.length === 0) {
      console.warn(`  Item not found in catalog: ${id} — skipping`);
      continue;
    }
    const { filename, item } = matches[0];
    const file = catalog.files.get(filename)!;

    const q = await buildQuestion(filename, item, file.audience, file.category);
    if (q) questions.push(q);
    await sleep(220);
  }

  const outputPath = path.join(
    __dirname,
    '..',
    '..',
    'src',
    'utils',
    'nameQuizDemo.ts',
  );
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.promises.writeFile(outputPath, renderTsModule(questions));
  console.log(`\nWrote ${questions.length} questions to ${outputPath}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});

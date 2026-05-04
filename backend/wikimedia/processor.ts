// Bildhämtnings + WebP-konverterings-pipeline.
// Tar URL → laddar ner → resize till max 1280×720 (behåller aspect ratio)
// → WebP @ q85. Pure async funktioner; CLI-orchestration ligger i process.ts.

import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const USER_AGENT = 'QuizVibeBackend/0.1 (development; mailto:dev@quizvibe.local)';

export interface ProcessOptions {
  /** Max bredd i pixlar. Default 1280. */
  maxWidth?: number;
  /** Max höjd i pixlar. Default 720. */
  maxHeight?: number;
  /** WebP-kvalitet 0-100. Default 85. */
  quality?: number;
}

export interface ProcessResult {
  buffer: Buffer;
  width: number;
  height: number;
  /** Filstorlek i bytes */
  size: number;
  format: 'webp';
  /** Originalets dimensioner före resize */
  original: { width: number; height: number; size: number };
}

/**
 * Hämta en bild från URL och returnera dess Buffer.
 * Inga retries — vid misslyckande kasta error.
 */
export async function fetchImage(
  url: string,
  fetchFn: typeof fetch = fetch,
): Promise<Buffer> {
  const resp = await fetchFn(url, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!resp.ok) {
    throw new Error(
      `Image fetch failed: ${resp.status} ${resp.statusText} for ${url}`,
    );
  }
  const arr = await resp.arrayBuffer();
  return Buffer.from(arr);
}

/**
 * Konvertera en input-bild (vilket format som helst som sharp stödjer) till
 * WebP @ q85 och resize till max maxWidth×maxHeight (default 1280×720).
 *
 * Aspect ratio bevaras (`fit: 'inside'`) — bilder som är 1:1 letterboxas
 * av klienten enligt plan, inte här.
 *
 * `withoutEnlargement: true` betyder små bilder skalas inte upp; vi behåller
 * deras egna mått.
 */
export async function processImage(
  input: Buffer,
  options: ProcessOptions = {},
): Promise<ProcessResult> {
  const { maxWidth = 1280, maxHeight = 720, quality = 85 } = options;

  const originalMeta = await sharp(input).metadata();

  const buffer = await sharp(input)
    .resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality })
    .toBuffer();

  const outMeta = await sharp(buffer).metadata();

  return {
    buffer,
    width: outMeta.width ?? 0,
    height: outMeta.height ?? 0,
    size: buffer.length,
    format: 'webp',
    original: {
      width: originalMeta.width ?? 0,
      height: originalMeta.height ?? 0,
      size: input.length,
    },
  };
}

/** Spara en processed-buffer till disk. Skapar parent-folders om nödvändigt. */
export async function saveProcessedImage(
  buffer: Buffer,
  outputPath: string,
): Promise<void> {
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.promises.writeFile(outputPath, buffer);
}

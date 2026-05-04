// Loader för distractor-pool.yaml — fallback-namn när katalog-poolen är
// för tunn för att fylla Letter Grid eller Final Selection.

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { z } from 'zod';
import { Category } from './schema';

const POOL_PATH = path.join(__dirname, 'distractor-pool.yaml');

const PoolSchema = z.object({
  names: z.object({
    persons: z.array(z.string().min(1)).min(1),
    capitals: z.array(z.string().min(1)).min(1),
    artists: z.array(z.string().min(1)).min(1),
  }),
});

export interface DistractorPool {
  names: Record<Category, string[]>;
}

let cached: DistractorPool | null = null;

export function loadDistractorPool(poolPath: string = POOL_PATH): DistractorPool {
  if (cached) return cached;
  const raw = fs.readFileSync(poolPath, 'utf8');
  const parsed = yaml.load(raw);
  const result = PoolSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `Invalid distractor-pool.yaml:\n${result.error.issues
        .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
        .join('\n')}`,
    );
  }
  cached = result.data;
  return cached;
}

/** Reset cache — endast för testning. */
export function resetDistractorPoolCache(): void {
  cached = null;
}

/** Generera ett stabilt fake-id från ett pool-namn. */
export function poolNameToId(name: string): string {
  return (
    'pool:' +
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // strip combining diacritics
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  );
}

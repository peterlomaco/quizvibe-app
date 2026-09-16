/**
 * Shared song-insertion helpers for the Music.xlsx import (add-new-songs.ts +
 * acquire-song-years.ts). Builds catalog state, a fuzzy/slug duplicate guard, a
 * clean item block, and the CRLF-preserving append to songs-<era>.yaml.
 */
import { readFileSync, writeFileSync } from 'fs';
import * as path from 'path';
import { loadCatalog } from '../content/registry';
import { norm, parseDesc, slugify, CLIP_LEN, Era } from './music-import-lib';

export interface NewSong {
  title: string;
  artist: string;
  year: number;
  era: Era;
  spotifyTrackId?: string | null;
  ytClips?: { videoId: string; startSec: number }[];
  genrePackages?: string[];
  region?: string | null;
  inBaseCatalog?: string | null; // Excel string 'true'|'false'|null
  parentControlled?: boolean;
}

export const ERA_FILE: Record<Era, string> = {
  elder: 'songs-elder.yaml',
  'gen-x': 'songs-gen-x.yaml',
  millennials: 'songs-millennials.yaml',
  'gen-z': 'songs-gen-z.yaml',
  'gen-alpha': 'songs-gen-alpha.yaml',
};

export interface SongCatalogState {
  existingIds: Set<string>;
  catSongs: { artist: string; titleTokens: Set<string> }[];
  eraHeaderRegion: Map<Era, string[]>;
}

export function loadSongCatalogState(): SongCatalogState {
  const cat = loadCatalog();
  const existingIds = new Set<string>();
  const catSongs: { artist: string; titleTokens: Set<string> }[] = [];
  const eraHeaderRegion = new Map<Era, string[]>();
  const nameToEra = new Map<string, Era>();
  for (const [era, fn] of Object.entries(ERA_FILE)) nameToEra.set(fn, era as Era);
  for (const [fname, file] of cat.files) {
    if ((file as any).contentSubject !== 'song') continue;
    for (const it of file.items) {
      existingIds.add(it.id);
      const p = parseDesc(it.displayName);
      if (p)
        catSongs.push({
          artist: norm(p.artist),
          titleTokens: new Set(norm(p.title).split(' ').filter(Boolean)),
        });
    }
    const era = nameToEra.get(fname);
    if (era) eraHeaderRegion.set(era, (file as any).region as string[]);
  }
  return { existingIds, catSongs, eraHeaderRegion };
}

function jaccard(a: Set<string>, b: Set<string>): number {
  const inter = [...a].filter((x) => b.has(x)).length;
  const uni = new Set([...a, ...b]).size;
  return uni ? inter / uni : 0;
}

/** Same normalized artist + >=0.5 title-token overlap => treat as existing. */
export function looksDuplicateSong(
  state: SongCatalogState,
  artist: string,
  title: string,
): boolean {
  const na = norm(artist);
  const tt = new Set(norm(title).split(' ').filter(Boolean));
  return state.catSongs.some((s) => s.artist === na && jaccard(s.titleTokens, tt) >= 0.5);
}

export function buildSongItemBlock(c: NewSong, id: string, headerRegion: string[]): string {
  const L: string[] = [];
  L.push(`  - id: ${id}`);
  L.push(`    displayName: ${JSON.stringify(`${c.title} — ${c.artist}`)}`);
  L.push(`    correctYear: ${c.year}`);
  L.push(`    probability: 80`);
  L.push(`    wikimediaSearchHints: [${JSON.stringify(`${c.artist} ${c.title}`)}]`);
  L.push(`    answerMethods: ["timeline"]`);
  if (c.spotifyTrackId) L.push(`    spotifyTrackId: ${JSON.stringify(c.spotifyTrackId)}`);
  if (c.genrePackages && c.genrePackages.length)
    L.push(`    genrePackages: [${c.genrePackages.map((s) => JSON.stringify(s)).join(', ')}]`);
  if (
    c.inBaseCatalog != null &&
    c.inBaseCatalog.trim().toLowerCase() === 'false' &&
    c.genrePackages?.length
  )
    L.push(`    inBaseCatalog: false`);
  if (c.parentControlled) L.push(`    parentControlled: true`);
  const region = c.region;
  const headerIsRegion = headerRegion.length === 1 && headerRegion[0] === region;
  if (region && region !== 'unknown-region' && !headerIsRegion)
    L.push(`    region: [${JSON.stringify(region)}]`);
  if (c.ytClips && c.ytClips.length) {
    L.push(`    youtubeClips:`);
    for (const clip of c.ytClips) {
      L.push(`      - videoId: ${JSON.stringify(clip.videoId)}`);
      L.push(`        startSec: ${clip.startSec}`);
      L.push(`        endSec: ${clip.startSec + CLIP_LEN}`);
    }
  }
  return L.join('\n');
}

/** Append era->blocks to each songs-<era>.yaml (CRLF-preserving). Returns files changed. */
export function appendBlocksToEra(
  catalogDir: string,
  additions: Map<Era, string[]>,
  apply: boolean,
): number {
  let filesChanged = 0;
  for (const [era, blocks] of additions) {
    if (!blocks.length) continue;
    const full = path.join(catalogDir, ERA_FILE[era]);
    const text = readFileSync(full, 'utf8');
    const eol = text.includes('\r\n') ? '\r\n' : '\n';
    const trimmed = text.replace(/(\r?\n)+$/, '');
    const addition = blocks.map((b) => b.split('\n').join(eol)).join(eol);
    const newText = trimmed + eol + addition + eol;
    if (newText !== text) {
      filesChanged++;
      if (apply) writeFileSync(full, newText);
    }
  }
  return filesChanged;
}

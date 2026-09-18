// Reads public open.spotify.com track pages (Plan B, no API) and prints, per id:
//   duration (m:ss), album name, album track-count (single-context if <= 3),
//   track position, year.
// Duration lets us confirm the SHORT/radio edit; album track-count lets us prefer
// SINGLE releases. Minimal UA is required (full Chrome UA => JS shell w/o metas).
//
// Usage:
//   npx tsx scripts/check-spotify-track-meta.ts <id> [<id> ...]
//   npx tsx scripts/check-spotify-track-meta.ts --file path/to/ids.txt
//     (file: one "<id>" or "<id> | <label>" per line)
import { readFileSync } from 'node:fs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
const THROTTLE_MS = 350;

async function fetchHtml(url: string): Promise<string | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (res.status === 200) return await res.text();
      if (res.status === 429 || res.status >= 500) { await sleep(2500); continue; }
      return null;
    } catch { await sleep(2500); }
  }
  return null;
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
function meta(html: string, key: string): string | null {
  for (const re of [
    new RegExp(`<meta[^>]*(?:name|property)="${key}"[^>]*content="([^"]*)"`, 'i'),
    new RegExp(`<meta[^>]*content="([^"]*)"[^>]*(?:name|property)="${key}"`, 'i'),
  ]) { const m = html.match(re); if (m) return m[1]; }
  return null;
}
const dec = (s: string) => s.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
function mmss(sec: number | null): string {
  if (sec == null) return '?:??';
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

async function albumTrackCount(albumUrl: string): Promise<number | null> {
  const html = await fetchHtml(albumUrl);
  if (!html) return null;
  const desc = meta(html, 'og:description'); // "Artist · album · Year · N songs"
  const m = desc && desc.match(/·\s*(\d+)\s+songs?/i);
  if (m) return Number(m[1]);
  const songs = html.match(/property="music:song"/gi);
  return songs ? songs.length : null;
}

async function main() {
  const args = process.argv.slice(2);
  let ids: { id: string; label: string }[] = [];
  const fileIdx = args.indexOf('--file');
  if (fileIdx !== -1) {
    const lines = readFileSync(args[fileIdx + 1], 'utf8').split(/\r?\n/);
    for (const ln of lines) {
      const t = ln.trim(); if (!t) continue;
      if (t.includes('|')) { const [a, b] = t.split('|'); ids.push({ id: a.trim(), label: b.trim() }); }
      else ids.push({ id: t, label: '' });
    }
  } else {
    ids = args.filter((a) => !a.startsWith('--')).map((id) => ({ id, label: '' }));
  }
  console.log('id\tduration\ttracks\tpos\tyear\talbum\tlabel');
  for (const { id, label } of ids) {
    const html = await fetchHtml('https://open.spotify.com/track/' + id);
    if (!html) { console.log(`${id}\tDEAD/none`); await sleep(THROTTLE_MS); continue; }
    const durSec = Number(meta(html, 'music:duration')) || null;
    const desc = dec(meta(html, 'og:description') || '');
    const parts = desc.split(' · ');
    const album = parts[1] || '';
    const year = parts.length ? parts[parts.length - 1] : '';
    const pos = meta(html, 'music:album:track') || '';
    const albumUrl = meta(html, 'music:album');
    const count = albumUrl ? await albumTrackCount(albumUrl) : null;
    console.log(`${id}\t${mmss(durSec)}\t${count ?? '?'}\t${pos}\t${year}\t${album}\t${label}`);
    await sleep(THROTTLE_MS);
  }
}
main();

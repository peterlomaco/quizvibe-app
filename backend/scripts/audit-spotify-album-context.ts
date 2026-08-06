// Auditerar ALBUM-KONTEXTEN för alla spotifyTrackId i katalogen.
//
// Curator-regeln (2026-08-06, Peter-beslut): föredra track-ID:n från SINGEL-
// releaser (album med max 3 spår inkl. remixer). `spotify:track:<id>`-deep-
// linken öppnar spåret i sitt album-kontext — ett singel-ID ger en 1–3-spårs-
// vy där låten ligger överst (en tap → play när autoplay uteblir), medan ett
// album-/compilation-ID begraver låten mitt i en lång tracklist (spelovänligt
// för DJ:n).
//
// INGEN Spotify Web API används (Plan B) — vi läser publika open.spotify.com-
// sidors og-/music-meta-taggar (samma kategori som oEmbed-valideringen):
//   • Track-sidan:  music:album (album-URL), music:album:track (position),
//                   og:description "Artist · Album · Song · År"
//   • Album-sidan:  og:description "Artist · album · År · N songs" +
//                   music:song-metas (fallback-räkning)
//
// Flaggar items vars album har > MAX_SINGLE_TRACKS spår. Rapporterar även
// års-mismatch (track-sidans år ≠ item:ets correctYear = möjlig remaster/
// compilation — extra signal på fel version). Transienta fetch-fel retry:as
// en gång och flaggas ALDRIG — de listas som "okända" för manuell koll.
//
// Output: klickbar HTML-rapport backend/output/spotify-album-context.html
// (flaggade först, med Open track- + Search single-länkar) + konsol-summary.
// Exit-kod alltid 0 — detta är ett kurerings-underlag, ingen CI-gate.
//
// Kör: cd backend && npm run spotify-album-audit

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadCatalog } from '../content/registry';

const TRACK_PAGE_BASE = 'https://open.spotify.com/track/';
const THROTTLE_MS = 500;
const MAX_SINGLE_TRACKS = 3;
// MINIMAL UA är avsiktlig — med full Chrome-UA servar Spotify JS-app-skalet
// (~6 KB utan meta-taggar); den enkla UA:n får den server-renderade sidan
// med og-/music-metas (verifierat 2026-08-06: chrome-UA → 5 metas,
// minimal UA → 218 metas inkl. music:album).
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

interface TrackRef {
  file: string;
  itemId: string;
  displayName: string;
  trackId: string;
  correctYear: number | null;
}

interface AuditRow extends TrackRef {
  albumUrl: string | null;
  albumName: string | null;
  albumTracks: number | null;
  trackPosition: number | null;
  trackYear: number | null;
  flagged: boolean;
  yearMismatch: boolean;
  error: string | null;
}

/** Hämtar HTML med browser-UA. Retry en gång vid nätverksfel/429/5xx. */
async function fetchHtml(url: string): Promise<string | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (res.status === 200) return await res.text();
      if (res.status === 429 || res.status >= 500) {
        await new Promise((r) => setTimeout(r, 2500));
        continue;
      }
      return null; // stabil 4xx — sidan finns inte (dött ID fångas av spotify-validate)
    } catch {
      await new Promise((r) => setTimeout(r, 2500));
    }
  }
  return null;
}

/** Läser content-attributet för en meta-tagg oavsett attribut-ordning. */
function metaContent(html: string, key: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]*(?:name|property)="${key}"[^>]*content="([^"]*)"`, 'i'),
    new RegExp(`<meta[^>]*content="([^"]*)"[^>]*(?:name|property)="${key}"`, 'i'),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) return m[1];
  }
  return null;
}

/** Sista " · 1976"-årtalet ur en og:description-sträng. */
function trailingYear(desc: string | null): number | null {
  if (!desc) return null;
  const m = desc.match(/(\d{4})(?:\D*)$/);
  return m ? Number(m[1]) : null;
}

/** Avkodar de vanligaste HTML-entiteterna i Spotifys meta-content. */
function decodeEntities(s: string): string {
  return s
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** "Dancing Queen — ABBA" → sök-query "Dancing Queen ABBA". */
function searchUrl(displayName: string): string {
  const query = displayName.replace(/\s+—\s+/g, ' ');
  return `https://open.spotify.com/search/${encodeURIComponent(query)}`;
}

async function main(): Promise<void> {
  const catalog = loadCatalog();
  const refs: TrackRef[] = [];
  for (const [file, content] of catalog.files) {
    for (const item of content.items) {
      if (item.spotifyTrackId) {
        refs.push({
          file,
          itemId: item.id,
          displayName: item.displayName,
          trackId: item.spotifyTrackId,
          correctYear: item.correctYear ?? null,
        });
      }
    }
  }

  console.log(
    `Auditing album context for ${refs.length} spotifyTrackId(s) via open.spotify.com meta tags...`,
  );

  // Album-cache: samma album behöver bara hämtas en gång även om flera
  // katalog-items pekar på spår i det.
  const albumCache = new Map<string, { name: string | null; totalTracks: number | null }>();
  const rows: AuditRow[] = [];

  for (const [i, ref] of refs.entries()) {
    const row: AuditRow = {
      ...ref,
      albumUrl: null,
      albumName: null,
      albumTracks: null,
      trackPosition: null,
      trackYear: null,
      flagged: false,
      yearMismatch: false,
      error: null,
    };

    const trackHtml = await fetchHtml(`${TRACK_PAGE_BASE}${ref.trackId}`);
    if (!trackHtml) {
      row.error = 'track-sidan kunde inte hämtas';
    } else {
      row.albumUrl = metaContent(trackHtml, 'music:album');
      const pos = metaContent(trackHtml, 'music:album:track');
      row.trackPosition = pos ? Number(pos) : null;
      row.trackYear = trailingYear(metaContent(trackHtml, 'og:description'));

      if (row.albumUrl) {
        let album = albumCache.get(row.albumUrl);
        if (!album) {
          await new Promise((r) => setTimeout(r, THROTTLE_MS));
          const albumHtml = await fetchHtml(row.albumUrl);
          if (albumHtml) {
            const desc = metaContent(albumHtml, 'og:description');
            const songsMatch = desc?.match(/(\d+)\s+songs?/i);
            const songMetaCount = (albumHtml.match(/<meta name="music:song"/g) || []).length;
            album = {
              name:
                decodeEntities(
                  metaContent(albumHtml, 'og:title')?.replace(
                    /\s*-\s*(Album|Single|EP|Compilation) by .*$/i,
                    '',
                  ) ?? '',
                ) || null,
              totalTracks: songsMatch ? Number(songsMatch[1]) : songMetaCount || null,
            };
          } else {
            album = { name: null, totalTracks: null };
          }
          albumCache.set(row.albumUrl, album);
        }
        row.albumName = album.name;
        row.albumTracks = album.totalTracks;
      }

      if (row.albumTracks === null && !row.albumUrl) {
        row.error = 'album-metadata saknas på track-sidan';
      }
    }

    row.flagged = row.albumTracks !== null && row.albumTracks > MAX_SINGLE_TRACKS;
    row.yearMismatch =
      row.trackYear !== null && ref.correctYear !== null && row.trackYear !== ref.correctYear;
    rows.push(row);

    if ((i + 1) % 20 === 0) console.log(`  ${i + 1}/${refs.length} checked...`);
    await new Promise((r) => setTimeout(r, THROTTLE_MS));
  }

  const flagged = rows.filter((r) => r.flagged);
  const unknown = rows.filter((r) => r.error !== null || r.albumTracks === null);
  const ok = rows.filter((r) => !r.flagged && r.error === null && r.albumTracks !== null);

  // ── HTML-rapport ──────────────────────────────────────────────────────
  const renderRow = (r: AuditRow): string => {
    const badge = r.error
      ? '<span class="badge unknown">OKÄND</span>'
      : r.flagged
        ? `<span class="badge flag">${r.albumTracks} SPÅR</span>`
        : `<span class="badge ok">${r.albumTracks ?? '?'} spår</span>`;
    const posText =
      r.trackPosition !== null && r.albumTracks !== null
        ? `spår ${r.trackPosition} av ${r.albumTracks}`
        : (r.error ?? '–');
    const yearText =
      r.trackYear !== null
        ? r.yearMismatch
          ? `<span class="year-mismatch">ID-år ${r.trackYear} ≠ correctYear ${r.correctYear}</span>`
          : `${r.trackYear}`
        : '–';
    return `<tr class="${r.flagged ? 'row-flag' : ''}">
      <td>${badge}</td>
      <td><strong>${escapeHtml(r.displayName)}</strong><br><code>${escapeHtml(r.itemId)}</code><br><small>${escapeHtml(r.file)}</small></td>
      <td>${escapeHtml(r.albumName ?? '–')}<br><small>${posText}</small></td>
      <td>${yearText}</td>
      <td>
        <a href="${TRACK_PAGE_BASE}${r.trackId}" target="_blank">Open track</a><br>
        <a href="${searchUrl(r.displayName)}" target="_blank">Search single</a>
      </td>
    </tr>`;
  };

  const html = `<!doctype html>
<html lang="sv"><head><meta charset="utf-8">
<title>Spotify album-kontext-audit — ${new Date().toISOString().slice(0, 10)}</title>
<style>
  body { font-family: -apple-system, Segoe UI, sans-serif; background: #0E1621; color: #E8EDF2; margin: 24px; }
  h1 { font-size: 20px; } h2 { font-size: 16px; margin-top: 32px; }
  p.summary { color: #9AA7B4; }
  table { border-collapse: collapse; width: 100%; margin-top: 12px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #24303D; vertical-align: top; font-size: 13px; }
  th { color: #9AA7B4; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
  code { color: #4DA3FF; font-size: 11px; } small { color: #9AA7B4; }
  a { color: #1DB954; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; white-space: nowrap; }
  .badge.flag { background: #F5A623; color: #000; }
  .badge.ok { background: #17301D; color: #4CD97B; }
  .badge.unknown { background: #3A2A2A; color: #FF6B6B; }
  .row-flag { background: rgba(245, 166, 35, 0.06); }
  .year-mismatch { color: #F5A623; font-weight: 600; }
</style></head><body>
<h1>Spotify album-kontext-audit</h1>
<p class="summary">Genererad ${new Date().toISOString()} · ${rows.length} track-ID:n ·
<strong>${flagged.length} flaggade</strong> (album &gt; ${MAX_SINGLE_TRACKS} spår — byt till singel-release-ID) ·
${ok.length} OK · ${unknown.length} okända (fetch-fel, kör om eller kolla manuellt).</p>
<p class="summary">Arbetsflöde per flaggad rad: tap <em>Search single</em> → välj singel-releasen
(1–3 spår, releaseår = correctYear) → Share → Copy link → klistra in nya ID:t i YAML-filen →
kör <code>npm run spotify-validate</code> + <code>npm run export-music-questions</code>.</p>
<h2>Flaggade (${flagged.length})</h2>
<table><tr><th>Album-storlek</th><th>Låt</th><th>Album</th><th>År</th><th>Länkar</th></tr>
${flagged.sort((a, b) => (b.albumTracks ?? 0) - (a.albumTracks ?? 0)).map(renderRow).join('\n')}
</table>
<h2>Okända (${unknown.length})</h2>
<table><tr><th>Status</th><th>Låt</th><th>Album</th><th>År</th><th>Länkar</th></tr>
${unknown.map(renderRow).join('\n')}
</table>
<h2>OK — redan singel-kontext (${ok.length})</h2>
<table><tr><th>Album-storlek</th><th>Låt</th><th>Album</th><th>År</th><th>Länkar</th></tr>
${ok.map(renderRow).join('\n')}
</table>
</body></html>`;

  const outDir = join(__dirname, '..', 'output');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, 'spotify-album-context.html');
  writeFileSync(outPath, html, 'utf8');

  // ── Klient-datafil: album-kontext per trackId ─────────────────────────
  // Konsumeras av DJ:ns track-kort i app/quiz.tsx ("Track X of Y") så DJ:n
  // hittar rätt rad i Spotify-tracklistan när autoplay uteblir. Skrivs om
  // helt varje körning — items med fetch-fel faller ur och kortet utelämnar
  // då bara raden (graceful degradation).
  const ctxEntries = rows
    .filter((r) => r.trackPosition !== null && r.albumTracks !== null)
    .sort((a, b) => a.trackId.localeCompare(b.trackId));
  const tsLines = ctxEntries.map(
    (r) => `  '${r.trackId}': { position: ${r.trackPosition}, total: ${r.albumTracks} },`,
  );
  const tsFile = `// AUTO-GENERATED av backend/scripts/audit-spotify-album-context.ts — redigera INTE.
// Album-kontext per spotifyTrackId: spårets position i albumet/samlingen som
// spotify:track:<id>-deep-linken öppnar. Konsumeras av DJ:ns track-kort i
// app/quiz.tsx ("Track X of Y") så DJ:n hittar rätt rad när autoplay uteblir
// och Spotify visar hela tracklistan.
// Regenerera: cd backend && npm run spotify-album-audit
export interface SpotifyAlbumContext {
  /** Spårets position i albumet/samlingen (1-baserad). */
  position: number;
  /** Albumets totala antal spår. */
  total: number;
}

export const SPOTIFY_ALBUM_CONTEXT: Record<string, SpotifyAlbumContext> = {
${tsLines.join('\n')}
};
`;
  const clientPath = join(__dirname, '..', '..', 'src', 'utils', 'spotifyAlbumContext.ts');
  writeFileSync(clientPath, tsFile, 'utf8');
  console.log(`Klient-datafil: ${clientPath} (${ctxEntries.length} tracks)`);

  // ── Konsol-summary ────────────────────────────────────────────────────
  console.log(`\n✗ ${flagged.length} flaggade (album > ${MAX_SINGLE_TRACKS} spår):`);
  for (const r of flagged.slice(0, 20)) {
    console.log(
      `  [${r.albumTracks} spår] ${r.itemId} (${r.displayName}) — album "${r.albumName ?? '?'}"`,
    );
  }
  if (flagged.length > 20) console.log(`  ... +${flagged.length - 20} till (se HTML-rapporten)`);
  if (unknown.length > 0) {
    console.log(`\n⚠ ${unknown.length} okända (fetch-fel — kör om scriptet eller kolla manuellt):`);
    for (const r of unknown) console.log(`  ${r.itemId} — ${r.error ?? 'album-data saknas'}`);
  }
  console.log(`\n✓ ${ok.length} redan i singel-kontext (≤ ${MAX_SINGLE_TRACKS} spår).`);
  console.log(`\nHTML-rapport: ${outPath}`);
}

main().catch((err) => {
  console.error('audit-spotify-album-context failed:', err);
  process.exit(1);
});

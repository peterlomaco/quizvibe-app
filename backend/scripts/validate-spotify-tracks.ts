// Validerar alla spotifyTrackId i katalogen mot Spotifys publika oEmbed-endpoint.
//
// Spotify tar bort/relinkar tracks över tid (samma rot som YouTube-takedowns) —
// ett dött track-ID ger 404 här, och i appen yttrar det sig som att Spotify
// öppnar med "Something went wrong" när DJ:n tappar "Start track in Spotify"
// (deep link till borttagen track). Upptäckt 2026-07-18: 2 av 107 ID:n döda
// (Queen — Another One Bites the Dust, The Hives — Hate to Say I Told You So).
//
// oEmbed är publik — ingen API-nyckel, ingen kvot. Speglar youtube-validate-
// mönstret: exit-kod 1 om döda ID:n hittas, så nightly-cron:en signalerar fail.
// Transienta nätverksfel/429 retry:as en gång och räknas ALDRIG som döda
// (lärdom från license-audit: throttle-fel är inte saknade licenser).
//
// Kör: cd backend && npm run spotify-validate

import { loadCatalog } from '../content/registry';

const OEMBED_BASE =
  'https://open.spotify.com/oembed?url=https://open.spotify.com/track/';
const THROTTLE_MS = 300;

interface TrackRef {
  file: string;
  itemId: string;
  displayName: string;
  trackId: string;
}

interface CheckResult extends TrackRef {
  status: number | string;
}

async function checkTrack(trackId: string): Promise<number | string> {
  try {
    const res = await fetch(`${OEMBED_BASE}${trackId}`);
    return res.status;
  } catch (err) {
    return `network-error: ${(err as Error).message}`;
  }
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
        });
      }
    }
  }

  console.log(`Validating ${refs.length} spotifyTrackId(s) via Spotify oEmbed...`);

  const dead: CheckResult[] = [];
  const warnings: CheckResult[] = [];

  for (const [i, ref] of refs.entries()) {
    let status = await checkTrack(ref.trackId);
    // Retry en gång vid transient fel (nätverk / rate-limit / 5xx) —
    // bara stabila 4xx-svar ska räknas som döda tracks.
    const isTransient =
      typeof status === 'string' || status === 429 || (typeof status === 'number' && status >= 500);
    if (isTransient) {
      await new Promise((r) => setTimeout(r, 2000));
      status = await checkTrack(ref.trackId);
    }

    if (typeof status === 'number' && status >= 400 && status < 500 && status !== 429) {
      dead.push({ ...ref, status });
    } else if (status !== 200) {
      warnings.push({ ...ref, status });
    }

    if ((i + 1) % 25 === 0) console.log(`  ${i + 1}/${refs.length} checked...`);
    await new Promise((r) => setTimeout(r, THROTTLE_MS));
  }

  if (warnings.length > 0) {
    console.log(`\n⚠ ${warnings.length} transient/oklara svar (räknas INTE som döda):`);
    for (const w of warnings) {
      console.log(`  [${w.status}] ${w.file} :: ${w.itemId} (${w.displayName}) — ${w.trackId}`);
    }
  }

  if (dead.length > 0) {
    console.log(`\n✗ ${dead.length} DÖDA track-ID(n) — byt ut i katalogen + kör export-music-questions:`);
    for (const d of dead) {
      console.log(`  [${d.status}] ${d.file} :: ${d.itemId} (${d.displayName}) — ${d.trackId}`);
      console.log(`      sök ersättning: https://open.spotify.com/search/${encodeURIComponent(d.displayName)}`);
    }
    process.exit(1);
  }

  console.log(`\n✓ Alla ${refs.length} spotifyTrackId är live.`);
}

main().catch((err) => {
  console.error('validate-spotify-tracks failed:', err);
  process.exit(1);
});

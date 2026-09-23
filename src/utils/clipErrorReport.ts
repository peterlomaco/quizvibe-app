// Klient-sidan av klipp-kontrollen (2026-09-23).
//
// - `checkClipsOnServer`: anropar Edge Function `check-clips` (YouTube Data API +
//   blocklistan av klipp som failat hos riktiga spelare). Passas som
//   `serverCheck` till `checkYoutubeClipsAlive` i pre-game-kollen.
// - `reportClipError`: rapporterar ett klipp som failade på DENNA enhet till
//   `clip_playback_errors` (migration 0056). Det är den rapporten som gör att
//   nästa spels pre-game-koll byter ut klippet innan Play.
//
// Båda är FAIL-OPEN och kastar aldrig.

import { Platform } from 'react-native';
import { supabase } from './supabase';
import { track } from './analytics';

export async function checkClipsOnServer(videoIds: string[]): Promise<string[] | null> {
  try {
    const { data, error } = await supabase.functions.invoke<{ dead?: string[] }>('check-clips', {
      method: 'POST',
      body: { videoIds },
    });
    if (error || !data || !Array.isArray(data.dead)) return null;
    return data.dead.filter((v): v is string => typeof v === 'string');
  } catch {
    return null;
  }
}

export interface ClipErrorReport {
  videoId: string;
  itemId: string | null;
  /** react-native-youtube-iframe:s felnamn: video_not_found | embed_not_allowed | HTML5_error | invalid_parameter */
  errorCode: string;
  gameMode: string | null;
}

export function reportClipError(r: ClipErrorReport): void {
  track('youtube_playback_error', {
    video_id: r.videoId,
    item_id: r.itemId,
    code: r.errorCode,
    game_mode: r.gameMode,
  });
  void (async () => {
    try {
      const { error } = await supabase.from('clip_playback_errors').insert({
        video_id: r.videoId,
        item_id: r.itemId,
        error_code: r.errorCode.slice(0, 40),
        platform: Platform.OS,
        game_mode: r.gameMode,
      });
      if (error) console.warn('[clipErrorReport] insert failed:', error.message);
    } catch (e) {
      console.warn('[clipErrorReport] insert threw:', e);
    }
  })();
}

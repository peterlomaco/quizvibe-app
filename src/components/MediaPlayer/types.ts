// Uniform interface som alla provider-implementationer (YouTube + framtida)
// konsumerar. State-driven istället för imperativt — föräldern
// (typiskt quiz.tsx) äger phase-state och MediaPlayer translaterar
// `isPlaying`/`showVideo`-prop:ar till provider-specifika kommandon.
//
// Phase 4 byter den nuvarande Expo Go-stuben mot en riktig WebView-baserad
// player utan att call-sites i quiz.tsx behöver ändras — interfacet
// designades för det bytet.

import type { MediaSource } from '@/src/utils/mediaSource';

export interface MediaPlayerProps {
  /** Vilken källa som ska spelas. `kind: 'none'` renderar en placeholder. */
  source: MediaSource;
  /**
   * Om playern ska spela just nu. Sätts till true under `phase === 'question'`
   * och stannar typiskt true tills timer:n går till 0 (uppspelningen klipps
   * automatiskt vid endSec av provider-impl).
   */
  isPlaying: boolean;
  /**
   * Om video-frame:n ska visas eller om bara ljud ska höras (audio-only).
   * Music-frågor: `false` under question-fas (annars syns avslöjande visuella
   * ledtrådar), `true` vid reveal.
   */
  showVideo: boolean;
  /**
   * D-iv: tysta ljudet på denna enhet utan att pausa uppspelningen. Drivs av
   * host:s per-spelare audio-overrides i Individual Devices — host väljer
   * vilka enheter som hörs (default host on, alla andra off). Pass-the-Phone
   * passar alltid `false` (single device = alltid ljud på).
   * Default `false` om utelämnad (= ljud på, bakåtkompatibelt).
   */
  isMuted?: boolean;
  /** Fyrar när media-källan har laddats och är redo att spela. */
  onReady?: () => void;
  /** Fyrar när uppspelningen nått clip-slutet (endSec) eller media slutat. */
  onEnded?: () => void;
  /** Fyrar om en provider-fel inträffar (saknad video, embed-blockerad, etc.). */
  onError?: (error: Error) => void;
}

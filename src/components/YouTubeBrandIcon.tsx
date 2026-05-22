// YouTube:s officiella "play button"-social-icon — avrundad röd rektangel
// (#FF0000) med vit play-triangel centrerad. Path:en är hämtad från
// YouTube Brand Resources (https://www.youtube.com/about/brand-resources/)
// och får INTE modifieras: form, proportioner och färger ska vara intakta
// enligt YouTube API Services Branding Guidelines.
//
// Viktigt:
//   • Ingen omfärgning (alltid #FF0000 + #FFFFFF).
//   • Bevara aspect ratio 28.57 / 20 ≈ 1.43 (wider-than-tall). Höjden
//     härleds från size-propen (width) så ikonen aldrig deformeras.
//   • Placera nära YouTube-content / YouTube-text. Använd INTE som generisk
//     "media source"-ikon utan kontext.
//
// Komponenten ersätter den tidigare generiska blå-cirkel + vit-play-
// triangeln vi använde för YouTube-källor — beslutet att byta till officiell
// brand-ikon togs 2026-05-22 (mer compliant med YT:s rekommendation att
// integrationer visar deras logo nära integrationspunkter).

import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  /** Bredd på ikonen i px. Höjd härleds från aspect ratio (≈ size / 1.43)
   *  så proportionerna bevaras. Default 28 matchar Lobby:s connectionIconWrap. */
  size?: number;
}

const YT_VIEWBOX_W = 28.57;
const YT_VIEWBOX_H = 20;
const YT_ASPECT = YT_VIEWBOX_W / YT_VIEWBOX_H;

export function YouTubeBrandIcon({ size = 28 }: Props) {
  const width = size;
  const height = size / YT_ASPECT;
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${YT_VIEWBOX_W} ${YT_VIEWBOX_H}`}>
      {/* Röd avrundad rektangel — YouTube:s brand-form */}
      <Path
        fill="#FF0000"
        d="M27.973 3.123A3.578 3.578 0 0 0 25.461 0.611C23.249 0 14.288 0 14.288 0S5.327 0 3.115 0.611A3.578 3.578 0 0 0 0.603 3.123C0 5.341 0 10.001 0 10.001S0 14.661 0.603 16.879A3.578 3.578 0 0 0 3.115 19.391C5.327 20.002 14.288 20.002 14.288 20.002S23.249 20.002 25.461 19.391A3.578 3.578 0 0 0 27.973 16.879C28.576 14.661 28.576 10.001 28.576 10.001S28.576 5.341 27.973 3.123Z"
      />
      {/* Vit play-triangel centrerad */}
      <Path
        fill="#FFFFFF"
        d="M11.430 5.715L19.027 10.001L11.430 14.287V5.715Z"
      />
    </Svg>
  );
}

/**
 * Spotify brand-icon — officiell logo-mark med korrekt variant-hantering.
 *
 * ═══ SPOTIFY BRAND GUIDELINES (developer.spotify.com/documentation/design) ═══
 *
 * BAKGRUNDSREGEL (KRITISK):
 *   Den gröna ikonen ('green') får BARA användas på svart (#000000) eller
 *   vit (#FFFFFF) bakgrund. På alla andra bakgrunder → använd monokrom.
 *
 *   Varför: Spotify-ikonen ritas som en grön cirkel med TRANSPARENTA "hål"
 *   där vågorna är. Hålen visar bakgrundsfärgen — på vår mörka kortbakgrund
 *   skulle de se mörkblå ut istället för vita. Fel.
 *
 * TILLÅTNA KOMBINATIONER:
 *   • 'green'  på svart bakgrund  → vita vågor (svart lyser igenom hålen)
 *   • 'green'  på vit  bakgrund   → vita vågor (vit  lyser igenom)   ← sämre kontrast
 *   • 'white'  på mörk bakgrund   → ren vit monokrom  ✓ (vår Lobby)
 *   • 'black'  på ljus bakgrund   → ren svart monokrom
 *
 * FÖRBJUDET:
 *   • Rotera ikonen
 *   • Fylla våglinjer (fill, ej stroke)
 *   • Sträcka eller ändra form
 *   • Placera grönt på annan färg än svart/vit
 *   • Använda i text/meningar
 *
 * STORLEK: minst 21px digitalt. Default 22px matchar YouTubeBrandIcon.
 *
 * CLEAR SPACE: = halva ikonens höjd på varje sida. Undviks via connectionIconWrap.
 *
 * EXAKTA FÄRGER:
 *   Spotify Green: #1DB954
 *   Black:         #000000
 *   White:         #FFFFFF
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Bågarna är ritade som separata vita/svarta strokes (ej transparenta hål
 * i cirkeln). Det ger oss full kontroll oavsett bakgrundsfärg och matchar
 * den officiella logotypens visuella utseende.
 */

import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export const SPOTIFY_GREEN = '#1DB954';
export const SPOTIFY_BLACK = '#000000';

export type SpotifyIconVariant = 'green' | 'white' | 'black';

interface Props {
  size?: number;
  /**
   * 'green'  — grön cirkel + vita bågar. KRÄVER svart eller vit bakgrund.
   * 'white'  — bara vita bågar, ingen cirkel. Använd på mörk bakgrund (vår default).
   * 'black'  — bara svarta bågar, ingen cirkel. Använd på ljus bakgrund.
   */
  variant?: SpotifyIconVariant;
}

/**
 * Spotify-logo-mark som SVG.
 *
 * I QuizVibe Lobby används 'white' eftersom bakgrunden är mörk (Colors.cardElevated).
 * 'green' används bara om ikonen placeras på en svart bakgrund (#000000).
 *
 * Exempel:
 *   <SpotifyBrandIcon size={22} variant="white" />   ← mörk bakgrund (Lobby)
 *   <SpotifyBrandIcon size={22} variant="green" />   ← kräver svart bg-wrapper
 */
export function SpotifyBrandIcon({ size = 22, variant = 'white' }: Props) {
  // Bågfärg: vit för 'green'/'white'-variant, svart för 'black'-variant.
  const waveColor = variant === 'black' ? SPOTIFY_BLACK : '#FFFFFF';

  // ViewBox 0 0 24 24 — standardiserat koordinatsystem för Spotify logo-mark.
  //
  // Bågarna är tre concave kurvor (böjer uppåt från vänster till höger),
  // proportionerade mot den officiella Spotify-logotypen:
  //   • Övre (bredast):   spänner ~75% av cirkelns diameter
  //   • Mellersta:        spänner ~60% av cirkelns diameter
  //   • Nedre (smalast):  spänner ~45% av cirkelns diameter
  //
  // Varje båge ritas som ett enkelt kubiskt bezier (streck, ej fill).
  // strokeLinecap="round" matchar Spotifys rundade ändpunkter.
  // Tjocklek: 1.65px skalas rätt ned till 22px-visning utan att se för
  // tunn (< 1.4) eller för tjock (> 1.9) ut.
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Grön bakgrundscirkel — bara för 'green'-varianten */}
      {variant === 'green' && (
        <Circle cx="12" cy="12" r="12" fill={SPOTIFY_GREEN} />
      )}

      {/* ── Övre båge (bredast, ~75% av diametern) ─────────────────────
          Positionerad i övre tredjedelen av cirkeln. Ändpunkterna ligger
          nära cirkelkanten; kurvan böjer upp mot centrum. */}
      <Path
        d="M5.5 10.2 C8.3 7.8 15.7 7.8 18.5 10.2"
        stroke={waveColor}
        strokeWidth="1.65"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── Mellersta båge (~60% av diametern) ──────────────────────────
          Jämnt fördelad mellan övre och nedre bågen. */}
      <Path
        d="M7.0 13.5 C9.2 11.6 14.8 11.6 17.0 13.5"
        stroke={waveColor}
        strokeWidth="1.65"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── Nedre båge (smalast, ~45% av diametern) ─────────────────────
          Positionerad i nedre tredjedelen av cirkeln. */}
      <Path
        d="M8.8 16.8 C10.4 15.4 13.6 15.4 15.2 16.8"
        stroke={waveColor}
        strokeWidth="1.65"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

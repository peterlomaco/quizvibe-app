# QuizVibe brand master assets (SVG)

Final master assets for the "Navy + Metallic Gold" QuizVibe logo, approved by Peter on 2026-10-16.
They are **not yet used in the production app**. The app still renders the PNGs in `assets/brand/`.

## Files

| File | Content |
|---|---|
| `quizvibe-mark.svg` | Q symbol: circular ring with a slot at the lower right, connector, handle, 2 inner signal arcs + 1 outer signal arc |
| `quizvibe-wordmark.svg` | "QuizVibe" in Fredoka Bold, converted to paths (no font needed at runtime) |
| `quizvibe-logo.svg` | Mark above wordmark, laid out with the Home screen's proportions |
| `variants/*-flatGold.svg` | Same geometry in flat `#F5A623` |
| `variants/*-white.svg` | Same geometry in white (for dark or photo backgrounds) |
| `variants/*-mono.svg` | Same geometry in navy `#0B1220` (for light backgrounds) |
| `quizvibe-mark-geometry.json` | The mark's construction parameters in viewBox units |

Validation (master PNG vs SVG at 512–24 px on navy, black and white): `../logo-validation/logo-preview.html`.

## How the files are built

- **Geometry and paint are separate.** In each SVG the shapes live in `<defs>` as a paint-free `<g id="…-geometry">`. Visible layers are `<use>` references that set the fill.
  - The metallic version has three layers: a dark depth copy, a gold gradient and a soft shine.
  - The variants use the same paths with a single solid fill.
- **Mark** (viewBox `0 0 965.46 1000`, same frame as the master PNG):
  - The ring is a true circle.
  - The ring's gap is a straight channel along the handle axis (46.4°).
  - The connector has the handle's width, so connector + handle read as one bar split by a thin channel.
  - The three signal arcs are concentric: one shared centre and bisector, so the outer arc is centred on the inner two.
  - Arc stroke is 0.34 × the ring stroke.
- **Wordmark**: Fredoka Bold outlines (variable font instanced at wght 700, wdth 100) with the font's own spacing and kerning. No reshaping.

## Font licence

Fredoka is licensed under the SIL Open Font License 1.1 (Google Fonts, `github.com/google/fonts/tree/main/ofl/fredoka`). The wordmark ships only as converted outlines, not as a font file. Copyright Milena Brandão Gráfica.

## Not done yet

- Not integrated into the app.
- When it is, `react-native-svg` can render the paths directly; geometry and colour can be swapped per variant without new assets.
- App icon, email templates, quizvibe.se and App Store assets still use the earlier artwork.

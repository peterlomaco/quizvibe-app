# QuizVibe brand master assets (SVG)

> **LOCKED — QuizVibe Brand Master (final, 2026-10-16).**
> Peter has approved, on-device:
> - the mark geometry
> - the Manrope Bold wordmark
> - composition B (wordmark at 95 %, mark unchanged)
>
> The logo/brand exploration phase is closed: no Q redesign, no wordmark changes, no more font tests. Further work only applies this system consistently across the production UI.
>
> Do not change any of the following:
> - the Q geometry or the circle's proportions
> - the connector or the handle
> - the two inner signal arcs or the single outer arc
> - the arcs' alignment or stroke weights
> - the Manrope Bold wordmark geometry (unmodified letterforms)
> - the proportions between the mark and the wordmark
>
> Approved derived compositions:
> - the "Q only" subset (ring + connector + handle)
> - a separate overlay glyph such as Hints' "?"
>
> Neither may alter the frozen geometry. App code gets its geometry from
> `src/components/brand/quizVibeBrandGeometry.ts`, which is generated from
> these files by `generate-rn-geometry.py`.

These are the final master assets for the "Navy + Metallic Gold" QuizVibe logo. In the app they are used:
- on **Home** (A1, mark + wordmark)
- for the **bottom navigation's** active/inactive colours
- in the dev-only `/brand-preview` route

Every other screen still renders the PNGs in `assets/brand/`.

## Files

| File | Content |
|---|---|
| `quizvibe-mark.svg` | Q symbol: circular ring with a slot at the lower right, connector, handle, 2 inner signal arcs + 1 outer signal arc |
| `quizvibe-wordmark.svg` | "QuizVibe" in Manrope Bold, converted to paths (no font needed at runtime) |
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
- **Wordmark**:
  - Manrope Bold outlines (variable font instanced at wght 700) with the font's own spacing and kerning. No reshaping.
  - Fitted to the 780×185 wordmark frame with a 6 px margin (ink 768×136). This is the same frame and fit rule the previous wordmark used.
- **Full logo (composition B, frozen)** in a 2200-unit-wide layout:
  - The mark is 1160 units high, followed by a 160-unit gap.
  - The wordmark is 95 % of the logo width (2090 units), centred.
  - On Home this is mark 116 pt, gap 16 pt, wordmark 220 × 0.95 = 209 pt; compact screens use mark 83 pt and wordmark 161.5 pt.
  - In app code the constant is `WORDMARK_LOGO_SCALE` in `src/components/brand/QuizVibeBrandSvg.tsx`.
  - The A/B comparison (100 % vs 95 %) is kept for reference in `../logo-validation/composition-ab.html`.

## UI-state colour rules

| Variant | Use for |
|---|---|
| **Metallic Gold** | The primary large-format brand treatment: Home brand block, Lobby room card, Get Ready, countdown, end-of-clip, celebration |
| **Flat Gold** | Small active or selected UI states, where the metallic gradient loses clarity (e.g. the active tab, a selected option) |
| **White / reduced-opacity white** | Inactive or neutral navigation and UI states (e.g. inactive tabs, neutral button icons) |
| **Monochrome (navy/black)** | Light or white backgrounds |

**Gold means brand emphasis or an active/selected state, never decoration.** In the bottom navigation, ONLY the active tab is gold. All inactive tabs use the same muted treatment: reduced-opacity white for both icon and label. For example, when Home is active, Profile and Store are both muted, and Store is never gold. In code, use `BRAND_UI_ACTIVE` / `BRAND_UI_INACTIVE` from `src/components/brand/QuizVibeBrandSvg.tsx`.

## Font licence

Manrope is licensed under the SIL Open Font License 1.1 (Google Fonts, `github.com/google/fonts/tree/main/ofl/manrope`). Copyright 2019 The Manrope Project Authors (https://github.com/googlefonts/manrope). The wordmark ships only as converted outlines, not as a font file.

## Not done yet

- Only Home is integrated. The other placements follow the approved rollout plan.
- The app icon, splash and App Store assets are a separate design track and have not been changed.
- Email templates and quizvibe.se are postponed.

# QuizVibe brand master assets (SVG)

> **QuizVibe Brand Master — mark v2 (2026-11-02).**
> The wordmark and composition B were locked 2026-10-16. Peter reopened the
> Q mark on 2026-11-02 and chose variant D from `../logo-validation/mark-v2.html`:
> - the ring is a thin, CLOSED circle (no slot), stroke 80 (v1: 136.62), outer radius unchanged
> - the ring is exactly as thick as the handle (both 80)
> - the handle sits entirely OUTSIDE the ring on the 46.4° axis; the connector is gone
> - all three signal arcs sit entirely INSIDE the ring; arc stroke = 0.65 × ring stroke
>
> The mark is built by `build-mark.py` (`apply` rewrites the SVGs + variants +
> `quizvibe-mark-geometry.json`), then `generate-rn-geometry.py` produces
> `src/components/brand/quizVibeBrandGeometry.ts` for the app. Do not hand-edit
> the paths; change the parameters in `build-mark.py` instead, and only on
> Peter's request. The Manrope Bold wordmark and its letterforms stay unchanged.
>
> Approved derived compositions: the "Q only" subset (ring + handle) and a
> separate overlay glyph such as Hints' "?".

These are the final master assets for the "Navy + Metallic Gold" QuizVibe logo. In the app they are used:
- on **Home** (A1, mark + wordmark)
- for the **bottom navigation's** active/inactive colours
- in the dev-only `/brand-preview` route

Every other screen still renders the PNGs in `assets/brand/`.

## Files

| File | Content |
|---|---|
| `quizvibe-mark.svg` | Q symbol (v2): thin closed ring, handle outside the ring, three signal arcs inside it |
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
- **Mark v2** (viewBox `0 0 862.61 883.02`, a tight box around ring + handle; units are v1's):
  - The ring is a true, closed circle: outer radius 398.70, stroke 80, inner radius 318.70.
  - The handle (80 × 200, corner radius 0.3 × width) starts 0.4 × ring stroke outside the ring, along 46.4°.
  - The three signal arcs are concentric and open towards 311° (upper right). Their centre is 0.18 × inner radius down-left of the ring centre. Relative radii 1 : 2 : 3, spans 89.5° / 64.8° / 41.8° (from v1). They're scaled so the outermost clears the ring's inner edge by 0.5 × arc stroke.
  - Arc stroke is 0.65 × the ring stroke.
  - `build-mark.py` asserts that the handle doesn't touch the ring and that the arcs stay inside it.
- **Wordmark**:
  - Manrope Bold outlines (variable font instanced at wght 700) with the font's own spacing and kerning. No reshaping.
  - Fitted to the 780×185 wordmark frame with a 6 px margin (ink 768×136). This is the same frame and fit rule the previous wordmark used.
- **Full logo (composition B, frozen)** in a 2200-unit-wide layout:
  - The mark is 1024.30 units high (v2; keeps the ring the same size as in v1's 1160-high mark), followed by a 160-unit gap.
  - The wordmark is 95 % of the logo width (2090 units), centred.
  - On Home this is mark 116 × `MARK_HEIGHT_FROM_V1` (≈ 102 pt), gap 16 pt, wordmark 220 × 0.95 = 209 pt; compact screens use 83 × `MARK_HEIGHT_FROM_V1` and wordmark 161.5 pt.
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

Neutral surfaces, borders, muted text and icons use the `BrandUi` tokens in `src/theme/brandUi.ts` (reduced-opacity white on navy), never blue or raw greys.

## Tagline (locked 2026-10-16)

The official tagline is **"Anyone. Anywhere. Let’s play."** (typographic apostrophe). One static string everywhere the brand needs a tagline: app, emails, website. It is never rotated or varied by user state, game mode or screen. In code, use `BRAND_TAGLINE` from `src/components/brand/QuizVibeBrandSvg.tsx`.

## Font licence

Manrope is licensed under the SIL Open Font License 1.1 (Google Fonts, `github.com/google/fonts/tree/main/ofl/manrope`). Copyright 2019 The Manrope Project Authors (https://github.com/googlefonts/manrope). The wordmark ships only as converted outlines, not as a font file.

## Not done yet

- Home (Home v2) is integrated and locked. The other placements follow the approved rollout plan.
- The app icon, splash and App Store assets are a separate design track and have not been changed.
- Email templates and quizvibe.se still use the old logo. Only their tagline text has been updated in the repo, and it is not live until the Supabase templates are re-pasted, `send-welcome-email` is redeployed and `docs/` reaches master.

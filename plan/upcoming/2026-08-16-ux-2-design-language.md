# SOF-8024 Portion 2 — Mat3ra Design Language for the Designer

- **Parent:** [2026-08-16-ux-0-overview.md](./2026-08-16-ux-0-overview.md) · **Ticket:** [SOF-8024](https://mat3ra.atlassian.net/browse/SOF-8024) ·
  **Status:** upcoming
- **Updated:** 2026-08-16
- **Scope:** define the Mat3ra-specific design language (brand palette, typography,
  designer tokens) as theme tokens in `@mat3ra/cove`, in light **and** dark, and adopt it
  across the designer instead of the pinned legacy theme. Fixes W12 and gives portions
  3–6 a visual system to build against.

## 1. What exists today (audited in `@mat3ra/cove` `dist/theme`)

- **Palettes** (`theme/palette`): `paletteLight` and `paletteDark` are **currently
  identical** — primary `#7c5fcd` (brand purple), secondary `#757575`, success `#72E128`,
  error `#D32F2F`, warning `#ED6C02`, info `#0288D1`. The dark palette only flips MUI
  `mode`, so "dark" today is stock-MUI dark surfaces with the same accents.
- **Themes** (`theme/theme.js`): `oldLightMaterialUITheme` (legacy typography, 12 px
  subtitles — what the designer pins), `LightMaterialUITheme`, `DarkMaterialUITheme`
  (newer `MDTypography`, 12 px body1). Component overrides exist for buttons, chips,
  tooltips, inputs, icons, cssBaseline, shadows.
- **Fonts:** Roboto (+ system fallback); monospace Menlo/Monaco/Consolas.
- **In this repo:** `WorkflowDefaultLayout.tsx` pins `oldLightMaterialUITheme` and
  hardcodes `#cecece` borders; unit status styling rides on legacy `text-<status>`
  classes via `headerStatusCls`; the standalone demo invents its own palette
  (`#7c4dff`/`#00e5ff`) — evidence that the brand isn't consumable where needed.

## 2. Decision item (blocks adoption, not definition)

**Confirm the canonical brand palette with design/marketing.** The platform code says
purple `#7c5fcd`; the marketing site leans dark-navy + green. Outcome to record here: the
canonical primary, the neutrals ramp, and whether success stays `#72E128` (very saturated;
likely inherited from an admin-template — verify contrast on white: it fails WCAG AA for
text and needs a darker text-safe variant regardless).

## 3. Work items

### 3.1 Token layer in cove (definition)

Add a semantic token namespace consumable from any MUI theme (light + dark values each):

- **Brand:** `primary` ramp (50–900) around the confirmed brand color; text-safe
  variants; `onPrimary`.
- **Neutrals:** surface / surface-raised / canvas background, border, divider, text
  primary/secondary/disabled — hue-biased toward the brand, not stock grey.
- **Semantic:** success / warning / error / info with text-safe (`.dark`) variants that
  pass AA on both grounds (current `#72E128` fails on white).
- **Designer namespace** (`theme.designer.*`), the part stock MUI cannot express:
  - `unitType.{execution,assignment,condition,io,processing,map,subworkflow,error}` —
    node accent colors, distinguishable pairwise for the common types, each with an
    `on`-color; hue is never the only signal (nodes keep type icons).
  - `canvas.{background,grid,wire,selection,insertAffordance}`
  - `state.{modified,dirty,draft}` (the "modified" dot/badge color family)
  - `node.{background,border,shadow,minWidth}` — so wove and this repo stop hardcoding.
- **Typography:** keep Roboto (or record a deliberate change); define designer scale
  roles: node title, node meta, panel label (uppercase, tracked), field label, mono
  (template editor) — replacing the scattered 12 px literals.
- Ship as plain exported objects + merged into `LightMaterialUITheme` /
  `DarkMaterialUITheme`; publish cove.

### 3.2 Real dark palette

Differentiate `paletteDark` (surfaces, neutrals, adjusted accent luminance) instead of
reusing light values; validate the designer namespace on dark canvas.

### 3.3 Adoption in this repo and siblings

- Remove the `ThemeProvider theme={oldLightMaterialUITheme}` pin in
  `src/components/workflows/WorkflowDefaultLayout.tsx`; consume the ambient theme.
- Replace hardcoded values: `#cecece` border, `text-<status>` classes from
  `headerStatusCls` → `theme.designer.*`; sweep `src/components/**` (lint rule: no hex
  literals in components).
- wove: node cards, flowchart wires/grid, chips read `theme.designer.*`.
- Standalone demo: drop its invented palette; render the real Light/Dark themes with a
  toggle — the demo becomes the design-language reference environment.
- Update `docs/ux/mockups.html` accent colors to the confirmed brand primary so mockups
  and product converge (mockups currently use a neutral blue placeholder).

## 4. Dependencies & sequence

Definition (3.1–3.2) is pure cove work and blocks nothing; adoption (3.3) lands
opportunistically: portions 3–6 build with tokens from day one; remaining legacy screens
sweep at Phase 3 (see overview §5). The §2 decision gates only adoption spread, not token
plumbing.

## 5. Acceptance

- Designer renders correctly with **no pinned theme provider** under webapp light and
  demo dark.
- All node/canvas/state colors resolve from `theme.designer.*`; zero hex literals in
  `src/components/**` (lint-enforced).
- Contrast: node titles, field labels, and semantic badges pass WCAG AA on both grounds;
  unit-type colors distinguishable with color-vision-deficiency simulation (icons remain
  the primary type signal).
- Visual sweep (55 workflows × light/dark) reviewed and archived next to
  `docs/ux/current-state/`.

## 6. Test plan

Unit tests for token resolution/merging in cove; the visual sweep above; an axe/contrast
pass in cypress on the standalone demo in both modes.

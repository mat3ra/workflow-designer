# SOF-8024 Portion 2 — Mat3ra Design Language for the Designer

- **Parent:** [2026-08-16-ux-0-overview.md](./2026-08-16-ux-0-overview.md) · **Ticket:** [SOF-8024](https://mat3ra.atlassian.net/browse/SOF-8024) ·
  **Status:** definition built ([cove#98](https://github.com/mat3ra/cove/pull/98)); adoption still gated on §2
- **Updated:** 2026-08-17
- **Scope:** define the Mat3ra-specific design language (brand palette, typography,
  designer tokens) as theme tokens in `@mat3ra/cove`, in light **and** dark, and adopt it
  across the designer instead of the pinned legacy theme. Fixes W12 and gives portions
  3–6 a visual system to build against.

## Status (2026-08-17)

Items **3.1 (token layer)** and **3.2 (real dark palette)** are built in
[cove#98](https://github.com/mat3ra/cove/pull/98). Adoption (3.3) is not, and stays gated on the
§2 decision below — **the brand hue is deliberately untouched**, so nothing here presumes an
answer. Swapping it later is an edit to one file.

**§1's audit was partly wrong, corrected by reading the source rather than the built output.**
`paletteLight` and `paletteDark` are *not* identical: light is `#5b37c0` and dark is the lighter
`#7c5fcd`, deliberately, for readability on dark grounds. The real defect was worse and
different: `paletteDark` spread only the primary/secondary and semantic colours, so `border`,
`icon` and `unitTypes` — keys the package **declares** on the palette — were absent in dark mode.
`palette.border.dark` is dereferenced unguarded in `TextEditor`, `TotalWidget` and `InfoWidget`,
which therefore threw; `EntityName` already carried a `?.` and a hardcoded `#ccc`. Demonstrated
before and after.

**Contrast was worse than §2 estimated.** It flagged `success #72E128` failing on white, which is
true (1.68). Measuring the rest found three of the four `contrastText` values unreadable on their
own `main`: error was 23%-opacity black on red at **1.49**, info **1.54**, success **1.68**,
warning **3.11**. The translucency is why eye-checking the hex missed it — scored as opaque black
it looks fine. Each is now whichever of black or white measures readable, and a new `successText`
covers the case neither `main` nor `dark` can.

`theme.designer.*` ships as specified in 3.1: unit-type accents for all nine types with their own
label colours, canvas, state and node tokens, light and dark. `palette.unitTypes` is derived from
the same source so the two cannot drift, which changes two of its values —
`assignment #ff9800` and `condition #00BFA5` scored 2.15 and 2.14 against the white surface their
card stripe sits on, below the 3:1 non-text UI needs.

29 tests hold every value to its threshold, so a later edit that makes a stripe invisible fails
the build. Two of them caught mistakes in the first draft (a white label at 3.86, a canvas wire
at 2.60). The suite also had to be **wired into `npm test`**: cove's existing
`tests/schemaUtils.tests.ts` had never been executed, because `test` ran only lint and transpile.

**Adoption started where it needed no sign-off.** wove now reads the tokens for the two places
that were plainly wrong in dark mode ([wove#12](https://github.com/mat3ra/wove/pull/12)): a unit
card's resting border was the literal string `"white"` — it is meant to be *invisible*, reserving
the width the selected border takes, and white is only invisible on a white surface, so every
unselected card wore a bright 4px frame on a dark canvas; and the flowchart's dot grid was a
hardcoded `"000"`, invisible on a dark background. Both prefer `theme.designer.*` and fall back
to what they resolved to before, so they work against the currently published cove.

Still open in **3.3**: un-pinning `oldLightMaterialUITheme` in `WorkflowDefaultLayout` (gated —
that is the change that alters the classic layout for every host), replacing the `#cecece` border
and `text-<status>` classes, node cards reading the unit-type accents, and the demo dropping its
invented palette. The studio layout already picks up the ambient theme, since it never pinned the
legacy one.

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

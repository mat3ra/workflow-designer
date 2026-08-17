# SOF-8024 Portion 4 — Input Editor & Unit Editing Depth

- **Parent:** [2026-08-16-ux-0-overview.md](./2026-08-16-ux-0-overview.md) · **Ticket:** [SOF-8024](https://mat3ra.atlassian.net/browse/SOF-8024) ·
  **Status:** started — 1.5 built; 1.1–1.4 remain
- **Updated:** 2026-08-17
- **Scope:** the template-editing experience per Mockup D, replacing the nested
  accordion/sub-tab arrangement inside the unit dialog. Fixes W4. Bulk of the work lives
  in `@mat3ra/ave` (`ExecutionUnit` editor); this repo re-composes
  `src/components/units/UnitModal.tsx` / `UnitModalContent.tsx`.

## Status (2026-08-17)

Item **1.5 (demote internals)** is built. The rest is not.

Opening a unit to edit its input file showed, first, a pointer to another unit: `Next` plus a
disabled `FlowchartId` box repeating the same value as a UUID, above the Details and Input
accordions — so the editor everyone opens the dialog for started below the fold. `Next` now sits
in an **Advanced** accordion at the end ([ave#8](https://github.com/mat3ra/ave/pull/8)), and the
`FlowchartId` box is off by default here (`UnitPointerField` takes `showFlowchartId`, and the
value it showed was the one the selector beside it already held). The dialog opens on the
template.

Two things found while reading `ExecutionUnit`, which change what 1.2–1.4 still cost:

- **Syntax highlighting (1.2) already works** — the template renders with Jinja and namelist
  tokens coloured. What is missing is the *distinct* treatment of `{{ … }}` spans that the item
  asks for, not highlighting as such.
- **The rendering context is already in the dialog**, as a raw JSON `<pre>` in the side drawer
  (`visible-rendering-context`). So 1.4 is a matter of presenting what is already passed —
  name, value, origin, click-to-insert — rather than plumbing anything new.

Still open: 1.1 (editor layout), 1.2 (Jinja span treatment), 1.3 (render check with unresolved
variable warnings), 1.4 (variables panel). All of them live in `@mat3ra/ave`.

## 1. Work items

### 1.1 Editor layout

Full-height editor titled "`<unit>` — input": file tab (input file name) + a single
Template / Preview segmented toggle. Replaces the Details/INPUT accordions and
TEMPLATE/PREVIEW sub-tabs.

### 1.2 Syntax highlighting

Engine input format + Jinja tokens; `{{ … }}` spans visually distinct (token colors from
portion 2's mono/typography tokens).

### 1.3 Render check

Run the existing preview render and surface unresolved variables as warnings with line
references, instead of silently emitting `{{ }}` into the preview. Status bar states the
render context: "renders with: `<material>` · step `<n>` context".

### 1.4 Variables panel

Enumerate the unit's rendering context (available as `executionUnit.renderingContext`,
already passed through `UnitModalContent.tsx`): name, current value, origin ("Important
settings", "from material", "set at job runtime"). Click inserts at cursor. Unknown
variables in the template get nearest-name suggestions (edit distance).

### 1.5 Demote internals to Advanced

`Next` (execution order) and read-only `FlowchartId` move to an Advanced section at the
bottom; they disappear from the primary form. (Pairs with quick-win 1.3's dialog title.)

## 2. Dependencies

- ave release (1.1–1.5 editor internals).
- Portion 2 tokens for editor colors (fallback: current palette).
- None on portions 3/5 — ships against the classic layout; portion 5 later mounts the
  same editor from its inspector's Input tab.

## 3. Acceptance

- Opening input editing from a unit takes ≤ 2 clicks; the dialog names the unit.
- A template with an unresolved variable produces a visible warning naming it and its
  line; the preview never silently renders `{{ }}` through.
- Variables panel lists every context variable with value and origin; insertion works at
  cursor position.
- FlowchartId no longer appears in the primary form.
- E2E: introduce a typo'd variable → warning appears with suggestion → fix via panel
  insert → warning clears → preview renders resolved value.

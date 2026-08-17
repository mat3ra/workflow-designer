# SOF-8024 Portion 4 — Input Editor & Unit Editing Depth

- **Parent:** [2026-08-16-ux-0-overview.md](./2026-08-16-ux-0-overview.md) · **Ticket:** [SOF-8024](https://mat3ra.atlassian.net/browse/SOF-8024) ·
  **Status:** 1.3–1.5 built; 1.1–1.2 remain
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

### Render check and variables panel (2026-08-17)

Items **1.3** and **1.4** are built, also in [ave#8](https://github.com/mat3ra/ave/pull/8).

The item as written assumed the preview "silently renders `{{ }}` through". It is worse than
that: templates go through **nunjucks**, which substitutes an unknown variable with the **empty
string**. A typo does not fail, and leaves nothing behind in the preview to notice — it drops a
value out of the input file that a simulation then runs with.

**Render check (1.3).** Unresolved variables are named above the template, with line numbers and
a nearest-name suggestion where one is close enough to be help rather than noise
(`cutoffs.wavefunctionn — did you mean cutoffs.wavefunction?`). Deliberately narrow, because a
false warning on a valid template is worse than a missed one:

- only `{{ … }}` output is checked, never `{% if … %}` conditions — testing whether an optional
  value is present is idiomatic, and these templates open with
  `{% if subworkflowContext.MATERIAL_INDEX %}`;
- `{% raw %}` bodies are skipped, so job-runtime placeholders like `{{ JOB_WORK_DIR }}` are not
  reported as defects — blanked in place, so line numbers after them do not shift;
- names the template binds itself (`{% set %}`, `{% for %}`, `{% macro %}`) are not expected in
  the context;
- resolution stops at anything that is not plain data, so `material.name` is never called
  missing merely because `Material` is a class.

Validated against **every standata template — 184 across 55 workflows — with zero warnings**,
then against injected typos in a leaf, a root, a wrong provider and an absent name, each caught
on the right line. The rules live in `src/utils/templateVariables.ts` with 40 tests.

**Variables panel (1.4).** The side drawer's raw JSON `<pre>` is replaced by the context grouped
by where each value came from — Important settings, from the material, set at job runtime — with
the current value beside each path, a search box, and a "renders with: `<material>` ·
`<application>`" line. The grouping is not guesswork: wode builds the context as
`{ ...providerName → data, ...externalContext }`, so anything outside the external-context table
came from a context provider, which is what the Settings tab edits.

**One thing the item asked for that is not built: insertion at the cursor.** Clicking a row
copies `{{ path }}` instead. cove's `CodeMirror` wrapper exposes no ref or `EditorView`, so
there is nowhere to insert; an upstream cove change would be needed, and appending to the end of
the template instead would be worse than copying.

Still open: 1.1 (editor layout — the file tab and Template/Preview toggle are already there;
what remains is the full-height treatment) and 1.2 (distinct colouring for `{{ … }}` spans;
Jinja and namelist tokens already highlight).

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

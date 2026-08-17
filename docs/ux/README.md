# Workflow Designer — UX review & improvement proposal

Companion to the same exercise run for Materials Designer. Findings come from running the
standalone demo (`npm run dev`, all 55 standata workflows on Si mp-149) and reading the
component tree in this repo, `@mat3ra/wove`, and `@mat3ra/ave`.

Interactive mockups: open [`mockups.html`](./mockups.html) in a browser (self-contained,
no build needed). Current-state captures are in [`current-state/`](./current-state/).
The implementation plan lives in `plan/upcoming/`: main document
[`2026-08-16-ux-0-overview.md`](../../plan/upcoming/2026-08-16-ux-0-overview.md) with one detailed
document per portion (quick wins, design language, settings, input editor, shell
relayout, add flows).

**One-sentence diagnosis:** the designer shows the same information two or three times,
hides the two most common actions (edit a unit, add a unit) behind tiny targets and
dropdowns, and spends its pixels on UUIDs and empty canvas instead of the workflow itself.

### After (2026-08-17)

Captures of what has been built so far, alongside the originals:

| Capture | Shows |
|---------|-------|
| [`2026-08-17-layout-classic.jpg`](./current-state/2026-08-17-layout-classic.jpg) vs [`-studio.jpg`](./current-state/2026-08-17-layout-studio.jpg) | W1: the duplicated flowchart column replaced by a steps rail, behind `layoutVariant="studio"` |
| [`2026-08-17-settings-kpath.jpg`](./current-state/2026-08-17-settings-kpath.jpg) | W5: scoped setting cards, and the k-path as a chain with the path drawn on the Brillouin zone |
| [`2026-08-17-step-library.jpg`](./current-state/2026-08-17-step-library.jpg) | W8: adding a step by picking one, instead of pasting JSON |
| [`2026-08-17-input-variables.jpg`](./current-state/2026-08-17-input-variables.jpg) | W4: the context a template renders with, grouped by origin, and a typo named on its line |

Portion status lives in the plan overview's §0 table.

## Issue inventory

| # | Severity | Issue |
|---|----------|-------|
| W1 | high | **Left panel duplicates the right panel.** Subworkflow cards repeat the property chips, application line, and full unit list the right panel already shows — a third of the screen for a second copy. |
| W2 | high | **Flowchart nodes are illegible at default zoom.** Auto-fit shrinks unit cards to ~110 px; names render ~6 px. K-point Convergence (10 units + branch) cannot be read while the canvas stays mostly empty. |
| W3 | high | **Raw UUIDs everywhere.** Under every card, every unit row, every node, and as a disabled "FlowchartId" field beside the first input of the unit dialog. |
| W4 | high | **Editing a unit is four steps deep.** ~16 px pencil on a tiny node → modal ("Unit settings", unit unnamed) → accordion → sub-tabs. Icon-only side buttons, no tooltips. |
| W5 | high | **Important Settings forms lack labels, units, and state.** The two planewave cutoffs render as bare "40" / "200" inputs; no edited-vs-default marker, no reset, no filter. |
| W6 | med | **Compute tab is a single unlabeled checkbox** on an empty page. |
| W7 | med | **Destructive actions are instant.** No confirmation, no undo toast, no undo/redo stack. |
| W8 | med | **Add flows hidden.** "Select Unit Actions ▾ → Add Unit"; new subworkflows via kebab → "Add subworkflow" / "Paste subworkflow" (raw JSON textarea). No searchable library, no insert-in-place. |
| W9 | med | **Tab scope ambiguous, names vague.** Overview / Important settings / Detailed view / Compute look global but are per-subworkflow; "Detailed view" repeats Overview; the flowchart starts below the fold. |
| W10 | low | **"idle" status chips in design mode** — job-runtime concept leaking into the designer. |
| W11 | low | **Names repeat 3–4×; property chips duplicate** (fermi_energy twice) and show snake_case keys. |
| W12 | low | **Hard-coded legacy light theme** (`WorkflowDefaultLayout` pins `oldLightMaterialUITheme`), clashing with host theming. |

## Direction

One principle fixes most of the inventory: **one canvas, one source of truth, selection
drives an inspector.** Subworkflows become a compact step rail (they are a sequence, not a
diagram). The canvas gets the reclaimed width and renders units at readable size.
Everything about the current selection — subworkflow or unit — edits in a right-hand
inspector instead of modals and duplicated panels.

## Mockups (see `mockups.html`)

- **A — Shell relayout:** steps rail · canvas · inspector. Readable typed unit cards
  (icon, name, app/flavor, modified-dot), edge "+" to insert in place, selection-driven
  inspector with Settings / Input / Results / Advanced tabs (FlowchartId and Next live in
  Advanced). One header with summary chips and a dirty-dot Save.
- **B — Important Settings rebuilt:** sticky unit index with modified counts, grouped
  cards stating their scope (subworkflow vs unit), labeled fields with engine keyword +
  units (`ecutwfc · Ry`), modified badges, per-field/group reset, live filter,
  domain-shaped controls (k-grid vector row, k-path segment chips).
- **C — Adding things:** unit palette on the edge "+" (typed, described, color-coded);
  "Add step" library dialog with search, app filter, and preview — Paste JSON demoted to a
  power-user tab.
- **D — Input editing:** full-height template editor named after the unit,
  Template/Preview toggle, engine + Jinja syntax colors, variables-in-scope panel with
  values and origins, unresolved-variable warnings instead of silently passing `{{ }}`.
- **E — Compute labeled:** "Override compute for this step" toggle with helper text and a
  proper nodes / ppn / queue / time-limit form.

## Quick wins (≈ a day each, no relayout)

| Change | Where | Fixes |
|--------|-------|-------|
| Hide UUIDs (keep behind a "developer info" toggle) | wove, workflow-designer | W3 |
| Label cutoff fields (Wavefunction / Density cutoff, Ry) via uiSchema | wode uiSchema | W5 |
| Title unit dialog with unit name + type; tooltips on icon buttons | wove, ave | W4 |
| Confirm deletes, or delete-with-Undo snackbar | workflow-designer | W7 |
| Drop "idle" chips in designer context | wove | W10 |
| Rename tabs: Units · Settings · Outputs · Compute; flowchart above Details | workflow-designer | W9 |
| Label the Compute toggle + helper text | workflow-designer | W6 |
| Dedupe + humanize property chips | workflow-designer | W11 |
| Minimum readable node size; auto-fit clamps then pans | wove flowchart | W2 |
| Unsaved-changes dot on Save; warn on navigate-away | workflow-designer | W7 |

## Managing this folder

- **`README.md`** — the review text; edit in place, keep the W-numbering stable (plan
  documents reference it).
- **`mockups.html`** — fully self-contained (styles, scripts, and screenshots inlined as
  data URIs); no build step — open directly in a browser or from the repo. Edit as a
  single file; keep it self-contained so it renders from a checkout.
- **`current-state/*.jpg`** — captures from the standalone demo (`npm run dev`), resized
  to ≤ 1100 px JPEG. Stored in **Git LFS** (see `.gitattributes` at the repo root): run
  `git lfs install` once locally, or clones show pointer files instead of images.
- To refresh captures after UI changes: re-run the demo, replace files under
  `current-state/` (same names when the subject is the same), and commit — the `*.jpg`
  LFS pattern picks them up automatically. Keep captures compressed; LFS storage is
  quota-billed.

## Ownership & phasing

`@mat3ra/wove` owns the flowchart canvas and node cards; **this repo** owns the shell,
tabs, and panel composition; `@mat3ra/wode` owns settings schemas/uiSchemas;
`@mat3ra/ave` owns the execution-unit editor internals; the webapp injects header
components.

1. **Phase 1 (days):** quick-wins table above — cosmetic + safety, zero structural risk.
2. **Phase 2 (1–2 sprints):** Important Settings rebuild (B), input editor + variables
   panel (D), compute form (E) — highest value inside the current layout.
3. **Phase 3 (2–3 sprints):** shell relayout (A), edge insert + palette + step library
   (C), theme tokens instead of the pinned legacy theme.

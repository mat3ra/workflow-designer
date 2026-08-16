# SOF-8024 Portion 6 — Add Flows (Unit Palette & Step Library)

- **Parent:** [sof-8024-ux-0-overview.md](./sof-8024-ux-0-overview.md) · **Ticket:** [SOF-8024](https://mat3ra.atlassian.net/browse/SOF-8024) ·
  **Status:** upcoming
- **Created:** 2026-08-16 · **Updated:** 2026-08-16
- **Scope:** replace the hidden add flows per Mockup C. Fixes W8. Today: units via
  "Select Unit Actions ▾ → Add Unit" (`UnitsFlowchartContainer` toolbar) and
  `src/components/units/UnitTypeSelect.tsx`; subworkflows via the header kebab ("Add
  subworkflow" / "Paste subworkflow" — raw JSON textarea in
  `src/components/units/UnitPaste.tsx`).

## 1. Work items

### 1.1 Unit palette

Popover from the canvas edge "+" (portion 5) and from an always-visible "Add unit"
button (works in classic layout too): typed list — Execution, Assignment, Condition,
Data I/O, Processing, Map — with one-line descriptions and portion-2 type colors.
Inserts at the invoked position via existing
`onUnitAdd(type, prepend, index)` / `Subworkflow.onUnitAdd`. Replaces `UnitTypeSelect`
for in-subworkflow adds.

### 1.2 Step library dialog

Replaces kebab "Add subworkflow"/"Paste subworkflow" for top-level steps. Tabs:

- **Library:** standata subworkflows/workflows (`@mat3ra/standata`
  `WorkflowStandata`), searchable, filter by application, unit-list preview, "inserts
  after step N" placement note.
- **My subworkflows:** account-saved entries via a new optional injected fetch prop on
  `WorkflowComponentsContext` (webapp implements; standalone hides the tab). Open
  question in overview §8 — confirm whether an API exists.
- **Paste JSON:** current `UnitPaste` UI as the third tab (power users keep their path).

Insert honors position via existing
`onUnitAddSubworkflowFromConfig(config, prepend, unitIndex)` (already re-IDs units and
flowchart IDs in `WorkflowDesignerContainer.onUnitAddSubworkflowFromConfig`).

## 2. Dependencies

- Portion 5 for the edge "+" (palette + library dialogs themselves ship earlier against
  classic layout actions).
- Portion 2 tokens for type colors.
- Webapp: "My subworkflows" fetch injection.

## 3. Acceptance

- Adding a unit or step never requires knowing the JSON shape; each palette entry states
  what it creates.
- Library search + app filter work across all standata entries; preview shows the exact
  units to be inserted and the insertion position.
- Paste JSON path still round-trips the same configs as today.
- Inserted position matches the invoked "+" / selected step in both layout variants.
- E2E: insert Density of States after step 1 from the library → canvas shows its units at
  the right position → save payload contains the new subworkflow with fresh IDs.

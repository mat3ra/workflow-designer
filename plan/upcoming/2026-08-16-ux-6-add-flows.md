# SOF-8024 Portion 6 — Add Flows (Unit Palette & Step Library)

- **Parent:** [2026-08-16-ux-0-overview.md](./2026-08-16-ux-0-overview.md) · **Ticket:** [SOF-8024](https://mat3ra.atlassian.net/browse/SOF-8024) ·
  **Status:** built for the classic layout (see below); edge "+" waits on portion 5
- **Updated:** 2026-08-17
- **Scope:** replace the hidden add flows per Mockup C. Fixes W8. Today: units via
  "Select Unit Actions ▾ → Add Unit" (`UnitsFlowchartContainer` toolbar) and
  `src/components/units/UnitTypeSelect.tsx`; subworkflows via the header kebab ("Add
  subworkflow" / "Paste subworkflow" — raw JSON textarea in
  `src/components/units/UnitPaste.tsx`).

## Status (2026-08-17)

Items 1.1 and 1.2 are built on `claude/ux-improvements-msn5h2`, against the classic layout —
the edge "+" affordance is the only part that waits on portion 5, and the dialogs are wired to
the existing header actions in the meantime.

**Unit palette (1.1).** `UnitTypeSelect` was a dropdown of the raw enum strings, with the
explanation of what each type does parked behind an info popover — the one thing the dialog
exists to decide was the one thing it did not show. It is now a list of described cards
(`src/components/units/unitTypeCatalog.ts` holds the descriptions, plus a colour and glyph per
type, ready to become the portion-2 type colours), so "Subworkflow — a named group of units,
run as one step of the workflow" is readable before choosing.

**Step library (1.2).** The header kebab offered "Add subworkflow" (created an empty one) and
"Paste subworkflow" (a bare JSON textarea). Both are replaced by **Add step**
(`src/components/units/StepLibrary.tsx`): 76 ready-made steps from
`SubworkflowStandata`, searchable across step name, application and unit names, filterable by
application, with a preview pane listing the exact units that will be inserted. Paste JSON
survives as the second tab for configs the library does not carry, now with a JSON-parse error
message instead of a silent failure. Adding an empty unit is still reachable, as **Add empty
unit**. Search and shaping live in `stepLibraryEntries.ts` so they are covered by
`tests/stepLibrary.tests.ts` without a DOM.

"My subworkflows" (the account-saved tab) is **not** built: the overview §8 question — whether
a fetch API exists for it — is still open, and the tab would need a webapp-side injection to
mean anything. The library and paste tabs stand on their own until then.

Verified in the standalone demo: the kebab reads "Add convergence · Add step · Add empty unit ·
Remove subworkflow · Collapse all"; the library lists 76 entries, narrows to 19 on "band", and
previews the 4 units of the selected step; the unit picker shows Subworkflow and Map with their
descriptions. `UnitPaste` stays exported for consumers that embed it directly.

### Two defects in the first cut, found while building portion 5 (2026-08-17)

The first version rendered correctly but **could not actually insert** — verification had
stopped at the dialog. Both are fixed, with the insert exercised end to end in both layouts.

1. **`SubworkflowStandata` entries are not directly insertable.** They store the subworkflow's
   application as a bare `{ name: "espresso" }` stub, while every unit inside carries the full
   record. wode builds an `Application` from the subworkflow's copy and validates it while
   rendering, so inserting one threw `IN_MEMORY_ENTITY_DATA_INVALID` and blanked the designer.
   Workflow standata does not have this problem — its subworkflows carry the full record — which
   is why loading a workflow works and inserting the same step did not. `normalizeLibraryConfig`
   now fills the application in from the units, which is worth fixing in standata itself.
2. **The position argument was inverted.** `UnitPaste` established `0 = append to current`,
   `1 = prepend to current`, and the container reads the value as `prepend`; the library passed
   `1` for "after", so every insert landed before the current step.

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

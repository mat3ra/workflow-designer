# SOF-8024 Portion 1 — Quick Wins

- **Parent:** [sof-8024-ux-0-overview.md](./sof-8024-ux-0-overview.md) · **Ticket:** [SOF-8024](https://mat3ra.atlassian.net/browse/SOF-8024) ·
  **Status:** upcoming
- **Created:** 2026-08-16 · **Updated:** 2026-08-16
- **Scope:** ten fixes of ≤ ~1 day each (including tests) inside the current layout.
  Every item stands alone and ships independently.

### 1.1 Hide UUIDs behind a developer toggle — fixes W3

- **Problem:** raw UUIDs render under every subworkflow card, unit row, and flowchart node.
- **Change:** stop rendering IDs by default in `wove` card/node components; add an opt-in
  `showDeveloperInfo` prop threaded from this repo's kebab menu ("Developer info").
- **Touchpoints:** `@mat3ra/wove` node/card components;
  `src/components/subworkflows/SubworkflowHeader.tsx` (kebab action);
  `src/components/workflows/Workflow.tsx` (`getDropdownProps`).
- **Depends on:** wove release.
- **Accept:** default render contains no UUID text anywhere; toggling "Developer info"
  shows them; cypress spec asserts both states.

### 1.2 Label the planewave cutoff fields — fixes W5 (worst instance)

- **Problem:** the two cutoffs render as bare `40` / `200` inputs sharing one description.
- **Change:** add `title` ("Wavefunction cutoff (ecutwfc)", "Charge density cutoff
  (ecutrho)") and unit suffix "Ry" via the provider `uiSchema`; or extend
  `mergeUiSchemaWithDefaultFieldStyles` in
  `src/components/subworkflows/importantSettingsFormUtils.ts` if titles stay local.
- **Depends on:** wode release (preferred home for titles) — or none if local.
- **Accept:** both fields show label + unit for any QE workflow; no other provider forms
  regress (visual pass over the 55 standata workflows in the standalone demo).

### 1.3 Name the unit dialog; tooltip every icon button — fixes W4 (partial)

- **Problem:** modal is titled "Unit settings" regardless of unit; right-rail buttons are
  icon-only.
- **Change:** title becomes "`<unit name>` — `<type>`" (data available on the `unit`
  passed to `src/components/units/UnitModal.tsx`); add `Tooltip` wrappers in the `ave`
  editor rail.
- **Depends on:** ave release for the rail; modal title is local.
- **Accept:** dialog header shows unit name/type; every icon-only button in the dialog
  has a hover/focus tooltip.

### 1.4 Guard deletes with confirm-or-undo — fixes W7 (partial)

- **Problem:** trash icons on subworkflow cards and unit nodes delete instantly.
- **Change:** wrap `onUnitRemove` (workflow level, `src/WorkflowDesignerContainer.tsx`)
  and subworkflow-unit `onUnitRemove` (`src/components/subworkflows/Subworkflow.tsx`)
  with a shared `useConfirmedRemove` hook: MUI dialog naming the target ("Remove unit
  pw_scf?"), or snackbar-undo (10 s) — one pattern for both levels (open question in
  overview §8).
- **Accept:** deleting requires an explicit second action (or is undoable); cypress
  covers cancel and confirm paths at both levels.

### 1.5 Drop "idle" status chips in designer context — fixes W10

- **Change:** wove card header hides the status chip when rendering inside the designer
  (new prop or existing designer flag).
- **Depends on:** wove release.
- **Accept:** no status chips in designer; job views (which reuse these components) keep
  theirs.

### 1.6 Rename tabs and put the flowchart first — fixes W9

- **Change:** `TAB_NAVIGATION_CONFIG` in `src/components/subworkflows/Subworkflow.tsx`
  becomes **Units · Settings · Outputs · Compute**; inside the Units tab render
  `UnitsFlowchartContainer` above the Details accordion (accordion default-collapsed).
  Keep `data-tab-name` attributes stable; update
  `tests/workflowDesignerTabState.tests.ts` if index semantics move.
- **Accept:** tab order/name changes everywhere the designer renders; flowchart visible
  without scrolling at 1440×900 with Details collapsed.

### 1.7 Label the Compute toggle with behavior text — fixes W6

- **Problem:** the `" Run inside a separate job"` checkbox label in
  `src/components/subworkflows/WorkflowCompute.tsx` does not render visibly in the
  standalone demo, and even as intended doesn't explain default behavior.
- **Change:** switch + primary/secondary text per Mockup E ("Override compute for this
  step" / "Off: jobs use the compute settings chosen at job creation…"); fix label
  rendering; keep `data-tid="toggle-compute"`. Full form completion is portion 3.
- **Accept:** toggle text visible in standalone and webapp contexts.

### 1.8 Dedupe and humanize property chips — fixes W11

- **Change:** where chip lists are built (wove `Properties` and the Details accordion in
  `src/components/subworkflows/Subworkflow.tsx`), dedupe by name and map snake_case →
  sentence case ("fermi_energy" → "Fermi energy"), raw key as tooltip.
- **Depends on:** wove release (or dedupe at call site here).
- **Accept:** Band Structure + DoS shows one "Fermi energy" chip; no raw snake_case chips
  in the designer.

### 1.9 Clamp flowchart auto-fit to a readable minimum — fixes W2 (mitigation)

- **Change:** in wove flowchart, define a minimum node scale (readable ~11 px name);
  auto-fit clamps there and enables pan instead of shrinking further.
- **Depends on:** wove release.
- **Accept:** K-point Convergence (10 units) renders with legible names at default zoom
  in a 1200 px-wide right column.

### 1.10 Dirty-state tracking + save affordance — fixes W7 (lossy half)

- **Change:** in `src/WorkflowDesignerContainer.tsx`, keep `initialWorkflowJson` and
  compute `isDirty` on each `setState` (cheap deep-equal or a revision counter bumped by
  every mutating callback); expose through `getSaveBtnProps` in
  `src/components/workflows/Workflow.tsx` (note: currently `isShown: editable &&
  isStandalone` — webapp save lives in the injected header, so also add an optional
  container callback `onDirtyChange` for the shell).
- **Accept:** editing anything marks Save with a dot/badge; saving clears it; standalone
  demo shows the state; webapp can subscribe via `onDirtyChange`.

## Test plan

One cypress spec per item's acceptance line; unit tests for the confirm hook, dirty
logic, and the chip humanize/dedupe mapping.

# SOF-8024 Portion 3 — Important Settings Rebuild

- **Parent:** [2026-08-16-ux-0-overview.md](./2026-08-16-ux-0-overview.md) · **Ticket:** [SOF-8024](https://mat3ra.atlassian.net/browse/SOF-8024) ·
  **Status:** upcoming
- **Updated:** 2026-08-16
- **Scope:** rebuild the Settings (today "Important settings") tab per Mockup B, plus
  Compute form completion (Mockup E). Fixes W5 and closes W6.
- **Contract to preserve:** provider API (`provider.jsonSchema`, `uiSchema`, `getData()`,
  `setData()`, `setIsEdited()`), `unit.savePersistentContext()`, and the
  `onContextChanged` flow into `Subworkflow.onImportantSettingsContextChanged` (syncs
  `unitsInstances` → serialized `units` before `onUpdate`). Existing behavior guarded by
  the current tests must keep passing.

## 1. Work items

### 1.1 Grouped scoped cards

One card per context provider in
`src/components/subworkflows/ImportantSettings.tsx`: header = provider title (extend
`getProviderTitle` — today it only maps `boundaryConditions` — into a full title map),
scope line ("applies to whole subworkflow" vs "unit `<name>`"), modified badge, group
Reset action.

### 1.2 Sticky unit index

Left mini-TOC with per-unit modified counts, anchoring to cards. Source of truth:
`provider.isEdited` (already persisted via `setIsEdited(true)` on change). Requires a
`resetToDefault()` path — verify per provider in `@mat3ra/wode` whether schema `default`s
reconstruct the pristine data; add the helper there if missing.

### 1.3 Field-level state

Modified highlight + "default X · reset field" line under changed fields. Implement as an
RJSF `FieldTemplate` — preferred home: `@mat3ra/cove`'s `RJSForm` behind an opt-in prop;
fallback: local template merged via
`src/components/subworkflows/importantSettingsFormUtils.ts`.

### 1.4 Filter

Search box hiding non-matching cards; match on title, field labels, and engine keywords
(`ecutwfc`…). Client-side only.

### 1.5 Domain widgets

- K-grid: labeled 3-vector rows (Dimensions / Shifts × b₁ b₂ b₃) as a custom RJSF widget.
- K-path: segment chips (Γ → X · steps) with add/remove, replacing the raw array form;
  keep the `BrillouinZoneImageComponent` hook.

### 1.6 Compute form completion (Mockup E; extends quick-win 1.7)

Full labeled form (Nodes, Cores per node (ppn), Queue, Time limit — labels live in
`@mat3ra/ive` `ComputeForm`; file follow-up there if missing) + summary line
("Estimated: N cores · up to T on `<cluster>`" from `clusters` + values) in
`src/components/subworkflows/WorkflowCompute.tsx`.

## 2. Dependencies

- wode: `resetToDefault()` (1.2), uiSchema titles if not landed in portion 1.
- cove: RJSF field template (1.3); tokens from portion 2 for modified-state colors.
- ive: ComputeForm labels (1.6).
- Everything else local.

## 3. Acceptance

- All 55 standata workflows render settings with labels and scopes; no regressions in
  saved payloads (serialized `units[].context` identical for untouched settings).
- Changed field shows modified state; field and group reset restore defaults and clear
  badges; TOC counts update live.
- Filter narrows cards by label and engine keyword.
- E2E: edit a cutoff → badge appears → save payload contains change → reset → badge
  clears; `tests/subworkflowDesignerUpdate.tests.ts` and tab-state tests keep passing.

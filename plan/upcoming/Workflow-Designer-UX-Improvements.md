# Workflow Designer UX Improvements — Implementation Plan

- **Ticket:** TBD — rename this file to `<TICKET>-Workflow-Designer-UX-Improvements.md` once one exists.
- **Status:** upcoming — direction agreed via the UX review; nothing built yet.
- **Review inputs:** [`docs/ux/README.md`](../../docs/ux/README.md) (issue inventory W1–W12),
  [`docs/ux/mockups.html`](../../docs/ux/mockups.html) (Mockups A–E),
  [`docs/ux/current-state/`](../../docs/ux/current-state/) (captures).
- **Branch:** `claude/ux-improvements-msn5h2`.

## 1. Background

The 2026-08 UX review of the workflow designer (run against the standalone demo with all 55
standata workflows) found three recurring failure modes: duplicated information (the left
column repeats the right panel), hidden or hostile primary actions (edit unit, add unit,
add subworkflow), and pixels spent on internals (UUIDs, empty canvas, job-runtime chips)
instead of the workflow. Full inventory and mockups in the review inputs above.

This plan turns the review into ordered, verifiable work items. Phases are independent:
each ships alone, and later phases assume earlier ones only where stated.

## 2. Goals and non-goals

**Goals**

1. A workflow with 10+ units is readable and editable without zooming or opening modals.
2. Every editable field is labeled, shows units where physical, and reveals
   modified-vs-default state.
3. Destructive and lossy actions are guarded (confirm/undo, dirty tracking).
4. The designer follows the host theme instead of pinning the legacy light theme.

**Non-goals**

- No changes to workflow semantics, serialization (`@mat3ra/wode` schemas), or job
  execution.
- No redesign of the surrounding webapp pages (only components this library renders or
  injects via `WorkflowComponentsContext`).
- Map/convergence authoring logic stays as-is (UI re-skinned only where it rides along).

## 3. Ownership map (which repo owns what)

| Area | Package | Notes |
|------|---------|-------|
| Shell, tabs, panel composition, container state | **this repo** | `src/WorkflowDesignerContainer.tsx`, `src/components/**` |
| Flowchart canvas + unit node cards + unit list | `@mat3ra/wove` | `WorkflowUnitsFlowchart`, `UnitsFlowchartContainer`, `Properties` |
| Execution-unit editor internals (Next/FlowchartId/template) | `@mat3ra/ave` | `ExecutionUnit`, `ExecutionUnitViewer` |
| Important-settings schemas/uiSchemas, context providers | `@mat3ra/wode` | provider `jsonSchema` / `uiSchema` |
| Compute form | `@mat3ra/ive` | `ComputeForm` |
| Theme, tabs menu, accordion, RJSF wrapper | `@mat3ra/cove` | `ThemeProvider`, `TabsMenu`, `RJSForm` |

Release order for any cross-repo item: publish the dependency (`wove`/`wode`/`ave`), bump
the pin here, then land the consuming change here. Each item below states its blocking
dependency if any.

## 4. Phase 1 — Quick wins (days; no relayout)

Each item stands alone and is expected to be ≤ ~1 day including tests.

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
- **Change:** add `title` (e.g. "Wavefunction cutoff (ecutwfc)", "Charge density cutoff
  (ecutrho)") and unit suffix "Ry" via the provider `uiSchema`; extend
  `mergeUiSchemaWithDefaultFieldStyles` in
  `src/components/subworkflows/importantSettingsFormUtils.ts` to pass titles through if
  the schema change lands in `@mat3ra/wode` context providers instead.
- **Depends on:** wode release (preferred home for titles) — or none if done via local
  uiSchema merge.
- **Accept:** both fields show label + unit in the Important Settings tab for any
  QE workflow; no other provider forms regress (visual pass over the 55 standata
  workflows in the standalone demo).

### 1.3 Name the unit dialog; tooltip every icon button — fixes W4 (partial)

- **Problem:** modal is titled "Unit settings" regardless of unit; right-rail buttons are
  icon-only.
- **Change:** title becomes "`<unit name>` — `<type>`" (data available on the `unit` passed
  to `src/components/units/UnitModal.tsx`); add `Tooltip` wrappers in the `ave` editor
  rail.
- **Depends on:** ave release for the rail; modal title is local.
- **Accept:** dialog header shows unit name/type; every icon-only button in the dialog has
  a hover/focus tooltip.

### 1.4 Guard deletes with confirm-or-undo — fixes W7 (partial)

- **Problem:** trash icons on subworkflow cards and unit nodes delete instantly.
- **Change:** wrap `onUnitRemove` (workflow level, `src/WorkflowDesignerContainer.tsx`) and
  subworkflow-unit `onUnitRemove` (`src/components/subworkflows/Subworkflow.tsx`) with a
  shared `useConfirmedRemove` hook: MUI dialog naming the target ("Remove unit pw_scf?"),
  or snackbar-undo (10 s) — pick one pattern and use it for both levels.
- **Depends on:** nothing external.
- **Accept:** deleting requires an explicit second action (or is undoable); cypress covers
  cancel and confirm paths at both levels.

### 1.5 Drop "idle" status chips in designer context — fixes W10

- **Change:** wove card header hides the status chip when rendering inside the designer
  (new prop or existing `isStandalone`/designer flag).
- **Depends on:** wove release.
- **Accept:** no status chips in designer; job views (which reuse these components) keep
  theirs.

### 1.6 Rename tabs and put the flowchart first — fixes W9

- **Change:** `TAB_NAVIGATION_CONFIG` in `src/components/subworkflows/Subworkflow.tsx`
  becomes **Units · Settings · Outputs · Compute** ("Important settings" → "Settings",
  "Detailed view" → "Outputs", "Overview" → "Units"); inside the Units tab render
  `UnitsFlowchartContainer` above the Details accordion (accordion default-collapsed).
- **Depends on:** nothing external. Keep `data-tab-name` attributes stable for tests;
  update `tests/workflowDesignerTabState.tests.ts` if index semantics move.
- **Accept:** tab order/name change everywhere the designer renders; flowchart visible
  without scrolling at 1440×900 with Details collapsed.

### 1.7 Label the Compute toggle with behavior text — fixes W6

- **Problem:** the `" Run inside a separate job"` label on the checkbox in
  `src/components/subworkflows/WorkflowCompute.tsx` does not render visibly in the
  standalone demo, and even as intended it doesn't explain default behavior.
- **Change:** replace with switch + primary/secondary text per Mockup E ("Override compute
  for this step" / "Off: jobs use the compute settings chosen at job creation…"); fix the
  label rendering; keep `data-tid="toggle-compute"`.
- **Accept:** toggle text visible in standalone and webapp contexts; form fields labeled
  (Nodes, Cores per node (ppn), Queue, Time limit) — field labels live in
  `@mat3ra/ive` `ComputeForm`, so file a follow-up there if missing.

### 1.8 Dedupe and humanize property chips — fixes W11

- **Change:** where property chip lists are built (wove `Properties` and the Details
  accordion in `src/components/subworkflows/Subworkflow.tsx`), dedupe by name and map
  snake_case → sentence case ("fermi_energy" → "Fermi energy"), keeping the raw key as
  tooltip.
- **Depends on:** wove release (or dedupe at call site here).
- **Accept:** Band Structure + DoS shows one "Fermi energy" chip; no raw snake_case chips
  in the designer.

### 1.9 Clamp flowchart auto-fit to a readable minimum — fixes W2 (mitigation)

- **Change:** in wove flowchart, define a minimum node scale (readable ~11 px name);
  auto-fit clamps there and enables pan instead of shrinking further.
- **Depends on:** wove release.
- **Accept:** K-point Convergence (10 units) renders with legible names at default zoom in
  a 1200 px-wide right column.

### 1.10 Dirty-state tracking + save affordance — fixes W7 (lossy half)

- **Change:** in `src/WorkflowDesignerContainer.tsx`, keep `initialWorkflowJson` and
  compute `isDirty` on each `setState` (cheap deep-equal or revision counter incremented
  by every mutating callback); expose through `getSaveBtnProps` in
  `src/components/workflows/Workflow.tsx` (note: currently `isShown: editable &&
  isStandalone` — webapp save lives in the injected header, so also pass `isDirty` out via
  a new optional container callback `onDirtyChange` for the shell to consume).
- **Accept:** editing anything marks Save with a dot/badge; saving clears it; standalone
  demo shows the state; webapp can subscribe via `onDirtyChange`.

## 5. Phase 2 — Settings & editing depth (1–2 sprints)

### 2.1 Important Settings rebuild (Mockup B) — fixes W5

- **Scope:** rewrite `src/components/subworkflows/ImportantSettings.tsx` rendering while
  keeping the provider contract (`provider.jsonSchema`, `uiSchema`, `getData()`,
  `setData()`, `setIsEdited()`, `unit.savePersistentContext()`, and the
  `onContextChanged` flow into `Subworkflow.onImportantSettingsContextChanged`).
- **Work items:**
  1. **Grouped cards** per provider with header: provider title (extend
     `getProviderTitle` into a proper title map), scope line ("applies to whole
     subworkflow" vs "unit `<name>`"), modified badge, Reset (group) action.
  2. **Sticky unit index** (left mini-TOC) with per-unit modified counts; anchors to
     cards. Source of truth: `provider.isEdited` — already persisted by
     `setIsEdited(true)` on change; add `resetToDefault()` usage (wode exposes defaults
     via schema `default`s; verify per provider).
  3. **Field-level state:** modified highlight + "default X · reset field" line under
     changed fields (RJSF custom `FieldTemplate` in `@mat3ra/cove`'s `RJSForm` or a local
     template here).
  4. **Filter box** hiding non-matching cards (match on title + field labels + engine
     keywords).
  5. **Domain widgets:** k-grid as labeled 3-vector rows (custom RJSF widget), k-path as
     segment chips with add/remove (replaces the raw array form). Keep
     `BrillouinZoneImageComponent` hook.
- **Depends on:** possibly wode (provider `resetToDefault`, uiSchema titles), cove (RJSF
  templates). Everything else local.
- **Accept:** all 55 standata workflows render their settings with labels and scopes; a
  changed field shows modified state and resets correctly; filter narrows cards; e2e spec
  edits a cutoff, sees the badge, resets, badge clears; `subworkflow.units` still receive
  persisted context (existing tests keep passing).

### 2.2 Input editor + variables panel (Mockup D) — fixes W4

- **Scope:** the template-editing experience currently inside the `ave` `ExecutionUnit`
  accordion.
- **Work items:**
  1. Full-height editor layout titled "`<unit>` — input" with file tab +
     Template/Preview segmented toggle (replaces nested accordion + sub-tabs).
  2. Syntax highlighting for engine format + Jinja tokens; highlight `{{ … }}` spans.
  3. **Render check:** run the existing preview render, list unresolved variables as
     warnings with line refs instead of silently emitting `{{ }}`; status bar shows the
     render context ("renders with: Si (mp-149) · step 1 context").
  4. **Variables panel:** enumerate the unit's rendering context (available from
     `executionUnit.renderingContext` passed in
     `src/components/units/UnitModalContent.tsx`), with value + origin; click inserts at
     cursor; unknown-variable suggestions by edit distance.
  5. Move `Next` (execution order) and read-only `FlowchartId` into an "Advanced" section.
- **Depends on:** ave release (bulk of the work); this repo only re-composes
  `UnitModal`/`UnitModalContent`.
- **Accept:** opening input editing from a unit takes ≤ 2 clicks; unresolved variable in a
  template produces a visible warning naming the variable; FlowchartId no longer appears
  in the primary form.

### 2.3 Compute form completion (Mockup E) — closes W6

- Finish 1.7 with the full labeled form + "Estimated: N cores · up to T on `<cluster>`"
  summary line (data available from `clusters` + form values).
- **Accept:** enabled state shows a complete labeled form; disabled state explains where
  compute then comes from.

## 6. Phase 3 — Shell relayout (2–3 sprints)

### 3.1 Rail · canvas · inspector (Mockup A) — fixes W1, W2, W4, W9, W11

- **Scope:** replace the two-column duplication in
  `src/components/workflows/WorkflowDefaultLayout.tsx` (today: left
  `WorkflowUnitsFlowchart` `lg=4` + right subworkflow panel `lg=8`).
- **Work items:**
  1. **Steps rail** (~210 px): numbered subworkflow/map units of the top-level workflow —
     name, app, unit count; select / drag-reorder / context menu (rename, duplicate,
     remove); "+ Add step" opens the step library (3.2). Replaces wove
     `WorkflowUnitsFlowchart` here.
  2. **Canvas** (center, flexible): current `UnitsFlowchartContainer` for the selected
     step at readable node size; edge "+" inserts via palette (3.2); Fit/zoom/Tidy
     controls top-right.
  3. **Inspector** (~320 px): selection-driven — step selected → Details content
     (Properties, Application, Model, Method panels moved from the Overview accordion);
     unit selected → tabs Settings / Input / Results / Advanced reusing Phase-2
     components. Modal remains only as "expand" for the input editor.
  4. **Header:** one title + breadcrumb, app/model/method summary chips, validation chip
     (count from `WorkflowValidationAlert` data, click → select offending unit), Save
     with dirty dot, kebab (existing `extraActions` + developer info).
  5. **Migration/rollout:** new layout behind a container prop
     `layoutVariant: "classic" | "studio"` (default `classic`); standalone demo gets a
     switcher; webapp flips per-tenant, then default flips and `classic` is removed after
     one release cycle. Keep `subworkflowActiveTabIndexById` persistence
     (`src/components/workflows/workflowDesignerTabState.ts`) working in both.
- **Depends on:** Phase 2 components; wove canvas API (node size, selection events,
  edge-insert affordance).
- **Accept:** no information rendered twice; Band Structure + DoS fully navigable at
  1440×900 without horizontal scroll; K-point Convergence readable; all existing
  container callbacks (`onUnitAdd`, `onUnitRemove`, `onSubworkflowUnitUpdate`, …) keep
  their signatures; cypress suite passes in both layout variants during the transition.

### 3.2 Unit palette + step library (Mockup C) — fixes W8

- **Work items:**
  1. **Palette popover** on edge "+" and an always-visible "Add unit" button: typed list
     (Execution, Assignment, Condition, Data I/O, Processing, …) with one-line
     descriptions and type colors; replaces `UnitTypeSelect` dialog
     (`src/components/units/UnitTypeSelect.tsx`) for in-subworkflow adds.
  2. **Step library dialog** replacing kebab "Add subworkflow"/"Paste subworkflow":
     tabs Library (standata via `WorkflowStandata`/`SubworkflowStandata`), My
     subworkflows (webapp-injected fetch — new optional context prop), Paste JSON
     (existing `UnitPaste` UI as the third tab); search + app filter + unit preview;
     insert position honored (`onUnitAddSubworkflowFromConfig(config, prepend,
     unitIndex)` already supports it).
- **Depends on:** 3.1 for edge "+" (palette itself can ship earlier against the classic
  layout's "Add Unit" action).
- **Accept:** adding a unit or step never requires knowing the JSON shape; paste path
  still works; inserted position matches the invoked "+".

### 3.3 Theming — fixes W12

- **Change:** remove the pinned `oldLightMaterialUITheme` `ThemeProvider` in
  `src/components/workflows/WorkflowDefaultLayout.tsx`; consume the ambient MUI theme;
  audit hardcoded colors (`#cecece` border, status classes) into theme tokens; verify in
  the standalone demo's dark theme and the webapp light theme.
- **Depends on:** cove theme tokens covering the designer's needs.
- **Accept:** designer renders correctly under both demo dark and webapp light themes with
  no pinned provider; no hardcoded hex in `src/components/**` (lint check).

## 7. Testing strategy

- **E2E (cypress, `tests/cypress`):** one spec per phase-item marked "Accept" above;
  baseline flows to lock before refactors: select workflow → edit cutoff → save payload
  contains change; add/remove unit; tab persistence across branch switches (guard the
  behavior behind `workflowDesignerTabState`).
- **Unit tests:** alongside existing `tests/*.tests.ts` — dirty-state logic, confirm-hook,
  tab index migration, chip dedupe/humanize mapping.
- **Visual sweep:** standalone demo script iterating all 55 workflows × key tabs,
  screenshotting for manual/DIFF review (the review's Playwright scripts are a starting
  point).

## 8. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Cross-repo releases (wove/wode/ave) serialize the work | Phase items marked "local" proceed independently; batch dependency PRs early in each phase |
| Webapp embeds the designer with injected components; layout change breaks host CSS assumptions | `layoutVariant` prop + per-tenant rollout (3.1.5); keep classic until parity confirmed |
| RJSF customization (templates/widgets) fights `@mat3ra/cove`'s wrapper | Land field templates in cove behind opt-in props; fall back to local templates here |
| Undo/confirm changes callback timing that job designer reuses | Keep all existing callback signatures; guards live above the callbacks, not inside wode mutations |
| Tab renames break tests/selectors keyed on labels | Keep `data-tab-name`/`data-tid` attributes stable; update the two tab-state tests in `tests/` |

## 9. Open questions

1. Ticket + epic to file these under (then rename this document per convention).
2. Confirm-dialog vs snackbar-undo for deletes (1.4) — pick one pattern platform-wide.
3. Does "My subworkflows" (3.2) exist as an API the webapp can inject today, or is it new?
4. Where do design tokens for the refreshed look live — extend `@mat3ra/cove` theme or a
   new tokens module?
5. Should the step library replace standata `Workflow` picking in the webapp's "new
   workflow" flow too, for consistency?

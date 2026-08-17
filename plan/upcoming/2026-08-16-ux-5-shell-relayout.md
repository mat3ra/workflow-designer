# SOF-8024 Portion 5 — Shell Relayout (rail · canvas · inspector)

- **Parent:** [2026-08-16-ux-0-overview.md](./2026-08-16-ux-0-overview.md) · **Ticket:** [SOF-8024](https://mat3ra.atlassian.net/browse/SOF-8024) ·
  **Status:** in progress — rollout mechanism and steps rail built; canvas and inspector remain
- **Updated:** 2026-08-17
- **Scope:** replace the duplicated two-column layout with the Mockup A shell. Fixes W1,
  W2, W4, W9, W11. Today: `src/components/workflows/WorkflowDefaultLayout.tsx` renders
  wove `WorkflowUnitsFlowchart` (left, `lg=4`) + subworkflow tabs panel (right, `lg=8`).

## Status (2026-08-17)

Items **1.5 (rollout)** and **1.1 (steps rail)** are built on `claude/ux-improvements-msn5h2`;
1.2 (canvas) and 1.3 (inspector) are not.

**Rollout first, deliberately.** `layoutVariant: "classic" | "studio"` is plumbed
`WorkflowDesignerContainer` → `Workflow` → the layout component, defaulting to `classic`, so
every host renders exactly what it renders today until it opts in. The standalone demo has a
Layout selector, which is also how the two are compared. `resolveWorkflowLayoutVariant` treats
anything unrecognized as `classic`, so a stale or misspelled host config degrades to the old
layout rather than to a broken one.

To keep the two shells from drifting, the editing surface they share — validation alert,
`SubworkflowHeader`, and the subworkflow / map / error content — moved into
`WorkflowUnitPanel`. Both variants render it with identical props; they differ only in what sits
beside it. The classic layout is otherwise untouched, and was re-checked after the extraction:
flowchart column present, rail absent, tabs and kebab unchanged, no page errors.

**The rail (1.1)** replaces the left column's second flowchart, which drew the same steps the
right-hand panel already had open — the duplication behind W1, and the reason a three-step
workflow needed a wide screen. A step now states its name, its engine and how many units it
holds: "01 · CP-MD · espresso · 1 unit". Status chips appear only for steps that are not idle,
so a workflow being designed spends no pixels on job runtime state (W9). Select, rename, remove
and "Add step" (the portion-6 library) all go through the container callbacks the classic layout
already used — `onUpdateUnitIndex`, `onUnitNameUpdate`, `handleUnitRemove`,
`onUnitAddSubworkflowFromConfig` — so no new container surface was added.

Because the studio layout does not pin `oldLightMaterialUITheme`, it also picks up the ambient
theme: portion 2's item 3.3 first bullet, and the demo now renders the designer in dark.

Two bugs worth recording, both found by exercising the rail rather than reading it:

- Starting a rename from the step menu mounted a field the menu's focus trap immediately blurred
  — which committed and closed it — so the rename never appeared. `disableRestoreFocus` was not
  enough; the field now waits for the menu's exit transition to finish.
- The rail's steps must **not** be memoized on the workflow entity: wode mutates the workflow in
  place, so its identity survives a rename and a memo kept serving the old names.

**Not built:** 1.2 (canvas node cards, edge "+"), 1.3 (the selection-driven inspector, which
needs portion 4's editor for its Input tab), 1.4 (header consolidation — the workflow name and
the step name still both render when a single-step workflow shares its name), and drag-reorder,
which has no container callback today: `onUpdateUnitIndex` moves the selection, not the order.

## 1. Work items

### 1.1 Steps rail (~210 px)

Numbered top-level units (subworkflow/map) of the workflow: name, application, unit
count; select / drag-reorder / context menu (rename, duplicate, remove); "+ Add step"
opens the step library (portion 6). Replaces `WorkflowUnitsFlowchart` here (component
stays for job views). Reuses existing container callbacks: `onUpdateUnitIndex`,
`onUnitNameUpdate`, `handleUnitRemove`, `onUnitAdd`.

### 1.2 Canvas (center, flexible)

`UnitsFlowchartContainer` for the selected step at readable node size (portion-1 clamp
becomes the floor); edge "+" insert affordance (portion 6 palette); Fit / zoom / Tidy
controls top-right. Node cards per Mockup A: type icon + color (portion-2
`theme.designer.unitType.*`), name, app/flavor meta, modified dot (from
`provider.isEdited` aggregation), hover actions (edit/duplicate/delete).

### 1.3 Inspector (~320 px, selection-driven)

- Step selected → Details content moved out of the Overview accordion: `Properties`,
  `ApplicationAve`, `Model`, `SubworkflowMethodPanel` (all currently composed in
  `src/components/subworkflows/Subworkflow.tsx`).
- Unit selected → tabs **Settings / Input / Results / Advanced**: Settings embeds the
  unit's portion-3 cards; Input mounts the portion-4 editor (with an expand-to-dialog
  affordance); Results carries the "Outputs" content
  (`SubworkflowExecutionUnitDetailsRow` data: results, monitors, post-processors, Draft);
  Advanced carries Next/FlowchartId.
- Tab persistence: extend `workflowDesignerTabState.ts` keying from subworkflow-id to
  (subworkflow-id, unit-id) without resetting on `job.render()` remounts (preserve the
  documented remount behavior in `WorkflowDefaultLayout`).

### 1.4 Header consolidation

One title + breadcrumb via the injected `EntityHeaderComponent`; summary chips (app ·
model · method from `entity.usedApplicationNames` + subworkflow model/method); validation
chip (count from `WorkflowValidationAlert`'s `collectErrorUnitLabels`, click → select the
offending unit); Save with dirty dot (quick-win 1.10); kebab keeps `extraActions` +
Developer info. Duplicate name renders (title bar / left card / selector) collapse to
one.

### 1.5 Rollout mechanism

New layout behind a container prop `layoutVariant: "classic" | "studio"` (default
`classic`), plumbed from `WorkflowDesignerContainer` → `Workflow` →
`WorkflowDefaultLayout` vs new `WorkflowStudioLayout`. Standalone demo gets a variant
switcher; webapp flips per-tenant; default flips after parity sign-off; `classic` removed
one release later. All existing container callback signatures unchanged.

## 2. Dependencies

- Portions 3 and 4 components (inspector content); portion 2 tokens; wove canvas API
  work: selection events, node-size floor, edge-insert hook, `showDeveloperInfo`.
- Map units: `MapWorkflowDesigner` keeps rendering in the main area when a map step is
  selected (unchanged internals; studio shell provides the frame).

## 3. Acceptance

- No information rendered twice anywhere in the designer.
- Band Structure + DoS fully navigable at 1440×900 without horizontal scroll; K-point
  Convergence readable at default zoom.
- Selecting units/steps drives the inspector; the unit dialog remains only as the
  expanded input editor.
- Cypress suite passes in **both** variants during the transition; tab-state unit tests
  extended for the new keying.
- Error units: validation chip lists them; clicking selects the unit and the inspector
  shows `ErrorUnitContent`.

# WFD-UX Portion 5 — Shell Relayout (rail · canvas · inspector)

- **Parent:** [WFD-UX-0-Overview.md](./WFD-UX-0-Overview.md) · **Ticket:** TBD ·
  **Status:** upcoming
- **Scope:** replace the duplicated two-column layout with the Mockup A shell. Fixes W1,
  W2, W4, W9, W11. Today: `src/components/workflows/WorkflowDefaultLayout.tsx` renders
  wove `WorkflowUnitsFlowchart` (left, `lg=4`) + subworkflow tabs panel (right, `lg=8`).

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

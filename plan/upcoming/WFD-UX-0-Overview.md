# Workflow Designer UX Improvements — Overview (main plan)

- **Ticket:** TBD — prefix this document set with the real ticket once filed
  (`<TICKET>-…`), keeping the numeric portion ordering.
- **Status:** upcoming — direction agreed via the UX review; nothing built yet.
- **Review inputs:** [`docs/ux/README.md`](../../docs/ux/README.md) (issue inventory
  W1–W12), [`docs/ux/mockups.html`](../../docs/ux/mockups.html) (Mockups A–E),
  [`docs/ux/current-state/`](../../docs/ux/current-state/) (captures).
- **Branch:** `claude/ux-improvements-msn5h2`.

## 1. Background

The 2026-08 UX review of the workflow designer (standalone demo, all 55 standata
workflows) found three recurring failure modes: duplicated information (the left column
repeats the right panel), hidden or hostile primary actions (edit unit, add unit, add
subworkflow), and pixels spent on internals (UUIDs, empty canvas, job-runtime chips)
instead of the workflow.

This is the **main document**: goals, the portions the work is cut into, ownership,
sequencing, and risks. Each portion has its own detailed document with work items,
touchpoints, and acceptance criteria. The portion documents are the unit of execution and
of `plan/` lifecycle — move each to `review/` / `implemented/` independently as it
progresses; this overview moves last.

## 2. Goals and non-goals

**Goals**

1. A workflow with 10+ units is readable and editable without zooming or opening modals.
2. Every editable field is labeled, shows units where physical, and reveals
   modified-vs-default state.
3. Destructive and lossy actions are guarded (confirm/undo, dirty tracking).
4. The designer expresses the **Mat3ra design language** — brand palette, typography, and
   designer-specific tokens — in light and dark, instead of pinning the legacy stock-MUI
   light theme.

**Non-goals**

- No changes to workflow semantics, serialization (`@mat3ra/wode` schemas), or job
  execution.
- No redesign of the surrounding webapp pages (only components this library renders or
  injects via `WorkflowComponentsContext`).
- Map/convergence authoring logic stays as-is (UI re-skinned only where it rides along).

## 3. Portions

| # | Document | Scope (one line) | Fixes | Size |
|---|----------|------------------|-------|------|
| 1 | [WFD-UX-1-Quick-Wins.md](./WFD-UX-1-Quick-Wins.md) | Ten ≤1-day fixes inside the current layout: UUIDs, labels, tooltips, delete guards, tab renames, dirty state | W2–W7, W9–W11 | days |
| 2 | [WFD-UX-2-Design-Language.md](./WFD-UX-2-Design-Language.md) | Mat3ra brand beyond stock themes: token inventory, designer-specific tokens (unit types, canvas, states), light+dark, typography | W12 + brand | 1 sprint, then adoption |
| 3 | [WFD-UX-3-Important-Settings.md](./WFD-UX-3-Important-Settings.md) | Settings tab rebuild: grouped scoped cards, modified/reset state, filter, domain widgets; Compute form completion | W5, W6 | 1 sprint |
| 4 | [WFD-UX-4-Input-Editor.md](./WFD-UX-4-Input-Editor.md) | Template editing: full-height editor, syntax + render checks, variables panel, Advanced demotion of internals | W4 | 1 sprint |
| 5 | [WFD-UX-5-Shell-Relayout.md](./WFD-UX-5-Shell-Relayout.md) | Rail · canvas · inspector shell replacing the duplicated two-column layout; header consolidation; rollout via `layoutVariant` | W1, W2, W4, W9, W11 | 2 sprints |
| 6 | [WFD-UX-6-Add-Flows.md](./WFD-UX-6-Add-Flows.md) | Unit palette on edge "+", step library dialog (search/filter/preview) replacing JSON paste | W8 | 1 sprint |

## 4. Ownership map (which repo owns what)

| Area | Package | Notes |
|------|---------|-------|
| Shell, tabs, panel composition, container state | **this repo** | `src/WorkflowDesignerContainer.tsx`, `src/components/**` |
| Flowchart canvas + unit node cards + unit list | `@mat3ra/wove` | `WorkflowUnitsFlowchart`, `UnitsFlowchartContainer`, `Properties` |
| Execution-unit editor internals (Next/FlowchartId/template) | `@mat3ra/ave` | `ExecutionUnit`, `ExecutionUnitViewer` |
| Important-settings schemas/uiSchemas, context providers | `@mat3ra/wode` | provider `jsonSchema` / `uiSchema` |
| Compute form | `@mat3ra/ive` | `ComputeForm` |
| Theme, palettes, component overrides, RJSF wrapper | `@mat3ra/cove` | `dist/theme/{palette,typography,theme}` — see portion 2 |

Release order for any cross-repo item: publish the dependency (`cove`/`wove`/`wode`/
`ave`), bump the pin here, then land the consuming change here. Each portion document
states its blocking dependencies.

## 5. Sequencing

1. **Phase 1 (days):** Portion 1 (quick wins) + Portion 2 token definition (the cove-side
   work), which unblocks everything visual that follows.
2. **Phase 2 (1–2 sprints):** Portions 3 and 4 — highest-value depth inside the current
   layout; adopt portion-2 tokens as these components are rebuilt.
3. **Phase 3 (2–3 sprints):** Portions 5 and 6 — the structural move — plus portion-2
   adoption completion (un-pin the legacy theme, delete hardcoded colors).

Dependencies across portions: 5 consumes components from 3 and 4 (inspector tabs); 6's
edge "+" needs 5's canvas, but the palette and library dialogs can ship against the
classic layout first; 2 blocks nothing but is consumed by all.

## 6. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Cross-repo releases (cove/wove/wode/ave) serialize the work | Items marked "local" proceed independently; batch dependency PRs early in each phase |
| Webapp embeds the designer; layout/theme changes break host assumptions | `layoutVariant` prop + per-tenant rollout (portion 5); theme adoption gated on cove tokens landing first (portion 2) |
| Brand palette not yet canonical (purple `#7c5fcd` in code vs marketing site) | Portion 2 opens with a decision item signed off by design/marketing before adoption spreads |
| RJSF customization fights `@mat3ra/cove`'s wrapper | Land field templates in cove behind opt-in props; fall back to local templates here |
| Undo/confirm changes callback timing the job designer reuses | Keep all existing callback signatures; guards live above the callbacks, not inside wode mutations |
| Tab renames break tests/selectors keyed on labels | Keep `data-tab-name`/`data-tid` stable; update the two tab-state tests in `tests/` |

## 7. Testing strategy (applies to every portion)

- **E2E (cypress, `tests/cypress`):** each portion document lists specs for its acceptance
  criteria; baseline flows to lock before refactors: select workflow → edit cutoff → save
  payload contains change; add/remove unit; tab persistence across branch switches.
- **Unit tests:** alongside existing `tests/*.tests.ts` — dirty-state logic, confirm hook,
  tab index migration, chip dedupe/humanize mapping, token resolution.
- **Visual sweep:** standalone demo script iterating all 55 workflows × key tabs,
  screenshotting for diff review (the review's Playwright scripts are the starting
  point); rerun per phase in light and dark.

## 8. Open questions

1. Ticket/epic for the set (then rename all documents per convention).
2. Canonical Mat3ra brand palette: confirm with design/marketing (see portion 2 §2).
3. Confirm-dialog vs snackbar-undo for deletes — one pattern platform-wide (portion 1).
4. Does "My subworkflows" exist as an injectable API today, or is it new (portion 6)?
5. Should the step library also replace the webapp's "new workflow" standata picker for
   consistency (portion 6)?

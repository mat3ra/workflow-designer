# Workflow Viewer — isolating view from design (main plan)

- **Ticket:** [SOF-8035](https://mat3ra.atlassian.net/browse/SOF-8035) (relates to
  [SOF-8024](https://mat3ra.atlassian.net/browse/SOF-8024))
- **Status:** proposed — nothing built yet; this document is the direction.
- **Updated:** 2026-08-27
- **Branch:** `claude/ux-improvements-msn5h2` (reviewable alongside the UX work on
  [workflow-designer#12](https://github.com/mat3ra/workflow-designer/pull/12)).
- **Related plans:** [`2026-08-16-ux-0-overview.md`](./2026-08-16-ux-0-overview.md) — this
  plan builds on capabilities added there (steps model, studio layout, unit-card meta,
  designer tokens).

## 1. The ask

Separate the workflow **designer** capability — load, edit, save — from a pure **view**
capability that only renders a workflow. The view capability belongs in `@mat3ra/wove`
(the workflow view package; that is its name). It must be cheap enough to embed in a
Jupyter notebook, a docs page, or any standalone host that has no Meteor, no Redux, no
save endpoint, and possibly no JavaScript runtime at render time.

## 2. Current state: view exists as a flag, not as a capability

What the code does today (references are to this repo and to `@mat3ra/wove` 2026.7.21-0):

1. **The designer threads an `editable` boolean through everything.**
   `WorkflowDesignerContainer` takes `editable: boolean` and passes it down through
   `Workflow` → layouts → `SubworkflowHeader` / `UnitsFlowchartContainer` / `UnitModal` /
   `BaseUnit` / `UnitInputEditor` (~40 usage sites). Turning it off hides edit affordances
   — but the host still mounts the designer.

2. **Viewing pays the full designer contract.** The container requires ~25 props; the
   standalone demo (`src/standalone/index.tsx`) must stub seven webapp components
   (`EntityHeaderComponent`, `PseudoFormComponent`, `DataGridComponent`, …), two Redux
   dialog tuples, `publicAccount`, `clusters`, `templates`, and a `saveWorkflow` callback
   — to show a workflow read-only. Persistence is already injected (good: the designer
   never talks to a backend itself), but the *shape* of the contract makes "view" and
   "design" the same thing.

3. **Viewing pays the full designer bundle.** The standalone build is 11,658 kB minified,
   2,146 kB gzip. The weight is the editing stack — esse JSON schemas, RJSF + ajv forms,
   wode domain logic, standata reference data, the MUI surface of the forms. The pieces a
   pure view needs (reactflow ~1 MB unminified source, d3-hierarchy, the cards) are a
   small fraction of it.

4. **wove is already close to view-only at the component level.**
   - `UnitsFlowchart` receives its edit actions from outside (`getActions` prop);
     `UnitCard` takes `actions?` as data. Pass none and the cards are plain.
   - `WorkflowUnitsFlowchart` (despite the name, a vertical card list) defaults to
     `editable = false` — it already serves the webapp's read-only contexts (job view).
   - The card layer reads **plain JSON fields only** — `name`, `type`, `status`,
     `flowchartId`, `application`, `flavor`, `executable` (see `UnitCard.js`,
     `unitCardMeta.js`). No wode instance methods. The `AnySubworkflowUnitSchema` type is
     schema-shaped data, not a class. wove's runtime dependency on wode is enums
     (`UnitType`, `UnitStatus`) plus types.

5. **Nothing can render a workflow without a live DOM.** wove's
   `useTransformUnitsToNodesAndEdges` is a pure units→nodes/edges function, but layout
   (`useAutoLayout`) waits for reactflow to measure real node sizes in the browser
   (`nodeInternals` → every `node.width && node.height`) before running d3
   `stratify`/`tree`. So there is no path to a static image, a server-side render, or a
   notebook output cell today.

The conclusion from 4 + 5: **isolating the view is a boundary-and-layout problem, not a
rewrite.** The cards are ready; the missing pieces are a measurement-free layout, a
JSON-in/SVG-out renderer, a slim packaging path, and a designer that consumes the viewer
instead of duplicating it.

## 3. Target architecture

One graph model, three renderings, two packages:

```
workflow JSON (esse schema; wode entities satisfy it via .toJSON())
        │
        ▼
  getWorkflowGraph()          pure: units + subworkflows → nodes, edges, groups
        │
  layoutWorkflowGraph()       pure: positions from fixed card geometry (cove tokens),
        │                     d3-hierarchy tree — no DOM measurement
        ├────────────────────────────┬──────────────────────────────┐
        ▼                            ▼                              ▼
  renderWorkflowSvg()          <WorkflowViewer/>              <WorkflowStepsList/>
  static SVG string            read-only reactflow            compact numbered list
  (notebooks, docs, CI)        (browser hosts, designer)      (narrow embeds, texty hosts)
```

- **`@mat3ra/wove` owns all three renderings** plus the model/layout, published under a
  slim subpath (working name `@mat3ra/wove/viewer`) whose dependency cut excludes wode,
  ave, mode, and standata. Enum values the cards need come from esse-aligned constants.
- **`workflow-designer` becomes "viewer + editing".** The designer canvas mounts
  `WorkflowViewer` and decorates it: `getActions` (edit/delete/clone), selection, the
  edge "+" insert, dialogs, Important Settings, and persistence. `editable={false}` stops
  meaning "designer with hidden buttons" and starts meaning "the viewer" — the
  dialog/persistence/webapp-component props become optional and unused in that mode.
- **Persistence stays injected** (`saveWorkflow`, and later a fuller
  load/list/save source interface if the webapp wants it) and is *documented as a
  designer-only concern*: nothing under the viewer subpath may import it.

This is the same architecture the Brillouin-zone work proved on this branch: a tested
pure geometry module, a thin SVG component over it, and the interactive surface reusing
the same transform (`brillouinZoneGeometry.ts` → `BrillouinZone.tsx`). It worked there —
including golden tests against all lattice types — and the workflow graph is an easier
geometry problem.

## 4. How should a view-only workflow look? (decision)

Three candidate renderings were considered; the answer is "two of them, chosen by
context, from one model" rather than one winner:

| Rendering | Strengths | Weaknesses | Verdict |
|---|---|---|---|
| **Static SVG** (graph drawn to a string) | Renders everywhere — GitHub, nbviewer, exported HTML/PDF, README, docs sites; zero JS at view time; native `<title>` hover; themable via inlined cove tokens; diffable golden tests | No pan/zoom; very large workflows need size capping | **Foundation.** Default for notebooks and anything saved/static |
| **Interactive viewer** (read-only reactflow) | Pan/zoom, hover meta, fit controls; matches the designer's canvas exactly; the designer itself consumes it | Needs a browser + ~hundreds of KB of JS; dies in sanitized contexts (GitHub) | Default for live browser hosts, incl. the designer and web app read-only pages |
| **Steps list** (the studio layout's rail model, read-only) | Honest for the common case — most workflows are linear sequences; compact; readable at any width; trivially cheap | Hides branching/convergence topology | Offered alongside the graph; the right default for narrow embeds and linear workflows |

Decision details:

- **The graph must earn its pixels.** For a linear five-unit chain the steps list reads
  better than a flowchart (the UX review's W1/W2 findings were exactly about graphs
  wasting space). The helper picks a default: graph when the edge set is more than a
  chain (convergence, `next` jumps, map/subworkflow branching), steps list otherwise;
  callers can force either.
- **Status is off by default in view contexts** (`showStatus: false`), consistent with
  the "idle chips leak job-runtime concepts into design mode" fix (W10). Job-monitoring
  hosts turn it on and get the status classes wove already computes
  (`getUnitStatusCls`).
- **Both graph renderings share positions.** The SVG and the interactive viewer read the
  same `layoutWorkflowGraph()` output, so the picture a notebook shows is the picture
  the designer shows. reactflow's DOM-measured auto-layout remains only as a *designer*
  enhancement for expanded cards, applied after the shared layout, not instead of it.
- **Workflow-level view**: subworkflows render as labelled groups (title + application
  chip) around their unit nodes in the graph, and as top-level entries in the steps list
  — the `getWorkflowSteps` model built for the studio rail, moved into wove.

## 5. Jupyter and standalone embedding

The notebook story drives the static path:

- **Rich output, both flavors at once.** The Python helper emits a Jupyter mimebundle
  with `image/svg+xml` (static graph) *and* `text/html` (the interactive viewer in an
  `<iframe srcdoc>` when requested). Live frontends prefer the HTML; GitHub, nbviewer,
  and `nbconvert` fall back to the SVG — committed notebooks stay reviewable with no JS.
- **Where the SVG comes from.** `renderWorkflowSvg` is pure TypeScript and runs in Node
  (that also gives docs/CI a one-line CLI: `npx @mat3ra/wove render workflow.json`).
  Python notebooks cannot assume Node, so the helper needs a Python-side layout+SVG
  mirror of the same model. This follows the ecosystem's existing dual-runtime pattern
  (esse and made ship Python siblings), and the drift risk is contained the same way:
  both implementations are verified against **shared golden fixtures** (standata
  workflow JSON in, node/edge/position JSON out) so divergence fails a test rather than
  a user. The graph layout is small (layered tree over ≤ tens of nodes), so the mirror
  is ~200 lines, not a port of d3.
- **Interactive embed bundle.** A self-contained viewer HTML (React + MUI slice +
  reactflow + viewer, inlined) for `interactive=True` and for standalone pages. This
  session already proved the single-file pattern by inlining the *entire designer* at
  11.1 MB; the viewer-only bundle targets **≤ 700 kB gzip** — no esse schemas, no RJSF,
  no ajv, no wode, no standata.
- **Where the Python helper lives**: start as a utility module + example notebook in
  `api-examples` (no new package overhead while the API settles); graduate to a
  `mat3ra-wove` PyPI sibling once stable. Open question §7.3.
- **Acceptance harness in this repo**: a `viewer.html` page in the standalone build
  (`?workflow=<standata-id>&view=graph|steps&theme=light|dark`) rendering pure
  view-only — doubles as the shareable preview for any workflow and as the Playwright
  target proving the viewer mounts with *zero* designer props.

## 6. Portions

| # | Portion | Repo | Contents | Est. |
|---|---------|------|----------|------|
| 1 | Graph model + layout | wove | `getWorkflowGraph(workflow)` (from `transformUnitsToNodesAndEdges`, minus React/action baggage; subworkflow groups; convergence edges), `layoutWorkflowGraph()` with fixed card geometry from cove `theme.designer.node` tokens; unit tests over all 55 standata workflows (every workflow lays out; no node overlaps; edge endpoints on node bounds) | 3–4 d |
| 2 | Static SVG renderer | wove | `renderWorkflowSvg(workflow, {theme, direction, showStatus, view})` → string; cove token colors inlined; `<title>` hover; text truncation identical to cards; golden-file tests + the cove contrast checker run against both themes | 2–3 d |
| 3 | Viewer components + packaging | wove | `<WorkflowViewer/>` (read-only reactflow over portion-1 positions; optional `onUnitClick`), `<WorkflowStepsList/>` (steps model moves here from workflow-designer; designer re-imports), `@mat3ra/wove/viewer` subpath with the slim dependency cut; size budget test | 3–4 d |
| 4 | Designer consumes viewer | workflow-designer | Canvas re-based on `WorkflowViewer` + injected `getActions`/selection; steps rail re-based on the moved steps model; `editable=false` renders the viewer path and the dialog/persistence/webapp props become optional; delete the duplicated view code | 3–4 d |
| 5 | Embedding | api-examples (+ this repo) | Python `display_workflow()` (SVG mirror + golden fixtures; `interactive=True` iframe), example notebook; `viewer.html` acceptance page here; viewer CLI (`npx @mat3ra/wove render`) | 3–5 d |

Sequencing: 1 → 2 and 1 → 3 in parallel; 4 after 3 publishes (folds into the existing
"consume wove once published" task); 5 after 2. Total ≈ 3 engineer-weeks. Portions get
their own detail documents (`2026-08-27-viewer-<n>-*.md`) as they start, same as the UX
plan.

Acceptance for the stream as a whole:

1. A workflow renders read-only from plain JSON with **no** designer props, no wode
   import, no save callback anywhere in the module graph.
2. `renderWorkflowSvg` output for a standata workflow is committed as a golden file and
   renders correctly on GitHub (the fixture doubles as documentation).
3. A committed example notebook shows a workflow on GitHub's notebook viewer (static
   SVG) and pans/zooms when run live with `interactive=True`.
4. The designer's canvas and the viewer produce identical layouts for the same workflow
   (shared-position test).
5. Viewer embed bundle ≤ 700 kB gzip, enforced by a size test in wove's CI.

## 7. Risks and open questions

1. **Dual-runtime drift (JS/Python layout).** Contained by shared golden fixtures; the
   Python mirror fails CI when the JS model changes shape. If the mirror still proves
   too costly, the fallback is the Node CLI (notebooks shell out when Node exists,
   else instruct) — decided in portion 5, not up front.
2. **Steps-model move is a breaking import for this repo.** `getWorkflowSteps` and the
   rail model migrate to wove; the designer re-exports during a deprecation window.
   Coordinate the wove/workflow-designer version bump (same pattern as the
   `CardHeader`/`meta` landing in wove#12).
3. **Where the Python helper lives** — `api-examples` first vs. a `mat3ra-wove` PyPI
   package immediately. Recommendation: `api-examples` first; revisit after the notebook
   is used in anger.
4. **MUI in the viewer path.** Cards are MUI-styled today. For the subpath, MUI stays a
   peer (browser hosts have it; the self-contained embed bundles its slice); the static
   SVG path must not touch MUI at runtime — tokens come from cove values directly.
5. **reactflow version coupling.** The viewer wraps reactflow v11 and does not leak its
   types through the public API, so a future react-flow upgrade stays internal to wove.

## 8. Out of scope

- Editing anything in view mode (including "quick edit" affordances) — the entire point
  is that the viewer cannot mutate.
- Job *monitoring* UI (live status streams); the viewer accepts a status field and
  renders it, nothing more.
- The webapp's adoption of the split container props — tracked with the webapp, not
  here.
- PNG/PDF raster export (SVG covers docs/notebooks; rasterizing is the host's concern).

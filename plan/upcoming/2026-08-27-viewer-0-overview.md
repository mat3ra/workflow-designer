# Workflow Viewer — isolating view from design (main plan)

- **Ticket:** [SOF-8035](https://mat3ra.atlassian.net/browse/SOF-8035) (relates to
  [SOF-8024](https://mat3ra.atlassian.net/browse/SOF-8024))
- **Status:** proposed — builds on the viewer capability added in
  [wove#14](https://github.com/mat3ra/wove/pull/14) (open, not yet merged).
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

## 2. Where this starts: the capability wove#14 added

[wove#14](https://github.com/mat3ra/wove/pull/14) (branch
`claude/workflow-json-visualization-kw34v4`, 11 files, ~800 lines) already built the
core of the view capability. It is the foundation this plan extends, not something to
redo:

1. **A JSON boundary** — `src/utils/workflowConfig.ts`. `createWorkflowFromConfig()`
   accepts a workflow config object, a JSON string, a job-like payload carrying the
   workflow one level down, or an instance the host already holds. It builds a real wode
   `Workflow` when the config allows, and **degrades to a plain-JSON adapter**
   (`adaptWorkflowConfig` / `adaptSubworkflowConfig`) when the entity constructor rejects
   it — external JSON renders rather than blanking. Types come from ESSE
   (`Partial<WorkflowSchema>`, `WorkflowUnitSchema`, `JobSchema`), so the schemas stay
   the single source of truth. 215 lines of tests.
2. **A read-only React component** — `WorkflowViewer`. No store, router, or dependency
   injection. `editable = false` by default and `getActions` returns a frozen empty list,
   so the cards carry no edit affordances. Shows workflow units as cards
   (`WorkflowUnitsFlowchart`) plus the selected subworkflow's units as a reactflow graph.
   `ApplicationComponent` / `ModelComponent` stay injectable for hosts that have ave/move.
3. **A standalone global** — `window.renderWorkflow(config, container, options)`, bundled
   to `build/main.js` + `main.css` and deployed to GitHub Pages by the existing
   `deploy-bundle` job. Deliberately the **same contract as wave.js'**
   `window.renderThreeDEditor(materialConfig, container)`, which is how every other
   Mat3ra viewer embeds.
4. **A documented Jupyter recipe** — the README shows
   `mat3ra.notebooks_utils.ipython.ui`'s `get_viewer_html` / `get_viewer_js` pointed at
   the wove bundle with `render_function="renderWorkflow"`. The same helpers that embed
   wave.js.
5. **A demo page** (`npm run dev`, :3007) with a standata workflow picker and a
   paste-JSON box.

**What this settles.** The question "how do we visualize a workflow read-only, and how
does it reach a notebook?" now has an answer for the *interactive* case, and it is the
ecosystem's existing answer rather than a new one. This plan should not relitigate it.

## 3. What is still missing

1. **The designer still treats view as a flag, not a capability.**
   `WorkflowDesignerContainer` takes `editable: boolean` and threads it through
   `Workflow` → layouts → `SubworkflowHeader` / `UnitsFlowchartContainer` / `UnitModal` /
   `BaseUnit` / `UnitInputEditor` (~40 sites). Turning it off hides affordances but still
   mounts the designer: ~25 required props (the standalone demo stubs seven webapp
   components, two Redux dialog tuples, `publicAccount`, `clusters`, `templates`, a
   `saveWorkflow` callback) and the full 11,658 kB / 2,146 kB-gzip bundle, whose weight is
   the *editing* stack — esse schemas, RJSF + ajv, wode, standata. wove#14 built the
   viewer beside the designer; nothing yet makes the designer *use* it, so the two will
   drift.
2. **Nothing renders without a live DOM.** wove's `useTransformUnitsToNodesAndEdges` is
   already a pure units→nodes/edges function, but layout (`useAutoLayout`) waits for
   reactflow to measure real node sizes in the browser (`nodeInternals` → every
   `node.width && node.height`) before running d3 `stratify`/`tree`. So there is still no
   path to a static image, a server-side render, or an output cell that survives being
   saved.
3. **A saved notebook shows nothing.** `renderWorkflow` reaches the notebook through
   `IPython.display.Javascript`, whose output GitHub, nbviewer, and `nbconvert --to
   html` do not execute. A committed notebook — the common case for
   `mat3ra/api-examples` — therefore shows an empty cell. This is the one real gap in the
   Jupyter story wove#14 opened, and it is what a static rendering exists to close.
4. **No compact rendering.** The viewer always draws a graph. Most workflows are linear
   chains, where a numbered steps list reads better and fits a narrow embed — the same
   finding as W1/W2 in the UX review.
5. **No size floor.** The viewer imports from wove's main entry, so a host that wants
   only the viewer still pulls the package's full surface. Nothing measures or defends a
   budget.

## 4. Target architecture

Keep wove#14's boundary and component; add a measurement-free layout underneath so the
same graph can be drawn without a browser, and a second, compact rendering beside it:

```
workflow JSON (ESSE schema)  ─── createWorkflowFromConfig() ──▶ WorkflowLike   [wove#14]
                                                                    │
                                     ┌──────────────────────────────┤
                                     ▼                              ▼
                          getWorkflowGraph()                  <WorkflowViewer/>   [wove#14]
                          pure: nodes, edges, groups          interactive, browser
                                     │                        (also: the designer's canvas)
                          layoutWorkflowGraph()
                          pure: positions, no DOM
                                     │
                          ┌──────────┴──────────┐
                          ▼                     ▼
                 renderWorkflowSvg()    <WorkflowStepsList/>
                 static, no JS at view  compact, linear
                 (saved notebooks,      (narrow embeds)
                  docs, README, CI)
```

- **wove owns all of it.** The static renderer and the steps list join the viewer;
  `layoutWorkflowGraph()` also feeds the interactive viewer so a notebook and the
  designer agree on where a node sits.
- **The designer becomes "viewer + editing".** `workflow-designer`'s canvas mounts
  `WorkflowViewer` and decorates it — `getActions` (edit/delete/clone), selection, the
  edge "+" insert, dialogs, Important Settings, persistence. `editable={false}` stops
  meaning "designer with hidden buttons" and starts meaning "the viewer"; the
  dialog/persistence/webapp-component props become optional in that mode.
- **Persistence stays injected** (`saveWorkflow`) and is documented as designer-only:
  nothing in the viewer path may import it.

This mirrors the architecture the Brillouin-zone work proved on the UX branch — a tested
pure geometry module, a thin SVG component over it, and the interactive surface reusing
the same transform (`brillouinZoneGeometry.ts` → `BrillouinZone.tsx`), including golden
tests across lattice types. The workflow graph is an easier geometry problem.

## 5. How a view-only workflow should look (decision)

Three renderings, chosen by context, from one model:

| Rendering | Where it wins | Where it fails | Status |
|---|---|---|---|
| **Interactive viewer** (read-only reactflow) | Live notebooks, web app read-only pages, docs pages with JS, the designer's own canvas — pan/zoom, hover, fit | Needs a browser and the bundle; renders nothing in sanitized contexts (GitHub, nbviewer, exported HTML) | **Built** (wove#14); default when JS runs |
| **Static SVG** | Saved/committed notebooks, GitHub, nbviewer, `nbconvert`, README, docs, CI diffs; zero JS; `<title>` hover; diffable golden tests | No pan/zoom; very large workflows need size capping | **To build**; the fallback half of the notebook mimebundle |
| **Steps list** | Linear workflows (most of them), narrow embeds, text-shaped hosts | Hides branching/convergence topology | **To build**; offered as a `view` option |

Decisions:

- **Do not replace the interactive path with SVG.** wove#14 chose the wave.js embedding
  contract, which is right: it is what the notebook helpers already speak and what every
  other Mat3ra viewer uses. SVG is the *complement* that makes a saved notebook show
  something.
- **The notebook helper emits both.** A Jupyter mimebundle carries `text/html` (the
  `renderWorkflow` snippet) and `image/svg+xml` (the static graph) together. Live
  frontends prefer the HTML and get interactivity; GitHub and nbviewer fall back to the
  SVG. This is the single change that makes committed example notebooks useful.
- **Both graph renderings share positions.** SVG and the interactive viewer read the same
  `layoutWorkflowGraph()` output, so the picture a notebook shows is the picture the
  designer shows. reactflow's DOM-measured auto-layout stays only as a designer
  refinement for expanded cards, applied after the shared layout.
- **Status is off by default in view contexts** (`showStatus: false`), consistent with
  the "idle chips leak job-runtime concepts into design mode" fix (W10). Job-monitoring
  hosts turn it on and get the classes wove already computes (`getUnitStatusCls`).
- **The graph must earn its pixels.** Default to the steps list when the edge set is a
  plain chain, the graph when it is not (convergence, `next` jumps, map/subworkflow
  branching); callers can force either.

## 6. Portions

| # | Portion | Repo | Contents | Est. |
|---|---------|------|----------|------|
| 0 | Land the foundation | wove | Review, green, and merge [wove#14](https://github.com/mat3ra/wove/pull/14); publish so `WorkflowViewer` and `renderWorkflow` are consumable. Everything below builds on it | — |
| 1 | Measurement-free graph model + layout | wove | `getWorkflowGraph(workflowLike)` (nodes, edges, subworkflow groups — lifted from `transformUnitsToNodesAndEdges`, minus React/action baggage) and `layoutWorkflowGraph()` with fixed card geometry from cove `theme.designer.node` tokens. Tests over all 55 standata workflows: every one lays out, no node overlaps, edge endpoints on node bounds. Interactive viewer switched onto it so both paths share positions | 3–4 d |
| 2 | Static SVG renderer | wove | `renderWorkflowSvg(workflow, {theme, direction, showStatus, view})` → string; cove tokens inlined; `<title>` hover; truncation matching the cards; golden-file tests plus the cove contrast checker in both themes. Node CLI (`npx @mat3ra/wove render workflow.json`) for docs/CI | 2–3 d |
| 3 | Steps list + packaging | wove | `<WorkflowStepsList/>` (the steps model moves here from `workflow-designer`; the designer re-imports it), a `view` prop on `WorkflowViewer` selecting graph/steps/auto, a slim `@mat3ra/wove/viewer` subpath whose dependency cut excludes ave/move/standata, and a bundle-size budget test (**≤ 700 kB gzip**, against wove#14's current bundle as the baseline) | 3–4 d |
| 4 | Designer consumes viewer | workflow-designer | Canvas re-based on `WorkflowViewer` + injected `getActions`/selection; steps rail re-based on the moved model; `editable=false` renders the viewer path and the dialog/persistence/webapp props become optional; delete the duplicated view code | 3–4 d |
| 5 | Notebook + docs embedding | api-examples (+ this repo) | `display_workflow()` emitting the **mimebundle** (HTML snippet from `get_viewer_js` + SVG fallback), example notebook committed with output so GitHub shows the graph; a `viewer.html` acceptance page in this repo's standalone build (`?workflow=<standata-id>&view=graph\|steps&theme=light\|dark`) that mounts the viewer with zero designer props | 3–4 d |

Sequencing: 0 first (it gates everything); then 1 → 2 and 1 → 3 in parallel; 4 after 3
publishes (folds into the existing "consume wove once published" task); 5 after 2. Total
≈ 2.5–3 engineer-weeks after wove#14 merges. Portions get detail documents
(`2026-08-27-viewer-<n>-*.md`) as they start, as in the UX plan.

Acceptance for the stream:

1. A workflow renders read-only from plain JSON with **no** designer props, no
   `saveWorkflow`, and no persistence import anywhere in the module graph.
2. `renderWorkflowSvg` output for a standata workflow is committed as a golden file and
   renders on GitHub (the fixture doubles as documentation).
3. A committed example notebook shows the workflow **on GitHub** (static SVG) and pans
   and zooms when run live (interactive bundle) — one cell, one helper call.
4. The designer's canvas and the viewer produce identical layouts for the same workflow
   (shared-position test).
5. Viewer embed bundle ≤ 700 kB gzip, enforced in wove's CI.

## 7. Risks and open questions

1. **Python-side SVG.** Notebooks cannot assume Node, so the static half needs a Python
   mirror of the layout + SVG (~200 lines: a layered tree over tens of nodes, not a d3
   port). Contained by **shared golden fixtures** — workflow JSON in, node/edge/position
   JSON out — so divergence fails a test, not a user; this is the pattern esse and made
   already use for their Python siblings. Fallback if it still proves too costly: the
   Node CLI, with the helper shelling out when Node exists. Decide in portion 2, not up
   front.
2. **Steps-model move is a breaking import for this repo.** `getWorkflowSteps` and the
   rail model migrate to wove; the designer re-exports during a deprecation window.
   Coordinate the version bump (same pattern as the `CardHeader`/`meta` landing in
   wove#12).
3. **Three open wove PRs touch overlapping files** — #11 (hide ids / designer status),
   #12 (card flags, zone geometry), #14 (the viewer). Merge order matters: #14 last, or
   rebase it, since it is the largest and touches the standalone entry. Resolve before
   portion 1 starts.
4. **MUI in the viewer path.** Cards are MUI-styled. For the subpath, MUI stays a peer
   (browser hosts have it; the standalone bundle carries its slice); the static SVG path
   must not touch MUI at runtime — tokens come from cove values directly.
5. **reactflow version coupling.** The viewer must not leak reactflow types through its
   public API, so a future upgrade stays internal to wove.
6. **`adaptWorkflowConfig`'s silent fallback.** wove#14 warns to the console when the
   wode entity rejects a config and renders degraded JSON instead. In a notebook nobody
   reads the console — the viewer should surface "showing raw JSON; this config did not
   validate" in the UI. Small, worth doing in portion 1.

## 8. Out of scope

- Editing anything in view mode, including "quick edit" affordances — the point is that
  the viewer cannot mutate.
- Job *monitoring* UI (live status streams); the viewer accepts a status field and
  renders it, nothing more.
- The webapp's adoption of the split container props — tracked with the webapp.
- PNG/PDF raster export (SVG covers docs and notebooks; rasterizing is the host's job).

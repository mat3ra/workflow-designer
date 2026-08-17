# SOF-8024 Portion 3 — Important Settings Rebuild

- **Parent:** [2026-08-16-ux-0-overview.md](./2026-08-16-ux-0-overview.md) · **Ticket:** [SOF-8024](https://mat3ra.atlassian.net/browse/SOF-8024) ·
  **Status:** upcoming
- **Updated:** 2026-08-16
- **Scope:** rebuild the Settings (today "Important settings") tab per Mockup B, plus
  Compute form completion (Mockup E). Fixes W5 and closes W6.
## Status (2026-08-16)

Shipped early, out of order, because it made the Settings tab visibly broken outside the web
app: **the Brillouin zone illustration**. `@mat3ra/wove`'s
`ExtraImportantSettingsByContextProvider` derives `/images/brillouin_zone/<lattice>.png` from
the material and renders it through an injectable `BrillouinZoneImageComponent`
(`@mat3ra/move`'s `BrillouinZoneImage` is one such component — also a thin `<img>` wrapper).
Two defects follow from that:

1. **The asset ships nowhere.** No npm package contains those PNGs — only the web app serves
   them, so every other consumer (standalone demo, Storybook, embedders) renders a broken
   image. Confirmed: `/images/brillouin_zone/fcc.png` → 404 in the demo.
2. **The path is absolute**, so it cannot resolve under a non-root deployment base (the demo
   is served at `/workflow-designer/`); shipping the files in `public/` would not fix it.

Fixed here by **deriving the zone instead of fetching it** — the lattice type is already
known at that point. `src/components/common/brillouinZoneGeometry.ts` computes the first
Brillouin zone as the Wigner-Seitz cell of the reciprocal lattice (half-space intersection),
and `BrillouinZone.tsx` renders it as inline SVG; `ImportantSettings` uses it as the default
when the host injects no component, so the web app keeps its own artwork unchanged.
Validated against crystallography — FCC → truncated octahedron (8 hexagons + 6 squares, 24
vertices), BCC → rhombic dodecahedron, CUB → cube, HEX → hexagonal prism, all satisfying
V − E + F = 2 (`tests/brillouinZoneGeometry.tests.ts`).

The zone is computed from the material's **own** reciprocal lattice
(`new ReciprocalLattice(material.lattice).reciprocalVectors`, read off the context provider at
the call site), not from its lattice *type*: same type, different cell shape — a graphene
monolayer's large vacuum spacing flattens its zone while bulk GaN's stays a tall prism, both
`HEX`. The per-type table survives only as a fallback for callers with no material.

### Where this code belongs (it does not belong here)

None of it is workflow-designer domain; it sits here only because the fix could not be made in
the packages that own it from this branch. Target homes:

- **Geometry → `@mat3ra/made`**, in `lattice/reciprocal/` next to `ReciprocalLattice`. It is
  pure crystallography with no React, and `made` already owns the reciprocal lattice, its
  `reciprocalVectors`, and `symmetryPoints`. Natural shape: a `brillouinZone` getter on
  `ReciprocalLattice`, which also removes this module's duplicate reciprocal-vector math.
  **Input required: just the lattice** — the three vectors. Not the material, and not a type
  string.
- **Renderer → `@mat3ra/move`**, beside the existing `BrillouinZoneImage` (materials
  visualization). It would then supersede that component rather than sit behind it.
- **`@mat3ra/wove`** should pass the provider's `material` (or lattice) to the injected
  component instead of `latticeType` + a dead `imgSrc`; the material is already in scope there
  (`ExtraImportantSettingsByContextProvider` destructures it). That lossy prop contract is why
  the call-site binding in `brillouinZoneForProvider.tsx` exists at all — delete it once wove
  passes the lattice through.
- **workflow-designer** then keeps none of this and simply consumes the component.

Once `made` owns the geometry, `symmetryPoints` makes the obvious next step cheap: label Γ/X/L
on the zone and overlay the k-path being edited in this very form — something a static PNG per
lattice type could never do.

**Upstream PRs opened (2026-08-16):** [mat3ra/made#295](https://github.com/mat3ra/made/pull/295)
adds `ReciprocalLattice.brillouinZone` (validated against made's own Silicon / Na4Cl4 /
Graphene / Si-slab fixtures), and [mat3ra/move#5](https://github.com/mat3ra/move/pull/5) adds
the `BrillouinZone` renderer superseding `BrillouinZoneImage`. Once both land, this repo drops
`brillouinZoneGeometry.ts` and `BrillouinZone.tsx` and consumes `move`'s component; the
remaining upstream item is wove passing the provider's lattice to the injected component
instead of `latticeType` + a dead `imgSrc`.

### Settings tab rebuilt (2026-08-16)

Items 1.1, 1.2 and 1.4 are built on `claude/ux-improvements-msn5h2`: grouped cards per
provider with a real title and a scope line ("applies to the whole subworkflow" vs "unit
pw_scf"), a "modified" badge and per-group Reset, a sticky unit index carrying per-unit
counts of modified settings, and a filter that matches titles, unit names, field names and
engine keywords (`ecutwfc` finds Planewave Cutoffs). Verified across 13 standata workflows
including the no-settings empty state; the full edit → badge → index count → reset → badge
clears round trip passes.

**Bug found while wiring Reset (worth an upstream fix):** providers publish their defaults
onto the JSON schema via `getPatchedSchemaById`, but the patch config addresses
`{ wavefunction: { default } }` while the schema keeps fields under
`properties.wavefunction`. esse's `applyPatchWithDotNotation` silently skips paths it cannot
resolve, so **those defaults never reach the schema** — `PlanewaveCutoffDataManager`'s 40/200
included. Reset therefore reads `getDefaultData()` (protected at compile time only), with
schema defaults preferred where a provider declares them properly. Fixing the patch config in
wode would make the schema route work and let the cast go.

Items 1.3 and 1.6 followed: changed fields now carry a "default X · reset field" line
(an RJSF `FieldTemplate` reading defaults through context), where resetting one field leaves
the group's other edits intact and the group badge clears only once everything is back to
default; and the Compute tab restates the selection as "Requests N cores · up to T · queue Q
· on <cluster>" rather than leaving nodes × cores-per-node to be multiplied by eye.

Still open in this portion: domain widgets for k-grid and k-path (1.5) — the k-grid already
renders as labelled dimensions/shifts columns, so the remaining value there is the k-path
segment-chip editor.

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

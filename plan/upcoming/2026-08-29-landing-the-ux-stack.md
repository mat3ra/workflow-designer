# Landing the UX stack — merge order and open questions

- **Ticket:** [SOF-8024](https://mat3ra.atlassian.net/browse/SOF-8024)
- **Status:** proposed — the six PRs are green and awaiting review.
- **Updated:** 2026-08-29
- **Related:** [`2026-08-16-ux-0-overview.md`](./2026-08-16-ux-0-overview.md) (the work itself),
  [`2026-08-27-viewer-0-overview.md`](./2026-08-27-viewer-0-overview.md) (SOF-8035, next stream).

## 1. What is waiting

| repo | PR | size | state | needs published first |
|---|---|---|---|---|
| cove | [#98](https://github.com/mat3ra/cove/pull/98) | +481/−12, 7 files | green, awaiting review | — |
| made | [#295](https://github.com/mat3ra/made/pull/295) | +317/−0, 3 files | green, awaiting review | — |
| move | [#5](https://github.com/mat3ra/move/pull/5) | +364/−1119, 5 files | green | cove |
| ave | [#8](https://github.com/mat3ra/ave/pull/8) | +956/−2091, 7 files | green | cove |
| wove | [#12](https://github.com/mat3ra/wove/pull/12) | +576/−77, 19 files | green | cove, made, move, ave |
| workflow-designer | [#12](https://github.com/mat3ra/workflow-designer/pull/12) | +7132/−495, 74 files | green | ave, made, move, wove |

The dependency edges are real — `wove` and `workflow-designer` both declare the others as
peers — so the merge order is forced:

```
cove ──┬─> move ──┐
       └─> ave  ──┼─> wove ──> workflow-designer
made ──────────────┘
```

cove and made are independent and can go first in either order.

## 2. Order of operations

Each step is *merge, then publish, then bump the consumer* — the packages no longer commit
`dist/`, so a consumer cannot see a change until CI publishes it (see `AGENTS.md` §1.8.1).

1. **cove #98** — design tokens, a real dark palette, contrast fixes. Nothing depends on
   cove's new exports yet except its own tests, so this is the safest first merge.
2. **made #295** — `ReciprocalLattice.brillouinZone`. Additive; no existing behaviour changes.
3. **move #5** — the zone renderer. Bump cove after step 1 publishes.
4. **ave #8** — Advanced section, variables panel, render check. Bump cove.
5. **wove #12** — card flags, property chips, zoom floor, zone pass-through. Bump all four.
   Already rebased onto the merged viewer work (wove#14/#15).
6. **workflow-designer #12** — the designer itself. Bump all four, then do §3.

**To review before merging rather than after**, a reviewer can pull any branch and run the
demo; workflow-designer's is also published continuously to its Netlify deploy preview.

## 3. The cleanup step 6 unlocks

`workflow-designer` carries **776 lines of Brillouin-zone code that duplicates made and move**
(`brillouinZoneGeometry.ts` 286, `BrillouinZone.tsx` 412, `brillouinZoneLabels.ts` 78) because
neither upstream had published when it was written. Once steps 2–3 publish:

- delete `brillouinZoneGeometry.ts`, import `ReciprocalLattice.brillouinZone` from made;
- keep the *renderer* only if move's version has not yet absorbed the fixes made here — the
  c-axis-up projection, back-face culling, per-theme path colour, label separation and the
  widened viewport all landed in this repo's copy after move#5 was opened. **These need
  porting into move#5 before it merges, or the duplication becomes permanent.** This is the
  one real ordering hazard in the stack.

## 4. Open questions for the reviewer

1. **Brand palette sign-off** (portion 2). cove#98 *defines* `theme.designer.*` but nothing
   adopts it; `WorkflowDefaultLayout` still pins `oldLightMaterialUITheme` (issue W12). The
   adoption PR is deliberately not written until the palette is agreed.
2. **Studio layout default.** `layoutVariant` defaults to `classic`; studio is opt-in. Someone
   has to decide when it becomes the default, and whether classic then goes away.
3. **Two upstream data bugs found in passing**, both filed, neither fixed here:
   [SOF-8041](https://mat3ra.atlassian.net/browse/SOF-8041) (k-path discontinuities flattened —
   45 spurious segments, which the *calculation* also samples; plus a dropped point in the FCC
   path) and [SOF-8036](https://mat3ra.atlassian.net/browse/SOF-8036) (monoclinic symmetry
   points landing outside the zone). SOF-8041 needs a small `KPointStep` API change in made.

## 5. TypeScript: already done, strictness is not

Both repos are already TypeScript — this does not need a migration:

| repo | `.tsx` | `.ts` | `.js` | strict |
|---|---|---|---|---|
| workflow-designer | 36 | 20 | 2 | **off** |
| wove | 23 | 4 | 1 | on (inherits `@mat3ra/tsconfig`) |

The three remaining `.js` files are deliberate: two standalone-demo stubs
(`meteor.js`, `moment-duration-format.js`) and wove's `settings.js`. Converting them buys
nothing.

The gap worth closing is that **`workflow-designer` opted out of the shared strict config**
(`strict`, `noImplicitAny` and `strictNullChecks` all `false`, against 312 uses of `any`),
while wove inherits `@mat3ra/tsconfig` with `strict: true`.

Measured cost of adopting it: **33 errors across 8 files**, of which 25 are TS7006/TS7031 —
implicit `any` on parameters, i.e. annotations. The rest are four genuine null-safety findings
(TS18047/TS18048/TS2538) worth looking at on their own merit.

| file | errors |
|---|---|
| `subworkflows/SubworkflowHeader.tsx` | 12 |
| `units/BaseUnit.tsx` | 5 |
| `subworkflows/UnitDetails.tsx` | 5 |
| four others | 11 |

Recommendation: a separate PR after the stack lands, switching `tsconfig.json` to extend
`@mat3ra/tsconfig` and fixing the 33. Roughly half a day, no behaviour change, and it stops
the two repos drifting apart. Not worth blocking this stack on.

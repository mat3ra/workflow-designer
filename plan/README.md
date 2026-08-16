# Plan Folder

Design documents and durable agent context for this repository, per the conventions in
[`AGENTS.md`](../AGENTS.md) §6. The folder a document sits in is the claim being made about
it, so moving it is part of doing the work:

- **`upcoming/`** — agreed direction, not built yet. Safe to change freely; nothing depends
  on it.
- **`review/`** — built and on a branch, not yet proven. Waiting on CI, a PR, or a deploy.
- **`implemented/`** — shipped. Kept as the record of why the code looks the way it does.
  On the way in, add a `## Status` section at the top recording what shipped, divergences
  from the plan, and what remains open (real open items also get an entry in `upcoming/`).
- **`context/`** — reference material that is not a plan: investigations, measurements,
  background, and context dumps written to retain state when switching models, machines, or
  sessions.

Never edit a document in `implemented/` to match the code — correct it with a `## Status`
note instead. Name documents `<yyyy-mm-dd>-<short-title>.md`, all lowercase, with the
creation date — e.g. `2026-08-16-containerized-venv-plan.md`. The tracking ticket (Jira)
is linked from the document header, not the filename: these repos are public and the
tracker is not, so ticket keys in filenames carry no meaning for outside readers. Each
header also carries an **Updated** stamp, bumped on every edit.

Note: the canonical version of this README lives in `mat3ra/agents` under
`templates/plan/README.md`; replace this copy with the canonical one if they diverge.

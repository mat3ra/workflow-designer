# plan/

Design documents for work on this repo, filed by where the work has got to. The folder a document
sits in is the claim being made about it, so moving it is part of doing the work — not bookkeeping
to be done later.

| folder         | what is in it                                                                     |
| -------------- | --------------------------------------------------------------------------------- |
| `upcoming/`    | Agreed direction, not built yet. Safe to change freely; nothing depends on it.      |
| `review/`      | Built and on a branch, not yet proven. Waiting on a Jenkins run, a PR, or a deploy. |
| `implemented/` | Shipped. Kept as the record of why the code looks the way it does.                  |
| `context/`     | Reference material that is not a plan — investigations, measurements, background.   |

`context/` is split again by how long a document is meant to last; see below.

## Working with these

**A plan moves when its status changes, and it does not move silently.** On the way into
`implemented/`, add a `## Status` section at the top saying what actually shipped. That matters
more than it sounds: a plan is written before the work and is usually wrong somewhere, so a
document filed under `implemented/` without that section reads as "the code does this", which is a
claim nobody checked.

Record three things there:

- **What shipped** — one or two lines, and where the code lives.
- **Divergences** — where the built thing differs from the plan, and why. This is the part that
  earns the document its place; a plan that matched reality exactly would not need it.
- **Still open** — anything the plan proposed that was not done. If it is real work, it also gets
  an entry in `upcoming/`, because nobody goes looking for open items inside a file named
  "implemented".

**Do not edit a plan in `implemented/` to match the code.** Rewriting history loses the reason a
decision was made, which is the only thing the document is still good for. Correct it with a
`## Status` note instead.

**A plan that has been superseded outright** stays in `implemented/` if its work shipped in some
other form — say so under Divergences. Only delete one if it was never acted on at all, and then
say so in the commit message.

## `context/` is split by durability

Reference material and working notes get written the same way — a markdown file under
`context/` — and then age in opposite directions. A handoff is at its most useful the day it is
written and least useful a month later, when its "current state" is neither current nor state. A
decision record is the reverse: it gets more valuable as the people who remember the decision
move on. Left in one folder, the durable material is buried in narrative that has gone stale, and
a reader cannot tell which is which without reading all of it.

| | |
| --- | --- |
| **`context/*.md`** | **Durable.** Tracked and expected to be read by someone who was not there. |
| **`context/session/`** | **Working notes.** Gitignored. Handoffs, running investigation logs, the narrative of how something was arrived at. |

**Durable** — ask whether someone absent would need it in six months:

- A decision and the alternatives rejected, with the reason.
- A procedure someone will follow again.
- A finding stated as a finding, with what was measured and what remains open — including
  negative results, which are the cheapest thing to lose and the most expensive to rediscover.

**Session** — gitignored under `context/session/`: handoffs, "where things stand" notes, logs of
an investigation still in progress, and anything whose value is mostly that it was written today.

**Promote the finding, not the file.** When a session note contains something durable, write it
into a tracked document in the form a stranger can use, and leave the narrative behind. A handoff
moved wholesale into `context/` is still a handoff, and it will read as stale reference material
within the month.

Deleting a session note is not a loss that needs recording. Deleting a durable one is, and
follows the rules above.

Two practical reasons this is worth the small ceremony. Tracking only the durable half keeps what
ships small enough to review — working notes accumulate faster than anyone prunes them, and the
repository that prompted this had reached about 2,500 lines across three files, most of it
superseded by the time it was read. And a repository that becomes public ships its `plan/` folder
with it, so what is tracked there should be material chosen for an outside reader rather than
whatever happened to accumulate.

## Naming

`<yyyy-mm-dd>-<short-title>.md`, all lowercase, with the creation date — e.g.
`2026-08-16-containerized-venv-plan.md`. The tracking ticket (Jira) is linked from the document
header, not the filename: these repositories are public while the tracker is not, so ticket keys
in filenames carry no meaning for outside readers. File the ticket before or together with the
plan; each header also carries an **Updated** stamp, bumped on every edit. One ticket can have
several documents; keep them in the same folder only while they share a status.

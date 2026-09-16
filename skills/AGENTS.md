# Authoring skills in this repository

Applies to everything under `skills/`. A skill is operating instructions for an agent doing
work right now — not a product history, and not a place to be approximately right.

## 1. Describe the present, never the release history

**A skill states how things work now.** No "Closed in v1.4.1", no "Still open", no "since CLI
1.5.0", no "on older versions this used to…". Version history goes stale, adds length, and asks
the agent to reason about a release it has no way to check from inside the skill.

Write this:

> `pt task publish` takes `--type` and the feature toggles directly, and reads an optional
> `task.json`. Precedence: option > `task.json` > defaults.

Not this:

> ~~Since CLI 1.5.0 `pt task publish` also takes `--type`…; on older CLIs the flags all
> defaulted off and you had to follow up with `pt task update`.~~

The same applies to status framing in prose — "now takes", "previously invisible",
"historically couldn't", "no longer". Delete the temporal word; state the behaviour.

**Capability limits are current facts, not roadmap.** "There is no CLI route for X — do Y
instead" is useful and belongs in the skill. "Still open: #4 add a CLI route for X" is a
backlog item and does not.

**Why this matters beyond tidiness:** a status list at the bottom of a file does not stop a
contradictory claim in the body. One reference here ended up saying `pt notification` did not
exist in one section while its own "Closed in v1.4.1" list and the command reference both
documented all six subcommands. Describing only the present removes the second copy that can
rot.

**Where the history does belong:** the CHANGELOG of the repo that changed, and the PR that
changed it.

## 2. Verify every command, flag and API before documenting it

**Run it. Do not write a flag you have not seen in `--help` output.**

An agent follows a skill literally. A flag that does not exist is not a typo the reader works
around — it is a failed command with a confusing error, and the agent will usually assume it
got the invocation wrong rather than that the documentation is wrong.

Before documenting, confirm against the real thing:

| Documenting | Verify with |
|---|---|
| A CLI flag or argument order | `pt <group> <cmd> --help` |
| A command exists at all | `pt <group> --help` — check the parent group too; a command may live at the top level rather than under the noun you expect |
| A runner/DSL action | grep the dispatch in the implementing file |
| An API field, type or bound | the schema in the API repo, not the client's declaration — they can disagree |
| A claim about behaviour | execute it, including the failure path |

Real examples of what this rule prevents, all shipped in drafts here and caught in review:
`--default-evaluator-agent-id` (the flag is `--evaluator-agent-id`), `action: reload` and
`assert_visible` (neither exists; the assertion is `expect_visible`), `pt chat get` (no such
subcommand), and a documented example `--pass-threshold 0.8` that the API rejects outright.

**A client's declared type is not the contract.** The CLI declared `--pass-threshold` as a
float while the API required an integer 1–100, so the documented example could never have
worked. When a value has bounds, check the schema that validates it.

## 3. Prefer the durable reason over the symptom

A symptom tied to one defect stops being true when the defect is fixed. The reason behind it
usually survives, and is more useful.

> ✅ `similar` is a lexical ratio — it rewards shared wording, not shared meaning, so prefer
> `agent` for prose. If a long answer you believe is correct scores implausibly low, score the
> same pair under `agent` before rewriting the task: a large gap means the scorer, not the
> answer.

> ❌ ~~`similar` scored a correct paraphrase 13/100 because of a difflib bug.~~

The first is still true after the bug is fixed, and tells the reader how to diagnose the case
themselves. The second becomes wrong on deploy.

## 4. Keep generated files generated

Anything produced by `build_skill_references.py` — the portal mirrors, the focused Live App
copies, the CLI docs under `references/**/docs/` — is regenerated and must not be hand-edited.
Fix the upstream source, then regenerate. Hand-maintained files are listed in each skill's
`SKILL.md`.

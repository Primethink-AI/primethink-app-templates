---
name: primethink-developer
description: Build PrimeThink Live Apps (both dynamic index.html apps and compiled React/Vite apps), Tasks, agents, CLI workflows, and Manage SDK integrations. Use this skill whenever the user asks to install the PrimeThink developer skill or to create, modify, build, deploy, or debug anything for PrimeThink — including pt install-developer-skill, Deep1 sandbox app development, pt live-app new, /documents/app deployment, Live Apps, Live Pages, tasks, goals, pt API data management, or Obviously Manage integrations. Also trigger for primethink.js, pt.add, pt.list, ptManage, ptManageUI, chatdb, entity names, or any PrimeThink-specific concept.
---

# PrimeThink Developer

## What is PrimeThink?

PrimeThink is an AI-powered team workspace at `app.primethink.ai`. Users chat with AI assistants, upload documents, collaborate in real-time, and build interactive applications (Live Apps) embedded directly in chat conversations.

**Core concepts:**

- **Chats** — conversations with AI assistants and other users. Each chat has its own scoped database.
- **Tasks** — predefined AI workflows with goals, initial prompts, and capabilities. Tasks tell the AI *how* to behave in a chat.
- **Live Apps** — interactive HTML applications rendered inside a chat. They use the `pt` JavaScript API to read/write data, send messages, upload files, and trigger AI processing.
- **Agents** — AI assistants powered by LLMs. Configurable with specific models, tools, and instructions.
- **Documents & Collections** — files uploaded to chats, organized in collections for RAG and reference.

## Installing or Updating This Skill

When a user asks to install this skill, use the public CLI installer rather than downloading only `SKILL.md`:

```bash
pt install-developer-skill                       # ~/.claude/skills (default)
pt install-developer-skill --project             # ./.claude/skills
pt install-developer-skill --dir ~/.kiro/skills  # Kiro or custom parent directory
pt install-developer-skill --ref TAG_OR_COMMIT   # reproducible source
```

The command recursively installs this complete directory from the public `primethink-app-templates` repository. It needs internet access but no PrimeThink token, GitHub login, or paid service. `--dir` names the parent skills directory; the installer appends `primethink-developer`.

Do not overwrite an existing installation without the user's intent. Use `--force` only when they ask to update or replace it. Replacement is downloaded and staged before the old directory moves, and unsafe paths, duplicates, symbolic links, oversized content, and missing `SKILL.md` are rejected.

Repository contributors editing the canonical checkout should run `./install.sh` instead; its symlinks ensure Kiro and Claude edits are saved back to the repository rather than a detached installed copy.

## When to Read Reference Files

Based on what you're building, read the appropriate reference before writing code:

| Building... | Read |
|---|---|
| Installing or updating the developer skill | "Installing or Updating This Skill" above + `references/developer-guide/cli/docs/cli-reference.md` |
| Dynamic/no-build app — before writing code | `libraries/index.md` — reusable modules to copy instead of re-implementing |
| Choose dynamic vs compiled Live App | "Choose the Live App workflow" below |
| Compiled app or Deep1 sandbox build | `references/developer-guide/compiled-live-apps.md` and generated template `README.md` |
| Any app, dashboard, admin panel, or tool UI | `references/developer-guide/responsive-live-apps.md` — focused structure selection, device-aware UX, anti-slop, and conditional shell patterns |
| Before writing or restyling any UI — screens, components, or a visual pass | `references/design.md` — type scale, spacing rhythm, color restraint, Flowbite vs plain Tailwind, anti-slop |
| Anything touching a platform limit or a known library incompatibility | `references/platform-known-issues.md` — shared source of truth (also read by App Studio's gap analysis) |
| Automated UI testing of a deployed Live App | `ui-testing/README.md` — plan-driven, deterministic Playwright runner |
| Publishing a task or Live App project, or testing one in a chat | "Publishing and Testing Projects" below + `references/developer-guide/cli/docs/cli-reference.md` |
| PrimeThink CLI command/API details | `references/developer-guide/cli/index.md` → exact upstream docs in `docs/` |
| Live App APIs and patterns | `references/advanced-topics/live-apps/index.md` → specific docs in `docs/` |
| Task or Agent (AI workflow instructions) | `references/ai-automation/summary.md` |
| User, admin, or developer feature outside the focused guides | `references/portals/{user,admin,developer}/index.md` |
| Live App with Obviously Manage integration | `references/advanced-topics/live-apps/docs/primethink_manage.md` |
| Obviously Manage UI components | `references/advanced-topics/live-apps/docs/primethink_manage_ui.md` |

### Reference Structure

```text
references/
├── index.md                              # PrimeThink overview
├── platform-known-issues.md              # Known incompatibilities + platform constraints
├── design.md                             # Visual design: type, spacing, color, anti-slop
├── getting-started/summary.md            # User portal: setup and UI basics
├── core-features/summary.md              # User + admin portal core features
├── ai-automation/summary.md              # Admin + user portal agents/tasks
├── developer-guide/
│   ├── summary.md                        # Developer portal summary
│   ├── compiled-live-apps.md             # Deep1 sandbox build/deploy workflow
│   ├── responsive-live-apps.md           # Focused app structure, UX, responsive, and shell contract
│   └── cli/
│       ├── index.md                      # Generated CLI reference index
│       └── docs/                         # Exact CLI reference/user guide/skill
├── advanced-topics/live-apps/
│   ├── index.md                          # Focused Live Apps overview
│   └── docs/                             # Full relevant admin/developer docs
└── portals/                              # Exact PR #1 portal mirrors
    ├── user/{index.md,docs/}
    ├── admin/{index.md,docs/}
    └── developer/{index.md,docs/}

libraries/                                # Copy-into dynamic/no-build apps
├── index.md
├── pt-*.js
└── ptr-*.js
```

> Portal, focused Live App, and CLI copies under `references/` are generated by `build_skill_references.py`; do not hand-edit them. `references/developer-guide/{compiled-live-apps,responsive-live-apps}.md`, `references/platform-known-issues.md`, `libraries/`, and `SKILL.md` are maintained by hand.

Always read the relevant reference file — it contains the full API signatures, patterns, and examples you need.

**Do not guess API signatures, return types, or option names.** In the last full post-mortem,
five of nine shipped bugs were calls the agent invented while the correct signature sat unread
in this directory.

Scoped, so it is followed rather than skipped wholesale: the inline `pt` quick reference below
covers `add` / `get` / `list` / `edit` / `delete` / `batch*` / `addMessage` /
`waitForMessageReceived` / `onEntityChanged`, and a CRUD-plus-subscription app needs nothing
else. **Read the reference file before using** documents and media, collections, mentions,
notifications, `callToolDirect`, or anything not named above — and read the *source*
(`primethink.js`) rather than prose if the two ever disagree.

## Reusable Libraries (check before writing code)

`libraries/` holds 18 flat, dependency-light ES modules for **dynamic/no-build** Live Apps.
Copy the files an app needs beside `index.html` / `index.js`; they are not npm packages.
For a compiled Vite template, follow its generated `README.md` and normal source imports instead.
Read `libraries/index.md` for the dynamic-app catalog, exports, and snippets.

```
pt-*.js   framework-agnostic (HTML apps and React apps)
  pt-data.js      entity CRUD, list normalisation, batch, reorder, reactive store
  pt-ai.js        fire-and-forget AI messaging, JSON extraction from AI replies
  pt-docs.js      save/upload/download documents, CSV/JSON/Markdown export
  pt-safe.js      escapeHtml + html`` tagged template + safeUrl (XSS safety)
  pt-format.js    dates, relative time, currency, duration, initials, slugify
  pt-markdown.js  dependency-free markdown → SAFE html
  pt-csv.js       RFC-4180 CSV import/export
  pt-theme.js     dark mode (the only file permitted to touch localStorage)
  pt-boot.js      pinned Tailwind loader, script/style loaders, React mount
  pt-audio.js     mic recording, level meter, upload, diarized transcription
  pt-speech.js    TTS, speech queue, live STT / dictation
  pt-timing.js    drift-corrected metronome, ticker, countdown, auto-scroll

ptr-*.js  React helpers — hooks + components, NO JSX (built with React.createElement)
  ptr-hooks.js    usePtCollection / usePtEntity / usePtSingleton / filter / paginate
  ptr-router.js   hash router for multi-page React apps (Router, Link, NavTabs)
  ptr-ai.js       useAiTask / useAiJson / useAiQueue (fire-and-forget)
  ptr-ui.js       widget kit: AppShell, Button, Modal, Toast, DataTable, FileDropZone, …
  ptr-editor.js   MarkdownEditor, RichTextEditor, autosave, undo/redo
  ptr-dnd.js      sortable lists, kanban board moves, file drop
```

Quick recipes: CRUD list app → `pt-data.js` + `ptr-hooks.js` + `ptr-ui.js` · AI generator →
add `pt-ai.js` + `ptr-ai.js` · multi-page → `ptr-router.js` · editor → `ptr-editor.js` +
`pt-markdown.js` · voice → `pt-audio.js` + `pt-speech.js`.

## Choose the Live App Workflow

Choose before creating files:

1. **Compiled full app (default for new substantial apps):** use `pt live-app new` with its default React + Vite + Tailwind + Flowbite template. This supports a normal nested source tree and npm dependencies. Build it, then deploy only the flat files inside `dist/`.
2. **Dynamic/no-build app:** choose an HTML or React dynamic template when the app is small, must remain editable as deployed source, or the environment cannot run npm. These deploy `index.html` (or the documented dynamic entry files) directly and use the flat `libraries/` modules.
3. **Existing app:** preserve its current model unless the user asks to migrate it. Do not mix platform-transpiled dynamic React assumptions with Vite/npm assumptions.

### Deep1 sandbox workflow for compiled apps

When a Deep1 agent is asked to build a full app, it must use the CLI rather than hand-creating a source tree:

```bash
# Use a new source directory in the sandbox, outside the deployment target.
pt live-app new ./my-app
cd ./my-app

# Read README.md before executing generated code, then edit src/ as needed.
npm install
npm run build

# Deploy the CONTENTS of dist/, not the source tree or dist directory.
rm -rf /documents/app
mkdir -p /documents/app
cp -R dist/. /documents/app/
```

**Do not attempt a pull request from the sandbox.** It typically has no git remote and no
valid GitHub token, so `gh auth status` only burns a cycle. PRs are available exclusively to
`github_repo`-target projects with configured access; for a `live_app` build, report the local
commit hash and the workspace path and let the handoff take it from there.

Before deployment, confirm `dist/index.html` exists and keep the output flat. The default template's build runs `scripts/verify-dist.mjs`, which rejects nested output and root-absolute asset URLs. Vite 8 requires Node `20.19+` or `22.12+`. The CLI itself intentionally does not run `npm install`, build commands, or generated code.

Read `references/developer-guide/compiled-live-apps.md` for variants, safety constraints, custom catalogs, and the no-build deployment path.

## Publishing and Testing Projects (`pt task` / `pt live-app`)

Four orchestration commands turn a **project directory** into a PrimeThink task, or into a
test chat for trying it out (temporary by default, `--permanent` when you mean to keep it).
They print human-readable progress lines, **not JSON** — parse the last line, never pipe
them to `jq`.

| Command | Creates | Needs `GOAL.md` | Final line |
|---|---|---|---|
| `pt task publish DIR` | a task (no chat) | required, non-empty | `Task ID: 81` |
| `pt live-app publish DIR` | a task + `@app` files | optional | `Live App task ID: 31` |
| `pt task test DIR` | a chat | required, non-empty | `Chat URL: …/chats/<id>` |
| `pt live-app test DIR` | a chat + `@app` files | optional | `Chat URL: …/chats/<id>` |

**Project files** (all optional except where noted): `GOAL.md` (the task goal),
`.name.config` (name; defaults to the directory name), `.description.config` (description;
defaults to the name), `INITIAL_PROMPT.md` (initial prompt), `.image.png` (task image —
uploaded by `live-app publish` only).

**`test` never touches a task; `publish` never touches a chat.** Testing does not update the
published task — re-run `publish` for that.

### Publish a task or a Live App, and keep the ID

```bash
pt task publish ./tasks/morning-briefing --virtual-assistant-id 7
# Created task 81 from tasks/morning-briefing
# Task ID: 81

set -o pipefail   # without it the pipeline reports awk's status, not pt's

if ! TASK_ID=$(pt task publish ./tasks/morning-briefing --virtual-assistant-id 7 \
               | tee /dev/stderr | awk -F': ' '/^Task ID: /{print $2}'); then
    echo "publish failed"; exit 1
fi
[ -n "$TASK_ID" ] || { echo "no Task ID in output"; exit 1; }

if ! APP_TASK_ID=$(pt live-app publish ./decision-board --virtual-assistant-id 7 \
                   | tee /dev/stderr | awk -F': ' '/^Live App task ID: /{print $2}'); then
    echo "publish failed"; exit 1
fi
[ -n "$APP_TASK_ID" ] || { echo "no Live App task ID in output"; exit 1; }
```

**Check the status *and* the value — neither alone is enough.** Without `pipefail` the
pipeline reports `awk`'s `0`, so a failed `pt` yields an empty `TASK_ID` and the follow-up run
creates a duplicate task instead of updating one. And a publish can print its ID line and
still exit non-zero — a fatal file-upload failure is reported after the sync summary — so an
ID that is merely non-empty may come from a publish that did not fully succeed.

Re-run with `--task-id "$TASK_ID"` to update instead of creating a duplicate.

**Neither publish command has task-field flags.** The whole option set is `--task-id`,
`--virtual-assistant-id` (required), `--profile`, `--api-url` — plus `--app-dir` and
`--version-name` for `live-app`. A newly published task is always `type: private`,
`status: published`, `chat_type: standard`, with global memory, chat history,
search-in-chat, search-in-documents, summary, documents/collections, scheduled jobs, email
integration, share-action and run-immediately all **off**. To change any of that, follow up
with `pt task update`:

```bash
pt task update "$TASK_ID" --docs-enabled --scheduled-jobs --global-memory --type public
```

Those toggles survive re-publishing: an update run (`--task-id`) only PATCHes `name`,
`description`, `goal`, `initial_prompt`, `virtual_assistant_id`, and `page_type`.

`pt live-app publish` additionally creates the task with `page_type: html`, creates a task
version (`--version-name`, default `Production` — the value must be exactly `Production` or
`Draft`; anything else is rejected with a 422), syncs the app files into the task's `@app`
folder, and uploads `.image.png` when present. A failed version creation is only a
`Warning:` — the publish still succeeds. Failed **file** uploads are fatal and are reported
together after the summary line.

### Test on a chat, and keep the chat ID

`--chat-id` is *optional*: omitting it creates a **new** chat every run — that is the
default, not something you opt into. Record the ID on the first run so later runs update the
same chat instead of littering the workspace with new ones:

```bash
# first run — create and record
set -o pipefail
if ! CHAT_ID=$(pt live-app test ./decision-board --permanent \
               | tee /dev/stderr \
               | sed -n 's#^Chat URL: .*/chats/##p'); then
    echo "test deploy failed"; exit 1
fi
[ -n "$CHAT_ID" ] || { echo "no Chat URL in output"; exit 1; }
printf '%s\n' "$CHAT_ID" > ./decision-board/.chat-id

# after every rebuild — same chat
npm run build
pt live-app test ./decision-board --chat-id "$(cat ./decision-board/.chat-id)"
```

Write the file only after checking the ID — redirecting the pipeline straight into
`.chat-id` truncates it the moment a run fails, losing the chat you were iterating on.

`.chat-id` is a convention for you to follow, not a CLI feature — nothing reads it
automatically. Add it to `.gitignore`; it identifies one person's test chat.

**Use `--permanent` for any chat you intend to keep.** The default is `--temporary`, which is
right for a one-shot check but a poor thing to pin an ID to. Only a newly created chat honors
`--temporary`/`--permanent` and `--workspace-id`; both are ignored when `--chat-id` is given.

`pt task test` requires a non-empty `GOAL.md` — the whole command is "push this goal into a
chat" — and creates the chat with page type `chat`. `pt live-app test` sets page type `html`
on create and forces `html` on reuse, treats `GOAL.md` as optional (the `Updated goal for
chat …` line appears only when the file exists), and does **not** upload `.image.png`, since
there is no task.

### Artifact rules (both `live-app` commands)

- Files are resolved from `--app-dir`, else the first of `dist/`, `app/`, or the project root
  that contains `index.html` or `canvas.html`. `canvas.html` is uploaded **as** `index.html`.
- **The artifact must be flat.** If the artifact dir is a subdirectory, any nested file aborts
  the run — build to a flat output first. From the project root, only web extensions are
  picked up (`.js .css .html .json .map .svg .png .jpg .jpeg .gif .webp .woff .woff2`).
- Same-named remote documents get a **new version** (ID and relative links preserved);
  identical content prints `Unchanged`.

### Gotchas for all four

- **Exit codes**: `0` on success, `1` on any failure, message on stdout (`Error: 404 - …`,
  `Error connecting to API: …`, or `Error: <reason>` for a missing/empty `GOAL.md`, a missing
  `index.html`/`canvas.html` entry, a non-flat artifact, or per-file upload failures).
- The chat URL host is derived from the active profile's API URL (`api.` → `app.`); override
  with `--web-url`. `--open` launches a browser, so skip it in CI.
- **`--version-name` takes only `Production` or `Draft`.** It is not a free-text label: a
  ticket or build name (`--version-name "T-001 v1"`) fails the publish with a 422. Track your
  own version identity in `AGENTS.md` or the release notes, not in this flag.
- `pt live-app test` uploads to `chats/<id>` and `pt live-app publish` to `tasks/<id>`, but
  both land in the `@app` folder of their owner.
- These commands publish a **local project directory**. Inside a Deep1 sandbox you deploy by
  copying the flat `dist/` contents into `/documents/app/` instead (above).

## The Full Lifecycles — do not stop at "it builds"

Publishing is the middle of the job, not the end. Both a Task and a Live App have a
verification stage after deployment, and skipping it is the single most common way work is
reported as finished when it does not work.

### Task lifecycle

```
create/publish  →  build an evaluation plan  →  run  →  read results  →  fix  →  re-run
   pt task          pt eval add                pt eval run   pt eval results
```

The evaluation surface is `pt eval` (13 subcommands) — note it is **top level, not under
`pt task`**, so `pt task --help` gives no hint it exists. The same operations exist as agent
tools in the `primethink_admin` capability (`primethink_add_task_evaluation`,
`primethink_run_task_evaluation`, `primethink_get_task_evaluation_results`, …).

**Choosing `evaluation_type` is the decision that matters.** Get it wrong and a healthy task
looks broken:

| type | use it for | avoid it for |
|---|---|---|
| `exact` | enum values, ids, one-word answers | anything a model phrases freely |
| `similar` | **short, near-canonical strings only** | **prose — see the warning below** |
| `agent` | conversational answers, refusals, tone, multi-criteria judgement | high-volume cheap checks (it costs a model call per item) |

> ⚠️ **`similar` is a lexical ratio — it rewards shared wording, not shared meaning.** A
> correct answer that restructures the sentence is marked down, so it suits short,
> near-canonical strings and not free-form prose. **Default conversational tasks to `agent`**,
> and sanity-check one item before building a whole plan on `similar`.
>
> If a long answer you believe is correct scores implausibly low, do not rewrite the task
> first — score the same pair under `agent` and compare. A large gap means the scorer, not
> the answer.

Other things worth knowing before you build a plan:

- **`chat_group` groups *contiguous* items into one conversation, and defaults to `1`.**
  Items are executed in id order, and the worker opens a new chat whenever the group value
  changes — so groups `1,2,1` produce **three** chats, not two, and the second group-1 item
  loses the first one's context. For N independent single-turn tests give each item its own
  group; for a genuine multi-turn case keep its items adjacent. Because the default is `1`,
  a plan built without passing `--chat-group` collapses into a single N-turn conversation.
- **Always set an evaluator agent before any run:**
  `pt eval settings <task_id> --evaluator-agent-id <id>` (optionally `--pass-threshold`, an
  **integer 1–100** — pass `80` for an 80% gate, not `0.8`; `1` means *one percent*).
  The API rejects a run with 400 *"doesn't have a default evaluator agent ID"*
  **regardless of item types** — an `exact`- or `similar`-only plan fails the same way, and a
  per-item evaluator does not satisfy it. Prefer a purpose-built evaluator over borrowing an
  unrelated agent: a reviewer or persona agent brings its own instructions into the judgement.
- **`good_example_*` / `bad_example_*` calibrate `similar`.** Without them the score is the raw
  ratio with nothing to anchor it.
- **Evaluation runs create one chat per contiguous `chat_group`** — a 6-item plan run twice
  leaves ~12 chats. Budget for the clutter, or clean up afterwards.
- **Simulations** (`pt eval simulate`) drive a multi-turn conversation with a simulated user.
  They are the right tool for behaviour *under pressure* across turns — scope discipline,
  refusals, a user who pushes back — which single-turn items cannot reach. **Grading is opt-in:**
  pass `--evaluation-prompt` (and an evaluator), or the run finishes with `response: null` and
  no score at all.

### Live App lifecycle

```
build  →  publish  →  test the REAL runtime  →  fix  →  re-publish
 npm run build   pt live-app publish/test    ui-testing/
```

**Which test proves what** — three things exist and they are not alternatives:

| | proves | does not prove |
|---|---|---|
| `npm test` (node, pure `src/lib/`) | your domain rules | anything about the platform |
| `npm run test:ui` (Playwright on `vite preview`) | render, theme bridge, layout, focus, screenshots | persistence, `pt`, anything needing a host |
| `tests/live.mjs` against `/api/v1/live/<CHAT_UUID>` | the real runtime: `pt` present, data surviving a reload, row granularity | — |

A persistence claim requires the third. The template ships all three; run the third before
saying an app works.

**A local `vite preview` is not a test.** It has no `window.pt`, so persistence, `pt.add` /
`pt.list` and real-time sync cannot be exercised there at all — and the missing runtime tempts
you into writing defensive guards against an absence that only exists in your test harness.

Test against the authenticated live endpoint instead:

```
GET https://<host>/api/v1/live/<CHAT_UUID>      # UUID, not the integer chat id
Authorization: Token <PT_API_KEY>
```

That request mints the CSRF and scoped tokens, sets the cookies and returns the page with
`window.pt` live from first paint. `https://<host>/live/<chat_id>` is a *different* thing — the
frontend runner, behind an interactive sign-in an API key cannot open.

**Scope the credential to the PrimeThink host.** Use `page.route` to add the header only for
requests to `<host>`; a context-wide `set_extra_http_headers` attaches the key to *every*
request, and the served page loads `https://cdn.socket.io/...` — which would send a
long-lived API key to a CDN. The bundled `run_plan.py` cannot set headers at all yet, so drive
this from a short Playwright script (see `ui-testing/README.md`).

**Always finish a persistence check with a reload.** Adding a row and asserting it is on screen
proves nothing: an in-memory `useState` implementation passes that too. Add → reload →
re-assert is the only version of the test that means anything, and "everything is still there
when I reload" is usually the requirement the user actually cares about.

Full mechanics, plan schema and the runner: `ui-testing/README.md`.

## Dynamic Page Types: HTML and React

A dynamic Live App is deployed as source files in the chat's `@app` folder; `page_type` tells the platform how to render the entry file.

- **`html`** (entry `canvas.html` / `index.html`) — vanilla JS; `pt` and Socket.IO are injected.
- **`react`** (entry `index.js`) — JSX transpiled in the browser by Babel standalone. React 18 + ReactDOM are platform globals; bare `import React from 'react'` does not work.

Dynamic multi-file rules:

- Extra `.js` / `.css` / `.json` / asset files resolve through the injected `<base href="/api/v1/live/{chat}/app/">`.
- Only `index.js` gets the platform JSX transform. Other dynamic modules must be plain JavaScript.
- The deployed artifact must be flat because the app uploader handles top-level files only.
- Tailwind is not injected; load and pin the documented browser build.

Compiled Vite apps are different: npm React is bundled during `npm run build`, source directories may be nested, the page type is **HTML**, and only the flat build output is copied to `/documents/app/`.

## Core Architecture (Quick Reference)

### The `pt` API

Every Live App receives the `pt` object from PrimeThink at runtime. Dynamic apps declare and pin their browser Tailwind build in `<head>`; compiled Vite apps bundle Tailwind during `npm run build`. See `references/advanced-topics/live-apps/docs/Live-Apps-Tailwind-v4.md` for the dynamic setup block.

**Data operations:**

```javascript
// Create
const entity = await pt.add('task', { text: 'Buy groceries', completed: false });

// Read
const item = await pt.get(entityId);

// pt.list() returns a BARE ARRAY by default — NOT { entities: [...] }
const items = await pt.list({ entityNames: ['task'], filters: { completed: false }, limit: 50 });
// items = [{ id, entity_name, data, created_at, ... }, ...]

// There is NO orderBy/sort parameter — the action forwards only entityNames, filters,
// limit, offset, page, pageSize. Sort client-side, and never assume row order: a streak
// or "latest" calculation that trusts it is wrong.

// Pass returnMetadata: true (and only then) to get the envelope with count + pagination
const page = await pt.list({ entityNames: ['task'], limit: 50, returnMetadata: true });
// page = { entities: [...], count: 42, pagination: { limit, offset, has_more } }

// Update (always spread existing data or use merge mode)
await pt.edit(entityId, { ...item.data, completed: true });
// or merge mode:
await pt.edit(entityId, { completed: true }, true);

// Delete
await pt.delete(entityId);

// Batch operations
await pt.batchAdd('task', [{ text: 'Task 1' }, { text: 'Task 2' }]);
await pt.batchEdit([{ id: 1, data: { done: true } }, { id: 2, data: { done: true } }]);
await pt.batchDelete([1, 2, 3]);
```

**Entity structure** (all entities share this shape):
```javascript
{
    id: 123,                          // auto-assigned integer
    entity_name: 'task',              // your entity type
    data: { text: '...', done: false }, // your payload (arbitrary JSON)
    creator_user_id: 456,             // auto-set
    created_at: '2024-03-15T...',     // auto-managed
    updated_at: '2024-03-15T...'      // auto-managed
}
```

**Real-time sync:**

```javascript
// Callback FIRST, options SECOND — pt.onEntityChanged('task', fn) throws "callback must be a function"
const unsubscribe = pt.onEntityChanged(
    (event) => {
        // The payload carries NO data field — action + ids only:
        // event.action · event.entity_id · batch: event.inserted_entity_ids /
        // event.updated_entity_ids / event.deleted_entity_ids
        const ids = event.updated_entity_ids || [event.entity_id];
        refreshFrom(ids);   // fetch the rows with pt.get()/pt.list() AFTER the notification
    },
    // entityName filtering is reliable only for inserts — updated/deleted payloads may omit
    // entity_name, so filter those by action alone: { actions: ['updated', 'deleted'] }
    { entityName: 'task', actions: ['inserted'] }
);
// Returns an unsubscribe function — call it in React effect cleanup or on unload.
unsubscribe();
```

**Chat & messaging:**

```javascript
// Send a message to chat (triggers AI processing, visible in the transcript)
const result = await pt.addMessage('Analyze this data');

// App-driven AI call: { hidden: true } keeps the prompt OUT of the chat transcript
const hiddenResult = await pt.addMessage(prompt, { hidden: true });

// Upload files with a message — the options object always stays LAST.
// Documents are keyed by NAME WITHIN THEIR FOLDER: a same-named upload versions the
// existing one instead of adding a second (PC-08). iOS names every capture image.jpg,
// so ALWAYS make user-supplied names unique before uploading.
const formData = new FormData();
formData.append('files', file, `${crypto.randomUUID()}-${file.name}`);
const fileResult = await pt.addMessage(formData, 'Process this file', { hidden: true });
// fileResult.attachments = [{ document: { id, uuid, name }, ... }], plus files_count.
// Keep the uuid: it is how you display the file later. It does NOT let a later message
// show the model the image again — attach once and store what later stages need (PC-11).
const { uuid } = fileResult.attachments[0].document;

// Display a stored image or file
const src = pt.documentUrl(uuid);        // authenticated stream URL for <img src> / <a href>

// Wait for AI response (preferred over polling)
const response = await pt.waitForMessageReceived(result.task_id, { timeout: 120000 });
const text = response.message;   // the AI text is on .message — NOT .text, NOT .content
// response.reasoning_steps = [{ label, content }]

// Silent file upload (no AI processing)
await pt.uploadFiles(formData, 'reports/2024');

// Get chat members (cache at init, never call in loops)
const members = await pt.getChatMembers();
// members: [{ id, name, type: 'user'|'agent', is_logged_user, is_chat_owner }]

// Send push notification
await pt.sendNotification(userId, 'Title', 'Message body');
```

**Documents & media:**

```javascript
await pt.saveDocument('report.pdf', 'PDF', 'application/pdf', markdownContent);
await pt.searchDocuments('project requirements', 'DOCUMENTS_ONLY');
await pt.generateImage({ prompt: '...', size: '1024x1024', folder: 'images' });
await pt.generateVoice({ text: '...', voice: 'alloy', folder: 'audio' });
```

**Filters (MongoDB-style):**

```javascript
{ status: 'active' }                           // exact match
{ text: { $contains: 'important' } }           // partial string
{ priority: { $in: ['high', 'medium'] } }      // any of
{ completed: { $ne: 'true' } }                 // not equal
{ $or: [{ name: { $contains: q } }, { email: { $contains: q } }] }  // OR
```

### AI-from-App Pattern (hidden message → wait → parse → tell the user)

Every app-driven AI call follows the same beats. Copy this block instead of re-deriving it —
the three parts that get guessed wrong are `{ hidden: true }`, `response.message`, and the
failure path that shows the user nothing.

```javascript
async function importRowsFromText(prompt) {
    let parsed = [];
    try {
        // 1. Hidden message — the prompt must not land in the chat transcript
        const result = await pt.addMessage(prompt, { hidden: true });

        // 2. Wait for the reply (never hand-roll polling)
        const response = await pt.waitForMessageReceived(result.task_id, { timeout: 120000 });

        // 3. The AI text is response.message — NOT .text, NOT .content
        const text = typeof response === 'string' ? response : (response?.message || '');

        // 4. Take the OUTERMOST JSON value; the model may wrap it in prose or ``` fences.
        //    indexOf/lastIndexOf beats a non-greedy regex, which truncates nested arrays.
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']');
        if (start !== -1 && end > start) {
            parsed = JSON.parse(text.substring(start, end + 1));
        }
    } catch (err) {
        console.error('AI import failed', err);
    }

    // 5. ALWAYS give user-visible feedback on failure — a silent no-op reads as a dead button
    if (!Array.isArray(parsed) || parsed.length === 0) {
        showError('Could not read any rows from the AI response. Please try again.');
        return [];
    }
    return parsed;
}
```

File/image variant — the `FormData` comes first, the prompt second, the options object last:

```javascript
const formData = new FormData();
formData.append('files', file);
const result = await pt.addMessage(formData, prompt, { hidden: true });
const response = await pt.waitForMessageReceived(result.task_id, { timeout: 180000 });
const text = response?.message || '';
```

Prefer the wrappers where they are available: `askAIJson` / `extractJson` from
`libraries/pt-ai.js` already strip ``` fences and repair smart quotes and trailing commas,
and retry once. Dynamic apps copy `libraries/pt-ai.js` beside `index.html`; the current
compiled template ships the same helpers at `src/lib/pt-ai.js` — import from there, and if
that file is absent copy `libraries/pt-ai.js` into `src/lib/` rather than hand-rolling the parse.

**This inline shape fits jobs of a few seconds only.** Live App AI work is chat-message based,
so a long generation the app awaits inline dies with the tab. For anything slower — or anything
that must survive a close and reload — go fire-and-forget: send the hidden message, persist the
returned `task_id` in ChatDB, and pick the reply up when it arrives or on the next load
(`onAiTaskChanged` / `resumeAiTasks` in `pt-ai.js`, `useAiTask` in `ptr-ai.js`).

### Live App Rules

- **An app is a focused operational loop, not a route count.** Start from the user's primary job and shortest successful path. A stateful single-workspace app is a valid app. Use tabs, routes, persistent navigation, or a sidebar only when genuinely distinct, repeatedly accessed workflows require them. Never invent destinations, dashboards, or summary panels merely to make the result look app-like or expose behavior to tests.
- **Choose the smallest viable structure and adapt the workflow, not just the CSS.** One dominant workflow normally gets one focused workspace; a few distinct workflows may use tabs or a small route set; broad administrative domains may use a sidebar that becomes an accessible drawer. Phone, tablet, and laptop layouts may remove, defer, collapse, or relocate secondary information instead of stacking every desktop panel. Read and implement `references/developer-guide/responsive-live-apps.md`, then run the primary workflow at narrow-touch, medium-touch, and wide-pointer profiles.
- **Choose creation and editing surfaces deliberately.** Explicit `inline`, `quick add`, or `add from the list` behavior belongs inside or immediately beside the affected collection, with minimum fields first; it is not a separately titled form card on the same page. Use a trigger-opened modal/sheet for a bounded temporary multi-field task and a dedicated view only for a long, multi-step, or independently returnable workflow. Dialog content stays closed and absent from the visible/accessibility trees until its trigger opens it.
- **The workspace is for work, not permanent product explanation.** Do not place an always-visible welcome, feature summary, or "How it works" card above the primary content. Use task-specific empty states, contextual help, dismissible persisted onboarding when first-use orientation is necessary, and a Help action or `@app/HELP.md` for revisitable guidance. A demo may use one mode-selection gateway; after selection, show the clean operational workspace with only a compact mode switcher or Back action. Demo seeding progress is transient.
- **Apply an operational anti-slop pass.** Cards represent real objects or hierarchy; do not wrap every heading, form, filter, metric, and list or nest cards when spacing and dividers suffice. Do not add decorative statistics, status-chip collections, activity feeds, equal card grids, duplicated labels, or dark full-width surfaces without a confirmed task. Remove anything whose absence does not reduce task completion, orientation, necessary information, feedback, or trust.
- **Persist app state in ChatDB — in-memory demo data is a bug.** The starter templates are intentionally BLANK canvases (stack + deployment wiring only): YOU build the data layer, and it must be ChatDB via the injected `pt` global from the first version — hardcoded `useState`-only data means nothing survives a reload and the AI cannot read or edit the app's data. Static mockups with no persistence are acceptable ONLY when the user explicitly asks for one. See "Demo Data (seed-if-empty)" below for the required pattern.
- **Granular entities, never a state blob.** One `entity_name` per domain type, one row per object (`umbrella`, `booking`, `menu_item`, ...). Do NOT stuff the whole app state into a single JSON singleton: the ChatDB panel shows entities, the AI edits individual rows, and `onEntityChanged` sync works per record — a blob defeats all three. Never create entities the app does not read (seeding "display copies" next to a blob is data duplication that silently drifts).
- **Never hand-roll PrimeThink API calls.** All data access goes through the injected `pt` global (directly or via `pt-data.js`/`ptr-hooks.js`). Do NOT invent REST endpoints (there is no `/api/chatdb/...`); do NOT `fetch` PrimeThink URLs by hand. If a helper doesn't exist in the libraries, check the references before writing any HTTP call.
- **ChatDB works only inside the PrimeThink live view.** The `pt` runtime and its tokens exist only on the platform-served page. An app deployed to an external host (Cloudflare Pages, Netlify, ...) has NO `pt` and no way to authenticate — bundle demo data for external deploys, or keep data features live-view-only.
- **No external font/CDN imports.** Do not `@import` Google Fonts or load libraries from CDNs in the deployed app: they break offline/filtered networks and third-party requests may hang the page. Use the system font stack, or self-host font files inside the app folder.
- **flowbite-react 0.12+ has FLAT exports only — dot-notation subcomponents are the LEGACY API and render as `undefined`** (React error #130, blank page at first render). Use `ModalHeader`/`ModalBody`/`ModalFooter`, `TableHead`/`TableHeadCell`/`TableBody`/`TableRow`/`TableCell`, `ToastToggle`, `TabItem`, `AccordionPanel`, ... — NEVER `Modal.Header`, `Table.Cell`, `Toast.Toggle`. The build does NOT catch this (property access is valid JS); the crash appears only when the component first renders.
- **Keep the template's root error boundary.** The react starters wrap `<App />` in a `RootErrorBoundary` (main.jsx / index.html) so a render error shows a readable message instead of a black page — never remove it, and keep it when restructuring the entry point.
- Dynamic HTML apps deploy complete HTML; dynamic React apps use platform-transpiled `index.js`. Compiled React apps deploy the generated `dist/index.html` with page type **HTML**.
- `window.pt` is injected by PrimeThink. Do not bundle `primethink.js`, add production credentials, call `pt.init()`, or install `pt` from npm.
- **Host-controlled theme is a preserved template invariant — follow PrimeThink, not the OS.** Keep the generated bootstrap that reads `?theme=dark|light`, applies the matching class on `<html>`, and handles live `pt:theme` postMessage updates. Theme token files do not replace this bridge; if the entry point is rewritten, port and test the bridge explicitly. Use the class-based dark strategy — `@custom-variant dark (&:where(.dark, .dark *))` (Tailwind v4) or `darkMode: 'class'` (v3) — so `dark:` variants follow that class, never `prefers-color-scheme` or a `'system'` default. The bridge must read **three** sources in priority order (`?theme=` param → server-injected `light`/`dark` class on `<html>` → OS preference) because the app runs in an iframe and `location.search` does not carry the parent's query params — see "Theme Bridge — How It Works" below before touching it. Force both query themes against the opposite OS preference and dispatch the live message. In light mode the largest scaffold and primary-workspace surfaces must appear light; token/class correctness alone is insufficient. See `references/advanced-topics/live-apps/docs/Live-Apps-Tailwind-v4.md`.
- Escape untrusted values before dynamic `innerHTML`; React escapes text by default, so avoid `dangerouslySetInnerHTML`.
- Never use `localStorage` for app data; use `pt.add/edit/list` (theme preference is the sole exception where documented).
- Keep the **deployment artifact** flat. Compiled source trees may be nested, but copy only top-level `dist/` contents to `/documents/app/`.

### Known Compatibility Issues

Entry-per-issue detail, severity and workarounds live in
`references/platform-known-issues.md` (the shared file App Studio's gap analysis reads too).
The ones that bite compiled React apps:

- **flowbite-react `Modal` + React 19 — runtime crash.** Flowbite's `Modal` pulls in
  `@floating-ui/react`, which is incompatible with React 19's concurrent rendering. It
  builds cleanly and crashes the moment a modal opens. Use a portal-based custom modal
  instead — the compiled template ships one at `src/components/Modal.jsx`; if the generated
  template does not have it, write one (`createPortal` + Tailwind, ~40 lines). Every other
  Flowbite component in normal use (Button, TextInput, Badge, Spinner, Table, ...) is safe.
- **flowbite-react 0.12+ has FLAT exports only.** Dot-notation subcomponents
  (`Modal.Header`, `Table.Cell`, `Toast.Toggle`) are the legacy API and resolve to
  `undefined` — React error #130, blank page at first render. Import `ModalHeader`,
  `TableCell`, `ToastToggle`, `TabItem`, `AccordionPanel`, ... The build never catches it.
- **Vite/esbuild does not enforce `no-undef`.** An undeclared or unimported reference
  bundles silently and throws only at runtime. Run ESLint *after* every edit.

### Theme Bridge — How It Works

The app runs **inside an iframe** served at the `/app/` subpath, which is why the naive
two-source bridge (query param → OS preference) renders the wrong theme on any machine
whose OS preference differs from the PrimeThink setting.

- `location.search` inside the iframe **does NOT carry the parent page's query params**.
  The `?theme=light` the user sees in the address bar is on the *parent* URL; reading it
  from inside the iframe yields `null`.
- PrimeThink's server injects `class="light"` or `class="dark"` on the iframe document's
  `<html>` element. **That injected class is the primary signal** — a bridge that falls
  through to `prefers-color-scheme` overwrites it, and that is the bug.

Priority chain, in order:

1. `?theme=` on `location.search` — only meaningful for direct/standalone access.
2. The existing `light`/`dark` class on `<html>` — server-injected, authoritative in the iframe.
3. OS `prefers-color-scheme` — last resort only.
4. `pt:theme` postMessage events — live switching after load; keep the listener.

```javascript
var forced = new URLSearchParams(location.search).get('theme');
if (!forced) {
    var cl = document.documentElement.classList;
    if (cl.contains('dark')) forced = 'dark';
    else if (cl.contains('light')) forced = 'light';
}
apply(forced || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
```

Pair it with the class-based dark strategy — `@custom-variant dark (&:where(.dark, .dark *))`
(Tailwind v4) or `darkMode: 'class'` (v3) — so `dark:` variants follow the class, never the OS.
Verify by forcing both query themes against the opposite OS preference and dispatching a live
`pt:theme` message.

### Project Memory (AGENTS.md + chat memo)

Treat every live-app project as something another agent (or you, next week,
with no conversation history) must pick up cold.

- **`PROJECT.md` at the project root** (e.g. `/sandbox/lido-app/PROJECT.md`) —
  the project's own CLAUDE.md-style map. Create it right after scaffolding and
  keep it current as the app evolves.
  **Not `AGENTS.md`:** the compiled template already ships an `AGENTS.md` there
  holding its ten invariants, each of which exists because it broke a shipped app.
  Writing your map to that filename destroys them silently and permanently — it
  has happened twice, the second time four days after a report warned against it.
  If you find a project whose `AGENTS.md` is a project map rather than the
  template's invariants, that is what happened; recover them from a sibling
  project's copy. Contents of your `PROJECT.md`:
  - what the app does (features, views/routes, admin vs user areas)
  - file structure (which file owns what)
  - ChatDB entity names WITH their data shapes
  - commands: build, publish (`publish_sandbox_path` + `clean_destination`),
    external deploys (e.g. wrangler project name)
  - conventions and decisions (theme, libraries copied into `app/lib/`, ...)
- **`/chat/memo.md`** — the chat-level pointer that survives even when the
  sandbox is not provisioned: project path, stack, entity list, open items.
- **Returning to an existing project: read `PROJECT.md` and the template's
  `AGENTS.md` FIRST**, before re-reading sources. Trust it for what it covers; verify only what you are
  about to change. Update both files whenever features, structure, or entities
  change — a stale map is worse than none.

### Demo Data (seed-if-empty)

When the user asks for a demo (or the app needs starter content), the DEMO
DATA lives in the code ONLY as a seed constant. On startup the app checks
ChatDB and copies the seed in once — after that, ChatDB is the single source
of truth and every render reads from it. Never render from the constants after
seeding, and never re-seed over existing data (a reload must not duplicate or
reset user edits).

```javascript
const DEMO_DATA = {
    umbrella:  [{ code: 'A1', zone: 'front', vip: false }, /* ... */],
    menu_item: [{ name: 'Spritz', price: 7, kind: 'bar' }, /* ... */],
};

async function ensureDemoData() {
    for (const [entityName, rows] of Object.entries(DEMO_DATA)) {
        if (rows.length === 0) continue;        // batchAdd throws on an empty array
        const existing = await pt.list({ entityNames: [entityName], limit: 1 });
        // rowsOf() ships in the compiled template's src/lib/pt-list.js; inline the
        // Array.isArray guard only in a dynamic app that has no build step.
        if (rowsOf(existing).length > 0) continue;
        const seeded = rows.map((row, i) => ({ ...row, seed_key: `${entityName}:${i}` }));
        await pt.batchAdd(entityName, seeded);   // (entityName, dataArray) — NOT one array
        await dropDuplicateSeeds(entityName);
    }
}

// ChatDB has no unique key, upsert or lock, so two members opening the app for the first
// time at once can both see an empty entity and both seed. Converge instead: keep the
// oldest row per seed_key and delete the rest. The oldest copy is never deleted, because
// no instance can see a row older than it, so every instance agrees on it.
async function dropDuplicateSeeds(entityName) {
    const all = rowsOf(await pt.list({ entityNames: [entityName] }));  // no limit: all rows
    const oldest = new Map();
    for (const row of all) {
        const key = row.data?.seed_key;
        if (!key) continue;
        const kept = oldest.get(key);
        if (!kept || row.created_at < kept.created_at
            || (row.created_at === kept.created_at && String(row.id) < String(kept.id))) {
            oldest.set(key, row);
        }
    }
    const extra = all.filter((r) => r.data?.seed_key && oldest.get(r.data.seed_key) !== r);
    if (extra.length > 0) {
        // Another instance may be deleting the same rows; losing that race is fine.
        await pt.batchDelete(extra.map((r) => r.id)).catch(() => {});
    }
}
// init: await ensureDemoData(); then load everything with pt.list per entity.
```

An optional admin "Reset demo" action may delete all rows and re-run the seed
— that is the ONLY path that overwrites existing data. On an external host
(no `pt`), fall back to rendering `DEMO_DATA` read-only in memory.

### Standard Init Pattern

```javascript
document.addEventListener('DOMContentLoaded', async () => {
    const members = await pt.getChatMembers();
    const currentUser = members.find(m => m.is_logged_user);
    await loadState();
    await loadAndRender();
});
```

### Key Rules

1. **No localStorage** — all state goes through `pt.add/edit/list` (chat database). Cross-device, persistent, AI-accessible.
2. **Always spread on edit** — `pt.edit(id, { ...entity.data, newField: val })` or use merge mode `pt.edit(id, data, true)`.
3. **Cache members** — call `pt.getChatMembers()` once at init, not in loops.
4. **Dark mode** — every color must resolve in BOTH themes, and the theme must follow the host (class-based dark + `?theme=`/`pt:theme` bootstrap). The OS `prefers-color-scheme` must never override a host signal, and must never be what the `dark:` variant keys off; it is only the last resort when no host signal exists at all — see the three-source priority above. Two ways to satisfy the color requirement: a `dark:` partner on every color class, OR semantic tokens declared in an `@theme inline` block whose variables are re-bound under `.dark` — with `@theme inline` the utilities need no `dark:` variants at all. Pick one per project and hold to it.
5. **XSS prevention** — always `escapeHtml()` user content before innerHTML.
6. **Server-side filtering** — use `filters:` in `pt.list()`, not client-side `.filter()`.
7. **Debounce saves** — 1s debounce for frequent state updates.
8. **waitForMessageReceived** — use this instead of polling for AI responses.

## Final Verification Checklist (run before telling the user the app is done)

Every rule below already appears above. The bugs that reach users are almost never
unknown rules — they are known rules that were never re-checked at the end. Treat this
as a **hard completion gate**: do not report the app as finished until every box is
verified, and verify the **runtime** items by actually loading the deployed app in the
live view — not by reading the code (the build passes on all of these).

**Must observe at runtime (load the deployed app and click through it):**

- [ ] **Every view and modal renders — no React error #130.** Open each route/modal,
  *including the ones you just added* (e.g. "New Task"). #130 ("Element type is invalid:
  got `undefined`") means a component resolved to `undefined`. #1 cause: flowbite-react
  dot-notation (`Modal.Header`, `Table.Cell`, `Toast.Toggle`) — 0.12+ is FLAT exports only
  (`ModalHeader`, `TableCell`, `ToastToggle`). The build does NOT catch this; it crashes
  only when that component first renders. Also rule out any other undefined/misspelled import.
- [ ] **Theme follows the PrimeThink setting, NOT the OS.** With PrimeThink in light mode
  the app must render light even when the laptop's OS is dark (test `?theme=light` and
  `?theme=dark`). If it tracks the OS instead, the class-based dark strategy or theme
  bootstrap is missing: you need `@custom-variant dark (&:where(.dark, .dark *))` (v4) or
  `darkMode: 'class'` (v3) AND the bootstrap that applies the `dark`/`light` class from the
  host `?theme=` param + `pt:theme` postMessage. The default must be "follow the host,"
  never `'system'`/`prefers-color-scheme`.
- [ ] **The visual pass follows `references/design.md`** — clear hierarchy (weight and color
  before size), a consistent spacing rhythm, every color resolving in both themes (a `dark:`
  partner on each color class, or `@theme inline` tokens re-bound under `.dark`, which need
  no `dark:` variants), and none of the anti-slop patterns (equal card grids where a table
  belongs, decorative metrics, card-wrapped everything, permanent explainer panels).
- [ ] **Data survives a reload.** Create something, refresh — it is still there. If it
  vanished, state is in-memory (`useState` only) instead of ChatDB.
- [ ] **The primary workflow works at phone, tablet, and laptop frame/input profiles.** The
  primary object and action remain identifiable; secondary desktop regions are removed,
  collapsed, or relocated rather than blindly stacked; focused fields and submit actions
  survive the virtual keyboard; and the document has no horizontal overflow or double
  scrollbar. If persistent navigation exists, also verify desktop navigation, the mobile
  drawer, Escape, backdrop, route selection, focus trap, and focus return. Do not require a
  navigation drawer for a focused workspace with no persistent primary navigation.
- [ ] **Creation surfaces match the requirement.** Inline creation is adjacent to its collection
  and inserts the result there. Dialog/sheet forms are closed and not focusable initially,
  open from a trigger, and satisfy focus/dismissal behavior. A long form has a separate view
  only when its complexity justifies one.
- [ ] **Guidance and demo chrome do not displace the work.** General explanation is absent from
  the normal workspace; empty-state guidance disappears when content exists; onboarding
  dismissal survives reload at its intended scope; Help remains reachable; and a selected
  demo mode leaves only a compact switcher or Back action.

**Code review before deploy:**

- [ ] **All app data goes through `pt` (ChatDB), never `localStorage`** (the theme
  preference is the only permitted localStorage key). No invented REST endpoints, no
  hand-rolled `fetch` to PrimeThink URLs.
- [ ] **Granular entities — one `entity_name` per type, one row per object, not a state
  blob.** Every entity the app writes is one it also reads.
- [ ] **Demo/seed data is seed-if-empty:** seeded once, never re-seeded over existing rows,
  and every render reads from ChatDB — not from the seed constant.
- [ ] **The structure matches the workflow:** the primary job is immediately available, every route represents a distinct workflow, and no route, panel, summary, or navigation layer exists only for formal coverage.
- [ ] **Root error boundary still wraps `<App />`** (readable message instead of a black page).
- [ ] **No external font/CDN imports** beyond the pinned Tailwind build.
- [ ] **`pt.edit` spreads existing data** (`{ ...entity.data, ... }`) or uses merge mode.
- [ ] **Untrusted values escaped before `innerHTML`** (React text is safe; avoid
  `dangerouslySetInnerHTML`).
- [ ] **ESLint passes with no errors after ALL edits.** Vite/esbuild does NOT enforce
  `no-undef` — it bundles silently even with undeclared references, so a typo or a
  function that was never imported ships and throws only in the browser. Run the linter
  after editing, not just before.

**Deployment:**

- [ ] **Compiled apps built with relative asset paths** (Vite `base: './'`), `dist/index.html`
  exists, `verify-dist` passed, and only the flat contents of `dist/` were copied to
  `/documents/app/` (`clean_destination` to drop stale bundles).
- [ ] **`AGENTS.md` and `/chat/memo.md` updated** with any new views, entities, or commands.

If any box fails, fix it and re-verify. **Do not report completion with a known failing item** —
"it builds" is not "it works": #130 and the theme trap both pass the build and only surface
when a human opens the app.

## Automated UI Testing (plan-driven, deterministic)

For repeatable UI testing of a deployed Live App, use the plan-driven workflow in
`ui-testing/README.md` — **read it before testing**. In short:

1. Deploy/open the app so there is a live chat URL to test — `pt live-app test DIR --permanent`
   on the first run, then `--chat-id "$(cat DIR/.chat-id)"` to keep testing the same chat
   (see "Publishing and Testing Projects" above).
2. Capture the app's **accessibility snapshot** and author `tests/test_plan.yaml`
   from it (a YAML step DSL with semantic `role`/`name`/`text`/`label` targets —
   never guess selectors from memory). For apps, add the phone/tablet/laptop viewport matrix and primary-workflow assertions from the testing README; add navigation-shell assertions only when persistent navigation exists.
3. Run it deterministically — no LLM in the execution loop:
   ```bash
   pip install playwright pyyaml && playwright install chromium   # once
   python ui-testing/run_plan.py tests/test_plan.yaml
   ```
4. Read `tests/results/results.json` + `test_results.md`. For each failed step,
   open its attached snapshot, fix that **one** `target` in the YAML, and re-run.
5. Commit `tests/test_plan.yaml` — it is the durable, reviewable artifact.

Authoring and healing are your job (they are LLM work); execution is fixed code, so
the same plan yields the same steps every run and is safe to gate a publish on.
This replaces the old agentic `pt live-app test-ui` command.

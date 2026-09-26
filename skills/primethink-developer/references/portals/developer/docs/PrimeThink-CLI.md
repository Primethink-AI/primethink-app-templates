# PrimeThink CLI - User Guide

Welcome to the PrimeThink CLI User Guide! This comprehensive guide will help you get started with the PrimeThink command-line interface and make the most of its features.

For a terse, complete listing of every command and option, see the [CLI Reference](https://github.com/primethink-ai/primethink-cli/blob/main/docs/cli-reference.md).

## Introduction

The PrimeThink CLI is a powerful command-line tool that allows you to interact with PrimeThink's AI platform directly from your terminal. Whether you're looking to automate tasks, integrate AI into your workflows, or simply prefer working from the command line, the PrimeThink CLI makes it easy.

### What Can You Do With the CLI?

- Execute AI-powered task actions
- Send messages to chats and agents
- Manage multiple API tokens and environments
- Upload, download, and sync files with chats and collections
- Manage chats end to end: create, read messages, archive, delete
- Create, update, and manage agents (virtual assistants)
- Create, update, version, duplicate, and manage task visibility — including scheduled tasks
- Publish and test conventional task projects from version-controlled directories
- Build, publish, synchronize, and run browser tests against Live Apps
- Export a task's config to a git-friendly JSON file and re-import it in another environment
- Search documents, chats, collections, and messages semantically
- Transcribe, translate, diarize, and synthesize audio, and analyze video
- Organize chats into workspaces, and manage groups, members, and tags
- Read notifications, look up users, and manage group and user settings
- Build, run, and simulate task evaluations
- Create and reorganize folders, and version the documents inside them
- Generate AI images from text prompts
- Integrate PrimeThink into scripts and automation workflows

## Installation

### Requirements

- Python 3.8 or higher
- pip (Python package installer)
- Internet connection

### Quick Install (macOS & Linux)

```bash
curl -fsSL https://primethink.ai/cli/install.sh | bash
```

### Quick Install (Windows PowerShell)

```powershell
irm https://primethink.ai/cli/install.ps1 | iex
```

### Install via pip

```bash
pip install primethink-cli
```

#### Optional extra: agent tools

The CLI wheel also carries the **agent tools plugin**, which exposes PrimeThink's management surface to agents as LangChain tools. It is off by default so that ordinary installs stay lean, and it is only needed where agents actually run:

```bash
pip install 'primethink-cli[agent-tools]'
```

The extra pulls in `langchain-core` and `pydantic` and needs Python 3.9 or newer. Without it the plugin's entry point stays inert; if something calls it anyway, it fails with a message naming the extra to install rather than an obscure import error.

Because the plugin now lives inside the CLI wheel, the plugin and the CLI helpers it uses can never be different versions. If you previously installed the standalone `primethink-agent-tools` distribution, uninstall it before adding the extra so the two do not shadow each other.

### Install via Homebrew (macOS & Linux)

```bash
brew tap primethink-ai/tap
brew install primethink-cli
```

### Install from Source

```bash
git clone https://github.com/primethink-ai/primethink-cli.git
cd primethink-cli
pip install -e .
```

### Verify Installation

```bash
pt version
```

You should see output like:
```
PrimeThink CLI v1.1.0
```

## Getting Started

### Step 1: Obtain an API Key

1. Log in to your PrimeThink account at [https://app.primethink.ai](https://app.primethink.ai)
2. Navigate to **Settings** → **API Keys**
3. Click **Generate New Key**
4. Copy the generated API key (you won't be able to see it again!)

### Step 2: Configure the CLI

Run the configuration command with your API key:

```bash
pt profile add --token YOUR_API_KEY
```

You should see:
```
✓ Token configured for profile 'default' (API: https://api.primethink.ai)
✓ Profile 'default' set as active
```

### Step 3: Test Your Setup

Check who you're authenticated as:

```bash
pt whoami
```

This prints your user details and groups as JSON — if it succeeds, your token works. It also reports `active_group` (the group that agent, chat, capability, and settings commands resolve against) and `configured_providers` (the LLM providers your workspace holds an API key for), so you can tell at a glance which group a profile acts in. Both are best-effort: a token that cannot read them still gets the user and group list. It also takes `--profile`, which makes it the quickest way to verify which account each profile points at:

```bash
pt whoami --profile production | jq '.user.email'
```

You can also list available task actions:

```bash
pt task actions
```

If you see a list of available actions, you're all set!

## Live App Project Workflows

### Scaffold a Live App

Use `pt live-app new` to create a local project from PrimeThink's public template catalog. Scaffolding downloads public template files and does not call the PrimeThink API, so it does not require a token or configured profile.

```bash
# Default: React + Vite + Tailwind + Flowbite
pt live-app new ./my-app

# No-build HTML + Tailwind
pt live-app new ./my-html-app --framework html --no-flowbite

# No-build React without Tailwind or Flowbite
pt live-app new ./my-react-app --no-tailwind --no-flowbite
```

| Option | Default | Description |
|--------|---------|-------------|
| `--framework react\|html` | `react` | Select React or HTML |
| `--tailwind` / `--no-tailwind` | `--tailwind` | Include or exclude Tailwind CSS |
| `--flowbite` / `--no-flowbite` | `--flowbite` | Include or exclude Flowbite; Flowbite requires Tailwind |

The six supported starters are intentionally blank canvases. They retain only the selected framework and dependencies plus required PrimeThink wiring, such as the host-theme bridge and deployment configuration. They do not include a sample interface, entities, colors, layout, or application behavior. Build the UI and ChatDB data layer for your application rather than expecting sample CRUD code from the template.

Scaffolding also names the app after the directory you created it in, so it does not ship with the template's identity in its browser tab. `pt live-app new word-painter` sets the page title to `Word Painter` and the package name to `word-painter`, and says so on the last line of its output:

```text
Created PrimeThink Live App at word-painter
Template: react-default (react, tailwind=yes, flowbite=yes)
Named "Word Painter" in index.html, package.json — edit if you want something else.
```

It is deliberately best effort: a template that has no such files is left alone, and a file it cannot read is skipped rather than failing the scaffold. Any other keys in `package.json` are preserved. Change the name afterwards if you want something other than what the directory name produced.

!!! tip "Scaffolding into a `sandbox/` subfolder still names the app properly"
    Some repositories keep each app's source in a fixed subfolder — `word-painter/sandbox`, for example. A directory name that describes a *slot* rather than an app is ignored, and the parent directory names the app instead:

    ```text
    pt live-app new word-painter/sandbox   ->  "Word Painter" / word-painter
    pt live-app new my-cool-app            ->  "My Cool App"  / my-cool-app
    ```

    The names treated as slots are `sandbox`, `app`, `apps`, `src`, `dist`, `web`, `client` and `frontend`. Without this, every app scaffolded under such a convention was titled "Sandbox" — which is easy to miss until it is the browser tab title of a published app.

!!! important
    Read the generated `README.md` before building or deploying. The default Vite project has a build step and deploys the files inside `dist/`; no-build templates deploy their generated HTML entry file directly. Preserve the generated PrimeThink deployment and host-theme wiring.

#### The React template checks your work as it builds

The React starter's `npm run build` lints first and verifies the built artifact afterwards, so a project that builds is a project that can actually be deployed. Both steps are also available on their own, as `npm run lint` and `npm run verify:dist`.

The lint step includes rules for the PrimeThink mistakes that are easy to make and hard to spot at runtime, among them:

- reading an AI reply from the wrong property instead of the message itself
- passing `pt.onEntityChanged` its arguments in the wrong order
- treating a `pt.list()` result as though it were wrapped in metadata when it is not
- persisting state to browser storage instead of through ChatDB
- posting an app-driven message without marking it hidden
- calling `pt` from inside a React state updater
- using a Flowbite component that crashes under this template's React version

The verification step checks the build output is a shape PrimeThink can serve — a flat artifact with the expected entry file — rather than letting a broken deployment be discovered in a chat.

#### It also ships tests to write into

The React starter comes with a place to put your acceptance tests and a browser test suite already wired up:

```bash
npm install
npx playwright install chromium   # once per machine
npm test                          # acceptance tests, run with Node's own test runner
npm run test:ui                   # Playwright, against the built app
```

`tests/acceptance.test.mjs` is a deliberately empty skeleton: the template's advice is to transcribe what the app must do into it *before* building the interface, and to keep domain logic in plain modules so it can be tested without a browser or a stubbed `pt`. `tests/ui.spec.mjs` covers the things that are easy to break and tedious to check by hand — that the host theme reaches the app, that it renders at all, and that its appearance has not drifted.

!!! warning "The first `npm run test:ui` run fails on purpose"
    Playwright has no screenshot baselines to compare against yet, so it writes them and reports the run as failed. Look at the images, commit the ones that are right, and run again.

**Each project gets its own preview port.** The browser suite builds the app and serves it on a port derived from the project's own directory, in the range 4200–4899. This matters more than it sounds: when every scaffold used the same port, a second project's suite would quietly adopt a preview server left running by a *different* app and test that instead — a suite that passes while proving nothing, or fails against another app's markup.

Two consequences worth knowing:

- An already-running preview is **not** reused by default. Every run builds and serves this project, and if the port is occupied the run fails loudly rather than testing somebody else's build.
- Set `PT_REUSE_PREVIEW=1` to reuse a preview you started yourself while iterating, and `PT_PREVIEW_PORT` to move off a port that collides. Two projects can derive the same port, which is exactly why reuse is opt-in.

`PT_CHROME` points the suite at an already-installed Chrome, for machines where `npx playwright install` is unreliable.

#### What the browser suite cannot tell you

`vite preview` serves your built files as static files. It is **not** the platform: there is no `window.pt`, so persistence, reads and writes, and real-time sync are not exercised at all. Layout, the theme bridge, keyboard and focus behaviour, and screenshots are.

The starter ships two things to close that gap:

- **`tests/pt-stub.mjs`** — one canonical browser stub, so screens that need a `pt` to render can be tested. It is backed by `sessionStorage`, which makes *write, reload, assert it is still there* a test an app holding its state in component state will fail. It **throws** on any method it does not implement rather than returning `undefined`, so it cannot quietly teach you an API that does not exist. Use it for rendering and flow only — never treat it as evidence about how the platform behaves.
- **`tests/live.mjs`** — the app loaded the way PrimeThink actually serves it, against a real chat:

    ```bash
    PT_API_KEY=... node tests/live.mjs <chat-uuid>
    ```

    It asserts that `pt` is injected and real, that the app renders, and that a row it writes survives a reload. Run this before concluding an app works.

#### The shipped primitives carry no colours of their own

Alongside the tests the starter includes a few primitives worth reusing rather than rewriting: helpers for reading rows and counts out of a `pt.list()` result, and table and modal components that forward the attributes those elements need, so column spans and accessibility attributes survive.

Their colour comes entirely from seven `--pt-*` CSS variables declared in `index.css` — **no palette classes and no `dark:` variants**. A project using its own design tokens repoints those variables once:

```css
:root { --pt-surface: var(--color-card); --pt-on-surface: var(--color-ink); }
```

That is deliberate, and it replaces having to override the components at every call site. Overriding a Tailwind colour with another Tailwind colour is unreliable for a reason worth understanding before you try it — see [the colour-override trap](/admin/Live-Apps-Tailwind-v4/#when-two-colour-utilities-collide-alphabetical-order-decides). A test in the starter fails the suite if a palette colour or a `dark:` variant creeps back into these components.

This local suite is separate from the skill's YAML-plan runner described under [Run deterministic Live App UI tests](#run-deterministic-live-app-ui-tests): these tests run against your project on your machine, while the YAML plans run against an app already deployed into a chat.

### Install the Live App developer skill

Generated template READMEs direct developers and compatible coding agents to the complete `primethink-developer` skill for the injected `pt` API, ChatDB patterns, reusable libraries, deployment, and other Live App conventions. Install it in the scope used by your coding agent:

```bash
pt install-developer-skill                       # ~/.claude/skills (default)
pt install-developer-skill --project             # ./.claude/skills
pt install-developer-skill --dir ~/.kiro/skills  # custom skills directory
```

The installer downloads the complete skill from the public PrimeThink templates repository, including its references and reusable libraries. It does not require a PrimeThink token. An existing installation is not overwritten unless you explicitly pass `--force`.

The install writes a `VERSION` file into the skill directory recording which revision you have, and prints where it went:

```text
Installed skill 'primethink-developer' to ~/.claude/skills/primethink-developer
Included 164 files from skills/primethink-developer, including subdirectories.
Version marker: ~/.claude/skills/primethink-developer/VERSION (ref v1.2.3)
Compatible agents will pick it up on their next session in that scope.
```

The file records the ref, the source repository and path, the file count, and when it was installed. Quote it when reporting a problem with the skill — without it, neither you nor anyone else can tell which revision the behaviour came from. Writing the marker is best effort: if it cannot be written the install still succeeds and says so, naming the ref on the same line.

`pt install-developer-skill` is distinct from `pt install-skill`: the developer skill covers building PrimeThink Live Apps and integrations, while the CLI skill teaches compatible agents the general CLI command map and workflows.

### Publishing and testing projects

Four orchestration commands turn a **project directory** into a PrimeThink task, or into a test chat for trying it out (temporary by default, `--permanent` when you mean to keep it). They print human-readable progress lines, **not JSON**, so parse the last line rather than piping to `jq`.

| Command | Creates | Needs `GOAL.md` | Final line |
|---|---|---|---|
| `pt task publish DIR` | a task (no chat) | required, non-empty | `Task ID: 81` |
| `pt live-app publish DIR` | a task + `@app` files | optional | `Live App task ID: 31` |
| `pt task test DIR` | a chat | required, non-empty | `Chat URL: …/chats/<id>` |
| `pt live-app test DIR` | a chat + `@app` files | optional | `Chat URL: …/chats/<id>` |

All four use the same project-file conventions, and every file is optional except where the table says otherwise: `GOAL.md` (the task goal), `.name.config` (name; defaults to the directory name), `.description.config` (description; defaults to the name), `INITIAL_PROMPT.md` (initial prompt), and `.image.png` (task image). Command-specific handling is noted below — `.image.png`, for example, is read only by `pt live-app publish`, since the test commands have no task to attach it to.

#### Capture the ID the command prints

```bash
pt task publish ./tasks/morning-briefing --virtual-assistant-id 7
```

```text
Created task 81 from tasks/morning-briefing
Task ID: 81
```

Capture that ID for later updates, and re-run with `--task-id "$TASK_ID"` to update instead of creating a duplicate:

```bash
out=$(pt task publish ./tasks/morning-briefing --virtual-assistant-id 7) || { echo "publish failed"; exit 1; }
printf '%s\n' "$out"
TASK_ID=$(printf '%s\n' "$out" | awk -F': ' '/^Task ID: /{print $2}')
[ -n "$TASK_ID" ] || { echo "no Task ID in output"; exit 1; }
```

**Check the status *and* the value — neither alone is enough.** Capture `pt`'s output
instead of piping it into `awk`: a pipeline would report `awk`'s `0` rather than `pt`'s
status, so a failed publish would yield an empty `TASK_ID` and the follow-up run would
create a duplicate task instead of updating one. The status alone is not enough either — the
publish command can print its ID line and still exit non-zero, because a fatal file-upload
failure is reported after the sync summary, so a non-empty ID may still come from a run that
did not fully succeed.

`pt live-app publish` prints richer progress and ends with `Live App task ID:`:

```text
Created task 31 from decision-board
Created task version Production
Synchronizing 3 file(s) from decision-board/dist
  Uploaded index.html
  Updated app.css
  Unchanged logo.svg
App sync complete: 1 uploaded, 1 updated, 1 unchanged, 0 failed
Uploaded task image decision-board/.image.png
Live App task ID: 31
```

```bash
out=$(pt live-app publish ./decision-board --virtual-assistant-id 7) || { echo "publish failed"; exit 1; }
printf '%s\n' "$out"
APP_TASK_ID=$(printf '%s\n' "$out" | awk -F': ' '/^Live App task ID: /{print $2}')
[ -n "$APP_TASK_ID" ] || { echo "no Live App task ID in output"; exit 1; }
```

The same two checks apply here, and the upload case is the reason the value check is not
enough on its own: `live-app publish` prints `Live App task ID: 31` before it reports a fatal
file-upload failure, so `$APP_TASK_ID` can be set on a run that exited non-zero.

#### Neither publish command sets task fields

**The publish commands have no task-field flags.** The entire option set of `pt task publish` is `--task-id`, `--virtual-assistant-id` (required), `--profile`, and `--api-url`; `pt live-app publish` adds only `--app-dir` and `--version-name`. A newly published task is always created as `type: private`, `status: published`, `chat_type: standard` (`page_type: html` for a Live App), with global memory, chat history, search-in-chat, search-in-documents, summary, documents/collections, scheduled jobs, email integration, share-action and run-immediately all **off**. To change any of that, follow up with `pt task update`:

```bash
pt task update "$TASK_ID" --docs-enabled --scheduled-jobs --global-memory --type public
```

That follow-up is safe against re-publishing: an update run (`--task-id`) only PATCHes `name`, `description`, `goal`, `initial_prompt`, `virtual_assistant_id`, and `page_type`, so toggles you set server-side survive.

#### Keep one test chat instead of many

`--chat-id` is *optional*: omitting it creates a **new** chat every run — that is the default, not something you opt into. Store the ID so subsequent runs update the same chat instead of littering the workspace with new ones.

```bash
pt task test ./tasks/morning-briefing --permanent --open
```

```text
Created permanent chat 3f2a-bb…
Updated goal for chat 3f2a-bb…
Chat URL: https://app.primethink.ai/chats/3f2a-bb…
```

First run — create and record, writing `.chat-id` only once a chat ID was actually captured:

```bash
# first run — create and record
out=$(pt task test ./tasks/morning-briefing --permanent) || { echo "test deploy failed"; exit 1; }
printf '%s\n' "$out"
CHAT_ID=$(printf '%s\n' "$out" | sed -n 's#^Chat URL: .*/chats/##p')
[ -n "$CHAT_ID" ] || { echo "no Chat URL in output"; exit 1; }
printf '%s\n' "$CHAT_ID" > ./tasks/morning-briefing/.chat-id
```

Write the file only after checking both the status and the ID — redirecting the command
straight into `.chat-id` truncates it the moment a run fails, losing the chat you were
iterating on. The status check alone would miss a run that exits `0` without printing a
`Chat URL:` line; the ID check alone would miss a run that printed the URL and then failed.

Later runs — reuse:

```bash
pt task test ./tasks/morning-briefing --chat-id "$(cat ./tasks/morning-briefing/.chat-id)"
```

The same convention works for a Live App, which is the fastest way to iterate after each rebuild:

```bash
# first run — create and record
out=$(pt live-app test ./decision-board --permanent) || { echo "test deploy failed"; exit 1; }
printf '%s\n' "$out"
CHAT_ID=$(printf '%s\n' "$out" | sed -n 's#^Chat URL: .*/chats/##p')
[ -n "$CHAT_ID" ] || { echo "no Chat URL in output"; exit 1; }
printf '%s\n' "$CHAT_ID" > ./decision-board/.chat-id

# After each rebuild, redeploy into that same chat
npm run build
pt live-app test ./decision-board --chat-id "$(cat ./decision-board/.chat-id)"
```

`.chat-id` is a convention for the developer or agent to follow, not a CLI feature — nothing reads it automatically. Add it to `.gitignore`; it identifies one person's test chat.

!!! tip "Use `--permanent` for any chat you intend to store"
    The default is `--temporary`, which is right for a one-shot check but a poor thing to pin an ID to. Only a newly created chat honors `--temporary` / `--permanent` and `--workspace-id`; both are ignored when `--chat-id` is given.

#### Behavior shared by all four

- **`test` never touches a task; `publish` never touches a chat.** Testing does not update the published task — re-run `publish` for that.
- **Exit codes**: `0` on success, `1` on any failure, with the message on stdout (`Error: 404 - …`, `Error connecting to API: …`, or `Error: <reason>` for a missing or empty `GOAL.md`, a missing `index.html`/`canvas.html` entry, a non-flat artifact, or per-file upload failures).
- A failed task-version creation is only a `Warning:` — publishing still succeeds. Failed **file** uploads are fatal and are reported together after the summary line.
- The chat URL host is derived from the active profile's API URL (`api.` → `app.`); override it with `--web-url`. `--open` launches a browser, so skip it in CI.
- `pt live-app test` uploads to `chats/<id>` and `pt live-app publish` to `tasks/<id>`, but both land in the `@app` folder of their owner.

### Publish a Live App task

`pt live-app publish` creates a private, published task from a project directory or updates an existing task when you supply `--task-id`. The assigned agent is required.

```bash
# Create a reusable Live App task
pt live-app publish ./my-app --virtual-assistant-id 7

# Update an existing task
pt live-app publish ./my-app --task-id 42 --virtual-assistant-id 7
```

| Option | Default | Description |
|--------|---------|-------------|
| `--task-id ID` | Create a task | Update this task instead |
| `--virtual-assistant-id ID` | Required | Agent assigned to the task |
| `--app-dir DIRECTORY` | Auto-detect | Flat deployment artifact; otherwise checks `dist/`, then `app/`, then the project root |
| `--version-name NAME` | `Production` | Name for the task version and app-document versions |
| `--profile`, `--api-url` | Active profile | Target PrimeThink connection |

The command reads these conventional project files:

- `.name.config` — optional task name; otherwise the project directory name.
- `.description.config` — optional description; otherwise the task name.
- `GOAL.md` — optional Live App task goal.
- `INITIAL_PROMPT.md` — optional initial prompt.
- `.image.png` — optional task image uploaded after the app files.

The selected artifact must contain `index.html` or `canvas.html`; `canvas.html` is uploaded as `index.html`. The artifact must be flat. If `dist/` or `app/` is selected, every top-level file is included except hidden files and the unused entry alias. For a project-root artifact, only supported web-asset extensions are included. Nested artifact files are rejected before any remote task is created or updated.

Publishing creates a named task version and writes files into the task's `@app` folder. A same-named remote file receives a new document version, which preserves its document ID and relative links. Byte-identical content is reported as unchanged. This is an additive/versioning synchronization: remote `@app` files that are absent locally are not deleted automatically.

### Synchronize a Live App into a test chat

`pt live-app test` deploys the same flat artifact directly into a chat. With no `--chat-id`, it creates a temporary HTML chat by default. With `--chat-id`, it reuses that chat and switches its renderer to Live App mode.

```bash
# Create a temporary test chat
pt live-app test ./my-app

# Update one existing chat and open it
pt live-app test ./my-app --chat-id CHAT_UUID --open

# Create a permanent chat in a workspace
pt live-app test ./my-app --workspace-id WORKSPACE_ID --permanent
```

The command supports the same `--app-dir`, `--version-name`, `--profile`, and `--api-url` choices as publishing. `--temporary` / `--permanent` and `--workspace-id` apply only when creating a chat. By default, the URL is derived from the selected API URL: a host beginning with `api.` is mapped to `app.`, while custom and development hosts are used unchanged. Pass `--web-url` to override the printed/opened application URL. A non-empty `GOAL.md` is applied when present; it is optional for Live App tests.

Existing app documents are versioned, missing documents are uploaded, identical documents are skipped, and any failed file stops the command with a summary. As with publishing, files absent from the local artifact are not removed from the chat.

The chat's page type is set to `html` on create and forced to `html` on reuse. Artifact discovery, `--app-dir`, flatness, and versioning behave exactly as in `pt live-app publish`, with one difference: `.image.png` is **not** uploaded in test mode, since there is no task to attach it to.

### Switch a chat renderer

Use `pt chat type` when you need to change a chat's view without synchronizing a project:

```bash
pt chat type CHAT_UUID live-app  # API page type: html
pt chat type CHAT_UUID chat      # normal conversation view
```

### Run deterministic Live App UI tests

Automated Live App UI testing is no longer a `pt` subcommand. The former `pt live-app test-ui` command was removed in CLI 1.3.4; testing now belongs to the `primethink-developer` skill and uses a reviewable YAML plan with a bundled deterministic Playwright runner. An LLM may author or repair the plan, but no LLM runs in the execution loop.

Install or update the complete developer skill, then install the runner's development dependencies once:

```bash
pt install-developer-skill                       # Claude Code default
pt install-developer-skill --dir ~/.kiro/skills  # Kiro

pip install playwright pyyaml
playwright install chromium
```

Deploy the app to a chat with `pt live-app test`, open that live chat, and follow this workflow:

1. Capture the running app's accessibility snapshot. Author against the rendered interface instead of guessing selectors from source code or memory.
2. Create `tests/test_plan.yaml`. Prefer semantic targets such as `role` + `name`, `text`, and `label`; use CSS or XPath only as a fallback.
3. Run the plan with the copy of `run_plan.py` bundled in the installed skill.
4. Read `tests/results/results.json` and `tests/results/test_results.md`. A failed step also writes a fresh accessibility snapshot.
5. Correct only the failing target, rerun the same plan, and commit `tests/test_plan.yaml` as the durable test artifact.

```bash
# Choose the directory where your coding agent installed the skill.
SKILL_DIR="$HOME/.kiro/skills/primethink-developer"
python "$SKILL_DIR/ui-testing/run_plan.py" tests/test_plan.yaml
```

A minimal plan identifies the deployed chat and gives every scenario and step a stable ID:

```yaml
plan_version: 1
app_name: my-live-app
base_url: https://app.primethink.ai
chat_id: CHAT_UUID

scenarios:
  - id: create-item
    title: User can create an item
    steps:
      - id: create-item.open
        action: navigate
        url: /chats/CHAT_UUID
      - id: create-item.add
        action: click
        target: { role: button, name: "Add" }
      - id: create-item.verify
        action: expect_visible
        target: { text: "Item created" }
```

The runner exits `0` when every step passes, `1` when a test step fails, and `2` for invalid plans or environment errors. See the [complete UI-testing guide](https://github.com/primethink-ai/primethink-app-templates/blob/main/skills/primethink-developer/ui-testing/README.md) for supported actions, assertions, target types, runner options, and result formats.

#### Test more than one screen size

A plan may declare an optional `viewports` matrix. The runner then opens an isolated browser context per entry, repeats every scenario across the matrix, and prefixes each result ID with the viewport name, for example `mobile::navigation.open`. A scenario can opt into a subset with its own `viewports` list:

```yaml
viewports:
  - { name: desktop, width: 1280, height: 800 }
  - { name: tablet, width: 768, height: 1024 }
  - { name: mobile, width: 390, height: 844 }

scenarios:
  - id: mobile-navigation
    viewports: [mobile]
    steps:
      - { id: navigation.open-page, action: navigate, url: /chats/CHAT_UUID }
      - { id: navigation.no-overflow, action: expect_no_horizontal_overflow }
      - { id: navigation.open, action: click, target: { testid: mobile-nav-trigger } }
      - { id: navigation.dialog, action: expect_visible, target: { role: dialog, name: "Navigation" } }
      - { id: navigation.escape, action: press, key: Escape }
      - { id: navigation.closed, action: expect_hidden, target: { role: dialog, name: "Navigation" } }
```

Alongside the matrix, plans can use the `scroll` and `set_viewport` actions and the `expect_no_horizontal_overflow`, `expect_stuck_to_top`, `expect_in_viewport`, and `expect_attribute` assertions to check that an application shell keeps its top bar reachable, swaps wide navigation for an accessible drawer, and avoids horizontal overflow on narrow frames.

!!! note
    Omitting `viewports` keeps the runner's original single-context behavior and unprefixed step IDs. Matrix contexts isolate browser state only — they share the same ChatDB data, so scenarios that create or delete rows should use unique fixture values, clean up after themselves, or run at a single viewport.

!!! warning "Verify browser authentication and review test plans"
    By default, the runner resolves the PrimeThink API token from `PRIMETHINK_TOKEN` or the active CLI profile and seeds the documented local-storage keys before the app loads. Verify those keys against the current web application. If it uses a different key or cookie-based session, configure the plan's `auth` block or pass `--storage-state` with a previously saved authenticated browser session. Never commit tokens or storage-state files.

    Treat a YAML test plan as trusted developer input and review it before execution. Keep navigation on the intended `base_url` origin and use path-safe step IDs containing only letters, numbers, periods, underscores, or hyphens. The current runner does not enforce same-origin navigation or constrain failure-snapshot filenames derived from step IDs, so do not run plans obtained from untrusted sources.

## Configuration

### Managing Profiles

The CLI supports multiple profiles, allowing you to manage different accounts or environments.

#### Create a New Profile

```bash
pt profile add --token YOUR_TOKEN --profile work
```

You can also specify a custom API URL:

```bash
pt profile add --token YOUR_TOKEN --profile custom --api-url https://custom-api.example.com
```

#### Switch Between Profiles

```bash
pt profile use work
```

#### Use a Profile for a Single Command

You can use a specific profile for a single command without switching the active profile:

```bash
pt task actions --profile production
pt chat send 123 --message "Hello" --profile work
pt task execute --action summarize --message "Test" --profile custom
```

This works on every API command, including the `chat`, `collection`, `agent`, `task`, `search`, `image`, and `whoami` commands.

> **Heads-up:** in the `pt task`, `pt agent`, and `pt search` groups, `pt image generate`,
> and `pt whoami`, `-p` is the short flag for `--profile`. In the `pt chat` and
> `pt collection` groups there is no `-p` for profile — there `-p` is the short flag for
> `--path` (a directory inside the chat or collection) on the file commands. Use the long
> form `--profile` when in doubt.

#### List All Profiles

```bash
pt profile list
```

Output example:
```
Configured profiles:
* default (https://api.primethink.ai)
  work (https://api.primethink.ai)
  custom (https://custom-api.example.com)
```

The `*` indicates the currently active profile.

#### Remove a Profile

```bash
pt profile remove old-profile
```

### Custom API URLs

You can configure profiles with custom API endpoints. This is useful for:

- Using different environments (development, staging, production)
- Testing with local API servers
- Accessing region-specific endpoints

```bash
# Configure for development environment
pt profile add --token DEV_TOKEN --profile development --api-url https://dev-api.example.com

# Configure for production
pt profile add --token PROD_TOKEN --profile production --api-url https://api.primethink.ai

# Configure for local testing
pt profile add --token TEST_TOKEN --profile local --api-url http://localhost:8000
```

You can also override the API URL for a single request with `--api-url`/`-u` on any command.

### Configuration File

Your configuration is stored at `~/.primethink/config.json` (on Windows: `%USERPROFILE%\.primethink\config.json`). You can view it:

```bash
cat ~/.primethink/config.json
```

**Note**: Keep this file secure as it contains your API tokens!

### Environment Variables

Every setting can also be supplied through an environment variable. All of
them are optional overrides — when a variable is not set, the CLI falls back
to the config file and its built-in defaults:

| Variable | Description | Default when unset |
|----------|-------------|--------------------|
| `PRIMETHINK_TOKEN` | API token, bypassing the config file. Handy for CI/CD pipelines and containers where you don't want to run `pt profile add`. | Token from the active profile |
| `PRIMETHINK_API_URL` | API base URL override. | Profile's `api_url`, otherwise `https://api.primethink.ai` |
| `PRIMETHINK_PROFILE` | Profile to use when `--profile` is not passed. | The active profile |
| `PRIMETHINK_CONFIG_PATH` | Custom config file path. | `~/.primethink/config.json` |
| `PRIMETHINK_DEBUG` | Set to `1` (or `true`/`yes`/`on`) to print request/response debug information to stderr. | Disabled |

Precedence, highest first: command-line flag (`--profile`, `--api-url`) →
environment variable → config file → built-in default.

```bash
# Run a one-off command against production without touching your config file
PRIMETHINK_TOKEN="$PROD_TOKEN" pt task actions

# Point every command in a CI job at a staging API
export PRIMETHINK_TOKEN="$STAGING_TOKEN"
export PRIMETHINK_API_URL="https://staging-api.example.com"
pt chat list

# Debug a failing request
PRIMETHINK_DEBUG=1 pt chat send 123 --message "Hello"
```

## Core Features

### 1. Available Actions

View all task actions available in your PrimeThink account:

```bash
pt task actions
```

Example output:
```json
[
  {
    "name": "summarize",
    "description": "Summarize text or documents"
  },
  {
    "name": "translate",
    "description": "Translate text to another language"
  }
]
```

### 2. Execute Task Actions

Execute a task action with a message:

```bash
pt task execute --action summarize --message "Summarize this quarterly report"
```

**With files**:

```bash
pt task execute \
  --action analyze_document \
  --message "Analyze this contract" \
  --files contract.pdf
```

**Multiple files**:

```bash
pt task execute \
  --action compare_documents \
  --message "Compare these reports" \
  --files report1.pdf \
  --files report2.pdf
```

**Return original message**:

```bash
pt task execute \
  --action translate \
  --message "Translate to Spanish" \
  --return-original
```

### 3. Send Messages to Chats

Send a message to a chat using its ID or mention name:

**By chat ID**:

```bash
pt chat send 123 --message "Hello from the CLI!"
```

**By mention name**:

```bash
pt chat send @my-assistant --message "What's the weather today?"
```

**With files**:

```bash
pt chat send 123 \
  --message "Please review these documents" \
  --files document1.pdf \
  --files document2.pdf
```

**Asynchronous message** (don't wait for the response):

```bash
pt chat send 123 \
  --message "Process this in the background" \
  --async
```

### 4. Send Messages to Agents

Send a message directly to an agent using the `--agent` option:

```bash
pt chat send --agent 1 --message "Help me plan my week"
```

**With files**:

```bash
pt chat send --agent 1 \
  --message "Analyze this data" \
  --files sales_data.csv
```

**Note:** You must provide either a chat ID/mention or `--agent`, but not both.

## Managing Chats

Beyond sending messages, the `pt chat` group lets you find and manage the chats themselves.

### Find your chats

```bash
# List chats (paginated, 25 per page)
pt chat list

# Filter and sort
pt chat list --search onboarding
pt chat list --starred --sort manually
pt chat list --workspace-id 7 --no-archived
```

### Create a chat

All options are optional — a bare `pt chat create` works:

```bash
pt chat create --name "Q3 planning"

# With a goal, an assigned agent, and members
pt chat create \
  --name "Research" \
  --goal-file ./research-goal.md \
  --virtual-assistant-id 7 \
  --member 12 --member 15
```

Other options: `--workspace-id`, `--parent-chat-id`, `--type standard|direct_users`, and `--public/--no-public`.

### Read a chat's messages

```bash
# The latest 25 messages
pt chat messages 123

# Page back through history: pass the oldest message ID you've seen
pt chat messages 123 --size 50 --before-message-id 900

# Jump to the context around one message (~25 newer + ~25 older)
pt chat messages 123 --anchor-message-id 456
```

Pagination is cursor-based on message IDs (`--before-message-id` / `--after-message-id`), not page numbers.

### Archive or delete a chat

```bash
# Reversible: hide a chat without losing it
pt chat archive 123
pt chat unarchive 123

# Irreversible: prompts for confirmation unless you pass --yes
pt chat delete 123
```

### Rename a chat, update its goal, or switch its renderer

```bash
pt chat rename 123 "Q3 planning (final)"

pt chat goal 123 --goal "Track the Q3 launch checklist"
pt chat goal 123 --goal-file ./goal.md

pt chat type 123 live-app
pt chat type 123 chat
```

`pt chat type ... live-app` maps to the HTML page type; `chat` restores the normal conversation view.

## Working with Chat Files

Chats have their own file workspace, organized into directories. The `pt chat` command group lets you browse, upload, download, and sync those files.

### Browse a chat's files

```bash
# List files and directories at the chat root
pt chat list-files 123

# List a specific subdirectory
pt chat list-files 123 --path /reports
```

The output is JSON with `documents` (files, including their `id`s — you'll need these to download) and `dirs` (subdirectories).

### Upload files

```bash
# Upload to the chat root
pt chat upload-files 123 report.pdf data.csv

# Upload into a subdirectory
pt chat upload-files 123 notes.md --path /meeting-notes
```

### Download a file

Use the document ID from `pt chat list-files`:

```bash
# Save with the original filename
pt chat download-file 123 456

# Save to a specific path
pt chat download-file 123 456 --output ./downloads/report.pdf
```

### Sync a local directory into a chat

`sync-to` uploads a directory's files, preserving the folder structure:

```bash
# Everything in ./reports (top level only)
pt chat sync-to 123 ./reports

# Only PDFs, including subfolders, into the chat's /archive directory
pt chat sync-to 123 ./reports --pattern '*.pdf' --recursive --path /archive
```

Individual upload failures don't stop the sync; you get a summary at the end:

```
Sync complete: 14 uploaded, 1 failed
```

### Sync a chat's files to a local directory

`sync-from` downloads everything (recursively), recreating the directory structure:

```bash
# Back up the whole chat workspace
pt chat sync-from 123 ./chat-backup

# Only the /reports subtree
pt chat sync-from 123 ./reports --path /reports
```

### Two-way sync

`sync` reconciles both sides in one command: files that exist only in the chat are downloaded, files that exist only locally are uploaded, and files present on both sides (same relative path) are left untouched:

```bash
# Preview what would happen
pt chat sync 123 ./workspace --dry-run

# Reconcile the chat folder and ./workspace
pt chat sync 123 ./workspace

# Only the /reports subtree
pt chat sync 123 ./reports --path /reports
```

There's no timestamp comparison — if a file exists on both sides, the CLI can't tell which copy is newer, so it skips it unless you pick a winner:

```bash
pt chat sync 123 ./workspace --prefer remote   # the chat's copy overwrites the local file
pt chat sync 123 ./workspace --prefer local    # the local copy is re-uploaded to the chat
```

If the chat's file tree can't be fully listed (e.g. a network hiccup), the command aborts before transferring anything rather than acting on an incomplete picture. If two remote documents sanitize to the same local filename, `sync` keeps the first and prints a warning about the ignored one — so an "expected" file missing locally after a sync usually has a warning line explaining it. Individual file transfer failures don't stop the run; the summary reports them:

```text
Sync complete: 3 downloaded, 2 uploaded, 4 skipped, 0 failed
```

## Working with Collections

Collections are shared document stores. The `pt collection` file commands work like their `pt chat` counterparts (browse, upload, download, one-way sync), plus there's a discovery command. Note: the two-way `sync` command exists only for chats — collections have `sync-to` and `sync-from`.

### Find your collections

```bash
# List collections (paginated, 20 per page)
pt collection list

# Search by name, with a bigger page
pt collection list --search contracts --page-size 50
```

### File operations

```bash
# Browse
pt collection list-files 42
pt collection list-files 42 --path /policies

# Upload
pt collection upload-files 42 handbook.pdf --path /policies

# Download
pt collection download-file 42 789 --output handbook.pdf

# One-way sync, in either direction
pt collection sync-to 42 ./knowledge-base --recursive
pt collection sync-from 42 ./kb-backup
```

### Create, inspect, copy, and tear down a collection

```bash
# Create — --type skill and --public are optional
pt collection create --name "Knowledge base"
pt collection create --name "Support skill" --type skill --public

# Inspect one collection
pt collection get 42

# Rename, or trigger re-indexing (PATCH semantics)
pt collection update 42 --name "Renamed KB"
pt collection update 42 --indexed

# Duplicate a collection — note this one takes the collection's UUID, not its numeric ID
pt collection copy 3f7c1b9e-2d4a-4f8e-9c11-6b2a5d0e7f31

# Remove uploaded files, or the whole collection (both prompt unless you pass --yes)
pt collection delete-file 42 10 11 12
pt collection delete 42
```

## Semantic Search

The `pt search` group finds content by meaning rather than exact keywords. There are five scopes:

```bash
# Within one chat (messages; optionally its documents and collections)
pt search chat 123 "what did we decide about the deadline"

# Within one collection's documents
pt search collection 42 "termination clause"

# Across documents in a vector store collection (--collection-name is required)
pt search documents "refund policy" --collection-name kb

# Across chat messages (--collection-name is required), with optional filters
pt search messages "standup notes" --collection-name msgs --chat-id 5 --user-id 2

# Among the images in a collection, by example image, by description, or both
pt search images 42 --query "a red sports car"
pt search images 42 --image ./example.jpg --top-k 5
```

All of them accept the same tuning options:

- `--search-type` — `mmr` (server default), `similarity`, or `similarity_score_threshold`
- `--top-k` — how many results to return
- `--score-threshold` — minimum similarity score

Extras per command:

- `pt search chat` has scope toggles: `--in-chat/--no-in-chat`, `--in-documents/--no-in-documents`, `--in-collections/--no-in-collections`
- `pt search collection` accepts `--metadata '{"document_name": "contract.pdf"}'` to filter by document metadata
- `pt search images` takes the numeric collection ID and needs at least one of `--image` or `--query`

> Note: `--collection-name` (for `documents`/`messages`) is a **vector store collection name**, not the numeric collection ID used by `pt collection` commands.

## Managing Agents

The `pt agent` group manages agents (virtual assistants) — the AI assistants you message with `pt chat send --agent`.

### Discover and inspect agents

```bash
# List agents, with optional filters
pt agent list
pt agent list --search support --status archived

# Full details for one agent
pt agent get 7
```

### Create an agent

Three fields are required — a name, a public description, and a type ID (find type IDs with `pt agent types`):

```bash
pt agent types

pt agent create --name "Support bot" --public-description "Answers support questions" --type-id 1
```

Useful optional fields:

```bash
pt agent create \
  --name "Researcher" \
  --public-description "Deep research assistant" \
  --type-id 1 \
  --description-file ./researcher-instructions.md \
  --model openai:gpt-5.5 \
  --access-type group
```

- `--description` / `--description-file` — the agent's description/instructions, inline or from a file
- `--model` — which model the agent uses
- `--access-type` — `private` (default), `group`, `task`, `system`, or `catalog`
- `--tag-ids 3,4`, `--extra '{"key": "value"}'`, `--help-text`, `--help-url`
- `--capability` — attach a capability by its **code** or its numeric ID, repeated once per capability. Codes are portable between environments; IDs are not, so prefer codes in anything you check into version control. If the server drops a capability you asked for — usually one the group has not enabled — the response carries a `warnings` list saying so instead of quietly creating a weaker agent.

To see which IDs a set of codes maps to in the environment you are pointed at:

```bash
pt capability resolve web_search code_interpreter
```

### Give an agent an avatar

```bash
pt agent upload-image 7 ./avatar.png
pt agent delete-image 7
```

### Update or delete an agent

```bash
# PATCH semantics: only the fields you pass change
pt agent update 7 --model openai:gpt-5.4 --public-description "New blurb"

# Delete — prompts for confirmation unless you pass --yes
pt agent delete 7
```

### Message an agent

Messaging stays under `pt chat send` — there is deliberately no separate `pt agent send`:

```bash
pt chat send --agent 7 --message "Analyze this data" --files data.csv
```

## Managing Tasks

The `pt task` group lets you create, inspect, update, and version tasks from the terminal.

!!! note "Evaluations and simulations are not under `pt task`"
    Evaluating a task and simulating a conversation with it are task-shaped operations that live in their own top-level group, `pt eval` — not as subcommands of `pt task`. `pt task --help` now says so too. See [Evaluating and Simulating a Task](#evaluating-and-simulating-a-task).

### Create a task

Three fields are required — name, description, and type (`private`, `public`, `group`, `system`, or `catalog`):

```bash
pt task create --name "Weekly digest" --description "Summarize the week" --type private
```

Everything else is optional and left to server defaults unless you set it. Some highlights (see the [CLI Reference](https://github.com/primethink-ai/primethink-cli/blob/main/docs/cli-reference.md#pt-task-create) for the full list):

```bash
pt task create \
  --name "Morning briefing" \
  --description "Daily news summary" \
  --type private \
  --goal-file ./briefing-goal.md \
  --virtual-assistant-id 7 \
  --schedule-nl "every weekday at 8am" \
  --schedule-prompt "Prepare the morning briefing"
```

- `--goal` / `--goal-file` — the task's goal, inline or from a file
- `--virtual-assistant-id` — which agent runs the task
- `--schedule-nl` — a schedule in plain English (or a cron expression); `--schedule-prompt` is what runs on that schedule
- `--canvas` / `--canvas-file` — HTML canvas content, with `--page-type html`
- `--extra '{"key": "value"}'` — arbitrary extra data as JSON
- Feature toggles like `--global-memory/--no-global-memory`, `--chat-history/--no-chat-history`, `--docs-enabled/--no-docs-enabled`, `--scheduled-jobs/--no-scheduled-jobs`

> Natural-language schedules are interpreted by an LLM on the server, so `create`/`update` calls that include `--schedule-nl` or `--schedule-prompt` use a longer (120s) timeout.

### Inspect and update a task

```bash
# Full task details as JSON
pt task get 99

# Update only the fields you pass (PATCH semantics)
pt task update 99 --description "Updated description"
pt task update 99 --schedule-nl "every Friday at 17:00"
```

### Publish and test a task project

A conventional task project stores its instructions and metadata in files that can be reviewed and versioned with the rest of your code:

```text
briefing/
├── GOAL.md                 # required and non-empty
├── INITIAL_PROMPT.md       # optional
├── .name.config            # optional; defaults to "briefing"
└── .description.config     # optional; defaults to the task name
```

Create a private, published task or synchronize those represented fields into an existing task:

```bash
pt task publish ./briefing --virtual-assistant-id 7
pt task publish ./briefing --task-id 99 --virtual-assistant-id 7
```

When updating, the command changes only the project-backed fields — name, description, goal, initial prompt, and assigned agent — and preserves unrelated server fields. This differs from `pt task import`, which creates a new task from portable JSON.

### Launch a task into a chat

Launching starts the task the way opening it in the app does: the new chat inherits the task's goal, default agent, settings, documents, collections, and scheduled job, and the task's initial prompt is posted.

```bash
pt task launch 280
pt task launch 280 --workspace-id 738
pt task launch 280 --workspace-id ca74dfc4-eb41-4c3f-ae53-b6b1c415617f --name "Collector (CTO)"
pt task launch 280 --version 3
```

`--workspace-id` takes either a numeric ID or a UUID; omit it for a top-level chat. The command prints the new chat as JSON and then a `Chat URL:` line, with the web address derived from your API URL (`api.` becomes `app.`) unless you pass `--web-url`. If the API accepts the launch but answers with nothing usable, the command fails with a non-zero status and no `Chat URL:` line rather than printing a half-built result.

`pt chat create --from-task-id 280` does the same thing through the generic chat command, which is handy when you are already passing other `chat create` options.

Use `pt task test` to apply the required `GOAL.md` to a temporary test chat, or reuse an existing chat. Existing chats are switched to normal chat mode.

```bash
pt task test ./briefing
pt task test ./briefing --chat-id CHAT_UUID
pt task test ./briefing --workspace-id WORKSPACE_ID --permanent --open
```

`--temporary` / `--permanent` and `--workspace-id` apply only to newly created chats. By default, the URL is derived from the selected API URL: a host beginning with `api.` is mapped to `app.`, while custom and development hosts are used unchanged. Pass `--web-url` to override the printed/opened chat URL. The command validates `GOAL.md` before creating or changing a remote chat.

`pt task publish` can set the task's type and feature toggles as it publishes, so a project no longer has to be fixed up afterwards:

```bash
pt task publish ./briefing --virtual-assistant-id 7 \
  --type group --chat-history --docs-enabled --scheduled-jobs
```

`--type` sets the task's visibility, and each toggle has a `--no-…` form to turn it off explicitly: `--global-memory`, `--chat-history`, `--search-in-chat`, `--search-in-documents`, `--summary-enabled`, `--docs-enabled`, `--scheduled-jobs`, `--email-integration`, `--share-action`, `--public-chat`, and `--run-immediately`.

The same settings can live in the project instead, in an optional `task.json` beside the other project files. It uses the portable field names of `pt task export`/`pt task import`:

```json
{ "type": "group", "chat_history": true, "documents_and_collections_enabled": true, "scheduled_jobs_enabled": true }
```

An option on the command line wins over `task.json`, which wins over the defaults. The fields that come from the project files or from options — `name`, `description`, `goal`, `initial_prompt`, `page_type`, `virtual_assistant_id` — are ignored in `task.json`, as are unknown keys and nulls. Only `pt task publish` reads it: `pt live-app publish` ignores it, and it is never uploaded as one of the app's files.

Say nothing about a setting and you get the conservative default: a new task is `private` and `published`, a `standard` chat type, with every feature toggle off. So a task that needs its documents, chat history, or scheduling has to ask for them.

When updating with `--task-id`, the command changes the project-backed fields plus whatever type and toggles the command line or `task.json` state, and leaves every other server field alone — so settings someone changed in the app survive a re-publish unless your project now states them.

For the output these commands print, how to capture the task or chat ID, and the behavior shared with the Live App commands, see [Publishing and testing projects](#publishing-and-testing-projects).

### Duplicate, change visibility, or delete a task

```bash
# Clone a task (prints the new task's JSON, including its id)
pt task duplicate 99

# Toggle a task's visibility (its type) between public and private
pt task set-public 99
pt task set-private 99

# Delete a task — prompts for confirmation unless you pass --yes
pt task delete 99
pt task delete 99 --yes
```

`pt task publish` now publishes a project directory; it no longer changes visibility. The old `pt task unpublish` command has been removed. For task types other than public/private (for example, `group` or `catalog`), use `pt task update 99 --type group`.

### Version a task

Snapshot the task's current state as a named version:

```bash
pt task create-version 99                       # version named "Production"
pt task create-version 99 --version-name "v2"
```

### Export and import tasks (reproducible deployments)

`pt task export` writes a task's **portable config** as JSON — only the fields `pt task create` accepts; server-assigned fields (id, group, owner, timestamps, attached documents, tags) are stripped. `pt task import` creates a **new** task from such a file.

The intended workflow: export a working task, check the file into git, and recreate it in another group or environment with one command — `--profile` on `import` is how you pick the target environment:

```bash
# 1. Export the task you refined in staging and version it
pt task export 42 > tasks/support_bot.json      # or: --output tasks/support_bot.json
git add tasks/support_bot.json && git commit -m "Support bot task config"

# 2. Deploy the exact same task to production
pt task import tasks/support_bot.json --profile production
```

Notes:

- `import` always creates a new task; to change an existing task use `pt task update`.
- ID references in the file (`virtual_assistant_id`, `extra_vas`, `default_evaluator_agent_id`) point at objects in the *source* environment — edit them if the target environment uses different IDs.
- A raw `pt task get` dump also imports cleanly; non-portable fields are ignored.
- `name`, `description`, and `type` are required in the file; a missing `goal` defaults to empty.

### Task images

```bash
# Upload a cover/icon image for a task
pt task upload-image 99 ./cover.png

# Generate an image with AI and save it locally
pt image generate --prompt "A lighthouse at dawn, watercolor" --output lighthouse.png
pt image generate --prompt "Minimal flat team logo" --style illustration --size 512x512 -o logo.png
```

## Working with Individual Messages

Beyond sending and reading messages, `pt chat` can edit, retry, export, and remove them, and turn a whole conversation into a reusable task.

```bash
# Rewrite a message (the message ID is enough — no chat ID needed)
pt chat edit-message 4567 "Corrected wording"

# Ask the agent to answer again
pt chat retry-message 4567

# Export one message as Markdown (default), DOCX, or PDF
pt chat export-message 123 4567 --format pdf --output answer.pdf

# Remove one message, or empty the chat (both prompt unless you pass --yes)
pt chat delete-message 123 4567
pt chat clear-messages 123

# Turn the conversation into a task
pt chat save-as-task 123 --name "Weekly report" --goal "Summarize the week"
```

`delete-message` and `clear-messages` cannot be undone — `clear-messages` empties the entire conversation, so prefer archiving the chat if you only want it out of the way.

## Organizing Chats into Workspaces

Workspaces group related chats. The `pt workspace` group mirrors what the app's sidebar does.

```bash
# List workspaces, optionally narrowed to archived or pinned ones
pt workspace list
pt workspace list --pinned

# Create one, with an optional goal that its chats inherit
pt workspace create --name "Q4 planning" --goal "Ship the Q4 roadmap"

# Rename, or change the goal
pt workspace rename 8 "Q4 delivery"
pt workspace set-goal 8 "Ship the Q4 roadmap"

# Get it out of the way, or bring it to the top
pt workspace archive 8
pt workspace unarchive 8
pt workspace pin 8
pt workspace unpin 8

# Move chats in and out
pt workspace add-chat 8 123
pt workspace remove-chat 123

# Delete the workspace; --delete-chats also deletes the chats inside it
pt workspace delete 8
```

`pt workspace remove-chat` takes only the chat ID — it detaches the chat from whichever workspace currently holds it. `delete` prompts unless you pass `--yes`, and `--delete-chats` is irreversible.

## Groups, Members, and Tags

`pt group` manages groups (organizations), who belongs to them, and which agents they offer.

```bash
# Browse groups and one group's details
pt group list
pt group get 3

# Create and update — the API requires a name on update, so always pass --name
pt group create --name "Acme Legal"
pt group update 3 --name "Acme Legal EU"

# Members
pt group members 3 --search anna
pt group remove-member 3 88
pt group invite --email anna@example.com --role-id 4

# Which agents the group offers
pt group add-agent 3 7 9
pt group remove-agent 3 9
```

`pt group invite` always invites into the *current* group (the one your profile resolves to), not the group ID you pass to other commands. `pt group delete` exists and is irreversible; it prompts unless you pass `--yes`.

Tags label tasks, agents, capabilities, and collections. Every tag command names which of those four it applies to with `--model`.

```bash
pt tag list --model collection --only-used
pt tag create --model collection --name legal --category dept
pt tag assign --model collection --owner-id 42 --tag-id 3 --tag-id 5
```

`pt tag assign` **replaces** the object's whole tag set with the tags you pass, so include every tag you want to keep. Passing no `--tag-id` clears them all.

## Folders and Document Versions

Chats, collections, tasks, and agents all organize their files into folders, and the same four commands work under each of `pt chat`, `pt collection`, `pt task`, and `pt agent`. Listing a folder's contents stays with each group's existing `list-files` command.

```bash
pt chat mkdir 123 /reports
pt collection rename-dir 42 /old-name new-name
pt task move-dir 99 /drafts /archive --merge
pt agent rmdir 7 /scratch --recursive --yes
```

`rmdir` prompts unless you pass `--yes`, and only removes a folder's contents when you add `--recursive`. `move-dir` takes the folder to move and the parent to move it under; `--merge` merges into an existing folder of the same name instead of failing.

Documents in chats, collections, and tasks are versioned, with the same five commands under `pt chat`, `pt collection`, and `pt task`. Take the document ID from `list-files`.

```bash
# What versions exist
pt chat list-versions 123 789

# Add a version from a file, or from raw text
pt chat new-version 123 789 ./handbook-v2.pdf --version-name Production
pt task new-text-version 99 456 --text "Revised clause" --version-name Draft

# Promote a version, or delete one (delete prompts unless you pass --yes)
pt collection set-production-version 42 789 3
pt collection delete-version 42 789 2
```

A version name must be either `Production` or `Draft`; the CLI rejects anything else before the request is sent.

## Audio and Video

`pt voice` and `pt video` hand a media file to the platform's AI. These calls do server-side work and use the longer 120-second timeout.

```bash
# Transcribe, or translate spoken audio into English text
pt voice stt meeting.m4a
pt voice translate interview.m4a

# Label who spoke when
pt voice diarize call.wav --speaker-count 2

# Synthesize speech — saved to tts.mp3 unless you pass --output
pt voice tts --text "Welcome aboard" --voice nova --output welcome.mp3

# Describe what happens in a video
pt video analyze demo.mp4 --extra-instructions "Focus on the UI steps"
```

`pt voice diarize` also accepts `--speaker-name` and `--speaker-file` to name a known speaker from a reference recording, and `--collection-id`/`--save-mode` to store the result. `pt voice tts` accepts `--voice`, `--model`, `--provider`, `--speed`, and `--instructions`; which voices and models are available depends on the providers your group has configured.

## Listing Tasks

```bash
pt task list
pt task list --search onboarding --type private --status all
pt task list --page-type react --order-by name --order-dir asc
```

`--type` can be repeated to include more than one visibility. The output is paginated with `--page`/`--page-size`, and `--starred/--no-starred` narrows it to your starred tasks.

## Finding People

`pt user` searches the directory of users you are allowed to see, which is how you turn an email address or a name into the user ID other commands want. The underlying endpoint takes no query parameters, so `--search` and `--limit` are applied locally after the full list is fetched.

```bash
pt user list
pt user search ann@acme.co
pt user list --search support --limit 20
```

`--full` returns the richer records. Commands that add people to a chat accept `--email` as well as a user ID, resolving the address through this same directory — so an address you cannot see fails with an error rather than silently adding nobody.

## Notifications

```bash
pt notification list --unread-only
pt notification unread-count
pt notification mark-read 4210
pt notification mark-unread 4210
pt notification mark-all-read
pt notification delete 4210
```

`--unread-only` filters the fetched page locally, so combine it with `--page-size` if you are looking through a long history. Sending a notification is not something the API exposes, so there is no `send` command. `delete` prompts unless you pass `--yes`.

## Group and User Settings

`pt settings` is one interface over two different things: the key-value settings store that holds provider API keys, and the dedicated group and user property endpoints. Each key is routed to the right place for you, and unknown keys are rejected rather than silently stored.

```bash
pt settings list --scope group
pt settings get timezone --scope user
pt settings set default_agent 7 --scope group
pt settings delete ANTHROPIC_API_KEY --scope group
```

Settings live at a `group` scope or a `user` scope, and `--scope` is required whenever a key is valid at both:

- **group** — `default_agent`, `voice`, `voice_provider`, `new_chat_logic`, `group_mode`, `default_role`, `document_analysis_active`, `public_name`, `custom_theme_color`
- **user** — `timezone`, `location`, `default_language`, `default_va`, `auto_archive_option`, `custom_theme_color`
- any provider key ending in `_API_KEY`, stored as a secret at group scope unless you say otherwise

!!! warning "Secrets are write-only"
    A sensitive value is never returned. `list` and `get` tell you only whether a value is set and whether it is sensitive, so treat your own records as the only copy of a provider key you enter here.

Values are checked before they are sent: an enum key rejects an unlisted choice, and a numeric or boolean key rejects a value of the wrong shape.

## Evaluating and Simulating a Task

`pt eval` drives the task evaluation flow end to end: build a plan of cases, run the task against it, and read the results. It works on the same evaluation data the app's task evaluation screen shows.

!!! note "Evaluating a task requires managing it, not merely using it"
    Every `pt eval` command — including listing and starting simulations — requires that you **own** the task, hold a role that has been granted access to it, or are a platform administrator. This is stricter than launching a task: being able to *run* a task does not let you read or create its evaluations.

    This matters because evaluation data is not a summary. A simulation record carries the goal, the persona, the prompt and the response, which is the task's behaviour written out in full. A caller without management access to the task gets `403`, and a task id that does not exist gets `404` rather than an empty list.

**Build the plan.** Each case pairs a question with the answer you expect and says how strictly to compare them — `exact` for a literal match, `similar` for a score based on how much of the expected wording the answer reproduces, `agent` to have an evaluator agent judge it.

!!! note "How `similar` scores"
    `similar` compares the answer and the expected response **word by word**, case-insensitively, and reports the overlap as a percentage. It is a wording comparison, not a semantic one: a correct answer phrased entirely differently will score low, so use `agent` when you care about meaning rather than phrasing. Long expected answers are scored correctly — an earlier defect collapsed the score for anything from roughly 200 characters up, marking faithful answers as mismatches.

```bash
pt eval list 99
pt eval add 99 --user-query "What's your return window?" --ideal-response "30 days" --type similar
pt eval add 99 --user-query "Refund a gift?" --ideal-response "Yes, store credit" --type agent --evaluator-agent-id 7
pt eval update 99 12 --ideal-response "30 days from delivery"
pt eval delete 99 12
```

`--examples` takes JSON holding good and bad sample answers, and `--chat-group` keeps related cases together as one conversation.

**Configure how it runs.**

```bash
pt eval settings 99 --active --run-time daily --evaluator-agent-id 7 --pass-threshold 80
```

`--run-time` is `manual`, `daily`, `weekly`, or `monthly`; `--message-delay-ms` paces the messages sent during a run.

`--pass-threshold` is a **whole percentage from 1 to 100** — `80` means a case must score 80% to pass. A fraction such as `0.8` is rejected by the CLI with a usage error rather than being sent on, and the same 1-100 bound is declared by the matching MCP and agent tools, so an AI agent calling them validates against the real range too.

**Run it and read the results.**

```bash
pt eval run 99 --version 3
pt eval runs 99
pt eval run-get 99 405
pt eval results 99 --run-id 405
pt eval download 99 405 --output results.xlsx
```

`--model-override` runs the same plan against a different model, which is the quickest way to compare two models on one task.

**Simulate a conversation.** Rather than one question at a time, a simulation has one agent play a user with a goal and a persona for several turns, then evaluates the transcript.

```bash
pt eval simulate 99 --simulator-agent-id 7 --goal "Return a damaged item" --max-turns 6 --persona "Impatient first-time customer"
pt eval simulations 99
pt eval delete-simulation 99 18
```

**A grade outlives the things that produced it.** A simulation result is the record of what the task scored, so deleting either of its inputs no longer takes the grade with it:

- Delete the **simulator agent** and every grade it ever produced stays listed. The agent simply stops being named against them.
- Delete the **chat** the simulation ran in — directly, by deleting its group, or by marking it temporary and letting it be reaped — and the grade stays listed too, without a transcript to open.

`pt eval simulations` lists these results like any other. A result whose chat is gone carries no chat identifier, which is how you can tell its transcript is no longer available; there is nothing to fetch, and asking for it is not an error you need to handle beyond noticing the identifier is absent.

Deleting the **task** still deletes its simulations, since a simulation is a measurement *of* that task and means nothing without it.

**Reading a simulation's status.** Every simulation carries an explicit status, so a run that dies says so instead of appearing to still be going:

| Status | Meaning |
|---|---|
| `queued` | Accepted, not started yet |
| `started` | Running |
| `finished` | Completed — the transcript was produced and evaluated |
| `error` | Failed. The reason is in the result's response field |

`error` is a **terminal** state: poll until a simulation reads `finished` *or* `error`, never for `finished` alone. A run that fails now reports why — the failure message is recorded on the result — including the cases that were previously invisible, such as a run that exceeded its time budget or one whose simulator agent was deleted before it started.

Scheduled evaluation runs record failure the same way, so a timed-out run no longer reads as permanently in progress.

!!! note "Not every possible death is reported"
    This covers a run that raises and a run that hits its time limit. A worker process killed outright — out of memory, or terminated without warning — has no opportunity to record anything, so such a run can still sit in `started`. Treat a run that has been `started` far longer than its turn budget allows as suspect rather than assuming the status is authoritative.

`pt eval delete`, `delete-simulation`, and the file download all prompt or write to disk, so they are excluded from what an AI agent using the tools plugin can do.

## Common Use Cases

### Use Case 1: Document Summarization

Summarize a document or multiple documents:

```bash
# Single document
pt task execute \
  --action summarize \
  --message "Create a concise summary" \
  --files report.pdf

# Multiple documents
pt task execute \
  --action summarize \
  --message "Summarize all quarterly reports" \
  --files Q1.pdf \
  --files Q2.pdf \
  --files Q3.pdf \
  --files Q4.pdf
```

### Use Case 2: Translation

Translate text or documents:

```bash
# Translate text
pt task execute \
  --action translate \
  --message "Translate this to French: Hello, how are you?"

# Translate document
pt task execute \
  --action translate \
  --message "Translate this document to Spanish" \
  --files document.pdf
```

### Use Case 3: Data Analysis

Analyze data files:

```bash
pt chat send --agent 1 \
  --message "Analyze sales trends and provide insights" \
  --files sales_2024.csv
```

### Use Case 4: Feed a Chat, Then Ask About the Files

Upload working documents to a chat, then ask the assistant about them:

```bash
# Push the whole project folder into the chat
pt chat sync-to 123 ./project-docs --recursive

# Ask about the uploaded material
pt chat send 123 --message "Summarize the key risks across these documents"

# Later, pull down anything the assistant produced
pt chat sync-from 123 ./project-docs-output
```

### Use Case 5: Keep a Collection in Sync with a Local Knowledge Base

```bash
#!/bin/bash
# refresh-kb.sh - push the latest docs to the shared collection

pt collection sync-to 42 ./kb --pattern '*.md' --recursive
```

Run it from cron or CI whenever your docs change.

### Use Case 6: Batch Processing

Process multiple files in a loop:

```bash
#!/bin/bash

for file in documents/*.pdf; do
    echo "Processing: $file"
    pt task execute \
        --action extract_key_points \
        --message "Extract key points from this document" \
        --files "$file"
done
```

### Use Case 7: Scheduled Reporting Task

Create a task that runs on a schedule without any UI clicks:

```bash
pt task create \
  --name "Weekly sales report" \
  --description "Compile and send the weekly sales report" \
  --type private \
  --virtual-assistant-id 7 \
  --schedule-nl "every Friday at 4pm" \
  --schedule-prompt "Compile this week's sales report and summarize the highlights"
```

### Use Case 8: Chat Automation

Automate chat interactions:

```bash
# Send daily standup message
pt chat send @team-standup \
  --message "Daily standup: Completed API integration, working on documentation today"
```

## Tips and Tricks

### 1. Use Shell Aliases

Create shortcuts for frequently used commands:

```bash
# Add to ~/.bashrc or ~/.zshrc
alias pta='pt task execute'
alias ptm='pt chat send'

# Usage
pta --action summarize --message "Summarize this"
ptm 123 --message "Hello"
```

### 2. Save Command Output

Save responses to files:

```bash
pt task actions > actions.json
pt task execute --action analyze --message "Test" > result.json
```

### 3. Parse JSON Output

Use `jq` to parse JSON responses:

```bash
# Extract specific fields
pt task actions | jq '.[0].name'

# List a chat's document IDs and names
pt chat list-files 123 | jq '.documents[] | {id, filename}'

# Search collections by name (read the id from the JSON output)
pt collection list --search contracts
```

### 4. Environment Variables

Use environment variables for common values:

```bash
export CHAT_ID="123"
export AGENT_ID="1"

pt chat send $CHAT_ID --message "Hello"
pt chat send --agent $AGENT_ID --message "Help"
```

### 5. Script Integration

Create reusable scripts:

```bash
#!/bin/bash
# analyze.sh - Analyze documents

if [ $# -eq 0 ]; then
    echo "Usage: ./analyze.sh <file1> [file2] ..."
    exit 1
fi

# Build the --files arguments safely (handles filenames with spaces)
args=()
for f in "$@"; do
    args+=(--files "$f")
done

pt task execute \
    --action analyze_document \
    --message "Analyze these documents" \
    "${args[@]}"
```

Usage:
```bash
chmod +x analyze.sh
./analyze.sh report1.pdf report2.pdf
```

### 6. Quick Profile Switching

Use a function for quick profile switching:

```bash
# Add to ~/.bashrc or ~/.zshrc
switch-pt() {
    pt profile use "$1"
}

# Usage
switch-pt development
switch-pt production
```

### 7. Error Logging

Log errors to a file:

```bash
pt task execute \
    --action process \
    --message "Test" 2>> error.log
```

### 8. Combining with Other Tools

Combine with other command-line tools:

```bash
# Find PDFs and process them
find . -name "*.pdf" -exec pt task execute \
    --action summarize \
    --message "Summarize" \
    --files {} \;

# Process files matching a pattern
ls *.txt | xargs -I {} pt task execute \
    --action analyze \
    --message "Analyze" \
    --files {}
```

## Troubleshooting

### Problem: "No active profile" Error

**Solution**:
```bash
pt profile add --token YOUR_API_KEY
```

### Problem: "Profile not found" Error

**Solution**:
```bash
# List available profiles
pt profile list

# Use an existing profile
pt profile use profile-name
```

### Problem: Authentication Failures

**Solution**:
1. Verify your token is correct
2. Check if the token has expired
3. Regenerate a new token in PrimeThink settings

```bash
pt profile add --token NEW_TOKEN
```

### Problem: File Upload Errors

**Solution**:
1. Check file exists and is readable
2. Verify file path is correct
3. Ensure you have read permissions
4. Check the platform upload limits: max **50MB per file**, **200MB total per request**, **10 files per request**

```bash
ls -la file.pdf
chmod 644 file.pdf
```

### Problem: `-p` Doesn't Select a Profile in `chat`/`collection` Commands

In the `pt chat` and `pt collection` groups there is no `-p` shorthand for `--profile`; on the file commands `-p` is the short flag for `--path`.

**Solution**: use the long form:

```bash
pt chat list-files 123 --profile production
```

### Problem: Network/Connection Errors

**Solution**:
1. Check internet connection
2. Verify API endpoint is accessible
3. Check firewall settings

```bash
# Test API reachability (liveness probe)
curl -sS https://api.primethink.ai/api/v1/health/live
```

### Problem: JSON Parse Errors

**Solution**:
Make sure the output is valid JSON before parsing:

```bash
# Validate JSON
pt task actions | python -m json.tool
```

### Problem: Slow Response Times

**Solution**:
- Large files may take longer to process
- Use async mode for chat messages (`--async`)
- Task creation with `--schedule-nl` and `pt image generate` involve server-side AI work and can take up to two minutes
- Check network speed

### Problem: Sync Reports Failures

`sync-to` and `sync-from` keep going when individual files fail and print a summary like `Sync complete: 14 uploaded, 1 failed`. Scroll up in the output to find the per-file error lines, fix the cause (permissions, network, bad file), and re-run the sync.

The two-way `pt chat sync` treats *listing* failures differently: if the chat's file tree can't be fully listed, it aborts immediately with exit code 1 and transfers nothing, rather than printing a partial summary. Individual file transfer failures are still non-fatal and show up in the final `Sync complete: … failed` line.

## FAQ

### Q: How do I get an API key?

**A**: Log in to PrimeThink, go to Settings → API Keys, and generate a new key.

### Q: Can I use multiple API keys?

**A**: Yes! Use profiles to manage multiple API keys:

```bash
pt profile add --token TOKEN1 --profile account1
pt profile add --token TOKEN2 --profile account2
pt profile use account1
```

### Q: Where is my configuration stored?

**A**: Configuration is stored at `~/.primethink/config.json`

### Q: How do I switch between production and development?

**A**: Configure separate profiles with different API URLs:

```bash
pt profile add --token DEV_TOKEN --profile dev --api-url https://dev-api.example.com
pt profile add --token PROD_TOKEN --profile prod --api-url https://api.primethink.ai

# Switch between profiles
pt profile use dev  # or: pt profile use prod

# Or use a specific profile for one command
pt task actions --profile prod
```

### Q: How do I deploy the same task to another environment?

**A**: Export it, version the file in git, and import it with the target environment's profile:

```bash
pt task export 42 --output tasks/support_bot.json
pt task import tasks/support_bot.json --profile prod
```

`import` creates a new task from the file's portable config (server-assigned fields are stripped on export). Remember to adjust environment-specific IDs like `virtual_assistant_id` in the file if they differ between environments.

### Q: Can I upload multiple files?

**A**: Yes, use multiple `--files` options:

```bash
pt task execute \
    --action process \
    --message "Process these" \
    --files file1.pdf \
    --files file2.pdf \
    --files file3.pdf
```

For whole directories, use `pt chat sync-to` or `pt collection sync-to` instead.

### Q: What file types are supported?

**A**: The CLI supports uploading any file type. Support depends on the PrimeThink platform and the specific task action you're using. Platform limits apply: max 50MB per file, 200MB total per request, and 10 files per request.

### Q: How do I find a document ID to download?

**A**: List the files first — every document in the output includes its `id`:

```bash
pt chat list-files 123
pt collection list-files 42
```

### Q: How do I see the CLI version?

**A**:
```bash
pt version
```

### Q: Can I use the CLI in scripts?

**A**: Absolutely! The CLI is designed for automation and scripting. Commands print JSON to stdout and exit non-zero on failure. See the [CLI Reference](https://github.com/primethink-ai/primethink-cli/blob/main/docs/cli-reference.md) for every command and option.

### Q: Can AI coding agents (Claude Code etc.) use the CLI?

**A**: Yes — the package bundles an agent skill that teaches compatible agents the command map and common workflows. Install it with:

```bash
pt install-skill            # all your projects (~/.claude/skills)
pt install-skill --project  # just the current repo (./.claude/skills)
```

### Q: How do I uninstall the CLI?

**A**:
```bash
pip uninstall primethink-cli
```

### Q: Are my API tokens secure?

**A**: Tokens are stored locally in `~/.primethink/config.json`. Keep this file secure with proper file permissions:

```bash
chmod 600 ~/.primethink/config.json
```

### Q: Can I use this on Windows?

**A**: Yes! The CLI works on Windows, macOS, and Linux. On Windows, use PowerShell or Command Prompt.

### Q: What's the difference between chat and agent messages?

**A**:
- **Chat messages** (`pt chat send CHAT_ID`): Send to existing chats by ID or mention name
- **Agent messages** (`pt chat send --agent AGENT_ID`): Send directly to an agent by ID

### Q: How do I find my chat ID?

**A**: Run `pt chat list` — every chat in the output includes its `id`. You can also find chat IDs in the PrimeThink web interface URL. The CLI additionally supports mention names (e.g., `@assistant-name`).

## Getting Help

### Command Help

Get help for any command:

```bash
# General help
pt --help

# Group help
pt chat --help
pt collection --help
pt task --help

# Command-specific help
pt profile add --help
pt task create --help
pt chat sync-to --help
```

The `--help` flag can appear before, within, or after a recognized command path. These commands show the same help page:

```bash
pt --help chat send
pt chat --help send
pt chat send --help
```

A leading `--help` descends through recognized commands and stops at the first unknown path segment, showing help for the enclosing group. A trailing `--help` retains Click's normal path validation, so an unknown command before the flag still reports a `No such command` error.

### Documentation

- [README](https://github.com/primethink-ai/primethink-cli/blob/main/README.md) - Quick start guide
- [CLI Reference](https://github.com/primethink-ai/primethink-cli/blob/main/docs/cli-reference.md) - Every command and option
- [Developer Guide](https://github.com/primethink-ai/primethink-cli/blob/main/DEVELOPER.md) - Contributing and internals

### Support

- **Email**: [support@primethink.ai](mailto:support@primethink.ai)
- **GitHub Issues**: [Report a bug](https://github.com/primethink-ai/primethink-cli/issues)
- **Documentation**: [https://docs.primethink.ai](https://docs.primethink.ai)
- **Community**: [https://community.primethink.ai](https://community.primethink.ai)

## Next Steps

Now that you're familiar with the basics:

1. **Explore available actions** - Run `pt task actions` to see what's possible
2. **Try different use cases** - Experiment with document analysis, translation, etc.
3. **Automate workflows** - Integrate the CLI into your scripts and processes
4. **Read the integration guide** - Learn advanced integration patterns
5. **Share feedback** - Help us improve by sharing your experience

Happy automating with PrimeThink CLI! 🚀

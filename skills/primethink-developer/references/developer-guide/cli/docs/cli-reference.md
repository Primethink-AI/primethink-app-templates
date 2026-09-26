# PrimeThink CLI — Command Reference

Complete reference for every command in the PrimeThink CLI (`pt`), version 1.5.0.

Commands are organized into noun groups: `profile`, `live-app`, `chat`, `collection`, `agent`, `task`, `search`, and `image`.

## Table of Contents

- [Global Conventions](#global-conventions)
- [General Commands](#general-commands)
  - [`pt version`](#pt-version)
  - [`pt whoami`](#pt-whoami)
  - [`pt mcp`](#pt-mcp)
  - [`pt install-skill`](#pt-install-skill)
  - [`pt install-developer-skill`](#pt-install-developer-skill)
- [Live Apps: `pt live-app`](#live-apps-pt-live-app)
  - [`pt live-app new`](#pt-live-app-new)
  - [`pt live-app publish`](#pt-live-app-publish)
  - [`pt live-app test`](#pt-live-app-test)
- [Profiles: `pt profile`](#profiles-pt-profile)
  - [`pt profile add`](#pt-profile-add)
  - [`pt profile use`](#pt-profile-use)
  - [`pt profile list`](#pt-profile-list)
  - [`pt profile remove`](#pt-profile-remove)
- [Chats: `pt chat`](#chats-pt-chat)
  - [`pt chat send`](#pt-chat-send)
  - [`pt chat list`](#pt-chat-list)
  - [`pt chat create`](#pt-chat-create)
  - [`pt chat rename`](#pt-chat-rename)
  - [`pt chat goal`](#pt-chat-goal)
  - [`pt chat type`](#pt-chat-type)
  - [`pt chat messages`](#pt-chat-messages)
  - [`pt chat archive`](#pt-chat-archive)
  - [`pt chat unarchive`](#pt-chat-unarchive)
  - [`pt chat delete`](#pt-chat-delete)
  - [`pt chat list-files`](#pt-chat-list-files)
  - [`pt chat upload-files`](#pt-chat-upload-files)
  - [`pt chat download-file`](#pt-chat-download-file)
  - [`pt chat delete-file`](#pt-chat-delete-file)
  - [`pt chat upload-text`](#pt-chat-upload-text)
  - [`pt chat list-users`](#pt-chat-list-users)
  - [`pt chat invite-members`](#pt-chat-invite-members)
  - [`pt chat remove-members`](#pt-chat-remove-members)
  - [`pt chat edit-message`](#pt-chat-edit-message)
  - [`pt chat delete-message`](#pt-chat-delete-message)
  - [`pt chat clear-messages`](#pt-chat-clear-messages)
  - [`pt chat retry-message`](#pt-chat-retry-message)
  - [`pt chat export-message`](#pt-chat-export-message)
  - [`pt chat save-as-task`](#pt-chat-save-as-task)
  - [`pt chat sync-to`](#pt-chat-sync-to)
  - [`pt chat sync-from`](#pt-chat-sync-from)
  - [`pt chat sync`](#pt-chat-sync)
- [ChatDB: `pt chatdb`](#chatdb-pt-chatdb)
  - [`pt chatdb init`](#pt-chatdb-init)
  - [`pt chatdb list`](#pt-chatdb-list)
  - [`pt chatdb get`](#pt-chatdb-get)
  - [`pt chatdb add`](#pt-chatdb-add)
  - [`pt chatdb update`](#pt-chatdb-update)
  - [`pt chatdb delete`](#pt-chatdb-delete)
- [Collections: `pt collection`](#collections-pt-collection)
  - [`pt collection list`](#pt-collection-list)
  - [`pt collection create`](#pt-collection-create)
  - [`pt collection get`](#pt-collection-get)
  - [`pt collection update`](#pt-collection-update)
  - [`pt collection reindex`](#pt-collection-reindex)
  - [`pt collection copy`](#pt-collection-copy)
  - [`pt collection delete`](#pt-collection-delete)
  - [`pt collection delete-file`](#pt-collection-delete-file)
  - [`pt collection list-files`](#pt-collection-list-files)
  - [`pt collection upload-files`](#pt-collection-upload-files)
  - [`pt collection upload-text`](#pt-collection-upload-text)
  - [`pt collection download-file`](#pt-collection-download-file)
  - [`pt collection sync-to`](#pt-collection-sync-to)
  - [`pt collection sync-from`](#pt-collection-sync-from)
- [Agents: `pt agent`](#agents-pt-agent)
  - [`pt agent list`](#pt-agent-list)
  - [`pt agent get`](#pt-agent-get)
  - [`pt agent create`](#pt-agent-create)
  - [`pt agent update`](#pt-agent-update)
  - [`pt agent delete`](#pt-agent-delete)
  - [`pt agent types`](#pt-agent-types)
  - [`pt agent list-docs`](#pt-agent-list-docs)
  - [`pt agent upload-docs`](#pt-agent-upload-docs)
  - [`pt agent attach-collections`](#pt-agent-attach-collections)
  - [`pt agent detach-collection`](#pt-agent-detach-collection)
  - [`pt agent upload-image`](#pt-agent-upload-image)
  - [`pt agent delete-image`](#pt-agent-delete-image)
- [Capabilities: `pt capability`](#capabilities-pt-capability)
  - [`pt capability list`](#pt-capability-list)
  - [`pt capability create`](#pt-capability-create)
  - [`pt capability update`](#pt-capability-update)
  - [`pt capability delete`](#pt-capability-delete)
  - [`pt capability archive`](#pt-capability-archive)
  - [`pt capability unarchive`](#pt-capability-unarchive)
  - [`pt capability duplicate`](#pt-capability-duplicate)
  - [`pt capability resolve`](#pt-capability-resolve)
- [Model catalog: `pt models`](#model-catalog-pt-models)
  - [`pt models list`](#pt-models-list)
  - [`pt models embeddings`](#pt-models-embeddings)
- [Scheduled jobs: `pt scheduled-job`](#scheduled-jobs-pt-scheduled-job)
  - [`pt scheduled-job list`](#pt-scheduled-job-list)
  - [`pt scheduled-job create`](#pt-scheduled-job-create)
  - [`pt scheduled-job update`](#pt-scheduled-job-update)
  - [`pt scheduled-job set-status`](#pt-scheduled-job-set-status)
  - [`pt scheduled-job delete`](#pt-scheduled-job-delete)
- [Chat workspaces: `pt workspace`](#chat-workspaces-pt-workspace)
- [Tags: `pt tag`](#tags-pt-tag)
- [Groups: `pt group`](#groups-pt-group)
- [Settings: `pt settings`](#settings-pt-settings)
- [Users: `pt user`](#users-pt-user)
- [Notifications: `pt notification`](#notifications-pt-notification)
- [Directories (folders)](#directories-folders)
- [Document versions](#document-versions)
- [Tasks: `pt task`](#tasks-pt-task)
  - [`pt task list`](#pt-task-list)
  - [`pt task actions`](#pt-task-actions)
  - [`pt task execute`](#pt-task-execute)
  - [`pt task create`](#pt-task-create)
  - [`pt task update`](#pt-task-update)
  - [`pt task get`](#pt-task-get)
  - [`pt task upload-text`](#pt-task-upload-text)
  - [`pt task add-docs`](#pt-task-add-docs)
  - [`pt task delete-docs`](#pt-task-delete-docs)
  - [`pt task delete`](#pt-task-delete)
  - [`pt task duplicate`](#pt-task-duplicate)
  - [`pt task set-public`](#pt-task-set-public)
  - [`pt task set-private`](#pt-task-set-private)
  - [`pt task publish`](#pt-task-publish)
  - [`pt task launch`](#pt-task-launch)
  - [`pt task test`](#pt-task-test)
  - [`pt task export`](#pt-task-export)
  - [`pt task import`](#pt-task-import)
  - [`pt task create-version`](#pt-task-create-version)
  - [`pt task upload-image`](#pt-task-upload-image)
- [Task evaluation: `pt eval`](#task-evaluation-pt-eval)
- [Search: `pt search`](#search-pt-search)
  - [`pt search documents`](#pt-search-documents)
  - [`pt search chat`](#pt-search-chat)
  - [`pt search collection`](#pt-search-collection)
  - [`pt search messages`](#pt-search-messages)
  - [`pt search images`](#pt-search-images)
- [Images: `pt image`](#images-pt-image)
  - [`pt image generate`](#pt-image-generate)
- [Voice: `pt voice`](#voice-pt-voice)
- [Video: `pt video`](#video-pt-video)
- [MCP Server (`pt mcp`)](#mcp-server-pt-mcp)
- [Exit Codes and Errors](#exit-codes-and-errors)
- [Timeouts](#timeouts)

---

## Global Conventions

### Connection options

Every command that calls the API accepts these two options:

| Option | Description |
|---|---|
| `--profile` | Use a specific configured profile for this one request, without changing the active profile |
| `--api-url`, `-u` | Override the API URL for this one request |

> **Note on `-p`:** in most groups (e.g. `pt task`, `pt agent`, `pt search`, `pt settings`,
> `pt user`, `pt eval`), `pt image generate`, and `pt whoami`, `-p` is a short alias for
> `--profile`. In the `pt chat` and `pt collection` groups there is **no** `-p` alias for
> `--profile` — there `-p` is the short alias for `--path` (a directory inside the
> chat/collection) on the file commands. When in doubt, use the long forms.

### Getting help

`--help` can be written before or after the command it describes — the CLI resolves
the whole command path that follows the flag, so these three are equivalent:

```bash
pt chat send --help
pt chat --help send
pt --help chat send
```

A leading `--help` never errors: it descends as far as the path is recognized, so
`pt --help chat nope` describes `pt chat`, and `pt --help nope` describes `pt`. A
*trailing* `--help` keeps Click's own behavior, where the command path has to
resolve before the flag is reached — `pt chat nope --help` is still a
`No such command 'nope'` error.

### Output

- Commands that call the API print the JSON response, pretty-printed with 2-space indentation, to stdout. This makes output easy to pipe into `jq` or redirect to a file.
- Download and sync commands print human-readable progress lines instead.

### Authentication

All API commands authenticate with the token from the selected profile, sent as an
`Authorization: Token <token>` header. Configure a token first with
[`pt profile add`](#pt-profile-add). Configuration is stored in `~/.primethink/config.json`.

### Environment variables

Every environment variable is an optional override — when unset, the CLI uses the
config file and its built-in defaults:

| Variable | Description | Default when unset |
|---|---|---|
| `PRIMETHINK_TOKEN` | API token, bypassing the config file (useful for CI/CD and containers) | Token from the active profile |
| `PRIMETHINK_API_URL` | API base URL override | Profile's `api_url`, otherwise `https://api.primethink.ai` |
| `PRIMETHINK_PROFILE` | Profile to use when `--profile` is not passed | The active profile |
| `PRIMETHINK_CONFIG_PATH` | Custom config file path | `~/.primethink/config.json` |
| `PRIMETHINK_DEBUG` | Set to `1` (or `true`/`yes`/`on`) to print request/response debug lines to stderr | Disabled |

Precedence, highest first: command-line flag (`--profile`, `--api-url`) → environment
variable → config file → built-in default. If both `PRIMETHINK_TOKEN` and
`PRIMETHINK_PROFILE` are set, the token wins and the config file is not consulted.

---

## General Commands

### `pt version`

Display the CLI version.

```bash
pt version
# PrimeThink CLI v1.5.0
```

### `pt whoami`

Show the authenticated user and the groups they belong to, as one JSON object with `user`, `groups`, `active_group` (`{id, name}` of the currently active group), and `configured_providers` (the LLM provider slugs that have an API key set) keys. Handy for checking which account, group, and provider keys a profile points at before running anything else.

```bash
pt whoami [--profile NAME] [--api-url URL]
```

```bash
pt whoami | jq '.user.email'
pt whoami --profile production
```

### `pt mcp`

Run PrimeThink as an [MCP](https://modelcontextprotocol.io) server over stdio, exposing core API management operations as tools that MCP clients can call. See [MCP Server (`pt mcp`)](#mcp-server-pt-mcp) for the full tool list and client configuration.

```bash
pt mcp
```

Requires the optional `mcp` dependency (`pip install 'primethink-cli[mcp]'`, Python 3.10+); if it isn't installed, `pt mcp` prints an install hint and exits 1.

### `pt install-skill`

Install the bundled [agent skill](../skills/primethink-cli/SKILL.md) — a `SKILL.md` that teaches AI coding agents (Claude Code and other Agent-Skills-compatible tools) how to use `pt` — into a skills directory. This command works offline; the skill ships inside the package.

```bash
pt install-skill [--user | --project | --dir PATH] [--force]
```

| Option | Description |
|---|---|
| `--user` | Install to `~/.claude/skills` (default) |
| `--project` | Install to `./.claude/skills` in the current directory |
| `--dir PATH` | Install to a custom skills directory (overrides `--user`/`--project`) |
| `--force` | Replace an existing installation |

The skill is installed as a `primethink-cli/` folder inside the chosen directory. Without `--force`, an existing installation is left untouched and the command exits with an error.

```bash
# Available in all your projects
pt install-skill

# Just for the current repo (commit .claude/skills to share it with your team)
pt install-skill --project

# For an agent that reads skills from a custom location
pt install-skill --dir ~/.config/my-agent/skills

# Upgrade after updating primethink-cli
pt install-skill --force
```

### `pt install-developer-skill`

Download and install the complete public [`primethink-developer`](https://github.com/primethink-ai/primethink-app-templates/tree/main/skills/primethink-developer) skill. Unlike `pt install-skill`, this skill is not bundled in the wheel: it is fetched free from public GitHub and includes the entire directory tree (`SKILL.md`, `libraries/`, `references/`, scripts, hidden metadata, and all descendants). It requires internet access, but no PrimeThink API token, GitHub credentials, or paid service.

```bash
pt install-developer-skill [--user | --project | --dir PATH] [--force] \
  [--repo-url URL] [--ref REF]
```

| Option | Default | Description |
|---|---|---|
| `--user` | selected | Install to `~/.claude/skills` |
| `--project` | — | Install to `./.claude/skills` in the current directory |
| `--dir PATH` | — | Install to a custom skills directory (overrides `--user`/`--project`) |
| `--force` | off | Replace an existing `primethink-developer/` installation |
| `--repo-url URL` | `https://github.com/primethink-ai/primethink-app-templates` | Public HTTPS GitHub source repository |
| `--ref REF` | `main` | Git branch, tag, or commit to download |

The installer downloads a bounded repository archive and recursively stages `skills/primethink-developer/`. It rejects path traversal, duplicate paths, symbolic links, oversized archives, and missing `SKILL.md`. Without `--force`, an existing installation is left untouched and no download occurs. With `--force`, the old directory is moved aside only after the complete replacement has been safely extracted; executable bits on bundled scripts are preserved.

```bash
# Available to compatible agents in all projects
pt install-developer-skill

# Commit the complete skill with one project
pt install-developer-skill --project

# Install for another Agent-Skills-compatible tool
pt install-developer-skill --dir ~/.config/my-agent/skills

# Refresh from a pinned release or commit
pt install-developer-skill --force --ref <TAG_OR_COMMIT>
```

---

## Live Apps: `pt live-app`

Create, publish, synchronize, and test PrimeThink Live Apps. `pt live-app new` is local-only and does not require an API token; the publishing and chat-test commands use the normal profile connection options.

### `pt live-app new`

```bash
pt live-app new DIRECTORY [OPTIONS]
```

| Option | Default | Description |
|---|---|---|
| `--framework react\|html` | `react` | Select the application framework |
| `--tailwind` / `--no-tailwind` | `--tailwind` | Include or exclude Tailwind CSS |
| `--flowbite` / `--no-flowbite` | `--flowbite` | Include or exclude Flowbite; Flowbite requires Tailwind |
| `--repo-url URL`, `--repo URL` | `https://github.com/primethink-ai/primethink-app-templates` | Public HTTPS GitHub repository containing the template catalog |
| `--ref REF` | `main` | Git branch, tag, or commit to download |

The destination must not exist, including an existing empty directory. This prevents an LLM or script from overwriting work accidentally. Generation is atomic: a download, catalog, or filesystem failure leaves no partial destination. The archive is size-limited; unsafe catalog paths, path traversal, duplicate files, and symbolic links are rejected.

Valid feature combinations:

| Framework | Tailwind | Flowbite | Default catalog template |
|---|---:|---:|---|
| React | yes | yes | `react-vite-tailwind-flowbite` |
| React | yes | no | `react-tailwind-dynamic` |
| React | no | no | `react-dynamic` |
| HTML | yes | yes | `html-tailwind-flowbite-dynamic` |
| HTML | yes | no | `html-tailwind-dynamic` |
| HTML | no | no | `html-dynamic` |

Flowbite without Tailwind is invalid and exits with a usage error before downloading anything.

```bash
# Default React project with Tailwind and Flowbite
pt live-app new ./decision-board

# One-file HTML with Tailwind but no Flowbite
pt live-app new ./queue --framework html --no-flowbite

# React with hand-written CSS and no styling libraries
pt live-app new ./focused-app --no-tailwind --no-flowbite

# Reproducible generation from another public catalog
pt live-app new ./custom \
  --repo https://github.com/acme/live-app-templates \
  --ref 4c72d51
```

After generation, read the project's `README.md`. Template build and deployment models differ: the default full React template uses Vite, while the other default templates are no-build `index.html` apps. The command deliberately does not run `npm install`, a build, or any generated scripts.

#### Custom catalog contract

A custom repository provides `live-app-templates/manifest.json` at its root. Each entry maps one feature combination to a repository-relative directory:

```json
{
  "version": 1,
  "templates": [
    {
      "id": "react-company-starter",
      "framework": "react",
      "tailwind": true,
      "flowbite": true,
      "path": "live-app-templates/react-company-starter"
    }
  ]
}
```

Each requested combination must match exactly one entry. For compatibility, repositories without a manifest can use the default catalog's conventional directory names, but new catalogs should always include the manifest.

### `pt live-app publish`

Create a new private Live App task from a project directory, or update one when `--task-id` is supplied. The command reads project metadata, creates a `Production` task version, and synchronizes the flat app artifact into the task's `@app` folder.

```bash
pt live-app publish DIRECTORY --virtual-assistant-id ID [OPTIONS]
```

| Option | Default | Description |
|---|---|---|
| `--task-id ID` | create | Update this task instead of creating one |
| `--virtual-assistant-id ID` | required | Agent assigned to the task |
| `--app-dir DIRECTORY` | auto | Flat artifact directory; otherwise checks `dist/`, `app/`, then project root |
| `--version-name NAME` | `Production` | Name used for the task version and document versions |
| `--profile`, `--api-url` | active profile | Connection selection |

The artifact requires `index.html`, or `canvas.html` (uploaded as `index.html`). Files are uploaded at the top level. A same-named remote document receives a new version, preserving its ID and relative references; an identical version is reported as unchanged. If `DIRECTORY/.image.png` exists, it is uploaded as the task image.

```bash
pt live-app publish ./decision-board --virtual-assistant-id 7
pt live-app publish ./decision-board --task-id 42 --virtual-assistant-id 7
```

The command has no task-field options: a created task uses the same conservative defaults listed under [`pt task publish`](#pt-task-publish), except that `page_type` is set to `html`. Adjust it afterwards with `pt task update`.

Output is progress lines, not JSON; the task ID is on the last line.

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

Capture the ID without letting a failure slip through the parser:

```bash
out=$(pt live-app publish ./decision-board --virtual-assistant-id 7) || { echo "publish failed"; exit 1; }
printf '%s\n' "$out"
APP_TASK_ID=$(printf '%s\n' "$out" | awk -F': ' '/^Live App task ID: /{print $2}')
[ -n "$APP_TASK_ID" ] || { echo "no Live App task ID in output"; exit 1; }
```

**Check the status *and* the value — neither alone is enough.** Capture `pt`'s output
instead of piping it into `awk`: a pipeline would report `awk`'s `0` rather than `pt`'s
status, so a failed publish would yield an empty `APP_TASK_ID` and the follow-up run would
create a duplicate task instead of updating one. The status alone is not enough either — the
publish command can print its ID line and still exit non-zero, because a fatal file-upload
failure is reported after the sync summary, so a non-empty ID may still come from a run that
did not fully succeed.

A failed task-version creation is reported as a `Warning:` and does not fail the command; failed file uploads do, and are listed after the summary line.

### `pt live-app test`

Synchronize a Live App into a newly created temporary chat, or update an explicit existing chat in place. The command sets the chat page type to HTML, applies `GOAL.md` when present, and versions/uploads the app files under `@app`.

```bash
pt live-app test DIRECTORY [OPTIONS]
```

| Option | Default | Description |
|---|---|---|
| `--chat-id CHAT_ID` | create | Reuse this existing chat |
| `--workspace-id ID` | unset | Workspace for a newly created chat |
| `--temporary` / `--permanent` | temporary | Lifetime of a newly created chat |
| `--app-dir DIRECTORY` | auto | Override flat artifact discovery |
| `--version-name NAME` | `Production` | Document version name |
| `--open` | off | Open the resulting chat in a browser |
| `--web-url URL` | derived from API URL | Web URL used for output/opening (defaults to the active profile's API host, mapping `api.` → `app.`) |

```bash
pt live-app test ./decision-board
pt live-app test ./decision-board --chat-id CHAT_UUID --open
```

Omitting `--chat-id` creates a new chat on every run. `--temporary`/`--permanent` and `--workspace-id` apply only to a newly created chat and are ignored when `--chat-id` is passed. `GOAL.md` is optional here — the `Updated goal for chat …` line appears only when the file exists. Unlike `pt live-app publish`, this command uploads no `.image.png` and creates no task.

```text
Created temporary chat 9c11-de…
Updated goal for chat 9c11-de…
Synchronizing 3 file(s) from decision-board/dist
  Uploaded index.html
  Uploaded app.css
  Uploaded logo.svg
App sync complete: 3 uploaded, 0 updated, 0 unchanged, 0 failed
Chat URL: https://app.primethink.ai/chats/9c11-de…
```

To iterate against one chat, store its ID on the first run and pass it back afterwards (use `--permanent` for a chat you intend to keep):

```bash
# first run — create and record
out=$(pt live-app test ./decision-board --permanent) || { echo "test deploy failed"; exit 1; }
printf '%s\n' "$out"
CHAT_ID=$(printf '%s\n' "$out" | sed -n 's#^Chat URL: .*/chats/##p')
[ -n "$CHAT_ID" ] || { echo "no Chat URL in output"; exit 1; }
printf '%s\n' "$CHAT_ID" > ./decision-board/.chat-id

pt live-app test ./decision-board --chat-id "$(cat ./decision-board/.chat-id)"
```

Write the file only after checking both the status and the ID — redirecting the command
straight into `.chat-id` truncates it the moment a run fails, losing the chat you were
iterating on. The status check alone would miss a run that exits `0` without printing a
`Chat URL:` line; the ID check alone would miss a run that printed the URL and then failed.

> **UI testing moved out of the CLI.** Automated Live App UI testing is now a
> deterministic, plan-driven workflow owned by the `primethink-developer` skill
> rather than a `pt` subcommand — the skill authors a reviewable
> `tests/test_plan.yaml`, runs it with a bundled Playwright runner (no LLM in the
> execution loop), and heals failing selectors. See the skill's UI-testing guide.
> This removes the CLI's `kiro-cli` dependency.

---

## Profiles: `pt profile`

Profiles let you store multiple API tokens (e.g. for different accounts or environments) and switch between them.

### `pt profile add`

Configure an API token for a profile. Creates the profile if it doesn't exist, overwrites it if it does.

```bash
pt profile add --token YOUR_API_TOKEN [--profile NAME] [--api-url URL]
```

| Option | Required | Default | Description |
|---|---|---|---|
| `--token`, `-t` | yes | — | Your API token |
| `--profile`, `-p` | no | `default` | Profile name |
| `--api-url`, `-u` | no | `https://api.primethink.ai` | Custom API URL stored with the profile |

The profile becomes the active profile if it is the first one configured, or if it is named `default`; otherwise the command reports which profile remains active.

```bash
# Simplest setup
pt profile add --token YOUR_API_TOKEN

# A named profile pointing at a staging server
pt profile add --token STAGING_TOKEN --profile staging --api-url https://staging-api.example.com
```

### `pt profile use`

Switch the active profile.

```bash
pt profile use PROFILE
```

```bash
pt profile use staging
# ✓ Switched to profile 'staging' (API: https://staging-api.example.com)
```

### `pt profile list`

List all configured profiles. The active profile is marked with `*`.

```bash
pt profile list
# Configured profiles:
# * default (https://api.primethink.ai)
#   staging (https://staging-api.example.com)
```

### `pt profile remove`

Remove a profile. If the removed profile was active, another profile becomes active automatically (if any remain).

```bash
pt profile remove PROFILE
```

---

## Chats: `pt chat`

Create and manage chats, send messages, and work with the files stored in a chat's workspace.

> In this group there is no `-p` shorthand for `--profile`; on the file commands `-p` means `--path`.

### `pt chat send`

Send a message to a chat (by ID or mention name) **or** to an agent (by ID). Exactly one target must be given: the positional `CHAT_ID_OR_MENTION` argument or the `--agent` option — not both.

```bash
pt chat send [CHAT_ID_OR_MENTION] --message "MESSAGE" [OPTIONS]
pt chat send --agent AGENT_ID --message "MESSAGE" [OPTIONS]
```

| Option | Required | Description |
|---|---|---|
| `CHAT_ID_OR_MENTION` | one of these two | Chat ID (e.g. `123`) or mention name (e.g. `@my-assistant`) |
| `--agent`, `-a` | one of these two | Agent (virtual assistant) ID to message instead of a chat |
| `--message`, `-m` | yes | Message text |
| `--files`, `-f` | no | File to attach; repeatable |
| `--async` | no | Don't wait for the response (chat messages only) |
| `--profile` | no | Profile for this request |
| `--api-url`, `-u` | no | API URL override |

```bash
# To a chat by ID
pt chat send 123 --message "Hello from the CLI"

# To a chat by mention name, with files
pt chat send @my-assistant -m "Review these" -f doc1.pdf -f doc2.pdf

# Fire-and-forget
pt chat send 123 -m "Long-running job" --async

# Directly to an agent
pt chat send --agent 1 -m "Analyze this data" -f sales.csv
```

### `pt chat list`

List chats, paginated, with optional filters.

```bash
pt chat list [OPTIONS]
```

| Option | Default | Description |
|---|---|---|
| `--page` | 1 | Page number |
| `--page-size` | 25 | Results per page |
| `--search`, `-s` | — | Search chats by name |
| `--starred/--no-starred` | — | Filter by starred status |
| `--archived/--no-archived` | — | Filter by archived status |
| `--workspace-id` | — | Filter by chat workspace ID |
| `--sort` | server default: `automatically` | Sorting strategy: `automatically` or `manually` |

```bash
pt chat list
pt chat list --search onboarding --starred
pt chat list --workspace-id 7 --sort manually --page-size 50
```

### `pt chat create`

Create a new chat. All options are optional; unset fields are left to server defaults.

```bash
pt chat create [OPTIONS]
```

| Option | Description |
|---|---|
| `--name` | Chat name |
| `--goal` | Chat goal text |
| `--goal-file` | Read the goal from a file (mutually exclusive with `--goal`) |
| `--virtual-assistant-id` | Virtual assistant (agent) ID for the chat |
| `--workspace-id` | Chat workspace ID |
| `--parent-chat-id` | Parent chat ID |
| `--type` | Chat type: `standard` or `direct_users` (server default: `standard`) |
| `--public/--no-public` | Make the chat public |
| `--member` | User ID to add as a member; repeat the flag for multiple members |
| `--from-task-id` | Launch this task into the new chat: copies its goal, default agent, settings, documents, collections and scheduled job and posts its initial prompt (sent as the `copy_from_task_id` query parameter; see [`pt task launch`](#pt-task-launch)) |

```bash
pt chat create --name "Q3 planning"
pt chat create --name "Research" --goal-file ./research-goal.md --virtual-assistant-id 7
pt chat create --name "Team room" --member 12 --member 15 --public
pt chat create --workspace-id 738 --from-task-id 280
```

### `pt chat rename`

Rename a chat.

```bash
pt chat rename CHAT_ID NAME
```

```bash
pt chat rename 123 "Q3 planning (archived)"
```

### `pt chat goal`

Update a chat's goal. Provide the goal inline or from a file (one of the two is required).

```bash
pt chat goal CHAT_ID (--goal TEXT | --goal-file PATH)
```

```bash
pt chat goal 123 --goal "Track the Q3 launch checklist"
pt chat goal 123 --goal-file ./goal.md
```

### `pt chat type`

Switch a chat between the Live App renderer and the normal chat view. `live-app` maps to API page type `html`; `chat` maps to API page type `chat`.

```bash
pt chat type CHAT_ID (live-app|chat) [--profile NAME] [--api-url URL]

pt chat type 123 live-app
pt chat type 123 chat
```

### `pt chat messages`

List messages in a chat. With no options, the server returns the latest page (25 messages). Pagination is cursor-based on message IDs, not page numbers.

```bash
pt chat messages CHAT_ID [OPTIONS]
```

| Option | Description |
|---|---|
| `--size` | Number of messages to return (server default: 25) |
| `--before-message-id` | Only messages older than this message ID (for paging back through history) |
| `--after-message-id` | Only messages newer than this message ID (mutually exclusive with `--before-message-id`) |
| `--anchor-message-id` | A window of roughly 25 newer + 25 older messages around this message ID (overrides the other pagination options) |

```bash
# Latest messages
pt chat messages 123

# Page back: take the oldest ID from the previous page and repeat
pt chat messages 123 --size 50 --before-message-id 900

# Jump to the context around a specific message
pt chat messages 123 --anchor-message-id 456
```

### `pt chat archive`

Archive a chat.

```bash
pt chat archive CHAT_ID [--profile NAME] [--api-url URL]
```

### `pt chat unarchive`

Unarchive a chat.

```bash
pt chat unarchive CHAT_ID [--profile NAME] [--api-url URL]
```

### `pt chat delete`

Delete a chat. Prompts for confirmation; pass `--yes` to skip the prompt. If you just want a chat out of the way, prefer [`pt chat archive`](#pt-chat-archive) — it's reversible.

```bash
pt chat delete CHAT_ID [--yes] [--profile NAME] [--api-url URL]
```

### `pt chat list-files`

List files and directories in a chat's workspace. The `--path` option addresses a directory inside the chat (e.g. `/reports/2026`).

```bash
pt chat list-files CHAT_ID [--path /subfolder] [--profile NAME] [--api-url URL]
```

Prints a JSON object with `documents` (files, including their `id`s) and `dirs` (subdirectories).

```bash
pt chat list-files 123
pt chat list-files 123 --path /reports
```

### `pt chat upload-files`

Upload one or more local files to a chat.

```bash
pt chat upload-files CHAT_ID FILE [FILE ...] [--path /subfolder] [--profile NAME] [--api-url URL]
```

```bash
pt chat upload-files 123 report.pdf data.csv
pt chat upload-files 123 notes.md --path /meeting-notes
```

### `pt chat download-file`

Download a single file from a chat. The document ID comes from `pt chat list-files`.

```bash
pt chat download-file CHAT_ID DOCUMENT_ID [--output PATH] [--profile NAME] [--api-url URL]
```

| Option | Description |
|---|---|
| `--output`, `-o` | Local output path. Defaults to the file's original name in the current directory |

```bash
pt chat download-file 123 456
pt chat download-file 123 456 --output ./downloads/report.pdf
```

### `pt chat delete-file`

Delete a single file from a chat by document ID. **Destructive and irreversible** — prompts for confirmation unless `--yes` is passed.

```bash
pt chat delete-file CHAT_ID DOCUMENT_ID [--yes] [--profile NAME] [--api-url URL]
```

Calls `DELETE /api/v1/chats/{chat_id}/document/{document_id}`. Find document IDs with [`pt chat list-files`](#pt-chat-list-files).

```bash
pt chat delete-file 123 456
pt chat delete-file 123 456 --yes
```

### `pt chat upload-text`

Create a document in a chat from raw text — no local file needed. Provide the body inline with `--text` or from a file with `--text-file` (exactly one).

```bash
pt chat upload-text CHAT_ID (--text TEXT | --text-file PATH) [--name NAME] [--metadata M] [--path DIR]
```

| Option | Description |
|---|---|
| `--text`, `-t` | Document text (inline) |
| `--text-file` | Read the document text from a file (mutually exclusive with `--text`) |
| `--name` | Document name |
| `--metadata` | Metadata string to attach |
| `--path` | Directory path within the chat to create the document in |

Calls `POST /api/v1/chats/{chat_id}/texts`.

```bash
pt chat upload-text 123 --text "Key decisions: ..." --name decisions.md
pt chat upload-text 123 --text-file ./notes.md --path /notes
```

### `pt chat list-users`

List the users (members) of a chat.

```bash
pt chat list-users CHAT_ID [--profile NAME] [--api-url URL]
```

Calls `GET /api/v1/chats/{chat_id}/users`.

### `pt chat invite-members`

Invite users and/or agents to a chat. At least one `--user-id`, `--agent-id`, or `--email` is required.

```bash
pt chat invite-members CHAT_ID [--user-id N ...] [--agent-id N ...] [--email EMAIL ...]
```

| Option | Description |
|---|---|
| `--user-id` | User ID to invite; repeat for multiple |
| `--agent-id` | Agent (virtual assistant) ID to invite; repeat for multiple |
| `--email` | Email address of a user to invite; resolved to a user ID via visible-users; repeat for multiple |

Calls `POST /api/v1/chats/{chat_id}/members`.

```bash
pt chat invite-members 123 --user-id 10 --user-id 11 --agent-id 7
pt chat invite-members 123 --email teammate@acme.co
```

### `pt chat remove-members`

Remove users and/or agents from a chat by ID. Same options as `invite-members`.

```bash
pt chat remove-members CHAT_ID [--user-id N ...] [--agent-id N ...]
```

Calls `DELETE /api/v1/chats/{chat_id}/members`.

### `pt chat edit-message`

Edit a message's text.

```bash
pt chat edit-message MESSAGE_ID "NEW TEXT"
```

Calls `PUT /api/v1/chats/update_message_text/{message_id}`.

### `pt chat delete-message`

Delete a message from a chat. **Destructive** — prompts unless `--yes`.

```bash
pt chat delete-message CHAT_ID MESSAGE_ID [--yes]
```

Calls `DELETE /api/v1/chats/{chat_id}/messages/{message_id}`.

### `pt chat clear-messages`

Clear **all** messages in a chat. **Destructive** — prompts unless `--yes`.

```bash
pt chat clear-messages CHAT_ID [--yes]
```

Calls `POST /api/v1/chats/{chat_id}/messages/clear`.

### `pt chat retry-message`

Re-run a message.

```bash
pt chat retry-message MESSAGE_ID
```

Calls `POST /api/v1/chats/messages/{message_id}/retry`.

### `pt chat export-message`

Export a message as a Markdown, DOCX, or PDF file.

```bash
pt chat export-message CHAT_ID MESSAGE_ID [--format md|docx|pdf] [--output PATH]
```

| Option | Description |
|---|---|
| `--format` | `md` (default), `docx`, or `pdf` |
| `--output`, `-o` | Output path (default: `message_<id>.<fmt>`) |

Calls `GET /api/v1/chats/{chat_id}/save-as-{format}-file/{message_id}` and streams the file to disk.

### `pt chat save-as-task`

Create a task from a chat.

```bash
pt chat save-as-task CHAT_ID [--name NAME] [--description D] [--goal G] [--initial-prompt P] [--status S] [--type TYPE]
```

`--type` is one of `private`/`public`/`group`/`system`/`catalog`. Calls `POST /api/v1/chats/{chat_id}/save-as-task`.

### `pt chat sync-to`

Upload the contents of a local directory to a chat, preserving the directory structure.

```bash
pt chat sync-to CHAT_ID LOCAL_DIR [OPTIONS]
```

| Option | Default | Description |
|---|---|---|
| `--path`, `-p` | chat root | Target directory inside the chat |
| `--pattern` | `*` | Glob pattern to select files (e.g. `*.pdf`) |
| `--recursive`, `-r` | off | Include files in subdirectories |
| `--profile` | active profile | Profile for this request |
| `--api-url`, `-u` | profile URL | API URL override |

Per-file upload failures are reported and counted but don't abort the sync; a summary line (`Sync complete: N uploaded, M failed`) is printed at the end.

```bash
# Upload every file in ./reports (top level only)
pt chat sync-to 123 ./reports

# Recursively upload only PDFs into the chat's /archive directory
pt chat sync-to 123 ./reports --pattern '*.pdf' --recursive --path /archive
```

### `pt chat sync-from`

Download all files from a chat (recursing through its subdirectories) into a local directory, recreating the directory structure.

```bash
pt chat sync-from CHAT_ID LOCAL_DIR [--path /subfolder] [--profile NAME] [--api-url URL]
```

```bash
# Mirror the whole chat workspace locally
pt chat sync-from 123 ./chat-backup

# Only the /reports subtree
pt chat sync-from 123 ./reports --path /reports
```

### `pt chat sync`

Two-way sync between a chat folder and a local directory: downloads files that exist only in the chat, uploads files that exist only locally. Files are matched by their path relative to the synced roots.

```bash
pt chat sync CHAT_ID LOCAL_DIR [OPTIONS]
```

| Option | Default | Description |
|---|---|---|
| `--path`, `-p` | chat root | Directory inside the chat to sync against |
| `--prefer` | skip | What to do with files present on both sides: unset skips them, `local` re-uploads the local copy, `remote` downloads the chat's copy over the local one |
| `--dry-run` | off | Print what would be downloaded/uploaded/skipped without transferring anything |
| `--profile` | active profile | Profile for this request |
| `--api-url`, `-u` | profile URL | API URL override |

There is no timestamp or checksum comparison — a file present on both sides is treated as a conflict and skipped unless `--prefer` names a winning side. If any remote directory listing fails, the command aborts (exit 1) before transferring anything, since an incomplete remote tree would misclassify files. Per-file transfer failures are non-fatal and counted in the summary (`Sync complete: N downloaded, M uploaded, K skipped, E failed`).

`sync` always recurses through the full remote and local trees — there is no `--recursive` flag, unlike `sync-to`. If two remote documents sanitize to the same local filename, the CLI keeps the first and prints a warning that the other is ignored.

```bash
# Reconcile both sides; files on both sides are left untouched
pt chat sync 123 ./workspace

# Preview the plan first
pt chat sync 123 ./workspace --dry-run

# The chat's copy wins for files present on both sides
pt chat sync 123 ./workspace --prefer remote

# Only the /reports subtree
pt chat sync 123 ./reports --path /reports
```

---

## ChatDB: `pt chatdb`

ChatDB is a chat's structured data store — the backing store that PrimeThink Live Apps read and write. These commands let you initialize it and manage its entities (rows) directly, which is useful for seeding fixture data before testing a Live App or for inspecting/verifying the state a Live App produced.

Entities are grouped by name (think tables); each row has an `id`. Initialize the store once per chat with `pt chatdb init`, then read and write rows.

> Unlike `pt chat`/`pt collection`, this group *does* use `-p` for `--profile` (there is no `--path` here).

**Targeting a DB Collection.** By default every command below except `init` reads and writes the chat's own ChatDB. Pass `--collection NAME` and/or `--collection-id N` to target a **DB Collection** (a collection of type `db`, see `pt collection create --type db`) attached to the chat instead. The ID is unambiguous when several attached DB Collections share a name, and it survives a rename; when you pass both, they must identify the same collection or the API answers 404. Writes (`add`, `update`, `delete`) to a collection attached read-only are rejected with 403. The target is sent as `collection_name`/`collection_id` in the request body, or as query parameters for `get`. There is no `pt` command to attach a collection to a chat yet — attach it in the web app.

```bash
pt chatdb list 123 --entity tasks --collection project-db
pt chatdb add 123 --entity tasks --data '{"title": "a"}' --collection-id 42
```

### `pt chatdb init`

Initialize the ChatDB store for a chat.

```bash
pt chatdb init CHAT_ID [--profile NAME] [--api-url URL]
```

Calls `POST /api/v1/chats/{chat_id}/chatdb/init`.

### `pt chatdb list`

List entities (rows) in a chat's ChatDB store.

```bash
pt chatdb list CHAT_ID [OPTIONS]
```

| Option | Description |
|---|---|
| `--entity` | Entity name to list; repeat the flag for multiple entities |
| `--filters` | Filter as a JSON object (e.g. `'{"done": false}'`) |
| `--limit` | Maximum number of rows to return |
| `--offset` | Row offset |
| `--page` | Page number |
| `--page-size` | Results per page |
| `--collection` | Target an attached DB Collection by name instead of the chat's own ChatDB |
| `--collection-id` | Target an attached DB Collection by ID (≥ 1; unambiguous when names repeat) |

Calls `POST /api/v1/chats/{chat_id}/chatdb/list`.

```bash
pt chatdb list 123 --entity todos
pt chatdb list 123 --entity todos --filters '{"done": false}' --limit 20
```

### `pt chatdb get`

Get a single ChatDB entity by its ID.

```bash
pt chatdb get CHAT_ID ENTITY_ID [--collection NAME] [--collection-id N] [--profile NAME] [--api-url URL]
```

| Option | Description |
|---|---|
| `--collection` | Target an attached DB Collection by name instead of the chat's own ChatDB |
| `--collection-id` | Target an attached DB Collection by ID (≥ 1; unambiguous when names repeat) |

Calls `GET /api/v1/chats/{chat_id}/chatdb/entities/{entity_id}`.

### `pt chatdb add`

Add one row (`--data`) or many rows (`--items`) to a named entity.

```bash
pt chatdb add CHAT_ID --entity NAME [--data JSON] [--items JSON]
```

| Option | Description |
|---|---|
| `--entity` | Entity name to add to (required) |
| `--data` | A single row as a JSON object |
| `--items` | Multiple rows as a JSON array (bulk insert) |
| `--collection` | Target an attached DB Collection by name instead of the chat's own ChatDB |
| `--collection-id` | Target an attached DB Collection by ID (≥ 1; unambiguous when names repeat) |

Calls `POST /api/v1/chats/{chat_id}/chatdb/entities`.

```bash
pt chatdb add 123 --entity todos --data '{"title": "ship it", "done": false}'
pt chatdb add 123 --entity todos --items '[{"title": "a"}, {"title": "b"}]'
```

### `pt chatdb update`

Update one row (by `--entity-id`) or many (`--items`).

```bash
pt chatdb update CHAT_ID [OPTIONS]
```

| Option | Description |
|---|---|
| `--entity-id` | ID of the row to update |
| `--data` | Fields to set as a JSON object |
| `--merge` / `--replace` | Merge `--data` into the existing row or replace it (server default applies if unset) |
| `--items` | Bulk updates as a JSON array |
| `--if-unchanged-since` | Only update if the row is unchanged since this timestamp (optimistic concurrency) |
| `--collection` | Target an attached DB Collection by name instead of the chat's own ChatDB |
| `--collection-id` | Target an attached DB Collection by ID (≥ 1; unambiguous when names repeat) |

Requires at least one of `--entity-id`/`--data` or `--items`; a collection target on its own does not count. Calls `PATCH /api/v1/chats/{chat_id}/chatdb/entities`.

```bash
pt chatdb update 123 --entity-id 7 --data '{"done": true}' --merge
```

### `pt chatdb delete`

Delete a single row (`--entity-id`) or several (`--ids`). **Destructive and irreversible** — prompts for confirmation unless `--yes` is passed.

```bash
pt chatdb delete CHAT_ID [--entity-id N | --ids 1,2,3] [--collection NAME] [--collection-id N] [--yes]
```

| Option | Description |
|---|---|
| `--entity-id` | ID of a single row to delete |
| `--ids` | Comma-separated row IDs to delete |
| `--collection` | Target an attached DB Collection by name instead of the chat's own ChatDB |
| `--collection-id` | Target an attached DB Collection by ID (≥ 1; unambiguous when names repeat) |
| `--yes` | Skip the confirmation prompt |

Requires `--entity-id` or `--ids`. Calls `DELETE /api/v1/chats/{chat_id}/chatdb/entities`.

```bash
pt chatdb delete 123 --entity-id 7
pt chatdb delete 123 --ids 7,8,9 --yes
```

---

## Collections: `pt collection`

Collections are shared document stores. The file subcommands mirror the `pt chat` file commands.

> As with `pt chat`, there is no `-p` shorthand for `--profile` in this group; `-p` means `--path` on the file commands.

### `pt collection list`

List collections, paginated.

```bash
pt collection list [--page N] [--page-size N] [--search TEXT] [--profile NAME] [--api-url URL]
```

| Option | Default | Description |
|---|---|---|
| `--page` | 1 | Page number |
| `--page-size` | 20 | Results per page |
| `--search`, `-s` | — | Filter collections by name |

```bash
pt collection list
pt collection list --search contracts --page-size 50
```

### `pt collection create`

Create a new collection.

```bash
pt collection create --name NAME [OPTIONS]
```

| Option | Description |
|---|---|
| `--name` | Collection name (required) |
| `--description` | Collection description |
| `--type` | Collection type: `collection`, `skill`, `external_source`, or `db` (a DB Collection: structured entities that `pt chatdb --collection` and Live Apps' `pt.db()` read and write) (server default: `collection`) |
| `--public` / `--private` | Make the collection public or private (server default: private) |

Calls `POST /api/v1/collections` and prints the created collection as JSON.

```bash
pt collection create --name "Knowledge base"
pt collection create --name "Support skill" --type skill --public
```

### `pt collection get`

Fetch a collection's details as JSON (name, indexed flag, documents, …).

```bash
pt collection get COLLECTION_ID [--profile NAME] [--api-url URL]
```

Calls `GET /api/v1/collections/{collection_id}`.

```bash
pt collection get 42 | jq '{name, indexed}'
```

### `pt collection update`

Update a collection. Only the options you pass are sent (PATCH semantics); at least one is required.

```bash
pt collection update COLLECTION_ID [OPTIONS]
```

| Option | Description |
|---|---|
| `--name` | Collection name |
| `--description` | Collection description |
| `--type` | Collection type: `collection`, `skill`, `external_source`, or `db` |
| `--public` / `--private` | Make the collection public or private |
| `--indexed` / `--not-indexed` | Enable or disable indexing |
| `--ocr-instructions` | OCR instructions for document processing |

Calls `PATCH /api/v1/collections/{collection_id}` and prints the updated collection.

```bash
pt collection update 42 --name "Renamed KB"
pt collection update 42 --indexed
```

### `pt collection reindex`

Trigger a reindex of a collection (rebuild its vector store). Useful when a fresh upload isn't showing up in semantic search yet — indexing can lag.

```bash
pt collection reindex COLLECTION_ID [--profile NAME] [--api-url URL]
```

Calls `POST /api/v1/collections/{collection_id}/reindex`.

### `pt collection copy`

Duplicate a collection. Takes the collection's **UUID** (not the numeric ID).

```bash
pt collection copy COLLECTION_UUID [--profile NAME] [--api-url URL]
```

Calls `POST /api/v1/collections/{collection_uuid}/copy`.

### `pt collection delete`

Delete a collection. **Destructive and irreversible** — prompts for confirmation unless `--yes` is passed.

```bash
pt collection delete COLLECTION_ID [--yes] [--profile NAME] [--api-url URL]
```

Calls `DELETE /api/v1/collections/{collection_id}`.

```bash
pt collection delete 42
pt collection delete 42 --yes
```

### `pt collection delete-file`

Delete one or more files from a collection by document ID. **Destructive and irreversible** — prompts for confirmation unless `--yes` is passed.

```bash
pt collection delete-file COLLECTION_ID DOCUMENT_ID... [--yes] [--profile NAME] [--api-url URL]
```

Calls `DELETE /api/v1/collections/{collection_id}/documents` with the document IDs in the body. Find document IDs with [`pt collection list-files`](#pt-collection-list-files).

```bash
pt collection delete-file 42 10
pt collection delete-file 42 10 11 12 --yes
```

### `pt collection list-files`

List files and directories in a collection.

```bash
pt collection list-files COLLECTION_ID [--path /subfolder] [--profile NAME] [--api-url URL]
```

### `pt collection upload-files`

Upload one or more local files to a collection.

```bash
pt collection upload-files COLLECTION_ID FILE [FILE ...] [--path /subfolder] [--profile NAME] [--api-url URL]
```

### `pt collection upload-text`

Create a document in a collection from raw text — no local file needed. Same options as [`pt chat upload-text`](#pt-chat-upload-text).

```bash
pt collection upload-text COLLECTION_ID (--text TEXT | --text-file PATH) [--name NAME] [--metadata M] [--path DIR]
```

Calls `POST /api/v1/collections/{collection_id}/texts`.

```bash
pt collection upload-text 42 --text "Return policy: 30 days." --name policy.md
```

### `pt collection download-file`

Download a single file from a collection.

```bash
pt collection download-file COLLECTION_ID DOCUMENT_ID [--output PATH] [--profile NAME] [--api-url URL]
```

### `pt collection sync-to`

Upload a local directory to a collection. Same options and behavior as [`pt chat sync-to`](#pt-chat-sync-to): `--path`/`-p`, `--pattern` (default `*`), `--recursive`/`-r`.

```bash
pt collection sync-to 42 ./knowledge-base --recursive
```

### `pt collection sync-from`

Download a collection's files (recursively) into a local directory. Same behavior as [`pt chat sync-from`](#pt-chat-sync-from).

```bash
pt collection sync-from 42 ./kb-backup
```

---

## Agents: `pt agent`

Manage agents (virtual assistants): list, inspect, create, update, and delete them, and discover the available agent types.

> **Sending a message to an agent** is done with [`pt chat send --agent AGENT_ID`](#pt-chat-send) — there is deliberately no `pt agent send`; one command covers messaging chats and agents.

### `pt agent list`

List agents, with optional filters.

```bash
pt agent list [OPTIONS]
```

| Option | Description |
|---|---|
| `--search`, `-s` | Search agents by name |
| `--type-id` | Filter by agent type ID; repeat the flag for multiple types |
| `--status` | Filter by status: `all` or `archived` (server default: `all`) |
| `--task-id` | Filter by task ID |
| `--summary` / `--full` | Trim each agent to lightweight fields (id, name, model, access type, status, type, short public description), or return the full records (default: `--full`) |

Each full agent record embeds heavy config/description/capabilities, so a
workspace's agents can be a large payload. Use `--summary` for a compact
overview, then [`pt agent get`](#pt-agent-get) for one agent's full detail.
(The `list_agents` MCP tool returns the summary **by default**; pass
`detail=true` there for full records.)

```bash
pt agent list
pt agent list --search support --type-id 1 --type-id 3
pt agent list --status archived
pt agent list --summary
```

### `pt agent get`

Fetch an agent's full details as JSON.

```bash
pt agent get AGENT_ID [--profile NAME] [--api-url URL]
```

```bash
pt agent get 7 | jq '.model'
```

### `pt agent create`

Create a new agent.

```bash
pt agent create --name NAME --public-description TEXT --type-id N [OPTIONS]
```

Required options:

| Option | Description |
|---|---|
| `--name` | Agent name |
| `--public-description` | Public description shown for the agent |
| `--type-id` | Agent type ID (discover with [`pt agent types`](#pt-agent-types)) |

Optional field options (shared with `pt agent update`; only options you pass are sent):

| Option | Description |
|---|---|
| `--description` | Agent description / instructions |
| `--description-file` | Read the description from a file (mutually exclusive with `--description`) |
| `--model` | Model name |
| `--access-type` | Access type: `private`, `group`, `task`, `system`, or `catalog` (server default: `private`) |
| `--help-text` | Help text for the agent |
| `--help-url` | Help URL for the agent |
| `--tag-ids` | Tag IDs, comma-separated |
| `--capability` | Capability to attach, by code or ID; repeat the flag for multiple (resolved to IDs via [`pt capability resolve`](#pt-capability-resolve)) |
| `--extra` | Extra data as a JSON string (validated before sending) |

```bash
pt agent types   # find the type ID first

pt agent create --name "Support bot" --public-description "Answers support questions" --type-id 1

pt agent create \
  --name "Researcher" \
  --public-description "Deep research assistant" \
  --type-id 1 \
  --description-file ./researcher-instructions.md \
  --model gpt-test \
  --access-type group
```

### `pt agent update`

Update an existing agent. Accepts the same options as `pt agent create`, but **all** of them are optional. At least one field must be provided; only the fields you pass are changed (the request is a PATCH).

```bash
pt agent update AGENT_ID [FIELD OPTIONS] [--profile NAME] [--api-url URL]
```

```bash
pt agent update 7 --model gpt-test-2
pt agent update 7 --description-file ./new-instructions.md
```

### `pt agent delete`

Delete an agent. Prompts for confirmation; pass `--yes` to skip the prompt.

```bash
pt agent delete AGENT_ID [--yes] [--profile NAME] [--api-url URL]
```

### `pt agent types`

List the available agent (virtual assistant) types. Use the returned IDs for `pt agent create --type-id` and `pt agent list --type-id`.

```bash
pt agent types [--profile NAME] [--api-url URL]
```

### `pt agent list-docs`

List the documents attached to an agent (its knowledge base).

```bash
pt agent list-docs AGENT_ID [--profile NAME] [--api-url URL]
```

Calls `GET /api/v1/virtual-assistants/{agent_id}/documents`.

### `pt agent upload-docs`

Upload one or more local files to an agent's knowledge base.

```bash
pt agent upload-docs AGENT_ID FILE [FILE ...] [OPTIONS]
```

| Option | Description |
|---|---|
| `--path` | Directory path within the agent to upload to |
| `--metadata` | Custom metadata string to attach |
| `--attachment-mode` | How the documents are attached: `search`, `context`, `archived`, or `attached` |

Calls `POST /api/v1/virtual-assistants/{agent_id}/documents`.

```bash
pt agent upload-docs 7 handbook.pdf faq.md --attachment-mode search
```

### `pt agent attach-collections`

Attach one or more collections to an agent, so the agent can retrieve from them (RAG).

```bash
pt agent attach-collections AGENT_ID COLLECTION_ID [COLLECTION_ID ...]
```

Calls `POST /api/v1/virtual-assistants/{agent_id}/collections/attach`.

### `pt agent detach-collection`

Detach a collection from an agent.

```bash
pt agent detach-collection AGENT_ID COLLECTION_ID
```

Calls `DELETE /api/v1/virtual-assistants/{agent_id}/collections/{collection_id}`.

### `pt agent upload-image`

Upload an image for an agent (its avatar/cover image). The content type is inferred from the file extension.

```bash
pt agent upload-image AGENT_ID FILE [--profile NAME] [--api-url URL]
```

Calls `POST /api/v1/virtual-assistants/{agent_id}/image`.

```bash
pt agent upload-image 7 ./avatar.png
```

### `pt agent delete-image`

Delete an agent's image. **Destructive** — prompts for confirmation unless `--yes` is passed.

```bash
pt agent delete-image AGENT_ID [--yes] [--profile NAME] [--api-url URL]
```

Calls `DELETE /api/v1/virtual-assistants/{agent_id}/image`.

---

## Capabilities: `pt capability`

Agent capabilities are reusable tools/behaviours (internal, MCP, API, computer-use, or sandbox) that agents can use. This group is full CRUD over them.

Shared create/update fields: `--type` (`internal`/`mcp`/`api`/`computer_use`/`sandbox`), `--access-type` (`system`/`group`/`user`/`private`), `--description`, `--help-text`, `--help-url`, `--ordering`, `--is-default`/`--no-is-default`, and `--options` (a JSON object of capability config).

### `pt capability list`

List capabilities.

```bash
pt capability list [OPTIONS]
```

| Option | Description |
|---|---|
| `--search`, `-s` | Search capabilities by name |
| `--type` | Filter by type: `internal`, `mcp`, `api`, `computer_use`, `sandbox` |
| `--tag` | Filter by tag; repeat the flag for multiple tags |
| `--archived` | List archived capabilities |
| `--page` / `--page-size` | Pagination |

Calls `GET /api/v1/virtual-assistants/capabilities`.

### `pt capability create`

Create a capability. `--name` and `--code` are required.

```bash
pt capability create --name NAME --code CODE [shared fields]
```

Calls `POST /api/v1/virtual-assistants/capabilities`.

```bash
pt capability create --name "Web search" --code web_search --type mcp \
  --access-type group --options '{"endpoint": "https://…"}'
```

### `pt capability update`

Update a capability (PATCH; only the fields you pass change; at least one required). Adds `--archived`/`--not-archived` to the shared fields.

```bash
pt capability update CAPABILITY_ID [shared fields] [--archived | --not-archived]
```

Calls `PATCH /api/v1/virtual-assistants/capabilities/{capability_id}`.

### `pt capability delete`

Delete a capability. **Destructive and irreversible** — prompts for confirmation unless `--yes` is passed.

```bash
pt capability delete CAPABILITY_ID [--yes]
```

Calls `DELETE /api/v1/virtual-assistants/capabilities/{capability_id}`.

### `pt capability archive`

Archive a capability.

```bash
pt capability archive CAPABILITY_ID
```

Calls `PUT /api/v1/virtual-assistants/capabilities/{capability_id}/archived?archived=true`.

### `pt capability unarchive`

Unarchive a capability (`…/archived?archived=false`).

```bash
pt capability unarchive CAPABILITY_ID
```

### `pt capability duplicate`

Duplicate a capability.

```bash
pt capability duplicate CAPABILITY_ID
```

Calls `POST /api/v1/virtual-assistants/capabilities/{capability_id}/duplicate`.

### `pt capability resolve`

Resolve one or more capability codes or IDs to their capability IDs. Useful for turning human-readable codes into the IDs that [`pt agent create --capability`](#pt-agent-create) accepts.

```bash
pt capability resolve CODE_OR_ID [CODE_OR_ID ...] [--profile NAME] [--api-url URL]
```

Looks capabilities up via `GET /api/v1/virtual-assistants/capabilities`. MCP tool: `resolve_capabilities`.

```bash
pt capability resolve web_search code_interpreter
```

---

## Model catalog: `pt models`

Discover the LLM and embedding models available in your workspace, so agent/group model strings come from the catalog instead of being guessed. Both commands return a **trimmed summary** by default (the fields you need to pick a model); pass `--full` for the raw records.

### `pt models list`

List LLM models.

```bash
pt models list [OPTIONS]
```

| Option | Description |
|---|---|
| `--search`, `-s` | Search models by name/id |
| `--provider` | Filter by provider |
| `--vision` | Only models with vision support |
| `--reasoning` | Only reasoning models |
| `--only-configured` | Only models the workspace has configured (has credentials for) |
| `--include-deprecated` | Include deprecated models |
| `--limit` | Maximum number of models to return |
| `--full` | Return the full raw catalog instead of the trimmed summary |

Calls `GET /api/v1/catalog/llm/models`. Use a model's `id` as the string for `pt agent create --model`.

```bash
pt models list --only-configured
pt models list --provider openai --vision | jq '.[].id'
```

### `pt models embeddings`

List embedding models. Same shape as `pt models list`, with `--multimodal` instead of `--vision`/`--reasoning`.

```bash
pt models embeddings [--provider P] [--multimodal] [--only-configured] [--include-deprecated] [--limit N] [--full]
```

Calls `GET /api/v1/catalog/embeddings/models`.

---

## Scheduled jobs: `pt scheduled-job`

A scheduled job runs a prompt on a schedule inside a chat. This group lists, creates, updates, pauses/resumes, and deletes them.

### `pt scheduled-job list`

List the scheduled jobs in a chat.

```bash
pt scheduled-job list CHAT_ID [--profile NAME] [--api-url URL]
```

Calls `GET /api/v1/scheduled_jobs/scheduled_jobs_in_chat/{chat_id}`.

### `pt scheduled-job create`

Create a scheduled job.

```bash
pt scheduled-job create --chat-id ID --schedule-prompt "PROMPT" [OPTIONS]
```

| Option | Description |
|---|---|
| `--chat-id` | Chat the job runs in (required) |
| `--schedule-prompt` | The prompt to run on the schedule (required) |
| `--schedule-nl` | The schedule in natural language or cron (LLM-parsed server-side, so this can be slow) |
| `--notify` / `--no-notify` | Notify on each run |

Calls `POST /api/v1/scheduled_jobs/scheduled_job_in_chat`. Requests with `--schedule-nl` use the longer 120s timeout.

```bash
pt scheduled-job create --chat-id 123 --schedule-prompt "Post the daily digest" \
  --schedule-nl "every weekday at 9am" --notify
```

### `pt scheduled-job update`

Update a job (only the fields you pass change; at least one required).

```bash
pt scheduled-job update JOB_ID [--schedule-prompt "…"] [--schedule-nl "…"] [--notify | --no-notify] [--status Active|Paused]
```

Calls `PUT /api/v1/scheduled_jobs/scheduled_job_in_chat/{job_id}`.

### `pt scheduled-job set-status`

Pause or resume a job.

```bash
pt scheduled-job set-status JOB_ID --status Active|Paused
```

Calls `PATCH /api/v1/scheduled_jobs/scheduled_job_in_chat/{job_id}/status`.

### `pt scheduled-job delete`

Delete a scheduled job (asks for confirmation unless `--yes`).

```bash
pt scheduled-job delete JOB_ID [--yes]
```

Calls `DELETE /api/v1/scheduled_jobs/scheduled_job_in_chat/{job_id}`.

---

## Chat workspaces: `pt workspace`

Workspaces group related chats. This group creates and manages them and moves chats in and out.

```bash
pt workspace list [--archived] [--pinned] [--page N] [--page-size N]
pt workspace create --name NAME [--goal GOAL] [--ordering N]
pt workspace rename WORKSPACE_ID NEW_NAME
pt workspace set-goal WORKSPACE_ID GOAL
pt workspace archive WORKSPACE_ID | pt workspace unarchive WORKSPACE_ID
pt workspace pin WORKSPACE_ID | pt workspace unpin WORKSPACE_ID
pt workspace add-chat WORKSPACE_ID CHAT_ID
pt workspace remove-chat CHAT_ID                       # removes the chat from whatever workspace it's in
pt workspace delete WORKSPACE_ID [--delete-chats] [--yes]   # DESTRUCTIVE
```

| Command | Endpoint |
|---|---|
| `list` | `GET /api/v1/chat-workspaces` |
| `create` | `POST /api/v1/chat-workspaces` |
| `rename` | `PUT /api/v1/chat-workspaces/{id}/name` |
| `set-goal` | `PUT /api/v1/chat-workspaces/{id}/goal` |
| `archive` / `unarchive` | `POST /api/v1/chat-workspaces/{id}/archive/{true\|false}` |
| `pin` / `unpin` | `POST /api/v1/chat-workspaces/{id}/pin/{true\|false}` |
| `add-chat` | `POST /api/v1/chat-workspaces/{id}/add-chat/{chat_id}` |
| `remove-chat` | `DELETE /api/v1/chat-workspaces/remove-chat/{chat_id}` |
| `delete` | `DELETE /api/v1/chat-workspaces/{id}` (`--delete-chats` sets `delete_chats_in_workspace`) |

The MCP tools mirror these (`list_chat_workspaces`, `create_chat_workspace`, `rename_chat_workspace`, `set_chat_workspace_goal`, `archive_chat_workspace`, `pin_chat_workspace`, `add_chat_to_workspace`, `remove_chat_from_workspace`, `delete_chat_workspace`); `archive_chat_workspace`/`pin_chat_workspace` take a boolean instead of separate archive/unarchive commands.

---

## Tags: `pt tag`

Tags are namespaced by object type (`model`): `task`, `agent`, `capability`, or `collection`. This group lists the available tags, creates new ones, and assigns them to an object.

```bash
pt tag list --model {task|agent|capability|collection} [--only-used]
pt tag create --model MODEL --name NAME [--category CATEGORY]
pt tag assign --model MODEL --owner-id ID [--tag-id N ...]
```

| Command | Endpoint |
|---|---|
| `list` | `GET /api/v1/tags?model=…&only_used=…` |
| `create` | `POST /api/v1/tags` (`{model, name, tag_category}`) |
| `assign` | `PUT /api/v1/tags/assignments` (`{model, owner_id, tag_ids}`) |

`assign` **replaces** the object's current tag set with the `--tag-id`s you pass (pass none to clear them). MCP mirrors these as `list_tags`, `create_tag`, `assign_tags`.

```bash
pt tag create --model collection --name "legal" --category dept
pt tag list --model collection --only-used
pt tag assign --model collection --owner-id 42 --tag-id 3 --tag-id 5
```

---

## Groups: `pt group`

Manage groups (organizations), their members, invites, and the agents available in them.

```bash
pt group list [--offset N] [--limit N] [--sort S]
pt group get GROUP_ID
pt group create --name NAME [--doc-analysis | --no-doc-analysis] [--doc-analysis-mime-types "…"]
pt group update GROUP_ID --name NAME [...]           # PUT — the API requires --name
pt group delete GROUP_ID [--yes]                     # DESTRUCTIVE
pt group members GROUP_ID [--search S] [--order-by O] [--order-dir asc|desc]
pt group remove-member GROUP_ID USER_ID [USER_ID ...] [--yes]
pt group invite --email EMAIL [--role-id N]          # invites to the current group
pt group add-agent GROUP_ID AGENT_ID [AGENT_ID ...]
pt group remove-agent GROUP_ID AGENT_ID [AGENT_ID ...]
```

| Command | Endpoint |
|---|---|
| `list` | `GET /api/v1/groups/` |
| `get` | `GET /api/v1/groups/{id}` |
| `create` | `POST /api/v1/groups/` |
| `update` | `PUT /api/v1/groups/{id}` |
| `delete` | `DELETE /api/v1/groups/{id}` |
| `members` | `GET /api/v1/groups/{id}/members` |
| `remove-member` | `DELETE /api/v1/groups/{id}/members/` (`[user_ids]`) |
| `invite` | `POST /api/v1/groups/invite/?email=&role_id=` |
| `add-agent` / `remove-agent` | `POST /api/v1/groups/{id}/add_vas` / `DELETE .../remove_vas` (`[vas_ids]`) |

The MCP tools mirror these (`list_groups`, `get_group`, `create_group`, `update_group`, `delete_group`, `list_group_members`, `remove_group_members`, `invite_to_group`, `add_agents_to_group`, `remove_agents_from_group`).

---

## Settings: `pt settings`

Read and write group and user settings, including provider API keys. Settings live at two scopes — `group` and `user` — and a key may exist at one or both. **Secret values are never printed**: `list`/`get` report only whether a value `is_set` and whether it is `sensitive`, and `get` redacts a sensitive value.

```bash
pt settings list [--scope all|group|user]
pt settings get KEY --scope group|user
pt settings set KEY VALUE [--scope group|user]
pt settings delete KEY --scope group|user [--yes]           # DESTRUCTIVE
```

| Command | Endpoint / behavior |
|---|---|
| `list` | `GET /api/v1/groups/current/settings` + `GET /api/v1/users/me/settings` (plus dedicated properties); `--scope` filters which are shown |
| `get` | `GET` the group or user setting for `KEY` (sensitive values redacted) |
| `set` | routed by `KEY` to the right group/user setting endpoint; provider `*_API_KEY` keys are stored as secrets (default `group` scope) |
| `delete` | `DELETE` the KV setting for `KEY` (dedicated properties can't be deleted) |

`--scope` is **required** whenever a key exists at more than one scope. Known keys per scope:

- **group**: `default_agent`, `voice`, `voice_provider`, `new_chat_logic`, `group_mode`, `default_role`, `document_analysis_active`, `public_name`, `custom_theme_color`
- **user**: `timezone`, `location`, `default_language`, `default_va`, `auto_archive_option`, `custom_theme_color`
- plus any `*_API_KEY` (e.g. `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`), stored as a secret at group scope by default

```bash
# Set the group's default agent
pt settings set default_agent 7 --scope group

# Add a provider API key (stored as a secret; never echoed back)
pt settings set ANTHROPIC_API_KEY sk-ant-… --scope group

# Inspect current settings without exposing secrets
pt settings list --scope group
pt settings get timezone --scope user
```

MCP tools: `list_settings`, `get_setting`, `set_setting`, `delete_setting`.

---

## Users: `pt user`

Look up the users you can see (directory lookup). The underlying endpoint takes no query parameters, so `--search` and `--limit` are applied **client-side**.

```bash
pt user list [--search TEXT] [--full] [--limit N]
pt user search QUERY [--full] [--limit N]
```

| Command | Endpoint |
|---|---|
| `list` | `GET /api/v1/users/me/visible-users` (or `/full` with `--full`) |
| `search` | same endpoint, filtered by name/email client-side |

`--full` returns the richer `/full` records; `--limit` caps the number of results printed.

```bash
pt user list
pt user search ann@acme.co --full
pt user list --search support --limit 20
```

MCP tools: `list_users`, `search_users`.

---

## Notifications: `pt notification`

Read your notifications and mark them read/unread (sending a notification is not exposed by the API). `--unread-only` filters **client-side**.

```bash
pt notification list [--unread-only] [--page N] [--page-size N]
pt notification unread-count
pt notification mark-read NOTIFICATION_ID
pt notification mark-unread NOTIFICATION_ID
pt notification mark-all-read
pt notification delete NOTIFICATION_ID [--yes]
```

| Command | Endpoint |
|---|---|
| `list` | `GET /api/v1/notifications?page=&page_size=` |
| `unread-count` | `GET /api/v1/notifications/unread-count` |
| `mark-read` / `mark-unread` | `POST /api/v1/notifications/{id}/mark-as-read` / `.../mark-as-unread` |
| `mark-all-read` | `POST /api/v1/notifications/mark-all-as-read` |
| `delete` | `DELETE /api/v1/notifications/{id}` (prompts unless `--yes`) |

MCP tools: `list_notifications`, `get_unread_notification_count`, `mark_notification_read`, `mark_notification_unread`, `mark_all_notifications_read`, `delete_notification`.

---

## Directories (folders)

Chats, collections, tasks, and agents each organise their files into directories. The same four commands are available under **`pt chat`**, **`pt collection`**, **`pt task`**, and **`pt agent`** (below, `<owner>` is one of them and the first argument is that owner's ID). Listing a directory's contents is the group's existing `list-files` command (`GET .../directories?path=…`).

```bash
# Create a directory
pt <owner> mkdir OWNER_ID PATH

# Delete a directory (DESTRUCTIVE — prompts unless --yes; --recursive removes contents)
pt <owner> rmdir OWNER_ID DIR_PATH [--recursive] [--yes]

# Move SRC_DIR under DEST_PARENT (--merge merges into an existing directory)
pt <owner> move-dir OWNER_ID SRC_DIR DEST_PARENT [--merge]

# Rename SRC_DIR_PATH to NEW_DIR_NAME
pt <owner> rename-dir OWNER_ID SRC_DIR_PATH NEW_DIR_NAME
```

| Command | Endpoint (`{owner}` = `chats`/`collections`/`tasks`/`virtual-assistants`) |
|---|---|
| `mkdir` | `POST /api/v1/{owner}/{id}/directories?path=…` |
| `rmdir` | `DELETE /api/v1/{owner}/{id}/directories/delete` (`{dir_path, delete_recursively}`) |
| `move-dir` | `POST /api/v1/{owner}/{id}/directories/move` (`{src_dir, dest_parent, merge_dirs}`) |
| `rename-dir` | `PUT /api/v1/{owner}/{id}/directories/rename` (`{src_dir_path, new_dir_name}`) |

```bash
pt chat mkdir 123 /reports
pt collection rename-dir 42 /old-name new-name
pt task move-dir 99 /drafts /archive --merge
pt agent rmdir 7 /scratch --recursive --yes
```

The MCP server exposes these as four generic tools — `create_directory`, `delete_directory`, `move_directory`, `rename_directory` — each taking an `owner_type` of `chat`/`collection`/`task`/`agent`.

---

## Document versions

Documents in chats, collections, and tasks are versioned. The same five commands are available under **`pt chat`**, **`pt collection`**, and **`pt task`** (`<owner>` is one of them; the first two arguments are the owner ID and the document ID). Get a document ID from the group's `list-files`.

```bash
# List a document's versions
pt <owner> list-versions OWNER_ID DOCUMENT_ID

# Add a new version from a local file
pt <owner> new-version OWNER_ID DOCUMENT_ID FILE [--version-name NAME]

# Add a new version from raw text
pt <owner> new-text-version OWNER_ID DOCUMENT_ID (--text TEXT | --text-file PATH) [--name NAME] [--metadata M] [--version-name NAME]

# Promote a version to production
pt <owner> set-production-version OWNER_ID DOCUMENT_ID VERSION_NUMBER

# Delete a version (DESTRUCTIVE — prompts unless --yes)
pt <owner> delete-version OWNER_ID DOCUMENT_ID VERSION_NUMBER [--yes]
```

| Command | Endpoint (`{owner}` = `chats`/`collections`/`tasks`) |
|---|---|
| `list-versions` | `GET /api/v1/{owner}/{id}/documents/{document_id}/versions` |
| `new-version` | `POST /api/v1/{owner}/{id}/documents/{document_id}/create_new_version?version_name=…` (multipart) |
| `new-text-version` | `POST /api/v1/{owner}/{id}/documents/{document_id}/create_new_text_version?version_name=…` |
| `set-production-version` | `POST /api/v1/{owner}/{id}/documents/{document_id}/set_production_version?version_number=…` |
| `delete-version` | `DELETE /api/v1/{owner}/{id}/documents/{document_id}/delete_version/{version_number}` |

The MCP server exposes these as generic tools — `list_document_versions`, `create_document_version`, `create_document_text_version`, `set_production_version`, `delete_document_version` — each taking an `owner_type` of `chat`/`collection`/`task`.

---

## Tasks: `pt task`

Discover and execute task actions; list, create, inspect, update, and version tasks; upload task images.

### `pt task list`

List tasks, with optional filters and pagination.

```bash
pt task list [OPTIONS]
```

| Option | Description |
|---|---|
| `--search`, `-s` | Search tasks by name |
| `--type` | Filter by task type: `private`, `public`, `group`, `system`, or `catalog`; repeat the flag for multiple types |
| `--status` | Filter by status: `all`, `published`, or `archived` (server default: `published`) |
| `--page-type` | Filter by page type: `chat`, `html`, or `react` |
| `--starred` / `--no-starred` | Filter by starred state |
| `--order-by` | Sort field: `last_updated_at`, `last_run`, `name`, or `manual` (server default: `last_updated_at`) |
| `--order-dir` | Sort direction: `asc` or `desc` (server default: `desc`) |
| `--page` | Page number (default: `1`) |
| `--page-size` | Results per page (default: `25`) |

Calls `GET /api/v1/tasks/` and prints the JSON response.

```bash
pt task list
pt task list --search onboarding --type private --status all
pt task list --page-type react --order-by name --order-dir asc
pt task list | jq '.items[].id'
```

### `pt task actions`

List the task actions available to your account.

```bash
pt task actions [--profile NAME] [--api-url URL]
```

Calls `GET /api/v1/tasks/available_task_actions` and prints the JSON response.

```bash
pt task actions
pt task actions --profile production
pt task actions | jq '.[].name'
```

### `pt task execute`

Execute a task action with a message and optional file attachments.

```bash
pt task execute --action ACTION --message "MESSAGE" [OPTIONS]
```

| Option | Required | Description |
|---|---|---|
| `--action`, `-a` | yes | Task action name (see `pt task actions`) |
| `--message`, `-m` | yes | Message input for the action |
| `--files`, `-f` | no | File to attach; repeat the flag for multiple files |
| `--return-original` | no | Include the original message in the response |
| `--profile` | no | Profile for this request |
| `--api-url`, `-u` | no | API URL override |

```bash
pt task execute --action summarize --message "Summarize this report" --files report.pdf

pt task execute -a compare_documents -m "Compare these" -f q1.pdf -f q2.pdf
```

### `pt task create`

Create a new task.

```bash
pt task create --name NAME --description TEXT --type TYPE [FIELD OPTIONS] [--profile NAME] [--api-url URL]
```

Required options:

| Option | Description |
|---|---|
| `--name` | Task name |
| `--description` | Task description |
| `--type` | Task type: `private`, `public`, `group`, `system`, or `catalog` |

Optional field options (shared with `pt task update`; only options you pass are sent — everything else is left to server defaults):

| Option | Description |
|---|---|
| `--goal` | Task goal text (defaults to empty on create) |
| `--goal-file` | Read the goal from a file (mutually exclusive with `--goal`) |
| `--virtual-assistant-id` | Virtual assistant (agent) ID that runs the task |
| `--initial-prompt` | Initial prompt |
| `--status` | Task status (server default: `published`) |
| `--schedule-nl` | Schedule in natural language (e.g. `"every Monday at 9am"`) or a cron expression |
| `--schedule-prompt` | Prompt to run on the schedule |
| `--chat-type` | Chat type (server default: `standard`) |
| `--global-memory/--no-global-memory` | Enable global memory (server default: enabled) |
| `--chat-history/--no-chat-history` | Enable chat history (server default: enabled) |
| `--search-in-chat/--no-search-in-chat` | Enable search in chat |
| `--search-in-documents/--no-search-in-documents` | Enable search in documents |
| `--extra-vas` | Extra virtual assistant IDs, comma-separated (e.g. `2,5,9`) |
| `--tag-ids` | Tag IDs, comma-separated |
| `--action-name` | Task action name |
| `--help-text` | Help text shown for the task |
| `--help-url` | Help URL for the task |
| `--run-immediately/--no-run-immediately` | Run the task immediately |
| `--canvas` | Canvas HTML content as a string |
| `--canvas-file` | Read canvas HTML from a file (mutually exclusive with `--canvas`) |
| `--page-type` | Page type (e.g. `html`) |
| `--summary-enabled/--no-summary-enabled` | Enable summary |
| `--docs-enabled/--no-docs-enabled` | Enable documents and collections |
| `--scheduled-jobs/--no-scheduled-jobs` | Enable scheduled jobs |
| `--email-integration/--no-email-integration` | Enable email integration |
| `--default-evaluator-agent-id` | Default evaluator agent ID |
| `--evaluation-pass-threshold` | Evaluation pass threshold (1–100) |
| `--evaluation-message-delay-ms` | Evaluation message delay in milliseconds |
| `--share-action/--no-share-action` | Enable share action |
| `--mimetypes` | Accepted mimetypes, comma-separated (e.g. `application/pdf,image/png`) |
| `--extra` | Extra data as a JSON string (validated before sending) |
| `--public-chat/--no-public-chat` | Enable public chat |

```bash
# Minimal task
pt task create --name "Weekly digest" --description "Summarize the week" --type private

# Scheduled task with a goal read from a file
pt task create \
  --name "Morning briefing" \
  --description "Daily news summary" \
  --type private \
  --goal-file ./briefing-goal.md \
  --virtual-assistant-id 7 \
  --schedule-nl "every weekday at 8am" \
  --schedule-prompt "Prepare the morning briefing"

# Task with extra structured data
pt task create --name "Intake" --description "Client intake" --type group \
  --extra '{"department": "legal", "priority": 2}'
```

### `pt task update`

Update an existing task. Accepts the same options as `pt task create`, but **all** of them are optional (including `--name`, `--description`, and `--type`). At least one field must be provided; only the fields you pass are changed (the request is a PATCH).

```bash
pt task update TASK_ID [FIELD OPTIONS] [--profile NAME] [--api-url URL]
```

```bash
pt task update 99 --description "Updated description"
pt task update 99 --schedule-nl "every Friday at 17:00" --schedule-prompt "Send weekly report"
pt task update 99 --canvas-file ./page.html --page-type html
```

### `pt task get`

Fetch a task's full details as JSON.

```bash
pt task get TASK_ID [--profile NAME] [--api-url URL]
```

```bash
pt task get 99
pt task get 99 | jq '.schedule_nl'
```

### `pt task upload-text`

Create a document in a task from raw text — no local file needed. Same options as [`pt chat upload-text`](#pt-chat-upload-text).

```bash
pt task upload-text TASK_ID (--text TEXT | --text-file PATH) [--name NAME] [--metadata M] [--path DIR]
```

Calls `POST /api/v1/tasks/{task_id}/texts`.

### `pt task add-docs`

Upload one or more local files to a task's knowledge base.

```bash
pt task add-docs TASK_ID FILE [FILE ...] [OPTIONS]
```

| Option | Description |
|---|---|
| `--path` | Directory path within the task to upload to |
| `--metadata` | Custom metadata string to attach |
| `--attachment-mode` | How the documents are attached: `search`, `context`, `archived`, or `attached` |
| `--ocr-instructions` | OCR instructions for document processing |

Calls `POST /api/v1/tasks/{task_id}/documents`.

### `pt task delete-docs`

Delete one or more documents from a task by document ID. **Destructive and irreversible** — prompts for confirmation unless `--yes` is passed.

```bash
pt task delete-docs TASK_ID DOCUMENT_ID [DOCUMENT_ID ...] [--yes]
```

Calls `DELETE /api/v1/tasks/{task_id}/documents` with the document IDs in the body.

### `pt task delete`

Delete a task. Prompts for confirmation; pass `--yes` to skip the prompt (e.g. in scripts). Aborts without calling the API if you answer no.

```bash
pt task delete TASK_ID [--yes] [--profile NAME] [--api-url URL]
```

```bash
pt task delete 99
# Delete this task? This cannot be undone. [y/N]: y
# Task 99 deleted

pt task delete 99 --yes   # no prompt
```

### `pt task duplicate`

Duplicate a task. Prints the new task as JSON.

```bash
pt task duplicate TASK_ID [--profile NAME] [--api-url URL]
```

```bash
pt task duplicate 99 | jq '.id'
```

### `pt task set-public`

Make a task public via the task public-status endpoint.

```bash
pt task set-public TASK_ID [--profile NAME] [--api-url URL]
```

### `pt task set-private`

Make a task private via the task public-status endpoint. For other task types (`group`, `system`, `catalog`), use `pt task update TASK_ID --type TYPE`.

```bash
pt task set-private TASK_ID [--profile NAME] [--api-url URL]
```

### `pt task publish`

Create a task from a conventional project directory, or synchronize the metadata into an existing task when `--task-id` is passed.

```bash
pt task publish DIRECTORY --virtual-assistant-id ID [--task-id ID] [--type TYPE] [TOGGLES] [--profile NAME] [--api-url URL]
```

`GOAL.md` is required and must not be empty. The task name defaults to the directory name and can be overridden by `.name.config`; the description defaults to the name and can be overridden by `.description.config`; optional `INITIAL_PROMPT.md` supplies the initial prompt.

| Option | Description |
|---|---|
| `--task-id` | Update this task instead of creating one |
| `--virtual-assistant-id` | Virtual assistant ID (required) |
| `--type` | Task type: `private`, `public`, `group`, `system`, `catalog` (default: `private`) |
| `--global-memory/--no-global-memory` | Enable global memory |
| `--chat-history/--no-chat-history` | Enable chat history |
| `--search-in-chat/--no-search-in-chat` | Enable search in chat |
| `--search-in-documents/--no-search-in-documents` | Enable search in documents |
| `--summary-enabled/--no-summary-enabled` | Enable summary |
| `--docs-enabled/--no-docs-enabled` | Enable documents and collections |
| `--scheduled-jobs/--no-scheduled-jobs` | Enable scheduled jobs |
| `--email-integration/--no-email-integration` | Enable email integration |
| `--share-action/--no-share-action` | Enable share action |
| `--public-chat/--no-public-chat` | Enable public chat |
| `--run-immediately/--no-run-immediately` | Run the goal immediately when the task is launched |

**Precedence:** an explicit option wins over the project's optional `task.json`, which wins over the conservative defaults. Without either, a created task is `private`, `published`, `standard` chat type, with global memory, chat history, search in chat, search in documents, summary, **documents and collections**, **scheduled jobs**, email integration, share action, and run-immediately all **disabled**, and with empty schedule, extra agents, action name, and mimetypes — so a task that needs its documents, chat history or scheduling must say so (or be fixed afterwards with [`pt task update`](#pt-task-update)).

`task.json` is a JSON object of task fields using the portable field names of `pt task export`/`pt task import` (e.g. `type`, `chat_history`, `documents_and_collections_enabled`, `scheduled_jobs_enabled`, `global_memory`, `mimetypes`, `extra`). Keys that come from the project files or options (`name`, `description`, `goal`, `initial_prompt`, `page_type`, `virtual_assistant_id`), unknown keys and `null` values are ignored; a file that is not a JSON object is an error. Only `pt task publish` reads `task.json`: `pt live-app publish` ignores it, and it is never uploaded as an app asset (a `task.json` in the project root is skipped by the artifact scan). Payloads carrying `schedule_nl`/`schedule_prompt` use the long request timeout, like `pt task create`/`update`.

```json
{ "type": "group", "chat_history": true, "documents_and_collections_enabled": true, "scheduled_jobs_enabled": true }
```

```bash
pt task publish ./tasks/morning-briefing --virtual-assistant-id 7
pt task publish ./tasks/morning-briefing --virtual-assistant-id 7 --type group --chat-history --docs-enabled --scheduled-jobs
pt task publish ./tasks/morning-briefing --task-id 99 --virtual-assistant-id 7
```

Updating (`--task-id`) PATCHes name, description, goal, initial prompt, virtual assistant and page type, **plus** every type/toggle set on the command line and **every accepted field present in `task.json`** (not only toggles — e.g. `schedule_nl`, `mimetypes`, `extra`); server fields the project does not state are left alone, so settings changed in the UI survive later re-publishing unless the project now states them.

Output is progress lines, not JSON; the task ID is on the last line.

```text
Created task 81 from tasks/morning-briefing
Task ID: 81
```

Capture the ID without letting a failure slip through the parser:

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

### `pt task launch`

Launch a task into a new chat — what the web app does when you open a task, optionally inside a chat workspace. The new chat gets the task's goal, default agent, settings, documents, collections and scheduled job, and the task's initial prompt is posted.

```bash
pt task launch TASK_ID [--workspace-id ID|UUID] [--name NAME] [--version N] [--web-url URL] [--profile NAME] [--api-url URL]
```

| Option | Description |
|---|---|
| `--workspace-id` | Chat workspace (ID or UUID) to launch the task into; omit for a top-level chat |
| `--name` | Chat name (default: the task name) |
| `--version` | Task version number to launch (default: the current task) |
| `--web-url` | Web application URL for the printed link (default: derived from the API URL, `api.` → `app.`) |

```bash
pt task launch 280 --workspace-id 738
pt task launch 280 --workspace-id ca74dfc4-eb41-4c3f-ae53-b6b1c415617f --name "Collector (CTO)"
```

Output is the created chat as JSON (`id`, `uuid`, `task_id`, `default_virtual_assistant_id`, …) followed by a `Chat URL:` line:

```text
{
  "id": 50020,
  "uuid": "132f94b9-…",
  "task_id": 280,
  ...
}
Chat URL: https://app.primethink.ai/chats/132f94b9-…
```

The same launch is available as [`pt chat create --from-task-id`](#pt-chat-create) and as the `launch_task` MCP tool. Under the hood it is `POST /api/v1/chats?copy_from_task_id=TASK_ID` — the task cannot be passed in the body (the server ignores a body `task_id`). Provisioning example — start a task in every workspace that doesn't have it yet:

```bash
# Raise --page-size (or loop over --page) if you have more than 100 workspaces / 200 chats per workspace.
for ws in $(pt workspace list --page-size 100 | jq -r 'if type == "array" then .[] else .items[] end | .id'); do
  chats=$(pt chat list --workspace-id "$ws" --page-size 200) || { echo "chat lookup failed for workspace $ws, skipping" >&2; continue; }
  present=$(printf '%s' "$chats" | jq 'if type == "array" then . else .items end | map(select(.task_id == 280)) | length') || { echo "unexpected chat list for workspace $ws, skipping" >&2; continue; }
  if [ "$present" = "0" ]; then
    pt task launch 280 --workspace-id "$ws"
  fi
done
```
A lookup or parsing failure skips the workspace instead of launching a duplicate.

### `pt task test`

Apply a task project's required `GOAL.md` to a newly created chat or an explicit existing chat. Existing chats are switched to normal chat mode.

```bash
pt task test DIRECTORY [OPTIONS]
```

| Option | Default | Description |
|---|---|---|
| `--chat-id CHAT_ID` | create | Reuse this existing chat |
| `--workspace-id ID` | unset | Workspace for a newly created chat |
| `--temporary` / `--permanent` | temporary | Lifetime of a newly created chat |
| `--open` | off | Open the resulting chat in a browser |
| `--web-url URL` | derived from API URL | Web URL used for output/opening (defaults to the active profile's API host, mapping `api.` → `app.`) |

```bash
pt task test ./tasks/morning-briefing
pt task test ./tasks/morning-briefing --chat-id CHAT_UUID --permanent
```

Omitting `--chat-id` creates a new chat on every run. `--temporary`/`--permanent` and `--workspace-id` apply only to a newly created chat and are ignored when `--chat-id` is passed. The command updates no task; re-run `pt task publish` for that.

```text
Created temporary chat 3f2a-bb…
Updated goal for chat 3f2a-bb…
Chat URL: https://app.primethink.ai/chats/3f2a-bb…
```

To keep re-testing in one chat, store its ID on the first run and pass it back afterwards (use `--permanent` for a chat you intend to keep):

```bash
# first run — create and record
out=$(pt task test ./tasks/morning-briefing --permanent) || { echo "test deploy failed"; exit 1; }
printf '%s\n' "$out"
CHAT_ID=$(printf '%s\n' "$out" | sed -n 's#^Chat URL: .*/chats/##p')
[ -n "$CHAT_ID" ] || { echo "no Chat URL in output"; exit 1; }
printf '%s\n' "$CHAT_ID" > ./tasks/morning-briefing/.chat-id

pt task test ./tasks/morning-briefing --chat-id "$(cat ./tasks/morning-briefing/.chat-id)"
```

Write the file only after checking both the status and the ID — redirecting the command
straight into `.chat-id` truncates it the moment a run fails, losing the chat you were
iterating on. The status check alone would miss a run that exits `0` without printing a
`Chat URL:` line; the ID check alone would miss a run that printed the URL and then failed.

### `pt task export`

Export a task's portable configuration as JSON, for recreating the task elsewhere with [`pt task import`](#pt-task-import). The CLI fetches the task and keeps only the fields that `pt task create` accepts (name, description, type, goal, agent reference, feature toggles, schedule, canvas, extra data, …) — server-assigned fields (id, UUID, group, owner, timestamps, image, attached documents/collections, tags) are stripped, as are unset (`null`) fields.

```bash
pt task export TASK_ID [--output FILE] [--profile NAME] [--api-url URL]
```

| Option | Description |
|---|---|
| `--output`, `-o` | Write the JSON to a file (parent directories are created) instead of stdout |

```bash
# Print to stdout / redirect into a file
pt task export 42
pt task export 42 > tasks/support_bot.json

# Or write directly to a file
pt task export 42 --output tasks/support_bot.json
```

> **Note:** `--virtual-assistant-id` and similar ID references are environment-specific. When importing into a different environment, edit them in the exported file if the target environment uses different IDs.

### `pt task import`

Create a **new** task from an exported JSON file. This is the deployment half of the export/import workflow: keep exported task files in git, then import them into another group or environment with `--profile`.

```bash
pt task import FILE [--profile NAME] [--api-url URL]
```

The file must contain a JSON object with at least `name`, `description`, and `type`; a missing `goal` defaults to `""`. Unknown and server-assigned fields are ignored, so a raw `pt task get` dump also imports cleanly. If the file contains `schedule_nl`/`schedule_prompt`, the longer 120-second timeout applies (schedule parsing runs an LLM server-side). Prints the created task as JSON.

```bash
# Recreate the task in the current environment
pt task import tasks/support_bot.json

# THE use case: deploy the same task config to another environment
pt task import tasks/support_bot.json --profile production
```

### `pt task create-version`

Snapshot the task's current state as a new named version. The CLI fetches the task, extracts its versionable fields, and posts them as version data.

```bash
pt task create-version TASK_ID [--version-name NAME] [--profile NAME] [--api-url URL]
```

| Option | Default | Description |
|---|---|---|
| `--version-name` | `Production` | Name for the new version |

```bash
pt task create-version 99
pt task create-version 99 --version-name "v2-beta"
```

### `pt task upload-image`

Upload an image file for a task (e.g. its icon/cover image). The content type is inferred from the file extension.

```bash
pt task upload-image TASK_ID FILE [--profile NAME] [--api-url URL]
```

```bash
pt task upload-image 99 ./cover.png
```

---

## Task evaluation: `pt eval`

Evaluate a task against a set of test cases (the *evaluation-data* set), then run the evaluation and inspect the results. The usual flow is: build the plan with `pt eval add`, tune it with `pt eval settings`, run it with `pt eval run`, then read `pt eval results`. Agent-vs-agent *simulations* (`pt eval simulate`) drive the task with a simulator agent to a goal. All commands take `TASK_ID` (and `--profile`/`--api-url`).

```bash
# Build and manage the evaluation-data set (test cases)
pt eval list TASK_ID
pt eval add TASK_ID --user-query Q --ideal-response R --type exact|similar|agent [--chat-group N] [--evaluator-agent-id N] [--examples JSON]
pt eval update TASK_ID EVAL_ID [--user-query …] [--ideal-response …] [--type …] [--evaluator-agent-id N] [--examples JSON]
pt eval delete TASK_ID EVAL_ID [--yes]                       # DESTRUCTIVE

# Configure how evaluations run
pt eval settings TASK_ID [--active | --inactive] [--run-time manual|daily|weekly|monthly] [--evaluator-agent-id N] [--pass-threshold 1-100] [--message-delay-ms N]

# Run an evaluation and inspect its runs/results
pt eval run TASK_ID [--version N] [--model-override M]
pt eval runs TASK_ID
pt eval run-get TASK_ID RUN_ID
pt eval results TASK_ID [--run-id N]
pt eval download TASK_ID RUN_ID [--output FILE]

# Agent-vs-agent simulations
pt eval simulate TASK_ID --simulator-agent-id N --goal G --max-turns N [--persona P] [--wait-seconds N] [--evaluation-prompt P] [--evaluator-agent-id N] [--version N]
pt eval simulations TASK_ID
pt eval delete-simulation TASK_ID SIM_ID [--yes]             # DESTRUCTIVE
```

| Command | Endpoint | MCP tool |
|---|---|---|
| `list` | `GET /api/v1/tasks/{id}/evaluation-data` | `list_task_evaluations` |
| `add` | `POST /api/v1/tasks/{id}/evaluation-data` | `add_task_evaluation` |
| `update` | `PATCH /api/v1/tasks/{id}/evaluation-data/{eval_id}` | `update_task_evaluation` |
| `delete` | `DELETE /api/v1/tasks/{id}/evaluation-data/{eval_id}` | `delete_task_evaluation` |
| `settings` | `PATCH /api/v1/tasks/{id}/evaluation-settings` | `set_task_evaluation_settings` |
| `run` | `POST /api/v1/tasks/{id}/evaluation` | `run_task_evaluation` |
| `runs` | `GET /api/v1/tasks/{id}/evaluations/runs/` | `list_task_evaluation_runs` |
| `run-get` | `GET /api/v1/tasks/{id}/evaluations/runs/{run_id}` | `get_task_evaluation_run` |
| `results` | `GET /api/v1/tasks/{id}/evaluation_results` | `get_task_evaluation_results` |
| `download` | `GET /api/v1/tasks/{id}/evaluations/runs/{run_id}/download` | `download_task_evaluation_run` |
| `simulate` | `POST /api/v1/tasks/{id}/simulations` | `run_task_simulation` |
| `simulations` | `GET /api/v1/tasks/{id}/simulations` | `list_task_simulations` |
| `delete-simulation` | `DELETE /api/v1/tasks/{id}/simulations/{sim_id}` | `delete_task_simulation` |

`--pass-threshold` is the minimum score that counts as a pass, as a whole-number percentage from 1 to 100 (`80`, not `0.8`); the CLI rejects anything outside that range with a usage error before any request is made. `--type` for a test case is `exact` (exact-match), `similar` (fuzzy/semantic match), or `agent` (an evaluator agent judges the response). `--examples` takes a JSON object of good/bad example fields. `--chat-group` (default `1`) groups related test cases.

```bash
# Build a two-case plan, make it evaluator-judged and daily, then run it
pt eval add 99 --user-query "What's your return window?" --ideal-response "30 days" --type similar
pt eval add 99 --user-query "Refund a gift?" --ideal-response "Yes, store credit" --type agent --evaluator-agent-id 7
pt eval settings 99 --active --run-time daily --evaluator-agent-id 7 --pass-threshold 80
pt eval run 99
pt eval results 99 | jq '.[] | {case, passed, score}'
```

---

## Search: `pt search`

Semantic (vector) search across documents, a chat, a collection, or chat messages. All four commands share the same tuning options:

| Option | Description |
|---|---|
| `--search-type` | `mmr` (server default), `similarity`, or `similarity_score_threshold` |
| `--top-k` | Number of top results to return |
| `--score-threshold` | Minimum similarity score threshold |

### `pt search documents`

Semantic search across documents in a vector store collection.

```bash
pt search documents QUERY --collection-name NAME [TUNING OPTIONS] [--profile NAME] [--api-url URL]
```

| Option | Required | Description |
|---|---|---|
| `--collection-name` | yes | Vector store collection name to search within |

```bash
pt search documents "refund policy" --collection-name kb
pt search documents "refund policy" --collection-name kb --search-type similarity --top-k 3
```

### `pt search chat`

Semantic search within one chat — its messages and, optionally, its documents and collections.

```bash
pt search chat CHAT_ID QUERY [TUNING OPTIONS] [SCOPE TOGGLES] [--profile NAME] [--api-url URL]
```

Scope toggles (unset toggles are left to server defaults):

| Option | Description |
|---|---|
| `--in-chat/--no-in-chat` | Search messages in the chat and its workspaces |
| `--in-documents/--no-in-documents` | Search in documents |
| `--in-collections/--no-in-collections` | Search in collections |

```bash
pt search chat 123 "what did we decide about the deadline"
pt search chat 123 "quarterly numbers" --no-in-chat --in-documents --top-k 10
```

### `pt search collection`

Semantic search within a collection's documents.

```bash
pt search collection COLLECTION_ID QUERY [TUNING OPTIONS] [--metadata JSON] [--profile NAME] [--api-url URL]
```

| Option | Description |
|---|---|
| `--metadata` | Metadata filter as a JSON object; supported keys: `document_id`, `document_name`, `extra` |

```bash
pt search collection 42 "termination clause"
pt search collection 42 "termination clause" --metadata '{"document_name": "contract.pdf"}'
```

### `pt search messages`

Semantic search across chat messages, optionally filtered to one chat, user, or agent.

```bash
pt search messages QUERY --collection-name NAME [FILTERS] [TUNING OPTIONS] [--profile NAME] [--api-url URL]
```

| Option | Required | Description |
|---|---|---|
| `--collection-name` | yes | Vector store collection name to search within |
| `--chat-id` | no | Filter by chat ID |
| `--user-id` | no | Filter by user ID |
| `--agent-id` | no | Filter by agent (virtual assistant) ID |

```bash
pt search messages "standup notes" --collection-name msgs --user-id 2
```

### `pt search images`

Search a collection's images by an example image, a text query, or both. At least one of `--image`/`--query` is required.

```bash
pt search images COLLECTION_ID [--image FILE] [--query TEXT] [--search-type …] [--top-k N] [--score-threshold F]
```

| Option | Description |
|---|---|
| `--image` | Local image file to search by |
| `--query` | Text query |
| `--search-type`, `--top-k`, `--score-threshold` | Shared search-tuning options |

Calls `POST /api/v1/collections/{collection_id}/search/images` (the image is sent multipart; the query as a form field). MCP tool: `search_collection_images`.

```bash
pt search images 42 --query "a red sports car"
pt search images 42 --image ./example.jpg --top-k 5
```

---

## Images: `pt image`

### `pt image generate`

Generate an image with AI text-to-image and save it to a local file. The response is validated to actually be an image (PNG/JPEG/GIF/WebP) before writing.

```bash
pt image generate --prompt "PROMPT" --output PATH [--style STYLE] [--size WxH] [--profile NAME] [--api-url URL]
```

| Option | Required | Default | Description |
|---|---|---|---|
| `--prompt` | yes | — | Image generation prompt |
| `--output`, `-o` | yes | — | Output file path (parent directories are created) |
| `--style` | no | `realistic` | Image style |
| `--size` | no | `1024x1024` | Image size |

```bash
pt image generate --prompt "A lighthouse at dawn, watercolor" -o lighthouse.png
pt image generate --prompt "Team logo, minimal, flat" --style illustration --size 512x512 -o logo.png
```

> The saved file's extension is corrected to match the format the API actually
> returns. If you ask for `lighthouse.png` but the API returns a JPEG, the file
> is written as `lighthouse.jpg` and the command prints a note. Extensions that
> already name the returned format (e.g. `.jpeg` for a JPEG) are left as-is.

---

## Voice: `pt voice`

Media processing over audio. These involve server-side AI work and use the longer 120s timeout.

```bash
pt voice stt FILE                                    # transcribe (speech-to-text)
pt voice translate FILE                              # translate spoken audio to English text
pt voice diarize FILE [OPTIONS]                      # identify who spoke when
pt voice tts --text TEXT [OPTIONS] [-o FILE]         # synthesize speech
```

| `pt voice tts` option | Description |
|---|---|
| `--text` | Text to synthesize (required) |
| `--voice` / `--model` / `--provider` | Voice, model, and provider |
| `--speed` | Speech speed |
| `--instructions` | Style instructions |
| `--folder` | Folder to store the audio in |
| `--output`, `-o` | Save the audio here (default `tts.mp3`) when the API returns audio; otherwise the JSON response is printed |

| `pt voice diarize` option | Description |
|---|---|
| `--speaker-count` | Expected number of speakers |
| `--speaker-name` / `--speaker-file` | A known speaker's name / reference audio |
| `--extra-instructions` | Extra instructions |
| `--collection-id` / `--save-mode` | Where/how to save results |

Endpoints: `POST /api/v1/voice/{stt,tts,diarize,translate}`. MCP tools: `transcribe_audio`, `text_to_speech`, `diarize_audio`, `translate_audio`.

```bash
pt voice stt meeting.m4a
pt voice tts --text "Welcome aboard" --voice nova -o welcome.mp3
pt voice diarize call.wav --speaker-count 2
```

## Video: `pt video`

### `pt video analyze`

Analyze a video file.

```bash
pt video analyze FILE [--extra-instructions "…"]
```

Calls `POST /api/v1/video/analyze`. MCP tool: `analyze_video`.

---

## MCP Server (`pt mcp`)

`pt mcp` runs PrimeThink as a [Model Context Protocol](https://modelcontextprotocol.io) server over stdio. It exposes the same API surface as the CLI — reusing the CLI's connection, auth, and HTTP code — so MCP clients (Claude Code, Claude Desktop, and other MCP-compatible tools) can call PrimeThink directly instead of shelling out to `pt`.

### Installation

The MCP SDK is an **optional** dependency, so CLI-only installs stay lean:

```bash
pip install 'primethink-cli[mcp]'   # requires Python 3.10+ (the core CLI supports 3.8+)
pt mcp                              # serve over stdio
```

If the `mcp` package isn't installed, `pt mcp` prints an install hint and exits 1.

### Authentication

The server authenticates exactly like the CLI: the same profiles and environment variables (`PRIMETHINK_TOKEN`, `PRIMETHINK_API_URL`, `PRIMETHINK_PROFILE`, `PRIMETHINK_CONFIG_PATH`). Set `PRIMETHINK_TOKEN` in the client's server config, or rely on the configured active profile in `~/.primethink/config.json`. Every tool also accepts optional `profile` and `api_url` arguments to override the connection per call.

> **Set `PRIMETHINK_API_URL` when you set `PRIMETHINK_TOKEN`.** If you provide only the token, the server defaults to the **production** API (`https://api.primethink.ai`). A token issued for another environment (dev/staging) then talks to the wrong host and fails with confusing `500`s. At startup `pt mcp` logs the resolved API URL to **stderr** (never stdout, which is the JSON-RPC channel) and warns when the URL was defaulted — check that line if calls fail unexpectedly.

### Client configuration

Point an MCP client's server config at `pt mcp`:

```json
{
  "mcpServers": {
    "primethink": {
      "command": "pt",
      "args": ["mcp"],
      "env": { "PRIMETHINK_TOKEN": "your-api-token" }
    }
  }
}
```

### Tools

Core API management commands have tool equivalents; local scaffolding and the project publish/test orchestration commands remain CLI workflows. Tool names are snake_case (e.g. the CLI's `pt chat send` → the `send_message` tool, `pt chat list` → `list_chats`):

| Group | Tools |
|---|---|
| General | `whoami` (returns `user`, `groups`, `active_group`, and `configured_providers`) |
| Messaging & actions | `send_message`, `list_task_actions`, `execute_task_action` |
| Chats | `list_chats`, `create_chat`, `rename_chat`, `set_chat_goal`, `list_chat_messages`, `archive_chat`, `unarchive_chat`, `delete_chat`, `list_chat_files`, `upload_chat_files`, `download_chat_file`, `delete_chat_file`, `upload_chat_text`, `list_chat_users`, `invite_chat_members`, `remove_chat_members`, `edit_message`, `delete_message`, `clear_chat_messages`, `retry_message`, `export_message`, `save_chat_as_task`, `sync_chat_to`, `sync_chat_from`, `sync_chat` |
| ChatDB | `chatdb_init`, `chatdb_list`, `chatdb_get_entity`, `chatdb_add_entity`, `chatdb_update_entity`, `chatdb_delete_entity` |
| Chat workspaces | `list_chat_workspaces`, `create_chat_workspace`, `rename_chat_workspace`, `set_chat_workspace_goal`, `archive_chat_workspace`, `pin_chat_workspace`, `add_chat_to_workspace`, `remove_chat_from_workspace`, `delete_chat_workspace` |
| Tags | `list_tags`, `create_tag`, `assign_tags` |
| Groups | `list_groups`, `get_group`, `create_group`, `update_group`, `delete_group`, `list_group_members`, `remove_group_members`, `invite_to_group`, `add_agents_to_group`, `remove_agents_from_group` |
| Settings | `list_settings`, `get_setting`, `set_setting`, `delete_setting` |
| Users | `list_users`, `search_users` |
| Notifications | `list_notifications`, `get_unread_notification_count`, `mark_notification_read`, `mark_notification_unread`, `mark_all_notifications_read`, `delete_notification` |
| Scheduled jobs | `list_scheduled_jobs`, `create_scheduled_job`, `update_scheduled_job`, `set_scheduled_job_status`, `delete_scheduled_job` |
| Directories | `create_directory`, `delete_directory`, `move_directory`, `rename_directory` (each takes `owner_type` = chat/collection/task/agent) |
| Document versions | `list_document_versions`, `create_document_version`, `create_document_text_version`, `set_production_version`, `delete_document_version` (each takes `owner_type` = chat/collection/task) |
| Collections | `list_collections`, `create_collection`, `get_collection`, `update_collection`, `reindex_collection`, `copy_collection`, `delete_collection`, `delete_collection_file`, `list_collection_files`, `upload_collection_files`, `upload_collection_text`, `download_collection_file`, `sync_collection_to`, `sync_collection_from` |
| Tasks | `list_tasks`, `create_task`, `update_task`, `get_task`, `upload_task_text`, `add_task_documents`, `delete_task_documents`, `export_task`, `delete_task`, `duplicate_task`, `launch_task` (start a task in a new chat, optionally in a workspace — `create_chat` also takes `from_task_id`), `publish_task`, `unpublish_task`, `import_task`, `create_task_version`, `upload_task_image` |
| Task evaluation | `list_task_evaluations`, `add_task_evaluation`, `update_task_evaluation`, `delete_task_evaluation`, `set_task_evaluation_settings`, `run_task_evaluation`, `list_task_evaluation_runs`, `get_task_evaluation_run`, `get_task_evaluation_results`, `download_task_evaluation_run`, `run_task_simulation`, `list_task_simulations`, `delete_task_simulation` |
| Agents | `list_agents`, `get_agent`, `create_agent`, `update_agent`, `delete_agent`, `list_agent_types`, `list_agent_documents`, `upload_agent_documents`, `attach_agent_collections`, `detach_agent_collection`, `upload_agent_image`, `delete_agent_image` |
| Capabilities | `list_capabilities`, `create_capability`, `update_capability`, `delete_capability`, `archive_capability`, `duplicate_capability`, `resolve_capabilities` |
| Model catalog | `list_models`, `list_embedding_models` |
| Search | `search_documents`, `search_chat`, `search_collection`, `search_messages`, `search_collection_images` |
| Images | `generate_image` |
| Voice & video | `transcribe_audio`, `text_to_speech`, `diarize_audio`, `translate_audio`, `analyze_video` |

Notes:

- **`create_task`/`update_task` and `create_agent`/`update_agent`** expose the most common fields as typed arguments plus an `extra_fields` object for any remaining API field (e.g. `canvas`, `page_type`, `tag_ids`, the `*_enabled` toggles, `extra`). Nothing from the CLI is lost.
- **File and sync tools** (`upload_*`, `download_*`, `sync_*`, `export_task`, `import_task`, `upload_task_image`, `generate_image`) operate on the filesystem where the server runs — the user's machine, for a locally launched stdio server. Sync tools return their per-file progress as text.
- **`list_agents`, `list_models`, and `list_embedding_models`** return a trimmed summary of each record by default (full records can exceed a client's token budget); pass `detail=true` for the complete records. Use a model's `id` field as the model string for `create_agent`.
- **Destructive tools** (`delete_chat`, `delete_chat_file`, `delete_message`, `clear_chat_messages`, `delete_task`, `delete_task_documents`, `delete_agent`, `delete_agent_image`, `delete_collection`, `delete_collection_file`, `delete_capability`, `delete_scheduled_job`, `delete_chat_workspace`, `delete_group`, `delete_setting`, `delete_notification`, `delete_task_evaluation`, `delete_task_simulation`, `delete_directory`, `delete_document_version`, `chatdb_delete_entity`) execute immediately — unlike the CLI they do not prompt — so the MCP client is responsible for any confirmation.
- **Errors** are returned as MCP tool errors (a bad status becomes `Error: <status> - <body>`); the server never writes to stdout or exits the process on a per-call failure.

---

## Exit Codes and Errors

- **`0`** — success.
- **`1`** — runtime failure: missing/unknown profile, connection error, non-success HTTP status, unavailable template, unsafe archive, or filesystem failure.
- **`2`** — command-line usage error, such as an invalid option value or `--flowbite` combined with `--no-tailwind`.

Exceptions: the **sync commands** (`sync-to` / `sync-from` / `sync`) treat per-file failures as non-fatal — they report each failure, keep going, and print a `Sync complete: … M failed` summary. The two-way `pt chat sync` is stricter about listings: if it cannot fully list the remote tree, it aborts with exit 1 before transferring anything.

Common error messages:

| Message | Meaning / fix |
|---|---|
| `Error: No active profile. Use 'pt profile add' to set one up.` | Run `pt profile add --token …` |
| `Error: Profile 'X' not found.` (plus a list of available profiles) | Check `pt profile list`, then `pt profile use` or `--profile` an existing one |
| `Error connecting to API: …` | Network problem or wrong `--api-url` |
| `Error: <status> - <body>` | The API rejected the request; the body usually explains why |

## Timeouts

- Standard requests time out after **30 seconds**.
- Requests that trigger slow server-side work use a **120-second** timeout: `pt image generate`, `pt task create`/`update` when `--schedule-nl` or `--schedule-prompt` is set, and `pt task import` when the imported file contains `schedule_nl` or `schedule_prompt` (natural-language schedules are parsed by an LLM server-side).

# Known gaps, gotchas & workarounds

Battle-tested notes for admin automation. These are the things that silently
cost hours.

## Environment & identity
- **Prod and dev are different databases.** Same-named objects have **different
  numeric IDs** (e.g. capability `Documents` = 25 on prod, 33 on dev; agent-type
  and group IDs differ too). **Always resolve IDs by name/code at runtime**, never
  hardcode across environments.
- **`PRIMETHINK_TOKEN` set (no `PRIMETHINK_API_URL`) resolves the API URL from the
  active profile / default.** For `pt mcp` configured with only a token this can
  silently point at the wrong environment. Set `PRIMETHINK_API_URL` explicitly.
- **REST auth header is `Authorization: Token <api_key>`** (not Bearer / X-API-Key).
- **The active group is decisive and was previously invisible.** `pt whoami` now
  reports `active_group` (id+name) and `configured_providers` — check it before any
  create. Objects land in the token's active group.

## Provider keys / models
- A model only works if its **provider key is configured** — at **group** scope
  (shared with the whole team; needs `edit_group_variables`, i.e. group admin) **or**
  **user** scope (your personal key, used when you're the actor, no admin needed).
  **Choose by ownership** — a shared org key → group; a personal key → user. Group
  vars override user vars of the same name.
- Check with `pt models list --only-configured` and `provider_configured` per model.
- `pt settings list` **masks secret values** (shows set/not-set), by design.

## Agents & capabilities  (CLI v1.4.1)
- `pt agent create/update` now take **`--capability <code>` (repeatable)** and
  resolve codes → env-specific ids for you — use it, don't hand-assign ids.
- **An agent created with no `--capability` has an empty capability set** — always
  pass the ones it needs.
- `pt capability resolve <codes…>` previews code→id for the active group. It may
  leave some **user-scoped internal codes unresolved** (e.g. `rag`) even though they
  are assignable by id — so always **read the agent back** (`pt agent get <id> |
  jq '.capabilities[].code'`) to confirm what actually landed.
- A **non-default, group-scoped capability the group hasn't enabled** (e.g. `rag_messages`) is
  still dropped by the server on assign, but no longer *silently*: since CLI 1.4.1 the response
  carries `warnings: ["capabilities not applied (not available for this group?): […]"]`. Check
  the warnings, and use the read-back to confirm what landed.
- Setting the group default agent is `pt settings set default_agent <id> --scope group`.

## Notifications
- **Reading notifications:** use `pt notification list` / `unread-count` / `mark-read` /
  `mark-unread` / `mark-all-read` / `delete` (added in CLI 1.4.1). The REST equivalents, if
  you need them directly:
  `GET /api/v1/notifications?page=1&page_size=50` with `Authorization: Token <key>`.
  Payload keys: `id, user_id, title, text, unread, chat_id, chat_uuid,
  chat_message_id, group_id, parent_chat_*, created_at`. Also
  `GET /api/v1/notifications/unread-count`.
- Notifications are **user-level and tie to `chat_id`/`group_id`, not a workspace**.
  To filter "by workspace", build a `chat_id → workspace` map (from
  `pt chat list --workspace-id …`) and join.
- **Sending** notifications programmatically isn't exposed via CLI/REST — only a
  Live App's `pt.sendNotification`. (This skill's report proposes adding a
  `pt notification` command.)

## Task / document quirks
- `task_type` accepts `private|public|group|system|catalog`; `pt task set-public`/
  `set-private` only toggle public↔private — use `pt task update --type catalog`.
- Document version names must be `Production` or `Draft` (arbitrary strings 422).
- Live-app deploy artifacts must be flat; nested files are rejected.

## Tasks & the Deep1 sandbox (task-based automations)
- `pt task publish` accepts `--type` and the feature toggles directly since CLI 1.5.0, and
  reads an optional `task.json` from the project dir (option > `task.json` > defaults). On
  **older CLIs** everything defaulted to false and needed a follow-up
  `pt task update <id> --chat-history --docs-enabled --scheduled-jobs`.
- Launching a task (UI) creates a chat with `task_id`/`from_task_id`, **copies the goal**
  (later task edits don't propagate — `pt chat goal` existing chats) and links the
  task's documents (same document ids). There is **no CLI/REST route** to launch a task
  into a workspace; `POST /api/v1/chats` ignores `task_id`/`from_task_id`.
- Deep1 `/sandbox`: **task-linked documents are not mounted**; only chat uploads are.
  Fetch what you need via `GET /api/v1/documents/{id}/download` with the injected
  `PT_TOKEN` (`GET /api/v1/chats/{id}/documents` lists them). The sandbox **persists
  between turns** — re-fetch scripts every run. The agent's `description` takes
  precedence over the chat goal when they conflict.
- Re-uploading a same-named doc to a task → 500; `pt task delete-docs` then `add-docs`.
  Deleting a task doc does **not** remove it from chats already launched from the task.
- `pt chat send` returns before a sandbox run completes — poll ChatDB for the result.

## MCP-layer quirks (if you use `pt mcp` instead of the CLI)
- Some endpoints return **HTTP 204 / empty body on success**; older MCP builds
  surfaced these as errors (`assign_tags` → "Error: 204 -", `set_production_version`
  → "Expecting value…"). Treat empty 2xx as success.
- `list_agents` full records are large — use the summary form.
- A handful of endpoints historically 500'd (`delete_task`, by-name
  `search_documents`/`search_messages`, `execute_task_action`) — verify on your
  build; these were fixed in later versions.

## Roles / audit / bulk (not available)
- No roles CRUD, no audit-log access, no bulk delete via CLI. Roles are referenced
  by id in `pt group invite --role-id`.

## Closed in v1.4.1 ✅
- `pt whoami` → `active_group {id,name}` + `configured_providers`.
- `pt agent create/update --capability <code>` (repeatable) + `pt capability resolve`.
- `pt agent upload-image/delete-image`; `pt chat invite-members --email`.
- `pt eval …` (task evaluation: plan → run → results, + simulations).
- **`pt notification`** — `list`, `unread-count`, `mark-read`, `mark-unread`,
  `mark-all-read`, `delete`. (Verified read/unread round-trip.)

## Closed in v1.5.0 ✅
- **`pt task launch TASK_ID [--workspace-id ID|UUID]`** — launches a task into a new chat the
  way the web app does; `pt chat create --from-task-id` does the same generically.
- **`pt task publish` task type and feature toggles** — `--type` plus the eleven `--…/--no-…`
  toggles, and an optional `task.json` in the project dir (option > `task.json` > defaults).
  Publishing no longer needs a follow-up `pt task update`.
- **Warnings when a capability is dropped** — the create/update response carries
  `warnings: ["capabilities not applied (not available for this group?): […]"]` instead of the
  assignment diverging unremarked.

## Closed on the platform ✅
- **"Document 'None' has been added to the chat"** on task launch — fixed by primethink-api#606,
  which sets per-link document names when documents are linked by id (the same bug also made
  task documents unreachable in the Deep1 sandbox).

## Still open
1. **Notification send** — no CLI/REST endpoint; only a Live App's `pt.sendNotification`.
2. **`pt capability resolve`** doesn't resolve some user-scoped internal codes (e.g.
   `rag` → unresolved, while `documents`/`rag_documents` resolve). Always verify with
   `pt agent get`.
3. Roles CRUD / audit logs / bulk delete.
4. **Launch a task into a workspace** via CLI/API. `pt task launch TASK_ID --workspace-id ID`
   shipped in CLI 1.5.0, so this is closed for the common case; what remains is bulk
   auto-provisioning across many workspaces.

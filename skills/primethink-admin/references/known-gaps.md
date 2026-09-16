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
- **The active group is decisive.** `pt whoami` reports `active_group` (id+name) and
  `configured_providers` — check it before any create. Objects land in the token's active
  group.

## Provider keys / models
- A model only works if its **provider key is configured** — at **group** scope
  (shared with the whole team; needs `edit_group_variables`, i.e. group admin) **or**
  **user** scope (your personal key, used when you're the actor, no admin needed).
  **Choose by ownership** — a shared org key → group; a personal key → user. Group
  vars override user vars of the same name.
- Check with `pt models list --only-configured` and `provider_configured` per model.
- `pt settings list` **masks secret values** (shows set/not-set), by design.

## Agents & capabilities
- `pt agent create/update` take **`--capability <code>` (repeatable)** and resolve codes →
  env-specific ids for you — use it, don't hand-assign ids.
- **An agent created with no `--capability` has an empty capability set** — always
  pass the ones it needs.
- `pt capability resolve <codes…>` previews code→id for the active group. It may
  leave some **user-scoped internal codes unresolved** (e.g. `rag`) even though they
  are assignable by id — so always **read the agent back** (`pt agent get <id> |
  jq '.capabilities[].code'`) to confirm what actually landed.
- A **non-default, group-scoped capability the group hasn't enabled** (e.g. `rag_messages`) is
  dropped by the server on assign. The response says so in
  `warnings: ["capabilities not applied (not available for this group?): […]"]` — check it, and
  use the read-back to confirm what landed.
- Setting the group default agent is `pt settings set default_agent <id> --scope group`.

## Notifications
- **Reading notifications:** use `pt notification list` / `unread-count` / `mark-read` /
  `mark-unread` / `mark-all-read` / `delete`. The REST equivalents, if you need them directly:
  `GET /api/v1/notifications?page=1&page_size=50` with `Authorization: Token <key>`.
  Payload keys: `id, user_id, title, text, unread, chat_id, chat_uuid,
  chat_message_id, group_id, parent_chat_*, created_at`. Also
  `GET /api/v1/notifications/unread-count`.
- Notifications are **user-level and tie to `chat_id`/`group_id`, not a workspace**.
  To filter "by workspace", build a `chat_id → workspace` map (from
  `pt chat list --workspace-id …`) and join.
- **Sending** a notification isn't exposed via CLI/REST — only a Live App's
  `pt.sendNotification`.

## Task / document quirks
- `task_type` accepts `private|public|group|system|catalog`; `pt task set-public`/
  `set-private` only toggle public↔private — use `pt task update --type catalog`.
- Document version names must be `Production` or `Draft` (arbitrary strings 422).
- Live-app deploy artifacts must be flat; nested files are rejected.

## Tasks & the Deep1 sandbox (task-based automations)
- `pt task publish` takes `--type` and the feature toggles directly, and reads an optional
  `task.json` from the project dir. Precedence: option > `task.json` > defaults.
- Launch a task with `pt task launch TASK_ID [--workspace-id ID|UUID]` (or
  `pt chat create --from-task-id TASK_ID`). It creates a chat that **copies the goal** — later
  task edits don't propagate, so `pt chat goal` existing chats — and links the task's documents
  by the same ids. Note a bare `POST /api/v1/chats` ignores a body `task_id`; the launch goes
  through `?copy_from_task_id=`.
- Deep1 `/sandbox`: **task-linked documents are not mounted**; only chat uploads are.
  Fetch what you need via `GET /api/v1/documents/{id}/download` with the injected
  `PT_TOKEN` (`GET /api/v1/chats/{id}/documents` lists them). The sandbox **persists
  between turns** — re-fetch scripts every run. The agent's `description` takes
  precedence over the chat goal when they conflict.
- Re-uploading a same-named doc to a task → 500; `pt task delete-docs` then `add-docs`.
  Deleting a task doc does **not** remove it from chats already launched from the task.
- `pt chat send` returns before a sandbox run completes — poll ChatDB for the result.

## MCP-layer quirks (if you use `pt mcp` instead of the CLI)
- Some endpoints return **HTTP 204 / empty body on success** (`assign_tags`,
  `set_production_version`). Treat an empty 2xx as success, not a parse failure.
- `list_agents` full records are large — use the summary form.
- If `delete_task`, by-name `search_documents`/`search_messages` or `execute_task_action`
  return a 500, check the API version you are pointed at — these have been fixed, so a 500
  means an older deployment.

## Not available

Things with no CLI or REST path — reach for a different approach rather than hunting for a flag.

- **Sending a notification.** Only a Live App can, via `pt.sendNotification`. Reading and
  marking them is covered by `pt notification`.
- **Roles CRUD, audit logs, bulk delete.** Roles are referenced by id in
  `pt group invite --role-id`.
- **Bulk task provisioning across many workspaces.** `pt task launch TASK_ID --workspace-id ID`
  handles one at a time; loop it yourself.
- **`pt capability resolve` does not resolve some user-scoped internal codes** (`rag` comes back
  unresolved while `documents` / `rag_documents` resolve). They are still assignable by id —
  verify with `pt agent get`.

# Activity collectors (workspace + group)

Cross-workspace activity monitoring. Two implementations, both proven:

## A. Task-based (Deep1 agent runs a sandbox script) — RECOMMENDED, no stored secrets
A **Deep1** agent has a `/sandbox` (Python 3.12 + network) and the platform injects
`PT_TOKEN`, `PT_BASE_URL`, `PT_CHAT_ID`, `PT_CHAT_UUID`, `PT_GROUP_ID`, `PT_AGENT_ID`,
`PT_USER_ID`, `PT_TURN_ID` into it. The collector is therefore a **published Task**
that any user launches into a workspace from the UI:

1. **Agent** (Deep1, e.g. `openai:gpt-5.6-sol`, no capabilities needed): "Workspace
   Activity Collector". Its description defers to the chat goal for the exact command
   and forbids anything else (it refuses diagnostics — by design).
2. **Task** (`pt task publish <dir> --virtual-assistant-id <agent>`, then
   `pt task update <id> --type group --chat-history --docs-enabled --scheduled-jobs`)
   with `collector_sandbox.py` attached (`pt task add-docs`). `GOAL.md` step 1 is a
   **bootstrap heredoc** the agent runs verbatim: it lists the chat's documents,
   downloads the newest `collector_sandbox.py` (`GET /api/v1/documents/{id}/download`
   with the injected token), runs it, and prints its JSON.
3. **Launch**: a user opens the task inside a workspace → the platform creates a chat
   with `task_id`/`from_task_id`, copies the goal, sets the agent as default VA and
   links the task's document. Say "Collect now." — the script derives the workspace
   from `PT_CHAT_ID`, diffs since the last run and writes into THIS chat:
   `workspace_rollup`, `chat_activity` (with author names, newest excerpts, live-app
   ChatDB per-entity new/updated counts + record previews), `notification` entities,
   a detailed `report_<date>.md`, and advances `state.last_checked`.
4. `pt scheduled-job create --chat-id <id> --schedule-prompt "Collect now." --schedule-nl "every day at 6am"`.
5. **Live apps** in the workspace are handled by diffing their **ChatDB** (their
   transcript is mostly hidden messages): `POST /chats/{id}/chatdb/list {"limit":500}`
   → group by `entity_name`, compare `created_at`/`updated_at` with the checkpoint.

Test the script locally with the same env the sandbox gets — plus two hooks:
`PT_DRY_RUN=1` (no writes, report to stdout) and `PT_SINCE_OVERRIDE=""` (full history).

> Gotchas (all hit on prod, 2026-09-13):
> - **Task-linked documents are NOT mounted at `/sandbox/<name>`** — only files
>   uploaded directly to the chat are. Hence the download bootstrap (works for both).
>   The launch also posts "Document 'None' has been added to the chat" (platform bug).
> - **The sandbox persists between turns**: a file you downloaded once stays there,
>   so always re-fetch (don't "fetch if missing") or you run a stale script.
> - **The agent's `description` wins over the chat goal** when they conflict — keep
>   the command in ONE place (the goal) and make the agent description point to it.
> - **A launched chat copies the task goal at creation** — updating the task doesn't
>   update existing chats; `pt chat goal <id> --goal-file GOAL.md` them too.
> - On CLI < 1.5.0, `pt task publish` hard-coded `chat_history`, `documents_and_collections_enabled`,
>   `scheduled_jobs_enabled` (and more) to **false** — set them with `pt task update`.
> - `pt chat send` returns before the sandbox run finishes — poll `state.last_checked`.
> - Timestamps differ: messages `…T…Z`, ChatDB `YYYY-MM-DD HH:MM:SS+00:00` — normalise.
> - Chat-list workspace filter is **`chat_workspace_id`** (detail uses `workspace_id`);
>   ChatDB REST = POST `/chats/{id}/chatdb/list`, POST/PATCH(`entity_id`)/DELETE
>   `/chats/{id}/chatdb/entities`; `POST /chats/{id}/texts` takes a **list**.
> - **No CLI/REST route to launch a task into a workspace** (`POST /chats` ignores
>   `task_id`/`from_task_id`) — provisioning is a UI step; the group collector can only
>   report workspaces without a collector (detect by `task_id == <collector task>`).
> - The `sandbox` *capability* (id 28) is unrelated — Deep1 provides the sandbox.

## B. External CLI/REST engine + Live App front-end (no sandbox needed)
Older/alternative approach — an external script (admin token) collects and writes
the same ChatDB entities; a Live App renders the dashboard. Use if you can't run a
Deep1 sandbox. Because in-product agents historically couldn't call the CLI, and a
Live App's `pt` API is chat-scoped, collection runs **externally** and writes into a
per-workspace **collector chat**; a Live App renders the dashboard + mini-chat.

## Architecture

```
                 ┌─────────────────────── external (admin token, scheduled) ──────────────────────┐
 group_collector.py ─▶ for each workspace:  workspace_collector.py
        │                                        │  reads chats+messages (pt chat …) + notifications (REST)
        │                                        │  diffs since last_checked (from collector-chat ChatDB)
        │                                        │  writes: ChatDB rollup + report_<date>.md into collector chat
        ▼                                        ▼
 group dashboard chat  ◀── aggregates rollups ── per-workspace "Workspace Activity Collector" chat
 (Live App: overview + drill-down + mini-chat)     (Live App: workspace dashboard + mini-chat)
```

- **Collector chat** (one per workspace): a chat placed *in* the workspace named
  `Workspace Activity Collector`, holding the ChatDB state + the dashboard Live App.
- **Detection marker** (group collector uses this to know a workspace has a
  collector): match by **chat name** `Workspace Activity Collector` **and** a
  ChatDB marker entity `collector_meta` (`{kind:"workspace_collector", version, workspace_id}`).
  `task_id` is also present on chats — if collectors are instantiated from a shared
  "Workspace Collector" task, you can match on that `task_id` instead.

## Workspace collector — what it does per run
1. Ensure the collector chat exists in the workspace (create if missing; write the
   `collector_meta` marker + `state` entity with `last_checked=null`).
2. Read `last_checked` from ChatDB (`pt chatdb list <chat> --entity state`).
3. List the workspace's chats (`pt chat list --workspace-id <ws> --page-size 100`),
   **excluding the collector chat itself**.
4. For each chat, find messages after `last_checked` (use `last_updated_at` to skip
   quiet chats; `pt chat messages <id>` for detail), compute counts, last activity,
   and a short highlight (optionally an AI summary via a cheap model).
5. Pull notifications (REST `GET /notifications`), keep those whose `chat_id` is in
   this workspace (join via the chat list).
6. Write a rollup: one `workspace_rollup` entity (totals) + one `chat_activity`
   entity per active chat + `notification` entities, into the collector chat's ChatDB.
7. Write `report_<YYYY-MM-DD>.md` (human digest of the changes) into the collector
   chat's files.
8. Update `state.last_checked = now`.

Incremental by design: each run only reports **changes since last_checked**, so
nightly runs are cheap.

## Group collector — what it does
1. `pt workspace list --page-size 100` → all workspaces.
2. For each, look for the collector chat (name + `collector_meta` marker via
   `pt chat list --workspace-id` + `pt chatdb list`).
3. **Present** → read its `workspace_rollup` from ChatDB and add to the aggregate.
   **Missing** → (default) record as "no collector"; (with `--provision`) create the
   collector chat + run the workspace collector once to seed it.
4. Write the aggregate into a **group dashboard chat** ChatDB (`group_rollup` +
   per-workspace `workspace_summary` entities) and a `group_report_<date>.md`.
5. The group dashboard Live App renders the overview, lets you drill into a
   workspace, and offers a mini LLM chat over the collected data.

## Safety / rollout
- **Default is non-destructive:** the group collector only *reads*; provisioning
  collectors into every workspace is behind `--provision` (and can be limited to a
  list of workspace ids for testing). Don't blanket-provision production without a
  go-ahead.
- Use a **cheap model** (e.g. Gemini Flash / Luna) for highlight summaries; skip
  summaries with `--no-ai` to avoid cost.
- Store only rollups/summaries in ChatDB, not raw message bodies.

## The mini LLM chat
The dashboard's Q&A box sends a hidden message (`pt.addMessage(prompt,{hidden:true})`)
to an agent that has the collected activity available — either it reads the
collector chat's ChatDB (Chat DB read capability) or the `report_<date>.md`
(Process Documents / RAG). Use a cheap agent (e.g. Ambrogino / Gemini Flash).

## Files
- `workspace_collector.py` — collects one workspace (idempotent; `--workspace-id`).
- `group_collector.py` — scans/aggregates all workspaces (`--provision` to seed).
- Dashboard Live Apps built with the **primethink-developer** skill and deployed
  into the collector / group chats.

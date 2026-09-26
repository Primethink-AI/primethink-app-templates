# PrimeThink admin concepts

Condensed from the admin documentation. Know these before making changes.

## Groups (organisations / tenants)
A group is an isolated collaborative space with its own members, resources,
settings, and agents. A user can belong to many groups; data is fully separated.
- **Group variables/settings** hold provider API keys, service endpoints, the
  embeddings model, and group defaults. Group variables override user-level ones.
- **Embeddings model** must be chosen **before indexing**; changing it later means
  clearing the whole group vector index (dimensions aren't interchangeable).
- Set provider keys at **group** scope so all members' agents can use them.

## Roles & permissions (RBAC)
Each member has a role carrying permissions; actions are checked at runtime (403
on failure). Permission categories include: administration (view/edit group
settings), agents, capabilities, collections, tasks, live apps, roles, users,
**group variables** (view/create/edit/remove), LLM, scheduled jobs.
- Scope levels: `global` (user-level), `group`, `admin` (platform).
- **Super Admin bypasses all checks.** A regular member gets 403 on admin ops.
- Permission dependencies apply (e.g. need `create_agent` to have `edit_agent`).
- Roles CRUD is **not** in the CLI; `pt group invite --role-id` references a role.

## Chat workspaces
Organisational containers for chats/documents/collections. Share types:
- **Not Shared** (private, default) → **Owner Only** → **Shared** (equal perms).
- **Owner Only → Shared is irreversible.** Owner can't leave a Not Shared / Owner
  Only workspace without sharing first. Shared workspaces have **shared memory**.
- Chat share types are locked inside a workspace — change the workspace's instead.

## Chats
Conversations with agents and/or users. Types: standard, multi-user (memory off by
default), direct, temporary (no memory), and **page chats** (`page_type` html/react
— these back Live Apps). Every chat can carry a `task_id` if created from a task.

## Tasks & task types
A task = Goal (private instructions) + initial prompt + capabilities + optional
collections + optional schedule. Types (visibility/ownership):
- **private** (creator only), **group** (shared to group), **public** (platform-wide,
  admin-managed), **system** (built-in, read-only), **catalog** (curated template
  library, read-only for non-admins).
- Promote via `pt task update <id> --type catalog` (permission-gated).
- Chats created from a task keep that task's version until updates are applied.

## Agents / virtual assistants
Configured with a system prompt (description), model, capabilities, and knowledge.
Types include Std3 (standard), Deep1 (agent w/ virtual filesystem), Summary1, etc.
Access types: private/group/task/system/catalog.
- Each group has a **default agent** (used when none is @mentioned); set via
  `pt settings set default_agent <id> --scope group`.
- **Capabilities are NOT auto-inherited** from the type on create — assign them.
- MCP capabilities work on OpenAI and direct Anthropic models, **not** Bedrock.

## Capabilities
Extend what an agent can do. Types: **internal** (built-in: memory, rag,
process_documents, documents, web search, canvas, subchats, scheduled_prompts…),
**api** (HTTP integrations), **mcp** (remote MCP servers), **computer_use**,
**sandbox**. Ownership: system/group/user/private.
- Reference secrets in capability config with `${SETTING_NAME}` placeholders
  (resolved from group/user settings). Unresolved placeholders → capability skipped.
- A capability that fails to build is skipped with a logged error, not fatal.
- Assigning a group-scoped, non-default capability the group hasn't enabled is dropped
  by the server (e.g. `rag_messages`). The response carries a
  `warnings: ["capabilities not applied …"]` entry — check it, and verify with a read-back.

## Collections & documents (RAG)
Containers for documents + semantic search. `indexed` controls vectorisation
(default false); setting `indexed: true` triggers a reindex. Unindexed collections
store docs but return nothing from semantic search.

## DB Collections (shared data)
A collection with `type=db` holds **structured JSON entities** instead of documents — the same
store a Live App's ChatDB uses, but owned by the collection rather than by one chat. Every chat
the collection is attached to reads and writes the **same rows**, and a change from any of them
is pushed live to all of them. Live Apps reach it with `pt.db('<name>')`, agents with the
ChatDB tools' `collection_name`, admins with `pt chatdb … --collection/--collection-id`.

**ChatDB vs DB Collection** — decide by who owns the data. ChatDB belongs to one chat and dies
with it. A DB Collection belongs to the group, outlives any chat, and is shared by every chat it
is attached to.

**What grants access:** an active attachment to the chat. Attaching a collection to a task
attaches it to every chat created from that task afterwards. An agent attachment grants nothing.
Access per chat is `read_write` (default) or `read_only`; there is no API, CLI or MCP route to
set `read_only`, so treat every attachment as writable.

**Good uses:**
- **One backend, many chats** — a team CRM or shared queue: each person's chat runs the same
  Live App on one collection.
- **Task with a shared backend** — attach the collection to a catalog task (standups, expense
  claims, incident reports); every run writes into one store, and a reporting chat with the
  same collection aggregates them.
- **Reference data** — catalogs, price lists, glossaries maintained once and read by many apps.
- **Collectors** — cross-workspace collectors can write into one DB Collection attached to a
  single dashboard chat, instead of a separate ChatDB per collector chat.

Setup recipe and rules: [admin-recipes.md](admin-recipes.md#set-up-a-shared-db-collection-data-shared-across-chats).

## Notifications
User-level alerts tied to a `chat_id` + `group_id` (not directly a workspace — map
chat → workspace to filter by workspace). Channels: push, websocket badges, 5-min
batched email digest. **Read and mark** them with `pt notification` (`list`,
`unread-count`, `mark-read`, `mark-unread`, `mark-all-read`, `delete`), or call the REST
endpoints directly if you need a field the CLI does not surface. **Sending** is only via a
Live App's `pt.sendNotification`.

## Scheduled jobs / prompts
Recurring automated runs. Requires the chat's `scheduled_jobs_enabled` flag and the
task/agent's Scheduled Prompts capability. Natural-language schedule ("every day at
9am") is parsed server-side. Runs happen with no user present — the prompt must be
self-contained; Memory capability helps track trends across runs.

## Live Apps
Interactive html/react pages rendered in a chat (`page_type`). The in-app `pt` API
is **chat-scoped** — a Live App reads/writes its own chat's data (ChatDB, files,
messages) plus any **DB Collection attached to that chat**, and nothing else from
other chats/workspaces. To share data between chats, attach one DB Collection to
all of them (see above); to pull in data from chats that can't share a collection,
collect it server-side and write it into the app's chat. Build them with the
**primethink-developer** skill.

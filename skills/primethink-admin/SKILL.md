---
name: primethink-admin
description: >-
  Administer a PrimeThink account with the `pt` CLI — manage groups, users and
  roles, chat workspaces, chats, tasks (including catalog tasks), agents and
  capabilities, collections, group/user settings and provider API keys, tags,
  scheduled jobs, and semantic search. Use whenever the user asks to do
  PrimeThink administration: configure a group, set a provider key
  (ANTHROPIC_API_KEY/OPENAI_API_KEY/…), set the group default agent, create or
  update agents/capabilities, invite or remove members, organise workspaces,
  publish or catalog tasks, run `pt group`/`pt settings`/`pt user`/`pt workspace`/
  `pt agent`/`pt capability` commands, or build cross-workspace automation like
  activity collectors.
---

# PrimeThink Admin (via the `pt` CLI)

Administer a PrimeThink account from the command line. This skill covers the
**admin** surface of the `pt` CLI: groups, users/roles, workspaces, chats,
tasks, agents, capabilities, collections, settings/provider-keys, tags,
scheduled jobs, and search — plus the cross-workspace automation patterns
(activity collectors) that build on them.

> Companion skills: **primethink-cli** (general CLI usage) and
> **primethink-developer** (building Live Apps/Tasks). Use this one for
> account/organisation administration and automation.

## Install / update

**There is no CLI installer for this skill yet.** `pt install-skill` installs the bundled
*primethink-cli* usage skill and `pt install-developer-skill` installs *primethink-developer*
— neither fetches this one. Until an installer exists, copy it in:

```bash
git clone https://github.com/Primethink-AI/primethink-app-templates.git
cp -R primethink-app-templates/skills/primethink-admin ~/.claude/skills/
# ...or ./.claude/skills/ for a single project
```

Related, and installable today:

```bash
pt install-skill                 # bundled CLI usage skill
pt install-developer-skill       # primethink-developer (building Live Apps/Tasks)
```

Requires the `pt` CLI (`pip install primethink-cli`; add `[mcp]` for `pt mcp`).

## First: authentication & the active context

Every admin action runs against **one resolved connection** (token → API URL)
and **one active group**. Get this right before anything else.

```bash
pt whoami          # who am I, my groups, the ACTIVE group, and configured providers
pt profile list    # configured profiles (token + api_url per profile)
pt profile use <name>
pt profile add -t sk_xxx -p prod -u https://api.primethink.ai
```

**Resolution precedence** (both token and API URL):
1. `--profile` / `--api-url` flags
2. `PRIMETHINK_PROFILE` / `PRIMETHINK_TOKEN` / `PRIMETHINK_API_URL` env vars
   (`PRIMETHINK_TOKEN` bypasses the config file entirely)
3. active profile in `~/.primethink/config.json`
4. default API URL `https://api.primethink.ai`

- **REST auth header is `Authorization: Token <api_key>`** (not Bearer) — matters
  if you ever call the API directly for something the CLI doesn't cover.
- **Environments differ.** `api.primethink.ai` (prod) and dev hosts are separate
  databases with **different numeric IDs** for the same-named objects. Never
  hardcode IDs across environments — resolve them by name/code at runtime.
- **The active group is decisive.** `create_agent`/`create_chat`/`list_capabilities`
  and group-settings all resolve against the token's active group. `pt whoami`
  now reports it — check it before creating anything. See
  [references/known-gaps.md](references/known-gaps.md).

**Output:** every API command prints pretty JSON to stdout (empty/`204`
responses print `{"ok": true}`), so pipe to `jq`. There is no `--json` flag —
JSON is the default.

## When to read the reference files

| Doing… | Read |
|---|---|
| Any command's exact flags | [references/command-reference.md](references/command-reference.md) |
| A multi-step admin workflow (setup, rollout, cleanup) | [references/admin-recipes.md](references/admin-recipes.md) |
| Understanding roles, share types, task/agent/capability types | [references/concepts.md](references/concepts.md) |
| Gotchas, CLI/MCP gaps, and workarounds | [references/known-gaps.md](references/known-gaps.md) |
| Building the workspace / group activity collectors | [references/collectors.md](references/collectors.md) |

## The admin command map (at a glance)

| Area | Command group | Typical admin actions |
|---|---|---|
| Identity | `pt whoami`, `pt profile` | resolve who/where; switch env |
| Organisations | `pt group` | list/get/create/update/delete groups; members; invite; add/remove agents |
| Settings & keys | `pt settings` | list/get/set/delete group & user settings, provider API keys, `default_agent` |
| Users | `pt user` | look up / search visible users (resolve email → id) |
| Workspaces | `pt workspace` | list/create/rename/archive/pin; add/remove chats; delete |
| Chats | `pt chat` | list/create/rename/goal; members; files; messages; save-as-task |
| Tasks | `pt task` | list (incl. `--type catalog`); create/update; publish; set-public/private; versions |
| Agents | `pt agent` | list/get/create/update/delete; types; capabilities via config; avatar; RAG collections |
| Capabilities | `pt capability` | list/create/update/archive/duplicate; **resolve** codes→ids |
| Evaluation | `pt eval` | test/QA a task: plan → run → results, simulations |
| Collections | `pt collection` | list/create/update/reindex; documents |
| Scheduled jobs | `pt scheduled-job` | list/create/update/set-status/delete (per chat) |
| Tags | `pt tag` | list/create/assign (per model type) |
| Search | `pt search` | documents/chat/collection/messages/images |
| Catalog | `pt models` | list LLM / embedding models + `provider_configured` |

Full flags for each: [references/command-reference.md](references/command-reference.md).

## Core admin workflows (essentials)

### Configure provider keys (choose the scope deliberately) and the default agent
Provider keys are settings variables and can be set at **group** or **user** scope
— pick based on ownership, not by rote:
- **Group scope** — a shared team key: every member's agents in that group can use
  it. Editing group variables requires the `edit_group_variables` permission (group
  admin), so this is for keys the org owns.
- **User scope** — *your personal* key, tied to your account and used when you are
  the actor. Choose this when you want to bill/use your own key without granting the
  whole group access (and you don't need admin rights to set your own).

Group variables override user variables of the same name.

```bash
pt whoami                                   # confirm active group + configured providers
pt settings list --scope group              # what's set (secrets shown as set, not value)
pt settings set ANTHROPIC_API_KEY sk-ant-... --scope group   # shared team key
pt settings set OPENAI_API_KEY sk-...        --scope user    # your personal key
pt models list --only-configured            # verify the provider now shows configured
pt settings set default_agent 265 --scope group   # set the group's default assistant
```

### Create a capable agent (assign capabilities inline, by code)
As of CLI v1.4.1, `pt agent create/update` take `--capability <code>` (repeatable)
and resolve codes → ids for the active environment for you, so you never hardcode
env-specific ids. (Without any `--capability`, an agent is created with an empty
capability set — always pass the ones it needs.)

```bash
pt agent types                              # find the type id (e.g. Std3 = 5)
pt capability resolve rag process_documents documents rag_documents   # optional: preview code→id
pt agent create --name "Analyst" --public-description "…" --type-id 5 \
  --model openai:gpt-5.6-sol --access-type group --description "…instructions…" \
  --capability base --capability memory --capability rag \
  --capability process_documents --capability documents --capability rag_documents
pt agent get <id> | jq '.capabilities[].code'   # verify what actually landed
```
Note: a group-scoped capability the group hasn't enabled is dropped by the server. Since
CLI 1.4.1 the response carries a `warnings: ["capabilities not applied …"]` entry naming the
dropped ids, so check that — and still use the `get` read-back to confirm what landed.

### Invite a member by email
`pt chat invite-members` and `pt group invite` accept emails; for chat invites
you may need to resolve the id first.

```bash
pt user search "jane@acme.com"              # resolve email → user id
pt group invite --email jane@acme.com --role-id <role>
pt chat invite-members <chat_id> --email jane@acme.com --agent-id 265
```

### Publish / catalog a task
```bash
pt task list --type catalog                 # browse the catalog
pt task create --name "…" --description "…" --type private
pt task update <id> --type catalog          # promote to catalog (permission-gated)
pt task set-public <id> / set-private <id>  # toggle visibility
```

More end-to-end recipes (group bootstrap, agent library, workspace rollout,
cleanup): [references/admin-recipes.md](references/admin-recipes.md).

## Cross-workspace automation: activity collectors

A common admin ask is a **workspace activity collector** (summarise what changed
in a workspace) and a **group collector** (roll those up across all workspaces,
and provision a collector into workspaces that lack one). Because in-product
agents can't call the CLI yet and a Live App's `pt` API is chat-scoped, the
collection runs as an **external CLI/REST script** (admin token) that writes
results into a per-workspace **collector chat** (ChatDB + a `report_<date>.md`),
with a **Live App** rendering the dashboard + a mini LLM chat.

Full design, detection markers, incremental state, and the scripts:
[references/collectors.md](references/collectors.md).

## Safety rules for admin work

- **Confirm the environment and active group** (`pt whoami`) before any create/
  delete — prod and dev are different databases with different IDs.
- **Destructive commands** (`delete`, `remove-*`, `clear-messages`, workspace
  `delete --delete-chats`) are irreversible; they prompt unless you pass `--yes`.
  Don't pass `--yes` in a loop over production without an explicit go-ahead.
- **Secrets:** never print provider-key values; `pt settings list` masks them.
  Choose scope deliberately — `--scope group` for a shared team key (needs group-admin
  rights), `--scope user` for your own personal key.
- **Permissions are enforced server-side** (HTTP 403). Admin actions (roles,
  group variables, catalog, user management) require the right role; Super Admin
  bypasses checks. See [references/concepts.md](references/concepts.md).
- **Resolve IDs by name/code, per environment.** Capability IDs, agent-type IDs,
  and group IDs differ between prod and dev.

# `pt` CLI — admin command reference

Every command accepts `--profile/-p` and `--api-url/-u` (connection), and prints
JSON. Destructive commands take `--yes` to skip confirmation. Flags below are the
admin-relevant ones; run `pt <group> <cmd> --help` for the complete list.

## Identity & profiles
- `pt whoami` — user, groups, **active group (id+name)**, configured providers.
- `pt profile list` · `pt profile use <name>` · `pt profile remove <name>`
- `pt profile add -t <token> [-p <name>] [-u <api_url>]`

## group — organisations
- `pt group list [--offset --limit --sort]`
- `pt group get <group_id>`
- `pt group create --name <n> [--doc-analysis/--no-doc-analysis] [--doc-analysis-mime-types <csv>]`
- `pt group update <group_id> --name <n> [--doc-analysis…]`
- `pt group delete <group_id> [--yes]`
- `pt group members <group_id> [--search -s] [--order-by --order-dir]`
- `pt group remove-member <group_id> <user_ids…> [--yes]`
- `pt group invite --email <e> [--role-id <id>]`
- `pt group add-agent <group_id> <agent_ids…>` · `pt group remove-agent <group_id> <agent_ids…>`

## settings — group/user settings & provider keys
- `pt settings list [--scope all|group|user]` — secrets shown as set, value hidden.
- `pt settings get <key> --scope group|user`
- `pt settings set <key> <value> [--scope group|user]` — scope required for ambiguous keys.
- `pt settings delete <key> --scope group|user [--yes]`
- Known keys include provider vars (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`,
  `GOOGLE_API_KEY`, `MISTRAL_API_KEY`, `SERPER_API_KEY`, …) and group properties
  like `default_agent`, `embeddings_model`.

## user — lookups (resolve email → id)
- `pt user list [--search -s] [--full] [--limit]`
- `pt user search <query> [--full] [--limit]` — visible users only.

## workspace — chat workspaces
- `pt workspace list [--archived --pinned --page --page-size]`
- `pt workspace create --name <n> [--goal <g>] [--ordering <n>]`
- `pt workspace rename <id> <name>` · `pt workspace set-goal <id> <goal>`
- `pt workspace archive <id>` · `unarchive <id>` · `pin <id>` · `unpin <id>`
- `pt workspace add-chat <workspace_id> <chat_id>` · `remove-chat <chat_id>`
- `pt workspace delete <id> [--delete-chats] [--yes]`

## chat
- `pt chat list [--workspace-id <id>] [--search -s] [--starred] [--archived] [--page --page-size --sort]`
- `pt chat create --name <n> [--goal/--goal-file] [--virtual-assistant-id] [--workspace-id] [--type] [--public] [--member <id>…]`
- `pt chat rename <id> <name>` · `pt chat goal <id> --goal <text> | --goal-file <path>` · `pt chat type <id> …`
- `pt chat messages <id> [--size --before-message-id --after-message-id --anchor-message-id]`
- `pt chat archive/unarchive/delete <id> [--yes]`
- `pt chat list-users <id>`
- `pt chat invite-members <id> [--user-id <id>…] [--agent-id <id>…] [--email <e>…]`
- `pt chat remove-members <id> [--user-id…] [--agent-id…]`
- `pt chat send …` · `pt chat save-as-task <id>`
- Files: `list-files`, `upload-files`, `download-file`, `delete-file`, `upload-text`,
  `sync-to`, `sync-from`, `sync`, `mkdir/rmdir/move-dir/rename-dir`, document versions.

## chatdb — a chat's Live App data store (used by collectors)
- `pt chatdb init <chat_id>`
- `pt chatdb list <chat_id> [--entity <name>…] [--filters <json>] [--limit --offset --page --page-size]`
- `pt chatdb get <chat_id> <entity_id>`
- `pt chatdb add <chat_id> --entity <name> [--data <json>] [--items <json>]`
- `pt chatdb update <chat_id> [--entity-id <id> --data <json> --merge/--replace] [--items <json>]`
- `pt chatdb delete <chat_id> [--entity-id <id>] [--ids <csv>] [--yes]`

## task
- `pt task list [--type <t>…] [--status] [--page-type chat|html|react] [--search -s] [--starred] [--order-by --order-dir --page --page-size]`
  — `--type catalog` lists catalog tasks; `--page-type html|react` lists Live Apps.
- `pt task create --name <n> --description <d> --type private|public|group|system|catalog [--goal/--goal-file --virtual-assistant-id --initial-prompt --status …]`
- `pt task update <id> [--type … other fields]` · `pt task get <id>`
- `pt task set-public <id>` · `pt task set-private <id>`
- `pt task publish <dir> --virtual-assistant-id <id> [--task-id <id>]` — reads `.name.config`,
  `.description.config`, `GOAL.md`, `INITIAL_PROMPT.md`. Also takes `--type` and every feature
  toggle (`--chat-history`, `--docs-enabled`, `--scheduled-jobs`, …, each with a `--no-…` form),
  and reads an optional `task.json` from the project dir.
  Precedence: option > `task.json` > defaults.
- Task flags on `create/update`: `--global-memory`, `--chat-history`, `--search-in-chat`,
  `--search-in-documents`, `--summary-enabled`, `--docs-enabled`, `--scheduled-jobs`,
  `--email-integration`, `--share-action`, `--public-chat`, `--run-immediately` (each has a `--no-…`).
- `pt task duplicate <id>` · `pt task export <id> -o file.json` · `pt task import <file>`
- `pt task create-version <id> [--version-name Production|Draft]`
- `pt task add-docs/delete-docs/upload-text/upload-image`, `actions`, `execute`, directories, versions.
- `pt task delete <id> [--yes]`

## agent — virtual assistants
- `pt agent list [--search -s] [--type-id <id>…] [--status] [--task-id] [--summary/--full]`
- `pt agent get <id>` · `pt agent types`
- `pt agent create --name <n> --public-description <d> --type-id <id> [--model --access-type private|group|task|system|catalog --description …] [--capability <code>]…`
  — `--capability` is repeatable and resolves codes→ids for the active env. With none, the agent has **no capabilities**. Verify with `pt agent get`.
- `pt agent update <id> [--capability <code>]…` — same capability handling.
- `pt agent update <id> [fields]` · `pt agent delete <id> [--yes]`
- `pt agent upload-image <id> <file>` · `pt agent delete-image <id>`
- `pt agent attach-collections <id> <collection_ids…>` · `pt agent detach-collection <id> <collection_id>`
- `pt agent list-docs <id>` · `pt agent upload-docs <id> <files…> [--attachment-mode]`

## capability
- `pt capability resolve <codes…>` — resolve capability codes (or ids) → ids for the
  active group (returns `{ids, unresolved}`; some user-scoped internal codes may be
  unresolved — confirm on the agent with `pt agent get`).
- `pt capability list [--search -s] [--type internal|api|mcp|computer_use|sandbox] [--tag …] [--archived] [--page --page-size]`
- `pt capability create --name <n> --code <c> [--type --access-type --options …]`
- `pt capability update <id> [fields] [--archived/--not-archived]`
- `pt capability archive/unarchive/duplicate <id>` · `pt capability delete <id> [--yes]`

## collection
- `pt collection list [--search -s --page --page-size]` · `get <id>`
- `pt collection create --name <n> [--description --type --public/--private]`
- `pt collection update <id> [--indexed/--not-indexed --ocr-instructions …]`
- `pt collection reindex <id>` · `copy <id>` · `delete <id> [--yes]`
- `pt collection upload-files/upload-text/download-file/delete-file <id> …`, sync, directories, versions.

## eval — task evaluation (test/QA a task)
- `pt eval list <task_id>` — the evaluation plan (items).
- `pt eval add <task_id> --user-query <q> --ideal-response <r> --type exact|similar|agent [--evaluator-agent-id --chat-group --examples]`
- `pt eval update <task_id> <evaluation_data_id> [fields]` · `pt eval delete <task_id> <evaluation_data_id>`
- `pt eval settings <task_id> [plan settings]`
- `pt eval run <task_id>` → run the evaluation; `pt eval runs <task_id>` · `pt eval run-get <task_id> <run_id>` · `pt eval download <task_id> <run_id>`
- `pt eval results <task_id> [--run-id]`
- `pt eval simulate <task_id> …` (multi-turn simulation) · `pt eval simulations <task_id>` · `pt eval delete-simulation <task_id> <simulation_id>`

### Choosing `--type` (the decision that matters)

| type | use for | avoid for |
|---|---|---|
| `exact` | enum values, ids, one-word answers | anything phrased freely |
| `similar` | **short, near-canonical strings only** | **prose — see warning** |
| `agent` | conversational answers, refusals, tone, multi-criteria judgement | high-volume cheap checks (one model call per item) |

> ⚠️ **`similar` is a lexical ratio — it rewards shared wording, not shared meaning.** A
> correct answer that restructures the sentence is marked down, so it suits short,
> near-canonical strings rather than free-form prose. **Default conversational tasks to
> `agent`;** spot-check one item before building a plan on `similar`.
>
> *Version note:* before the fix in primethink-api#649, `similar` was far worse than merely
> lexical — a `difflib` heuristic collapsed the score for **any** expected answer of roughly
> 200 characters or more (a faithful paraphrase measured **13/100** where `agent` scored
> **98/100**). If long answers score implausibly low, check whether that fix is deployed.

### Running a plan

- **`--chat-group` groups *contiguous* items, and defaults to `1`.** Items run in id order and
  a new chat opens whenever the value changes, so `1,2,1` yields **three** chats and the second
  group-1 item loses the first's context. Give each independent single-turn test its **own**
  group; keep a genuine multi-turn case's items adjacent. Since the default is `1`, a plan
  built without passing `--chat-group` collapses into one N-turn conversation.
- **Always set an evaluator first:** `pt eval settings <task_id> --evaluator-agent-id <id>`
  (also `--pass-threshold`, an **integer 1–100** — `80` for an 80% gate, not `0.8`; `1` means
  *one percent*. Note `pt task` spells the same setting `--evaluation-pass-threshold`; also
  `--active/--inactive`, `--run-time`, `--message-delay-ms`). The API rejects **every** run with
  400 *"doesn't have a default
  evaluator agent ID"* when this is unset — `exact`/`similar`-only plans included, and a
  per-item evaluator does not satisfy it. Prefer a purpose-built evaluator — borrowing a
  persona or reviewer agent drags its own instructions into the judgement.
- `good_example_*` / `bad_example_*` calibrate `similar`; with none supplied the score is the
  raw ratio.
- **Each contiguous `chat_group` creates a chat per run.** A 6-item plan run twice leaves ~12
  chats.
- **Read results with `pt eval results <task_id> --run-id <n>`** — per item it returns the
  actual response, the expected one, the score and the evaluator's notes. The summary alone
  (`pt eval runs`) will not tell you *why* something failed.
- **Simulations** drive a multi-turn conversation with a simulated user — the right tool for
  behaviour under pressure across turns (scope discipline, refusals, a user who pushes back),
  which single-turn items cannot reach. **Grading is opt-in:** without `--evaluation-prompt`
  the simulation finishes with `response: null` and no score. Give the simulator and the
  evaluator *different* models from the task's own agent where you can, so the grading is not
  marking its own homework.

> Most subcommands take `<task_id>` as their first argument — including `update`, `delete`,
> `run-get`, `download` and `delete-simulation`. Check `--help` rather than assuming an id
> alone is enough.

## scheduled-job (per chat)
- `pt scheduled-job list <chat_id>`
- `pt scheduled-job create --chat-id <id> --schedule-prompt "<prompt>" [--schedule-nl "every day at 9am"] [--notify/--no-notify]`
- `pt scheduled-job update <id> [fields]` · `set-status <id> Active|Paused` · `delete <id> [--yes]`

## tag
- `pt tag list --model task|agent|capability|collection [--only-used]`
- `pt tag create --model <m> --name <n> [--category <c>]`
- `pt tag assign --model <m> --owner-id <id> --tag-id <id>…`

## search / models / media
- `pt search documents <query> --collection-name <name> [--search-type --top-k --score-threshold]`
- `pt search chat <chat_id> <query>` · `search collection <collection_id> <query>` · `search messages <chat_id> <query>` · `search images <collection_id> …`
- `pt models list [--only-configured --provider --vision --reasoning --search -s]` · `pt models embeddings`
- `pt image generate --prompt "…" -o out.png [--style --size]`
- `pt voice tts/stt/diarize/translate` · `pt video analyze`

## notification
- `pt notification list [--unread-only --page --page-size]` — newest first; each ties to a `chat_id`/`group_id`.
- `pt notification unread-count`
- `pt notification mark-read <id>` · `pt notification mark-unread <id>` · `pt notification mark-all-read`
- `pt notification delete <id>`
- To filter "by workspace": join each notification's `chat_id` → its workspace (via `pt chat list --workspace-id`).

## NOT in the CLI
- **Notification send** — no CLI/REST endpoint; only a Live App's `pt.sendNotification`.
- **Roles CRUD**, **audit logs**, **bulk delete**.

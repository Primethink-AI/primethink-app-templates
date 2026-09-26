---
name: primethink-cli
description: Use the PrimeThink CLI (`pt`) to interact with the PrimeThink API and scaffold Live Apps — configure token profiles, create React or HTML Live App projects, send messages to chats and agents, execute task actions, upload/download/sync files with chats and collections, and create/update/version tasks. Use when the user asks to interact with PrimeThink, initialize a PrimeThink Live App, run `pt` commands, manage PrimeThink chats/collections/tasks, or automate PrimeThink workflows.
---

# PrimeThink CLI

The PrimeThink CLI is installed as `pt` (`pip install primethink-cli`; in the source repo, `pip install -e .` or run `python primethink.py …` directly). Full documentation: `pt --help`, `pt <group> --help`, or [docs/cli-reference.md](https://github.com/primethink-ai/primethink-cli/blob/main/docs/cli-reference.md). The help flag may come before or after the command path (`pt --help chat send` == `pt chat send --help`).

## Before you start

1. Check the CLI is available: `pt version` (expects `PrimeThink CLI v…`).
2. **For `pt live-app new`, skip authentication** — scaffolding only downloads a public template repository and writes a new local directory.
3. For commands that call the PrimeThink API, check a profile is configured: `pt profile list`. If none, ask the user for their API token (never invent one) and run:
   ```bash
   pt profile add --token <TOKEN> [--profile <name>] [--api-url <url>]
   ```
   Tokens live in `~/.primethink/config.json`. Never print, cat, or commit that file.
   Alternatively, in CI or containers, authentication can come from environment
   variables instead of a config file: `PRIMETHINK_TOKEN` (token), plus optional
   `PRIMETHINK_API_URL`, `PRIMETHINK_PROFILE`, and `PRIMETHINK_CONFIG_PATH`.
   Flags beat environment variables, which beat the config file.
3. Debugging a failing request: run it with `PRIMETHINK_DEBUG=1` to get `[debug]`
   request/response lines on stderr (tokens are never printed).

## Conventions that will trip you up

- **`-p` is ambiguous.** In the `pt task`, `pt agent`, `pt capability`, `pt scheduled-job`, `pt workspace`, `pt tag`, `pt group`, `pt settings`, `pt user`, `pt notification`, `pt eval`, `pt voice`, `pt video`, `pt search`, `pt chatdb`, and `pt models` groups, `pt image generate`, and `pt whoami`, `-p` = `--profile`. In the `pt chat` and `pt collection` groups there is NO `-p` for profile — there `-p` = `--path` (a directory inside the chat/collection) on the file commands (note: `upload-text` uses `--path` with no `-p`). Always use the long forms `--profile` and `--path` to be safe.
- **Every API command** accepts `--profile <name>` (one-off profile) and `--api-url`/`-u` (one-off URL override) without changing the active profile. Prefer these over `pt profile use` when running one-off commands for the user.
- **Output is pretty-printed JSON** on stdout for API commands — pipe to `jq` to extract fields. Download/sync commands print progress lines instead.
- **Exit codes**: 0 = success, 1 = any error (message on stdout). `sync-to`/`sync-from`/`sync` are the exception: per-file failures don't abort; check the final `Sync complete: N …, M failed` line. The two-way `pt chat sync` DOES exit 1 without transferring anything if it can't fully list the chat's remote tree.
- **`pt chat sync` has no newer-wins logic.** It matches files by relative path only — no timestamps or checksums. A file present on both sides is skipped unless you pass `--prefer local` (re-upload local copy) or `--prefer remote` (overwrite local file with the chat's copy). Run `--dry-run` first when unsure; `--prefer remote` overwrites local files irreversibly, so confirm with the user before using it.
- **Sanitized-name collisions skip a file (with a warning).** If two remote documents map to the same local filename after sanitization (e.g. `.env` and `env`), `sync` keeps the first and warns that the other is ignored. Fewer local files than remote documents is expected in that case, not an error — check the warning lines.
- **Attachments** use a repeated flag: `-f a.pdf -f b.pdf` (not comma-separated).
- **Slow operations** (`image generate`, `task create/update` with `--schedule-nl`/`--schedule-prompt`) can take up to 2 minutes; don't treat the wait as a hang.

## Command map

```
pt version | install-skill | install-developer-skill
pt live-app new DIRECTORY [--framework react|html] [--tailwind/--no-tailwind] [--flowbite/--no-flowbite] [--repo-url URL] [--ref REF]
pt live-app publish DIRECTORY --virtual-assistant-id ID [--task-id ID] [--app-dir DIR]
pt live-app test DIRECTORY [--chat-id CHAT_ID] [--temporary|--permanent] [--app-dir DIR] [--open]
# Automated UI testing is not a CLI command — it lives in the primethink-developer skill (plan-driven, deterministic Playwright runner).
pt mcp                                    # run PrimeThink as an MCP server over stdio (needs the [mcp] extra, Python 3.10+)
pt whoami [--profile NAME]                # {"user":…, "groups":…, "active_group": {id,name}, "configured_providers": [provider slugs with an API key]} — verify which account/group a profile hits and which providers are keyed
pt profile add -t TOKEN [-p NAME] [-u URL] | use PROFILE | list | remove PROFILE

pt chat send CHAT_ID_OR_@MENTION -m "MSG" [-f FILE]... [--async]
pt chat send --agent AGENT_ID -m "MSG" [-f FILE]...      # chat target XOR --agent
pt chat list [--page N] [--page-size N] [--search TEXT] [--starred] [--archived] [--workspace-id ID] [--sort automatically|manually]
pt chat create [--name N] [--goal G | --goal-file F] [--virtual-assistant-id ID] [--workspace-id ID] [--type standard|direct_users] [--public] [--member USER_ID]... [--from-task-id TASK_ID]   # --from-task-id = launch that task into the chat
pt chat rename CHAT_ID NAME
pt chat goal CHAT_ID (--goal G | --goal-file F)
pt chat type CHAT_ID live-app|chat         # API page_type html|chat
pt chat messages CHAT_ID [--size N] [--before-message-id ID | --after-message-id ID] [--anchor-message-id ID]   # cursor pagination, NOT --page; before XOR after; anchor overrides both
pt chat archive CHAT_ID | unarchive CHAT_ID
pt chat delete CHAT_ID [--yes]            # DESTRUCTIVE; prompts unless --yes; prefer archive


pt chat list-files CHAT_ID [--path /dir]
pt chat upload-files CHAT_ID FILE... [--path /dir]
pt chat download-file CHAT_ID DOC_ID [-o PATH]
pt chat delete-file CHAT_ID DOC_ID [--yes]         # DESTRUCTIVE; prompts unless --yes
pt chat upload-text CHAT_ID (--text "…" | --text-file F) [--name N] [--metadata M] [--path /dir]   # document from raw text, no file
pt chat sync-to CHAT_ID LOCAL_DIR [--path /dir] [--pattern '*.pdf'] [--recursive]
pt chat sync-from CHAT_ID LOCAL_DIR [--path /dir]
pt chat sync CHAT_ID LOCAL_DIR [--path /dir] [--prefer local|remote] [--dry-run]   # two-way; chat only, not collections
pt chat list-users CHAT_ID
pt chat invite-members CHAT_ID [--user-id N]... [--agent-id N]... [--email EMAIL]...   # ≥1 target required; --email resolved via visible-users; agents = virtual assistants
pt chat remove-members CHAT_ID [--user-id N]... [--agent-id N]...
pt chat edit-message MESSAGE_ID "new text"                    # PUT update_message_text
pt chat delete-message CHAT_ID MESSAGE_ID [--yes]            # DESTRUCTIVE
pt chat clear-messages CHAT_ID [--yes]                       # DESTRUCTIVE (wipes the chat)
pt chat retry-message MESSAGE_ID
pt chat export-message CHAT_ID MESSAGE_ID [--format md|docx|pdf] [-o FILE]
pt chat save-as-task CHAT_ID [--name N] [--description D] [--goal G] [--initial-prompt P] [--status S] [--type private|public|group|system|catalog]

# ChatDB = a chat's Live App data store (init once, then read/write entities). -p = --profile here.
pt chatdb init CHAT_ID
pt chatdb list CHAT_ID [--entity NAME]... [--filters '{"k":"v"}'] [--limit N] [--offset N] [--page N] [--page-size N]
pt chatdb get CHAT_ID ENTITY_ID
pt chatdb add CHAT_ID --entity NAME [--data '{...}' | --items '[{...},{...}]']       # single row or bulk
pt chatdb update CHAT_ID [--entity-id N --data '{...}' [--merge|--replace]] [--items '[...]'] [--if-unchanged-since TS]
pt chatdb delete CHAT_ID [--entity-id N | --ids 1,2,3] [--yes]     # DESTRUCTIVE
# list/get/add/update/delete also take [--collection NAME] [--collection-id N] to target a DB Collection
# (type db) attached to the chat instead of the chat's own ChatDB. Prefer --collection-id when names repeat;
# if both are given they must match the same collection. Read-only attachments reject writes.

pt collection list [--page N] [--page-size N] [--search TEXT]
pt collection create --name N [--description D] [--type collection|skill|external_source|db] [--public|--private]
pt collection get COLLECTION_ID
pt collection update COLLECTION_ID [--name N] [--description D] [--type …] [--public|--private] [--indexed|--not-indexed] [--ocr-instructions TEXT]   # PATCH: needs ≥1 field
pt collection reindex COLLECTION_ID                    # rebuild vector store (use if a fresh upload isn't searchable yet)
pt collection copy COLLECTION_UUID                     # duplicate (takes the UUID, not the numeric id)
pt collection upload-text COLLECTION_ID (--text "…" | --text-file F) [--name N] [--metadata M] [--path /dir]
pt collection delete COLLECTION_ID [--yes]              # DESTRUCTIVE; prompts unless --yes
pt collection delete-file COLLECTION_ID DOC_ID... [--yes]   # DESTRUCTIVE; delete files by document ID
pt collection list-files|upload-files|download-file|sync-to|sync-from …   # same shape as pt chat file commands

pt agent list [--search TEXT] [--type-id N]... [--status all|archived] [--task-id N] [--summary]   # --summary trims heavy config; MCP list_agents summarizes by default (detail=true for full)
pt agent get AGENT_ID
pt agent create --name N --public-description D --type-id N [--description TEXT | --description-file F] [--model M] [--access-type private|group|task|system|catalog] [--capability CODE_OR_ID]...   # --model from `pt models list`; --capability attaches by code or id (repeatable)
pt agent update AGENT_ID [fields…]        # PATCH: only passed fields change; needs ≥1 field
pt agent delete AGENT_ID [--yes]          # DESTRUCTIVE; prompts unless --yes
pt agent types                            # type IDs for --type-id
pt agent list-docs AGENT_ID                                    # agent knowledge base
pt agent upload-docs AGENT_ID FILE... [--path /dir] [--metadata M] [--attachment-mode search|context|archived|attached]
pt agent attach-collections AGENT_ID COLLECTION_ID...          # RAG: attach collections
pt agent detach-collection AGENT_ID COLLECTION_ID
pt agent upload-image AGENT_ID FILE                            # set the agent's image
pt agent delete-image AGENT_ID [--yes]                         # DESTRUCTIVE; remove the agent's image
# messaging an agent = pt chat send --agent AGENT_ID (there is no `pt agent send`)

pt models list [--provider P] [--vision] [--reasoning] [--only-configured] [--search TEXT] [--full]      # LLM catalog; use a model's id for --model / group creation
pt models embeddings [--provider P] [--multimodal] [--only-configured] [--full]                          # embedding-model catalog
# both default to a trimmed summary; --full for raw records (MCP: list_models/list_embedding_models, detail=true)

pt capability list [--search TEXT] [--type internal|mcp|api|computer_use|sandbox] [--tag T]... [--archived] [--page N] [--page-size N]
pt capability create --name N --code C [--type …] [--access-type system|group|user|private] [--description D] [--help-text T] [--help-url U] [--ordering N] [--is-default] [--options '{…}']
pt capability update CAP_ID [same fields, all optional] [--archived|--not-archived]     # PATCH: needs ≥1 field
pt capability delete CAP_ID [--yes]                     # DESTRUCTIVE
pt capability archive CAP_ID | unarchive CAP_ID
pt capability duplicate CAP_ID
pt capability resolve CODE...            # resolve capability codes/ids to ids (MCP: resolve_capabilities); use for `pt agent create --capability`

# Groups (organizations). -p = --profile here.
pt group list [--offset N] [--limit N] [--sort S] | get GROUP_ID
pt group create --name N [--doc-analysis] [--doc-analysis-mime-types "…"]
pt group update GROUP_ID --name N [...]          # PUT: --name required
pt group delete GROUP_ID [--yes]                 # DESTRUCTIVE
pt group members GROUP_ID [--search S] [--order-by O] [--order-dir asc|desc]
pt group remove-member GROUP_ID USER_ID... [--yes]
pt group invite --email E [--role-id N]          # invites to the CURRENT group
pt group add-agent GROUP_ID AGENT_ID... | remove-agent GROUP_ID AGENT_ID...
# MCP: list_groups/get_group/create_group/update_group/delete_group/list_group_members/remove_group_members/invite_to_group/add_agents_to_group/remove_agents_from_group

# Group/user settings + provider API keys. -p = --profile here. Secret values are NEVER printed (only is_set/sensitive).
pt settings list [--scope all|group|user]
pt settings get KEY --scope group|user                       # sensitive values redacted
pt settings set KEY VALUE [--scope group|user]               # routes by key; provider *_API_KEY keys stored as secrets (default group scope); scope REQUIRED where a key exists at both scopes
pt settings delete KEY --scope group|user [--yes]            # DESTRUCTIVE; KV settings only (dedicated properties can't be deleted)
# Known keys — group: default_agent, voice, voice_provider, new_chat_logic, group_mode, default_role, document_analysis_active, public_name, custom_theme_color; user: timezone, location, default_language, default_va, auto_archive_option, custom_theme_color; plus any *_API_KEY.
# Set the group default agent: pt settings set default_agent <AGENT_ID> --scope group. Set a provider key: pt settings set ANTHROPIC_API_KEY sk-… --scope group
# MCP: list_settings/get_setting/set_setting/delete_setting

# User directory lookup (visible users). -p = --profile here. search/limit are CLIENT-SIDE (endpoint has no query params).
pt user list [--search TEXT] [--full] [--limit N]
pt user search QUERY [--full] [--limit N]                    # by name/email
# MCP: list_users/search_users

# Notifications (read + mark; sending is not exposed by the API). -p = --profile here.
pt notification list [--unread-only] [--page N=1] [--page-size N=25]   # --unread-only is client-side
pt notification unread-count
pt notification mark-read NOTIFICATION_ID | mark-unread NOTIFICATION_ID | mark-all-read
pt notification delete NOTIFICATION_ID [--yes]               # DESTRUCTIVE
# MCP: list_notifications/get_unread_notification_count/mark_notification_read/mark_notification_unread/mark_all_notifications_read/delete_notification

# Task evaluation: build a test plan (eval add), configure (eval settings), then run and read results. -p = --profile here.
pt eval list TASK_ID                                          # the evaluation-data set (test cases)
pt eval add TASK_ID --user-query Q --ideal-response R --type exact|similar|agent [--chat-group N=1] [--evaluator-agent-id N] [--examples '{good/bad example fields}']
pt eval update TASK_ID EVAL_ID [--user-query …] [--ideal-response …] [--type …] [--evaluator-agent-id N] [--examples JSON]
pt eval delete TASK_ID EVAL_ID [--yes]                       # DESTRUCTIVE
pt eval settings TASK_ID [--active|--inactive] [--run-time manual|daily|weekly|monthly] [--evaluator-agent-id N] [--pass-threshold 1-100] [--message-delay-ms N]   # --pass-threshold is a whole percent, 1-100 (80, not 0.8)
pt eval run TASK_ID [--version N] [--model-override M]        # tests the task
pt eval runs TASK_ID | run-get TASK_ID RUN_ID
pt eval results TASK_ID [--run-id N]
pt eval download TASK_ID RUN_ID [-o FILE]
pt eval simulate TASK_ID --simulator-agent-id N --goal G --max-turns N [--persona P] [--wait-seconds N] [--evaluation-prompt P] [--evaluator-agent-id N] [--version N]
pt eval simulations TASK_ID | delete-simulation TASK_ID SIM_ID [--yes]   # delete-simulation is DESTRUCTIVE
# MCP: list_task_evaluations/add_task_evaluation/update_task_evaluation/delete_task_evaluation/set_task_evaluation_settings/run_task_evaluation/list_task_evaluation_runs/get_task_evaluation_run/get_task_evaluation_results/download_task_evaluation_run/run_task_simulation/list_task_simulations/delete_task_simulation

# Tags are namespaced by model=task|agent|capability|collection. -p = --profile here.
pt tag list --model task|agent|capability|collection [--only-used]
pt tag create --model M --name N [--category C]
pt tag assign --model M --owner-id ID [--tag-id N]...        # replaces the object's whole tag set
# MCP/agent tools: list_tags / create_tag / assign_tags(model, owner_id, tag_ids)

# Chat workspaces group chats. -p = --profile here.
pt workspace list [--archived] [--pinned] [--page N] [--page-size N]
pt workspace create --name N [--goal G] [--ordering N]
pt workspace rename WS_ID NAME | set-goal WS_ID GOAL
pt workspace archive WS_ID | unarchive WS_ID | pin WS_ID | unpin WS_ID
pt workspace add-chat WS_ID CHAT_ID | remove-chat CHAT_ID    # remove-chat takes only the chat id
pt workspace delete WS_ID [--delete-chats] [--yes]           # DESTRUCTIVE
# MCP: list/create/rename/set_chat_workspace_goal/archive_chat_workspace(archived=bool)/pin_chat_workspace(pinned=bool)/add_chat_to_workspace/remove_chat_from_workspace/delete_chat_workspace

# Scheduled jobs = a prompt that runs on a schedule inside a chat. -p = --profile here.
pt scheduled-job list CHAT_ID
pt scheduled-job create --chat-id ID --schedule-prompt "…" [--schedule-nl "every Fri 4pm"] [--notify|--no-notify]   # --schedule-nl is LLM-parsed (slow)
pt scheduled-job update JOB_ID [--schedule-prompt "…"] [--schedule-nl "…"] [--notify|--no-notify] [--status Active|Paused]   # needs ≥1 field
pt scheduled-job set-status JOB_ID --status Active|Paused
pt scheduled-job delete JOB_ID [--yes]                  # DESTRUCTIVE

# Directory (folder) commands exist under EACH of pt chat|collection|task|agent (list contents = list-files):
pt <owner> mkdir OWNER_ID PATH
pt <owner> rmdir OWNER_ID DIR_PATH [--recursive] [--yes]        # DESTRUCTIVE
pt <owner> move-dir OWNER_ID SRC_DIR DEST_PARENT [--merge]
pt <owner> rename-dir OWNER_ID SRC_DIR_PATH NEW_DIR_NAME
# MCP mirrors these as 4 generic tools with owner_type=chat|collection|task|agent: create_directory/delete_directory/move_directory/rename_directory

# Document versioning exists under pt chat|collection|task (NOT agent):
pt <owner> list-versions OWNER_ID DOCUMENT_ID
pt <owner> new-version OWNER_ID DOCUMENT_ID FILE [--version-name N]                 # new version from a file
pt <owner> new-text-version OWNER_ID DOCUMENT_ID (--text "…" | --text-file F) [--name N] [--version-name N]
pt <owner> set-production-version OWNER_ID DOCUMENT_ID VERSION_NUMBER
pt <owner> delete-version OWNER_ID DOCUMENT_ID VERSION_NUMBER [--yes]               # DESTRUCTIVE
# MCP: owner_type=chat|collection|task → list_document_versions/create_document_version/create_document_text_version/set_production_version/delete_document_version

pt task list [--search TEXT] [--type {private|public|group|system|catalog}]... [--status all|published|archived] [--page-type chat|html|react] [--starred/--no-starred] [--order-by last_updated_at|last_run|name|manual] [--order-dir asc|desc] [--page N] [--page-size N]
pt task actions
pt task execute -a ACTION -m "MSG" [-f FILE]... [--return-original]
pt task create --name N --description D --type {private|public|group|system|catalog} [fields…]
pt task update TASK_ID [fields…]          # PATCH: only passed fields change; needs ≥1 field
pt task get TASK_ID
pt task upload-text TASK_ID (--text "…" | --text-file F) [--name N] [--metadata M] [--path /dir]
pt task add-docs TASK_ID FILE... [--path /dir] [--metadata M] [--attachment-mode search|context|archived|attached] [--ocr-instructions T]
pt task delete-docs TASK_ID DOC_ID... [--yes]     # DESTRUCTIVE
pt task delete TASK_ID [--yes]            # DESTRUCTIVE; prompts unless --yes
pt task duplicate TASK_ID
pt task set-public TASK_ID                # visibility (was: task publish)
pt task set-private TASK_ID               # visibility (was: task unpublish); other types: task update --type
pt task publish DIRECTORY --virtual-assistant-id ID [--task-id TASK_ID] [--type T] [--chat-history] [--docs-enabled] [--scheduled-jobs] [--global-memory] [--search-in-chat] [--search-in-documents] [--summary-enabled] [--email-integration] [--share-action] [--public-chat] [--run-immediately]   # defaults: private, all toggles OFF; optional task.json in DIRECTORY seeds them
pt task launch TASK_ID [--workspace-id ID|UUID] [--name N] [--version N]   # start a task in a new chat (like opening it in the UI); last line: Chat URL: …
pt task test DIRECTORY [--chat-id CHAT_ID] [--temporary|--permanent] [--open]
pt task export TASK_ID [-o FILE]          # portable config JSON (server fields stripped)
pt task import FILE [--profile ENV]       # create a NEW task from an exported file
pt task create-version TASK_ID [--version-name NAME]      # default name: Production
pt task upload-image TASK_ID FILE
pt image generate --prompt "…" -o out.png [--style realistic] [--size 1024x1024]   # the saved file's extension is corrected to the format the API returns (e.g. out.png → out.jpg for a JPEG)

# Voice/video (media processing; slow — long timeout). -p = --profile here.
pt voice stt FILE                                  # transcribe audio
pt voice tts --text "…" [--voice V] [--model M] [--provider P] [--speed N] [-o out.mp3]   # saves audio to -o when audio is returned
pt voice diarize FILE [--speaker-count N] [--speaker-name N] [--speaker-file F] [--collection-id N] [--save-mode M]
pt voice translate FILE                            # translate spoken audio to English
pt video analyze FILE [--extra-instructions "…"]
# MCP: transcribe_audio / text_to_speech / diarize_audio / translate_audio / analyze_video

pt search documents QUERY --collection-name NAME [--search-type mmr|similarity|similarity_score_threshold] [--top-k N] [--score-threshold F]
pt search chat CHAT_ID QUERY [tuning…] [--in-chat/--no-in-chat] [--in-documents/…] [--in-collections/…]
pt search collection COLLECTION_ID QUERY [tuning…] [--metadata '{"document_name": "…"}']
pt search messages QUERY --collection-name NAME [--chat-id N] [--user-id N] [--agent-id N] [tuning…]
pt search images COLLECTION_ID [--image FILE] [--query TEXT] [tuning…]   # image search within a collection (≥1 of --image/--query)
# `documents` and `messages` REQUIRE --collection-name (a vector store collection name, not a collection ID)
# A 500 from any search command usually means the collection doesn't exist — the CLI/MCP append a hint saying so; verify the name/id with `pt collection list`
```

Notable `task create`/`update` fields: `--goal` / `--goal-file` (mutually exclusive), `--virtual-assistant-id`, `--schedule-nl "every Monday at 9am"` + `--schedule-prompt "…"`, `--canvas` / `--canvas-file` + `--page-type html`, `--extra '<json>'`, `--extra-vas 1,2,3`, `--tag-ids 4,5`, and paired toggles like `--global-memory/--no-global-memory`, `--chat-history/--no-chat-history`, `--docs-enabled/--no-docs-enabled`, `--scheduled-jobs/--no-scheduled-jobs`. Run `pt task create --help` for the full list.

## Installing PrimeThink skills

Use the installer that matches the agent's job:

```bash
pt install-skill                         # bundled, offline instructions for using this CLI
pt install-developer-skill               # full developer skill in ~/.claude/skills
pt install-developer-skill --project     # install in ./.claude/skills
pt install-developer-skill --dir PATH    # another Agent-Skills-compatible directory
pt install-developer-skill --force       # replace an existing complete installation
pt install-developer-skill --ref TAG_OR_COMMIT  # reproducible source version
```

`install-developer-skill` downloads the public [`primethink-developer`](https://github.com/primethink-ai/primethink-app-templates/tree/main/skills/primethink-developer) source. It is free and requires internet access, but no PrimeThink API token, GitHub login, or paid service. The installer recursively includes `SKILL.md`, `libraries/`, `references/`, scripts, hidden metadata, and every nested file; never replace it with a single-file `SKILL.md` download.

Default scope is `~/.claude/skills/primethink-developer`; `--project` uses `./.claude/skills/primethink-developer`, and `--dir PATH` uses `PATH/primethink-developer`. A custom public fork can be selected with `--repo-url URL`. Do not pass `--force` unless the user wants the existing complete folder replaced. The replacement is downloaded and staged before the old folder is moved, and unsafe or incomplete archives are rejected.

## Live App scaffolding

Use this before writing a new Live App unless the user already has a project:

```bash
# Recommended default for a full React project
pt live-app new ./app

# One-file HTML starter
pt live-app new ./app --framework html --no-flowbite

# No styling libraries
pt live-app new ./app --no-tailwind --no-flowbite
```

Defaults are React + Tailwind + Flowbite. Flowbite requires Tailwind, so never pass `--no-tailwind` without `--no-flowbite`. The destination must not exist; do not delete or rename user files just to make generation succeed. For reproducible work, pin a known tag or commit with `--ref`; a custom public catalog can be selected with `--repo-url`. After generation, read the generated `README.md` before editing because the default React/Flowbite variant uses Vite while the other default variants are no-build. The templates ship no sample entity; name every entity for this app (ChatDB is shared per chat, so a generic `item` collides with a sibling app's). The command never runs `npm install` or generated code.

## Publishing and testing projects

Four orchestration commands turn a **project directory** into a PrimeThink task, or into a test chat for trying it out (temporary by default, `--permanent` when you mean to keep it). They print human-readable progress lines, **not JSON**, so read the last line instead of piping to `jq`.

| Command | Creates | `GOAL.md` | Last line |
|---|---|---|---|
| `pt task publish DIR` | a task (no chat) | required, non-empty | `Task ID: 81` |
| `pt task launch TASK_ID` | a chat from a published task | — | `Chat URL: …/chats/<uuid>` |
| `pt live-app publish DIR` | a task + `@app` files | optional | `Live App task ID: 31` |
| `pt task test DIR` | a chat | required, non-empty | `Chat URL: …/chats/<id>` |
| `pt live-app test DIR` | a chat + `@app` files | optional | `Chat URL: …/chats/<id>` |

Project files: `GOAL.md` (the goal), `.name.config` (name; defaults to the directory name), `.description.config` (description; defaults to the name), `INITIAL_PROMPT.md` (initial prompt), `.image.png` (task image — uploaded by `live-app publish` only). Optional `task.json` (JSON object of task fields such as `type`, `chat_history`, `documents_and_collections_enabled`, `scheduled_jobs_enabled`) seeds `pt task publish`; explicit publish options override it. **Without either, a published task has type `private` and chat history, documents & collections and scheduled jobs OFF** — a task that ships documents or needs scheduling must set them (`--docs-enabled --scheduled-jobs --chat-history`, or `pt task update` afterwards).

### 1. Publish a new task

```bash
pt task publish ./tasks/morning-briefing --virtual-assistant-id 7
```
```text
Created task 81 from tasks/morning-briefing
Task ID: 81
```

Capture the ID, then re-run with `--task-id` to update instead of creating a duplicate:

```bash
out=$(pt task publish ./tasks/morning-briefing --virtual-assistant-id 7) || { echo "publish failed"; exit 1; }
printf '%s\n' "$out"
TASK_ID=$(printf '%s\n' "$out" | awk -F': ' '/^Task ID: /{print $2}')
[ -n "$TASK_ID" ] || { echo "no Task ID in output"; exit 1; }

pt task publish ./tasks/morning-briefing --task-id "$TASK_ID" --virtual-assistant-id 7
```

**Check the status *and* the value — neither alone is enough.** Capture `pt`'s output
instead of piping it into `awk`: a pipeline would report `awk`'s `0` rather than `pt`'s
status, so a failed publish would yield an empty `TASK_ID` and the follow-up run would
create a duplicate task instead of updating one. The status alone is not enough either — the
publish command can print its ID line and still exit non-zero, because a fatal file-upload
failure is reported after the sync summary, so a non-empty ID may still come from a run that
did not fully succeed.

**`pt live-app publish` takes no task-field flags** — only `--task-id`, `--virtual-assistant-id` (required), `--profile`, `--api-url`, `--app-dir` and `--version-name`; a Live App task is created as `type: private`, `status: published`, `chat_type: standard`, with every feature toggle **off**, and it ignores `task.json`. **`pt task publish`** accepts `--type` and the feature toggles (`--chat-history`, `--docs-enabled`, `--scheduled-jobs`, `--global-memory`, `--search-in-chat`, `--search-in-documents`, `--summary-enabled`, `--email-integration`, `--share-action`, `--public-chat`, `--run-immediately`) and an optional `task.json` in the project directory (option > task.json > the same all-off defaults). Anything not stated that way can still be changed afterwards with `pt task update`:

```bash
pt task update "$TASK_ID" --docs-enabled --scheduled-jobs --global-memory --type public
```

That follow-up survives re-publishing: an update run (`--task-id`) only PATCHes `name`, `description`, `goal`, `initial_prompt`, `virtual_assistant_id`, and `page_type`, leaving every other server field alone.

### 2. Publish a new Live App

```bash
pt live-app publish ./decision-board --virtual-assistant-id 7
```
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

Both checks matter here too, and this command is why: it prints `Live App task ID: 31` before
reporting a fatal file-upload failure, so a non-empty `$APP_TASK_ID` is not by itself proof
that the publish succeeded.

Same task defaults and same update rule as `task publish`, plus: the task gets `page_type: html`, a task version is created (`--version-name`, default `Production`), then the artifact is synced into the task's `@app` folder. Build **before** publishing — the command never runs a build. A failed version creation is only a `Warning:` and the publish still succeeds; failed file uploads are fatal and reported after the summary line.

### 3. Test a task on a new chat, and store the chat ID

`--chat-id` is optional, and omitting it creates a **new** chat every run — that is the default, not an opt-in. Store the ID so later runs update the same chat instead of littering the workspace.

```bash
# first run — create and record
out=$(pt task test ./tasks/morning-briefing --permanent) || { echo "test deploy failed"; exit 1; }
printf '%s\n' "$out"
CHAT_ID=$(printf '%s\n' "$out" | sed -n 's#^Chat URL: .*/chats/##p')
[ -n "$CHAT_ID" ] || { echo "no Chat URL in output"; exit 1; }
printf '%s\n' "$CHAT_ID" > ./tasks/morning-briefing/.chat-id

# Later runs: reuse it
pt task test ./tasks/morning-briefing --chat-id "$(cat ./tasks/morning-briefing/.chat-id)"
```

Write the file only after checking both the status and the ID — redirecting the command
straight into `.chat-id` truncates it the moment a run fails, losing the chat you were
iterating on. The status check alone would miss a run that exits `0` without printing a
`Chat URL:` line; the ID check alone would miss a run that printed the URL and then failed.
```text
Created permanent chat 3f2a-bb…
Updated goal for chat 3f2a-bb…
Chat URL: https://app.primethink.ai/chats/3f2a-bb…
```

`.chat-id` is a convention for you to follow, not a CLI feature — nothing reads it automatically. Add it to `.gitignore`; it points at one person's test chat.

**Pass `--permanent` for any chat whose ID you store.** The default is `--temporary`, fine for a one-shot check but a poor thing to pin an ID to. `--temporary/--permanent` and `--workspace-id` apply only to a newly created chat and are ignored with `--chat-id`.

`GOAL.md` is required and must be non-empty here. A new chat is created with page type `chat`; an existing one is switched to `chat`.

### 4. Test a Live App on a new chat, and store the chat ID

```bash
# first run — create and record
out=$(pt live-app test ./decision-board --permanent) || { echo "test deploy failed"; exit 1; }
printf '%s\n' "$out"
CHAT_ID=$(printf '%s\n' "$out" | sed -n 's#^Chat URL: .*/chats/##p')
[ -n "$CHAT_ID" ] || { echo "no Chat URL in output"; exit 1; }
printf '%s\n' "$CHAT_ID" > ./decision-board/.chat-id

# Iterate against the same chat after each rebuild
npm run build
pt live-app test ./decision-board --chat-id "$(cat ./decision-board/.chat-id)"
```
```text
Created permanent chat 9c11-de…
Updated goal for chat 9c11-de…
Synchronizing 3 file(s) from decision-board/dist
  Uploaded index.html
  Uploaded app.css
  Uploaded logo.svg
App sync complete: 3 uploaded, 0 updated, 0 unchanged, 0 failed
Chat URL: https://app.primethink.ai/chats/9c11-de…
```

The chat's page type is set to `html` on create and forced to `html` on reuse. `GOAL.md` is optional (the `Updated goal for chat …` line appears only when the file exists). `.image.png` is not uploaded in test mode — there is no task.

### The app artifact (both Live App commands)

Files come from `--app-dir`, else the first of `dist/`, `app/`, or the project root that contains `index.html` or `canvas.html`. `canvas.html` is uploaded **as** `index.html`. A selected artifact directory must be flat — any nested file aborts the run, so build to a flat output. From the project root, only web extensions are picked up (`.js .css .html .json .map .svg .png .jpg .jpeg .gif .webp .woff .woff2`); dotfiles are always skipped. A same-named remote document receives a **new version** (ID and relative links preserved), and identical content prints `Unchanged`.

### Gotchas for all four

- **Exit codes**: 0 on success, 1 on any failure. API rejections print on **stdout** (`Error: 404 - …`, `Error connecting to API: …`); the project-level failures raised as `click.ClickException` print on **stderr** (`Error: <reason>` for a missing/empty `GOAL.md`, no `index.html`/`canvas.html` entry, a non-flat artifact, or per-file upload failures collected and raised together after the summary line). Capture both streams when logging a run.
- **`test` never touches a task; `publish` never touches a chat.** Testing does not update the published task — re-run `publish` for that.
- The chat URL host is derived from the active profile's API URL (`api.` → `app.`); override with `--web-url`. `--open` launches a browser, so skip it in CI.
- `live-app test` uploads into `chats/<id>` and `live-app publish` into `tasks/<id>`, but both land in that owner's `@app` folder.

## MCP server

The same code runs as an MCP server via `pt mcp` (stdio), exposing the core API management operations as tools (`send_message`, `list_chats`, `create_task`, `launch_task`, `list_tasks`, `create_collection`, `chatdb_list`, `list_models`, `upload_agent_documents`, `search_documents`, …). Local scaffolding and the project publish/test orchestration commands remain CLI workflows. The MCP server needs the optional `mcp` extra: `pip install 'primethink-cli[mcp]'` (Python 3.10+). Prefer `pt mcp` when configuring an MCP client to give it PrimeThink tools; keep using the `pt` commands here for direct shell/scripting work. Auth is shared — set `PRIMETHINK_TOKEN` in the client's server env or rely on the active profile.

- **Set `PRIMETHINK_API_URL` alongside `PRIMETHINK_TOKEN`.** When only the token is set, the server silently defaults to the **production** API (`https://api.primethink.ai`). A token minted for another environment (dev/staging) will then hit the wrong host and fail with confusing `500`s. `pt mcp` prints the resolved API URL to stderr at startup and warns when the URL was defaulted — check that line if calls fail unexpectedly. Set `PRIMETHINK_API_URL` in the client's server env to match the token's environment.

## Common workflows

**Find a document ID, then download it** (IDs come from list output):
```bash
pt chat list-files 123 | jq '.documents[] | {id, filename}'
pt chat download-file 123 456 -o ./report.pdf
```

**Find a collection by name, then sync it locally:**
```bash
pt collection list --search "contracts"   # read the collection id from the JSON
pt collection sync-from <COLLECTION_ID> ./contracts
```

**Feed files to a chat, then ask about them:**
```bash
pt chat sync-to 123 ./docs --recursive
pt chat send 123 -m "Summarize the key risks in these documents"
```

**Keep a chat folder and a local directory reconciled (two-way):**
```bash
pt chat sync 123 ./workspace --dry-run   # preview: what would download/upload/skip
pt chat sync 123 ./workspace             # missing files copied both ways; files on both sides skipped
```
Use `--prefer remote` / `--prefer local` only when the user says which side wins for files present on both sides.

**Create a scheduled task:**
```bash
pt task create --name "Weekly report" --description "Compile weekly report" --type private \
  --virtual-assistant-id 7 --schedule-nl "every Friday at 4pm" \
  --schedule-prompt "Compile this week's report"
```
Verify afterwards with `pt task get <id>`.

**Seed and verify a Live App's ChatDB data (developer workflow):**
```bash
pt chatdb init 123                                            # once per chat
pt chatdb add 123 --entity todos --items '[{"title":"a"},{"title":"b"}]'
pt chatdb list 123 --entity todos                             # confirm the rows landed
```
Use this to seed fixture data before testing a Live App, or to inspect/verify the state a Live App wrote. Building the Live App itself is the `primethink-developer` skill's job.

If the Live App uses a **DB Collection** (`pt.db('project-db')` or `pt.db(42)`), add the same target to the commands: `pt chatdb list 123 --entity tasks --collection project-db` or `--collection-id 42`. Without it you read the chat's own ChatDB, which a DB Collection app never writes to. There is no `pt` command to attach the collection to the chat; that is done in the web app.

**Build a RAG-enabled agent correct-by-construction:**
```bash
pt models list --provider openai --only-configured    # pick a real model id (don't guess the string)
pt collection create --name "Product docs"            # note the id
pt collection upload-text <COLLECTION_ID> --text "…" --name faq.md   # or upload-files
pt collection reindex <COLLECTION_ID>                 # if search comes back empty, indexing may lag
pt agent create --name "Support" --public-description "Answers" --type-id 1 --model openai:gpt-…
pt agent attach-collections <AGENT_ID> <COLLECTION_ID>
```

**Deploy a task to another environment (export → git → import):**
```bash
pt task export 42 --output tasks/support_bot.json    # commit this file to git
pt task import tasks/support_bot.json --profile production
```
`import` always creates a NEW task (it does not update an existing one). Environment-specific IDs in the file (`virtual_assistant_id`, `extra_vas`, `default_evaluator_agent_id`) may need editing for the target environment. A raw `pt task get` dump also imports cleanly — server fields are stripped automatically.

## Error handling

- `No active profile` / `Profile 'X' not found` → run `pt profile list`; configure or pick an existing profile. Don't guess tokens.
- `Error: <status> - <body>` → the API rejected the request; read the body. 401/403 usually means a bad or expired token — ask the user for a new one.
- `Error connecting to API: …` → network or wrong `--api-url`; confirm the endpoint before retrying.
- `Error: No fields to update` (task update) → pass at least one field option.
- Destructive operations (`task delete`, `chat delete`, `agent delete`) prompt for confirmation — pass `--yes` only after the user has explicitly confirmed. Other irreversible operations (`profile remove`, overwriting local files via `download-file -o` / `sync-from` / `sync --prefer remote`) have no prompt; confirm with the user first.

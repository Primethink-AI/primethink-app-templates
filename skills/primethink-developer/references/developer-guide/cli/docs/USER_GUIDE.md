# PrimeThink CLI - User Guide

Welcome to the PrimeThink CLI User Guide! This comprehensive guide will help you get started with the PrimeThink command-line interface and make the most of its features.

For a terse, complete listing of every command and option, see the [CLI Reference](docs/cli-reference.md).

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Getting Started](#getting-started)
4. [Configuration](#configuration)
5. [Core Features](#core-features)
6. [Managing Chats](#managing-chats)
7. [Working with Chat Files](#working-with-chat-files)
8. [Working with Collections](#working-with-collections)
9. [Semantic Search](#semantic-search)
10. [Managing Agents](#managing-agents)
11. [Managing Tasks](#managing-tasks)
12. [Evaluating Tasks](#evaluating-tasks)
13. [Managing Settings](#managing-settings)
14. [Finding Users](#finding-users)
15. [Notifications](#notifications)
16. [Scaffolding Live Apps](#scaffolding-live-apps)
17. [MCP Server](#mcp-server)
18. [Common Use Cases](#common-use-cases)
19. [Tips and Tricks](#tips-and-tricks)
20. [Troubleshooting](#troubleshooting)
21. [FAQ](#faq)

## Introduction

The PrimeThink CLI is a powerful command-line tool that allows you to interact with PrimeThink's AI platform directly from your terminal. Whether you're looking to automate tasks, integrate AI into your workflows, or simply prefer working from the command line, the PrimeThink CLI makes it easy.

### What Can You Do With the CLI?

- Execute AI-powered task actions
- Send messages to chats and agents
- Manage multiple API tokens and environments
- Upload, download, and sync files with chats and collections
- Manage chats end to end: create, read messages, archive, delete
- Create, update, and manage agents (virtual assistants)
- Create, update, version, duplicate, and publish tasks — including scheduled tasks
- Export a task's config to a git-friendly JSON file and re-import it in another environment
- Search documents, chats, collections, and messages semantically
- Generate AI images from text prompts
- Scaffold React or HTML Live Apps from version-pinnable GitHub template catalogs
- Integrate PrimeThink into scripts and automation workflows

## Installation

### Requirements

- Python 3.8 or higher
- pip (Python package installer)
- Internet connection

### Install via pip

```bash
pip install primethink-cli
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
PrimeThink CLI v1.5.0
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

This prints your user details, groups, active group, and the LLM providers you have API keys for (`configured_providers`) as JSON — if it succeeds, your token works. It also takes `--profile`, which makes it the quickest way to verify which account each profile points at:

```bash
pt whoami --profile production | jq '.user.email'
```

You can also list available task actions:

```bash
pt task actions
```

If you see a list of available actions, you're all set!

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

> **Heads-up:** in most groups (e.g. `pt task`, `pt agent`, `pt search`, `pt settings`,
> `pt user`, `pt eval`), `pt image generate`, and `pt whoami`, `-p` is the short flag for
> `--profile`. In the `pt chat` and `pt collection` groups there is no `-p` for profile —
> there `-p` is the short flag for `--path` (a directory inside the chat or collection) on
> the file commands. Use the long form `--profile` when in doubt.

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
pt profile add --token DEV_TOKEN --profile development --api-url https://dev-api.primethink.ai

# Configure for production
pt profile add --token PROD_TOKEN --profile production --api-url https://api.primethink.ai

# Configure for local testing
pt profile add --token TEST_TOKEN --profile local --api-url http://localhost:8000
```

You can also override the API URL for a single request with `--api-url`/`-u` on any command.

### Configuration File

Your configuration is stored at `~/.primethink/config.json`. You can view it:

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
export PRIMETHINK_API_URL="https://staging-api.primethink.ai"
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

### Rename a chat or update its goal

```bash
pt chat rename 123 "Q3 planning (final)"

pt chat goal 123 --goal "Track the Q3 launch checklist"
pt chat goal 123 --goal-file ./goal.md
```

### Organizing chats into workspaces

Workspaces group related chats. The `pt workspace` group manages them:

```bash
# Create one and add chats to it
pt workspace create --name "Client A" --goal "Everything for Client A"
pt workspace add-chat 9 123          # add chat 123 to workspace 9
pt workspace remove-chat 123          # take chat 123 out of its workspace

# Organize
pt workspace list --pinned
pt workspace rename 9 "Client A — 2024"
pt workspace pin 9
pt workspace archive 9

# Delete (add --delete-chats to also delete the chats inside; asks for confirmation)
pt workspace delete 9
```

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

### Delete a file

Remove a file from a chat by its document ID (asks for confirmation; `--yes` to skip):

```bash
pt chat delete-file 123 456
pt chat delete-file 123 456 --yes
```

### Create a document from raw text

No local file needed — pass the body inline or from a file. The same command exists for collections and tasks (`pt collection upload-text`, `pt task upload-text`):

```bash
pt chat upload-text 123 --text "Key decisions from the call: ..." --name decisions.md
pt chat upload-text 123 --text-file ./notes.md --path /notes
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

### Managing folders

Chats, collections, tasks, and agents organise their files into directories, and the same four commands work under each of `pt chat`, `pt collection`, `pt task`, and `pt agent` (list a folder's contents with the group's `list-files`):

```bash
pt chat mkdir 123 /reports                         # create
pt chat rename-dir 123 /reports /reports-2024       # rename
pt chat move-dir 123 /reports-2024 /archive --merge # move (merge if the target exists)
pt chat rmdir 123 /archive --recursive              # delete (asks for confirmation; --yes to skip)
```

Swap `chat`/`123` for `collection`/`task`/`agent` and the matching ID — the commands are identical.

### Document versions

Documents in chats, collections, and tasks keep a version history. The same commands work under `pt chat`, `pt collection`, and `pt task` (get a document ID from `list-files`):

```bash
pt chat list-versions 123 456                                  # history
pt chat new-version 123 456 ./updated.pdf --version-name v2     # new version from a file
pt chat new-text-version 123 456 --text "revised body"          # ...or from raw text
pt chat set-production-version 123 456 2                         # promote version 2 to production
pt chat delete-version 123 456 1 --yes                          # delete a version
```

### Chat members

Set up a multi-user chat by inviting users and/or agents (both are identified by ID; agents are virtual assistants):

```bash
# Who's in the chat?
pt chat list-users 123

# Invite (at least one --user-id or --agent-id required)
pt chat invite-members 123 --user-id 10 --user-id 11 --agent-id 7

# Remove
pt chat remove-members 123 --user-id 11
```

### Message operations

Edit, delete, clear, retry, export, or turn a chat into a task:

```bash
pt chat edit-message 456 "corrected text"
pt chat retry-message 456
pt chat delete-message 123 456                 # asks for confirmation
pt chat clear-messages 123                       # wipes the whole chat (confirm)

# Export a single message to a file
pt chat export-message 123 456 --format pdf -o answer.pdf

# Turn the chat into a reusable task
pt chat save-as-task 123 --name "Support recap" --type private
```

## Working with Collections

Collections are shared document stores. The `pt collection` file commands work exactly like their `pt chat` counterparts, plus there's a discovery command.

### Find your collections

```bash
# List collections (paginated, 20 per page)
pt collection list

# Search by name, with a bigger page
pt collection list --search contracts --page-size 50
```

### Create, inspect, update, and delete collections

```bash
# Create a collection
pt collection create --name "Knowledge base"
pt collection create --name "Support skill" --type skill --public

# Inspect a collection (name, indexed flag, documents, …)
pt collection get 42

# Update fields (PATCH — only what you pass changes)
pt collection update 42 --name "Renamed KB" --indexed

# Rebuild the vector store (use if a fresh upload isn't searchable yet)
pt collection reindex 42

# Duplicate a collection (takes the UUID, not the numeric id)
pt collection copy <COLLECTION_UUID>

# Delete a collection (asks for confirmation; --yes to skip)
pt collection delete 42
```

Collections that hold images can be searched visually with `pt search images <COLLECTION_ID> --query "a red car"` or `--image ./example.jpg`.

### File operations

```bash
# Browse
pt collection list-files 42
pt collection list-files 42 --path /policies

# Upload
pt collection upload-files 42 handbook.pdf --path /policies

# Download
pt collection download-file 42 789 --output handbook.pdf

# Create a document from raw text (no local file)
pt collection upload-text 42 --text "Return policy: 30 days." --name policy.md
pt collection upload-text 42 --text-file ./faq.md --path /support

# Delete files by document ID (asks for confirmation; --yes to skip)
pt collection delete-file 42 789
pt collection delete-file 42 789 790 791 --yes

# Sync in both directions
pt collection sync-to 42 ./knowledge-base --recursive
pt collection sync-from 42 ./kb-backup
```

> Document IDs come from `pt collection list-files`.

## Working with ChatDB (Live App data)

ChatDB is a chat's structured data store — the store that PrimeThink **Live Apps** read from and write to. The `pt chatdb` group lets you manage that data directly, which is handy for seeding fixture data before you test a Live App, or for inspecting and verifying the state a Live App produced (previously only reachable in the browser).

Data is grouped into named **entities** (like tables); each row has an `id`. Initialize the store once per chat, then read and write rows.

```bash
# Initialize the store for a chat (once)
pt chatdb init 123

# Add rows — a single row, or many at once
pt chatdb add 123 --entity todos --data '{"title": "ship it", "done": false}'
pt chatdb add 123 --entity todos --items '[{"title": "a"}, {"title": "b"}]'

# List rows, optionally filtered
pt chatdb list 123 --entity todos
pt chatdb list 123 --entity todos --filters '{"done": false}' --limit 20

# Read, update, and delete a specific row
pt chatdb get 123 7
pt chatdb update 123 --entity-id 7 --data '{"done": true}' --merge
pt chatdb delete 123 --entity-id 7          # asks for confirmation; --yes to skip
```

`--data` takes a single JSON object; `--items` takes a JSON array for bulk operations. On update, `--merge` patches the existing row while `--replace` overwrites it, and `--if-unchanged-since TIMESTAMP` guards against overwriting a row that changed underneath you.

### DB Collections

A **DB Collection** is a collection of type `db` that holds the same kind of entities, but can be shared between chats. Once one is attached to a chat, `list`, `get`, `add`, `update` and `delete` can target it instead of the chat's own ChatDB, by name or by ID:

```bash
pt collection create --name project-db --type db     # note the id, e.g. 42
# attach it to the chat in the web app, then:
pt chatdb add 123 --entity tasks --data '{"title": "a"}' --collection project-db
pt chatdb list 123 --entity tasks --collection-id 42
```

Prefer `--collection-id` when two attached DB Collections share a name, or in scripts that should survive a rename. If you pass both, they must identify the same collection. A collection attached read-only accepts `list`/`get` but rejects writes. This mirrors `pt.db('project-db')` / `pt.db(42)` in a Live App.

> Building the Live App itself (the front-end that uses this data) is covered by the **primethink-developer** skill; `pt chatdb` is the deterministic data plane underneath it.

## Semantic Search

The `pt search` group finds content by meaning rather than exact keywords. There are four scopes:

```bash
# Within one chat (messages; optionally its documents and collections)
pt search chat 123 "what did we decide about the deadline"

# Within one collection's documents
pt search collection 42 "termination clause"

# Across documents in a vector store collection (--collection-name is required)
pt search documents "refund policy" --collection-name kb

# Across chat messages (--collection-name is required), with optional filters
pt search messages "standup notes" --collection-name msgs --chat-id 5 --user-id 2
```

All four accept the same tuning options:

- `--search-type` — `mmr` (server default), `similarity`, or `similarity_score_threshold`
- `--top-k` — how many results to return
- `--score-threshold` — minimum similarity score

Extras per command:

- `pt search chat` has scope toggles: `--in-chat/--no-in-chat`, `--in-documents/--no-in-documents`, `--in-collections/--no-in-collections`
- `pt search collection` accepts `--metadata '{"document_name": "contract.pdf"}'` to filter by document metadata

> Note: `--collection-name` (for `documents`/`messages`) is a **vector store collection name**, not the numeric collection ID used by `pt collection` commands.

> If a search returns `Error: 500`, the collection you named most likely doesn't exist (the API answers a raw 500 rather than a 404). The CLI appends a hint saying so — double-check the name/id with `pt collection list`.

## Discovering Models

Before creating an agent or group, look up a real model id instead of guessing the string. The `pt models` group reads the catalog:

```bash
# LLM models the workspace can actually use
pt models list --only-configured

# Filter by capability/provider, and grab the ids
pt models list --provider openai --vision | jq '.[].id'

# Embedding models (for collections/RAG)
pt models embeddings --only-configured
```

Both commands return a **trimmed summary** (id, provider, context window, capability flags, whether the provider is configured) by default; add `--full` for the raw catalog records. Use a model's `id` for `pt agent create --model`.

## Tagging

Tasks, agents, capabilities, and collections can be tagged. The `pt tag` group lists, creates, and assigns tags — tags are namespaced by object type via `--model`:

```bash
pt tag list --model collection --only-used            # existing tags for collections
pt tag create --model collection --name legal          # create one
pt tag assign --model collection --owner-id 42 --tag-id 3 --tag-id 5   # set a collection's tags
```

`assign` replaces the object's whole tag set with the IDs you pass (pass none to clear them). Many create commands also accept `--tag-ids` directly (e.g. `pt task create`, `pt agent create`).

## Managing Groups

The `pt group` group manages groups (organizations) — their details, members, invites, and the agents available inside them:

```bash
pt group list
pt group get 5
pt group create --name "Acme"
pt group update 5 --name "Acme Inc"       # PUT — --name is required

# Members and invites
pt group members 5 --search ann
pt group invite --email new.hire@acme.co --role-id 2   # invites to the current group
pt group remove-member 5 42

# Agents available in the group
pt group add-agent 5 7 8
pt group remove-agent 5 7

pt group delete 5                          # DESTRUCTIVE (asks for confirmation)
```

## Managing Agents

The `pt agent` group manages agents (virtual assistants) — the AI assistants you message with `pt chat send --agent`.

### Discover and inspect agents

```bash
# List agents, with optional filters
pt agent list
pt agent list --search support --status archived

# Trim each agent to lightweight fields (heavy config dropped)
pt agent list --summary

# Full details for one agent
pt agent get 7
```

> Tip: a full agent list embeds each agent's config, description, and
> capabilities, so a busy workspace can be a big payload. Use `--summary` for a
> quick overview, then `pt agent get` for the one you care about.

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
  --model gpt-test \
  --access-type group
```

- `--description` / `--description-file` — the agent's description/instructions, inline or from a file
- `--model` — which model the agent uses (get a real id from `pt models list`, don't guess)
- `--access-type` — `private` (default), `group`, `task`, `system`, or `catalog`
- `--tag-ids 3,4`, `--extra '{"key": "value"}'`, `--help-text`, `--help-url`

### Give an agent knowledge (RAG)

Attach documents and collections so an agent can retrieve from them:

```bash
# Upload files straight into the agent's knowledge base
pt agent upload-docs 7 handbook.pdf faq.md --attachment-mode search

# See what's attached
pt agent list-docs 7

# Attach / detach shared collections (find collection ids with `pt collection list`)
pt agent attach-collections 7 42 43
pt agent detach-collection 7 43
```

### Update or delete an agent

```bash
# PATCH semantics: only the fields you pass change
pt agent update 7 --model gpt-test-2 --public-description "New blurb"

# Delete — prompts for confirmation unless you pass --yes
pt agent delete 7
```

### Message an agent

Messaging stays under `pt chat send` — there is deliberately no separate `pt agent send`:

```bash
pt chat send --agent 7 --message "Analyze this data" --files data.csv
```

## Managing Agent Capabilities

Capabilities are reusable tools/behaviours (internal, MCP, API, computer-use, or sandbox) that agents can use. The `pt capability` group is full CRUD:

```bash
# List (optionally by type/tag, or archived)
pt capability list --type mcp
pt capability list --archived

# Create — name and code are required
pt capability create --name "Web search" --code web_search --type mcp \
  --access-type group --options '{"endpoint": "https://…"}'

# Update (PATCH — only the fields you pass change)
pt capability update 12 --description "Searches the public web"

# Archive / unarchive / duplicate
pt capability archive 12
pt capability unarchive 12
pt capability duplicate 12

# Delete (asks for confirmation; --yes to skip)
pt capability delete 12
```

Types are `internal`, `mcp`, `api`, `computer_use`, `sandbox`; access types are `system`, `group`, `user`, `private`. `--options` takes a JSON object of capability-specific config.

## Managing Tasks

The `pt task` group lets you list, create, inspect, update, and version tasks from the terminal.

### List tasks

```bash
# List tasks (paginated; server default status is "published")
pt task list

# Filter by name, type, and status
pt task list --search onboarding --type private --status all

# Grab just the IDs
pt task list | jq '.items[].id'
```

Filters mirror the web app: `--type` (repeatable), `--status` (`all`/`published`/`archived`), `--page-type` (`chat`/`html`/`react`), `--starred/--no-starred`, `--order-by`, `--order-dir`, and `--page`/`--page-size`. See the [CLI Reference](docs/cli-reference.md#pt-task-list) for the full list.

### Create a task

Three fields are required — name, description, and type (`private`, `public`, `group`, `system`, or `catalog`):

```bash
pt task create --name "Weekly digest" --description "Summarize the week" --type private
```

Everything else is optional and left to server defaults unless you set it. Some highlights (see the [CLI Reference](docs/cli-reference.md#pt-task-create) for the full list):

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

### Duplicate, publish, test, change visibility, or delete a task

```bash
# Clone a task (prints the new task's JSON, including its id)
pt task duplicate 99

# Publish a conventional task project; GOAL.md is required
pt task publish ./tasks/briefing --virtual-assistant-id 7
pt task publish ./tasks/briefing --virtual-assistant-id 7 --type group --chat-history --docs-enabled --scheduled-jobs
pt task publish ./tasks/briefing --task-id 99 --virtual-assistant-id 7

# Launch a task into a new chat, optionally inside a workspace (prints the chat JSON + URL)
pt task launch 99 --workspace-id 738

# Sync the project goal into a new temporary chat or an existing chat
pt task test ./tasks/briefing
pt task test ./tasks/briefing --chat-id CHAT_UUID

# Toggle a task's visibility (its type) between public and private
pt task set-public 99
pt task set-private 99

# Delete a task — prompts for confirmation unless you pass --yes
pt task delete 99
pt task delete 99 --yes
```

A project directory can override its folder name with `.name.config`, its description with `.description.config`, and its initial prompt with `INITIAL_PROMPT.md`. For type changes other than public/private (e.g. `group` or `catalog`), use `pt task update 99 --type group`.

`pt task publish` prints progress lines rather than JSON, ending with `Task ID: 81`. Task type and feature toggles come from its options (`--type`, `--chat-history`, `--docs-enabled`, `--scheduled-jobs`, `--global-memory`, `--search-in-chat`, `--search-in-documents`, `--summary-enabled`, `--email-integration`, `--share-action`, `--public-chat`, `--run-immediately`), else from an optional `task.json` in the project directory (`{"type": "group", "chat_history": true, "documents_and_collections_enabled": true, "scheduled_jobs_enabled": true}`), else from the conservative defaults: a created task is **private** with memory, chat history, search, summary, documents and collections, scheduled jobs and email integration **switched off** — so a task that relies on its documents or on scheduling must enable them. A later `pt task publish --task-id` re-syncs name, description, goal, initial prompt, virtual assistant and page type plus every type/toggle given on the command line and every accepted field present in `task.json`; settings the project does not state are not overwritten.

`pt task launch TASK_ID` starts a task the way the web app does when you open one: it creates a chat (inside `--workspace-id` when given) that inherits the task's goal, default agent, settings, documents, collections and scheduled job, posts the task's initial prompt, and prints the chat JSON followed by `Chat URL: …`. `pt chat create --from-task-id TASK_ID` does the same through the generic chat-create command.

`pt task test` creates a **new** chat unless you pass `--chat-id`, and prints the chat URL as its last line. A test chat is temporary by default; pass `--permanent` when you mean to keep it. To keep re-testing in the same chat, record the ID on the first run:

```bash
# first run — create and record
out=$(pt task test ./tasks/briefing --permanent) || { echo "test deploy failed"; exit 1; }
printf '%s\n' "$out"
CHAT_ID=$(printf '%s\n' "$out" | sed -n 's#^Chat URL: .*/chats/##p')
[ -n "$CHAT_ID" ] || { echo "no Chat URL in output"; exit 1; }
printf '%s\n' "$CHAT_ID" > ./tasks/briefing/.chat-id

# Later runs: update that same chat
pt task test ./tasks/briefing --chat-id "$(cat ./tasks/briefing/.chat-id)"
```

Write the file only after checking both the status and the ID — redirecting the command
straight into `.chat-id` truncates it the moment a run fails, losing the chat you were
iterating on. The status check alone would miss a run that exits `0` without printing a
`Chat URL:` line; the ID check alone would miss a run that printed the URL and then failed.

`.chat-id` is just a convention — no command reads it automatically. Keep it out of git; it points at your own test chat.

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

### Task knowledge documents

Give a task its own documents (parallel to chat/collection uploads):

```bash
# Upload files into the task's knowledge base
pt task add-docs 99 spec.pdf notes.md --attachment-mode search

# Delete documents by ID (asks for confirmation; --yes to skip)
pt task delete-docs 99 12 13
```

You can also create a task document from raw text with `pt task upload-text` (see the chats section for the shared options).

### Task images

```bash
# Upload a cover/icon image for a task
pt task upload-image 99 ./cover.png

# Generate an image with AI and save it locally
pt image generate --prompt "A lighthouse at dawn, watercolor" --output lighthouse.png
pt image generate --prompt "Minimal flat team logo" --style illustration --size 512x512 -o logo.png
```

> The output file's extension is corrected to match the format the API actually returns — if you ask for `lighthouse.png` but the API sends a JPEG, it's saved as `lighthouse.jpg` and the command tells you.

### Voice and video

The `pt voice` and `pt video` groups process media (these use the longer 120s timeout):

```bash
pt voice stt meeting.m4a                              # transcribe
pt voice translate call.wav                            # translate spoken audio to English
pt voice diarize call.wav --speaker-count 2            # who spoke when
pt voice tts --text "Welcome aboard" --voice nova -o welcome.mp3   # synthesize speech
pt video analyze demo.mp4 --extra-instructions "summarize the UI shown"
```

`pt voice tts` saves the audio to `--output` (default `tts.mp3`) when the API returns audio; if it returns JSON (e.g. a URL) that's printed instead.

## Scheduling Jobs in a Chat

A scheduled job runs a prompt on a schedule inside a chat — think cron for chats. The `pt scheduled-job` group manages them:

```bash
# List the jobs in a chat
pt scheduled-job list 123

# Create one — --schedule-nl accepts plain English or cron
pt scheduled-job create --chat-id 123 --schedule-prompt "Post the daily digest" \
  --schedule-nl "every weekday at 9am" --notify

# Pause / resume
pt scheduled-job set-status 45 --status Paused
pt scheduled-job set-status 45 --status Active

# Update or delete
pt scheduled-job update 45 --schedule-prompt "Post the weekly digest"
pt scheduled-job delete 45
```

> Because `--schedule-nl` is interpreted by an LLM server-side, `create`/`update` calls that include it use a longer (120s) timeout — don't treat the wait as a hang.

## Evaluating Tasks

The `pt eval` group tests a task against a set of expected question/answer cases, then scores its actual responses. The typical flow is: **build a plan** (`pt eval add`), **configure how it runs** (`pt eval settings`), **run it** (`pt eval run`), then **read the results** (`pt eval results`). Every command takes the task ID.

### 1. Build the evaluation plan

Each test case pairs a user query with the ideal response and a match type — `exact` (exact match), `similar` (fuzzy/semantic match), or `agent` (an evaluator agent judges the answer):

```bash
# See existing cases
pt eval list 99

# Add cases
pt eval add 99 --user-query "What's your return window?" --ideal-response "30 days" --type similar
pt eval add 99 --user-query "Refund a gift?" --ideal-response "Yes, store credit" --type agent --evaluator-agent-id 7

# Edit or remove a case (delete is destructive; --yes to skip the prompt)
pt eval update 99 EVAL_ID --ideal-response "30 days from delivery"
pt eval delete 99 EVAL_ID
```

`--examples '{...}'` attaches good/bad example fields; `--chat-group` (default `1`) groups related cases.

### 2. Configure how evaluations run

```bash
pt eval settings 99 --active --run-time daily --evaluator-agent-id 7 --pass-threshold 80
```

`--run-time` is `manual`, `daily`, `weekly`, or `monthly`; `--pass-threshold` is the minimum score to count as a pass, as a whole-number percentage from 1 to 100 (`80`, not `0.8`) — anything outside that range is rejected by the CLI before a request is made; `--message-delay-ms` throttles messages during a run.

### 3. Run it, then read the results

```bash
# Run the evaluation (optionally against a specific task version or model)
pt eval run 99
pt eval run 99 --version 2 --model-override gpt-test

# Inspect past runs and their results
pt eval runs 99
pt eval run-get 99 RUN_ID
pt eval results 99 --run-id RUN_ID
pt eval download 99 RUN_ID -o results.json
```

### Simulations

Simulations drive the task with a *simulator* agent toward a goal for up to `--max-turns`, then score the transcript:

```bash
pt eval simulate 99 --simulator-agent-id 5 --goal "Get a refund on a gift" --max-turns 10 --evaluator-agent-id 7
pt eval simulations 99
pt eval delete-simulation 99 SIM_ID          # destructive; --yes to skip the prompt
```

## Managing Settings

The `pt settings` group reads and writes group and user settings, including provider API keys. Settings live at two **scopes** — `group` and `user` — and some keys exist at both. **Secret values are never shown**: listing/getting a setting reports only whether it `is_set` and whether it's `sensitive`, and a sensitive value is redacted on `get`.

```bash
# See what's set (optionally narrow to one scope)
pt settings list
pt settings list --scope group

# Read one value (sensitive values come back redacted)
pt settings get timezone --scope user
```

### Set a provider API key

Any `*_API_KEY` key (e.g. `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`) is stored as a secret at group scope. After setting one, `pt whoami` lists that provider under `configured_providers`:

```bash
pt settings set ANTHROPIC_API_KEY sk-ant-… --scope group
pt whoami | jq '.configured_providers'
```

### Set the group's default agent, or other settings

```bash
# The group default agent is just a setting
pt settings set default_agent 7 --scope group

# Other known group keys: voice, voice_provider, new_chat_logic, group_mode,
# default_role, document_analysis_active, public_name, custom_theme_color
# User keys: timezone, location, default_language, default_va, auto_archive_option, custom_theme_color
pt settings set timezone "Europe/Rome" --scope user
```

Pass `--scope` explicitly whenever a key exists at both scopes. Delete a key/value setting with `pt settings delete KEY --scope … --yes` (dedicated properties can't be deleted).

## Finding Users

The `pt user` group looks up the users you can see, by name or email. The endpoint returns your full visible-users list, so the CLI applies `--search` and `--limit` **client-side**:

```bash
# Everyone you can see
pt user list

# Filter by name/email, cap the count, or get richer records
pt user search ann@acme.co
pt user list --search support --limit 20
pt user list --full
```

This pairs with inviting people to a chat by email — `pt chat invite-members` resolves an `--email` to a user ID via the same visible-users directory:

```bash
pt chat invite-members 123 --email teammate@acme.co
```

## Notifications

The `pt notification` group reads your notifications and marks them read or unread (sending a notification isn't exposed by the API). `--unread-only` filters the current page **client-side**:

```bash
# List notifications (newest first); page through with --page / --page-size
pt notification list
pt notification list --unread-only

# How many are unread?
pt notification unread-count

# Mark one read / unread, or clear them all
pt notification mark-read 42
pt notification mark-unread 42
pt notification mark-all-read

# Delete one (prompts unless --yes)
pt notification delete 42 --yes
```

## Scaffolding Live Apps

`pt live-app new` initializes a Live App locally from PrimeThink's public template catalog. It does not call the PrimeThink API, so no token or profile is needed. This makes it suitable for coding agents that need a safe, deterministic starting point.

```bash
# Default: full React + Vite + Tailwind + Flowbite
pt live-app new ./my-live-app

# Simple one-file HTML + Tailwind, without Flowbite
pt live-app new ./simple-app --framework html --no-flowbite

# React with hand-written CSS and neither styling library
pt live-app new ./plain-react --no-tailwind --no-flowbite
```

Defaults are `--framework react --tailwind --flowbite`. Flowbite depends on Tailwind, so `--no-tailwind` must be paired with `--no-flowbite`. The destination must not already exist; the command never merges into or overwrites an existing folder.

After generation:

1. Read the generated `README.md`; build and deployment steps differ by template.
2. Name every Chat DB entity for your app. The templates ship none, and a generic name such as `item` collides with a sibling app in the same chat.
3. Build the interface on the blank starter, keeping the PrimeThink wiring it ships: the runtime, the host-theme bridge, and the deployment configuration.
4. Build if required, then upload the files described by the template README.

The default Flowbite React starter is a Vite project and requires a local `npm install` and build. The other default starters are no-build, one-file HTML applications. The CLI itself intentionally runs neither package installation nor generated code.

### Use another GitHub template catalog

Pin a branch, tag, or commit when reproducibility matters:

```bash
pt live-app new ./company-app \
  --repo-url https://github.com/acme/primethink-templates \
  --ref v3.0.0
```

The URL must be a public HTTPS GitHub repository. A custom catalog defines its variants in `live-app-templates/manifest.json`; see the [CLI Reference](docs/cli-reference.md#pt-live-app-new) for the schema. Downloads and extracted files are size-limited and validated, and extraction is atomic.

### Publish and test a Live App

After building, the CLI discovers a flat artifact in `dist/`, then `app/`, then the project root. Override discovery with `--app-dir`. The artifact must contain `index.html` or `canvas.html` (deployed as `index.html`).

```bash
# Create or update the reusable Live App task
pt live-app publish ./my-live-app --virtual-assistant-id 7
pt live-app publish ./my-live-app --task-id 42 --virtual-assistant-id 7

# Iterate in a new temporary chat or update one chat in place
pt live-app test ./my-live-app
pt live-app test ./my-live-app --chat-id CHAT_UUID --open

# Explicitly switch any existing chat's renderer
pt chat type CHAT_UUID live-app
pt chat type CHAT_UUID chat
```

The commands read `.name.config`, `.description.config`, and optional `GOAL.md`; publish also uploads `.image.png` when present. Same-named app documents are updated as new versions — named `Production` unless `--version-name` says otherwise — preserving their IDs and relative links. Build before publishing or testing — neither command runs a build.

Both print progress lines rather than JSON. `pt live-app publish` ends with `Live App task ID: 31`; `pt live-app test` ends with the chat URL. As with `pt task test`, omitting `--chat-id` creates a new chat every run, so store the ID once and reuse it while iterating:

```bash
# first run — create and record
out=$(pt live-app test ./my-live-app --permanent) || { echo "test deploy failed"; exit 1; }
printf '%s\n' "$out"
CHAT_ID=$(printf '%s\n' "$out" | sed -n 's#^Chat URL: .*/chats/##p')
[ -n "$CHAT_ID" ] || { echo "no Chat URL in output"; exit 1; }
printf '%s\n' "$CHAT_ID" > ./my-live-app/.chat-id

# After each rebuild: re-upload into that same chat
npm run build
pt live-app test ./my-live-app --chat-id "$(cat ./my-live-app/.chat-id)"
```

Automated UI testing of a Live App is not part of the CLI. It is a deterministic, plan-driven workflow provided by the `primethink-developer` skill (`pt install-developer-skill`): the skill captures the running app's accessibility snapshot, authors a reviewable `tests/test_plan.yaml`, runs it with a bundled Playwright runner without an LLM in the execution loop, reads the structured results, and heals failing selectors before re-running.

## MCP Server

Core API management operations can also be exposed over the [Model Context
Protocol (MCP)](https://modelcontextprotocol.io) — the same code, running as a
server that AI assistants talk to directly. Instead of an assistant shelling out
to `pt`, it calls typed tools like `send_message`, `list_chats`, `create_task`,
and `search_documents`. Local scaffolding and project publish/test orchestration
remain CLI workflows.

### When to use it

- **Use `pt` commands** for your own terminal work, scripts, and automation.
- **Use `pt mcp`** to plug PrimeThink into an MCP client (Claude Code, Claude
  Desktop, or any MCP-compatible assistant) so it can operate on your PrimeThink
  account as part of a conversation.

### Setup

The MCP SDK is an optional dependency, so it isn't pulled in unless you ask for
it (and it needs Python 3.10+, while the core CLI still runs on 3.8+):

```bash
pip install 'primethink-cli[mcp]'
pt mcp        # starts the server on stdio; your MCP client launches this for you
```

Then add it to your MCP client's configuration. For Claude Desktop / Claude Code,
that's an entry under `mcpServers`:

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

Authentication is shared with the CLI: set `PRIMETHINK_TOKEN` (and optionally
`PRIMETHINK_API_URL` / `PRIMETHINK_PROFILE`) in the server's `env`, or leave it
out to use your configured active profile from `~/.primethink/config.json`. Each
tool also accepts optional `profile` and `api_url` arguments for per-call
overrides.

> **Set `PRIMETHINK_API_URL` too, not just `PRIMETHINK_TOKEN`.** With only the
> token set, the server defaults to the **production** API
> (`https://api.primethink.ai`). If your token is for a different environment
> (dev/staging), calls will hit the wrong host and fail with confusing `500`s.
> `pt mcp` prints the resolved API URL to stderr at startup and warns when the
> URL was defaulted — check that line if requests fail unexpectedly. The example
> above should include a matching `"PRIMETHINK_API_URL"` when your token isn't a
> production token.

A few things to know:

- Core API management operations have tool equivalents (messaging, chats, collections, tasks,
  agents, semantic search, images). Local scaffolding and project publish/test orchestration
  remain CLI workflows. Field-heavy tools like `create_task` expose common fields plus an
  `extra_fields` object for anything else.
- File and sync tools read and write on the machine where the server runs — your
  own machine, for a locally launched server.
- Unlike the CLI, delete tools don't prompt for confirmation; your MCP client is
  in charge of confirming destructive actions.

See the [CLI reference](docs/cli-reference.md#mcp-server-pt-mcp) for the complete
tool list.

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

pt task execute \
    --action analyze_document \
    --message "Analyze these documents" \
    $(printf -- '--files %s ' "$@")
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
# Test connectivity
ping api.primethink.ai

# Test API endpoint
curl https://api.primethink.ai/health
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
pt profile add --token DEV_TOKEN --profile dev --api-url https://dev-api.primethink.ai
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

**A**: The CLI supports uploading any file type. Support depends on the PrimeThink platform and the specific task action you're using.

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

**A**: Absolutely! The CLI is designed for automation and scripting. Commands print JSON to stdout and exit non-zero on failure. See the [Integration Guide](INTEGRATION_PAGE_TEXT.md) for examples.

### Q: Can AI coding agents (Claude Code etc.) use the CLI and build Live Apps?

**A**: Yes. Install the bundled CLI-usage skill and/or the complete public PrimeThink developer skill:

```bash
pt install-skill                  # teaches agents to use pt
pt install-developer-skill        # teaches Live Apps, Tasks, and SDK integrations

# Scope either installation to the current repository
pt install-developer-skill --project
```

`install-developer-skill` downloads the entire public skill recursively, including `libraries/`, `references/`, and their nested files. It is free, needs no PrimeThink token or GitHub login, and installs to `~/.claude/skills/primethink-developer` by default. Use `--force` to refresh an existing copy or `--dir PATH` for another compatible agent.

### Q: Can I use PrimeThink as an MCP server?

**A**: Yes — `pt mcp` runs the same code as an [MCP](https://modelcontextprotocol.io) server over stdio, exposing every command as a tool for MCP clients (Claude Code, Claude Desktop, …). Install the optional extra first:

```bash
pip install 'primethink-cli[mcp]'   # requires Python 3.10+
pt mcp
```

Point your MCP client at `pt mcp` and provide a `PRIMETHINK_TOKEN` in its server env. See the [MCP Server](#mcp-server) section for a full client-config example.

### Q: What is the `agent-tools` extra?

**A**: It enables the plugin that lets PrimeThink **agents** (not you) manage tasks, agents, chats, and collections through the same client code as `pt`. It's installed in the PrimeThink API image by platform operators, not on your machine — a plain `pip install primethink-cli` doesn't need it. See [docs/agent-tools.md](docs/agent-tools.md).

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

**A**: You can find chat IDs in the PrimeThink web interface URL or by using the API. The CLI also supports mention names (e.g., `@assistant-name`).

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

`--help` also works *before* the command it describes — the CLI resolves the rest
of the command path, so `pt --help chat send` and `pt chat --help send` print the
same page as `pt chat send --help`:

```bash
pt --help chat send
pt chat --help send
```

### Documentation

- [README](README.md) - Quick start guide
- [CLI Reference](docs/cli-reference.md) - Every command and option
- [SPECS](SPECS.md) - API specifications
- [DEVELOPER](DEVELOPER.md) - Developer guide
- [INTEGRATION](INTEGRATION_PAGE_TEXT.md) - Integration examples

### Support

- **Email**: support@primethink.ai
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

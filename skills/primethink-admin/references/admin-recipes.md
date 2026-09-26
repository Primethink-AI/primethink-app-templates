# Admin recipes (end-to-end workflows)

Copy-adapt these. All assume `pt whoami` shows the right environment + active group.

## Bootstrap a group for AI use
```bash
pt whoami                                             # confirm active group
pt settings set OPENAI_API_KEY sk-... --scope group
pt settings set ANTHROPIC_API_KEY sk-ant-... --scope group
pt models list --only-configured                      # verify providers now configured
pt agent types                                        # pick a type (e.g. Std3 = id 5)
# create the default assistant, then make it the group default:
AID=$(pt agent create --name "Assistant" --public-description "General assistant" \
      --type-id 5 --model openai:gpt-5.6-sol --access-type group \
      --description "You are a helpful assistant." | jq -r '.id')
pt settings set default_agent "$AID" --scope group
```

## Give an agent capabilities (by code, resolved for you)
```bash
pt capability resolve rag process_documents documents rag_documents   # preview code→id
pt agent update <agent_id> \
  --capability base --capability memory --capability rag \
  --capability process_documents --capability documents --capability rag_documents
pt agent get <agent_id> | jq '.capabilities[].code'   # ALWAYS verify what landed
```
`--capability` is repeatable and resolves env-specific ids for you. A group-scoped
capability the group hasn't enabled is dropped by the server, and the response says so in
`warnings: ["capabilities not applied …"]`. Still read back with `agent get`: `resolve` may
skip some user-scoped internal codes.

## Invite a colleague to a chat by email
```bash
pt user search "jane@acme.com" | jq '.[]? , .items[]? | {id,email}'   # resolve id
pt chat invite-members <chat_id> --email jane@acme.com                # or --user-id <id>
```

## Organise chats into a workspace
```bash
WS=$(pt workspace create --name "Q3 Planning" --goal "…" | jq -r '.id')
pt chat create --name "Kickoff" --workspace-id "$WS"
pt workspace add-chat "$WS" <existing_chat_id>
pt workspace pin "$WS"
```

## Publish a task and promote to catalog
```bash
pt task create --name "Weekly Digest" --description "…" --type private \
  --goal "Summarise the week." --virtual-assistant-id <id>
pt task update <task_id> --type catalog        # curated library (permission-gated)
pt task list --type catalog | jq '.[]?.name, .items[]?.name'   # verify
```

## Set / rotate a provider key safely
```bash
pt settings list --scope group | jq '.'        # see what's set (values masked)
pt settings set ANTHROPIC_API_KEY sk-ant-NEW --scope group
pt models list --only-configured | jq '.[]?.id, .items[]?.id' | grep anthropic
```

## Audit activity across workspaces
```bash
for WS in $(pt workspace list --page-size 100 | jq -r '.[]?.id , .items[]?.id'); do
  echo "workspace $WS:"
  pt chat list --workspace-id "$WS" --page-size 100 \
    | jq -r '(.[]? , .items[]?) | "  \(.id)\t\(.last_updated_at)\t\(.name // "—")"'
done
```

## Set up a shared DB Collection (data shared across chats)

A DB Collection (`type=db`) is a JSON entity store that every attached chat reads and writes in
common — see [concepts.md](concepts.md#db-collections-shared-data). Setup is: create it, attach
it to each chat (or to the task that spawns the chats), then verify from a chat.

```bash
pt whoami                                                    # right env + active group
CID=$(pt collection create --name crm --type db --private | jq -r '.id')
```

Attaching has no `pt` command — call REST with the token of a user who is a member of the chat
(header `Authorization: Token …`):

```bash
API=${PRIMETHINK_API_URL:-https://api.primethink.ai}
H="Authorization: Token $PRIMETHINK_TOKEN"

# Attach to one or more existing chats
for CHAT in 1201 1202 1203; do
  curl -fsS -X POST "$API/api/v1/chats/$CHAT/collections/$CID" -H "$H" >/dev/null
done

# ...or to a task: every chat created from the task gets the collection too
# (attach chats that already exist individually, as above)
curl -fsS -X POST "$API/api/v1/tasks/$TASK_ID/collections-files" \
  -H "$H" -H 'Content-Type: application/json' \
  -d "{\"collection_ids\": [$CID], \"file_ids\": []}"
```

Verify from one attached chat, and seed reference data if the use case needs it:

```bash
pt chatdb add 1201 --collection-id "$CID" --entity lead --data '{"name":"Acme","stage":"open"}'
pt chatdb list 1202 --collection-id "$CID" --entity lead     # same row, seen from another chat
```

If `pt chatdb list --help` shows no `--collection` / `--collection-id`, send the same request
to REST: `POST $API/api/v1/chats/<chat_id>/chatdb/list` with body
`{"collection_id": <CID>, "entity_names": ["lead"]}` (the `/entities` add/update/delete bodies
take `collection_id` / `collection_name` the same way).

Detach with `curl -X DELETE "$API/api/v1/chats/$CHAT/collections" -H "$H" -H 'Content-Type:
application/json' -d "[$CID]"`, or pause a chat's access without detaching with
`curl -X PUT "$API/api/v1/chats/$CHAT/collections/$CID/status?status=disabled" -H "$H"`.

Rules that matter here:
- **Keep every chat that shares a collection in one group.** Rows are stored per group, under
  the group of the chat making the call — attaching the same collection to chats in two groups
  silently gives each group its own separate data.
- **Deleting the collection does not delete its rows.** Clear the data first
  (`pt chatdb delete <chat_id> --collection-id $CID --ids …`) if it must not linger.
- Attaching to an **agent** (`pt agent attach-collections`) does not give any chat access —
  only a chat attachment (direct or via its task) does.
- Entity names must be identifiers (`lead`, `sales_lead`) — a hyphenated name can be written but
  never listed by name.

## Clean up test objects
```bash
pt chat delete <id> --yes
pt agent delete <id> --yes
pt task delete <id> --yes          # if delete_task 500s on your build, it's a known API bug
pt workspace delete <id> --yes     # add --delete-chats to also remove its chats
```

## jq tips
List endpoints may return a bare array **or** concatenated JSON objects **or** an
`{items:[…]}` envelope depending on the command. A resilient extractor:
```bash
pt <cmd> | jq -rs 'map(.items? // .) | flatten | .[] | .id'
```

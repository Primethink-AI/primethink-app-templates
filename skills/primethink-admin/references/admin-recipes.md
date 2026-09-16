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

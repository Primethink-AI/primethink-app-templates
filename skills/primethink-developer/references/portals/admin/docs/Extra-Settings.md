# Extra Settings Reference

This page is a single, consolidated reference for the **extra settings** (user/group variables) that PrimeThink features read at runtime — primarily the secrets and configuration values that capabilities and tool plugins resolve through `${SETTING_NAME}` placeholders.

Each setting is also documented in its own topic page, in context. This page collects them all in one place so you can see, at a glance, every setting the platform's documented features expect and where each one is used.

!!! note "These are *your* settings, not fixed platform keys"
    Extra settings are **user-defined**. You choose the name — it only has to match the `${...}` placeholder you write in a capability's options (or the key your plugin reads via `get_user_setting_value`). The names in the catalog below are the ones used throughout this documentation's examples; rename them freely as long as the placeholder and the setting agree.

---

## What Counts as an "Extra Setting"

PrimeThink has three distinct kinds of configuration. This page covers the **first**:

| Kind | Where it lives | What it does | Reference |
|------|----------------|--------------|-----------|
| **Extra settings (variables)** | Settings page → **User Variables** / **Group Variables**, plus per-workspace and per-chat variables | Key-value pairs (API tokens, base URLs, credentials) consumed by capabilities and plugins | *This page* |
| **App settings** | Settings page | Profile, message preferences, group settings | [App Settings](/App-Settings/) |
| **UI settings** | Backend feature toggles | Show/hide interface features per user or group | [UI Settings](/UI-Settings/) |

Extra settings are the values you store under [App Settings → Variables Management](/App-Settings/#variables-management). Two consumers read them:

- **Capabilities** (MCP, API, Sandbox, Computer Use) — via `${SETTING_NAME}` placeholders in their `options`.
- **Tool plugins** — programmatically, via the injected `context.get_user_setting_value(name, user_id, group_id)`. See [Tool Plugins → Plugin Context](Tool-Plugins.md#plugin-context-pt-services-injection).

---

## How Placeholder Resolution Works

Any string value in a capability's `options` can contain `${SETTING_NAME}` placeholders. They are resolved when the agent's tools are built:

1. The system scans the `options` for `${...}` tokens.
2. For each token it resolves the setting against the current user's settings, then the group's. (Capability options are built without a chat context, so the chat and workspace levels described in [the settings hierarchy](#where-a-value-comes-from-the-settings-hierarchy) do not apply here.)
3. The returned value replaces the placeholder.
4. If a setting can't be resolved (missing or empty), an `UnresolvedPlaceholderError` is raised and that capability/tool is **skipped** with a logged error — the rest of the agent still loads.

**Rules:**

- Setting names must be word characters only — letters, digits, and underscore. `${HA_REMOTE_TOKEN}` is valid; `${ha-token}` is not.
- Names are **case-sensitive**: `${MY_KEY}` looks for a setting named exactly `MY_KEY`.
- Resolution scope by capability type:
    - **MCP** — `server_label`, `server_url`, `require_approval`, `headers`, and any extra string/dict values.
    - **API** — `url` and `headers`.
    - **Sandbox** — `env` values passed into the sandbox.
    - **Computer Use** — `prompt` and `actions` text.

---

## Configuring a Setting

On the **Settings** page, open **User Variables** (personal) or **Group Variables** (shared across the group) and add a key-value pair:

```text
Setting name:  WEATHER_API_KEY
Setting value: sk-abc123...
```

The value is then available as `${WEATHER_API_KEY}` in any capability's options for that user/group. Settings can also be managed via the admin API. See [App Settings → Variables Management](/App-Settings/#variables-management) for the UI walkthrough.

---

## Where a Value Comes From: the Settings Hierarchy

A setting name can be stored at four levels. When a value is resolved, the **most specific level that holds the name wins**, and the rest are ignored:

```text
chat  >  workspace  >  user  >  group
```

| Level | Applies to | Who can set it |
|-------|-----------|----------------|
| **Chat** | one conversation | members of that chat, with the *Chat Variables* permissions |
| **Workspace** | every chat in a [shared workspace](/Collaboration/#shared-workspaces), for every member | the workspace owner, or any member when the workspace is fully `Shared`, with the *Workspace Variables* permissions |
| **User** | one person, across all their chats | that person, with the *Group Variables* / user variable permissions |
| **Group** | everyone in the group | Group Admins, with the *Group Variables* permissions |

If none of the four holds the name, resolution falls back to the platform's own configuration, and finally to an empty value. A level is skipped entirely when there is no context for it — a background job with no chat has no chat or workspace level to consult, and resolves exactly as it always did.

A setting's flags (whether its value is private, whether it may be injected into a sandbox) always come from the **same row that supplied the winning value**, never from a less specific level.

!!! note "Workspace values belong to the workspace, not to a member"
    A workspace-level value means the same thing for every member and keeps meaning it as members join and leave — it is resolved from the workspace itself, not from whoever happens to be sending the message. This is what makes it safe for a shared persistent sandbox, where a value that varied per member would make the sandbox's behaviour depend on who ran the turn. User-level values are deliberately kept out of shared sandboxes for that reason; chat and workspace values are one shared row and are not.

### Where the chat and workspace levels take effect

The two new levels are consulted wherever a value is resolved **with a chat in hand**:

- `${SETTING}` expansion in the text of a user's message
- `${SETTING}` expansion in an agent's system prompt
- Retrieval tuning — the number of results and the similarity threshold used for document search
- The agent job timeout
- [Sandbox](Sandbox-Capabilities.md) provider configuration and the environment variables injected into a sandbox

**Capability option placeholders are the exception.** The `${SETTING_NAME}` tokens in a capability's `options` are resolved when the agent's tools are built, which happens without a chat context, so they continue to resolve over the **user and group levels only**. Do not expect a chat- or workspace-level variable to override a credential referenced from a capability's options.

### Managing the new levels over the API

Workspace and chat variables have the same endpoints as group variables — list, read by name, create, update, and delete — under the workspace and the chat respectively, split the same way into *managed* and *not managed* settings.

Access is gated twice. The caller needs the matching *Workspace Variables* or *Chat Variables* permission, **and** must pass the ordinary access check for the container:

| Caller | Workspace variables |
|---|---|
| Workspace owner | read and write |
| Member of a `Shared` workspace | read and write |
| Member of an `Owner Only` workspace | read only |
| Member of a `View Only` workspace | no access |
| Not a member, another group, or not a workspace at all | reported as not found |

For **chat** variables, reading requires membership of the chat, and writing follows the same rule as renaming a chat or editing its goal. A chat or workspace you are not in is reported as *not found* rather than *forbidden*, so its existence is not disclosed.

Reading a setting **by name** at any level returns only stored values. It never falls through to the platform's own configuration or environment, so a caller cannot use it to read server secrets by guessing names.

---

## Settings Catalog

The settings below are referenced throughout the documentation. Each links to the page where it is used in full context.

### API Capabilities

| Setting | Holds | Used in |
|---------|-------|---------|
| `WEATHER_API_KEY` | Bearer token for the example weather API | [API Capabilities](API-Capabilities.md) · [Capabilities](Capabilities.md) · [Tool Plugins](Tool-Plugins.md) |
| `NEWSAPI_KEY` | `X-Api-Key` for the NewsAPI example | [API Capabilities](API-Capabilities.md) |
| `RESEND_API_KEY` | Bearer token for the Resend email API example | [API Capabilities](API-Capabilities.md) |
| `SMS_API_KEY` | Bearer token for the SMS-provider example | [Tool Plugins](Tool-Plugins.md) |

### Web Search

| Setting | Holds | Used in |
|---------|-------|---------|
| `SERPER_API_KEY` | API key for Google Serper search | [Internal Capabilities](Internal-Capabilities.md) · [Read Content of URL](Read-Content-of-URL.md#when-a-site-blocks-the-assistant) |
| `WEB_SEARCH_MAX_RESULTS` | Result count for provider-side web search (default `5`) | [Internal Capabilities](Internal-Capabilities.md#web-search-on-openrouter-models) |
| `WEB_SEARCH_ENGINE` | Search engine for OpenRouter's `web` plugin: `native`, `exa`, `firecrawl`, `parallel`, or `perplexity` | [Internal Capabilities](Internal-Capabilities.md#web-search-on-openrouter-models) |

### Web Page Fetching

Used by the [Read Content of URL](Read-Content-of-URL.md#when-a-site-blocks-the-assistant) tool when a site blocks a direct fetch or serves a page with no readable content.

| Setting | Holds | Used in |
|---------|-------|---------|
| `WEB_FETCH_PROVIDER` | Hosted page fetcher: `Auto` (default), `Tavily`, `Firecrawl`, `Jina`, `Serper`, or `None` | [Read Content of URL](Read-Content-of-URL.md#when-a-site-blocks-the-assistant) |
| `WEB_FETCH_STRATEGY` | `fallback` (default — only when the direct fetch fails) or `always` | [Read Content of URL](Read-Content-of-URL.md#when-a-site-blocks-the-assistant) |
| `TAVILY_API_KEY` | API key for Tavily; shared with web search | [Read Content of URL](Read-Content-of-URL.md#when-a-site-blocks-the-assistant) |
| `FIRECRAWL_API_KEY` | API key for Firecrawl | [Read Content of URL](Read-Content-of-URL.md#when-a-site-blocks-the-assistant) |
| `JINA_API_KEY` | API key for Jina Reader; optional, raises its rate limit | [Read Content of URL](Read-Content-of-URL.md#when-a-site-blocks-the-assistant) |
| `WEB_FETCH_USER_AGENT` | Overrides the User-Agent the direct fetch sends | [Read Content of URL](Read-Content-of-URL.md#when-a-site-blocks-the-assistant) |

### MCP Capabilities

| Setting | Holds | Used in |
|---------|-------|---------|
| `HA_REMOTE_TOKEN` | Bearer token for a remote Home Assistant MCP server | [MCP Capabilities](MCP-Capabilities.md) · [Tool Plugins](Tool-Plugins.md) |
| `GITHUB_MCP_PAT` | Personal access token for the GitHub MCP server | [MCP Capabilities](MCP-Capabilities.md) |

### Sandbox Capabilities

| Setting | Holds | Used in |
|---------|-------|---------|
| `GITHUB_TOKEN` | GitHub token injected into the sandbox `env` (e.g. as `GH_TOKEN`) | [Sandbox Capabilities](Sandbox-Capabilities.md) |
| `X_API_KEY` | Generic API key injected into the sandbox `env` as a secret | [Sandbox Capabilities](Sandbox-Capabilities.md) |

### Computer Use Capabilities

| Setting | Holds | Used in |
|---------|-------|---------|
| `ACME_USER` | Login username for the supplier-portal example | [Computer Use Capabilities](Computer-Use-Capabilities.md) |
| `ACME_PASSWORD` | Login password for the supplier-portal example | [Computer Use Capabilities](Computer-Use-Capabilities.md) |

### Tool Plugins

Plugins read settings programmatically rather than through `${...}` placeholders, using `context.get_user_setting_value(...)` (often wrapped in a settings-provider class). The example management plugin reads:

| Setting | Holds | Used in |
|---------|-------|---------|
| `manage_base_url` | Base URL of the management system the plugin calls | [Tool Plugins](Tool-Plugins.md#settings-abstraction-pattern) |
| `manage_token` | API token for the management system | [Tool Plugins](Tool-Plugins.md#settings-abstraction-pattern) |

---

## Security Notes

- **Never hard-code secrets** in capability options, prompts, scripts, or plugin code. Always store them as settings and reference them with `${...}` (or read them via `get_user_setting_value`).
- **Scope tokens to the minimum** access your agent needs — a compromised token grants whatever access it carries.
- **Prefer Group Variables** for shared service credentials so they're managed in one place; use **User Variables** for per-person tokens.
- **Use a Workspace Variable when a value belongs to a project rather than a person** — every member then resolves the same value, and it survives members joining and leaving. Remember it is readable by the workspace's members, so it is the wrong place for a personal credential.
- A **Chat Variable** is narrower still, and is the right level for a one-off override that must not leak into the rest of your work. It disappears with the chat.
- Settings values are write-focused in the UI — treat them like passwords.

---

## Related Topics

- [App Settings](/App-Settings/) — where User and Group Variables are configured
- [UI Settings](/UI-Settings/) — the separate interface feature-toggle system
- [Capabilities](Capabilities.md) — overview of agent capabilities
- [API Capabilities](API-Capabilities.md) · [MCP Capabilities](MCP-Capabilities.md) · [Sandbox Capabilities](Sandbox-Capabilities.md) · [Computer Use Capabilities](Computer-Use-Capabilities.md)
- [Tool Plugins](Tool-Plugins.md) — reading settings from plugin code

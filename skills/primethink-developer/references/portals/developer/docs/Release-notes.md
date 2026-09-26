# Release notes for developers

Changes that affect how you build against PrimeThink: the REST API, the CLI, Live Apps, agents, capabilities and tools, and group and channel configuration. Grouped by the week the work shipped, newest first.

For changes an end user of the app would notice, see the [user release notes](/Release-notes/).

### **Week of September 21, 2026**

**REST API**

* Settings now resolve over **four** stored levels instead of two: chat, then workspace, then user, then group, before falling back to the platform's own configuration. A level is skipped when there is no context for it, so a background job with no chat resolves exactly as before. A setting's flags — whether its value is private, whether it may be injected into a sandbox — always come from the row that supplied the winning value.
* Workspace and chat variables have the same endpoints as group variables, under the workspace and the chat respectively, split the same way into managed and not-managed settings. Access needs both the matching permission and the ordinary access check for the container: for a workspace, the owner always and other members only when it is fully shared; for a chat, membership to read and the same rule as editing a chat's name to write. A chat or workspace you are not in answers *not found* rather than *forbidden*. Reading a setting by name never falls through to platform configuration, so it cannot be used to fish for server secrets.
* Eight new permissions come with them — view, create, edit and remove for both `workspace_variables` and `chat_variables`. All are global scope and are seeded into the built-in roles on startup, so there is nothing to migrate.
* **Capability options are the exception to the new levels.** The `${SETTING}` placeholders in a capability's options are resolved when an agent's tools are built, which happens with no chat in hand, so they still resolve over the user and group levels only. Do not expect a chat- or workspace-level variable to override a credential referenced from a capability.
* Creating a chat from a task **and** a parent chat in the same call no longer loses the task's knowledge base. The parent's documents and collections used to replace the task's outright; they are now merged, and a document attached to both is linked once, keeping the task's own attachment.
* Listing or creating task simulations now requires that you own the task, hold a role granted access to it, or are a platform administrator — the rule the other evaluation routes already used. Previously any signed-in user could list any task's simulations by id, which exposes each one's goal, persona, prompt and response. A caller without access gets `403`; a task id that does not exist gets `404` instead of an empty list.
* A simulation result now survives the deletion of its inputs. Deleting the simulator agent used to destroy every grade it had ever produced, and deleting the chat the simulation ran in did the same. Both now leave the result in place; `chat_uuid` is nullable and absent when the transcript is gone. Deleting the task still deletes its simulations.
* A simulation carries an explicit `status` of `queued`, `started`, `finished` or `error`, rather than one inferred from timestamps. **`error` is terminal: poll for `finished` or `error`, not `finished` alone.** A run that fails records the reason, including a run that exceeded its time budget — previously a dead run read as running forever. Scheduled evaluation runs record failure the same way. A worker killed outright still cannot report anything, so a long-`started` run remains worth treating as suspect.
* Documents attached to a task or an agent now report their real `document_status`. The field was always `null` on those listings regardless of the actual state.

**Live Apps**

* `pt.documentUrl(uuid)` builds the URL for displaying or downloading a stored document. Use it for an `<img src>` or an `<a href>` instead of `pt._getUrl()` with a hand-written path — which is what every image-bearing app was doing, against a private method whose path can change. Pass the document's **uuid**, not its integer id; anything that is not a non-empty string throws immediately rather than producing a URL that 404s at render time. Note that the uuid is the access control: that URL streams the file without checking the viewer's session, so treat one like a signed URL.
* `pt.db()` now accepts a collection's numeric **id** as well as its name — `pt.db(42)` alongside `pt.db('project-db')`. An id is the only unambiguous reference when two attached collections share a name, and the only stable one if a collection is later renamed. The REST and action payloads accept `collection_id` beside `collection_name`; when both are sent they must identify the same collection, and a mismatched pair fails to resolve rather than quietly preferring one. An unknown reference reports which collections *are* attached, with their names and ids. Read-only access applies identically to both forms.
* Three constraints worth knowing, each of which has cost someone real work:
    * `hidden: true` on a message hides the **assistant's reply as well as your prompt**. That is usually what you want, but it means a stalled stage of a hidden multi-stage flow leaves nothing at all on screen to explain why the app stopped. Record stage state in ChatDB and show progress in your own interface rather than relying on the transcript.
    * Uploading a file under a name that already exists **in the same folder replaces it** as a new version. Phone cameras hand every capture the same filename, so a user attaching three photos can end up with one document and no error. Generate a unique name per upload when a user can supply more than one file.
    * `pt.list()` has **no sort parameter**, so the order rows arrive in is not a guarantee. Sort explicitly on a field you control. Anything depending on sequence — a streak, a "most recent", a running total — is wrong if it trusts the array order.

**Agents & capabilities**

* A new `view_image` tool in the `documents` capability lets an agent actually see an image document from the chat, rather than read its usually-empty extracted text. A viewed image is **pinned** and re-attached on later turns, capped at five per chat with the oldest evicted first; `unpin` releases one. Anything that cannot be shown — not in this chat, not an image, bytes unreadable — comes back as plain text rather than failing the turn. Behaviour is the same across model providers.
* Images on recent messages reach the model within a budget — six images and 15 MB by default, newest first. Past that an image degrades to its metadata rather than erroring, so the model knows the file is attached but can no longer see it. This matters for an app that re-attaches photographs at each stage of a flow: have the agent open a specific image deliberately instead of assuming it is still inside the history budget.
* `read_content_of_url` fetches directly first and can now fall back to a hosted page fetcher when a site refuses the request or serves a page with no readable content in it — the case large retail and marketplace sites hit constantly. `WEB_FETCH_PROVIDER` selects `Auto` (the first of Tavily, Firecrawl, Jina, Serper you have a key for), a specific provider, or `None`; `WEB_FETCH_STRATEGY` is `fallback` by default, or `always` to prefer the provider's extraction on every page. Keys go in your variables as usual, and Tavily's and Serper's are shared with web search. Addresses that are not publicly routable are never sent to a provider. Failures now say what went wrong — the status returned, a timeout, a certificate failure, too many redirects — and a long page is returned in sections rather than truncated.

**Sandbox**

* Sandboxes are no longer Daytona-only. `SANDBOX_BACKEND` selects `daytona` (the default, unchanged) or `kubernetes`, which runs sandboxes in the same cluster as PrimeThink with no external provider. An unrecognised value is rejected rather than falling back silently. The tool, its parameters, the in-sandbox environment, the preinstalled tooling and the security model are identical on both; the settings that were Daytona-specific are now separated from the ones both honour, and the Kubernetes namespace and template are group-overridable while cluster credentials are not. **Computer Use always runs on Daytona** regardless of this setting, so a group using the Kubernetes backend still needs Daytona credentials for it. Selecting `kubernetes` only works where the platform operator has installed the in-cluster components.

**Task evaluation**

* `pt task --help` now points at `pt eval`, where the evaluation and simulation commands actually live. Reading the task help and stopping there previously suggested no evaluation CLI existed at all.

**CLI**

* Scaffolding a Live App into a directory whose name describes a *slot* rather than an app — `sandbox`, `app`, `apps`, `src`, `dist`, `web`, `client`, `frontend` — now takes its name from the parent directory instead. Scaffolding at `word-painter/sandbox` produces "Word Painter", not "Sandbox". Repositories that keep each app's source in a fixed subfolder were titling every app after the subfolder, which is easy to miss until it is the browser tab title of a published app.
* Installing the developer skill now writes a `VERSION` file recording the ref, source and file count, and prints where it went. Quote it when reporting a problem with the skill — without it there is no way to tell which revision produced the behaviour. Writing it is best effort and never fails an otherwise good install.

**Live App templates**

* The React starter derives its **own preview port** per project instead of every scaffold sharing one. With a shared port, a second project's browser suite could adopt a preview server left running by a different app and test that instead — passing while proving nothing, or failing against another app's markup. An already-running preview is no longer reused by default: each run builds and serves this project, and an occupied port fails loudly. `PT_REUSE_PREVIEW` opts back into reuse while iterating and `PT_PREVIEW_PORT` moves off a collision.
* The starter ships **one canonical browser `pt` stub**, replacing the divergent stubs four projects each wrote for themselves. It is backed by session storage, so *write, reload, assert it is still there* is testable — a check an app holding its state in component state fails. It throws on any method it does not implement instead of returning nothing, so it cannot teach an API that does not exist. Use it for rendering and flow only, never as evidence about platform behaviour.
* A separate script loads the built app the way PrimeThink serves it, against a real chat, and asserts that the injected `pt` is real, that the app renders, and that a written row survives a reload. Run it before concluding an app works.
* The shipped table and modal primitives now carry **no palette colours and no dark-mode variants**, taking their colour from CSS variables a project repoints once. This is because overriding one Tailwind colour utility with another is decided by **alphabetical order**, not by intent: `bg-card` beats `bg-white` but loses to nothing in `bg-slate-100`, nothing warns you, and renaming a token can silently flip the result. Two related traps are documented alongside it — a token named after a Tailwind keyword shadows a real utility, and an undefined token emits no CSS at all.
* The first browser-test run fails by design, writing the screenshot baselines it had nothing to compare against. Review the images, commit them, run again.

### **Week of September 14, 2026**

**REST API**

* An API key's role is now checked when the key is created. Ask for no role and the key gets yours; a Group Admin can assign any role in their group except Super Admin and any role holding permissions they do not hold themselves. A key can never be more privileged than the person who created it.
* Task evaluation and simulation runs now have their own, much longer job timeout. A large evaluation plan that used to be cut short by a generic three-minute limit runs to completion.
* Memories are versioned rather than overwritten. Each carries a `status` of `active` or `superseded`, and a superseded row points at the memory that replaced it with the time and, optionally, the reason. Changing a memory's text supersedes it; changing only its priority edits in place. Superseded rows are excluded from listings, search and prompt injection by default — `include_superseded` on the list and search endpoints brings them back, `GET /memories/{id}/history` returns what a memory replaced, and `POST /memories/{id}/supersede` replaces one while keeping the old statement. Deleting a memory is the only operation that destroys its history. Payloads gain `status`, `superseded_by_id`, `superseded_at` and `supersession_reason`.
* Saving or changing a memory of a rule type — `constitution`, `ai_personal`, `agent_constitution`, `workspace_constitution` — now requires a verbatim quote from the user's own message, checked against what they actually wrote. A rule sourced only from a document, a web page, an image or a tool result is refused. Non-rule types are unaffected.

**Live Apps**

* Each Live App is served with its own web app manifest, so it installs as a separate app — its own identity, start address, scope, window and icon — rather than as a shortcut into PrimeThink. An app's identity is tied to its chat rather than its name, so renaming it does not strand or duplicate an existing install.
* A Live App's icon comes from the image on the task behind it. Any image works as long as each delivered size clears 144 pixels in both dimensions; it does not have to be square. Upload a **PNG** — browsers only accept PNG, SVG or WebP for an installable icon, and a resized image is re-encoded as JPEG, which Chrome silently refuses by not offering to install the app at all.
* Real-time updates now use a WebSocket only, with no HTTP long-polling fallback. Polling could not be made reliable across replicas, and pinning the transport is what makes real-time work for a Live App rendered outside the PrimeThink app's own wrapper. If a network blocks WebSocket upgrades, real-time updates will not arrive rather than degrading to polling.
* A Live App now replaces its own credentials before they expire, and recovers by reconnecting when a connection is refused because they already have. An app open longer than a day — a kiosk, a wall display — used to lose real-time updates permanently and start failing its data calls, recoverable only by reloading. There is nothing to call and nothing to configure.

**Public chat**

* Public chats are now served at `/live/{chat-id}/public`. Links already shared at the old `/public/chats/{chat-id}` address are forwarded to it, carrying their query string, so an existing session and an embedder's `ui_*` overrides both survive. Use the new form in anything you build from here. The session endpoint is unchanged.

**Agents & capabilities**

* Two MCP capabilities on one agent that share a `server_label` no longer break it. Providers reject a tools list with a duplicate label and reject the *whole* request, so such an agent could not answer anything at all. Duplicate labels are now collapsed to the first entry — which means only one of the two configurations is in effect, so give them distinct labels or remove the leftover.
* The platform now ships a first-party tool plugin of its own, exposing PrimeThink's management surface — tasks, agents, capabilities, chats, notifications, workspaces, collections, tags, groups — to an agent as tools. It uses exactly the mechanism an external plugin uses, which makes it the clearest working reference for writing your own.

**Task evaluation**

* `similar` scoring is fixed for long answers. It compares word overlap between the answer and the expected response, and a heuristic meant for long repetitive input was dropping common words from the comparison — collapsing the score for any expected answer from roughly 200 characters up, so faithful answers were marked as mismatches. Note that `similar` compares wording, not meaning: use an evaluator agent when a correct answer might be phrased differently.

**CLI**

* The agent tools plugin now ships inside the CLI wheel behind an `agent-tools` extra, rather than as a separate distribution, so the tools and the client code they use can never be different versions. Install it where agents run; plain installs are unchanged. Uninstall the old standalone distribution first if you have it.
* `--pass-threshold` on evaluation settings is a whole percentage from 1 to 100, not a fraction. It was documented as a 0-1 value and rejected the documented example outright; a fraction now fails at the command line instead of travelling to the API. The matching tools an AI agent calls declare the same bound.
* Scaffolding a Live App now names it after the directory, in both the page title and the package name, and says so. Apps used to ship with the template's own title — which reached production more than once, because a browser tab is the last place anyone looks.

**Live App templates**

* The React starter's build now lints before building and verifies the artifact afterwards, with both steps available on their own. The lint rules cover the PrimeThink mistakes that are easy to make and hard to see at runtime: reading an AI reply from the wrong property, mis-ordering the arguments to a change subscription, treating a list result as wrapped in metadata, persisting to browser storage instead of ChatDB, posting an app-driven message without marking it hidden, calling into the platform from inside a React state updater, and using a component that crashes under the template's React version.
* The starter also ships an acceptance-test skeleton to write your spec into before building the interface, a browser suite covering the host-theme bridge and render health, and a couple of primitives worth reusing rather than rewriting. This is a local suite, distinct from the deployed-app test plans the developer skill runs.

### **Week of September 7, 2026**

**REST API**

* New endpoint for launching a task into a chat, which is what the app does when you open a task: the new chat inherits the task's goal, default agent, settings, documents, collections and scheduled job, and the initial prompt is posted. It accepts an optional workspace as either a numeric id or a UUID, a name, a version, and members. The generic chat-creation route can still launch a task, now with an explicit `task_id` body field alongside the existing query parameter. Launching is governed by whether you may *use* a task, which is wider than being allowed to manage it.
* Uploading a document whose name is already taken now has a defined contract: identical content reuses the existing document, different content replaces it in place and records a new Production version, and an unresolvable conflict answers `409`. This also fixes a `500` when a same-named file was uploaded to a task without a folder — the default for command-line uploads.
* Documents a chat inherits from a task now record where they came from. Chat document and directory listings report the source task and whether that task has since dropped the document, and applying a task update reconciles the inherited files — adding, removing and repointing them — while leaving anything uploaded directly into the chat untouched. The update-check endpoint reports the pending document changes, which is what keeps "update available" honest when only a task's documents changed.
* Archiving moved off the agent *status* field onto a dedicated flag, so an agent can be archived and still active. List endpoints for agents and tasks hide archived entries unless you pass `archived=true`, and agent records carry the flag. The older `status=archived` and `status=all` filters still work and are translated for you; prefer the flag in new code.
* Connection endpoints accept a chat as either a numeric id or a UUID, and check chat membership consistently before anything else.
* Memory is now organized into pages, with an API for reading and writing pages and categories. Atomic memories remain the source of truth — a page is a view over the ones filed under it, and page summaries are derived rather than stored prose. A nightly job files new memories, merges pages describing the same entity, removes duplicates, settles contradictions by recency and rebuilds changed summaries. The stable part of memory is injected with the other per-chat-stable context while query-dependent recall goes at the tail of the prompt, so the volatile block no longer invalidates the cacheable prefix in front of it.

**Agents**

* Three agent types that no longer served a purpose are gone: the plain chat, SQL and summarisation types. Anything still pointing at them needs to move to a remaining type.
* The type formerly called `Std3` is now `ReAct1`. The old name is still accepted and normalised wherever a type is named, so existing configuration keeps working, but expect to see the new name.
* The sandbox agent now receives the chat's goal and its in-context documents in its system prompt, bringing it in line with the other agent types.
* A document lookup by path inside the sandbox now finds files a chat inherited from a task. Those links were created without a per-link name, so by-path resolution could never match them, and pulling such a file into the sandbox failed with "no document found" even though listings showed it.

**Channels (Telegram & Slack)**

* Photos and documents sent to a Telegram bot reach the agent as chat documents, with the caption as the message text and a stand-in prompt when there is none. Downloads are capped at the Bot API's 20 MB and refused politely above it, and the reply policy is evaluated *before* the download, so an attachment in a conversation the bot would not answer is never fetched.
* Documents the assistant attaches to an answer are delivered to the conversation after the text — images inline as photos on Telegram, everything else as a file, and uploads into the reply's thread on Slack. Up to ten per answer, best effort per file, skipping anything over the platform's own limit.
* Slack file uploads need the `files:write` scope, which is in the current manifest. **A Slack app created before that scope was added must be reinstalled from the current manifest**, or its uploads fail while text replies keep working.

**Documents**

* Removing a document link from a chat or a task no longer filters on who originally uploaded it. Authorization is already decided by the route, and the extra filter only produced spurious `404`s: a user who launched someone else's task could not remove the inherited document from their own chat, and a task co-editor could not remove a colleague's upload.

**CLI**

* **1.4.0** closes the gap between the CLI and the API. New command families for audio and video processing, group and member management, tags, chat workspaces, folders and document versions across chats, collections, tasks and agents, message-level operations including export and save-as-task, collection lifecycle and copy, image search within a collection, and listing tasks with filters. Each is mirrored as an MCP tool, with the non-destructive subset exposed to the agent tools plugin.
* **1.4.1** adds notifications, a full task-evaluation flow — build a plan, run it, simulate a multi-turn conversation, read and download results — a generic settings interface over group and user settings including provider keys (which are never read back), a user directory lookup for turning an email into an id, capability *codes* rather than environment-specific ids when creating an agent, agent avatar images, and an active group and configured provider list on `whoami`. Any 2xx now counts as success, so endpoints answering `204` no longer surface as errors.
* **1.5.0** adds launching a task into a chat from the command line, and gives task publishing the task type and feature toggles it never had — on the command line or in an optional `task.json` in the project, with an explicit option winning over the file. Previously a published task was always private with documents, chat history and scheduling off, and no way to say otherwise. Updating an existing task still only changes what your project states.

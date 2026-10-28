# Platform Known Issues & Constraints

The single shared source of truth for PrimeThink platform limits and known library
incompatibilities. **Two consumers read this file:** the `primethink-developer` skill
(so a builder does not re-discover a known crash) and App Studio's `gap_analysis` task
(so a spec records the limits as `gap` entities with a workaround). Change it here, never
in a copy — a second copy will drift.

Format: one entry per issue, with severity, how it shows up, and the workaround that is
known to work.

- **Severity CRITICAL** — ships silently, crashes or corrupts at runtime for every user.
- **Severity HIGH** — reliably wrong behaviour, no build-time signal.
- **Severity MEDIUM** — wrong behaviour in a common path, usually visible in testing.
- **Severity LOW** — friction or polish; the app still works.

---

## Library & runtime incompatibilities

### KI-01 — flowbite-react `Modal` crashes under React 19
**Severity:** CRITICAL · **Applies to:** compiled React/Vite apps (React 19 + flowbite-react 0.12+)

Flowbite React's `Modal` renders through `@floating-ui/react`, which is incompatible with
React 19's concurrent rendering. The build succeeds; the app throws the moment a modal opens,
with a stack that points into the library rather than app code.

**Workaround:** do not import `Modal` from `flowbite-react`. Use a portal-based modal —
`createPortal` into `document.body` plus Tailwind classes for the backdrop and panel. The
compiled template ships one at `src/components/Modal.jsx`; if the generated template does not
carry it, write one (~40 lines) before the first modal. Other Flowbite components in normal
use (Button, TextInput, Select, Badge, Spinner, Table, Tabs, Toast) are unaffected.

### KI-02 — flowbite-react 0.12+ exports are flat; dot notation renders `undefined`
**Severity:** CRITICAL · **Applies to:** compiled React/Vite apps

`Modal.Header`, `Table.Cell`, `Toast.Toggle` and friends are the pre-0.12 API. In 0.12+ they
are plain property accesses that evaluate to `undefined`, so React throws error #130
("Element type is invalid") and the page is blank at first render. Property access is valid
JavaScript, so neither the bundler nor TypeScript-free linting flags it.

**Workaround:** import the flat names — `ModalHeader`, `ModalBody`, `ModalFooter`,
`TableHead`, `TableHeadCell`, `TableBody`, `TableRow`, `TableCell`, `ToastToggle`, `TabItem`,
`AccordionPanel`. Open every view and modal in the live view before reporting completion.

### KI-03 — theme bridge must read the server-injected class (iframe context)
**Severity:** HIGH · **Applies to:** every Live App (compiled and dynamic)

A Live App renders **inside an iframe** at the `/app/` subpath. `location.search` inside that
iframe does **not** contain the parent page's query parameters, so a bridge that only checks
`?theme=` and then falls back to `prefers-color-scheme` always takes the OS branch — and
overwrites the `class="light"` / `class="dark"` that PrimeThink's server injected on `<html>`.
Result: the app follows the laptop's OS theme instead of the PrimeThink setting, reproducibly,
for every user whose two settings disagree.

**Workaround:** three-source priority chain — (1) `?theme=` on `location.search` (direct
access only), (2) the existing `light`/`dark` class on `<html>` (server-injected, authoritative
in the iframe), (3) `prefers-color-scheme` as the last resort — plus a `pt:theme` postMessage
listener for live switching. Combine with the class-based dark strategy
(`@custom-variant dark (&:where(.dark, .dark *))` in Tailwind v4, `darkMode: 'class'` in v3).

### KI-04 — Vite/esbuild does not enforce `no-undef`
**Severity:** MEDIUM · **Applies to:** compiled React/Vite apps

esbuild bundles undeclared and un-imported references without complaint; the failure is a
`ReferenceError` in the browser, often on a rarely-exercised branch. Running the linter before
an edit proves nothing about the edit.

**Workaround:** run ESLint **after** every code edit (and wire `lint` into the `build` script
where the template supports it), then load the deployed app and exercise the changed path.

### KI-05 — AI reply text is on `response.message`
**Severity:** MEDIUM · **Applies to:** every Live App calling AI from app code

`pt.waitForMessageReceived()` resolves with an object whose text is `response.message`.
Reading `.text` or `.content` yields `undefined`, and because the failure lands inside a JSON
parse it usually degrades into a button that silently does nothing.

**Workaround:** read `response.message` (guard for a plain-string resolution), extract JSON
with `indexOf('[')` / `lastIndexOf(']')` rather than a non-greedy regex, and always surface a
user-visible error when parsing fails. See the AI-from-App Pattern in `SKILL.md`, or use
`askAIJson` / `extractJson` from `libraries/pt-ai.js`.

---

## Platform constraints (also used by App Studio `gap_analysis`)

These are properties of the platform, not bugs. Any requirement that depends on one of them
needs an explicit workaround in the spec.

### PC-01 — No external-contributor member type
**Severity:** HIGH

Outsiders cannot be given scoped access to a chat or app; membership is all-or-nothing within
the group. **Workaround:** email-reply ingestion into the chat, or an operator who relays.

### PC-02 — Live App permissions are UI-level only
**Severity:** HIGH

Hiding an action in the app hides it in the UI; nothing at the data layer stops a member from
reading or editing any entity in the chat's database (including via the ChatDB panel or by
asking the AI). **Workaround:** treat role logic as convenience, not security; keep genuinely
sensitive data out of the chat, or in a separate chat with restricted membership.

### PC-03 — No scheduled or cron push from a Live App
**Severity:** MEDIUM

An app only runs while someone has it open; it cannot wake itself to send reminders or run a
nightly job. **Workaround:** a goal-driven scheduled chat/task on the platform side, or an
external trigger that posts into the chat.

### PC-04 — MCP tool use requires an OpenAI model on the chat
**Severity:** MEDIUM

A chat whose agent runs a non-OpenAI model cannot call MCP tools. **Workaround:** set the
chat's model accordingly, or route the tool-using step to a chat that has one.

### PC-05 — Connectors must be verified per client
**Severity:** MEDIUM

Never assume a connector exists for a given system — availability differs per client
installation. **Workaround:** confirm the connector with the client before designing a flow
that depends on it; otherwise plan for manual import/export.

### PC-06 — Live App AI work is chat-message based (fire-and-forget)
**Severity:** MEDIUM

An app asks the AI by posting a chat message and waiting for the reply. There is no synchronous
call and no server-side job the app owns, so a long job dies with the tab if the app waits on
it inline. **Workaround:** fire-and-forget — post a hidden message and record the `task_id` in
ChatDB. While the tab is open, `pt.onMessageReceived(taskId, cb)` (or
`pt.waitForMessageReceived`) delivers the reply over the socket, hidden or not. Nothing
recovers a reply by `task_id` after a reload — `getChatMessages` carries no `task_id` — so for
a result that must survive the tab, have the prompt tell the agent to **write the result onto
the entity**, and read it from there on any load.

### PC-07 — `pt.list` accepts at most 20 entity names per call
**Severity:** MEDIUM

The `list` action rejects a request naming more than 20 entity types with
"Too many entity names (max 20)". An app whose entity vocabulary grows past 20 breaks on its
full refresh the day the 21st type is added — App Studio hit this at 23. **Workaround:** chunk
the names (≤20 per call) and merge the results client-side; never assume the cap will be raised.

### PC-08 — Document names are unique per folder; a same-named upload versions the existing one
**Severity:** HIGH

`uploadFiles()` and file-mode `addMessage(formData, …)` key a document by **name within its
folder**. Uploading a second file under a name already taken takes over the existing link row
and creates a new *version* rather than a second document — the first file's content is no
longer what that name resolves to.

This bites hardest on phone uploads, because iOS names every camera capture `image.jpg`: a
seller who attached three photos got **one** stored document. It shipped to a real user before
anyone noticed, because nothing errors — the upload reports success.

The versioning rule is documented for *app artifacts* (same-named remote documents get a new
version), which is correct and desirable there. It was never generalised to user-supplied
files, where it is data loss.

**Workaround:** give every user-supplied file a unique name before upload —
`` `${crypto.randomUUID()}-${file.name}` ``. Do not rely on the picker to vary it, and do not
build the name from a timestamp and an index: two batches in the same millisecond collide.

### PC-09 — `read_content_of_url` is blocked by most large retail and marketplace sites
**Severity:** MEDIUM

An agent asked to research a product price will call `read_content_of_url` against shop and
marketplace pages and get failures back, repeatedly, until its tool budget is spent. The stage
appears to hang: `{ hidden: true }` messages leave no chat trace (see PC-10), so there is
nothing for the user to look at and nothing in the app to surface.

**Workaround:** design agent research around search-result snippets rather than page fetches,
cap the tool budget explicitly in the prompt, and write a failure reason into the entity so the
UI can show one.

### PC-10 — Hidden AI messages leave no trace the user can see, or a later load can find
**Severity:** MEDIUM

`{ hidden: true }` hides the prompt **and** the reply from the chat. The tab that sent it can
still observe the reply through `pt.onMessageReceived(taskId, …)` while it stays open (PC-06).
Once that tab is gone, a stalled fire-and-forget stage is invisible: no chat message, no
error, and the entity simply never updates. One team diagnosed a stuck pipeline from a
LangSmith trace, because nothing else existed to look at.

**Workaround:** treat the entity as the only observable. Write a `status` and a failure reason
onto the row your UI reads, give every stage a timeout, and expect LangSmith to be the debugger
of last resort.

### PC-11 — Attached images reach the model as vision blocks, within a per-conversation budget
**Severity:** MEDIUM

Images attached with file-mode `addMessage` **are** seen by the model — they become vision
blocks in the conversation. But there is a per-conversation **count and byte budget**, and once
it is exceeded the older images silently degrade to metadata only: the model stops seeing the
picture and starts seeing a filename. Nothing signals the switch.

This matters for any app that re-attaches the same photos at several stages; it will work
early in a conversation and quietly stop working later.

**Workaround:** attach an image **once**, at the stage that needs to see it, and have that stage
write what later stages need (a description, extracted fields) onto the entity, so they read
text instead of the picture. There is no way to point a later message at an already-stored
document: `addMessage` takes text or a `FormData` of files, and re-attaching means
re-uploading. Downscale phone captures before upload (2.2 MB each × 8 exhausts a budget fast).

### KI-09 — a deploy can 404 its own bundle: uploads deduplicate by CONTENT

**Symptom:** the app is blank after a deploy. `index.html` references `app-<hash>.js`, that
file is absent from the `@app` listing, and
`GET /api/v1/live/{chat}/app/app-<hash>.js` returns 404 — while `publish_app.sh` /
`test_app.sh` both printed `✓ uploaded`.

**Cause:** the documents API deduplicates by content. Posting a file whose bytes match a
document already in that folder returns the **existing** document, under its **old** name,
instead of creating one under the new name. A Vite/Rollup file name is a hash of more than
the file's own bytes — it also covers the hashes of the files it references — so a build can
emit byte-identical output under a new name. When it does, the new name is never created.

**Signature:** the same `md5` under two different names.

```bash
md5 -q app/app-NEW.js
curl -s ".../documents/uuid/<old-uuid>/download/stream" -H "Authorization: Token $K" | md5
```

**Workaround:** delete the stale twin, then deploy again — the content is new to the folder
and lands under the right name.
`DELETE /api/v1/chats/<chat_id>/document/<doc_id>` (tasks: `/tasks/<id>/documents/<doc_id>`).

This is also why stale bundles must be swept after every deploy: each hash change leaves the
previous `app-*.js` / `index-*.css` behind, and any survivor can later capture a
byte-identical upload. List `@app` and delete only what the current build did not emit:
compare the listing with the files in `dist/`. Do **not** keep just the files `index.html`
names — lazy-loaded chunks, their CSS, fonts and images referenced from CSS, and everything
copied from `public/` (help media included) are emitted too, and deleting them 404s the app.
Read files by **uuid**: the numeric-id download endpoints are deprecated.

### KI-10 — publishing never reaches a chat that already exists

A chat **copies** the task's `@app` documents when it is created. `publish_app.sh` updates
the task, so an existing chat keeps serving the version it was created with: its own
`index.html` and the assets that index points at. It is stale, not broken — if it 404s, its
`index.html` and its assets disagree, which is a separate problem (see KI-09).

**Workaround:** deploy into that chat as well, with `test_app.sh` and its `.chat-id`, and set
its agent if the task's has changed (`PUT /api/v1/chats/<id>/va`). Afterwards, point
`.chat-id.<env>.config` back at your test chat: left pointing at production, the next casual
`./test_app.sh` deploys straight into it.

---

*When a new incident produces a durable lesson, add an entry here first, then link it from
`SKILL.md` and turn it into an eval case in `evals/evals.json`.*

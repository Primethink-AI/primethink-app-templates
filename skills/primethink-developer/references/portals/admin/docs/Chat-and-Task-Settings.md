# Chat and Task Settings

Every chat has a set of switches that decide **what the agent is given with each message** and **which platform features the chat has**. A task carries the same switches: a chat started from the task copies them, and **Update available** copies them again (see [Tasks and Update available](#tasks-and-update-available)).

The switches are in the chat's side panel under **Settings**, and in the task editor under its **Settings** tab. Some of them change the agent's behaviour more than the goal does, so choose them deliberately — especially for Live Apps.

| Setting | Chat field | Task field | CLI option | New chat |
|---|---|---|---|---|
| **Global Memory** | `global_memory` | `global_memory` | `--global-memory` | on |
| **History** | `chat_history` | `chat_history` | `--chat-history` | on |
| **Search in Chat Messages** | `search_in_chat` | `search_in_chat` | `--search-in-chat` | off |
| **Documents and Collections** | `documents_and_collections_enabled` | `documents_and_collections_enabled` | `--docs-enabled` | on |
| **AutoRAG** | `search_in_documents` | `search_in_documents` | `--search-in-documents` | off |
| **Auto generated summary** | `summary_enabled` | `summary_enabled` | `--summary-enabled` | on |
| **Scheduled Tasks** | `scheduled_jobs_enabled` | `scheduled_jobs_enabled` | `--scheduled-jobs` | off |
| **Email** | `enable_email_integration` | `enable_email_integration` | `--email-integration` | off |
| **Make Public** (chat) / **Public Chat** (task) | `public` | `public_chat` | `--public-chat` | off |

Every CLI option also has a `--no-…` form, for example `--no-chat-history`. `pt task create` and `pt task update` accept them all.

!!! warning "Tasks published from the CLI start with every switch off"
    `pt task publish` (without options or a `task.json`) and `pt live-app publish` create the task with **all** of these switches off, including Documents and Collections. Turn on what the task needs afterwards, for example `pt task update <task id> --docs-enabled --scheduled-jobs`. A later `pt live-app publish --task-id` does not change them.

## History

**On:** with every message, the agent is given the **last 50 messages** of the chat as the conversation so far. That includes hidden messages — the task messages a Live App sends with `pt.addMessage(…, { hidden: true })` and the agent's replies to them — and messages that another agent turn is still answering.

**Off:** the agent is given **only the message it is answering**. It remembers nothing from earlier messages, except what is kept elsewhere: the goal, the memo, memory, Chat DB entities and documents. A Deep1 agent can still read the chat summary (`/chat/summary.md`) and the memo.

Watch out:

- **A Live App that sends several hidden tasks at once should switch History off.** With History on, each agent turn sees the other tasks that are still waiting and may carry them out as well: in a test, four of six turns sent at the same second also performed the other five tasks. With History off every turn sees only its own task. Put everything a task needs into the message itself or into Chat DB.
- History is part of every turn's input, so switching it off also makes each turn cheaper — noticeably so in chats with long messages.
- A conversational assistant, where people refer back to what was said, needs History on.

## Search in Chat Messages

**On:** for every message, PrimeThink searches the chat's **older** messages (those outside the last 50) for passages related to the new message and adds them to the agent's prompt. It also gives the agent the chat's automatic summary.

**Off:** no older messages are searched and the summary is not given to the agent, even when Auto generated summary keeps writing it.

## Global Memory

**On:** the agent can save and recall long-term memories about the user, and relevant memories are added to its prompt. It needs the agent's **Memory** capability. See [Memory](https://help.primethink.ai/Memory/).

**Off:** no memory tools and no memories in the prompt. Memories already saved are kept.

## Documents and Collections

**On:** the agent is told which documents and collections are attached to the chat (a Deep1 agent sees them under `/chat/documents`, with an `INDEX.md`), and **AutoRAG** can be switched on.

**Off:** the agent is no longer shown the chat's documents and collections, and AutoRAG cannot run.

Watch out:

- **This is not an access control.** An agent with the Documents capability can still read and write the chat's documents with its tools, a Live App can still use its document functions (`pt.getDocumentText`, `pt.documentUrl`, uploads), and the API is unaffected. To keep an agent away from documents, remove the capability or the documents.
- A task published with `pt task publish` or `pt live-app publish` has it **off** unless you turn it on (see the warning above).

## AutoRAG

Requires **Documents and Collections**.

**On:** for **every message**, PrimeThink searches the chat's documents whose status is **Search** and its indexed collections, and adds the best-matching passages to the agent's prompt before the agent starts. See [Documents Attached to a Task](Creating-Tasks.md#documents-attached-to-a-task) for document statuses.

**Off:** the agent finds document content only when it decides to look, with its document tools.

Watch out:

- Every message pays for the search and for the larger prompt, and the agent starts a little later. Keep it for knowledge-base assistants whose answers come from the documents.
- In a Live App chat driven by structured hidden tasks, the added passages rarely help and add tokens to every task: leave it off unless the app's tasks answer questions from documents.

## Auto generated summary

**On:** a background job writes a running summary of the conversation, roughly every 10 new messages or every hour.

**Off:** no new summary is written; the existing one is kept.

The summary reaches the agent only when **Search in Chat Messages** is on (a Deep1 agent can also read `/chat/summary.md`). With Search in Chat Messages off, the summary is written but not used.

## Scheduled Tasks

**On:** the agent can create scheduled tasks from the conversation — for example "remind me every Monday at 9". It also needs the agent's **Scheduled Tasks** capability. Scheduled tasks are listed in the chat's **Scheduled Tasks** tab; see [Scheduled Tasks](Scheduled-Tasks.md).

**Off:** the agent cannot create new scheduled tasks.

Watch out:

- **Switching it off does not stop existing scheduled tasks.** They keep running; pause or delete them in the Scheduled Tasks tab.
- A task's own schedule is set up when a chat is started from it, whatever this switch says.
- A Live App whose agent schedules jobs (a nightly sync, a periodic sweep) needs this switch on in the chats that run the app — set it on the task.

## Email

**On:** the chat gets its own email address, shown under the switch with a copy button. An email sent to it from the address of a group member who is in the chat arrives as that person's message, with attachments added to the chat's documents, and the agent's reply is emailed back in the same thread. A task can have an address too. See [Email Integration](https://help.primethink.ai/developer/Email-Integration/).

**Off:** the address stops accepting email.

## Make Public

**On:** the chat gets a public link. Anyone with the link can use the chat **without logging in**. Each visitor gets their own sub-chat and sees only their own conversation — never the main chat or other visitors' sub-chats. The sub-chat takes the main chat's goal, agent, settings, documents and collections. Switching it off disables the link. On a task, **Public Chat** makes the chats started from it public.

Watch out:

- **The agent answers visitors with the chat owner's account.** Whatever that agent can reach — its tools, the attached documents and collections, the owner's memory scope — anyone with the link can ask it about. Give a public chat an agent that has only the capabilities the public use needs, and do not attach private documents.
- Visitors are rate-limited, per visitor and per link.

## Tasks and Update available

- A chat started from a task gets the switches of the task's **Production** version.
- **Update available** copies all of these switches, plus the **agent** and the **goal**, from the task's Production version into the chat — **replacing any change made on the chat itself**. Make the change on the task and publish a new version instead of changing it in each chat. See [Updating Existing Task Chats](Creating-Tasks.md#updating-existing-task-chats).
- The memo and the summary are never copied.

## Recommended settings

| Chat | History | Documents and Collections | AutoRAG | Scheduled Tasks | Make Public |
|---|---|---|---|---|---|
| Conversational assistant | on | on if it works with files | on for a knowledge base | on if it sets reminders | off |
| Live App driven by hidden tasks | **off** | on if the app or its agent uses documents | off | on if the app's agent schedules jobs | off |
| Public help desk | on | on (public documents only) | on | off | on, with a restricted agent |

# Memory

It's important to understand that the memory system detailed here primarily enhances **standard chats** between you and AI assistants. To maintain privacy and appropriate context, these memory features are typically not active within **multi-user group chats** that include several human participants.

PrimeThink features a sophisticated memory system, similar to human memory, allowing the platform and its AI assistants to recall important information from past interactions and apply it effectively in future conversations during your standard chats. This ensures continuity, personalisation, and adherence to specific guidelines within those one-on-one or AI-only interactions.

The memory system organises information into different types, each serving a distinct purpose and having a specific priority level when accessed by the AI. When you interact with an assistant in a standard chat, the system loads the most important memories into the AI's context automatically and provides the agent with tools to search, add, update, and delete memories as needed.

## Understanding Memory Types

We can think about agent memory in terms of its duration and purpose:

### Working Memory (Temporary - During a response)

*   **Purpose:** This is akin to having a piece of scratch paper when working through a problem or completing multiple tasks simultaneously during a single response. It stores temporary, incremental states or outputs generated during a single task or a sequence of chained tasks within an agent's workflow.
*   **How it Works:** It holds intermediate results needed to compute the next step or the final outcome of an instruction. Once the response is sent, this memory is typically discarded.

### Short-Term Memory (Session-Specific - During a Conversation)

*   **Purpose:** This refers to the context of an existing session or conversation the agent(s) are currently part of. It holds information that is relevant *to that specific conversation*.
*   **How it Works:** The system needs to recall this context very rapidly to maintain conversational flow and provide relevant, accurate responses within the ongoing interaction. It allows the agent to remember previous prompts and its own answers within the current chat.
*   **Implementation:** It uses a mix of chat summary, chat history, and Retrieval Augmented Generation (RAG) to find relevant messages (older than the history) in the same chat.

### Long-Term Memory (Persistent - Across Sessions)

*   **Purpose:** This holds information that should be remembered for future interactions, even after the current session has concluded. It stores distilled knowledge, key attributes, and summaries from past experiences that inform the agent's behaviour over time.
*   **How it Works:** When the user shares lasting information or gives a lasting instruction, the AI agent decides to save it as a memory using its built-in memory tools. The agent calls `add_memory` directly — there is no separate background extraction process. Relevant memories are then loaded into the agent's context at the start of each new conversation to provide essential context or guidance.
*   **Implementation:** This is a dedicated system. It can be used to store various types of persistent information:

#### Shared Memory Types

These memory types are shared across all agents the user interacts with:

*   **Constitutional Memories (Highest Priority - MUST be enforced):** Behaviour rules the user has set for every conversation. These are fundamental rules, guidelines, and core preferences that shape the AI's fundamental behaviour and responses (unbreakable laws or directives). Examples: Preferred language, specific response formats, core ethical guidelines, naming conventions the AI must use. Use when the user gives a lasting instruction like "from now on", "always", "never", "in future replies".
*   **User Personal Memories (High Priority - Should be enforced):** User-specific information like preferences, characteristics, history, relationships, likes/dislikes, habits, and other personal circumstances provided by the user. Used to personalise interactions and maintain conversational continuity regarding the user's life. Use when the user shares lasting personal information about themselves using phrases like "I like", "I prefer", "I am", "I have", "My family".
*   **AI Personal Memories (Medium Priority - Should be referenced for consistency):** Define the AI's persona or background characteristics *as instructed by the user* (distinct from constitutional rules governing behaviour). Examples: A user-defined name, age, origin story, or personality traits for the AI assistant. Helps the AI maintain a consistent identity. Use when the user defines a trait with phrases like "you should be", "I want you to be", "your personality is".
*   **Other Important Memories (General Information - Can be referenced):** Stores explicitly saved pieces of information that don't fall into the above categories. This includes facts the user specifically asked the AI to remember, generic information to retain, or details about people other than the primary user. Used for factual recall without interpretation. Use for general information the user asks to remember via phrases like "remember this", "save this", "don't forget".

#### Agent-Scoped Memory Types

These memory types belong to a specific agent and are not shared with other agents:

*   **Agent Constitution Memories:** Behaviour rules that apply only to a specific agent (not to other agents the user talks to). Example: "when you are this agent, always answer in bullet points". These are stored against the agent's ID and never shared with other agents. This allows users to customise individual agent behaviour without affecting other assistants.

#### Workspace Memory Types (Shared Across a Team)

The memory types above are personal to you — even agent-scoped memories belong to a single user. **Workspace memory** is different: it is **shared across every member** of a [shared workspace](Collaboration.md#shared-workspaces), so that a whole team builds up one common project brain instead of each person teaching their assistant the same facts in isolation.

Workspace memory is **agent-agnostic** — it is shared regardless of which agent a member happens to be using inside the workspace. It is keyed to the workspace itself rather than to any one user.

There are two workspace memory types:

*   **Workspace Constitution Memories:** Behaviour rules that every member's assistant must follow while working inside the workspace. Example: "In this workspace, always reply in formal English and cite the source document." These are always loaded into the assistant's context for any chat that belongs to the workspace.
*   **Workspace Memories (Shared Knowledge):** Shared project facts and context — for example "Our staging environment is at staging.example.com" or "The client prefers monthly invoices." These are recalled by semantic search when relevant to the current conversation, just like personal *Other Important Memories*.

!!! warning "Keep personal facts personal"
    Because workspace memory is visible to **all** members of the workspace, the assistant is instructed never to place personal user information (your preferences, your habits, anything about your private life) into a workspace type. Personal facts always stay in your private, global *User Personal Memories*. Only shared, project-level knowledge belongs in workspace memory.

For how access is controlled and how this scope works behind the scenes, see [Workspace Memory Architecture](/developer/Workspace-Memory-Architecture/).

## How Memory Works

### Memory Loading

When a conversation starts, the system automatically loads the most important memories into the agent's context without any LLM call or vector search — it reads directly from the database:

*   **Constitutional Memories** are loaded in full because they govern behaviour.
*   **Agent Constitution Memories** (when applicable) are loaded in full for the specific agent.
*   **AI Personal Memories** are loaded in full to maintain consistent identity.
*   **User Personal Memories** — the most important entries are included so the agent has baseline context.
*   **Workspace Constitution Memories** (when the chat belongs to a [shared workspace](Collaboration.md#shared-workspaces)) are loaded in full so the assistant follows the team's rules for that workspace.

The agent can then use the `search_memory` tool during conversation to look up older or less-common details that weren't included in the initial load. When the chat is inside a workspace, `search_memory` also recalls relevant **Workspace Memories**, merging shared knowledge with your personal results.

### Agent Memory Tools

The AI agent manages memories directly through four built-in tools:

*   **`add_memory`** — Saves a new memory. The agent decides the appropriate memory type and priority based on what the user said. Memories are written as short, self-contained statements. Priority ranges from 1 (most important) to 10 (least important), defaulting to 5.
*   **`search_memory`** — Performs a semantic vector search across saved memories. Use this when the agent suspects the user already shared relevant information that isn't in the always-loaded memories. Returns memory ID, type, priority, timestamp, current status, and text for each result, along with a short note of the previous wording where a memory has been replaced. The agent can also ask for replaced memories explicitly — useful when you ask what you said before, or you are sure you told the assistant something it cannot find.
*   **`update_memory`** — Records that a fact has changed — for example, you moved city or changed a preference. Changing the wording does **not** overwrite the old statement: see [Memory history](#memory-history) below. Changing only the priority edits the memory in place. The memory is automatically re-embedded after updating.
*   **`delete_memory`** — Permanently forgets a memory **and its history**. This is for when you explicitly ask the assistant to forget something, or say it was never true — not for a fact that has merely changed.

!!! note "Standing rules must be your own words"
    A memory type that sets a lasting rule — *Constitutional*, *AI Personal*, *Agent Constitution* and *Workspace Constitution* — is trusted in every later conversation, so the assistant is only allowed to save or change one when it can quote the instruction **verbatim from your own message**. An instruction that appears in a document, a web page, an image, or the result of a tool is not you speaking, and will not be saved as a rule. This stops content you merely shared with the assistant from silently rewriting how it behaves.

#### Memory history

When a fact you told the assistant changes, the old statement is **kept as history** rather than being thrown away. The previous version is marked as replaced, linked to the statement that superseded it, and stamped with when the change happened.

This means the assistant can tell you how something evolved — "you told me you were in London until March, now it's Milan" — instead of either denying the old fact or stating it as though it were still true. Only the current statement is used as fact: replaced memories are never treated as true on their own, and are only shown alongside the memory that replaced them, or when history is looked up deliberately.

Two things behave differently as a result:

*   **Changing a fact keeps the trail.** Ask the assistant to update something and you get a new memory plus a linked, dated record of what it used to say.
*   **Forgetting really forgets.** Asking the assistant to forget a memory removes it *and* everything it replaced, leaving nothing behind.

History is not kept forever. Replaced memories that have sat unused past the retention window — a year, unless your provider has set a different one — are cleared out automatically, so the trail stays useful without growing without limit.

### Memory Scoping

Memories follow specific scoping rules to ensure proper access control:

*   **Shared memories** (`constitution`, `ai_personal`, `user_personal`, `memory`): These have no agent association (`agent_id` is null) and are accessible to all agents the user interacts with.
*   **Agent-scoped memories** (`agent_constitution`): These are linked to a specific agent and are only visible to that agent. When retrieving memories, the system always includes shared memories plus the specific agent's own memories.
*   **Workspace-scoped memories** (`workspace_constitution`, `workspace_memory`): These belong to a workspace rather than to a single user, and are visible to **every member** of that workspace. They are kept separate from personal memory and are only used when a chat belongs to the workspace. See [Workspace Memory Architecture](/developer/Workspace-Memory-Architecture/) for the access rules.

## Memory Priority and Enforcement

The system follows specific steps to ensure memories are used correctly, particularly for stored long-term memories:

1.  **Check:** Before forming a response, relevant constitutional memories are checked.
2.  **Validate:** The potential response is validated against these constitutional rules.
3.  **Allow:** The response is only sent if it satisfies all applicable constitutional rules.

**Conflicts:** When memories conflict with the current message, the current message takes precedence. The agent records the change with `update_memory`, which keeps the outdated statement as [history](#memory-history) rather than erasing it, and reserves `delete_memory` for a fact that was never true. Among stored memories, those with higher priority (lower number) and more recent timestamps are given precedence.

Beyond these types, systems with multiple agents also require memory management. Agents need to communicate with one another using mechanisms such as a shared session (potentially utilising short-term memory concepts). However, individual agents might also maintain their own session-specific information depending on the nature of the tasks they are undertaking. One might also opt to employ certain data privacy protocols to confine specific data within a particular assistant (e.g., keeping a credit card number within one agent) and then transmit only the de-identified information to subsequent tasks and assistants instead.

## Viewing and Managing Memories

You can view and manage stored long-term memories through the "Memory" section accessible from the top navigation bar (via the "View Memory" button or potentially within the main menu), typically for standard chats.

The screen is organized by **page**, not as one long list of sentences. Each category — *You*, *Topics*, *Areas*, *People*, plus any your group has added — gets its own heading, and every category is shown even when it holds nothing yet, so you can see where new pages will land.

*   **Page cards:** each page shows its title and a short summary of what it holds. Under *You*, the **Profile** page holds who you are and the **Preferences** page holds how the assistant should behave; these two are fixed and cannot be renamed, moved, or deleted.
*   **Page detail:** opening a page shows its summary, your own **notes**, and its individual memories as bullets. The summary is written for you and is not directly editable; your notes are yours alone and nothing rewrites them.
*   **Editing bullets:** a bullet is an individual memory, edited and deleted exactly as before, with the same permissions. Changing one marks its page's summary as out of date, and the page shows a small hint saying the summary will refresh — it is rebuilt overnight, or on demand.
*   **Creating a page:** you can add a page yourself by giving it a title and a category. It starts empty and gets a summary once it has some bullets.
*   **Search:** searching finds individual memories by meaning even when your wording differs from theirs, and shows which page each result belongs to.
*   **Clear memory:** the destructive option to wipe memory is still on the list screen, behind a confirmation that requires you to type `CLEAR MEMORY` before it will do anything.
*   **Adding memories:** memories are still added by asking the assistant to remember something ("Save as Memory" on a message), or by the assistant itself during a conversation. Where they end up is decided by the overnight filing described below.
*   **Reindexing:** If memory search results seem inconsistent, you can trigger a reindex operation to rebuild the vector embeddings for all your memories.

## Memory Pages

Individual memories are also organized into **pages**, so that what the assistant knows reads like a set of notes rather than a long list of loose sentences. Each page is about one thing — you, a preference, a person, a project, a topic — and carries:

*   A **title** naming what the page is about
*   A short **summary** written from the page's contents
*   The individual memories that belong to it, as bullets
*   Your own **notes**, a field you write and nothing else ever rewrites

Pages are grouped into categories such as *You*, *Topics*, *Areas*, and *People*. The *You* category is built in and always present; a group can add categories of its own.

The individual memories remain the record of what is true — a page is a view over the ones filed under it. That is why you edit and delete bullets exactly as before, and why summaries are not directly editable: changing a bullet marks the page's summary as out of date, and it is rewritten from the current bullets.

### Overnight Tidying

Once a day, memory maintains itself in the background:

*   New memories are **filed** onto the page they belong to, creating a page when nothing fits. Until a memory is filed it is still searchable and still reachable in conversation, so nothing is missing in the meantime.
*   Pages about the same thing are **merged**, so you do not end up with one page for *Mark* and another for *Mark Hasslacher*.
*   Near-duplicate bullets are **removed**, and contradictions are settled by recency — the newer statement becomes the current one, and the statement it replaced is kept as dated [history](#memory-history) instead of being deleted. An explicit correction ("I no longer work there") is kept, so a fact you have overruled is not learned again.
*   Summaries are **rewritten** for pages whose contents changed, and a page left with no bullets is deleted.
*   Replaced statements that have sat unused past the retention window are **cleared out**, so history does not accumulate indefinitely.

Because summaries only refresh on this cycle, a bullet you edit now may show an out-of-date summary until the next run; the bullets themselves are current immediately.

By effectively utilising these different memory types and management tools, AI agents can provide a highly personalised, context-aware, and reliable experience.

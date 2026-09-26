# State Management Best Practices for PrimeThink Live Apps

## Why Avoid localStorage?

**localStorage is browser-specific and creates problems:**

1. **Not shared across windows** - Opening the same chat in multiple tabs shows different states
2. **Not shared across devices** - User can't continue on mobile what they started on desktop
3. **Not shared across users** - Collaborative apps can't share state
4. **Lost on browser clear** - Users lose progress if they clear browser data
5. **No server-side access** - AI can't read or modify the state
6. **Limited to 5-10MB** - Can't store large amounts of data

## Use Chat Database Instead

PrimeThink Live Apps have access to a chat-scoped database via the `pt` API. This is the **recommended way** to persist state.

### Benefits of Chat Database

- **Shared across all windows and devices** - True multi-window support
- **Persistent and reliable** - Survives browser restarts and data clearing
- **AI-accessible** - AI can read and modify stored data
- **Collaborative** - Multiple users can share the same state
- **Generous storage** - Entity data comfortably holds typical app state; avoid storing large blobs (e.g. base64 images) in entities
- **Queryable** - Use filters to find specific data

The chat database belongs to **one chat**. When several chats or apps must work on the same records, use a [DB Collection](#sharing-data-across-chats-db-collections) instead. The next section explains how to choose.

---

## Choosing Where Data Lives

PrimeThink has three places to keep an app's data. Two of them are called "collections", but they are different things.

| Store | Accessed with | Holds | Use it for |
|-------|---------------|-------|------------|
| **Chat database** | `pt.list()`, `pt.add()`, … | Structured entities, scoped to one chat | Everything that belongs to one app instance or conversation: per-run work, the records of a chat launched from a task, UI and view state, per-user preferences |
| **DB Collection** | `pt.db(nameOrId).list()`, … | Structured entities, in a store that can be attached to many chats | Records that several chats or apps must share, such as an intake app and a dashboard over the same cases, or reference data many apps read |
| **Document collection** | `pt.listCollections()`, `pt.searchDocuments()`, the Collections page | Files and text, indexed for semantic search | Unstructured knowledge the AI retrieves (RAG) |

Start with the chat database. Move a set of records to a DB Collection only when a second chat genuinely needs to read or write the same records. Separate copies of similar data do not need one. Never use a document collection as a database: it has no entity CRUD, and its search is semantic, not exact.

---

## Pattern 1: Simple State Persistence (Recommended)

Replace localStorage with a single database entity for UI state.

### Bad: Using localStorage

```javascript
// DON'T DO THIS
function saveState() {
  localStorage.setItem('app_state', JSON.stringify(AppState));
}

function loadState() {
  const saved = localStorage.getItem('app_state');
  if (saved) {
    AppState = JSON.parse(saved);
  }
}
```

### Good: Using Chat Database

```javascript
// DO THIS INSTEAD
const APP_STATE_ENTITY = 'app_ui_state';
let appStateId = null;

// Save state to chat database
async function saveState() {
  try {
    const stateData = { ...AppState };

    if (appStateId) {
      // Update existing state
      await pt.edit(appStateId, stateData, true);
    } else {
      // Create new state entity
      const saved = await pt.add(APP_STATE_ENTITY, stateData);
      appStateId = saved.id;
    }
  } catch (error) {
    console.error('Failed to save state:', error);
  }
}

// Load state from chat database
async function loadState() {
  try {
    const result = await pt.list({
      entityNames: [APP_STATE_ENTITY],
      limit: 1
    });

    // pt.list() returns a plain array by default (no returnMetadata)
    if (result.length > 0) {
      const saved = result[0];
      appStateId = saved.id;
      Object.assign(AppState, saved.data);
      console.log('State loaded from database');
    }
  } catch (error) {
    console.error('Failed to load state:', error);
  }
}

// Initialize app
async function initializeApp() {
  await loadState(); // Load state before rendering
  renderScreen();
}
```

### Key Points

1. **Use a dedicated entity type** - `app_ui_state` or similar
2. **Track the entity ID** - Store `appStateId` to update the same entity
3. **Use merge mode** - `pt.edit(id, data, true)` preserves fields you don't update
4. **Await on init** - Always `await loadState()` before rendering
5. **Handle errors gracefully** - Don't crash if database is unavailable

---

## Pattern 2: Structured Data Storage

For complex apps, store different types of data in separate entities.

### Example: Task Management App

```javascript
// Store different data types separately
async function saveTask(taskData) {
  await pt.add('task', taskData);
}

async function saveUserPreferences(prefs) {
  if (userPrefsId) {
    await pt.edit(userPrefsId, prefs, true);
  } else {
    const saved = await pt.add('user_preferences', prefs);
    userPrefsId = saved.id;
  }
}

async function saveCurrentView(viewState) {
  if (viewStateId) {
    await pt.edit(viewStateId, viewState, true);
  } else {
    const saved = await pt.add('view_state', viewState);
    viewStateId = saved.id;
  }
}

// Load on init — each resource is independent, so a single failed
// query should not abort initialization; render with what loaded
async function initializeApp() {
  // Load preferences (pt.list returns a plain array by default)
  try {
    const prefs = await pt.list({
      entityNames: ['user_preferences'],
      limit: 1
    });
    if (prefs.length > 0) {
      userPrefsId = prefs[0].id;
      userPreferences = prefs[0].data;
    }
  } catch (error) {
    console.error('Failed to load preferences:', error);
  }

  // Load view state
  try {
    const views = await pt.list({
      entityNames: ['view_state'],
      limit: 1
    });
    if (views.length > 0) {
      viewStateId = views[0].id;
      viewState = views[0].data;
    }
  } catch (error) {
    console.error('Failed to load view state:', error);
  }

  // Load tasks
  try {
    tasks = await pt.list({
      entityNames: ['task'],
      limit: 100
    });
  } catch (error) {
    console.error('Failed to load tasks:', error);
    tasks = [];
  }

  renderApp();
}
```

---

## Pattern 3: Session-Based State

For apps with multiple sessions (like the 11+ writing app), use status fields to track progress.

```javascript
// Create a new session
async function startNewSession() {
  const session = await pt.add('writing_session', {
    started_at: new Date().toISOString(),
    status: 'in_progress',
    prompt: selectedPrompt,
    timer_duration: 30
  });

  currentSessionId = session.id;
  return session;
}

// Update session as user progresses
async function updateSession(updates) {
  if (currentSessionId) {
    await pt.edit(currentSessionId, updates, true);
  }
}

// Mark session complete
async function completeSession(results) {
  if (!currentSessionId) {
    throw new Error('No session in progress to complete');
  }
  await pt.edit(currentSessionId, {
    status: 'completed',
    completed_at: new Date().toISOString(),
    results: results
  }, true);
}

// Load in-progress session on init
async function loadInProgressSession() {
  const sessions = await pt.list({
    entityNames: ['writing_session'],
    filters: { status: 'in_progress' },
    limit: 1
  });

  if (sessions.length > 0) {
    currentSessionId = sessions[0].id;
    return sessions[0];
  }
  return null;
}
```

---

## Model Domain Data as Granular Entities

Use one `entity_name` for each domain concept and one entity for each independently editable object. For example, store each task as a `task` entity and each project as a `project` entity. This lets the ChatDB panel, AI tools, and real-time change events address individual records.

Do not put the entire application state into one large JSON entity. Also avoid creating "display-copy" entities that the app does not read; duplicated representations can silently drift apart. Singleton entities are still appropriate for genuinely singular values such as UI preferences, the current view, or a form draft.

## Initialize Demo Data Once

Keep demo or starter content in code only as seed input. Copy it into ChatDB during first-time initialization, then render and update only the ChatDB entities. Do not continue rendering from the seed constants, and do not overwrite existing data on reload.

```javascript
const SEED_VERSION = 'project-demo-v1';
const DEMO_DATA = {
  project: [
    { name: 'Website launch', status: 'active' }
  ],
  task: [
    { title: 'Review homepage', status: 'open' },
    { title: 'Publish release notes', status: 'open' }
  ]
};

async function ensureDemoData() {
  const markers = await pt.list({
    entityNames: ['app_seed'],
    filters: { version: SEED_VERSION },
    limit: 1
  });
  if (markers.length > 0) return;

  for (const [entityName, rows] of Object.entries(DEMO_DATA)) {
    // Avoid duplicates if an earlier initialization stopped partway through.
    const existing = await pt.list({
      entityNames: [entityName],
      limit: 1
    });

    if (existing.length === 0) {
      const results = await pt.batchAdd(entityName, rows);
      const failed = results.filter(result => !result.success);
      if (failed.length > 0) {
        throw new Error(`Failed to seed ${entityName}`);
      }
    }
  }

  // Add the marker only after every entity type is ready.
  await pt.add('app_seed', {
    version: SEED_VERSION,
    seeded_at: new Date().toISOString()
  });
}

async function initializeApp() {
  await ensureDemoData();

  // ChatDB is now the source of truth; do not render DEMO_DATA directly.
  const projects = await pt.list({ entityNames: ['project'] });
  const tasks = await pt.list({ entityNames: ['task'] });
  renderApp({ projects, tasks });
}
```

Only an explicit reset action should delete the application's rows and seed marker before running the initializer again. Never reset or re-seed data automatically during normal startup.

---

## Sharing Data Across Chats: DB Collections

A **DB Collection** is an entity store that lives outside any single chat. It is a collection of type `db`, and it holds entities (not documents). You attach it to every chat that needs it. Each chat's Live App and AI agent then read and write the **same records**, and changes reach all of those chats in real time.

```javascript
const cases = pt.db('support-cases');   // resolved on the first call

await cases.add('case', { title: 'Login fails on iOS', status: 'open' });
const open = await cases.list({ entityNames: ['case'], filters: { status: 'open' } });
```

The client and the targeting rules are documented in the [`pt.db()` reference](Data-Management-API.md#ptdbnameorid).

### How it differs from a document collection

A DB Collection shares the collection model with document collections. It has an id, a name, an owner and a group, and it is attached to chats in the same way. What it stores is different:

- **Entities, not files.** Upload, indexing and semantic search do not apply. `indexed` has no effect on it, and semantic search finds nothing in it.
- **It appears in collection listings.** `pt.listCollections()` returns every collection attached to the chat, DB Collections included. Check each entry's `type` (`"db"` for a DB Collection) if you only want document collections. To list only the DB Collections attached to the chat, together with their access mode, use `pt.action('db_list_collections', {})`.

### Lifecycle

**Create.** You create a DB Collection through the collections REST API with `type=db`:

```bash
curl -X POST "https://api.primethink.ai/api/v1/collections?name=support-cases&type=db" \
  -H "Authorization: Bearer $TOKEN"
```

Creating one needs the same permission as any collection: `create_private_collections`, plus `create_group_collections` to make it public to the group. The Collections page in the app does not offer a DB type yet.

**Attach.** You attach it to a chat like any other collection:

```bash
curl -X POST "https://api.primethink.ai/api/v1/chats/$CHAT_ID/collections/$COLLECTION_ID" \
  -H "Authorization: Bearer $TOKEN"
```

This needs `associate_collection_in_chat` or `manage_workspace_collections`, and you must be a member of the chat.

**Tasks.** A collection attached to a task is copied onto every chat launched from that task, and onto the chat again when the task is applied as an update. DB Collections are included. So attach a shared DB Collection to the task once, and every launched chat works on the same records. Links the chat already had keep their current status and access mode. The sync is best effort; a failure shows up as `collections_warning`.

**Disable, detach, delete.**

| Action | Effect on the chat | Effect on the data |
|--------|--------------------|--------------------|
| Set the chat link's status to `disabled` | The collection stops resolving in that chat, and the chat stops receiving its change events | None |
| Detach from the chat | Same as disabling, but the link is removed | None. Other chats keep reading and writing it |
| Delete the collection | It stops resolving everywhere | Treat the records as gone. Export anything you need first |

### Access modes

Each attachment has an `access_mode`, reported by `db_list_collections`:

- `read_write` lets the chat's app and agent read and write.
- `read_only` lets reads succeed and refuses every write, whether you targeted the collection by name or by id.

!!! note "Attachments are currently always read-write"
    The API has no endpoint that sets `access_mode`, so every attachment, including those copied from a task, is `read_write`. Read-only enforcement exists, but you cannot switch it on yourself yet. Until you can, do not rely on it to protect shared data. Keep write paths in the app that owns the data, and review consumer apps for writes.

### Real-time sync across chats

A write to a DB Collection emits a change event to **every chat the collection is attached to** with status `active`, not only the chat that wrote it. It does not matter whether the write came from a Live App, the REST API or the AI agent. `pt.onEntityChanged()` receives these events alongside the chat database's own events. This cross-chat delivery is what makes a shared store useful: the dashboard in chat B refreshes when the intake app in chat A adds a case.

Tell the two kinds of event apart with `collection_id`. Only DB Collection events carry it:

```javascript
const CASES_ID = 42;

pt.onEntityChanged((event) => {
  if (event.collection_id === CASES_ID) {
    refreshCases();            // a DB Collection change, possibly from another chat
  } else if (event.collection_id === undefined) {
    refreshLocalState();       // a change to this chat's own database
  }
});
```

DB Collection events also carry `collection_name`, `source_chat_uuid` (the chat the write came from) and `action`. The per-action id fields (`entity_id`, `inserted_entity_ids`, `updated_entity_ids`, `deleted_entity_ids`) are the same as for the chat database.

!!! warning "Entity ids are not unique across stores"
    Each store numbers its entities independently. The chat database and a DB Collection can each hold an entity `17`. So an `entityId`/`entityIds` filter on `pt.onEntityChanged()` can match the wrong store. Check `collection_id` as well.

### AI agent access

The agent's Chat DB tools (`chatdb_list`, `chatdb_get`, `chatdb_add`, `chatdb_edit`, `chatdb_delete`) take an optional `collection_name`. When it is set, the tool targets that DB Collection instead of the chat's own database. The Chat DB (Edit) capability therefore lets the agent write shared records, and Chat DB (Read Only) lets it read them. The collection must be attached to the chat, and writes need a read-write attachment.

Two limits to design around:

- The agent tools target a collection **by name only**. Give shared collections unique names within a chat.
- The agent is not told which DB Collections are attached. Name the collection, and the entity types it holds, in the task goal or the agent's instructions. Otherwise the agent writes to the chat's own database.

The fire-and-forget pattern works unchanged. Tell the agent to call `chatdb_edit` with `collection_name` set, and every attached chat receives the update event.

### What behaves the same as the chat database

- Pagination (`limit`/`offset`, `page`/`pageSize`) and `returnMetadata`
- `creator_user_id` on every entity. It is set on create and not changed by edits.
- Optimistic locking with `ifUnchangedSince`, and the `{ success, conflict, currentEntity }` result
- Per-item batch semantics: `batchAdd`, `batchEdit` and `batchDelete` report success or failure per item and are not transactional

!!! warning "Some filters behave differently on a DB Collection"
    A DB Collection has its own copy of the filter engine, and it does not yet have two fixes the chat database has:

    - **Boolean equality does not match.** `filters: { done: true }` finds nothing, because the value is compared as the text `True`. Store flags as strings (`'yes'`/`'no'`), or filter them in the app.
    - **Range operators are numeric only.** `$gt`, `$gte`, `$lt` and `$lte` cast the field to a number. A range on an ISO date string fails, and so does a range on a field where any row holds a non-numeric value. Store the timestamps you want to range over as epoch milliseconds.

    Equality on strings and numbers, `$in`, `$ne`, `$like`, `$ilike`, `$contains` and `$or` behave as they do on the chat database.

### Designing for shared data

Sharing data changes how you have to build. Before you choose a DB Collection, plan for the following.

- **The schema is a contract.** Every app attached to the collection reads the same entity types and fields. Adding a field is safe. Renaming or removing one breaks the other apps. Add fields instead of changing them, keep readers tolerant of missing fields, and give major changes a new entity type (`case_v2`) with a migration step.
- **Mistakes spread further.** A bug that deletes or corrupts records in one app does it for every app. Keep destructive operations in one owning app. Prefer `edit(..., true)` (merge) so that each app only touches its own fields, and use `ifUnchangedSince` where two apps edit the same records.
- **Decide who owns writes.** A good pattern is one owning app that writes and any number of consumer apps that only read. Until read-only attachments can be set (see [Access modes](#access-modes)), this is a code convention, not a platform guarantee.
- **Keep per-user and per-chat state in the chat database.** View state, selections, drafts and preferences written to a shared store land on everyone. Store only the shared domain records in the DB Collection, and keep the rest in `pt.*`.
- **Name collections and entity types deliberately.** Names are how apps, the agent and people find the data. A name that clashes with another attached collection makes name-based targeting ambiguous.
- **Everyone in an attached chat can use it.** Any member of an attached chat reaches the collection through that chat's app and agent. Attach a collection only to chats whose members should see all of it.

---

## What NOT to Store in Database

Some data should remain in memory only:

### Don't Store These

```javascript
// Runtime-only data
let timerInterval = null;        // Interval handles
let currentOperation = null;     // Cancellation tokens
let selectedFiles = [];          // File objects (can't serialize)
let domReferences = {};          // DOM element references
let callbacks = [];              // Function references
let webSockets = null;           // Connection objects
```

### Why?

- **Can't be serialized** - File objects, functions, DOM elements
- **Temporary/transient** - Interval handles, connection objects
- **Recreated on load** - Should be rebuilt from persisted data

---

## Performance Considerations

### Debounce Frequent Updates

Don't save on every keystroke - debounce updates:

```javascript
let saveTimeout = null;

function debouncedSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveState();
  }, 1000); // Save 1 second after last change
}

// Use in input handlers
function handleInputChange(value) {
  AppState.inputValue = value;
  debouncedSave(); // Debounced save
}
```

### Batch Updates

Group related changes into a single save:

```javascript
// Bad: Multiple saves
async function updateMultipleFields() {
  AppState.field1 = 'value1';
  await saveState();
  AppState.field2 = 'value2';
  await saveState();
  AppState.field3 = 'value3';
  await saveState();
}

// Good: Single save
async function updateMultipleFields() {
  AppState.field1 = 'value1';
  AppState.field2 = 'value2';
  AppState.field3 = 'value3';
  await saveState(); // Save once
}
```

### Use Optimistic Updates

Update UI immediately, save in background:

```javascript
async function toggleTask(taskId) {
  // Update UI immediately
  const task = tasks.find(t => t.id === taskId);
  task.completed = !task.completed;
  renderTasks();

  // Save in background (don't await)
  pt.edit(taskId, { completed: task.completed }, true)
    .catch(error => {
      console.error('Failed to save:', error);
      // Optionally revert UI on error
      task.completed = !task.completed;
      renderTasks();
    });
}
```

---

## Migration from localStorage

If you have an existing app using localStorage, migrate gradually:

### Step 1: Add Database Functions

```javascript
// Add new database functions alongside localStorage
async function saveStateToDb() {
  // ... database save logic
}

async function loadStateFromDb() {
  // ... database load logic
}
```

### Step 2: Migrate Existing Data

```javascript
async function migrateFromLocalStorage() {
  const oldState = localStorage.getItem('app_state');
  if (oldState) {
    try {
      // Idempotency check: another tab (or an earlier run) may have
      // migrated already — only create the entity if none exists yet
      const existing = await pt.list({
        entityNames: ['app_ui_state'],
        limit: 1
      });
      if (existing.length === 0) {
        const parsed = JSON.parse(oldState);
        await pt.add('app_ui_state', parsed);
        console.log('Migrated from localStorage to database');
      }
      localStorage.removeItem('app_state'); // Clean up only after success
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }
}

// Run on init
async function initializeApp() {
  await migrateFromLocalStorage();
  await loadStateFromDb();
  renderApp();
}
```

### Step 3: Remove localStorage

Once migration is complete, remove all localStorage code.

---

## Common Patterns Summary

| Use Case | Pattern | Entity Type |
|----------|---------|-------------|
| Simple UI state | Single entity | `app_ui_state` |
| User preferences | Single entity per user | `user_preferences` |
| Multiple sessions | Entity per session | `session`, `writing_session` |
| List of items | Entity per item | `task`, `note`, `item` |
| Current view/screen | Single entity | `view_state` |
| Form drafts | Single entity | `form_draft` |
| Records shared by several chats or apps | Entity per item in a [DB Collection](#sharing-data-across-chats-db-collections) | `case`, `ticket` |

---

## Complete Example: Todo App

```javascript
// State management for a todo app
const APP_STATE_ENTITY = 'todo_app_state';
let appStateId = null;

const AppState = {
  currentFilter: 'all', // 'all', 'active', 'completed'
  sortBy: 'created',
  viewMode: 'list'
};

// Save UI state
async function saveState() {
  try {
    if (appStateId) {
      await pt.edit(appStateId, AppState, true);
    } else {
      const saved = await pt.add(APP_STATE_ENTITY, AppState);
      appStateId = saved.id;
    }
  } catch (error) {
    console.error('Failed to save state:', error);
  }
}

// Load UI state
async function loadState() {
  try {
    const states = await pt.list({
      entityNames: [APP_STATE_ENTITY],
      limit: 1
    });

    if (states.length > 0) {
      appStateId = states[0].id;
      Object.assign(AppState, states[0].data);
    }
  } catch (error) {
    console.error('Failed to load state:', error);
  }
}

// Todo operations
async function addTodo(text) {
  const todo = await pt.add('todo', {
    text: text,
    completed: false,
    created_at: new Date().toISOString()
  });
  return todo;
}

async function toggleTodo(todoId) {
  const todo = await pt.get(todoId);
  // Merge mode: only send the toggled field, preserve everything else
  await pt.edit(todoId, {
    completed: !todo.data.completed
  }, true);
}

async function loadTodos() {
  // pt.list() returns a plain array by default
  return await pt.list({
    entityNames: ['todo'],
    limit: 100
  });
}

// Initialize
async function initializeApp() {
  await loadState();
  const todos = await loadTodos();
  renderApp(todos);
}

// Start app
document.addEventListener('DOMContentLoaded', initializeApp);
```

---

## Checklist for New Apps

When building a new PrimeThink Live App:

- [ ] **Never use localStorage** - Use chat database instead
- [ ] **Define entity types** - Choose meaningful names like `app_ui_state`, `task`, `session`
- [ ] **Track entity IDs** - Store IDs to update existing entities
- [ ] **Use merge mode** - `pt.edit(id, data, true)` to preserve fields
- [ ] **Await on init** - Always `await loadState()` before rendering
- [ ] **Handle errors** - Gracefully handle database failures
- [ ] **Debounce saves** - Don't save on every keystroke
- [ ] **Don't serialize functions** - Keep runtime-only data in memory
- [ ] **Test multi-window** - Open app in multiple tabs to verify state sync
- [ ] **Choose the store deliberately** - Chat database by default; a DB Collection only for records other chats must share, never for per-user state

---

## Summary

**Key Takeaway:** Always use the chat database (`pt.add`, `pt.edit`, `pt.list`) instead of localStorage for state persistence in PrimeThink Live Apps. This ensures your app works seamlessly across multiple windows, devices, and users.
